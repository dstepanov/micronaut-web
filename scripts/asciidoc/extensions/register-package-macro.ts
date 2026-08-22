import type { Registry } from "@asciidoctor/core";

import { type ApiMacroContext, packageLink } from "../api-links.ts";
import { defineInlineMacro } from "./define.ts";

export function registerPackageMacro(
  registry: Registry,
  context: ApiMacroContext,
): void {
  defineInlineMacro(registry, "pkg", function (parent, target, attributes) {
    const link = packageLink(context, target, attributes);
    return this.createInline(parent, "anchor", link.label, {
      type: "link",
      target: link.href,
    });
  });
}
