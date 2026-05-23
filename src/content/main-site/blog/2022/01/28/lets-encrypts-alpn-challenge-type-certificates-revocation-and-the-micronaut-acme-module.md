---
slug: 2022/01/28/lets-encrypts-alpn-challenge-type-certificates-revocation-and-the-micronaut-acme-module
title: Let’s Encrypt’s ALPN Challenge-Type Certificates Revocation and the Micronaut Acme Module
description: Let’s Encrypt is revoking all certificates created before January 26, 2022 through the ALPN challenge type, starting on January 28th. Developers using the Micronaut Acme module may need to take manual action in order to renew their certificates in time. Certificates signed after January 26th using the ALPN challenge, including new certificates, are not affected....
date: '2022-01-28T16:34:41'
modified: '2022-01-28T16:34:41'
sourceUrl: https://micronaut.io/2022/01/28/lets-encrypts-alpn-challenge-type-certificates-revocation-and-the-micronaut-acme-module/
wordpressId: 4811
contentSource: wordpress-post
category: guest-post
categories:
  - guest-post
tags: []
href: /2022/01/28/lets-encrypts-alpn-challenge-type-certificates-revocation-and-the-micronaut-acme-module/
---

Let’s Encrypt [is revoking](https://community.letsencrypt.org/t/2022-01-25-issue-with-tls-alpn-01-validation-method/170450) all certificates created before January 26, 2022 through the ALPN challenge type, starting on January 28th.

Developers using the [Micronaut Acme module](https://micronaut-projects.github.io/micronaut-acme/latest/guide/index.html) may need to take manual action in order to renew their certificates in time.

Certificates signed after January 26th using the ALPN challenge, including new certificates, are not affected. You do not need to change your challenge type.

## Am I affected?

Micronaut applications are affected if *both of the following* apply:

- They use the `micronaut-acme` module to create their certificates
- They use the ALPN challenge type, as configured by the `acme.challenge-type: tls` configuration property

If your application meets both of those conditions, you need to force renewal of your certificates.

## How can I renew my certificates?

To renew the application certificates, you need to first delete the old certificates. Navigate to the location configured in `acme.cert-location` and rename the `domain.crt` file. You can also delete the file entirely, but renaming it gives you a backup in case anything goes wrong.

Micronaut Acme will request a new certificate when it detects the old one is missing. You can either wait until this is checked automatically (every 24 hours by default) or trigger the check manually by restarting your application. When the new certificate has been loaded, a new `domain.crt` file will appear.

Should you have any problems with this process, you can get help [on gitter](https://gitter.im/micronautfw).
