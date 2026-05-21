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
  trailingSlash: "always",
  vite: {
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"]
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    }
  }
});
