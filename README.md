# LineProof

An autonomous market-surveillance agent for World Cup betting lines. It reads the TxLINE consensus feed, strips the bookmaker margin to recover the fair line, hunts for anomalies a risk desk would care about, and notarizes a cryptographic digest of every verdict on Solana. Nobody — including the operator — can quietly rewrite the audit trail afterward.

Most hackathon agents trade the odds. LineProof audits the market itself. Sportsbooks, settlement layers and regulators all need an answer to the same question: was this line healthy at the moment it mattered? LineProof gives that answer a signature and a slot number.

## What it detects

| Code | Meaning | Deduction |
|---|---|---|
| `STALE_QUOTE` | A live match whose 1X2 price stopped updating | up to 30 |
| `ARB_WINDOW` | Implied probabilities sum below 1 — a riskless surface on the consensus line | 35 |
| `SHARP_MOVE` | Latest tick moved the home probability beyond 3 sigma of the fixture's own history | up to 25 |
| `VIG_COLLAPSE` | Bookmaker margin fell more than 3 points in a single tick | 15 |

Every fixture starts at 100. The remaining score is its integrity rating; below 85 is `WATCH`, below 60 is `FLAGGED`.

## Why the math is defensible

- De-vigging: implied probabilities `1/odds` are normalized by the booksum, giving the margin-free fair line. Standard practice on every trading desk.
- Movement detection compares a tick only against the same fixture's own tick history (mean and sample deviation of probability deltas), so quiet friendlies and volatile knockouts are judged on their own baseline.
- The whole pipeline is pure: the same TxLINE snapshot always yields byte-identical output and the same SHA-256 digest. That determinism is what makes the on-chain attestation checkable by a third party.

## Why Solana — and why this isn't what TxLINE already does

TxLINE anchors its *data* on Solana: the feed can prove what the odds were at any moment. What nothing proves is whether those odds were *healthy* — that judgment lives in private risk-desk logs the operator can edit. LineProof anchors the *judgment*: the audit verdict on top of the anchored data.

The loop is fully closed. Each scan produces a canonical digest; the agent wallet writes it into a Solana memo on devnet; the scheduler commits the exact report that was hashed into the public `history/` folder of this repo. `GET /api/verify` re-derives the digest from the archived report and compares it to the on-chain memo live — and you can do the same by hand without trusting this deployment. Disputes settle against the chain, not against our database.

## Forensic replay

`GET /api/replay` walks the full recorded tick history of every fixture — using only information available at each moment, no look-ahead — and returns every anomaly the detectors would have fired on across the tournament. This is the agent's public track record, derived entirely from real TxLINE data.

## Architecture

```
TxLINE snapshots ──> scanner (pure audit engine) ──> JSON report + SHA-256 digest
                                                          │
              GitHub Actions cron (15 min) ──> /api/scan ──┴──> Solana memo attestation
                                                                (agent keypair, devnet)
```

- `api/_lib/engine.js` — deterministic integrity math (de-vig, staleness, z-score, margin checks)
- `api/_lib/scanner.js` — one agent tick over the prioritized fixture set
- `api/_lib/solana.js` — attestation writer and on-chain history reader
- `api/scan.js` — the autonomous tick endpoint (scheduler-driven, no human input)
- `api/report.js` — public B2B integrity feed
- `api/attestations.js` — on-chain audit trail with explorer links
- `public/index.html` — live dashboard

## TxLINE endpoints used

- `POST /auth/guest/start` — session token
- `GET /api/fixtures/snapshot` — the fixture universe
- `GET /api/odds/snapshot/{fixtureId}` — full 1X2 price history per fixture
- `GET /api/scores/snapshot/{fixtureId}` — score and clock state for liveness

## Run it

```bash
npm install
TXLINE_API_KEY=... node scripts/local-tick.js     # one audit pass in the terminal
```

Deploy on Vercel with the variables from `.env.example`. `scripts/gen-wallet.js` mints the agent keypair; fund it with devnet SOL and attestations start flowing on the next tick.

## Roadmap

The full 0-to-MVP execution plan lives in [docs/MASTERPLAN.md](docs/MASTERPLAN.md) with the granular task ledger in [docs/CHECKLIST.md](docs/CHECKLIST.md). Technical details in [docs/TECHNICAL.md](docs/TECHNICAL.md).
