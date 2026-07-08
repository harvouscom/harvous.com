/** Marketing pages kept as drafts — noindex, excluded from sitemap, removed from production builds. */
export const DRAFT_PAGE_SLUGS = ["features", "about"] as const;

export type DraftPageSlug = (typeof DRAFT_PAGE_SLUGS)[number];

export function isDraftPageSlug(slug: string): slug is DraftPageSlug {
  return (DRAFT_PAGE_SLUGS as readonly string[]).includes(slug);
}

export function isDraftPageUrl(url: string): boolean {
  return DRAFT_PAGE_SLUGS.some((slug) => url.includes(`/${slug}/`) || url.endsWith(`/${slug}`));
}
