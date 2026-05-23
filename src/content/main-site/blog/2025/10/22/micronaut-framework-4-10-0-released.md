---
slug: 2025/10/22/micronaut-framework-4-10-0-released
title: Micronaut Framework 4.10.0 Released!
description: 'The Micronaut Foundation is excited to announce the release of Micronaut framework 4.10.0! AI Micronaut MCP, a new module, enables you to develop Model MCP (Model Context Protocol) servers easily. Micronaut Langchain4j updates to LangChain4J 1.5.0 with support for the ChatMemory API. Micronaut Core Micronaut Core 4.10.7 enables: Modification of class annotations with a Mixin...'
date: '2025-10-22T11:24:14'
modified: '2025-10-22T11:40:45'
sourceUrl: https://micronaut.io/2025/10/22/micronaut-framework-4-10-0-released/
wordpressId: 7340
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2025/10/22/micronaut-framework-4-10-0-released/
---

The Micronaut Foundation is excited to announce the release of [Micronaut framework 4.10.0](https://github.com/micronaut-projects/micronaut-platform/releases/tag/v4.10.0)!

## AI

- [Micronaut MCP](https://micronaut-projects.github.io/micronaut-mcp/snapshot/guide/), a new module, enables you to develop Model MCP (Model Context Protocol) servers easily.
- [Micronaut Langchain4j](https://micronaut-projects.github.io/micronaut-langchain4j/latest/guide) updates to [LangChain4J 1.5.0](https://github.com/langchain4j/langchain4j/releases/tag/1.5.0) with support for the [ChatMemory API](https://micronaut-projects.github.io/micronaut-langchain4j/snapshot/guide/#chatMemory).

### Micronaut Core

[Micronaut Core 4.10.7](https://github.com/micronaut-projects/micronaut-core/releases/tag/v4.10.7) enables:

- [Modification of class annotations with a Mixin](https://docs.micronaut.io/latest/guide/#mixin)
- [It’s possible to introspect all the classes in one package](https://docs.micronaut.io/latest/guide/#atIntrospected). Create a `package-info.java` file and annotate the package with `@Introspected`.
- [Loading resources directly from configuration strings](https://docs.micronaut.io/latest/guide/index.html#resources)
- New [certificate provider configuration](https://docs.micronaut.io/latest/guide/index.html#certificates) for more flexibility and better reloading
- New `ReadBuffer` API to replace `ByteBuffer<?>`
- Netty: Event loop threads are now named default-eventLoopGroup instead of default-nioEventLoopGroup
- Netty: Improved configuration for native transports
- Micronaut HTTP Server Netty: Add an option to disable request decompression (micronaut.server.netty.request-decompression-enabled)
- Micronaut HTTP Server Netty: For the Micronaut loom carrier, the APIs on the [OpenJDK loom branch](https://github.com/openjdk/loom/) are now supported

### Runtimes

- Update to Netty `4.2.7.Final`
- [Micronaut Servlet](https://micronaut-projects.github.io/micronaut-servlet/latest/guide) updates to `Jetty 12.1.1`, `Tomcat 11.0.11`, and Undertow `2.3.19.Final`.

### Security

[Micronaut Security](https://micronaut-projects.github.io/micronaut-security/latest/guide) adds the ability to [proxy `.well-known` requests to an Auth Server](https://micronaut-projects.github.io/micronaut-security/snapshot/guide/#proxyToAuthServer), and it supports the [HTTP WWW-Authenticate response header](https://micronaut-projects.github.io/micronaut-security/snapshot/guide/#wwwAuthenticate). It enables [token validation using the remote authorization server’s `UserInfo` endpoint](https://micronaut-projects.github.io/micronaut-security/snapshot/guide/#user-info).

### Validation

[Micronaut Validation](https://micronaut-projects.github.io/micronaut-validation/latest/guide) adds new annotations such as [`@InEnum`, `@InList`, …](https://micronaut-projects.github.io/micronaut-validation/latest/api/io/micronaut/validation/annotation/package-summary.html)

### Database Migration

- [Micronaut Liquibase](https://micronaut-projects.github.io/micronaut-liquibase/latest/guide) updates to [Liquibase 4.33.0](https://github.com/liquibase/liquibase/releases/tag/v4.33.0).

### Data and Persistence

- [Micronaut Redis](https://micronaut-projects.github.io/micronaut-redis/latest/guide) updates to [Lettuce 6.8.1.RELEASE](https://github.com/redis/lettuce/releases/tag/6.8.1.RELEASE).
- [Micronaut R2DBC](https://micronaut-projects.github.io/micronaut-r2dbc/latest/guide) updates to `r2dbc-io-asyncer-mysql` to `1.4.1`, and `r2dbc-postgresql` to `1.1.0.RELEASE`.
- [Micronaut SQL](https://micronaut-projects.github.io/micronaut-sql/latest/guide) updates `ojdbc` to `23.9.0.25.07`, MariaDB to `3.5.6`, and MySQL Connector to `9.4.0`, Hikari to `6.3.3`, and Tomcat JDBC to `11.0.12`.

- [Micronaut Neo4j](https://micronaut-projects.github.io/micronaut-neo4j/latest/guide) updates to [Neo4J `5.28.10`](https://github.com/neo4j/neo4j-java-driver/releases/tag/5.28.10).

### JSON Schema

- [Micronaut JSON Schema](https://micronaut-projects.github.io/micronaut-json-schema/latest/guide) adds the [`JsonSchemaClassPathResourceLoader`](https://micronaut-projects.github.io/micronaut-json-schema/snapshot/api/io/micronaut/jsonschema/utils/JsonSchemaClassPathResourceLoader.html) API.

### Dev & Test

- [Micronaut Test](https://micronaut-projects.github.io/micronaut-test/latest/guide) updates to JUnit `5.14.0`, and Mockito `5.20.0`. Micronaut test adds a new dependency to [detect Netty Leaks](https://micronaut-projects.github.io/micronaut-test/snapshot/guide/#nettyLeak).
- [Micronaut Test Resources](https://micronaut-projects.github.io/micronaut-test-resources/latest/guide) adds a Test Resources Provider for Oracle Test Pilot.
- [Micronaut Control Panel](https://micronaut-projects.github.io/micronaut-control-panel/latest/guide) adds an [Object Storage Panel](https://micronaut-projects.github.io/micronaut-control-panel/snapshot/guide/#objectStorage).

### Reactive Libraries

- [Micronaut Reactor](https://micronaut-projects.github.io/micronaut-reactor/latest/guide) updates to Project Reactor bill of materials (BOM) `2024.0.11`.
- [Micronaut RxJava3](https://micronaut-projects.github.io/micronaut-rxjava3/latest/guide) updates to [RxJava3 `3.1.12`](https://github.com/ReactiveX/RxJava/releases/tag/v3.1.12)

### Cloud

- [Micronaut Oracle Cloud](https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide) updates to OCI SDK `3.74.2`, and it supports client certificate refresh from the certificate service.
- [Micronaut Azure](https://micronaut-projects.github.io/micronaut-azure/latest/guide) updates to Azure Cosmos 4.74.0, and Azure SDK 1.3.0.
- [Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide) updates to Google Auth Library OAuth2 HTTP `1.39.1`, Google Cloud Core `2.60.0`, Google Cloud PubSub `1.142.0`, and Google Secret Manager `2.76.0`.
- [Micronaut Object Storage](https://micronaut-projects.github.io/micronaut-object-storage/latest/guide) adds support for [pre-signed requests](https://micronaut-projects.github.io/micronaut-object-storage/snapshot/guide/#_pre_authorized_requests).

### Configuration

- [Micronaut Logging](https://micronaut-projects.github.io/micronaut-logging/latest/guide) updates SLF4J `2.0.17`, [Logback](https://logback.qos.ch/news.html#1.5.18) `1.5.19` to Log4j2 `2.25.2`

### Messaging

- [Micronaut NATS](https://micronaut-projects.github.io/micronaut-nats/latest/guide) updates to [NATS `2.23.0`](https://github.com/nats-io/nats.java/releases/tag/2.23.0)

### Analytics

- [Micronaut Tracing](https://micronaut-projects.github.io/micronaut-tracing/latest/guide) updates to OpenTelemetry `1.54.1`.
- [Micronaut Micrometer](https://micronaut-projects.github.io/micronaut-micrometer/latest/guide) updates to [Micrometer 1.15.4](https://github.com/micrometer-metrics/micrometer/releases/tag/v1.15.4).

### API

- [Micronaut Spring](https://micronaut-projects.github.io/micronaut-spring/latest/guide) updates to [Spring Boot `3.5.6`](https://spring.io/blog/2025/09/18/spring-boot-3-5-6-available-now/) and [Spring `6.2.11`](https://spring.io/blog/2025/09/11/spring-framework-6-2-11-available%20now).

### Update

- [Micronaut OpenRewrite](https://micronaut-projects.github.io/micronaut-openrewrite/latest/guide), a new module, with [OpenRewrite](https://docs.openrewrite.org/) recipes specific to Micronaut applications.

### Misc

- [Micronaut Email](https://micronaut-projects.github.io/micronaut-email/latest/guide) updates to Jakarta Mail API `2.1.5` and `angus-mail` `2.0.5`

## Gradle Plugins

Update the [Micronaut Gradle Plugins](https://plugins.gradle.org/u/micronaut) version to use the [latest version](https://github.com/micronaut-projects/micronaut-gradle-plugin/releases) (`4.6.0`)

## Maven Plugins

### Core Maven

- [Maven 3.9.11](https://github.com/apache/maven/releases/tag/maven-3.9.11)

### Micronaut Maven Plugin

- [Micronaut Maven Plugin 4.10.2](https://github.com/micronaut-projects/micronaut-maven-plugin/releases/tag/v4.10.2)

### Build Plugins

- [Exec Maven Plugin 3.6.2](https://github.com/mojohaus/exec-maven-plugin/releases/tag/3.6.2)
- [Maven Compiler Plugin 3.14.1](https://github.com/apache/maven-compiler-plugin/releases/tag/maven-compiler-plugin-3.14.1)
- [Maven Shade Plugin 3.6.1](https://github.com/apache/maven-shade-plugin/releases/tag/maven-shade-plugin-3.6.1)
- [Maven Failsafe Plugin 3.5.4](https://github.com/apache/maven-surefire/releases/tag/surefire-3.5.4)
- [Maven Surefire Plugin 3.5.4](https://github.com/apache/maven-surefire/releases/tag/surefire-3.5.4)
- [GMavenPlus Plugin 4.2.1](https://github.com/groovy/GMavenPlus/releases/tag/4.2.1)
- [GraalPy Maven Plugin 25.0.0](https://github.com/oracle/graalpython/releases/tag/graal-25.0.0)
- [OpenRewrite Maven Plugin 6.19.0](https://github.com/openrewrite/rewrite-maven-plugin/releases/tag/v6.19.0)

### Build and Development Tools

- [Lombok 1.18.42](https://github.com/projectlombok/lombok/releases/tag/v1.18.42)
- [JNA 5.18.1](https://github.com/java-native-access/jna/releases/tag/5.18.1)
- [SpotBugs 4.9.6](https://github.com/spotbugs/spotbugs/releases/tag/4.9.6)

### GraalVM

- [GraalVM SDK 24.2.2](https://github.com/oracle/graal/releases/tag/graal-24.2.2)
- [Native Build Tools 0.11.2](https://github.com/graalvm/native-build-tools/releases/tag/0.11.2)

## NEXT STEPS

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
