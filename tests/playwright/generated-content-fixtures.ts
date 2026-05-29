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
const fixtureDirectory = path.join(
  projectDirectory,
  "scripts",
  "tests",
  "asciidoc",
  "fixtures",
);

type DocsProjectSource = {
  displayName: string;
  docExampleDirectories?: string[];
  fallbackLanguage: string;
  guideFiles: string[];
  module: string;
  projectKey: string;
  repositoryName: string;
  slug: string;
  sourceDirectoryName: string;
  toc: string;
  version: string;
  versionKey: string;
};

const docsProjects: DocsProjectSource[] = [
  {
    displayName: "Micronaut Core",
    fallbackLanguage: "java",
    guideFiles: ["introduction.adoc", "quickStart.adoc"],
    module: "io.micronaut:micronaut-core-bom",
    projectKey: "core",
    repositoryName: "micronaut-core",
    slug: "core",
    sourceDirectoryName: "micronaut-core",
    toc: [
      "title: Micronaut Core",
      "introduction: Introduction",
      "quickStart: Quick Start",
      "snippetGallery: Snippet Gallery",
      "",
    ].join("\n"),
    version: "5.0.0",
    versionKey: "managed-micronaut-core",
  },
  {
    displayName: "Micronaut Data",
    docExampleDirectories: [
      "hibernate-example-java",
      "hibernate-example-kotlin",
      "hibernate-example-groovy",
    ],
    fallbackLanguage: "kotlin",
    guideFiles: ["introduction.adoc"],
    module: "io.micronaut.data:micronaut-data-bom",
    projectKey: "data",
    repositoryName: "micronaut-data",
    slug: "data",
    sourceDirectoryName: "micronaut-data",
    toc: ["title: Micronaut Data", "introduction: Introduction", ""].join("\n"),
    version: "5.0.1",
    versionKey: "managed-micronaut-data",
  },
  {
    displayName: "Micronaut Serialization",
    docExampleDirectories: ["example-java", "example-kotlin", "example-groovy"],
    fallbackLanguage: "groovy",
    guideFiles: ["quickStart.adoc", "quickStart/jacksonQuick.adoc"],
    module: "io.micronaut.serde:micronaut-serde-bom",
    projectKey: "serialization",
    repositoryName: "micronaut-serialization",
    slug: "serde",
    sourceDirectoryName: "micronaut-serialization",
    toc: [
      "title: Micronaut Serialization",
      "quickStart:",
      "  title: Quick Start",
      "  jacksonQuick: Jackson Annotations & Jackson Core",
      "",
    ].join("\n"),
    version: "3.0.0",
    versionKey: "managed-micronaut-serialization",
  },
];
const docsProjectSlugs = docsProjects.map((project) => project.slug);
const guideSlugs = [
  "creating-your-first-micronaut-app",
  "micronaut-http-client",
  "micronaut-data-jdbc-repository",
  "snippet-gallery",
];
const realGuideSlugs = guideSlugs.filter((slug) => slug !== "snippet-gallery");

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

  await fs.rm(docsDirectory, { force: true, recursive: true });
  await writeDocsProjectCatalog(docsDirectory, docsProjects);
  await writePlatformVersionCatalog(docsDirectory, docsProjects);
  await copyDocsProjectSources(docsDirectory, docsProjects);

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
  const sourceGuidesDirectory = path.resolve(
    process.env.MICRONAUT_GUIDES_DIR ||
      path.join(projectDirectory, "..", "micronaut-guides"),
  );
  const guidesDirectory = path.join(projectDirectory, ".playwright", "guides");
  const generatedGuidesDirectory = path.join(
    projectDirectory,
    "src",
    "content",
    "generated-guides",
  );

  await fs.rm(guidesDirectory, { force: true, recursive: true });
  if (await isDirectory(sourceGuidesDirectory)) {
    await copyGuideRepositorySubset(sourceGuidesDirectory, guidesDirectory);
  } else {
    console.warn(
      `Missing micronaut-guides checkout at ${sourceGuidesDirectory}; using checked-in Playwright guide fixtures.`,
    );
    await writeFallbackGuideRepository(guidesDirectory);
  }
  await copySnippetGalleryGuide(guidesDirectory);

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

async function writeDocsProjectCatalog(
  docsDirectory: string,
  projects: DocsProjectSource[],
): Promise<void> {
  await fs.mkdir(docsDirectory, { recursive: true });
  await fs.writeFile(
    path.join(docsDirectory, "docs-projects.fixture.json"),
    JSON.stringify(
      {
        source: "playwright copied docs",
        publishedSource: "",
        projectCount: projects.length,
        categories: [
          {
            slug: "playwright",
            name: "Playwright Copied Docs",
            icon: "lucide:book-open",
            description:
              "Copied generated-docs source folders used by browser tests.",
            projectSlugs: projects.map((project) => project.slug),
          },
        ],
        projects: projects.map((project) => ({
          slug: project.slug,
          displayName: project.displayName,
          shortName: project.displayName.replace(/^Micronaut\s+/i, ""),
          projectKey: project.projectKey,
          module: project.module,
          repositoryName: project.repositoryName,
          repositoryUrl: `https://github.com/micronaut-projects/${project.repositoryName}.git`,
          publishedGuideUrl: `https://micronaut-projects.github.io/${project.repositoryName}/latest/guide/`,
          branch: "master",
          submodulePath: `repos/${project.repositoryName}`,
          platformVersionKey: project.versionKey,
          version: project.version,
          icon: "lucide:book-open",
          primaryCategory: "playwright",
          categorySlugs: ["playwright"],
          shortDescription: project.displayName,
          longDescription: `${project.displayName} copied browser layout fixture.`,
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
  projects: DocsProjectSource[],
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
      ...projects.map(
        (project): string => `${project.versionKey} = "${project.version}"`,
      ),
      "",
      "[libraries]",
      ...projects.map(
        (project): string =>
          `boms-micronaut-${project.projectKey} = { module = "${project.module}", version.ref = "${project.versionKey}" }`,
      ),
    ].join("\n"),
    "utf8",
  );
}

async function copyDocsProjectSources(
  docsDirectory: string,
  projects: DocsProjectSource[],
): Promise<void> {
  const sourceRoot = path.resolve(
    process.env.MICRONAUT_DOCS_PROJECTS_DIR ||
      path.join(projectDirectory, ".."),
  );

  await Promise.all(
    projects.map(async (project): Promise<void> => {
      const environmentName = docsProjectDirectoryEnvName(project);
      const sourceDirectory = path.resolve(
        process.env[environmentName] ||
          path.join(sourceRoot, project.sourceDirectoryName),
      );
      const targetDirectory = path.join(
        docsDirectory,
        "repos",
        project.repositoryName,
      );
      const targetGuideDirectory = path.join(
        targetDirectory,
        "src",
        "main",
        "docs",
        "guide",
      );
      await fs.mkdir(targetGuideDirectory, { recursive: true });
      if (!(await isDirectory(sourceDirectory))) {
        console.warn(
          `Missing ${project.displayName} checkout at ${sourceDirectory}; using checked-in Playwright docs fixture.`,
        );
        await writeFallbackDocsProject(targetDirectory, project);
        return;
      }

      await copyIfExists(
        path.join(sourceDirectory, "gradle.properties"),
        path.join(targetDirectory, "gradle.properties"),
      );
      await copyIfExists(
        path.join(sourceDirectory, "src", "main", "docs", "resources"),
        path.join(targetDirectory, "src", "main", "docs", "resources"),
      );
      await Promise.all(
        project.guideFiles.map((file) =>
          copyFile(
            path.join(sourceDirectory, "src", "main", "docs", "guide", file),
            path.join(targetGuideDirectory, file),
          ),
        ),
      );
      if (project.slug === "core") {
        await copyFile(
          path.join(fixtureDirectory, "snippet-gallery.adoc"),
          path.join(targetGuideDirectory, "snippetGallery.adoc"),
        );
      }
      for (const directory of project.docExampleDirectories || []) {
        await copyIfExists(
          path.join(sourceDirectory, "doc-examples", directory),
          path.join(targetDirectory, "doc-examples", directory),
        );
      }
      await fs.writeFile(
        path.join(targetGuideDirectory, "toc.yml"),
        project.toc,
      );
    }),
  );
}

async function writeFallbackDocsProject(
  targetDirectory: string,
  project: DocsProjectSource,
): Promise<void> {
  const targetGuideDirectory = path.join(
    targetDirectory,
    "src",
    "main",
    "docs",
    "guide",
  );
  await fs.mkdir(targetGuideDirectory, { recursive: true });
  await fs.writeFile(
    path.join(targetDirectory, "gradle.properties"),
    [`projectVersion=${project.version}`, ""].join("\n"),
    "utf8",
  );
  await Promise.all(
    project.guideFiles.map(async (file): Promise<void> => {
      const targetFile = path.join(targetGuideDirectory, file);
      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.writeFile(targetFile, fallbackDocsSource(project, file), "utf8");
    }),
  );
  if (project.slug === "core") {
    await copyFile(
      path.join(fixtureDirectory, "snippet-gallery.adoc"),
      path.join(targetGuideDirectory, "snippetGallery.adoc"),
    );
  }
  await fs.writeFile(path.join(targetGuideDirectory, "toc.yml"), project.toc);
}

function fallbackDocsSource(project: DocsProjectSource, file: string): string {
  return [
    `${project.displayName} copied fixture content for ${file}.`,
    "",
    `[source,${project.fallbackLanguage}]`,
    "----",
    ...fallbackSourceLines(project),
    "----",
    "<1> The copied docs fixture callout is rendered below the snippet card.",
    "",
    "This fixture is used when the external docs project checkout is not available.",
  ].join("\n");
}

function fallbackSourceLines(project: DocsProjectSource): string[] {
  const className = `${pascalCase(project.projectKey)}PlaywrightFixture`;
  if (project.fallbackLanguage === "kotlin") {
    return [`class ${className} {`, "    fun run() { // <1>", "    }", "}"];
  }
  if (project.fallbackLanguage === "groovy") {
    return [`class ${className} {`, "    void run() { // <1>", "    }", "}"];
  }
  return [
    `final class ${className} {`,
    "    void run() { // <1>",
    "    }",
    "}",
  ];
}

async function copyGuideRepositorySubset(
  sourceDirectory: string,
  targetDirectory: string,
): Promise<void> {
  await copyIfExists(
    path.join(sourceDirectory, "version.txt"),
    path.join(targetDirectory, "version.txt"),
  );
  await copyIfExists(
    path.join(sourceDirectory, "src", "docs", "common"),
    path.join(targetDirectory, "src", "docs", "common"),
  );
  await Promise.all(
    realGuideSlugs.map((slug) =>
      copyDirectory(
        path.join(sourceDirectory, "guides", slug),
        path.join(targetDirectory, "guides", slug),
      ),
    ),
  );
  await copyIfExists(
    path.join(sourceDirectory, "guides", "hello-base"),
    path.join(targetDirectory, "guides", "hello-base"),
  );
}

async function writeFallbackGuideRepository(
  guidesDirectory: string,
): Promise<void> {
  await fs.mkdir(guidesDirectory, { recursive: true });
  await fs.writeFile(
    path.join(guidesDirectory, "version.txt"),
    "4.9.0\n",
    "utf8",
  );
  await fs.mkdir(
    path.join(guidesDirectory, "src", "docs", "common", "snippets"),
    { recursive: true },
  );
  await fs.writeFile(
    path.join(
      guidesDirectory,
      "src",
      "docs",
      "common",
      "snippets",
      "common-license.adoc",
    ),
    "",
    "utf8",
  );
  await Promise.all([
    writeFallbackGuide(guidesDirectory, {
      buildTools: ["gradle", "maven"],
      languages: ["java", "kotlin"],
      slug: "micronaut-http-client",
      title: "Micronaut HTTP Client",
    }),
    writeFallbackGuide(guidesDirectory, {
      buildTools: ["gradle"],
      languages: ["java"],
      slug: "creating-your-first-micronaut-app",
      title: "Creating your first Micronaut application",
    }),
    writeFallbackGuide(guidesDirectory, {
      buildTools: ["gradle"],
      languages: ["java"],
      slug: "micronaut-data-jdbc-repository",
      title: "Access a database with Micronaut Data JDBC",
    }),
  ]);
}

async function writeFallbackGuide(
  guidesDirectory: string,
  guide: {
    buildTools: string[];
    languages: string[];
    slug: string;
    title: string;
  },
): Promise<void> {
  const guideDirectory = path.join(guidesDirectory, "guides", guide.slug);
  await fs.mkdir(guideDirectory, { recursive: true });
  await fs.writeFile(
    path.join(guideDirectory, "metadata.json"),
    `${JSON.stringify(
      {
        title: guide.title,
        intro: "Copied Playwright guide fixture.",
        authors: ["Micronaut"],
        categories: ["Test"],
        publicationDate: "2026-01-01",
        tags: ["test"],
        languages: guide.languages,
        buildTools: guide.buildTools,
        testFramework: "junit",
        apps: [
          {
            name: "default",
            applicationType: "DEFAULT",
            features: ["http-client"],
            javaFeatures: [],
            kotlinFeatures: [],
            groovyFeatures: [],
          },
        ],
        minimumJavaVersion: "21",
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(guideDirectory, `${guide.slug}.adoc`),
    fallbackGuideSource(),
    "utf8",
  );
  await writeFallbackGuideSources(guideDirectory, guide.languages);
}

function fallbackGuideSource(): string {
  return [
    "== What you will need",
    "",
    "Download and unzip the source.",
    "",
    "== Solution",
    "",
    "In this guide, we will create a Micronaut application written in @language@.",
    "",
    "[source,bash]",
    "----",
    "./gradlew test",
    "----",
    "",
    "source::ExampleController[]",
    "",
    "resource::application.properties[tag=config]",
    "",
    "[source,java]",
    "----",
    "final class InlineJavaFixture {",
    "}",
    "----",
    "",
    "[source,kotlin]",
    "----",
    "class InlineKotlinFixture",
    "----",
    "",
    "[source,groovy]",
    "----",
    "class InlineGroovyFixture {",
    "}",
    "----",
    "",
    "== Writing the Application",
    "",
    "dependency::micronaut-http-client[groupId=io.micronaut,callout=1]",
    "<1> Adds HTTP client dependency.",
    "",
    ".Configuration Properties",
    "|===",
    "|Property |Type |Description",
    "|micronaut.server.port |Integer |Server port.",
    "|micronaut.application.name |String |Application name.",
    "|===",
  ].join("\n");
}

async function writeFallbackGuideSources(
  guideDirectory: string,
  languages: string[],
): Promise<void> {
  await fs.mkdir(path.join(guideDirectory, "src", "main", "resources"), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(
      guideDirectory,
      "src",
      "main",
      "resources",
      "application.properties",
    ),
    [
      "# tag::config[]",
      "micronaut.application.name=playwright-fixture",
      "micronaut.server.port=8080",
      "# end::config[]",
    ].join("\n"),
    "utf8",
  );
  await Promise.all(
    languages.map(async (language): Promise<void> => {
      const extension =
        language === "kotlin"
          ? "kt"
          : language === "groovy"
            ? "groovy"
            : "java";
      const sourceDirectory = path.join(
        guideDirectory,
        language,
        "src",
        "main",
        language === "kotlin"
          ? "kotlin"
          : language === "groovy"
            ? "groovy"
            : "java",
        "example",
        "micronaut",
      );
      await fs.mkdir(sourceDirectory, { recursive: true });
      await fs.writeFile(
        path.join(sourceDirectory, `ExampleController.${extension}`),
        fallbackGuideSourceFile(language),
        "utf8",
      );
    }),
  );
}

function fallbackGuideSourceFile(language: string): string {
  if (language === "kotlin") {
    return [
      "package example.micronaut",
      "",
      "class ExampleController {",
      '    fun index(): String = "Hello"',
      "}",
    ].join("\n");
  }
  if (language === "groovy") {
    return [
      "package example.micronaut",
      "",
      "class ExampleController {",
      "    String index() {",
      '        "Hello"',
      "    }",
      "}",
    ].join("\n");
  }
  return [
    "package example.micronaut;",
    "",
    "final class ExampleController {",
    "    String index() {",
    '        return "Hello";',
    "    }",
    "}",
  ].join("\n");
}

async function copySnippetGalleryGuide(guidesDirectory: string): Promise<void> {
  const sourceDirectory = path.join(fixtureDirectory, "guide-macros");
  const guideDirectory = path.join(
    guidesDirectory,
    "guides",
    "snippet-gallery",
  );
  await copyIfExists(
    path.join(sourceDirectory, "src", "docs", "common"),
    path.join(guidesDirectory, "src", "docs", "common"),
  );
  await copyIfExists(
    path.join(sourceDirectory, "buildSrc"),
    path.join(guidesDirectory, "buildSrc"),
  );
  await copyIfExists(
    path.join(sourceDirectory, "guides", "gallery-external.adoc"),
    path.join(guidesDirectory, "guides", "gallery-external.adoc"),
  );
  await copyIfExists(
    path.join(sourceDirectory, "guides", "gallery-external-template.adoc"),
    path.join(guidesDirectory, "guides", "gallery-external-template.adoc"),
  );
  await copyDirectory(
    path.join(sourceDirectory, "guides", "snippet-gallery"),
    guideDirectory,
  );
  await fs.writeFile(
    path.join(guideDirectory, "snippet-gallery.adoc"),
    [
      ":guide-macro-gallery:",
      "",
      await fs.readFile(
        path.join(fixtureDirectory, "snippet-gallery.adoc"),
        "utf8",
      ),
    ].join("\n"),
    "utf8",
  );
  await fs.writeFile(
    path.join(guideDirectory, "metadata.json"),
    `${JSON.stringify(snippetGalleryMetadata(), null, 2)}\n`,
    "utf8",
  );
}

function snippetGalleryMetadata(): Record<string, unknown> {
  return {
    title: "Snippet Gallery",
    intro: "Snippet gallery guide macro fixture.",
    authors: ["Micronaut"],
    categories: ["Test"],
    publicationDate: "2026-01-01",
    tags: ["test"],
    languages: ["java"],
    buildTools: ["gradle"],
    testFramework: "junit",
    cloud: "",
    publish: true,
    asciidoctor: "snippet-gallery.adoc",
    apps: [
      {
        name: "default",
        applicationType: "DEFAULT",
        features: ["http-client"],
        javaFeatures: [],
        kotlinFeatures: [],
        groovyFeatures: [],
      },
    ],
    minimumJavaVersion: "21",
  };
}

function docsProjectDirectoryEnvName(project: DocsProjectSource): string {
  return `MICRONAUT_DOCS_${project.projectKey.toUpperCase().replaceAll("-", "_")}_DIR`;
}

function pascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() || ""}${part.slice(1)}`)
    .join("");
}

async function copyIfExists(source: string, target: string): Promise<void> {
  try {
    const stats = await fs.stat(source);
    if (stats.isDirectory()) {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.cp(source, target, { force: true, recursive: true });
      return;
    }
    if (stats.isFile()) {
      await copyFile(source, target);
    }
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function copyDirectory(source: string, target: string): Promise<void> {
  await assertDirectory(
    source,
    `Missing source fixture directory at ${source}`,
  );
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { force: true, recursive: true });
}

async function copyFile(source: string, target: string): Promise<void> {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}

async function isDirectory(directory: string): Promise<boolean> {
  try {
    const stats = await fs.stat(directory);
    return stats.isDirectory();
  } catch {
    return false;
  }
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
    // The explicit message below includes the environment override to use.
  }
  throw new Error(message);
}
