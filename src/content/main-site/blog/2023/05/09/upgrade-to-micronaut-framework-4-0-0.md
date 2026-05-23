---
slug: 2023/05/09/upgrade-to-micronaut-framework-4-0-0
title: Upgrade to Micronaut Framework 4
description: This post is a migration guide from Micronaut Framework 3 to Micronaut framework 4.0. You can read about Micronaut core 4 breaking changes. Moreover, To ease upgrading, we provide OpenRewrite integration for Gradle and Maven. Logback Remove true from src/main/resources/logback.xml Gradle Applications Version update Set micronautVersion property in gradle.properties. micronautVersion=4.0.0 Update Gradle to 8 Micronaut...
date: '2023-05-09T16:11:22'
modified: '2024-02-15T13:59:42'
sourceUrl: https://micronaut.io/2023/05/09/upgrade-to-micronaut-framework-4-0-0/
wordpressId: 6199
contentSource: wordpress-post
category: micronaut-4
categories:
  - micronaut-4
tags:
  - micronaut4
  - upgrade
href: /2023/05/09/upgrade-to-micronaut-framework-4-0-0/
---

This post is a migration guide from Micronaut Framework 3 to [Micronaut framework 4.0](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/). You can read about [Micronaut core 4 breaking changes](https://docs.micronaut.io/4.0.0/guide/index.html#breaks).

Moreover, To ease upgrading, we provide [OpenRewrite integration for Gradle](https://micronaut.io/2023/07/14/upgrade-to-micronaut-framework-4-with-openrewrite-and-gradle/) and [Maven](https://micronaut.io/2023/07/14/upgrade-to-micronaut-framework-4-with-openrewrite-and-maven/).

## Logback

Remove

```
<withJansi>true</withJansi>
```

from `src/main/resources/logback.xml`

## Gradle Applications

### Version update

Set `micronautVersion` property in `gradle.properties`.

```
micronautVersion=4.0.0
```

### Update Gradle to 8

Micronaut framework 4 applications generated via the Micronaut CLI or [Micronaut Launch](https://launch.micronaut.io/) use Gradle `8.1.1`. Micronaut framework 3.x applications use Gradle 7.6. [Upgrade your build from Gradle 7.x to 8.0](https://docs.gradle.org/current/userguide/upgrading_version_7.html).

### Update Micronaut Gradle plugins to 4.x

Update [Micronaut Gradle Plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/) to `4.0.0`.

Replace:

```
plugins {
  id("io.micronaut.application") version "3.7.9"
```

With:

```
plugins {
  id("io.micronaut.application") version "4.0.0"
```

### Update Shadow plugin

Update [Shadow Gradle Plugin](https://plugins.gradle.org/plugin/com.github.johnrengelman.shadow) to `8.1.1`. Replace

Replace:

```
plugins {
  id("com.github.johnrengelman.shadow") version "7.1.2"
```

With:

```
plugins {
  id("com.github.johnrengelman.shadow") version "8.1.1"
```

### Kotlin Gradle Plugins

If you write your Micronaut applications with Kotlin, you need to update your Gradle plugins.

#### kapt Gradle Plugin

Update [kapt gradle plugin](https://kotlinlang.org/docs/kapt.html#using-in-gradle) from `1.6.21` to `1.8.21`.

[Micronaut Framework 4.0 supports Kotlin Symbol Processing (KSP)](https://docs.micronaut.io/4.0.0/guide/index.html#ksp). We recommend you migrate from kapt to ksp.

#### All-open Gradle Plugin

Update [Kotlin All-Open Gradle plugin](https://kotlinlang.org/docs/all-open-plugin.html#gradle) from `1.6.21` to `1.8.21`.

#### jvm Gradle plugin

Update [Kotlin `jvm` Gradle plugin](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.jvm) from `1.6.21` to `1.8.21`.

### Set source and target compatibility to Java 17

[Micronaut Framework 4.0 sets the Java baseline to 17](https://micronaut.io/2023/02/16/micronaut-framework-4-0-with-java-17-baseline/).

Update your Gradle build and set source and target compatibility.

```
java {
  sourceCompatibility = JavaVersion.toVersion("17")
  targetCompatibility = JavaVersion.toVersion("17")
```

#### Deprecated lambda runtime removed

If you build contains:

```
micronaut {
   runtime("lambda")
   ...
}
```

You have to replace `lambda` with `lambda_java` if you want to deploy to a Lambda Java Runtime or with `lambda_provided` if you want to deploy a native executable built with GraalVM to a Lambda Custom Runtime.

## Maven Applications

### Micronaut Maven Plugin

The [Micronaut Maven Plugin](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/) coordinate have change from `io.micronaut.build:micronaut-maven-plugin` to `io.micronaut.maven:micronaut-maven-plugin`

### Parent POM

Parent’s coordinate has changed.

Replace:

```
<parent>
  <groupId>io.micronaut</groupId>
  <artifactId>micronaut-parent</artifactId>
```

With:

```
<parent>
  <groupId>io.micronaut.platform</groupId>
  <artifactId>micronaut-parent</artifactId>
```

### Version update

Set `micronaut.version` property in `pom.xml`.

```
  <parent>
    <groupId>io.micronaut.platform</groupId>
    <artifactId>micronaut-parent</artifactId>
    <version>4.0.0</version>
  </parent>
  <properties>
   ...
    <micronaut.version>4.0.0</micronaut.version>
  </properties>
```

### Set source and target compatibility to 17

[Micronaut Framework 4.0 sets the Java baseline to 17](https://micronaut.io/2023/02/16/micronaut-framework-4-0-with-java-17-baseline/).

Set in `pom.xml` the following properties:

```
<properties>
...
    <jdk.version>17</jdk.version>
    <release.version>17</release.version>
...
</properties>
```

### No need to specify Micronaut Data version

The parent POM defines `micronaut.data.version`. Thus, If you were specifying: `<micronaut.data.version>3.10.0</micronaut.data.version>` in your `pom.xml` you can remove it.

### Test Resources Client

If you are using [Micronaut Test Resources](https://micronaut-projects.github.io/micronaut-test-resources/latest/guide/). For example, you define the property `micronaut.test.resources.enabled`. You need to add the following dependency:

```
    <dependency>
       <groupId>io.micronaut.testresources</groupId>
        <artifactId>micronaut-test-resources-client</artifactId>
        <scope>provided</scope>
    </dependency>
```

### Core Annotation Processors version property

Core annotation processors, annotation processors whose group id is `io.micronaut`, should use `micronaut.core.version` for its version.

```
<path>
  <groupId>io.micronaut</groupId>
  <artifactId>micronaut-inject-java</artifactId>
  <version>${micronaut.core.version}</version>
</path>
<path>
  <groupId>io.micronaut</groupId>
  <artifactId>micronaut-graal</artifactId>
  <version>${micronaut.core.version}</version>
</path>
<path>
  <groupId>io.micronaut</groupId>
  <artifactId>micronaut-http-validation</artifactId>
  <version>${micronaut.core.version}</version>
</path>
```

## Micronaut Framework BOM

The Micronaut Gradle plugin applies the Micronaut Bill of Materials (BOM). However, if you were applying the BOM directly to your build. You should use `io.micronaut.platform:micronaut-platform`.

The Micronaut Platform BOM exists since Micronaut framework 4, and corresponds to the Micronaut framework 3 BOM which was published at `io.micronaut:micronaut-bom`. In Micronaut framework 4, we provide both the Micronaut Platform BOM (`io.micronaut.platform:micronaut-platform`) and the Micronaut Core BOM (`io.micronaut:micronaut-core-bom`).

## Cloud Environment Deduction Disabled by Default

Cloud Environment deduction is disabled by default in Micronaut framework 4. You can enable it by setting the `micronaut.env.cloud-deduction` system property or the `MICRONAUT_ENV_CLOUD_DEDUCTION` environment variable to true or changing your `main` class.

```
public class Application {
    @ContextConfigurer
    public static class DeduceCloudEnvironmentConfigurer
    implements ApplicationContextConfigurer {
        @Override
        public void configure(
            @NonNull ApplicationContextBuilder builder) {
        builder.deduceCloudEnvironment(true);
        }
    }

    public static void main(String[] args) {
        Micronaut.run(Application.class, args);
    }
}
```

## Virtual Threads

To [use virtual threads](https://docs.micronaut.io/latest/guide/#virtualThreads), replace `@ExecutesOn(IO)` with `@Executes(BLOCKING)`. When you use `BLOCKING`, if the Java version does not support virtual threads, the framework aliases this executor to `IO`.

## YAML Configuration

[Micronaut Framework 4.0 does not expose SnakeYAML as a transitive dependency](https://micronaut.io/2023/02/19/micronaut-framework-4-0-and-snakeyaml-transitive-dependency/).

If you use YAML for your application configuration, add the following dependency:

For Gradle:

```
dependencies {
    ...
    runtimeOnly("org.yaml:snakeyaml")
}
```

For Maven:

```
<dependency>
  <groupId>org.yaml</groupId>
  <artifactId>snakeyaml</artifactId>
  <scope>runtime</scope>
</dependency>
```

## JSON Serialization

[Micronaut Framework 4.0 does not expose Micronaut Jackson Databind as a transitive dependency](https://micronaut.io/2023/02/27/micronaut-framework-4-0-and-micronaut-jackson-databind-transitive-dependency/).

Thus, you must choose which serialization implementation you want.

### How to use Micronaut Jackson Databind

To use Micronaut Jackson Databind with Gradle, add the following dependency:

```
dependencies {
    ...
    implementation("io.micronaut:micronaut-jackson-databind")
}
```

Or to your Maven build:

```
<dependency>
  <groupId>io.micronaut</groupId>
  <artifactId>micronaut-jackson-databind</artifactId>
  <scope>compile</scope>
</dependency>
```

### How to use Micronaut Serialization

To use Micronaut Serialization with Gradle, add the following dependency:

```
dependencies {
    ...
    annotationProcessor("io.micronaut.serde:micronaut-serde-processor")
    implementation("io.micronaut.serde:micronaut-serde-jackson")
}
```

Or to your Maven build:

```
    <dependency>
      <groupId>io.micronaut.serde</groupId>
      <artifactId>micronaut-serde-jackson</artifactId>
      <scope>compile</scope>
    </dependency>
</dependencies>
...
..
.
<annotationProcessorPaths>
...
    <path>
        <groupId>io.micronaut.serde</groupId>
        <artifactId>micronaut-serde-processor</artifactId>
    </path>
</annotationProcessorPaths>
```

## Micronaut Validation

Micronaut framework 4.0 moves [Micronaut Validation](https://micronaut-projects.github.io/micronaut-validation/snapshot/guide/) to its own module. You need to replace the usage of the old coordinate `io.micronaut:micronaut-validation`.

To use Micronaut Validation with Gradle, add the following dependency:

```
dependencies {
    ...
    annotationProcessor("io.micronaut.validation:micronaut-validation-processor")
    implementation("io.micronaut.validation:micronaut-validation")
}
```

Or to your Maven build:

```
    <dependency>
      <groupId>io.micronaut.validation</groupId>
      <artifactId>micronaut-validation</artifactId>
      <scope>compile</scope>
    </dependency>
</dependencies>
...
..
.
<annotationProcessorPaths>
...
    <path>
        <groupId>io.micronaut.validation</groupId>
        <artifactId>micronaut-validation-processor</artifactId>
    </path>
</annotationProcessorPaths>
```

## Jakarta Transition

You have to move to `jakarta` namespace.

### Validation annotations

Replace the usage of `javax.validation.constraints` with `jakarta.validation.constraints`.

For example, replace:

```
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
```

with:

```
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
```

| Javax annotations | Jakarta annotations |
| --- | --- |
| `javax.validation.constraints.NotNull`| `jakarta.validation.constraints.NotNull`|
| `javax.validation.constraints.Pattern`| `jakarta.validation.constraints.Pattern`|
| `javax.validation.constraints.NotBlank`| `jakarta.validation.constraints.NotBlank`|
| `javax.validation.Constraint`| `jakarta.validation.Constraint`|
| `javax.validation.Payload`| `jakarta.validation.Payload`|
| `javax.validation.ConstraintViolation`| `jakarta.validation.ConstraintViolation`|
| `javax.validation.Validator`| `jakarta.validation.Validator`|
| `javax.validation.constraints.Positive`| `jakarta.validation.constraints.Positive`|
| `javax.validation.constraints.PositiveOrZero`| `jakarta.validation.constraints.PositiveOrZero`|
| `javax.validation.Valid`| `jakarta.validation.Valid`|
| `javax.validation.ConstraintViolationException`| `jakarta.validation.ConstraintViolationException`|

### Mail annotations

Micronaut Email 2 migrates to [Jakarta Mail](https://jakartaee.github.io/mail-api/) package namespaces, from `javax.mail` to `jakarta.mail`.

| Javax annotations | Jakarta annotations |
| --- | --- |
| `javax.mail.Message`| `jakarta.mail.Message`|
| `javax.mail.MessagingException`| `jakarta.mail.MessagingException`|
| `javax.mail.Flags`| `jakarta.mail.Flags`|
| `javax.mail.Folder`| `jakarta.mail.Folder`|
| `javax.mail.Session`| `jakarta.mail.Session`|
| `javax.mail.Store`| `jakarta.mail.Store`|
| `javax.mail.internet.MimeMessage`| `jakarta.mail.internet.MimeMessage`|
| `javax.mail.internet.MimeMultipart`| `jakarta.mail.internet.MimeMultipart`|
| `javax.mail.util.ByteArrayDataSource`| `jakarta.mail.util.ByteArrayDataSource`|
| `javax.mail.Authenticator`| `jakarta.mail.Authenticator`|
| `javax.mail.PasswordAuthentication`| `jakarta.mail.PasswordAuthentication`|

### Transaction annotations

| Javax annotations | Jakarta annotations |
| --- | --- |
| `javax.transaction.Transactional`| `jakarta.transaction.Transactional`|

### Jakarta Persistence Annotations

Replace the usage of `javax.persistence` with `jakarta.persistence`.

For example, replace:

```
import javax.persistence.GenerationType;
import javax.validation.constraints.NotNull;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
```

with:

```
import jakarta.persistence.GenerationType;
import jakarta.validation.constraints.NotNull;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
```

## Websockets

Micronaut framework 4.0, `io.micronaut:micronaut-http-server` no longer exposes `micronaut-websocket` dependency transitively. To keep using [Micronaut WebSocket Support](https://docs.micronaut.io/latest/guide/#websocket) add the following dependency to your application:

With Gradle:

```
implementation("io.micronaut:micronaut-websocket")
```

Or Maven

```
<dependency>
    <groupId>io.micronaut</groupId>
    <artifactId>micronaut-websocket</artifactId>
</dependency>
```

## Retry Functionality

To use retry capabilities (`@Retryable`, `@Recoverable`), with Micronaut framework 4.0 you need to add the following dependency:

With Gradle:

```
implementation("io.micronaut:micronaut-retry")
```

With Maven:

```
<dependency>
    <groupId>io.micronaut</groupId>
    <artifactId>micronaut-retry</artifactId>
</dependency>
```

### Micronaut Tracing

The Micronaut Tracing Zipkin module (`io.micronaut.tracing:micronaut-tracing-zipkin`) has been renamed and separated in two new modules: – Micronaut Tracing Brave (`io.micronaut.tracing:micronaut-tracing-brave`). – Micronaut Tracing Brave HTTP (`io.micronaut.tracing:micronaut-tracing-brave-http`).

## Micronaut Kafka

[Micronaut Kafka](https://micronaut-projects.github.io/micronaut-kafka/latest/guide/index.html#releaseHistory) no longer supports Open Tracing. If you need distributed tracing, you should instead use Open Telemetry.

## Micronaut Security

Read the [Breaking Changes](https://micronaut-projects.github.io/micronaut-security/latest/guide/#breaks) and [What’s New](https://micronaut-projects.github.io/micronaut-security/latest/guide/#whatsNew) sections of the Micronaut Security documentation.

## Micronaut Session

Micronaut framework 4.0 moves session capabilities to a new module, [Micronaut Session](https://micronaut-projects.github.io/micronaut-session/snapshot/guide/). If you use session, replace the coordinates `io.micronaut:micronaut-session` with `io.micronaut.session:micronaut-session`.

### Reactor Instrumentation moved to Reactor Module

Micronaut framework 4.0 moves Reactor instrumentation to [Micronaut Reactor](https://micronaut-projects.github.io/micronaut-reactor/latest/guide/) module. If you use [Project Reactor](https://projectreactor.io/), ensure you have the following dependency:

With Gradle:

```
implementation("io.micronaut.reactor:micronaut-reactor")
```

With Maven:

```
<dependency>
    <groupId>io.micronaut.validation</groupId>
    <artifactId>micronaut-validation</artifactId>
</dependency>
```
