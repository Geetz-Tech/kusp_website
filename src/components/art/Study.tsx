"use client";

import { line, poly, r1, rng, smooth, type V2 } from "@/lib/art/util";

/**
 * Neutral planning-study sheets for the evidence walls. Every sheet is a generic,
 * unattributed schematic: no place names, no figures, no project references.
 * `variant` reseeds the geometry so no two walls share a sheet.
 */
export type StudyKind = "regional" | "gis" | "mobility" | "intensity" | "masterplan" | "bluegreen" | "process" | "section";

const VW = 400, VH = 280, PAD = 14, STRIP = 24;
const IW = VW - PAD * 2, IH = VH - PAD * 2 - STRIP;
const X = (u: number) => PAD + u * IW;
const Y = (v: number) => PAD + v * IH;
const UV = (u: number, v: number): V2 => [X(u), Y(v)];

const NAMES: Record<StudyKind, string> = {
  regional: "REGIONAL STRUCTURE",
  gis: "GIS SUITABILITY",
  mobility: "MOBILITY NETWORK",
  intensity: "DEVELOPMENT INTENSITY",
  masterplan: "MASTERPLAN FRAMEWORK",
  bluegreen: "BLUE-GREEN SYSTEM",
  process: "FEASIBILITY / PROCESS",
  section: "LANDSCAPE SECTION",
};

function blob(r: () => number, cx: number, cy: number, rx: number, ry: number, n = 10): V2[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 0.82 + r() * 0.34;
    return UV(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k);
  });
}

function noise(seed: number) {
  const r = rng(seed);
  const waves = Array.from({ length: 4 }, () => [r() * 6 + 2, r() * 6 + 2, r() * 6, r() * 6]);
  return (u: number, v: number) => waves.reduce((s, [a, b, c, d]) => s + Math.sin(u * a + c) * Math.cos(v * b + d), 0) / 4;
}

function Regional({ v }: { v: number }) {
  const r = rng(100 + v);
  const hills = [blob(r, 0.25, 0.3, 0.2, 0.22), blob(r, 0.25, 0.3, 0.13, 0.14), blob(r, 0.25, 0.3, 0.06, 0.07), blob(r, 0.78, 0.7, 0.18, 0.2), blob(r, 0.78, 0.7, 0.1, 0.11)];
  const nodes: [number, number, number][] = [[0.52, 0.48, 3], [0.2, 0.72, 2], [0.82, 0.24, 2], [0.62, 0.86, 2]];
  for (let i = 0; i < 9; i++) nodes.push([0.06 + r() * 0.88, 0.06 + r() * 0.88, 1]);
  const big = nodes.filter((n) => n[2] >= 2);
  return (
    <>
      {hills.map((h, i) => <path key={i} className="st-contour" d={smooth(h, true)} />)}
      <path className="st-water" d={smooth([UV(0, 0.58), UV(0.22, 0.54), UV(0.44, 0.64), UV(0.66, 0.5), UV(1, 0.56)])} />
      <path className="st-water st-thin" d={smooth([UV(0.4, 0.05), UV(0.42, 0.3), UV(0.44, 0.64)])} />
      <path className="st-boundary" d={smooth([UV(0.03, 0.08), UV(0.5, 0.02), UV(0.97, 0.1), UV(0.96, 0.92), UV(0.5, 0.97), UV(0.04, 0.9)], true)} />
      {big.slice(1).map((n, i) => (
        <path key={i} className="st-corridor" d={line([UV(nodes[0][0], nodes[0][1]), UV(n[0], n[1])])} />
      ))}
      {nodes.filter((n) => n[2] === 1).map((n, i) => {
        const near = big.reduce((a, b) => (Math.hypot(a[0] - n[0], a[1] - n[1]) < Math.hypot(b[0] - n[0], b[1] - n[1]) ? a : b));
        return <path key={i} className="st-link" d={line([UV(n[0], n[1]), UV(near[0], near[1])])} />;
      })}
      {big.map((n, i) => (
        <g key={i} className="st-hatch">
          {Array.from({ length: 6 }, (_, k) => (
            <path key={k} d={line([UV(n[0] - 0.08 + k * 0.025, n[1] + 0.05), UV(n[0] - 0.04 + k * 0.025, n[1] - 0.05)])} />
          ))}
        </g>
      ))}
      {nodes.map(([u, w, s], i) => {
        const [x, y] = UV(u, w);
        return (
          <g key={i}>
            {s === 3 && <circle className="st-ring" cx={x} cy={y} r={15} />}
            <circle className={s >= 2 ? "st-node st-node--major" : "st-node"} cx={x} cy={y} r={s === 3 ? 7 : s === 2 ? 4.6 : 2.4} />
          </g>
        );
      })}
    </>
  );
}

function Gis({ v }: { v: number }) {
  const n = noise(200 + v);
  const cols = 26, rows = 15;
  const cw = IW / cols, ch = IH / rows;
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const val = n(i / cols, j / rows) + (v % 2 ? (i / cols) * 0.3 : (j / rows) * 0.3);
      const c = val > 0.35 ? 4 : val > 0.18 ? 3 : val > 0.02 ? 2 : val > -0.15 ? 1 : 0;
      if (c === 0) continue;
      cells.push(<rect key={`${i}-${j}`} className={`st-cell st-c${c}`} x={r1(PAD + i * cw)} y={r1(PAD + j * ch)} width={r1(cw - 0.6)} height={r1(ch - 0.6)} />);
    }
  const r = rng(210 + v);
  const pts = Array.from({ length: 7 }, () => UV(0.08 + r() * 0.84, 0.1 + r() * 0.8));
  return (
    <>
      <rect className="st-gridbox" x={PAD} y={PAD} width={IW} height={IH} />
      {cells}
      <path className="st-contour st-dark" d={smooth(blob(r, 0.6, 0.45, 0.28, 0.34, 9), true)} />
      <path className="st-contour st-dark" d={smooth(blob(r, 0.6, 0.45, 0.15, 0.18, 8), true)} />
      {pts.map(([x, y], i) => (
        <g key={i} className="st-cross">
          <path d={`M${r1(x - 6)} ${r1(y)}H${r1(x + 6)}M${r1(x)} ${r1(y - 6)}V${r1(y + 6)}`} />
          <circle cx={x} cy={y} r={2.4} />
        </g>
      ))}
      <g className="st-legend">
        {[1, 2, 3, 4].map((c) => <rect key={c} className={`st-cell st-c${c}`} x={VW - PAD - 66 + c * 12} y={PAD + 6} width={10} height={6} />)}
      </g>
    </>
  );
}

function Mobility({ v }: { v: number }) {
  const r = rng(300 + v);
  const streets: string[] = [];
  for (let i = 1; i < 9; i++) {
    const u = i / 9 + (r() - 0.5) * 0.03;
    streets.push(line([UV(u + (r() - 0.5) * 0.04, 0), UV(u, 1)]));
  }
  for (let j = 1; j < 6; j++) {
    const w = j / 6 + (r() - 0.5) * 0.04;
    streets.push(line([UV(0, w), UV(1, w + (r() - 0.5) * 0.06)]));
  }
  const hub = UV(0.5 + (v % 2 ? 0.08 : -0.06), 0.48);
  const iso = [0.13, 0.25, 0.38].map((k) =>
    smooth(Array.from({ length: 11 }, (_, i) => {
      const a = (i / 11) * Math.PI * 2;
      const kk = k * (0.8 + r() * 0.4);
      return [hub[0] + Math.cos(a) * kk * IW * 0.62, hub[1] + Math.sin(a) * kk * IH * 0.9] as V2;
    }), true),
  );
  const transit = [UV(0, 0.72), UV(0.24, 0.62), [hub[0], hub[1]] as V2, UV(0.76, 0.32), UV(1, 0.22)];
  return (
    <>
      <path className="st-street" d={streets.join("")} />
      <path className="st-arterial" d={smooth([UV(0, 0.3), UV(0.4, 0.36), UV(0.7, 0.62), UV(1, 0.7)])} />
      {iso.map((d, i) => <path key={i} className={`st-iso st-iso${i}`} d={d} />)}
      <path className="st-transit" d={smooth(transit)} />
      {transit.slice(1, -1).map(([x, y], i) => <circle key={i} className="st-station" cx={x} cy={y} r={i === 1 ? 7 : 4.5} />)}
    </>
  );
}

function Intensity({ v }: { v: number }) {
  const r = rng(400 + v);
  const cols = 10, rows = 6;
  const out: React.ReactNode[] = [];
  const jit = (u: number, w: number): V2 => UV(u + (r() - 0.5) * 0.012, w + (r() - 0.5) * 0.02);
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const u0 = i / cols + 0.008, u1 = (i + 1) / cols - 0.008, w0 = j / rows + 0.014, w1 = (j + 1) / rows - 0.014;
      const cu = (u0 + u1) / 2, cv = (w0 + w1) / 2;
      const d = Math.abs(cv - (0.35 + cu * 0.3 * (v % 2 ? -1 : 1)));
      const lvl = d < 0.1 ? 4 : d < 0.22 ? 3 : d < 0.36 ? 2 : 1;
      out.push(<path key={`${i}-${j}`} className={`st-par st-i${lvl}`} d={poly([jit(u0, w0), jit(u1, w0), jit(u1, w1), jit(u0, w1)])} />);
    }
  return (
    <>
      {out}
      <path className="st-arterial" d={line([UV(0, 0.35), UV(1, v % 2 ? 0.05 : 0.65)])} />
      <path className="st-phase" d={`${line([UV(0.34, 0), UV(0.34, 1)])}${line([UV(0.68, 0), UV(0.68, 1)])}`} />
      {["PH 1", "PH 2", "PH 3"].map((t, i) => <text key={t} className="st-tag" x={X(0.02 + i * 0.34)} y={Y(0.07)}>{t}</text>)}
    </>
  );
}

function MasterplanCrescent({ v }: { v: number }) {
  const r = rng(550 + v);
  const cx = 0.5, cy = 0.95;
  const blocks: React.ReactNode[] = [];
  const rings = [0.34, 0.5, 0.66, 0.82];
  rings.forEach((rad, ri) => {
    const n = 5 + ri * 2;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI + (i / n) * Math.PI + 0.05, a1 = Math.PI + ((i + 0.78) / n) * Math.PI;
      const rr0 = rad, rr1 = rad + 0.11;
      const P = (rr: number, a: number) => UV(cx + Math.cos(a) * rr * 0.62, cy + Math.sin(a) * rr);
      const use = (i + ri + v) % 6 === 0 ? "st-civic" : (i + ri) % 3 === 0 ? "st-mixed" : "st-res";
      blocks.push(<path key={`${ri}-${i}`} className={`st-block ${use}`} d={poly([P(rr0, a0), P(rr0, a1), P(rr1, a1), P(rr1, a0)])} />);
    }
  });
  const green = smooth(Array.from({ length: 12 }, (_, i) => {
    const a = Math.PI + (i / 11) * Math.PI;
    return UV(cx + Math.cos(a) * 0.3 * 0.62, cy + Math.sin(a) * 0.3);
  }));
  const trees = Array.from({ length: 18 }, () => {
    const a = Math.PI + r() * Math.PI, rr = r() * 0.26;
    return UV(cx + Math.cos(a) * rr * 0.62, cy + Math.sin(a) * rr);
  });
  return (
    <>
      <path className="st-park" d={`${green}L${X(cx)} ${Y(cy)}Z`} />
      <path className="st-water" d={smooth([UV(0, 0.9), UV(0.3, 0.86), UV(0.5, 0.93), UV(0.7, 0.86), UV(1, 0.9)])} />
      {blocks}
      {[0, 1, 2, 3, 4].map((k) => {
        const a = Math.PI + (k / 4) * Math.PI;
        return <path key={k} className="st-arterial st-radial" d={line([UV(cx + Math.cos(a) * 0.3 * 0.62, cy + Math.sin(a) * 0.3), UV(cx + Math.cos(a) * 0.95 * 0.62, cy + Math.sin(a) * 0.95)])} />;
      })}
      {trees.map(([x, y], i) => <circle key={i} className="st-tree" cx={x} cy={y} r={2.4 + (i % 3)} />)}
    </>
  );
}

function Masterplan({ v }: { v: number }) {
  if (v % 2 === 0) return <MasterplanCrescent v={v} />;
  const r = rng(500 + v);
  const blocks: React.ReactNode[] = [];
  const xs = [0.04, 0.17, 0.3, 0.55, 0.68, 0.81];
  const ys = [0.05, 0.3, 0.6, 0.8];
  xs.forEach((u, i) =>
    ys.forEach((w, j) => {
      if (i === 2 && j === 1) return;
      const bw = 0.11, bh = j === 3 ? 0.15 : 0.2;
      const use = (i + j + v) % 5 === 0 ? "st-civic" : (i * j + v) % 3 === 0 ? "st-mixed" : "st-res";
      blocks.push(<path key={`${i}-${j}`} className={`st-block ${use}`} d={poly([UV(u, w), UV(u + bw, w), UV(u + bw, w + bh), UV(u, w + bh)])} />);
      blocks.push(<path key={`c${i}-${j}`} className="st-court" d={poly([UV(u + 0.025, w + 0.045), UV(u + bw - 0.025, w + 0.045), UV(u + bw - 0.025, w + bh - 0.045), UV(u + 0.025, w + bh - 0.045)])} />);
    }),
  );
  const trees = Array.from({ length: 22 }, () => UV(0.43 + r() * 0.1, 0.05 + r() * 0.9));
  return (
    <>
      <path className="st-park" d={poly([UV(0.43, 0), UV(0.53, 0), UV(0.53, 1), UV(0.43, 1)])} />
      <path className="st-park" d={poly([UV(0.3, 0.3), UV(0.41, 0.3), UV(0.41, 0.5), UV(0.3, 0.5)])} />
      <path className="st-water" d={smooth([UV(0.48, 0), UV(0.47, 0.3), UV(0.5, 0.6), UV(0.47, 1)])} />
      {blocks}
      {trees.map(([x, y], i) => <circle key={i} className="st-tree" cx={x} cy={y} r={2.4 + (i % 3)} />)}
      <circle className="st-ring" cx={X(0.355)} cy={Y(0.4)} r={9} />
      <path className="st-arterial" d={line([UV(0, 0.27), UV(1, 0.27)])} />
    </>
  );
}

function BlueGreen({ v }: { v: number }) {
  const r = rng(600 + v);
  const trunk: V2[] = [UV(0.1, 0.12), UV(0.3, 0.32), UV(0.46, 0.5), UV(0.66, 0.66), UV(0.92, 0.9)];
  const branches: V2[][] = [];
  for (let i = 1; i < trunk.length - 1; i++) {
    const [x, y] = trunk[i];
    const s = i % 2 ? 1 : -1;
    branches.push([[x + s * 70 + (r() - 0.5) * 20, y - 60], [x + s * 30, y - 22], [x, y]]);
    branches.push([[x - s * 60, y + 50 + (r() - 0.5) * 16], [x - s * 24, y + 18], [x, y]]);
  }
  const basins = [UV(0.36, 0.44), UV(0.62, 0.68), UV(0.84, 0.86)];
  return (
    <>
      <path className="st-catch" d={smooth([UV(0.02, 0.06), UV(0.5, 0.02), UV(0.98, 0.3), UV(0.97, 0.96), UV(0.4, 0.97), UV(0.03, 0.5)], true)} />
      <path className="st-greenway" d={smooth([UV(0.05, 0.8), UV(0.3, 0.7), UV(0.6, 0.86), UV(0.98, 0.7)])} />
      <path className="st-greenway" d={smooth([UV(0.55, 0.04), UV(0.6, 0.3), UV(0.8, 0.44), UV(0.98, 0.42)])} />
      {branches.map((b, i) => <path key={i} className="st-water st-thin" d={smooth(b)} />)}
      <path className="st-water st-main" d={smooth(trunk)} />
      {basins.map(([x, y], i) => <ellipse key={i} className="st-basin" cx={x} cy={y} rx={18 + i * 3} ry={9 + i * 2} />)}
      {trunk.slice(0, -1).map(([x, y], i) => <path key={i} className="st-chev" d={`M${r1(x + 8)} ${r1(y + 2)}l6 6l-8 2`} />)}
    </>
  );
}

function Process({ v }: { v: number }) {
  const r = rng(700 + v);
  const cols = 5;
  const cw = IW / cols;
  const boxes: React.ReactNode[] = [];
  const centers: V2[] = [];
  for (let i = 0; i < cols; i++) {
    const x = PAD + i * cw + 10, y = PAD + 18 + ((i + v) % 2) * 26;
    centers.push([x + 28, y + 14]);
    boxes.push(<rect key={i} className={i === 3 ? "st-box st-box--key" : "st-box"} x={x} y={y} width={56} height={28} />);
  }
  const bars = Array.from({ length: 6 }, (_, k) => {
    const s = Math.floor(r() * 3), len = 1.2 + r() * 2.4;
    return <rect key={k} className={`st-bar st-bar${k % 3}`} x={r1(PAD + s * cw + 6)} y={r1(PAD + 112 + k * 14)} width={r1(Math.min(len * cw, IW - s * cw - 12))} height={7} />;
  });
  return (
    <>
      {Array.from({ length: cols + 1 }, (_, i) => <path key={i} className="st-gridline" d={`M${r1(PAD + i * cw)} ${PAD}V${PAD + IH}`} />)}
      {centers.slice(0, -1).map(([x, y], i) => {
        const [x2, y2] = centers[i + 1];
        return <path key={i} className="st-flow" d={`M${r1(x + 28)} ${r1(y)}C${r1(x + 50)} ${r1(y)} ${r1(x2 - 50)} ${r1(y2)} ${r1(x2 - 30)} ${r1(y2)}`} />;
      })}
      {boxes}
      <path className="st-diamond" d={poly([[centers[2][0], centers[2][1] + 40], [centers[2][0] + 12, centers[2][1] + 52], [centers[2][0], centers[2][1] + 64], [centers[2][0] - 12, centers[2][1] + 52]])} />
      <path className="st-flow st-flow--back" d={`M${r1(centers[2][0] - 12)} ${r1(centers[2][1] + 52)}C${r1(centers[1][0])} ${r1(centers[1][1] + 60)} ${r1(centers[1][0])} ${r1(centers[1][1] + 30)} ${r1(centers[1][0])} ${r1(centers[1][1] + 15)}`} />
      {bars}
    </>
  );
}

function Section({ v }: { v: number }) {
  const r = rng(800 + v);
  const ground: V2[] = Array.from({ length: 9 }, (_, i) => UV(i / 8, 0.62 + Math.sin(i * 0.9 + v) * 0.06 + (i > 5 ? 0.06 : 0)));
  const gpath = smooth(ground);
  const fill = `${gpath}L${X(1)} ${Y(1)}L${X(0)} ${Y(1)}Z`;
  const builds = [0.08, 0.2, 0.62, 0.74].map((u, i) => {
    const h = 0.18 + r() * 0.26;
    const w = 0.08;
    const gy = 0.62 + Math.sin((u * 8) * 0.9 + v) * 0.06;
    return { u, w, top: gy - h, gy, floors: Math.round(h / 0.06), i };
  });
  return (
    <>
      <path className="st-groundfill" d={fill} />
      <path className="st-water-body" d={poly([UV(0.38, 0.62), UV(0.52, 0.62), UV(0.5, 0.74), UV(0.4, 0.74)])} />
      <path className="st-ground" d={gpath} />
      <path className="st-watertable" d={line([UV(0, 0.84), UV(1, 0.82)])} />
      {builds.map((b) => (
        <g key={b.i} className="st-build">
          <rect x={X(b.u)} y={Y(b.top)} width={b.w * IW} height={(b.gy - b.top) * IH + 2} />
          {Array.from({ length: b.floors }, (_, k) => <path key={k} d={`M${r1(X(b.u))} ${r1(Y(b.top) + (k + 1) * ((b.gy - b.top) * IH) / (b.floors + 1))}h${r1(b.w * IW)}`} />)}
        </g>
      ))}
      {[0.32, 0.56, 0.86, 0.92].map((u, i) => {
        const gy = Y(0.6 + Math.sin(u * 8 * 0.9 + v) * 0.06);
        return (
          <g key={i} className="st-treesec">
            <path d={`M${X(u)} ${r1(gy)}v-14`} />
            <circle cx={X(u)} cy={r1(gy - 22)} r={10} />
          </g>
        );
      })}
      {[0.16, 0.7].map((u, i) => <circle key={i} className="st-pipe" cx={X(u)} cy={Y(0.78)} r={4} />)}
      <path className="st-dim" d={`M${X(0.62)} ${Y(0.08)}H${X(0.82)}M${X(0.62)} ${Y(0.06)}v5M${X(0.82)} ${Y(0.06)}v5`} />
    </>
  );
}

const DRAW: Record<StudyKind, (p: { v: number }) => React.ReactNode> = {
  regional: Regional,
  gis: Gis,
  mobility: Mobility,
  intensity: Intensity,
  masterplan: Masterplan,
  bluegreen: BlueGreen,
  process: Process,
  section: Section,
};

export function Study({ kind, variant = 1, index, tone = "light", plain = false }: { kind: StudyKind; variant?: number; index?: number; tone?: "light" | "dark"; plain?: boolean }) {
  const Draw = DRAW[kind];
  return (
    <svg className={`study study--${tone}`} viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <rect className="st-sheet" x="0" y="0" width={VW} height={VH} />
      <Draw v={variant} />
      {!plain && (
        <g className="st-titleblock">
          <path className="st-rule" d={`M${PAD} ${VH - STRIP - 4}H${VW - PAD}`} />
          <text x={PAD} y={VH - 12}>{`STUDY ${String(index ?? variant).padStart(2, "0")} / ${NAMES[kind]}`}</text>
          <text x={VW - PAD} y={VH - 12} textAnchor="end">SCHEMATIC / NTS</text>
          <g transform={`translate(${VW - PAD - 136} ${VH - 20})`}>
            <rect className="st-scale" x="0" y="2" width="12" height="4" />
            <rect className="st-scale st-scale--o" x="12" y="2" width="12" height="4" />
            <rect className="st-scale" x="24" y="2" width="12" height="4" />
          </g>
          <g transform={`translate(${VW - PAD - 8} ${PAD + 8})`} className="st-north">
            <path d="M0 -8L5 6L0 3L-5 6Z" />
          </g>
        </g>
      )}
    </svg>
  );
}
