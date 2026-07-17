// Quick proof shots of the fixed live deploy (verify MATCH + ring digits).
const puppeteer = require("puppeteer-core");
const path = require("path");
const OUT = path.join(__dirname, "..", "public", "shots");
(async () => {
  const b = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1"],
  });
  const p = await b.newPage();
  await p.setViewport({ width: 1920, height: 1080 });
  for (const [n, s] of [["proof-chain", "#chain"], ["proof-live", "#live"]]) {
    await p.goto("https://lineproof-rho.vercel.app", { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 9000));
    await p.evaluate((sel) => {
      document.documentElement.style.scrollBehavior = "auto";
      const el = document.querySelector(sel);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 70);
      document.querySelectorAll(".reveal").forEach((x) => x.classList.add("in"));
    }, s);
    await new Promise((r) => setTimeout(r, 3000));
    await p.screenshot({ path: path.join(OUT, n + ".png") });
    console.log("shot", n);
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
