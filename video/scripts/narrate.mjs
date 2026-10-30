/**
 * Turn a narration script into one MP3 per scene in Derek's cloned voice.
 *
 *   npm run narrate -- <name>              # narration/<name>.json
 *   npm run narrate -- <name> --redo intro # new take of one scene (comma-separate several)
 *   npm run narrate -- <name> --dry-run    # show what would be generated; no API call
 *
 * Writes footage/narration/<name>/<scene>.mp3 plus a manifest.json with each
 * scene's duration, which <NarrationTrack> reads to place the audio. Scenes
 * whose text and voice settings haven't changed are skipped, so editing one
 * line only re-spends credits on that line.
 *
 * Needs ELEVENLABS_API_KEY in video/.env (gitignored) and ffprobe on PATH.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

// "Derek" instant clone, built from the walkthrough narration. Multilingual v2
// stays closest to the clone; v3/v4 came out bubbly. Lower stability than the
// default keeps v2 from going flat.
const DEFAULTS = {
  voiceId: "nJgXo5hbA7d35DqQrrdg",
  modelId: "eleven_multilingual_v2",
  voiceSettings: {
    stability: 0.35,
    similarity_boost: 0.85,
    style: 0.15,
    use_speaker_boost: true,
  },
};

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--redo");
const dryRun = args.includes("--dry-run");
const redo = new Set(
  args.includes("--redo") ? (args[args.indexOf("--redo") + 1] ?? "").split(",") : [],
);

if (!name) {
  console.error("usage: npm run narrate -- <name> [--redo id,id] [--dry-run]");
  process.exit(1);
}

const scriptPath = path.join(ROOT, "narration", `${name}.json`);
if (!existsSync(scriptPath)) {
  console.error(`No narration script at ${path.relative(ROOT, scriptPath)}`);
  process.exit(1);
}
const script = JSON.parse(readFileSync(scriptPath, "utf8"));
const voiceId = script.voiceId ?? DEFAULTS.voiceId;
const modelId = script.modelId ?? DEFAULTS.modelId;
const voiceSettings = { ...DEFAULTS.voiceSettings, ...script.voiceSettings };

const ids = new Set();
for (const scene of script.scenes ?? []) {
  if (!/^[a-z0-9-]+$/.test(scene.id ?? "") || ids.has(scene.id) || !scene.text?.trim()) {
    console.error(`Each scene needs a unique kebab-case id and some text (bad: ${JSON.stringify(scene.id)})`);
    process.exit(1);
  }
  ids.add(scene.id);
}

const outDir = path.join(ROOT, "footage", "narration", name);
const manifestPath = path.join(outDir, "manifest.json");
const previous = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : { scenes: [] };
const previousById = new Map(previous.scenes.map((s) => [s.id, s]));

const hashOf = (text) =>
  createHash("sha256")
    .update(JSON.stringify({ text, voiceId, modelId, voiceSettings }))
    .digest("hex")
    .slice(0, 16);

const plan = script.scenes.map((scene, i) => {
  const hash = hashOf(scene.text);
  const file = `narration/${name}/${scene.id}.mp3`;
  const prior = previousById.get(scene.id);
  const fresh =
    prior?.hash === hash && existsSync(path.join(ROOT, "footage", file)) && !redo.has(scene.id);
  return { scene, i, hash, file, prior, fresh };
});

for (const { scene, fresh } of plan) {
  console.log(`${fresh ? "  keep" : "  make"}  ${scene.id}  ${scene.text.slice(0, 70)}${scene.text.length > 70 ? "…" : ""}`);
}
if (dryRun) process.exit(0);

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey && plan.some((p) => !p.fresh)) {
  console.error("\nSet ELEVENLABS_API_KEY in video/.env first.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const durationOf = (file) =>
  Number(
    execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "csv=p=0",
      file,
    ]).toString().trim(),
  );

const scenes = [];
for (const { scene, i, hash, file, prior, fresh } of plan) {
  if (fresh) {
    scenes.push(prior);
    continue;
  }
  // Neighboring lines let the model carry intonation across scene cuts.
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        text: scene.text,
        model_id: modelId,
        voice_settings: voiceSettings,
        previous_text: script.scenes[i - 1]?.text,
        next_text: script.scenes[i + 1]?.text,
      }),
    },
  );
  if (!res.ok) {
    console.error(`\n${scene.id}: ElevenLabs ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const abs = path.join(ROOT, "footage", file);
  writeFileSync(abs, Buffer.from(await res.arrayBuffer()));
  const durationSec = durationOf(abs);
  console.log(`  done  ${scene.id}  ${durationSec.toFixed(1)}s`);
  scenes.push({ id: scene.id, file, durationSec, hash });
}

writeFileSync(
  manifestPath,
  `${JSON.stringify({ name, voiceId, modelId, scenes }, null, 2)}\n`,
);
console.log(`\n${scenes.length} scenes, ${scenes.reduce((t, s) => t + s.durationSec, 0).toFixed(1)}s → ${path.relative(ROOT, manifestPath)}`);
