// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  BlockProcessor,
  BlockProcessorDslInterface,
  Reader,
  Registry,
  Section,
} from "@asciidoctor/core";

import { configurationSamples } from "../configuration-formats.ts";
import { renderSnippetBlock } from "./snippet-block-renderer.ts";

export function registerConfigurationBlock(registry: Registry): void {
  registry.block(function registerConfigurationBlock(
    this: BlockProcessorDslInterface,
  ): void {
    this.named("configuration");
    this.onContext("listing");
    this.process(async function processConfigurationBlock(
      this: BlockProcessor,
      parent: unknown,
      reader: unknown,
      attrs: unknown,
    ): Promise<Block> {
      const attributes = attrs as Record<string, unknown>;
      return renderSnippetBlock(this, parent as Block | Section, {
        kind: "code",
        samples: configurationSamples(
          (await (reader as Reader).readLines()).join("\n"),
        ),
        title: String(attributes.title || ""),
      });
    });
  });
}
