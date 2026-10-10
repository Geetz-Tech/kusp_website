"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { DirectionalLight } from "three";
import type { MotionValue } from "framer-motion";
import { CameraController, ModelController, type SceneMode } from "./controllers";
import { getModel, prepareModel } from "./geometry";
import { quiet } from "./quiet";
import { GIS_POINTS, STATIONS, WETLANDS } from "./masterplan-data";

/**
 * Living Masterplan — a restrained physical planning model.
 * Orthographic camera, matte vertex-coloured materials, one key light + soft hemisphere fill,
 * one soft shadow map, rendered on demand only (frameloop="demand"). The SVG masterplan stays
 * underneath as poster and fallback; this layer fades in once a frame has been drawn.
 */

export type SceneProps = {
  mode: SceneMode;
  stage: number;
  stageF?: MotionValue<number>;
  push?: MotionValue<number>;
  reduced: boolean;
  onReady: (stats: { calls: number; triangles: number; buildings: number; trees: number }) => void;
  onFail: () => void;
};

function Model({ mode, stage, reduced }: Pick<SceneProps, "mode" | "stage" | "reduced">) {
  const invalidate = useThree((s) => s.invalidate);
  const [ctrl] = useState(() => new ModelController(mode, stage));
  const light = useRef<DirectionalLight>(null);
  const { m, mats } = ctrl;

  useEffect(() => {
    if (light.current) ctrl.configureLight(light.current);
    ctrl.setup();
    invalidate();
    return () => ctrl.dispose();
  }, [ctrl, invalidate]);

  useEffect(() => {
    ctrl.setTarget(mode, stage, reduced);
    invalidate();
  }, [ctrl, mode, stage, reduced, invalidate]);

  useFrame((state, delta) => {
    // The key light is fixed, so the shadow map only needs refreshing when the model itself changes
    // (not on camera moves such as the hero push-in): saves a full shadow pass per scroll frame.
    const moving = ctrl.step(delta, reduced);
    if (ctrl.applied) state.gl.shadowMap.needsUpdate = true;
    if (moving) invalidate();
  });

  return (
    <group>
      <hemisphereLight args={["#ffffff", "#c2b7a1", 1.0]} />
      <directionalLight ref={light} position={[-52, 80, 34]} intensity={3.05} color="#fffdf8" castShadow />
      <mesh geometry={m.board} material={mats.board} receiveShadow dispose={null} />
      <mesh geometry={m.skirt} material={mats.skirt} dispose={null} />
      <mesh geometry={m.ground} material={mats.ground} receiveShadow dispose={null} />
      <mesh geometry={m.decal} material={mats.decal} receiveShadow dispose={null} />
      <mesh geometry={m.parcelLines} material={mats.lines} dispose={null} />
      <instancedMesh ref={ctrl.binder("ph")} args={[m.tile, mats.phase, m.parcels.length]} frustumCulled={false} dispose={null} />
      <instancedMesh ref={ctrl.binder("gis")} args={[m.tile, mats.gis, m.suit.length]} frustumCulled={false} dispose={null} />
      <mesh geometry={m.hatchLines} material={mats.hatch} dispose={null} />
      <mesh geometry={m.ecoLines} material={mats.eco} dispose={null} />
      <instancedMesh ref={ctrl.binder("wet")} args={[m.disc, mats.wet, WETLANDS.length]} frustumCulled={false} visible={false} dispose={null} />
      <mesh geometry={m.infraLines} material={mats.infra} dispose={null} />
      <instancedMesh ref={ctrl.binder("b")} args={[m.box, mats.building, m.buildings.length]} castShadow receiveShadow frustumCulled={false} dispose={null} />
      <instancedMesh ref={ctrl.binder("t")} args={[m.canopy, mats.tree, m.trees.length]} castShadow frustumCulled={false} dispose={null} />
      <instancedMesh ref={ctrl.binder("pts")} args={[m.disc, mats.gold, GIS_POINTS.length]} frustumCulled={false} visible={false} dispose={null} />
      <instancedMesh ref={ctrl.binder("st")} args={[m.disc, mats.gold, STATIONS.length]} frustumCulled={false} visible={false} dispose={null} />
    </group>
  );
}

function Rig({ mode, reduced, stageF, push }: Pick<SceneProps, "mode" | "reduced" | "stageF" | "push">) {
  const invalidate = useThree((s) => s.invalidate);
  const [cam] = useState(() => new CameraController(mode));

  useEffect(() => {
    const offs = [stageF?.on("change", invalidate), push?.on("change", invalidate)];
    const onMove = (e: PointerEvent) => {
      cam.tiltTarget = ((e.clientX / window.innerWidth) * 2 - 1) * 1.5;
      invalidate();
    };
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (mode === "hero" && !reduced && fine) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      offs.forEach((o) => o?.());
      window.removeEventListener("pointermove", onMove);
    };
  }, [cam, stageF, push, mode, reduced, invalidate]);

  useFrame((state, delta) => {
    const moving = cam.update(state.camera as never, state.size, delta, reduced, stageF ? stageF.get() : 1, push ? push.get() : 0);
    if (moving) invalidate();
  });
  return null;
}

/** Compile shaders off the main thread (KHR_parallel_shader_compile) before the first render. */
function PrecompileThenRender() {
  const { gl, scene, camera, setFrameloop, invalidate } = useThree();
  useEffect(() => {
    let alive = true;
    const raf = requestAnimationFrame(async () => {
      performance.mark("kusp3d:compile-start");
      try {
        await gl.compileAsync(scene, camera);
      } catch {
        /* first render compiles synchronously instead */
      }
      if (!alive) return;
      performance.mark("kusp3d:compile-end");
      await quiet(1000); // first render only in a calm window; the SVG stays untouched until then
      if (!alive) return;
      const render = gl.render.bind(gl);
      let first = true;
      gl.render = (...args: Parameters<typeof gl.render>) => {
        if (first) performance.mark("kusp3d:render1-start");
        render(...args);
        if (first) {
          first = false;
          performance.mark("kusp3d:render1-end");
          gl.render = render;
        }
      };
      setFrameloop("demand");
      invalidate();
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [gl, scene, camera, setFrameloop, invalidate]);
  return null;
}

function ReadyProbe({ onReady }: Pick<SceneProps, "onReady">) {
  const gl = useThree((s) => s.gl);
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    performance.mark("kusp3d:first-frame");
    requestAnimationFrame(() => {
      const info = gl.info.render;
      const m = getModel();
      onReady({ calls: info.calls, triangles: info.triangles, buildings: m.buildings.length, trees: m.trees.length });
    });
  });
  return null;
}

export default function LivingMasterplan3D({ mode, stage, stageF, push, reduced, onReady, onFail }: SceneProps) {
  // unmounting disposes the renderer with forceContextLoss(); only a loss while mounted is a real failure
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return (
    <Canvas
      orthographic
      flat
      shadows="percentage"
      frameloop="never"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "default", stencil: false }}
      camera={{ position: [0, 100, 150], near: 1, far: 700, zoom: 6 }}
      resize={{ scroll: false, debounce: 0 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        performance.mark("kusp3d:canvas-created");
        gl.shadowMap.autoUpdate = false;
        gl.shadowMap.needsUpdate = true;
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          if (mounted.current && gl.domElement.isConnected) onFail();
        });
      }}
    >
      <Model mode={mode} stage={stage} reduced={reduced} />
      <Rig mode={mode} reduced={reduced} stageF={stageF} push={push} />
      <PrecompileThenRender />
      <ReadyProbe onReady={onReady} />
    </Canvas>
  );
}

/** Awaited by the host before mounting: builds the geometry in slices, keeping every task short. */
export const prepare = prepareModel;
