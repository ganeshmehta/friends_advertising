// Composite a sample creative warped to each photo's quad,
// to preview what the runtime visualizer will produce.
import sharp from "sharp";
import fs from "node:fs";

const cases = [
  {
    in: "public/media/karjat-hatnoli.png",
    out: ".composite-karjat.png",
    creative: "public/media/campaign-urban-junction.svg",
    quad: [[0.415, 0.095], [0.630, 0.095], [0.638, 0.330], [0.408, 0.330]],
  },
  {
    in: "public/media/khidkaleshwar-mandir.jpg",
    out: ".composite-khidkaleshwar.png",
    creative: "public/media/campaign-night-neon.svg",
    quad: [[0.365, 0.155], [0.640, 0.150], [0.640, 0.370], [0.370, 0.370]],
  },
];

for (const c of cases) {
  const meta = await sharp(c.in).metadata();
  const W = meta.width;
  const H = meta.height;

  const pts = c.quad.map(([x, y]) => [x * W, y * H]);
  const minX = Math.floor(Math.min(...pts.map((p) => p[0])));
  const minY = Math.floor(Math.min(...pts.map((p) => p[1])));
  const maxX = Math.ceil(Math.max(...pts.map((p) => p[0])));
  const maxY = Math.ceil(Math.max(...pts.map((p) => p[1])));
  const boxW = maxX - minX;
  const boxH = maxY - minY;

  // Get creative as raster sized to the BOX (must match box exactly so mask aligns)
  const sized = await sharp(c.creative).resize(boxW, boxH, { fit: "fill" }).png().toBuffer();

  // Translate quad to box-local coords
  const localPts = pts.map(([x, y]) => [x - minX, y - minY]);
  const polygon = localPts.map((p) => p.join(",")).join(" ");
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${boxW}" height="${boxH}"><polygon points="${polygon}" fill="white"/></svg>`;
  const maskRaster = await sharp(Buffer.from(maskSvg)).resize(boxW, boxH, { fit: "fill" }).png().toBuffer();

  // Mask the resized creative
  const masked = await sharp(sized).composite([{ input: maskRaster, blend: "dest-in" }]).png().toBuffer();

  await sharp(c.in)
    .composite([{ input: masked, left: minX, top: minY }])
    .toFile(c.out);
  console.log("Wrote", c.out);
}

try { fs.unlinkSync(".mask.svg"); } catch {}
