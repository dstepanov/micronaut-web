---
slug: 2026/05/01/micronaut-framework-5-with-jackson-3
title: Micronaut framework 5 with Jackson 3
description: Since Micronaut Framework 3.3.0, you can use Micronaut Serialization as an alternative to Micronaut Jackson Databind. Moreover, the framework exposes low-level APIs such as JsonMapper to avoid coupling between serialization implementations. Micronaut Jackson Databind internally used Jackson 2. With the release of Micronaut 5, Micronaut Jackson Databind (micronaut-jackson-databind) uses Jackson 3. See the Jackson 3...
date: '2026-05-01T09:59:08'
modified: '2026-05-01T09:59:08'
sourceUrl: https://micronaut.io/2026/05/01/micronaut-framework-5-with-jackson-3/
wordpressId: 7459
contentSource: wordpress-post
category: micronaut-5
categories:
  - micronaut-5
tags:
  - micronaut5
href: /2026/05/01/micronaut-framework-5-with-jackson-3/
---

Since [Micronaut Framework 3.3.0](https://micronaut.io/2022/01/27/micronaut-framework-3-3-released/), you can use [Micronaut Serialization](https://micronaut-projects.github.io/micronaut-serialization/latest/guide/) as an alternative to [Micronaut Jackson Databind](https://docs.micronaut.io/latest/guide/#serializationUsingJacksonDatabind). Moreover, the framework exposes low-level APIs such as [JsonMapper](https://docs.micronaut.io/latest/api/io/micronaut/json/JsonMapper.html) to avoid coupling between serialization implementations.

Micronaut Jackson Databind internally used Jackson 2. With the release of Micronaut 5, Micronaut Jackson Databind (`micronaut-jackson-databind`) uses Jackson 3. See the [Jackson 3 upgrade guide](https://github.com/FasterXML/jackson/blob/main/jackson3/MIGRATING_TO_JACKSON_3.md) and the [Jackson 3 release notes](https://github.com/FasterXML/jackson/wiki/Jackson-Release-3.0).

To update your application, you can use the [Jackson 2 to Jackson 3 OpenRewrite recipe](https://docs.openrewrite.org/recipes/java/jackson/upgradejackson_2_3).

```
plugins {
    ..
    id("org.openrewrite.rewrite")
}
repositories {
    mavenCentral()
}
rewrite {
    activeRecipe("org.openrewrite.java.jackson.UpgradeJackson_2_3")
}
dependencies {
    rewrite("org.openrewrite.recipe:rewrite-jackson:1.11.0")
    compileOnly("tools.jackson.core:jackson-databind:2.17.2")
}
```

Alternatively, apply the following changes to your project:

- Replace `com.fasterxml.jackson.databind.annotation.JsonDeserialize` with `tools.jackson.databind.annotation.JsonDeserialize`.
- Replace `com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder` with `tools.jackson.databind.annotation.JsonPOJOBuilder`.
- Replace `com.fasterxml.jackson.databind.JsonNode` with `tools.jackson.databind.JsonNode`.
- Replace `com.fasterxml.jackson.databind.node.JsonNodeFactory` with `tools.jackson.databind.node.JsonNodeFactory`.
- Replace `com.fasterxml.jackson.databind.node.ObjectNode` with `tools.jackson.databind.node.ObjectNode`.
- Replace `com.fasterxml.jackson.databind.ObjectMapper` with `tools.jackson.databind.ObjectMapper`.
- Replace `com.fasterxml.jackson.databind.PropertyNamingStrategies` with `tools.jackson.databind.PropertyNamingStrategies`.
- Replace `com.fasterxml.jackson.core.JsonParser` with `tools.jackson.core.JsonParser`.
- Replace `com.fasterxml.jackson.core.JsonToken` with `tools.jackson.core.JsonToken`.
- Replace `com.fasterxml.jackson.core.JsonFactory` with `tools.jackson.core.json.JsonFactory`.
- Replace `com.fasterxml.jackson.core.StreamWriteFeature` with `tools.jackson.core.StreamWriteFeature`.
- Replace `com.fasterxml.jackson.core.json.JsonReadFeature` with `tools.jackson.core.json.JsonReadFeature`.
- Replace `com.fasterxml.jackson.core.json.JsonWriteFeature` with `tools.jackson.core.json.JsonWriteFeature`.
- Replace `com.fasterxml.jackson.core.JsonFactoryBuilder` with `tools.jackson.core.json.JsonFactoryBuilder`.
- Replace `com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider` with `tools.jackson.databind.ser.std.SimpleFilterProvider`.
- Replace `com.fasterxml.jackson.core.JsonGenerator` with `tools.jackson.core.JsonGenerator`.
- Replace `com.fasterxml.jackson.databind.jsonFormatVisitors.JsonObjectFormatVisitor` with `tools.jackson.databind.jsonFormatVisitors.JsonObjectFormatVisitor`.
- Replace `com.fasterxml.jackson.databind.ser.BeanPropertyWriter` with `tools.jackson.databind.ser.BeanPropertyWriter`.
- Replace `com.fasterxml.jackson.databind.ser.PropertyFilter` with `tools.jackson.databind.ser.PropertyFilter`.
- Replace `com.fasterxml.jackson.databind.ser.PropertyWriter` with `tools.jackson.databind.ser.PropertyWriter`.

### Exceptions

- Some instances of `com.fasterxml.jackson.core.JsonParseException` are now `tools.jackson.core.JacksonException`.
- `com.fasterxml.jackson.databind.JsonMappingException` (the root for databind exceptions) becomes `tools.jackson.databind.DatabindException`.
- `com.fasterxml.jackson.core.JsonProcessingException` becomes `tools.jackson.core.JacksonException`.
- `com.fasterxml.jackson.databind.exc.InvalidFormatException` becomes `tools.jackson.databind.exc.InvalidFormatException`.

Some internal Micronaut Jackson classes have been relocated:

- `io.micronaut.jackson.env.JsonPropertySourceLoader`→ `io.micronaut.jackson.core.env.JsonPropertySourceLoader`
