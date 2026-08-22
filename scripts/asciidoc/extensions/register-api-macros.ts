// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  Inline,
  InlineMacroProcessor,
  InlineMacroProcessorDslInterface,
  Registry,
} from "@asciidoctor/core";

import {
  API_MACRO_KINDS,
  type ApiMacroContext,
  apiLink,
} from "../api-links.ts";
import type { MacroAttributes } from "./macro-attributes.ts";

export function registerApiMacros(
  registry: Registry,
  context: ApiMacroContext,
): void {
  for (const kind of API_MACRO_KINDS) {
    registry.inlineMacro(
      kind,
      function registerApiMacro(this: InlineMacroProcessorDslInterface): void {
        this.process(function processApiMacro(
          this: InlineMacroProcessor,
          parent: unknown,
          target: unknown,
          attrs: unknown,
        ): Inline {
          const link = apiLink(
            context,
            kind,
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
}
