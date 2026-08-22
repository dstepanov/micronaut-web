import * as asciidoctor from "@asciidoctor/core";
import assert from "node:assert/strict";
import path from "node:path";
import { describe, test } from "node:test";

import { isFatalDocsDiagnostic, renderProject } from "../../docs/renderer.ts";
import {
  assertNoRuntimeGeneratedRendering,
  snippetCards,
  textOnly,
} from "../support/html.ts";
import {
  type DocsSection,
  docsProject,
  fixtureDocsProject,
  temporaryDirectory,
  writeDocsGuide,
  writeTextFile,
} from "../support/temp-project.ts";

// renderProject is the in-process heart of scripts/render-docs.ts: it reads
// the TOC, renders one fragment per section and stitches them into a page.

type Render = { html: string; ids: string[] };

async function renderFixture(
  t: Parameters<typeof temporaryDirectory>[0],
  sections: string | DocsSection[],
  options: {
    files?: Record<string, string[]>;
    strict?: boolean;
  } = {},
): Promise<Render> {
  const docsDirectory = await temporaryDirectory(
    t,
    "micronaut-web-docs-render-",
  );
  await writeDocsGuide(
    docsDirectory,
    fixtureDocsProject.repositoryName,
    "Fixture Docs",
    sections,
  );
  for (const [file, lines] of Object.entries(options.files || {})) {
    await writeTextFile(
      path.join(
        docsDirectory,
        "repos",
        fixtureDocsProject.repositoryName,
        file,
      ),
      lines,
    );
  }
  const html = await renderProject(
    asciidoctor,
    docsDirectory,
    docsProject(fixtureDocsProject),
    "4.9.0",
    { strict: options.strict },
  );
  return {
    html,
    ids: [...html.matchAll(/(?<![-\w])id="([^"]+)"/g)].map((match) => match[1]),
  };
}

describe("renderProject", () => {
  test("turns snippet macros, listings, dependencies and configuration into shared cards", async (t) => {
    const { html } = await renderFixture(
      t,
      [
        "snippet::example.FixtureSnippet[tags=body,title=Fixture Snippet,description=Rendered from snippet macro]",
        "",
        "<1> Snippet callout follows the generated card and may wrap",
        "    across a https://docs.micronaut.io/latest/guide/index.html#beanContext[Micronaut's Bean Context] continuation line.",
        "<2> The link:https://example.test/Publisher.html[Publisher] uses `batching`.",
        "",
        "[source,kotlin]",
        "----",
        "class GeneratedKotlinSnippet",
        "----",
        "",
        "dependency::micronaut-http-client[groupId=io.micronaut,title=HTTP Client dependency]",
        "",
        "[configuration,title=Configuration snippet]",
        "----",
        "micronaut:",
        "  server:",
        "    port: 8080",
        "----",
        "",
        ".Configuration Properties",
        "|===",
        "|Property |Type |Description",
        "|micronaut.server.port |Integer |Server port",
        "|===",
      ].join("\n"),
      {
        files: {
          "test-suite/src/test/java/example/FixtureSnippet.java": [
            "package example;",
            "",
            "// tag::body[]",
            "class FixtureSnippet {",
            "    void createBuilder() { // <1>",
            "    }",
            "",
            "    void buildClient() { // <2>",
            "    }",
            "}",
            "// end::body[]",
          ],
        },
      },
    );
    const cards = snippetCards(html);

    assert.deepEqual(
      cards.map((card) => [card.kind, card.title]),
      [
        ["code", "Fixture Snippet"],
        ["code", ""],
        ["dependency", "HTTP Client dependency"],
        ["code", "Configuration snippet"],
      ],
    );
    assert.equal(cards[0].description, "Rendered from snippet macro");
    assert.match(cards[0].activeCode, /void createBuilder\(\) { \/\/ <1>/);
    assert.deepEqual(cards[0].callouts, [
      {
        number: "1",
        text: "Snippet callout follows the generated card and may wrap across a Micronaut’s Bean Context continuation line.",
      },
      { number: "2", text: "The Publisher uses batching." },
    ]);
    assert.match(
      html,
      /href="https:\/\/docs\.micronaut\.io\/latest\/guide\/index\.html#beanContext"[^>]*>Micronaut&#8217;s Bean Context<\/a>/,
    );
    assert.match(html, /uses <code>batching<\/code>/);
    assert.deepEqual(cards[1].tabs, ["Kotlin"]);
    assert.deepEqual(cards[2].tabs, ["Gradle", "Maven"]);
    assert.deepEqual(cards[3].tabs, [
      "Properties",
      "YAML",
      "TOML",
      "Groovy",
      "HOCON",
      "JSON",
    ]);
    assert.match(
      html,
      /<caption class="title">Table \d+\. Configuration Properties<\/caption>/,
    );
    assert.doesNotMatch(html, /<style\b[^>]*data-docs-shiki/i);
    assertNoRuntimeGeneratedRendering("generated docs HTML", html);
  });

  test("writes the project heading, section headings and page-relative asset links", async (t) => {
    const { html } = await renderFixture(
      t,
      [
        "This generated fixture body should render into the docs page.",
        "",
        "include::{includedir}configurationProperties/io.micronaut.fixture.GeneratedConfiguration.adoc[]",
        "",
        "image::diagram.svg[Fixture diagram]",
      ].join("\n"),
      { strict: true },
    );

    assert.match(html, /<h1>Fixture<\/h1>/);
    assert.match(html, /<h1 id="fixture-introduction">.*1 Introduction<\/h1>/);
    assert.match(
      html,
      /This generated fixture body should render into the docs page\./,
    );
    assert.match(html, /src="\.\.\/assets\/fixture\/docs\/img\/diagram\.svg"/);
    assert.match(
      html,
      /href="https:\/\/github\.com\/micronaut-projects\/micronaut-fixture\/edit\/master\/src\/main\/docs\/guide\/introduction\.adoc"/,
    );
  });
});

describe("anchors across sections", () => {
  const duplicates = (ids: string[]): string[] =>
    ids.filter((id, index) => ids.indexOf(id) !== index);

  test("headings repeated across sections get distinct anchors and local cross-references follow", async (t) => {
    const { ids, html } = await renderFixture(t, [
      {
        id: "firstSection",
        title: "First Section",
        body: ["== Configuration", "", "First body.", ""].join("\n"),
      },
      {
        id: "secondSection",
        title: "Second Section",
        body: [
          "== Configuration",
          "",
          "Second body, see <<_configuration>>.",
          "",
        ].join("\n"),
      },
    ]);

    assert.deepEqual(duplicates(ids), []);
    assert.ok(ids.includes("fixture-_configuration"));
    assert.ok(ids.includes("fixture-_configuration-2"));
    assert.match(html, /href="#fixture-_configuration-2"/);
  });

  test("section anchors outrank content headings that slug to the same id", async (t) => {
    const { ids } = await renderFixture(t, [
      {
        id: "firstSection",
        title: "First Section",
        body: [
          "[[certificates]]",
          "== Certificates",
          "",
          "First body.",
          "",
        ].join("\n"),
      },
      { id: "certificates", title: "Certificates", body: "Second body.\n" },
    ]);

    assert.deepEqual(duplicates(ids), []);
    assert.ok(ids.includes("fixture-certificates"));
    assert.ok(ids.includes("fixture-certificates-2"));
  });

  for (const [label, topLevelId] of [
    ["a repeated table-of-contents key", "installation"],
    ["a key that already carries the project prefix", "fixture-installation"],
  ]) {
    test(`${label} gets distinct section anchors`, async (t) => {
      const { ids, html } = await renderFixture(t, [
        { id: topLevelId, title: "Installation", body: "Top level body.\n" },
        {
          id: "oauth",
          title: "OAuth",
          body: "OAuth body.\n",
          child: {
            id: "installation",
            title: "Installation",
            body: "Nested body.\n",
          },
        },
      ]);

      assert.deepEqual(duplicates(ids), []);
      assert.ok(ids.includes("fixture-installation"));
      assert.ok(ids.includes("fixture-installation-2"));
      assert.deepEqual(
        [
          ...html.matchAll(
            /class="guide-section-heading">\s*<h[12] id="([^"]+)"/g,
          ),
        ]
          .map((match) => match[1])
          .filter((id) => id.startsWith("fixture-installation")),
        ["fixture-installation", "fixture-installation-2"],
      );
    });
  }
});

describe("strict mode", () => {
  test("allows the source-shape warnings synced upstream docs contain", async (t) => {
    const { html } = await renderFixture(
      t,
      [
        "== Parent heading",
        "",
        "==== Out-of-sequence heading",
        "",
        "This source still renders when synced upstream docs contain heading-level gaps.",
        "",
        "----",
        "unterminated listing content",
      ].join("\n"),
      { strict: true },
    );

    assert.match(textOnly(html), /Out-of-sequence heading/);
  });

  test("fails on a missing include", async (t) => {
    await assert.rejects(
      renderFixture(t, "include::missing.adoc[]", { strict: true }),
      /Asciidoctor diagnostics for fixture\/introduction\.adoc: .*include file not found/,
    );
  });

  test("only treats render-stopping diagnostics as fatal", () => {
    for (const warning of [
      "asciidoctor: WARN: <stdin>:5: no callout found for <1>",
      "asciidoctor: WARN: <stdin>:27: callout list item index: expected 2, got 1",
      "asciidoctor: WARN: <stdin>:5: list item index: expected 2, got 1",
      "asciidoctor: WARN: <stdin>:80: detected unclosed tag 'clazz' starting at line 31 of include file: ResourcesFactory.java",
      "asciidoctor: WARN: <stdin>:27: unterminated example block",
      "asciidoctor: WARN: <stdin>:11: unterminated listing block",
      "asciidoctor: WARN: <stdin>:3: section title out of sequence: expected level 1, got level 2",
    ]) {
      assert.equal(isFatalDocsDiagnostic(warning), false, warning);
    }
    for (const warning of [
      "asciidoctor: WARN: <stdin>:1: include file not found: missing.adoc",
      "asciidoctor: WARN: <stdin>:1: include file not readable: missing.adoc",
      "asciidoctor: WARN: <stdin>:1: include file has illegal reference to ancestor of jail",
    ]) {
      assert.equal(isFatalDocsDiagnostic(warning), true, warning);
    }
  });
});
