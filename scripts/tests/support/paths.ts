import path from "node:path";
import { fileURLToPath } from "node:url";

export const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

export const asciidocFixtureDirectory = path.join(
  projectDirectory,
  "scripts",
  "tests",
  "asciidoc",
  "fixtures",
);

export const guideMacroFixtureDirectory = path.join(
  asciidocFixtureDirectory,
  "guide-macros",
);
