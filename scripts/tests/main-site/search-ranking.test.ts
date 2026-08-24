import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  bestScore,
  rankSearchItems,
  searchTokens,
} from "../../../src/lib/search-ranking.ts";

const items = [
  {
    title: "Promote an Upcoming Event",
    description: "Share conference and meetup details with the community.",
    terms: "promote event conference talk",
  },
  {
    title: "Controller",
    description: "Micronaut Core API reference.",
    terms: "io.micronaut.http.annotation.Controller",
  },
  {
    title: "Micronaut Kafka",
    description: "Kafka messaging",
    terms: "kafka messaging streams",
  },
  {
    title: "Micronaut Kotlin",
    description: "Kotlin language support",
    terms: "kotlin language",
  },
  {
    title: "Creating your first Micronaut application",
    description: "Hello World with a controller and a functional test.",
    terms: "getting started controller",
  },
];

describe("searchTokens", () => {
  test("drops the punctuation that Java identifiers carry", () => {
    assert.deepEqual(searchTokens("@Controller"), ["controller"]);
    assert.deepEqual(searchTokens("run()"), ["run"]);
    assert.deepEqual(searchTokens("HttpRequest#getUri"), [
      "httprequest",
      "geturi",
    ]);
    assert.deepEqual(searchTokens("io.micronaut.context"), [
      "io",
      "micronaut",
      "context",
    ]);
  });
});

describe("rankSearchItems", () => {
  test("puts an exact title match first", () => {
    assert.equal(rankSearchItems(items, "controller")[0].title, "Controller");
  });

  test("finds the class when the query carries an annotation prefix", () => {
    // "@Controller" used to return nothing at all.
    const ranked = rankSearchItems(items, "@Controller");
    assert.ok(ranked.length > 0);
    assert.equal(ranked[0].title, "Controller");
  });

  test("does not let an unrelated term fuzzy-match", () => {
    const titles = rankSearchItems(items, "kafka").map((item) => item.title);
    assert.deepEqual(titles, ["Micronaut Kafka"]);
    assert.ok(!titles.includes("Micronaut Kotlin"));
  });

  test("requires every token to match", () => {
    assert.deepEqual(rankSearchItems(items, "kafka kotlin"), []);
  });

  test("keeps the full list for an empty query", () => {
    assert.equal(rankSearchItems(items, "   ").length, items.length);
  });
});

describe("bestScore", () => {
  test("ranks the group holding an exact match above one that only mentions it", () => {
    // "controller" used to list projects that merely mention controllers above
    // the Controller class itself.
    const classes = [items[1]];
    const projects = [
      {
        title: "Micronaut Hibernate Validator",
        description: "Hibernate Validator integration",
        terms: "validation controller advice integration",
      },
    ];
    assert.ok(
      bestScore(classes, "controller") > bestScore(projects, "controller"),
    );
  });

  test("scores a group with no match below one that matches", () => {
    assert.ok(bestScore([items[3]], "kafka") < bestScore([items[2]], "kafka"));
  });
});
