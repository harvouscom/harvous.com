import type { AnnotationKind } from "../annotations/Annotations";
import type { BlockIconName } from "../stage/blockIcons";
import { FEATURE_CATEGORY, type FeatureCategory, type InkTier } from "../stage/IconBlock";
import type { MeshFamily, MeshMotion } from "../stage/Mesh";

/**
 * The intro, beat by beat: how Harvous becomes your study Bible.
 *
 * Each beat is a stretch of voiceover over one take. Times inside a beat come
 * from the capture's named marks (see capture/scenes), never from hard-coded
 * seconds, so a re-shot take with slightly different timing still lines up. A
 * beat lasts at least until its `until` mark, so nothing is cut before you
 * can see it land.
 */

export type Layout =
  /** Mesh only, with Derek's words: the opening, before the app appears. */
  | "title"
  /** The close: a bento of what Harvous does, no app on screen. */
  | "bento"
  | "desktop"
  /** Desktop window on the left, phone landing on the right. */
  | "both";

/**
 * How a beat arrives:
 * - `rise`: the old window slides away, the chapter's title takes the stage,
 *   and the new window floats up with a slight tilt that settles flat.
 * - `frosted`: the same screen carries on. The window stays, blurs softly
 *   behind the chapter title, then clears into the new take.
 * - `zoom`: the old chapter pushes into a detail; the new one opens pushed in
 *   on its own version of it and pulls back.
 * - `pane`: windows slide across (no title).
 * - `settle`: the app eases back and away, and the next beat comes up over the mesh.
 */
export type Enter = "rise" | "frosted" | "zoom" | "pane" | "settle";

export type MarkRef = { mark: string; offset?: number };

/**
 * A push-in. Two kinds, by what's being shown:
 * - `stage` (default): the whole stage pushes in, so the window's chrome
 *   slides out of frame. For a moment that wants the full screen.
 * - `crop`: the window stays where it is and the footage zooms inside it,
 *   panning to the spot. For a bigger piece of the screen (a list, a card, a
 *   panel) that should read at a glance. Small things get a loupe instead.
 */
export type Zoom = {
  /** When the push-in starts. */
  at: MarkRef;
  /** An anchor name from the take, or "cursor" to follow the pointer. */
  target: string;
  /** An exact spot in the take's pixels, when the anchor's centre isn't the thing to show. */
  point?: [number, number];
  mode?: "stage" | "crop";
  scale?: number;
  /** Seconds to hold before easing back out. Default: until the next zoom or the end. */
  hold?: number;
  /** Or ease back out at a mark. */
  until?: MarkRef;
  /** Seconds the move takes (a slow drift across a list wants longer). */
  move?: number;
};

/**
 * The footage's pace: at a mark (+ offset in take seconds) it can pause for
 * `hold` seconds, so the voice can catch up, and/or carry on at a new `rate`,
 * so a stretch that only gets you somewhere goes by quicker.
 */
export type Pace = { at: MarkRef; hold?: number; rate?: number };

/** A line of narration, optionally waiting for a moment in the take before it starts. */
export type VoCue = string | { id: string; at: MarkRef };

export type Note = {
  kind: AnnotationKind;
  anchor: string;
  at: MarkRef;
  dur?: number;
  /** Arrows: the side they come from. */
  side?: "above" | "below" | "left" | "right";
  /** Loupes: where in the anchor to look (0–1 across, 0–1 down; may sit just outside). */
  focus?: [number, number];
  /** Loupes: an exact spot in the take's pixels, when the anchor's box isn't the thing to show. */
  point?: [number, number];
  /** Loupes: magnification and radius (take pixels). */
  zoom?: number;
  radius?: number;
};

/** The app's own interface sounds (scripts/app-sounds.ts), by the moment names it uses. */
export type AppSound =
  | "nav.open"
  | "nav.close"
  | "nav.forward"
  | "nav.drillIn"
  | "nav.select"
  | "nav.toggle"
  | "dock.open"
  | "dock.close"
  | "panel.open"
  | "panel.close"
  | "highlight.created"
  | "organize.filed";

export type Marker = { title: string; icon: BlockIconName; category: FeatureCategory; tier: InkTier };

/**
 * The close's cards, after the homepage Bento (src/components/next/Bento.astro):
 * each card has a tone, a framed stage washed in that tone's mesh, and words.
 * The tones are the site's (global.css --color-*), the mesh is the one the
 * site picks for each tone, and `accent` colours the card's icon block.
 */
export const BENTO_TONES = {
  sky: { tone: "#c2dcf8", ink: "#143a6e", accent: "#2a9ed6", mesh: "sky" },
  cream: { tone: "#f6ecd6", ink: "#5a4116", accent: "#d4ac00", mesh: "amber" },
  lilac: { tone: "#dec5ed", ink: "#4a1a70", accent: "#9250c0", mesh: "violet" },
  mint: { tone: "#c9e3b8", ink: "#2a5a25", accent: "#26c01c", mesh: "mint" },
  peach: { tone: "#fbc8ad", ink: "#7a2810", accent: "#ef7a45", mesh: "coral" },
  pink: { tone: "#f3c8e0", ink: "#6b1f4b", accent: "#e84f83", mesh: "violet" },
} as const satisfies Record<string, { tone: string; ink: string; accent: string; mesh: MeshFamily }>;

export type BentoTone = keyof typeof BENTO_TONES;

/** One feature on a card: its name (the small label), a line about it, its icon. */
export type BentoFeature = { label: string; title: string; icon: BlockIconName; plus?: boolean };

export type Bento = {
  /** The cards, in reading order; wide ones span two columns of four. */
  slots: { tone: BentoTone; wide?: boolean }[];
  /** The first one per slot shows first; the rest arrive one card at a time. */
  features: BentoFeature[];
  /** Which card takes each arriving feature, cycled. */
  order: number[];
};

export type Beat = {
  id: string;
  layout: Layout;
  enter?: Enter;
  /** The ground. Beats with a marker take their category's mesh instead. */
  mesh?: MeshFamily;
  /** How the ground moves under this beat. */
  motion?: MeshMotion;
  /** Narration line ids from narration/intro.json, spoken in order. A line with `at` waits for that moment in the take. */
  vo: VoCue[];
  /** Seconds before the first line, after the window has landed. */
  voDelay?: number;
  /** Seconds held after the last line. */
  padSec?: number;
  take?: string;
  /** Where the take starts playing: a mark, minus `lead` seconds. */
  from?: { mark: string; lead?: number };
  /** Take playback speed; >1 tightens long stretches like typing. */
  rate?: number;
  /** Pauses and speed changes along the take. */
  pace?: Pace[];
  /** Where the useful part of the take ends. */
  until?: MarkRef;
  phoneTake?: string;
  phoneFrom?: { mark: string; lead?: number };
  /** When the phone lands: a fraction through one of this beat's lines. */
  phoneAt?: { vo: string; frac: number };
  zooms?: Zoom[];
  notes?: Note[];
  /** The app's sounds, on the take's clicks (by order: 0 is the first click in the take). */
  sounds?: { click: number; cue: AppSound }[];
  /** The chapter's icon block and title, in the site's colours for that feature. */
  marker?: Marker;
  /** The anchor a `zoom` arrival opens pushed in on (and the one before pushes into). */
  zoomOn?: string;
  /**
   * Several features on one screen: the window eases right, and a short list
   * on the left lights each one up as it happens.
   */
  features?: { from: MarkRef; until: MarkRef; items: { label: string; icon: BlockIconName; tier: InkTier; at: MarkRef }[] };
  /** The close: the bento of features. */
  bento?: Bento;
};

/** The mesh behind a beat: its feature category's, so block and ground match. */
export const meshOf = (beat: Beat): MeshFamily =>
  beat.marker ? FEATURE_CATEGORY[beat.marker.category].mesh : (beat.mesh ?? "sky");

export const BEATS: Beat[] = [
  {
    id: "open",
    layout: "title",
    mesh: "sky",
    motion: "drift",
    vo: ["open-saved", "open-scattered"],
    voDelay: 0.8,
    padSec: 0.5,
  },
  {
    id: "home",
    layout: "both",
    enter: "rise",
    motion: "tide",
    take: "home-desktop",
    from: { mark: "greeting", lead: 0.9 },
    phoneTake: "home-phone",
    phoneFrom: { mark: "greeting", lead: 0.6 },
    phoneAt: { vo: "home", frac: 0.8 },
    vo: ["why-made", "home"],
    padSec: 0.6,
    // Today's passage is a whole card: crop in on it (greeting above, Pick up below).
    zooms: [{ at: { mark: "passage", offset: 0.3 }, target: "passage", mode: "crop", point: [720, 385], scale: 1.75, hold: 4 }],
    marker: { title: "Today", icon: "calendar-day", category: "activity", tier: 42 },
  },
  {
    id: "scripture",
    layout: "desktop",
    enter: "rise",
    motion: "drift",
    take: "scripture-desktop",
    from: { mark: "new-note", lead: 1.6 },
    rate: 2,
    until: { mark: "pill", offset: 1.6 },
    vo: ["scripture"],
    zooms: [{ at: { mark: "typing", offset: 0.2 }, target: "pill", scale: 1.75 }],
    notes: [{ kind: "loupe", anchor: "pill", at: { mark: "pill", offset: 0.15 }, dur: 2.4, zoom: 2.4, radius: 175 }],
    sounds: [{ click: 0, cue: "nav.select" }],
    zoomOn: "pill",
    marker: { title: "Scripture in notes", icon: "book-bible", category: "read", tier: 32 },
  },
  {
    id: "dock",
    layout: "desktop",
    enter: "zoom",
    zoomOn: "pill",
    motion: "swirl",
    take: "dock-desktop",
    from: { mark: "pill", lead: 0.9 },
    rate: 1.2,
    until: { mark: "open-reader", offset: 1.2 },
    vo: ["dock"],
    // Spots read off the take's frames. The first crop takes in the dock's
    // lower half: "Related passages", then "Your notes" arriving beneath it.
    // The second moves onto the dictionary card (Moses).
    zooms: [
      { at: { mark: "xrefs", offset: 0.2 }, target: "xrefs", mode: "crop", point: [720, 690], scale: 1.85 },
      { at: { mark: "dictionary", offset: 0.25 }, target: "dictionary", mode: "crop", point: [842, 668], scale: 1.7, hold: 3.4 },
    ],
    sounds: [
      { click: 0, cue: "nav.select" },
      { click: 1, cue: "nav.toggle" },
      { click: 2, cue: "nav.toggle" },
      { click: 3, cue: "nav.select" },
      { click: 4, cue: "nav.select" },
      { click: 5, cue: "nav.select" },
    ],
    features: {
      from: { mark: "held", offset: 0.2 },
      until: { mark: "open-reader", offset: -0.6 },
      items: [
        { label: "Cross-references", icon: "link", tier: 42, at: { mark: "xrefs" } },
        { label: "Your notes on it", icon: "note-sticky", tier: 32, at: { mark: "your-notes" } },
        { label: "Dictionary", icon: "lines-leaning", tier: 24, at: { mark: "dictionary" } },
      ],
    },
    marker: { title: "The scripture dock", icon: "book-bible", category: "read", tier: 24 },
  },
  {
    id: "reader",
    layout: "desktop",
    enter: "frosted",
    motion: "swirl",
    take: "reader-desktop",
    from: { mark: "chapter", lead: 0.4 },
    rate: 1.2,
    until: { mark: "highlighted", offset: 1.6 },
    vo: ["reader"],
    // The margin notes are the faint rules beside verses 1–8 (x≈400–420 in the
    // take): crop in on them with the verses they sit beside, and put a glass
    // right on the rules.
    zooms: [
      { at: { mark: "margin", offset: -0.3 }, target: "margin", mode: "crop", point: [600, 440], scale: 1.65, hold: 3 },
      { at: { mark: "verse-actions", offset: -0.4 }, target: "verse-actions", scale: 1.6 },
    ],
    notes: [{ kind: "loupe", anchor: "margin", at: { mark: "margin", offset: 0.7 }, dur: 2.2, point: [416, 330], zoom: 2.6, radius: 150 }],
    sounds: [
      { click: 0, cue: "nav.select" },
      { click: 1, cue: "highlight.created" },
      { click: 2, cue: "nav.select" },
    ],
    marker: { title: "Your study Bible", icon: "book-open", category: "read", tier: 55 },
  },
  {
    id: "organize",
    layout: "desktop",
    enter: "rise",
    motion: "drift",
    take: "organize-desktop",
    from: { mark: "tags", lead: 1.4 },
    rate: 1.3,
    until: { mark: "folder-open", offset: 1.4 },
    vo: ["organize"],
    zooms: [
      { at: { mark: "tags", offset: -0.2 }, target: "tags", mode: "crop", point: [1290, 592], scale: 2, hold: 2.8 },
      { at: { mark: "folders", offset: 0.1 }, target: "folders", mode: "crop", point: [720, 330], scale: 1.5 },
    ],
    sounds: [
      { click: 0, cue: "nav.select" },
      { click: 1, cue: "nav.select" },
      { click: 2, cue: "nav.select" },
      { click: 3, cue: "nav.select" },
      { click: 4, cue: "nav.drillIn" },
    ],
    marker: { title: "Sorted for you", icon: "folder-tree", category: "activity", tier: 50 },
  },
  {
    id: "threads",
    layout: "desktop",
    enter: "frosted",
    motion: "tide",
    take: "threads-desktop",
    // The Threads list → the Holy Spirit thread → Share → into a note → its Thread links.
    from: { mark: "threads", lead: 0.8 },
    pace: [
      // The thread's notes wait while the voice gets to "share" (the cursor is at rest here).
      { at: { mark: "thread-open", offset: 0.6 }, hold: 4.2 },
      // Into a note and its details: only getting somewhere, so quicker.
      { at: { mark: "share", offset: 1.2 }, rate: 2 },
      // Hold on the links while the last line plays (before the cursor walks on).
      { at: { mark: "links", offset: 1.4 }, hold: 12 },
    ],
    until: { mark: "links", offset: 1.3 },
    vo: ["threads", { id: "threads-walk", at: { mark: "links", offset: -0.2 } }],
    zooms: [
      { at: { mark: "threads", offset: -0.3 }, target: "thread", mode: "crop", point: [720, 165], scale: 1.8 },
      { at: { mark: "thread-open", offset: -0.1 }, target: "thread-notes", mode: "crop", point: [720, 330], scale: 1.5 },
      // A slow drift down the thread's notes ("across weeks of study") to the Share button.
      { at: { mark: "thread-open", offset: 1.4 }, target: "thread-notes", mode: "crop", point: [720, 560], scale: 1.5, move: 3.2, until: { mark: "share", offset: 1.1 } },
      { at: { mark: "links", offset: -0.3 }, target: "thread-links", mode: "crop", point: [1288, 590], scale: 2.1 },
    ],
    sounds: [
      { click: 3, cue: "nav.drillIn" },
      { click: 4, cue: "nav.select" },
      { click: 5, cue: "nav.toggle" },
    ],
    marker: { title: "Threads", icon: "arrow-right-arrow-left", category: "activity", tier: 32 },
  },
  {
    id: "review",
    layout: "desktop",
    enter: "rise",
    motion: "drift",
    take: "review-desktop",
    from: { mark: "review-tab", lead: 1 },
    rate: 1.1,
    until: { mark: "choices", offset: 0.4 },
    vo: ["review"],
    padSec: 0.6,
    // The Review card, question to choices, read off the take's frames.
    zooms: [{ at: { mark: "dock", offset: 0.2 }, target: "question", mode: "crop", point: [720, 588], scale: 1.5 }],
    sounds: [
      { click: 0, cue: "nav.select" },
      { click: 1, cue: "nav.select" },
    ],
    marker: { title: "Review", icon: "clock-rotate-left", category: "review", tier: 50 },
  },
  {
    id: "close",
    layout: "bento",
    enter: "settle",
    // Neutral, so the six coloured cards carry the colour.
    mesh: "stone",
    motion: "tide",
    // The close plays over what Harvous does, not over the app: a bento like
    // the homepage's, opening on the chapters you just saw, then trading them,
    // one card at a time, for everything else. No end card; the site around
    // the player says the rest. Words are the site's where it has them.
    vo: ["close-name", "close-weekly"],
    padSec: 2.6,
    bento: {
      slots: [
        { tone: "mint", wide: true },
        { tone: "cream" },
        { tone: "sky" },
        { tone: "lilac" },
        { tone: "peach" },
        { tone: "pink", wide: true },
      ],
      features: [
        // What the video walked through.
        { label: "Threads", title: "One line of thinking, even across months.", icon: "arrow-right-arrow-left" },
        { label: "Today", title: "A passage waiting every day.", icon: "calendar-day" },
        { label: "Scripture in notes", title: "Type a reference, get the verse.", icon: "book-bible" },
        { label: "Review exercises", title: "Answer from memory.", icon: "clock-rotate-left", plus: true },
        { label: "Sorted for you", title: "Tags and folders, made for you.", icon: "folder-tree" },
        { label: "Your study Bible", title: "Your notes in the margin, beside the verses.", icon: "book-open" },
        // And the rest.
        { label: "Cross-references", title: "Related passages, a tap away.", icon: "link" },
        { label: "Templates", title: "Start with a shape.", icon: "list-check" },
        { label: "Compare translations", title: "Two versions, lined up honestly.", icon: "table-columns" },
        { label: "Shared spaces", title: "A room for your group.", icon: "user-group", plus: true },
        { label: "Highlights", title: "Highlight a phrase, leave a note.", icon: "highlighter" },
        { label: "Easton's dictionary", title: "Names and terms, in place.", icon: "lines-leaning" },
        { label: "Suggestions", title: "What's worth revisiting, brought back.", icon: "lightbulb" },
        { label: "My Bible", title: "Where you've been in Scripture.", icon: "book-atlas" },
        { label: "Connector", title: "Ask your AI about your study.", icon: "puzzle-piece", plus: true },
        { label: "Catholic Bible", title: "All 73 books and the daily Gospel.", icon: "cross" },
        { label: "Search", title: "Find anything you've written.", icon: "magnifying-glass" },
        { label: "Reminders", title: "An optional nudge, with the verse.", icon: "bell" },
        { label: "Discover", title: "A good place to start.", icon: "newspaper" },
        { label: "Offline & sync", title: "Keeps working without a signal.", icon: "arrows-rotate" },
        { label: "Scan a page", title: "A printed page becomes a note.", icon: "camera" },
      ],
      order: [2, 4, 0, 5, 1, 3],
    },
  },
];
