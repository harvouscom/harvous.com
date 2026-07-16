import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { buildBlogSearchIndex } from "../../lib/blog-search";
import { BLOG_CATEGORY_LABELS, includeBlogDrafts, type BlogCategory } from "../../lib/blog";

export const prerender = true;

export const GET: APIRoute = async () => {
  const showDrafts = includeBlogDrafts();
  const posts = await getCollection("blog");
  const records = buildBlogSearchIndex(posts, showDrafts);

  const categoryIds = [...new Set(records.map((r) => r.category))];
  const categories = categoryIds
    .map((id) => ({
      id,
      label: BLOG_CATEGORY_LABELS[id as BlogCategory] ?? id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return new Response(
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      posts: records,
      categories,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    },
  );
};
