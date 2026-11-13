/**
 * What "Ask a question about Harvous" answers from: this site's own words.
 *
 * Built with the site, so it can't drift from the pages. cloudflare/ask.ts reads it
 * (with /llms.txt) through the assets binding, picks the two docs that best match a
 * question by plain word overlap, and hands the model only this as context. Every
 * link under an answer is one of these docs, so it always points at a real page.
 *
 * Draft pages stay out: child notebooks join only where that page exists
 * (lib/draft-pages.ts), so production can't answer about something unpublished.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { faqAnchorId, faqAnswerPlainText, getFaqEntries } from "../lib/faq.ts";
import { CHILD_NOTEBOOKS_PAGE, getAddonPages } from "../lib/addons-data.ts";
import { hasDetailContent, type ProductPage } from "../lib/product-page-data.ts";
import { getUseCases } from "../lib/use-cases-data.ts";
import { getAudiences } from "../lib/for-audiences-data.ts";
import { FREE_PLAN, PLUS_PLAN } from "../lib/pricing-data.ts";
import { draftPageIsReachable } from "../lib/draft-pages.ts";

export type AskDoc = { id: string; title: string; href: string; text: string };

/** Markdown links to their labels, and whitespace evened out. */
const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
const join = (...parts: (string | undefined | false)[]) => plain(parts.filter(Boolean).join(" "));

type Section = { heading: string; paragraphs: string[] };
type Moment = { heading: string; body: string };
const sectionsText = (sections: Section[] = []) => sections.map((s) => `${s.heading}. ${s.paragraphs.join(" ")}`).join(" ");
const momentsText = (moments: Moment[] = []) => moments.map((m) => `${m.heading}: ${m.body}`).join(" ");

function productDoc(page: ProductPage): AskDoc {
  return {
    id: `page-${page.slug}`,
    title: page.title,
    href: page.href,
    text: join(
      page.tagline,
      page.heroLead,
      sectionsText(page.sections),
      page.showcases.map((s) => `${s.title}. ${s.body.join(" ")}`).join(" "),
      momentsText(page.moments),
      ...(page.faqs ?? []).map((f) => `Q: ${f.question} A: ${f.answer}`),
    ),
  };
}

export const GET: APIRoute = async () => {
  const docs: AskDoc[] = [];

  for (const entry of await getFaqEntries("support")) {
    docs.push({ id: entry.id, title: entry.data.question, href: `/faq/#${faqAnchorId(entry)}`, text: faqAnswerPlainText(entry) });
  }

  docs.push({
    id: "pricing",
    title: "Pricing: Free and Harvous Plus",
    href: "/pricing/",
    text: join(
      `${FREE_PLAN.name} (${FREE_PLAN.priceDisplay}), ${FREE_PLAN.tagline}: ${FREE_PLAN.features.join("; ")}.`,
      `${PLUS_PLAN.name} (${PLUS_PLAN.priceDisplay} or ${PLUS_PLAN.priceDisplaySecondary}), ${PLUS_PLAN.tagline}: ${PLUS_PLAN.features.join("; ")}.`,
    ),
  });

  for (const page of getAddonPages().filter((a) => !a.draft)) docs.push(productDoc(page));
  if (draftPageIsReachable("add-ons/family/child-notebooks")) docs.push(productDoc(CHILD_NOTEBOOKS_PAGE));

  for (const f of await getCollection("features")) {
    if (f.data.draft || !hasDetailContent(f.data) || !draftPageIsReachable(`features/${f.id}`)) continue;
    docs.push({
      id: `feature-${f.id}`,
      title: f.data.tagline,
      href: `/features/${f.id}/`,
      text: join(
        f.data.title,
        f.data.heroLead,
        sectionsText(f.data.sections),
        (f.data.steps ?? []).map((s) => `${s.title}. ${s.body}`).join(" "),
        momentsText(f.data.moments),
      ),
    });
  }

  for (const uc of getUseCases()) {
    docs.push({ id: `use-case-${uc.slug}`, title: uc.title, href: uc.href, text: join(uc.tagline, uc.heroLead, sectionsText(uc.sections)) });
  }
  for (const a of getAudiences()) {
    docs.push({ id: `for-${a.slug}`, title: `Harvous for ${a.title.toLowerCase()}`, href: a.href, text: join(a.tagline, a.heroLead, sectionsText(a.sections)) });
  }

  const body = {
    app: "Harvous",
    line: "Harvous is a Bible study notes app that helps you remember what you studied.",
    email: "derek@harvous.com",
    voice:
      "Derek's voice: plain, warm and short, in American English. Talk like one person who made the app, never like a brand. No hype, no exclamation points.",
    /* A new build is new content, so cached answers start over. */
    version: String(Date.now()),
    docs,
  };

  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  });
};
