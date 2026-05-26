import { readFile } from "node:fs/promises";
import { join } from "node:path";

import fallbackDocsProjectCatalog from "@/data/docs-projects.fixture.json";
import type {
  CatalogCategory,
  DocsProject,
  DocsProjectCatalog,
} from "@/lib/content-catalog";
import { docsProjectFromCatalog } from "@/lib/content-catalog";

const generatedDocsProjectCatalogFile = join(
  process.cwd(),
  "src",
  "content",
  "generated-docs",
  "project-catalog.json",
);

export async function loadDocsProjectCatalog(): Promise<DocsProjectCatalog> {
  try {
    return JSON.parse(
      await readFile(generatedDocsProjectCatalogFile, "utf8"),
    ) as DocsProjectCatalog;
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }
    return fallbackDocsProjectCatalog as DocsProjectCatalog;
  }
}

export function docsCatalogProjectsByCategory(
  catalog: DocsProjectCatalog,
  category: CatalogCategory,
): DocsProject[] {
  const selected = new Set(category.projectSlugs || []);
  return catalog.projects
    .filter((project) => selected.has(project.slug))
    .map((project) => docsCatalogProject(catalog, project.slug))
    .filter(Boolean) as DocsProject[];
}

export function docsCatalogProject(
  catalog: DocsProjectCatalog,
  slug: string,
): DocsProject | undefined {
  const catalogProject = catalog.projects.find(
    (project) => project.slug === slug,
  );
  if (!catalogProject) {
    return undefined;
  }
  return docsProjectFromCatalog(catalogProject);
}

function isMissingFileError(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
