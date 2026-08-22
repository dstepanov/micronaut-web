import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { configurationSamples } from "../../asciidoc/configuration-formats.ts";

const source = [
  "micronaut:",
  "  server:",
  "    port: 8080",
  "    cors:",
  "      enabled: true",
  "  application:",
  "    name: demo",
  "datasources:",
  "  default:",
  "    schema-generate: CREATE_DROP",
  "    urls:",
  "      - jdbc:h2:one",
  "      - jdbc:h2:two",
].join("\n");

function sample(language: string): string {
  const found = configurationSamples(source).find(
    (candidate) => candidate.language === language,
  );
  assert.ok(found, `expected a ${language} sample`);
  return found.source;
}

describe("configurationSamples", () => {
  test("offers the six formats in tab order with their highlighter grammars", () => {
    assert.deepEqual(
      configurationSamples(source).map((candidate) => [
        candidate.language,
        candidate.highlighterLanguage,
      ]),
      [
        ["properties", "properties"],
        ["yaml", "yaml"],
        ["toml", "toml"],
        ["groovy-config", "groovy"],
        ["hocon", "hocon"],
        ["json-config", "json"],
      ],
    );
    assert.equal(sample("yaml"), source);
  });

  test("flattens nested maps and arrays into Java properties", () => {
    assert.equal(
      sample("properties"),
      [
        "micronaut.server.port=8080",
        "micronaut.server.cors.enabled=true",
        "micronaut.application.name=demo",
        "datasources.default.schema-generate=CREATE_DROP",
        "datasources.default.urls[0]=jdbc:h2:one",
        "datasources.default.urls[1]=jdbc:h2:two",
      ].join("\n"),
    );
  });

  test("writes TOML tables", () => {
    assert.equal(
      sample("toml"),
      [
        "[micronaut.server]",
        "port = 8080",
        "",
        "[micronaut.server.cors]",
        "enabled = true",
        "",
        "[micronaut.application]",
        'name = "demo"',
        "",
        "[datasources.default]",
        'schema-generate = "CREATE_DROP"',
        'urls = [ "jdbc:h2:one", "jdbc:h2:two" ]',
      ].join("\n"),
    );
  });

  test("writes Groovy config with camel-cased keys and quoted keywords", () => {
    assert.equal(
      sample("groovy-config"),
      [
        "micronaut {",
        "  server {",
        "    port = 8080",
        "    cors {",
        "      enabled = true",
        "    }",
        "  }",
        "  application {",
        "    name = 'demo'",
        "  }",
        "}",
        "datasources {",
        "  'default' {",
        "    schemaGenerate = 'CREATE_DROP'",
        "    urls = ['jdbc:h2:one', 'jdbc:h2:two']",
        "  }",
        "}",
      ].join("\n"),
    );
  });

  test("writes HOCON objects", () => {
    assert.equal(
      sample("hocon"),
      [
        "{",
        "  micronaut = {",
        "    server = {",
        "      port = 8080",
        "      cors = {",
        "        enabled = true",
        "      }",
        "    }",
        "    application = {",
        '      name = "demo"',
        "    }",
        "  }",
        "  datasources = {",
        "    default = {",
        '      schema-generate = "CREATE_DROP"',
        '      urls = ["jdbc:h2:one", "jdbc:h2:two"]',
        "    }",
        "  }",
        "}",
      ].join("\n"),
    );
  });

  test("writes pretty-printed JSON", () => {
    assert.equal(
      sample("json-config"),
      JSON.stringify(
        {
          micronaut: {
            server: { port: 8080, cors: { enabled: true } },
            application: { name: "demo" },
          },
          datasources: {
            default: {
              "schema-generate": "CREATE_DROP",
              urls: ["jdbc:h2:one", "jdbc:h2:two"],
            },
          },
        },
        null,
        2,
      ),
    );
  });

  test("shows invalid YAML verbatim in every format rather than failing", () => {
    const invalid = "micronaut:\n  server: [unterminated";
    const samples = configurationSamples(invalid);

    assert.equal(samples.length, 6);
    assert.ok(samples.every((candidate) => candidate.source === invalid));
  });

  test("drops a blank configuration entirely", () => {
    assert.deepEqual(configurationSamples("   \n"), []);
  });

  test("escapes quotes and non-ASCII keys in Groovy and nulls per format", () => {
    const samples = configurationSamples(
      ["message: it's", "ünicode: 1", "empty:", "flag: false"].join("\n"),
    );
    const by = (language: string): string =>
      samples.find((candidate) => candidate.language === language)?.source ||
      "";

    assert.match(by("groovy-config"), /message = 'it\\'s'/);
    assert.match(by("groovy-config"), /'ünicode' = 1/);
    assert.match(by("groovy-config"), /empty = null/);
    assert.match(by("properties"), /^empty=$/m);
    assert.match(by("properties"), /^flag=false$/m);
    assert.match(by("hocon"), /empty = null/);
  });
});
