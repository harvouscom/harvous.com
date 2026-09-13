/**
 * Homepage FAQ behavior (src/components/FaqSection.astro).
 *
 * Everything here is an enhancement. With no JS the section is a native
 * one-open-at-a-time <details> accordion listing every question, and the CSS
 * keeps search, "See all", and the copy buttons out of sight.
 *
 * - Opening a card animates the reflow with a same-document view transition
 *   where the browser supports view-transition-class.
 * - "See all" lifts the default-view cap (the nth-child rules in FaqSection).
 * - Copy link puts a /#faq-<id> URL on the clipboard.
 * - Search filters and highlights cards with a small weighted prefix matcher.
 *   fuse.js would add ~7 KB to the homepage to rank thirteen cards, and
 *   `keywords` in the FAQ frontmatter already covers synonyms.
 * - BaseLayout's revealHashTarget dispatches `reveal-hash-target` before it
 *   opens a deep-linked card, so a search that hid the card can clear first.
 */
import { bindCopyButton } from "../lib/copy-button";

type ItemText = { el: HTMLElement; text: string };

type Item = {
  li: HTMLLIElement;
  details: HTMLDetailsElement;
  /** Elements that take search highlights, with their original text. */
  texts: ItemText[];
  /** Indexed word → weight: 3 for question, short answer, and keywords; 1 for the full answer. */
  words: Map<string, number>;
};

const SEARCH_DEBOUNCE_MS = 120;
const STATUS_DEBOUNCE_MS = 500;
/** A card has to score at least this share of the best card's score to stay visible. */
const MATCH_SHARE = 0.6;
const STOPWORDS = new Set(
  "a an the i is it do does can my me to of for in on and or how what who with there use harvous".split(" ")
);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const scrollBehavior = (): ScrollBehavior => (reducedMotion.matches ? "auto" : "smooth");

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9$]+/g, " ")
    .trim();
}

/** Crude plural folding: "notes" → "note", while "yes" and "ios" stay put. */
function fold(word: string): string {
  return word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word;
}

function indexText(text: string, weight: number, words: Map<string, number>): void {
  for (const token of normalize(text).split(" ")) {
    if (!token) continue;
    const word = fold(token);
    words.set(word, Math.max(words.get(word) ?? 0, weight));
  }
}

function queryWords(query: string): string[] {
  return normalize(query)
    .split(" ")
    .filter((token) => token && !STOPWORDS.has(token))
    .map(fold);
}

/** Each query word earns the best weight among the indexed words it starts. */
function scoreItem(item: Item, query: string[]): number {
  let total = 0;
  for (const q of query) {
    let best = 0;
    for (const [word, weight] of item.words) {
      if (weight > best && word.startsWith(q)) best = weight;
    }
    total += best;
  }
  return total;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Rebuild the text with the site's highlighter <mark> on words that start with a query word. */
function highlight({ el, text }: ItemText, query: string[]): void {
  if (!query.length) {
    if (el.childElementCount) el.textContent = text;
    return;
  }
  const alternatives = [...query]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})`, "giu");
  const fragment = document.createDocumentFragment();
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) fragment.append(text.slice(last, start));
    const mark = document.createElement("mark");
    mark.textContent = match[0];
    fragment.append(mark);
    last = start + match[0].length;
  }
  fragment.append(text.slice(last));
  el.replaceChildren(fragment);
}

const isRendered = (el: Element) => el.getClientRects().length > 0;

function buildItem(li: HTMLLIElement): Item | null {
  const details = li.querySelector<HTMLDetailsElement>(":scope > details");
  if (!details) return null;
  const words = new Map<string, number>();
  const texts = [...li.querySelectorAll<HTMLElement>("[data-faq-text]")].map((el) => ({
    el,
    text: el.textContent ?? "",
  }));
  for (const { text } of texts) indexText(text, 3, words);
  indexText(li.dataset.keywords ?? "", 3, words);
  indexText(details.querySelector(".faq-card__answer")?.textContent ?? "", 1, words);
  return { li, details, texts, words };
}

function bindFaq(root: HTMLElement): void {
  if (root.dataset.faqBound === "true") return;
  root.dataset.faqBound = "true";

  const grid = root.querySelector<HTMLElement>("[data-faq-grid]");
  if (!grid) return;

  const items = [...grid.querySelectorAll<HTMLLIElement>(":scope > li")]
    .map(buildItem)
    .filter((item): item is Item => item !== null);
  const moreButton = root.querySelector<HTMLButtonElement>("[data-faq-more]");
  const foot = root.querySelector<HTMLElement>("[data-faq-foot]");
  const searchInput = root.querySelector<HTMLInputElement>("[data-faq-search]");
  const empty = root.querySelector<HTMLElement>("[data-faq-empty]");
  const ask = root.querySelector<HTMLAnchorElement>("[data-faq-ask]");
  const status = root.querySelector<HTMLElement>("[data-faq-status]");

  /* ── Opening and closing ─────────────────────────────────────────────── */

  const canTransition = () =>
    "startViewTransition" in document &&
    CSS.supports("view-transition-class", "faq-card") &&
    !reducedMotion.matches;

  // View transitions animate the open itself, so the answer's own fade-in steps aside.
  if (canTransition()) root.dataset.vt = "";

  let transitionToken = 0;
  let transitioning = false;
  /** A card BaseLayout is opening for a deep link — it scrolls there itself. */
  let hashOpening: HTMLDetailsElement | null = null;

  /** Bring an opened card back into view if the reflow pushed its top off screen. */
  const keepInView = (details: HTMLDetailsElement) => {
    const top = details.getBoundingClientRect().top;
    const margin = parseFloat(getComputedStyle(details).scrollMarginTop) || 0;
    if (top < margin || top > window.innerHeight - 96) {
      details.scrollIntoView({ block: "start", behavior: scrollBehavior() });
    }
  };

  function toggleWithTransition(details: HTMLDetailsElement): void {
    const token = ++transitionToken;
    const named: HTMLElement[] = [];
    const name = (el: HTMLElement, transitionName: string, transitionClass: string) => {
      el.style.setProperty("view-transition-name", transitionName);
      el.style.setProperty("view-transition-class", transitionClass);
      named.push(el);
    };
    for (const item of items) {
      if (isRendered(item.li)) name(item.li, item.details.id, "faq-card");
    }
    if (foot && isRendered(foot)) name(foot, "faq-foot", "faq-foot");

    // Scopes the "don't animate the rest of the page" root rules to this transition.
    document.documentElement.classList.add("faq-vt");
    transitioning = true;

    const transition = document.startViewTransition(() => {
      details.open = !details.open;
    });
    transition.finished
      .catch(() => {})
      .finally(() => {
        if (token !== transitionToken) return;
        transitioning = false;
        document.documentElement.classList.remove("faq-vt");
        for (const el of named) {
          el.style.removeProperty("view-transition-name");
          el.style.removeProperty("view-transition-class");
        }
        if (details.open) keepInView(details);
      });
  }

  grid.addEventListener("click", (event) => {
    const summary = (event.target as Element).closest("summary");
    const details = summary?.parentElement;
    if (!(details instanceof HTMLDetailsElement) || !grid.contains(details)) return;
    if (!canTransition()) return; // native toggle
    event.preventDefault();
    toggleWithTransition(details);
  });

  grid.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const details = (event.target as Element).closest("details");
    if (!(details instanceof HTMLDetailsElement) || !details.open) return;
    event.preventDefault();
    if (canTransition()) toggleWithTransition(details);
    else details.open = false;
    details.querySelector("summary")?.focus({ preventScroll: true });
  });

  const exclusiveNatively = "name" in HTMLDetailsElement.prototype;
  grid.addEventListener(
    "toggle",
    (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;
      if (!exclusiveNatively) {
        for (const item of items) if (item.details !== details) item.details.open = false;
      }
      if (details === hashOpening) {
        hashOpening = null;
        return;
      }
      if (!transitioning) keepInView(details);
    },
    true
  );

  /* ── See all ─────────────────────────────────────────────────────────── */

  function expandAll(moveFocus: boolean): void {
    if (!grid!.hasAttribute("data-collapsed")) return;
    const appearing = items.filter((item) => !item.li.hidden && !isRendered(item.li));
    grid!.removeAttribute("data-collapsed");
    if (moreButton) moreButton.hidden = true;

    if (!reducedMotion.matches) {
      appearing.forEach((item, i) => {
        item.li.style.setProperty("--enter-i", String(i));
        item.li.dataset.entering = "";
        item.li.addEventListener(
          "animationend",
          () => {
            delete item.li.dataset.entering;
            item.li.style.removeProperty("--enter-i");
          },
          { once: true }
        );
      });
    }
    if (moveFocus) appearing[0]?.details.querySelector("summary")?.focus({ preventScroll: true });
  }

  moreButton?.addEventListener("click", () => expandAll(true));

  /* ── Copy link ───────────────────────────────────────────────────────── */

  root.querySelectorAll<HTMLButtonElement>("[data-copy-link]").forEach((button) => {
    const hash = button.dataset.copyLink ?? "";
    bindCopyButton(button, () => `${location.origin}${location.pathname}${hash}`, {
      idle: { label: "Copy link", ariaLabel: "Copy a link to this question" },
      done: { label: "Copied", ariaLabel: "Link copied" },
      failed: { label: "Link is in the address bar", ariaLabel: "Link is in the address bar" },
      labelSelector: "[data-copy-label]",
      onFail: () => history.replaceState(null, "", hash),
    });
  });

  /* ── Search ──────────────────────────────────────────────────────────── */

  const total = items.length;
  const email = ask?.dataset.email ?? "";
  let searchTimer = 0;
  let statusTimer = 0;

  const announce = (message: string) => {
    window.clearTimeout(statusTimer);
    if (!status) return;
    if (!message) {
      status.textContent = "";
      return;
    }
    statusTimer = window.setTimeout(() => {
      status.textContent = message;
    }, STATUS_DEBOUNCE_MS);
  };

  function resetSearch(): void {
    grid!.removeAttribute("data-searching");
    for (const item of items) {
      item.li.hidden = false;
      for (const text of item.texts) highlight(text, []);
    }
    if (empty) empty.hidden = true;
    if (moreButton) moreButton.hidden = !grid!.hasAttribute("data-collapsed");
    announce("");
  }

  function clearSearch(): void {
    window.clearTimeout(searchTimer);
    if (searchInput) searchInput.value = "";
    resetSearch();
  }

  function runSearch(raw: string): void {
    const query = queryWords(raw);
    if (!query.length) {
      resetSearch();
      return;
    }

    const scores = items.map((item) => scoreItem(item, query));
    const best = Math.max(0, ...scores);
    let shown = 0;
    items.forEach((item, i) => {
      const match = best > 0 && scores[i] >= best * MATCH_SHARE;
      item.li.hidden = !match;
      if (!match && item.details.open) item.details.open = false;
      for (const text of item.texts) highlight(text, match ? query : []);
      if (match) shown += 1;
    });

    grid!.setAttribute("data-searching", "");
    if (moreButton) moreButton.hidden = true;
    if (empty) empty.hidden = shown > 0;
    if (ask) {
      const subject = encodeURIComponent("A question about Harvous");
      ask.href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(raw.trim())}`;
    }
    announce(
      shown === 0
        ? `0 of ${total} questions match. You can email yours instead.`
        : `${shown} of ${total} questions ${shown === 1 ? "matches" : "match"}`
    );
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => runSearch(searchInput.value), SEARCH_DEBOUNCE_MS);
    });
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && searchInput.value) {
        event.preventDefault();
        clearSearch();
      }
    });
    // A value the browser restored (back/forward cache) should still filter.
    if (searchInput.value) runSearch(searchInput.value);
  }

  /* ── Deep links ──────────────────────────────────────────────────────── */

  root.addEventListener("reveal-hash-target", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLDetailsElement)) return;
    const item = items.find((it) => it.details === target);
    if (!item) return;
    if (item.li.hidden) clearSearch();
    if (!target.open) hashOpening = target;
  });
}

document.querySelectorAll<HTMLElement>("[data-faq]").forEach(bindFaq);
