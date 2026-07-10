// Operational heartbeat — what a production operator (or a judge) checks
// first: is the feed reachable, is the wallet funded, when did the agent
// last anchor, how deep is the public archive.
const { fixturesSnapshot } = require("./_lib/txline");
const { recentAttestations } = require("./_lib/solana");
const { archiveIndex } = require("./_lib/archive");
const { Connection, PublicKey } = require("@solana/web3.js");

const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  const out = { ok: true, at: new Date().toISOString() };
  try {
    const t0 = Date.now();
    const fixtures = await fixturesSnapshot();
    out.feed = { up: true, fixtures: fixtures.length, latencyMs: Date.now() - t0 };
  } catch (e) {
    out.feed = { up: false, error: String(e.message || e) };
  }
  try {
    const pubkey = process.env.AGENT_PUBKEY;
    const conn = new Connection(RPC, "confirmed");
    const bal = await conn.getBalance(new PublicKey(pubkey));
    const chain = await recentAttestations(1);
    out.agent = {
      wallet: pubkey,
      lamports: bal,
      solRemaining: bal / 1e9,
      feeBudgetScans: Math.floor(bal / 5000),
      lastAttestation: chain.attestations[0]
        ? { signature: chain.attestations[0].signature, blockTime: chain.attestations[0].blockTime }
        : null,
    };
  } catch (e) {
    out.agent = { error: String(e.message || e) };
  }
  try {
    const idx = await archiveIndex();
    out.archive = {
      scans: idx.length,
      anchored: idx.filter((r) => r.anchored).length,
      latest: idx[0] || null,
    };
  } catch (e) {
    out.archive = { error: String(e.message || e) };
  }
  res.status(200).json(out);
};
