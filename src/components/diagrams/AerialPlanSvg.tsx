"use client";

import { block, line, poly, projector, rng, smooth, type V2 } from "@/lib/art/util";

/**
 * Home / RESOLVE — a calm, resolved high aerial. Deliberately unlike the hero model:
 * near-orthographic, parkland- and water-led, courtyard blocks on a curved structure.
 */
const P = projector({ L: [110, 200], T: [850, 150], R: [890, 500], B: [150, 545] });

export function AerialPlanSvg() {
  const rand = rng(41);

  const lake: V2[] = [[0.56, 0.38], [0.66, 0.34], [0.76, 0.42], [0.78, 0.58], [0.68, 0.7], [0.57, 0.64], [0.52, 0.5]].map(([u, v]) => P(u, v));
  const promenade: V2[] = [[0.53, 0.34], [0.66, 0.29], [0.8, 0.38], [0.83, 0.6], [0.7, 0.76], [0.54, 0.68], [0.47, 0.5]].map(([u, v]) => P(u, v));
  const park: V2[] = [[0.02, 0.62], [0.12, 0.54], [0.26, 0.6], [0.4, 0.74], [0.5, 0.88], [0.3, 0.97], [0.1, 0.96], [0.02, 0.9]].map(([u, v]) => P(u, v));
  const park2: V2[] = [[0.84, 0.04], [0.96, 0.04], [0.97, 0.3], [0.88, 0.26]].map(([u, v]) => P(u, v));

  // courtyard blocks on a gently curved grid
  const blocks: { b: ReturnType<typeof block>; court: string }[] = [];
  const cols = [0.04, 0.17, 0.3, 0.43];
  for (let i = 0; i < cols.length; i++)
    for (let j = 0; j < 6; j++) {
      const v0 = 0.05 + j * 0.09 + 0.01;
      const warp = Math.sin(j * 0.55) * 0.012;
      const u0 = cols[i] + warp + 0.006, u1 = cols[i] + 0.1 + warp;
      const v1 = v0 + 0.065;
      if (i === 0 && j >= 4) continue;
      if (i === 1 && j === 5) continue;
      const h = 4 + rand() * 6;
      const b = block(P, u0, v0, u1, v1, h);
      const ins = 0.022;
      blocks.push({ b, court: poly([P(u0 + ins, v0 + ins * 1.1), P(u1 - ins, v0 + ins * 1.1), P(u1 - ins, v1 - ins * 1.1), P(u0 + ins, v1 - ins * 1.1)]) });
    }
  // right bank: three terraced slabs facing the lake
  const bank: ReturnType<typeof block>[] = [];
  for (let j = 0; j < 4; j++) bank.push(block(P, 0.86, 0.36 + j * 0.13, 0.95, 0.36 + j * 0.13 + 0.09, 6 + j * 2));
  // lakeside pavilions
  const pav = [P(0.52, 0.28), P(0.64, 0.8), P(0.5, 0.78)];

  const trees: V2[] = [];
  const grove = (cu: number, cv: number, ru: number, rv: number, n: number) => {
    for (let k = 0; k < n; k++) {
      const a = rand() * Math.PI * 2, rr = Math.sqrt(rand());
      trees.push(P(cu + Math.cos(a) * ru * rr, cv + Math.sin(a) * rv * rr));
    }
  };
  grove(0.2, 0.78, 0.2, 0.14, 34);
  grove(0.45, 0.92, 0.1, 0.05, 12);
  grove(0.9, 0.16, 0.06, 0.1, 12);
  grove(0.52, 0.2, 0.06, 0.06, 8);
  grove(0.7, 0.88, 0.14, 0.05, 14);

  return (
    <div className="masterplan aerial" aria-hidden="true">
      <svg viewBox="0 0 960 650" className="masterplan-svg" focusable="false">
        <path className="ae-board" d="M96 192 862 140 900 508 138 556Z" />
        <path className="ae-plate" d={poly([P(0, 0), P(1, 0), P(1, 1), P(0, 1)])} />
        <path className="ae-park" d={smooth(park, true)} />
        <path className="ae-park" d={smooth(park2, true)} />
        <path className="ae-promenade" d={smooth(promenade, true)} />
        <path className="ae-lake" d={smooth(lake, true)} />
        <path className="ae-lake-edge" d={smooth(lake.map(([x, y]) => [x + 3, y + 4] as V2), true)} />
        <path className="ae-avenue" d={smooth([P(0.02, 0.1), P(0.3, 0.4), P(0.5, 0.52), P(0.7, 0.22), P(0.98, 0.1)].map((p) => p))} />
        <path className="ae-street" d={[0.15, 0.285, 0.415].map((u) => line([P(u, 0.03), P(u, 0.6)])).join("")} />
        <path className="ae-street" d={[0.14, 0.23, 0.32, 0.41, 0.5].map((v) => line([P(0.02, v), P(0.47, v)])).join("")} />
        <g className="ae-blocks">
          {blocks.map(({ b, court }, n) => (
            <g key={n}>
              <path className="ae-wall" d={b.wl} />
              <path className="ae-wall ae-wall-r" d={b.wr} />
              <path className="ae-roof" d={b.roof} />
              <path className="ae-court" d={court} />
            </g>
          ))}
          {bank.map((b, n) => (
            <g key={`b${n}`}>
              <path className="ae-wall" d={b.wl} />
              <path className="ae-wall ae-wall-r" d={b.wr} />
              <path className="ae-roof" d={b.roof} />
            </g>
          ))}
        </g>
        <g className="ae-trees">
          {trees.map(([x, y], n) => (
            <circle key={n} cx={x} cy={y} r={3 + (n % 4)} />
          ))}
        </g>
        {pav.map(([x, y], n) => (
          <g key={n} className="ae-pavilion">
            <circle cx={x} cy={y} r={9} />
            <circle cx={x} cy={y} r={3} />
          </g>
        ))}
        <path className="ae-datum" d={line([P(0.02, 0.97), P(0.98, 0.97)])} />
      </svg>
    </div>
  );
}
