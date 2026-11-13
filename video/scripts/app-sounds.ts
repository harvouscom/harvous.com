/**
 * The app's own interface sounds, rendered to files for the mix.
 *
 *   npm run intro:app-sounds
 *
 * Harvous synthesizes its sounds live with `cuelume` (Web Audio, no files).
 * This plays each cue the walkthrough triggers into an OfflineAudioContext in
 * headless Chromium, with the app's own settings from src/utils/sounds.ts in
 * the app repo (theme per cue, emphasis, NAV_VOLUME 0.7, MASTER_VOLUME 0.5),
 * and writes footage/intro/app-sounds/<moment>.wav. The composition places
 * them where the actions happen in each take (`sounds` in timeline.ts).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "footage", "intro", "app-sounds");
const DIST = path.join(ROOT, "node_modules", "cuelume", "dist");

/** Mirrors SOUND_CUES in the app's src/utils/sounds.ts for the moments we use. */
const NAV = 0.7;
const CUES: Record<string, { sound: string; theme?: string; emphasis: string; volume?: number; direction?: string }> = {
  "nav.open": { sound: "open", emphasis: "subtle", volume: NAV },
  "nav.close": { sound: "close", emphasis: "subtle", volume: NAV },
  "nav.forward": { sound: "navigate", emphasis: "subtle", volume: NAV, direction: "forward" },
  "nav.drillIn": { sound: "select", emphasis: "subtle", volume: NAV, direction: "forward" },
  "nav.select": { sound: "select", emphasis: "subtle", volume: NAV },
  "nav.toggle": { sound: "toggle", emphasis: "subtle", volume: NAV },
  "dock.open": { sound: "open", theme: "press", emphasis: "subtle", volume: NAV },
  "dock.close": { sound: "close", theme: "press", emphasis: "subtle", volume: NAV },
  "panel.open": { sound: "open", theme: "mech", emphasis: "subtle", volume: NAV },
  "panel.close": { sound: "close", theme: "mech", emphasis: "subtle", volume: NAV },
  "highlight.created": { sound: "select", emphasis: "subtle" },
  "organize.filed": { sound: "ready", emphasis: "subtle" },
};

const MASTER_VOLUME = 0.5;
const SECONDS = 2.5;
const RATE = 48000;
/** Lifts the app's half-volume, room-level cues to mix level, clip-free. */
const GAIN = 16;

const wav = (channels: Float32Array[]) => {
  const n = channels[0].length;
  const buf = Buffer.alloc(44 + n * channels.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * channels.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels.length, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * channels.length * 2, 28);
  buf.writeUInt16LE(channels.length * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * channels.length * 2, 40);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (const ch of channels) {
      const v = Math.max(-1, Math.min(1, ch[i]));
      buf.writeInt16LE(Math.round(v * 32767), o);
      o += 2;
    }
  }
  return buf;
};

(async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [moment, cue] of Object.entries(CUES)) {
    const page = await browser.newPage();
    // Serve cuelume's ESM files from a fake origin so the page can import them.
    await page.route("http://cuelume.local/**", (route) => {
      const rel = new URL(route.request().url()).pathname.replace(/^\//, "");
      route.fulfill({ body: readFileSync(path.join(DIST, rel)), contentType: "text/javascript" });
    });
    await page.goto("http://cuelume.local/index.js").catch(() => {});
    await page.setContent("<html><body>sounds</body></html>");
    // cuelume only plays after a real gesture.
    await page.mouse.click(10, 10);
    // Passed as a string: tsx's helpers don't exist in the page.
    const channels = (await page.evaluate(`(async () => {
      const cue = ${JSON.stringify(cue)};
      const offline = new OfflineAudioContext(2, ${Math.round(SECONDS * RATE)}, ${RATE});
      // cuelume makes one shared AudioContext and only renders while it's
      // "running": hand it the offline context, reporting itself as running.
      Object.defineProperty(offline, "state", { get: () => "running" });
      window.AudioContext = function () { return offline; };
      const mod = await import("http://cuelume.local/index.js");
      mod.setTheme("default");
      mod.setVolume(${MASTER_VOLUME});
      mod.play(cue.sound, { emphasis: cue.emphasis, volume: cue.volume, theme: cue.theme, direction: cue.direction });
      const rendered = await offline.startRendering();
      return [Array.from(rendered.getChannelData(0)), Array.from(rendered.getChannelData(1))];
    })()`)) as number[][];
    // One common gain for every cue: the app's own balance between them
    // (moments over navigation, page turns over ticks) is kept, just audible
    // against a voice and a music bed.
    const data = channels.map((c) => Float32Array.from(c, (v) => v * GAIN));
    // Trim the silent tail.
    let end = data[0].length;
    while (end > RATE * 0.2 && Math.abs(data[0][end - 1]) < 1e-4 && Math.abs(data[1][end - 1]) < 1e-4) end--;
    const trimmed = data.map((c) => c.slice(0, Math.min(c.length, end + Math.round(RATE * 0.05))));
    const peak = Math.max(...trimmed.map((c) => c.reduce((m, v) => Math.max(m, Math.abs(v)), 0)));
    writeFileSync(path.join(OUT, `${moment}.wav`), wav(trimmed));
    console.log(`  ${moment.padEnd(18)} ${(trimmed[0].length / RATE).toFixed(2)}s  peak ${peak.toFixed(3)}`);
    await page.close();
  }
  await browser.close();
  writeFileSync(
    path.join(OUT, "manifest.json"),
    `${JSON.stringify(Object.fromEntries(Object.keys(CUES).map((m) => [m, `intro/app-sounds/${m}.wav`])), null, 2)}\n`,
  );
})();
