"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
  /** Vertical camera drift in px across the element's pass through the viewport (0 = none). */
  drift?: number;
  /** Fraction of the element that must be visible before the sequence plays. */
  amount?: number;
  as?: "div" | "nav";
  style?: CSSProperties;
  role?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
};

/**
 * Motion stage: exposes `data-play="ready" | "in"` to CSS so each drawing can run its own
 * planning-logic sequence (line draw, parcel reveal, massing rise…) once it enters view.
 * Optional scroll drift is a restrained camera re-frame. Reduced motion: plays immediately,
 * never drifts. Hidden states only exist under `.js` + `prefers-reduced-motion: no-preference`.
 */
export function Stage({ className, children, drift = 0, amount = 0.3, as = "div", style, ...aria }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);
  const C = as === "nav" ? motion.nav : motion.div;
  return (
    <C
      ref={ref}
      className={className}
      data-play={reduce || inView ? "in" : "ready"}
      style={drift && !reduce ? { ...style, y } : style}
      {...aria}
    >
      {children}
    </C>
  );
}
