/** Shared types and helpers for feature + add-on detail pages. */

export const SITE = "https://harvous.com";

export type FeatureShowcaseColor = "amber" | "sky" | "mint" | "violet" | "coral";

export type ProductSection = {
  heading: string;
  paragraphs: string[];
};

export type ProductMoment = {
  icon: string;
  heading: string;
  body: string;
};

export type ProductShowcase = {
  eyebrow: string;
  title: string;
  color: FeatureShowcaseColor;
  reverse?: boolean;
  body: string[];
  image: string;
  imageAlt: string;
};

export type ProductPage = {
  kind: "feature" | "addon";
  slug: string;
  href: string;
  title: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  icon: string;
  ink: string;
  image?: string;
  comingSoon?: boolean;
  comingSoonLine?: string;
  heroTitle: string;
  heroLead: string;
  sections: ProductSection[];
  showcases: ProductShowcase[];
  moments: ProductMoment[];
  relatedIds: string[];
  compareSlugs?: string[];
  relatedHeading: string;
  relatedLead: string;
  closingHeading: string;
  closingLead: string;
};

export type FeatureDetailData = {
  title: string;
  tagline: string;
  draft?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  heroTitle?: string;
  heroLead?: string;
  ink?: string;
  icon?: string;
  image?: string;
  comingSoon?: boolean;
  comingSoonLine?: string;
  sections?: ProductSection[];
  showcases?: ProductShowcase[];
  moments?: ProductMoment[];
  relatedFeatureIds?: string[];
  compareSlugs?: string[];
  relatedHeading?: string;
  relatedLead?: string;
  closingHeading?: string;
  closingLead?: string;
};

export function hasDetailContent(data: FeatureDetailData): boolean {
  return Boolean(data.heroTitle && data.sections?.length);
}

export function featureToProductPage(slug: string, data: FeatureDetailData): ProductPage {
  return {
    kind: "feature",
    slug,
    href: `/features/${slug}/`,
    title: data.tagline,
    tagline: data.title,
    seoTitle: data.seoTitle ?? `${data.tagline} — Harvous`,
    seoDescription: data.seoDescription ?? data.title,
    icon: data.icon ?? "fa6-solid:note-sticky",
    ink: data.ink ?? "var(--study-dock-accent-skyBlue)",
    image: data.image,
    comingSoon: data.comingSoon,
    comingSoonLine: data.comingSoonLine,
    heroTitle: data.heroTitle!,
    heroLead: data.heroLead ?? data.title,
    sections: data.sections ?? [],
    showcases: data.showcases ?? [],
    moments: data.moments ?? [],
    relatedIds: data.relatedFeatureIds ?? [],
    compareSlugs: data.compareSlugs,
    relatedHeading: data.relatedHeading ?? "Works well with",
    relatedLead:
      data.relatedLead ??
      "Harvous features are built to work together — scripture, highlights, and threads in one study Bible.",
    closingHeading: data.closingHeading ?? data.heroTitle!,
    closingLead: data.closingLead ?? data.title,
  };
}

export function buildFeatureJsonLd(page: ProductPage) {
  const pageUrl = `${SITE}${page.href}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.seoTitle,
        description: page.seoDescription,
        url: pageUrl,
        isPartOf: { "@type": "WebSite", name: "Harvous", url: SITE },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Harvous", item: SITE },
          { "@type": "ListItem", position: 2, name: "Features", item: `${SITE}/features/` },
          { "@type": "ListItem", position: 3, name: page.title, item: pageUrl },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Harvous",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        featureList: page.title,
      },
    ],
  };
}

export function buildAddonJsonLd(page: ProductPage) {
  const pageUrl = `${SITE}${page.href}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.seoTitle,
        description: page.seoDescription,
        url: pageUrl,
        isPartOf: { "@type": "WebSite", name: "Harvous", url: SITE },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Harvous", item: SITE },
          { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE}/pricing/` },
          { "@type": "ListItem", position: 3, name: page.title, item: pageUrl },
        ],
      },
      {
        "@type": "Offer",
        name: page.title,
        description: page.seoDescription,
        url: pageUrl,
        category: "add-on",
        offeredBy: { "@type": "Organization", name: "Testament Made LLC", url: SITE },
      },
    ],
  };
}
