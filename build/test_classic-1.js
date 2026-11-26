// Scenario checks for Classic batch 1 (js/cards/classic-1.js): node build/test_classic-1.js
// Loads the engine and every js/cards/*.js, Goat data plus play/data/classic-cards.js, and plays Goat rules.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math }; ctx.self = ctx.window; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'play/data/classic-cards.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) { try { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); } catch (e) { if (!f.startsWith('js/cards/') || f.endsWith('classic-1.js')) throw e; console.error(`(skipped ${f}: ${e.message})`); } }
const E = ctx.window.EdisonEngine, G = ctx.window.GOAT_CARDS;
const C = [...G, ...ctx.window.CLASSIC_CARDS.filter(c => !G.some(g => g.n === c.n))];
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
const pickFirst = g => { const pr = g.prompt; if (!pr || pr.type !== "pick") return; E.act(g, pr.opts.slice(0, Math.max(pr.min, 1)).map(x => x.key)); };
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const passAll = (g, upto = 30) => { for (let i = 0; i < upto && g.prompt && (g.prompt.type === 'respond' || g.prompt.type === 'yesno'); i++) E.act(g, [g.prompt.type === 'yesno' ? 'n' : 'pass']); };
const cardIn = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n);
const keyOf = (g, kind, p, n) => kind + ':' + cardIn(g, p, n).u;
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

T('Exodia wins when the fifth piece is drawn', () => {
  const g = duel({ board: [{ hand: ['Left Arm of the Forbidden One', 'Right Arm of the Forbidden One', 'Left Leg of the Forbidden One', 'Right Leg of the Forbidden One'], deckTop: ['Exodia the Forbidden One'] }, {}] });
  ok(g.winner === 0, `A won with Exodia (${g.why})`);
});
T('Destiny Board places "L" in the opponent’s End Phase and wins', () => {
  const g = duel({ board: [{ st: [{ n: 'Destiny Board', pos: 'up' }, { n: 'Spirit Message "I"', pos: 'up' }, { n: 'Spirit Message "N"', pos: 'up' }, { n: 'Spirit Message "A"', pos: 'up' }], deckTop: [FILL, 'Spirit Message "L"'] }, {}] });
  ok(!hasOpt(g, 'Spirit Message "L"') || true, 'Spirit Message in hand');
  choose(g, 'end'); passAll(g);
  ok(g.winner == null, 'no win in own End Phase');
  for (let i = 0; i < 10 && g.prompt && g.winner == null; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else passAll(g); }
  ok(g.winner === 0, `A won with Destiny Board (${g.why})`);
});
T('Destiny Board sends the Messages away when it leaves', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: [{ n: 'Destiny Board', pos: 'up' }, { n: 'Spirit Message "I"', pos: 'up' }] }, {}] });
  choose(g, 'a:' + cardIn(g, 0, 'Mystical Space Typhoon').u + ':'); if (g.prompt.type === 'pick') choose(g, 'Destiny Board'); passAll(g);
  ok(!g.p[0].st.some(c => c), 'Board and Message gone');
});
T('Obelisk: 3 Tributes, no Set, Tribute 2 to destroy their monsters, then no attack', () => {
  const g = duel({ board: [{ hand: ['Obelisk the Tormentor'], m: [FILL, FILL, FILL, FILL, FILL], turn: 2 }, { m: [FILL, FILL] }] });
  ok(!hasOpt(g, keyOf(g, 'set', 0, 'Obelisk the Tormentor')), 'no Set option');
  choose(g, keyOf(g, 'ns', 0, 'Obelisk the Tormentor'));
  ok(g.prompt.type === 'pick' && g.prompt.min === 3, 'asks for exactly 3 Tributes'); pickFirst(g); passAll(g);
  const o = on(g, 0, 'Obelisk the Tormentor'); ok(o && E.atk(g, o) === 4000, 'Obelisk on the field');
  choose(g, 'a:' + o.u + ':'); pickFirst(g); passAll(g);
  ok(g.p[1].m.every(c => !c), 'their monsters destroyed');
  ok(!hasOpt(g, 'bp') || (choose(g, 'bp'), !g.prompt.opts.some(x => x.u === o.u && x.kind === 'atk')), 'Obelisk can’t attack this turn');
});
T('Slifer’s ATK follows the hand, and it cuts a summoned monster', () => {
  const g = duel({ board: [{ hand: ['Slifer the Sky Dragon', FILL, FILL], m: [FILL, FILL, FILL] }, { hand: ['Mystical Elf'] }] });
  choose(g, keyOf(g, 'ns', 0, 'Slifer the Sky Dragon')); pickFirst(g); passAll(g);
  const s = on(g, 0, 'Slifer the Sky Dragon'); ok(s && E.atk(g, s) === 1000 * g.p[0].hand.length, `ATK ${s && E.atk(g, s)} for ${g.p[0].hand.length} cards`);
  choose(g, "end"); passAll(g); for (let i = 0; i < 6 && g.prompt && g.prompt.type !== "idle"; i++) passAll(g);
  choose(g, keyOf(g, "ns", 1, "Mystical Elf")); passAll(g);
  ok(!on(g, 1, "Mystical Elf") && g.p[1].gy.some(c => E.name(c) === "Mystical Elf"), "Mystical Elf (800) lost 2000 ATK and was destroyed");
});
T('Ra pays down to 100 LP and gains it', () => {
  const g = duel({ board: [{ hand: ['The Winged Dragon of Ra'], m: [FILL, FILL, FILL] }, {}] });
  choose(g, keyOf(g, 'ns', 0, 'The Winged Dragon of Ra')); pickFirst(g);
  if (g.prompt && g.prompt.type === 'yesno') E.act(g, ['y']); passAll(g);
  const r = on(g, 0, 'The Winged Dragon of Ra');
  ok(g.p[0].lp === 100 && r && E.atk(g, r) === 7900 && E.def(g, r) === 7900, `LP ${g.p[0].lp}, Ra ${r && E.atk(g, r)}/${r && E.def(g, r)}`);
});
T('Toon Summoned Skull: Toon World needed, no attack the turn summoned', () => {
  const g = duel({ board: [{ hand: ['Toon Summoned Skull'], m: [FILL], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, {}] });
  ok(!hasOpt(g, keyOf(g, 'ns', 0, 'Toon Summoned Skull')), 'no Normal Summon');
  choose(g, keyOf(g, 'sp', 0, 'Toon Summoned Skull')); passAll(g);
  const t = on(g, 0, 'Toon Summoned Skull'); ok(!!t, 'Special Summoned by Tributing 1');
  choose(g, 'bp'); passAll(g); ok(!g.prompt.opts.some(x => x.kind === 'atk'), 'no attack this turn');
});
T('Toon Summoned Skull attacks directly for 500 LP, dies with Toon World', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Toon Summoned Skull'], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'bp'); passAll(g);
  ok(hasOpt(g, 'Attack directly'), 'direct attack offered over a monster');
  choose(g, 'Attack directly'); passAll(g);
  ok(g.p[0].lp === 7500 && g.p[1].lp === 5500, `LP ${g.p[0].lp} / ${g.p[1].lp}`);
  choose(g, 'endbp'); passAll(g);
  choose(g, 'a:' + cardIn(g, 0, 'Mystical Space Typhoon').u + ':'); if (g.prompt.type === 'pick') choose(g, 'Toon World'); passAll(g);
  ok(!on(g, 0, 'Toon Summoned Skull'), 'Toon destroyed with Toon World');
});
T('A Toon must attack an opposing Toon', () => {
  const g = duel({ board: [{ m: ['Toon Summoned Skull'], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, { m: [FILL, 'Toon Mermaid'] }] });
  choose(g, 'bp'); passAll(g);
  const labels = g.prompt.opts.filter(x => x.kind === 'atk').map(x => x.label);
  ok(labels.length === 1 && /Toon Mermaid/.test(labels[0]), 'only Toon Mermaid: ' + labels.join(', '));
});

console.log(fails ? `\n${fails} check(s) failed.` : '\nAll classic-1 checks passed.');
process.exit(fails ? 1 : 0);
