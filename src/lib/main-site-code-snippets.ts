import { docsSnippetCodeLanguageIcon } from "@/components/web/docs-snippet-icons";
import { renderDocsSnippetTemplates } from "@/components/web/docs-snippet-templates";
import {
  codeLanguageFromFenceInfo,
  formatCodeLanguage,
  highlighterLanguageFor,
} from "@/lib/code-snippet-languages";
import { highlightCodeSnippetHtml } from "@/lib/docs-code-highlighting";

type CodeSample = {
  language: string;
  source: string;
};

const codeBlockPattern = /<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi;
const buttonGhostXsClass =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3";
const languageButtonClass =
  "docs-code-language language-option inline-flex h-6 items-center gap-1 align-middle leading-none text-code-muted aria-selected:font-semibold aria-selected:text-code-foreground";
const languageButtonActiveClass = "selected font-semibold text-code-foreground";
const languageButtonInactiveClass = "text-code-muted";
const languageTextClass =
  "docs-code-language-text inline-flex items-center leading-none";
const languageIconClass =
  "docs-code-language-icon inline-flex size-3.5 shrink-0 items-center justify-center self-center leading-none [&_svg]:block [&_svg]:size-full";
const languageIconFillClass = "docs-code-language-icon-fill";
const panelClass =
  "docs-code-content docs-snippet-card-content bg-code text-code-foreground";
const codePreClass =
  "shiki shiki-themes github-light-default github-dark-default !m-0 !max-w-full !overflow-x-auto !rounded-none !border-0 !bg-code !px-6 !py-4 text-sm !leading-6 !text-code-foreground";
const codeElementClass =
  "shiki-code grid min-w-max font-mono !text-[0.85rem] !leading-6 [&_.line]:min-h-[1.5rem] dark:[&_span[style]]:![color:var(--shiki-dark,var(--shiki-light,currentColor))] dark:[&_span[style]]:![font-style:var(--shiki-dark-font-style,var(--shiki-light-font-style,inherit))] dark:[&_span[style]]:![font-weight:var(--shiki-dark-font-weight,var(--shiki-light-font-weight,inherit))] dark:[&_span[style]]:![text-decoration:var(--shiki-dark-text-decoration,var(--shiki-light-text-decoration,inherit))] [&_.conum]:ml-1 [&_.conum]:inline-flex [&_.conum]:h-[1.05rem] [&_.conum]:w-[1.05rem] [&_.conum]:items-center [&_.conum]:justify-center [&_.conum]:rounded-full [&_.conum]:[border:1px_solid_color-mix(in_oklab,var(--code-foreground)_82%,var(--code))] [&_.conum]:bg-code-foreground [&_.conum]:![color:var(--code)] [&_.conum]:[font-family:var(--shell-font)] [&_.conum]:text-[0.68rem] [&_.conum]:leading-none [&_.conum]:font-bold [&_.conum]:not-italic [&_.conum]:align-[0.08em] [&_.conum::before]:content-[attr(data-value)]";
let snippetTemplates: ReturnType<typeof renderDocsSnippetTemplates> | undefined;

export async function renderMainSiteCodeSnippets(html: string) {
  const codeBlocks = Array.from(html.matchAll(codeBlockPattern));
  if (codeBlocks.length === 0) {
    return html;
  }

  let result = "";
  let position = 0;
  let snippetIndex = 0;
  for (const match of codeBlocks) {
    result += html.slice(position, match.index);
    const preAttributes = match[1] ?? "";
    const codeAttributes = match[2] ?? "";
    if (
      /\bshiki\b/.test(preAttributes) ||
      /\bdocs-code-block\b/.test(preAttributes)
    ) {
      result += match[0];
      position = (match.index ?? 0) + match[0].length;
      continue;
    }

    const source = decodeHtml(stripHtml(match[3] ?? "")).replace(/\n$/, "");
    const language = codeLanguageFromFenceInfo(
      codeLanguage(`${preAttributes} ${codeAttributes}`),
      source,
      "Main-site Markdown code block",
    );
    result += await renderStaticCodeSnippetCard(
      `main-site-code-snippet-${snippetIndex}`,
      [{ language, source }],
    );
    position = (match.index ?? 0) + match[0].length;
    snippetIndex += 1;
  }
  result += html.slice(position);
  return result;
}

async function renderStaticCodeSnippetCard(
  snippetId: string,
  samples: CodeSample[],
) {
  const template = getSnippetTemplates()["docs/snippets/code-snippet.html"];
  const optionButtonsHtml = samples
    .map((sample, index) =>
      renderLanguageOption({
        active: index === 0,
        label: formatCodeLanguage(sample.language),
        language: sample.language,
        panelId: `${snippetId}-panel-${index}`,
        tabId: `${snippetId}-tab-${index}`,
      }),
    )
    .join("");
  const snippetPanelsHtml = (
    await Promise.all(
      samples.map((sample, index) =>
        renderSnippetPanel({
          active: index === 0,
          language: sample.language,
          panelId: `${snippetId}-panel-${index}`,
          sample,
          tabId: `${snippetId}-tab-${index}`,
        }),
      ),
    )
  ).join("");

  return renderTemplate(template.html, {
    copyLabel: "Copy code",
    optionButtonsHtml,
    optionsLabel: html("Code language"),
    snippetId: attribute(snippetId),
    snippetPanelsHtml,
  });
}

function getSnippetTemplates() {
  snippetTemplates ??= renderDocsSnippetTemplates();
  return snippetTemplates;
}

function renderLanguageOption({
  active,
  label,
  language,
  panelId,
  tabId,
}: {
  active: boolean;
  label: string;
  language: string;
  panelId: string;
  tabId: string;
}) {
  const className = [
    buttonGhostXsClass,
    languageButtonClass,
    active ? languageButtonActiveClass : languageButtonInactiveClass,
  ].join(" ");
  return `<button data-slot="button" data-variant="ghost" data-size="xs" class="${attribute(className)}" type="button" id="${attribute(tabId)}" role="tab" aria-controls="${attribute(panelId)}" aria-selected="${active}" data-lang="${attribute(language)}" tabindex="${active ? "0" : "-1"}">${languageIconHtml(language)}<span class="${attribute(languageTextClass)}">${html(label)}</span></button>`;
}

function languageIconHtml(language: string) {
  const { icon, key } = docsSnippetCodeLanguageIcon(language);
  const className = `${languageIconClass} docs-code-language-icon-${key}${icon.fill ? ` ${languageIconFillClass}` : ""}`;
  const svgAttributes = icon.fill
    ? `fill="currentColor"`
    : `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  return `<span class="${attribute(className)}" aria-hidden="true"><svg viewBox="${attribute(icon.viewBox)}" ${svgAttributes} focusable="false">${icon.body}</svg></span>`;
}

async function renderSnippetPanel({
  active,
  language,
  panelId,
  sample,
  tabId,
}: {
  active: boolean;
  language: string;
  panelId: string;
  sample: CodeSample;
  tabId: string;
}) {
  const highlighted = await highlightCodeSnippetHtml(
    sample.source,
    highlighterLanguageFor(language),
  );
  return `<div id="${attribute(panelId)}" role="tabpanel" aria-labelledby="${attribute(tabId)}" aria-hidden="${!active}"${active ? "" : " hidden"} class="${attribute(panelClass)}">
<pre class="${attribute(codePreClass)}" tabindex="0"><code class="language-${attribute(language)} ${attribute(codeElementClass)}" data-lang="${attribute(language)}">${highlighted}</code></pre>
</div>`;
}

function renderTemplate(source: string, replacements: Record<string, string>) {
  return source.replace(
    /{{(\w+)}}/g,
    (_match, key: string) => replacements[key] ?? "",
  );
}

function codeLanguage(attributes: string) {
  const match =
    attributes.match(/\blanguage-([A-Za-z0-9_+-]+)/) ??
    attributes.match(/\bdata-lang="([^"]+)"/);
  return match?.[1] ?? "";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

function decodeHtml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'");
}

function html(value: string) {
  return attribute(value);
}

function attribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
