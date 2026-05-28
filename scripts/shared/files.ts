import { promises as fs } from "node:fs";

export async function isRegularFile(file: string): Promise<boolean> {
  return (await fs.stat(file).catch(() => undefined))?.isFile() || false;
}

export async function isDirectory(file: string): Promise<boolean> {
  return (await fs.stat(file).catch(() => undefined))?.isDirectory() || false;
}
