import path from "node:path";

import { projectApiBaseUri } from "../asciidoc/api-links.ts";

import {
  type DocsProject,
  type Properties,
  readProperties,
  readTomlStringVersions,
} from "./project-manifest.ts";

export function renderAttributes(
  project: DocsProject,
  platformVersion: string,
  submoduleDirectory: string,
  sourceDocsDirectory: string,
  projectProperties: Properties,
): Properties {
  const attributes: Properties = {
    ...projectProperties,
    title: project.displayName,
    version: platformVersion,
    safe: "UNSAFE",
    imagesdir: "../img",
    sourcedir: submoduleDirectory,
    sourceDir: submoduleDirectory,
    includedir: `${path.join(submoduleDirectory, "build", "working", "01-includes")}${path.sep}`,
    testsuitejava: path.join(
      submoduleDirectory,
      "test-suite",
      "src",
      "test",
      "java",
      "io",
      "micronaut",
      "docs",
    ),
    testsuitegroovy: path.join(
      submoduleDirectory,
      "test-suite-groovy",
      "src",
      "test",
      "groovy",
      "io",
      "micronaut",
      "docs",
    ),
    testsuitekotlin: path.join(
      submoduleDirectory,
      "test-suite-kotlin",
      "src",
      "test",
      "kotlin",
      "io",
      "micronaut",
      "docs",
    ),
    sourceRepo: sourceDocsEditUrl(project, docsSourcePath(project)),
    docdir: submoduleDirectory,
  };
  if (!attributes.api) {
    // Direct `{api}/...` links share the canonical javadoc host with the
    // `api:` macros; the local assets tree never contained javadoc.
    attributes.api = projectApiBaseUri({ project });
  }
  if (!attributes.githubSlug && project.repositoryUrl.includes("github.com/")) {
    attributes.githubSlug = project.repositoryUrl
      .replace(/^.*github\.com\//, "")
      .replace(/\.git$/, "");
  }
  if (!attributes.projectGroup && attributes.projectGroupId) {
    attributes.projectGroup = attributes.projectGroupId;
  }
  return attributes;
}

export function sourceDocsEditUrl(
  project: DocsProject,
  sourcePath: string = docsSourcePath(project),
): string {
  const branch = project.branch || "HEAD";
  return `${project.repositoryUrl.replace(/\.git$/, "")}/edit/${branch}/${sourcePath}`;
}

export function docsSourcePath(project: DocsProject): string {
  return project.docsSourceFile
    ? path.posix.dirname(project.docsSourceFile)
    : "src/main/docs";
}

/**
 * The attributes a single-document project's own Gradle build hands
 * Asciidoctor. Rendering the sources outside Gradle has to resolve them from
 * the same files the build reads: the Micronaut Gradle plugin declares them in
 * its `asciidoctorj` block from its version catalog and wrapper.
 */
export async function singleDocumentAttributes(
  submoduleDirectory: string,
  projectProperties: Properties,
): Promise<Properties> {
  const versions = await readTomlStringVersions(
    path.join(submoduleDirectory, "gradle", "libs.versions.toml"),
    false,
  );
  const wrapper = await readProperties(
    path.join(
      submoduleDirectory,
      "gradle",
      "wrapper",
      "gradle-wrapper.properties",
    ),
    false,
  );
  const attributes: Record<string, string | undefined> = {
    "gradle-project-version": projectProperties.projectVersion,
    "gradle-version": /gradle-([^-]+)-(?:bin|all)\.zip/.exec(
      wrapper.distributionUrl || "",
    )?.[1],
    "kotlin-version": versions.kotlin,
    "micronaut-version": versions["micronaut-platform"],
    "native-build-tools-version": versions.graalvmPlugin,
    "shadow-version": versions.shadow,
  };
  // An attribute defined as empty renders as nothing at all; leaving it
  // undefined keeps the unresolved reference visible in the output instead.
  return Object.fromEntries(
    Object.entries(attributes).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );
}
