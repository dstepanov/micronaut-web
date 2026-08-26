---
id: data
order: 30
label: Micronaut Data
title: A repository with queries computed at build time
description: Declare an interface and Micronaut Data generates the SQL during compilation.
---

```java
import io.micronaut.data.annotation.*;
import io.micronaut.data.jdbc.annotation.JdbcRepository;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;

@MappedEntity
record Book(@Id @GeneratedValue Long id, String title, int pages) {
}

@JdbcRepository(dialect = Dialect.POSTGRES)
interface BookRepository extends CrudRepository<Book, Long> {

    List<Book> findByPagesGreaterThan(int pages);
}
```

```kotlin
import io.micronaut.data.annotation.*
import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository

@MappedEntity
data class Book(
    @field:Id @field:GeneratedValue val id: Long?,
    val title: String,
    val pages: Int,
)

@JdbcRepository(dialect = Dialect.POSTGRES)
interface BookRepository : CrudRepository<Book, Long> {

    fun findByPagesGreaterThan(pages: Int): List<Book>
}
```

```groovy
import io.micronaut.data.annotation.*
import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.CrudRepository

@MappedEntity
class Book {
    @Id
    @GeneratedValue
    Long id
    String title
    int pages
}

@JdbcRepository(dialect = Dialect.POSTGRES)
interface BookRepository extends CrudRepository<Book, Long> {

    List<Book> findByPagesGreaterThan(int pages)
}
```

```python
from dataclasses import dataclass
from typing import Annotated

from micronaut.data.annotation import GeneratedValue, Id, MappedEntity
from micronaut.data.jdbc.annotation import JdbcRepository
from micronaut.data.repository import CrudRepository


@dataclass
@MappedEntity
class Book:
    id: Annotated[int | None, Id, GeneratedValue] = None
    title: str | None = None
    pages: int = 0


@JdbcRepository(dialect="POSTGRES")
class BookRepository(CrudRepository[Book, int]):
    def findByPagesGreaterThan(self, pages: int) -> list[Book]: ...
```
