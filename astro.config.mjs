import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import { getReleaseNoteSlugRedirects } from "./src/lib/release-notes-data.ts";
import { DRAFT_PAGE_SLUGS } from "./src/lib/draft-pages.ts";
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
        for (const slug of DRAFT_PAGE_SLUGS) {
          const pageDir = join(dir.pathname, slug);
          if (slug === "features") {
            // Hub only — keep /features/[slug]/ detail pages in production.
            rmSync(join(pageDir, "index.html"), { force: true });
          } else {
            rmSync(pageDir, { recursive: true, force: true });
          }
        }
      },
    },
  };
}

export default defineConfig({
  site: "https://harvous.com",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        if (page.includes("/blog")) return false;
        // Features hub only — detail pages under /features/{slug}/ are indexed.
        if (page.endsWith("/features/") || page.endsWith("/features")) return false;
        if (page.includes("/about/")) return false;
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
