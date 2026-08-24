import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveDeploymentSettings } from "../src/lib/deployment-defaults.ts";
import type { GeneratedGuidesManifest } from "../src/lib/generated-guide-routing.ts";

/**
 * Refreshes the guide catalog the main surface builds its search index from.
 * The published manifest is the source rather than a guides checkout because
 * it lists exactly the guides that are live, so every entry the index links
 * to resolves to a page that exists.
 */
const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const source =
  process.argv[2] ||
  process.env.MICRONAUT_GUIDES_MANIFEST ||
  new URL(
    "manifest.json",
    resolveDeploymentSettings(process.env).guidesSiteUrl,
  ).toString();
const outputFile = path.join(
  projectDirectory,
  "src",
  "data",
  "generated-guides.fixture.json",
);

const published = (await readManifest()) as Partial<GeneratedGuidesManifest>;
if (!published.guides?.length) {
  throw new Error(`No guides found in ${source}`);
}
// Sorted so an unrelated reordering upstream does not churn the diff.
const guides = [...published.guides].sort((left, right) =>
  left.slug.localeCompare(right.slug),
);
const fixture: GeneratedGuidesManifest = {
  generatedAt: published.generatedAt || "",
  guideCount: guides.length,
  guides,
};

await fs.writeFile(outputFile, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(
  `Wrote ${guides.length} guides from ${source} to ${path.relative(projectDirectory, outputFile)}.`,
);

async function readManifest(): Promise<unknown> {
  if (!/^https?:\/\//.test(source)) {
    return JSON.parse(await fs.readFile(path.resolve(source), "utf8"));
  }
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Failed to read ${source}: ${response.status}`);
  }
  return response.json();
}
