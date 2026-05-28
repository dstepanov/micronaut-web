import type {
  Block,
  Inline,
  InlineMacroProcessor,
  InlineMacroProcessorDslInterface,
  Registry,
} from "@asciidoctor/core";

export function registerGuideLinkMacro(registry: Registry): void {
  registry.inlineMacro(
    "guideLink",
    function registerGuideLinkMacro(
      this: InlineMacroProcessorDslInterface,
    ): void {
      this.process(function processGuideLinkMacro(
        this: InlineMacroProcessor,
        parent: unknown,
        target: unknown,
        attrs: unknown,
      ): Inline {
        return this.createInline(
          parent as Block,
          "anchor",
          String(macroText(attrs as Record<string, unknown>)),
          {
            type: "link",
            target: `${String(target)}.html`,
          },
        );
      });
    },
  );
}

type MacroAttributes = Record<string, unknown> & {
  text?: unknown;
  $positional?: unknown;
};

function macroText(attrs: MacroAttributes): string {
  const positional = Array.isArray(attrs.$positional)
    ? String(attrs.$positional[0] ?? "")
    : "";
  return macroAttribute(attrs, "text") || positional;
}

function macroAttribute(
  attrs: MacroAttributes | undefined,
  name: string,
): string | undefined {
  if (attrs?.[name] !== undefined) {
    return String(attrs[name]);
  }
  const positional = Array.isArray(attrs?.$positional)
    ? attrs.$positional.join(",")
    : undefined;
  const text = attrs?.text || positional;
  if (typeof text === "string") {
    const match = new RegExp(
      `(?:^|,)\\s*${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^,]+))`,
    ).exec(text);
    if (match) {
      return (match[1] ?? match[2] ?? match[3] ?? "").trim();
    }
  }
  return undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
