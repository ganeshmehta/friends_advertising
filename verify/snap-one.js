const { chromium } = require("playwright");
const path = require("path");

const route = process.argv[2];
const file = process.argv[3] || `shot-${route.replace(/\//g, "_")}.png`;
if (!route) {
  console.error("usage: node snap-one.js /services [file.png]");
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("[err]", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.log("[console.err]", m.text());
  });
  try {
    await page.goto(`http://localhost:3001${route}`, { waitUntil: "load", timeout: 90000 });
  } catch (e) {
    console.log("[goto]", e.message);
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(__dirname, file), fullPage: true });
  console.log("wrote", file);
  await page.screenshot({ path: path.join(__dirname, file.replace(".png", "-fold.png")), fullPage: false });
  console.log("wrote", file.replace(".png", "-fold.png"));
  await browser.close();
})();
