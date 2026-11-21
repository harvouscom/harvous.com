/**
 * An atmospheric ambient bed, composed to the edit.
 *
 *   npm run intro:music             # make it if it's missing
 *   npm run intro:music -- --redo   # a new take
 *
 * The music is planned section by section from the intro's own timing: one
 * section per chapter, each exactly as long as that chapter, at the tempo the
 * cuts are snapped to (plan.ts TEMPO_BPM). So the music changes, swells and
 * settles where the picture does, instead of running under it regardless.
 *
 * ElevenLabs Music with a composition plan, same API key as `npm run narrate`
 * (video/.env; the key needs the Music permission). Writes
 * footage/intro/music/bed.mp3 and bed.plan.json (what was asked for).
 * Re-run after the timing changes enough to move a chapter.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { placeBeats } from "../src/intro/plan";
import { BEATS } from "../src/intro/timeline";
import { loadIntroDataFromDisk } from "./intro-disk-data";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "footage", "intro", "music");
const file = path.join(OUT, "bed.mp3");
/** The take as generated, before the clean-up filter (kept for comparison). */
const raw = path.join(OUT, "bed.raw.mp3");
const redo = process.argv.includes("--redo");

// Beatless and organic: an earlier take asked for "shimmering textures" and a
// felt pulse, which came back as grainy, scratchy sparkle up top and a
// mechanical sway. The sections still match the chapters (plan.ts snaps their
// starts to TEMPO_BPM); the music just doesn't tick along.
const GLOBAL = [
  "warm, organic ambient soundscape, like a calm focus app",
  "soft warm pads and a low, gentle drone that breathe and swell slowly, like slow breathing",
  "smooth and rounded, mellow and dark-toned, everything soft-edged",
  "beatless and free-flowing, major key, peaceful and hopeful",
  "unhurried and human, sits quietly underneath a spoken voice",
];
const NEVER = [
  "piano", "strings", "orchestra", "classical", "drums", "percussion", "beat", "pulse", "rhythm", "arpeggio",
  "vocals", "melody", "guitar", "bells", "chimes", "shimmer", "sparkle", "glitch", "granular", "crackle", "noise",
  "static", "vinyl", "bitcrush", "robotic", "sci-fi", "bright highs", "sudden changes",
];
/**
 * After generation: a gentle low-pass. The bed's music lives below ~1.5 kHz;
 * anything the model leaves up top is artifact (it measured as 30-45 dB
 * flicker over near-silence), so it's rolled off rather than heard.
 */
const CLEAN = "highpass=f=35,lowpass=f=3200:poles=2,lowpass=f=4500";

/** What each chapter's section does. Changes happen at the section boundary, on the chapter cut. */
const MOOD: Record<string, string[]> = {
  open: ["sparse, a single soft pad slowly opening up, lots of air", "quiet, intimate"],
  home: ["warm pads arrive gently on the downbeat, a soft glow", "morning light"],
  scripture: ["a light shimmering texture joins, a little brighter"],
  dock: ["the pad deepens and widens, unhurried, curious"],
  reader: ["settled and warm, a soft swell at the start, then calm"],
  organize: ["lighter, gentle movement in the texture"],
  threads: ["continuing, soft and connected"],
  review: ["a quiet lift, slightly brighter, a gentle sense of return"],
  close: ["resolving, opening up, warm and full, then slowly thinning out and fading to near silence at the end"],
};

(async () => {
  if (existsSync(file) && !redo) {
    console.log("  keep  bed.mp3 (--redo for a new take)");
    return;
  }
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("Set ELEVENLABS_API_KEY in video/.env first.");

  const { placed, totalSec } = placeBeats(BEATS, loadIntroDataFromDisk());
  const sections = placed.map((p, i) => {
    const end = i < placed.length - 1 ? placed[i + 1].startSec : totalSec + 1.5;
    return {
      section_name: p.beat.id,
      positive_local_styles: MOOD[p.beat.id] ?? ["calm, continuing"],
      negative_local_styles: [],
      duration_ms: Math.max(3000, Math.round((end - p.startSec) * 1000)),
      lines: [],
    };
  });
  const plan = { positive_global_styles: GLOBAL, negative_global_styles: NEVER, sections };
  mkdirSync(OUT, { recursive: true });
  writeFileSync(path.join(OUT, "bed.plan.json"), `${JSON.stringify(plan, null, 2)}\n`);
  for (const s of sections) console.log(`  ${s.section_name.padEnd(10)} ${(s.duration_ms / 1000).toFixed(2)}s`);

  const res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ composition_plan: plan, model_id: "music_v1" }),
  });
  if (!res.ok) throw new Error(`ElevenLabs Music ${res.status} ${await res.text()}`);
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-af", CLEAN, "-c:a", "libmp3lame", "-b:a", "192k", file]);
  console.log(`  made  bed.mp3 (${totalSec.toFixed(1)}s, ${sections.length} sections) → footage/intro/music/bed.mp3`);
})().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
