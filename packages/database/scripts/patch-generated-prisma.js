const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "generated", "prisma", "client.ts");
if (!fs.existsSync(filePath)) {
  console.warn("Generated prisma client not found at", filePath);
  process.exit(0);
}
let src = fs.readFileSync(filePath, "utf8");

// If already patched, skip
if (src.includes("__PRISMA_IMPORT_META_URL__")) {
  console.log("Prisma client already patched");
  process.exit(0);
}

// Insert import for pathToFileURL if not present
if (!src.includes("pathToFileURL")) {
  src = src.replace(
    "import { fileURLToPath } from 'node:url'",
    "import { fileURLToPath, pathToFileURL } from 'node:url'"
  );
}

// Replace the globalThis dirname line with a safer version
const needle =
  "globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url))";
if (src.includes(needle)) {
  const replacement = `// patched: provide fallback for import.meta.url in CJS builds\nconst __PRISMA_IMPORT_META_URL__ = (typeof import.meta !== 'undefined' && import.meta.url) ? import.meta.url : (typeof __filename !== 'undefined' ? pathToFileURL(__filename).toString() : undefined);\nglobalThis['__dirname'] = path.dirname(fileURLToPath(__PRISMA_IMPORT_META_URL__));`;
  src = src.replace(needle, replacement);
  fs.writeFileSync(filePath, src, "utf8");
  console.log("Patched generated prisma client at", filePath);
} else {
  console.warn(
    "Could not find expected import.meta usage to patch in",
    filePath
  );
}
