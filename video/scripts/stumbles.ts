/**
 * Read back what Scribe heard for each narration line and flag stumbles the
 * clone sometimes adds: um, uh, "you know", "I mean", "like,", and a word said
 * twice. Also reports time after a line's last word, which the composition trims
 * (that's where the next line used to bleed in).
 *
 *   npm run intro:stumbles      # after `npm run intro:captions`
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "footage", "narration", "intro");
const manifest = JSON.parse(readFileSync(path.join(DIR, "manifest.json"), "utf8")) as {
  scenes: { id: string; file: string; durationSec: number }[];
};

const STUMBLE = /\b(uh|um|erm)\b|\byou know\b|\bi mean\b|\blike,|\b(\w+),? \2\b/i;
let bad = 0;
for (const s of manifest.scenes) {
  const words = (JSON.parse(readFileSync(path.join(DIR, `${s.id}.words.json`), "utf8")) as { words: { text: string; end: number }[] }).words;
  const heard = words.map((w) => w.text).join(" ");
  const hit = heard.match(STUMBLE);
  const last = words[words.length - 1]?.end ?? 0;
  const tail = s.durationSec - last;
  const flag = hit ? `STUMBLE "${hit[0]}"` : "clean";
  if (hit) bad++;
  console.log(`${s.id.padEnd(16)} ${flag.padEnd(22)} ${tail > 0.35 ? `(${tail.toFixed(2)}s after last word: trimmed in the composition)` : ""}`);
}
process.exit(bad ? 1 : 0);
