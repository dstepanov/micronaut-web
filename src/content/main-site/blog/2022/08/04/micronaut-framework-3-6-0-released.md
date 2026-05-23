---
slug: 2022/08/04/micronaut-framework-3-6-0-released
title: Micronaut Framework 3.6.0 Released!
description: The Micronaut team is excited to announce the release of Micronaut framework 3.6.0! This release introduces new features to the Framework. Those features are detailed below. GraalVM 22.2.0 Micronaut framework 3.6.0 supports the latest GraalVM 22.2.0. Test Resources Micronaut Test Resources adds support for managing the external resources needed during development or testing. It integrates...
date: '2022-08-04T19:24:54'
modified: '2022-08-05T13:11:05'
sourceUrl: https://micronaut.io/2022/08/04/micronaut-framework-3-6-0-released/
wordpressId: 5255
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2022/08/04/micronaut-framework-3-6-0-released/
---

The Micronaut team is excited to announce the release of [Micronaut framework 3.6.0](https://docs.micronaut.io/3.6.0/guide/index.html)!

This release introduces new features to the Framework. Those features are detailed below.

## GraalVM 22.2.0

Micronaut framework 3.6.0 supports the latest [GraalVM 22.2.0](https://www.graalvm.org/release-notes/22_2/).

## Test Resources

[Micronaut Test Resources](https://micronaut-projects.github.io/micronaut-test-resources/snapshot/guide/#introduction) adds support for managing the external resources needed during development or testing.

It integrates with [Testcontainers](https://www.testcontainers.org/) to provide throwaway containers for testing or local development. The [Test Resources Architecture](https://micronaut-projects.github.io/micronaut-test-resources/snapshot/guide/#architecture) turns Testcontainers into a background service that build tools can interact with. This approach has many advantages (persistent reusable containers, cleaner classpath, fast hot reloads, native testing, etc.).

This initial release provides support for:

- JDBC and R2DBC databases such as MariaDB, MySQL, Oracle Express Edition, PostgreSQL, and Microsoft SQL Server
- Elasticsearch
- Kafka
- MongoDB
- MQTT
- Neo4J
- RabbitMQ
- Redis
- Hashicorp Vault

Moreover, Test Resources is easy to extend if the previous list does not cover your needs.

### Test Resources Gradle Support

You can use Test Resources today by adding the [Micronaut Test Resources Gradle Plugin](https://plugins.gradle.org/plugin/io.micronaut.test-resources).

### Test Resources Maven Support

[Integration with Micronaut Test Resources](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/examples/test-resources.html) is available for Maven Micronaut applications and the [Micronaut Maven Plugin](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/index.html).

You can enable test resources support by setting the property `micronaut.test.resources.enabled`.

## OpenTelemetry

Since its initial release, the Micronaut framework has provided support for distributed tracing via Open Tracing. The latest release of [Micronaut Tracing includes tracing support for OpenTelemetry](https://micronaut-projects.github.io/micronaut-tracing/latest/guide/#opentelemetry).

[OpenTelemetry](https://opentelemetry.io/):

> OpenTelemetry is a collection of tools, APIs, and SDKs. Use it to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software’s performance and behavior.

To get you started, we have written multiple guides:

- [Microservices Distributed Tracing with Google Cloud Trace and the Micronaut Framework](https://guides.micronaut.io/latest/micronaut-cloud-trace-google.html)
- [Use OpenTelemetry with Jaeger and the Micronaut Framework for Microservice distributed tracing](https://guides.micronaut.io/latest/micronaut-microservices-distributed-tracing-jaeger-opentelemetry.html)
- [Use OpenTelemetry with Zipkin and the Micronaut Framework for Microservice distributed tracing](https://guides.micronaut.io/latest/micronaut-microservices-distributed-tracing-zipkin-opentelemetry.html)
- [Use OpenTelemetry with AWS XRay and the Micronaut Framework for Microservice distributed tracing](https://guides.micronaut.io/latest/micronaut-microservices-distributed-tracing-xray.html)
- [Microservices Distributed Tracing with Oracle Cloud OCI and the Micronaut Framework](https://guides.micronaut.io/latest/micronaut-cloud-trace-oci.html)

## Hibernate Reactive

Micronaut Data offered reactive persistence solutions such as [Micronaut Data R2DBC](https://micronaut-projects.github.io/micronaut-data/latest/guide/#r2dbcQuickStart).

We are happy to announce another reactive persistence option for Micronaut Users. Micronaut framework 3.6.0 adds integration with [Hibernate Reactive](https://hibernate.org/reactive/). Hibernate Reactive is based on [Vert.X](https://vertx.io/), and implements the well-known concepts of JPA and Hibernate ORM based on the reactive programming paradigm.

You can use either [Hibernate Reactive](https://micronaut-projects.github.io/micronaut-sql/latest/guide/#hibernate-reactive) by itself with the appropriate Vertx driver or use [Micronaut Data Hibernate Reactive](https://micronaut-projects.github.io/micronaut-data/snapshot/guide/#hibernateReactive), which adds support for the repository pattern on top of Hibernate Reactive, automatically implementing the most common queries for you!

You can generate a Micronaut application with Hibernate Reactive via the Micronaut CLI or [Micronaut Launch.](https://launch.micronaut.io/)

| Database | Micronaut Data Hibernate ReactiveW |
| --- | --- |
| MariaDB | [`data-hibernate-reactive`, `mariadb`](https://micronaut.io/launch?features=mariadb&features=data-hibernate-reactive) |
| MySQL | [`data-hibernate-reactive`, `mysql`](https://micronaut.io/launch?features=mysql&features=data-hibernate-reactive) |
| Oracle | [`data-hibernate-reactive`, `oracle`](https://micronaut.io/launch?features=oracle&features=data-hibernate-reactive) |
| PostgreSQL | [`data-hibernate-reactive`, `postgres`](https://micronaut.io/launch?features=postgres&features=data-hibernate-reactive) |
| SQL Server | [`data-hibernate-reactive`, `sqlserver`](https://micronaut.io/launch?features=sqlserver&features=hibernate-jpa) |

To get you started, read the Hibernate Reactive guides:

- [Access a database with Micronaut Data and Hibernate Reactive](https://guides.micronaut.io/latest/micronaut-data-hibernate-reactive.html)
- [Access a database with JPA and Hibernate Reactive](https://guides.micronaut.io/latest/micronaut-hibernate-reactive.html)

## Micronaut Data

Micronaut Data features other improvements such as:

- Java Records support with MongoDB
- A new [@IgnoreWhere](https://micronaut-projects.github.io/micronaut-data/latest/api/io/micronaut/data/annotation/IgnoreWhere.html) annotation to prevent the generation of additional criteria for a query
- [Type-Safe queries for Java and Kotlin](https://micronaut-projects.github.io/micronaut-data/latest/guide/#typeSafeJava)

## Micronaut Framework and Azure

### Micronaut applications on NubesGen

What is [NubesGen](http://nubesgen.com/)?

> NubesGen is a Web application that generates a cloud infrastructure using Terraform or Bicep: you select easy-to-understand options (“an application server”, “a PostgreSQL database”), and it’ll generate a state-of-the-art configuration that you can import and tweak in your project.

Now you can [create Micronaut Applications with NubesGen](https://docs.nubesgen.com/runtimes/micronaut/).

### Azure Key Vault

Micronaut Azure adds support to [Azure Key Vault](https://micronaut-projects.github.io/micronaut-azure/latest/guide/#azureKeyVault).

> Azure Key Vault is a secure and convenient storage system for API keys, passwords and other sensitive data.

## JOOQ

[Micronaut SQL jOOQ](https://micronaut-projects.github.io/micronaut-sql/latest/guide/#jooq) ships with [jOOQ 3.15](https://www.jooq.org/). First jOOQ release purely reactive, thanks to a native R2DBC integration.

## Don’t apply a @Filter for services

It is possible to exclude services from an HTTP Client Filter with the member `excludeServiceId` of `@Filter.`

```
@Filter(patterns = '/**', excludeServiceId = 'authClient')
public class AppHttpClientFilter implements HttpClientFilter {
```

## Netty runtime

This version upgrades [Netty](https://netty.io/) from 4.1.77 to 4.1.79. Additionally, it contains improvements to the API to [configure the Netty Client Pipeline](https://docs.micronaut.io/snapshot/guide/#nettyClientPipeline) and to [configure the Netty Server Pipeline](https://docs.micronaut.io/snapshot/guide/#nettyServerPipeline).

## Improvements to HtttpClientException

If present a `serviceId` field is populated in the `HttpClientException` and shown in the exception message.

## REST Assured

Micronaut Test adds a small utility module to help you integrate with the [REST-assured](https://rest-assured.io/) library. We wrote a guide to show you [how to use Micronaut Test REST-assured in a Micronaut application](https://guides.micronaut.io/latest/micronaut-rest-assured.html).

## Micronaut Gradle Plugin

The Micronaut Gradle Plugin allows you to define the GraalVM JDK architecture via a configuration extension:

```
 dockerfileNative {
     graalArch.set("amd64")
 }
```

## Starter Features

You can select a new community feature [agora-micronaut-permissions](https://micronaut.io/launch?features=agorapulse-micronaut-permissions) via Micronaut Launch/CLI Features. Agora Micronaut Permissions is a lightweight library to declare object-level permissions in the Micronaut framework built by the [Agorapulse team](https://www.agorapulse.com/).

### CI Configuration Files

You can now generate a Continuous Integration (CI) configuration files to build your Micronaut applications with the following features:

| CI | Feature |
| --- | --- |
| [AWS CodeBuild](https://aws.amazon.com/codebuild/) | [`aws-codebuild-workflow-ci`](https://micronaut.io/launch?features=aws-codebuild-workflow-ci) |
| [Github Actions](https://github.com/features/actions) | [`github-workflow-ci`](https://micronaut.io/launch?features=github-workflow-ci) |
| [Google Cloud Build](https://cloud.google.com/build) | [`google-cloud-workflow-ci`](https://micronaut.io/launch?features=google-cloud-workflow-ci) |
| [Oracle Cloud Devops Build CI](https://docs.oracle.com/en/solutions/build-cicd-pipelines-devops-function/index.html#GUID-55766606-CB77-4879-ACD7-8F530EC2EB3F) | [`oci-devops-build-ci`](https://micronaut.io/launch?features=oci-devops-build-ci) |

## Modules

### Micronaut AWS

New versions of the [Micronaut AWS module](https://micronaut-projects.github.io/micronaut-aws/latest/guide) allow you to override the S3 endpoint URL via configuration. Also, it is now possible to inject a bean of type `ApiGatewayManagementApiClient`.

#### LATEST AWS SDKS

Micronaut AWS updates to:

- Alexa ASK SDK 2.43.7
- AWS Java SDK v1 to 1.12.273
- AWS Java SDK v2 to 2.17.244
- AWS Lambda Events to 3.11.0
- AWS Lambda Java Core to 1.2.1
- AWS Serverless Java Container to 1.8.2
- CDK Lib to 2.35.0

### Cache Dependencies Upgrade

[Micronaut Cache](https://micronaut-projects.github.io/micronaut-cache/latest/guide/) updates to:

- Caffeine to 2.9.3
- Hazelcast to 2.5
- Inifinispan to 12.1.12.Final

### Micronaut Groovy

[Micronaut Groovy](https://micronaut-projects.github.io/micronaut-groovy/latest/guide/) updates to GORM 7.3.0.

### Micronaut GCP

[Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/) updates to:

- Google Cloud Secret Manager 2.3.0
- Google Cloud Core: 2.8.6
- Google Cloud Native Image Support 0.14.1
- Google Auth 1.9.0

## Micronaut Serialization

[Micronaut Serialization](https://micronaut-projects.github.io/micronaut-serialization/latest/guide/) updates to MongoDB BSON 4.7.1 and adds a static method `io.micronaut.serde.ObjectMapper::getDefault()` to get an `ObjectMapper` instance. This method should be invoked when access to the context is impossible.

### Micronaut Servlet

[Micronaut Servlet](https://micronaut-projects.github.io/micronaut-servlet/latest/guide/) updates to:

- Tomcat Embedded Core 9.0.65
- Jetty 9.4.48.v20220622
- Undertow 2.2.18.final

### Micronaut Reactor

[Micronaut Reactor](https://micronaut-projects.github.io/micronaut-reactor/latest/guide/) updates [Project Reactor](https://projectreactor.io/) to 3.4.21.

### Micronaut MongoDB

[Micronaut MongoDB](https://micronaut-projects.github.io/micronaut-mongodb/latest/guide/) updates [Mongo](https://www.mongodb.com/) to 4.71.1. It adds support for Micronaut Serialization and fixes the health indicator and codes for enum types.

### Micronaut Email

[Micronaut Email](https://micronaut-projects.github.io/micronaut-email/latest/guide/) updates [SendGrid](https://sendgrid.com/) Java client to 4.9.3.

### Schema Migration modules

[Micronaut Flyway](https://micronaut-projects.github.io/micronaut-flyway/latest/guide/) updates Flyway to 8.5.13. [Micronaut Liquibase](https://micronaut-projects.github.io/micronaut-liquibase/latest/guide/) updates Liquibase to 4.14.0, and it features improvements to reduce start time when there is no migration to apply.

### MicroStream 1.0.0

The GA release of [Micronaut Microstream 1.0.0](https://github.com/micronaut-projects/micronaut-microstream/releases/tag/v1.0.0) is out! First-class support for [MicroStream](https://microstream.one/) has been added to the Micronaut framework showcasing the creation of an open-source integration between the Micronaut framework and MicroStream. MicroStream is a Micronaut Foundation Silver Corporate Sponsor.

### Micronaut Kafka

Micronaut Kafka ships with [Kafka 2.8.1](https://www.confluent.io/lp/apache-kafka/?utm_medium=sem&utm_source=google&utm_campaign=ch.sem_br.nonbrand_tp.prs_tgt.kafka_mt.xct_rgn.namer_lng.eng_dv.all_con.kafka-general&utm_term=kafka&creative=&device=c&placement=&gclid=CjwKCAjw3K2XBhAzEiwAmmgrAlalM-UQ13Rk2PhED4Mt8KcfPDMFq021IzMUHSK30j0v9STV8ybejhoCi7YQAvD_BwE). Micronaut framework 4.0 will ship with Kafka 3.

### BOM and Gradle Version Catalog

Several modules publish a BOM (Bill of materials) module and/or use a [Gradle Version Catalog](https://docs.gradle.org/current/userguide/platforms.html#sub:version-catalog): [Micronaut Cassandra](https://micronaut-projects.github.io/micronaut-cassandra/latest/guide/), [Micronaut Elasticsearch](https://micronaut-projects.github.io/micronaut-elasticsearch/latest/guide/), [Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/), [Micronaut GraphQL](https://micronaut-projects.github.io/micronaut-graphql/latest/guide/), [Micronaut Jackson XML](https://micronaut-projects.github.io/micronaut-jackson-xml/latest/guide/), [Micronaut Micrometer](https://micronaut-projects.github.io/micronaut-micrometer/latest/guide/), [Micronaut Neo4j](https://micronaut-projects.github.io/micronaut-neo4j/latest/guide/), [Micronaut RabbitMQ](https://micronaut-projects.github.io/micronaut-rabbitmq/latest/guide/), [Micronaut Reactor](https://micronaut-projects.github.io/micronaut-reactor/latest/guide/), [Micronaut Redis](https://micronaut-projects.github.io/micronaut-redis/latest/guide/), [Micronaut RxJava3](https://micronaut-projects.github.io/micronaut-rxjava3/latest/guide/), [Micronaut TOML](https://micronaut-projects.github.io/micronaut-toml/latest/guide/), and [Micronaut Views](https://micronaut-projects.github.io/micronaut-views/latest/guide/).

### TestContainers instead of Redis Embedded Server

The [embedded Redis server that can be used for testing has been changed to only bind to `localhost`](https://micronaut-projects.github.io/micronaut-redis/latest/guide/#breaks). Our recommendation is to use [Testcontainers](https://www.testcontainers.org/) instead. Embedded Redis server will be removed in a future version.

### Binary Static Content with Micronaut Views JTE

[Micronaut Views JTE](https://micronaut-projects.github.io/micronaut-views/latest/guide/#jte) supports binary static content.

## Improvements to OpenAPI

Thank you to community contributor [@altro3](https://github.com/altro3). He has improved the [Micronaut OpenAPI](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/) module with many new features (support `@ExternalDocumentation`, `uri` member for the `@OpenAPIInclude` annotation, …) and many bug fixes.

## COMMUNITY FEEDBACK

We want to thank all the contributors; the community is essential to the Framework’s success! Please try upgrading your existing applications to this new minor release and report any issues you find. See the documentation for further details and use [GitHub](https://github.com/micronaut-projects/micronaut-core/issues) to report any issues.
