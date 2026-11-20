import type { Locator, Page } from "playwright";
import type { Box, CursorKind, TakeEvent } from "../src/intro/take-types.ts";
import type { Device } from "./config.ts";

/**
 * The actions a scene performs, done the way a person would and logged for
 * the compositor. The real pointer moves along every path (so hover states
 * fire), but the cursor you see in the video is drawn later from this log.
 */
export type Act = ReturnType<typeof createAct>;

/** Small seeded PRNG, so a re-shoot moves the same way. */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const createAct = (
  page: Page,
  device: Device,
  now: () => number,
  { seed = 7, slow = 1 }: { seed?: number; slow?: number } = {},
) => {
  // Every duration below is in playback time; the page runs `slow`× slower
  // while recording, so real waits stretch to match (see recorder.ts).
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms * slow));
  const events: TakeEvent[] = [];
  const rand = rng(seed);
  const vp = page.viewportSize() ?? { width: 1440, height: 900 };
  // Start where a hand would rest: lower right of the content.
  let pos = { x: vp.width * 0.62, y: vp.height * 0.72 };
  let cursor: CursorKind = "arrow";

  const log = (e: Omit<TakeEvent, "t"> & Record<string, unknown>) =>
    events.push({ t: Math.round(now()), ...e } as TakeEvent);

  const boxOf = async (target: Locator): Promise<Box> => {
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    if (!box) throw new Error(`Not visible: ${target}`);
    return box;
  };

  const cursorFor = async (target: Locator): Promise<CursorKind> => {
    const css = await target.evaluate((el) => getComputedStyle(el).cursor).catch(() => "auto");
    if (css === "pointer") return "pointer";
    if (css === "text") return "text";
    const editable = await target
      .evaluate((el) => (el as HTMLElement).isContentEditable || el.matches("input, textarea"))
      .catch(() => false);
    return editable ? "text" : "arrow";
  };

  /** A point inside the box, a little off-centre like a real aim. */
  const aimAt = (box: Box) => ({
    x: box.x + box.width * (0.42 + rand() * 0.16),
    y: box.y + box.height * (0.4 + rand() * 0.2),
  });

  /** Glide along a gently curved path; duration grows with distance. */
  const glide = async (to: { x: number; y: number }, kind: CursorKind) => {
    const from = { ...pos };
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) {
      pos = to;
      return;
    }
    const ms = Math.min(1100, 320 + dist * 0.45);
    const steps = Math.max(8, Math.round(ms / 16));
    // One bowed control point, perpendicular to the line of travel.
    const bow = (rand() - 0.5) * Math.min(120, dist * 0.18);
    const cx = from.x + dx / 2 - (dy / (dist || 1)) * bow;
    const cy = from.y + dy / 2 + (dx / (dist || 1)) * bow;
    for (let i = 1; i <= steps; i++) {
      const t = easeInOut(i / steps);
      const x = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * cx + t * t * to.x;
      const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * cy + t * t * to.y;
      await page.mouse.move(x, y);
      // Switch to the target's cursor only once we're over it.
      log({ kind: "move", x, y, cursor: i > steps * 0.85 ? kind : cursor });
      await sleep(ms / steps);
    }
    pos = to;
    cursor = kind;
  };

  return {
    events,

    pause: (ms: number) => sleep(ms),

    /** Name this moment, for the timeline to sync to. */
    mark: (name: string) => log({ kind: "mark", name }),

    /** Record where an element is right now, for an annotation to sit on. */
    anchor: async (name: string, target: Locator) => {
      // An anchor is a nice-to-have for annotations; never stall a take on one.
      const box = await target.boundingBox({ timeout: 2000 }).catch(() => null);
      if (box) log({ kind: "anchor", name, box });
      else console.warn(`  anchor "${name}" not found`);
      return box;
    },

    /** Move the pointer onto an element without clicking. */
    hover: async (target: Locator) => {
      const box = await boxOf(target);
      if (device === "desktop") await glide(aimAt(box), await cursorFor(target));
      return box;
    },

    click: async (target: Locator, { settle = 450 }: { settle?: number } = {}) => {
      const box = await boxOf(target);
      const at = aimAt(box);
      if (device === "phone") {
        log({ kind: "tap", x: at.x, y: at.y });
        await page.touchscreen.tap(at.x, at.y);
      } else {
        await glide(at, await cursorFor(target));
        await sleep(90 + rand() * 80);
        log({ kind: "down", x: at.x, y: at.y });
        await page.mouse.down();
        await sleep(70 + rand() * 40);
        await page.mouse.up();
        log({ kind: "up", x: at.x, y: at.y });
      }
      await sleep(settle);
      return box;
    },

    /** Type like a person: uneven gaps, a beat after spaces and punctuation. */
    type: async (text: string, { wpm = 52 }: { wpm?: number } = {}) => {
      const base = 60000 / (wpm * 5);
      for (const ch of text) {
        await page.keyboard.type(ch);
        log({ kind: "key", text: ch });
        let wait = base * (0.55 + rand() * 0.9);
        if (ch === " ") wait += 40 + rand() * 60;
        if (/[.,:;!?]/.test(ch)) wait += 120 + rand() * 120;
        await sleep(wait);
      }
    },

    press: async (key: string) => {
      await page.keyboard.press(key);
      log({ kind: "key", text: key });
    },

    /** Smooth wheel scroll (or a swipe on the phone) by dy CSS pixels. */
    scroll: async (dy: number, { ms = 900 }: { ms?: number } = {}) => {
      const steps = Math.max(10, Math.round(ms / 16));
      let done = 0;
      // Playwright has no touch drag, so the phone scrolls by wheel too. On an
      // eased curve it reads the same on camera as a swipe.
      for (let i = 1; i <= steps; i++) {
        const next = Math.round(dy * easeInOut(i / steps));
        await page.mouse.wheel(0, next - done);
        done = next;
        await sleep(ms / steps);
      }
      log({ kind: "scroll", x: pos.x, y: pos.y, dy });
    },

    /** Glide somewhere neutral so the cursor isn't parked on the content. */
    rest: async (x = vp.width * 0.86, y = vp.height * 0.8) => {
      if (device === "desktop") await glide({ x, y }, "arrow");
    },
  };
};
