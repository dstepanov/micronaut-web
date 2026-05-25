"use client";

import { useRef, useState } from "react";
import { Braces, Check, Copy, FlaskConical, Network, Terminal } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DocsCodeSnippet,
  ShikiCodeBlock,
  type CodeSnippetExample,
  type CodeSnippetLanguage,
  type CodeSnippetVariant
} from "@/components/web/docs-code-snippet";
import { docsSnippetStyles } from "@/components/web/docs-snippet-styles";
import { cn } from "@/lib/utils";

type MainCodeShowcaseProps = {
  examples: CodeSnippetExample[];
  variant?: "default" | "runtime";
};

type RuntimeWorkflowMeta = {
  tabLabel: string;
  detail: string;
  fileStem?: string;
  icon: typeof Braces;
};

const runtimeWorkflowMeta: Record<string, RuntimeWorkflowMeta> = {
  server: {
    detail: "HTTP route",
    fileStem: "HelloController",
    icon: Braces,
    tabLabel: "Controller"
  },
  client: {
    detail: "Declarative HTTP client",
    fileStem: "HelloClient",
    icon: Network,
    tabLabel: "Client"
  },
  testing: {
    detail: "Context test",
    fileStem: "HelloControllerTest",
    icon: FlaskConical,
    tabLabel: "Test"
  },
  launch: {
    detail: "Project generator",
    icon: Terminal,
    tabLabel: "Launch"
  }
};

const languageExtensions: Partial<Record<CodeSnippetLanguage, string>> = {
  bash: "sh",
  gradle: "gradle",
  groovy: "groovy",
  java: "java",
  kotlin: "kt",
  maven: "xml"
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

function getRuntimeWorkflowMeta(example: CodeSnippetExample) {
  return runtimeWorkflowMeta[example.id] || {
    detail: example.label,
    fileStem: example.title.replace(/\W+/g, ""),
    icon: Braces,
    tabLabel: example.label
  };
}

function getRuntimeFileName(example: CodeSnippetExample, variant: CodeSnippetVariant | undefined) {
  if (!variant) {
    return "editor";
  }

  if (example.id === "launch") {
    return "create-app.sh";
  }

  if (example.id === "testing" && variant.language === "groovy") {
    return "HelloControllerSpec.groovy";
  }

  const meta = getRuntimeWorkflowMeta(example);
  const extension = languageExtensions[variant.language] || variant.language;
  return `${meta.fileStem || variant.fileName}.${extension}`;
}

export function MainCodeShowcase({ examples, variant = "default" }: MainCodeShowcaseProps) {
  const languageTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeLanguages, setActiveLanguages] = useState<Record<string, CodeSnippetLanguage>>({});
  const [activeExampleId, setActiveExampleId] = useState(examples[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

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
  const activeFileName = getRuntimeFileName(activeExample, activeVariant);
  const activeWorkflowMeta = getRuntimeWorkflowMeta(activeExample);

  function setRuntimeExampleId(exampleId: string) {
    setActiveExampleId(exampleId);
    setCopied(false);
  }

  function setRuntimeLanguage(language: CodeSnippetLanguage) {
    setActiveLanguages((current) => ({
      ...current,
      [activeExample.id]: language
    }));
    setCopied(false);
  }

  function focusRuntimeLanguage(index: number) {
    window.requestAnimationFrame(() => languageTabRefs.current[index]?.focus());
  }

  async function copyRuntimeSnippet() {
    if (!activeVariant) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activeVariant.code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = activeVariant.code;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="main-code-showcase main-code-showcase-runtime min-w-0 overflow-hidden rounded-card border border-mn-border bg-mn-surface text-mn-text shadow-console">
      <div className="flex min-h-11 items-center gap-3 border-b border-mn-border bg-mn-surface-raised px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-mn-red" />
          <span className="size-2.5 rounded-full bg-mn-cyan" />
          <span className="size-2.5 rounded-full bg-mn-green" />
        </div>
        <div className="min-w-0 flex-1 truncate font-mono text-xs text-mn-muted">
          {activeFileName}
        </div>
        <span className="hidden rounded-full border border-mn-border bg-mn-bg/70 px-2.5 py-1 font-mono text-[0.68rem] text-mn-muted sm:inline-flex">
          runtime console
        </span>
      </div>
      <Tabs value={activeExample.id} onValueChange={setRuntimeExampleId} className="gap-0">
        <TabsList
          aria-label="IDE workflow files"
          className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-mn-border bg-mn-bg/70 px-2 pt-2 pb-0 sm:overflow-visible"
        >
          {examples.map((example) => {
            const exampleWorkflowMeta = getRuntimeWorkflowMeta(example);
            const exampleLanguage = activeLanguages[example.id] || example.variants[0]?.language || "text";
            const exampleVariant = example.variants.find((candidate) => candidate.language === exampleLanguage) || example.variants[0];
            const Icon = exampleWorkflowMeta.icon;

            return (
              <TabsTrigger
                key={example.id}
                value={example.id}
                className="group min-h-12 flex-none rounded-b-none rounded-t-lg border border-transparent px-3 py-2 text-left text-mn-muted data-[state=active]:border-mn-border data-[state=active]:border-b-mn-surface data-[state=active]:bg-mn-surface data-[state=active]:text-mn-text data-[state=active]:shadow-none sm:px-4"
              >
                <Icon className="size-3.5 text-mn-cyan group-data-[state=active]:text-mn-red" />
                <span className="grid min-w-0 gap-0.5">
                  <span className="text-[0.8rem] leading-none font-semibold sm:text-[0.86rem]">
                    {exampleWorkflowMeta.tabLabel}
                  </span>
                  <span className="hidden max-w-36 truncate font-mono text-[0.68rem] leading-none text-mn-muted xl:block">
                    {getRuntimeFileName(example, exampleVariant)}
                  </span>
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {examples.map((example) => {
          const exampleLanguage = activeLanguages[example.id] || example.variants[0]?.language || "text";
          const exampleActiveVariant = example.variants.find((candidate) => candidate.language === exampleLanguage) || example.variants[0];
          const exampleWorkflowMeta = getRuntimeWorkflowMeta(example);
          const isActiveExample = activeExample.id === example.id;

          return (
            <TabsContent key={example.id} value={example.id} className="mt-0">
              <div className="grid gap-0">
                <div className="grid gap-1 border-b border-mn-border bg-mn-surface-raised px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-mn-border bg-mn-bg/70 px-2 py-1 font-mono text-[0.68rem] leading-none text-mn-cyan">
                      {exampleWorkflowMeta.detail}
                    </span>
                    <div className={`${docsSnippetStyles.externalTitle} m-0 text-[0.92rem] leading-5 text-mn-text`}>{example.title}</div>
                  </div>
                  <p className="text-sm leading-6 text-mn-muted">{example.description}</p>
                </div>
                <div className="flex min-h-10 flex-wrap items-center gap-2 border-b border-mn-border bg-mn-bg px-4 py-2">
                  {example.variants.length > 1 ? (
                    <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label={`${example.label} language`}>
                      {example.variants.map((candidate, index) => {
                        const selected = candidate.language === exampleLanguage;

                        return (
                          <button
                            key={candidate.language}
                            ref={(node) => {
                              if (isActiveExample) {
                                languageTabRefs.current[index] = node;
                              }
                            }}
                            type="button"
                            role="tab"
                            aria-controls={`${example.id}-${candidate.language}-runtime-panel`}
                            aria-selected={selected}
                            className={cn(
                              "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[0.72rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-mn-cyan/45",
                              selected
                                ? "border-mn-border bg-mn-surface-raised text-mn-text"
                                : "border-transparent text-mn-muted hover:border-mn-border hover:bg-mn-surface-raised hover:text-mn-text"
                            )}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => setRuntimeLanguage(candidate.language)}
                            onKeyDown={(event) => {
                              if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                                return;
                              }

                              event.preventDefault();
                              const offset = event.key === "ArrowRight" ? 1 : -1;
                              const nextIndex = (index + offset + example.variants.length) % example.variants.length;
                              setRuntimeLanguage(example.variants[nextIndex]?.language || candidate.language);
                              focusRuntimeLanguage(nextIndex);
                            }}
                          >
                            {candidate.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="inline-flex h-7 items-center rounded-md border border-mn-border bg-mn-surface-raised px-2.5 font-mono text-[0.72rem] font-semibold text-mn-text">
                      {exampleActiveVariant?.label || "Snippet"}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate font-mono text-[0.72rem] text-mn-muted">
                    {getRuntimeFileName(example, exampleActiveVariant)}
                  </span>
                  <button
                    type="button"
                    aria-label={copied ? "Copied" : `Copy ${getRuntimeFileName(example, exampleActiveVariant)}`}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-mn-muted transition-colors hover:bg-mn-surface-raised hover:text-mn-text focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-mn-cyan/45"
                    onClick={copyRuntimeSnippet}
                  >
                    {copied ? <Check className="size-3.5 text-mn-green" /> : <Copy className="size-3.5" />}
                    <span className="sr-only" aria-live="polite">
                      {copied ? "Copied" : "Copy code"}
                    </span>
                  </button>
                </div>
                {exampleActiveVariant ? (
                  <div
                    id={`${example.id}-${exampleActiveVariant.language}-runtime-panel`}
                    role="tabpanel"
                    aria-label={`${example.label} ${exampleActiveVariant.label} code`}
                    className={docsSnippetStyles.panel}
                  >
                    <ShikiCodeBlock
                      code={exampleActiveVariant.code}
                      highlightedHtml={exampleActiveVariant.highlightedHtml}
                      language={exampleActiveVariant.language}
                    />
                  </div>
                ) : null}
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
