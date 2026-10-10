"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Selection state shared between detached controls, diagram hosts and text panels.
 * Panels stay in the DOM (hidden) so all capability copy remains crawlable and reachable.
 */
const StateContext = createContext<{ state: string; set: (value: string) => void } | null>(null);

function useGroup() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("State primitives must be rendered inside <StateGroup>");
  return ctx;
}

export function StateGroup({ initial, children }: { initial: string; children: ReactNode }) {
  const [state, set] = useState(initial);
  return <StateContext.Provider value={{ state, set }}>{children}</StateContext.Provider>;
}

type ButtonProps = { value: string; className: string; children: ReactNode; ariaLabel?: string };

export function StateButton({ value, className, children, ariaLabel }: ButtonProps) {
  const { state, set } = useGroup();
  const active = state === value;
  return (
    <button
      type="button"
      className={`${className}${active ? " is-active" : ""}`}
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={() => set(value)}
    >
      {children}
    </button>
  );
}

export function StatePanel({ value, className, children }: { value: string; className?: string; children: ReactNode }) {
  const { state } = useGroup();
  return (
    <article className={className} hidden={state !== value}>
      {children}
    </article>
  );
}

/** Diagram host: exposes the current selection to CSS as data-state plus an optional named data attribute. */
export function StateHost({
  className,
  attr,
  label,
  decorative = false,
  children,
}: {
  className: string;
  attr?: "lens" | "stage";
  label?: string;
  decorative?: boolean;
  children?: ReactNode;
}) {
  const { state } = useGroup();
  const extra = attr ? { [`data-${attr}`]: state } : {};
  return (
    <div
      className={className}
      data-state={state}
      {...extra}
      aria-hidden={decorative || undefined}
      role={!decorative && label ? "group" : undefined}
      aria-label={decorative ? undefined : label}
    >
      {children}
    </div>
  );
}
