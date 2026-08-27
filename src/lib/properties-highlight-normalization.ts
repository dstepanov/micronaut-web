const DEFAULT_PROPERTIES_TEXT_STYLE = "color:#1F2328;--shiki-dark:#E6EDF3";
const DEFAULT_PROPERTIES_KEY_STYLE = "color:#CF222E;--shiki-dark:#FF7B72";
const DEFAULT_PROPERTIES_COMMENT_STYLE = "color:#6E7781;--shiki-dark:#8B949E";

export function normalizePropertiesAssignmentHighlighting(
  highlightedHtml: string,
): string {
  return highlightedHtml.replace(
    /<span class="line">([\s\S]*?)<\/span>(?=\n<span class="line">|\n?<\/code>|$)/g,
    (lineHtml: string, lineInnerHtml: string): string => {
      if (/\bclass="[^"]*\bconum\b/.test(lineInnerHtml)) {
        return lineHtml;
      }
      return normalizePropertiesLineHighlighting(
        lineHtml,
        lineInnerHtml,
        decodeHtml(lineInnerHtml.replace(/<[^>]+>/g, "")),
      );
    },
  );
}

function normalizePropertiesLineHighlighting(
  lineHtml: string,
  lineInnerHtml: string,
  lineText: string,
): string {
  // The Shiki grammar only comments out `#` lines, so a `!` comment keeps the
  // block's own foreground and anything that looks like `key=value` after the
  // `!` is even painted as an assignment.
  if (/^[ \t]*!/.test(lineText)) {
    return `<span class="line"><span style="${DEFAULT_PROPERTIES_COMMENT_STYLE}">${escapeHtml(lineText)}</span></span>`;
  }

  const valueStart = assignmentValueStartIndex(lineText);
  if (valueStart < 0) {
    return lineHtml;
  }

  const keyStart = assignmentKeyStartIndex(lineText);
  if (keyStart < 0 || keyStart >= valueStart) {
    return lineHtml;
  }

  const leadingHtml = lineHtmlUntilTextOffset(lineInnerHtml, keyStart);
  const keyStyle =
    highlightedStyleBetweenTextOffsets(lineInnerHtml, keyStart, valueStart) ||
    DEFAULT_PROPERTIES_KEY_STYLE;
  const valueStyle =
    highlightedStyleAtTextOffset(lineInnerHtml, valueStart) ||
    DEFAULT_PROPERTIES_TEXT_STYLE;
  return `<span class="line">${leadingHtml}<span style="${keyStyle}">${escapeHtml(lineText.slice(keyStart, valueStart))}</span><span style="${valueStyle}">${escapeHtml(lineText.slice(valueStart))}</span></span>`;
}

function assignmentKeyStartIndex(line: string): number {
  const match = /^[ \t]*/.exec(line);
  return match?.[0].length ?? 0;
}

function assignmentValueStartIndex(line: string): number {
  if (/^[ \t]*[#!;]/.test(line)) {
    return -1;
  }
  for (let index = 0; index < line.length; index += 1) {
    if (
      (line[index] === "=" || line[index] === ":") &&
      !escapedAt(line, index)
    ) {
      return index;
    }
  }
  return -1;
}

function escapedAt(value: string, index: number): boolean {
  let backslashCount = 0;
  for (
    let offset = index - 1;
    offset >= 0 && value[offset] === "\\";
    offset -= 1
  ) {
    backslashCount += 1;
  }
  return backslashCount % 2 === 1;
}

function lineHtmlUntilTextOffset(
  lineInnerHtml: string,
  endOffset: number,
): string {
  let html = "";
  for (const token of highlightedLineTokens(lineInnerHtml)) {
    if (token.textOffset >= endOffset) {
      break;
    }
    const remaining = endOffset - token.textOffset;
    if (token.text.length <= remaining) {
      html += token.html;
      continue;
    }
    const text = escapeHtml(token.text.slice(0, remaining));
    html += token.style ? `<span style="${token.style}">${text}</span>` : text;
    break;
  }
  return html;
}

function highlightedStyleAtTextOffset(
  lineInnerHtml: string,
  targetOffset: number,
): string | undefined {
  for (const token of highlightedLineTokens(lineInnerHtml)) {
    if (
      token.style &&
      token.textOffset <= targetOffset &&
      targetOffset < token.textOffset + token.text.length
    ) {
      return token.style;
    }
  }
  return undefined;
}

function highlightedStyleBetweenTextOffsets(
  lineInnerHtml: string,
  startOffset: number,
  endOffset: number,
): string | undefined {
  for (const token of highlightedLineTokens(lineInnerHtml)) {
    if (
      token.style &&
      token.textOffset < endOffset &&
      token.textOffset + token.text.length > startOffset &&
      token.style !== DEFAULT_PROPERTIES_TEXT_STYLE
    ) {
      return token.style;
    }
  }
  return undefined;
}

function highlightedLineTokens(
  lineInnerHtml: string,
): Array<{ html: string; style?: string; text: string; textOffset: number }> {
  const tokens: Array<{
    html: string;
    style?: string;
    text: string;
    textOffset: number;
  }> = [];
  let position = 0;
  let textOffset = 0;
  for (const match of lineInnerHtml.matchAll(
    /<span style="([^"]*)">([\s\S]*?)<\/span>/g,
  )) {
    const matchIndex = match.index ?? 0;
    const textBefore = decodeHtml(lineInnerHtml.slice(position, matchIndex));
    if (textBefore) {
      tokens.push({
        html: escapeHtml(textBefore),
        text: textBefore,
        textOffset,
      });
      textOffset += textBefore.length;
    }

    const text = decodeHtml(match[2]);
    tokens.push({
      html: match[0],
      style: match[1],
      text,
      textOffset,
    });
    textOffset += text.length;
    position = matchIndex + match[0].length;
  }

  const remainingText = decodeHtml(lineInnerHtml.slice(position));
  if (remainingText) {
    tokens.push({
      html: escapeHtml(remainingText),
      text: remainingText,
      textOffset,
    });
  }
  return tokens;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
