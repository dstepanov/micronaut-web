---
slug: 2024/02/08/micronaut-core-management-drive-by
title: 'Micronaut Core: Drive-By Attack on Management Endpoints'
description: The Micronaut® framework engineering team confirmed a security vulnerability in the management module, discovered by Joseph Beeton of Contrast Security, Inc. This vulnerability is assigned the identifier CVE-2024-23639. Summary A susceptible environment is where the application runs locally, management endpoints are enabled but unsecured, and the local host accesses an unrelated but problematic website. This...
date: '2024-02-08T21:54:50'
modified: '2024-02-08T21:54:50'
sourceUrl: https://micronaut.io/2024/02/08/micronaut-core-management-drive-by/
wordpressId: 6845
contentSource: wordpress-post
category: security-announcements
categories:
  - security-announcements
tags:
  - security
href: /2024/02/08/micronaut-core-management-drive-by/
---

The Micronaut® framework engineering team confirmed a security vulnerability in the management module, discovered by Joseph Beeton of Contrast Security, Inc. This vulnerability is assigned the identifier [CVE-2024-23639](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-23639).

## Summary

A susceptible environment is where the application runs locally, management endpoints are enabled but unsecured, and the local host accesses an unrelated but problematic website. This configuration would be improbable in a production environment but may be common in a developer setup.

Thus, the impact of this vulnerability is primarily annoyance rather than destructive or invasive. Even so, you should consider your particular configuration to determine if you are at risk.

## Affected Versions

Micronaut framework versions 3.8.3 and later are not affected.

If you use Micronaut before version 3.8.3, your Micronaut application may be affected. Details on the affected and patched versions are available in the [GitHub Security Advisory](https://github.com/micronaut-projects/micronaut-core/security/advisories/GHSA-583g-g682-crxf).

## Mitigation

While this vulnerability is not severe, we recommend upgrading to a patched version of the Micronaut framework. Upgrading to version 3.8.3 or later will patch this vulnerability.

If you cannot upgrade, you can workaround the issue by [disabling or securing your management endpoints](https://docs.micronaut.io/latest/guide/#management).

## More Info

The Micronaut Foundation and the Micronaut development team take application security very seriously. If you have questions about this vulnerability or need assistance on upgrades or workarounds, please join the [discussion on GitHub](https://github.com/micronaut-projects/micronaut-core/discussions/10462) or contact us at [security@micronaut.io](mailto:security@micronaut.io).
