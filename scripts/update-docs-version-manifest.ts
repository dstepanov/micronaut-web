import { promises as fs } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseArgs, stringArg } from "./shared/cli.ts";

export type DocsVersionOption = {
  label: string;
  href: string;
  release?: string;
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

/**
 * Docs are published once per release line: every 5.0 patch replaces the same
 * `/5.0.x/` tree, so a reader's bookmark survives patch releases and only has to
 * move when they follow a new minor.
 */
export function docsVersionLine(version: string): string {
  const match = /^(\d+)\.(\d+)(?:[.-]|$)/.exec(version);
  if (!match) {
    throw new Error(
      `Expected a Micronaut version such as 5.0.3; received ${JSON.stringify(version)}.`,
    );
  }
  return `${match[1]}.${match[2]}.x`;
}

export function isDocsVersionLine(value: string): boolean {
  return /^\d+\.\d+\.x$/.test(value);
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
  const options = await buildDocsVersionOptions({
    publishedDirectory,
    version,
    latest,
  });

  await fs.mkdir(path.dirname(manifestFile), { recursive: true });
  await fs.writeFile(
    manifestFile,
    `${JSON.stringify({ versions: options }, null, 2)}\n`,
    "utf8",
  );
  return options;
}

export async function buildDocsVersionOptions({
  publishedDirectory,
  version,
  latest = true,
}: {
  publishedDirectory?: string;
  version?: string;
  latest?: boolean;
}): Promise<DocsVersionOption[]> {
  // A line folder is named after the line, not the patch inside it, so the
  // release it was built from only survives in the manifest.
  const releases = await readPublishedReleases(publishedDirectory);
  const lines = new Map<string, string>();
  if (publishedDirectory) {
    for (const option of await readPublishedVersions(publishedDirectory)) {
      lines.set(option.label, option.href);
    }
  }
  const publishedLine =
    version && version !== "latest" ? docsVersionLine(version) : undefined;
  if (publishedLine && version) {
    lines.set(publishedLine, `/${publishedLine}/`);
    releases.set(publishedLine, version);
  }

  // `/5.0.x/` is where the docs live, but it is not what a reader wants to be
  // told they are reading, so the selector names the release the line was built
  // from. A line published before the manifest recorded that falls back to its
  // own name.
  const displayed = (line: string) => releases.get(line) || line;
  const sortedLines = Array.from(lines.entries()).sort(([left], [right]) =>
    compareVersions(displayed(right), displayed(left)),
  );
  const latestLine =
    latest && publishedLine
      ? publishedLine
      : (await readExistingLatestLine(publishedDirectory)) ||
        sortedLines[0]?.[0];

  return [
    {
      label: latestLine ? `Latest (${displayed(latestLine)})` : "Latest",
      href: "/latest/",
      ...releaseFields(releases, latestLine),
      ...(latest ? { current: true } : {}),
    },
    // The entry above already names the latest release, so listing its pinned
    // line root again showed the same number twice in the selector.
    ...sortedLines
      .filter(([line]) => line !== latestLine)
      .map(([line, href]) => ({
        label: displayed(line),
        href,
        ...releaseFields(releases, line),
      })),
  ];
}

export async function isNewestPublishedDocsVersion({
  publishedDirectory,
  version,
}: {
  publishedDirectory: string;
  version: string;
}): Promise<boolean> {
  const releases = await readPublishedReleases(publishedDirectory);
  return !(await readPublishedVersions(publishedDirectory)).some(
    (published) =>
      compareVersions(
        releases.get(published.label) || published.label,
        version,
      ) > 0,
  );
}

/**
 * A line folder is replaced wholesale on every publish, so a replayed or
 * re-dispatched release event for an older patch would silently downgrade the
 * published docs. Returns the newer release the line already serves, if any, so
 * the caller can refuse.
 */
export async function supersedingDocsLineRelease({
  publishedDirectory,
  version,
}: {
  publishedDirectory: string;
  version: string;
}): Promise<string | undefined> {
  const releases = await readPublishedReleases(publishedDirectory);
  const release = releases.get(docsVersionLine(version));
  return release && compareVersions(release, version) > 0 ? release : undefined;
}

function releaseFields(releases: Map<string, string>, label?: string) {
  const release = label ? releases.get(label) : undefined;
  return release ? { release } : {};
}

async function readPublishedVersions(
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

  return (
    Array.from(versions.entries())
      // Publishing a line leaves redirects behind for the exact versions it
      // replaced; listing those beside `5.0.x` would show the same docs twice.
      .filter(
        ([label]) =>
          isDocsVersionLine(label) || !versions.has(docsVersionLine(label)),
      )
      .map(([label, href]) => ({ label, href }))
  );
}

async function readPublishedReleases(publishedDirectory?: string) {
  const releases = new Map<string, string>();
  for (const option of (await readPublishedManifest(publishedDirectory))
    ?.versions || []) {
    if (option.release && isVersion(option.release)) {
      releases.set(docsVersionLine(option.release), option.release);
    }
  }
  return releases;
}

async function readExistingLatestLine(publishedDirectory?: string) {
  const payload = await readPublishedManifest(publishedDirectory);
  if (!payload) {
    return undefined;
  }
  const latestIndex = payload.versions.findIndex(
    (option) => option.href === "/latest/",
  );
  const latestOption =
    latestIndex >= 0 ? payload.versions[latestIndex] : undefined;
  if (latestOption?.release && isVersion(latestOption.release)) {
    return docsVersionLine(latestOption.release);
  }
  // Published before docs moved to release lines: the label names the exact
  // version, whose own folder is still what the entry stands for.
  const labeled = latestOption?.label.match(/^Latest \((.+)\)$/)?.[1];
  if (labeled) {
    return labeled;
  }
  return payload.versions
    .slice(Math.max(latestIndex + 1, 0))
    .find((option) => isVersion(option.label))?.label;
}

async function readPublishedManifest(publishedDirectory?: string) {
  if (!publishedDirectory) {
    return undefined;
  }
  let payload: unknown;
  try {
    payload = JSON.parse(
      await fs.readFile(path.join(publishedDirectory, "versions.json"), "utf8"),
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
  return isVersionsPayload(payload) ? payload : undefined;
}

function isVersionsPayload(
  value: unknown,
): value is { versions: DocsVersionOption[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { versions?: unknown }).versions) &&
    (value as { versions: unknown[] }).versions.every(
      (option) =>
        typeof option === "object" &&
        option !== null &&
        typeof (option as DocsVersionOption).label === "string" &&
        typeof (option as DocsVersionOption).href === "string",
    )
  );
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
  const qualifierDiff =
    versionQualifierRank(left) - versionQualifierRank(right);
  if (qualifierDiff !== 0) {
    return qualifierDiff;
  }
  return left.localeCompare(right);
}

function versionParts(version: string) {
  const match = /^(\d+)\.(\d+)(?:\.(\d+))?/.exec(version);
  return match
    ? [
        Number.parseInt(match[1], 10),
        Number.parseInt(match[2], 10),
        Number.parseInt(match[3] || "0", 10),
      ]
    : version.split(".").map((part) => Number.parseInt(part, 10) || 0);
}

function versionQualifierRank(version: string) {
  const core = /^\d+\.\d+(?:\.\d+)?/.exec(version)?.[0] || "";
  return /^[-.][A-Za-z0-9]/.test(version.slice(core.length)) ? 0 : 1;
}

function isVersion(value: string) {
  return /^\d+\.\d+(?:\.\d+)?(?:[-.][A-Za-z0-9]+)?$/.test(value);
}

function isMainModule() {
  return process.argv[1]
    ? import.meta.url === pathToFileURL(process.argv[1]).href
    : false;
}
