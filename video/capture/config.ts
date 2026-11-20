import path from "node:path";

/** Shared settings for the intro-video capture rig. */

export const VIDEO_ROOT = path.resolve(import.meta.dirname, "..");

/**
 * Captures run against production. A local dev build signs in through the dev
 * Clerk instance, which has a different user id, so it can't show Derek's study.
 */
export const APP_URL = process.env.INTRO_APP_URL ?? "https://app.harvous.com";

/** Derek's signed-in Chrome profile. It's a live session, so it's gitignored. */
export const PROFILE_DIR = path.join(VIDEO_ROOT, "capture", ".profile");

/** Raw takes land here: <scene>-<device>.mp4 plus .events.json and .guard.json. */
export const TAKES_DIR = path.join(VIDEO_ROOT, "footage", "intro", "takes");

export type Device = "desktop" | "phone";

export const DEVICES: Record<
  Device,
  {
    viewport: { width: number; height: number };
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
    userAgent?: string;
  }
> = {
  // 16:10, so the Mac window reads like a real laptop browser at 2x.
  desktop: {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
  },
  // iPhone 15/16 points. The status bar is drawn by the Phone frame, so the
  // viewport is only the area the web app actually owns.
  phone: {
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
};

/** Output frame rate of a conformed take. */
export const TAKE_FPS = 60;
