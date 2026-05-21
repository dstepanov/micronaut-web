package io.micronaut.web.gradle

import java.util.zip.ZipFile
import org.gradle.api.GradleException
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.tasks.Copy
import org.gradle.api.tasks.bundling.Jar
import org.gradle.language.jvm.tasks.ProcessResources
import org.gradle.kotlin.dsl.named
import org.gradle.kotlin.dsl.register

class MicronautWebStaticSurfacePlugin : Plugin<Project> {

    override fun apply(project: Project) {
        project.rootProject.plugins.apply("io.micronaut.web.root")
        project.plugins.apply("io.micronaut.web.java-library")

        val surface = project.name.removePrefix("micronaut-web-")
        if (surface !in setOf("docs", "guides")) {
            throw GradleException("Static surface project '${project.name}' must be named micronaut-web-docs or micronaut-web-guides.")
        }

        val npmBuild = project.rootProject.tasks.named("npmBuild")
        val generatedTemplates = project.rootProject.layout.projectDirectory.dir("dist/micronaut-web/templates/$surface")
        val manifestFile = project.rootProject.layout.projectDirectory.file("dist/micronaut-web/manifests/$surface-assets-manifest.json")
        val surfaceOutput = project.rootProject.layout.projectDirectory.dir("dist/$surface")
        val astroAssets = project.rootProject.layout.projectDirectory.dir("dist/_astro")
        val micronautAssets = project.rootProject.layout.projectDirectory.dir("dist/micronaut-assets")
        val resourceRoot = "META-INF/micronaut-web"
        val surfaceRoot = "$resourceRoot/surfaces/$surface"

        project.tasks.named<ProcessResources>("processResources") {
            dependsOn(npmBuild)
            duplicatesStrategy = org.gradle.api.file.DuplicatesStrategy.EXCLUDE

            from(generatedTemplates) {
                into("$resourceRoot/templates")
            }
            from(manifestFile) {
                into(resourceRoot)
                rename { "assets-manifest.json" }
            }
            from(surfaceOutput) {
                into("$surfaceRoot/$surface")
            }
            from(astroAssets) {
                into("$surfaceRoot/_astro")
            }
            from(micronautAssets) {
                into("$surfaceRoot/micronaut-assets")
            }
        }

        val verifyStaticSurfaceJar = project.tasks.register("verifyStaticSurfaceJar") {
            group = "verification"
            description = "Verifies the packaged $surface static resource jar contract."
            dependsOn(project.tasks.named("jar"))
            doLast {
                val jarFile = project.tasks.named<Jar>("jar").get().archiveFile.get().asFile
                ZipFile(jarFile).use { zip ->
                    val entries = zip.entries().asSequence().map { it.name }.toSet()
                    fun requireEntry(entry: String) {
                        if (entry !in entries) {
                            throw GradleException("Expected $jarFile to contain $entry")
                        }
                    }
                    fun requirePrefix(prefix: String) {
                        if (entries.none { it.startsWith(prefix) }) {
                            throw GradleException("Expected $jarFile to contain an entry below $prefix")
                        }
                    }

                    requireEntry("$resourceRoot/templates/$surface-index.html")
                    requireEntry("$resourceRoot/templates/$surface-page.html")
                    requireEntry("$resourceRoot/assets-manifest.json")
                    requireEntry("$surfaceRoot/$surface/index.html")
                    requirePrefix("$surfaceRoot/$surface/")
                    requirePrefix("$surfaceRoot/_astro/")
                    requireEntry("$surfaceRoot/micronaut-assets/icons/micronaut-sally.svg")

                    val forbiddenSurface = if (surface == "docs") "guides" else "docs"
                    val forbiddenPrefix = "$surfaceRoot/$forbiddenSurface/"
                    if (entries.any { it.startsWith(forbiddenPrefix) }) {
                        throw GradleException("Expected $jarFile not to contain entries below $forbiddenPrefix")
                    }
                }
            }
        }

        project.tasks.named("check") {
            dependsOn(verifyStaticSurfaceJar)
        }
    }
}
