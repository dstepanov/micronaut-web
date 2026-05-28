import { createHash } from "node:crypto";
import { existsSync, promises as fs } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Block, BlockProcessor, Reader, Section } from "@asciidoctor/core";
import type { OnResolveArgs, PluginBuild } from "esbuild";
import { build } from "esbuild";
import { codeToHtml } from "shiki";

import { docsSnippetLanguageLabel } from "../../../src/components/web/docs-snippet-icons.ts";
import { html } from "../../shared/html.ts";
import {
  normalizeStandaloneCalloutLines,
  shikiLanguage,
} from "../../shared/highlight.ts";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
const SNIPPET_CALLOUT_VALIDATION_CLASS = "docs-snippet-callout-validation";
const MANUAL_CALLOUTS_CLASS = "asciidoc-manual-callouts";
const CALLOUT_MARKER_PREFIX = "__MICRONAUT_CALLOUT_";
const CALLOUT_MARKER_SUFFIX = "__";

let componentRendererPromise: Promise<ComponentRenderer> | undefined;

export type SnippetPayload = Record<string, unknown> & {
  description?: unknown;
  footerSource?: unknown;
  kind?: unknown;
  samples?: unknown;
  title?: unknown;
};

type SnippetKind = "code" | "dependency";

type NormalizedSnippetSample = {
  language: string;
  source: string;
  group?: string;
  highlighterLanguage?: string;
};

type SnippetVariant = {
  active: boolean;
  highlightedHtml: string;
  label: string;
  language: string;
  panelId: string;
  source: string;
  tabId: string;
};

type ComponentRenderer = {
  renderGeneratedSnippetCard(
    input: Record<string, unknown>,
  ): Promise<string> | string;
  renderGeneratedPropertiesCard(
    input: Record<string, unknown>,
  ): Promise<string> | string;
};

type SnippetRenderOptions = {
  collectManualCallouts?: boolean;
};

type ComponentBlockProcessor = Pick<
  BlockProcessor,
  "createBlock" | "parseContent"
>;

type ComponentBlockNode = {
  blocks?: ComponentBlockNode[];
  convert?: () => Promise<string> | string;
  context?: string;
};

type CalloutItem = {
  line: string;
  number: string;
  text: string;
};

export type CalloutReader = {
  peekLine(): Promise<string | undefined>;
  readLine(): Promise<string | undefined>;
  unshiftLines(lines: string[]): void;
};

export async function renderSnippetBlock(
  processor: ComponentBlockProcessor,
  parent: Block | Section,
  payload: SnippetPayload,
  reader?: Reader,
  options: SnippetRenderOptions = {},
): Promise<Block> {
  return renderSnippetBlockWithCalloutReader(
    processor,
    parent,
    payload,
    reader || (parent.document as { reader?: Reader }).reader,
    options,
  );
}

export async function renderSnippetBlockWithCalloutReader(
  processor: ComponentBlockProcessor,
  parent: Block | Section,
  payload: SnippetPayload,
  reader: Reader | CalloutReader | undefined,
  options: SnippetRenderOptions = {},
): Promise<Block> {
  const manualCalloutLines: string[] = [];
  const payloadWithCallouts = await absorbFollowingCalloutLines(
    reader,
    payload,
    {
      collectManualCallouts: options.collectManualCallouts
        ? (lines: string[]): void => {
            manualCalloutLines.push(...lines);
          }
        : undefined,
    },
  );
  const rendered = await renderSnippetPayloadCards({
    footerHtml: await snippetFooterHtml(processor, parent, payloadWithCallouts),
    idSeed: snippetIdSeed(reader, payloadWithCallouts),
    payload: payloadWithCallouts,
  });
  const manualCalloutHtml = await manualCalloutsHtml(
    processor,
    parent,
    manualCalloutLines,
  );
  return processor.createBlock(
    parent,
    "pass",
    rendered.html + manualCalloutHtml,
    {
      role: "docs-snippet",
    },
  );
}

type RenderedSnippetCards = {
  count: number;
  html: string;
};

export async function renderSnippetPayloadCards({
  footerHtml,
  idSeed,
  payload,
}: {
  footerHtml: string;
  idSeed: string;
  payload: SnippetPayload;
}): Promise<RenderedSnippetCards> {
  const kind = payload.kind === "dependency" ? "dependency" : "code";
  const sampleGroups = groupedSnippetSamples(payload.samples, kind);
  const snippets: string[] = [];
  const baseId = `generated-docs-snippet-${snippetIdHash(idSeed, payload)}`;

  for (const [index, samples] of sampleGroups.entries()) {
    snippets.push(
      await renderSnippetCard({
        description: index === 0 ? payload.description || "" : "",
        footerHtml: index === sampleGroups.length - 1 ? footerHtml : "",
        id: sampleGroups.length > 1 ? `${baseId}-${index}` : baseId,
        kind,
        optionsLabel:
          kind === "dependency" ? "Dependency format" : "Code language",
        samples,
        title: index === 0 ? payload.title || "" : "",
      }),
    );
  }

  return {
    count: sampleGroups.length,
    html: snippets.join(""),
  };
}

export async function renderGeneratedSnippetCard(
  input: Record<string, unknown>,
): Promise<string> {
  const renderer = await loadComponentRenderer();
  return renderer.renderGeneratedSnippetCard(input);
}

export async function renderGeneratedPropertiesCard(
  input: Record<string, unknown>,
): Promise<string> {
  const renderer = await loadComponentRenderer();
  return renderer.renderGeneratedPropertiesCard(input);
}

export async function renderSnippetVariant({
  active,
  language,
  panelId,
  sample,
  tabId,
}: {
  active: boolean;
  language: string;
  panelId: string;
  sample: NormalizedSnippetSample;
  tabId: string;
}): Promise<SnippetVariant> {
  const displayLanguage = String(language || "text")
    .trim()
    .toLowerCase();
  return {
    active,
    highlightedHtml: await highlightedCodeInnerHtml(
      sample.source || "",
      sample.highlighterLanguage || displayLanguage,
      displayLanguage,
    ),
    label: docsSnippetLanguageLabel(displayLanguage),
    language: displayLanguage,
    panelId,
    source: String(sample.source || "").trimEnd(),
    tabId,
  };
}

function loadComponentRenderer(): Promise<ComponentRenderer> {
  if (!componentRendererPromise) {
    componentRendererPromise = bundleComponentRenderer();
  }
  return componentRendererPromise;
}

async function bundleComponentRenderer(): Promise<ComponentRenderer> {
  const tempDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-direct-snippet-renderer-"),
  );
  const outfile = path.join(tempDirectory, "docs-generated-snippet.cjs");
  try {
    await build({
      entryPoints: [
        path.join(
          projectDirectory,
          "src",
          "components",
          "web",
          "docs-generated-snippet.tsx",
        ),
      ],
      outfile,
      bundle: true,
      format: "cjs",
      jsx: "automatic",
      platform: "node",
      logLevel: "silent",
      plugins: [
        {
          name: "micronaut-web-alias",
          setup(buildContext: PluginBuild): void {
            buildContext.onResolve(
              { filter: /^@\// },
              (args: OnResolveArgs) => ({
                path: resolveSourceImport(args.path),
              }),
            );
          },
        },
      ],
    });
    const requireRendererBundle = createRequire(import.meta.url);
    return requireRendererBundle(outfile) as ComponentRenderer;
  } finally {
    await fs.rm(tempDirectory, { recursive: true, force: true });
  }
}

function resolveSourceImport(specifier: string): string {
  const candidate = path.join(projectDirectory, "src", specifier.slice(2));
  for (const extension of ["", ".tsx", ".ts", ".jsx", ".js"]) {
    const resolved = `${candidate}${extension}`;
    if (existsSync(resolved)) {
      return resolved;
    }
  }
  return candidate;
}

function snippetIdHash(idSeed: string, payload: SnippetPayload): string {
  return createHash("sha1")
    .update(idSeed)
    .update("\0")
    .update(JSON.stringify(payload))
    .digest("hex")
    .slice(0, 12);
}

async function renderSnippetCard({
  description,
  footerHtml,
  id,
  kind,
  optionsLabel,
  samples,
  title,
}: {
  description: unknown;
  footerHtml: string;
  id: string;
  kind: SnippetKind;
  optionsLabel: string;
  samples: NormalizedSnippetSample[];
  title: unknown;
}): Promise<string> {
  return renderGeneratedSnippetCard({
    copyLabel: "Copy code",
    descriptionHtml: description ? inlineTitleHtml(description) : "",
    footerHtml,
    id,
    kind,
    optionsLabel,
    titleHtml: title ? inlineTitleHtml(title) : "",
    variants: await Promise.all(
      samples.map((sample, index) =>
        renderSnippetVariant({
          active: index === 0,
          language: sample.language || "text",
          panelId: `${id}-panel-${index}`,
          sample,
          tabId: `${id}-tab-${index}`,
        }),
      ),
    ),
  });
}

function groupedSnippetSamples(
  samples: unknown,
  kind: SnippetKind,
): NormalizedSnippetSample[][] {
  const normalizedSamples = normalizeSnippetSamples(samples);
  if (kind !== "code" || normalizedSamples.length < 2) {
    return [normalizedSamples];
  }

  if (normalizedSamples.every((sample) => sample.group)) {
    const groups = new Map<string, NormalizedSnippetSample[]>();
    for (const sample of normalizedSamples) {
      const group = sample.group || "";
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)?.push(sample);
    }
    if (groups.size > 1) {
      return Array.from(groups.values());
    }
  }

  const languageCounts = new Map<string, number>();
  for (const sample of normalizedSamples) {
    const language = sample.language || "text";
    languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
  }
  if ([...languageCounts.values()].some((count) => count > 1)) {
    return normalizedSamples.map((sample) => [sample]);
  }
  return [normalizedSamples];
}

function normalizeSnippetSamples(samples: unknown): NormalizedSnippetSample[] {
  return (Array.isArray(samples) ? samples : []).map((value) => {
    const sample = record(value);
    return {
      language: String(sample.language || "text"),
      source: String(sample.source || "").trimEnd(),
      group: sample.group ? String(sample.group) : undefined,
      highlighterLanguage: sample.highlighterLanguage
        ? String(sample.highlighterLanguage)
        : undefined,
    };
  });
}

async function snippetFooterHtml(
  processor: ComponentBlockProcessor,
  parent: Block | Section,
  payload: SnippetPayload,
): Promise<string> {
  const footerLines = String(payload.footerSource || "")
    .split(/\r?\n/)
    .filter((line: string): boolean => Boolean(line.trim()));
  if (!footerLines.length) {
    return "";
  }

  const holder = processor.createBlock(parent, "open", "", {});
  await processor.parseContent(holder, [
    "[source,text]",
    "----",
    ...footerLines.map(
      (line: string): string =>
        `callout ${calloutNumberFromLine(line)} <${calloutNumberFromLine(line)}>`,
    ),
    "----",
    ...footerLines,
  ]);
  const colist = holder.blocks?.find(isCalloutList);
  return colist ? String(await colist.convert()) : "";
}

async function manualCalloutsHtml(
  processor: ComponentBlockProcessor,
  parent: Block | Section,
  lines: string[],
): Promise<string> {
  if (!lines.length) {
    return "";
  }
  const holder = processor.createBlock(parent, "open", "", {});
  await processor.parseContent(holder, lines);
  return (
    await Promise.all(
      (holder.blocks || []).map(
        async (block: ComponentBlockNode): Promise<string> =>
          block.convert ? String(await block.convert()) : "",
      ),
    )
  ).join("\n");
}

function calloutNumberFromLine(line: string): string {
  return /^<(\d+)>/.exec(String(line || "").trim())?.[1] || "1";
}

function snippetIdSeed(
  reader: Reader | CalloutReader | undefined,
  payload: SnippetPayload,
): string {
  const cursor = (reader as Reader | undefined)?.cursor;
  return [
    cursor?.path || cursor?.file || "",
    cursor?.lineno || "",
    payload.kind || "",
    payload.title || "",
  ].join(":");
}

async function highlightedCodeInnerHtml(
  source: unknown,
  highlighterLanguage: string,
  displayLanguage: string,
): Promise<string> {
  const markedSource = encodeCalloutMarkers(
    normalizeStandaloneCalloutLines(
      String(source || "").trimEnd(),
      displayLanguage,
    ),
  );
  let highlighted;
  try {
    highlighted = await codeToHtml(markedSource, {
      lang: shikiLanguage(highlighterLanguage),
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
    });
  } catch {
    highlighted = await codeToHtml(markedSource, {
      lang: "text",
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
    });
  }

  return codeElementInnerHtml(highlighted)
    .replace(/&#x3C;(\d+)>/g, '<i class="conum" data-value="$1"></i>')
    .replace(
      new RegExp(`${CALLOUT_MARKER_PREFIX}(\\d+)${CALLOUT_MARKER_SUFFIX}`, "g"),
      '<i class="conum" data-value="$1"></i>',
    );
}

function codeElementInnerHtml(value: string): string {
  return /<code(?:\s[^>]*)?>([\s\S]*)<\/code>/.exec(value)?.[1] || value;
}

function encodeCalloutMarkers(source: string): string {
  return source.replace(
    /<!--(\d+)-->|<(\d+)>/g,
    (_match: string, xmlCommentNumber: string, angleNumber: string): string =>
      `${CALLOUT_MARKER_PREFIX}${xmlCommentNumber || angleNumber}${CALLOUT_MARKER_SUFFIX}`,
  );
}

async function absorbFollowingCalloutLines(
  reader: CalloutReader | undefined,
  payload: SnippetPayload,
  options: {
    collectManualCallouts?: (lines: string[]) => void;
    manualCalloutsClass?: string;
  } = {},
): Promise<SnippetPayload> {
  if (!reader) {
    return payload;
  }
  const manualCalloutsClass =
    options.manualCalloutsClass || MANUAL_CALLOUTS_CLASS;
  await consumeSnippetCalloutValidationListing(reader);
  const leadingBlankLines = await readLeadingBlankLines(reader);
  const items = await readCalloutListItems(reader);

  if (!items.length) {
    reader.unshiftLines(leadingBlankLines);
    return payload;
  }

  const sourceNumbers = payloadCalloutNumbers(payload);
  const snippetItems = items.filter((item) => sourceNumbers.has(item.number));
  const manualItems = items.filter((item) => !sourceNumbers.has(item.number));
  if (manualItems.length) {
    const lines = manualCalloutBlockLines(manualItems, manualCalloutsClass);
    if (options.collectManualCallouts) {
      options.collectManualCallouts(lines);
    } else {
      reader.unshiftLines(lines);
    }
  }
  if (!snippetItems.length) {
    return payload;
  }

  const numberMap = new Map<string, string>();
  for (const item of snippetItems) {
    if (!numberMap.has(item.number)) {
      numberMap.set(item.number, String(numberMap.size + 1));
    }
  }

  return {
    ...payload,
    samples: renumberPayloadSamples(payload.samples, numberMap),
    footerSource: snippetItems
      .map((item) => replaceSourceCalloutNumbers(item.line, numberMap))
      .join("\n"),
  };
}

function isListingDelimiter(line: string): boolean {
  return /^-{4,}$/.test(line.trim());
}

function isCalloutListItem(line: string): boolean {
  return /^<(\.|\d+)>/.test(line);
}

async function consumeSnippetCalloutValidationListing(
  reader: CalloutReader,
): Promise<void> {
  const roleLine = await reader.peekLine();
  if (roleLine?.trim() !== `[.${SNIPPET_CALLOUT_VALIDATION_CLASS}]`) {
    return;
  }

  const consumed = [await reader.readLine()].filter(
    (line): line is string => line !== undefined,
  );
  const delimiter = await reader.peekLine();
  if (!delimiter || !isListingDelimiter(delimiter)) {
    reader.unshiftLines(consumed);
    return;
  }
  consumed.push((await reader.readLine()) || "");

  for (;;) {
    const line = await reader.readLine();
    if (line === undefined) {
      return;
    }
    if (line.trim() === delimiter.trim()) {
      return;
    }
  }
}

async function readLeadingBlankLines(reader: CalloutReader): Promise<string[]> {
  const lines: string[] = [];
  for (;;) {
    const line = await reader.peekLine();
    if (line === undefined || line.trim()) {
      return lines;
    }
    lines.push((await reader.readLine()) || "");
  }
}

async function readCalloutListItems(
  reader: CalloutReader,
): Promise<CalloutItem[]> {
  const items: CalloutItem[] = [];
  let nextCallout = 1;
  for (;;) {
    const line = await reader.peekLine();
    if (line === undefined) {
      return items;
    }
    const match = /^<(\.|\d+)>\s*(.*)$/.exec(line);
    if (match) {
      await reader.readLine();
      const number =
        match[1] === "." ? String(nextCallout) : String(Number(match[1]));
      nextCallout = Number(number) + 1;
      items.push({
        line: line.replace(/^<(\.|\d+)>/, `<${number}>`),
        number,
        text: match[2],
      });
      continue;
    }
    if (
      items.length &&
      !line.trim() &&
      (await nextNonBlankLineIsCallout(reader))
    ) {
      await reader.readLine();
      continue;
    }
    return items;
  }
}

function payloadCalloutNumbers(payload: SnippetPayload): Set<string> {
  const numbers = new Set<string>();
  for (const sample of normalizeSnippetSamples(payload.samples)) {
    for (const match of sample.source.matchAll(/<(\d+)>|<!--(\d+)-->/g)) {
      numbers.add(match[1] || match[2]);
    }
  }
  return numbers;
}

function renumberPayloadSamples(
  samples: unknown,
  numberMap: Map<string, string>,
): NormalizedSnippetSample[] {
  return normalizeSnippetSamples(samples).map((sample) => ({
    ...sample,
    source: replaceSourceCalloutNumbers(sample.source || "", numberMap),
  }));
}

function replaceSourceCalloutNumbers(
  source: unknown,
  numberMap: Map<string, string>,
): string {
  return String(source).replace(
    /<(\d+)>|<!--(\d+)-->/g,
    (match: string, xmlNumber: string, commentNumber: string): string => {
      const nextNumber = numberMap.get(xmlNumber || commentNumber);
      if (!nextNumber) {
        return match;
      }
      return xmlNumber ? `<${nextNumber}>` : `<!--${nextNumber}-->`;
    },
  );
}

function manualCalloutBlockLines(
  items: CalloutItem[],
  manualCalloutsClass: string,
): string[] {
  return [
    `[.${manualCalloutsClass}]`,
    ...items.map((item) => `. ${item.text}`),
    "",
  ];
}

async function nextNonBlankLineIsCallout(
  reader: CalloutReader,
): Promise<boolean> {
  const consumed = [];
  for (;;) {
    const line = await reader.readLine();
    if (line === undefined) {
      reader.unshiftLines(consumed);
      return false;
    }
    consumed.push(line);
    if (!line.trim()) {
      continue;
    }
    reader.unshiftLines(consumed);
    return isCalloutListItem(line);
  }
}

function isCalloutList(node: unknown): node is ComponentBlockNode {
  const candidate = node as ComponentBlockNode;
  return Boolean(
    node && typeof node === "object" && candidate.context === "colist",
  );
}

function inlineTitleHtml(value: unknown): string {
  return html(value).replace(
    /`([^`\r\n]+)`/g,
    (_match: string, code: string): string => `<code>${code}</code>`,
  );
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
