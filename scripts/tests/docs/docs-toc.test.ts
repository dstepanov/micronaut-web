import assert from "node:assert/strict";
import path from "node:path";
import { describe, test } from "node:test";

import { readGuideToc } from "../../docs/toc.ts";
import { temporaryDirectory, writeTextFile } from "../support/temp-project.ts";

async function guideDirectory(
  t: Parameters<typeof temporaryDirectory>[0],
  toc: string,
  files: string[],
): Promise<string> {
  const directory = await temporaryDirectory(t, "micronaut-web-toc-");
  await writeTextFile(path.join(directory, "toc.yml"), toc);
  for (const file of files) {
    await writeTextFile(path.join(directory, file), "");
  }
  return directory;
}

describe("readGuideToc", () => {
  test("numbers nested sections and resolves files below their parent", async (t) => {
    const directory = await guideDirectory(
      t,
      [
        "title: Fixture Docs",
        "introduction: Introduction",
        "config:",
        "  title: Configuration",
        "  sources: Sources",
        "  nested:",
        "    title: Nested",
        "    deep: Deep",
      ].join("\n"),
      [
        "introduction.adoc",
        "config.adoc",
        "config/sources.adoc",
        "config/nested.adoc",
        "config/nested/deep.adoc",
      ],
    );

    const toc = await readGuideToc(directory);

    assert.equal(toc.title, "Fixture Docs");
    assert.deepEqual(
      flatten(toc.children).map((node) => [
        node.number,
        node.level,
        node.id,
        node.title,
        node.file,
      ]),
      [
        ["1", 0, "introduction", "Introduction", "introduction.adoc"],
        ["2", 0, "config", "Configuration", "config.adoc"],
        ["2.1", 1, "sources", "Sources", "config/sources.adoc"],
        ["2.2", 1, "nested", "Nested", "config/nested.adoc"],
        ["2.2.1", 2, "deep", "Deep", "config/nested/deep.adoc"],
      ],
    );
  });

  test("prefers a top-level file over one below the parent", async (t) => {
    const directory = await guideDirectory(
      t,
      ["config:", "  title: Configuration", "  sources: Sources"].join("\n"),
      ["config.adoc", "sources.adoc", "config/sources.adoc"],
    );

    assert.equal(
      (await readGuideToc(directory)).children[0].children[0].file,
      "sources.adoc",
    );
  });

  test("rejects a TOC that is not a map, a section without a title, and a missing file", async (t) => {
    await assert.rejects(
      readGuideToc(await guideDirectory(t, "- just\n- a list", [])),
      /TOC YAML must be a map/,
    );
    await assert.rejects(
      readGuideToc(
        await guideDirectory(t, "config:\n  sources: Sources", [
          "config.adoc",
          "config/sources.adoc",
        ]),
      ),
      /TOC section 'config' must define a non-blank title/,
    );
    await assert.rejects(
      readGuideToc(await guideDirectory(t, "missing: Missing", [])),
      /Missing guide source file for TOC section 'missing'/,
    );
    await assert.rejects(
      readGuideToc(await guideDirectory(t, "odd: 42", ["odd.adoc"])),
      /TOC section 'odd' must be a string or map/,
    );
  });
});

function flatten(
  nodes: Awaited<ReturnType<typeof readGuideToc>>["children"],
): Awaited<ReturnType<typeof readGuideToc>>["children"] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}
