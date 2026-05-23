import { isPlainObject } from "./configuration-values.mjs";

export function toToml(value) {
  if (!isPlainObject(value)) {
    return formatTomlValue(value);
  }
  const lines = [];
  appendTomlTable(lines, [], value);
  return lines.join("\n").trim();
}

function appendTomlTable(lines, tablePath, value) {
  const scalars = [];
  const children = [];
  for (const [key, item] of Object.entries(value)) {
    if (isPlainObject(item)) {
      children.push([key, item]);
    } else {
      scalars.push([key, item]);
    }
  }
  if (tablePath.length) {
    lines.push(`[${tablePath.map(formatTomlKey).join(".")}]`);
  }
  for (const [key, item] of scalars) {
    lines.push(`${formatTomlKey(key)} = ${formatTomlValue(item)}`);
  }
  for (const [key, item] of children) {
    if (lines.length && lines.at(-1) !== "") {
      lines.push("");
    }
    appendTomlTable(lines, [...tablePath, key], item);
  }
}

function formatTomlKey(key) {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : JSON.stringify(key);
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
