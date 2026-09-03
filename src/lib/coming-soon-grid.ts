export type ComingSoonGridItem = {
  id: string;
  icon?: string;
  icons?: readonly string[];
  title: string;
  desc: string;
  href?: string;
  /** When false, the product is live — no “Coming soon” chip. Defaults to true. */
  comingSoon?: boolean;
};

export type RelatedFeatureCard =
  | { kind: "feature"; feature: import("astro:content").CollectionEntry<"features"> }
  | { kind: "comingSoon"; item: ComingSoonGridItem };

/** Product cards referenced from use-case / audience / blog bridges + homepage. */
export const PRODUCT_GRID_ITEMS: ComingSoonGridItem[] = [
  {
    id: "shared-spaces",
    icon: "fa7-solid:user-group",
    title: "Shared spaces",
    desc: "Host a room for your group with Harvous Plus. Joining is always free.",
    href: "/add-ons/shared-spaces/",
    comingSoon: false,
  },
  {
    id: "review",
    icon: "fa7-solid:clock-rotate-left",
    title: "Review",
    desc: "Write an answer from memory, then say how it went — from your own notes, never an invented question. Included with Harvous Plus.",
    href: "/add-ons/review/",
    comingSoon: false,
  },
  {
    // Deliberately light on specifics — solo vs. group, in-app vs. guest, the
    // exact cadence are all still moving. Nothing here should need rewriting
    // again before the shape is locked; see the "may be Friday" plan note.
    id: "challenges",
    icon: "fa7-solid:trophy",
    title: "Challenges",
    desc: "Time-boxed challenges to build the habit — solo or with others.",
  },
  {
    id: "connector",
    icon: "fa7-solid:puzzle-piece",
    title: "Connector",
    desc: "An optional paid add-on will let you reference your study in Claude and ChatGPT.",
  },
  {
    id: "apple-apps",
    icon: "fa7-solid:mobile-screen",
    title: "Mac, iPad & iPhone",
    desc: "Native apps for Apple platforms. Harvous is on the web today.",
  },
];

/** Roadmap-only items for the homepage “Coming soon” strip. */
export const COMING_SOON_GRID_ITEMS: ComingSoonGridItem[] = PRODUCT_GRID_ITEMS.filter(
  (item) => item.comingSoon !== false
);

export function getComingSoonGridItem(id: string): ComingSoonGridItem | undefined {
  return PRODUCT_GRID_ITEMS.find((item) => item.id === id);
}

export function getComingSoonGridItems(ids?: string[]): ComingSoonGridItem[] {
  if (!ids) return COMING_SOON_GRID_ITEMS;
  return COMING_SOON_GRID_ITEMS.filter((item) => ids.includes(item.id));
}

export function isComingSoonGridItem(item: ComingSoonGridItem): boolean {
  return item.comingSoon !== false;
}
