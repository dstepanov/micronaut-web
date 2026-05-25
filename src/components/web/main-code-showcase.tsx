"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsCodeSnippet, type CodeSnippetExample, type CodeSnippetLanguage } from "@/components/web/docs-code-snippet";
import { docsSnippetStyles } from "@/components/web/docs-snippet-styles";

type MainCodeShowcaseProps = {
  examples: CodeSnippetExample[];
  variant?: "default" | "runtime";
};

const terminalOutputs: Record<string, { command: string; lines: string[] }> = {
  server: {
    command: "./gradlew run",
    lines: [
      "Micronaut application starting on port 8080",
      "Generated bean definition: HelloController",
      "Startup completed in 642ms"
    ]
  },
  client: {
    command: "curl http://localhost:8080/hello",
    lines: [
      "{ \"message\": \"Hello World\" }",
      "HTTP client route resolved from compile-time metadata"
    ]
  },
  testing: {
    command: "./gradlew test --tests HelloControllerTest",
    lines: [
      "HelloControllerTest > returnsMessage() PASSED",
      "1 test completed, 1 passed"
    ]
  },
  launch: {
    command: "mn create-app example.micronaut.hello-world",
    lines: [
      "Application created at example.micronaut.hello-world",
      "Features: http-client, graalvm"
    ]
  }
};

export function MainCodeShowcase({ examples, variant = "default" }: MainCodeShowcaseProps) {
  const [activeLanguages, setActiveLanguages] = useState<Record<string, CodeSnippetLanguage>>({});
  const [activeExampleId, setActiveExampleId] = useState(examples[0]?.id ?? "");

  if (!examples.length) {
    return null;
  }

  if (variant !== "runtime") {
    return (
      <Tabs defaultValue="server" className="main-code-showcase min-w-0 gap-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit sm:justify-center sm:overflow-visible">
          {examples.map((example) => (
            <TabsTrigger
              key={example.id}
              value={example.id}
              className="min-h-10 px-3 text-[0.86rem] data-[state=active]:border data-[state=active]:border-brand/35 data-[state=active]:bg-card data-[state=active]:text-foreground sm:px-4 sm:text-sm"
            >
              {example.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {examples.map((example) => {
          const activeLanguage = activeLanguages[example.id] || example.variants[0]?.language || "text";

          return (
            <TabsContent key={example.id} value={example.id} className="mt-0">
              <div className="grid gap-2">
                <div className={docsSnippetStyles.externalTitle}>{example.title}</div>
                <DocsCodeSnippet
                  example={example}
                  activeLanguage={activeLanguage}
                  className="m-0"
                  onLanguageChange={(language) =>
                    setActiveLanguages((current) => ({
                      ...current,
                      [example.id]: language
                    }))
                  }
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    );
  }

  const activeExample = examples.find((example) => example.id === activeExampleId) || examples[0];
  const activeLanguage = activeLanguages[activeExample.id] || activeExample.variants[0]?.language || "text";
  const activeVariant = activeExample.variants.find((variant) => variant.language === activeLanguage) || activeExample.variants[0];
  const terminalOutput = terminalOutputs[activeExample.id] || terminalOutputs.server;

  return (
    <div className="main-code-showcase main-code-showcase-runtime min-w-0 overflow-hidden rounded-card border border-mn-border bg-mn-surface text-mn-text shadow-console">
      <div className="flex min-h-11 items-center gap-3 border-b border-mn-border bg-mn-surface-raised px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-mn-red" />
          <span className="size-2.5 rounded-full bg-mn-cyan" />
          <span className="size-2.5 rounded-full bg-mn-green" />
        </div>
        <div className="min-w-0 flex-1 truncate font-mono text-xs text-mn-muted">
          {activeVariant?.fileName || "src/main/java/example/Application.java"}
        </div>
        <span className="hidden rounded-full border border-mn-border bg-mn-bg/70 px-2.5 py-1 font-mono text-[0.68rem] text-mn-muted sm:inline-flex">
          runtime console
        </span>
      </div>
      <Tabs value={activeExample.id} onValueChange={setActiveExampleId} className="gap-0">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-mn-border bg-mn-bg/70 px-3 py-2 sm:overflow-visible">
          {examples.map((example) => (
            <TabsTrigger
              key={example.id}
              value={example.id}
              className="min-h-9 flex-none rounded-md px-3 text-[0.82rem] text-mn-muted data-[state=active]:border data-[state=active]:border-mn-border data-[state=active]:bg-mn-surface-raised data-[state=active]:text-mn-text data-[state=active]:shadow-none sm:px-4 sm:text-sm"
            >
              {example.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {examples.map((example) => {
          const exampleLanguage = activeLanguages[example.id] || example.variants[0]?.language || "text";

          return (
            <TabsContent key={example.id} value={example.id} className="mt-0">
              <div className="grid gap-0">
                <div className="grid gap-1 border-b border-mn-border bg-mn-surface-raised px-4 py-3">
                  <div className={`${docsSnippetStyles.externalTitle} m-0 text-[0.92rem] leading-5 text-mn-text`}>{example.title}</div>
                  <p className="text-sm leading-6 text-mn-muted">{example.description}</p>
                </div>
                <DocsCodeSnippet
                  example={example}
                  activeLanguage={exampleLanguage}
                  className="m-0 rounded-none border-0 shadow-none"
                  onLanguageChange={(language) =>
                    setActiveLanguages((current) => ({
                      ...current,
                      [example.id]: language
                    }))
                  }
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
      <div className="border-t border-mn-border bg-slate-950 px-4 py-3 font-mono text-xs text-slate-100">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400">
          <span className="text-mn-green">$</span>
          <span>{terminalOutput.command}</span>
        </div>
        <div className="mt-2 grid gap-1">
          {terminalOutput.lines.map((line) => (
            <div key={line} className="text-slate-300">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
