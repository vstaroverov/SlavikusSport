import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirName = process.argv[2] || "www";
const outputDir = join(projectRoot, outputDirName);

if (!["www", "docs"].includes(outputDirName)) {
  throw new Error("Build output must be www or docs");
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const entry of ["index.html", "manifest.webmanifest", "sw.js", "src"]) {
  cpSync(join(projectRoot, entry), join(outputDir, entry), { recursive: true });
}

const designFiles = [
  "design-system-v-star-group.tokens.css",
  "design-system-v-star-group.css",
  "design-system-v-star-group.products.css",
  "design-system-v-star-group.sport.css",
  "design-system-v-star-group.fonts.css"
];
const designOutput = join(outputDir, "design-system-v-star-group");
mkdirSync(join(designOutput, "assets", "fonts"), { recursive: true });
for (const file of designFiles) {
  cpSync(join(projectRoot, "design-system-v-star-group", file), join(designOutput, file));
}
cpSync(
  join(projectRoot, "design-system-v-star-group", "assets", "fonts", "Manrope-variable.ttf"),
  join(designOutput, "assets", "fonts", "Manrope-variable.ttf")
);
cpSync(
  join(projectRoot, "design-system-v-star-group", "assets", "slavikus-sport-logo.svg"),
  join(designOutput, "assets", "slavikus-sport-logo.svg")
);
cpSync(
  join(projectRoot, "design-system-v-star-group", "assets", "slavikus-sport-crown.svg"),
  join(designOutput, "assets", "slavikus-sport-crown.svg")
);
cpSync(
  join(projectRoot, "design-system-v-star-group", "assets", "slavikus-sport-invite-qr.svg"),
  join(designOutput, "assets", "slavikus-sport-invite-qr.svg")
);

console.log(`Web app built in ${outputDir}`);
