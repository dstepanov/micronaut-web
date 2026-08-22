import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

import { prefixIds } from "../../docs/urls.ts";
import {
  buttonHtmlForLanguage,
  manualCallouts,
  snippetCards,
  textOnly,
} from "../support/html.ts";
import { asciidocFixtureDirectory } from "../support/paths.ts";
import { renderDocs } from "../support/render.ts";

describe("the snippet gallery fixture", () => {
  test("renders every listing and macro as a shared React card", async () => {
    const html = await renderDocs(
      await fs.readFile(
        path.join(asciidocFixtureDirectory, "snippet-gallery.adoc"),
        "utf8",
      ),
    );
    const cards = snippetCards(html);
    const byTitle = (title: string) => {
      const card = cards.find((candidate) => candidate.title === title);
      assert.ok(card, `expected a card titled ${title}`);
      return card;
    };

    assert.doesNotMatch(html, /\blistingblock\b/);
    assert.doesNotMatch(html, /snippet::|dependency::/);

    const controller = byTitle("Controller variants");
    assert.equal(controller.description, "Rendered from snippet macro");
    assert.deepEqual(controller.tabs, ["Java", "Kotlin", "Groovy"]);
    assert.match(controller.activeCode, /@Controller\("\/hello"\) \/\/ <1>/);
    assert.deepEqual(controller.callouts, [
      {
        number: "1",
        text: "The snippet macro callout is attached to the shared snippet card.",
      },
    ]);

    // A multi-target macro whose targets resolve the same language renders one
    // card per target rather than duplicate tabs.
    const listeners = cards.filter((card) =>
      /EventListenerFixture/.test(card.activeCode),
    );
    assert.equal(listeners.length, 2);
    assert.equal(
      listeners[0].title,
      "Listening for Events with ApplicationEventListener",
    );
    assert.doesNotMatch(listeners[0].activeCode, /EventListenerFixtureSpec/);
    assert.match(listeners[1].activeCode, /EventListenerFixtureSpec/);

    const dependency = byTitle("HTTP Client dependency");
    assert.equal(dependency.kind, "dependency");
    assert.equal(dependency.description, "Rendered from dependency macro");
    assert.deepEqual(dependency.tabs, ["Gradle", "Maven"]);
    assert.equal(
      dependency.activeCode,
      'implementation("io.micronaut:micronaut-http-client")',
    );

    const configuration = byTitle("Application configuration");
    assert.deepEqual(configuration.tabs, [
      "Properties",
      "YAML",
      "TOML",
      "Groovy",
      "HOCON",
      "JSON",
    ]);
    assert.equal(configuration.activeCode, "micronaut.server.port=8080");

    assert.match(
      html,
      /<caption class="title">Table \d+\. Configuration Properties<\/caption>/,
    );
    assert.match(
      textOnly(html),
      /\$ curl http:\/\/localhost:8080\/hello Hello World/,
    );
  });

  test("uses the language icon that matches each tab", async () => {
    const html = await renderDocs(
      await fs.readFile(
        path.join(asciidocFixtureDirectory, "snippet-gallery.adoc"),
        "utf8",
      ),
    );
    for (const [language, icon] of [
      ["bash", "terminal"],
      ["gradle", "gradle"],
      ["groovy", "groovy"],
      ["groovy-config", "groovy"],
      ["hocon", "hocon"],
      ["java", "java"],
      ["json", "json"],
      ["json-config", "json"],
      ["kotlin", "kotlin"],
      ["maven", "maven"],
      ["properties", "properties"],
      ["text", "text"],
      ["toml", "toml"],
      ["xml", "xml"],
      ["yaml", "yaml"],
    ]) {
      assert.match(
        buttonHtmlForLanguage(html, language),
        new RegExp(`docs-code-language-icon-${icon}`),
        `${language} tab icon`,
      );
    }
  });
});

describe("snippet macros", () => {
  test("absorb the callout list that follows and renumber it to the source markers", async () => {
    const html = await renderDocs(
      [
        "snippet::callouts[]",
        "<2> First source callout.",
        "<4> Second source callout.",
        "<5> Manual callout.",
        "",
      ].join("\n"),
    );
    const [card] = snippetCards(html);

    assert.equal(
      card.activeCode,
      [
        "class Example {",
        "    void one() {} // <1>",
        "    void two() {} // <2>",
        "}",
      ].join("\n"),
    );
    assert.deepEqual(card.callouts, [
      { number: "1", text: "First source callout." },
      { number: "2", text: "Second source callout." },
    ]);
    // The item without a marker is handed back to the document.
    assert.deepEqual(manualCallouts(html), ["Manual callout."]);
  });

  test("get distinct ids for repeated macros and across concatenated renders", async () => {
    const source = [
      "== Section",
      "",
      "snippet::controller[title=Controller variants]",
      "",
      "snippet::controller[title=Controller variants]",
      "",
    ].join("\n");
    const page = prefixIds(
      [
        await renderDocs(source, { diagnosticsLabel: "core/one.adoc" }),
        await renderDocs(source, { diagnosticsLabel: "core/two.adoc" }),
      ].join("\n"),
      "core",
    );
    const ids = snippetCards(page).map((card) => card.id);

    assert.equal(ids.length, 4);
    assert.equal(new Set(ids).size, 4);
  });

  test("render nothing for an unknown target", async () => {
    const html = await renderDocs("Before.\n\nsnippet::unknown[]\n\nAfter.\n");

    assert.deepEqual(snippetCards(html), []);
    assert.equal(textOnly(html), "Before. After.");
  });
});

describe("dependency macros", () => {
  test("render Gradle and Maven variants with the project group by default", async () => {
    const [card] = snippetCards(
      await renderDocs(
        "dependency::micronaut-http-client[title=HTTP Client Block]\n",
      ),
    );

    assert.equal(card.title, "HTTP Client Block");
    assert.deepEqual(
      card.panels.map((panel) => panel.language),
      ["gradle", "maven"],
    );
    assert.equal(
      card.panels[0].code,
      'implementation("io.micronaut:micronaut-http-client")',
    );
    assert.equal(
      card.panels[1].code,
      [
        "<dependency>",
        "    <groupId>io.micronaut</groupId>",
        "    <artifactId>micronaut-http-client</artifactId>",
        "</dependency>",
      ].join("\n"),
    );
  });

  test("accept the legacy single-colon line form and group:artifact:version targets", async () => {
    const cards = snippetCards(
      await renderDocs(
        [
          'dependency:micronaut-kafka[groupId="io.micronaut.kafka"]',
          "",
          'dependency:org.slf4j:jul-to-slf4j:2.0.9[scope="runtimeOnly"]',
        ].join("\n"),
      ),
    );

    assert.equal(cards.length, 2);
    assert.equal(
      cards[0].panels[0].code,
      'implementation("io.micronaut.kafka:micronaut-kafka")',
    );
    assert.equal(
      cards[1].panels[0].code,
      'runtimeOnly("org.slf4j:jul-to-slf4j:2.0.9")',
    );
    assert.equal(
      cards[1].panels[1].code,
      [
        "<dependency>",
        "    <groupId>org.slf4j</groupId>",
        "    <artifactId>jul-to-slf4j</artifactId>",
        "    <version>2.0.9</version>",
        "    <scope>runtime</scope>",
        "</dependency>",
      ].join("\n"),
    );
  });
});

describe("dependency macros with scopes", () => {
  test("map scopes to both build tools and wrap Maven annotation processor paths", async () => {
    const cards = snippetCards(
      await renderDocs(
        [
          "dependency::micronaut-inject-java[scope=annotationProcessor,version=4.9.0]",
          "",
          "dependency::validation[scope=test,classifier=tests]",
          "",
          "dependency::micronaut-data-tx[gradleScope=api,mavenScope=provided]",
        ].join("\n"),
      ),
    );

    assert.deepEqual(
      cards.map((card) => card.panels.map((panel) => panel.code)),
      [
        [
          'annotationProcessor("io.micronaut:micronaut-inject-java:4.9.0")',
          [
            "<annotationProcessorPaths>",
            "    <path>",
            "        <groupId>io.micronaut</groupId>",
            "        <artifactId>micronaut-inject-java</artifactId>",
            "        <version>4.9.0</version>",
            "    </path>",
            "</annotationProcessorPaths>",
          ].join("\n"),
        ],
        [
          'testImplementation("io.micronaut:validation::tests")',
          [
            "<dependency>",
            "    <groupId>io.micronaut</groupId>",
            "    <artifactId>validation</artifactId>",
            "    <scope>test</scope>",
            "    <classifier>tests</classifier>",
            "</dependency>",
          ].join("\n"),
        ],
        [
          'api("io.micronaut:micronaut-data-tx")',
          [
            "<dependency>",
            "    <groupId>io.micronaut</groupId>",
            "    <artifactId>micronaut-data-tx</artifactId>",
            "    <scope>provided</scope>",
            "</dependency>",
          ].join("\n"),
        ],
      ],
    );
  });

  test("prefix bare artifacts with micronaut- only inside the io.micronaut group", async () => {
    const cards = snippetCards(
      await renderDocs(
        [
          "dependency::kafka[groupId=io.micronaut.kafka]",
          "",
          "dependency::postgresql[groupId=org.postgresql,version=42.7.3]",
        ].join("\n"),
      ),
    );

    assert.deepEqual(
      cards.map((card) => card.panels[0].code),
      [
        'implementation("io.micronaut.kafka:micronaut-kafka")',
        'implementation("org.postgresql:postgresql:42.7.3")',
      ],
    );
  });
});

describe("configuration blocks", () => {
  test("offer every configuration format as a tab", async () => {
    const [card] = snippetCards(
      await renderDocs(
        [
          "[configuration,title=Configuration Block]",
          "----",
          "micronaut:",
          "  application:",
          "    name: demo",
          "----",
        ].join("\n"),
      ),
    );

    assert.equal(card.title, "Configuration Block");
    assert.deepEqual(
      card.panels.map((panel) => [panel.language, panel.code]),
      [
        ["properties", "micronaut.application.name=demo"],
        ["yaml", "micronaut:\n  application:\n    name: demo"],
        ["toml", '[micronaut.application]\nname = "demo"'],
        [
          "groovy-config",
          "micronaut {\n  application {\n    name = 'demo'\n  }\n}",
        ],
        [
          "hocon",
          '{\n  micronaut = {\n    application = {\n      name = "demo"\n    }\n  }\n}',
        ],
        [
          "json-config",
          '{\n  "micronaut": {\n    "application": {\n      "name": "demo"\n    }\n  }\n}',
        ],
      ],
    );
  });

  test("keep verbatim substitutions from escaping the card markup", async () => {
    const html = await renderDocs(
      [
        "For example, to configure Google as a provider:",
        "",
        '[configuration,subs="verbatim"]',
        "----",
        "micronaut:",
        "  security:",
        "    oauth2:",
        "      clients:",
        "        google:",
        "          client-secret: <<your client secret>>",
        "          openid:",
        "            issuer: https://accounts.google.com",
        "----",
      ].join("\n"),
    );
    const [card] = snippetCards(html);

    assert.doesNotMatch(html, /&lt;div data-slot="card"/);
    assert.match(
      card.activeCode,
      /micronaut\.security\.oauth2\.clients\.google\.client-secret=<<your client secret>>/,
    );
    assert.match(card.activeCode, /issuer=https:\/\/accounts\.google\.com/);
    assert.match(
      textOnly(html),
      /For example, to configure Google as a provider/,
    );
  });
});
