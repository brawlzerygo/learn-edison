// Scenario checks for Goat batch 7 (js/cards/goat-7.js): node build/test_goat-7.js
// Loads the engine and every js/cards/*.js like build/test_goat.js, then plays Goat (E.init(GOAT_CARDS, {format: 'goat'})).
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math }; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const E = ctx.window.EdisonEngine, C = ctx.window.GOAT_CARDS;
E.init(C, { format: 'goat' });

const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Giant Soldier of Stone';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const cardIn = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + cardIn(g, p, n).u + ':');
const keyOf = (g, kind, p, n) => kind + ':' + cardIn(g, p, n).u;
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

T('Stumbling turns Dream Clown to Defense, which destroys a monster', () => {
  const g = duel({ board: [{ hand: ['Dream Clown'], st: [{ n: 'Stumbling', pos: 'up' }] }, { m: ['Giant Soldier of Stone'] }] });
  choose(g, keyOf(g, 'ns', 0, 'Dream Clown')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Giant Soldier');
  passAll(g);
  const d = on(g, 0, 'Dream Clown');
  ok(d && d.pos === 'def', 'Dream Clown is in Defense Position');
  ok(!on(g, 1, 'Giant Soldier of Stone') && inZ(g, 1, 'gy', 'Giant Soldier of Stone'), 'the opponent’s monster was destroyed');
});
T('Dream Clown changed to Defense by hand destroys a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Dream Clown'], turn: 2 }, { m: ['Giant Soldier of Stone'] }] });
  choose(g, keyOf(g, 'pos', 0, 'Dream Clown')); passAll(g);
  ok(inZ(g, 1, 'gy', 'Giant Soldier of Stone'), 'destroyed after the position change');
});
T('Chain Energy charges 500 to Set a monster', () => {
  const g = duel({ board: [{ hand: ['Dream Clown'], st: [{ n: 'Chain Energy', pos: 'up' }] }, {}] });
  choose(g, keyOf(g, 'set', 0, 'Dream Clown')); passAll(g);
  ok(g.p[0].lp === 7500, `A paid 500 (${g.p[0].lp})`);
});
T('Fusilier Dragon without Tributes is 1400/1000', () => {
  const g = duel({ board: [{ hand: ['Fusilier Dragon, the Dual-Mode Beast'] }, {}] });
  choose(g, keyOf(g, 'ns', 0, 'Fusilier Dragon, the Dual-Mode Beast')); if (g.prompt && g.prompt.type === 'choose') choose(g, 'No Tribute'); passAll(g);
  const f = on(g, 0, 'Fusilier Dragon, the Dual-Mode Beast');
  ok(f && E.atk(g, f) === 1400 && E.def(g, f) === 1000, `stats ${f && E.atk(g, f)}/${f && E.def(g, f)}`);
});
T('Megamorph doubles original ATK while behind on LP', () => {
  const g = duel({ board: [{ hand: ['Megamorph'], m: ['Giant Soldier of Stone'], lp: 4000 }, {}] });
  act(g, 0, 'Megamorph'); passAll(g);
  const m = on(g, 0, 'Giant Soldier of Stone');
  ok(E.atk(g, m) === 2600, `ATK ${E.atk(g, m)}`);
  g.p[0].lp = 9000; g.seq++; ok(E.atk(g, m) === 650, `ATK when ahead ${E.atk(g, m)}`);
});
T('Des Wombat stops effect damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Cannon Soldier', 'Giant Soldier of Stone'] }, { m: ['Des Wombat'] }] });
  act(g, 0, 'Cannon Soldier'); choose(g, 'Giant Soldier'); passAll(g);
  ok(g.p[1].lp === 8000, `B took no damage (${g.p[1].lp})`);
});
T('Amazoness Archer Tributes 2 for 1200', () => {
  const g = duel({ board: [{ hand: [], m: ['Amazoness Archer', 'Giant Soldier of Stone', 'Giant Soldier of Stone'] }, {}] });
  act(g, 0, 'Amazoness Archer'); E.act(g, g.prompt.opts.filter(o => o.label === 'Giant Soldier of Stone').map(o => o.key)); passAll(g);
  ok(g.p[1].lp === 6800 && on(g, 0, 'Amazoness Archer'), `B at ${g.p[1].lp}`);
});
T('Royal Magical Library gets a counter per Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Black Pendant'], m: ['Royal Magical Library'] }, {}] });
  act(g, 0, 'Pot of Greed'); passAll(g);
  const lib = on(g, 0, 'Royal Magical Library'); ok(lib.ctr && lib.ctr.spell === 1, 'one counter after Pot of Greed');
  act(g, 0, 'Black Pendant'); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Royal Magical Library'); passAll(g);
  ok(lib.ctr.spell === 2 && E.atk(g, lib) === 500, `two counters after Black Pendant, ATK ${E.atk(g, lib)}`);
});
T('Black Pendant deals 500 when it leaves the field', () => {
  const g = duel({ board: [{ hand: ['Black Pendant', 'Cannon Soldier'], m: ['Cannon Soldier'] }, {}] });
  act(g, 0, 'Black Pendant'); passAll(g);
  const cs = on(g, 0, 'Cannon Soldier');
  choose(g, 'a:' + cs.u + ':'); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Cannon Soldier'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Black Pendant') && g.p[1].lp === 8000 - 500 - 500, `Cannon 500 and Pendant 500 (B at ${g.p[1].lp})`);
});
T('Reversal Quiz swaps LP on a right call', () => {
  const g = duel({ board: [{ hand: ['Reversal Quiz'], lp: 1000, deckTop: ['Pot of Greed'] }, {}] });
  // the turn's draw takes the top card, so put the Spell back on top after the draw
  const P = g.p[0]; const pog = P.deck.find(c => E.name(c) === 'Pot of Greed') || P.hand.find(c => E.name(c) === 'Pot of Greed');
  if (pog.zone === 'hand') { P.hand.splice(P.hand.indexOf(pog), 1); pog.zone = 'deck'; P.deck.push(pog); }
  act(g, 0, 'Reversal Quiz'); passAll(g); choose(g, 'Spell'); passAll(g);
  ok(g.p[0].lp === 8000 && g.p[1].lp === 1000 && g.p[0].hand.length === 0, `LP swapped (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Archfiend’s Oath adds the declared top card', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: "Archfiend's Oath", pos: 'up' }, { n: 'Convulsion of Nature', pos: 'up' }] }, {}] });
  const P = g.p[0]; const top = P.deck[P.deck.length - 1];
  act(g, 0, "Archfiend's Oath"); choose(g, E.name(top)); passAll(g);
  ok(g.p[0].lp === 7500 && top.zone === 'hand', 'paid 500 and added the top card');
});
T('Horus LV8 negates a Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'] }, { m: ['Horus the Black Flame Dragon LV8'] }] });
  const h0 = g.p[0].hand.length; act(g, 0, 'Pot of Greed');
  ok(hasOpt(g, 'Negate a Spell'), 'Horus offered'); choose(g, 'Negate a Spell'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Pot of Greed') && g.p[0].hand.length === h0 - 1, 'Pot of Greed negated, no draw');
});
T('Horus LV6 is unaffected by Spells', () => {
  const g = duel({ board: [{ hand: ['Megamorph'] }, { m: ['Horus the Black Flame Dragon LV6'] }] });
  const h = on(g, 1, 'Horus the Black Flame Dragon LV6'); ok(E.lib.has(g, h, 'unaffectedSpells'), 'flag set');
});
T('Goblin Attack Force goes to Defense after attacking and stays', () => {
  const g = duel({ board: [{ hand: [], m: ['Goblin Attack Force'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g);
  choose(g, 'endbp'); passAll(g);
  const gaf = on(g, 0, 'Goblin Attack Force');
  ok(g.p[1].lp === 5700 && gaf.pos === 'def', `2300 dealt and in Defense (${gaf.pos})`);
  ok(!hasOpt(g, 'pos:' + gaf.u), 'can’t change position');
});
T('Gigantes summons by banishing an EARTH and clears Spells and Traps when it dies in battle', () => {
  const g = duel({ board: [{ hand: ['Gigantes'], gy: ['Giant Soldier of Stone'], st: [{ n: 'Stumbling', pos: 'set' }], turn: 2 }, { m: ['Horus the Black Flame Dragon LV6'], st: ['Heavy Slump'] }] });
  choose(g, keyOf(g, 'sp', 0, 'Gigantes')); passAll(g);
  ok(on(g, 0, 'Gigantes') && inZ(g, 0, 'ban', 'Giant Soldier of Stone'), 'summoned, EARTH banished');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Horus'); passAll(g); passAll(g); passAll(g);
  ok(inZ(g, 0, 'gy', 'Gigantes') && inZ(g, 0, 'gy', 'Stumbling') && inZ(g, 1, 'gy', 'Heavy Slump'), 'all Spells and Traps destroyed');
});
T('Byser Shock returns Set cards', () => {
  const g = duel({ board: [{ hand: ['Byser Shock'], m: ['Giant Soldier of Stone'] }, { m: [{ n: 'Penguin Soldier', pos: 'set' }], st: ['Heavy Slump'] }] });
  choose(g, keyOf(g, 'ns', 0, 'Byser Shock')); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Giant Soldier'); passAll(g);
  ok(inZ(g, 1, 'hand', 'Penguin Soldier') && inZ(g, 1, 'hand', 'Heavy Slump'), 'both Set cards back in the hand');
});
T('Protector of the Sanctuary stops Pot of Greed draws', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'] }, { m: ['Protector of the Sanctuary'] }] });
  const h = g.p[0].hand.length; act(g, 0, 'Pot of Greed'); passAll(g);
  ok(g.p[0].hand.length === h - 1, 'no cards drawn');
});
T('Gear Golem pays 800 to attack directly over a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Gear Golem the Moving Fortress'], turn: 2 }, { m: ['Giant Soldier of Stone'] }] });
  act(g, 0, 'Gear Golem the Moving Fortress'); passAll(g); ok(g.p[0].lp === 7200, 'paid 800');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g);
  ok(g.p[1].lp === 7200, `800 direct damage (B at ${g.p[1].lp})`);
});
T('Reflect Bounder hits back for the attacker’s ATK, then is destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Goblin Attack Force'], turn: 2 }, { m: ['Reflect Bounder'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Reflect'); passAll(g); passAll(g); passAll(g);
  ok(g.p[0].lp === 8000 - 2300 && inZ(g, 1, 'gy', 'Reflect Bounder') && g.p[1].lp === 8000 - 600, `A at ${g.p[0].lp}, B at ${g.p[1].lp}`);
});
T('Emergency Provisions gains 1000 per card', () => {
  const g = duel({ board: [{ hand: ['Emergency Provisions'], st: ['Heavy Slump', { n: 'Stumbling', pos: 'up' }] }, {}] });
  act(g, 0, 'Emergency Provisions'); E.act(g, g.prompt.opts.map(o => o.key)); passAll(g);
  ok(g.p[0].lp === 10000, `A at ${g.p[0].lp}`);
});
T('Last Will summons after a monster went to the GY', () => {
  const g = duel({ board: [{ hand: ['Last Will'], m: ['Cannon Soldier', 'Giant Soldier of Stone'] }, {}] });
  ok(!hasOpt(g, 'a:' + cardIn(g, 0, 'Last Will').u), 'not yet');
  act(g, 0, 'Cannon Soldier'); choose(g, 'Giant Soldier'); passAll(g);
  act(g, 0, 'Last Will'); passAll(g); if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); choose(g, 'Attack Position'); passAll(g);
  ok(on(g, 0, 'Giant Soldier of Stone'), 'a 1300 ATK monster came from the Deck');
});
T('Heavy Slump reshuffles an 8-card hand into 2 cards', () => {
  const g = duel({ board: [{ hand: ['Dream Clown', ...Array(8).fill(FILL)] }, { st: ['Heavy Slump'] }] });
  choose(g, keyOf(g, 'ns', 0, 'Dream Clown'));
  for (let i = 0; i < 6 && g.prompt && !hasOpt(g, 'Heavy Slump'); i++) E.act(g, ['pass']);
  ok(hasOpt(g, 'Heavy Slump'), 'Heavy Slump offered'); choose(g, 'Heavy Slump'); passAll(g);
  ok(g.p[0].hand.length === 2, `A holds 2 cards (${g.p[0].hand.length})`);
});
console.log(fails ? `${fails} failed` : 'all passed');
process.exit(fails ? 1 : 0);
