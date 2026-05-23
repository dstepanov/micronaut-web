---
slug: 2026/05/02/micronaut-5-adoption-of-the-jspecify-nullability-annotations
title: Micronaut 5 adoption of the JSpecify nullability annotations
description: JSpecify nullability annotations have emerged as the standard way to define nullability constraints in Java APIs using annotations. We have migrated Micronaut’s internal APIs to use JSpecify nullability annotations. If you were using Micronaut nullability annotations, replace usages of io.micronaut.core.annotation.Nullable with org.jspecify.annotations.Nullable, and usages of io.micronaut.core.annotation.NonNull with org.jspecify.annotations.NonNull. Fully Qualified Types When specifying a fully...
date: '2026-05-02T06:53:14'
modified: '2026-05-02T06:53:14'
sourceUrl: https://micronaut.io/2026/05/02/micronaut-5-adoption-of-the-jspecify-nullability-annotations/
wordpressId: 7473
contentSource: wordpress-post
category: micronaut-5
categories:
  - micronaut-5
tags:
  - micronaut5
href: /2026/05/02/micronaut-5-adoption-of-the-jspecify-nullability-annotations/
---

[JSpecify](https://jspecify.dev) nullability annotations have emerged as the standard way to define nullability constraints in Java APIs using annotations. We have migrated Micronaut’s internal APIs to use JSpecify nullability annotations.

If you were using Micronaut nullability annotations, replace usages of `io.micronaut.core.annotation.Nullable` with `org.jspecify.annotations.Nullable`, and usages of `io.micronaut.core.annotation.NonNull` with `org.jspecify.annotations.NonNull`.

### Fully Qualified Types

When specifying a fully qualified type, with Micronaut nullability annotations you could write:

```
public ReadBuffer adapt(@NonNull io.micronaut.core.io.buffer.ByteBuffer<?> buffer) {
```

With JSpecify, you need to write:

```
public ReadBuffer adapt(io.micronaut.core.io.buffer.@NonNull ByteBuffer<?> buffer) {
```

### Inner classes

For inner classes, with Micronaut annotations you could write:

```
public FileChangedEvent(@NonNull Path path, @NonNull WatchEvent.Kind eventType) {
```

With JSpecify, you need to write:

```
public FileChangedEvent(@NonNull Path path, WatchEvent.@NonNull Kind eventType) {
```

Read more about the [JSpecify Micronaut integration](https://docs.micronaut.io/snapshot/guide/#jspecify).
