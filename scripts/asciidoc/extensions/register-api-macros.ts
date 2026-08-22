import type { Registry } from "@asciidoctor/core";

import {
  API_MACRO_KINDS,
  type ApiMacroContext,
  apiLink,
} from "../api-links.ts";
import { defineInlineMacro } from "./define.ts";

export function registerApiMacros(
  registry: Registry,
  context: ApiMacroContext,
): void {
  for (const kind of API_MACRO_KINDS) {
    defineInlineMacro(registry, kind, function (parent, target, attributes) {
      const link = apiLink(context, kind, target, attributes);
      return this.createInline(parent, "anchor", link.label, {
        type: "link",
        target: link.href,
      });
    });
  }
}
