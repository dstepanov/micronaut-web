import { isPlainObject } from "./configuration-values.mjs";

export function toJavaProperties(value) {
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
