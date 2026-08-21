const port = Number(process.env.LHCI_PORT || 4400);
const host = `http://127.0.0.1:${port}`;
const surface = process.env.MICRONAUT_DEPLOY_SURFACE || "main";

const surfacePaths = {
  main: ["/micronaut-web/"],
  docs: [
    "/micronaut-docs-v2/latest/",
    "/micronaut-docs-v2/latest/core/",
    "/micronaut-docs-v2/latest/data/",
    "/micronaut-docs-v2/latest/oracle-cloud/",
  ],
  guides: [
    "/micronaut-guides-v2/",
    "/micronaut-guides-v2/micronaut-http-client-gradle-java/",
    "/micronaut-guides-v2/micronaut-data-jdbc-repository-gradle-java/",
  ],
};

const surfaceBases = {
  main: "/micronaut-web/",
  docs: "/micronaut-docs-v2/",
  guides: "/micronaut-guides-v2/",
};

if (!(surface in surfacePaths)) {
  throw new Error(`Unsupported Lighthouse CI surface: ${surface}`);
}

const urls =
  process.env.LHCI_URLS?.split(",").filter(Boolean) ||
  surfacePaths[surface].flatMap((path) =>
    ["light", "dark"].map((theme) => `${host}${path}?theme=${theme}`),
  );

module.exports = {
  ci: {
    collect: {
      startServerCommand: `ASTRO_BASE=${surfaceBases[surface]} PLAYWRIGHT_PORT=${port} node scripts/serve-static.ts`,
      startServerReadyPattern: "Serving",
      startServerReadyTimeout: 30_000,
      url: urls,
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.6 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
