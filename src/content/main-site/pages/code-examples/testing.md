---
id: testing
order: 50
label: Test
title: Tests that boot the real application
description: Inject the server and client into tests with a single annotation.
---

```java
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

@MicronautTest
class HelloControllerTest {

    @Inject
    HelloClient client;

    @Test
    void returnsMessage() {
        assertEquals("Hello World", client.index().get("message"));
    }
}
```

```kotlin
import io.micronaut.test.extensions.junit5.annotation.MicronautTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

@MicronautTest
class HelloControllerTest {

    @Inject
    lateinit var client: HelloClient

    @Test
    fun returnsMessage() {
        assertEquals("Hello World", client.index()["message"])
    }
}
```

```groovy
import io.micronaut.test.extensions.spock.annotation.MicronautTest
import jakarta.inject.Inject
import spock.lang.Specification

@MicronautTest
class HelloControllerSpec extends Specification {

    @Inject
    HelloClient client

    void 'returns message'() {
        expect:
        client.index().message == 'Hello World'
    }
}
```
