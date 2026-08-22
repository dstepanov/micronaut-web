// Attribute parsing shared by the block and inline macro processors. Asciidoctor
// hands macros either a parsed attribute map or, for some inline shapes, the
// raw attribute text, so lookups fall back to scanning that text.
import { escapeRegExp } from "../../shared/html.ts";

export type MacroAttributes = Record<string, unknown> & {
  text?: unknown;
  $positional?: unknown;
  _positional?: unknown;
};

export function macroAttribute(
  attrs: MacroAttributes | undefined,
  name: string,
): string | undefined {
  if (attrs?.[name] !== undefined) {
    return cleanMacroAttributeValue(String(attrs[name]), name);
  }
  const positional = Array.isArray(attrs?.$positional)
    ? attrs.$positional.join(",")
    : undefined;
  const text = attrs?.text || positional;
  if (typeof text === "string") {
    const match = new RegExp(
      `(?:^|,)\\s*${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^,]+))`,
    ).exec(text);
    if (match) {
      return cleanMacroAttributeValue(
        (match[1] ?? match[2] ?? match[3] ?? "").trim(),
        name,
      );
    }
  }
  return undefined;
}

// Titles written as title="Foo, bar" get split on the comma by Asciidoctor's
// own attribute parsing, leaving a dangling quote on one side; repair it.
function cleanMacroAttributeValue(value: string, name: string): string {
  if (name !== "title") {
    return value;
  }
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && !trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && !trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1);
  }
  if (
    (!trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (!trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

// The link text of an inline macro: `macro:target[text]` or `text=...`.
export function macroText(attrs: MacroAttributes): string {
  const positional = Array.isArray(attrs.$positional)
    ? String(attrs.$positional[0] ?? "")
    : "";
  return macroAttribute(attrs, "text") || positional;
}

export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

// Parses the attribute text of a macro written as plain source text, e.g. the
// body lines of a `[guide-dependencies]` block or a `callout::x[arg0=1]` line
// the preprocessor expands before Asciidoctor sees it.
export function parseAttributeList(value: string): {
  attributes: Record<string, string>;
  positional: string[];
} {
  const attributes: Record<string, string> = {};
  const positional: string[] = [];
  for (const item of splitAttributeList(value)) {
    const separator = item.indexOf("=");
    if (separator < 0) {
      const positionalValue = stripQuotes(item);
      if (positionalValue) {
        positional.push(positionalValue);
      }
      continue;
    }
    const key = item.slice(0, separator).trim();
    if (key) {
      attributes[key] = stripQuotes(item.slice(separator + 1).trim());
    }
  }
  return { attributes, positional };
}

function splitAttributeList(value: string): string[] {
  const items: string[] = [];
  let current = "";
  let quote = "";
  for (const char of value || "") {
    if (quote) {
      if (char === quote) {
        quote = "";
      }
      current += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === ",") {
      items.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) {
    items.push(current.trim());
  }
  return items;
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

// The target and attributes of a block macro as the guide processors use
// them. Asciidoctor attribute values may be numbers or booleans; the
// processors agree on strings.
export type MacroPayload = {
  attributes: Record<string, string>;
  target: string;
};

export function macroPayload(target: string, attrs: unknown): MacroPayload {
  return { attributes: stringAttributes(attrs), target };
}

export function stringAttributes(attrs: unknown): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record(attrs)).map(([key, value]) => [key, String(value)]),
  );
}
