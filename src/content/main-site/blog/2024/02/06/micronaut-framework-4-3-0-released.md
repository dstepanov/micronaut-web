---
slug: 2024/02/06/micronaut-framework-4-3-0-released
title: Micronaut Framework 4.3.0 Released!
description: Micronaut Core Micronaut Core contains several improvements, including performance optimizations and enhancements to the Kotlin Symbol Processing (KSP) integration. Kotlin 1.9.22 This minor release updates to Kotlin 1.9.22 and KSP 1.9.22-1.0.17. New Modules Micronaut Chabots Micronaut Chatbots eases the creation of ChatBots (in this first release, with support for Telegram and Basecamp). Micronaut EclipseStore Micronaut...
date: '2024-02-06T18:14:26'
modified: '2024-02-06T18:14:26'
sourceUrl: https://micronaut.io/2024/02/06/micronaut-framework-4-3-0-released/
wordpressId: 6837
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2024/02/06/micronaut-framework-4-3-0-released/
---

## Micronaut Core

[Micronaut Core](https://docs.micronaut.io/latest/guide) contains several improvements, including performance optimizations and enhancements to the [Kotlin Symbol Processing (KSP)](https://docs.micronaut.io/latest/guide/#ksp) integration.

## Kotlin 1.9.22

This minor release updates to [Kotlin 1.9.22](https://github.com/JetBrains/kotlin/releases/tag/v1.9.22) and KSP 1.9.22-1.0.17.

## New Modules

### Micronaut Chabots

[Micronaut Chatbots](https://micronaut-projects.github.io/micronaut-chatbots/snapshot/guide/#telegram) eases the creation of ChatBots (in this first release, with support for [Telegram](https://core.telegram.org/bots/api) and [Basecamp](https://github.com/basecamp/bc3-api/blob/master/sections/chatbots.md)).

### Micronaut EclipseStore

[Micronaut EclipseStore](https://micronaut-projects.github.io/micronaut-eclipsestore/snapshot/guide/) is a new module which adds integration with [EclipseStore](https://eclipsestore.io/). Eclipse Store is the successor of the [MicroStream](https://github.com/microstream-one/microstream) project., Technically this project is identical to MicroStream 8, which was the last stable version of MicroStream itself.

> EclipseStore is a breakthrough Java-native persistence layer built for cloud-native microservices and serverless apps.
>
> EclipseStore is also great for monoliths and runs on Android mobile, edge, and embedded devices.

## Expression Language Support

### Micronaut Multi-tenancy

[Micronaut Multi-tenancy](https://micronaut-projects.github.io/micronaut-multitenancy/latest/guide/) allows [using the current request tenant ID with Micronaut Expression Language](https://micronaut-projects.github.io/micronaut-multitenancy/latest/guide/#tenantexpression).

### Micronaut Cache

[Micronaut Cache](https://micronaut-projects.github.io/micronaut-cache/latest/guide/) adds support for [conditional caching with expression language expressions](https://micronaut-projects.github.io/micronaut-cache/latest/guide/#conditional).

```
    @Cacheable(condition = "#{id.value > 5}")
    public String get(Id id) {
        return repository.get(id);
}
```

Moreover, it updates to:

- [Infinispan](https://infinispan.org/) 14.0.22
- [Hazelcast](https://hazelcast.com) 5.3.6

## Build Plugins

### Native Image Build Tools

[Micronaut Gradle Plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/) and [Micronaut Maven Plugin](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/) plugins update to [Native Image Build tools 0.10.0](https://graalvm.github.io/native-build-tools/latest/gradle-plugin.html).

### AmazonLinux:2023 base image

[Micronaut Gradle Plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/) task `buildNativeLambda` and [Micronaut Maven Plugin](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/) goal `mvn package -Dpackaging=docker-native -Dmicronaut.runtime=lambda` generates a GraalVM native executable inside a Docker container to be deployed in AWS Lambda Custom runtime. They both use `amazonLinux:2023` as base image.

### Micronaut Gradle Plugin

[Micronaut Gradle Plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/) improves the docker support – with multi-layer docker files and changes the default base image to gr.dev/chainguard/wolfi-base:latest.

### Micronaut Maven Plugin

[Micronaut Maven Plugin](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/) improves its Java 21 support.

### Micronaut Platform BOM

Micronaut Platform Bill of Materials (BOM) inlines all the versions defined in the different modules BOMs, to allow users to override any dependency version by simply overriding the corresponding property. It is noteworthy that this was previously feasible with Micronaut framework 3, and the aforementioned behavior has been restored.

## Cloud

### Micronaut GCP

[Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/) has added support for [Pub/Sub Push subscriptions](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#pubsub) via a new @PushSubscription annotation. This enables the processing of Push messages using the same programming model as the existing support for Pull subscriptions. With Push subscriptions, the PubSub service pushes messages to your application via HTTP, as opposed to the Pull style of subscription which requires your application to have a continually running background process to receive messages. Push subscriptions are generally required when using one of GCP’s serverless solutions, such as Cloud Run.

### Micronaut AWS

[Micronaut AWS](https://micronaut-projects.github.io/micronaut-aws/latest/guide/) updates to:

- [AWS SDK for Java 2.0](https://github.com/aws/aws-sdk-java-v2) 2.23.14
- [AWS SDK for Java 1.0](https://github.com/aws/aws-sdk-java) 1.12.648

If you use Micronaut AWS Lambda, we strongly recommend upgrading to Micronaut Framework 4.3.0, as you will get cold startup improvements.

### Micronaut Azure

[Micronaut Azure](https://micronaut-projects.github.io/micronaut-azure/latest/guide/) updates to:

- Cosmos 4.54.0
- [Azure SDK](https://learn.microsoft.com/en-us/azure/developer/java/sdk/overview) 1.2.19
- [Library for Azure Java Functions](https://github.com/Azure/azure-functions-java-library) 3.1.0

### Micronaut GCP

[Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/) updates to:

- [Google Cloud Core](https://github.com/googleapis/sdk-platform-java/tree/main/java-core) 2.31.0
- [Google Secret Management Client for Java](https://github.com/googleapis/google-cloud-java/tree/main/java-secretmanager) 2.33.0
- [Google Cloud Pub/Sub Client for Java](https://github.com/googleapis/java-pubsub) 1.126.1
- [Google Auth Library](https://github.com/googleapis/google-auth-library-java) 1.22.0

### Micronaut Oracle Cloud

[Micronaut Oracle Cloud](https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/) updates to:

- [Oracle Cloud Infrastructure SDK](https://github.com/oracle/oci-java-sdk) 3.31.1
- [Oracle JDBC](https://www.oracle.com/database/technologies/appdev/jdbc-downloads.html) 21.11.0.0.
- [Fn Project](https://github.com/fnproject) 1.0.182

## Database Migration

### Micronaut Flyway

[Micronaut Flyway](https://micronaut-projects.github.io/micronaut-flyway/latest/guide/index.html) updates to a [Flyway 10](https://flywaydb.org/blog/flyway-v10-has-landed), the latest major version of Flyway.

### Micronaut Liquibase

[Micronaut Liquibase](https://micronaut-projects.github.io/micronaut-liquibase/latest/guide/) updates to Liquibase 4.25.1.

## Other

### Micronaut Data

[Micronaut Data](https://github.com/micronaut-projects/micronaut-data/releases/tag/v4.2.0) adds multiple improvements and it updates to:

- Azure Cosmos 5.3.0

### Micronaut Serialization

[Micronaut Serialization](https://micronaut-projects.github.io/micronaut-serialization/latest/guide/) continues to improve with enhancements for @JsonTypeInfo, JsonValue, and @JsonView. Moreover, it adds the method [ObjectMapper::cloneWithConfiguration](<https://micronaut-projects.github.io/micronaut-serialization/latest/api/io/micronaut/serde/ObjectMapper.html#cloneWithConfiguration(io.micronaut.serde.config.SerdeConfiguration,io.micronaut.serde.config.SerializationConfiguration,io.micronaut.serde.config.DeserializationConfiguration%29>).

### Micronaut Security

[Micronaut Security](https://micronaut-projects.github.io/micronaut-security/latest/guide/) adds the [auditing annotations `@CreatedBy` and `@UpdatedBy`](https://micronaut-projects.github.io/micronaut-security/latest/guide/#annotations), and an [imperative API to simplify the creation of beans of type `AuthenticationProvider`](https://micronaut-projects.github.io/micronaut-security/latest/guide/#imperativeAuthenticationProviders).

### Micronaut Validation

[Micronaut Validation](https://micronaut-projects.github.io/micronaut-validation/latest/guide/) allows for constraints with `validatedBy = MyValidator.class` to load validator from the bean context.

### Micronaut Logging

- [Slf4j](https://slf4j.org/) 2.0.11
- [Log4j2](https://logging.apache.org/log4j/2.x/) 2.22.1
- [Logback](https://logback.qos.ch/) 1.4.14

### Micronaut Reactor

- [Project Reactor](https://projectreactor.io/) 2023.0.1

### Micronaut ACME

[Micronaut ACME](https://micronaut-projects.github.io/micronaut-acme/latest/guide/) updates to [acme4j-client](https://github.com/shred/acme4j) 3.

### Micronaut Elasticsearch

[Micronaut](https://micronaut-projects.github.io/micronaut-elasticsearch/latest/guide/) Elasticsearch updates to Elasticsearch 8.12.0.

### Micronaut Email

[Micronaut Email](https://micronaut-projects.github.io/micronaut-email/latest/guide/) updates to:

- [Postmark](https://github.com/activecampaign/postmark-java) 1.11.1
- [Sendgrid](https://github.com/sendgrid/sendgrid-java) 4.10.1

### Micronaut GraphQL

[Micronaut GraphQL](https://micronaut-projects.github.io/micronaut-graphql/latest/guide/) updates to [GraphQL Java Tools](https://github.com/graphql-java-kickstart/graphql-java-tools).

### Micronaut gRPC

[Micronaut gRPC](https://micronaut-projects.github.io/micronaut-grpc/latest/guide/) updates to:

- gRPC 1.61.0
- protobuf 3.25.2

### Micronaut JMS

[Micronaut JMS](https://micronaut-projects.github.io/micronaut-jms/latest/guide/) updates to:

- [Apache ActiveMQ](https://activemq.apache.org/) 5.18.3
- [ActiveMQ Artmeis](https://activemq.apache.org/components/artemis/) 2.31.2.

### Micronaut Kafka

[Micronaut Kafka](https://micronaut-projects.github.io/micronaut-kafka/latest/guide/) updates to Kafka `3.6.1`.

### Micronaut Kubernetes

[Micronaut Kubernetes](https://micronaut-projects.github.io/micronaut-kubernetes/latest/guide/) updates [Kubernetes & OpenShift Java Client](https://github.com/fabric8io/kubernetes-client) to 6.10.0 and [Kubernetes Java Client](https://github.com/kubernetes-client/java) to 19.0.0.

### Micronaut Logging

[Micronaut Logging](https://micronaut-projects.github.io/micronaut-logging/latest/guide/) updates to Logback 1.4.14, log4j2 2.22.1 and slf4j 2.0.11.

### Micronaut Micrometer

[Micronaut Micrometer](https://micronaut-projects.github.io/micronaut-micrometer/latest/guide/) updates to Micrometer 1.12.0.

### Micronaut MongoDB

[Micronaut MongoDB](https://micronaut-projects.github.io/micronaut-mongodb/latest/guide/) updates to Mongo 4.11.1.

### Micronaut Neo4J

[Micronaut Neo4j](https://micronaut-projects.github.io/micronaut-neo4j/latest/guide/) updates to Neo4J Java driver and Neo4J Harness 5.15.0.

### Micronaut NATS

[Micronaut NATS](https://micronaut-projects.github.io/micronaut-nats/latest/guide/) updates to [jnats](https://github.com/nats-io/nats.java) 2.17.2.

### Micronaut Open API

[Micronaut OpenAPI](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/) adds [OpenAPI Explorer View](https://github.com/Authress-Engineering/openapi-explorer) and many other improvements driven by [altro3](https://github.com/altro3), a community contributor.

### Micronaut Pulsar

[Micronaut Pulsar](https://micronaut-projects.github.io/micronaut-pulsar/latest/guide/) updates `pulsar-client-original` to 3.1.2.

### Micronaut Kotlin

[Micronaut Kotlin](https://micronaut-projects.github.io/micronaut-kotlin/latest/guide/) updates to [Ktor](https://ktor.io/) 2.3.7.

### Micronaut Servlet

[Micronaut Servlet](https://micronaut-projects.github.io/micronaut-servlet/latest/guide/) updates to:

- [Jetty](https://eclipse.dev/jetty/) 11.0.19
- [Tomcat](https://tomcat.apache.org/) 10.1.18

### Micronaut Spring

[Micronaut Spring](https://micronaut-projects.github.io/micronaut-spring/latest/guide/) updates to:

- [Spring Boot](https://spring.io/projects/spring-boot) 3.2.1.
- [Spring Framework](https://spring.io/projects/spring-framework) 6.1.3

### Micronaut SQL

[Micronaut SQL](https://micronaut-projects.github.io/micronaut-sql/latest/guide/) updates to:

- [Hibernate](https://hibernate.org/) 6.4.3
- [Hibernate Reactive](https://hibernate.org/reactive/) 2.2.2.Final
- [jOOQ](https://www.jooq.org/) 3.19.3
- JDBI 3.44.0
- [MariaDB](https://mariadb.org/) 3.3.2
- [MySQL](https://www.mysql.com/) 8.3.0
- [Tomcat JDBC](https://tomcat.apache.org/tomcat-10.1-doc/jdbc-pool.html) 10.1.18
- [Vert.x](https://vertx.io/) 4.5.2

### Micronaut Test

[Micronaut Test](https://micronaut-projects.github.io/micronaut-test/latest/guide/) updates to:

- [JUnit 5](https://junit.org/junit5/) 5.1.0.1
- [KoTest](https://kotest.io/) 5.8.0
- [Mockk](https://mockk.io/) 1.13.9
- [AssertJ](https://github.com/assertj/assertj) 3.25.1
- [Mockito](https://site.mockito.org/) 5.9.0
- [Rest Assured](https://rest-assured.io/) 5.4.0

### Micronaut Test Resources

[Micronaut Test Resources](https://micronaut-projects.github.io/micronaut-test-resources/latest/guide/) updates to:

- [Testcontainers](https://testcontainers.com/) 1.19.4

### Micronaut Tracing

[Micronaut Tracing](https://micronaut-projects.github.io/micronaut-tracing/latest/guide/) updates to [OpenTelemetry](https://opentelemetry.io/) version 1.32.0.

### Micronaut Views

[Micronaut Views](https://github.com/micronaut-projects/micronaut-views/releases/tag/v4.1.0) updates:

- [jte](https://jte.gg/) to 3.1.6
- [Pebble](https://pebbletemplates.io/) 3.2.2
- [JStachio](https://github.com/jstachio/jstachio) 1.3.4

### Micronaut Cassandra

[Micronaut Cassandra](https://micronaut-projects.github.io/micronaut-cassandra/latest/guide/) adds documentation for [configuring SSL integration with the Cassandra DataStax Java Driver](https://micronaut-projects.github.io/micronaut-cassandra/latest/guide/#ssl).

## NEXT STEPS

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
