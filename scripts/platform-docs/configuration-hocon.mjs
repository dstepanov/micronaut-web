import { isPlainObject } from "./configuration-values.mjs";

export function toHocon(value) {
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
