// Independent review checks for full pool batch 18 (written from the card text): node build/review_full-18.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior Level 4 2000/100
let lastG; function duel(o = {}) {
  const mk = (ex, n) => ({ name: 't', main: Array(n || 40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0, o.n0), mk(o.ex1, o.n1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) { fails++; if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ') + '\n   prompt: ' + (lastG.prompt ? lastG.prompt.p + ' ' + lastG.prompt.type + ' ' + lastG.prompt.text + ' :: ' + lastG.prompt.opts.map(x => x.label + '[' + x.key + ']').join(', ') : 'none')); } }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra, ...g.p[p].ban, g.p[p].fz].find(c => c && E.name(c) === n);
const byU = (g, u) => { for (const P of g.p) for (const z of ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra']) for (const c of P[z]) if (c && c.u === u) return c; return g.p.map(P => P.fz).find(c => c && c.u === u) || null; };
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const canAct = (g, p, n) => { const c = card(g, p, n); return !!c && hasOpt(g, 'a:' + c.u + ':'); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ')); } };
function settle(g, ...picks) { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const nm = x => { const c = x.u != null && byU(g, x.u); return c ? E.name(c) : ''; };
    const o = pr.opts.find(x => x.key !== 'pass' && picks.some(t => nm(x) === t || (x.label + ' ' + x.key).includes(t))); E.act(g, [o ? o.key : 'pass']); }
  else if (pr.type === 'yesno') choose(g, picks.includes('NO') ? 'no' : 'yes');
  else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => x.label.includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); }
    for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); E.act(g, ks); } } }
const bp = g => { choose(g, 'bp'); settle(g); };
const atkOn = (g, p, aName, tName, ...picks) => { const a = on(g, p, aName), t = tName ? on(g, 1 - p, tName) : null; choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); settle(g, ...picks); };
const canAtk = (g, a, t) => hasOpt(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const endTurn = (g, ...picks) => { if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g, ...picks); } choose(g, 'end'); settle(g, ...picks); };
const ns = (g, p, n, ...picks) => { choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u); settle(g, ...picks); };
const noSummon = (g, c) => !hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && !hasOpt(g, 'sp:' + c.u);
const lp = (g, p) => g.p[p].lp;
const LV = c => E.lib.lv(c);
const up = n => ({ n, pos: 'up' });
const idle = g => g.prompt && g.prompt.type === 'idle';
const toIdle = (g, ...picks) => { for (let i = 0; i < 10 && g.prompt && !idle(g) && g.prompt.type !== 'battle'; i++) settle(g, ...picks); };
const hand = (g, p) => g.p[p].hand.length;
const cardIn = (g, p, z, n) => g.p[p][z].find(c => c && E.name(c) === n);
const allEmpty = g => g.p.every(P => P.m.every(x => !x) && P.st.every(x => !x));
const Bturn = (g, ...picks) => { endTurn(g, ...picks); toIdle(g, ...picks); }; // A ends, B's turn starts (B is at idle)

const deckTopName = (g, p) => E.name(g.p[p].deck[g.p[p].deck.length - 1]);
const logHas = (g, s) => g.log.some(l => l.includes(s));

/* ---------------- V / W ---------------- */
T('Vampire Baby: at the end of the Battle Phase, takes the monster it destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Vampire Baby'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Vampire Baby', FILL); ok(inZ(g, 1, 'gy', FILL), 'Warwolf destroyed');
  choose(g, 'endbp'); settle(g); toIdle(g);
  ok(on(g, 0, FILL) && !inZ(g, 1, 'gy', FILL), 'Warwolf Special Summoned to A\'s side');
});
T('Vampire Genesis: only by banishing Vampire Lord; discard a Zombie to revive a lower Level Zombie', () => {
  const g0 = duel({ board: [{ hand: ['Vampire Genesis'], m: [FILL], turn: 2 }, {}] });
  ok(noSummon(g0, cardIn(g0, 0, 'hand', 'Vampire Genesis')), 'no summon without Vampire Lord');
  const g = duel({ board: [{ hand: ['Vampire Genesis', 'Vampire Lady'], m: ['Vampire Lord'], gy: ['Vampire Baby'], turn: 2 }, {}] });
  const vg = cardIn(g, 0, 'hand', 'Vampire Genesis');
  ok(!hasOpt(g, 'ns:' + vg.u) && !hasOpt(g, 'set:' + vg.u) && hasOpt(g, 'sp:' + vg.u), 'only the Special Summon is offered');
  choose(g, 'sp:' + vg.u); settle(g);
  ok(on(g, 0, 'Vampire Genesis') && inZ(g, 0, 'ban', 'Vampire Lord'), 'summoned, Vampire Lord banished');
  act(g, 0, 'Vampire Genesis'); settle(g, 'Vampire Lady', 'Vampire Baby');
  ok(inZ(g, 0, 'gy', 'Vampire Lady') && on(g, 0, 'Vampire Baby'), 'Lady discarded, Baby summoned');
  ok(!canAct(g, 0, 'Vampire Genesis'), 'once per turn');
});
T('Vampire Lady: battle damage mills a declared card type from the opponent\'s Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Vampire Lady'], turn: 2 }, { deckTop: [FILL, 'Pot of Greed', FILL] }] });
  bp(g); atkOn(g, 0, 'Vampire Lady', null, 'Spell');
  ok(lp(g, 1) === 6450 && inZ(g, 1, 'gy', 'Pot of Greed'), `B took 1550 and sent Pot of Greed (LP ${lp(g, 1)})`);
});
T('Vampire Lord: battle damage mill, and returns in the next Standby after an opponent\'s effect destroys it', () => {
  const g = duel({ board: [{ hand: [], m: ['Vampire Lord'], turn: 2 }, { hand: ['Dark Hole'], deckTop: [FILL, 'Mirror Force'] }] });
  bp(g); atkOn(g, 0, 'Vampire Lord', null, 'Trap');
  ok(lp(g, 1) === 6000 && inZ(g, 1, 'gy', 'Mirror Force'), `B took 2000 and sent Mirror Force (LP ${lp(g, 1)})`);
  Bturn(g); act(g, 1, 'Dark Hole'); settle(g);
  ok(inZ(g, 0, 'gy', 'Vampire Lord'), 'Lord destroyed by Dark Hole');
  endTurn(g); toIdle(g);
  ok(on(g, 0, 'Vampire Lord'), 'Lord back in A\'s Standby Phase');
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Vampire Lord'], turn: 2 }, {}] });
  act(g2, 0, 'Dark Hole'); settle(g2); Bturn(g2); endTurn(g2); toIdle(g2);
  ok(!on(g2, 0, 'Vampire Lord'), 'not by its own controller\'s Dark Hole');
});
T('Vengeful Bog Spirit: monsters cannot attack the turn they are Summoned', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Celtic Guardian'], st: [up('Vengeful Bog Spirit')], turn: 2 }, {}] });
  ns(g, 0, FILL); const w = g.p[0].m.find(c => c && E.name(c) === FILL); bp(g);
  ok(!canAtk(g, w, null) && canAtk(g, on(g, 0, 'Celtic Guardian'), null), 'new Warwolf cannot attack, Celtic can');
});
T('Vengeful Servant: burns the new controller for the original ATK', () => {
  const g = duel({ board: [{ hand: ['Vengeful Servant'], m: [FILL], turn: 2 }, { hand: ['Change of Heart'] }] });
  act(g, 0, 'Vengeful Servant'); settle(g, FILL);
  ok(inZ(g, 0, 'st', 'Vengeful Servant'), 'equipped');
  Bturn(g); act(g, 1, 'Change of Heart'); settle(g, FILL);
  ok(on(g, 1, FILL) && lp(g, 1) === 6000, `B took control and 2000 damage (LP ${lp(g, 1)})`);
});
T('Vengeful Shinobi: draws when targeted for an attack in Attack Position', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: [], m: ['Vengeful Shinobi'] }] });
  bp(g); atkOn(g, 0, FILL, 'Vengeful Shinobi');
  ok(hand(g, 1) === 1, `B drew 1 (${hand(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: [], m: [{ n: 'Vengeful Shinobi', pos: 'def' }] }] });
  bp(g2); atkOn(g2, 0, FILL, 'Vengeful Shinobi'); ok(hand(g2, 1) === 0, 'no draw in Defense Position');
});
T('Wall of Illusion: the monster that attacked it goes back to the hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Celtic Guardian'], turn: 2 }, { m: [{ n: 'Wall of Illusion', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Celtic Guardian', 'Wall of Illusion');
  ok(inZ(g, 0, 'hand', 'Celtic Guardian') && on(g, 1, 'Wall of Illusion') && lp(g, 0) === 7550, `Celtic returned, A took 450 (${lp(g, 0)})`);
});
T('Wall of Ivy: FLIP gives the opponent an Ivy Token that burns 300 when destroyed', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Wall of Ivy', pos: 'set' }, FILL], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g);
  const tk = g.p[1].m.find(c => c && E.name(c) === 'Ivy Token');
  ok(tk && tk.pos === 'def', 'Ivy Token in Defense Position on B\'s side');
  bp(g); choose(g, `atk:${on(g, 0, FILL).u}:${tk.u}`); settle(g);
  ok(lp(g, 1) === 7700, `B took 300 (${lp(g, 1)})`);
});
T('Wall of Thorns: a Plant is attacked, all the attacker\'s Attack Position monsters are destroyed', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, FILL, { n: 'Celtic Guardian', pos: 'def' }], turn: 2 }, { m: ['Lord Poison'], st: ['Wall of Thorns'] }] });
  bp(g); atkOn(g, 0, FILL, 'Lord Poison', 'Wall of Thorns');
  ok(cnt(g, 0, 'gy', FILL) === 2 && on(g, 0, 'Celtic Guardian'), 'both Warwolves destroyed, Celtic in Defense stays');
});
T('Wall Shadow: cannot be Normal Summoned/Set', () => {
  const g = duel({ board: [{ hand: ['Wall Shadow'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g, cardIn(g, 0, 'hand', 'Wall Shadow')), 'no summon offered');
});
T('Warrior Elimination: destroys all Warriors', () => {
  const g = duel({ board: [{ hand: ['Warrior Elimination'], m: ['Celtic Guardian', FILL], turn: 2 }, { m: ['Celtic Guardian'] }] });
  act(g, 0, 'Warrior Elimination'); settle(g);
  ok(inZ(g, 0, 'gy', 'Celtic Guardian') && inZ(g, 1, 'gy', 'Celtic Guardian') && on(g, 0, FILL), 'both Celtics gone, Beast-Warrior stays');
});
T('Warrior Lady of the Wasteland: replaces itself with an EARTH Warrior', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Warrior Lady of the Wasteland'], deckTop: ['Celtic Guardian'] }] });
  bp(g); atkOn(g, 0, FILL, 'Warrior Lady of the Wasteland', 'Celtic Guardian');
  const cg = on(g, 1, 'Celtic Guardian'); ok(cg && cg.pos === 'atk', 'Celtic Guardian summoned in Attack Position');
});
T('Warrior of Tradition: Fusion Summon', () => {
  const g = duel({ ex0: ['Warrior of Tradition'], board: [{ hand: ['Polymerization', 'Sonic Maid', 'Beautiful Headhuntress'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g); toIdle(g);
  ok(on(g, 0, 'Warrior of Tradition') && inZ(g, 0, 'gy', 'Sonic Maid') && inZ(g, 0, 'gy', 'Beautiful Headhuntress'), 'fused');
});
T('White Dragon Ritual: Ritual Summons Paladin of White Dragon', () => {
  const g = duel({ board: [{ hand: ['White Dragon Ritual', 'Paladin of White Dragon', FILL], turn: 2 }, {}] });
  act(g, 0, 'White Dragon Ritual'); settle(g); toIdle(g);
  ok(on(g, 0, 'Paladin of White Dragon') && inZ(g, 0, 'gy', 'White Dragon Ritual'), 'Paladin Ritual Summoned');
});
T('White Hole: your monsters survive the opponent\'s Dark Hole', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['White Hole'], turn: 2 }, { hand: ['Dark Hole'], m: ['Celtic Guardian'] }] });
  Bturn(g); act(g, 1, 'Dark Hole'); settle(g, 'White Hole');
  ok(on(g, 0, FILL) && inZ(g, 1, 'gy', 'Celtic Guardian') && inZ(g, 0, 'gy', 'White Hole'), 'A keeps Warwolf, B loses Celtic');
});
T('White Magical Hat: battle damage makes the opponent discard randomly', () => {
  const g = duel({ board: [{ hand: [], m: ['White Magical Hat'], turn: 2 }, { hand: [FILL, 'Pot of Greed'] }] });
  bp(g); atkOn(g, 0, 'White Magical Hat', null);
  ok(lp(g, 1) === 7000 && hand(g, 1) === 1 && cnt(g, 1, 'gy') === 1, `B took 1000 and discarded 1 (hand ${hand(g, 1)})`);
});
T('White Magician Pikeru: +400 LP per monster in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['White Magician Pikeru', FILL, { n: FILL, pos: 'set' }], turn: 2 }, {}] });
  toIdle(g); ok(lp(g, 0) === 9200, `A at 9200 (${lp(g, 0)})`);
});
T('White Night Dragon: negates a Spell that targets it; redirects attacks to itself', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['White Night Dragon'] }] });
  act(g, 0, 'Book of Moon'); settle(g, 'White Night Dragon');
  const w = on(g, 1, 'White Night Dragon');
  ok(w && w.pos === 'atk' && inZ(g, 0, 'gy', 'Book of Moon'), 'Book of Moon negated, dragon still face-up');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['White Night Dragon', 'Celtic Guardian'], st: ['Pot of Greed'] }] });
  bp(g2); atkOn(g2, 0, FILL, 'Celtic Guardian', 'White Night Dragon');
  ok(inZ(g2, 1, 'gy', 'Pot of Greed') && on(g2, 1, 'Celtic Guardian') && inZ(g2, 0, 'gy', FILL) && lp(g2, 0) === 7000, `attack moved to the dragon (A LP ${lp(g2, 0)})`);
});
T('White Ninja: FLIP destroys a Defense Position monster', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'White Ninja', pos: 'set' }], turn: 2 }, { m: [{ n: FILL, pos: 'def' }, 'Celtic Guardian'] }] });
  choose(g, 'flip:'); settle(g, FILL);
  ok(inZ(g, 1, 'gy', FILL) && on(g, 1, 'Celtic Guardian'), 'Defense Warwolf destroyed');
});
T('White Potan: survives battle with a Tuner; Tuner destroyed by battle burns 500', () => {
  const g = duel({ board: [{ hand: [], m: ['White Potan', 'Junk Synchron'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'White Potan', FILL);
  ok(on(g, 0, 'White Potan') && lp(g, 0) === 6100, `Potan survives, A took 1900 (${lp(g, 0)})`);
  atkOn(g, 0, 'Junk Synchron', FILL);
  ok(inZ(g, 0, 'gy', 'Junk Synchron') && lp(g, 1) === 7500, `Junk Synchron destroyed, B took 500 (${lp(g, 1)})`);
});
T('White-Horned Dragon: banishes up to 5 Spells from the opponent\'s GY, +300 each', () => {
  const g = duel({ board: [{ hand: ['White-Horned Dragon'], m: [FILL], turn: 2 }, { gy: ['Pot of Greed', 'Dark Hole', FILL] }] });
  ns(g, 0, 'White-Horned Dragon', FILL, 'Pot of Greed', 'Dark Hole');
  const d = on(g, 0, 'White-Horned Dragon');
  ok(d && E.atk(g, d) === 2800 && cnt(g, 1, 'ban') === 2 && inZ(g, 1, 'gy', FILL), `2 banished, ATK ${d && E.atk(g, d)}`);
});
T('Wicked-Breaking Flamberge - Baou: send 1 card, +500, negates the destroyed monster\'s effect', () => {
  const g = duel({ board: [{ hand: ['Wicked-Breaking Flamberge - Baou', 'Pot of Greed'], m: [FILL], turn: 2 }, { hand: [], m: ['Sangan'], deckTop: ['Kuriboh'] }] });
  act(g, 0, 'Wicked-Breaking Flamberge - Baou'); settle(g, 'Pot of Greed', FILL);
  ok(inZ(g, 0, 'gy', 'Pot of Greed') && E.atk(g, on(g, 0, FILL)) === 2500, 'Pot sent, Warwolf 2500');
  bp(g); atkOn(g, 0, FILL, 'Sangan', 'Kuriboh');
  ok(inZ(g, 1, 'gy', 'Sangan') && hand(g, 1) === 0, `Sangan destroyed, no search (B hand ${hand(g, 1)})`);
});
T('Winged Kuriboh: no battle damage for the rest of the turn', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, FILL], turn: 2 }, { m: ['Winged Kuriboh'] }] });
  bp(g); atkOn(g, 0, FILL, 'Winged Kuriboh');
  ok(lp(g, 1) === 6300, `B took 1700 from that battle (${lp(g, 1)})`);
  const w2 = g.p[0].m.filter(c => c && E.name(c) === FILL)[1]; choose(g, `atk:${w2.u}:d`); settle(g);
  ok(lp(g, 1) === 6300, `no damage from the direct attack (${lp(g, 1)})`);
});
T('Winged Kuriboh LV10: cannot be Normal Summoned; tributes itself to wipe Attack Position attackers and burn', () => {
  const g0 = duel({ board: [{ hand: ['Winged Kuriboh LV10'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g0, cardIn(g0, 0, 'hand', 'Winged Kuriboh LV10')), 'no Normal Summon');
  const g = duel({ board: [{ hand: [], m: [FILL, 'Celtic Guardian', { n: FILL, pos: 'set' }], turn: 2 }, { m: ['Winged Kuriboh LV10'] }] });
  choose(g, 'bp'); settle(g, 'Winged Kuriboh LV10');
  ok(inZ(g, 1, 'gy', 'Winged Kuriboh LV10') && cnt(g, 0, 'gy') === 2 && cnt(g, 0, 'm') === 1 && lp(g, 0) === 8000 - 3400, `2 destroyed, A took 3400 (${lp(g, 0)})`);
});
T('Winged Kuriboh LV9: ATK/DEF 500 per Spell in the opponent\'s GY; activated Spells are banished', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Winged Kuriboh LV9'], turn: 2 }, { gy: ['Dark Hole', 'Pot of Greed', FILL] }] });
  const k = on(g, 0, 'Winged Kuriboh LV9');
  ok(E.atk(g, k) === 1000 && E.def(g, k) === 1000, `1000/1000 (${E.atk(g, k)}/${E.def(g, k)})`);
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(inZ(g, 0, 'ban', 'Pot of Greed'), 'Pot of Greed banished');
  const g2 = duel({ board: [{ hand: ['Pot of Greed', 'Winged Kuriboh LV9'], st: ['Mirror Force'], turn: 2 }, { st: ['Mystical Space Typhoon'] }] });
  act(g2, 0, 'Pot of Greed'); settle(g2, 'Mystical Space Typhoon', 'Winged Kuriboh LV9');
  ok(on(g2, 0, 'Winged Kuriboh LV9'), 'Special Summoned as Chain Link 3');
});
T('Winged Minion: tribute it, a Fiend gains 700 ATK/DEF', () => {
  const g = duel({ board: [{ hand: [], m: ['Winged Minion', 'Archfiend Soldier'], turn: 2 }, {}] });
  act(g, 0, 'Winged Minion'); settle(g, 'Archfiend Soldier');
  const s = on(g, 0, 'Archfiend Soldier');
  ok(inZ(g, 0, 'gy', 'Winged Minion') && E.atk(g, s) === 2600 && E.def(g, s) === 2200, `Soldier ${E.atk(g, s)}/${E.def(g, s)}`);
});
T('Winged Rhynos: returns to the hand when a Trap is activated', () => {
  const g = duel({ board: [{ hand: [], m: ['Winged Rhynos'], turn: 2 }, { st: ['Mirror Force'] }] });
  bp(g); atkOn(g, 0, 'Winged Rhynos', null, 'Mirror Force', 'Winged Rhynos');
  ok(inZ(g, 0, 'hand', 'Winged Rhynos') && !inZ(g, 0, 'gy', 'Winged Rhynos'), 'Rhynos dodged Mirror Force');
});
T('Winged Sage Falcos: an Attack Position monster it destroys goes on top of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Winged Sage Falcos'], turn: 2 }, { m: ['Celtic Guardian'] }] });
  bp(g); atkOn(g, 0, 'Winged Sage Falcos', 'Celtic Guardian');
  ok(deckTopName(g, 1) === 'Celtic Guardian' && !inZ(g, 1, 'gy', 'Celtic Guardian'), 'Celtic on top of B\'s Deck');
});
T('Witch Doctor of Chaos: FLIP banishes a monster from a GY', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Witch Doctor of Chaos', pos: 'set' }], turn: 2 }, { gy: ['Celtic Guardian'] }] });
  choose(g, 'flip:'); settle(g, 'Celtic Guardian');
  ok(inZ(g, 1, 'ban', 'Celtic Guardian'), 'Celtic banished');
});
T('Witch Doctor of Sparta: 500 when a monster is Special Summoned from a Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Witch Doctor of Sparta', 'Mystic Tomato'], deckTop: [FILL, 'Mystic Tomato'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Mystic Tomato', FILL, 'Mystic Tomato');
  ok(cnt(g, 0, 'm', 'Mystic Tomato') === 1 && lp(g, 1) === 7500, `Tomato from the Deck, B took 500 (${lp(g, 1)})`);
});
// Errata audit (2026-11-26): no once-per-turn on the 2010 card, so the second Witch searches too.
T('Witch of the Black Forest: searches DEF 1500 or less, each copy', () => {
  const g = duel({ board: [{ hand: [], m: ['Witch of the Black Forest', 'Witch of the Black Forest'], deckTop: [FILL, 'Sangan', 'Big Shield Gardna'], turn: 2 }, { m: [FILL, FILL] }] });
  bp(g); atkOn(g, 0, 'Witch of the Black Forest', FILL, 'Sangan');
  ok(inZ(g, 0, 'hand', 'Sangan'), 'Sangan added');
  const h = hand(g, 0); atkOn(g, 0, 'Witch of the Black Forest', FILL, 'Sangan');
  ok(cnt(g, 0, 'gy', 'Witch of the Black Forest') === 2 && hand(g, 0) === h + 1, 'second Witch searches too');
});
T('3-Hump Lacooda: with 3, tribute 2 to draw 3', () => {
  const g = duel({ board: [{ hand: [], m: ['3-Hump Lacooda', '3-Hump Lacooda', '3-Hump Lacooda'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, '3-Hump Lacooda'); settle(g);
  ok(hand(g, 0) === h + 3 && cnt(g, 0, 'm', '3-Hump Lacooda') === 1 && cnt(g, 0, 'gy', '3-Hump Lacooda') === 2, 'drew 3, 1 Lacooda left');
  const g2 = duel({ board: [{ hand: [], m: ['3-Hump Lacooda', '3-Hump Lacooda'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, '3-Hump Lacooda'), 'not with 2');
});
T('4-Starred Ladybug of Doom: FLIP destroys the opponent\'s Level 4 monsters', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: '4-Starred Ladybug of Doom', pos: 'set' }, FILL], turn: 2 }, { m: [FILL, 'Celtic Guardian', 'Vampire Baby'] }] });
  choose(g, 'flip:'); settle(g);
  ok(inZ(g, 1, 'gy', FILL) && inZ(g, 1, 'gy', 'Celtic Guardian') && on(g, 1, 'Vampire Baby') && on(g, 0, FILL), 'Level 4s destroyed, Level 3 and own stay');
});
T('7: three face-up draw 3, all destroyed, +700 each', () => {
  const g = duel({ board: [{ hand: ['7'], st: [up('7'), up('7')], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, '7'); settle(g); toIdle(g);
  ok(hand(g, 0) === h - 1 + 3 && cnt(g, 0, 'gy', '7') === 3 && lp(g, 0) === 10100, `hand ${hand(g, 0)}, LP ${lp(g, 0)}`);
  const g2 = duel({ board: [{ hand: [], st: [up('7')], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  Bturn(g2); act(g2, 1, 'Mystical Space Typhoon'); settle(g2, '7');
  ok(lp(g2, 0) === 8700, `one destroyed: +700 (${lp(g2, 0)})`);
});
T('7 Completed: Machine only, +700 ATK or DEF', () => {
  const g = duel({ board: [{ hand: ['7 Completed'], m: ['Cyber Dragon'], turn: 2 }, {}] });
  act(g, 0, '7 Completed'); settle(g, 'ATK', 'Cyber Dragon');
  const c = on(g, 0, 'Cyber Dragon'); ok(E.atk(g, c) === 2800 && E.def(g, c) === 1600, `Cyber Dragon ${E.atk(g, c)}/${E.def(g, c)}`);
  const g2 = duel({ board: [{ hand: ['7 Completed'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, '7 Completed'), 'not without a Machine');
});
T('8-Claws Scorpion: sets itself once per turn; 2400 ATK against a Set monster', () => {
  const g = duel({ board: [{ hand: [], m: ['8-Claws Scorpion'], turn: 2 }, { m: [{ n: 'Celtic Guardian', pos: 'set' }] }] });
  bp(g); atkOn(g, 0, '8-Claws Scorpion', 'Celtic Guardian');
  ok(inZ(g, 1, 'gy', 'Celtic Guardian') && lp(g, 0) === 8000, 'Set Celtic destroyed');
  const g2 = duel({ board: [{ hand: [], m: ['8-Claws Scorpion'], turn: 2 }, {}] });
  act(g2, 0, '8-Claws Scorpion'); settle(g2);
  ok(on(g2, 0, '8-Claws Scorpion').pos === 'set', 'Scorpion set itself');
});
T('Abare Ushioni: coin toss, 1000 to one player, once per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Abare Ushioni'], turn: 2 }, {}] });
  act(g, 0, 'Abare Ushioni'); settle(g);
  ok((lp(g, 0) === 7000) !== (lp(g, 1) === 7000), `one player took 1000 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  ok(!canAct(g, 0, 'Abare Ushioni'), 'once per turn');
});
T('Absolute End: the opponent\'s attacks become direct attacks', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Celtic Guardian'], st: ['Absolute End'] }] });
  bp(g); atkOn(g, 0, FILL, 'Celtic Guardian', 'Absolute End');
  ok(lp(g, 1) === 6000 && on(g, 1, 'Celtic Guardian'), `direct 2000, Celtic untouched (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: [FILL, 'Celtic Guardian'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'def' }], st: ['Absolute End'] }] });
  bp(g2); atkOn(g2, 0, FILL, 'Big Shield Gardna', 'Absolute End');
  const cg = on(g2, 0, 'Celtic Guardian'); const dir = canAtk(g2, cg, null);
  if (dir) choose(g2, `atk:${cg.u}:d`); else atkOn(g2, 0, 'Celtic Guardian', 'Big Shield Gardna'); settle(g2);
  ok(lp(g2, 1) === 8000 - 2000 - 1400 && on(g2, 0, 'Celtic Guardian'), `the later attack is direct too (B ${lp(g2, 1)})`);
});
T('Absorbing Kid from the Sky: gains Level x 300 when it destroys a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Absorbing Kid from the Sky'], turn: 2 }, { m: ['Vampire Baby'] }] });
  bp(g); atkOn(g, 0, 'Absorbing Kid from the Sky', 'Vampire Baby');
  ok(lp(g, 0) === 8900, `A gained 900 (${lp(g, 0)})`);
});
T('Abyss Soldier: discard a WATER to bounce a card, once per turn', () => {
  const g = duel({ board: [{ hand: ['Ameba', 'Ameba'], m: ['Abyss Soldier'], turn: 2 }, { hand: [], m: [FILL] }] });
  act(g, 0, 'Abyss Soldier'); settle(g, 'Ameba', FILL);
  ok(inZ(g, 1, 'hand', FILL) && cnt(g, 0, 'gy', 'Ameba') === 1, 'Warwolf to B\'s hand, Ameba discarded');
  ok(!canAct(g, 0, 'Abyss Soldier'), 'once per turn');
});
T('Abyssal Designator: pay 1000, opponent sends a matching monster', () => {
  const g = duel({ board: [{ hand: ['Abyssal Designator'], turn: 2 }, { hand: [] }] });
  act(g, 0, 'Abyssal Designator'); settle(g, 'Beast-Warrior', 'EARTH', FILL);
  ok(lp(g, 0) === 7000 && cnt(g, 1, 'gy', FILL) === 1, `A paid 1000, B sent a Warwolf (B GY ${cnt(g, 1, 'gy')})`);
});
T('Acid Rain: destroys face-up Machines', () => {
  const g = duel({ board: [{ hand: ['Acid Rain'], m: ['Cyber Dragon'], turn: 2 }, { m: ['Cyber Dragon', { n: 'Cyber Dragon', pos: 'set' }, FILL] }] });
  act(g, 0, 'Acid Rain'); settle(g);
  ok(cnt(g, 0, 'gy', 'Cyber Dragon') === 1 && cnt(g, 1, 'gy', 'Cyber Dragon') === 1 && cnt(g, 1, 'm') === 2, 'face-up Machines gone, set one and Warwolf stay');
});
T('Acid Trap Hole: destroys DEF 2000 or less, else back face-down', () => {
  const g = duel({ board: [{ hand: [], st: ['Acid Trap Hole'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  act(g, 0, 'Acid Trap Hole'); settle(g, FILL);
  ok(inZ(g, 1, 'gy', FILL), 'set Warwolf destroyed');
  const g2 = duel({ board: [{ hand: [], st: ['Acid Trap Hole'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'set' }] }] });
  act(g2, 0, 'Acid Trap Hole'); settle(g2, 'Big Shield Gardna');
  const b = on(g2, 1, 'Big Shield Gardna'); ok(b && b.pos === 'set', 'Big Shield Gardna back face-down');
});
T('Adhesion Trap Hole: halves the summoned monster\'s original ATK', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { st: ['Adhesion Trap Hole'] }] });
  ns(g, 0, FILL, 'Adhesion Trap Hole');
  ok(E.atk(g, on(g, 0, FILL)) === 1000, `Warwolf ${E.atk(g, on(g, 0, FILL))}`);
});
T('After the Struggle: monsters that battled are destroyed at the end of the turn', () => {
  const g = duel({ board: [{ hand: ['After the Struggle'], m: [FILL, 'Celtic Guardian'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'def' }] }] });
  act(g, 0, 'After the Struggle'); settle(g);
  bp(g); atkOn(g, 0, FILL, 'Big Shield Gardna');
  ok(on(g, 0, FILL) && on(g, 1, 'Big Shield Gardna'), 'both survive the battle');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Big Shield Gardna') && on(g, 0, 'Celtic Guardian'), 'both destroyed at the end, Celtic stays');
  const g2 = duel({ board: [{ hand: ['After the Struggle'], m: [FILL], turn: 2 }, {}] });
  bp(g2); choose(g2, 'endbp'); settle(g2);
  ok(!canAct(g2, 0, 'After the Struggle'), 'not in Main Phase 2');
});
T('Agido: destroyed by battle, die roll revives a Fairy of that Level', () => {
  let seen = 0, bad = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const g = duel({ seed, board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Agido'], gy: ['Winged Kuriboh', 'Marshmallow' === 'x' ? '' : 'Marshmallon', 'Airknight Parshath'] }] });
    bp(g); atkOn(g, 0, FILL, 'Agido');
    const mons = g.p[1].m.filter(Boolean);
    if (mons.length) { seen++; const lvl = LV(mons[0]); if (![1, 3, 4, 5].includes(lvl)) bad++; }
  }
  ok(seen > 0 && bad === 0, `a Fairy came back in ${seen} of 12 rolls`);
});
T('Airknight Parshath: piercing and draws on battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Airknight Parshath'], turn: 2 }, { m: [{ n: 'Celtic Guardian', pos: 'def' }] }] });
  const h = hand(g, 0); bp(g); atkOn(g, 0, 'Airknight Parshath', 'Celtic Guardian');
  ok(lp(g, 1) === 7300 && hand(g, 0) === h + 1, `B took 700, A drew 1 (LP ${lp(g, 1)})`);
});
T('Altar for Tribute: send your monster, gain its original ATK', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Altar for Tribute'], turn: 2 }, {}] });
  act(g, 0, 'Altar for Tribute'); settle(g, FILL);
  ok(inZ(g, 0, 'gy', FILL) && lp(g, 0) === 10000, `A gained 2000 (${lp(g, 0)})`);
});
T('Ameba: 2000 to the player who takes control of it', () => {
  const g = duel({ board: [{ hand: [], m: ['Ameba'], turn: 2 }, { hand: ['Change of Heart'] }] });
  Bturn(g); act(g, 1, 'Change of Heart'); settle(g, 'Ameba');
  ok(on(g, 1, 'Ameba') && lp(g, 1) === 6000, `B took 2000 (${lp(g, 1)})`);
});
T('Amphibious Bugroth MK-3: attacks directly while Umi is face-up', () => {
  const g = duel({ board: [{ hand: ['Umi'], m: ['Amphibious Bugroth MK-3'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Umi'); settle(g); bp(g);
  ok(canAtk(g, on(g, 0, 'Amphibious Bugroth MK-3'), null), 'direct attack offered with Umi');
  const g2 = duel({ board: [{ hand: [], m: ['Amphibious Bugroth MK-3'], turn: 2 }, { m: [FILL] }] }); bp(g2);
  ok(!canAtk(g2, on(g2, 0, 'Amphibious Bugroth MK-3'), null), 'no direct attack without Umi');
});
T('Amplifier: Jinzo lets its controller use Traps; Jinzo dies when Amplifier leaves', () => {
  const g = duel({ board: [{ hand: ['Amplifier'], m: ['Jinzo'], st: ['Dust Tornado'], turn: 2 }, { hand: ['Mystical Space Typhoon'], st: ['Pot of Greed'] }] });
  act(g, 0, 'Amplifier'); settle(g, 'Jinzo'); ok(inZ(g, 0, 'st', 'Amplifier'), 'equipped to Jinzo');
  // the Trap exemption for Jinzo's controller is a documented ENGINE gap in the script, not checked here
  Bturn(g); act(g, 1, 'Mystical Space Typhoon'); settle(g, 'Amplifier');
  ok(inZ(g, 0, 'gy', 'Amplifier') && inZ(g, 0, 'gy', 'Jinzo'), 'Jinzo destroyed with Amplifier');
});
T('An Owl of Luck: FLIP puts a Field Spell on top; to the hand with Necrovalley', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'An Owl of Luck', pos: 'set' }], deckTop: [FILL, FILL, 'Umi'], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g, 'Umi');
  ok(deckTopName(g, 0) === 'Umi', 'Umi on top');
  const g2 = duel({ board: [{ hand: ['Necrovalley'], m: [{ n: 'An Owl of Luck', pos: 'set' }], deckTop: [FILL, FILL, 'Umi'], turn: 2 }, {}] });
  act(g2, 0, 'Necrovalley'); settle(g2); choose(g2, 'flip:'); settle(g2, 'Umi');
  ok(inZ(g2, 0, 'hand', 'Umi'), 'Umi to the hand with Necrovalley');
});
T('Andro Sphinx: pay 500 with Pyramid of Light; no attack that turn; burns for a destroyed Defense monster', () => {
  const g = duel({ board: [{ hand: ['Andro Sphinx'], st: [up('Pyramid of Light')], turn: 2 }, { m: [FILL] }] });
  ok(canAct(g, 0, 'Andro Sphinx'), 'Special Summon offered'); act(g, 0, 'Andro Sphinx'); settle(g);
  ok(on(g, 0, 'Andro Sphinx') && lp(g, 0) === 7500, `summoned for 500 (${lp(g, 0)})`);
  bp(g); ok(!canAtk(g, on(g, 0, 'Andro Sphinx'), on(g, 1, FILL)), 'cannot attack this turn');
  const g2 = duel({ board: [{ hand: ['Andro Sphinx'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Andro Sphinx'), 'not without Pyramid of Light');
  const g3 = duel({ board: [{ hand: [], m: ['Andro Sphinx'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g3); atkOn(g3, 0, 'Andro Sphinx', FILL);
  // the list's Edison line says the full original ATK; the printed card and the Goat text say half, which the script follows
  ok(inZ(g3, 1, 'gy', FILL) && lp(g3, 1) === 7000, `B took half of 2000 (${lp(g3, 1)})`);
});
T('Ante: the lower Level card goes to the GY and its owner takes 1000', () => {
  const g = duel({ board: [{ hand: ['Ante', 'Jinzo'], turn: 2 }, { hand: ['Kuriboh'] }] });
  act(g, 0, 'Ante'); settle(g, 'Jinzo', 'Kuriboh');
  ok(lp(g, 1) === 7000 && inZ(g, 1, 'gy', 'Kuriboh') && inZ(g, 0, 'hand', 'Jinzo') && lp(g, 0) === 8000, `B took 1000 (${lp(g, 1)})`);
});
T('Apprentice Magician: counter on summon; destroyed by battle sets a Level 2 Spellcaster from the Deck', () => {
  const g = duel({ board: [{ hand: ['Apprentice Magician'], m: ['Royal Magical Library'], turn: 2 }, {}] });
  ns(g, 0, 'Apprentice Magician', 'Royal Magical Library');
  ok(E.lib.ctr(on(g, 0, 'Royal Magical Library'), 'spell') === 1, 'Library got a Spell Counter');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Apprentice Magician'], deckTop: ['Apprentice Magician'] }] });
  bp(g2); atkOn(g2, 0, FILL, 'Apprentice Magician', 'Apprentice Magician');
  const m = g2.p[1].m.find(Boolean); ok(m && E.name(m) === 'Apprentice Magician' && m.pos === 'set', 'set Apprentice from the Deck');
});
T('Appropriate: after activation, each draw outside the Draw Phase gives you 2', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Pot of Greed'], turn: 2 }, { hand: [], st: ['Appropriate'] }] });
  act(g, 0, 'Pot of Greed'); settle(g); choose(g, 'bp'); settle(g, 'Appropriate'); // ENGINE: no open window right after a chain, so B gets it at the next one
  choose(g, 'endbp'); settle(g);
  ok(inZ(g, 1, 'st', 'Appropriate') && card(g, 1, 'Appropriate').pos === 'up', 'Appropriate activated');
  const h = hand(g, 1); act(g, 0, 'Pot of Greed'); settle(g);
  ok(hand(g, 1) === h + 2, `B drew 2 (${hand(g, 1) - h})`);
});
T('Arcane Archer of the Forest: cannot be attacked with a Plant; tribute a Plant to destroy a S/T', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Arcane Archer of the Forest', 'Lord Poison'] }] });
  bp(g); ok(!canAtk(g, on(g, 0, FILL), on(g, 1, 'Arcane Archer of the Forest')) && canAtk(g, on(g, 0, FILL), on(g, 1, 'Lord Poison')), 'Archer not attackable, Lord Poison is');
  const g2 = duel({ board: [{ hand: [], m: ['Arcane Archer of the Forest', 'Lord Poison'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g2, 0, 'Arcane Archer of the Forest'); settle(g2, 'Lord Poison', 'Mirror Force');
  ok(inZ(g2, 0, 'gy', 'Lord Poison') && inZ(g2, 1, 'gy', 'Mirror Force'), 'Lord Poison tributed, Mirror Force destroyed');
});
T('Archfiend\'s Oath: pay 500, a right guess goes to the hand, once per turn', () => {
  const g = duel({ board: [{ hand: [], st: [up('Archfiend\'s Oath')], deckTop: [FILL, 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Archfiend\'s Oath'); settle(g, 'Pot of Greed');
  ok(lp(g, 0) === 7500 && inZ(g, 0, 'hand', 'Pot of Greed'), `Pot added, LP ${lp(g, 0)}`);
  ok(!canAct(g, 0, 'Archfiend\'s Oath'), 'once per turn');
  const g2 = duel({ board: [{ hand: [], st: [up('Archfiend\'s Oath')], deckTop: [FILL, FILL], turn: 2 }, {}] });
  act(g2, 0, 'Archfiend\'s Oath'); settle(g2, 'Pot of Greed');
  ok(cnt(g2, 0, 'gy', FILL) === 1, 'wrong guess goes to the GY');
});
T('Archfiend\'s Roar: pay 500, revive an Archfiend, destroyed at the End Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Archfiend\'s Roar'], gy: ['Archfiend Soldier'], turn: 2 }, {}] });
  act(g, 0, 'Archfiend\'s Roar'); settle(g, 'Archfiend Soldier');
  ok(on(g, 0, 'Archfiend Soldier') && lp(g, 0) === 7500, 'Soldier revived for 500');
  endTurn(g); ok(inZ(g, 0, 'gy', 'Archfiend Soldier'), 'destroyed at the End Phase');
});

// Goat: a few shared scripts with the Goat card pool
{
  const vm = require('vm'), fs = require('fs'), path = require('path');
  const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
  for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const GE = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; GE.init(GC, { format: 'goat' });
  const GF = '7 Colored Fish';
  const gid = n => { const c = GC.find(x => x.n === n); if (!c) throw new Error('no goat card ' + n); return c.id; };
  const gduel = (board, ex) => { const g = (lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board })); settle(g); return g; };
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Airknight Parshath pierces and draws', () => {
    const g = gduel([{ hand: [], m: ['Airknight Parshath'], turn: 2 }, { m: [{ n: 'Celtic Guardian', pos: 'def' }] }]);
    const h = hand(g, 0); bp(g); atkOn(g, 0, 'Airknight Parshath', 'Celtic Guardian');
    ok(lp(g, 1) === 7300 && hand(g, 0) === h + 1, 'Goat: 700 piercing, drew 1');
  });
  G('Vampire Lord returns after an opponent\'s Dark Hole', () => {
    const g = gduel([{ hand: [], m: ['Vampire Lord'], turn: 2 }, { hand: ['Dark Hole'] }]);
    Bturn(g); act(g, 1, 'Dark Hole'); settle(g); endTurn(g); toIdle(g);
    ok(on(g, 0, 'Vampire Lord'), 'Goat: Lord back');
  });
  G('Witch of the Black Forest searches', () => {
    const g = gduel([{ hand: [], m: ['Witch of the Black Forest'], deckTop: [GF, 'Sangan'], turn: 2 }, { m: ['Celtic Guardian'] }]);
    bp(g); atkOn(g, 0, 'Witch of the Black Forest', 'Celtic Guardian', 'Sangan');
    ok(inZ(g, 0, 'hand', 'Sangan'), 'Goat: Sangan added');
  });
  G('Abyss Soldier bounces, 7 Completed on a Machine, Pikeru heals', () => {
    let g = gduel([{ hand: ['Ameba'], m: ['Abyss Soldier'], turn: 2 }, { hand: [], m: [GF] }]);
    act(g, 0, 'Abyss Soldier'); settle(g, 'Ameba', GF); ok(inZ(g, 1, 'hand', GF), 'Goat: bounced');
    g = gduel([{ hand: ['7 Completed'], m: ['Machine King'], turn: 2 }, {}]);
    act(g, 0, '7 Completed'); const mk0 = E.atk(g, on(g, 0, 'Machine King')); settle(g, 'ATK', 'Machine King'); ok(E.atk(g, on(g, 0, 'Machine King')) === mk0 + 700, 'Goat: +700');
    g = gduel([{ hand: [], m: ['White Magician Pikeru', GF], turn: 2 }, {}]); ok(lp(g, 0) === 8800, `Goat: Pikeru +800 (${lp(g, 0)})`);
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-18 review checks passed.');
process.exit(fails ? 1 : 0);
