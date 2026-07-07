// LineProof integrity engine.
// Pure, deterministic functions: the same TxLINE snapshot always yields the
// same report and the same digest. That property is what makes the on-chain
// attestation meaningful — anyone can re-run the math and check the hash.
const crypto = require("crypto");

const MARKET_1X2 = "1X2_PARTICIPANT_RESULT";
const STALE_LIVE_MS = 10 * 60 * 1000;   // a live match without a fresh quote for 10 min is stale
const STALE_PRE_MS = 6 * 60 * 60 * 1000;
const LIVE_WINDOW_MS = 2.5 * 60 * 60 * 1000;
const Z_FLAG = 3.0;                      // tick-move z-score above this is a sharp-move anomaly
const OVERROUND_COLLAPSE = 0.03;         // vig dropping 3 points in one tick is suspicious

function impliedProbs(prices) {
  // prices arrive in milliunits; decimal odds = price / 1000
  const dec = prices.map((p) => p / 1000);
  if (dec.some((d) => !isFinite(d) || d <= 1.0)) return null;
  const raw = dec.map((d) => 1 / d);
  const book = raw.reduce((a, b) => a + b, 0);
  return {
    decimal: dec.map((d) => Math.round(d * 100) / 100),
    raw,
    overround: book - 1,
    fair: raw.map((p) => p / book),
  };
}

function ticksFor(oddsRecords) {
  // full-match 1X2 ticks, oldest first
  const rows = (oddsRecords || [])
    .filter((r) => r.SuperOddsType === MARKET_1X2 && r.MarketPeriod === null)
    .sort((a, b) => a.Ts - b.Ts);
  if (rows.length > 0) return rows;
  return (oddsRecords || [])
    .filter((r) => r.SuperOddsType === MARKET_1X2)
    .sort((a, b) => a.Ts - b.Ts);
}

function matchStatus(startMs, scoreUpdates, nowMs) {
  const last = (scoreUpdates || [])[Math.max(0, (scoreUpdates || []).length - 1)];
  if (last && last.Clock && last.Clock.Running && (last.Clock.Seconds || 0) > 0) return "live";
  if (nowMs < startMs) return "pre";
  if (nowMs < startMs + LIVE_WINDOW_MS) return "live";
  return "ft";
}

function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function std(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) * (x - m), 0) / (xs.length - 1));
}

// Audit one fixture. Returns null when the feed carries no priced 1X2 market.
function auditFixture(fixture, oddsRecords, scoreUpdates, nowMs) {
  const ticks = ticksFor(oddsRecords);
  if (ticks.length === 0) return null;

  const latest = ticks[ticks.length - 1];
  const probs = impliedProbs(latest.Prices || []);
  if (!probs) return null;

  const status = matchStatus(fixture.StartTime, scoreUpdates, nowMs);
  const anomalies = [];
  let score = 100;

  // 1. Staleness — a quote that stopped updating while the match runs.
  const quoteAge = nowMs - latest.Ts;
  const staleLimit = status === "live" ? STALE_LIVE_MS : STALE_PRE_MS;
  if (quoteAge > staleLimit && status !== "ft") {
    anomalies.push({
      code: "STALE_QUOTE",
      detail: `last 1X2 tick is ${Math.round(quoteAge / 60000)} min old while match is ${status}`,
      severity: status === "live" ? "high" : "medium",
    });
    score -= status === "live" ? 30 : 12;
  }

  // 2. Negative overround — the book prices sum below 1, a pure arbitrage window.
  if (probs.overround < -0.001) {
    anomalies.push({
      code: "ARB_WINDOW",
      detail: `implied probabilities sum to ${(1 + probs.overround).toFixed(4)} — riskless surface on the consensus line`,
      severity: "high",
    });
    score -= 35;
  }

  // 3. Sharp movement — z-score of the latest home-probability change against
  //    the fixture's own tick history. Deterministic: history comes from the snapshot.
  let moveZ = 0;
  if (ticks.length >= 4) {
    const homeProbs = ticks
      .map((t) => impliedProbs(t.Prices || []))
      .filter(Boolean)
      .map((p) => p.fair[0]);
    const deltas = [];
    for (let i = 1; i < homeProbs.length; i++) deltas.push(homeProbs[i] - homeProbs[i - 1]);
    const lastDelta = deltas[deltas.length - 1];
    const sigma = std(deltas.slice(0, -1));
    if (sigma > 1e-6) {
      moveZ = Math.abs(lastDelta - mean(deltas.slice(0, -1))) / sigma;
      if (moveZ > Z_FLAG) {
        anomalies.push({
          code: "SHARP_MOVE",
          detail: `latest tick moved home probability ${(lastDelta * 100).toFixed(2)} pts, z=${moveZ.toFixed(2)} against own history`,
          severity: moveZ > 5 ? "high" : "medium",
        });
        score -= Math.min(25, Math.round(moveZ * 4));
      }
    }
  }

  // 4. Overround collapse — margin vanishing tick-to-tick hints at a feed or pricing fault.
  if (ticks.length >= 2) {
    const prev = impliedProbs(ticks[ticks.length - 2].Prices || []);
    if (prev && prev.overround - probs.overround > OVERROUND_COLLAPSE) {
      anomalies.push({
        code: "VIG_COLLAPSE",
        detail: `margin fell from ${(prev.overround * 100).toFixed(2)}% to ${(probs.overround * 100).toFixed(2)}% in one tick`,
        severity: "medium",
      });
      score -= 15;
    }
  }

  score = Math.max(0, Math.min(100, score));
  const home = fixture.Participant1IsHome ? fixture.Participant1 : fixture.Participant2;
  const away = fixture.Participant1IsHome ? fixture.Participant2 : fixture.Participant1;

  // Feed order is [part1, draw, part2]; reorder to home/draw/away.
  const order = fixture.Participant1IsHome ? [0, 1, 2] : [2, 1, 0];
  const pick = (xs) => order.map((i) => xs[i]);

  return {
    fixtureId: fixture.FixtureId,
    competition: fixture.Competition,
    home,
    away,
    status,
    kickoff: fixture.StartTime,
    quoted: pick(probs.decimal),
    fairProb: pick(probs.fair).map((p) => Math.round(p * 10000) / 10000),
    fairLine: pick(probs.fair).map((p) => Math.round((1 / p) * 100) / 100),
    overround: Math.round(probs.overround * 10000) / 10000,
    ticks: ticks.length,
    lastTickTs: latest.Ts,
    moveZ: Math.round(moveZ * 100) / 100,
    integrity: score,
    verdict: score >= 85 ? "CLEAN" : score >= 60 ? "WATCH" : "FLAGGED",
    anomalies,
  };
}

// Canonical digest of a report — sorted keys, no whitespace — so any third
// party can recompute it and compare against the on-chain attestation.
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(report) {
  return crypto.createHash("sha256").update(canonical(report)).digest("hex");
}

module.exports = { auditFixture, digest, canonical };
