import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  arrayCalloutReader,
  nextNonBlankLineIsCallout,
  readCalloutListItems,
  readLeadingBlankLines,
} from "../../asciidoc/callouts.ts";

describe("readCalloutListItems", () => {
  test("numbers auto-numbered items after the last explicit number", async () => {
    const reader = arrayCalloutReader([
      "<2> Second.",
      "<.> Third.",
      "<.> Fourth.",
      "<1> First again.",
      "<.> Second again.",
    ]);

    assert.deepEqual(
      (await readCalloutListItems(reader)).map((item) => [
        item.number,
        item.text,
      ]),
      [
        ["2", "Second."],
        ["3", "Third."],
        ["4", "Fourth."],
        ["1", "First again."],
        ["2", "Second again."],
      ],
    );
    assert.deepEqual(reader.remaining(), []);
  });

  test("keeps indented continuation lines and blank lines between items", async () => {
    const reader = arrayCalloutReader([
      "<1> Wraps onto",
      "    a second line.",
      "",
      "<2> Second item.",
      "",
      "",
      "Paragraph after the list.",
    ]);
    const items = await readCalloutListItems(reader);

    assert.deepEqual(
      items.map((item) => item.text),
      ["Wraps onto\na second line.", "Second item."],
    );
    assert.equal(items[0].line, "<1> Wraps onto\n    a second line.");
    assert.deepEqual(reader.remaining(), ["", "", "Paragraph after the list."]);
  });

  test("rewrites the <.> marker in the kept line and stops at unindented text", async () => {
    const reader = arrayCalloutReader([
      "<.> Only.",
      "Not a callout.",
      "<2> Later.",
    ]);
    const items = await readCalloutListItems(reader);

    assert.deepEqual(
      items.map((item) => item.line),
      ["<1> Only."],
    );
    assert.deepEqual(reader.remaining(), ["Not a callout.", "<2> Later."]);
  });

  test("returns nothing when the next line is not a callout", async () => {
    const reader = arrayCalloutReader(["Text.", "<1> Later."]);

    assert.deepEqual(await readCalloutListItems(reader), []);
    assert.deepEqual(reader.remaining(), ["Text.", "<1> Later."]);
  });
});

describe("reader helpers", () => {
  test("readLeadingBlankLines consumes only blank lines", async () => {
    const reader = arrayCalloutReader(["", "  ", "<1> Item."]);

    assert.deepEqual(await readLeadingBlankLines(reader), ["", "  "]);
    assert.deepEqual(reader.remaining(), ["<1> Item."]);
  });

  test("nextNonBlankLineIsCallout looks ahead without consuming", async () => {
    const callout = arrayCalloutReader(["", "", "<1> Item."]);
    const prose = arrayCalloutReader(["", "Prose."]);
    const end = arrayCalloutReader(["", ""]);

    assert.equal(await nextNonBlankLineIsCallout(callout), true);
    assert.deepEqual(callout.remaining(), ["", "", "<1> Item."]);
    assert.equal(await nextNonBlankLineIsCallout(prose), false);
    assert.deepEqual(prose.remaining(), ["", "Prose."]);
    assert.equal(await nextNonBlankLineIsCallout(end), false);
    assert.deepEqual(end.remaining(), ["", ""]);
  });
});
