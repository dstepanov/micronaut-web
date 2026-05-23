---
slug: 2026/04/27/micronaut-framework-5-0-with-java-25-baseline
title: Micronaut Framework 5.0 with Java 25 baseline
description: Starting with Micronaut Framework 5.0, to be released in Q2 2026, the Java baseline will be Java 25. Use modern Java features By setting a Java 25 baseline, we can improve our internal code and public APIs by continuing to use features such as Virtual Threads, Structured Concurrency, Scoped Values, Pattern Matching for switch, Record...
date: '2026-04-27T14:34:04'
modified: '2026-04-27T15:15:44'
sourceUrl: https://micronaut.io/2026/04/27/micronaut-framework-5-0-with-java-25-baseline/
wordpressId: 7450
contentSource: wordpress-post
category: micronaut-5
categories:
  - micronaut-5
tags:
  - java
  - micronaut5
href: /2026/04/27/micronaut-framework-5-0-with-java-25-baseline/
---

Starting with Micronaut Framework 5.0, to be released in Q2 2026, the Java baseline will be Java 25.

## Use modern Java features

By setting a Java 25 baseline, we can improve our internal code and public APIs by continuing to use features such as [Virtual Threads](https://openjdk.org/jeps/444), [Structured Concurrency](https://openjdk.org/jeps/453), [Scoped Values](https://openjdk.org/jeps/506), [Pattern Matching for switch](https://openjdk.org/jeps/441), [Record Patterns](https://openjdk.org/jeps/440), and [String Templates](https://openjdk.org/jeps/430). For example, Micronaut Framework 5.0 provides an alternative implementation of context propagation that uses [Scoped Values](https://openjdk.org/jeps/506), in addition to the default implementation based on thread-local variables.

## Cloud vendors ready for Java 25

Many Micronaut users deploy to the cloud, and cloud vendors are preparing for Java 25. For example, [AWS Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html), [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/platforms/platforms-supported.html#platforms-supported.javase), and [Google Cloud Functions](https://cloud.google.com/functions/docs/concepts/execution-environment#runtimes). We are confident that [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-java?tabs=bash%2Cconsumption#supported-versions) and [OCI (Oracle Cloud Infrastructure) Functions](https://docs.oracle.com/en-us/iaas/Content/Functions/Tasks/languagessupportedbyfunctions.htm) will soon support Java 25.

## Show modern code in our documentation

[Micronaut Guides](https://guides.micronaut.io/) and [Micronaut module documentation](https://docs.micronaut.io/) embed code samples from real applications. By setting a Java 25 baseline, we can update those samples to use modern Java features, making the language more appealing and improving the developer experience.

## Performance improvements

[Java 25 brings performance improvements](https://inside.java/2025/10/20/jdk-25-performance-improvements/). By building and releasing artifacts with a baseline of Java 25, Micronaut users can benefit from these improvements when upgrading to the latest framework version.

## Reduce CI build times

Micronaut Framework 4.0 continuous integration tests run against a matrix of Java versions: 17, 21, and 25.

Our Java 25 builds are already significantly faster. By dropping support for older Java versions in Micronaut Framework 5.0, we can build and test modules more quickly and deliver features faster to the Micronaut community.

## A message to the Java community

The Java community should embrace Java 25. As framework developers, we should take a clear position. It is time to move forward. Your applications will run faster, and your development experience will improve.

## How to continue using Java 17 or 21 with the Micronaut Framework?

If you need to use an older version, Micronaut Framework 4.x will continue to support Java 17 and Java 21.
