import Image from "next/image";

/**
 * KUSP logo — frozen Concept A / Datum. Path-based SVGs from /public/brand (no font dependency).
 * Both tone versions are rendered; CSS (`.site-header[data-tone]`, `.on-dark`) shows exactly one,
 * so tone switching never needs JS and cannot shift layout.
 *
 * lockup   = wordmark + descriptor (minimum 280px wide — never render narrower)
 * wordmark = KUSP + datum only (minimum 96px wide)
 */
type Variant = "lockup" | "wordmark";

const SIZE: Record<Variant, { w: number; h: number }> = {
  lockup: { w: 779, h: 133 },
  wordmark: { w: 422, h: 133 },
};

function Pair({ variant, className }: { variant: Variant; className: string }) {
  const { w, h } = SIZE[variant];
  return (
    <span className={`brand-logo__${variant} ${className}`}>
      <Image className="brand-logo__ink" src={`/brand/kusp-${variant === "lockup" ? "primary" : "wordmark"}-dark.svg`} width={w} height={h} alt="" unoptimized priority />
      <Image className="brand-logo__light" src={`/brand/kusp-${variant === "lockup" ? "primary" : "wordmark"}-light.svg`} width={w} height={h} alt="" unoptimized priority />
    </span>
  );
}

/** Shows the lockup on wide viewports and the wordmark on narrow ones (breakpoints in globals.css). */
export function Logo({ responsive = "header" }: { responsive?: "header" | "footer" }) {
  return (
    <span className={`brand-logo brand-logo--${responsive}`}>
      <Pair variant="lockup" className="brand-logo__wide" />
      <Pair variant="wordmark" className="brand-logo__narrow" />
    </span>
  );
}
