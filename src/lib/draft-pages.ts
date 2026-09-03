/**
 * Marketing pages kept as drafts — noindex, excluded from sitemap, removed from
 * production builds.
 *
 * A slug listed here gets four things at once: `noindex` on its BaseLayout, the
 * dev-only `.draft-page-banner`, exclusion from the sitemap (astro.config.mjs
 * consults `isDraftPageUrl`), and `rm -rf dist/<slug>/` after the production
 * build. Links to it elsewhere (footer, homepage) hide themselves via
 * `isDraftPageSlug` / `isDraftPageUrl`, so emptying this array is the whole
 * cutover.
 *
 * Currently: `/3/`, the Harvous 3 release page, until launch.
 */
export const DRAFT_PAGE_SLUGS = ["3"] as const as readonly string[];

export function isDraftPageSlug(slug: string): boolean {
  return DRAFT_PAGE_SLUGS.includes(slug);
}

/**
 * Exact path match, not substring. The previous `url.includes("/3/")` would
 * have caught `/blog/how-we-think/page/3/` and `/release-notes/page/3/` —
 * harmless today only because those are excluded by other rules.
 */
export function isDraftPageUrl(url: string): boolean {
  const pathname = /^https?:\/\//.test(url) ? new URL(url).pathname : url;
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return DRAFT_PAGE_SLUGS.some((slug) => normalized === `/${slug}/`);
}
