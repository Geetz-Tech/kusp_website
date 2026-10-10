"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LazyMount } from "@/components/motion/LazyMount";
import type { SectorKey } from "@/lib/art/typologies";
import type { StudyKind } from "@/components/art/Study";

/**
 * Below-the-fold decorative drawings. Each wrapper (1) mounts only near the viewport via LazyMount and
 * (2) starts the `import()` for its code only AFTER mounting, so neither markup nor JS is fetched at load.
 * Plain `import()` (not next/dynamic) because next/dynamic is evaluated by the server render and preloaded.
 */
type Render<P> = (props: P) => ReactNode;

function useDeferred<P>(load: () => Promise<Render<P>>): Render<P> | null {
  const [render, setRender] = useState<Render<P> | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((r) => alive && setRender(() => r));
    return () => {
      alive = false;
    };
  }, [load]);
  return render;
}

const loadAerial = () => import("@/components/diagrams/AerialPlanSvg").then((m): Render<unknown> => function renderAerial() { return <m.AerialPlanSvg />; });
const loadStudy = () => import("@/components/art/Study").then((m): Render<StudyProps> => function renderStudy(p) { return <m.Study kind={p.kind} variant={p.variant} index={p.index} />; });
const loadEvidence = () => import("@/components/home/EvidenceStudio").then((m): Render<EvidenceProps> => function renderEvidence(p) { return <m.default sel={p.sel} onPick={p.onPick} />; });
const loadTypology = () => import("@/components/art/TypologyStack").then((m): Render<TypologyProps> => function renderTypology(p) { return <m.TypologyStack active={p.active} mode={p.mode} />; });

type EvidenceProps = { sel: number; onPick: (i: number) => void };
type StudyProps = { kind: StudyKind; variant?: number; index?: number };
type TypologyProps = { active: SectorKey; mode: "plan" | "axo" };

function AerialInner() {
  const render = useDeferred(loadAerial);
  return render ? render(undefined) : null;
}
function StudyInner(props: StudyProps) {
  const render = useDeferred(loadStudy);
  return render ? render(props) : null;
}
function EvidenceInner(props: EvidenceProps) {
  const render = useDeferred(loadEvidence);
  return render ? render(props) : null;
}
function TypologyInner(props: TypologyProps) {
  const render = useDeferred(loadTypology);
  return render ? render(props) : null;
}

export function LazyAerial() {
  return (
    <LazyMount>
      <AerialInner />
    </LazyMount>
  );
}
export function LazyStudy(props: StudyProps) {
  return (
    <LazyMount>
      <StudyInner {...props} />
    </LazyMount>
  );
}
export function LazyEvidence(props: EvidenceProps) {
  return (
    <LazyMount>
      <EvidenceInner {...props} />
    </LazyMount>
  );
}
export function LazyTypology(props: TypologyProps) {
  return (
    <LazyMount>
      <TypologyInner {...props} />
    </LazyMount>
  );
}
