---
slug: 2021/04/30/micronaut-framework-2-5-released
title: Micronaut Framework 2.5 Released!
description: The Micronaut team is excited to announce the release of Micronaut framework 2.5! This release features support for GraalVM 21.1.0, Gradle 7, Java 16, and several other exciting features. Gradle 7 and Java 16 Micronaut Launch has been updated to allow for the creation of applications with Java 16. In addition, Gradle 7 is now...
date: '2021-04-30T14:01:21'
modified: '2021-04-30T16:42:51'
sourceUrl: https://micronaut.io/2021/04/30/micronaut-framework-2-5-released/
wordpressId: 3921
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - graalvm
  - gradle
  - micrometer
  - micronaut-data
  - oracle-cloud
  - release
href: /2021/04/30/micronaut-framework-2-5-released/
---

The Micronaut team is excited to announce the release of Micronaut framework 2.5! This release features support for GraalVM 21.1.0, Gradle 7, Java 16, and several other exciting features.

## Gradle 7 and Java 16

[Micronaut Launch](https://micronaut.io/launch) has been updated to allow for the creation of applications with Java 16. In addition, Gradle 7 is now the version used in new applications for those who prefer Gradle.

## GraalVM 21.1.0

The GraalVM team has recently released 21.1.0, and the Micronaut framework has upgraded to that version. Our Maven and Gradle plugins now use the new version by default.

## Micronaut Data

Micronaut framework 2.5 now ships with Micronaut Data 2.4, which includes several important features and improvements. Those include:

- Full support for immutable entities. You can use Java 16 records or Kotlin immutable data classes.
- Integrated support for R2DBC; now the data-r2dbc module is a part of the data project and shares the same code with JDBC.
- Optimistic locking for JDBC/R2DBC
- Repositories now support batch insert/update/delete even with a custom query.
- Rewritten entity mapper allows more complex mapping for JDBC/R2DBC entities.
- Support for @JoinTable and @JoinColumn annotations
- A lot of bug fixes!

## InputStream Support

It is now possible to use a `java.io.InputStream` as the body argument or return value in controllers. This should help with integrating third-party APIs that do not have reactive support. Note that the reading of the stream must be done off the event loop!

## Dual Protocol Improvement

The Micronaut framework has supported listening on both a non-secure and a secure port for some time. A new feature in 2.5 is the ability to configure it such that all calls made via HTTP should redirect to HTTPs. See [the documentation](https://docs.micronaut.io/latest/guide/#dualProtocol) for information on how to configure it.

## Micronaut Micrometer

The Micrometer module has been upgraded and now supports repeated definitions of the `@Timed` annotation as well as also supporting the `@Counted` annotation for counters when you add the `micronaut-micrometer-annotation` dependency to your annotation processor classpath.

## Micronaut Oracle Cloud

The Micronaut framework’s Oracle Cloud integration has been updated with support for Cloud Monitoring and Tracing.

## That’s Not All

This list is not the full extent of changes. You can see the “[what’s new](https://docs.micronaut.io/2.5.0/guide/index.html#whatsNew)” section of our docs for more information. We’re proud of the 2.5 release, and we can’t wait for everyone to start using these exciting features. As always, if you encounter any problems, please create an issue in our [Github](https://github.com/micronaut-projects/micronaut-core).
