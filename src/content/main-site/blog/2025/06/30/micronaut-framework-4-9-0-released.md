---
slug: 2025/06/30/micronaut-framework-4-9-0-released
title: Micronaut Framework 4.9.0 Released!
description: The Micronaut Foundation is excited to announce the release of Micronaut framework 4.9.0! Micronaut Core Improvements Netty 4.2.2 Micronaut 4.9.0 updates to Netty 4.2. This Netty release changes the default buffer allocator, which may affect application performance. Event loop Carrier micronaut-http-server-netty 4.9.0 introduces an experimental mode to run virtual threads on the Netty event loop....
date: '2025-06-30T12:36:32'
modified: '2025-06-30T12:48:49'
sourceUrl: https://micronaut.io/2025/06/30/micronaut-framework-4-9-0-released/
wordpressId: 7306
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2025/06/30/micronaut-framework-4-9-0-released/
---

The Micronaut Foundation is excited to announce the release of [Micronaut framework 4.9.0](https://github.com/micronaut-projects/micronaut-platform/releases/tag/v4.9.0)!

## Micronaut Core Improvements

### Netty 4.2.2

Micronaut 4.9.0 updates to [Netty 4.2](https://netty.io/news/2025/06/05/4-2-2.html). This Netty release changes the default buffer allocator, which may affect application performance.

### Event loop Carrier

 `micronaut-http-server-netty` 4.9.0 introduces [an experimental mode to run virtual threads on the Netty event loop](https://docs.micronaut.io/4.9.5/guide/index.html#_event_loop_carrier). This can lead to more predictable performance when migrating from async code to virtual threads. Read “[Transitioning to virtual threads using the Micronaut Loom Carrier](https://micronaut.io/2025/06/30/transitioning-to-virtual-threads-using-the-micronaut-loom-carrier/)“.

### @ClassImport

[`@ClassImport`](https://docs.micronaut.io/4.9.5/api/io/micronaut/context/annotation/ClassImport.html) annotation allows to [process already compiled classes as if they were ordinary non-compiled classes](https://docs.micronaut.io/4.9.5/guide/index.html#classImport).

### `@Mixin`

It’s possible to define a [Mixin class](https://docs.micronaut.io/4.9.5/guide/index.html#mixin) by annotating it with [`@Mixin`](https://docs.micronaut.io/4.9.5/api/io/micronaut/context/annotation/Mixin.html) and specifying which class does it reference.

Mixins only modify the Micronaut annotations metadata model. Original classes are not modified in any way. Mixins are currently supported only in Java.

### HTTP/3

If you were using the [experimental HTTP/3 support](https://docs.micronaut.io/4.9.5/guide/index.html#http3Server) you need to replace the dependency `io.netty.incubator:netty-incubator-codec-http3` with `io.micronaut:micronaut-http-netty-http3`.

### Graceful Shutdown

This release includes a [Graceful shutdown API](https://docs.micronaut.io/4.9.5/guide/index.html#gracefulShutdown). A graceful shutdown allows you to stop accepting new work and finish in-progress tasks.

### Cache Control API

A fluid API [CacheControl](https://docs.micronaut.io/4.9.5/api/io/micronaut/http/cachecontrol/CacheControl.html) permits you to populate the [HTTP Cache-Control](https://developer.mozilla.org/docs/Web/HTTP/Reference/Headers/Cache-Control) header in an HTTP Response easily.

### KSP 2

This release supports [KSP](https://github.com/google/ksp) 2 (starting from the version 2.0.2) and it’s tested to work with Kotlin 2.

## Jakarta Data

[Micronaut Data provides implementation support for the Jakarta Data](https://micronaut-projects.github.io/micronaut-data/latest/guide/#jakartaData) 1.0 specification, allowing developers to leverage [Jakarta Data’s standardized approach](https://jakarta.ee/specifications/data/1.0/jakarta-data-1.0) to data access within Micronaut applications.

## Protocol Buffers Json Support

[Micronaut gRPC](https://github.com/micronaut-projects/micronaut-grpc/releases/tag/v4.11.0), thanks to a community contribution, adds a [new module](https://micronaut-projects.github.io/micronaut-grpc/latest/guide/#protocolBuffersJsonSupport) that adds the ability to send JSON-serialized messages via a POST HTTP 1.1 call.

## ProjectGen

[Micronaut ProjectGen](https://micronaut-projects.github.io/micronaut-projectgen/latest/guide/), a new experimental module, provides an API for generating JVM Projects (Gradle or Maven).

## Persistence

- [Micronaut SQL](https://github.com/micronaut-projects/micronaut-sql/releases/tag/v6.2.0) updates ojdbc to `23.8.0.25.04`, MariaDB to `3.5.3`, and MySQL Connector to `9.2.0`, Hikari to `6.3.0`, and Tomcat JDBC to `11.0.7`.
- [Micronaut Coherence](https://github.com/micronaut-projects/micronaut-coherence/releases/tag/v5.0.6) updates to Coherence `25.03.1`.

## Cloud

- [Micronaut AWS](https://github.com/micronaut-projects/micronaut-aws/releases/tag/v4.11.0) updates to AWS SDK v1 `1.12.787`, and AWS SDK v2 `2.31.66`.
- [Micronaut Azure](https://github.com/micronaut-projects/micronaut-azure/releases/tag/v5.11.0) updates to Azure Cosmos `4.71.0`, and Azure SDK `1.2.35`. Moreover, it adds a [new module `micronaut-azure-tracing`](https://micronaut-projects.github.io/micronaut-azure/latest/guide/#azureTracing) to use [Azure Monitor Tracing](https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/overview).
- [Micronaut GCP](https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v5.12.0) updates to Google Auth Library OAuth2 HTTP `1.37.0`, Google Cloud Core `2.57.1`, Google Cloud PubSub `1.140.1`, and Google Secret Manager `2.64.0`.
- [Micronaut Oracle Cloud](https://github.com/micronaut-projects/micronaut-oracle-cloud/releases/tag/v5.2.0) updates to OCI SDK `3.67.2`

## Database Migration

- [Micronaut Liquibase](https://github.com/micronaut-projects/micronaut-liquibase/releases/tag/v6.8.0) updates to [Liquibase `4.32.0`](https://github.com/liquibase/liquibase/releases/tag/v4.32.0).

## Reactive Libraries

- [Micronaut Reactor](https://github.com/micronaut-projects/micronaut-reactor/releases/tag/v3.8.0) updates to Project Reactor bill of materials (BOM) `2024.0.7`.

## Security

- [Micronaut Security](https://github.com/micronaut-projects/micronaut-security/releases/tag/v4.13.0) updates to [Nimbus JOSE + JWT](https://connect2id.com/products/nimbus-jose-jwt) `10.3`.

## Miscellaneous

- [Micronaut Langchain4J](https://micronaut-projects.github.io/micronaut-langchain4j/latest/guide/) updates to the first stable release of [Langchain4j](https://docs.langchain4j.dev/).
- [Micronaut Picocli](https://micronaut-projects.github.io/micronaut-picocli/latest/guide/) updates to [Picocli](https://picocli.info/) 4.7.7
- [Micronaut MQTT](https://micronaut-projects.github.io/micronaut-mqtt/latest/guide) updates to [HiveMQ MQTT Client](https://github.com/hivemq/hivemq-mqtt-client) `1.3.7`.
- [Micronaut Test](https://github.com/micronaut-projects/micronaut-test/releases/tag/v4.8.0) updates to JUnit5 `5.12.2`, Mockito `5.18.0`, and [REST-assured](https://rest-assured.io/) 5.5.5.
- [Micronaut Spring](https://github.com/micronaut-projects/micronaut-spring/releases/tag/v5.11.0) updates to [Spring Boot `3.5.0`](https://spring.io/blog/2025/05/22/spring-boot-3-5-0-available-now) and [Spring `6.2.8`](https://spring.io/blog/2025/06/12/spring-framework-6-1-21-and-6-2-8-releases-fix-cve-2025-41234).
- [Micronaut Cache](https://github.com/micronaut-projects/micronaut-cache/releases/tag/v5.3.0) updates to [Infinispan](https://infinispan.org/) `15.2.4.Final`, and Caffeine 3.2.1.
- [Micronaut logging](https://github.com/micronaut-projects/micronaut-logging/releases/tag/v1.7.0) updates to [Logback `1.5.18`](https://logback.qos.ch/news.html#1.5.18) and SLF4J 2.0.17.
- [Micronaut Views](https://github.com/micronaut-projects/micronaut-views/releases/tag/v5.8.0) updates to Pebble `3.24`, JTE `3.2.1`, and JStachio `1.3.7`.
- [Micronaut NATS](https://github.com/micronaut-projects/micronaut-nats/releases/tag/v4.8.0) updates to [NATS Java Client `2.21.2`](https://github.com/nats-io/nats.java/releases/tag/2.21.2)
- [Micronaut JMS](https://github.com/micronaut-projects/micronaut-jms/releases/tag/v4.3.0) updates to **activemq-jakarta** to `6.1.6`, and **artemis-jakarta-client** to `2.41.0`.
- [Micronaut Neo4j](https://github.com/micronaut-projects/micronaut-neo4j/releases/tag/v6.10.0) updates to [Neo4J Java Driver `5.28.5`](https://github.com/neo4j/neo4j-java-driver/releases/tag/5.28.5).
- [Micronaut Graal Languages](https://github.com/micronaut-projects/micronaut-graal-languages/releases/tag/v1.2.0) updates to [GraalPy](https://www.graalvm.org/python/) `24.2.1`.
- [Micronaut OpenSearch](https://github.com/micronaut-projects/micronaut-opensearch/releases/tag/v1.5.0) updates to [OpenSearch `2.24.0`](https://github.com/opensearch-project/opensearch-java/releases/tag/v2.24.0).

## NEXT STEPS

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
