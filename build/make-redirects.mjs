// The old Edison addresses now redirect into learnretro.com/edison/ (Zack, 2026-11-23: one domain). Writes:
//   docs/      edison.learnretro.com (learn-edison's GitHub Pages serves this folder): one small page per pre-rendered
//              address (canonical + instant refresh, which search engines treat as a permanent move) plus a 404.html
//              that forwards any other path, keeping ?query and #hash
//   redirect/  learnedison.com (repo learnedison-redirect): every path to learnretro.com/edison/<same path>
//   preview/   edison-preview.learnretro.com (repo learn-edison-preview): every path to preview.learnretro.com/edison/
// Run by build/publish.sh (no option, --site redirect, --site preview).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = (to, js) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Learn Retro: Edison has moved</title>
<link rel="canonical" href="${to}">
${js ? `<script>location.replace('${js}' + location.pathname + location.search + location.hash);</script>` : `<script>location.replace('${to}' + location.search + location.hash);</script>`}
<meta http-equiv="refresh" content="0; url=${to}">
<style>body{font-family:Verdana,sans-serif;background:#fbfaf7;color:#1c2128;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}a{color:#c2410c}</style>
</head><body><p>The Edison course now lives at <a href="${to}">${to.replace(/^https:\/\//, '')}</a>.</p></body></html>
`;
function catchAll(dir, base, domain, keep = []) {
  fs.mkdirSync(dir, { recursive: true });
  for (const e of fs.readdirSync(dir)) if (!['.git', ...keep].includes(e)) fs.rmSync(path.join(dir, e), { recursive: true, force: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(base + '/', base));
  fs.writeFileSync(path.join(dir, '404.html'), page(base + '/', base));
  fs.writeFileSync(path.join(dir, 'CNAME'), domain + '\n');
}
// edison.learnretro.com -> learnretro.com/edison
const DOCS = path.join(ROOT, 'docs');
catchAll(DOCS, 'https://learnretro.com/edison', 'edison.learnretro.com');
const urls = [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
let n = 0;
for (const u of urls) {
  const p = new URL(u).pathname.replace(/^\/edison/, '');
  if (p === '/') continue;
  const dir = path.join(DOCS, p);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(u)); n++;
}
fs.writeFileSync(path.join(DOCS, 'robots.txt'), 'User-agent: *\nAllow: /\n');
// learnedison.com -> learnretro.com/edison ; edison-preview.learnretro.com -> preview.learnretro.com/edison
catchAll(path.join(ROOT, 'redirect'), 'https://learnretro.com/edison', 'learnedison.com', ['README.md']);
catchAll(path.join(ROOT, 'preview'), 'https://preview.learnretro.com/edison', 'edison-preview.learnretro.com', ['README.md']);
console.log(`Redirects: docs/ (${n} pages + catch-all) for edison.learnretro.com, redirect/ for learnedison.com, preview/ for edison-preview.learnretro.com.`);
