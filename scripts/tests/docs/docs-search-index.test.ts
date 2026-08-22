import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDocsSearchIndex,
  extractGeneratedDocSearchItems,
} from "../../docs/search-index.ts";

test("docs search index includes generated headings, properties, classes, projects, and repos", (): void => {
  const project = {
    slug: "fixture",
    displayName: "Micronaut Fixture",
    shortName: "Fixture",
    projectKey: "fixture",
    module: "io.micronaut.fixture:micronaut-fixture-bom",
    repositoryName: "micronaut-fixture",
    repositoryUrl:
      "https://github.com/micronaut-projects/micronaut-fixture.git",
    href: "/docs/fixture/",
    shortDescription: "Fixture integration",
    longDescription: "Fixture generated docs test project.",
    searchTerms: ["fixture"],
    sections: [
      {
        id: "fixture-overview",
        number: "1",
        title: "Overview",
        summary: "Fixture overview fallback.",
      },
    ],
  };
  const html = [
    '<div class="guide-section-heading">',
    '  <h1 id="fixture-introduction"><a class="anchor" href="#fixture-introduction"></a>1 Introduction</h1>',
    "</div>",
    '<div class="guide-section-heading">',
    '  <h2 id="fixture-client"><a class="anchor" href="#fixture-client"></a>1.1 HTTP Client</h2>',
    "</div>",
    '<table class="tableblock frame-all grid-all stretch">',
    '  <caption class="title">Table 1. Configuration Properties</caption>',
    "    <tbody>",
    "      <tr><td><p><code>micronaut.fixture.enabled</code></p></td><td><p>Boolean</p></td><td><p>Enables the fixture.</p></td></tr>",
    "    </tbody>",
    "</table>",
    '<p>Use <a href="../assets/fixture/docs/api/io/micronaut/fixture/FixtureClient.html">FixtureClient</a>.</p>',
  ].join("\n");

  const generatedItems = extractGeneratedDocSearchItems(project, html);
  const introduction = generatedItems.find(
    (item: any): any => item.href === "/docs/fixture/#fixture-introduction",
  );
  const client = generatedItems.find(
    (item: any): any => item.href === "/docs/fixture/#fixture-client",
  );
  assert.equal(introduction?.weight, 2);
  assert.equal(client?.weight, 1);
  assert.ok(
    generatedItems.some(
      (item: any): any =>
        item.scope === "Docs" && item.title.includes("HTTP Client"),
    ),
  );
  assert.ok(
    generatedItems.some(
      (item: any): any =>
        item.scope === "Properties" &&
        item.title === "micronaut.fixture.enabled",
    ),
  );
  assert.ok(
    generatedItems.some(
      (item: any): any =>
        item.scope === "Classes" && item.title === "FixtureClient",
    ),
  );

  const index = buildDocsSearchIndex([project], { fixture: html });
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Projects" && item.href === "/docs/fixture/",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Repos" && item.href === project.repositoryUrl,
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Docs" &&
        item.href === "/docs/fixture/#fixture-overview",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Classes" &&
        item.href ===
          "/docs/assets/fixture/docs/api/io/micronaut/fixture/FixtureClient.html",
    ),
  );
});

test("docs search index covers several generated docs fragments", (): void => {
  const projects = [
    searchProject("core", "Micronaut Core", "Core Framework"),
    searchProject("data", "Micronaut Data", "Data Access"),
    searchProject("serde", "Micronaut Serialization", "Serialization"),
  ];
  const htmlBySlug = {
    core: [
      '<div class="guide-section-heading">',
      '  <h1 id="core-introduction"><a class="anchor" href="#core-introduction"></a>1 Introduction</h1>',
      "</div>",
      '<p>Use <a href="../assets/core/docs/api/io/micronaut/context/BeanContext.html">BeanContext</a>.</p>',
    ].join("\n"),
    data: [
      '<div class="guide-section-heading">',
      '  <h2 id="data-repositories"><a class="anchor" href="#data-repositories"></a>1.1 Repositories</h2>',
      "</div>",
      '<table class="tableblock frame-all grid-all stretch">',
      '<caption class="title">Table 1. Configuration Properties</caption>',
      "  <tbody>",
      "    <tr><td><p><code>micronaut.data.default-schema</code></p></td><td><p>String</p></td><td><p>Default schema.</p></td></tr>",
      "  </tbody></table>",
    ].join("\n"),
    serde: [
      '<div class="guide-section-heading">',
      '  <h2 id="serde-jackson"><a class="anchor" href="#serde-jackson"></a>1.2 Jackson Interop</h2>',
      "</div>",
      '<p>Use <a href="../assets/serde/docs/api/io/micronaut/serde/ObjectMapper.html">ObjectMapper</a>.</p>',
    ].join("\n"),
  };

  const index = buildDocsSearchIndex(projects, htmlBySlug);

  for (const project of projects) {
    assert.ok(
      index.some(
        (item: any): any =>
          item.scope === "Projects" && item.href === project.href,
      ),
      `${project.slug} project should be indexed`,
    );
  }
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Docs" &&
        item.title.includes("Repositories") &&
        item.href === "/docs/data/#data-repositories",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Properties" &&
        item.title === "micronaut.data.default-schema",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Classes" &&
        item.title === "BeanContext" &&
        item.href ===
          "/docs/assets/core/docs/api/io/micronaut/context/BeanContext.html",
    ),
  );
  assert.ok(
    index.some(
      (item: any): any =>
        item.scope === "Classes" &&
        item.title === "ObjectMapper" &&
        item.href ===
          "/docs/assets/serde/docs/api/io/micronaut/serde/ObjectMapper.html",
    ),
  );
});

function searchProject(
  slug: string,
  displayName: string,
  sectionTitle: string,
) {
  return {
    slug,
    displayName,
    shortName: displayName.replace(/^Micronaut\s+/i, ""),
    projectKey: slug,
    module: `io.micronaut.${slug}:micronaut-${slug}-bom`,
    repositoryName: `micronaut-${slug}`,
    repositoryUrl: `https://github.com/micronaut-projects/micronaut-${slug}.git`,
    href: `/docs/${slug}/`,
    shortDescription: sectionTitle,
    longDescription: `${displayName} generated docs test project.`,
    searchTerms: [slug],
    sections: [
      {
        id: `${slug}-overview`,
        number: "1",
        title: sectionTitle,
        summary: `${sectionTitle} fallback.`,
      },
    ],
  };
}
