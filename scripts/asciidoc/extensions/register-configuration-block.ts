import type { Registry } from "@asciidoctor/core";

import { configurationSamples } from "../configuration-formats.ts";
import { defineBlock } from "./define.ts";
import { renderSnippetBlock } from "./snippet-block-renderer.ts";

export function registerConfigurationBlock(registry: Registry): void {
  defineBlock(
    registry,
    { name: "configuration", context: "listing" },
    async function (parent, reader, attributes) {
      return renderSnippetBlock(this, parent, {
        kind: "code",
        samples: configurationSamples((await reader.readLines()).join("\n")),
        title: String(attributes.title || ""),
      });
    },
  );
}
