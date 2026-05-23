---
slug: 2023/07/14/micronaut-framework-4-0-0-released
title: Micronaut Framework 4.0.0 Released!
description: The Micronaut Foundation is excited to announce the general availability (GA) release of Micronaut framework 4! What’s New in Micronaut Framework 4? Language Baselines Micronaut framework 4 updates to Apache Groovy 4, Kotlin 1.8 and sets the Java baseline to 17. Kotlin If you use Kotlin, you can build your Micronaut applications with KSP (Kotlin...
date: '2023-07-14T09:16:01'
modified: '2023-08-22T16:36:13'
sourceUrl: https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/
wordpressId: 6500
contentSource: wordpress-post
category: micronaut-4
categories:
  - micronaut-4
  - release-announcements
tags:
  - release
href: /2023/07/14/micronaut-framework-4-0-0-released/
---

**The Micronaut Foundation is excited to announce the general availability (GA) release of Micronaut framework 4!**

## What’s New in Micronaut Framework 4?

### Language Baselines

Micronaut framework 4 updates to [Apache Groovy 4](http://groovy-lang.org/releasenotes/groovy-4.0.html), [Kotlin 1.8](https://kotlinlang.org/docs/whatsnew18.html) and sets the [Java baseline to 17](https://micronaut.io/2023/02/16/micronaut-framework-4-0-with-java-17-baseline/).

### Kotlin

If you use Kotlin, you can [build your Micronaut applications with KSP (Kotlin Symbol Processing)](https://kotlinlang.org/docs/ksp-overview.html). While KSP support is only available for Gradle, [Kapt](https://kotlinlang.org/docs/kapt.html) is still available for Gradle and Maven.

In addition, Micronaut Kotlin updates to [Ktor 2](https://blog.jetbrains.com/ktor/2022/04/11/ktor-2-0-released/).

### GraalVM

**Micronaut framework 4 supports the**[**latest GraalVM release**](https://www.graalvm.org/release-notes/)**and shifted to runtime initialisation for GraalVM** to ensure consistency in behavior between JIT and Native applications.

Additionally, the required metadata for GraalVM now resides on the [GraalVM Reachability Metadata Repository](https://github.com/oracle/graalvm-reachability-metadata) and both Micronaut Gradle and Maven plugins use it by default.

The Micronaut Foundation continues to invest to bring you the best GraalVM integration.  As an example, we added JUnit 5 native tests across the Framework infrastructure.

### Gradle 8

If you use Gradle to build your Micronaut applications, Micronaut framework 4 now requires [Gradle 8](https://gradle.org/whats-new/gradle-8/).

### Expression Language

Micronaut framework 4 introduces an [expression language](https://docs.micronaut.io/latest/guide/#evaluatedExpressions) which allows you to put expressions in annotations. Micronaut expression language is designed to be secure by default. It is not possible to compile expressions at runtime from untrusted user input. All expressions are evaluated at compilation time, are type-checked, and they are reflection free making them GraalVM ready.

For example, you can [use expressions with Micronaut Security @Secured annotation](https://micronaut-projects.github.io/micronaut-security/snapshot/guide/index.html#securedExpression).

`@Secured("#{user?.attributes?.get('email') = 'sherlock@micronaut.example' }")`

### Virtual Threads (Loom)

Micronaut framework 4 detects virtual thread support (available since Java 19 as a preview feature), and uses it for the executor named BLOCKING if available. If the Java version does not support virtual threads, the Framework aliases this executor to IO.

You can replace `@ExecutesOn(IO)` with `@Executes(BLOCKING)` to get ready.

### HTTP Improvements

#### Rewritten HTTP layer

The HTTP layer has been rewritten to improve performance and reduce the presence of reactive stack frames if reactive is not used (such as with Virtual threads).

#### Experimental Support for HTTP/3 and io_uring

Micronaut framework 4 includes [experimental support for HTTP/3](https://docs.micronaut.io/latest/guide/index.html#http3Server) and [experimental support](https://docs.micronaut.io/latest/guide/index.html#serverConfiguration) for [io_uring](https://en.wikipedia.org/wiki/Io_uring) via the Netty incubator project.

### Annotation-Based Filters

Micronaut framework 4 adds annotation-based filters; an additional way to write server and client filters. You can write filters without writing any line of reactive code. When used with Virtual Threads, annotation-based filters allow the Framework to optimize throughput and remove unnecessary reactive stack frames, improving performance.

```
@ServerFilter("/hello/**")
class TraceFilter {
    @Inject TraceService traceService;
    @RequestFilter
    @ExecuteOn(TaskExecutors.BLOCKING)
    public void filterRequest(HttpRequest<?> request) {
          traceService.trace(request);
    }
    @ResponseFilter
    public void filterResponse(MutableHttpResponse<?> res) {
        res.getHeaders().add("X-Trace-Enabled", "true");
    }
}
```

### Java HTTP Client

Micronaut framework 4 offers a new implementation of the Micronaut HTTP Client. You can keep using the [Netty-based implementation](https://docs.micronaut.io/latest/guide/#nettyHttpClient) or use [a lighter implementation](https://docs.micronaut.io/latest/guide/#jdkHttpClient) based on the [Java HTTP Client](https://openjdk.org/groups/net/httpclient/intro.html).

Please refer to this recording [about the new HTTP Clien](https://www.youtube.com/watch?v=3pnQJARawj0) t for further explanation.

### Client/Server Generation From an OpenAPI Spec

Both [Gradle](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/#_openapi_code_generation) and [Maven](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/examples/openapi.html) plugins support the generation of code for an HTTP client or server given an OpenAPI Specification file.

### YAML Configuration

[Micronaut framework 4.0 no longer exposes SnakeYAML as a transitive dependency](https://micronaut.io/2023/02/19/micronaut-framework-4-0-and-snakeyaml-transitive-dependency/).

### JSON Serialisation

[Micronaut framework 4.0 does not expose Micronaut Jackson Databind as a transitive dependency](https://micronaut.io/2023/02/27/micronaut-framework-4-0-and-micronaut-jackson-databind-transitive-dependency/). You have to choose whether you want to use Micronaut Serialization or Micronaut Jackson databind.

### Jakarta Transition

We have finished the Jakarta transition. Instead of using `javax.validation` use `jakarta.validation`. Instead of `javax.mail` use `jakarta.mail`. Instead of `javax.transaction.Transactional`, use `jakarta.transaction.Transactional` and replace the usage of `javax.persistence` with `jakarta.persistence`.

### Validation and Annotations on Type Arguments

[Micronaut Validation](https://micronaut-projects.github.io/micronaut-validation/snapshot/guide/) moved to a new repository, and it comes with [Bean Validation 3](https://beanvalidation.org/3.0/) support.

Micronaut framework 4 compilation time annotation metadata has been extended to support annotations on generic type arguments.

This support enables the ability to support Bean Validation 3 and declarations such as: `List<@NotBlank String> names`

### Improved Modularity

The built-in [Validation](https://micronaut-projects.github.io/micronaut-validation/snapshot/guide/), [Retry](https://docs.micronaut.io/latest/guide/#retry), [Service Discovery](https://micronaut-projects.github.io/micronaut-discovery-client/latest/guide/), [HTTP Session](https://micronaut-projects.github.io/micronaut-session/snapshot/guide/) and [WebSocket](https://docs.micronaut.io/latest/guide/#websocket) features have been split into separate modules allowing removal of this functionality if not needed.

In addition, the compiler has been rewritten allowing the split of compilation only types into a separate core-processor module that is no longer on the user compilation and runtime classpath. This allows for the removal of repackaged versions of ASM and Caffeine.

### Cloud Environment Detection Off by Default

To avoid paying the performance hit of detecting cloud environments each time you run or test your application, Micronaut framework 4 turns off cloud environment detection by default. If you rely on cloud environments to be present, please read the [Cloud Configuration](https://docs.micronaut.io/latest/guide/#cloudConfiguration) documentation to learn how you can enable cloud environment detection. Alternatively, you can set the [Micronaut environment](https://docs.micronaut.io/latest/guide/#environments) explicitly in your production environment.

### Mapped Injection

Micronaut framework 4 allows the injection of a `java.util.Map` of beans where the key is the bean name. The name of the bean is derived from the qualifier or (if not present) the simple name of the class.

### Arbitrary Nesting of Configuration Properties

With Micronaut framework 4, it is now possible to nest `@ConfigurationProperties` and `@EachProperty` annotations allowing for more dynamic configuration possibilities.

### Improved Error Messages

#### Improved Error Messages for Missing Configuration

Micronaut framework 4 improves error messages to display the configuration that is required to activate the bean when a bean is not present due to missing configuration (such as a bean that uses `@EachProperty`).

#### Improved Error Messages for Missing Beans

When a bean annotated with `@EachProperty` or `@Bean` is not found due to missing configuration an error is thrown, showing the configuration prefix necessary to resolve the issue.

#### Tracking of Disabled Beans

Beans that are disabled via Bean Requirements are now tracked and an appropriate error thrown if a bean has been disabled.

Disabled beans are visible via the [Beans Endpoint](https://docs.micronaut.io/latest/guide/#beansEndpoint) aiding in understanding the state of your application configuration.

### Micronaut Data

Micronaut Data adds support for [Hibernate 6](https://hibernate.org/orm/documentation/6.0/), [Hibernate Reactive 2](https://hibernate.org/reactive/releases/2.0/), and [Oracle JSON-Relational Duality Views](https://docs.oracle.com/en/database/oracle/oracle-database/23/jsnvu/overview-json-relational-duality-views.html#GUID-CE7227BF-B4AF-4024-A578-ED52795F4525).

### Every Runtime is Now HTTP Server TCK Compliant

Micronaut framework supports multiple runtimes:

- Netty
- Servlet (Jetty, Undertow, and Tomcat)
- Serverless (AWS Lambda, Google Cloud Http Functions and Azure HTTP functions)

With Micronaut framework 4, every runtime successfully passes the Micronaut framework HTTP Server TCK (Test Compatibility Kit).

### Micronaut MQTT

Micronaut MQTT adds [an implementation based on the HiveMQ MQTT Client](https://micronaut-projects.github.io/micronaut-mqtt/latest/guide/#hiveMq).

### Object Storage

[Object Storage adds Local Storage](https://micronaut-projects.github.io/micronaut-object-storage/latest/guide/#local) to ease local development and testing.

### GraphQL

The GraphQL module now supports the modern graphql-ws protocol for GraphQL subscriptions over WebSockets.

### Micronaut Discovery Client

[Micronaut Discovery Client](https://micronaut-projects.github.io/micronaut-discovery-client/latest/guide) supports Spring Cloud client basic authentication.

### Micronaut Control Panel

The [Micronaut Control Panel](https://micronaut-projects.github.io/micronaut-control-panel/snapshot/guide/) is a new module that provides a web UI allowing you to view and manage the state of your Micronaut application, typically in a development environment.

### Micronaut AWS Lambda

Micronaut framework 4 offers a major overhaul for Lambda integration.

With this release, Micronaut AWS offers built-in Lambda handlers for Amazon API Gateway [payloads v1 and v2](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) and a handler for Application Load Balancer. Lambda integration no longer relies on the AWS Serverless Java container library.

Moreover, `micronaut-function-aws` provides an implementation of `com.amazonaws.services.lambda.runtime.CustomPojoSerializer` which is loaded via SPI. This `CustomPojoSerialization` avoids your Micronaut function to pay a double hit when using a serialization library inside the Lambda function.

Additionally, a new module `io.micronaut.aws:micronaut-aws-lambda-events-serde` allows you to use [Micronaut Serialization](https://micronaut-projects.github.io/micronaut-serialization/latest/guide/) with [AWS Lambda Java Events](https://github.com/aws/aws-lambda-java-libs/tree/main/aws-lambda-java-events).

### Dependency Updates:

- [Micronaut ElasticSearch](https://micronaut-projects.github.io/micronaut-elasticsearch/latest/guide) updates to [ElasticSearch 8.8](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Micronaut Flyway](https://micronaut-projects.github.io/micronaut-flyway/latest/guide) updates to Flyway 9
- [Micronaut Hibernate Validator](https://micronaut-projects.github.io/micronaut-hibernate-validator/latest/guide) updates to [Hibernate Validator 8](https://hibernate.org/validator/releases/8.0/)
- [Micronaut Kafka](https://micronaut-projects.github.io/micronaut-kafka/latest/guide) updates to Kafka 3
- [Micronaut Neo4J](https://micronaut-projects.github.io/micronaut-neo4j/latest/guide) updates to [Neo4j 5](https://neo4j.com/docs/upgrade-migration-guide/current/version-5/)
- [Micronaut RabbitMQ](https://micronaut-projects.github.io/micronaut-rabbitmq/latest/guide) updates to AMQP Java Client 5
- [Micronaut Micrometer](https://micronaut-projects.github.io/micronaut-micrometer/latest/guide) updates io.dropwizard.metrics:metrics-core to 4.2.19 and micrometer to 1.11.1
- [Micronaut Liquibase](https://micronaut-projects.github.io/micronaut-liquibase/latest/guide) updates to Liquibase 4.22.0
- [Micronaut SQL](https://micronaut-projects.github.io/micronaut-sql/latest/guide) updates to PostgreSQL 42.6.0, MariaDB Java Client 3.1.4, Hibernate 6.2.6.final, Hibernate Reactive 2.0.2.Final, Jasync 2.2.0, and Vertx 4.4.4
- [Micronaut Azure](https://micronaut-projects.github.io/micronaut-azure/latest/guide) updates to Azure SDK 1.2.4, Azure Cosmos DB 4.46.0, and Azure Functions Java Library 3.0.0
- [Micronaut AWS](https://micronaut-projects.github.io/micronaut-aws/latest/guide) updates to Alexa SDK 2.71.0, AWS SDK v1 1.21.505, AWS SDK v2 2.20.100, AWS Lambda Events  3.11.2 AWS Lambda Serialization  1.1.2, and AWS Lambda SDK 1.2.2
- [Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide) updates to Google Cloud Core 2.18.1, Google Cloud PubSub 1.123.17, Google Secret Manager 2.18.0, Google Cloud Events Types  0.3.0, Google Auth Library OAuth2 HTTP 1.17.0, Google Functions Frameworks API 1.0.4, and Google Function Invoker 1.2.1

## How to Upgrade to Micronaut Framework 4?

We have published an [upgrade to Micronaut framework 4](https://micronaut.io/2023/05/09/upgrade-to-micronaut-framework-4-0-0/) guide to help you upgrade your Micronaut applications, we also provide an [OpenRewrite integration for Gradle](https://micronaut.io/2023/07/14/upgrade-to-micronaut-framework-4-with-openrewrite-and-gradle/) and [Maven](https://micronaut.io/2023/07/14/upgrade-to-micronaut-framework-4-with-openrewrite-and-maven/).

## Next Steps

Please refer to the [documentation](https://docs.micronaut.io/) for further details, try upgrading your applications and use [GitHub](https://github.com/micronaut-projects) to report any issues.

Thanks to all those who contributed to this release! We look forward to your feedback.
