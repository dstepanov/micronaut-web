// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  BlockProcessor,
  BlockProcessorDslInterface,
  Registry,
  Section,
} from "@asciidoctor/core";

import {
  type MacroPayload,
  decodeBlockPayload,
} from "../../asciidoc/extensions/block-payload.ts";

export type GuideContentResolver = (payload: MacroPayload) => Promise<string[]>;

export function registerGuideContentBlock(
  registry: Registry,
  blockName: string,
  resolveLines: GuideContentResolver,
): void {
  registry.block(function registerGuideContentBlock(
    this: BlockProcessorDslInterface,
  ): void {
    this.named(blockName);
    this.onContext("open");
    this.process(async function processGuideContentBlock(
      this: BlockProcessor,
      parent: unknown,
      _reader: unknown,
      attrs: unknown,
    ): Promise<Block> {
      const attributes = attrs as Record<string, unknown>;
      const holder = this.createBlock(
        parent as Block | Section,
        "open",
        "",
        {},
      );
      const lines = await resolveLines(
        decodeBlockPayload<MacroPayload>(attributes.payload),
      );
      await this.parseContent(
        guideContentParseTarget(parent, holder, lines),
        lines,
      );
      return holder;
    });
  });
}

// Lines that introduce a section must be parsed against the real parent so the
// section lands in the document outline rather than inside a holder block.
export function guideContentParseTarget(
  parent: unknown,
  holder: Block,
  lines: string[],
): Block | Section {
  return lines.some((line) => /^={1,6}\s+\S/.test(line))
    ? (parent as Block | Section)
    : holder;
}
