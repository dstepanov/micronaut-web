import type { Registry } from "@asciidoctor/core";

import { splitList } from "../../shared/cli.ts";
import { defineBlockMacro } from "./define.ts";
import {
  type MacroAttributes,
  macroAttribute,
  record,
} from "./macro-attributes.ts";
import {
  type SnippetSample,
  renderSnippetBlock,
} from "./snippet-block-renderer.ts";

// Declared as a method so resolvers that type their own context (the docs
// resolver takes a SnippetContext) remain assignable.
export type SnippetSamplesResolver = {
  resolve(
    target: string,
    attrs: MacroAttributes,
    context: Record<string, unknown>,
  ): SnippetSample[];
}["resolve"];

export function registerSnippetBlock(
  registry: Registry,
  context: Record<string, unknown>,
  options: { snippetSamples: SnippetSamplesResolver },
): void {
  defineBlockMacro(registry, "snippet", function (parent, target, attributes) {
    const samples = snippetSamples(
      target,
      attributes,
      context,
      options.snippetSamples,
    );
    if (!samples.length) {
      return undefined;
    }
    return renderSnippetBlock(this, parent, {
      kind: "code",
      title: macroAttribute(attributes, "title") || "",
      description: macroAttribute(attributes, "description") || "",
      samples,
    });
  });
}

function snippetSamples(
  target: string,
  attrs: MacroAttributes,
  context: Record<string, unknown>,
  resolveSamples: SnippetSamplesResolver,
): SnippetSample[] {
  const samples: SnippetSample[] = [];
  for (const snippetTarget of splitList(target)) {
    const targetSamples = normalizeSamples(
      resolveSamples(snippetTarget, attrs, context),
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
