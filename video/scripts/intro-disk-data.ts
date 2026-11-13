/**
 * The same IntroData the composition builds in calculateMetadata, read from
 * disk for Node scripts (captions, timing), so they place every line exactly
 * where the render does.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { IntroData } from "../src/intro/data";
import type { TakeEvents, TakesManifest } from "../src/intro/take-types";

const ROOT = path.resolve(__dirname, "..");
const FOOTAGE = path.join(ROOT, "footage");
const json = <T>(file: string): T | null => (existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : null);

export const loadIntroDataFromDisk = (): IntroData & { estimated: string[] } => {
  const manifest = json<TakesManifest>(path.join(FOOTAGE, "intro", "takes", "manifest.json")) ?? {};
  const takes: IntroData["takes"] = {};
  for (const [name, t] of Object.entries(manifest)) {
    const events = json<TakeEvents>(path.join(FOOTAGE, t.events));
    if (events) takes[name] = { video: t.video, durationSec: t.durationSec, events };
  }
  const script = json<{ scenes: { id: string; text: string }[] }>(path.join(ROOT, "narration", "intro.json"));
  const made = json<{ scenes: { id: string; file: string; durationSec: number }[] }>(path.join(FOOTAGE, "narration", "intro", "manifest.json"));
  const vo: IntroData["vo"] = {};
  const estimated: string[] = [];
  for (const line of script?.scenes ?? []) {
    const audio = made?.scenes.find((s) => s.id === line.id);
    const heard = json<{ words: IntroData["vo"][string]["heard"] }>(path.join(FOOTAGE, "narration", "intro", `${line.id}.words.json`))?.words ?? [];
    if (audio) vo[line.id] = { id: line.id, text: line.text, durationSec: audio.durationSec, file: audio.file, heard };
    else {
      estimated.push(line.id);
      vo[line.id] = { id: line.id, text: line.text, durationSec: line.text.split(/\s+/).length / 2.3 + 0.4, file: null, heard: [] };
    }
  }
  const music = existsSync(path.join(FOOTAGE, "intro", "music", "bed.mp3")) ? "intro/music/bed.mp3" : null;
  const appSounds = json<Record<string, string>>(path.join(FOOTAGE, "intro", "app-sounds", "manifest.json")) ?? {};
  return { takes, vo, ambience: json(path.join(FOOTAGE, "intro", "ambience", "manifest.json")), music, appSounds, estimated };
};
