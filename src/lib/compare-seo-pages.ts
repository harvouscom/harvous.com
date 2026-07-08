import { getCompareBySlug, type CompareEntry } from "./compare-data.ts";

const SITE = "https://harvous.com";

export const HARVOUS_PITCH =
  "You want a notes-first Bible study app — no built-in Bible reader, no sermon transcription — focused on remembering and reconnecting with what you saved.";

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
};

export type CompareCategorySeoPage = CompareSeoPageBase & {
  kind: "category";
  pickSlugs: string[];
};

export type CompareAlternativeSeoPage = CompareSeoPageBase & {
  kind: "alternative";
  targetSlug: string;
  pickSlugs: string[];
};

export type CompareSeoPage = CompareCategorySeoPage | CompareAlternativeSeoPage;

const SEO_PAGES: CompareSeoPage[] = [
  {
    kind: "category",
    slug: "best-bible-notes-apps",
    draft: true,
    guideLabel: "Best Bible notes apps",
    guideDescription: "Curated shortlist for scripture-linked study notes",
    seoTitle: "Best Bible notes apps — Harvous",
    seoDescription:
      "Compare the best Bible notes apps for scripture-linked study notes — Harvous, Bible Note, Obsidian, Notion, Logos, and more. Notes-first, not a Bible reader.",
    h1: "Best Bible notes apps",
    lead: "Looking for a Bible notes app? These tools help you capture, organize, and find what you saved from Scripture — from dedicated Bible note apps to general notes tools people adapt for study.",
    pickSlugs: [
      "bible-note",
      "bible-notes",
      "pencil-bible",
      "spirit-notes",
      "obsidian",
      "notion",
      "apple-notes",
      "evernote",
      "logos",
    ],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose a Bible reader if…",
        body: "You mainly need to read Scripture in many translations with reading plans and devotionals — YouVersion, Bible Gateway, or Olive Tree are built for that.",
      },
      {
        heading: "Choose a general notes app if…",
        body: "You already live in Obsidian, Notion, or Apple Notes and want maximum flexibility — but you'll wire up scripture references yourself.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "logos-alternative",
    targetSlug: "logos",
    draft: true,
    guideLabel: "Best Logos alternative",
    guideDescription: "Lighter, notes-first options for Bible study",
    seoTitle: "Best Logos alternative for Bible study notes — Harvous",
    seoDescription:
      "Looking for a Logos alternative? Compare Harvous, Olive Tree, Accordance, Blue Letter Bible, and Obsidian for Bible study notes — lighter, notes-first options.",
    h1: "Best Logos alternative",
    lead: "Logos is built for deep Bible study with original languages, commentaries, and a massive library. If you want something lighter and notes-first — or a place to remember what you saved from Logos — these are worth a look.",
    pickSlugs: ["olive-tree", "accordance", "blue-letter-bible", "obsidian"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose Logos if…",
        body: "You need scholarly tools, original languages, commentaries, and a full digital library — Logos is still the standard for seminary-level study.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "youversion-alternative",
    targetSlug: "youversion",
    draft: true,
    guideLabel: "Best YouVersion alternative",
    guideDescription: "Beyond reading plans — dedicated study notes",
    seoTitle: "Best YouVersion alternative for Bible study notes — Harvous",
    seoDescription:
      "Looking for a YouVersion alternative? Compare Harvous, Bible Gateway, ESV Bible, Olive Tree, and Logos — options beyond reading plans and devotionals.",
    h1: "Best YouVersion alternative",
    lead: "YouVersion is the most popular Bible reader — reading plans, devotionals, and community. If you need a dedicated place for study notes that stay linked to Scripture, these alternatives serve a different job.",
    pickSlugs: ["bible-gateway", "esv-bible", "olive-tree", "logos"],
    whenToChoose: [
      {
        heading: "Choose Harvous if…",
        body: HARVOUS_PITCH,
      },
      {
        heading: "Choose YouVersion if…",
        body: "You want a free Bible reader with reading plans, audio, and social features — YouVersion excels at daily reading habits.",
      },
    ],
  },
  {
    kind: "alternative",
    slug: "obsidian-alternative",
    targetSlug: "obsidian",
    draft: true,
    guideLabel: "Best Obsidian alternative",
    guideDescription: "Purpose-built scripture notes without a custom vault",
    seoTitle: "Best Obsidian alternative for Bible study notes — Harvous",
    seoDescription:
      "Using Obsidian for Bible study? Compare Harvous, Notion, Evernote, Apple Notes, and Logos — apps built for scripture-linked notes without building your own system.",
    h1: "Best Obsidian alternative for Bible study",
    lead: "Obsidian is powerful for linked notes — many people build elaborate Bible study vaults. If you want scripture references, highlights, and recall without maintaining a custom setup, these options are purpose-built.",
    pickSlugs: ["notion", "evernote", "apple-notes", "logos"],
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
    draft: true,
    guideLabel: "Best Bible Note alternative",
    guideDescription: "Notes-first without sermon transcription",
    seoTitle: "Best Bible Note alternative — Harvous",
    seoDescription:
      "Looking for a Bible Note alternative? Compare Harvous, Bible Notes, Spirit Notes, Pencil Bible, and Logos — notes-first options without sermon transcription.",
    h1: "Best Bible Note alternative",
    lead: "Bible Note focuses on AI sermon transcription and flashcards. If you want a notes-first Bible study app — write your own reflections, link scripture, and find them later — these alternatives fit a different workflow.",
    pickSlugs: ["bible-notes", "spirit-notes", "pencil-bible", "logos"],
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
  if (entry.name === "Bible Note" || entry.name === "Bible Notes") {
    return "Focused on live transcription — less on threading your own written reflections";
  }
  return "Different primary job than notes-first Bible study";
}

export function resolvePickSlugs(slugs: string[]): ComparePick[] {
  const picks: ComparePick[] = [harvousPick()];
  for (const slug of slugs) {
    const entry = getCompareBySlug(slug);
    if (entry) picks.push(entryToPick(entry));
  }
  return picks;
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

/** Guides for the compare hub — published pages only (drafts hidden until ready). */
export function getCompareGuidesForHub(): { category: CompareGuideCard[]; alternatives: CompareGuideCard[] } {
  const visible = SEO_PAGES.filter((page) => !isCompareSeoPageDraft(page));
  const toCard = (page: CompareSeoPage): CompareGuideCard => ({
    slug: page.slug,
    label: page.guideLabel,
    description: page.guideDescription,
    draft: false,
  });

  return {
    category: visible.filter((p) => p.kind === "category").map(toCard),
    alternatives: visible.filter((p) => p.kind === "alternative").map(toCard),
  };
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
