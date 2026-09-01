import { Html5Converter } from "@asciidoctor/core";
import type { Registry } from "@asciidoctor/core";

import {
  RENDER_ID_SEED_ATTRIBUTE,
  documentRenderIdSeed,
  renderIdSeed,
} from "../shared/render-id-seed.ts";
import { extractTaggedSource } from "../shared/tagged-source.ts";

import { registerComponentRenderingExtensions } from "./extensions/index.ts";
import { componentFooterHtml } from "./extensions/register-component-footer-processor.ts";
import { multiLanguageSampleAlternates } from "./extensions/register-multi-language-sample-processor.ts";
import {
  precomputeGeneratedInlineText,
  renderGeneratedSnippet,
  renderSnippetVariant,
} from "./extensions/snippet-block-renderer.ts";

type AsciidoctorConvertOptions = Record<string, unknown> & {
  converter?: unknown;
  extension_registry?: Registry;
};

type RenderAsciiDocOptions = {
  asciidoctor: typeof import("@asciidoctor/core");
  source: string;
  convertOptions: AsciidoctorConvertOptions;
  diagnosticsLabel?: string;
  fatalDiagnostic?: (diagnostic: string) => boolean;
  ignoredDiagnostic?: (diagnostic: string) => boolean;
  strict?: boolean;
};

// The listing node as the converter receives it. Only the members the card
// needs are modelled; Asciidoctor.js types the converter callback as `any`.
type AsciidoctorNode = {
  id?: string;
  title?: unknown;
  attributes?: Record<string, unknown>;
  hasTitle?: () => boolean;
  getAttribute?: (name: string) => unknown;
  getSubstitutions?: () => string[];
  subAttributes?: (text: string) => string;
  getDocument?: () => { getAttribute?: (name: string) => unknown } | undefined;
  getSource?: () => string;
};

type AsciidoctorDiagnostic = {
  getSeverity(): string;
  getSourceLocation?: () =>
    | {
        getPath?: () => string | undefined;
        getLineNumber?: () => number | undefined;
      }
    | undefined;
  getText(): string;
};

class MicronautComponentHtmlConverter extends Html5Converter {
  private micronautListingIndex = 0;

  override async convert_listing(node: AsciidoctorNode): Promise<string> {
    const footerHtml = await this.footerHtml(node);
    const generatedIndex = this.micronautListingIndex;
    this.micronautListingIndex += 1;
    return renderListingSnippetCard({
      descriptionHtml: "",
      footerHtml,
      id: node.id || listingSnippetId(node, generatedIndex),
      samples: [node, ...multiLanguageSampleAlternates(node)].map(
        (sample: AsciidoctorNode) => ({
          language: listingBlockLanguage(sample),
          source: listingSource(sample),
        }),
      ),
      titleHtml: node.hasTitle?.() ? String(node.title || "") : "",
    });
  }

  private async footerHtml(node: object): Promise<string> {
    return componentFooterHtml(node, (footerNode) =>
      this.renderFooterColist(footerNode),
    );
  }

  private async renderFooterColist(
    node: Parameters<typeof precomputeGeneratedInlineText>[0],
  ): Promise<string> {
    await precomputeGeneratedInlineText(node);
    return super.convert_colist(node);
  }
}

export async function renderAsciiDoc({
  asciidoctor,
  source,
  convertOptions,
  diagnosticsLabel = "AsciiDoc source",
  fatalDiagnostic,
  ignoredDiagnostic,
  strict = false,
}: RenderAsciiDocOptions): Promise<string> {
  const logger = asciidoctor.MemoryLogger.create();
  const previousLogger = asciidoctor.LoggerManager.getLogger();
  let html: string;
  const extensionRegistry = registerComponentRenderingExtensions(
    asciidoctor,
    convertOptions.extension_registry,
  );
  try {
    asciidoctor.LoggerManager.setLogger(logger);
    html = String(
      await asciidoctor.convert(source, {
        header_footer: false,
        safe: "unsafe",
        ...convertOptions,
        attributes: {
          ...(convertOptions.attributes as Record<string, unknown>),
          [RENDER_ID_SEED_ATTRIBUTE]: renderIdSeed(diagnosticsLabel, source),
        },
        converter: convertOptions.converter || MicronautComponentHtmlConverter,
        extension_registry: extensionRegistry,
      }),
    );
  } finally {
    asciidoctor.LoggerManager.setLogger(previousLogger);
  }

  // Ignored diagnostics are dropped in both modes so that a strict render never
  // reports less than a lenient one; everything that survives is reported in
  // both, and strict additionally fails on the fatal subset.
  const diagnostics = logger
    .getMessages()
    .map(formatAsciidoctorDiagnostic)
    .filter(
      (diagnostic) =>
        !isHandledCalloutDiagnostic(diagnostic) &&
        !ignoredDiagnostic?.(diagnostic),
    );
  if (strict) {
    const fatalDiagnostics = fatalDiagnostic
      ? diagnostics.filter(fatalDiagnostic)
      : diagnostics;
    if (fatalDiagnostics.length) {
      throw new Error(
        `Asciidoctor diagnostics for ${diagnosticsLabel}: ${fatalDiagnostics.join("; ")}`,
      );
    }
  }
  for (const diagnostic of diagnostics) {
    console.warn(diagnostic);
  }

  return html;
}

// Each renderAsciiDoc call gets its own converter instance, so the listing
// counter restarts at zero every call; the render seed keeps ids distinct once
// a page concatenates several renders under one project prefix.
function listingSnippetId(node: AsciidoctorNode, index: number): string {
  const seed = documentRenderIdSeed(node);
  return seed
    ? `generated-listing-snippet-${seed}-${index}`
    : `generated-listing-snippet-${index}`;
}

function listingSource(node: AsciidoctorNode): string {
  // Asciidoctor leaves tag directives in place unless the include selected
  // a tag, so strip them here the same way snippet sources are stripped.
  const source = extractTaggedSource(node.getSource?.() || "", undefined);
  // The raw source is what `getSource()` hands back, so a block that asks for
  // attribute substitution (`subs="verbatim,attributes"`) keeps its `{version}`
  // references until they are substituted here.
  return node.getSubstitutions?.().includes("attributes") && node.subAttributes
    ? node.subAttributes(source)
    : source;
}

function listingBlockLanguage(node: AsciidoctorNode): string {
  return String(
    node.getAttribute?.("language") ||
      node.attributes?.language ||
      node.getAttribute?.("lang") ||
      "text",
  )
    .trim()
    .toLowerCase();
}

async function renderListingSnippetCard({
  descriptionHtml = "",
  footerHtml,
  id,
  samples,
  titleHtml = "",
}: {
  descriptionHtml?: string;
  footerHtml: string;
  id: string;
  samples: Array<{ language: string; source: string }>;
  titleHtml?: string;
}): Promise<string> {
  return renderGeneratedSnippet({
    copyLabel: "Copy code",
    descriptionHtml,
    footerHtml,
    id,
    kind: "code",
    optionsLabel: "Code language",
    titleHtml,
    variants: await Promise.all(
      samples.map((sample, index) =>
        renderSnippetVariant({
          active: index === 0,
          language: sample.language,
          panelId: `${id}-panel-${index}`,
          sample,
          tabId: `${id}-tab-${index}`,
        }),
      ),
    ),
  });
}

function formatAsciidoctorDiagnostic(message: AsciidoctorDiagnostic): string {
  const severity = message.getSeverity();
  const location = message.getSourceLocation?.();
  const pathName = location?.getPath?.();
  const lineNumber = location?.getLineNumber?.();
  const source = pathName
    ? `${pathName}${lineNumber ? `:${lineNumber}` : ""}: `
    : "";
  return `asciidoctor: ${severity}: ${source}${message.getText()}`;
}

function isHandledCalloutDiagnostic(diagnostic: string): boolean {
  // Snippet block processors and listing tree processors render callout lists
  // outside Asciidoctor's built-in callout catalog.
  return [
    /no callout found for <\d+>/i,
    /callout list item index: expected \d+, got \d+/i,
  ].some((pattern) => pattern.test(diagnostic));
}
