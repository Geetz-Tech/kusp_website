/**
 * Tree-shakeable entry for three.js. `@react-three/fiber` does `import * as THREE from "three"` and
 * `extend(THREE)`, which defeats tree-shaking and ships all of three (~900 KB). Aliasing "three" to this
 * file (see next.config.ts) exports only what the masterplan scene and the R3F core actually touch.
 * Types still come from the real "three" package; this file is bundler-only.
 */
export {
  // R3F core
  WebGLRenderer, Scene, Object3D, Vector2, Vector3, Raycaster, Layers, Color, ColorManagement, ShaderMaterial,
  PerspectiveCamera, OrthographicCamera, SRGBColorSpace, LinearSRGBColorSpace, NoToneMapping, ACESFilmicToneMapping,
  BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap, UnsignedByteType, RGBAFormat,
  // catalogue used by the scene's JSX
  Group, Mesh, InstancedMesh, HemisphereLight, DirectionalLight,
  // the scene itself
  BufferGeometry, Float32BufferAttribute, BoxGeometry, IcosahedronGeometry, PlaneGeometry, Matrix4, MeshStandardMaterial, DoubleSide,
  // @ts-expect-error runtime-only deep import of three's ESM source (types are provided by "three")
} from "../../../node_modules/three/src/Three.js";

/** Minimal Clock (R3F's frame clock). three's own Clock is deprecated and logs a warning on every Canvas. */
export class Clock {
  autoStart: boolean;
  startTime = 0;
  oldTime = 0;
  elapsedTime = 0;
  running = false;
  constructor(autoStart = true) {
    this.autoStart = autoStart;
  }
  start() {
    this.startTime = performance.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }
  stop() {
    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;
  }
  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }
  getDelta() {
    let diff = 0;
    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }
    if (this.running) {
      const now = performance.now();
      diff = (now - this.oldTime) / 1000;
      this.oldTime = now;
      this.elapsedTime += diff;
    }
    return diff;
  }
}
