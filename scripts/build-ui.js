import { readFileSync, writeFileSync } from "fs";

const html = readFileSync("public/index.html", "utf8");

const escaped = html
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$/g, "\\$$");

writeFileSync("src/ui.js", `export default \`${escaped}\`;`);

console.log("ui.js generated:", escaped.length, "bytes");
