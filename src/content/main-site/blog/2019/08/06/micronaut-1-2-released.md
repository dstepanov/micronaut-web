---
slug: 2019/08/06/micronaut-1-2-released
title: Micronaut 1.2 Released
description: Micronaut 1.2 release announcement
date: '2019-08-06T12:48:51'
modified: '2021-02-12T14:54:48'
sourceUrl: https://micronaut.io/2019/08/06/micronaut-1-2-released/
wordpressId: 2964
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2019/08/06/micronaut-1-2-released/
---

The [Micronaut team](https://objectcomputing.com/products/2gm-team) at [Object Computing, Inc.](https://objectcomputing.com/) is excited to announce the release of [Micronaut 1.2](https://github.com/micronaut-projects/micronaut-core/releases/tag/v1.2.0). The GA version of the 1.2 line includes the following significant new enhancements:

- Micronaut Security 1.2 with support for [OAuth 2.0 and OpenID Connect](https://micronaut-projects.github.io/micronaut-security/1.2.x/guide/#oauth)
- Improved validation support with [native, reflection-free bean validation](https://docs.micronaut.io/1.2.x/guide/index.html#beanValidation)
- Environment detection for [Oracle Cloud](https://cloud.oracle.com/home)
- [Distributed configuration with HashiCorp Vault](https://docs.micronaut.io/1.2.x/guide/index.html#distributedConfigurationVault)
- … and [many more improvements](https://docs.micronaut.io/1.2.x/guide/index.html#whatsNew)

The most significant new feature is the updated security module, which includes OpenID connect support that works with a variety of providers. Check out the [Securing a Micronaut App with Okta guide](https://guides.micronaut.io/micronaut-oauth2-okta/guide/index.html), which demonstrates how to use [Okta](https://www.okta.com) as the OpenID provider.

Validation also gets a significant upgrade with native support for bean-validation annotations without needing to pull in Hibernate Validator. This has numerous benefits, including reducing the JAR size of a Micronaut application, improving startup time, and eliminating reflection. Plus the new validation module now supports reactive flows!

Thanks to all those who contributed to the release, and we hope you enjoy Micronaut 1.2!

Looking to the future, we now shift focus to Micronaut 1.3 which will include the following enhancements:

- Integration with the GA release of [Micronaut Data](/blog/2019-07-18-unleashing-predator-precomputed-data-repositories.html)
- Improved caching APIs
- Improvements to bean introspections (static factory-method support, interface and enum support, etc.)
- Bean import support to allow importing beans from existing libraries annotated with `javax.inject` annotations.
- Further performance and memory consumption optimization

Micronaut 1.3 will be the last release in the 1.x line of releases. We’ll shift to Micronaut 2.0 toward the end of the year and focus on significant enhancements to improve support for serverless functions (Google Cloud Function, Azure Functions, and more), as well as adding support for HTTP/2.
