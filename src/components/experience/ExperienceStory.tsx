"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { Eyebrow, SchematicTag, SectionLabel } from "@/components/primitives/SectionLabel";
import { EXPERIENCE_THEMES } from "@/lib/page-data";
import { Study, type StudyKind } from "@/components/art/Study";

/**
 * Experience — a curated studio review driven by scroll.
 * Seven studies: the large selected sheet changes as the page scrolls (wide: a short sticky track in seven near-equal
 * bands; tablet / phone: the sheet stays sticky while seven steps scroll beneath it). The rail is secondary.
 * Only the active sheet and the one fading out are mounted. All names, themes and captions are plain HTML (steps list).
 * Neutral collective framing only: no client, project, place, person or metric is named.
 */
const theme = (id: string) => EXPERIENCE_THEMES.find((t) => t.id === id)!;
const STUDIES: { id: string; label: string; kind: StudyKind; v: number; copy: ReactNode }[] = [
  { id: "statutory", label: theme("statutory").label, kind: "intensity", v: 31, copy: theme("statutory").copy },
  { id: "master", label: theme("master").label, kind: "masterplan", v: 32, copy: theme("master").copy },
  { id: "industrial", label: theme("industrial").label, kind: "intensity", v: 33, copy: theme("industrial").copy },
  { id: "regional", label: theme("regional").label, kind: "regional", v: 34, copy: theme("regional").copy },
  { id: "gis", label: theme("gis").label, kind: "gis", v: 35, copy: theme("gis").copy },
  { id: "mobility", label: theme("mobility").label, kind: "mobility", v: 36, copy: theme("mobility").copy },
  {
    id: "feasibility",
    label: "Feasibility, policy & implementation",
    kind: "process",
    v: 37,
    copy: [theme("feasibility").copy, theme("policy").copy, theme("procurement").copy].join(" "),
  },
];
const N = STUDIES.length;

const Q = "(min-width: 1100px)";
const subscribe = (cb: () => void) => {
  const q = window.matchMedia(Q);
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const getWide = () => window.matchMedia(Q).matches;
const pad = (n: number) => String(n).padStart(2, "0");

export function ExperienceStory() {
  const wide = useSyncExternalStore(subscribe, getWide, () => false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const cur = STUDIES[idx];
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  /* keep the outgoing sheet mounted just long enough to fade out */
  if (shown !== idx) {
    setPrev(shown);
    setShown(idx);
  }
  useEffect(() => {
    if (prev === null) return;
    const t = window.setTimeout(() => setPrev(null), 450);
    return () => window.clearTimeout(t);
  }, [prev, shown]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!wide) return;
    setIdx(Math.max(0, Math.min(N - 1, Math.floor(p * N))));
    sectionRef.current?.style.setProperty("--xp-p", Math.max(0, Math.min(1, p)).toFixed(4));
  });

  useEffect(() => {
    if (wide) return;
    const list = stepsRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setIdx(Number((e.target as HTMLElement).dataset.step)); }),
      { rootMargin: "-52% 0px -42% 0px" },
    );
    list.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [wide]);

  const jump = useCallback((i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    if (wide) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + ((i + 0.5) / N) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
    } else {
      stepsRef.current?.querySelectorAll("li")[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [wide]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const at = btns.indexOf(document.activeElement as HTMLButtonElement);
    const n = Math.max(0, Math.min(N - 1, (at < 0 ? idx : at) + d));
    jump(n);
    btns[n]?.focus({ preventScroll: true });
  };

  return (
    <section ref={sectionRef} className="page-section experience-hero xp-track" data-header-tone="light" aria-labelledby="experience-title">
      <div className="xp-sticky">
        <SectionLabel>01 / COLLECTIVE PROFESSIONAL EXPERIENCE</SectionLabel>
        <div className="xp-left">
          <div className="experience-intro">
            <Eyebrow>PLANNING STUDIO / EVIDENCE WALL</Eyebrow>
            <h1 id="experience-title">
              Knowledge made<br /><em>practical.</em>
            </h1>
            {/* PDF p.8 intro, adapted to collective framing (no individuals, employers or projects) */}
            <p className="body-copy">
              The practice brings together expertise across urban planning, architecture, civil engineering, policy research, economics, procurement and geospatial intelligence. Experience represented across the practice spans statutory planning, master planning, industrial development, feasibility studies and GIS-led planning.
            </p>
          </div>
          <div className="xp-active">
            <span className="xp-active__num">STUDY {pad(idx + 1)} / {pad(N)}</span>
            <strong className="xp-active__title">{cur.label}</strong>
            <p className="xp-active__copy">{cur.copy}</p>
          </div>
          <SchematicTag>Illustrative planning-studio studies. No individual, client or project attribution is shown.</SchematicTag>
        </div>
        <div className="xp-right">
          <figure className="xp-stage" aria-hidden="true">
            {[0, 1].map((slot) => {
              const on = idx % 2 === slot;
              const n = on ? idx : prev !== null && prev % 2 === slot ? prev : null;
              return (
                <div key={slot} className={"xps-sheet" + (on ? " is-on" : "")}>
                  {n !== null ? <Study kind={STUDIES[n].kind} variant={STUDIES[n].v} index={n + 1} /> : null}
                </div>
              );
            })}
          </figure>
          <div className="xp-rail" role="group" aria-label="Studies" onKeyDown={onKey}>
            {STUDIES.map((s, i) => (
              <button key={s.id} type="button" className={"xp-rail__item" + (i === idx ? " is-active" : "")} aria-current={i === idx ? "true" : undefined} onClick={() => jump(i)}>
                <span>{pad(i + 1)}</span>
                <i className="xp-rail__label">{s.label}</i>
              </button>
            ))}
          </div>
        </div>
      </div>
      <ol className="xp-steps" ref={stepsRef} aria-label="Collective experience themes">
        {STUDIES.map((s, i) => (
          <li key={s.id} data-step={i} className={i === idx ? "is-active" : undefined}>
            <span>STUDY {pad(i + 1)} / {pad(N)}</span>
            <h2>{s.label}</h2>
            <p>{s.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
