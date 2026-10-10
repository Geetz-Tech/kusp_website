/**
 * Procedural data for the Living Masterplan physical model (no three.js import — pure numbers).
 * Mirrors the SVG masterplan composition: same river, parcel grid, civic node, tree groves and
 * movement hierarchy, expressed in ground (u,v) space. World units: the plate is 100 x 100,
 * centred on the origin (x = (u - .5) * 100, z = (v - .5) * 100).
 */
import { distToPoly, rng, sampleCurve, type V2 } from "@/lib/art/util";

export const W = 100;
export const RIVER: V2[] = [[-0.03, 0.66], [0.12, 0.6], [0.27, 0.68], [0.43, 0.62], [0.57, 0.72], [0.72, 0.62], [0.87, 0.68], [1.03, 0.58]];
export const RIVER_DENSE = sampleCurve(RIVER, 14);
export const CENTER: V2 = [0.5, 0.42];
export const UC = [0.04, 0.17, 0.31, 0.45, 0.58, 0.71, 0.84, 0.97];
export const VC = [0.05, 0.22, 0.38, 0.54, 0.7, 0.86, 0.98];
export const PRIMARY: V2[] = [[0.03, 0.9], [0.28, 0.74], [0.5, 0.5], [0.74, 0.3], [0.97, 0.12]];
export const RAIL: V2[] = [[0.02, 0.2], [0.3, 0.3], [0.52, 0.46], [0.7, 0.54], [0.98, 0.5]];
export const UTILITY_B: V2[] = [[0.08, 0.92], [0.4, 0.6], [0.6, 0.44], [0.92, 0.2]];
export const SWALE: V2[] = [[0.12, 0.9], [0.3, 0.8], [0.5, 0.86], [0.7, 0.8], [0.9, 0.88]];
export const ARMATURE: V2[] = [[0.04, 0.82], [0.3, 0.86], [0.55, 0.84], [0.78, 0.86], [0.96, 0.8]];
export const STATIONS: V2[] = [[0.3, 0.3], [0.52, 0.46], [0.78, 0.53]];
export const WETLANDS: [number, number, number][] = [[0.2, 0.74, 4.2], [0.5, 0.8, 5], [0.8, 0.74, 4.2], [0.36, 0.5, 3.4], [0.66, 0.5, 3.4]];
export const GIS_POINTS: V2[] = [[0.3, 0.3], [0.62, 0.22], [0.78, 0.5], [0.46, 0.78]];
export const PARKS: [number, number, number, number][] = [[0.31, 0.7, 0.45, 0.76], [0.45, 0.06, 0.58, 0.2], [0.58, 0.7, 0.71, 0.76]];
const PARK_BLOCKS = new Set(["2-3", "4-3", "3-0"]);

/** Heights (world units) of the six building classes. */
export const H_CLASSES = [2.2, 3.6, 5.2, 7.4, 10, 13];

const gauss = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => Math.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2));

/** Ground relief: a low rear-left rise, a long gentle swell and a shallow river bed. */
/** River distance field on a 160 x 160 grid (built once) so ground sampling is O(1) instead of a polyline scan. */
const DG = 160;
let riverGrid: Float32Array | null = null;
function riverDist(u: number, v: number): number {
  if (!riverGrid) {
    riverGrid = new Float32Array((DG + 1) * (DG + 1));
    for (let j = 0; j <= DG; j++) for (let i = 0; i <= DG; i++) riverGrid[j * (DG + 1) + i] = distToPoly([i / DG, j / DG], RIVER_DENSE);
  }
  const x = Math.max(0, Math.min(DG - 1e-6, u * DG)), y = Math.max(0, Math.min(DG - 1e-6, v * DG));
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, k = j * (DG + 1) + i;
  const a = riverGrid[k], b = riverGrid[k + 1], c = riverGrid[k + DG + 1], d = riverGrid[k + DG + 2];
  return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
}

export function terrainY(u: number, v: number): number {
  const hill = 1.7 * gauss(u, v, 0.1, 0.1, 0.24, 0.2) + 0.7 * gauss(u, v, 0.94, 0.9, 0.2, 0.18);
  const swell = 0.45 * (0.5 + 0.5 * Math.sin(u * 3.1 + 0.6) * Math.cos(v * 2.3));
  const bed = -0.5 * Math.exp(-((riverDist(u, v) / 0.05) ** 2));
  return hill + swell + bed;
}

export const toWorld = (u: number, v: number): [number, number] => [(u - 0.5) * W, (v - 0.5) * W];

export type Parcel = { i: number; j: number; u0: number; v0: number; u1: number; v1: number; zone: number; phase: number };

export function buildParcels(): Parcel[] {
  const out: Parcel[] = [];
  const g = 0.018;
  for (let i = 0; i < UC.length - 1; i++)
    for (let j = 0; j < VC.length - 1; j++) {
      const u0 = UC[i] + g, u1 = UC[i + 1] - g, v0 = VC[j] + g, v1 = VC[j + 1] - g;
      const c: V2 = [(u0 + u1) / 2, (v0 + v1) / 2];
      if (distToPoly(c, RIVER_DENSE) < 0.085) continue;
      if (PARK_BLOCKS.has(`${i}-${j}`)) continue;
      if (Math.hypot(c[0] - CENTER[0], c[1] - CENTER[1]) < 0.065) continue;
      const d = Math.hypot(c[0] - CENTER[0], (c[1] - CENTER[1]) * 1.2);
      out.push({ i, j, u0, v0, u1, v1, zone: d < 0.26 ? 3 : d < 0.45 ? 2 : 1, phase: (i + j) % 3 });
    }
  return out;
}

const PRIMARY_DENSE = sampleCurve(PRIMARY, 18);
/** True where a footprint centre would sit on a primary, cross or secondary street (kept open for the street hierarchy). */
function onStreet(x: number, z: number): boolean {
  const u = x / W + 0.5, v = z / W + 0.5;
  if (distToPoly([u, v], PRIMARY_DENSE) * W < 3.4) return true;
  if (Math.abs(u - 0.52) * W < 2.7) return true;
  const vs = 0.38 + (0.46 - 0.38) * ((u - 0.02) / 0.96);
  return Math.abs(v - vs) * W < 2.2;
}

export type Building = { x: number; z: number; w: number; d: number; h: number; y0: number; zone: number; civic: number; shade: number };

const CLASS_PICK: Record<number, number[]> = { 3: [2, 3, 4, 4, 5], 2: [1, 2, 2, 3, 4], 1: [0, 0, 1, 1, 2] };

/** 350+ buildings: courtyard rings, slab bars and fine-grain blocks across four parcel patterns. */
export function buildBuildings(parcels: Parcel[]): Building[] {
  const rand = rng(11);
  const out: Building[] = [];
  const base = (u0: number, v0: number, u1: number, v1: number) =>
    Math.min(terrainY(u0, v0), terrainY(u1, v0), terrainY(u1, v1), terrainY(u0, v1)) - 0.9;
  const add = (zone: number, X0: number, Z0: number, X1: number, Z1: number, cls: number, u0: number, v0: number, u1: number, v1: number, jitter = 0.14) => {
    if (onStreet((X0 + X1) / 2, (Z0 + Z1) / 2)) return;
    const h = H_CLASSES[Math.max(0, Math.min(5, cls))] * (1 - jitter / 2 + rand() * jitter);
    const y0 = base(u0, v0, u1, v1);
    out.push({ x: (X0 + X1) / 2, z: (Z0 + Z1) / 2, w: X1 - X0, d: Z1 - Z0, h: h + 0.9, y0, zone, civic: 0, shade: rand() });
  };
  /*
   * Massing hierarchy (reads from the core outward):
   *  - primary urban blocks: four chunky slabs per parcel, one occasional accent tower (core)
   *  - courtyard blocks: a single continuous ring around an open court (core / mid)
   *  - long bars: two-by-two chunky slabs (mid)
   *  - fine grain: low-rise small lots, only in the outer zone
   */
  const civicArea = (x: number, z: number) => {
    const u = x / W + 0.5, v = z / W + 0.5;
    return u > 0.435 && u < 0.64 && v > 0.335 && v < 0.535;
  };
  parcels.forEach((p, idx) => {
    const [X0, Z0] = toWorld(p.u0, p.v0);
    const [X1, Z1] = toWorld(p.u1, p.v1);
    const w = X1 - X0, d = Z1 - Z0;
    const pick = CLASS_PICK[p.zone];
    const cls = () => pick[Math.floor(rand() * pick.length)];
    const sub = (a0: number, b0: number, a1: number, b1: number, c: number, jitter = 0.14) => {
      const cx = X0 + w * ((a0 + a1) / 2), cz = Z0 + d * ((b0 + b1) / 2);
      if (civicArea(cx, cz)) return;
      add(p.zone, X0 + w * a0, Z0 + d * b0, X0 + w * a1, Z0 + d * b1, c, p.u0 + (p.u1 - p.u0) * a0, p.v0 + (p.v1 - p.v0) * b0, p.u0 + (p.u1 - p.u0) * a1, p.v0 + (p.v1 - p.v0) * b1, jitter);
    };
    /** One visual block built from nx x ny lots at equal height with hairline gaps: reads chunky, keeps real lot-level instancing. */
    const block = (a0: number, b0: number, a1: number, b1: number, c: number, nx: number, ny: number) => {
      const g = 0.004;
      for (let i = 0; i < nx; i++)
        for (let j = 0; j < ny; j++)
          sub(a0 + ((a1 - a0) * i) / nx + (i ? g : 0), b0 + ((b1 - b0) * j) / ny + (j ? g : 0), a0 + ((a1 - a0) * (i + 1)) / nx - (i < nx - 1 ? g : 0), b0 + ((b1 - b0) * (j + 1)) / ny - (j < ny - 1 ? g : 0), c, 0.04);
    };
    const kind = p.zone === 3 ? (idx % 2 === 0 ? "primary" : "court") : p.zone === 2 ? (idx % 2 === 0 ? "court" : "bars") : "fine";
    if (kind === "primary") {
      const m = 0.07, g = 0.05, c = Math.min(4, Math.max(3, cls()));
      const accent = rand() < 0.4 ? Math.floor(rand() * 4) : -1;
      let q = 0;
      for (let a = 0; a < 2; a++)
        for (let b = 0; b < 2; b++, q++) block(m + a * (0.5 - m + g / 2) + (a ? g / 2 : 0), m + b * (0.5 - m + g / 2) + (b ? g / 2 : 0), a ? 1 - m : 0.5 - g / 2, b ? 1 - m : 0.5 - g / 2, q === accent ? 5 : c - (rand() < 0.3 ? 1 : 0), q === accent ? 1 : 2, q === accent ? 1 : 2);
    } else if (kind === "court") {
      // one continuous ring: same height, hairline gaps, so it reads as a single courtyard block
      const m = 0.08, t = 0.27, gap = 0.004, c = Math.min(3, cls()), third = (1 - 2 * m) / 6;
      for (let a = 0; a < 6; a++) {
        const a0 = m + a * third + (a ? gap : 0), a1 = m + (a + 1) * third - (a < 5 ? gap : 0);
        sub(a0, m, a1, t, c, 0);
        sub(a0, 1 - t, a1, 1 - m, c, 0);
      }
      const side = (1 - 2 * t - 2 * gap) / 4;
      for (let b = 0; b < 4; b++) {
        const b0 = t + gap + b * side + (b ? gap : 0), b1 = t + gap + (b + 1) * side - (b < 3 ? gap : 0);
        sub(m, b0, t, b1, c, 0);
        sub(1 - t, b0, 1 - m, b1, c, 0);
      }
    } else if (kind === "bars") {
      const m = 0.09, c = Math.min(3, cls());
      for (let b = 0; b < 2; b++) {
        const y0 = m + b * 0.43, y1 = y0 + 0.37;
        block(m, y0, 0.52, y1, c + (b === 0 ? 1 : 0), 3, 1); block(0.57, y0, 1 - m, y1, c, 3, 1);
      }
    } else {
      // fine grain: calm, low, fewer lots
      const m = 0.09;
      for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) sub(m + a * ((1 - 2 * m) / 3) + 0.014, m + b * ((1 - 2 * m) / 4) + 0.014, m + (a + 1) * ((1 - 2 * m) / 3) - 0.014, m + (b + 1) * ((1 - 2 * m) / 4) - 0.014, Math.min(2, cls()));
    }
  });
  // civic anchor: stepped landmark on a plinth (heights from the SVG model, converted to world units)
  const civic = (u0: number, v0: number, u1: number, v1: number, h: number, yb: number, tier: number) => {
    const [X0, Z0] = toWorld(u0, v0), [X1, Z1] = toWorld(u1, v1);
    out.push({ x: (X0 + X1) / 2, z: (Z0 + Z1) / 2, w: X1 - X0, d: Z1 - Z0, h, y0: base(u0, v0, u1, v1) + yb, zone: 4, civic: tier, shade: 0.5 });
  };
  civic(0.485, 0.365, 0.585, 0.475, 3.6, 0, 1);
  civic(0.497, 0.382, 0.573, 0.458, 6.0, 2.6, 2);
  civic(0.522, 0.402, 0.548, 0.438, 8.4, 8.0, 3);
  return out;
}

export type Tree = { x: number; z: number; y: number; r: number; eco: boolean; tone: number };

/** About 300 low-poly canopy masses; the last ~80 only grow in during the sustainability lens. */
export function buildTrees(): Tree[] {
  const rand = rng(23);
  const out: Tree[] = [];
  const add = (u: number, v: number, r: number, eco = false) => {
    const [x, z] = toWorld(u, v);
    out.push({ x, z, y: terrainY(u, v), r, eco, tone: rand() });
  };
  PARKS.forEach(([a, b, c, d]) => {
    for (let n = 0; n < 24; n++) add(a + 0.01 + rand() * (c - a - 0.02), b + 0.008 + rand() * (d - b - 0.016), 1.1 + rand() * 0.8);
  });
  for (let n = 0; n < RIVER_DENSE.length; n += 2) {
    const [u, v] = RIVER_DENSE[n];
    if (u < 0.03 || u > 0.97) continue;
    add(u + (rand() - 0.5) * 0.025, v - 0.075 - rand() * 0.025, 1 + rand() * 0.8);
    add(u + (rand() - 0.5) * 0.025, v + 0.075 + rand() * 0.025, 1 + rand() * 0.8);
  }
  const arm = sampleCurve(ARMATURE, 10);
  for (let n = 0; n < arm.length; n += 2) add(arm[n][0] + (rand() - 0.5) * 0.02, arm[n][1] + (rand() - 0.5) * 0.04, 1 + rand() * 0.9);
  const base = out.length;
  const ecoRand = (cu: number, cv: number, ru: number, rv: number, n: number) => {
    for (let k = 0; k < n; k++) {
      const a = rand() * Math.PI * 2, rr = Math.sqrt(rand());
      add(cu + Math.cos(a) * ru * rr, cv + Math.sin(a) * rv * rr, 1.2 + rand() * 0.9, true);
    }
  };
  ecoRand(0.5, 0.8, 0.12, 0.05, 22);
  ecoRand(0.2, 0.74, 0.07, 0.04, 14);
  ecoRand(0.8, 0.74, 0.07, 0.04, 14);
  ecoRand(0.36, 0.5, 0.05, 0.035, 12);
  ecoRand(0.66, 0.5, 0.05, 0.035, 12);
  void base;
  return out;
}

/** GIS suitability cells, 18 x 12, with the same class logic as the SVG overlay. */
export function buildSuitability(): { u: number; v: number; s: number }[] {
  const cols = 18, rows = 12, rand = rng(33);
  const out: { u: number; v: number; s: number }[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const c: V2 = [(i + 0.5) / cols, (j + 0.5) / rows];
      const river = distToPoly(c, RIVER_DENSE);
      const core = Math.hypot(c[0] - CENTER[0], c[1] - CENTER[1]);
      let s = 0;
      if (river < 0.1) s = 3;
      else if (river < 0.17) s = 2;
      else if (core < 0.38) s = 1;
      else if (rand() > 0.72) s = 1;
      if (s) out.push({ u: c[0], v: c[1], s });
    }
  return out;
}
