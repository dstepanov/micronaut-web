---
slug: 2023/07/31/micronaut-framework-402-3100-and-395-releases
title: 4.0.2, 3.10.0 and 3.9.5 releases
description: Micronaut Framework 4.0.2 The Micronaut Foundation is excited to announce the release of Micronaut framework 4.0.2! Micronaut framework 4.0.2 is a patch release that contains bug fixes and upgrades. It contains a patch release of Micronaut Core and the Micronaut Maven Plugin 4.0.3. Moreover, it upgrades Object Storage, Security, Serialization, and CRaC modules to patch...
date: '2023-07-31T16:56:17'
modified: '2023-08-22T16:36:12'
sourceUrl: https://micronaut.io/2023/07/31/micronaut-framework-402-3100-and-395-releases/
wordpressId: 6566
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - release
href: /2023/07/31/micronaut-framework-402-3100-and-395-releases/
---

## Micronaut Framework 4.0.2

The Micronaut Foundation is excited to announce the release of Micronaut framework 4.0.2!

Micronaut framework 4.0.2 is a patch release that contains bug fixes and upgrades.

It contains a patch release of [Micronaut Core](https://github.com/micronaut-projects/micronaut-core/releases/tag/v4.0.1) and the Micronaut [Maven Plugin 4.0.3](https://github.com/micronaut-projects/micronaut-maven-plugin/releases/v4.0.3). Moreover, it upgrades [Object Storage](https://github.com/micronaut-projects/micronaut-object-storage/releases/v2.0.3), [Security](https://github.com/micronaut-projects/micronaut-security/releases/v4.0.2), [Serialization](https://github.com/micronaut-projects/micronaut-serialization/releases/v2.0.2), and [CRaC](https://github.com/micronaut-projects/micronaut-crac/releases/v2.0.2) modules to patch releases.

Please, update your application to version 4.0.2 of the [Micronaut Gradle Plugins if you use Gradle.](https://plugins.gradle.org/u/micronaut)

## Micronaut Framework 3.9.5

Micronaut framework 3.9.5 is a patch release that contains bug fixes, and it upgrades to Micronaut Security 3.9.6.

Micronaut framework 3.9.5 and 3.10.0 upgrade to [Netty 4.1.94.Final](https://netty.io/news/2023/06/19/4-1-94-Final.html), which addresses [CVE-2023-34462](https://github.com/netty/netty/security/advisories/GHSA-6mjq-h674-j845). Micronaut framework is not affected by [CVE-2023-34462](https://github.com/netty/netty/security/advisories/GHSA-6mjq-h674-j845). However, many organizations forbid their teams to use a framework that depends on a vulnerable dependency, even if it is unaffected. Because of that, we decided to update the latest Micronaut framework 3 versions to [Netty 4.1.94.Final](https://netty.io/news/2023/06/19/4-1-94-Final.html).

## Micronaut Framework 3.10.0

Micronaut framework 3.10.0 is going to be the last minor version of the Micronaut framework 3.

It contains minor upgrades of several dependency updates:

- [Micronaut Redis](https://micronaut-projects.github.io/micronaut-redis/latest/guide) updates to Redis 5.4.0
- [Micronaut Azure](https://micronaut-projects.github.io/micronaut-azure/latest/guide) updates to Azure SDK 1.2.15, and Azure Cosmos DB 4.48.0.
- [Micronaut AWS](https://micronaut-projects.github.io/micronaut-aws/latest/guide) updates to AWS SDK v1 1.12.510, AWS SDK v2 2.20.107, CDK 2.88.0, Serverless core 1.9.3, and AWS Lambda Events 3.11.2
- [Micronaut GCP](https://micronaut-projects.github.io/micronaut-gcp/latest/guide) updates to Google Cloud Core 2.18.1, Google Cloud PubSub 1.123.17, Google Secret Manager 2.18.0, and Google Auth Library OAuth2 HTTP 1.17.0
- [Micronaut Picocli](https://micronaut-projects.github.io/micronaut-picocli/latest/guide) updates to Picli 4.7.3a

## Next Steps

If you haven’t yet updated to [Micronaut framework 4](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/), this is an excellent opportunity to do so!

Please feel free to [reach out to us](https://micronaut.io/support/) if you need any assistance.
