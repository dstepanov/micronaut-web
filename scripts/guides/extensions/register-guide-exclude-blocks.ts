import type {
  Block,
  BlockMacroProcessor,
  BlockProcessor,
  BlockProcessorDslInterface,
  MacroProcessorDslInterface,
  Reader,
  Registry,
  Section,
} from "@asciidoctor/core";

import type { GuideRenderContext } from "../model.ts";

const DEFAULT_MIN_JDK = 21;

type ExcludeBlockPredicate = (
  values: string[],
  context: GuideRenderContext,
) => boolean;

type ExcludePayload = {
  lines: string[];
  values: string[];
};

export function registerGuideExcludeBlocks(
  registry: Registry,
  context: GuideRenderContext,
): void {
  registerExcludeBlock(
    registry,
    "exclude-for-languages",
    (values, guideContext): boolean =>
      values.some(
        (value) =>
          value.toLowerCase() === guideContext.option.language.toLowerCase(),
      ),
    context,
  );
  registerExcludeBlock(
    registry,
    "exclude-for-build",
    (values, guideContext): boolean =>
      values.some(
        (value) =>
          value.toLowerCase() === guideContext.option.buildTool.toLowerCase(),
      ),
    context,
  );
  registerExcludeBlock(
    registry,
    "exclude-for-jdk-lower-than",
    (values, guideContext): boolean => {
      const threshold = Number.parseInt(values[0] || "", 10);
      const guideMinJdk = Number.parseInt(
        String(guideContext.guide.minimumJavaVersion || DEFAULT_MIN_JDK),
        10,
      );
      return Number.isFinite(threshold) && guideMinJdk >= threshold;
    },
    context,
  );
}

function registerExcludeBlock(
  registry: Registry,
  blockName: string,
  shouldExclude: ExcludeBlockPredicate,
  context: GuideRenderContext,
): void {
  registry.blockMacro(
    blockName,
    function registerGuideExcludeMacro(this: MacroProcessorDslInterface): void {
      this.process(async function processGuideExcludeMacro(
        this: BlockMacroProcessor,
        parent: unknown,
        target: unknown,
        attrs: unknown,
      ): Promise<Block> {
        const attributes = attrs as Record<string, unknown>;
        const payload = excludePayloadFromValue(attributes.payload);
        return renderExcludeLines(
          this,
          parent as Block | Section,
          payload.lines,
          payload.values.length ? payload.values : macroValues(target),
          shouldExclude,
          context,
        );
      });
    },
  );

  registry.block(function registerGuideExcludeBlock(
    this: BlockProcessorDslInterface,
  ): void {
    this.named(blockName);
    this.onContext("open");
    this.process(async function processGuideExcludeBlock(
      this: BlockProcessor,
      parent: unknown,
      reader: unknown,
      attrs: unknown,
    ): Promise<Block> {
      const attributes = attrs as Record<string, unknown>;
      const lines = await (reader as Reader).readLines();
      return renderExcludeLines(
        this,
        parent as Block | Section,
        lines,
        blockValues(attributes),
        shouldExclude,
        context,
      );
    });
  });
}

async function renderExcludeLines(
  processor: BlockProcessor | BlockMacroProcessor,
  parent: Block | Section,
  lines: string[],
  values: string[],
  shouldExclude: ExcludeBlockPredicate,
  context: GuideRenderContext,
): Promise<Block> {
  if (shouldExclude(values, context)) {
    return processor.createBlock(parent, "pass", "", {});
  }

  const holder = processor.createBlock(parent, "open", "", {});
  await processor.parseContent(
    guideContentParseTarget(parent, holder, lines),
    lines,
  );
  return holder;
}

function guideContentParseTarget(
  parent: Block | Section,
  holder: Block,
  lines: string[],
): Block | Section {
  return lines.some((line) => /^={1,6}\s+\S/.test(line)) ? parent : holder;
}

function blockValues(attributes: Record<string, unknown>): string[] {
  return Object.entries(attributes)
    .filter(([key]) => /^\d+$/.test(key) && Number(key) > 1)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([, value]) => String(value).trim())
    .filter(Boolean);
}

function macroValues(target: unknown): string[] {
  return String(target || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function excludePayloadFromValue(value: unknown): ExcludePayload {
  if (typeof value !== "string" || !value) {
    return { lines: [], values: [] };
  }
  try {
    const payload = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<ExcludePayload>;
    return {
      lines: Array.isArray(payload.lines)
        ? payload.lines.map((line) => String(line))
        : [],
      values: Array.isArray(payload.values)
        ? payload.values.map((item) => String(item).trim()).filter(Boolean)
        : [],
    };
  } catch {
    return { lines: [], values: [] };
  }
}
