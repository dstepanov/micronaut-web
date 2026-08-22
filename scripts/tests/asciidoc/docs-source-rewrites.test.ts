import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { rewriteDocsSource } from "../../asciidoc/docs-source-rewrites.ts";

describe("rewriteDocsSource", () => {
  test("drops generated configuration property includes", () => {
    assert.equal(
      rewriteDocsSource(
        [
          "Before.",
          "include::{includedir}configurationProperties/io.micronaut.http.HttpConfiguration.adoc[]",
          "include::{includedir}/configurationProperties/io.micronaut.http.Other.adoc[leveloffset=1]",
          "After.",
        ].join("\n"),
      ),
      ["Before.", "", "", "After."].join("\n"),
    );
  });

  test("promotes legacy single-colon dependency lines to block macros", () => {
    assert.equal(
      rewriteDocsSource(
        [
          "dependency:micronaut-kafka[groupId=io.micronaut.kafka]",
          "  dependency:micronaut-redis[]  ",
          "dependency::already-a-macro[]",
          "See dependency:inline[] text.",
        ].join("\n"),
      ),
      [
        "dependency::micronaut-kafka[groupId=io.micronaut.kafka]",
        "  dependency::micronaut-redis[]",
        "dependency::already-a-macro[]",
        "See dependency:inline[] text.",
      ].join("\n"),
    );
  });

  test("turns indent=false into indent=0 on includes and snippets", () => {
    assert.equal(
      rewriteDocsSource(
        [
          "include::{sourcedir}/Example.java[tags=body,indent=false]",
          'snippet::example.Example[indent="false", tags=body]',
          "snippet::example.Example[indent=0]",
        ].join("\n"),
      ),
      [
        "include::{sourcedir}/Example.java[tags=body,indent=0]",
        "snippet::example.Example[indent=0, tags=body]",
        "snippet::example.Example[indent=0]",
      ].join("\n"),
    );
  });

  test("repairs a missing comma between indent and title attributes", () => {
    assert.equal(
      rewriteDocsSource("snippet::example.Example[indent=0 title=Example]"),
      "snippet::example.Example[indent=0, title=Example]",
    );
  });

  test("dedents source attribute lines that precede a listing", () => {
    assert.equal(
      rewriteDocsSource(
        ["    [source,java]", "----", "class A {}", "----"].join("\n"),
      ),
      ["[source,java]", "----", "class A {}", "----"].join("\n"),
    );
  });

  test("promotes indented backticked Java statements to source blocks", () => {
    assert.equal(
      rewriteDocsSource(
        [
          "    `@Singleton class Foo {}`",
          "    `private final String name;`",
          "    `just prose`",
        ].join("\n"),
      ),
      [
        "",
        "[source,java]",
        "----",
        "@Singleton class Foo {}",
        "----",
        "",
        "",
        "[source,java]",
        "----",
        "private final String name;",
        "----",
        "",
        "    `just prose`",
      ].join("\n"),
    );
  });
});
