import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { readPlatformCatalogProjects } from "../../docs/project-manifest.ts";
import {
  buildDocsSearchIndex,
  extractGeneratedDocSearchItems,
} from "../../docs/search-index.ts";
import { isFatalDocsDiagnostic } from "../../docs/renderer.ts";
import {
  highlightListingBlocks,
  shikiLanguage,
} from "../../shared/highlight.ts";

const execFile = promisify(execFileCallback);
const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

test("generated docs are prepared before Astro dev and build", async (): Promise<void> => {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(projectDirectory, "package.json"), "utf8"),
  );
  const playwrightFixtureScript = await fs.readFile(
    path.join(
      projectDirectory,
      "tests",
      "playwright",
      "generated-content-fixtures.ts",
    ),
    "utf8",
  );
  const browserTestRunner = await fs.readFile(
    path.join(projectDirectory, "scripts", "run-docs-browser-tests.ts"),
    "utf8",
  );

  assert.equal(
    packageJson.scripts["prepare:generated-docs"],
    "npm run render:docs",
  );
  assert.equal(
    packageJson.scripts["prepare:generated-content"],
    "node scripts/prepare-generated-content.ts",
  );
  assert.equal(
    packageJson.scripts["test:docs"],
    "node --test scripts/tests/docs/*.test.ts && node scripts/run-docs-browser-tests.ts",
  );
  assert.equal(
    packageJson.scripts["test:docs:browser"],
    "node tests/playwright/generated-content-fixtures.ts docs && playwright test --config playwright.config.ts tests/playwright/docs.spec.ts",
  );
  assert.match(browserTestRunner, /npm_execpath/);
  assert.equal(
    await fileExists(
      path.join(
        projectDirectory,
        "scripts",
        "prepare-playwright-generated-content.ts",
      ),
    ),
    false,
  );
  assert.equal(
    await fileExists(
      path.join(
        projectDirectory,
        "tests",
        "playwright",
        "generated-content-fixtures.ts",
      ),
    ),
    true,
  );
  assert.equal(
    await fileExists(
      path.join(
        projectDirectory,
        "fixtures",
        "generated-content",
        "docs",
        "docs-projects.fixture.json",
      ),
    ),
    true,
  );
  assert.equal(
    await fileExists(
      path.join(
        projectDirectory,
        "fixtures",
        "generated-content",
        "guides",
        "version.txt",
      ),
    ),
    true,
  );
  assert.match(playwrightFixtureScript, /fixtures[\s\S]*generated-content/);
  assert.doesNotMatch(
    playwrightFixtureScript,
    /MICRONAUT_DOCS_PROJECTS_DIR|MICRONAUT_GUIDES_DIR|writeFallback|fallback/i,
  );
  assertScriptOrder(
    packageJson.scripts.dev,
    "npm run prepare:generated-content",
    "astro dev",
  );
  assertScriptOrder(
    packageJson.scripts.build,
    "npm run prepare:generated-content",
    "astro build",
  );
  assertScriptOrder(
    packageJson.scripts.build,
    "astro build",
    "node scripts/build-site-header-shell.ts",
  );
  assertScriptOrder(
    packageJson.scripts.build,
    "node scripts/build-site-header-shell.ts",
    "node scripts/prepare-template-artifacts.ts",
  );
  assertScriptOrder(
    packageJson.scripts["build:site"],
    "astro build",
    "node scripts/build-site-header-shell.ts",
  );
  assertScriptOrder(
    packageJson.scripts["build:site"],
    "node scripts/build-site-header-shell.ts",
    "node scripts/prepare-template-artifacts.ts",
  );
});

test("generated docs fragments and assets are ignored and not tracked source", async (): Promise<void> => {
  const ignoredPaths = [
    "src/content/generated-docs/generated-docs-test.html",
    "src/content/generated-docs/project-catalog.json",
    "src/content/generated-docs/assets/generated-docs-test/docs/img/example.png",
  ];
  const { stdout: ignoredOutput } = await execFile(
    "git",
    ["check-ignore", ...ignoredPaths],
    {
      cwd: projectDirectory,
    },
  );
  assert.deepEqual(lines(ignoredOutput), ignoredPaths);

  const { stdout: trackedOutput } = await execFile(
    "git",
    ["ls-files", "--", "src/content/generated-docs"],
    {
      cwd: projectDirectory,
    },
  );
  const trackedGeneratedOutput = lines(trackedOutput).filter(
    (file: any): any =>
      file.endsWith(".html") ||
      file.startsWith("src/content/generated-docs/assets/"),
  );
  assert.deepEqual(trackedGeneratedOutput, []);
});

test("Tailwind does not scan generated docs and guides fragments", async (): Promise<void> => {
  const globalsCss = await fs.readFile(
    path.join(projectDirectory, "src", "styles", "globals.css"),
    "utf8",
  );
  const generatedDocsExclusion =
    '@source not "../content/generated-docs/**/*";';
  const generatedGuidesExclusion =
    '@source not "../content/generated-guides/**/*";';

  assertScriptOrder(
    globalsCss,
    '@import "tailwindcss";',
    generatedDocsExclusion,
  );
  assertScriptOrder(
    globalsCss,
    generatedDocsExclusion,
    generatedGuidesExclusion,
  );
});

test("generated docs images default to a white surface", async (): Promise<void> => {
  const generatedDocsCss = await fs.readFile(
    path.join(projectDirectory, "src", "styles", "generated-docs-content.css"),
    "utf8",
  );

  assert.match(
    generatedDocsCss,
    /& img \{\s*@apply h-auto max-w-full bg-white;/,
  );
});

test("generated docs tooling uses Micronaut Platform catalog instead of the old aggregate docs project", async (): Promise<void> => {
  const checkedFiles = [
    ".github/workflows/deploy-docs.yml",
    ".github/workflows/deploy-web.yml",
    "README.md",
    "src/content/generated-docs/README.md",
    "src/data/docs-projects.fixture.json",
    "scripts/render-docs.ts",
    "scripts/sync-docs-fixture.ts",
  ];
  const fileContents = await Promise.all(
    checkedFiles.map(
      async (file: any): Promise<any> => [
        file,
        await fs.readFile(path.join(projectDirectory, file), "utf8"),
      ],
    ),
  );
  const workflow = fileContents.find(
    ([file]: any): any => file === ".github/workflows/deploy-docs.yml",
  )[1];
  const webWorkflow = fileContents.find(
    ([file]: any): any => file === ".github/workflows/deploy-web.yml",
  )[1];
  const syncScript = fileContents.find(
    ([file]: any): any => file === "scripts/sync-docs-fixture.ts",
  )[1];

  assert.match(workflow, /default:\s*micronaut-projects\/micronaut-platform/);
  assert.match(workflow, /DOCS_RENDER_ALL:\s*"true"/);
  assert.match(workflow, /DOCS_SYNC_SOURCES:\s*"true"/);
  assert.doesNotMatch(workflow, /micronaut-guides/);
  assert.doesNotMatch(workflow, /MICRONAUT_GUIDES_DIR/);
  assert.doesNotMatch(workflow, /GUIDES_RENDER_ALL/);
  assert.doesNotMatch(workflow, /GUIDES_RENDER_STRICT/);
  assert.doesNotMatch(webWorkflow, /micronaut-platform/);
  assert.doesNotMatch(webWorkflow, /DOCS_RENDER_ALL/);
  assert.doesNotMatch(webWorkflow, /DOCS_SYNC_SOURCES/);
  assert.match(syncScript, /readPlatformCatalogProjects/);

  const oldAggregateDocsProject = new RegExp("micronaut-platform-" + "docs");
  const oldPublishedDocsAggregate = new RegExp(
    String.raw`dstepanov\.github\.io\/micronaut-platform-` + "docs",
  );
  for (const [file, content] of fileContents) {
    assert.doesNotMatch(
      content,
      oldAggregateDocsProject,
      `${file} should not reference the old aggregate docs project`,
    );
    assert.doesNotMatch(
      content,
      oldPublishedDocsAggregate,
      `${file} should not reference the old published docs aggregate`,
    );
  }
});

test("docs project catalog uses unique project and category icons", async (): Promise<void> => {
  const catalog = JSON.parse(
    await fs.readFile(
      path.join(projectDirectory, "src", "data", "docs-projects.fixture.json"),
      "utf8",
    ),
  );
  const iconEntries = [
    ...catalog.categories.map((category: any): any => ({
      icon: category.icon,
      owner: `category:${category.slug}`,
    })),
    ...catalog.projects.map((project: any): any => ({
      icon: project.icon,
      owner: `project:${project.slug}`,
    })),
  ];
  const lucideIcons = await catalogLucideIconComponents();
  const ownersByIcon = new Map<string, string[]>();
  const unsupportedIcons: string[] = [];
  for (const entry of iconEntries) {
    const icon = await resolvedCatalogIconIdentity(entry.icon, lucideIcons);
    if (!icon) {
      unsupportedIcons.push(entry.icon);
      continue;
    }
    ownersByIcon.set(icon, [...(ownersByIcon.get(icon) || []), entry.owner]);
  }
  const duplicateIcons = [...ownersByIcon.entries()]
    .filter(([, owners]): any => owners.length > 1)
    .map(([icon, owners]): any => `${icon}: ${owners.join(", ")}`)
    .sort();

  assert.deepEqual([...new Set(unsupportedIcons)].sort(), []);
  assert.deepEqual(duplicateIcons, []);
});

test("docs renderer uses checked-in project metadata when external metadata is absent", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-generated-docs-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "missing-docs-metadata");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");

  await fs.mkdir(docsDirectory, { recursive: true });
  await execFile(
    process.execPath,
    [
      "scripts/render-docs.ts",
      "--docs-dir",
      docsDirectory,
      "--output",
      outputDirectory,
      "--slugs",
      "core",
    ],
    {
      cwd: projectDirectory,
      env: nonStrictEnv(),
    },
  );

  assert.deepEqual(await fs.readdir(outputDirectory), []);
});

test("docs renderer defaults to a small project subset", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-generated-docs-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "missing-docs-sources");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");

  await fs.mkdir(docsDirectory, { recursive: true });
  const { stderr } = await execFile(
    process.execPath,
    [
      "scripts/render-docs.ts",
      "--docs-dir",
      docsDirectory,
      "--output",
      outputDirectory,
    ],
    {
      cwd: projectDirectory,
      env: nonStrictEnv(),
    },
  );

  assert.deepEqual(
    lines(stderr)
      .filter((line: any): any => line.startsWith("Skipping "))
      .map((line: any): any => line.replace(/^Skipping ([^:]+):.*$/, "$1")),
    ["core", "data", "serde"],
  );
  assert.deepEqual(await fs.readdir(outputDirectory), []);
});

test("docs renderer writes project catalog from active platform versions", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-platform-docs-catalog-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const platformCatalogFile = path.join(
    docsDirectory,
    "repos",
    "micronaut-platform",
    "gradle",
    "libs.versions.toml",
  );

  await fs.mkdir(path.dirname(platformCatalogFile), { recursive: true });
  await fs.writeFile(
    platformCatalogFile,
    [
      "[versions]",
      'managed-micronaut-core = "4.10.22"',
      'managed-micronaut-data = "4.14.3"',
      "",
      "[libraries]",
      'boms-micronaut-core = { module = "io.micronaut:micronaut-core-bom", version.ref = "managed-micronaut-core" }',
      'boms-micronaut-data = { module = "io.micronaut.data:micronaut-data-bom", version.ref = "managed-micronaut-data" }',
    ].join("\n"),
    "utf8",
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
      "core",
    ],
    {
      cwd: projectDirectory,
      env: nonStrictEnv(),
    },
  );

  const catalog = JSON.parse(
    await fs.readFile(
      path.join(outputDirectory, "project-catalog.json"),
      "utf8",
    ),
  );
  const projectsBySlug = new Map<string, any>(
    catalog.projects.map((project: any): any => [project.slug, project]),
  );
  assert.equal(projectsBySlug.get("core")?.version, "4.10.22");
  assert.equal(projectsBySlug.get("data")?.version, "4.14.3");
});

test("docs renderer writes generated HTML and page-relative docs asset links", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-generated-docs-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const submoduleDirectory = path.join(
    docsDirectory,
    "repos",
    "micronaut-fixture",
  );
  const guideDirectory = path.join(
    submoduleDirectory,
    "src",
    "main",
    "docs",
    "guide",
  );
  const imageDirectory = path.join(
    submoduleDirectory,
    "src",
    "main",
    "docs",
    "resources",
    "img",
  );

  await writeDocsProjectManifest(docsDirectory);
  await fs.mkdir(guideDirectory, { recursive: true });
  await fs.mkdir(imageDirectory, { recursive: true });
  await fs.writeFile(
    path.join(guideDirectory, "toc.yml"),
    "title: Fixture Docs\nintroduction: Introduction\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(guideDirectory, "introduction.adoc"),
    [
      "This generated fixture body should render into the docs page.",
      "",
      "include::{includedir}configurationProperties/io.micronaut.fixture.GeneratedConfiguration.adoc[]",
      "",
      "image::diagram.svg[Fixture diagram]",
    ].join("\n"),
    "utf8",
  );
  await fs.writeFile(
    path.join(imageDirectory, "diagram.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>',
    "utf8",
  );

  const { stderr } = await execFile(
    process.execPath,
    [
      "scripts/render-docs.ts",
      "--docs-dir",
      docsDirectory,
      "--output",
      outputDirectory,
      "--slugs",
      "fixture",
    ],
    {
      cwd: projectDirectory,
    },
  );
  assert.doesNotMatch(stderr, /include file not found|GeneratedConfiguration/i);

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "fixture.html"),
    "utf8",
  );
  const pageRelativeAssetUrl = "../assets/fixture/docs/img/diagram.svg";

  assert.match(
    generatedHtml,
    /This generated fixture body should render into the docs page\./,
  );
  assert.doesNotMatch(generatedHtml, /<style\b[^>]*data-docs-shiki/i);
  assert.match(generatedHtml, /id="fixture-introduction"/);
  assert.match(
    generatedHtml,
    new RegExp(`src="${escapeRegExp(pageRelativeAssetUrl)}"`),
  );
  assert.equal(
    new URL(pageRelativeAssetUrl, "https://example.test/docs/fixture/")
      .pathname,
    "/docs/assets/fixture/docs/img/diagram.svg",
  );
  assert.equal(
    await fs.readFile(
      path.join(
        outputDirectory,
        "assets",
        "fixture",
        "docs",
        "img",
        "diagram.svg",
      ),
      "utf8",
    ),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>',
  );
});

test("docs renderer turns code, dependency, configuration, and properties snippets into shared cards", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-generated-snippets-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const submoduleDirectory = path.join(
    docsDirectory,
    "repos",
    "micronaut-fixture",
  );
  const snippetSourceDirectory = path.join(
    submoduleDirectory,
    "test-suite",
    "src",
    "test",
    "java",
    "example",
  );

  await writeDocsProjectManifest(docsDirectory);
  await fs.mkdir(snippetSourceDirectory, { recursive: true });
  await fs.writeFile(
    path.join(snippetSourceDirectory, "FixtureSnippet.java"),
    [
      "package example;",
      "",
      "// tag::body[]",
      "class FixtureSnippet {",
      "    void createBuilder() { // <1>",
      "    }",
      "",
      "    void customizeBuilder() { // <2>",
      "    }",
      "",
      "    void buildClient() { // <3>",
      "    }",
      "}",
      "// end::body[]",
    ].join("\n"),
    "utf8",
  );
  await writeGuide(
    docsDirectory,
    "micronaut-fixture",
    "Fixture Docs",
    [
      "snippet::example.FixtureSnippet[tags=body,title=Fixture Snippet,description=Rendered from snippet macro]",
      "",
      "<1> Snippet callout follows the generated card and may wrap",
      "    across a https://docs.micronaut.io/latest/guide/index.html#beanContext[Micronaut's Bean Context] continuation line.",
      "<2> The link:https://googleapis.dev/java/google-cloud-pubsub/latest/com/google/cloud/pubsub/v1/Publisher.html[Publisher] will be configured using a configuration named `batching`.",
      "<3> The link:https://googleapis.dev/java/google-cloud-pubsub/latest/com/google/cloud/pubsub/v1/Publisher.html[Publisher] will be configured using a configuration named `immediate`.",
      "",
      "[source,java]",
      "----",
      "class GeneratedJavaSnippet {",
      "}",
      "----",
      "",
      "[source,kotlin]",
      "----",
      "class GeneratedKotlinSnippet",
      "----",
      "",
      "[source,groovy]",
      "----",
      "class GeneratedGroovySnippet {",
      "}",
      "----",
      "",
      "dependency::micronaut-http-client[groupId=io.micronaut,title=HTTP Client dependency,description=Rendered from dependency macro]",
      "",
      "[configuration,title=Configuration snippet]",
      "----",
      "micronaut:",
      "  server:",
      "    port: 8080",
      "----",
      "",
      ".Configuration Properties",
      "|===",
      "|Property |Type |Description",
      "|micronaut.server.port |Integer |Server port",
      "|===",
    ].join("\n"),
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
      "fixture",
    ],
    {
      cwd: projectDirectory,
    },
  );

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "fixture.html"),
    "utf8",
  );
  const generatedText = textOnly(generatedHtml);

  assert.doesNotMatch(generatedHtml, /\[(?:snippet|dependency),payload=/);
  assert.match(generatedHtml, /docs-code-snippet-template/);
  assert.match(generatedHtml, /docs-dependency-template/);
  assert.match(generatedHtml, /docs-properties-template/);
  assertSnippetLanguageIcon(generatedHtml, "java", "java");
  assertSnippetLanguageIcon(generatedHtml, "kotlin", "kotlin");
  assertSnippetLanguageIcon(generatedHtml, "groovy", "groovy");
  assertSnippetLanguageIcon(generatedHtml, "gradle", "gradle");
  assertSnippetLanguageIcon(generatedHtml, "maven", "maven");
  assertSnippetLanguageIcon(generatedHtml, "properties", "properties");
  assertSnippetLanguageIcon(generatedHtml, "yaml", "yaml");
  assertSnippetLanguageIcon(generatedHtml, "toml", "toml");
  assertSnippetLanguageIcon(generatedHtml, "groovy-config", "groovy");
  assertSnippetLanguageIcon(generatedHtml, "hocon", "hocon");
  assertSnippetLanguageIcon(generatedHtml, "json-config", "json");
  assertNoRuntimeGeneratedRendering("generated docs HTML", generatedHtml);
  assert.match(generatedHtml, /docs-code-callouts/);
  assert.ok(
    generatedHtml.includes("px-6 pt-3 pb-3 text-sm leading-5"),
    "snippet callout footers should keep matching top and bottom padding",
  );
  assert.match(generatedHtml, /<i class="conum" data-value="1"><\/i>/);
  assert.ok(
    generatedHtml.includes(
      "[&amp;_td:first-child_.conum::before]:content-[attr(data-value)]",
    ),
  );
  assert.ok(generatedHtml.includes("[&amp;_td:first-child_.conum+b]:hidden"));
  assert.ok(generatedHtml.includes("[&amp;_tr+tr_td]:pt-[0.55rem]"));
  assert.ok(generatedHtml.includes("[&amp;_td:first-child]:align-middle"));
  assert.ok(generatedHtml.includes("[&amp;_td:first-child]:pt-0"));
  assert.ok(generatedHtml.includes("[&amp;_tr+tr_td:first-child]:pt-0"));
  assert.ok(generatedHtml.includes("[&amp;_.colist]:!m-0"));
  assert.match(generatedText, /Fixture Snippet/);
  assert.match(generatedText, /Rendered from snippet macro/);
  assert.match(generatedText, /Snippet callout follows the generated card/);
  assert.match(
    generatedText,
    /across a Micronaut(?:'|&#8217;)s Bean Context continuation line/,
  );
  assert.match(
    generatedHtml,
    /href="https:\/\/docs\.micronaut\.io\/latest\/guide\/index\.html#beanContext"[^>]*>Micronaut&#8217;s Bean Context<\/a>/,
  );
  assert.match(
    generatedText,
    /Publisher will be configured using a configuration named batching/,
  );
  assert.match(
    generatedText,
    /Publisher will be configured using a configuration named immediate/,
  );
  assert.match(
    generatedHtml,
    /href="https:\/\/googleapis\.dev\/java\/google-cloud-pubsub\/latest\/com\/google\/cloud\/pubsub\/v1\/Publisher\.html"[^>]*>Publisher<\/a>/,
  );
  assert.match(generatedHtml, /configuration named <code>batching<\/code>/);
  assert.match(generatedHtml, /configuration named <code>immediate<\/code>/);
  assert.doesNotMatch(
    generatedHtml,
    /link:https:\/\/googleapis\.dev\/java\/google-cloud-pubsub\/latest\/com\/google\/cloud\/pubsub\/v1\/Publisher\.html\[Publisher]/,
  );
  assert.doesNotMatch(generatedHtml, /&lt;2&gt; The link:/);
  assert.doesNotMatch(generatedHtml, /&lt;3&gt; The link:/);
  assert.match(generatedText, /HTTP Client dependency/);
  assert.match(generatedText, /Rendered from dependency macro/);
  assert.match(generatedText, /io\.micronaut:micronaut-http-client/);
  assert.match(generatedText, /Configuration snippet/);
  assert.match(generatedText, /micronaut\.server\.port=8080/);
  assert.match(generatedText, /Configuration Properties/);
  assert.match(generatedText, /2 properties/);
});

test("docs renderer groups Micronaut Data untagged repository snippets as language tabs", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-data-repository-snippets-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const submoduleDirectory = path.join(
    docsDirectory,
    "repos",
    "micronaut-fixture",
  );
  const exampleBaseDirectory = path.join(submoduleDirectory, "doc-examples");

  await writeDocsProjectManifest(docsDirectory);
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-java",
      "src",
      "main",
      "java",
      "example",
      "AccountRepository.java",
    ),
    [
      "package example;",
      "",
      "import io.micronaut.data.annotation.Repository;",
      "import io.micronaut.data.repository.CrudRepository;",
      "import jakarta.validation.Valid;",
      "import jakarta.validation.constraints.Min;",
      "",
      "@Repository",
      "public interface AccountRepository extends CrudRepository<@Valid Account, @Min(0) Long> {",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-kotlin",
      "src",
      "main",
      "kotlin",
      "example",
      "AccountRepository.kt",
    ),
    [
      "package example",
      "",
      "import io.micronaut.data.annotation.Repository",
      "import io.micronaut.data.repository.CrudRepository",
      "",
      "@Repository",
      "interface AccountRepository : CrudRepository<@jakarta.validation.Valid Account, @jakarta.validation.constraints.Min(0) Long>",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-groovy",
      "src",
      "main",
      "groovy",
      "example",
      "AccountRepository.groovy",
    ),
    [
      "package example",
      "",
      "import io.micronaut.data.annotation.Repository",
      "import io.micronaut.data.repository.CrudRepository",
      "",
      "@Repository",
      "interface AccountRepository extends CrudRepository<@jakarta.validation.Valid Account, @jakarta.validation.constraints.Min(0) Long> {",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-kotlin-ksp",
      "src",
      "main",
      "kotlin",
      "example",
      "AccountRepository.kt",
    ),
    [
      "package example",
      "",
      "import io.micronaut.data.annotation.Repository",
      "import io.micronaut.data.repository.CrudRepository",
      "",
      "@Repository",
      "interface AccountRepository : CrudRepository<Account, Long>",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-java",
      "src",
      "main",
      "java",
      "example",
      "AbstractBookRepository.java",
    ),
    [
      "package example;",
      "",
      "import io.micronaut.data.repository.CrudRepository;",
      "import java.util.List;",
      "",
      "public abstract class AbstractBookRepository implements CrudRepository<Book, Long> {",
      "    abstract List<Book> javaAbstractQuery(String title);",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-kotlin",
      "src",
      "main",
      "kotlin",
      "example",
      "AbstractBookRepository.kt",
    ),
    [
      "package example",
      "",
      "import io.micronaut.data.repository.CrudRepository",
      "",
      "abstract class AbstractBookRepository : CrudRepository<Book, Long> {",
      "    abstract fun kotlinAbstractQuery(title: String): List<Book>",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-groovy",
      "src",
      "main",
      "groovy",
      "example",
      "AbstractBookRepository.groovy",
    ),
    [
      "package example",
      "",
      "import io.micronaut.data.repository.CrudRepository",
      "",
      "abstract class AbstractBookRepository implements CrudRepository<Book, Long> {",
      "    abstract List<Book> groovyAbstractQuery(String title)",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-kotlin-ksp",
      "src",
      "main",
      "kotlin",
      "example",
      "AbstractBookRepository.kt",
    ),
    [
      "package example",
      "",
      "abstract class AbstractBookRepository {",
      "    abstract fun kspAbstractDuplicateShouldNotRender(): Book",
      "}",
    ],
  );
  await writeGuide(
    docsDirectory,
    "micronaut-fixture",
    "Micronaut Data Fixture",
    [
      "Repositories can have the entity and the ID values validated.",
      "To add the validation, annotate the repository's generic type argument with Jakarta Validation annotations:",
      "",
      'snippet::example.AccountRepository[project-base="doc-examples/hibernate-example", source="main"]',
      "",
      "Note that in addition to interfaces you can also define repositories as abstract classes:",
      "",
      'snippet::example.AbstractBookRepository[project-base="doc-examples/hibernate-example", source="main"]',
      "",
      "As you can see from the above example, using abstract classes can be useful.",
    ].join("\n"),
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
      "fixture",
    ],
    {
      cwd: projectDirectory,
    },
  );

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "fixture.html"),
    "utf8",
  );
  const validationIndex = generatedHtml.indexOf(
    "Repositories can have the entity and the ID values validated.",
  );
  assert.notEqual(validationIndex, -1);
  const abstractRepositoryIndex = generatedHtml.indexOf(
    "Note that in addition to interfaces you can also define repositories as abstract classes:",
    validationIndex,
  );
  assert.notEqual(abstractRepositoryIndex, -1);
  const validationHtml = generatedHtml.slice(
    validationIndex,
    abstractRepositoryIndex,
  );
  const abstractRepositoryHtml = generatedHtml.slice(
    abstractRepositoryIndex,
    generatedHtml.indexOf("As you can see", abstractRepositoryIndex),
  );

  assert.equal(countMatches(validationHtml, /docs-code-snippet-template/g), 1);
  assert.equal(countMatches(validationHtml, /role="tablist"/g), 1);
  assertSnippetLanguageIcon(validationHtml, "java", "java");
  assertSnippetLanguageIcon(validationHtml, "kotlin", "kotlin");
  assertSnippetLanguageIcon(validationHtml, "groovy", "groovy");
  assert.match(textOnly(validationHtml), /@Valid Account/);
  assert.match(textOnly(validationHtml), /jakarta\.validation\.Valid Account/);
  assert.doesNotMatch(
    textOnly(validationHtml),
    /CrudRepository<Account, Long>/,
  );
  assert.equal(
    countMatches(abstractRepositoryHtml, /docs-code-snippet-template/g),
    1,
  );
  assert.equal(countMatches(abstractRepositoryHtml, /role="tablist"/g), 1);
  assertSnippetLanguageIcon(abstractRepositoryHtml, "java", "java");
  assertSnippetLanguageIcon(abstractRepositoryHtml, "kotlin", "kotlin");
  assertSnippetLanguageIcon(abstractRepositoryHtml, "groovy", "groovy");
  assert.match(textOnly(abstractRepositoryHtml), /javaAbstractQuery/);
  assert.match(textOnly(abstractRepositoryHtml), /kotlinAbstractQuery/);
  assert.match(textOnly(abstractRepositoryHtml), /groovyAbstractQuery/);
  assert.doesNotMatch(
    textOnly(abstractRepositoryHtml),
    /kspAbstractDuplicateShouldNotRender/,
  );
});

test("docs renderer groups Micronaut Data tagged repository snippets as language tabs", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-data-intro-repository-snippets-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const submoduleDirectory = path.join(
    docsDirectory,
    "repos",
    "micronaut-fixture",
  );
  const exampleBaseDirectory = path.join(submoduleDirectory, "doc-examples");

  await writeDocsProjectManifest(docsDirectory);
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-java",
      "src",
      "main",
      "java",
      "example",
      "BookRepository.java",
    ),
    [
      "// tag::repository[]",
      "package example;",
      "",
      "import io.micronaut.data.annotation.Repository;",
      "import io.micronaut.data.repository.CrudRepository;",
      "",
      "@Repository",
      "public interface BookRepository extends CrudRepository<Book, Long> {",
      "    Book javaFind(String title);",
      "}",
      "// end::repository[]",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-kotlin",
      "src",
      "main",
      "kotlin",
      "example",
      "BookRepository.kt",
    ),
    [
      "// tag::repository[]",
      "package example",
      "",
      "import io.micronaut.data.annotation.Repository",
      "import io.micronaut.data.repository.CrudRepository",
      "",
      "@Repository",
      "interface BookRepository : CrudRepository<Book, Long> {",
      "    fun kotlinFind(title: String): Book",
      "}",
      "// end::repository[]",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-groovy",
      "src",
      "main",
      "groovy",
      "example",
      "BookRepository.groovy",
    ),
    [
      "// tag::repository[]",
      "package example",
      "",
      "import io.micronaut.data.annotation.Repository",
      "import io.micronaut.data.repository.CrudRepository",
      "",
      "@Repository",
      "interface BookRepository extends CrudRepository<Book, Long> {",
      "    Book groovyFind(String title)",
      "}",
      "// end::repository[]",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-kotlin-ksp",
      "src",
      "main",
      "kotlin",
      "example",
      "BookRepository.kt",
    ),
    [
      "// tag::repository[]",
      "package example",
      "",
      "interface BookRepository {",
      "    fun kspDuplicateShouldNotRender(): Book",
      "}",
      "// end::repository[]",
    ],
  );
  await writeGuide(
    docsDirectory,
    "micronaut-fixture",
    "Micronaut Data Fixture",
    [
      "At a fundamental level however what Micronaut Data does can be summed up in the following snippets. Given the following interface:",
      "",
      'snippet::example.BookRepository[project-base="doc-examples/hibernate-example", source="main", tags="repository"]',
      "",
      "The `@Repository` annotation designates `BookRepository` as a data repository.",
    ].join("\n"),
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
      "fixture",
    ],
    {
      cwd: projectDirectory,
    },
  );

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "fixture.html"),
    "utf8",
  );
  const introIndex = generatedHtml.indexOf(
    "At a fundamental level however what Micronaut Data does can be summed up in the following snippets. Given the following interface:",
  );
  assert.notEqual(introIndex, -1);
  const introHtml = generatedHtml.slice(
    introIndex,
    generatedHtml.indexOf("The `@Repository` annotation", introIndex),
  );

  assert.equal(countMatches(introHtml, /docs-code-snippet-template/g), 1);
  assert.equal(countMatches(introHtml, /role="tablist"/g), 1);
  assertSnippetLanguageIcon(introHtml, "java", "java");
  assertSnippetLanguageIcon(introHtml, "kotlin", "kotlin");
  assertSnippetLanguageIcon(introHtml, "groovy", "groovy");
  assert.match(textOnly(introHtml), /javaFind/);
  assert.match(textOnly(introHtml), /kotlinFind/);
  assert.match(textOnly(introHtml), /groovyFind/);
  assert.doesNotMatch(textOnly(introHtml), /kspDuplicateShouldNotRender/);
});

test("docs renderer deindents tagged snippets when indent is zero", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-data-indent-zero-snippets-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const submoduleDirectory = path.join(
    docsDirectory,
    "repos",
    "micronaut-fixture",
  );
  const exampleBaseDirectory = path.join(submoduleDirectory, "doc-examples");

  await writeDocsProjectManifest(docsDirectory);
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-java",
      "src",
      "main",
      "java",
      "example",
      "BookRepository.java",
    ),
    [
      "package example;",
      "",
      "interface BookRepository {",
      "    // tag::simple[]",
      "    Book findByTitle(String title);",
      "",
      "    Book getByTitle(String title);",
      "",
      "    Book retrieveByTitle(String title);",
      "    // end::simple[]",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-kotlin",
      "src",
      "main",
      "kotlin",
      "example",
      "BookRepository.kt",
    ),
    [
      "package example",
      "",
      "interface BookRepository {",
      "    // tag::simple[]",
      "    fun findByTitle(title: String): Book",
      "",
      "    fun getByTitle(title: String): Book",
      "",
      "    fun retrieveByTitle(title: String): Book",
      "    // end::simple[]",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "hibernate-example-groovy",
      "src",
      "main",
      "groovy",
      "example",
      "BookRepository.groovy",
    ),
    [
      "package example",
      "",
      "interface BookRepository {",
      "    // tag::simple[]",
      "    Book findByTitle(String title)",
      "",
      "    Book getByTitle(String title)",
      "",
      "    Book retrieveByTitle(String title)",
      "    // end::simple[]",
      "}",
    ],
  );
  await writeGuide(
    docsDirectory,
    "micronaut-fixture",
    "Micronaut Data Fixture",
    [
      "The following methods demonstrate simple queries:",
      "",
      'snippet::example.BookRepository[project-base="doc-examples/hibernate-example", source="main", tags="simple", indent="0"]',
    ].join("\n"),
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
      "fixture",
    ],
    {
      cwd: projectDirectory,
    },
  );

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "fixture.html"),
    "utf8",
  );

  assert.equal(countMatches(generatedHtml, /docs-code-snippet-template/g), 1);
  assert.equal(countMatches(generatedHtml, /role="tablist"/g), 1);
  assertSnippetLanguageIcon(generatedHtml, "java", "java");
  assertSnippetLanguageIcon(generatedHtml, "kotlin", "kotlin");
  assertSnippetLanguageIcon(generatedHtml, "groovy", "groovy");
  assert.equal(
    textOnly(highlightedLineContaining(generatedHtml, "findByTitle")),
    "Book findByTitle(String title);",
  );
  assert.equal(
    textOnly(highlightedLineContaining(generatedHtml, "getByTitle")),
    "Book getByTitle(String title);",
  );
  assert.equal(
    textOnly(highlightedLineContaining(generatedHtml, "retrieveByTitle")),
    "Book retrieveByTitle(String title);",
  );
});

test("docs renderer groups Serialization project-base model snippets as language tabs", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-serde-model-snippets-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const submoduleDirectory = path.join(
    docsDirectory,
    "repos",
    "micronaut-fixture",
  );
  const exampleBaseDirectory = path.join(submoduleDirectory, "doc-examples");

  await writeDocsProjectManifest(docsDirectory);
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "example-java",
      "src",
      "main",
      "java",
      "example",
      "Book.java",
    ),
    [
      "package example;",
      "",
      "import io.micronaut.serde.annotation.Serdeable;",
      "",
      "@Serdeable",
      "public class Book {",
      "    String javaTitle;",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "example-kotlin",
      "src",
      "main",
      "kotlin",
      "example",
      "Book.kt",
    ),
    [
      "package example",
      "",
      "import io.micronaut.serde.annotation.Serdeable",
      "",
      "@Serdeable",
      "data class Book(val kotlinTitle: String)",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "example-groovy",
      "src",
      "main",
      "groovy",
      "example",
      "Book.groovy",
    ),
    [
      "package example",
      "",
      "import io.micronaut.serde.annotation.Serdeable",
      "",
      "@Serdeable",
      "class Book {",
      "    String groovyTitle",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "example-kotlin-ksp",
      "src",
      "main",
      "kotlin",
      "example",
      "Book.kt",
    ),
    [
      "package example",
      "",
      "class Book(val kspDuplicateShouldNotRender: String)",
    ],
  );
  await writeGuide(
    docsDirectory,
    "micronaut-fixture",
    "Micronaut Serialization Fixture",
    [
      "With the correct dependencies in place you can now define an object to be serialized:",
      "",
      'snippet::example.Book[project-base="doc-examples/example", source="main"]',
      "",
      "Once you have a type that can be serialized and deserialized you can use the ObjectMapper interface to do so:",
    ].join("\n"),
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
      "fixture",
    ],
    {
      cwd: projectDirectory,
    },
  );

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "fixture.html"),
    "utf8",
  );
  const modelIndex = generatedHtml.indexOf(
    "With the correct dependencies in place you can now define an object to be serialized:",
  );
  assert.notEqual(modelIndex, -1);
  const modelHtml = generatedHtml.slice(
    modelIndex,
    generatedHtml.indexOf("Once you have a type", modelIndex),
  );

  assert.equal(countMatches(modelHtml, /docs-code-snippet-template/g), 1);
  assert.equal(countMatches(modelHtml, /role="tablist"/g), 1);
  assertSnippetLanguageIcon(modelHtml, "java", "java");
  assertSnippetLanguageIcon(modelHtml, "kotlin", "kotlin");
  assertSnippetLanguageIcon(modelHtml, "groovy", "groovy");
  assert.match(textOnly(modelHtml), /javaTitle/);
  assert.match(textOnly(modelHtml), /kotlinTitle/);
  assert.match(textOnly(modelHtml), /groovyTitle/);
  assert.doesNotMatch(textOnly(modelHtml), /kspDuplicateShouldNotRender/);
});

test("docs renderer groups Serialization project-base property filter snippets as language tabs", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-serde-filter-snippets-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const submoduleDirectory = path.join(
    docsDirectory,
    "repos",
    "micronaut-fixture",
  );
  const exampleBaseDirectory = path.join(submoduleDirectory, "doc-examples");

  await writeDocsProjectManifest(docsDirectory);
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "example-java",
      "src",
      "main",
      "java",
      "example",
      "PersonFilter.java",
    ),
    [
      "package example;",
      "",
      "import io.micronaut.serde.PropertyFilter;",
      "",
      "public class PersonFilter implements PropertyFilter {",
      "    boolean javaFilter() {",
      "        return true;",
      "    }",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "example-kotlin",
      "src",
      "main",
      "kotlin",
      "example",
      "PersonFilter.kt",
    ),
    [
      "package example",
      "",
      "import io.micronaut.serde.PropertyFilter",
      "",
      "class PersonFilter : PropertyFilter {",
      "    fun kotlinFilter(): Boolean = true",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "example-groovy",
      "src",
      "main",
      "groovy",
      "example",
      "PersonFilter.groovy",
    ),
    [
      "package example",
      "",
      "import io.micronaut.serde.PropertyFilter",
      "",
      "class PersonFilter implements PropertyFilter {",
      "    boolean groovyFilter() {",
      "        true",
      "    }",
      "}",
    ],
  );
  await writeRepositoryValidationSnippet(
    path.join(
      exampleBaseDirectory,
      "example-kotlin-ksp",
      "src",
      "main",
      "kotlin",
      "example",
      "PersonFilter.kt",
    ),
    [
      "package example",
      "",
      "class PersonFilter {",
      "    fun kspDuplicateShouldNotRender(): Boolean = true",
      "}",
    ],
  );
  await writeGuide(
    docsDirectory,
    "micronaut-fixture",
    "Micronaut Serialization Fixture",
    [
      "A custom property filter can be defined as follows:",
      "",
      'snippet::example.PersonFilter[project-base="doc-examples/example", source="main"]',
      "",
      "The filter omits the `name` field when the `preferredName` field is set:",
    ].join("\n"),
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
      "fixture",
    ],
    {
      cwd: projectDirectory,
    },
  );

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "fixture.html"),
    "utf8",
  );
  const filterIndex = generatedHtml.indexOf(
    "A custom property filter can be defined as follows:",
  );
  assert.notEqual(filterIndex, -1);
  const filterHtml = generatedHtml.slice(
    filterIndex,
    generatedHtml.indexOf("The filter omits", filterIndex),
  );

  assert.equal(countMatches(filterHtml, /docs-code-snippet-template/g), 1);
  assert.equal(countMatches(filterHtml, /role="tablist"/g), 1);
  assertSnippetLanguageIcon(filterHtml, "java", "java");
  assertSnippetLanguageIcon(filterHtml, "kotlin", "kotlin");
  assertSnippetLanguageIcon(filterHtml, "groovy", "groovy");
  assert.match(textOnly(filterHtml), /javaFilter/);
  assert.match(textOnly(filterHtml), /kotlinFilter/);
  assert.match(textOnly(filterHtml), /groovyFilter/);
  assert.doesNotMatch(textOnly(filterHtml), /kspDuplicateShouldNotRender/);
});

test("docs renderer resolves legacy Micronaut example project aliases", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-example-project-alias-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const submoduleDirectory = path.join(
    docsDirectory,
    "repos",
    "micronaut-kubernetes",
  );

  await writeDocsProjectManifest(
    docsDirectory,
    "kubernetes",
    "micronaut-kubernetes",
  );
  await writeRepositoryValidationSnippet(
    path.join(
      submoduleDirectory,
      "examples",
      "example-kubernetes-operator",
      "src",
      "main",
      "java",
      "micronaut",
      "operator",
      "CustomLockIdentityProvider.java",
    ),
    [
      "package micronaut.operator;",
      "",
      "import jakarta.inject.Singleton;",
      "",
      "// tag::lockprovider[]",
      "@Singleton",
      "final class CustomLockIdentityProvider implements LockIdentityProvider {",
      "    @Override",
      "    public String identity() {",
      '        return "custom-lock";',
      "    }",
      "}",
      "// end::lockprovider[]",
    ],
  );
  await writeGuide(
    docsDirectory,
    "micronaut-kubernetes",
    "Micronaut Kubernetes Fixture",
    'snippet::micronaut.operator.CustomLockIdentityProvider[tags="lockprovider", project="examples/micronaut-kubernetes-operator", source="main"]',
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
      "kubernetes",
    ],
    {
      cwd: projectDirectory,
    },
  );

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "kubernetes.html"),
    "utf8",
  );
  const generatedText = textOnly(generatedHtml);

  assert.match(generatedHtml, /docs-code-snippet-template/);
  assert.match(generatedText, /CustomLockIdentityProvider/);
  assert.match(generatedText, /custom-lock/);
  assert.doesNotMatch(
    generatedText,
    /Missing snippet source[\s\S]*micronaut\.operator\.CustomLockIdentityProvider/,
  );
});

test("docs renderer surfaces missing snippet sources and requested tags", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-docs-missing-tags-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const snippetSourceDirectory = path.join(
    docsDirectory,
    "repos",
    "micronaut-fixture",
    "test-suite",
    "src",
    "test",
    "java",
    "example",
  );

  await writeDocsProjectManifest(docsDirectory);
  await fs.mkdir(snippetSourceDirectory, { recursive: true });
  await fs.writeFile(
    path.join(snippetSourceDirectory, "TaggedSnippet.java"),
    [
      "package example;",
      "",
      "// tag::present[]",
      "class TaggedSnippet {",
      "}",
      "// end::present[]",
      "",
      "// tag::empty[]",
      "// end::empty[]",
    ].join("\n"),
    "utf8",
  );
  await writeGuide(
    docsDirectory,
    "micronaut-fixture",
    "Fixture Docs",
    [
      "snippet::example.TaggedSnippet[tags=present,title=Present Tag]",
      "",
      "snippet::example.TaggedSnippet[tags=missing,title=Missing Tag]",
      "",
      "snippet::example.TaggedSnippet[tags=empty,title=Empty Tag]",
      "",
      "snippet::example.MissingSnippet[tags=present,title=Missing Source]",
    ].join("\n"),
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
      "fixture",
    ],
    {
      cwd: projectDirectory,
    },
  );

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "fixture.html"),
    "utf8",
  );
  const generatedText = textOnly(generatedHtml);

  assert.match(generatedText, /class TaggedSnippet/);
  assert.match(generatedText, /Missing tag[\s\S]*missing/);
  assert.match(
    generatedText,
    /test-suite\/src\/test\/java\/example\/TaggedSnippet\.java/,
  );
  assert.match(generatedText, /Empty tag[\s\S]*empty/);
  assert.match(
    generatedText,
    /Missing snippet source[\s\S]*example\.MissingSnippet/,
  );
});

test("strict docs renderer allows known upstream source-shape warnings", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-docs-source-warnings-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");

  await writeDocsProjectManifest(docsDirectory);
  await writeGuide(
    docsDirectory,
    "micronaut-fixture",
    "Fixture Docs",
    [
      "== Parent heading",
      "",
      "==== Out-of-sequence heading",
      "",
      "This source still renders when synced upstream docs contain heading-level gaps.",
      "",
      "----",
      "unterminated listing content",
    ].join("\n"),
  );

  const { stderr } = await execFile(
    process.execPath,
    [
      "scripts/render-docs.ts",
      "--docs-dir",
      docsDirectory,
      "--output",
      outputDirectory,
      "--slugs",
      "fixture",
      "--strict",
    ],
    {
      cwd: projectDirectory,
    },
  );

  const generatedHtml = await fs.readFile(
    path.join(outputDirectory, "fixture.html"),
    "utf8",
  );
  assert.doesNotMatch(stderr, /section title out of sequence/i);
  assert.doesNotMatch(stderr, /unterminated listing block/i);
  assert.match(generatedHtml, /Out-of-sequence heading/);
});

test("docs strict diagnostic filter only fails render-stopping diagnostics", (): void => {
  const allowedWarnings = [
    "asciidoctor: WARN: <stdin>:5: no callout found for <1>",
    "asciidoctor: WARN: <stdin>:27: callout list item index: expected 2, got 1",
    "asciidoctor: WARN: <stdin>:5: list item index: expected 2, got 1",
    "asciidoctor: WARN: <stdin>:80: detected unclosed tag 'clazz' starting at line 31 of include file: ResourcesFactory.java",
    "asciidoctor: WARN: <stdin>:27: unterminated example block",
    "asciidoctor: WARN: <stdin>:11: unterminated listing block",
    "asciidoctor: WARN: <stdin>:3: section title out of sequence: expected level 1, got level 2",
  ];
  for (const warning of allowedWarnings) {
    assert.equal(isFatalDocsDiagnostic(warning), false, warning);
  }

  const fatalWarnings = [
    "asciidoctor: WARN: <stdin>:1: include file not found: missing.adoc",
    "asciidoctor: WARN: <stdin>:1: include file not readable: missing.adoc",
    "asciidoctor: WARN: <stdin>:1: include file has illegal reference to ancestor of jail",
  ];
  for (const warning of fatalWarnings) {
    assert.equal(isFatalDocsDiagnostic(warning), true, warning);
  }
});

test("strict docs renderer still fails on fatal Asciidoctor diagnostics", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-docs-fatal-diagnostics-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");

  await writeDocsProjectManifest(docsDirectory);
  await writeGuide(
    docsDirectory,
    "micronaut-fixture",
    "Fixture Docs",
    "include::missing.adoc[]",
  );

  await assert.rejects(
    execFile(
      process.execPath,
      [
        "scripts/render-docs.ts",
        "--docs-dir",
        docsDirectory,
        "--output",
        outputDirectory,
        "--slugs",
        "fixture",
        "--strict",
      ],
      {
        cwd: projectDirectory,
      },
    ),
    (error: any): any => {
      const childError = error as { stdout?: string; stderr?: string };
      const output = `${childError.stdout ?? ""}\n${childError.stderr ?? ""}`;
      assert.match(output, /Asciidoctor diagnostics/);
      assert.match(output, /include file not found|include file not readable/i);
      return true;
    },
  );
});

test("docs search index includes generated headings, properties, classes, projects, and repos", (): void => {
  const project = {
    slug: "fixture",
    displayName: "Micronaut Fixture",
    shortName: "Fixture",
    projectKey: "fixture",
    module: "io.micronaut.fixture:micronaut-fixture-bom",
    repositoryName: "micronaut-fixture",
    repositoryUrl:
      "https://github.com/micronaut-projects/micronaut-fixture.git",
    href: "/docs/fixture/",
    shortDescription: "Fixture integration",
    longDescription: "Fixture generated docs test project.",
    searchTerms: ["fixture"],
    sections: [
      {
        id: "fixture-overview",
        number: "1",
        title: "Overview",
        summary: "Fixture overview fallback.",
      },
    ],
  };
  const html = [
    '<div class="guide-section-heading">',
    '  <h1 id="fixture-introduction"><a class="anchor" href="#fixture-introduction"></a>1 Introduction</h1>',
    "</div>",
    '<div class="guide-section-heading">',
    '  <h2 id="fixture-client"><a class="anchor" href="#fixture-client"></a>1.1 HTTP Client</h2>',
    "</div>",
    '<div class="docs-properties-template">',
    "  <table>",
    "    <tbody>",
    "      <tr><td><p><code>micronaut.fixture.enabled</code></p></td><td><p>Boolean</p></td><td><p>Enables the fixture.</p></td></tr>",
    "    </tbody>",
    "  </table>",
    "</div>",
    '<p>Use <a href="../assets/fixture/docs/api/io/micronaut/fixture/FixtureClient.html">FixtureClient</a>.</p>',
  ].join("\n");

  const generatedItems = extractGeneratedDocSearchItems(project, html);
  assert.ok(
    generatedItems.some(
      (item: any): any =>
        item.scope === "Docs" && item.title.includes("HTTP Client"),
    ),
  );
  assert.ok(
    generatedItems.some(
      (item: any): any =>
        item.scope === "Properties" &&
        item.title === "micronaut.fixture.enabled",
    ),
  );
  assert.ok(
    generatedItems.some(
      (item: any): any =>
        item.scope === "Classes" && item.title === "FixtureClient",
    ),
  );

  const index = buildDocsSearchIndex([project], { fixture: html });
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Projects" && item.href === "/docs/fixture/",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Repos" && item.href === project.repositoryUrl,
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Docs" &&
        item.href === "/docs/fixture/#fixture-overview",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Classes" &&
        item.href ===
          "/docs/assets/fixture/docs/api/io/micronaut/fixture/FixtureClient.html",
    ),
  );
});

test("docs search index covers several generated docs fragments", (): void => {
  const projects = [
    searchProject("core", "Micronaut Core", "Core Framework"),
    searchProject("data", "Micronaut Data", "Data Access"),
    searchProject("serde", "Micronaut Serialization", "Serialization"),
  ];
  const htmlBySlug = {
    core: [
      '<div class="guide-section-heading">',
      '  <h1 id="core-introduction"><a class="anchor" href="#core-introduction"></a>1 Introduction</h1>',
      "</div>",
      '<p>Use <a href="../assets/core/docs/api/io/micronaut/context/BeanContext.html">BeanContext</a>.</p>',
    ].join("\n"),
    data: [
      '<div class="guide-section-heading">',
      '  <h2 id="data-repositories"><a class="anchor" href="#data-repositories"></a>1.1 Repositories</h2>',
      "</div>",
      '<div class="docs-properties-template">',
      "  <table><tbody>",
      "    <tr><td><p><code>micronaut.data.default-schema</code></p></td><td><p>String</p></td><td><p>Default schema.</p></td></tr>",
      "  </tbody></table>",
      "</div>",
    ].join("\n"),
    serde: [
      '<div class="guide-section-heading">',
      '  <h2 id="serde-jackson"><a class="anchor" href="#serde-jackson"></a>1.2 Jackson Interop</h2>',
      "</div>",
      '<p>Use <a href="../assets/serde/docs/api/io/micronaut/serde/ObjectMapper.html">ObjectMapper</a>.</p>',
    ].join("\n"),
  };

  const index = buildDocsSearchIndex(projects, htmlBySlug);

  for (const project of projects) {
    assert.ok(
      index.some(
        (item: any): any =>
          item.scope === "Projects" && item.href === project.href,
      ),
      `${project.slug} project should be indexed`,
    );
  }
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Docs" &&
        item.title.includes("Repositories") &&
        item.href === "/docs/data/#data-repositories",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Properties" &&
        item.title === "micronaut.data.default-schema",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Classes" &&
        item.title === "BeanContext" &&
        item.href ===
          "/docs/assets/core/docs/api/io/micronaut/context/BeanContext.html",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Classes" &&
        item.title === "ObjectMapper" &&
        item.href ===
          "/docs/assets/serde/docs/api/io/micronaut/serde/ObjectMapper.html",
    ),
  );
});

test("docs renderer can render every project in a manifest", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-generated-docs-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");

  await writeDocsProjectCatalog(docsDirectory, [
    {
      slug: "alpha",
      displayName: "Micronaut Alpha",
      repositoryName: "micronaut-alpha",
    },
    {
      slug: "beta",
      displayName: "Micronaut Beta",
      repositoryName: "micronaut-beta",
    },
  ]);
  await writeGuide(
    docsDirectory,
    "micronaut-alpha",
    "Alpha Docs",
    "Alpha introduction.",
  );
  await writeGuide(
    docsDirectory,
    "micronaut-beta",
    "Beta Docs",
    "Beta introduction.",
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
    },
  );

  assert.deepEqual(
    (await fs.readdir(outputDirectory))
      .filter((file: any): any => file.endsWith(".html"))
      .sort(),
    ["alpha.html", "beta.html"],
  );
});

test("docs renderer writes several generated project fragments and catalog entries", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-generated-docs-projects-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const docsDirectory = path.join(temporaryDirectory, "docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const projects = [
    {
      body: [
        "Core generated docs body.",
        "",
        "[source,java]",
        "----",
        "class CoreExample {}",
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
        "class SerdeExample {}",
        "----",
      ].join("\n"),
      displayName: "Micronaut Serialization",
      repositoryName: "micronaut-serde",
      slug: "serde",
      version: "2.15.0",
    },
  ];

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
      (project): Promise<any> =>
        writeGuide(
          docsDirectory,
          project.repositoryName,
          project.displayName,
          project.body,
        ),
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
    },
  );

  assert.deepEqual(
    (await fs.readdir(outputDirectory))
      .filter((file: any): any => file.endsWith(".html"))
      .sort(),
    ["core.html", "data.html", "serde.html"],
  );

  const catalog = JSON.parse(
    await fs.readFile(
      path.join(outputDirectory, "project-catalog.json"),
      "utf8",
    ),
  );
  const catalogProjectsBySlug = new Map<string, any>(
    catalog.projects.map((project: any): any => [project.slug, project]),
  );
  assert.equal(catalog.projectCount, 3);

  for (const project of projects) {
    const generatedHtml = await fs.readFile(
      path.join(outputDirectory, `${project.slug}.html`),
      "utf8",
    );
    assert.match(generatedHtml, new RegExp(`id="${project.slug}-docs"`));
    assert.match(
      generatedHtml,
      new RegExp(`${project.displayName.replace("Micronaut ", "")}`),
    );
    assert.match(generatedHtml, /docs-code-snippet-template/);
    assert.doesNotMatch(generatedHtml, /<style\b[^>]*data-docs-shiki/i);
    assert.match(generatedHtml, new RegExp(`${project.slug}-introduction`));
    assert.equal(
      catalogProjectsBySlug.get(project.slug)?.version,
      project.version,
    );
    assert.equal(
      catalogProjectsBySlug.get(project.slug)?.repositoryName,
      project.repositoryName,
    );
  }
});

test("docs project manifest can be derived from Micronaut Platform libraries", async (t: any): Promise<any> => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-platform-catalog-"),
  );
  t.after((): any =>
    fs.rm(temporaryDirectory, { force: true, recursive: true }),
  );
  const catalogFile = path.join(temporaryDirectory, "libs.versions.toml");
  await fs.writeFile(
    catalogFile,
    [
      "[versions]",
      'managed-micronaut-core = "5.0.0-RC2"',
      'managed-micronaut-data = "4.10.22"',
      'managed-micronaut-guides = "0.3.0"',
      "",
      "[libraries]",
      'boms-micronaut-core = { module = "io.micronaut:micronaut-core-bom", version.ref = "managed-micronaut-core" }',
      'boms-micronaut-data = { module = "io.micronaut.data:micronaut-data-bom", version.ref = "managed-micronaut-data" }',
      'boms-micronaut-guides = { module = "io.micronaut.guides:micronaut-guides-bom", version.ref = "managed-micronaut-guides" }',
    ].join("\n"),
    "utf8",
  );

  const projects = await readPlatformCatalogProjects(catalogFile, {
    "project.count": "1",
    "project.0.slug": "data",
    "project.0.displayName": "Micronaut Data",
    "project.0.projectKey": "data",
    "project.0.module": "io.micronaut.data:micronaut-data-bom",
    "project.0.repositoryName": "micronaut-data",
    "project.0.publishedGuideUrl":
      "https://micronaut-projects.github.io/micronaut-data/latest/guide/",
    "project.0.repositoryUrl":
      "https://github.com/micronaut-projects/micronaut-data.git",
    "project.0.branch": "5.0.x",
    "project.0.submodulePath": "repos/micronaut-data",
    "project.0.platformVersionKey": "managed-micronaut-data",
  });

  assert.deepEqual(
    projects.map((project: any): any => project.slug),
    ["core", "data"],
  );
  assert.deepEqual(projects[0], {
    slug: "core",
    displayName: "Micronaut Core",
    projectKey: "core",
    module: "io.micronaut:micronaut-core-bom",
    repositoryName: "micronaut-core",
    publishedGuideUrl: "https://docs.micronaut.io/latest/guide/",
    repositoryUrl: "https://github.com/micronaut-projects/micronaut-core.git",
    branch: "5.0.x",
    submodulePath: "repos/micronaut-core",
    platformVersionKey: "managed-micronaut-core",
  });
  assert.equal(projects[1].branch, "4.10.x");
});

test("docs commandline source blocks use shell highlighting", (): void => {
  assert.equal(shikiLanguage("commandline"), "shellscript");
  assert.equal(shikiLanguage("graphqls"), "graphql");
  assert.equal(shikiLanguage("mysql"), "sql");
});

test("properties listings format empty dotted assignments like indexed and placeholder assignments", async (): Promise<void> => {
  const azureCredentialProperty =
    "azure.credential.storage-shared-key.account-key";
  const azureCredentialValue =
    "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
  const azureConnectionStringProperty =
    "azure.credential.storage-shared-key.connection-string";
  const azureConnectionStringValue =
    "DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=https://127.0.0.1:10000/devstoreaccount1;";
  const html = await highlightListingBlocks(
    [
      '<div class="listingblock">',
      '<div class="content">',
      '<pre><code class="language-properties">foo.bar.property=',
      "foo.bar[0]=",
      "foo.bar&lt;prop&gt;=",
      "kubernetes.client.config-maps.includes[0]=",
      "kubernetes.client.config-maps.excludes&#91;0&#93;=",
      `${azureCredentialProperty}=${azureCredentialValue}`,
      `${azureConnectionStringProperty}=${azureConnectionStringValue}</code></pre>`,
      "</div>",
      "</div>",
    ].join("\n"),
  );

  const dottedLine = highlightedLineContaining(html, "foo.bar.property=");
  const indexedLine = highlightedLineContaining(html, "foo.bar[0]=");
  const placeholderLine = highlightedLineContaining(
    html,
    "foo.bar&lt;prop&gt;=",
  );
  const kubernetesIndexedLine = highlightedLineContaining(
    html,
    "kubernetes.client.config-maps.includes[0]=",
  );
  const encodedIndexedLine = highlightedLineContaining(
    html,
    "kubernetes.client.config-maps.excludes[0]=",
  );
  const azureCredentialLine = highlightedLineContaining(
    html,
    azureCredentialProperty,
  );
  const azureConnectionStringLine = highlightedLineContaining(
    html,
    azureConnectionStringProperty,
  );
  const dottedStyle = highlightedLineTextStyle(dottedLine);

  assert.notEqual(dottedLine, "");
  assert.equal(dottedStyle, highlightedLineTextStyle(indexedLine));
  assert.equal(dottedStyle, highlightedLineTextStyle(placeholderLine));
  assert.equal(dottedStyle, highlightedLineTextStyle(kubernetesIndexedLine));
  assert.equal(dottedStyle, highlightedLineTextStyle(encodedIndexedLine));
  assert.doesNotMatch(dottedLine, /#CF222E|#FF7B72/);
  assertOnlyPropertyKeyHighlighted(
    azureCredentialLine,
    azureCredentialProperty,
    azureCredentialValue,
  );
  assertOnlyPropertyKeyHighlighted(
    azureConnectionStringLine,
    azureConnectionStringProperty,
    azureConnectionStringValue,
  );
});

test("properties listings attach standalone callout markers to the next property line", async (): Promise<void> => {
  const html = await highlightListingBlocks(
    [
      '<div class="listingblock">',
      '<div class="content">',
      '<pre><code class="language-properties">micronaut.mcp.server.info.name=Weather',
      "&lt;1&gt;",
      "micronaut.mcp.server.transport=HTTP</code></pre>",
      "</div>",
      "</div>",
    ].join("\n"),
  );

  const transportLine =
    /<span class="line">[^\n]*micronaut\.mcp\.server\.transport[^\n]*<\/span>/.exec(
      html,
    )?.[0] || "";
  assert.match(transportLine, /<i class="conum" data-value="1"><\/i>/);
  assert.doesNotMatch(
    html,
    /<span class="line"><span[^>]*><i class="conum" data-value="1"><\/i><\/span><\/span>\s*<span class="line">[^\n]*micronaut\.mcp\.server\.transport/,
  );
});

test("properties listings attach comment-only callout markers to the next property line", async (): Promise<void> => {
  const html = await highlightListingBlocks(
    [
      '<div class="listingblock">',
      '<div class="content">',
      '<pre><code class="language-properties">micronaut.mcp.server.info.name=Weather',
      "micronaut.mcp.server.info.version=0.0.1",
      "# &lt;1&gt;",
      "micronaut.mcp.server.transport=HTTP</code></pre>",
      "</div>",
      "</div>",
    ].join("\n"),
  );

  const transportLine =
    /<span class="line">[^\n]*micronaut\.mcp\.server\.transport[^\n]*<\/span>/.exec(
      html,
    )?.[0] || "";
  assert.match(transportLine, /HTTP <i class="conum" data-value="1"><\/i>/);
  assert.doesNotMatch(html, />#[^<]*<i class="conum" data-value="1"><\/i>/);
});

test("docs routes render generated fragments and serve generated assets", async (): Promise<void> => {
  const docsPageSource = await fs.readFile(
    path.join(projectDirectory, "src", "pages", "docs", "[slug].astro"),
    "utf8",
  );
  const generatedDocsHashAlignerSource = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "scripts",
      "generated-docs-hash-aligner.ts",
    ),
    "utf8",
  );
  const assetsRouteSource = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "pages",
      "docs",
      "assets",
      "[...path].ts",
    ),
    "utf8",
  );
  const searchIndexRouteSource = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "pages",
      "docs",
      "[searchIndex].json.ts",
    ),
    "utf8",
  );
  const docsIndexSource = await fs.readFile(
    path.join(projectDirectory, "src", "pages", "docs", "index.astro"),
    "utf8",
  );
  const generatedDocsStaticEnhancerSource = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "components",
      "web",
      "generated-docs-static-enhancer.astro",
    ),
    "utf8",
  );
  const docsShellSource = await fs.readFile(
    path.join(projectDirectory, "src", "components", "web", "docs-shell.astro"),
    "utf8",
  );
  const docsSidebarContentSource = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "components",
      "web",
      "docs-sidebar-content.astro",
    ),
    "utf8",
  );
  const docsVersionSelectorSource = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "components",
      "web",
      "docs-version-selector.astro",
    ),
    "utf8",
  );
  const docsScrollSpyComponentSource = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "components",
      "web",
      "docs-scroll-spy.astro",
    ),
    "utf8",
  );
  const docsScrollSpySource = await fs.readFile(
    path.join(projectDirectory, "src", "scripts", "docs-scroll-spy.ts"),
    "utf8",
  );
  const sectionPageIndexSource = await fs.readFile(
    path.join(projectDirectory, "src", "scripts", "section-page-index.ts"),
    "utf8",
  );

  assert.match(
    docsPageSource,
    /readFile\(join\(process\.cwd\(\),[\s\S]*"generated-docs"[\s\S]*`\$\{project\.slug\}\.html`/,
  );
  assert.match(docsPageSource, /data-generated-docs/);
  assert.match(docsPageSource, /set:html=\{generatedDocHtml\}/);
  assert.match(docsPageSource, /@\/scripts\/generated-docs-hash-aligner/);
  assert.doesNotMatch(docsPageSource, /generatedDocsHashAlignerUrl|\?url/);
  assert.doesNotMatch(docsPageSource, /<script is:inline>/);
  assert.doesNotMatch(docsPageSource, /alignHash|window\.scrollTo/);
  assertNoRuntimeGeneratedRendering("docs route", docsPageSource);
  assert.match(generatedDocsHashAlignerSource, /alignGeneratedDocsHash/);
  assert.match(
    generatedDocsHashAlignerSource,
    /scheduleGeneratedDocsHashAlignment/,
  );
  assert.match(generatedDocsHashAlignerSource, /window\.scrollTo/);
  assert.match(generatedDocsHashAlignerSource, /data-generated-docs/);
  assert.match(generatedDocsHashAlignerSource, /astro:hydrate/);
  assert.match(
    docsPageSource,
    /canonicalSurfaceUrl\("docs", `\/docs\/\$\{project\.slug\}\/`\)/,
  );
  assert.match(docsPageSource, /canonicalUrl=\{canonicalUrl\}/);
  assert.match(docsPageSource, /GeneratedDocsStaticEnhancer/);
  assert.doesNotMatch(
    docsPageSource,
    /from "@\/components\/web\/generated-docs-enhancer\.astro"/,
  );
  assert.doesNotMatch(docsPageSource, /GeneratedDocsPropertiesFallback/);
  assertNoRuntimeGeneratedRendering(
    "docs static enhancer",
    generatedDocsStaticEnhancerSource,
  );
  assert.doesNotMatch(generatedDocsStaticEnhancerSource, /define:vars/);
  assert.match(
    generatedDocsStaticEnhancerSource,
    /@\/scripts\/generated-docs-static-enhancer/,
  );
  assert.match(
    assetsRouteSource,
    /"src", "content", "generated-docs", "assets"/,
  );
  assert.match(
    assetsRouteSource,
    /fs\.readFile\(path\.join\(generatedAssetsDirectory/,
  );
  assert.match(searchIndexRouteSource, /buildDocsSearchIndex/);
  assert.match(searchIndexRouteSource, /"generated-docs"/);
  assert.match(docsIndexSource, /loadDocsProjectCatalog/);
  assert.match(docsPageSource, /loadDocsProjectCatalog/);
  assert.match(searchIndexRouteSource, /loadDocsProjectCatalog/);
  assert.match(
    docsSidebarContentSource,
    /versionManifestHref="\/versions\.json"/,
  );
  assert.match(
    docsSidebarContentSource,
    /isActiveProject[\s\S]*\? `#\$\{project\.slug\}-docs`[\s\S]*: withBasePath\(project\.href\)/,
  );
  assert.match(docsSidebarContentSource, /DocsVersionSelector/);
  assert.doesNotMatch(docsSidebarContentSource, /DocsVersionSwitcher/);
  assert.doesNotMatch(docsSidebarContentSource, /client:idle/);
  assert.match(docsShellSource, /docs-scroll-spy\.astro/);
  assert.match(docsShellSource, /<DocsScrollSpy \/>/);
  assert.match(docsShellSource, /instanceId="desktop"/);
  assert.match(docsShellSource, /instanceId="mobile"/);
  assert.doesNotMatch(docsShellSource, /DocsScrollSpy client:idle/);
  assert.doesNotMatch(docsScrollSpySource, /"use client"/);
  assert.match(docsSidebarContentSource, /data-docs-scroll-container/);
  assert.match(docsSidebarContentSource, /data-docs-project-section-toggle/);
  assert.match(docsSidebarContentSource, /data-docs-project-sections/);
  assert.match(
    docsSidebarContentSource,
    /aria-expanded=\{hasActiveSections \? "true" : undefined\}/,
  );
  assert.match(
    docsSidebarContentSource,
    /aria-controls=\{hasActiveSections \? projectSectionsId : undefined\}/,
  );
  assert.doesNotMatch(
    docsSidebarContentSource,
    /data-\[active=true\]:before:bg-brand/,
  );
  assert.match(docsPageSource, /id=\{`\$\{project\.slug\}-docs`\}/);
  assert.match(docsPageSource, /data-docs-scroll-container/);
  assert.doesNotMatch(docsPageSource, /data-\[active=true\]:before:bg-brand/);
  assert.match(docsPageSource, /\{currentSectionLinks\.length > 0 && \(/);
  assert.match(docsPageSource, /\{currentSectionLinks\.map\(\(section\) => \(/);
  assert.match(docsPageSource, /data-docs-current-section-index/);
  assert.match(docsPageSource, /data-docs-current-section-link/);
  assert.match(
    docsPageSource,
    /data-docs-section-root-id=\{section\.parentId\}/,
  );
  assert.match(
    docsPageSource,
    /currentSectionLinks = contentSections\.filter\(\(section\) => section\.depth > 1 && section\.parentId\)/,
  );
  assert.match(docsSidebarContentSource, /data-docs-project-section-link/);
  assert.doesNotMatch(
    docsPageSource,
    /contentSections\.map\(\(section\) => \([\s\S]*?data-docs-scroll-link/,
  );
  assert.doesNotMatch(docsPageSource, /data-docs-section-depth/);
  assert.match(docsVersionSelectorSource, /data-docs-version-selector/);
  assert.match(docsVersionSelectorSource, /withBasePathForBase/);
  assert.match(docsVersionSelectorSource, /withSurfacePath\("docs"/);
  assert.match(
    docsVersionSelectorSource,
    /document\.addEventListener\("change"/,
  );
  assert.match(docsVersionSelectorSource, /MutationObserver/);
  assert.match(
    docsVersionSelectorSource,
    /mutations\.some\(mutationAddsVersionSelector\)/,
  );
  assert.doesNotMatch(
    docsVersionSelectorSource,
    /new MutationObserver\(\(\) => updateAllSelects\(\)\)/,
  );
  assert.match(docsVersionSelectorSource, /astro:hydrate/);
  assert.doesNotMatch(docsVersionSelectorSource, /astro-island/);
  assert.match(
    docsScrollSpyComponentSource,
    /<script src="\.\.\/\.\.\/scripts\/docs-scroll-spy\.ts"><\/script>/,
  );
  assert.doesNotMatch(docsScrollSpyComponentSource, /\?url|type="module"/);
  assert.match(docsScrollSpySource, /enhanceSectionPageIndex/);
  assert.match(docsScrollSpySource, /data-docs-current-section-link/);
  assert.match(docsScrollSpySource, /data-docs-project-section-link/);
  assert.match(docsScrollSpySource, /docsSectionRootId/);
  assert.match(sectionPageIndexSource, /scrollOffset/);
  assert.match(sectionPageIndexSource, /setActiveIdFromHash/);
  assert.match(sectionPageIndexSource, /scrollActiveLinkIntoView/);
  assert.match(
    sectionPageIndexSource,
    /window\.addEventListener\("scroll", scheduleUpdate/,
  );
  assert.match(
    sectionPageIndexSource,
    /window\.addEventListener\("hashchange", scheduleHashUpdate\)/,
  );
  assert.match(
    sectionPageIndexSource,
    /document\.addEventListener\("astro:hydrate"/,
  );
  assert.match(docsScrollSpySource, /onProjectSectionToggleClick/);
  assert.match(docsScrollSpySource, /event\.preventDefault\(\)/);
  assert.match(docsScrollSpySource, /setProjectSectionsExpanded/);
  assert.match(
    docsScrollSpySource,
    /document\.addEventListener\("click", onProjectSectionToggleClick\)/,
  );
  assert.match(sectionPageIndexSource, /MutationObserver/);
});

function assertNoRuntimeGeneratedRendering(label: string, source: string) {
  assert.doesNotMatch(
    source,
    /renderSharedSnippetCard|renderSharedPropertiesCard|enhanceCodeSnippets|enhanceStandaloneCodeBlocks|docsSnippetTemplates|renderDocsSnippetTemplates/,
    `${label} must not render generated snippet or properties cards at runtime`,
  );
  assert.doesNotMatch(
    source,
    /codeToHtml|createHighlighter|getHighlighter|codeToTokens|from ["'](?:shiki|@shikijs\/[^"']+)["']|import\(["'](?:shiki|@shikijs\/[^"']+)["']\)/,
    `${label} must not highlight generated code at runtime`,
  );
}

function assertScriptOrder(script: any, producer: any, consumer: any): any {
  assert.equal(typeof script, "string");
  const producerIndex = script.indexOf(producer);
  const consumerIndex = script.indexOf(consumer);
  assert.notEqual(producerIndex, -1, `${script} should include '${producer}'`);
  assert.notEqual(consumerIndex, -1, `${script} should include '${consumer}'`);
  assert.ok(
    producerIndex < consumerIndex,
    `${script} should run '${producer}' before '${consumer}'`,
  );
}

function nonStrictEnv(): any {
  return {
    ...process.env,
    CI: "false",
    DOCS_PROJECT_SLUGS: "",
    DOCS_RENDER_ALL: "false",
    DOCS_RENDER_STRICT: "false",
    DOCS_SYNC_SOURCES: "false",
  };
}

async function writeDocsProjectManifest(
  docsDirectory: any,
  slug = "fixture",
  repositoryName = "micronaut-fixture",
): Promise<any> {
  await writeDocsProjectCatalog(docsDirectory, [
    {
      slug,
      displayName: "Micronaut Fixture",
      repositoryName,
    },
  ]);
}

async function writeDocsProjectCatalog(
  docsDirectory: any,
  projects: Array<{
    slug: string;
    displayName: string;
    repositoryName: string;
  }>,
): Promise<any> {
  await fs.mkdir(docsDirectory, { recursive: true });
  await fs.writeFile(
    path.join(docsDirectory, "docs-projects.fixture.json"),
    JSON.stringify(
      {
        source: "test fixture",
        publishedSource: "",
        projectCount: projects.length,
        categories: [],
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
          platformVersionKey: "micronaut",
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

async function writeGuide(
  docsDirectory: any,
  repositoryName: any,
  title: any,
  body: any,
): Promise<any> {
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
    `title: ${title}\nintroduction: Introduction\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(guideDirectory, "introduction.adoc"),
    body,
    "utf8",
  );
}

async function writeRepositoryValidationSnippet(
  file: string,
  lines: string[],
): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, lines.join("\n"), "utf8");
}

function searchProject(
  slug: string,
  displayName: string,
  sectionTitle: string,
) {
  return {
    slug,
    displayName,
    shortName: displayName.replace(/^Micronaut\s+/i, ""),
    projectKey: slug,
    module: `io.micronaut.${slug}:micronaut-${slug}-bom`,
    repositoryName: `micronaut-${slug}`,
    repositoryUrl: `https://github.com/micronaut-projects/micronaut-${slug}.git`,
    href: `/docs/${slug}/`,
    shortDescription: sectionTitle,
    longDescription: `${displayName} generated docs test project.`,
    searchTerms: [slug],
    sections: [
      {
        id: `${slug}-overview`,
        number: "1",
        title: sectionTitle,
        summary: `${sectionTitle} fallback.`,
      },
    ],
  };
}

function lines(value: any): any {
  return value.split(/\r?\n/).filter(Boolean);
}

function canonicalCatalogIcon(icon: string): string {
  return icon.startsWith("lucide:") ? icon.slice("lucide:".length) : icon;
}

async function catalogLucideIconComponents(): Promise<Map<string, string>> {
  const iconGlyphSource = await fs.readFile(
    path.join(projectDirectory, "src", "components", "web", "icon-glyph.tsx"),
    "utf8",
  );
  const iconMapSource =
    iconGlyphSource.match(
      /const icons: Record<string, LucideIcon> = \{([\s\S]*?)\n\};/,
    )?.[1] || "";
  return new Map(
    [
      ...iconMapSource.matchAll(
        /^\s*(?:"([^"]+)"|([a-z][\w-]*)):\s*([A-Z]\w*)/gm,
      ),
    ]
      .map((match): [string, string] => [match[1] || match[2], match[3]])
      .filter(([icon, component]): boolean => Boolean(icon && component)),
  );
}

async function resolvedCatalogIconIdentity(
  icon: string,
  lucideIcons: Map<string, string>,
): Promise<string | undefined> {
  const assetPath = catalogIconAssetPath(icon);
  if (assetPath) {
    try {
      const asset = await fs.readFile(assetPath);
      return `asset:${createHash("sha256").update(asset).digest("hex")}`;
    } catch {
      return undefined;
    }
  }
  const component = lucideIcons.get(canonicalCatalogIcon(icon));
  return component ? `lucide:${component}` : undefined;
}

function catalogIconAssetPath(icon: string): string | undefined {
  if (icon.startsWith("brand:")) {
    return path.join(
      projectDirectory,
      "public",
      "micronaut-assets",
      "icons",
      "brands",
      `${icon.slice("brand:".length)}.svg`,
    );
  }
  if (icon.startsWith("feature:")) {
    return path.join(
      projectDirectory,
      "public",
      "micronaut-assets",
      "icons",
      "features",
      `${icon.slice("feature:".length)}.svg`,
    );
  }
  if (icon.startsWith("image:")) {
    return path.join(
      projectDirectory,
      "public",
      "micronaut-assets",
      "icons",
      icon.slice("image:".length),
    );
  }
  return undefined;
}

function escapeRegExp(value: any): any {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function textOnly(value: any): any {
  return value.replace(/<[^>]*>/g, "");
}

function countMatches(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length || 0;
}

function highlightedLineContaining(source: string, text: string): string {
  return (
    Array.from(
      source.matchAll(
        /<span class="line">[\s\S]*?<\/span>(?=\n<span class="line">|\n?<\/code>|$)/g,
      ),
    )
      .map((match): string => match[0])
      .find((line): boolean => line.includes(text)) || ""
  );
}

function highlightedLineTextStyle(line: string): string {
  return /<span class="line"><span style="([^"]+)">/.exec(line)?.[1] || "";
}

function assertOnlyPropertyKeyHighlighted(
  line: string,
  property: string,
  value: string,
): void {
  assert.notEqual(line, "");
  const valueStart = line.indexOf(`=${value}`);
  assert.notEqual(valueStart, -1);

  const keyHtml = line.slice(0, valueStart);
  assert.ok(keyHtml.includes(property));
  assert.match(keyHtml, /#CF222E|#FF7B72/);
  assert.doesNotMatch(line.slice(valueStart), /#CF222E|#FF7B72/);
}

async function fileExists(file: string): Promise<boolean> {
  try {
    const stats = await fs.stat(file);
    return stats.isFile();
  } catch {
    return false;
  }
}

function assertSnippetLanguageIcon(
  source: string,
  language: string,
  icon: string,
): void {
  assert.match(
    buttonHtmlForLanguage(source, language),
    new RegExp(`docs-code-language-icon-${escapeRegExp(icon)}`),
    `${language} snippets should use the ${icon} icon`,
  );
}

function buttonHtmlForLanguage(source: string, language: string): string {
  const dataLangIndex = source.indexOf(`data-lang="${language}"`);
  if (dataLangIndex < 0) {
    return "";
  }
  const buttonStart = source.lastIndexOf("<button", dataLangIndex);
  const buttonEnd = source.indexOf("</button>", dataLangIndex);
  if (buttonStart < 0 || buttonEnd < 0) {
    return "";
  }
  return source.slice(buttonStart, buttonEnd + "</button>".length);
}
