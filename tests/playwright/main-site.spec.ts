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
      /\/micronaut-docs-v2\/latest\/$/,
    );
    await expectMobileDestinationHref(
      page,
      "Guides",
      /\/micronaut-guides-v2\/$/,
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

test("desktop navigation links directly to the blog", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(appPath("/"));

  await expect(
    page.locator("header").getByRole("link", { name: "Blog" }),
  ).toHaveAttribute("href", /\/blog\/$/);
});

test("main-site runtime scripts do not include build-time content processors", async ({
  page,
}) => {
  const runtimeScripts = collectRuntimeScriptAssertions(page);
  const failures = collectBrowserFailures(page);

  await page.goto(appPath("/"));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoForbiddenRuntimeLibraries(runtimeScripts);

  await expectNoForbiddenRuntimeLibraries(runtimeScripts);
  expect(failures).toEqual([]);
});

test("homepage code examples include a Python variant", async ({ page }) => {
  await page.goto(appPath("/"));

  const pythonTab = page
    .locator('[role="tab"][data-lang="python"]')
    .first();
  await expect(pythonTab).toHaveText("Python");
  await pythonTab.click();
  await expect(page.locator('code[data-lang="python"]')).toContainText(
    'from micronaut.http.annotation import Get',
  );
});

test("download page updates the release links from GitHub's latest release", async ({ page }) => {
  await page.route("https://api.github.com/repos/micronaut-projects/micronaut-starter/releases/latest", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        tag_name: "v5.2.0",
        html_url: "https://github.com/micronaut-projects/micronaut-starter/releases/tag/v5.2.0",
        assets: [{
          name: "micronaut-cli-5.2.0.zip",
          browser_download_url: "https://github.com/micronaut-projects/micronaut-starter/releases/download/v5.2.0/micronaut-cli-5.2.0.zip"
        }]
      })
    });
  });

  await page.goto(appPath("/download/"));

  await expect(page.locator("[data-micronaut-download-version]")).toHaveText("v5.2.0");
  await expect(page.locator("[data-micronaut-release-notes]")).toHaveAttribute(
    "href",
    "https://github.com/micronaut-projects/micronaut-starter/releases/tag/v5.2.0"
  );
  await expect(page.locator("[data-micronaut-download-binary]")).toHaveAttribute(
    "href",
    "https://github.com/micronaut-projects/micronaut-starter/releases/download/v5.2.0/micronaut-cli-5.2.0.zip"
  );
});

test("GraalVM startup diagram stacks complete steps on narrow viewports", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 860 });
  await page.goto(appPath("/"));

  const diagram = page.locator("[data-graalvm-startup-diagram]");
  const compileStep = diagram.locator('[data-graalvm-startup-step="compile"]');
  const nativeImageStep = diagram.locator(
    '[data-graalvm-startup-step="native-image"]',
  );

  await expect(nativeImageStep).toHaveText("Native image");
  const [compileBox, nativeImageBox] = await Promise.all([
    compileStep.boundingBox(),
    nativeImageStep.boundingBox(),
  ]);

  expect(compileBox).not.toBeNull();
  expect(nativeImageBox).not.toBeNull();
  expect(nativeImageBox!.x).toBe(compileBox!.x);
  expect(nativeImageBox!.height).toBe(compileBox!.height);
});

test("footer exposes social and contact links as labelled icons", async ({
  page,
}) => {
  await page.goto(appPath("/"));

  const socialLinks = page.getByRole("navigation", {
    name: "Micronaut social links",
  });
  await expect(socialLinks.getByRole("link", { name: "Email" })).toHaveAttribute(
    "href",
    "mailto:info@micronaut.io",
  );
  await expect(
    socialLinks.getByRole("link", { name: "GitHub" }),
  ).toHaveAttribute("href", "https://github.com/micronaut-projects");
  await expect(
    socialLinks.getByRole("link", { name: "Discord" }),
  ).toHaveAttribute("href", "https://discord.com/invite/9xRFsHv98T");
  await expect(socialLinks.getByRole("link", { name: "X" })).toHaveAttribute(
    "href",
    "https://x.com/micronautfw",
  );
  await expect(
    socialLinks.getByRole("link", { name: "BlueSky" }),
  ).toHaveAttribute("href", "https://bsky.app/profile/micronautfw.bsky.social");
  await expect(
    socialLinks.getByRole("link", { name: "YouTube" }),
  ).toHaveAttribute("href", "https://www.youtube.com/@MicronautFramework");
});

async function expectPrimaryMobileLinks(page: Page): Promise<void> {
  await expectSiteHeaderHydrated(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  const dialog = page.getByRole("dialog", { name: "Micronaut" });
  await expect(dialog).toBeVisible();

  const browseLinks = dialog.locator('[data-mobile-navigation-group="Browse"]');
  await expect(browseLinks.getByRole("link", { name: "Docs" })).toHaveAttribute(
    "href",
    deploySurface === "main" ? /\/micronaut-docs-v2\/latest\/$/ : /\/docs\/$/,
  );
  await expect(
    browseLinks.getByRole("link", { name: "Guides" }),
  ).toHaveAttribute(
    "href",
    deploySurface === "main"
      ? /\/micronaut-guides-v2\/$/
      : /\/guides\/$/,
  );
  await expect(browseLinks.getByRole("link", { name: "Blog" })).toHaveAttribute(
    "href",
    /\/blog\/$/,
  );
  await expect(
    browseLinks.getByRole("link", { name: "Launch" }),
  ).toHaveAttribute("href", "https://launch.micronaut.io");

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
  await expect
    .poll(async () => {
      try {
        return await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Execution context was destroyed")
        ) {
          return Number.MAX_SAFE_INTEGER;
        }
        throw error;
      }
    })
    .toBeLessThanOrEqual(1);
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
