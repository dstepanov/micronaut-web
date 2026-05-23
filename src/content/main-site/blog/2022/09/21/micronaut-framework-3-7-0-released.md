---
slug: 2022/09/21/micronaut-framework-3-7-0-released
title: Micronaut Framework 3.7.0 Released!
description: The Micronaut team is excited to announce the release of Micronaut framework 3.7.0! This release introduces a lot of new features to the Framework. We’ll walk through the details of those features below. Micronaut Spring Since the creation of the Micronaut framework, we have seen interest from teams who want to use Micronaut modules with...
date: '2022-09-21T16:01:07'
modified: '2022-09-21T16:01:07'
sourceUrl: https://micronaut.io/2022/09/21/micronaut-framework-3-7-0-released/
wordpressId: 5479
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2022/09/21/micronaut-framework-3-7-0-released/
---

The Micronaut team is excited to announce the release of [Micronaut framework 3.7.0](https://docs.micronaut.io/3.7.0/guide/index.html)!

This release introduces a lot of new features to the Framework. We’ll walk through the details of those features below.

### Micronaut Spring

Since the creation of the Micronaut framework, we have seen interest from teams who want to use Micronaut modules with a Spring application or consume Spring libraries from a Micronaut application.

We have good news for both use cases:

- **[Micronaut Spring Boot Starter](https://micronaut-projects.github.io/micronaut-spring/latest/guide/#springBootStarter)** makes it easy to use Micronaut modules inside a Spring application. To learn more, please review our guide that shows how to use [Micronaut Data JDBC from a Spring Boot Application](https://guides.micronaut.io/latest/spring-boot-micronaut-data.html).
- **[Sharing Libraries between Spring and Micronaut](https://micronaut-projects.github.io/micronaut-spring/latest/guide/#sharingLibraries)** is easier with support for the Spring `@Import` annotation.

Moreover, the latest version of [Micronaut Spring](https://micronaut-projects.github.io/micronaut-spring/latest/guide/) updates to Spring 5.3.23.

## Object Storage

[Micronaut Object Storage](https://micronaut-projects.github.io/micronaut-object-storage/latest/guide/), a new module, provides a uniform API to create, read and delete objects in the major cloud providers.

In this initial release, we support [Amazon S3](https://aws.amazon.com/s3/), [Azure Blob Storage](https://azure.microsoft.com/en-gb/services/storage/blobs/), [Google Cloud Storage](https://cloud.google.com/storage), and [Oracle Cloud Infrastructure (OCI) Object Storage](https://www.oracle.com/cloud/storage/object-storage/).

We wrote a guide that shows how to use [Micronaut Object Storage with Amazon S3](https://guides.micronaut.io/latest/micronaut-object-storage-aws.html).

## Micronaut CRaC

A new module, [Micronaut CRaC](https://micronaut-projects.github.io/micronaut-crac/latest/guide/), adds support for [CRaC (Coordinated Restore at Checkpoint)](https://wiki.openjdk.org/display/CRaC) to the Micronaut framework.

> The CRaC (Coordinated Restore at Checkpoint) Project researches coordination of Java programs with mechanisms to checkpoint (make an image of, snapshot) a Java instance while it is executing. Restoring from the image could be a solution to some of the problems with the start-up and warm-up times.

## Micronaut Gradle Plugin

The latest version of the [Micronaut Gradle Plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/) allows you to specify GraalVM releases URL.

We have also released [Micronaut CRaC Gradle Plugin](https://plugins.gradle.org/plugin/io.micronaut.crac). This [new plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/#_micronaut_crac_plugin) contributes docker-related tasks (`dockerBuildCrac` and `dockerPushCrac`), which allow you to generate a docker image containing a CRaC enabled JDK and a pre-warmed, checkpointed Micronaut application.

## Core

[Micronaut core](https://github.com/micronaut-projects/micronaut-core/) has several improvements:

- If you want complete control of where your application loads configuration from, for example, due to security restrictions, you can disable [the default PropertySourceLoader implementations](https://docs.micronaut.io/latest/guide/#propertySource) by calling `ApplicationContextBuilder::enableDefaultPropertySources(false)` when starting your application
- Better `java.time` conversion for YAML configuration
- Client SSL inner configuration is [Bootstrap](https://docs.micronaut.io/latest/guide/#bootstrap) context compatible
- [`UriBuilder`](https://docs.micronaut.io/latest/api/io/micronaut/http/uri/UriBuilder.html) methods `queryParam` and `replaceQueryParam` ignore null values
- It is possible to stop the Netty server without stopping the Application context
- You can declare beans at runtime using interfaces
- You can mark static methods as `@Executable`
- A big HTTP client refactor

## Micronaut Launch and CLI

[Micronaut Launch](https://launch.micronaut.io/) and Micronaut CLI offer new features:

- [JUnit Params](https://micronaut.io/launch?features=junit-params)
- [Amazon API Gateway HTTP Feature](https://micronaut.io/launch?features=aws-lambda&features=aws-cdk&features=amazon-api-gateway-http)
- [Object Storage AWS](https://micronaut.io/launch?features=object-storage-aws)
- [Object Storage Azure](https://micronaut.io/launch?features=object-storage-azure)
- [Object Storage GCP](https://micronaut.io/launch?features=object-storage-gcp)
- [Object Storage Oracle Cloud](https://micronaut.io/launch?features=object-storage-oracle-cloud)

## Module Upgrades

### Micronaut Azure

A new module [Micronaut Azure Cosmos](https://micronaut-projects.github.io/micronaut-azure/latest/guide/#azureCosmosClient) eases working with [Azure Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/introduction), a managed NoSQL database for modern app development.

The latest version of [Micronaut Azure](https://micronaut-projects.github.io/micronaut-azure/latest/guide/) adds support for [`StorageSharedKeyCredential`](https://micronaut-projects.github.io/micronaut-azure/latest/guide/index.html#_storagesharedkeycredential).

### Micronaut AWS

The latest Micronaut AWS adds a new module to ease [Cloud Watch Logging](https://micronaut-projects.github.io/micronaut-aws/3.9.x/guide/#cloudWatchLogging).

Micronaut AWS Lambda triggers a new event – [`AfterExecutionEvent`](https://micronaut-projects.github.io/micronaut-aws/3.9.x/guide/#afterExecutionEvent). For example, you can register event listeners to perform additional tasks after handler execution.

#### Latest AWS SDK

It updates to:

- Alexa ASK SDK `2.44.0`
- AWS Java SDK v1 to `1.12.301`
- AWS Java SDK v2 to `2.17.271`
- CDK Lib to `2.41.0`

### Micronaut GCP

[Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/) updates several transitive dependencies:

- `com.google.auth:google-auth-library-oauth2-http` to `1.11.0`
- `com.google.cloud.functions:functions-framework-api` to `1.0.4`
- `com.google.cloud:google-cloud-core` to `2.8.12`
- `com.google.cloud:google-cloud-pubsub` to `1.120.16`
- `com.google.cloud:google-cloud-secretmanager` to `2.3.4`

### Micronaut Oracle Cloud

[Micronaut Oracle Cloud](https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/) updates to Oracle Cloud 2.41.0. [Oracle Cloud SDK was incorrectly exposing several transitive dependencies](https://micronaut-projects.github.io/micronaut-oracle-cloud/snapshot/guide/#breaks) – `commons-codec`, `commons-io`, and `commons-logging`. The latest Oracle Cloud SDK version no longer exposes those dependencies. If you use those dependencies, you will need to add them directly to your build file.

Additionally, the latest version of Micronaut Oracle Cloud adds support for the [Oracle Cloud (OCI) Logging service](https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/#logging)

### Micronaut Test

[Micronaut Test](https://micronaut-projects.github.io/micronaut-test/latest/guide/) updates several transitive dependencies:

- [JUnit](https://junit.org/junit5/) from `5.8.2` to `5.9.0`
- [Mockito](https://site.mockito.org/) from `4.6.1` to `4.8.0`
- [REST-assured](https://rest-assured.io/) from `5.1.1` to `5.2.0`
- [Mockk](https://mockk.io/) from `1.12.4` to `1.12.8`
- [KoTest 5](https://kotest.io/) from `5.3.0` to `5.4.2`

### Micronaut Test Resources

[Micronaut Test Resources](https://micronaut-projects.github.io/micronaut-test-resources/latest/guide/) adds support for Hibernate reactive and MQTT v5. Moreover, it lets the user choose a custom DB name and tweak database parameters.

### Micronaut Security

[Micronaut Security](https://micronaut-projects.github.io/micronaut-security/latest/guide/) updates [Nimbus JOSE + JWT](https://connect2id.com/products/nimbus-jose-jwt) to `9.25`.

### Micronaut Views

[Micronaut Views](https://micronaut-projects.github.io/micronaut-views/latest/guide/) updates [JTE](https://jte.gg/) to `1.11.0`, and builds the module with Micronaut framework `3.6.3`.

### Micronaut Reactor

[Micronaut Reactor](https://micronaut-projects.github.io/micronaut-reactor/latest/guide/) updates to [Project Reactor](https://projectreactor.io/) `3.4.23`.

### Micronaut Tracing

[Micronaut Tracing](https://micronaut-projects.github.io/micronaut-tracing/latest/guide/) updates several transitive dependencies:

- `io.opentelemetry:opentelemetry-bom` to `1.18.0`
- `io.opentelemetry.contrib:opentelemetry-aws-xray` to `1.17.0`
- `io.zipkin.brave:brave-instrumentation-http` to `5.14.0`
- `com.google.protobuf:*` to `3.12.6`
- `io.grpc:*` to `1.49.0`

### Micronaut Microstream

[Micronaut Microstream REST API](https://micronaut-projects.github.io/micronaut-microstream/latest/guide/#rest) was updated to use [Micronaut Serialization](https://micronaut-projects.github.io/micronaut-serialization/latest/guide/).

### Micronaut MongoDB

The latest version of [Micronaut MongoDB](https://micronaut-projects.github.io/micronaut-mongodb/latest/guide/) adds the ability to add custom command listeners and custom connection pool listeners to Mongo client settings.

### Micronaut Groovy

[Micronaut Groovy](https://micronaut-projects.github.io/micronaut-groovy/latest/guide/) updates to [GORM for Neo4J](http://gorm.grails.org/latest/neo4j/manual/index.html) `7.3.0` and [Apache Groovy](https://groovy-lang.org/) `3.0.13`.

### Micronaut Open API

[Micronaut OpenAPI](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/) continues to be an example of community contributions. Many thanks to [@altro3](https://github.com/altro3), who has fixed many bugs and contributed improvements. For example, resource localization for the UI, and changes to SwaggerUI to avoid loading external resources.

### Micronaut Hibernate Validator

[Micronaut Hibernate Validator](https://micronaut-projects.github.io/micronaut-hibernate-validator/latest/guide/) updates to [Hibernate Validator `6.2.5`](https://hibernate.org/validator/releases/6.2/). In addition, it exposes `glassfish-jakarta-el` as a `runtimeOnly` transitive dependency instead of `org.glassfish:javax.el`.

### Micronaut JMS

[Micronaut Java Messaging Service (JMS)](https://micronaut-projects.github.io/micronaut-jms/latest/guide/) published the [`2.1.0` release](https://github.com/micronaut-projects/micronaut-jms/releases/tag/v2.1.0), which contains several improvements, bug fixes, and a major overhaul of the module’s build.

### Micronaut R2DBC

[Micronaut R2DBC](https://micronaut-projects.github.io/micronaut-r2dbc/latest/guide/) updates transitive dependencies to:

- `com.oracle.database.r2dbc:oracle-r2dbc` to `1.0.0`
- `com.oracle.database.jdbc:ojdbc11` to `21.7.0.0`
- `org.postgresql:r2dbc-postgresql` to `0.9.2`
- `io.r2dbc:r2dbc-pool` `0.9.2`

### Micronaut Micrometer

[Micronaut Micrometer](https://micronaut-projects.github.io/micronaut-micrometer/latest/guide/) updates:

- `io.micrometer:micrometer-bom` to `1.9.4`
- `io.dropwizard.metrics:metrics-core` to `4.2.12`

### Micronaut Neo4J

Latest version of [Micronaut Neo4J](https://micronaut-projects.github.io/micronaut-neo4j/latest/guide/) updates Neo4J driver to `4.4.9`.

### Modules built with the latest Micronaut Version

We upgraded multiple modules to be built with Micronaut `3.6.x`: [Micronaut RSS](https://micronaut-projects.github.io/micronaut-rss/latest/guide/), [Micronaut MQTT](https://micronaut-projects.github.io/micronaut-mqtt/latest/guide/), [Micronaut Problem+JSON](https://micronaut-projects.github.io/micronaut-problem-json/latest/guide/), and [Micronaut Reactor](https://micronaut-projects.github.io/micronaut-reactor/latest/guide/).

### BOM and Gradle Version Catalog

Several modules publish a BOM (Bill of Materials) module and/or use a Gradle Version Catalog: [Micronaut Discovery](https://micronaut-projects.github.io/micronaut-discovery-client/latest/guide/), and [Micronaut Multi-tenancy](https://micronaut-projects.github.io/micronaut-multitenancy/latest/guide/).

## Community Feedback

We want to thank all the contributors; the community is essential to the Framework’s success. Please try upgrading your existing applications to this new minor release and report any issues you find! See the [documentation](https://docs.micronaut.io) for further details and use [GitHub](https://github.com/micronaut-projects/) to report any issues.

## Engage

- [Micronaut Podcast](https://micronautpodcast.com)
- [Micronaut Gitter Community](https://gitter.im/micronautfw)
- [Twitter: @micronautfw](https://twitter.com/micronautfw)
- [Micronaut Guides](https://guides.micronaut.io)
