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
        return Collections.singletonMap("message",
                "Hello World");
    }
}`
  },
  {
    id: "client",
    label: "Declarative client",
    title: "Declarative, Reactive, Compile-Time HTTP Client",
    description: "Declare a type-safe HTTP client and let Micronaut generate the implementation.",
    language: "Java",
    code: `import io.micronaut.http.annotation.Get;
import io.micronaut.http.client.annotation.Client;
import reactor.core.publisher.Mono;

@Client("/hello")
public interface HelloClient {
    @Get
    Mono<String> hello();
}`
  },
  {
    id: "testing",
    label: "Test",
    title: "Fast and Easy Testing",
    description: "Test the controller and client in the same application model.",
    language: "Java",
    code: `import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@MicronautTest
class HelloControllerTest {

    @Test
    void testHelloWorldResponse(HelloClient client) {
        assertEquals("{\\"message\\":\\"Hello World\\"}",
                client.hello().block());
    }

}`
  },
  {
    id: "launch",
    label: "Launch command",
    title: "Create a Micronaut Application",
    description: "Generate a project with the build, language, and features that match your stack.",
    language: "Shell",
    code: `mn create-app example.micronaut.demo \\
  --build=gradle \\
  --lang=java

cd demo
./gradlew run`
  }
];

function HighlightedCode({ code }: { code: string }) {
  return (
    <>
      {code.split("\n").map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`} className="block min-h-5">
          {line.split(/(@\w+|".*?"|--[\w-]+|\b(?:class|interface|import|public|static|void|return|new|Map|String|Mono|Collections|mn|cd)\b)/g).map((part, partIndex) => {
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
            if (/^(Map|String|Mono|Collections)$/.test(part)) {
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
      <TabsList className="grid h-auto w-full grid-cols-2 bg-muted p-1 sm:grid-cols-4">
        {examples.map((example) => (
          <TabsTrigger
            key={example.id}
            value={example.id}
            className="min-h-10 text-wrap px-2 text-xs data-[state=active]:border-primary/30 data-[state=active]:bg-card data-[state=active]:text-foreground sm:text-sm"
          >
            {example.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {examples.map((example) => (
        <TabsContent key={example.id} value={example.id} className="mt-0">
          <div className="overflow-hidden rounded-lg border border-[#26313a] bg-[#151a20] text-white shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{example.title}</p>
                <p className="mt-1 text-xs leading-5 text-white/60">{example.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/10 px-2 py-1 text-[11px] text-white/70">{example.language}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-white hover:bg-white/10 hover:text-white"
                  aria-label={`Copy ${example.label} example`}
                  onClick={() => copyExample(example.id, example.code)}
                >
                  {copied === example.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
            <pre className="max-h-[420px] overflow-auto p-4 text-[12px] leading-[1.7] text-[#d8dee9] sm:text-[13.5px]">
              <code><HighlightedCode code={example.code} /></code>
            </pre>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
