// Third-party verification, closed loop: pull the archived scan report from
// the public repo, recompute its canonical SHA-256, then find the matching
// memo the agent signed on Solana. If the recomputed digest equals the
// on-chain digest, the verdict history is provably untampered.
const { digest } = require("./_lib/engine");
const { recentAttestations } = require("./_lib/solana");

const ARCHIVE_BASE =
  process.env.ARCHIVE_BASE ||
  "https://raw.githubusercontent.com/bryankwandou/lineproof/main/history";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
  try {
    let scanId = (req.query && req.query.scanId) || "";
    const chain = await recentAttestations(50);
    const memos = chain.attestations.filter((a) => (a.memo || "").includes("lineproof:v1:"));

    // Default to the newest anchored scan whose report is already archived.
    // The very latest scan may not be committed yet (the archive job runs on a
    // schedule), so walk back through recent memos until one resolves.
    let archived = null;
    if (!scanId) {
      for (const a of memos) {
        const m = (a.memo || "").match(/lineproof:v1:(scan-\d+):/);
        if (!m) continue;
        const probe = await fetch(`${ARCHIVE_BASE}/${m[1]}.json`);
        if (probe.ok) { scanId = m[1]; archived = probe; break; }
      }
      if (!scanId) {
        return res.status(200).json({ ok: true, verified: false, reason: "no anchored scans with an archived report yet" });
      }
    } else {
      archived = await fetch(`${ARCHIVE_BASE}/${scanId}.json`);
      if (!archived.ok) {
        return res.status(200).json({
          ok: true, verified: false, scanId,
          reason: "not yet archived — the archive job commits on a 30-minute schedule; retry shortly or call /api/verify without a scanId for the newest verifiable scan",
        });
      }
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
