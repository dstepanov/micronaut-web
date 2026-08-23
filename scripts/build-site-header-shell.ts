import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";

import {
  deploymentDefines,
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
    define: siteHeaderDefines(),
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

function siteHeaderDefines(): Record<string, string> {
  return {
    ...deploymentDefines(resolveDeploymentSettings(process.env), process.env),
    "process.env.NODE_ENV": JSON.stringify("production"),
  };
}
