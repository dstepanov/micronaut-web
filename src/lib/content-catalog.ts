import {
  guideOverviewPath,
  guideTagPath,
  type GeneratedGuide,
} from "./generated-guide-routing.ts";
import { docsRoot } from "./deployment-config.ts";
import { projectReferenceLinks } from "../../scripts/docs/search-index.ts";

export type CatalogCategory = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  projectSlugs?: string[];
};

export type DocsSection = {
  id: string;
  number: string;
  title: string;
  summary: string;
};

export type CatalogLink = {
  label: string;
  href: string;
};

export type DocsCatalogProject = {
  slug: string;
  displayName: string;
  shortName: string;
  projectKey: string;
  module: string;
  repositoryName: string;
  repositoryUrl: string;
  publishedGuideUrl: string;
  externalUrl?: string;
  branch: string;
  submodulePath: string;
  platformVersionKey: string;
  version: string;
  icon: string;
  iconThemeTreatment?: "auto" | "inverted" | "monochrome" | "preserve";
  primaryCategory: string;
  categorySlugs: string[];
  guideTopicAliases?: string[];
  shortDescription: string;
  longDescription: string;
};

export type DocsProject = DocsCatalogProject & {
  href: string;
  sections: DocsSection[];
  references: CatalogLink[];
  searchTerms: string[];
};

export type DocsProjectCatalog = {
  source: string;
  publishedSource: string;
  projectCount: number;
  categories: CatalogCategory[];
  projects: DocsCatalogProject[];
};

export type SearchItem = {
  kind:
    | "Project"
    | "Guide"
    | "Section"
    | "Tag"
    | "Post"
    | "Docs"
    | "Property"
    | "Class"
    | "Reference"
    | "Repo";
  title: string;
  description: string;
  href: string;
  terms: string;
  scope?: "Projects" | "Docs" | "Properties" | "Classes" | "Repos";
  weight?: number;
};

/** A blog post reduced to what the search index needs. */
export type BlogSearchPost = {
  title: string;
  description: string;
  href: string;
  topics: string[];
};

export function docsProjectFromCatalog(
  project: DocsCatalogProject,
): DocsProject {
  return {
    ...project,
    ...(project.slug === "platform"
      ? { externalUrl: micronautPlatformGuideUrl() }
      : {}),
    href: `/docs/${project.slug}/`,
    sections: docsProjectSections(project),
    references: docsProjectReferences(project),
    searchTerms: docsProjectSearchTerms(project),
  };
}

function micronautPlatformGuideUrl() {
  const version = /^\/(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)$/.exec(docsRoot)?.[1];
  return `https://micronaut-projects.github.io/micronaut-platform/${version || "latest"}/guide/`;
}

/**
 * The build-time half of the site-mode search catalog: everything the surface
 * being built actually renders. Guides are not in here — the main artifact is
 * built without generated guide content, so a build-time guide list was the
 * 4-guide fixture. `guideSearchItems` builds those in the browser from the
 * guides surface's own manifest instead.
 */
export function searchItems({
  projects,
  posts,
}: {
  projects: DocsProject[];
  posts: BlogSearchPost[];
}): SearchItem[] {
  const projectItems: SearchItem[] = projects.map((project) => ({
    kind: "Project",
    title: project.displayName,
    description: project.shortDescription,
    href: project.href,
    terms: [
      project.displayName,
      project.shortDescription,
      project.longDescription,
      ...project.searchTerms,
    ].join(" "),
  }));
  const sectionItems: SearchItem[] = projects.flatMap((project) =>
    project.sections.map((section) => ({
      kind: "Section",
      title: `${project.displayName}: ${section.title}`,
      description: section.summary,
      href: `${project.href}#${section.id}`,
      terms: [project.displayName, section.title, section.summary].join(" "),
    })),
  );
  const postItems: SearchItem[] = posts.map((post) => ({
    kind: "Post",
    title: post.title,
    description: post.description,
    href: post.href,
    terms: [post.title, post.description, ...post.topics].join(" "),
  }));
  const referenceItems: SearchItem[] = [
    {
      kind: "Docs",
      title: "Configuration Reference",
      description:
        "Every documented configuration property across Micronaut modules, unified into one searchable reference.",
      href: "/docs/configuration-reference/",
      terms:
        "configuration reference properties settings options unified all modules",
    },
    ...projects.flatMap((project) =>
      projectReferenceLinks(project.publishedGuideUrl).map(
        (reference): SearchItem => ({
          kind: "Reference",
          title: `${project.displayName}: ${reference.label}`,
          description:
            reference.label === "API Reference"
              ? `Published API documentation for ${project.displayName}.`
              : `Published configuration reference for ${project.displayName}.`,
          href: reference.href,
          terms: [
            project.displayName,
            project.projectKey,
            reference.label,
            "javadoc api configuration reference",
          ].join(" "),
        }),
      ),
    ),
  ];
  return [...projectItems, ...sectionItems, ...postItems, ...referenceItems];
}

/**
 * The guide half of the site-mode catalog, built from the guides manifest the
 * guides deployment publishes. Both surfaces read that manifest at search time,
 * so the guide list is the full published set rather than whatever generated
 * content happened to exist when the surface was built.
 */
export function guideSearchItems(guides: GeneratedGuide[]): SearchItem[] {
  const guideItems: SearchItem[] = guides.map((guide) => ({
    kind: "Guide",
    title: guide.title,
    description: guide.intro,
    href: guideOverviewPath(guide, "/guides"),
    terms: [
      guide.title,
      guide.intro,
      ...guide.tags,
      ...guide.categories,
      ...guide.authors,
    ].join(" "),
  }));
  const tagItems: SearchItem[] = Array.from(
    new Set(guides.flatMap((guide) => guide.tags)),
  )
    .sort()
    .map((tag) => ({
      kind: "Tag",
      title: tag,
      description: "Guides tagged with this topic",
      href: guideTagPath(tag, "/guides"),
      terms: tag,
    }));
  return [...guideItems, ...tagItems];
}

function docsProjectSections(project: DocsCatalogProject): DocsSection[] {
  return [
    {
      id: `${project.slug}-overview`,
      number: "1",
      title: "Overview",
      summary: `${project.displayName} overview, module coordinates, supported use cases, and published documentation entry points.`,
    },
    {
      id: `${project.slug}-configuration`,
      number: "2",
      title: "Configuration",
      summary: `Configuration options, dependency coordinates, and version-managed setup details for ${project.displayName}.`,
    },
    {
      id: `${project.slug}-api`,
      number: "3",
      title: "API Reference",
      summary: `API references, annotations, classes, and module-specific integration points for ${project.displayName}.`,
    },
    {
      id: `${project.slug}-source`,
      number: "4",
      title: "Source",
      summary: `Repository, branch, module, and platform metadata for ${project.displayName}.`,
    },
  ];
}

function docsProjectReferences(project: DocsCatalogProject): CatalogLink[] {
  return [{ label: "Repository", href: project.repositoryUrl }].filter(
    (reference) => reference.href,
  );
}

function docsProjectSearchTerms(project: DocsCatalogProject): string[] {
  return [
    project.slug,
    project.displayName,
    project.shortName,
    project.projectKey,
    project.module,
    project.repositoryName,
    project.primaryCategory,
    ...project.categorySlugs,
  ].filter(Boolean);
}
