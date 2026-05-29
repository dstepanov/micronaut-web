"use client";

import {
  DocsCodeSnippet,
  type CodeSnippetExample,
  type CodeSnippetVariant,
} from "@/components/web/docs-code-snippet";
import { DocsPropertiesSnippetCard } from "@/components/web/docs-snippet-card";
import {
  componentCodeVariants,
  componentTerminalVariants,
  dependencyVariants,
} from "@/components/web/snippet-test-data";
import { snippetVariantHighlightKey } from "@/lib/snippet-highlight-key";

type SnippetTestGalleryProps = {
  highlightedHtmlByKey?: Record<string, string>;
};

const componentCodeExampleBase: CodeSnippetExample = {
  id: "snippet-test-controller",
  label: "Controller",
  title: "Controller with callout-ready annotations",
  description:
    "Component-rendered Java, Kotlin, and Groovy tabs using the shared snippet card.",
  callouts: [
    <>
      The <code>@Controller</code> annotation defines the class as a controller
      mapped to the path <code>/hello</code>
    </>,
    <>
      The <code>@Get</code> annotation maps the index method to all requests
      that use an HTTP GET
    </>,
    <>
      A String <code>"Hello World"</code> is returned as the response
    </>,
  ],
  variants: componentCodeVariants,
};

const componentTerminalExampleBase: CodeSnippetExample = {
  id: "snippet-test-terminal",
  label: "Terminal",
  title: "Launch command",
  description:
    "Single-language terminal snippets should use the same light shell.",
  variants: componentTerminalVariants,
};

const componentDependencyExampleBase: CodeSnippetExample = {
  id: "snippet-test-dependency",
  label: "Dependency",
  title: "HTTP client dependency",
  description:
    "Gradle and Maven dependency variants rendered through the shared dependency snippet card.",
  variants: dependencyVariants,
};

function exampleWithHighlightedHtml(
  example: CodeSnippetExample,
  highlightedHtmlByKey: Record<string, string> | undefined,
) {
  return {
    ...example,
    variants: variantsWithHighlightedHtml(
      example.id,
      example.variants,
      highlightedHtmlByKey,
    ),
  };
}

function variantsWithHighlightedHtml(
  snippetId: string,
  variants: CodeSnippetVariant[],
  highlightedHtmlByKey: Record<string, string> | undefined,
) {
  return variants.map((variant) => ({
    ...variant,
    highlightedHtml:
      highlightedHtmlByKey?.[
        snippetVariantHighlightKey(snippetId, variant.language)
      ],
  }));
}

export function SnippetTestGallery({
  highlightedHtmlByKey,
}: SnippetTestGalleryProps) {
  const componentCodeExample = exampleWithHighlightedHtml(
    componentCodeExampleBase,
    highlightedHtmlByKey,
  );
  const componentTerminalExample = exampleWithHighlightedHtml(
    componentTerminalExampleBase,
    highlightedHtmlByKey,
  );
  const componentDependencyExample = exampleWithHighlightedHtml(
    componentDependencyExampleBase,
    highlightedHtmlByKey,
  );

  return (
    <div className="grid gap-8">
      <section data-snippet-fixture="component-code" className="grid gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Component code snippet
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Rendered through the shared snippet component.
          </p>
        </div>
        <DocsCodeSnippet example={componentCodeExample} className="m-0" />
      </section>

      <section data-snippet-fixture="component-terminal" className="grid gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Component terminal snippet
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Verifies that shell labels and icons stay readable on the light
            snippet surface.
          </p>
        </div>
        <DocsCodeSnippet example={componentTerminalExample} className="m-0" />
      </section>

      <section
        data-snippet-fixture="component-dependency"
        className="grid gap-3"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Component dependency snippet
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Uses the dependency variant of the shared snippet card.
          </p>
        </div>
        <DocsCodeSnippet
          example={componentDependencyExample}
          kind="dependency"
          title={componentDependencyExample.title}
          description={componentDependencyExample.description}
          className="m-0"
        />
      </section>

      <section
        data-snippet-fixture="component-properties"
        className="grid gap-3"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Component properties snippet
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Verifies the table wrapper used for generated configuration-property
            snippets.
          </p>
        </div>
        <DocsPropertiesSnippetCard
          id="snippet-test-properties"
          anchorId="snippet-test-properties-anchor"
          title="Configuration Properties"
          eyebrow="Configuration properties"
          countLabel="2 properties"
        >
          <table className="tableblock">
            <caption className="sr-only">Configuration Properties</caption>
            <thead>
              <tr>
                <th>Property</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>micronaut.server.port</code>
                </td>
                <td>Server port used by the embedded application.</td>
              </tr>
              <tr>
                <td>
                  <code>micronaut.application.name</code>
                </td>
                <td>Application name exposed to framework integrations.</td>
              </tr>
            </tbody>
          </table>
        </DocsPropertiesSnippetCard>
      </section>
    </div>
  );
}
