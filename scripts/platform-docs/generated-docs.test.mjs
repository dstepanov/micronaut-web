import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("generated docs are prepared before Astro dev and build", async () => {
  const packageJson = JSON.parse(await fs.readFile(path.join(projectDirectory, "package.json"), "utf8"));

  assert.equal(packageJson.scripts["prepare:generated-docs"], "npm run render:platform-docs");
  assertScriptOrder(packageJson.scripts.dev, "npm run prepare:generated-docs", "astro dev");
  assertScriptOrder(packageJson.scripts.build, "npm run prepare:generated-docs", "astro build");
});

test("generated docs fragments and assets are ignored and not tracked source", async () => {
  const ignoredPaths = [
    "src/content/generated-docs/generated-docs-test.html",
    "src/content/generated-docs/assets/generated-docs-test/docs/img/example.png"
  ];
  const { stdout: ignoredOutput } = await execFile("git", ["check-ignore", ...ignoredPaths], {
    cwd: projectDirectory
  });
  assert.deepEqual(lines(ignoredOutput), ignoredPaths);

  const { stdout: trackedOutput } = await execFile("git", ["ls-files", "--", "src/content/generated-docs"], {
    cwd: projectDirectory
  });
  const trackedGeneratedOutput = lines(trackedOutput).filter((file) =>
    file.endsWith(".html") || file.startsWith("src/content/generated-docs/assets/")
  );
  assert.deepEqual(trackedGeneratedOutput, []);
});

test("platform docs renderer writes generated HTML and page-relative docs asset links", async (t) => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "micronaut-web-generated-docs-"));
  t.after(() => fs.rm(temporaryDirectory, { force: true, recursive: true }));
  const platformDocsDirectory = path.join(temporaryDirectory, "platform-docs");
  const outputDirectory = path.join(temporaryDirectory, "generated-docs");
  const submoduleDirectory = path.join(platformDocsDirectory, "repos", "micronaut-fixture");
  const guideDirectory = path.join(submoduleDirectory, "src", "main", "docs", "guide");
  const imageDirectory = path.join(submoduleDirectory, "src", "main", "docs", "resources", "img");

  await fs.mkdir(path.join(platformDocsDirectory, "gradle"), { recursive: true });
  await fs.mkdir(path.join(platformDocsDirectory, "repos", "micronaut-platform", "gradle"), { recursive: true });
  await fs.mkdir(guideDirectory, { recursive: true });
  await fs.mkdir(imageDirectory, { recursive: true });
  await fs.writeFile(
    path.join(platformDocsDirectory, "gradle", "platform-doc-projects.properties"),
    [
      "project.count=1",
      "project.0.slug=fixture",
      "project.0.displayName=Micronaut Fixture",
      "project.0.submodulePath=repos/micronaut-fixture",
      "project.0.repositoryUrl=https://github.com/micronaut-projects/micronaut-fixture.git",
      "project.0.branch=master",
      "project.0.platformVersionKey=micronaut"
    ].join("\n"),
    "utf8"
  );
  await fs.writeFile(
    path.join(platformDocsDirectory, "repos", "micronaut-platform", "gradle", "libs.versions.toml"),
    "[versions]\nmicronaut = \"1.2.3\"\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(guideDirectory, "toc.yml"),
    "title: Fixture Docs\nintroduction: Introduction\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(guideDirectory, "introduction.adoc"),
    [
      "This generated fixture body should render into the docs page.",
      "",
      "image::diagram.svg[Fixture diagram]"
    ].join("\n"),
    "utf8"
  );
  await fs.writeFile(
    path.join(imageDirectory, "diagram.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>',
    "utf8"
  );

  await execFile(
    process.execPath,
    [
      "scripts/render-platform-docs.mjs",
      "--platform-docs-dir",
      platformDocsDirectory,
      "--output",
      outputDirectory,
      "--slugs",
      "fixture"
    ],
    {
      cwd: projectDirectory
    }
  );

  const generatedHtml = await fs.readFile(path.join(outputDirectory, "fixture.html"), "utf8");
  const pageRelativeAssetUrl = "../assets/fixture/docs/img/diagram.svg";

  assert.match(generatedHtml, /This generated fixture body should render into the docs page\./);
  assert.match(generatedHtml, /id="fixture-introduction"/);
  assert.match(generatedHtml, new RegExp(`src="${escapeRegExp(pageRelativeAssetUrl)}"`));
  assert.equal(
    new URL(pageRelativeAssetUrl, "https://example.test/docs/fixture/").pathname,
    "/docs/assets/fixture/docs/img/diagram.svg"
  );
  assert.equal(
    await fs.readFile(path.join(outputDirectory, "assets", "fixture", "docs", "img", "diagram.svg"), "utf8"),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>'
  );
});

test("docs routes render generated fragments and serve generated assets", async () => {
  const docsPageSource = await fs.readFile(path.join(projectDirectory, "src", "pages", "docs", "[slug].astro"), "utf8");
  const assetsRouteSource = await fs.readFile(path.join(projectDirectory, "src", "pages", "docs", "assets", "[...path].ts"), "utf8");

  assert.match(docsPageSource, /readFile\(join\(process\.cwd\(\),[\s\S]*"generated-docs"[\s\S]*`\$\{project\.slug\}\.html`/);
  assert.match(docsPageSource, /data-generated-docs/);
  assert.match(docsPageSource, /set:html=\{generatedDocHtml\}/);
  assert.match(assetsRouteSource, /"src", "content", "generated-docs", "assets"/);
  assert.match(assetsRouteSource, /fs\.readFile\(path\.join\(generatedAssetsDirectory/);
});

function assertScriptOrder(script, producer, consumer) {
  assert.equal(typeof script, "string");
  const producerIndex = script.indexOf(producer);
  const consumerIndex = script.indexOf(consumer);
  assert.notEqual(producerIndex, -1, `${script} should include '${producer}'`);
  assert.notEqual(consumerIndex, -1, `${script} should include '${consumer}'`);
  assert.ok(producerIndex < consumerIndex, `${script} should run '${producer}' before '${consumer}'`);
}

function lines(value) {
  return value.split(/\r?\n/).filter(Boolean);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
