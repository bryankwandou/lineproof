# LineProof — Technical Documentation

## Core idea

A production-grade surveillance layer for sports betting markets. The agent continuously audits the TxLINE consensus feed for the 2026 World Cup, computes a margin-free fair line per fixture, scores market integrity with four deterministic detectors, and anchors a canonical digest of each scan on Solana so the audit trail is tamper-evident.

## Business highlights

- Buyer: sportsbook risk teams, prediction-market settlement layers, market-data resellers, and integrity bodies. All of them currently rely on internal logs they could edit themselves.
- Wedge: sold as a read-only JSON feed plus the on-chain trail — zero integration risk for the customer.
- Moat over time: the longer the agent runs, the more valuable the immutable history becomes; it cannot be backfilled by a latecomer.

## Positioning against the feed's own anchoring

TxLINE already anchors feed updates on Solana — that proves *what the odds were*. LineProof proves *what the audit concluded about them*. The two are complementary layers: data provenance (theirs) and judgment provenance (ours). A dispute needs both: the anchored price and the anchored verdict that the price was, or was not, healthy at that moment.

## Determinism contract

1. `canonical(report)` serializes with sorted keys and no whitespace.
2. `digest = sha256(canonical(report))`.
3. The agent writes `lineproof:v1:<scanId>:<digest>:matches=<n>:flagged=<m>` as a Solana memo, signed by the agent wallet.
4. The scheduler commits the exact hashed report to `history/<scanId>.json` in the public repo.
5. `GET /api/verify?scanId=...` re-derives the digest from the archive and compares it to the on-chain memo. Anyone can repeat this offline: fetch the archived JSON, canonicalize, hash, read the memo on the explorer.

## Forensic replay

`GET /api/replay` re-runs the detectors over each fixture's full tick history with no look-ahead (movement z-scores use only prior deltas). Output: a chronological timeline of every SHARP_MOVE, ARB_WINDOW and VIG_COLLAPSE that occurred in the recorded data — the agent's tournament track record.

## Detector specification

| Detector | Trigger | Notes |
|---|---|---|
| STALE_QUOTE | last 1X2 tick older than 10 min while status is live (6 h pre-match) | liveness derived from score-clock updates |
| ARB_WINDOW | booksum < 0.999 | negative margin on the consensus line |
| SHARP_MOVE | z > 3 for the latest home-probability delta vs the fixture's own delta history (needs 4+ ticks) | sample standard deviation, no look-ahead |
| VIG_COLLAPSE | overround drop > 3 pts tick-to-tick | catches feed faults and pricing errors |

Integrity = 100 minus the summed deductions, floored at 0. Verdicts: CLEAN (85+), WATCH (60–84), FLAGGED (<60).

## TxLINE endpoints used

- `POST {host}/auth/guest/start`
- `GET /api/fixtures/snapshot`
- `GET /api/odds/snapshot/{fixtureId}` (SuperOddsType `1X2_PARTICIPANT_RESULT`, prices in milliunits)
- `GET /api/scores/snapshot/{fixtureId}`

## Autonomy

- Primary scheduler: GitHub Actions cron every 15 minutes hitting `/api/scan`.
- Archive job: a second GitHub Actions cron every 30 minutes commits each anchored report to `history/` in this repo, which is what `/api/verify` recomputes against.
- Fallback: Vercel cron once daily (12:00 UTC).
- The scan endpoint takes no parameters and needs no operator; a `?dry=1` flag exists purely for cost-free testing.

## Limits and choices

- Devnet memos keep attestation cost at zero for the tournament; the writer is cluster-agnostic and moves to mainnet by changing one RPC URL.
- One memo per scan (not per fixture) keeps fees flat; per-fixture proofs verify against the scan digest through the canonical serialization.
- Serverless functions stay stateless: every response is recomputed from feed snapshots, so a cold start cannot serve stale internal state.
