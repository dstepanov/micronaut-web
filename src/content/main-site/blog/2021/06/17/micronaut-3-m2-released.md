---
slug: 2021/06/17/micronaut-3-m2-released
title: Micronaut 3 M2 Released!
description: The Micronaut team is excited to announce the second milestone release of Micronaut 3! The first milestone was a great starting point for the next major version of the Framework, and this milestone moves us closer to the GA release.
date: '2021-06-17T20:31:49'
modified: '2021-06-17T20:31:49'
sourceUrl: https://micronaut.io/2021/06/17/micronaut-3-m2-released/
wordpressId: 4050
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2021/06/17/micronaut-3-m2-released/
---

The Micronaut team is excited to announce the second milestone release of Micronaut 3! The first milestone was a great starting point for the next major version of the Framework, and this milestone moves us closer to the GA release.

Here are the main things to know for this milestone:

## Jakarta Inject

Due to [trademark restrictions imposed on the javax.* namespace](https://eclipse-foundation.blog/2019/05/03/jakarta-ee-java-trademarks/), the Micronaut framework has switched from the `javax.inject` to the `jakarta.inject` annotations as the set of annotations that’s included by default with the Framework. We recommend that you switch your application to the new annotations. It should only be a matter of changing the imports. For current uses of `javax.inject.Provider`, we recommend switching to `io.micronaut.context.BeanProvider`.

The old `javax.inject` annotations are still supported. To continue using those annotations, simply add [the dependency](https://mvnrepository.com/artifact/javax.inject/javax.inject/1) to your build that contains the annotations.

## Server Filter Rework

In Micronaut framework 2, server filters could have been called multiple times in the case of an exception being thrown, or sometimes not at all if the error resulted before route execution. This also allowed for filters to handle exceptions thrown from routes.

Filters have changed in Micronaut framework 3 to always be called exactly once for each request under all conditions. Exceptions are no longer propagated to filters; instead the resulting error response is passed through the reactive stream.

The `OncePerRequestHttpServerFilter` class is now deprecated and will be removed in the next major release. The `OncePerRequestHttpServerFilter` stores a request attribute when the filter is executed, and some functionality may rely on that attribute existing. The class will still create the attribute, but it is recommended to instead create a custom attribute in your filter class and use that instead of the one created by `OncePerRequestHttpServerFilter`.

## Status Error Routes

Methods annotated with `@Error(status = )` have had their default response status changed. In the case where the method does not return a response and does not specify `@Status` on the method, the default response status will be the original response status (the one specified in the `@Error` annotation).

## Error Route Priority

Previously, if a route could not be satisfied or an `HttpStatusException` was thrown, routes for the relevant HTTP status were searched before routes that handled the specific exception. In Micronaut framework 3, routes that handle the exception will be searched first, then routes that handle the HTTP status.

## ExecutorService Injection

It is no longer possible to inject an `ExecutorService` without a qualifier. In previous versions of the Micronaut framework, the default Netty event loop would have been injected, and that thread pool should not be used for general purposes.

## GraalVM changes

In previous versions of the Micronaut framework, any class annotated with `@Introspected` were included in the GraalVM `reflect-config.json` file. This wasn’t the intended use of the annotation because it is used to generate [Bean Introspection Metadata](https://docs.micronaut.io/latest/guide/index.html#introspection). Starting in Micronaut 3 classes annotated with `@Introspected` won’t be added to GraalVM reflection config anymore, because in most of the cases it’s not necessary. If you want to add a class to the GraalVM reflection config file, annotate it with `@ReflectiveAccess` instead.

## Future Milestones

This milestone is a great stepping stone for the Framework and we hope that you will give it a try and let us know your feedback. The next milestone will contain the switch to Project Reactor as the default reactive library. We are eager to get Micronaut framework 3 released, and the community involvement is incredibly important to the success of the Framework. Please try upgrading your existing applications to this milestone and report any issues you find!

See the [documentation](https://docs.micronaut.io/3.0.0-M2/guide) for further details and use [GitHub](https://github.com/micronaut-projects/micronaut-core/issues) to report any issues.
