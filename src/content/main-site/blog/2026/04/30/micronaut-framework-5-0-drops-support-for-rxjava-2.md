---
slug: 2026/04/30/micronaut-framework-5-0-drops-support-for-rxjava-2
title: Micronaut Framework 5.0 drops support for RxJava 2
description: 'Micronaut Framework 5.0, to be released in Q2 2026, drops support for RxJava 2. Micronaut 5 users have two reactive options: Project Reactor or RxJava 3. Micronaut public APIs are reactive library–agnostic. However, internally, when a reactive library is required, we use Project Reactor. If you want to migrate from RxJava 2 to RxJava 3,...'
date: '2026-04-30T09:14:47'
modified: '2026-04-30T09:14:47'
sourceUrl: https://micronaut.io/2026/04/30/micronaut-framework-5-0-drops-support-for-rxjava-2/
wordpressId: 7469
contentSource: wordpress-post
category: micronaut-5
categories:
  - micronaut-5
tags:
  - micronaut5
href: /2026/04/30/micronaut-framework-5-0-drops-support-for-rxjava-2/
---

Micronaut Framework 5.0, to be released in Q2 2026, drops support for RxJava 2. Micronaut 5 users have two reactive options: [Project Reactor](https://micronaut-projects.github.io/micronaut-reactor/latest/guide) or [RxJava 3](https://micronaut-projects.github.io/micronaut-rxjava3/latest/guide).

Micronaut public APIs are reactive library–agnostic. However, internally, when a reactive library is required, we use Project Reactor.

If you want to migrate from RxJava 2 to RxJava 3, you need to replace the dependency `io.micronaut.rxjava2:micronaut-rxjava2` with `io.micronaut.rxjava3:micronaut-rxjava3`, and update the following imports:

- `io.reactivex.Completable`→ `io.reactivex.rxjava3.core.Completable`
- `io.reactivex.Flowable`→ `io.reactivex.rxjava3.core.Flowable`
- `io.reactivex.Maybe`→ `io.reactivex.rxjava3.core.Maybe`
- `io.reactivex.Single`→ `io.reactivex.rxjava3.core.Single`
