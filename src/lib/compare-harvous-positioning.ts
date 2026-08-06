/**
 * Category-aware Harvous positioning for compare pages.
 * Keyed by competitorType from data/compare.csv — not a single global pitch.
 */

export type CompareTableRow = {
  label: string;
  harvous: string;
  competitorHint: string;
};

export type HarvousPosition = {
  /** “Choose Harvous if…” */
  chooseIf: string;
  bestAt: string;
  primaryUse: string;
  idealFor: string;
  /** Honest “Harvous isn’t for…” / tradeoff */
  tradeoff: string;
  /** Clause after “Harvous ” in composed intros */
  introHalf: string;
  /** Shortlist card intro on SEO guides */
  pickIntro: string;
  /** Closing CTA mode on vs pages */
  ctaMode: "alongside" | "peer";
  /** One-liner above hub category carousels */
  hubLane: string;
  /** Extra side-by-side rows (beyond Best at / Primary use / Ideal for) */
  tableRows: CompareTableRow[];
  /** Feature page ids for proof links under Choose Harvous */
  featureIds: string[];
};

export const COMPARE_FEATURE_LABELS: Record<string, string> = {
  "scripture-pills": "Scripture pills",
  threads: "Threads",
  recall: "Recall",
  highlights: "Highlights",
  "note-templates": "Note templates",
  sharing: "Sharing",
  dictionary: "Dictionary",
};

const POSITIONS: Record<string, HarvousPosition> = {
  "Bible Reader": {
    chooseIf:
      "You like your Bible app for reading plans and community, and you want a separate home for what you write — scripture pills, threads, and Recall — without switching your whole reading habit.",
    bestAt: "Long-term study notes that sit beside your Bible reader",
    primaryUse: "Scripture-linked notes, highlights, and threads you’ll reopen later",
    idealFor: "People who already have a reader and need notes that outgrow it",
    tradeoff: "Not a Bible reader — no reading plans, audio Bible, or in-app community feed.",
    introHalf:
      "is the notes home that sits beside your reader — scripture pills, threads, and Recall for what you write.",
    pickIntro:
      "Notes beside your Bible reader — scripture pills, threads, and Recall. Keep reading where you already do.",
    ctaMode: "alongside",
    hubLane: "In this lane, Harvous is the notes home beside your reader — not a replacement for plans or audio.",
    tableRows: [
      {
        label: "Reading plans & community",
        harvous: "No — keep that in your reader",
        competitorHint: "Often the core product",
      },
      {
        label: "Notes depth",
        harvous: "Built for written study you’ll find again",
        competitorHint: "Usually secondary to reading",
      },
      {
        label: "How they fit",
        harvous: "Complements the reader you already use",
        competitorHint: "Primary place to read Scripture",
      },
    ],
    featureIds: ["scripture-pills", "threads", "recall"],
  },

  "Bible Study Suite": {
    chooseIf:
      "You use a research suite for commentaries and languages, and you want a lighter place for the personal notes you actually reopen — scripture-linked, threaded, findable without the full library tax.",
    bestAt: "Personal scripture-linked notes beside a research library",
    primaryUse: "Study notes, series threads, and Recall next to Logos-class tools",
    idealFor: "People who keep a suite for research and need notes that stay light",
    tradeoff: "Not a research library — no commentaries, original-language tools, or purchased modules.",
    introHalf:
      "keeps the personal notes trail beside your research suite — scripture-linked, lighter, findable later.",
    pickIntro:
      "Personal scripture-linked notes beside a study suite — pills, threads, and Recall without the full library.",
    ctaMode: "alongside",
    hubLane: "In this lane, Harvous holds personal notes beside the suite — research stays where it is.",
    tableRows: [
      {
        label: "Research library",
        harvous: "No — keep commentaries in the suite",
        competitorHint: "Commentaries, languages, modules",
      },
      {
        label: "Personal notes trail",
        harvous: "Primary job — pills, threads, Recall",
        competitorHint: "Notes exist, but the suite leads",
      },
      {
        label: "Weight & cost posture",
        harvous: "Lightweight notes app",
        competitorHint: "Heavier scholarly platform",
      },
    ],
    featureIds: ["scripture-pills", "threads", "recall"],
  },

  "General Notes": {
    chooseIf:
      "You want scripture-native linking and study recall without building a Bible study system in Obsidian, Notion, or a general notes app — pills, threads, and highlights that understand references.",
    bestAt: "Scripture-native notes without a custom PKM setup",
    primaryUse: "Bible study notes with pills, highlights, threads, and Recall out of the box",
    idealFor: "People who tried general notes for Bible study and don’t want to maintain the system",
    tradeoff: "Not a general PKM — weaker if you need one vault for every life domain and custom plugins.",
    introHalf:
      "ships scripture-native pills, threads, and Recall — without building a Bible study system yourself.",
    pickIntro:
      "Purpose-built scripture notes — pills, threads, and Recall without a custom vault or workspace.",
    ctaMode: "peer",
    hubLane: "In this lane, Harvous is scripture-native notes — not a blank PKM you configure for Bible study.",
    tableRows: [
      {
        label: "Native scripture linking",
        harvous: "Yes — type a reference, get a pill",
        competitorHint: "You wire references up yourself",
      },
      {
        label: "Study-oriented recall",
        harvous: "Recall across what you saved from Scripture",
        competitorHint: "Search/backlinks, not study-specific",
      },
      {
        label: "Setup burden",
        harvous: "Ready for Bible study on day one",
        competitorHint: "Flexible — you design the system",
      },
    ],
    featureIds: ["scripture-pills", "threads", "recall"],
  },

  "Bible Notes": {
    chooseIf:
      "You want a dedicated Bible notes app built around threading, scripture pills, highlights, and Recall — not live sermon transcription, SOAP-plus-reader bundles, or handwriting-first journals.",
    bestAt: "Threading and recalling written scripture-linked study notes",
    primaryUse: "Bible study notes with pills, highlights, threads, @ mentions, and Recall",
    idealFor: "People choosing among Bible notes apps who care most about finding what they wrote later",
    tradeoff: "No built-in Bible reader, live transcription, or handwriting canvas.",
    introHalf:
      "focuses on threading and Recall for notes you write — pills and highlights, not transcription or a bundled reader.",
    pickIntro:
      "Bible study notes with scripture pills, highlights, threads, and Recall — not a reader or transcription app.",
    ctaMode: "peer",
    hubLane: "In this lane, Harvous competes on threads, pills, and Recall — not transcription or a reader bundle.",
    tableRows: [
      {
        label: "Transcription / live capture",
        harvous: "No — written notes you author",
        competitorHint: "Some apps lead with this",
      },
      {
        label: "Threading & recall",
        harvous: "Threads, @ mentions, and Recall",
        competitorHint: "Varies by product",
      },
      {
        label: "Reader bundled",
        harvous: "No — sits beside your Bible app",
        competitorHint: "Some include a reader or SOAP flow",
      },
    ],
    featureIds: ["scripture-pills", "threads", "recall", "highlights"],
  },

  "Sermon Prep": {
    chooseIf:
      "You want scripture-linked prep notes and series threads that last across the preaching year — beside an outline suite or research tool, not instead of podium mode or an illustration library.",
    bestAt: "Series memory and scripture-linked prep you’ll find next year",
    primaryUse: "Outline notes, series threads, and Recall across years of preaching",
    idealFor: "Pastors and teachers who need prep notes to compound, not only this week’s manuscript",
    tradeoff: "Not a podium/outline suite, AI sermon coach, or illustration marketplace.",
    introHalf:
      "keeps scripture-linked prep notes and series threads findable across the preaching year.",
    pickIntro:
      "Scripture-linked prep notes and series memory — beside outline suites and research tools, not podium mode.",
    ctaMode: "alongside",
    hubLane: "In this lane, Harvous is prep memory and series threads — not outlines, podium, or AI drafting.",
    tableRows: [
      {
        label: "Outline / podium",
        harvous: "No — write notes, not a preaching view",
        competitorHint: "Often the core product",
      },
      {
        label: "Series threads",
        harvous: "Yes — thread a series across weeks",
        competitorHint: "Usually file- or sermon-scoped",
      },
      {
        label: "Prep memory across years",
        harvous: "Recall when a text comes around again",
        competitorHint: "Varies — often this week’s draft",
      },
    ],
    featureIds: ["scripture-pills", "threads", "recall", "note-templates"],
  },

  "AI Guided Bible": {
    chooseIf:
      "You want a human-authored record of what you studied — scripture pills, threads, and Recall — more than AI-led reading, chat, or generated journeys.",
    bestAt: "Keeping your own written reflections findable later",
    primaryUse: "Notes you write and revisit, linked to Scripture",
    idealFor: "People who use AI guides for prompts but want their own notes to last",
    tradeoff: "Not an AI Bible chat, generated study path, or automated devotion engine.",
    introHalf:
      "keeps the notes you write — scripture-linked and findable — rather than centering AI-led reading.",
    pickIntro:
      "Your written study notes, linked to Scripture and findable later — not an AI reading guide.",
    ctaMode: "alongside",
    hubLane: "In this lane, Harvous keeps your written reflections — AI guides can stay for prompts.",
    tableRows: [
      {
        label: "AI-led reading / chat",
        harvous: "No — you author the notes",
        competitorHint: "Often the core product",
      },
      {
        label: "Your written record",
        harvous: "Primary — pills, threads, Recall",
        competitorHint: "Secondary to AI guidance",
      },
      {
        label: "Long-term revisit",
        harvous: "Built to find what you saved",
        competitorHint: "Session- or journey-oriented",
      },
    ],
    featureIds: ["scripture-pills", "threads", "recall"],
  },

  "Prayer & Meditation": {
    chooseIf:
      "You use a prayer or meditation app for daily rhythms, and you want somewhere else for study notes and scripture connections you’ll revisit — not another guided audio feed.",
    bestAt: "Study notes you’ll reopen after the quiet time ends",
    primaryUse: "Scripture-linked notes and highlights from what you noticed in prayer or reading",
    idealFor: "People whose prayer app owns the rhythm and who still want lasting study notes",
    tradeoff: "Not a prayer timer, sleep stories, or guided meditation library.",
    introHalf:
      "is for the study notes that outlast a meditation — scripture-linked, not another guided audio feed.",
    pickIntro:
      "Study notes you’ll revisit — scripture pills and threads beside your prayer or meditation app.",
    ctaMode: "alongside",
    hubLane: "In this lane, Harvous is for study notes after the quiet — prayer apps own the rhythm.",
    tableRows: [
      {
        label: "Guided prayer / audio",
        harvous: "No — not a prayer app",
        competitorHint: "Core product for many",
      },
      {
        label: "Study notes trail",
        harvous: "Yes — pills, highlights, Recall",
        competitorHint: "Usually light or journal-only",
      },
      {
        label: "Primary job",
        harvous: "Remember what you saved from study",
        competitorHint: "Daily prayer and meditation habits",
      },
    ],
    featureIds: ["scripture-pills", "highlights", "recall"],
  },

  "Bible Education": {
    chooseIf:
      "You’re in a course, curriculum, or teaching context and want personal scripture-linked notes that last after the lesson ends — pills, threads, and Recall beside the content.",
    bestAt: "Personal notes that outlast a course or curriculum module",
    primaryUse: "Scripture-linked study notes alongside teaching content",
    idealFor: "Learners and teachers who want notes that aren’t trapped in a course player",
    tradeoff: "Not a course platform, video library, or graded curriculum system.",
    introHalf:
      "holds personal scripture-linked notes beside courses and curriculum — findable after the lesson ends.",
    pickIntro:
      "Personal scripture-linked notes beside Bible education content — not a course player.",
    ctaMode: "alongside",
    hubLane: "In this lane, Harvous is personal notes beside the course — education apps own the content.",
    tableRows: [
      {
        label: "Courses / curriculum",
        harvous: "No — bring your own teaching context",
        competitorHint: "Often the core product",
      },
      {
        label: "Personal notes",
        harvous: "Primary — pills, threads, Recall",
        competitorHint: "Notes inside the course, if any",
      },
      {
        label: "After the lesson",
        harvous: "Notes stay in your study home",
        competitorHint: "Content access may end with the course",
      },
    ],
    featureIds: ["scripture-pills", "threads", "recall"],
  },

  /** SEO guides for small groups / church classes (docs, Notion, readers). */
  "Group Study": {
    chooseIf:
      "You want personal prep plus a Shared Space where the group adds to the same threads — host with Plus; joining is free.",
    bestAt: "Group study trails on the same pills and threads as personal prep",
    primaryUse: "Private prep notes and Shared Spaces for classes and small groups",
    idealFor: "Leaders and classes that need a lasting trail after the meeting",
    tradeoff: "A study tool, not a ChMS — attendance and giving stay where they are.",
    introHalf: "keeps Shared Spaces for the group trail — host with Plus, join free.",
    pickIntro: "Personal prep plus Shared Spaces for the group — host with Plus; join free.",
    ctaMode: "alongside",
    hubLane: "In this lane, Harvous is personal notes plus Shared Spaces — not a ChMS.",
    tableRows: [
      {
        label: "Group shared study",
        harvous: "Shared Spaces — same threads for the room",
        competitorHint: "Docs, wikis, plans, or chat — varies",
      },
      {
        label: "Scripture-linked notes",
        harvous: "Pills, threads, highlights out of the box",
        competitorHint: "Often paste or DIY linking",
      },
      {
        label: "Church org / ChMS",
        harvous: "Church curriculum yes; ChMS no",
        competitorHint: "Some tools own attendance or plans",
      },
    ],
    featureIds: ["scripture-pills", "threads", "sharing", "note-templates"],
  },

  /** CSV type: Planning Center Groups, Band, GroupMe, WhatsApp, Flock, Subsplash, Called. */
  "Small Groups": {
    chooseIf:
      "Your group already chats elsewhere, and you want Shared Spaces for the study trail. Host with Plus; joining is free.",
    bestAt: "Scripture-linked study trails beside the chat tools groups already use",
    primaryUse: "Shared Spaces for notes and threads after the meeting",
    idealFor: "Leaders whose group lives in a messenger and loses the study trail",
    tradeoff: "A study tool, not group chat or a rostering system.",
    introHalf: "keeps Shared Spaces for the study trail.",
    pickIntro: "Shared Spaces for the study trail beside chat. Host with Plus; join free.",
    ctaMode: "alongside",
    hubLane: "In this lane, Harvous sits beside messengers — Shared Spaces for the study trail, not chat or ChMS.",
    tableRows: [
      {
        label: "Group chat & logistics",
        harvous: "No — keep GroupMe, WhatsApp, or Band",
        competitorHint: "Where most groups already live",
      },
      {
        label: "Rosters / resources / ChMS",
        harvous: "Church curriculum yes; rosters keep Planning Center",
        competitorHint: "Church admin and shared packs",
      },
      {
        label: "Scripture-linked study trail",
        harvous: "Primary — Shared Spaces, pills, threads",
        competitorHint: "Usually buried in the chat scroll",
      },
    ],
    featureIds: ["scripture-pills", "threads", "sharing", "note-templates"],
  },
};

const FALLBACK = POSITIONS["Bible Notes"];

export function getHarvousPosition(competitorType: string): HarvousPosition {
  return POSITIONS[competitorType] ?? FALLBACK;
}

/** Hub / SEO lane blurb for a competitor type. */
export function getHarvousHubLane(competitorType: string): string {
  return getHarvousPosition(competitorType).hubLane;
}

/**
 * Keep the competitor-specific first clause from CSV; replace the formulaic Harvous half.
 * Expected shape: "{Competitor…}; Harvous {formulaic…}"
 */
export function composeCompareIntro(csvIntro: string, competitorType: string): string {
  const { introHalf } = getHarvousPosition(competitorType);
  const match = csvIntro.match(/^(.*?);\s*Harvous\b[\s\S]*$/i);
  if (match?.[1]?.trim()) {
    return `${match[1].trim()}; Harvous ${introHalf}`;
  }
  return csvIntro;
}

export function getCompareCtaHeading(competitorName: string, competitorType: string): string {
  const { ctaMode } = getHarvousPosition(competitorType);
  if (ctaMode === "peer") {
    return `See if Harvous fits next to ${competitorName}.`;
  }
  return `Harvous works alongside ${competitorName}.`;
}

export function featureLabel(id: string): string {
  return COMPARE_FEATURE_LABELS[id] ?? id;
}
