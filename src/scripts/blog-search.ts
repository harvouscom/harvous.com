import Fuse from "fuse.js";
import type { BlogSearchRecord } from "../lib/blog-search";

type SearchIndex = {
  posts: BlogSearchRecord[];
  categories: { id: string; label: string }[];
};

type CategoryColors = Record<string, { bg: string }>;

const CATEGORY_BG: CategoryColors = {
  "study-habits": "var(--color-sky)",
  "how-we-think": "var(--color-cream)",
  "scripture-study": "var(--color-lilac)",
  "using-harvous": "var(--color-warm)",
  teaching: "var(--color-lilac)",
  retention: "var(--color-peach)",
  equipping: "var(--color-mint)",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function thumbUrl(slug: string): string {
  return `/blog-thumbs/${slug}-spot.webp`;
}

function renderStoryCard(post: BlogSearchRecord): string {
  const bg = CATEGORY_BG[post.category] ?? "var(--color-warm)";
  const draft = post.draft
    ? `<span class="rounded-full bg-[var(--color-ink)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Draft</span>`
    : "";
  const reading = post.readingTime ? `<span>· ${post.readingTime} min</span>` : "";

  return `
    <a
      href="/blog/${escapeHtml(post.slug)}/"
      class="blog-story group flex items-start gap-4 border-b border-[var(--color-rule)] py-7 last:border-b-0 md:gap-5 md:py-8"
      data-blog-category="${escapeHtml(post.category)}"
    >
      <div
        class="blog-story__thumb relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl md:h-[5.5rem] md:w-[5.5rem]"
        style="background: ${bg};"
        aria-hidden="true"
      >
        <img
          src="${escapeHtml(thumbUrl(post.slug))}"
          alt=""
          width="360"
          height="360"
          class="absolute inset-0 h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.06]"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink-faint)]">
          ${draft}
          <span>${escapeHtml(formatDate(post.publishDate))}</span>
          ${reading}
        </div>
        <h3 class="mt-2 font-display text-2xl leading-[1.15] tracking-tight text-[var(--color-ink)] md:mt-3 md:text-[1.65rem] group-hover:text-[var(--color-accent)]">
          ${escapeHtml(post.title)}
        </h3>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--color-ink-soft)]">
          ${escapeHtml(post.description)}
        </p>
      </div>
    </a>
  `;
}

function readParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    q: (params.get("q") ?? "").trim(),
    category: (params.get("category") ?? "").trim(),
  };
}

function writeParams(q: string, category: string) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  const qs = params.toString();
  const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", next);
}

async function loadIndex(): Promise<SearchIndex> {
  const res = await fetch("/blog/search-index.json");
  if (!res.ok) throw new Error(`Failed to load search index (${res.status})`);
  return res.json();
}

function runSearch(
  index: SearchIndex,
  q: string,
  category: string,
): BlogSearchRecord[] {
  let pool = index.posts;
  if (category) {
    pool = pool.filter((p) => p.category === category);
  }

  if (!q) {
    // Empty query + category = browse that topic; empty + all = no auto-list
    return category ? pool : [];
  }

  const fuse = new Fuse(pool, {
    keys: [
      { name: "title", weight: 0.55 },
      { name: "description", weight: 0.3 },
      { name: "categoryLabel", weight: 0.15 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
    includeScore: true,
  });

  return fuse.search(q).map((r) => r.item);
}

function initBlogSearchPage() {
  const root = document.querySelector<HTMLElement>("[data-blog-search-page]");
  if (!root || root.dataset.searchReady === "1") return;
  root.dataset.searchReady = "1";

  const resultsEl = root.querySelector<HTMLElement>("[data-blog-search-results]");
  const statusEl = root.querySelector<HTMLElement>("[data-blog-search-status]");
  const emptyEl = root.querySelector<HTMLElement>("[data-blog-search-empty]");
  const form = root.querySelector<HTMLFormElement>("[data-blog-search-bar]");
  const qInput = root.querySelector<HTMLInputElement>("[data-blog-search-q]");
  const filters = root.querySelectorAll<HTMLButtonElement>("[data-blog-search-filter]");
  const topicsLabel = root.querySelector<HTMLElement>("[data-blog-library-topics-label]");

  if (!resultsEl || !statusEl || !emptyEl || !form || !qInput) return;

  let index: SearchIndex | null = null;
  let activeCategory = readParams().category;

  const setFilterState = () => {
    filters.forEach((btn) => {
      const id = btn.dataset.blogSearchFilter ?? "";
      const on = id === activeCategory || (!activeCategory && id === "");
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    if (topicsLabel) {
      const active = Array.from(filters).find((btn) => {
        const id = btn.dataset.blogSearchFilter ?? "";
        return id === activeCategory && id !== "";
      });
      const label =
        active?.querySelector(".blog-library-nav__item-label")?.textContent?.trim() || "Topics";
      topicsLabel.textContent = activeCategory ? label : "Topics";
    }
  };

  const render = (q: string, category: string) => {
    if (!index) return;
    const hits = runSearch(index, q, category);
    resultsEl.innerHTML = hits.map(renderStoryCard).join("");

    const catLabel =
      category && index.categories.find((c) => c.id === category)?.label
        ? index.categories.find((c) => c.id === category)!.label
        : null;

    if (!q && !category) {
      statusEl.textContent = "Type a search to find posts across Bright Enough.";
      emptyEl.hidden = true;
      resultsEl.hidden = true;
      return;
    }

    resultsEl.hidden = hits.length === 0;
    emptyEl.hidden = hits.length > 0;

    if (hits.length === 0) {
      statusEl.textContent = q
        ? `No posts match “${q}”${catLabel ? ` in ${catLabel}` : ""}.`
        : `No posts in ${catLabel ?? "this topic"} yet.`;
      emptyEl.textContent = "Try another search or clear the topic filter.";
    } else if (!q && category) {
      statusEl.textContent = `${hits.length} post${hits.length === 1 ? "" : "s"} in ${catLabel}.`;
    } else {
      statusEl.textContent = `${hits.length} result${hits.length === 1 ? "" : "s"}${
        catLabel ? ` in ${catLabel}` : ""
      } for “${q}”.`;
    }
  };

  const apply = (q: string, category: string, syncUrl = true) => {
    activeCategory = category;
    setFilterState();
    if (syncUrl) writeParams(q, category);
    // Keep hidden category field in sync for form submits
    let hidden = form.querySelector<HTMLInputElement>("[data-blog-search-category]");
    if (category) {
      if (!hidden) {
        hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = "category";
        hidden.dataset.blogSearchCategory = "";
        form.appendChild(hidden);
      }
      hidden.value = category;
    } else if (hidden) {
      hidden.remove();
    }
    render(q, category);
  };

  loadIndex()
    .then((data) => {
      index = data;
      const { q, category } = readParams();
      qInput.value = q;
      apply(q, category, false);
    })
    .catch(() => {
      statusEl.textContent = "Search isn’t available right now.";
      emptyEl.hidden = true;
      resultsEl.hidden = true;
    });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    apply(qInput.value, activeCategory, true);
  });

  // Live refine as you type (debounced)
  let timer = 0;
  qInput.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      apply(qInput.value, activeCategory, true);
    }, 180);
  });

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.blogSearchFilter ?? "";
      apply(qInput.value, next, true);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBlogSearchPage);
} else {
  initBlogSearchPage();
}

document.addEventListener("astro:page-load", initBlogSearchPage);
