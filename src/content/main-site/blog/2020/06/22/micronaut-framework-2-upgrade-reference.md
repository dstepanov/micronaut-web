---
slug: 2020/06/22/micronaut-framework-2-upgrade-reference
title: Micronaut Framework 2 Upgrade Reference
description: Historical upgrade notes, new features, and breaking changes for Micronaut Framework 2.x.
date: "2020-06-22T00:00:00"
sourceUrl: https://micronaut-projects.github.io/micronaut-upgrade/snapshot/
contentSource: micronaut-upgrade
category: upgrade
categories:
  - upgrade
tags:
  - upgrade
  - micronaut2
href: /2020/06/22/micronaut-framework-2-upgrade-reference/
---

<p>These historical upgrade notes were migrated from the <a href="https://micronaut-projects.github.io/micronaut-upgrade/snapshot/">Micronaut Upgrade Guide archive</a>.</p>

<div class="sect1">
<h2 id="_micronaut_framework_2_5_0">Micronaut Framework 2.5.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_2_5_0">What&#8217;s new with 2.5.0</h3>
<div class="sect3">
<h4 id="_core_features_3">Core Features</h4>
<div class="sect4">
<h5 id="_io_stream_support">IO Stream Support</h5>
<div class="paragraph">
<p>It is now possible to define a body argument of a controller method with an InputStream. For example <code>@Body InputStream inputStream</code>. Note that you must offload the execution to another thread pool to avoid blocking the event loop when reading the stream. <code>InputStream</code> can also be returned from controller methods.</p>
</div>
</div>
<div class="sect4">
<h5 id="_http_to_https_redirect_with_dual_protocol">HTTP to HTTPS redirect with Dual Protocol</h5>
<div class="paragraph">
<p>If Dual Protocol is enabled, now it is possible to redirect all HTTP requests automatically to the HTTPS port. See more information <a href="#dualProtocol">about how to enable and configure it</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_graalvm_21_1_0_support">GraalVM 21.1.0 Support</h5>
<div class="paragraph">
<p>Micronaut has been updated to support the latest GraalVM 21.1.0 release with the Gradle and Maven plugins now defaulting to 21.1.0.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_jdk_16_and_gradle_7_0_in_micronaut_launch">Support for JDK 16 and Gradle 7.0 in Micronaut Launch</h5>
<div class="paragraph">
<p><a href="https://micronaut.io/launch/">Micronaut Launch</a> has been updated with support for JDK 16 and Gradle 7.0.</p>
</div>
</div>
<div class="sect4">
<h5 id="_random_configuration_values_2">Random Configuration Values</h5>
<div class="paragraph">
<p>It is now possible to set a max and a range for random numbers in configuration. For example to set an integer between 0 and 9, <code>${random.int(10)}</code> can be used as the configuration value. See the <a href="#propertySource">documentation</a> under "Using Random Properties" for more information.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_module_upgrades_5">Module Upgrades</h4>
<div class="sect4">
<h5 id="_micronaut_data_2_4_0">Micronaut Data 2.4.0</h5>
<div class="paragraph">
<p>Huge <a href="https://micronaut-projects.github.io/micronaut-data/latest/guide/">Micronaut Data</a> update including many new features including:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Full support for immutable entities. You can use Java 16 records or Kotlin immutable data classes</p>
</li>
<li>
<p>Integrated support for R2DBC, now the <code>data-r2dbc</code> module is a part of the data project and shares the same code with JDBC</p>
</li>
<li>
<p>Optimistic locking for JDBC/R2DBC</p>
</li>
<li>
<p>Repositories now support batch insert/update/delete even with a custom query</p>
</li>
<li>
<p>Rewritten entity mapper allows more complex mapping for JDBC/R2DBC entities</p>
</li>
<li>
<p>Support for <code>@JoinTable</code> and <code>@JoinColumn</code> annotations</p>
</li>
<li>
<p>A lot of bugfixes!</p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_micrometer_3_4_0">Micronaut Micrometer 3.4.0</h5>
<div class="paragraph">
<p>The <a href="https://micronaut-projects.github.io/micronaut-micrometer/latest/guide/">Micrometer module</a> has been upgraded and now supports repeated definitions of the <a href="https://micrometer.io/docs/concepts#_the_timed_annotation">@Timed</a> annotation as well as also supporting the <code>@Counted</code> annotation for counters when you add the <code>micronaut-micrometer-annotation</code> dependency to your annotation processor classpath.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_oracle_cloud_1_3_0">Micronaut Oracle Cloud 1.3.0</h5>
<div class="paragraph">
<p>Micronaut&#8217;s <a href="https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/">Oracle Cloud Integration</a> has been updated with support for Cloud Monitoring and Tracing.</p>
</div>
</div>
<div class="sect4">
<h5 id="_other_modules_2">Other Modules</h5>
<div class="ulist">
<ul>
<li>
<p>Micronaut Security 2.4.2</p>
</li>
<li>
<p>Micronaut Azure 2.2.0</p>
</li>
<li>
<p>Micronaut Aws 2.6.0</p>
</li>
<li>
<p>Micronaut Grpc 2.4.0</p>
</li>
<li>
<p>Micronaut OpenApi 2.4.0</p>
</li>
<li>
<p>Micronaut Kafka 3.3.0</p>
</li>
<li>
<p>Micronaut Flyway 3.6.0</p>
</li>
<li>
<p>Micronaut Liquibase 3.3.1</p>
</li>
<li>
<p>Micronaut Discovery Client 2.4.0</p>
</li>
<li>
<p>Micronaut ElasticSearch 2.3.0</p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_dependency_upgrades_2">Dependency Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Kafka 2.8.0</p>
</li>
<li>
<p>GraalVM 21.1.0</p>
</li>
<li>
<p>Liquibase 4.3.4</p>
</li>
<li>
<p>Flyway 7.7.3</p>
</li>
<li>
<p>Elasticsearch 7.12.0</p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_2_5_0_breaking_changes">2.5.0 Breaking Changes</h3>
<div class="paragraph">
<p>In previous versions of Micronaut it was possible to read the body of a request in a server filter under some conditions. Reading the request body in a filter has historically been inconsistent because the body is not read in many cases. In Micronaut 2.4, the body was read until the route arguments were satisfied, and then the server filters were executed. This lead to issues with memory leaks in some cases and is inefficient because a filter may skip route execution altogether by not proceeding the chain, thus the body did not need to be read. In Micronaut 2.5 the body will not be read until after filters are executed. This may lead to cases where the body was available in a filter and is no longer available.</p>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_2_4_0">Micronaut Framework 2.4.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_2_4_0">What&#8217;s new with 2.4.0</h3>
<div class="sect3">
<h4 id="_core_features_4">Core Features</h4>
<div class="sect4">
<h5 id="_jakarta_inject_2">Jakarta Inject</h5>
<div class="paragraph">
<p>The <code>jakarta.inject</code> inject annotations are now supported as an alternative to <code>javax.inject</code>. Micronaut 3 will change the default inject annotations to Jakarta, however the javax annotations will continue to be supported if added to your build explicitly.</p>
</div>
<div class="paragraph">
<p>Micronaut 3 will change the bean context API to return our custom provider contract, api:context.BeanProvider[]. We suggest existing applications to change to use that interface instead of <code>javax.inject.Provider</code>, however both the <code>jakarta.inject.Provider</code> and <code>javax.inject.Provider</code> interfaces will continue to be supported.</p>
</div>
</div>
<div class="sect4">
<h5 id="_core_nullability_annotations">Core Nullability Annotations</h5>
<div class="paragraph">
<p>With the future of JSR-305 unclear and issues with regards to the module system with existing solutions, Micronaut 2.4 will replace usages of Spotbugs with core nullability annotations: ann:core.annotation.Nullable[] and ann:core.annotation.NotNull[].</p>
</div>
<div class="paragraph">
<p>Existing applications should switch to using these annotations. If other annotations are preferable, the dependency should be added explicitly to your build because no third party <code>Nullable</code> or <code>NonNull</code> annotations will be available transitively in the next major version.</p>
</div>
</div>
<div class="sect4">
<h5 id="_improvements_to_interceptor_binding">Improvements to Interceptor Binding</h5>
<div class="paragraph">
<p>Micronaut&#8217;s support for AOP interceptors has been improved allowing interceptors to be attached to any annotation through the use of api:inject.annotation.AnnotationMapper[] instances. It is also now possible to bind multiple api:aop.MethodInterceptor[] instances to a single annotation instead of there being a 1-to-1 mapping between annotation and interceptor.</p>
</div>
<div class="paragraph">
<p>From 2.4.x onwards the recommending way to define AOP advise is to use the ann:aop.InterceptorBinding[] annotation on the annotation you wish to trigger AOP advise:</p>
</div>
<div class="paragraph">
<p>snippet::io.micronaut.docs.aop.around.NotNull[tags="imports,annotation", indent=0, title="Around Advice Annotation Example"]</p>
</div>
<div class="paragraph">
<p>Then use ann:aop.InterceptorBean[] on the api:aop.MethodInterceptor[] you wish to bind to the above advise:</p>
</div>
<div class="paragraph">
<p>snippet::io.micronaut.docs.aop.around.NotNullInterceptor[tags="imports,interceptor", indent=0, title="MethodInterceptor Example"]</p>
</div>
<div class="paragraph">
<p>Multiple api:aop.MethodInterceptor[] types can bind to a single advise annotation and any given interceptor can bind to multiple annotations.</p>
</div>
</div>
<div class="sect4">
<h5 id="_json_error_responses">JSON Error Responses</h5>
<div class="paragraph">
<p>In previous versions of Micronaut, to control the format of error response bodies, it required replacing all of the existing api:http.server.exceptions.ExceptionHandler[] instances. In Micronaut 2.4, the logic to create error response bodies has been moved to a single bean that implements api:http.server.exceptions.response.ErrorResponseProcessor[]. Now instead of having to replace many beans to have a consistent format, only a single bean needs to be replaced. The default implementation behaves the same as in previous versions to maintain backward compatibility.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_data_2">Micronaut Data</h4>
<div class="sect4">
<h5 id="_support_for_java_14_records_with_jdbc">Support for Java 14+ Records with JDBC</h5>
<div class="paragraph">
<p>Micronaut Data JDBC now <a href="https://micronaut-projects.github.io/micronaut-data/latest/guide/#javaRecords">supports using Java 14+ records to represent persistent entities</a>, for example:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">package example;

import edu.umd.cs.findbugs.annotations.Nullable;
import io.micronaut.data.annotation.*;
import java.util.Date;

@MappedEntity
record Book(
        @Id @GeneratedValue @Nullable Long id,
        @DateCreated @Nullable Date dateCreated,
        String title,
        int pages) {
    Book(String title, int pages) {
        this(null, null, title, pages)
    }
}</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_persistence_events_support">Persistence Events Support</h5>
<div class="paragraph">
<p>Micronaut Data JPA, JDBC and R2DBC now support <a href="https://micronaut-projects.github.io/micronaut-data/latest/guide/#entityEvents">persistence events</a> on either entities or Micronaut beans. For example:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">package example;

import io.micronaut.data.annotation.event.PrePersist;
import javax.inject.Singleton;

@Singleton
public class AccountUsernameValidator {
    @PrePersist
    void validateUsername(Account account) {
        final String username = account.getUsername();
        if (username == null || !username.matches("[a-z0-9]+")) {
            throw new IllegalArgumentException("Invalid username");
        }
    }
}</code></pre>
</div>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_integration_with_oracle_coherence_ce">Integration with Oracle Coherence CE</h4>
<div class="paragraph">
<p>We are pleased to announce a first milestone release of Micronaut integration with Oracle Coherence Community Edition, which makes implementation of Micronaut applications with a Coherence back end a breeze.</p>
</div>
<div class="paragraph">
<p>Below are some of the features supported by the various modules within <code>micronaut-coherence</code> project:</p>
</div>
<div class="sect4">
<h5 id="_micronaut_data_support">Micronaut Data Support</h5>
<div class="paragraph">
<p>The <code>micronaut-coherence-data</code> module alows you to use <a href="https://micronaut-projects.github.io/micronaut-coherence/latest/guide/#repository">Micronaut Data with Coherence as a back end data store</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_dependency_injection_of_coherence_managed_objects">Dependency Injection of Coherence-managed Objects</h5>
<div class="paragraph">
<p>A new <code>micronaut-coherence</code> module provides factories for commonly used Coherence objects, such as <code>Cluster</code>, <code>Session</code>, <code>NamedMap</code>, <code>NamedCache</code>, <code>NamedTopic</code>, and many others, which allows you to <a href="https://micronaut-projects.github.io/micronaut-coherence/latest/guide/#injection">easily inject those objects</a> into your application classes.</p>
</div>
</div>
<div class="sect4">
<h5 id="_listeners_for_coherence_events">Listeners for Coherence Events</h5>
<div class="paragraph">
<p>The <code>micronaut-coherence</code> module also provides support for Coherence <a href="https://micronaut-projects.github.io/micronaut-coherence/latest/guide/#coherenceEvents">server-</a> and <a href="https://micronaut-projects.github.io/micronaut-coherence/latest/guide/#mapEvents">client-side</a> events via Micronaut event listeners.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_messaging_support">Micronaut Messaging Support</h5>
<div class="paragraph">
<p>Finally, the <code>micronaut-coherence</code> module provides support for <a href="https://micronaut-projects.github.io/micronaut-coherence/latest/guide/#messagingWithTopics">Micronaut Messaging using Coherence Topics</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_caching_support">Micronaut Caching Support</h5>
<div class="paragraph">
<p>The <code>micronaut-coherence-cache</code> module adds support for <a href="https://micronaut-projects.github.io/micronaut-coherence/latest/guide/#cache">using Coherence as a back end for Micronaut Cache</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_distributed_config_support">Micronaut Distributed Config Support</h5>
<div class="paragraph">
<p>The <code>micronaut-coherence-distributed-configuration</code> module adds support for <a href="https://micronaut-projects.github.io/micronaut-coherence/latest/guide/#distributedConfiguration">using Coherence as a store for Micronaut Distributed Configuration</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_http_sessions_support">Micronaut HTTP Sessions Support</h5>
<div class="paragraph">
<p>The <code>micronaut-coherence-session</code> module adds support for <a href="https://micronaut-projects.github.io/micronaut-coherence/latest/guide/#coherenceHttpSessions">using Coherence as a store for Micronaut HTTP Sessions</a>.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_cloud_features">Cloud Features</h4>
<div class="sect4">
<h5 id="_easier_configuration_of_oracle_cloud_autonomous_database">Easier Configuration of Oracle Cloud Autonomous Database</h5>
<div class="paragraph">
<p>A new <code>micronaut-oraclecloud-atp</code> has been added that makes it easier to <a href="https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/#autonomousDatabase">automatically download the Oracle Wallet definition and connect to Autonomous Database</a> on Oracle Cloud.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_oracle_cloud_monitoring_via_micrometer">Support for Oracle Cloud Monitoring via Micrometer</h5>
<div class="paragraph">
<p>A new <code>micronaut-oraclecloud-micrometer</code> module has been added that adds support for <a href="https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/#micrometer">exporting Micrometer metrics to Oracle Cloud</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_official_kubernetes_client">Official Kubernetes Client</h5>
<div class="paragraph">
<p>With the new <code>micronaut-kubernetes-client</code> module you can now inject apis objects from the <a href="https://github.com/kubernetes-client/java">official Kubernetes Java SDK</a> as regular beans.</p>
</div>
<div class="paragraph">
<p>In Micronaut 3 this new module will be used as primary kubernetes client, making the current one deprecated.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_aws">Micronaut AWS</h5>
<div class="paragraph">
<p>Micronaut AWS now includes the new AWS SDK v2 that has support for GraalVM out of the box. Every service included in the module like S3, Parameter Store, SES, SQS,&#8230;&#8203; is now compatible with Micronaut-GraalVM integration.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_module_upgrades_6">Module Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Micronaut Oracle Cloud <code>1.1.1</code> &#8594; <code>1.2.1</code></p>
</li>
<li>
<p>Micronaut Data <code>2.2.4</code> &#8594; <code>2.3.0</code></p>
</li>
<li>
<p>Micronaut R2DBC <code>1.0.1</code> &#8594; <code>1.1.0</code></p>
</li>
<li>
<p>Micronaut Kubernetes <code>2.2.0</code> &#8594; <code>2.3.0</code></p>
</li>
<li>
<p>Micronaut AWS <code>2.3.0</code> &#8594; <code>2.4.0</code></p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_dependency_upgrades_3">Dependency Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Jaeger Version <code>1.3.1</code> &#8594; <code>1.5.0</code></p>
</li>
<li>
<p>Zipkin Version <code>2.15.0</code> &#8594; <code>2.16.3</code></p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_2_4_0_breaking_changes">2.4.0 Breaking Changes</h3>
<div class="paragraph">
<p>Methods annotated with <code>@CircuitBreaker</code> that used the <code>includes</code> or <code>excludes</code> members were not functioning correctly. The circuit breaker was opening for exceptions that did not match the supplied exception types. This has been changed to correctly respect the includes and excludes.</p>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_2_3_0">Micronaut Framework 2.3.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_2_3_0">What&#8217;s new with 2.3.0</h3>
<div class="sect3">
<h4 id="_core_features_5">Core Features</h4>
<div class="sect4">
<h5 id="_banner">Banner</h5>
<div class="paragraph">
<p>A new customizable banner is now displayed when the application starts up. See <a href="#_micronaut_banner">Micronaut Banner</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_compatibility_with_graalvm_21_0_0">Compatibility with GraalVM 21.0.0</h5>
<div class="paragraph">
<p>This release is compatible with the latest GraalVM 21.0.0 release, updating and testing all modules against the latest version of native image.</p>
</div>
</div>
<div class="sect4">
<h5 id="_improved_support_for_records">Improved Support for Records</h5>
<div class="paragraph">
<p>Java 14+ Records can now be used to define <a href="#configurationProperties">Configuration Properties</a>. By default when <code>@ConfigurationProperties</code> is used on a <code>record</code>, configuration injection is applied. For example:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">package example;
import io.micronaut.context.annotation.*;
import javax.validation.constraints.*;

@ConfigurationProperties("example")
record Example(@Min(20) int num, String name) {
}</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_bean_introspections_now_support_execution_handles">Bean Introspections Now Support Execution Handles</h5>
<div class="paragraph">
<p>A api:core.beans.BeanIntrospection[] can now declare methods that should generate reflection-free execution handles. This feature allows calling other methods (besides setters) on introspections without using reflection.</p>
</div>
</div>
<div class="sect4">
<h5 id="_improved_support_for_copy_constructors_and_immutable_types">Improved Support for Copy Constructors and Immutable Types</h5>
<div class="paragraph">
<p>An immutable api:core.beans.BeanIntrospection[] (like Java Records as mentioned above) requires different handling when you need to create a new instance with a particular property modified. A typical pattern for this is to construct a new instance passing all existing values plus the modified value (see for example <a href="https://projectlombok.org/features/With">Lombok&#8217;s @With</a>).</p>
</div>
<div class="paragraph">
<p>Micronaut&#8217;s Bean Introspections now support this pattern. For example:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">val introspection = BeanIntrospection.getIntrospection(Example.java);
Example example = introspection.instantiate(10, "Test");
assertEquals(10, example.num());
example = introspection.getRequiredProperty("num", int.class)
             .withValue(example, 20);
assertEquals(20, example.num());</code></pre>
</div>
</div>
<div class="paragraph">
<p>The new <code>withValue</code> method automatically creates a new instance, populating the existing properties and returning the instance.</p>
</div>
<div class="paragraph">
<p>Micronaut computes at compile time an efficient copy-constructor approach that only returns a new instance if the value changes.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_http_features_3">HTTP Features</h4>
<div class="sect4">
<h5 id="_locale_resolution">Locale Resolution</h5>
<div class="paragraph">
<p>A new interface api:http.server.util.HttpLocaleResolver[] has been introduced to support resolving a locale from a given request in multiple ways. A <code>java.util.Locale</code> object can now be a parameter to controller and client methods to automatically bind the locale to/from the request. See <a href="#localeResolution">the documentation</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_host_resolution">Host Resolution</h5>
<div class="paragraph">
<p>It is now possible to validate a resolved host against a list of regular expressions patterns. See <a href="#hostResolution">the documentation</a> for more information.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_cloud_features_2">Cloud Features</h4>
<div class="sect4">
<h5 id="_new_cicd_deployment_workflows_for_github_actions_in_launch">New CI/CD Deployment Workflows for Github Actions in Launch</h5>
<div class="paragraph">
<p><a href="https://micronaut.io/launch/">Micronaut Launch</a> has been updated to include CI/CD workflows to deploy to common container-based Cloud environments including Oracle Cloud Function, Azure Container Instance and Google Cloud Run.</p>
</div>
<div class="paragraph">
<p>Combined with the ability to <a href="https://www.youtube.com/watch?v=X4AKGf1TlXM">Push to Github</a> this makes it a breeze to set up Micronaut applications to be deployed to the Cloud.</p>
</div>
</div>
<div class="sect4">
<h5 id="_google_cloud_secret_manager">Google Cloud Secret Manager</h5>
<div class="paragraph">
<p>Thanks to a contribution by <a href="https://github.com/viniciusccarvalho">Vinicius Carvalho</a>, <a href="https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#introduction">Micronaut GCP</a> supports <a href="https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#secretManager">distributed configuration via Google Cloud Secret Manager</a>.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_jms">Micronaut JMS</h4>
<div class="paragraph">
<p>A new <a href="https://micronaut-projects.github.io/micronaut-jms/1.0.x/guide/">Micronaut JMS module</a> (currently in preview) to support JMS messaging including ActiveMQ and Amazon SQS has been added with full support for GraalVM native image. See the <a href="https://micronaut-projects.github.io/micronaut-jms/1.0.x/guide/">Micronaut JMS documentation</a> for more information.</p>
</div>
</div>
<div class="sect3">
<h4 id="_other_improvements">Other improvements</h4>
<div class="paragraph">
<p>While Micronaut has always followed the <a href="https://semver.org/">Semantic Versioning</a> principles, our non-stable versioning didn&#8217;t match the specification. For example, our snapshots were versioned as <code>1.2.3.BUILD-SNAPSHOT</code> as opposed to <code>1.2.3-SNAPSHOT</code>.</p>
</div>
<div class="paragraph">
<p>Since Micronaut 2.3, all our artifacts' non-stable versions will be like:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Snapshots: <code>1.2.3-SNAPSHOT</code>.</p>
</li>
<li>
<p>Milestones: <code>1.2.3-M1</code>, <code>1.2.3-M2</code>, etc.</p>
</li>
<li>
<p>Release candidates: <code>1.2.3-RC1</code>, <code>1.2.3-RC2</code>, etc.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_module_upgrades_7">Module Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Micronaut XML <code>2.1.0</code> &#8594; <code>2.2.1</code></p>
</li>
<li>
<p>Micronaut Cache <code>2.2.0</code> &#8594; <code>2.3.0</code></p>
</li>
<li>
<p>Micronaut Security <code>2.2.2</code> &#8594; <code>2.3.0</code></p>
</li>
<li>
<p>Micronaut Spring <code>2.1.2</code> &#8594; <code>3.2.0</code></p>
</li>
<li>
<p>Micronaut GCP <code>3.3.0</code> &#8594; <code>3.4.0</code></p>
</li>
<li>
<p>Micronaut AWS <code>2.2.5</code> &#8594; <code>2.3.0</code></p>
</li>
<li>
<p>Micronaut OpenAPI <code>2.2.2</code> &#8594; <code>2.3.0</code></p>
</li>
<li>
<p>Micronaut SQL <code>3.3.5</code> &#8594; <code>3.4.0</code></p>
</li>
<li>
<p>Micronaut Views <code>2.1.0</code> &#8594; <code>2.2.1</code></p>
</li>
<li>
<p>Micronaut Test <code>2.2.1</code> &#8594; <code>2.3.2</code></p>
</li>
<li>
<p>Micronaut PicoCLI <code>3.1.0</code> &#8594; <code>3.2.0</code></p>
</li>
<li>
<p>Micronaut RabbitMQ <code>2.2.2</code> &#8594; <code>2.3.2</code></p>
</li>
<li>
<p>Micronaut Flyway <code>3.1.0</code> &#8594; <code>3.3.0</code></p>
</li>
<li>
<p>Micronaut Kubernetes <code>2.1.0</code> &#8594; <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Multitenancy <code>2.2.3</code> &#8594; <code>3.0.0</code> (Group ID changed to <code>io.micronaut.multitenancy</code>)</p>
</li>
<li>
<p>Micronaut JMS (new) <code>1.0.0.M1</code></p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_dependency_upgrades_4">Dependency Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>PicoCLI <code>4.5.2</code> &#8594; <code>4.6.1</code></p>
</li>
<li>
<p>Caffeine <code>2.8.6</code> &#8594; <code>2.8.8</code></p>
</li>
<li>
<p>Netty <code>4.1.56.Final</code> &#8594; <code>4.1.58.Final</code></p>
</li>
<li>
<p>Spring <code>5.2.9.RELEASE</code> &#8594; <code>5.3.1</code></p>
</li>
<li>
<p>Spring Boot <code>2.3.4.RELEASE</code> &#8594; <code>2.4.0</code></p>
</li>
<li>
<p>GraalVM <code>20.3.0</code> &#8594; <code>21.0.0</code></p>
</li>
<li>
<p>Tomcat JDBC <code>9.0.40</code> &#8594; <code>9.0.41</code></p>
</li>
<li>
<p>Flyway <code>7.0.4</code> &#8594; <code>7.4.0</code></p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_2_3_0_breaking_changes">2.3.0 Breaking Changes</h3>
<div class="paragraph">
<p>The <code>micronaut.server.multipart.enabled</code> setting previously was not respected for the Netty server implementation. The setting is now honored and if explicitly set to false, all multipart requests will be rejected.</p>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_2_2_0">Micronaut Framework 2.2.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_2_2_0">What&#8217;s new with 2.2.0</h3>
<div class="sect3">
<h4 id="_build_features">Build Features</h4>
<div class="sect4">
<h5 id="_maven_plugin_improvements">Maven Plugin Improvements</h5>
<div class="paragraph">
<p>The Maven plugin now supports different <code>&lt;packaging&gt;</code> types:</p>
</div>
<div class="ulist">
<ul>
<li>
<p><code>jar</code> (default): produces a runnable fat JAR.</p>
</li>
<li>
<p><code>native-image</code>: generates a GraalVM native image.</p>
</li>
<li>
<p><code>docker</code>: builds a Docker image with the application artifacts (compiled classes, resources, dependencies, etc).</p>
</li>
<li>
<p><code>docker-native</code>: builds a Docker image with a GraalVM native image inside.</p>
</li>
</ul>
</div>
<div class="paragraph">
<p>To package an application, <code>mvn package</code> is the one-stop shop to produce the desired artifact.</p>
</div>
<div class="paragraph">
<p>It also supports using <code>mvn deploy</code> as the only command required to deploy an application that, depending on the <code>&lt;packaging&gt;</code>:</p>
</div>
<div class="ulist">
<ul>
<li>
<p><code>jar</code> (default): will deploy the artifact to a remote repository using <code>org.apache.maven.plugins:maven-deploy-plugin:deploy</code>.</p>
</li>
<li>
<p><code>docker</code> or <code>docker-native</code>: will push the Docker image to the configured Docker registry.</p>
</li>
</ul>
</div>
<div class="paragraph">
<p>Read more information in the <a href="https://micronaut-projects.github.io/micronaut-maven-plugin/latest">Maven Plugin documentation</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_gradle_plugin_improvements">Gradle Plugin Improvements</h5>
<div class="paragraph">
<p>The Gradle plugin has a new <code>testNativeImage</code> task that builds the GraalVM Native Image and uses the native application as an embedded server enabling the ability to write native integration tests.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_launch_enhancements">Micronaut Launch Enhancements</h4>
<div class="sect4">
<h5 id="_support_for_kotlin_gradle_builds">Support for Kotlin Gradle Builds</h5>
<div class="paragraph">
<p>It is now possible to create applications that use <code>build.gradle.kts</code> instead of <code>build.gradle</code> using the <code>--build</code> argument of the CLI:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ mn create-app demo --build gradle_kotlin &amp;&amp; cd demo
$ ./gradlew test</code></pre>
</div>
</div>
<div class="paragraph">
<p>Or via the Micronaut Launch API:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ curl https://launch.micronaut.io/demo.zip?build=gradle_kotlin -o demo.zip &amp;&amp; unzip demo.zip -d demo &amp;&amp; cd demo
$ ./gradlew test</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_push_to_github">Push to Github</h5>
<div class="paragraph">
<p>It is now possible to create an application with and <a href="https://micronaut.io/launch/">Micronaut Launch</a> and have it pushed automatically to a repository in your Github account. When generating an application just select the "Push to Github" option.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_new_micronaut_modules">New Micronaut Modules</h4>
<div class="sect4">
<h5 id="_mqtt_support">MQTT Support</h5>
<div class="paragraph">
<p>Improving the experience in IoT use cases, Micronaut now has integration with MQTT similar to the integration with Kafka and RabbitMQ. See the <a href="https://micronaut-projects.github.io/micronaut-mqtt/latest/guide/">Micronaut MQTT documentation</a> to get started.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_data_r2dbc">Micronaut Data R2DBC</h5>
<div class="paragraph">
<p>A new module that adds support for R2DBC (Reactive Database Connectivity) has been added in preview status. Micronaut Data R2DBC lets you define reactive data repositories using R2DBC that work with any of the supported drivers and include support for GraalVM Native Image.</p>
</div>
<div class="paragraph">
<p>See the <a href="https://micronaut-projects.github.io/micronaut-r2dbc/1.0.x/guide/">Documentation for Micronaut R2DBC</a> for more information.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_module_upgrades_8">Module Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Micronaut Acme <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Aws <code>2.2.3</code></p>
</li>
<li>
<p>Micronaut Azure <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Cache <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Cassandra <code>3.1.0</code></p>
</li>
<li>
<p>Micronaut Data <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut DiscoveryClient <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut ElasticSearch <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Flyway <code>3.1.0</code></p>
</li>
<li>
<p>Micronaut Gcp <code>3.3.0</code></p>
</li>
<li>
<p>Micronaut GraphQL <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Groovy <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut gRPC <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Hibernate Validator <code>3.0.0</code></p>
</li>
<li>
<p>Micronaut Jmx <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Kafka <code>3.1.0</code></p>
</li>
<li>
<p>Micronaut Kotlin <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Liquibase <code>3.0.0</code></p>
</li>
<li>
<p>Micronaut MQTT <code>1.0.0</code></p>
</li>
<li>
<p>Micronaut Micrometer <code>3.1.0</code></p>
</li>
<li>
<p>Micronaut Mongo <code>3.1.0</code></p>
</li>
<li>
<p>Micronaut NatsIo <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Neo4j <code>4.1.0</code></p>
</li>
<li>
<p>Micronaut OpenApi <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Oracle Cloud <code>1.1.0</code></p>
</li>
<li>
<p>Micronaut Picocli <code>3.1.0</code></p>
</li>
<li>
<p>Micronaut R2DBC <code>1.0.0.M2</code></p>
</li>
<li>
<p>Micronaut RabbitMQ <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Reactor <code>1.1.0</code></p>
</li>
<li>
<p>Micronaut Redis <code>3.1.0</code></p>
</li>
<li>
<p>Micronaut Rss <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Rss <code>2.3.0</code></p>
</li>
<li>
<p>Micronaut RxJava3 <code>1.1.0</code></p>
</li>
<li>
<p>Micronaut Security <code>2.1.4</code></p>
</li>
<li>
<p>Micronaut Security <code>2.2.0</code></p>
</li>
<li>
<p>Micronaut Servlet <code>2.1.1</code></p>
</li>
<li>
<p>Micronaut Sql <code>3.3.1</code></p>
</li>
<li>
<p>Micronaut Test <code>2.2.1</code></p>
</li>
<li>
<p>Micronaut Views <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Xml <code>2.1.0</code></p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_dependency_upgrades_5">Dependency Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Caffeine <code>2.8.6</code></p>
</li>
<li>
<p>Eclipse Paho v3 <code>1.2.5</code></p>
</li>
<li>
<p>Eclipse Paho v5 <code>1.2.5</code></p>
</li>
<li>
<p>Elasticsearch <code>7.9.3</code></p>
</li>
<li>
<p>Flyway <code>7.0.4</code></p>
</li>
<li>
<p>gRPC <code>1.33.1</code></p>
</li>
<li>
<p>Hibernate <code>5.4.23.Final</code></p>
</li>
<li>
<p>Kafka <code>2.6.0</code></p>
</li>
<li>
<p>Kotlin Coroutines <code>1.4.1</code></p>
</li>
<li>
<p>Ktor <code>1.4.1</code></p>
</li>
<li>
<p>Liquibase <code>4.2.0</code></p>
</li>
<li>
<p>Lombok <code>1.18.16</code></p>
</li>
<li>
<p>Oracle JDBC Driver <code>19.8.0.0</code></p>
</li>
<li>
<p>Picocli <code>4.5.2</code></p>
</li>
<li>
<p>Protobuf <code>3.14.0</code></p>
</li>
<li>
<p>Reactor <code>3.4.0</code></p>
</li>
<li>
<p>Swagger <code>2.1.5</code></p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_2_2_0_breaking_changes">2.2.0 Breaking Changes</h3>
<div class="paragraph">
<p>Kotlin suspend functions in controllers that return null now correctly respond with a 404. This behavior was inconsistent with other return types in previous versions and returned a 200 OK response.</p>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_2_1_0">Micronaut Framework 2.1.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_2_1_0">What&#8217;s new with 2.1.0</h3>
<div class="sect3">
<h4 id="_core_features_6">Core Features</h4>
<div class="sect4">
<h5 id="_introspections_for_jdk_14_records">Introspections for JDK 14 Records</h5>
<div class="paragraph">
<p>It is now possible to define <a href="#introspection">bean introspections</a> on JDK 14+ record types (note these currently require the <code>––enable–preview</code> flag to the compiler and JVM).</p>
</div>
</div>
<div class="sect4">
<h5 id="_client_kotlin">@Client + Kotlin</h5>
<div class="paragraph">
<p>@Client interfaces now support suspend methods!</p>
</div>
</div>
<div class="sect4">
<h5 id="_default_environment">Default Environment</h5>
<div class="paragraph">
<p>Micronaut 2.1 introduces the concept of a default environment. One or more default environments can be set and they will apply if no other environments are explicitly specified or deduced. See the <a href="#environments">environments documentation</a> for information on how to use this new feature.</p>
</div>
</div>
<div class="sect4">
<h5 id="_order_annotation">@Order Annotation</h5>
<div class="paragraph">
<p>The ann:core.annotation.Order[] annotation has been added to support supplying bean order for factory methods or for those who prefer the use of annotations over the api:core.order.Ordered[] interface.</p>
</div>
</div>
<div class="sect4">
<h5 id="_kotlin_1_4">Kotlin 1.4</h5>
<div class="paragraph">
<p>Micronaut now ships with Kotlin 1.4 for those users using Kotlin.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_build_features_2">Build Features</h4>
<div class="sect4">
<h5 id="_new_gradle_plugin">New Gradle Plugin</h5>
<div class="paragraph">
<p>A new Gradle plugin is available that provides a more expressive way to define a Micronaut application and includes awesome new features for GraalVM Native Image and Docker. The minimum required build to build a Micronaut application is now:</p>
</div>
<div class="listingblock">
<div class="title">Micronaut Minimal Gradle Build</div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="groovy" class="language-groovy hljs">plugins {
     id 'io.micronaut.application' version '{version}'
}
repositories {
    jcenter()
    mavenCentral()
}

micronaut {
    version = "2.1.0" // The Micronaut Version
    runtime "netty" // Using the Netty runtime
}
mainClassName = "example.Application" // Your main class</code></pre>
</div>
</div>
<div class="paragraph">
<p>Building a Native Image is then as simple as:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ ./gradlew nativeImage</code></pre>
</div>
</div>
<div class="paragraph">
<p>Whilst building a docker image using GraalVM Native Image can be done with:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ ./gradlew dockerBuildNative

# Or to push a native image to a Docker registry
$ ./gradlew dockerPushNative</code></pre>
</div>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_web_features">Web Features</h4>
<div class="sect4">
<h5 id="_client_binding_api">Client Binding API</h5>
<div class="paragraph">
<p>A new API has been created to allow for binding declarative HTTP client method arguments to an HTTP request. See the <a href="#clientParameters">documentation</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_websocket_improvements">Websocket Improvements</h5>
<div class="paragraph">
<p>Query parameters are now respected and bindable in the Micronaut websocket support.</p>
</div>
</div>
<div class="sect4">
<h5 id="_httpresponse_improvements">HttpResponse Improvements</h5>
<div class="paragraph">
<p>Cookies in HTTP responses from the client side are now retrievable on the HttpResponse. These are the cookies found in the <code>Set-Cookie</code> header.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_cloud_features_3">Cloud Features</h4>
<div class="sect4">
<h5 id="_support_for_oracle_cloud_sdk">Support for Oracle Cloud SDK</h5>
<div class="paragraph">
<p>A new GraalVM Native Image compatible <a href="https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/">module for Oracle Cloud SDK</a> has been added allowing you to use any part of the Oracle Cloud SDK with Native Image and also enhancing the SDK with RxJava 2 support.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_oracle_function">Support for Oracle Function</h5>
<div class="paragraph">
<p>Support has been added for building <a href="https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/#functions">Oracle Functions</a> deployable to Oracle Cloud including the ability to compute the functions in native images using GraalVM.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_google_pubsub">Support for Google Pub/Sub</h5>
<div class="paragraph">
<p>Thanks to <a href="https://github.com/viniciusccarvalho">Vinicius Carvalho</a> at Google, Micronaut now features dedicated support for <a href="https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#pubsub">Google Pub/Sub</a> for seamless messaging in Google Cloud.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_google_cloud_log_format">Support for Google Cloud Log Format</h5>
<div class="paragraph">
<p>Thanks to <a href="https://github.com/viniciusccarvalho">Vinicius Carvalho</a> at Google, Micronaut can now <a href="https://micronaut-projects.github.io/micronaut-gcp/latest/guide/#logging">output logs in the official JSON format</a> supported by Stackdriver on Google Cloud</p>
</div>
</div>
<div class="sect4">
<h5 id="_livenessreadiness_probes">Liveness/Readiness Probes</h5>
<div class="paragraph">
<p>Micronaut&#8217;s <code>/health</code> endpoint now allows you to distinguish liveness and readiness probes at the URIs <code>/health/liveness</code> and <code>/health/readiness</code>. Micronaut Launch&#8217;s Kubernetes support has been updated to generate a Kubenetes descriptor that is configured to with these probe endpoints by default.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_module_upgrades_9">Module Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Micronaut AWS <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Acme <code>2.0.0</code></p>
</li>
<li>
<p>Micronaut Azure <code>2.0.1</code></p>
</li>
<li>
<p>Micronaut Cache <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Cassandra <code>3.0.0</code></p>
</li>
<li>
<p>Micronaut Data <code>2.0.0</code></p>
</li>
<li>
<p>Micronaut Elasticsearch <code>2.0.1</code></p>
</li>
<li>
<p>Micronaut Flyway <code>2.1.1</code></p>
</li>
<li>
<p>Micronaut GCP <code>3.2.1</code></p>
</li>
<li>
<p>Micronaut GraphQL <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Groovy <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut gRPC <code>2.0.5</code></p>
</li>
<li>
<p>Micronaut Ignite <code>1.0.0.RC1</code></p>
</li>
<li>
<p>Micronaut Kafka <code>3.0.0</code></p>
</li>
<li>
<p>Micronaut Kotlin <code>2.1.1</code></p>
</li>
<li>
<p>Micronaut Liquibase <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Micrometer <code>3.0.1</code></p>
</li>
<li>
<p>Micronaut Mongo <code>DB 3.0.0</code></p>
</li>
<li>
<p>Micronaut Neo4j <code>4.0.0</code></p>
</li>
<li>
<p>Micronaut Open <code>API 2.1.0</code></p>
</li>
<li>
<p>Micronaut Oracle <code>Cloud 1.0.0</code></p>
</li>
<li>
<p>Micronaut Picocli <code>3.0.0</code></p>
</li>
<li>
<p>Micronaut RabbitMQ <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Redis <code>3.0.0</code></p>
</li>
<li>
<p>Micronaut Security <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Servlet <code>2.0.0</code></p>
</li>
<li>
<p>Micronaut Sql <code>3.1.0</code></p>
</li>
<li>
<p>Micronaut Test <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Xml <code>2.0.0</code></p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_dependency_upgrades_6">Dependency Upgrades</h3>
<div class="ulist">
<ul>
<li>
<p>Commons Dbcp <code>2.8.0</code></p>
</li>
<li>
<p>Dekorate <code>1.0.3</code></p>
</li>
<li>
<p>Elasticsearch <code>7.8.1</code></p>
</li>
<li>
<p>Flyway <code>6.5.4</code></p>
</li>
<li>
<p>gRPC <code>1.32.1</code></p>
</li>
<li>
<p>Hibernate <code>5.4.21.Final</code></p>
</li>
<li>
<p>Ignite <code>2.8.1</code></p>
</li>
<li>
<p>JUnit <code>5.7.0</code></p>
</li>
<li>
<p>Kotlin <code>1.4.10</code></p>
</li>
<li>
<p>Ktor <code>1.4.0</code></p>
</li>
<li>
<p>Liquibase <code>3.10.2</code></p>
</li>
<li>
<p>MSSQL Driver <code>8.4.1.jre8</code></p>
</li>
<li>
<p>MariaDB Driver <code>2.6.2</code></p>
</li>
<li>
<p>Micrometer <code>1.5.5</code></p>
</li>
<li>
<p>Mongo Driver <code>4.1.0</code></p>
</li>
<li>
<p>Mongo Reactive Driver <code>4.1.0</code></p>
</li>
<li>
<p>Neo4j Driver <code>4.1.1</code></p>
</li>
<li>
<p>Netty <code>4.1.52.Final</code></p>
</li>
<li>
<p>Picocli <code>4.5.1</code></p>
</li>
<li>
<p>Postgres Driver <code>42.2.16</code></p>
</li>
<li>
<p>Redis Lettuce <code>5.3.4.RELEASE</code></p>
</li>
<li>
<p>Tomcat Jdbc <code>9.0.38</code></p>
</li>
</ul>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_2_0_0">Micronaut Framework 2.0.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_2_0_0">What&#8217;s new with 2.0.0</h3>
<div class="sect3">
<h4 id="_core_features_7">Core Features</h4>
<div class="sect4">
<h5 id="_support_for_jdk_14">Support for JDK 14</h5>
<div class="paragraph">
<p>Micronaut has been updated to support JDK 14.</p>
</div>
</div>
<div class="sect4">
<h5 id="_groovy_3">Groovy 3</h5>
<div class="paragraph">
<p>Micronaut now supports applications written in Groovy 3.</p>
</div>
</div>
<div class="sect4">
<h5 id="_startup_performance_improvements">Startup Performance Improvements</h5>
<div class="paragraph">
<p>Startup time has been further improved in this release with typical startup time for a new application around 20% faster.</p>
</div>
</div>
<div class="sect4">
<h5 id="_improvements_to_bean_introspections">Improvements to Bean Introspections</h5>
<div class="paragraph">
<p>Bean introspections have been improved to support static creator methods, interfaces and enums. This means you can define a bean introspection on an interface with a private implementation such as:</p>
</div>
<div class="listingblock">
<div class="title">Introspections on interfaces</div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">import io.micronaut.core.annotation.Creator;

@io.micronaut.core.annotation.Introspected
interface Example {
    String getName();

    @Creator
    static Example create(String name) {
        return () -&gt; name;
    }
}</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_analyzing_the_injection_point">Support for Analyzing the Injection Point</h5>
<div class="paragraph">
<p>Micronaut&#8217;s Dependency Injection implementation has been improved such that you can now receive an api:inject.InjectionPoint[] instance to any ann:context.annotation.Factory[] method. This makes it possible to customize how the bean is created based on the annotation metadata at the point at which the bean is injected.</p>
</div>
<div class="paragraph">
<p>For example consider the following definition:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">@Inject @Client("http://foo.com") RxHttpClient client;</code></pre>
</div>
</div>
<div class="paragraph">
<p>A factory method can receive the injection point and create a client based off of the value:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">@Bean
protected DefaultHttpClient httpClient(InjectionPoint&lt;?&gt; injectionPoint) {
    String url = metadata.stringValue(Client.class).orElse(null);
    if (url != null) {
        ......
        URL parsedUrl = new URL(url) //handle exception
        return new DefaultHttpClient(parsedUrl);
    } else {
        return new DefaultHttpClient();
    }
}</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_eager_initialization_of_beans">Support for Eager Initialization of Beans</h5>
<div class="paragraph">
<p>Eager initialization of beans is useful in certain cases, such as on AWS Lambda where more CPU resources are assigned to Lamdba construction than execution. Therefore as for Micronaut 2.0, you can specify whether you want to eager initialization configuration or all singletons using the api:context.ApplicationContextBuilder[] interface:</p>
</div>
<div class="listingblock">
<div class="title">Enabling Eager Initialization</div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">public class Application {

    public static void main(String[] args) {
        Micronaut.build(args)
            .eagerInitSingletons(true) // <b class="conum">(1)</b>
            .mainClass(Application.class)
            .start();
    }
}</code></pre>
</div>
</div>
<div class="colist arabic">
<ol>
<li>
<p>Setting eager init to true initializes all singletons</p>
</li>
</ol>
</div>
<div class="paragraph">
<p>It is also possible to just eager init configuration using <code>eagerInitConfiguration</code> which will initialize all ann:context.annotation.ConfigurationProperties[] beans.</p>
</div>
</div>
<div class="sect4">
<h5 id="_spot_bugs_instead_of_jsr_305_nullablenonnull_annotations">Spot Bugs Instead of JSR-305 Nullable/NonNull Annotations</h5>
<div class="paragraph">
<p>In Micronaut 1.x the Google distributed JSR-305 annotations library (<code>com.google.code.findbugs:jsr305</code>) was used to specify <code>@Nullable</code> and <code>@NonNull</code> on interfaces of the Micronaut API using the annotations contained within the <code>javax.annotation</code> package.</p>
</div>
<div class="paragraph">
<p>Due to the fact that JSR-305 has been cancelled and that this dependency has potential licensing issues (by using the <code>javax</code> namespace) as well as problems with the cross packages on Java 9+ with the module system Micronaut 2.x switches to the <code>spotbugs-annotations</code> module provided by the <a href="https://spotbugs.github.io/">SpotBugs project</a>.</p>
</div>
<div class="paragraph">
<p>It is recommended users of Micronaut use this API instead (although the <code>javax.annotation.Nullable</code> and <code>javax.annotation.NotNull</code> annotations continue to be supported).</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_cli_features">CLI Features</h4>
<div class="sect4">
<h5 id="_new_native_cli">New Native CLI</h5>
<div class="paragraph">
<p>Micronaut&#8217;s <code>mn</code> command for the CLI has been rewritten in Micronaut itself and is now compiled into a native image <a href="https://github.com/micronaut-projects/micronaut-starter/releases/tag/v{version}">available on Linux, MacOS X and Windows</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_launch">Micronaut Launch</h5>
<div class="paragraph">
<p>Create Micronaut 2.0 applications without having the CLI installed using <code>curl</code>:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ curl https://launch.micronaut.io/demo.zip -o demo.zip
$ unzip demo.zip -d demo</code></pre>
</div>
</div>
<div class="paragraph">
<p>Or by visiting <a href="https://launch.micronaut.io" class="bare">https://launch.micronaut.io</a> in your browser.</p>
</div>
<div class="paragraph">
<p>Run <code>curl <a href="https://launch.micronaut.io" class="bare">https://launch.micronaut.io</a></code> for more instructions on how to use the API or visit the <a href="https://launch.micronaut.io/swagger/views/swagger-ui/index.html">OpenAPI documentation</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_diff_command">Diff Command</h5>
<div class="paragraph">
<p>Run <code>mn feature-diff --features=[FEATURE NAME]</code> from the root of another Micronaut project to create a diff of the changes that need to be applied to enable the feature. For example:</p>
</div>
<div class="listingblock">
<div class="title">Using <code>feature-diff</code></div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ mn feature-diff --features=azure-function
--- micronaut-cli.yml
+++ micronaut-cli.yml
@@ -3,4 +3,4 @@
 testFramework: junit
 sourceLanguage: java
 buildTool: gradle
-features: [app-name, application, gradle, http-client, java, junit, logback, netty-server, shade, yaml]
+features: [app-name, application, azure-function, azure-function-http, gradle, java, junit, logback, yaml]


--- host.json
+++ host.json
@@ -1,0 +1,7 @@
+{
+  "version": "2.0",
+  "extensionBundle": {
+    "id": "Microsoft.Azure.Functions.ExtensionBundle",
+    "version": "[1.*, 2.0.0)"
+  }
+}</code></pre>
</div>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_graalvm_improvements">GraalVM Improvements</h4>
<div class="paragraph">
<p>Micronaut&#8217;s support for GraalVM Native Image has been moved out of experimental status, which solidifies our commitment to continue improving support for native images.</p>
</div>
<div class="sect4">
<h5 id="_automatic_static_resource_detection_for_native_image">Automatic Static Resource Detection for Native Image</h5>
<div class="paragraph">
<p>It is not longer necessary to configure static resources for your Native Image builds. The <code>micronaut-graal</code> annotation processor will automatically do this for you for all resources found in <code>src/main/resources</code>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_improved_support_for_jdbc_hibernate_in_native_image">Improved support for JDBC / Hibernate in Native Image</h5>
<div class="paragraph">
<p>It is no longer necessary to provide additional GraalVM related configuration to connect to databases via JDBC or Hibernate/JPA. Micronaut includes automatic support for the following drivers with GraalVM Native Image:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Oracle</p>
</li>
<li>
<p>MariaDB</p>
</li>
<li>
<p>Postgres</p>
</li>
<li>
<p>MS SQL</p>
</li>
<li>
<p>H2</p>
</li>
<li>
<p>MySQL</p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_flyway_migrations_in_native_image">Support for Flyway Migrations in Native Image</h5>
<div class="paragraph">
<p>The Micronaut Flyway module has been <a href="https://micronaut-projects.github.io/micronaut-flyway/2.0.x/guide/index.html#graalvm">updated with GraalVM Native Image support</a> so you can now run database migrations in Native Image.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_native_image_in_aws_sdk_v2">Support for Native Image in AWS SDK v2</h5>
<div class="paragraph">
<p>Version 2.0 of the Micronaut AWS module <a href="https://micronaut-projects.github.io/micronaut-aws/2.0.x/guide/index.html#sdkv2">includes support for Native Image</a> for the majority of the v2 AWS APIs including S3, Dynamo DB, SES, SNS, and SQS which will be helpful for those developing native AWS Lambda functions with Micronaut + GraalVM.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_jooq_in_native_image">Support for jOOQ in Native Image</h5>
<div class="paragraph">
<p>The Micronaut jOOQ module <a href="https://micronaut-projects.github.io/micronaut-sql/latest/guide/index.html#_graalvm_native_image">includes support for Native Image</a> and it&#8217;s possible to use it with <a href="https://simpleflatmapper.org/">SimpleFlatMapper</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_redis_in_native_image">Support for Redis in Native Image</h5>
<div class="paragraph">
<p>The Micronaut Redis module <a href="https://micronaut-projects.github.io/micronaut-redis/latest/guide/index.html#graalvm">includes support for Native Image</a>. There are still some pending uses cases that won&#8217;t work because of how Lettuce driver works. Make sure you read the documentation.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_elasticsearch_in_native_image">Support for Elasticsearch in Native Image</h5>
<div class="paragraph">
<p>The Micronaut Elasticsearch module <a href="https://micronaut-projects.github.io/micronaut-elasticsearch/latest/guide/index.html#graalvm">includes support for Native Image</a></p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_build_improvements">Build Improvements</h4>
<div class="sect4">
<h5 id="_new_maven_parent_pom">New Maven Parent POM</h5>
<div class="paragraph">
<p>Micronaut now provides a new parent POM that can be used in Maven projects to get setup quickly:</p>
</div>
<div class="listingblock">
<div class="title">Using the Maven Parent POM</div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="xml" class="language-xml hljs">&lt;parent&gt;
    &lt;groupId&gt;io.micronaut&lt;/groupId&gt;
    &lt;artifactId&gt;micronaut-parent&lt;/artifactId&gt;
    &lt;version&gt;${micronaut.version}&lt;/version&gt;
&lt;/parent&gt;</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_new_maven_plugin">New Maven Plugin</h5>
<div class="paragraph">
<p>The parent POM mentioned above includes a new Micronaut Maven Plugin that enables automatic application restart during development. Just run the following:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ ./mvnw mn:run</code></pre>
</div>
</div>
<div class="paragraph">
<p>Whenever you make a change to a class file the server will restart automatically.</p>
</div>
</div>
<div class="sect4">
<h5 id="_gradle_6_5_update">Gradle 6.5 Update</h5>
<div class="paragraph">
<p>For Gradle users who create new applications Gradle 6.5 is used which is compatible with JDK 14.</p>
</div>
</div>
<div class="sect4">
<h5 id="_better_gradle_incremental_annotation_processing_support">Better Gradle Incremental Annotation Processing Support</h5>
<div class="paragraph">
<p>Gradle builds with Micronaut 2 for both Java and Kotlin should be significantly faster thanks to improved support for <a href="https://docs.gradle.org/current/userguide/java_plugin.html#sec:incremental_annotation_processing">Gradle incremental annotation processing</a>.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_http_features_4">HTTP Features</h4>
<div class="sect4">
<h5 id="_support_for_http2">Support for HTTP/2</h5>
<div class="paragraph">
<p>Micronaut&#8217;s Netty-based HTTP client and server have been updated to support HTTP/2.</p>
</div>
<div class="paragraph">
<p>See the <a href="#http2Server">HTTP/2 documentation</a> for more information on how to enable support for HTTP/2.</p>
</div>
</div>
<div class="sect4">
<h5 id="_threading_model_and_event_loop_group_improvements">Threading Model and Event Loop Group Improvements</h5>
<div class="paragraph">
<p>Micronaut 2.0 uses a new shared default Netty <code>EventLoopGroup</code> for server worker threads and client request threads. This reduces context switching and improves resource utilization.</p>
</div>
<div class="paragraph">
<p>See the <a href="#clientConfiguration">HTTP Client Configuration</a> section for information on how to configure the default <code>EventLoopGroup</code> and add additional `EventLoopGroup&#8217;s that are configured per client.</p>
</div>
<div class="paragraph">
<p>In addition, as of Micronaut 2.0 all operations are by default executed on the <code>EventLoop</code> and users can optionally use the new ann:scheduling.annotation.ExecuteOn[] annotation to specify a named executor to execute an operation on if required (for example to offload blocking operations such as interactions with JPA/JDBC to a specific thread pool).</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_requestbean">Support for <code>@RequestBean</code></h5>
<div class="paragraph">
<p>It is now possible to bind the properties of a POJO argument to a <code>@Controller</code> to request parameters, headers and so on using the ann:http.annotation.RequestBean[] annotation.</p>
</div>
<div class="paragraph">
<p>Thanks to Github user <a href="https://github.com/asodja">asodja</a> for this contribution.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_servlet">Micronaut Servlet</h5>
<div class="paragraph">
<p>Micronaut now includes support for creating <a href="https://github.com/micronaut-projects/micronaut-servlet">Servlet applications</a> and users can use the command line to create an application that targets popular Servlet containers:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ mn create-app myapp --features jetty-server    # for Jetty
$ mn create-app myapp --features tomcat-server   # for Tomcat
$ mn create-app myapp --features undertow-server # for Undertow</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_improved_support_for_server_side_content_negotiation">Improved Support for Server-Side Content Negotiation</h5>
<div class="paragraph">
<p>Micronaut will now correctly handle the HTTP <code>Accept</code> header and pick the most appropriate route for the specified accepted media types using <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation">Server-Side Content Negotiation</a>.</p>
</div>
<div class="admonitionblock note">
<table>
<tr>
<td class="icon">
<div class="title">Note</div>
</td>
<td class="content">
This also applies to <code>@Error</code> routes making it possible to send different error responses for different content types
</td>
</tr>
</table>
</div>
<div class="admonitionblock tip">
<table>
<tr>
<td class="icon">
<div class="title">Tip</div>
</td>
<td class="content">
To add XML support use the <a href="https://github.com/micronaut-projects/micronaut-jackson-xml">Jackson XML</a> module
</td>
</tr>
</table>
</div>
</div>
<div class="sect4">
<h5 id="_improved_support_for_cloud_foundry">Improved Support for Cloud Foundry</h5>
<div class="paragraph">
<p>Micronaut will now process the <code>VCAP_APPLICATION</code> and <code>VCAP_SERVICES</code> environment variables and treat them as property sources.</p>
</div>
<div class="paragraph">
<p>Thanks to <a href="https://github.com/fnonnenmacher">Fabian Nonnenmacher</a> for this contribution.</p>
</div>
</div>
<div class="sect4">
<h5 id="_http_client_improvements">HTTP Client Improvements</h5>
<div class="paragraph">
<p>It is no longer necessary to use <code>@Client(..)</code> to inject a default api:http.client.RxHttpClient[] instance. You can now inject the default client simply with:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">@Inject RxHttpClient client;</code></pre>
</div>
</div>
<div class="paragraph">
<p>If no host is provided at the time of a request, a api:http.client.exceptions.NoHostException[] will be thrown.</p>
</div>
</div>
<div class="sect4">
<h5 id="_api_for_proxying_requests">API for Proxying Requests</h5>
<div class="paragraph">
<p>A new API for writing API gateways and proxying requests has been added. See the documentation on the <a href="#proxyClient">ProxyHttpClient</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_endpoint_sensitivity">Endpoint Sensitivity</h5>
<div class="paragraph">
<p>It is now possible to control the sensitivity of individual endpoint methods. The ann:io.micronaut.management.endpoint.annotation.Sensitive[] annotation can be applied to endpoint methods to allow for some methods to have a different sensitivity than the value supplied to the endpoint annotation.</p>
</div>
</div>
<div class="sect4">
<h5 id="_improvements_to_instrumentation">Improvements to Instrumentation</h5>
<div class="paragraph">
<p>The Instrumentation mechanism for RxJava 2 has been improved to address issues with MDC and reduce the size of reactive stack traces. Thanks to <a href="https://github.com/dstepanov">Denis Stepanov</a> and <a href="https://github.com/lgathy">Lajos Gathy</a> for their contributions in this area.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_kotlin_improvements">Kotlin Improvements</h4>
<div class="sect4">
<h5 id="_support_for_ktor_in_micronaut_launch">Support for KTOR in Micronaut Launch</h5>
<div class="paragraph">
<p>You can generate a Micronaut + <a href="https://ktor.io/">Ktor</a> application from <a href="https://micronaut.io/launch/">Micronaut Launch</a> or via the command line.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_kotlin_extensions">Micronaut Kotlin Extensions</h5>
<div class="paragraph">
<p>New <a href="https://micronaut-projects.github.io/micronaut-kotlin/1.0.x/guide/#extensionFunctions">Kotlin Extension Functions</a> are available that make the Kotlin + Micronaut experience that little bit better.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_serverless_improvements">Serverless Improvements</h4>
<div class="sect4">
<h5 id="_support_for_google_cloud_function">Support for Google Cloud Function</h5>
<div class="paragraph">
<p>You can now write Serverless functions that target Google Cloud Function using Micronaut. See the <a href="https://micronaut-projects.github.io/micronaut-gcp/2.0.x/guide/">Micronaut GCP</a> documentation and <a href="https://github.com/micronaut-projects/micronaut-gcp/tree/master/examples/hello-world-cloud-function">example application</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_microsoft_azure_function">Support for Microsoft Azure Function</h5>
<div class="paragraph">
<p>You can now write Serverless functions that target Microsoft Azure using Micronaut. See the <a href="https://micronaut-projects.github.io/micronaut-azure/1.0.x/guide/">Micronaut Azure</a> documentation and <a href="https://github.com/micronaut-projects/micronaut-azure/tree/master/examples/azure-functions-example">example application</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_improvements_to_micronaut_aws">Improvements to Micronaut AWS</h5>
<div class="paragraph">
<p><a href="https://micronaut-projects.github.io/micronaut-aws/2.0.x/guide/#whatsNew">Micronaut AWS 2.0.0</a> includes a number of improvements to support for AWS Lambda and AWS in general including new client modules for AWS SDK 2.0, cold start improvements on Lambda and improvements to the support for Amazon Alexa.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_module_improvements">Module Improvements</h4>
<div class="paragraph">
<p>Micronaut is more modular than ever, with several components now available in separate modules and upgrades to those modules.</p>
</div>
<div class="sect4">
<h5 id="_micronaut_cache_2_0_0_upgrade">Micronaut Cache 2.0.0 Upgrade</h5>
<div class="paragraph">
<p>Caching has been moved into a separate module and out of <code>micronaut-runtime</code>. If you need caching (including the annotations within <code>io.micronaut.cache.annotation</code>) you just need to add the individual module for the cache provider you are interested (for example Caffeine, Redis, Hazelcast etc.).</p>
</div>
<div class="paragraph">
<p>See the documentation for the <a href="https://micronaut-projects.github.io/micronaut-cache/2.0.x/guide/">Cache module</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_sql_2_3_0_upgrade">Micronaut SQL 2.3.0 Upgrade</h5>
<div class="paragraph">
<p>Micronaut SQL has been improved to default to Micronaut transaction management (making Spring management optional) and includes <a href="https://micronaut-projects.github.io/micronaut-sql/2.3.x/guide/#jdbi">support for Jdbi</a> (Thanks to <a href="https://github.com/drmaas">Dan Maas</a> for this contribution).</p>
</div>
<div class="paragraph">
<p>In addition, support has been added for <a href="https://micronaut-projects.github.io/micronaut-sql/2.3.x/guide/#jdbc">Oracle Universal Connection Pool</a>. Thanks to <a href="https://github.com/recursivecodes">Todd Sharp</a> for this contribution.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_security_2_0_0_upgrade">Micronaut Security 2.0.0 Upgrade</h5>
<div class="paragraph">
<p>The security module has seen many changes to improve the API and introduce new features to support a wider array of use cases.</p>
</div>
<div class="paragraph">
<p>See the <a href="https://micronaut-projects.github.io/micronaut-security/2.0.x/guide">Security module</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_new_reactive_modules">New Reactive Modules</h5>
<div class="paragraph">
<p>Whilst RxJava 2 remains the default, individual modules for other reactive libraries have been added.</p>
</div>
<div class="paragraph">
<p>For RxJava 3:</p>
</div>
<div class="paragraph">
<p>dependency:io.micronaut.rxjava3:micronaut-rxjava3[]</p>
</div>
<div class="paragraph">
<p>For Reactor:</p>
</div>
<div class="paragraph">
<p>dependency:io.micronaut.reactor:micronaut-reactor[]</p>
</div>
<div class="paragraph">
<p>And legacy support for RxJava 1:</p>
</div>
<div class="paragraph">
<p>dependency:io.micronaut.rxjava1:micronaut-rxjava1[]</p>
</div>
<div class="paragraph">
<p>Included within the new RxJava 3 and Reactor modules are variants of api:http.client.RxHttpClient[] called <code>Rx3HttpClient</code> and <code>ReactorHttpClient</code> respectively.</p>
</div>
<div class="paragraph">
<p>To use the RxJava 3 HTTP client add the following dependency:</p>
</div>
<div class="paragraph">
<p>dependency:io.micronaut.rxjava3:micronaut-rxjava3-http-client[]</p>
</div>
<div class="paragraph">
<p>To use the Reactor HTTP client add:</p>
</div>
<div class="paragraph">
<p>dependency:io.micronaut.rxjava3:micronaut-reactor-http-client[]</p>
</div>
</div>
<div class="sect4">
<h5 id="_new_micronaut_nats_module">New Micronaut NATS module</h5>
<div class="paragraph">
<p>A new messaging module for <a href="https://nats.io">Nats.io</a> has been included in Micronaut core.</p>
</div>
<div class="paragraph">
<p>See the documentation for <a href="https://micronaut-projects.github.io/micronaut-nats/latest/guide/">Micronaut Nats</a> for more information.</p>
</div>
<div class="paragraph">
<p>Thanks to <a href="https://github.com/grimmjo">Joachim Grimm</a> for this contribution.</p>
</div>
</div>
<div class="sect4">
<h5 id="_module_upgrades_10">Module Upgrades</h5>
<div class="ulist">
<ul>
<li>
<p>Micronaut AWS - <code>1.3.9</code> &#8594; <code>2.0.0.RC1</code></p>
</li>
<li>
<p>Micronaut Cache - <code>1.2.0</code> &#8594; <code>2.0.0.RC1</code></p>
</li>
<li>
<p>Micronaut Data - <code>1.0.2</code> &#8594; <code>1.1.0.RC2</code></p>
</li>
<li>
<p>Micronaut GCP - <code>1.1.0</code> &#8594; <code>2.0.0.RC2</code></p>
</li>
<li>
<p>Micronaut gRPC - <code>1.1.1</code> &#8594; <code>2.0.0.RC1</code></p>
</li>
<li>
<p>Micronaut Micrometer - <code>1.3.1</code> &#8594; <code>2.0.0.RC2</code></p>
</li>
<li>
<p>Micronaut Mongo - <code>1.3.0</code> &#8594; <code>2.1.0</code></p>
</li>
<li>
<p>Micronaut Neo4j - <code>1.3.0</code> &#8594; <code>3.0.0.RC1</code></p>
</li>
<li>
<p>Micronaut SQL - <code>1.3.0</code> &#8594; <code>2.3.0</code></p>
</li>
<li>
<p>Micronaut Security - <code>1.4.0</code> &#8594; <code>2.0.0.RC1</code></p>
</li>
<li>
<p>Micronaut Spring - <code>1.0.2</code> &#8594; <code>2.0.1</code></p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_dependency_upgrades_7">Dependency Upgrades</h5>
<div class="ulist">
<ul>
<li>
<p>Hibernate <code>5.4.10.Final</code> &#8594; <code>5.4.16.Final</code></p>
</li>
<li>
<p>Groovy <code>2.5.8</code> &#8594; <code>3.0.3</code></p>
</li>
<li>
<p>Mongo Reactive Streams <code>1.13.0</code> &#8594; <code>4.0.2</code></p>
</li>
<li>
<p>Mongo Java Driver <code>3.12.0</code> &#8594; <code>4.0.2</code></p>
</li>
<li>
<p>Jaeger <code>1.0.0</code> &#8594; <code>1.2.0</code></p>
</li>
<li>
<p>Jackson <code>2.10.3</code> &#8594; <code>2.11.0</code></p>
</li>
</ul>
</div>
</div>
</div>
</div>
</div>
</div>
