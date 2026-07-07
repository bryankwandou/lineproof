// One agent tick: pull TxLINE snapshots, audit every priced fixture, build
// the scan report, and hand back a canonical digest ready for anchoring.
const { fixturesSnapshot, oddsSnapshot, scoresSnapshot } = require("./txline");
const { auditFixture, digest } = require("./engine");

const MAX_FIXTURES = 64; // stay well inside serverless time budget

async function runScan() {
  const nowMs = Date.now();
  const fixtures = await fixturesSnapshot();

  // Prioritize what matters: live or soon-to-start fixtures first.
  const ranked = fixtures
    .slice()
    .sort((a, b) => Math.abs(a.StartTime - nowMs) - Math.abs(b.StartTime - nowMs))
    .slice(0, MAX_FIXTURES);

  const audits = [];
  const batch = 8;
  for (let i = 0; i < ranked.length; i += batch) {
    const part = await Promise.all(
      ranked.slice(i, i + batch).map(async (f) => {
        try {
          const [odds, scores] = await Promise.all([
            oddsSnapshot(f.FixtureId).catch(() => []),
            scoresSnapshot(f.FixtureId).catch(() => []),
          ]);
          return auditFixture(f, odds, scores, nowMs);
        } catch {
          return null;
        }
      })
    );
    audits.push(...part.filter(Boolean));
  }

  audits.sort((a, b) => a.integrity - b.integrity);
  const flagged = audits.filter((a) => a.verdict !== "CLEAN").length;

  const report = {
    scanId: `scan-${nowMs}`,
    generatedAt: new Date(nowMs).toISOString(),
    source: "txline-dev",
    market: "1X2 full match",
    matches: audits.length,
    flagged,
    audits,
  };
  return { report, scanDigest: digest(report) };
}

module.exports = { runScan };
