// Run one agent tick from the command line — same code path the scheduler hits.
const { runScan } = require("../api/_lib/scanner");
const { anchorScan } = require("../api/_lib/solana");

(async () => {
  const { report, scanDigest } = await runScan();
  console.log(`scan ${report.scanId}: ${report.matches} fixtures, ${report.flagged} flagged`);
  console.log("digest", scanDigest);
  for (const a of report.audits.slice(0, 6)) {
    console.log(` ${a.verdict.padEnd(7)} ${a.integrity.toString().padStart(3)}  ${a.home} vs ${a.away}  quoted ${a.quoted.join("/")}  fair ${a.fairLine.join("/")}  vig ${(a.overround * 100).toFixed(2)}%${a.anomalies.length ? "  [" + a.anomalies.map((x) => x.code).join(",") + "]" : ""}`);
  }
  if (process.env.AGENT_SECRET_B58) {
    const anchor = await anchorScan(scanDigest, { scanId: report.scanId, matches: report.matches, flagged: report.flagged });
    console.log("anchor:", anchor);
  } else {
    console.log("anchor: skipped (AGENT_SECRET_B58 not set)");
  }
})().catch((e) => { console.error(e); process.exit(1); });
