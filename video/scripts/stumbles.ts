/**
 * Read back what Scribe heard for each narration line and flag stumbles the
 * clone sometimes adds: um, uh, "you know", "I mean", "like,", and a word said
 * twice. Also reports time after a line's last word, which the composition trims
 * (that's where the next line used to bleed in).
 *
 * And the name. Said right, "Harvous" comes back from Scribe as "Harvest"
 * (every take Derek approved did); "Harvus", "Harvose" and "Harvoost" are the
 * clone saying it wrong. A line that says Harvous fails unless each one was
 * heard as "Harvest".
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

const script = JSON.parse(readFileSync(path.join(ROOT, "narration", "intro.json"), "utf8")) as { scenes: { id: string; text: string; say?: string }[] };
const spoken = new Map(script.scenes.map((s) => [s.id, s.say ?? s.text]));

const STUMBLE = /\b(uh|um|erm)\b|\byou know\b|\bi mean\b|\blike,|\b(\w+),? \2\b/i;
let bad = 0;
for (const s of manifest.scenes) {
  const words = (JSON.parse(readFileSync(path.join(DIR, `${s.id}.words.json`), "utf8")) as { words: { text: string; end: number }[] }).words;
  const heard = words.map((w) => w.text).join(" ");
  const hit = heard.match(STUMBLE);
  const last = words[words.length - 1]?.end ?? 0;
  const tail = s.durationSec - last;
  // The name: as many "Harvest"s heard as "Harvous"es said, and nothing else that starts "Harv".
  const said = (spoken.get(s.id)?.match(/\bHarvous\b/g) ?? []).length;
  const harv = words.map((w) => w.text.replace(/[^A-Za-z]/g, "")).filter((w) => /^harv/i.test(w));
  const wrongName = said > 0 && (harv.length !== said || harv.some((w) => !/^harvest$/i.test(w)));
  const flag = hit ? `STUMBLE "${hit[0]}"` : wrongName ? `NAME "${harv.join(", ") || "missing"}"` : "clean";
  if (hit || wrongName) bad++;
  console.log(`${s.id.padEnd(16)} ${flag.padEnd(22)} ${tail > 0.35 ? `(${tail.toFixed(2)}s after last word: trimmed in the composition)` : ""}`);
}
process.exit(bad ? 1 : 0);
