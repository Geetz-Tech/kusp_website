/**
 * Imperative controllers for the Living Masterplan. three.js objects are mutated in place for
 * performance (instanced transforms, material opacity, camera), so this logic lives in plain
 * classes and the React components only call their methods.
 */
import { Color, DoubleSide, MeshStandardMaterial, Vector3, Matrix4, type InstancedMesh, type OrthographicCamera, type Object3D } from "three";
import { getModel, PALETTE } from "./geometry";
import { GIS_POINTS, STATIONS, WETLANDS, W, terrainY, toWorld } from "./masterplan-data";

export type SceneMode = "hero" | "lens";

export type Params = { hs: number; civic: number; lines: number; phase: number; tint: number; gis: number; infra: number; eco: number; pale: number };
export const HERO: Params = { hs: 1, civic: 1, lines: 0, phase: 0, tint: 0, gis: 0, infra: 0, eco: 0, pale: 0 };
/** Lens stage targets, indexed stage + 1: base place, then planning … sustainability. */
const STAGES: Params[] = [
  { hs: 0.48, civic: 0.5, lines: 0, phase: 0, tint: 0, gis: 0, infra: 0, eco: 0, pale: 0 },
  { hs: 1, civic: 1, lines: 1, phase: 0, tint: 0, gis: 0, infra: 0, eco: 0, pale: 0 },
  { hs: 0.96, civic: 1, lines: 0.3, phase: 1, tint: 1, gis: 0, infra: 0, eco: 0, pale: 0 },
  { hs: 0.24, civic: 0.4, lines: 0, phase: 0, tint: 0, gis: 1, infra: 0, eco: 0, pale: 0.68 },
  { hs: 0.42, civic: 0.55, lines: 0, phase: 0, tint: 0, gis: 0, infra: 1, eco: 0, pale: 0.55 },
  { hs: 0.82, civic: 0.8, lines: 0, phase: 0, tint: 0, gis: 0, infra: 0, eco: 1, pale: 0.2 },
];
export const paramsFor = (mode: SceneMode, stage: number): Params =>
  mode === "hero" ? { ...HERO } : { ...STAGES[Math.max(-1, Math.min(4, stage)) + 1] };

/**
 * Per-stage camera reframing, indexed stage + 1 (base, planning … sustainability).
 * Planning closes in on the civic core, Geospatial rises toward a plan view, Infrastructure follows the
 * corridor, Sustainability pulls back to show the completed system. Steps between neighbours stay small.
 */
const STAGE_ZOOM = [1, 1.06, 1.02, 1.04, 1.07, 0.97];
const STAGE_SHIFT_Y = [0, -8, 0, 4, 6, 0];
const STAGE_SHIFT_X = [0, 18, 0, 0, -16, 0];
const STAGE_PITCH = [0, -2, 0, 7, 0, -3];
const STAGE_AZ = [0, 0, 0, 0, -3, 0];
const lerpTable = (t: number, tab: number[]) => {
  const x = Math.max(0, Math.min(tab.length - 1, t));
  const i = Math.min(tab.length - 2, Math.floor(x));
  return tab[i] + (tab[i + 1] - tab[i]) * (x - i);
};

const CIVIC_YB = [0, 0, 2.6, 8.0];
const tmpM = new Matrix4();
const tmpC = new Color();
const WALL = new Color(PALETTE.wall), CIVIC = new Color(PALETTE.civic), PALE = new Color("#d2c9b3");
const ZONE_TINT = [new Color(PALETTE.wall), new Color(PALETTE.wall), new Color("#e4d4b4"), new Color("#d8b8bb"), new Color(PALETTE.civic)];
const PHASE_COL = [new Color("#8a3b4c"), new Color("#c9a966"), new Color("#9fae92")];
const SUIT_COL = [new Color("#000000"), new Color("#c9b98f"), new Color("#d6b673"), new Color("#9db4b6")];
const TREE_A = new Color(PALETTE.treeA), TREE_B = new Color(PALETTE.treeB), TREE_ECO = new Color("#587149");

type Slot = "b" | "t" | "ph" | "gis" | "pts" | "st" | "wet";

export class ModelController {
  readonly m = getModel();
  cur: Params;
  target: Params;
  dirty = true;
  /** True when the last step() changed instances/materials (the shadow map then needs one refresh). */
  applied = false;
  private readonly meshes: Record<Slot, InstancedMesh | null> = { b: null, t: null, ph: null, gis: null, pts: null, st: null, wet: null };
  /** Stable ref callbacks for the instanced meshes (React passes each mesh in on mount). */
  private readonly bindings = Object.fromEntries((["b", "t", "ph", "gis", "pts", "st", "wet"] as Slot[]).map((k) => [k, (o: InstancedMesh | null) => { this.meshes[k] = o; }])) as Record<Slot, (o: InstancedMesh | null) => void>;
  binder(slot: Slot) {
    return this.bindings[slot];
  }
  readonly mats = (() => {
    const std = (extra: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}) => new MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0, ...extra });
    const fade = { transparent: true, opacity: 0, depthWrite: false } as const;
    return {
      ground: std(), skirt: std({ side: DoubleSide }), board: new MeshStandardMaterial({ color: PALETTE.slab, roughness: 0.9, metalness: 0 }),
      decal: std(), building: new MeshStandardMaterial({ roughness: 0.94, metalness: 0 }), tree: new MeshStandardMaterial({ roughness: 1, metalness: 0, flatShading: true }),
      lines: std(fade), infra: std(fade), eco: std(fade), hatch: std(fade),
      phase: new MeshStandardMaterial({ roughness: 1, metalness: 0, ...fade }),
      gis: new MeshStandardMaterial({ roughness: 1, metalness: 0, ...fade }),
      gold: new MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.9, metalness: 0 }),
      wet: new MeshStandardMaterial({ color: "#8fa7ad", roughness: 1, metalness: 0, ...fade }),
    };
  })();

  constructor(mode: SceneMode, stage: number) {
    this.cur = paramsFor(mode, stage);
    this.target = { ...this.cur };
  }

  setTarget(mode: SceneMode, stage: number, instant: boolean) {
    this.target = paramsFor(mode, stage);
    if (instant) this.cur = { ...this.target };
    this.dirty = true;
  }

  /** Static instance data (parcel tiles, GIS cells). */
  setup() {
    const { m, meshes: r } = this;
    const ph = r.ph, gis = r.gis;
    if (ph) {
      m.parcels.forEach((p, i) => {
        const [x0, z0] = toWorld(p.u0, p.v0), [x1, z1] = toWorld(p.u1, p.v1);
        const y = Math.min(terrainY(p.u0, p.v0), terrainY(p.u1, p.v1), terrainY(p.u0, p.v1), terrainY(p.u1, p.v0)) + 0.28;
        tmpM.makeScale(x1 - x0, 1, z1 - z0).setPosition((x0 + x1) / 2, y, (z0 + z1) / 2);
        ph.setMatrixAt(i, tmpM);
        ph.setColorAt(i, PHASE_COL[p.phase]);
      });
      ph.instanceMatrix.needsUpdate = true;
      if (ph.instanceColor) ph.instanceColor.needsUpdate = true;
    }
    if (gis) {
      m.suit.forEach((c, i) => {
        const [x, z] = toWorld(c.u, c.v);
        tmpM.makeScale(W / 18 - 0.25, 1, W / 12 - 0.25).setPosition(x, terrainY(c.u, c.v) + 0.42, z);
        gis.setMatrixAt(i, tmpM);
        gis.setColorAt(i, SUIT_COL[c.s]);
      });
      gis.instanceMatrix.needsUpdate = true;
      if (gis.instanceColor) gis.instanceColor.needsUpdate = true;
    }
    this.apply(this.cur); // creates instance colours up front so shader variants are final before compile
    this.dirty = true;
  }

  configureLight(light: Object3D & { shadow?: { mapSize: { set(x: number, y: number): void }; camera: { left: number; right: number; top: number; bottom: number; near: number; far: number; updateProjectionMatrix(): void }; bias: number; normalBias: number; radius: number } }) {
    const sh = light.shadow;
    if (!sh) return;
    sh.mapSize.set(1024, 1024);
    Object.assign(sh.camera, { left: -78, right: 78, top: 78, bottom: -78, near: 10, far: 220 });
    sh.camera.updateProjectionMatrix();
    sh.bias = -0.0006;
    sh.normalBias = 0.22;
    sh.radius = 3;
  }

  /** Advance toward the target; returns true while still animating. */
  step(delta: number, reduced: boolean): boolean {
    this.applied = false;
    if (!this.dirty) return false;
    this.applied = true;
    const c = this.cur, t = this.target;
    const k = reduced ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) / 0.17);
    let moving = false;
    (Object.keys(t) as (keyof Params)[]).forEach((key) => {
      const d = t[key] - c[key];
      if (Math.abs(d) > 0.002) { c[key] += d * k; moving = true; } else c[key] = t[key];
    });
    this.apply(c);
    if (!moving) this.dirty = false;
    return moving;
  }

  private apply(p: Params) {
    const { m, meshes: r, mats } = this;
    const b = r.b, t = r.t;
    if (b) {
      for (let i = 0; i < m.buildings.length; i++) {
        const bd = m.buildings[i];
        const isCivic = bd.civic > 0;
        const k = isCivic ? p.civic : p.hs;
        const h = isCivic ? bd.h * k : (bd.h - 0.9) * k + 0.9;
        const yb = isCivic ? CIVIC_YB[bd.civic] : 0;
        tmpM.makeScale(bd.w, h, bd.d).setPosition(bd.x, bd.y0 - yb + yb * k, bd.z);
        b.setMatrixAt(i, tmpM);
        tmpC.copy(isCivic ? CIVIC : WALL);
        if (p.tint > 0.001 && !isCivic) tmpC.lerp(ZONE_TINT[bd.zone], p.tint);
        if (p.pale > 0.001) tmpC.lerp(PALE, p.pale);
        tmpC.offsetHSL(0, 0, (bd.shade - 0.5) * 0.035);
        b.setColorAt(i, tmpC);
      }
      b.instanceMatrix.needsUpdate = true;
      if (b.instanceColor) b.instanceColor.needsUpdate = true;
    }
    if (t) {
      for (let i = 0; i < m.trees.length; i++) {
        const tr = m.trees[i];
        const s = tr.eco ? tr.r * p.eco : tr.r * (1 + 0.55 * p.eco);
        tmpM.makeScale(s, s * 0.9, s).setPosition(tr.x, tr.y + 0.2 + s * 0.78, tr.z);
        t.setMatrixAt(i, tmpM);
        tmpC.copy(TREE_A).lerp(TREE_B, tr.tone).lerp(TREE_ECO, p.eco * 0.55);
        t.setColorAt(i, tmpC);
      }
      t.instanceMatrix.needsUpdate = true;
      if (t.instanceColor) t.instanceColor.needsUpdate = true;
    }
    mats.lines.opacity = p.lines * 0.95;
    mats.phase.opacity = p.phase * 0.62;
    mats.gis.opacity = p.gis * 0.82;
    mats.hatch.opacity = p.gis * 0.85;
    mats.infra.opacity = p.infra;
    mats.eco.opacity = p.eco * 0.9;
    mats.wet.opacity = p.eco * 0.85;
    const small = (mesh: InstancedMesh | null, pts: [number, number][], sx: number, sy: number, y0: number, w: number) => {
      if (!mesh) return;
      mesh.visible = w > 0.02;
      if (!mesh.visible) return;
      pts.forEach(([u, v], i) => {
        const [x, z] = toWorld(u, v);
        tmpM.makeScale(sx * w, sy * w, sx * w).setPosition(x, terrainY(u, v) + y0, z);
        mesh.setMatrixAt(i, tmpM);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    small(r.pts, GIS_POINTS, 1.3, 7, 0.6, p.gis);
    small(r.st, STATIONS, 2, 9, 0.7, p.infra);
    const wet = r.wet;
    if (wet) {
      wet.visible = p.eco > 0.02;
      if (wet.visible) {
        WETLANDS.forEach(([u, v, rad], i) => {
          const [x, z] = toWorld(u, v);
          const g = 0.35 + 0.65 * p.eco;
          tmpM.makeScale(rad * 1.7 * g, 10, rad * 0.95 * g).setPosition(x, terrainY(u, v) + 0.3, z);
          wet.setMatrixAt(i, tmpM);
        });
        wet.instanceMatrix.needsUpdate = true;
      }
    }
  }

  dispose() {
    Object.values(this.mats).forEach((x) => x.dispose());
  }
}

/** Orthographic oblique camera matched to the SVG hero framing; zoom/shift follow scroll, tilt follows the pointer. */
export class CameraController {
  z = 1;
  y = 0;
  x = 0;
  pitchOff = 0;
  azOff = 0;
  tilt = 0;
  tiltTarget = 0;
  private init = false;
  /** Hero and Lenses share the scene but not the exact framing: the Lenses camera starts slightly higher and rounder. */
  private readonly azimuth: number;
  private readonly pitch: number;
  constructor(private mode: SceneMode) {
    this.azimuth = mode === "hero" ? 38 : 35;
    this.pitch = mode === "hero" ? 31 : 33;
  }

  /** Returns true while still easing. */
  update(camera: OrthographicCamera, size: { width: number; height: number }, delta: number, reduced: boolean, stageF: number, push: number): boolean {
    const hero = this.mode === "hero";
    const zT = hero ? 1 + 0.06 * Math.max(0, Math.min(1, push)) : lerpTable(stageF, STAGE_ZOOM);
    const yT = hero ? 0 : lerpTable(stageF, STAGE_SHIFT_Y);
    const xT = hero ? 0 : lerpTable(stageF, STAGE_SHIFT_X);
    const pT = hero ? 0 : lerpTable(stageF, STAGE_PITCH);
    const aT = hero ? 0 : lerpTable(stageF, STAGE_AZ);
    const k = reduced || !this.init ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) / 0.2);
    this.init = true;
    this.z += (zT - this.z) * k;
    this.y += (yT - this.y) * k;
    this.x += (xT - this.x) * k;
    this.pitchOff += (pT - this.pitchOff) * k;
    this.azOff += (aT - this.azOff) * k;
    this.tilt += (this.tiltTarget - this.tilt) * k;
    const moving = Math.abs(zT - this.z) > 0.0005 || Math.abs(yT - this.y) > 0.05 || Math.abs(xT - this.x) > 0.05 || Math.abs(pT - this.pitchOff) > 0.02 || Math.abs(aT - this.azOff) > 0.02 || Math.abs(this.tiltTarget - this.tilt) > 0.01;

    // SVG parity: plate edge = 532 viewBox units in a 960x650 frame; plate centre sits ~37 units above frame centre
    const fit = Math.min(size.width / 960, size.height / 650);
    const zoom = 5.32 * fit * this.z;
    const dy = 8 * fit + this.y;
    const az = ((this.azimuth + this.azOff + this.tilt) * Math.PI) / 180, el = ((this.pitch + this.pitchOff) * Math.PI) / 180;
    const dir = new Vector3(-Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    const right = new Vector3(0, 1, 0).cross(dir).normalize();
    const up = dir.clone().cross(right).normalize();
    const sy = -dy / zoom, sx = this.x / zoom;
    const tx = up.x * sy + right.x * sx, ty = up.y * sy + right.y * sx, tz = up.z * sy + right.z * sx;
    const R = 260;
    camera.position.set(dir.x * R + tx, dir.y * R + ty, dir.z * R + tz);
    camera.zoom = zoom;
    camera.lookAt(tx, ty, tz);
    camera.rotateZ((-(hero ? (reduced ? 1 : 2) : 5) * Math.PI) / 180);
    camera.updateProjectionMatrix();
    return moving;
  }
}
