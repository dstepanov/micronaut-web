---
slug: 2024/11/14/micronaut-framework-4-7-0-released
title: Micronaut Framework 4.7.0 Released!
description: 'Micronaut Framework 4.7.0 updates the Micronaut Platform BOM (Bill of materials) to the following releases: Core Micronaut Core contains multiple improvements. To highlight a few, it improves the HTTP Client implementations, the display of circular dependency errors, adds a new API FilterBodyParser, the possibility to disable normalization of property keys in @EachProperty beans, and it...'
date: '2024-11-14T09:42:46'
modified: '2024-11-14T09:42:46'
sourceUrl: https://micronaut.io/2024/11/14/micronaut-framework-4-7-0-released/
wordpressId: 7048
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags: []
href: /2024/11/14/micronaut-framework-4-7-0-released/
---

Micronaut Framework 4.7.0 updates the Micronaut Platform BOM (Bill of materials) to the following releases:

## Core

[Micronaut Core](https://github.com/micronaut-projects/micronaut-core/releases) contains multiple improvements. To highlight a few, it improves the HTTP Client implementations, the display of circular dependency errors, adds a new API `FilterBodyParser`, the possibility to disable normalization of property keys in `@EachProperty` beans, and it adds nicer HTML error pages.

## LangChain4J

[Micronaut LangChain4J](https://micronaut-projects.github.io/micronaut-langchain4j/latest/guide/) provides integration with [Langchain4j](https://docs.langchain4j.dev/).

For example, [Micronaut LangChain4J](https://micronaut-projects.github.io/micronaut-langchain4j/latest/guide/) makes easy to inject your favourite language model in your Micronaut beans:

```
import dev.langchain4j.model.chat.ChatLanguageModel;
import jakarta.inject.Singleton;

@Singleton
class DefaultJokeGenerator implements JokeGenerator {
    private final ChatLanguageModel model;
    DefaultJokeGenerator(ChatLanguageModel model) {
        this.model = model;
    }

    @Override
    public String generateJoke() {
        return model.generate("Tell me a joke about Java?");
    }
}
```

## GraalPy

[Micronaut Graal Languages](https://micronaut-projects.github.io/micronaut-graal-languages/latest/guide/) is a collection of components for integration of [Graal based dynamic languages](https://www.graalvm.org/latest/graalvm-as-a-platform/language-implementation-framework/Languages/) with Micronaut Framework.

With Micronaut GraalPy eases exposing Python modules as Java Beans within a Micronaut application. We published two guides:

- [Creating your first Micronaut Graalpy Application](https://guides.micronaut.io/latest/micronaut-graalpy.html)
- [Creating a Micronaut Graalpy application using a python package](https://guides.micronaut.io/latest/micronaut-graalpy-python-package.html)

## Build Plugins

There are new versions of both [Maven](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/) `4.7.1`, and [Gradle `4.4.4`](https://plugins.gradle.org/u/micronaut) Plugins.

## Micronaut Security

[Micronaut Security](https://micronaut-projects.github.io/micronaut-security/latest/guide/) adds a new module, [Micronaut Security Cross-Site Request Forgery (CSRF)](https://micronaut-projects.github.io/micronaut-security/latest/guide/index.html#csrf) to help you protect your applications against CSRF attacks. CSRF protection is integrated also in Micronaut Views with a [CSRF Token View Model Processor](https://micronaut-projects.github.io/micronaut-views/latest/guide/#_csrf_token_view_model_processor), and [CSRF hidden field in form generation](https://micronaut-projects.github.io/micronaut-views/latest/guide/#csrfHidden).

## Micrometer

[Micronaut Micrometer](https://micronaut-projects.github.io/micronaut-micrometer/latest/guide/) updates to Micrometer 1.13.6 and it adds new module for [Prometheus PushGateway](https://micronaut-projects.github.io/micronaut-micrometer/latest/guide/#metricsAndReportersPrometheusPushGateway).

## Cloud

- [Micronaut AWS](https://micronaut-projects.github.io/micronaut-aws/latest/guide/) updates to AWS lambda Events 3.14.0, AWS SDK v1 1.12.777, and AWS SDK v2 2.29.11.
- [Micronaut Azure](https://micronaut-projects.github.io/micronaut-azure/latest/guide/) updates to Azure Cosmos 4.64.0, and Azure SDK 1.2.29.
- [Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide/) updates to Google Auth Library OAuth2 HTTP 1.29.0, Google Cloud Core 2.47.0, Google Cloud PubSub 1.134.1, and Google Secret Manager 2.53.0.
- [Micronaut Oracle Cloud](https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/) updates to OCI SDK `3.53.0`.
- [Micronaut Tracing](https://micronaut-projects.github.io/micronaut-tracing/latest/guide/) adds the module [Micronaut Tracing OpenTelemetry JDBC](https://micronaut-projects.github.io/micronaut-tracing/latest/guide/#jdbc) to create span objects on the every JDBC query, and it updates to OpenTelemetry BOM 1.43.0.

## Analytics

- [Micronaut ElasticSearch](https://micronaut-projects.github.io/micronaut-elasticsearch/latest/guide/) updates to [ElasticSearch 8.15.3](https://github.com/elastic/elasticsearch/releases/tag/v8.15.3).
- [Micronaut OpenSearch](https://micronaut-projects.github.io/micronaut-opensearch/latest/guide/) updates to [OpenSearch 2.16.0](https://github.com/opensearch-project/opensearch-java/releases/tag/v2.16.0).

## Persistence

- [Micronaut OpenAPI](https://github.com/micronaut-projects/micronaut-openapi/releases) keeps getting better and better thanks to community contribution.
- [Micronaut Data](https://micronaut-projects.github.io/micronaut-data/latest/guide/) contains multiple improvements. Among others, it includes improvements to pagination and [Criteria](https://micronaut-projects.github.io/micronaut-data/latest/guide/#dbcCriteriaSpecifications).
- [Micronaut SQL](https://micronaut-projects.github.io/micronaut-sql/latest/guide/) updates `ojdbc` to `23.5.0.24.07`, MariaDB to `3.5.0`, and MySQL Connector to `9.1.0`, Hikari to `6.0.0`, and Tomcat JDBC to `11.0.1`. Moreover, it is now possible to disable individual datasources both in JPA and JDBC.
- [Micronaut R2DBC](https://micronaut-projects.github.io/micronaut-r2dbc/latest/guide/) updates to `r2dbc-io-asyncer-mysql` to `1.3.0`, `r2dbc-mariadb` to `1.3.0`, and `r2dbc-postgresql` to `1.0.7.RELEASE`.
- [Micronaut MongoDB](https://micronaut-projects.github.io/micronaut-mongodb/latest/guide/) updates to [Mongo Java Driver `4.11.4`](https://github.com/mongodb/mongo-java-driver/releases/tag/r4.11.4).

## Database Migration

- [Micronaut Flyway](https://micronaut-projects.github.io/micronaut-flyway/latest/guide/) updates to [Flyway 10.21.0.Final](https://github.com/flyway/flyway/releases/tag/flyway-10.21.0).

## Reactive Libraries

- [Micronaut reactor](https://micronaut-projects.github.io/micronaut-reactor/latest/guide/) updates to Project Reactor bill of materials (BOM) `2023.0.12`.

## Misc

- [Micronaut Test](https://micronaut-projects.github.io/micronaut-test/latest/guide/) updates to [JUnit5](https://junit.org/junit5/) `5.11.3`, and [Mockito](https://site.mockito.org/) `5.14.2`.
- [Micronaut Servlet](https://micronaut-projects.github.io/micronaut-servlet/latest/guide/) updates to [Undertow](https://undertow.io/) `2.3.18`, [Apache Tomcat](https://tomcat.apache.org/) `10.1.31`, and [Jetty](https://jetty.org/) `11.0.24`.
- [Micronaut Kubernetes](https://micronaut-projects.github.io/micronaut-kubernetes/latest/guide/) adds a new module `micronaut-kubernetes-client-openapi`.
- [Micronaut Object Storage](https://micronaut-projects.github.io/micronaut-object-storage/latest/guide/) adds a new API [StreamingFileUploadRequest](https://micronaut-projects.github.io/micronaut-object-storage/latest/api/io/micronaut/objectstorage/request/StreamingFileUploadRequest.html).
- [Micronaut Spring](https://micronaut-projects.github.io/micronaut-spring/latest/guide/) updates to Spring Boot `3.3.5` and Spring `6.1.14`.
- [Micronaut Kafka](https://micronaut-projects.github.io/micronaut-kafka/latest/guide/) updates to [Apache Kafka `3.8.1`](https://github.com/apache/kafka/releases/tag/3.8.1).
- [Micronaut Neo4J](https://micronaut-projects.github.io/micronaut-neo4j/latest/guide/) updates to [Neo4J Java Driver `5.26.1`](https://github.com/neo4j/neo4j-java-driver/releases/tag/5.26.1).
- [Micronaut NATS](https://micronaut-projects.github.io/micronaut-nats/latest/guide/) updates to [NATS Java Client `2.20.4`](https://github.com/nats-io/nats.java/releases/tag/2.20.4).
- [Micronaut GraphQL](https://micronaut-projects.github.io/micronaut-graphql/latest/guide/) updates to [GraphQL 22.3](https://github.com/graphql-java/graphql-java/releases/tag/v22.3), and [GraphQL Java Tools 14.0.0](https://github.com/graphql-java-kickstart/graphql-java-tools/releases/tag/v14.0.0).
- [Micronaut Multi-tenancy](https://micronaut-projects.github.io/micronaut-multitenancy/latest/guide/) adds support for [Tenancy Binding](https://micronaut-projects.github.io/micronaut-multitenancy/latest/guide/#bindingResolvedTenant).
- [Micronaut JMS](https://micronaut-projects.github.io/micronaut-jms/latest/guide/) updates to `activemq-jakarta` to `6.1.3`, and `artemis-jakarta-client` to `2.38.0`.
- [Micronaut Pulsar](https://micronaut-projects.github.io/micronaut-logging/latest/guide/) updates to [Pulsar Client 3.3.2](https://pulsar.apache.org/docs/3.3.x/client-libraries-java/)
- [Micronaut gRPC](https://micronaut-projects.github.io/micronaut-grpc/latest/guide/) updates to [gRPC 1.68.1](https://github.com/grpc/grpc-java/releases/tag/v1.68.1)
- [Micronaut Logging](https://micronaut-projects.github.io/micronaut-logging/latest/guide/) updates to [Logback 1.5.12](https://logback.qos.ch/news.html#1.5.12)
- [Micronaut Cache](https://micronaut-projects.github.io/micronaut-cache/latest/guide/) updates to [Infinispan](https://infinispan.org/) 15.0.10.Final.
- [Micronaut Email](https://micronaut-projects.github.io/micronaut-email/latest/guide/) updates to [SendGrid 4.10.3](https://github.com/sendgrid/sendgrid-java/releases/tag/4.10.3).

## NEXT STEPS

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
