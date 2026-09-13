/**
 * The FAQ collection, read the same way everywhere: which questions a surface
 * lists, their anchor ids, the plain-text answers FAQPage structured data needs,
 * and whether a card's next-step link still points at a live page.
 *
 * The homepage section and the homepage JSON-LD both call getFaqEntries("home"),
 * so the structured data can't drift from the questions the page shows.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { getAddonDetailHref } from "./addons-data";
import { BLOG_CATEGORY_LABELS, isBlogPostListed } from "./blog";
import { isDraftPageUrl } from "./draft-pages";
import { getFeatureCategoryBySlug } from "./feature-categories-data";
import { hasDetailContent } from "./product-page-data";

export type FaqEntry = CollectionEntry<"faq">;
export type FaqSurface = "home" | "support";
export type FaqNext = NonNullable<FaqEntry["data"]["next"]>;

export const SUPPORT_EMAIL = "derek@harvous.com";

export async function getFaqEntries(surface: FaqSurface): Promise<FaqEntry[]> {
  const entries = await getCollection("faq", (entry) => !entry.data.hideOn.includes(surface));
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export function faqAnchorId(entry: FaqEntry): string {
  return `faq-${entry.id}`;
}

/**
 * The answer as plain text for structured data. Works from the raw MDX body:
 * drops ESM and JSX, keeps link labels (not their URLs), and unwraps emphasis —
 * without touching ordinary punctuation like "Settings > My Data" or "($6/mo)".
 * An answer that is only a component (contact-support) falls back to `short`.
 */
export function faqAnswerPlainText(entry: FaqEntry): string {
  const text = (entry.body ?? "")
    .replace(/^(?:import|export)\s.*$/gm, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|`)(.+?)\1/g, "$2")
    .replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=$|[\s).,;:!?])/gm, "$1$2")
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+\.\s+)/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return text || entry.data.short;
}

export function buildFaqPageJsonLd(entries: FaqEntry[]) {
  return {
    "@type": "FAQPage" as const,
    mainEntity: entries.map((entry) => ({
      "@type": "Question" as const,
      name: entry.data.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: faqAnswerPlainText(entry),
      },
    })),
  };
}

/**
 * The entry's next-step link, or undefined when its page won't be there — a
 * draft, a feature without a built detail page, a draft add-on, or an unlisted
 * blog post. A dropped link warns at build time so a stale one gets noticed.
 */
export async function liveFaqNext(entry: FaqEntry): Promise<FaqNext | undefined> {
  const next = entry.data.next;
  if (!next) return undefined;
  const problem = await nextLinkProblem(next.href);
  if (!problem) return next;
  console.warn(`[faq] ${entry.id}: hiding next link ${next.href} (${problem})`);
  return undefined;
}

async function nextLinkProblem(href: string): Promise<string | undefined> {
  const path = href.split(/[?#]/)[0] ?? href;
  if (isDraftPageUrl(path)) return "draft page";

  const [, section, slug] = path.match(/^\/([^/]+)\/([^/]+)\/?$/) ?? [];
  if (!section || !slug) return undefined;

  if (section === "features" && !getFeatureCategoryBySlug(slug)) {
    const feature = (await getCollection("features")).find((f) => f.id === slug);
    if (!feature) return "no such feature";
    if (feature.data.draft || !hasDetailContent(feature.data)) return "feature has no built page";
  }
  if (section === "add-ons" && !getAddonDetailHref(slug)) return "add-on is a draft or missing";
  if (section === "blog" && !(slug in BLOG_CATEGORY_LABELS)) {
    const post = (await getCollection("blog")).find((p) => p.id === slug);
    if (!post) return "no such blog post";
    if (!isBlogPostListed(post)) return "blog post is not listed";
  }
  return undefined;
}
