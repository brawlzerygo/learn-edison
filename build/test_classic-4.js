// Scenario checks for classic batch 4 (js/cards/classic-4.js): node build/test_classic-4.js
// Loads Goat plus the classic cards like build/test_classic.js, then plays Goat (E.init(cards, {format: 'goat'})).
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math }; ctx.self = ctx.window; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'play/data/classic-cards.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const E = ctx.window.EdisonEngine, C = [...ctx.window.GOAT_CARDS, ...ctx.window.CLASSIC_CARDS.filter(c => !ctx.window.GOAT_CARDS.some(g => g.n === c.n))];
E.init(C, { format: 'goat' });

const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Giant Soldier of Stone';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
function choose(g, text) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const cardIn = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + cardIn(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

T('Change of Heart takes a monster until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Change of Heart'] }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Change of Heart'); if (g.prompt.type === 'pick') choose(g, 'Dark Magician'); passAll(g);
  ok(!!on(g, 0, 'Dark Magician'), 'A controls Dark Magician');
  choose(g, 'end'); passAll(g);
  ok(!!on(g, 1, 'Dark Magician'), 'it went back at the End Phase');
});
T('Shield & Sword switches original ATK and DEF', () => {
  const g = duel({ board: [{ hand: ['Shield & Sword'], m: ['Labyrinth Wall'] }, {}] });
  act(g, 0, 'Shield & Sword'); passAll(g);
  const w = on(g, 0, 'Labyrinth Wall');
  ok(E.atk(g, w) === 3000 && E.def(g, w) === 0, `Labyrinth Wall is ${E.atk(g, w)}/${E.def(g, w)}`);
});
T('Book of Secret Arts gives a Spellcaster 300/300', () => {
  const g = duel({ board: [{ hand: ['Book of Secret Arts'], m: ['Dark Magician'] }, {}] });
  act(g, 0, 'Book of Secret Arts'); passAll(g);
  const d = on(g, 0, 'Dark Magician');
  ok(E.atk(g, d) === 2800 && E.def(g, d) === 2400, `Dark Magician is ${E.atk(g, d)}/${E.def(g, d)}`);
});
T('Ring of Magnetism: only the equipped monster can be attacked', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { hand: ['Ring of Magnetism'], m: ['Labyrinth Wall', 'Harpie Lady'] }] });
  // B's turn first: skip to it by setting up on A's side; instead check the static grant directly
  const w = on(g, 1, 'Labyrinth Wall'), r = g.p[1].hand.find(c => E.name(c) === 'Ring of Magnetism');
  // place it equipped by hand
  g.p[1].hand.splice(g.p[1].hand.indexOf(r), 1); r.zone = 'st'; r.pos = 'up'; r.ctrl = 1; g.p[1].st[0] = r; r.equipTo = w.u; g.seq++;
  choose(g, 'bp'); passAll(g);
  const opts = g.prompt.opts.map(o => o.label);
  ok(opts.some(l => /Labyrinth Wall/.test(l)) && !opts.some(l => /Harpie Lady/.test(l)), 'attack options: ' + opts.join(', '));
  ok(E.atk(g, w) === 0 && E.def(g, w) === 2500, `Wall is ${E.atk(g, w)}/${E.def(g, w)}`);
});
T('Polymerization then De-Fusion brings the materials back', () => {
  const g = duel({ ex0: ['Great Mammoth of Goldfine'], board: [{ hand: ['Polymerization', 'The Snake Hair', 'Dragon Zombie', 'De-Fusion'] }, {}] });
  act(g, 0, 'Polymerization'); passAll(g);
  while (g.prompt && g.prompt.type === 'pick') choose(g, 'Great Mammoth');
  passAll(g);
  ok(!!on(g, 0, 'Great Mammoth of Goldfine'), 'Fusion Summoned');
  act(g, 0, 'De-Fusion'); if (g.prompt.type === 'pick') choose(g, 'Great Mammoth'); passAll(g);
  if (g.prompt && g.prompt.type === 'yesno') choose(g, 'yes');
  passAll(g);
  ok(!!on(g, 0, 'The Snake Hair') && !!on(g, 0, 'Dragon Zombie') && g.p[0].extra.some(c => E.name(c) === 'Great Mammoth of Goldfine'), 'materials summoned, Fusion back in the Extra Deck');
});
T('Dragon Nails revives its monster after a battle loss', () => {
  const g = duel({ board: [{ hand: ['Dragon Nails'], m: ['Kuriboh'], turn: 2 }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Dragon Nails'); if (g.prompt.type === 'pick') choose(g, 'Kuriboh'); passAll(g);
  const k = on(g, 0, 'Kuriboh'); ok(E.atk(g, k) === 900, 'Kuriboh has 900 ATK');
  choose(g, 'bp'); passAll(g);
  choose(g, 'atk:' + k.u); passAll(g, 40);
  if (g.prompt && g.prompt.type === 'yesno') choose(g, 'yes');
  passAll(g);
  const k2 = on(g, 0, 'Kuriboh'); const n = g.p[0].st.find(c => c && E.name(c) === 'Dragon Nails');
  ok(!!k2 && !!n && n.equipTo === k2.u, 'Kuriboh is back with Dragon Nails on it');
});
T('Card of Safe Return draws when Monster Reborn revives from your GY', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], st: [{ n: 'Card of Safe Return', pos: 'up' }], gy: ['Dark Magician'] }, {}] });
  const h0 = g.p[0].hand.length;
  act(g, 0, 'Monster Reborn'); if (g.prompt.type === 'pick') choose(g, 'Dark Magician'); passAll(g);
  if (g.prompt && g.prompt.type === 'yesno') choose(g, 'yes');
  passAll(g);
  ok(!!on(g, 0, 'Dark Magician') && g.p[0].hand.length === h0, `Dark Magician revived and a card drawn (hand ${g.p[0].hand.length})`);
});
T('Card of Sanctity banishes and draws 2', () => {
  const g = duel({ board: [{ hand: ['Card of Sanctity', 'Hinotama', 'Red Medicine'], m: ['Kuriboh'] }, {}] });
  act(g, 0, 'Card of Sanctity'); passAll(g);
  ok(g.p[0].hand.length === 2 && inZ(g, 0, 'ban', 'Kuriboh') && inZ(g, 0, 'ban', 'Hinotama'), 'hand of 2, the rest banished');
});
T('Jam Breeding Machine stops other summons', () => {
  const g = duel({ board: [{ hand: ['Kuriboh'], st: [{ n: 'Jam Breeding Machine', pos: 'up' }] }, {}] });
  const k = cardIn(g, 0, 'Kuriboh');
  ok(!g.prompt.opts.some(o => o.key === 'ns:' + k.u) && g.prompt.opts.some(o => o.key === 'set:' + k.u), 'Kuriboh can be Set but not Normal Summoned');
});
console.log(fails ? `\n${fails} check(s) failed.` : '\nAll classic-4 checks passed.');
process.exit(fails ? 1 : 0);
