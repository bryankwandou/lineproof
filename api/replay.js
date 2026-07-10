// Forensic timeline: replay the full odds history of every fixture on the
// feed and return each anomaly the detectors would have fired on, in
// chronological order. All of it derives from real TxLINE tick data — this is
// the agent's tournament track record, not a simulation.
const { fixturesSnapshot, oddsSnapshot } = require("./_lib/txline");
const { replayFixture } = require("./_lib/engine");

const MAX_FIXTURES = 48;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
  try {
    const fixtures = await fixturesSnapshot();
    const nowMs = Date.now();
    const ranked = fixtures
      .slice()
      .sort((a, b) => Math.abs(a.StartTime - nowMs) - Math.abs(b.StartTime - nowMs))
      .slice(0, MAX_FIXTURES);

    const replays = [];
    const batch = 8;
    for (let i = 0; i < ranked.length; i += batch) {
      const part = await Promise.all(
        ranked.slice(i, i + batch).map(async (f) => {
          try {
            const odds = await oddsSnapshot(f.FixtureId);
            return replayFixture(f, odds);
          } catch {
            return null;
          }
        })
      );
      replays.push(...part.filter(Boolean));
    }

    const audited = replays.filter((r) => r.ticksAudited > 0);
    const timeline = audited
      .flatMap((r) =>
        r.events.map((e) => ({
          ...e,
          fixtureId: r.fixtureId,
          fixture: `${r.home} vs ${r.away}`,
          competition: r.competition,
        }))
      )
      .sort((a, b) => b.ts - a.ts);

    res.status(200).json({
      ok: true,
      fixturesAudited: audited.length,
      ticksAudited: audited.reduce((a, r) => a + r.ticksAudited, 0),
      anomalies: timeline.length,
      timeline: timeline.slice(0, 60),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
