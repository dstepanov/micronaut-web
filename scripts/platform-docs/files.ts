import { promises as fs } from "node:fs";

export async function isRegularFile(file) {
  return (await fs.stat(file).catch(() => undefined))?.isFile() || false;
}

export async function isDirectory(file) {
  return (await fs.stat(file).catch(() => undefined))?.isDirectory() || false;
}
