import type {
  Block,
  BlockProcessor,
  BlockProcessorDslInterface,
  Reader,
  Registry,
  Section,
} from "@asciidoctor/core";
import yaml from "js-yaml";
import { stringify as stringifyToml } from "smol-toml";

import { renderSnippetBlock } from "./snippet-block-renderer.ts";

export function registerConfigurationBlock(registry: Registry): void {
  registry.block(function registerConfigurationBlock(
    this: BlockProcessorDslInterface,
  ): void {
    this.named("configuration");
    this.onContext("listing");
    this.process(async function processConfigurationBlock(
      this: BlockProcessor,
      parent: unknown,
      reader: unknown,
      attrs: unknown,
    ): Promise<Block> {
      const attributes = attrs as Record<string, unknown>;
      return renderSnippetBlock(this, parent as Block | Section, {
        kind: "code",
        samples: configurationSamples(
          (await (reader as Reader).readLines()).join("\n"),
        ),
        title: String(attributes.title || ""),
      });
    });
  });
}

const GROOVY_KEYWORDS = new Set([
  "abstract",
  "as",
  "assert",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "continue",
  "def",
  "default",
  "double",
  "else",
  "enum",
  "extends",
  "false",
  "final",
  "finally",
  "float",
  "for",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "int",
  "interface",
  "long",
  "native",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "strictfp",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "transient",
  "true",
  "try",
  "void",
  "volatile",
  "while",
]);

type ConfigurationSample = {
  language: string;
  highlighterLanguage: string;
  source: string;
};

type FlattenedConfiguration = {
  path: string[];
  value: unknown;
};

function configurationSamples(source: string): ConfigurationSample[] {
  const parsed = parseConfigurationSource(source);
  return [
    {
      language: "properties",
      highlighterLanguage: "properties",
      source: parsed === undefined ? source : toJavaProperties(parsed),
    },
    {
      language: "yaml",
      highlighterLanguage: "yaml",
      source,
    },
    {
      language: "toml",
      highlighterLanguage: "toml",
      source: parsed === undefined ? source : toTomlSource(parsed),
    },
    {
      language: "groovy-config",
      highlighterLanguage: "groovy",
      source: parsed === undefined ? source : toGroovyConfig(parsed),
    },
    {
      language: "hocon",
      highlighterLanguage: "hocon",
      source: parsed === undefined ? source : toHocon(parsed),
    },
    {
      language: "json-config",
      highlighterLanguage: "json",
      source: parsed === undefined ? source : JSON.stringify(parsed, null, 2),
    },
  ].filter((sample) => sample.source.trim());
}

function parseConfigurationSource(source: string): unknown {
  try {
    return yaml.load(source);
  } catch {
    return undefined;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toJavaProperties(value: unknown): string {
  return flattenConfiguration(value)
    .map(
      ({ path: propertyPath, value: propertyValue }) =>
        `${propertyPath.join(".")}=${formatPropertiesValue(propertyValue)}`,
    )
    .join("\n");
}

function flattenConfiguration(
  value: unknown,
  propertyPath: string[] = [],
): FlattenedConfiguration[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenConfiguration(item, [
        ...propertyPath.slice(0, -1),
        `${propertyPath.at(-1) || ""}[${index}]`,
      ]),
    );
  }
  if (isPlainObject(value)) {
    return Object.entries(value).flatMap(([key, item]) =>
      flattenConfiguration(item, [...propertyPath, key]),
    );
  }
  return propertyPath.length ? [{ path: propertyPath, value }] : [];
}

function formatPropertiesValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.map(formatPropertiesValue).join(",");
  }
  return String(value);
}

function toTomlSource(value: unknown): string {
  if (isPlainObject(value)) {
    return stringifyToml(value).trim();
  }
  return formatTomlValue(value);
}

function formatTomlValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(formatTomlValue).join(", ")}]`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return '""';
  }
  return JSON.stringify(String(value));
}

function toGroovyConfig(value: unknown): string {
  if (!isPlainObject(value)) {
    return formatGroovyValue(value);
  }
  return Object.entries(value)
    .map(([key, item]) => formatGroovyEntry(key, item, 0))
    .join("\n");
}

function formatGroovyEntry(key: string, value: unknown, depth: number): string {
  const indent = "  ".repeat(depth);
  const token = formatGroovyKey(key);
  if (isPlainObject(value)) {
    const children = Object.entries(value)
      .map(([childKey, child]) => formatGroovyEntry(childKey, child, depth + 1))
      .join("\n");
    return `${indent}${token} {\n${children}\n${indent}}`;
  }
  return `${indent}${token} = ${formatGroovyValue(value)}`;
}

function formatGroovyKey(key: string): string {
  if (GROOVY_KEYWORDS.has(key) || /[^\x00-\x7F]/.test(key)) {
    return `'${String(key).replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
  }
  return String(key).replace(
    /-([A-Za-z0-9])/g,
    (_match: string, char: string): string => char.toUpperCase(),
  );
}

function formatGroovyValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(formatGroovyValue).join(", ")}]`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "null";
  }
  return `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
}

function toHocon(value: unknown): string {
  return formatHoconValue(value, 0);
}

function formatHoconValue(value: unknown, depth: number): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => formatHoconValue(item, depth)).join(", ")}]`;
  }
  if (isPlainObject(value)) {
    const indent = "  ".repeat(depth);
    const childIndent = "  ".repeat(depth + 1);
    const entries = Object.entries(value).map(
      ([key, item]) =>
        `${childIndent}${key} = ${formatHoconValue(item, depth + 1)}`,
    );
    return `{\n${entries.join("\n")}\n${indent}}`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "null";
  }
  return JSON.stringify(String(value));
}
