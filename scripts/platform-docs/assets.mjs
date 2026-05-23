import { promises as fs } from "node:fs";
import path from "node:path";

import { isDirectory } from "./files.mjs";

export async function copyProjectImageAssets(project, platformDocsDirectory, publicDirectory) {
  const sourceDirectory = path.join(platformDocsDirectory, project.submodulePath, "src", "main", "docs", "resources", "img");
  if (!(await isDirectory(sourceDirectory))) {
    return;
  }
  const targetDirectory = path.join(publicDirectory, "assets", project.slug, "docs", "img");
  await fs.mkdir(path.dirname(targetDirectory), { recursive: true });
  await fs.cp(sourceDirectory, targetDirectory, { recursive: true });
}
