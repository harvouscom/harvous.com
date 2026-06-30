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
  integrations: [mdx(), sitemap(), icon()],
  redirects: releaseNoteRedirects,
  vite: {
    plugins: [tailwindcss()],
  },
});
