import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const HASH_DIRECTORY_PATTERN = /^[a-f0-9]{16}$/;

export type HoistSurfaceAssetResult = {
  files: number;
  directories: number;
};

export async function hoistVersionedSurfaceAssets({
  directory,
  versionRoot,
}: {
  directory: string;
  versionRoot: string;
}): Promise<HoistSurfaceAssetResult> {
  const normalizedVersionRoot = normalizedRelativePath(versionRoot);
  const versionAssetsRoot = joinRelativePath(normalizedVersionRoot, "assets");
  const versionAssetsDirectory = filesystemPath(directory, versionAssetsRoot);
  const files = await listRegularFiles(versionAssetsDirectory);
  if (!files.length) {
    return { files: 0, directories: 0 };
  }

  const stagedDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-surface-assets-"),
  );
  const assetMappings = new Map<string, string>();
  const directories = new Set<string>();
  try {
    for (const file of files) {
      const source = path.join(versionAssetsDirectory, ...file.split("/"));
      const content = await fs.readFile(source);
      const hash = createHash("sha256")
        .update(content)
        .digest("hex")
        .slice(0, 16);
      const sharedAssetPath = path.posix.join("assets", hash, file);
      const sharedAssetDirectory = path.posix.join("assets", hash);
      directories.add(sharedAssetDirectory);
      assetMappings.set(
        path.posix.join(versionAssetsRoot, file),
        sharedAssetPath,
      );

      const stagedTarget = filesystemPath(stagedDirectory, sharedAssetPath);
      await fs.mkdir(path.dirname(stagedTarget), { recursive: true });
      await fs.writeFile(stagedTarget, content);
    }

    await rewriteHtmlAssetReferences({
      directory,
      versionRoot: normalizedVersionRoot,
      assetMappings,
    });
    await fs.rm(versionAssetsDirectory, { force: true, recursive: true });
    await copyChildren(
      path.join(stagedDirectory, "assets"),
      path.join(directory, "assets"),
    );
  } finally {
    await fs.rm(stagedDirectory, { force: true, recursive: true });
  }

  return { files: files.length, directories: directories.size };
}

export async function mergeSharedSurfaceAssets({
  sourceDirectory,
  targetDirectory,
}: {
  sourceDirectory: string;
  targetDirectory: string;
}): Promise<void> {
  await copyChildren(
    path.join(sourceDirectory, "assets"),
    path.join(targetDirectory, "assets"),
  );
}

export async function pruneUnusedHashedSurfaceAssets(
  directory: string,
): Promise<void> {
  const assetsDirectory = path.join(directory, "assets");
  let entries: Array<import("node:fs").Dirent>;
  try {
    entries = await fs.readdir(assetsDirectory, { withFileTypes: true });
  } catch (error) {
    if (isNotFound(error)) {
      return;
    }
    throw error;
  }

  const referenced = await referencedHashedAssetDirectories(directory);
  await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isDirectory() &&
          HASH_DIRECTORY_PATTERN.test(entry.name) &&
          !referenced.has(entry.name),
      )
      .map((entry) =>
        fs.rm(path.join(assetsDirectory, entry.name), {
          force: true,
          recursive: true,
        }),
      ),
  );
}

async function referencedHashedAssetDirectories(
  directory: string,
): Promise<Set<string>> {
  const referenced = new Set<string>();
  const htmlFiles = await listRegularFiles(directory);
  await Promise.all(
    htmlFiles
      .filter((file) => file.endsWith(".html"))
      .map(async (file) => {
        const html = await fs.readFile(filesystemPath(directory, file), "utf8");
        for (const match of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
          const asset = hashedAssetReference(file, match[1]);
          if (asset) {
            referenced.add(asset);
          }
        }
      }),
  );
  return referenced;
}

async function rewriteHtmlAssetReferences({
  directory,
  versionRoot,
  assetMappings,
}: {
  directory: string;
  versionRoot: string;
  assetMappings: Map<string, string>;
}): Promise<void> {
  const htmlRootDirectory = filesystemPath(directory, versionRoot);
  const htmlFiles = await listRegularFiles(htmlRootDirectory);
  await Promise.all(
    htmlFiles
      .filter((file) => file.endsWith(".html"))
      .map(async (file) => {
        const htmlFilePath = path.posix.join(versionRoot, file);
        const absoluteFile = filesystemPath(directory, htmlFilePath);
        const html = await fs.readFile(absoluteFile, "utf8");
        const rewritten = rewriteAssetReferences(
          html,
          htmlFilePath,
          assetMappings,
        );
        if (rewritten !== html) {
          await fs.writeFile(absoluteFile, rewritten, "utf8");
        }
      }),
  );
}

function rewriteAssetReferences(
  html: string,
  htmlFilePath: string,
  assetMappings: Map<string, string>,
) {
  return html.replace(
    /\b(href|src)="([^"]*)"/g,
    (match, attributeName: string, value: string) => {
      const parsed = relativeUrlPath(value);
      if (!parsed) {
        return match;
      }
      const htmlDirectory = directoryName(htmlFilePath);
      const resolvedPath = path.posix.normalize(
        path.posix.join(htmlDirectory, parsed.pathname),
      );
      const sharedAssetPath =
        assetMappings.get(resolvedPath) ||
        assetMappings.get(safeDecodePath(resolvedPath));
      if (!sharedAssetPath) {
        return match;
      }

      return `${attributeName}="${htmlAttribute(
        relativeReference(htmlDirectory, sharedAssetPath) + parsed.suffix,
      )}"`;
    },
  );
}

function hashedAssetReference(htmlFilePath: string, value: string) {
  const parsed = relativeUrlPath(value);
  if (!parsed) {
    return undefined;
  }
  const resolvedPath = path.posix.normalize(
    path.posix.join(directoryName(htmlFilePath), parsed.pathname),
  );
  const match = /^assets\/([a-f0-9]{16})(?:\/|$)/.exec(resolvedPath);
  return match?.[1];
}

function relativeUrlPath(value: string) {
  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("/") ||
    value.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  ) {
    return undefined;
  }
  const suffixIndex = firstSuffixIndex(value);
  const pathname = suffixIndex >= 0 ? value.slice(0, suffixIndex) : value;
  if (!pathname) {
    return undefined;
  }
  return {
    pathname: pathname.replaceAll("\\", "/"),
    suffix: suffixIndex >= 0 ? value.slice(suffixIndex) : "",
  };
}

async function copyChildren(source: string, target: string): Promise<void> {
  let entries: Array<import("node:fs").Dirent>;
  try {
    entries = await fs.readdir(source, { withFileTypes: true });
  } catch (error) {
    if (isNotFound(error)) {
      return;
    }
    throw error;
  }

  await fs.mkdir(target, { recursive: true });
  await Promise.all(
    entries.map((entry) =>
      fs.cp(path.join(source, entry.name), path.join(target, entry.name), {
        recursive: true,
      }),
    ),
  );
}

async function listRegularFiles(
  directory: string,
  prefix = "",
): Promise<string[]> {
  let entries: Array<import("node:fs").Dirent>;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listRegularFiles(fullPath, relativePath);
      }
      if (entry.isFile()) {
        return [relativePath];
      }
      return [];
    }),
  );
  return files.flat();
}

function relativeReference(fromDirectory: string, target: string) {
  const relative = path.posix.relative(fromDirectory || ".", target);
  if (!relative || relative.startsWith(".")) {
    return relative || ".";
  }
  return relative.includes("/") ? relative : `./${relative}`;
}

function normalizedRelativePath(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

function joinRelativePath(...parts: string[]) {
  return parts.filter(Boolean).join("/");
}

function filesystemPath(root: string, relativePath: string) {
  const parts = relativePath ? relativePath.split("/") : [];
  return path.join(root, ...parts);
}

function directoryName(file: string) {
  const directory = path.posix.dirname(file);
  return directory === "." ? "" : directory;
}

function safeDecodePath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function firstSuffixIndex(value: string): number {
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  if (queryIndex < 0) return hashIndex;
  if (hashIndex < 0) return queryIndex;
  return Math.min(queryIndex, hashIndex);
}

function isNotFound(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function htmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
