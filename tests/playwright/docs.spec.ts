import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  collectRuntimeScriptAssertions,
  expectClipboardText,
  expectNoForbiddenRuntimeLibraries,
  installClipboardMock,
} from "./runtime-script-assertions";

const docsProjects = [
  {
    language: "java",
    name: "Micronaut Core",
    requireDependency: true,
    requireProperties: true,
    slug: "core",
  },
  {
    language: "kotlin",
    name: "Micronaut Data",
    requireDependency: false,
    requireProperties: false,
    slug: "data",
  },
  {
    language: "groovy",
    name: "Micronaut Serialization",
    requireDependency: false,
    requireProperties: false,
    slug: "serde",
  },
];

test("docs catalog lays out generated project cards", async ({ page }) => {
  const failures = collectBrowserFailures(page);

  await page.goto(appPath("/docs/"));

  await expect(page.locator("[data-docs-shell]")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Playwright Copied Docs" }),
  ).toBeVisible();
  await expect(
    page.locator("main section#playwright > div").first().locator("svg"),
  ).toHaveCount(0);
  await expect(
    page
      .locator("[data-docs-sidebar] [data-docs-target-id='playwright']")
      .locator("svg"),
  ).toHaveCount(0);

  const cards = page.locator('main [data-slot="card"]');
  await expect(cards).toHaveCount(docsProjects.length);
  for (const project of docsProjects) {
    const card = cards.filter({ hasText: project.name });
    await expect(card).toBeVisible();
    await expect(card.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      docsProjectHrefPattern(project.slug),
    );
  }

  const searchButton = page.getByRole("button", { name: "Search Micronaut" });
  const searchInput = page.getByPlaceholder(
    "Search projects, classes, properties, docs...",
  );
  await expect(async () => {
    await searchButton.click();
    await expect(searchInput).toBeVisible({ timeout: 1_000 });
  }).toPass();
  await expect(searchInput).toHaveAttribute("type", "search");
  await expect(searchInput).toHaveAttribute("autocomplete", "off");
  await expect(searchInput).toHaveAttribute("autocapitalize", "none");
  await expect(searchInput).toHaveAttribute("autocorrect", "off");
  await expect(searchInput).toHaveAttribute("spellcheck", "false");

  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);
});

test("generated docs page renders desktop content and sidebars without overlap", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);

  await page.goto(appPath("/docs/core/"));

  await expect(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "Micronaut Core",
    }),
  ).toBeVisible();
  await expect(page.locator("[data-generated-docs]")).toBeVisible();
  await expect(
    page.locator(".docs-code-snippet-template").first(),
  ).toBeVisible();
  await expect(page.locator(".docs-properties-template").first()).toBeVisible();

  const docsSidebar = page.locator("[data-docs-sidebar]");
  await expect(docsSidebar).toBeVisible();
  const activeProjectLink = docsSidebar.getByRole("link", {
    name: "Micronaut Core",
  });
  await expect(activeProjectLink).toHaveAttribute("aria-current", "page");
  await expect(activeProjectLink).toHaveAttribute(
    "data-docs-active-project-link",
    "true",
  );
  await expect(activeProjectLink).toHaveAttribute("aria-expanded", "true");
  const activeProjectSections = page.locator("#docs-desktop-core-sections");
  await expect(activeProjectSections).toBeVisible();
  const projectUrlBeforeToggle = page.url();
  await activeProjectLink.click();
  await expect(activeProjectLink).toHaveAttribute("aria-expanded", "false");
  await expect(activeProjectSections).toBeHidden();
  expect(page.url()).toBe(projectUrlBeforeToggle);
  await activeProjectLink.click();
  await expect(activeProjectLink).toHaveAttribute("aria-expanded", "true");
  await expect(activeProjectSections).toBeVisible();
  await activeProjectLink.click();
  await expect(activeProjectLink).toHaveAttribute("aria-expanded", "false");
  await expect(activeProjectSections).toBeHidden();
  await activeProjectLink.click();
  await expect(activeProjectLink).toHaveAttribute("aria-expanded", "true");
  await expect(activeProjectSections).toBeVisible();
  expect(page.url()).toBe(projectUrlBeforeToggle);

  const sectionNav = page.locator("[data-docs-current-section-index]");
  await expect(sectionNav).toBeHidden();
  for (const rootLabel of [
    "1 Introduction",
    "2 Quick Start",
    "3 Snippet Gallery",
  ]) {
    await expect(
      sectionNav
        .locator("[data-docs-current-section-link]")
        .getByText(rootLabel, { exact: true }),
    ).toHaveCount(0);
  }

  await scrollToGeneratedHeading(page, "2 Quick Start");
  await expect(sectionNav).toBeVisible();
  const introductionSection = docsSidebar.getByRole("link", {
    name: "1 Introduction",
  });
  const quickStartSection = docsSidebar.getByRole("link", {
    name: "2 Quick Start",
  });
  const snippetGallerySection = docsSidebar.getByRole("link", {
    name: "3 Snippet Gallery",
  });
  const createApplication = sectionNav.getByRole("link", {
    includeHidden: true,
    name: "Create an Application",
  });
  await expect(createApplication).toHaveCount(1);
  await expect(createApplication).toBeVisible();
  await expect(quickStartSection).toHaveAttribute("data-active", "true");
  await expect(quickStartSection).toHaveClass(/(^|\s)active(\s|$)/);
  await expect(introductionSection).not.toHaveClass(/(^|\s)active(\s|$)/);
  const ordinarySourceBlocks = sectionNav.getByRole("link", {
    includeHidden: true,
    name: "Ordinary Source Blocks",
  });
  await expect(ordinarySourceBlocks).toHaveCount(1);
  await expect(ordinarySourceBlocks).toBeHidden();

  await scrollToGeneratedHeading(page, "Create an Application");
  await expect(createApplication).toHaveAttribute("data-active", "true");
  await expect(createApplication).toHaveClass(/(^|\s)active(\s|$)/);
  await expect(createApplication).toHaveAttribute("aria-current", "location");

  await scrollToGeneratedHeading(page, "Ordinary Source Blocks");
  await expect(ordinarySourceBlocks).toBeVisible();
  await expect(createApplication).toBeHidden();
  await expect(createApplication).toHaveAttribute("data-active", "false");
  await expect(createApplication).not.toHaveClass(/(^|\s)active(\s|$)/);
  await expect(
    sectionNav.getByRole("link", { name: "Generated Snippet Macros" }),
  ).toBeVisible();
  await expect(ordinarySourceBlocks).toHaveAttribute("data-active", "true");
  await expect(ordinarySourceBlocks).toHaveClass(/(^|\s)active(\s|$)/);
  await expect(snippetGallerySection).toHaveAttribute("data-active", "true");
  await expect(snippetGallerySection).toHaveClass(/(^|\s)active(\s|$)/);
  await expect(quickStartSection).toHaveAttribute("data-active", "false");
  await expect(quickStartSection).not.toHaveClass(/(^|\s)active(\s|$)/);
  await expect(ordinarySourceBlocks).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expectTopHeaderPinned(page);

  await expectNoHorizontalOverflow(page);
  await expectElementInsideViewport(page, ".docs-code-snippet-template");
  await expectElementsDoNotOverlap(
    page,
    "[data-generated-docs]",
    'aside[aria-label="In this section"]',
  );
  expect(failures).toEqual([]);
});

test("docs section and subsection navigation follows scroll movement", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);

  await page.goto(appPath("/docs/core/"));
  await expect(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "Micronaut Core",
    }),
  ).toBeVisible();

  const docsSidebar = page.locator("[data-docs-sidebar]");
  const sectionNav = page.locator("[data-docs-current-section-index]");
  const introductionSection = docsSidebar.getByRole("link", {
    name: "1 Introduction",
  });
  const quickStartSection = docsSidebar.getByRole("link", {
    name: "2 Quick Start",
  });
  const snippetGallerySection = docsSidebar.getByRole("link", {
    name: "3 Snippet Gallery",
  });
  const createApplication = sectionNav.getByRole("link", {
    includeHidden: true,
    name: "Create an Application",
  });
  const generatedSnippetMacros = sectionNav.getByRole("link", {
    includeHidden: true,
    name: "Generated Snippet Macros",
  });

  await scrollToGeneratedHeading(page, "Create an Application");
  await expect(sectionNav).toBeVisible();
  await expectDocsLinkActive(quickStartSection, true);
  await expectDocsLinkActive(createApplication, true);
  await expectDocsLinkActive(introductionSection, false);
  await expectDocsLinkActive(snippetGallerySection, false);
  await expect(generatedSnippetMacros).toBeHidden();

  await scrollToGeneratedHeading(page, "Generated Snippet Macros");
  await expect(generatedSnippetMacros).toBeVisible();
  await expectDocsLinkActive(snippetGallerySection, true);
  await expectDocsLinkActive(generatedSnippetMacros, true);
  await expectDocsLinkActive(quickStartSection, false);
  await expectDocsLinkActive(createApplication, false);
  await expect(createApplication).toBeHidden();

  await scrollToGeneratedHeading(page, "Create an Application");
  await expect(createApplication).toBeVisible();
  await expectDocsLinkActive(quickStartSection, true);
  await expectDocsLinkActive(createApplication, true);
  await expectDocsLinkActive(snippetGallerySection, false);
  await expectDocsLinkActive(generatedSnippetMacros, false);

  expect(failures).toEqual([]);
});

test("docs runtime scripts do not include build-time content processors", async ({
  page,
}) => {
  const runtimeScripts = collectRuntimeScriptAssertions(page);
  const failures = collectBrowserFailures(page);
  await installClipboardMock(page);

  await page.goto(appPath("/docs/core/"));

  await expect(
    page.locator(".docs-code-snippet-template").first(),
  ).toBeVisible();
  await expect(
    page.locator(".docs-code-snippet-template code span[style]").first(),
  ).toBeVisible();
  const firstSnippet = page.locator(".docs-code-snippet-template").first();
  const tabs = firstSnippet.locator(".docs-snippet-tabs button[role='tab']");
  if ((await tabs.count()) > 1) {
    const initialTab = tabs.nth(0);
    await expect(initialTab).toHaveAttribute("aria-selected", "true");
    await expect(initialTab).toHaveClass(/(^|\s)selected(\s|$)/);
    await tabs.nth(1).click();
    await expect(initialTab).toHaveAttribute("aria-selected", "false");
    await expect(initialTab).not.toHaveClass(/(^|\s)selected(\s|$)/);
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(1)).toHaveClass(/(^|\s)selected(\s|$)/);
  }
  await firstSnippet.locator("[data-copy-active-snippet]").click();
  await expect(
    firstSnippet.locator("[data-copy-active-snippet]"),
  ).toHaveAttribute("aria-label", "Copied");
  await expectClipboardText(page);

  await expectNoForbiddenRuntimeLibraries(runtimeScripts);
  expect(failures).toEqual([]);
});

test("generated docs pages convert snippets for selected real projects", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);

  for (const project of docsProjects) {
    await page.goto(appPath(`/docs/${project.slug}/`));

    await expect(
      page.getByRole("heading", {
        exact: true,
        level: 1,
        name: project.name,
      }),
    ).toBeVisible();
    await expectConvertedGeneratedSnippets(page, {
      language: project.language,
      requireDependency: project.requireDependency,
      requireProperties: project.requireProperties,
    });
    await expectNoHorizontalOverflow(page);
  }

  expect(failures).toEqual([]);
});

test("docs page renders related latest guides from the guides manifest", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);
  await page.route(/\/(?:guides|latest)\/manifest\.json$/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(relatedGuidesManifest()),
    });
  });

  await page.goto(appPath("/docs/data/"));

  await expect(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "Micronaut Data",
    }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const relatedGuides = page.locator("[data-docs-related-guides]");
  await expect(relatedGuides).toBeVisible();
  await expect(
    relatedGuides.getByRole("heading", { name: "Related guides" }),
  ).toBeVisible();
  await expect(
    relatedGuides.getByText("Micronaut HTTP Client"),
  ).toHaveCount(0);
  const guideLink = relatedGuides
    .getByRole("link", {
      name: "Access a database with Micronaut Data JDBC",
    })
    .first();
  await expect(guideLink).toHaveAttribute(
    "href",
    relatedGuideHrefPattern("micronaut-data-jdbc-repository-gradle-java.html"),
  );

  expect(failures).toEqual([]);
});

test("generated docs page fits the mobile viewport", async ({ page }) => {
  const failures = collectBrowserFailures(page);
  await page.setViewportSize({ width: 390, height: 860 });

  await page.goto(appPath("/docs/data/"));

  await expect(page.locator("[data-generated-docs]")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "Micronaut Data",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open docs navigation" }),
  ).toBeVisible();
  await expect(
    page.locator(".docs-code-snippet-template").first(),
  ).toBeVisible();
  await expect(
    page.locator('aside[aria-label="In this section"]'),
  ).toBeHidden();

  await expectNoHorizontalOverflow(page);
  await expectElementInsideViewport(page, ".docs-code-snippet-template");
  expect(failures).toEqual([]);
});

test("expanded docs project link toggles sections inside the mobile sidebar", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);
  await page.setViewportSize({ width: 390, height: 860 });

  await page.goto(appPath("/docs/core/"));

  await page.getByRole("button", { name: "Open docs navigation" }).click();
  const sheet = page.getByRole("dialog", { name: "Docs navigation" });
  await expect(sheet).toBeVisible();

  const activeProjectLink = sheet.getByRole("link", {
    name: "Micronaut Core",
  });
  const activeProjectSections = sheet.locator("#docs-mobile-core-sections");
  await expect(activeProjectLink).toHaveAttribute("aria-expanded", "true");
  await expect(activeProjectSections).toBeVisible();

  await clickAndExpectProjectSections({
    container: sheet,
    link: activeProjectLink,
    sections: activeProjectSections,
    expanded: false,
  });
  await clickAndExpectProjectSections({
    container: sheet,
    link: activeProjectLink,
    sections: activeProjectSections,
    expanded: true,
  });
  await clickAndExpectProjectSections({
    container: sheet,
    link: activeProjectLink,
    sections: activeProjectSections,
    expanded: false,
  });

  expect(failures).toEqual([]);
});

function collectBrowserFailures(page: Page) {
  const failures: string[] = [];
  page.on("pageerror", (error) => {
    failures.push(`page error: ${error.message}`);
  });
  page.on("requestfailed", (request) => {
    if (request.resourceType() === "script") {
      failures.push(
        `script request failed: ${request.url()} ${request.failure()?.errorText || ""}`.trim(),
      );
    }
  });
  page.on("response", (response) => {
    if (
      response.request().resourceType() === "script" &&
      response.status() >= 400
    ) {
      failures.push(
        `script response failed: ${response.url()} ${response.status()}`,
      );
    }
  });
  return failures;
}

function docsProjectHrefPattern(slug: string): RegExp {
  if (process.env.MICRONAUT_DEPLOY_SURFACE === "docs") {
    return new RegExp(
      `${escapeRegExp(appPath(`${configuredDocsRoot()}${slug}/`))}$`,
    );
  }
  return new RegExp(`/docs/${slug}/$`);
}

function relatedGuideHrefPattern(file: string): RegExp {
  return new RegExp(`/(?:guides|latest)/${escapeRegExp(file)}$`);
}

function relatedGuidesManifest() {
  return {
    generatedAt: "2026-06-12T00:00:00.000Z",
    guideCount: 2,
    guides: [
      {
        slug: "micronaut-http-client",
        title: "Micronaut HTTP Client",
        intro: "Learn how to use Micronaut low-level HTTP Client.",
        authors: ["Micronaut"],
        tags: ["client"],
        categories: ["HTTP Client"],
        publicationDate: "2030-01-01",
        estimatedMinutes: 30,
        overviewFile: "micronaut-http-client.html",
        defaultOptionFile: "micronaut-http-client-gradle-java.html",
        options: [
          {
            id: "micronaut-http-client-gradle-java",
            label: "Java / Gradle",
            language: "java",
            languageLabel: "Java",
            buildTool: "gradle",
            buildToolLabel: "Gradle",
            file: "micronaut-http-client-gradle-java.html",
            fragment: "fragments/micronaut-http-client-gradle-java.html",
            zipUrl: "micronaut-http-client-gradle-java.zip",
          },
        ],
      },
      {
        slug: "micronaut-data-jdbc-repository",
        title: "Access a database with Micronaut Data JDBC",
        intro: "Learn how to access a database with Micronaut JDBC repositories.",
        authors: ["Micronaut"],
        tags: ["database", "micronaut-data", "jdbc"],
        categories: ["Data JDBC"],
        publicationDate: "2021-05-28",
        estimatedMinutes: 25,
        overviewFile: "micronaut-data-jdbc-repository.html",
        defaultOptionFile: "micronaut-data-jdbc-repository-gradle-java.html",
        options: [
          {
            id: "micronaut-data-jdbc-repository-gradle-java",
            label: "Java / Gradle",
            language: "java",
            languageLabel: "Java",
            buildTool: "gradle",
            buildToolLabel: "Gradle",
            file: "micronaut-data-jdbc-repository-gradle-java.html",
            fragment: "fragments/micronaut-data-jdbc-repository-gradle-java.html",
            zipUrl: "micronaut-data-jdbc-repository-gradle-java.zip",
          },
        ],
      },
    ],
  };
}

function configuredDocsRoot(): string {
  return normalizeRoot(process.env.MICRONAUT_DOCS_ROOT || "/latest");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function expectConvertedGeneratedSnippets(
  page: Page,
  {
    language,
    requireDependency,
    requireProperties,
  }: {
    language: string;
    requireDependency: boolean;
    requireProperties: boolean;
  },
): Promise<void> {
  const root = page.locator("[data-generated-docs]");
  await expect(root).toBeVisible();

  const codeSnippets = root.locator(".docs-code-snippet-template");
  await expect(codeSnippets.first()).toBeVisible();
  await expect(
    codeSnippets.locator(`button[data-lang="${language}"]`).first(),
  ).toBeVisible();
  await expect(
    root.locator("[data-copy-active-snippet]").first(),
  ).toBeVisible();
  await expect(root.locator(".docs-code-callouts").first()).toBeVisible();
  await expect(root.locator(".listingblock")).toHaveCount(0);
  await expect(
    root.locator(".literalblock pre").filter({ hasText: /^\[source,/ }),
  ).toHaveCount(0);

  if (requireProperties) {
    await expect(
      root.locator(".docs-properties-template").first(),
    ).toBeVisible();
  }
  if (requireDependency) {
    await expect(
      root.locator(".docs-dependency-template").first(),
    ).toBeVisible();
  }
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectElementInsideViewport(
  page: Page,
  selector: string,
): Promise<void> {
  const box = await page.locator(selector).first().boundingBox();
  const viewport = page.viewportSize();
  assertBox(box, selector);
  expect(viewport).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual((viewport?.width || 0) + 1);
}

async function expectElementsDoNotOverlap(
  page: Page,
  leftSelector: string,
  rightSelector: string,
): Promise<void> {
  const left = await page.locator(leftSelector).first().boundingBox();
  const right = await page.locator(rightSelector).first().boundingBox();
  assertBox(left, leftSelector);
  assertBox(right, rightSelector);
  expect(left.x + left.width).toBeLessThanOrEqual(right.x + 8);
}

async function expectTopHeaderPinned(page: Page): Promise<void> {
  const banner = page.getByRole("banner");
  await expect(banner).toBeVisible();
  await expect
    .poll(async () => Math.round((await banner.boundingBox())?.y ?? -1))
    .toBe(0);
}

async function expectDocsLinkActive(
  link: Locator,
  active: boolean,
): Promise<void> {
  await expect(link).toHaveAttribute("data-active", active ? "true" : "false");
  if (active) {
    await expect(link).toHaveClass(/(^|\s)active(\s|$)/);
    await expect(link).toHaveAttribute("aria-current", "location");
    return;
  }
  await expect(link).not.toHaveClass(/(^|\s)active(\s|$)/);
  await expect(link).not.toHaveAttribute("aria-current", "location");
}

async function clickAndExpectProjectSections({
  container,
  link,
  sections,
  expanded,
}: {
  container: Locator;
  link: Locator;
  sections: Locator;
  expanded: boolean;
}): Promise<void> {
  await link.click();
  await expect(container).toBeVisible();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("aria-expanded", String(expanded));
  if (expanded) {
    await expect(sections).toBeVisible();
    return;
  }
  await expect(sections).toBeHidden();
}

async function scrollToGeneratedHeading(
  page: Page,
  headingName: string,
): Promise<void> {
  await page.evaluate((name) => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-generated-docs] h1, [data-generated-docs] h2, [data-generated-docs] h3, [data-generated-docs] h4, [data-generated-docs] h5, [data-generated-docs] h6",
      ),
    );
    const heading = headings.find(
      (element) => element.textContent?.replace(/\s+/g, " ").trim() === name,
    );
    if (heading) {
      const targetTop = heading.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(targetTop - 160, 0),
      });
    }
  }, headingName);
}

function assertBox(
  box: Awaited<ReturnType<ReturnType<Page["locator"]>["boundingBox"]>>,
  selector: string,
): asserts box is NonNullable<typeof box> {
  expect(box, `${selector} should have a layout box`).not.toBeNull();
}

function appPath(path: string): string {
  const basePath = normalizeBasePath(
    process.env.PLAYWRIGHT_BASE_PATH || process.env.ASTRO_BASE,
  );
  if (path === "/") {
    return basePath;
  }
  return `${basePath}${path.replace(/^\/+/, "")}`;
}

function normalizeBasePath(path: string | undefined): string {
  if (!path || path === "/") {
    return "/";
  }
  const absolutePath = path.startsWith("/") ? path : `/${path}`;
  return absolutePath.endsWith("/") ? absolutePath : `${absolutePath}/`;
}

function normalizeRoot(path: string): string {
  const absolutePath = path.startsWith("/") ? path : `/${path}`;
  if (absolutePath === "/") {
    return "/";
  }
  return absolutePath.endsWith("/") ? absolutePath : `${absolutePath}/`;
}
