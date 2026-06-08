/**
 * Generate a lightweight static hero poster for mobile devices.
 * Stamps a stylised skyline silhouette onto a deep-blue gradient so the
 * mobile experience feels cinematic without paying the 5 MB road video
 * cost or shipping the 29 MB plane GLB.
 *
 * Output: public/media/hero-mobile.jpg (~30 KB AVIF/JPEG)
 *
 * Run with:
 *   & "C:\Program Files\nodejs\node.exe" scripts/generate-mobile-hero.mjs
 */
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const WIDTH = 900;
const HEIGHT = 1600; // tall portrait — covers any phone in object-cover
const OUT_PATH = "public/media/hero-mobile.jpg";

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#0a1a3a" />
      <stop offset="35%"  stop-color="#102a55" />
      <stop offset="65%"  stop-color="#1d3f7a" />
      <stop offset="100%" stop-color="#3b6fbf" />
    </linearGradient>
    <radialGradient id="sunglow" cx="0.5" cy="0.78" r="0.55">
      <stop offset="0%" stop-color="rgba(255,196,128,0.55)" />
      <stop offset="55%" stop-color="rgba(255,140,90,0.18)" />
      <stop offset="100%" stop-color="rgba(255,140,90,0)" />
    </radialGradient>
    <linearGradient id="city" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0a14" />
      <stop offset="100%" stop-color="#000005" />
    </linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a22" />
      <stop offset="100%" stop-color="#05050a" />
    </linearGradient>
  </defs>

  <!-- sky -->
  <rect width="100%" height="100%" fill="url(#sky)" />

  <!-- distant sun glow on horizon -->
  <rect width="100%" height="100%" fill="url(#sunglow)" />

  <!-- back-most city band (lighter, smaller buildings) -->
  <g opacity="0.45" fill="#0d1a35">
    <rect x="0"   y="1080" width="60"  height="60"  />
    <rect x="60"  y="1050" width="80"  height="90"  />
    <rect x="140" y="1090" width="50"  height="50"  />
    <rect x="190" y="1040" width="100" height="100" />
    <rect x="290" y="1070" width="60"  height="70"  />
    <rect x="350" y="1010" width="120" height="130" />
    <rect x="470" y="1075" width="55"  height="65"  />
    <rect x="525" y="1035" width="90"  height="105" />
    <rect x="615" y="1080" width="50"  height="60"  />
    <rect x="665" y="1055" width="75"  height="85"  />
    <rect x="740" y="1045" width="100" height="95"  />
    <rect x="840" y="1085" width="60"  height="55"  />
  </g>

  <!-- mid skyline -->
  <g fill="url(#city)">
    <rect x="0"   y="1140" width="90"  height="120" />
    <rect x="90"  y="1100" width="70"  height="160" />
    <rect x="160" y="1140" width="50"  height="120" />
    <rect x="210" y="1060" width="110" height="200" />
    <rect x="320" y="1140" width="60"  height="120" />
    <rect x="380" y="1080" width="130" height="180" />
    <rect x="510" y="1135" width="55"  height="125" />
    <rect x="565" y="1095" width="90"  height="165" />
    <rect x="655" y="1145" width="60"  height="115" />
    <rect x="715" y="1075" width="120" height="185" />
    <rect x="835" y="1135" width="65"  height="125" />
  </g>

  <!-- windows on tallest mid building -->
  <g fill="#fff7c2" opacity="0.85">
    <rect x="235" y="1080" width="6" height="8" />
    <rect x="250" y="1080" width="6" height="8" />
    <rect x="265" y="1080" width="6" height="8" />
    <rect x="280" y="1080" width="6" height="8" />
    <rect x="295" y="1080" width="6" height="8" />
    <rect x="235" y="1100" width="6" height="8" />
    <rect x="265" y="1100" width="6" height="8" />
    <rect x="295" y="1100" width="6" height="8" />
    <rect x="250" y="1120" width="6" height="8" />
    <rect x="280" y="1120" width="6" height="8" />
  </g>
  <g fill="#cce6ff" opacity="0.7">
    <rect x="730" y="1095" width="6" height="8" />
    <rect x="745" y="1095" width="6" height="8" />
    <rect x="760" y="1095" width="6" height="8" />
    <rect x="775" y="1095" width="6" height="8" />
    <rect x="790" y="1095" width="6" height="8" />
    <rect x="805" y="1095" width="6" height="8" />
    <rect x="820" y="1095" width="6" height="8" />
    <rect x="730" y="1115" width="6" height="8" />
    <rect x="760" y="1115" width="6" height="8" />
    <rect x="790" y="1115" width="6" height="8" />
    <rect x="820" y="1115" width="6" height="8" />
    <rect x="745" y="1135" width="6" height="8" />
    <rect x="775" y="1135" width="6" height="8" />
    <rect x="805" y="1135" width="6" height="8" />
  </g>

  <!-- billboard pole + flex board (front-and-center hero element) -->
  <g>
    <rect x="380" y="1260" width="12" height="180" fill="#1a1a22" />
    <rect x="265" y="1180" width="240" height="120" rx="6" fill="#0f1730" stroke="#2a6fff" stroke-width="3" />
    <text x="385" y="1230"
          font-family="Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
          font-weight="900" font-size="34" fill="#7ab8ff" text-anchor="middle" letter-spacing="-1">
      OOH
    </text>
    <text x="385" y="1275"
          font-family="Outfit, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
          font-weight="700" font-size="14" fill="rgba(206,229,240,0.85)" text-anchor="middle" letter-spacing="3">
      MUMBAI
    </text>
  </g>

  <!-- foreground road (warm pavement) -->
  <rect x="0" y="1440" width="900" height="160" fill="url(#road)" />

  <!-- lane markings -->
  <g fill="rgba(255,255,255,0.55)">
    <polygon points="380,1460 420,1460 470,1600 350,1600" />
    <polygon points="430,1490 460,1490 510,1600 410,1600" />
    <polygon points="485,1520 510,1520 555,1600 470,1600" />
  </g>

  <!-- soft top vignette -->
  <rect x="0" y="0" width="900" height="220" fill="rgba(0,0,0,0.25)" />
</svg>
`;

async function main() {
  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await sharp(Buffer.from(SVG))
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(OUT_PATH);
  const stat = await fs.stat(OUT_PATH);
  console.log(`Wrote ${OUT_PATH} (${(stat.size / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
