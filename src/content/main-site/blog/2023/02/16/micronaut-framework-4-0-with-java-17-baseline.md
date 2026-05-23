---
slug: 2023/02/16/micronaut-framework-4-0-with-java-17-baseline
title: Micronaut Framework 4.0 with Java 17 baseline
description: Starting with Micronaut framework 4.0, to be released in 2023, the Java baseline will be Java 17. Use modern Java features By setting a Java 17 baseline, we can use new Java features. For example, Micronaut framework 4.0 provides an alternative implementation of the Micronaut HTTP Client based on Java HTTP Client. Moreover, we can...
date: '2023-02-16T18:42:29'
modified: '2023-02-27T06:03:09'
sourceUrl: https://micronaut.io/2023/02/16/micronaut-framework-4-0-with-java-17-baseline/
wordpressId: 6085
contentSource: wordpress-post
category: micronaut-4
categories:
  - micronaut-4
tags:
  - java
  - micronaut4
href: /2023/02/16/micronaut-framework-4-0-with-java-17-baseline/
---

Starting with Micronaut framework 4.0, to be released in 2023, the Java baseline will be Java 17.

## Use modern Java features

By setting a Java 17 baseline, we can use new Java features. For example, Micronaut framework 4.0 provides an alternative implementation of the Micronaut HTTP Client based on [Java HTTP Client](https://openjdk.org/groups/net/httpclient/intro.html). Moreover, we can improve our internal code and public APIs using features such as [Java Records](https://openjdk.java.net/jeps/395), [Sealed Classes](https://openjdk.java.net/jeps/409), [Switch Expressions](https://openjdk.java.net/jeps/361), [Text Blocks](https://openjdk.java.net/jeps/378), and [Pattern matching for instanceof](https://openjdk.java.net/jeps/394).

## Cloud vendors ready for 17

Many Micronaut users deploy to the cloud. Cloud vendors are ready for 17. For example, [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-java?tabs=bash%2Cconsumption#supported-versions), [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/platforms/platforms-supported.html#platforms-supported.javase), [Google Cloud Functions](https://cloud.google.com/functions/docs/concepts/execution-environment#runtimes) or [OCI (Oracle Cloud Infrastructure) Functions](https://docs.oracle.com/en-us/iaas/Content/Functions/Tasks/languagessupportedbyfunctions.htm) support Java 17 runtimes.

## Show modern code in our Documentation

[Micronaut Guides](https://guides.micronaut.io/) and [Micronaut modules documentation](https://docs.micronaut.io/) embed code samples from real code. By setting a Java 17 baseline, we can update those code samples to use Java’s newest features which make Java a much more appealing language and development experience.

## Performance improvements

Java 17 is significantly faster than Java 8 or 11. By building and releasing artifacts with a baseline of Java 17, Micronaut users will get performance benefits when updating their applications to the latest Framework version.

## Reduce CI Build Times

Micronaut framework 3.0 continuous integration tests run with a matrix of Java versions – 8, 11, and 17.

Our Java 17 builds are way faster – up to 30%. We can build and test our modules faster by dropping support for old Java versions in Micronaut framework 4.0. Thus, we can deliver features faster to the Micronaut community.

## A message to the Java Community

The Java community should embrace a least Java 17. We, as framework developers, should put a stake in the sand. It is time for the Java community to update to 17. Your code will run faster and your coding experience will be more productive.

## How to continue using Java 8 or 11 with the Micronaut Framework?

If you require to use an older version, Micronaut framework 3.x continues to support Java 8, Java 11, and Java 17.
