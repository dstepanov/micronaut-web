import { promises as fs } from "node:fs";
import path from "node:path";

import type { Block, Registry, Section } from "@asciidoctor/core";

import { defineBlockMacro } from "../../asciidoc/extensions/define.ts";
import {
  type MacroPayload,
  macroPayload,
} from "../../asciidoc/extensions/macro-attributes.ts";
import { appFeatures, type Guide, type GuideRenderContext } from "../model.ts";

type GuideContentResolver = (payload: MacroPayload) => Promise<string[]>;

// Content macros whose output is plain AsciiDoc without includes or
// conditionals, so it can be parsed in place. Macros that expand to guide
// source (`common::`, `external::`, `callout::`, the templates) are expanded
// by the preprocessor instead, because their includes and callout lines must
// reach the document reader.
export function registerGuideContentBlocks(
  registry: Registry,
  context: GuideRenderContext,
): void {
  registerGuideContentMacro(registry, "rocker", (payload) =>
    includeGuideRocker(payload.target, context),
  );
  registerGuideContentMacro(registry, "diffLink", (payload) =>
    Promise.resolve([diffLink(payload.attributes, context)]),
  );
}

function registerGuideContentMacro(
  registry: Registry,
  macroName: string,
  resolveLines: GuideContentResolver,
): void {
  defineBlockMacro(registry, macroName, async function (parent, target, attrs) {
    const holder = this.createBlock(parent, "open", "", {});
    const lines = await resolveLines(macroPayload(target, attrs));
    await this.parseContent(
      guideContentParseTarget(parent, holder, lines),
      lines,
    );
    return holder;
  });
}

// Lines that introduce a section must be parsed against the real parent so the
// section lands in the document outline rather than inside a holder block.
function guideContentParseTarget(
  parent: Block | Section,
  holder: Block,
  lines: string[],
): Block | Section {
  return lines.some((line) => /^={1,6}\s+\S/.test(line)) ? parent : holder;
}

async function includeGuideRocker(
  target: string,
  context: GuideRenderContext,
): Promise<string[]> {
  const file = path.join(
    context.guidesDirectory,
    "buildSrc",
    "src",
    "main",
    "java",
    "io",
    "micronaut",
    "guides",
    "feature",
    "template",
    `${target.trim()}.rocker.raw`,
  );
  try {
    return (await fs.readFile(file, "utf8")).split(/\r?\n/);
  } catch {
    return [`NOTE: Missing rocker template \`${target.trim()}\`.`];
  }
}

function diffLink(
  attributes: Record<string, string>,
  context: GuideRenderContext,
): string {
  const appName = attributes.app || "default";
  const app = findApp(context.guide, appName);
  const excluded = new Set(
    (attributes.featureExcludes || "").split("|").filter(Boolean),
  );
  const features = (
    attributes.features
      ? attributes.features.split("|")
      : appFeatures(context.guide, context.option, appName)
  ).filter((feature) => feature && !excluded.has(feature));
  const params = new URLSearchParams();
  for (const feature of features) {
    params.append("features", feature);
  }
  params.set("lang", context.option.language.toUpperCase());
  params.set("build", context.option.buildTool.toUpperCase());
  params.set("test", context.option.testFramework.toUpperCase());
  params.set("name", appName === "default" ? "micronautguide" : appName);
  params.set("type", String(app?.applicationType || "DEFAULT").toUpperCase());
  params.set("package", "example.micronaut");
  params.set("activity", "diff");
  return `https://launch.micronaut.io?${params.toString()}[Diff, window="_blank"]`;
}

function findApp(
  guide: Guide,
  appName: string,
): Guide["apps"][number] | undefined {
  return guide.apps.find((app) => app.name === appName) || guide.apps[0];
}
