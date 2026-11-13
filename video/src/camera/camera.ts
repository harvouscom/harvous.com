import { EASE } from "../stage/motion";

/**
 * The camera: one zoom-and-pan over the whole stage, the way Screen Studio
 * moves (the window's chrome slides out of frame as it pushes in).
 *
 * State {x, y, scale}: the stage point (x, y) sits at the centre of the frame,
 * magnified `scale` times. Keyframes ease between states over MOVE_SEC,
 * on the app's own curves (src/stage/motion.ts).
 */

export type CameraState = { x: number; y: number; scale: number };
export type CameraKey = {
  /** Seconds into the beat when the move starts. */
  t: number;
  /** Where it's going: a fixed state, or one that follows (the cursor). */
  to: (tSec: number) => CameraState;
  /** Seconds the move takes. */
  move?: number;
  /** Curve for the move. Default: the app's emphasized ease. */
  ease?: (n: number) => number;
};

export const MOVE_SEC = 1.1;

export const restState = (w: number, h: number): CameraState => ({ x: w / 2, y: h / 2, scale: 1 });

/** Keep the zoomed view inside the stage, so no empty edge ever shows. */
export const clampState = (s: CameraState, w: number, h: number): CameraState => {
  const halfW = w / (2 * s.scale);
  const halfH = h / (2 * s.scale);
  return {
    scale: s.scale,
    x: Math.min(w - halfW, Math.max(halfW, s.x)),
    y: Math.min(h - halfH, Math.max(halfH, s.y)),
  };
};

const mix = (a: CameraState, b: CameraState, u: number): CameraState => ({
  x: a.x + (b.x - a.x) * u,
  y: a.y + (b.y - a.y) * u,
  // Interpolate zoom in log space so pushing in and pulling out feel even.
  scale: Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * u),
});

export const cameraAt = (keys: CameraKey[], tSec: number, w: number, h: number): CameraState => {
  let state = restState(w, h);
  const sorted = [...keys].sort((a, b) => a.t - b.t);
  for (let i = 0; i < sorted.length; i++) {
    const k = sorted[i];
    if (tSec < k.t) break;
    // Each move starts from wherever the camera was when it began; a later
    // key interrupts it where it stands.
    const next = sorted[i + 1];
    const end = next && next.t <= tSec ? next.t : tSec;
    const u = (k.ease ?? EASE.emphasized)(Math.min(1, (end - k.t) / (k.move ?? MOVE_SEC)));
    state = clampState(mix(state, k.to(end), u), w, h);
  }
  return state;
};

export const cameraTransform = (s: CameraState, w: number, h: number) =>
  `translate(${w / 2}px, ${h / 2}px) scale(${s.scale}) translate(${-s.x}px, ${-s.y}px)`;
