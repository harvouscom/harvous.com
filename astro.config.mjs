import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import remarkGfm from "remark-gfm";
import tailwindcss from "@tailwindcss/vite";
import { getReleaseNoteSlugRedirects } from "./src/lib/release-notes-data.ts";
import { DRAFT_PAGE_SLUGS, isDraftPageUrl } from "./src/lib/draft-pages.ts";
import { rmSync } from "node:fs";
import { join } from "node:path";

const releaseNoteRedirects = Object.fromEntries(
  [...getReleaseNoteSlugRedirects().entries()].flatMap(([from, to]) => [
    [`/release-notes/${from}`, `/release-notes/${to}/`],
    [`/release-notes/${from}/`, `/release-notes/${to}/`],
  ])
);

/** Remove draft marketing pages from the production static output. */
function stripDraftPages() {
  return {
    name: "strip-draft-pages",
    hooks: {
      "astro:build:done": ({ dir }) => {
        // Netlify previews keep draft pages so they can be reviewed before
        // launch. They are still noindex, still bannered, and still out of the
        // sitemap — only production strips the directory.
        const context = process.env.CONTEXT;
        if (context === "deploy-preview" || context === "branch-deploy") return;
        for (const slug of DRAFT_PAGE_SLUGS) {
          rmSync(join(dir.pathname, slug), { recursive: true, force: true });
        }
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
  ],
  redirects: releaseNoteRedirects,
  vite: {
    plugins: [tailwindcss()],
  },
});
