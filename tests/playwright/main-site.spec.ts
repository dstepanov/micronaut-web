import { expect, test, type Page } from "@playwright/test";
import {
  collectRuntimeScriptAssertions,
  expectNoForbiddenRuntimeLibraries,
} from "./runtime-script-assertions";

const deploySurface = process.env.MICRONAUT_DEPLOY_SURFACE;

test("collapsed mobile navigation exposes primary destinations", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);

  await page.setViewportSize({ width: 390, height: 860 });
  await page.goto(appPath("/"));

  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectPrimaryMobileLinks(page);
  expect(failures).toEqual([]);
});

test("tablet navigation stays collapsed and can select docs, guides, and blog", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);

  await page.setViewportSize({ width: 820, height: 900 });
  await page.goto(appPath("/"));

  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  if (deploySurface === "main") {
    await expectMobileDestinationHref(
      page,
      "Docs",
      /\/micronaut-docs\/latest\/$/,
    );
    await expectMobileDestinationHref(
      page,
      "Guides",
      /\/micronaut-guides\/latest\/$/,
    );
  } else {
    await openMobileDestination(page, "Docs", /\/docs\/$/);
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await openMobileDestination(page, "Guides", /\/guides\/$/);
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }

  await openMobileDestination(page, "Blog", /\/blog\/$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Micronaut Blog" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);
});

test("main-site runtime scripts do not include build-time content processors", async ({
  page,
}) => {
  const runtimeScripts = collectRuntimeScriptAssertions(page);
  const failures = collectBrowserFailures(page);

  await page.goto(appPath("/"));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto(appPath("/launch/"));
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Build a Micronaut project",
    }),
  ).toBeVisible();

  await expectNoForbiddenRuntimeLibraries(runtimeScripts);
  expect(failures).toEqual([]);
});

async function expectPrimaryMobileLinks(page: Page): Promise<void> {
  await expectSiteHeaderHydrated(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  const dialog = page.getByRole("dialog", { name: "Micronaut" });
  await expect(dialog).toBeVisible();

  const browseLinks = dialog.locator('[data-mobile-navigation-group="Browse"]');
  await expect(browseLinks.getByRole("link", { name: "Docs" })).toHaveAttribute(
    "href",
    deploySurface === "main" ? /\/micronaut-docs\/latest\/$/ : /\/docs\/$/,
  );
  await expect(
    browseLinks.getByRole("link", { name: "Guides" }),
  ).toHaveAttribute(
    "href",
    deploySurface === "main" ? /\/micronaut-guides\/latest\/$/ : /\/guides\/$/,
  );
  await expect(browseLinks.getByRole("link", { name: "Blog" })).toHaveAttribute(
    "href",
    /\/blog\/$/,
  );
  await expect(
    browseLinks.getByRole("link", { name: "Launch" }),
  ).toHaveAttribute("href", /\/launch\/$/);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
}

async function expectMobileDestinationHref(
  page: Page,
  label: string,
  expectedHref: RegExp,
): Promise<void> {
  await expectSiteHeaderHydrated(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  const dialog = page.getByRole("dialog", { name: "Micronaut" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog
      .locator('[data-mobile-navigation-group="Browse"]')
      .getByRole("link", { name: label }),
  ).toHaveAttribute("href", expectedHref);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
}

async function openMobileDestination(
  page: Page,
  label: string,
  expectedUrl: RegExp,
): Promise<void> {
  await expectSiteHeaderHydrated(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  const dialog = page.getByRole("dialog", { name: "Micronaut" });
  await expect(dialog).toBeVisible();
  await dialog
    .locator('[data-mobile-navigation-group="Browse"]')
    .getByRole("link", { name: label })
    .click();
  await expect(page).toHaveURL(expectedUrl);
}

async function expectSiteHeaderHydrated(page: Page): Promise<void> {
  const headerIsland = page.locator(
    'astro-island[component-export="SiteHeader"]',
  );
  await expect(headerIsland).toBeVisible();
  await expect
    .poll(() =>
      headerIsland.evaluate((element) => !element.hasAttribute("ssr")),
    )
    .toBe(true);
}

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

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
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
