// The five computer levels against each other: node build/test_levels.js [games per pair] [edison|goat]
// Each level plays the level below it: every pair of decks twice, each level taking each deck (seats swap every game);
// reports win rates and decision times. (Until 2026-11-24 the stronger level always got the same decks.)
const vm = require('vm'), fs = require('fs'), path = require('path');
const N = +process.argv[2] || 10, FMT = process.argv[3] || 'edison';
const { ctx, E, AI } = require('./load')({ ai: true });
let decks;
if (FMT === 'goat') {
  const c = { window: {} }; vm.createContext(c); for (const f of ['goat/data/cards.js', 'goat/data/decks.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
  E.init(c.window.GOAT_CARDS, { format: 'goat' });
  decks = c.window.GOAT_DECKS.filter(d => d.tier === 'A').map(d => ({ name: d.name, main: d.main.map(x => +(x.id || x)), extra: (d.extra || []).map(x => +(x.id || x)) }));
  const ter = c.window.GOAT_CARDS.find(x => x.n === 'Thousand-Eyes Restrict'); for (const d of decks) if (!d.extra.length) d.extra = [ter.id];
} else decks = ctx.window.EDISON_DECKS.filter(d => d.tier === 'Best');
const L = AI.LEVELS;
const ONLY = process.argv[4] ? process.argv[4].split(',') : null; // e.g. experienced,tournament: only the pairs led by these
for (let li = 1; li < L.length; li++) {
  const hi = L[li], lo = L[li - 1]; if (ONLY && !ONLY.includes(hi)) continue; let w = 0, done = 0; const ms = { [hi]: [], [lo]: [] };
  for (let i = 0; i < N; i++) {
    const seat = i % 2, lv = [seat === 0 ? hi : lo, seat === 0 ? lo : hi];
    const g = E.newDuel({ decks: [decks[(i >> 1) % decks.length], decks[((i >> 1) + 1) % decks.length]], first: (i >> 1) % 2, quiet: true, names: ['A', 'B'] });
    let n = 0;
    while (g.prompt && n++ < 4000) { const p = g.prompt.p, t = Date.now(); E.act(g, AI.decide(g, p, lv[p])); ms[lv[p]].push(Date.now() - t); }
    if (g.winner != null && g.winner >= 0) { done++; if (lv[g.winner] === hi) w++; }
  }
  const avg = a => (a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)).toFixed(0), max = a => Math.max(0, ...a);
  console.log(`${hi} vs ${lo}: ${hi} won ${w}/${done}. ms per decision: ${hi} avg ${avg(ms[hi])} max ${max(ms[hi])}, ${lo} avg ${avg(ms[lo])}`);
}
