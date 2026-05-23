---
slug: 2022/12/27/micronaut-framework-3-8-0-released
title: Micronaut Framework 3.8.0 Released!
description: The Micronaut team is excited to announce the release of Micronaut framework 3.8.0! This release introduces new features to the Framework. Those features are detailed below. GraalVM 22.3.0 Micronaut framework 3.8.0 supports the latest GraalVM 22.3.0. Core With Micronaut 3.8.0, you can use @RequestBean annotations with Records. Before 3.8.0, you could use a POJO as...
date: '2022-12-27T17:44:07'
modified: '2023-01-02T17:00:04'
sourceUrl: https://micronaut.io/2022/12/27/micronaut-framework-3-8-0-released/
wordpressId: 6016
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags: []
href: /2022/12/27/micronaut-framework-3-8-0-released/
---

The Micronaut team is excited to announce the release of [Micronaut framework 3.8.0](https://docs.micronaut.io/3.8.0/guide/index.html)!

This release introduces new features to the Framework. Those features are detailed below.

## GraalVM 22.3.0

Micronaut framework 3.8.0 supports the latest [GraalVM 22.3.0](https://www.graalvm.org/release-notes/22_3/).

## Core

With Micronaut `3.8.0`, you can use `@RequestBean` annotations with [Records](https://docs.oracle.com/en/java/javase/14/language/records.html). Before `3.8.0`, you could use a POJO as a controller method parameter and annotate the parameter with `@RequestBean` to bind any Bindable value (e.g., `HttpRequest`, `@PathVariable`, `@QueryValue` or `@Header` fields).

Suppose you enable CORS from any origin while running your app in localhost (e.g., test or development); the `CorsFilter` now returns 403 for non-localhost origins to protect you against drive-by localhost attacks.

### Core dependencies

The following core transitive dependencies are updated:

- [Netty](https://netty.io) to `4.1.86.Final`.
- [Jackson](https://github.com/FasterXML/jackson) to `2.14`.
- [Maven Native plugin](https://graalvm.github.io/native-build-tools/latest/index.html) to `0.9.19`.

## Micronaut Data

[Micronaut Data](https://github.com/micronaut-projects/micronaut-data/releases/tag/v3.9.1) adds [support for Azure Cosmos](https://micronaut-projects.github.io/micronaut-data/latest/guide/#azureCosmos) and [Multi-tenancy](https://micronaut-projects.github.io/micronaut-data/latest/guide/#multitenancy). Currently, Micronaut Data supports two multi-tenancy modes, `DATASOURCE` and `SCHEMA`.

## Micronaut Security 3.9.0

[Micronaut Security](https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.9.0) offers:

- Several [ahead-of-time optimizations](https://micronaut-projects.github.io/micronaut-security/latest/guide/#aot). You can download OpenID Configuration and remote JWKS at build time. Such AOT optimizations offer drastic time-to-first response improvements.
- [Proof Key for Code Exchange (PKCE) support](https://micronaut-projects.github.io/micronaut-security/latest/guide/#pkce). If the Authorization server specifies via `code_challenge_methods` either `plain`, `S256`, or both, Micronaut Security automatically sends a code challenge in the authorization request as specified in [PKCE Spec](https://www.rfc-editor.org/rfc/rfc7636).
- To avoid blocking the netty event loop, Micronaut Security eagerly and, in parallel, fetches the OpenID Connect metadata.

## Micronaut CLI

Micronaut CLI offers a new command. Type `mn create-aws-lambda`, and an interactive prompt will guide you through creating a Micronaut AWS Lambda project.

![Micronaut CLI create-aws-lambda command](https://micronaut.io/wp-content/uploads/2022/12/create-aws-lambda.gif)

## Micronaut Launch

We continue to improve project templates to get you the best starting point for your Micronaut applications. Both Micronaut Launch and CLI offer several extra features:

- [`gitlab-workflow-ci`](https://micronaut.io/launch?features=gitlab-workflow-ci).
- [`azure-cosmos-db`](https://micronaut.io/launch?features=azure-cosmos-db).
- [`localstack`](https://micronaut.io/launch?features=localstack).
- [`aws-alexa,aws-cdk`](https://micronaut.io/launch?type=FUNCTION&features=aws-alexa,aws-cdk).

## Build Plugins

### Maven Plugin

[Micronaut Maven Plugin](https://github.com/micronaut-projects/micronaut-maven-plugin/releases/tag/v3.5.2) improves the start/stop of test resources, let’s the user choose a namespace for the shared test resources service, and it adds a CRaC packaging type to create checkpointed docker images.

## Micronaut CRaC

[Micronaut CRaC (Coordinated Restore at Checkpoint)](https://github.com/micronaut-projects/micronaut-crac/releases/tag/v1.1.1) adds supports for [HikariCP](https://github.com/brettwooldridge/HikariCP).

Now, it is possible to build a docker image containing a CRaC-enabled JDK and a pre-warmed, checkpointed application with the [Micronaut Gradle CRaC Plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/#_micronaut_crac_plugin):

```
$ ./gradlew dockerBuildCrac
```

and with the [Micronaut Maven Plugin](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/examples/package.html#building_crac_based_docker_images):

`$ mvn package -Dpackaging=docker-crac`

Moreover, you can use [Micronaut CRaC](https://micronaut-projects.github.io/micronaut-crac/latest/guide/) in combination with [AWS Lambda SnapStart](https://micronaut.io/2022/11/28/leveraging-aws-lambda-snapstart-with-the-micronaut-framework/).

## CLOUD

### Micronaut AWS

[Micronaut AWS](https://github.com/micronaut-projects/micronaut-aws/releases/tag/v3.10.0) ships with several features:

- It is now possible to override the endpoint for AWS Services SDK, for example, while testing or developing.
- [API Gateway API to ease stage resolution](https://micronaut-projects.github.io/micronaut-aws/latest/guide/#amazonApiGateway).
- [Alexa skill’s request locale resolution](https://micronaut-projects.github.io/micronaut-aws/latest/guide/#localeresoultion).
- A new user agent module.

It updates the following dependencies:

- AWS CDK from `2.41.0` to `2.55.1`.
- AWS SDK V2 from `2.17.290` to `2.19.4`.
- AWS SDK V1 from `1.12.320` to `1.12.372`.
- AWS Lambda SDK `1.2.1` to `1.2.2`.
- AWS Serverless Java Container Core from `1.8.2` to `1.9.1`.
- Jetty from `9.4.48.v20220622` to `9.4.50.v20221201`.

### Micronaut Azure

[Micronaut Azure](https://github.com/micronaut-projects/micronaut-azure/releases/tag/v4.0.0) updates to:

- Azure SDK to `1.2.8`.
- Azure Functions Java to `3.0.0`.
- Azure Cosmos to `4.39.0`.

### Micronaut GCP

[Micronaut GCP](https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v4.8.0) adds new modules to [use `CloudEvents`](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#cloudEventsFunctions), and it adds the necessary configuration to use [Google Cloud Events](https://github.com/googleapis/google-cloudevents-java) with Micronaut serialization.

It updates to:

- Google Auth Library OAuth 2.0 HTTP from `1.11.0` to `1.14.0`.
- Google Cloud Core from `2.8.24` to `2.9.0`.
- Google Cloud PubSub from `1.120.16` to `1.122.2`.
- Google Secret Manager from `2.3.4` to `2.7.0`.

### Micronaut Oracle

[Micronaut Oracle](https://github.com/micronaut-projects/micronaut-oracle-cloud/releases/tag/v2.3.1) supports [Oracle Cloud Infrastructure (OCI) SDK v3](https://blogs.oracle.com/cloud-infrastructure/post/announcing-oci-java-sdk-300).

## Database Migration Tools

### Micronaut Liquibase

[Micronaut Liquibase](https://github.com/micronaut-projects/micronaut-liquibase/releases/tag/v5.6.0) updates to [Liquibase](https://www.liquibase.org/) `4.18.0`.

## Reactive Libraries

### Micronaut Reactor

[Micronaut Reactor](https://github.com/micronaut-projects/micronaut-reactor/releases/tag/v2.5.0) updates to [Project Reactor](https://projectreactor.io/) `3.5.0`.

## Micronaut Test

Micronaut Test updates to:

- [JUnit](https://junit.org/junit5/) `5.9.1`.
- [REST-assured](https://rest-assured.io) `5.3.0`.
- [Mockito](https://site.mockito.org) `4.9.0`.
- [Kotest](https://kotest.io) `5.5.4`.

It adds `junit-params` dependency to the Micronaut Test BOM.

## Micronaut Test Resources

[Micronaut Test Resources](https://github.com/micronaut-projects/micronaut-test-resources/releases/tag/v1.2.3) adds support for [Wait strategies](https://micronaut-projects.github.io/micronaut-test-resources/latest/guide/#_wait_strategies), a method to get the `TestResourcesClient` from an `ApplicationContext`, and it fixes [a potential security issue](https://github.com/micronaut-projects/micronaut-test-resources/releases/tag/v1.2.3).

## Micronaut OpenAPI

[Micronaut OpenAPI `4.8.1`](https://github.com/micronaut-projects/micronaut-openapi/releases/tag/v4.8.1) adds many bug fixes, improvements, and new features such as [`Schema Decorators`](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/#schemaDecorators), the ability to override the UI templates, better support for server context path, and it updates to swagger `2.2.7`.

Thanks to [@altro3](https://github.com/altro3) for his continuous support with the Micronaut Open API module.

## Micronaut Views

[Micronaut Views](https://github.com/micronaut-projects/micronaut-views/releases/tag/v3.8.0) updates to:

- [Thymeleaf](https://www.thymeleaf.org) `3.1.1.release`.
- [JTE](https://jte.gg) `2.2.4`.
- [Handlebars](https://handlebarsjs.com) `4.3.1`.
- [Pebble](https://pebbletemplates.io) `3.1.6`.

Micronaut Views JTE supports rendering `.kte` (Kotlin) templates.

## Micronaut Serialization

[Micronaut Serialization](https://github.com/micronaut-projects/micronaut-serialization/releases/tag/v1.5.0) adds support for deserialization of timestamps both as timestamp or as a string, and it updates to BSON `4.8.1`.

## Micronaut Problem+JSON

[Micronaut Problem JSON](https://github.com/micronaut-projects/micronaut-problem-json/releases/tag/v2.6.0) improve supports for custom `ThrowableProblem` in combination with Micronaut Serialization.

## Micronaut Spring

[Micronaut Spring](https://github.com/micronaut-projects/micronaut-spring/releases/tag/v4.4.0) supports exporting Spring Beans to a Micronaut Application. For example, use a Spring-configured `DataSource` with Micronaut Data.

## Micronaut Email

[Micronaut Email](https://github.com/micronaut-projects/micronaut-email/releases/tag/v1.5.0) adds `Contact::getNameAddress`, improves the population of the AWS SES sender name, and it updates to [Postmark Java Library](https://github.com/activecampaign/postmark-java) `1.8.4`.

## Micronaut gRPC

[Micronaut gRPC](https://github.com/micronaut-projects/micronaut-grpc/releases/tag/v3.5.0) updates to gRPC `1.51.1` and `protobuf` `3.21.12` and several features such as support for connecting on startup.

## Micronaut Kafka

[Micronaut Kafka](https://github.com/micronaut-projects/micronaut-kafka/releases/tag/v4.5.0) offers several improvements around Kafka streams’ metrics.

## Micronaut Micrometer

[Micronaut Micrometer](https://github.com/micronaut-projects/micronaut-micrometer/releases/tag/v4.7.0) updates to `dropwizards-metrics-core` `4.2.13` and gRPC `1.51.`.

## Micronaut Object Storage

[Micronaut Object Storage](https://github.com/micronaut-projects/micronaut-object-storage/releases/tag/v1.1.0) adds support for adding metadata as a map of strings, and it supports converting from `ObjectStorageEntry` to `StreamedFile` and `SystemFile`.

## Micronaut RabbitMQ

[Micronaut RabbitMQ](https://github.com/micronaut-projects/micronaut-rabbitmq/releases/tag/v3.4.0) updates to `ampqq-client` `5.16.0`, supports consumer auto acknowledge mode and options to configure the number of consumers. Moreover, it adds a BOM Module.

## Micronaut GraphQL

[Micronaut GraphQL](https://github.com/micronaut-projects/micronaut-graphql/releases/tag/v3.2.0) updates to GraphQL Java Tools `11.1.2`.

## Micronaut Groovy

[Micronaut Groovy](https://github.com/micronaut-projects/micronaut-groovy/releases/tag/v3.4.0) updates to Hibernate `ehcache` `5.6.12`.

### BOM and Gradle Version Catalog

Several modules publish a BOM (Bill of materials) module and/or use a Gradle Version Catalog: [Micronaut Hibernate Validator](https://micronaut-projects.github.io/micronaut-hibernate-validator/latest/guide/), [Micronaut JMX](https://micronaut-projects.github.io/micronaut-jmx/latest/guide/), [Micronaut RabbitMQ](https://micronaut-projects.github.io/micronaut-rabbitmq/latest/guide/), and [Micronaut Jackson XML](https://micronaut-projects.github.io/micronaut-jackson-xml/latest/guide/).

## Micronaut Guides and Micronaut Serialization

We updated [Micronaut Guides](https://guides.micronaut.io) to use [Micronaut Serialization](https://micronaut-projects.github.io/micronaut-serialization/latest/guide), which enables serialization/deserialization in Micronaut applications using build time information.

## HTTP Server TCK

We wrote an HTTP Server TCK to ensure consistency no matter the runtime you use (Netty, Servlet, Lambda, Azure, GCP).

## Community Feedback

We want to thank all the contributors; the community is essential to the Framework’s success. Upgrade your existing applications to this new minor release and [report any issues](https://github.com/micronaut-projects/), or give us any feedback!

We are excited about the Micronaut framework’s future in 2023. Happy holidays!
