import type React from "react";
import { H, TYPOLOGIES, W, type Prim, type SectorKey } from "@/lib/art/typologies";
import { line, poly, r1, smooth, type V2 } from "@/lib/art/util";

/**
 * Sector typology renderer.
 *  - "plan": flat technical plan with cast-shadow depth cues (Home / REACH, on near-black)
 *  - "axo":  oblique model view with extruded massing and terraced terrain (Sectors page)
 */
type Mode = "plan" | "axo";

const A = (20 * Math.PI) / 180;
const CA = Math.cos(A), SA = Math.sin(A);
const VIEW: V2 = [SA, CA]; // plan direction pointing at the viewer in axo

function makeProj(mode: Mode) {
  if (mode === "plan") {
    const k = 8;
    return { k, P: (x: number, y: number) => [x * k, y * k] as V2, vb: `0 0 ${W * k} ${H * k}` };
  }
  const k = 6.6, kz = 6.6, ox = 21 * k + 20, oy = 70;
  return {
    k,
    P: (x: number, y: number, z = 0) => [ox + (x * CA - y * SA) * k, oy + (x * SA + y * CA) * 0.55 * k - z * kz] as V2,
    vb: `0 0 800 480`,
  };
}

const centroid = (p: V2[]): V2 => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];

export function Typology({ kind, mode, className }: { kind: SectorKey; mode: Mode; className?: string }) {
  const prims = TYPOLOGIES[kind]();
  const { k, P, vb } = makeProj(mode);
  const proj = P as (x: number, y: number, z?: number) => V2;
  const sw = (w = 1) => r1(w * k * (mode === "axo" ? 0.85 : 0.72));

  const flat: React.ReactNode[] = [];
  const marks: React.ReactNode[] = [];
  const solids: { d: number; node: React.ReactNode }[] = [];
  const shadows: React.ReactNode[] = [];

  const ringPts = (x: number, y: number, r: number, z = 0) =>
    Array.from({ length: 40 }, (_, i) => proj(x + Math.cos((i / 40) * Math.PI * 2) * r, y + Math.sin((i / 40) * Math.PI * 2) * r, z));

  const terraces = prims.filter((p): p is Extract<Prim, { t: "poly" }> => p.t === "poly").sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  terraces.forEach((p, n) => {
    const pts = p.p.map(([x, y]) => proj(x, y, mode === "axo" ? (p.z ?? 0) * 0.5 : 0));
    flat.push(<path key={`p${n}`} className={`ty-${p.c}`} d={p.smooth ? smooth(pts, true) : poly(pts)} />);
  });

  prims.forEach((p, n) => {
    if (p.t === "line") {
      const pts = p.p.map(([x, y]) => proj(x, y));
      marks.push(<path key={`l${n}`} className={`ty-${p.c}`} d={p.smooth ? smooth(pts) : line(pts)} strokeWidth={sw(p.w)} />);
    } else if (p.t === "ring") {
      marks.push(<path key={`r${n}`} className={`ty-${p.c}`} d={smooth(ringPts(p.x, p.y, p.r), true)} strokeWidth={sw(p.w ?? 0.5)} />);
    } else if (p.t === "dot") {
      const [x, y] = proj(p.x, p.y, p.c === "tree" && mode === "axo" ? 0.8 : 0);
      const r = p.r * k * (mode === "axo" ? 0.8 : 1);
      if (p.c === "tree" && mode === "axo") marks.push(<ellipse key={`d${n}`} className={`ty-${p.c}`} cx={r1(x)} cy={r1(y)} rx={r1(r)} ry={r1(r * 0.8)} />);
      else marks.push(<circle key={`d${n}`} className={`ty-${p.c}`} cx={r1(x)} cy={r1(y)} r={r1(r)} />);
    } else if (p.t === "note" && mode === "plan") {
      marks.push(<text key={`n${n}`} className="ty-note" x={p.x * k} y={p.y * k}>{p.s}</text>);
    } else if (p.t === "prism") {
      const c = centroid(p.p);
      const cls = p.c ?? "bd";
      if (mode === "plan") {
        const off = Math.min(p.h, 10) * 0.55 * k * 0.5;
        shadows.push(<path key={`s${n}`} className="ty-shadow" d={poly(p.p.map(([x, y]) => [x * k + off, y * k + off * 0.7] as V2))} />);
        solids.push({ d: 0, node: <path key={`b${n}`} className={`ty-${cls} ty-solid`} d={poly(p.p.map(([x, y]) => proj(x, y)))} /> });
        return;
      }
      const z = p.h * 0.42;
      const walls: React.ReactNode[] = [];
      p.p.forEach((a, i) => {
        const b = p.p[(i + 1) % p.p.length];
        let nx = b[1] - a[1], ny = -(b[0] - a[0]);
        const mx = (a[0] + b[0]) / 2 - c[0], my = (a[1] + b[1]) / 2 - c[1];
        if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
        const len = Math.hypot(nx, ny) || 1;
        const facing = (nx * VIEW[0] + ny * VIEW[1]) / len;
        if (facing <= 0.02) return;
        const shade = (nx / len) * CA - (ny / len) * SA > 0 ? "r" : "l";
        walls.push(<path key={i} className={`ty-wall ty-wall-${shade}`} d={poly([proj(a[0], a[1]), proj(b[0], b[1]), proj(b[0], b[1], z), proj(a[0], a[1], z)])} />);
      });
      solids.push({
        d: c[0] * VIEW[0] + c[1] * VIEW[1],
        node: (
          <g key={`b${n}`} className={`ty-solid ty-${cls}`}>
            {walls}
            <path className="ty-roof" d={poly(p.p.map(([x, y]) => proj(x, y, z)))} />
          </g>
        ),
      });
    }
  });

  solids.sort((a, b) => a.d - b.d);
  const staged = solids.map((s, i) => (
    <g key={i} className="ty-rise" style={{ "--i": i } as React.CSSProperties}>
      {s.node}
    </g>
  ));

  return (
    <svg className={`ty-svg typology--${mode} ${className ?? ""}`} viewBox={vb} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <g className="ty-flat">{flat}</g>
      <g className="ty-shadows">{shadows}</g>
      <g className="ty-marks">{marks}</g>
      <g className="ty-solids">{staged}</g>
    </svg>
  );
}
