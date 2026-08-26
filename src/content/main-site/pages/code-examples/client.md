---
id: client
order: 20
label: Declarative client
title: A client generated from the same contract
description: Declare an interface and let the compiler generate the HTTP client.
---

```java
import io.micronaut.http.annotation.Get;
import io.micronaut.http.client.annotation.Client;

import java.util.Map;

@Client("/hello")
interface HelloClient {

    @Get
    Map<String, String> index();
}
```

```kotlin
import io.micronaut.http.annotation.Get
import io.micronaut.http.client.annotation.Client

@Client("/hello")
interface HelloClient {

    @Get
    fun index(): Map<String, String>
}
```

```groovy
import io.micronaut.http.annotation.Get
import io.micronaut.http.client.annotation.Client

@Client('/hello')
interface HelloClient {

    @Get
    Map<String, String> index()
}
```

```python
from micronaut.http.client.annotation import Client
from io.micronaut.http.annotation import Get
from typing import Protocol

@Client("/pets")
class PetClient(Protocol):

    @Get
    def index(self) -> dict[str, str]: 
        ...
```
