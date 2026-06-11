const DEFAULT_PROPERTIES_TEXT_STYLE = "color:#1F2328;--shiki-dark:#E6EDF3";

export function normalizeEmptyPropertiesAssignmentHighlighting(
  highlightedHtml: string,
): string {
  return highlightedHtml.replace(
    /<span class="line">([\s\S]*?)<\/span>(?=\n<span class="line">|\n?<\/code>|$)/g,
    (lineHtml: string, lineInnerHtml: string): string => {
      if (/\bclass="[^"]*\bconum\b/.test(lineInnerHtml)) {
        return lineHtml;
      }
      const lineText = decodeHtml(lineInnerHtml.replace(/<[^>]+>/g, ""));
      if (!emptyPropertiesAssignment(lineText)) {
        return normalizePropertiesAssignmentValueHighlighting(
          lineHtml,
          lineInnerHtml,
          lineText,
        );
      }
      return `<span class="line"><span style="${propertiesDefaultTextStyle(lineInnerHtml)}">${escapeHtml(lineText)}</span></span>`;
    },
  );
}

function emptyPropertiesAssignment(line: string): boolean {
  return /^[ \t]*[^#!;:=\s][^=]*=[ \t]*$/.test(line);
}

function normalizePropertiesAssignmentValueHighlighting(
  lineHtml: string,
  lineInnerHtml: string,
  lineText: string,
): string {
  const valueStart = assignmentValueStartIndex(lineText);
  if (valueStart < 0 || !/\S/.test(lineText.slice(valueStart + 1))) {
    return lineHtml;
  }

  const keyHtml = lineHtmlUntilTextOffset(lineInnerHtml, valueStart);
  const valueStyle =
    highlightedStyleAtTextOffset(lineInnerHtml, valueStart) ||
    DEFAULT_PROPERTIES_TEXT_STYLE;
  return `<span class="line">${keyHtml}<span style="${valueStyle}">${escapeHtml(lineText.slice(valueStart))}</span></span>`;
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

function propertiesDefaultTextStyle(lineInnerHtml: string): string {
  return (
    /<span style="([^"]*)">=<\/span>\s*$/.exec(lineInnerHtml)?.[1] ||
    DEFAULT_PROPERTIES_TEXT_STYLE
  );
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
