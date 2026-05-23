---
slug: 2021/11/23/micronaut-framework-3-2-released
title: Micronaut® Framework 3.2 Released
description: The Micronaut Foundation™ is excited to announce the release of Micronaut framework 3.2.0! Here are the new features, improvements, and changes included in this release. GraalVM 21.3.0 The Micronaut framework has been updated to support the latest GraalVM 21.3.0 release. GraalVM 21.3.0 supports JDK17, so this new version of Micronaut framework does too! Note that...
date: '2021-11-23T22:53:04'
modified: '2021-11-24T09:21:01'
sourceUrl: https://micronaut.io/2021/11/23/micronaut-framework-3-2-released/
wordpressId: 4520
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags: []
href: /2021/11/23/micronaut-framework-3-2-released/
---

The Micronaut Foundation™ is excited to announce the release of Micronaut framework 3.2.0!

Here are the new features, improvements, and changes included in this release.

## GraalVM 21.3.0

The Micronaut framework has been updated to support the latest [GraalVM 21.3.0 release](https://www.graalvm.org/release-notes/21_3/). GraalVM 21.3.0 supports JDK17, so this new version of Micronaut framework does too!

Note that starting with 21.3.0, GraalVM no longer releases versions based on JDK 8. If you use Java 8, use the GraalVM JDK 11 distribution.

### GraalVM Maven Plugin Changes

The official GraalVM Maven plugin has new coordinates. If you have declared it in your pom.xml, update the coordinates to:

```
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
    ...
</plugin>
```

## Gradle Plugin 3.0.0

A new major version of the Gradle plugin has been released. The new Gradle plugin is based on the official GraalVM plugin; as a result the way native images are configured has changed. See the [new documentation](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/) for more information on how to upgrade.

You can still build existing applications or libraries using the 2.x version of the Gradle plugin. Documentation for the old version can be found [here](https://github.com/micronaut-projects/micronaut-gradle-plugin/blob/2.0.x/README.md).

## Kotlin 1.6.0

This new release includes support for [Kotlin 1.6.0](https://kotlinlang.org/docs/whatsnew16.html).

For Kotlin/JVM, starting with 1.6.0, the compiler can generate classes with a bytecode version corresponding to JVM 17. Thus, you can generate Micronaut applications with Kotlin as your programming language targeting JDK 17 with [Micronaut Launch](https://launch.micronaut.io/).

## HTTP Features

### JsonView on request bodies

You can now specify the Jackson’s `@JsonView` annotation on `@Body` parameters to controller methods.

### SSL handshake timeout configuration

The SSL handshake timeout can now be configured for the client and Netty server.

### HTTP/2 Server Push

Since Micronaut framework 2.x, the Framework’s Netty-based HTTP server can be configured to support HTTP/2.

With Micronaut framework 3.2.0, it is possible to send resources, like stylesheets required by an HTML page, to a client alongside the request for the page using the HTTP2 server push protocol.

### WebSocket Improvements

#### WebSocket Ping API

WebSocket `@OnMessage` methods can now accept a `WebSocketPongMessage` parameter that will receive a WebSocket pong sent as a response to a ping submitted using the new `WebSocketSession::sendPingAsync` method.

#### WebSocket ws/wss protocol support

The WebSocket clients now support the ws/wss protocol. To implement this change, new `WebSocketClient::create` methods have been added to take a URI instead of a URL. The URL methods have been deprecated.

## Module Upgrades

### Micronaut Data

[Micronaut Data 3.2.0](https://github.com/micronaut-projects/micronaut-data/releases/tag/v3.2.0) includes the following new features:

#### Support for Jakarta Criteria API

For Micronaut Data JDBC and R2DBC features, you can use Micronaut Data repositories with a subset of [Jakarta Criteria API 3.0](https://jakarta.ee/specifications/persistence/3.0/jakarta-persistence-spec-3.0.html#a6925).

This enables you to build queries programmatically with an elegant syntax:

```
personRepository
    .count(ageIsLessThan(30).and(not(nameEquals("Denis"))));
```

Read the [Repositories with Criteria API](https://micronaut-projects.github.io/micronaut-data/latest/guide/index.html#dbcCriteriaSpecifications) section of the documentation to learn more.

#### Expandable Queries

Micronaut Data has improved how expandable query parameters are handled to increase performance at runtime.

Read the [Expandable Queries](https://micronaut-projects.github.io/micronaut-data/snapshot/guide/index.html#sqlExpandableQueries) section of the documentation to learn more.

### Micronaut Security

Micronaut framework 3.2.0 includes a minor upgrade of Micronaut Security: [Micronaut Security 3.2.0](https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.2.0). Micronaut Security now supports automatic configuration of an endsession endpoint if you use Keycloak.

### Reactive Library Modules

The RxJava2, RxJava3, and Reactor modules have been updated with the equivalent static create methods on their core counterparts. Moreover, clients with reactive library-specific returns types (Flux, Single, …) have been added. Thus, if you have worked with HttpClient, working with ReactorHttpClient or Rx3HttpClient should be a seamless transition.

### Micronaut OpenAPI

Micronaut OpenAPI now supports Java Records.

### Micronaut Kubernetes

The Micronaut framework includes a minor upgrade of Micronaut Kubernetes. The service discovery client can now run in watch mode so your application is informed about service and endpoint changes by the Kubernetes API.

### Schema Migration Modules

- [Micronaut Flyway 5.0.0](https://github.com/micronaut-projects/micronaut-flyway/releases/tag/v5.0.0). This updates Flyway from Flyway 7.15.0 to 8.0.2.
- [Micronaut Liquibase 5.0.0](https://github.com/micronaut-projects/micronaut-liquibase/releases/tag/v5.0.0). This updates Liquibase from 4.4.3 to 4.6.1.

### Micronaut ElasticSearch

The Micronaut framework includes a major upgrade of Micronaut ElasticSearch: [Micronaut ElasticSearch 4.0.0](https://github.com/micronaut-projects/micronaut-elasticsearch/releases/tag/v4.0.0). This updates [ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/es-release-notes.html) from 7.12.1 to 7.15.2.

## Community Feedback

We consider the community to be the cornerstone of the Micronaut framework. This release would not be possible without your code contributions. Moreover, your feedback is incredibly important. Please try upgrading your existing applications to this release and report any issues you find. See the [documentation](https://docs.micronaut.io/3.2.0/guide) for further details and use [GitHub](https://github.com/micronaut-projects/micronaut-core/issues) to report any issues.
