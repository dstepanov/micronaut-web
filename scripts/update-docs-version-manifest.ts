import { promises as fs } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseArgs, stringArg } from "./shared/cli.ts";

export type DocsVersionOption = {
  label: string;
  href: string;
  current?: boolean;
};

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

if (isMainModule()) {
  const options = parseArgs(process.argv.slice(2));
  await updateDocsVersionManifest({
    manifestFile:
      stringArg(options.manifest) ||
      path.join(projectDirectory, "src", "data", "docs-versions.json"),
    publishedDirectory:
      stringArg(options.publishedDir) || process.env.PUBLISHED_DOCS_DIR,
    version: stringArg(options.version) || process.env.MICRONAUT_DOCS_VERSION,
    latest: stringArg(options.latest) !== "false",
  });
}

export async function updateDocsVersionManifest({
  manifestFile,
  publishedDirectory,
  version,
  latest = true,
}: {
  manifestFile: string;
  publishedDirectory?: string;
  version?: string;
  latest?: boolean;
}): Promise<DocsVersionOption[]> {
  const versions = new Map<string, string>();
  if (publishedDirectory) {
    for (const option of await readPublishedVersions(publishedDirectory)) {
      versions.set(option.label, option.href);
    }
  }
  if (version && version !== "latest") {
    versions.set(version, `/${version}/`);
  }

  const options: DocsVersionOption[] = [
    {
      label: "Latest",
      href: "/latest/",
      current: latest,
    },
    ...Array.from(versions.entries())
      .sort(([left], [right]) => compareVersions(right, left))
      .map(([label, href]) => ({ label, href })),
  ];

  await fs.mkdir(path.dirname(manifestFile), { recursive: true });
  await fs.writeFile(
    manifestFile,
    `${JSON.stringify({ versions: options }, null, 2)}\n`,
    "utf8",
  );
  return options;
}

export async function readPublishedVersions(
  publishedDirectory: string,
): Promise<DocsVersionOption[]> {
  let entries: Dirent[];
  try {
    entries = await fs.readdir(publishedDirectory, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const versions = new Map<string, string>();
  for (const entry of entries) {
    if (entry.isDirectory() && isVersion(entry.name)) {
      versions.set(entry.name, `/${entry.name}/`);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      const version = entry.name.slice(0, -".html".length);
      if (isVersion(version) && !versions.has(version)) {
        versions.set(version, `/${entry.name}`);
      }
    }
  }

  return Array.from(versions.entries()).map(([label, href]) => ({
    label,
    href,
  }));
}

function compareVersions(left: string, right: string) {
  const leftParts = versionParts(left);
  const rightParts = versionParts(right);
  for (
    let index = 0;
    index < Math.max(leftParts.length, rightParts.length);
    index += 1
  ) {
    const diff = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return left.localeCompare(right);
}

function versionParts(version: string) {
  return version.split(".").map((part) => Number.parseInt(part, 10) || 0);
}

function isVersion(value: string) {
  return /^\d+\.\d+(?:\.\d+)?(?:[-.][A-Za-z0-9]+)?$/.test(value);
}

function isMainModule() {
  return process.argv[1]
    ? import.meta.url === pathToFileURL(process.argv[1]).href
    : false;
}
