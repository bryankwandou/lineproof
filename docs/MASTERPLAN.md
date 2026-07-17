# LineProof Masterplan — 0 to MVP to Startup

Ten phases. Each phase has a hard exit gate. The granular ledger (5,000 numbered tasks generated from this plan) lives in `CHECKLIST.md`; regenerate it any time with `npm run checklist`.

## Phase 0 — Foundation (done)
Idea locked through the crypto-necessity test: attestations require a neutral, append-only ledger; a database owned by the auditor fails the neutrality requirement. Name, repo, deployment target chosen.
Gate: live TxLINE read verified with real fixtures.

## Phase 1 — Audit engine (done)
Pure detectors: de-vig, staleness, sharp-move z-score, vig collapse. Canonical serialization and SHA-256 digest.
Gate: same snapshot in, byte-identical report out.

## Phase 2 — Autonomy (done)
`/api/scan` tick endpoint, GitHub Actions 15-minute scheduler, Vercel cron fallback, zero manual input.
Gate: two consecutive unattended scans visible in logs.

## Phase 3 — On-chain trail (done, pending wallet funding)
Memo attestations from a dedicated agent keypair on devnet; `/api/attestations` reads the trail back with explorer links.
Gate: a third party can match a report digest to a memo without our help.

## Phase 4 — Surface (done)
Public dashboard: live integrity board, fair line vs quoted, attestation feed, API documentation on the page itself.
Gate: judge can understand the product in under sixty seconds without narration.

## Phase 5 — Hardening
Rate-limit handling and retry with jitter on TxLINE reads; RPC failover across two Solana endpoints; alerting when scans stop landing; structured logs per tick; input validation on every handler.
Gate: 48 hours of unattended operation without a missed window.

## Phase 6 — Verification tooling
Standalone verifier CLI that re-derives a digest from a stored report and checks it against the chain; historical report archive keyed by scan id; per-fixture inclusion proofs.
Gate: verifier confirms a week of attestations end to end.

## Phase 7 — Submission (deadline 19 Jul 2026)
Five-minute demo video: the problem, the live board during a real match window, one attestation opened on the explorer, one digest recomputed on camera. Feedback writeup on the TxLINE API. All Superteam Earn form fields filled.
Gate: someone outside the team follows the video and verifies one attestation themselves.

## Phase 8 — Post-tournament durability
Generalize beyond the World Cup feed: adapters for additional TxLINE competitions, configurable market types beyond 1X2, retention policy for the archive.
Gate: a second competition audited with zero code changes to the engine.

## Phase 9 — Startup track
Pricing: free public trail, paid low-latency feed and webhooks, enterprise SLA with mainnet attestations. Pilot targets: two mid-tier books and one prediction-market settlement team. Regulatory posture memo (surveillance tool, not a gambling operator).
Gate: one signed pilot.
