import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { TestContext } from "node:test";
import { promisify } from "node:util";

import type { DocsProject } from "../../docs/project-manifest.ts";
import { projectDirectory } from "./paths.ts";

const execFile = promisify(execFileCallback);

export async function temporaryDirectory(
  t: TestContext,
  prefix: string,
): Promise<string> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rm(directory, { force: true, recursive: true }));
  return directory;
}

export async function writeTextFile(
  file: string,
  content: string | string[],
): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(
    file,
    Array.isArray(content) ? content.join("\n") : content,
    "utf8",
  );
}

// ---------------------------------------------------------------------------
// Docs projects
// ---------------------------------------------------------------------------

export type DocsProjectSpec = {
  slug: string;
  displayName: string;
  repositoryName: string;
};

export function docsProject(spec: DocsProjectSpec): DocsProject {
  return {
    slug: spec.slug,
    displayName: spec.displayName,
    projectKey: spec.slug,
    module: `io.micronaut.${spec.slug}:micronaut-${spec.slug}-bom`,
    repositoryName: spec.repositoryName,
    publishedGuideUrl: `https://micronaut-projects.github.io/${spec.repositoryName}/latest/guide/`,
    repositoryUrl: `https://github.com/micronaut-projects/${spec.repositoryName}.git`,
    branch: "master",
    submodulePath: `repos/${spec.repositoryName}`,
    platformVersionKey: "micronaut",
  };
}

export const fixtureDocsProject: DocsProjectSpec = {
  slug: "fixture",
  displayName: "Micronaut Fixture",
  repositoryName: "micronaut-fixture",
};

export async function writeDocsProjectCatalog(
  docsDirectory: string,
  projects: DocsProjectSpec[],
): Promise<void> {
  await writeTextFile(
    path.join(docsDirectory, "docs-projects.fixture.json"),
    JSON.stringify(
      {
        source: "test fixture",
        publishedSource: "",
        projectCount: projects.length,
        categories: [],
        projects: projects.map((project) => ({
          ...docsProject(project),
          shortName: project.displayName.replace(/^Micronaut\s+/i, ""),
          version: "",
          icon: "lucide:book-open",
          primaryCategory: "test",
          categorySlugs: ["test"],
          shortDescription: project.displayName,
          longDescription: `${project.displayName} test fixture.`,
        })),
      },
      null,
      2,
    ),
  );
}

export async function writePlatformVersionCatalog(
  docsDirectory: string,
  versionsBySlug: Record<string, string>,
): Promise<void> {
  await writeTextFile(
    path.join(
      docsDirectory,
      "repos",
      "micronaut-platform",
      "gradle",
      "libs.versions.toml",
    ),
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
    ],
  );
}

export type DocsSection = {
  id: string;
  title: string;
  body: string;
  child?: { id: string; title: string; body: string };
};

// Writes a project's docs guide: toc.yml plus one adoc per section. A single
// string body is written as an `introduction` section.
export async function writeDocsGuide(
  docsDirectory: string,
  repositoryName: string,
  title: string,
  sections: string | DocsSection[],
): Promise<string> {
  const guideDirectory = path.join(
    docsDirectory,
    "repos",
    repositoryName,
    "src",
    "main",
    "docs",
    "guide",
  );
  const resolved: DocsSection[] =
    typeof sections === "string"
      ? [{ id: "introduction", title: "Introduction", body: sections }]
      : sections;
  await writeTextFile(path.join(guideDirectory, "toc.yml"), [
    `title: ${title}`,
    ...resolved.flatMap((section): string[] =>
      section.child
        ? [
            `${section.id}:`,
            `  title: ${section.title}`,
            `  ${section.child.id}: ${section.child.title}`,
          ]
        : [`${section.id}: ${section.title}`],
    ),
    "",
  ]);
  for (const section of resolved) {
    await writeTextFile(
      path.join(guideDirectory, `${section.id}.adoc`),
      section.body,
    );
    if (section.child) {
      await writeTextFile(
        path.join(guideDirectory, section.id, `${section.child.id}.adoc`),
        section.child.body,
      );
    }
  }
  return guideDirectory;
}

export type RenderRunOptions = {
  env?: Record<string, string>;
  strict?: boolean;
};

export function nonStrictDocsEnv(): Record<string, string> {
  return {
    ...(process.env as Record<string, string>),
    CI: "false",
    DOCS_PROJECT_SLUGS: "",
    DOCS_RENDER_ALL: "false",
    DOCS_RENDER_STRICT: "false",
    DOCS_SYNC_SOURCES: "false",
  };
}

export function nonStrictGuidesEnv(): Record<string, string> {
  return {
    ...(process.env as Record<string, string>),
    CI: "false",
    GUIDES_RENDER_ALL: "false",
    GUIDES_RENDER_STRICT: "false",
    GUIDES_RENDER_SLUGS: "",
  };
}

// Runs scripts/render-docs.ts as the build does. Non-strict by default so a
// test that exercises strict mode has to ask for it.
export function runRenderDocs(
  docsDirectory: string,
  outputDirectory: string,
  args: string[] = [],
  options: RenderRunOptions = {},
): Promise<{ stdout: string; stderr: string }> {
  return execFile(
    process.execPath,
    [
      "scripts/render-docs.ts",
      "--docs-dir",
      docsDirectory,
      "--output",
      outputDirectory,
      ...args,
      ...(options.strict ? ["--strict"] : []),
    ],
    {
      cwd: projectDirectory,
      env: options.env || (options.strict ? process.env : nonStrictDocsEnv()),
    },
  );
}

export function runRenderGuides(
  guidesDirectory: string,
  outputDirectory: string,
  args: string[] = [],
  options: RenderRunOptions = {},
): Promise<{ stdout: string; stderr: string }> {
  return execFile(
    process.execPath,
    [
      "scripts/render-guides.ts",
      "--guides-dir",
      guidesDirectory,
      "--output",
      outputDirectory,
      ...args,
      ...(options.strict ? ["--strict"] : []),
    ],
    {
      cwd: projectDirectory,
      env: options.env || (options.strict ? process.env : nonStrictGuidesEnv()),
    },
  );
}

// ---------------------------------------------------------------------------
// Guides projects
// ---------------------------------------------------------------------------

export type GuideMetadata = Record<string, unknown>;

export async function writeGuideMetadata(
  guidesDirectory: string,
  slug: string,
  metadata: GuideMetadata,
): Promise<string> {
  const guideDirectory = path.join(guidesDirectory, "guides", slug);
  await writeTextFile(path.join(guidesDirectory, "version.txt"), "4.9.0\n");
  await writeTextFile(
    path.join(guideDirectory, "metadata.json"),
    JSON.stringify(
      {
        intro: "Fixture intro.",
        authors: ["Micronaut"],
        tags: ["test"],
        categories: ["Test"],
        publicationDate: "2026-01-01",
        languages: ["java"],
        buildTools: ["gradle"],
        apps: [{ name: "default", features: [] }],
        ...metadata,
      },
      null,
      2,
    ),
  );
  return guideDirectory;
}

export async function writeCommonLicense(
  guidesDirectory: string,
): Promise<void> {
  await writeTextFile(
    path.join(
      guidesDirectory,
      "src",
      "docs",
      "common",
      "snippets",
      "common-license.adoc",
    ),
    "",
  );
}

// The guide the end-to-end guides tests render: every macro family the guides
// pipeline supports, with sources that exercise callout matching.
export async function writeGuideFixture(
  guidesDirectory: string,
  slug: string,
  title: string,
): Promise<string> {
  const guideDirectory = await writeGuideMetadata(guidesDirectory, slug, {
    title,
    tags: ["http-client", "test"],
    categories: ["HTTP Client"],
    buildTools: ["gradle", "maven"],
    apps: [{ name: "default", features: ["http-client"] }],
  });
  const common = path.join(guidesDirectory, "src", "docs", "common");
  const javaSources = path.join(
    guideDirectory,
    "java",
    "src",
    "main",
    "java",
    "example",
    "micronaut",
  );
  await writeCommonLicense(guidesDirectory);
  await writeTextFile(
    path.join(common, "snippets", "common-template.adoc"),
    "Hello {0_U} from template\n",
  );
  await writeTextFile(
    path.join(common, "callouts", "callout-fixture.adoc"),
    "Injected value: {0}\n",
  );
  for (const name of ["one", "two", "three", "four"]) {
    await writeTextFile(
      path.join(common, "callouts", `callout-generated-${name}.adoc`),
      `<.> Generated callout ${name}.\n`,
    );
  }
  await writeTextFile(path.join(guideDirectory, `${slug}.adoc`), [
    "common-template::template.adoc[arg0=default]",
    "callout::fixture[arg0=World]",
    "guideLink:another-guide[Another Guide]",
    "https://guides.micronaut.io/latest/legacy-guide.html[Legacy Guide]",
    "https://micronaut-projects.github.io/micronaut-guides-v2/micronaut-jpa-hibernate-gradle-java/[JPA Guide]",
    "https://micronaut-projects.github.io/micronaut-docs-v2/latest/guide/#dataAccess[Configurations for Data Access]",
    "link:@sourceDir@.zip[Download]",
    "",
    "diffLink::[]",
    "",
    ":dependencies:",
    "dependency:micronaut-http-client[groupId=io.micronaut,callout=1]",
    "dependency:micronaut-validation[groupId=io.micronaut.validation,callout=2]",
    ":dependencies:",
    "<1> Adds HTTP client dependency.",
    "<2> Adds validation dependency.",
    ":exclude-for-languages:java,groovy",
    "Java and Groovy guide text should not render.",
    ":exclude-for-languages:",
    ":exclude-for-languages:kotlin",
    "Kotlin-only guide text remains for Java.",
    ":exclude-for-languages:",
    ":exclude-for-build:gradle",
    "Maven-only guide text remains for Maven.",
    ":exclude-for-build:",
    ":exclude-for-build:maven",
    "== Gradle-only fixture heading",
    "Gradle-only guide text remains for Gradle.",
    ":exclude-for-build:",
    "source::ExampleController[tags=package|hello]",
    "resource::application.properties[tag=config]",
    "<1> Properties comment callout attaches to the property line.",
    "source::SequentialCalloutController[]",
    "callout::generated-one[]",
    "callout::generated-two[]",
    "callout::generated-three[]",
    "callout::generated-four[]",
    "source::MarkedController[]",
    "callout::generated-one[]",
    "<2> Manual callout keeps its place.",
    "callout::generated-three[]",
    "source::PartiallyMarkedController[]",
    "callout::generated-one[]",
    "<2> Missing source marker becomes manual.",
    "source::GappedController[]",
    "<1> Gapped first real callout.",
    "<2> Gapped missing marker becomes manual.",
    "<3> Gapped second real callout.",
    "<4> Gapped third real callout.",
    "<5> Gapped fourth real callout.",
    "",
    "[source,java]",
    "----",
    `include::{sourceDir}/${slug}/@sourceDir@/src/main/@lang@/example/micronaut/IncludedController.@languageextension@[tag=included]`,
    "----",
    "<1> Raw include callout.",
    "",
    "[source,yaml]",
    "----",
    `include::{sourceDir}/${slug}/@sourceDir@/deployment/k8s.yml[]`,
    "----",
    "<1> Kubernetes include callout.",
    "",
    "[source,kotlin]",
    "----",
    "class GuideKotlinSnippet",
    "----",
    "",
    "[source,groovy]",
    "----",
    "class GuideGroovySnippet {",
    "}",
    "----",
    "",
    "[source,properties]",
    "----",
    "guide.fixture.enabled=true",
    "----",
    "",
    ".Configuration Properties",
    '[cols="1,1"]',
    "|===",
    "|Property |Description",
    "|`micronaut.server.port` |Server port.",
    "|===",
    "",
    "[source,java]",
    "----",
    "final class UnmarkedController {",
    "}",
    "----",
    "<1> Unmarked source callout.",
  ]);
  await writeTextFile(path.join(javaSources, "ExampleController.java"), [
    "// tag::package[]",
    "package example.micronaut;",
    "// end::package[]",
    "",
    "// tag::hello[]",
    "final class ExampleController {",
    "}",
    "// end::hello[]",
  ]);
  await writeTextFile(
    path.join(javaSources, "SequentialCalloutController.java"),
    [
      "package example.micronaut;",
      "",
      "final class SequentialCalloutController {",
      "    void one() { // <1>",
      "    }",
      "",
      "    void two() { // <2>",
      "    }",
      "",
      "    void three() { // <3>",
      "    }",
      "",
      "    void four() { // <4>",
      "    }",
      "}",
    ],
  );
  await writeTextFile(path.join(javaSources, "MarkedController.java"), [
    "package example.micronaut;",
    "",
    "final class MarkedController {",
    "    void generated() { // <1>",
    "    }",
    "",
    "    void manual() { // <2>",
    "    }",
    "",
    "    void generatedAgain() { // <3>",
    "    }",
    "}",
  ]);
  await writeTextFile(path.join(javaSources, "IncludedController.java"), [
    "package example.micronaut;",
    "",
    "// tag::included[]",
    "final class IncludedController {",
    "    String value() { // <1>",
    '        return "included";',
    "    }",
    "}",
    "// end::included[]",
  ]);
  await writeTextFile(
    path.join(javaSources, "PartiallyMarkedController.java"),
    [
      "package example.micronaut;",
      "",
      "final class PartiallyMarkedController {",
      "    void generated() { // <1>",
      "    }",
      "}",
    ],
  );
  await writeTextFile(path.join(javaSources, "GappedController.java"), [
    "package example.micronaut;",
    "",
    "final class GappedController {",
    "    void first() { // <1>",
    "    }",
    "",
    "    void second() { // <3>",
    "    }",
    "",
    "    void third() { // <4>",
    "    }",
    "",
    "    void fourth() { // <5>",
    "    }",
    "}",
  ]);
  await writeTextFile(
    path.join(
      guideDirectory,
      "src",
      "main",
      "resources",
      "application.properties",
    ),
    [
      "# tag::config[]",
      "message=Hello",
      "# <1>",
      "fixture.marker.transport=HTTP",
      "# end::config[]",
    ],
  );
  await writeTextFile(path.join(guideDirectory, "deployment", "k8s.yml"), [
    "apiVersion: v1",
    "kind: Service # <1>",
    "metadata:",
    "  name: fixture",
  ]);
  return guideDirectory;
}
