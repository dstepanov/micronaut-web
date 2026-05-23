import path from "node:path";

import { attribute } from "./html.mjs";

export function prefixIds(input, slug) {
  const prefix = `${slug}-`;
  return input
    .replace(/\bid="([^"]+)"/g, (match, id) => id.startsWith(prefix) ? match : `id="${prefix}${id}"`)
    .replace(/\bhref="#([^"]+)"/g, (match, id) => id.startsWith(prefix) ? match : `href="#${prefix}${id}"`);
}

export function rewriteUrls(input, project) {
  return input.replace(/\b(href|src)="([^"]*)"/g, (match, attributeName, value) => {
    if (!value || value.startsWith("#") || value.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("//")) {
      return match;
    }
    if (value.startsWith("assets/")) {
      return `${attributeName}="${attribute(pageRelativeAssetUrl(value))}"`;
    }
    const suffixIndex = firstSuffixIndex(value);
    const pathname = suffixIndex >= 0 ? value.slice(0, suffixIndex) : value;
    const suffix = suffixIndex >= 0 ? value.slice(suffixIndex) : "";
    const rewritten = path.posix.normalize(path.posix.join("assets", project.slug, "docs", "guide", pathname.replaceAll("\\", "/"))) + suffix;
    return `${attributeName}="${attribute(pageRelativeAssetUrl(rewritten))}"`;
  });
}

export function optimizeImages(input) {
  return input.replace(/<img\b[^>]*>/gi, (tag) => {
    let optimized = tag;
    if (!/\bloading\s*=/i.test(optimized)) {
      optimized = optimized.replace(/<img\b/i, '<img loading="lazy"');
    }
    if (!/\bdecoding\s*=/i.test(optimized)) {
      optimized = optimized.replace(/<img\b/i, '<img decoding="async"');
    }
    return optimized;
  });
}

function pageRelativeAssetUrl(value) {
  return `../../${value.replace(/^\/+/, "")}`;
}

function firstSuffixIndex(value) {
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  if (queryIndex < 0) return hashIndex;
  if (hashIndex < 0) return queryIndex;
  return Math.min(queryIndex, hashIndex);
}
