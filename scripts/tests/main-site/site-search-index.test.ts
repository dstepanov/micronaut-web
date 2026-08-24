import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

import {
  searchItems,
  type DocsProject,
} from "../../../src/lib/content-catalog.ts";
import type { GeneratedGuide } from "../../../src/lib/generated-guide-routing.ts";
import { projectDirectory } from "../support/paths.ts";

function guide(slug: string, title: string): GeneratedGuide {
  return {
    slug,
    title,
    intro: `How to ${title}.`,
    authors: ["Sergio del Amo"],
    tags: ["jwt"],
    categories: ["Security"],
    publicationDate: "2026-01-01",
    estimatedMinutes: 20,
    overviewFile: `${slug}.html`,
    defaultOptionFile: `${slug}-gradle-java.html`,
    options: [
      {
        id: `${slug}-gradle-java`,
        label: "Java / Gradle",
        language: "java",
        languageLabel: "Java",
        buildTool: "gradle",
        buildToolLabel: "Gradle",
        file: `${slug}-gradle-java.html`,
        fragment: `fragments/${slug}-gradle-java.html`,
        zipUrl: `${slug}.zip`,
      },
    ],
  };
}

const projects: DocsProject[] = [];

describe("site search catalog", () => {
  test("indexes every guide and post it is given", () => {
    const guides = Array.from({ length: 120 }, (_, index) =>
      guide(`guide-${index}`, `Guide ${index}`),
    );
    const posts = Array.from({ length: 90 }, (_, index) => ({
      title: `Micronaut Framework 5.${index} Released!`,
      description: "Release announcement.",
      href: `/2026/01/01/release-${index}/`,
      topics: ["release-announcements"],
    }));

    const items = searchItems({ projects, guides, posts });

    assert.equal(items.filter((item) => item.kind === "Guide").length, 120);
    assert.equal(items.filter((item) => item.kind === "Post").length, 90);
  });

  test("keeps post topics searchable and links to the post route", () => {
    const items = searchItems({
      projects,
      guides: [],
      posts: [
        {
          title: "Micronaut Framework 5.0 with Java 25 baseline",
          description: "The Java baseline will be Java 25.",
          href: "/2026/04/27/java-25-baseline/",
          topics: ["release-announcements", "micronaut-5"],
        },
      ],
    });

    const [post] = items;
    assert.equal(post.kind, "Post");
    assert.equal(post.href, "/2026/04/27/java-25-baseline/");
    assert.match(post.terms, /release-announcements/);
    assert.match(post.terms, /micronaut-5/);
  });

  test("the web deploy refreshes the guide catalog before it builds", async () => {
    // The main surface renders no guide content, so its search index is built
    // from the checked-in catalog, which is only a small offline sample. The
    // published index described 4 of 177 guides until the deploy refreshed it.
    const workflow = await fs.readFile(
      path.join(projectDirectory, ".github/workflows/deploy-web.yml"),
      "utf8",
    );

    assert.ok(
      workflow.indexOf("npm run sync:guides") <
        workflow.indexOf("npm run build:main"),
      "deploy-web must sync the guide catalog before building",
    );
  });

  test("the route builds the catalog from generated content, never fixtures", async () => {
    const route = await fs.readFile(
      path.join(projectDirectory, "src", "pages", "search-index.json.ts"),
      "utf8",
    );

    // The published index once held 4 of 177 guides and no posts because the
    // catalog was built from the checked-in `@/data` fixtures.
    assert.doesNotMatch(route, /from "@\/data\//);
    assert.match(route, /readGeneratedGuidesManifest/);
    assert.match(route, /loadDocsProjectCatalog/);
    assert.match(route, /getBlogPosts/);
  });
});
