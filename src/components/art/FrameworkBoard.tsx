import type React from "react";
import { line, poly, r1, rng, smooth, type V2 } from "@/lib/art/util";

/**
 * Spatial Intelligence Framework™ — a single flattened planning board that transforms
 * stage by stage: Observe (base condition) → Analyse (evidence overlays) → Integrate
 * (systems connect) → Optimise (A / B / Preferred) → Deliver (one calm resolved plan).
 * Generic site; no real geography, datasets or outcomes.
 */
const BW = 600, BH = 420;
const riverY = (x: number) => 292 - Math.sin(x / 95) * 26 - x * 0.03;
const RIVER = smooth(Array.from({ length: 9 }, (_, i) => [i * 75, riverY(i * 75)] as V2));
const SITE: V2[] = [[36, 34], [560, 26], [578, 384], [300, 400], [26, 372]];

function Base() {
  const contours = [0, 1, 2, 3].map((k) =>
    smooth(Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return [150 + Math.cos(a) * (40 + k * 34), 96 + Math.sin(a) * (26 + k * 20)] as V2;
    }), true),
  );
  const r = rng(5);
  const village = Array.from({ length: 14 }, (_, i) => [96 + (i % 5) * 16 + r() * 5, 196 + Math.floor(i / 5) * 15 + r() * 4] as V2);
  return (
    <g className="fw-base">
      <rect className="fw-paper" x="0" y="0" width={BW} height={BH} />
      {contours.map((d, i) => <path key={i} className="fw-contour" d={d} />)}
      <path className="fw-river-bank" d={RIVER} />
      <path className="fw-river" pathLength={1} d={RIVER} />
      <path className="fw-road-ex" d="M0 160C150 150 400 128 600 120M240 0C262 140 290 260 312 420" />
      <g className="fw-village">
        {village.map(([x, y], i) => <rect key={i} x={r1(x)} y={r1(y)} width="10" height="8" />)}
      </g>
      <path className="fw-site" d={poly(SITE)} />
    </g>
  );
}

function Observe() {
  const marks: V2[] = [[120, 110], [420, 90], [200, 330], [520, 300], [330, 200]];
  return (
    <g className="fw-layer fw-observe">
      {marks.map(([x, y], i) => (
        <g key={i} className="fw-survey">
          <path d={`M${x - 8} ${y}h16M${x} ${y - 8}v16`} />
          <circle cx={x} cy={y} r="4" />
        </g>
      ))}
      <text className="fw-note" x="88" y="186">EXISTING SETTLEMENT</text>
      <text className="fw-note" x="430" y="236">RIVER CORRIDOR</text>
      <text className="fw-note" x="120" y="34">RIDGE</text>
      <text className="fw-note" x="250" y="114">ACCESS</text>
    </g>
  );
}

function Analyse() {
  const r = rng(17);
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 15; i++)
    for (let j = 0; j < 10; j++) {
      const x = 40 + i * 35, y = 30 + j * 36;
      const slope = Math.hypot(x - 150, (y - 96) * 1.4) < 120;
      const flood = Math.abs(y + 18 - riverY(x + 17)) < 34;
      if (!slope && !flood && r() > 0.12) continue;
      cells.push(<rect key={`${i}-${j}`} style={{ "--i": i + j } as React.CSSProperties} className={flood ? "fw-cell fw-cell--flood" : slope ? "fw-cell fw-cell--slope" : "fw-cell"} x={x} y={y} width="33" height="34" />);
    }
  return (
    <g className="fw-layer fw-analyse">
      {cells}
      {[38, 76, 116].map((rr, i) => <circle key={i} className="fw-iso" cx="290" cy="148" r={rr} />)}
      <path className="fw-constraint" d="M470 40L560 30L566 160L486 170Z" />
      <path className="fw-analysis" d="M60 380C160 300 260 230 330 200S500 150 580 80" />
      {[[330, 200], [180, 260], [460, 140]].map(([x, y], i) => <circle key={i} className="fw-heat" cx={x} cy={y} r={7 + i * 2} />)}
      <text className="fw-note" x="470" y="186">CONSTRAINT</text>
      <text className="fw-note" x="300" y="64">ACCESSIBILITY</text>
    </g>
  );
}

function Integrate() {
  const nodes: V2[] = [[300, 170], [140, 186], [470, 146], [318, 300], [210, 110]];
  return (
    <g className="fw-layer fw-integrate">
      <path className="fw-greenband" pathLength={1} d={RIVER} />
      <path className="fw-greenband fw-greenband--x" pathLength={1} d="M410 30C400 140 380 230 400 400" />
      <path className="fw-spine" pathLength={1} d="M0 196C150 186 300 170 600 140" />
      <path className="fw-spine fw-spine--x" pathLength={1} d="M286 0C300 120 312 240 330 420" />
      <path className="fw-util" d="M20 230C160 220 300 200 580 176M300 170L470 146" />
      {nodes.slice(1).map(([x, y], i) => <path key={i} className="fw-link" d={line([nodes[0], [x, y]])} />)}
      {nodes.map(([x, y], i) => (
        <g key={i} className="fw-node" style={{ "--i": i } as React.CSSProperties}>
          <circle cx={x} cy={y} r={i ? 7 : 12} />
          <circle cx={x} cy={y} r={i ? 2.5 : 4} />
        </g>
      ))}
    </g>
  );
}

function MiniPlan({ x, y, kind }: { x: number; y: number; kind: "a" | "b" | "p" }) {
  const r = rng(kind === "a" ? 2 : kind === "b" ? 4 : 8);
  const w = 170, h = 130;
  const blocks: React.ReactNode[] = [];
  const cols = kind === "b" ? 7 : 5, rows = kind === "b" ? 5 : 4;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const bx = x + 8 + i * ((w - 16) / cols), by = y + 8 + j * ((h - 30) / rows);
      const bw = (w - 16) / cols - 5, bh = (h - 30) / rows - 5;
      if (Math.abs(by + bh / 2 - (y + h * 0.62)) < 12) continue;
      if (kind === "a" && (i + j) % 2) continue;
      if (kind === "p" && i === 2 && j === 1) continue;
      blocks.push(<rect key={`${i}${j}`} className={`fw-mb ${kind === "b" && r() > 0.5 ? "fw-mb--dense" : ""}`} x={r1(bx)} y={r1(by)} width={r1(bw)} height={r1(bh)} />);
    }
  return (
    <g className={`fw-mini fw-mini--${kind}`}>
      <rect className="fw-mini-frame" x={x} y={y} width={w} height={h} />
      {kind !== "b" && <path className="fw-mini-green" d={`M${x} ${y + h * 0.62}H${x + w}`} />}
      <path className="fw-mini-water" d={`M${x} ${y + h * 0.62 + 4}C${x + 50} ${y + h * 0.56} ${x + 110} ${y + h * 0.7} ${x + w} ${y + h * 0.6}`} />
      {blocks}
      {kind === "p" && <path className="fw-mini-route" d={`M${x} ${y + 30}L${x + w} ${y + 20}`} />}
      {kind === "p" && <circle className="fw-mini-civic" cx={x + 85} cy={y + 40} r="9" />}
      <text className="fw-tag" x={x} y={y + h + 18}>{kind === "a" ? "A / LOW CARBON" : kind === "b" ? "B / DENSITY" : "PREFERRED"}</text>
    </g>
  );
}

function Optimise() {
  return (
    <g className="fw-layer fw-optimise">
      <rect className="fw-veil" x="0" y="0" width={BW} height={BH} />
      <MiniPlan x={24} y={80} kind="a" />
      <MiniPlan x={215} y={80} kind="b" />
      <MiniPlan x={406} y={80} kind="p" />
      <path className="fw-pick" d="M398 72H584V218H398Z" />
      <path className="fw-compare" d="M491 222V300H300V360" />
      <circle className="fw-mini-civic" cx="300" cy="364" r="5" />
      <text className="fw-note" x="312" y="368">CARRIED FORWARD TO DELIVERY</text>
    </g>
  );
}

function Deliver() {
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++)
    for (let j = 0; j < 9; j++) {
      const x = 50 + i * 43, y = 44 + j * 38;
      if (Math.abs(y + 14 - riverY(x + 17)) < 42) continue;
      if (Math.hypot(x - 150, (y - 96) * 1.3) < 80) continue;
      if (x > 380 && x < 430) continue;
      const civic = i === 6 && j === 3;
      const mixed = Math.abs(y - 170) < 30;
      blocks.push(<rect key={`${i}-${j}`} style={{ "--i": i + j } as React.CSSProperties} className={`fw-blk ${civic ? "fw-blk--civic" : mixed ? "fw-blk--mixed" : ""}`} x={x} y={y} width="35" height="29" />);
      if (!civic) blocks.push(<rect key={`c${i}-${j}`} style={{ "--i": i + j } as React.CSSProperties} className="fw-court" x={x + 9} y={y + 8} width="17" height="13" />);
    }
  const r = rng(29);
  const trees = Array.from({ length: 60 }, () => [20 + r() * 560, 20 + r() * 380] as V2).filter(([x, y]) => Math.abs(y - riverY(x)) < 40 || Math.hypot(x - 150, (y - 96) * 1.3) < 74);
  return (
    <g className="fw-layer fw-deliver">
      <rect className="fw-paper" x="0" y="0" width={BW} height={BH} />
      <path className="fw-park" d={smooth(Array.from({ length: 8 }, (_, i) => [150 + Math.cos((i / 8) * Math.PI * 2) * 84, 96 + Math.sin((i / 8) * Math.PI * 2) * 62] as V2), true)} />
      <path className="fw-parkband" d={RIVER} />
      <path className="fw-river" pathLength={1} d={RIVER} />
      <path className="fw-st" pathLength={1} d="M0 196C150 186 300 170 600 140M286 0C300 120 312 240 330 420" />
      <path className="fw-st2" d="M405 0V420" />
      {blocks}
      {trees.map(([x, y], i) => <circle key={i} style={{ "--i": i } as React.CSSProperties} className="fw-tree" cx={r1(x)} cy={r1(y)} r={3 + (i % 3)} />)}
      <path className="fw-site fw-site--final" d={poly(SITE)} />
    </g>
  );
}

function Furniture() {
  return (
    <g className="fw-furniture">
      <g transform={`translate(${BW - 26} 34)`}>
        <path className="fw-north" d="M0 -12L7 8L0 4L-7 8Z" />
      </g>
      <g transform={`translate(24 ${BH - 18})`}>
        <rect className="fw-scale" width="20" height="4" />
        <rect className="fw-scale fw-scale--o" x="20" width="20" height="4" />
        <rect className="fw-scale" x="40" width="20" height="4" />
      </g>
    </g>
  );
}

export function FrameworkBoard() {
  return (
    <svg className="fw-board" viewBox={`0 0 ${BW} ${BH}`} aria-hidden="true" focusable="false">
      <Base />
      <Observe />
      <Analyse />
      <Integrate />
      <Optimise />
      <Deliver />
      <Furniture />
    </svg>
  );
}

/** Hero: the same board caught mid-transformation — evidence on the left, resolution on the right. */
export function FrameworkSplit() {
  const cut = "M0 0H330L270 420H0Z";
  const rest = "M330 0H600V420H270Z";
  return (
    <svg className="fw-board fw-board--split" viewBox={`0 0 ${BW} ${BH}`} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="fw-left"><path d={cut} /></clipPath>
        <clipPath id="fw-right"><path d={rest} /></clipPath>
      </defs>
      <g clipPath="url(#fw-left)">
        <Base />
        <g className="fw-show"><Analyse /></g>
      </g>
      <g clipPath="url(#fw-right)">
        <g className="fw-show"><Deliver /></g>
      </g>
      <path className="fw-cut" pathLength={1} d="M330 -10L270 430" />
      <text className="fw-note fw-note--cut" x="342" y="22">RESOLVED</text>
      <text className="fw-note fw-note--cut" x="246" y="22" textAnchor="end">EVIDENCE</text>
      <Furniture />
    </svg>
  );
}
