---
slug: 2020/10/05/micronaut-2-1-released
title: Micronaut 2.1 Released!
description: We are pleased to announce the release of Micronaut 2.1! This release includes support for Kotlin 1.4, KoTest, Oracle Cloud Functions, Google Pub/Sub, and a number of other enhancements. It also includes a brand-new Gradle plugin with a host of features for building Docker and GraalVM Native Images! New Gradle Plugin Micronaut’s new Gradle plugin includes...
date: '2020-10-05T12:49:43'
modified: '2021-04-12T20:33:42'
sourceUrl: https://micronaut.io/2020/10/05/micronaut-2-1-released/
wordpressId: 3066
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - docker
  - gcp
  - graalvm
  - gradle
  - kotlin
  - micronaut2
  - oracle
  - release
href: /2020/10/05/micronaut-2-1-released/
---

We are pleased to announce the release of [Micronaut 2.1](https://docs.micronaut.io/2.1.0/guide/index.html)!

This release includes support for Kotlin 1.4, KoTest, Oracle Cloud Functions, Google Pub/Sub, and a [number of other enhancements](https://docs.micronaut.io/2.1.0/guide/index.html#whatsNew). It also includes a brand-new Gradle plugin with a host of features for building Docker and GraalVM Native Images!

## New Gradle Plugin

Micronaut’s new [Gradle plugin](https://github.com/micronaut-projects/micronaut-gradle-plugin) includes first-class support for Docker and GraalVM Native Images. It also makes it easy to configure your Micronaut runtime environment and build your application as a layered JAR.

Here is a sample configuration:

```groovy
plugins {
     id 'io.micronaut.application' version '{version}'
}
repositories {
    jcenter()
    mavenCentral()
}

micronaut {
    version = "2.1.0" // The Micronaut Version
    runtime "netty" // Using the Netty runtime
}
mainClassName = "example.Application" // Your main class
```

This application will be built with dependencies for the Netty runtime. Other runtime configurations are available including Tomcat, Jetty, Google Cloud Function, and Oracle Cloud Function.

The Gradle plugin integrates with the [Gradle Docker Plugin](https://bmuschko.github.io/gradle-docker-plugin), and you can build a Docker image using a layered jar by running:

```bash
./gradlew dockerBuild
```

If you would like to build a Docker image using a GraalVM Native Image, you can run:

```bash
./gradlew dockerBuildNative
```

For a full list of supported runtimes and tasks, see the [documentation](https://github.com/micronaut-projects/micronaut-gradle-plugin/blob/master/README.md).

## New Cloud Features

Micronaut 2.1 adds improvements for Oracle Cloud and Google Cloud Platform.

### Oracle Functions

With Micronaut 2.1, you can create Oracle Function projects by adding the `oracle-function` feature to a new project in [Micronaut Launch](https://micronaut.io/launch/) or by passing it to the Micronaut CLI:

```bash
mn create-function-app myfunction --features oracle-function
```

After some configuration updates, you can push your application image to the Oracle Container Registry using:

```bash
./gradlew dockerPush
./gradlew dockerPushNative
```

See the [Micronaut Oracle Cloud Guide](https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/#functions) for more details.

### Google Cloud Platform Enhancements

Thanks to some amazing contributions from [Vinicius Carvalho](https://github.com/viniciusccarvalho), our Google Cloud Platform (GCP) support has received some enhancements.

First, the Micronaut GCP configuration now includes [Logging Support](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#logging) with the new [StackdriverJsonLayout](https://micronaut-projects.github.io/micronaut-gcp/latest/api/io/micronaut/gcp/logging/StackdriverJsonLayout.html) class that formats log output to use the Stackdriver structured format. When used with [Stackdriver Trace](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#tracing), entries include a `traceId` to correlate traces to log entries.

Micronaut 2.1 also includes support for [Google Cloud Pub/Sub](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#pubsub) messaging! Once you have configured your Topics and Subscriptions in GCP, you can use them from your Micronaut applications by using the [@PubSubClient](https://micronaut-projects.github.io/micronaut-gcp/latest/api/io/micronaut/gcp/pubsub/annotation/PubSubClient.html) annotation on an interface to create a publisher, and the [@PubSubListener](https://micronaut-projects.github.io/micronaut-gcp/latest/api/io/micronaut/gcp/pubsub/annotation/PubSubListener.html) annotation on a class to set up subscriptions.

For more information about Micronaut’s GCP support, see the [Micronaut GCP Guide](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/).

## Give it a Try!

The easiest way to create a new Micronaut 2.1 application is with [Micronaut Launch](https://micronaut.io/launch/). Just select the application type, build, and features you would like to use and generate a new Micronaut application configured just for you! You can also use the [Micronaut CLI](https://micronaut-projects.github.io/micronaut-starter/latest/guide/index.html) to create and manage your Micronaut applications. For more information and installation options, please see the [Download](https://micronaut.io/download.html) page.

For Micronaut Documentation, Guides, and API information see the [Documentation](https://micronaut.io/documentation.html).

## Thank You!

This release would not have been possible without the contributions and support of the amazing Micronaut community! Thank you to all that have contributed time, effort, and energy to making Micronaut a world-class framework for developing applications on the JVM.

We would also like to thank the Technical Advisory Board, Board of Directors, and Contributing Members of the [Micronaut Foundation](https://micronaut.io/foundation/). The Micronaut Foundation is a not-for-profit organization that exists to support and collectively lead the open source Micronaut project. In particular, we would like to thank [Object Computing](https://objectcomputing.com/) for its significant sponsorship and continued stewardship of the Micronaut Framework.
