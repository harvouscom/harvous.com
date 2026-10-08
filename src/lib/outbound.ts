/**
 * Outbound links to other sites carry ref=harvous, so the people on the other
 * end can see where the visit came from. Harvous's own links (harvous.com,
 * app.harvous.com) and relative links are left alone, as is a link that
 * already names a ref.
 */
export function withHarvousRef(href: string): string {
  if (!/^https?:/.test(href)) return href;
  try {
    const u = new URL(href);
    if (u.hostname === "harvous.com" || u.hostname.endsWith(".harvous.com")) return href;
    if (!u.searchParams.has("ref")) u.searchParams.set("ref", "harvous");
    return u.toString();
  } catch {
    return href;
  }
}
