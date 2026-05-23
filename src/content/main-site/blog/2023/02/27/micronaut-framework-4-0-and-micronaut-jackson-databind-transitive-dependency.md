---
slug: 2023/02/27/micronaut-framework-4-0-and-micronaut-jackson-databind-transitive-dependency
title: Micronaut Framework 4.0 and Micronaut Jackson Databind transitive dependency
description: Micronaut Framework 4.0, to be released in 2023, will not expose Micronaut Jackson Databind as a transitive dependency. Jackson for Serialization Since version 1.0, Micronaut Framework uses Jackson for serialization. Jackson is a suite of data-processing tools for Java (and the JVM platform), including the flagship streaming JSON parser / generator library, matching data-binding library...
date: '2023-02-27T06:05:43'
modified: '2023-02-27T06:05:43'
sourceUrl: https://micronaut.io/2023/02/27/micronaut-framework-4-0-and-micronaut-jackson-databind-transitive-dependency/
wordpressId: 6121
contentSource: wordpress-post
category: micronaut-4
categories:
  - micronaut-4
tags:
  - micronaut4
href: /2023/02/27/micronaut-framework-4-0-and-micronaut-jackson-databind-transitive-dependency/
---

**Micronaut Framework 4.0, to be released in 2023, will not expose Micronaut Jackson Databind as a transitive dependency.**

## Jackson for Serialization

Since version 1.0, Micronaut Framework uses [Jackson](https://github.com/FasterXML/jackson) for serialization.

> Jackson is a suite of data-processing tools for Java (and the JVM platform), including the flagship streaming JSON parser / generator library, matching data-binding library (POJOs to and from JSON).

Micronaut Framework 3.x dependency `io.micronaut:micronaut-runtime` exposes `io.micronaut:micronaut-jackson-databind` as a transitive dependency. This dependency has a transitive dependency to [`Jackson databind`](https://github.com/FasterXML/jackson-databind).

However, since [Micronaut Framework 3.3.0](https://micronaut.io/2022/01/27/micronaut-framework-3-3-released/), you can use [Micronaut Serialization](https://micronaut-projects.github.io/micronaut-serialization/latest/guide/) as an alternative to Jackson Databind.

## Micronaut Jackson Databind or Micronaut Serialization

With Micronaut Framework 4.0, you must choose which serialization implementation you want. Micronaut runtime no longer exposes `micronaut-jackson-databind` automatically.

### How to use Micronaut Jackson Databind?

To use Micronaut Jackson Databind with Gradle, add the following dependency:

```
dependencies {
    ...
    implementation("io.micronaut:micronaut-jackson-databind")
}
```

Or to your Maven build:

```
    ...
    <dependency>
      <groupId>io.micronaut</groupId>
      <artifactId>micronaut-jackson-databind</artifactId>
      <scope>compile</scope>
    </dependency>
  </dependencies>
```

### How to use Micronaut Serialization?

To use Micronaut Serialization with Gradle, add the following dependency:

```
dependencies {
    ...
    implementation("io.micronaut.serde:micronaut-serde-jackson")
}
```

Or to your Maven build:

```
    ...
    <dependency>
      <groupId>io.micronaut.serde</groupId>
      <artifactId>micronaut-serde-jackson</artifactId>
      <scope>compile</scope>
    </dependency>
  </dependencies>
```

## Jackson Annotations

[Jackson annotations](https://github.com/FasterXML/jackson-annotations), such as `@JsonProperty`, have become an industry standard to decorate Java classes to tweak serialization scenarios.

If you use Jackson annotations, you can continue to do that in Micronaut Framework 4.0 with either implementation. Micronaut Serialization supports most [Jackson Annotations](https://micronaut-projects.github.io/micronaut-serialization/latest/guide/#jacksonAnnotations).

## Steps toward using Micronaut Serialization

Jackson’s default behavior allows any type to be serialized. Micronaut Serialization is locked down by default, and you explicitly define, with the [@Serdeable](https://micronaut-projects.github.io/micronaut-serialization/latest/api/io/micronaut/serde/annotation/Serdeable.html) or [@SerdeImport](https://micronaut-projects.github.io/micronaut-serialization/latest/api/io/micronaut/serde/annotation/SerdeImport.html) annotations, which types are serializable or deserializable.

## Advantages of using Micronaut Serialization

Micronaut Framework continues to support Jackson, an immensely flexible library, for serialization. However, we encourage users to try Micronaut Serialization. You can enjoy the following characteristics:

- Micronaut Serialization is a reflection-free serialization engine.
- Micronaut Serialization offers a smoother integration with [GraalVM](https://www.graalvm.org).
- Micronaut Serialization forces you to explicitly define which types are serializable, which leads to a reduced attack surface in your application.
- Micronaut Serialization moves serialization logic to build time, allowing for an earlier feedback loop.

## Micronaut Serialization Examples

Every sample project in [Micronaut Guides](https://guides.micronaut.io/latest/index.html) uses Micronaut Serialization.
