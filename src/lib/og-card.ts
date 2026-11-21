import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * URL of a generated OG card (public/og/<name>.jpg — a photograph of the page's
 * hero, see scripts/generate-og-cards.mjs). Pages pass it to NextLayout's
 * `ogImage`.
 *
 * The `?v=` is the card's content hash: X, Slack and iMessage cache a card by
 * its URL, so a regenerated card under the same name would go unseen for days.
 * Read at build time only; .astro frontmatter runs in Node from the project root.
 */
export function ogCard(name: string): string {
  const path = `/og/${name}.jpg`;
  try {
    const v = createHash("sha1").update(readFileSync(join(process.cwd(), "public", path))).digest("hex").slice(0, 8);
    return `${path}?v=${v}`;
  } catch {
    return path;
  }
}
