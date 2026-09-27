/**
 * Maps a live Bright Enough href to its /next/ equivalent, so reading inside
 * /next/blog/ stays inside it. Only blog-internal links move:
 *
 *   /blog/                       → /next/blog/
 *   /blog/<category>/[page/N/]   → /next/blog/?c=<category>
 *   /blog/<post-slug>[#hash]     → /next/blog/<post-slug>/[#hash]
 *
 * Search, RSS and anything outside /blog/ are returned untouched. The
 * underscore keeps this file out of Astro's routes. `isCategory` is passed in
 * (lib/blog's `isBlogCategory` on the server, a list from the page in the
 * browser) so this file ships to the client without the blog library.
 */

const RESERVED = new Set(["search", "rss.xml", "search-index.json"]);

export function nextBlogHref(
  href: string | undefined | null,
  isCategory: (value: string) => boolean,
): string | undefined {
  if (typeof href !== "string") return href ?? undefined;
  const m = /^\/blog(\/[^?#]*)?([?#].*)?$/.exec(href);
  if (!m) return href;
  const path = (m[1] ?? "/").replace(/^\/+|\/+$/g, "");
  const tail = m[2] ?? "";
  if (path === "") return `/next/blog/${tail}`;
  const [first, second] = path.split("/");
  if (RESERVED.has(first)) return href;
  if (isCategory(first)) return `/next/blog/?c=${first}`;
  if (second) return href;
  return `/next/blog/${first}/${tail}`;
}
