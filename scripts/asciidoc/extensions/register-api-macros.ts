import type {
  Block,
  Inline,
  InlineMacroProcessor,
  InlineMacroProcessorDslInterface,
  Registry,
} from "@asciidoctor/core";

const API_MACROS = [
  "api",
  "ann",
  "mnapi",
  "jdk",
  "jee",
  "rs",
  "rx",
  "reactor",
] as const;

type ApiKind = (typeof API_MACROS)[number];

type ApiMacroContext = Record<string, unknown> & {
  project?: {
    slug?: string;
  };
  attributes?: Record<string, string | undefined>;
};

type MacroAttributes = Record<string, unknown> & {
  text?: unknown;
  $positional?: unknown;
};

type ParsedApiTarget = {
  classTarget: string;
  methodRef: string;
  propRef: string;
  shortName: string;
};

type ApiLibrary = {
  defaultUri: string;
  packagePrefix: string | null;
  attributeKey: string | null;
};

export function registerApiMacros(
  registry: Registry,
  context: ApiMacroContext,
): void {
  for (const kind of API_MACROS) {
    registry.inlineMacro(
      kind,
      function registerApiMacro(this: InlineMacroProcessorDslInterface): void {
        this.process(function processApiMacro(
          this: InlineMacroProcessor,
          parent: unknown,
          target: unknown,
          attrs: unknown,
        ): Inline {
          const link = apiLink(
            context,
            kind,
            String(target),
            attrs as Record<string, unknown>,
          );
          return this.createInline(parent as Block, "anchor", link.label, {
            type: "link",
            target: link.href,
          });
        });
      },
    );
  }
}

function apiLink(
  context: ApiMacroContext,
  kind: ApiKind,
  target: string,
  attrs: MacroAttributes,
): { href: string; label: string } {
  const parsed = parseApiTarget(target);
  const library = apiLibrary(context, kind, attrs);
  let baseUri = apiBaseUri(context, library.attributeKey, library);
  const module = apiModule(parsed.classTarget, attrs);
  if (module) {
    baseUri = `${baseUri}/${module}`;
  }

  let label = macroText(attrs) || parsed.shortName;
  if (kind === "ann") {
    label = `@${label}`;
  }

  const href =
    `${baseUri}/${targetPathUrl(parsed.classTarget, library.packagePrefix)}.html${parsed.methodRef}${parsed.propRef}`.replaceAll(
      "$",
      ".",
    );
  return { href, label };
}

function parseApiTarget(target: string): ParsedApiTarget {
  const methodIndex = target.lastIndexOf("(");
  const propIndex = target.lastIndexOf("#");
  let classTarget = target;
  let methodRef = "";
  let propRef = "";
  let shortName: string;

  if (methodIndex > -1 && target.endsWith(")")) {
    const signature = target.slice(methodIndex + 1, -1);
    const withoutSignature = target.slice(0, methodIndex);
    const methodSeparator = withoutSignature.lastIndexOf(".");
    if (methodSeparator < 0) {
      shortName = target;
    } else {
      const methodName = withoutSignature.slice(methodSeparator + 1);
      classTarget = withoutSignature.slice(0, methodSeparator);
      methodRef = `#${methodName}-${signature.split(",").join("-")}-`;
      shortName = `${simpleName(classTarget)}.${methodName}(${signature})`;
    }
  } else if (propIndex > -1) {
    propRef = target.slice(propIndex);
    classTarget = target.slice(0, propIndex);
    shortName = propRef.slice(1);
  } else {
    shortName = simpleName(target);
  }

  return { classTarget, methodRef, propRef, shortName };
}

function apiLibrary(
  context: ApiMacroContext,
  kind: ApiKind,
  attrs: MacroAttributes,
): ApiLibrary {
  const projectSlug = context.project?.slug || "core";
  const localApi = `assets/${projectSlug}/docs/api`;
  const libraries: Record<ApiKind, ApiLibrary> = {
    api: {
      defaultUri: localApi,
      packagePrefix: "io.micronaut.",
      attributeKey: null,
    },
    ann: {
      defaultUri: localApi,
      packagePrefix: "io.micronaut.",
      attributeKey: null,
    },
    mnapi: {
      defaultUri: "https://docs.micronaut.io/latest/api",
      packagePrefix: "io.micronaut.",
      attributeKey: "micronautApi",
    },
    jdk: {
      defaultUri: "https://docs.oracle.com/en/java/javase/21/docs/api",
      packagePrefix: null,
      attributeKey: "jdkapi",
    },
    jee: {
      defaultUri: "https://docs.oracle.com/javaee/6/api",
      packagePrefix: null,
      attributeKey: "jeeapi",
    },
    rs: {
      defaultUri:
        "https://www.reactive-streams.org/reactive-streams-1.0.3-javadoc",
      packagePrefix: "org.reactivestreams.",
      attributeKey: "rsapi",
    },
    rx: {
      defaultUri: "http://reactivex.io/RxJava/2.x/javadoc",
      packagePrefix: "io.reactivex.",
      attributeKey: "rxapi",
    },
    reactor: {
      defaultUri: "https://projectreactor.io/docs/core/release/api",
      packagePrefix: "reactor.core.publisher.",
      attributeKey: "reactorapi",
    },
  };
  const library = { ...libraries[kind] };
  const defaultUri = macroAttribute(attrs, "defaultUri");
  const packagePrefix = macroAttribute(attrs, "packagePrefix");
  if (defaultUri !== undefined) {
    library.defaultUri = defaultUri;
  }
  if (packagePrefix !== undefined) {
    library.packagePrefix = packagePrefix;
  }
  return library;
}

function apiBaseUri(
  context: ApiMacroContext,
  attributeKey: string | null,
  library: ApiLibrary,
): string {
  if (attributeKey) {
    const configured =
      context.attributes?.[attributeKey] ||
      context.attributes?.[attributeKey.toLowerCase()];
    if (configured) {
      return configured;
    }
  }
  return library.defaultUri;
}

function apiModule(classTarget: string, attrs: MacroAttributes): string {
  const configured = macroAttribute(attrs, "module");
  if (configured !== undefined) {
    return configured;
  }
  return classTarget.startsWith("java") ? "java.base" : "";
}

function targetPathUrl(target: string, packagePrefix: string | null): string {
  let result = target;
  if (packagePrefix && !target.startsWith(packagePrefix)) {
    result = `${packagePrefix}${target}`;
  }
  return scapeDots(result);
}

function scapeDots(value: string): string {
  const tokens = value.split(".");
  let result = "";
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token) {
      continue;
    }
    result += token;
    if (/^[A-Z]/.test(token)) {
      if (index !== tokens.length - 1) {
        result += ".";
      }
    } else {
      result += "/";
    }
  }
  return result;
}

function simpleName(className: string): string {
  return className.split(".").filter(Boolean).at(-1) || className;
}

function macroAttribute(
  attrs: MacroAttributes | undefined,
  name: string,
): string | undefined {
  if (attrs?.[name] !== undefined) {
    return cleanMacroAttributeValue(String(attrs[name]), name);
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
      return cleanMacroAttributeValue(
        (match[1] ?? match[2] ?? match[3] ?? "").trim(),
        name,
      );
    }
  }
  return undefined;
}

function macroText(attrs: MacroAttributes): string {
  const positional = Array.isArray(attrs.$positional)
    ? String(attrs.$positional[0] ?? "")
    : "";
  return macroAttribute(attrs, "text") || positional;
}

function cleanMacroAttributeValue(value: string, name: string): string {
  if (name !== "title") {
    return value;
  }
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && !trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && !trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1);
  }
  if (
    (!trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (!trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
