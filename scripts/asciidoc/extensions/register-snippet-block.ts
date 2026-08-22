// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  BlockMacroProcessor,
  MacroProcessorDslInterface,
  Registry,
  Section,
} from "@asciidoctor/core";

import {
  type MacroAttributes,
  macroAttribute,
  record,
} from "./macro-attributes.ts";
import {
  type SnippetSample,
  renderSnippetBlock,
} from "./snippet-block-renderer.ts";
import { splitList } from "../../shared/cli.ts";

type SnippetSamplesResolver = (
  target: string,
  attrs: MacroAttributes,
  context: Record<string, unknown>,
) => SnippetSample[];

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
        const attributes = attrs as MacroAttributes;
        const samples = snippetSamples(
          String(target),
          attributes,
          context,
          options.snippetSamples,
        );
        if (!samples.length) {
          return undefined;
        }
        return renderSnippetBlock(this, parent as Block | Section, {
          kind: "code",
          title: macroAttribute(attributes, "title") || "",
          description: macroAttribute(attributes, "description") || "",
          samples,
        });
      });
    },
  );
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

// A multi-target macro may resolve the same file twice (for example when two
// targets share a base directory); only the first occurrence is rendered.
export function dedupeSamples(samples: SnippetSample[]): SnippetSample[] {
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
