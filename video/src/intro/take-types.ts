/**
 * The contract between the capture rig (capture/) and the compositor (src/).
 * A take is <scene>-<device>.mp4 plus this file. All coordinates are CSS
 * pixels in the captured viewport; `t` is milliseconds from the take's first
 * frame.
 */

export type Box = { x: number; y: number; width: number; height: number };

export type CursorKind = "arrow" | "pointer" | "text";

export type TakeEvent =
  | { t: number; kind: "move"; x: number; y: number; cursor: CursorKind }
  | { t: number; kind: "down" | "up"; x: number; y: number }
  | { t: number; kind: "tap"; x: number; y: number }
  | { t: number; kind: "key"; text: string }
  | { t: number; kind: "scroll"; x: number; y: number; dy: number }
  /** A named moment the timeline can sync voiceover or a zoom to. */
  | { t: number; kind: "mark"; name: string }
  /** Where an element sat at time t, for annotations to sit on. */
  | { t: number; kind: "anchor"; name: string; box: Box };

export type TakeEvents = {
  scene: string;
  device: "desktop" | "phone";
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  fps: number;
  durationMs: number;
  events: TakeEvent[];
};

/** footage/intro/takes/manifest.json, written by scripts/intro-prep.mjs. */
export type TakesManifest = Record<
  string,
  { video: string; events: string; durationSec: number; width: number; height: number }
>;
