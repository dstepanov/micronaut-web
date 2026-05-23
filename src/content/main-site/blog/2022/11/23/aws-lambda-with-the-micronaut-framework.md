---
slug: 2022/11/23/aws-lambda-with-the-micronaut-framework
title: AWS Lambda with the Micronaut Framework
description: AWS Lambda is a serverless, event-driven compute service that lets you run code for any type of application or backend service without provisioning or managing servers. Cold Start vs. Warm Start Cold Start When a Lambda function is invoked for the first time or scales up, an execution environment is created. The first phase in...
date: '2022-11-23T20:03:09'
modified: '2022-11-23T20:03:09'
sourceUrl: https://micronaut.io/2022/11/23/aws-lambda-with-the-micronaut-framework/
wordpressId: 5922
contentSource: wordpress-post
category: uncategorized
categories:
  - uncategorized
tags:
  - aws
  - lambda
href: /2022/11/23/aws-lambda-with-the-micronaut-framework/
---

[AWS Lambda](https://aws.amazon.com/lambda/) is a serverless, event-driven compute service that lets you run code for any type of application or backend service without provisioning or managing servers.

## Cold Start vs. Warm Start

Cold Start

When a Lambda function is invoked for the first time or scales up, an execution environment is created. The first phase in the execution environment’s life cycle is initialization (Init). For applications deployed on Java-managed runtimes, a new JVM is started, and your application code is loaded. This is referred to as a cold start.

Warm Start

Subsequent requests reuse this execution environment and do not need to go through the init phase. This is referred to as a warm start.

## Developing AWS Lambda functions with the Micronaut Framework

Throughout the history of the Framework, we have seen a lot of interest from the community in building AWS Lambda functions with the Micronaut framework. Moreover, [many companies such as Disney use Micronaut successfully as their JVM framework for building AWS Lambda functions](https://aws.amazon.com/blogs/opensource/improving-developer-productivity-at-disney-with-serverless-and-open-source/).

Why have we seen such interest and usage of Micronaut in AWS Lambda? We think it is a combination of the following:

- The intrinsic characteristics of the Micronaut framework
- A robust integration with AWS Lambda
- Ability to deploy GraalVM native executables
- Rich documentation
- Easy Micronaut Lambda Project generation

### Micronaut framework characteristics fit the AWS Lambda constraints.

The Micronaut framework offers the features (dependency injection, validation, Aspect Oriented Programming (AOP), easy routing definition via annotations, repository-pattern persistence solution, built-in HTTP Client…) which developers expect from a fully-fledged JVM framework. However, it offers them without a performance cost.

The Micronaut framework performs computation at build-time (dependency injection configuration, annotation metadata, bean introspection, … ) which avoids work being done at runtime (reflection, classpath scanning, dynamic classloading, proxy generation, …). These characteristics lead to Micronaut applications that start-up fast and have low memory requirements.

**Fast start-up and low memory requirements are essential when working on AWS Lambda and those are intrinsic characteristics of the Micronaut framework.**

### Powerful integration with AWS Lambda

[Micronaut AWS](https://micronaut-projects.github.io/micronaut-aws/latest/guide/#lambda), the Micronaut module to integrate with the AWS cloud, offers [powerful integration with AWS Lambda](https://micronaut-projects.github.io/micronaut-aws/latest/guide/#lambda).

For example, while writing a Micronaut framework application that exposes a REST-API or produces server-side rendered HTML you can write the same code as you usually do when targeting other environments such as Netty. That it is to say, you will define your endpoints with annotations such as @Controller or @Get. You can take the exact code and deploy it to AWS Lambda. **You write the application in the best developer experience and deploy it to a serverless environment such as AWS Lambda with no compromises!**

### GraalVM Integration

[GraalVM](https://www.graalvm.org) is a polyglot virtual machine that, among its features, allows compiling Java applications ahead-of-time to native binaries. These native binaries start almost instantly and deliver peak performance.

Micronaut framework characteristics (no usage of reflection, …) match GraalVM requirements (need to know ahead-of-time the reflectively accessed program elements, ….) perfectly.

Micronaut AWS and the Micronaut build plugins ([Micronaut Gradle](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/) and [Micronaut Maven](https://micronaut-projects.github.io/micronaut-maven-plugin/latest/)) allow you to deploy a native executable of your function generated with GraalVM to a [custom AWS Lambda runtime](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html).

The following command outputs a ZIP which you will upload to your custom AWS Lambda runtime and contains a native executable, built with GraalVM, of your function.

Gradle:./gradlew buildNativeLambda

Maven: mvn package -Dpackaging=docker -Dmicronaut.runtime=lambda

### Micronaut AWS Lambda Tutorials

In addition to the [Micronaut AWS Lambda reference documentation](https://micronaut-projects.github.io/micronaut-aws/latest/guide/#lambda), we have written many step-by-step tutorials in [Micronaut Guides](https://guides.micronaut.io/latest/tag-lambda.html) which help you get started, and we keep them always up-to-date.

### Project Generation

Micronaut Launch and/or the Micronaut CLI allow you to generate Micronaut projects tailored to AWS Lambda.

For example:

– [Micronaut Application with API Gateway and CDK for Java runtime](https://micronaut.io/launch?type=DEFAULT&javaVersion=JDK_11&features=aws-lambda&features=aws-cdk&features=amazon-api-gateway)

– [Micronaut Function with API Gateway and CDK for Java runtime](https://micronaut.io/launch?type=FUNCTION&javaVersion=JDK_11&features=aws-lambda&features=aws-cdk&features=amazon-api-gateway)

– [Micronaut Application with API Gateway and CDK with GraalVM](https://micronaut.io/launch?type=DEFAULT&javaVersion=JDK_11&features=aws-lambda&features=aws-cdk&features=amazon-api-gateway&features=graalvm)

– [Micronaut Function with API Gateway and CDK](https://micronaut.io/launch?type=FUNCTION&javaVersion=JDK_11&features=aws-lambda&features=aws-cdk&features=amazon-api-gateway) [with GraalVM](https://micronaut.io/launch?type=DEFAULT&javaVersion=JDK_11&features=aws-lambda&features=aws-cdk&features=amazon-api-gateway&features=graalvm)

Micronaut framework 3.8.0 has a new CLI command create-aws-lambda to guide you through the steps for creating the Lambda.

## Resources

To learn more read about [Micronaut Guides for AWS Lambda](https://guides.micronaut.io/latest/tag-lambda.html).

Guides for HTTP trigger with Java runtime:

- [Deploy a Micronaut application to AWS Lambda Java 11 runtime](https://guides.micronaut.io/latest/mn-application-aws-lambda-java11.html)
- [Deploy a serverless Micronaut function to AWS Lambda Java 11 runtime](https://guides.micronaut.io/latest/mn-serverless-function-aws-lambda.html)

Guides for HTTP trigger with custom runtime and GraalVM:

- [Deploy a Micronaut function as a GraalVM native executable to AWS Lambda](https://guides.micronaut.io/latest/mn-serverless-function-aws-lambda-graalvm.html)
- [Deploy a Micronaut application as a GraalVM native executable to AWS Lambda](https://guides.micronaut.io/latest/mn-application-aws-lambda-graalvm.html)

Other triggers:

- [Micronaut AWS Lambda and a cron job](https://guides.micronaut.io/latest/micronaut-aws-lambda-eventbridge-event.html)
- [Micronaut AWS Lambda and S3 event](https://guides.micronaut.io/latest/micronaut-aws-lambda-s3-event.html)
- [Secret rotation AWS Lambda and secrets manager](https://guides.micronaut.io/latest/micronaut-aws-secretsmanager-rotation.html)
