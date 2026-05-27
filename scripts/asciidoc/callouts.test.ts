import assert from "node:assert/strict";
import test from "node:test";

import {
  MANUAL_CALLOUTS_CLASS,
  normalizeAsciiDocCallouts,
  normalizeSourceCalloutMarkers,
} from "./callouts.ts";
import { snippetPassthroughBlock } from "./snippet-blocks.ts";
import { decodeSnippetMarkerPayload } from "./snippet-markers.ts";

test("normalizeAsciiDocCallouts renumbers snippet marker payloads and splits manual callouts", (): any => {
  const source = [
    snippetPassthroughBlock("code", {
      samples: [
        {
          language: "java",
          source: [
            "class Example {",
            "    void one() {} // <2>",
            "    void two() {} // <4>",
            "}",
          ].join("\n"),
        },
      ],
    }),
    "<2> First source callout.",
    "<4> Second source callout.",
    "<5> Manual callout.",
  ].join("\n");

  const normalized = normalizeAsciiDocCallouts(source);
  const payloadValue = /\bdata-payload="([^"]+)"/.exec(normalized)?.[1] || "";
  const payload = decodeSnippetMarkerPayload(payloadValue);

  assert.match(payload.samples[0].source, /<1>/);
  assert.match(payload.samples[0].source, /<2>/);
  assert.doesNotMatch(payload.samples[0].source, /<4>/);
  assert.match(normalized, /^<1> First source callout\.$/m);
  assert.match(normalized, /^<2> Second source callout\.$/m);
  assert.match(
    normalized,
    new RegExp(`^\\[\\.${MANUAL_CALLOUTS_CLASS}\\]$`, "m"),
  );
  assert.match(normalized, /^\. Manual callout\.$/m);
});

test("normalizeSourceCalloutMarkers converts guide shorthand comment markers", (): any => {
  assert.equal(
    normalizeSourceCalloutMarkers(
      ["name=weather", "# 1>", "transport=http"].join("\n"),
    ),
    ["name=weather", "# <1>", "transport=http"].join("\n"),
  );
});
