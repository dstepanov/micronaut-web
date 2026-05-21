"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const examples = [
  {
    id: "server",
    label: "HTTP server",
    title: "Non-Blocking HTTP Server Based on Netty",
    description: "Create an endpoint with familiar annotations and a compact controller.",
    language: "Java",
    code: `import io.micronaut.http.annotation.*;

import java.util.Collections;
import java.util.Map;

@Controller("/hello")
class HelloController {

    @Get
    Map<String, String> index() {
        return Collections.singletonMap("message", "Hello World");
    }
}`
  },
  {
    id: "client",
    label: "Declarative client",
    title: "Declarative, Reactive, Compile-Time HTTP Client",
    description: "Generate a declarative HTTP client from the same application contract.",
    language: "Java",
    code: `import io.micronaut.http.annotation.Get;
import io.micronaut.http.client.annotation.Client;

import java.util.Map;

@Client("/hello")
interface HelloClient {

    @Get
    Map<String, String> index();
}`
  },
  {
    id: "testing",
    label: "Test",
    title: "Fast and Easy Testing",
    description: "Run framework-integrated tests with dependency injection support.",
    language: "Java",
    code: `import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

@MicronautTest
class HelloControllerTest {

    @Inject
    HelloClient client;

    @Test
    void returnsMessage() {
        assertEquals("Hello World", client.index().get("message"));
    }
}`
  },
  {
    id: "launch",
    label: "Launch command",
    title: "Create a Micronaut Application",
    description: "Start a project with the features you need.",
    language: "Shell",
    code: `mn create-app example.micronaut.hello-world \\
  --features=http-client,graalvm \\
  --build=gradle \\
  --lang=java
`
  }
];

function HighlightedCode({ code }: { code: string }) {
  return (
    <>
      {code.split("\n").map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`} className="block min-h-5">
          {line.split(/(@\w+|".*?"|--[\w-]+|\b(?:class|interface|import|public|static|void|return|new|Map|String|Collections|mn|cd)\b)/g).map((part, partIndex) => {
            if (part.startsWith("@")) {
              return <span key={partIndex} className="text-[#8ee6c9]">{part}</span>;
            }
            if (part.startsWith("--")) {
              return <span key={partIndex} className="text-[#8ee6c9]">{part}</span>;
            }
            if (part.startsWith("\"")) {
              return <span key={partIndex} className="text-[#ffd180]">{part}</span>;
            }
            if (/^(class|interface|import|public|static|void|return|new|mn|cd)$/.test(part)) {
              return <span key={partIndex} className="text-[#9ecbff]">{part}</span>;
            }
            if (/^(Map|String|Collections)$/.test(part)) {
              return <span key={partIndex} className="text-[#c5a5ff]">{part}</span>;
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </span>
      ))}
    </>
  );
}

export function MainCodeShowcase() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyExample(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(id);
    window.setTimeout(() => setCopied((current) => current === id ? null : current), 1600);
  }

  return (
    <Tabs defaultValue="server" className="gap-4">
      <div className="overflow-x-auto pb-1">
        <TabsList className="h-auto min-w-max bg-muted p-1.5">
        {examples.map((example) => (
          <TabsTrigger
            key={example.id}
            value={example.id}
            className="min-h-9 px-3 text-[0.82rem] data-[state=active]:border data-[state=active]:border-primary/35 data-[state=active]:bg-card data-[state=active]:text-foreground sm:px-4 sm:text-[0.86rem]"
          >
            {example.label}
          </TabsTrigger>
        ))}
        </TabsList>
      </div>
      {examples.map((example) => (
        <TabsContent key={example.id} value={example.id} className="mt-0">
          <div className="overflow-hidden rounded-xl border border-[#32404a] bg-[#151a20] text-white shadow-sm shadow-black/10">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[0.88rem] font-semibold leading-5">{example.title}</p>
                <p className="mt-1 text-sm leading-6 text-white/70">{example.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/10 px-2 py-1 text-[11px] text-white/70">{example.language}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-w-10 text-white hover:bg-white/10 hover:text-white sm:min-w-24"
                  aria-label={`Copy ${example.label} example`}
                  aria-live="polite"
                  onClick={() => copyExample(example.id, example.code)}
                >
                  {copied === example.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                  <span className="hidden sm:inline">{copied === example.id ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>
            <pre className="max-h-[460px] min-h-[380px] overflow-auto p-5 text-[12.5px] leading-[1.75] text-[#d8dee9] sm:p-6 sm:text-[13px]">
              <code><HighlightedCode code={example.code} /></code>
            </pre>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
