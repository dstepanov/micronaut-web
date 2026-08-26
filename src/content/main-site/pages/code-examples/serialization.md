---
id: serialization
order: 40
label: Serialization
title: JSON without runtime reflection
description: Keep the Jackson annotations you know — Micronaut Serialization generates the serializers during compilation.
---

```java
import com.fasterxml.jackson.annotation.*;
import io.micronaut.http.annotation.*;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
record Publisher(String publisher, String country) {
}

@Serdeable
record Book(
        @JsonProperty("name") String title,
        int pages,
        @JsonUnwrapped Publisher publishedBy,
        @JsonIgnore String draftNotes) {
}

@Controller("/books")
class BookController {

    @Get("/featured")
    Book featured() {
        return new Book(
                "Micronaut in Action", 320,
                new Publisher("Manning", "USA"), "draft");
    }
}

// $ curl localhost:8080/books/featured
// {"name":"Micronaut in Action","pages":320,"publisher":"Manning","country":"USA"}
```

```kotlin
import com.fasterxml.jackson.annotation.*
import io.micronaut.http.annotation.*
import io.micronaut.serde.annotation.Serdeable

@Serdeable
data class Publisher(val publisher: String, val country: String)

@Serdeable
data class Book(
    @field:JsonProperty("name") val title: String,
    val pages: Int,
    @field:JsonUnwrapped val publishedBy: Publisher,
    @field:JsonIgnore val draftNotes: String? = null,
)

@Controller("/books")
class BookController {

    @Get("/featured")
    fun featured() = Book(
        "Micronaut in Action", 320,
        Publisher("Manning", "USA"), "draft",
    )
}

// $ curl localhost:8080/books/featured
// {"name":"Micronaut in Action","pages":320,"publisher":"Manning","country":"USA"}
```

```groovy
import com.fasterxml.jackson.annotation.*
import io.micronaut.http.annotation.*
import io.micronaut.serde.annotation.Serdeable

@Serdeable
class Publisher {
    String publisher
    String country
}

@Serdeable
class Book {
    @JsonProperty('name')
    String title
    int pages
    @JsonUnwrapped
    Publisher publishedBy
    @JsonIgnore
    String draftNotes
}

@Controller('/books')
class BookController {

    @Get('/featured')
    Book featured() {
        new Book(title: 'Micronaut in Action', pages: 320,
                publishedBy: new Publisher(publisher: 'Manning', country: 'USA'),
                draftNotes: 'draft')
    }
}

// $ curl localhost:8080/books/featured
// {"name":"Micronaut in Action","pages":320,"publisher":"Manning","country":"USA"}
```

```python
from dataclasses import dataclass
from typing import Annotated

from com.fasterxml.jackson.annotation import JsonIgnore, JsonProperty, JsonUnwrapped
from micronaut.http.annotation import Controller, Get
from micronaut.serde.annotation import Serdeable


@dataclass
@Serdeable
class Publisher:
    publisher: str
    country: str


@dataclass
@Serdeable
class Book:
    title: Annotated[str, JsonProperty("name")]
    pages: int
    published_by: Annotated[Publisher, JsonUnwrapped]
    draft_notes: Annotated[str | None, JsonIgnore] = None


@Controller("/books")
class BookController:

    @Get("/featured")
    def featured(self) -> Book:
        return Book(
            "Micronaut in Action", 320,
            Publisher("Manning", "USA"), "draft",
        )


# $ curl localhost:8080/books/featured
# {"name":"Micronaut in Action","pages":320,"publisher":"Manning","country":"USA"}
```
