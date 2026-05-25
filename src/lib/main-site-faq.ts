import * as parse5 from "parse5";

export type MainSiteFaqItem = {
  id: string;
  question: string;
  answerHtml: string;
};

type HtmlNode = {
  nodeName: string;
  tagName?: string;
  attrs?: Array<{
    name: string;
    value: string;
  }>;
  childNodes?: HtmlNode[];
  value?: string;
};

function attr(node: HtmlNode, name: string) {
  return node.attrs?.find((item) => item.name === name)?.value;
}

function textContent(node: HtmlNode): string {
  if (node.nodeName === "#text") {
    return node.value ?? "";
  }
  return (node.childNodes ?? []).map(textContent).join("");
}

function isElement(node: HtmlNode, tagName: string) {
  return node.tagName === tagName;
}

function isQuestionHeading(node: HtmlNode) {
  return node.tagName ? /^h[2-4]$/.test(node.tagName) : false;
}

function serializeOuterHtml(node: HtmlNode) {
  const fragment = {
    nodeName: "#document-fragment",
    childNodes: [node]
  } as unknown as Parameters<typeof parse5.serialize>[0];
  return parse5.serialize(fragment);
}

function idFromQuestion(question: string, index: number) {
  const slug = question
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `faq-${index + 1}`;
}

function itemFromListItem(node: HtmlNode, index: number): MainSiteFaqItem | undefined {
  const children = node.childNodes ?? [];
  const heading = children.find(isQuestionHeading);
  if (!heading) {
    return undefined;
  }

  const question = textContent(heading).replace(/\s+/g, " ").trim();
  if (!question) {
    return undefined;
  }

  const headingLink = heading.childNodes?.find((child) => isElement(child, "a"));
  const anchorId = attr(headingLink ?? heading, "href")?.replace(/^#/, "")
    || attr(heading, "id")
    || idFromQuestion(question, index);
  const answerHtml = children
    .filter((child) => child !== heading)
    .map(serializeOuterHtml)
    .join("")
    .trim();

  return {
    id: anchorId,
    question,
    answerHtml
  };
}

export function extractFaqItemsFromHtml(html: string): MainSiteFaqItem[] {
  const fragment = parse5.parseFragment(html) as unknown as HtmlNode;
  const lists = (fragment.childNodes ?? []).filter((node) => isElement(node, "ul"));
  for (const list of lists) {
    const items = (list.childNodes ?? [])
      .filter((node) => isElement(node, "li"))
      .map(itemFromListItem)
      .filter((item): item is MainSiteFaqItem => Boolean(item));
    if (items.length > 0) {
      return items;
    }
  }
  return [];
}
