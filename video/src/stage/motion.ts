import { Easing, interpolate } from "remotion";

/**
 * The app's own motion curves (spa/src/styles/prototype-tokens.css and the
 * component CSS), so the video moves the way Harvous does, just at a
 * storytelling pace instead of a tap's.
 */
export const EASE = {
  /** --pds-ease-standard: front-loaded, settles softly. Most of the app. */
  standard: Easing.bezier(0.32, 0.72, 0.24, 1),
  /** --pds-ease-emphasized: a bigger, quicker arrival. */
  emphasized: Easing.bezier(0.2, 0.8, 0.2, 1),
  /** The app's pop (checkmarks, pins, digits): overshoots, then lands. */
  pop: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** A gentler overshoot, for big things like a window landing. */
  softPop: Easing.bezier(0.22, 1.25, 0.36, 1),
  /** --pds-ease-morph-exit: symmetric, for leaving and for camera moves out. */
  exit: Easing.bezier(0.45, 0, 0.55, 1),
};

/** 0→1 between two times, with an easing; clamped both ends. A zero-length window is a step. */
export const progress = (t: number, from: number, to: number, ease: (n: number) => number = EASE.standard) =>
  to <= from
    ? t >= to
      ? 1
      : 0
    : interpolate(t, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
