// Build-tool dependency text shared by the docs `dependency::` macro and the
// guides `dependency::` macro and `:dependencies:` groups. The surfaces differ
// only in how they assemble a Dependency from macro attributes and in two
// presentation conventions captured by MavenRenderOptions.

export type Dependency = {
  groupId: string;
  artifactId: string;
  version?: string;
  classifier?: string;
  // Resolved Gradle configuration name, e.g. `implementation`.
  gradleScope: string;
  // Resolved Maven scope, e.g. `compile`.
  mavenScope: string;
  // A BOM imported as a Gradle platform / Maven dependencyManagement import.
  pom?: boolean;
  // Maven property used as the version of an annotation processor path when
  // no explicit version is given, e.g. `${micronaut.version}`.
  versionProperty?: string;
  // Callout number appended to the first line as a `// <N>` marker.
  callout?: string;
};

export type MavenRenderOptions = {
  // Kotlin annotation processors are configured on the kotlin-maven-plugin,
  // which names the element `annotationProcessorPath`.
  language?: string;
  // Wrap annotation processor paths in `<annotationProcessorPaths>` (docs)
  // instead of emitting a bare `<path>` with a hint comment (guides).
  wrapAnnotationProcessorPaths?: boolean;
  // Print `<scope>compile</scope>` instead of relying on Maven's default.
  explicitCompileScope?: boolean;
};

const GRADLE_SCOPES: Record<string, string> = {
  compile: "implementation",
  provided: "developmentOnly",
  runtime: "runtimeOnly",
  test: "testImplementation",
  testCompile: "testImplementation",
};

const MAVEN_SCOPES: Record<string, string> = {
  annotationProcessor: "compile",
  api: "compile",
  compileOnly: "provided",
  developmentOnly: "provided",
  implementation: "compile",
  runtimeOnly: "runtime",
  testCompile: "test",
  testImplementation: "test",
  testRuntime: "test",
  testRuntimeOnly: "test",
};

// Maps the scope written in a macro (Gradle or Maven vocabulary) to the Gradle
// configuration it should render as.
export function gradleScope(
  scope: string | undefined,
  language?: string,
): string {
  if (!scope) {
    return "implementation";
  }
  if (scope === "annotationProcessor") {
    const normalized = String(language || "").toLowerCase();
    if (normalized === "kotlin") {
      return "kapt";
    }
    if (normalized === "groovy") {
      return "compileOnly";
    }
  }
  return GRADLE_SCOPES[scope] || scope;
}

export function mavenScope(scope: string | undefined): string {
  if (!scope) {
    return "compile";
  }
  return MAVEN_SCOPES[scope] || scope;
}

export function isAnnotationProcessor(dependency: Dependency): boolean {
  return (
    dependency.gradleScope === "annotationProcessor" ||
    dependency.gradleScope === "kapt" ||
    dependency.mavenScope === "annotationProcessor"
  );
}

export function gradleDependencyLine(dependency: Dependency): string {
  const configuration = dependency.pom
    ? `${dependency.gradleScope} platform`
    : dependency.gradleScope;
  return `${configuration}("${gradleCoordinates(dependency)}")${calloutMarker(dependency)}`;
}

function gradleCoordinates(dependency: Dependency): string {
  let coordinates = `${dependency.groupId}:${dependency.artifactId}`;
  if (dependency.version || dependency.classifier !== undefined) {
    coordinates += `:${dependency.version || ""}`;
  }
  if (dependency.classifier !== undefined) {
    coordinates += `:${dependency.classifier}`;
  }
  return coordinates;
}

export function mavenDependencyLines(
  dependency: Dependency,
  options: MavenRenderOptions = {},
): string[] {
  if (isAnnotationProcessor(dependency)) {
    return mavenAnnotationProcessorLines(dependency, options);
  }
  const scope = dependency.pom ? "import" : dependency.mavenScope;
  const scopeLines =
    scope !== "compile" || options.explicitCompileScope
      ? [`    <scope>${scope}</scope>`]
      : [];
  return [
    ...(dependency.pom
      ? ["<!-- Add the following to your dependencyManagement element -->"]
      : []),
    `<dependency>${calloutMarker(dependency)}`,
    `    <groupId>${dependency.groupId}</groupId>`,
    `    <artifactId>${dependency.artifactId}</artifactId>`,
    ...(dependency.version
      ? [`    <version>${dependency.version}</version>`]
      : []),
    ...(dependency.pom ? ["    <type>pom</type>"] : []),
    ...scopeLines,
    ...(dependency.classifier
      ? [`    <classifier>${dependency.classifier}</classifier>`]
      : []),
    "</dependency>",
    ...(dependency.pom ? [""] : []),
  ];
}

export function mavenDependencyXml(
  dependency: Dependency,
  options: MavenRenderOptions = {},
): string {
  return mavenDependencyLines(dependency, options).join("\n");
}

function mavenAnnotationProcessorLines(
  dependency: Dependency,
  options: MavenRenderOptions,
): string[] {
  const elementName =
    String(options.language || "").toLowerCase() === "kotlin"
      ? "annotationProcessorPath"
      : "path";
  const version = dependency.version || dependency.versionProperty;
  const pathLines = [
    `<${elementName}>${calloutMarker(dependency)}`,
    `    <groupId>${dependency.groupId}</groupId>`,
    `    <artifactId>${dependency.artifactId}</artifactId>`,
    ...(version ? [`    <version>${version}</version>`] : []),
    ...(dependency.classifier
      ? [`    <classifier>${dependency.classifier}</classifier>`]
      : []),
    `</${elementName}>`,
  ];
  if (options.wrapAnnotationProcessorPaths) {
    return [
      "<annotationProcessorPaths>",
      ...pathLines.map((line) => `    ${line}`),
      "</annotationProcessorPaths>",
    ];
  }
  return [
    "<!-- Add the following to your annotationProcessorPaths element -->",
    ...pathLines,
  ];
}

function calloutMarker(dependency: Dependency): string {
  return dependency.callout && /^\d+$/.test(dependency.callout)
    ? ` // <${dependency.callout}>`
    : "";
}
