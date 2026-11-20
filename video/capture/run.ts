/**
 * Record one scene as one device.
 *
 *   npm run intro:capture -- --scene home --device desktop
 *   npm run intro:capture -- --scene smoke --device desktop --guest   # no sign-in
 *   npm run intro:capture -- --all                                    # every scene, every device
 *
 * Writes footage/intro/takes/<scene>-<device>.mp4, .events.json (pointer, marks,
 * anchors) and .guard.json (every API write the guard saw).
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type BrowserContext } from "playwright";
import type { TakeEvents } from "../src/intro/take-types.ts";
import { createAct } from "./act.ts";
import { openProfile } from "./browser.ts";
import { APP_URL, DEVICES, TAKES_DIR, TAKE_FPS, type Device } from "./config.ts";
import { installGuard } from "./guard.ts";
import { startRecording } from "./recorder.ts";
import { SCENES } from "./scenes/index.ts";
import { PICKS } from "./scenes.config.ts";
import { installTimescale, setPageSpeed } from "./timescale.ts";
import { tidyPage } from "./tidy.ts";

const args = process.argv.slice(2);
const value = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const guest = args.includes("--guest");
const headless = args.includes("--headless");
/** Slow-motion factor while recording (see recorder.ts). --slow 1 records in real time. */
const slow = Number(value("slow") ?? 3);

const jobs: { sceneId: string; device: Device }[] = args.includes("--all")
  ? SCENES.filter((s) => s.id !== "smoke").flatMap((s) =>
      s.devices.map((device) => ({ sceneId: s.id, device })),
    )
  : [{ sceneId: value("scene") ?? "", device: (value("device") ?? "desktop") as Device }];

mkdirSync(TAKES_DIR, { recursive: true });

for (const { sceneId, device } of jobs) {
  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene) {
    console.error(`Unknown scene "${sceneId}". Scenes: ${SCENES.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }
  if (!scene.devices.includes(device)) {
    console.error(`Scene "${scene.id}" isn't shot on ${device}.`);
    process.exit(1);
  }

  const take = `${scene.id}-${device}`;
  console.log(`\n● ${take}`);

  const context: BrowserContext = guest
    ? await (await chromium.launch({ headless })).newContext({ ...DEVICES[device] })
    : await openProfile(device, { headless });
  await installTimescale(context);
  const page = context.pages()[0] ?? (await context.newPage());

  let now = () => 0;
  const guardLog = await installGuard(context, { allow: scene.allow, now: () => now() });

  const base = { page, device, picks: PICKS, appUrl: APP_URL };
  await page.goto(`${APP_URL}${scene.start(base)}`, { waitUntil: "networkidle" }).catch(() => {});
  if (/\/sign-in/.test(page.url()) && !guest) {
    console.error("Not signed in. Run: npm run intro:login");
    await context.close();
    process.exit(1);
  }
  await tidyPage(page);
  await scene.prepare?.(base);
  await page.waitForTimeout(600);

  const framesDir = path.join(TAKES_DIR, `.frames-${take}`);
  await setPageSpeed(page, 1 / slow);
  const rec = await startRecording(page, framesDir, { slow });
  now = rec.now;
  const act = createAct(page, device, rec.now, { slow });
  await page.mouse.move(DEVICES[device].viewport.width * 0.62, DEVICES[device].viewport.height * 0.72);

  let failed: unknown;
  try {
    await scene.run({ ...base, act });
    await act.pause(700);
  } catch (err) {
    failed = err;
  }

  const videoFile = path.join(TAKES_DIR, `${take}.mp4`);
  const stats = await rec.stop(videoFile);
  await setPageSpeed(page, 1).catch(() => {});
  if (!args.includes("--keep-frames")) rmSync(framesDir, { recursive: true, force: true });

  // Cleanup makes real calls (deleting a throwaway note), so the guard comes off first.
  await context.unrouteAll({ behavior: "ignoreErrors" });
  await scene.cleanup?.(base).catch((err) => {
    console.error(`  CLEANUP FAILED: ${err}`);
    process.exitCode = 1;
  });
  await context.close();

  const events: TakeEvents = {
    scene: scene.id,
    device,
    viewport: DEVICES[device].viewport,
    deviceScaleFactor: DEVICES[device].deviceScaleFactor,
    fps: TAKE_FPS,
    durationMs: stats.durationMs,
    events: act.events,
  };
  writeFileSync(path.join(TAKES_DIR, `${take}.events.json`), `${JSON.stringify(events)}\n`);
  writeFileSync(path.join(TAKES_DIR, `${take}.guard.json`), `${JSON.stringify(guardLog, null, 2)}\n`);

  const stubbed = guardLog.filter((g) => g.action === "stubbed");
  const allowed = guardLog.filter((g) => g.action === "allowed");
  console.log(
    `  ${(stats.durationMs / 1000).toFixed(1)}s, ${stats.frames} frames → ${path.relative(process.cwd(), videoFile)}`,
  );
  console.log(`  motion: a new frame every ${stats.motionGapMs.mean} ms on average, ${stats.motionGapMs.p90} ms at p90`);
  console.log(`  guard: ${stubbed.length} writes stubbed, ${allowed.length} allowed`);
  for (const g of allowed) console.log(`    allowed ${g.method} ${g.url}`);
  if (failed) {
    console.error(failed);
    process.exit(1);
  }
}
process.exit(0);
