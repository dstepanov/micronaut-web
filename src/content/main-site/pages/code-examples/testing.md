---
id: testing
order: 30
label: Test
title: Fast and Easy Testing
description: Run framework-integrated tests with dependency injection support.
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

```python
from typing import Annotated

from jakarta.inject import Inject
from micronaut.http.client import HttpClient
from micronaut.http.client.annotation import Client
from micronaut.test.extensions.junit5.annotation import MicronautTest


MicronautTest()

client: Annotated[HttpClient, Inject, Client("/")]


def test_returns_message() -> None:
    response = client.toBlocking().retrieve("/hello")
    assert "Hello World" in response
```
