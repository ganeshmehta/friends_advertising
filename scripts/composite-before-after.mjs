// Side-by-side: same Karjat photo, OLD quad (creative on road) vs NEW quad (creative on billboard)
import sharp from "sharp";
import { promises as fs } from "node:fs";

const PHOTO = "public/media/karjat-hatnoli.png";
const OLD_QUAD = [
  [0.42, 0.30],
  [0.62, 0.30],
  [0.63, 0.50],
  [0.41, 0.50],
];
const NEW_QUAD = [
  [0.4375, 0.135],
  [0.6325, 0.1375],
  [0.6325, 0.3325],
  [0.4375, 0.3325],
];

const CREATIVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fb923c"/>
      <stop offset="1" stop-color="#dc2626"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <text x="200" y="170" font-family="Inter,Arial" font-size="44" font-weight="900" fill="white" text-anchor="middle">URBAN</text>
  <text x="200" y="220" font-family="Inter,Arial" font-size="44" font-weight="900" fill="white" text-anchor="middle">JUNCTION</text>
  <text x="200" y="275" font-family="Inter,Arial" font-size="18" fill="white" text-anchor="middle" opacity="0.85">PREMIUM CAMPAIGN</text>
</svg>`;

async function composite(quad, label, outPath) {
  const meta = await sharp(PHOTO).metadata();
  const W = meta.width, H = meta.height;
  const pxQuad = quad.map(([x, y]) => [Math.round(x * W), Math.round(y * H)]);
  const xs = pxQuad.map(p => p[0]);
  const ys = pxQuad.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const boxW = maxX - minX, boxH = maxY - minY;
  const cx = pxQuad.reduce((s,p)=>s+p[0],0)/4;
  const cy = pxQuad.reduce((s,p)=>s+p[1],0)/4;
  const BORDER = 0.035;
  const insetPxQuad = pxQuad.map(([x,y]) => [x + (cx-x)*BORDER, y + (cy-y)*BORDER]);
  const outerLocalPts = pxQuad.map(([x, y]) => `${x - minX},${y - minY}`).join(" ");
  const innerLocalPts = insetPxQuad.map(([x, y]) => `${x - minX},${y - minY}`).join(" ");
  const whiteFrameSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${boxW}" height="${boxH}" viewBox="0 0 ${boxW} ${boxH}"><polygon points="${outerLocalPts}" fill="white"/></svg>`;
  const innerMaskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${boxW}" height="${boxH}" viewBox="0 0 ${boxW} ${boxH}"><polygon points="${innerLocalPts}" fill="white"/></svg>`;
  const creative = await sharp(Buffer.from(CREATIVE_SVG)).resize(boxW, boxH, { fit: "fill" }).png().toBuffer();
  const innerMask = await sharp(Buffer.from(innerMaskSvg)).resize(boxW, boxH, { fit: "fill" }).png().toBuffer();
  const maskedCreative = await sharp(creative).composite([{ input: innerMask, blend: "dest-in" }]).png().toBuffer();
  const whiteFrame = await sharp(Buffer.from(whiteFrameSvg)).resize(boxW, boxH, { fit: "fill" }).png().toBuffer();
  const billboard = await sharp(whiteFrame).composite([{ input: maskedCreative, blend: "over" }]).png().toBuffer();
  const labelSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="64"><rect width="100%" height="100%" fill="#0f172a"/><text x="${W/2}" y="42" font-family="Inter,Arial" font-size="28" font-weight="700" fill="white" text-anchor="middle">${label}</text></svg>`;
  const label_buf = await sharp(Buffer.from(labelSvg)).png().toBuffer();
  const photoWithCreative = await sharp(PHOTO).composite([{ input: billboard, top: minY, left: minX }]).png().toBuffer();
  await sharp(photoWithCreative).extend({ top: 64, bottom: 0, left: 0, right: 0, background: { r: 15, g: 23, b: 42 } }).composite([{ input: label_buf, top: 0, left: 0 }]).png().toFile(outPath);
}

await composite(OLD_QUAD, "BEFORE — no white frame, wrong spot", ".composite-karjat-OLD.png");
await composite(NEW_QUAD, "AFTER — white matte + on billboard", ".composite-karjat-NEW.png");

// Also generate Khidkaleshwar AFTER preview
const KHID_QUAD = [
  [0.371, 0.185],
  [0.615, 0.185],
  [0.615, 0.361],
  [0.371, 0.361],
];
async function compositeAt(photo, quad, label, outPath) {
  const meta = await sharp(photo).metadata();
  const W = meta.width, H = meta.height;
  const pxQuad = quad.map(([x, y]) => [Math.round(x * W), Math.round(y * H)]);
  const xs = pxQuad.map(p => p[0]);
  const ys = pxQuad.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const boxW = maxX - minX, boxH = maxY - minY;
  const cx = pxQuad.reduce((s,p)=>s+p[0],0)/4;
  const cy = pxQuad.reduce((s,p)=>s+p[1],0)/4;
  const BORDER = 0.035;
  const insetPxQuad = pxQuad.map(([x,y]) => [x + (cx-x)*BORDER, y + (cy-y)*BORDER]);
  const outerLocalPts = pxQuad.map(([x, y]) => `${x - minX},${y - minY}`).join(" ");
  const innerLocalPts = insetPxQuad.map(([x, y]) => `${x - minX},${y - minY}`).join(" ");
  const whiteFrameSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${boxW}" height="${boxH}" viewBox="0 0 ${boxW} ${boxH}"><polygon points="${outerLocalPts}" fill="white"/></svg>`;
  const innerMaskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${boxW}" height="${boxH}" viewBox="0 0 ${boxW} ${boxH}"><polygon points="${innerLocalPts}" fill="white"/></svg>`;
  const creative = await sharp(Buffer.from(CREATIVE_SVG)).resize(boxW, boxH, { fit: "fill" }).png().toBuffer();
  const innerMask = await sharp(Buffer.from(innerMaskSvg)).resize(boxW, boxH, { fit: "fill" }).png().toBuffer();
  const maskedCreative = await sharp(creative).composite([{ input: innerMask, blend: "dest-in" }]).png().toBuffer();
  const whiteFrame = await sharp(Buffer.from(whiteFrameSvg)).resize(boxW, boxH, { fit: "fill" }).png().toBuffer();
  const billboard = await sharp(whiteFrame).composite([{ input: maskedCreative, blend: "over" }]).png().toBuffer();
  const labelSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="64"><rect width="100%" height="100%" fill="#0f172a"/><text x="${W/2}" y="42" font-family="Inter,Arial" font-size="28" font-weight="700" fill="white" text-anchor="middle">${label}</text></svg>`;
  const label_buf = await sharp(Buffer.from(labelSvg)).png().toBuffer();
  const photoWithCreative = await sharp(photo).composite([{ input: billboard, top: minY, left: minX }]).png().toBuffer();
  await sharp(photoWithCreative).extend({ top: 64, bottom: 0, left: 0, right: 0, background: { r: 15, g: 23, b: 42 } }).composite([{ input: label_buf, top: 0, left: 0 }]).png().toFile(outPath);
}
await compositeAt("public/media/khidkaleshwar-mandir.jpg", KHID_QUAD, "AFTER — Khidkaleshwar billboard", ".composite-khid-NEW.png");

// Stitch side-by-side
const left = sharp(".composite-karjat-OLD.png");
const right = sharp(".composite-karjat-NEW.png");
const lm = await left.metadata();
const rm = await right.metadata();
const W = lm.width + rm.width + 16;
const H = Math.max(lm.height, rm.height);
const leftBuf = await left.toBuffer();
const rightBuf = await right.toBuffer();
await sharp({ create: { width: W, height: H, channels: 3, background: { r: 15, g: 23, b: 42 } } })
  .composite([{ input: leftBuf, top: 0, left: 0 }, { input: rightBuf, top: 0, left: lm.width + 16 }])
  .png()
  .toFile(".composite-karjat-BEFORE-AFTER.png");
console.log("Wrote .composite-karjat-BEFORE-AFTER.png");
