import assert from "node:assert/strict";
import path from "node:path";
import { describe, test } from "node:test";

import { isFatalDocsDiagnostic } from "../../docs/renderer.ts";
import { prefixIds } from "../../docs/urls.ts";
import { highlightedLines, snippetCards, textOnly } from "../support/html.ts";
import { asciidocFixtureDirectory } from "../support/paths.ts";
import { renderDocs } from "../support/render.ts";

describe("ordinary listing blocks", () => {
  test("render as a single-tab snippet card with the callout list in the footer", async () => {
    const html = await renderDocs(
      [
        ".Java source with callouts",
        "[source,java]",
        "----",
        "class HelloController { // <1>",
        "}",
        "----",
        "<1> The controller source callout.",
        "",
        "After the listing.",
      ].join("\n"),
    );
    const [card, ...rest] = snippetCards(html);

    assert.equal(rest.length, 0);
    assert.equal(card.kind, "code");
    assert.equal(card.title, "Java source with callouts");
    assert.deepEqual(card.tabs, ["Java"]);
    assert.equal(card.activeCode, "class HelloController { // <1>\n}");
    assert.deepEqual(card.callouts, [
      { number: "1", text: "The controller source callout." },
    ]);
    assert.match(card.id, /^generated-listing-snippet-[0-9a-f]{8}-0$/);
    assert.match(textOnly(html), /After the listing\./);
    assert.doesNotMatch(html, /\blistingblock\b/);
  });

  test("keep the listing's language and fall back to text", async () => {
    const html = await renderDocs(
      [
        "[source,bash]",
        "----",
        "$ curl localhost",
        "----",
        "",
        "----",
        "plain",
        "----",
      ].join("\n"),
    );
    const cards = snippetCards(html);

    assert.deepEqual(
      cards.map((card) => card.panels.map((panel) => panel.language)),
      [["bash"], ["text"]],
    );
    assert.equal(cards[1].activeCode, "plain");
  });

  test("move standalone properties callout markers onto the property line", async () => {
    const html = await renderDocs(
      [
        "[source,properties]",
        "----",
        "# <1>",
        "micronaut.server.port=8080",
        "----",
        "<1> The property callout marker moves to the property line.",
      ].join("\n"),
    );

    assert.deepEqual(highlightedLines(html), [
      "micronaut.server.port=8080 <1>",
    ]);
    assert.deepEqual(snippetCards(html)[0].callouts, [
      {
        number: "1",
        text: "The property callout marker moves to the property line.",
      },
    ]);
  });

  test("highlight empty dotted property assignments like indexed ones", async () => {
    const html = await renderDocs(
      [
        "[source,properties]",
        "----",
        "foo.bar.property=",
        "foo.bar[0]=",
        "foo.bar<prop>=",
        "kubernetes.client.discovery.includes[0]=my-service",
        "----",
      ].join("\n"),
    );
    const lines = highlightedLineHtml(html);
    const styleOf = (line: string): string => {
      const style = /<span class="line"><span style="([^"]+)">/.exec(line)?.[1];
      assert.ok(style, `expected a styled first token in ${line}`);
      return style;
    };

    assert.equal(lines.length, 4);
    assert.equal(styleOf(lines[0]), styleOf(lines[1]));
    assert.equal(styleOf(lines[0]), styleOf(lines[2]));
    assert.doesNotMatch(lines[0], /#CF222E|#FF7B72/);
    const valueStart = lines[3].indexOf("=my-service");
    assert.notEqual(valueStart, -1);
    assert.match(lines[3].slice(0, valueStart), /#CF222E|#FF7B72/);
    assert.doesNotMatch(lines[3].slice(valueStart), /#CF222E|#FF7B72/);
  });

  test("render attribute-backed inline links inside callout footers", async () => {
    const html = await renderDocs(
      [
        "[source,java]",
        "----",
        "class Example {",
        "    void groups() {} // <1>",
        "}",
        "----",
        "<1> The link:{api}/io/micronaut/security/ldap/group/LdapGroupProcessor.html#getAdditionalGroups-io.micronaut.security.ldap.context.LdapSearchResult-[getAdditionalGroups] method works.",
      ].join("\n"),
      { attributes: { api: "assets/security/docs/api" } },
    );

    assert.deepEqual(snippetCards(html)[0].callouts, [
      { number: "1", text: "The getAdditionalGroups method works." },
    ]);
    assert.match(
      html,
      /href="assets\/security\/docs\/api\/io\/micronaut\/security\/ldap\/group\/LdapGroupProcessor\.html#getAdditionalGroups-io\.micronaut\.security\.ldap\.context\.LdapSearchResult-"[^>]*>getAdditionalGroups<\/a>/,
    );
  });

  test("strip tag directives from an untagged include but not code before a trailing one", async () => {
    // Asciidoctor only processes tag directives when a tag is requested; an
    // untagged include passes `// tag::x[]` lines through verbatim.
    const render = (include: string): Promise<string> =>
      renderDocs(["[source,kotlin]", "----", include, "----", ""].join("\n"), {
        baseDir: path.join(asciidocFixtureDirectory, "tagged-include"),
      });

    const untagged = snippetCards(await render("include::Sample.kt[]"))[0]
      .activeCode;
    assert.doesNotMatch(untagged, /\b(?:tag|end)::/);
    assert.match(untagged, /import a\.b/);
    assert.match(untagged, /class A/);
    assert.match(untagged, /val trailing = 1/);

    const tagged = snippetCards(await render("include::Sample.kt[tag=x]"))[0]
      .activeCode;
    assert.doesNotMatch(tagged, /\b(?:tag|end)::/);
    assert.match(tagged, /class A/);
    assert.doesNotMatch(tagged, /import a\.b|val trailing/);
  });

  test("keep ids unique across the renders a docs page concatenates", async () => {
    // renderProject renders one fragment per table-of-contents node and
    // prefixes every id with the project slug, so identical listings in two
    // section files must still get distinct ids.
    const source = ["[source,java]", "----", "class Example {}", "----"].join(
      "\n",
    );
    const page = prefixIds(
      [
        await renderDocs(source, { diagnosticsLabel: "core/one.adoc" }),
        await renderDocs(source, { diagnosticsLabel: "core/two.adoc" }),
      ].join("\n"),
      "core",
    );
    const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

    assert.ok(ids.length >= 6);
    assert.deepEqual(
      ids.filter((id, index) => ids.indexOf(id) !== index),
      [],
    );
  });
});

describe("diagnostics", () => {
  const outOfSequence = [
    "= Title",
    "",
    "=== Out of sequence",
    "",
    "Body.",
    "",
  ].join("\n");

  test("strict rendering reports every diagnostic a lenient render reports", async () => {
    const lenient = await collectWarnings(() =>
      renderDocs(outOfSequence, { strict: false }),
    );
    const strict = await collectWarnings(() =>
      renderDocs(outOfSequence, {
        strict: true,
        fatalDiagnostic: isFatalDocsDiagnostic,
      }),
    );

    assert.match(lenient.join("\n"), /section title out of sequence/);
    assert.deepEqual(strict, lenient);
  });

  test("strict rendering fails on a fatal diagnostic with its location", async () => {
    await assert.rejects(
      renderDocs("include::definitely-missing.adoc[]\n", {
        diagnosticsLabel: "core/broken.adoc",
        strict: true,
        fatalDiagnostic: isFatalDocsDiagnostic,
      }),
      (error: Error) => {
        assert.match(
          error.message,
          /Asciidoctor diagnostics for core\/broken\.adoc/,
        );
        assert.match(error.message, /include file not found/);
        assert.match(error.message, /<stdin>: line 1/);
        return true;
      },
    );
  });

  test("ignored diagnostics are dropped in both modes", async () => {
    const ignoredDiagnostic = (diagnostic: string): boolean =>
      /section title out of sequence/.test(diagnostic);

    assert.deepEqual(
      await collectWarnings(() =>
        renderDocs(outOfSequence, { strict: false, ignoredDiagnostic }),
      ),
      [],
    );
    await renderDocs(outOfSequence, { strict: true, ignoredDiagnostic });
  });

  test("callout diagnostics the snippet pipeline handles itself are not reported", async () => {
    const warnings = await collectWarnings(() =>
      renderDocs(
        [
          "[source,java]",
          "----",
          "class Example {}",
          "----",
          "<1> Callout without a marker.",
          "",
        ].join("\n"),
        { strict: true },
      ),
    );

    assert.deepEqual(warnings, []);
  });
});

async function collectWarnings(
  render: () => Promise<string>,
): Promise<string[]> {
  const warnings: string[] = [];
  const previousWarn = console.warn;
  console.warn = (...args: unknown[]): void => {
    warnings.push(args.join(" "));
  };
  try {
    await render();
  } finally {
    console.warn = previousWarn;
  }
  return warnings;
}

function highlightedLineHtml(html: string): string[] {
  return Array.from(
    html.matchAll(
      /<span class="line">[\s\S]*?<\/span>(?=\n<span class="line">|\n?<\/code>|$)/g,
    ),
  ).map((match) => match[0]);
}
