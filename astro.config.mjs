import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";
import { resolveDeploymentSettings } from "./src/lib/deployment-defaults.ts";

const base = process.env.ASTRO_BASE || "/";
const deploymentConfig = resolveDeploymentSettings(process.env);

export default defineConfig({
  base,
  site: deploymentConfig.site,
  build: {
    inlineStylesheets: "never",
  },
  devToolbar: {
    enabled: true,
  },
  integrations: [react()],
  output: "static",
  trailingSlash: "ignore",
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },
    define: {
      __MICRONAUT_DEPLOYMENT__: JSON.stringify(deploymentConfig),
      "import.meta.env.MICRONAUT_DEPLOY_SURFACE": JSON.stringify(
        deploymentConfig.deploySurface,
      ),
      "import.meta.env.MICRONAUT_DOCS_ROOT": JSON.stringify(
        deploymentConfig.docsRoot,
      ),
      "import.meta.env.MICRONAUT_DOCS_LATEST_ROOT": JSON.stringify(
        deploymentConfig.docsLatestRoot,
      ),
      "import.meta.env.MICRONAUT_GUIDES_ROOT": JSON.stringify(
        deploymentConfig.guidesRoot,
      ),
      "import.meta.env.MICRONAUT_GUIDES_LATEST_ROOT": JSON.stringify(
        deploymentConfig.guidesLatestRoot,
      ),
      "import.meta.env.DEFAULT_GITHUB_PAGES_ORIGIN": JSON.stringify(
        process.env.DEFAULT_GITHUB_PAGES_ORIGIN ||
          deploymentConfig.githubPagesOrigin,
      ),
      "import.meta.env.MICRONAUT_GITHUB_PAGES_ORIGIN": JSON.stringify(
        deploymentConfig.githubPagesOrigin,
      ),
      "import.meta.env.MICRONAUT_MAIN_SITE_URL": JSON.stringify(
        deploymentConfig.mainSiteUrl,
      ),
      "import.meta.env.MICRONAUT_DOCS_SITE_URL": JSON.stringify(
        deploymentConfig.docsSiteUrl,
      ),
      "import.meta.env.MICRONAUT_GUIDES_SITE_URL": JSON.stringify(
        deploymentConfig.guidesSiteUrl,
      ),
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
