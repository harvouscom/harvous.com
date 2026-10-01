/**
 * The Discover card's data, decided once: which stage it gets (a template's
 * page, a thread's rows, a resource's plate), its byline, colours and CTA.
 * Shared by the /discover/ grid and anywhere else a listing is shown as a card
 * (use-case pages, a listing's "more like this").
 */
import { sanitizeListingHtml } from "../sanitize-listing-html.ts";
import {
  DISCOVER_KIND_NOUN,
  DISCOVER_RESOURCE_TYPE_NOUN,
  discoverListingCta,
  discoverListingHref,
  discoverListingIcon,
  discoverListingInk,
  discoverArtPosition,
  discoverDocumentArt,
  discoverTopicArt,
  type DiscoverListing,
} from "../discover-data.ts";

export type Card = {
  listing: DiscoverListing;
  href: string;
  tone: string;
  label: string;
  by: string | null;
  logo: string | null;
  stage: "paper" | "stack" | "plate";
  typeLabel: string;
  plateTone: string | null;
  art: string | null;
  artPos: string;
  docArt: string | null;
  bodyHtml: string;
  excerpt: string;
  titles: string[];
  titlesMore: number;
  image: string | null;
  isVideo: boolean;
  duration: string | null;
  icon: string;
  cta: string;
  search: string;
};

export function toDiscoverCard(listing: DiscoverListing): Card {

  const preview = listing.preview ?? {};
  const source = listing.source ?? null;
  const kindNoun = DISCOVER_KIND_NOUN[listing.kind] ?? "Item";
  const resourceType = listing.resourceType ?? null;
  const typeLabel = resourceType ? DISCOVER_RESOURCE_TYPE_NOUN[resourceType] : kindNoun;
  const fileType = (preview.fileType ?? "").trim().toUpperCase();

  /* The byline, exactly as the live card decides it. */
  const by = source
    ? typeLabel
    : preview.official
      ? "Included"
      : listing.authorDisplayName || preview.sourceName || null;

  const bodyHtml = sanitizeListingHtml(preview.bodyHtml ?? "");
  const titles = (preview.titles ?? []).slice(0, 3);
  const image = preview.sourceImage ?? null;

  const stage: Card["stage"] =
    listing.kind === "template" || listing.kind === "note"
      ? "paper"
      : listing.kind === "pack"
        ? "stack"
        : "plate";

  /* The plate's ground, as the live card decides it: the publisher's own
     colour when it has one, otherwise the topic's wash. */
  const plateTone = listing.plateTone ?? null;

  return {
    listing,
    href: discoverListingHref(listing),
    tone: listing.plateTone ?? discoverListingInk(listing),
    label: source ? source.name : kindNoun,
    by: source ? by : (by ?? (listing.kind === "resource" ? fileType || preview.sourceDomain || null : null)),
    logo: source?.logo ?? null,
    stage,
    typeLabel: source ? typeLabel : fileType || preview.sourceDomain || typeLabel,
    plateTone,
    art: plateTone ? null : discoverTopicArt(listing.category),
    artPos: discoverArtPosition(listing.slug),
    docArt: source && plateTone ? null : discoverDocumentArt(listing.slug),
    bodyHtml,
    excerpt: preview.excerpt ?? "",
    titles,
    titlesMore: (preview.noteCount ?? 0) - titles.length,
    image,
    isVideo: resourceType === "video" && Boolean(listing.video),
    duration: listing.video?.durationLabel ?? null,
    icon: discoverListingIcon(listing),
    cta: discoverListingCta(listing).primary.label,
    /* Same fields the live card searches. */
    search: [
      listing.title,
      listing.description,
      listing.authorDisplayName,
      kindNoun,
      source?.name,
      source?.domain,
      typeLabel,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}
