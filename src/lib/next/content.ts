/**
 * Copy for the /next/ redesign — the indie-maker version of the site.
 *
 * First person, Derek's voice (docs/BRAND_VOICE.md, including its "Words We
 * Avoid"). Stage-honest the same way the live site is: nothing here describes
 * an unshipped feature as live, and every toggle on the privacy wall is backed
 * by the FAQ or the privacy policy — change one only when that source changes.
 */

/** One of the auth-hero motion-blur photos under /images/auth-hero/. */
export type Backdrop =
  | "044" | "045" | "046" | "047" | "050" | "051" | "052" | "053" | "058"
  | "059" | "060" | "061" | "072" | "073" | "074" | "075" | "076" | "077";

export const backdropSrc = (id: Backdrop) => `/images/auth-hero/ai_bg_${id}.webp`;

/** The app views AppScene can draw live. */
export type AppView = "activity" | "read" | "write" | "library" | "share";

export type MarginNoteSpec = {
  text: string;
  /**
   * Where the note sits over its scene, as CSS inset values. With `target`
   * set this is only the starting point (and the no-JS fallback): the note is
   * then moved so its arrow tip lands on the target.
   */
  at: { top?: string; right?: string; bottom?: string; left?: string };
  /**
   * What the arrow points at. Either a point in the scene screenshot's own
   * pixels (the 1920-wide WebP), or an element in the scene — a floating
   * vignette, say — with a spot on it as fractions of its box. MarginNote's
   * script turns either into a page position on every layout, so the arrow
   * stays on the pill or chip at any width and zoom.
   */
  target?: [number, number] | { selector: string; at: [number, number] };
  /** Which way the drawn arrow points from the text. */
  arrow?: "down-left" | "down-right" | "up-left" | "up-right" | "left" | "right";
  /**
   * Which end of the paper the arrow hangs from. By default an arrow pointing
   * left hangs from the paper's right end (the paper sits over the target's
   * side of the scene); "start" puts it on the left end instead, so the paper
   * sits clear to the right — for a target near the scene's left edge.
   */
  side?: "start" | "end";
  tilt?: number;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Home — the numbered story                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export type StoryStep = {
  key: string;
  title: string;
  body: string;
  backdrop: Backdrop;
  /** Which live vignette floats over the view, if any. */
  vignette?: "scripture" | "suggestion" | "thread";
  note: MarginNoteSpec;
};

export const STORY_STEPS: StoryStep[] = [
  {
    key: "write",
    title: "Write a note. The verse comes with it.",
    body: "Type John 3:16 and it turns into a pill you can tap, in any of 11 translations. Headings, bullets, highlights. It writes like any doc you already know.",
    backdrop: "072",
    vignette: "scripture",
    note: { text: "I just type the reference. That's it.", at: { top: "5%", right: "5%" }, arrow: "down-left", tilt: 3, target: { selector: "[data-anote-pill]", at: [0.8, -0.15] } },
  },
  {
    key: "read",
    title: "Read the chapter with your notes beside it.",
    body: "Open a passage and every note you've written on it is marked in the margin. Tap the line and Harvous shows you which notes, so last year's thinking is right there beside the verse.",
    backdrop: "052",
    note: { text: "Every note I've written on it, right in the margin.", at: { bottom: "8%", right: "5%" }, arrow: "up-left", side: "start", tilt: -3, target: { selector: "[data-ard-block='0']", at: [-0.04, 0.97] } },
  },
  {
    key: "remember",
    title: "Brought back before it fades.",
    body: "Suggestions quietly brings back a note or highlight you haven't seen in a while. With Plus, a few review exercises a day have you finish a verse you marked or remember where a note lives. No score, no streak.",
    backdrop: "044",
    vignette: "suggestion",
    note: { text: "This is the part I built it for.", at: { top: "6%", right: "5%" }, arrow: "down-left", tilt: 3, target: { selector: "[data-aact-review]", at: [0.82, -0.03] } },
  },
];

/* ────────────────────────────────────────────────────────────────────────── */
/* Home — bento                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export type BentoCardSpec = {
  label: string;
  title: string;
  body: string;
  href: string;
  tone: "sky" | "mint" | "lilac" | "peach" | "cream" | "pink" | "gray";
  visual: "thread" | "templates" | "discover" | "space" | "review" | "compare" | "connector";
  plus?: boolean;
};

/* Seven: whole at three columns (the three Plus cards share the last row) and
   at two (Connector runs wide alone) — see Bento.astro. */
export const BENTO_CARDS: BentoCardSpec[] = [
  {
    label: "Threads",
    title: "One line of thinking, even across months.",
    body: "Connect the notes that belong together and follow them later.",
    href: "/features/threads/",
    tone: "mint",
    visual: "thread",
  },
  {
    label: "Templates",
    title: "Start with a shape.",
    body: "SOAP, inductive, a sermon outline, or your own. Then make it yours.",
    href: "/features/note-templates/",
    tone: "cream",
    visual: "templates",
  },
  {
    label: "Discover",
    title: "A good place to start.",
    body: "Templates and resources from people I trust. Take a copy and it's yours.",
    href: "/discover/",
    tone: "sky",
    visual: "discover",
  },
  {
    label: "Compare translations",
    title: "Two versions, lined up honestly.",
    body: "Side by side, verse by verse. Highlight in either.",
    href: "/features/compare-translations/",
    tone: "pink",
    visual: "compare",
  },
  {
    label: "Review exercises",
    title: "Answer from memory.",
    body: "Questions from your own notes and verses. No score, no streak.",
    href: "/add-ons/review-exercises/",
    tone: "lilac",
    visual: "review",
    plus: true,
  },
  {
    label: "Shared spaces",
    title: "A room for your group.",
    body: "Its own cover, its own threads. Joining is always free.",
    href: "/add-ons/shared-spaces/",
    tone: "peach",
    visual: "space",
    plus: true,
  },
  {
    label: "Connector",
    title: "Ask your AI about your study.",
    body: "Claude or ChatGPT can read your notes. They can never change them.",
    href: "/add-ons/connector/",
    tone: "gray",
    visual: "connector",
    plus: true,
  },
];

/** The smaller things every account gets — a line of chips under the grid. From FeatureGrid.astro. */
export const ALSO_INCLUDED: { label: string; icon: string; href?: string }[] = [
  { label: "Daily passage", icon: "fa7-solid:sun", href: "/features/daily-passage/" },
  { label: "Easton's dictionary", icon: "fa7-solid:book-atlas", href: "/features/dictionary/" },
  { label: "Offline & sync", icon: "fa7-solid:cloud-arrow-down", href: "/features/offline-sync/" },
  { label: "Reminders", icon: "fa7-solid:bell", href: "/features/reminders/" },
  { label: "Light & dark", icon: "fa7-solid:circle-half-stroke" },
  { label: "Keyboard shortcuts", icon: "fa7-solid:keyboard" },
];

/* ────────────────────────────────────────────────────────────────────────── */
/* Home — "Yours, quietly" toggle wall                                        */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Every row here is a claim. Sources: faq/privacy.mdx (private unless shared),
 * faq/ai.mdx (no AI in note-taking; Connector lets an AI app you choose read,
 * never change, your notes), addons-data.ts (no score, streak, or
 * leaderboard in Review), privacy.astro (does not sell personal information),
 * faq/offline.mdx, faq/export.mdx, faq/try-without-account.mdx,
 * faq/locked-notes.mdx (lock a note with a PIN, encrypted on your device).
 */
export type ToggleSpec = { label: string; value: string; on: boolean };

export const PRIVACY_TOGGLES: ToggleSpec[] = [
  { label: "Notes private by default", value: "On", on: true },
  { label: "Lock notes with a PIN", value: "On", on: true },
  { label: "AI in note-taking", value: "Off", on: false },
  { label: "AI apps reading your notes", value: "Your call", on: false },
  { label: "Streaks and scores", value: "Off", on: false },
  { label: "Selling your information", value: "Never", on: false },
  { label: "Works offline", value: "On", on: true },
  { label: "Share by link", value: "Your call", on: false },
  { label: "Leaderboards", value: "Off", on: false },
  { label: "Export anytime", value: "On", on: true },
  { label: "Account needed to try", value: "No", on: false },
];

/* ────────────────────────────────────────────────────────────────────────── */
/* /now/                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * The hand-kept half of /now. Derek owns this list — keep it short, keep it
 * true, and bump NOW_UPDATED whenever it changes. "Just shipped" and "Next up"
 * below it come from release notes and the roadmap, so only this needs tending.
 */
export const NOW_UPDATED = "2026-10-03";

export const NOW_WORKING_ON: { title: string; body: string }[] = [
  {
    title: "Harvous for churches, taking shape",
    body: "Join links, ministries, scheduled posts, and a leader kit a pastor can hand to a group. Church plans are invite-only for now.",
  },
  {
    title: "Review exercises that teach",
    body: "Word tiles, drag-to-order, and learning steps, so remembering a passage feels less like a quiz and more like practice.",
  },
  {
    title: "A better Connector",
    body: "Improving the MCP server behind Connector, so Claude and ChatGPT can search what your group shares, not just what you wrote.",
  },
];
