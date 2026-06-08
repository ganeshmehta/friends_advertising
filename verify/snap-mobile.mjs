// One-shot mobile-viewport screenshot for diagnosing layout gaps.
// Loads the page in a Pixel-class viewport, lets things settle, then captures
// a full-page PNG plus a JSON dump of every section's bounding box so we can
// see at a glance which region is the giant white void the user is seeing.

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const URL = process.env.URL ?? "http://localhost:3000/";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, // iPhone 13/14 portrait
  deviceScaleFactor: 2,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  hasTouch: true,
  isMobile: true,
});
const page = await ctx.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    console.log(`[${msg.type()}]`, msg.text());
  }
});

await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
// Let the mobile splash + framer-motion settle
await page.waitForTimeout(2500);

const screenshotPath = "verify/mobile-home.png";
await page.screenshot({ path: screenshotPath, fullPage: true });
console.log("Wrote", screenshotPath);

// Probe every top-level section under <main>: tag, classes (first 80 ch), y, height
const sections = await page.evaluate(() => {
  const main = document.querySelector("main");
  if (!main) return [];
  const rows = [];
  for (const el of Array.from(main.children)) {
    const r = el.getBoundingClientRect();
    rows.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute("class") ?? "").slice(0, 90),
      top: Math.round(r.top + window.scrollY),
      height: Math.round(r.height),
      computed: {
        opacity: getComputedStyle(el).opacity,
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility,
      },
    });
  }
  return rows;
});
console.log("Top-level sections under <main>:");
console.table(sections);

// Also probe the visible viewport for what's actually painted at scroll=hero+200
await page.evaluate(() => window.scrollTo(0, window.innerHeight + 100));
await page.waitForTimeout(400);
const afterHero = await page.evaluate(() => ({
  scrollY: window.scrollY,
  doc: document.documentElement.scrollHeight,
  vh: window.innerHeight,
}));
await page.screenshot({ path: "verify/mobile-after-hero.png" });
console.log("After scroll", afterHero);

writeFileSync("verify/mobile-sections.json", JSON.stringify(sections, null, 2));
await browser.close();
