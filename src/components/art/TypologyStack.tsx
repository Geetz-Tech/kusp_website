"use client";

import { memo, useEffect, useState } from "react";
import { Typology } from "./Typology";
import { Stage } from "@/components/motion/Stage";
import type { SectorKey } from "@/lib/art/typologies";

const Frame = memo(function Frame({ kind, mode, on }: { kind: SectorKey; mode: "plan" | "axo"; on: boolean }) {
  return (
    <div className={`ty-frame${on ? " is-on" : ""}`}>
      <Typology kind={kind} mode={mode} />
    </div>
  );
});

type State = { active: SectorKey; prev: SectorKey | null; entered: boolean };

/**
 * Only the active micro-world is mounted. When the selection changes, the previous world stays
 * mounted just long enough to fade out while the new one resolves in, then is dropped.
 */
export function TypologyStack({ active, mode }: { active: SectorKey; mode: "plan" | "axo" }) {
  const [state, setState] = useState<State>({ active, prev: null, entered: true });
  if (state.active !== active) setState({ active, prev: state.active, entered: false });

  useEffect(() => {
    if (state.entered) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setState((s) => ({ ...s, entered: true }))));
    return () => cancelAnimationFrame(id);
  }, [state.entered, state.active]);

  useEffect(() => {
    if (!state.prev) return;
    const t = window.setTimeout(() => setState((s) => ({ ...s, prev: null })), 800);
    return () => window.clearTimeout(t);
  }, [state.prev, state.active]);

  return (
    <Stage className={`ty-stack ty-stack--${mode}`} amount={0.3}>
      {state.prev && state.prev !== state.active ? <Frame key={state.prev} kind={state.prev} mode={mode} on={!state.entered} /> : null}
      <Frame key={state.active} kind={state.active} mode={mode} on={state.entered} />
    </Stage>
  );
}
