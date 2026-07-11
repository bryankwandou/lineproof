// Generates docs/DESIGN-CHECKLIST.md — the 5,000-task mega design
// transformation ledger: LineProof "VAR of betting markets" edition.
// Dual-surface strategy: the B2B cockpit stays intact; the Arena adds the
// football-native, broadcast-grade layer. Tasks are composed from a phase
// plan plus parametrized coverage matrices, same approach as CHECKLIST.md.
const fs = require("fs");
const path = require("path");

const items = [];
const add = (phase, text) => items.push({ phase, text });

const fixed = {
  "D1 — VAR concept lock (ship day 1)": [
    "Adopt the VAR metaphor: agent as autonomous video-assistant referee for markets",
    "Map verdicts to referee language: CLEAN = play on, WATCH = yellow card, FLAGGED = red card",
    "Ship /arena Match Center consuming the existing APIs only — zero backend risk",
    "Link Arena from the main nav without disturbing the B2B cockpit",
    "Deploy and verify the Arena renders from live feed data",
  ],
  "D2 — Stadium visual system": [
    "Pitch-green dark palette layered over the existing brand tokens",
    "Scoreboard numeral style for scores and clocks",
    "Broadcast lower-third component for fixture identity",
    "Floodlight radial lighting on section headers",
    "Card-flash animation for yellow and red verdicts",
  ],
  "D3 — Match HUD": [
    "Live minute clock derived from feed score updates",
    "Fair-line versus quoted-line bar duel per outcome",
    "Margin meter styled as possession bar",
    "Verdict card raised with referee-arm timing curve",
  ],
  "D4 — Whistle moments": [
    "Anomaly timeline rendered as match incidents feed",
    "Incident chips: minute, fixture, offence code, severity card",
    "Replay scrubber over archived scans",
  ],
  "D5 — On-chain tunnel": [
    "Attestation trail as post-match referee report",
    "Signature rows styled as official match documents",
    "Verification MATCH state as full-time whistle moment",
  ],
  "D6 — Motion pass": [
    "Entrance choreography: staggered lower-thirds, no dead frames",
    "Idle drift on resting panels to keep broadcast liveliness",
    "Reduced-motion fallback for accessibility",
  ],
  "D7 — Copy pass (human, natural)": [
    "Rewrite every Arena string in match-commentary register",
    "Zero emoji, zero stock AI phrasing, paraphrase everything",
    "Terminology sheet: offence codes, card language, referee report",
  ],
  "D8 — Responsive + performance": [
    "Arena readable on mobile: single-column HUD",
    "No layout shift on data refresh",
    "Lighthouse pass over 90 performance on the Arena",
  ],
  "D9 — Demo integration": [
    "Capture Arena frames headlessly for the video walkthrough",
    "Insert Arena scene into the Remotion sequence",
    "Re-render final MP4 and refresh the Download package",
  ],
  "D10 — Judge polish": [
    "Cross-check every judging criterion against the Arena surface",
    "Dry-run the 30-second judge path through both surfaces",
    "Freeze design two days before the deadline",
  ],
  "D11-D14 — Post-deadline GameFi track (startup lane)": [
    "Design prediction-league concept on top of integrity scores",
    "Fan-facing card-collection concept for verified match incidents",
    "Season pass concept tied to attestation history",
    "Scope on-chain settlement design for the league",
  ],
};
for (const [phase, list] of Object.entries(fixed)) for (const t of list) add(phase, t);

// Coverage matrices.
const surfaces = ["arena header", "match HUD", "incident feed", "referee report", "verification panel", "footer strip"];
const states = ["loading", "live data", "feed outage", "empty history", "flagged incident", "verified match"];
const viewports = ["360px phone", "768px tablet", "1280px laptop", "1920px desktop"];
const verdicts = ["play on", "yellow card", "red card"];
const motions = ["entrance", "refresh", "hover", "reduced-motion"];

for (const s of surfaces) for (const st of states) add("D8 — Responsive + performance", `Design and test the ${s} in the ${st} state`);
for (const s of surfaces) for (const v of viewports) add("D8 — Responsive + performance", `Verify the ${s} at ${v}`);
for (const v of verdicts) for (const m of motions) add("D6 — Motion pass", `Tune the ${v} treatment for the ${m} motion case`);

// Per match slot: broadcast coverage for all 104 World Cup fixtures.
for (let m = 1; m <= 104; m++) {
  add("D3 — Match HUD", `Match slot ${m}: confirm HUD renders identity, clock and lines correctly`);
  add("D4 — Whistle moments", `Match slot ${m}: confirm incidents list matches the replay endpoint`);
  add("D5 — On-chain tunnel", `Match slot ${m}: confirm the covering attestation is reachable from the HUD`);
}

// Fill to exactly 5000 with dated transformation shifts across the 14 days.
const shiftTemplates = [
  (d, n) => `Day ${d} shift ${n}: review one Arena surface against the broadcast reference board and log deltas`,
  (d, n) => `Day ${d} shift ${n}: paraphrase pass on one copy block, verify natural human register`,
  (d, n) => `Day ${d} shift ${n}: motion timing review on one component at 60fps`,
  (d, n) => `Day ${d} shift ${n}: contrast and accessibility check on one panel`,
  (d, n) => `Day ${d} shift ${n}: capture, compare and archive a visual regression screenshot`,
];
let n = 1;
while (items.length < 5000) {
  const day = (n % 14) + 1;
  add(`Execution ledger — 14-day transformation`, shiftTemplates[items.length % shiftTemplates.length](day, Math.ceil(n / 5)));
  n++;
}

let out = `# LineProof Mega Design Transformation — VAR Edition\n\n${items.length} tasks. Dual-surface: B2B cockpit untouched, Arena carries the football broadcast layer. Regenerate with \`node scripts/gen-design-checklist.js\`.\n`;
let current = "";
let num = 0;
for (const it of items) {
  if (it.phase !== current) {
    current = it.phase;
    out += `\n## ${current}\n\n`;
  }
  num++;
  out += `- [ ] ${String(num).padStart(4, "0")} ${it.text}\n`;
}
fs.writeFileSync(path.join(__dirname, "..", "docs", "DESIGN-CHECKLIST.md"), out);
console.log(`wrote docs/DESIGN-CHECKLIST.md with ${items.length} tasks`);
