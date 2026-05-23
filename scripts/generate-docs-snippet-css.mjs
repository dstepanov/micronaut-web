import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceFile = path.join(projectDirectory, "src", "styles", "docs-snippet-runtime.source.css");
const generatedFile = path.join(projectDirectory, "src", "styles", "generated", "docs-snippet-runtime.css");
const generatedBanner = "/* Generated from src/styles/docs-snippet-runtime.source.css by scripts/generate-docs-snippet-css.mjs. Do not edit directly. */\n";

const source = await fs.readFile(sourceFile, "utf8");
await fs.mkdir(path.dirname(generatedFile), { recursive: true });
await fs.writeFile(generatedFile, `${generatedBanner}${source}`);

console.log(`Generated ${path.relative(projectDirectory, generatedFile)}.`);
