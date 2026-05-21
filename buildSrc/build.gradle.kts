plugins {
    `kotlin-dsl`
}

repositories {
    gradlePluginPortal()
    mavenCentral()
}

gradlePlugin {
    plugins {
        create("micronautWebRoot") {
            id = "io.micronaut.web.root"
            implementationClass = "io.micronaut.web.gradle.MicronautWebRootPlugin"
        }
        create("micronautWebJavaLibrary") {
            id = "io.micronaut.web.java-library"
            implementationClass = "io.micronaut.web.gradle.MicronautWebJavaLibraryPlugin"
        }
        create("micronautWebStaticSurface") {
            id = "io.micronaut.web.static-surface"
            implementationClass = "io.micronaut.web.gradle.MicronautWebStaticSurfacePlugin"
        }
    }
}
