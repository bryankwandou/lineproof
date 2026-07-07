// B2B read endpoint: the current integrity report, recomputed from the live
// TxLINE snapshot. Deterministic — the digest here matches what the agent
// anchors when it scans the same feed state.
const { runScan } = require("./_lib/scanner");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  try {
    const { report, scanDigest } = await runScan();
    res.status(200).json({ ok: true, scanDigest, report });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
