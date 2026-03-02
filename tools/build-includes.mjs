#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const EXCLUDED_DIRS = new Set(["partials", "tools", "node_modules", ".git"]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".html")) files.push(fullPath);
  }

  return files;
}

function indentBlock(content, indent) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  const lines = normalized.split("\n");
  return lines.map((line) => (line ? indent + line : line)).join("\n");
}

async function replaceAsync(str, regex, asyncFn) {
  const matches = [...str.matchAll(regex)];
  if (!matches.length) return str;

  const replacements = await Promise.all(matches.map((m) => asyncFn(...m)));
  let i = 0;
  return str.replace(regex, () => replacements[i++]);
}

async function expandIncludes(html, htmlFile) {
  const includeTagRe = /^([ \t]*)<([a-zA-Z][\w:-]*)([^>]*\sdata-include=(['"])([^'"]+)\4[^>]*)>\s*<\/\2>\s*$/gm;

  return replaceAsync(html, includeTagRe, async (match, indent, _tag, _attrs, _q, includePath) => {
    if (!includePath.startsWith("/partials/")) return match;

    const includeFile = path.join(repoRoot, includePath.replace(/^\//, ""));

    try {
      const includeContent = await fs.readFile(includeFile, "utf8");
      return indentBlock(includeContent, indent);
    } catch (err) {
      throw new Error(`Failed to include ${includePath} in ${path.relative(repoRoot, htmlFile)}: ${err.message}`);
    }
  });
}

function stripIncludeScript(html) {
  const includeScriptRe = /^[ \t]*<script[^>]*\bsrc=(['"])\/assets\/js\/include\.js\1[^>]*>\s*<\/script>\s*$/gim;
  return html.replace(includeScriptRe, "");
}

async function main() {
  const htmlFiles = await walk(repoRoot);
  let changedCount = 0;

  for (const file of htmlFiles) {
    const original = await fs.readFile(file, "utf8");
    const expanded = await expandIncludes(original, file);
    const stripped = stripIncludeScript(expanded).replace(/\n{3,}/g, "\n\n");

    if (stripped !== original) {
      await fs.writeFile(file, stripped, "utf8");
      changedCount += 1;
      console.log(`updated ${path.relative(repoRoot, file)}`);
    }
  }

  console.log(`done: ${changedCount} file(s) updated`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
