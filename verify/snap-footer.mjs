// Desktop screenshot to verify footer area is no longer black on the home route.
import { chromium } from "playwright";

const URL = process.env.URL ?? "http://localhost:3001/";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle", timeout: 90_000 });
await page.waitForTimeout(2000);

// Scroll to footer
const doc = await page.evaluate(() => document.documentElement.scrollHeight);
await page.evaluate((h) => window.scrollTo(0, h), doc);
await page.waitForTimeout(800);

await page.screenshot({ path: "verify/desktop-footer.png", fullPage: false });
console.log("Wrote verify/desktop-footer.png");

const bg = await page.evaluate(() => {
  const el = document.querySelector(".page-home-footer");
  if (!el) return "no .page-home-footer";
  const cs = getComputedStyle(el);
  return { bg: cs.backgroundColor, z: cs.zIndex, pos: cs.position };
});
console.log("page-home-footer:", bg);

await browser.close();
