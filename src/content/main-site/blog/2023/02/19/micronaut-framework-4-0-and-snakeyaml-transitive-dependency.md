---
slug: 2023/02/19/micronaut-framework-4-0-and-snakeyaml-transitive-dependency
title: Micronaut Framework 4.0 and SnakeYaml transitive dependency
description: Micronaut Framework 4.0, to be released in 2023, will not expose SnakeYAML as a transitive dependency. SnakeYAML is a complete YAML 1.1 processor for the JVM. YAML is a data serialization format designed for human readability and interaction with scripting languages. SnakeYAML is a YAML 1.1 processor for the Java Virtual Machine version 8+ Micronaut...
date: '2023-02-19T18:39:24'
modified: '2023-06-18T15:07:19'
sourceUrl: https://micronaut.io/2023/02/19/micronaut-framework-4-0-and-snakeyaml-transitive-dependency/
wordpressId: 6106
contentSource: wordpress-post
category: microcast
categories:
  - microcast
  - micronaut-4
tags:
  - micronaut4
href: /2023/02/19/micronaut-framework-4-0-and-snakeyaml-transitive-dependency/
---

**Micronaut Framework 4.0, to be released in 2023, will not expose SnakeYAML as a transitive dependency.**

[SnakeYAML](https://bitbucket.org/snakeyaml/) is a complete YAML 1.1 processor for the JVM.

> YAML is a data serialization format designed for human readability and interaction with scripting languages.
>
> SnakeYAML is a YAML 1.1 processor for the Java Virtual Machine version 8+

Micronaut Framework 3.x dependency `io.micronaut:micronaut-core` exposes SnakeYAML as transitive dependency.

Micronaut Framework uses SnakeYAML to read [Application Configuration](https://docs.micronaut.io/latest/guide/#config) from files such as `application.yml` or `bootstrap.yml`.

However, you can define configuration not just with YAML but with properties files, [TOML](https://micronaut-projects.github.io/micronaut-toml/latest/guide/), [Config4k](https://micronaut-projects.github.io/micronaut-kotlin/latest/guide/#_config4k_support), or [Apache Groovy files](https://micronaut-projects.github.io/micronaut-groovy/latest/guide/#config). Micronaut Framework is configuration format agnostic.

Micronaut Framework 4.0 will not expose SnakeYAML as a transitive dependency. We don’t pull an unnecessary dependency if you are not using YAML.

Attackers often target parsing libraries such as SnakeYAML. The removal of SnakeYAML reduces the attack surface of the framework.

## How to keep using YAML for application configuration?

If you want to keep using YAML for application configuration in Micronaut Framework 4.0, add the following dependency to your Gradle build:

```
dependencies {
    ...
    runtimeOnly("org.yaml:snakeyaml")
}
```

Or to your Maven build:

```
    ...
    <dependency>
      <groupId>org.yaml</groupId>
      <artifactId>snakeyaml</artifactId>
      <scope>runtime</scope>
    </dependency>
  </dependencies>
```

You do not have to specify a version number since Micronaut BOM (Bill of Materials) specifies a SnakeYAML version.

## Build Plugins Warning

If you use YAML configuration and you do not specify the SnakeYAML dependency, Micronaut Build Plugins ([Maven](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/) or [Gradle](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/)) will warn you.

[Watch the video](https://www.youtube.com/watch?v=MbmQvyJ-tDI)
