const { chromium } = require("playwright");
const path = require("path");

const routes = [
  { path: "/about", file: "shell-about.png" },
  { path: "/services", file: "shell-services.png" },
  { path: "/projects", file: "shell-projects.png" },
  { path: "/contact", file: "shell-contact.png" },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("[err]", e.message));

  for (const r of routes) {
    try {
      await page.goto(`http://localhost:3001${r.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(2500);
    } catch (e) {
      console.log("[goto]", r.path, e.message);
    }
    await page.screenshot({ path: path.join(__dirname, r.file), fullPage: true });
    console.log("wrote", r.file);

    // also capture viewport (top fold) so we can see the integrated nav clearly
    await page.screenshot({
      path: path.join(__dirname, r.file.replace(".png", "-fold.png")),
      fullPage: false,
    });
    console.log("wrote", r.file.replace(".png", "-fold.png"));
  }

  await browser.close();
})();
