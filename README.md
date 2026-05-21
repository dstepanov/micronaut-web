# Micronaut Web

Astro prototype for three separately hostable Micronaut web surfaces:

- `main`: product entry point at `/` and `/main/`
- `docs`: platform documentation catalog and detail pages under `/docs/`
- `guides`: guides catalog and detail pages under `/guides/`

All surfaces share the same protocol file, design tokens, and React components. The protocol is checked in as a static contract for the prototype:

```bash
npm run dev
npm run build
```

`npm run protocol` validates the checked-in protocol file without reading sibling repositories.
`npm run sync:platform-projects` refreshes the test fixture at `src/data/platform-docs-projects.fixture.json` from the local Micronaut Platform Docs metadata checkout.
`npm run build` also prepares plain HTML template artifacts under `dist/micronaut-web` for Java consumers.

## Protocol

`src/data/protocol.json` contains:

- `surfaces`: deployment entries for `main`, `docs`, and `guides`
- `docs.categories`: platform documentation category groups
- `docs.projects`: all platform documentation projects with links, descriptions, references, sections, and search terms
- `guides.categories`: guide category groups discovered from guide metadata
- `guides.guides`: all guides with tags, variants, authors, dates, and searchable metadata

`src/data/protocol.schema.json` documents the expected contract for future Gradle or CI generators.

## Java Artifacts

Gradle packages the static docs and guides surfaces as independent classpath jars:

```bash
./gradlew -q :micronaut-web-docs:jar :micronaut-web-guides:jar
```

The packaging tasks run `npm run build` first, then include:

- `META-INF/micronaut-web/templates/*`: plain HTML templates with `{{placeholder}}` slots
- `META-INF/micronaut-web/assets-manifest.json`: template and asset metadata for the packaged surface
- `META-INF/micronaut-web/surfaces/docs/**`: rendered docs pages and shared assets in the docs jar
- `META-INF/micronaut-web/surfaces/guides/**`: rendered guides pages and shared assets in the guides jar

Consumer projects do not need Node, Astro, React, or Tailwind. They can load a packaged template from the classpath, build generated docs/guides body HTML, sidebar HTML, content submenu HTML, and search JSON, then replace the template placeholders. The optional `micronaut-web-template` module provides `HtmlTemplateRenderer` for exact `{{name}}` replacement and unresolved-placeholder checks.

Required placeholders are:

- `{{pageTitle}}`, `{{pageDescription}}`, `{{assetBasePath}}`
- `{{headAssetsHtml}}`, `{{themeScriptHtml}}`, `{{bodyScriptsHtml}}`
- `{{topNavigationHtml}}`, `{{contentHtml}}`, `{{searchIndexJson}}`
- docs templates additionally use `{{sidebarHtml}}`
- detail-page templates additionally use `{{contentSubmenuHtml}}`

The expected consumer flow is:

1. Generate the docs or guides content body as HTML.
2. Generate navigation fragments separately: top navigation, docs sidebar when applicable, and the right-side content submenu for detail pages.
3. Generate the search index as JSON.
4. Render one classpath template with exact placeholder values.

```java
String html = HtmlTemplateRenderer.renderResource(
    "META-INF/micronaut-web/templates/docs-page.html",
    Map.of(
        "pageTitle", HtmlTemplateRenderer.escapeHtml(title),
        "pageDescription", HtmlTemplateRenderer.escapeHtml(description),
        "assetBasePath", "/docs-assets",
        "headAssetsHtml", headAssetsHtml,
        "themeScriptHtml", themeScriptHtml,
        "sidebarHtml", sidebarHtml,
        "topNavigationHtml", topNavigationHtml,
        "contentHtml", generatedDocumentHtml,
        "contentSubmenuHtml", generatedSectionMenuHtml,
        "searchIndexJson", searchIndexJson,
        "bodyScriptsHtml", bodyScriptsHtml
    )
);
```

## Shared Assets

`public/micronaut-assets` contains the Micronaut logos and project/language icon SVGs copied from `~/dev/micronaut-ui`. The React shell consumes those assets through `MicronautLogo` and `IconGlyph` so the prototype matches the platform docs visual system without inventing replacement marks.
