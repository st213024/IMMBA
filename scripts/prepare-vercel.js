/**
 * Vercel build：將官網靜態檔複製到 dist/，讓首頁 index.html 位於輸出根目錄。
 */
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "TM2026_remote");
const dest = path.join(__dirname, "..", "dist");

if (!fs.existsSync(src)) {
  console.error("Missing TM2026_remote directory:", src);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });

const indexPath = path.join(dest, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("Build failed: dist/index.html not found after copy.");
  process.exit(1);
}

console.log("Vercel build OK: copied TM2026_remote -> dist");
