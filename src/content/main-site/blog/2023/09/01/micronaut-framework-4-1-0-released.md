---
slug: 2023/09/01/micronaut-framework-4-1-0-released
title: Micronaut Framework 4.1.0 Released!
description: 'The Micronaut Foundation is excited to announce the release of Micronaut framework 4.1.0! It contains a minor release of Micronaut Core with exciting features: Bean Mappers With Bean Mappers you can automatically create a mapping between one type and another. @Introspected public record Contact(String name) { } @Introspected public record ContactEntity(String firstName, String lastName)...'
date: '2023-09-01T19:45:50'
modified: '2023-09-01T19:45:50'
sourceUrl: https://micronaut.io/2023/09/01/micronaut-framework-4-1-0-released/
wordpressId: 6638
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags: []
href: /2023/09/01/micronaut-framework-4-1-0-released/
---

The Micronaut Foundation is excited to announce the release of Micronaut framework 4.1.0!

It contains a minor release of [Micronaut Core](https://github.com/micronaut-projects/micronaut-core//releases/tag/v4.1.3) with exciting features:

## Bean Mappers

With [Bean Mappers](https://docs.micronaut.io/latest/guide/#beanMappers) you can automatically create a mapping between one type and another.

```
@Introspected
public record Contact(String name) {
}

@Introspected
public record ContactEntity(String firstName, String lastName) {
}

public interface ContactMapper {
    @Mapper.Mapping(
        to = "name",
        from = "#{entity.firstName + ' ' + entity.lastName}"
    )

    Contact contactEntityToContact(ContactEntity entity);

}

@MicronautTest
class ContactMapperTest {
    @Inject
    ContactMapper contactMapper;

    @Test
    void mappingWithExpressionsWork() {
         ContactEntity e = new ContactEntity("Sergio", "del Amo");
        assertEquals(new Contact("Sergio del Amo"),
          contactMapper.contactEntityToContact(e));
    }
}
```

As illustrated in the previous example, you can use the [compile-time, reflection-free and type safe Expression Language](https://docs.micronaut.io/latest/guide/#evaluatedExpressions) introduced in Micronaut framework 4.

## Introspection Builder

If a type can only be constructed via the builder pattern, you can use the builder member of the [**@Introspected**](https://docs.micronaut.io/latest/api/io/micronaut/core/annotation/Introspected.html) annotation to generate a dynamic builder.

```
@Introspected(builder = @Introspected.IntrospectionBuilder(
builderClass = Person.Builder.class
))
public class Person {
    private final String name;
    private Person(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
    public static Builder builder() {
        return new Builder();
    }
    public static final class Builder {
        private String name;
        public Builder name(String name) {
            this.name = name;
            return this;
    }
        public Person build() {
            Objects.requireNonNull(name);
            return new Person(name);
        }
    }
}
BeanIntrospection<Person> introspection =
  BeanIntrospection.getIntrospection(Person.class);
BeanIntrospection.Builder<Person> builder = introspection.builder();
Person person = builder
    .with("name", "Fred")
    .build();
```

## KSP Improvements

Micronaut Framework 4.1. contains multiple improvements for users building Micronaut applications with [Kotlin Symbol Processing (KSP)](https://docs.micronaut.io/latest/guide/#ksp)

## Micronaut Data

This release contains a minor release of ​​[Micronaut Data](https://github.com/micronaut-projects/micronaut-data/releases/tag/v4.1.0) which supports nested transaction propagation.

## Micronaut Flyway

This release contains a minor release of ​​[Micronaut Flyway](https://github.com/micronaut-projects/micronaut-flyway/releases/tag/v6.1.0) which updates to Flyway 9.12.2.

## Micronaut Kafka

This release contains a minor release of ​​[Micronaut Kafka](https://github.com/micronaut-projects/micronaut-kafka/releases/tag/v5.1.0) with multiple features, including improvements around [Kafka Offsets](https://micronaut-projects.github.io/micronaut-kafka/latest/guide/#kafkaSeek) and multi-language documentation.

## Micronaut Security

This release contains a minor release of ​​[Micronaut Security](https://github.com/micronaut-projects/micronaut-security/releases/tag/v4.1.0), which adds extra information to the [login failed event](https://micronaut-projects.github.io/micronaut-security/latest/guide/#securityEvents) to ease debugging.

## Micronaut Logging

This release contains a minor release of ​​[Micronaut Logging](https://github.com/micronaut-projects/micronaut-logging/releases/tag/v1.1.0) which updates to [Logback 1.4.11](https://logback.qos.ch/news.html#1.3.11).

## Micronaut Email

This release contains a minor release of Micronaut Email which improves `reply-to` support and `Attachment.disposition`.

## Neo4j

This release removes the Neo4j test harness in favor of Testcontainers Neo4j. `EmbeddedNeo4jServer`– which utilizes the test harness – has been deprecated and will be removed in a future version.

## Micronaut OpenAPI

This release contains a minor release of ​​[Micronaut OpenAPI](https://github.com/micronaut-projects/micronaut-openapi/releases/tag/v5.1.0), which continues to improve the compile-time generation of [OpenAPI](https://spec.openapis.org/oas/latest.html) documentation for your Micronaut application.

## Micronaut RabbitMQ

This release contains a minor release of ​​[Micronaut RabbitMQ](https://github.com/micronaut-projects/micronaut-rabbitmq/releases/tag/v4.1.0), which adds support for AMQP “mandatory” flag and triggers application events before/after a RabbitMQ consumer subscribes to a queue.

## Micronaut Serialization

This release contains all the improvements of [Micronaut Serialization](https://github.com/micronaut-projects/micronaut-serialization/releases) with support for decoding base64 to byte\[\], improvements to *JsonUnwrapped*, and support for *@JsonDeserialize(builder=…)*.

## Micronaut Servlet

This release contains a minor release of ​​[Micronaut Servlet](https://github.com/micronaut-projects/micronaut-servlet/releases/tag/v4.1.0) with updates to embedded undertow and tomcat and [it documents how to use external configuration in WAR deployments](https://micronaut-projects.github.io/micronaut-servlet/snapshot/guide/index.html#externalConfig).

## NEXT STEPS

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
