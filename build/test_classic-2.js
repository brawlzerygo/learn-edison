// Scenario checks for classic batch 2 (js/cards/classic-2.js): node build/test_classic-2.js
// Loads the Goat data plus play/data/classic-cards.js, the engine and every js/cards/*.js, then plays Goat.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math }; ctx.self = ctx.window; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'play/data/classic-cards.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) { try { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); } catch (e) { if (!f.startsWith('js/cards/')) throw e; console.error(`(skipped ${f}: ${e.message})`); } }
const E = ctx.window.EdisonEngine, C = [...ctx.window.GOAT_CARDS, ...ctx.window.CLASSIC_CARDS.filter(c => !ctx.window.GOAT_CARDS.some(g => g.n === c.n))];
E.init(C, { format: 'goat' });

const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Giant Soldier of Stone';
function duel(o = {}) {
  const mk = (ex, top) => ({ name: 't', main: [...Array(40).fill(id(FILL)), ...(top || []).map(id)], extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0, o.deck0), mk(o.ex1, o.deck1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
function choose(g, text) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
// pass every response window and say yes to every yes/no until a different prompt
const passAll = (g, yes = true) => { for (let i = 0; i < 40 && g.prompt && (g.prompt.type === 'respond' || g.prompt.type === 'yesno'); i++) E.act(g, [g.prompt.type === 'respond' ? 'pass' : (yes ? 'y' : 'n')]); };
const cardIn = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + cardIn(g, p, n).u + ':');
const keyOf = (g, kind, p, n) => kind + ':' + cardIn(g, p, n).u;
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

T('Kazejin makes the attacker’s ATK 0 for the battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Giant Soldier of Stone'], turn: 2 }, { m: ['Kazejin'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Kazejin');
  for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) { if (g.prompt.p === 1 && g.prompt.opts.some(o => o.label.includes('ATK 0'))) { choose(g, 'ATK 0'); } else E.act(g, ['pass']); }
  passAll(g);
  const s = on(g, 0, 'Giant Soldier of Stone');
  ok(g.p[0].lp === 8000 - 2400 && !s && on(g, 1, 'Kazejin'), `A took 2400 (LP ${g.p[0].lp}) and the attacker was destroyed`);
});
T('Blast Sphere equips to the attacker and blows it up next Standby', () => {
  const g = duel({ board: [{ hand: [], m: ['Giant Soldier of Stone'], turn: 2 }, { m: [{ n: 'Blast Sphere', pos: 'set' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); passAll(g);
  ok(g.p[0].st.some(c => c && E.name(c) === 'Blast Sphere' && c.equipTo === on(g, 0, 'Giant Soldier of Stone').u), 'equipped, no damage calc');
  ok(g.p[0].lp === 8000 && g.p[1].lp === 8000, 'no battle damage');
  choose(g, 'endbp'); passAll(g); choose(g, 'end'); passAll(g); // B's turn
  choose(g, 'end'); passAll(g); // back to A: standby
  ok(!on(g, 0, 'Giant Soldier of Stone') && g.p[0].lp === 8000 - 1300, `destroyed and A took 1300 (LP ${g.p[0].lp})`);
});
T('Time Wizard right call, then Dark Sage from the Deck', () => {
  const g = duel({ seed: 3, deck0: ['Dark Sage', 'Pot of Greed'], board: [{ hand: [], m: ['Time Wizard', 'Dark Magician'], turn: 2 }, { m: ['Giant Soldier of Stone'] }] });
  for (let s = 1; s < 40; s++) {
    const h = duel({ seed: s, deck0: ['Pot of Greed', 'Dark Sage'], board: [{ hand: [], m: ['Time Wizard', 'Dark Magician'], turn: 2 }, { m: ['Giant Soldier of Stone'] }] });
    act(h, 0, 'Time Wizard'); passAll(h); choose(h, 'Heads'); passAll(h);
    if (on(h, 0, 'Dark Sage')) { ok(!on(h, 1, 'Giant Soldier of Stone') && inZ(h, 0, 'gy', 'Dark Magician') && inZ(h, 0, 'hand', 'Pot of Greed'), 'their monster gone, Dark Magician Tributed, Spell added'); return; }
  }
  ok(false, 'never called it right in 40 seeds');
});
T('Cocoon on Petit Moth: 0/2000, Larvae Moth after 2 turns', () => {
  const g = duel({ board: [{ hand: ['Cocoon of Evolution', 'Larvae Moth'], m: ['Petit Moth'], turn: 2 }, {}] });
  act(g, 0, 'Cocoon of Evolution'); passAll(g);
  const m = on(g, 0, 'Petit Moth'); ok(E.atk(g, m) === 0 && E.def(g, m) === 2000, `Petit Moth ${E.atk(g, m)}/${E.def(g, m)}`);
  ok(!g.prompt.opts.some(o => o.key === keyOf(g, 'sp', 0, 'Larvae Moth')), 'no Larvae Moth yet');
  for (let t = 0; t < 4; t++) { choose(g, 'end'); passAll(g); if (g.prompt && g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); passAll(g); }
  choose(g, keyOf(g, 'sp', 0, 'Larvae Moth')); passAll(g);
  ok(on(g, 0, 'Larvae Moth') && inZ(g, 0, 'gy', 'Petit Moth'), 'Larvae Moth summoned');
});
T('Gate Guardian Tributes the three', () => {
  const g = duel({ board: [{ hand: ['Gate Guardian'], m: ['Sanga of the Thunder', 'Kazejin', 'Suijin'] }, {}] });
  choose(g, keyOf(g, 'sp', 0, 'Gate Guardian')); passAll(g);
  ok(on(g, 0, 'Gate Guardian') && g.p[0].gy.length === 3, 'summoned');
});
T('Metalzoa from the Deck by Tributing Zoa with Metalmorph', () => {
  const g = duel({ deck0: ['Metalzoa'], board: [{ hand: [], m: ['Zoa'], st: [{ n: 'Metalmorph', pos: 'up' }] }, {}] });
  g.p[0].st[0].equipTo = g.p[0].m[0].u; g.seq++;
  choose(g, 'end'); passAll(g); choose(g, 'end'); passAll(g); // to A's next turn standby
  ok(on(g, 0, 'Metalzoa') && inZ(g, 0, 'gy', 'Zoa'), 'Metalzoa summoned');
});
T('Harpie Lady Sisters can’t be revived before its proper summon', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Harpie Lady Sisters'] }, {}] });
  const r = cardIn(g, 0, 'Monster Reborn'); const can = g.prompt.opts.some(o => o.key.startsWith('a:' + r.u + ':'));
  if (can) { act(g, 0, 'Monster Reborn'); if (g.prompt && g.prompt.type === 'pick') ok(!g.prompt.opts.some(o => /Harpie Lady Sisters/.test(o.label)), 'not offered'); else ok(!on(g, 0, 'Harpie Lady Sisters'), 'not summoned'); }
  else ok(true, 'Monster Reborn not activatable');
});
T('Flying Elephant survives one opponent’s effect', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], turn: 2 }, { m: ['Flying Elephant'] }] });
  act(g, 0, 'Smashing Ground'); passAll(g);
  ok(on(g, 1, 'Flying Elephant'), 'still on the field');
});
T('D.D. Warrior banishes both after damage calculation', () => {
  const g = duel({ board: [{ hand: [], m: ['D.D. Warrior'], turn: 2 }, { m: ['Giant Soldier of Stone'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Giant'); passAll(g);
  ok(inZ(g, 0, 'ban', 'D.D. Warrior') && inZ(g, 1, 'ban', 'Giant Soldier of Stone'), 'both banished');
});
T('Jigen Bakudan Tributes in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Jigen Bakudan', pos: 'set' }, 'Giant Soldier of Stone'], turn: 2 }, {}] });
  choose(g, keyOf(g, 'flip', 0, 'Jigen Bakudan')); passAll(g);
  choose(g, 'end'); passAll(g); choose(g, 'end'); passAll(g);
  ok(!on(g, 0, 'Giant Soldier of Stone') && g.p[1].lp === 8000 - 650, `B took 650 (LP ${g.p[1].lp})`);
});
console.log(fails ? `${fails} failed` : 'all passed');
process.exit(fails ? 1 : 0);
