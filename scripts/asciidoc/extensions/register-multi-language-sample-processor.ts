import type { Registry } from "@asciidoctor/core";

import { defineTreeProcessor } from "./define.ts";

type SampleBlockNode = {
  attributes?: Record<string, unknown>;
  blocks?: SampleBlockNode[];
  context?: string;
};

const MULTI_LANGUAGE_SAMPLE_ROLE = "multi-language-sample";

const alternateSamples = new WeakMap<object, SampleBlockNode[]>();

// Upstream docs write a language sample per listing and tag the run with the
// `multi-language-sample` role, leaving it to their own page script to fold
// them into tabs. Detaching the alternates lets the converter render the run
// as the one snippet card with a tab per language that this site uses
// everywhere else.
export function registerMultiLanguageSampleProcessor(registry: Registry): void {
  defineTreeProcessor(registry, (document) => {
    groupMultiLanguageSamples(document as unknown as SampleBlockNode);
  });
}

export function multiLanguageSampleAlternates(node: object): SampleBlockNode[] {
  return alternateSamples.get(node) || [];
}

function groupMultiLanguageSamples(parent: SampleBlockNode): void {
  const blocks = parent.blocks || [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    groupMultiLanguageSamples(block);

    if (!isMultiLanguageSample(block)) {
      continue;
    }
    const alternates: SampleBlockNode[] = [];
    while (isMultiLanguageSample(blocks[index + 1])) {
      alternates.push(...blocks.splice(index + 1, 1));
    }
    if (alternates.length) {
      alternateSamples.set(block, alternates);
    }
  }
}

function isMultiLanguageSample(block: SampleBlockNode | undefined): boolean {
  return (
    block?.context === "listing" &&
    String(block.attributes?.role || "")
      .split(/\s+/)
      .includes(MULTI_LANGUAGE_SAMPLE_ROLE)
  );
}
