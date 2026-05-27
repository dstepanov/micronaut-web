import { parseAttributeList } from "./adoc-attributes.ts";
import { configurationSamples } from "./configuration-samples.ts";
import { snippetPassthroughBlock } from "./snippet-blocks.ts";

export function renderConfigurationBlocksInSource(source: any): any {
  return source.replace(
    /^\[configuration([^\]\r\n]*)\]\s*\r?\n----\r?\n([\s\S]*?)\r?\n----/gm,
    (_: any, rawAttributes: any, configurationSource: any): any => {
      const attributes = parseAttributeList(rawAttributes || "");
      const title = attributes.title || "";
      return snippetPassthroughBlock("code", {
        title,
        samples: configurationSamples(configurationSource),
      });
    },
  );
}
