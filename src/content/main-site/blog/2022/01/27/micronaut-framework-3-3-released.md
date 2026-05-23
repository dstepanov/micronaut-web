---
slug: 2022/01/27/micronaut-framework-3-3-released
title: Micronaut® Framework 3.3 Released
description: The Micronaut team is excited to announce the release of Micronaut framework 3.3!
date: '2022-01-27T21:26:33'
modified: '2022-01-27T21:26:33'
sourceUrl: https://micronaut.io/2022/01/27/micronaut-framework-3-3-released/
wordpressId: 4795
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2022/01/27/micronaut-framework-3-3-released/
---

This release introduces new features to the framework. Those features are detailed below.

## GraalVM 22.0.0

Micronaut framework 3.3 supports the latest [GraalVM 22.0.0](https://www.graalvm.org/release-notes/22_0/).

## AOP Interceptor Binding

When binding an AOP annotation to an interceptor, only the presence of the annotation is used to determine if the interceptor should be applied. Now it’s possible to also bind based on the values of the annotation. To enable this feature, set the `bindMembers` member of the `InterceptorBinding` annotation to `true`.

## Netty Buffer Allocation

It is now possible to [configure the default Netty buffer allocator](https://docs.micronaut.io/3.3.x/guide/configurationreference.html#io.micronaut.buffer.netty.DefaultByteBufAllocatorConfiguration).

## Improved Flexibility in Class Style

Many features of the Micronaut framework rely on the convention of getters and setters. Due to things like records and builders, the method names we look for are now [configurable with the `@AccessorStyle` annotation](https://docs.micronaut.io/3.3.x/guide/index.html#configurationPropertiesAccessorsStyle). The annotation can be placed on `@ConfigurationProperties` beans to allow for binding configuration to methods that do not begin with `set`, for example. It can also be used with classes annotated with `@Introspected`.

## Access Log Exclusions

The Netty access logger now supports excluding requests based on a set of regular expression patterns that match against the URI. See [AccessLogger configuration](https://docs.micronaut.io/3.3.x/guide/configurationreference.html#io.micronaut.http.server.netty.configuration.NettyHttpServerConfiguration.AccessLogger).

## New Serialization/Deserialization Module

[Micronaut Serialization](https://micronaut-projects.github.io/micronaut-serialization/snapshot/guide/) is a new module created as an alternative to Jackson. It supports serializing and deserializing Java types (including Java 17 records) to and from JSON and other formats.

Users now have the choice of an alternative implementation that’s largely compatible with existing Jackson annotations but contains many benefits, including the elimination of reflection, compile-time validation, greater security because only explicit types are serializable, and reduction of native image build sizes, build times, and memory usage.

## New Email Module

[Micronaut Email](https://micronaut-projects.github.io/micronaut-email/latest/guide/) is a new module to ease sending emails from a Micronaut application. It provides integration with transactional email providers such as [Amazon Simple Email Service](https://aws.amazon.com/ses/), [Postmark](https://postmarkapp.com/), [Mailjet](https://www.mailjet.com/), and [SendGrid](https://sendgrid.com/)

## Micronaut AOT

During this minor cycle, we released a milestone release of a new module: [Micronaut AOT](https://micronaut.io/2021/12/20/micronaut-aot-build-time-optimizations-for-micronaut-applications/). You can use the build-time optimizations provided by the module to achieve faster startup times via the [Micronaut Gradle Plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/#_micronaut_aot_plugin). You can read more about it in [the announcement blog post.](https://micronaut.io/2021/12/20/micronaut-aot-build-time-optimizations-for-micronaut-applications/)

## Micronaut Security

[Micronaut Security 3.3.0](https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.3.0) adds support for X.509, the ability to toggle redirection configuration, and a new BOM (Bill of Materials) module.

## Micronaut Kafka

[Micronaut Kafka 4.1.0](https://github.com/micronaut-projects/micronaut-kafka/releases/tag/v4.1.0) adds [Kafka Transactions](https://www.confluent.io/blog/transactions-apache-kafka/) support.

## Micronaut OpenAPI

[Micronaut OpenAPI 4.0.0](https://github.com/micronaut-projects/micronaut-openapi/releases/tag/v4.0.0) provides support for `@AccessorsStyle` and [better handling of `@ApiResponse` annotation](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/index.html#breaks).

## Micronaut Kotlin

[Micronaut Kotlin 3.1.0](https://github.com/micronaut-projects/micronaut-kotlin/releases/tag/v3.1.0) upgrades to Kotlin 1.6.10

## Micronaut Kubernetes

[Micronaut Kubernetes 3.3.0](https://github.com/micronaut-projects/micronaut-kubernetes/releases/tag/v3.3.0) adds Kubernetes operator support and RxJava3 Kubernetes client.

## Micronaut Problem-JSON

[Micronaut Problem 2.2.0](https://github.com/micronaut-projects/micronaut-problem-json/releases/tag/v2.2.0) upgrades to problem 0.27.1, and it and a new BOM (Bill of Materials) module.

## Schema Migration Modules

- [Micronaut Flyway 5.1.1](https://github.com/micronaut-projects/micronaut-flyway/releases/tag/v5.1.1) updates Flyway to 8.4.2.
- [Micronaut Liquibase 5.1.1](https://github.com/micronaut-projects/micronaut-liquibase/releases/tag/v5.1.1) updates Liquibase to 4.7.1

## Environment Endpoint

When the [Micronaut Management](https://docs.micronaut.io/latest/guide/#management) module is added to a project, the environment endpoint is enabled by default. The environment endpoint logs application configuration and masked values based on a set of keywords present in the key. To make this endpoint more secure, it is now disabled by default. If enabled, all values are masked by default. A new API, `EnvironmentEndpointFilter`, has been created to allow applications to customize which keys should have their values masked and which keys should not have their values masked. See the [documentation](https://docs.micronaut.io/3.3.x/guide/#environmentEndpoint) for the full details.

## Community Feedback

We would like to thank all the contributors; the community is incredibly important to the success of the Framework. Please try upgrading your existing applications to this milestone and report any issues you find! See the [documentation](https://docs.micronaut.io/3.3.0/guide) for further details and use [GitHub](https://github.com/micronaut-projects/micronaut-core/issues) to report any issues.
