// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  Inline,
  InlineMacroProcessor,
  InlineMacroProcessorDslInterface,
  Registry,
} from "@asciidoctor/core";
import {
  type MacroAttributes,
  macroAttribute,
} from "../../asciidoc/extensions/macro-attributes.ts";

export function registerGuideLinkMacro(registry: Registry): void {
  registry.inlineMacro(
    "guideLink",
    function registerGuideLinkMacro(
      this: InlineMacroProcessorDslInterface,
    ): void {
      this.process(function processGuideLinkMacro(
        this: InlineMacroProcessor,
        parent: unknown,
        target: unknown,
        attrs: unknown,
      ): Inline {
        return this.createInline(
          parent as Block,
          "anchor",
          String(macroText(attrs as Record<string, unknown>)),
          {
            type: "link",
            target: `${String(target)}.html`,
          },
        );
      });
    },
  );
}

function macroText(attrs: MacroAttributes): string {
  const positional = Array.isArray(attrs.$positional)
    ? String(attrs.$positional[0] ?? "")
    : "";
  return macroAttribute(attrs, "text") || positional;
}
