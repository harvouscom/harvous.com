/**
 * The tour — five chapters, each an app view (drawn live by AppScene, staged in
 * lib/next/tour-staging.ts) with the features it demonstrates beside it.
 *
 * Ordered as a day of study rather than a feature taxonomy: open to what
 * happened, read, write, find, share. That ordering is the point — Harvous 3.0
 * is about study you can follow and return to, so the page should read the way
 * the product does rather than as a list of capabilities.
 */

/**
 * An item is a caption for what the view shows, not a destination. The card
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
  items: TourItem[];
};

export const APP_TOUR_CHAPTERS: TourChapter[] = [
  {
    key: "activity",
    categorySlug: "activity",
    size: "wide",
    eyebrow: "Activity",
    title: "Filed for you, threaded by you, brought back by Suggestions.",
    lead:
      "Harvous starts on your study, not an empty page. Each day is its own sheet, and the days behind it are still there to flip back through.",
    // The first three follow the heading's own sequence — filed, threaded,
    // brought back — so the row reads left to right in the same order the
    // sentence above it does. Review exercises are a fourth, appended rather
    // than folded into that sentence: it's a Harvous Plus add-on (see
    // /add-ons/review-exercises/), not one of the three free-tier behaviors
    // the headline is naming.
    items: [
      {
        icons: ["fa7-solid:folder-tree", "fa7-solid:thumbtack"],
        title: "Sorts itself & Pin",
        desc: "Auto-folders and auto-tags organize every note. Pin a note, folder, or thread to keep it at the top.",
      },
      {
        icons: ["fa7-solid:arrow-right-arrow-left"],
        title: "Threads",
        desc: "Connect notes into one line of thinking you can follow later, even across folders and months.",
      },
      {
        icons: ["fa7-solid:lightbulb"],
        title: "Suggestions",
        desc: "A fading note, a highlight, a passage — Suggestions resurface what's worth revisiting.",
      },
      {
        icons: ["fa7-solid:clock-rotate-left"],
        title: "Review exercises",
        desc: "Write an answer from memory, then say how well you remembered it — from your own notes and verses, with Harvous Plus.",
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
    items: [
      {
        icons: ["fa7-solid:book-bible", "fa7-solid:book-open"],
        title: "Scripture pills & Bible reader",
        desc: "Type a reference — it becomes a pill in 11 translations. Open the chapter with your notes right there.",
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
    items: [
      {
        icons: ["fa7-solid:highlighter"],
        title: "Highlight & annotations",
        desc: "Color-code phrases, leave annotations, and find them again in the highlights view.",
      },
      {
        icons: ["fa7-solid:list-check"],
        title: "Note templates",
        desc: "Start from a template — lesson prep, study outline, or your own — then make it yours.",
      },
      {
        icons: ["fa7-solid:lock"],
        title: "Locked notes",
        desc: "Lock a note with a PIN. It's encrypted on your device, so only you can open it — on the web for now.",
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
      "Browsing and searching stopped being two different places. Open Search, pick a kind or type what you remember, and act on what comes back without leaving the note underneath.",
    items: [
      {
        icons: ["fa7-solid:magnifying-glass"],
        title: "Search",
        desc: "Search everything you've saved, or browse it by kind, from one panel top middle.",
      },
      {
        icons: ["fa7-solid:newspaper"],
        title: "Resource library",
        desc: "The links and files your study leans on, in one place and one @ away from any note.",
      },
      {
        icons: ["fa7-solid:puzzle-piece"],
        title: "Connector",
        desc: "Ask Claude or ChatGPT about what you've studied. They can read your notes, never change them — with Harvous Plus.",
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
    // Split in two: the category's own two sections, a link for one note and
    // a space for a group — and the only pair here where one is free and the
    // other is Plus.
    items: [
      {
        icons: ["fa7-solid:share-nodes"],
        title: "Shared notes",
        desc: "Send a note by link. No account needed to open it, and the scripture and highlights come with it.",
      },
      {
        icons: ["fa7-solid:user-group"],
        title: "Shared spaces",
        desc: "Host a room for your group with Harvous Plus — its own cover, its own threads. Joining is always free.",
      },
    ],
  },
];

export function getTourChapter(key: string): TourChapter | undefined {
  return APP_TOUR_CHAPTERS.find((c) => c.key === key);
}
