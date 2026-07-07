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

## Why Solana

The verdicts only matter if they cannot be edited after the fact. Each scan produces a canonical digest that the agent wallet writes into a Solana memo transaction on devnet. Anyone can pull `/api/report`, recompute the hash with the documented canonicalization, and compare it against the memo on the explorer. Disputes settle against the chain, not against our database.

## Architecture

```
TxLINE snapshots ──> scanner (pure audit engine) ──> JSON report + SHA-256 digest
                                                          │
              GitHub Actions cron (5 min) ──> /api/scan ──┴──> Solana memo attestation
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
