import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3010";
const ROUTE = process.env.ROUTE ?? "/";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  hasTouch: true,
  isMobile: true,
});
const page = await ctx.newPage();
await page.goto(`${BASE}${ROUTE}`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(2500);
// Scroll the whole page to settle lazy elements
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y <= h; y += 600) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(150);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

const safeRoute = ROUTE.replace(/\//g, "_") || "_home";
const path = `verify/full-mobile-${safeRoute}.png`;
await page.screenshot({ path, fullPage: true });
console.log(`saved ${path}  doc=${h}px`);
await browser.close();
