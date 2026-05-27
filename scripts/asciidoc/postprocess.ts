import {
  highlightListingBlocks,
  shikiStyle,
  unwrapBlockParagraphs,
} from "../shared/highlight.ts";
import {
  renderStaticListingBlockCards,
  renderStaticSnippetCards,
} from "./static-snippets.ts";

export { shikiStyle };

export async function processAsciiDocHtml(
  input: any,
  options: { unwrapSnippetParagraphs?: boolean } = {},
): Promise<any> {
  let html = options.unwrapSnippetParagraphs
    ? unwrapBlockParagraphs(input)
    : input;
  html = await renderStaticSnippetCards(html);
  html = await highlightListingBlocks(html);
  html = await renderStaticListingBlockCards(html);
  return html;
}
