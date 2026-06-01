const { chromium } = require("playwright");
const path = require("path");
const outDir = __dirname;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("[err]", e.message));
  await page.goto("http://localhost:3001/services", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  // Full page screenshot
  await page.screenshot({ path: path.join(outDir, "svc-full.png"), fullPage: true });
  console.log("wrote svc-full.png");

  // Click each tab and capture the panel region
  const tabs = await page.$$('[role="tab"]');
  for (let i = 0; i < tabs.length; i++) {
    await tabs[i].click();
    await page.waitForTimeout(700);
    const panel = await page.$('[role="tabpanel"]');
    if (panel) {
      const box = await panel.boundingBox();
      if (box) {
        // capture a region wrapping the panel + small padding
        await page.screenshot({
          path: path.join(outDir, `svc-tab-${i + 1}.png`),
          clip: {
            x: Math.max(0, box.x - 12),
            y: Math.max(0, box.y - 12),
            width: Math.min(1440 - box.x + 12, box.width + 24),
            height: Math.min(900, box.height + 24),
          },
        });
        console.log("wrote", `svc-tab-${i + 1}.png`);
      }
    }
  }

  await browser.close();
  console.log("OK");
})();
