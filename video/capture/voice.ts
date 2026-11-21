/**
 * Pace a scene to the narration, so the footage plays at its real speed and
 * the voice never has to wait for it (or it for the voice).
 *
 *   const vo = voice(act);
 *   vo.start("threads");                       // marks "vo": the line starts now
 *   await vo.at("threads", "share", -0.6);     // 0.6 s before "share" is heard
 *   await act.click(shareButton);
 *
 * Word times come from footage/narration/intro/<id>.words.json (Scribe, via
 * `npm run intro:captions`), so voice the lines before shooting the scene.
 * In the timeline the beat starts its take from the "vo" mark with
 * `from: { mark: "vo", voice: true }`, and the first line starts exactly there.
 * A second line started with `vo.start(id, mark)` is placed with
 * `{ id, at: { mark } }` in the beat's `vo`.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Act } from "./act.ts";

const WORDS = path.resolve(import.meta.dirname, "..", "footage", "narration", "intro");

type Word = { text: string; start: number; end: number };

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

const wordsOf = (id: string): Word[] => {
  try {
    return (JSON.parse(readFileSync(path.join(WORDS, `${id}.words.json`), "utf8")) as { words: Word[] }).words;
  } catch {
    throw new Error(`No word timings for "${id}". Voice it, then run npm run intro:captions.`);
  }
};

export const voice = (act: Act) => {
  const starts = new Map<string, number>();
  return {
    /** The line begins now (take time). Marks `mark` ("vo" by default) for the timeline. */
    start: (id: string, mark = "vo") => {
      starts.set(id, act.now());
      act.mark(mark);
    },
    /** Take ms when `word` (the nth time it's said) is heard in line `id`, plus `offset` seconds. */
    when: (id: string, word: string, offset = 0, nth = 1) => {
      const t0 = starts.get(id);
      if (t0 === undefined) throw new Error(`vo.start("${id}") first`);
      const hits = wordsOf(id).filter((w) => norm(w.text).startsWith(norm(word)));
      const hit = hits[nth - 1];
      if (!hit) throw new Error(`"${word}" isn't heard in "${id}" (${wordsOf(id).map((w) => w.text).join(" ")})`);
      return t0 + (hit.start + offset) * 1000;
    },
    /** Wait for that moment. */
    at: async function (id: string, word: string, offset = 0, nth = 1) {
      await act.waitUntil(this.when(id, word, offset, nth));
    },
    /** Take ms when line `id` has finished (its last word), plus `offset` seconds. */
    end: (id: string, offset = 0) => {
      const t0 = starts.get(id);
      if (t0 === undefined) throw new Error(`vo.start("${id}") first`);
      const ws = wordsOf(id);
      return t0 + ((ws[ws.length - 1]?.end ?? 0) + offset) * 1000;
    },
  };
};
