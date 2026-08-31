/**
 * Marketing pages kept as drafts — noindex, excluded from sitemap, removed from
 * production builds.
 *
 * Empty since /features/ became the feature-category hub. The machinery stays:
 * it is the mechanism for shipping a page before its content is ready, and the
 * next draft should use it rather than reinventing one.
 */
export const DRAFT_PAGE_SLUGS = [] as const as readonly string[];

export function isDraftPageSlug(slug: string): boolean {
  return DRAFT_PAGE_SLUGS.includes(slug);
}

export function isDraftPageUrl(url: string): boolean {
  return DRAFT_PAGE_SLUGS.some((slug) => url.includes(`/${slug}/`) || url.endsWith(`/${slug}`));
}
