import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(projectRoot, "www");

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const entry of ["index.html", "manifest.webmanifest", "sw.js", "src"]) {
  cpSync(join(projectRoot, entry), join(outputDir, entry), { recursive: true });
}

console.log(`Web app built in ${outputDir}`);
