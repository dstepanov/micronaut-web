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
  const versions = new Map<string, string>();
  if (publishedDirectory) {
    for (const option of await readPublishedVersions(publishedDirectory)) {
      versions.set(option.label, option.href);
    }
  }
  if (version && version !== "latest") {
    versions.set(version, `/${version}/`);
  }

  const sortedVersions = Array.from(versions.entries()).sort(
    ([left], [right]) => compareVersions(right, left),
  );
  const latestVersion = await resolveLatestVersionName({
    publishedDirectory,
    version,
    latest,
    sortedVersions,
  });

  return [
    {
      label: latestVersion ? `Latest (${latestVersion})` : "Latest",
      href: "/latest/",
      ...(latest ? { current: true } : {}),
    },
    ...sortedVersions.map(([label, href]) => ({ label, href })),
  ];
}

async function resolveLatestVersionName({
  publishedDirectory,
  version,
  latest,
  sortedVersions,
}: {
  publishedDirectory?: string;
  version?: string;
  latest: boolean;
  sortedVersions: Array<[string, string]>;
}) {
  if (latest && version && version !== "latest") {
    return version;
  }
  return (
    (await readExistingLatestVersionName(publishedDirectory)) ||
    sortedVersions[0]?.[0]
  );
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

async function readExistingLatestVersionName(publishedDirectory?: string) {
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
  if (!isVersionsPayload(payload)) {
    return undefined;
  }
  const latestIndex = payload.versions.findIndex(
    (option) => option.href === "/latest/",
  );
  const latestLabel =
    latestIndex >= 0 ? payload.versions[latestIndex].label : undefined;
  const labeledVersion = latestLabel?.match(/^Latest \((.+)\)$/)?.[1];
  if (labeledVersion) {
    return labeledVersion;
  }
  return payload.versions
    .slice(Math.max(latestIndex + 1, 0))
    .find((option) => isVersion(option.label))?.label;
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
