---
id: server
order: 10
label: HTTP server
title: A controller in a few annotations
description: Create a non-blocking endpoint on Netty with a compact controller.
---

```java
import io.micronaut.http.annotation.*;

import java.util.Collections;
import java.util.Map;

@Controller("/hello")
class HelloController {

    @Get
    Map<String, String> index() {
        return Collections.singletonMap("message", "Hello World");
    }
}
```

```kotlin
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get

@Controller("/hello")
class HelloController {

    @Get
    fun index(): Map<String, String> {
        return mapOf("message" to "Hello World")
    }
}
```

```groovy
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get

@Controller('/hello')
class HelloController {

    @Get
    Map<String, String> index() {
        [message: 'Hello World']
    }
}
```

```python
from micronaut.http.annotation import Get


@Get("/hello")
def index() -> dict[str, str]:
    return {"message": "Hello World"}
```
