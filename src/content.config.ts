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
  image: z.string(),
  imageAlt: z.string(),
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
    ink: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    comingSoon: z.boolean().optional(),
    comingSoonLine: z.string().optional(),
    sections: z.array(productSection).optional(),
    showcases: z.array(productShowcase).optional(),
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
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/testimonials" }),
  schema: z.object({
    name: z.string(),
    when: z.string(),
    order: z.number(),
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
    readingTime: z.number().optional(),
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
