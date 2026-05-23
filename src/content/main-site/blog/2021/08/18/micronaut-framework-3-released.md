---
slug: 2021/08/18/micronaut-framework-3-released
title: Micronaut Framework 3 Released!
description: The Micronaut Foundation is excited to announce the GA release of Micronaut framework 3!
date: '2021-08-18T18:56:05'
modified: '2021-08-18T22:22:11'
sourceUrl: https://micronaut.io/2021/08/18/micronaut-framework-3-released/
wordpressId: 4275
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - micronaut3
  - release
href: /2021/08/18/micronaut-framework-3-released/
---

This release represents the culmination of many months of work by many people, including our community. We are proud of what we have achieved and are looking forward to what comes next. A major release of the Framework has given us the opportunity to fix the design mistakes of the past and implement important changes to make the Framework more intuitive to use and adaptable to future requirements.

There are a large number of changes in the Framework for version 3, so this blog post can’t cover all of them. For full details of the release, see the [documentation](https://docs.micronaut.io/3.0.0/guide). Here are the important highlights.

## No Default Reactive Streams Implementation

Previous releases of the Micronaut framework included RxJava2 as a transitive dependency, and RxJava2 was the reactive streams implementation used to implement many features within the Framework. The Micronaut framework now no longer exposes any reactive streams implementation by default. In addition, all usages of RxJava2 internally have been replaced with Project Reactor.

Once RxJava3 was released, we had to make a decision to upgrade to RxJava3 or switch to Reactor. We believe Reactor is the better choice because it has functionality for maintaining state within the reactive flow and is more widely adopted by the community.

We recommend applications currently using RxJava2 to switch to Project Reactor because that will lead to fewer classes on the runtime classpath and fewer potential issues with context propagation and reactive type conversion. If switching is not possible or feasible, simply add a dependency on the `io.micronaut.rxjava2:micronaut-rxjava2` module to continue using RxJava2.

For applications using Project Reactor or RxJava3, this change will not have any impact.

## Annotation Inheritance

This release includes a change to the way annotations are inherited. In short, all annotations were inherited from parent interfaces or classes in previous releases. Now an annotation must be annotated with `@Inherited` in order to be inherited. Any annotations related to bean scopes or around/introduction advice are no longer inherited.

The complete list of annotations that have been changed in this way is available in our [documentation](https://docs.micronaut.io/3.0.0/guide).

## HTTP Compile-Time Validation

The validation of HTTP-related components at compile time has been moved to a new module, `io.micronaut:micronaut-http-validation`. If your application is using our HTTP client or server, add that dependency to the annotation processor classpath to continue having your classes be validated at compile time.

## Jakarta Lifecycle Annotations

The Micronaut framework now supports `jakarta.annotation.PreDestroy` and `jakarta.annotation.PostConstruct`. We recommend switching to those annotations from the `javax.annotation` equivalents due to [licensing issues with the `javax` namespace](https://eclipse-foundation.blog/2019/05/03/jakarta-ee-java-trademarks/).

## IOC Improvements

### Jakarta Inject

Due to trademark restrictions imposed on the javax.* namespace, the Micronaut framework has switched from the `javax.inject` to the `jakarta.inject` annotations as the set of annotations that’s included by default with the Framework. We recommend that you switch your application to the new annotations. It should only be a matter of changing the imports. For current uses of `javax.inject.Provider`, we recommend switching to `io.micronaut.context.BeanProvider`.

The old `javax.inject` annotations are still supported. To continue using those annotations, simply add [the dependency](https://mvnrepository.com/artifact/javax.inject/javax.inject/1) to your build that contains the annotations.

### Injection by generics

It is now possible to qualify an injection of a type by its generic arguments. A class that uses type arguments can be targeted by specifying those generics in the argument type.

```
@Inject
public Vehicle(Engine<V8> engine) {
   ...
}
```

### Qualifier Annotations

The members of qualifier annotations are now used to qualify the bean being requested. Previously only the presence of the annotation was used.

### Limit Injectable Types

It is now possible to make it so that beans cannot be looked up by the type they are, but rather by a super type or interface. You can use this to prevent an implementation class from being looked up directly and forcing the bean to be looked up by the interface it implements. For example:

```
@Bean(typed = Engine.class)
class V8Engine implements Engine {

}
```

### AOP Interception

Constructors and life cycle methods can now be intercepted to allow for AOP advice on those methods. Previously, life cycle methods like `@PostConstruct` and `@PreDestroy` could not have AOP advice applied to them.

### Factory Beans

Factory classes can now produce beans from fields with the `@Bean` annotation.

## Server Filter Rework

In Micronaut framework 2, server filters could have been called multiple times in the case of an exception being thrown, or sometimes not at all if the error resulted before route execution. This also allowed for filters to handle exceptions thrown from routes.

Filters have changed in Micronaut framework 3 to always be called exactly once for each request under all conditions. Exceptions are no longer propagated to filters; instead the resulting error response is passed through the reactive stream.

## Introspections and GraalVM Reflection

In previous versions of the Micronaut framework, adding `@Introspected` to a class also added the configuration for GraalVM to allow for reflective usage of the class. This was the right choice to make prior to advancements made within the Framework, specifically in regards to validation and JSON encoding/decoding. The vast majority of cases should not require any reflection for introspected classes, and thus reflective metadata for GraalVM is no longer applied automatically.

To restore this behavior for an individual class, add the `@ReflectiveAccess` annotation to the class.

## GraalVM Resource Configuration

GraalVM requires any resources, for example in `src/main/resources`, to be declared in a configuration file for them to be available in the native image. The Micronaut framework has done this work for you automatically for quite some time. Prior to this release, that work was done as part of our compile-time logic. Due to a number of factors, work has shifted to our build plugins. This change should be seamless for those using our build plugins. For Maven users who are not using our build plugin, it is now your responsibility to create and maintain the resource configuration. For Gradle users who are not using our build plugins, you have the option to apply the `io.micronaut.graalvm` plugin to generate the resource configuration.

## Breaking Changes

### Nullability Annotations

The Micronaut framework no longer ships with external `@Nullable` annotations. Users are encouraged to switch to Micronaut annotations, or they’ll need to add a dependency on the set of annotations they prefer.

### Custom Bean Scope Changes

Custom scopes have been reworked to make it possible for implementations to more easily invoke `@PreDestroy` life-cycle methods and dispose of beans more effectively.

The Micronaut framework will now also track any dependent beans that do not define a scope and pro-actively invoke `@PreDestroy`, ensuring a clean shutdown.

### Status Error Routes

Methods annotated with `@Error(status = )` have had their default response status changed. In the case where the method does not return a response and does not specify `@Status` on the method, the default response status will be the original response status (the one specified in the `@Error` annotation).

### Error Route Priority

Previously, if a route could not be satisfied or an `HttpStatusException` was thrown, routes for the relevant HTTP status were searched before routes that handled the specific exception. In Micronaut framework 3, routes that handle the exception will be searched first, then routes that handle the HTTP status.

### Deprecations

The vast majority of classes and methods that were deprecated in 2.x have been removed.

### Factory Injection Type

Previously, it was possible to use the implementation type returned from a factory to look up a bean. Now only the return type and any of its parent classes or interfaces can be injected.

### ExecutorService Injection

It is no longer possible to inject an `ExecutorService` without a qualifier. In previous versions of the Micronaut framework, the default Netty event loop would have been injected, and that thread pool should not be used for general purposes.

## Easy Upgrade

For Java users, there is now an integration with [OpenRewrite](https://docs.openrewrite.org/). OpenRewrite changes your source code to upgrade the application from Micronaut framework 2 to 3. This is done through a Gradle or Maven plugin that needs to be added to your build. For instructions on getting started, see the [upgrading documentation](https://docs.micronaut.io/3.0.0/guide/#upgrading).

## Community Feedback

We are excited to hear what you think and what your experience is upgrading applications. Community involvement is incredibly important to the success of the Framework. Please try upgrading your existing applications to this release and report any issues you find!

See the [documentation](https://docs.micronaut.io/3.0.0/guide) for further details and use [GitHub](https://github.com/micronaut-projects/micronaut-core/issues) to report any issues.

Many of the optional Micronaut modules have had breaking changes for this release in addition to the changes listed here. See the respective documentation for those modules to understand how to upgrade.
