/**
 * Per-render unique DOM ids.
 *
 * For components that define something in SVG `<defs>` and reference it by
 * `#id` — a gradient, a glyph, a filter, a clip path. Hardcoding that id is
 * fine right up until the component is rendered twice on one page, and then it
 * is not: ids are document-global, `url(#x)` and `href="#x"` both resolve to
 * whichever came first, and the second instance silently drives the first one's
 * definitions.
 *
 * The counter is module state, so it climbs across a whole build rather than
 * restarting per page. That is deliberate — the only thing that has to hold is
 * uniqueness *within* one document, and a monotonic counter gives that without
 * randomness, so the built HTML stays byte-stable between builds.
 */
let n = 0;

export function uniqueId(prefix: string): string {
  n += 1;
  return `${prefix}-${n}`;
}
