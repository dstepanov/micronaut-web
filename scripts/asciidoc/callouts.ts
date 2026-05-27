import {
  decodeSnippetMarkerPayload,
  snippetMarkerHtml,
} from "./snippet-markers.ts";
import { SNIPPET_CALLOUT_VALIDATION_CLASS } from "./snippet-blocks.ts";

export const MANUAL_CALLOUTS_CLASS = "asciidoc-manual-callouts";

export function normalizeAsciiDocCallouts(
  source: any,
  options: { manualCalloutsClass?: string } = {},
): any {
  const manualCalloutsClass =
    options.manualCalloutsClass || MANUAL_CALLOUTS_CLASS;
  return normalizeOrphanCalloutLists(
    normalizeCalloutListNumbers(String(source || "").split(/\r?\n/)),
    manualCalloutsClass,
  ).join("\n");
}

export function calloutNumber(attributes: any): any {
  const number =
    attributes.number ||
    attributes.callout ||
    attributes._positional?.[0] ||
    attributes.$positional?.[0] ||
    "";
  return /^\d+$/.test(number) ? number : "";
}

export function calloutMarkerForLanguage(attributes: any, language: any): any {
  const number = calloutNumber(attributes);
  if (!number) {
    return "";
  }
  return language === "xml" ? ` <!--${number}-->` : ` // <${number}>`;
}

export function normalizeSourceCalloutMarkers(source: any): any {
  return String(source || "").replace(
    /(^|[ \t])((?:\/\/|#|;)[ \t]*)(\d+)>$/gm,
    "$1$2<$3>",
  );
}

function normalizeCalloutListNumbers(lines: any): any {
  const output = [];
  let nextCallout = 1;
  let inCalloutList = false;
  let blankAfterCallout = false;
  for (const line of lines) {
    const match = /^<(\.|\d+)>/.exec(line);
    if (match) {
      const number =
        match[1] === "." ? nextCallout : Number.parseInt(match[1], 10);
      output.push(line.replace(/^<(\.|\d+)>/, `<${number}>`));
      nextCallout = number + 1;
      inCalloutList = true;
      blankAfterCallout = false;
      continue;
    }
    output.push(line);
    if (!line.trim()) {
      if (inCalloutList) {
        blankAfterCallout = true;
      } else {
        nextCallout = 1;
      }
      continue;
    }
    if (inCalloutList && blankAfterCallout) {
      inCalloutList = false;
      nextCallout = 1;
      blankAfterCallout = false;
    }
  }
  return output;
}

function normalizeOrphanCalloutLists(
  lines: any,
  manualCalloutsClass: any,
): any {
  const output = [];
  let inListingBlock = false;
  let listingBlockLines = [];
  let listingBlockOutputStart = -1;
  let pendingSnippetMarkerOutputIndex = -1;
  let previousListing = emptyListingContext();

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];

    if (isSnippetMarkerLine(line)) {
      output.push(line);
      pendingSnippetMarkerOutputIndex = output.length - 1;
      index += 1;
      continue;
    }

    if (isListingDelimiter(line)) {
      output.push(line);
      if (inListingBlock) {
        previousListing = listingCalloutContext(
          listingBlockLines,
          listingBlockOutputStart,
          output.length - 1,
          isSnippetCalloutValidationListing(output, listingBlockOutputStart)
            ? pendingSnippetMarkerOutputIndex
            : -1,
        );
        listingBlockLines = [];
        pendingSnippetMarkerOutputIndex = -1;
      } else {
        previousListing = emptyListingContext();
        listingBlockOutputStart = output.length;
      }
      inListingBlock = !inListingBlock;
      index += 1;
      continue;
    }

    if (inListingBlock) {
      listingBlockLines.push(line);
      output.push(line);
      index += 1;
      continue;
    }

    if (isCalloutListItem(line)) {
      const { items, nextIndex } = collectCalloutList(lines, index);
      const { listingItems, manualItems } = splitCalloutItems(
        items,
        previousListing,
        output,
      );
      output.push(...listingItems.map((item: any): any => item.line));
      if (manualItems.length) {
        if (listingItems.length) {
          output.push("");
        }
        output.push(`[.${manualCalloutsClass}]`);
        output.push(...manualItems.map((item: any): any => `. ${item.text}`));
        output.push("");
      }
      previousListing = emptyListingContext();
      index = nextIndex;
      continue;
    }

    output.push(line);
    if (line.trim()) {
      previousListing = emptyListingContext();
      if (!keepsSnippetMarkerPending(line)) {
        pendingSnippetMarkerOutputIndex = -1;
      }
    }
    index += 1;
  }

  return output;
}

function isListingDelimiter(line: any): any {
  return /^-{4,}$/.test(line.trim());
}

function isSnippetMarkerLine(line: any): any {
  return /<micronaut-snippet\b/.test(line);
}

function keepsSnippetMarkerPending(line: any): any {
  const trimmed = line.trim();
  return (
    trimmed === "++++" || trimmed === `[.${SNIPPET_CALLOUT_VALIDATION_CLASS}]`
  );
}

function isSnippetCalloutValidationListing(
  output: any,
  listingBlockOutputStart: any,
): any {
  return (
    output[listingBlockOutputStart - 2]?.trim() ===
    `[.${SNIPPET_CALLOUT_VALIDATION_CLASS}]`
  );
}

function isCalloutListItem(line: any): any {
  return /^<(\.|\d+)>/.test(line);
}

function listingCalloutContext(
  lines: any,
  outputStart: any,
  outputEnd: any,
  markerOutputIndex: any = -1,
): any {
  const source = lines.join("\n");
  if (/^include::/m.test(source)) {
    return {
      unknown: true,
      markerOutputIndex,
      numbers: new Set(),
      outputStart,
      outputEnd,
    };
  }
  return {
    unknown: false,
    markerOutputIndex,
    numbers: new Set(
      Array.from(
        source.matchAll(/<(\d+)>|<!--(\d+)-->/g),
        (match: any): any => match[1] || match[2],
      ),
    ),
    outputStart,
    outputEnd,
  };
}

function emptyListingContext(): any {
  return {
    markerOutputIndex: -1,
    unknown: false,
    numbers: new Set(),
    outputStart: -1,
    outputEnd: -1,
  };
}

function collectCalloutList(lines: any, startIndex: any): any {
  const items = [];
  let index = startIndex;
  while (index < lines.length) {
    const line = lines[index];
    const match = /^<(\.|\d+)>\s*(.*)$/.exec(line);
    if (match) {
      items.push({
        number: match[1],
        text: match[2],
        line,
      });
      index += 1;
      continue;
    }
    if (!line.trim() && nextNonBlankLineIsCallout(lines, index + 1)) {
      index += 1;
      continue;
    }
    break;
  }
  return { items, nextIndex: index };
}

function splitCalloutItems(items: any, listing: any, output: any): any {
  if (listing.unknown) {
    return { listingItems: items, manualItems: [] };
  }
  const listingItems = [];
  const manualItems = [];
  for (const item of items) {
    if (listing.numbers.has(item.number)) {
      listingItems.push(item);
    } else {
      manualItems.push(item);
    }
  }
  if (listingItems.length) {
    manualItems.push(...renumberListingCallouts(listingItems, listing, output));
  }
  return { listingItems, manualItems };
}

function renumberListingCallouts(items: any, listing: any, output: any): any {
  const numberMap = new Map();
  for (const item of items) {
    if (!numberMap.has(item.number)) {
      numberMap.set(item.number, String(numberMap.size + 1));
    }
  }
  if (!canRenumberListing(numberMap, listing.numbers)) {
    const { listingItems, manualItems } = sequentialPrefix(items);
    items.splice(0, items.length, ...listingItems);
    return manualItems;
  }
  if ([...numberMap].every(([from, to]: any): any => from === to)) {
    return [];
  }
  for (let index = listing.outputStart; index < listing.outputEnd; index += 1) {
    output[index] = replaceSourceCalloutNumbers(output[index], numberMap);
  }
  if (listing.markerOutputIndex >= 0) {
    output[listing.markerOutputIndex] = renumberSnippetMarkerLine(
      output[listing.markerOutputIndex],
      numberMap,
    );
  }
  for (const item of items) {
    item.line = item.line.replace(
      /^<(\.|\d+)>/,
      `<${numberMap.get(item.number) || item.number}>`,
    );
  }
  return [];
}

function replaceSourceCalloutNumbers(source: any, numberMap: any): any {
  return String(source).replace(
    /<(\d+)>|<!--(\d+)-->/g,
    (match: any, xmlNumber: any, commentNumber: any): any => {
      const nextNumber = numberMap.get(xmlNumber || commentNumber);
      if (!nextNumber) {
        return match;
      }
      return xmlNumber ? `<${nextNumber}>` : `<!--${nextNumber}-->`;
    },
  );
}

function renumberSnippetMarkerLine(line: any, numberMap: any): any {
  const payloadValue = /\bdata-payload="([^"]+)"/.exec(line)?.[1];
  if (!payloadValue) {
    return line;
  }
  try {
    const payload = decodeSnippetMarkerPayload(payloadValue);
    const samples = Array.isArray(payload.samples)
      ? payload.samples.map((sample: any): any => ({
          ...sample,
          source: replaceSourceCalloutNumbers(sample.source || "", numberMap),
        }))
      : [];
    return snippetMarkerHtml(payload.kind || "code", {
      ...payload,
      samples,
    });
  } catch {
    return line;
  }
}

function canRenumberListing(numberMap: any, listingNumbers: any): any {
  for (const [from, to] of numberMap) {
    if (from !== to && listingNumbers.has(to) && !numberMap.has(to)) {
      return false;
    }
  }
  return true;
}

function sequentialPrefix(items: any): any {
  const listingItems = [];
  const manualItems = [];
  let expected = 1;
  for (const item of items) {
    if (Number.parseInt(item.number, 10) === expected) {
      listingItems.push(item);
      expected += 1;
    } else {
      manualItems.push(item);
    }
  }
  return { listingItems, manualItems };
}

function nextNonBlankLineIsCallout(lines: any, startIndex: any): any {
  for (let index = startIndex; index < lines.length; index += 1) {
    if (!lines[index].trim()) {
      continue;
    }
    return isCalloutListItem(lines[index]);
  }
  return false;
}
