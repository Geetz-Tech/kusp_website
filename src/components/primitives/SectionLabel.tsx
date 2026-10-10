import type { ReactNode } from "react";

/** Numbered section code (e.g. "02 / READ"). Sits in the protected clearance band below the sticky header. */
export function SectionLabel({ children, variant = "index" }: { children: ReactNode; variant?: "index" | "code" }) {
  return <div className={variant === "code" ? "section-code" : "section-index"}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function SchematicTag({ children }: { children: ReactNode }) {
  return <span className="schematic-tag">{children}</span>;
}
