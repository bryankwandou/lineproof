// Agent tick endpoint. Called by the scheduler (GitHub Actions every 5 min,
// Vercel cron as fallback) — no human input in the loop. Each run audits the
// live feed and anchors the scan digest on Solana devnet.
const { runScan } = require("./_lib/scanner");
const { anchorScan } = require("./_lib/solana");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const { report, scanDigest } = await runScan();
    let anchor = { anchored: false, reason: "skipped" };
    const skipAnchor = req.query && req.query.dry === "1";
    if (!skipAnchor) {
      try {
        anchor = await anchorScan(scanDigest, {
          scanId: report.scanId,
          matches: report.matches,
          flagged: report.flagged,
        });
      } catch (e) {
        anchor = { anchored: false, reason: String(e.message || e) };
      }
    }
    res.status(200).json({ ok: true, scanDigest, anchor, report });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
