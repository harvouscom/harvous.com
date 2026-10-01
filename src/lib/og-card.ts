/**
 * Path of a generated OG card (public/og/<name>.jpg — see scripts/generate-og-cards.mjs).
 * Pages without a more specific image of their own pass this to NextLayout's `ogImage`.
 */
export function ogCard(name: string): string {
  return `/og/${name}.jpg`;
}
