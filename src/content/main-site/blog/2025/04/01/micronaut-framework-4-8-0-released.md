---
slug: 2025/04/01/micronaut-framework-4-8-0-released
title: Micronaut Framework 4.8.0 Released!
description: 'Micronaut Framework 4.8.0 updates the Micronaut Platform BOM (Bill of materials) to the following releases: Micronaut Core Improvements SourceGen integration Micronaut Core 4.8.x has rewritten some of its internals leveraging Micronaut SourceGen. For example, Micronaut SourceGen powers bytecode generation of internal metadata and expressions. Dependency Injection Debugging Micronaut 4.8.0 allows you to activate dependency injection...'
date: '2025-04-01T17:43:45'
modified: '2025-04-01T17:45:08'
sourceUrl: https://micronaut.io/2025/04/01/micronaut-framework-4-8-0-released/
wordpressId: 7268
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2025/04/01/micronaut-framework-4-8-0-released/
---

Micronaut Framework 4.8.0 updates the [Micronaut Platform BOM (Bill of materials)](https://micronaut-projects.github.io/micronaut-platform/4.8.0/guide/) to the following releases:

## Micronaut Core Improvements

### SourceGen integration

Micronaut Core 4.8.x has rewritten some of its internals leveraging [Micronaut SourceGen](https://micronaut-projects.github.io/micronaut-sourcegen/latest/guide/). For example, Micronaut SourceGen powers bytecode generation of internal metadata and expressions.

## Dependency Injection Debugging

Micronaut 4.8.0 allows you to [activate dependency injection tracing to help you understand what Micronaut is doing at startup and when a particular bean is created](https://docs.micronaut.io/4.8.9/guide/#iocDebugging).

## @Client `definitionType`

 `definitionType`, a new member of the [`@Client` annotation](https://docs.micronaut.io/4.8.9/api/io/micronaut/http/client/annotation/Client.html), helps in scenarios where you want to share an interface between client and server.

## Bean Mappers Merging

[Bean Mappers](https://docs.micronaut.io/4.8.9/guide/#beanMappers) support merging:

```
@Introspected
record ChristmasPresent(
    String packagingColor,
    String type,
    Float weight,
    String greetingCard
) {
}

@Introspected
record PresentPackaging(
    Float weight,
    String color
) {
}

@Introspected
record Present(
    Float weight,
    String type
) {
}
public interface ChristmasMappers {
    @Mapping(from = "packaging.color", to = "packagingColor")
    @Mapping(from = "#{packaging.weight + present.weight}", to = "weight")
    @Mapping(from = "#{'Merry christmas'}", to = "greetingCard")
    ChristmasPresent merge(PresentPackaging packaging, Present present);

}
```

## Liveness Probe for Deadlocked Threads

Thanks to a [community contribution](https://github.com/micronaut-projects/micronaut-core/pull/11388), Micronaut 4.8.0 ships a new liveness probe that uses the `ThreadMXBean` to check for deadlocked threads.

## Improved Kubernetes Integration

- [Micronaut Kubernetes](https://github.com/micronaut-projects/micronaut-kubernetes/releases/tag/v7.0.0) updates to Kubernetes Java Client `22.0.1` and it adds the [Micronaut Kubernetes Client OpenAPI](https://micronaut-projects.github.io/micronaut-kubernetes/latest/guide/#kubernetes-client-openapi) module.

> The Micronaut Kubernetes Client OpenApi is a Kubernetes client that uses Micronaut Netty HTTP Client and the generated APIs and modules from the OpenApi Spec of the official Java client library for Kubernetes.
>
> Advantages of this client over the official Java client library for Kubernetes:
>
> - No extra dependencies needed (OkHttp, Bouncy Castle, Kotlin, etc.)
> - Unified configuration with Micronaut HTTP client
> - Support for plugging in filters
> - Native Image compatibility

## Runtimes

### Update to Jetty 12.

Jetty 11 contains an open [CVE 2024-6763](https://github.com/advisories/GHSA-qh8g-58pp-2wxh). That CVE is only addressed in Jetty 12. Because of that, we did a major upgrade of [Micronaut Servlet](https://github.com/micronaut-projects/micronaut-servlet/releases/tag/v5.2.1) updating to Jetty `12.0.18`, Tomcat `11.0.5`, and Undertow `2.3.18.Final`.

Modules such as `io.micronaut.aws:micronaut-function-aws-test`, `io.micronaut.gcp:micronaut-gcp-function-http-test`, `io.micronaut.azure:micronaut-azure-function-http-test`, and `io.micronaut.oraclecloud:micronaut-oraclecloud-function-http-test` allow you to test and run during development your serverless HTTP triggered function as if you were using a runtime such as netty. We migrated these modules to use a built-in Java HTTP server instead of relying on a Jetty 11 bridge.

### Runtime based on Built-In Java HTTP Server

This release introduces a new [Server runtime](https://micronaut-projects.github.io/micronaut-servlet/latest/guide/#httpServer) based on the [Built-In Java HTTP Server](https://docs.oracle.com/javase/8/docs/jre/api/net/httpserver/spec/com/sun/net/httpserver/HttpServer.html). It is now possible to have a Micronaut Application leveraging the built-in HTTP Server and HTTP Client available in Java without any extra dependencies.

## Tracing, Observation, and Distributed Configuration

[**Micronaut Tracing**](https://github.com/micronaut-projects/micronaut-tracing/releases/tag/v7.0.0) updates to OpenTelemetry `1.48.0`.

[**Micronaut Micrometer**](https://github.com/micronaut-projects/micronaut-micrometer/releases/tag/v5.10.0) adds:

- A new module [which enables instrumenting data sources for gathering traces and metrics around data source calls: connections, queries and result sets](https://micronaut-projects.github.io/micronaut-micrometer/5.10.0/guide/#datasourceObservation).
- `condition`, a new member of the [`@MetricOptions` annotation](https://micronaut-projects.github.io/micronaut-micrometer/5.10.0/api/io/micronaut/configuration/metrics/annotation/MetricOptions.html), allows you to define an evaluated expression that can be used to indicate whether the metric should be processed.

**[Micronaut Discovery Client](https://github.com/micronaut-projects/micronaut-discovery-client/releases/tag/v4.6.0)** allows you to create a [Consult watch](https://micronaut-projects.github.io/micronaut-discovery-client/4.6.0/guide/#_consul_watch) to detect distributed configuration changes.

## Build and Source Generation

### Micronaut Gradle Plugins

Update the [Micronaut Gradle Plugins](https://plugins.gradle.org/u/micronaut) version to use the [latest version](https://github.com/micronaut-projects/micronaut-gradle-plugin/releases) (as of this writing `4.5.1`)

### Generation of Sources from a JSON Schema

- [Micronaut JSON Schema](https://micronaut-projects.github.io/micronaut-json-schema/latest/guide/) integrates with Micronaut Build plugins ([Gradle](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/#_source_generator_from_micronaut_json_schema) and [Maven](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/)) to make possible to generate source code from a JSON Schema specification. For example, checkout the [JSON Schema Micronaut Gradle Plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/#_source_generator_from_micronaut_json_schema).

### Source Generation

- [Micronaut SourceGen](https://micronaut-projects.github.io/micronaut-sourcegen/latest/guide/), a module which exposes a language-neutral API for source code generation, has got a [lot of improvements](https://github.com/micronaut-projects/micronaut-sourcegen/compare/v1.4.1...v1.7.2) since [Micronaut Framework 4.7.0](https://micronaut.io/2024/11/14/micronaut-framework-4-7-0-released/).

## Persistence

- [Micronaut SQL](https://github.com/micronaut-projects/micronaut-sql/releases/tag/v6.1.1) updates ojdbc to `23.7.0.25.01`, MariaDB to `3.5.1`, and MySQL Connector to `9.2.0`, Hikari to `6.2.1`, and Tomcat JDBC to `11.0.5`.
- [Micronaut Coherence 5.x](https://github.com/micronaut-projects/micronaut-coherence/releases/tag/v5.0.0) updates to Coherence `25.03`.

## Database Migration

- [Micronaut Flyway](https://github.com/micronaut-projects/micronaut-flyway/releases/tag/v7.7.0) updates to [Flyway `10.22.0`](https://github.com/flyway/flyway/releases/tag/flyway-10.22.0)
- [Micronaut Liquibase](https://github.com/micronaut-projects/micronaut-liquibase/releases/tag/v6.7.0) updates to [Liquibase `4.31.1`](https://github.com/liquibase/liquibase/releases/tag/v4.31.1).

## Cloud

- [Micronaut AWS](https://github.com/micronaut-projects/micronaut-aws/releases/tag/v4.10.0) updates to AWS lambda Events `3.15.0`, AWS SDK v1 `1.12.782`, and AWS SDK v2 `2.31.9`.
- [Micronaut Azure](https://github.com/micronaut-projects/micronaut-azure/releases/tag/v5.10.0) updates to Azure Cosmos `4.67.0`, and Azure SDK `1.2.32`.
- [Micronaut GCP](https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v5.10.0) updates to Google Auth Library OAuth2 HTTP `1.33.1`, Google Cloud Core `2.53.1`, Google Cloud PubSub `1.137.1`, and Google Secret Manager `2.59.0`.
- [Micronaut Oracle Cloud](https://github.com/micronaut-projects/micronaut-oracle-cloud/releases/tag/v5.0.1) adds a new module to [integrate Kubernetes Client with the OKE and OCI Container Engine service](https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/#okeKubernetesClient), and it updates to OCI SDK `3.60.0`.

## Reactive Libraries

- [Micronaut Reactor](https://github.com/micronaut-projects/micronaut-reactor/releases/tag/v3.7.0) updates to Project Reactor bill of materials (BOM) `2024.0.4`.
- [Micronaut RxJava3](https://github.com/micronaut-projects/micronaut-rxjava3/releases/tag/v3.7.0) update to [RxJava3 `3.1.10`](https://github.com/ReactiveX/RxJava/releases/tag/v3.1.10)

## Persistence

- [Micronaut Redis](https://github.com/micronaut-projects/micronaut-redis/releases/tag/v6.7.0) updates to [Lettuce `6.5.5.RELEASE`](https://github.com/redis/lettuce/releases/tag/6.5.5.RELEASE).
- [Micronaut Mongo](https://github.com/micronaut-projects/micronaut-mongodb/releases/tag/v5.6.0) updates to [Mongo Java Driver `4.11.5`](https://github.com/mongodb/mongo-java-driver/releases/tag/r4.11.5).
- [Micronaut R2DBC](https://github.com/micronaut-projects/micronaut-r2dbc/releases/tag/v6.0.0) updates to r2dbc-io-asyncer-mysql to `1.4.0`, oracle-r2dbc to `1.3.0`, r2dbc-mariadb to `1.3.0`, and r2dbc-postgresql to `1.0.7.RELEASE`.

## Security

- [Micronaut Security](https://github.com/micronaut-projects/micronaut-security/releases/tag/v4.12.0) improves Oracle Cloud Identity Domain OpenID Connect integration and it adds support for the end-session endpoint when using Microsoft login.

## Miscellaneous

- [Micronaut Test](https://github.com/micronaut-projects/micronaut-test/releases/tag/v4.7.0) updates to JUnit5 `5.11.4`, and Mockito `5.15.2`.
- [Micronaut OpenAPI](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/) got [a lot of small improvements](https://github.com/micronaut-projects/micronaut-openapi/compare/v6.13.1...v6.15.0) since Micronaut Platform `4.7.0`.
- [Micronaut ACME](https://github.com/micronaut-projects/micronaut-acme/releases/tag/v5.4.0) updates to [ACME Java Client `3.5.1`](https://github.com/shred/acme4j/releases/tag/v3.5.1).
- [Micronaut Spring](https://github.com/micronaut-projects/micronaut-spring/releases/tag/v5.10.0) adds support for annotations (`@HttpExchange`, `@GetExchange`, `@PostExchange`, `DeleteExchange`, `@PatchExchange`, and `PutExchange`) and it updates to [Spring Boot `3.4.3`](https://spring.io/blog/2025/02/20/spring-boot-3-4-3-available-now) and [Spring `6.2.5`](https://spring.io/blog/2025/03/19/spring-framework-6-2-5-available-now).
- [Micronaut Session](https://github.com/micronaut-projects/micronaut-session/releases/tag/v4.6.0) enables a configurable pattern for the HTTP Session filter.
- [Micronaut gRPC](https://github.com/micronaut-projects/micronaut-grpc/releases/tag/v4.9.0) update to [gRPC `1.69.1`](https://github.com/grpc/grpc-java/releases/tag/v1.69.1)
- [Micronaut Cache](https://github.com/micronaut-projects/micronaut-cache/releases/tag/v5.2.0) updates to [Infinispan](https://infinispan.org/) `15.1.7.Final`.
- [Micronaut Cassandra](https://github.com/micronaut-projects/micronaut-cassandra/releases/tag/v6.7.0) to [Cassandra Java Driver](https://github.com/apache/cassandra-java-driver/releases/tag/4.17.0) `4.17.0`.
- [Micronaut Graal Languages](https://github.com/micronaut-projects/micronaut-graal-languages/releases/tag/v1.1.0) updates to [GraalPy](https://www.graalvm.org/python/) `24.2.0`.
- [Micronaut JMS](https://github.com/micronaut-projects/micronaut-jms/releases/tag/v4.2.0) updates to **activemq-jakarta** to `6.1.6`, and **artemis-jakarta-client** to `2.39.0`.
- [Micronaut Kafka](https://github.com/micronaut-projects/micronaut-kafka/releases/tag/v5.8.0) update to [Apache Kafka `3.9.0`](https://github.com/apache/kafka/releases/tag/3.9.0)
- [Micronaut Kotlin](https://github.com/micronaut-projects/micronaut-kotlin/releases/tag/v4.6.0) updates to [Ktor `2.3.13`](https://github.com/ktorio/ktor/releases/tag/2.3.13)
- [Micronaut logging](https://github.com/micronaut-projects/micronaut-logging/releases/tag/v1.6.1) updates to [Logback `1.5.18`](https://logback.qos.ch/news.html#1.5.18)
- [Micronaut Neo4j](https://github.com/micronaut-projects/micronaut-neo4j/releases/tag/v6.9.0) updates to [Neo4J Java Driver `5.28.4`](https://github.com/neo4j/neo4j-java-driver/releases/tag/5.28.4).
- [Micronaut NATS](https://github.com/micronaut-projects/micronaut-nats/releases/tag/v4.7.0) updates to [NATS Java Client `2.20.6`](https://github.com/nats-io/nats.java/releases/tag/2.20.6)
- [Micronaut OpenSearch](https://github.com/micronaut-projects/micronaut-opensearch/releases/tag/v1.4.0) updates to [OpenSearch `2.21.0`](https://github.com/opensearch-project/opensearch-java/releases/tag/v2.21.0).
- [Micronaut Pulsar](https://github.com/micronaut-projects/micronaut-pulsar/releases/tag/v2.6.0) updates to [Pulsar Client `3.3.5`](https://pulsar.apache.org/docs/3.3.x/client-libraries-java/)
- [Micronaut Views](https://github.com/micronaut-projects/micronaut-views/releases/tag/v5.7.0) updates to Thymeleaf `3.1.3.RELEASE`, Handlebars `4.3.1`, Velocity `2.4.1`, Freemarker `2.3.34`, Rocker `1.4.0`, Soy `2023-09-13`, Pebble `3.23`, JTE `3.1.16`, and JStachio `1.3.6`.

## NEXT STEPS

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
