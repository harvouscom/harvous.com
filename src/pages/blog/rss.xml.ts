import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { includeBlogDrafts, isBlogPostListed } from "../../lib/blog";

export async function GET(context: APIContext) {
  const showDrafts = includeBlogDrafts();
  const posts = (await getCollection("blog"))
    .filter((p) => isBlogPostListed(p, showDrafts))
    .sort(
      (a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime(),
    );

  return rss({
    title: "Bright Enough — Harvous Blog",
    description:
      "Notes, habits, and teaching that show up after Sunday. For teachers, group leaders, and anyone who keeps what they learn.",
    site: context.site ?? "https://harvous.com",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/blog/${post.id}/`,
      categories: [post.data.category],
    })),
    customData: `<language>en-us</language>`,
  });
}
