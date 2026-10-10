"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { FRAMEWORK_PAGE_STAGES } from "@/lib/page-data";
import { FrameworkBoard } from "@/components/art/FrameworkBoard";
import { Stage } from "@/components/motion/Stage";

/**
 * Framework — one continuous planning board that evolves from insight to delivery as the page scrolls.
 * Wide screens: pinned track, one scroll progress, five equal bands.
 * Tablet / phone: the board stays sticky under the header while five steps scroll beneath it;
 * the step crossing the reading line sets the stage. The rail is a progress indicator and an optional shortcut.
 * All stage titles, descriptions and notes are plain HTML (the steps list).
 */
const Q = "(min-width: 1100px)";
const subscribe = (cb: () => void) => {
  const q = window.matchMedia(Q);
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const getWide = () => window.matchMedia(Q).matches;
const N = FRAMEWORK_PAGE_STAGES.length;

export function FrameworkStory() {
  const wide = useSyncExternalStore(subscribe, getWide, () => false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const [idx, setIdx] = useState(0);
  const cur = FRAMEWORK_PAGE_STAGES[idx];
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!wide) return;
    setIdx(Math.max(0, Math.min(N - 1, Math.floor(p * N))));
    sectionRef.current?.style.setProperty("--fs-p", Math.max(0, Math.min(1, p)).toFixed(4));
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
    <section ref={sectionRef} className="page-section framework-sequence framework-track on-dark" data-header-tone="dark" id="sequence" aria-label="Observe to Deliver">
      <div className="fs-sticky stage-display" data-stage={cur.id}>
        <SectionLabel>02 / OBSERVE → DELIVER</SectionLabel>
        <div className="fs-board" aria-hidden="true">
          <div className="fs-frame">
            <Stage className="stage-fill fw-play" amount={0.01}>
              <FrameworkBoard />
            </Stage>
          </div>
          <p className="fs-caption">PLANNING BOARD / {cur.label.toUpperCase()}</p>
        </div>
        <div className="fs-left">
          <p className="fs-eyebrow">FROM INSIGHT TO IMPLEMENTATION</p>
          <div className="fs-active">
            <span className="fs-active__num">{String(idx + 1).padStart(2, "0")} / 05</span>
            <strong className="fs-active__title">{cur.label}</strong>
            <p className="fs-active__copy">{cur.copy}</p>
            <p className="fs-active__note">{cur.note}</p>
          </div>
          <div className="fs-rail" role="group" aria-label="Spatial Intelligence Framework stages" onKeyDown={onKey}>
            {FRAMEWORK_PAGE_STAGES.map((s, i) => (
              <button key={s.id} type="button" className={"fs-rail__item" + (i === idx ? " is-active" : "")} aria-current={i === idx ? "step" : undefined} onClick={() => jump(i)}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ol className="fs-steps" ref={stepsRef} aria-label="Spatial Intelligence Framework stages">
        {FRAMEWORK_PAGE_STAGES.map((s, i) => (
          <li key={s.id} data-step={i} className={i === idx ? "is-active" : undefined}>
            <span>{String(i + 1).padStart(2, "0")} / {s.label.toUpperCase()}</span>
            <h2>{s.label}</h2>
            <p>{s.copy}</p>
            <p className="fs-steps__note">{s.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
