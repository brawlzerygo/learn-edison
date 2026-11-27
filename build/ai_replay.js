/* Rebuild a position dumped by build/ai_audit.js --log (a <fmt>-<game>-<n>-<blunder>.json file) and show how each AI scores it.
 node build/ai_replay.js <dump.json> [level] [runs] */
const path = require('path'), fs = require('fs'), vm = require('vm');
const D = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const lv = process.argv[3] || D.lv || 'tournament', RUNS = +process.argv[4] || 3;
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math, Date }; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
let OLD = null;
if (fs.existsSync(path.join(root, 'build/ai_old.js'))) { vm.runInContext(fs.readFileSync(path.join(root, 'build/ai_old.js'), 'utf8'), ctx); OLD = ctx.window.EdisonAI; }
vm.runInContext(fs.readFileSync(path.join(root, 'js/ai.js'), 'utf8'), ctx); const AI = ctx.window.EdisonAI;
const E = ctx.window.EdisonEngine;
if (D.fmt === 'goat') E.init(ctx.window.GOAT_CARDS, { format: 'goat' }); else E.init(ctx.window.EDISON_CARDS);
const g = E.newDuel({ ...D.cfg, quiet: true }); D.history.forEach((k, i) => E.act(g, k, D.pzs[i]));
console.log('found', D.found, 'picked', D.keys, 'by', D.who, '\n' + g.prompt.text, g.prompt.opts.map(o => o.key + '=' + o.label).join('; '));
for (const [nm, A] of [['old', OLD], ['new', AI]]) if (A) for (let r = 0; r < RUNS; r++) {
  const t = Date.now(); const sc = A.scoreMoves(g, D.me, lv);
  console.log(nm, (Date.now() - t) + 'ms', sc.map(s => s.k.join(',') + ' ' + s.v.toFixed(0)).join(' | '));
}
module.exports = { g, E, AI, OLD, D };
