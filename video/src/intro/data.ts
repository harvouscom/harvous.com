import { staticFile } from "remotion";
import script from "../../narration/intro.json";
import type { TakeEvents, TakesManifest } from "./take-types";
import type { HeardWord } from "./words";

/**
 * Everything the intro reads from footage/, gathered once in
 * calculateMetadata and handed to the composition as props.
 */

export type VoLine = {
  id: string;
  text: string;
  durationSec: number;
  /** null until `npm run narrate -- intro` has made the audio. */
  file: string | null;
  /** Scribe's word timings (from `npm run intro:captions`); empty until then. */
  heard: HeardWord[];
};

export type Ambience = { beds: string[]; birds: string[] };

export type IntroData = {
  takes: Record<string, { video: string; durationSec: number; events: TakeEvents }>;
  vo: Record<string, VoLine>;
  ambience: Ambience | null;
  /** The instrumental bed (`npm run intro:music`), or null. */
  music: string | null;
  /** The app's own interface sounds by moment (`npm run intro:app-sounds`). */
  appSounds: Record<string, string>;
};

/** Without audio yet, a line is timed at an unhurried 2.3 words a second. */
const estimate = (text: string) => text.split(/\s+/).length / 2.3 + 0.4;

const getJson = async <T>(file: string): Promise<T | null> => {
  const res = await fetch(staticFile(file)).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as T | null;
};

export const loadIntroData = async (): Promise<IntroData> => {
  const manifest = (await getJson<TakesManifest>("intro/takes/manifest.json")) ?? {};
  const takes: IntroData["takes"] = {};
  await Promise.all(
    Object.entries(manifest).map(async ([name, t]) => {
      const events = await getJson<TakeEvents>(t.events);
      if (events) takes[name] = { video: t.video, durationSec: t.durationSec, events };
    }),
  );

  const narration = await getJson<{ scenes: { id: string; file: string; durationSec: number }[] }>(
    "narration/intro/manifest.json",
  );
  const made = new Map((narration?.scenes ?? []).map((s) => [s.id, s]));
  const vo: IntroData["vo"] = {};
  await Promise.all(
    script.scenes.map(async (line) => {
      const audio = made.get(line.id);
      const words = audio ? await getJson<{ words: HeardWord[] }>(`narration/intro/${line.id}.words.json`) : null;
      vo[line.id] = audio
        ? { id: line.id, text: line.text, durationSec: audio.durationSec, file: audio.file, heard: words?.words ?? [] }
        : { id: line.id, text: line.text, durationSec: estimate(line.text), file: null, heard: [] };
    }),
  );

  const ambience = await getJson<Ambience>("intro/ambience/manifest.json");
  const musicFile = "intro/music/bed.mp3";
  const music = (await fetch(staticFile(musicFile), { method: "HEAD" }).catch(() => null))?.ok ? musicFile : null;
  const appSounds = (await getJson<Record<string, string>>("intro/app-sounds/manifest.json")) ?? {};
  return { takes, vo, ambience, music, appSounds };
};
