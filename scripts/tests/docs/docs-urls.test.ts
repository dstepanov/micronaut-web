import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  claimId,
  prefixIds,
  prefixedId,
  rewriteUrls,
  uniquifyIds,
} from "../../docs/urls.ts";
import { docsProject, fixtureDocsProject } from "../support/temp-project.ts";

const project = docsProject(fixtureDocsProject);

describe("claimId", () => {
  test("prefixes an id once and suffixes repeats in claim order", () => {
    const claimed = new Set<string>();

    assert.equal(claimId("intro", "core", claimed), "core-intro");
    assert.equal(claimId("core-intro", "core", claimed), "core-intro-2");
    assert.equal(claimId("intro", "core", claimed), "core-intro-3");
    assert.deepEqual(
      [...claimed],
      ["core-intro", "core-intro-2", "core-intro-3"],
    );
  });

  test("skips ids that are reserved but not yet claimed", () => {
    const claimed = new Set<string>();
    const reserved = new Set(["core-setup", "core-setup-2"]);

    assert.equal(claimId("setup", "core", claimed, reserved), "core-setup-3");
    assert.equal(prefixedId("core-setup", "core"), "core-setup");
  });
});

describe("uniquifyIds", () => {
  test("renames colliding ids and the fragment's own references to them", () => {
    const claimed = new Set(["core-_configuration"]);
    const fragment =
      '<h2 id="_configuration">Configuration</h2><p>See <a href="#_configuration">above</a> and <a href="#_other">other</a>.</p><div data-test-id="_configuration"></div>';

    assert.equal(
      uniquifyIds(fragment, "core", claimed),
      '<h2 id="core-_configuration-2">Configuration</h2><p>See <a href="#core-_configuration-2">above</a> and <a href="#_other">other</a>.</p><div data-test-id="_configuration"></div>',
    );
  });

  test("leaves a fragment without collisions untouched", () => {
    const fragment = '<h2 id="_configuration">Configuration</h2>';

    assert.equal(uniquifyIds(fragment, "core", new Set()), fragment);
  });
});

describe("prefixIds", () => {
  test("prefixes ids, fragment links and every ARIA reference", () => {
    assert.equal(
      prefixIds(
        '<div id="tabs"><button id="tab-0" aria-controls="panel-0 panel-1" aria-labelledby="core-title"></button><a href="#tab-0">tab</a><label for="field">x</label></div>',
        "core",
      ),
      '<div id="core-tabs"><button id="core-tab-0" aria-controls="core-panel-0 core-panel-1" aria-labelledby="core-title"></button><a href="#core-tab-0">tab</a><label for="core-field">x</label></div>',
    );
  });
});

describe("rewriteUrls", () => {
  test("maps relative links and images below the project's guide assets", () => {
    assert.equal(
      rewriteUrls(
        '<img src="diagram.svg"><a href="sub/page.html?x=1#frag">x</a>',
        project,
      ),
      '<img src="../assets/fixture/docs/guide/diagram.svg"><a href="../assets/fixture/docs/guide/sub/page.html?x=1#frag">x</a>',
    );
    assert.equal(
      rewriteUrls('<a href="..\\img\\diagram.png">x</a>', project),
      '<a href="../assets/fixture/docs/img/diagram.png">x</a>',
    );
  });

  test("keeps asset, absolute, fragment, protocol-relative and empty links", () => {
    const untouched = [
      '<a href="#section">x</a>',
      '<a href="/docs/core/">x</a>',
      '<a href="https://example.test/page">x</a>',
      '<a href="//cdn.example.test/x.js">x</a>',
      '<a href="mailto:team@example.test">x</a>',
      '<a href="">x</a>',
    ];
    for (const html of untouched) {
      assert.equal(rewriteUrls(html, project), html);
    }
    assert.equal(
      rewriteUrls(
        '<a href="assets/fixture/docs/api/index.html">x</a>',
        project,
      ),
      '<a href="../assets/fixture/docs/api/index.html">x</a>',
    );
  });

  test("canonicalizes links to the published Micronaut sites", () => {
    assert.equal(
      rewriteUrls(
        '<a href="https://micronaut-projects.github.io/micronaut-docs-v2/latest/guide/#dataAccess">x</a>',
        project,
      ),
      '<a href="https://docs.micronaut.io/latest/guide/#dataAccess">x</a>',
    );
  });
});
