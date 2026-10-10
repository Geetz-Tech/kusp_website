"use client";

import type React from "react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { SceneMode } from "./controllers";
import { quiet } from "./quiet";

/**
 * Progressive-enhancement host for the 3D masterplan. The server-rendered SVG masterplan is
 * always the first paint, the LCP element, the no-JS view and the failure fallback. This layer
 * loads the WebGL chunk only after `load` + idle, only on wide screens, only when WebGL is
 * usable and the device looks capable, and fades in over the SVG once a frame has been drawn.
 */


const WIDE = "(min-width: 1100px)";
const subscribeWide = (cb: () => void) => {
  const q = window.matchMedia(WIDE);
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const getWide = () => window.matchMedia(WIDE).matches;

let probe: boolean | null = null;
/** Cheap capability gate: real WebGL (no software fallback), not data-saver, not a low-end device. */
function sceneCapable(): boolean {
  if (probe !== null) return probe;
  try {
    // development-only override (allows software WebGL); `process.env.NODE_ENV` is inlined, so this is stripped from production bundles
    const force = process.env.NODE_ENV !== "production" && (window as Window & { __kuspForce3d?: boolean }).__kuspForce3d === true;
    performance.mark("kusp3d:probe-start");
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (!force && nav.connection?.saveData) return (probe = false);
    if (!force && ((nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4)) return (probe = false);
    const c = document.createElement("canvas");
    const opts = { failIfMajorPerformanceCaveat: !force };
    const gl = c.getContext("webgl2", opts) ?? c.getContext("webgl", opts);
    if (!gl) return (probe = false);
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    probe = true;
    performance.mark("kusp3d:probe-end");
  } catch {
    probe = false;
  }
  return probe;
}

const LazyScene = lazy(async () => {
  await quiet(2200); // evaluating the chunk is one long task: only when the user is not interacting
  performance.mark("kusp3d:import-start");
  await import("three"); // evaluate the renderer first and on its own, so the work is two shorter tasks instead of one
  performance.mark("kusp3d:three-end");
  await quiet(350);
  const m = await import("./LivingMasterplan3D");
  performance.mark("kusp3d:import-end");
  await m.prepare(); // geometry is built in short slices (each waits for a calm moment)
  await quiet(900);
  return m;
});

/** True once the page has loaded and idled, the screen is wide and the device can run WebGL. */
function useSceneAllowed(): boolean {
  const wide = useSyncExternalStore(subscribeWide, getWide, () => false);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (!wide) return;
    let cancelled = false;
    let timer = 0;
    const go = async () => {
      await quiet(2200); // creating the probe context can take a long task on a cold GPU process
      if (!cancelled && sceneCapable()) {
        performance.mark("kusp3d:allowed");
        setAllowed(true);
      }
    };
    const afterLoad = () => {
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      // settle first: the first seconds after load are when people start to scroll, so WebGL start-up waits them out
      idle(() => { timer = window.setTimeout(go, 3200); }, { timeout: 3000 });
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("load", afterLoad);
    };
  }, [wide]);
  return wide && allowed;
}

/** Near the viewport — and calm: entering only counts after a quiet window, so mounting never lands mid-scroll. */
function useNear(ref: React.RefObject<HTMLElement | null>, margin: string) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let token = 0;
    const io = new IntersectionObserver(([e]) => {
      const t = ++token;
      if (!e.isIntersecting) {
        // tearing a WebGL context down is itself a long task: do it in a quiet moment, never mid-scroll
        quiet(800).then(() => {
          if (t === token) setNear(false);
        });
        return;
      }
      quiet(1500).then(() => {
        if (t === token) setNear(true);
      });
    }, { rootMargin: margin });
    io.observe(el);
    return () => {
      token++;
      io.disconnect();
    };
  }, [ref, margin]);
  return near;
}

export function Scene3DLayer({ mode, stage = -1, stageF, push }: { mode: SceneMode; stage?: number; stageF?: MotionValue<number>; push?: MotionValue<number> }) {
  const allowed = useSceneAllowed();
  const reduced = useReducedMotion() ?? false;
  const [failed, setFailed] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const near = useNear(wrap, "60% 0px");
  const active = allowed && near && !failed;

  const mark = useCallback((on: boolean) => {
    const parent = wrap.current?.parentElement;
    if (!parent) return;
    if (on) parent.setAttribute("data-scene3d", "ready");
    else parent.removeAttribute("data-scene3d");
  }, []);
  const onReady = useCallback(
    (s: { calls: number; triangles: number; buildings: number; trees: number }) => {
      if (wrap.current) {
        wrap.current.setAttribute("data-calls", String(s.calls));
        wrap.current.setAttribute("data-triangles", String(s.triangles));
        wrap.current.setAttribute("data-buildings", String(s.buildings));
        wrap.current.setAttribute("data-trees", String(s.trees));
      }
      mark(true);
    },
    [mark],
  );
  const onFail = useCallback(() => { mark(false); setFailed(true); }, [mark]);
  useEffect(() => { if (!active) mark(false); }, [active, mark]);
  useEffect(() => () => mark(false), [mark]);

  return (
    <div ref={wrap} className={`scene3d scene3d--${mode}`} aria-hidden="true">
      {active ? (
        <Suspense fallback={null}>
          <LazyScene mode={mode} stage={stage} stageF={stageF} push={push} reduced={reduced} onReady={onReady} onFail={onFail} />
        </Suspense>
      ) : null}
    </div>
  );
}

/** Home hero: subtle scroll-linked push-in (about 6%). */
export function HeroScene3D() {
  const { scrollY } = useScroll();
  const push = useTransform(scrollY, (y) => Math.min(1, Math.max(0, y / Math.max(1, (typeof window === "undefined" ? 900 : window.innerHeight) * 0.9))));
  return <Scene3DLayer mode="hero" push={push} />;
}
