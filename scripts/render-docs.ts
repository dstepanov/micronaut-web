import * as asciidoctor from "@asciidoctor/core";
import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { copyProjectImageAssets } from "./docs/assets.ts";
import { buildDocsProjectCatalog } from "./docs/project-catalog.ts";
import {
  type DocsProject,
  type Properties,
  projectCatalogMetadataProperties,
  readIndexed,
  readPlatformCatalogProjects,
  readProperties,
  readSingleDocumentProjects,
  readTomlStringVersions,
  selectProjects,
} from "./docs/project-manifest.ts";
import { renderProject } from "./docs/renderer.ts";
import { parseArgs, splitList, stringArg } from "./shared/cli.ts";
import { isDirectory, isRegularFile } from "./shared/files.ts";

const DEFAULT_DOC_PROJECT_SLUGS = ["core", "data", "serde"];
const execFile = promisify(execFileCallback);

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const options = parseArgs(process.argv.slice(2));
const docsDirectory = path.resolve(
  stringArg(options.docsDir) ||
    options._[0] ||
    process.env.DOCS_DIR ||
    path.join(projectDirectory, ".docs"),
);
const platformProjectDirectory = path.resolve(
  stringArg(options.platformProjectDir) ||
    process.env.PLATFORM_PROJECT_DIR ||
    path.join(docsDirectory, "repos", "micronaut-platform"),
);
const platformVersionCatalogFile = path.resolve(
  stringArg(options.platformVersionCatalog) ||
    process.env.PLATFORM_VERSION_CATALOG ||
    path.join(platformProjectDirectory, "gradle", "libs.versions.toml"),
);
const outputDirectory = path.resolve(
  stringArg(options.output) ||
    path.join(projectDirectory, "src", "content", "generated-docs"),
);
const strict = Boolean(
  options.strict ||
  process.env.DOCS_RENDER_STRICT === "true" ||
  process.env.CI === "true",
);
const renderAll = Boolean(
  options.all || process.env.DOCS_RENDER_ALL === "true",
);
const syncSources = Boolean(
  options.syncSources || process.env.DOCS_SYNC_SOURCES === "true",
);
// Snapshot docs describe the release that has not happened yet, so every
// project comes from its own default branch instead of the release tag the
// platform catalog names, and reports the version that branch builds.
const snapshotSources = Boolean(
  options.snapshotSources || process.env.DOCS_SNAPSHOT_SOURCES === "true",
);
const explicitSlugs = splitList(
  options.slugs || process.env.DOCS_PROJECT_SLUGS || "",
);
const selectedSlugs = renderAll
  ? []
  : explicitSlugs.length
    ? explicitSlugs
    : DEFAULT_DOC_PROJECT_SLUGS;

const checkedInProjectCatalogFile = path.join(
  projectDirectory,
  "src",
  "data",
  "docs-projects.fixture.json",
);
const localProjectCatalogFile = path.join(
  docsDirectory,
  "docs-projects.fixture.json",
);
const projectCatalogFile = path.resolve(
  stringArg(options.projectCatalog) ||
    process.env.DOCS_PROJECT_CATALOG ||
    ((await isRegularFile(localProjectCatalogFile))
      ? localProjectCatalogFile
      : checkedInProjectCatalogFile),
);
const generatedProjectCatalogFile = path.join(
  outputDirectory,
  "project-catalog.json",
);
const checkedInProjectCatalog = await readJson(projectCatalogFile);
const metadataProperties = projectCatalogMetadataProperties(
  checkedInProjectCatalog,
);
let allProjects: DocsProject[];
if (await isRegularFile(platformVersionCatalogFile)) {
  allProjects = [
    ...(await readPlatformCatalogProjects(
      platformVersionCatalogFile,
      metadataProperties,
    )),
    ...readSingleDocumentProjects(metadataProperties),
  ];
} else {
  allProjects = readIndexed(
    metadataProperties,
    "project",
    Number(metadataProperties["project.count"] || 0),
  ) as unknown as DocsProject[];
}
const projects = selectProjects(allProjects, selectedSlugs);
const platformVersions = await readTomlStringVersions(
  platformVersionCatalogFile,
  false,
);

await cleanGeneratedDocsOutput(
  outputDirectory,
  explicitSlugs.length ? selectedSlugs : [],
);
if (syncSources) {
  await syncProjectSources(projects, platformVersions);
}
// Resolved after the sources are on disk: a project's unreleased version is
// written down nowhere but the project itself.
const projectVersions = snapshotSources
  ? { ...platformVersions, ...(await snapshotProjectVersions(projects)) }
  : platformVersions;
if (await isRegularFile(platformVersionCatalogFile)) {
  await writeGeneratedProjectCatalog(allProjects, projectVersions);
}

let rendered = 0;
let skipped = 0;
const skippedProjects: string[] = [];
for (const project of projects) {
  try {
    if (!(await hasDocsSource(project))) {
      skipped += 1;
      skippedProjects.push(
        `${project.slug}: missing docs source at ${docsSourceLocation(project)}`,
      );
      console.warn(`Skipping ${skippedProjects.at(-1)}`);
      continue;
    }

    const html = await renderProject(
      asciidoctor,
      docsDirectory,
      project,
      projectVersions[project.platformVersionKey] || "",
      { strict },
    );
    await fs.writeFile(
      path.join(outputDirectory, `${project.slug}.html`),
      `${html}\n`,
      "utf8",
    );
    await copyProjectImageAssets(project, docsDirectory, outputDirectory);
    rendered += 1;
    console.log(`Rendered ${project.slug}`);
  } catch (error: unknown) {
    skipped += 1;
    skippedProjects.push(`${project.slug}: ${errorMessage(error)}`);
    console.warn(`Skipping ${skippedProjects.at(-1)}`);
  }
}

console.log(
  `Rendered ${rendered} docs fragments to ${path.relative(projectDirectory, outputDirectory)}${skipped ? ` (${skipped} skipped)` : ""}.`,
);
if (strict && skippedProjects.length) {
  throw new Error(
    `Strict docs render failed with skipped projects: ${skippedProjects.join("; ")}`,
  );
}

async function cleanGeneratedDocsOutput(
  directory: string,
  slugs: string[],
): Promise<void> {
  await fs.mkdir(directory, { recursive: true });
  if (slugs.length) {
    await Promise.all([
      fs.rm(path.join(directory, "project-catalog.json"), { force: true }),
      ...slugs.flatMap((slug) => [
        fs.rm(path.join(directory, `${slug}.html`), { force: true }),
        fs.rm(path.join(directory, "assets", slug), {
          force: true,
          recursive: true,
        }),
      ]),
    ]);
    return;
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });
  await Promise.all(
    entries.map((entry) => {
      if (entry.isFile() && entry.name.endsWith(".html")) {
        return fs.rm(path.join(directory, entry.name), { force: true });
      }
      if (entry.isFile() && entry.name === "project-catalog.json") {
        return fs.rm(path.join(directory, entry.name), { force: true });
      }
      if (entry.isDirectory() && entry.name === "assets") {
        return fs.rm(path.join(directory, entry.name), {
          force: true,
          recursive: true,
        });
      }
      return undefined;
    }),
  );
}

async function writeGeneratedProjectCatalog(
  projects: DocsProject[],
  platformVersions: Record<string, string>,
): Promise<void> {
  const existingCatalog = await readJson(projectCatalogFile);
  const catalog = buildDocsProjectCatalog({
    projects,
    platformVersions,
    existingCatalog,
    source: `${path.relative(projectDirectory, platformVersionCatalogFile)} plus checked-in docs metadata`,
    publishedSource:
      typeof existingCatalog.publishedSource === "string"
        ? existingCatalog.publishedSource
        : "",
  });
  await fs.writeFile(
    generatedProjectCatalogFile,
    `${JSON.stringify(catalog, null, 2)}\n`,
    "utf8",
  );
}

async function readJson(file: string): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function syncProjectSources(
  projects: DocsProject[],
  platformVersions: Record<string, string>,
): Promise<void> {
  for (const project of projects) {
    if (await hasDocsSource(project)) {
      continue;
    }

    const destination = path.join(docsDirectory, project.submodulePath);
    if (await isDirectory(destination)) {
      console.warn(
        `Project source exists without docs sources, leaving it unchanged: ${path.relative(projectDirectory, destination)}`,
      );
      continue;
    }

    const version = platformVersions[project.platformVersionKey];
    const releaseTag = snapshotSources
      ? ""
      : version
        ? `v${version}`
        : await latestReleaseTag(project.repositoryUrl);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    console.log(
      `Cloning ${project.repositoryName} into ${path.relative(projectDirectory, destination)}${releaseTag ? ` at ${releaseTag}` : snapshotSources ? " at its default branch" : ""}`,
    );
    try {
      await cloneProject(
        project.repositoryUrl,
        destination,
        // The default branch, which a clone without a ref checks out, is the
        // branch every project publishes its own snapshot documentation from.
        snapshotSources ? "" : releaseTag || project.branch,
      );
    } catch (error: unknown) {
      if (!releaseTag || releaseTag === project.branch) {
        throw error;
      }
      console.warn(
        `Could not clone ${project.repositoryName} at ${releaseTag}: ${errorMessage(error)}. Falling back to ${project.branch}.`,
      );
      await cloneProject(project.repositoryUrl, destination, project.branch);
    }
  }
}

/**
 * The versions the checked-out sources build, keyed the way the platform
 * catalog keys the released ones it names. The branch each project was
 * rendered from replaces the release branch its catalog version implies, so
 * the source and edit links lead to the sources on the page.
 */
async function snapshotProjectVersions(
  projects: DocsProject[],
): Promise<Properties> {
  const versions: Properties = {};
  for (const project of projects) {
    const directory = path.join(docsDirectory, project.submodulePath);
    const { projectVersion } = await readProperties(
      path.join(directory, "gradle.properties"),
      false,
    );
    if (projectVersion) {
      versions[project.platformVersionKey] = projectVersion;
    }
    project.branch = (await checkedOutBranch(directory)) || project.branch;
  }
  return versions;
}

async function checkedOutBranch(directory: string): Promise<string> {
  try {
    const { stdout } = await execFile(
      "git",
      ["rev-parse", "--abbrev-ref", "HEAD"],
      { cwd: directory },
    );
    const branch = stdout.trim();
    return branch === "HEAD" ? "" : branch;
  } catch {
    return "";
  }
}

/**
 * The newest release tag in a repository the platform BOM does not version.
 * Their default branch documents unreleased changes down to the plugin version
 * every build snippet tells the reader to apply, so the docs follow the
 * releases the way every BOM-versioned project already does.
 */
async function latestReleaseTag(repositoryUrl: string): Promise<string> {
  const { stdout } = await execFile(
    "git",
    ["ls-remote", "--tags", "--refs", "--sort=-v:refname", repositoryUrl, "v*"],
    { cwd: projectDirectory },
  );
  return (
    stdout
      .split("\n")
      .map((line) => line.split("refs/tags/")[1]?.trim() || "")
      .find((tag) => /^v\d+\.\d+\.\d+$/.test(tag)) || ""
  );
}

async function cloneProject(
  repositoryUrl: string,
  destination: string,
  ref: string,
): Promise<void> {
  const cloneDirectory = `${destination}.clone-${process.pid}`;
  await fs.rm(cloneDirectory, { force: true, recursive: true });
  try {
    const args = ["clone", "--depth", "1"];
    if (ref) {
      args.push("--branch", ref);
    }
    args.push(repositoryUrl, cloneDirectory);
    await execFile("git", args, { cwd: projectDirectory });
    await fs.rename(cloneDirectory, destination);
  } catch (error: unknown) {
    await fs.rm(cloneDirectory, { force: true, recursive: true });
    throw error;
  }
}

/**
 * Where a project's AsciiDoc sources live: a guide directory driven by a
 * `toc.yml`, or the single document a project such as the build plugins
 * publishes instead.
 */
function docsSourceLocation(project: DocsProject): string {
  return path.join(
    docsDirectory,
    project.submodulePath,
    ...(project.docsSourceFile
      ? [project.docsSourceFile]
      : ["src", "main", "docs", "guide"]),
  );
}

function hasDocsSource(project: DocsProject): Promise<boolean> {
  return project.docsSourceFile
    ? isRegularFile(docsSourceLocation(project))
    : isDirectory(docsSourceLocation(project));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
