import type { Registry } from "@asciidoctor/core";

import { defineInlineMacro } from "../../asciidoc/extensions/define.ts";
import { macroText } from "../../asciidoc/extensions/macro-attributes.ts";

export function registerGuideLinkMacro(registry: Registry): void {
  defineInlineMacro(
    registry,
    "guideLink",
    function (parent, target, attributes) {
      return this.createInline(parent, "anchor", macroText(attributes), {
        type: "link",
        target: `${target}.html`,
      });
    },
  );
}
