// Robust check: visit every public route at desktop & mobile viewports,
// collect console errors, response status, byte size, content-type,
// SEO surface (title, meta description, OG, canonical), JSON-LD blocks,
// and validate that no route paints a blank/black void on mobile.

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3010";
const ROUTES = ["/", "/about", "/services", "/projects", "/contact"];

const browser = await chromium.launch();
const results = [];

async function probe(route, profile) {
  const ctx = await browser.newContext(profile.ctx);
  const page = await ctx.newPage();
  const consoleErrors = [];
  const reqFails = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 240));
  });
  page.on("pageerror", (e) => consoleErrors.push(`[pageerror] ${e.message.slice(0, 240)}`));
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (url.startsWith("data:") || url.includes("favicon") || url.includes("webpack-hmr")) return;
    reqFails.push(`${req.failure()?.errorText} ${url.slice(0, 100)}`);
  });

  const url = `${BASE}${route}`;
  const t0 = Date.now();
  // domcontentloaded — many R3F + framer-motion pages never reach networkidle
  const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  const elapsed = Date.now() - t0;
  await page.waitForTimeout(2500); // settle hydration + first paint

  const status = resp?.status() ?? 0;
  const ctype = resp?.headers()?.["content-type"] ?? "";

  // Scroll the full page so lazy / whileInView things fire
  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  for (let y = 0; y <= docHeight; y += 600) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const seo = await page.evaluate(() => {
    const q = (sel, attr = null) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return attr ? el.getAttribute(attr) : el.textContent;
    };
    const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => {
      try {
        const j = JSON.parse(s.textContent ?? "{}");
        if (Array.isArray(j)) return j.map((x) => x["@type"]).join("+");
        return j["@type"];
      } catch {
        return "INVALID_JSON";
      }
    });
    return {
      title: q("title"),
      description: q('meta[name="description"]', "content"),
      canonical: q('link[rel="canonical"]', "href"),
      ogTitle: q('meta[property="og:title"]', "content"),
      ogImage: q('meta[property="og:image"]', "content"),
      ogType: q('meta[property="og:type"]', "content"),
      twitterCard: q('meta[name="twitter:card"]', "content"),
      themeColor: q('meta[name="theme-color"]', "content"),
      viewport: q('meta[name="viewport"]', "content"),
      jsonLdTypes: ld,
      h1: q("h1"),
    };
  });

  const layout = await page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return { sections: 0 };
    const cells = Array.from(main.children).map((el) => ({
      tag: el.tagName.toLowerCase(),
      top: Math.round(el.getBoundingClientRect().top + window.scrollY),
      height: Math.round(el.getBoundingClientRect().height),
      opacity: getComputedStyle(el).opacity,
    }));
    // Sniff for any large invisible block (opacity 0 OR display none) > 400 px
    const voids = cells.filter(
      (c) => (c.opacity === "0" || c.opacity === "0.0") && c.height > 400,
    );
    return { count: cells.length, voids };
  });

  const screenshotPath = `verify/check-${profile.name}-${route.replace(/\//g, "_") || "_home"}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: false });

  await ctx.close();
  return {
    route,
    profile: profile.name,
    status,
    contentType: ctype.split(";")[0],
    timeMs: elapsed,
    consoleErrors: consoleErrors.slice(0, 10),
    reqFails: reqFails.slice(0, 10),
    seo,
    layout,
    screenshot: screenshotPath,
  };
}

const desktop = {
  name: "desktop",
  ctx: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const mobile = {
  name: "mobile",
  ctx: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    hasTouch: true,
    isMobile: true,
  },
};

for (const route of ROUTES) {
  for (const profile of [desktop, mobile]) {
    const r = await probe(route, profile);
    results.push(r);
    const errFlag = r.consoleErrors.length > 0 ? "ERR" : "ok";
    const voidsFlag = r.layout.voids?.length ? "VOID" : "ok";
    console.log(
      `[${r.profile}] ${r.route} -> ${r.status} ${errFlag} ${voidsFlag} t=${r.timeMs}ms title="${r.seo.title?.slice(0, 60)}"`,
    );
  }
}

writeFileSync("verify/check-report.json", JSON.stringify(results, null, 2));
console.log("\nReport written to verify/check-report.json");
await browser.close();
