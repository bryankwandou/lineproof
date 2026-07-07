// Public audit trail: every attestation the agent has written on devnet,
// with explorer links so a third party can inspect the memo contents.
const { recentAttestations } = require("./_lib/solana");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=40");
  try {
    const data = await recentAttestations(20);
    res.status(200).json({ ok: true, ...data });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
