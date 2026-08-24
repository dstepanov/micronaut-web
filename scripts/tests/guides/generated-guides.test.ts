import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

import {
  assertNoRuntimeGeneratedRendering,
  assertSnippetLanguageIcon,
  highlightedLines,
  snippetCards,
  textOnly,
} from "../support/html.ts";
import {
  runRenderGuides,
  temporaryDirectory,
  writeCommonLicense,
  writeGuideFixture,
  writeGuideMetadata,
  writeTextFile,
} from "../support/temp-project.ts";
import { guideOptions, readGuides } from "../../guides/model.ts";

// End-to-end runs of scripts/render-guides.ts. Macro behaviour is covered in
// guide-macros.test.ts in-process; these tests cover what only the CLI does:
// guide selection, the manifest, asset copying, strict mode and the output
// layout of a complete guide.

describe("render-guides", () => {
  test("renders the default guide subset with every macro family expanded", async (t) => {
    const root = await temporaryDirectory(t, "micronaut-web-guides-");
    const guidesDirectory = path.join(root, "micronaut-guides");
    const outputDirectory = path.join(root, "generated-guides");
    await writeGuideFixture(
      guidesDirectory,
      "micronaut-http-client",
      "HTTP Client",
    );
    await writeGuideFixture(
      guidesDirectory,
      "not-default-guide",
      "Ignored Guide",
    );

    const { stderr } = await runRenderGuides(guidesDirectory, outputDirectory);
    assert.doesNotMatch(
      stderr,
      /no callout found|callout list item index|include file not found/i,
    );

    const manifest = JSON.parse(
      await fs.readFile(path.join(outputDirectory, "manifest.json"), "utf8"),
    );
    assert.deepEqual(
      manifest.guides.map((guide: { slug: string }) => guide.slug),
      ["micronaut-http-client"],
    );
    assert.deepEqual(
      manifest.guides[0].options.map((option: { id: string }) => option.id),
      ["micronaut-http-client-gradle-java", "micronaut-http-client-maven-java"],
    );
    assert.equal(
      manifest.guides[0].defaultOptionFile,
      "micronaut-http-client-gradle-java.html",
    );

    const html = await fs.readFile(
      path.join(
        outputDirectory,
        "fragments",
        "micronaut-http-client-gradle-java.html",
      ),
      "utf8",
    );
    const text = textOnly(html);
    const cards = snippetCards(html);

    assert.match(text, /Hello DEFAULT from template/);
    assert.match(text, /Injected value: World/);
    assert.doesNotMatch(html, /<style\b[^>]*data-docs-shiki/i);

    // Admonition labels render as text; Font Awesome is never loaded, so the
    // `icons=font` `<i>` markup would show nothing.
    assert.match(html, /<td class="icon">\s*<div class="title">Note<\/div>/);
    assert.doesNotMatch(html, /class="fa icon-/);
    assertNoRuntimeGeneratedRendering("generated guide HTML", html);

    // Dependencies group into one card whose callouts follow it.
    const dependencies = cards.find((card) => card.kind === "dependency");
    assert.ok(dependencies);
    assert.match(
      dependencies.activeCode,
      /io\.micronaut:micronaut-http-client/,
    );
    assert.deepEqual(
      dependencies.callouts.map((callout) => callout.text),
      ["Adds HTTP client dependency.", "Adds validation dependency."],
    );

    // Excludes resolve against the rendered language and build tool.
    assert.match(text, /Kotlin-only guide text remains for Java/);
    assert.match(text, /Gradle-only guide text remains for Gradle/);
    assert.match(html, /<h([1-6])\b[^>]*>Gradle-only fixture heading<\/h\1>/);
    assert.doesNotMatch(text, /Java and Groovy guide text should not render/);
    assert.doesNotMatch(text, /Maven-only guide text remains for Maven/);

    // A comment-only callout marker attaches to the next property line.
    assert.ok(
      highlightedLines(html).includes("fixture.marker.transport=HTTP <1>"),
    );

    // Generated and manual callouts keep their order and numbering.
    const byCode = (marker: RegExp) => {
      const card = cards.find((candidate) => marker.test(candidate.activeCode));
      assert.ok(card, `expected a card matching ${marker}`);
      return card.callouts.map(
        (callout) => `${callout.number} ${callout.text}`,
      );
    };
    assert.deepEqual(byCode(/SequentialCalloutController/), [
      "1 Generated callout one.",
      "2 Generated callout two.",
      "3 Generated callout three.",
      "4 Generated callout four.",
    ]);
    assert.deepEqual(byCode(/MarkedController/), [
      "1 Generated callout one.",
      "2 Manual callout keeps its place.",
      "3 Generated callout three.",
    ]);
    assert.deepEqual(byCode(/PartiallyMarkedController/), [
      "1 Generated callout one.",
    ]);
    assert.match(text, /Missing source marker becomes manual/);
    assert.deepEqual(byCode(/GappedController/), [
      "1 Gapped first real callout.",
      "2 Gapped second real callout.",
      "3 Gapped third real callout.",
      "4 Gapped fourth real callout.",
    ]);
    assert.match(text, /Gapped missing marker becomes manual/);
    assert.deepEqual(byCode(/IncludedController/), ["1 Raw include callout."]);
    assert.deepEqual(byCode(/kind: Service/), [
      "1 Kubernetes include callout.",
    ]);
    assert.match(text, /Unmarked source callout/);
    assert.doesNotMatch(html, /__MICRONAUT_CALLOUT_||/);

    // Links are rewritten to the published sites.
    assert.match(
      html,
      /href="https:\/\/guides\.micronaut\.io\/another-guide\/"/,
    );
    assert.match(
      html,
      /href="https:\/\/guides\.micronaut\.io\/legacy-guide\/"/,
    );
    assert.match(
      html,
      /href="https:\/\/guides\.micronaut\.io\/micronaut-jpa-hibernate-gradle-java\/"/,
    );
    assert.match(
      html,
      /href="https:\/\/docs\.micronaut\.io\/latest\/guide\/#dataAccess"/,
    );
    assert.match(
      html,
      /href="https:\/\/guides\.micronaut\.io\/micronaut-http-client-gradle-java\.zip"/,
    );
    assert.match(html, /https:\/\/launch\.micronaut\.io\?/);
    assert.match(html, /<table class="tableblock/);
    for (const language of [
      "java",
      "kotlin",
      "groovy",
      "properties",
      "yaml",
      "gradle",
    ]) {
      assertSnippetLanguageIcon(html, language, language);
    }
    assert.doesNotMatch(
      html,
      /source:{1,2}|common-template:{1,2}|callout:{1,2}|dependency:{1,2}|diffLink:{1,2}|exclude-for-languages:{1,2}|exclude-for-build:{1,2}|\[guide-dependencies|ifeval::|endif::/,
    );

    const mavenHtml = await fs.readFile(
      path.join(
        outputDirectory,
        "fragments",
        "micronaut-http-client-maven-java.html",
      ),
      "utf8",
    );
    const mavenText = textOnly(mavenHtml);
    assert.match(mavenText, /Maven-only guide text remains for Maven/);
    assert.doesNotMatch(mavenText, /Gradle-only guide text remains for Gradle/);
    assertSnippetLanguageIcon(mavenHtml, "maven", "maven");
    assert.doesNotMatch(mavenHtml, /<!--1-->|<!--2-->/);
  });

  test("copies only the guide images the rendered content references", async (t) => {
    const root = await temporaryDirectory(t, "micronaut-web-guides-assets-");
    const guidesDirectory = path.join(root, "micronaut-guides");
    const outputDirectory = path.join(root, "generated-guides");
    const slug = "micronaut-http-client";
    const guideDirectory = await writeGuideFixture(
      guidesDirectory,
      slug,
      "HTTP Client",
    );
    await writeTextFile(
      path.join(guideDirectory, "images", "used.png"),
      "used",
    );
    await writeTextFile(
      path.join(guideDirectory, "images", "unreferenced-large.png"),
      "unreferenced",
    );
    await fs.appendFile(
      path.join(guideDirectory, `${slug}.adoc`),
      "\nimage::images/used.png[]\n",
    );

    await runRenderGuides(guidesDirectory, outputDirectory);

    await fs.stat(
      path.join(outputDirectory, "assets", slug, "images", "used.png"),
    );
    await assert.rejects(
      fs.stat(
        path.join(
          outputDirectory,
          "assets",
          slug,
          "images",
          "unreferenced-large.png",
        ),
      ),
      { code: "ENOENT" },
    );
  });

  test("renders every guide in strict mode with --all", async (t) => {
    const root = await temporaryDirectory(t, "micronaut-web-guides-all-");
    const guidesDirectory = path.join(root, "micronaut-guides");
    const outputDirectory = path.join(root, "generated-guides");
    await writeGuideFixture(
      guidesDirectory,
      "micronaut-http-client",
      "HTTP Client",
    );
    await writeGuideFixture(
      guidesDirectory,
      "not-default-guide",
      "Other Guide",
    );

    await runRenderGuides(guidesDirectory, outputDirectory, ["--all"], {
      strict: true,
    });

    const manifest = JSON.parse(
      await fs.readFile(path.join(outputDirectory, "manifest.json"), "utf8"),
    );
    assert.deepEqual(
      manifest.guides.map((guide: { slug: string }) => guide.slug).sort(),
      ["micronaut-http-client", "not-default-guide"],
    );
  });

  test("synthesizes the GraalPy Maven plugin resource from guide features", async (t) => {
    const root = await temporaryDirectory(t, "micronaut-web-guides-graalpy-");
    const guidesDirectory = path.join(root, "micronaut-guides");
    const outputDirectory = path.join(root, "generated-guides");
    const slug = "micronaut-graalpy-python-package";
    const guideDirectory = await writeGuideMetadata(guidesDirectory, slug, {
      title: "GraalPy Python package",
      categories: ["GraalPy"],
      buildTools: ["maven"],
      apps: [
        {
          name: "default",
          features: ["graalpy"],
          invisibleFeatures: ["graalpy-pygal"],
        },
      ],
    });
    await writeCommonLicense(guidesDirectory);
    await writeTextFile(path.join(guideDirectory, `${slug}.adoc`), [
      "Create a controller:",
      "source:PygalController[]",
      "<.> Controller callout.",
      "",
      "resource:../../../pom.xml[tag=graalpy-maven-plugin]",
    ]);
    await writeTextFile(
      path.join(
        guideDirectory,
        "java/src/main/java/example/micronaut/PygalController.java",
      ),
      ["package example.micronaut;", "", "class PygalController { // <1>", "}"],
    );

    await runRenderGuides(guidesDirectory, outputDirectory, ["--slugs", slug], {
      strict: true,
    });

    const cards = snippetCards(
      await fs.readFile(
        path.join(outputDirectory, "fragments", `${slug}-maven-java.html`),
        "utf8",
      ),
    );
    assert.deepEqual(
      cards.map((card) => card.title),
      ["java/src/main/java/example/micronaut/PygalController.java", "pom.xml"],
    );
    assert.deepEqual(cards[0].callouts, [
      { number: "1", text: "Controller callout." },
    ]);
    assert.match(cards[1].activeCode, /graalpy-maven-plugin/);
    assert.match(cards[1].activeCode, /<package>pygal==3\.0\.4<\/package>/);
  });

  test("fails in strict mode when Asciidoctor reports a fatal diagnostic", async (t) => {
    const root = await temporaryDirectory(t, "micronaut-web-guides-strict-");
    const guidesDirectory = path.join(root, "micronaut-guides");
    const outputDirectory = path.join(root, "generated-guides");
    const guideDirectory = await writeGuideMetadata(
      guidesDirectory,
      "broken-guide",
      {
        title: "Broken Guide",
      },
    );
    await writeTextFile(
      path.join(guideDirectory, "broken-guide.adoc"),
      "include::definitely-missing.adoc[]",
    );

    await assert.rejects(
      runRenderGuides(
        guidesDirectory,
        outputDirectory,
        ["--slugs", "broken-guide"],
        {
          strict: true,
        },
      ),
      (error: { stdout?: string; stderr?: string }) => {
        const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
        assert.match(output, /Asciidoctor diagnostics/);
        assert.match(
          output,
          /include file not found|include file not readable/i,
        );
        return true;
      },
    );
  });
});

test("a guide offers no Maven and Kotlin variant, which the guides build refuses to generate", async (t) => {
  const root = await temporaryDirectory(t, "micronaut-web-guides-");
  const guidesDirectory = path.join(root, "micronaut-guides");
  await writeGuideMetadata(guidesDirectory, "polyglot-guide", {
    title: "Polyglot",
    languages: ["java", "kotlin", "groovy"],
    buildTools: ["gradle", "maven"],
  });

  const [guide] = await readGuides(guidesDirectory);
  assert.deepEqual(
    guideOptions(guide).map((option) => option.id),
    [
      "polyglot-guide-gradle-java",
      "polyglot-guide-gradle-kotlin",
      "polyglot-guide-gradle-groovy",
      "polyglot-guide-maven-java",
      "polyglot-guide-maven-groovy",
    ],
  );
});
