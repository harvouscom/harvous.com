import sanitizeHtml from "sanitize-html";

/**
 * Clean a Discover listing's body before it is baked into a page.
 *
 * **This is the only sanitize pass there is.** The API used to do it — twice,
 * on write and on read — with DOMPurify, which needs a DOM, which meant jsdom,
 * which cannot be bundled into the API image: it built and deployed and then
 * died at startup looking for a stylesheet that was not in the container. So
 * the boundary moved here, to the one thing that actually renders these bytes
 * as HTML. Nothing downstream re-cleans them.
 *
 * `sanitize-html` parses with htmlparser2 rather than a DOM, so it runs in an
 * Astro build with no browser and no jsdom.
 *
 * The allowlist is the editor's own vocabulary, not a general-purpose one. A
 * listing body is a note or a template scaffold written in Tiptap: headings,
 * paragraphs, lists, quotes, emphasis, and scripture pills. Pills are `<span>`s
 * that carry their reference in `data-*`, which is why those attributes are
 * kept and why `class` is — the card and the listing page both style them.
 *
 * What is deliberately absent is as load-bearing as what is here: no `script`,
 * no `style`, no `iframe`, no event handlers (sanitize-html drops every `on*`
 * by default), and no `href` scheme beyond http/https/mailto, so a
 * `javascript:` link cannot survive.
 */
const ALLOWED_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "strong", "b", "em", "i", "u", "s", "mark", "sub", "sup",
  "a", "span", "div",
];

export function sanitizeListingHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      /* Scripture pills and the editor's own block classes. `data-*` is
         matched by prefix so a new pill attribute does not need a release
         here to survive. */
      "*": ["class", "data-*", "id", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    /* Anything not on the list loses its tag but keeps its text — a listing
       should never silently lose a sentence to an unexpected wrapper. */
    disallowedTagsMode: "discard",
    /* Off the page and out of the tab. */
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }, true),
    },
  });
}
