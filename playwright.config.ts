import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT || 4339);
const baseURL = `http://127.0.0.1:${port}`;
const webServerPath = normalizeBasePath(
  process.env.PLAYWRIGHT_BASE_PATH || process.env.ASTRO_BASE,
);
const standaloneSurface = standalonePreviewSurface();
const webServerCommand = standaloneSurface
  ? `ASTRO_TELEMETRY_DISABLED=1 npx astro build && node scripts/prune-surface.ts --surface ${standaloneSurface} && node scripts/serve-static.ts`
  : `ASTRO_DEV_BACKGROUND=0 ASTRO_TELEMETRY_DISABLED=1 astro dev --host 127.0.0.1 --port ${port}`;

export default defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    viewport: {
      width: 1280,
      height: 1000,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: webServerCommand,
    url: `${baseURL}${webServerPath}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

function standalonePreviewSurface(): "docs" | "guides" | undefined {
  if (process.env.PLAYWRIGHT_STATIC_PREVIEW !== "true") {
    return undefined;
  }
  const surface = process.env.MICRONAUT_DEPLOY_SURFACE;
  if (surface === "docs" || surface === "guides") {
    return surface;
  }
  throw new Error(
    "PLAYWRIGHT_STATIC_PREVIEW requires MICRONAUT_DEPLOY_SURFACE=docs or guides.",
  );
}

function normalizeBasePath(path: string | undefined): string {
  if (!path || path === "/") {
    return "/";
  }
  const absolutePath = path.startsWith("/") ? path : `/${path}`;
  return absolutePath.endsWith("/") ? absolutePath : `${absolutePath}/`;
}
