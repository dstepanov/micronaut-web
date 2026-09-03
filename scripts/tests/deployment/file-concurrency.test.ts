import assert from "node:assert/strict";
import test from "node:test";

import { mapWithConcurrency } from "../../shared/files.ts";

test("mapWithConcurrency keeps results in input order", async () => {
  const results = await mapWithConcurrency(
    [1, 2, 3, 4, 5],
    2,
    async (value) => {
      await new Promise((resolve) => setTimeout(resolve, (5 - value) * 2));
      return value * 10;
    },
  );

  assert.deepEqual(results, [10, 20, 30, 40, 50]);
});

test("mapWithConcurrency never exceeds the requested concurrency", async () => {
  const items = Array.from({ length: 100 }, (_, index) => index);
  let inFlight = 0;
  let peak = 0;

  await mapWithConcurrency(items, 4, async (item) => {
    inFlight += 1;
    peak = Math.max(peak, inFlight);
    await new Promise((resolve) => setTimeout(resolve, item % 3));
    inFlight -= 1;
  });

  assert.equal(peak, 4);
});

test("mapWithConcurrency handles an empty input", async () => {
  assert.deepEqual(
    await mapWithConcurrency([], 4, async () => {
      throw new Error("should not be called");
    }),
    [],
  );
});

test("mapWithConcurrency propagates mapper failures", async () => {
  await assert.rejects(
    mapWithConcurrency([1, 2, 3], 2, async (value) => {
      if (value === 2) {
        throw new Error("boom");
      }
      return value;
    }),
    /boom/,
  );
});
