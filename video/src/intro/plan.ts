import type { Box, TakeEvents } from "./take-types";
import type { Beat, Enter, MarkRef } from "./timeline";
import type { IntroData, VoLine } from "./data";
import type { HeardWord } from "./words";

/**
 * Turns the beats plus real durations into absolute timing: where every
 * beat, voice line and take starts, and how neighbouring beats overlap while
 * one hands over to the next. Chapter starts land on the music's beat grid.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
/** Pause between lines inside a beat: room to breathe, not dead air. */
export const LINE_GAP = 0.5;
/** Seconds held on a take's last frame, after its footage has played out. */
export const FOOTAGE_TAIL = 0.4;
/** Seconds the phone stays on screen after it lands, at least. */
const PHONE_HOLD = 3.6;
/** How long a chapter title holds the stage before its window rises in. */
export const TITLE_HOLD = 1.15;
/** How long the window takes to rise into place. */
export const RISE_SEC = 1.1;

/**
 * The music's tempo (scripts/music.ts composes to it). Every chapter starts on
 * a beat of it, so cuts land with the music rather than across it.
 */
export const TEMPO_BPM = 64;
export const BEAT_SEC = 60 / TEMPO_BPM;

/**
 * Voice clips are cut a breath after their last spoken word, with a short
 * fade. Earlier takes sometimes ran on into the next line's first words.
 */
export const VOICE_TAIL = 0.18;
export const VOICE_FADE = 0.08;

export const playSeconds = (line: Pick<VoLine, "durationSec" | "heard">) => {
  const last = line.heard[line.heard.length - 1];
  return last ? Math.min(line.durationSec, last.end + VOICE_TAIL) : line.durationSec;
};

type Arrival = { enter: Enter | "none"; overlap: number; windowAt: number; takeLead: number; voiceAt: number };

/** When each kind of arrival overlaps the beat before, lands its window, and starts its take and voice. */
const arrival = (beat: Beat, first: boolean): Arrival => {
  if (first || !beat.enter) return { enter: "none", overlap: 0, windowAt: 0, takeLead: 0, voiceAt: 0 };
  switch (beat.enter) {
    case "rise": {
      const overlap = 0.9;
      const windowAt = overlap + TITLE_HOLD - 0.35;
      return { enter: "rise", overlap, windowAt, takeLead: windowAt + RISE_SEC * 0.55, voiceAt: windowAt + RISE_SEC * 0.75 };
    }
    case "frosted": {
      const overlap = 1.6;
      const windowAt = overlap - 0.6;
      return { enter: "frosted", overlap, windowAt, takeLead: windowAt + 0.3, voiceAt: windowAt + 0.55 };
    }
    case "zoom":
      return { enter: "zoom", overlap: 1, windowAt: 0, takeLead: 1.3, voiceAt: 1.2 };
    case "pane":
      return { enter: "pane", overlap: 1, windowAt: 0, takeLead: 0.55, voiceAt: 0.6 };
    case "settle":
      return { enter: "settle", overlap: 1.1, windowAt: 0, takeLead: 0, voiceAt: 1.1 };
  }
};

export type PlacedBeat = {
  beat: Beat;
  index: number;
  startSec: number;
  durationSec: number;
  enter: Enter | "none";
  /** Seconds this beat overlaps the one before. */
  enterSec: number;
  /** How the next beat arrives (so this one knows how to leave), and the overlap. */
  exit: Enter | "none";
  exitSec: number;
  /** Each line's start, in seconds from the beat's start; durations are the trimmed play length. */
  lines: { id: string; startSec: number; durationSec: number; file: string | null; text: string; heard: HeardWord[] }[];
  /** When the phone lands, in beat seconds (Infinity: no phone). */
  phoneAt: number;
  /** When the window lands or clears (after the chapter title has its moment). */
  windowAt: number;
  /** Beat seconds where the take starts playing. */
  takeLead: number;
};

/** Milliseconds into the take where a mark was logged. */
export const markMs = (events: TakeEvents, mark: string) => {
  const hit = events.events.find((e) => e.kind === "mark" && e.name === mark);
  if (!hit) throw new Error(`Take "${events.scene}-${events.device}" has no mark "${mark}"`);
  return hit.t;
};

/** The box an anchor recorded (the last one logged under that name). */
export const anchorBox = (events: TakeEvents, name: string): Box | null => {
  const hits = events.events.filter((e) => e.kind === "anchor" && e.name === name);
  const last = hits[hits.length - 1];
  return last && last.kind === "anchor" ? last.box : null;
};

/** Milliseconds into the take of the nth click (or tap). */
export const clickMs = (events: TakeEvents, n: number) => {
  const clicks = events.events.filter((e) => e.kind === "down" || e.kind === "tap");
  return clicks[n]?.t ?? null;
};

/** Seconds into the take where the beat's playback starts. */
export const takeStartSec = (events: TakeEvents, from?: { mark: string; lead?: number }) =>
  from ? Math.max(0, markMs(events, from.mark) / 1000 - (from.lead ?? 0)) : 0;

/**
 * How a beat plays its take: from a start point, at a rate, with `pace`
 * points along the way that pause the footage (so the voice can catch up)
 * or change its speed. "Play" seconds count from when the take starts in the
 * beat (the beat's takeLead).
 */
export type TakeClock = {
  /** Seconds into the take where playback starts. */
  start: number;
  /** Play seconds → seconds into the take. */
  toTake: (play: number) => number;
  /** Seconds into the take → play seconds. */
  toPlay: (take: number) => number;
};

export const takeClock = (events: TakeEvents, beat: Pick<Beat, "from" | "rate" | "pace">): TakeClock => {
  const start = takeStartSec(events, beat.from);
  let firstRate = beat.rate ?? 1;
  const points: { at: number; hold: number; rate?: number }[] = [];
  for (const p of beat.pace ?? []) {
    const at = markMs(events, p.at.mark) / 1000 + (p.at.offset ?? 0);
    if (at > start) points.push({ at, hold: p.hold ?? 0, rate: p.rate });
    else if (p.rate) firstRate = p.rate;
  }
  points.sort((a, b) => a.at - b.at);
  // A moment exactly on a pause lands as the pause begins.
  const toPlay = (take: number) => {
    let play = 0;
    let at = start;
    let rate = firstRate;
    for (const p of points) {
      if (take <= p.at) break;
      play += (p.at - at) / rate + p.hold;
      at = p.at;
      rate = p.rate ?? rate;
    }
    return play + (take - at) / rate;
  };
  const toTake = (play: number) => {
    let used = 0;
    let at = start;
    let rate = firstRate;
    for (const p of points) {
      const reach = used + (p.at - at) / rate;
      if (play <= reach) return at + (play - used) * rate;
      if (play <= reach + p.hold) return p.at;
      used = reach + p.hold;
      at = p.at;
      rate = p.rate ?? rate;
    }
    return at + (play - used) * rate;
  };
  return { start, toTake, toPlay };
};

/** A mark (+offset in beat seconds), as play seconds (add the beat's takeLead for beat time). */
export const markToBeatSec = (events: TakeEvents, ref: MarkRef, clock: TakeClock) => clock.toPlay(markMs(events, ref.mark) / 1000) + (ref.offset ?? 0);

export const placeBeats = (beats: Beat[], data: IntroData) => {
  const placed: PlacedBeat[] = [];
  beats.forEach((beat, index) => {
    const a = arrival(beat, index === 0);
    const next = beats[index + 1];
    const nextArrival = next ? arrival(next, false) : null;

    const take = beat.take ? data.takes[beat.take] : undefined;
    const clock = take ? takeClock(take.events, beat) : null;
    let at = a.voiceAt + (beat.voDelay ?? 0.15);
    const lines = beat.vo.map((cue, i) => {
      const id = typeof cue === "string" ? cue : cue.id;
      const line = data.vo[id];
      if (!line) throw new Error(`Beat "${beat.id}" names narration line "${id}", which narration/intro.json doesn't have`);
      // A line tied to a moment in the take waits for it (never earlier than the gap allows).
      if (typeof cue !== "string" && take && clock) at = Math.max(at, a.takeLead + markToBeatSec(take.events, cue.at, clock));
      const start = at;
      const play = playSeconds(line);
      at += play + (i < beat.vo.length - 1 ? LINE_GAP : 0);
      return { id, startSec: start, durationSec: play, file: line.file, text: line.text, heard: line.heard };
    });

    let phoneAt = Infinity;
    if (beat.phoneAt) {
      const l = lines.find((x) => x.id === beat.phoneAt?.vo);
      phoneAt = l ? l.startSec + l.durationSec * beat.phoneAt.frac : a.windowAt;
    }

    // Long enough for the voice, the useful part of the footage, and the phone.
    const footageEnd = take
      ? beat.until
        ? Math.min(take.durationSec, markMs(take.events, beat.until.mark) / 1000 + (beat.until.offset ?? 0))
        : take.durationSec
      : 0;
    const footage = take && clock ? a.takeLead + clock.toPlay(footageEnd) + FOOTAGE_TAIL : 0;
    const exitSec = nextArrival?.overlap ?? 0;
    let durationSec = Math.max(
      at + (beat.padSec ?? 0.4) + exitSec,
      footage + exitSec,
      Number.isFinite(phoneAt) ? phoneAt + PHONE_HOLD + exitSec : 0,
    );

    // Land the next chapter's start on the beat grid by holding this one a touch longer.
    const startSec = index === 0 ? 0 : placed[index - 1].startSec + placed[index - 1].durationSec - a.overlap;
    if (next) {
      const nextStart = startSec + durationSec - exitSec;
      const snapped = Math.ceil(nextStart / BEAT_SEC - 1e-6) * BEAT_SEC;
      durationSec += snapped - nextStart;
    }

    placed.push({
      beat,
      index,
      startSec,
      durationSec,
      enter: a.enter,
      enterSec: a.overlap,
      exit: nextArrival?.enter ?? "none",
      exitSec,
      lines,
      phoneAt,
      windowAt: a.windowAt,
      takeLead: a.takeLead,
    });
  });
  const last = placed[placed.length - 1];
  return { placed, totalSec: last ? last.startSec + last.durationSec : 0 };
};
