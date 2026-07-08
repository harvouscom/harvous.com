import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import { getReleaseNoteSlugRedirects } from "./src/lib/release-notes-data.ts";

const releaseNoteRedirects = Object.fromEntries(
  [...getReleaseNoteSlugRedirects().entries()].flatMap(([from, to]) => [
    [`/release-notes/${from}`, `/release-notes/${to}/`],
    [`/release-notes/${from}/`, `/release-notes/${to}/`],
  ])
);

export default defineConfig({
  site: "https://harvous.com",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        if (page.includes("/blog")) return false;
        // Individual changelog pages are noindex — keep crawl budget on compare/use-cases.
        if (/\/release-notes\/[^/]+\//.test(page) && !page.endsWith("/release-notes/")) return false;
        if (page.includes("/release-notes/page/")) return false;
        return true;
      },
    }),
    icon(),
  ],
  redirects: releaseNoteRedirects,
  vite: {
    plugins: [tailwindcss()],
  },
});
