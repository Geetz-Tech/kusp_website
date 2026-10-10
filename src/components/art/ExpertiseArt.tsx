import type React from "react";
import { block, line, poly, projector, r1, rng, smooth, type V2 } from "@/lib/art/util";

/**
 * Expertise — five professional lenses, five drawing grammars:
 * planning = axonometric massing on parcels; economics = intensity slabs + phasing;
 * geospatial = registered raster + survey; infrastructure = corridor bundle network;
 * sustainability = catchment plan with a resilience section.
 */
const VB_W = 400, VB_H = 520;

function Planning() {
  const P = projector({ L: [30, 250], T: [220, 140], R: [380, 250], B: [190, 370] });
  const r = rng(61);
  const items: { d: number; n: React.ReactNode }[] = [];
  const parcels: string[] = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const u0 = i * 0.25 + 0.03, u1 = (i + 1) * 0.25 - 0.03, v0 = j * 0.25 + 0.03, v1 = (j + 1) * 0.25 - 0.03;
      parcels.push(poly([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]));
      if (i === 1 && j === 2) continue;
      const civic = i === 2 && j === 1;
      const hh = civic ? 70 : 14 + r() * 40 * (1 - Math.hypot(i - 1.5, j - 1.5) / 3);
      const pieces: [number, number, number, number, number][] = civic
        ? [[0.2, 0.2, 0.8, 0.8, hh]]
        : [[0.08, 0.08, 0.92, 0.42, hh], [0.08, 0.55, 0.45, 0.92, hh * 0.6], [0.58, 0.55, 0.92, 0.92, hh * 0.45]];
      pieces.forEach(([a, b, c, d, h], k) => {
        const bl = block(P, u0 + (u1 - u0) * a, v0 + (v1 - v0) * b, u0 + (u1 - u0) * c, v0 + (v1 - v0) * d, h);
        items.push({
          d: bl.depth,
          n: (
            <g key={`${i}${j}${k}`} className={civic ? "ex-civic" : "ex-mass"}>
              <path className="ex-wl" d={bl.wl} />
              <path className="ex-wr" d={bl.wr} />
              <path className="ex-roof" d={bl.roof} />
            </g>
          ),
        });
      });
    }
  items.sort((a, b) => a.d - b.d);
  const [px, py] = P(0.375, 0.625);
  return (
    <>
      <path className="ex-board" d={poly([P(0, 0), P(1, 0), P(1, 1), P(0, 1)])} />
      {parcels.map((d, n) => <path key={n} className="ex-parcel" d={d} />)}
      <path className="ex-green" d={poly([P(0.28, 0.53), P(0.47, 0.53), P(0.47, 0.72), P(0.28, 0.72)])} />
      <circle className="ex-node" cx={px} cy={py} r={4} />
      {items.map((i, n) => <g key={n} className="ex-rise" style={{ "--i": n } as React.CSSProperties}>{i.n}</g>)}
      <text className="ex-label" x="30" y="430">BLOCK / PARCEL / MASSING HIERARCHY</text>
      <path className="ex-dim" d="M30 444H180M30 440v8M180 440v8" />
    </>
  );
}

function Economics() {
  const P = projector({ L: [20, 280], T: [200, 190], R: [385, 290], B: [205, 385] });
  const r = rng(73);
  const items: { d: number; n: React.ReactNode }[] = [];
  const N = 7;
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const u0 = i / N + 0.012, u1 = (i + 1) / N - 0.012, v0 = j / N + 0.012, v1 = (j + 1) / N - 0.012;
      const dist = Math.abs((i + 0.5) / N - (j + 0.5) / N);
      const val = Math.max(0.05, 1 - dist * 2.2) * (0.7 + r() * 0.3);
      const phase = i + j < 5 ? 1 : i + j < 9 ? 2 : 3;
      const b = block(P, u0, v0, u1, v1, 4 + val * 90);
      items.push({
        d: b.depth,
        n: (
          <g key={`${i}${j}`} className={`ex-slab ex-ph${phase}`}>
            <path className="ex-wl" d={b.wl} />
            <path className="ex-wr" d={b.wr} />
            <path className="ex-roof" d={b.roof} />
          </g>
        ),
      });
    }
  items.sort((a, b) => a.d - b.d);
  const ph = (k: number) => line([P(0, k / N), P(k / N, 0)]);
  return (
    <>
      <path className="ex-board" d={poly([P(0, 0), P(1, 0), P(1, 1), P(0, 1)])} />
      <path className="ex-phase" d={ph(5) + ph(9 - 0.0)} />
      {items.map((i, n) => <g key={n} className="ex-grow" style={{ "--i": n } as React.CSSProperties}>{i.n}</g>)}
      <path className="ex-corridor" d={line([P(0, 0), P(1, 1)])} />
      <g className="ex-legend" transform="translate(30 420)">
        {[1, 2, 3].map((p) => (
          <g key={p} transform={`translate(${(p - 1) * 92} 0)`}>
            <rect className={`ex-sw ex-ph${p}`} width="14" height="8" />
            <text className="ex-label" x="20" y="8">{`PHASE ${p}`}</text>
          </g>
        ))}
      </g>
      <text className="ex-label" x="30" y="460">INTENSITY / LAND STRATEGY / PHASING</text>
    </>
  );
}

function Geospatial() {
  const r = rng(85);
  const x0 = 40, y0 = 70, cell = 20, cols = 16, rows = 17;
  const waves = Array.from({ length: 3 }, () => [r() * 5 + 2, r() * 5 + 2, r() * 6]);
  const f = (u: number, v: number) => waves.reduce((s, [a, b, c]) => s + Math.sin(u * a + c) * Math.cos(v * b), 0) / 3 + u * 0.25;
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const val = f(i / cols, j / rows);
      const c = val > 0.42 ? 4 : val > 0.24 ? 3 : val > 0.06 ? 2 : val > -0.12 ? 1 : 0;
      if (!c) continue;
      cells.push(<rect key={`${i}-${j}`} style={{ "--i": i } as React.CSSProperties} className={`ex-cell ex-c${c}`} x={x0 + i * cell + 0.5} y={y0 + j * cell + 0.5} width={cell - 1} height={cell - 1} />);
    }
  const contour = (k: number) =>
    smooth(Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return [x0 + 210 + Math.cos(a) * (40 + k * 36) * (0.9 + 0.2 * Math.sin(i * 3 + k)), y0 + 150 + Math.sin(a) * (34 + k * 30)] as V2;
    }), true);
  const pts: V2[] = Array.from({ length: 9 }, () => [x0 + 20 + r() * 280, y0 + 20 + r() * 300]);
  const sel: V2[] = [[x0 + 150, y0 + 90], [x0 + 270, y0 + 70], [x0 + 300, y0 + 170], [x0 + 230, y0 + 240], [x0 + 140, y0 + 200]];
  return (
    <>
      {cells}
      <rect className="ex-frame" x={x0} y={y0} width={cols * cell} height={rows * cell} />
      {Array.from({ length: cols + 1 }, (_, i) => <path key={`t${i}`} className="ex-tick" d={`M${x0 + i * cell} ${y0 - 6}v6M${x0 + i * cell} ${y0 + rows * cell}v6`} />)}
      {Array.from({ length: rows + 1 }, (_, j) => <path key={`s${j}`} className="ex-tick" d={`M${x0 - 6} ${y0 + j * cell}h6M${x0 + cols * cell} ${y0 + j * cell}h6`} />)}
      {["A", "B", "C", "D"].map((t, i) => <text key={t} className="ex-label" x={x0 + 30 + i * 80} y={y0 - 12}>{t}</text>)}
      {[0, 1, 2].map((k) => <path key={k} className="ex-contour" d={contour(k)} />)}
      <path className="ex-select" d={smooth(sel, true)} />
      {pts.map(([x, y], i) => (
        <g key={i} className="ex-survey">
          <path d={`M${r1(x - 7)} ${r1(y)}h14M${r1(x)} ${r1(y - 7)}v14`} />
          <circle cx={r1(x)} cy={r1(y)} r="3" />
        </g>
      ))}
      <text className="ex-label" x={x0} y={y0 + rows * cell + 34}>REGISTERED GRID / SUITABILITY / SURVEY</text>
    </>
  );
}

function Infrastructure() {
  const bundle = (pts: V2[], offs: number[], cls: string[]) =>
    offs.map((o, k) => <path key={k} className={cls[k]} pathLength={cls[k].includes("ex-util") ? undefined : 1} d={smooth(pts.map(([x, y]) => [x + o * 0.6, y + o] as V2))} />);
  const spine: V2[] = [[0, 380], [120, 330], [210, 250], [300, 170], [400, 120]];
  const cross: V2[] = [[60, 60], [140, 150], [210, 250], [250, 380], [270, 520]];
  return (
    <>
      <path className="ex-grid" d={Array.from({ length: 11 }, (_, i) => `M${i * 40} 0V520`).join("") + Array.from({ length: 14 }, (_, i) => `M0 ${i * 40}H400`).join("")} />
      {bundle(spine, [-14, -6, 4, 12, 18], ["ex-road", "ex-road ex-road2", "ex-rail", "ex-util ex-water", "ex-util ex-power"])}
      {bundle(cross, [-10, 0, 9], ["ex-road ex-road2", "ex-rail", "ex-util ex-power"])}
      <circle className="ex-loop" cx="210" cy="250" r="34" />
      <circle className="ex-loop" cx="210" cy="250" r="20" />
      {[[120, 336], [300, 176], [140, 152], [252, 384]].map(([x, y], i) => (
        <g key={i} className="ex-station">
          <circle cx={x} cy={y} r="8" />
          <circle cx={x} cy={y} r="2.5" />
        </g>
      ))}
      <path className="ex-local" d={smooth([[20, 470], [90, 420], [170, 430], [252, 384]]) + smooth([[300, 176], [330, 240], [390, 260]])} />
      <text className="ex-label" x="22" y="500">CORRIDOR / MOBILITY / UTILITIES</text>
    </>
  );
}

function Sustainability() {
  const r = rng(97);
  const river: V2[] = [[40, 60], [110, 120], [150, 200], [230, 250], [280, 320], [360, 360]];
  const flood = smooth([[30, 40], [130, 100], [190, 200], [270, 230], [330, 300], [390, 330], [380, 390], [270, 360], [200, 290], [120, 230], [70, 140], [20, 80]], true);
  const trees = Array.from({ length: 46 }, () => [20 + r() * 360, 20 + r() * 330] as V2).filter(([x, y]) => Math.abs(y - (x * 0.85 + 40)) > 50);
  return (
    <>
      <path className="ex-flood" d={flood} />
      <g className="ex-hatch">
        {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${60 + i * 20} ${90 + i * 17}l26 -22`} />)}
      </g>
      <path className="ex-greenway" d={smooth([[20, 330], [120, 300], [180, 360], [300, 380], [390, 420]])} />
      <path className="ex-river" pathLength={1} d={smooth(river)} />
      {[[150, 140], [300, 250], [100, 70]].map(([x, y], i) => <path key={i} className="ex-trib" pathLength={1} d={smooth([[x - 60, y + (i - 1) * 40], [x - 20, y + 10], ...([river[i + 1]] as V2[])])} />)}
      {[[200, 210, 26, 13], [320, 330, 22, 11]].map(([x, y, a, b], i) => <ellipse key={i} className="ex-wetland" cx={x} cy={y} rx={a} ry={b} />)}
      {trees.map(([x, y], i) => <circle key={i} className="ex-tree" style={{ "--i": i } as React.CSSProperties} cx={r1(x)} cy={r1(y)} r={3 + (i % 3)} />)}
      {/* resilience section */}
      <g transform="translate(20 420)">
        <path className="ex-ground" d="M0 30C40 30 60 32 90 46S140 62 180 62 230 48 260 36 330 28 360 28" />
        <path className="ex-swale" d="M150 58C165 70 195 70 210 58" />
        <path className="ex-watertable" d="M0 56H360" />
        <path className="ex-tick" d="M90 0V20M270 0V20" />
        <text className="ex-label" x="96" y="12">FLOOD EDGE</text>
      </g>
      <text className="ex-label" x="20" y="512">CATCHMENT / BLUE-GREEN / RESILIENCE</text>
    </>
  );
}

const SCENES = { planning: Planning, economics: Economics, geospatial: Geospatial, infrastructure: Infrastructure, sustainability: Sustainability };
export type LensKey = keyof typeof SCENES;

export function LensScenes() {
  return (
    <>
      {(Object.keys(SCENES) as LensKey[]).map((k) => {
        const S = SCENES[k];
        return (
          <svg key={k} className={`lv-scene lv-scene--${k}`} viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true" focusable="false">
            <S />
          </svg>
        );
      })}
    </>
  );
}

/** Expertise hero: one tight near-top-down site slice, cut into five registered analytical strips. */
export function ExpertiseSlice() {
  const r = rng(51);
  const W = 640, H = 460, strips = 5, sw = W / strips;
  const cell = 16;
  const river = (x: number) => 300 + Math.sin(x / 90) * 40 - x * 0.12;
  const content = (k: number) => {
    const x0 = k * sw;
    const out: React.ReactNode[] = [];
    if (k === 0) {
      out.push(<path key="st" className="sl-street" d={`M${x0} 108H${x0 + sw}M${x0} 214H${x0 + sw}M${x0} 380H${x0 + sw}M${x0 + 64} 0V${H}`} />);
      const rows: [number, number][] = [[16, 84], [120, 84], [226, 40], [392, 56]];
      rows.forEach(([y, h], j) => {
        [[x0 + 8, 50], [x0 + 72, 48]].forEach(([x, w], i) => {
          if (Math.abs(y + h / 2 - river(x + w / 2)) < 34) return;
          out.push(<rect key={`${i}${j}`} className="sl-block" x={x} y={y} width={w} height={h} />);
          if (h > 60) out.push(<rect key={`c${i}${j}`} className="sl-court" x={x + 10} y={y + 12} width={w - 20} height={h - 24} />);
          else out.push(<path key={`d${i}${j}`} className="sl-street" d={`M${x + w / 2} ${y}v${h}`} />);
        });
      });
    } else if (k === 1) {
      for (let j = 0; j < 14; j++) for (let i = 0; i < 4; i++) {
        const x = x0 + 8 + i * 29, y = 14 + j * 31;
        const v = 1 - Math.min(1, Math.abs(y - 200) / 220);
        out.push(<rect key={`${i}${j}`} className={`sl-int sl-i${v > 0.7 ? 3 : v > 0.45 ? 2 : 1}`} x={x} y={y} width={24} height={26} />);
      }
    } else if (k === 2) {
      for (let j = 0; j < H / cell; j++) for (let i = 0; i < sw / cell; i++) {
        const v = Math.sin(i * 0.7 + j * 0.3) + Math.cos(j * 0.45) + r() * 0.4;
        if (v < 0.3) continue;
        out.push(<rect key={`${i}${j}`} className={`sl-cell sl-g${v > 1.4 ? 3 : v > 0.9 ? 2 : 1}`} x={x0 + i * cell} y={j * cell} width={cell - 1} height={cell - 1} />);
      }
    } else if (k === 3) {
      out.push(<path key="a" className="sl-corr" d={`M${x0} 120L${x0 + sw} 160`} />);
      out.push(<path key="b" className="sl-corr sl-corr2" d={`M${x0} 134L${x0 + sw} 174`} />);
      out.push(<path key="r" className="sl-rail" d={`M${x0 + 30} 0C${x0 + 40} 160 ${x0 + 90} 260 ${x0 + 100} ${H}`} />);
      out.push(<path key="c" className="sl-util" d={`M${x0} 392L${x0 + sw} 352M${x0} 404L${x0 + sw} 364M${x0 + 62} 0V${H}`} />);
      out.push(<path key="l" className="sl-street" d={`M${x0} 60H${x0 + sw}M${x0} 440H${x0 + sw}`} />);
      [[x0 + 62, 146], [x0 + 46, 140], [x0 + 62, 372], [x0 + 90, 360]].forEach(([cx, cy], i) => out.push(<circle key={`s${i}`} className={i ? "sl-joint" : "sl-station"} cx={cx} cy={cy} r={i ? 4 : 9} />));
    } else {
      out.push(<path key="buf" className="sl-buffer" d={`M${x0} ${river(x0)}L${x0 + sw} ${river(x0 + sw)}`} />);
      [80, 150, 380, 430].forEach((y, i) => out.push(<path key={`ct${i}`} className="sl-contour" d={`M${x0} ${y}C${x0 + 40} ${y - 18} ${x0 + 80} ${y + 14} ${x0 + sw} ${y - 6}`} />));
      for (let n = 0; n < 70; n++) {
        const x = x0 + 8 + r() * (sw - 16), y = 10 + r() * (H - 20);
        const near = Math.abs(y - river(x));
        if (near < 22 || (near > 90 && r() > 0.35)) continue;
        out.push(<circle key={n} className="sl-tree" cx={r1(x)} cy={r1(y)} r={2.5 + (n % 4)} />);
      }
      out.push(<ellipse key="w1" className="sl-wetland" cx={x0 + 40} cy={river(x0 + 40) + 34} rx={26} ry={10} />);
      out.push(<ellipse key="w2" className="sl-wetland" cx={x0 + 92} cy={river(x0 + 92) - 30} rx={20} ry={8} />);
    }
    return out;
  };
  const riverPath = smooth(Array.from({ length: 9 }, (_, i) => [i * 80, river(i * 80)] as V2));
  return (
    <svg className="ex-slice" viewBox={`-20 -40 ${W + 40} ${H + 80}`} aria-hidden="true" focusable="false">
      <defs>
        {Array.from({ length: strips }, (_, k) => (
          <clipPath key={k} id={`slice-${k}`}>
            <rect x={k * sw + 3} y="0" width={sw - 6} height={H} />
          </clipPath>
        ))}
      </defs>
      {Array.from({ length: strips }, (_, k) => (
        <g key={k} className={`sl-strip sl-strip--${k}`} style={{ "--i": k } as React.CSSProperties} transform={`translate(0 ${[0, -14, 8, -6, 12][k]})`}>
          <g clipPath={`url(#slice-${k})`}>
            <rect className="sl-ground" x={k * sw} y="0" width={sw} height={H} />
            <path className="sl-river" d={riverPath} />
            {content(k)}
          </g>
          <rect className="sl-edge" x={k * sw + 3} y="0" width={sw - 6} height={H} />
          <text className="sl-label" x={k * sw + 6} y="-10">{`0${k + 1}`}</text>
        </g>
      ))}
      <path className="sl-datum" d={`M0 ${H + 28}H${W}`} />
    </svg>
  );
}
