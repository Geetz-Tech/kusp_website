import type React from "react";
import { rng, smooth, line, type V2 } from "@/lib/art/util";

/**
 * Three schematic studies for the Insights reads. Generic sites only: no geography, datasets or outcomes.
 * Lines carry `ia-draw` (drawn in once as the read enters view); blocks carry `ia-pop`.
 */
const W = 600, H = 420;
const Sheet = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <svg className="ia" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
    <rect className="ia-paper" width={W} height={H} />
    {children}
    <path className="ia-rule" d={`M16 ${H - 32}H${W - 16}`} />
    <text className="ia-label" x="16" y={H - 14}>{label}</text>
    <text className="ia-label" x={W - 16} y={H - 14} textAnchor="end">SCHEMATIC / NTS</text>
  </svg>
);

/** 01 — blue-green first: the water corridor and greenway set the frame; movement and blocks respond. */
export function BlueGreenStudy() {
  const river: V2[] = [[-10, 250], [110, 230], [210, 262], [330, 226], [450, 252], [610, 214]];
  const d = smooth(river);
  const blocks: [number, number, number, number][] = [];
  for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) blocks.push([40 + i * 66, 40 + j * 62, 52, 46]);
  for (let i = 0; i < 8; i++) blocks.push([40 + i * 66, 316, 52, 46]);
  return (
    <Sheet label="STUDY 01 / WATER · LANDSCAPE · MOVEMENT">
      <path className="ia-green" d={d} />
      <path className="ia-flood ia-draw" pathLength={1} d={smooth(river.map(([x, y]) => [x, y - 40] as V2))} />
      <path className="ia-flood ia-draw" pathLength={1} d={smooth(river.map(([x, y]) => [x, y + 40] as V2))} />
      <path className="ia-river ia-draw" pathLength={1} d={d} />
      <path className="ia-greenway ia-draw" pathLength={1} d="M300 20C296 120 304 210 300 400" />
      {blocks.map(([x, y, w, h], i) => (
        <rect key={i} className="ia-blk ia-pop" style={{ "--i": i } as React.CSSProperties} x={x} y={y} width={w} height={h} />
      ))}
      <path className="ia-road ia-draw" pathLength={1} d="M20 118C140 126 260 110 330 128S520 140 585 112" />
      <path className="ia-road ia-draw" pathLength={1} d="M120 20C130 130 112 240 124 400" />
      <circle className="ia-node" cx="120" cy="238" r="7" />
      <text className="ia-note" x="316" y="34">GREENWAY</text>
      <text className="ia-note" x="430" y="206">FLOOD EDGE</text>
      <text className="ia-note" x="30" y="214">WATER CORRIDOR</text>
    </Sheet>
  );
}

/** 02 — GIS to decisions: base, suitability, constraints, accessibility, then the preferred response. */
export function GisDecisionStudy() {
  const r = rng(7);
  const step = (i: number, title: string, kind: "base" | "suit" | "cons" | "access") => {
    const x = 16 + i * 144, y = 18, w = 130, h = 92;
    const cells: React.ReactNode[] = [];
    for (let a = 0; a < 10; a++) for (let b = 0; b < 6; b++) {
      const v = Math.sin(a * 0.8 + 1) * Math.cos(b * 0.9) + r() * 0.4;
      if (kind === "suit" && v > 0.15) cells.push(<rect key={a + "-" + b} className={"ia-cell " + (v > 0.6 ? "ia-c2" : "ia-c1")} x={x + a * 13} y={y + b * (h / 6)} width="13" height={h / 6} />);
      if (kind === "cons" && b > 3 && a < 6) cells.push(<rect key={a + "-" + b} className="ia-cell ia-c3" x={x + a * 13} y={y + b * (h / 6)} width="13" height={h / 6} />);
    }
    return (
      <g key={i}>
        <rect className="ia-frame" x={x} y={y} width={w} height={h} />
        <path className="ia-contour" d={smooth(Array.from({ length: 8 }, (_, k) => [x + w / 2 + Math.cos((k / 8) * 6.28) * 44, y + h / 2 + Math.sin((k / 8) * 6.28) * 28] as V2), true)} />
        {cells}
        {kind === "access" && <path className="ia-access" d={line([[x + 8, y + h - 14], [x + 60, y + 44], [x + w - 8, y + 18]])} />}
        {kind === "access" && [0, 1, 2].map((k) => <circle key={k} className="ia-iso" cx={x + 60} cy={y + 44} r={14 + k * 14} />)}
        <text className="ia-note" x={x} y={y + h + 14}>{String(i + 1).padStart(2, "0")} {title}</text>
        {i < 3 && <path className="ia-arrow" d={`M${x + w + 4} ${y + h / 2}h6`} />}
      </g>
    );
  };
  const blocks: React.ReactNode[] = [];
  for (let a = 0; a < 12; a++) for (let b = 0; b < 3; b++) {
    const x = 60 + a * 40, y = 190 + b * 38 + (a > 6 ? 14 : 0);
    if ((a * 3 + b) % 5 === 0) continue;
    blocks.push(<rect key={a + "-" + b} className="ia-blk ia-pop" style={{ "--i": a + b } as React.CSSProperties} x={x} y={y} width="30" height="26" />);
  }
  return (
    <Sheet label="STUDY 02 / BASE → SUITABILITY → CONSTRAINTS → ACCESS">
      {step(0, "BASE", "base")}
      {step(1, "SUITABILITY", "suit")}
      {step(2, "CONSTRAINTS", "cons")}
      {step(3, "ACCESS", "access")}
      <path className="ia-rule" d="M16 150H584" />
      <text className="ia-note" x="16" y="168">PREFERRED DEVELOPMENT RESPONSE</text>
      <path className="ia-site ia-draw" pathLength={1} d="M16 180H584V362H16Z" />
      <path className="ia-green" d="M16 300C150 280 260 320 584 290" />
      <path className="ia-river ia-draw" pathLength={1} d="M16 300C150 280 260 320 584 290" />
      {blocks}
      <path className="ia-road ia-draw" pathLength={1} d="M40 346C200 230 380 214 570 196" />
    </Sheet>
  );
}

/** 03 — industrial readiness: parcels, freight access, service spine, utilities, phasing and expansion land. */
export function IndustrialStudy() {
  const parcels: React.ReactNode[] = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
    const ph = i < 2 ? 1 : 2;
    parcels.push(<rect key={i + "-" + j} className={"ia-blk ia-pop ia-ph" + ph} style={{ "--i": i * 2 + j } as React.CSSProperties} x={40 + i * 106} y={j === 0 ? 62 : 218} width="92" height="96" />);
  }
  return (
    <Sheet label="STUDY 03 / PARCELS · FREIGHT · UTILITIES · PHASING">
      <path className="ia-site ia-draw" pathLength={1} d="M24 40H540V342H24Z" />
      {parcels}
      <rect className="ia-expansion" x="466" y="62" width="74" height="252" />
      <text className="ia-note" x="470" y="190" transform="rotate(90 470 190)">EXPANSION</text>
      <path className="ia-spine ia-draw" pathLength={1} d="M24 188H540" />
      <path className="ia-freight ia-draw" pathLength={1} d="M0 236L14 204L24 188" />
      <path className="ia-util ia-draw" pathLength={1} d="M40 176H520M40 200H520" />
      <circle className="ia-node" cx="24" cy="188" r="8" />
      <text className="ia-note" x="44" y="34">FREIGHT ACCESS →</text>
      <text className="ia-note" x="170" y="184">SERVICE SPINE</text>
      <text className="ia-note ia-note--p1" x="40" y="58">PHASE 1</text>
      <text className="ia-note ia-note--p2" x="252" y="58">PHASE 2</text>
    </Sheet>
  );
}

