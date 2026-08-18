import type {
  Block,
  BlockMacroProcessor,
  BlockProcessor,
  BlockProcessorDslInterface,
  MacroProcessorDslInterface,
  Registry,
  Section,
} from "@asciidoctor/core";

import {
  type SnippetPayload,
  renderSnippetBlock,
} from "./snippet-block-renderer.ts";
import { splitList } from "../../shared/cli.ts";

const SNIPPET_BLOCK = "snippet";

type MacroAttributes = Record<string, unknown> & {
  text?: unknown;
  $positional?: unknown;
  _positional?: unknown;
};

type SnippetSample = {
  language: string;
  source: string;
  group?: string;
};

type SnippetSamplesResolver = (
  target: string,
  attrs: MacroAttributes,
  context: Record<string, unknown>,
) => SnippetSample[];

type TargetSnippetPayload = {
  title: string;
  description: string;
  samples: SnippetSample[];
};

export function registerSnippetBlock(
  registry: Registry,
  context: Record<string, unknown>,
  options: { snippetSamples: unknown },
): void {
  registry.blockMacro(
    "snippet",
    function registerSnippetMacro(this: MacroProcessorDslInterface): void {
      this.process(async function processSnippetMacro(
        this: BlockMacroProcessor,
        parent: unknown,
        target: unknown,
        attrs: unknown,
      ): Promise<Block | undefined> {
        const payload = snippetPayloadForTarget(
          String(target),
          attrs as MacroAttributes,
          context,
          options.snippetSamples,
        );
        return payload
          ? renderSnippetBlock(this, parent as Block | Section, {
              ...payload,
              kind: "code",
            })
          : undefined;
      });
    },
  );

  registry.block(function registerSnippetBlock(
    this: BlockProcessorDslInterface,
  ): void {
    this.named(SNIPPET_BLOCK);
    this.onContext("open");
    this.process(async function processSnippetBlock(
      this: BlockProcessor,
      parent: unknown,
      _reader: unknown,
      attrs: unknown,
    ): Promise<Block | undefined> {
      const attributes = attrs as MacroAttributes;
      const blockParent = parent as Block | Section;
      if (attributes?.payload) {
        return renderSnippetBlock(
          this,
          blockParent,
          snippetPayloadFromValue(attributes.payload),
        );
      }
      const target = blockTarget(attributes);
      const payload = snippetPayloadForTarget(
        target,
        attributes,
        context,
        options.snippetSamples,
      );
      if (!payload) {
        return undefined;
      }
      return renderSnippetBlock(this, blockParent, {
        ...payload,
        kind: "code",
      });
    });
  });
}

function snippetPayloadFromValue(value: unknown): SnippetPayload {
  return JSON.parse(
    Buffer.from(String(value || ""), "base64url").toString("utf8"),
  ) as SnippetPayload;
}

function macroAttribute(
  attrs: MacroAttributes | undefined,
  name: string,
): string | undefined {
  if (attrs?.[name] !== undefined) {
    return cleanMacroAttributeValue(String(attrs[name]), name);
  }
  const positional = Array.isArray(attrs?.$positional)
    ? attrs.$positional.join(",")
    : undefined;
  const text = attrs?.text || positional;
  if (typeof text === "string") {
    const match = new RegExp(
      `(?:^|,)\\s*${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^,]+))`,
    ).exec(text);
    if (match) {
      return cleanMacroAttributeValue(
        (match[1] ?? match[2] ?? match[3] ?? "").trim(),
        name,
      );
    }
  }
  return undefined;
}

function cleanMacroAttributeValue(value: string, name: string): string {
  if (name !== "title") {
    return value;
  }
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && !trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && !trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1);
  }
  if (
    (!trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (!trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blockTarget(attrs: MacroAttributes): string {
  const positional = Array.isArray(attrs._positional) ? attrs._positional : [];
  const dollarPositional = Array.isArray(attrs.$positional)
    ? attrs.$positional
    : [];
  return String(
    attrs?.target ||
      attrs?.name ||
      attrs?.[2] ||
      positional[0] ||
      dollarPositional[0] ||
      "",
  );
}

function snippetPayloadForTarget(
  target: string,
  attrs: MacroAttributes,
  context: Record<string, unknown>,
  resolveSamples: unknown,
): TargetSnippetPayload | undefined {
  const deduped = snippetSamples(target, attrs, context, resolveSamples);
  if (!deduped.length) {
    return undefined;
  }
  return {
    title: macroAttribute(attrs, "title") || "",
    description: macroAttribute(attrs, "description") || "",
    samples: deduped,
  };
}

function snippetSamples(
  target: string,
  attrs: MacroAttributes,
  context: Record<string, unknown>,
  resolveSamples: unknown,
): SnippetSample[] {
  if (typeof resolveSamples !== "function") {
    return [];
  }
  const resolver = resolveSamples as SnippetSamplesResolver;
  const samples: SnippetSample[] = [];
  for (const snippetTarget of splitList(target)) {
    const targetSamples = normalizeSamples(
      resolver(snippetTarget, attrs, context),
    );
    samples.push(
      ...targetSamples.map((sample) => ({
        ...sample,
        group: sample.group || snippetTarget,
      })),
    );
  }
  return dedupeSamples(samples);
}

function normalizeSamples(samples: unknown): SnippetSample[] {
  return (Array.isArray(samples) ? samples : []).map((value) => {
    const sample = record(value);
    return {
      language: String(sample.language || "text"),
      source: String(sample.source || ""),
      group: sample.group ? String(sample.group) : undefined,
    };
  });
}

function dedupeSamples(samples: SnippetSample[]): SnippetSample[] {
  const seen = new Set<string>();
  return samples.filter((sample) => {
    const key = `${sample.group || ""}:${sample.language}:${sample.source}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
