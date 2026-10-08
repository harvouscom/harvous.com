import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const showcaseColor = z.enum(["amber", "sky", "mint", "violet", "coral"]);

const productSection = z.object({
  heading: z.string(),
  paragraphs: z.array(z.string()),
});

const productMoment = z.object({
  icon: z.string(),
  heading: z.string(),
  body: z.string(),
});

const productShowcase = z.object({
  eyebrow: z.string(),
  title: z.string(),
  color: showcaseColor.default("sky"),
  reverse: z.boolean().optional(),
  body: z.array(z.string()),
  /** Which stylized app moment to draw (ShowcaseVisual.astro), and its alt text. */
  visual: z.string(),
  label: z.string(),
});

/** One step of a feature page's walkthrough: what you do, and the app at that moment. */
const productStep = z.object({
  title: z.string(),
  body: z.string(),
  /** Which stylized app moment to draw (ShowcaseVisual.astro), and its alt text. */
  visual: z.string(),
  label: z.string(),
  color: showcaseColor.optional(),
});

const features = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/features" }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    order: z.number(),
    align: z.enum(["left", "right"]).default("left"),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    heroTitle: z.string().optional(),
    heroLead: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    comingSoon: z.boolean().optional(),
    comingSoonLine: z.string().optional(),
    sections: z.array(productSection).optional(),
    showcases: z.array(productShowcase).optional(),
    /** The walkthrough (FeatureWalkthrough.astro). When present it replaces the prose sections and showcases. */
    steps: z.array(productStep).optional(),
    moments: z.array(productMoment).optional(),
    relatedFeatureIds: z.array(z.string()).optional(),
    compareSlugs: z.array(z.string()).optional(),
    relatedHeading: z.string().optional(),
    relatedLead: z.string().optional(),
    closingHeading: z.string().optional(),
    closingLead: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/faq" }),
  schema: z.object({
    question: z.string(),
    order: z.number(),
    /** One-line answer shown on the homepage card before it's opened. */
    short: z.string().max(70),
    /** Follow-on link under the full answer. Must be a live, non-draft route. */
    next: z.object({ label: z.string(), href: z.string().startsWith("/") }).optional(),
    /** Surfaces this question stays off. Default: everywhere. */
    hideOn: z.array(z.enum(["home", "support"])).default([]),
    /** Search synonyms for the homepage filter — matched, never rendered. */
    keywords: z.array(z.string()).default([]),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/testimonials" }),
  schema: z.object({
    name: z.string(),
    /** When the quote was given. Kept for provenance; no page renders it —
        a dated quote starts ageing the day after. */
    when: z.string().optional(),
    order: z.number(),
    /**
     * Whether this quote is in the unfiltered "wall" that TestimonialsSection
     * (home) and ProofStrip (/next home) render — every entry, no filter, in
     * `order`. false keeps a quote out of that wall while it's still reachable
     * by id for a single use-case/audience page's testimonialId (see
     * for-audiences-data.ts, use-cases-data.ts). Defaults true.
     */
    featured: z.boolean().default(true),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Optional overrides for <title> / og:title (defaults to “{title} — Bright Enough”). */
    seoTitle: z.string().optional(),
    /** Optional override for meta / og description (defaults to description). */
    seoDescription: z.string().optional(),
    publishDate: z.coerce.date(),
    category: z.enum([
      "study-habits",
      "how-we-think",
      "scripture-study",
      "using-harvous",
      "teaching",
      "retention",
      "equipping",
    ]),
    /**
     * Author registry id (`bright-enough`, `derek`, or a guest/team id).
     * Defaults: how-we-think + using-harvous → derek; otherwise Bright Enough.
     */
    authorId: z.string().optional(),
    /** Extra /for/ audience slugs beyond category affinity (or sole homes for how-we-think). */
    forSlugs: z.array(z.string()).optional(),
    /** Extra use-case slugs beyond category affinity. */
    useCaseSlugs: z.array(z.string()).optional(),
    /** Override the category default feature set on the post closing bridge. */
    featureIds: z.array(z.string()).optional(),
    /** Keep this post out of product-page “From Bright Enough” strips. */
    hideFromRelated: z.boolean().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { features, faq, testimonials, blog };
