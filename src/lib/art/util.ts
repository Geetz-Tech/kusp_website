/** Shared helpers for the KUSP drawing system (deterministic, server-safe). */
export type V2 = [number, number];

export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const r1 = (n: number) => Math.round(n * 10) / 10;
export const pts = (a: V2[]) => a.map((p) => `${r1(p[0])} ${r1(p[1])}`).join(" ");
export const poly = (a: V2[]) => `M${pts(a)}Z`;
export const line = (a: V2[]) => `M${a.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L")}`;

/** Catmull-Rom spline through points, as a cubic bezier path. */
export function smooth(p: V2[], closed = false): string {
  if (p.length < 3) return line(p);
  const n = p.length;
  const get = (i: number) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  const end = closed ? n : n - 1;
  for (let i = 0; i < end; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1: V2 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: V2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return closed ? d + "Z" : d;
}

export type Corners = { L: V2; T: V2; R: V2; B: V2 };
/** Bilinear ground projector: (u,v) in [0,1]^2 -> screen. u runs L->T, v runs L->B. */
export function projector(c: Corners) {
  return (u: number, v: number): V2 => [
    (1 - u) * (1 - v) * c.L[0] + u * (1 - v) * c.T[0] + u * v * c.R[0] + (1 - u) * v * c.B[0],
    (1 - u) * (1 - v) * c.L[1] + u * (1 - v) * c.T[1] + u * v * c.R[1] + (1 - u) * v * c.B[1],
  ];
}

export type Proj = ReturnType<typeof projector>;

/** Extruded block on the ground quad (u0,v0)-(u1,v1). Viewer sits at the B corner. */
export function block(P: Proj, u0: number, v0: number, u1: number, v1: number, h: number, base = 0) {
  const lift = (p: V2, z: number): V2 => [p[0], p[1] - z];
  const a = P(u0, v0), b = P(u1, v0), c = P(u1, v1), d = P(u0, v1);
  const A = lift(a, base + h), B = lift(b, base + h), C = lift(c, base + h), D = lift(d, base + h);
  const a0 = lift(a, base), c0 = lift(c, base), d0 = lift(d, base);
  return {
    roof: poly([A, B, C, D]),
    wl: poly([a0, d0, D, A]),
    wr: poly([d0, c0, C, D]),
    depth: (v0 + v1) / 2 - (u0 + u1) / 2,
  };
}

/** Distance from point to polyline (uv space). */
export function distToPoly(p: V2, poly: V2[]) {
  let best = Infinity;
  for (let i = 0; i < poly.length - 1; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[i + 1];
    const dx = x2 - x1, dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((p[0] - x1) * dx + (p[1] - y1) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(p[0] - (x1 + t * dx), p[1] - (y1 + t * dy)));
  }
  return best;
}

export function sampleCurve(p: V2[], steps = 24): V2[] {
  // dense sample of a catmull-rom curve through p, for distance tests
  const out: V2[] = [];
  const n = p.length;
  const g = (i: number) => p[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++)
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  out.push(p[n - 1]);
  return out;
}
