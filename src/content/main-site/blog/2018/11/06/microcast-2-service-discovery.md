---
slug: 2018/11/06/microcast-2-service-discovery
title: 'Microcast #2 | Introduction to Service Discovery with the Micronaut Framework'
description: Micronaut® Microcasts provide bite-sized tips and tutorials to help you maximize your productivity with the Micronaut framework and confidently contribute to the ecosystem.
date: '2018-11-06T18:07:03'
modified: '2023-06-06T07:45:25'
sourceUrl: https://micronaut.io/2018/11/06/microcast-2-service-discovery/
wordpressId: 4767
contentSource: wordpress-post
category: microcast
categories:
  - microcast
tags:
  - consul
  - http-client
  - microcast
  - service-discovery
  - video
href: /2018/11/06/microcast-2-service-discovery/
---

A typical microservice architecture is made up of numerous services communicating with each other, typically over HTTP. One of the challenges associated with an architecture like that is managing the ability for the services to dynamically locate each other at runtime. The Micronaut framework helps simplify that with support for popular service discovery runtimes, including Consul, Eureka, Kubernetes, and AWS Route 53.

This Micronaut Microcast introduces the basics of the Micronaut framework’s service discovery capabilities using Consul, but the approach is very similar for all supported service discovery runtimes.

This introduction and demonstration cover the following topics:

- Creating an application with Consul support
- Configuring Consul connection settings
- Running Consul with docker
- An introduction to declarative HTTP clients
- Client-side load balancing
- Basic retry support

This video provides a basic introduction to the concepts and relevant capabilities in the framework. For more detailed information see the [Service Discovery](https://docs.micronaut.io/1.0.0/guide/index.html#serviceDiscovery) and the [Declarative HTTP Client](https://docs.micronaut.io/1.0.0/guide/index.html#clientAnnotation) sections of the [Micronaut User Guide](https://docs.micronaut.io/latest/guide/).

[Watch the video](https://www.youtube.com/watch?v=FabDKO18Ga0)
