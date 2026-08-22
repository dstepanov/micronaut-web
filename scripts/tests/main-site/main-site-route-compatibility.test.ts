import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
const routeCompatibility = importRouteCompatibility();

test("route compatibility manifest documents representative legacy urls", async (): Promise<void> => {
  const { routeCompatibilityManifest } = await routeCompatibility;
  const entriesById = new Map<string, any>(
    routeCompatibilityManifest.map((entry: any): [string, any] => [
      entry.id,
      entry,
    ]),
  );

  for (const id of [
    "docs-core-latest-guide",
    "docs-core-latest-guide-index",
    "guides-latest-index-html",
    "guides-tag-html",
    "guides-detail-html",
    "guides-zip",
    "blog-dated-html",
    "anchor-urls",
  ]) {
    assert.ok(entriesById.has(id), `${id} should be documented`);
  }

  assert.equal(
    entriesById.get("docs-core-latest-guide-index").sourcePath,
    "/latest/guide/index.html",
  );
  assert.equal(
    entriesById.get("guides-latest-index-html").sourcePath,
    "/latest/index.html",
  );
  assert.equal(entriesById.get("guides-zip").status, 302);
});

test("production url helper is host and surface aware", async (): Promise<void> => {
  const { productionUrl } = await routeCompatibility;

  assert.equal(
    productionUrl("main", "/download/"),
    "https://micronaut.io/download/",
  );
  assert.equal(
    productionUrl("docs", "/latest/guide/"),
    "https://docs.micronaut.io/latest/guide/",
  );
  assert.equal(
    productionUrl("guides", "/index.html"),
    "https://guides.micronaut.io/index.html",
  );
  assert.equal(
    productionUrl("guides", "micronaut-http-client.zip"),
    "https://guides.micronaut.io/micronaut-http-client.zip",
  );
});

test("static redirects carry both the query string and the fragment", async (): Promise<void> => {
  const { preservingClientRedirect } = await routeCompatibility;
  const body = await preservingClientRedirect(
    "/docs/core/",
    "Micronaut Core docs",
  ).text();

  // A bare meta refresh drops both; the script is what keeps deep links working.
  assert.match(
    body,
    /<meta http-equiv="refresh" content="0;url=\/docs\/core\/"/,
  );
  assert.match(
    body,
    /location\.replace\("\/docs\/core\/" \+ location\.search \+ location\.hash\)/,
  );
  assert.match(body, /<meta name="robots" content="noindex"/);
  assert.match(
    body,
    /<a href="\/docs\/core\/">Continue to Micronaut Core docs<\/a>/,
  );
});

test("every compatibility redirect route uses the shared redirect helper", async (): Promise<void> => {
  const routeFiles = [
    "src/pages/latest/[page].html.ts",
    "src/pages/latest/index.html.ts",
    "src/pages/latest/guide/index.html.ts",
    "src/pages/guides/[slug].html.ts",
    "src/pages/blog/[legacySlug].html.ts",
  ];

  for (const routeFile of routeFiles) {
    const source = await fs.readFile(
      path.join(projectDirectory, routeFile),
      "utf8",
    );
    assert.match(
      source,
      /preservingClientRedirect\(/,
      `${routeFile} should redirect through preservingClientRedirect`,
    );
    assert.doesNotMatch(
      source,
      /\bredirect\(/,
      `${routeFile} should not use Astro's redirect, which drops the fragment in a static build`,
    );
  }
});

test("new route files use the compatibility manifest", async (): Promise<void> => {
  const routeFiles = [
    "src/pages/latest/guide/index.astro",
    "src/pages/latest/guide/index.html.ts",
  ];

  for (const routeFile of routeFiles) {
    const source = await fs.readFile(
      path.join(projectDirectory, routeFile),
      "utf8",
    );
    assert.match(source, /routeCompatibilityEntry/);
    assert.match(source, /docs-core/);
  }
});

test("runtime theme route and header controls stay removed", async (): Promise<void> => {
  await assert.rejects(
    () => fs.access(path.join(projectDirectory, "src/pages/new.astro")),
    (error: any): boolean => error?.code === "ENOENT",
  );

  const [siteHeaderSource, webLayoutSource] = await Promise.all([
    fs.readFile(
      path.join(projectDirectory, "src/components/web/site-header.tsx"),
      "utf8",
    ),
    fs.readFile(
      path.join(projectDirectory, "src/layouts/WebLayout.astro"),
      "utf8",
    ),
  ]);

  for (const removedHeaderFragment of [
    "ExperienceThemeSwitch",
    "MobileExperienceThemeLinks",
    "MobileThemeModeControl",
    "ThemeToggle",
    "Classic",
    "/new/",
  ]) {
    assert.doesNotMatch(
      siteHeaderSource,
      new RegExp(escapeRegExp(removedHeaderFragment)),
    );
  }

  for (const removedLayoutFragment of [
    "EXPERIENCE_THEME_STORAGE_KEY",
    "RUNTIME_EXPERIENCE_ENABLED",
    "data-runtime-experience-enabled",
  ]) {
    assert.doesNotMatch(
      webLayoutSource,
      new RegExp(escapeRegExp(removedLayoutFragment)),
    );
  }
});

test("compatibility documentation covers production hosts and legacy matrix", async (): Promise<void> => {
  const doc = await fs.readFile(
    path.join(projectDirectory, "README.md"),
    "utf8",
  );

  for (const expected of [
    "https://micronaut.io/",
    "https://docs.micronaut.io/",
    "https://guides.micronaut.io/",
    "`https://micronaut.io/core/`",
    "Deferred until `/core/` routing is resumed",
    "`https://docs.micronaut.io/latest/guide/index.html#ioc`",
    "`https://guides.micronaut.io/latest/micronaut-http-client-gradle-java.zip`",
    "`https://micronaut.io/blog/2020-04-30-introducing-micronaut-launch.html`",
    "Fragments require client redirect pages",
  ]) {
    assert.match(doc, new RegExp(escapeRegExp(expected)));
  }
});

async function importRouteCompatibility(): Promise<any> {
  return import(
    pathToFileURL(
      path.join(projectDirectory, "src", "lib", "route-compatibility.ts"),
    ).href
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
