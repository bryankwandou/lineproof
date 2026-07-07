// One-time helper: mint the agent wallet and print env values.
const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");
const kp = Keypair.generate();
const encode = bs58.encode || (bs58.default && bs58.default.encode);
console.log("AGENT_PUBKEY=" + kp.publicKey.toBase58());
console.log("AGENT_SECRET_B58=" + encode(Buffer.from(kp.secretKey)));
