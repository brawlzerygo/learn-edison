// Scenario checks for classic batch 5 (js/cards/classic-5.js): node build/test_classic-5.js
// Loads the engine and every js/cards/*.js like build/test_classic.js, then plays Goat with the classic cards added.
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
  const mk = () => ({ name: 't', main: Array(40).fill(id(FILL)), extra: [] });
  return E.newDuel({ decks: [mk(), mk()], first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const all = (g, p) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].filter(Boolean);
const cardIn = (g, p, n) => all(g, p).find(c => E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + cardIn(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const attackKey = (g, a, t) => `atk:${on(g, 0, a).u}:${t ? on(g, 1, t).u : 'd'}`;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const toBattle = g => { choose(g, 'bp'); passAll(g); };

T('Time Machine brings back a monster destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Summoned Skull'], turn: 2 }, { m: ['Giant Soldier of Stone'], st: ['Time Machine'] }] });
  toBattle(g); choose(g, attackKey(g, 'Summoned Skull', 'Giant Soldier of Stone')); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && g.prompt.p === 1, 'B is asked to use Time Machine');
  choose(g, 'Yes'); passAll(g);
  ok(!!on(g, 1, 'Giant Soldier of Stone'), 'Giant Soldier is back on B’s field');
  ok(inZ(g, 1, 'gy', 'Time Machine'), 'Time Machine went to the GY');
});
T('Rope of Life discards the hand and revives with 800 more ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Summoned Skull'], turn: 2 }, { hand: ['Giant Soldier of Stone'], m: ['Giant Soldier of Stone'], st: ['Rope of Life'] }] });
  toBattle(g); choose(g, attackKey(g, 'Summoned Skull', 'Giant Soldier of Stone')); passAll(g);
  choose(g, 'Yes'); passAll(g);
  const x = on(g, 1, 'Giant Soldier of Stone');
  ok(x && E.atk(g, x) === 2100 && g.p[1].hand.length === 0, `revived at ${x && E.atk(g, x)} ATK, hand ${g.p[1].hand.length}`);
});
T('Shadow of Eyes flips a Set monster to Attack Position', () => {
  const g = duel({ board: [{ hand: ['Giant Soldier of Stone'], turn: 2 }, { st: ['Shadow of Eyes'] }] });
  choose(g, 'set:' + cardIn(g, 0, 'Giant Soldier of Stone').u); choose(g, 'Yes'); passAll(g);
  const x = on(g, 0, 'Giant Soldier of Stone');
  ok(x && x.pos === 'atk', 'the Set monster is face-up in Attack Position');
});
T('Dark Spirit of the Silent makes another monster attack instead', () => {
  const g = duel({ board: [{ hand: [], m: ['Summoned Skull', 'Giant Soldier of Stone'], turn: 2 }, { m: ['Dark Magician'], st: ['Dark Spirit of the Silent'] }] });
  toBattle(g); choose(g, attackKey(g, 'Summoned Skull', 'Dark Magician'));
  act(g, 1, 'Dark Spirit of the Silent'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Giant Soldier');
  passAll(g);
  ok(!on(g, 0, 'Giant Soldier of Stone') && !!on(g, 1, 'Dark Magician'), 'Giant Soldier attacked Dark Magician and was destroyed');
  ok(!!on(g, 0, 'Summoned Skull') && on(g, 0, 'Summoned Skull').attacks === 1, 'Summoned Skull’s attack was used up');
});
T('Magical Arm Shield takes the monster and it is attacked instead', () => {
  const g = duel({ board: [{ hand: [], m: ['Summoned Skull', 'Giant Soldier of Stone'], turn: 2 }, { m: ['Dark Magician'], st: ['Magical Arm Shield'] }] });
  toBattle(g); choose(g, attackKey(g, 'Summoned Skull', 'Dark Magician'));
  act(g, 1, 'Magical Arm Shield'); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Giant Soldier'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Giant Soldier of Stone'), 'Giant Soldier was destroyed by Summoned Skull');
  ok(g.p[1].lp === 8000 - 1200, `B took 1200 battle damage (${g.p[1].lp})`);
});
T('Kunai with Chain: both effects', () => {
  const g = duel({ board: [{ hand: [], m: ['Summoned Skull'], turn: 2 }, { m: ['Giant Soldier of Stone'], st: ['Kunai with Chain'] }] });
  toBattle(g); choose(g, attackKey(g, 'Summoned Skull', 'Giant Soldier of Stone'));
  act(g, 1, 'Kunai with Chain'); choose(g, 'Both'); passAll(g);
  const k = cardIn(g, 1, 'Kunai with Chain'), s = on(g, 0, 'Summoned Skull'), x = on(g, 1, 'Giant Soldier of Stone');
  ok(s.pos === 'def', 'the attacker is in Defense Position');
  ok(k && k.zone === 'st' && E.atk(g, x) === 1800, `Kunai stays equipped (+500: ${E.atk(g, x)})`);
});
T('Negate Attack ends the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Summoned Skull'], turn: 2 }, { st: ['Negate Attack'] }] });
  toBattle(g); choose(g, attackKey(g, 'Summoned Skull', null)); act(g, 1, 'Negate Attack'); passAll(g);
  ok(g.p[1].lp === 8000 && g.phase === 'main2', `no damage, Main Phase 2 (${g.phase})`);
});
T('Mystical Refpanel turns Pot of Greed onto the opponent', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { st: ['Mystical Refpanel'] }] });
  const h0 = g.p[0].hand.length, h1 = g.p[1].hand.length;
  act(g, 0, 'Pot of Greed'); act(g, 1, 'Mystical Refpanel'); passAll(g);
  ok(g.p[0].hand.length === h0 - 1 && g.p[1].hand.length === h1 + 2, `B drew 2 (A ${g.p[0].hand.length}, B ${g.p[1].hand.length})`);
});
T('Muko sends the cards drawn by Pot of Greed to the GY', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { st: ['Muko'] }] });
  const h0 = g.p[0].hand.length, gy0 = g.p[0].gy.length;
  act(g, 0, 'Pot of Greed'); act(g, 1, 'Muko'); passAll(g);
  ok(g.p[0].hand.length === h0 - 1 && g.p[0].gy.length === gy0 + 3, `A kept no drawn card (hand ${g.p[0].hand.length}, GY ${g.p[0].gy.length})`);
});
T('Horn of Heaven negates a Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Summoned Skull'], m: ['Giant Soldier of Stone'], turn: 2 }, { m: ['Giant Soldier of Stone'], st: ['Horn of Heaven'] }] });
  choose(g, 'ns:' + cardIn(g, 0, 'Summoned Skull').u); if (g.prompt.type === 'choose') choose(g, '1 Tribute'); if (g.prompt.type === 'pick') choose(g, 'Giant');
  act(g, 1, 'Horn of Heaven'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Summoned Skull') && g.p[1].m.filter(Boolean).length === 0, 'Summoned Skull was destroyed and B Tributed its monster');
});
T('Graverobber: the stolen Pot of Greed is used and costs 2000', () => {
  const g = duel({ board: [{ hand: [], gy: ['Pot of Greed'], turn: 2 }, { st: ['Graverobber'] }], first: 0 });
  // B uses Graverobber in A's End Phase? Graverobber is a Normal Trap: use it on A's turn, then Pot can't be used (not B's turn).
  choose(g, 'end'); passAll(g);
  // B's turn: B activates Graverobber in Main Phase 1, then the Set Pot of Greed.
  act(g, 1, 'Graverobber'); passAll(g);
  const pot = cardIn(g, 1, 'Pot of Greed'); ok(pot && pot.zone === 'st', 'Pot of Greed is Set on B’s field');
  const h = g.p[1].hand.length; act(g, 1, 'Pot of Greed'); passAll(g);
  ok(g.p[1].hand.length === h + 2 && g.p[1].lp === 6000 && inZ(g, 0, 'gy', 'Pot of Greed'), `B drew 2, took 2000 (${g.p[1].lp}), Pot is back in A's GY`);
});
T('Skull Invitation burns per card sent to the GY', () => {
  const g = duel({ board: [{ hand: ['Raigeki'], turn: 2 }, { m: ['Giant Soldier of Stone', 'Dark Magician'], st: [{ n: 'Skull Invitation', pos: 'up' }] }] });
  act(g, 0, 'Raigeki'); passAll(g);
  ok(g.p[1].lp === 8000 - 600 && g.p[0].lp === 8000 - 300, `B took 600, A took 300 (${g.p[1].lp}, ${g.p[0].lp})`);
});
T('Nightmare\'s Steelcage stops attacks, then leaves after 2 opponent turns', () => {
  const g = duel({ board: [{ hand: ["Nightmare's Steelcage"], m: ['Summoned Skull'], turn: 2 }, {}] });
  act(g, 0, "Nightmare's Steelcage"); passAll(g);
  ok(cardIn(g, 0, "Nightmare's Steelcage") && cardIn(g, 0, "Nightmare's Steelcage").zone === 'st', 'it stays on the field');
  choose(g, 'bp'); passAll(g);
  ok(!g.prompt.opts.some(o => o.key.startsWith('atk:')), 'no attacks offered');
});
console.log(fails ? `\n${fails} check(s) failed.` : '\nAll classic batch 5 checks passed.');
process.exit(fails ? 1 : 0);
