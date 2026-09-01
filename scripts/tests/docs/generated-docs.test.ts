import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

import { readPlatformCatalogProjects } from "../../docs/project-manifest.ts";
import { snippetCards, textOnly } from "../support/html.ts";
import {
  fixtureDocsProject,
  runRenderDocs,
  temporaryDirectory,
  writeDocsGuide,
  writeDocsProjectCatalog,
  writePlatformVersionCatalog,
  writeTextFile,
} from "../support/temp-project.ts";

// End-to-end runs of scripts/render-docs.ts. Rendering itself is covered
// in-process by docs-rendering.test.ts; these tests cover what only the CLI
// does: project selection, the catalog, asset copying and strict mode.

async function docsDirectories(
  t: Parameters<typeof temporaryDirectory>[0],
  prefix: string,
): Promise<{ docsDirectory: string; outputDirectory: string }> {
  const root = await temporaryDirectory(t, prefix);
  return {
    docsDirectory: path.join(root, "docs"),
    outputDirectory: path.join(root, "generated-docs"),
  };
}

describe("render-docs", () => {
  test("renders nothing when the selected project has no sources", async (t) => {
    const { docsDirectory, outputDirectory } = await docsDirectories(
      t,
      "micronaut-web-docs-missing-",
    );
    await fs.mkdir(docsDirectory, { recursive: true });

    await runRenderDocs(docsDirectory, outputDirectory, ["--slugs", "core"]);

    assert.deepEqual(await fs.readdir(outputDirectory), []);
  });

  test("defaults to the small project subset and reports what it skips", async (t) => {
    const { docsDirectory, outputDirectory } = await docsDirectories(
      t,
      "micronaut-web-docs-default-",
    );
    await fs.mkdir(docsDirectory, { recursive: true });

    const { stderr } = await runRenderDocs(docsDirectory, outputDirectory);

    assert.deepEqual(
      stderr
        .split(/\r?\n/)
        .filter((line) => line.startsWith("Skipping "))
        .map((line) => line.replace(/^Skipping ([^:]+):.*$/, "$1")),
      ["core", "data", "serde"],
    );
    assert.deepEqual(await fs.readdir(outputDirectory), []);
  });

  test("writes the project catalog from the platform version catalog", async (t) => {
    const { docsDirectory, outputDirectory } = await docsDirectories(
      t,
      "micronaut-web-docs-catalog-",
    );
    await writePlatformVersionCatalog(docsDirectory, {
      core: "4.10.22",
      data: "4.14.3",
    });

    await runRenderDocs(docsDirectory, outputDirectory, ["--slugs", "core"]);

    const catalog = JSON.parse(
      await fs.readFile(
        path.join(outputDirectory, "project-catalog.json"),
        "utf8",
      ),
    );
    const versions = new Map<string, string>(
      catalog.projects.map((project: { slug: string; version: string }) => [
        project.slug,
        project.version,
      ]),
    );
    assert.equal(versions.get("core"), "4.10.22");
    assert.equal(versions.get("data"), "4.14.3");
  });

  test("snapshot sources report the version their branch builds", async (t) => {
    const { docsDirectory, outputDirectory } = await docsDirectories(
      t,
      "micronaut-web-docs-snapshot-",
    );
    await writePlatformVersionCatalog(docsDirectory, { core: "4.10.22" });
    await writeDocsGuide(
      docsDirectory,
      "micronaut-core",
      "Core Docs",
      "Documents Micronaut {version}.",
    );
    await writeTextFile(
      path.join(docsDirectory, "repos", "micronaut-core", "gradle.properties"),
      "projectVersion=4.11.0-SNAPSHOT\n",
    );

    await runRenderDocs(docsDirectory, outputDirectory, [
      "--slugs",
      "core",
      "--snapshot-sources",
    ]);

    const catalog = JSON.parse(
      await fs.readFile(
        path.join(outputDirectory, "project-catalog.json"),
        "utf8",
      ),
    );
    assert.equal(
      catalog.projects.find(
        (project: { slug: string }) => project.slug === "core",
      ).version,
      "4.11.0-SNAPSHOT",
    );
    assert.match(
      await fs.readFile(path.join(outputDirectory, "core.html"), "utf8"),
      /Documents Micronaut 4\.11\.0-SNAPSHOT\./,
    );
  });

  test("writes the generated fragment and copies the assets it references", async (t) => {
    const { docsDirectory, outputDirectory } = await docsDirectories(
      t,
      "micronaut-web-docs-assets-",
    );
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>';
    await writeDocsProjectCatalog(docsDirectory, [fixtureDocsProject]);
    await writeDocsGuide(
      docsDirectory,
      fixtureDocsProject.repositoryName,
      "Fixture Docs",
      [
        "Fixture body.",
        "",
        "snippet::example.FixtureSnippet[title=Fixture Snippet]",
        "",
        "image::diagram.svg[Fixture diagram]",
      ].join("\n"),
    );
    await writeTextFile(
      path.join(
        docsDirectory,
        "repos",
        fixtureDocsProject.repositoryName,
        "src/main/docs/resources/img/diagram.svg",
      ),
      svg,
    );
    await writeTextFile(
      path.join(
        docsDirectory,
        "repos",
        fixtureDocsProject.repositoryName,
        "test-suite/src/test/java/example/FixtureSnippet.java",
      ),
      ["class FixtureSnippet {}"],
    );

    const { stderr } = await runRenderDocs(
      docsDirectory,
      outputDirectory,
      ["--slugs", "fixture"],
      { strict: true },
    );

    assert.equal(stderr.trim(), "");
    const html = await fs.readFile(
      path.join(outputDirectory, "fixture.html"),
      "utf8",
    );
    assert.match(textOnly(html), /Fixture body\./);
    assert.equal(snippetCards(html)[0].activeCode, "class FixtureSnippet {}");
    assert.match(html, /src="\.\.\/assets\/fixture\/docs\/img\/diagram\.svg"/);
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
      svg,
    );
  });

  test("renders every project in the manifest with --all and writes catalog entries", async (t) => {
    const { docsDirectory, outputDirectory } = await docsDirectories(
      t,
      "micronaut-web-docs-all-",
    );
    const projects = [
      {
        slug: "core",
        displayName: "Micronaut Core",
        repositoryName: "micronaut-core",
        version: "5.0.0",
      },
      {
        slug: "data",
        displayName: "Micronaut Data",
        repositoryName: "micronaut-data",
        version: "4.14.3",
      },
    ];
    await writeDocsProjectCatalog(docsDirectory, projects);
    await writePlatformVersionCatalog(
      docsDirectory,
      Object.fromEntries(
        projects.map((project) => [project.slug, project.version]),
      ),
    );
    for (const project of projects) {
      await writeDocsGuide(
        docsDirectory,
        project.repositoryName,
        `${project.displayName} Docs`,
        `${project.displayName} body.\n`,
      );
    }

    await runRenderDocs(docsDirectory, outputDirectory, ["--all"], {
      strict: true,
    });

    assert.deepEqual(
      (await fs.readdir(outputDirectory))
        .filter((file) => file.endsWith(".html"))
        .sort(),
      ["core.html", "data.html"],
    );
    const catalog = JSON.parse(
      await fs.readFile(
        path.join(outputDirectory, "project-catalog.json"),
        "utf8",
      ),
    );
    assert.equal(catalog.projectCount, 2);
    for (const project of projects) {
      const html = await fs.readFile(
        path.join(outputDirectory, `${project.slug}.html`),
        "utf8",
      );
      assert.match(html, new RegExp(`id="${project.slug}-docs"`));
      assert.match(html, new RegExp(`id="${project.slug}-introduction"`));
      assert.match(
        textOnly(html),
        new RegExp(`${project.displayName} body\\.`),
      );
      const entry = catalog.projects.find(
        (candidate: { slug: string }) => candidate.slug === project.slug,
      );
      assert.equal(entry?.version, project.version);
      assert.equal(entry?.repositoryName, project.repositoryName);
    }
  });

  test("fails in strict mode when Asciidoctor reports a fatal diagnostic", async (t) => {
    const { docsDirectory, outputDirectory } = await docsDirectories(
      t,
      "micronaut-web-docs-fatal-",
    );
    await writeDocsProjectCatalog(docsDirectory, [fixtureDocsProject]);
    await writeDocsGuide(
      docsDirectory,
      fixtureDocsProject.repositoryName,
      "Fixture Docs",
      "include::missing.adoc[]",
    );

    await assert.rejects(
      runRenderDocs(docsDirectory, outputDirectory, ["--slugs", "fixture"], {
        strict: true,
      }),
      (error: { stdout?: string; stderr?: string }) => {
        const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
        assert.match(output, /Asciidoctor diagnostics/);
        assert.match(
          output,
          /include file not found|include file not readable/i,
        );
        return true;
      },
    );
  });
});

describe("readPlatformCatalogProjects", () => {
  test("derives projects from platform libraries and checked-in metadata", async (t) => {
    const directory = await temporaryDirectory(
      t,
      "micronaut-web-platform-catalog-",
    );
    const catalogFile = path.join(directory, "libs.versions.toml");
    await writeTextFile(catalogFile, [
      "[versions]",
      'managed-micronaut-core = "5.0.0-RC2"',
      'managed-micronaut-data = "4.10.22"',
      'managed-micronaut-guides = "0.3.0"',
      "",
      "[libraries]",
      'boms-micronaut-core = { module = "io.micronaut:micronaut-core-bom", version.ref = "managed-micronaut-core" }',
      'boms-micronaut-data = { module = "io.micronaut.data:micronaut-data-bom", version.ref = "managed-micronaut-data" }',
      'boms-micronaut-guides = { module = "io.micronaut.guides:micronaut-guides-bom", version.ref = "managed-micronaut-guides" }',
    ]);

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
      projects.map((project) => project.slug),
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
});
