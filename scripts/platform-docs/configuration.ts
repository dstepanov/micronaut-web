import { parseAttributeList } from "./adoc-attributes.ts";
import { configurationSamples } from "./configuration-samples.ts";
import { snippetMarkerHtml } from "./snippet-markers.ts";

export function renderConfigurationBlocksInSource(source) {
  return source.replace(
    /^\[configuration([^\]\r\n]*)\]\s*\r?\n----\r?\n([\s\S]*?)\r?\n----/gm,
    (_, rawAttributes, configurationSource) => {
      const attributes = parseAttributeList(rawAttributes || "");
      const title = attributes.title || "";
      const marker = snippetMarkerHtml("code", {
        title,
        samples: configurationSamples(configurationSource)
      });
      return `++++\n${marker}\n++++`;
    }
  );
}
