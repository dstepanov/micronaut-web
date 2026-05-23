---
slug: 2024/06/11/micronaut-framework-4-5-0-released
title: Micronaut Framework 4.5.0 Released!
description: 'The Micronaut Foundation is pleased to announce the latest Micronaut framework release. Enhancements to Existing Modules Micronaut Core NIO domain socket support micronaut-projects/micronaut-core#10852 New request body API micronaut-projects/micronaut-core#10781 Micronaut Data The big features in Micronaut Data for this release are multi-tenancy via discriminator (partition key) and cursor based pagination: Support @IdClass and multiple @Id by @dstepanov in micronaut-projects/micronaut-data#2871 Support discriminator multitenancy by @dstepanov in micronaut-projects/micronaut-data#2876 Initial...'
date: '2024-06-11T19:27:42'
modified: '2024-06-18T19:51:43'
sourceUrl: https://micronaut.io/2024/06/11/micronaut-framework-4-5-0-released/
wordpressId: 6953
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2024/06/11/micronaut-framework-4-5-0-released/
---

## The Micronaut Foundation is pleased to announce the latest Micronaut framework release.

###

### Enhancements to Existing Modules

####

#### Micronaut Core

- NIO domain socket support [micronaut-projects/micronaut-core#10852](https://github.com/micronaut-projects/micronaut-core/pull/10852)
- New request body API [micronaut-projects/micronaut-core#10781](https://github.com/micronaut-projects/micronaut-core/pull/10781)

#### Micronaut Data

The big features in Micronaut Data for this release are multi-tenancy via discriminator (partition key) and cursor based pagination:

- Support `@IdClass` and multiple `@Id` by [@dstepanov](https://github.com/dstepanov) in [micronaut-projects/micronaut-data#2871](https://github.com/micronaut-projects/micronaut-data/pull/2871)
- Support discriminator multitenancy by [@dstepanov](https://github.com/dstepanov) in [micronaut-projects/micronaut-data#2876](https://github.com/micronaut-projects/micronaut-data/pull/2876)
- Initial addition of cursored pagination for SQL by [@andriy-dmytruk](https://github.com/andriy-dmytruk) in [micronaut-projects/micronaut-data#2884](https://github.com/micronaut-projects/micronaut-data/pull/2884)

#### Micronaut Servlet

Micronaut Servlet features several new enhancements:

- Support configuring minThreads and maxThreads [micronaut-projects/micronaut-servlet#722](https://github.com/micronaut-projects/micronaut-servlet/pull/722)
- Support Virtual Threads in Jetty & Tomcat [micronaut-projects/micronaut-servlet#701](https://github.com/micronaut-projects/micronaut-servlet/pull/701)
- Make servlet more flexible / support servlet annotations [micronaut-projects/micronaut-servlet#702](https://github.com/micronaut-projects/micronaut-servlet/pull/702)
- Support for http/2 over plaintext for Jetty & Tomcat [micronaut-projects/micronaut-servlet#706](https://github.com/micronaut-projects/micronaut-servlet/pull/706)
- Support MessageBodyReader/Writer abstraction in Servlet [micronaut-projects/micronaut-servlet#707](https://github.com/micronaut-projects/micronaut-servlet/pull/707)
- Attribute binders for ServletConfig/ServletContext [micronaut-projects/micronaut-servlet#708](https://github.com/micronaut-projects/micronaut-servlet/pull/708)
- allow registering other servlet container initializers [micronaut-projects/micronaut-servlet#711](https://github.com/micronaut-projects/micronaut-servlet/pull/711)
- Support management port in servlet [micronaut-projects/micronaut-servlet#712](https://github.com/micronaut-projects/micronaut-servlet/pull/712)
- Support for access log for each servlet server implementation [micronaut-projects/micronaut-servlet#713](https://github.com/micronaut-projects/micronaut-servlet/pull/713)

#### Micronaut Micrometer

Micronaut 4.5 includes several useful community contributions to the Micrometer module:

- Build more tags using method context by [@hrothwell](https://github.com/hrothwell) in [micronaut-projects/micronaut-micrometer#753](https://github.com/micronaut-projects/micronaut-micrometer/pull/753)
- Add micronaut-micrometer-registry-otlp binding for micrometer-registry-otlp by [@cltnschlosser](https://github.com/cltnschlosser) in [micronaut-projects/micronaut-micrometer#729](https://github.com/micronaut-projects/micronaut-micrometer/pull/729)
- Adding support for histograms by [@lcavadas](https://github.com/lcavadas) in [micronaut-projects/micronaut-micrometer#740](https://github.com/micronaut-projects/micronaut-micrometer/pull/740)

### New Modules

#### Micronaut JSON Schema

A new module is available for [generating JSON schema definitions](https://micronaut-projects.github.io/micronaut-json-schema/latest/guide/) from classes at build time.

#### Micronaut SourceGen

A new [SourceGen module is available](https://micronaut-projects.github.io/micronaut-sourcegen/latest/guide/) for writing source generators, generating Builder classes and generating Wither classes. The goal is to provide a long term replacement for Lombok and simplify the ability to write new source generators with the Framework.

#### Micronaut Guice

A [new Guice module is available](https://micronaut-projects.github.io/micronaut-guice/latest/guide/) that allows the import of existing Guice modules, simplifying migration to the Micronaut framework for Guice users.

###

### New Features 🎉

- Adds Guice, JSON Schema and SourceGen modules by [@graemerocher](https://github.com/graemerocher) in [#1481](https://github.com/micronaut-projects/micronaut-platform/pull/1481)

###

### Dependency updates 🚀

Please view the full changelog for a long list of dependency updates! [v4.4.0...v4.5.0](https://github.com/micronaut-projects/micronaut-platform/compare/v4.4.0...v4.5.0)

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so! Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
