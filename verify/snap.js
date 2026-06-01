const { chromium } = require("playwright");
const path = require("path");
const outDir = __dirname;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("[err]", e.message));
  page.on("console", (m) => { if (m.type() === "error") console.log("[c]", m.text()); });
  await page.goto("http://localhost:3001/about", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  // Anchor to the BY THE NUMBERS section by text and screenshot around it
  const numbersY = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll("div"));
    const el = nodes.find((n) => (n.textContent || "").trim().toLowerCase() === "by the numbers");
    if (!el) return 1800;
    const r = el.getBoundingClientRect();
    return Math.max(0, window.scrollY + r.top - 80);
  });
  const partnersY = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll("h2"));
    const el = headings.find((n) => /heavyweights/i.test(n.textContent || ""));
    if (!el) return 4200;
    const r = el.getBoundingClientRect();
    return Math.max(0, window.scrollY + r.top - 80);
  });
  const testimonialsY = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll("h2"));
    const el = headings.find((n) => /client/i.test(n.textContent || ""));
    if (!el) return 3700;
    const r = el.getBoundingClientRect();
    return Math.max(0, window.scrollY + r.top - 80);
  });
  const targets = [
    { y: 0, name: "v2-hero" },
    { y: numbersY, name: "v2-numbers" },
    { y: testimonialsY, name: "v2-testimonials" },
    { y: partnersY, name: "v2-partners" },
  ];
  for (const t of targets) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), t.y);
    await page.waitForTimeout(900);
    const p = path.join(outDir, `${t.name}.png`);
    await page.screenshot({ path: p });
    console.log("wrote", p);
  }
  await browser.close();
  console.log("OK");
})();
