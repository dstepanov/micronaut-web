import path from "node:path";

import { attribute } from "../shared/html.ts";
import { rewriteMicronautSiteUrl } from "../shared/micronaut-links.ts";
import type { DocsProject } from "./project-manifest.ts";

// Matches real id attributes only, so data-*-id attributes are left alone.
const ID_ATTRIBUTE_PATTERN = /(?<![-\w])id="([^"]+)"/g;

// Claims an id for one page, suffixing it when something already took it.
// reservedIds holds ids that are spoken for but not yet emitted, so an element
// appearing earlier in the page cannot take one.
export function claimId(
  id: string,
  claimedIds: Set<string>,
  reservedIds?: ReadonlySet<string>,
): string {
  const taken = (candidate: string): boolean =>
    claimedIds.has(candidate) || Boolean(reservedIds?.has(candidate));
  if (!taken(id)) {
    claimedIds.add(id);
    return id;
  }
  let suffix = 2;
  while (taken(`${id}-${suffix}`)) {
    suffix += 1;
  }
  const unique = `${id}-${suffix}`;
  claimedIds.add(unique);
  return unique;
}

// Every table-of-contents node is rendered separately and the fragments are
// concatenated into one page, so two sections that use the same heading text
// produce the same Asciidoctor slug. Later fragments yield: the first claim on
// an id keeps it, and repeats are suffixed. Pass the section ids the page
// navigation links to as reservedIds so content headings never take those.
export function uniquifyIds(
  fragment: string,
  claimedIds: Set<string>,
  reservedIds?: ReadonlySet<string>,
): string {
  const renames = new Map<string, string>();
  let renamed = false;
  const uniquified = fragment.replace(
    ID_ATTRIBUTE_PATTERN,
    (match: string, id: string): string => {
      const unique = claimId(id, claimedIds, reservedIds);
      if (unique === id) {
        return match;
      }
      if (!renames.has(id)) {
        renames.set(id, unique);
      }
      renamed = true;
      return `id="${unique}"`;
    },
  );
  if (!renamed) {
    return fragment;
  }
  // Cross-references inside this fragment target its own headings, so they
  // follow the rename. Links from other fragments still resolve to whichever
  // fragment claimed the id first, exactly as before.
  return uniquified.replace(
    /href="#([^"]+)"/g,
    (match: string, id: string): string => {
      const unique = renames.get(id);
      return unique ? `href="#${unique}"` : match;
    },
  );
}

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
      const canonicalUrl = rewriteMicronautSiteUrl(value);
      if (canonicalUrl) {
        return `${attributeName}="${attribute(canonicalUrl)}"`;
      }
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
