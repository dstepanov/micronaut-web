import path from "node:path";

import { attribute } from "../shared/html.ts";
import { rewriteMicronautSiteUrl } from "../shared/micronaut-links.ts";
import type { DocsProject } from "./project-manifest.ts";
import { projectApiBaseUri } from "../asciidoc/api-links.ts";

// Matches real id attributes only, so data-*-id attributes are left alone.
const ID_ATTRIBUTE_PATTERN = /(?<![-\w])id="([^"]+)"/g;

// The id an element ends up with once prefixIds has run. Kept as the single
// rule so claiming and prefixing cannot disagree about what collides.
export function prefixedId(id: string, slug: string): string {
  const prefix = `${slug}-`;
  return id.startsWith(prefix) ? id : `${prefix}${id}`;
}

// Claims an id for one page, suffixing it when something already took it.
// Ids are compared in their final prefixed form: a table-of-contents key that
// already carries the project slug must collide with the bare key it would
// otherwise be prefixed into. reservedIds holds ids that are spoken for but
// not yet emitted, so an element appearing earlier in the page cannot take one.
// Always returns the prefixed id, which prefixIds then leaves untouched.
export function claimId(
  id: string,
  slug: string,
  claimedIds: Set<string>,
  reservedIds?: ReadonlySet<string>,
): string {
  const key = prefixedId(id, slug);
  const taken = (candidate: string): boolean =>
    claimedIds.has(candidate) || Boolean(reservedIds?.has(candidate));
  if (!taken(key)) {
    claimedIds.add(key);
    return key;
  }
  let suffix = 2;
  while (taken(`${key}-${suffix}`)) {
    suffix += 1;
  }
  const unique = `${key}-${suffix}`;
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
  slug: string,
  claimedIds: Set<string>,
  reservedIds?: ReadonlySet<string>,
): string {
  const renames = new Map<string, string>();
  let renamed = false;
  const uniquified = fragment.replace(
    ID_ATTRIBUTE_PATTERN,
    (match: string, id: string): string => {
      const unique = claimId(id, slug, claimedIds, reservedIds);
      if (unique === prefixedId(id, slug)) {
        // No collision: leave the bare id for prefixIds to prefix as before.
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
    .replace(
      /\bid="([^"]+)"/g,
      (_match: string, id: string): string => `id="${prefixedId(id, slug)}"`,
    )
    .replace(
      /\bhref="#([^"]+)"/g,
      (_match: string, id: string): string => `href="#${prefixedId(id, slug)}"`,
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
      // Already-resolved javadoc paths, with or without a leading "../".
      const writtenJavadocUrl = canonicalJavadocUrl(value, project);
      if (writtenJavadocUrl) {
        return `${attributeName}="${attribute(writtenJavadocUrl)}"`;
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
            // Guide sources live in `docs/guide`, so a link such as `../api/...`
            // reaches the docs root. A single published document is that root
            // already, and writes the same link as `api/...`.
            project.docsSourceFile ? "" : "guide",
            pathname.replaceAll("\\", "/"),
          ),
        ) + suffix;
      // Checked after normalization: guide sources link javadoc as `../api/...`
      // relative to the guide directory, which only lands in the project's
      // javadoc folder once the path is resolved.
      const javadocUrl = canonicalJavadocUrl(rewritten, project);
      if (javadocUrl) {
        return `${attributeName}="${attribute(javadocUrl)}"`;
      }
      return `${attributeName}="${attribute(pageRelativeAssetUrl(rewritten))}"`;
    },
  );
}

/**
 * Upstream AsciiDoc sometimes hand-writes `assets/{slug}/docs/api/...` javadoc
 * paths instead of using the `api:`/`pkg:` macros. Nothing publishes that tree,
 * so those links 404; send them to the same canonical javadoc the macros use.
 */
function canonicalJavadocUrl(
  value: string,
  project: DocsProject,
): string | undefined {
  const match = /^(?:\.\.\/)*assets\/[^/]+\/docs\/api\/(.+)$/.exec(value);
  if (!match) {
    return undefined;
  }
  return `${projectApiBaseUri({ project })}/${match[1]}`;
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
