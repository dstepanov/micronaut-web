import { attribute, escapeRegExp, html } from "./html.mjs";

export function listingBlockHtml(source, language, title, classes, highlighterLanguage = language, description = "") {
  const className = `listingblock${classes ? ` ${classes}` : ""}`;
  const titleHtml = title ? `<div class="title">${inlineTitleHtml(title)}</div>\n` : "";
  const descriptionHtml = description ? `<div class="description">${inlineTitleHtml(description)}</div>\n` : "";
  return `<div class="${attribute(className)}">
${titleHtml}${descriptionHtml}<div class="content">
<pre><code class="language-${attribute(highlighterLanguage)}" data-lang="${attribute(language)}">${html(source.trimEnd())}</code></pre>
</div>
</div>`;
}

export function macroAttribute(attrs, name) {
  if (attrs?.[name] !== undefined) {
    return cleanMacroAttributeValue(String(attrs[name]), name);
  }
  const text = attrs?.text || attrs?.$positional?.join(",");
  if (typeof text === "string") {
    const match = new RegExp(`(?:^|,)\\s*${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^,]+))`).exec(text);
    if (match) {
      return cleanMacroAttributeValue((match[1] ?? match[2] ?? match[3] ?? "").trim(), name);
    }
  }
  return undefined;
}

export function macroText(attrs) {
  return macroAttribute(attrs, "text") || attrs?.$positional?.[0] || "";
}

function cleanMacroAttributeValue(value, name) {
  if (name !== "title") {
    return value;
  }
  const trimmed = value.trim();
  if ((trimmed.startsWith("\"") && !trimmed.endsWith("\"")) || (trimmed.startsWith("'") && !trimmed.endsWith("'"))) {
    return trimmed.slice(1);
  }
  if ((!trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (!trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

export function inlineTitleHtml(value) {
  let escaped = html(value);
  escaped = escaped.replace(/`([^`\r\n]+)`/g, (_, code) => `<code>${code}</code>`);
  return escaped;
}
