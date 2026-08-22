// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  Inline,
  InlineMacroProcessor,
  InlineMacroProcessorDslInterface,
  Registry,
} from "@asciidoctor/core";
import { type MacroAttributes, macroAttribute } from "./macro-attributes.ts";

type PackageMacroContext = {
  project?: {
    slug?: string;
  };
  attributes?: Record<string, unknown>;
};

export function registerPackageMacro(
  registry: Registry,
  context: PackageMacroContext,
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
          attrs as Record<string, unknown>,
        );
        return this.createInline(parent as Block, "anchor", link.label, {
          type: "link",
          target: link.href,
        });
      });
    },
  );
}

function packageLink(
  context: PackageMacroContext,
  target: string,
  attrs: MacroAttributes,
): { href: string; label: string } {
  let packageName = target;
  if (!packageName.startsWith("io.micronaut.")) {
    packageName = `io.micronaut.${packageName}`;
  }
  const projectSlug =
    context.project?.slug || String(context.attributes?.projectSlug || "core");
  return {
    href: `assets/${projectSlug}/docs/api/${packageName.replaceAll(".", "/")}/package-summary.html`,
    label: macroText(attrs) || packageName,
  };
}

function macroText(attrs: MacroAttributes): string {
  const positional = Array.isArray(attrs.$positional)
    ? String(attrs.$positional[0] ?? "")
    : "";
  return macroAttribute(attrs, "text") || positional;
}
