/**
 * "Safe window" helper: resolves once the user has not scrolled, touched, typed or resized for `ms`.
 * The 3D layer waits for it before every expensive startup step (probe, chunk evaluation, canvas
 * creation, first render) so WebGL start-up never lands in the middle of a scroll or interaction.
 */
let last = 0;
let tracking = false;

function track() {
  if (tracking || typeof window === "undefined") return;
  tracking = true;
  const mark = () => {
    last = performance.now();
  };
  for (const e of ["scroll", "wheel", "touchstart", "touchmove", "keydown", "pointerdown", "resize"]) window.addEventListener(e, mark, { passive: true, capture: true });
}

export function quiet(ms = 700): Promise<void> {
  track();
  return new Promise((resolve) => {
    const check = () => {
      const idle = performance.now() - last;
      if (idle >= ms) resolve();
      else window.setTimeout(check, ms - idle + 20);
    };
    check();
  });
}
