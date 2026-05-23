# Generated Docs Fragments

The HTML files in this directory are rendered directly from the checked-out
Micronaut Platform Docs adoc sources with Asciidoctor.js:

```bash
npm run render:platform-docs -- --slugs core,serde
```

By default the renderer reads `/Users/denisstepanov/micronaut-platform-docs`,
uses `gradle/platform-doc-projects.properties` and each project's
`src/main/docs/guide/toc.yml`, and writes fragments back into this directory.
Do not hand-edit the generated HTML files.
