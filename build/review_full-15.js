// Independent review checks for full pool batch 15 (written from the card text): node build/review_full-15.js
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


/* ---------------- Spell ... ---------------- */
T('Spell Absorption: 500 LP per Spell activated, not for itself', () => {
  const g = duel({ board: [{ hand: ['Spell Absorption', 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Spell Absorption'); settle(g);
  ok(lp(g, 0) === 8000, `no LP for activating itself (${lp(g, 0)})`);
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(lp(g, 0) === 8500, `gained 500 after Pot of Greed (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { st: [{ n: 'Spell Absorption', pos: 'up' }] }] });
  act(g2, 0, 'Pot of Greed'); settle(g2);
  ok(lp(g2, 1) === 8500 && lp(g2, 0) === 8000, `opponent Spell also counts for its controller (B ${lp(g2, 1)})`);
});
T('Spell Calling: destroyed by an opponent Spell, Set a Quick-Play from the Deck', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], turn: 2 }, { st: ['Spell Calling'], deckTop: ['Book of Moon'] }] });
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Spell Calling', 'Book of Moon');
  const bm = g.p[1].st.find(c => c && E.name(c) === 'Book of Moon');
  ok(inZ(g, 1, 'gy', 'Spell Calling') && bm && bm.pos === 'set', 'Book of Moon Set from the Deck');
});
T('Spell Canceller: no Spell activations', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: ['Dark Hole'], turn: 2 }, { m: ['Spell Canceller'] }] });
  ok(!canAct(g, 0, 'Pot of Greed') && !canAct(g, 0, 'Dark Hole'), 'Pot and a Set Dark Hole cannot be activated');
  const g2 = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, {}] });
  ok(canAct(g2, 0, 'Pot of Greed'), 'Pot can be activated without Canceller');
});
T('Spell Chronicle: hand to GY, banish 5, counters, add, burn on leaving', () => {
  const S = ['Pot of Greed', 'Dark Hole', 'Raigeki', 'Heavy Storm', 'Monster Reborn', 'Mystical Space Typhoon'];
  const g = duel({ board: [{ hand: ['Spell Chronicle', FILL, FILL], deckTop: [FILL, ...S], turn: 2 }, { hand: ['Pot of Greed', 'Pot of Greed'] }] });
  ok(canAct(g, 0, 'Spell Chronicle'), 'offered with 6 Spells in the Deck');
  act(g, 0, 'Spell Chronicle'); settle(g, 'Pot of Greed', 'Dark Hole', 'Raigeki', 'Heavy Storm', 'Monster Reborn');
  ok(hand(g, 0) === 0 && cnt(g, 0, 'gy') === 3, `whole hand sent to the GY (hand ${hand(g, 0)}, gy ${cnt(g, 0, 'gy')})`);
  ok(cnt(g, 0, 'ban') === 5 && g.p[0].ban.every(c => E.lib.isST(c)), `5 Spells/Traps banished (${cnt(g, 0, 'ban')})`);
  endTurn(g);
  act(g, 1, 'Pot of Greed'); settle(g); act(g, 1, 'Pot of Greed'); settle(g);
  const ch = card(g, 0, 'Spell Chronicle');
  ok(E.lib.ctr(ch, 'chronicle') === 2 || JSON.stringify(ch.ctr || {}).includes('2'), `2 Chronicle Counters (${JSON.stringify(ch.ctr)})`);
  endTurn(g);
  const h = hand(g, 0);
  ok(canAct(g, 0, 'Spell Chronicle'), 'remove-counters effect offered'); act(g, 0, 'Spell Chronicle'); settle(g);
  ok(hand(g, 0) === h + 1 && cnt(g, 0, 'ban') === 4, `1 banished card added (hand ${hand(g, 0)}, ban ${cnt(g, 0, 'ban')})`);
  const g2 = duel({ board: [{ hand: ['Spell Chronicle'], deckTop: [FILL, ...S], turn: 2 }, { st: ['Mystical Space Typhoon'] }] });
  act(g2, 0, 'Spell Chronicle'); settle(g2, 'Pot of Greed', 'Dark Hole', 'Raigeki', 'Heavy Storm', 'Monster Reborn');
  endTurn(g2); act(g2, 1, 'Mystical Space Typhoon'); settle(g2, 'Spell Chronicle');
  ok(lp(g2, 0) === 8000 - 2500, `2500 damage when it left the field (${lp(g2, 0)})`);
  const g3 = duel({ board: [{ hand: ['Spell Chronicle'], deckTop: [FILL, 'Pot of Greed', 'Dark Hole', 'Raigeki', 'Heavy Storm'], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'Spell Chronicle'), 'not with only 4 Spells/Traps in the Deck');
});
// ENGINE (documented in the script): no hook for LP paid to activate a Spell, so only the activation is checked.
T('Spell Economics: can be activated and stays face-up', () => {
  const g = duel({ board: [{ hand: ['Spell Economics'], turn: 2 }, {}] });
  act(g, 0, 'Spell Economics'); settle(g);
  ok(g.p[0].st.some(c => c && E.name(c) === 'Spell Economics' && c.pos === 'up'), 'Spell Economics face-up');
  const g2 = duel({ board: [{ hand: ['Premature Burial'], gy: ['Blue-Eyes White Dragon'], turn: 2 }, { st: [{ n: 'Spell Economics', pos: 'up' }] }] });
  act(g2, 0, 'Premature Burial'); settle(g2, 'Blue-Eyes');
  ok(lp(g2, 0) === 7200, `opponent's Economics does not help (${lp(g2, 0)})`);
});
T('Spell Gear: 3 Ancient Gear cards for 2 Golems, no Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Spell Gear', 'Ancient Gear Golem'], m: ['Ancient Gear', 'Ancient Gear', 'Ancient Gear Cannon'], deckTop: [FILL, 'Ancient Gear Golem'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Spell Gear'), 'offered'); act(g, 0, 'Spell Gear'); settle(g, 'Ancient Gear', 'Ancient Gear Golem', 'Attack');
  ok(cnt(g, 0, 'm', 'Ancient Gear Golem') === 2 && cnt(g, 0, 'gy') >= 3, `2 Golems summoned (m ${cnt(g, 0, 'm', 'Ancient Gear Golem')}, gy ${cnt(g, 0, 'gy')})`);
  const f = g.p[0].hand.find(c => E.name(c) === FILL);
  ok(f && !hasOpt(g, 'ns:' + f.u) && !hasOpt(g, 'set:' + f.u), 'no Normal Summon or Set');
});
T('Spell of Pain: the burn hits the opponent instead', () => {
  const g = duel({ board: [{ hand: ['Hinotama'], turn: 2 }, { st: ['Spell of Pain'] }] });
  act(g, 0, 'Hinotama'); settle(g, 'Spell of Pain');
  ok(lp(g, 0) === 7500 && lp(g, 1) === 8000, `A took 500 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Spell Power Grasp: 1 Spell Counter, search another, once per turn', () => {
  const g = duel({ board: [{ hand: ['Spell Power Grasp'], m: ['Royal Magical Library'], deckTop: [FILL, 'Spell Power Grasp'], turn: 2 }, {}] });
  act(g, 0, 'Spell Power Grasp'); settle(g, 'Royal Magical Library', 'Spell Power Grasp');
  const lib = on(g, 0, 'Royal Magical Library');
  ok(E.lib.ctr(lib, 'spell') >= 1, `Library has a Spell Counter (${E.lib.ctr(lib, 'spell')})`);
  ok(inZ(g, 0, 'hand', 'Spell Power Grasp'), 'second Grasp added');
  ok(!canAct(g, 0, 'Spell Power Grasp'), 'only 1 per turn');
});
T('Spell Purification: discard 1, destroy all face-up Continuous Spells', () => {
  const g = duel({ board: [{ hand: [FILL], st: ['Spell Purification', { n: 'Spell Economics', pos: 'up' }], turn: 2 }, { st: [{ n: 'Spell Absorption', pos: 'up' }, 'Dark Hole'] }] });
  act(g, 0, 'Spell Purification'); settle(g);
  ok(inZ(g, 0, 'gy', 'Spell Economics') && inZ(g, 1, 'gy', 'Spell Absorption') && inZ(g, 1, 'st', 'Dark Hole'), 'both Continuous Spells destroyed, Set Dark Hole stays');
  ok(hand(g, 0) === 1, `discarded 1 (hand ${hand(g, 0)})`);
});
T('Spell Reactor RE: destroys the opponent Spell and burns 800', () => {
  const g = duel({ board: [{ hand: ['Spell Economics'], turn: 2 }, { m: ['Spell Reactor RE'] }] });
  act(g, 0, 'Spell Economics'); settle(g, 'Spell Reactor');
  ok(inZ(g, 0, 'gy', 'Spell Economics') && lp(g, 0) === 7200, `Economics destroyed, A at ${lp(g, 0)}`);
});
T('Spell Reclamation: the Spell returns to the hand', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', FILL], st: ['Spell Reclamation'], turn: 2 }, {}] });
  act(g, 0, 'Pot of Greed'); settle(g, 'Spell Reclamation');
  ok(inZ(g, 0, 'hand', 'Pot of Greed') && inZ(g, 0, 'gy', 'Spell Reclamation'), 'Pot of Greed back in the hand');
});
T('Spell Reproduction: send 2 Spells, add 1 from the GY', () => {
  const g = duel({ board: [{ hand: ['Spell Reproduction', 'Dark Hole', 'Raigeki'], gy: ['Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Spell Reproduction'); settle(g, 'Pot of Greed', 'Dark Hole', 'Raigeki');
  ok(inZ(g, 0, 'hand', 'Pot of Greed') && inZ(g, 0, 'gy', 'Dark Hole') && inZ(g, 0, 'gy', 'Raigeki'), 'Pot back, 2 Spells in the GY');
  const g2 = duel({ board: [{ hand: ['Spell Reproduction', 'Dark Hole'], gy: ['Pot of Greed'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Spell Reproduction'), 'not with only 1 other Spell');
});
T('Spell Shattering Arrow: destroy face-up opponent Spells, 500 each', () => {
  const g = duel({ board: [{ hand: ['Spell Shattering Arrow'], turn: 2 }, { st: [{ n: 'Spell Absorption', pos: 'up' }, { n: 'Spell Economics', pos: 'up' }, 'Dark Hole'] }] });
  act(g, 0, 'Spell Shattering Arrow'); settle(g);
  ok(inZ(g, 1, 'gy', 'Spell Absorption') && inZ(g, 1, 'gy', 'Spell Economics') && inZ(g, 1, 'st', 'Dark Hole'), 'face-up Spells destroyed');
  ok(lp(g, 1) === 7000, `1000 damage (${lp(g, 1)})`);
});
T('Spell Shield Type-8: negates a 1-target Spell, or any Spell for a Spell cost', () => {
  const g = duel({ board: [{ hand: ['Snatch Steal'], turn: 2 }, { st: ['Spell Shield Type-8'], m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Snatch Steal'); settle(g, 'Blue-Eyes', 'Spell Shield', 'targets');
  ok(on(g, 1, 'Blue-Eyes White Dragon') && inZ(g, 0, 'gy', 'Snatch Steal'), 'Snatch Steal negated and destroyed');
  const g2 = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { hand: ['Dark Hole'], st: ['Spell Shield Type-8'] }] });
  const h = hand(g2, 0); act(g2, 0, 'Pot of Greed'); settle(g2, 'Spell Shield', 'Send', 'Dark Hole');
  ok(hand(g2, 0) === h - 1 && inZ(g2, 1, 'gy', 'Dark Hole'), `Pot negated, Dark Hole sent (A hand ${hand(g2, 0)})`);
});
T('Spell Striker: Special Summon by banishing a Spell, direct attack, no damage to its controller', () => {
  const g = duel({ board: [{ hand: ['Spell Striker'], gy: ['Pot of Greed'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  const s = card(g, 0, 'Spell Striker'); ok(hasOpt(g, 'sp:' + s.u), 'Special Summon offered'); choose(g, 'sp:' + s.u); settle(g, 'Pot of Greed', 'Attack');
  ok(on(g, 0, 'Spell Striker') && inZ(g, 0, 'ban', 'Pot of Greed'), 'summoned, Pot banished');
  bp(g); ok(canAtk(g, on(g, 0, 'Spell Striker'), null), 'can attack directly'); atkOn(g, 0, 'Spell Striker', null);
  ok(lp(g, 1) === 7400, `600 direct (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Spell Striker'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g2); atkOn(g2, 0, 'Spell Striker', 'Blue-Eyes White Dragon');
  ok(lp(g2, 0) === 8000, `no battle damage to A (${lp(g2, 0)})`);
});
T('Spell Vanishing: negates, sends same-name Spells from hand and Deck', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Pot of Greed'], deckTop: [FILL, FILL, 'Pot of Greed'], turn: 2 }, { hand: [FILL, FILL], st: ['Spell Vanishing'] }] });
  act(g, 0, 'Pot of Greed'); settle(g, 'Spell Vanishing');
  ok(cnt(g, 0, 'gy', 'Pot of Greed') === 3 && !inZ(g, 0, 'hand', 'Pot of Greed') && !g.p[0].deck.some(c => E.name(c) === 'Pot of Greed'), `all Pots in the GY (${cnt(g, 0, 'gy', 'Pot of Greed')})`);
  ok(hand(g, 1) === 0, 'B discarded 2');
});
T('Spell-Stopping Statute: negates a Continuous Spell', () => {
  const g = duel({ board: [{ hand: ['Spell Absorption', 'Pot of Greed'], turn: 2 }, { st: ['Spell-Stopping Statute'] }] });
  ok(true, ''); act(g, 0, 'Pot of Greed'); settle(g);
  ok(inZ(g, 1, 'st', 'Spell-Stopping Statute'), 'not used on a Normal Spell');
  act(g, 0, 'Spell Absorption'); settle(g, 'Spell-Stopping');
  ok(inZ(g, 0, 'gy', 'Spell Absorption'), 'Spell Absorption negated and destroyed');
});

/* ---------------- Spirit ... ---------------- */
T('Spirit Barrier: no battle damage while you control a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon', 'Blue-Eyes White Dragon'], turn: 2 }, { st: [{ n: 'Spirit Barrier', pos: 'up' }], m: ['Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Mystical Elf');
  ok(inZ(g, 1, 'gy', 'Mystical Elf') && lp(g, 1) === 8000, `Elf destroyed, no damage (${lp(g, 1)})`);
  choose(g, `atk:${g.p[0].m.find(c => c && !c.attacks).u}:d`); settle(g);
  ok(lp(g, 1) === 5000, `direct attack with no monster does 3000 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { st: [{ n: 'Spirit Barrier', pos: 'up' }], m: [{ n: 'Mystical Elf', pos: 'atk' }] }] });
  bp(g2); atkOn(g2, 0, 'Blue-Eyes White Dragon', 'Mystical Elf');
  ok(lp(g2, 1) === 8000, `Attack Position Elf destroyed, still no damage (${lp(g2, 1)})`);
});
T('Spirit Burner: change the equipped monster to Defense once per turn', () => {
  const g = duel({ board: [{ hand: ['Spirit Burner'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Spirit Burner'); settle(g, FILL);
  const w = on(g, 0, FILL); ok(g.p[0].st.some(c => c && E.name(c) === 'Spirit Burner'), 'equipped');
  ok(canAct(g, 0, 'Spirit Burner'), 'Defense change offered'); act(g, 0, 'Spirit Burner'); settle(g);
  ok(w.pos === 'def', 'Warwolf in Defense Position');
});
T('Spirit Caller: FLIP revives a Level 3 or lower Normal Monster', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Spirit Caller', pos: 'set' }], gy: ['Baby Dragon', 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g, 'Baby Dragon', 'Attack');
  ok(on(g, 0, 'Baby Dragon') && inZ(g, 0, 'gy', 'Blue-Eyes White Dragon'), 'Baby Dragon Special Summoned');
});
T('Spirit Elimination: a GY banish cost comes from the field instead', () => {
  const g = duel({ board: [{ hand: ['Spirit Elimination', 'Spirit of Flames'], m: ['Fireyarou'], gy: ['Blazing Inpachi'], turn: 2 }, {}] });
  act(g, 0, 'Spirit Elimination'); settle(g);
  const s = card(g, 0, 'Spirit of Flames'); ok(hasOpt(g, 'sp:' + s.u), 'Spirit of Flames offered'); choose(g, 'sp:' + s.u); settle(g, 'Fireyarou', 'Attack');
  ok(on(g, 0, 'Spirit of Flames') && inZ(g, 0, 'ban', 'Fireyarou') && inZ(g, 0, 'gy', 'Blazing Inpachi'), 'Fireyarou banished from the field, Inpachi stays in the GY');
});
T('Spirit Force: no battle damage, add a Warrior Tuner', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { st: ['Spirit Force'], m: ['Mystical Elf'], gy: ['Junk Synchron'] }] });
  g.p[1].m[0].pos = 'atk';
  bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Mystical Elf', 'Spirit Force', 'Junk Synchron');
  ok(lp(g, 1) === 8000, `no damage (${lp(g, 1)})`);
  ok(inZ(g, 1, 'hand', 'Junk Synchron'), 'Junk Synchron added');
});
for (const L of ['A', 'I', 'L', 'N']) T(`Spirit Message ${L}: cannot be activated from the hand`, () => {
  const g = duel({ board: [{ hand: ['Spirit Message ' + L], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Spirit Message ' + L), 'not activatable');
});
// Destiny Board placing them: documented ENGINE gap in the script (full-06.js looks for the Goat names).
T('Spirit of Flames: no Normal Summon, banish FIRE to summon, +300 in your Battle Phase', () => {
  const g = duel({ board: [{ hand: ['Spirit of Flames'], gy: ['Blazing Inpachi'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'atk' }] }] });
  const s = card(g, 0, 'Spirit of Flames');
  ok(!hasOpt(g, 'ns:' + s.u) && !hasOpt(g, 'set:' + s.u), 'no Normal Summon or Set');
  choose(g, 'sp:' + s.u); settle(g, 'Blazing Inpachi', 'Attack');
  const f = on(g, 0, 'Spirit of Flames');
  ok(f && inZ(g, 0, 'ban', 'Blazing Inpachi') && E.atk(g, f) === 1700, `summoned, 1700 in Main Phase (${f && E.atk(g, f)})`);
  bp(g); ok(E.atk(g, f) === 2000, `2000 in the Battle Phase (${E.atk(g, f)})`);
  const g2 = duel({ board: [{ hand: ['Spirit of Flames'], gy: ['Mystical Elf'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Spirit of Flames').u), 'no summon without a FIRE monster in the GY');
});
T('Spirit of the Breeze: 1000 LP each Standby Phase in Attack Position', () => {
  const g = duel({ board: [{ hand: [], m: ['Spirit of the Breeze'], turn: 2 }, {}] });
  endTurn(g); endTurn(g);
  ok(lp(g, 0) === 10000, `gained 1000 in each of A's 2 Standby Phases (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], m: [{ n: 'Spirit of the Breeze', pos: 'def' }], turn: 2 }, {}] });
  endTurn(g2); endTurn(g2);
  ok(lp(g2, 0) === 8000, `not in Defense Position (${lp(g2, 0)})`);
});
T('Spirit of the Pharaoh: only by The First Sarcophagus, revives Zombies', () => {
  const g = duel({ board: [{ hand: ['Spirit of the Pharaoh', 'Monster Reborn'], gy: ['Spirit of the Pharaoh'], turn: 2 }, {}] });
  const s = g.p[0].hand.find(c => E.name(c) === 'Spirit of the Pharaoh');
  ok(noSummon(g, s), 'no Normal Summon or Set');
  ok(!canAct(g, 0, 'Monster Reborn'), 'Monster Reborn has no legal target (Pharaoh in the GY)');
  const g2 = duel({ board: [{ hand: [], st: ['The First Sarcophagus'], deckTop: [FILL, FILL, 'The Second Sarcophagus', 'The Third Sarcophagus', 'Spirit of the Pharaoh'], gy: ['Skull Servant', 'Clown Zombie', 'Pharaoh\'s Servant', 'Armored Zombie'], turn: 2 }, {}] });
  act(g2, 0, 'The First Sarcophagus'); settle(g2);
  for (let i = 0; i < 4 && !on(g2, 0, 'Spirit of the Pharaoh'); i++) endTurn(g2, 'Spirit of the Pharaoh', 'Skull Servant', 'Clown Zombie', "Pharaoh's Servant", 'Attack');
  settle(g2, 'Skull Servant', 'Clown Zombie', "Pharaoh's Servant");
  ok(on(g2, 0, 'Spirit of the Pharaoh'), 'Pharaoh Special Summoned by the Sarcophagi');
  ok(on(g2, 0, 'Skull Servant') && on(g2, 0, 'Clown Zombie') && !on(g2, 0, 'Armored Zombie'), `Level 2 or lower Zombies revived (m ${cnt(g2, 0, 'm')})`);
});
T('Spirit of the Pot of Greed: Pot of Greed draws 1 more', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Spirit of the Pot of Greed'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Pot of Greed'); settle(g);
  ok(hand(g, 0) === h - 1 + 3, `drew 3 (hand ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Pot of Greed'], m: [{ n: 'Spirit of the Pot of Greed', pos: 'def' }], turn: 2 }, {}] });
  const h2 = hand(g2, 0); act(g2, 0, 'Pot of Greed'); settle(g2);
  ok(hand(g2, 0) === h2 + 1, `only 2 in Defense Position (hand ${hand(g2, 0)})`);
});
T('Spirit of the Six Samurai: equips for +500/+500, draws on a kill, unequips', () => {
  const g = duel({ board: [{ hand: [], m: ['Spirit of the Six Samurai', 'The Six Samurai - Zanji'], turn: 2 }, { m: [FILL] }] });
  ok(canAct(g, 0, 'Spirit of the Six Samurai'), 'equip offered'); act(g, 0, 'Spirit of the Six Samurai'); settle(g, 'Zanji');
  const z = on(g, 0, 'The Six Samurai - Zanji');
  ok(inZ(g, 0, 'st', 'Spirit of the Six Samurai') && E.atk(g, z) === 2300 && E.def(g, z) === 1800, `Zanji 2300/1800 (${E.atk(g, z)}/${E.def(g, z)})`);
  const h = hand(g, 0); bp(g); atkOn(g, 0, 'The Six Samurai - Zanji', FILL);
  ok(inZ(g, 1, 'gy', FILL) && hand(g, 0) === h + 1, `Warwolf destroyed, drew 1 (hand ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Spirit of the Six Samurai', 'The Six Samurai - Zanji'], turn: 2 }, {}] });
  act(g2, 0, 'Spirit of the Six Samurai'); settle(g2, 'Zanji');
  endTurn(g2); endTurn(g2);
  ok(canAct(g2, 0, 'Spirit of the Six Samurai'), 'unequip offered next turn'); act(g2, 0, 'Spirit of the Six Samurai'); settle(g2, 'Attack');
  const sp = on(g2, 0, 'Spirit of the Six Samurai'); ok(sp && sp.pos === 'atk', 'Spirit Special Summoned in Attack Position');
  const g3 = duel({ board: [{ hand: [], m: ['Spirit of the Six Samurai', FILL], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'Spirit of the Six Samurai'), 'no equip without a Six Samurai');
});
T('Spirit Ryu: discard a Dragon in battle for +1000/+1000', () => {
  const g = duel({ board: [{ hand: ['Luster Dragon'], m: ['Spirit Ryu'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'atk' }] }] });
  bp(g); atkOn(g, 0, 'Spirit Ryu', 'Mystical Elf', 'Spirit Ryu', 'Luster Dragon');
  ok(inZ(g, 0, 'gy', 'Luster Dragon') && inZ(g, 1, 'gy', 'Mystical Elf') && lp(g, 1) === 8000 - 1200, `Elf destroyed, 1200 damage (${lp(g, 1)})`);
  const r = on(g, 0, 'Spirit Ryu'); ok(r && E.atk(g, r) === 2000, `2000 ATK during the Battle Phase (${r && E.atk(g, r)})`);
  choose(g, 'endbp'); settle(g); ok(E.atk(g, r) === 1000, `back to 1000 after the Battle Phase (${E.atk(g, r)})`);
});
T('Spiritual Energy Settle Machine: Spirits stay, discard or destroy', () => {
  const g = duel({ board: [{ hand: ['Asura Priest', FILL], st: [{ n: 'Spiritual Energy Settle Machine', pos: 'up' }], turn: 2 }, {}] });
  ns(g, 0, 'Asura Priest'); endTurn(g, FILL);
  ok(on(g, 0, 'Asura Priest'), 'Asura Priest stays on the field');
  ok(inZ(g, 0, 'st', 'Spiritual Energy Settle Machine') && inZ(g, 0, 'gy', FILL), 'discarded 1, Machine stays');
  const g2 = duel({ board: [{ hand: ['Asura Priest'], st: [{ n: 'Spiritual Energy Settle Machine', pos: 'up' }], turn: 2 }, {}] });
  ns(g2, 0, 'Asura Priest'); g2.p[0].hand.splice(0); endTurn(g2);
  ok(inZ(g2, 0, 'gy', 'Spiritual Energy Settle Machine'), 'destroyed with no card to discard');
});
T('Spiritual Forest: the first Beast destroyed by battle each turn survives', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon', 'Blue-Eyes White Dragon'], turn: 2 }, { st: [{ n: 'Spiritual Forest', pos: 'up' }], m: ['Gazelle the King of Mythical Beasts'] }] });
  bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Gazelle the King of Mythical Beasts');
  ok(on(g, 1, 'Gazelle the King of Mythical Beasts'), 'Gazelle survives the first battle');
  ok(lp(g, 1) === 8000 - 1500, `B still takes damage (${lp(g, 1)})`);
  const b2 = g.p[0].m.find(c => c && E.name(c) === 'Blue-Eyes White Dragon' && !c.attacks);
  choose(g, `atk:${b2.u}:${on(g, 1, 'Gazelle the King of Mythical Beasts').u}`); settle(g);
  ok(inZ(g, 1, 'gy', 'Gazelle the King of Mythical Beasts'), 'the second time it is destroyed');
});

/* ---------------- Super ... ---------------- */
T('Super Conductor Tyranno: Tribute 1 for 1000 damage, then no attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Super Conductor Tyranno', FILL], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Super Conductor Tyranno'), 'offered'); act(g, 0, 'Super Conductor Tyranno'); settle(g, FILL);
  ok(lp(g, 1) === 7000 && inZ(g, 0, 'gy', FILL), `1000 damage, Warwolf Tributed (${lp(g, 1)})`);
  bp(g); ok(!canAtk(g, on(g, 0, 'Super Conductor Tyranno'), null), 'Tyranno cannot attack this turn');
});
T('Super Double Summon: Gemini Summon a Gemini, back to the hand in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Super Double Summon'], m: ['Elemental HERO Neos Alius'], turn: 2 }, {}] });
  act(g, 0, 'Super Double Summon'); settle(g, 'Neos Alius');
  const n = on(g, 0, 'Elemental HERO Neos Alius'); ok(n && n.flags.gemini, 'Neos Alius is Gemini Summoned');
  endTurn(g);
  ok(inZ(g, 0, 'hand', 'Elemental HERO Neos Alius'), 'returned to the hand');
});
T('Super Junior Confrontation: lowest ATK attacker vs lowest DEF defender, Battle Phase ends', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon', FILL], turn: 2 }, { st: ['Super Junior Confrontation'], m: [{ n: 'Mystical Elf', pos: 'def' }, { n: 'Gazelle the King of Mythical Beasts', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Mystical Elf', 'Super Junior');
  ok(on(g, 1, 'Mystical Elf') && inZ(g, 1, 'gy', 'Gazelle the King of Mythical Beasts'), 'Warwolf destroyed Gazelle, Elf safe');
  ok(!hasOpt(g, 'atk:'), 'Battle Phase over');
});
T('Super Robolady: Fusion, +1000 on a direct hit, swap to Super Roboyarou next turn', () => {
  const g = duel({ ex0: ['Super Robolady', 'Super Roboyarou'], board: [{ hand: ['Polymerization', 'Robolady', 'Roboyarou'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Super Robolady', 'Robolady', 'Roboyarou', 'Attack');
  ok(on(g, 0, 'Super Robolady'), 'Fusion Summoned');
  ok(!canAct(g, 0, 'Super Robolady'), 'no swap the turn it was summoned');
  bp(g); atkOn(g, 0, 'Super Robolady', null);
  ok(lp(g, 1) === 8000 - 2200, `2200 direct (${lp(g, 1)})`);
  endTurn(g); endTurn(g);
  ok(canAct(g, 0, 'Super Robolady'), 'swap offered next turn'); act(g, 0, 'Super Robolady'); settle(g, 'Attack');
  ok(on(g, 0, 'Super Roboyarou') && inZ(g, 0, 'extra', 'Super Robolady'), 'Super Roboyarou on the field');
});
T('Super Roboyarou: +1000 when it battles a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Super Roboyarou'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'atk' }] }] });
  bp(g); atkOn(g, 0, 'Super Roboyarou', 'Mystical Elf');
  ok(lp(g, 1) === 8000 - 1400 && inZ(g, 1, 'gy', 'Mystical Elf'), `2200 vs 800, 1400 damage (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Super Roboyarou'], turn: 2 }, {}] });
  bp(g2); atkOn(g2, 0, 'Super Roboyarou', null); ok(lp(g2, 1) === 6800, `1200 direct (${lp(g2, 1)})`);
});
T('Super Solar Nutrient: Tribute a Level 2 Plant, summon a Level 5 or lower Plant, linked', () => {
  const g = duel({ board: [{ hand: ['Super Solar Nutrient'], m: ['Man Eater'], deckTop: [FILL, 'Botanical Lion'], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Super Solar Nutrient'); settle(g, 'Man Eater', 'Botanical Lion');
  ok(on(g, 0, 'Botanical Lion') && inZ(g, 0, 'gy', 'Man Eater') && inZ(g, 0, 'st', 'Super Solar Nutrient'), 'Botanical Lion summoned');
  endTurn(g); act(g, 1, 'Mystical Space Typhoon'); settle(g, 'Super Solar Nutrient');
  ok(inZ(g, 0, 'gy', 'Botanical Lion'), 'Lion destroyed when Nutrient left');
});
T('Super Vehicroid Jumbo Drill: Fusion with its 3 materials, piercing', () => {
  const g = duel({ ex0: ['Super Vehicroid Jumbo Drill'], board: [{ hand: ['Polymerization', 'Steamroid', 'Drillroid', 'Submarineroid'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }] }] });
  act(g, 0, 'Polymerization'); settle(g, 'Jumbo Drill', 'Steamroid', 'Drillroid', 'Submarineroid', 'Attack');
  ok(on(g, 0, 'Super Vehicroid Jumbo Drill'), 'Fusion Summoned');
  bp(g); atkOn(g, 0, 'Super Vehicroid Jumbo Drill', 'Mystical Elf');
  ok(lp(g, 1) === 7000, `1000 piercing (${lp(g, 1)})`);
});
T('Super War-Lion: a Ritual Monster, no Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Super War-Lion'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g, card(g, 0, 'Super War-Lion')), 'no Normal Summon or Set');
});
T('Super-Ancient Dinobeast: 1 Dinosaur Tribute, draw when a Dinosaur is revived', () => {
  const g = duel({ board: [{ hand: ['Super-Ancient Dinobeast', 'Monster Reborn'], m: ['Babycerasaurus'], gy: ['Gilasaurus'], turn: 2 }, {}] });
  ns(g, 0, 'Super-Ancient Dinobeast', 'Babycerasaurus', 'Attack');
  ok(on(g, 0, 'Super-Ancient Dinobeast') && inZ(g, 0, 'gy', 'Babycerasaurus'), 'Tribute Summoned with 1 Dinosaur');
  const h = hand(g, 0); act(g, 0, 'Monster Reborn'); settle(g, 'Gilasaurus');
  ok(on(g, 0, 'Gilasaurus') && hand(g, 0) === h - 1 + 1, `drew 1 (hand ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Super-Ancient Dinobeast'], m: [FILL], turn: 2 }, {}] });
  const d2 = card(g2, 0, 'Super-Ancient Dinobeast'); ok(!hasOpt(g2, 'ns:' + d2.u), 'no 1-Tribute Summon with a non-Dinosaur');
});
T('Super-Electromagnetic Voltech Dragon: Batteryman AA Tribute gives +1000', () => {
  const g = duel({ board: [{ hand: ['Super-Electromagnetic Voltech Dragon'], m: ['Batteryman AA'], turn: 2 }, {}] });
  ns(g, 0, 'Super-Electromagnetic Voltech Dragon', 'Batteryman AA', 'Attack');
  const v = on(g, 0, 'Super-Electromagnetic Voltech Dragon'); ok(v && E.atk(g, v) === 3400, `3400 ATK (${v && E.atk(g, v)})`);
  const g2 = duel({ board: [{ hand: ['Super-Electromagnetic Voltech Dragon'], m: [FILL], turn: 2 }, {}] });
  ns(g2, 0, 'Super-Electromagnetic Voltech Dragon', FILL, 'Attack');
  const v2 = on(g2, 0, 'Super-Electromagnetic Voltech Dragon'); ok(v2 && E.atk(g2, v2) === 2400, `2400 with another Tribute (${v2 && E.atk(g2, v2)})`);
});

/* ---------------- Sword ... ---------------- */
T('Sword Hunter: equips the monsters it destroyed, +200 each', () => {
  const g = duel({ board: [{ hand: [], m: ['Sword Hunter'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'atk' }] }] });
  bp(g); atkOn(g, 0, 'Sword Hunter', 'Mystical Elf'); choose(g, 'endbp'); settle(g);
  const h = on(g, 0, 'Sword Hunter');
  ok(g.p[0].st.some(c => c && E.name(c) === 'Mystical Elf') && E.atk(g, h) === 2650, `Elf equipped, 2650 ATK (${E.atk(g, h)})`);
});
T('Sword Master: Special Summon when the Warrior attack does not destroy; piercing', () => {
  const g = duel({ board: [{ hand: ['Sword Master'], m: ['X-Saber Anu Piranha'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'X-Saber Anu Piranha', 'Mystical Elf', 'Sword Master', 'Attack');
  ok(on(g, 0, 'Sword Master'), 'Sword Master Special Summoned');
  const g2 = duel({ board: [{ hand: [], m: ['Sword Master'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g2); atkOn(g2, 0, 'Sword Master', FILL); ok(lp(g2, 1) === 6900, `1100 piercing (${lp(g2, 1)})`);
});
T('Sword of Dark Destruction: DARK only, +400/-200', () => {
  const g = duel({ board: [{ hand: ['Sword of Dark Destruction'], m: ['Koumori Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Sword of Dark Destruction'); settle(g, 'Koumori');
  const k = on(g, 0, 'Koumori Dragon'); ok(E.atk(g, k) === 1900 && E.def(g, k) === 1000, `1900/1000 (${E.atk(g, k)}/${E.def(g, k)})`);
  const g2 = duel({ board: [{ hand: ['Sword of Dark Destruction'], m: [FILL], turn: 2 }, { m: [FILL] }] });
  ok(!canAct(g2, 0, 'Sword of Dark Destruction'), 'no DARK monster, no activation');
});
T('Sword of Dark Rites: DARK +400, back to the hand when the monster is Tributed', () => {
  const g = duel({ board: [{ hand: ['Sword of Dark Rites', 'Ancient Gear Engineer'], m: ['Koumori Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Sword of Dark Rites'); settle(g, 'Koumori');
  ok(E.atk(g, on(g, 0, 'Koumori Dragon')) === 1900, '1900 ATK');
  ns(g, 0, 'Ancient Gear Engineer', 'Koumori', 'Attack'); settle(g);
  ok(inZ(g, 0, 'hand', 'Sword of Dark Rites'), 'Sword back in the hand');
});
T('Sword of Deep-Seated: +500/+500, goes to the top of the Deck from the GY', () => {
  const g = duel({ board: [{ hand: ['Sword of Deep-Seated'], m: [FILL], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Sword of Deep-Seated'); settle(g, FILL);
  const w = on(g, 0, FILL); ok(E.atk(g, w) === 2500 && E.def(g, w) === 600, `2500/600 (${E.atk(g, w)}/${E.def(g, w)})`);
  endTurn(g); act(g, 1, 'Mystical Space Typhoon'); settle(g, 'Sword of Deep-Seated');
  ok(deckTopName(g, 0) === 'Sword of Deep-Seated', 'on top of the Deck');
});
T("Sword of Dragon's Soul: Warrior +700, a battled Dragon is destroyed at the end of the Battle Phase", () => {
  const g = duel({ board: [{ hand: ["Sword of Dragon's Soul"], m: ['X-Saber Anu Piranha'], turn: 2 }, { m: [{ n: 'Blue-Eyes White Dragon', pos: 'def' }] }] });
  act(g, 0, "Sword of Dragon's Soul"); settle(g, 'Anu Piranha');
  ok(E.atk(g, on(g, 0, 'X-Saber Anu Piranha')) === 2500, '2500 ATK');
  bp(g); atkOn(g, 0, 'X-Saber Anu Piranha', 'Blue-Eyes White Dragon');
  ok(on(g, 1, 'Blue-Eyes White Dragon'), 'Blue-Eyes survives the battle');
  choose(g, 'endbp'); settle(g);
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'destroyed at the end of the Battle Phase');
  const g2 = duel({ board: [{ hand: ["Sword of Dragon's Soul"], m: ['Koumori Dragon'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, "Sword of Dragon's Soul"), 'no Warrior, no activation');
});
T('Sword of Kusanagi: Spirit only, piercing', () => {
  const g = duel({ board: [{ hand: ['Sword of Kusanagi'], m: ['Asura Priest'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  act(g, 0, 'Sword of Kusanagi'); settle(g, 'Asura');
  bp(g); atkOn(g, 0, 'Asura Priest', FILL); ok(lp(g, 1) === 6400, `1600 piercing (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Sword of Kusanagi'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Sword of Kusanagi'), 'no Spirit, no activation');
});
T('Sword of Sparkles: X-Saber kill destroys 1 opponent card', () => {
  const g = duel({ board: [{ hand: ['Sword of Sparkles'], m: ['X-Saber Anu Piranha'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'atk' }], st: ['Dark Hole'] }] });
  act(g, 0, 'Sword of Sparkles'); settle(g, 'Anu Piranha');
  bp(g); atkOn(g, 0, 'X-Saber Anu Piranha', 'Mystical Elf', 'Sword of Sparkles', 'Dark Hole');
  ok(inZ(g, 1, 'gy', 'Mystical Elf') && inZ(g, 1, 'gy', 'Dark Hole'), 'Elf and Dark Hole destroyed');
  const g2 = duel({ board: [{ hand: ['Sword of Sparkles'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Sword of Sparkles'), 'no X-Saber, no activation');
});
T('Sword of the Soul-Eater: Tribute the other Normal Monsters, +1000 each', () => {
  const g = duel({ board: [{ hand: ['Sword of the Soul-Eater'], m: ['Baby Dragon', 'Luster Dragon', 'X-Saber Anu Piranha', 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Sword of the Soul-Eater'); settle(g, 'Baby Dragon');
  const b = on(g, 0, 'Baby Dragon');
  ok(b && E.atk(g, b) === 3200 && inZ(g, 0, 'gy', 'Luster Dragon') && inZ(g, 0, 'gy', 'X-Saber Anu Piranha') && on(g, 0, 'Sangan'), `3200 ATK, 2 Normals Tributed, Sangan stays (${b && E.atk(g, b)})`);
});
T('Spirit Burner: 600 damage when the equipped monster returns to the hand', () => {
  const g = duel({ board: [{ hand: ['Asura Priest', 'Spirit Burner'], turn: 2 }, {}] });
  ns(g, 0, 'Asura Priest'); act(g, 0, 'Spirit Burner'); settle(g, 'Asura');
  endTurn(g);
  ok(inZ(g, 0, 'hand', 'Asura Priest') && inZ(g, 0, 'gy', 'Spirit Burner') && lp(g, 1) === 7400, `Asura back in hand, 600 damage (${lp(g, 1)})`);
});

// Goat: quick checks of shared 'both' cards with the Goat card pool
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
  G('Spell Absorption, Spell Canceller, Spell Reproduction', () => {
    let g = gduel([{ hand: ['Pot of Greed'], st: [{ n: 'Spell Absorption', pos: 'up' }], turn: 2 }, {}]);
    act(g, 0, 'Pot of Greed'); settle(g); ok(lp(g, 0) === 8500, `Goat: Absorption +500 (${lp(g, 0)})`);
    g = gduel([{ hand: ['Pot of Greed'], turn: 2 }, { m: ['Spell Canceller'] }]);
    ok(!canAct(g, 0, 'Pot of Greed'), 'Goat: Canceller stops Pot');
    g = gduel([{ hand: ['Spell Reproduction', 'Dark Hole', 'Raigeki'], gy: ['Pot of Greed'], turn: 2 }, {}]);
    act(g, 0, 'Spell Reproduction'); settle(g, 'Pot of Greed', 'Dark Hole', 'Raigeki'); ok(inZ(g, 0, 'hand', 'Pot of Greed'), 'Goat: Reproduction adds Pot');
  });
  G('Spirit Barrier, Spirit of Flames, Spirit of the Pot of Greed', () => {
    let g = gduel([{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { st: [{ n: 'Spirit Barrier', pos: 'up' }], m: [{ n: 'Mystical Elf', pos: 'atk' }] }]);
    bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Mystical Elf'); ok(lp(g, 1) === 8000, `Goat: Barrier no damage (${lp(g, 1)})`);
    g = gduel([{ hand: ['Pot of Greed'], m: ['Spirit of the Pot of Greed'], turn: 2 }, {}]);
    const h = hand(g, 0); act(g, 0, 'Pot of Greed'); settle(g); ok(hand(g, 0) === h + 2, `Goat: Spirit of the Pot draws 3 (${hand(g, 0)})`);
  });
  G('Sword of Dark Destruction, Sword of the Soul-Eater, Sword Hunter', () => {
    let g = gduel([{ hand: ['Sword of Dark Destruction'], m: ['Koumori Dragon'], turn: 2 }, {}]);
    act(g, 0, 'Sword of Dark Destruction'); settle(g, 'Koumori'); ok(E.atk(g, on(g, 0, 'Koumori Dragon')) === 1900, 'Goat: Koumori 1900');
    g = gduel([{ hand: ['Sword of the Soul-Eater'], m: ['Baby Dragon', 'Luster Dragon'], turn: 2 }, {}]);
    act(g, 0, 'Sword of the Soul-Eater'); settle(g, 'Baby Dragon'); ok(E.atk(g, on(g, 0, 'Baby Dragon')) === 2200, 'Goat: Soul-Eater 2200');
    g = gduel([{ hand: [], m: ['Sword Hunter'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'atk' }] }]);
    bp(g); atkOn(g, 0, 'Sword Hunter', 'Mystical Elf'); choose(g, 'endbp'); settle(g);
    ok(E.atk(g, on(g, 0, 'Sword Hunter')) === 2650, 'Goat: Sword Hunter 2650');
  });
}
console.log(fails ? `\n${fails} failed` : '\nAll full-15 review checks passed.');
process.exit(fails ? 1 : 0);
