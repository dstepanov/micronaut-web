import { expect, test, type Page } from "@playwright/test";

const docsProjects = [
  "Micronaut Core",
  "Micronaut Data",
  "Micronaut Serialization",
];

test("docs catalog lays out generated project cards", async ({ page }) => {
  const failures = collectBrowserFailures(page);

  await page.goto("/docs/");

  await expect(page.locator("[data-docs-shell]")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Playwright Fixtures" }),
  ).toBeVisible();

  const cards = page.locator('main [data-slot="card"]');
  await expect(cards).toHaveCount(docsProjects.length);
  for (const projectName of docsProjects) {
    const card = cards.filter({ hasText: projectName });
    await expect(card).toBeVisible();
    await expect(card.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      new RegExp(`/docs/${projectSlug(projectName)}/$`),
    );
  }

  await expectNoHorizontalOverflow(page);
  expect(failures).toEqual([]);
});

test("generated docs page renders desktop content and sidebars without overlap", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);

  await page.goto("/docs/core/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Micronaut Core" }),
  ).toBeVisible();
  await expect(page.locator("[data-generated-docs]")).toBeVisible();
  await expect(
    page.locator(".docs-code-snippet-template").first(),
  ).toBeVisible();
  await expect(page.locator(".docs-properties-template").first()).toBeVisible();

  const docsSidebar = page.locator("[data-docs-sidebar]");
  await expect(docsSidebar).toBeVisible();
  await expect(
    docsSidebar.getByRole("link", { name: "Micronaut Core" }),
  ).toHaveAttribute("aria-current", "page");

  const sectionNav = page.locator('aside[aria-label="In this section"]');
  await expect(sectionNav).toBeVisible();
  await expect(
    sectionNav.getByRole("link", { name: "1 Introduction" }),
  ).toBeVisible();
  await expect(
    sectionNav.getByRole("link", { name: "2 Configuration" }),
  ).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectElementInsideViewport(page, ".docs-code-snippet-template");
  await expectElementsDoNotOverlap(
    page,
    "[data-generated-docs]",
    'aside[aria-label="In this section"]',
  );
  expect(failures).toEqual([]);
});

test("generated docs page fits the mobile viewport", async ({ page }) => {
  const failures = collectBrowserFailures(page);
  await page.setViewportSize({ width: 390, height: 860 });

  await page.goto("/docs/data/");

  await expect(page.locator("[data-generated-docs]")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Micronaut Data" }),
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

function projectSlug(projectName: string): string {
  return projectName
    .replace(/^Micronaut\s+/i, "")
    .toLowerCase()
    .replace("serialization", "serde");
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

function assertBox(
  box: Awaited<ReturnType<ReturnType<Page["locator"]>["boundingBox"]>>,
  selector: string,
): asserts box is NonNullable<typeof box> {
  expect(box, `${selector} should have a layout box`).not.toBeNull();
}
