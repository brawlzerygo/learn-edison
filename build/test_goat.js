// Goat soak test and scenario checks: node build/test_goat.js [games] [tiers]
// Loads the engine and every js/cards/*.js like build/load.js, then plays Goat: E.init(GOAT_CARDS, {format: 'goat'}).
// Random full duels among the decks of the given tiers (default A,B; "all" for every Goat deck), then scenario checks for
// the trickier Goat cards. Decks that run Metamorphosis and list no Fusion Deck get Thousand-Eyes Restrict there
// (goatformat.com's lists say Metamorphosis decks keep it; goat/data/decks.js notes the same).
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math }; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const E = ctx.window.EdisonEngine, C = ctx.window.GOAT_CARDS;
E.init(C, { format: 'goat' });
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const byId = new Map(C.map(c => [c.id, c]));

const N = +process.argv[2] || 300, tiers = (process.argv[3] || 'A,B').split(',');
const TER = id('Thousand-Eyes Restrict'), META = id('Metamorphosis');
const decks = ctx.window.GOAT_DECKS.filter(d => tiers.includes('all') || tiers.includes(d.tier))
  .map(d => (d.main.includes(META) && !(d.extra || []).length) ? { ...d, extra: [TER] } : d);

// every Main and Extra Deck card is scripted (or a Normal Monster)
const unscripted = new Set();
for (const d of decks) for (const i of [...d.main, ...(d.extra || [])]) { const c = byId.get(i); if (!c || !E.scripted(c.n)) unscripted.add(c ? c.n : String(i)); }
console.log(`Decks: ${decks.map(d => d.name).join(', ')}`);
console.log(`Unscripted cards: ${unscripted.size ? [...unscripted].join(', ') : 'none'}`);

let rnd = 12345; const R = () => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return rnd / 0x7fffffff; };
const stats = { done: 0, stuck: 0, crash: 0, turns: 0, prompts: 0, kinds: {}, why: {} };
const errors = new Map();
function answer(pr) {
  const o = pr.opts;
  if (pr.type === 'idle') {
    const act = o.filter(x => !['end', 'endbp'].includes(x.key));
    const bp = o.find(x => x.key === 'bp');
    if (bp && R() < 0.35) return ['bp'];
    if (act.length && R() < 0.8) return [act[Math.floor(R() * act.length)].key];
    return [(o.find(x => x.key === 'endbp') || o.find(x => x.key === 'end') || o[o.length - 1]).key];
  }
  if (pr.type === 'respond') { if (R() < 0.6) return ['pass']; const a = o.filter(x => x.key !== 'pass'); return [a[Math.floor(R() * a.length)].key]; }
  const n = pr.min + Math.floor(R() * (pr.max - pr.min + 1));
  const sh = o.slice().sort(() => R() - 0.5); return sh.slice(0, n).map(x => x.key);
}
const used = {};
const cardByU = (g, u) => { for (const P of g.p) for (const z of ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra']) for (const c of P[z]) if (c && c.u === u) return c; if (P0fz(g, u)) return P0fz(g, u); return null; };
const P0fz = (g, u) => g.p.map(P => P.fz).find(c => c && c.u === u); // which scripted cards' effects were activated at least once
for (let i = 0; i < N; i++) {
  const d0 = decks[Math.floor(R() * decks.length)], d1 = decks[Math.floor(R() * decks.length)];
  let g;
  try {
    g = E.newDuel({ decks: [d0, d1], first: i % 2, seed: i + 1, names: ['P1', 'P2'], quiet: true });
    let n = 0;
    while (g.prompt && n < 4000) {
      const pr = g.prompt; stats.kinds[pr.type] = (stats.kinds[pr.type] || 0) + 1;
      const k = answer(pr);
      if (k[0] && k[0].startsWith('a:')) { const u = +k[0].split(':')[1]; const c = cardByU(g, u); if (c) used[E.data(c).n] = 1; }
      if (pr.type === 'yesno' && k[0] === 'y') { const m = /^Use (.*)'s effect\?/.exec(pr.text); if (m) used[m[1]] = 1; }
      if (pr.type === 'idle' && k[0] && k[0].startsWith('sp:')) { const c = cardByU(g, +k[0].split(':')[1]); if (c) used[E.data(c).n] = 1; }
      E.act(g, k); n++;
    }
    stats.prompts += n; stats.turns += g.turnNo;
    if (g.prompt) { stats.stuck++; if (stats.stuck < 4) console.log('STUCK', d0.name, 'vs', d1.name, 'turn', g.turnNo, g.prompt.type, g.prompt.text); }
    else { stats.done++; const w = (g.why || '').replace(/P[12]/, 'P'); stats.why[w] = (stats.why[w] || 0) + 1; }
  } catch (e) {
    stats.crash++; const key = (e.stack || String(e)).split('\n').slice(0, 3).join(' | ');
    errors.set(key, (errors.get(key) || 0) + 1);
  }
}
console.log(JSON.stringify(stats, null, 1));
{ // Goat-only scripts whose effect was never chosen in random play (mandatory triggers don't prompt, so this is a hint only)
  const goatNames = new Set(); for (const d of decks) for (const i of [...d.main, ...(d.extra || [])]) { const c = byId.get(i); if (c && c.k !== 'normal') goatNames.add(c.n); }
  console.log('Never chosen (optional effects only; informational):', [...goatNames].filter(n => !used[n]).join(', ') || 'none');
}
for (const [k, n] of errors) console.log(n + 'x', k);
{
  const g = E.newDuel({ decks: [decks[0], decks[1 % decks.length]], first: 0, seed: 99, quiet: true });
  for (let n = 0; n < 150 && g.prompt; n++) E.act(g, answer(g.prompt));
  const h = E.clone(g);
  console.log('clone matches:', JSON.stringify(h.prompt) === JSON.stringify(g.prompt) && h.p[0].lp === g.p[0].lp && h.p[1].hand.length === g.p[1].hand.length);
}

/* ---------- scenario checks ---------- */
const FILL = 'Giant Soldier of Stone', BIG = 'Archfiend Soldier';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const handU = (g, p, n) => g.p[p].hand.find(c => E.name(c) === n).u;
const fieldC = (g, p, n) => E.fieldOf(g, p).find(c => E.name(c) === n);
const passAll = (g, upto = 30) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const endTurn = g => { passAll(g); if (g.prompt && g.prompt.type === 'idle' && hasOpt(g, 'endbp')) choose(g, 'endbp'); passAll(g); choose(g, 'end'); passAll(g); while (g.prompt && g.prompt.type === 'pick' && /hand limit/.test(g.prompt.text)) { E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); passAll(g); } };
const inZone = (g, p, z, n) => (Array.isArray(g.p[p][z]) ? g.p[p][z] : [g.p[p][z]]).some(c => c && E.name(c) === n);
const count = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

T('Envoy: summoned by banishing a LIGHT and a DARK, banishes a monster, then cannot attack', () => {
  const g = duel({ board: [{ turn: 3, hand: ['Black Luster Soldier - Envoy of the Beginning'], gy: ['Sangan', 'Magician of Faith'] }, { m: [BIG] }] });
  choose(g, 'sp:' + handU(g, 0, 'Black Luster Soldier - Envoy of the Beginning')); passAll(g);
  ok(inZone(g, 0, 'm', 'Black Luster Soldier - Envoy of the Beginning') && inZone(g, 0, 'ban', 'Sangan') && inZone(g, 0, 'ban', 'Magician of Faith') && g.p[0].gy.length === 0, 'Envoy summoned, both GY monsters banished as the cost');
  choose(g, 'Banish a monster'); passAll(g);
  ok(inZone(g, 1, 'ban', BIG), 'Archfiend Soldier banished');
  ok(!hasOpt(g, 'Attack'), 'no attack option is listed in Main Phase');
  choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'atk:'), 'Envoy cannot attack the turn it banished');
});
T('Envoy: second attack after a battle kill, once per turn shared', () => {
  const g = duel({ board: [{ turn: 3, m: ['Black Luster Soldier - Envoy of the Beginning'] }, { m: [BIG, FILL] }] });
  choose(g, 'bp'); passAll(g);
  choose(g, 'Attack ' + BIG); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && /Envoy/.test(g.prompt.text), 'asked to use the second-attack effect'); choose(g, 'yes'); passAll(g);
  ok(inZone(g, 1, 'gy', BIG) && hasOpt(g, 'Attack ' + FILL), 'a second attack is offered');
  choose(g, 'Attack ' + FILL); passAll(g);
  ok(inZone(g, 1, 'gy', FILL) && !hasOpt(g, 'atk:'), 'second attack done, no third');
  choose(g, 'endbp'); passAll(g);
  ok(!hasOpt(g, 'Banish a monster'), 'the banish effect is used up for the turn');
});
T('Metamorphosis: Tribute a Level 1, summon Thousand-Eyes Restrict, absorb a monster', () => {
  const g = duel({ ex0: ['Thousand-Eyes Restrict'], board: [{ hand: ['Metamorphosis'], m: ['Sinister Serpent'] }, { m: [BIG] }] });
  choose(g, 'a:' + handU(g, 0, 'Metamorphosis')); passAll(g);
  const ter = fieldC(g, 0, 'Thousand-Eyes Restrict');
  ok(ter && inZone(g, 0, 'gy', 'Sinister Serpent') && inZone(g, 0, 'gy', 'Metamorphosis'), 'TER summoned, Serpent Tributed');
  choose(g, 'Equip'); passAll(g);
  const eq = g.p[0].st.find(c => c && E.name(c) === BIG);
  ok(eq && eq.equipTo === ter.u && E.atk(g, ter) === 1900 && E.def(g, ter) === 1500, 'Archfiend Soldier equipped, TER is 1900/1500');
  ok(!hasOpt(g, 'Equip'), 'only once per turn (and max 1 equip)');
});
T('Thousand-Eyes Restrict stops other attacks and survives battle by losing the equip', () => {
  const g = duel({ ex0: ['Thousand-Eyes Restrict'], board: [{ hand: ['Metamorphosis'], m: ['Sinister Serpent'] }, { m: [FILL], hand: [BIG] }] });
  choose(g, 'a:' + handU(g, 0, 'Metamorphosis')); passAll(g);
  choose(g, 'Equip'); passAll(g); // takes Giant Soldier of Stone: TER 1300/2000
  endTurn(g);
  choose(g, 'ns:' + handU(g, 1, BIG)); passAll(g);
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'atk:'), 'B’s monsters cannot attack while TER is on the field');
  endTurn(g); choose(g, 'no'); passAll(g); // A's Standby: leave Sinister Serpent in the GY
  choose(g, 'bp'); passAll(g); choose(g, 'Attack ' + BIG); passAll(g);
  ok(inZone(g, 0, 'm', 'Thousand-Eyes Restrict') && inZone(g, 1, 'gy', FILL) && g.p[0].lp === 7400, 'TER loses the battle but survives: the equipped monster is destroyed instead');
});
T('Scapegoat (2005): Sheep Tokens, no Summons that turn, Set still allowed', () => {
  const g = duel({ ex0: ['Thousand-Eyes Restrict'], board: [{ hand: ['Scapegoat', 'Metamorphosis', FILL] }, {}] });
  choose(g, 'a:' + handU(g, 0, 'Scapegoat')); passAll(g);
  ok(g.p[0].m.filter(Boolean).length === 4, 'four Sheep Tokens');
  ok(!hasOpt(g, 'ns:') && hasOpt(g, 'set:'), 'no Normal Summon, but a Set is allowed');
  ok(!hasOpt(g, 'a:' + handU(g, 0, 'Metamorphosis')), 'Metamorphosis cannot Special Summon this turn');
  endTurn(g); endTurn(g);
  choose(g, 'a:' + handU(g, 0, 'Metamorphosis'));
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Sheep Token'); passAll(g);
  ok(inZone(g, 0, 'm', 'Thousand-Eyes Restrict') && g.p[0].m.filter(c => c && E.name(c) === 'Sheep Token').length === 3, 'next turn a Sheep Token becomes TER');
});
T('Snatch Steal: control, 1000 LP for the opponent each Standby, control returns when it leaves', () => {
  const g = duel({ board: [{ hand: ['Snatch Steal'] }, { m: [BIG], hand: ['Mystical Space Typhoon'] }] });
  choose(g, 'a:' + handU(g, 0, 'Snatch Steal')); passAll(g);
  ok(inZone(g, 0, 'm', BIG) && !inZone(g, 1, 'm', BIG), 'A controls Archfiend Soldier');
  endTurn(g);
  passAll(g);
  ok(g.p[1].lp === 9000, 'B gained 1000 LP in their Standby Phase');
  ok(inZone(g, 0, 'm', BIG), 'control stays over turns');
  choose(g, 'a:' + handU(g, 1, 'Mystical Space Typhoon')); passAll(g);
  ok(inZone(g, 1, 'm', BIG) && inZone(g, 0, 'gy', 'Snatch Steal'), 'Snatch Steal destroyed, B has the monster back');
});
T('Delinquent Duo: 1000 LP, one random discard and one of their choice', () => {
  const g = duel({ board: [{ hand: ['Delinquent Duo'] }, { hand: [FILL, FILL, BIG, FILL, FILL] }] });
  choose(g, 'a:' + handU(g, 0, 'Delinquent Duo')); passAll(g);
  ok(g.prompt && g.prompt.type === 'pick' && g.prompt.p === 1, 'B picks the second discard'); E.act(g, [g.prompt.opts[0].key]); passAll(g);
  ok(g.p[0].lp === 7000 && g.p[1].hand.length === 3 && g.p[1].gy.length === 2, 'A paid 1000, B discarded 2');
});
T('Graceful Charity: draw 3, then discard 2', () => {
  const g = duel({ board: [{ hand: ['Graceful Charity'] }, {}] });
  const before = g.p[0].hand.length; // Graceful + the turn draw
  choose(g, 'a:' + handU(g, 0, 'Graceful Charity')); passAll(g);
  ok(g.prompt && g.prompt.type === 'pick' && g.prompt.min === 2 && g.prompt.opts.length === before + 2, 'asked to discard 2 from a hand of ' + (before + 2)); E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); passAll(g);
  ok(g.p[0].hand.length === before - 1 + 3 - 2 && g.p[0].gy.length === 3, 'hand went -1 +3 -2, GY holds Charity and 2 discards');
});
T('Sinister Serpent (2005): back to the hand in your Standby Phase, every turn', () => {
  const g = duel({ board: [{ gy: ['Sinister Serpent'], hand: ['Graceful Charity'] }, {}] });
  ok(g.prompt && g.prompt.type === 'yesno' && /Sinister/.test(g.prompt.text), 'asked in A\u2019s first Standby Phase'); choose(g, 'yes'); passAll(g);
  ok(inZone(g, 0, 'hand', 'Sinister Serpent'), 'Serpent is in the hand');
  choose(g, 'a:' + handU(g, 0, 'Graceful Charity')); passAll(g);
  E.act(g, [g.prompt.opts.find(o => /Sinister/.test(o.label)).key, g.prompt.opts.find(o => !/Sinister/.test(o.label)).key]); passAll(g);
  ok(inZone(g, 0, 'gy', 'Sinister Serpent'), 'discarded to Graceful Charity');
  endTurn(g);
  ok(inZone(g, 0, 'gy', 'Sinister Serpent'), 'stays in the GY during the opponent\u2019s turn');
  passAll(g); choose(g, 'end'); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && /Sinister/.test(g.prompt.text), 'asked again in A\u2019s next Standby Phase'); choose(g, 'yes'); passAll(g);
  ok(inZone(g, 0, 'hand', 'Sinister Serpent') && g.p[0].ban.length === 0, 'back in the hand again, nothing banished');
});
T('Tsukuyomi: turns a monster face-down, returns to the hand in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Tsukuyomi'] }, { m: [BIG] }] });
  choose(g, 'ns:' + handU(g, 0, 'Tsukuyomi')); passAll(g);
  ok(g.prompt && g.prompt.type === 'pick', 'chooses a face-up monster'); choose(g, BIG); passAll(g);
  ok(g.p[1].m.find(Boolean).pos === 'set', 'Archfiend Soldier is face-down');
  passAll(g); choose(g, 'end'); passAll(g);
  ok(inZone(g, 0, 'hand', 'Tsukuyomi') && !inZone(g, 0, 'm', 'Tsukuyomi'), 'Tsukuyomi returned to the hand');
});
T('Asura Priest attacks each opponent monster once', () => {
  const g = duel({ board: [{ turn: 3, m: ['Asura Priest'] }, { m: [{ n: FILL, pos: 'atk' }, { n: 'Sinister Serpent', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g);
  choose(g, 'Attack Sinister'); passAll(g);
  ok(inZone(g, 1, 'gy', 'Sinister Serpent') && hasOpt(g, 'Attack ' + FILL), 'a second attack is offered on the other monster');
  ok(!hasOpt(g, 'Attack directly'), 'no direct attack while a monster is left');
});
T('Ring of Destruction (2005): on your own turn, both players take its ATK', () => {
  const g = duel({ board: [{ st: ['Ring of Destruction'] }, { m: [BIG] }] });
  choose(g, 'a:' + g.p[0].st.find(Boolean).u + ':'); passAll(g);
  ok(inZone(g, 1, 'gy', BIG) && g.p[0].lp === 6100 && g.p[1].lp === 6100, 'both players at 6100');
});
T('Ring of Destruction: both at 0 is a draw', () => {
  const g = duel({ board: [{ st: ['Ring of Destruction'], lp: 1900 }, { m: [BIG], lp: 1000 }] });
  choose(g, 'a:' + g.p[0].st.find(Boolean).u + ':'); passAll(g);
  ok(!g.prompt && g.winner === -1, 'the duel ends in a draw');
});
T('Sakuretsu Armor destroys the attacker', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { st: ['Sakuretsu Armor'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  ok(hasOpt(g, 'Sakuretsu'), 'Sakuretsu offered'); choose(g, 'Sakuretsu'); passAll(g);
  ok(inZone(g, 0, 'gy', BIG) && g.p[1].lp === 8000, 'attacker destroyed, no damage');
});
T('Thunder Dragon: discard it, add 2 from the Deck', () => {
  const g = duel({ board: [{ hand: ['Thunder Dragon'], deckTop: [FILL, 'Thunder Dragon', 'Thunder Dragon'] }, {}] });
  choose(g, 'Discard: add'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); passAll(g);
  ok(count(g, 0, 'hand', 'Thunder Dragon') === 2 && inZone(g, 0, 'gy', 'Thunder Dragon'), 'two Thunder Dragon added, one in the GY');
});
T('Tribe-Infecting Virus destroys a declared Type', () => {
  const g = duel({ board: [{ m: ['Tribe-Infecting Virus'], hand: [FILL] }, { m: [BIG, { n: 'Sangan' }] }] });
  choose(g, 'Discard: destroy'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, FILL);
  if (g.prompt && g.prompt.type === 'choose') choose(g, 'Fiend'); passAll(g);
  ok(inZone(g, 1, 'gy', BIG) && inZone(g, 1, 'gy', 'Sangan') && inZone(g, 0, 'm', 'Tribe-Infecting Virus'), 'both Fiends destroyed, the Aqua stays');
});
T('Magician of Faith: flip, add a Spell from the GY', () => {
  const g = duel({ board: [{ m: [{ n: 'Magician of Faith', pos: 'set' }], gy: ['Pot of Greed'] }, {}] });
  choose(g, 'Flip Summon'); passAll(g);
  ok(inZone(g, 0, 'hand', 'Pot of Greed'), 'Pot of Greed back in the hand');
});
T('Kycoo (Goat): the opponent cannot summon Chaos Sorcerer', () => {
  const g = duel({ board: [{ hand: ['Chaos Sorcerer'], gy: ['Sangan', 'Magician of Faith'] }, { m: ['Kycoo the Ghost Destroyer'] }] });
  ok(!hasOpt(g, 'sp:'), 'no Special Summon option for Chaos Sorcerer');
});
T('Skilled White Magician: 3 Spell Counters, then Buster Blader', () => {
  const g = duel({ board: [{ m: ['Skilled White Magician'], hand: ['Pot of Greed', 'Graceful Charity'], deckTop: [FILL, 'Buster Blader', FILL, FILL, FILL, FILL] }, {}] });
  choose(g, 'a:' + handU(g, 0, 'Pot of Greed')); passAll(g);
  choose(g, 'a:' + handU(g, 0, 'Graceful Charity')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') { const ks = g.prompt.opts.filter(o => !/Buster/.test(o.label)).slice(0, 2).map(o => o.key); E.act(g, ks); } passAll(g);
  const swm = fieldC(g, 0, 'Skilled White Magician');
  ok(swm && swm.ctr && swm.ctr.spell === 2, 'two Spell Counters after two Spells');
});

/* ----- tier B cards (goat-2.js) ----- */
T('Lava Golem: Tribute 2 of their monsters, it lands on their field, they take 1000 each Standby', () => {
  const g = duel({ board: [{ hand: ['Lava Golem', FILL] }, { m: [BIG, FILL] }] });
  choose(g, 'sp:' + handU(g, 0, 'Lava Golem')); passAll(g);
  ok(inZone(g, 1, 'm', 'Lava Golem') && inZone(g, 1, 'gy', BIG), 'Lava Golem is on B’s field');
  ok(!hasOpt(g, 'ns:') && !hasOpt(g, 'set:'), 'A cannot Normal Summon or Set this turn');
  endTurn(g); passAll(g);
  ok(g.p[1].lp === 7000, 'B took 1000 in their Standby Phase');
});
T('Desert Sunlight flips Des Koala: 400 per card in hand', () => {
  const g = duel({ board: [{ m: [{ n: 'Des Koala', pos: 'set' }], st: ['Desert Sunlight'] }, { hand: [FILL, FILL, FILL, FILL] }] });
  endTurn(g);
  const h = g.p[1].hand.length;
  choose(g, 'end'); // B ends turn 2; A answers in the End Phase window
  ok(hasOpt(g, 'Activate'), 'A can activate Desert Sunlight'); choose(g, 'a:' + g.p[0].st.find(Boolean).u + ':'); passAll(g);
  ok(g.p[1].lp === 8000 - 400 * h && g.p[0].m.find(Boolean).pos === 'def', 'Des Koala flipped face-up in Defense, ' + (400 * h) + ' damage');
});
T('Ojama Trio: 3 Tokens on their field, 300 damage when one is destroyed', () => {
  const g = duel({ board: [{ turn: 3, st: ['Ojama Trio'], m: [BIG] }, {}] });
  choose(g, 'a:' + g.p[0].st.find(Boolean).u + ':'); passAll(g);
  ok(g.p[1].m.filter(c => c && E.name(c) === 'Ojama Token').length === 3, 'three Ojama Tokens on B\u2019s field');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Ojama Token'); passAll(g);
  ok(g.p[1].m.filter(Boolean).length === 2 && g.p[1].lp === 7700, 'a Token was destroyed by battle and B took 300');
});
T('Swords of Revealing Light: flips their monsters, stops attacks, gone after their 3rd End Phase', () => {
  const g = duel({ board: [{ hand: ['Swords of Revealing Light'] }, { m: [{ n: BIG, pos: 'set' }] }] });
  choose(g, 'a:' + handU(g, 0, 'Swords of Revealing Light')); passAll(g);
  ok(inZone(g, 0, 'st', 'Swords of Revealing Light') && g.p[1].m.find(Boolean).pos === 'def', 'stays on the field, their monster is face-up');
  endTurn(g); choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'atk:'), 'B cannot attack');
  endTurn(g); endTurn(g); endTurn(g);
  ok(inZone(g, 0, 'st', 'Swords of Revealing Light'), 'still there before B\u2019s 3rd End Phase');
  endTurn(g); endTurn(g);
  ok(inZone(g, 0, 'st', 'Swords of Revealing Light') === false && inZone(g, 0, 'gy', 'Swords of Revealing Light'), 'destroyed in B’s 3rd End Phase');
});
T('Cyber Jar: destroys every monster, both players pick up 5', () => {
  const g = duel({ board: [{ m: [{ n: 'Cyber Jar', pos: 'set' }] }, { m: [BIG] }] });
  const h0 = g.p[0].hand.length, h1 = g.p[1].hand.length;
  choose(g, 'Flip Summon'); passAll(g);
  for (let i = 0; i < 12 && g.prompt && g.prompt.type === 'choose'; i++) { choose(g, 'Attack'); passAll(g); }
  ok(inZone(g, 0, 'gy', 'Cyber Jar') && inZone(g, 1, 'gy', BIG), 'all monsters destroyed');
  ok(g.p[0].m.filter(Boolean).length + g.p[0].hand.length === h0 + 5 && g.p[1].m.filter(Boolean).length + g.p[1].hand.length === h1 + 5, 'each player got 5 cards (summoned or to hand)');
});
T('Serial Spell copies Pot of Greed', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Serial Spell', FILL] }, {}] });
  const before = g.p[0].hand.length;
  choose(g, 'a:' + handU(g, 0, 'Pot of Greed'));
  ok(hasOpt(g, 'Serial Spell'), 'Serial Spell can chain'); choose(g, 'Serial Spell'); passAll(g);
  ok(g.p[0].hand.length === 4 && g.p[0].gy.length === (before - 2) + 2, 'discarded the hand, then drew 2 and 2');
});
T('Dimension Fusion brings back banished monsters for both players', () => {
  const g = duel({ board: [{ hand: ['Dimension Fusion'], ban: [BIG, 'Sangan'] }, { ban: [FILL] }] });
  choose(g, 'a:' + handU(g, 0, 'Dimension Fusion')); passAll(g);
  ok(g.p[0].lp === 6000 && inZone(g, 0, 'm', BIG) && inZone(g, 0, 'm', 'Sangan') && inZone(g, 1, 'm', FILL), 'paid 2000, both players summoned');
});
T('Jinzo stops Trap activations', () => {
  const g = duel({ board: [{ turn: 3, m: ['Jinzo'] }, { st: ['Sakuretsu Armor'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  ok(!hasOpt(g, 'Sakuretsu'), 'Sakuretsu Armor is not offered');
});
T('Premature Burial: pay 800, revive, the monster dies with it', () => {
  const g = duel({ board: [{ hand: ['Premature Burial'], gy: [BIG] }, { hand: ['Mystical Space Typhoon'] }] });
  choose(g, 'a:' + handU(g, 0, 'Premature Burial')); passAll(g);
  ok(g.p[0].lp === 7200 && inZone(g, 0, 'm', BIG), 'paid 800, Archfiend Soldier revived');
  endTurn(g); choose(g, 'a:' + handU(g, 1, 'Mystical Space Typhoon')); passAll(g);
  ok(inZone(g, 0, 'gy', BIG) && inZone(g, 0, 'gy', 'Premature Burial'), 'destroying it destroyed the monster');
});

console.log(fails ? `${fails} scenario check(s) failed` : 'all scenario checks passed');
const bad = stats.crash || stats.stuck || fails || unscripted.size;
process.exit(bad ? 1 : 0);
