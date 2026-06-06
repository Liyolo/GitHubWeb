import { readFile } from "node:fs/promises";

const scriptPairs = [
  ["src/scripts/post-search.js", "public/scripts/post-search.js"],
  ["src/scripts/visit-counter.js", "public/scripts/visit-counter.js"],
];

const mismatches = [];

for (const [sourcePath, publicPath] of scriptPairs) {
  const [sourceContent, publicContent] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(publicPath, "utf8"),
  ]);

  if (sourceContent !== publicContent) {
    mismatches.push(`${sourcePath} vs ${publicPath}`);
  }
}

if (mismatches.length > 0) {
  console.error("Public scripts are out of sync:");
  for (const mismatch of mismatches) {
    console.error(`- ${mismatch}`);
  }
  process.exit(1);
}

console.log("Public scripts are in sync.");
