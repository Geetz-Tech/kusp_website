"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { Eyebrow, SectionLabel } from "@/components/primitives/SectionLabel";
import { Scene3DLayer } from "@/components/three/Scene3DLayer";
import { MasterplanSvg } from "@/components/diagrams/MasterplanSvg";
import { LazyTypology } from "./LazyArt";
import { LazyMount } from "@/components/motion/LazyMount";
import { TeaserLink } from "@/components/primitives/ActionLink";
import { FRAMEWORK_STAGES, LENSES, READINGS, SECTORS } from "@/lib/home-data";

/* 02 / READ — the site is read layer by layer as the section scrolls.
 * Desktop (>=1100px, JS): a pinned track; one continuous scroll progress selects one of six readings (equal bands).
 * Below that: a sticky model with six short steps whose entering view selects the reading.
 * No JS: model + all six readings as plain steps. The bottom labels are progress indicators and direct-jump controls. */
const WHO_QUERY = "(min-width: 1100px)";
const subscribeWho = (cb: () => void) => {
  const q = window.matchMedia(WHO_QUERY);
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const getWho = () => window.matchMedia(WHO_QUERY).matches;

export function WhoSection() {
  const wide = useSyncExternalStore(subscribeWho, getWho, () => false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const [idx, setIdx] = useState(0);
  const current = READINGS[idx];
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!wide) return;
    setIdx(Math.max(0, Math.min(READINGS.length - 1, Math.floor(p * READINGS.length))));
    sectionRef.current?.style.setProperty("--who-p", Math.max(0, Math.min(1, p)).toFixed(4));
  });

  /* tablet / phone: the step that crosses the middle of the viewport is the active reading */
  useEffect(() => {
    if (wide) return;
    const list = stepsRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setIdx(Number((e.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    list.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [wide]);

  const jump = useCallback(
    (i: number) => {
      const el = sectionRef.current;
      if (!el) return;
      if (wide) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const travel = el.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + ((i + 0.5) / READINGS.length) * travel, behavior: "smooth" });
      } else {
        stepsRef.current?.querySelectorAll("li")[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [wide],
  );

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(READINGS.length - 1, idx + dir));
    jump(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return (
    <section ref={sectionRef} className="who home-section who-track" id="who" data-header-tone="dark" aria-labelledby="who-title">
      <SectionLabel variant="code">02 / READ</SectionLabel>
      <div className="who-sticky">
        <div className="who-copy">
          <Eyebrow>WHO WE ARE</Eyebrow>
          <h2 id="who-title">
            Ideas become <em>places.</em>
          </h2>
          <p>
            We partner with governments, public agencies, private developers and international institutions to create resilient, economically competitive and future-ready places — combining strategic thinking, spatial intelligence and technical excellence.
          </p>
          <TeaserLink href="/about">About the practice</TeaserLink>
        </div>
        <div className="reading-stage">
          <div className="plan-view reading-plan" data-read={current.id}>
            <LazyMount>
              <MasterplanSvg layers={["reading"]} />
            </LazyMount>
          </div>
          <div className="reading-legend">
            <span>{current.index}</span>
            <strong>{current.title}</strong>
            <p>{current.copy}</p>
          </div>
          <div className="reading-controls" role="group" aria-label="Read the place layers" onKeyDown={onKey}>
            {READINGS.map((r, i) => (
              <button key={r.id} type="button" className={`reading-control${i === idx ? " is-active" : ""}`} aria-current={i === idx ? "step" : undefined} onClick={() => jump(i)}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ol className="reading-steps" ref={stepsRef} aria-label="The six readings of the place">
        {READINGS.map((r, i) => (
          <li key={r.id} data-step={i} className={i === idx ? "is-active" : undefined}>
            <span>{r.index}</span>
            <strong>{r.title}</strong>
            <p>{r.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* 03 / LENSES — five practices, one place. Scroll is the only primary controller.
 * Wide screens (>=1100px): the section is a pinned track; one persistent place transforms as the reader scrolls.
 * Below that: the place stays sticky while five short steps scroll underneath; the step crossing the reading line is active.
 * No timer and no idle cycling: a lens stays until the reader scrolls again. The five controls are shortcuts that scroll to a lens.
 * The server HTML is always the static state, so no-JS keeps the full lens content. */
const PIN_QUERY = "(min-width: 1100px)";
const subscribePin = (cb: () => void) => {
  const q = window.matchMedia(PIN_QUERY);
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const getPin = () => window.matchMedia(PIN_QUERY).matches;

/** Scroll thresholds of the pinned track: base, then one band per lens. */
const LENS_BOUNDS = [0.2, 0.35, 0.5, 0.65, 0.8];
const LENS_ANCHORS = [0.275, 0.425, 0.575, 0.725, 0.9];
const stageAt = (p: number) => LENS_BOUNDS.filter((b) => p >= b).length - 1;
/** Continuous 0..5 (base .. sustainability) for camera reframing. */
const stageFloat = (p: number) => {
  const a = [0.1, ...LENS_ANCHORS];
  if (p <= a[0]) return 0;
  for (let i = 1; i < a.length; i++) if (p <= a[i]) return i - 1 + (p - a[i - 1]) / (a[i] - a[i - 1]);
  return 5;
};

export function PracticeSection() {
  const pinned = useSyncExternalStore(subscribePin, getPin, () => false);
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const [picked, setPicked] = useState(0);
  const [scrollStage, setScrollStage] = useState(-1);
  const stage = pinned ? scrollStage : picked;
  const stageF = useMotionValue(1);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const group = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!pinned) return;
    const st = stageAt(p);
    setScrollStage(st); // same value is a no-op
    // reduced motion: the camera and the rail step directly at the thresholds, no interpolation
    stageF.set(reduced ? st + 1 : stageFloat(p));
    sectionRef.current?.style.setProperty("--lens-p", (reduced ? (st < 0 ? 0.1 : LENS_ANCHORS[st]) : p).toFixed(4));
  });
  useEffect(() => {
    if (!pinned) stageF.set(picked + 1);
  }, [pinned, picked, stageF]);

  /* tablet / phone: the step that crosses the middle of the viewport is the active lens */
  useEffect(() => {
    if (pinned) return;
    const list = stepsRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setPicked(Number((e.target as HTMLElement).dataset.step)); }),
      { rootMargin: "-48% 0px -48% 0px" },
    );
    list.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [pinned]);

  const choose = useCallback((i: number) => {
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    if (pinned) {
      const el = sectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + LENS_ANCHORS[i] * travel, behavior });
    } else if (stepsRef.current && getComputedStyle(stepsRef.current).display !== "none") {
      stepsRef.current.querySelectorAll("li")[i]?.scrollIntoView({ behavior, block: "center" });
    } else {
      setPicked(i); // no-JS-like static layout: the controls stay the way to read each lens
    }
  }, [pinned, reduced]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const from = stage < 0 ? (dir > 0 ? -1 : 0) : stage;
    const next = Math.max(0, Math.min(LENSES.length - 1, from + dir));
    choose(next);
    group.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus({ preventScroll: true });
  };

  const current = stage >= 0 ? LENSES[stage] : null;
  const num = String(stage + 1).padStart(2, "0");
  return (
    <section ref={sectionRef} className="practice home-section lens-track" id="practice" data-header-tone="light" aria-labelledby="practice-title">
      <div className="lens-sticky">
        <SectionLabel variant="code">03 / LENSES</SectionLabel>
        <div className="lens-left">
          <div className="practice-heading">
            <Eyebrow>ONE PLACE. FIVE PROFESSIONAL LENSES.</Eyebrow>
            <h2 id="practice-title">
              Every decision<br />changes the <em>whole.</em>
            </h2>
          </div>
          <div className="lens-active">
            <span className="lens-active__num">{current ? num + " / 05" : "BASE PLACE"}</span>
            <strong className="lens-active__title">{current ? current.label[0] + " " + current.label[1] : "One place. Five professional lenses."}</strong>
            {current ? <span className="lens-active__tag">{current.caption}</span> : null}
            {current ? <p className="lens-active__copy">{current.copy}</p> : null}
          </div>
          <div className="lens-controls" role="group" aria-label="KUSP practice areas" ref={group} onKeyDown={onKey}>
            {LENSES.map((l, i) => (
              <button
                key={l.id}
                type="button"
                className={"lens-control" + (i === stage ? " is-active" : "")}
                aria-pressed={i === stage}
                aria-current={i === stage ? "true" : undefined}
                onClick={() => choose(i)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <i className="lens-control__label">{l.label[0]} {l.label[1]}</i>
              </button>
            ))}
          </div>
          <ol className="lens-steps" ref={stepsRef} aria-label="The five practice lenses">
            {LENSES.map((l, i) => (
              <li key={l.id} data-step={i} className={i === stage ? "is-active" : undefined}>
                <span>{String(i + 1).padStart(2, "0")} / 05</span>
                <strong>{l.label[0]} {l.label[1]}</strong>
                <small>{l.caption}</small>
                <p>{l.copy}</p>
              </li>
            ))}
          </ol>
          <TeaserLink href="/expertise">Explore the five practices</TeaserLink>
        </div>
        <div className="practice-stage">
          <div className="plan-view lens-plan" data-lens={current ? current.id : "base"}>
            <LazyMount>
              <MasterplanSvg layers={["phasing", "intensity", "transit", "ecology", "gis"]} />
            </LazyMount>
            <Scene3DLayer mode="lens" stage={stage} stageF={stageF} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* 04 / TRANSFORM — a calm teaser: one board, one stage at a time, driven by scroll.
 * Desktop (>=1100px, JS): the section is a short pinned track; one scroll progress value selects one of five equal bands.
 * Below that: the board stays sticky while five short steps scroll underneath; the step crossing the reading line is active.
 * Nothing advances on a timer, and a stage stays until the reader scrolls again. The stage labels jump to a band (optional).
 * The detailed, pinned sequence belongs to /framework. */
export function FrameworkSequence() {
  const wide = useSyncExternalStore(subscribeWho, getWho, () => false);
  const reduced = useReducedMotion() ?? false;
  const [idx, setIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const cur = FRAMEWORK_STAGES[idx];
  const last = FRAMEWORK_STAGES.length - 1;

  /* desktop: one progress value across the track (section top at viewport top -> section bottom at viewport bottom) */
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
      const i = Math.min(last, Math.floor(p * FRAMEWORK_STAGES.length));
      setIdx(i); // the same value is a no-op; a manual state is handed back to scroll here
      rootRef.current?.style.setProperty("--fw-p", (reduced ? (i + 1) / FRAMEWORK_STAGES.length : Math.max(0.04, p)).toFixed(4));
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
  }, [wide, reduced, last]);

  /* tablet / phone: the step that crosses the middle of the viewport is the active stage */
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
    if (!wide) rootRef.current?.style.setProperty("--fw-p", ((idx + 1) / FRAMEWORK_STAGES.length).toFixed(4));
  }, [wide, idx]);

  /* the stage labels are shortcuts: they scroll to the matching band, and scroll then keeps control */
  const jump = useCallback((i: number) => {
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    if (wide) {
      const section = rootRef.current?.closest("section");
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((i + 0.5) / FRAMEWORK_STAGES.length) * travel, behavior });
    } else {
      stepsRef.current?.querySelectorAll("li")[i]?.scrollIntoView({ behavior, block: "center" });
    }
  }, [wide, reduced]);

  const onKey = (e: KeyboardEvent<HTMLOListElement>) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(last, idx + dir));
    jump(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next]?.focus({ preventScroll: true });
  };

  return (
    <div className="fw-right" ref={rootRef}>
      <div className="fw-pin">
        <div className="framework-stage" data-framework-stage={cur.id}>
          <div className="framework-grid" aria-hidden="true" />
          <div className="plan-view framework-plan" data-framework={cur.id}>
            <LazyMount>
              <MasterplanSvg />
            </LazyMount>
          </div>
        </div>
        <div className="fw-meta">
          <div className="framework-status">
            <span>{cur.index}</span>
            <strong>{cur.title}</strong>
            <p>{cur.copy}</p>
          </div>
          <ol className="framework-controls" aria-label="Spatial Intelligence Framework stages" onKeyDown={onKey}>
            {FRAMEWORK_STAGES.map((s, i) => (
              <li key={s.id}>
                <button type="button" className={`framework-control${i === idx ? " is-active" : ""}`} aria-current={i === idx ? "step" : undefined} onClick={() => jump(i)}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <ol className="fw-steps" ref={stepsRef} aria-label="The five stages of the framework">
        {FRAMEWORK_STAGES.map((s, i) => (
          <li key={s.id} data-step={i} className={i === idx ? "is-active" : undefined}>
            <span>{s.index}</span>
            <strong>{s.title}</strong>
            <p>{s.copy}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* 05 / REACH — eight sector typologies, advanced by scroll.
 * Desktop (>=1100px, JS): a short pinned track; one scroll progress value selects one of eight equal bands.
 * Below that: the typology stays sticky while eight short steps scroll underneath; the step crossing the reading line is active.
 * No timer, no hover or click needed. The list, arrows and arrow keys are shortcuts that scroll to a band. */
export function SectorStage() {
  const wide = useSyncExternalStore(subscribeWho, getWho, () => false);
  const reduced = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const N = SECTORS.length;
  const current = SECTORS[index];
  const sector = current.id;

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
      setIndex(i); // a manual state is handed back to scroll here
      section.style.setProperty("--sec-p", (reduced ? (i + 1) / N : Math.max(1 / N / 2, p)).toFixed(4));
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
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.step)); }),
      { rootMargin: "-48% 0px -48% 0px" },
    );
    list.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [wide]);

  useEffect(() => {
    if (!wide) rootRef.current?.closest("section")?.style.setProperty("--sec-p", ((index + 1) / N).toFixed(4));
  }, [wide, index, N]);

  const jump = useCallback((i: number) => {
    const to = Math.max(0, Math.min(N - 1, i));
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    if (wide) {
      const section = rootRef.current?.closest("section");
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((to + 0.5) / N) * travel, behavior });
    } else if (stepsRef.current && getComputedStyle(stepsRef.current).display !== "none") {
      stepsRef.current.querySelectorAll("li")[to]?.scrollIntoView({ behavior, block: "center" });
    } else {
      setIndex(to);
    }
  }, [wide, reduced, N]);

  const onKey = (e: KeyboardEvent<HTMLOListElement>) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(N - 1, index + d));
    jump(next);
    listRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus({ preventScroll: true });
  };

  return (
    <>
      <div className="sector-stage" ref={rootRef}>
        <div className="sector-datum">
          <span>{String(index + 1).padStart(2, "0")} / 08</span>
          <i />
          <span>SPATIAL TYPOLOGY</span>
        </div>
        <div className="sector-typology" data-sector-diagram={sector} aria-hidden="true">
          <LazyTypology active={sector} mode="plan" />
        </div>
        <p className="sector-caption">{current.caption}</p>
        <i className="sector-progress" aria-hidden="true" />
        <div className="sector-nav">
          <button type="button" aria-label="Previous sector" onClick={() => jump(index - 1)}>←</button>
          <button type="button" aria-label="Next sector" onClick={() => jump(index + 1)}>→</button>
        </div>
      </div>
      <ol className="sector-list" ref={listRef} aria-label="KUSP sectors and markets" onKeyDown={onKey}>
        {SECTORS.map((s, i) => (
          <li key={s.id} className={`sector-item sector-item--${s.id}${s.id === sector ? " is-active" : ""}`}>
            <button type="button" aria-pressed={s.id === sector} aria-current={s.id === sector ? "true" : undefined} onClick={() => jump(i)}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{s.name}</strong>
              <small>{s.typology}</small>
            </button>
          </li>
        ))}
      </ol>
      <ol className="sector-steps" ref={stepsRef} aria-label="The eight sectors">
        {SECTORS.map((s, i) => (
          <li key={s.id} data-step={i} className={i === index ? "is-active" : undefined}>
            <span>{String(i + 1).padStart(2, "0")} / 08</span>
            <strong>{s.name}</strong>
            <small>{s.typology}</small>
          </li>
        ))}
      </ol>
    </>
  );
}
