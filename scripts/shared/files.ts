import { promises as fs } from "node:fs";

export async function isRegularFile(file: string): Promise<boolean> {
  return (await fs.stat(file).catch(() => undefined))?.isFile() || false;
}

export async function isDirectory(file: string): Promise<boolean> {
  return (await fs.stat(file).catch(() => undefined))?.isDirectory() || false;
}

/**
 * How many files we are willing to hold open at once. Published docs surfaces
 * contain hundreds of thousands of files, so mapping over them with an
 * unbounded `Promise.all` exhausts the process file descriptor limit (EMFILE).
 */
export const FILE_CONCURRENCY = 64;

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        results[index] = await mapper(items[index], index);
      }
    }),
  );
  return results;
}
