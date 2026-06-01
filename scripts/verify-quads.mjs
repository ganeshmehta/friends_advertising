import sharp from "sharp";
import fs from "node:fs";

const cases = [
  {
    in: "public/media/karjat-hatnoli.png",
    out: ".verify-karjat-OLD.png",
    quad: [[0.415, 0.095], [0.630, 0.095], [0.638, 0.330], [0.408, 0.330]],
  },
  {
    in: "public/media/khidkaleshwar-mandir.jpg",
    out: ".verify-khid-OLD.png",
    quad: [[0.365, 0.155], [0.640, 0.150], [0.640, 0.370], [0.370, 0.370]],
  },
  {
    in: "public/media/karjat-hatnoli.png",
    out: ".verify-karjat-NEW.png",
    quad: [[0.4375, 0.135], [0.6325, 0.1375], [0.6325, 0.3325], [0.4375, 0.3325]],
  },
  {
    in: "public/media/khidkaleshwar-mandir.jpg",
    out: ".verify-khid-NEW.png",
    quad: [[0.371, 0.180], [0.615, 0.153], [0.615, 0.361], [0.371, 0.361]],
  },
];

for (const c of cases) {
  const meta = await sharp(c.in).metadata();
  const W = meta.width;
  const H = meta.height;
  const pts = c.quad.map(([x, y]) => [Math.round(x * W), Math.round(y * H)]);
  const polygon = pts.map((p) => p.join(",")).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><polygon points="${polygon}" fill="rgba(255,80,80,0.40)" stroke="#ff2222" stroke-width="5"/></svg>`;
  fs.writeFileSync(".overlay.svg", svg);
  await sharp(c.in).composite([{ input: ".overlay.svg" }]).toFile(c.out);
  console.log("Wrote", c.out, "with quad", pts);
}

try { fs.unlinkSync(".overlay.svg"); } catch {}
