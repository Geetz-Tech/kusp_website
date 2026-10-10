"use client";

import { useEffect } from "react";

/**
 * Calm editorial reveals for the rest of the About page: items rise and clarify once as they enter the viewport.
 * Nothing is hidden before this runs (no-JS and reduced motion see everything); items are marked first, then observed.
 */
export function AboutReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    const items = document.querySelectorAll<HTMLElement>("[data-reveal] > *, .why-rows li");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    items.forEach((el, i) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen at load: no fade
      el.classList.add("rv");
      el.style.setProperty("--rv-d", `${(i % 6) * 60}ms`);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
