---
slug: 2022/03/22/micronaut-framework-3-4-0-released
title: Micronaut Framework 3.4.0 Released
description: The Micronaut team is excited to announce the release of Micronaut framework 3.4.0 This release introduces new features to the Framework. Those features are detailed below. Referencing bean properties in @Requires With 3.4.0, you can reference other beans properties in @Requires to load beans conditionally. @Requires(bean=Config.class, beanProperty=”foo”, value=”John”) Localized Message Source You can now inject...
date: '2022-03-22T19:01:34'
modified: '2022-03-22T19:01:34'
sourceUrl: https://micronaut.io/2022/03/22/micronaut-framework-3-4-0-released/
wordpressId: 4882
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2022/03/22/micronaut-framework-3-4-0-released/
---

The Micronaut team is excited to announce the release of Micronaut framework [3.4.0](https://docs.micronaut.io/3.4.0/guide/)

This release introduces new features to the Framework. Those features are detailed below.

## Referencing bean properties in `@Requires`

With `3.4.0`, you can [reference other beans properties in `@Requires` to load beans conditionally](https://docs.micronaut.io/3.4.0/guide/#_referencing_bean_properties_in_requires).

```
@Requires(bean=Config.class, beanProperty="foo", value="John")
```

## Localized Message Source

You can now inject [`LocalizedMessageSource`](https://docs.micronaut.io/3.4.0/guide/#localizedMessageSource), a `@RequestScope` bean, in your controllers to resolve localized messages for the current HTTP Request. This works in combination with [Micronaut Locale Resolution](https://docs.micronaut.io/3.4.0/guide/#localeResolution) capabilities.

## Micronaut Data MongoDB

[Micronaut Data 3.3.0](https://github.com/micronaut-projects/micronaut-data/releases/tag/v3.3.0) includes [Micronaut Data MongoDB](https://micronaut-projects.github.io/micronaut-data/latest/guide/index.html#mongo):

> Micronaut Data MongoDB supports most of the things that are possible with JPA and JDBC/R2DBC implementations, including:
>
> - Repositories with compile-time generated filtering, aggregation, and projection queries
> - Entities relations and cascading
> - Transactions
> - Joining relations
> - JPA Criteria API
> - Attribute converters
> - Optimistic locking
>
> The interaction between the object layer and MongoDB’s driver serialization/deserialization is implemented using Micronaut Serialization and BSON support.

## Micronaut AOT and Maven

[Micronaut AOT](https://micronaut-projects.github.io/micronaut-aot/latest/guide/) is now supported for Maven users. Enabling AOT is as simple as passing `-Dmicronaut.aot.enabled` when running, testing, or packaging your application.

For more details, check the [Micronaut Maven Plugin documentation](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/examples/aot.html).

## Micronaut TOML

With [Micronaut TOML](https://micronaut-projects.github.io/micronaut-toml/latest/guide/), you are now able to write your application configuration with [TOML](https://toml.io/en/) in addition to `Properties`, `YAML`, `Groovy` or `Config4k`.

## Micronaut Security

[Micronaut Security 3.4.1](https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.4.0) responds with an error when an authenticated user visits a sensitive endpoint. This forces the developer to define how they want their application to behave in that scenario. Read the [release notes](https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.4.0) and the [documentation](https://micronaut-projects.github.io/micronaut-security/latest/guide/#builtInEndpointsAccess) to learn more.

## BOM Modules

Several projects include a BOM (Bills of Materials) module:

- [Micronaut Azure 3.1.0](https://github.com/micronaut-projects/micronaut-azure/releases/tag/v3.1.0)
- [Micronaut GCP 4.1.0](https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v4.1.0). This includes updates to the latest versions of Google Cloud dependencies.
- [Micronaut Kotlin 3.2.0](https://github.com/micronaut-projects/micronaut-kotlin/releases/tag/v3.2.0)
- [Micronaut MongoDB 4.1.0](https://github.com/micronaut-projects/micronaut-mongodb/releases/tag/v4.1.0)
- [Micronaut MQTT 2.1.0](https://github.com/micronaut-projects/micronaut-mqtt/releases/tag/v2.1.0)
- [Micronaut Reactor 2.2.1](https://github.com/micronaut-projects/micronaut-reactor/releases/tag/v2.2.1). This includes updates to the Project Reactor dependencies.
- [Micronaut Redis 5.2.0](https://github.com/micronaut-projects/micronaut-redis/releases/tag/v5.2.0)
- [Micronaut RxJava2 1.2.0](https://github.com/micronaut-projects/micronaut-rxjava2/releases/tag/v1.2.0)
- [Micronaut RxJava3 2.2.0](https://github.com/micronaut-projects/micronaut-rxjava3/releases/tag/v2.2.0)
- [Micronaut Security 3.4.1](https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.4.0)
- [Micronaut Servlet 3.2.0](https://github.com/micronaut-projects/micronaut-servlet/releases/tag/v3.2.0). This includes updates to Tomcat and Undertow dependencies.

## Other Module Upgrades

- [Micronaut AWS 3.2.0](https://github.com/micronaut-projects/micronaut-aws/releases/tag/v3.2.0) updates to the latest version of AWS SDK, ASK SDK and AWS Serverless Java Container.
- [Micronaut Email 1.1.0](https://github.com/micronaut-projects/micronaut-email/releases/tag/v1.1.0) updates to the Sendgrid 4.8.3 and contains improvements for `javamail` module users.
- [Micronaut Test 3.1.0](https://github.com/micronaut-projects/micronaut-test/releases/tag/v3.1.0) updates the underlying testing dependencies.

## Build and Code Quality

We have been updating every Micronaut project to [newer build infrastructure](https://github.com/micronaut-projects/micronaut-core/issues/6996), and we [set up Jacoco](https://github.com/micronaut-projects/micronaut-core/issues/6994) and [Sonarcloud](https://sonarcloud.io) to keep on top of the quality of the code.

## COMMUNITY FEEDBACK

We want to thank all the contributors; the community is essential to the Framework’s success. Please try upgrading your existing applications to this new minor release and report any issues you find! See the documentation for further details and use GitHub to report any issues.
