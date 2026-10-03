/**
 * Per-chapter staging for the app scenes on /tour/ and each /features/<category>/
 * page — the same visual either place, so the "long version" a category page
 * links out from Tour shows the identical view, backdrop and margin note.
 *
 * Each view is drawn live by AppScene (the app's own pieces, not a screenshot),
 * so every note targets an element in it rather than a pixel in an image.
 */
import type { AppView, Backdrop, MarginNoteSpec } from "./content.ts";

export type TourStaging = { view: AppView; backdrop: Backdrop; note: MarginNoteSpec };

export const TOUR_STAGING: Record<string, TourStaging> = {
  activity: {
    view: "activity",
    backdrop: "044",
    note: { text: "Each day gets its own sheet.", at: { top: "4%", right: "4%" }, arrow: "down-left", tilt: 3, target: { selector: ".aact__edge--2", at: [0.72, 0.5] } },
  },
  read: {
    view: "read",
    backdrop: "076",
    note: { text: "My notes, already in the margin.", at: { bottom: "10%", left: "8%" }, arrow: "up-left", side: "start", tilt: -3, target: { selector: "[data-ard-block='0']", at: [-0.04, 0.97] } },
  },
  write: {
    view: "write",
    backdrop: "047",
    note: { text: "Highlight it once, find it for good.", at: { top: "48%", right: "6%" }, arrow: "up-left", side: "start", tilt: -3, target: { selector: ".anote .aui-ul", at: [0.55, 1.15] } },
  },
  find: {
    view: "library",
    backdrop: "058",
    note: { text: "Pick a kind, or type what you remember.", at: { top: "4%", right: "4%" }, arrow: "down-left", tilt: 3, target: { selector: "[data-alib-kinds]", at: [0.62, -0.05] } },
  },
  share: {
    view: "share",
    backdrop: "045",
    note: { text: "Its own cover, its own threads.", at: { top: "5%", right: "5%" }, arrow: "down-left", tilt: 4, target: { selector: "[data-aspc-cover]", at: [0.62, 0.85] } },
  },
};
