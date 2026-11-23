// Assemble learnretro.com: the hub at the root, each format in its own folder (Zack, 2026-11-23: one domain,
// learnretro.com/edison/ and learnretro.com/goat/). Run by build/publish.sh.
//
//   node build/assemble.mjs --preview   -> site-preview/ (repo learn-retro-preview, preview.learnretro.com): noindex on
//                                          every page, robots.txt blocking crawlers, no sitemaps, a Preview badge
//   node build/assemble.mjs --live      -> hub/edison/ and hub/goat/ inside the hub repo (learn-retro, learnretro.com)
//
// Each part is copied from the files its git repo would commit (tracked plus untracked-but-not-ignored), minus the
// build tooling, research and notes that never belong on the web. The root 404.html sends any unknown address inside
// a format folder to that format's app, which routes it (a lesson or card that has no pre-rendered page still opens).
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process'; import { fileURLToPath } from 'url';
const ED = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HUB = path.join(ED, 'hub'), GOAT = path.join(ED, 'goat');
const mode = process.argv[2];
if (!['--preview', '--live'].includes(mode)) { console.error('Use --preview or --live'); process.exit(1); }
const PREVIEW = mode === '--preview';
const files = (root, skip) => execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .split('\n').filter(f => f && fs.existsSync(path.join(root, f)) && !skip.some(s => s.endsWith('/') ? f.startsWith(s) : f === s || f.startsWith(s)));
const FORMATS = [
  { dir: 'edison', root: ED, skip: ['hub/', 'redirect/', 'preview/', 'site-preview/', 'goat/', 'docs/', 'build/', 'design/', 'CNAME', 'README.md', 'LICENSE', 'robots.txt', 'ideas.md', '.gitignore'] },
  { dir: 'goat', root: GOAT, skip: ['preview/', 'build/', 'research/', 'NOTE-', 'CNAME', 'README.md', 'LICENSE', 'robots.txt', '.gitignore'] },
];
const badge = '<a href="https://learnretro.com/" title="This is the preview site. Open the live site." style="position:fixed;right:12px;bottom:12px;z-index:9999;background:#c2410c;color:#fff;font:700 12px/1 Verdana,sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:7px 10px;border-radius:6px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.25)">Preview</a>';
const previewHTML = s => s.replace(/<meta name="robots"[^>]*>\n?/g, '').replace('<head>', '<head>\n<meta name="robots" content="noindex, nofollow">').replace(/<body([^>]*)>/, m => m + '\n' + badge);
function copyTree(root, list, outDir) {
  let html = 0;
  for (const f of list) {
    const src = path.join(root, f), dst = path.join(outDir, f);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    if (PREVIEW && f.endsWith('.html')) { fs.writeFileSync(dst, previewHTML(fs.readFileSync(src, 'utf8'))); html++; }
    else fs.copyFileSync(src, dst);
  }
  return html;
}
const clean = dir => { fs.mkdirSync(dir, { recursive: true }); for (const e of fs.readdirSync(dir)) if (e !== '.git') fs.rmSync(path.join(dir, e), { recursive: true, force: true }); };

let OUT;
if (PREVIEW) {
  OUT = path.join(ED, 'site-preview'); clean(OUT);
  copyTree(HUB, files(HUB, ['tools/', 'README.md', 'CNAME', 'robots.txt', 'Icon', '.gitignore', 'edison/', 'goat/']), OUT);
} else {
  OUT = HUB;
  for (const f of FORMATS) fs.rmSync(path.join(HUB, f.dir), { recursive: true, force: true });
}
const counts = [];
for (const f of FORMATS) {
  const list = files(f.root, f.skip);
  copyTree(f.root, list, path.join(OUT, f.dir));
  counts.push(`${f.dir}: ${list.length} files`);
}
// One 404 for the whole domain: inside a format folder, load that format's app (it routes by address); otherwise
// send the visitor to the hub.
fs.writeFileSync(path.join(OUT, '404.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Learn Retro</title>
<script>(function(){var f=location.pathname.split('/')[1];if(${JSON.stringify(FORMATS.map(f => f.dir))}.indexOf(f)>-1){
fetch('/'+f+'/index.html').then(function(r){return r.text()}).then(function(h){document.open();document.write(h);document.close()})
.catch(function(){location.replace('/'+f+'/')})}else location.replace('/')})();</script></head><body></body></html>
`);
if (PREVIEW) {
  fs.writeFileSync(path.join(OUT, 'CNAME'), 'preview.learnretro.com\n');
  fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  for (const s of ['sitemap.xml', 'edison/sitemap.xml', 'goat/sitemap.xml']) fs.rmSync(path.join(OUT, s), { force: true });
  fs.writeFileSync(path.join(OUT, 'README.md'), '# Learn Retro: preview\n\nThe preview copy of https://learnretro.com/ (hub, /edison/, /goat/), at https://preview.learnretro.com/. Built by learn-edison/build/assemble.mjs; not indexed by search engines.\n');
}
console.log(`Assembled ${PREVIEW ? 'the preview in site-preview/' : 'the live site in hub/'}: ${counts.join(', ')}.`);
