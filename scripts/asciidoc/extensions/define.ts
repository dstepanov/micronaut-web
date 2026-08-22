// Typed registration helpers for Asciidoctor.js extensions. The Extension API
// types the `process` callbacks with a synchronous return type and bind `this`
// to the DSL interface, while this pipeline's processors are async. These
// helpers confine the resulting casts to one place and give the processors
// the signatures they actually receive.
import type {
  AbstractBlock,
  Block,
  BlockMacroProcessorDslInterface,
  BlockProcessorDslInterface,
  Document,
  Inline,
  InlineMacroProcessorDslInterface,
  PreprocessorDslInterface,
  Reader,
  Registry,
  Section,
  TreeProcessorDslInterface,
} from "@asciidoctor/core";

// The part of a processor that the snippet renderer and the guide content
// macros use to build blocks.
export type BlockBuilder = {
  createBlock(
    parent: Block | Section,
    context: string,
    source: string | string[] | null,
    attrs: object,
  ): Block;
  parseContent(parent: Block | Section, content: string[]): Promise<unknown>;
};

export type InlineBuilder = {
  createInline(
    parent: Block,
    context: string,
    text: string,
    opts?: object,
  ): Inline;
};

export type BlockMacroHandler = (
  this: BlockBuilder,
  parent: Block | Section,
  target: string,
  attributes: Record<string, unknown>,
) => Promise<Block | undefined> | Block | undefined;

export type BlockHandler = (
  this: BlockBuilder,
  parent: Block | Section,
  reader: Reader,
  attributes: Record<string, unknown>,
) => Promise<Block | undefined> | Block | undefined;

export type InlineMacroHandler = (
  this: InlineBuilder,
  parent: Block,
  target: string,
  attributes: Record<string, unknown>,
) => Inline;

// Asciidoctor.js awaits the returned promise; the DSL type only models the
// synchronous shape.
function asSyncResult(result: unknown): AbstractBlock | undefined {
  return result as AbstractBlock | undefined;
}

export function defineBlockMacro(
  registry: Registry,
  name: string,
  handler: BlockMacroHandler,
): void {
  registry.blockMacro(name, function (this: BlockMacroProcessorDslInterface) {
    this.process(function (parent, target, attributes) {
      return asSyncResult(
        handler.call(this, parent as Block | Section, target, attributes),
      );
    });
  });
}

export function defineBlock(
  registry: Registry,
  options: { name: string; context: string },
  handler: BlockHandler,
): void {
  registry.block(function (this: BlockProcessorDslInterface) {
    this.named(options.name);
    this.onContext(options.context);
    this.process(function (parent, reader, attributes) {
      return asSyncResult(
        handler.call(this, parent as Block | Section, reader, attributes),
      );
    });
  });
}

export function defineInlineMacro(
  registry: Registry,
  name: string,
  handler: InlineMacroHandler,
): void {
  registry.inlineMacro(name, function (this: InlineMacroProcessorDslInterface) {
    this.process(function (parent, target, attributes) {
      return handler.call(this, parent as Block, target, attributes);
    });
  });
}

export function definePreprocessor(
  registry: Registry,
  handler: (document: Document, reader: Reader) => Reader,
): void {
  registry.preprocessor(function (this: PreprocessorDslInterface) {
    this.process(function (document, reader) {
      return handler(document, reader);
    });
  });
}

export function defineTreeProcessor(
  registry: Registry,
  handler: (document: Document) => void,
): void {
  registry.treeProcessor(function (this: TreeProcessorDslInterface) {
    this.process(function (document) {
      handler(document);
    });
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
