export type ComingSoonGridItem = {
  id: string;
  icon?: string;
  icons?: readonly string[];
  title: string;
  desc: string;
  href?: string;
};

export type RelatedFeatureCard =
  | { kind: "feature"; feature: import("astro:content").CollectionEntry<"features"> }
  | { kind: "comingSoon"; item: ComingSoonGridItem };

export const COMING_SOON_GRID_ITEMS: ComingSoonGridItem[] = [
  {
    id: "shared-spaces",
    icon: "fa6-solid:user-group",
    title: "Shared spaces",
    desc: "An optional paid add-on will add shared spaces your whole group can study in.",
    href: "/add-ons/shared-spaces/",
  },
  {
    id: "review-challenges",
    icons: ["fa6-solid:clock-rotate-left", "fa6-solid:trophy"],
    title: "Review & Challenges",
    desc: "Optional paid add-ons for spaced review from your notes and themed study seasons.",
  },
  {
    id: "connector",
    icon: "fa6-solid:puzzle-piece",
    title: "Connector",
    desc: "An optional paid add-on will let you reference your study in Claude and ChatGPT.",
  },
  {
    id: "apple-apps",
    icon: "fa6-solid:mobile-screen",
    title: "Mac, iPad & iPhone",
    desc: "Native apps for Apple platforms. Harvous is on the web today.",
  },
];

export function getComingSoonGridItem(id: string): ComingSoonGridItem | undefined {
  return COMING_SOON_GRID_ITEMS.find((item) => item.id === id);
}

export function getComingSoonGridItems(ids?: string[]): ComingSoonGridItem[] {
  if (!ids) return COMING_SOON_GRID_ITEMS;
  return COMING_SOON_GRID_ITEMS.filter((item) => ids.includes(item.id));
}
