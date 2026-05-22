"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsCodeSnippet, type CodeSnippetExample, type CodeSnippetLanguage } from "@/components/web/docs-code-snippet";

const examples: CodeSnippetExample[] = [
  {
    id: "server",
    label: "HTTP server",
    title: "Non-Blocking HTTP Server Based on Netty",
    description: "Create an endpoint with familiar annotations and a compact controller.",
    variants: [
      {
        language: "java",
        label: "Java",
        fileName: "HelloController.java",
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
        language: "kotlin",
        label: "Kotlin",
        fileName: "HelloController.kt",
        code: `import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get

@Controller("/hello")
class HelloController {

    @Get
    fun index(): Map<String, String> {
        return mapOf("message" to "Hello World")
    }
}`
      },
      {
        language: "groovy",
        label: "Groovy",
        fileName: "HelloController.groovy",
        code: `import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get

@Controller('/hello')
class HelloController {

    @Get
    Map<String, String> index() {
        [message: 'Hello World']
    }
}`
      }
    ]
  },
  {
    id: "client",
    label: "Declarative client",
    title: "Declarative, Reactive, Compile-Time HTTP Client",
    description: "Generate a declarative HTTP client from the same application contract.",
    variants: [
      {
        language: "java",
        label: "Java",
        fileName: "HelloClient.java",
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
        language: "kotlin",
        label: "Kotlin",
        fileName: "HelloClient.kt",
        code: `import io.micronaut.http.annotation.Get
import io.micronaut.http.client.annotation.Client

@Client("/hello")
interface HelloClient {

    @Get
    fun index(): Map<String, String>
}`
      },
      {
        language: "groovy",
        label: "Groovy",
        fileName: "HelloClient.groovy",
        code: `import io.micronaut.http.annotation.Get
import io.micronaut.http.client.annotation.Client

@Client('/hello')
interface HelloClient {

    @Get
    Map<String, String> index()
}`
      }
    ]
  },
  {
    id: "testing",
    label: "Test",
    title: "Fast and Easy Testing",
    description: "Run framework-integrated tests with dependency injection support.",
    variants: [
      {
        language: "java",
        label: "Java",
        fileName: "HelloControllerTest.java",
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
        language: "kotlin",
        label: "Kotlin",
        fileName: "HelloControllerTest.kt",
        code: `import io.micronaut.test.extensions.junit5.annotation.MicronautTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

@MicronautTest
class HelloControllerTest {

    @Inject
    lateinit var client: HelloClient

    @Test
    fun returnsMessage() {
        assertEquals("Hello World", client.index()["message"])
    }
}`
      },
      {
        language: "groovy",
        label: "Groovy",
        fileName: "HelloControllerSpec.groovy",
        code: `import io.micronaut.test.extensions.spock.annotation.MicronautTest
import jakarta.inject.Inject
import spock.lang.Specification

@MicronautTest
class HelloControllerSpec extends Specification {

    @Inject
    HelloClient client

    void 'returns message'() {
        expect:
        client.index().message == 'Hello World'
    }
}`
      }
    ]
  },
  {
    id: "launch",
    label: "Launch command",
    title: "Create a Micronaut Application",
    description: "Start a project with the features and JVM language you need.",
    variants: [
      {
        language: "bash",
        label: "Bash",
        fileName: "mn create-app",
        code: `mn create-app example.micronaut.hello-world \\
  --features=http-client,graalvm \\
  --build=gradle \\
  --lang=java`
      }
    ]
  }
];

export function MainCodeShowcase() {
  const [activeLanguages, setActiveLanguages] = useState<Record<string, CodeSnippetLanguage>>({});

  return (
    <Tabs defaultValue="server" className="main-code-showcase gap-4">
      <div className="overflow-x-auto pb-1">
        <TabsList className="h-auto min-w-max bg-muted p-1.5">
          {examples.map((example) => (
            <TabsTrigger
              key={example.id}
              value={example.id}
              className="min-h-10 px-3 text-[0.86rem] data-[state=active]:border data-[state=active]:border-primary/35 data-[state=active]:bg-card data-[state=active]:text-foreground sm:px-4 sm:text-sm"
            >
              {example.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {examples.map((example) => {
        const activeLanguage = activeLanguages[example.id] || example.variants[0]?.language || "text";
        const activeVariant = example.variants.find((variant) => variant.language === activeLanguage) || example.variants[0];

        return (
          <TabsContent key={example.id} value={example.id} className="mt-0">
            <div className="grid gap-3">
              {activeVariant ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-primary">{activeVariant.fileName}</p>
                  <h3 className="mt-1 text-base font-semibold leading-6 text-foreground">{example.title}</h3>
                  <p className="mt-1 max-w-[34rem] text-sm leading-6 text-muted-foreground">{example.description}</p>
                </div>
              ) : null}
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
