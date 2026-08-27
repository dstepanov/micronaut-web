---
slug: 2018/10/23/micronaut-framework-1-upgrade-reference
title: Micronaut Framework 1 Upgrade Reference
description: Historical upgrade notes, new features, and breaking changes for Micronaut Framework 1.x.
date: "2018-10-23T00:00:00"
sourceUrl: https://micronaut-projects.github.io/micronaut-upgrade/snapshot/
contentSource: micronaut-upgrade
category: upgrade
categories:
  - upgrade
tags:
  - upgrade
  - micronaut1
href: /2018/10/23/micronaut-framework-1-upgrade-reference/
---

<p>These historical upgrade notes were migrated from the <a href="https://micronaut-projects.github.io/micronaut-upgrade/snapshot/">Micronaut Upgrade Guide archive</a>.</p>

<div class="sect1">
<h2 id="_micronaut_framework_1_3_0">Micronaut Framework 1.3.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_1_3_0_breaking_changes">1.3.0 Breaking Changes</h3>
<div class="paragraph">
<p>The following changes could potentially be considered to be breaking changes, however the likelihood of any negative impact is low.</p>
</div>
<div class="ulist">
<ul>
<li>
<p>The order of the configuration files provided by <code>MICRONAUT_CONFIG_FILES</code> or <code>micronaut.config.files</code> was overriding system properties and environment variables. The files are now ordered between the environment and configuration files which means they will no longer override environment variables or system properties. In addition which file within the list had priority was non deterministic. Later files now have precedence over earlier files in the list.</p>
</li>
<li>
<p>Routes that are binding to a body type that is a String, byte[], or ByteBuffer will no longer be decoded and the raw body will be bound directly to the argument. Because decoding is no longer happening, if a body is sent that is considered invalid according to the content type of the request, it will be bound to the body argument anyway. This is different than previous behavior where an exception would be thrown if the body was invalid.</p>
</li>
<li>
<p>Concrete types are now preferred when creating a class hierarchy. The most common case where this will have an impact is converters. Converters that match super classes of the target type will be preferred over converters that match an interface that the target type implements.</p>
</li>
</ul>
</div>
</div>
<div class="sect2">
<h3 id="_whats_new_with_1_3_0">What&#8217;s new with 1.3.0</h3>
<div class="sect3">
<h4 id="_support_for_graalvm_20_0_0">Support for GraalVM 20.0.0</h4>
<div class="paragraph">
<p>Micronaut supports creating native-images using GraalVM 20.0.0 for both JDK 8 and JDK 11.</p>
</div>
</div>
<div class="sect3">
<h4 id="_startup_and_memory_usage_optimizations">Startup and Memory Usage Optimizations</h4>
<div class="paragraph">
<p>Startup performance and memory usage (20%) have been improved.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_data_integration">Micronaut Data Integration</h4>
<div class="paragraph">
<p>Micronaut Data has been added to the <code>micronaut-bom</code> and you can now use the CLI to create Micronaut Data projects:</p>
</div>
<div class="listingblock">
<div class="title">Setting up Micronaut Data JPA</div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs"># add --build maven for maven
$ mn create-app myapp --features data-hibernate-jpa</code></pre>
</div>
</div>
<div class="listingblock">
<div class="title">Setting up Micronaut Data JDBC</div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs"># add --build maven for maven
$ mn create-app myapp --features data-jdbc</code></pre>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_initial_support_for_kotlin_coroutines_and_flow">Initial Support for Kotlin Coroutines and Flow</h4>
<div class="paragraph">
<p>Initial support for Kotlin Coroutines and the <code>Flow</code> type has been added when used as the return type of controller methods.</p>
</div>
<div class="paragraph">
<p>Thanks to <a href="https://github.com/konrad-kaminski">Konrad Kamiński</a> for this contribution.</p>
</div>
</div>
<div class="sect3">
<h4 id="_immutable_configurationproperties_and_eachproperty">Immutable <code>@ConfigurationProperties</code> and <code>@EachProperty</code></h4>
<div class="paragraph">
<p>Support for immutable ann:context.annotation.ConfigurationProperties[] has been added by annotating the constructor of any configuration class with ann:context.annotation.ConfigurationInject[]. See the documentation on <a href="#immutableConfig">Immutable Configuration</a> for more information.</p>
</div>
<div class="paragraph">
<p>snippet::io.micronaut.docs.config.itfce.EngineConfig[tags="imports,class",indent=0,title="@ConfigurationProperties Example"]</p>
</div>
<div class="colist arabic">
<ol>
<li>
<p>The ann:context.annotation.ConfigurationProperties[] annotation takes the configuration prefix and is declared on an interface</p>
</li>
<li>
<p>You can use ann:core.bind.annotation.Bindable[] to set a default value if you want</p>
</li>
<li>
<p>Validation annotations can be used too</p>
</li>
<li>
<p>You can also specify references to other ann:context.annotation.ConfigurationProperties[] beans.</p>
</li>
<li>
<p>You can nest immutable configuration</p>
</li>
<li>
<p>Optional configuration can be indicated by returning an <code>Optional</code> or specifying <code>@Nullable</code></p>
</li>
</ol>
</div>
</div>
<div class="sect3">
<h4 id="_ability_to_configure_log_levels_via_properties">Ability to Configure Log Levels via Properties</h4>
<div class="paragraph">
<p>Log levels can now be configured via properties defined in <code>application.yml</code> (and environment variables) with the <code>log.level</code> prefix:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="yaml" class="language-yaml hljs">logger:
    levels:
        foo.bar: ERROR</code></pre>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_new_micronaut_cache_modules">New Micronaut Cache Modules</h4>
<div class="paragraph">
<p><a href="https://micronaut-projects.github.io/micronaut-cache/1.0.x/guide/#introduction">Micronaut Cache</a> has been updated to support <a href="https://micronaut-projects.github.io/micronaut-cache/1.0.x/guide/#hazelcast">Hazelcast</a> and <a href="https://micronaut-projects.github.io/micronaut-cache/1.0.x/guide/#ehcache">Ehcache</a> as additional Cache providers.</p>
</div>
</div>
<div class="sect3">
<h4 id="_new_micronaut_jackson_xml_module">New Micronaut Jackson XML Module</h4>
<div class="paragraph">
<p>Support for parsing and serializing to XML has been added with a new <a href="https://github.com/micronaut-projects/micronaut-jackson-xml">Jackson XML module</a>.</p>
</div>
<div class="paragraph">
<p>dependency:micronaut-jackson-xml[groupId="io.micronaut.xml"]</p>
</div>
<div class="paragraph">
<p>Thanks to <a href="https://github.com/svishnyakoff">Sergey</a> for this contribution.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_openapi_swagger_1_3_update">Micronaut OpenAPI (Swagger) 1.3 Update</h4>
<div class="paragraph">
<p>Micronaut OpenAPI has been updated with loads of improvements including the ability to <a href="https://micronaut-projects.github.io/micronaut-openapi/1.3.x/guide/index.html#openApiViews">automatically generate UIs for Swagger output</a> as part of your application. Thanks to <a href="https://github.com/croudet">croudet</a> for this awesome contribution.</p>
</div>
<div class="paragraph">
<p>The module is also no longer regarded as experimental.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_views_1_3_update">Micronaut Views 1.3 Update</h4>
<div class="paragraph">
<p>Micronaut Views has been updated to and now features a new <a href="https://micronaut-projects.github.io/micronaut-views/1.3.x/guide/#soy">view renderer for Soy (Closure Templates)</a>. Thanks to <a href="https://github.com/sgammon">Sam Gammon</a> for this contribution.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_sql_1_3_update">Micronaut SQL 1.3 Update</h4>
<div class="paragraph">
<p>Micronaut SQL includes the latest versions of Hibernate and adds support for the Vert.x MySQL and Postgres Clients. Thank you to <a href="https://github.com/shenzhou-6">shenzhou-6</a> for this contribution.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_micrometer_1_3_update">Micronaut Micrometer 1.3 Update</h4>
<div class="paragraph">
<p>Micronaut Micrometer has been updated to support Micrometer 1.3.1.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_kafka_1_4_update">Micronaut Kafka 1.4 Update</h4>
<div class="paragraph">
<p>Micronaut Kafka 1.4 has been updated to support Kafka 2.4.0</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_neo4j_1_3_update">Micronaut Neo4j 1.3 Update</h4>
<div class="paragraph">
<p>Micronaut Neo4j 1.3 has been updated to support Neo4j Java Driver 1.7.5. In additional a new <code>2.0.0</code> version is available that supports Neo4j Java Driver 4.x line which is the latest version (in order to maintain semantic versioning the default is still 1.3 since the latest version includes changes to package names). See the <a href="https://micronaut-projects.github.io/micronaut-neo4j/latest/guide/">Micronaut Neo4j Documentation</a> for more information.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_grpc_1_1_update">Micronaut GRPC 1.1 Update</h4>
<div class="paragraph">
<p>Micronaut GRPC has been updated to the latest versions of GRPC and Protobuf.</p>
</div>
</div>
<div class="sect3">
<h4 id="_requires_os">@Requires OS</h4>
<div class="paragraph">
<p>The ann:context.annotation.Requires[] annotation now has support for disabling beans based on the current operating system.</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">@Requires(os=Family.LINUX)</code></pre>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_basic_auth_binding_support">Basic Auth binding support</h4>
<div class="paragraph">
<p>In the client and server, an argument of type api:http.BasicAuth[] can be used to generate or parse a basic authorization header.</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">@Post("/login")
String login(BasicAuth basicAuth) {
    ...
}</code></pre>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_request_certificate">Request Certificate</h4>
<div class="paragraph">
<p>For SSL requests, the certificate is now available as a request attribute. See api:http.HttpRequest#getCertificate--[HttpRequest#getCertificate]</p>
</div>
</div>
<div class="sect3">
<h4 id="_client_filter_matching_by_annotation">Client Filter Matching By Annotation</h4>
<div class="paragraph">
<p>Micronaut HTTP clients and client filters can now be matched by the presence of an annotation. Previously only URL matching was supported. See <a href="#_filter_matching_by_annotation">the documentation</a> to get started.</p>
</div>
</div>
<div class="sect3">
<h4 id="_dependency_upgrades_8">Dependency Upgrades</h4>
<div class="paragraph">
<p>Required Third Party Dependencies:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>ASM <code>7.0</code> &#8594; <code>7.2</code></p>
</li>
<li>
<p>Caffeine <code>2.5.6</code> &#8594; <code>2.8.0</code></p>
</li>
<li>
<p>Jackson <code>2.9.9</code> &#8594; <code>2.10.1</code></p>
</li>
<li>
<p>Reactive Streams <code>1.0.2</code> &#8594; <code>1.0.3</code></p>
</li>
</ul>
</div>
<div class="paragraph">
<p>Optional Third Party Dependencies:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Micrometer <code>1.2.1</code> &#8594; <code>1.3.1</code></p>
</li>
<li>
<p>Mongo Reactive Driver <code>1.11.0</code> &#8594; <code>1.13.0</code></p>
</li>
<li>
<p>Neo4j Java Driver <code>1.7.2</code> &#8594; <code>1.7.5</code></p>
</li>
<li>
<p>Jaeger <code>0.35.5</code> &#8594; <code>1.0.0</code></p>
</li>
<li>
<p>Kafka <code>2.3.0</code> &#8594; <code>2.4.0</code></p>
</li>
<li>
<p>Spring <code>5.1.8</code> &#8594; <code>5.2.3</code></p>
</li>
<li>
<p>Zipkin/Brave <code>5.6.5</code> &#8594; <code>5.9.0</code></p>
</li>
<li>
<p>Groovy <code>2.5.7</code> &#8594; <code>2.5.8</code></p>
</li>
<li>
<p>Gradle <code>5.5</code> &#8594; <code>Gradle 6.1</code> (for new applications)</p>
</li>
<li>
<p>Hibernate Core <code>5.4.6.Final</code> &#8594; <code>5.4.10.Final</code></p>
</li>
</ul>
</div>
<div class="paragraph">
<p>Modules:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Micronaut GRPC <code>1.0.1</code> &#8594; <code>1.1.1</code></p>
</li>
<li>
<p>Micronaut Kafka <code>1.2.0</code> &#8594; <code>1.4.0</code></p>
</li>
<li>
<p>Micronaut Micrometer <code>1.2.1</code> &#8594; <code>1.3.0</code></p>
</li>
<li>
<p>Micronaut MongoDB <code>1.1.0</code> &#8594; <code>1.2.0</code></p>
</li>
<li>
<p>Micronaut MongoDB <code>1.1.0</code> &#8594; <code>1.3.0</code></p>
</li>
<li>
<p>Micronaut Neo4j <code>1.1.0</code> &#8594; <code>1.3.0</code></p>
</li>
<li>
<p>Micronaut OpenAPI <code>1.2.0</code> &#8594; <code>1.3.0</code></p>
</li>
<li>
<p>Micronaut Redis <code>1.1.0</code> &#8594; <code>1.2.0</code></p>
</li>
<li>
<p>Micronaut SQL <code>1.2.3</code> &#8594; <code>1.3.0</code></p>
</li>
<li>
<p>Micronaut Views <code>1.2.0</code> &#8594; <code>1.3.0</code></p>
</li>
</ul>
</div>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_1_2_9">Micronaut Framework 1.2.9</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_1_2_9_breaking_changes">1.2.9 Breaking Changes</h3>
<div class="ulist">
<ul>
<li>
<p>The data format was changed for multiline server sent event data payloads to conform to the specification. Previously multiline data did not have the required <code>data:</code> prefix on each line and now it does.</p>
</li>
</ul>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_1_2_0">Micronaut Framework 1.2.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_1_2_0">What&#8217;s new with 1.2.0</h3>
<div class="sect3">
<h4 id="_support_for_graalvm_19_3_0">Support for GraalVM 19.3.0</h4>
<div class="paragraph">
<p>Micronaut now supports creating native-images using GraalVM 19.3.0 for both JDK 8 and JDK 11.</p>
</div>
</div>
<div class="sect3">
<h4 id="_native_bean_validation_support">Native Bean Validation Support</h4>
<div class="paragraph">
<p>Hibernate Validator is no longer a required dependency to activate bean validation, with a new <a href="#beanValidation">native implementation of Bean Validation</a> available that is reflection free and supports reactive and AST level validations now available.</p>
</div>
<div class="paragraph">
<p>The <code>micronaut-validation</code> dependency is all that it is needed now and provides the following benefits over Hibernate Validator:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Reflection Free</p>
</li>
<li>
<p>Compile Time Computed Bean Metadata resulting in lower memory requirements</p>
</li>
<li>
<p>Reduction in JAR size by 2MB</p>
</li>
<li>
<p>Reduction in startup time by 300ms which was the cost of initializing Hibernate validator</p>
</li>
<li>
<p>Out-of-the-box GraalVM native image support</p>
</li>
<li>
<p>Reduction in GraalVM native image size by 10MB</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_reactive_bean_validation_support">Reactive Bean Validation Support</h4>
<div class="paragraph">
<p>In previous versions of Micronaut manual validation had to be applied to reactive flows. You can now declare <code>@Valid</code> on method parameters that receive a reactive type and validation will automatically be applied.</p>
</div>
</div>
<div class="sect3">
<h4 id="_implicit_validated_and_valid">Implicit @Validated and @Valid</h4>
<div class="paragraph">
<p>It is no longer necessary to apply the ann:validation.Validated[] annotation to beans that accept <code>@Valid</code> arguments or use any <code>javax.validation</code> annotation.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_kubernetes_1_0_release">Micronaut Kubernetes 1.0 Release</h4>
<div class="paragraph">
<p>There is a new <a href="https://micronaut-projects.github.io/micronaut-kubernetes/1.0.0/guide/">Micronaut Kubernetes</a> module, with an improved support for running Micronaut applications in a Kubernetes cluster, including support for Kubernetes' <code>ConfigMap</code>s, <code>Secret</code>s and more.</p>
</div>
<div class="paragraph">
<p>To get started, use the <code>kubernetes</code> feature:</p>
</div>
<div class="listingblock">
<div class="content">
<pre>mn create-app my-app --features kubernetes</pre>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_security_1_2_update">Micronaut Security 1.2 Update</h4>
<div class="paragraph">
<p>Support for OAuth 2.0 and OpenID clients has been added to the Micronaut security module through a new dependency: <code>micronaut-security-oauth2</code>. It is now very easy to add support for login through an OAuth providers. See the <a href="https://micronaut-projects.github.io/micronaut-security/latest/guide/#oauth">Oauth section</a> in the security documentation for more information.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_micrometer_1_2_update">Micronaut Micrometer 1.2 Update</h4>
<div class="paragraph">
<p><a href="https://micronaut-projects.github.io/micronaut-micrometer/1.2.x/guide/">Micronaut Micrometer has been updated to 1.2</a> which includes the following new features:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Update to Micrometer 1.2.0</p>
</li>
<li>
<p>Support for GraalVM native images</p>
</li>
<li>
<p>Meter registry support for AppOptics, Azure Monitor, Datadog, Dynatrace, Elastic, Ganglia, Humio, Influx, Jmx, Kairos, New Relic, SignalFX, Stackdriver and Wavefront</p>
</li>
</ul>
</div>
<div class="paragraph">
<p>Thanks to <a href="https://github.com/thiagolocatelli">Thiago Locatelli</a> for this contribution.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_sql_1_2_update">Micronaut SQL 1.2 Update</h4>
<div class="paragraph">
<p>The <a href="https://micronaut-projects.github.io/micronaut-sql/1.2.x/guide/index.html">Micronaut SQL</a> module has been updated with support for the following new features:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Improved Entity Scan support for JPA</p>
</li>
<li>
<p>Integration with Micronaut 1.2 Validator for JPA</p>
</li>
<li>
<p>GraalVM <code>native-image</code> metadata</p>
</li>
<li>
<p>Support for <a href="https://www.jooq.org">JOOQ</a>. Thanks to <a href="https://github.com/lightoze">Vladimir Kulev</a>.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_kafka_1_2_update">Micronaut Kafka 1.2 Update</h4>
<div class="paragraph">
<p>The <a href="https://micronaut-projects.github.io/micronaut-kafka/1.2.x/guide/index.html">Micronaut Kafka</a> module has been updated with support for the following new features:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Support for Kafka 2.3.0</p>
</li>
<li>
<p>Improved Exception Handling</p>
</li>
<li>
<p>Support for GraalVM <code>native-image</code></p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_rabbit_1_1_1_update">Micronaut Rabbit 1.1.1 Update</h4>
<div class="paragraph">
<p>The <a href="https://micronaut-projects.github.io/micronaut-rabbitmq/1.1.x/guide/index.html">Micronaut RabbitMQ</a> module has been updated with support for GraalVM <code>native-image</code>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_test_1_1_update">Micronaut Test 1.1 Update</h4>
<div class="paragraph">
<p>The <a href="https://micronaut-projects.github.io/micronaut-test/1.1.x/guide/index.html">Micronaut Test</a> module has been updated with support for the following new features:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Updated to JUnit 5.5</p>
</li>
<li>
<p>Support for Dependency Injection in Constructors and Methods for JUnit 5</p>
</li>
<li>
<p>Support for <a href="https://github.com/kotlintest/kotlintest">Kotlin Test</a></p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_optional_beans_returned_from_factories">Optional Beans Returned from Factories</h4>
<div class="paragraph">
<p>A ann:context.annotation.Factory[] bean can now return <code>null</code> if it is not possible to create the bean which will indicate to the dependency injection container that the bean does not exist. This allows for more complex logic within factory beans that can conditionally disable the bean if certain conditions are not met.</p>
</div>
</div>
<div class="sect3">
<h4 id="_hashicorp_vault_support">HashiCorp Vault Support</h4>
<div class="paragraph">
<p>Initial support distributed configuration for <a href="https://www.vaultproject.io">HashiCorp Vault</a> has been added. See the documentation on <a href="#distributedConfigurationVault">HashiCorp Vault Support</a> for more information. Thanks to <a href="https://github.com/thiagolocatelli">Thiago Locatelli</a> for this contribution.</p>
</div>
</div>
<div class="sect3">
<h4 id="_oracle_cloud_support">Oracle Cloud Support</h4>
<div class="paragraph">
<p>Initial support for environment detection and cloud metadata for Oracle Cloud has been added. Thanks to <a href="https://github.com/recursivecodes">Todd Sharp</a> for this contribution.</p>
</div>
</div>
<div class="sect3">
<h4 id="_client_and_manual_service_discovery">@Client and Manual Service Discovery</h4>
<div class="paragraph">
<p>If a service is configured statically with <code>micronaut.http.services.*</code>, it was previously not possible to override the configuration with the ann:http.client.annotation.Client[] annotation. It is now possible to override the configuration, which will result in a new client being created for the given client class.</p>
</div>
</div>
<div class="sect3">
<h4 id="_completable_support">Completable Support</h4>
<div class="paragraph">
<p>The RxJava2 reactive type <code>io.reactivex.Completable</code> is now supported as a return type for controller and client methods.</p>
</div>
</div>
<div class="sect3">
<h4 id="_client_and_server_host_resolution">Client and Server Host Resolution</h4>
<div class="paragraph">
<p>New beans have been added to support lookup of the client address and the current server host. The implementations are aware of proxy headers and are configurable to look for custom headers. The api:http.server.util.HttpHostResolver[] can be injected to resolve the current server hostname and api:http.server.util.HttpClientAddressResolver[] can be injected to resolve the client address of the current request.</p>
</div>
</div>
<div class="sect3">
<h4 id="_default_implementation_support">Default Implementation Support</h4>
<div class="paragraph">
<p>When writing libraries for Micronaut, it is often the case that users will want to override part of your implementation. The most common way of doing so is creating custom beans that use the ann:context.annotation.Replaces[] annotation to replace your implementation. Because the ann:context.annotation.Replaces[] annotation requires a class argument to indicate which implementation to replace, it was required to make the implementation part of the public API. The class needed to be public because the user would need to reference the class directly in the annotation.</p>
</div>
<div class="paragraph">
<p>A new annotation has been added to solve this problem: ann:context.annotation.DefaultImplementation[]. See the section on <a href="#replaces">Bean Replacements</a> for more information.</p>
</div>
</div>
<div class="sect3">
<h4 id="_head_routes">HEAD Routes</h4>
<div class="paragraph">
<p>For each route registered with the server that responds to GET requests, an additional route will be registered that responds to HEAD requests and will not include the body. This only applies to routes created by Micronaut through annotations. Any GET routes registered by custom route builders will not have corresponding HEAD routes added automatically.</p>
</div>
</div>
<div class="sect3">
<h4 id="_request_scope">Request Scope</h4>
<div class="paragraph">
<p>A new bean scope has been created to allow for beans that only exist in the scope of a given HTTP request. See ann:runtime.http.scope.RequestScope[].</p>
</div>
</div>
<div class="sect3">
<h4 id="_environment_order_and_priority">Environment Order and Priority</h4>
<div class="paragraph">
<p>In previous versions of Micronaut, the property sources for an active environment had no priority over any other active environment. It was non deterministic which environment&#8217;s properties would override other environments. Now the last environment supplied has the highest priority. For example, if an application is started with <code>-Dmicronaut.environments=first,second</code>, <code>application-second.yml</code> will override properties in <code>application-first.yml</code>. This change affects all sources of properties, including distributed configuration sources.</p>
</div>
</div>
<div class="sect3">
<h4 id="_environment_endpoint_3">Environment Endpoint</h4>
<div class="paragraph">
<p>This version includes a new <code>/env</code> endpoint with information about the environment and its property sources See the <a href="#environmentEndpoint">documentation</a> for more information.</p>
</div>
</div>
<div class="sect3">
<h4 id="_rss_2_0_module_included_in_bom">RSS 2.0 Module Included in BOM</h4>
<div class="paragraph">
<p>This version references the <a href="https://micronaut-projects.github.io/micronaut-rss/latest/guide/index.html">RSS configuration</a> which eases the generation of a RSS 2.0 feeds in a Micronaut app.</p>
</div>
</div>
<div class="sect3">
<h4 id="_dependency_upgrades_9">Dependency Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Groovy <code>2.5.4</code> &#8594; <code>2.5.6</code></p>
</li>
<li>
<p>Gradle <code>5.1.1</code> &#8594; <code>Gradle 5.5</code> (for new applications)</p>
</li>
<li>
<p>Micronaut SQL <code>1.1.1</code> &#8594; <code>1.2.0</code></p>
</li>
<li>
<p>Micronaut Micrometer <code>1.1.0</code> &#8594; <code>1.2.0</code></p>
</li>
<li>
<p>Micrometer <code>1.1.5</code> &#8594; <code>1.2.0</code></p>
</li>
<li>
<p>Micronaut Security <code>1.1.1</code> &#8594; <code>1.2.0</code></p>
</li>
<li>
<p>Micronaut Views <code>1.1.3</code> &#8594; <code>1.2.0</code></p>
</li>
<li>
<p>Micronaut Test <code>1.0.4</code> &#8594; <code>1.1.0</code></p>
</li>
<li>
<p>Netty <code>4.1.30.Final</code> &#8594; <code>4.1.43.Final</code></p>
</li>
<li>
<p>Neo4j Driver <code>1.7.2</code> &#8594; <code>1.7.5</code></p>
</li>
<li>
<p>Mongo Driver <code>3.8.0</code> &#8594; <code>3.10.1</code></p>
</li>
<li>
<p>Mongo Reactive Streams <code>1.10.0</code> &#8594; <code>1.11.0</code></p>
</li>
<li>
<p>Kafka <code>2.1.1</code> &#8594; <code>2.3.0</code></p>
</li>
<li>
<p>Snake YAML <code>1.23</code> &#8594; <code>1.24</code></p>
</li>
<li>
<p>Lettuce <code>5.1.3.RELEASE</code> &#8594; <code>5.1.7.RELEASE</code></p>
</li>
<li>
<p>JUnit <code>5.3.2</code> &#8594; <code>5.5.0</code></p>
</li>
<li>
<p>Picocli <code>3.5.2</code> &#8594; <code>4.0.1</code></p>
</li>
<li>
<p>Jaeger <code>0.33.1</code> &#8594; <code>0.35.5</code></p>
</li>
<li>
<p>Zipkin Reporter <code>2.8.4</code> &#8594; <code>2.10.0</code></p>
</li>
<li>
<p>Open Tracing <code>0.31.0</code> &#8594; <code>0.33.0</code></p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_1_2_0_breaking_changes">1.2.0 Breaking Changes</h3>
<div class="paragraph">
<p>The following changes could potentially be considered to be breaking changes, however the likelihood of any negative impact is low.</p>
</div>
<div class="ulist">
<ul>
<li>
<p>The AWS distributed configuration through systems manager property store supported the notion of <code>key=value</code> in the value section of the configuration. This functionality has been removed because it did not consider properties that contain an <code>=</code> but are not in the format of <code>key=value</code>.</p>
</li>
<li>
<p>The return of reactive types with a generic of <code>Void</code> has been changed from always returning a 404 status to returning a 200, or whatever status is defined in the <code>@Status</code> annotation. This includes <code>CompletionStage</code>, RxJava2, and Reactor types. The change was made to be consistent with the behavior of methods that return <code>void</code>.</p>
</li>
<li>
<p>Extending a <code>@ConfigurationProperties</code> class that contains a <code>@ConfigurationBuilder</code> only allowed the builder to be configured through the child&#8217;s class prefix instead of the parent&#8217;s. This was a bug because the behavior is different compared to any other property on the parent class. Previously the <code>parent.child.address</code> prefix would have been used to configure the <code>address</code> builder on the child class. With this change <code>parent.address</code> will be used.</p>
</li>
</ul>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">    @ConfigurationProperties("parent")
    class Parent {
        @ConfigurationBuilder(configurationPrefix = "address")
        ...
    }

    @ConfigurationProperties("child")
    class Child extends Parent {
    }</code></pre>
</div>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_1_1_0">Micronaut Framework 1.1.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_1_1_0">What&#8217;s new with 1.1.0</h3>
<div class="sect3">
<h4 id="_graalvm_19_native_image_support">GraalVM 19 Native Image Support</h4>
<div class="paragraph">
<p>Micronaut 1.1.2 is the first version to support GraalVM 19&#8217;s native image changes.</p>
</div>
<div class="admonitionblock note">
<table>
<tr>
<td class="icon">
<div class="title">Note</div>
</td>
<td class="content">
Although GraalVM 19 is the first official stable release of GraalVM, Substrate and the <code>native-image</code> tool remain in early adopter / experimental status. Therefore support for native images in Micronaut also remains experimental at this stage.
</td>
</tr>
</table>
</div>
</div>
<div class="sect3">
<h4 id="_modularization">Modularization</h4>
<div class="paragraph">
<p>Micronaut is now modular with parts of Micronaut being shifted into sub-projects. See the following links for new sub-projects that now have independent release cycles outside of Micronaut core:</p>
</div>
<div class="ulist">
<ul>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-kafka/1.1.x/guide/index.html">Micronaut Kafka</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-micrometer/1.1.x/guide/index.html">Micronaut Micrometer</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-groovy/1.1.x/guide/index.html">Micronaut Groovy</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-sql/1.1.x/guide/index.html">Micronaut SQL</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-mongodb/1.1.x/guide/index.html">Micronaut MongoDB</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-neo4j/1.1.x/guide/index.html">Micronaut Neo4j</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-redis/1.1.x/guide/index.html">Micronaut Redis</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-rabbitmq/1.1.x/guide/index.html">Micronaut RabbitMQ</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-test/latest/guide/index.html">Micronaut Test</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-netflix/latest/guide/index.html">Micronaut Netflix</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-aws/latest/guide/index.html">Micronaut AWS</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-grpc/latest/guide/index.html">Micronaut GRPC</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-flyway/latest/guide/index.html">Micronaut Flyway</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-liquibase/latest/guide/index.html">Micronaut Liquibase</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-elasticsearch/latest/guide/index.html">Micronaut Elasticsearch</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-graphql/latest/guide/index.html">Micronaut GraphQL</a></p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_file_watch_and_server_restart">File Watch and Server Restart</h4>
<div class="paragraph">
<p>A new <a href="#automaticRestart">Automatic Restart</a> feature is included that allows the server to restart if a change occurs to a file. This feature can be used both in production and at development time to achieve automatic application restarts when changing source code (when combined with a third party tool such as Gradle or Kubernetes in production).</p>
</div>
<div class="admonitionblock tip">
<table>
<tr>
<td class="icon">
<div class="title">Tip</div>
</td>
<td class="content">
<div class="title">Using the CLI</div>
<div class="listingblock">
<div class="content">
<pre>$ mn create-app my-app --features file-watch
$ cd my-app
$ ./gradlew run --continuous</pre>
</div>
</div>
</td>
</tr>
</table>
</div>
</div>
<div class="sect3">
<h4 id="_grpc_support">GRPC Support</h4>
<div class="paragraph">
<p>Support for creating <a href="https://grpc.io/">GRPC</a> + Micronaut applications has been added.</p>
</div>
<div class="paragraph">
<p>See the <a href="https://micronaut-projects.github.io/micronaut-grpc/latest/guide/">Micronaut GRPC</a> documentation for more information and example applications.</p>
</div>
<div class="admonitionblock tip">
<table>
<tr>
<td class="icon">
<div class="title">Tip</div>
</td>
<td class="content">
<div class="title">Using the CLI</div>
<div class="paragraph">
<p>Use the CLI to quickly create a GRPC application.</p>
</div>
<div class="listingblock">
<div class="content">
<pre>mn create-app helloworld --profile grpc --lang java --build gradle</pre>
</div>
</div>
</td>
</tr>
</table>
</div>
</div>
<div class="sect3">
<h4 id="_rabbitmq_support">RabbitMQ Support</h4>
<div class="paragraph">
<p>Support for creating Message-Driven Microservices with <a href="https://www.rabbitmq.com">RabbitMQ</a> has been added.</p>
</div>
<div class="admonitionblock tip">
<table>
<tr>
<td class="icon">
<div class="title">Tip</div>
</td>
<td class="content">
<div class="title">Using the CLI</div>
<div class="paragraph">
<p>Use the CLI to quickly create a RabbitMQ application.</p>
</div>
<div class="listingblock">
<div class="content">
<pre>mn create-app hellorabbit --features rabbitmq</pre>
</div>
</div>
</td>
</tr>
</table>
</div>
<div class="paragraph">
<p>See the <a href="https://micronaut-projects.github.io/micronaut-rabbitmq/latest/guide/">Micronaut RabbitMQ</a> documentation for more information.</p>
</div>
</div>
<div class="sect3">
<h4 id="_graphql_support">GraphQL Support</h4>
<div class="paragraph">
<p>Support for creating <a href="https://graphql.org/">GraphQL</a> + Micronaut applications has been added.</p>
</div>
<div class="paragraph">
<p>See the <a href="https://micronaut-projects.github.io/micronaut-graphql/latest/guide/">Micronaut GraphQL</a> documentation for more information.</p>
</div>
</div>
<div class="sect3">
<h4 id="_compile_time_bean_introspection">Compile Time Bean Introspection</h4>
<div class="paragraph">
<p>A compilation time replacement for jdk:java.beans.Introspector[] has been added which allows introspecting and creating bean instances without using reflection, improving performance, memory consumption and GraalVM support.</p>
</div>
<div class="paragraph">
<p>See the new section on <a href="#introspection">Bean Introspection</a> for more information.</p>
</div>
</div>
<div class="sect3">
<h4 id="_cold_start_and_performance_improvements">Cold Start and Performance Improvements</h4>
<div class="paragraph">
<p>Micronaut 1.1 cold start performance has been improved through a variety of optimizations including compilation time indexing of common bean types. Users should see superior cold start performance for both Microservices and Functions.</p>
</div>
</div>
<div class="sect3">
<h4 id="_aws_api_gateway_proxy_support">AWS API Gateway Proxy Support</h4>
<div class="paragraph">
<p>Support for AWS API Gateway Proxy has been added allowing AWS Lambda&#8217;s to be defined as regular controllers. See the documentation on <a href="https://micronaut-projects.github.io/micronaut-aws/latest/guide/#apiProxy">AWS API Gateway Proxy Support</a> for more information and links to examples.</p>
</div>
<div class="admonitionblock tip">
<table>
<tr>
<td class="icon">
<div class="title">Tip</div>
</td>
<td class="content">
<div class="title">Using the CLI</div>
<div class="listingblock">
<div class="content">
<pre>$ mn create-app my-app --features aws-api-gateway</pre>
</div>
</div>
</td>
</tr>
</table>
</div>
</div>
<div class="sect3">
<h4 id="_graalvm_native_improvements">GraalVM Native Improvements</h4>
<div class="paragraph">
<p>Support for GraalVM Substrate (<code>nativeimage</code>) has been improved in a number of different ways.</p>
</div>
<div class="ulist">
<ul>
<li>
<p><strong>Framework Improvements</strong> - Framework level dynamic classloading and reflection has been completely removed thus making it easier to get applications running on GraalVM <code>nativeimage</code> and reducing the number of customizations necessary.</p>
</li>
<li>
<p><strong>Build Time Reflection Data</strong> - Thanks to the aforementioned feature, the older <code>GraalClassLoadingAnalyzer</code> runtime step has been removed and replaced by build time generation of <code>reflection-config.json</code> for classes that do require it (typically third party libraries).</p>
</li>
<li>
<p><strong>Simplified Image Generation</strong> - You can now generate a native image with just <code>native-image --class-path myjar.jar</code> without any additional flags. Since Micronaut now computes the appropriate GraalVM configuration at compilation time.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_google_cloud_platform_gcp_support">Google Cloud Platform (GCP) Support</h4>
<div class="paragraph">
<p>A new <a href="https://micronaut-projects.github.io/micronaut-gcp/latest/guide/">Google Cloud Configuration</a> is available that adds general support for GCP and integration with Stackdriver Trace for distributed tracing.</p>
</div>
</div>
<div class="sect3">
<h4 id="_aws_lambda_custom_runtime_graalvm_support">AWS Lambda Custom Runtime + GraalVM Support</h4>
<div class="paragraph">
<p>Support for creating AWS API Gateway applications (see above) that are compiled into GraalVM native images and run using an AWS Lambda Custom Runtime has been added. This reduces cold starts on Lambda to 100-200ms.</p>
</div>
<div class="admonitionblock tip">
<table>
<tr>
<td class="icon">
<div class="title">Tip</div>
</td>
<td class="content">
<div class="title">Using the CLI</div>
<div class="listingblock">
<div class="content">
<pre>$ mn create-app my-app --features aws-api-gateway-graal</pre>
</div>
</div>
</td>
</tr>
</table>
</div>
</div>
<div class="sect3">
<h4 id="_aws_lambda_alexa_skill_support">AWS Lambda Alexa Skill Support</h4>
<div class="paragraph">
<p>Support for creating <a href="https://micronaut-projects.github.io/micronaut-aws/latest/guide/#alexa">Alexa Skills with Micronaut</a> has been added.</p>
</div>
<div class="admonitionblock tip">
<table>
<tr>
<td class="icon">
<div class="title">Tip</div>
</td>
<td class="content">
<div class="title">Using the CLI</div>
<div class="paragraph">
<p>You can create Alexa functions with the CLI. Use the <code>-lang</code> parameter to specify <code>java</code>, <code>kotlin</code> or <code>groovy</code>.</p>
</div>
<div class="listingblock">
<div class="content">
<pre>$ mn create-function hello-alexa --provider alexa</pre>
</div>
</div>
</td>
</tr>
</table>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_test_templates">Micronaut Test Templates</h4>
<div class="paragraph">
<p>The CLI has been updated to generate tests that use <a href="https://micronaut-projects.github.io/micronaut-test/latest/guide/index.html">Micronaut Test</a> for JUnit 5 and Spock.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micrometer_1_1_and_timed_support">Micrometer 1.1 and @Timed Support</h4>
<div class="paragraph">
<p>Micrometer has been upgraded to 1.1 and support for <a href="https://micrometer.io/docs/concepts#_the_code_timed_code_annotation">@Timed</a> AOP advice added.</p>
</div>
<div class="admonitionblock tip">
<table>
<tr>
<td class="icon">
<div class="title">Tip</div>
</td>
<td class="content">
<div class="title">Using the CLI</div>
<div class="listingblock">
<div class="content">
<pre>$ mn create-app my-app --features micrometer</pre>
</div>
</div>
</td>
</tr>
</table>
</div>
</div>
<div class="sect3">
<h4 id="_kafka_2_1_and_kafka_improvements">Kafka 2.1 and Kafka Improvements</h4>
<div class="paragraph">
<p>Kafka support has been improved with the release of <a href="https://micronaut-projects.github.io/micronaut-kafka/1.1.x/guide/">Micronaut Kafka</a> 1.1 including supports for metrics, distributed tracing and Kafka 2.1.</p>
</div>
</div>
<div class="sect3">
<h4 id="_api_versioning_support">API Versioning Support</h4>
<div class="paragraph">
<p>API versioning is now supported. See the <a href="#apiVersioning">API Versioning</a> documentation for more information on how to use this feature. Thanks for <a href="https://github.com/BogdanOros">Bogdan Oros</a> for contributing this feature.</p>
</div>
</div>
<div class="sect3">
<h4 id="_jackson_jsonview_support">Jackson <code>@JsonView</code> Support</h4>
<div class="paragraph">
<p>Support for using <code>@JsonView</code> on controller methods has been added can be optionally enabled by setting <code>jackson.json-view.enabled</code> to <code>true</code> in <code>application.yml</code>. Thanks to <a href="https://github.com/mmindenhall">Mark Mindenhall</a> for contributing this feature.</p>
</div>
</div>
<div class="sect3">
<h4 id="_support_for_spring_cloud_config_server">Support for Spring Cloud Config Server</h4>
<div class="paragraph">
<p>If you are already using <a href="https://spring.io/projects/spring-cloud-config">Spring Config Server</a> then Micronaut now features native integration for distributed configuration.</p>
</div>
<div class="paragraph">
<p>See the <a href="#distributedConfigurationSpringCloud">Documentation on Distributed Configuration with Spring Cloud Config</a> for more information.</p>
</div>
<div class="paragraph">
<p>Thanks to <a href="https://github.com/thiagolocatelli">Thiago Locatelli</a> and <a href="https://github.com/MichelSchudel">Michel Schudel</a> for contributing this feature.</p>
</div>
</div>
<div class="sect3">
<h4 id="_refactoring_of_file_responses">Refactoring of File Responses</h4>
<div class="paragraph">
<p>In an effort to make a more consistent and understandable API, some methods and classes related to sending file responses have been deprecated. api:http.server.types.files.SystemFile[] is the replacement for api:http.server.types.files.AttachedFile[] and the constructors of api:http.server.types.files.StreamedFile[] have been deprecated in favor of new constructors that better convey the intended functionality.</p>
</div>
<div class="paragraph">
<p>Note that api:http.server.types.files.SystemFile[] behaves differently from api:http.server.types.files.AttachedFile[] in that responses are by default sent inline instead of attached. In addition, support for sending attached responses has been added to api:http.server.types.files.StreamedFile[]. The following methods can be used to attach a system or streamed file.</p>
</div>
<div class="ulist">
<ul>
<li>
<p>api:http.server.types.files.StreamedFile#attach-java.lang.String-[StreamedFile#attach(String)]</p>
</li>
<li>
<p>api:http.server.types.files.SystemFile#attach--[SystemFile#attach()]</p>
</li>
<li>
<p>api:http.server.types.files.SystemFile#attach-java.lang.String-[SystemFile#attach(String)]</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_support_for_freemarker_views">Support for Freemarker Views</h4>
<div class="paragraph">
<p>Support for rendering <a href="#freemarker">Freemarker Views</a> has been added. Thanks to <a href="https://github.com/jerolba">Jeronimo López</a> for contributing this feature.</p>
</div>
</div>
<div class="sect3">
<h4 id="_constraint_bean_support">Constraint Bean Support</h4>
<div class="paragraph">
<p>For those using the <code>micronaut-hibernate-validator</code> configuration, constraints will now be attempted to be retrieved from the bean context. This means you can now use dependency injection in your custom constraints.</p>
</div>
</div>
<div class="sect3">
<h4 id="_support_for_jcache_caching">Support for JCache Caching</h4>
<div class="paragraph">
<p>Support has been added for the JCache specification. If you define a <code>javax.cache.CacheManager</code> bean it will be used for caching. For example:</p>
</div>
<div class="paragraph">
<div class="title">Using JCache Caching</div>
<p>snippet::io.micronaut.docs.whatsNew.CacheFactory[tags="imports,class"]</p>
</div>
</div>
<div class="sect3">
<h4 id="_support_for_jasync_sql">Support for JAsync SQL</h4>
<div class="paragraph">
<p>Support for <a href="https://micronaut-projects.github.io/micronaut-sql/1.1.x/guide/index.html#jasync">JAsync SQL</a> has been added, which includes non-blocking drivers for both Postgres and MySQL. Thanks to <a href="https://github.com/oshai">Ohad Shai</a> for contributing this feature.</p>
</div>
</div>
<div class="sect3">
<h4 id="_major_improvements_for_multipart_file_uploads">Major Improvements for Multipart File Uploads</h4>
<div class="paragraph">
<p>Several issues and improvements have been made in regards to file uploads in comparison to the previous version of Micronaut. These fixes have been substantial enough that they have caused the behavior of uploads to change, however these changes should not break any existing use cases. To summarize the issues:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Routes were not in control of the flow of bytes coming from the client with multipart uploads</p>
</li>
<li>
<p>It was not possible to read and release a chunk of data at a time. The entire upload would be put into memory or disk</p>
</li>
<li>
<p>Mixed (memory/disk with a threshold) uploads are not supported</p>
</li>
</ul>
</div>
<div class="paragraph">
<p>The following changes have been implemented:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Routes gain control of the data flow as soon as they are executed. A route cannot be executed until all of its arguments are fulfilled, so data will reside on memory or disk until the route can be executed.</p>
</li>
<li>
<p>After processing a chunk of data it is immediately released. For memory uploads this means the data is immediately freed. For disk uploads the data remains on disk until after processing.</p>
</li>
<li>
<p>Two new configuration options are available to support mixed uploads: <code>micronaut.server.multipart.mixed</code> and <code>micronaut.server.multipart.threshold</code>. When data needs to be buffered, mixed uploads will initially store data in memory. Once the threshold is reached, the data will be erased from memory and moved entirely onto disk.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_option_to_disable_environment_detection">Option to Disable Environment Detection</h4>
<div class="paragraph">
<p>Environment detection can be disabled through a method on the application context builder, system property, or evnironment variable.</p>
</div>
<div class="paragraph">
<p>See the <a href="#environments">Environment</a> documentation for more information.</p>
</div>
</div>
<div class="sect3">
<h4 id="_jwk_and_jwk_set_support">JWK and JWK Set support</h4>
<div class="paragraph">
<p>You can expose an endpoint with a JWK Set thanks to the <a href="#keys">Keys Controller</a>.</p>
</div>
<div class="paragraph">
<p>You can also make a remote JWKS participate in a JWT signature validation. Read the
<a href="#jwks">Validation with remote JWKS</a> section to learn more.</p>
</div>
</div>
<div class="sect3">
<h4 id="_dependency_upgrades_10">Dependency Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Groovy <code>2.5.4</code> &#8594; <code>2.5.6</code></p>
</li>
<li>
<p>Gradle <code>4.10.2</code> &#8594; <code>5.1.1</code> (CLI Only)</p>
</li>
<li>
<p>Kafka <code>2.0.1</code> &#8594; <code>2.1.1</code></p>
</li>
<li>
<p>Micrometer <code>1.0.6</code> &#8594; <code>1.1.4</code></p>
</li>
<li>
<p>Reactive Streams <code>1.0.1</code> &#8594; <code>1.0.2</code></p>
</li>
<li>
<p>Jackson <code>2.9.7</code> &#8594; <code>2.9.8</code></p>
</li>
<li>
<p>Nimbus JOSE+JWT  <code>6.0.2</code> &#8594; <code>6.8</code></p>
</li>
<li>
<p>Spring <code>5.0.10.RELEASE</code> &#8594; <code>5.1.4.RELEASE</code></p>
</li>
<li>
<p>Reactor <code>3.2.0.RELEASE</code> &#8594; <code>3.2.5.RELEASE</code></p>
</li>
<li>
<p>RxJava 2 <code>2.2.2</code> &#8594; <code>2.2.6</code></p>
</li>
<li>
<p>Reactive Postgres <code>0.10.5</code> &#8594; <code>0.11.3</code></p>
</li>
<li>
<p>GORM <code>6.1.8.RELEASE</code> &#8594; <code>7.0.0.RELEASE</code></p>
</li>
<li>
<p>Hibernate <code>5.3.7.Final</code> &#8594; <code>5.4.0.Final</code></p>
</li>
<li>
<p>Hikari <code>2.7.9</code> &#8594; <code>3.3.1</code></p>
</li>
<li>
<p>Commons DBCP 2 <code>2.1.1</code> &#8594; <code>2.6.0</code></p>
</li>
<li>
<p>Tomcat Pool <code>9.0.1</code> &#8594; <code>9.0.17</code></p>
</li>
<li>
<p>Neo4j Java Driver <code>1.6.4</code> &#8594; <code>1.7.2</code></p>
</li>
<li>
<p>Mongo Java Driver <code>3.8.0</code> &#8594; <code>3.10.0</code></p>
</li>
<li>
<p>Mongo Reactive Driver <code>1.8.0</code> &#8594; <code>1.10.0</code></p>
</li>
<li>
<p>Redis Lettuce Driver <code>5.0.4.RELEASE</code> &#8594; <code>5.1.3.RELEASE</code></p>
</li>
<li>
<p>Jaeger <code>0.31.0</code> &#8594; <code>0.33.1</code></p>
</li>
<li>
<p>Zipkin Reporter <code>2.7.9</code> &#8594; <code>2.8.0</code></p>
</li>
<li>
<p>Brave Instrumentation HTTP <code>5.4.2</code> &#8594; <code>5.6.1</code></p>
</li>
<li>
<p>Brave Opentracing &#8594; <code>0.33.3</code> &#8594; <code>0.33.10</code></p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_1_1_0_breaking_changes">1.1.0 Breaking Changes</h3>
<div class="paragraph">
<p>The following changes could potentially be considered to be breaking changes, however the likelihood of any negative impact is low.</p>
</div>
<div class="ulist">
<ul>
<li>
<p><a href="{api}/io/micronaut/session/http/HttpSessionConfiguration.html">HttpSessionConfiguration</a> default value for <code>cookiePath</code> is <code>/</code>. The change was necessary for cookies to function normally.</p>
</li>
<li>
<p>The <a href="{api}/io/micronaut/security/token/jwt/render/AccessRefreshToken.html">AccessRefreshToken</a> API has been changed to  include <code>tokenType</code> and <code>expiresIn</code>. This change was necessary to comply with the token response <a href="https://tools.ietf.org/html/rfc6749#section-4.1.4.html">RFC 6749</a>.</p>
</li>
<li>
<p>Route binding behavior for a request argument with a generic type has changed. For routes that take in an <code>HttpRequest&lt;SomeType&gt;</code>, an <code>UnsatisfiedRouteException</code> will be thrown if no body is found in the request. To restore the previous behavior, remove the generic type from the argument.</p>
</li>
</ul>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">    public String hello(HttpRequest&lt;Author&gt; request) //requires the body to be present

    public String hello(HttpRequest request) //the body will not be read (same as 1.0.x)</code></pre>
</div>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_1_0_0">Micronaut Framework 1.0.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_1_0_0">What&#8217;s new with 1.0.0</h3>
<div class="sect3">
<h4 id="_modularization_2">Modularization</h4>
<div class="paragraph">
<p>Micronaut is now modular with parts of Micronaut being shifted into subprojects. See the following links for new subprojects that now have indepent release cycles outside of Micronaut core:</p>
</div>
<div class="ulist">
<ul>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-kafka/latest/guide/index.html">Micronaut Kafka</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-micrometer/latest/guide/index.html">Micronaut Micrometer</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-groovy/latest/guide/index.html">Micronaut Groovy</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-sql/latest/guide/index.html">Micronaut SQL</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-mongodb/latest/guide/index.html">Micronaut MongoDB</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-redis/latest/guide/index.html">Micronaut Redis</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-test/latest/guide/index.html">Micronaut Test</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-netflix/latest/guide/index.html">Micronaut Netflix</a></p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_graalvm_1_0_rc11_support">GraalVM 1.0 RC11 Support</h4>
<div class="paragraph">
<p>The GraalVM support has been updated to accomodate the latest changes in <a href="https://github.com/oracle/graal/releases/tag/vm-1.0.0-rc11">GraalVM 1.0.0 RC11</a>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_dependency_upgrades_11">Dependency Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Kafka <code>2.0.0</code> &#8594; <code>2.0.1</code></p>
</li>
<li>
<p>Reactive Streams <code>1.0.1</code> &#8594; <code>1.0.2</code></p>
</li>
<li>
<p>Jackson <code>2.9.7</code> &#8594; <code>2.9.8</code></p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_1_0_0_breaking_changes">1.0.0 Breaking Changes</h3>
<div class="sect3">
<h4 id="_1_0_0_rc3">1.0.0.RC3</h4>
<div class="ulist">
<ul>
<li>
<p>All Micronaut modules have been renamed to include <code>micronaut-</code> prefix to make it easier to manage dependencies. If you are upgrading rename all references modules. Example <code>bom</code> &#8594; <code>micronaut-bom</code>, <code>inject</code> &#8594; <code>micronaut-inject</code> etc.</p>
</li>
<li>
<p>Methods for JWT signature generation have been removed from <a href="{api}/io/micronaut/security/token/jwt/signature/rsa/RSASignatureConfiguration.html">RSASignatureConfiguration</a> or
<a href="{api}/io/micronaut/security/token/jwt/signature/ec/ECSignatureConfiguration.html">ECSignatureConfiguration</a>. Those beans should be used in microservices where you need only signature verification and not generation.</p>
</li>
</ul>
</div>
<div class="paragraph">
<p>To enable a RSA or EC JWT signature generation, you need to have in your app a bean of type <a href="{api}/io/micronaut/security/token/jwt/signature/rsa/RSASignatureGeneratorConfiguration.html">RSASignatureGeneratorConfiguration</a> or
<a href="{api}/io/micronaut/security/token/jwt/signature/ec/ECSignatureGeneratorConfiguration.html">ECSignatureGeneratorConfiguration</a>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_1_0_0_rc2">1.0.0.RC2</h4>
<div class="ulist">
<ul>
<li>
<p><code>io.micronaut.security.authentication.Authenticator::authenticate</code> method signature has changed from:</p>
</li>
</ul>
</div>
<div class="paragraph">
<p><code>public Publisher&lt;AuthenticationResponse&gt; authenticate(UsernamePasswordCredentials credentials)</code></p>
</div>
<div class="paragraph">
<p>to:</p>
</div>
<div class="paragraph">
<p><code>public Publisher&lt;AuthenticationResponse&gt; authenticate(AuthenticationRequest authenticationRequest)</code></p>
</div>
</div>
<div class="sect3">
<h4 id="_1_0_0_rc1">1.0.0.RC1</h4>
<div class="ulist">
<ul>
<li>
<p>The default port if no port is specified is now port 8080 instead of a random port, except in the test environment. A random port can be obtained by setting the port to -1.</p>
</li>
<li>
<p>The configuration for static resource has been changed to allow multiple mappings, each with their own set of paths. This will allow accessing resources at multiple URLs. Previously the configuration might have looked like:</p>
<div class="literalblock">
<div class="content">
<pre>micronaut:
    router:
        static:
            resources:
                enabled: true
                mapping: /static/**
                paths:
                  - classpath:static</pre>
</div>
</div>
<div class="paragraph">
<p>And now the equivalent configuration would be:</p>
</div>
<div class="literalblock">
<div class="content">
<pre>micronaut:
    router:
        static-resources:
            default:
                enabled: true
                mapping: /static/**
                paths:
                  - classpath:static</pre>
</div>
</div>
<div class="paragraph">
<p>The word <code>default</code> in that example is arbitrary and can be replaced with any name that is appropriate to describe the category of resources that will be served.</p>
</div>
<div class="admonitionblock note">
<table>
<tr>
<td class="icon">
<div class="title">Note</div>
</td>
<td class="content">
Notice the change from <code>static.resources</code> to <code>static-resources</code>.
</td>
</tr>
</table>
</div>
</li>
<li>
<p>The CLI feature for Netflix Archaius was incorrectly named <code>netflix-archius</code>. The feature has now been renamed to reflect the correct name, <code>netflix-archaius</code>.</p>
</li>
<li>
<p>The intercept url map security rule now no longer considers the query part of the request when determining if the request matches. Previously <code>/?value=true</code> would <strong>not</strong> match <code>/</code>.</p>
</li>
<li>
<p>Several APIs surrounding route URI matching and template parsing have changed to allow more information to be retrieved from the parsing process.</p>
</li>
<li>
<p>The following packages have been renamed:</p>
<div class="literalblock">
<div class="content">
<pre>io.micronaut.http.server.binding -&gt; io.micronaut.http.bind</pre>
</div>
</div>
</li>
<li>
<p>The following annotations have been moved to new locations:</p>
<div class="literalblock">
<div class="content">
<pre>io.micronaut.http.client.Client -&gt; io.micronaut.http.client.annotation.Client
io.micronaut.security.Secured -&gt; io.micronaut.security.annotation.Secured</pre>
</div>
</div>
</li>
<li>
<p>The jackson deserialization features ACCEPT_SINGLE_VALUE_AS_ARRAY and UNWRAP_SINGLE_VALUE_ARRAYS are now enabled by default. To revert to the previous behavior, see the section on <a href="#_jackson_configuration">Jackson Configuration</a> for information on how to customize deserialization features.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_1_0_0_m4">1.0.0.M4</h4>
<div class="ulist">
<ul>
<li>
<p>Libraries compiled against earlier versions of Micronaut are not binary compatible with this release.</p>
</li>
<li>
<p>The Java module names generated in previous versions were invalid because they contained a <code>-</code>. Module names with dashes were converted to an underscore. For example: <code>io.micronaut.inject-java</code> &#8594; <code>io.micronaut.inject_java</code>.</p>
</li>
<li>
<p>The annotation metadata API has been changed to no longer use reflective proxies for annotations. The methods that used to return the proxies now return an <code>AnnotationValue</code> that contains all of the data that existed in the proxy. The methods to create the proxies now exist under <code>synthesize..</code>.</p>
</li>
<li>
<p>Many classes no longer implement <code>AnnotatedElement</code>.</p>
</li>
<li>
<p><code>AnnotationUtil</code> has seen significant changes and is now marked as an internal class.</p>
</li>
<li>
<p><code>BeanContext.getBeanRegistrations</code> has been renamed to <code>BeanContext.getActiveBeanRegistrations</code>.</p>
</li>
<li>
<p>Endpoint annotations have moved packages: <code>io.micronaut.management.endpoint</code> &#8594; <code>io.micronaut.management.endpoint.annotation</code>.</p>
</li>
<li>
<p>Endpoint method arguments were previously included in the route URI by default. Now endpoint arguments are <strong>not</strong> included in the route URI by default. An annotation, <code>@Selector</code> has been added to indicate an endpoint argument <strong>should</strong> be included in the URI.</p>
</li>
<li>
<p>The <code>@Controller</code> annotation now requires a value. Previously a convention was used to determine the URI.</p>
</li>
<li>
<p>The <code>HttpMethodMapping</code> annotations (<code>@Get</code>, <code>@Put</code>, etc) have changed their default behavior. They no longer use a convention based off the method name if the URI was not provided. The URI is still not required, however it now defaults to <code>/</code>. The new default means the method will be accessible from the controller URI.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_1_0_0_m3">1.0.0.M3</h4>
<div class="ulist">
<ul>
<li>
<p>The contract for <code>io.micronaut.http.codec.MediaTypeCodec</code> has changed to support multiple media types.</p>
</li>
<li>
<p>To reduce confusion around <code>@Parameter</code>, it can no longer be used to denote an argument should be bound from the request url. Its sole purpose is defining arguments for parameterized beans. Use <code>@QueryValue</code> instead.</p>
</li>
<li>
<p>The health endpoint will now only report details when the user is authenticated. To revert to the previous behavior, set <code>endpoints.health.detailsVisible: ANONYMOUS</code>.</p>
</li>
<li>
<p>The CLI options have been standardized to use two leading dashes for long options (like <code>--stacktrace</code>) and one for shortcuts (like <code>-h</code>). That means that some options no longer work. For example, this command used to work with M2: <code>create-app -lang groovy myapp</code>. From M3, you will see this error: <code>Could not convert 'ang' to SupportedLanguage for option '--lang'</code>. Specifying either <code>-l LANG</code> or <code>--lang LANG</code> works as expected.</p>
</li>
<li>
<p>The following packages have been renamed:</p>
<div class="ulist">
<ul>
<li>
<p><code>io.micronaut.configurations.ribbon</code> &#8594; <code>io.micronaut.configuration.ribbon</code></p>
</li>
<li>
<p><code>io.micronaut.configurations.hystrix</code> &#8594; <code>io.micronaut.configuration.hystrix</code></p>
</li>
<li>
<p><code>io.micronaut.configurations.aws</code> &#8594; <code>io.micronaut.configuration.aws</code></p>
</li>
<li>
<p><code>io.micronaut.http.netty.buffer</code> &#8594; <code>io.micronaut.buffer.netty</code></p>
</li>
</ul>
</div>
</li>
<li>
<p>The default Consul configuration prefix has been changed to reflect changes in the latest version of Consul. Previously a leading slash was expected and the default value was <code>/config/</code>. The new default value is <code>config/</code>. To restore the previous behavior, set <code>consul.client.config.path = /config/</code></p>
</li>
<li>
<p>The <code>session</code> module will now serialize POJOs to JSON using Jackson by default instead of Java Serialization. This change is because Java serialization will be removed and deprecated in a future version of the JDK.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_1_0_0_m2">1.0.0.M2</h4>
<div class="ulist">
<ul>
<li>
<p>The constructor signature for DefaultHttpClient has changed to include an extra argument. This change should not impact existing uses.</p>
</li>
<li>
<p>Libraries compiled against M1 are not binary compatible with M2.</p>
</li>
<li>
<p>For Java 9+ automatic module name has been set to <code>&lt;groupId&gt;.&lt;name&gt;</code>. Previously if you have been using the "inject-java" module, the module is now named "io.micronaut.inject-java".</p>
</li>
<li>
<p>When an HttpClientResponseException is thrown, the body of the response will be set to the exception message for responses with a text media type. Previously the status description was returned.</p>
</li>
<li>
<p>Mongo configurations were updated to a new version of the driver (3.6.1 &#8594; 3.7.1), which may break existing uses. See their <a href="http://mongodb.github.io/mongo-java-driver/3.7/upgrading/">upgrading</a> page for more information.</p>
</li>
<li>
<p>The <code>router</code> configuration key was changed to be <code>micronaut.router</code>. Static resource configuration is affected by this change. Please update your configuration: <code>router.static.resources</code> &#8594; <code>micronaut.router.static.resources</code>.</p>
</li>
</ul>
</div>
</div>
</div>
</div>
</div>
