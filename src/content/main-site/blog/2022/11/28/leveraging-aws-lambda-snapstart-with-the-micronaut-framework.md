---
slug: 2022/11/28/leveraging-aws-lambda-snapstart-with-the-micronaut-framework
title: Leveraging AWS Lambda SnapStart with the Micronaut Framework
description: Developing and deploying AWS Lambda functions with the Micronaut framework have been possible either with the Java runtime, or by deploying a native executable built with GraalVM to a custom runtime. The latter provides faster cold starts. When a Lambda function is invoked for the first time or scales up, an execution environment is created....
date: '2022-11-28T05:38:15'
modified: '2022-11-29T10:20:45'
sourceUrl: https://micronaut.io/2022/11/28/leveraging-aws-lambda-snapstart-with-the-micronaut-framework/
wordpressId: 5925
contentSource: wordpress-post
category: uncategorized
categories:
  - uncategorized
tags:
  - aws
  - lambda
href: /2022/11/28/leveraging-aws-lambda-snapstart-with-the-micronaut-framework/
---

[Developing and deploying AWS Lambda functions with the Micronaut framework](https://micronaut.io/2022/11/23/aws-lambda-with-the-micronaut-framework/) have been possible either with the Java runtime, or by deploying a native executable built with GraalVM to a custom runtime. The latter provides faster cold starts.

> *When a Lambda function is invoked for the first time or scales up, an execution environment is created. The first phase in the execution environment’s life cycle is initialization (Init). For applications deployed on Java-managed runtimes, a new JVM is started, and your application code is loaded. This is referred to as a cold start.*

## SnapStart

Today, AWS has announced Lambda [SnapStart](https://aws.amazon.com/blogs/aws/new-accelerate-your-lambda-functions-with-lambda-snapstart/), an opt-in feature of AWS Lambda, which delivers up to 10x faster startup performance for latency-sensitive Java applications.

> *When SnapStart is enabled, function code is initialized once when a function version is published. Lambda then takes a snapshot of the memory and disk state of the initialized execution environment, encrypts snapshot, and caches it for low-latency access. When the function is first invoked or subsequently scaled, Lambda resumes new execution environments from the cached snapshot instead of initializing from scratch, avoiding several seconds of variable latency.*

You can enable SnapStart using a function-level opt-in switch in the AWS CLI, Lambda Console, Lambda API, AWS SDK, AWS CloudFormation, AWS SAM, and AWS CDK.

In this article, we describe how **SnapStart dramatically reduces your cold starts for AWS Lambda Functions developed with the Micronaut framework and deployed to the Java runtime**.

## Micronaut deployment options for AWS Lambda

You can deploy a Micronaut application as a FAT jar to the [AWS Lambda Java runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) or as a native executable built with GraalVM to a [custom AWS Lambda runtime](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html). A native executable deployed to a custom runtime offers fast cold starts. **With the release of SnapStart, developers can deploy to the Java runtime and enjoy fast cold starts as well.**

## Hello World Performance

The following diagram shows cold starts improvements for a Hello World application. In this article, we will compare closer to a production scenario.

![](https://micronaut.io/wp-content/uploads/2022/11/Screenshot-2022-11-29-at-11.10.51-1024x448.png)

## Sample application

In this blog, we compare the performance of a [sample application](https://github.com/micronaut-projects/micronaut-lambda-todo) deployed to AWS Lambda.

### Application Size

We will show a comparison with an application closer to a production scenario, rather than using a *Hello World* application. This sample application contains more than 60 Java classes and more than 2000 lines of Java code.

### Architecture

The application’s architecture features an [Amazon API Gateway](https://aws.amazon.com/api-gateway/) proxying to a Lambda function which reads and writes to a [DynamoDB](https://aws.amazon.com/dynamodb/) table.

![](https://micronaut.io/wp-content/uploads/2022/11/B7CA7D3E-41E4-4259-B3DA-456F55D01905_4_5005_c-1024x256.jpeg)

### Dependencies

Moreover, it adds many dependencies you may find in your Micronaut applications:

- [Micronaut Security OAuth 2.0](https://micronaut-projects.github.io/micronaut-security/latest/guide/#oauth)
- [Micronaut Security JWT](https://micronaut-projects.github.io/micronaut-security/latest/guide/#jwt)
- [Micronaut Open API](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/)
- [Micronaut Views Thymeleaf](https://micronaut-projects.github.io/micronaut-views/latest/guide/#thymeleaf)

The application exposes a JSON API and renders server-side HTML to present forms and visualize data.

### Build

The Micronaut framework is built agnostic. You can build Micronaut functions with Maven or Gradle and deploy them to AWS Lambda. For the sample application in this article, we used Gradle. It is a multi-module build. Each of the deployments shares the same code.

![](https://micronaut.io/wp-content/uploads/2022/11/Screen-Shot-2022-11-23-at-2.52.33-PM-1024x443.png)

### Infrastructure as Code

The Micronaut framework integrates with [Amazon CDK](https://aws.amazon.com/cdk/). The module `infra` contains the code which creates the infrastructure described in the previous architecture.

Here are [README.md](https://github.com/micronaut-projects/micronaut-lambda-todo#readme) instructions to run the comparison in your own AWS account seamlessly, as it is described in this article.

### Load Tests

The project contains a module named `loadtests` which uses [Gatling](https://gatling.io), a powerful open-source load testing solution, to invoke the Lambda function.

The load test runs a POST, GET, DELETE scenario with 50 concurrent users for 3 minutes and then ramps up to 100 concurrent users for 2 additional minutes.

## Max Cold Start Comparison

The following diagram compares the max cold startup during the load test for four deployment scenarios:

- Java application deployed to Java Runtime
- Java application deployed to Java Runtime plus SnapStart
- Java application deployed to Java Runtime plus SnapStart plus Priming (Performance Tuning).
- Native executable built with GraalVM deployed to a custom Runtime

![](https://micronaut.io/wp-content/uploads/2022/11/Screenshot-2022-11-29-at-11.13.30-1024x520.png)

Using the Java runtime and SnapStart offers them dramatic cold starts improvements.

## Cold Starts

Cold starts are a rare occurrence. You can see this reflected in the following diagram below. The load test shows 99.9% of requests are served in less than 83ms.

![](https://micronaut.io/wp-content/uploads/2022/11/Screen-Shot-2022-11-23-at-2.51.53-PM-1024x390.png)

The max cold start is calculated by running a [Cloud Watch Log Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html) query. For functions with SnapStart enabled:

```
filter @message like "REPORT"
| filter @message not like "RESTORE_REPORT"
| parse @message /Restore Duration: (?<@restore_duration_ms>[0-9\.]+)/
| parse @message / Duration: (?<@invoke_duration_ms>[0-9\.]+)/
| fields
greatest(@restore_duration_ms, 0) as restore_duration_ms,
greatest(@invoke_duration_ms, 0) as invoke_duration_ms
| fields
restore_duration_ms + invoke_duration_ms as total_invoke_ms
| stat
max(total_invoke_ms) as max
```

For functions without SnapStart enabled:

```
filter @type="REPORT"
| fields greatest(@initDuration, 0) + @duration as duration
| max(duration) as max
```

Read more about [Monitoring for SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart-monitoring.html).

## SnapStart Runtime Hooks and CRaC integration

[SnapStart allows you to define runtime hooks via the Coordinated Restore at Checkpoint (CRaC) project API](https://docs.aws.amazon.com/lambda/latest/dg/snapstart-runtime-hooks.html).

Fortunately, the Micronaut framework already offers [CRaC](https://wiki.openjdk.org/display/CRaC) integration via the module [Micronaut CRaC](https://micronaut-projects.github.io/micronaut-crac/latest/guide/).

Once you add the [Micronaut CRaC](https://micronaut-projects.github.io/micronaut-crac/latest/guide/) dependency to your build, SnapStart invokes each CRaC resource before creating a snapshot (checkpointing when the function version is being published) or while restoring the snapshot (upon function invocation).

To define a CRaC resource, create a bean of type *io.micronaut.crac.OrderedResource* The following bean does some simple logging:

```
package example.micronaut;
import io.micronaut.crac.OrderedResource;
import jakarta.inject.Singleton;
import org.crac.Context;
import org.crac.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@Singleton
public class LoggingResource implements OrderedResource  {
    private static final Logger LOG = LoggerFactory.getLogger(LoggingResource.class);

    @Override
    public void beforeCheckpoint(Context<? extends Resource> context) throws Exception {
        LOG.info("before creating a snapshot");
    }

    @Override
    public void afterRestore(Context<? extends Resource> context) throws Exception {
        LOG.info("restoring the snapshot");
    }
}
```

## Performance Tuning (Priming)

You can use a CRaC resource to exercise your Java code before creating a snapshot for [performance tuning](https://docs.aws.amazon.com/lambda/latest/dg/snapstart-best-practices.html#snapstart-tuning).

> To maximize the benefits of SnapStart, we recommend that you preload classes that contribute to startup latency in your initialization code instead of in the function handler. This moves the latency associated with heavy class loading out of the invocation path, optimizing startup performance with SnapStart.

The `priming` variant of the sample application adds a resource which saves and deletes a todo from the DynamoDB table.

```
@Singleton
public class PrimingResource implements OrderedResource {
   ...
   ..
   .
   @Override
   public void beforeCheckpoint(Context<? extends Resource> context) throws Exception {
       LOG.info("priming...");
       OauthUserUtils.parseOAuthUser(authentication()).ifPresent(user -> {
          String todoId = todoSaveService.save(new TodoCreate(randomAlphanumeric(20)), user);
          todoRepository.delete(todoId, user);
       });
       LOG.info("finished priming");
   }
   .
   ..
   ...
}
```

Exercising the Java code before a snapshot can lead to a faster restoration from a snapshot.

## Differences between the applications

The build of the modules `function-java` and `function-java-snapstart`, and `function-java-snapstart-priming` applies the Micronaut Gradle plugin `io.micronaut.minimal.application` and it configures the Micronaut extension with:

```
micronaut {
    runtime("lambda_java")
}
```

The build of the module `function-native`, responsible of generating the native executable with GraalVM, applies the Micronaut Gradle plugin `io.micronaut.application` and it configures the Micronaut extension with:

```
micronaut {
    runtime("lambda_provided")
}
```

When you use `lambda_provided` as your runtime, the [Micronaut Gradle Plugin](https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/) adds transparently extra dependencies to your build, such as `io.micronaut.aws:micronaut-function-aws-custom-runtime`, which is not necessary when deploying to a Java runtime.

### SnapStart differences

The only difference between `function-java` and `function-java-snapstart` or `function-java-snapstart-priming` is the addition of the [Micronaut CRaC](https://micronaut-projects.github.io/micronaut-crac/latest/guide/) dependency and the classes `LoggingResource` or `PrimingResource` mentioned in the previous sections.

Micronaut CRaC dependency is only necessary if you want to leverage SnapStart runtime hooks.

### GraalVM Native Executable differences

The application uses [Thymleaf](https://www.thymeleaf.org) as a template rendering engine. Thymeleaf accesses some of the application’s classes using reflection. To make the application work as a native executable, a [reflection configuration file](https://github.com/micronaut-projects/micronaut-lambda-todo/blob/master/code-graal/src/main/resources/META-INF/native-image/com.micronauttodo/reflect-config.json) was generated.

The Micronaut framework provides several annotations [@TypeHint](https://docs.micronaut.io/latest/api/io/micronaut/core/annotation/TypeHint.html), [@ReflectiveAccess](https://docs.micronaut.io/latest/api/io/micronaut/core/annotation/ReflectiveAccess.html), and [@ReflectionConfig](https://docs.micronaut.io/latest/api/io/micronaut/core/annotation/ReflectionConfig.html), to ease the generation of such reflection configuration for you.

### Deployable artifact generation

To generate deployable artifacts, I use the Gradle task `./gradlew function-java:shadowJar` for both `function-java`, `function-java-snapstart` and `function-java-snapstart-priming`.

For function-native, I run the `./gradlew function-java:buildNativeLambda.`

The generation of a native executable with GraalVM is slower than a FAT JAR.

![](https://micronaut.io/wp-content/uploads/2022/11/Screen-Shot-2022-11-23-at-2.53.33-PM-1024x584.png)

The above image shows build times which will change depending on your hardware.

### Memory

This blog post comparison uses identical Lambda Memory settings: 2024 MB.

However, **a native executable deployed to a custom runtime has a lower memory requirement**. Thus, you could get the same performance with smaller memory and, therefore, cheaper.

## Resources

- [App in this article](https://github.com/micronaut-projects/micronaut-lambda-todo)
- [AWS Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html)
- [Micronaut AWS Lambda](https://micronaut-projects.github.io/micronaut-aws/latest/guide/#lambda)
- [Micronaut Guides for AWS Lambda](https://guides.micronaut.io/latest/tag-lambda.html)
- [Micronaut CRaC](https://micronaut-projects.github.io/micronaut-crac/latest/guide/)

## Conclusion

In this article, we have seen how AWS Lambda’s new feature [SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html) improves the cold start performance of Java applications that are running on AWS Lambda. We compared the same code with the Java Runtime, Java Runtime plus SnapStart and a Native executable in a custom runtime.

We have also seen how to use Micronaut CRaC to help us create runtime hooks for AWS SnapStart, further to improve performance or execute logic before or after snapshot creation.

AWS Lambda SnapStart greatly reduces cold starts for Java. This is an exciting opportunity for JVM developers to unleash the full potential of AWS Lambda for Java. The Micronaut framework helps you do just that.
