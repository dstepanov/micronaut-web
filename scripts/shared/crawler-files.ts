import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * robots.txt and the sitemap are written to the build root, outside the surface
 * subtree that pruning and publishing rebuild, so they have to be carried over
 * by name. The sitemap is split into `sitemap-0.xml`, `sitemap-1.xml`, ... once
 * a surface grows past one file, hence the prefix match.
 */
export async function crawlerFileNames(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory);
  return entries.filter(
    (entry) => entry === "robots.txt" || /^sitemap.*\.xml$/.test(entry),
  );
}

export async function copyCrawlerFiles(
  sourceDirectory: string,
  targetDirectory: string,
): Promise<void> {
  const names = await crawlerFileNames(sourceDirectory);
  await Promise.all(
    names.map((name) =>
      fs.copyFile(
        path.join(sourceDirectory, name),
        path.join(targetDirectory, name),
      ),
    ),
  );
}
