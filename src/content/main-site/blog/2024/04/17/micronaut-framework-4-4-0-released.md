---
slug: 2024/04/17/micronaut-framework-4-4-0-released
title: Micronaut Framework 4.4.0 Released!
description: Micronaut Core Micronaut Core contains several improvements, including performance optimizations. Moreover, native image binaries of Micronaut framework 4.4.0 should be smaller. In addition, since Micronaut framework 4.4.0, any Project Reactor blocking operations throw an exception when they are done on an event loop thread. This new behaviour will help you identify the controller’s methods, which...
date: '2024-04-17T22:10:07'
modified: '2024-04-17T22:10:07'
sourceUrl: https://micronaut.io/2024/04/17/micronaut-framework-4-4-0-released/
wordpressId: 6905
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2024/04/17/micronaut-framework-4-4-0-released/
---

## Micronaut Core

[Micronaut Core](https://docs.micronaut.io/4.3.3/guide) contains several improvements, including performance optimizations. Moreover, native image binaries of Micronaut framework 4.4.0 should be smaller.

In addition, since Micronaut framework 4.4.0, any Project Reactor blocking operations throw an exception when they are done on an event loop thread. This new behaviour will help you identify the controller’s methods, which you must [annotate with @ExecuteOn](https://docs.micronaut.io/4.3.14/guide/#reactiveServer) to avoid performance loss or dead locks in the event loop.

[Watch the video](https://www.youtube.com/watch?v=W6iztOuulVU)

## Kotlin 1.9.23

This minor release updates to [Kotlin 1.9.23](https://github.com/JetBrains/kotlin/releases/tag/v1.9.23) and KSP 1.9.23-1.0.20.

## New Modules

### Micronaut OpenSearch

[Micronaut OpenSearch](https://micronaut-projects.github.io/micronaut-opensearch/1.0.0/guide/) simplifies integration with [OpenSearch](https://opensearch.org/).

[Watch the video](https://www.youtube.com/watch?v=chEGOssVWgg)

## New Features

### Micronaut Views

Micronaut Views adds the ability to render [Thymeleaf fragments](https://www.thymeleaf.org/doc/tutorials/3.1/usingthymeleaf.html#fragments). Moreover, it adds [support for HTMX](https://micronaut-projects.github.io/micronaut-views/5.2.0/guide/#htmx).

[Watch the video](https://www.youtube.com/watch?v=SiAx06bIoFQ)

### Micronaut Data

[Micronaut Data](https://micronaut-projects.github.io/micronaut-data/latest/guide/) adds a new annotation [@ParameterExpression](https://micronaut-projects.github.io/micronaut-data/4.7.0/api/io/micronaut/data/annotation/ParameterExpression.html):

```
    @Query("INSERT INTO Book(title, pages) VALUES (:title, :pages)")
    @ParameterExpression(name = "title", expression = "#{book.title + 'ABC'}")
    @ParameterExpression(name = "pages", expression = "#{book.pages}")
     void insertCustomExp(Book book);
```

## Cloud

### Micronaut Tracing

[Micronaut Tracing](https://micronaut-projects.github.io/micronaut-tracing/latest/guide/) updates to [OpenTelemetry](https://opentelemetry.io/) version 1.36.0.

The latest binary release of the OpenTelemetry Collector no longer includes exporters for the native Jaeger format. [Jaeger has support for OTLP out of the box](https://opentelemetry.io/blog/2023/jaeger-exporter-collector-migration/). If you had the dependency `io.opentelemetry:opentelemetry-exporter-jaeger` in your application, replace it with `io.opentelemetry:opentelemetry-exporter-otlp`. Also, in your application configuration, replace `otel.tracer.exporter=jaeger` with `otel.tracer.exporter=otlp` and supply the `otlp` endpoint.

If you had in your application the dependency `io.opentelemetry:opentelemetry-sdk-extension-aws` use dependencies from [OpenTelemetry Java Contrib](https://github.com/open-telemetry/opentelemetry-java-contrib) library such `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator` instead.

### Micronaut Kubernetes

[Micronaut Kubernetes](https://micronaut-projects.github.io/micronaut-kubernetes/latest/guide/) updates [Kubernetes & OpenShift Java Client](https://github.com/fabric8io/kubernetes-client) to 6.11.0 and [Kubernetes Java Client](https://github.com/kubernetes-client/java) to 19.0.1.

### Micronaut AWS

[Micronaut AWS](https://micronaut-projects.github.io/micronaut-aws/latest/guide/) updates to:

- [AWS SDK for Java 2.0](https://github.com/aws/aws-sdk-java-v2) 2.24.10
- [AWS SDK for Java 1.0](https://github.com/aws/aws-sdk-java) 1.12.691

### Micronaut Azure

[Micronaut Azure](https://micronaut-projects.github.io/micronaut-azure/latest/guide/) updates to:

- Cosmos 4.57.0
- [Azure SDK](https://learn.microsoft.com/en-us/azure/developer/java/sdk/overview) 1.2.22
- [Library for Azure Java Functions](https://github.com/Azure/azure-functions-java-library) 3.1.0

### Micronaut GCP

[Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/) updates to:

- [Google Cloud Core](https://github.com/googleapis/sdk-platform-java/tree/main/java-core) 2.36.1
- [Google Secret Management Client for Java](https://github.com/googleapis/google-cloud-java/tree/main/java-secretmanager) 2.41.0
- [Google Cloud Pub/Sub Client for Java](https://github.com/googleapis/java-pubsub) 1.128.0
- [Google Auth Library](https://github.com/googleapis/google-auth-library-java) 1.23.0

### Micronaut Oracle Cloud

[Micronaut Oracle Cloud](https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/) adds support to session-based authentication, instance metadata service v2, and it improves OCI configuration file support.

It updates to [fn](https://github.com/fnproject/fdk-java/tree/master?tab=readme-ov-file) 1.0.186.

### Micronaut Object Storage

[Micronaut Object Storage](https://micronaut-projects.github.io/micronaut-object-storage/latest/guide/) updates to GCP Cloud Client Libraries 26.35.0.

## Data Access

### Micronaut SQL

[Micronaut SQL](https://micronaut-projects.github.io/micronaut-sql/latest/guide/) updates to:

- [Tomcat JDBC](https://tomcat.apache.org/tomcat-10.1-doc/jdbc-pool.html) 10.1.20
- MySQL Driver 8.0.33
- [MySQL](https://www.mysql.com/) Connector 8.3.0
- [MariaDB](https://mariadb.org/) 3.3.3
- PostgreSQL 42.7.3
- MSSQL 12.6.1.jre11
- JDBI 3.45.1
- [Hibernate Reactive](https://hibernate.org/reactive/) 2.2.2.Final
- [Hibernate](https://hibernate.org/) 6.4.4
- [jOOQ](https://www.jooq.org/) 3.19.7
- [Vert.x](https://vertx.io/) 4.5.7
- OJDBC 21.13.0.0
- JDBI 3.45.1

### Micronaut EclipseStore

[Micronaut EclipseStore](https://micronaut-projects.github.io/micronaut-eclipsestore/snapshot/guide/) adds [support for Cache](https://micronaut-projects.github.io/micronaut-eclipsestore/1.4.0/guide/#cache). Moreover, it updates to [EclipseStore 1.2.0.](https://microstream.one/blog/article/eclipsestore-1-2-is-available/)

### Micronaut Microstream

[Micronaut MicroStream](https://micronaut-projects.github.io/micronaut-microstream/snapshot/guide/) updates to MicroStream 08.01.02-MS-GA.

### Micronaut Redis

[Micronaut Redis](https://micronaut-projects.github.io/micronaut-redis/latest/guide/) updates to [Lettuce](https://github.com/redis/lettuce) 6.3.2.

### Micronaut R2DBC

[Micronaut R2DBC](https://micronaut-projects.github.io/micronaut-r2dbc/latest/guide/) updates to r2dbc-mysql v1.1.2.

### Micronaut Neo4J

[Micronaut Neo4j](https://micronaut-projects.github.io/micronaut-neo4j/latest/guide/) updates to Neo4J Java driver and Neo4J Harness 5.17.0. Neo4J Harness has been deprecated and will be removed in Micronaut framework 5. We recommend using Testcontainers Neo4j instead.

## Database Migration

### Micronaut Flyway

[Micronaut Flyway](https://micronaut-projects.github.io/micronaut-flyway/latest/guide/index.html) updates to Flyway 10.10.0, and it [improves the usage of custom configuration](https://micronaut-projects.github.io/micronaut-flyway/7.2.0/guide/#_configuring_custom_flyway_type_implementations).

### Micronaut Liquibase

[Micronaut Liquibase](https://micronaut-projects.github.io/micronaut-liquibase/latest/guide/) updates to Liquibase 4.26.0.

## Messaging

### Micronaut NATS

[Micronaut NATS](https://micronaut-projects.github.io/micronaut-nats/latest/guide/) updates to [jnats](https://github.com/nats-io/nats.java) 2.17.4.

### Micronaut Kafka

[Micronaut Kafka](https://micronaut-projects.github.io/micronaut-kafka/latest/guide/) updates to Kafka `3.7.0` and improvements to Kafka Errors and conditional retries.

### Micronaut HiveMQ

[Micronaut MQTT](https://micronaut-projects.github.io/micronaut-mqtt/latest/guide/) improves the SSL configuration support for HiveMQ client.

### Micronaut JMS

[Micronaut JMS](https://micronaut-projects.github.io/micronaut-jms/latest/guide/) adds the [@MessageTTL](https://micronaut-projects.github.io/micronaut-jms/3.4.0/api/io/micronaut/jms/annotations/MessageTTL.html) annotation that can be applied to a method argument to indicate that the argument is bound from the JMS TTL attribute.

### Micronaut Pulsar

[Micronaut Pulsar](https://micronaut-projects.github.io/micronaut-pulsar/latest/guide/) updates the [Pulsar Java Client](https://pulsar.apache.org/docs/next/client-libraries-java/) to 3.2.2.

## Languages

### Micronaut Kotlin

[Micronaut Kotlin](https://github.com/micronaut-projects/micronaut-kotlin/releases/tag/v4.1.0) updates to [Ktor](https://ktor.io) 2.3.9.

## Testing

### Micronaut Test

[Micronaut Test](https://micronaut-projects.github.io/micronaut-test/latest/guide/) updates to:

- [JUnit 5](https://junit.org/junit5/) 5.10.2
- [KoTest](https://kotest.io/) 5.8.1
- [Mockk](https://mockk.io/) 1.13.10
- [AssertJ](https://github.com/assertj/assertj) 3.25.3
- [Mockito](https://site.mockito.org/) 5.11.0
- [Rest Assured](https://rest-assured.io/) 5.4.0

### Micronaut Test Resources

[Micronaut Test Resources](https://micronaut-projects.github.io/micronaut-test-resources/latest/guide/) adds support for OpenSearch.

## Runtimes

### Micronaut Servlet

[Micronaut Servlet](https://micronaut-projects.github.io/micronaut-servlet/latest/guide/) updates to:

- [Jetty](https://eclipse.dev/jetty/) 11.0.20
- [Tomcat](https://tomcat.apache.org/) 10.1.20
- [Undertow](https://undertow.io/) 2.3.12.Final

## API

### Micronaut gRPC

[Micronaut gRPC](https://micronaut-projects.github.io/micronaut-grpc/latest/guide/) updates to:

- [gRPC](https://github.com/grpc/grpc-java) 1.62.2
- `protobuf` 3.25.3

### Micronaut GraphQL

[Micronaut GraphQL](https://micronaut-projects.github.io/micronaut-graphql/latest/guide/) updates to [GraphQL Java](https://github.com/graphql-java/graphql-java) version 21.5.

## Analytics

### Micronaut Elasticsearch

[Micronaut](https://micronaut-projects.github.io/micronaut-elasticsearch/latest/guide/) Elasticsearch updates to Elasticsearch 8.13.0.

### Micronaut Micrometer

[Micronaut Micrometer](https://github.com/micronaut-projects/micronaut-micrometer/releases/tag/v4.1.0) updates to Micrometer 1.12.4.

## Reactive Libraries

### Micronaut Reactor

[Micronaut Reactor](https://micronaut-projects.github.io/micronaut-reactor/3.3.0/guide/) updates to [Project Reactor](https://projectreactor.io/) 2023.0.4.

### Other

### Micronaut Email

[Micronaut Email](https://micronaut-projects.github.io/micronaut-email/latest/guide/) updates to:

- [Jakarta Mail API](https://jakartaee.github.io/mail-api/) 2.1.3
- Angus Mail 2.0.3
- [Sendgrid](https://github.com/sendgrid/sendgrid-java) 4.10.2

### Micronaut Logging

- [Slf4j](https://slf4j.org/) 2.0.12
- [Log4j2](https://logging.apache.org/log4j/2.x/) 2.23.1
- [Logback](https://logback.qos.ch/) 1.5.3

### Micronaut Cache

[Micronaut Cache](https://micronaut-projects.github.io/micronaut-cache/latest/guide/) updates to:

- [Infinispan](https://infinispan.org/) 14.0.27
- [Hazelcast](http://hazelcast/) 5.3.7

### Micronaut Serialization

[Micronaut Serialization](https://micronaut-projects.github.io/micronaut-test/latest/guide/) adds support for renaming constructor arguments and choosing a different constructor via mixins.

### Micronaut Spring

[Micronaut Spring](https://micronaut-projects.github.io/micronaut-spring/latest/guide/) updates to:

- [Spring Boot](https://spring.io/projects/spring-boot) 3.2.4.
- [Spring Framework](https://spring.io/projects/spring-framework) 6.1.6

It supports mapping `org.springframework.web.bind.annotation.RequestPart` to `io.micronaut.http.annotation.Part`

### Micronaut ACME

[Micronaut ACME](https://micronaut-projects.github.io/micronaut-acme/latest/guide/) updates to [acme4j-client](https://github.com/shred/acme4j) 3.2.1. Micronaut Security.

[Micronaut Security](https://micronaut-projects.github.io/micronaut-security/latest/guide/) adds the locale and host to [security events](https://micronaut-projects.github.io/micronaut-security/4.6.9/guide/#securityEvents).

## NEXT STEPS

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
