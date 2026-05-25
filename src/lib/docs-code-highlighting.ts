import * as parse5 from "parse5";
import { codeToHtml } from "shiki";
import type { DefaultTreeAdapterMap } from "parse5";

type HighlightableVariant = {
  code: string;
  highlightedHtml?: string;
  highlighterLanguage?: string;
  language: string;
};

type HighlightableExample = {
  variants: HighlightableVariant[];
};

const shikiThemes = {
  light: "github-light-default",
  dark: "github-dark-default"
} as const;
const calloutMarkerPrefix = "__MICRONAUT_CALLOUT_";
const calloutMarkerSuffix = "__";

const shikiLanguageAliases: Record<string, string> = {
  bash: "shellscript",
  console: "shellscript",
  gradle: "kotlin",
  "gradle-groovy": "groovy",
  "gradle-kotlin": "kotlin",
  hocon: "hocon",
  maven: "xml",
  pom: "xml",
  properties: "properties",
  sh: "shellscript",
  shell: "shellscript",
  text: "text",
  toml: "toml",
  txt: "text",
  yaml: "yaml",
  yml: "yaml",
  zsh: "shellscript"
};

export async function highlightCodeSnippetHtml(code: string, language: string) {
  let highlighted: string;
  const markedCode = encodeCalloutMarkers(code.trimEnd());
  try {
    highlighted = await codeToHtml(markedCode, {
      lang: shikiLanguage(language),
      themes: shikiThemes
    });
  } catch {
    highlighted = await codeToHtml(markedCode, {
      lang: "text",
      themes: shikiThemes
    });
  }

  return extractCodeHtml(highlighted)
    .replace(/&#x3C;(\d+)>/g, '<i class="conum" data-value="$1"></i>')
    .replace(new RegExp(`${calloutMarkerPrefix}(\\d+)${calloutMarkerSuffix}`, "g"), '<i class="conum" data-value="$1"></i>');
}

export async function highlightCodeSnippetVariants<T extends HighlightableVariant>(variants: T[]) {
  return Promise.all(
    variants.map(async (variant) => ({
      ...variant,
      highlightedHtml: await highlightCodeSnippetHtml(
        variant.code,
        variant.highlighterLanguage || variant.language
      )
    }))
  );
}

export async function highlightCodeSnippetExamples<T extends HighlightableExample>(examples: T[]) {
  return Promise.all(
    examples.map(async (example) => ({
      ...example,
      variants: await highlightCodeSnippetVariants(example.variants)
    }))
  );
}

function shikiLanguage(language: string) {
  const normalized = language.trim().toLowerCase();
  return shikiLanguageAliases[normalized] || normalized || "text";
}

function extractCodeHtml(source: string) {
  const fragment = parse5.parseFragment(source);
  const code = firstDescendant(fragment, (node): node is DefaultTreeAdapterMap["element"] =>
    "tagName" in node && node.tagName === "code"
  );
  if (!code) {
    return "";
  }
  return code.childNodes.map((child) => serializeNode(child)).join("");
}

function encodeCalloutMarkers(source: string) {
  return source.replace(/<(\d+)>/g, `${calloutMarkerPrefix}$1${calloutMarkerSuffix}`);
}

function firstDescendant<T extends DefaultTreeAdapterMap["node"]>(
  node: DefaultTreeAdapterMap["node"],
  predicate: (node: DefaultTreeAdapterMap["node"]) => node is T
): T | undefined {
  if (predicate(node)) {
    return node;
  }
  if (!("childNodes" in node)) {
    return undefined;
  }
  for (const child of node.childNodes) {
    const found = firstDescendant(child, predicate);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function serializeNode(node: DefaultTreeAdapterMap["childNode"]) {
  return parse5.serialize({
    childNodes: [node],
    nodeName: "#document-fragment"
  });
}
