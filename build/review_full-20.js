// Independent review checks for full pool batch 20 (written from the card text): node build/review_full-20.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior Level 4 2000/100
let lastG; function duel(o = {}) {
  const mk = (ex, n) => ({ name: 't', main: Array(n || 40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0, o.n0), mk(o.ex1, o.n1)], first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
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
const optsFor = (g, c) => g.prompt ? g.prompt.opts.filter(x => x.u === c.u || x.key.split(':')[1] === String(c.u)) : [];
const hand = (g, p) => g.p[p].hand.length;
const W = FILL, CG = 'Celtic Guardian', ELF = 'Mystical Elf';
const set = n => ({ n, pos: 'set' }), dpos = n => ({ n, pos: 'def' });
const raceOf = c => E.lib.race(c);

T('Change of Heart: take control until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Change of Heart'); settle(g, W);
  ok(on(g, 0, W) && !on(g, 1, W), 'Warwolf now on A side');
  endTurn(g); ok(on(g, 1, W) && !on(g, 0, W), 'Warwolf back to B at the End Phase');
});
T('Chaosrider Gustaph: banish 2 Spells, +600, once per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Chaosrider Gustaph'], gy: ['Pot of Greed', 'Dark Hole', W], turn: 2 }, {}] });
  const c = on(g, 0, 'Chaosrider Gustaph');
  ok(optsFor(g, c).length > 0, 'effect offered'); E.act(g, [optsFor(g, c).filter(x => x.key.startsWith('a:'))[0].key]); settle(g, 'Pot of Greed', 'Dark Hole');
  ok(E.atk(g, c) === 2000 && cnt(g, 0, 'ban') === 2, `ATK ${E.atk(g, c)}, ${cnt(g, 0, 'ban')} banished`);
  ok(optsFor(g, c).filter(x => x.key.startsWith('a:')).length === 0, 'not again this turn');
  endTurn(g); ok(E.atk(g, c) === 2000, 'still 2000 on the opponent turn');
  endTurn(g); ok(E.atk(g, c) === 1400, `back to 1400 on own next turn (${E.atk(g, c)})`);
});
T('Charm of Shabti: Gravekeeper survives battle', () => {
  const g = duel({ board: [{ hand: ['Charm of Shabti'], m: ["Gravekeeper's Guard"], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, "Gravekeeper's Guard", W, 'Charm of Shabti');
  toIdle(g);
  ok(on(g, 0, "Gravekeeper's Guard") && inZ(g, 0, 'gy', 'Charm of Shabti'), 'Guard survives, Charm discarded');
  ok(lp(g, 0) === 7000, `A took 1000 (${lp(g, 0)})`);
});
T('Charubin the Fire Knight: Fusion Summon', () => {
  const g = duel({ ex0: ['Charubin the Fire Knight'], board: [{ hand: ['Polymerization', 'Monster Egg', 'Hinotama Soul'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Charubin', 'atk', 'Attack');
  ok(on(g, 0, 'Charubin the Fire Knight') && inZ(g, 0, 'gy', 'Monster Egg') && inZ(g, 0, 'gy', 'Hinotama Soul'), 'Charubin summoned');
});
T('Checkmate: Terrorking attacks directly', () => {
  const g = duel({ board: [{ hand: ['Checkmate'], m: ['Terrorking Archfiend', 'Archfiend Soldier'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Checkmate'); settle(g, 'Archfiend Soldier', 'Terrorking Archfiend');
  ok(inZ(g, 0, 'gy', 'Archfiend Soldier'), 'Archfiend Soldier tributed');
  bp(g); const t = on(g, 0, 'Terrorking Archfiend');
  ok(canAtk(g, t, null), 'direct attack offered'); atkOn(g, 0, 'Terrorking Archfiend', null);
  ok(lp(g, 1) === 6000, `B at 6000 (${lp(g, 1)})`);
});
T('Chiron the Mage: discard a Spell, destroy a Spell/Trap, once per turn', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Dark Hole'], m: ['Chiron the Mage'], turn: 2 }, { st: ['Mirror Force', 'Trap Hole'] }] });
  const c = on(g, 0, 'Chiron the Mage'); E.act(g, [optsFor(g, c).filter(x => x.key.startsWith('a:'))[0].key]); settle(g, 'Pot of Greed', 'Mirror Force');
  ok(inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'st', 'Trap Hole'), 'Pot discarded, Mirror Force destroyed');
  ok(optsFor(g, c).filter(x => x.key.startsWith('a:')).length === 0, 'not again this turn');
});
T('Chopman: Flip Summon equips an Equip Spell from the GY', () => {
  const g = duel({ board: [{ hand: [], m: [set('Chopman the Desperate Outlaw')], gy: ['Black Pendant'], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g, 'Black Pendant');
  const c = on(g, 0, 'Chopman the Desperate Outlaw');
  ok(inZ(g, 0, 'st', 'Black Pendant') && E.atk(g, c) === 1600, `Pendant equipped, ATK ${E.atk(g, c)}`);
});
T('Chorus of Sanctuary: Defense Position monsters +500 DEF', () => {
  const g = duel({ board: [{ hand: ['Chorus of Sanctuary'], m: [dpos(CG), W], turn: 2 }, { m: [dpos(ELF)] }] });
  act(g, 0, 'Chorus of Sanctuary'); settle(g);
  ok(E.def(g, on(g, 0, CG)) === 1700 && E.def(g, on(g, 1, ELF)) === 2500 && E.def(g, on(g, 0, W)) === 100, 'DEF 1700 / 2500, attack position unchanged');
});
T('Chosen One: one monster and two non-monsters, random pick', () => {
  let sawMon = false, sawNon = false;
  for (let s = 1; s <= 8; s++) {
    const g = duel({ seed: s, board: [{ hand: ['Chosen One', CG, 'Pot of Greed', 'Dark Hole'], turn: 2 }, {}] });
    act(g, 0, 'Chosen One'); settle(g, CG, 'Pot of Greed', 'Dark Hole');
    const m = on(g, 0, CG);
    if (m) { sawMon = true; ok(inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 0, 'gy', 'Dark Hole'), 'monster summoned, other two to GY'); }
    else { sawNon = true; ok(inZ(g, 0, 'gy', CG) && inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 0, 'gy', 'Dark Hole'), 'non-monster picked: all three to GY'); }
  }
  ok(sawMon && sawNon, 'both outcomes seen over seeds');
});
T('Coach Goblin: return a Normal Monster at the End Phase to draw 1', () => {
  const g = duel({ board: [{ hand: [CG], m: ['Coach Goblin'], turn: 2 }, {}] });
  const h = hand(g, 0); endTurn(g, CG);
  ok(!inZ(g, 0, 'hand', CG) && E.name(g.p[0].deck[0]) === CG && hand(g, 0) === h, `Celtic at Deck bottom, hand ${hand(g, 0)}`);
});
T('Cobra Jar: token on flip, 500 to opponent when the token dies in battle', () => {
  const g = duel({ board: [{ hand: [], m: [set('Cobra Jar')], turn: 2 }, { m: [W] }] });
  choose(g, 'flip:'); settle(g);
  const t = on(g, 0, 'Poisonous Snake Token');
  ok(t && E.atk(g, t) === 1200, 'Poisonous Snake Token 1200');
  bp(g); atkOn(g, 0, 'Poisonous Snake Token', W); toIdle(g);
  ok(!on(g, 0, 'Poisonous Snake Token') && lp(g, 1) === 7500 && lp(g, 0) === 7200, `B 7500, A 7200 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Cobraman Sakuzy: flip itself face-down once per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Cobraman Sakuzy'], turn: 2 }, { st: ['Mirror Force'] }] });
  const c = on(g, 0, 'Cobraman Sakuzy'); const o = optsFor(g, c).filter(x => x.key.startsWith('a:'));
  ok(o.length > 0, 'flip face-down offered'); E.act(g, [o[0].key]); settle(g);
  ok(c.pos === 'set', `Sakuzy face-down (${c.pos})`);
  endTurn(g); endTurn(g); choose(g, 'flip:'); settle(g); ok(c.pos === 'atk' && g.p[1].st.some(x => x && x.pos === 'set'), 'flip summoned, Mirror Force stays Set');
});
T('Cockroach Knight: back to top of the Deck from the GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Cockroach Knight'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Cockroach Knight', W); toIdle(g);
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(!inZ(g, 0, 'gy', 'Cockroach Knight') && E.name(top) === 'Cockroach Knight', 'on top of the Deck');
});
T('Coffin Seller: 300 when a monster goes to the opponent GY', () => {
  const g = duel({ board: [{ hand: [], m: [W], st: [up('Coffin Seller')], turn: 2 }, { m: [CG] }] });
  bp(g); atkOn(g, 0, W, CG); toIdle(g);
  ok(lp(g, 1) === 8000 - 600 - 300, `B ${lp(g, 1)}`);
});
T('Collected Power: move Equip Cards to the target', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: [W], st: [null, 'Collected Power'], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'Black Pendant'); settle(g, W);
  ok(E.atk(g, on(g, 0, W)) === 2500, 'Pendant on Warwolf');
  act(g, 0, 'Collected Power'); settle(g, CG);
  ok(E.atk(g, on(g, 1, CG)) === 1900 && E.atk(g, on(g, 0, W)) === 2000, 'Pendant moved to Celtic');
});
T('Combination Attack: unequip the Union and attack again', () => {
  const g = duel({ board: [{ hand: ['Combination Attack'], m: ['X-Head Cannon', 'Y-Dragon Head'], turn: 2 }, {}] });
  const y = on(g, 0, 'Y-Dragon Head'); const o = optsFor(g, y).filter(x => x.key.startsWith('a:'));
  E.act(g, [o[0].key]); settle(g, 'X-Head Cannon');
  ok(inZ(g, 0, 'st', 'Y-Dragon Head'), 'Y equipped');
  bp(g); atkOn(g, 0, 'X-Head Cannon', null);
  const l1 = lp(g, 1);
  ok(canAct(g, 0, 'Combination Attack'), 'Combination Attack offered'); act(g, 0, 'Combination Attack'); settle(g, 'X-Head Cannon', 'Attack');
  ok(on(g, 0, 'Y-Dragon Head'), 'Y back as a monster');
  const x = on(g, 0, 'X-Head Cannon'); ok(canAtk(g, x, null), 'X can attack again');
  atkOn(g, 0, 'X-Head Cannon', null); ok(lp(g, 1) < l1, `second attack hit (${lp(g, 1)})`);
});
const ritualT = (spell, mon) => T(spell + ': Ritual Summon ' + mon, () => {
  const g = duel({ board: [{ hand: [spell, mon, W, CG], turn: 2 }, {}] });
  act(g, 0, spell); settle(g, mon, W, CG);
  ok(on(g, 0, mon), mon + ' Ritual Summoned');
});
ritualT('Commencement Dance', 'Performance of Sword');
ritualT('Turtle Oath', 'Crab Turtle');
ritualT('Revival of Dokurorider', 'Dokurorider');
T("Doriado's Blessing: Ritual Summon with 1 Level 4", () => {
  const g = duel({ board: [{ hand: ["Doriado's Blessing", 'Elemental Mistress Doriado', W], turn: 2 }, {}] });
  act(g, 0, "Doriado's Blessing"); settle(g, 'Elemental Mistress Doriado', W);
  ok(on(g, 0, 'Elemental Mistress Doriado') && inZ(g, 0, 'gy', W), 'Doriado summoned');
});
T('Crab Turtle: no Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Crab Turtle', W, CG], m: [W, W], turn: 2 }, {}] });
  ok(noSummon(g, card(g, 0, 'Crab Turtle')), 'Crab Turtle cannot be Normal Summoned');
});
T('Confiscation: pay 1000, discard 1 card from the opponent hand', () => {
  const g = duel({ board: [{ hand: ['Confiscation'], turn: 2 }, { hand: ['Mirror Force', CG] }] });
  act(g, 0, 'Confiscation'); settle(g, 'Mirror Force');
  ok(lp(g, 0) === 7000 && inZ(g, 1, 'gy', 'Mirror Force') && hand(g, 1) === 1, 'paid 1000, Mirror Force discarded');
});
T('Continuous Destruction Punch: weaker attacker destroyed', () => {
  const g = duel({ board: [{ hand: [], m: [CG], turn: 2 }, { m: [dpos(ELF)], st: [up('Continuous Destruction Punch')] }] });
  bp(g); atkOn(g, 0, CG, ELF); toIdle(g);
  ok(inZ(g, 0, 'gy', CG) && on(g, 1, ELF) && lp(g, 0) === 7400, `Celtic destroyed, A took 600 (${lp(g, 0)})`);
});
T('Convulsion of Nature: can be activated and stays', () => {
  const g = duel({ board: [{ hand: ['Convulsion of Nature'], turn: 2 }, {}] });
  act(g, 0, 'Convulsion of Nature'); settle(g);
  ok(g.p[0].st.some(x => x && E.name(x) === 'Convulsion of Nature' && x.pos === 'up'), 'face-up');
});
T('Cost Down: Jinzo summoned without a Tribute', () => {
  const g = duel({ board: [{ hand: ['Cost Down', 'Jinzo', 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Cost Down'); settle(g, 'Pot of Greed');
  const j = card(g, 0, 'Jinzo'); ok(LV(j) === 4, 'Jinzo Level 4 in hand');
  ns(g, 0, 'Jinzo'); ok(on(g, 0, 'Jinzo') && inZ(g, 0, 'gy', 'Pot of Greed'), 'Jinzo summoned with no Tribute');
});
T('Covering Fire: attacked monster gains the other monster ATK', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: [CG, 'Battle Ox'], st: ['Covering Fire'] }] });
  bp(g); atkOn(g, 0, W, CG, 'Covering Fire', 'Battle Ox'); toIdle(g, 'Battle Ox');
  ok(inZ(g, 0, 'gy', W) && on(g, 1, CG) && lp(g, 0) === 8000 - 1100, `Warwolf lost to 3100 Celtic (A ${lp(g, 0)})`);
  ok(E.atk(g, on(g, 1, CG)) === 1400, 'Celtic back to 1400 after');
});
T('Crass Clown: Defense to Attack returns an opponent monster', () => {
  const g = duel({ board: [{ hand: [], m: [dpos('Crass Clown')], turn: 2 }, { m: [W] }] });
  const c = on(g, 0, 'Crass Clown'); choose(g, 'pos:' + c.u); settle(g, W);
  ok(c.pos === 'atk' && !on(g, 1, W) && inZ(g, 1, 'hand', W), 'Warwolf returned to hand');
});
T('Creeping Doom Manta: no Trap Hole on its Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Creeping Doom Manta'], turn: 2 }, { st: ['Trap Hole'] }] });
  choose(g, 'ns:' + card(g, 0, 'Creeping Doom Manta').u);
  let offered = false; for (let i = 0; i < 10 && g.prompt && !idle(g); i++) { if (g.prompt.p === 1 && hasOpt(g, 'a:' + card(g, 1, 'Trap Hole').u)) offered = true; settle(g); }
  ok(!offered && on(g, 0, 'Creeping Doom Manta'), 'Trap Hole not offered');
  const g2 = duel({ board: [{ hand: [CG], turn: 2 }, { st: ['Trap Hole'] }] });
  choose(g2, 'ns:' + card(g2, 0, CG).u); ok(g2.prompt.p === 1 && hasOpt(g2, 'a:' + card(g2, 1, 'Trap Hole').u), 'control: Trap Hole offered vs Celtic');
});
T('Criosphinx: owner of a returned monster sends 1 card from hand to GY', () => {
  const g = duel({ board: [{ hand: [], m: [dpos('Crass Clown'), 'Criosphinx'], turn: 2 }, { m: [W], hand: ['Pot of Greed'] }] });
  const c = on(g, 0, 'Crass Clown'); choose(g, 'pos:' + c.u); settle(g, W, 'Pot of Greed');
  ok(inZ(g, 1, 'hand', W) !== inZ(g, 1, 'hand', 'Pot of Greed') && hand(g, 1) === 1 && cnt(g, 1, 'gy') === 1, `B hand ${hand(g, 1)}, gy ${cnt(g, 1, 'gy')}`);
});
T('Cross Counter: double reflected damage, attacker destroyed', () => {
  const g = duel({ board: [{ hand: [], m: [CG], turn: 2 }, { m: [dpos(ELF)], st: ['Cross Counter'] }] });
  bp(g); atkOn(g, 0, CG, ELF, 'Cross Counter'); toIdle(g, 'Cross Counter');
  ok(lp(g, 0) === 8000 - 1200 && inZ(g, 0, 'gy', CG), `A took 1200 (${lp(g, 0)}), Celtic destroyed`);
});
T('Cure Mermaid: +800 in own Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Cure Mermaid'], turn: 2 }, {}] });
  toIdle(g); ok(lp(g, 0) === 8800, `A ${lp(g, 0)}`);
});
T('Cursed Seal of the Forbidden Spell: negate, destroy, name locked', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Pot of Greed'], turn: 2 }, { st: ['Cursed Seal of the Forbidden Spell'], hand: ['Dark Hole'] }] });
  const h = hand(g, 0); act(g, 0, 'Pot of Greed'); settle(g, 'Cursed Seal', 'Dark Hole');
  ok(inZ(g, 1, 'gy', 'Dark Hole') && hand(g, 0) === h - 1 && inZ(g, 0, 'gy', 'Pot of Greed'), 'Pot negated, Dark Hole discarded');
  ok(!canAct(g, 0, 'Pot of Greed'), 'second Pot locked');
});
T('Cyclon Laser: only Gradius, +300, pierces', () => {
  const g = duel({ board: [{ hand: ['Cyclon Laser'], m: ['Gradius', CG], turn: 2 }, { m: [set(W)] }] });
  act(g, 0, 'Cyclon Laser');
  ok(!hasOpt(g, CG), 'Celtic not offered'); settle(g, 'Gradius');
  ok(E.atk(g, on(g, 0, 'Gradius')) === 1500, 'Gradius 1500');
  bp(g); atkOn(g, 0, 'Gradius', W); toIdle(g);
  ok(lp(g, 1) === 6600, `1400 piercing (${lp(g, 1)})`);
});
T('D. Tribe: own monsters are Dragon this turn', () => {
  const g = duel({ board: [{ hand: [], m: [W, CG], st: ['D. Tribe'], turn: 2 }, { m: [ELF] }] });
  act(g, 0, 'D. Tribe'); settle(g);
  ok(inZ(g, 0, 'gy', 'D. Tribe'), 'D. Tribe activates (Type change is a documented ENGINE gap)');
});
T('Dancing Fairy: +1000 only in face-up Defense', () => {
  let g = duel({ board: [{ hand: [], m: [dpos('Dancing Fairy')], turn: 2 }, {}] }); toIdle(g);
  ok(lp(g, 0) === 9000, `def: ${lp(g, 0)}`);
  g = duel({ board: [{ hand: [], m: ['Dancing Fairy'], turn: 2 }, {}] }); toIdle(g);
  ok(lp(g, 0) === 8000, `atk: ${lp(g, 0)}`);
});
T('Darkbishop Archfiend: pays 500 each Standby', () => {
  const g = duel({ board: [{ hand: [], m: ['Darkbishop Archfiend'], turn: 2 }, {}] }); toIdle(g);
  ok(lp(g, 0) === 7500, `A ${lp(g, 0)}`);
});
T('Darkbishop Archfiend: die may negate an opponent targeting effect on an Archfiend', () => {
  let neg = 0, res = 0;
  for (let s = 1; s <= 12; s++) {
    const g = duel({ seed: s, first: 1, board: [{ m: ['Darkbishop Archfiend', 'Archfiend Soldier'], turn: 2 }, { hand: ['Book of Moon'] }] });
    toIdle(g); act(g, 1, 'Book of Moon'); settle(g, 'Archfiend Soldier', 'Darkbishop Archfiend'); toIdle(g);
    if (on(g, 0, 'Archfiend Soldier').pos === 'atk') { neg++; ok(inZ(g, 1, 'gy', 'Book of Moon'), 'Book of Moon destroyed'); } else res++;
  }
  ok(neg > 0 && res > 0, `negated ${neg}, resolved ${res} over 12 seeds`);
});
T('Darklord Marie: +200 from the GY in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], gy: ['Darklord Marie'], turn: 2 }, {}] }); toIdle(g);
  ok(lp(g, 0) === 8200, `A ${lp(g, 0)}`);
});
T('Deal of Phantom: +100 per monster in own GY', () => {
  const g = duel({ board: [{ hand: [], m: [W], st: ['Deal of Phantom'], gy: [CG, ELF, 'Battle Ox', 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Deal of Phantom'); settle(g, W);
  ok(E.atk(g, on(g, 0, W)) === 2300, `ATK ${E.atk(g, on(g, 0, W))}`);
});
T('Decayed Commander: summons Zombie Tiger, direct hit discards', () => {
  const g = duel({ board: [{ hand: ['Decayed Commander', 'Zombie Tiger'], turn: 2 }, { hand: ['Pot of Greed', 'Dark Hole'] }] });
  ns(g, 0, 'Decayed Commander');
  ok(on(g, 0, 'Zombie Tiger'), 'Zombie Tiger summoned');
  bp(g); atkOn(g, 0, 'Decayed Commander', null); toIdle(g);
  ok(hand(g, 1) === 1 && cnt(g, 1, 'gy') === 1, `B discarded 1 (${hand(g, 1)})`);
});
T('Dedication through Light and Darkness: DMoC from the Deck', () => {
  const g = duel({ board: [{ hand: ['Dedication through Light and Darkness'], m: ['Dark Magician'], deckTop: ['Dark Magician of Chaos', W], turn: 2 }, {}] });
  act(g, 0, 'Dedication through Light and Darkness'); settle(g, 'Dark Magician', 'Dark Magician of Chaos', 'Attack');
  ok(on(g, 0, 'Dark Magician of Chaos') && inZ(g, 0, 'gy', 'Dark Magician'), 'DMoC summoned, DM tributed');
});
T('Delinquent Duo: pay 1000, opponent discards 2', () => {
  const g = duel({ board: [{ hand: ['Delinquent Duo'], turn: 2 }, { hand: [CG, ELF, 'Pot of Greed'] }] });
  act(g, 0, 'Delinquent Duo'); settle(g);
  ok(lp(g, 0) === 7000 && hand(g, 1) === 1 && cnt(g, 1, 'gy') === 2, `B hand ${hand(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Delinquent Duo'], turn: 2 }, { hand: [CG] }] });
  ok(canAct(g2, 0, 'Delinquent Duo'), 'can activate with 1 card in opponent hand');
});
T('Delta Attacker: 3 same-name Normal Monsters attack directly', () => {
  const g = duel({ board: [{ hand: ['Delta Attacker'], m: [CG, CG, CG], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Delta Attacker'); settle(g); bp(g);
  const ms = g.p[0].m.filter(Boolean);
  ok(ms.every(m => canAtk(g, m, null)), 'all three may attack directly');
  for (const m of ms) { choose(g, `atk:${m.u}:d`); settle(g); }
  ok(lp(g, 1) === 8000 - 4200, `B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Delta Attacker'], m: [CG, CG, W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Delta Attacker'), 'not with only 2 of the same name');
});
T('Demotion: Level -2', () => {
  const g = duel({ board: [{ hand: ['Demotion'], m: ['Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Demotion'); settle(g, 'Dark Magician');
  ok(LV(on(g, 0, 'Dark Magician')) === 5, `Level ${LV(on(g, 0, 'Dark Magician'))}`);
});
T('Desertapir: flip a face-up monster face-down', () => {
  const g = duel({ board: [{ hand: [], m: [set('Desertapir')], turn: 2 }, { m: [W] }] });
  choose(g, 'flip:'); settle(g, W);
  ok(on(g, 1, W).pos === 'set', 'Warwolf face-down');
});
T('Despair from the Dark: Special Summoned when discarded by the opponent', () => {
  const g = duel({ first: 1, board: [{ hand: ['Despair from the Dark', CG] }, { hand: ['Confiscation'], turn: 2 }] });
  toIdle(g); act(g, 1, 'Confiscation'); settle(g, 'Despair from the Dark'); toIdle(g);
  ok(on(g, 0, 'Despair from the Dark'), 'Despair Special Summoned');
  const g2 = duel({ board: [{ hand: ['Cost Down', 'Despair from the Dark'], turn: 2 }, {}] });
  act(g2, 0, 'Cost Down'); settle(g2, 'Despair from the Dark');
  ok(inZ(g2, 0, 'gy', 'Despair from the Dark') && !on(g2, 0, 'Despair from the Dark'), 'own discard: stays in GY');
});
T('Desrook Archfiend: send from hand to revive Terrorking', () => {
  const g = duel({ first: 1, board: [{ hand: ['Desrook Archfiend'], m: ['Terrorking Archfiend', set('Archfiend Soldier')] }, { hand: ['Fissure'], m: [W], turn: 2 }] });
  toIdle(g); act(g, 1, 'Fissure'); settle(g, 'Terrorking', 'Desrook Archfiend'); toIdle(g, 'Desrook Archfiend');
  ok(on(g, 0, 'Terrorking Archfiend') && inZ(g, 0, 'gy', 'Desrook Archfiend'), 'Terrorking back, Desrook in the GY');
});
T('Dian Keto: +1000', () => {
  const g = duel({ board: [{ hand: ['Dian Keto the Cure Master'], turn: 2 }, {}] });
  act(g, 0, 'Dian Keto the Cure Master'); settle(g); ok(lp(g, 0) === 9000, `A ${lp(g, 0)}`);
});
T('Diffusion Wave-Motion: Dark Magician attacks every monster, others cannot', () => {
  const g = duel({ board: [{ hand: ['Diffusion Wave-Motion'], m: ['Dark Magician', W], turn: 2 }, { m: [CG, ELF] }] });
  act(g, 0, 'Diffusion Wave-Motion'); settle(g, 'Dark Magician');
  ok(lp(g, 0) === 7000, 'paid 1000'); bp(g);
  ok(!canAtk(g, on(g, 0, W), on(g, 1, CG)), 'Warwolf cannot attack');
  atkOn(g, 0, 'Dark Magician', CG); toIdle(g);
  const dm = on(g, 0, 'Dark Magician');
  ok(canAtk(g, dm, on(g, 1, ELF)), 'DM can attack the second monster'); atkOn(g, 0, 'Dark Magician', ELF); toIdle(g);
  ok(cnt(g, 1, 'm') === 0, 'both destroyed');
  const g2 = duel({ board: [{ hand: ['Diffusion Wave-Motion'], m: ['Dark Magician'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Diffusion Wave-Motion'), 'not with an empty opponent field');
});
T('Dimensionhole: banished until the next Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Dimensionhole'], m: [W], turn: 2 }, {}] });
  act(g, 0, 'Dimensionhole'); settle(g, W);
  ok(inZ(g, 0, 'ban', W), 'banished');
  endTurn(g); endTurn(g); toIdle(g);
  ok(on(g, 0, W), 'back on the field');
});
T('Disappear: banish a card from the opponent GY', () => {
  const g = duel({ board: [{ hand: [], st: ['Disappear'], gy: [ELF], turn: 2 }, { gy: [CG, 'Pot of Greed'] }] });
  act(g, 0, 'Disappear'); ok(!hasOpt(g, ELF), 'own GY not offered'); settle(g, CG);
  ok(inZ(g, 1, 'ban', CG), 'Celtic banished');
});
T('Disarmament: destroy all face-up Equip Cards', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: [W], st: [null, 'Disarmament'], turn: 2 }, {}] });
  act(g, 0, 'Black Pendant'); settle(g, W); act(g, 0, 'Disarmament'); settle(g);
  ok(inZ(g, 0, 'gy', 'Black Pendant') && E.atk(g, on(g, 0, W)) === 2000 && lp(g, 1) === 7500, 'Pendant destroyed (and its 500 burn)');
});
T('Disc Fighter: destroys a DEF 2000+ Defense monster without damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Disc Fighter'], turn: 2 }, { m: [dpos(ELF)] }] });
  bp(g); atkOn(g, 0, 'Disc Fighter', ELF); toIdle(g);
  ok(inZ(g, 1, 'gy', ELF) && lp(g, 0) === 8000, `Elf destroyed, no damage (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Disc Fighter'], turn: 2 }, { m: [dpos(CG)] }] });
  bp(g2); atkOn(g2, 0, 'Disc Fighter', CG); toIdle(g2);
  ok(on(g2, 1, CG) && lp(g2, 0) === 7800, 'DEF 1200: normal battle');
});
T('Disturbance Strategy: opponent shuffles hand and redraws', () => {
  const g = duel({ board: [{ hand: [], st: ['Disturbance Strategy'], turn: 2 }, { hand: ['Pot of Greed', 'Dark Hole', 'Raigeki'] }] });
  const d = g.p[1].deck.length; act(g, 0, 'Disturbance Strategy'); settle(g);
  ok(hand(g, 1) === 3 && g.p[1].deck.length === d, `B hand ${hand(g, 1)}`);
});
T('Don Turtle: Special Summon more Don Turtles', () => {
  const g = duel({ board: [{ hand: ['Don Turtle', 'Don Turtle', 'Don Turtle'], turn: 2 }, {}] });
  ns(g, 0, 'Don Turtle', 'Don Turtle', 'Don Turtle');
  ok(cnt(g, 0, 'm', 'Don Turtle') === 3, `${cnt(g, 0, 'm', 'Don Turtle')} on field`);
});
T('Don Zaloog: mill 2 on battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Don Zaloog'], turn: 2 }, { hand: [CG] }] });
  bp(g); atkOn(g, 0, 'Don Zaloog', null, 'Send the top 2');
  ok(cnt(g, 1, 'gy') === 2 && hand(g, 1) === 1, `B gy ${cnt(g, 1, 'gy')}`);
});
T('Dora of Fate: Level 3 summon next turn burns 2000', () => {
  const g = duel({ first: 1, board: [{ hand: ['Cockroach Knight'], st: ['Dora of Fate'] }, { m: [W], turn: 2 }] });
  toIdle(g); choose(g, 'end'); settle(g, 'Dora of Fate', W); toIdle(g, 'Dora of Fate', W);
  ok(inZ(g, 0, 'gy', 'Dora of Fate'), 'Dora activated on the opponent turn');
  ns(g, 0, 'Cockroach Knight'); toIdle(g);
  ok(lp(g, 1) === 6000, `B ${lp(g, 1)}`);
});
T('Dragged Down into the Grave: each discards a chosen card, both draw', () => {
  const g = duel({ board: [{ hand: ['Dragged Down into the Grave', CG], turn: 2 }, { hand: ['Pot of Greed', ELF] }] });
  act(g, 0, 'Dragged Down into the Grave'); settle(g, 'Pot of Greed', CG);
  ok(cnt(g, 0, 'gy') === 2 && cnt(g, 1, 'gy') === 1 && hand(g, 0) === 2 && hand(g, 1) === 2, `A hand ${hand(g, 0)}, B hand ${hand(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Dragged Down into the Grave'], turn: 2 }, { hand: [CG] }] });
  ok(canAct(g2, 0, 'Dragged Down into the Grave'), 'info: activatable with 1 card each');
  const g3 = duel({ board: [{ hand: ['Dragged Down into the Grave', CG], turn: 2 }, { hand: [] }] });
  ok(!canAct(g3, 0, 'Dragged Down into the Grave'), 'not with an empty opponent hand');
});
T('Draining Shield: negate the attack, gain its ATK', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { st: ['Draining Shield'] }] });
  bp(g); atkOn(g, 0, W, null, 'Draining Shield'); toIdle(g);
  ok(lp(g, 1) === 10000, `B ${lp(g, 1)}`);
});
T('Dramatic Rescue: Amazoness targeted, return it and Special Summon', () => {
  const g = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: ['Amazoness Paladin'], st: ['Dramatic Rescue'], hand: ['Dark Magician'] }] });
  act(g, 0, 'Change of Heart'); settle(g, 'Amazoness Paladin', 'Dramatic Rescue', 'Dark Magician', 'Attack'); toIdle(g, 'Dark Magician');
  ok(inZ(g, 1, 'hand', 'Amazoness Paladin') && on(g, 1, 'Dark Magician') && !on(g, 0, 'Amazoness Paladin'), 'Paladin to hand, Dark Magician summoned');
});
T('Dream Clown: Attack to Defense destroys an opponent monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Dream Clown'], turn: 2 }, { m: [W] }] });
  const c = on(g, 0, 'Dream Clown'); choose(g, 'pos:' + c.u); settle(g, W);
  ok(c.pos === 'def' && inZ(g, 1, 'gy', W), 'Warwolf destroyed');
});
T('Dreamsprite: redirect the attack', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Dreamsprite', CG] }] });
  bp(g); atkOn(g, 0, W, 'Dreamsprite', CG); toIdle(g, CG);
  ok(on(g, 1, 'Dreamsprite') && inZ(g, 1, 'gy', CG) && lp(g, 1) === 7400, 'Celtic took the attack, 600 damage');
});
T('Coffin Seller: Dark Hole on 2 monsters is 300 once', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], st: [up('Coffin Seller')], turn: 2 }, { m: [CG, ELF] }] });
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(lp(g, 1) === 7700, `B ${lp(g, 1)}`);
});
T('Cost Down: summoned monster stays 2 lower this turn, normal next turn', () => {
  const g = duel({ board: [{ hand: ['Cost Down', 'Jinzo', 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Cost Down'); settle(g, 'Pot of Greed'); ns(g, 0, 'Jinzo');
  const j = on(g, 0, 'Jinzo'); ok(LV(j) === 4, `Level ${LV(j)} on the field`);
  endTurn(g); ok(LV(j) === 6, `Level ${LV(j)} after the turn`);
});
// Goat: the ported cards (Goat-only scripts in goat-*.js / classic-*.js take priority there) and a few shared ones
{
  const vm = require('vm'), fs = require('fs'), path = require('path');
  const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
  for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const GE = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; GE.init(GC, { format: 'goat' });
  const GF = '7 Colored Fish'; // 1800/800
  const gid = n => { const c = GC.find(x => x.n === n); if (!c) throw new Error('no goat card ' + n); return c.id; };
  const gduel = (board, ex, seed) => (lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: 0, seed: seed || 1, noShuffle: true, names: ['A', 'B'], board }));
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Change of Heart', () => {
    const g = gduel([{ hand: ['Change of Heart'], turn: 2 }, { m: [GF] }]);
    act(g, 0, 'Change of Heart'); settle(g, GF); ok(on(g, 0, GF), 'Goat: taken'); endTurn(g); ok(on(g, 1, GF), 'Goat: returned');
  });
  G('Chaosrider Gustaph', () => {
    const g = gduel([{ hand: [], m: ['Chaosrider Gustaph'], gy: ['Pot of Greed', 'Dark Hole'], turn: 2 }, {}]);
    const c = on(g, 0, 'Chaosrider Gustaph'); E.act(g, [optsFor(g, c).filter(x => x.key.startsWith('a:'))[0].key]); settle(g, 'Pot of Greed', 'Dark Hole');
    ok(E.atk(g, c) === 2000, `Goat: Gustaph ${E.atk(g, c)}`);
  });
  G('Charubin Fusion', () => {
    const g = gduel([{ hand: ['Polymerization', 'Monster Egg', 'Hinotama Soul'], turn: 2 }, {}], ['Charubin the Fire Knight']);
    act(g, 0, 'Polymerization'); settle(g, 'Charubin', 'Attack'); ok(on(g, 0, 'Charubin the Fire Knight'), 'Goat: Charubin');
  });
  G('Chiron the Mage', () => {
    const g = gduel([{ hand: ['Pot of Greed'], m: ['Chiron the Mage'], turn: 2 }, { st: ['Mirror Force'] }]);
    const c = on(g, 0, 'Chiron the Mage'); E.act(g, [optsFor(g, c).filter(x => x.key.startsWith('a:'))[0].key]); settle(g, 'Pot of Greed', 'Mirror Force');
    ok(inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 1, 'gy', 'Mirror Force'), 'Goat: Chiron destroyed Mirror Force');
  });
  G('Chorus of Sanctuary', () => {
    const g = gduel([{ hand: ['Chorus of Sanctuary'], m: [{ n: GF, pos: 'def' }], turn: 2 }, {}]);
    act(g, 0, 'Chorus of Sanctuary'); settle(g); ok(E.def(g, on(g, 0, GF)) === 1300, `Goat: DEF ${E.def(g, on(g, 0, GF))}`);
  });
  G('Chosen One', () => {
    let okAll = true;
    for (let s = 1; s <= 6; s++) { const g = gduel([{ hand: ['Chosen One', 'Celtic Guardian', 'Pot of Greed', 'Dark Hole'], turn: 2 }, {}], null, s);
      act(g, 0, 'Chosen One'); settle(g, 'Celtic Guardian', 'Pot of Greed', 'Dark Hole');
      const n = cnt(g, 0, 'gy'); if (!((on(g, 0, 'Celtic Guardian') && n === 3) || (!on(g, 0, 'Celtic Guardian') && n === 4))) okAll = false; }
    ok(okAll, 'Goat: Chosen One sends the right cards');
  });
  G('Cockroach Knight', () => {
    const g = gduel([{ hand: [], m: ['Cockroach Knight'], turn: 2 }, { m: [GF] }]);
    bp(g); atkOn(g, 0, 'Cockroach Knight', GF); toIdle(g);
    ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Cockroach Knight', 'Goat: Cockroach on top of the Deck');
  });
  G('Collected Power', () => {
    const g = gduel([{ hand: ['Black Pendant'], m: [GF], st: [null, 'Collected Power'], turn: 2 }, { m: ['Celtic Guardian'] }]);
    act(g, 0, 'Black Pendant'); settle(g, GF); act(g, 0, 'Collected Power'); settle(g, 'Celtic Guardian');
    ok(E.atk(g, on(g, 1, 'Celtic Guardian')) === 1900, 'Goat: Pendant moved');
  });
  G('Crass Clown and Dream Clown', () => {
    let g = gduel([{ hand: [], m: [{ n: 'Crass Clown', pos: 'def' }], turn: 2 }, { m: [GF] }]);
    choose(g, 'pos:' + on(g, 0, 'Crass Clown').u); settle(g, GF); ok(inZ(g, 1, 'hand', GF) && !on(g, 1, GF), 'Goat: Crass Clown bounce');
    g = gduel([{ hand: [], m: ['Dream Clown'], turn: 2 }, { m: [GF] }]);
    choose(g, 'pos:' + on(g, 0, 'Dream Clown').u); settle(g, GF); ok(inZ(g, 1, 'gy', GF), 'Goat: Dream Clown destroy');
  });
  G('Cursed Seal of the Forbidden Spell', () => {
    const g = gduel([{ hand: ['Pot of Greed', 'Pot of Greed'], turn: 2 }, { st: ['Cursed Seal of the Forbidden Spell'], hand: ['Dark Hole'] }]);
    act(g, 0, 'Pot of Greed'); settle(g, 'Cursed Seal', 'Dark Hole');
    ok(inZ(g, 1, 'gy', 'Dark Hole') && inZ(g, 0, 'gy', 'Pot of Greed') && !canAct(g, 0, 'Pot of Greed'), 'Goat: Pot negated and locked');
  });
  G('Delinquent Duo and Confiscation', () => {
    let g = gduel([{ hand: ['Delinquent Duo'], turn: 2 }, { hand: ['Celtic Guardian', 'Pot of Greed', 'Dark Hole'] }]);
    act(g, 0, 'Delinquent Duo'); settle(g); ok(lp(g, 0) === 7000 && hand(g, 1) === 1, `Goat: Duo (B hand ${hand(g, 1)})`);
    g = gduel([{ hand: ['Confiscation'], turn: 2 }, { hand: ['Mirror Force', 'Celtic Guardian'] }]);
    act(g, 0, 'Confiscation'); settle(g, 'Mirror Force'); ok(lp(g, 0) === 7000 && inZ(g, 1, 'gy', 'Mirror Force'), 'Goat: Confiscation');
  });
  G('Despair from the Dark', () => {
    const g = gduel([{ hand: ['Despair from the Dark', 'Celtic Guardian'], turn: 2 }, { hand: ['Confiscation'] }]);
    endTurn(g); toIdle(g); act(g, 1, 'Confiscation'); settle(g, 'Despair from the Dark'); toIdle(g);
    ok(on(g, 0, 'Despair from the Dark'), 'Goat: Despair Special Summoned');
  });
  G('Don Zaloog', () => {
    const g = gduel([{ hand: [], m: ['Don Zaloog'], turn: 2 }, { hand: ['Celtic Guardian'] }]);
    bp(g); atkOn(g, 0, 'Don Zaloog', null, 'Send the top 2'); toIdle(g);
    ok(cnt(g, 1, 'gy') === 2 && hand(g, 1) === 1, `Goat: Don Zaloog milled 2 (gy ${cnt(g, 1, 'gy')})`);
  });
  G('Convulsion of Nature', () => {
    const g = gduel([{ hand: ['Convulsion of Nature'], turn: 2 }, {}]);
    act(g, 0, 'Convulsion of Nature'); settle(g); ok(g.p[0].st.some(x => x && E.name(x) === 'Convulsion of Nature'), 'Goat: Convulsion stays');
  });
}
console.log(fails ? `\n${fails} failed` : '\nAll full-20 review checks passed.');
process.exit(fails ? 1 : 0);
