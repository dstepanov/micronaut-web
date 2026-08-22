// The guide preprocessor rewrites guide macros into `[name,payload=...]` open
// blocks so the block processors can run after the reader has been prepared.
// The payload is a base64url-encoded JSON value; this module owns both sides of
// that contract so the encoder and every decoder cannot drift apart.

export function encodeBlockPayload(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

// Throws on malformed input, matching the block processors' expectation that a
// payload the preprocessor emitted is always well-formed. Callers that accept
// hand-written payloads wrap this in their own guard.
export function decodeBlockPayload<T>(value: unknown): T {
  return JSON.parse(
    Buffer.from(String(value || ""), "base64url").toString("utf8"),
  ) as T;
}

export type MacroPayload = {
  attributes: Record<string, string>;
  target: string;
};

export function macroPayload(target: string, attrs: unknown): MacroPayload {
  return {
    attributes: stringAttributes(attrs),
    target,
  };
}

// Asciidoctor attribute values may be numbers or booleans; the preprocessor
// and the processors agree on strings so the encoded payload round-trips.
export function stringAttributes(attrs: unknown): Record<string, string> {
  return Object.fromEntries(
    Object.entries((attrs || {}) as Record<string, unknown>).map(
      ([key, value]) => [key, String(value)],
    ),
  );
}

export function missingNotePayload(message: string): {
  kind: "code";
  samples: Array<{ language: string; source: string }>;
  title: string;
} {
  return {
    kind: "code",
    samples: [
      {
        language: "text",
        source: `NOTE: ${message}`,
      },
    ],
    title: "",
  };
}
