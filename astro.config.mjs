import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { closeSync, openSync, readSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  deploymentDefines,
  resolveDeploymentSettings,
} from "./src/lib/deployment-defaults.ts";
import { routeForSurface } from "./src/lib/deployment-config.ts";

const base = process.env.ASTRO_BASE || "/";
const deploymentConfig = resolveDeploymentSettings(process.env);
const deploySurface = deploymentConfig.deploySurface;

/**
 * A build always renders every surface and `prune-surface.ts` then keeps one of
 * them, so the sitemap has to list the pages that survive pruning, at the paths
 * they are served from. Compatibility endpoints under /latest/ are excluded:
 * they redirect to the canonical routes already listed here.
 */
function sitemapPath(pageUrl) {
  const { pathname } = new URL(pageUrl);
  if (!pathname.endsWith("/")) {
    return undefined;
  }
  const routePath =
    base !== "/" && pathname.startsWith(base)
      ? `/${pathname.slice(base.length)}`
      : pathname;
  const isDocs = routePath === "/docs/" || routePath.startsWith("/docs/");
  const isGuides = routePath === "/guides/" || routePath.startsWith("/guides/");
  if (routePath === "/latest/" || routePath.startsWith("/latest/")) {
    return undefined;
  }
  if (deploySurface === "docs") {
    return isDocs ? routePath : undefined;
  }
  if (deploySurface === "guides") {
    return isGuides ? routePath : undefined;
  }
  if (deploySurface === "main") {
    return isDocs || isGuides ? undefined : routePath;
  }
  return routePath;
}

const outDirectory = fileURLToPath(new URL("./dist/", import.meta.url));

/**
 * The sitemap is written after the pages are, so whether a page asked to stay
 * out of search results is read back from the build. That covers the refresh
 * stubs Astro emits for `Astro.redirect()` as well as pages passing `noindex`
 * to WebLayout; both carry a robots meta in the first bytes of the document.
 */
function isIndexablePage(routePath) {
  const file = path.join(
    outDirectory,
    ...routePath.split("/").filter(Boolean),
    "index.html",
  );
  let handle;
  try {
    handle = openSync(file, "r");
  } catch {
    return true;
  }
  try {
    const buffer = Buffer.alloc(1024);
    const read = readSync(handle, buffer, 0, buffer.length, 0);
    return !/<meta[^>]+name="robots"[^>]+noindex/i.test(
      buffer.toString("utf8", 0, read),
    );
  } finally {
    closeSync(handle);
  }
}

function sitemapUrl(pageUrl) {
  const surface = deploySurface === "all" ? "main" : deploySurface;
  const route = routeForSurface(surface, sitemapPath(pageUrl));
  return new URL(
    `${base}${route.replace(/^\/+/, "")}`,
    deploymentConfig.site,
  ).toString();
}

export default defineConfig({
  base,
  site: deploymentConfig.site,
  build: {
    inlineStylesheets: "never",
  },
  devToolbar: {
    enabled: true,
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const routePath = sitemapPath(page);
        return routePath !== undefined && isIndexablePage(routePath);
      },
      serialize: (item) => ({ ...item, url: sitemapUrl(item.url) }),
    }),
  ],
  output: "static",
  trailingSlash: "ignore",
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },
    define: deploymentDefines(deploymentConfig, process.env),
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
