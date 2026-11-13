import { CHROME_HEIGHT, type DesktopFrame } from "../frames/BrowserWindow";
import { BEZEL, phoneSize, statusBarHeight, type PhoneFrame } from "../frames/Phone";
import { WIDTH } from "./plan";

/**
 * Where the window and the phone sit on the 1920×1080 stage, and how a point
 * in a take's CSS pixels maps onto it (zooms and annotations need both).
 */

export const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
export const PHONE_VIEWPORT = { width: 393, height: 852 };

export type DesktopRect = { x: number; y: number; width: number; k: number; chrome: number };
export type PhoneRect = { x: number; y: number; k: number; width: number; height: number };

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** Top of the window: the space below it is the subtitles' own band. */
const TOP = 46;

/**
 * u = 0: the window alone, centred. u = 1: moved left to make room for the phone.
 * side = 1: moved right to make room for a list of features on the left.
 */
export const desktopRect = (_frame: DesktopFrame, u: number, side = 0): DesktopRect => {
  const chrome = CHROME_HEIGHT;
  const width = lerp(lerp(1240, 1120, u), 1180, side);
  const k = width / DESKTOP_VIEWPORT.width;
  const height = chrome + DESKTOP_VIEWPORT.height * k;
  const full = chrome + DESKTOP_VIEWPORT.height * (1240 / DESKTOP_VIEWPORT.width);
  const x = lerp(lerp((WIDTH - width) / 2, 170, u), WIDTH - 90 - width, side);
  return { x, y: TOP + (full - height) / 2, width, k, chrome };
};

export const phoneRect = (frame: PhoneFrame): PhoneRect => {
  const k = 0.84;
  const { width, height } = phoneSize(frame, PHONE_VIEWPORT.width, PHONE_VIEWPORT.height, k);
  const full = CHROME_HEIGHT + DESKTOP_VIEWPORT.height * (1240 / DESKTOP_VIEWPORT.width);
  return { x: WIDTH - 200 - width, y: TOP + (full - height) / 2, k, width, height };
};

/** A point in the desktop take → stage pixels. */
export const desktopToStage = (r: DesktopRect, p: { x: number; y: number }) => ({
  x: r.x + p.x * r.k,
  y: r.y + r.chrome + p.y * r.k,
});

/** A point in the phone take → stage pixels (bezel, then the status bar). */
export const phoneToStage = (frame: PhoneFrame, r: PhoneRect, p: { x: number; y: number }) => ({
  x: r.x + (BEZEL + p.x) * r.k,
  y: r.y + (BEZEL + statusBarHeight(frame) + p.y) * r.k,
});
