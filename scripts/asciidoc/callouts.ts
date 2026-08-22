// Callout-list scanning shared by the snippet renderer (which reads the lines
// that follow a snippet macro from the document reader) and the guide
// preprocessor (which reads them from a line array). Both are expressed over
// the same minimal reader interface so the rules cannot drift apart.

// Asciidoctor.js exposes the reader methods as promises; the array-backed
// reader returns plain values, which `await` accepts just the same.
export type CalloutReader = {
  peekLine(): Promise<string | undefined> | string | undefined;
  readLine(): Promise<string | undefined> | string | undefined;
  unshiftLines(lines: string[]): void;
};

export type CalloutItem = {
  // The item as written, with `<.>` replaced by its resolved number.
  line: string;
  number: string;
  text: string;
};

export function arrayCalloutReader(
  lines: string[],
): CalloutReader & { remaining(): string[] } {
  const queue = [...lines];
  return {
    peekLine: (): string | undefined => queue[0],
    readLine: (): string | undefined => queue.shift(),
    unshiftLines: (unshifted: string[]): void => {
      queue.unshift(...unshifted);
    },
    remaining: (): string[] => [...queue],
  };
}

export function isCalloutListItem(line: string): boolean {
  return /^<(\.|\d+)>/.test(line);
}

export function calloutNumberFromLine(line: string): string {
  return /^<(\d+)>/.exec(String(line || "").trim())?.[1] || "1";
}

export async function readLeadingBlankLines(
  reader: CalloutReader,
): Promise<string[]> {
  const lines: string[] = [];
  for (;;) {
    const line = await reader.peekLine();
    if (line === undefined || line.trim()) {
      return lines;
    }
    lines.push((await reader.readLine()) || "");
  }
}

// Reads a callout list: `<N>` or `<.>` items, their indented continuation
// lines, and blank lines between items. Stops at the first line that is none
// of those, leaving it in the reader.
export async function readCalloutListItems(
  reader: CalloutReader,
): Promise<CalloutItem[]> {
  const items: CalloutItem[] = [];
  let nextCallout = 1;
  for (;;) {
    const line = await reader.peekLine();
    if (line === undefined) {
      return items;
    }
    const match = /^<(\.|\d+)>\s*(.*)$/.exec(line);
    if (match) {
      await reader.readLine();
      const number =
        match[1] === "." ? String(nextCallout) : String(Number(match[1]));
      nextCallout = Number(number) + 1;
      const itemLines = [line.replace(/^<(\.|\d+)>/, `<${number}>`)];
      const textLines = [match[2]];
      await readCalloutContinuationLines(reader, itemLines, textLines);
      items.push({
        line: itemLines.join("\n"),
        number,
        text: textLines.join("\n"),
      });
      continue;
    }
    if (
      items.length &&
      !line.trim() &&
      (await nextNonBlankLineIsCallout(reader))
    ) {
      await reader.readLine();
      continue;
    }
    return items;
  }
}

async function readCalloutContinuationLines(
  reader: CalloutReader,
  itemLines: string[],
  textLines: string[],
): Promise<void> {
  for (;;) {
    const line = await reader.peekLine();
    if (line === undefined || isCalloutListItem(line)) {
      return;
    }
    if (!line.trim()) {
      if (await nextNonBlankLineIsCallout(reader)) {
        await reader.readLine();
      }
      return;
    }
    if (!/^[ \t]+\S/.test(line)) {
      return;
    }
    const continuationLine = (await reader.readLine()) || "";
    itemLines.push(continuationLine);
    textLines.push(continuationLine.trim());
  }
}

export async function nextNonBlankLineIsCallout(
  reader: CalloutReader,
): Promise<boolean> {
  const consumed: string[] = [];
  for (;;) {
    const line = await reader.readLine();
    if (line === undefined) {
      reader.unshiftLines(consumed);
      return false;
    }
    consumed.push(line);
    if (!line.trim()) {
      continue;
    }
    reader.unshiftLines(consumed);
    return isCalloutListItem(line);
  }
}
