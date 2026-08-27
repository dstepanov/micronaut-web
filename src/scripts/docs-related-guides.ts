import { withSurfacePath } from "@/lib/base-path";
import {
  guideOptionPath,
  guideOverviewPath,
  preferredGuideOption,
  type GeneratedGuide,
  type GeneratedGuidesManifest,
} from "@/lib/generated-guide-routing";

for (const section of document.querySelectorAll<HTMLElement>(
  "[data-docs-related-guides]",
)) {
  observe(section);
}

function observe(section: HTMLElement) {
  if (!("IntersectionObserver" in window)) {
    void load(section);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void load(section);
    },
    { rootMargin: "240px" },
  );
  observer.observe(section);
}

async function load(section: HTMLElement) {
  const aliases = new Set(
    parseAliases(section.dataset.topicAliases)
      .map(normalizeTopic)
      .filter(Boolean),
  );
  if (!aliases.size || !section.dataset.manifestUrl) {
    section.remove();
    return;
  }
  try {
    const response = await fetch(section.dataset.manifestUrl, {
      credentials: "omit",
    });
    if (!response.ok)
      throw new Error(`Guide manifest returned ${response.status}`);
    const manifest: unknown = await response.json();
    if (!isGeneratedGuidesManifest(manifest)) {
      throw new Error("Guide manifest is missing guides.");
    }
    const guides = latestMatchingGuides(manifest.guides, aliases);
    if (!guides.length) {
      section.remove();
      return;
    }
    render(section, guides);
  } catch {
    section.remove();
  }
}

function render(section: HTMLElement, guides: GeneratedGuide[]) {
  const grid = section.querySelector<HTMLElement>(
    "[data-docs-related-guides-grid]",
  );
  const cardTemplate = section.querySelector<HTMLTemplateElement>(
    "template[data-docs-related-guide-template]",
  );
  const moreTemplate = section.querySelector<HTMLTemplateElement>(
    "template[data-docs-related-guides-more-template]",
  );
  if (!grid || !cardTemplate || !moreTemplate) return;
  grid.replaceChildren(
    ...guides.map((guide, index) => {
      const item = cardTemplate.content.firstElementChild?.cloneNode(true);
      if (!(item instanceof HTMLElement)) return document.createElement("div");
      populateCard(item, guide);
      if (index === guides.length - 1) {
        item
          .querySelector(".docs-related-guides-spacer")
          ?.replaceWith(moreTemplate.content.cloneNode(true));
      }
      return item;
    }),
  );
  section.setAttribute("aria-busy", "false");
}

function populateCard(item: HTMLElement, guide: GeneratedGuide) {
  const option = preferredGuideOption(guide);
  const href = withSurfacePath(
    "guides",
    option
      ? guideOptionPath(option, "/guides")
      : guideOverviewPath(guide, "/guides"),
  );
  const title = item.querySelector<HTMLAnchorElement>(
    "[data-related-guide-title]",
  );
  const read = item.querySelector<HTMLAnchorElement>(
    "[data-related-guide-read]",
  );
  if (title) {
    title.textContent = guide.title;
    title.href = href;
  }
  if (read) read.href = href;
  setText(item, "[data-related-guide-description]", guide.intro);
  populateBadges(
    item,
    (guide.categories.length ? guide.categories : guide.tags).slice(0, 2),
  );

  const date = item.querySelector<HTMLTimeElement>("[data-related-guide-date]");
  if (date && guide.publicationDate) {
    date.dateTime = guide.publicationDate;
    date.textContent = formatGuideDate(guide.publicationDate);
  } else {
    date?.remove();
  }
}

function populateBadges(item: HTMLElement, badges: string[]) {
  const container = item.querySelector<HTMLElement>(
    "[data-related-guide-badges]",
  );
  const template = container?.querySelector<HTMLElement>(
    "[data-related-guide-badge]",
  );
  if (!container || !template || !badges.length) {
    container?.remove();
    return;
  }
  container.replaceChildren(
    ...badges.map((label) => {
      const badge = template.cloneNode(true) as HTMLElement;
      badge.textContent = label;
      return badge;
    }),
  );
}

function setText(root: HTMLElement, selector: string, value: string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

function latestMatchingGuides(guides: GeneratedGuide[], aliases: Set<string>) {
  return guides
    .filter((guide) => guideMatchesAliases(guide, aliases))
    .sort(
      (left, right) =>
        right.publicationDate.localeCompare(left.publicationDate) ||
        left.title.localeCompare(right.title),
    )
    .slice(0, 3);
}

function guideMatchesAliases(guide: GeneratedGuide, aliases: Set<string>) {
  const topics = new Set(
    [guide.slug, ...guide.tags, ...guide.categories]
      .map(normalizeTopic)
      .filter(Boolean),
  );
  return [...aliases].some((alias) => topics.has(alias));
}

function normalizeTopic(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseAliases(value: string | undefined): string[] {
  try {
    const aliases: unknown = JSON.parse(value || "[]");
    return Array.isArray(aliases) &&
      aliases.every((alias) => typeof alias === "string")
      ? aliases
      : [];
  } catch {
    return [];
  }
}

function isGeneratedGuidesManifest(
  value: unknown,
): value is GeneratedGuidesManifest {
  return (
    value !== null &&
    typeof value === "object" &&
    Array.isArray((value as { guides?: unknown }).guides)
  );
}

function formatGuideDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}
