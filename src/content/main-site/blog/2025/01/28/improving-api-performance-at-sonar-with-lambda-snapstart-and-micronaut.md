---
slug: 2025/01/28/improving-api-performance-at-sonar-with-lambda-snapstart-and-micronaut
title: Improving API performance at Sonar with Lambda SnapStart and Micronaut
description: Sonar has published a blog post about their use of Micronaut and AWS Lambda Snapstart. It is possible to generate a Micronaut Application with AWS CDK ready to be deployed to Lambda with the Micronaut CLI Command mn create-aws-lambda or selecting the aws-lambda, aws-cdk features in Micronaut Launch. It is great to see that...
date: '2025-01-28T11:55:36'
modified: '2025-01-28T11:55:52'
sourceUrl: https://micronaut.io/2025/01/28/improving-api-performance-at-sonar-with-lambda-snapstart-and-micronaut/
wordpressId: 7188
contentSource: wordpress-post
category: case-studies
categories:
  - case-studies
tags: []
href: /2025/01/28/improving-api-performance-at-sonar-with-lambda-snapstart-and-micronaut/
---

[Sonar](https://www.sonarsource.com/) has published a blog post about [their use of Micronaut and AWS Lambda Snapstart](https://aws.amazon.com/blogs/opensource/improving-api-performance-at-sonar-with-lambda-snapstart-and-micronaut/).

It is possible to generate a Micronaut Application with AWS CDK ready to be deployed to Lambda with the Micronaut CLI Command `mn create-aws-lambda` or [selecting the `aws-lambda`, `aws-cdk` features in Micronaut Launch](https://micronaut.io/launch?type=DEFAULT&features=aws-lambda&features=aws-cdk&features=arm&version=4.7.4). It is great to see that the sonar team acknowledges that.

> The Micronaut framework was the preferred choice of Sonar engineers due to its strong integration with AWS Lambda and AWS Cloud Development Kit (AWS CDK), as well as its life cycle management features that support application snapshotting.

The [Micronaut CRaC Module](https://micronaut-projects.github.io/micronaut-crac/latest/guide/) is not only useful when working with [CRaC enabled JDK](https://www.azul.com/products/components/crac/), it shines when using [AWS Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html). Really happy to see an example of priming using it:

> The OpenJDK open source Coordinated Restore at Checkpoint (CRaC) project provides runtime hooks that enable you to execute custom code before and after a snapshot is created or restored. AWS Lambda SnapStart supports the CRaC API.The Micronaut framework offers seamless integration with the CRaC project through the Micronaut CRaC module. By including this module as a dependency in their build, Sonar engineers have taken advantage of the CRaC functionality within their Micronaut-based application. Once the dependency is added, the SnapStart feature in AWS Lambda automatically invokes each registered CRaC resource at the appropriate points during the snapshot lifecycle. Priming will become important in the first step towards reducing cold starts.
>
> Using Micronaut and its support for the CRaC API, Sonar codes any logic that needs to be performed before taking a snapshot.

We have tried to make every module CRaC compatible. For example, you can use [Micronaut Data JDBC + Hikari and Micronaut CRaC](https://micronaut.io/launch?type=DEFAULT&features=crac&features=data-jdbc&features=jdbc-hikari&features=mysql). However, You have to configure Hikari `pool-suspension` as they did:

> To address this, the Micronaut framework provides a strategy called “pool suspension”: the allow-pool-suspension flag instructs the framework to suspend the connection pool at the moment the SnapStart snapshot is taken. This reduces cold-start time, as the application can suspend connections instead of having to recover from a broken one. By doing this, Sonar ensures that the snapshot doesn’t capture any connections or resources that may become stale or invalid later on. In this scenario, establishing, pausing, and resuming the connection is quicker than employing a post-snapshot hook.

We are glad to be part of Sonar’s journey, and I look forward to talking more about how we use Sonar products, such as [SonarQube Cloud](https://www.sonarsource.com/products/sonarcloud/), to develop the Micronaut Framework.

> In Sonar’s journey towards building a robust, efficient and scalable microservices architecture, Micronaut has played an important role. Micronaut achieves this through its dedicated CraC module, which offers developers a straightforward way to incorporate state capture at a specific point in time. This advantage aligns well with the principles of open source development by promoting efficiency.

Read the whole blog post. It is great to see what they achieved.
