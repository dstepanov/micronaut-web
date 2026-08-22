import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeStandaloneCalloutLines,
  shikiLanguage,
} from "../../shared/highlight.ts";

test("standalone and comment-only callout markers move onto the next property line", (): void => {
  const source = [
    "micronaut.mcp.server.info.name=Weather",
    "<1>",
    "micronaut.mcp.server.transport=HTTP",
    "# <2>",
    "micronaut.mcp.server.info.version=0.0.1",
  ].join("\n");

  assert.equal(
    normalizeStandaloneCalloutLines(source, "properties"),
    [
      "micronaut.mcp.server.info.name=Weather",
      "micronaut.mcp.server.transport=HTTP <1>",
      "micronaut.mcp.server.info.version=0.0.1 <2>",
    ].join("\n"),
  );
});

test("standalone callout markers stay put when nothing follows or another marker follows", (): void => {
  assert.equal(
    normalizeStandaloneCalloutLines("a=1\n<1>\n# comment\nb=2", "properties"),
    "a=1\n<1>\n# comment\nb=2",
  );
  assert.equal(
    normalizeStandaloneCalloutLines("a=1\n<1>\n<2>\nb=2", "hocon"),
    "a=1\n<1>\nb=2 <2>",
  );
  assert.equal(
    normalizeStandaloneCalloutLines("a=1\n<1>\nb=2", "java"),
    "a=1\n<1>\nb=2",
  );
});

test("shikiLanguage maps docs language names to Shiki grammars", (): void => {
  assert.equal(shikiLanguage("commandline"), "shellscript");
  assert.equal(shikiLanguage("graphqls"), "graphql");
  assert.equal(shikiLanguage("mysql"), "sql");
  assert.equal(shikiLanguage("Gradle"), "kotlin");
  assert.equal(shikiLanguage("groovy-config"), "groovy");
  assert.equal(shikiLanguage(""), "text");
  assert.equal(shikiLanguage("java"), "java");
});
