import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const generatedContentFixtureDirectory = path.join(
  projectDirectory,
  "fixtures",
  "generated-content",
);
const docsProjectSlugs = ["core", "data", "serde"];
const guideSlugs = [
  "adding-commit-info",
  "creating-your-first-micronaut-app",
  "micronaut-http-client",
  "micronaut-data-jdbc-repository",
  "micronaut-scheduled",
  "snippet-gallery",
];

const selected = new Set(
  process.argv
    .slice(2)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean),
);

if (!selected.size || selected.has("all")) {
  selected.add("docs");
  selected.add("guides");
}

if (selected.has("docs")) {
  await prepareDocsContent();
}
if (selected.has("guides")) {
  await prepareGuidesContent();
}

async function prepareDocsContent(): Promise<void> {
  const docsDirectory = path.join(projectDirectory, ".playwright", "docs");
  const outputDirectory = path.join(
    projectDirectory,
    "src",
    "content",
    "generated-docs",
  );

  await copyFixtureDirectory(
    path.join(generatedContentFixtureDirectory, "docs"),
    docsDirectory,
  );
  await execFile(
    process.execPath,
    [
      "scripts/render-docs.ts",
      "--docs-dir",
      docsDirectory,
      "--output",
      outputDirectory,
      "--slugs",
      docsProjectSlugs.join(","),
      "--strict",
    ],
    {
      cwd: projectDirectory,
      env: {
        ...process.env,
        CI: "false",
      },
    },
  );
}

async function prepareGuidesContent(): Promise<void> {
  const guidesDirectory = path.join(projectDirectory, ".playwright", "guides");
  const generatedGuidesDirectory = path.join(
    projectDirectory,
    "src",
    "content",
    "generated-guides",
  );

  await copyFixtureDirectory(
    path.join(generatedContentFixtureDirectory, "guides"),
    guidesDirectory,
  );
  await execFile(
    process.execPath,
    [
      "scripts/render-guides.ts",
      "--guides-dir",
      guidesDirectory,
      "--output",
      generatedGuidesDirectory,
      "--slugs",
      guideSlugs.join(","),
    ],
    {
      cwd: projectDirectory,
      env: {
        ...process.env,
        CI: "false",
        GUIDES_RENDER_ALL: "false",
        GUIDES_RENDER_SLUGS: "",
        GUIDES_RENDER_STRICT: "false",
      },
    },
  );
}

async function copyFixtureDirectory(
  sourceDirectory: string,
  targetDirectory: string,
): Promise<void> {
  await assertDirectory(
    sourceDirectory,
    `Missing checked-in generated content fixture at ${sourceDirectory}.`,
  );
  await fs.rm(targetDirectory, { force: true, recursive: true });
  await fs.mkdir(path.dirname(targetDirectory), { recursive: true });
  await fs.cp(sourceDirectory, targetDirectory, {
    force: true,
    recursive: true,
  });
}

async function assertDirectory(
  directory: string,
  message: string,
): Promise<void> {
  try {
    const stats = await fs.stat(directory);
    if (stats.isDirectory()) {
      return;
    }
  } catch {
    // The explicit message below identifies the checked-in fixture path.
  }
  throw new Error(message);
}
