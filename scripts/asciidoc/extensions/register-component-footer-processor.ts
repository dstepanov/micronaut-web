// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Document,
  DocumentProcessorDslInterface,
  Registry,
} from "@asciidoctor/core";

type ComponentBlockNode = {
  blocks?: ComponentBlockNode[];
  context?: string;
};

const footerNodes = new WeakMap<object, ComponentBlockNode>();

export function registerComponentFooterProcessor(registry: Registry): void {
  registry.treeProcessor(function registerComponentFooterProcessor(
    this: DocumentProcessorDslInterface,
  ): void {
    this.process(function processComponentFooters(document: unknown): void {
      attachComponentFooters(document as Document);
    });
  });
}

export async function componentFooterHtml(
  node: object,
  renderFooter: (footerNode: ComponentBlockNode) => Promise<string> | string,
): Promise<string> {
  const footerNode = footerNodes.get(node);
  return footerNode ? String(await renderFooter(footerNode)) : "";
}

function attachComponentFooters(parent: Document | ComponentBlockNode): void {
  const blocks = parent.blocks || [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    attachComponentFooters(block);

    if (isRenderableListingBlock(block)) {
      attachFollowingCalloutList(blocks, index, block);
    }
  }
}

function attachFollowingCalloutList(
  blocks: ComponentBlockNode[],
  index: number,
  target: ComponentBlockNode,
): void {
  const next = blocks[index + 1];
  if (isCalloutList(next)) {
    footerNodes.set(target, next);
    blocks.splice(index + 1, 1);
  }
}

function isRenderableListingBlock(node: unknown): node is ComponentBlockNode {
  return isComponentBlockNode(node) && node.context === "listing";
}

function isCalloutList(node: unknown): node is ComponentBlockNode {
  return isComponentBlockNode(node) && node.context === "colist";
}

function isComponentBlockNode(node: unknown): node is ComponentBlockNode {
  return Boolean(node && typeof node === "object");
}
