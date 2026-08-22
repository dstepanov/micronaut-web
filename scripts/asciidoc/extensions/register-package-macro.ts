// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  Inline,
  InlineMacroProcessor,
  InlineMacroProcessorDslInterface,
  Registry,
} from "@asciidoctor/core";

import { type ApiMacroContext, packageLink } from "../api-links.ts";
import type { MacroAttributes } from "./macro-attributes.ts";

export function registerPackageMacro(
  registry: Registry,
  context: ApiMacroContext,
): void {
  registry.inlineMacro(
    "pkg",
    function registerPackageMacro(
      this: InlineMacroProcessorDslInterface,
    ): void {
      this.process(function processPackageMacro(
        this: InlineMacroProcessor,
        parent: unknown,
        target: unknown,
        attrs: unknown,
      ): Inline {
        const link = packageLink(
          context,
          String(target),
          attrs as MacroAttributes,
        );
        return this.createInline(parent as Block, "anchor", link.label, {
          type: "link",
          target: link.href,
        });
      });
    },
  );
}
