// Writes build/batches/full/full-NN.md: every legal Edison or Goat card the engine can't play yet, in batches of about 60,
// archetypes kept together, the reported cards first (Zack, 2026-11-26: "make sure all legal cards in the formats are available").
// Usage: node build/make_full_batches.js [cardsPerBatch]
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), per = +process.argv[2] || 60;
const eng = fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort().map(f => 'js/cards/' + f);
const ctx = { window: {}, console, Math }; vm.createContext(ctx);
for (const f of ['data/cards.js', 'goat/data/cards.js', 'js/engine.js', ...eng]) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const E = ctx.window.EdisonEngine, CE = ctx.window.EDISON_CARDS, CG = ctx.window.GOAT_CARDS;
const goatBy = new Map(CG.map(c => [c.n, c]));
E.init(CG, { format: 'goat' }); const goatScripted = new Set(CG.filter(c => E.scripted(c.n)).map(c => c.n)), Ug = CG.filter(c => !E.scripted(c.n));
E.init(CE, { format: 'edison' }); const Ue = CE.filter(c => !E.scripted(c.n));
// where each goat-only script lives (to port to the shared script)
const goatFile = new Map(); for (const f of eng) { const s = fs.readFileSync(path.join(root, f), 'utf8'); for (const m of s.matchAll(/^\s*'([^']+)':\s*\{/gm)) if (!goatFile.has(m[1])) goatFile.set(m[1], f); for (const m of s.matchAll(/^\s*"([^"]+)":\s*\{/gm)) if (!goatFile.has(m[1])) goatFile.set(m[1], f); }
const cards = [...Ue.map(c => ({ c, fmt: goatBy.has(c.n) ? 'both' : 'edison' })), ...Ug.filter(g => !CE.some(c => c.n === g.n)).map(c => ({ c, fmt: 'goat' }))];
const words = new Map(); for (const { c } of cards) { const w = c.n.split(/[\s-]+/)[0]; words.set(w, (words.get(w) || 0) + 1); }
const keyOf = n => { if (/ - /.test(n)) return n.split(' - ')[0]; const m = n.match(/"([^"]+)"/); const w = n.split(/[\s-]+/)[0]; return (words.get(w) || 0) >= 3 ? w : '~' + n; };
const REPORTED = ['Gladiator Beast Secutor', 'Enraged Battle Ox', 'Gladiator Beast Darius'];
const groups = new Map(); for (const x of cards) { const k = keyOf(x.c.n); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); }
const gl = [...groups.entries()].map(([k, xs]) => ({ k, xs, pri: xs.some(x => REPORTED.includes(x.c.n)) ? 0 : xs.some(x => x.fmt !== 'edison') ? 1 : 2 }))
  .sort((a, b) => a.pri - b.pri || (a.k[0] === '~') - (b.k[0] === '~') || a.k.localeCompare(b.k));
const batches = []; let cur = [];
for (const g of gl) { if (cur.length && cur.length + g.xs.length > per * 1.25) { batches.push(cur); cur = []; } cur.push(...g.xs); if (cur.length >= per) { batches.push(cur); cur = []; } }
if (cur.length) batches.push(cur);
const typeLine = c => [c.k, c.ab && c.ab !== 'Effect' ? c.ab : '', c.sub || '', c.lv ? 'Level ' + c.lv : '', c.a || '', c.r || '', c.atk != null && c.k !== 'spell' && c.k !== 'trap' ? `${c.atk}/${c.def}` : '', c.tu ? 'Tuner' : ''].filter(Boolean).join(' ');
const edText = c => c.ps && !/^No (rulings|Edison-Accurate)/.test(c.ps) ? c.ps : (c.tx || '');
for (const f of fs.readdirSync(path.join(root, 'build/batches/full'))) fs.rmSync(path.join(root, 'build/batches/full', f));
batches.forEach((b, i) => {
  const N = String(i + 1).padStart(2, '0');
  let md = `# Full pool batch ${N}: ${b.length} cards. Write js/cards/full-${N}.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).\n`;
  for (const { c, fmt } of b) {
    const g = goatBy.get(c.n);
    md += `\n## ${c.n}\n[${typeLine(c)}] formats: ${fmt}${goatScripted.has(c.n) && fmt !== 'goat' ? ` (Goat already has a goat-only script in ${goatFile.get(c.n) || 'a goat file'}: port it as the shared script, adjusted to the Edison text)` : ''}\n`;
    md += `Text${fmt === 'goat' ? '' : ' (Edison)'}: ${edText(c)}\n`;
    if (g && fmt === 'both' && (g.tx || '') !== (c.tx || '') && (g.tx || '') !== edText(c)) md += `Goat text: ${g.tx}\n`;
    if (c.ru && !/^No rulings/.test(c.ru)) md += `Edison rulings: ${c.ru.slice(0, 1500)}\n`;
    else if (c.rb && !/^No rulings/.test(c.rb)) md += `Rulings: ${c.rb.slice(0, 1200)}\n`;
  }
  fs.writeFileSync(path.join(root, `build/batches/full/full-${N}.md`), md);
});
console.log(`${cards.length} cards in ${batches.length} batches`); batches.forEach((b, i) => console.log(String(i + 1).padStart(2, '0'), b.length, [...new Set(b.map(x => keyOf(x.c.n)).filter(k => k[0] !== '~'))].slice(0, 8).join(', ')));
