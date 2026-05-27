import {
  highlightListingBlocks,
  shikiStyle,
  unwrapBlockParagraphs,
} from "../shared/highlight.ts";
import { renderStaticSnippetCards } from "./static-snippets.ts";

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
  return html;
}
