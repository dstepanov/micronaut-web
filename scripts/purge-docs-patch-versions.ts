import { promises as fs, type Dirent } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseArgs, stringArg } from "./shared/cli.ts";

if (isMainModule()) {
  const options = parseArgs(process.argv.slice(2));
  await purgeDocsPatchVersions({
    publishedDirectory:
      stringArg(options.publishedDir) || process.env.PUBLISHED_DOCS_DIR,
    version: stringArg(options.version) || process.env.MICRONAUT_DOCS_VERSION,
  });
}

export async function purgeDocsPatchVersions({
  publishedDirectory,
  version,
}: {
  publishedDirectory?: string;
  version?: string;
}): Promise<string[]> {
  if (!publishedDirectory) {
    throw new Error("Expected --published-dir or PUBLISHED_DOCS_DIR.");
  }
  const release = parsePatchRelease(version);
  let entries: Dirent[];
  try {
    entries = await fs.readdir(publishedDirectory, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const removed: string[] = [];
  for (const entry of entries) {
    const entryVersion = versionFromPublishedEntry(entry.name, entry.isFile());
    if (!entryVersion || !isSupersededPatch(entryVersion, release)) {
      continue;
    }
    await fs.rm(path.join(publishedDirectory, entry.name), {
      recursive: entry.isDirectory(),
      force: true,
    });
    removed.push(entry.name);
  }
  return removed.sort();
}

function parsePatchRelease(version?: string) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version || "");
  if (!match) {
    throw new Error(
      `Expected a major.minor.patch release version; received ${JSON.stringify(version)}.`,
    );
  }
  return {
    version: version as string,
    major: match[1],
    minor: match[2],
    patch: Number(match[3]),
  };
}

function versionFromPublishedEntry(name: string, isFile: boolean) {
  const version = isFile && name.endsWith(".html") ? name.slice(0, -5) : name;
  return /^\d+\.\d+\.\d+$/.test(version) ? version : undefined;
}

/**
 * Only patches strictly older than the release being published are superseded.
 * Publishing an older patch must never delete a newer one, so a replayed or
 * re-dispatched release event cannot destroy published docs.
 */
function isSupersededPatch(
  version: string,
  release: { major: string; minor: string; patch: number },
) {
  const [major, minor, patch] = version.split(".");
  return (
    major === release.major &&
    minor === release.minor &&
    Number(patch) < release.patch
  );
}

function isMainModule() {
  return process.argv[1]
    ? import.meta.url === pathToFileURL(process.argv[1]).href
    : false;
}
