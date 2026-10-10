"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { Study } from "@/components/art/Study";
import { STUDIES } from "./studies";

/**
 * Collective Professional Experience — a curated studio selection.
 * One large selected study (the focus) with the other studies as a quieter rail beneath it.
 * The selection is controlled by the scroll story (ExperienceScroll); the rail only jumps to a band.
 * All studies are neutral, unattributed schematics (no individual, client or project attribution).
 */
export { STUDIES };

export default function EvidenceStudio({ sel, onPick }: { sel: number; onPick: (i: number) => void }) {
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const cur = STUDIES[sel];
  const pad = (n: number) => String(n).padStart(2, "0");

  /* keep the active thumbnail visible inside a horizontally scrolling rail, without ever moving the page */
  useEffect(() => {
    const el = rail.current;
    const btn = el?.querySelectorAll<HTMLButtonElement>("button")[sel];
    if (!el || !btn || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [sel, reduced]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(STUDIES.length - 1, sel + d));
    onPick(next);
    rail.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus({ preventScroll: true });
  };

  return (
    <div className="exp-studio">
      <p className="exp-label" aria-hidden="true">
        SELECTED STUDY <span>{pad(sel + 1)} / {pad(STUDIES.length)}</span>
      </p>
      <i className="exp-progress" aria-hidden="true" />
      <figure className="exp-main" key={sel}>
        <Study kind={cur.kind} variant={sel + 1} index={sel + 1} />
        <figcaption className="sr-only">{cur.label}, neutral study</figcaption>
      </figure>
      <div className="exp-rail" role="group" aria-label="Supporting studies" ref={rail} onKeyDown={onKey}>
        {STUDIES.map((s, i) => (
          <button key={s.kind} type="button" className={"exp-thumb" + (i === sel ? " is-active" : "")} aria-current={i === sel ? "true" : undefined} onClick={() => onPick(i)}>
            <span className="exp-thumb__sheet" aria-hidden="true">
              <Study kind={s.kind} variant={i + 1} index={i + 1} plain />
            </span>
            <span className="exp-thumb__label">
              <b>{pad(i + 1)}</b> {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
