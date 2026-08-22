import { shikiLanguage } from "../../src/lib/docs-code-highlighting.ts";

export { shikiLanguage };

// Properties-style sources may carry a callout marker on its own line (or in a
// comment) above the line it describes; move it onto that line so it renders
// as a callout number instead of a bare `<1>`.
export function normalizeStandaloneCalloutLines(
  source: string,
  language: string,
): string {
  if (!standaloneCalloutLanguage(language)) {
    return source;
  }
  const lines = source.split(/\r?\n/);
  const output: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const marker = /^[ \t]*(?:[#;][ \t]*)?<(\.|\d+)>[ \t]*$/.exec(line)?.[1];
    const targetIndex = marker
      ? nextCalloutTargetLineIndex(lines, index + 1)
      : -1;
    if (marker && targetIndex >= 0) {
      lines[targetIndex] =
        `${lines[targetIndex].replace(/[ \t]+$/, "")} <${marker}>`;
      continue;
    }
    output.push(line);
  }
  return output.join("\n");
}

function standaloneCalloutLanguage(language: string): boolean {
  return new Set(["conf", "hocon", "properties", "props"]).has(
    normalizeCodeLanguage(language),
  );
}

function nextCalloutTargetLineIndex(
  lines: string[],
  startIndex: number,
): number {
  for (let index = startIndex; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (!trimmed) {
      continue;
    }
    if (/^[#;]/.test(trimmed) || /^<(\.|\d+)>$/.test(trimmed)) {
      return -1;
    }
    return index;
  }
  return -1;
}

function normalizeCodeLanguage(language: unknown): string {
  return String(language || "text")
    .trim()
    .toLowerCase();
}
