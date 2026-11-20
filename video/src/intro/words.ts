/**
 * Word timing for a narration line, shared by the on-screen subtitles and
 * the captions file so the two always agree.
 *
 * The script carries spelling and punctuation ("2016", "25:2"); Scribe's
 * transcript carries the timing. Each script word takes the timing of the
 * heard word at the same point through the text, which survives "2016" being
 * heard as two words.
 */

export type HeardWord = { text: string; start: number; end: number };
export type TimedWord = { word: string; start: number; end: number };
export type WordCue = { words: TimedWord[]; start: number; end: number };

/** About two lines on a phone, one on a laptop. */
export const CUE_CHARS = 46;

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "").replace(/'/g, "");

export const timeWords = (text: string, heard: HeardWord[], durationSec: number): TimedWord[] => {
  const words = text.split(/\s+/).filter(Boolean);
  if (!heard.length) {
    // No transcript yet: spread the words evenly through the line.
    return words.map((word, i) => ({
      word,
      start: (i / words.length) * durationSec,
      end: ((i + 1) / words.length) * durationSec,
    }));
  }
  // Match each script word to the heard word it is, looking a few words
  // ahead so a dropped or extra word doesn't throw the rest off.
  const out: (TimedWord | null)[] = words.map(() => null);
  let h = 0;
  words.forEach((word, i) => {
    const want = norm(word);
    for (let k = h; k < Math.min(heard.length, h + 4); k++) {
      if (norm(heard[k].text) === want) {
        out[i] = { word, start: heard[k].start, end: heard[k].end };
        h = k + 1;
        return;
      }
    }
  });
  // Words with no match ("2016" heard as "twenty sixteen") share the time
  // between their matched neighbours.
  for (let i = 0; i < words.length; i++) {
    if (out[i]) continue;
    let a = i - 1;
    while (a >= 0 && !out[a]) a--;
    let b = i + 1;
    while (b < words.length && !out[b]) b++;
    const from = a >= 0 ? (out[a] as TimedWord).end : 0;
    const to = b < words.length ? (out[b] as TimedWord).start : durationSec;
    const gap = b - a - 1;
    const k = i - a - 1;
    out[i] = { word: words[i], start: from + ((to - from) * k) / gap, end: from + ((to - from) * (k + 1)) / gap };
  }
  return out as TimedWord[];
};

/** Split each sentence into the fewest even cues that fit CUE_CHARS. */
export const cueWords = (timed: TimedWord[]): WordCue[] => {
  const sentences: TimedWord[][] = [[]];
  for (const w of timed) {
    sentences[sentences.length - 1].push(w);
    if (/[.!?]["”]?$/.test(w.word)) sentences.push([]);
  }
  const cues: WordCue[] = [];
  for (const s of sentences.filter((x) => x.length)) {
    const total = s.map((w) => w.word).join(" ").length;
    const n = Math.max(1, Math.ceil(total / CUE_CHARS));
    const target = total / n;
    let chunk: TimedWord[] = [];
    let len = 0;
    let made = 0;
    const flush = () => {
      if (chunk.length) cues.push({ words: chunk, start: chunk[0].start, end: chunk[chunk.length - 1].end });
      chunk = [];
      len = 0;
      made++;
    };
    for (const w of s) {
      if (chunk.length && len + w.word.length / 2 > target && made < n - 1) flush();
      chunk.push(w);
      len += w.word.length + 1;
    }
    flush();
  }
  return cues;
};
