import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";

import {
  resolveDeploymentSettings,
  type DeploySurface,
} from "../src/lib/deployment-defaults.ts";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const deploySurface = (process.env.MICRONAUT_DEPLOY_SURFACE ||
  "all") as DeploySurface;

if (deploySurface === "all" || deploySurface === "main") {
  await buildSiteHeaderShell();
} else {
  console.log(
    `Skipping shared site header shell for ${deploySurface} surface.`,
  );
}

async function buildSiteHeaderShell(): Promise<void> {
  const distDirectory = path.join(projectDirectory, "dist", "shell");
  await fs.mkdir(distDirectory, { recursive: true });

  await build({
    base: process.env.ASTRO_BASE || "/",
    configFile: false,
    define: deploymentDefines(),
    logLevel: "error",
    resolve: {
      alias: {
        "@": path.join(projectDirectory, "src"),
      },
    },
    build: {
      emptyOutDir: false,
      lib: {
        entry: path.join(
          projectDirectory,
          "src",
          "components",
          "web",
          "site-header-shell.tsx",
        ),
        fileName: () => "site-header.js",
        formats: ["es"],
      },
      outDir: distDirectory,
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === "MODULE_LEVEL_DIRECTIVE" &&
            warning.message.includes('"use client"')
          ) {
            return;
          }
          warn(warning);
        },
        output: {
          assetFileNames: (assetInfo) =>
            assetInfo.name?.endsWith(".css")
              ? "site-header.css"
              : "[name][extname]",
        },
      },
      sourcemap: false,
    },
  });
}

function deploymentDefines(): Record<string, string> {
  const deployment = resolveDeploymentSettings(process.env);
  return {
    __MICRONAUT_DEPLOYMENT__: JSON.stringify(deployment),
    "process.env.NODE_ENV": JSON.stringify("production"),
    "import.meta.env.MICRONAUT_DEPLOY_SURFACE": JSON.stringify(
      deployment.deploySurface,
    ),
    "import.meta.env.MICRONAUT_DOCS_ROOT": JSON.stringify(deployment.docsRoot),
    "import.meta.env.MICRONAUT_DOCS_LATEST_ROOT": JSON.stringify(
      deployment.docsLatestRoot,
    ),
    "import.meta.env.MICRONAUT_GUIDES_ROOT": JSON.stringify(
      deployment.guidesRoot,
    ),
    "import.meta.env.MICRONAUT_GUIDES_LATEST_ROOT": JSON.stringify(
      deployment.guidesLatestRoot,
    ),
    "import.meta.env.DEFAULT_GITHUB_PAGES_ORIGIN": JSON.stringify(
      process.env.DEFAULT_GITHUB_PAGES_ORIGIN || deployment.githubPagesOrigin,
    ),
    "import.meta.env.MICRONAUT_GITHUB_PAGES_ORIGIN": JSON.stringify(
      deployment.githubPagesOrigin,
    ),
    "import.meta.env.MICRONAUT_MAIN_SITE_URL": JSON.stringify(
      deployment.mainSiteUrl,
    ),
    "import.meta.env.MICRONAUT_DOCS_SITE_URL": JSON.stringify(
      deployment.docsSiteUrl,
    ),
    "import.meta.env.MICRONAUT_GUIDES_SITE_URL": JSON.stringify(
      deployment.guidesSiteUrl,
    ),
  };
}
