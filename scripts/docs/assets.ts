import { promises as fs } from "node:fs";
import path from "node:path";

import type { DocsProject } from "./project-manifest.ts";
import { isDirectory } from "../shared/files.ts";

export async function copyProjectImageAssets(
  project: DocsProject,
  docsDirectory: string,
  generatedDocsDirectory: string,
): Promise<void> {
  const sourceDirectory = path.join(
    docsDirectory,
    project.submodulePath,
    "src",
    "main",
    "docs",
    "resources",
    "img",
  );
  if (!(await isDirectory(sourceDirectory))) {
    return;
  }
  const targetDirectory = path.join(
    generatedDocsDirectory,
    "assets",
    project.slug,
    "docs",
    "img",
  );
  await fs.mkdir(path.dirname(targetDirectory), { recursive: true });
  await fs.cp(sourceDirectory, targetDirectory, { recursive: true });
}
