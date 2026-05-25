import { macroAttribute } from "./listing.ts";
import { snippetMarkerHtml } from "./snippet-markers.ts";

export function dependencyBlocksHtml(target, attrs, context) {
  const dependency = dependencyForTargetAndAttributes(target.trim(), attrs, context);
  const gradle = gradleDependency(dependency);
  const maven = mavenDependency(dependency);
  return snippetMarkerHtml("dependency", {
    title: dependency.title,
    description: dependency.description,
    samples: [
      {
        language: "gradle",
        highlighterLanguage: "gradle",
        source: gradle
      },
      {
        language: "maven",
        highlighterLanguage: "maven",
        source: maven
      }
    ]
  });
}

function dependencyForTargetAndAttributes(target, attrs, context) {
  let groupId;
  let artifactId;
  let version;
  const groupAttribute = macroAttribute(attrs, "groupId") || macroAttribute(attrs, "group") || context.attributes.projectGroup;

  if (target.includes(":")) {
    const tokens = target.split(":");
    groupId = tokens[0] || "io.micronaut";
    artifactId = tokens[1];
    version = tokens.length === 3 ? tokens[2] : macroAttribute(attrs, "version");
  } else {
    groupId = groupAttribute || "io.micronaut";
    artifactId = target.startsWith("micronaut-") || !groupId.startsWith("io.micronaut.")
      ? target
      : `micronaut-${target}`;
    version = macroAttribute(attrs, "version");
  }

  return {
    groupId,
    artifactId,
    version,
    classifier: macroAttribute(attrs, "classifier"),
    gradleScope: macroAttribute(attrs, "gradleScope") || toGradleScope(attrs) || "implementation",
    mavenScope: macroAttribute(attrs, "mavenScope") || toMavenScope(attrs) || "compile",
    title: macroAttribute(attrs, "title") || "",
    description: macroAttribute(attrs, "description") || ""
  };
}

function toMavenScope(attrs) {
  const scope = macroAttribute(attrs, "scope");
  if (!scope) {
    return "";
  }
  return {
    api: "compile",
    implementation: "compile",
    testCompile: "test",
    testRuntime: "test",
    testRuntimeOnly: "test",
    testImplementation: "test",
    developmentOnly: "provided",
    compileOnly: "provided",
    runtimeOnly: "runtime"
  }[scope] || scope;
}

function toGradleScope(attrs) {
  const scope = macroAttribute(attrs, "scope");
  if (!scope) {
    return "";
  }
  return {
    compile: "implementation",
    testCompile: "testImplementation",
    test: "testImplementation",
    runtime: "runtimeOnly",
    provided: "developmentOnly"
  }[scope] || scope;
}

function gradleDependency(dependency) {
  const gav = `${dependency.groupId}:${dependency.artifactId}${dependency.version !== undefined || dependency.classifier !== undefined ? ":" : ""}${dependency.version || ""}${dependency.classifier !== undefined ? `:${dependency.classifier}` : ""}`;
  return `${dependency.gradleScope}("${gav}")`;
}

function mavenDependency(dependency) {
  if (dependency.mavenScope === "annotationProcessor") {
    return `<annotationProcessorPaths>
    <path>
        <groupId>${dependency.groupId}</groupId>
        <artifactId>${dependency.artifactId}</artifactId>${dependency.version ? `\n        <version>${dependency.version}</version>` : ""}${dependency.classifier ? `\n        <classifier>${dependency.classifier}</classifier>` : ""}
    </path>
</annotationProcessorPaths>`;
  }
  return `<dependency>
    <groupId>${dependency.groupId}</groupId>
    <artifactId>${dependency.artifactId}</artifactId>${dependency.version ? `\n    <version>${dependency.version}</version>` : ""}${dependency.mavenScope && dependency.mavenScope !== "compile" ? `\n    <scope>${dependency.mavenScope}</scope>` : ""}${dependency.classifier ? `\n    <classifier>${dependency.classifier}</classifier>` : ""}
</dependency>`;
}
