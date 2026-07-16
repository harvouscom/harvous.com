import type { CollectionEntry } from "astro:content";

export type BlogCategory = CollectionEntry<"blog">["data"]["category"];

/** In local `astro dev`, draft posts are visible so you can review structure and copy. Production builds omit drafts. */
export function includeBlogDrafts(): boolean {
  return import.meta.env.DEV;
}

export function isBlogPostListed(
  post: CollectionEntry<"blog">,
  includeDrafts = includeBlogDrafts(),
): boolean {
  return includeDrafts || !post.data.draft;
}

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  "study-habits": "Study habits",
  "how-we-think": "How we think",
  "scripture-study": "Scripture study",
  "using-harvous": "Using Harvous",
  teaching: "Teaching",
  retention: "Retention",
  equipping: "Equipping",
};

/** Soft fallback tints for art plates (not category pills). */
export const BLOG_CATEGORY_COLORS: Record<BlogCategory, { bg: string; ink: string }> = {
  "study-habits": { bg: "var(--color-mint)", ink: "var(--color-mint-ink)" },
  "how-we-think": { bg: "var(--color-sky)", ink: "var(--color-sky-ink)" },
  "scripture-study": { bg: "var(--color-lilac)", ink: "var(--color-lilac-ink)" },
  "using-harvous": { bg: "var(--color-sky)", ink: "var(--color-sky-ink)" },
  teaching: { bg: "var(--color-lilac)", ink: "var(--color-lilac-ink)" },
  retention: { bg: "var(--color-mint)", ink: "var(--color-mint-ink)" },
  equipping: { bg: "var(--color-peach)", ink: "var(--color-peach-ink)" },
};

export const BLOG_CATEGORY_ICONS: Record<BlogCategory, string> = {
  "study-habits": "fa6-solid:book-open",
  "how-we-think": "fa6-solid:lightbulb",
  "scripture-study": "fa6-solid:book-bible",
  "using-harvous": "fa6-solid:compass",
  teaching: "fa6-solid:chalkboard-user",
  retention: "fa6-solid:arrows-rotate",
  equipping: "fa6-solid:seedling",
};

export function blogCategoryLabel(category: string): string {
  return BLOG_CATEGORY_LABELS[category as BlogCategory] ?? category;
}

export function blogCategoryColor(category: string): { bg: string; ink: string } {
  return (
    BLOG_CATEGORY_COLORS[category as BlogCategory] ?? {
      bg: "var(--color-warm)",
      ink: "var(--color-ink-soft)",
    }
  );
}

export function blogCategoryIcon(category: string): string {
  return BLOG_CATEGORY_ICONS[category as BlogCategory] ?? "fa6-solid:bookmark";
}

/** Feature MDX ids (or coming-soon-grid ids) shown on the post closing bridge — keep to 3. */
export const BLOG_CATEGORY_FEATURE_IDS: Record<BlogCategory, string[]> = {
  "study-habits": ["scripture-pills", "highlights", "recall"],
  "how-we-think": ["scripture-pills", "threads", "highlights"],
  "scripture-study": ["scripture-pills", "dictionary", "highlights"],
  "using-harvous": ["threads", "scripture-pills", "highlights"],
  teaching: ["scripture-pills", "threads", "highlights"],
  retention: ["recall", "daily-passage", "highlights"],
  equipping: ["threads", "scripture-pills", "recall"],
};

export type BlogProductBridgeCopy = {
  eyebrow: string;
  heading: string;
  lead: string;
};

/** Closing bridge copy — ties the essay topic to the product without hard-selling. */
export const BLOG_CATEGORY_PRODUCT_BRIDGE: Record<BlogCategory, BlogProductBridgeCopy> = {
  "study-habits": {
    eyebrow: "In Harvous",
    heading: "Give the habit somewhere to live.",
    lead: "Notes stay with Scripture so tomorrow’s study doesn’t start from scratch.",
  },
  "how-we-think": {
    eyebrow: "In Harvous",
    heading: "See the notes-first idea in the app.",
    lead: "Scripture-linked notes, threads, and highlights — the pieces this essay is arguing for.",
  },
  "scripture-study": {
    eyebrow: "In Harvous",
    heading: "Keep the study next to the text.",
    lead: "Pills for the reference, dictionary when a word slows you down, highlights you can find again.",
  },
  "using-harvous": {
    eyebrow: "In Harvous",
    heading: "Where those pieces actually live.",
    lead: "Open the app and see threads, scripture pills, and recall working in one note.",
  },
  teaching: {
    eyebrow: "In Harvous",
    heading: "Prep that leaves a trail.",
    lead: "Scripture-linked notes and threads across lessons — so next week’s prep starts warmer.",
  },
  retention: {
    eyebrow: "In Harvous",
    heading: "Where Monday’s loop lives.",
    lead: "Capture the passage, resurface what faded, and reopen the trail when the week gets loud.",
  },
  equipping: {
    eyebrow: "In Harvous",
    heading: "A working library for what you teach.",
    lead: "Threads across a series, notes tied to Scripture, and a trail people can return to.",
  },
};

export function blogFeatureIds(
  category: BlogCategory,
  override?: string[],
): string[] {
  const ids =
    override && override.length > 0
      ? override
      : (BLOG_CATEGORY_FEATURE_IDS[category] ?? BLOG_CATEGORY_FEATURE_IDS["using-harvous"]);
  return ids.slice(0, 3);
}

export function blogProductBridgeCopy(category: BlogCategory): BlogProductBridgeCopy {
  return BLOG_CATEGORY_PRODUCT_BRIDGE[category] ?? BLOG_CATEGORY_PRODUCT_BRIDGE["using-harvous"];
}

/** Paths written by `npm run blog:thumbs` (see scripts/generate-blog-thumbs.mjs). */
export function blogThumbUrl(slug: string, kind: "spot" | "feat"): string {
  return `/blog-thumbs/${slug}-${kind}.webp`;
}

/* -------------------------------------------------------------------------- */
/* Authors                                                                    */
/* -------------------------------------------------------------------------- */

export type BlogAuthorKind = "house" | "team" | "guest";

export type BlogAuthor = {
  id: string;
  name: string;
  kind: BlogAuthorKind;
  /** One short line under the name */
  role: string;
  avatar?: string;
  href?: string;
  email?: string;
};

export const BLOG_AUTHORS: Record<string, BlogAuthor> = {
  "bright-enough": {
    id: "bright-enough",
    name: "Bright Enough",
    kind: "house",
    role: "The Harvous blog",
    avatar: "/images/harvous-2-icon.png",
  },
  derek: {
    id: "derek",
    name: "Derek Castelli",
    kind: "team",
    role: "Founder, Harvous",
    avatar: "/derek-avatar.jpeg",
    href: "/about/",
  },
};

const TEAM_DEFAULT_CATEGORIES = new Set<BlogCategory>(["how-we-think", "using-harvous"]);

export function defaultBlogAuthorId(category: BlogCategory): string {
  return TEAM_DEFAULT_CATEGORIES.has(category) ? "derek" : "bright-enough";
}

export function resolveBlogAuthor(
  post: Pick<CollectionEntry<"blog">["data"], "category" | "authorId">,
): BlogAuthor {
  const id = post.authorId ?? defaultBlogAuthorId(post.category);
  return BLOG_AUTHORS[id] ?? BLOG_AUTHORS["bright-enough"]!;
}

export function blogAuthorJsonLd(
  author: BlogAuthor,
  siteOrigin: string | URL,
): Record<string, unknown> {
  const origin = typeof siteOrigin === "string" ? siteOrigin : siteOrigin.toString();
  if (author.kind === "house") {
    return {
      "@type": "Organization",
      name: author.name,
      url: new URL(author.href ?? "/blog/", origin).toString(),
    };
  }
  const person: Record<string, unknown> = {
    "@type": "Person",
    name: author.name,
  };
  if (author.href) {
    person.url = new URL(author.href, origin).toString();
  }
  return person;
}

/* -------------------------------------------------------------------------- */
/* Category → product affinity (auto related posts on marketing pages)        */
/* -------------------------------------------------------------------------- */

/** /for/{slug} pages that should surface posts in this category. */
export const BLOG_CATEGORY_AUDIENCES: Record<BlogCategory, string[]> = {
  teaching: ["teachers", "group-leaders", "seminary-students"],
  retention: ["teachers", "churches", "daily-readers"],
  equipping: ["churches", "group-leaders", "teachers"],
  "study-habits": ["daily-readers", "sunday-note-takers", "prayer-journaling"],
  "using-harvous": ["daily-readers", "teachers"],
  "scripture-study": ["going-through-a-book", "following-a-theme", "seminary-students"],
  "how-we-think": [],
};

/** /use-cases/{slug} pages that should surface posts in this category. */
export const BLOG_CATEGORY_USE_CASES: Record<BlogCategory, string[]> = {
  teaching: ["small-group", "sermon-notes", "book-study"],
  retention: ["daily-journal"],
  equipping: ["small-group"],
  "study-habits": ["daily-journal", "sermon-notes"],
  "using-harvous": ["daily-journal"],
  "scripture-study": ["book-study", "topical-study", "deep-study"],
  "how-we-think": [],
};

export type RelatedBlogFilter = {
  for?: string;
  useCase?: string;
  feature?: string;
};

/**
 * Feature ids used for reverse embeds on /features/* pages.
 * Unlike the post closing bridge, how-we-think is opt-in only (empty category list).
 */
function relatedFeatureIdsForPost(post: CollectionEntry<"blog">): string[] {
  const fromCategory =
    post.data.category === "how-we-think"
      ? []
      : (BLOG_CATEGORY_FEATURE_IDS[post.data.category] ?? []);
  const fromPost = post.data.featureIds ?? [];
  return [...new Set([...fromCategory, ...fromPost])];
}

function postMatchesRelatedFilter(
  post: CollectionEntry<"blog">,
  filter: RelatedBlogFilter,
): boolean {
  if (post.data.hideFromRelated) return false;

  if (filter.for) {
    const fromCategory = BLOG_CATEGORY_AUDIENCES[post.data.category] ?? [];
    const fromPost = post.data.forSlugs ?? [];
    return fromCategory.includes(filter.for) || fromPost.includes(filter.for);
  }

  if (filter.useCase) {
    const fromCategory = BLOG_CATEGORY_USE_CASES[post.data.category] ?? [];
    const fromPost = post.data.useCaseSlugs ?? [];
    return fromCategory.includes(filter.useCase) || fromPost.includes(filter.useCase);
  }

  if (filter.feature) {
    return relatedFeatureIdsForPost(post).includes(filter.feature);
  }

  return false;
}

/** Newest matching published posts for a product page surface. */
export function getRelatedBlogPosts(
  posts: CollectionEntry<"blog">[],
  filter: RelatedBlogFilter,
  limit = 3,
): CollectionEntry<"blog">[] {
  return posts
    .filter((p) => postMatchesRelatedFilter(p, filter))
    .sort(
      (a, b) =>
        new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime(),
    )
    .slice(0, limit);
}

export type BlogHeading = { depth: number; slug: string; text: string };

/** Slugify heading text to match Astro’s default markdown heading ids. */
export function blogHeadingSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Fallback TOC headings from raw MDX/Markdown body when `render().headings`
 * is empty (stale content cache / MDX edge cases).
 */
export function blogHeadingsFromBody(body: string, maxDepth = 2): BlogHeading[] {
  const out: BlogHeading[] = [];
  for (const line of body.split("\n")) {
    const m = /^(#{2,6})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1].length;
    if (depth > maxDepth) continue;
    const text = m[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();
    if (!text) continue;
    out.push({ depth, slug: blogHeadingSlug(text), text });
  }
  return out;
}
