import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import remarkGfm from "remark-gfm";
import tailwindcss from "@tailwindcss/vite";
import { getReleaseNoteSlugRedirects } from "./src/lib/release-notes-data.ts";
import { DRAFT_PAGE_SLUGS, isDraftPageUrl } from "./src/lib/draft-pages.ts";
import { appendFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const releaseNoteRedirects = Object.fromEntries(
  [...getReleaseNoteSlugRedirects().entries()].flatMap(([from, to]) => [
    [`/release-notes/${from}`, `/release-notes/${to}/`],
    [`/release-notes/${from}/`, `/release-notes/${to}/`],
  ])
);

/**
 * Whether this build keeps draft marketing pages (src/lib/draft-pages.ts).
 *
 * Preview builds keep them so they can be reviewed before launch; production
 * strips the directory. They are noindex, bannered, and out of the sitemap
 * either way — the strip is the last line of defence, not the only one.
 *
 * The two hosts answer this differently while both are live:
 *  - Netlify sets CONTEXT itself (deploy-preview | branch-deploy | production).
 *  - Cloudflare deploys run from GitHub Actions, which sets nothing of the
 *    kind, so .github/workflows/cloudflare-deploy.yml passes KEEP_DRAFT_PAGES
 *    explicitly on staging and leaves it unset on production.
 *
 * Unset on both — a local `npm run build` — strips, which is the safe default
 * and the behaviour this has always had.
 */
function keepsDraftPages() {
  if (process.env.KEEP_DRAFT_PAGES === "1") return true;
  const netlifyContext = process.env.CONTEXT;
  return netlifyContext === "deploy-preview" || netlifyContext === "branch-deploy";
}

/** Remove draft marketing pages from the production static output. */
function stripDraftPages() {
  return {
    name: "strip-draft-pages",
    hooks: {
      "astro:build:done": ({ dir }) => {
        if (keepsDraftPages()) return;
        for (const slug of DRAFT_PAGE_SLUGS) {
          rmSync(join(dir.pathname, slug), { recursive: true, force: true });
        }
      },
    },
  };
}

/**
 * Stamp preview builds noindex.
 *
 * Netlify did this for its deploy previews on our behalf. Cloudflare does not,
 * and the staging Worker serves the whole marketing site on a public
 * workers.dev URL — the one build that still carries the draft pages. It has
 * to be baked into the output rather than added by the Worker, because the
 * asset router answers page requests before the Worker is ever invoked.
 */
function stagingNoindexHeaders() {
  return {
    name: "staging-noindex-headers",
    hooks: {
      "astro:build:done": ({ dir }) => {
        if (!keepsDraftPages()) return;
        const file = join(dir.pathname, "_headers");
        const rule = "/*\n  X-Robots-Tag: noindex, nofollow\n";
        appendFileSync(file, existsSync(file) ? `\n${rule}` : rule);
      },
    },
  };
}

export default defineConfig({
  site: "https://harvous.com",
  // GFM footnotes (and tables/strikethrough) for Bright Enough MDX essays.
  markdown: {
    remarkPlugins: [remarkGfm],
  },
  integrations: [
    mdx({
      // Ensure MDX essays get the same GFM footnote support as markdown.
      remarkPlugins: [remarkGfm],
    }),
    sitemap({
      filter: (page) => {
        // Draft marketing pages (src/lib/draft-pages.ts) never enter the sitemap.
        if (isDraftPageUrl(page)) return false;
        // Blog hub, categories, and posts are indexed; search, index JSON, RSS, and pagination stay out.
        if (page.includes("/blog/search")) return false;
        if (page.includes("/blog/rss")) return false;
        if (/\/blog\/[^/]+\/page\//.test(page)) return false;
        // Individual changelog pages are noindex — keep crawl budget on compare/use-cases.
        if (/\/release-notes\/[^/]+\//.test(page) && !page.endsWith("/release-notes/")) return false;
        if (page.includes("/release-notes/page/")) return false;
        return true;
      },
    }),
    icon(),
    stripDraftPages(),
    stagingNoindexHeaders(),
  ],
  redirects: releaseNoteRedirects,
  vite: {
    plugins: [tailwindcss()],
  },
});
