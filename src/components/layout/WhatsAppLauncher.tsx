"use client";

import { useEffect, useRef, useState } from "react";
import { OFFICES } from "@/lib/site";

/**
 * Site-wide "Chat with KUSP" launcher: one compact icon-only button (tooltip on hover/focus) that opens a small chooser (UAE / India office).
 * Links go straight to the confirmed WhatsApp numbers in a new tab. Non-modal: no focus trap; Escape closes and returns focus.
 */
export function WhatsAppLauncher() {
  const [open, setOpen] = useState(false);
  const [crowded, setCrowded] = useState(false);
  const [tipOff, setTipOff] = useState(false); // Escape dismisses the tooltip (WCAG 1.4.13) until the pointer or focus leaves
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    first.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus({ preventScroll: true });
      }
    };
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  /* Never sit on top of a control: while any link, button or field of the page is in the launcher's corner,
     the launcher tucks to a slim edge tab (hover, focus or opening it brings it back). */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    let io: IntersectionObserver | null = null;
    const inCorner = new Set<Element>();
    const usable = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return false;
      const cs = getComputedStyle(el);
      return cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.1;
    };
    const build = () => {
      io?.disconnect();
      inCorner.clear();
      setCrowded(false);
      const btn = root.current?.querySelector(".wa__btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const top = Math.max(0, window.innerHeight - r.height - 28);
      const left = Math.max(0, window.innerWidth - r.width - 28);
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => (e.isIntersecting && usable(e.target) ? inCorner.add(e.target) : inCorner.delete(e.target)));
          setCrowded([...inCorner].some(usable));
        },
        { rootMargin: `${-top}px 0px 0px ${-left}px` },
      );
      document.querySelectorAll("main a, main button, main input, main textarea, main summary, header a, header button, footer a").forEach((el) => {
        if (!el.closest(".wa")) io!.observe(el);
      });
    };
    build();
    window.addEventListener("resize", build);
    const mo = new MutationObserver(() => { window.clearTimeout(t); t = window.setTimeout(build, 400); });
    let t = 0;
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io?.disconnect(); mo.disconnect(); window.clearTimeout(t); window.removeEventListener("resize", build); };
  }, []);

  return (
    <aside className="wa" data-dodge={crowded && !open ? "true" : undefined} data-tip-off={tipOff || open ? "true" : undefined} ref={root} aria-label="Chat with KUSP">
      <div className="wa__panel" id="wa-panel" role="group" aria-label="Chat with KUSP on WhatsApp" hidden={!open}>
        {OFFICES.map((o, i) => (
          <a
            key={o.id}
            ref={i === 0 ? first : undefined}
            className="wa__opt"
            href={o.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span className="wa__k">{o.label} OFFICE</span>
            <span className="wa__n">{o.phone}</span>
            <span className="wa__cta">{o.whatsappLabel} <b aria-hidden="true">↗</b><span className="sr-only"> on WhatsApp (opens in a new tab)</span></span>
          </a>
        ))}
      </div>
      <div className="wa__ctl">
        <button
          ref={button}
          type="button"
          className="wa__btn"
          aria-label="Chat with KUSP"
          aria-expanded={open}
          aria-controls="wa-panel"
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => { if (e.key === "Escape" && !open) setTipOff(true); }}
          onPointerLeave={() => setTipOff(false)}
          onBlur={() => setTipOff(false)}
        >
          <svg className="wa__ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
            <path d="M4 5.5h16v10.5H11.5L7 20v-4H4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 9.2h8M8 12.3h5" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="wa__tip" aria-hidden="true">Chat with KUSP</span>
      </div>
    </aside>
  );
}
