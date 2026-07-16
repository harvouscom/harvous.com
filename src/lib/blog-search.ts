import type { CollectionEntry } from "astro:content";
import {
  blogCategoryLabel,
  includeBlogDrafts,
  isBlogPostListed,
  sortBlogPostsByDate,
  type BlogCategory,
} from "./blog";

export type BlogSearchRecord = {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  categoryLabel: string;
  publishDate: string;
  readingTime?: number;
  draft: boolean;
};

export function toBlogSearchRecord(post: CollectionEntry<"blog">): BlogSearchRecord {
  return {
    slug: post.id,
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    categoryLabel: blogCategoryLabel(post.data.category),
    publishDate: post.data.publishDate.toISOString(),
    readingTime: post.data.readingTime,
    draft: Boolean(post.data.draft),
  };
}

export function buildBlogSearchIndex(
  posts: CollectionEntry<"blog">[],
  includeDrafts = includeBlogDrafts(),
): BlogSearchRecord[] {
  return sortBlogPostsByDate(posts.filter((p) => isBlogPostListed(p, includeDrafts))).map(
    toBlogSearchRecord,
  );
}

export function blogSearchHref(q = "", category?: string): string {
  const params = new URLSearchParams();
  const trimmed = q.trim();
  if (trimmed) params.set("q", trimmed);
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/blog/search/?${qs}` : "/blog/search/";
}
