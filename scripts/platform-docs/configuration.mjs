import { parseAttributeList } from "./adoc-attributes.mjs";
import { configurationSamples } from "./configuration-samples.mjs";
import { listingBlockHtml } from "./listing.mjs";

export function renderConfigurationBlocksInSource(source) {
  return source.replace(
    /^\[configuration([^\]\r\n]*)\]\s*\r?\n----\r?\n([\s\S]*?)\r?\n----/gm,
    (_, rawAttributes, configurationSource) => {
      const attributes = parseAttributeList(rawAttributes || "");
      const title = attributes.title || "";
      const blocks = configurationSamples(configurationSource)
        .map((sample) => listingBlockHtml(sample.source, sample.language, title, "multi-language-sample", sample.highlighterLanguage))
        .join("\n");
      return `++++\n${blocks}\n++++`;
    }
  );
}
