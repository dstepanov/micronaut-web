import { attribute } from "./html.mjs";

export function snippetMarkerHtml(kind, payload) {
  return `<micronaut-snippet data-kind="${attribute(kind)}" data-payload="${attribute(encodePayload({
    ...payload,
    kind
  }))}"></micronaut-snippet>`;
}

export function decodeSnippetMarkerPayload(value) {
  return JSON.parse(Buffer.from(String(value || ""), "base64url").toString("utf8"));
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}
