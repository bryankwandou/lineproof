// TxLINE client. Guest JWT plus activated API token, matching the documented
// auth flow on txline-dev. All reads are snapshots, so every scan is
// reproducible from the same feed state.
const TXLINE_BASE = process.env.TXLINE_BASE_URL || "https://txline-dev.txodds.com/api";
const TXLINE_KEY = process.env.TXLINE_API_KEY || "";
const TXLINE_HOST = TXLINE_BASE.replace(/\/api\/?$/, "");

let jwtCache = { token: null, at: 0 };
const JWT_TTL_MS = 24 * 60 * 60 * 1000;

async function guestJwt() {
  if (jwtCache.token && Date.now() - jwtCache.at < JWT_TTL_MS) return jwtCache.token;
  try {
    const r = await fetch(`${TXLINE_HOST}/auth/guest/start`, { method: "POST" });
    const body = await r.json();
    jwtCache = { token: body.token || "", at: Date.now() };
  } catch {
    jwtCache = { token: "", at: Date.now() };
  }
  return jwtCache.token;
}

async function txFetch(path) {
  const jwt = await guestJwt();
  const headers = { "Content-Type": "application/json" };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  if (TXLINE_KEY) headers["X-Api-Token"] = TXLINE_KEY;
  if (!jwt && TXLINE_KEY) headers["Authorization"] = `Bearer ${TXLINE_KEY}`;
  const res = await fetch(`${TXLINE_BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`TxLINE ${res.status}: ${path}`);
  return res.json();
}

async function fixturesSnapshot() {
  return txFetch("/fixtures/snapshot");
}

async function oddsSnapshot(fixtureId) {
  return txFetch(`/odds/snapshot/${fixtureId}`);
}

async function scoresSnapshot(fixtureId) {
  return txFetch(`/scores/snapshot/${fixtureId}`);
}

module.exports = { fixturesSnapshot, oddsSnapshot, scoresSnapshot, TXLINE_BASE };
