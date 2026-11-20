/**
 * The outdoor bed under the intro: light wind, distant birds.
 *
 *   npm run intro:ambience            # make whatever's missing
 *   npm run intro:ambience -- --redo  # new takes of everything
 *
 * Two looping 30 s beds, crossfaded in the composition so the loop point never
 * shows. (Single bird calls in the pauses were tried and pulled: too much.) ElevenLabs sound
 * effects, same API key as `npm run narrate` (video/.env, gitignored).
 * Writes footage/intro/ambience/*.mp3 and a manifest.json the composition reads.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "footage", "intro", "ambience");
const redo = process.argv.includes("--redo");

const NO = "No traffic, no people, no music, no voices, no insects buzzing close to the microphone.";
const SOUNDS = [
  {
    file: "bed-a.mp3",
    kind: "bed",
    seconds: 30,
    loop: true,
    text: `Quiet open field in the early morning. A soft, steady breeze moving through tall grass and leaves, with a few songbirds far off in the trees. Calm and spacious. ${NO}`,
  },
  {
    file: "bed-b.mp3",
    kind: "bed",
    seconds: 30,
    loop: true,
    text: `Gentle outdoor morning air at the edge of a meadow. Light wind rising and settling in the leaves, distant birdsong, very peaceful and natural. ${NO}`,
  },
];

const apiKey = process.env.ELEVENLABS_API_KEY;
mkdirSync(OUT, { recursive: true });

for (const s of SOUNDS) {
  const abs = path.join(OUT, s.file);
  if (existsSync(abs) && !redo) {
    console.log(`  keep  ${s.file}`);
    continue;
  }
  if (!apiKey) {
    console.error("\nSet ELEVENLABS_API_KEY in video/.env first.");
    process.exit(1);
  }
  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({
      text: s.text,
      model_id: "eleven_text_to_sound_v2",
      duration_seconds: s.seconds,
      prompt_influence: 0.45,
      ...(s.loop ? { loop: true } : {}),
    }),
  });
  if (!res.ok) {
    console.error(`\n${s.file}: ElevenLabs ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  writeFileSync(abs, Buffer.from(await res.arrayBuffer()));
  console.log(`  made  ${s.file}`);
}

const rel = (f) => `intro/ambience/${f}`;
writeFileSync(
  path.join(OUT, "manifest.json"),
  `${JSON.stringify(
    {
      beds: SOUNDS.filter((s) => s.kind === "bed").map((s) => rel(s.file)),
      birds: SOUNDS.filter((s) => s.kind === "bird").map((s) => rel(s.file)),
    },
    null,
    2,
  )}\n`,
);
console.log("→ footage/intro/ambience/manifest.json");
