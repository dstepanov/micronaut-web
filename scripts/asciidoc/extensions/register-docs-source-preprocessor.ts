// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  DocumentProcessorDslInterface,
  Reader,
  Registry,
} from "@asciidoctor/core";

import { rewriteDocsSource } from "../docs-source-rewrites.ts";

type ConstructableReader = Reader & {
  constructor: new (
    document: unknown,
    lines: string[],
    cursor: unknown,
    options: Record<string, unknown>,
  ) => Reader;
  cursor: unknown;
  lines: string[];
};

export function registerDocsSourcePreprocessor(registry: Registry): void {
  registry.preprocessor(function registerDocsSourcePreprocessor(
    this: DocumentProcessorDslInterface,
  ): void {
    this.process(function processDocsSourcePreprocessor(
      document: unknown,
      reader: unknown,
    ): Reader {
      const sourceReader = reader as ConstructableReader;
      return new sourceReader.constructor(
        document,
        rewriteDocsSource(sourceReader.lines.join("\n")).split(/\r?\n/),
        sourceReader.cursor,
        {},
      );
    });
  });
}
