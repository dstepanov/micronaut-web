import path from "node:path";

import { projectApiBaseUri } from "../asciidoc/api-links.ts";

import type { DocsProject, Properties } from "./project-manifest.ts";

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
    sourceRepo: sourceDocsEditUrl(project),
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

export function sourceDocsEditUrl(project: DocsProject): string {
  const branch = project.branch || "HEAD";
  return `${project.repositoryUrl.replace(/\.git$/, "")}/edit/${branch}/src/main/docs`;
}
