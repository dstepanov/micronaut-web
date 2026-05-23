---
slug: 2023/03/09/micronaut-framework-3-8-7-released
title: Micronaut Framework 3.8.7 Released!
description: The Micronaut Foundation is excited to announce the release of Micronaut framework 3.8.7! This is a patch release, and it contains bug fixes. Moreover, Micronaut 3.8.7 includes patch releases of several modules – Micronaut Serialization, Micronaut CRaC, Micronaut Kafka, Micronaut AOT, and Micronaut GCP. Moreover, update your application to version 3.7.4 of the Micronaut Gradle Plugins if...
date: '2023-03-09T06:31:29'
modified: '2023-03-09T06:31:29'
sourceUrl: https://micronaut.io/2023/03/09/micronaut-framework-3-8-7-released/
wordpressId: 6128
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags: []
href: /2023/03/09/micronaut-framework-3-8-7-released/
---

The Micronaut Foundation is excited to announce the release of [Micronaut framework 3.8.7!](https://github.com/micronaut-projects/micronaut-core/releases/tag/v3.8.7)

This is a patch release, and it contains bug fixes. Moreover, Micronaut 3.8.7 includes patch releases of several modules – [Micronaut Serialization](https://github.com/micronaut-projects/micronaut-serialization/releases/tag/v1.5.2), [Micronaut CRaC](https://github.com/micronaut-projects/micronaut-crac/releases/tag/v1.1.2), [Micronaut Kafka](https://github.com/micronaut-projects/micronaut-kafka/releases/tag/v4.5.2), [Micronaut AOT](https://github.com/micronaut-projects/micronaut-aot/releases/tag/v1.1.2), and [Micronaut GCP](https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v4.8.1).

Moreover, update your application to version 3.7.4 of the [Micronaut Gradle Plugins if you use Gradle.](https://plugins.gradle.org/u/micronaut)

## SnakeYAML Upgrade

Micronaut Framework 3.8.7 updates to a major version of [SnakeYAML – 2.0](https://bitbucket.org/snakeyaml/snakeyaml/wiki/Changes), which addresses [CVE-2022-1471](https://nvd.nist.gov/vuln/detail/CVE-2022-1471).

Micronaut Framework is not affected by [CVE-2022-1471](https://nvd.nist.gov/vuln/detail/CVE-2022-1471). Micronaut Framework uses SnakeYAML only to load configuration in Micronaut applications. There is only one instance of [SnakeYAML instantiation](https://github.com/micronaut-projects/micronaut-core/blob/3.8.x/inject/src/main/java/io/micronaut/context/env/yaml/YamlPropertySourceLoader.java#L56), which uses the [Safe Constructor](https://github.com/micronaut-projects/micronaut-core/blob/3.8.x/inject/src/main/java/io/micronaut/context/env/yaml/CustomSafeConstructor.java). Using SnakeYaml’s SafeConstructor is the recommended way to prevent [CVE-2022-1471](https://nvd.nist.gov/vuln/detail/CVE-2022-1471).

However, many organizations forbid their teams to use a framework that depends on a vulnerable dependency, even if it is unaffected. Because of that, we decided to update SnakeYAML to the next major version in a patch release of the framework.

## Next Steps

If you still need to update to [Micronaut framework 3.8](https://micronaut.io/2022/12/27/micronaut-framework-3-8-0-released/), this is an excellent opportunity to do it!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
