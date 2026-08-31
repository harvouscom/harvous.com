/**
 * The homepage tour — five chapters, each a screenshot with the features it
 * demonstrates beneath it.
 *
 * Ordered as a day of study rather than a feature taxonomy: open to what
 * happened, read, write, find, share. That ordering is the point — Harvous 3.0
 * is about study you can follow and return to, so the page should read the way
 * the product does rather than as a list of capabilities.
 *
 * SCREENSHOTS ARE NOT TAKEN YET. Every chapter names the file it wants and
 * carries `direction` — what the shot has to contain. Until a file exists at
 * `shot.src`, TourShotFrame renders a captioned placeholder at the right aspect
 * ratio, so the layout is final and dropping the real PNG in is the only
 * remaining step. See TourShotFrame.astro for how the swap is detected.
 */

/**
 * An item is a caption for what the screenshot shows, not a destination. The card
 * links to its category page, which is where these features actually live.
 */
export type TourItem = {
  icons: string[];
  title: string;
  desc: string;
};

export type TourChapter = {
  key: string;
  /** The category page this card opens — see feature-categories-data.ts. */
  categorySlug: string;
  /** Bento weight. "wide" spans both columns; "half" takes one. */
  size: "wide" | "half";
  eyebrow: string;
  title: string;
  lead: string;
  shot: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** Placeholder caption: what this shot must show. */
    direction: string[];
  };
  items: TourItem[];
};

/**
 * 2:1 at 2400×1200. The site's content column is 72rem (1152px), so this is
 * roughly 2x — enough that app text stays readable rather than turning into
 * texture, which is the whole failure mode for a tour built out of screenshots.
 */
const WIDE_W = 2400;
const WIDE_H = 1100;
const HALF_W = 1600;
const HALF_H = 1150;

export const APP_TOUR_CHAPTERS: TourChapter[] = [
  {
    key: "activity",
    categorySlug: "activity",
    size: "wide",
    eyebrow: "Activity",
    title: "Last week's study is still here. So is the month before it.",
    lead:
      "Harvous starts on your study, not an empty page. Each day is its own sheet, and the days behind it are still there to flip back through.",
    shot: {
      src: "/tour/tour-activity.png",
      alt: "The Activity view: a day sheet with the days before it stacked behind, listing the passages read and notes written that day.",
      width: WIDE_W,
      height: WIDE_H,
      direction: [
        "A finished day, not today — today is usually still empty.",
        "Two previous-day edges visible above the sheet.",
        "The day sentence at the top, with its count pill.",
        "Morning / afternoon / evening sections with real rows.",
        "At least one note card with readable words on it.",
      ],
    },
    items: [
      {
        icons: ["fa7-solid:clock-rotate-left"],
        title: "Recall",
        desc: "A fading note, a highlight, a passage — Recall resurfaces what's worth revisiting.",
      },
      {
        icons: ["fa7-solid:folder-tree", "fa7-solid:thumbtack"],
        title: "Sorts itself & Pin",
        desc: "Auto-folders and auto-tags organize every note. Pin a note, folder, or thread to keep it at the top.",
      },
    ],
  },
  {
    key: "read",
    categorySlug: "read",
    size: "half",
    eyebrow: "Read",
    title: "Read the chapter with your notes in the margin.",
    lead:
      "Chapters sit like paper on both sides of the one you're reading, so turning back is the same motion as turning forward. Your notes and highlights are already in the margin.",
    shot: {
      src: "/tour/tour-read.png",
      alt: "A Bible chapter open in Harvous, with the previous and next chapters visible as paper edges and margin marks alongside the text.",
      width: HALF_W,
      height: HALF_H,
      direction: [
        "A chapter with paper edges on BOTH sides.",
        "Margin dots or bars showing where notes exist.",
        "A passage with some real highlighting in it.",
        "Translation chip visible in the header.",
      ],
    },
    items: [
      {
        icons: ["fa7-solid:book-bible", "fa7-solid:book-open"],
        title: "Scripture pills & Bible reader",
        desc: "Type a reference and it becomes a pill, in 11 translations — or open the chapter and read, with your notes and highlights already there.",
      },
      {
        icons: ["fa7-solid:table-columns"],
        title: "Compare translations",
        desc: "Put two versions side by side, lined up verse by verse. Highlight in either one.",
      },
    ],
  },
  {
    key: "write",
    categorySlug: "write",
    size: "half",
    eyebrow: "Write",
    title: "Write a note. The verse comes with it.",
    lead:
      "Write the way you'd write anywhere else. References become pills you can open, and anything you highlight stays findable long after you've closed the note.",
    shot: {
      src: "/tour/tour-write.png",
      alt: "A note in Harvous containing a scripture pill, a highlighted phrase, and an annotation attached to it.",
      width: HALF_W,
      height: HALF_H,
      direction: [
        "One note holding all three at once:",
        "a scripture pill, a highlighted phrase, an annotation.",
        "Real sentences — not lorem, not one-word notes.",
        "Title visible at the top.",
      ],
    },
    items: [
      {
        icons: ["fa7-solid:highlighter"],
        title: "Highlight & annotations",
        desc: "Color-code phrases, leave annotations, and find them again in the highlights view.",
      },
      {
        icons: ["fa7-solid:at"],
        title: "@ mentions",
        desc: "Type @ in a note to link a note, folder, thread, or resource as a pill you can open later.",
      },
    ],
  },
  {
    key: "find",
    categorySlug: "find",
    size: "half",
    eyebrow: "Find",
    title: "Find the note you wrote months ago.",
    lead:
      "Browsing and searching stopped being two different places. Open the Library, pick a kind or type what you remember, and act on what comes back without leaving the note underneath.",
    shot: {
      src: "/tour/tour-library.png",
      alt: "The Harvous Library panel open over a note, showing tabs for each kind of saved thing and a list of results.",
      width: HALF_W,
      height: HALF_H,
      direction: [
        "The Library panel open OVER a note, note still visible behind.",
        "The kind tabs showing (may need a wider window than 1280).",
        "A query typed, so the actions row appears above results.",
        "Results that look like real study — no scratch or test rows.",
      ],
    },
    items: [
      {
        icons: ["fa7-solid:magnifying-glass"],
        title: "The Library",
        desc: "Notes, folders, threads, highlights, scripture, and resources — browse by kind or search across all of it in one panel.",
      },
      {
        icons: ["fa7-solid:arrow-right-arrow-left"],
        title: "Threads",
        desc: "Manually connect notes together to create a thread, even across folders.",
      },
    ],
  },
  {
    key: "share",
    categorySlug: "share",
    size: "half",
    eyebrow: "Share",
    title: "Study the same passage as your group.",
    lead:
      "Open a space for your group and it gets its own front door — its own cover, its own threads, its own tools. Your private study stays private.",
    shot: {
      src: "/tour/tour-share.png",
      alt: "A shared space in Harvous with its own cover image, showing the notes and threads the group is studying together.",
      width: HALF_W,
      height: HALF_H,
      direction: [
        "A shared space hub with its cover image showing.",
        "The space's own tools in its header.",
        "Some group content — threads or notes, with names on them.",
        "Use a demo space if a real one has anything private in it.",
      ],
    },
    items: [
      {
        icons: ["fa7-solid:share-nodes", "fa7-solid:user-group"],
        title: "Sharing & Shared spaces",
        desc: "Share a note by link, or host a group space with Harvous Plus — joining is always free.",
      },
    ],
  },
];

export function getTourChapter(key: string): TourChapter | undefined {
  return APP_TOUR_CHAPTERS.find((c) => c.key === key);
}
