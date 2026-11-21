/**
 * Captions for the intro, timed to the word.
 *
 *   npm run intro:captions
 *
 * Each narration line is transcribed with ElevenLabs Scribe for word timings,
 * then placed where the composition places that line (same placeBeats), so
 * the cues match the render exactly. Cue text comes from narration/intro.json,
 * not the transcript, so the captions say what the script says.
 *
 * Writes footage/intro/harvous-intro.vtt and copies it to the site's
 * public/harvous-intro.vtt, which the hero lightbox loads as a <track>.
 * Run after `npm run narrate -- intro`.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { placeBeats } from "../src/intro/plan";
import { BEATS } from "../src/intro/timeline";
import { loadIntroDataFromDisk } from "./intro-disk-data";
import { cueWords, timeWords } from "../src/intro/words";

const ROOT = path.resolve(__dirname, "..");
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Set ELEVENLABS_API_KEY in video/.env first.");
  process.exit(1);
}

const data = loadIntroDataFromDisk();
if (data.estimated.length) throw new Error(`No audio yet for: ${data.estimated.join(", ")}. Run: npm run narrate -- intro`);
const { placed } = placeBeats(BEATS, data);
const narration = JSON.parse(readFileSync(path.join(ROOT, "footage", "narration", "intro", "manifest.json"), "utf8")) as {
  scenes: { id: string; hash: string }[];
};
const made = new Map(narration.scenes.map((s) => [s.id, s.hash]));

type Word = { text: string; start: number; end: number };

/**
 * Where the last word has actually died away, in seconds: the first 150 ms
 * after Scribe's end for it that stays under -45 dBFS. Scribe ends a word
 * early (before its final consonant and decay fade), so trimming by its
 * timing alone clipped the ends of words.
 */
const soundEndOf = (file: string, lastWordEnd: number) => {
  const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", path.join(ROOT, "footage", file), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], {
    maxBuffer: 64 * 1024 * 1024,
  });
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 2));
  const hop = 160; // 10 ms
  const db: number[] = [];
  for (let i = 0; i + hop <= samples.length; i += hop) {
    let sum = 0;
    for (let k = i; k < i + hop; k++) sum += (samples[k] / 32768) ** 2;
    db.push(10 * Math.log10(sum / hop + 1e-12));
  }
  for (let i = Math.floor(lastWordEnd * 100); i < db.length - 15; i++) {
    if (db.slice(i, i + 15).every((d) => d < -45)) return i / 100;
  }
  return db.length / 100;
};

/**
 * Scribe word timings for one line, cached next to the audio and keyed by the
 * audio itself (plus the line's manifest hash), so re-running only transcribes
 * lines that were re-voiced, including a new take of the same words. The
 * cache also keeps where the line's sound ends (`soundEnd`).
 */
const transcribe = async (id: string, file: string, lineHash: string): Promise<Word[]> => {
  const audio = readFileSync(path.join(ROOT, "footage", file));
  const hash = `${lineHash}-${createHash("sha1").update(audio).digest("hex").slice(0, 12)}`;
  const cacheFile = path.join(ROOT, "footage", "narration", "intro", `${id}.words.json`);
  if (existsSync(cacheFile)) {
    const cached = JSON.parse(readFileSync(cacheFile, "utf8")) as { hash: string; words: Word[]; soundEnd?: number };
    if (cached.hash === hash) {
      if (cached.soundEnd === undefined && cached.words.length) {
        cached.soundEnd = soundEndOf(file, cached.words[cached.words.length - 1].end);
        writeFileSync(cacheFile, `${JSON.stringify(cached)}\n`);
      }
      return cached.words;
    }
  }
  const form = new FormData();
  form.append("model_id", "scribe_v1");
  form.append("file", new Blob([audio]), path.basename(file));
  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });
  if (!res.ok) throw new Error(`Scribe ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { words: (Word & { type: string })[] };
  const words = json.words.filter((w) => w.type === "word").map(({ text, start, end }) => ({ text, start, end }));
  const soundEnd = words.length ? soundEndOf(file, words[words.length - 1].end) : undefined;
  writeFileSync(cacheFile, `${JSON.stringify({ hash, words, soundEnd })}\n`);
  return words;
};

const stamp = (sec: number) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s}.${String(ms % 1000).padStart(3, "0")}`;
};

type Cue = { a: number; b: number; text: string };

(async () => {
  const cues: Cue[] = [];
  for (const beat of placed) {
    for (const line of beat.lines) {
      const hash = made.get(line.id) ?? line.id;
      const heard = await transcribe(line.id, line.file as string, hash);
      const at = beat.startSec + line.startSec;
      // Same timing and chunking as the on-screen subtitles (src/intro/words.ts).
      for (const cue of cueWords(timeWords(line.text, heard, line.durationSec))) {
        cues.push({ a: at + cue.start, b: at + cue.end, text: cue.words.map((w) => w.word).join(" ") });
      }
      console.log(`  ${line.id}: ${heard.length} words heard`);
    }
  }
  // Each cue holds a beat past its last word, but never into the next cue.
  const lines = ["WEBVTT", ""];
  cues.forEach((c, i) => {
    const next = cues[i + 1];
    const b = Math.min(c.b + 0.3, next ? next.a - 0.04 : c.b + 0.3);
    lines.push(String(i + 1), `${stamp(c.a)} --> ${stamp(Math.max(b, c.a + 0.6))}`, c.text, "");
  });
  const out = path.join(ROOT, "footage", "intro", "harvous-intro.vtt");
  writeFileSync(out, `${lines.join("\n")}\n`);
  copyFileSync(out, path.join(ROOT, "..", "public", "harvous-intro.vtt"));
  console.log(`${cues.length} cues → footage/intro/harvous-intro.vtt and ../public/harvous-intro.vtt`);
})();
