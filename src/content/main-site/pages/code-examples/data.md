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

@JdbcRepository(dialect = Dialect.MYSQL)
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

@JdbcRepository(dialect = Dialect.MYSQL)
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

@JdbcRepository(dialect = Dialect.MYSQL)
interface BookRepository extends CrudRepository<Book, Long> {

    List<Book> findByPagesGreaterThan(int pages)
}
```
