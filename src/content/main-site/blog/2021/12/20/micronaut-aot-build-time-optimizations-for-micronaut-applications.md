---
slug: 2021/12/20/micronaut-aot-build-time-optimizations-for-micronaut-applications
title: Micronaut AOT – Build-Time Optimizations for Micronaut Applications
description: Today, Cédric Champeau introduced a new Micronaut module – Micronaut® AOT Micronaut AOT reduces application startup time and deployment size by executing a number of operations during the build. It can precompute bean requirements and perform substitutions at build time, so that only classes that are going to be used in production are included. Micronaut...
date: '2021-12-20T23:28:53'
modified: '2022-01-05T19:29:14'
sourceUrl: https://micronaut.io/2021/12/20/micronaut-aot-build-time-optimizations-for-micronaut-applications/
wordpressId: 4598
contentSource: wordpress-post
category: uncategorized
categories:
  - uncategorized
tags: []
href: /2021/12/20/micronaut-aot-build-time-optimizations-for-micronaut-applications/
---

Today, [Cédric Champeau](http://melix.github.io/blog/) [introduced a new Micronaut module – Micronaut® AOT](https://medium.com/graalvm/introducing-micronaut-aot-build-time-optimizations-for-your-micronaut-applications-68b8f1302c5)

> Micronaut AOT reduces application startup time and deployment size by executing a number of operations during the build. It can precompute bean requirements and perform substitutions at build time, so that only classes that are going to be used in production are included.

Micronaut AOT benefits regular Micronaut applications and GraalVM Native Images of Micronaut applications.

Micronaut AOT is a leap forward for Micronaut applications’ startup. When I applied the [Micronaut AOT Gradle plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/snapshot/#_micronaut_aot_plugin) and the optimizations to the [Newsletter application](https://github.com/micronaut-advocacy/micronaut-live-newsletter), which I develop every Tuesday and Thursday at [Micronaut Live](https://twitch.tv/micronautfw), I got the following startup improvements:

![](/micronaut-assets/main-site/wp-content/uploads/2021/12/application-startup-regular-vs-optimized.png)

That it is 26% faster startup time for a FAT jar and 46% for GraalVM Native Image.

[Cédric’s blog post](https://medium.com/graalvm/introducing-micronaut-aot-build-time-optimizations-for-your-micronaut-applications-68b8f1302c5) is a great introduction to the motivation, the internals, and the different optimizations available in these early milestones of the [Micronaut AOT Module](https://micronaut-projects.github.io/micronaut-aot/snapshot/guide/).

If you want to learn more, read the blog post and listen to [the latest episode of the Micronaut Podcast](https://micronautpodcast.com/005.html), in which I talk to Cédric about Micronaut AOT.

Moreover, join me tomorrow at [Micronaut Live](https://twitch.tv/micronautfw) and follow along as I apply the Micronaut AOT Gradle plugin to the newsletter application.

Enjoy faster startup times!
