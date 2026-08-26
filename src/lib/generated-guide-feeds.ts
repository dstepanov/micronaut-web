/**
 * The three catalog documents the legacy guides host published beside the
 * index: `guides.json`, `rss.xml`, and `feed.json`. They are consumed off-site
 * — `guides.json` is what the upstream guides CLI reads — so this site has to
 * keep serving all three once it owns guides.micronaut.io.
 *
 * Shapes and ordering follow the legacy documents, including their
 * slug-alphabetical item order, so a consumer written against them keeps
 * working unchanged.
 */
import { canonicalSurfaceUrl } from "@/lib/base-path";
import {
  GUIDES_ROOT,
  guideOverviewPath,
  type GeneratedGuide,
  type GeneratedGuidesManifest,
} from "@/lib/generated-guide-routing";

const FEED_TITLE = "Micronaut Guides";

function guidesInFeedOrder(manifest: GeneratedGuidesManifest) {
  return [...manifest.guides].sort((left, right) =>
    left.slug.localeCompare(right.slug),
  );
}

function guideUrl(guide: GeneratedGuide) {
  return canonicalSurfaceUrl("guides", guideOverviewPath(guide, GUIDES_ROOT));
}

function homePageUrl() {
  return canonicalSurfaceUrl("guides", `${GUIDES_ROOT}/`);
}

/** The catalog the guides CLI reads. */
export function guidesCatalogDocument(manifest: GeneratedGuidesManifest) {
  return guidesInFeedOrder(manifest).map((guide) => ({
    title: guide.title,
    intro: guide.intro,
    authors: guide.authors,
    tags: guide.tags,
    // Retained under its legacy name; `categories` superseded it.
    category: guide.categories[0] ?? null,
    categories: guide.categories,
    publicationDate: guide.publicationDate,
    slug: guide.slug,
    url: guideUrl(guide),
    options: guide.options.map((option) => ({
      buildTool: option.buildTool.toUpperCase(),
      language: option.language.toUpperCase(),
      url: canonicalSurfaceUrl(
        "guides",
        `${GUIDES_ROOT}/${option.file.replace(/\.html$/, "")}/`,
      ),
    })),
  }));
}

export function guidesJsonFeedDocument(manifest: GeneratedGuidesManifest) {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: FEED_TITLE,
    home_page_url: homePageUrl(),
    feed_url: canonicalSurfaceUrl("guides", `${GUIDES_ROOT}/feed.json`),
    items: guidesInFeedOrder(manifest).map((guide) => ({
      id: guide.slug,
      url: guideUrl(guide),
      title: guide.title,
      content_text: guide.intro,
      date_published: `${guide.publicationDate}T00:00:00Z`,
      authors: guide.authors.map((name) => ({ name })),
      tags: guide.tags,
      language: "LANG_ENGLISH",
    })),
  };
}

export function guidesRssDocument(manifest: GeneratedGuidesManifest) {
  const items = guidesInFeedOrder(manifest)
    .map((guide) =>
      [
        "<item>",
        `<title>${xml(guide.title)}</title>`,
        `<link>${xml(guideUrl(guide))}</link>`,
        `<description>${xml(guide.intro)}</description>`,
        ...guide.authors.map((author) => `<author>${xml(author)}</author>`),
        ...guide.tags.map((tag) => `<category>${xml(tag)}</category>`),
        `<guid>${xml(guide.slug)}</guid>`,
        `<pubDate>${rssDate(guide.publicationDate)}</pubDate>`,
        "</item>",
      ].join(""),
    )
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">',
    "<channel>",
    `<title>${FEED_TITLE}</title>`,
    `<link>${xml(homePageUrl())}</link>`,
    `<description>RSS feed for ${FEED_TITLE}</description>`,
    "<language>en</language>",
    items,
    "</channel>",
    "</rss>",
    "",
  ].join("");
}

const RSS_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RSS_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** `Thu, 24 May 2018 00:00:00 Z`, the spelling the legacy feed used. */
function rssDate(publicationDate: string) {
  const date = new Date(`${publicationDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  return [
    `${RSS_DAYS[date.getUTCDay()]},`,
    day,
    RSS_MONTHS[date.getUTCMonth()],
    date.getUTCFullYear(),
    "00:00:00",
    "Z",
  ].join(" ");
}

function xml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
