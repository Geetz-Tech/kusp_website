"use client";

import { useEffect } from "react";

/**
 * Calm editorial progression: when a read enters view its schematic draws in once and its architectural rule runs.
 * The read crossing the middle of the screen is marked active (quiet emphasis on its sheet). No timers.
 * Reduced motion: everything is shown drawn immediately. Nothing is hidden unless this script has run.
 */
export function InsightsReveal() {
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".ins-row"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof IntersectionObserver === "undefined") return;
    if (!reduce) rows.forEach((r) => r.classList.add("ins-armed"));
    const seen = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("ins-in"); seen.unobserve(e.target); } }),
      { rootMargin: "0px 0px -18% 0px", threshold: 0.12 },
    );
    const mid = new IntersectionObserver(
      (es) => es.forEach((e) => e.target.classList.toggle("is-active", e.isIntersecting)),
      { rootMargin: "-40% 0px -40% 0px" },
    );
    rows.forEach((r) => { seen.observe(r); mid.observe(r); });
    return () => { seen.disconnect(); mid.disconnect(); };
  }, []);
  return null;
}
