import type { BrowserContext, Page } from "playwright";

/**
 * Slow-motion for the page, so the screencast can keep up (see recorder.ts).
 *
 * CSS transitions and Web Animations slow down through CDP's
 * Animation.setPlaybackRate. JS-driven motion (springs on requestAnimationFrame,
 * performance.now) and timer delays slow down through this init script, which
 * runs a virtual clock. Date.now is left alone so saved timestamps stay true.
 */
const INIT = () => {
  const w = window as unknown as Record<string, unknown>;
  if (w.__introTimeScale) return;
  const realNow = performance.now.bind(performance);
  let scale = 1;
  let baseReal = realNow();
  let baseVirt = baseReal;
  const virt = (r: number) => baseVirt + (r - baseReal) * scale;
  performance.now = () => virt(realNow());
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((ts) => cb(virt(ts)));
  const st = window.setTimeout.bind(window);
  const si = window.setInterval.bind(window);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).setTimeout = (fn: TimerHandler, ms?: number, ...a: unknown[]) => st(fn, (ms ?? 0) / scale, ...a);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).setInterval = (fn: TimerHandler, ms?: number, ...a: unknown[]) => si(fn, (ms ?? 0) / scale, ...a);
  w.__introTimeScale = (s: number) => {
    const r = realNow();
    baseVirt = virt(r);
    baseReal = r;
    scale = s;
  };
};

export const installTimescale = (context: BrowserContext) => context.addInitScript(INIT);

/** Run the page at `rate` of real speed (1/3 for a 3× slow-mo capture). */
export const setPageSpeed = async (page: Page, rate: number) => {
  const client = await page.context().newCDPSession(page);
  await client.send("Animation.enable");
  await client.send("Animation.setPlaybackRate", { playbackRate: rate });
  await page.evaluate((r) => (window as unknown as { __introTimeScale?: (s: number) => void }).__introTimeScale?.(r), rate);
  return client;
};
