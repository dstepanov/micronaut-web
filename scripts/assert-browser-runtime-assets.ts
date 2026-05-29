import path from "node:path";
import { fileURLToPath } from "node:url";

import { forbiddenBrowserRuntimeAssetMatches } from "./shared/browser-runtime-assets.ts";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distDirectory = path.join(projectDirectory, "dist");
const matches = await forbiddenBrowserRuntimeAssetMatches(distDirectory);

if (matches.length > 0) {
  throw new Error(
    [
      "Browser runtime assets contain build-time-only generated-content processors:",
      ...matches.map(
        (match) =>
          `- ${path.relative(projectDirectory, match.file)} contains ${match.label}`,
      ),
    ].join("\n"),
  );
}

console.log("Validated browser runtime assets.");
