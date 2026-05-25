---
slug: 2022/05/26/micronaut-framework-3-5-0
title: Micronaut Framework 3.5.0 Released
description: The Micronaut team is excited to announce the release of Micronaut framework 3.5.0! This release introduces new features to the framework. Those features are detailed below. GraalVM 22.1.0 Micronaut framework 3.5 supports the latest GraalVM 22.1.0 Incremental Compilation for Gradle Builds You can now benefit from fully incremental compilation, including GraalVM metadata for Gradle builds....
date: '2022-05-26T16:53:31'
modified: '2022-05-26T16:53:31'
sourceUrl: https://micronaut.io/2022/05/26/micronaut-framework-3-5-0/
wordpressId: 5063
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2022/05/26/micronaut-framework-3-5-0/
---

The Micronaut team is excited to announce the release of [Micronaut framework 3.5.0](https://docs.micronaut.io/3.5.0/guide/index.html)!

This release introduces new features to the framework. Those features are detailed below.

## GraalVM 22.1.0

Micronaut framework 3.5 supports the latest [GraalVM 22.1.0](https://www.graalvm.org/release-notes/22_1/)

## Incremental Compilation for Gradle Builds

You can now benefit from fully incremental compilation, including GraalVM metadata for Gradle builds. This change avoids re-running the annotation processors on each change to an annotated type. A great feature for developers maintaining big codebases!

## Micronaut Data

Micronaut 3.5.0 includes [Micronaut Data 3.4.0](https://github.com/micronaut-projects/micronaut-data/releases/tag/v3.4.0) which supports:

- Postgres enums for JDBC
- Pagination for reactive repositories and specifications
- Pagination for async, coroutines repositories, and specifications

## Turbo Integration

Micronaut Views adds an integration with [Turbo](https://turbo.hotwired.dev/) – the heart of [Hotwire](https://hotwired.dev/).

> Turbo is a set of complementary techniques for speeding up page changes and form submissions, dividing complex pages into components, and streaming partial page updates over WebSocket.

[Micronaut Views supports easy generation of Turbo Frame and Turbo Streams](https://micronaut-projects.github.io/micronaut-views/latest/guide/#turbo) with a fluid API and extra annotations.

## New Module: Micronaut MicroStream

[MicroStream](https://microstream.one/) is a native Java object graph storage engine.

[Micronaut MicroStream](https://micronaut-projects.github.io/micronaut-microstream/snapshot/guide/) eases working with MicroStream in a Micronaut application. We have streamlined MicroStream configuration and added several annotations, such as `@StoreParams` and `@StoreReturn`, so that you can enjoy seamless persistence and blazing-fast performance. Additionally, Micronaut MicroStream integrates with the health and metrics endpoint.

Moreover, MicroStream is an additional [Micronaut Cache](https://micronaut-projects.github.io/micronaut-cache/latest/guide/) implementation at your disposal.

## Micronaut Gradle Plugin Updates

[Micronaut Gradle Plugin v3.4.0](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/) supports GraalVM Micronaut 22.1.0 and upgrades to Micronaut AOT 1.1.0.

Moreover, the Gradle plugin differentiates between the Lambda runtimes.

## Micronaut Maven Plugin Updates

[Micronaut Maven Plugin v3.3.0](https://github.com/micronaut-projects/micronaut-maven-plugin/releases/tag/v3.3.0) supports GraalVM 22.1.0. It includes configuration files in `src/main/resources` (for example, `application.yml`) when [watching for changes](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/run-mojo.html#watchForChanges).

## KoTest 5 support

Micronaut Test supports [KoTest 5](https://micronaut-projects.github.io/micronaut-test/latest/guide/#kotest5) to test your Micronaut applications. Testing with [KoTest 4](https://micronaut-projects.github.io/micronaut-test/latest/guide/#kotest) is still supported. We plan to default to [KoTest](https://kotest.io/) 5 in Micronaut Launch and the Micronaut CLI for Micronaut 3.6.0

## Micronaut AWS Lambda Improvements

### Micronaut AWS CDK

A new module, [Micronaut AWS CDK](https://micronaut-projects.github.io/micronaut-aws/latest/guide/#cdk), simplifies the creation of Lambda functions written with the Micronaut framework. It helps you select the appropriate handler and environment and asset definition.

### Lambda Runtimes

The Micronaut Gradle Plugin supports two runtimes for Lambda. If you deploy your Lambda functions to a Java runtime, use the environment `lambda_java`. If you deploy a GraalVM Native Image of your Micronaut function to a Lambda provided runtime, use the environment `lambda_provided`.

### CDK integration in CLI and Micronaut Launch

You can generate a function, use [Amazon Cloud Development Kit](https://aws.amazon.com/cdk/) (CDK) – infrastructure as code approach – to create your infrastructure and deploy your Micronaut function.

When you select the `aws-cdk` feature, we generate a multi-project build for Maven or Gradle. One of the modules defines infrastructure using Amazon CDK, while the other contains the function code.

You can combine `aws-cdk` features with new features, including:

- - `aws-lambda-function-url`– To [generate a Lambda function connected to a Lambda Function URL](https://micronaut.io/launch?type=FUNCTION&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=aws-lambda&features=aws-lambda-function-url&features=aws-cdk&version=3.5.0)
  - `amazon-api-gateway`– To [generate a Lambda function connected to an Amazon API Gateway](https://micronaut.io/launch?type=DEFAULT&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=aws-lambda&features=amazon-api-gateway&features=aws-cdk&version=3.5.0)
  - `dynamodb`– To [generate a Lambda function connected to a Dynamodb Database](https://micronaut.io/launch?type=FUNCTION&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=aws-lambda&features=aws-lambda-function-url&features=aws-cdk&features=dynamodb&version=3.5.0)
  - `amazon-cognito`– To generate [an Amazon Cognito User Pool](https://micronaut.io/launch?type=DEFAULT&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=amazon-cognito&features=aws-cdk&version=3.5.0)

Moreover, you can use the new CDK feature for deployments to the Java Runtime or the Provided Runtime. It has never been easier to [deploy a GraalVM native image of your function](https://micronaut.io/launch?type=FUNCTION&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=aws-lambda&features=aws-lambda-function-url&features=aws-cdk&features=dynamodb&features=graalvm&version=3.5.0)

### Latest AWS SDKs

In addition, [Micronaut AWS 3.5.0](https://github.com/micronaut-projects/micronaut-aws/releases/tag/v3.5.0) updates to:

- Alexa ASK SDK `2.43.6`
- AWS Java SDK v1 to `1.12.225`
- AWS Java SDK v2 to `2.17.196`
- AWS Lambda Events to `3.11.0`
- AWS Lambda Java Core to `1.2.1`
- AWS Serverless Java Container to `1.8.1`
- CDK Lib to `2.25.0`

## Micronaut Launch / Micronaut CLI

### New CLI Command: mn create

We have new CLI command:

`mn create`

An interactive prompt that will guide you through the options while creating a Micronaut application.

![Micronaut CLI mn create command](/micronaut-assets/main-site/wp-content/uploads/2022/05/mn-create-1.gif)

### Micronaut Serialization

We have improved the [generation of applications](https://micronaut.io/launch?type=DEFAULT&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=serialization-jackson&version=3.4.4) using [Micronaut serialization](https://micronaut-projects.github.io/micronaut-serialization/latest/guide/).

### Community Features

The [AgoraPulse](https://www.agorapulse.com/) development team offers several [Micronaut open source libraries](https://agorapulse.github.io/agorapulse-oss/). You can now select some of their libraries via [Micronaut Launch](https://launch.micronaut.io/) or the Micronaut CLI features:

- [Agorapulse](https://micronaut.io/launch?type=DEFAULT&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=micronaut-worker&version=3.5.0) [Gru HTTP](https://micronaut.io/launch?type=DEFAULT&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=gru-http&version=3.5.0). Gru is an interaction testing library
- [Agorapulse Micronaut Worker](https://micronaut.io/launch?type=DEFAULT&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=micronaut-worker&version=3.5.0). A library to provide advanced distributed scheduling capabilities for Micronaut applications
- [Agorapulse](https://micronaut.io/launch?type=DEFAULT&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=micronaut-worker&version=3.5.0) [Micronaut Console](https://micronaut.io/launch?type=DEFAULT&name=demo&package=com.example&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=micronaut-console&version=3.5.0). An extension to Micronaut applications and functions that allows executing arbitrary code

**Please [get in touch with us](https://twitter.com/sdelamo) if you are developing a Micronaut library.**We would love to help you integrate it into Micronaut Launch and Micronaut CLI.

## @Scheduled with Time Zones

Optionally, you can specify a time zone when using the [`@Scheduled` annotation](http://localhost/micronaut-core/guide/index.html#scheduling).

```
@Scheduled(cron = '1/33 0/1 * 1/1 * ?', zoneId = "America/Chicago")
void runCron() {
...
..
```

## Support validation groups with `@Validated`

You can enforce a subset of constraints using [validation groups](https://docs.micronaut.io/latest/guide/index.html#validationGroups) using groups on the `@Validated`.

## Advanced Listener Configuration

Micronaut framework 3.5.0 offers more flexibility in configuring the HTTP Server. Instead of configuring a single port, you [can specify each listener manually](https://docs.micronaut.io/latest/guide/index.html#listener).

## EPHEMERAL FACTORIES

A [Factory](https://docs.micronaut.io/latest/guide/#factories) has the default scope `@Singleton`, and it is destroyed with the context. Since Micronaut framework v3.5.0, you can dispose of the factory after producing a bean by annotating your factory class with `@Prototype` and `@Factory`.

## Module upgrades

- [Micronaut Micrometer 4.3.0](https://github.com/micronaut-projects/micronaut-micrometer/releases/tag/v4.3.0) updates to Micrometer 1.9.0.
- [Micronaut GCP 4.2.0](https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v4.2.0) updates to `grpc-auth` 1.45.1 and `grpc-netty-shaded`. Moreover, we have clarified the documentation to support GraalVM native images when using GCP libraries, and the Micronaut GCP bill of materials (BOM) now includes the `com.google.cloud:native-image-support` dependency.
- [Micronaut AOT 1.1.0](https://github.com/micronaut-projects/micronaut-aot/releases/tag/v1.1.0)
- [Micronaut SQL to 4.4.0](https://github.com/micronaut-projects/micronaut-sql/releases/tag/v4.4.0)
- [Micronaut Problem JSON to 2.3.0](https://github.com/micronaut-projects/micronaut-problem-json/releases/tag/v2.3.0)
- [Micronaut GRPC to 3.3.0](https://github.com/micronaut-projects/micronaut-grpc/releases/tag/v3.3.0) allows you to expose a gRPC health check for a grpc-server.
- [Micronaut Serialization to 1.1.0](https://github.com/micronaut-projects/micronaut-serialization/releases/tag/v1.1.0) allows for the serialization and deserialization of object arrays.
- [Micronaut OpenAPI to 4.1.0](https://github.com/micronaut-projects/micronaut-openapi/releases/tag/v4.1.0) updates to Swagger 2.2.0.
- [Micronaut R2DBC to 3.0.0](https://github.com/micronaut-projects/micronaut-r2dbc/releases/tag/v3.0.0) updates to R2DBC `1.0.0.RELEASE`.
- [Micronaut Security to 3.6.0](https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.6.0).
- [Micronaut Cache to 3.4.1](https://github.com/micronaut-projects/micronaut-cache/releases/tag/v3.4.1).
- [Micronaut Coherence to 3.4.1](https://github.com/micronaut-projects/micronaut-coherence/releases/tag/v3.4.1).

Several modules publish a BOM or use a Gradle Version Catalog:

- [Micronaut JAX-RS to 3.3.0](https://github.com/micronaut-projects/micronaut-jaxrs/releases/tag/v3.3.0)
- [Micronaut Picocli to 4.2.1](https://github.com/micronaut-projects/micronaut-picocli/releases/tag/v4.2.1)
- [Micronaut ACME to 3.2.0](https://github.com/micronaut-projects/micronaut-acme/releases/tag/v3.2.0).
- [Micronaut MongoDB to 4.2.0](https://github.com/micronaut-projects/micronaut-mongodb/releases/tag/v4.2.0)
- [Micronaut MQTT to 2.2.0](https://github.com/micronaut-projects/micronaut-mqtt/releases/tag/v2.2.0).
- [Micronaut Kafka to 4.3.0](https://github.com/micronaut-projects/micronaut-kafka/releases/tag/v4.3.0).

## SCHEMA MIGRATION MODULES

[Micronaut Flyway 5.3.0](https://github.com/micronaut-projects/micronaut-flyway/releases/tag/v5.3.0) updates Flyway to 8.5.8. [Micronaut Liquibase 5.3.0](https://github.com/micronaut-projects/micronaut-liquibase/releases/tag/v5.3.0) updates Liquibase to 4.9.1

## COMMUNITY FEEDBACK

We want to thank all the contributors; the community is essential to the framework’s success.

Special mention to [Alexey Zhokhov](https://github.com/donbeave), who has helped us migrate almost every module build to Gradle Version Catalogs.

Please try upgrading your existing applications to this new minor release and report any issues you find! See the documentation for further details and use GitHub to report any issues.
