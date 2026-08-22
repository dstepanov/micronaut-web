// Typed registration helpers for Asciidoctor.js extensions. The Extension API
// types model `process` callbacks loosely (`...args: any[]`) and do not allow
// async processors, so every register file used to opt out of type checking
// entirely. These helpers confine the casts to one place and give the
// processors the signatures they actually receive.
import type {
  AbstractBlock,
  Block,
  BlockMacroProcessor,
  BlockProcessor,
  Document,
  Inline,
  InlineMacroProcessor,
  Reader,
  Registry,
  Section,
} from "@asciidoctor/core";

type ProcessorDsl = {
  named(name: string): void;
  onContext(...contexts: string[]): void;
  process(callback: (...args: never[]) => unknown): void;
};

export type BlockMacroHandler = (
  this: BlockMacroProcessor,
  parent: Block | Section,
  target: string,
  attributes: Record<string, unknown>,
) => Promise<Block | undefined> | Block | undefined;

export type BlockHandler = (
  this: BlockProcessor,
  parent: Block | Section,
  reader: Reader,
  attributes: Record<string, unknown>,
) => Promise<Block | undefined> | Block | undefined;

export type InlineMacroHandler = (
  this: InlineMacroProcessor,
  parent: Block,
  target: string,
  attributes: Record<string, unknown>,
) => Inline;

export function defineBlockMacro(
  registry: Registry,
  name: string,
  handler: BlockMacroHandler,
): void {
  registry.blockMacro(name, function (this: ProcessorDsl): void {
    this.process(function (
      this: BlockMacroProcessor,
      parent: AbstractBlock,
      target: string,
      attributes: Record<string, unknown>,
    ): unknown {
      return handler.call(this, parent as Block | Section, target, attributes);
    });
  });
}

export function defineBlock(
  registry: Registry,
  options: { name: string; context: string },
  handler: BlockHandler,
): void {
  registry.block(function (this: ProcessorDsl): void {
    this.named(options.name);
    this.onContext(options.context);
    this.process(function (
      this: BlockProcessor,
      parent: AbstractBlock,
      reader: Reader,
      attributes: Record<string, unknown>,
    ): unknown {
      return handler.call(this, parent as Block | Section, reader, attributes);
    });
  });
}

export function defineInlineMacro(
  registry: Registry,
  name: string,
  handler: InlineMacroHandler,
): void {
  registry.inlineMacro(name, function (this: ProcessorDsl): void {
    this.process(function (
      this: InlineMacroProcessor,
      parent: AbstractBlock,
      target: string,
      attributes: Record<string, unknown>,
    ): Inline {
      return handler.call(this, parent as Block, target, attributes);
    });
  });
}

export function definePreprocessor(
  registry: Registry,
  handler: (document: Document, reader: Reader) => Reader | undefined,
): void {
  registry.preprocessor(function (this: ProcessorDsl): void {
    this.process(handler);
  });
}

export function defineTreeProcessor(
  registry: Registry,
  handler: (document: Document) => void,
): void {
  registry.treeProcessor(function (this: ProcessorDsl): void {
    this.process(handler);
  });
}

// Replaces the reader's remaining lines, keeping its cursor for diagnostics.
export function replaceReaderLines(
  document: Document,
  reader: Reader,
  lines: string[],
): Reader {
  const ReaderConstructor = reader.constructor as new (
    document: Document,
    lines: string[],
    cursor: unknown,
    options: Record<string, unknown>,
  ) => Reader;
  return new ReaderConstructor(document, lines, reader.cursor, {});
}
