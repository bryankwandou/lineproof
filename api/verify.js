// Third-party verification, closed loop: pull the archived scan report from
// the public repo, recompute its canonical SHA-256, then find the matching
// memo the agent signed on Solana. If the recomputed digest equals the
// on-chain digest, the verdict history is provably untampered.
const { digest } = require("./_lib/engine");
const { recentAttestations } = require("./_lib/solana");

const ARCHIVE_BASE =
  process.env.ARCHIVE_BASE ||
  "https://raw.githubusercontent.com/nayrbryanGaming/lineproof/main/history";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
  try {
    let scanId = (req.query && req.query.scanId) || "";
    const chain = await recentAttestations(50);
    const memos = chain.attestations.filter((a) => (a.memo || "").includes("lineproof:v1:"));

    // Default to the newest anchored scan that has an archived report.
    if (!scanId) {
      for (const a of memos) {
        const m = (a.memo || "").match(/lineproof:v1:(scan-\d+):/);
        if (m) { scanId = m[1]; break; }
      }
    }
    if (!scanId) {
      return res.status(200).json({ ok: true, verified: false, reason: "no anchored scans found yet" });
    }

    const archived = await fetch(`${ARCHIVE_BASE}/${scanId}.json`);
    if (!archived.ok) {
      return res.status(200).json({
        ok: true, verified: false, scanId,
        reason: "no archived report for this scan id (archive commits run on the scheduler)",
      });
    }
    const report = await archived.json();
    const recomputed = digest(report);

    const match = memos.find((a) => (a.memo || "").includes(scanId));
    if (!match) {
      return res.status(200).json({ ok: true, verified: false, scanId, recomputed, reason: "no on-chain memo found for this scan id in recent signatures" });
    }
    const onchain = ((match.memo || "").match(/lineproof:v1:scan-\d+:([0-9a-f]{64})/) || [])[1] || "";

    res.status(200).json({
      ok: true,
      verified: recomputed === onchain,
      scanId,
      recomputedDigest: recomputed,
      onchainDigest: onchain,
      signature: match.signature,
      explorer: match.explorer,
      archivedReport: `${ARCHIVE_BASE}/${scanId}.json`,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
