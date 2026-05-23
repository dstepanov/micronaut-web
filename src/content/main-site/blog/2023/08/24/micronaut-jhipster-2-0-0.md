---
slug: 2023/08/24/micronaut-jhipster-2-0-0
title: Micronaut Blueprint v2.0.0 for JHipster Released!
description: The Micronaut Foundation is excited to highlight version 2.0.0 of the Micronaut Blueprint for JHipster is now available! This version of the blueprint is based on JHipster 7.9.3 and was made possible by significant contributions from the JHipster community. It generates a back-end server based on Micronaut framework 3.10.1 for either monolith or microservice style...
date: '2023-08-24T18:49:55'
modified: '2023-08-24T18:52:08'
sourceUrl: https://micronaut.io/2023/08/24/micronaut-jhipster-2-0-0/
wordpressId: 6630
contentSource: wordpress-post
category: release-announcements
categories:
  - release-announcements
tags:
  - jhipster
href: /2023/08/24/micronaut-jhipster-2-0-0/
---

The Micronaut Foundation is excited to highlight version 2.0.0 of the [Micronaut Blueprint](https://github.com/jhipster/generator-jhipster-micronaut) for [JHipster](https://www.jhipster.tech/) is now available!

This version of the blueprint is based on JHipster 7.9.3 and was made possible by [significant contributions](https://github.com/jhipster/generator-jhipster-micronaut/pull/267) from the JHipster community. It generates a back-end server based on Micronaut framework 3.10.1 for either monolith or microservice style JHipster applications. The upgrade to the latest JHipster version and to a Micronaut 3.x base was a big task and we are delighted to see it come together through the power of Open Source collaboration and to have been able to play a part in helping guide it to completion.

## Getting Started

After setting up the necessary [JHipster toolchain](https://www.jhipster.tech/installation/#local-installation-with-npm-recommended-for-normal-users) (*NOTE – The current JHipster 7.9.3 release requires NodeJS version 16.x and will not work with version 18.x) in your environment, installation of the blueprint is as simple as:

```
npm install -g generator-jhipster-micronaut
```

The installation will create a `mhipster` alias that links to the blueprint’s modified version of the JHipster CLI application.

Generating a fully scaffolded Single Page Application (SPA) with a Micronaut framework 3 back-end is as simple as running:

```
mhipster
```

This will start the CLI interface that will walk you through the creation of a JHipster + Micronaut application.

The [JHipster Domain Language (JDL)](https://www.jhipster.tech/jdl/intro) is of course also supported, and might be the preferred path once you are already familiar with JHipster. In this case running a command such as:

```
mhipster jdl default-gradle.jdl
```

works to use the `default-gradle.jdl` script from the [JDL Samples Repository](https://github.com/jhipster/jdl-samples) to generate a default JHipster + Micronaut application with a Gradle build.

For a more complex setup with multiple microservices that makes use of features such as the [JHipster API Gateway](https://www.jhipster.tech/api-gateway/#-the-jhipster-api-gateway), you can specify the Micronaut Blueprint as a command line option with the standard JHipster generator:

```
jhipster --blueprints micronaut
```

## Micronaut Framework 4 Support Coming Soon!

We are actively working with the JHipster community on producing another major version of the blueprint in the very near future that will be based on JHipster 8 (now in beta release) and that will generate a similar back-end based on the recently available Micronaut framework 4.
