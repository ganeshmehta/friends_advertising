/**
 * Generate a true 1200x630 OpenGraph hero image at public/media/og-default.jpg.
 *
 * Run with:
 *   & "C:\Program Files\nodejs\node.exe" scripts/generate-og.mjs
 *
 * Composites the brand logo on a navy gradient backdrop sized to spec for
 * LinkedIn / WhatsApp / X / Slack link cards.
 */
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_PATH = "public/logos/Brand_Logo.png";
const OUT_PATH = "public/media/og-default.jpg";

const SVG_BG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#0d2440" />
      <stop offset="55%" stop-color="#173b62" />
      <stop offset="100%" stop-color="#0a0a0c" />
    </linearGradient>
    <radialGradient id="glow1" cx="0.05" cy="0.05" r="0.6">
      <stop offset="0%" stop-color="rgba(15,195,205,0.25)" />
      <stop offset="100%" stop-color="rgba(15,195,205,0)" />
    </radialGradient>
    <radialGradient id="glow2" cx="0.95" cy="0.95" r="0.65">
      <stop offset="0%" stop-color="rgba(92,96,245,0.30)" />
      <stop offset="100%" stop-color="rgba(92,96,245,0)" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
  <rect width="100%" height="100%" fill="url(#glow1)" />
  <rect width="100%" height="100%" fill="url(#glow2)" />
  <text x="540" y="270"
        font-family="Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
        font-weight="900" font-size="64" fill="#ffffff" letter-spacing="-1.5">
    Friends Advertising
  </text>
  <text x="540" y="325"
        font-family="Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
        font-weight="600" font-size="30" fill="rgba(206,229,240,0.85)" letter-spacing="-0.5">
    The Complete Outdoor Solution
  </text>
  <text x="540" y="395"
        font-family="Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
        font-weight="700" font-size="20" fill="#0fc3cd" letter-spacing="5">
         MAHARASHTRA
  </text>
  <rect x="540" y="420" width="200" height="3" fill="#5c60f5" />
</svg>
`;

async function main() {
  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });

  // Resize brand logo to fit the left card area (≈400 px square).
  const logo = await sharp(LOGO_PATH)
    .resize({ width: 360, height: 360, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(Buffer.from(SVG_BG))
    .composite([
      { input: logo, top: 135, left: 110 },
    ])
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile(OUT_PATH);

  const stat = await fs.stat(OUT_PATH);
  console.log(`Wrote ${OUT_PATH} (${(stat.size / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
