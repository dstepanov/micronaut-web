export type AttributeListOptions = {
  includeText?: boolean;
  positionalKey?: "$positional" | "_positional";
};

export type ParsedAttributeList = Record<string, string> & {
  $positional?: string[];
  _positional?: string[];
  text?: string;
};

export function parseAttributeList(
  value: string,
  options: AttributeListOptions = {},
): ParsedAttributeList {
  const attributes: ParsedAttributeList = {};
  const positional = [];
  if (options.includeText) {
    attributes.text = value;
  }
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
    const raw = item.slice(separator + 1).trim();
    if (key) {
      attributes[key] = stripQuotes(raw);
    }
  }
  if (options.positionalKey && positional.length) {
    attributes[options.positionalKey] = positional;
  }
  return attributes;
}

export function splitAttributeList(value: string): string[] {
  const items = [];
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
