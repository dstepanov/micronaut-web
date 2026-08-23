import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import { assertNoRuntimeGeneratedRendering } from "../support/html.ts";
import { projectDirectory } from "../support/paths.ts";

const execFile = promisify(execFileCallback);

// These tests pin how the guides surface is wired together: package scripts,
// workflows, routes and the scripts that hydrate the rendered fragments. They
// read source files rather than rendering anything.

test("generated guides fragments, manifest, and assets are ignored", async (): Promise<void> => {
  const ignoredPaths = [
    "src/content/generated-guides/manifest.json",
    "src/content/generated-guides/fragments/example-gradle-java.html",
    "src/content/generated-guides/assets/example/image.png",
  ];
  const { stdout: ignoredOutput } = await execFile(
    "git",
    ["check-ignore", ...ignoredPaths],
    {
      cwd: projectDirectory,
    },
  );
  assert.deepEqual(lines(ignoredOutput), ignoredPaths);
});

test("latest guide replacement routes and parallel generated-content preparation are wired", async (): Promise<void> => {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(projectDirectory, "package.json"), "utf8"),
  );
  const guidesWorkflow = await fs.readFile(
    path.join(projectDirectory, ".github", "workflows", "deploy-guides.yml"),
    "utf8",
  );
  const webWorkflow = await fs.readFile(
    path.join(projectDirectory, ".github", "workflows", "deploy-web.yml"),
    "utf8",
  );
  const prepareScript = await fs.readFile(
    path.join(projectDirectory, "scripts", "prepare-generated-content.ts"),
    "utf8",
  );
  const legacyRoute = await fs.readFile(
    path.join(projectDirectory, "src", "pages", "latest", "[page].html.ts"),
    "utf8",
  );
  const zipRoute = await fs.readFile(
    path.join(projectDirectory, "src", "pages", "latest", "[download].zip.ts"),
    "utf8",
  );
  const guidesIndexRoute = await fs.readFile(
    path.join(projectDirectory, "src", "pages", "guides", "index.astro"),
    "utf8",
  );
  const guidesRoute = await fs.readFile(
    path.join(projectDirectory, "src", "pages", "guides", "[slug].astro"),
    "utf8",
  );
  const guidesPageIndexSource = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "scripts",
      "generated-guides-page-index.ts",
    ),
    "utf8",
  );
  const sectionPageIndexSource = await fs.readFile(
    path.join(projectDirectory, "src", "scripts", "section-page-index.ts"),
    "utf8",
  );
  const guidesLegacyRoute = await fs.readFile(
    path.join(projectDirectory, "src", "pages", "guides", "[slug].html.ts"),
    "utf8",
  );
  const guidesZipRoute = await fs.readFile(
    path.join(projectDirectory, "src", "pages", "guides", "[download].zip.ts"),
    "utf8",
  );
  const generatedGuidesServerLibrary = await fs.readFile(
    path.join(projectDirectory, "src", "lib", "generated-guides.ts"),
    "utf8",
  );
  const generatedGuidesRoutingLibrary = await fs.readFile(
    path.join(projectDirectory, "src", "lib", "generated-guide-routing.ts"),
    "utf8",
  );
  const guidesRenderer = await fs.readFile(
    path.join(projectDirectory, "scripts", "guides", "renderer.ts"),
    "utf8",
  );
  const guidesExtensions = await readDirectoryText(
    path.join(projectDirectory, "scripts", "guides", "extensions"),
  );
  const generatedDocsStaticEnhancer = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "components",
      "web",
      "generated-docs-static-enhancer.astro",
    ),
    "utf8",
  );
  const guideCatalog = await fs.readFile(
    path.join(
      projectDirectory,
      "src",
      "components",
      "web",
      "latest-guides-catalog.astro",
    ),
    "utf8",
  );
  const browserTestRunner = await fs.readFile(
    path.join(projectDirectory, "scripts", "run-browser-tests.ts"),
    "utf8",
  );

  assert.equal(
    packageJson.scripts["render:guides"],
    "node scripts/render-guides.ts",
  );
  assert.equal(
    packageJson.scripts["test:guides"],
    "node --test scripts/tests/guides/*.test.ts && node scripts/run-browser-tests.ts guides",
  );
  assert.equal(
    packageJson.scripts["test:guides:browser"],
    "node scripts/ensure-playwright-chromium.ts && node tests/playwright/generated-content-fixtures.ts guides && playwright test --config playwright.config.ts tests/playwright/guides.spec.ts",
  );
  assert.match(browserTestRunner, /npm_execpath/);
  assert.match(prepareScript, /Promise\.all/);
  assert.match(prepareScript, /render-docs\.ts/);
  assert.match(prepareScript, /render-guides\.ts/);
  assert.match(prepareScript, /MICRONAUT_PREPARE_GENERATED_CONTENT/);
  assert.match(prepareScript, /MICRONAUT_DEPLOY_SURFACE/);
  assert.match(
    guidesWorkflow,
    /default:\s*micronaut-projects\/micronaut-guides/,
  );
  assert.match(guidesWorkflow, /GUIDES_RENDER_ALL:\s*"true"/);
  assert.match(guidesWorkflow, /GUIDES_RENDER_STRICT:\s*"true"/);
  assert.doesNotMatch(guidesWorkflow, /micronaut-platform/);
  assert.doesNotMatch(guidesWorkflow, /DOCS_DIR/);
  assert.doesNotMatch(guidesWorkflow, /DOCS_RENDER_ALL/);
  assert.doesNotMatch(guidesWorkflow, /DOCS_RENDER_STRICT/);
  assert.doesNotMatch(guidesWorkflow, /DOCS_SYNC_SOURCES/);
  assert.doesNotMatch(webWorkflow, /micronaut-guides/);
  assert.doesNotMatch(webWorkflow, /GUIDES_RENDER_ALL/);
  assert.doesNotMatch(webWorkflow, /GUIDES_RENDER_STRICT/);
  await assert.rejects(
    () =>
      fs.access(
        path.join(projectDirectory, "src", "pages", "latest", "[page].astro"),
      ),
    (error: any): boolean => error?.code === "ENOENT",
  );
  assert.doesNotMatch(legacyRoute, /@\/lib\/protocol/);
  assert.doesNotMatch(legacyRoute, /productionUrl\("guides"\)/);
  assert.match(legacyRoute, /const guidesRoot = "\/guides"/);
  assert.match(legacyRoute, /guideOptionPath\(option, guidesRoot\)/);
  assert.match(legacyRoute, /preferredGuideOption\(guide\)/);
  assert.doesNotMatch(legacyRoute, /guideOverviewPath/);
  assert.match(
    legacyRoute,
    /preservingClientRedirect\(\s*withBasePath\(props\.destination\)/,
  );
  assert.match(zipRoute, /productionUrl\("guides", option\.zipUrl\)/);
  assert.match(zipRoute, /redirect\(props\.zipUrl, 302\)/);
  assert.match(guidesIndexRoute, /readGeneratedGuidesManifest/);
  assert.match(guidesIndexRoute, /root="\/guides"/);
  assert.doesNotMatch(guidesIndexRoute, /GuidesCatalogTabs|GuidesFilterPanel/);
  assert.doesNotMatch(guidesIndexRoute, /@\/lib\/protocol/);
  assert.match(guidesRoute, /readGeneratedGuideFragment/);
  assert.match(guidesRoute, /preferredGuideOption\(props\.guide\)/);
  assert.match(guidesRoute, /Astro\.redirect/);
  assert.doesNotMatch(
    guidesRoute,
    /Choose the language and build tool variant for the tutorial/,
  );
  assert.doesNotMatch(guidesRoute, /Read This Guide/);
  assert.match(guidesRoute, /On this guide/);
  assert.doesNotMatch(
    guidesRoute,
    /aria-label="On this guide"[\s\S]*Choose the language and build tool variant for the tutorial/,
  );
  assert.match(guidesRoute, /In this section/);
  assert.match(guidesRoute, /buildGuidePageIndexSections/);
  assert.match(
    guidesRoute,
    /guideSectionLinks = pageIndexSections\s*\.filter\(\(section\) => section\.level === 0\)\s*\.slice\(0, 30\)/,
  );
  assert.match(
    guidesRoute,
    /currentGuideSectionLinks = pageIndexSections\.filter\(\s*\(section\) => section\.level > 0,?\s*\)/,
  );
  assert.match(
    guidesRoute,
    /guideSectionLinks\.map\(\(section\)[\s\S]*Different variants[\s\S]*props\.guide\.options\.map\(\(option\)/,
  );
  assert.equal(guidesRoute.match(/aria-label=\{section\.label\}/g)?.length, 4);
  assert.equal(guidesRoute.match(/aria-label=\{option\.label\}/g)?.length, 2);
  assert.equal(
    guidesRoute.match(/aria-label="Different variants"/g)?.length,
    2,
  );
  assert.doesNotMatch(
    guidesRoute,
    /Different variants[\s\S]{0,500}All variants/,
  );
  assert.match(guidesRoute, /data-guide-section-link/);
  assert.match(guidesRoute, /@\/scripts\/generated-guides-page-index/);
  assert.doesNotMatch(guidesRoute, /generatedGuidesPageIndexUrl|\?url/);
  assert.doesNotMatch(guidesRoute, /<script is:inline>/);
  assert.doesNotMatch(guidesRoute, /guideSectionLinksById/);
  assert.match(guidesRoute, /data-guide-page-index/);
  assert.match(guidesRoute, /data-guide-page-index-inner/);
  assert.match(guidesRoute, /data-root-id/);
  assert.match(guidesRoute, /\[&\.active\]:before:bg-brand/);
  assert.doesNotMatch(guidesRoute, /\.guide-page-index/);
  assert.doesNotMatch(
    guidesRoute,
    /requestAnimationFrame\(updateActiveSection\)/,
  );
  assert.doesNotMatch(guidesPageIndexSource, /guideSectionLinksById/);
  assert.match(guidesPageIndexSource, /enhanceSectionPageIndex/);
  assert.match(guidesPageIndexSource, /currentLinkSelector/);
  assert.match(guidesPageIndexSource, /rootLinkSelector/);
  assert.match(guidesPageIndexSource, /data-guide-page-index/);
  assert.match(guidesPageIndexSource, /data-guide-page-index-link/);
  assert.match(guidesPageIndexSource, /data-guide-section-link/);
  assert.match(sectionPageIndexSource, /syncCurrentSectionLinks/);
  assert.match(sectionPageIndexSource, /requestAnimationFrame/);
  assert.match(sectionPageIndexSource, /setActiveIdFromHash/);
  assert.match(guidesRoute, /guideOptionPath\(option, guidesRoot\)/);
  assert.doesNotMatch(guidesRoute, /legacyGuidesBase/);
  assert.match(guidesRoute, /GeneratedDocsStaticEnhancer/);
  assertNoRuntimeGeneratedRendering("guides route", guidesRoute);
  assert.doesNotMatch(
    guidesRoute,
    /GeneratedDocsEnhancer|GeneratedDocsPropertiesFallback/,
  );
  assert.match(guidesLegacyRoute, /preferredGuideOption\(guide\)/);
  assert.doesNotMatch(guidesLegacyRoute, /guideOverviewPath/);
  assert.doesNotMatch(guidesLegacyRoute, /legacyGuidesBase/);
  assert.doesNotMatch(guidesLegacyRoute, /productionUrl\("guides"\)/);
  assert.match(guidesZipRoute, /productionUrl\("guides", option\.zipUrl\)/);
  assert.match(generatedGuidesServerLibrary, /node:fs\/promises/);
  assert.match(generatedGuidesServerLibrary, /node:path/);
  assert.match(generatedGuidesServerLibrary, /generated-guide-routing/);
  assert.match(generatedGuidesRoutingLibrary, /preferredGuideOption/);
  assert.match(
    generatedGuidesRoutingLibrary,
    /option\.language === "java" && option\.buildTool === "gradle"/,
  );
  assert.match(
    generatedGuidesRoutingLibrary,
    /option\.file === guide\.defaultOptionFile/,
  );
  assert.doesNotMatch(guidesRenderer, /processAsciiDocHtml/);
  assert.doesNotMatch(guidesRenderer, /renderStaticSnippetCards/);
  assert.doesNotMatch(guidesRenderer, /renderStaticDocsSnippets/);
  assert.doesNotMatch(guidesRenderer, /renderStaticListingBlockSnippets/);
  await assert.rejects(
    () =>
      fs.access(
        path.join(projectDirectory, "scripts", "guides", "preprocessor.ts"),
      ),
    (error: any): boolean => error?.code === "ENOENT",
  );
  assert.match(guidesExtensions, /defineBlock\(/);
  assert.match(guidesExtensions, /renderSnippetBlock\(/);
  assert.doesNotMatch(guidesExtensions, /normalizeAsciiDocCallouts/);
  assert.doesNotMatch(guidesExtensions, /normalizeOrphanCalloutLists/);
  assert.doesNotMatch(guidesExtensions, /SNIPPET_CALLOUT_VALIDATION_CLASS/);
  assertNoRuntimeGeneratedRendering(
    "generated guides static enhancer",
    generatedDocsStaticEnhancer,
  );
  assert.doesNotMatch(generatedDocsStaticEnhancer, /define:vars/);
  assert.doesNotMatch(guideCatalog, /guides-version-selector|Guides version/);
});

function lines(value: string): string[] {
  return value.split(/\r?\n/).filter(Boolean);
}

async function readDirectoryText(directory: string): Promise<string> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
      .map((entry) => fs.readFile(path.join(directory, entry.name), "utf8")),
  );
  return contents.join("\n");
}
