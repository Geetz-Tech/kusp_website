"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import { LazyEvidence } from "./LazyArt";
import { STUDIES } from "./studies";

/* 07 / EVIDENCE — the seven studies advance with scroll.
 * Desktop (>=1100px, JS): a short pinned track; one scroll progress value selects one of seven equal bands.
 * Below that: the selected study and rail stay sticky while seven short steps scroll underneath; the step crossing the reading line is active.
 * No timer. A study stays until the reader scrolls again. The rail is a shortcut that scrolls to a band. */
const WIDE = "(min-width: 1100px)";
const subscribe = (cb: () => void) => {
  const q = window.matchMedia(WIDE);
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const getWide = () => window.matchMedia(WIDE).matches;

export function ExperienceScroll({ note }: { note: React.ReactNode }) {
  const wide = useSyncExternalStore(subscribe, getWide, () => false);
  const reduced = useReducedMotion() ?? false;
  const [idx, setIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const N = STUDIES.length;
  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    if (!wide) return;
    const section = rootRef.current?.closest("section");
    if (!section) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.max(0, Math.min(1, -rect.top / travel)) : 0;
      const i = Math.min(N - 1, Math.floor(p * N));
      setIdx(i); // a manual state is handed back to scroll here
      rootRef.current?.style.setProperty("--exp-p", (reduced ? (i + 1) / N : Math.max(1 / N / 2, p)).toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [wide, reduced, N]);

  useEffect(() => {
    if (wide) return;
    const list = stepsRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setIdx(Number((e.target as HTMLElement).dataset.step)); }),
      { rootMargin: "-48% 0px -48% 0px" },
    );
    list.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [wide]);

  useEffect(() => {
    if (!wide) rootRef.current?.style.setProperty("--exp-p", ((idx + 1) / N).toFixed(4));
  }, [wide, idx, N]);

  /* shortcut: scroll to the band of study i; scroll keeps control afterwards */
  const jump = useCallback((i: number) => {
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    if (wide) {
      const section = rootRef.current?.closest("section");
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((i + 0.5) / N) * travel, behavior });
    } else {
      stepsRef.current?.querySelectorAll("li")[i]?.scrollIntoView({ behavior, block: "center" });
    }
  }, [wide, reduced, N]);

  return (
    <div className="exp-slot" ref={rootRef}>
      <div className="exp-pin">
        <LazyEvidence sel={idx} onPick={jump} />
      </div>
      <ol className="exp-steps" ref={stepsRef} aria-label="The seven studies">
        {STUDIES.map((s, i) => (
          <li key={s.kind} data-step={i} className={i === idx ? "is-active" : undefined}>
            <span>{pad(i + 1)} / {pad(N)}</span>
            <strong>{s.label}</strong>
          </li>
        ))}
      </ol>
      {note}
    </div>
  );
}
