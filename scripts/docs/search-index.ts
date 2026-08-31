const MAX_GENERATED_ITEMS_PER_PROJECT = 1200;

export interface SearchProject {
  slug: string;
  displayName: string;
  href?: string;
  shortName?: string;
  projectKey?: string;
  module?: string;
  repositoryName?: string;
  repositoryUrl?: string;
  shortDescription?: string;
  longDescription?: string;
  publishedGuideUrl?: string;
  searchTerms?: string[];
  sections?: SearchSection[];
}

/**
 * Every module publishes its API and configuration references next to the
 * guide the catalog records, so both links derive from `publishedGuideUrl`.
 * Shared by the docs pages' corner links and the search index.
 */
export function projectReferenceLinks(publishedGuideUrl: string) {
  return [
    {
      label: "API Reference",
      href: new URL("../api/", publishedGuideUrl).href,
    },
    {
      label: "Configuration Reference",
      href: new URL("configurationreference.html", publishedGuideUrl).href,
    },
  ];
}

interface SearchSection {
  id: string;
  number?: string;
  title: string;
  summary?: string;
}

export interface SearchItem {
  kind: string;
  title: string;
  description: string;
  href: string;
  terms: string;
  scope: string;
  weight?: number;
}

export function buildDocsSearchIndex(
  projects: SearchProject[],
  generatedHtmlBySlug: Record<string, string> = {},
): SearchItem[] {
  const items: SearchItem[] = [];
  const seen = new Set<string>();

  pushItem(items, seen, {
    kind: "Docs",
    title: "Configuration Reference",
    description:
      "Every documented configuration property across Micronaut modules, unified into one searchable reference.",
    href: "/docs/configuration-reference/",
    terms:
      "configuration reference properties settings options unified all modules",
    scope: "Docs",
    weight: 2,
  });

  for (const project of projects) {
    pushItem(items, seen, {
      kind: "Project",
      title: project.displayName,
      description:
        project.shortDescription ||
        project.longDescription ||
        project.module ||
        "Micronaut project documentation.",
      href: project.href || `/docs/${project.slug}/`,
      terms: [
        project.displayName,
        project.shortName,
        project.projectKey,
        project.module,
        project.repositoryName,
        project.shortDescription,
        project.longDescription,
        ...(project.searchTerms || []),
      ]
        .filter(Boolean)
        .join(" "),
      scope: "Projects",
    });

    for (const section of project.sections || []) {
      pushItem(items, seen, {
        kind: "Docs",
        title: `${project.displayName}: ${section.title}`,
        description:
          section.summary || `${project.displayName} documentation section.`,
        href: `${project.href || `/docs/${project.slug}/`}#${section.id}`,
        terms: [
          project.displayName,
          section.number,
          section.title,
          section.summary,
        ]
          .filter(Boolean)
          .join(" "),
        scope: "Docs",
      });
    }

    if (project.repositoryUrl) {
      pushItem(items, seen, {
        kind: "Repo",
        title: project.repositoryName || `${project.displayName} repository`,
        description: `Source repository for ${project.displayName}.`,
        href: project.repositoryUrl,
        terms: [
          project.displayName,
          project.repositoryName,
          project.repositoryUrl,
          project.module,
        ]
          .filter(Boolean)
          .join(" "),
        scope: "Repos",
      });
    }

    if (project.publishedGuideUrl) {
      for (const reference of projectReferenceLinks(
        project.publishedGuideUrl,
      )) {
        pushItem(items, seen, {
          kind: "Docs",
          title: `${project.displayName}: ${reference.label}`,
          description:
            reference.label === "API Reference"
              ? `Published API documentation for ${project.displayName}.`
              : `Published configuration reference for ${project.displayName}.`,
          href: reference.href,
          terms: [
            project.displayName,
            project.projectKey,
            project.module,
            reference.label,
            "javadoc api configuration reference",
          ]
            .filter(Boolean)
            .join(" "),
          scope: "Docs",
        });
      }
    }

    const generatedItems = extractGeneratedDocSearchItems(
      project,
      generatedHtmlBySlug[project.slug] || "",
    );
    for (const item of generatedItems.slice(
      0,
      MAX_GENERATED_ITEMS_PER_PROJECT,
    )) {
      pushItem(items, seen, item);
    }
  }

  return items;
}

export function extractGeneratedDocSearchItems(
  project: SearchProject,
  html: string,
): SearchItem[] {
  if (!html) {
    return [];
  }

  return [
    ...extractHeadingItems(project, html),
    ...extractPropertyItems(project, html),
    ...extractClassItems(project, html),
  ];
}

function extractHeadingItems(
  project: SearchProject,
  html: string,
): SearchItem[] {
  const items: SearchItem[] = [];
  const headingPattern =
    /<div class="guide-section-heading">\s*<h([12]) id="([^"]+)"><a class="anchor" href="#[^"]+"><\/a>([\s\S]*?)<\/h\1>/g;
  for (const match of html.matchAll(headingPattern)) {
    const label = cleanText(match[3]);
    if (!label) {
      continue;
    }
    items.push({
      kind: "Docs",
      title: `${project.displayName}: ${label}`,
      description:
        match[1] === "1"
          ? "Top-level generated documentation section."
          : "Generated documentation subsection.",
      href: `${project.href || `/docs/${project.slug}/`}#${match[2]}`,
      terms: [project.displayName, project.projectKey, project.module, label]
        .filter(Boolean)
        .join(" "),
      scope: "Docs",
      weight: match[1] === "1" ? 2 : 1,
    });
  }
  return items;
}

/**
 * Table rows of a generated module guide whose first cell reads as a
 * configuration property name, e.g. `micronaut.server.port`.
 */
export function extractConfigurationPropertyRows(
  html: string,
): { property: string; details: string[] }[] {
  const rows: { property: string; details: string[] }[] = [];
  const rowPattern = /<tr\b[^>]*>([\s\S]*?)<\/tr>/g;

  for (const match of html.matchAll(rowPattern)) {
    const cells = Array.from(
      match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g),
      (cell: RegExpMatchArray): string => cleanText(cell[1]),
    );
    if (cells.length < 2) {
      continue;
    }
    const property = cells[0];
    if (!isConfigurationPropertyName(property)) {
      continue;
    }
    rows.push({ property, details: cells.slice(1).filter(Boolean) });
  }

  return rows;
}

function extractPropertyItems(
  project: SearchProject,
  html: string,
): SearchItem[] {
  return extractConfigurationPropertyRows(html).map(
    ({ property, details }) => ({
      kind: "Property",
      title: property,
      description:
        details.join(" - ") || `${project.displayName} configuration property.`,
      // The unified reference guarantees this anchor; the module page does not.
      href: `/docs/configuration-reference/#${project.slug}-configuration-reference`,
      terms: [
        project.displayName,
        project.projectKey,
        project.module,
        property,
        ...details,
      ]
        .filter(Boolean)
        .join(" "),
      scope: "Properties",
    }),
  );
}

function extractClassItems(project: SearchProject, html: string): SearchItem[] {
  const items: SearchItem[] = [];
  const linkPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/g;
  for (const match of html.matchAll(linkPattern)) {
    const href = attributeValue(match[1], "href");
    if (!href || !/\/api\/.+\.html(?:[#?][^"]*)?$/.test(href)) {
      continue;
    }
    const label = cleanText(match[2]);
    const className = classNameFromApiHref(href, label);
    if (!className) {
      continue;
    }
    items.push({
      kind: "Class",
      title: className,
      description: `${project.displayName} API reference.`,
      href: absoluteDocsHref(project, href),
      terms: [
        project.displayName,
        project.projectKey,
        project.module,
        className,
        label,
      ]
        .filter(Boolean)
        .join(" "),
      scope: "Classes",
    });
  }
  return items;
}

function pushItem(
  items: SearchItem[],
  seen: Set<string>,
  item: SearchItem,
): void {
  const key = `${item.scope}:${item.href}:${item.title}`;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  items.push(item);
}

function absoluteDocsHref(project: SearchProject, href: string): string {
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(href) || href.startsWith("//")) {
    return href;
  }
  const resolved = new URL(
    href,
    `https://example.test${project.href || `/docs/${project.slug}/`}`,
  );
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

function classNameFromApiHref(href: string, label: string): string {
  if (looksLikeClassName(label)) {
    return label;
  }
  const withoutHash = href.split(/[?#]/)[0];
  const file = withoutHash
    .slice(withoutHash.lastIndexOf("/") + 1)
    .replace(/\.html$/, "");
  return looksLikeClassName(file) ? file : "";
}

function looksLikeClassName(value: string): boolean {
  return /^[A-Z_$][\w$]*(?:\.[\w$]+)?(?:\([^)]*\))?$/.test(
    String(value || "").trim(),
  );
}

/**
 * Configuration keys are lowercase kebab-case segments joined by dots, e.g.
 * `micronaut.server.cors.configurations.*.allowed-origins`. Case-sensitive
 * and dot-required on purpose: the guides' tables also list Java class names
 * (`java.util.Optional`), camelCase examples (`myApp.myStuff`), and CLI
 * commands (`create-app`), none of which are properties.
 */
function isConfigurationPropertyName(value: string): boolean {
  return /^[a-z][a-z0-9-]*(?:\.[a-z0-9*[\]-]+)+$/.test(
    String(value || "").trim(),
  );
}

function attributeValue(source: string, name: string): string {
  const pattern = new RegExp(`\\b${name}="([^"]*)"`);
  return pattern.exec(source)?.[1] || "";
}

function cleanText(value: string): string {
  return decodeEntities(
    String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}
