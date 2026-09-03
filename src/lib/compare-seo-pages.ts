import { getCompareBySlug, type CompareEntry } from "./compare-data.ts";
import { getHarvousPosition } from "./compare-harvous-positioning.ts";

const SITE = "https://harvous.com";

/** Default “Side note” copy when Harvous leads the shortlist. */
export const DEFAULT_HONEST_NOTE_FIRST =
  "We built Harvous — so of course we care how this list reads. We put it first because we believe scripture-linked study notes deserve their own home: not sermon transcription — a place to write, thread, and suggestions what you saved, with the passage right there when you need it.";

/** Default when Harvous is on the list but not #1. */
export const DEFAULT_HONEST_NOTE_NOT_FIRST =
  "We built Harvous — so of course we care how this list reads. We didn’t put ourselves first: this guide ranks for the job in the headline. Harvous is here for scripture-linked notes you’ll find again — not as a catch-all #1.";

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

function chooseHarvous(competitorType: string): WhenBlock {
  return {
    heading: "Choose Harvous if…",
    body: getHarvousPosition(competitorType).chooseIf,
  };
}

/** Category SEO guides → Harvous positioning type (alternatives use the target’s type). */
const CATEGORY_HARVOUS_TYPE: Record<string, string> = {
  "best-bible-notes-apps": "Bible Notes",
  "best-sermon-notes-apps": "Bible Notes",
  "best-free-bible-notes-apps": "Bible Notes",
  "best-bible-study-notes-apps": "Bible Notes",
  "best-notion-bible-study-apps": "General Notes",
  "best-sermon-prep-tools": "Sermon Prep",
  "best-small-group-bible-study-apps": "Group Study",
  "best-church-bible-study-apps": "Group Study",
  "best-bible-study-apps-for-groups": "Group Study",
  "best-church-small-group-apps": "Small Groups",
  "best-scripture-notes-apps": "Bible Notes",
  "best-apps-to-remember-bible-study": "Bible Notes",
  "best-apps-to-connect-bible-study-notes": "Bible Notes",
  "best-bible-study-note-templates": "Bible Notes",
  "best-linked-bible-notes-apps": "General Notes",
  "best-bible-highlight-apps": "Bible Notes",
};

/** Alternatives whose target type isn’t the right Harvous lane (e.g. group guides targeting Notion/Docs). */
const ALTERNATIVE_HARVOUS_TYPE: Record<string, string> = {
  "notion-for-small-groups-alternative": "Group Study",
  "google-docs-bible-study-alternative": "Group Study",
  "planning-center-groups-alternative": "Small Groups",
  "band-alternative": "Small Groups",
  "flock-alternative": "Small Groups",
  "groupme-alternative": "Small Groups",
  "whatsapp-alternative": "Small Groups",
  "subsplash-groups-alternative": "Small Groups",
  "called-alternative": "Small Groups",
};

export function harvousTypeForSeoPage(page: CompareSeoPage): string {
  if (page.kind === "alternative") {
    return (
      ALTERNATIVE_HARVOUS_TYPE[page.slug] ??
      getCompareBySlug(page.targetSlug)?.competitorType ??
      "Bible Notes"
    );
  }
  return CATEGORY_HARVOUS_TYPE[page.slug] ?? "Bible Notes";
}

const SEO_PAGES: CompareSeoPage[] = [
  {
    kind: "category",
    slug: "best-bible-notes-apps",
    guideLabel: "Best Bible notes apps",
    guideDescription: "Curated shortlist for scripture-linked study notes",
    seoTitle: "Best Bible notes apps — Harvous",
    seoDescription:
      "Compare the best Bible notes apps for scripture-linked study notes — Harvous, Church Notes, Bible Note, Obsidian, and more. Notes-first, with Scripture built in.",
    h1: "Best Bible notes apps",
    lead: "Scripture-linked study notes — dedicated apps and tools people adapt. Harvous is notes-first, with the passage right there when you write.",
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
      chooseHarvous("Bible Notes"),
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
      chooseHarvous("Bible Study Suite"),
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
      chooseHarvous("Bible Reader"),
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
      chooseHarvous("General Notes"),
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
      chooseHarvous("Bible Notes"),
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
      "We built Harvous — so of course we care how this list reads. We didn’t put ourselves first: Church Notes (and transcription apps) own Sunday capture. Harvous is here if you want the notes you write to stay findable later — not AI transcription.",
    whenToChoose: [
      chooseHarvous("Bible Notes"),
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
      chooseHarvous("Bible Notes"),
      {
        heading: "Choose a free reader-plus-notes app if…",
        body: "You want sermon notes or SOAP templates with a Bible built in (Church Notes) — or a free general notes app (Apple Notes, Obsidian) you’ll customize yourself.",
      },
      {
        heading: "Choose a freemium transcription app if…",
        body: "You want AI sermon capture on a free tier — Bible Note and similar tools — knowing the product is built around transcription, not long-term written suggestions.",
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
      "Compare the best Bible study notes apps for scripture-linked reflections — Harvous, Church Notes, Bible Note, Obsidian, Logos, and more. Notes-first study, with Scripture built in.",
    h1: "Best Bible study notes apps",
    lead: "Apps for study notes linked to Scripture — dedicated tools and ones people adapt. Harvous is notes-first, with the passage right there when you write.",
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
      chooseHarvous("Bible Notes"),
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
      chooseHarvous("Bible Notes"),
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
      chooseHarvous("Bible Notes"),
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
      chooseHarvous("Bible Notes"),
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
      chooseHarvous("General Notes"),
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
      chooseHarvous("General Notes"),
      {
        heading: "Choose Apple Notes if…",
        body: "You want frictionless capture on Apple devices and don’t need native scripture linking or study-specific suggestions.",
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
      chooseHarvous("General Notes"),
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
    guideDescription: "Outline suites, sermon libraries, and notes-first prep — not listener sermon notes",
    seoTitle: "Best sermon prep tools — Harvous",
    seoDescription:
      "Compare the best sermon prep tools for pastors — Sermonary, Sermons.app, Sermons.com, Pulpit AI, Logos, and Harvous. Notes-first prep that compounds, not a manuscript suite or listener capture app.",
    h1: "Best sermon prep tools",
    lead: "Tools for preparing and writing sermons — dedicated outline apps, sermon libraries, AI coaches, and research suites. Harvous is notes-first prep you’ll find again next year — not podium mode, not listener sermon notes.",
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
      chooseHarvous("Sermon Prep"),
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
        heading: "Choose a sermon library if…",
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
      chooseHarvous("Sermon Prep"),
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
      chooseHarvous("Sermon Prep"),
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
    lead: "Sermons.com is a sermon library. These alternatives help you write and keep your own prep — or coach a draft — instead of only browsing illustrations.",
    pickSlugs: ["sermonary", "logos", "sermons-app", "pulpit-ai", "notion"],
    whenToChoose: [
      chooseHarvous("Sermon Prep"),
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
      chooseHarvous("Sermon Prep"),
      {
        heading: "Choose Pulpit AI if…",
        body: "You want an AI sermon assistant and a pipeline that turns one message into clips, guides, and midweek content.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-small-group-bible-study-apps",
    guideLabel: "Best small group Bible study apps",
    guideDescription: "Shared study trails for leaders and groups — not a ChMS",
    seoTitle: "Best small group Bible study apps — Harvous",
    seoDescription:
      "Compare the best small group Bible study apps for a lasting group trail — Harvous Shared Spaces, GroupMe, WhatsApp, Band, and Notion. Host with Harvous Plus; joining is free.",
    h1: "Best small group Bible study apps",
    lead: "Tools small groups adapt for shared study. Harvous keeps prep private and Shared Spaces for the room — host with Plus; join free.",
    pickSlugs: ["groupme", "whatsapp", "band", "notion", "church-notes"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We put it first because Shared Spaces give a group the same scripture-linked threads as personal prep — not chat, a wiki, or a ChMS. Host with Plus; join free.",
    whenToChoose: [
      chooseHarvous("Group Study"),
      {
        heading: "Choose GroupMe or WhatsApp if…",
        body: "You mainly need everyone in one chat for reminders, prayer requests, and quick shares — keep that for connection, and add a Shared Space when the study notes need a home.",
      },
      {
        heading: "Choose Band if…",
        body: "You want posts, calendars, and files in a free group hub with stronger admin controls than a plain messenger.",
      },
      {
        heading: "Choose Notion or Church Notes if…",
        body: "You already live in a wiki or want SOAP-plus-reader Sunday capture — different jobs than a lasting scripture-linked group trail.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-church-bible-study-apps",
    guideLabel: "Best church Bible study apps",
    guideDescription: "Class and group study notes — not Planning Center",
    seoTitle: "Best church Bible study apps — Harvous",
    seoDescription:
      "Compare church Bible study apps for classes and groups — Harvous Shared Spaces, Planning Center Groups, GroupMe, Church Notes, and YouVersion. Scripture-linked notes, a room for the group, and church-wide teaching plans.",
    h1: "Best church Bible study apps",
    lead: "Tools for class and group study — not a ChMS. Shared Spaces host the group; church teaching plans reach everyone connected.",
    pickSlugs: [
      "planning-center-groups",
      "groupme",
      "whatsapp",
      "church-notes",
      "youversion",
    ],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We put it first for scripture-linked notes, Shared Spaces, and church teaching plans — not attendance or Groups Resources. Hosting a space is Plus; joining is free.",
    whenToChoose: [
      chooseHarvous("Group Study"),
      {
        heading: "Choose Planning Center Groups if…",
        body: "You need rosters, attendance, Church Center, and Groups Resources — sharing curriculum and guides with one group or across group types from the church. Keep that for ops and distribution; use Harvous for the living study trail.",
      },
      {
        heading: "Choose Church Notes or YouVersion if…",
        body: "You want a reader, SOAP flow, or reading plans for the congregation more than a notes-first group trail leaders host themselves.",
      },
      {
        heading: "Choose a ChMS or planning tool if…",
        body: "You need rooms, schedules, and people databases — that’s a different job. Harvous sits beside those tools for study notes and Shared Spaces.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-bible-study-apps-for-groups",
    guideLabel: "Best Bible study apps for groups",
    guideDescription: "Group study with a trail that lasts — join free",
    seoTitle: "Best Bible study apps for groups — Harvous",
    seoDescription:
      "Compare the best Bible study apps for groups — Harvous Shared Spaces, GroupMe, WhatsApp, Band, and Notion. Joining a Shared Space is free; hosting is Harvous Plus.",
    h1: "Best Bible study apps for groups",
    lead: "Group Bible study needs a place after the meeting. Shared Spaces put everyone in the same threads — join free; host with Plus.",
    pickSlugs: ["groupme", "whatsapp", "band", "notion", "youversion"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We put it first because Shared Spaces keep what the group finds in scripture-linked threads — not buried in a chat scroll. Join free; host with Plus.",
    whenToChoose: [
      chooseHarvous("Group Study"),
      {
        heading: "Choose GroupMe, WhatsApp, or Band if…",
        body: "Day-to-day connection is the job — chat, reminders, and quick shares. Keep the messenger; add a Shared Space when Scripture notes need to last.",
      },
      {
        heading: "Choose a shared doc or wiki if…",
        body: "Your group already collaborates in Notion or Docs and doesn’t need native scripture pills or a study-shaped room.",
      },
      {
        heading: "Choose a Bible reader with plans if…",
        body: "Reading together on a plan is the main habit — keep that, and add a Shared Space when notes and questions need a lasting home.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "notion-for-small-groups-alternative",
    targetSlug: "notion",
    guideLabel: "Best Notion alternative for small groups",
    guideDescription: "Scripture-native group study without a Notion wiki",
    seoTitle: "Best Notion alternative for small group Bible study — Harvous",
    seoDescription:
      "Using Notion for small group Bible study? Compare Harvous Shared Spaces, Google Docs, Church Notes, YouVersion, and Obsidian — scripture-linked group trails without building and maintaining a Notion system.",
    h1: "Best Notion alternative for small group Bible study",
    lead: "Notion can hold a group wiki if you build it. These options are built for scripture-linked study when the trail needs to last.",
    pickSlugs: ["google-docs", "church-notes", "youversion", "obsidian", "pray-com"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. Keep Notion for docs and ops if it works. Harvous is for prep plus Shared Spaces with scripture pills — host with Plus, join free.",
    whenToChoose: [
      chooseHarvous("Group Study"),
      {
        heading: "Choose Notion if…",
        body: "You already run the group in Notion databases and templates — and you’re fine designing scripture linking and study structure yourself.",
      },
      {
        heading: "Choose Google Docs if…",
        body: "You want the simplest shared document and don’t need native scripture tools or a dedicated study room.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "google-docs-bible-study-alternative",
    targetSlug: "google-docs",
    guideLabel: "Best Google Docs alternative for Bible study",
    guideDescription: "Scripture-linked study without paste-and-pray docs",
    seoTitle: "Best Google Docs alternative for Bible study — Harvous",
    seoDescription:
      "Using Google Docs for Bible study or small groups? Compare Harvous Shared Spaces, Notion, Church Notes, Obsidian, and Apple Notes — scripture pills and threads instead of pasted verses in a doc.",
    h1: "Best Google Docs alternative for Bible study",
    lead: "Google Docs is familiar for shared writing. These options are built for scripture-linked study when paste-and-scroll stops scaling.",
    pickSlugs: ["notion", "church-notes", "obsidian", "apple-notes", "youversion"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. Docs still win for plain collaborative writing. Harvous is for scripture pills, threads, and Shared Spaces — host with Plus; join free.",
    whenToChoose: [
      chooseHarvous("Group Study"),
      {
        heading: "Choose Google Docs if…",
        body: "Everyone already has a Google account and you mainly need a shared outline or discussion doc — not native scripture linking.",
      },
      {
        heading: "Choose Notion if…",
        body: "You want databases, templates, and a fuller workspace for curriculum and ops as well as study notes.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-scripture-notes-apps",
    guideLabel: "Best scripture notes apps",
    guideDescription: "Inline scripture references in notes — not copy-paste",
    seoTitle: "Best scripture notes apps — Harvous",
    seoDescription:
      "Compare the best apps for scripture-linked notes — Harvous, Church Notes, Spirit Notes, Obsidian, and Logos. Type a reference, keep the verse in your writing — or open the chapter and write from there.",
    h1: "Best scripture notes apps",
    lead: "Notes where Scripture stays in the writing — dedicated apps and tools people adapt. Harvous turns typed references into scripture pills across 11 translations.",
    pickSlugs: [
      "church-notes",
      "spirit-notes",
      "bible-note",
      "obsidian",
      "logos",
      "notion",
    ],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We put it first because scripture pills are the spine: type a reference, open the verse in your note, or read the chapter and start a note from what you're reading — not a vault plugin you maintain yourself.",
    whenToChoose: [
      chooseHarvous("Bible Notes"),
      {
        heading: "Choose a study suite if…",
        body: "You need commentaries and original languages next to the text — Logos is built for that. Keep research there; use a notes-first app for the reflections you reopen.",
      },
      {
        heading: "Choose Obsidian or Notion if…",
        body: "You want maximum control and are willing to wire up scripture linking with plugins, databases, or paste.",
      },
      {
        heading: "Choose a reader-plus-notes app if…",
        body: "You want SOAP templates and a Bible in one church-focused app — Church Notes owns that bundle.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-apps-to-remember-bible-study",
    guideLabel: "Best apps to remember Bible study",
    guideDescription: "Resurface what you saved — not flashcards or plans",
    seoTitle: "Best apps to remember Bible study — Harvous",
    seoDescription:
      "Compare apps that help you remember Bible study — Harvous Suggestions, Bible Memory, YouVersion, Obsidian, and more. Resurface your own notes and highlights — not only reading plans or verse flashcards.",
    h1: "Best apps to remember Bible study",
    lead: "Remembering what you studied is a different job than capturing it. Harvous Suggestions resurface fading notes, highlights, and passages from your own library.",
    pickSlugs: [
      "bible-memory",
      "youversion",
      "obsidian",
      "apple-notes",
      "church-notes",
      "dwell",
    ],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We put it first because Suggestions bring back what you already wrote and highlighted — not a reading plan streak, not flashcards someone else authored.",
    whenToChoose: [
      chooseHarvous("Bible Notes"),
      {
        heading: "Choose a memory or flashcard app if…",
        body: "You want spaced repetition for verses — Bible Memory and similar tools are built for that drill. Pair one with Harvous when the notes around the verse matter too.",
      },
      {
        heading: "Choose a reader with plans if…",
        body: "Daily reading habits and streaks are the main goal — YouVersion or Dwell. Use a notes-first app when you care about finding your own past study again.",
      },
      {
        heading: "Choose a general notes app if…",
        body: "Search and backlinks are enough and you don’t need study-shaped resurfacing — Obsidian or Apple Notes can work if you maintain the system.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-apps-to-connect-bible-study-notes",
    guideLabel: "Best apps to connect Bible study notes",
    guideDescription: "Threads across weeks and themes — not folders alone",
    seoTitle: "Best apps to connect Bible study notes — Harvous",
    seoDescription:
      "Compare apps that connect Bible study notes across weeks and themes — Harvous Threads, Obsidian, Notion, Spirit Notes, and Church Notes. Build a trail, not a pile of scattered pages.",
    h1: "Best apps to connect Bible study notes",
    lead: "Connecting notes is a different job than capturing them. Harvous Threads let you link notes across folders — a book, a series, a theme — into a trail you can follow later.",
    pickSlugs: ["obsidian", "notion", "spirit-notes", "church-notes", "apple-notes", "logos"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We put it first because Threads are how you manually connect study notes across folders — a series or theme that stays together without building a vault graph yourself.",
    whenToChoose: [
      chooseHarvous("Bible Notes"),
      {
        heading: "Choose Obsidian if…",
        body: "You want full control over backlinks, plugins, and a personal knowledge graph — and you’re willing to configure Bible study workflows yourself.",
      },
      {
        heading: "Choose Notion if…",
        body: "You already live in databases and linked pages for life and study — and you’ll wire up connections and scripture yourself.",
      },
      {
        heading: "Choose folders-only notes if…",
        body: "Simple capture in Apple Notes or a reader-plus-notes app is enough and you don’t need a cross-folder study trail.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-bible-study-note-templates",
    guideLabel: "Best Bible study note templates",
    guideDescription: "Scaffolding for study and lesson prep — not SOAP lock-in",
    seoTitle: "Best Bible study note templates — Harvous",
    seoDescription:
      "Compare apps with Bible study note templates — Harvous, Church Notes, Notion, Sermonary, and Spirit Notes. Start with structure for lesson prep or study outlines without locking into a SOAP-plus-reader flow.",
    h1: "Best Bible study note templates",
    lead: "Structure helps on blank-page weeks. Harvous note templates give you a starting shape for lesson prep or study outlines — then you bend them. Scripture pills and threads still apply.",
    pickSlugs: ["church-notes", "notion", "sermonary", "spirit-notes", "obsidian", "apple-notes"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We put it first because templates are optional scaffolding on a notes-first app — not a required SOAP flow or a podium outline suite.",
    whenToChoose: [
      chooseHarvous("Bible Notes"),
      {
        heading: "Choose Church Notes if…",
        body: "You want built-in SOAP templates plus a Bible reader in one church-focused app.",
      },
      {
        heading: "Choose Sermonary if…",
        body: "You’re writing sermons and need block outlines and podium mode more than a flexible study notebook.",
      },
      {
        heading: "Choose Notion if…",
        body: "You already maintain custom template databases and want one workspace for life and study.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-linked-bible-notes-apps",
    guideLabel: "Best linked Bible notes apps",
    guideDescription: "Wiki-style @ mentions for study — without a custom vault",
    seoTitle: "Best linked Bible notes apps — Harvous",
    seoDescription:
      "Compare apps for linked Bible study notes — Harvous @ mentions, Obsidian, Notion, Reflect, and Apple Notes. Type @ to link notes, folders, and threads without building a PKM graph yourself.",
    h1: "Best linked Bible notes apps",
    lead: "Linked notes help study compound. Harvous lets you type @ to mention a note, folder, or thread as a pill — a study graph without maintaining Obsidian plugins or Notion databases.",
    pickSlugs: ["obsidian", "notion", "reflect", "apple-notes", "evernote", "spirit-notes"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We put it first because @ mentions ship for Bible study out of the box — notes, folders, and threads as pills — without a custom vault.",
    whenToChoose: [
      chooseHarvous("General Notes"),
      {
        heading: "Choose Obsidian if…",
        body: "You want local markdown, bidirectional links, and plugins — and you’re happy designing the Bible study graph yourself.",
      },
      {
        heading: "Choose Notion if…",
        body: "You want linked databases and pages for everything, not only study — and you’ll maintain the system.",
      },
      {
        heading: "Choose a simpler notes app if…",
        body: "Search alone is enough and you don’t need inline mentions between notes and threads.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-bible-highlight-apps",
    guideLabel: "Best Bible highlight apps",
    guideDescription: "Highlights and annotations you’ll find again",
    seoTitle: "Best Bible highlight apps — Harvous",
    seoDescription:
      "Compare apps for Bible highlights and annotations — Harvous, YouVersion, Logos, Church Notes, and Spirit Notes. Color-code phrases in notes and scripture, then find them again — not trapped in a reader.",
    h1: "Best Bible highlight apps",
    lead: "Highlights should lead somewhere. Harvous lets you color-code and annotate phrases in notes and inside scripture pills — then find them in the highlights view.",
    pickSlugs: [
      "youversion",
      "logos",
      "church-notes",
      "spirit-notes",
      "olive-tree",
      "bible-note",
    ],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We put it first because highlights live in a notes-first home — in your writing and inside scripture pills — with a dedicated view and Suggestions, not only marks inside a reader.",
    whenToChoose: [
      chooseHarvous("Bible Notes"),
      {
        heading: "Choose a Bible reader if…",
        body: "You mainly highlight while reading plans in YouVersion, Olive Tree, or similar — keep that habit, and use a notes app when annotations need to live with your written study.",
      },
      {
        heading: "Choose a study suite if…",
        body: "You need highlights next to commentaries and original languages — Logos is built for research-heavy marking.",
      },
      {
        heading: "Choose a reader-plus-notes app if…",
        body: "You want sermon notes, SOAP, and highlighting in one church-focused bundle — Church Notes owns that mix.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "pray-com-alternative",
    targetSlug: "pray-com",
    guideLabel: "Best Pray.com alternative for study notes",
    guideDescription: "Study notes beside prayer and bedtime Bible habits",
    seoTitle: "Best Pray.com alternative for Bible study notes — Harvous",
    seoDescription:
      "Looking for a Pray.com alternative for study notes? Compare Harvous, Hallow, Abide, YouVersion, and Church Notes — keep prayer rhythms where they work; use a notes-first app for scripture-linked study you’ll revisit.",
    h1: "Best Pray.com alternative for study notes",
    lead: "Pray.com owns shared prayer and bedtime Bible stories. These options cover study notes — or other prayer apps — when you want what you saved from Scripture to last.",
    pickSlugs: ["hallow", "abide", "youversion", "church-notes", "notion"],
    whenToChoose: [
      chooseHarvous("Prayer & Meditation"),
      {
        heading: "Choose Pray.com if…",
        body: "Shared prayers, bedtime stories, and community prayer habits are the main job — keep that rhythm. Pair a notes-first app when study reflections need a home.",
      },
      {
        heading: "Choose another prayer app if…",
        body: "You want a different guided prayer or meditation experience — Hallow, Abide, and peers — and still need somewhere else for long-term study notes.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "hallow-alternative",
    targetSlug: "hallow",
    guideLabel: "Best Hallow alternative for study notes",
    guideDescription: "Study notes beside guided prayer and meditation",
    seoTitle: "Best Hallow alternative for Bible study notes — Harvous",
    seoDescription:
      "Looking for a Hallow alternative for study notes? Compare Harvous, Pray.com, Abide, YouVersion, and Church Notes — keep guided prayer where it works; use a notes-first app for scripture-linked reflections you’ll reopen.",
    h1: "Best Hallow alternative for study notes",
    lead: "Hallow leads with guided prayer and meditation. These options cover study notes — or other prayer apps — when the reflections after quiet time need a lasting home.",
    pickSlugs: ["pray-com", "abide", "youversion", "church-notes", "notion"],
    whenToChoose: [
      chooseHarvous("Prayer & Meditation"),
      {
        heading: "Choose Hallow if…",
        body: "Guided prayer, meditation, and Catholic spiritual habits are the core product you want — not a scripture-linked study notebook.",
      },
      {
        heading: "Choose another prayer or reader app if…",
        body: "You want a different daily rhythm — Pray.com, Abide, or YouVersion — and still need a separate place for notes you’ll find again.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "goodnotes-alternative",
    targetSlug: "goodnotes",
    guideLabel: "Best GoodNotes alternative for Bible study",
    guideDescription: "Typed scripture-linked notes beyond iPad handwriting",
    seoTitle: "Best GoodNotes alternative for Bible study notes — Harvous",
    seoDescription:
      "Using GoodNotes for Bible study? Compare Harvous, Church Notes, Spirit Notes, Apple Notes, and Obsidian — scripture-linked typed notes you’ll find across devices, not only handwriting on an iPad.",
    h1: "Best GoodNotes alternative for Bible study",
    lead: "GoodNotes shines for handwriting on an iPad. These options are built for scripture-linked study notes you’ll search and reopen across devices.",
    pickSlugs: ["church-notes", "spirit-notes", "apple-notes", "obsidian", "notion"],
    whenToChoose: [
      chooseHarvous("General Notes"),
      {
        heading: "Choose GoodNotes if…",
        body: "Handwriting and freeform pages on an iPad are how you study — and you don’t need native scripture linking or cross-device study threads.",
      },
      {
        heading: "Choose Apple Notes if…",
        body: "You want quick typed capture on Apple devices without a study-specific tool.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "faithstudy-alternative",
    targetSlug: "faithstudy",
    guideLabel: "Best FaithStudy alternative",
    guideDescription: "Personal notes that outlast a course player",
    seoTitle: "Best FaithStudy alternative for study notes — Harvous",
    seoDescription:
      "Looking for a FaithStudy alternative for notes? Compare Harvous, BibleProject, Through the Word, Logos, and Notion — personal scripture-linked notes beside courses and teaching content.",
    h1: "Best FaithStudy alternative for study notes",
    lead: "FaithStudy and peers own courses and teaching content. These options hold personal scripture-linked notes that last after the lesson ends.",
    pickSlugs: ["bibleproject", "through-the-word", "logos", "notion", "church-notes"],
    whenToChoose: [
      chooseHarvous("Bible Education"),
      {
        heading: "Choose FaithStudy if…",
        body: "Structured courses and teaching content are the main product — keep learning there, and use a notes-first app for what you want to reopen later.",
      },
      {
        heading: "Choose another education app if…",
        body: "You want video series, guided lessons, or a different curriculum player — BibleProject, Through the Word, and peers — with notes living elsewhere.",
      },
    ],
  },
  {
    kind: "category",
    slug: "best-church-small-group-apps",
    guideLabel: "Best church small group apps",
    guideDescription: "Messengers, ChMS groups, and study trails — honest jobs",
    seoTitle: "Best church small group apps — Harvous",
    seoDescription:
      "Compare church small group apps — GroupMe, WhatsApp, Band, Planning Center Groups, Flock, Subsplash Groups, and Harvous Shared Spaces. Keep chat where it works; use Harvous for the study trail.",
    h1: "Best church small group apps",
    lead: "Groups already stay connected in chat. Harvous Shared Spaces own the scripture-linked trail — host with Plus, join free.",
    pickSlugs: [
      "groupme",
      "whatsapp",
      "band",
      "planning-center-groups",
      "flock",
      "subsplash-groups",
    ],
    honestNote:
      "We built Harvous — so of course we care how this list reads. We didn’t put ourselves first: messengers own connection; Planning Center owns ops. Harvous is here for the study trail beside those tools.",
    whenToChoose: [
      chooseHarvous("Small Groups"),
      {
        heading: "Choose GroupMe or WhatsApp if…",
        body: "You need a free messenger everyone already has — reminders, prayer requests, photos, and quick shares between meetings.",
      },
      {
        heading: "Choose Band or Subsplash Groups if…",
        body: "You want a fuller group hub — posts, calendars, files, or a branded church-app channel — with more structure than a plain chat.",
      },
      {
        heading: "Choose Planning Center Groups if…",
        body: "You need church-wide group management, attendance, and Groups Resources — pushing shared curriculum from the church.",
      },
      {
        heading: "Choose Flock if…",
        body: "Prayer walls, care alerts, and shepherding visibility matter more than a notes-first study room.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "planning-center-groups-alternative",
    targetSlug: "planning-center-groups",
    guideLabel: "Best Planning Center Groups alternative for study notes",
    guideDescription: "Study trails beside Planning Center — not a ChMS swap",
    seoTitle: "Best Planning Center Groups alternative for study notes — Harvous",
    seoDescription:
      "Looking for a Planning Center Groups alternative for Bible study notes? Compare Harvous Shared Spaces, GroupMe, WhatsApp, Band, and Flock — keep Planning Center for rosters and Resources; use Harvous for the study trail.",
    h1: "Best Planning Center Groups alternative for study notes",
    lead: "Planning Center Groups owns rosters, attendance, and Groups Resources. These options cover chat — or a study trail — beside Planning Center, not instead of it.",
    pickSlugs: ["groupme", "whatsapp", "band", "flock", "subsplash-groups"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. Keep Planning Center for people, rooms, and Groups Resources. Shared Spaces are for the study trail (host with Plus, join free). Org curriculum is on our roadmap.",
    whenToChoose: [
      chooseHarvous("Small Groups"),
      {
        heading: "Choose Planning Center Groups if…",
        body: "You need church-wide group admin, attendance, and Groups Resources — Harvous is not that ChMS replacement.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "band-alternative",
    targetSlug: "band",
    guideLabel: "Best Band alternative for Bible study notes",
    guideDescription: "Study notes beside Band’s group hub",
    seoTitle: "Best Band alternative for Bible study notes — Harvous",
    seoDescription:
      "Using Band for your small group? Compare Harvous Shared Spaces, GroupMe, WhatsApp, Planning Center Groups, and Flock — keep Band for chat and calendars; use a scripture-linked trail for what you studied.",
    h1: "Best Band alternative for Bible study notes",
    lead: "Band wins at free group posts, calendars, and files. These options cover other messengers — or Shared Spaces for study notes.",
    pickSlugs: ["groupme", "whatsapp", "planning-center-groups", "flock", "subsplash-groups"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. Keep Band for posts and files. Harvous Shared Spaces are for the study trail — host with Plus, join free.",
    whenToChoose: [
      chooseHarvous("Small Groups"),
      {
        heading: "Choose Band if…",
        body: "You need a free hub for announcements, calendars, and files so the whole group stays coordinated.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "flock-alternative",
    targetSlug: "flock",
    guideLabel: "Best Flock alternative for study notes",
    guideDescription: "Study trails beside group care and prayer tools",
    seoTitle: "Best Flock alternative for Bible study notes — Harvous",
    seoDescription:
      "Looking for a Flock alternative for study notes? Compare Harvous Shared Spaces, GroupMe, WhatsApp, Band, and Planning Center Groups — keep Flock for prayer and care; use Harvous for the scripture-linked trail.",
    h1: "Best Flock alternative for study notes",
    lead: "Flock focuses on prayer and care between Sundays. These options cover messengers — or Shared Spaces for what the group studied.",
    pickSlugs: ["groupme", "whatsapp", "band", "planning-center-groups", "subsplash-groups"],
    whenToChoose: [
      chooseHarvous("Small Groups"),
      {
        heading: "Choose Flock if…",
        body: "Prayer walls, at-risk alerts, and shepherding midweek are the primary job — keep that care layer.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "groupme-alternative",
    targetSlug: "groupme",
    guideLabel: "Best GroupMe alternative for Bible study notes",
    guideDescription: "Study trails beside the chat your group already uses",
    seoTitle: "Best GroupMe alternative for Bible study notes — Harvous",
    seoDescription:
      "Using GroupMe for your small group? Compare Harvous Shared Spaces, WhatsApp, Band, Planning Center Groups, and Flock — keep GroupMe for chat; use a scripture-linked trail for what you studied.",
    h1: "Best GroupMe alternative for Bible study notes",
    lead: "GroupMe is where many church groups already talk. These options cover other messengers — or Shared Spaces when study notes need to last.",
    pickSlugs: ["whatsapp", "band", "planning-center-groups", "flock", "subsplash-groups"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. Keep GroupMe for chat. Harvous Shared Spaces are for study notes that disappear in the thread — host with Plus, join free.",
    whenToChoose: [
      chooseHarvous("Small Groups"),
      {
        heading: "Choose GroupMe if…",
        body: "You need a free group chat everyone can join fast — polls, photos, and files without another church login.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "whatsapp-alternative",
    targetSlug: "whatsapp",
    guideLabel: "Best WhatsApp alternative for Bible study notes",
    guideDescription: "Study trails beside everyday messaging groups",
    seoTitle: "Best WhatsApp alternative for Bible study notes — Harvous",
    seoDescription:
      "Using WhatsApp for your small group? Compare Harvous Shared Spaces, GroupMe, Band, Planning Center Groups, and Flock — keep WhatsApp for messaging; use a scripture-linked trail for what you studied.",
    h1: "Best WhatsApp alternative for Bible study notes",
    lead: "WhatsApp is the messenger many groups already have. These options cover other chats — or Shared Spaces for scripture-linked notes.",
    pickSlugs: ["groupme", "band", "planning-center-groups", "flock", "subsplash-groups"],
    honestNote:
      "We built Harvous — so of course we care how this list reads. Keep WhatsApp for connection. Harvous Shared Spaces are for the study trail — host with Plus, join free.",
    whenToChoose: [
      chooseHarvous("Small Groups"),
      {
        heading: "Choose WhatsApp if…",
        body: "Your group already messages there for family and friends — and you want zero friction for midweek connection.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "subsplash-groups-alternative",
    targetSlug: "subsplash-groups",
    guideLabel: "Best Subsplash Groups alternative for study notes",
    guideDescription: "Study trails beside church-app groups and messaging",
    seoTitle: "Best Subsplash Groups alternative for study notes — Harvous",
    seoDescription:
      "Using Subsplash Groups? Compare Harvous Shared Spaces, GroupMe, WhatsApp, Band, and Planning Center Groups — keep the church app for messaging; use Harvous for scripture-linked study notes.",
    h1: "Best Subsplash Groups alternative for study notes",
    lead: "Subsplash Groups live inside a branded church app. These options cover messengers — or Shared Spaces for study notes.",
    pickSlugs: ["groupme", "whatsapp", "band", "planning-center-groups", "flock"],
    whenToChoose: [
      chooseHarvous("Small Groups"),
      {
        heading: "Choose Subsplash Groups if…",
        body: "You want group finder, messaging, and attendance inside the same branded church app as media and giving.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "called-alternative",
    targetSlug: "called",
    guideLabel: "Best Called alternative for study notes",
    guideDescription: "Study notes beside ministry community platforms",
    seoTitle: "Best Called alternative for Bible study notes — Harvous",
    seoDescription:
      "Looking for a Called alternative for study notes? Compare Harvous Shared Spaces, GroupMe, WhatsApp, Band, and Planning Center Groups — keep Called for community and care; use Harvous for the study trail.",
    h1: "Best Called alternative for study notes",
    lead: "Called is built for ministry community and follow-up. These options cover chat and care — or Shared Spaces for study notes.",
    pickSlugs: ["groupme", "whatsapp", "band", "planning-center-groups", "flock"],
    whenToChoose: [
      chooseHarvous("Small Groups"),
      {
        heading: "Choose Called if…",
        body: "You want a ministry-shaped GroupMe replacement with engagement visibility and safe community tools.",
      },
    ],
  },
];

function harvousPick(competitorType = "Bible Notes"): ComparePick {
  const position = getHarvousPosition(competitorType);
  return {
    slug: "harvous",
    name: "Harvous",
    intro: position.pickIntro,
    competitorType,
    competitorImage: "/images/harvous-2-icon.png",
    competitorLink: "https://app.harvous.com/sign-up",
    idealFor: position.idealFor,
    bestAt: position.bestAt,
    drawback: position.tradeoff,
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
    return "Notes are secondary to reading — not built for long-term suggestions of your own study";
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
  if (entry.competitorType === "Small Groups") {
    return "Built for rosters, chat, care, or church-app groups — not a scripture-linked study trail";
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
export function resolvePickSlugs(slugs: string[], competitorType = "Bible Notes"): ComparePick[] {
  const hasExplicitHarvous = slugs.includes("harvous");
  const ordered = hasExplicitHarvous ? slugs : ["harvous", ...slugs];
  const picks: ComparePick[] = [];

  for (const slug of ordered) {
    if (slug === "harvous") {
      if (!picks.some((p) => p.isHarvous)) picks.push(harvousPick(competitorType));
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
