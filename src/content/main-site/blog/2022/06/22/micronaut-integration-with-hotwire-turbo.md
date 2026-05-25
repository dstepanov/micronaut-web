---
slug: 2022/06/22/micronaut-integration-with-hotwire-turbo
title: Micronaut Integration with Hotwire Turbo
description: 'Micronaut Views adds integration with Turbo, the heart of Hotwire. Turbo is a set of complementary techniques for accelerating page changes and form submissions, dividing complex pages into components, and streaming partial page updates over WebSocket. Micronaut Views supports easy generation of Turbo Frames and Turbo Streams with a fluid API and annotations.https: We also...'
date: '2022-06-22T22:15:36'
modified: '2023-07-05T18:55:36'
sourceUrl: https://micronaut.io/2022/06/22/micronaut-integration-with-hotwire-turbo/
wordpressId: 5147
contentSource: wordpress-post
category: microcast
categories:
  - microcast
tags:
  - hotwire
  - micronaut-views
  - turbo-frames
  - turbo-native
  - turbo-streams
href: /2022/06/22/micronaut-integration-with-hotwire-turbo/
---

Micronaut Views adds integration with [Turbo](https://turbo.hotwired.dev/), the heart of [Hotwire](https://hotwired.dev/).

> Turbo is a set of complementary techniques for accelerating page changes and form submissions, dividing complex pages into components, and streaming partial page updates over WebSocket.

[Micronaut Views supports easy generation of Turbo Frames and Turbo Streams](https://micronaut-projects.github.io/micronaut-views/latest/guide/#turbo) with a fluid API and annotations.

[Watch the video](https://www.youtube.com/watch?v=KIh6AIKata4)

We also wrote a [Micronaut Guide featuring the code shown in the previous screencast](https://guides.micronaut.io/latest/hotwire-turbo-micronaut-chat.html).

## Turbo Native

Moreover, the Micronaut framework is a perfect fit for the backend of mobile-native applications that use Turbo Native.

> Turbo Native for iOS and Android provides the tooling to wrap your Turbo-enabled web app in a native iOS / Android shell.
>
> Turbo Native manages a single WKWebView or WebView instance across multiple view controllers or fragment destinations, giving you a native navigation UI with all the client-side performance benefits of Turbo.

We wrote a [Micronaut Guide to show you how to write the Turbo Native Demo with a Micronaut backend](https://guides.micronaut.io/latest/micronaut-turbo-native.html).

## Turbo Native iOS

We recorded a screencast that shows how to run the [Turbo Native iOS](http://github.com/hotwired/turbo-ios) demo application and point it to the Micronaut application.

[Watch the video](https://www.youtube.com/watch?v=w04V-WmsJ6Y)

## Turbo Native Android

We also recorded a screencast that shows how to run the [Turbo Native Android](http://github.com/hotwired/turbo-android) demo application and point it to the Micronaut application.

[Watch the video](https://www.youtube.com/watch?v=OB-nnVqhjMk)

## Hotwire

[Hotwire](https://hotwired.dev/) is an alternative approach to building modern web applications without using much JavaScript by sending HTML instead of JSON over the wire.

By integrating Micronaut technology with Turbo, we get to keep all of our template rendering on the server. This means we’re free to write more of our applications in our favorite programming languages (Java, Kotlin, Groovy) and have access to server-side logic around persistence and security.
