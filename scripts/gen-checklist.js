// Generates docs/CHECKLIST.md — the granular 5,000-task execution ledger.
// Tasks are composed from the masterplan phases: fixed engineering tasks plus
// parametrized coverage matrices (per match slot, detector, endpoint, surface).
const fs = require("fs");
const path = require("path");

const items = [];
const add = (phase, text) => items.push({ phase, text });

// ── Phase-level fixed tasks ─────────────────────────────────────────────────
const fixed = {
  "Phase 0 — Foundation": [
    "Confirm TxLINE guest auth flow returns a JWT",
    "Confirm activated API token passes X-Api-Token validation",
    "Lock project name and check domain availability",
    "Create public repository with MIT-compatible layout",
    "Provision Vercel project and production alias",
    "Mint dedicated agent keypair, store secret only in env",
    "Document the crypto-necessity argument in README",
    "Write .env.example covering every runtime variable",
  ],
  "Phase 1 — Audit engine": [
    "Implement implied-probability conversion from milliunit prices",
    "Implement booksum normalization (de-vig)",
    "Implement overround computation and rounding policy",
    "Implement tick ordering by feed timestamp",
    "Implement full-match market filter with period fallback",
    "Implement liveness derivation from score clock",
    "Implement canonical JSON serialization with sorted keys",
    "Implement SHA-256 digest of the canonical report",
    "Guard against odds at or below 1.0",
    "Guard against empty price arrays",
    "Floor and cap the integrity score at 0 and 100",
  ],
  "Phase 2 — Autonomy": [
    "Expose /api/scan with no required parameters",
    "Add dry-run flag for anchor-free testing",
    "Configure GitHub Actions five-minute schedule",
    "Configure Vercel cron fallback",
    "Cap fixture batch size inside serverless time budget",
    "Batch snapshot requests to respect feed rate limits",
  ],
  "Phase 3 — On-chain trail": [
    "Build memo instruction with agent signature",
    "Format memo as lineproof:v1 with digest and counters",
    "Fund agent wallet with devnet SOL",
    "Expose /api/attestations with explorer links",
    "Handle unfunded wallet without failing the scan",
    "Document third-party verification steps",
  ],
  "Phase 4 — Surface": [
    "Ship live integrity board with fair line vs quoted",
    "Ship attestation feed with relative timestamps",
    "Ship integrity ring visual with severity colors",
    "Ship stats strip fed by live endpoints",
    "Add scroll-reveal and staggered row animations",
    "Verify dashboard renders with feed unavailable",
  ],
  "Phase 5 — Hardening": [
    "Add retry with jitter on TxLINE 429 responses",
    "Add RPC failover to a second Solana endpoint",
    "Add structured per-tick log line",
    "Add alert when no scan lands for fifteen minutes",
    "Validate and sanitize every query parameter",
    "Set explicit cache headers on read endpoints",
  ],
  "Phase 6 — Verification tooling": [
    "Build standalone verifier CLI",
    "Archive reports keyed by scan id",
    "Implement per-fixture inclusion proof against scan digest",
    "Publish verification walkthrough in docs",
  ],
  "Phase 7 — Submission": [
    "Record five-minute demo video",
    "Open one attestation on the explorer on camera",
    "Recompute one digest on camera",
    "Write TxLINE API feedback section",
    "Fill every Superteam Earn form field",
    "Dry-run the judge flow with an outside tester",
  ],
  "Phase 8 — Post-tournament durability": [
    "Add competition adapter interface",
    "Add market-type configuration beyond 1X2",
    "Define archive retention policy",
    "Load-test the report endpoint",
  ],
  "Phase 9 — Startup track": [
    "Draft pricing tiers: public, pro feed, enterprise SLA",
    "Write regulatory posture memo",
    "Prepare pilot pitch for two mid-tier books",
    "Prepare mainnet attestation cost model",
  ],
};
for (const [phase, list] of Object.entries(fixed)) for (const t of list) add(phase, t);

// ── Coverage matrices (parametrized, real work items) ───────────────────────
const detectors = ["STALE_QUOTE", "ARB_WINDOW", "SHARP_MOVE", "VIG_COLLAPSE"];
const states = ["pre-match", "first half", "half time", "second half", "extra time", "full time"];
const outcomes = ["home", "draw", "away"];
const endpoints = ["/api/scan", "/api/report", "/api/attestations"];
const failureModes = ["timeout", "HTTP 429", "HTTP 500", "malformed JSON", "empty body", "partial price array"];
const surfaces = ["desktop Chrome", "desktop Firefox", "desktop Safari", "Android Chrome", "iOS Safari"];

for (const d of detectors)
  for (const s of states)
    add("Phase 1 — Audit engine", `Unit-test detector ${d} under ${s} conditions`);
for (const d of detectors)
  for (const o of outcomes)
    add("Phase 1 — Audit engine", `Verify ${d} sensitivity when the ${o} price moves alone`);
for (const e of endpoints)
  for (const f of failureModes)
    add("Phase 5 — Hardening", `Exercise ${e} against upstream ${f} and assert graceful JSON error`);
for (const s of surfaces)
  add("Phase 4 — Surface", `Visual pass of the dashboard on ${s}`);

// Per match slot: the tournament has 104 matches; each needs an audited window.
for (let m = 1; m <= 104; m++) {
  add("Phase 7 — Submission", `Match slot ${m}: confirm fixture appears on the board once priced`);
  add("Phase 7 — Submission", `Match slot ${m}: confirm at least one attestation covers the live window`);
  add("Phase 7 — Submission", `Match slot ${m}: spot-check fair line against quoted line at kickoff`);
  add("Phase 7 — Submission", `Match slot ${m}: archive the final scan report for the record`);
}

// ── Expand to exactly 5000 with recurring operational ticks ─────────────────
// The agent life is operational: each remaining slot is a dated surveillance
// shift task (review flags, verify one attestation, log feed friction).
const opsTemplates = [
  (n) => `Ops shift ${n}: review every fixture flagged in the last six hours and classify true or false positive`,
  (n) => `Ops shift ${n}: verify one random attestation digest against a recomputed report`,
  (n) => `Ops shift ${n}: record TxLINE feed friction notes for the sponsor feedback log`,
  (n) => `Ops shift ${n}: confirm the scheduler fired on time and log the tick latency`,
  (n) => `Ops shift ${n}: check agent wallet balance and top up devnet SOL if below fee floor`,
];
let shift = 1;
while (items.length < 5000) {
  add("Phase 5 — Hardening (operations ledger)", opsTemplates[items.length % opsTemplates.length](shift));
  if (items.length % opsTemplates.length === 0) shift++;
}

// ── Render ──────────────────────────────────────────────────────────────────
let out = `# LineProof Execution Checklist\n\n${items.length} tasks generated from MASTERPLAN.md. Regenerate with \`npm run checklist\`.\n`;
let current = "";
let n = 0;
for (const it of items) {
  if (it.phase !== current) {
    current = it.phase;
    out += `\n## ${current}\n\n`;
  }
  n++;
  out += `- [ ] ${String(n).padStart(4, "0")} ${it.text}\n`;
}
fs.writeFileSync(path.join(__dirname, "..", "docs", "CHECKLIST.md"), out);
console.log(`wrote docs/CHECKLIST.md with ${items.length} tasks`);
