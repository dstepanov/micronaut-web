import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import {
  parseConfigurationReference,
  type ConfigurationReferences,
} from "./docs/configuration-references.ts";
import {
  configurationReferencesFile,
  readConfigurationReferences,
} from "./docs/configuration-references-store.ts";
import { configurationReferenceUrl } from "./docs/search-index.ts";

/**
 * Collects every module's published configuration reference into one JSON the
 * docs pages and search index render from. A fetch that fails keeps the
 * project's previously collected data, so an offline run degrades to whatever
 * the last successful run (or the checked-in fixture) produced.
 */
const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const { values: options } = parseArgs({
  options: {
    output: { type: "string" },
    concurrency: { type: "string" },
  },
});

const outputFile = options.output
  ? resolve(options.output)
  : configurationReferencesFile;
const concurrency = Number(options.concurrency) || 8;

const projects = await loadCatalogProjects();
const references: ConfigurationReferences =
  await readConfigurationReferences(outputFile);

let fetched = 0;
const failed: string[] = [];
const queue = [...projects];
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    for (let project = queue.shift(); project; project = queue.shift()) {
      const url = configurationReferenceUrl(project);
      if (!url) {
        continue;
      }
      try {
        const response = await fetch(url, {
          redirect: "follow",
          signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const sections = parseConfigurationReference(
          await response.text(),
          url,
        );
        if (sections.length) {
          references[project.slug] = { sourceUrl: url, sections };
          fetched += 1;
        } else {
          delete references[project.slug];
        }
      } catch (error) {
        failed.push(
          `${project.slug} (${error instanceof Error ? error.message : String(error)})`,
        );
      }
    }
  }),
);

await mkdir(dirname(outputFile), { recursive: true });
await writeFile(
  outputFile,
  `${JSON.stringify({ projects: references }, undefined, 2)}\n`,
  "utf8",
);
console.log(
  `Collected configuration references for ${fetched} of ${projects.length} projects into ${outputFile}.`,
);
if (failed.length) {
  console.warn(
    `Kept previous data for ${failed.length} projects that did not fetch: ${failed.join(", ")}`,
  );
}

interface CatalogProject {
  slug: string;
  repositoryName?: string;
  publishedGuideUrl?: string;
}

async function loadCatalogProjects(): Promise<CatalogProject[]> {
  const generatedCatalog = join(
    projectDirectory,
    "src",
    "content",
    "generated-docs",
    "project-catalog.json",
  );
  const fixtureCatalog = join(
    projectDirectory,
    "src",
    "data",
    "docs-projects.fixture.json",
  );
  for (const file of [generatedCatalog, fixtureCatalog]) {
    try {
      const payload = JSON.parse(await readFile(file, "utf8")) as {
        projects?: CatalogProject[];
      };
      if (Array.isArray(payload.projects)) {
        return payload.projects;
      }
    } catch {
      // Fall through to the fixture catalog.
    }
  }
  throw new Error(
    `No docs project catalog found at ${generatedCatalog} or ${fixtureCatalog}.`,
  );
}
