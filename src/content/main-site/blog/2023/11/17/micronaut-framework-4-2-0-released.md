---
slug: 2023/11/17/micronaut-framework-4-2-0-released
title: Micronaut Framework 4.2.0 Released!
description: Micronaut Core Micronaut Core 4.2.0 contains several improvements including performance optimizations, enhancements to the Kotlin Symbol Processing (KSP) integration, and it updates to Netty 4.1.101. GraalVM Micronaut Framework 4.2.0 supports using the –strict-image-heap flag and associated behavior, which will be the default in the next version of GraalVM Native Image. Java 21 You can select...
date: '2023-11-17T18:08:16'
modified: '2023-11-17T18:24:23'
sourceUrl: https://micronaut.io/2023/11/17/micronaut-framework-4-2-0-released/
wordpressId: 6770
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2023/11/17/micronaut-framework-4-2-0-released/
---

## Micronaut Core

[Micronaut Core 4.2.0](https://github.com/micronaut-projects/micronaut-core/releases/tag/v4.2.0) contains several improvements including performance optimizations, enhancements to the [Kotlin Symbol Processing (KSP)](https://docs.micronaut.io/latest/guide/#ksp) integration, and it updates to [Netty](https://netty.io/) 4.1.101.

## GraalVM

Micronaut Framework 4.2.0 supports using the `--strict-image-heap` flag and associated behavior, which will be the default in the next version of GraalVM Native Image.

## Java 21

You can select [Java 21 in Micronaut Launch or CLI](https://micronaut.io/launch?javaVersion=JDK_21).

## Gradle Kotlin DSL

You can build Micronaut applications with [Maven](https://maven.apache.org/) or [Gradle](https://gradle.org/). For Gradle, we support both [Groovy and Kotlin DSL](https://docs.gradle.org/current/dsl/index.html). Since Micronaut Framework 4.2.0, new applications default to [Gradle with Kotlin DSL](https://docs.gradle.org/current/userguide/kotlin_dsl.html). Gradle Kotlin DSL provides a better IDE integration. Moreover, Kotlin DSL is also the default for Gradle.

## Kotlin 1.9.20

This minor release updates to [Kotlin 1.9.20](https://github.com/JetBrains/kotlin/releases/tag/v1.9.20) and KSP 1.9.20-1.0.13.

## Micronaut Gradle Plugin

If you use the [Micronaut Gradle Plugins](https://plugins.gradle.org/u/micronaut), update to version 4.2.0 and [Gradle 8.4](https://docs.gradle.org/8.4/release-notes.html).

## Micronaut Data

[Micronaut Data](https://github.com/micronaut-projects/micronaut-data/releases/tag/v4.2.0) adds:

- [Procedure](https://micronaut-projects.github.io/micronaut-data/latest/guide/#hibernateProcedures) invocations in repositories.
- Possibility to have associations (JOINs) in DTOs.
- [Support for inserts, updates and deletes with `Returning` clause in repositories](https://micronaut-projects.github.io/micronaut-data/latest/guide/#querying).
- Micronaut Data MongoDB: [Support for arrayFilters](https://www.mongodb.com/docs/manual/reference/operator/update/positional-filtered/).
- New coroutine variations of connection / transaction operations: `io.micronaut.data.connection.kotlin.CoroutineConnectionOperations`, `io.micronaut.transaction.kotlin.CoroutineTransactionOperations`.

  - You should use the latter for Kotlin suspended methods.
- R2DBC: [New connection status callback](https://micronaut-projects.github.io/micronaut-data/latest/api/io/micronaut/data/connection/reactive/ReactiveConnectionSynchronization.html).

## Micronaut Kotlin

[Micronaut Kotlin](https://github.com/micronaut-projects/micronaut-kotlin/releases/tag/v4.1.0) updates to [Ktor](https://ktor.io/) 2.3.5.

## Micronaut Views

[Micronaut Views](https://github.com/micronaut-projects/micronaut-views/releases/tag/v4.1.0) adds:

- Support for [JStachio](https://jstach.io/jstachio/)
- [FieldsetGenerator](https://micronaut-projects.github.io/micronaut-views/4.1.0/guide/index.html#fieldset) API which simplifies the generation of an HTML Fieldset representation for a given type or instance. It leverages the [**introspection builder support**](https://docs.micronaut.io/latest/guide/#introspectionBuilders). This feature simplifies the development of server-side HTML applications with Micronaut Views.

Additionally, Micronaut Views updates:

- [jte](https://jte.gg/) to 3.1.4
- [Thymeleaf](https://www.thymeleaf.org/) to 3.1.2
- [Rocker](https://github.com/fizzed/rocker) to 1.4.0

## Micronaut Test

The latest version of [Micronaut Test](https://micronaut-projects.github.io/micronaut-test/latest/guide/) adds the [`@Sql` annotation](https://micronaut-projects.github.io/micronaut-test/latest/guide/#sql). The `@Sql` annotation allows you to run SQL statements before running a test. For example, to load seed data.

## Micronaut Tracing

[Micronaut Tracing](https://micronaut-projects.github.io/micronaut-tracing/latest/guide/) updates to [OpenTelemetry](https://opentelemetry.io/) version 1.31.0.

## Micronaut Micrometer

[Micronaut Micrometer](https://github.com/micronaut-projects/micronaut-micrometer/releases/tag/v4.1.0) adds an [observation module](https://micronaut-projects.github.io/micronaut-micrometer/latest/guide/#observation) that simplifies the process of instrumenting your code for gathering traces and metrics.

## Micronaut OpenAPI

[Micronaut OpenAPI](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/) adds the ability to [convert to Asciidoc](https://micronaut-projects.github.io/micronaut-openapi/5.2.0/guide/#convertToAdoc).

## Micronaut GCP

The latest version of [Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/) supports [receiving and returning reactive types for Pub/Sub](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#subscriberReactive) and updates to:

- Google Cloud Core 2.27.0
- Google Cloud Secrets Manager 2.30.0
- Google Cloud Pub/Sub 1.125.11

## Micronaut Serialization

[Micronaut Serialization](https://github.com/micronaut-projects/micronaut-serialization/releases/tag/v2.3.0) continues to improve with enhancements for `ByteBuffer`, `JsonRootName`, `JsonIgnoreProperties`, and `JsonTypeInfo`.

## Micronaut Kafka

[Micronaut Kafka](https://micronaut-projects.github.io/micronaut-kafka/latest/guide/) adds improvements around [Batch Processing](https://micronaut-projects.github.io/micronaut-kafka/latest/guide/#kafkaListenerBatch), and it updates to Kafka 3.6.0.

## Micronaut JAX-RS

​​[Micronaut JAX-RS](https://github.com/micronaut-projects/micronaut-jaxrs/releases/tag/v4.1.0) adds support for [JAX-RS ResourceInfo](https://tomee.apache.org/jakartaee-9.0/javadoc/index.html?jakarta/ws/rs/container/ResourceInfo.html).

## Micronaut CRaC

With the latest version of [Micronaut CRaC](https://micronaut-projects.github.io/micronaut-crac/latest/guide/), if the [info endpoint](https://docs.micronaut.io/latest/guide/#infoEndpoint) is enabled, then a `crac` section will be automatically added, which shows the restore time and uptime since restore, both in milliseconds and taken from the [CRaCMXBean](https://crac.github.io/openjdk-builds/javadoc/api/jdk.management/jdk/crac/management/CRaCMXBean.html) provided by the CRaC API.

Additionally, Micronaut CRaC updates to [CRaC 1.4.0](https://github.com/CRaC/org.crac/releases/tag/1.4.0).

## Micronaut RabbitMQ

[Micronaut RabbitMQ](https://micronaut-projects.github.io/micronaut-rabbitmq/latest/guide/) updates to `amqp-client` version 5.20.0 and improvements around automatic recovery.

## Micronaut Redis

[Micronaut Redis](https://micronaut-projects.github.io/micronaut-redis/latest/guide/) updates to `lettuce-core` version 6.2.5.

## Micronaut Servlet

[Micronaut Servlet](https://micronaut-projects.github.io/micronaut-servlet/latest/guide/) updates to:

- Jetty 11.0.18
- Undertow 2.3.10
- Tomcat 10.1.15

## Micronaut Cache

[Micronaut Cache](https://micronaut-projects.github.io/micronaut-cache/latest/guide/) adds the ability to view a [cache value in the caches endpoint](https://github.com/micronaut-projects/micronaut-cache/issues/618), and it supports Hazelcast config override via XML or YAML.

Additionally, Micronaut Cache updates to:

- [Infinispan](https://infinispan.org/) 14.0.20
- [Caffeine](https://github.com/ben-manes/caffeine) 3.1.18
- [Hazelcast](http://hazelcast/) 5.3.5

## Micronaut Azure

[Micronaut Azure](https://micronaut-projects.github.io/micronaut-azure/latest/guide/) updates to:

- Cosmos 4.52.0
- Azure SDK 1.2.18

## Micronaut Security

[Micronaut Security](https://micronaut-projects.github.io/micronaut-security/latest/guide/) updates [Nimbus JOSE + JWT](https://connect2id.com/products/nimbus-jose-jwt) to 9.37.1.

## Micronaut Pulsar

[Micronaut Pulsar](https://micronaut-projects.github.io/micronaut-pulsar/latest/guide/) updates `pulsar-client-original` to 3.1.1.

## Micronaut JMS

[Micronaut JMS](https://micronaut-projects.github.io/micronaut-jms/latest/guide/) updates to `activemq` 5.1.8.3 and AWS SQS 2.21.15.

## Micronaut Kubernetes

[Micronaut Kubernetes](https://micronaut-projects.github.io/micronaut-kubernetes/latest/guide/) updates to `kubernetes-client` 6.9.1.

## Micronaut ElasticSearch

[Micronaut ElasticSearch](https://micronaut-projects.github.io/micronaut-elasticsearch/latest/guide/) updates to ElasticSearch 8.10.4.

## Micronaut Cassandra

[Micronaut Cassandra](https://micronaut-projects.github.io/micronaut-cassandra/latest/guide/) updates to datastax Cassandra driver 4.17.0 and integrates with Micronaut Micrometer.

## Micronaut Liquibase

[Micronaut Liquibase](https://micronaut-projects.github.io/micronaut-liquibase/latest/guide/) updates to Liquibase 4.24.0.

## Micronaut gRPC

[Micronaut gRPC](https://micronaut-projects.github.io/micronaut-grpc/latest/guide/) updates to `grpc` 1.59.0 and `protobuf` 3.25.0.

## Micronaut MongoDB

[Micronaut MongoDB](https://micronaut-projects.github.io/micronaut-mongodb/latest/guide/) updates to Mongo 4.10.2.

## Micronaut SQL

[Micronaut SQL](https://micronaut-projects.github.io/micronaut-sql/latest/guide/) updates to:

- Hibernate 6.2.7
- Hibernate Reactive 2.0.6
- jOOQ 3.18.7
- JDBI 3.41.3
- OJDBC 21.11.0.0
- Jasync 2.2.4
- Hikari 5.1.0
- Tomcat JDBC 10.1.15
- H2 2.2.224
- MySQL8.2.0
- MariaDB 3.2.0

## Micronaut R2DBC

[Micronaut R2DBC](https://micronaut-projects.github.io/micronaut-r2dbc/latest/guide/) updates to:

- r2dbc-pool 1.0.2
- r2dbc-mysql 1.0.5
- r2dbc-postgresql 1.0.2
- r2dbc-mssql 1.0.2

## Micronaut Email

[Micronaut Email](https://micronaut-projects.github.io/micronaut-email/latest/guide/) adds the `Contact::getNameAddress` method, and it updates to:

- mailjet-client 5.2.5
- postmark 1.11.0

## Micronaut Neo4J

[Micronaut Neo4j](https://micronaut-projects.github.io/micronaut-neo4j/latest/guide/) updates to Neo4J Java driver 5.14.0 and Neo4J Harness 5.13.0.

## Micronaut GraphQL

[Micronaut GraphQL](https://micronaut-projects.github.io/micronaut-graphql/latest/guide/) updates to [GraphiQL](https://github.com/graphql/graphiql) 3.0.6.

## Micronaut Spring

[Micronaut Spring](https://micronaut-projects.github.io/micronaut-spring/latest/guide/) updates to Spring Boot 3.1.5.

## Micronaut MQTT

[Micronaut MQTT](https://micronaut-projects.github.io/micronaut-mqtt/latest/guide/) updates to HiveMQ MQTT Client 1.3.3.

## Micronaut NATS

[Micronaut NATS](https://micronaut-projects.github.io/micronaut-nats/latest/guide/) updates to [jnats](https://github.com/nats-io/nats.java) 2.17.1.

## Micronaut Test Resources

[Micronaut Test Resources](https://micronaut-projects.github.io/micronaut-test-resources/2.2.0/guide/) adds an optional [control panel](https://micronaut-projects.github.io/micronaut-test-resources/2.2.0/guide/#modules-control-panel) to monitor containers and resolved properties.

## NEXT STEPS

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
