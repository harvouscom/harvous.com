/**
 * Structured data for the marketing pages, restored verbatim from the pages
 * that carried it before the redesign (each was inline in its own .astro file
 * and was dropped when the page was rebuilt). Kept together so a redesign of a
 * page's markup can't quietly lose its schema again.
 */
import type { CollectionEntry } from "astro:content";
import { blogAuthorJsonLd, blogBreadcrumbJsonLd, brightEnoughBlogJsonLd, blogCategoryHref, blogCategoryLabel, type resolveBlogAuthor } from "./blog.ts";
import { breadcrumbJsonLd } from "./breadcrumb-jsonld.ts";
import { discoverListingHref, type DiscoverListing } from "./discover-data.ts";

const site = "https://harvous.com";

export function aboutJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "About Harvous",
        description:
          "Harvous is a place for Bible study to live — a notes hub so what you learn from Scripture doesn't disappear. Humans help humans. Tools only help.",
        url: `${site}/about/`,
        isPartOf: { "@type": "WebSite", name: "Harvous", url: site },
      },
      {
        "@type": "Organization",
        name: "Testament Made LLC",
        url: site,
        logo: `${site}/images/harvous-2-icon.png`,
        founder: { "@type": "Person", name: "Derek Castelli", email: "derek@harvous.com" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Harvous", item: site },
          { "@type": "ListItem", position: 2, name: "About", item: `${site}/about/` },
        ],
      },
    ],
  };
}

export function pricingJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Harvous Pricing",
        description:
          "Harvous is free for personal Bible study. Harvous Plus includes unlimited history, Review exercises, and Shared Spaces hosting — $6/mo or $36/yr.",
        url: `${site}/pricing/`,
        isPartOf: { "@type": "WebSite", name: "Harvous", url: site },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Harvous", item: `${site}/` },
          { "@type": "ListItem", position: 2, name: "Pricing", item: `${site}/pricing/` },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Harvous",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        offers: [
          { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free tier — unlimited notes and core Bible study features" },
          {
            "@type": "Offer",
            name: "Harvous Plus",
            price: "36",
            priceCurrency: "USD",
            description:
              "Harvous Plus — $36/yr or $6/mo. Includes unlimited history, Review exercises, and Shared Spaces hosting (unlimited spaces, up to 12 people per space). Joining is always free.",
          },
        ],
      },
    ],
  };
}

export function threeJsonLd(description: string) {
  const pageUrl = `${site}/3/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Harvous 3",
        description,
        url: pageUrl,
        isPartOf: { "@type": "WebSite", name: "Harvous", url: site },
        about: {
          "@type": "SoftwareApplication",
          name: "Harvous",
          softwareVersion: "3.0",
          applicationCategory: "ProductivityApplication",
          operatingSystem: "Web",
          url: site,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Harvous", item: `${site}/` },
          { "@type": "ListItem", position: 2, name: "Harvous 3", item: pageUrl },
        ],
      },
    ],
  };
}

export function compareHubJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Compare Harvous",
        description:
          "See how Harvous compares to other Bible apps, notes apps, and study tools — a Bible notes alternative focused on remembering what you saved.",
        url: `${site}/compare/`,
        isPartOf: { "@type": "WebSite", name: "Harvous", url: site },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Harvous", item: `${site}/` },
          { "@type": "ListItem", position: 2, name: "Compare", item: `${site}/compare/` },
        ],
      },
    ],
  };
}

export function discoverHubJsonLd(listings: DiscoverListing[]) {
  const pageUrl = `${site}/discover/`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Discover",
      description:
        "Free Bible study templates, notes and Threads shared by people who use Harvous, " +
        "plus videos and guides from BibleProject and others.",
      url: pageUrl,
      isAccessibleForFree: true,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: listings.length,
        itemListElement: listings.map((listing, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: listing.title,
          url: new URL(discoverListingHref(listing), site).toString(),
        })),
      },
    },
    breadcrumbJsonLd(
      [
        { name: "Harvous", path: "/" },
        { name: "Discover", path: "/discover/" },
      ],
      site,
    ),
  ];
}

export function blogHubJsonLd(posts: CollectionEntry<"blog">[]) {
  return [
    brightEnoughBlogJsonLd(site, {
      blogPost: posts.slice(0, 10).map((p) => ({
        "@type": "BlogPosting",
        headline: p.data.title,
        url: new URL(`/blog/${p.id}/`, site).toString(),
        datePublished: p.data.publishDate.toISOString(),
        description: p.data.description,
      })),
    }),
    blogBreadcrumbJsonLd(
      [
        { name: "Harvous", path: "/" },
        { name: "Bright Enough", path: "/blog/" },
      ],
      site,
    ),
  ];
}

export function blogPostJsonLd(
  post: CollectionEntry<"blog">,
  opts: { description: string; featThumb: string; author: ReturnType<typeof resolveBlogAuthor> },
) {
  const pageUrl = new URL(`/blog/${post.id}/`, site).toString();
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.data.title,
      description: opts.description,
      datePublished: post.data.publishDate.toISOString(),
      image: [new URL(opts.featThumb, site).toString()],
      url: pageUrl,
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      author: blogAuthorJsonLd(opts.author, site),
      publisher: {
        "@type": "Organization",
        name: "Harvous",
        url: site,
        logo: { "@type": "ImageObject", url: new URL("/images/harvous-2-icon.png", site).toString() },
      },
      isPartOf: { "@type": "Blog", name: "Bright Enough", url: new URL("/blog/", site).toString() },
    },
    blogBreadcrumbJsonLd(
      [
        { name: "Harvous", path: "/" },
        { name: "Bright Enough", path: "/blog/" },
        { name: blogCategoryLabel(post.data.category), path: blogCategoryHref(post.data.category) },
        { name: post.data.title, path: `/blog/${post.id}/` },
      ],
      site,
    ),
  ];
}

export function releaseNotesIndexJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Harvous Release Notes",
    description: "Release notes and updates for Harvous, the Bible study notes app.",
    url: `${site}/release-notes/`,
  };
}

/** The WebPage + breadcrumb pair shared by audience, use-case and release pages. */
export function pageWithBreadcrumbJsonLd(
  page: { name: string; description: string; path: string; datePublished?: string },
  trail: { name: string; path: string }[],
) {
  const url = `${site}${page.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", name: page.name, description: page.description, url, ...(page.datePublished ? { datePublished: page.datePublished } : {}) },
      {
        "@type": "BreadcrumbList",
        itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${site}${t.path}` })),
      },
    ],
  };
}
