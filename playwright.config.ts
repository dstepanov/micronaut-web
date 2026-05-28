import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT || 4339);
const baseURL = `http://127.0.0.1:${port}`;
const webServerPath = normalizeBasePath(
  process.env.PLAYWRIGHT_BASE_PATH || process.env.ASTRO_BASE,
);

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
    command: `ASTRO_TELEMETRY_DISABLED=1 astro dev --host 127.0.0.1 --port ${port}`,
    url: `${baseURL}${webServerPath}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

function normalizeBasePath(path: string | undefined): string {
  if (!path || path === "/") {
    return "/";
  }
  const absolutePath = path.startsWith("/") ? path : `/${path}`;
  return absolutePath.endsWith("/") ? absolutePath : `${absolutePath}/`;
}
