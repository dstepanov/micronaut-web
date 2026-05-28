import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import YAML from "js-yaml";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDirs = [
  join(rootDir, "src", "content", "main-site", "blog"),
  join(rootDir, "src", "content", "main-site", "pages"),
];

const objectComputingDownloadFiles: Record<string, string> = {
  5087: "/micronaut-assets/main-site/wp-content/uploads/2023/06/Micronaut_Brand_Guidelines.pdf",
  5205: "/micronaut-assets/main-site/objectcomputing/download-file/5205-sally_micronaut_mascot.png",
  5206: "/micronaut-assets/main-site/objectcomputing/download-file/5206-micronaut_horizontal_black.png",
  5207: "/micronaut-assets/main-site/objectcomputing/download-file/5207-micronaut_horizontal_white.png",
  5208: "/micronaut-assets/main-site/objectcomputing/download-file/5208-micronaut_stacked_black.png",
  5209: "/micronaut-assets/main-site/objectcomputing/download-file/5209-micronaut_stacked_white.png",
  5210: "/micronaut-assets/logos/micronaut-horizontal-black.svg",
  5211: "/micronaut-assets/logos/micronaut-horizontal-white.svg",
  5212: "/micronaut-assets/main-site/objectcomputing/download-file/5212-micronaut_stacked_black.svg",
  5213: "/micronaut-assets/main-site/objectcomputing/download-file/5213-micronaut_stacked_white.svg",
  5214: "/micronaut-assets/icons/micronaut-sally.svg",
  5451: "/micronaut-assets/main-site/objectcomputing/download-file/5451-Slide_Deck_2022_Q1_2GM_Town_Hall.pdf",
};

type Frontmatter = Record<string, unknown>;

type SplitMarkdown = {
  data: Frontmatter;
  body: string;
};

type NormalizeBodyOptions = {
  blogPost: boolean;
};

function decodeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_match: string, code: string): string =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_match: string, code: string): string =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&hellip;/g, "...")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'");
}

function cleanExcerpt(value: unknown): string {
  return decodeHtml(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s*\[(?:&hellip;|&amp;hellip;|…|\.\.\.)\]\s*$/i, "...")
    .replace(/\s+/g, " ")
    .trim();
}

function splitFrontmatter(markdown: string, file: string): SplitMarkdown {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing frontmatter in ${relative(rootDir, file)}`);
  }
  return {
    data: (YAML.load(match[1]) ?? {}) as Frontmatter,
    body: match[2],
  };
}

function stringifyMarkdown(data: Frontmatter, body: string): string {
  return `---\n${YAML.dump(data, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  }).trim()}\n---\n\n${body.trim()}\n`;
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) {
        return listMarkdownFiles(file);
      }
      return entry.isFile() && entry.name.endsWith(".md") ? [file] : [];
    }),
  );
  return files.flat().sort();
}

function normalizeBody(
  body: string,
  { blogPost }: NormalizeBodyOptions,
): string {
  const lines = fenceEscapedXmlBlocks(
    body
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .split("\n"),
  );
  const normalized: string[] = [];
  let fenced = false;

  for (const line of lines) {
    if (/^\s*``\s*$/.test(line)) {
      continue;
    }
    const fenceLine = normalizeFenceLine(line);
    if (/^\s*(?:```|~~~)/.test(fenceLine)) {
      fenced = !fenced;
      normalized.push(fenceLine);
      continue;
    }
    if (fenced) {
      normalized.push(normalizeFencedCodeLine(line));
      continue;
    }
    if (/^( {4}|\t)/.test(line)) {
      normalized.push(line);
      continue;
    }
    const normalizedUrlLine = normalizeUrlOnlyLine(line);
    if (normalizedUrlLine === undefined) {
      continue;
    }
    let nextLine = normalizeStandaloneHeading(
      decodeBodyTextEntities(normalizedUrlLine),
    )
      .replace(/organizations>$/g, "organizations")
      .replace(
        /\[\((\d{3})\)\s+([0-9-]+)\]\(tel:\(\1%29%20\2\)/g,
        (_match: string, area: string, number: string): string =>
          `[(${area}) ${number}](tel:${area}-${number})`,
      )
      .replace(
        /\]\(([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\)/g,
        "](mailto:$1)",
      )
      .replace(
        /\[Micronaut WebSocket Support\]\(https:\/\/docs\.micronaut\.io\/latest\/guide\/#websocket\)(?:\(https:\/\/docs\.micronaut\.io\/latest\/guide\/#websocket\))+/g,
        "[Micronaut WebSocket Support](https://docs.micronaut.io/latest/guide/#websocket)",
      )
      .replace(
        /\[Micronaut WebSocket Support\](?!\()/g,
        "[Micronaut WebSocket Support](https://docs.micronaut.io/latest/guide/#websocket)",
      )
      .replace(
        /\[Embedded content\]\(https:\/\/www\.youtube\.com\/embed\/([A-Za-z0-9_-]+)(?:\?[^)]*)?\)/g,
        "[Watch the video](https://www.youtube.com/watch?v=$1)",
      )
      .replace(
        /\]\(https:\/\/objectcomputing\.com\/download_file\/(\d+)\)/g,
        (match: string, id: string): string =>
          objectComputingDownloadFiles[id]
            ? `](${objectComputingDownloadFiles[id]})`
            : match,
      )
      .replace(
        /\[simpay_payment_receipt\]/g,
        "Payment confirmation appears after a foundation or sponsorship payment flow completes.",
      )
      .replace(
        /\]\((https:\/\/micronaut-projects\.github\.io\/micronaut-serialization\/latest\/api\/io\/micronaut\/serde\/ObjectMapper\.html#cloneWithConfiguration\([^)\s]+%29)\)/g,
        "](<$1>)",
      )
      .replace(/\[([^\]\n]+?),\]\(([^)\n]+)\)/g, "[$1]($2),")
      .replace(/\\\[([^\]\n]+)\\\]/g, "[$1]")
      .replace(/rewrite-micronautdependency/g, "rewrite-micronaut dependency")
      .replace(/`PatternLayoutpatterns`/g, "`PatternLayout` patterns")
      .replace(/\]\(%20(?=https?:\/\/|\/)/g, "](")
      .replace(/(\*[^*\n]+\*)(?=[A-Za-z])/g, "$1 ")
      .replace(/(\))(?=[A-Za-z])/g, "$1 ");
    nextLine = normalizePunctuationOnlyLinks(nextLine);
    nextLine = normalizeBlockImages(nextLine);
    nextLine = normalizeInlineCodeSpacing(normalizeInlineCode(nextLine));
    if (blogPost) {
      nextLine = nextLine.replace(/^#(\s+)/, "##$1");
    }
    normalized.push(nextLine);
  }

  return normalized
    .join("\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeFencedCodeLine(line: string): string {
  return line
    .replace(
      /public void >beforeCheckpoint>\(>Context><\? >extends >Resource>> context\)/g,
      "public void beforeCheckpoint(Context<? extends Resource> context)",
    )
    .replace(
      /todoRepository>\.delete\(>todoId>, user\);/g,
      "todoRepository.delete(todoId, user);",
    );
}

function normalizeFenceLine(line: string): string {
  return line
    .replace(/^```php\s*$/, "```java")
    .replace(/^```javastacktrace\s*$/, "```java");
}

function fenceEscapedXmlBlocks(lines: string[]): string[] {
  const normalized: string[] = [];
  let fenced = false;

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];
    if (/^\s*(?:```|~~~)/.test(line)) {
      fenced = !fenced;
      normalized.push(line);
      index += 1;
      continue;
    }
    if (!fenced && isEscapedXmlLine(line)) {
      const block: string[] = [];
      let cursor = index;
      while (cursor < lines.length) {
        const current = lines[cursor];
        if (isEscapedXmlLine(current)) {
          block.push(decodeHtml(current.trim()));
          cursor += 1;
          continue;
        }
        if (
          current.trim() === "" &&
          cursor + 1 < lines.length &&
          isEscapedXmlLine(lines[cursor + 1])
        ) {
          cursor += 1;
          continue;
        }
        break;
      }
      normalized.push("```xml", ...block, "```");
      index = cursor;
      continue;
    }
    normalized.push(line);
    index += 1;
  }

  return normalized;
}

function isEscapedXmlLine(line: string): boolean {
  return /^&lt;\/?[A-Za-z][\s\S]*&gt;$/.test(line.trim());
}

function normalizeInlineCode(line: string): string {
  return line.replace(
    /`([^`\n]+)`/g,
    (match: string, value: string): string => {
      const trimmed = value.trim().replace(/::\s+/g, "::");
      return trimmed ? `\`${trimmed}\`` : match;
    },
  );
}

function normalizeInlineCodeSpacing(line: string): string {
  return line.replace(
    /`([^`\n]+)`/g,
    (
      match: string,
      value: string,
      offset: number,
      fullLine: string,
    ): string => {
      const code = value.trim();
      if (!code) {
        return match;
      }
      const before = fullLine.at(offset - 1) ?? "";
      const after = fullLine.at(offset + match.length) ?? "";
      const prefix = needsSpaceBeforeCode(before) ? " " : "";
      const suffix = needsSpaceAfterCode(after) ? " " : "";
      return `${prefix}\`${code}\`${suffix}`;
    },
  );
}

function normalizePunctuationOnlyLinks(line: string): string {
  return line
    .replace(
      /, and (\[[^\]\n]+\]\([^)]+\))\s+\[\.\]\((https:\/\/github\.com\/micronaut-projects\/[^)]+)\)/g,
      (_match: string, previousLink: string, href: string): string =>
        `, ${previousLink}, and [${labelForMicronautReleaseUrl(href)}](${href}).`,
    )
    .replace(/\s+\[!\]\([^)]+\)/g, "!")
    .replace(/\s+\[\.\]\(mailto:[^)]+\)/g, ".")
    .replace(
      /\s+\[\.\]\((https:\/\/github\.com\/micronaut-projects\/[^)]+)\)/g,
      (_match: string, href: string): string =>
        `, and [${labelForMicronautReleaseUrl(href)}](${href}).`,
    )
    .replace(
      /\.\[`{2}\]\((https:\/\/github\.com\/micronaut-projects\/[^)]+)\)/g,
      (_match: string, href: string): string =>
        `. [${labelForMicronautReleaseUrl(href)}](${href})`,
    )
    .replace(
      /\s+\[`{2}\]\((https:\/\/github\.com\/micronaut-projects\/[^)]+)\)/g,
      (_match: string, href: string): string =>
        ` [${labelForMicronautReleaseUrl(href)}](${href})`,
    )
    .replace(
      /, and (\[[^\]\n]+\]\([^)]+\)), and (\[Micronaut [^\]\n]+\]\([^)]+\)\.)/g,
      ", $1, and $2",
    );
}

function normalizeBlockImages(line: string): string {
  if (!line.includes("![")) {
    return line;
  }
  return line
    .replace(/(?<!\[)(!\[[^\]\n]*\]\([^)]+\))(?!\]\()/g, "\n\n$1\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function needsSpaceBeforeCode(char: string): boolean {
  return Boolean(char) && !/[\s([{"'`]/.test(char);
}

function needsSpaceAfterCode(char: string): boolean {
  return Boolean(char) && /[A-Za-z0-9(@`]/.test(char);
}

function normalizeStandaloneHeading(line: string): string {
  return line
    .replace(/^(#{2,6})\s+\*\*([^*\n]+)\*\*\s*$/, "$1 $2")
    .replace(/^\*\*([^*\n]{1,80})\*\*\s*$/, "### $1");
}

function decodeBodyTextEntities(line: string): string {
  return line
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');
}

function normalizeUrlOnlyLine(line: string): string | undefined {
  const match = line.match(
    /^(\s*(?:[-*]\s*)?)(?:\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/\S+))\s*$/,
  );
  if (!match) {
    return line;
  }
  const prefix = match[1] ?? "";
  const href = decodeHtml(match[3] ?? match[4]).trim();
  const label = decodeHtml(match[2] ?? href).trim();
  if (label !== href) {
    return line;
  }
  if (shouldRemoveUrlOnlyLine(href, prefix)) {
    return undefined;
  }
  return `${prefix}[${labelForUrl(href)}](${href})`;
}

function shouldRemoveUrlOnlyLine(href: string, prefix: string): boolean {
  try {
    const url = new URL(href);
    if (
      url.hostname === "github.com" &&
      url.pathname.includes("/wiki/") &&
      url.hash
    ) {
      return true;
    }
    if (
      url.hostname === "micronaut.io" &&
      url.pathname.startsWith("/blog/page/")
    ) {
      return true;
    }
    return prefix.trim() === "" && url.hostname === "micronaut.io";
  } catch {
    return false;
  }
}

function labelForUrl(href: string): string {
  try {
    const url = new URL(href);
    const path = url.pathname.replace(/\/+$/, "");
    const lastSegment = path.slice(path.lastIndexOf("/") + 1);
    if (lastSegment) {
      return lastSegment
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (character: string): string =>
          character.toUpperCase(),
        );
    }
    return url.hostname;
  } catch {
    return href;
  }
}

function normalizeData(data: Frontmatter): Frontmatter {
  const nextData: Frontmatter = { ...data };
  for (const field of [
    "description",
    "summary",
    "detail",
    "challenge",
    "micronautUse",
    "outcome",
  ]) {
    if (typeof nextData[field] === "string") {
      nextData[field] = cleanExcerpt(nextData[field]);
    }
  }
  if (typeof nextData.title === "string") {
    nextData.title = cleanTitle(nextData.title);
  }
  return nextData;
}

function cleanTitle(value: string): string {
  return value
    .replace(/^Micronaut Micronaut framework\b/i, "Micronaut Framework")
    .replace(/^Micronaut Micronaut\b/i, "Micronaut");
}

function archiveBody(data: Frontmatter, file: string): string | undefined {
  const sourceUrl = String(data.sourceUrl ?? "");
  if (!sourceUrl) {
    return undefined;
  }
  let pathname;
  try {
    pathname = new URL(sourceUrl).pathname;
  } catch {
    return undefined;
  }
  const relativePath = relative(rootDir, file);
  if (
    relativePath === join("src", "content", "main-site", "pages", "blog.md") ||
    pathname.startsWith("/category/")
  ) {
    return cleanExcerpt(data.intro ?? data.description ?? data.title ?? "");
  }
  return undefined;
}

function labelForMicronautReleaseUrl(href: string): string {
  try {
    const url = new URL(href);
    const match = url.pathname.match(
      /\/micronaut-projects\/([^/]+)\/releases\/(?:tag\/)?v?([^/]+)/,
    );
    if (!match) {
      return labelForUrl(href);
    }
    const [, project, version] = match;
    const projectLabel = labelForMicronautProject(project);
    return version ? `${projectLabel} \`${version}\`` : projectLabel;
  } catch {
    return href;
  }
}

function labelForMicronautProject(project: string): string {
  const labels: Record<string, string> = {
    "micronaut-openapi": "Micronaut OpenAPI",
    "micronaut-problem-json": "Micronaut Problem+JSON",
    "micronaut-toml": "Micronaut TOML",
  };
  if (labels[project]) {
    return labels[project];
  }
  return project
    .replace(/^micronaut-/, "Micronaut ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character: string): string => character.toUpperCase());
}

let checked = 0;
let changed = 0;
const changedFiles: string[] = [];

for (const dir of contentDirs) {
  const files = await listMarkdownFiles(dir);
  for (const file of files) {
    checked += 1;
    const original = await readFile(file, "utf8");
    const { data, body } = splitFrontmatter(original, file);
    const blogPost = file.startsWith(
      join(rootDir, "src", "content", "main-site", "blog"),
    );
    const nextData = normalizeData(data);
    const nextBody =
      archiveBody(nextData, file) ?? normalizeBody(body, { blogPost });
    const next = stringifyMarkdown(nextData, nextBody);
    if (next !== original) {
      await writeFile(file, next);
      changed += 1;
      changedFiles.push(relative(rootDir, file));
    }
  }
}

console.log(
  JSON.stringify(
    {
      checked,
      changed,
      changedFiles,
    },
    null,
    2,
  ),
);
