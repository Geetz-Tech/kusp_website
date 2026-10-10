import { r1, rng, smooth, type V2 } from "@/lib/art/util";

/** About — exploded practice section: each conceptual plane carries its own drawing fragment. */
export type PlaneKind = "place" | "spatial" | "economic" | "environment" | "digital";

export function PlaneArt({ kind }: { kind: PlaneKind }) {
  const r = rng(kind.length * 13);
  const W = 420, H = 90;
  let body: React.ReactNode = null;
  if (kind === "place") {
    body = (
      <>
        {[0, 1, 2, 3, 4].map((k) => (
          <path key={k} className="ma-contour" d={smooth(Array.from({ length: 7 }, (_, i) => [i * 70, 20 + k * 14 + Math.sin(i * 1.1 + k) * 8] as V2))} />
        ))}
        {[[250, 40, 6], [330, 58, 4], [180, 66, 3.5], [380, 30, 3]].map(([x, y, s], i) => <circle key={i} className={i ? "ma-node" : "ma-node ma-node--key"} cx={x} cy={y} r={s} />)}
        <path className="ma-link" d="M250 40L330 58M250 40L180 66M250 40L380 30" />
      </>
    );
  } else if (kind === "spatial") {
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < 26; i++)
      for (let j = 0; j < 5; j++) {
        const v = Math.sin(i * 0.5) + Math.cos(j * 0.9 + i * 0.2) + r() * 0.6;
        if (v < 0.4) continue;
        cells.push(<rect key={`${i}${j}`} className={v > 1.3 ? "ma-cell ma-cell--hi" : "ma-cell"} x={150 + i * 10} y={8 + j * 15} width="9" height="14" />);
      }
    body = <>{cells}<path className="ma-cross" d="M290 10V84M150 46H410" /></>;
  } else if (kind === "economic") {
    body = (
      <>
        {Array.from({ length: 14 }, (_, i) => {
          const h = 10 + Math.max(0, 60 - Math.abs(i - 8) * 9) * (0.7 + r() * 0.3);
          return <rect key={i} className={i > 5 && i < 11 ? "ma-bar ma-bar--hi" : "ma-bar"} x={190 + i * 15} y={84 - h} width="11" height={r1(h)} />;
        })}
        <path className="ma-phase" d="M280 6V86M355 6V86" />
      </>
    );
  } else if (kind === "environment") {
    body = (
      <>
        <path className="ma-green" d="M150 70C220 40 280 76 340 50S420 30 440 40" />
        <path className="ma-water" d="M150 60C220 32 280 70 340 44S410 26 440 34" />
        {Array.from({ length: 16 }, (_, i) => <circle key={i} className="ma-tree" cx={r1(170 + r() * 250)} cy={r1(14 + r() * 66)} r={3 + (i % 3)} />)}
      </>
    );
  } else {
    body = (
      <>
        {[[180, 30, 30, 40], [222, 18, 24, 52], [256, 36, 34, 34], [300, 24, 22, 46], [332, 42, 40, 28]].map(([x, y, w, h], i) => (
          <rect key={i} className="ma-bldg" x={x} y={y} width={w} height={h} />
        ))}
        <path className="ma-net" d="M180 14L240 8L300 14L372 8M195 30L237 18L268 36L311 24L352 42" />
        {[[240, 8], [300, 14], [372, 8], [195, 30]].map(([x, y], i) => <circle key={i} className="ma-dot" cx={x} cy={y} r="2.6" />)}
      </>
    );
  }
  return (
    <svg className="ma-art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
      {body}
    </svg>
  );
}

/** About — disciplines as relationships: six positions joined across a faint regional field. */
export function DisciplineField() {
  const pts: V2[] = [[0.12, 0.04], [0.88, 0.04], [0.04, 0.5], [0.96, 0.5], [0.18, 0.96], [0.82, 0.96]];
  const W = 1000, H = 420;
  const P = pts.map(([u, v]) => [u * W, v * H] as V2);
  const links: [number, number][] = [[0, 1], [1, 3], [3, 5], [5, 4], [4, 2], [2, 0], [0, 5], [1, 4]];
  return (
    <svg className="discipline-art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {[0, 1, 2, 3].map((k) => (
        <path key={k} className="da-contour" d={smooth(Array.from({ length: 9 }, (_, i) => [i * 125, 90 + k * 80 + Math.sin(i * 0.9 + k * 0.6) * 26] as V2))} />
      ))}
      {links.map(([a, b], i) => <path key={i} className="da-link" d={`M${r1(P[a][0])} ${r1(P[a][1])}L${r1(P[b][0])} ${r1(P[b][1])}`} />)}
    </svg>
  );
}
