import { promises as fs } from "node:fs";
import path from "node:path";

export type ForbiddenBrowserRuntimeAssetMatch = {
  file: string;
  label: string;
};

const forbiddenBrowserRuntimePatterns = [
  {
    label: "Shiki highlighter",
    pattern:
      /@shikijs\/|(?:^|[^A-Za-z0-9_$-])shiki(?:[^A-Za-z0-9_$-]|$)|codeToHtml|createHighlighter|codeToTokens/,
  },
  {
    label: "Asciidoctor",
    pattern:
      /@asciidoctor\/|from\s*["']asciidoctor["']|import\(["']asciidoctor["']\)|Opal\.Asciidoctor/,
  },
  {
    label: "configuration parser package",
    pattern:
      /from\s*["'](?:js-yaml|smol-toml)["']|import\(["'](?:js-yaml|smol-toml)["']\)|js-yaml|smol-toml/,
  },
  {
    label: "generated-content configuration conversion helper",
    pattern:
      /\b(?:registerConfigurationBlock|processConfigurationBlock|configurationSamples|parseConfigurationSource|toJavaProperties|flattenConfiguration|formatPropertiesValue|toTomlSource|formatTomlValue|toGroovyConfig|formatGroovyEntry|formatGroovyKey|formatGroovyValue|toHocon|formatHoconValue|stringifyToml|parseToml)\b/,
  },
];

export async function forbiddenBrowserRuntimeAssetMatches(
  distDirectory: string,
): Promise<ForbiddenBrowserRuntimeAssetMatch[]> {
  const assetsDirectory = path.join(distDirectory, "_astro");
  const files = await listFiles(assetsDirectory);
  const matches: ForbiddenBrowserRuntimeAssetMatch[] = [];

  for (const file of files.filter((candidate) => candidate.endsWith(".js"))) {
    const source = await fs.readFile(file, "utf8");
    matches.push(...forbiddenBrowserRuntimeTextMatches(file, source));
  }

  return matches;
}

export function forbiddenBrowserRuntimeTextMatches(
  file: string,
  source: string,
): ForbiddenBrowserRuntimeAssetMatch[] {
  return forbiddenBrowserRuntimePatterns
    .filter(({ pattern }) => pattern.test(source))
    .map(({ label }) => ({ file, label }));
}

async function listFiles(directory: string): Promise<string[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isFileNotFoundError(error)) {
      return [];
    }
    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );
  return files.flat();
}

function isFileNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
