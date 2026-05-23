import yaml from "js-yaml";

import { toGroovyConfig } from "./configuration-groovy.mjs";
import { toHocon } from "./configuration-hocon.mjs";
import { toJavaProperties } from "./configuration-properties.mjs";
import { toToml } from "./configuration-toml.mjs";

export function configurationSamples(source) {
  const parsed = parseConfigurationSource(source);
  return [
    {
      language: "properties",
      highlighterLanguage: "properties",
      source: parsed === undefined ? source : toJavaProperties(parsed)
    },
    {
      language: "yaml",
      highlighterLanguage: "yaml",
      source
    },
    {
      language: "toml",
      highlighterLanguage: "toml",
      source: parsed === undefined ? source : toToml(parsed)
    },
    {
      language: "groovy-config",
      highlighterLanguage: "groovy",
      source: parsed === undefined ? source : toGroovyConfig(parsed)
    },
    {
      language: "hocon",
      highlighterLanguage: "hocon",
      source: parsed === undefined ? source : toHocon(parsed)
    },
    {
      language: "json-config",
      highlighterLanguage: "json",
      source: parsed === undefined ? source : JSON.stringify(parsed, null, 2)
    }
  ].filter((sample) => sample.source.trim());
}

function parseConfigurationSource(source) {
  try {
    return yaml.load(source);
  } catch {
    return undefined;
  }
}
