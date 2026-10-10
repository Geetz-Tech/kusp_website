import { rng, type V2 } from "./util";

/**
 * Eight sector typologies, defined once as plan geometry (100 x 62 units).
 * Rendered either as a flat line plan (Home) or as an extruded axonometric model (Sectors page),
 * so the two pages share a logic but never an image.
 */
export type Prim =
  | { t: "poly"; p: V2[]; c: string; z?: number; smooth?: boolean }
  | { t: "line"; p: V2[]; c: string; w?: number; smooth?: boolean }
  | { t: "prism"; p: V2[]; h: number; c?: string }
  | { t: "dot"; x: number; y: number; r: number; c: string }
  | { t: "ring"; x: number; y: number; r: number; c: string; w?: number }
  | { t: "note"; x: number; y: number; s: string };

export type SectorKey = "city" | "industrial" | "transport" | "energy" | "civic" | "environment" | "heritage" | "digital";

export const W = 100;
export const H = 62;

const rect = (x: number, y: number, w: number, d: number): V2[] => [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
const bar = (cx: number, cy: number, len: number, wid: number, deg: number): V2[] => {
  const a = (deg * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a);
  const hx = (len / 2) * ux, hy = (len / 2) * uy, wx = (-uy * wid) / 2, wy = (ux * wid) / 2;
  return [[cx - hx - wx, cy - hy - wy], [cx + hx - wx, cy + hy - wy], [cx + hx + wx, cy + hy + wy], [cx - hx + wx, cy - hy + wy]];
};
const bld = (x: number, y: number, w: number, d: number, h: number, c = "bd"): Prim => ({ t: "prism", p: rect(x, y, w, d), h, c });
const ground = (): Prim => ({ t: "poly", p: rect(0, 0, W, H), c: "ground" });

function city(): Prim[] {
  const r = rng(11);
  const o: Prim[] = [ground()];
  o.push({ t: "line", p: [[0, 32], [100, 32]], c: "rd1", w: 5 });
  o.push({ t: "line", p: [[50, 0], [50, 62]], c: "rd2", w: 3.2 });
  [[12, 0, 12, 62], [27, 0, 27, 62], [42, 0, 42, 62], [62, 0, 62, 62], [77, 0, 77, 62], [92, 0, 92, 62]].forEach(([a, b, c, d]) => o.push({ t: "line", p: [[a, b], [c, d]], c: "rd3", w: 1.4 }));
  [[0, 15.5, 100, 15.5], [0, 47.5, 100, 47.5]].forEach(([a, b, c, d]) => o.push({ t: "line", p: [[a, b], [c, d]], c: "rd3", w: 1.4 }));
  const xs = [4, 19, 34, 54, 69, 84];
  const ys = [3, 18, 36, 51];
  const ds = [11, 11, 10, 9];
  xs.forEach((x, i) =>
    ys.forEach((y, j) => {
      if ((i === 2 || i === 3) && (j === 1 || j === 2)) return;
      const dist = Math.hypot(x + 6 - 50, y + 5 - 32);
      const h = 3 + 11 * Math.exp(-dist / 22) + r() * 3;
      const d = ds[j], t = 2.6;
      o.push({ t: "poly", p: rect(x + t, y + t, 12 - 2 * t, d - 2 * t), c: "court" });
      // perimeter block: four bars of differing height, an occasional corner tower
      o.push({ t: "prism", p: rect(x, y, 12, t), h: h * (0.8 + r() * 0.3), c: "bd" });
      o.push({ t: "prism", p: rect(x, y + t, t, d - 2 * t), h: h * 0.75, c: "bd" });
      o.push({ t: "prism", p: rect(x + 12 - t, y + t, t, d - 2 * t), h: h * 0.85, c: "bd" });
      o.push({ t: "prism", p: rect(x, y + d - t, 12, t), h: h * (0.7 + r() * 0.3), c: "bd" });
      if (dist < 26 && r() > 0.35) o.push({ t: "prism", p: rect(x + 12 - 4.2, y + d - 4.2, 4.2, 4.2), h: h * 1.9, c: "bd2" });
    }),
  );
  o.push({ t: "poly", p: rect(35, 19, 26, 26), c: "grn", smooth: false });
  o.push({ t: "poly", p: [[44, 28], [50, 26], [55, 30], [52, 36], [46, 36]], c: "wat", smooth: true });
  o.push({ t: "line", p: [[36, 44], [42, 38], [47, 40], [52, 32], [58, 26], [60, 20]], c: "path", w: 0.8, smooth: true });
  for (let n = 0; n < 16; n++) o.push({ t: "dot", x: 36 + r() * 24, y: 20 + r() * 24, r: 1.1 + r() * 0.8, c: "tree" });
  o.push({ t: "note", x: 3, y: 60, s: "BLOCK / STREET HIERARCHY" });
  return o;
}

function industrial(): Prim[] {
  const r = rng(5);
  const o: Prim[] = [ground()];
  o.push({ t: "line", p: [[0, 52], [100, 46]], c: "rd1", w: 5 });
  o.push({ t: "line", p: [[0, 58.2], [100, 54.8]], c: "rail", w: 0.7 });
  o.push({ t: "line", p: [[0, 59.8], [100, 56.4]], c: "rail", w: 0.7 });
  o.push({ t: "line", p: [[0, 59], [100, 55.6]], c: "ties", w: 2.4 });
  [[34, 4, 34, 49], [64, 4, 64, 48]].forEach(([a, b, c, d]) => o.push({ t: "line", p: [[a, b], [c, d]], c: "rd2", w: 2.4 }));
  [[5, 7, 26, 9], [36, 7, 26, 9], [67, 7, 28, 9], [5, 25, 22, 10], [37, 25, 22, 10], [67, 25, 28, 10]].forEach(([x, y, w, d], n) => {
    o.push({ t: "poly", p: rect(x, y + d, w, 5), c: "pav" });
    o.push({ t: "prism", p: rect(x, y, w, d), h: 3 + (n % 3), c: "bd" });
    for (let k = 1; k < 5; k++) o.push({ t: "line", p: [[x + (w / 5) * k, y + d + 0.6], [x + (w / 5) * k, y + d + 4.4]], c: "stripe", w: 0.3 });
  });
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 3; j++) o.push({ t: "prism", p: rect(8 + i * 3.4, 39 + j * 2.4, 3, 1.5), h: 1.4 + ((i + j) % 2), c: i % 3 === 0 ? "bd2" : "bd" });
  o.push({ t: "poly", p: rect(6, 37.5, 31, 9), c: "yard" });
  o.push(bld(70, 40, 6, 3.5, 2, "bd2"));
  o.push({ t: "ring", x: 82, y: 40, r: 3.6, c: "node" });
  o.push({ t: "line", p: [[12, 20], [90, 20]], c: "dash", w: 0.4 });
  for (let n = 0; n < 5; n++) o.push({ t: "dot", x: 50 + r() * 40, y: 19 + r() * 3, r: 0.7, c: "node" });
  o.push({ t: "note", x: 3, y: 4, s: "LOGISTICS CORRIDOR / CLUSTER" });
  return o;
}

function transport(): Prim[] {
  const o: Prim[] = [ground()];
  o.push({ t: "poly", p: bar(30, 14, 64, 3.6, -9), c: "runway" });
  o.push({ t: "poly", p: bar(36, 24, 56, 3.2, -9), c: "runway" });
  o.push({ t: "line", p: [[0, 18], [60, 7.5]], c: "stripe", w: 0.3 });
  o.push({ t: "line", p: [[8, 28], [64, 18]], c: "stripe", w: 0.3 });
  o.push({ t: "line", p: [[24, 21], [30, 30]], c: "rd3", w: 1.2 });
  o.push({ t: "line", p: [[44, 17], [48, 31]], c: "rd3", w: 1.2 });
  o.push({ t: "poly", p: rect(22, 30, 34, 9), c: "pav" });
  o.push({ t: "prism", p: bar(39, 32, 28, 4, 0), h: 4, c: "bd2" });
  [26, 33, 40, 47].forEach((x) => o.push({ t: "prism", p: rect(x, 34, 2, 5), h: 2, c: "bd" }));
  o.push({ t: "line", p: [[0, 54], [34, 49], [64, 42], [100, 30]], c: "rd1", w: 3.6, smooth: true });
  o.push({ t: "line", p: [[52, 62], [64, 52], [68, 42], [76, 28], [92, 10], [100, 6]], c: "rd1", w: 3, smooth: true });
  [[64, 36], [76, 36], [64, 48], [76, 48]].forEach(([x, y]) => o.push({ t: "ring", x, y, r: 5, c: "loop", w: 0.55 }));
  o.push({ t: "line", p: [[0, 44], [30, 47], [70, 54], [100, 58]], c: "rail", w: 0.8, smooth: true });
  o.push({ t: "line", p: [[0, 45.4], [30, 48.4], [70, 55.4], [100, 59.4]], c: "rail", w: 0.8, smooth: true });
  o.push({ t: "prism", p: bar(28, 49.5, 14, 3.2, 8), h: 2.6, c: "bd2" });
  o.push({ t: "ring", x: 28, y: 54, r: 4.2, c: "loop", w: 0.5 });
  [[8, 50], [40, 52], [84, 58]].forEach(([x, y]) => o.push({ t: "dot", x, y, r: 1.2, c: "node" }));
  o.push({ t: "note", x: 3, y: 4, s: "MULTIMODAL NETWORK" });
  return o;
}

function energy(): Prim[] {
  const o: Prim[] = [ground()];
  for (let g = 0; g < 2; g++)
    for (let i = 0; i < 7; i++) o.push({ t: "prism", p: rect(5 + g * 0, 4 + g * 26 + i * 3.4, 26, 1.7), h: 0.9, c: "solar" });
  o.push({ t: "poly", p: rect(38, 18, 24, 26), c: "yard" });
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) o.push({ t: "prism", p: rect(41 + i * 7, 21 + j * 6.5, 4, 3.6), h: 2.6, c: i === 1 && j === 1 ? "bd2" : "bd" });
  o.push({ t: "line", p: [[0, 31], [38, 31]], c: "tx", w: 0.5 });
  o.push({ t: "line", p: [[62, 25], [100, 10]], c: "tx", w: 0.5 });
  o.push({ t: "line", p: [[62, 37], [100, 50]], c: "tx", w: 0.5 });
  o.push({ t: "line", p: [[50, 0], [50, 18]], c: "tx", w: 0.5 });
  [[8, 31], [20, 31], [32, 31], [70, 22], [80, 18], [90, 14], [70, 40], [80, 44], [90, 48], [50, 6], [50, 12]].forEach(([x, y]) => o.push({ t: "dot", x, y, r: 0.9, c: "pylon" }));
  [[72, 8, 4.2], [84, 7, 3.2], [88, 22, 4.8], [76, 28, 3.4]].forEach(([x, y, r]) => o.push({ t: "ring", x, y, r, c: "tank", w: 0.8 }));
  o.push({ t: "line", p: [[72, 12.2], [72, 18], [88, 18], [88, 17.2]], c: "pipe", w: 0.8 });
  o.push({ t: "line", p: [[84, 10.2], [84, 18]], c: "pipe", w: 0.8 });
  o.push({ t: "line", p: [[76, 31.4], [76, 36], [64, 36]], c: "pipe", w: 0.8 });
  [[72, 52], [84, 54], [92, 50]].forEach(([x, y]) => {
    o.push({ t: "dot", x, y, r: 0.9, c: "node" });
    for (let k = 0; k < 3; k++) {
      const a = (k * 2 * Math.PI) / 3 - 1.2;
      o.push({ t: "line", p: [[x, y], [x + Math.cos(a) * 5, y + Math.sin(a) * 5]], c: "turb", w: 0.35 });
    }
  });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) o.push({ t: "prism", p: rect(8 + i * 6, 54 + j * 3.2, 4.4, 2.2), h: 1.5 + ((i + j) % 3) * 0.8, c: "bd" });
  o.push({ t: "note", x: 3, y: 61, s: "UTILITY MATRIX" });
  return o;
}

function civic(): Prim[] {
  const o: Prim[] = [ground()];
  o.push({ t: "poly", p: rect(8, 3, 84, 56), c: "fence" });
  o.push({ t: "poly", p: rect(24, 18, 20, 22), c: "grn" });
  o.push({ t: "poly", p: rect(56, 18, 20, 22), c: "grn" });
  o.push({ t: "poly", p: rect(38, 42, 24, 14), c: "pav" });
  for (let k = 0; k < 5; k++) o.push({ t: "line", p: [[38 + k * 2.4, 42 + k * 1.2], [62 - k * 2.4, 42 + k * 1.2]], c: "stripe", w: 0.3 });
  o.push({ t: "line", p: [[50, 58], [50, 8]], c: "axis", w: 0.8 });
  o.push({ t: "prism", p: rect(32, 6, 36, 7), h: 7, c: "bd2" });
  o.push({ t: "prism", p: rect(32, 13, 7, 17), h: 5, c: "bd" });
  o.push({ t: "prism", p: rect(61, 13, 7, 17), h: 5, c: "bd" });
  [[12, 8], [80, 8], [12, 28], [80, 28]].forEach(([x, y]) => o.push({ t: "prism", p: rect(x, y, 9, 11), h: 3.4, c: "bd" }));
  [[12, 44], [80, 44]].forEach(([x, y]) => o.push({ t: "prism", p: rect(x, y, 9, 9), h: 2.6, c: "bd" }));
  o.push({ t: "ring", x: 50, y: 34, r: 2.4, c: "node", w: 0.6 });
  o.push({ t: "dot", x: 50, y: 34, r: 0.9, c: "pylon" });
  o.push({ t: "line", p: [[4, 62], [4, 0]], c: "rd2", w: 1.6 });
  o.push({ t: "line", p: [[96, 62], [96, 0]], c: "rd2", w: 1.6 });
  for (let n = 0; n < 7; n++) {
    o.push({ t: "dot", x: 25 + n * 8, y: 16, r: 0.9, c: "tree" });
    o.push({ t: "dot", x: 25 + n * 8, y: 41, r: 0.9, c: "tree" });
  }
  o.push({ t: "note", x: 3, y: 61, s: "CIVIC CAMPUS / AXIS" });
  return o;
}

function environment(): Prim[] {
  const r = rng(17);
  const o: Prim[] = [ground()];
  const blob = (cx: number, cy: number, rx: number, ry: number, seed: number): V2[] => {
    const q = rng(seed);
    return Array.from({ length: 11 }, (_, i) => {
      const a = (i / 11) * Math.PI * 2;
      const k = 0.86 + q() * 0.28;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as V2;
    });
  };
  for (let l = 0; l < 7; l++) o.push({ t: "poly", p: blob(62 - l * 0.8, 22 + l * 0.2, 34 - l * 4.4, 19 - l * 2.4, 3), c: "terrace", z: l * 1.5, smooth: true });
  o.push({ t: "poly", p: [[42, 36], [52, 30], [64, 24], [66, 28], [56, 36], [44, 44], [30, 50], [14, 58], [8, 56], [26, 46]], c: "flood", smooth: true });
  o.push({ t: "line", p: [[64, 22], [52, 32], [38, 40], [24, 48], [10, 56], [0, 60]], c: "wat", w: 2.4, smooth: true });
  o.push({ t: "line", p: [[84, 26], [72, 32], [60, 34], [52, 32]], c: "wat", w: 1.3, smooth: true });
  o.push({ t: "line", p: [[30, 20], [34, 30], [38, 40]], c: "wat", w: 1.2, smooth: true });
  o.push({ t: "line", p: [[16, 32], [24, 40], [24, 48]], c: "wat", w: 1, smooth: true });
  o.push({ t: "line", p: [[72, 12], [64, 22]], c: "wat", w: 0.9, smooth: true });
  [[52, 32, 5, 3], [38, 41, 4, 2.6], [22, 49, 4.5, 2.6]].forEach(([x, y, rx, ry], n) => o.push({ t: "poly", p: blob(x, y, rx, ry, 8 + n), c: "wetland", smooth: true }));
  for (let n = 0; n < 70; n++) {
    const x = 20 + r() * 78, y = 2 + r() * 30;
    if (((x - 62) / 34) ** 2 + ((y - 22) / 19) ** 2 > 0.85) continue;
    o.push({ t: "dot", x, y, r: 0.7 + r() * 0.8, c: "tree" });
  }
  [[56, 38], [44, 36], [30, 46], [18, 52], [60, 28]].forEach(([x, y]) => o.push({ t: "dot", x, y, r: 0.9, c: "tree" }));
  o.push({ t: "note", x: 3, y: 61, s: "WATERSHED / BLUE-GREEN SYSTEM" });
  return o;
}

function heritage(): Prim[] {
  const r = rng(23);
  const o: Prim[] = [ground()];
  const cx = 50, cy = 31;
  const wall: V2[] = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const k = 0.92 + (i % 3) * 0.06;
    return [cx + Math.cos(a) * 41 * k, cy + Math.sin(a) * 27 * k] as V2;
  });
  o.push({ t: "poly", p: wall, c: "wallfill" });
  o.push({ t: "poly", p: wall, c: "wall" });
  wall.forEach(([x, y]) => o.push({ t: "ring", x, y, r: 1.3, c: "bastion", w: 0.5 }));
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.05;
    o.push({ t: "line", p: [[cx + Math.cos(a) * 8, cy + Math.sin(a) * 6], [cx + Math.cos(a) * 40, cy + Math.sin(a) * 26]], c: "rd3", w: 0.9 });
  }
  const rings = [10, 16.5, 23, 29.5];
  rings.forEach((rad, ri) => {
    const n = 9 + ri * 5;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2 + r() * 0.04, a1 = ((i + 0.78) / n) * Math.PI * 2;
      const r0 = rad + r() * 0.8, r1 = rad + 4.4 + r() * 1.2;
      const P = (rr: number, a: number): V2 => [cx + Math.cos(a) * rr * 1.46, cy + Math.sin(a) * rr * 0.92];
      o.push({ t: "prism", p: [P(r0, a0), P(r0, a1), P(r1, a1 - 0.01), P(r1, a0 + 0.01)], h: 1.6 + r() * 2.4, c: i % 7 === 0 ? "bd2" : "bd" });
    }
    o.push({ t: "ring", x: cx, y: cy, r: rad - 1.4, c: "lane", w: 0.35 });
  });
  const oct: V2[] = Array.from({ length: 8 }, (_, i) => [cx + Math.cos((i / 8) * Math.PI * 2 + 0.39) * 3.6, cy + Math.sin((i / 8) * Math.PI * 2 + 0.39) * 3.6] as V2);
  o.push({ t: "ring", x: cx, y: cy, r: 7.2, c: "steps", w: 0.5 });
  o.push({ t: "ring", x: cx, y: cy, r: 5.4, c: "steps", w: 0.5 });
  o.push({ t: "prism", p: oct, h: 9, c: "bd2" });
  o.push({ t: "note", x: 3, y: 61, s: "PRECINCT GRAIN / HERITAGE CORE" });
  return o;
}

function digital(): Prim[] {
  const o: Prim[] = [ground()];
  for (let g = 6; g < 100; g += 6) o.push({ t: "line", p: [[g, 0], [g, 62]], c: "grid", w: 0.12 });
  for (let g = 6; g < 62; g += 6) o.push({ t: "line", p: [[0, g], [100, g]], c: "grid", w: 0.12 });
  [32, 24, 16, 8].forEach((rad) => o.push({ t: "ring", x: 50, y: 31, r: rad, c: "cover", w: 0.3 }));
  o.push({ t: "poly", p: rect(36, 19, 28, 24), c: "ringroad" });
  [[6, 8], [6, 20], [6, 32], [6, 44], [66, 8], [66, 44]].forEach(([x, y]) => o.push({ t: "prism", p: rect(x, y, 28, 5), h: 3, c: "bd" }));
  [[66, 20], [66, 32]].forEach(([x, y]) => o.push({ t: "prism", p: rect(x, y, 28, 5), h: 2.4, c: "bd2" }));
  o.push({ t: "line", p: [[0, 31], [36, 31]], c: "fiber", w: 0.5 });
  o.push({ t: "line", p: [[64, 31], [100, 31]], c: "fiber", w: 0.5 });
  o.push({ t: "line", p: [[50, 0], [50, 19]], c: "fiber", w: 0.5 });
  o.push({ t: "line", p: [[50, 43], [50, 62]], c: "fiber", w: 0.5 });
  o.push({ t: "line", p: [[36, 19], [18, 6], [4, 6]], c: "fiber", w: 0.4 });
  o.push({ t: "line", p: [[64, 43], [82, 56], [96, 56]], c: "fiber", w: 0.4 });
  const oct: V2[] = Array.from({ length: 8 }, (_, i) => [50 + Math.cos((i / 8) * Math.PI * 2 + 0.39) * 3.2, 31 + Math.sin((i / 8) * Math.PI * 2 + 0.39) * 3.2] as V2);
  o.push({ t: "prism", p: rect(44, 25, 12, 12), h: 4, c: "bd" });
  o.push({ t: "prism", p: oct, h: 15, c: "bd2" });
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) o.push({ t: "dot", x: 8 + i * 6.4, y: 54 + (j % 2) * 4 - 6 + j * 0.6, r: 0.55, c: "node" });
  [[18, 6], [4, 6], [82, 56], [96, 56], [50, 6], [50, 56], [14, 31], [86, 31]].forEach(([x, y]) => o.push({ t: "ring", x, y, r: 1.4, c: "node", w: 0.5 }));
  o.push({ t: "note", x: 3, y: 61, s: "DATA FIELD / SMART PLACES" });
  return o;
}

export const TYPOLOGIES: Record<SectorKey, () => Prim[]> = { city, industrial, transport, energy, civic, environment, heritage, digital };
