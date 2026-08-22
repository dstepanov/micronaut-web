import { createHash } from "node:crypto";

// A docs page is built from one renderAsciiDoc call per table-of-contents node,
// concatenated under a single project id prefix. Generated ids are therefore
// only unique within one render unless they also carry a per-render seed, which
// renderAsciiDoc publishes as a document attribute for extensions to read.
export const RENDER_ID_SEED_ATTRIBUTE = "micronaut-render-id-seed";

type SeedableNode = {
  getDocument?: () => { getAttribute?: (name: string) => unknown } | undefined;
};

export function renderIdSeed(diagnosticsLabel: string, source: string): string {
  return createHash("sha1")
    .update(diagnosticsLabel)
    .update("\0")
    .update(source)
    .digest("hex")
    .slice(0, 8);
}

export function documentRenderIdSeed(node: unknown): string {
  const seed = (node as SeedableNode)
    ?.getDocument?.()
    ?.getAttribute?.(RENDER_ID_SEED_ATTRIBUTE);
  return seed ? String(seed) : "";
}
