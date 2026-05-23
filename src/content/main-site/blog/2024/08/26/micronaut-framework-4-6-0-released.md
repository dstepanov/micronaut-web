---
slug: 2024/08/26/micronaut-framework-4-6-0-released
title: Micronaut Framework 4.6.0 Released!
description: 'Micronaut Framework 4.6.0 updates the Micronaut Platform BOM (Bill of materials) to the following releases: Micronaut Core 4.6.3. Micronaut Core 4.6.x reintroduces the build-time initialization of the metadata built at compilation. Runtimes Micronaut Servlet 4.10.1 updates to Tomcat 10.1.28, Undertow 2.3.15 and Servlet API 6.1.0. Micronaut CRaC 2.4.0 updates to CRaC 1.5.0. Dev & Tests...'
date: '2024-08-26T09:44:31'
modified: '2024-08-26T15:29:40'
sourceUrl: https://micronaut.io/2024/08/26/micronaut-framework-4-6-0-released/
wordpressId: 6984
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2024/08/26/micronaut-framework-4-6-0-released/
---

Micronaut Framework 4.6.0 updates the Micronaut Platform BOM (Bill of materials) to the following releases:

- [Micronaut Core 4.6.3](https://github.com/micronaut-projects/micronaut-core/releases/tag/v4.6.3). Micronaut Core 4.6.x reintroduces the build-time initialization of the metadata built at compilation.

## Runtimes

- [Micronaut Servlet 4.10.1](https://github.com/micronaut-projects/micronaut-servlet/releases/tag/v4.10.1) updates to Tomcat `10.1.28`, Undertow `2.3.15` and Servlet API `6.1.0`.
- [Micronaut CRaC 2.4.0](https://github.com/micronaut-projects/micronaut-crac/releases/tag/v2.4.0) updates to [CRaC 1.5.0](https://github.com/CRaC/org.crac/releases/tag/1.5.0).

## Dev & Tests

- [Micronaut Test 4.5.0](https://github.com/micronaut-projects/micronaut-test/releases/tag/v4.5.0) updates to [Hamcrest 3.0](https://github.com/hamcrest/JavaHamcrest/releases/tag/v3.0), [JUnit5 5.11.0](https://github.com/junit-team/junit5/releases/tag/r5.11.0), and [Mockk v1.13.12](https://github.com/mockk/mockk/releases/tag/1.13.12).

## Reactive Libraries

- [Micronaut Reactor 3.5.0](https://github.com/micronaut-projects/micronaut-reactor/releases/tag/v3.5.0) updates to [Project Reactor BOM 2023.0.9](https://github.com/reactor/reactor/releases/tag/2023.0.9).
- [Micronaut RXJava3 3.5.0](https://github.com/micronaut-projects/micronaut-rxjava3/releases/tag/v3.5.0) updates to [RxJava 3.1.9](https://github.com/ReactiveX/RxJava/releases/tag/v3.1.9).

## Cloud

- [Micronaut AWS 4.7.1](https://github.com/micronaut-projects/micronaut-aws/releases/tag/v4.7.1) adds support for [AWS Lambda Function v2](https://micronaut-projects.github.io/micronaut-aws/4.7.1/guide/#lambdafunctionclient) and it updates to Lambda Java Runtime Interaface client `2.6.0`, AWS lambda `1.2.3`, AWS lambda Events `3.13.0`, AWS SDK v1 `1.12.770`, and AWS SDK v2 `2.27.11`.
- [Micronaut Azure 5.7.1](https://github.com/micronaut-projects/micronaut-azure/releases/tag/v5.7.1) adds support for [Azure Logging](https://micronaut-projects.github.io/micronaut-azure/5.7.0/guide/#azureLogging).
- [Micronaut Oracle Cloud 4.2.0](https://github.com/micronaut-projects/micronaut-oracle-cloud/releases/tag/v4.2.0) updates to [OCI SDK `3.47.0`](https://github.com/oracle/oci-java-sdk/releases/tag/v3.47.0).
- [Micronaut GCP 5.7.1](https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v5.7.1) updates to Google Auth Library OAuth2 HTTP `1.24.1`, Google functions framework API `1.1.0`, Google function invoker `1.3.1`, Google Cloud Core `2.42.0`, Google Cloud PubSub `1.132.1`, and Google Secret Manager `2.47.0`.
- [Micronaut Pulsar 2.4.0](https://github.com/micronaut-projects/micronaut-pulsar/releases/tag/v2.4.0) updates to [Pulsar 3.3.1](https://github.com/apache/pulsar/releases/tag/v3.3.1).
- [Micronaut Tracing](https://github.com/micronaut-projects/micronaut-tracing/releases/tag/v6.8.0) updates to [OpenTelemetry BOM `1.40.0`](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.40.0), [GCP Open-Telemetry Operations Exporters for Java `0.31.0`](https://github.com/GoogleCloudPlatform/opentelemetry-operations-java/releases/tag/v0.31.0), [OpenTelemetry AWS Resource Support & AWS X-Ray Propagator `1.37.0`](https://github.com/open-telemetry/opentelemetry-java-contrib/releases/tag/v1.37.0), [OpenTelemetry Instrumentation for Java `1.33.5`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.33.5), and [OpenTelemetry Semantic Conventions for Java `1.26.0`](https://github.com/open-telemetry/semantic-conventions-java/releases/tag/v1.26.0).

## Database Migration Libraries

- [Micronaut Flyway 7.4.0](https://github.com/micronaut-projects/micronaut-flyway/releases/tag/v7.4.0) updates to [Flyway to v10.17.1](https://github.com/flyway/flyway/releases/tag/flyway-10.17.1).
- [Micronaut Liquibase 6.5.0](https://github.com/micronaut-projects/micronaut-liquibase/releases/tag/v6.5.0) updates to [Liquibase 4.29.1](https://github.com/liquibase/liquibase/releases/tag/v4.29.1).

## Persistence

- [Micronaut SQL 5.8.1](https://github.com/micronaut-projects/micronaut-sql/releases/tag/v5.8.1) changes the [way to disable datasources](https://micronaut-projects.github.io/micronaut-sql/5.8.0/guide/#jdbc-disable), and it updates to Vertx `4.5.9`, mariadb-java-client `3.4.1`, ojdbc `21.15.0.0`, h2 `2.3.232`, jOOQ `3.19.11`, Tomcat JDBC `10.1.28`, mssql-jdbc `12.8.0.jre11`, and JDBI `3.45.3`.
- [Micronaut Data 4.9.0](https://github.com/micronaut-projects/micronaut-data/releases/tag/v4.9.0) contains improvements to the criteria API expressions.
- [Micronaut EclipseStore `1.7.0`](https://github.com/micronaut-projects/micronaut-eclipsestore/releases/tag/v1.7.0) adds [Azure blob storage support](https://micronaut-projects.github.io/micronaut-eclipsestore/1.7.0/guide/#blob).
- [Micronaut Mongo `5.4.0`](https://github.com/micronaut-projects/micronaut-mongodb/releases/tag/v5.4.0) updates to [MongoDB Java Driver `4.11.3`](https://github.com/mongodb/mongo-java-driver/releases/tag/r4.11.3).
- [Micronaut R2DBC `5.6.1`](https://github.com/micronaut-projects/micronaut-r2dbc/releases/tag/v5.6.1) updates to R2DBC MariaDB `1.2`.
- [Micronaut Neo4j `6.7.0`](https://github.com/micronaut-projects/micronaut-neo4j/releases/tag/v6.7.0) updates to [Neo4J `5.23.0`](https://github.com/neo4j/neo4j-java-driver/releases/tag/5.23.0).

## Programming Languages

- [Micronaut Kotlin `4.4.0`](https://github.com/micronaut-projects/micronaut-kotlin/releases/tag/v4.4.0) updates to [Ktor `2.3.12`](https://github.com/ktorio/ktor/releases/tag/2.3.12).

## Messaging

- [Micronaut JMS `4.0.0`](https://github.com/micronaut-projects/micronaut-jms/releases/tag/v4.0.0) updating from `javax` to `jakarta`. This upgrade is a breaking change. It aligns the JMS module with the rest of the framework, which transitioned to `jakarta` in the 4.0.0 release.
- [Micronaut NATS 4.5.0](https://github.com/micronaut-projects/micronaut-nats/releases/tag/v4.5.0) updates to [NATS Java Client to `2.20.1`](https://github.com/nats-io/nats.java/releases/tag/2.20.1).

## Build

- [Micronaut AOT `2.5.0`](https://github.com/micronaut-projects/micronaut-aot/releases/tag/v2.5.0) contains improvements to logback optimizations.
- [Micronaut JSON Schema `1.2.0`](https://github.com/micronaut-projects/micronaut-json-schema/releases/tag/v1.2.0) updates to [JSON Schema Validator `1.5.1`](https://github.com/networknt/json-schema-validator/releases/tag/1.5.1).

## Analytics

- [Micronaut ElasticSearch `5.6.0`](https://github.com/micronaut-projects/micronaut-elasticsearch/releases/tag/v5.6.0) updates to [ElasticSearch `8.15.0`](https://github.com/elastic/elasticsearch/releases/tag/v8.15.0).
- [Micronaut OpenSearch](https://github.com/micronaut-projects/micronaut-opensearch/releases/tag/v1.2.0) updates to [OpenSearch `2.13.0`](https://github.com/opensearch-project/opensearch-java/releases/tag/v2.13.0).
- [Micronaut Micrometer `5.8.0`](https://github.com/micronaut-projects/micronaut-micrometer/releases/tag/v5.8.0) updates to [Micrometer `1.13`](https://github.com/micrometer-metrics/micrometer/wiki/1.13-Migration-Guide).

## Errors

- [Micronaut Problem+JSON `3.5.0`](https://github.com/micronaut-projects/micronaut-problem-json/releases/tag/v3.5.0)

## Configuration

- [Micronaut Logging `1.4.0`](https://github.com/micronaut-projects/micronaut-logging/releases/tag/v1.4.0) updates to [SLF4J 2.0.16](https://www.slf4j.org/news.html#2.0.16), and [Logback 1.5.7](https://github.com/qos-ch/logback/releases/tag/v_1.5.7). [Micronaut TOML `2.4.0`](https://github.com/micronaut-projects/micronaut-toml/releases/tag/v2.4.0)

## API

- [Micronaut JAX-RS `4.6.0`](https://github.com/micronaut-projects/micronaut-jaxrs/releases/tag/v4.6.0) adds support for the [JAX-RS Client API](https://micronaut-projects.github.io/micronaut-jaxrs/4.6.0/guide/#client) backed by the HTTP Client based on Netty.
- [Micronaut GraphQL `4.5.0`](https://github.com/micronaut-projects/micronaut-graphql/releases/tag/v4.5.0) updates to [GraphQL Java `22.2`](https://github.com/graphql-java/graphql-java/releases/tag/v22.2).
- [Micronaut OpenAPI 6.12.0](https://github.com/micronaut-projects/micronaut-openapi/releases/tag/v6.12.0). A lot of improvements contributed by the community.
- [Micronaut gRPC `4.7.0`](https://github.com/micronaut-projects/micronaut-grpc/releases/tag/v4.7.0) updates to [gRPC Java `1.66.0`](https://github.com/grpc/grpc-java/releases/tag/v1.66.0).

## Integrations

- [Micronaut Spring 5.8.0](https://github.com/micronaut-projects/micronaut-spring/releases/tag/v5.8.0) updates to [Spring `6.1.11`](https://github.com/spring-projects/spring-framework/releases/tag/v6.1.11) and [Spring Boot `3.3.2`](https://github.com/spring-projects/spring-boot/releases/tag/v3.3.2).

## Misc

- [Micronaut Security 4.10.0](https://github.com/micronaut-projects/micronaut-security/releases/tag/v4.10.0) updates to Nimbus JOSE-JWT 9.40.
- [Micronaut Cache 5.0.0](https://github.com/micronaut-projects/micronaut-cache/releases/tag/v5.0.0) updates to [Hazelcast `5.3.7`](https://github.com/hazelcast/hazelcast/releases/tag/v5.3.7), and a major version of [Infinispan `15.0.7`](https://github.com/infinispan/infinispan/releases/tag/15.0.7.Final).
- [Micronaut ACME `5.2.0`](https://github.com/micronaut-projects/micronaut-acme/releases/tag/v5.2.0) updates to [ACME Java Client `3.4.0`](https://github.com/shred/acme4j/releases/tag/v3.4.0)

## NEXT STEPS

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
