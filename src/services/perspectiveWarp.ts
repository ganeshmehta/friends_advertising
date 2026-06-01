/**
 * Perspective-warp math utility. Given a flat rectangular source and a destination
 * quadrilateral, produces a CSS `matrix3d(...)` transform that warps the source
 * so its corners land exactly on the destination corners (classical 2D homography
 * packed into a 4x4 matrix).
 */
import type { BillboardQuad } from "../app/projects/types";

type Point = [number, number];
type Quad = [Point, Point, Point, Point];
type Mat3 = [number, number, number, number, number, number, number, number, number];

function adj(m: Mat3): Mat3 {
  return [
    m[4] * m[8] - m[5] * m[7],
    m[2] * m[7] - m[1] * m[8],
    m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8],
    m[0] * m[8] - m[2] * m[6],
    m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6],
    m[1] * m[6] - m[0] * m[7],
    m[0] * m[4] - m[1] * m[3],
  ];
}

function multmm(a: Mat3, b: Mat3): Mat3 {
  const c = new Array(9) as Mat3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[i * 3 + k] * b[k * 3 + j];
      c[i * 3 + j] = s;
    }
  }
  return c;
}

function multmv(m: Mat3, v: [number, number, number]): [number, number, number] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

function basisToPoints(p1: Point, p2: Point, p3: Point, p4: Point): Mat3 {
  const m: Mat3 = [p1[0], p2[0], p3[0], p1[1], p2[1], p3[1], 1, 1, 1];
  const v = multmv(adj(m), [p4[0], p4[1], 1]);
  return multmm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}

function general2DProjection(src: Quad, dst: Quad): Mat3 {
  const s = basisToPoints(src[0], src[1], src[2], src[3]);
  const d = basisToPoints(dst[0], dst[1], dst[2], dst[3]);
  return multmm(d, adj(s));
}

export function quadToMatrix3d(width: number, height: number, dst: Quad): string {
  const src: Quad = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
  const t = general2DProjection(src, dst);
  for (let i = 0; i < 9; i++) t[i] = t[i] / t[8];
  const m = [
    t[0], t[3], 0, t[6],
    t[1], t[4], 0, t[7],
    0,    0,    1, 0,
    t[2], t[5], 0, t[8],
  ];
  return `matrix3d(${m.join(",")})`;
}

export function parseFormatAspect(format: string): number {
  const match = format.match(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/);
  if (!match) return 2;
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || h === 0) return 2;
  return w / h;
}

export function deriveDefaultQuad(format: string): BillboardQuad {
  const aspect = parseFormatAspect(format);
  const boardW = 0.64;
  const boardH = Math.min(0.5, boardW / aspect);
  const left = (1 - boardW) / 2;
  const top = 0.22;
  const right = left + boardW;
  const bottom = top + boardH;
  const keystone = 0.015;
  return [
    [left, top],
    [right, top],
    [right - keystone, bottom],
    [left + keystone, bottom],
  ];
}

export function denormalizeQuad(
  quad: BillboardQuad,
  pixelWidth: number,
  pixelHeight: number
): Quad {
  return quad.map(([x, y]) => [x * pixelWidth, y * pixelHeight]) as Quad;
}
