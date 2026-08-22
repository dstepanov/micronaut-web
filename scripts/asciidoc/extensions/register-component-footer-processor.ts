import type { Registry } from "@asciidoctor/core";

import { defineTreeProcessor } from "./define.ts";

type ComponentBlockNode = {
  blocks?: ComponentBlockNode[];
  context?: string;
};

const footerNodes = new WeakMap<object, ComponentBlockNode>();

// Detaches the callout list that follows an ordinary listing so the converter
// can render it inside the listing's card footer instead of after the card.
export function registerComponentFooterProcessor(registry: Registry): void {
  defineTreeProcessor(registry, (document) => {
    attachComponentFooters(document as unknown as ComponentBlockNode);
  });
}

export async function componentFooterHtml(
  node: object,
  renderFooter: (footerNode: ComponentBlockNode) => Promise<string> | string,
): Promise<string> {
  const footerNode = footerNodes.get(node);
  return footerNode ? String(await renderFooter(footerNode)) : "";
}

function attachComponentFooters(parent: ComponentBlockNode): void {
  const blocks = parent.blocks || [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    attachComponentFooters(block);

    if (block.context === "listing") {
      const next = blocks[index + 1];
      if (next && next.context === "colist") {
        footerNodes.set(block, next);
        blocks.splice(index + 1, 1);
      }
    }
  }
}
