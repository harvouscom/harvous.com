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
 * `discover` is the catalog of study people have shared. It is built and
 * reviewable on staging, and stripped from production, until the app side ships
 * — a hub with nothing under it is worse than no hub. Launch is deleting the
 * string.
 *
 * Note the sitemap needs its own rule for it: `isDraftPageUrl` is an exact path
 * match by design, so it excludes `/discover/` but not `/discover/<slug>/`. See
 * the filter in astro.config.mjs.
 */
export const DRAFT_PAGE_SLUGS = ["discover"] as const as readonly string[];

/**
 * Whether links to a draft page should render — i.e. whether the page will be
 * there when someone clicks.
 *
 * Not the same question as `isDraftPageSlug`. Production strips the directory,
 * so its links have to hide. Staging keeps it (KEEP_DRAFT_PAGES=1) precisely so
 * the page can be reviewed in place, and `astro dev` strips nothing — in both,
 * hiding the links would hide the thing you are trying to look at.
 */
export function draftPageIsReachable(slug: string): boolean {
  if (!isDraftPageSlug(slug)) return true;
  if (process.env.KEEP_DRAFT_PAGES === "1") return true;
  return Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);
}


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
