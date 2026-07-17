# LineProof — Superteam Earn Submission (copy-paste ready)

**Track:** TxODDS World Cup — Trading Tools and Agents
**Deadline:** 19 July 2026, 23:59 UTC

---

### Link to Your Submission
```
https://lineproof-rho.vercel.app
```

### Tweet Link
```
(post the demo video + link, then paste the tweet URL here)
```

### Project Title
```
LineProof — Proof-of-Fair-Odds on Solana
```

### Briefly explain your Project
```
LineProof turns "trust our logs" into "check the chain." It is an autonomous
agent that computes the fair price of every World Cup betting line and proves,
on Solana, that its verdict history was never rewritten.

Most trading agents try to beat the odds; LineProof audits the market itself.

Every few minutes it ingests the TxLINE consensus feed, strips the bookmaker
margin to recover a de-vigged fair line, and runs four deterministic detectors —
stale quotes on live matches, negative-margin arbitrage windows, vig collapse,
and price moves beyond three sigma of a fixture's own tick history. Each fixture
gets an integrity score from 0 to 100 (CLEAN / WATCH / FLAGGED).

The pipeline is pure: the same TxLINE snapshot always produces a byte-identical
report and the same SHA-256 digest. That digest is anchored in a Solana memo
transaction signed by the agent wallet, so the audit trail is tamper-evident —
not even the operator can rewrite it. Anyone can pull /api/report, recompute the
hash, and match it against the on-chain memo.

Why the chain matters: a fairness verdict is worthless if its publisher can
rewrite it. Databases have admins; Solana memos do not. Once signed, the call is
frozen at that slot — the operator included cannot touch it. That turns an
anomaly detector into a fair-odds record a counterparty can accept without
trusting whoever ran it.

Buyers: prediction markets that need a provable fair-line reference to settle
against, sportsbook risk desks that need neutral evidence in settlement disputes,
and integrity bodies reconstructing odds movement that was signed before anyone
knew it would matter.
```

### Link to your live & working MVP
```
https://lineproof-rho.vercel.app
```

### Link to Your Live Demo Video
```
(YouTube/Loom link — upload video/out/lineproof-demo.mp4)
```

### Project's Public Repository Link
```
https://github.com/bryankwandou/lineproof
```

### Link to your Project's Technical Documentation
```
https://github.com/bryankwandou/lineproof/blob/main/docs/TECHNICAL.md
```

### Link to your Project's X Profile or an X post
```
(paste your X post about LineProof)
```

### Share your team's experience using the TxLINE API
```
What worked: the normalised JSON schema is genuinely the selling point. One shape
across every competition meant our audit engine never had to special-case a
tournament — fixtures, odds and scores all came back in the same PascalCase
records, and the milliunit price encoding (divide by 1000 for decimal odds) was
trivial to de-vig. Guest-JWT + X-Api-Token auth was a two-minute integration, and
the snapshot endpoints being idempotent is exactly what a deterministic,
hash-anchored agent needs — every scan is reproducible from feed state.

Where we hit friction: (1) the txline-dev host returned intermittent 503s on
/fixtures/snapshot during our build window, so we added retry-with-backoff to stay
resilient — a status/health endpoint would help agents distinguish an outage from
an empty slate. (2) The odds records carry SuperOddsType and MarketPeriod but no
single documented enum list, so we filtered on 1X2_PARTICIPANT_RESULT by
observation; a published market-type reference would remove guesswork. (3) Live
score liveness had to be derived from the Clock.Running/Seconds fields rather than
an explicit match-status flag — a normalised status would simplify in-play logic.

Net: fast to integrate, reproducible by design, and the schema scaled cleanly from
friendlies to World Cup fixtures without a line of special-casing.
```

### Anything Else?
```
- Track record so far (all independently checkable): 73+ scans hashed, anchored
  on Solana and committed to the public archive; 8 distinct World Cup fixtures
  audited across the window; SCAN_DRIFT anomalies caught on Spain vs Argentina
  with only what was knowable at each tick. Count them yourself:
  https://raw.githubusercontent.com/bryankwandou/lineproof/main/history/index.json
- Autonomy: the agent scans and anchors unattended on a 15-minute GitHub Actions
  schedule; a second 30-minute job commits every anchored report to the public
  archive (Vercel cron as a daily fallback). No human input once deployed.
- Human ownership: LineProof was designed, coded and submitted by a human team.
  "Autonomous" describes runtime operation only — the scan-and-anchor loop runs
  without manual input — not who built or controls the entry (T&C §5.1 compliant).
- Verify it yourself: GET https://lineproof-rho.vercel.app/api/attestations returns
  the on-chain trail with Solana explorer links. First attestation:
  https://explorer.solana.com/tx/3GiTtbRbm845YKtoY8LiStHFhZZwyFCQgBKYUYpcFyVHR5MRPtv5793EfHv1j8xiznBfq17K1hLwtYW1ou9kx4dj?cluster=devnet
- TxLINE endpoints used: POST /auth/guest/start, GET /api/fixtures/snapshot,
  GET /api/odds/snapshot/{id}, GET /api/scores/snapshot/{id}
- Full 0-to-startup plan and a 5,000-task execution ledger live in docs/.
```

---

## Judges' quick-test path (30 seconds)
1. Open https://lineproof-rho.vercel.app — the live integrity board renders from the real feed.
2. Hit https://lineproof-rho.vercel.app/api/report — current audit + `scanDigest`.
3. Hit https://lineproof-rho.vercel.app/api/scan — triggers an agent tick and returns the anchored Solana signature.
4. Hit https://lineproof-rho.vercel.app/api/attestations — the on-chain trail with explorer links.

## Talking-head voice-over script (73.7 s — cut to the exact scene timings below)

Read at a natural pace (~2.4 words/sec); each block is written to fit its scene
window. Record once, straight through — the beats line up with the render.

| Time | Scene | Say this |
|---|---|---|
| 0:00–0:05 | Hook | "A hundred and four World Cup matches. Millions moving on every line. When a price goes bad — who catches it, and who can prove it?" |
| 0:05–0:09 | Turn | "Every other agent tries to beat the odds. Ours audits the market itself." |
| 0:09–0:12 | Logo | "This is LineProof. Proof-of-fair-odds, on Solana." |
| 0:12–0:19 | Stages | "Four deterministic stages: ingest the consensus feed, strip the bookmaker margin to recover the fair line, flag stale quotes, arbitrage windows and abnormal moves — then notarize the verdict." |
| 0:19–0:25 | TxLINE | "It runs on the TxLINE feed. Same snapshot in, same verdict out, byte for byte — that's what makes the hash meaningful." |
| 0:25–0:30 | Walk: hero | "Here's the live product. Not a mockup — every frame you're seeing is the production deployment." |
| 0:30–0:36 | Walk: board | "The integrity board: quoted price against the fair line, the margin, and a score out of a hundred. Clean plays on. Suspect gets flagged." |
| 0:36–0:41 | Walk: forensics | "The forensic timeline replays every recorded tick and every archived scan — these anomalies were caught with only what was knowable at the time." |
| 0:41–0:49 | Walk: verify | "And here's the part nobody else does. The site pulls its own archived report, recomputes the SHA-256, and checks it against the memo the agent signed on Solana. Digest matches digest. Verified." |
| 0:49–0:55 | Walk: explorer | "That's a real transaction on the explorer. Scan ID, report hash, verdict counts — frozen at that slot. Nobody can quietly rewrite this history. Including us." |
| 0:55–1:02 | Proof | "That single property is the product: a fair-odds record a counterparty can accept without trusting whoever ran it." |
| 1:02–1:08 | Why | "Prediction markets get a provable settlement reference. Risk desks get neutral evidence. Regulators get history that was signed before anyone knew it would matter." |
| 1:08–1:14 | CTA | "LineProof is live right now — the link's on screen. Pull the report, recompute the hash, check the chain. You don't have to take our word for it. That's the point." |

## Demo video (~1:14, video/out/lineproof-demo.mp4)
Includes a live app walkthrough built from real frames captured headlessly off the
production deployment: the live integrity board, the forensic timeline, the in-page
verification showing MATCH with identical digests, and the finalized attestation on
the Solana explorer. Every screenshot in the walkthrough is the actual product.
1. **Hook** — 104 matches, millions in odds moving; who catches a bad line and who can *prove* it?
2. **The turn** — most agents trade the odds; LineProof audits the market itself.
3. **How it works** — ingest → de-vig → detect → notarize (four deterministic stages).
4. **Live board** — quoted vs fair line, margin, integrity ring, CLEAN/WATCH/FLAGGED.
5. **TxLINE** — the four endpoints feeding the deterministic engine.
6. **On-chain proof** — the real memo + signature; recompute the digest, match the chain.
7. **Why it wins** — autonomous, defensible, tamper-evident, production-ready.
8. **CTA** — live link, repo, API.
