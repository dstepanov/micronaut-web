import type { CodeSnippetVariant } from "@/components/web/docs-code-snippet";

export const componentCodeVariants = [
  {
    language: "java",
    label: "Java",
    fileName: "HelloController.java",
    code: `import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;

@Controller("/hello") // <1>
class HelloController {

    @Get // <2>
    String index() {
        return "Hello World"; // <3>
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
    fun index(): String {
        return "Hello World"
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
    String index() {
        'Hello World'
    }
}`
  }
] satisfies CodeSnippetVariant[];

export const componentTerminalVariants = [
  {
    language: "bash",
    label: "Bash",
    fileName: "mn create-app",
    code: `mn create-app example.micronaut.hello-world \\
  --features=http-client,graalvm \\
  --build=gradle \\
  --lang=java`
  }
] satisfies CodeSnippetVariant[];

export const dependencyVariants = [
  {
    language: "gradle",
    label: "Gradle",
    fileName: "build.gradle",
    code: `implementation("io.micronaut:micronaut-http-client")`
  },
  {
    language: "maven",
    label: "Maven",
    fileName: "pom.xml",
    code: `<dependency>
    <groupId>io.micronaut</groupId>
    <artifactId>micronaut-http-client</artifactId>
</dependency>`
  }
] satisfies CodeSnippetVariant[];
