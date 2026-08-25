import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

import {
  guideSearchItems,
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
  test("indexes every post it is given", () => {
    const posts = Array.from({ length: 90 }, (_, index) => ({
      title: `Micronaut Framework 5.${index} Released!`,
      description: "Release announcement.",
      href: `/2026/01/01/release-${index}/`,
      topics: ["release-announcements"],
    }));

    const items = searchItems({ projects, posts });

    assert.equal(items.filter((item) => item.kind === "Post").length, 90);
  });

  test("indexes every guide in the published guides manifest", () => {
    const guides = Array.from({ length: 177 }, (_, index) =>
      guide(`guide-${index}`, `Guide ${index}`),
    );

    const items = guideSearchItems([
      ...guides,
      guide(
        "micronaut-linkedin",
        "Secure a Micronaut application with LinkedIn",
      ),
    ]);

    assert.equal(items.filter((item) => item.kind === "Guide").length, 178);
    // The published index once held 4 of 177 guides: it was built from the
    // checked-in fixture on an artifact that renders no guide content.
    assert.ok(
      items.some(
        (item) =>
          item.kind === "Guide" &&
          item.title === "Secure a Micronaut application with LinkedIn" &&
          item.href === "/guides/micronaut-linkedin-gradle-java/",
      ),
    );
    assert.ok(
      items.some(
        (item) => item.kind === "Tag" && item.href === "/guides/tag-jwt/",
      ),
    );
  });

  test("keeps post topics searchable and links to the post route", () => {
    const items = searchItems({
      projects,
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

  test("the route builds the catalog from generated content, never fixtures", async () => {
    const route = await fs.readFile(
      path.join(projectDirectory, "src", "pages", "search-index.json.ts"),
      "utf8",
    );

    // The published index once held no posts because the catalog was built
    // from the checked-in `@/data` fixtures.
    assert.doesNotMatch(route, /from "@\/data\//);
    assert.match(route, /loadDocsProjectCatalog/);
    assert.match(route, /getBlogPosts/);
    // Guides stay out: this route is served by an artifact built without any
    // generated guide content, so anything it indexed was a fixture guide.
    assert.doesNotMatch(route, /readGeneratedGuidesManifest/);
  });

  test("search reads the guide list from the guides deployment manifest", async () => {
    const [layout, dialog] = await Promise.all([
      fs.readFile(
        path.join(projectDirectory, "src", "layouts", "WebLayout.astro"),
        "utf8",
      ),
      fs.readFile(
        path.join(
          projectDirectory,
          "src",
          "components",
          "web",
          "search-dialog.tsx",
        ),
        "utf8",
      ),
    ]);

    assert.match(
      layout,
      /withSurfacePath\("guides", "\/guides\/manifest\.json"\)/,
    );
    assert.match(layout, /data-guides-manifest-url=\{guidesManifestUrl\}/);
    assert.match(dialog, /guideSearchItems/);
  });
});
