import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_GITHUB_PAGES_ORIGIN,
  githubPagesProjectUrl,
  normalizedExternalOrigin
} from "./src/lib/deployment-defaults.ts";

const base = process.env.ASTRO_BASE || "/";
const deploySurface = process.env.MICRONAUT_DEPLOY_SURFACE || "all";
const docsRoot =
  process.env.MICRONAUT_DOCS_ROOT || (deploySurface === "docs" ? "/latest" : "/docs");
const docsLatestRoot =
  process.env.MICRONAUT_DOCS_LATEST_ROOT ||
  (deploySurface === "docs" ? "/latest" : docsRoot);
const guidesRoot =
  process.env.MICRONAUT_GUIDES_ROOT ||
  (deploySurface === "guides" ? "/latest" : "/guides");
const guidesLatestRoot =
  process.env.MICRONAUT_GUIDES_LATEST_ROOT || "/latest";
const defaultGithubPagesOrigin =
  process.env.DEFAULT_GITHUB_PAGES_ORIGIN || DEFAULT_GITHUB_PAGES_ORIGIN;
const githubPagesOrigin = normalizedExternalOrigin(
  process.env.MICRONAUT_GITHUB_PAGES_ORIGIN || defaultGithubPagesOrigin
);
const mainSiteUrl =
  process.env.MICRONAUT_MAIN_SITE_URL ||
  githubPagesProjectUrl(githubPagesOrigin, "micronaut-web");
const docsSiteUrl =
  process.env.MICRONAUT_DOCS_SITE_URL ||
  githubPagesProjectUrl(githubPagesOrigin, "micronaut-docs");
const guidesSiteUrl =
  process.env.MICRONAUT_GUIDES_SITE_URL ||
  githubPagesProjectUrl(githubPagesOrigin, "micronaut-guides");
const deploymentConfig = {
  deploySurface,
  docsRoot,
  docsLatestRoot,
  guidesRoot,
  guidesLatestRoot,
  githubPagesOrigin,
  mainSiteUrl,
  docsSiteUrl,
  guidesSiteUrl
};

export default defineConfig({
  base,
  devToolbar: {
    enabled: true
  },
  integrations: [react()],
  output: "static",
  trailingSlash: "ignore",
  vite: {
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"]
    },
    server: {
      proxy: {
        "/launch-preview-proxy": {
          target: "https://launch.micronaut.io",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/launch-preview-proxy/, "")
        }
      }
    },
    define: {
      __MICRONAUT_DEPLOYMENT__: JSON.stringify(deploymentConfig),
      "import.meta.env.MICRONAUT_DEPLOY_SURFACE": JSON.stringify(deploySurface),
      "import.meta.env.MICRONAUT_DOCS_ROOT": JSON.stringify(docsRoot),
      "import.meta.env.MICRONAUT_DOCS_LATEST_ROOT": JSON.stringify(docsLatestRoot),
      "import.meta.env.MICRONAUT_GUIDES_ROOT": JSON.stringify(guidesRoot),
      "import.meta.env.MICRONAUT_GUIDES_LATEST_ROOT": JSON.stringify(guidesLatestRoot),
      "import.meta.env.DEFAULT_GITHUB_PAGES_ORIGIN": JSON.stringify(defaultGithubPagesOrigin),
      "import.meta.env.MICRONAUT_GITHUB_PAGES_ORIGIN": JSON.stringify(githubPagesOrigin),
      "import.meta.env.MICRONAUT_MAIN_SITE_URL": JSON.stringify(mainSiteUrl),
      "import.meta.env.MICRONAUT_DOCS_SITE_URL": JSON.stringify(docsSiteUrl),
      "import.meta.env.MICRONAUT_GUIDES_SITE_URL": JSON.stringify(guidesSiteUrl)
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    }
  }
});
