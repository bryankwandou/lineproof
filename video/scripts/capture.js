// Capture real frames of the live product for the walkthrough segment.
// Every image in the video's demo section comes from this script — actual
// rendered pages of the deployed app, not mockups.
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const OUT = path.join(__dirname, "..", "public", "shots");
const SITE = "https://lineproof-rho.vercel.app";

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const shoot = async (name, url, scrollTo = null, wait = 6000) => {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, wait));
    if (scrollTo) {
      await page.evaluate((sel) => {
        document.documentElement.style.scrollBehavior = "auto";
        const el = document.querySelector(sel);
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 70);
        document.querySelectorAll(".reveal").forEach((n) => n.classList.add("in"));
      }, scrollTo);
      await new Promise((r) => setTimeout(r, 2500));
    }
    await page.screenshot({ path: path.join(OUT, name + ".png") });
    console.log("shot:", name);
  };

  await shoot("hero", SITE, null, 9000);
  await shoot("board", SITE, "#live", 9000);
  await shoot("forensics", SITE, "#forensics", 9000);
  await shoot("verify", SITE, "#chain", 9000);
  await shoot("api-verify", SITE + "/api/verify", null, 5000);
  await shoot("api-health", SITE + "/api/health", null, 5000);

  // The on-chain transaction as the explorer renders it. Verify against the
  // newest archived scan so the shot always shows a green, matching digest.
  const idx = await fetch(
    "https://raw.githubusercontent.com/bryankwandou/lineproof/main/history/index.json"
  ).then((r) => r.json());
  const newest = idx[0] && idx[0].scanId ? "?scanId=" + idx[0].scanId : "";
  const verify = await fetch(SITE + "/api/verify" + newest).then((r) => r.json());
  if (verify.explorer) {
    await shoot("explorer", verify.explorer, null, 12000);
  }
  await browser.close();
  console.log("done");
})().catch((e) => { console.error(e); process.exit(1); });
