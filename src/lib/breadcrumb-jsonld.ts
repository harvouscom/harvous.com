/**
 * `BreadcrumbList` JSON-LD, for any surface with a trail.
 *
 * Lifted out of `blog.ts` when Discover needed the same thing. It was already
 * generic — a list of crumbs and an origin — but it lived in a module whose
 * first line is `import type { CollectionEntry } from "astro:content"`, so
 * reaching for it from a page that has nothing to do with the blog would pull
 * the content-collection types into that page's graph to build an array of
 * objects. `blog.ts` re-exports it under its old name, so its callers are
 * unchanged.
 */
export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
  siteOrigin: string | URL,
): Record<string, unknown> {
  const origin = typeof siteOrigin === "string" ? siteOrigin : siteOrigin.toString();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.path, origin).toString(),
    })),
  };
}
