---
slug: 2023/03/21/micronaut-framework-code-generation
title: Micronaut Framework code generation
description: When you develop a Micronaut application, you write .java, .kt, or .groovy files. Through this article, I refer to those files as source code. The Java compiler compiles source code into a new document suffixed .class, coded into Java bytecode. The compiled bytecode is platform-independent. A device capable of running Java can interpret/translate this file...
date: '2023-03-21T10:06:58'
modified: '2023-03-21T10:06:58'
sourceUrl: https://micronaut.io/2023/03/21/micronaut-framework-code-generation/
wordpressId: 6151
contentSource: wordpress-post
category: uncategorized
categories:
  - uncategorized
tags: []
href: /2023/03/21/micronaut-framework-code-generation/
---

When you develop a Micronaut application, you write `.java`, `.kt`, or `.groovy` files. Through this article, I refer to those files as source code.

The Java compiler compiles source code into a new document suffixed `.class`, coded into Java bytecode. The compiled bytecode is platform-independent. A device capable of running Java can interpret/translate this file into something it can run.

The Micronaut framework generates at build time meta-information about your code to power features such as dependency injection, AOP, or bean introspection. Traditional Java frameworks made those features possible via runtime logic, often made possible via reflection. That runtime logic ended with Java applications being slow to start and resource-hungry. Micronaut framework reflection-free build-time generation approach creates powerful but lean Java applications.

## [https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#bytecode-generation](https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#bytecode-generation) bytecode generation

The Micronaut compiler visits the end-user code and generates additional bytecode that sits alongside the user code in the same package structure.

Micronaut Framework uses [ASM](https://asm.ow2.io/) to generate bytecode.

> ASM is an all purpose Java bytecode manipulation and analysis framework. It can be used to modify existing classes or to dynamically generate classes, directly in binary form. ASM provides some common bytecode transformations and analysis algorithms from which custom complex transformations and code analysis tools can be built

We consider ASM is a stable solution for bytecode generation. For example, ASM is used by the OpenJDK to generate the [lambda call sites](http://hg.openjdk.java.net/jdk8/jdk8/jdk/file/687fd7c7986d/src/share/classes/java/lang/invoke/InnerClassLambdaMetafactory.java).

### [https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#what-artifacts-does-micronaut-framework-generate-as-bytecode](https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#what-artifacts-does-micronaut-framework-generate-as-bytecode) What artifacts does Micronaut Framework generate as bytecode?

Micronaut Framework generates at build-time:

- [Bean definitions](https://docs.micronaut.io/latest/guide/#iocArch) to power the Micronaut Framework dependency injection engine.
- [Bean Introspections](https://docs.micronaut.io/latest/guide/#introspectionArch) to power features such as reflection-free serialization.
- [Proxies](https://docs.micronaut.io/latest/guide/#aopArch) to power AOP features.
- [Bean Factories](https://docs.micronaut.io/latest/guide/#factories). For example, [Micronaut Kubernetes](https://github.com/micronaut-projects/micronaut-kubernetes) and [Micronaut Oracle Cloud](https://github.com/micronaut-projects/micronaut-oracle-cloud) generate factories for external SDK Clients from an annotation processor.

### [https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#no-users-bytecode-modification](https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#no-users-bytecode-modification) No user’s bytecode modification

**Micronaut Framework does not modify the user’s bytecode**.

Your classes are your classes. The Micronaut framework does not transform classes or modify the bytecode generated from the code you write.

### [https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#why-does-micronaut-framework-generate-bytecode-instead-of-source-code](https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#why-does-micronaut-framework-generate-bytecode-instead-of-source-code) Why does Micronaut Framework generate bytecode instead of source code?

- Micronaut Framework supports multiple languages – Kotlin, Java, and Apache Groovy. Source code generation will lead to developers asking us to generate source code files in Kotlin or Groovy instead of Java. That is something we cannot afford to do. By generating bytecode, we stay language neutral.
- You can generate bytecode that is independent of the current JDK version. You can generate bytecode for “future” Java versions.
- You can generate bytecode which wouldn’t be allowed by sources. e.g., generate Java 11 bytecode on a Java 8 runtime.
- By generating bytecode, we decouple the compiler from the annotation processing API. Thus, it avoids a two-step compilation process.
- Moreover, we consider Micronaut Framework’s generated code internal. The generated code is optimized for performance. It is not code that you should modify, alter or experiment with it as a developer.

## [https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#source-code-generation](https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#source-code-generation) Source code generation

### [https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#micronaut-ahead-of-time-aot](https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#micronaut-ahead-of-time-aot) Micronaut Ahead of Time (AOT)

[Micronaut Ahead of Time](https://micronaut-projects.github.io/micronaut-aot/latest/guide/), a framework that implements ahead-of-time (AOT) optimizations for Micronaut applications and libraries, generates source code instead of bytecode via integrations with the [Micronaut Gradle plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/#_micronaut_aot_plugin) and [Micronaut Maven plugin](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/examples/aot.html).

For Micronaut Ahead of Time (AOT), we chose source code generation instead of bytecode. For source code generation, we use [JavaPoet](https://github.com/square/javapoet).

> JavaPoet is a Java API for generating.java source files.

#### [https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#why-source-code-generation-instead-of-bytecode-generation-in-micronaut-aot](https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#why-source-code-generation-instead-of-bytecode-generation-in-micronaut-aot) Why source code generation instead of bytecode generation in Micronaut AOT?

Source code generation is more straightforward than bytecode generation. Thus, it enabled us to develop Micronaut AOT faster.

Moreover, for public-facing APIs, we prefer to expose source code generation instead of bytecode generation and Micronaut AOT is extensible by design. Users may [implement custom AOT optimizers](https://micronaut-projects.github.io/micronaut-aot/latest/guide/#_implementing_an_aot_optimizer). An AOT optimizer may generate new source files via [JavaPoet](https://github.com/square/javapoet).

### [https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#source-code-generation-in-micronaut-cli-commands](https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#source-code-generation-in-micronaut-cli-commands) Source code generation in Micronaut CLI commands

Micronaut CLI (Command Line Interface) adds several commands which generate source code inside the user project. For example, you can create a sample controller.

```
% mn
mn> create-controller Bar
| Rendered controller to src/main/java/foo/BarController.java
| Rendered test to src/test/java/foo/BarControllerTest.java
```

For this use case, source code generation is a perfect match because we expect/encourage users to modify, alter or experiment with these files. Micronaut CLI uses [Rocker Templates](https://github.com/fizzed/rocker) for source code generation.

## [https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#conclusion](https://gist.github.com/sdelamo/0a3da29ded9ee03868f3ba5d3c5d3edb#conclusion) Conclusion

Micronaut Framework is an implementation of an annotation-based programming model. It generates bytecode based on the user’s code, but it never modifies the bytecode of the user’s classes. The framework leans towards source code generation in areas where extensibility/modification is required.
