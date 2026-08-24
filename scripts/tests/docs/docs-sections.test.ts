import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { extractGeneratedDocSections } from "../../../src/lib/generated-docs-html.ts";

/**
 * Heading levels copied from the published Core page, where Asciidoctor renders
 * "2.3.1 IntelliJ IDEA" as an <h2> — the same level as its parent "2.3" — while
 * the unnumbered "Eclipse and Gradle" is an <h3>.
 */
const html = [
  '<h1 id="core-quickStart">2 Quick Start</h1>',
  '<h2 id="core-installCli">2.1 Install the CLI</h2>',
  '<h2 id="core-ide">2.3 Setting up an IDE</h2>',
  '<h2 id="core-intellij">2.3.1 IntelliJ IDEA</h2>',
  '<h2 id="core-eclipse">2.3.3 Eclipse</h2>',
  '<h3 id="core-eclipseGradle">Eclipse and Gradle</h3>',
  '<h2 id="core-netbeans">2.3.4 Apache NetBeans</h2>',
].join("\n");

describe("extractGeneratedDocSections", () => {
  const byId = new Map(
    extractGeneratedDocSections(html).map((section) => [section.id, section]),
  );

  test("indents numbered sub-sections below their parent", () => {
    // Both are <h2>, so heading level alone rendered them flush.
    assert.equal(byId.get("core-ide")?.depth, 2);
    assert.equal(byId.get("core-intellij")?.depth, 2);
    assert.equal(byId.get("core-ide")?.indent, 2);
    assert.equal(byId.get("core-intellij")?.indent, 3);
  });

  test("nests an unnumbered heading under the last numbered section", () => {
    assert.equal(byId.get("core-eclipse")?.indent, 3);
    assert.equal(byId.get("core-eclipseGradle")?.indent, 4);
  });

  test("keeps top-level chapters at the outermost indent", () => {
    assert.equal(byId.get("core-quickStart")?.indent, 1);
    assert.equal(byId.get("core-installCli")?.indent, 2);
  });

  test("returns to the parent indent after a nested heading", () => {
    assert.equal(byId.get("core-netbeans")?.indent, 3);
  });

  test("assigns every sub-section to its chapter", () => {
    assert.equal(byId.get("core-quickStart")?.parentId, undefined);
    for (const id of ["core-ide", "core-intellij", "core-eclipseGradle"]) {
      assert.equal(byId.get(id)?.parentId, "core-quickStart", id);
    }
  });
});
