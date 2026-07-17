import { getCompareBySlug, type CompareEntry } from "./compare-data.ts";

const SITE = "https://harvous.com";

export const HARVOUS_PITCH =
  "You want a notes-first Bible study app — no built-in Bible reader, no sermon transcription — focused on remembering and reconnecting with what you saved.";

/** Default “Side note” copy when Harvous leads the shortlist. */
export const DEFAULT_HONEST_NOTE_FIRST =
  "We built Harvous — so of course we care how this list reads. We put it first because we believe notes-first Bible study deserves its own home: not a reader feature, not sermon transcription, just a place to remember what you saved.";

/** Default when Harvous is on the list but not #1. */
export const DEFAULT_HONEST_NOTE_NOT_FIRST =
  "We built Harvous — so of course we care how this list reads. We didn’t put ourselves first: this guide ranks for the job in the headline. Harvous is here for notes-first Bible study — remembering what you saved — not as a catch-all #1.";

export type ComparePick = {
  slug: string;
  name: string;
  intro: string;
  competitorType: string;
  competitorImage: string;
  competitorLink: string;
  idealFor: string;
  bestAt: string;
  drawback: string;
  compareHref: string;
  isHarvous?: boolean;
};

export type WhenBlock = {
  heading: string;
  body: string;
};

type CompareSeoPageBase = {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  lead: string;
  whenToChoose: WhenBlock[];
  /** When true, page is noindex and excluded from production builds + compare hub. */
  draft?: boolean;
  guideLabel: string;
  guideDescription: string;
  /**
   * Optional “Side note” copy on the Harvous card.
   * Defaults depend on whether Harvous is ranked #1.
   */
  honestNote?: string;
};

export type CompareCategorySeoPage = CompareSeoPageBase & {
  kind: "category";
  /**
   * Shortlist order. Include `"harvous"` to set our rank explicitly.
   * If omitted, Harvous is prepended as #1 (Bible-notes guides).
   */
  pickSlugs: string[];
};

export type CompareAlternativeSeoPage = CompareSeoPageBase & {
  kind: "alternative";
  targetSlug: string;
  /** Same as category: include `"harvous"` for an explicit rank; otherwise prepended. */
  pickSlugs: string[];
};

export type CompareSeoPage = CompareCategorySeoPage | CompareAlternativeSeoPage;

const SEO_PAGES: CompareSeoPage[] = [
  {
    kind: "category",
    slug: "best-bible-notes-apps",
    guideLabel: "Best Bible notes apps",
    guideDescription: "Curated shortlist for scripture-linked study notes",
    seoTitle: "Best Bible notes apps — Harvous",
    seoDescription:
      "Compare the best Bible notes apps for scripture-linked study notes — Harvous, Church Notes, Bible Note, Obsidian, and more. Notes-first, not a Bible reader.",
    h1: "Best Bible notes apps",
    lead: "Scripture-linked study notes — dedicated apps and tools people adapt. Harvous is notes-first, not a reader.",
    pickSlugs: [
      "spirit-notes",
      "bible-note",
      "pencil-bible",
      "church-notes",
      "bible-notes",
      "obsidian",
      "notion",
      "apple-notes",
      "logos",
    ],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose a Bible reader if…",
        body: "You mainly need to read Scripture in many translations with reading plans and devotionals — YouVersion, Bible Gateway, or Olive Tree are built for that. Pair one with Harvous when notes outgrow the reader.",
      },
      {
        heading: "Choose a general notes app if…",
        body: "You already live in Obsidian, Notion, or Apple Notes and want maximum flexibility — but you'll wire up scripture references yourself.",
      },
      {
        heading: "Choose a journaling or all-in-one church app if…",
        body: "You want handwriting on an iPad (GoodNotes), built-in SOAP templates plus a reader (Church Notes), or AI-generated study journeys — different jobs than remembering your own written reflections.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "logos-alternative",
    targetSlug: "logos",
    guideLabel: "Best Logos alternative",
    guideDescription: "Lighter, notes-first options for Bible study",
    seoTitle: "Best Logos alternative for Bible study notes — Harvous",
    seoDescription:
      "Looking for a Logos alternative? Compare Harvous, Olive Tree, Accordance, e-Sword, PocketBible, and Obsidian for Bible study notes — lighter, notes-first options that sit beside Logos when you mainly need to remember what you saved.",
    h1: "Best Logos alternative",
    lead: "Logos is the deep-study suite. These are lighter, notes-first options — or a place to remember what you saved from Logos without the full library.",
    pickSlugs: ["olive-tree", "accordance", "e-sword", "pocketbible", "obsidian"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Logos if…",
        body: "You need scholarly tools, original languages, commentaries, and a full digital library — Logos is still the standard for seminary-level study. Many people keep Logos for research and use Harvous for the notes they want to revisit.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "youversion-alternative",
    targetSlug: "youversion",
    guideLabel: "Best YouVersion alternative",
    guideDescription: "A notes home that complements your Bible reader",
    seoTitle: "Best YouVersion alternative for Bible study notes — Harvous",
    seoDescription:
      "Looking for a YouVersion alternative for study notes? Harvous complements YouVersion — keep reading plans and community there; use a notes-first app to remember and reconnect with what you saved.",
    h1: "Best YouVersion alternative for study notes",
    lead: "YouVersion wins at reading plans and community. These options cover the notes job — keep reading where you already do.",
    pickSlugs: ["bible-gateway", "esv-bible", "olive-tree", "logos", "church-notes"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: "You like YouVersion (or another Bible app) for reading, and you want a notes-first home for what you write — scripture pills, threads, and recall — without switching your whole reading habit.",
      },
      {
        heading: "Choose YouVersion if…",
        body: "You want a free Bible reader with reading plans, audio, and social features — YouVersion excels at daily reading habits. Pair it with Harvous when notes start to scatter.",
      },
      {
        heading: "Choose another reader if…",
        body: "You want a different reading experience — Olive Tree, Bible Gateway, or ESV — and still need somewhere else for long-term study notes.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "obsidian-alternative",
    targetSlug: "obsidian",
    guideLabel: "Best Obsidian alternative",
    guideDescription: "Purpose-built scripture notes without a custom vault",
    seoTitle: "Best Obsidian alternative for Bible study notes — Harvous",
    seoDescription:
      "Using Obsidian for Bible study? Compare Harvous, Notion, Evernote, Apple Notes, and Logos — apps built for scripture-linked notes without maintaining a custom vault and plugin stack.",
    h1: "Best Obsidian alternative for Bible study",
    lead: "Obsidian is powerful if you build the vault yourself. These options ship scripture-linked notes without a custom setup.",
    pickSlugs: ["notion", "evernote", "apple-notes", "logos", "spirit-notes"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Obsidian if…",
        body: "You want maximum control over linking, plugins, and a personal knowledge base — and you're willing to configure scripture workflows yourself.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "bible-note-alternative",
    targetSlug: "bible-note",
    guideLabel: "Best Bible Note alternative",
    guideDescription: "Notes-first without sermon transcription",
    seoTitle: "Best Bible Note alternative — Harvous",
    seoDescription:
      "Looking for a Bible Note alternative? Compare Harvous, Church Notes, Bible Notes, Spirit Notes, and Pencil Bible — notes-first options without AI sermon transcription.",
    h1: "Best Bible Note alternative",
    lead: "Bible Note focuses on AI sermon transcription. These alternatives are notes-first — your reflections, linked to Scripture, findable later.",
    pickSlugs: ["church-notes", "bible-notes", "spirit-notes", "pencil-bible"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Bible Note if…",
        body: "You want automatic sermon transcription with scripture tagging and AI-generated flashcards from what you hear.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-sermon-notes-apps",
    guideLabel: "Best sermon notes apps",
    guideDescription: "Written sermon notes you’ll find later — not AI transcription",
    seoTitle: "Best sermon notes apps — Harvous",
    seoDescription:
      "Compare the best sermon notes apps for written notes you’ll find later — Church Notes, Harvous, Bible Note, Spirit Notes, and GoodNotes. Notes-first, not AI transcription.",
    h1: "Best sermon notes apps",
    lead: "Written sermon notes you’ll find later — dedicated apps and tools people adapt. Harvous is notes-first, not AI transcription.",
    // Church Notes owns the Sunday/SOAP+reader job; we stay on the list for notes you’ll revisit.
    pickSlugs: [
      "church-notes",
      "harvous",
      "bible-note",
      "bible-notes",
      "spirit-notes",
      "goodnotes",
    ],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We didn’t put ourselves first: Church Notes (and transcription apps) own Sunday capture. Harvous is here if you want the notes you write to stay findable later — not a reader, not AI transcription.",
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose a transcription app if…",
        body: "You want live sermon recording and AI transcripts — Bible Note and similar tools are built for capture. Pair one with Harvous when you care more about remembering what you wrote.",
      },
      {
        heading: "Choose Church Notes if…",
        body: "You want sermon notes, SOAP templates, and a Bible reader in one church-focused app.",
      },
      {
        heading: "Choose GoodNotes if…",
        body: "You prefer handwriting on an iPad and don’t need scripture linking or search across devices.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-free-bible-notes-apps",
    guideLabel: "Best free Bible notes apps",
    guideDescription: "Free and freemium options for scripture-linked notes",
    seoTitle: "Best free Bible notes apps — Harvous",
    seoDescription:
      "Compare the best free Bible notes apps for scripture-linked study notes — Harvous, Church Notes, Bible Note, Obsidian, and more. Start free; upgrade when notes matter.",
    h1: "Best free Bible notes apps",
    lead: "Free and freemium apps for scripture-linked study notes. Harvous is notes-first — start free, keep what you save findable later.",
    pickSlugs: [
      "spirit-notes",
      "bible-note",
      "church-notes",
      "bible-notes",
      "obsidian",
      "notion",
      "apple-notes",
      "pencil-bible",
    ],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose a free reader-plus-notes app if…",
        body: "You want sermon notes or SOAP templates with a Bible built in (Church Notes) — or a free general notes app (Apple Notes, Obsidian) you’ll customize yourself.",
      },
      {
        heading: "Choose a freemium transcription app if…",
        body: "You want AI sermon capture on a free tier — Bible Note and similar tools — knowing the product is built around transcription, not long-term written recall.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-bible-study-notes-apps",
    guideLabel: "Best Bible study notes apps",
    guideDescription: "Apps built for study notes linked to Scripture",
    seoTitle: "Best Bible study notes apps — Harvous",
    seoDescription:
      "Compare the best Bible study notes apps for scripture-linked reflections — Harvous, Church Notes, Bible Note, Obsidian, Logos, and more. Notes-first study, not a Bible reader.",
    h1: "Best Bible study notes apps",
    lead: "Apps for study notes linked to Scripture — dedicated tools and ones people adapt. Harvous is notes-first, not a reader.",
    pickSlugs: [
      "spirit-notes",
      "bible-note",
      "pencil-bible",
      "church-notes",
      "bible-notes",
      "obsidian",
      "notion",
      "logos",
    ],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose a study suite if…",
        body: "You need commentaries, original languages, and a full library — Logos is built for that. Keep research there; use a notes-first app for what you want to revisit.",
      },
      {
        heading: "Choose a general notes app if…",
        body: "You already live in Obsidian or Notion and want maximum flexibility — you’ll wire up scripture references yourself.",
      },
      {
        heading: "Choose journaling or SOAP if…",
        body: "You want handwriting on an iPad (GoodNotes) or built-in SOAP templates plus a reader (Church Notes) — different jobs than threading your own study reflections.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "church-notes-alternative",
    targetSlug: "church-notes",
    guideLabel: "Best Church Notes alternative",
    guideDescription: "Notes-first options beside your Bible app",
    seoTitle: "Best Church Notes alternative — Harvous",
    seoDescription:
      "Looking for a Church Notes alternative? Compare Harvous, Bible Note, Spirit Notes, and Pencil Bible — notes-first options that sit beside the Bible app you already use.",
    h1: "Best Church Notes alternative",
    lead: "Church Notes combines sermon notes, SOAP, and a Bible reader. These alternatives are notes-first — or lighter tools for the same jobs.",
    pickSlugs: ["bible-note", "spirit-notes", "pencil-bible", "bible-notes", "goodnotes"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Church Notes if…",
        body: "You want sermon notes, SOAP templates, and a Bible reader in one church-focused app — without juggling a separate notes home.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "spirit-notes-alternative",
    targetSlug: "spirit-notes",
    guideLabel: "Best Spirit Notes alternative",
    guideDescription: "Notes-first peers for scripture-linked study",
    seoTitle: "Best Spirit Notes alternative — Harvous",
    seoDescription:
      "Looking for a Spirit Notes alternative? Compare Harvous, Church Notes, Bible Note, and Pencil Bible — notes-first options for scripture-linked study notes.",
    h1: "Best Spirit Notes alternative",
    lead: "Spirit Notes is a dedicated Bible notes peer. These alternatives cover the same notes-first job — or adjacent tools for sermon and journaling.",
    pickSlugs: ["church-notes", "bible-note", "pencil-bible", "bible-notes", "goodnotes"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Spirit Notes if…",
        body: "You already like its dedicated Bible notes workflow and don’t need a different notes-first home.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "bible-notes-alternative",
    targetSlug: "bible-notes",
    guideLabel: "Best Bible Notes alternative",
    guideDescription: "Notes-first without live transcription focus",
    seoTitle: "Best Bible Notes alternative — Harvous",
    seoDescription:
      "Looking for a Bible Notes alternative? Compare Harvous, Church Notes, Bible Note, Spirit Notes, and Pencil Bible — notes-first options focused on what you write, not live transcription.",
    h1: "Best Bible Notes alternative",
    lead: "Bible Notes leans toward live capture and transcription. These alternatives are notes-first — your reflections, linked to Scripture, findable later.",
    pickSlugs: ["church-notes", "bible-note", "spirit-notes", "pencil-bible", "goodnotes"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Bible Notes if…",
        body: "You want live sermon capture and transcription-style workflows more than a long-term written study journal.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "notion-alternative",
    targetSlug: "notion",
    guideLabel: "Best Notion alternative for Bible study",
    guideDescription: "Scripture-linked notes without building a Notion system",
    seoTitle: "Best Notion alternative for Bible study notes — Harvous",
    seoDescription:
      "Using Notion for Bible study? Compare Harvous, Obsidian, Apple Notes, Evernote, and Spirit Notes — scripture-linked notes without building and maintaining a custom Notion system.",
    h1: "Best Notion alternative for Bible study",
    lead: "Notion can hold anything if you build the system. These options ship scripture-linked study notes without a custom workspace.",
    pickSlugs: ["obsidian", "apple-notes", "evernote", "spirit-notes", "church-notes"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Notion if…",
        body: "You already live in Notion databases and templates — and you’re willing to wire up scripture references and study structure yourself.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "apple-notes-alternative",
    targetSlug: "apple-notes",
    guideLabel: "Best Apple Notes alternative for Bible study",
    guideDescription: "Purpose-built scripture notes beyond default capture",
    seoTitle: "Best Apple Notes alternative for Bible study notes — Harvous",
    seoDescription:
      "Using Apple Notes for Bible study? Compare Harvous, Notion, Obsidian, Evernote, and Spirit Notes — purpose-built scripture-linked notes beyond a general capture inbox.",
    h1: "Best Apple Notes alternative for Bible study",
    lead: "Apple Notes is great for quick capture. These options are built for scripture-linked study notes you’ll find again later.",
    pickSlugs: ["notion", "obsidian", "evernote", "spirit-notes", "church-notes"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Apple Notes if…",
        body: "You want frictionless capture on Apple devices and don’t need native scripture linking or study-specific recall.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-notion-bible-study-apps",
    guideLabel: "Best Notion Bible study apps",
    guideDescription: "Notion vs purpose-built scripture notes for study",
    seoTitle: "Best Notion Bible study apps — Harvous",
    seoDescription:
      "Compare the best apps for Bible study notes if you’re coming from Notion — Harvous, Obsidian, Notion, Apple Notes, Church Notes, and Evernote. Purpose-built scripture notes vs building your own system.",
    h1: "Best Notion Bible study apps",
    lead: "Bible study in Notion vs purpose-built scripture notes. Harvous is notes-first — without building and maintaining a custom workspace.",
    pickSlugs: ["obsidian", "notion", "apple-notes", "church-notes", "evernote"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Notion if…",
        body: "You want one flexible workspace for life and study — and you’re fine designing databases, templates, and scripture linking yourself.",
      },
      {
        heading: "Choose Obsidian if…",
        body: "You want local markdown, backlinks, and plugins — and you’re willing to configure a Bible study vault.",
      },
      {
        heading: "Choose Church Notes if…",
        body: "You want sermon notes, SOAP templates, and a Bible reader in one church-focused app.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-sermon-prep-tools",
    guideLabel: "Best sermon prep tools",
    guideDescription: "Outline suites, resource libraries, and notes-first prep — not listener sermon notes",
    seoTitle: "Best sermon prep tools — Harvous",
    seoDescription:
      "Compare the best sermon prep tools for pastors — Sermonary, Sermons.app, Sermons.com, Pulpit AI, Logos, and Harvous. Notes-first prep that compounds, not a manuscript suite or listener capture app.",
    h1: "Best sermon prep tools",
    lead: "Tools for preparing and writing sermons — dedicated outline apps, resource libraries, AI coaches, and research suites. Harvous is notes-first prep you’ll find again next year — not podium mode, not listener sermon notes.",
    pickSlugs: [
      "sermonary",
      "sermons-app",
      "logos",
      "harvous",
      "sermons-com",
      "pulpit-ai",
      "notion",
    ],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We didn’t put ourselves first: dedicated prep suites own outlines, templates, and podium delivery. Harvous is here if you want scripture-linked prep notes and series memory that compound across the preaching year — not AI that writes the sermon for you.",
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: "You want a notes-first home for outline notes, series threads, and Recall across years of preaching — beside Logos or a manuscript app, not instead of every research tool.",
      },
      {
        heading: "Choose a dedicated sermon suite if…",
        body: "You want block outlines, templates, and podium mode in one subscription — Sermonary is built for that weekly writing-and-delivery job.",
      },
      {
        heading: "Choose a study suite if…",
        body: "You need commentaries, original languages, and a full library wired into sermon building — Logos (and its Sermon Builder) is built for research-heavy prep.",
      },
      {
        heading: "Choose an AI coach or content tool if…",
        body: "You want help sharpening a draft (Sermons.app) or multiplying a finished sermon into clips and guides (Pulpit AI) — different jobs than long-term personal prep notes.",
      },
      {
        heading: "Choose a resource library if…",
        body: "You mainly need illustrations, sample sermons, and lectionary starters — Sermons.com is a library, not a notes home.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "sermonary-alternative",
    targetSlug: "sermonary",
    guideLabel: "Best Sermonary alternative",
    guideDescription: "Notes-first prep and peers beside the outline suite",
    seoTitle: "Best Sermonary alternative — Harvous",
    seoDescription:
      "Looking for a Sermonary alternative? Compare Harvous, Sermons.app, Logos, Sermons.com, and Notion — options for sermon prep notes, AI coaching, research, or a flexible doc — without assuming you need podium mode.",
    h1: "Best Sermonary alternative",
    lead: "Sermonary owns block outlines and podium delivery. These alternatives cover notes-first prep, AI coaching, research suites, or a doc you adapt yourself.",
    pickSlugs: ["sermons-app", "logos", "sermons-com", "pulpit-ai", "notion"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: "You want scripture-linked prep notes and series memory that last years — not a full outline builder with podium mode.",
      },
      {
        heading: "Choose Sermonary if…",
        body: "You want drag-and-drop sermon blocks, templates, and a dedicated preaching view in one app.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "sermons-app-alternative",
    targetSlug: "sermons-app",
    guideLabel: "Best Sermons.app alternative",
    guideDescription: "Prep peers without an AI sermon coach at the center",
    seoTitle: "Best Sermons.app alternative — Harvous",
    seoDescription:
      "Looking for a Sermons.app alternative? Compare Harvous, Sermonary, Logos, Sermons.com, and Notion — sermon prep options focused on notes, outlines, or research rather than an AI writing coach.",
    h1: "Best Sermons.app alternative",
    lead: "Sermons.app centers an AI coach for drafting in your voice. These alternatives cover notes-first prep, outline suites, research, or a flexible workspace.",
    pickSlugs: ["sermonary", "logos", "sermons-com", "pulpit-ai", "notion"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: "You want to keep authorship in your own notes — scripture-linked, threaded by series, findable later — without an AI coach in the middle of the draft.",
      },
      {
        heading: "Choose Sermons.app if…",
        body: "You want conversational AI help structuring and clarifying a sermon while you stay the author.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "sermons-com-alternative",
    targetSlug: "sermons-com",
    guideLabel: "Best Sermons.com alternative",
    guideDescription: "Prep notes and tools beyond an illustration library",
    seoTitle: "Best Sermons.com alternative — Harvous",
    seoDescription:
      "Looking for a Sermons.com alternative? Compare Harvous, Sermonary, Logos, Sermons.app, and Notion — places for your own prep notes and outlines, not only borrowed illustrations.",
    h1: "Best Sermons.com alternative",
    lead: "Sermons.com is a resource library. These alternatives help you write and keep your own prep — or coach a draft — instead of only browsing illustrations.",
    pickSlugs: ["sermonary", "logos", "sermons-app", "pulpit-ai", "notion"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: "You already have (or don’t need) illustration libraries — and you want your own scripture-linked outline notes to compound across the year.",
      },
      {
        heading: "Choose Sermons.com if…",
        body: "You mainly need searchable illustrations, sample sermons, and weekly worship resources for the lectionary.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "pulpit-ai-alternative",
    targetSlug: "pulpit-ai",
    guideLabel: "Best Pulpit AI alternative",
    guideDescription: "Prep and notes peers beyond sermon-to-content AI",
    seoTitle: "Best Pulpit AI alternative — Harvous",
    seoDescription:
      "Looking for a Pulpit AI alternative? Compare Harvous, Sermonary, Sermons.app, Logos, and Notion — tools for sermon prep notes and outlines rather than multiplying a finished sermon into clips and guides.",
    h1: "Best Pulpit AI alternative",
    lead: "Pulpit AI shines at AI assistance and turning a sermon into church content. These alternatives focus on prep notes, outlines, coaching, or research.",
    pickSlugs: ["sermonary", "sermons-app", "logos", "sermons-com", "notion"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: "You care more about remembering the prep you wrote than generating social clips from Sunday’s audio.",
      },
      {
        heading: "Choose Pulpit AI if…",
        body: "You want an AI sermon assistant and a pipeline that turns one message into clips, guides, and midweek content.",
      },
    ],
  },
];

function harvousPick(): ComparePick {
  return {
    slug: "harvous",
    name: "Harvous",
    intro:
      "A Bible study notes app — scripture pills, highlights, threads, and recall. Not a Bible reader, not sermon transcription.",
    competitorType: "Bible Notes",
    competitorImage: "/images/harvous-2-icon.png",
    competitorLink: "https://app.harvous.com/sign-up",
    idealFor: "People who want to remember what they saved from study",
    bestAt: "Remembering and threading what you saved from Scripture",
    drawback: "No built-in Bible reader or sermon transcription",
    compareHref: "/",
    isHarvous: true,
  };
}

function entryToPick(entry: CompareEntry): ComparePick {
  return {
    slug: entry.slug,
    name: entry.name,
    intro: entry.intro,
    competitorType: entry.competitorType,
    competitorImage: entry.competitorImage,
    competitorLink: entry.competitorLink,
    idealFor: entry.idealFor,
    bestAt: entry.bestAt,
    drawback: drawbackFor(entry),
    compareHref: `/compare/${entry.slug}/`,
  };
}

function drawbackFor(entry: CompareEntry): string {
  if (entry.competitorType === "Bible Reader") {
    return "Notes are secondary to reading — not built for long-term recall of your own study";
  }
  if (entry.competitorType === "General Notes") {
    return "No native scripture linking — you build Bible study workflows yourself";
  }
  if (entry.competitorType === "Bible Study Suite") {
    return "Heavier and more expensive — built for scholars, not lightweight personal notes";
  }
  if (entry.competitorType === "Sermon Prep") {
    return "Built for outlines, resources, or AI assistance — not a notes-first home for years of prep";
  }
  if (entry.competitorType === "AI Guided Bible") {
    return "AI and reading lead — less focused on threading your own written reflections";
  }
  if (entry.name === "Bible Note" || entry.name === "Bible Notes") {
    return "Focused on live transcription — less on threading your own written reflections";
  }
  if (entry.name === "Church Notes") {
    return "All-in-one reader + SOAP templates — not a notes-first home beside your Bible app";
  }
  if (entry.name === "GoodNotes") {
    return "Handwriting-first on iPad — no native scripture linking or cross-device study threads";
  }
  return "Different primary job than notes-first Bible study";
}

/**
 * Resolve shortlist picks. Include `"harvous"` in `slugs` to set our rank;
 * if omitted, Harvous is prepended as #1.
 */
export function resolvePickSlugs(slugs: string[]): ComparePick[] {
  const hasExplicitHarvous = slugs.includes("harvous");
  const ordered = hasExplicitHarvous ? slugs : ["harvous", ...slugs];
  const picks: ComparePick[] = [];

  for (const slug of ordered) {
    if (slug === "harvous") {
      if (!picks.some((p) => p.isHarvous)) picks.push(harvousPick());
      continue;
    }
    const entry = getCompareBySlug(slug);
    if (entry) picks.push(entryToPick(entry));
  }

  return picks;
}

/** “Side note” copy for a guide, based on rank + optional override. */
export function getHonestNoteForPage(page: CompareSeoPage, picks: ComparePick[]): string {
  if (page.honestNote) return page.honestNote;
  const harvousIndex = picks.findIndex((p) => p.isHarvous);
  if (harvousIndex <= 0) return DEFAULT_HONEST_NOTE_FIRST;
  return DEFAULT_HONEST_NOTE_NOT_FIRST;
}

export function isCompareSeoPageDraft(page: CompareSeoPage): boolean {
  return page.draft === true;
}

/** Pages included in static builds — drafts only in dev. */
export function getCompareSeoPagesForBuild(): CompareSeoPage[] {
  return SEO_PAGES.filter((page) => !isCompareSeoPageDraft(page) || import.meta.env.DEV);
}

export function getCompareSeoPages(): CompareSeoPage[] {
  return SEO_PAGES;
}

export function getCompareSeoPageBySlug(slug: string): CompareSeoPage | undefined {
  return SEO_PAGES.find((p) => p.slug === slug);
}

export type CompareGuideCard = {
  slug: string;
  label: string;
  description: string;
  draft: boolean;
};

function toGuideCard(page: CompareSeoPage): CompareGuideCard {
  return {
    slug: page.slug,
    label: page.guideLabel,
    description: page.guideDescription,
    draft: isCompareSeoPageDraft(page),
  };
}

/** Published guides that relate to a compare entry (by target or shortlist pick). */
export function getGuidesForCompareSlug(compareSlug: string): CompareGuideCard[] {
  const guides: CompareGuideCard[] = [];

  for (const page of SEO_PAGES) {
    if (isCompareSeoPageDraft(page)) continue;

    if (page.kind === "alternative" && page.targetSlug === compareSlug) {
      guides.push(toGuideCard(page));
      continue;
    }

    if (
      page.kind === "category" &&
      page.pickSlugs.filter((s) => s !== "harvous").includes(compareSlug)
    ) {
      guides.push(toGuideCard(page));
    }
  }

  return guides;
}

export function getCompareSeoPageUrl(slug: string): string {
  return `${SITE}/compare/${slug}/`;
}

export function buildCategoryJsonLd(page: CompareCategorySeoPage, picks: ComparePick[]) {
  const pageUrl = getCompareSeoPageUrl(page.slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.seoTitle,
        description: page.seoDescription,
        url: pageUrl,
        isPartOf: { "@type": "WebSite", name: "Harvous", url: SITE },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Harvous", item: SITE },
          { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE}/compare/` },
          { "@type": "ListItem", position: 3, name: page.h1, item: pageUrl },
        ],
      },
      {
        "@type": "ItemList",
        name: page.h1,
        itemListElement: picks.map((pick, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: pick.name,
          url: pick.isHarvous ? SITE : `${SITE}${pick.compareHref}`,
          description: pick.intro,
        })),
      },
    ],
  };
}

export function buildAlternativeJsonLd(
  page: CompareAlternativeSeoPage,
  target: CompareEntry,
  picks: ComparePick[]
) {
  const pageUrl = getCompareSeoPageUrl(page.slug);
  const vsUrl = `${SITE}/compare/${target.slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.seoTitle,
        description: page.seoDescription,
        url: pageUrl,
        isPartOf: { "@type": "WebSite", name: "Harvous", url: SITE },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Harvous", item: SITE },
          { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE}/compare/` },
          { "@type": "ListItem", position: 3, name: page.h1, item: pageUrl },
        ],
      },
      {
        "@type": "ItemList",
        name: page.h1,
        itemListElement: picks.map((pick, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: pick.name,
          url: pick.isHarvous ? SITE : `${SITE}${pick.compareHref}`,
          description: pick.intro,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Is Harvous a good alternative to ${target.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: page.lead,
            },
          },
          {
            "@type": "Question",
            name: `What is ${target.name} best at?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: target.bestAt,
            },
          },
          {
            "@type": "Question",
            name: `Can I use Harvous alongside ${target.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: target.worksBestAlongside,
            },
          },
        ],
      },
      {
        "@type": "WebPage",
        name: `Harvous vs ${target.name}`,
        url: vsUrl,
        description: target.seoDescription,
      },
    ],
  };
}
