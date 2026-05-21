pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        mavenCentral()
    }
}

rootProject.name = "micronaut-web"

include("micronaut-web-template")
include("micronaut-web-docs")
include("micronaut-web-guides")
include("launch-playwright-tests")
