import asciidoctorFactory from "asciidoctor";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { copyProjectImageAssets } from "./platform-docs/assets.mjs";
import { parseArgs, splitList } from "./platform-docs/cli.mjs";
import { isDirectory } from "./platform-docs/files.mjs";
import {
  readIndexed,
  readProperties,
  readTomlStringVersions,
  selectProjects
} from "./platform-docs/project-manifest.mjs";
import { renderProject } from "./platform-docs/renderer.mjs";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const options = parseArgs(process.argv.slice(2));
const platformDocsDirectory = path.resolve(
  options.platformDocsDir ||
  options.platformDocs ||
  options._[0] ||
  process.env.PLATFORM_DOCS_DIR ||
  path.join(projectDirectory, "..", "..", "micronaut-platform-docs")
);
const outputDirectory = path.resolve(options.output || path.join(projectDirectory, "src", "content", "generated-docs"));
const publicDirectory = path.resolve(options.publicDir || path.join(projectDirectory, "public"));
const selectedSlugs = splitList(options.slugs || process.env.PLATFORM_DOCS_PROJECT_SLUGS || "");

const asciidoctor = asciidoctorFactory();
const projectManifest = await readProperties(path.join(platformDocsDirectory, "gradle", "platform-doc-projects.properties"));
const projects = selectProjects(
  readIndexed(
    projectManifest,
    "project",
    Number(projectManifest["project.count"] || 0)
  ),
  selectedSlugs
);
const platformVersions = await readTomlStringVersions(
  path.join(platformDocsDirectory, "repos", "micronaut-platform", "gradle", "libs.versions.toml")
);

await fs.mkdir(outputDirectory, { recursive: true });

let rendered = 0;
let skipped = 0;
for (const project of projects) {
  const guideSourceDirectory = path.join(platformDocsDirectory, project.submodulePath, "src", "main", "docs", "guide");
  try {
    if (!(await isDirectory(guideSourceDirectory))) {
      skipped += 1;
      console.warn(`Skipping ${project.slug}: missing guide source at ${guideSourceDirectory}`);
      continue;
    }

    const html = await renderProject(asciidoctor, platformDocsDirectory, project, platformVersions[project.platformVersionKey] || "");
    await fs.writeFile(path.join(outputDirectory, `${project.slug}.html`), `${html}\n`, "utf8");
    await copyProjectImageAssets(project, platformDocsDirectory, publicDirectory);
    rendered += 1;
    console.log(`Rendered ${project.slug}`);
  } catch (error) {
    skipped += 1;
    console.warn(`Skipping ${project.slug}: ${error.message}`);
  }
}

console.log(`Rendered ${rendered} platform docs fragments to ${path.relative(projectDirectory, outputDirectory)}${skipped ? ` (${skipped} skipped)` : ""}.`);
