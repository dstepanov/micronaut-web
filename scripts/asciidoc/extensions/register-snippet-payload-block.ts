// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  BlockProcessor,
  BlockProcessorDslInterface,
  Registry,
  Section,
} from "@asciidoctor/core";

import { decodeBlockPayload } from "./block-payload.ts";
import {
  type SnippetPayload,
  renderSnippetBlock,
} from "./snippet-block-renderer.ts";

export function registerSnippetPayloadBlock(
  registry: Registry,
  blockName: string,
): void {
  registry.block(function registerSnippetPayloadBlock(
    this: BlockProcessorDslInterface,
  ): void {
    this.named(blockName);
    this.onContext("open");
    this.process(async function processSnippetPayloadBlock(
      this: BlockProcessor,
      parent: unknown,
      _reader: unknown,
      attrs: unknown,
    ): Promise<Block | undefined> {
      const attributes = attrs as Record<string, unknown>;
      const payload = attributes?.payload
        ? decodeBlockPayload<SnippetPayload>(attributes.payload)
        : undefined;
      return payload
        ? renderSnippetBlock(this, parent as Block | Section, payload)
        : undefined;
    });
  });
}
