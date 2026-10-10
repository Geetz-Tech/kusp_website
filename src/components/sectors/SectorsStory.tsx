"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { Eyebrow, SectionLabel } from "@/components/primitives/SectionLabel";
import { SECTORS } from "@/lib/home-data";
import { TypologyStack } from "@/components/art/TypologyStack";

/**
 * Sectors — scroll walks through the eight spatial typologies.
 * Wide screens: a sticky stage; one continuous scroll progress selects the sector (eight equal bands).
 * Tablet / phone: the stage stays sticky while eight short steps scroll beneath it; the step crossing the reading line is active.
 * The index is a progress system and an optional shortcut. All names and scopes are plain HTML (steps + scope list below).
 */
const Q = "(min-width: 1100px)";
const subscribe = (cb: () => void) => {
  const q = window.matchMedia(Q);
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const getWide = () => window.matchMedia(Q).matches;

export function SectorsStory() {
  const wide = useSyncExternalStore(subscribe, getWide, () => false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const [idx, setIdx] = useState(0);
  const cur = SECTORS[idx];
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!wide) return;
    setIdx(Math.max(0, Math.min(SECTORS.length - 1, Math.floor(p * SECTORS.length))));
    sectionRef.current?.style.setProperty("--ss-p", Math.max(0, Math.min(1, p)).toFixed(4));
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
      window.scrollTo({ top: top + ((i + 0.5) / SECTORS.length) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
    } else {
      stepsRef.current?.querySelectorAll("li")[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [wide]);

  const onKey = (e: KeyboardEvent<HTMLOListElement>) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const at = btns.indexOf(document.activeElement as HTMLButtonElement);
    const n = Math.max(0, Math.min(SECTORS.length - 1, (at < 0 ? idx : at) + d));
    jump(n);
    btns[n]?.focus({ preventScroll: true });
  };

  return (
    <section ref={sectionRef} className="page-section sectors-hero sectors-track on-dark" data-header-tone="dark" id="typologies" aria-labelledby="sectors-title">
      <div className="ss-sticky">
        <SectionLabel>01 / SECTORS &amp; MARKETS</SectionLabel>
        <div className="ss-main">
          <div className="ss-heading">
            <Eyebrow>EIGHT SPATIAL TYPOLOGIES</Eyebrow>
            <h1 id="sectors-title">
              Spatial knowledge, <em>many conditions.</em>
            </h1>
          </div>
          <div className="ss-stage" data-sector={cur.id}>
            <p className="ss-tag" aria-hidden="true">SPATIAL TYPOLOGY / SCHEMATIC / NOT TO SCALE</p>
            <div className="ss-art" aria-hidden="true">
              <TypologyStack active={cur.id} mode="axo" />
            </div>
            <p className="ss-typ" aria-hidden="true">{cur.typology}</p>
          </div>
        </div>
        <aside className="ss-side">
          <div className="ss-active">
            <span className="ss-active__num">{String(idx + 1).padStart(2, "0")} / 08</span>
            <strong className="ss-active__title">{cur.name}</strong>
            <p className="ss-active__scope">{cur.scope}</p>
          </div>
          <ol className="ss-index" aria-label="KUSP sectors and markets" onKeyDown={onKey}>
            {SECTORS.map((s, i) => (
              <li key={s.id} className={i === idx ? "is-current" : undefined}>
                <button type="button" aria-current={i === idx ? "true" : undefined} onClick={() => jump(i)}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s.name}
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
      <ol className="ss-steps" ref={stepsRef} aria-label="Sectors and markets">
        {SECTORS.map((s, i) => (
          <li key={s.id} data-step={i} className={i === idx ? "is-active" : undefined}>
            <span>{String(i + 1).padStart(2, "0")} / 08</span>
            <strong>{s.name}</strong>
            <p>{s.scope}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
