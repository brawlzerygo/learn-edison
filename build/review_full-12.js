// Independent review checks for full pool batch 12 (written from the card text): node build/review_full-12.js
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
const hand = (g, p) => g.p[p].hand.length;
const refresh = g => { choose(g, 'bp'); settle(g); choose(g, 'endbp'); settle(g); }; // to Main Phase 2, fresh idle prompt
const deckTopName = (g, p) => E.name(g.p[p].deck[g.p[p].deck.length - 1]);

/* ---------------- Miracle ---------------- */
T('Miracle Dig: 5+ banished monsters, return 3 to the GY', () => {
  const g = duel({ board: [{ hand: ['Miracle Dig'], ban: ['Blue-Eyes White Dragon', 'Mystical Elf', 'Sangan', 'Petit Moth', FILL], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Miracle Dig'), 'offered with 5 banished'); act(g, 0, 'Miracle Dig'); settle(g, 'Blue-Eyes', 'Mystical Elf', 'Sangan');
  ok(cnt(g, 0, 'gy') === 4 && cnt(g, 0, 'ban') === 2 && inZ(g, 0, 'gy', 'Blue-Eyes White Dragon'), `3 returned to the GY (gy ${cnt(g, 0, 'gy')}, ban ${cnt(g, 0, 'ban')})`);
  const g2 = duel({ board: [{ hand: ['Miracle Dig'], ban: ['Blue-Eyes White Dragon', 'Mystical Elf', 'Sangan', 'Petit Moth'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Miracle Dig'), 'not with only 4 banished');
});
T('Miracle Fertilizer: revive a Plant, no Normal Summon, destroyed when it leaves', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], st: [{ n: 'Miracle Fertilizer', pos: 'up' }], gy: ['Bean Soldier', 'Man Eater'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Miracle Fertilizer'), 'offered'); act(g, 0, 'Miracle Fertilizer'); settle(g, 'Bean Soldier');
  ok(on(g, 0, 'Bean Soldier'), 'Bean Soldier Special Summoned');
  const f = g.p[0].hand.find(c => E.name(c) === FILL);
  ok(!hasOpt(g, 'ns:' + f.u) && !hasOpt(g, 'set:' + f.u), 'no Normal Summon or Set this turn');
  ok(!canAct(g, 0, 'Miracle Fertilizer'), 'once per turn');
  act(g, 0, 'Dark Hole'); settle(g);
  ok(inZ(g, 0, 'gy', 'Miracle Fertilizer'), 'Fertilizer destroyed when Bean Soldier left the field');
});
T('Miracle Flipper: only attack target, revives on the opponent field, Spell kill destroys 1', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Miracle Flipper', 'Mystical Elf'] }] });
  bp(g);
  ok(!canAtk(g, on(g, 0, FILL), on(g, 1, 'Mystical Elf')) && canAtk(g, on(g, 0, FILL), on(g, 1, 'Miracle Flipper')), 'only Miracle Flipper can be attacked');
  atkOn(g, 0, FILL, 'Miracle Flipper');
  choose(g, 'endbp'); settle(g);
  ok(on(g, 0, 'Miracle Flipper'), 'Miracle Flipper Special Summoned to the attacker side after the Battle Phase');
  const g2 = duel({ board: [{ hand: ['Fissure'], m: [FILL], turn: 2 }, { m: ['Miracle Flipper', 'Mystical Elf'] }] });
  act(g2, 0, 'Fissure'); settle(g2, FILL);
  ok(inZ(g2, 1, 'gy', 'Miracle Flipper') && inZ(g2, 0, 'gy', FILL), 'Fissure killed Flipper, Flipper destroyed the Warwolf');
  const g3 = duel({ board: [{ hand: ['Miracle Flipper'], m: ['Miracle Flipper'], turn: 2 }, {}] });
  const mf = g3.p[0].hand.find(c => E.name(c) === 'Miracle Flipper'); ok(!hasOpt(g3, 'ns:' + mf.u), 'no second Miracle Flipper Normal Summon (a Set is not a Summon)');
});
T('Miracle Jurassic Egg: 2 counters per Dinosaur, Tribute for a Dinosaur', () => {
  const g = duel({ board: [{ hand: ['Frostosaurus'], m: ['Miracle Jurassic Egg', 'Crawling Dragon 2'], deckTop: [FILL, 'Babycerasaurus'], turn: 2 }, {}] });
  choose(g, 'ns:' + card(g, 0, 'Frostosaurus').u); settle(g, 'Crawling Dragon 2');
  const egg = on(g, 0, 'Miracle Jurassic Egg');
  ok(egg && E.lib.ctr(egg, Object.keys(egg.ctr || {})[0]) === 2, `2 counters (${JSON.stringify(egg && egg.ctr)})`);
  act(g, 0, 'Miracle Jurassic Egg'); settle(g, 'Babycerasaurus');
  ok(on(g, 0, 'Babycerasaurus') && inZ(g, 0, 'gy', 'Miracle Jurassic Egg'), 'Babycerasaurus Special Summoned from the Deck');
});
T('Miracle Kids: -400 per Hero Kid in the GY until the End Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Miracle Kids'], gy: ['Hero Kid', 'Hero Kid'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Miracle Kids'); settle(g, 'Blue-Eyes');
  ok(E.atk(g, on(g, 1, 'Blue-Eyes White Dragon')) === 2200, `Blue-Eyes ${E.atk(g, on(g, 1, 'Blue-Eyes White Dragon'))}`);
  endTurn(g);
  ok(E.atk(g, on(g, 1, 'Blue-Eyes White Dragon')) === 3000, 'restored next turn');
});
T('Miracle Locus: opponent draws, +1000, 2 attacks on monsters, no battle damage', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Miracle Locus'], turn: 2 }, { hand: [], m: ['Petit Moth', 'Mystical Elf'] }] });
  const h1 = hand(g, 1);
  act(g, 0, 'Miracle Locus'); settle(g, FILL);
  ok(hand(g, 1) === h1 + 1 && E.atk(g, on(g, 0, FILL)) === 3000, `B drew 1, Warwolf ${E.atk(g, on(g, 0, FILL))}`);
  bp(g); atkOn(g, 0, FILL, 'Petit Moth');
  ok(canAtk(g, on(g, 0, FILL), on(g, 1, 'Mystical Elf')), 'second attack offered'); atkOn(g, 0, FILL, 'Mystical Elf');
  ok(!on(g, 1, 'Petit Moth') && !on(g, 1, 'Mystical Elf') && lp(g, 1) === 8000, `both destroyed, no damage (B ${lp(g, 1)})`);
});
T('Miracle Restoring: remove 2 Spell Counters, revive Dark Magician', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Pot of Greed'], m: ['Royal Magical Library'], st: ['Miracle Restoring'], gy: ['Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Pot of Greed'); settle(g); act(g, 0, 'Pot of Greed'); settle(g);
  const lib = on(g, 0, 'Royal Magical Library');
  ok(E.lib.ctr(lib, 'spell') === 2, `Library has ${E.lib.ctr(lib, 'spell')} counters`);
  ok(canAct(g, 0, 'Miracle Restoring'), 'offered'); act(g, 0, 'Miracle Restoring'); settle(g, 'Dark Magician');
  ok(on(g, 0, 'Dark Magician') && E.lib.ctr(lib, 'spell') === 0, 'Dark Magician Special Summoned, 2 counters removed');
  const g2 = duel({ board: [{ hand: [], m: ['Royal Magical Library'], st: ['Miracle Restoring'], gy: ['Dark Magician'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Miracle Restoring'), 'not without counters');
});
/* ---------------- Mirage ---------------- */
for (const nm of ['Mirage Dragon', 'Pitch-Black Warwolf']) T(nm + ': no opponent Traps in the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: [nm], turn: 2 }, { st: ['Sakuretsu Armor', 'Threatening Roar'] }] });
  bp(g); atkOn(g, 0, nm, null, 'Sakuretsu Armor', 'Threatening Roar');
  ok(on(g, 0, nm) && lp(g, 1) === 8000 - 1600, `attack went through (B ${lp(g, 1)})`);
});
T('Mirage Knight: no Normal Summon, gains the opponent ATK in damage calc, banished in the End Phase', () => {
  const g0 = duel({ board: [{ hand: ['Mirage Knight'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Mirage Knight')), 'cannot be Normal Summoned');
  const g = duel({ board: [{ hand: [], m: ['Mirage Knight'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Mirage Knight', 'Blue-Eyes White Dragon');
  ok(lp(g, 1) === 8000 - 2800 && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), `B took 2800 (${lp(g, 1)})`);
  ok(E.atk(g, on(g, 0, 'Mirage Knight')) === 2800, 'back to 2800 after damage calc');
  endTurn(g);
  ok(inZ(g, 0, 'ban', 'Mirage Knight'), 'banished in the End Phase');
});
T('Mirage of Nightmare: draw to 4 in the opponent Standby, discard as many in yours', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Mirage of Nightmare', pos: 'up' }], turn: 2 }, {}] });
  ok(hand(g, 0) === 1, 'A has 1 card');
  endTurn(g, 'Mirage of Nightmare');
  ok(hand(g, 0) === 4, `A drew up to 4 (${hand(g, 0)})`);
  const gy0 = cnt(g, 0, 'gy');
  endTurn(g, 'Mirage of Nightmare');
  ok(hand(g, 0) === 2 && cnt(g, 0, 'gy') === gy0 + 3, `A drew 1 and discarded 3 (hand ${hand(g, 0)}, gy +${cnt(g, 0, 'gy') - gy0})`);
});
T('Mirage Tube: only when a face-up monster is attacked, not from the hand; 1000 damage', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Mirage Tube'], m: ['Mystical Elf'] }] });
  bp(g); atkOn(g, 0, FILL, 'Mystical Elf', 'Mirage Tube');
  ok(lp(g, 0) === 7000 && inZ(g, 1, 'gy', 'Mirage Tube'), `A took 1000 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: ['Mirage Tube'], m: ['Mystical Elf'] }] });
  bp(g2); atkOn(g2, 0, FILL, 'Mystical Elf', 'Mirage Tube');
  ok(lp(g2, 0) === 8000 && inZ(g2, 1, 'hand', 'Mirage Tube'), 'not from the hand');
});
/* ---------------- Mirror ---------------- */
T('Mirror Gate: swap control of attacker and HERO, then damage; back at the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Mirror Gate'], m: ['Elemental HERO Clayman'] }] });
  bp(g); atkOn(g, 0, FILL, 'Elemental HERO Clayman', 'Mirror Gate');
  ok(on(g, 1, FILL) && inZ(g, 1, 'gy', 'Elemental HERO Clayman') && lp(g, 0) === 8000 - 1200, `B has the Warwolf, Clayman destroyed under A, A took 1200 (A ${lp(g, 0)})`);
  endTurn(g);
  ok(on(g, 0, FILL) && !on(g, 1, FILL), 'Warwolf back with A');
});
T('Mirror of Oaths: destroy a monster Special Summoned from the Deck, draw 1', () => {
  const g = duel({ board: [{ hand: [], st: ['Mirror of Oaths'], turn: 2 }, { hand: ['Monster Gate'], m: ['Mystical Elf'] }] });
  endTurn(g); const h = hand(g, 0);
  act(g, 1, 'Monster Gate'); settle(g, 'Mystical Elf', 'Mirror of Oaths');
  ok(cnt(g, 1, 'm') === 0 && inZ(g, 1, 'gy', FILL) && hand(g, 0) === h + 1, 'the Warwolf from the Deck destroyed, A drew 1');
  const g2 = duel({ board: [{ hand: [], st: ['Mirror of Oaths'], turn: 2 }, { hand: ['Monster Reborn'], gy: ['Blue-Eyes White Dragon'] }] });
  endTurn(g2); act(g2, 1, 'Monster Reborn'); settle(g2, 'Blue-Eyes', 'Mirror of Oaths');
  ok(on(g2, 1, 'Blue-Eyes White Dragon'), 'not for a summon from the GY');
});
T('Mirror of Yata: Spirit only, no return needed, destroyed instead', () => {
  const g0 = duel({ board: [{ hand: ['Mirror of Yata'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g0, 0, 'Mirror of Yata'), 'no Spirit, not offered');
  const g = duel({ board: [{ hand: ['Yamata Dragon', 'Mirror of Yata'], m: [FILL, 'Mystical Elf'], turn: 2 }, {}] });
  choose(g, 'ns:' + card(g, 0, 'Yamata Dragon').u); settle(g, FILL, 'Mystical Elf');
  act(g, 0, 'Mirror of Yata'); settle(g, 'Yamata');
  endTurn(g, 'NO');
  ok(on(g, 0, 'Yamata Dragon'), 'Yamata Dragon stayed on the field');
  const g2 = duel({ board: [{ hand: ['Mirror of Yata'], m: ['Yamata Dragon'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g2, 0, 'Mirror of Yata'); settle(g2, 'Yamata');
  bp(g2); atkOn(g2, 0, 'Yamata Dragon', 'Blue-Eyes White Dragon');
  ok(on(g2, 0, 'Yamata Dragon') && inZ(g2, 0, 'gy', 'Mirror of Yata') && lp(g2, 0) === 7600, 'Mirror destroyed instead, A took 400');
});
T('Mirror Wall: attackers halved; 2000 LP or destroy in the Standby', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { st: [{ n: 'Mirror Wall', pos: 'up' }], m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', FILL);
  ok(inZ(g, 0, 'gy', 'Blue-Eyes White Dragon') && lp(g, 0) === 7500, `Blue-Eyes at 1500 lost to the Warwolf (A ${lp(g, 0)})`);
  endTurn(g);
  const w = g.p[1].st.find(c => c && E.name(c) === 'Mirror Wall');
  ok((w && lp(g, 1) === 6000) || (!w && lp(g, 1) === 8000), `paid 2000 or destroyed (B ${lp(g, 1)}, wall ${!!w})`);
  const g2 = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { st: ['Mirror Wall'], m: [FILL] }] });
  bp(g2); atkOn(g2, 0, 'Blue-Eyes White Dragon', FILL, 'Mirror Wall');
  ok(inZ(g2, 0, 'gy', 'Blue-Eyes White Dragon'), 'activated on the attack, Blue-Eyes halved');
});
/* ---------------- Monster ---------------- */
T('Monster Gate: Tribute 1, excavate to a summonable monster, others to the GY', () => {
  const g = duel({ board: [{ hand: ['Monster Gate'], m: [FILL], deckTop: [FILL, 'Pot of Greed', 'Mirror Force', 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Monster Gate'); settle(g, FILL);
  ok(on(g, 0, 'Blue-Eyes White Dragon') && inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 0, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', FILL), 'Blue-Eyes summoned, Pot and Mirror Force and the Tribute in the GY');
});
T('Monster Reborn: either GY', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], turn: 2 }, { gy: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Monster Reborn'); settle(g, 'Blue-Eyes');
  ok(on(g, 0, 'Blue-Eyes White Dragon'), 'took Blue-Eyes from the opponent GY');
});
T('Monster Recovery: monster and hand into the Deck, draw as many as from the hand', () => {
  const g = duel({ board: [{ hand: ['Monster Recovery', 'Pot of Greed', 'Dark Hole'], m: ['Blue-Eyes White Dragon'], turn: 2 }, {}] });
  const d = g.p[0].deck.length;
  act(g, 0, 'Monster Recovery'); settle(g, 'Blue-Eyes');
  ok(!on(g, 0, 'Blue-Eyes White Dragon') && hand(g, 0) === 3 && g.p[0].deck.length === d + 1, `hand ${hand(g, 0)}, deck +${g.p[0].deck.length - d}`);
});
/* ---------------- Mysterious ---------------- */
T('Mysterious Guard: FLIP top of Deck, plus a bounce with a Warrior', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Mysterious Guard', pos: 'set' }, 'Dark Blade'], turn: 2 }, { hand: [], m: ['Blue-Eyes White Dragon', 'Mystical Elf'] }] });
  choose(g, 'flip:'); settle(g, 'Blue-Eyes', 'Mystical Elf');
  ok(deckTopName(g, 1) === 'Blue-Eyes White Dragon' && inZ(g, 1, 'hand', 'Mystical Elf'), 'Blue-Eyes on top of the Deck, Elf to the hand');
  const g2 = duel({ board: [{ hand: [], m: [{ n: 'Mysterious Guard', pos: 'set' }], turn: 2 }, { hand: [], m: ['Blue-Eyes White Dragon', 'Mystical Elf'] }] });
  choose(g2, 'flip:'); settle(g2, 'Blue-Eyes', 'Mystical Elf');
  ok(deckTopName(g2, 1) === 'Blue-Eyes White Dragon' && on(g2, 1, 'Mystical Elf'), 'no Warrior: only 1 target');
});
T('Mysterious Puppeteer: 500 LP for each Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Mystical Elf'], m: ['Mysterious Puppeteer'], turn: 2 }, {}] });
  ns(g, 0, 'Mystical Elf'); ok(lp(g, 0) === 8500, `own summon (${lp(g, 0)})`);
  endTurn(g); ns(g, 1, FILL); ok(lp(g, 0) === 9000, `opponent summon (${lp(g, 0)})`);
});
T('Mysterious Triangle: destroy an A-Counter monster, Alien from the Deck, destroyed at the End Phase', () => {
  const g = duel({ board: [{ hand: ['Mysterious Triangle'], deckTop: [FILL, 'Alien Hunter'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ok(!canAct(g, 0, 'Mysterious Triangle'), 'not without an A-Counter');
  E.lib.addCtr(g, on(g, 1, 'Blue-Eyes White Dragon'), 'A', 1); refresh(g);
  act(g, 0, 'Mysterious Triangle'); settle(g, 'Blue-Eyes', 'Alien Hunter');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 0, 'Alien Hunter'), 'Blue-Eyes destroyed, Alien Hunter summoned');
  endTurn(g); ok(inZ(g, 0, 'gy', 'Alien Hunter'), 'Alien Hunter destroyed in the End Phase');
});
/* ---------------- Mystic ---------------- */
T('Mystic Box: destroy theirs, give them yours', () => {
  const g = duel({ board: [{ hand: ['Mystic Box'], m: [FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Mystic Box'); settle(g, 'Blue-Eyes', FILL);
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 1, FILL) && !on(g, 0, FILL), 'Blue-Eyes destroyed, Warwolf given');
});
T('Mystic Lamp: direct attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Mystic Lamp'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Mystic Lamp', null); ok(lp(g, 1) === 7600, `400 direct (${lp(g, 1)})`);
});
T('Mystic Plasma Zone: DARK +500 ATK -400 DEF', () => {
  const g = duel({ board: [{ hand: ['Mystic Plasma Zone'], m: ['Archfiend Soldier', FILL], turn: 2 }, { m: ['Ancient Brain'] }] });
  act(g, 0, 'Mystic Plasma Zone'); settle(g);
  const s = on(g, 0, 'Archfiend Soldier'), b = on(g, 1, 'Ancient Brain');
  ok(E.atk(g, s) === 2400 && E.def(g, s) === 1100 && E.atk(g, b) === 1500 && E.def(g, b) === 300 && E.atk(g, on(g, 0, FILL)) === 2000, 'DARK changed, others not');
});
T('Mystic Probe: negates Continuous Spells this turn', () => {
  const g = duel({ board: [{ hand: ['Messenger of Peace'], m: [FILL], turn: 2 }, { st: ['Mystic Probe'] }] });
  act(g, 0, 'Messenger of Peace'); settle(g, 'Mystic Probe');
  ok(inZ(g, 1, 'gy', 'Mystic Probe'), 'Probe activated'); bp(g);
  ok(canAtk(g, on(g, 0, FILL), null), 'Warwolf can attack: Messenger negated');
  const g2 = duel({ board: [{ hand: ['Messenger of Peace'], m: [FILL], turn: 2 }, { st: ['Mystic Probe'] }] });
  act(g2, 0, 'Messenger of Peace'); settle(g2); bp(g2);
  ok(!canAtk(g2, on(g2, 0, FILL), null), 'without Probe Messenger stops the attack');
});
T('Mystic Swordsman LV2: kills Set monsters; LV4 after a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Mystic Swordsman LV2'], turn: 2 }, { m: [{ n: 'Blue-Eyes White Dragon', pos: 'set' }] }] });
  bp(g); atkOn(g, 0, 'Mystic Swordsman LV2', 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 0, 'Mystic Swordsman LV2') && lp(g, 0) === 8000, 'Set Blue-Eyes destroyed, no damage');
  const g2 = duel({ board: [{ hand: ['Mystic Swordsman LV4'], m: ['Mystic Swordsman LV2'], turn: 2 }, { m: ['Petit Moth'] }] });
  bp(g2); atkOn(g2, 0, 'Mystic Swordsman LV2', 'Petit Moth'); endTurn(g2, 'Mystic Swordsman LV4');
  ok(on(g2, 0, 'Mystic Swordsman LV4') && inZ(g2, 0, 'gy', 'Mystic Swordsman LV2'), 'LV4 Special Summoned');
});
T('Mystic Swordsman LV4: Set only, kills Set monsters, LV6 after a battle kill', () => {
  const g0 = duel({ board: [{ hand: ['Mystic Swordsman LV4'], turn: 2 }, {}] });
  const c = card(g0, 0, 'Mystic Swordsman LV4');
  ok(!hasOpt(g0, 'ns:' + c.u) && hasOpt(g0, 'set:' + c.u), 'Set but not Normal Summon');
  const g = duel({ board: [{ hand: [], m: ['Mystic Swordsman LV4'], turn: 2 }, { m: [{ n: 'Blue-Eyes White Dragon', pos: 'set' }] }] });
  bp(g); atkOn(g, 0, 'Mystic Swordsman LV4', 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && lp(g, 0) === 8000, 'Set Blue-Eyes destroyed');
  const g2 = duel({ board: [{ hand: ['Mystic Swordsman LV6'], m: ['Mystic Swordsman LV4'], turn: 2 }, { m: ['Petit Moth'] }] });
  bp(g2); atkOn(g2, 0, 'Mystic Swordsman LV4', 'Petit Moth'); endTurn(g2, 'Mystic Swordsman LV6');
  ok(on(g2, 0, 'Mystic Swordsman LV6'), 'LV6 Special Summoned');
});
T('Mystic Swordsman LV6: Set only, Set monster destroyed and put on top of the Deck', () => {
  const g0 = duel({ board: [{ hand: ['Mystic Swordsman LV6'], m: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g0, 'ns:' + card(g0, 0, 'Mystic Swordsman LV6').u), 'no Normal Summon');
  const g = duel({ board: [{ hand: [], m: ['Mystic Swordsman LV6'], turn: 2 }, { m: [{ n: 'Blue-Eyes White Dragon', pos: 'set' }] }] });
  bp(g); atkOn(g, 0, 'Mystic Swordsman LV6', 'Blue-Eyes White Dragon');
  ok(!on(g, 1, 'Blue-Eyes White Dragon') && deckTopName(g, 1) === 'Blue-Eyes White Dragon', 'Blue-Eyes on top of the Deck');
});
T('Mystical Cards of Light: blocks a zone; 2 draws with another copy', () => {
  const g = duel({ board: [{ hand: ['Mystical Cards of Light', 'Pot of Greed'], st: ['Mirror Force', 'Mirror Force', 'Mirror Force'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Mystical Cards of Light'), 'offered'); act(g, 0, 'Mystical Cards of Light'); settle(g);
  const pot = card(g, 0, 'Pot of Greed');
  ok(!hasOpt(g, 'setst:' + pot.u) && !hasOpt(g, 'a:' + pot.u + ':'), 'last zone unusable');
  const g2 = duel({ board: [{ hand: [], st: [{ n: 'Mystical Cards of Light', pos: 'up' }, { n: 'Mystical Cards of Light', pos: 'up' }], turn: 2 }, {}] });
  settle(g2, 'NO'); const h = hand(g2, 0); endTurn(g2); endTurn(g2);
  ok(hand(g2, 0) === h + 2, `drew 2 (hand ${h} -> ${hand(g2, 0)})`);
});
T('Mystical Knight of Jackal: battle kill to the top of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Mystical Knight of Jackal'], turn: 2 }, { m: ['Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Mystical Knight of Jackal', 'Mystical Elf');
  ok(deckTopName(g, 1) === 'Mystical Elf' && !inZ(g, 1, 'gy', 'Mystical Elf'), 'Elf on top of the Deck');
});
T('Mystical Moon: Beast-Warrior +300/+300', () => {
  const g = duel({ board: [{ hand: ['Mystical Moon'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Mystical Moon'); settle(g, FILL);
  ok(E.atk(g, on(g, 0, FILL)) === 2300 && E.def(g, on(g, 0, FILL)) === 400, 'Warwolf 2300/400');
  const g2 = duel({ board: [{ hand: ['Mystical Moon'], m: ['Mystical Elf'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Mystical Moon'), 'not for a Spellcaster');
});
T('Mystical Sheep 1: plays normally (substitute material is a documented ENGINE gap)', () => {
  const g = duel({ board: [{ hand: ['Mystical Sheep 1'], turn: 2 }, {}] });
  ns(g, 0, 'Mystical Sheep 1'); ok(on(g, 0, 'Mystical Sheep 1') && E.atk(g, on(g, 0, 'Mystical Sheep 1')) === 1150, 'Normal Summoned, 1150 ATK');
});
T('Mystical Wind Typhoon: only as Chain Link 3+', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Mystical Wind Typhoon'], turn: 2 }, { st: ['Threatening Roar', 'Mirror Force'] }] });
  ok(!canAct(g, 0, 'Mystical Wind Typhoon'), 'not at Chain Link 1');
  act(g, 0, 'Mystical Space Typhoon');
  choose(g, 'u' + g.p[1].st[0].u);
  const respond = (who, nm) => { const pr = g.prompt; if (pr.type !== 'respond' || pr.p !== who) throw new Error(`expected ${who} respond, got ${pr.p} ${pr.type} ${pr.text}`);
    const o = pr.opts.find(x => { const c = x.u != null && byU(g, x.u); return c && E.name(c) === nm; }); if (!o) throw new Error('no ' + nm + ': ' + pr.opts.map(x => x.label).join(', ')); E.act(g, [o.key]); };
  const mf = g.p[1].st[1]; respond(1, 'Threatening Roar'); respond(0, 'Mystical Wind Typhoon'); choose(g, 'u' + mf.u); settle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'Mystical Wind Typhoon'), 'Wind Typhoon at Chain Link 3 destroyed Mirror Force');
});
/* ---------------- Needle ---------------- */
T('Needle Burrower: Level x 500 after a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Needle Burrower'], turn: 2 }, { m: ['Hitotsu-Me Giant'] }] });
  bp(g); atkOn(g, 0, 'Needle Burrower', 'Hitotsu-Me Giant');
  ok(lp(g, 1) === 8000 - 500 - 2000, `500 battle + 2000 (${lp(g, 1)})`);
});
T('Needle Ceiling: 4+ monsters, destroy all face-up monsters', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, FILL], st: ['Needle Ceiling'], turn: 2 }, { m: ['Blue-Eyes White Dragon', { n: 'Mystical Elf', pos: 'set' }] }] });
  act(g, 0, 'Needle Ceiling'); settle(g);
  ok(cnt(g, 0, 'm') === 0 && !on(g, 1, 'Blue-Eyes White Dragon') && on(g, 1, 'Mystical Elf'), 'face-up ones destroyed, Set Elf stays');
  const g2 = duel({ board: [{ hand: [], m: [FILL], st: ['Needle Ceiling'], turn: 2 }, { m: ['Blue-Eyes White Dragon', 'Mystical Elf'] }] });
  ok(!canAct(g2, 0, 'Needle Ceiling'), 'not with 3 monsters');
});
T('Needle Wall: die roll destroys 1 opponent monster in your Standby', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Needle Wall', pos: 'up' }], turn: 2 }, { hand: [], m: [FILL, FILL, FILL, FILL, FILL] }] });
  ok(cnt(g, 1, 'm') === 4, `turn 2 Standby: 1 destroyed (${cnt(g, 1, 'm')} left)`);
  endTurn(g); endTurn(g, 'Needle Wall');
  ok(cnt(g, 1, 'm') === 3, `1 destroyed (${cnt(g, 1, 'm')} left)`);
});
T('Needle Worm: FLIP mills 5', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Needle Worm', pos: 'set' }], turn: 2 }, {}] });
  const d = g.p[1].deck.length; choose(g, 'flip:'); settle(g);
  ok(g.p[1].deck.length === d - 5 && cnt(g, 1, 'gy') === 5, 'B sent 5 to the GY');
});
/* ---------------- Nightmare ---------------- */
T('Nightmare Archfiends: Tribute 1, 3 tokens to the opponent, 800 each destroyed', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Blue-Eyes White Dragon'], st: ['Nightmare Archfiends'], turn: 2 }, {}] });
  act(g, 0, 'Nightmare Archfiends'); settle(g, FILL);
  ok(cnt(g, 1, 'm') === 3 && g.p[1].m.every(c => !c || c.pos === 'atk') && inZ(g, 0, 'gy', FILL), '3 tokens for B in Attack Position');
  bp(g); const t = g.p[1].m.find(c => c); choose(g, `atk:${on(g, 0, 'Blue-Eyes White Dragon').u}:${t.u}`); settle(g);
  ok(lp(g, 1) === 8000 - 1000 - 800, `1000 battle + 800 (${lp(g, 1)})`);
});
T('Nightmare Horse: direct attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Nightmare Horse'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Nightmare Horse', null); ok(lp(g, 1) === 7500, `${lp(g, 1)}`);
});
T('Nightmare Penguin: WATER +200, flip bounces 1 card', () => {
  const g = duel({ board: [{ hand: [], m: ['Nightmare Penguin', '7 Colored Fish', FILL], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, '7 Colored Fish')) === 2000 && E.atk(g, on(g, 0, 'Nightmare Penguin')) === 1100 && E.atk(g, on(g, 0, FILL)) === 2000, 'WATER +200');
  const g2 = duel({ board: [{ hand: [], m: [{ n: 'Nightmare Penguin', pos: 'set' }], turn: 2 }, { hand: [], st: ['Mirror Force'] }] });
  choose(g2, 'flip:'); settle(g2, 'Mirror Force');
  ok(inZ(g2, 1, 'hand', 'Mirror Force'), 'Mirror Force back to the hand');
});
/* ---------------- Non ---------------- */
T('Non Aggression Area: own Standby, discard 1, opponent cannot summon next turn', () => {
  const g = duel({ board: [{ hand: [], st: ['Non Aggression Area'], turn: 2 }, {}] });
  settle(g, 'Non Aggression Area', FILL);
  ok(inZ(g, 0, 'gy', 'Non Aggression Area'), 'activated');
  endTurn(g); const f = g.p[1].hand[0];
  ok(g.tp === 1 && !hasOpt(g, 'ns:' + f.u) && !hasOpt(g, 'set:' + f.u), 'B cannot Normal Summon or Set');
});
T('Non-Fusion Area: no Fusion Summons', () => {
  const g = duel({ ex0: ['Flame Swordsman'], board: [{ hand: ['Polymerization', 'Masaki the Legendary Swordsman', 'Flame Manipulator'], st: [{ n: 'Non-Fusion Area', pos: 'up' }], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Polymerization'), 'Polymerization not offered');
});
T('Non-Spellcasting Area: non-Effect monsters unaffected by Spells', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], st: [{ n: 'Non-Spellcasting Area', pos: 'up' }], turn: 2 }, { m: ['Blue-Eyes White Dragon', 'Sangan'] }] });
  act(g, 0, 'Dark Hole'); settle(g);
  ok(on(g, 1, 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Sangan'), 'Blue-Eyes survived, Sangan destroyed');
});
T('Ocean Dragon Lord - Neo-Daedalus: Tribute Levia-Dragon; Umi clears hands and field', () => {
  const g = duel({ board: [{ hand: ['Ocean Dragon Lord - Neo-Daedalus', 'Umi'], m: ['Levia-Dragon - Daedalus', FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'] }] });
  const n = card(g, 0, 'Ocean Dragon Lord - Neo-Daedalus');
  ok(!hasOpt(g, 'ns:' + n.u) && !hasOpt(g, 'set:' + n.u) && hasOpt(g, 'sp:' + n.u), 'Special Summon only');
  choose(g, 'sp:' + n.u); settle(g, 'Levia-Dragon');
  ok(on(g, 0, 'Ocean Dragon Lord - Neo-Daedalus') && inZ(g, 0, 'gy', 'Levia-Dragon - Daedalus'), 'summoned by Tributing Levia-Dragon');
  act(g, 0, 'Umi'); settle(g);
  act(g, 0, 'Ocean Dragon Lord - Neo-Daedalus'); settle(g);
  ok(on(g, 0, 'Ocean Dragon Lord - Neo-Daedalus') && cnt(g, 0, 'm') === 1 && hand(g, 0) === 0 && hand(g, 1) === 0 && cnt(g, 1, 'm') === 0 && cnt(g, 1, 'st') === 0, 'everything else to the GY');
  const g2 = duel({ board: [{ hand: ['Ocean Dragon Lord - Neo-Daedalus'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g2, card(g2, 0, 'Ocean Dragon Lord - Neo-Daedalus')), 'no summon without Levia-Dragon');
});
/* ---------------- Ojama ---------------- */
T('Ojama Delta Hurricane!!: with the 3 Ojamas, destroy all opponent cards', () => {
  const g = duel({ board: [{ hand: ['Ojama Delta Hurricane!!'], m: ['Ojama Green', 'Ojama Yellow', 'Ojama Black'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'] }] });
  act(g, 0, 'Ojama Delta Hurricane!!'); settle(g);
  ok(cnt(g, 1, 'm') === 0 && cnt(g, 1, 'st') === 0 && cnt(g, 0, 'm') === 3, 'B field cleared');
  const g2 = duel({ board: [{ hand: ['Ojama Delta Hurricane!!'], m: ['Ojama Green', 'Ojama Yellow'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ok(!canAct(g2, 0, 'Ojama Delta Hurricane!!'), 'not without Ojama Black');
});
T('Ojama King: Fusion of the 3 Ojamas, locks up to 3 opponent zones', () => {
  const g = duel({ ex0: ['Ojama King'], board: [{ hand: ['Polymerization', 'Ojama Green', 'Ojama Yellow', 'Ojama Black'], turn: 2 }, { m: [FILL, FILL] }] });
  act(g, 0, 'Polymerization'); settle(g, 'Ojama King', 'Ojama Green', 'Ojama Yellow', 'Ojama Black', 'Defense');
  ok(on(g, 0, 'Ojama King'), 'Ojama King Fusion Summoned');
  endTurn(g); const f = g.p[1].hand[0];
  ok(!hasOpt(g, 'ns:' + f.u) && !hasOpt(g, 'set:' + f.u), 'B, with 2 monsters, has no usable zone left');
});
T('Ojama Red: Normal Summon, Special Summon up to 4 Ojamas from the hand', () => {
  const g = duel({ board: [{ hand: ['Ojama Red', 'Ojama Green', 'Ojama Yellow', 'Ojama Black'], turn: 2 }, {}] });
  ns(g, 0, 'Ojama Red', 'Ojama Green', 'Ojama Yellow', 'Ojama Black');
  ok(cnt(g, 0, 'm') === 4 && g.p[0].m.every(c => !c || c.pos === 'atk'), `${cnt(g, 0, 'm')} on the field in Attack Position`);
});
T('Ojama Trio: 3 tokens to the opponent in Defense, 300 each destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], st: ['Ojama Trio'], turn: 2 }, {}] });
  act(g, 0, 'Ojama Trio'); settle(g);
  ok(cnt(g, 1, 'm') === 3 && g.p[1].m.every(c => !c || c.pos === 'def'), '3 Defense tokens for B');
  bp(g); const t = g.p[1].m.find(c => c); choose(g, `atk:${on(g, 0, 'Blue-Eyes White Dragon').u}:${t.u}`); settle(g);
  ok(lp(g, 1) === 7700, `B took 300 (${lp(g, 1)})`);
});
/* ---------------- Pitch ---------------- */
T('Pitch-Black Power Stone: 3 counters, move 1 to another card', () => {
  const g = duel({ board: [{ hand: [], m: ['Royal Magical Library'], st: ['Pitch-Black Power Stone'], turn: 2 }, {}] });
  act(g, 0, 'Pitch-Black Power Stone'); settle(g);
  const s = g.p[0].st.find(c => c && E.name(c) === 'Pitch-Black Power Stone');
  ok(s && E.lib.ctr(s, 'spell') === 3, `3 counters (${s && E.lib.ctr(s, 'spell')})`);
  ok(canAct(g, 0, 'Pitch-Black Power Stone'), 'move offered'); act(g, 0, 'Pitch-Black Power Stone'); settle(g, 'Royal Magical Library');
  ok(E.lib.ctr(s, 'spell') === 2 && E.lib.ctr(on(g, 0, 'Royal Magical Library'), 'spell') === 1, 'one counter moved');
  ok(!canAct(g, 0, 'Pitch-Black Power Stone'), 'once per turn');
});
T('Pitch-Dark Dragon: Union to Dark Blade +400/+400 and piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Pitch-Dark Dragon', 'Dark Blade'], turn: 2 }, { m: [{ n: 'Petit Moth', pos: 'set' }] }] });
  act(g, 0, 'Pitch-Dark Dragon'); settle(g, 'Dark Blade');
  const b = on(g, 0, 'Dark Blade');
  ok(E.atk(g, b) === 2200 && E.def(g, b) === 1900 && inZ(g, 0, 'st', 'Pitch-Dark Dragon'), `Dark Blade ${E.atk(g, b)}/${E.def(g, b)}`);
  bp(g); atkOn(g, 0, 'Dark Blade', 'Petit Moth');
  ok(lp(g, 1) === 8000 - 2000, `piercing 2000 (${lp(g, 1)})`);
});
/* ---------------- Poison / Pot ---------------- */
T('Poison Chain: no attack, mill per Iron Chain in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Iron Chain Snake', 'Iron Chain Coil'], st: [{ n: 'Poison Chain', pos: 'up' }], turn: 2 }, {}] });
  endTurn(g, 'Poison Chain');
  ok(cnt(g, 1, 'gy') === 2, `B sent ${cnt(g, 1, 'gy')} to the GY`);
});
T('Poison Draw Frog: draw 1 when sent to the GY from face-up', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Poison Draw Frog'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Dark Hole'); settle(g);
  ok(hand(g, 0) === h, `drew 1 (hand ${hand(g, 0)})`);
});
T('Poison Fangs: Beast battle damage +500', () => {
  const g = duel({ board: [{ hand: [], m: ['Big Koala'], st: [{ n: 'Poison Fangs', pos: 'up' }], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Big Koala', null); ok(lp(g, 1) === 8000 - 3200, `${lp(g, 1)}`);
});
T('Poison Mummy: FLIP 500 damage', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Poison Mummy', pos: 'set' }], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g); ok(lp(g, 1) === 7500, `${lp(g, 1)}`);
});
T('Poison of the Old Man: gain 1200 or burn 800', () => {
  const g = duel({ board: [{ hand: ['Poison of the Old Man'], turn: 2 }, {}] });
  act(g, 0, 'Poison of the Old Man'); settle(g, '1200'); ok(lp(g, 0) === 9200, `gain (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Poison of the Old Man'], turn: 2 }, {}] });
  act(g2, 0, 'Poison of the Old Man'); settle(g2, '800'); ok(lp(g2, 1) === 7200, `burn (${lp(g2, 1)})`);
});
T('Pot of Benevolence: 2 GY cards back to the Decks, banished, once per turn', () => {
  const g = duel({ board: [{ hand: ['Pot of Benevolence', 'Pot of Benevolence'], gy: ['Blue-Eyes White Dragon', 'Dark Hole'], turn: 2 }, { gy: ['Mirror Force'] }] });
  act(g, 0, 'Pot of Benevolence'); settle(g, 'Blue-Eyes', 'Mirror Force');
  ok(!inZ(g, 0, 'gy', 'Blue-Eyes White Dragon') && !inZ(g, 1, 'gy', 'Mirror Force') && g.p[1].deck.some(c => E.name(c) === 'Mirror Force') && inZ(g, 0, 'ban', 'Pot of Benevolence'), 'shuffled into the owners Decks, Pot banished');
  ok(!canAct(g, 0, 'Pot of Benevolence'), 'only 1 per turn');
});
T('Pot of Generosity: 2 cards from the hand to the Deck', () => {
  const g = duel({ board: [{ hand: ['Pot of Generosity', 'Pot of Greed', 'Dark Hole'], turn: 2 }, {}] });
  const d = g.p[0].deck.length; act(g, 0, 'Pot of Generosity'); settle(g, 'Pot of Greed', 'Dark Hole');
  ok(hand(g, 0) === 1 && g.p[0].deck.length === d + 2, `hand ${hand(g, 0)}, deck +${g.p[0].deck.length - d}`);
});
T('Pot of Greed: draw 2', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Pot of Greed'); settle(g); ok(hand(g, 0) === h + 1, `hand ${hand(g, 0)}`);
});
// Goat: quick checks of the shared scripts and Mystical Sheep #1 with the Goat card pool
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
  const gduel = (board, ex) => (lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board }));
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Pot of Greed, Monster Reborn, Poison of the Old Man', () => {
    let g = gduel([{ hand: ['Pot of Greed'], turn: 2 }, {}]);
    act(g, 0, 'Pot of Greed'); settle(g); ok(hand(g, 0) === 3, 'Goat: Pot drew 2');
    g = gduel([{ hand: ['Monster Reborn'], turn: 2 }, { gy: ['Blue-Eyes White Dragon'] }]);
    act(g, 0, 'Monster Reborn'); settle(g, 'Blue-Eyes'); ok(on(g, 0, 'Blue-Eyes White Dragon'), 'Goat: Reborn');
    g = gduel([{ hand: ['Poison of the Old Man'], turn: 2 }, {}]);
    act(g, 0, 'Poison of the Old Man'); settle(g, '800'); ok(lp(g, 1) === 7200, 'Goat: Old Man burn 800');
  });
  G('Mystical Sheep #1 plays normally (substitute is an ENGINE gap)', () => {
    const g = gduel([{ hand: ['Mystical Sheep #1'], turn: 2 }, {}]);
    ns(g, 0, 'Mystical Sheep #1'); ok(on(g, 0, 'Mystical Sheep #1'), 'Goat: Sheep #1 Normal Summoned');
  });
  G('Ojama Trio, Needle Worm, Mystic Lamp', () => {
    let g = gduel([{ hand: [], st: ['Ojama Trio'], turn: 2 }, {}]);
    act(g, 0, 'Ojama Trio'); settle(g); ok(cnt(g, 1, 'm') === 3, 'Goat: 3 Ojama Tokens');
    g = gduel([{ hand: [], m: [{ n: 'Needle Worm', pos: 'set' }], turn: 2 }, {}]);
    choose(g, 'flip:'); settle(g); ok(cnt(g, 1, 'gy') === 5, 'Goat: Needle Worm mills 5');
    g = gduel([{ hand: [], m: ['Mystic Lamp'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    bp(g); atkOn(g, 0, 'Mystic Lamp', null); ok(lp(g, 1) === 7600, 'Goat: Mystic Lamp direct');
  });
  G('Mirror Wall halves the attacker', () => {
    const g = gduel([{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { st: [{ n: 'Mirror Wall', pos: 'up' }], m: [GF] }]);
    bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', GF);
    ok(inZ(g, 0, 'gy', 'Blue-Eyes White Dragon'), 'Goat: Blue-Eyes at 1500 lost');
  });
}
console.log(fails ? `\n${fails} failed` : '\nAll full-12 review checks passed.');
process.exit(fails ? 1 : 0);
