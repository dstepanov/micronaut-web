---
slug: 2021/08/18/micronaut-framework-3-upgrade-reference
title: Micronaut Framework 3 Upgrade Reference
description: Historical upgrade notes, new features, and breaking changes for Micronaut Framework 3.x.
date: "2021-08-18T00:00:00"
sourceUrl: https://micronaut-projects.github.io/micronaut-upgrade/snapshot/
contentSource: micronaut-upgrade
category: upgrade
categories:
  - upgrade
tags:
  - upgrade
  - micronaut3
href: /2021/08/18/micronaut-framework-3-upgrade-reference/
---

<p>These historical upgrade notes were migrated from the <a href="https://micronaut-projects.github.io/micronaut-upgrade/snapshot/">Micronaut Upgrade Guide archive</a>.</p>

<div class="sect1">
<h2 id="_micronaut_framework_3_9_0">Micronaut Framework 3.9.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_3_9_0_breaking_changes">3.9.0 Breaking Changes</h3>
<div class="paragraph">
<p>Since Micronaut Framework 3.9.0, CORS <code>allowed-origins</code> configuration does not support regular expressions to prevent accidentally exposing your API. You can use <code>allowed-origins-regex</code>, if you wish to support a regular expression.</p>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_8_7">Micronaut Framework 3.8.7</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_3_8_7_breaking_changes">3.8.7 Breaking Changes</h3>
<div class="paragraph">
<p>Micronaut Framework 3.8.7 updates to <a href="https://bitbucket.org/snakeyaml/snakeyaml/wiki/Changes">SnakeYAML 2.0</a> which addresses <a href="https://nvd.nist.gov/vuln/detail/CVE-2022-1471">CVE-2022-1471</a>. Many organizations' policies forbid their teams to use Micronaut Framework if the framework depends on a vulnerable dependency, even if the framework is unaffected. Micronaut Framework is not affected by <a href="https://nvd.nist.gov/vuln/detail/CVE-2022-1471">CVE-2022-1471</a>.
Micronaut Framework uses SnakeYAML to load configuration in Micronaut applications. There is only one instance of <a href="https://github.com/micronaut-projects/micronaut-core/blob/3.7.x/inject/src/main/java/io/micronaut/context/env/yaml/YamlPropertySourceLoader.java#L56">SnakeYAML instantiation</a> which uses the <a href="https://github.com/micronaut-projects/micronaut-core/blob/3.8.x/inject/src/main/java/io/micronaut/context/env/yaml/CustomSafeConstructor.java">Safe Constructor</a>. Using SnakeYaml&#8217;s SafeConstructor which is the recommended way to prevent this issue:</p>
</div>
<div class="quoteblock">
<blockquote>
<div class="paragraph">
<p>We recommend using SnakeYaml&#8217;s SafeConsturctor when parsing untrusted content to restrict deserialization.</p>
</div>
</blockquote>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_8_0">Micronaut Framework 3.8.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_3_8_0">What&#8217;s new with 3.8.0</h3>
<div class="paragraph">
<p>Key features:</p>
</div>
<div class="ulist">
<ul>
<li>
<p><a href="https://www.graalvm.org/release-notes/22_3/">GraalVM 22.3 Support</a></p>
</li>
<li>
<p>With Micronaut <code>3.8.0</code>, you can use <code>@RequestBean</code> annotations with <a href="https://docs.oracle.com/en/java/javase/14/language/records.html">Records</a>. Before <code>3.8.0</code>, you could use a POJO as a controller method parameter and annotate the parameter with <code>@RequestBean</code> to bind any Bindable value (e.g., <code>HttpRequest</code>, <code>@PathVariable</code>, <code>@QueryValue</code> or <code>@Header</code> fields).</p>
</li>
<li>
<p>If you enable CORS from any origin while running your app in localhost (e.g., test or development), since <code>3.8.0</code>, the <code>CorsFilter</code> returns 403 for non-localhost origins to protect you against drive-by localhost attacks.</p>
</li>
</ul>
</div>
<div class="paragraph">
<p>Please read the <a href="https://micronaut.io/2022/12/27/micronaut-framework-3-8-0-released/">Micronaut Framework 3.8.0 announcement blog post</a>. You will find a detailed overview of what’s new in Micronaut 3.8.0.</p>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_7_0">Micronaut Framework 3.7.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_3_7_0">What&#8217;s new with 3.7.0</h3>
<div class="paragraph">
<p>Several improvements:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>If you want complete control of where your application loads configuration from, for example, due to security restrictions, you can disable the default <a href="https://docs.micronaut.io/snapshot/guide/#propertySource"><code>PropertySourceLoader</code></a> implementations by calling <code>ApplicationContextBuilder::enableDefaultPropertySources(false)</code> when starting your application.</p>
</li>
<li>
<p>Better <code>java.time</code> conversion for YAML configuration</p>
</li>
<li>
<p>Client SSL inner configuration is <a href="https://docs.micronaut.io/latest/guide/#bootstrap">Bootstrap</a> context compatible.</p>
</li>
<li>
<p><a href="https://docs.micronaut.io/snapshot/api/io/micronaut/http/uri/UriBuilder.html"><code>UriBuilder</code></a> methods <code>queryParam</code> and <code>replaceQueryParam</code> ignore null values.</p>
</li>
<li>
<p>It is possible to stop the Netty server without stopping the Application context.</p>
</li>
<li>
<p>You can declare beans at runtime using interfaces.</p>
</li>
<li>
<p>You can mark static methods as <code>@Executable</code>.</p>
</li>
<li>
<p>A big HTTP client refactor.</p>
</li>
</ul>
</div>
<div class="paragraph">
<p><strong>Spring integration improvements</strong></p>
</div>
<div class="ulist">
<ul>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-spring/latest/guide/">Micronaut Spring</a> contains improvements for developers who want to use Micronaut modules with a Spring application or consume Spring libraries from a Micronaut application.</p>
</li>
</ul>
</div>
<div class="paragraph">
<p><strong>New modules</strong>:</p>
</div>
<div class="ulist">
<ul>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-object-storage/latest/guide/">Object Storage</a>.</p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-crac/latest/guide/">Micronaut CRaC</a>.</p>
</li>
</ul>
</div>
<div class="paragraph">
<p>Please read the <a href="https://micronaut.io/2022/09/21/micronaut-framework-3-7-0-released/">Micronaut Framework 3.7.0 announcement blog post</a>. You will find a detailed overview of what’s new in Micronaut 3.7.0.</p>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_6_0">Micronaut Framework 3.6.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_3_6_0">What&#8217;s new with 3.6.0</h3>
<div class="paragraph">
<p>Key features:</p>
</div>
<div class="ulist">
<ul>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-test-resources/latest/guide/#introduction">Test Resources</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-sql/latest/guide/#hibernate-reactive">Hibernate Reactive</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-tracing/latest/guide/#opentelemetry">OpenTelemetry</a></p>
</li>
<li>
<p><a href="https://micronaut-projects.github.io/micronaut-azure/latest/guide/#azureKeyVault">Azure Vault</a></p>
</li>
<li>
<p><a href="https://www.graalvm.org/release-notes/22_2/">GraalVM 22.2 Support</a></p>
</li>
<li>
<p><a href="https://nubesgen.com/">NubesGen integration</a></p>
</li>
</ul>
</div>
<div class="paragraph">
<p>Please read the <a href="https://micronaut.io/2022/08/04/micronaut-framework-3-6-0-released/">Micronaut Framework 3.6.0 announcement blog post</a>. You will find a detailed overview of what’s new in Micronaut 3.6.0.</p>
</div>
<div class="paragraph">
<p>Micronaut Core features:</p>
</div>
<div class="sect3">
<h4 id="_dont_apply_a_filter_for_services">Don&#8217;t apply a @Filter for services</h4>
<div class="paragraph">
<p>It is possible to exclude services from an HTTP Client Filter with the member <code>excludeServiceId</code> of <code>@Filter.</code></p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">@Filter(patterns = '/**', excludeServiceId = 'authClient')
public class AppHttpClientFilter implements HttpClientFilter {</code></pre>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_netty_runtime">Netty runtime</h4>
<div class="paragraph">
<p>This version upgrades <a href="https://netty.io">Netty</a> from 4.1.77 to 4.1.79. Moreover, it contains improvements to the API to <a href="https://docs.micronaut.io/snapshot/guide/#nettyClientPipeline">configure the Netty Client Pipeline</a> and to <a href="https://docs.micronaut.io/snapshot/guide/#nettyServerPipeline">configure the Netty Server Pipeline</a>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_improvements_to_httpclientexception">Improvements to HttpClientException</h4>
<div class="paragraph">
<p>If present a <code>serviceId</code> field is populated in the <code>HttpClientException</code> and shown in the exception message.</p>
</div>
</div>
<div class="sect3">
<h4 id="_modules_upgrades">Modules Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Micronaut AWS 3.5.3 to 3.7.0</p>
</li>
<li>
<p>Micronaut Azure 3.2.3 to 3.3.0</p>
</li>
<li>
<p>Micronaut Cache 3.4.1 to 3.5.0</p>
</li>
<li>
<p>Micronaut Cassandra 4.0.0 to 5.1.1</p>
</li>
<li>
<p>Micronaut Coherence 3.4.1 to 3.5.1</p>
</li>
<li>
<p>Micronaut Data 3.4.3 to 3.7.2</p>
</li>
<li>
<p>Micronaut Elasticsearch 4.2.0 to 4.3.0</p>
</li>
<li>
<p>Micronaut Email 1.2.3 to 1.3.1</p>
</li>
<li>
<p>Micronaut Flyway 5.3.0 to 5.4.0</p>
</li>
<li>
<p>Micronaut GCP 4.2.1 to 4.4.0</p>
</li>
<li>
<p>Micronaut GraphQL 3.0.0 to 3.1.0</p>
</li>
<li>
<p>Micronaut Groovy 3.1.0 to 3.2.0</p>
</li>
<li>
<p>Micronaut JaxRS 3.3.0 to 3.4.0</p>
</li>
<li>
<p>Micronaut JMX 3.0.0 to 3.1.0</p>
</li>
<li>
<p>Micronaut Kafka 4.3.1 to 4.4.0</p>
</li>
<li>
<p>Micronaut Micrometer 4.3.0 to 4.4.0</p>
</li>
<li>
<p>Micronaut Microstream 1.0.0-M1 to 1.0.0</p>
</li>
<li>
<p>Micronaut Liquibase 5.3.0 to 5.4.1</p>
</li>
<li>
<p>Micronaut Mongo 4.2.0 to 4.4.0</p>
</li>
<li>
<p>Micronaut Neo4J 5.0.0 to 5.1.0</p>
</li>
<li>
<p>Micronaut Nats 3.0.0 to 3.1.0</p>
</li>
<li>
<p>Micronaut OpenAPI 4.2.2 to 4.4.3</p>
</li>
<li>
<p>Micronaut Picocli 4.2.1 to 4.3.0</p>
</li>
<li>
<p>Micronaut Problem 2.3.1 to 2.4.0</p>
</li>
<li>
<p>Micronaut RabbitMQ 3.1.0 to 3.3.0</p>
</li>
<li>
<p>Micronaut R2DBC 3.0.0 to 3.0.1</p>
</li>
<li>
<p>Micronaut Reactor 2.2.3 to 2.3.1</p>
</li>
<li>
<p>Micronaut Redis 5.2.0 to 5.3.0</p>
</li>
<li>
<p>Micronaut RxJava3 2.2.1 to 2.3.0</p>
</li>
<li>
<p>Micronaut Serialization 1.1.1 to 1.3.0</p>
</li>
<li>
<p>Micronaut Servlet 3.2.3 to 3.3.0</p>
</li>
<li>
<p>Micronaut Spring 4.1.1 to 4.2.1</p>
</li>
<li>
<p>Micronaut SQL 4.4.1 to 4.6.3</p>
</li>
<li>
<p>Micronaut Test 3.3.1 to 3.4.0</p>
</li>
<li>
<p>Micronaut TOML 1.0.0 to 1.1.1</p>
</li>
<li>
<p>Micronaut Tracing 4.1.1 to 4.2.1</p>
</li>
<li>
<p>Micronaut Views 3.4.0 to 3.5.0</p>
</li>
<li>
<p>Micronaut Jackson XML 3.0.1 to 3.1.0</p>
</li>
</ul>
</div>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_5_0">Micronaut Framework 3.5.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_3_5_0">What&#8217;s new with 3.5.0</h3>
<div class="sect3">
<h4 id="_graalvm_22_1_0">GraalVM 22.1.0</h4>
<div class="paragraph">
<p>Micronaut framework 3.5 supports <a href="https://www.graalvm.org/release-notes/22_1/">GraalVM 22.1.0</a>.</p>
</div>
<div class="paragraph">
<p><a href="https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/">Micronaut Gradle Plugin v3.4.0</a> and <a href="https://github.com/micronaut-projects/micronaut-maven-plugin/releases/tag/v3.3.0">Micronaut Maven Plugin v3.3.0</a> support GraalVM 22.1.0.</p>
</div>
</div>
<div class="sect3">
<h4 id="_incremental_compilation_for_gradle_builds">Incremental Compilation for Gradle Builds</h4>
<div class="paragraph">
<p>Micronaut framework 3.5 supports fully incremental compilation, including GraalVM metadata for Gradle Builds.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_data">Micronaut Data</h4>
<div class="paragraph">
<p><a href="https://github.com/micronaut-projects/micronaut-data/releases/tag/v3.4.0">Micronaut Data 3.4.0</a> supports:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>Postgres enums for JDBC.</p>
</li>
<li>
<p>Pagination for reactive repositories and specifications.</p>
</li>
<li>
<p>Pagination for async, coroutines repositories, and specifications.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_turbo_integration">Turbo Integration</h4>
<div class="paragraph">
<p>Micronaut Views adds <a href="https://micronaut-projects.github.io/micronaut-views/latest/guide/#turbo">integration with Turbo</a></p>
</div>
</div>
<div class="sect3">
<h4 id="_new_module_micronaut_microstream">New Module - Micronaut Microstream</h4>
<div class="paragraph">
<p><a href="https://micronaut-projects.github.io/micronaut-microstream/snapshot/guide/">Micronaut Microstream</a> eases working with <a href="https://microstream.one">MicroStream</a>, a native Java object graph storage engine.</p>
</div>
</div>
<div class="sect3">
<h4 id="_scheduled_with_time_zones">@Scheduled with Time Zones</h4>
<div class="paragraph">
<p>Optionally, you can specify a time zone when using the <a href="#scheduling"><code>@Scheduled</code> annotation</a>.</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">@Scheduled(cron = '1/33 0/1 * 1/1 * ?', zoneId = "America/Chicago")
void runCron() {
...
..</code></pre>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_support_validation_groups_with_validated">Support validation groups with <code>@Validated</code></h4>
<div class="paragraph">
<p>You can enforce a subset of constraints using <a href="#validationGroups">validation groups</a> using groups on the <code>@Validated</code>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_advanced_listener_configuration">Advanced Listener Configuration</h4>
<div class="paragraph">
<p>Micronaut framework 3.5.0 offers more flexibility in configuring the HTTP Server. Instead of configuring a single port, you
<a href="#listener">can specify each listener manually</a>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_ephemeral_factories">EPHEMERAL FACTORIES</h4>
<div class="paragraph">
<p>A <a href="#factories">Factory</a> has the default scope <code>@Singleton</code>, and it is destroyed with the context. Since Micronaut framework v3.5.0, you can dispose of the factory after producing a bean by annotating your factory class with <code>@Prototype</code> and <code>@Factory</code></p>
</div>
</div>
<div class="sect3">
<h4 id="_module_upgrades">Module upgrades</h4>
<div class="ulist">
<ul>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-test/releases/tag/v3.2.0">Micronaut Test 3.2.0</a> adds support for KoTest 5.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-aws/releases/tag/v3.5.0">Micronaut AWS 3.5.0</a> adds a new module <a href="https://micronaut-projects.github.io/micronaut-aws/latest/guide/#cdk">Micronaut AWS CDK</a>. It also upgrades to the latest versions of the AWS SDKs.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-micrometer/releases/tag/v4.3.0">Micronaut Micrometer 4.3.0</a> updates to Micrometer 1.9.0.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v4.2.0">Micronaut GCP 4.2.0</a> updates to <code>grpc-auth</code>
1.45.1 and <code>grpc-netty-shaded</code>. Moreover, we have clarified the documentation to support GraalVM Native Images when using the GCP libraries, and the Micronaut GCP Bom now includes the <code>com.google.cloud:native-image-support</code> dependency.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-aot/releases/tag/v1.1.0">Micronaut AOT 1.1.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-sql/releases/tag/v4.4.0">Micronaut SQL to 4.4.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-problem-json/releases/tag/v2.3.0">Micronaut Problem JSON to 2.3.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-grpc/releases/tag/v3.3.0">Micronaut GRPC to 3.3.0</a> allows exposing a gRPC Health Check for a grpc-server.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-serialization/releases/tag/v1.1.0">Micronaut Serialization to 1.1.0</a>. It allows the serialization and deserialization of object arrays.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-openapi/releases/tag/v4.1.0">Micronaut OpenAPI to 4.1.0</a> updates to Swagger 2.2.0.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-r2dbc/releases/tag/v3.0.0">Micronaut R2DBC to 3.0.0</a> updates to R2DBC <code>1.0.0.RELEASE</code>.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.6.0">Micronaut Security to 3.6.0</a>.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-cache/releases/tag/v3.4.1">Micronaut Cache to 3.4.1</a>.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-coherence/releases/tag/v3.4.1">Micronaut Coherence to 3.4.1</a>.</p>
</li>
</ul>
</div>
<div class="paragraph">
<p>Several modules publish a BOM (Bill of Materials) or use a  Gradle Version Catalogs:</p>
</div>
<div class="ulist">
<ul>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-jaxrs/releases/tag/v3.3.0">Micronaut JAX-RS to 3.3.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-picocli/releases/tag/v4.2.1">Micronaut Picocli to 4.2.1</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-acme/releases/tag/v3.2.0">Micronaut ACME to 3.2.0</a>.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-mongodb/releases/tag/v4.2.0">Micronaut MongoDB to 4.2.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-mqtt/releases/tag/v2.2.0">Micronaut MQTT to 2.2.0</a>.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-kafka/releases/tag/v4.3.0">Micronaut Kafka to 4.3.0</a>.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_schema_migration_modules">Schema Migration Modules</h4>
<div class="ulist">
<ul>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-flyway/releases/tag/v5.3.0">Micronaut Flyway 5.3.0</a> updates Flyway to 8.5.8.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-liquibase/releases/tag/v5.3.0">Micronaut Liquibase 5.3.0</a> updates Liquibase to 4.9.1</p>
</li>
</ul>
</div>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_4_0">Micronaut Framework 3.4.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_3_4_0">What&#8217;s new with 3.4.0</h3>
<div class="sect3">
<h4 id="_localized_message_source">Localized Message Source</h4>
<div class="paragraph">
<p>You can now inject <a href="#localizedMessageSource"><code>LocalizedMessageSource</code></a>, a <code>@RequestScope</code> bean, in your controllers to resolve localized messages for the current HTTP Request. It works in combination with <a href="#localeResolution">Micronaut Locale Resolution</a> capabilities.</p>
</div>
</div>
<div class="sect3">
<h4 id="_referencing_bean_properties_in_requires">Referencing bean properties in @Requires.</h4>
<div class="paragraph">
<p>With 3.4.0, you can <a href="https://docs.micronaut.io/latest/guide/#_referencing_bean_properties_in_requires">reference other beans properties in <code>@Requires</code> to load beans conditionally</a>.</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">@Requires(bean=Config.class, beanProperty="foo", value="John")</code></pre>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_data_mongodb">Micronaut Data MongoDB</h4>
<div class="paragraph">
<p><a href="https://github.com/micronaut-projects/micronaut-data/releases/tag/v3.3.0">Micronaut Data 3.3.0</a> includes <a href="https://micronaut-projects.github.io/micronaut-data/latest/guide/index.html#mongo">Micronaut Data MongoDB</a>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_aot_and_maven">Micronaut AOT and Maven</h4>
<div class="paragraph">
<p><a href="https://micronaut-projects.github.io/micronaut-aot/latest/guide/">Micronaut AOT</a> is now fully supported for Maven users. Enabling AOT is as simple as passing <code>-Dmicronaut.aot.enabled</code> when running, testing, or packaging your application.</p>
</div>
<div class="paragraph">
<p>For more details, check the <a href="https://micronaut-projects.github.io/micronaut-maven-plugin/latest/examples/aot.html">Micronaut Maven Plugin documentation</a>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_toml">Micronaut TOML</h4>
<div class="paragraph">
<p><a href="https://micronaut-projects.github.io/micronaut-toml/latest/guide/">Micronaut TOML</a> allows you to write your application configuration with <a href="https://toml.io/en/">TOML</a> in addition to <code>Properties</code>, <code>YAML</code>, <code>Groovy</code> or <code>Config4k</code>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_security">Micronaut Security</h4>
<div class="paragraph">
<p><a href="https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.4.0">Micronaut Security 3.4.1</a> responds with an error when an authenticated user visits a sensitive endpoint. This forces the developer to define how they want their application to behave in that scenario. Read the <a href="https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.4.0">release notes</a> and the <a href="https://micronaut-projects.github.io/micronaut-security/latest/guide/#builtInEndpointsAccess">documentation</a> to learn more.</p>
</div>
</div>
<div class="sect3">
<h4 id="_bom_modules">BOM Modules</h4>
<div class="paragraph">
<p>Several projects include a BOM (Bills of Materials) module:</p>
</div>
<div class="ulist">
<ul>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-azure/releases/tag/v3.1.0">Micronaut Azure 3.1.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-gcp/releases/tag/v4.1.0">Micronaut GCP 4.1.0</a>. It includes updates to the latest versions of Google Cloud dependencies.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-kotlin/releases/tag/v3.2.0">Micronaut Kotlin 3.2.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-mongodb/releases/tag/v4.1.0">Micronaut MongoDB 4.1.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-mqtt/releases/tag/v2.1.0">Micronaut MQTT 2.1.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-reactor/releases/tag/v2.2.1">Micronaut Reactor 2.2.1</a>. It includes updates to the Project Reactor dependencies.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-redis/releases/tag/v5.2.0">Micronaut Redis 5.2.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-rxjava2/releases/tag/v1.2.0">Micronaut RxJava2 1.2.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-rxjava3/releases/tag/v2.2.0">Micronaut RxJava3 2.2.0</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-security/releases/tag/v3.4.0">Micronaut Security 3.4.1</a></p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-servlet/releases/tag/v3.2.0">Micronaut Servlet 3.2.0</a>. It includes updates to Tomcat and Undertow dependencies.</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_other_module_upgrades">Other Module Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-aws/releases/tag/v3.2.0">Micronaut AWS 3.2.0</a> updates to the latest version of AWS SDK, ASK SDK and AWS Serverless Java Container.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-email/releases/tag/v1.1.0">Micronaut Email 1.1.0</a> updates to the Sendgrid 4.8.3 and contains improvements for <code>javamail</code> module users.</p>
</li>
<li>
<p><a href="https://github.com/micronaut-projects/micronaut-test/releases/tag/v3.1.0">Micronaut Test 3.1.0</a> updates the underlying testing dependencies.</p>
</li>
</ul>
</div>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_3_0">Micronaut Framework 3.3.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_3_3_0">What&#8217;s new with 3.3.0</h3>
<div class="sect3">
<h4 id="_graalvm_22_0_0_2">GraalVM 22.0.0.2</h4>
<div class="paragraph">
<p>Micronaut now supports the latest GraalVM 22.0.0.2 release.</p>
</div>
</div>
<div class="sect3">
<h4 id="_environment_endpoint">Environment Endpoint</h4>
<div class="paragraph">
<p>A new API api:management.endpoint.env.EnvironmentEndpointFilter[] has been created to allow applications to customize which keys should have their values masked and which keys should not have their values masked. See the <a href="#environmentEndpoint">documentation</a> for full details.</p>
</div>
</div>
<div class="sect3">
<h4 id="_aop_interceptor_binding">AOP Interceptor Binding</h4>
<div class="paragraph">
<p>When binding an AOP annotation to an interceptor, only the presence of the annotation is used to determine if the interceptor should be applied. Now it&#8217;s possible to also bind based on the values of the annotation. To enable this feature, set the <code>bindMembers</code> member of the ann:aop.InterceptorBinding[] annotation to <code>true</code>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_netty_buffer_allocation">Netty Buffer Allocation</h4>
<div class="paragraph">
<p>It is now possible to configure the default Netty buffer allocator. See the <a href="https://docs.micronaut.io/3.3.x/guide/configurationreference.html#io.micronaut.buffer.netty.DefaultByteBufAllocatorConfiguration">configuration reference</a>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_improved_flexibility_in_class_style">Improved Flexibility in Class Style</h4>
<div class="paragraph">
<p>Many features of the Micronaut framework rely on the convention of getters and setters. Due to things like records and builders, the method names we look for are now configurable with the ann:core.annotation.AccessorsStyle[] annotation. For example, the annotation can be placed on ann:context.annotation.ConfigurationProperties[] beans to allow for binding configuration to methods that do not begin with <code>set</code>. It can also be used with classes annotated with ann:core.annotation.Introspected[].</p>
</div>
</div>
<div class="sect3">
<h4 id="_access_log_exclusions">Access Log Exclusions</h4>
<div class="paragraph">
<p>The Netty access logger now supports excluding requests based on a set of regular expression patterns that match against the URI. See the <a href="#accessLogger">AccessLogger documentation</a>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_new_serializationdeserialization_module">New Serialization/Deserialization Module</h4>
<div class="paragraph">
<p><a href="https://micronaut-projects.github.io/micronaut-serialization/1.0.x/guide/">Micronaut Serialization</a> is a new module created as an alternative to Jackson. It supports serializing and deserializing Java types (including Java 17 records) to and from JSON and other formats.</p>
</div>
<div class="paragraph">
<p>Users now have the choice of an alternative implementation that&#8217;s largely compatible with existing Jackson annotations but contains many benefits, including the elimination of reflection, compile-time validation, greater security because only explicit types are serializable, and reduction of native image build sizes, build times, and memory usage.</p>
</div>
</div>
<div class="sect3">
<h4 id="_new_email_module">New Email Module</h4>
<div class="paragraph">
<p><a href="https://micronaut-projects.github.io/micronaut-email/latest/guide/">Micronaut Email</a> is a new module to ease sending emails from a Micronaut application. It provides integration with transactional email providers such as Amazon Simple Email Service, Postmark, Mailjet or SendGrid.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_aot">Micronaut AOT</h4>
<div class="paragraph">
<p>During this minor cycle, we released a milestone release of a new module Micronaut AOT. You can use Micronaut AOT and use the build-time optimizations provided by the module to achieve faster startup times via the Micronaut Gradle Plugin. Please, read more about it in the <a href="https://micronaut.io/2021/12/20/micronaut-aot-build-time-optimizations-for-micronaut-applications/">announcement blog post</a>.</p>
</div>
</div>
<div class="sect3">
<h4 id="_micronaut_kubernetes_3_3_0">Micronaut Kubernetes 3.3.0</h4>
<div class="paragraph">
<p>Micronaut Kubernetes 3.3 adds support to easily create the Kubernetes Operator. The Kubernetes Operator is a known pattern used to extend the capabilities of Kubernetes by creating application specific controllers for both native and custom resources. See more on <a href="https://micronaut-projects.github.io/micronaut-kubernetes/latest/guide/#kubernetes-operator">Kubernetes Operator</a>.</p>
</div>
<div class="paragraph">
<p>The version of Micronaut Kubernetes 3.3.0 also adds new Kubernetes reactive client for RxJava3.</p>
</div>
</div>
<div class="sect3">
<h4 id="_other_module_upgrades_2">Other Module Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Micronaut Cache 3.1.0</p>
</li>
<li>
<p>Micronaut Discovery Client 3.1.0</p>
</li>
<li>
<p>Micronaut Elasticsearch 4.2.0</p>
</li>
<li>
<p>Micronaut Flyway 5.1.1</p>
</li>
<li>
<p>Micronaut Kafka 4.1.1</p>
</li>
<li>
<p>Micronaut Kotlin 3.1.0</p>
</li>
<li>
<p>Micronaut Liquibase 5.1.1</p>
</li>
<li>
<p>Micronaut Openapi 4.0.0</p>
</li>
<li>
<p>Micronaut Picocli 4.1.0</p>
</li>
<li>
<p>Micronaut Problem 2.2.0</p>
</li>
<li>
<p>Micronaut Security 3.3.0</p>
</li>
<li>
<p>Micronaut Sql 4.1.1</p>
</li>
<li>
<p>Micronaut Toml 1.0.0-M2</p>
</li>
<li>
<p>Micronaut Views 3.1.2</p>
</li>
</ul>
</div>
</div>
<div class="sect3">
<h4 id="_other_dependency_upgrades">Other Dependency Upgrades</h4>
<div class="ulist">
<ul>
<li>
<p>Apache Commons DBCP 2.9.0</p>
</li>
<li>
<p>Elasticsearch 7.16.3</p>
</li>
<li>
<p>Flyway 8.4.2</p>
</li>
<li>
<p>Hibernate 5.5.9.Final</p>
</li>
<li>
<p>Kotlin 1.6.10</p>
</li>
<li>
<p>Liquibase 4.7.1</p>
</li>
<li>
<p>Logback 1.2.10</p>
</li>
<li>
<p>Swagger 2.1.12</p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_3_3_0_breaking_changes">3.3.0 Breaking Changes</h3>
<div class="ulist">
<ul>
<li>
<p>The <a href="#environmentEndpoint">environmental endpoint</a> is now disabled by default. To enable it, you must update your endpoint config:</p>
</li>
</ul>
</div>
<div class="listingblock">
<div class="content">
<pre>endpoints:
  env:
    enabled: true</pre>
</div>
</div>
<div class="paragraph">
<p>This will then be available, but mask all values.  To restore the previous functionality, you can add a bean that implements api:management.endpoint.env.EnvironmentEndpointFilter[]:</p>
</div>
<div class="listingblock">
<div class="title">Legacy Environment Filtering Bean</div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">@Singleton
public class LegacyEnvEndpointFilter implements EnvironmentEndpointFilter {
    @Override
    public void specifyFiltering(@NotNull EnvironmentFilterSpecification specification) {
        specification.legacyMasking();
    }
}</code></pre>
</div>
</div>
<div class="paragraph">
<p>See the <a href="#environmentEndpoint">documentation</a> for more filtering options.</p>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_2_4">Micronaut Framework 3.2.4</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_3_2_4_breaking_changes">3.2.4 Breaking Changes</h3>
<div class="ulist">
<ul>
<li>
<p>The <a href="{api}/io/micronaut/http/client/ProxyHttpClient.html">ProxyHttpClient</a> now sends the Host header of the proxied service <a href="https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.23">as per the RFC</a>, instead of the originating service.</p>
</li>
</ul>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_2_0">Micronaut Framework 3.2.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_3_2_0">What&#8217;s new with 3.2.0</h3>
<div class="sect3">
<h4 id="_graalvm_21_3_0">GraalVM 21.3.0</h4>
<div class="paragraph">
<p>Micronaut has been updated to support the latest GraalVM 21.3.0 release. Please keep in mind that, starting with 21.3.0, GraalVM no longer releases a version based on JDK 8. If you still use Java 8, use the GraalVM JDK 11 distribution.</p>
</div>
<div class="paragraph">
<p>The official GraalVM Maven plugin has new GAV coordinates so if you have declared it in your <code>pom.xml</code> update the coordinates to:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="xml" class="language-xml hljs">&lt;plugin&gt;
    &lt;groupId&gt;org.graalvm.buildtools&lt;/groupId&gt;
    &lt;artifactId&gt;native-maven-plugin&lt;/artifactId&gt;
...
&lt;/plugin&gt;</code></pre>
</div>
</div>
<div class="paragraph">
<p>Please check <a href="https://graalvm.github.io/native-build-tools/0.9.7.1/maven-plugin.html">the official documentation</a> about how to customize the plugin.</p>
</div>
</div>
<div class="sect3">
<h4 id="_gradle_plugin_3_0_0">Gradle Plugin 3.0.0</h4>
<div class="paragraph">
<p>A new major version of the Gradle plugin has been released, including internal changes to use Gradle&#8217;s lazy configuration APIs.
In the process, <a href="https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/">documentation</a> has been rewritten.</p>
</div>
<div class="paragraph">
<p>Support for GraalVM now delegates to <a href="https://graalvm.github.io/native-build-tools/0.9.7.1/gradle-plugin.html">the official GraalVM plugin</a>.
We recommend to upgrade in order to get the latest bugfixes, but this constitutes a breaking change for some users:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>the <code>nativeImage</code> task is now replaced with <code>nativeCompile</code></p>
</li>
<li>
<p>native image configuration happens in the <code>graalvmNative</code> DSL extension instead of the <code>nativeCompile</code> task</p>
</li>
<li>
<p>native image building makes use of Gradle&#8217;s toolchain support. Please refer to the <a href="https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/">documentation</a> for help.</p>
</li>
</ul>
</div>
<div class="admonitionblock note">
<table>
<tr>
<td class="icon">
<div class="title">Note</div>
</td>
<td class="content">
You can still build existing applications or libraries using the 2.x version of the Gradle plugin. Documentation for this version can be found <a href="https://github.com/micronaut-projects/micronaut-gradle-plugin/blob/2.0.x/README.md">here</a>.
</td>
</tr>
</table>
</div>
</div>
<div class="sect3">
<h4 id="_kotlin_1_6_0">Kotlin 1.6.0</h4>
<div class="paragraph">
<p>Micronaut 3.2.0 includes support for Kotlin 1.6.0.</p>
</div>
</div>
<div class="sect3">
<h4 id="_http_features">HTTP Features</h4>
<div class="sect4">
<h5 id="_websocket_ping_api">WebSocket Ping API</h5>
<div class="paragraph">
<p>WebSocket ann:websocket.annotation.OnMessage[] methods can now accept a api:websocket.WebSocketPongMessage[] parameter that will receive a WebSocket pong sent as a response to a ping submitted using the new <code>sendPingAsync</code> method on api:websocket.WebSocketSession[].</p>
</div>
</div>
<div class="sect4">
<h5 id="_http2_server_push">HTTP2 Server Push</h5>
<div class="paragraph">
<p>It is now possible to send resources, e.g. stylesheets required by a HTML page, to the client alongside the request for the page using the HTTP2 server push protocol. See the <a href="#http2Server">HTTP/2 documentation</a> for information on how to use this feature.</p>
</div>
</div>
<div class="sect4">
<h5 id="_jsonview_on_request_bodies">JsonView on request bodies</h5>
<div class="paragraph">
<p>You can now specify the Jackson <code>@JsonView</code> annotation on <code>@Body</code> parameters to controller methods.</p>
</div>
</div>
<div class="sect4">
<h5 id="_websocket_wswss_protocol_support">WebSocket ws/wss protocol support</h5>
<div class="paragraph">
<p>The WebSocket clients now support the ws/wss protocol. To implement this change, the api:websocket.WebSocketClient[] <code>create</code> methods now take a <code>URI</code> instead of a <code>URL</code>. The <code>URL</code> methods have been deprecated.</p>
</div>
<div class="paragraph">
<p>Note: Should you be calling <code>WebSocketClient.create(null)</code>, the method call is now ambiguous. Insert a cast in that case: <code>WebSocketClient.create((URI) null)</code></p>
</div>
</div>
<div class="sect4">
<h5 id="_ssl_handshake_timeout_configuration">SSL handshake timeout configuration</h5>
<div class="paragraph">
<p>The SSL handshake timeout can now be configured using the <code>micronaut.ssl.handshakeTimeout</code> and <code>micronaut.http.client.ssl.handshakeTimeout</code> configurations for the server and client respectively.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_module_upgrades_2">Module Upgrades</h4>
<div class="sect4">
<h5 id="_micronaut_data_3_2_0">Micronaut Data 3.2.0</h5>
<div class="ulist">
<ul>
<li>
<p>Repositories with JPA Criteria API specification for Micronaut JDBC/R2DBC</p>
</li>
<li>
<p>Expandable query parameters optimizations</p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_reactive_modules">Reactive Modules</h5>
<div class="ulist">
<ul>
<li>
<p>The RxJava2, RxJava3, and Reactor modules have been updated with the equivalent static <code>create</code> methods on their core counterparts.</p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_micrometer_4_1_0">Micronaut Micrometer 4.1.0</h5>
<div class="ulist">
<ul>
<li>
<p>Adds support for metrics with gRPC</p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_security_3_2_0">Micronaut Security 3.2.0</h5>
<div class="ulist">
<ul>
<li>
<p>The way JSON Web Key Sets are being cached has been greatly improved for scenarios where there are multiple key sets.</p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_other_module_upgrades_3">Other Module Upgrades</h5>
<div class="ulist">
<ul>
<li>
<p>Elasticsearch 7.15.2</p>
</li>
<li>
<p>Flyway 8.0.2</p>
</li>
<li>
<p>gRPC 1.39.0</p>
</li>
<li>
<p>Liquibase 4.6.1</p>
</li>
<li>
<p>Micronaut Elasticsearch 4.0.0</p>
</li>
<li>
<p>Micronaut Flyway 5.0.0</p>
</li>
<li>
<p>Micronaut gRPC 3.1.1</p>
</li>
<li>
<p>Micronaut Liquibase 5.0.0</p>
</li>
<li>
<p>Micronaut OpenAPI 3.2.0</p>
</li>
<li>
<p>Micronaut Redis 5.1.0</p>
</li>
<li>
<p>Testcontainers 1.16.1</p>
</li>
</ul>
</div>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_3_2_0_breaking_changes">3.2.0 Breaking Changes</h3>
<div class="ulist">
<ul>
<li>
<p>The HTTP client now does SSL certificate verification by default. The old insecure behavior can be re-enabled by setting the <code>micronaut.http.client.ssl.insecureTrustAllCertificates</code> property to <code>true</code>, but consider using a trust store instead if you&#8217;re using self-signed certificates.</p>
</li>
<li>
<p>Maven GraalVM Native Image plugin has new GAV coordinates. If you have declared it in your <code>pom.xml</code> please update the coordinates to:</p>
</li>
</ul>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="xml" class="language-xml hljs">&lt;plugin&gt;
    &lt;groupId&gt;org.graalvm.buildtools&lt;/groupId&gt;
    &lt;artifactId&gt;native-maven-plugin&lt;/artifactId&gt;
...
&lt;/plugin&gt;</code></pre>
</div>
</div>
<div class="ulist">
<ul>
<li>
<p><code>WebSocketClient.create</code> has been modified to accept a <code>URI</code> parameter instead of <code>URL</code>. The old <code>URL</code> methods still exist, but when called with <code>null</code> like <code>WebSocketClient.create(null)</code>, the method call is now ambiguous. Please insert a cast to <code>URI</code>: <code>WebSocketClient.create((URI) null)</code>.
The same applies for the <code>create</code> method that accepts an additional <code>HttpClientConfiguration</code> parameter.</p>
</li>
</ul>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_1_0">Micronaut Framework 3.1.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_whats_new_with_3_1_0">What&#8217;s new with 3.1.0</h3>
<div class="sect3">
<h4 id="_core_features">Core Features</h4>
<div class="sect4">
<h5 id="_primitive_beans">Primitive Beans</h5>
<div class="paragraph">
<p><a href="#factories">Factory Beans</a> can now create beans that are primitive types or primitive array types.</p>
</div>
<div class="paragraph">
<p>See the section on <a href="#factories">Primitive Beans and Arrays</a> in the documentation for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_repeatable_qualifiers">Repeatable Qualifiers</h5>
<div class="paragraph">
<p><a href="#qualifiers">Qualifiers</a> can now be repeatable (an annotation annotated with <code>java.lang.annotation.Repeatable</code>) allowing narrowing bean resolution by a complete or partial match of the qualifiers declared on the injection point.</p>
</div>
</div>
<div class="sect4">
<h5 id="_injectscope">InjectScope</h5>
<div class="paragraph">
<p>A new ann:context.annotation.InjectScope[] annotation has been added which destroys any beans with no defined scope and injected into a method or constructor annotated with <code>@Inject</code> after the method or constructor completes.</p>
</div>
</div>
<div class="sect4">
<h5 id="_more_build_time_optimizations">More Build Time Optimizations</h5>
<div class="paragraph">
<p>Further build time metadata optimizations have been added included reducing the number and size of the classes generated to support <a href="#introspection">Bean Introspection</a> and including knowledge of repeatable annotations in generated metadata avoiding further reflective calls and optimizing Micronaut&#8217;s memory usage, in particular with GraalVM.</p>
</div>
</div>
<div class="sect4">
<h5 id="_improvements_to_context_propagation">Improvements to Context Propagation</h5>
<div class="paragraph">
<p>Support for <a href="#context">Reactive context propagation</a> has been further improved by inclusion of request context information in the <a href="https://projectreactor.io/docs/core/release/reference/#context">Reactor context</a> and <a href="#kotlinContextPropagation">documentation on how to effectively propagate the context across reactive flows</a> when using Kotlin coroutines.</p>
</div>
</div>
<div class="sect4">
<h5 id="_improvements_to_the_element_api">Improvements to the Element API</h5>
<div class="paragraph">
<p>The build-time api:inject.ast.Element[] API has been improved in a number of ways:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>New methods were added to the api:inject.ast.MethodElement[] API to resolve the retriever type and throws declaration</p>
</li>
<li>
<p>A new experimental API has been added to the api:inject.ast.ClassElement[] API  to resolve generic placeholders and resolve the generic bound to the element</p>
</li>
</ul>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_http_features_2">HTTP Features</h4>
<div class="sect4">
<h5 id="_filter_by_regex">Filter By Regex</h5>
<div class="paragraph">
<p>HTTP filters now support matching URLs by a regular expression. Set the <code>patternStyle</code> member of the annotation to <code>REGEX</code> and the value will be treated as a regular expression.</p>
</div>
</div>
<div class="sect4">
<h5 id="_random_port_binding">Random Port Binding</h5>
<div class="paragraph">
<p>The way the server binds to random ports has improved and should result in fewer port binding exceptions in tests.</p>
</div>
</div>
<div class="sect4">
<h5 id="_client_data_formatting">Client Data Formatting</h5>
<div class="paragraph">
<p>The ann:core.convert.format.Format[] annotation now supports several new values that can be used in conjunction with the declarative HTTP client to support formatting data in several new ways. See the <a href="#clientParameters">client parameters</a> documentation for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_streamingfileupload">StreamingFileUpload</h5>
<div class="paragraph">
<p>The api:http.multipart.StreamingFileUpload[] API has been improved to support streaming directly to an output stream. As with the other <code>transferTo</code> methods, the write to the stream is offloaded to the IO pool automatically.</p>
</div>
</div>
<div class="sect4">
<h5 id="_server_ssl_configuration">Server SSL Configuration</h5>
<div class="paragraph">
<p>The SSL configuration for the Netty server now responds to refresh events. This allows for swapping out certificates without having to restart the server. See the <a href="#https">https documentation</a> for information on how to trigger the refresh.</p>
</div>
</div>
<div class="sect4">
<h5 id="_new_netty_server_api">New Netty Server API</h5>
<div class="paragraph">
<p>If you wish to programmatically start additional Netty servers on different ports with potentially different configurations, new APIs have been added to do so including a new api:http.server.netty.NettyEmbeddedServerFactory[] interface.</p>
</div>
<div class="paragraph">
<p>See the documentation on <a href="#secondaryServers">Starting Secondary Servers</a> for more information.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_deprecations">Deprecations</h4>
<div class="paragraph">
<p>The <code>netty.responses.file.*</code> configuration is deprecated in favor of <code>micronaut.server.netty.responses.file.*</code>. The old configuration key will be removed in the next major version of the framework.</p>
</div>
</div>
<div class="sect3">
<h4 id="_module_upgrades_3">Module Upgrades</h4>
<div class="sect4">
<h5 id="_micronaut_data_3_1_0">Micronaut Data 3.1.0</h5>
<div class="ulist">
<ul>
<li>
<p>Kotlin&#8217;s coroutines support. New repository interface <code>CoroutineCrudRepository</code>.</p>
</li>
<li>
<p>Support for <code>AttributeConverter</code></p>
</li>
<li>
<p>R2DBC upgraded to <code>Arabba-SR11</code></p>
</li>
<li>
<p>JPA Criteria specifications</p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_jax_rs_3_1">Micronaut JAX-RS 3.1</h5>
<div class="paragraph">
<p>The <a href="https://micronaut-projects.github.io/micronaut-jaxrs/latest/guide/">JAX-RS module</a> now integrated with Micronaut Security allowing binding of the JAX-RS <code>SecurityContext</code></p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_kubernetes_3_1_0">Micronaut Kubernetes 3.1.0</h5>
<div class="paragraph">
<p>Micronaut Kubernetes 3.1 introduces new annotation <a href="https://micronaut-projects.github.io/micronaut-kubernetes/latest/api/io/micronaut/kubernetes/client/informer/Informer.html">@Informer</a>. By using the annotation on the <a href="https://javadoc.io/doc/io.kubernetes/client-java/latest/io/kubernetes/client/informer/ResourceEventHandler.html">ResourceEventHandler</a> the Micronaut will instantiate the <a href="https://javadoc.io/doc/io.kubernetes/client-java/latest/io/kubernetes/client/informer/SharedIndexInformer.html">SharedInformer</a> from the official <a href="https://github.com/kubernetes-client/java">Kubernetes Java SDK</a>. Then you only need to take care of handling the changes of the watched Kubernetes resource. See more on <a href="https://micronaut-projects.github.io/micronaut-kubernetes/latest/guide/#kubernetes-informer">Kubernetes Informer</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_oracle_coherence_3_0_0">Micronaut Oracle Coherence 3.0.0</h5>
<div class="paragraph">
<p>The <a href="https://micronaut-projects.github.io/micronaut-coherence/latest/guide/">Micronaut Oracle Coherence</a> module is now out of preview status and includes broad integration with Oracle Coherence including support for caching, messaging and Micronaut Data.</p>
</div>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_3_1_0_breaking_changes">3.1.0 Breaking Changes</h3>
<div class="paragraph">
<p>Retrieving the port from the Netty embedded server is no longer supported if the server is configured to bind to a random port and the server has not been started.</p>
</div>
</div>
</div>
</div>
<div class="sect1">
<h2 id="_micronaut_framework_3_0_0">Micronaut Framework 3.0.0</h2>
<div class="sectionbody">
<div class="sect2">
<h3 id="_upgrading_from_micronaut_framework_2_0_to_3_0">Upgrading from Micronaut Framework 2.0 to 3.0</h3>
<div class="paragraph">
<p>This section covers the steps required to upgrade a Micronaut framework 2.x application to Micronaut framework 3.0.0.</p>
</div>
<div class="paragraph">
<p>The sections below go into more detail, but at a high level the process generally involves:</p>
</div>
<div class="ulist">
<ul>
<li>
<p>updating versions</p>
</li>
<li>
<p>updating annotations</p>
</li>
<li>
<p>choosing a Reactive implementation</p>
</li>
<li>
<p>adjusting code affected by breaking changes</p>
</li>
</ul>
</div>
<div class="paragraph">
<p>Typically, upgrading should be straightforward, but it&#8217;s possible to save yourself some work with <a href="https://docs.openrewrite.org/" target="_blank" rel="noopener">OpenRewrite</a>, an automated refactoring tool that you can use to make many of the required upgrade changes.</p>
</div>
<div class="sect3">
<h4 id="_automating_upgrades_with_openrewrite">Automating Upgrades with OpenRewrite</h4>
<div class="paragraph">
<p>OpenRewrite works with Micronaut applications written in Java, but OpenRewrite doesn&#8217;t currently support Kotlin or Groovy.
Like any automated tool, it does much of the work for you, but be sure to review the resulting changes and manually make any changes that aren&#8217;t supported by OpenRewrite, for example converting from RxJava2 to Reactor.</p>
</div>
<div class="admonitionblock note">
<table>
<tr>
<td class="icon">
<div class="title">Note</div>
</td>
<td class="content">
If you will be using OpenRewrite, don&#8217;t make any upgrade changes yet that would cause your application not to compile, for example updating the Micronaut version to 3.x.
This would cause application classes that use <code>javax.inject</code> annotations like <code>@Singleton</code> or RxJava2 classes like <code>io.reactivex.Flowable</code> to not compile since those dependencies are no longer included by default.
Instead, use OpenRewrite to do the initial work and just do the steps yourself that aren&#8217;t possible or practical to automate.
</td>
</tr>
</table>
</div>
<div class="paragraph">
<p>Adding OpenRewrite support to your build is easy, it just requires adding the Gradle or Maven plugin and configuring the plugin to use the Micronaut upgrade recipe.</p>
</div>
<div class="paragraph">
<p>See the <a href="https://micronaut.io/launch?features=openrewrite&amp;lang=JAVA&amp;build=GRADLE&amp;activity=diff" target="_blank" rel="noopener">Gradle feature diff</a> or the <a href="https://micronaut.io/launch?features=openrewrite&amp;lang=JAVA&amp;build=MAVEN&amp;activity=diff" target="_blank" rel="noopener">Maven feature diff</a> to see the required build script changes.</p>
</div>
<div class="paragraph">
<p>Once you&#8217;ve made the build script changes, you can "dry-run" the Micronaut upgrade recipe to see what changes would be made.</p>
</div>
<div class="paragraph">
<p>For Gradle, run</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ ./gradlew rewriteDryRun</code></pre>
</div>
</div>
<div class="paragraph">
<p>and view the diff report generated in <code>build/reports/rewrite/rewrite.patch</code></p>
</div>
<div class="paragraph">
<p>and for Maven, run</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ ./mvnw rewrite:dryRun</code></pre>
</div>
</div>
<div class="paragraph">
<p>and view the diff report generated in <code>target/site/rewrite/rewrite.patch</code>.</p>
</div>
<div class="paragraph">
<p>Then you can run the recipe for real, letting OpenRewrite update your code.</p>
</div>
<div class="paragraph">
<p>For Gradle, run</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ ./gradlew rewriteRun</code></pre>
</div>
</div>
<div class="paragraph">
<p>and for Maven, run</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ ./mvnw rewrite:run</code></pre>
</div>
</div>
<div class="paragraph">
<p>Once the changes have been made, you could remove the plugin, but it&#8217;s fine to leave it since OpenRewrite doesn&#8217;t run automatically, only when you run one of its commands.
And there are many more recipes available beyond the Micronaut upgrade recipe that you might want to include to automate other code changes.</p>
</div>
<div class="paragraph">
<p>The plugin includes another command to list all recipes currently in the classpath (in this case the core recipes plus those added by the <code>rewrite-micronaut</code> module).</p>
</div>
<div class="paragraph">
<p>For Gradle, run</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ ./gradlew rewriteDiscover</code></pre>
</div>
</div>
<div class="paragraph">
<p>and for Maven, run</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="bash" class="language-bash hljs">$ ./mvnw rewrite:discover</code></pre>
</div>
</div>
<div class="paragraph">
<p>and the available recipes and styles will be output to the console. Check out the <a href="https://docs.openrewrite.org/">OpenRewrite documentation</a> for more information and to see the many other available recipes available.</p>
</div>
</div>
<div class="sect3">
<h4 id="_version_update">Version Update</h4>
<div class="paragraph">
<p>If you use Gradle, update the <code>micronautVersion</code> property in <code>gradle.properties</code>, e.g.</p>
</div>
<div class="listingblock">
<div class="title">gradle.properties</div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="properties" class="language-properties hljs">micronautVersion={version}</code></pre>
</div>
</div>
<div class="paragraph">
<p>If you use Maven, update the parent POM version and <code>micronaut.version</code> property in <code>pom.xml</code>, e.g.</p>
</div>
<div class="listingblock">
<div class="title">pom.xml</div>
<div class="content">
<pre class="highlightjs highlight"><code data-lang="xml" class="language-xml hljs">&lt;parent&gt;
  &lt;groupId&gt;io.micronaut&lt;/groupId&gt;
  &lt;artifactId&gt;micronaut-parent&lt;/artifactId&gt;
  &lt;version&gt;{version}&lt;/version&gt;
&lt;/parent&gt;

&lt;properties&gt;
  ...
  &lt;micronaut.version&gt;{version}&lt;/micronaut.version&gt;
  ...
&lt;/properties&gt;</code></pre>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_build_plugin_update">Build Plugin Update</h4>
<div class="paragraph">
<p>If you use the <a href="https://micronaut-projects.github.io/micronaut-gradle-plugin/latest/">Micronaut Gradle plugin</a> update to the <a href="https://github.com/micronaut-projects/micronaut-gradle-plugin/releases/latest">latest version</a>.</p>
</div>
<div class="paragraph">
<p>For Maven users the plugin version is updated automatically when you update the Micronaut version.</p>
</div>
</div>
<div class="sect3">
<h4 id="_inject_annotations">Inject Annotations</h4>
<div class="paragraph">
<p>The <code>javax.inject</code> annotations are no longer a transitive dependency. The Micronaut framework now ships with the Jakarta inject annotations. Either replace all <code>javax.inject</code> imports with <code>jakarta.inject</code>, or add a dependency on <code>javax-inject</code> to continue using the older annotations:</p>
</div>
<div class="paragraph">
<p>dependency:javax.inject:javax.inject:1[]</p>
</div>
<div class="paragraph">
<p>Any code that relied on the <code>javax.inject</code> annotations being present in the annotation metadata will still work as expected, however any code that interacts with them must be changed to no longer reference the annotation classes themselves. Static variables in the <a href="{api}/io/micronaut/core/annotation/AnnotationUtil.html">AnnotationUtil</a> class (e.g. <code>AnnotationUtil.INJECT</code>, <code>AnnotationUtil.SINGLETON</code>, etc.) should be used in place of the annotation classes when working with annotation metadata.</p>
</div>
</div>
<div class="sect3">
<h4 id="_nullability_annotations">Nullability Annotations</h4>
<div class="paragraph">
<p>The Micronaut framework now only comes with its own set of annotations to declare nullability. The findbugs, javax, and jetbrains annotations are all still supported, however you must add a dependency to use them. Either switch to the Micronaut ann:core.annotation.Nullable[] / ann:core.annotation.NonNull[] annotations or add a dependency for the annotation library you wish to use.</p>
</div>
</div>
<div class="sect3">
<h4 id="_rxjava2">RxJava2</h4>
<div class="paragraph">
<p>The Micronaut framework no longer ships any reactive implementation as a default in any of our modules or core libraries. Upgrading to Micronaut 3 requires choosing which reactive streams implementation to use, and then adding the relevant dependency.</p>
</div>
<div class="paragraph">
<p>For those already using RxJava3 or Project Reactor, there should be no changes required to upgrade to the Micronaut framework 3. If you use RxJava2 and wish to continue using it, you must add a dependency:</p>
</div>
<div class="paragraph">
<p>dependency:io.micronaut.rxjava2:micronaut-rxjava2[gradleScope="implementation"]</p>
</div>
<div class="paragraph">
<p>In addition, if any of the <code>Rx</code> HTTP client interfaces were used, a dependency must be added and the imports must be updated.</p>
</div>
<div class="paragraph">
<p>dependency:io.micronaut.rxjava2:micronaut-rxjava2-http-client[gradleScope="implementation"]</p>
</div>
<table class="tableblock frame-all grid-all stretch">
<caption class="title">Table 1. RxJava2 HTTP Client Imports</caption>
<colgroup>
<col style="width: 50%;">
<col style="width: 50%;">
</colgroup>
<thead>
<tr>
<th class="tableblock halign-left valign-top">Old</th>
<th class="tableblock halign-left valign-top">New</th>
</tr>
</thead>
<tbody>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.http.client.RxHttpClient</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.rxjava2.http.client.RxHttpClient</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.http.client.RxProxyHttpClient</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.rxjava2.http.client.proxy.RxProxyHttpClient</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.http.client.RxStreamingHttpClient</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.rxjava2.http.client.RxStreamingHttpClient</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.http.client.sse.RxSseClient</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.rxjava2.http.client.sse.RxSseClient</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.websocket.RxWebSocketClient</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">io.micronaut.rxjava2.http.client.websockets.RxWebSocketClient</p></td>
</tr>
</tbody>
</table>
<div class="paragraph">
<p>If the Netty based server implementation is being used, an additional dependency must be added:</p>
</div>
<div class="paragraph">
<p>dependency:io.micronaut.rxjava2:micronaut-rxjava2-http-server-netty[gradleScope="implementation"]</p>
</div>
<div class="admonitionblock note">
<table>
<tr>
<td class="icon">
<div class="title">Note</div>
</td>
<td class="content">
We recommend switching to Project Reactor as that is the implementation used internally by Micronaut. Adding a dependency to RxJava2 will result in both implementations in the runtime classpath of your application.
</td>
</tr>
</table>
</div>
</div>
<div class="sect3">
<h4 id="_environment_endpoint_2">Environment endpoint</h4>
<div class="paragraph">
<p>As of 3.3.0, the <a href="#environmentEndpoint">environmental endpoint</a> is now disabled by default, please see the <a href="#breaks">breaking changes</a> for how to restore functionality.</p>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_whats_new_with_3_0_0">What&#8217;s new with 3.0.0</h3>
<div class="sect3">
<h4 id="_core_features_2">Core Features</h4>
<div class="sect4">
<h5 id="_optimized_build_time_metadata">Optimized Build-Time Metadata</h5>
<div class="paragraph">
<p>Micronaut 3.0 introduces a new build time metadata format that is more efficient in terms of startup and code size.</p>
</div>
<div class="paragraph">
<p>The result is significant improvements to startup and native image sizes when building native images with GraalVM Native Image.</p>
</div>
<div class="paragraph">
<p>It is recommended that users re-compile their applications and libraries with Micronaut 3.0 to benefit from these changes.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_graalvm_21_2">Support for GraalVM 21.2</h5>
<div class="paragraph">
<p>Micronaut has been updated to support the latest GraalVM 21.2 release.</p>
</div>
</div>
<div class="sect4">
<h5 id="_jakarta_inject">Jakarta Inject</h5>
<div class="paragraph">
<p>The <code>jakarta.inject</code> annotations are now the default injection annotations for Micronaut 3</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_jsr_330_bean_import">Support for JSR-330 Bean Import</h5>
<div class="paragraph">
<p>Using the ann:context.annotation.Import[] annotation it is now possible to import bean definitions into your application where JSR-330 (either <code>javax.inject</code> or <code>jakarta.inject</code> annotations) are used in an external library.</p>
</div>
<div class="paragraph">
<p>See the documentation on <a href="#beanImport">Bean Import</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_controlling_annotation_inheritance">Support for Controlling Annotation Inheritance</h5>
<div class="paragraph">
<p>api:core.annotation.AnnotationMetadata[] inheritance can now be controlled via Java&#8217;s <code>@Inherited</code> annotation. If an annotation is not explicitly annotated with <code>@Inherited</code> it will not be included in the metadata. See the <a href="#annotationMetadata">Annotation Inheritance</a> section of the documentation for more information.</p>
</div>
<div class="admonitionblock note">
<table>
<tr>
<td class="icon">
<div class="title">Note</div>
</td>
<td class="content">
This is an important behavioural change from Micronaut 2.x, see the <a href="#breaks">Breaking Changes</a> section for information on how to upgrade.
</td>
</tr>
</table>
</div>
</div>
<div class="sect4">
<h5 id="_support_narrowing_injection_by_generic_type_arguments">Support Narrowing Injection by Generic Type Arguments</h5>
<div class="paragraph">
<p>Micronaut can now resolve the correct bean to inject based on the generic type arguments specified on the injection point:</p>
</div>
<div class="paragraph">
<p>snippet::io.micronaut.docs.inject.generics.Vehicle[tags="constructor",indent=0]</p>
</div>
<div class="paragraph">
<p>For more information see the section on <a href="#qualifiers">Qualifying by Generic Type Arguments</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_using_annotation_members_in_qualifiers">Support for using Annotation Members in Qualifiers</h5>
<div class="paragraph">
<p>You can now use annotation members in qualifiers and specify which members should be excluded with the new ann:context.annotation.NonBinding[] annotation.</p>
</div>
<div class="paragraph">
<p>For more information see the section on <a href="#qualifiers">Qualifying By Annotation Members</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_limiting_the_injectable_types">Support for Limiting the Injectable Types</h5>
<div class="paragraph">
<p>You can now limit the exposed types of a bean using the <code>typed</code> member of the ann:context.annotation.Bean[] annotation:</p>
</div>
<div class="paragraph">
<p>snippet::io.micronaut.docs.inject.typed.V8Engine[tags="class",indent=0]</p>
</div>
<div class="paragraph">
<p>For more information see the section on <a href="#typed">Limiting Injectable Types</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_factories_can_produce_bean_from_fields">Factories can produce bean from fields</h5>
<div class="paragraph">
<p>Beans defined with the ann:context.annotation.Factory[] annotation can now produce beans from public or package protected fields, for example:</p>
</div>
<div class="paragraph">
<p>snippet::io.micronaut.docs.factories.VehicleMockSpec[tags="class",indent=0]</p>
</div>
<div class="paragraph">
<p>For more information see the <a href="#factories">Bean Factories</a> section of the documentation.</p>
</div>
</div>
<div class="sect4">
<h5 id="_enhanced_beanprovider_interface">Enhanced <code>BeanProvider</code> Interface</h5>
<div class="paragraph">
<p>The api:context.BeanProvider[] interface has been enhanced with new methods such as <code>iterator()</code> and <code>stream()</code> as well as methods to check for bean existence and uniqueness.</p>
</div>
</div>
<div class="sect4">
<h5 id="_new_any_qualifier_for_use_in_bean_factories">New <code>@Any</code> Qualifier for use in Bean Factories</h5>
<div class="paragraph">
<p>A new ann:context.annotation.Any[] qualifier has been introduced to allow injecting any available instance into an injection point and can be used in combination with the new <code>BeanProvider</code> interface mentioned above to allow more dynamic behaviour.</p>
</div>
<div class="paragraph">
<p>snippet::io.micronaut.docs.qualifiers.any.Vehicle[tags="imports,clazz", indent=0, title="Using BeanProvider with Any"]</p>
</div>
<div class="paragraph">
<p>The annotation can also be used on ann:context.annotation.Factory[] methods to allow customization of how objects are injected via the api:inject.InjectionPoint[] API.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_fields_in_bean_introspections">Support for Fields in Bean Introspections</h5>
<div class="paragraph">
<p>Bean introspections on public or package protected fields are now supported:</p>
</div>
<div class="paragraph">
<p>snippet::io.micronaut.docs.ioc.beans.User[tags="class", indent=0]</p>
</div>
<div class="paragraph">
<p>For more information see the "Bean Fields" section of the <a href="#introspection">Bean Introspections</a> documentation.</p>
</div>
</div>
<div class="sect4">
<h5 id="_applicationeventpublisher_has_now_a_generic_event_type"><code>ApplicationEventPublisher</code> has now a generic event type</h5>
<div class="paragraph">
<p>For the performance reasons it&#8217;s advised to inject an instance of <code>ApplicationEventPublisher</code> with a generic type parameter - <code>ApplicationEventPublisher&lt;MyEvent&gt;</code>.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_aop_features">AOP Features</h4>
<div class="sect4">
<h5 id="_support_for_constructor_interception">Support for Constructor Interception</h5>
<div class="paragraph">
<p>It is now possible to intercept bean construction invocations through the api:aop.ConstructorInterceptor[] interface and ann:aop.AroundConstruct[] annotation.</p>
</div>
<div class="paragraph">
<p>See the section on <a href="#lifecycleAdvice">Bean Life Cycle Advice</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_support_for_postconstruct_predestroy_interception">Support for <code>@PostConstruct</code> &amp; <code>@PreDestroy</code> Interception</h5>
<div class="paragraph">
<p>It is now possible to intercept <code>@PostConstruct</code> and <code>@PreDestroy</code> method invocations through the api:aop.MethodInterceptor[] interface and ann:aop.InterceptorBinding[] annotation.</p>
</div>
<div class="paragraph">
<p>See the section on <a href="#lifecycleAdvice">Bean Life Cycle Advice</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_random_configuration_values">Random Configuration Values</h5>
<div class="paragraph">
<p>It is now possible to set a max and a range for random numbers in configuration. For example to set an integer between 0 and 9, <code>${random.int(10)}</code> can be used as the configuration value. See the <a href="#propertySource">documentation</a> under "Using Random Properties" for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_project_reactor_used_internally_instead_of_rxjava2">Project Reactor used internally instead of RxJava2</h5>
<div class="paragraph">
<p>Micronaut 3 uses internally <a href="https://projectreactor.io">Project Reactor</a> instead <a href="https://github.com/ReactiveX/RxJava">RxJava 2</a>. Project Reactor allows
Micronaut 3 to simplify instrumentation, thanks to <a href="https://projectreactor.io/docs/core/release/api/reactor/util/context/Context.html">Reactor&#8217;s Context</a>,  simplifies conversion login and eases the integration with R2DBC drivers. We recommend users to migrate to Reactor. However, it is possible to continue to use RxJava. See <a href="#reactiveConfigs">Reactive Programming section</a>.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_module_upgrades_4">Module Upgrades</h4>
<div class="sect4">
<h5 id="_micronaut_data_3_1_0_2">Micronaut Data 3.1.0</h5>
<div class="ulist">
<ul>
<li>
<p>Kotlin&#8217;s coroutines support. New repository interface <code>CoroutineCrudRepository</code>.</p>
</li>
<li>
<p>Support for <code>AttributeConverter</code></p>
</li>
<li>
<p>R2DBC upgraded to <code>Arabba-SR11</code></p>
</li>
<li>
<p>JPA Criteria specifications</p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_micrometer_4_0_0">Micronaut Micrometer 4.0.0</h5>
<div class="paragraph">
<p>The <a href="https://micronaut-projects.github.io/micronaut-micrometer/latest/guide/">Micrometer module</a> has been upgraded and now supports repeated definitions of the <a href="https://micrometer.io/?/docs/concepts#_the_timed_annotation">@Timed</a> annotation as well as also supporting the <code>@Counted</code> annotation for counters when you add the <code>micronaut-micrometer-annotation</code> dependency to your annotation processor classpath.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_oracle_cloud_2_0_0">Micronaut Oracle Cloud 2.0.0</h5>
<div class="paragraph">
<p>Micronaut&#8217;s <a href="https://micronaut-projects.github.io/micronaut-oracle-cloud/latest/guide/">Oracle Cloud Integration</a> has been updated with support for Cloud Monitoring and Tracing.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_cassandra_4_0_0">Micronaut Cassandra 4.0.0</h5>
<div class="paragraph">
<p>The <a href="https://micronaut-projects.github.io/micronaut-cassandra/latest/guide/">Micronaut Cassandra</a> integration now includes support for GraalVM out of the box.</p>
</div>
</div>
<div class="sect4">
<h5 id="_other_modules">Other Modules</h5>
<div class="ulist">
<ul>
<li>
<p>Micronaut Acme 3.0.0</p>
</li>
<li>
<p>Micronaut Aws 3.0.0</p>
</li>
<li>
<p>Micronaut Azure 3.0.0</p>
</li>
<li>
<p>Micronaut Cache 3.0.0</p>
</li>
<li>
<p>Micronaut Discovery Client 3.0.0</p>
</li>
<li>
<p>Micronaut ElasticSearch 3.0.0</p>
</li>
<li>
<p>Micronaut Flyway 4.1.0</p>
</li>
<li>
<p>Micronaut GCP 4.0.0</p>
</li>
<li>
<p>Micronaut GraphQL 3.0.0</p>
</li>
<li>
<p>Micronaut Groovy 3.0.0</p>
</li>
<li>
<p>Micronaut Grpc 3.0.0</p>
</li>
<li>
<p>Micronaut Jackson XML 3.0.0</p>
</li>
<li>
<p>Micronaut Jaxrs 3.0.0</p>
</li>
<li>
<p>Micronaut JMX 3.0.0</p>
</li>
<li>
<p>Micronaut Kafka 4.0.0</p>
</li>
<li>
<p>Micronaut Kotlin 3.0.0</p>
</li>
<li>
<p>Micronaut Kubernetes 3.0.0</p>
</li>
<li>
<p>Micronaut Liquibase 4.0.2</p>
</li>
<li>
<p>Micronaut Mongo 4.0.0</p>
</li>
<li>
<p>Micronaut MQTT 2.0.0</p>
</li>
<li>
<p>Micronaut Multitenancy 4.0.0</p>
</li>
<li>
<p>Micronaut Nats Io 3.0.0</p>
</li>
<li>
<p>Micronaut Neo4j 5.0.0</p>
</li>
<li>
<p>Micronaut OpenApi 3.0.1</p>
</li>
<li>
<p>Micronaut Picocli 4.0.0</p>
</li>
<li>
<p>Micronaut Problem Json 2.0.0</p>
</li>
<li>
<p>Micronaut R2DBC 2.0.0</p>
</li>
<li>
<p>Micronaut RabbitMQ 3.0.0</p>
</li>
<li>
<p>Micronaut Reactor 2.0.0</p>
</li>
<li>
<p>Micronaut Redis 5.0.0</p>
</li>
<li>
<p>Micronaut RSS 3.0.0</p>
</li>
<li>
<p>Micronaut RxJava2 1.0.0 (new)</p>
</li>
<li>
<p>Micronaut RxJava3 2.0.0</p>
</li>
<li>
<p>Micronaut Security 3.0.0</p>
</li>
<li>
<p>Micronaut Servlet 3.0.0</p>
</li>
<li>
<p>Micronaut Spring 4.0.0</p>
</li>
<li>
<p>Micronaut SQL 4.0.0</p>
</li>
<li>
<p>Micronaut Test 3.0.0</p>
</li>
<li>
<p>Micronaut Views 3.0.0</p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_dependency_upgrades">Dependency Upgrades</h5>
<div class="ulist">
<ul>
<li>
<p>Caffeine 2.9.1</p>
</li>
<li>
<p>Cassandra 4.11.1</p>
</li>
<li>
<p>Elasticsearch 7.12.0</p>
</li>
<li>
<p>Flyway 7.12.1</p>
</li>
<li>
<p>GraalVM 21.2.0</p>
</li>
<li>
<p>H2 Database 1.4.200</p>
</li>
<li>
<p>Hazelcast 4.2.1</p>
</li>
<li>
<p>Hibernate 5.5.3.Final</p>
</li>
<li>
<p>Hikari 4.0.3</p>
</li>
<li>
<p>Infinispan 12.1.6.Final</p>
</li>
<li>
<p>Jackson 2.12.4</p>
</li>
<li>
<p>Jaeger 1.6.0</p>
</li>
<li>
<p>Jakarta Annotation API 2.0.0</p>
</li>
<li>
<p>JAsync 1.2.2</p>
</li>
<li>
<p>JDBI 3.20.1</p>
</li>
<li>
<p>JOOQ 3.14.12</p>
</li>
<li>
<p>JUnit 5.7.2</p>
</li>
<li>
<p>Kafka 2.8.0</p>
</li>
<li>
<p>Kotlin 1.5.21</p>
</li>
<li>
<p>Kotlin Coroutines 1.5.1</p>
</li>
<li>
<p>Ktor 1.6.1</p>
</li>
<li>
<p>Liquibase 4.4.3</p>
</li>
<li>
<p>MariaDB Driver 2.7.3</p>
</li>
<li>
<p>Micrometer 1.7.1</p>
</li>
<li>
<p>MongoDB 4.3.0</p>
</li>
<li>
<p>MS SQL Driver 9.2.1.jre8</p>
</li>
<li>
<p>MySQL Driver 8.0.25</p>
</li>
<li>
<p>Neo4j Driver 4.2.7</p>
</li>
<li>
<p>Postgres Driver 42.2.23</p>
</li>
<li>
<p>Reactor 3.4.8</p>
</li>
<li>
<p>RxJava3 3.0.13</p>
</li>
<li>
<p>SLF4J 1.7.29</p>
</li>
<li>
<p>Snake YAML 1.29</p>
</li>
<li>
<p>Spock 2.0-groovy-3.0</p>
</li>
<li>
<p>Spring 5.3.9</p>
</li>
<li>
<p>Spring Boot 2.5.3</p>
</li>
<li>
<p>Testcontainers 1.15.3</p>
</li>
<li>
<p>Tomcat JDBC 10.0.8</p>
</li>
<li>
<p>Vertx SQL Drivers 4.1.1</p>
</li>
</ul>
</div>
</div>
</div>
</div>
<div class="sect2">
<h3 id="_3_0_0_breaking_changes">3.0.0 Breaking Changes</h3>
<div class="sect3">
<h4 id="_core_changes">Core Changes</h4>
<div class="sect4">
<h5 id="_annotation_inheritance">Annotation Inheritance</h5>
<div class="paragraph">
<p>Possibly the most important change in Micronaut 3.0 is how annotations are inherited from parent classes, methods and interfaces.</p>
</div>
<div class="paragraph">
<p>Micronaut 2.x did not respect the rules defined in the jdk:java.lang.reflect.AnnotatedElement[], and inherited all annotations from parent interfaces and types regardless of the presence of the jdk:java.lang.annotation.Inherited[] annotation.</p>
</div>
<div class="paragraph">
<p>With Micronaut 3.x and above only annotations that are explicitly meta-annotated with jdk:java.lang.annotation.Inherited[] are now inherited from parent classes and interfaces.
This applies to types in the case where one extends another, and methods in the case where one overrides another.</p>
</div>
<div class="paragraph">
<p>Many of Micronaut&#8217;s core annotations have been annotated with <code>@Inherited</code>, so no change will be required, but some annotations that are either outside Micronaut or defined by user code will need changes to code or the annotation.</p>
</div>
<div class="paragraph">
<p>In general, behaviour which you wish to override is not inherited by default in Micronaut 3.x and above including <a href="#scopes">Bean Scopes</a>, <a href="#qualifiers">Bean Qualifiers</a>, <a href="#conditionalBeans">Bean Conditions</a>, <a href="#validation">Validation Rules</a> and so on.</p>
</div>
<div class="paragraph">
<p>The following table summarizes the core Micronaut annotations and which are inherited and which are not:</p>
</div>
<table class="tableblock frame-topbot grid-all" style="width: 80%;">
<caption class="title">Table 2. Annotation Inheritance in Micronaut 3.x and above</caption>
<colgroup>
<col style="width: 50%;">
<col style="width: 50%;">
</colgroup>
<thead>
<tr>
<th class="tableblock halign-left valign-top">Annotation</th>
<th class="tableblock halign-left valign-top">Inherited</th>
</tr>
</thead>
<tbody>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:aop.Adapter[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:aop.Around[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:aop.AroundConstruct[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:aop.InterceptorBean[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:aop.InterceptorBinding[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:aop.Introduction[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.Blocking[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.Creator[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.EntryPoint[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.Experimental[] (source level)</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.Indexes[] &amp; ann:core.annotation.Indexed[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.Internal[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.Introspected[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.NonBlocking[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.Nullable[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.NonNull[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.Order[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.ReflectiveAccess[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.annotation.TypeHint[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.async.annotation.SingleResult[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.bind.annotation.Bindable[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.convert.format.Format[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.convert.format.MapFormat[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.convert.format.ReadableBytes[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:core.version.annotation.Version[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.AliasFor[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Any[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Bean[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.BootstrapContextCompatible[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.ConfigurationBuilder[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.ConfigurationInject[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.ConfigurationProperties[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.ConfigurationReader[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Context[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.DefaultImplementation[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.DefaultScope[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.EachBean[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Executable[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Factory[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.NonBinding[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Parallel[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Parameter[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Primary[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Property[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.PropertySource[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Prototype[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Replaces[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Requirements[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Requires[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Secondary[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Type[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:context.annotation.Value[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Controller[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Body[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Consumes[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.CookieValue[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.CustomHttpMethod[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Delete[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Error[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Filter[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.FilterMatcher[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Get[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Head[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Header[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Headers[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.HttpMethodMapping[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Options[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Part[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Patch[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.PathVariable[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Post[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Produces[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Put[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.QueryValue[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.RequestAttribute[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.RequestAttributes[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.RequestBean[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Status[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.Trace[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.annotation.UriMapping[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:http.client.annotation.Client[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:jackson.annotation.JacksonFeatures[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:management.endpoint.annotation.Delete[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:management.endpoint.annotation.Endpoint[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:management.endpoint.annotation.Read[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:management.endpoint.annotation.Sensitive[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:management.endpoint.annotation.Selector[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:management.endpoint.annotation.Write[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:management.health.indicator.annotation.Liveness[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:management.health.indicator.annotation.Readiness[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:messaging.annotation.MessageBody[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:messaging.annotation.MessageHeader[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:messaging.annotation.MessageHeaders[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:messaging.annotation.MessageListener[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:messaging.annotation.MessageMapping[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:messaging.annotation.MessageProducer[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:messaging.annotation.SendTo[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:retry.annotation.CircuitBreaker[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:retry.annotation.Fallback[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:retry.annotation.Recoverable[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:retry.annotation.Retryable[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:runtime.context.scope.Refreshable[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:runtime.context.scope.ScopedProxy[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:runtime.context.scope.ThreadLocal[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:runtime.event.annotation.EventListener[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:runtime.http.scope.RequestScope[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:scheduling.annotation.Async[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:scheduling.annotation.ExecuteOn[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:scheduling.annotation.Scheduled[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:session.annotation.SessionValue[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="{micronauttracingapi}/io/micronaut/tracing/annotation/ContinueSpan.html">@ContinueSpan</a></p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="{micronauttracingapi}/io/micronaut/tracing/annotation/NewSpan.html">@NewSpan</a></p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="{micronauttracingapi}/io/micronaut/tracing/annotation/SpanTag.html">@SpanTag</a></p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:validation.Validated[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:websocket.annotation.ClientWebSocket[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:websocket.annotation.OnClose[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:websocket.annotation.OnError[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:websocket.annotation.OnMessage[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:websocket.annotation.OnOpen[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:websocket.annotation.ServerWebSocket[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:websocket.annotation.WebSocketComponent[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">❌</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">ann:websocket.annotation.WebSocketMapping[]</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">✅</p></td>
</tr>
</tbody>
</table>
<div class="paragraph">
<p>When upgrading an application you may need to take action if you implement an interface or subclass a superclass and override a method.</p>
</div>
<div class="paragraph">
<p>For example the annotations defined in <code>jakarta.validation</code> are not inherited by default, so they must be defined again in any overridden or implemented methods.</p>
</div>
<div class="paragraph">
<p>This behaviour grants more flexibility if you need to redefine the validation rules. Note that it is still possible to inherit validation rules through meta-annotations. See the section on <a href="#annotationMetadata">Annotation Inheritance</a> for more information.</p>
</div>
</div>
<div class="sect4">
<h5 id="_error_response_format">Error Response Format</h5>
<div class="paragraph">
<p>The default value of <code>jackson.always-serialize-errors-as-list</code> is now true. That means by default the Hateoas JSON errors will always be a list. For example:</p>
</div>
<div class="listingblock">
<div class="title">Example error response</div>
<div class="content">
<pre>{
  ...
  "_embedded": {
    "errors": [
      {
        "message": "Person.name: must not be blank"
      }
    ]
  }
}</pre>
</div>
</div>
<div class="paragraph">
<p>To revert to the previous behavior where a singular error was populated in the message field instead of including <code>_embedded.errors</code>, set the configuration setting to false.</p>
</div>
</div>
<div class="sect4">
<h5 id="_runtime_classpath_scanning_removed">Runtime Classpath Scanning Removed</h5>
<div class="paragraph">
<p>It is no longer possible to scan the classpath at runtime using the <code>scan</code> method of the api:context.env.Environment[] interface.</p>
</div>
<div class="paragraph">
<p>This functionality has not been needed for some time as scanning is implemented at build time through <a href="#introspection">Bean Introspections</a>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_inject_annotations_2">Inject Annotations</h5>
<div class="paragraph">
<p>Micronaut now provides the <code>jakarta.inject</code> annotations as a transitive dependency instead of the <code>javax.inject</code> annotations.
To continue using the old annotations, add the following dependency.</p>
</div>
<div class="paragraph">
<p>dependency:javax.inject:javax.inject:1[]</p>
</div>
</div>
<div class="sect4">
<h5 id="_nullable_annotations">Nullable Annotations</h5>
<div class="paragraph">
<p>Micronaut no longer exports any third party dependency for nullability annotations.
Micronaut now provides its own annotations for this purpose (api:core.annotation.Nullable[] and api:core.annotation.NonNull[]) that are used for our APIs.
To continue using other nullability annotations, simply add the relevant dependency.</p>
</div>
<div class="paragraph">
<p>Internally, Micronaut makes use of a third party annotation that may manifest as a warning in your project:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code class="language-none hljs">warning: unknown enum constant When.MAYBE
  reason: class file for javax.annotation.meta.When not found</code></pre>
</div>
</div>
<div class="paragraph">
<p>This warning is harmless and can be ignored. To eliminate this warning, add the following dependency to your project&#8217;s compile only classpath:</p>
</div>
<div class="paragraph">
<p>dependency:com.google.code.findbugs:jsr305[gradleScope="compileOnly"]</p>
</div>
</div>
<div class="sect4">
<h5 id="_server_filter_behavior">Server Filter Behavior</h5>
<div class="paragraph">
<p>In Micronaut 2 server filters could have been called multiple times in the case of an exception being thrown, or sometimes not at all if the error resulted before route execution.
This also allowed for filters to handle exceptions thrown from routes.
Filters have changed in Micronaut 3 to always be called exactly once for each request, under all conditions.
Exceptions are no longer propagated to filters and instead the resulting error response is passed through the reactive stream.</p>
</div>
<div class="paragraph">
<p>In the case of a response being created as a result of an exception, the original cause is now stored as a response attribute (api:http.HttpAttributes#EXCEPTION[]).
That attribute can be read by filters to have context for the error HTTP response.</p>
</div>
<div class="paragraph">
<p>The api:http.filter.OncePerRequestHttpServerFilter[] class is now deprecated and will be removed in the next major release.
The api:http.filter.OncePerRequestHttpServerFilter[] stores a request attribute when the filter is executed and some functionality may rely on that attribute existing.
The class will still create the attribute but it is recommended to instead create a custom attribute in your filter class and use that instead of the one created by api:http.filter.OncePerRequestHttpServerFilter[].</p>
</div>
<div class="paragraph">
<p>There is also a minor behavior change in when the response gets written.
Any modifications to the response after the underlying <code>onNext</code> call is made will not have any effect as the response has already been written.</p>
</div>
</div>
<div class="sect4">
<h5 id="_http_compile_time_validation">HTTP Compile Time Validation</h5>
<div class="paragraph">
<p>Compile time validation of HTTP related classes has been moved to its own module. To continue validating controllers, websocket server classes add <code>http-validation</code> to the annotation processor classpath.</p>
</div>
<div class="paragraph">
<p>dependency:io.micronaut:micronaut-http-validation[gradleScope="annotationProcessor"]</p>
</div>
</div>
<div class="sect4">
<h5 id="_decapitalization_strategy">Decapitalization Strategy</h5>
<div class="paragraph">
<p>For many cases, one common one being introspections, getter names like <code>getXForwarded()</code> would result in the bean property being <code>XForwarded</code>.
The name will now be <code>xForwarded</code>.
This can affect many areas of the framework where names like <code>XForwarded</code> are used.</p>
</div>
</div>
<div class="sect4">
<h5 id="_order_default">@Order default</h5>
<div class="paragraph">
<p>Previously the default order value for the <code>@Order</code> annotation was the lowest precedence.
It is now 0.</p>
</div>
</div>
<div class="sect4">
<h5 id="_classes_renaming">Classes Renaming</h5>
<div class="ulist">
<ul>
<li>
<p><code>RxJavaRouteDataCollector</code> has been renamed to <code>DefaultRouteDataCollector</code>.</p>
</li>
<li>
<p><code>RxJavaBeanDefinitionDataCollector.html</code> has been renamed to <code>DefaultBeanDefinitionDataCollector</code>.</p>
</li>
<li>
<p><code>RxJavaHealthAggregator</code> has been renamed to <code>DefaultHealthAggregator</code></p>
</li>
</ul>
</div>
</div>
<div class="sect4">
<h5 id="_deprecation_removal">Deprecation Removal</h5>
<div class="paragraph">
<p>Classes, constructors, etc. that have been deprecated in previous versions of Micronaut have been removed.</p>
</div>
</div>
<div class="sect4">
<h5 id="_reflective_bean_map">Reflective Bean Map</h5>
<div class="paragraph">
<p>In several places in Micronaut, it is required to get a map representation of your object.
In previous versions, a reflection based strategy was used to retrieve that information if the class was not annotated with <code>@Introspected</code>.
That functionality has been removed and it is now required to annotate classes with <code>@Introspected</code> that are being used in this way.
Any class may be affected if it is passed as an argument or returned from any controller or client, among other use cases.</p>
</div>
</div>
<div class="sect4">
<h5 id="_cookie_secure_configuration">Cookie Secure Configuration</h5>
<div class="paragraph">
<p>Previously the <code>secure</code> configuration for cookies was only respected if the request was determined to be sent over https.
Due to a number of factors including proxies, HTTPS requests can be presented to the server as if they are HTTP.
In those cases the setting was not having any effect.
The setting is now respected regardless of the status of the request.
If the setting is not set, cookies will be secure if the request is determined to be HTTPS.</p>
</div>
</div>
<div class="sect4">
<h5 id="_server_error_route_priority">Server Error Route Priority</h5>
<div class="paragraph">
<p>Previously if a route could not be satisfied, or an <code>HttpStatusException</code> was thrown, routes for the relevant HTTP status was searched before routes that handled the specific exception.
In Micronaut 3 routes that handle the exception will be searched first, then routes that handle the HTTP status.</p>
</div>
</div>
<div class="sect4">
<h5 id="_status_route_default_response_status">Status Route Default Response Status</h5>
<div class="paragraph">
<p>Status error routes will now default to produce responses with the same HTTP status as specified in the <code>@Error</code> annotation.
In previous versions a 200 OK response was created.
For example:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code class="language-none hljs">@Error(status = HttpStatus.UNSUPPORTED_MEDIA_TYPE)
String unsupportedMediaTypeHandler() {
    return "not supported";
}</code></pre>
</div>
</div>
<div class="paragraph">
<p>The above method will result in a response of HTTP status 415 with a body of "not supported".
Previously it would have been a response of HTTP status 200 with a body of "not supported".
To specify the desired response status, either annotate the method with <code>@Status</code> or return an <code>HttpResponse</code>.</p>
</div>
</div>
<div class="sect4">
<h5 id="_no_longer_possible_to_inject_a_list_of_provider">No Longer Possible to Inject a <code>List</code> of <code>Provider</code></h5>
<div class="paragraph">
<p>In Micronaut 2.x it was possible to inject a <code>List&lt;javax.inject.Provider&gt;</code>, although this was undocumented behaviour.
In Micronaut 3.x injecting a list of <code>Provider</code> instances is no longer possible and you should instead use the api:context.BeanProvider[] API which provides <code>stream()</code> and <code>iterator()</code> methods to provide the same functionality.</p>
</div>
</div>
<div class="sect4">
<h5 id="_injecting_executorservice">Injecting ExecutorService</h5>
<div class="paragraph">
<p>In previous versions of Micronaut it was possible to inject an <a href="{jdkapi}/java/util/concurrent/ExecutorService.html">ExecutorService</a> without any qualifiers and the default Netty event loop group would be injected.
Because the event loop should not be used for general purpose use cases, the injection will now fail by default with a non unique bean exception.
The injection point should be qualified for which executor service is desired.</p>
</div>
</div>
<div class="sect4">
<h5 id="_subclasses_returned_from_factories_not_injectable">Subclasses Returned From Factories Not Injectable</h5>
<div class="paragraph">
<p>It is no longer possible to inject the internal implementation type from beans produced via factories. The type returned from the factory or any of its super types are able to be injected.</p>
</div>
<div class="paragraph">
<p>For example:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ExecutorService;
import javax.inject.Singleton;

public class ExecutorFactory {
    @Singleton
    public ExecutorService executorService() {
        return ForkJoinPool.commonPool();
    }
}</code></pre>
</div>
</div>
<div class="paragraph">
<p>In the above case, if the <code>ExecutorService</code> had been already been retrieved from the context in previous logic, a call to <code>context.getBean(ForkJoinPool.class)</code> would locate the already created bean.
This behaviour was inconsistent because if the bean had not yet been created then this lookup would not work.
In Micronaut 3 for consistency this is no longer possible.</p>
</div>
<div class="paragraph">
<p>You can however restore the behaviour by changing the factory to return the implementation type:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ExecutorService;
import javax.inject.Singleton;
public class ExecutorFactory {

    @Singleton
    public ForkJoinPool executorService() {
        return ForkJoinPool.commonPool();
    }
}</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_no_longer_possible_to_define_aop_advice_on_a_bean_produced_from_a_factory_with_constructor_arguments">No Longer Possible to Define AOP Advice on a Bean Produced from a Factory with Constructor arguments</h5>
<div class="paragraph">
<p>In previous versions of Micronaut it was possible to define AOP advice to a factory method that returned a class that featured constructor arguments.
This could lead to undefined behaviour since the argument of the generated proxy which would be dependency injected by the framework may be different from manually constructed proxy target.</p>
</div>
<div class="paragraph">
<p>The following definition is now invalid in Micronaut 3 and above and will lead to a compilation error:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">import io.micronaut.context.annotation.*;
import io.micronaut.runtime.context.scope.*;

@Factory
class ExampleFactory {

    @ThreadLocal
    Test test() {
        return new Test("foo");
    }
}

class Test {
    // illegally defines constructor arguments
    Test(String name) {}
}</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_implementations_of_javax_inject_provider_no_longer_generate_factories">Implementations of <code>javax.inject.Provider</code> No Longer Generate Factories</h5>
<div class="paragraph">
<p>In Micronaut 2.x if you defined a bean that implemented the <code>javax.inject.Provider</code> interface then the return type of the <code>get</code> method also automatically became a bean.</p>
</div>
<div class="paragraph">
<p>For example:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">import javax.inject.Provider;
import javax.inject.Singleton;

@Singleton
public class AProvider implements Provider&lt;A&gt; {
    @Override
    public A get() {
        return new AImpl();
    }
}</code></pre>
</div>
</div>
<div class="paragraph">
<p>In the above example a bean of type <code>A</code> would automatically be exposed by Micronaut.
This behaviour is no longer supported and instead the ann:context.annotation.Factory[] annotation should be used to express the same behaviour.
For example:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="java" class="language-java hljs">import io.micronaut.context.annotation.Factory;
import javax.inject.Provider;
import javax.inject.Singleton;

@Factory
public class AProvider implements Provider&lt;A&gt; {
    @Override
    @Singleton
    public A get() {
        return new AImpl();
    }
}</code></pre>
</div>
</div>
</div>
<div class="sect4">
<h5 id="_fewer_executable_methods_generated_for_controllers_and_message_listeners">Fewer Executable Methods Generated for Controllers and Message Listeners</h5>
<div class="paragraph">
<p>Previous versions of Micronaut specified the ann:context.annotation.Executable[] annotation as a meta-annotation on the ann:http.annotation.Controller[], ann:http.annotation.Filter[] and ann:messaging.annotation.MessageListener[] annotations.
This resulted in generating executable method all non-private methods of classes annotated with these annotations.</p>
</div>
<div class="paragraph">
<p>In Micronaut 3.x and above the ann:context.annotation.Executable[] has been moved to a meta-annotation of ann:http.annotation.HttpMethodMapping[] and ann:messaging.annotation.MessageMapping[] instead to reduce memory consumption and improve efficiency.</p>
</div>
<div class="paragraph">
<p>If you were relying on the presence of these executable methods you must explicitly annotate methods in your classes with ann:context.annotation.Executable[] to restore this behaviour.</p>
</div>
</div>
<div class="sect4">
<h5 id="_graalvm_changes">GraalVM changes</h5>
<div class="paragraph">
<p>In previous versions of Micronaut annotating a class with <code>@Introspected</code> automatically added it to the GraalVM <code>reflect-config.json</code> file.
The original intended usage of the annotation is to generate <a href="#introspection">Bean Introspection Metadata</a> so Micronaut can instantiate the class and call getters and setters without using reflection.</p>
</div>
<div class="paragraph">
<p>Starting in Micronaut 3.x, the <code>@Introspected</code> annotation doesn&#8217;t add the class to the GraalVM <code>reflect-config.json</code> file anymore because, in most cases, it is not necessary.
If you need to declare a class to be accessed by reflection, use the <code>@ReflectiveAccess</code> annotation instead.</p>
</div>
<div class="paragraph">
<p>Another change is regarding the GraalVM resources created at compile-time. In previous versions of Micronaut adding a dependency on <code>io.micronaut:micronaut-graal</code> triggered the generation of the GraalVM <code>resource-config.json</code> that included all the resources in <code>src/main/resources</code> so they were included in the native image. Starting in Micronaut 3.x that is done in either the Gradle or Maven plugins.</p>
</div>
</div>
</div>
<div class="sect3">
<h4 id="_exception_handler_moves">Exception Handler Moves</h4>
<div class="paragraph">
<p>Two exception handlers that were in <code>micronaut-server-netty</code> have now been moved to <code>micronaut-server</code> since they were not specific to Netty. Their package has also changed as a result.</p>
</div>
<table class="tableblock frame-all grid-all stretch">
<caption class="title">Table 3. Package changes</caption>
<colgroup>
<col style="width: 50%;">
<col style="width: 50%;">
</colgroup>
<thead>
<tr>
<th class="tableblock halign-left valign-top">Old</th>
<th class="tableblock halign-left valign-top">New</th>
</tr>
</thead>
<tbody>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">http-server-netty/src/main/java/io/micronaut/http/server/netty/converters/DuplicateRouteHandler.java</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">http-server/src/main/java/io/micronaut/http/server/exceptions/DuplicateRouteHandler.java</p></td>
</tr>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">http-server-netty/src/main/java/io/micronaut/http/server/netty/converters/UnsatisfiedRouteHandler.java</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">http-server/src/main/java/io/micronaut/http/server/exceptions/UnsatisfiedRouteHandler.java</p></td>
</tr>
</tbody>
</table>
</div>
<div class="sect3">
<h4 id="_module_changes">Module Changes</h4>
<div class="sect4">
<h5 id="_new_package_for_micronaut_cassandra">New package for Micronaut Cassandra</h5>
<div class="paragraph">
<p>The classes in Micronaut Cassandra have been moved from <code>io.micronaut.configuration.cassandra</code> to <code>io.micronaut.cassandra</code> package.</p>
</div>
</div>
<div class="sect4">
<h5 id="_micronaut_security_2">Micronaut Security</h5>
<div class="paragraph">
<p>Many of the APIs in the Micronaut Security module have undergone changes. Please see the <a href="https://micronaut-projects.github.io/micronaut-security/{micronautSecurityVersion}/guide">Micronaut Security</a> documentation for the details.</p>
</div>
</div>
<div class="sect4">
<h5 id="_groovy_changes">Groovy changes</h5>
<div class="paragraph">
<p>In the previous version, a missing property wouldn&#8217;t set the field value to <code>null</code> as it would for the Java code. In version 3, it should behave in the same way.</p>
</div>
<div class="paragraph">
<p>Please refactor to use the default value in the <code>@Value</code> annotation:</p>
</div>
<div class="listingblock">
<div class="content">
<pre class="highlightjs highlight"><code data-lang="groovy" class="language-groovy hljs">@Nullable
@Value('${greeting}')
protected String before = "Default greeting"

@Nullable
@Value('${greeting:Default greeting}')
protected String after</code></pre>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
