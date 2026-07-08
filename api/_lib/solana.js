// Attestation writer. One memo transaction per scan carries the scan digest,
// so the whole report is anchored with a single signature and any single
// fixture can be proven against it by recomputing the canonical hash chain.
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");
const bs58 = require("bs58");

// Memo v1 — the current devnet genesis carries v1 but not v2.
const MEMO_PROGRAM = new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo");
const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

function agentKeypair() {
  const secret = process.env.AGENT_SECRET_B58 || "";
  if (!secret) return null;
  const decode = bs58.decode || (bs58.default && bs58.default.decode);
  return Keypair.fromSecretKey(decode(secret));
}

async function anchorScan(scanDigest, meta) {
  const kp = agentKeypair();
  if (!kp) return { anchored: false, reason: "agent wallet not configured" };
  const conn = new Connection(RPC, "confirmed");
  const memo = `lineproof:v1:${meta.scanId}:${scanDigest}:matches=${meta.matches}:flagged=${meta.flagged}`;
  const ix = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM,
    data: Buffer.from(memo, "utf8"),
  });
  const tx = new Transaction().add(ix);
  const sig = await conn.sendTransaction(tx, [kp]);
  return { anchored: true, signature: sig, memo, cluster: "devnet", agent: kp.publicKey.toBase58() };
}

async function recentAttestations(limit = 15) {
  const kp = agentKeypair();
  const pubkeyStr = process.env.AGENT_PUBKEY || (kp && kp.publicKey.toBase58());
  if (!pubkeyStr) return { agent: null, attestations: [] };
  const conn = new Connection(RPC, "confirmed");
  const sigs = await conn.getSignaturesForAddress(new PublicKey(pubkeyStr), { limit });
  return {
    agent: pubkeyStr,
    cluster: "devnet",
    attestations: sigs.map((s) => ({
      signature: s.signature,
      slot: s.slot,
      blockTime: s.blockTime,
      memo: s.memo,
      explorer: `https://explorer.solana.com/tx/${s.signature}?cluster=devnet`,
    })),
  };
}

module.exports = { anchorScan, recentAttestations };
