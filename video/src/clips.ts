import type { IconName } from "./icons";

/**
 * Feature-focused edit of the long Harvous tour.
 * Source times are seconds in `../public/touring-new-harvous-share.mp4`.
 * Ends land on complete sentences; END_PAD_SEC holds after the last word.
 */

export type TourClip = {
  id: string;
  /** Lower-third chapter label; omit for bridge / close VO */
  label?: string;
  icon?: IconName;
  startSec: number;
  endSec: number;
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Hold after the last word so endings feel natural. */
export const END_PAD_SEC = 0.5;

/**
 * Chronological through the source — one Auto-organize payoff at the end,
 * expanded Search, scripture once.
 */
export const TOUR_CLIPS: TourClip[] = [
  {
    id: "home",
    label: "My Home",
    icon: "house",
    startSec: 115.72,
    endSec: 147.7, // "...aka church."
  },
  {
    id: "daily",
    label: "Daily passage",
    icon: "calendar-days",
    startSec: 158.2,
    endSec: 174.6, // "...greater than these."
  },
  {
    id: "start-note",
    label: "Start a note",
    icon: "pen",
    startSec: 192.14, // hit plus → add passage to a note
    endSec: 204.42, // "...see it again."
  },
  {
    id: "dictionary",
    label: "Dictionary",
    icon: "book-open",
    startSec: 480.6,
    endSec: 520.9, // "Boom. There it is."
  },
  {
    id: "scripture",
    label: "Add Scripture",
    icon: "book-bible",
    startSec: 557.4, // snippets form when you type them
    endSec: 567.7,
  },
  {
    id: "highlight",
    label: "Highlight & annotate",
    icon: "highlighter",
    startSec: 567.9,
    endSec: 607.8, // "...It's in a note."
  },
  {
    id: "search-idea",
    label: "Search",
    icon: "magnifying-glass",
    startSec: 744.3, // search anywhere — highlights, folders, anything
    endSec: 754.9, // "...whatever I want."
  },
  {
    id: "search-demo",
    label: "Search",
    icon: "magnifying-glass",
    startSec: 797.36, // into search → joy → scripture + notes/threads
    endSec: 832.58, // "...very handy."
  },
  {
    id: "connect",
    label: "Connect notes",
    icon: "arrow-right-arrow-left",
    startSec: 901.8,
    endSec: 950.5, // "...which is threads."
  },
  {
    id: "share",
    label: "Share a note",
    icon: "share-nodes",
    startSec: 1067.18,
    endSec: 1084.58, // "...pretty neat."
  },
  {
    id: "auto-org",
    label: "Auto-organize",
    icon: "folder-tree",
    startSec: 1345.78, // already organized → love / parables / Mark
    endSec: 1369.22, // "...for you."
  },
  {
    id: "close-vo",
    startSec: 1460.6,
    endSec: 1470.1, // "...remember your Bible study."
  },
];

/** Inclusive source end with pad, clamped so we don't spill into the next clip. */
export function sourceEndSec(clip: TourClip, index: number): number {
  const padded = clip.endSec + END_PAD_SEC;
  const next = TOUR_CLIPS[index + 1];
  if (!next) return padded;
  return Math.min(padded, next.startSec - 0.02);
}

export function clipDurationFrames(clip: TourClip, index: number, fps = FPS): number {
  const end = sourceEndSec(clip, index);
  return Math.max(1, Math.round((end - clip.startSec) * fps));
}

export function buildTimeline(fps = FPS) {
  let cursor = 0;
  const placed = TOUR_CLIPS.map((clip, index) => {
    const durationInFrames = clipDurationFrames(clip, index, fps);
    const from = cursor;
    cursor = from + durationInFrames;
    return { clip, index, from, durationInFrames };
  });
  return { placed, totalFrames: cursor };
}
