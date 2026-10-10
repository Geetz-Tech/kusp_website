"use client";

import type React from "react";
import { block, distToPoly, line, poly, projector, rng, sampleCurve, smooth, type Proj, type V2 } from "@/lib/art/util";

/**
 * Home "Living Masterplan" — a low-oblique physical planning model.
 * Everything is drawn in ground (u,v) space and projected, so roads, river, parcels,
 * massing and overlays always register. Layer groups keep the class names the Home
 * state CSS (reading / lens / framework) targets.
 */

const CORNERS = { L: [111, 242], T: [537, 121], R: [861, 278], B: [430, 510] } as const;
const P: Proj = projector({ L: [...CORNERS.L], T: [...CORNERS.T], R: [...CORNERS.R], B: [...CORNERS.B] });

const RIVER: V2[] = [[-0.03, 0.66], [0.12, 0.6], [0.27, 0.68], [0.43, 0.62], [0.57, 0.72], [0.72, 0.62], [0.87, 0.68], [1.03, 0.58]];
const RIVER_DENSE = sampleCurve(RIVER);
const CENTER: V2 = [0.5, 0.42];
const PARK_BLOCKS = new Set(["2-3", "4-3", "3-0"]);
const UC = [0.04, 0.17, 0.31, 0.45, 0.58, 0.71, 0.84, 0.97];
const VC = [0.05, 0.22, 0.38, 0.54, 0.7, 0.86, 0.98];

type Parcel = { i: number; j: number; u0: number; v0: number; u1: number; v1: number; zone: number };

function buildParcels(): Parcel[] {
  const out: Parcel[] = [];
  const g = 0.018;
  for (let i = 0; i < UC.length - 1; i++)
    for (let j = 0; j < VC.length - 1; j++) {
      const u0 = UC[i] + g, u1 = UC[i + 1] - g, v0 = VC[j] + g, v1 = VC[j + 1] - g;
      const c: V2 = [(u0 + u1) / 2, (v0 + v1) / 2];
      if (distToPoly(c, RIVER_DENSE) < 0.085) continue;
      if (PARK_BLOCKS.has(`${i}-${j}`)) continue;
      const civic = Math.hypot(c[0] - CENTER[0], c[1] - CENTER[1]) < 0.065;
      if (civic) continue;
      const d = Math.hypot(c[0] - CENTER[0], (c[1] - CENTER[1]) * 1.2);
      out.push({ i, j, u0, v0, u1, v1, zone: d < 0.26 ? 3 : d < 0.45 ? 2 : 1 });
    }
  return out;
}

const PARCELS = buildParcels();

function buildMasses() {
  const rand = rng(7);
  const out: { b: ReturnType<typeof block>; tall: boolean; k: number }[] = [];
  PARCELS.forEach((p, idx) => {
    const du = p.u1 - p.u0, dv = p.v1 - p.v0;
    const pattern = idx % 3;
    const hMax = p.zone === 3 ? 58 : p.zone === 2 ? 34 : 18;
    const hMin = p.zone === 3 ? 26 : p.zone === 2 ? 15 : 8;
    const mk = (a0: number, b0: number, a1: number, b1: number, h: number) => {
      const b = block(P, p.u0 + du * a0, p.v0 + dv * b0, p.u0 + du * a1, p.v0 + dv * b1, h);
      out.push({ b, tall: h > hMax * 0.8, k: p.zone });
    };
    const h = () => hMin + rand() * (hMax - hMin);
    if (pattern === 0) {
      mk(0.1, 0.12, 0.9, 0.5, h());
      mk(0.1, 0.58, 0.55, 0.9, h() * 0.7);
      mk(0.62, 0.58, 0.9, 0.9, h() * 0.5);
    } else if (pattern === 1) {
      mk(0.12, 0.1, 0.46, 0.9, h());
      mk(0.54, 0.1, 0.9, 0.55, h() * 0.8);
      mk(0.54, 0.63, 0.9, 0.9, h() * 0.55);
    } else {
      mk(0.1, 0.1, 0.9, 0.9, h() * 0.85);
    }
  });
  // civic anchor: stepped landmark on a raised plinth, beside the plaza
  const civic: ReturnType<typeof block>[] = [
    block(P, 0.49, 0.37, 0.58, 0.47, 10),
    block(P, 0.5, 0.385, 0.57, 0.455, 22, 10),
    block(P, 0.523, 0.402, 0.547, 0.438, 30, 32),
  ];
  civic.forEach((b) => out.push({ b, tall: true, k: 4 }));
  return out.sort((a, b) => a.b.depth - b.b.depth);
}

const MASSES = buildMasses();

function trees() {
  const rand = rng(21);
  const out: [number, number, number][] = [];
  const add = (u: number, v: number, r: number) => {
    const [x, y] = P(u, v);
    out.push([x, y, r]);
  };
  // park blocks
  [[0.31, 0.62, 0.45, 0.7], [0.58, 0.7, 0.71, 0.76], [0.45, 0.05, 0.58, 0.22]].forEach(([a, b, c, d]) => {
    for (let n = 0; n < 9; n++) add(a + rand() * (c - a), b + rand() * (d - b), 5 + rand() * 6);
  });
  // river edge groves
  for (let n = 0; n < RIVER_DENSE.length; n += 6) {
    const [u, v] = RIVER_DENSE[n];
    if (u < 0.03 || u > 0.97) continue;
    add(u + (rand() - 0.5) * 0.02, v - 0.06 - rand() * 0.02, 4 + rand() * 4);
    add(u + (rand() - 0.5) * 0.02, v + 0.06 + rand() * 0.02, 4 + rand() * 4);
  }
  return out;
}

function suitability() {
  const cols = 18, rows = 12;
  const classes: string[][] = [[], [], [], []];
  const rand = rng(33);
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const u0 = i / cols, u1 = (i + 1) / cols, v0 = j / rows, v1 = (j + 1) / rows;
      const c: V2 = [(u0 + u1) / 2, (v0 + v1) / 2];
      const river = distToPoly(c, RIVER_DENSE);
      const core = Math.hypot(c[0] - CENTER[0], c[1] - CENTER[1]);
      let s = 0;
      if (river < 0.1) s = 3;
      else if (river < 0.17) s = 2;
      else if (core < 0.38) s = 1;
      else if (rand() > 0.72) s = 1;
      if (s === 0) continue;
      classes[s].push(poly([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]));
    }
  return classes.map((c) => c.join(""));
}

const SUIT = suitability();
const TREES = trees();

const road = (a: V2, b: V2) => line([P(...a), P(...b)]);
const roadCurve = (pts: V2[]) => smooth(pts.map((p) => P(...p)));

/* Scenario mini-plans (Optimise: A / B / Preferred) — three real alternative layouts */
function Scenario({ kind, className, label }: { kind: "a" | "b" | "p"; className: string; label: string }) {
  const rand = rng(kind === "a" ? 3 : kind === "b" ? 5 : 9);
  const c = { L: P(0.26, 0.16), T: P(0.74, 0.16), R: P(0.74, 0.58), B: P(0.26, 0.58) };
  const S = projector(c);
  const [tx, ty] = P(0.27, 0.12);
  const items: { b: ReturnType<typeof block>; d: number }[] = [];
  const cols = kind === "b" ? 5 : 4, rows = kind === "b" ? 4 : 3;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const skip = (kind === "a" && (i + j) % 2 === 0) || (kind === "p" && i === 1 && j === 1);
      if (skip) continue;
      const u0 = (i + 0.14) / cols, u1 = (i + 0.84) / cols, v0 = (j + 0.14) / rows, v1 = (j + 0.84) / rows;
      const hh = kind === "a" ? 7 + rand() * 7 : kind === "b" ? 16 + rand() * 30 : 9 + rand() * 20;
      const b = block(S, u0, v0, u1, v1, hh);
      items.push({ b, d: b.depth });
    }
  items.sort((x, y) => x.d - y.d);
  const green: V2[] = kind === "a" ? [[0.16, 0.2], [0.6, 0.55], [0.84, 0.3], [0.4, 0.12]] : kind === "p" ? [[0.3, 0.45], [0.6, 0.55]] : [];
  return (
    <g className={`scenario ${className}`}>
      <path d={poly([c.L, c.T, c.R, c.B])} className="scenario-base" />
      {kind === "a" && <path d={roadCurve([[0.02, 0.5], [0.3, 0.42], [0.55, 0.52], [0.98, 0.4]]).replace(/^M/, "M")} className="scenario-water" transform="translate(0 0)" />}
      {green.map(([u, v]) => {
        const [x, y] = S(u, v);
        return <circle key={`${u}${v}`} cx={x} cy={y} r={kind === "a" ? 13 : 10} className="scenario-green" />;
      })}
      {items.map(({ b }, n) => (
        <g key={n}>
          <path className="roof" d={b.roof} />
          <path className="wall-l" d={b.wl} />
          <path className="wall-r" d={b.wr} />
        </g>
      ))}
      {kind === "p" && <path d={line([S(0.02, 0.92), S(0.5, 0.5), S(0.98, 0.1)])} className="scenario-route" />}
      <text className="scenario-label" x={tx} y={ty}>{label}</text>
    </g>
  );
}

/**
 * Optional overlay layers. Every instance draws the shared base model; overlays are only emitted
 * where that section's states can actually reveal them (the rest were always opacity 0).
 */
export type PlanLayer = "phasing" | "intensity" | "transit" | "ecology" | "gis" | "reading" | "scenario" | "final";
const ALL_LAYERS: PlanLayer[] = ["phasing", "intensity", "transit", "ecology", "gis", "reading", "scenario", "final"];

export function MasterplanSvg({ layers = ALL_LAYERS }: { layers?: PlanLayer[] }) {
  const on = (l: PlanLayer) => layers.includes(l);
  const contour = (v: number, off: number) =>
    smooth(
      Array.from({ length: 7 }, (_, n) => {
        const u = -0.15 + (n / 6) * 1.3;
        const [x, y] = P(u, v);
        return [x, y - 38 - off * 22 + Math.sin(n * 1.3 + off * 2) * 18] as V2;
      }),
    );
  const [cx, cy] = P(CENTER[0] + 0.02, CENTER[1] + 0.04);
  const plaza = poly([P(0.44, 0.44), P(0.5, 0.44), P(0.5, 0.52), P(0.44, 0.52)]);
  const floodHatch: string[] = [];
  for (let n = 0; n < 9; n++) {
    const u = 0.14 + n * 0.035;
    floodHatch.push(line([P(u, 0.54), P(u + 0.04, 0.72)]));
  }
  const phase: [number, Parcel][] = PARCELS.map((p) => [(p.i + p.j) % 3, p]);
  const intensity = PARCELS.filter((p) => p.zone >= 2);
  const ecologyPatches = [P(0.2, 0.74), P(0.5, 0.8), P(0.8, 0.74), P(0.36, 0.5), P(0.66, 0.5)];

  return (
    <div className="masterplan" aria-hidden="true">
      <svg viewBox="0 0 960 650" className="masterplan-svg" focusable="false">
        <g className="terrain-layer">
          {[0.12, 0.34, 0.58, 0.82].map((v, n) => (
            <path key={n} className={`contour c${n + 1}`} d={contour(v, n)} />
          ))}
          <path className="plate-edge" d="M101 250 536 112 874 276 431 523Z" />
          <path className="plate" d="M111 242 537 121 861 278 430 510Z" />
          <path className="plate-side" d="M430 510 861 278 861 295 430 530Z" />
          <path className="plate-front" d="M111 242 430 510 430 530 111 260Z" />
          <path className="plate-relief" d={`${line([P(0.04, 0.02), P(0.5, 0.03), P(0.96, 0.02)])}M${P(0.03, 0.96).join(" ")}L${P(0.97, 0.96).join(" ")}`} />
        </g>
        <g className="water-layer">
          <path className="river-bank" d={roadCurve(RIVER.map(([u, v]) => [u, v - 0.045] as V2)) + roadCurve(RIVER.map(([u, v]) => [u, v + 0.045] as V2))} />
          <path className="river" pathLength={1} d={roadCurve(RIVER)} />
          <path className="green-armature" pathLength={1} d={roadCurve([[0.04, 0.82], [0.3, 0.86], [0.55, 0.84], [0.78, 0.86], [0.96, 0.8]])} />
          <path className="park" d={poly([P(0.31, 0.7), P(0.45, 0.7), P(0.45, 0.76), P(0.31, 0.76)])} />
          <path className="park" d={poly([P(0.45, 0.06), P(0.58, 0.06), P(0.58, 0.2), P(0.45, 0.2)])} />
          <g className="tree-field">
            {TREES.map(([x, y, r], n) => (
              <circle key={n} cx={x} cy={y} r={r} style={{ "--i": n } as React.CSSProperties} />
            ))}
          </g>
        </g>
        <g className="movement-layer">
          <path className="road-minor" d={UC.slice(1, -1).map((u) => road([u + 0.0, 0.02], [u, 0.98])).join("")} />
          <path className="road-minor" d={VC.slice(1, -1).map((v) => road([0.02, v], [0.98, v])).join("")} />
          <path className="road-primary" pathLength={1} d={roadCurve([[0.03, 0.9], [0.28, 0.74], [0.5, 0.5], [0.74, 0.3], [0.97, 0.12]])} />
          <path className="road-primary road-cross" pathLength={1} d={road([0.52, 0.02], [0.52, 0.98])} />
          <path className="road-secondary" pathLength={1} d={road([0.02, 0.38], [0.98, 0.46])} />
          <path className="gold-route" d={roadCurve([[0.03, 0.9], [0.28, 0.74], [0.5, 0.5], [0.74, 0.3], [0.97, 0.12]])} />
          <path className="utility utility-a" d={road([0.05, 0.3], [0.95, 0.34])} />
          <path className="utility utility-b" d={roadCurve([[0.08, 0.92], [0.4, 0.6], [0.6, 0.44], [0.92, 0.2]])} />
          <path className="plaza" d={plaza} />
        </g>
        <g className="parcel-layer">
          {PARCELS.map((p) => (
            <path key={`${p.i}-${p.j}`} pathLength={1} d={poly([P(p.u0, p.v0), P(p.u1, p.v0), P(p.u1, p.v1), P(p.u0, p.v1)])} />
          ))}
        </g>
        {on("phasing") && (
        <g className="phasing-layer">
          {phase.map(([ph, p]) => (
            <path key={`${p.i}-${p.j}`} style={{ "--i": p.i + p.j } as React.CSSProperties} className={`phase phase-${ph + 1}`} d={poly([P(p.u0, p.v0), P(p.u1, p.v0), P(p.u1, p.v1), P(p.u0, p.v1)])} />
          ))}
        </g>
        )}
        {on("intensity") && (
        <g className="intensity-layer">
          {intensity.map((p) => {
            return <path key={`${p.i}-${p.j}`} d={poly([P(p.u0, p.v0), P(p.u1, p.v0), P(p.u1, p.v1), P(p.u0, p.v1)])} className={`inten inten-${p.zone}`} />;
          })}
        </g>
        )}
        <g className="block-layer">
          {MASSES.map(({ b, tall, k }, n) => (
            <g key={n} className={`${tall ? "tall " : ""}z${k}`} style={{ "--i": n } as React.CSSProperties}>
              <path className="roof" d={b.roof} />
              <path className="wall-l" d={b.wl} />
              <path className="wall-r" d={b.wr} />
            </g>
          ))}
        </g>
        {on("transit") && (
        <g className="transit-layer">
          <path className="rail" pathLength={1} d={roadCurve([[0.02, 0.2], [0.3, 0.3], [0.52, 0.46], [0.7, 0.54], [0.98, 0.5]])} />
          <path className="rail-ties" d={roadCurve([[0.02, 0.2], [0.3, 0.3], [0.52, 0.46], [0.7, 0.54], [0.98, 0.5]])} />
          {[[0.3, 0.3], [0.52, 0.46], [0.78, 0.53]].map(([u, v]) => {
            const [x, y] = P(u, v);
            return <circle key={`${u}${v}`} className="station" cx={x} cy={y} r={7} style={{ "--i": u * 3 } as React.CSSProperties} />;
          })}
        </g>
        )}
        {on("ecology") && (
        <g className="ecology-layer">
          {ecologyPatches.map(([x, y], n) => (
            <ellipse key={n} style={{ "--i": n } as React.CSSProperties} className="wetland" cx={x} cy={y} rx={34 + (n % 2) * 12} ry={13 + (n % 2) * 4} />
          ))}
          <path className="swale" d={roadCurve([[0.12, 0.9], [0.3, 0.8], [0.5, 0.86], [0.7, 0.8], [0.9, 0.88]])} />
        </g>
        )}
        {on("gis") && (
        <g className="gis-layer">
          <path className="gs gs1" d={SUIT[1]} />
          <path className="gs gs2" d={SUIT[2]} />
          <path className="gs gs3" d={SUIT[3]} />
          <path className="gis-field" d={poly([P(0, 0), P(1, 0), P(1, 1), P(0, 1)])} />
          <g className="gis-points">
            {[[0.3, 0.3], [0.62, 0.22], [0.78, 0.5], [0.46, 0.78]].map(([u, v]) => {
              const [x, y] = P(u, v);
              return <circle key={`${u}${v}`} cx={x} cy={y} r={5} />;
            })}
          </g>
          <path className="analysis-path" d={roadCurve([[0.14, 0.9], [0.34, 0.7], [0.55, 0.42], [0.8, 0.24], [0.96, 0.18]])} />
        </g>
        )}
        {on("reading") && (
        <g className="reading-marks">
          <path className="constraint" d={poly([P(0.12, 0.52), P(0.48, 0.5), P(0.5, 0.76), P(0.12, 0.76)])} />
          <path className="constraint" d={poly([P(0.74, 0.04), P(0.97, 0.04), P(0.97, 0.22), P(0.74, 0.2)])} />
          <g className="hatch">
            {floodHatch.map((d, n) => (
              <path key={n} d={d} />
            ))}
          </g>
          <path className="opportunity" d={poly([P(0.44, 0.34), P(0.6, 0.34), P(0.6, 0.5), P(0.44, 0.5)])} />
          <circle className="civic-node" cx={cx} cy={cy} r={18} />
          <text x="150" y="214">CONSTRAINT / FLOOD EDGE</text>
          <text x={cx - 40} y={cy - 62}>CIVIC NODE</text>
          <text x="660" y="214">CONSTRAINT / SLOPE</text>
          <text x="610" y="408">URBAN FABRIC</text>
        </g>
        )}
        {on("scenario") && (
        <g className="scenario-layer">
          <Scenario kind="a" className="scenario-a" label="A / LOW CARBON" />
          <Scenario kind="b" className="scenario-b" label="B / DENSITY" />
          <Scenario kind="p" className="scenario-p" label="P / PREFERRED" />
        </g>
        )}
        {on("final") && (
        <g className="final-layer">
          <path pathLength={1} d={roadCurve([[0.03, 0.9], [0.28, 0.74], [0.5, 0.5], [0.74, 0.3], [0.97, 0.12]]) + road([0.52, 0.02], [0.52, 0.98])} />
          <path d={poly([P(0.02, 0.02), P(0.98, 0.02), P(0.98, 0.98), P(0.02, 0.98)])} />
        </g>
        )}
      </svg>
    </div>
  );
}
