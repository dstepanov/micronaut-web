import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  type Dependency,
  gradleDependencyLine,
  gradleScope,
  mavenDependencyXml,
  mavenScope,
} from "../../shared/dependency-coordinates.ts";

const base: Dependency = {
  groupId: "io.micronaut",
  artifactId: "micronaut-http-client",
  gradleScope: "implementation",
  mavenScope: "compile",
};

describe("scope mapping", () => {
  test("maps Gradle and Maven vocabulary to Gradle configurations", () => {
    assert.deepEqual(
      Object.fromEntries(
        [
          undefined,
          "compile",
          "provided",
          "runtime",
          "test",
          "testCompile",
          "implementation",
          "runtimeOnly",
          "annotationProcessor",
          "custom",
        ].map((scope) => [String(scope), gradleScope(scope)]),
      ),
      {
        undefined: "implementation",
        compile: "implementation",
        provided: "developmentOnly",
        runtime: "runtimeOnly",
        test: "testImplementation",
        testCompile: "testImplementation",
        implementation: "implementation",
        runtimeOnly: "runtimeOnly",
        annotationProcessor: "annotationProcessor",
        custom: "custom",
      },
    );
  });

  test("routes annotation processors to the language's configuration", () => {
    assert.equal(gradleScope("annotationProcessor", "kotlin"), "kapt");
    assert.equal(gradleScope("annotationProcessor", "groovy"), "compileOnly");
    assert.equal(
      gradleScope("annotationProcessor", "java"),
      "annotationProcessor",
    );
    assert.equal(
      gradleScope("testImplementation", "kotlin"),
      "testImplementation",
    );
  });

  test("maps Gradle vocabulary to Maven scopes", () => {
    assert.deepEqual(
      Object.fromEntries(
        [
          undefined,
          "annotationProcessor",
          "api",
          "compileOnly",
          "developmentOnly",
          "implementation",
          "runtimeOnly",
          "testCompile",
          "testImplementation",
          "testRuntime",
          "testRuntimeOnly",
          "test",
          "provided",
        ].map((scope) => [String(scope), mavenScope(scope)]),
      ),
      {
        undefined: "compile",
        annotationProcessor: "compile",
        api: "compile",
        compileOnly: "provided",
        developmentOnly: "provided",
        implementation: "compile",
        runtimeOnly: "runtime",
        testCompile: "test",
        testImplementation: "test",
        testRuntime: "test",
        testRuntimeOnly: "test",
        test: "test",
        provided: "provided",
      },
    );
  });
});

describe("gradleDependencyLine", () => {
  test("renders coordinates with optional version, classifier, platform and callout", () => {
    assert.equal(
      gradleDependencyLine(base),
      'implementation("io.micronaut:micronaut-http-client")',
    );
    assert.equal(
      gradleDependencyLine({
        ...base,
        version: "4.9.0",
        gradleScope: "runtimeOnly",
      }),
      'runtimeOnly("io.micronaut:micronaut-http-client:4.9.0")',
    );
    assert.equal(
      gradleDependencyLine({
        ...base,
        version: "4.9.0",
        classifier: "linux-x86_64",
      }),
      'implementation("io.micronaut:micronaut-http-client:4.9.0:linux-x86_64")',
    );
    assert.equal(
      gradleDependencyLine({ ...base, classifier: "sources" }),
      'implementation("io.micronaut:micronaut-http-client::sources")',
    );
    assert.equal(
      gradleDependencyLine({
        ...base,
        pom: true,
        version: "4.9.0",
        callout: "2",
      }),
      'implementation platform("io.micronaut:micronaut-http-client:4.9.0") // <2>',
    );
    assert.equal(
      gradleDependencyLine({ ...base, callout: "not a number" }),
      'implementation("io.micronaut:micronaut-http-client")',
    );
  });
});

describe("mavenDependencyXml", () => {
  test("omits the default scope unless asked to print it", () => {
    assert.equal(
      mavenDependencyXml(base),
      [
        "<dependency>",
        "    <groupId>io.micronaut</groupId>",
        "    <artifactId>micronaut-http-client</artifactId>",
        "</dependency>",
      ].join("\n"),
    );
    assert.equal(
      mavenDependencyXml(base, { explicitCompileScope: true }),
      [
        "<dependency>",
        "    <groupId>io.micronaut</groupId>",
        "    <artifactId>micronaut-http-client</artifactId>",
        "    <scope>compile</scope>",
        "</dependency>",
      ].join("\n"),
    );
  });

  test("renders version, scope, classifier and callout", () => {
    assert.equal(
      mavenDependencyXml({
        ...base,
        version: "2.0.9",
        classifier: "linux-x86_64",
        mavenScope: "runtime",
        callout: "1",
      }),
      [
        "<dependency> // <1>",
        "    <groupId>io.micronaut</groupId>",
        "    <artifactId>micronaut-http-client</artifactId>",
        "    <version>2.0.9</version>",
        "    <scope>runtime</scope>",
        "    <classifier>linux-x86_64</classifier>",
        "</dependency>",
      ].join("\n"),
    );
  });

  test("renders a BOM as a dependencyManagement import", () => {
    assert.equal(
      mavenDependencyXml({
        ...base,
        artifactId: "micronaut-bom",
        groupId: "io.micronaut.platform",
        pom: true,
        version: "4.9.0",
      }),
      [
        "<!-- Add the following to your dependencyManagement element -->",
        "<dependency>",
        "    <groupId>io.micronaut.platform</groupId>",
        "    <artifactId>micronaut-bom</artifactId>",
        "    <version>4.9.0</version>",
        "    <type>pom</type>",
        "    <scope>import</scope>",
        "</dependency>",
        "",
      ].join("\n"),
    );
  });

  test("renders annotation processors as paths, wrapped or with a hint", () => {
    const processor: Dependency = {
      ...base,
      artifactId: "micronaut-inject-java",
      gradleScope: "annotationProcessor",
      versionProperty: "${micronaut.version}",
    };

    assert.equal(
      mavenDependencyXml(processor),
      [
        "<!-- Add the following to your annotationProcessorPaths element -->",
        "<path>",
        "    <groupId>io.micronaut</groupId>",
        "    <artifactId>micronaut-inject-java</artifactId>",
        "    <version>${micronaut.version}</version>",
        "</path>",
      ].join("\n"),
    );
    assert.equal(
      mavenDependencyXml(
        { ...processor, versionProperty: undefined, classifier: "sources" },
        { wrapAnnotationProcessorPaths: true },
      ),
      [
        "<annotationProcessorPaths>",
        "    <path>",
        "        <groupId>io.micronaut</groupId>",
        "        <artifactId>micronaut-inject-java</artifactId>",
        "        <classifier>sources</classifier>",
        "    </path>",
        "</annotationProcessorPaths>",
      ].join("\n"),
    );
    assert.equal(
      mavenDependencyXml(
        { ...processor, gradleScope: "kapt", version: "4.9.0", callout: "3" },
        { language: "kotlin" },
      ),
      [
        "<!-- Add the following to your annotationProcessorPaths element -->",
        "<annotationProcessorPath> // <3>",
        "    <groupId>io.micronaut</groupId>",
        "    <artifactId>micronaut-inject-java</artifactId>",
        "    <version>4.9.0</version>",
        "</annotationProcessorPath>",
      ].join("\n"),
    );
    assert.match(
      mavenDependencyXml({ ...base, mavenScope: "annotationProcessor" }),
      /^<!-- Add the following to your annotationProcessorPaths element -->\n<path>/,
    );
  });
});
