// Reader for the public scan archive the scheduler commits to the repo.
// The archive is LineProof's own accumulated dataset: even when the upstream
// feed prunes its tick history, cross-scan comparison keeps a growing,
// independently hosted record to audit against.
const ARCHIVE_BASE =
  process.env.ARCHIVE_BASE ||
  "https://raw.githubusercontent.com/bryankwandou/lineproof/main/history";

async function archiveIndex() {
  const r = await fetch(`${ARCHIVE_BASE}/index.json`, { cache: "no-store" });
  if (!r.ok) return [];
  return r.json();
}

async function archivedReport(scanId) {
  const r = await fetch(`${ARCHIVE_BASE}/${scanId}.json`);
  if (!r.ok) return null;
  return r.json();
}

// Pull the last `n` archived reports, newest first.
async function recentReports(n = 12) {
  const idx = await archiveIndex();
  const out = [];
  for (const row of idx.slice(0, n)) {
    const rep = await archivedReport(row.scanId).catch(() => null);
    if (rep) out.push(rep);
  }
  return out;
}

// Cross-scan drift: compare each fixture's fair line between consecutive
// archived scans and fire the same detector thresholds the live engine uses.
function crossScanEvents(reports) {
  // reports newest-first; walk oldest -> newest
  const chron = reports.slice().reverse();
  const byFixture = new Map();
  for (const rep of chron) {
    for (const a of rep.audits || []) {
      if (!byFixture.has(a.fixtureId)) byFixture.set(a.fixtureId, []);
      byFixture.get(a.fixtureId).push({ t: Date.parse(rep.generatedAt), a });
    }
  }
  const events = [];
  for (const [fixtureId, seq] of byFixture) {
    for (let i = 1; i < seq.length; i++) {
      const prev = seq[i - 1].a;
      const cur = seq[i].a;
      const dHome = (cur.fairProb?.[0] ?? 0) - (prev.fairProb?.[0] ?? 0);
      const dtMin = Math.max(1, (seq[i].t - seq[i - 1].t) / 60000);
      // 5+ probability points inside one scheduler window is a sharp move
      // for a pre-match consensus line; scale threshold with elapsed time.
      const threshold = 0.05 * Math.sqrt(dtMin / 15);
      if (Math.abs(dHome) > threshold) {
        events.push({
          code: "SCAN_DRIFT",
          ts: seq[i].t,
          fixtureId,
          fixture: `${cur.home} vs ${cur.away}`,
          competition: cur.competition,
          detail: `home win probability moved ${(dHome * 100).toFixed(2)} pts between scans (${Math.round(dtMin)} min apart)`,
          severity: Math.abs(dHome) > 2 * threshold ? "high" : "medium",
        });
      }
      const dVig = (prev.overround ?? 0) - (cur.overround ?? 0);
      if (dVig > 0.03) {
        events.push({
          code: "VIG_COLLAPSE",
          ts: seq[i].t,
          fixtureId,
          fixture: `${cur.home} vs ${cur.away}`,
          competition: cur.competition,
          detail: `margin fell ${(dVig * 100).toFixed(2)} pts between archived scans`,
          severity: "medium",
        });
      }
      if ((cur.overround ?? 0) < -0.001 && (prev.overround ?? 0) >= -0.001) {
        events.push({
          code: "ARB_WINDOW",
          ts: seq[i].t,
          fixtureId,
          fixture: `${cur.home} vs ${cur.away}`,
          competition: cur.competition,
          detail: `booksum crossed below 1 (${(1 + cur.overround).toFixed(4)}) between scans`,
          severity: "high",
        });
      }
    }
  }
  return events;
}

module.exports = { archiveIndex, archivedReport, recentReports, crossScanEvents, ARCHIVE_BASE };
