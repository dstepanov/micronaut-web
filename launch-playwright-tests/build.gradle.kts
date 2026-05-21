plugins {
    java
}

group = "io.micronaut.web"
version = "0.1.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    testImplementation(platform(libs.junit.bom))
    testImplementation(libs.junit.jupiter)
    testImplementation(libs.playwright)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.test {
    useJUnitPlatform()
    systemProperty("launch.baseUrl", providers.environmentVariable("LAUNCH_BASE_URL").orElse("http://127.0.0.1:4321/launch/").get())
    systemProperty("launch.apiBaseUrl", providers.environmentVariable("LAUNCH_API_BASE_URL").orElse("https://launch.micronaut.io").get())
    systemProperty("launch.browserChannel", providers.environmentVariable("LAUNCH_BROWSER_CHANNEL").orElse("chrome").get())
    environment("PLAYWRIGHT_BROWSERS_PATH", layout.buildDirectory.dir("ms-playwright").get().asFile.absolutePath)
}
