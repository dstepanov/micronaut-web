import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
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
  const projects = [
    {
      body: [
        "Core generated docs body.",
        "",
        "[source,java]",
        "----",
        "class CoreExample {",
        "    void run() {",
        "    }",
        "}",
        "----",
      ].join("\n"),
      displayName: "Micronaut Core",
      repositoryName: "micronaut-core",
      slug: "core",
      version: "5.0.0",
    },
    {
      body: [
        "Data generated docs body.",
        "",
        "[source,kotlin]",
        "----",
        "class DataExample",
        "----",
      ].join("\n"),
      displayName: "Micronaut Data",
      repositoryName: "micronaut-data",
      slug: "data",
      version: "4.14.3",
    },
    {
      body: [
        "Serialization generated docs body.",
        "",
        "[source,groovy]",
        "----",
        "class SerdeExample {",
        "}",
        "----",
      ].join("\n"),
      displayName: "Micronaut Serialization",
      repositoryName: "micronaut-serde",
      slug: "serde",
      version: "2.15.0",
    },
  ];

  await fs.rm(docsDirectory, { force: true, recursive: true });
  await writeDocsProjectCatalog(docsDirectory, projects);
  await writePlatformVersionCatalog(
    docsDirectory,
    Object.fromEntries(
      projects.map((project): [string, string] => [
        project.slug,
        project.version,
      ]),
    ),
  );
  await Promise.all(
    projects.map(
      (project): Promise<void> =>
        writeDocsGuide(docsDirectory, project.repositoryName, {
          body: project.body,
          title: project.displayName,
        }),
    ),
  );

  await execFile(
    process.execPath,
    [
      "scripts/render-docs.ts",
      "--docs-dir",
      docsDirectory,
      "--output",
      outputDirectory,
      "--all",
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
  const generatedGuidesDirectory = path.join(
    projectDirectory,
    "src",
    "content",
    "generated-guides",
  );
  const fragmentsDirectory = path.join(generatedGuidesDirectory, "fragments");
  const fallbackManifest = await fs.readFile(
    path.join(projectDirectory, "src", "data", "generated-guides.fixture.json"),
    "utf8",
  );
  await fs.mkdir(fragmentsDirectory, { recursive: true });
  await fs.writeFile(
    path.join(generatedGuidesDirectory, "manifest.json"),
    fallbackManifest,
    "utf8",
  );
  await fs.writeFile(
    path.join(fragmentsDirectory, "micronaut-http-client-gradle-java.html"),
    guideFragment("Java"),
    "utf8",
  );
  await fs.writeFile(
    path.join(fragmentsDirectory, "micronaut-http-client-gradle-kotlin.html"),
    guideFragment("Kotlin"),
    "utf8",
  );
}

async function writeDocsProjectCatalog(
  docsDirectory: string,
  projects: Array<{
    slug: string;
    displayName: string;
    repositoryName: string;
  }>,
): Promise<void> {
  await fs.mkdir(docsDirectory, { recursive: true });
  await fs.writeFile(
    path.join(docsDirectory, "docs-projects.fixture.json"),
    JSON.stringify(
      {
        source: "playwright fixture",
        publishedSource: "",
        projectCount: projects.length,
        categories: [
          {
            slug: "playwright",
            name: "Playwright Fixtures",
            icon: "lucide:book-open",
            description: "Generated docs layout fixtures.",
            projectSlugs: projects.map((project) => project.slug),
          },
        ],
        projects: projects.map((project) => ({
          slug: project.slug,
          displayName: project.displayName,
          shortName: project.displayName.replace(/^Micronaut\s+/i, ""),
          projectKey: project.slug,
          module: `io.micronaut.${project.slug}:micronaut-${project.slug}-bom`,
          repositoryName: project.repositoryName,
          repositoryUrl: `https://github.com/micronaut-projects/${project.repositoryName}.git`,
          publishedGuideUrl: `https://micronaut-projects.github.io/${project.repositoryName}/latest/guide/`,
          branch: "master",
          submodulePath: `repos/${project.repositoryName}`,
          platformVersionKey: `managed-micronaut-${project.slug}`,
          version: "",
          icon: "lucide:book-open",
          primaryCategory: "playwright",
          categorySlugs: ["playwright"],
          shortDescription: project.displayName,
          longDescription: `${project.displayName} browser layout fixture.`,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function writePlatformVersionCatalog(
  docsDirectory: string,
  versionsBySlug: Record<string, string>,
): Promise<void> {
  const catalogFile = path.join(
    docsDirectory,
    "repos",
    "micronaut-platform",
    "gradle",
    "libs.versions.toml",
  );
  await fs.mkdir(path.dirname(catalogFile), { recursive: true });
  await fs.writeFile(
    catalogFile,
    [
      "[versions]",
      ...Object.entries(versionsBySlug).map(
        ([slug, version]): string => `managed-micronaut-${slug} = "${version}"`,
      ),
      "",
      "[libraries]",
      ...Object.keys(versionsBySlug).map(
        (slug): string =>
          `boms-micronaut-${slug} = { module = "io.micronaut.${slug}:micronaut-${slug}-bom", version.ref = "managed-micronaut-${slug}" }`,
      ),
    ].join("\n"),
    "utf8",
  );
}

async function writeDocsGuide(
  docsDirectory: string,
  repositoryName: string,
  guide: { body: string; title: string },
): Promise<void> {
  const guideDirectory = path.join(
    docsDirectory,
    "repos",
    repositoryName,
    "src",
    "main",
    "docs",
    "guide",
  );
  await fs.mkdir(guideDirectory, { recursive: true });
  await fs.writeFile(
    path.join(guideDirectory, "toc.yml"),
    `title: ${guide.title}\nintroduction: Introduction\nconfiguration: Configuration\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(guideDirectory, "introduction.adoc"),
    guide.body,
    "utf8",
  );
  await fs.writeFile(
    path.join(guideDirectory, "configuration.adoc"),
    [
      "Configuration generated docs body.",
      "",
      ".Configuration Properties",
      "|===",
      "|Property |Type |Description",
      "|micronaut.playwright.enabled |Boolean |Enables the Playwright fixture.",
      "|===",
    ].join("\n"),
    "utf8",
  );
}

function guideFragment(language: string): string {
  return [
    '<div class="guide-section-heading">',
    '  <h1 id="introduction"><a class="anchor" href="#introduction"></a>1 Introduction</h1>',
    "</div>",
    `<p>In this guide, we will create a Micronaut application written in ${language} to consume the GitHub API with the Micronaut HTTP Client.</p>`,
    '<div data-slot="card" class="docs-snippet-template docs-code-block docs-code-snippet-template" id="generated-docs-snippet-guide" data-snippet-kind="code">',
    '  <div class="docs-code-toolbar"><button class="docs-snippet-copy docs-code-copy" data-copy-active-snippet><span class="sr-only">Copy code</span></button></div>',
    '  <div class="docs-snippet-panels"><pre class="shiki"><code>class GithubClient {}</code></pre></div>',
    "</div>",
  ].join("\n");
}
