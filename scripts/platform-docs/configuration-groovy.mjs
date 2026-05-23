import { isPlainObject } from "./configuration-values.mjs";

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

export function toGroovyConfig(value) {
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
