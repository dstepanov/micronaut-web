import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";

const base = process.env.ASTRO_BASE || "/";

export default defineConfig({
  base,
  devToolbar: {
    enabled: false
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
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    }
  }
});
