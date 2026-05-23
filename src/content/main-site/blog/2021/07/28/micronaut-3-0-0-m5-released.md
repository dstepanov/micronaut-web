---
slug: 2021/07/28/micronaut-3-0-0-m5-released
title: Micronaut 3.0.0 M5 Released!
description: The Micronaut team is excited to announce the final milestone of Micronaut framework 3!
date: '2021-07-28T15:13:54'
modified: '2021-07-28T15:13:54'
sourceUrl: https://micronaut.io/2021/07/28/micronaut-3-0-0-m5-released/
wordpressId: 4198
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
  - uncategorized
tags:
  - release
href: /2021/07/28/micronaut-3-0-0-m5-released/
---

You may notice there hasn’t been any communication about M3 or M4. Those were internal releases we used to upgrade the many optional modules we support. We are finished with the major changes to the Framework, and there shouldn’t be major breaking changes from this release until GA. The next release will be a release candidate.

Here are the main things to know for this release.

## No Default Reactive Streams Implementation

Previous releases of the Micronaut framework included RxJava 2 as a transitive dependency, and RxJava 2 was the reactive streams implementation used to implement many features within the Framework. The Micronaut framework now no longer exposes any reactive streams implementation by default. In addition, all usages of RxJava 2 internally have been replaced with Project Reactor.

Because RxJava3 was released, we had to make a decision to upgrade to RxJava3 or switch to Reactor. We believe Reactor is the better choice because it has functionality for maintaining state within the reactive flow and is more widely adopted by the community.

We recommend applications currently using RxJava 2 to switch to Project Reactor because that will lead to fewer classes on the runtime classpath and fewer potential issues with context propagation and reactive type conversion. If switching is not possible or feasible, simply add a dependency on the `io.micronaut.rxjava2:micronaut-rxjava2` module to continue using RxJava 2.

For applications using Project Reactor or RxJava 3, this change will not have any impact.

## Annotation Inheritance

This release includes a change to the way annotations are inherited. In short, all annotations were inherited from parent interfaces or classes in previous releases. Now an annotation must be annotated with `@Inherited` in order to be inherited. Any annotations related to bean scopes or around/introduction advice are no longer inherited.

The complete list of annotations that have been changed in this way is available in our documentation in the link at the end of this article.

## HTTP Compile Time Validation

The validation of HTTP-related components at compile time has been moved to a new module: `io.micronaut:micronaut-http-validation`. If your application is using our HTTP client or server, add that dependency to the annotation processor classpath to continue having your classes be validated at compile time.

## Jakarta Lifecycle Annotations

The Micronaut framework now supports `jakarta.annotation.PreDestroy` and `jakarta.annotation.PostConstruct`. We recommend switching to those annotations from the `javax.annotation` equivalents due to licensing issues with the `javax` namespace.

## Runtime Classpath Scanning Support Removed

The Micronaut framework already has support for build-time scanning of classes when any scanning is required (like for discovering JPA entities).

With Micronaut framework 3.x, the ability to scan at runtime has been removed. This has the benefit of removing ASM from the native image in GraalVM, and in a future releases of the Framework, we anticipate ASM being removed completely as a runtime dependency.

## Introspections and GraalVM Reflection

In previous versions of the Micronaut framework, adding `@Introspected` to a class also added the configuration for GraalVM to allow for reflective usage of the class. This was the right choice to make prior to advancements made within the Framework, specifically with regard to validation and JSON encoding/decoding. The vast majority of cases should not require any reflection for introspected classes, and thus reflective metadata for GraalVM is no longer applied automatically.

To restore this behavior for an individual class, add the `@ReflectiveAccess` annotation to the class.

## GraalVM Resource Configuration

GraalVM requires any resources, for example in `src/main/resources`, to be declared in a configuration file for them to be available in the native image. The Micronaut framework has done this work for you automatically for quite some time. Prior to this release, that work was done as part of our compile-time logic. Due to a number of factors, work has shifted to our build plugins.

This change should be seamless for those using our build plugins. For Maven users who are not using our build plugin, it is now your responsibility to create and maintain the resource configuration. For Gradle users who are not using our build plugins, you have the option to apply the `io.micronaut.graalvm` plugin to generate the resource configuration.

## Custom Bean Scope Changes

Custom scopes have been reworked to make it possible for implementations to more easily invoke `@PreDestroy` lifecycle methods and dispose of beans more effectively.

The Micronaut framework will now also track any dependent beans that do not define a scope and proactively invoke `@PreDestroy`, ensuring a clean shutdown.

## Community Feedback

This milestone is a great stepping stone for the Framework, and we hope that you will give it a try and let us know your feedback. We are eager to get Micronaut framework 3 released, and community involvement is incredibly important to the success of the Framework. Please try upgrading your existing applications to this milestone and report any issues you find!

See the [documentation](https://docs.micronaut.io/3.0.0-M5/guide) for further details and use [GitHub](https://github.com/micronaut-projects/micronaut-core/issues) to report any issues.
