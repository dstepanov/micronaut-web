---
slug: 2022/01/31/micronaut-serialization
title: Micronaut Serialization
description: 'Today, Micronaut co-founder, Graeme Rocher, introduced Micronaut Serialization: Micronaut Serialization can serialize and deserialize Java types (including Java 17 records) to and from JSON and other formats without using reflection. While Jackson Databind remains the default JSON, you can now replace it with Micronaut Serialization, which uses build-time computed bean introspection and eliminates the need...'
date: '2022-01-31T22:13:50'
modified: '2022-01-31T22:13:50'
sourceUrl: https://micronaut.io/2022/01/31/micronaut-serialization/
wordpressId: 4816
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags: []
href: /2022/01/31/micronaut-serialization/
---

Today, Micronaut co-founder, Graeme Rocher, introduced [Micronaut Serialization](https://medium.com/graalvm/introducing-micronaut-serialization-build-time-optimizations-for-json-273f319525d9):

> Micronaut Serialization can serialize and deserialize Java types (including Java 17 records) to and from JSON and other formats without using reflection.

While Jackson Databind remains the default JSON, you can now replace it with Micronaut Serialization, which uses build-time computed bean introspection and eliminates the need for reflection.

[Graeme’s blog post](https://medium.com/graalvm/introducing-micronaut-serialization-build-time-optimizations-for-json-273f319525d9) is a great introduction to the motivation behind and the benefits of Micronaut Serialization.

If you want to learn more, read the [module documentation](https://micronaut-projects.github.io/micronaut-serialization/snapshot/guide) and listen to the [latest episode of the Micronaut Podcast](https://micronautpodcast.com/008.html), in which I talk to Graeme about Micronaut Serialization.

Plus, join me tomorrow at [Micronaut Live](https://twitch.tv/micronautfw) and follow along as I replace Jackson Databind with Micronaut Serialization in the newsletter application.
