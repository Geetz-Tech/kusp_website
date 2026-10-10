"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { Eyebrow, SectionLabel } from "@/components/primitives/SectionLabel";
import { LENSES } from "@/lib/home-data";
import { rng, smooth, type V2 } from "@/lib/art/util";

/**
 * About — the five practice layers as an exploded axonometric.
 * Desktop: a light sticky sequence (scroll assembles the layers); hover / focus / the rail highlight one layer.
 * Tablet / phone: a static exploded stack with tap-to-highlight. Reduced motion: shown assembled.
 * The sheets are pure SVG; the explode amount is one CSS variable (--e) updated from scroll without re-rendering.
 */

const S = 330; // sheet side in viewBox units
const A = S * 0.866;
const B = S * 0.5;
const T = 7; // sheet thickness
const GAP_A = 24; // assembled spacing
const GAP_E = 100; // exploded spacing
const CX = 330; // sheet centre x
const TOP0 = 170; // top corner y of the first sheet when assembled
const r1 = (n: number) => Math.round(n * 10) / 10;
const iso = (u: number, v: number, z = 0): V2 => [r1((u - v) * A), r1((u + v) * B - z)];
const pt = (p: V2) => `${p[0]} ${p[1]}`;
const poly = (ps: V2[]) => `M${ps.map(pt).join("L")}Z`;
const path = (ps: V2[]) => `M${ps.map(pt).join("L")}`;

const LAYERS = [
  { id: "planning", short: "Planning" },
  { id: "economics", short: "Economics" },
  { id: "geospatial", short: "Geospatial" },
  { id: "infrastructure", short: "Infrastructure" },
  { id: "sustainability", short: "Sustainability" },
] as const;

/* ---------- a block on the sheet: top + two visible faces ---------- */
function Box({ u0, v0, u1, v1, h, k = "" }: { u0: number; v0: number; u1: number; v1: number; h: number; k?: string }) {
  return (
    <g className={"ax-box " + k}>
      <path className="ax-wl" d={poly([iso(u0, v1), iso(u1, v1), iso(u1, v1, h), iso(u0, v1, h)])} />
      <path className="ax-wr" d={poly([iso(u1, v0), iso(u1, v1), iso(u1, v1, h), iso(u1, v0, h)])} />
      <path className="ax-roof" d={poly([iso(u0, v0, h), iso(u1, v0, h), iso(u1, v1, h), iso(u0, v1, h)])} />
    </g>
  );
}

const PLAN: ReactNode = (() => {
  const r = rng(5);
  const out: ReactNode[] = [];
  const N = 5;
  const cells: [number, number][] = [];
  for (let s = 0; s < N * 2 - 1; s++) for (let i = 0; i < N; i++) { const j = s - i; if (j >= 0 && j < N) cells.push([i, j]); }
  out.push(<path key="fw" className="ax-dash ax-burg" d={poly([iso(0.05, 0.05), iso(0.95, 0.05), iso(0.95, 0.95), iso(0.05, 0.95)])} />);
  cells.forEach(([i, j]) => {
    const g = 0.022;
    const u0 = i / N + g, u1 = (i + 1) / N - g, v0 = j / N + g, v1 = (j + 1) / N - g;
    const civic = i === 2 && j === 2;
    out.push(<path key={"p" + i + j} className="ax-hair" d={poly([iso(u0, v0), iso(u1, v0), iso(u1, v1), iso(u0, v1)])} />);
    if (civic) out.push(<Box key="civic" u0={u0 + 0.03} v0={v0 + 0.03} u1={u1 - 0.03} v1={v1 - 0.03} h={34} k="ax-civic" />);
    else out.push(<Box key={"b" + i + j} u0={u0 + 0.03} v0={v0 + 0.03} u1={u1 - 0.03} v1={v1 - 0.03} h={6 + Math.round(r() * 16)} />);
  });
  return out;
})();

const ECON: ReactNode = (() => {
  const out: ReactNode[] = [];
  const N = 5;
  const cells: [number, number][] = [];
  for (let s = 0; s < N * 2 - 1; s++) for (let i = 0; i < N; i++) { const j = s - i; if (j >= 0 && j < N) cells.push([i, j]); }
  cells.forEach(([i, j]) => {
    const d = Math.hypot(i - 2.6, j - 1.8);
    const h = Math.max(4, Math.round(30 - d * 8));
    const phase = i < 2 ? 1 : i < 4 ? 2 : 3;
    const g = 0.03;
    out.push(<Box key={"e" + i + j} u0={i / N + g} v0={j / N + g} u1={(i + 1) / N - g} v1={(j + 1) / N - g} h={h} k={"ax-ph" + phase} />);
  });
  out.push(<path key="ph" className="ax-dash ax-gold" d={path([iso(0.06, 0.5), iso(0.5, 0.5), iso(0.94, 0.5)])} />);
  return out;
})();

const GEO: ReactNode = (() => {
  const r = rng(9);
  const out: ReactNode[] = [];
  const N = 8;
  let grid = "";
  for (let k = 0; k <= N; k++) grid += path([iso(k / N, 0), iso(k / N, 1)]) + path([iso(0, k / N), iso(1, k / N)]);
  const cells: ReactNode[] = [];
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const v = Math.sin(i * 0.9) * Math.cos(j * 0.7) + r() * 0.5;
      const c = v > 0.55 ? 3 : v > 0.1 ? 2 : v > -0.35 ? 1 : 0;
      if (!c) continue;
      cells.push(<path key={"c" + i + j} className={"ax-suit ax-s" + c} d={poly([iso(i / N, j / N), iso((i + 1) / N, j / N), iso((i + 1) / N, (j + 1) / N), iso(i / N, (j + 1) / N)])} />);
    }
  out.push(...cells);
  out.push(<path key="g" className="ax-grid" d={grid} />);
  [0.34, 0.24, 0.14, 0.06].forEach((rad, n) => {
    const pts: V2[] = Array.from({ length: 10 }, (_, a) => {
      const t = (a / 10) * Math.PI * 2;
      return iso(0.38 + Math.cos(t) * rad * (1 + 0.18 * Math.sin(t * 2 + n)), 0.55 + Math.sin(t) * rad * (1 + 0.18 * Math.cos(t * 3)));
    });
    out.push(<path key={"k" + n} className="ax-contour" d={smooth(pts, true)} />);
  });
  const hz: V2[] = [iso(0.62, 0.12), iso(0.92, 0.12), iso(0.92, 0.4), iso(0.62, 0.4)];
  let hatch = "";
  for (let k = 1; k < 7; k++) hatch += path([iso(0.62 + k * 0.05, 0.12), iso(0.62, 0.12 + k * 0.05)]);
  out.push(<path key="hz" className="ax-dash ax-burg" d={poly(hz)} />, <path key="hh" className="ax-hatch" d={hatch} />);
  [[0.2, 0.2], [0.5, 0.78], [0.78, 0.62], [0.3, 0.45], [0.7, 0.28]].forEach(([u, v], n) => {
    const [x, y] = iso(u, v);
    out.push(<g key={"s" + n} className="ax-sample"><circle cx={x} cy={y} r="4.5" /><path d={`M${x - 8} ${y}H${x + 8}M${x} ${y - 5}V${y + 5}`} /></g>);
  });
  return out;
})();

const INFRA: ReactNode = (() => {
  const out: ReactNode[] = [];
  const road: V2[] = [iso(0.02, 0.9), iso(0.3, 0.7), iso(0.55, 0.5), iso(0.8, 0.3), iso(0.98, 0.1)];
  let streets = "";
  [0.2, 0.4, 0.6, 0.8].forEach((k) => { streets += path([iso(k, 0.04), iso(k, 0.96)]); });
  [0.25, 0.75].forEach((k) => { streets += path([iso(0.04, k), iso(0.96, k)]); });
  out.push(<path key="st" className="ax-street" d={streets} />);
  out.push(<path key="rd" className="ax-road" d={smooth(road)} />);
  out.push(<path key="rail" className="ax-rail" d={smooth([iso(0.04, 0.2), iso(0.3, 0.32), iso(0.55, 0.5), iso(0.75, 0.58), iso(0.97, 0.5)])} />);
  out.push(<path key="u1" className="ax-util" d={path([iso(0.06, 0.34), iso(0.94, 0.38)])} />);
  out.push(<path key="u2" className="ax-util" d={smooth([iso(0.08, 0.92), iso(0.4, 0.62), iso(0.6, 0.46), iso(0.92, 0.2)])} />);
  out.push(<path key="u3" className="ax-util ax-util--b" d={path([iso(0.5, 0.06), iso(0.5, 0.94)])} />);
  [[0.3, 0.32], [0.55, 0.5], [0.78, 0.57]].forEach(([u, v], n) => { const [x, y] = iso(u, v); out.push(<circle key={"n" + n} className="ax-station" cx={x} cy={y} r="7" />); });
  const [jx, jy] = iso(0.55, 0.5);
  out.push(<circle key="j" className="ax-node" cx={jx} cy={jy} r="15" />);
  return out;
})();

const SUST: ReactNode = (() => {
  const r = rng(13);
  const out: ReactNode[] = [];
  const river: V2[] = [iso(-0.02, 0.62), iso(0.22, 0.52), iso(0.45, 0.62), iso(0.68, 0.48), iso(1.02, 0.4)];
  out.push(<path key="bk" className="ax-bank" d={smooth(river)} />);
  out.push(<path key="rv" className="ax-river" d={smooth(river)} />);
  [[0.12, 0.2, 0.3, 0.38], [0.58, 0.72, 0.9, 0.92], [0.72, 0.1, 0.92, 0.28]].forEach(([u0, v0, u1, v1], n) =>
    out.push(<path key={"pk" + n} className="ax-park" d={poly([iso(u0, v0), iso(u1, v0), iso(u1, v1), iso(u0, v1)])} />));
  [[0.3, 0.8, 0.06], [0.8, 0.6, 0.05]].forEach(([u, v, rad], n) => {
    const [x, y] = iso(u, v);
    out.push(<ellipse key={"w" + n} className="ax-wet" cx={x} cy={y} rx={rad * 380} ry={rad * 200} />);
  });
  const groves: [number, number, number, number][] = [[0.2, 0.3, 0.1, 0.1], [0.74, 0.82, 0.14, 0.08], [0.82, 0.2, 0.08, 0.08], [0.5, 0.35, 0.08, 0.05], [0.4, 0.78, 0.1, 0.06]];
  groves.forEach(([cu, cv, ru, rv], g) => {
    for (let k = 0; k < 7; k++) {
      const u = cu + (r() - 0.5) * 2 * ru, v = cv + (r() - 0.5) * 2 * rv;
      const [x, y] = iso(u, v);
      const rad = 7 + r() * 6;
      out.push(<ellipse key={"t" + g + k} className={"ax-tree ax-t" + (k % 2)} cx={x} cy={y - rad * 0.7} rx={rad} ry={rad * 0.78} />);
    }
  });
  return out;
})();

const ART: ReactNode[] = [PLAN, ECON, GEO, INFRA, SUST];

function Sheet({ i }: { i: number }) {
  const gapE = GAP_E - GAP_A;
  const style = { "--y0": TOP0 + i * GAP_A, "--dy": (i - 2) * gapE, "--dx": (i - 2) * -9, "--ei": `var(--e${i}, var(--e, 0))` } as CSSProperties;
  return (
    <g className={"ax-layer ax-layer--" + LAYERS[i].id} data-i={i} style={style}>
      <g transform={`translate(${CX} 0)`}>
        <path className="ax-edge-l" d={poly([[-A, B], [0, S], [0, S + T], [-A, B + T]])} />
        <path className="ax-edge-r" d={poly([[0, S], [A, B], [A, B + T], [0, S + T]])} />
        <path className="ax-plate" d={poly([[0, 0], [A, B], [0, S], [-A, B]])} />
        {ART[i]}
        <path className="ax-veil" d={poly([[0, -44], [A, B - 44], [A, B + T], [0, S + T], [-A, B + T], [-A, B - 44]])} />
      </g>
    </g>
  );
}

const subscribe = (cb: () => void) => {
  const q = window.matchMedia("(min-width: 1100px)");
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const getWide = () => window.matchMedia("(min-width: 1100px)").matches;

export function AboutSignature() {
  const wide = useSyncExternalStore(subscribe, getWide, () => false);
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLElement>(null);
  const [band, setBand] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const active = picked ?? band;
  const lens = LENSES[active];
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  /* Each layer aligns in its own band of the scroll (planning first), so the assembly reads as five moves, not one.
     Reduced motion: the same thresholds, but as direct state changes (no interpolation). */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!wide) return;
    const el = stackRef.current;
    if (!el) return;
    const ss = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
    for (let i = 0; i < 5; i++) {
      const start = 0.04 + i * 0.17;
      const e = reduced ? (p >= start + 0.13 ? 0 : 1) : 1 - ss((p - start) / 0.26);
      el.style.setProperty("--e" + i, e.toFixed(3));
    }
    setBand(Math.min(4, Math.floor(Math.max(0, p) * 5)));
    setPicked(null); // scroll drives; a hover/click highlight lasts until the next scroll
  });
  /* tablet / phone: the step that crosses the reading line is the active layer */
  const stepsRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (wide) return;
    const list = stepsRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { setPicked(null); setBand(Number((en.target as HTMLElement).dataset.step)); } }),
      { rootMargin: "-55% 0px -40% 0px" },
    );
    list.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [wide]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = Math.max(0, Math.min(4, active + d));
    setPicked(n);
    e.currentTarget.querySelectorAll<HTMLButtonElement>("button")[n]?.focus();
  };

  return (
    <section ref={sectionRef} className="page-section about-hero about-track" data-header-tone="light" aria-labelledby="about-title">
      <div className="about-sticky">
        <SectionLabel>01 / ABOUT THE PRACTICE</SectionLabel>
        <div className="about-copy">
          <Eyebrow>KUSP / SPATIAL MANIFESTO</Eyebrow>
          <h1 id="about-title">
            Ideas become <em>places.</em>
          </h1>
          {/* Who We Are — PDF p.2, verbatim */}
          <p className="body-copy">
            KUSP is a multidisciplinary planning, design and advisory consultancy delivering integrated solutions for cities, industrial regions, infrastructure and sustainable development.
          </p>
          <div className="about-active">
            <span className="about-active__num">{String(active + 1).padStart(2, "0")} / 05</span>
            <strong className="about-active__title">{lens.label[0] + " " + lens.label[1]}</strong>
            <p className="about-active__copy">{lens.copy}</p>
          </div>
          <div className="about-rail" role="group" aria-label="The five practice layers" onKeyDown={onKey}>
            {LAYERS.map((l, i) => (
              <button
                key={l.id}
                type="button"
                className={"about-rail__item" + (i === active ? " is-active" : "")}
                aria-pressed={i === active}
                aria-current={i === active ? "true" : undefined}
                onClick={() => setPicked(i)}
                onFocus={() => setPicked(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setPicked(i)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <i className="about-rail__label">{l.short}</i>
              </button>
            ))}
          </div>
        </div>
        <ol className="about-steps" ref={stepsRef} aria-label="The five practice layers">
          {LENSES.map((l, i) => (
            <li key={l.id} data-step={i} className={i === active ? "is-active" : undefined}>
              <span>{String(i + 1).padStart(2, "0")} / 05</span>
              <strong>{l.label[0] + " " + l.label[1]}</strong>
              <p>{l.copy}</p>
            </li>
          ))}
        </ol>
        <figure ref={stackRef} className="about-stack" data-active={active}>
          <svg viewBox="0 0 860 780" focusable="false" aria-hidden="true">
            {/* datum lines tie the corners together; they draw in as the layers assemble */}
            <g className="ax-datum">
              <path d={`M${CX} 22V${TOP0 + 4 * GAP_A + S - 160}`} />
              <path d={`M${CX + A} ${TOP0 + B - 140}V${TOP0 + 4 * GAP_A + B + T + 150}`} />
              <path d={`M${CX - A} ${TOP0 + B - 140}V${TOP0 + 4 * GAP_A + B + T + 150}`} />
            </g>
            {[4, 3, 2, 1, 0].map((i) => (
              <g key={i} className={"ax-slot" + (i === active ? " is-active" : "")} onPointerEnter={(e) => e.pointerType === "mouse" && setPicked(i)} onClick={() => setPicked(i)}>
                <Sheet i={i} />
              </g>
            ))}
            <g className="ax-labels">
              {LAYERS.map((l, i) => (
                <g key={l.id} className={"ax-label" + (i === active ? " is-active" : "")} style={{ "--y0": TOP0 + i * GAP_A + B, "--dy": (i - 2) * (GAP_E - GAP_A), "--ei": `var(--e${i}, var(--e, 0))` } as CSSProperties}>
                  <path d={`M${CX + A + 8} 0H${CX + A + 36}`} />
                  <text x={CX + A + 44} y="5">{String(i + 1).padStart(2, "0")} {l.short.toUpperCase()}</text>
                </g>
              ))}
            </g>
          </svg>
          <figcaption className="sr-only">Exploded axonometric of the five practice layers: planning, economics, geospatial, infrastructure and sustainability.</figcaption>
        </figure>
      </div>
    </section>
  );
}
