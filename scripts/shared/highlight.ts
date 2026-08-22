import { normalizeEmptyPropertiesAssignmentHighlighting as normalizeEmptyPropertiesAssignmentHtml } from "../../src/lib/properties-highlight-normalization.ts";

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

export function normalizeEmptyPropertiesAssignmentHighlighting(
  highlightedHtml: string,
  language: string,
): string {
  if (shikiLanguage(language) !== "properties") {
    return highlightedHtml;
  }
  return normalizeEmptyPropertiesAssignmentHtml(highlightedHtml);
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

export function shikiLanguage(language: string): string {
  const normalized = normalizeCodeLanguage(language);
  const languages: Record<string, string> = {
    conf: "properties",
    "groovy-config": "groovy",
    gradle: "kotlin",
    graphqls: "graphql",
    hocon: "properties",
    "json-config": "json",
    maven: "xml",
    mysql: "sql",
    pom: "xml",
    properties: "properties",
    props: "properties",
    shell: "shellscript",
    sh: "shellscript",
    bash: "shellscript",
    cmd: "shellscript",
    commandline: "shellscript",
    console: "shellscript",
    zsh: "shellscript",
    text: "text",
    txt: "text",
    plaintext: "text",
  };
  return languages[normalized] || normalized || "text";
}
