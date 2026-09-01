import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseArgs, stringArg } from "./shared/cli.ts";
import { pageDirectory, writeRedirectMirror } from "./publish-docs-surface.ts";
import {
  DOCS_SNAPSHOT_ROOT,
  normalizedExternalBase,
} from "../src/lib/deployment-defaults.ts";

/**
 * Snapshot docs are rebuilt from the Platform default branch, so they are
 * force-pushed to their own repository instead of growing the released docs
 * branch by one commit per upstream merge. A GitHub Pages host serves exactly
 * one repository, so `docs.micronaut.io/snapshot/` cannot be that repository's
 * tree; it is a mirror of redirect stubs onto the snapshot Pages site, page for
 * page, the way `/latest` mirrors the newest release line.
 */
export const docsSnapshotRoot = DOCS_SNAPSHOT_ROOT.slice(1);

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

if (isMainModule()) {
  const options = parseArgs(process.argv.slice(2));
  await publishDocsSnapshotRedirects({
    distDirectory:
      stringArg(options.dist) || path.join(projectDirectory, "dist"),
    publishedDirectory:
      stringArg(options.publishedDir) || process.env.PUBLISHED_DOCS_DIR,
    snapshotSiteUrl:
      stringArg(options.snapshotUrl) || process.env.MICRONAUT_DOCS_SNAPSHOT_URL,
  });
}

export async function publishDocsSnapshotRedirects({
  distDirectory,
  publishedDirectory,
  snapshotSiteUrl,
}: {
  distDirectory: string;
  publishedDirectory?: string;
  snapshotSiteUrl?: string;
}): Promise<void> {
  if (!publishedDirectory) {
    throw new Error("Expected --published-dir or PUBLISHED_DOCS_DIR.");
  }
  if (!snapshotSiteUrl) {
    throw new Error("Expected --snapshot-url or MICRONAUT_DOCS_SNAPSHOT_URL.");
  }
  const snapshotDirectory = path.join(distDirectory, docsSnapshotRoot);
  if (!(await exists(snapshotDirectory))) {
    throw new Error(
      `Expected the snapshot artifact to contain ${snapshotDirectory}; build the docs surface with MICRONAUT_DOCS_ROOT=/${docsSnapshotRoot}.`,
    );
  }
  const snapshotUrl = normalizedExternalBase(snapshotSiteUrl);
  await writeRedirectMirror({
    sourceDirectory: snapshotDirectory,
    targetDirectory: path.join(publishedDirectory, docsSnapshotRoot),
    title: "the Micronaut snapshot docs",
    // Every stub names its own page on the snapshot site rather than that
    // page's own redirect target: a destination inside the snapshot tree is
    // resolved against the snapshot deployment base, which does not exist on
    // the released docs host.
    destination: (page) =>
      `${snapshotUrl}${docsSnapshotRoot}/${pageDirectory(page)}`,
  });
}

async function exists(file: string) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function isMainModule() {
  return process.argv[1]
    ? import.meta.url === pathToFileURL(process.argv[1]).href
    : false;
}
