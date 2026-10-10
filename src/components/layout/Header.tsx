"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NAV } from "@/lib/site";
import { Logo } from "@/components/brand/Logo";

type Tone = "light" | "dark";

/**
 * Adaptive header: ivory on light fields, near-black on dark fields.
 * The tone follows whichever `[data-header-tone]` section sits just below the header.
 */
export function Header({ initialTone = "light" }: { initialTone?: Tone }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [tone, setTone] = useState<Tone>(initialTone);
  // The panel is tied to the route it was opened on, so navigating closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = useCallback((next: boolean | ((v: boolean) => boolean)) => {
    setOpenAt((prev) => ((typeof next === "function" ? next(prev === pathname) : next) ? pathname : null));
  }, [pathname]);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const readTone = useCallback(() => {
    const header = headerRef.current;
    if (!header) return;
    const point = document.elementFromPoint(window.innerWidth / 2, header.offsetHeight + 18);
    const section = point?.closest<HTMLElement>("[data-header-tone]");
    if (section) setTone(section.dataset.headerTone === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-header-tone]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setTone((visible.target as HTMLElement).dataset.headerTone === "dark" ? "dark" : "light");
      },
      { threshold: [0.2, 0.5, 0.75] },
    );
    sections.forEach((s) => observer.observe(s));
    window.addEventListener("scroll", readTone, { passive: true });
    window.addEventListener("resize", readTone);
    readTone();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", readTone);
      window.removeEventListener("resize", readTone);
    };
  }, [pathname, readTone]);

  // Panel behaviour: scroll lock, Escape, focus trap, restore focus.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = [
        toggleRef.current,
        ...Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? []),
      ].filter((el): el is HTMLElement => !!el);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 800) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, setOpen]);

  return (
    <>
      <header ref={headerRef} className="site-header" data-tone={open ? "dark" : tone}>
        <Link className="wordmark" href="/" aria-label="KUSP, Krishvi Unified Solutions Partners — home">
          <Logo responsive="header" />
        </Link>
        <nav aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          ref={toggleRef}
          className="menu-mark"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            className="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <ol>
              {NAV.map((item, i) => (
                <li key={item.href}>
                  <Link
                    className="mobile-nav__link"
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mobile-nav__foot">
              <Link className="mobile-nav__cta" href="/contact">
                Start a Project <b aria-hidden="true">↗</b>
              </Link>
              <p>KUSP / Krishvi Unified Solutions Partners</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
