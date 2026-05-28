import path from "node:path";

import { attribute } from "../shared/html.ts";
import type { DocsProject } from "./project-manifest.ts";

export function prefixIds(input: string, slug: string): string {
  const prefix = `${slug}-`;
  return input
    .replace(/\bid="([^"]+)"/g, (match: string, id: string): string =>
      id.startsWith(prefix) ? match : `id="${prefix}${id}"`,
    )
    .replace(/\bhref="#([^"]+)"/g, (match: string, id: string): string =>
      id.startsWith(prefix) ? match : `href="#${prefix}${id}"`,
    )
    .replace(
      /\b(aria-activedescendant|aria-controls|aria-describedby|aria-labelledby|aria-owns|for)="([^"]+)"/g,
      (match: string, name: string, value: string): string => {
        const refs = value.trim().split(/\s+/).filter(Boolean);
        if (!refs.length) {
          return match;
        }
        const prefixed = refs
          .map((id) => (id.startsWith(prefix) ? id : `${prefix}${id}`))
          .join(" ");
        return `${name}="${attribute(prefixed)}"`;
      },
    );
}

export function rewriteUrls(input: string, project: DocsProject): string {
  return input.replace(
    /\b(href|src)="([^"]*)"/g,
    (match: string, attributeName: string, value: string): string => {
      if (
        !value ||
        value.startsWith("#") ||
        value.startsWith("/") ||
        /^[a-z][a-z0-9+.-]*:/i.test(value) ||
        value.startsWith("//")
      ) {
        return match;
      }
      if (value.startsWith("assets/")) {
        return `${attributeName}="${attribute(pageRelativeAssetUrl(value))}"`;
      }
      const suffixIndex = firstSuffixIndex(value);
      const pathname = suffixIndex >= 0 ? value.slice(0, suffixIndex) : value;
      const suffix = suffixIndex >= 0 ? value.slice(suffixIndex) : "";
      const rewritten =
        path.posix.normalize(
          path.posix.join(
            "assets",
            project.slug,
            "docs",
            "guide",
            pathname.replaceAll("\\", "/"),
          ),
        ) + suffix;
      return `${attributeName}="${attribute(pageRelativeAssetUrl(rewritten))}"`;
    },
  );
}

function pageRelativeAssetUrl(value: string): string {
  return `../${value.replace(/^\/+/, "")}`;
}

function firstSuffixIndex(value: string): number {
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  if (queryIndex < 0) return hashIndex;
  if (hashIndex < 0) return queryIndex;
  return Math.min(queryIndex, hashIndex);
}
