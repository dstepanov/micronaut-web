import type { Registry } from "@asciidoctor/core";

import { rewriteDocsSource } from "../docs-source-rewrites.ts";
import { definePreprocessor, replaceReaderLines } from "./define.ts";

export function registerDocsSourcePreprocessor(registry: Registry): void {
  definePreprocessor(registry, (document, reader) =>
    replaceReaderLines(
      document,
      reader,
      rewriteDocsSource(reader.getLines().join("\n")).split(/\r?\n/),
    ),
  );
}
