---
slug: 2021/10/11/micronaut-framework-released
title: Micronaut® Framework 3.1 Released
description: The Micronaut Foundation™ is excited to announce the release of Micronaut framework 3.1! This is the first feature release since we released Micronaut framework 3.0 in mid-August.
date: '2021-10-11T14:34:20'
modified: '2021-10-11T15:14:54'
sourceUrl: https://micronaut.io/2021/10/11/micronaut-framework-released/
wordpressId: 4419
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2021/10/11/micronaut-framework-released/
---

Here are the new features, improvements, and changes included in this release.

## JDK 17 Support

Micronaut Launch now supports creating applications with JDK 17!

## Primitive Beans

Factory beans can now create beans that are primitive types or primitive array types.

## Repeatable Qualifiers

Qualifiers can now be repeatable, allowing narrowing of bean resolution by a complete or partial match of the qualifiers declared on the injection point.

## InjectScope

A new `@InjectScope` annotation has been added, which destroys any beans with no defined scope and injects them into a method or constructor annotated with `@Inject` after the method or constructor completes.

## Build Time Optimizations

The way classes are generated to support bean introspections has changed to reduce the number and size of the classes generated, as well as optimizing your Micronaut project’s memory usage, in particular with GraalVM.

## Context Propagation

Support for context propagation of the server request has been further improved by passing request context information in the Project Reactor context and when using Kotlin coroutines. See the [documentation](https://docs.micronaut.io/latest/guide/index.html#kotlinContextPropagation) for more information.

## Filter By Regex

HTTP filters now support matching URLs by a regular expression. Set the `patternStyle` member of the annotation to `REGEX`, and the value will be treated as a regular expression.

## Random Port Binding

The way the server binds to random ports has improved and should result in fewer port-binding exceptions in tests.

## @Client Data Formatting

The `ann:core.convert.Format []` annotation now supports several new values that can be used in conjunction with the declarative HTTP client to support formatting data in new ways. See the [documentation](https://docs.micronaut.io/latest/guide/#clientParameters) for the full details.

## Streaming File Uploads

The `StreamingFileUpload` API has been improved to support streaming directly to an output stream. As with the other `transferTo` methods, the write to the stream is offloaded to the IO pool automatically.

## Server SSL Configuration

The SSL configuration for the Netty server now responds to refresh events. This allows for swapping out certificates without having to restart the server. See the [https documentation](https://docs.micronaut.io/latest/guide/#https) for information on how to trigger the refresh.

## New Netty Server API

If you wish to programmatically start additional Netty servers on different ports with potentially different configurations, new APIs have been added to do so, including a new `NettyEmbeddedServerFactory` interface.

## Deprecations

The `netty.responses.file.*` configuration is deprecated in favor of `micronaut.server.netty.responses.file.*`. The old configuration key will be removed in the next major version of the framework.

## Module Upgrades

### Micronaut Data 3.1.0

- Kotlin’s coroutines support. New repository interface `CoroutineCrudRepository`.
- Support for `AttributeConverter`
- R2DBC upgraded to `Arabba-SR11`
- JPA Criteria specifications

### Micronaut Security

- `micronaut.security.token.roles-separator` configuration property splits roles in a string claim
- Support for Jakarta security annotations: `jakarta.annotation.security*`
- `SecurityFilter` is now togglable and has a configurable pattern
- `micronaut.security.oauth2.clients.*.client-credentials.additional-request-params` configuration property provides additional parameters for Client Credential requests

### Micronaut JAX-RS 3.1

The [JAX-RS module](https://micronaut-projects.github.io/micronaut-jaxrs/latest/guide/) now integrates with Micronaut Security, allowing binding of the JAX-RS `SecurityContext`

### Micronaut Kubernetes 3.1.0

Micronaut Kubernetes 3.1 introduces a new annotation: `@Informer`. By using the annotation on the [ResourceEventHandler](https://javadoc.io/doc/io.kubernetes/client-java/latest/io/kubernetes/client/informer/ResourceEventHandler.html), the Micronaut framework will instantiate the [SharedInformer](https://javadoc.io/doc/io.kubernetes/client-java/latest/io/kubernetes/client/informer/SharedIndexInformer.html) from the official [Kubernetes Java SDK](https://github.com/kubernetes-client/java). Then you only need to take care of handling the changes of the watched Kubernetes resource. See more on [Kubernetes Informer](https://micronaut-projects.github.io/micronaut-kubernetes/latest/guide/#kubernetes-informer).

### Micronaut Oracle Coherence 3.0.0

The [Micronaut Oracle Coherence](https://micronaut-projects.github.io/micronaut-coherence/latest/guide/) module is now out of preview status and includes broad integration with Oracle Coherence, including support for caching, messaging, and Micronaut Data.

## Community Feedback

We consider the community to be the cornerstone of the Micronaut framework, and your feedback is incredibly important to its success! Please try upgrading your existing applications to this release and report any issues you find. See the [documentation](https://docs.micronaut.io/3.1.0/guide) for further details and use [GitHub](https://github.com/micronaut-projects/micronaut-core/issues) to report any issues.
