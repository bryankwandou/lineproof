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
LineProof — The Odds Integrity Layer
```

### Briefly explain your Project
```
LineProof is an autonomous market-surveillance agent for World Cup betting lines.
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

Buyers: sportsbook risk desks, prediction-market settlement layers, and integrity
bodies who today rely on internal logs they could quietly edit themselves.
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
https://github.com/nayrbryanGaming/lineproof
```

### Link to your Project's Technical Documentation
```
https://github.com/nayrbryanGaming/lineproof/blob/main/docs/TECHNICAL.md
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
- Autonomy: the agent runs unattended on a 5-minute GitHub Actions schedule
  (Vercel cron as a daily fallback). No human input once deployed.
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

## Demo video script (~51s, matches video/out/lineproof-demo.mp4 — a tight sizzle explainer)
> Tip: for the "live app walkthrough" the brief asks for, screen-record one pass through
> https://lineproof-rho.vercel.app + /api/report + an explorer tx, and stitch it after this reel.
1. **Hook** — 104 matches, millions in odds moving; who catches a bad line and who can *prove* it?
2. **The turn** — most agents trade the odds; LineProof audits the market itself.
3. **How it works** — ingest → de-vig → detect → notarize (four deterministic stages).
4. **Live board** — quoted vs fair line, margin, integrity ring, CLEAN/WATCH/FLAGGED.
5. **TxLINE** — the four endpoints feeding the deterministic engine.
6. **On-chain proof** — the real memo + signature; recompute the digest, match the chain.
7. **Why it wins** — autonomous, defensible, tamper-evident, production-ready.
8. **CTA** — live link, repo, API.
