import yaml from "js-yaml";
import { stringify as stringifyToml } from "smol-toml";

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
  "while"
]);

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
      source: parsed === undefined ? source : toTomlSource(parsed)
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

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toJavaProperties(value) {
  return flattenConfiguration(value)
    .map(({ path: propertyPath, value: propertyValue }) => `${propertyPath.join(".")}=${formatPropertiesValue(propertyValue)}`)
    .join("\n");
}

function flattenConfiguration(value, propertyPath = []) {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenConfiguration(item, [...propertyPath.slice(0, -1), `${propertyPath.at(-1) || ""}[${index}]`]));
  }
  if (isPlainObject(value)) {
    return Object.entries(value).flatMap(([key, item]) => flattenConfiguration(item, [...propertyPath, key]));
  }
  return propertyPath.length ? [{ path: propertyPath, value }] : [];
}

function formatPropertiesValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.map(formatPropertiesValue).join(",");
  }
  return String(value);
}

function toTomlSource(value) {
  if (isPlainObject(value)) {
    return stringifyToml(value).trim();
  }
  return formatTomlValue(value);
}

function formatTomlValue(value) {
  if (Array.isArray(value)) {
    return `[${value.map(formatTomlValue).join(", ")}]`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "\"\"";
  }
  return JSON.stringify(String(value));
}

function toGroovyConfig(value) {
  if (!isPlainObject(value)) {
    return formatGroovyValue(value);
  }
  return Object.entries(value)
    .map(([key, item]) => formatGroovyEntry(key, item, 0))
    .join("\n");
}

function formatGroovyEntry(key, value, depth) {
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

function formatGroovyKey(key) {
  if (GROOVY_KEYWORDS.has(key) || /[^\x00-\x7F]/.test(key)) {
    return `'${String(key).replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
  }
  return String(key).replace(/-([A-Za-z0-9])/g, (_, char) => char.toUpperCase());
}

function formatGroovyValue(value) {
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

function toHocon(value) {
  return formatHoconValue(value, 0);
}

function formatHoconValue(value, depth) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => formatHoconValue(item, depth)).join(", ")}]`;
  }
  if (isPlainObject(value)) {
    const indent = "  ".repeat(depth);
    const childIndent = "  ".repeat(depth + 1);
    const entries = Object.entries(value).map(([key, item]) => `${childIndent}${key} = ${formatHoconValue(item, depth + 1)}`);
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
