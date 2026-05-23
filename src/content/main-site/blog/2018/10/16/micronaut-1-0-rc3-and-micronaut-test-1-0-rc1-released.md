---
slug: 2018/10/16/micronaut-1-0-rc3-and-micronaut-test-1-0-rc1-released
title: Micronaut 1.0 RC3 and Micronaut Test 1.0 RC1 Released
description: The final Micronaut RC before release of the GA on October 23rd is out! Find out what’s new and what’s to come!
date: '2018-10-16T12:48:30'
modified: '2021-02-12T14:54:55'
sourceUrl: https://micronaut.io/2018/10/16/micronaut-1-0-rc3-and-micronaut-test-1-0-rc1-released/
wordpressId: 2926
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2018/10/16/micronaut-1-0-rc3-and-micronaut-test-1-0-rc1-released/
---

With one week to go to [Oracle Code One 2018](https://objectcomputing.com/resources/events/conferences/oracle-code-one-2018), the [Micronaut team](https://objectcomputing.com/products/2gm-team) at [Object Computing, Inc.](https://objectcomputing.com/) is pleased to announce the release of [Micronaut 1.0 RC3](https://github.com/micronaut-projects/micronaut-core/releases/tag/v1.0.0.RC3).

This is the final RC before we release GA on the 23rd of October.

With this release, we are pleased to also announce the first RC of [Micronaut Test](https://micronaut-projects.github.io/micronaut-test/latest/guide/index.html): a simple collection of extensions for JUnit 5 and Spock that adds a few niceties that make it simpler to test Micronaut applications.

Micronaut Test adds the following testing-specific features to the Micronaut framework:

- Automatically start and stop the server for the scope of a test suite
- Use mocks to replace existing beans for the scope of a test suite
- Allow dependency injection into a test instance

The following is an example test written in Spock:

```groovy
package io.micronaut.test.spock

import io.micronaut.test.annotation.MicronautTest
import spock.lang.*
import javax.inject.Inject

@MicronautTest
class MathServiceSpec extends Specification {

    @Inject
    MathService mathService

    @Unroll
    void "should compute #num times 4"() {
        when:
        def result = mathService.compute(num)

        then:
        result == expected

        where:
        num | expected
        2   | 8
        3   | 12
    }
}
```

As you can see from the example above, simply by adding the `@MicronautTest` annotation to any Spock or JUnit 5 test, the test automatically becomes a candidate for dependency injection.

Micronaut Test includes many more features, including integration with Spock’s mocking framework and Mockito for JUnit 5.

Thanks to all those who provided feedback during the RC process and to those who plan to attend Oracle Code One 2018 next week in San Francisco – see you there!
