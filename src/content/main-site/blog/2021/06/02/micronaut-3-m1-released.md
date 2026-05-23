---
slug: 2021/06/02/micronaut-3-m1-released
title: Micronaut 3 M1 Released!
description: The Micronaut team is excited to announce the first milestone release of the Micronaut 3 framework!
date: '2021-06-02T14:50:20'
modified: '2021-06-02T16:28:18'
sourceUrl: https://micronaut.io/2021/06/02/micronaut-3-m1-released/
wordpressId: 4020
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2021/06/02/micronaut-3-m1-released/
---

The Micronaut team is excited to announce the first milestone release of the Micronaut 3 framework! This first milestone should be a minor upgrade path for existing applications and contains a ton of improvements to the dependency injection system.

## IOC Improvements

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

Constructors and lifecycle methods can now be intercepted to allow for AOP advice on those methods. Previously, lifecycle methods like `@PostConstruct` and `@PreDestroy` could not have AOP advice applied to them.

### Factory Beans

Factory classes can now produce beans from fields with the `@Bean` annotation.

## Other Changes

### Random Configuration

Random number configuration values have been expanded to allow for ranges and other options.

## Breaking Changes

### Nullability Annotations

The Micronaut framework no longer ships with external `@Nullable` annotations. Users are encouraged to switch to Micronaut annotations, or they’ll need to add a dependency on the set of annotations they prefer.

### Deprecations

The vast majority of classes and methods that were deprecated in 2.x have been removed in this first milestone.

### Factory Injection Type

Previously, it was possible to use the implementation class to look up a bean produced by a factory. Now only the return type can be injected.

### Reflective Bean Map

A reflection-based approach to bean introspections was available as a fallback in the Micronaut 2 framework for classes where a bean introspection was not available. That fallback has been removed in the Micronaut 3 framework. All classes that are affected by this change should be annotated with `@Introspected`.

## Future Milestones

This milestone is a great stepping stone for the Framework, and we hope that you will give it a try and share your feedback.

Future milestones will contain larger changes, including switching to Jakarta inject annotations and switching to Project Reactor as the default reactive library. Each of those large changes will be in a separate milestone to keep the upgrade path as gradual as possible.

We are eager to get the Micronaut 3 framework released, and community involvement is incredibly important to the Framework’s success. We encourage you to upgrade your existing applications to this milestone and report any issues you find!

See the [documentation](https://docs.micronaut.io/3.0.0-M1/guide) for further details and use [GitHub](https://github.com/micronaut-projects/micronaut-core/issues) to report any issues.
