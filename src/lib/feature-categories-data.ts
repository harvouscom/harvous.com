/**
 * Feature categories — the five things Harvous is for, and the home for every
 * feature page.
 *
 * These are the homepage tour's five cards given somewhere to go. The tour names
 * Activity, Read, Write, Find and Share, but before this the names existed only
 * on the cards: each card's arrow went to whichever member feature happened to
 * come first in its list, and the category itself had no page.
 *
 * A category is deliberately the same shape as a UseCase (see use-cases-data.ts)
 * — sections, moments, featureIds, compareSlugs — because UseCase and
 * ForAudience are already ~90% the same object rendered by near-mirror
 * components, and a third variant should not invent a fourth vocabulary. Two
 * fields are new: `useCaseSlugs`, which is the site's first link from product
 * structure back up to how people study, and `tourKey`, which borrows the
 * matching tour chapter's screenshot rather than duplicating it.
 *
 * Membership lives HERE and nowhere else. The repo already carries three
 * hand-synced feature registries (FEATURE_ICONS, COMPARE_FEATURE_LABELS, and the
 * MDX icon/tagline frontmatter); category membership is derived from this file
 * via getCategoryForFeature() so it does not become a fourth.
 */

export type FeatureCategorySection = { heading: string; paragraphs: string[] };
export type FeatureCategoryMoment = { icon: string; heading: string; body: string };

export type FeatureCategory = {
  slug: string;
  href: string;
  /** Short name, as it appears on the tour card. */
  title: string;
  tagline: string;
  icon: string;
  ink: string;
  image: string;
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroLead: string;
  /** Matching key in APP_TOUR_CHAPTERS — the page reuses that chapter's shot. */
  tourKey: string;
  sections: FeatureCategorySection[];
  moments: FeatureCategoryMoment[];
  /** Feature MDX ids housed here, plus coming-soon-grid ids (e.g. shared-spaces). */
  featureIds: string[];
  featuresHeading: string;
  featuresLead: string;
  /** Use cases this category serves — the upward edge feature pages never had. */
  useCaseSlugs: string[];
  compareSlugs: string[];
  testimonialId?: string;
};

const categories: FeatureCategory[] = [
  {
    slug: "activity",
    href: "/features/activity/",
    title: "Activity",
    tagline: "Open to what you already studied, not an empty page.",
    icon: "fa7-solid:layer-group",
    ink: "var(--pill-note)",
    image: "/images/auth-hero/ai_bg_053.webp",
    seoTitle: "Activity — see your Bible study as it accumulates | Harvous",
    seoDescription:
      "Harvous opens on the study you have already done. Each day is its own sheet, the days behind it are still there, and what is worth revisiting comes back to you.",
    heroTitle: "Your study is already there. Activity is where you see it.",
    heroLead:
      "Most notes apps open on a blank page and leave the remembering to you. Harvous opens on what actually happened — the passages you read, the phrases you marked, the notes you wrote — one sheet per day, with the days behind it still there to flip back through.",
    tourKey: "activity",
    sections: [
      {
        heading: "A day at a time, not an endless feed",
        paragraphs: [
          "A feed says: here is everything, keep going. A day says: here is what this one was. Each day gets its own sheet with a sentence at the top — what you read, how much you wrote, the book you kept returning to.",
          "Days you did not study still get a sheet. The quiet days count too, and a stack that skipped them would rewrite your month into an unbroken streak you never had.",
        ],
      },
      {
        heading: "A thread is the long version of a day sheet",
        paragraphs: [
          "A day sheet shows what one day held. A thread shows what one whole study held — the notes you connected on purpose, across every day you worked on it, even when they sit in different folders and were written months apart.",
          "Auto-folders do the filing so you do not have to. A thread is the opposite: the one piece of organizing worth doing by hand, because only you know which notes belong to the same line of thinking.",
        ],
      },
      {
        heading: "What is worth coming back to finds you",
        paragraphs: [
          "Suggestions watch for the note that is fading, the highlight you never returned to, the passage you have circled three times without writing anything down. They come back when they are worth another look.",
          "There is no streak to protect and no queue of cards waiting to be cleared. The point is that your study stays reachable, not that you keep a scoreboard alive.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa7-solid:calendar-day",
        heading: "A sheet for every day",
        body: "Today's sheet on top, the days behind it peeking above it. Tap the date to jump back to any day you have studied.",
      },
      {
        icon: "fa7-solid:lightbulb",
        heading: "Suggestions resurface what is fading",
        body: "A note you have not opened in a while, a highlight without a thought attached — brought back at the point it is still worth having.",
      },
      {
        icon: "fa7-solid:folder-tree",
        heading: "It sorts itself as you go",
        body: "Auto-folders and auto-tags file each note by what it is actually about, so everything stays findable without you maintaining it.",
      },
      {
        icon: "fa7-solid:arrow-right-arrow-left",
        heading: "Threads follow one study across days",
        body: "Collect the notes that belong to the same line of thinking, however many weeks apart they were written.",
      },
    ],
    // "review" resolves via getComingSoonGridItem() to the addon page, the same
    // mechanism Share uses for "shared-spaces" — a Plus add-on housed inside a
    // free category's grid, not a fourth item on the homepage tour card.
    featureIds: ["suggestions", "daily-passage", "threads", "review", "reminders"],
    featuresHeading: "What keeps Activity worth opening",
    featuresLead:
      "Activity is built out of what Harvous already logs — nothing new to maintain, which is why it can show you a trail reaching back further than the feature itself.",
    useCaseSlugs: ["daily-journal", "deep-study"],
    compareSlugs: ["best-apps-to-remember-bible-study", "youversion", "obsidian", "apple-notes"],
    testimonialId: "theo",
  },
  {
    slug: "read",
    href: "/features/read/",
    title: "Read",
    tagline: "A chapter, with the one before it still there.",
    icon: "fa7-solid:book-open",
    ink: "var(--pill-scripture)",
    image: "/images/auth-hero/ai_bg_076.webp",
    seoTitle: "Read — a Bible reader with your notes in the margin | Harvous",
    seoDescription:
      "Read a chapter in 11 translations, compare two side by side verse for verse, and keep your notes and highlights in the margin where you left them.",
    heroTitle: "Read the chapter with everything you have already said about it.",
    heroLead:
      "Reading somewhere else and taking notes here means two apps and a lost place. In Harvous the chapter and your study are the same surface — margin marks show where you have written, and the chapters either side of the one you are on are right there as paper.",
    tourKey: "read",
    sections: [
      {
        heading: "A book has pages on both sides",
        paragraphs: [
          "The chapter behind and the chapter ahead both sit as paper edges around the one you are reading. Turning forward and turning back are the same motion, because in a book they always were.",
          "Type a reference anywhere and it becomes a pill you can open. Open the chapter instead and your notes and highlights for it are already in the margin — the same study, reached from either direction.",
        ],
      },
      {
        heading: "Two translations, lined up honestly",
        paragraphs: [
          "Put a second version beside the first and Harvous aligns them by verse number, not by position in the list. KJV counts 31,102 verses and other versions count fewer, so a naive pairing goes wrong at the first disagreement and stays wrong for the rest of the chapter.",
          "Where a version omits a verse, the cell says which one is missing it rather than quietly sliding everything up. Both columns stay markable, and the comparison is in the URL, so it survives a page turn and can be shared.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa7-solid:book-bible",
        heading: "Type the reference, get the verse",
        body: "A reference becomes a tappable pill in 11 translations, with a per-pill override when one version says it better.",
      },
      {
        icon: "fa7-solid:table-columns",
        heading: "Compare two versions",
        body: "Verse seven beside verse seven on every row, both sides highlightable, and a URL you can send someone.",
      },
      {
        icon: "fa7-solid:lines-leaning",
        heading: "Look a name up without leaving",
        body: "Select a name or term for its Easton's entry and cross-references, in place, without losing the chapter.",
      },
    ],
    featureIds: ["bible-reader", "compare-translations", "scripture-pills", "dictionary"],
    featuresHeading: "What reading in Harvous gives you",
    featuresLead:
      "Keep the Bible app you love. This is for the reading that you want to leave something behind.",
    useCaseSlugs: ["book-study", "daily-journal", "deep-study"],
    compareSlugs: ["youversion", "olive-tree", "logos", "blue-letter-bible"],
  },
  {
    slug: "write",
    href: "/features/write/",
    title: "Write",
    tagline: "Type the reference. It knows what you mean.",
    icon: "fa7-solid:pen",
    ink: "var(--pill-highlight-ink)",
    image: "/images/auth-hero/ai_bg_072.webp",
    seoTitle: "Write — Bible study notes that stay connected | Harvous",
    seoDescription:
      "Rich text that behaves like any good editor, with scripture references that become links, highlights you can annotate, and templates for the prep you do every week.",
    heroTitle: "Write the way you write anywhere else. Harvous does the connecting.",
    heroLead:
      "Headings, bullets, dividers, links — the editor gets out of the way. What it adds is underneath: every reference you type becomes something you can open later, and every phrase you mark stays findable long after you have closed the note.",
    tourKey: "write",
    sections: [
      {
        heading: "The connecting happens while you type",
        paragraphs: [
          "Write \"Romans 8:1\" and it becomes a pill. Highlight a phrase and it joins the highlights view. Type @ to mention a note, folder, thread or resource and it becomes a pill you can open later.",
          "None of it is filing. You are writing a note; the links are a side effect of having written it, which is the only kind of organizing that survives a busy week.",
        ],
      },
      {
        heading: "Annotations are for the thought, not the colour",
        paragraphs: [
          "A colour on its own tells you something mattered and not what. Attach an annotation to a highlight and the reason is stored with the phrase — so the highlights view is a list of thoughts rather than a list of stripes.",
          "Start from a template when the shape repeats. Lesson prep, a study outline, or one of your own — a structure to fill rather than a blank page to face every week.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa7-solid:highlighter",
        heading: "Highlight, then say why",
        body: "Colour-code a phrase and attach the thought to it. Both stay findable in the highlights view later.",
      },
      {
        icon: "fa7-solid:list-check",
        heading: "Templates for the work that repeats",
        body: "Lesson prep and study outlines you can start from, then bend to whatever this week actually needs.",
      },
      {
        icon: "fa7-solid:at",
        heading: "@ to link what you have already saved",
        body: "Mention a note, folder, thread or resource inline. It becomes a pill you can open without losing your place.",
      },
    ],
    featureIds: ["highlights", "note-templates"],
    featuresHeading: "What writing in Harvous gives you",
    featuresLead:
      "A good editor first, and a study system second — in that order, because a note you did not enjoy writing is a note you will not write again.",
    useCaseSlugs: ["sermon-notes", "sermon-prep", "daily-journal"],
    compareSlugs: ["best-bible-highlight-apps", "notion", "apple-notes", "bible-note"],
    testimonialId: "teaella",
  },
  {
    slug: "find",
    href: "/features/find/",
    title: "Find",
    tagline: "One panel for everything you have saved.",
    icon: "fa7-solid:magnifying-glass",
    ink: "var(--pill-thread)",
    image: "/images/auth-hero/ai_bg_044.webp",
    seoTitle: "Find — search and browse every Bible study note you have | Harvous",
    seoDescription:
      "Browse by kind or search across notes, highlights, scripture and resources in one panel — and act on what comes back without leaving the note underneath.",
    heroTitle: "Browsing and searching stopped being two different places.",
    heroLead:
      "Searching is how you retrieve something you can already name. Browsing is how you rediscover the thing you had forgotten you wrote. Harvous needs both, so Search does both: pick a kind, or type what you half-remember, in one panel over the note you are already in.",
    tourKey: "find",
    sections: [
      {
        heading: "Every kind of thing you have saved, in one place",
        paragraphs: [
          "Notes, folders, threads, highlights, scripture and resources each get a tab, and Everything holds the lot with your pinned items at the top. The tabs are the browsing; the query is the retrieval.",
          "Search looks across what you wrote, not a list of filenames — half a phrase from last month is enough to get back to the thought.",
        ],
      },
      {
        heading: "Act on what you find, without losing your place",
        paragraphs: [
          "Search is not a modal. The note you were writing stays put underneath it, so looking something up is a thing you dip into rather than a place you go.",
          "Type a query and what you can *do* with a result appears above the results — move it to a folder, pin it, start a thread from it. The resource library sits in the same panel, holding the links and files your study leans on so you can pull one into a note with @ rather than hunting for it again.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa7-solid:magnifying-glass",
        heading: "Search everything study-shaped",
        body: "Notes, highlights and scripture in one query — enough to find a thought you only half remember.",
      },
      {
        icon: "fa7-solid:thumbtack",
        heading: "Pinned things come first",
        body: "What you pinned heads the list; everything else falls back to how recently you touched it.",
      },
      {
        icon: "fa7-solid:newspaper",
        heading: "Your resources, one @ away",
        body: "The links and files you keep coming back to, in one place and droppable straight into a note.",
      },
    ],
    featureIds: ["sidebar-modes", "resource-library"],
    featuresHeading: "What finding things again asks for",
    featuresLead:
      "Study you cannot get back to is study you did once. These are the pieces that keep it reachable.",
    useCaseSlugs: ["topical-study", "deep-study", "sermon-prep"],
    compareSlugs: ["best-linked-bible-notes-apps", "obsidian", "notion", "evernote"],
  },
  {
    slug: "share",
    href: "/features/share/",
    title: "Share",
    tagline: "A space that looks like the place it is.",
    icon: "fa7-solid:user-group",
    ink: "var(--pill-folder)",
    image: "/images/auth-hero/ai_bg_046.webp",
    seoTitle: "Share — send a note or host a space for your group | Harvous",
    seoDescription:
      "Share a single note by link, or host a space where a group studies together. Your own study stays private; joining a space is always free.",
    heroTitle: "Share one note, or open a room for the whole group.",
    heroLead:
      "Most of what you write is for you. Some of it is worth handing to one person, and some of it belongs to a group that meets every week. Harvous keeps those three separate on purpose, so sharing something never means exposing everything.",
    tourKey: "share",
    sections: [
      {
        heading: "A link for one note",
        paragraphs: [
          "Share a note by link and the person opening it does not need an account, an app, or an explanation. They get the note, with its scripture and highlights intact.",
          "Nothing else travels with it. A shared note is a shared note, not a door into the rest of your study.",
        ],
      },
      {
        heading: "A space is a place, not a folder",
        paragraphs: [
          "A shared space has its own front door — its own cover, its own threads, its own tools in its header. Standing in someone else's space shows you what is happening there, not your own study under their roof.",
          "Hosting a space comes with Harvous Plus. Joining one is always free, so inviting a group never means asking them to pay to show up.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa7-solid:share-nodes",
        heading: "Send a note to one person",
        body: "A link that opens for anyone, with the scripture and highlights still attached. No account needed to read it.",
      },
      {
        icon: "fa7-solid:user-group",
        heading: "Host a space for a group",
        body: "Threads per week or per topic, everyone's contributions in one room, and your private prep still private.",
      },
      {
        icon: "fa7-solid:lock",
        heading: "Private stays the default",
        body: "Nothing is shared until you share it. What belongs to a space is what you put in the space.",
      },
    ],
    featureIds: ["shared-spaces"],
    featuresHeading: "Studying with other people",
    featuresLead:
      "Shared spaces are a Harvous Plus add-on for the person hosting. Everyone they invite joins free.",
    useCaseSlugs: ["small-group", "sermon-prep"],
    compareSlugs: ["notion", "google-docs", "groupme", "youversion"],
    testimonialId: "joschua",
  },
];

export function getFeatureCategories(): FeatureCategory[] {
  return categories;
}

export function getFeatureCategoryBySlug(slug: string): FeatureCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

/**
 * The category a feature page belongs to. This is the only place membership is
 * resolved — feature MDX carries no category field, so nothing has to be kept in
 * sync by hand.
 */
export function getCategoryForFeature(featureId: string): FeatureCategory | undefined {
  return categories.find((c) => c.featureIds.includes(featureId));
}

/**
 * A feature page's own colour — the category's ink, in a tier tied to the
 * feature's position in the category's list. Not the raw pill colour: `ink` is
 * rendered as solid text and icon fill on the detail page (title badge, hero
 * badge, moment icons), and the raw pill palette is a highlighter palette —
 * --pill-thread (green) measures 2.43:1 on white and --pill-highlight-ink
 * (already once-adjusted) still only 2.16:1 at full strength. 55% mixed toward
 * --color-ink clears 4.5:1 for the worst of the five with margin — measured in
 * the browser via canvas, not derived from the sRGB math a first pass used,
 * which put --pill-highlight-ink's true oklab mix at 4.32 rather than the ~4.8
 * the approximation predicted. Every tier after the first only gets safer, so
 * they exist for variety, not for accessibility.
 *
 * The result is a family: the first feature listed for a category reads as
 * that category's colour, and each one after it is a visibly related, slightly
 * deeper shade of the same hue — the way Write's note-templates should read as
 * a version of Write's yellow, not an unrelated teal.
 */
/* Five now: Activity gained Reminders, and a clamped fifth would have shared
   Review's shade — two cards in one grid reading as a pair. */
const INK_VARIANT_TIERS = [55, 42, 32, 24, 18];

export function getFeatureInk(featureId: string): string {
  const category = getCategoryForFeature(featureId);
  if (!category) return "var(--color-accent)";
  const index = category.featureIds.indexOf(featureId);
  const tier = INK_VARIANT_TIERS[Math.min(Math.max(index, 0), INK_VARIANT_TIERS.length - 1)];
  return `color-mix(in oklab, ${category.ink} ${tier}%, var(--color-ink))`;
}

export function getFeatureIdsForCategory(slug: string): string[] {
  return getFeatureCategoryBySlug(slug)?.featureIds ?? [];
}
