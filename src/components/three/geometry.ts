/**
 * three.js geometry for the Living Masterplan. Everything is procedural: merged ribbons and
 * patches with vertex colours, plus a handful of instanced primitives. No textures.
 */
import { BoxGeometry, BufferGeometry, Color, Float32BufferAttribute, IcosahedronGeometry, PlaneGeometry } from "three";
import type { V2 } from "@/lib/art/util";
import { quiet } from "./quiet";
import { sampleCurve } from "@/lib/art/util";
import {
  ARMATURE, GIS_POINTS, PARKS, PRIMARY, RAIL, RIVER, SWALE, UTILITY_B, UC, VC, W,
  buildBuildings, buildParcels, buildSuitability, buildTrees, terrainY, toWorld,
} from "./masterplan-data";

type Buf = { pos: number[]; col: number[]; idx: number[] };
const newBuf = (): Buf => ({ pos: [], col: [], idx: [] });
const col = (hex: string) => new Color(hex);

function toGeometry(b: Buf): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(b.pos, 3));
  g.setAttribute("color", new Float32BufferAttribute(b.col, 3));
  g.setIndex(b.idx);
  g.computeVertexNormals();
  return g;
}

const pushV = (b: Buf, x: number, y: number, z: number, c: Color) => {
  b.pos.push(x, y, z);
  b.col.push(c.r, c.g, c.b);
  return b.pos.length / 3 - 1;
};

/** Resample a polyline of uv points to roughly even world-space spacing. */
function resample(p: V2[], step: number): V2[] {
  const out: V2[] = [p[0]];
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot((p[i][0] - p[i - 1][0]) * W, (p[i][1] - p[i - 1][1]) * W);
    acc += d;
    if (acc >= step) { out.push(p[i]); acc = 0; }
  }
  if (out[out.length - 1] !== p[p.length - 1]) out.push(p[p.length - 1]);
  return out;
}

const curve = (ctrl: V2[], step = 1.1) => resample(sampleCurve(ctrl, 22), step);
const straight = (a: V2, b: V2, step = 1.6): V2[] => {
  const n = Math.max(2, Math.ceil(Math.hypot((b[0] - a[0]) * W, (b[1] - a[1]) * W) / step));
  return Array.from({ length: n + 1 }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n] as V2);
};

/** Terrain-following ribbon (width in world units) centred on a uv polyline; wide ribbons are subdivided across so they hug the relief. */
function ribbon(b: Buf, pts: V2[], width: number, yOff: number, color: Color, widthAt?: (t: number) => number) {
  const cross = Math.max(1, Math.ceil(width / 2.4));
  let prevRow: number[] | null = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)];
    let tx = (c[0] - a[0]) * W, tz = (c[1] - a[1]) * W;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len; tz /= len;
    const w = (widthAt ? widthAt(i / (pts.length - 1)) : 1) * width * 0.5;
    const [x, z] = toWorld(pts[i][0], pts[i][1]);
    const row: number[] = [];
    for (let k = 0; k <= cross; k++) {
      const f = (k / cross) * 2 - 1;
      const half = W / 2 - 0.15;
      const px = Math.max(-half, Math.min(half, x - tz * w * f)), pz = Math.max(-half, Math.min(half, z + tx * w * f));
      row.push(pushV(b, px, terrainY(px / W + 0.5, pz / W + 0.5) + yOff, pz, color));
    }
    if (prevRow) for (let k = 0; k < cross; k++) b.idx.push(prevRow[k], prevRow[k + 1], row[k], prevRow[k + 1], row[k + 1], row[k]);
    prevRow = row;
  }
}

/** Terrain-following rectangular patch (uv bounds), subdivided so it hugs the relief. */
function patch(b: Buf, u0: number, v0: number, u1: number, v1: number, n: number, yOff: number, color: Color) {
  const rows: number[][] = [];
  for (let j = 0; j <= n; j++) {
    const row: number[] = [];
    for (let i = 0; i <= n; i++) {
      const u = u0 + ((u1 - u0) * i) / n, v = v0 + ((v1 - v0) * j) / n;
      const [x, z] = toWorld(u, v);
      row.push(pushV(b, x, terrainY(u, v) + yOff, z, color));
    }
    rows.push(row);
  }
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const a = rows[j][i], bb = rows[j][i + 1], c = rows[j + 1][i + 1], d = rows[j + 1][i];
      b.idx.push(a, d, bb, bb, d, c);
    }
}

/** Dashes along a polyline (arc-length based). */
function dashes(b: Buf, pts: V2[], len: number, gap: number, width: number, yOff: number, color: Color) {
  const world = pts.map(([u, v]) => toWorld(u, v));
  let run = 0, on = true, cur: V2[] = [];
  const flush = () => { if (cur.length > 1) ribbon(b, cur, width, yOff, color); cur = []; };
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) run += Math.hypot(world[i][0] - world[i - 1][0], world[i][1] - world[i - 1][1]);
    if (on) cur.push(pts[i]);
    if (on && run >= len) { flush(); on = false; run = 0; }
    else if (!on && run >= gap) { on = true; run = 0; cur = [pts[i]]; }
  }
  flush();
}

export const PALETTE = {
  ground: "#c5bca6", groundHi: "#cfc7b1", skirt: "#a69a80", slab: "#1b1a17",
  river: "#8ca5ae", bank: "#b4bd9b", park: "#a9b58f", plaza: "#ede6d3",
  minor: "#e7e0cf", secondary: "#ddd5c1", primary: "#6a6358", burgundy: "#6b1f32", gold: "#b99352",
  rail: "#4d493f", wall: "#f0e9d6", civic: "#ece0c6", treeA: "#6c805d", treeB: "#7f9269",
  hatch: "#7a2b3d",
};

export type Model = Awaited<ReturnType<typeof buildModel>>;
let cache: Model | null = null;
let pending: Promise<Model> | null = null;
const tick = async () => {
  await new Promise<void>((r) => setTimeout(r, 0));
  await quiet(250);
};
/** Builds the model in slices (yielding between phases) so no single main-thread task is long. */
export const prepareModel = () => (pending ??= buildModel().then((m) => (cache = m)));
export const getModel = (): Model => {
  if (!cache) throw new Error("Masterplan model is not prepared yet");
  return cache;
};

async function buildModel() {
  performance.mark("kusp3d:model-start");
  const parcels = buildParcels();
  const buildings = buildBuildings(parcels);
  const trees = buildTrees();
  const suit = buildSuitability();
  await tick();

  /* ---- ground: terrain-following mesh, plate skirt and the dark model board ---- */
  const N = 96;
  const ground = new BufferGeometry();
  {
    const pos: number[] = [], cols: number[] = [], idx: number[] = [];
    const c0 = col(PALETTE.ground), c1 = col(PALETTE.groundHi), tmp = new Color();
    for (let j = 0; j <= N; j++)
      for (let i = 0; i <= N; i++) {
        const u = i / N, v = j / N, y = terrainY(u, v);
        const [x, z] = toWorld(u, v);
        pos.push(x, y, z);
        tmp.copy(c0).lerp(c1, Math.max(0, Math.min(1, (y - 0.4) / 2.6)));
        cols.push(tmp.r, tmp.g, tmp.b);
      }
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const a = j * (N + 1) + i, b = a + 1, d = a + N + 1, c = d + 1;
        idx.push(a, d, b, b, d, c);
      }
    ground.setAttribute("position", new Float32BufferAttribute(pos, 3));
    ground.setAttribute("color", new Float32BufferAttribute(cols, 3));
    ground.setIndex(idx);
    ground.computeVertexNormals();
  }
  await tick();
  const skirt = newBuf();
  {
    const sk = col(PALETTE.skirt), bottom = -3.2;
    const edge: [number, number][][] = [
      Array.from({ length: N + 1 }, (_, i) => [i / N, 0] as [number, number]),
      Array.from({ length: N + 1 }, (_, j) => [1, j / N] as [number, number]),
      Array.from({ length: N + 1 }, (_, i) => [1 - i / N, 1] as [number, number]),
      Array.from({ length: N + 1 }, (_, j) => [0, 1 - j / N] as [number, number]),
    ];
    edge.forEach((e) => {
      const top: number[] = [], bot: number[] = [];
      e.forEach(([u, v]) => {
        const [x, z] = toWorld(u, v);
        top.push(pushV(skirt, x, terrainY(u, v), z, sk));
        bot.push(pushV(skirt, x, bottom, z, sk));
      });
      for (let k = 0; k < e.length - 1; k++) skirt.idx.push(top[k], bot[k], top[k + 1], top[k + 1], bot[k], bot[k + 1]);
    });
  }
  const board = new BoxGeometry(W + 2.6, 1.8, W + 2.6);
  board.translate(0, -3.2 - 0.9, 0);

  /* ---- static ground decals (river, banks, parks, plaza, streets, corridor) in one mesh ---- */
  const deco = newBuf();
  {
    const riverPts = curve(RIVER, 1.4).filter(([u]) => u >= 0.002 && u <= 0.998);
    ribbon(deco, riverPts, 16, 0.1, col(PALETTE.bank)); // blue-green banks
    ribbon(deco, riverPts, 7.2, 0.2, col(PALETTE.river));
    PARKS.forEach(([a, b, c, d]) => patch(deco, a, b, c, d, 4, 0.16, col(PALETTE.park)));
    patch(deco, 0.445, 0.345, 0.625, 0.525, 6, 0.17, col(PALETTE.plaza));
    const minor = col(PALETTE.minor);
    UC.slice(1, -1).forEach((u) => ribbon(deco, straight([u, 0.02], [u, 0.98]), 1.1, 0.14, minor));
    VC.slice(1, -1).forEach((v) => ribbon(deco, straight([0.02, v], [0.98, v]), 1.1, 0.14, minor));
    ribbon(deco, straight([0.02, 0.38], [0.98, 0.46]), 1.9, 0.2, col(PALETTE.secondary));
    ribbon(deco, straight([0.52, 0.02], [0.52, 0.98]), 2, 0.24, col(PALETTE.primary));
    const prim = curve(PRIMARY, 1.1);
    ribbon(deco, prim, 3.1, 0.3, col(PALETTE.primary)); // primary road (also bridges the river)
    ribbon(deco, prim, 0.8, 0.36, col(PALETTE.burgundy)); // burgundy planning corridor inlay
    dashes(deco, prim, 2.2, 2.6, 0.32, 0.4, col(PALETTE.gold));
  }
  const decal = toGeometry(deco);
  await tick();

  /* ---- buildings & trees (instanced) ---- */
  const box = new BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0);
  const canopy = new IcosahedronGeometry(1, 0);

  /* ---- lens overlays ---- */
  const lines = newBuf(); // burgundy parcel outlines (planning)
  {
    const c = col(PALETTE.burgundy);
    parcels.forEach((p) => {
      const loop: V2[] = [[p.u0, p.v0], [p.u1, p.v0], [p.u1, p.v1], [p.u0, p.v1], [p.u0, p.v0]];
      for (let k = 0; k < 4; k++) ribbon(lines, straight(loop[k], loop[k + 1], 1.4), 0.34, 0.5, c);
    });
  }
  const parcelLines = toGeometry(lines);

  const infra = newBuf(); // rail + utilities (gold) for the infrastructure lens
  {
    const railPts = curve(RAIL, 1.2);
    ribbon(infra, railPts, 1.5, 0.46, col(PALETTE.rail));
    dashes(infra, railPts, 0.7, 0.9, 2.3, 0.5, col("#d8d0bd"));
    ribbon(infra, straight([0.05, 0.3], [0.95, 0.34], 1.4), 0.62, 0.52, col(PALETTE.gold));
    ribbon(infra, curve(UTILITY_B, 1.2), 0.62, 0.52, col(PALETTE.gold));
    ribbon(infra, straight([0.52, 0.02], [0.52, 0.98], 1.4), 0.7, 0.5, col(PALETTE.burgundy));
  }
  const infraLines = toGeometry(infra);

  const eco = newBuf(); // blue-green completion: wider banks, swale, green armature
  {
    ribbon(eco, curve(RIVER, 1.4).filter(([u]) => u >= 0.002 && u <= 0.998), 17, 0.14, col("#aebd9a"));
    ribbon(eco, curve(ARMATURE, 1.2), 7.5, 0.18, col("#a9b992"));
    ribbon(eco, curve(SWALE, 1.2), 1.7, 0.24, col("#8fa7ad"));
  }
  const ecoLines = toGeometry(eco);

  const hatch = newBuf(); // flood-edge hatching (geospatial constraint)
  for (let n = 0; n < 9; n++) {
    const u = 0.14 + n * 0.035;
    ribbon(hatch, straight([u, 0.54], [u + 0.04, 0.72], 1.4), 0.3, 0.6, col(PALETTE.hatch));
  }
  const hatchLines = toGeometry(hatch);

  await tick();
  const tile = new PlaneGeometry(1, 1);
  tile.rotateX(-Math.PI / 2);
  const disc = new IcosahedronGeometry(1, 1);
  disc.scale(1, 0.06, 1);

  performance.mark("kusp3d:model-end");
  return {
    parcels, buildings, trees, suit, gisPoints: GIS_POINTS,
    ground, skirt: toGeometry(skirt), board, decal, box, canopy, parcelLines, infraLines, ecoLines, hatchLines, tile, disc,
  };
}
