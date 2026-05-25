---
slug: 2023/04/18/micronaut-framework-3-9-0-released
title: Micronaut Framework 3.9.0 Released!
description: The Micronaut team is excited to announce the release of Micronaut framework 3.9.0! This release introduces new features to the Framework. Those features are detailed below. @Introspected targetPackage member With Micronaut Framework 3.9.0, you can customize the package to write introspection with the targetPackage member of the @Introspected annotation. Security Breaking change – CORS Regex...
date: '2023-04-18T08:13:45'
modified: '2023-08-22T16:36:19'
sourceUrl: https://micronaut.io/2023/04/18/micronaut-framework-3-9-0-released/
wordpressId: 6169
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2023/04/18/micronaut-framework-3-9-0-released/
---

The Micronaut team is excited to announce the release of [Micronaut framework 3.9.0](https://docs.micronaut.io/3.9.0/guide/index.html)!

This release introduces new features to the Framework. Those features are detailed below.

## @Introspected targetPackage member

With Micronaut Framework 3.9.0, you can customize the package to write introspection with the `targetPackage` member of the `@Introspected` annotation.

## Security Breaking change – CORS Regex

Since Micronaut Framework 3.9.0, CORS `micronaut.server.cors.*.configurations.allowed-origins` configuration does not support regular expressions to prevent accidentally exposing your API. You can use `micronaut.server.cors.*.configurations.allowed-origins-regex`, if you wish to support a regular expression.

## Annotation-based CORS configuration

You can enable Cross Origin Resource Sharing (CORS) configuration via the [`@CrossOrigin`](https://docs.micronaut.io/3.9.0/api/io/micronaut/http/server/cors/CrossOrigin.html) annotation. You can leverage the annotation in a Controller at a class or method level to enable access to a single endpoint of your application.

```
@Controller("/hello")
public class CorsController {
    @CrossOrigin("https://myui.com")
    @Get(produces = MediaType.TEXT_PLAIN)
    public String cors() {
        return "Welcome to the worlds of CORS";
    }

    @Produces(MediaType.TEXT_PLAIN)
    @Get("/nocors")
    public String nocorstoday() {
        return "No more CORS for you";
    }
}
```

Learn more about [Annotation-based CORS](https://docs.micronaut.io/latest/guide/index.html#annotationBasedCors) configuration.

## Kubernetes

[Micronaut Kubernetes 4.0.0](https://github.com/micronaut-projects/micronaut-kubernetes/releases/tag/v4.0.0) includes a major upgrade to v18 of Kubernetes Java Client. This major upgrade of the Kubernetes Client addresses several security CVEs.

## Micronaut Security

You can serve a [JWKS from anywhere on disk or in the classpath](https://micronaut-projects.github.io/micronaut-security/latest/guide/#staticJwks).

## Micronaut CRaC

You can use [Micronaut CRaC](https://micronaut-projects.github.io/micronaut-crac/latest/guide/) with [jOOQ](https://micronaut-projects.github.io/micronaut-sql/latest/guide/#jooq) and Redis.

## Micronaut Maven

It updates to [Jib](https://github.com/GoogleContainerTools/jib) `3.3.1`.

Moreover, Micronaut Launch and CLI generate [applications with Apache Maven 3.9.1](https://micronaut.io/launch?build=MAVEN)

## Micronaut Launch / CLI

When you create a [Micronaut AWS Lambda function with Amazon CDK and the Java Runtime](https://micronaut.io/launch?type=DEFAULT&javaVersion=JDK_11&lang=JAVA&build=GRADLE&test=JUNIT&features=aws-lambda&features=amazon-api-gateway-http&features=aws-cdk), the infrastructure as code enables AWS SnapStart by default.

Java 17 is now the default for new applications.

### Features

- The [`data-azure-cosmos`](https://micronaut.io/launch?type=DEFAULT&features=data-azure-cosmos) feature supports defining data repositories for Azure Cosmos DB.
- The [`google-cloud-function-cloudevents`](https://micronaut.io/launch?type=FUNCTION&features=google-cloud-function-cloudevents) feature supports writing functions with Google CloudEvents and deploying them to Google Cloud Function.

### Community Features

- [`camunda-platform7`](https://micronaut.io/launch?type=DEFAULT&features=camunda-platform7) to support Camunda Platform 7 Workflow Engine.
- [`agorapulse-micronaut-slack`](https://micronaut.io/launch?features=agorapulse-micronaut-slack) feature is an idiomatic alternative to Bolt Micronaut library for Slack integration into the Micronaut Framework.
- [`gradle-enterprise`](https://micronaut.io/launch?type=DEFAULT&features=gradle-enterprise) feature supports both Maven and Gradle applications.

## Micronaut Test

[Micronaut Test](https://github.com/micronaut-projects/micronaut-test/releases/tag/v3.9.1) updates to:

- [Mockito](https://site.mockito.org/) `4.11.0`.
- [MockK](https://mockk.io/) `3.13.3`

## Micronaut ElasticSearch

[Micronaut ElasticSearch](https://github.com/micronaut-projects/micronaut-elasticsearch/releases/tag/v4.4.0) updates to [ElasticSearch](https://www.elastic.co/elasticsearch/) `7.17.9`.

## Micronaut Micrometer

[Micronaut Micrometer](https://github.com/micronaut-projects/micronaut-micrometer/releases/tag/v4.8.3) updates `io.dropwizard.metrics:metrics-core` to `4.2.18` and `micrometer` to `1.10.5`.

## Database Migration Tools

### Micronaut Liquibase

[Micronaut Liquibase](https://micronaut-projects.github.io/micronaut-liquibase/latest/guide/) updates to Liquibase `4.19.1`

## Persistence

### Micronaut SQL

[Micronaut SQL](https://github.com/micronaut-projects/micronaut-sql/releases/tag/v4.8.0) updates to:

- PostgreSQL `42.5.4`
- MariaDB Java client `3.1.2` (#790)
- Hibernate `5.6.15.final`
- Hibernate Reactive `1.1.9.Final`
- Jasync `2.1.23`
- Vertx `4.3.4`

## CLOUD

### Micronaut Azure

[Micronaut Azure](https://github.com/micronaut-projects/micronaut-azure/releases/tag/v3.8.1) updates to:

- Azure SDK to `1.2.11`.
- Azure Cosmos to `4.42.0`.

### Micronaut AWS

[Micronaut AWS](https://github.com/micronaut-projects/micronaut-aws/releases/tag/v3.14.1) updates the following dependencies:

- AWS SDK V2 `2.20.42`.
- AWS SDK V1 `1.12.445`.
- AWS Serverless Java Container Core `1.9.2`.
- Alexa ASK SDK `2.70.0`
- AWS CDK `2.73.0`.

### Micronaut GCP

[Micronaut GCP](https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v4.9.0) updates to:

- Google Cloud Core `2.14.0`.
- Google Cloud PubSub `1.123.7`.
- Google Secret Manager `2.14.0`.
- Google Cloud Events `2.4.2`

## Reactive Libraries

### Micronaut RxJava 3

[Micronaut RxJava 3](https://github.com/micronaut-projects/micronaut-rxjava3/releases/tag/v2.4.1) updates to [RxJava 3](https://github.com/ReactiveX/RxJava) version `3.1.6`

## Configuration Documentation Improvements

Micronaut Framework supports multiple configuration formats YAML, properties, TOML, Groovy, Hocon, etc.

We have updated our documentation to show configuration snippets in the different formats support properties files, YAML, TOML, etc.

![Micronaut Configuration Tabs](/micronaut-assets/main-site/wp-content/uploads/2023/04/micronaut-configuration-tabs-1024x248.png)

## Community Feedback

We want to thank all the contributors; the community is essential to the Framework’s success. Upgrade your existing applications to this new minor release and [report any issues](https://github.com/micronaut-projects/), or give us any feedback!

We are excited about the Micronaut framework’s future in 2023. Happy holidays!
