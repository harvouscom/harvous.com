/**
 * Per-chapter staging for the app scenes on /tour/ and each /features/<category>/
 * page — the same visual either place, so the "long version" a category page
 * links out from Tour shows the identical shot, backdrop and margin note.
 */
import { SHOTS, type Backdrop, type MarginNoteSpec, type Shot } from "./content.ts";

export type TourStaging = { shot: Shot; backdrop: Backdrop; zoom: number; focus: number; note: MarginNoteSpec };

export const TOUR_STAGING: Record<string, TourStaging> = {
  activity: {
    shot: SHOTS.activity,
    backdrop: "044",
    zoom: 1.3,
    focus: 0.45,
    note: { text: "Each day gets its own sheet.", at: { top: "4%", right: "4%" }, arrow: "down-left", tilt: 3, target: [1290, 376] },
  },
  read: {
    shot: SHOTS.read,
    backdrop: "076",
    zoom: 1.4,
    focus: 0.4,
    note: { text: "My notes, already in the margin.", at: { bottom: "10%", left: "8%" }, arrow: "up-left", side: "start", tilt: -3, target: [322, 560] },
  },
  write: {
    /* Anchored from the note's top (breadcrumb, title, the highlight) rather
       than its toolbar, so the highlight this note points at stays in view. */
    shot: { ...SHOTS.write, crop: { ...SHOTS.write.crop, y: 0, hang: "bottom" } },
    backdrop: "047",
    zoom: 1.6,
    focus: 0.45,
    note: { text: "Highlight it once, find it for good.", at: { top: "8%", right: "4%" }, arrow: "down-left", tilt: 3, target: [716, 424] },
  },
  find: {
    shot: SHOTS.library,
    backdrop: "058",
    zoom: 1.5,
    focus: 0.6,
    note: { text: "Pick a kind, or type what you remember.", at: { top: "4%", right: "4%" }, arrow: "down-left", tilt: 3, target: [1420, 214] },
  },
  share: {
    shot: SHOTS.share,
    backdrop: "045",
    zoom: 1.45,
    focus: 0.45,
    note: { text: "Its own cover, its own threads.", at: { top: "5%", right: "5%" }, arrow: "down-left", tilt: 4, target: [900, 250] },
  },
};
