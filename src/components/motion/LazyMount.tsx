"use client";

import { startTransition, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mounts decorative, heavy SVG only when its box is within `rootMargin` of the viewport.
 * - The wrapper always fills its (explicitly sized) parent, so mounting never shifts layout.
 * - Server HTML carries no markup for the deferred drawing (it is decorative and aria-hidden;
 *   all section copy stays in server-rendered HTML).
 * - Large default margin: the drawing is in place long before it can scroll into view.
 */
export function LazyMount({ children, rootMargin = "100% 0px", className = "" }: { children: ReactNode; rootMargin?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || mounted) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setMounted(true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          // Transition: React renders the (large) SVG in interruptible slices, so a scroll in progress is not blocked.
          startTransition(() => setMounted(true));
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [mounted, rootMargin]);

  return (
    <div ref={ref} className={`lazy-mount${mounted ? " lazy-mount--in" : ""} ${className}`} data-lazy={mounted ? "in" : "pending"}>
      {mounted ? children : null}
    </div>
  );
}
