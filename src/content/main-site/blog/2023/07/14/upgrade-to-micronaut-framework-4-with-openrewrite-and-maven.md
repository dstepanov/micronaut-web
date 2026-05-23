---
slug: 2023/07/14/upgrade-to-micronaut-framework-4-with-openrewrite-and-maven
title: Upgrade to Micronaut Framework 4 with OpenRewrite and Maven
description: The Micronaut team has assembled a new set of OpenRewrite recipes to make upgrading from Micronaut Framework 3 to Micronaut Framework 4 quick and straightforward. These recipes automate as much as possible from our previous “Upgrade To Micronaut Framework 4” post. The recipes will be continually updated whenever we discover new upgrade steps. Upgrading a Maven Application...
date: '2023-07-14T07:30:18'
modified: '2023-07-21T16:30:24'
sourceUrl: https://micronaut.io/2023/07/14/upgrade-to-micronaut-framework-4-with-openrewrite-and-maven/
wordpressId: 6481
contentSource: wordpress-post
category: micronaut-4
categories:
  - micronaut-4
tags: []
href: /2023/07/14/upgrade-to-micronaut-framework-4-with-openrewrite-and-maven/
---

The Micronaut team has assembled a new set of [OpenRewrite recipes](https://github.com/openrewrite/rewrite-micronaut/blob/main/src/main/resources/META-INF/rewrite/micronaut3-to-4.yml) to make upgrading from Micronaut Framework 3 to Micronaut Framework 4 quick and straightforward.

These recipes automate as much as possible from our previous [“Upgrade To Micronaut Framework 4”](https://micronaut.io/2023/05/09/upgrade-to-micronaut-framework-4-0-0/) post. The recipes will be continually updated whenever we discover new upgrade steps.

### Upgrading a Maven Application to Micronaut Framework 4.

If you use Maven to build your Micronaut applications, it is easy to update from Micronaut Framework 3 to Micronaut Framework 4 with the [OpenRewrite Maven plugin](https://docs.openrewrite.org/reference/rewrite-maven-plugin). You need to apply the recipes from the rewrite-micronaut module. There are two approaches:

- Modify your `pom.xml` directly with the necessary configuration.
- Invoke `mvn` from the command line, directly specifying all needed configuration via command flags.

If you’ve not used OpenRewrite before, follow the steps to modify your `pom.xml` directly in an application you’d like to try to upgrade, as it will help you get more familiar with the pieces involved. Once you are comfortable with how the [OpenRewrite Maven plugin](https://docs.openrewrite.org/reference/rewrite-maven-plugin) works in your environment, you can apply the plugin externally via the command line (perhaps encapsulating the command in a shell script).

### Modifying `pom.xml` directly

To enable the necessary OpenRewrite Maven goals for the upgrade, the necessary steps are:

1. Enable the [OpenRewrite Maven plugin](https://docs.openrewrite.org/reference/rewrite-maven-plugin)
2. Add the rewrite-micronaut dependency
3. Activate the Micronaut 3-to-4 upgrade recipe
4. Execute the newly configured Maven goals

#### Enabling the OpenRewrite Maven plugin

The OpenRewrite Gradle plugin `org.openrewrite.rewrite` must be added to the plugins section of a Micronaut Framework 3 app `pom.xml` as below:

```xml
<plugin>
  <groupId>org.openrewrite.maven</groupId>
  <artifactId>rewrite-maven-plugin</artifactId>
  <version>5.2.6</version>
</plugin>
```

#### Adding the rewrite-micronaut dependency

Next, add the rewrite module `org.openrewrite.recipe:rewrite-micronaut` to your dependencies section of the rewrite-maven-plugin in `pom.xml`:

```xml
<dependency>
  <groupId>org.openrewrite.recipe</groupId>
  <artifactId>rewrite-micronaut</artifactId>
  <version>2.1.1</version>
</dependency>
```

#### Activating the Micronaut Framework 3-to-4 upgrade recipe

Finally, you must make the Micronaut Framework 4 migration recipe active by adding the following configuration to the `rewrite-maven-plugin` in `pom.xml`:

```xml
<configuration>
  <activeRecipes>
    <recipe>org.openrewrite.java.micronaut.Micronaut3to4Migration</recipe>
  </activeRecipes>
</configuration>
```

#### Complete rewrite-maven-plugin configuration

The full rewrite-maven-plugin configuration in `pom.xml` should look like this:

```xml
<plugin>
  <groupId>org.openrewrite.maven</groupId>
  <artifactId>rewrite-maven-plugin</artifactId>
  <version>5.2.6</version>
  <configuration>
    <activeRecipes>
      <recipe>org.openrewrite.java.micronaut.Micronaut3to4Migration</recipe>
    </activeRecipes>
  </configuration>
  <dependencies>
    <dependency>
      <groupId>org.openrewrite.recipe</groupId>
      <artifactId>rewrite-micronaut</artifactId>
      <version>2.1.0</version>
    </dependency>
  </dependencies>
</plugin>
```

#### Executing the OpenRewrite Maven goals

The [OpenRewrite Maven plugin](https://github.com/openrewrite/rewrite-maven-plugin) provides a set of goals for listing and executing recipes against a configured application.

To execute the configured Micronaut Framework 4 migration recipe and see what actions it will take without making any actual changes to your source code, you can execute:

`./mvn rewrite:dryRun`

If the dry run executes without any errors and you are satisfied with the changes that the OpenRewrite recipe reports, you can then apply the changes to your application source code by executing:

`./mvn rewrite:run`

And that’s it, you now should have a fully functional Micronaut 4 application!

### Executing the OpenRewrite Maven plugin without modifying `pom.xml`

Once you are comfortable with how OpenRewrite works, see the [alternate approach](https://docs.openrewrite.org/running-recipes/running-rewrite-on-a-maven-project-without-modifying-the-build) outlined in the OpenRewrite documentation of executing the OpenRewrite Maven plugin directly from the command line by passing the necessary configuration flags.

In taking this approach, you will first want to revert the OpenRewrite configuration changes (if any) that you’ve made directly to your application’s `pom.xml` file.

To execute the Micronaut Framework 4 upgrade recipe, the command would be:

`mvn -U org.openrewrite.maven:rewrite-maven-plugin:run -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-micronaut:RELEASE -Drewrite.activeRecipes=org.openrewrite.java.micronaut.Micronaut3to4Migration`

### Feedback, Issue Reports, and Pull Requests are welcome!

If you encounter any issues applying the recipe to your application, please [raise an issue here](https://github.com/openrewrite/rewrite-micronaut/issues), and contributions via [pull request](https://github.com/openrewrite/rewrite-micronaut/pulls) are always welcome.
