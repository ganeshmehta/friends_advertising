/**
 * Canvas-based renderer that produces a downloadable JPG of the billboard preview.
 * Approximates the homography by subdividing the source rectangle into a grid of
 * triangles drawn with an affine transform per triangle.
 */
import { denormalizeQuad } from "./perspectiveWarp";
import type { BillboardQuad } from "../app/projects/types";

type Point = [number, number];

type RenderOptions = {
  backplateUrl: string;
  creativeUrl: string;
  quad: BillboardQuad;
  width?: number;
  tint?: string;
  shadowColor?: string;
  sunDirection?: "left" | "right" | "top";
  mimeType?: "image/jpeg" | "image/png";
  quality?: number;
};

const SUBDIVISIONS = 32;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

function bilinear(quad: [Point, Point, Point, Point], u: number, v: number): Point {
  const [tl, tr, br, bl] = quad;
  const a = 1 - u;
  const b = 1 - v;
  return [
    a * b * tl[0] + u * b * tr[0] + u * v * br[0] + a * v * bl[0],
    a * b * tl[1] + u * b * tr[1] + u * v * br[1] + a * v * bl[1],
  ];
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement,
  srcTri: [Point, Point, Point],
  dstTri: [Point, Point, Point]
) {
  const [s0, s1, s2] = srcTri;
  const [d0, d1, d2] = dstTri;

  const x0 = s0[0], y0 = s0[1];
  const x1 = s1[0], y1 = s1[1];
  const x2 = s2[0], y2 = s2[1];
  const u0 = d0[0], v0 = d0[1];
  const u1 = d1[0], v1 = d1[1];
  const u2 = d2[0], v2 = d2[1];

  const det = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
  if (Math.abs(det) < 1e-6) return;

  const a = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / det;
  const b = ((u2 - u0) * (x1 - x0) - (u1 - u0) * (x2 - x0)) / det;
  const c = ((v1 - v0) * (y2 - y0) - (v2 - v0) * (y1 - y0)) / det;
  const d = ((v2 - v0) * (x1 - x0) - (v1 - v0) * (x2 - x0)) / det;
  const e = u0 - a * x0 - b * y0;
  const f = v0 - c * x0 - d * y0;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(d0[0], d0[1]);
  ctx.lineTo(d1[0], d1[1]);
  ctx.lineTo(d2[0], d2[1]);
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, c, b, d, e, f);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

export async function renderBillboardPreview(options: RenderOptions): Promise<string> {
  const {
    backplateUrl,
    creativeUrl,
    quad,
    tint,
    shadowColor,
    sunDirection = "right",
    mimeType = "image/jpeg",
    quality = 0.92,
  } = options;

  const [backplate, creative] = await Promise.all([loadImage(backplateUrl), loadImage(creativeUrl)]);

  const width = options.width ?? backplate.naturalWidth;
  const height = Math.round(width * (backplate.naturalHeight / backplate.naturalWidth));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.drawImage(backplate, 0, 0, width, height);

  const dstQuad = denormalizeQuad(quad, width, height) as [Point, Point, Point, Point];

  if (shadowColor) {
    const dx = sunDirection === "left" ? width * 0.008 : sunDirection === "right" ? -width * 0.008 : 0;
    const dy = sunDirection === "top" ? width * 0.012 : width * 0.006;
    ctx.save();
    ctx.filter = `blur(${Math.max(2, width * 0.006)}px)`;
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.moveTo(dstQuad[0][0] + dx, dstQuad[0][1] + dy);
    ctx.lineTo(dstQuad[1][0] + dx, dstQuad[1][1] + dy);
    ctx.lineTo(dstQuad[2][0] + dx, dstQuad[2][1] + dy);
    ctx.lineTo(dstQuad[3][0] + dx, dstQuad[3][1] + dy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const srcW = creative.naturalWidth;
  const srcH = creative.naturalHeight;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dstQuad[0][0], dstQuad[0][1]);
  ctx.lineTo(dstQuad[1][0], dstQuad[1][1]);
  ctx.lineTo(dstQuad[2][0], dstQuad[2][1]);
  ctx.lineTo(dstQuad[3][0], dstQuad[3][1]);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  const cx = (dstQuad[0][0] + dstQuad[1][0] + dstQuad[2][0] + dstQuad[3][0]) / 4;
  const cy = (dstQuad[0][1] + dstQuad[1][1] + dstQuad[2][1] + dstQuad[3][1]) / 4;
  const BORDER = 0.035;
  const insetQuad = dstQuad.map(([x, y]) => [
    x + (cx - x) * BORDER,
    y + (cy - y) * BORDER,
  ]) as [Point, Point, Point, Point];

  const grid: Point[][] = [];
  for (let i = 0; i <= SUBDIVISIONS; i++) {
    const row: Point[] = [];
    for (let j = 0; j <= SUBDIVISIONS; j++) {
      const u = j / SUBDIVISIONS;
      const v = i / SUBDIVISIONS;
      row.push(bilinear(insetQuad, u, v));
    }
    grid.push(row);
  }

  for (let i = 0; i < SUBDIVISIONS; i++) {
    for (let j = 0; j < SUBDIVISIONS; j++) {
      const u0 = j / SUBDIVISIONS;
      const v0 = i / SUBDIVISIONS;
      const u1 = (j + 1) / SUBDIVISIONS;
      const v1 = (i + 1) / SUBDIVISIONS;
      const s00: Point = [u0 * srcW, v0 * srcH];
      const s10: Point = [u1 * srcW, v0 * srcH];
      const s11: Point = [u1 * srcW, v1 * srcH];
      const s01: Point = [u0 * srcW, v1 * srcH];
      const d00 = grid[i][j];
      const d10 = grid[i][j + 1];
      const d11 = grid[i + 1][j + 1];
      const d01 = grid[i + 1][j];
      drawTriangle(ctx, creative, [s00, s10, s11], [d00, d10, d11]);
      drawTriangle(ctx, creative, [s00, s11, s01], [d00, d11, d01]);
    }
  }

  if (tint) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(dstQuad[0][0], dstQuad[0][1]);
    ctx.lineTo(dstQuad[1][0], dstQuad[1][1]);
    ctx.lineTo(dstQuad[2][0], dstQuad[2][1]);
    ctx.lineTo(dstQuad[3][0], dstQuad[3][1]);
    ctx.closePath();
    ctx.clip();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = Math.max(1.5, width * 0.0025);
  ctx.beginPath();
  ctx.moveTo(dstQuad[0][0], dstQuad[0][1]);
  ctx.lineTo(dstQuad[1][0], dstQuad[1][1]);
  ctx.lineTo(dstQuad[2][0], dstQuad[2][1]);
  ctx.lineTo(dstQuad[3][0], dstQuad[3][1]);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  return canvas.toDataURL(mimeType, quality);
}

export async function sampleAmbientColor(
  backplateUrl: string,
  quad: BillboardQuad
): Promise<{ r: number; g: number; b: number } | null> {
  try {
    const img = await loadImage(backplateUrl);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const targetW = Math.min(256, w);
    const targetH = Math.round(targetW * (h / w));
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const xs = quad.map((p) => p[0]);
    const ys = quad.map((p) => p[1]);
    const minX = Math.max(0, Math.floor(Math.min(...xs) * targetW) - 8);
    const maxX = Math.min(targetW, Math.ceil(Math.max(...xs) * targetW) + 8);
    const minY = Math.max(0, Math.floor(Math.min(...ys) * targetH) - 8);
    const maxY = Math.min(targetH, Math.ceil(Math.max(...ys) * targetH) + 8);
    const innerMinX = Math.floor(Math.min(...xs) * targetW);
    const innerMaxX = Math.ceil(Math.max(...xs) * targetW);
    const innerMinY = Math.floor(Math.min(...ys) * targetH);
    const innerMaxY = Math.ceil(Math.max(...ys) * targetH);

    const data = ctx.getImageData(minX, minY, Math.max(1, maxX - minX), Math.max(1, maxY - minY)).data;

    let r = 0, g = 0, b = 0, n = 0;
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        if (x >= innerMinX && x < innerMaxX && y >= innerMinY && y < innerMaxY) continue;
        const idx = ((y - minY) * (maxX - minX) + (x - minX)) * 4;
        r += data[idx];
        g += data[idx + 1];
        b += data[idx + 2];
        n++;
      }
    }
    if (n === 0) return null;
    return { r: r / n, g: g / n, b: b / n };
  } catch {
    return null;
  }
}
