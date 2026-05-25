const MAX_GENERATED_ITEMS_PER_PROJECT = 1200;

export function buildDocsSearchIndex(projects, generatedHtmlBySlug = {}) {
  const items = [];
  const seen = new Set();

  for (const project of projects) {
    pushItem(items, seen, {
      kind: "Project",
      title: project.displayName,
      description: project.shortDescription || project.longDescription || project.module || "Micronaut project documentation.",
      href: project.href || `/docs/${project.slug}/`,
      terms: [
        project.displayName,
        project.shortName,
        project.projectKey,
        project.module,
        project.repositoryName,
        project.shortDescription,
        project.longDescription,
        ...(project.searchTerms || [])
      ].filter(Boolean).join(" "),
      scope: "Projects"
    });

    for (const section of project.sections || []) {
      pushItem(items, seen, {
        kind: "Docs",
        title: `${project.displayName}: ${section.title}`,
        description: section.summary || `${project.displayName} documentation section.`,
        href: `${project.href || `/docs/${project.slug}/`}#${section.id}`,
        terms: [project.displayName, section.number, section.title, section.summary].filter(Boolean).join(" "),
        scope: "Docs"
      });
    }

    if (project.repositoryUrl) {
      pushItem(items, seen, {
        kind: "Repo",
        title: project.repositoryName || `${project.displayName} repository`,
        description: `Source repository for ${project.displayName}.`,
        href: project.repositoryUrl,
        terms: [project.displayName, project.repositoryName, project.repositoryUrl, project.module].filter(Boolean).join(" "),
        scope: "Repos"
      });
    }

    const generatedItems = extractGeneratedDocSearchItems(project, generatedHtmlBySlug[project.slug] || "");
    for (const item of generatedItems.slice(0, MAX_GENERATED_ITEMS_PER_PROJECT)) {
      pushItem(items, seen, item);
    }
  }

  return items;
}

export function extractGeneratedDocSearchItems(project, html) {
  if (!html) {
    return [];
  }

  return [
    ...extractHeadingItems(project, html),
    ...extractPropertyItems(project, html),
    ...extractClassItems(project, html)
  ];
}

function extractHeadingItems(project, html) {
  const items = [];
  const headingPattern = /<div class="guide-section-heading">\s*<h([12]) id="([^"]+)"><a class="anchor" href="#[^"]+"><\/a>([\s\S]*?)<\/h\1>/g;
  for (const match of html.matchAll(headingPattern)) {
    const label = cleanText(match[3]);
    if (!label) {
      continue;
    }
    items.push({
      kind: "Docs",
      title: `${project.displayName}: ${label}`,
      description: match[1] === "1" ? "Top-level generated documentation section." : "Generated documentation subsection.",
      href: `${project.href || `/docs/${project.slug}/`}#${match[2]}`,
      terms: [project.displayName, project.projectKey, project.module, label].filter(Boolean).join(" "),
      scope: "Docs"
    });
  }
  return items;
}

function extractPropertyItems(project, html) {
  const items = [];
  const rowPattern = /<tr\b[^>]*>([\s\S]*?)<\/tr>/g;

  for (const match of html.matchAll(rowPattern)) {
    const cells = Array.from(match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g), (cell) => cleanText(cell[1]));
    if (cells.length < 2) {
      continue;
    }
    const property = cells[0];
    if (!isConfigurationPropertyName(property)) {
      continue;
    }
    items.push({
      kind: "Property",
      title: property,
      description: cells.slice(1).filter(Boolean).join(" - ") || `${project.displayName} configuration property.`,
      href: `${project.href || `/docs/${project.slug}/`}#${project.slug}-configuration`,
      terms: [project.displayName, project.projectKey, project.module, ...cells].filter(Boolean).join(" "),
      scope: "Properties"
    });
  }

  return items;
}

function extractClassItems(project, html) {
  const items = [];
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
      terms: [project.displayName, project.projectKey, project.module, className, label].filter(Boolean).join(" "),
      scope: "Classes"
    });
  }
  return items;
}

function pushItem(items, seen, item) {
  const key = `${item.scope}:${item.href}:${item.title}`;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  items.push(item);
}

function absoluteDocsHref(project, href) {
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(href) || href.startsWith("//")) {
    return href;
  }
  const resolved = new URL(href, `https://example.test${project.href || `/docs/${project.slug}/`}`);
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

function classNameFromApiHref(href, label) {
  if (looksLikeClassName(label)) {
    return label;
  }
  const withoutHash = href.split(/[?#]/)[0];
  const file = withoutHash.slice(withoutHash.lastIndexOf("/") + 1).replace(/\.html$/, "");
  return looksLikeClassName(file) ? file : "";
}

function looksLikeClassName(value) {
  return /^[A-Z_$][\w$]*(?:\.[\w$]+)?(?:\([^)]*\))?$/.test(String(value || "").trim());
}

function isConfigurationPropertyName(value) {
  return /^[a-z][a-z0-9]*(?:[.\-][a-z0-9*[\]-]+)+$/i.test(String(value || "").trim());
}

function attributeValue(source, name) {
  const pattern = new RegExp(`\\b${name}="([^"]*)"`);
  return pattern.exec(source)?.[1] || "";
}

function cleanText(value) {
  return decodeEntities(String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}
