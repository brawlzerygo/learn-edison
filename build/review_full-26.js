// Independent review checks for full pool batch 26 (written from the card text): node build/review_full-20.js
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
const deckTopC = (g, p) => g.p[p].deck[g.p[p].deck.length - 1];
const BOT = (g, p) => g.p[p].deck[0];

T('Physical Double: Mirage Token copies on the opponent turn, gone at End Phase', () => {
  const g = duel({ first: 1, board: [{ turn: 2, st: ['Physical Double'] }, { hand: [CG], m: [W] }] });
  toIdle(g); ns(g, 1, CG, 'Physical Double', W); toIdle(g);
  const tk = g.p[0].m.find(c => c && E.name(c) === 'Mirage Token');
  ok(tk && E.atk(g, tk) === 2000 && E.def(g, tk) === 100 && LV(tk) === 4 && raceOf(tk) === 'Beast-Warrior', 'Mirage Token copies Warwolf');
  endTurn(g); ok(!g.p[0].m.some(c => c && E.name(c) === 'Mirage Token'), 'Token destroyed at End Phase');
  const g2 = duel({ board: [{ hand: [], st: ['Physical Double'], turn: 2 }, { m: [W] }] });
  ok(!canAct(g2, 0, 'Physical Double'), 'not on own turn');
});
T("Pikeru's Circle of Enchantment: effect damage to you becomes 0 this turn", () => {
  const g = duel({ first: 1, board: [{ turn: 2, st: ["Pikeru's Circle of Enchantment"] }, { hand: ['Raimei', 'Raimei'] }] });
  toIdle(g); act(g, 1, 'Raimei'); settle(g, "Pikeru's Circle"); toIdle(g);
  act(g, 1, 'Raimei'); settle(g); toIdle(g);
  ok(lp(g, 0) === 8000, `A took no effect damage (${lp(g, 0)})`);
});
T("Pikeru's Second Sight: activates and opponent draws are shown", () => {
  const g = duel({ board: [{ hand: [], st: ["Pikeru's Second Sight"], turn: 2 }, {}] });
  act(g, 0, "Pikeru's Second Sight"); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', "Pikeru's Second Sight") || inZ(g, 0, 'st', "Pikeru's Second Sight"), 'resolved');
  const n = g.log.length; endTurn(g);
  ok(g.log.slice(n).some(s => /Second Sight/.test(s)), 'B shows its draw');
});
T('Pinch Hopper: sent to GY, Special Summon an Insect from hand', () => {
  const g = duel({ board: [{ hand: ['Insect Knight'], m: ['Pinch Hopper'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Pinch Hopper', W, 'Pinch Hopper', 'Insect Knight'); toIdle(g, 'Insect Knight');
  ok(inZ(g, 0, 'gy', 'Pinch Hopper') && on(g, 0, 'Insect Knight'), 'Insect Knight Special Summoned');
});
T('Pineapple Blast: opponent destroys down to your count', () => {
  const g = duel({ board: [{ hand: [CG], st: ['Pineapple Blast'], turn: 2 }, { m: [W, ELF, 'Sangan'] }] });
  ns(g, 0, CG, 'Pineapple Blast'); toIdle(g);
  ok(cnt(g, 1, 'm') === 1 && on(g, 0, CG), `B has 1 monster (${cnt(g, 1, 'm')})`);
});
T('Piranha Army: direct damage doubled', () => {
  const g = duel({ board: [{ hand: [], m: ['Piranha Army'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Piranha Army', null); toIdle(g);
  ok(lp(g, 1) === 6400, `B ${lp(g, 1)}`);
});
T('Pixie Knight: opponent puts a Spell from your GY on top of your Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Pixie Knight'], gy: ['Pot of Greed', W], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Pixie Knight', W, 'Pot of Greed'); toIdle(g, 'Pot of Greed');
  ok(E.name(deckTopC(g, 0)) === 'Pot of Greed' && inZ(g, 0, 'gy', 'Pixie Knight'), 'Pot of Greed on top of the Deck');
});
T('Polymerization + Punished Eagle, Rabid Horseman (field), Roaring Ocean Snake', () => {
  let g = duel({ ex0: ['Punished Eagle'], board: [{ hand: ['Polymerization', 'Blue-Winged Crown', 'Niwatori'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Punished', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Punished Eagle') && inZ(g, 0, 'gy', 'Niwatori') && inZ(g, 0, 'gy', 'Blue-Winged Crown') && inZ(g, 0, 'gy', 'Polymerization'), 'Punished Eagle Fusion Summoned');
  g = duel({ ex0: ['Rabid Horseman'], board: [{ hand: ['Polymerization', 'Mystic Horseman'], m: ['Battle Ox'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Rabid', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Rabid Horseman') && inZ(g, 0, 'gy', 'Battle Ox'), 'Rabid Horseman with a field material');
  g = duel({ ex0: ['Roaring Ocean Snake'], board: [{ hand: ['Polymerization', 'Mystic Lamp', 'Hyosube'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Roaring', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Roaring Ocean Snake'), 'Roaring Ocean Snake');
  g = duel({ ex0: ['Punished Eagle'], board: [{ hand: ['Polymerization', 'Blue-Winged Crown'], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Polymerization'), 'no Polymerization without both materials');
});
T('Possessed Dark Soul: tribute, take all face-up Level 3 or lower', () => {
  const g = duel({ board: [{ hand: [], m: ['Possessed Dark Soul'], turn: 2 }, { m: ['Sangan', 'Kuriboh', W, { n: 'Petit Moth', pos: 'set' }] }] });
  const c = on(g, 0, 'Possessed Dark Soul'); E.act(g, [optsFor(g, c).find(x => x.key.startsWith('a:')).key]); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Possessed Dark Soul') && on(g, 0, 'Sangan') && on(g, 0, 'Kuriboh') && on(g, 1, W) && on(g, 1, 'Petit Moth'), 'Sangan and Kuriboh taken, Warwolf and set Moth stay');
  endTurn(g); endTurn(g); ok(on(g, 0, 'Sangan'), 'control kept');
});
T('Precious Cards from Beyond: 2-tribute summon draws 2', () => {
  const g = duel({ board: [{ hand: ['Dark Magician', 'Dark Ruler Ha Des'], st: [up('Precious Cards from Beyond')], m: [W, CG, ELF], turn: 2 }, {}] });
  const h0 = hand(g, 0); choose(g, 'ns:' + card(g, 0, 'Dark Magician').u); settle(g, W, CG, 'Precious'); toIdle(g, 'Precious');
  ok(on(g, 0, 'Dark Magician') && hand(g, 0) === h0 - 1 + 2, `drew 2 (hand ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Dark Ruler Ha Des'], st: [up('Precious Cards from Beyond')], m: [W], turn: 2 }, {}] });
  const h1 = hand(g2, 0); choose(g2, 'ns:' + card(g2, 0, 'Dark Ruler Ha Des').u); settle(g2, W, 'Precious'); toIdle(g2, 'Precious');
  ok(hand(g2, 0) === h1 - 1, 'no draw on 1 tribute');
});
T('Premature Burial: pay 800, revive in ATK, destroyed with it', () => {
  const g = duel({ board: [{ hand: ['Premature Burial', 'Mystical Space Typhoon'], gy: ['Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Premature Burial'); settle(g, 'Dark Magician'); toIdle(g);
  const dm = on(g, 0, 'Dark Magician');
  ok(dm && dm.pos === 'atk' && lp(g, 0) === 7200 && inZ(g, 0, 'st', 'Premature Burial'), 'DM revived in ATK, 800 paid, equipped');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Premature Burial'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Dark Magician') && inZ(g, 0, 'gy', 'Premature Burial'), 'DM destroyed with Premature Burial');
});
T('Prickle Fairy: no attacks on Insects, battled monster goes to Defense', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [dpos('Prickle Fairy'), 'Insect Knight'] }, { hand: [], m: [W] }] });
  toIdle(g); bp(g); const w = on(g, 1, W);
  ok(!canAtk(g, w, on(g, 0, 'Insect Knight')) && canAtk(g, w, on(g, 0, 'Prickle Fairy')), 'Insect not attackable, Prickle is');
  atkOn(g, 1, W, 'Prickle Fairy'); toIdle(g);
  ok(on(g, 0, 'Prickle Fairy') && w.pos === 'def', `Warwolf changed to Defense (${w.pos})`);
});
T('Primal Seed: with Black Luster Soldier, add 2 banished cards', () => {
  const g = duel({ board: [{ hand: ['Primal Seed'], m: ['Black Luster Soldier - Envoy of the Beginning'], ban: ['Pot of Greed', 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Primal Seed'); settle(g, 'Pot of Greed', 'Sangan'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Pot of Greed') && inZ(g, 0, 'hand', 'Sangan'), 'both added');
  const g2 = duel({ board: [{ hand: ['Primal Seed'], ban: ['Pot of Greed', 'Sangan'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Primal Seed'), 'not without the Envoy');
});
T('Protector of the Sanctuary: opponent cannot draw outside Draw Phase', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Protector of the Sanctuary'] }, { hand: ['Pot of Greed'] }] });
  toIdle(g); const h = hand(g, 1);
  ok(h === 2, `B drew in the Draw Phase (hand ${h})`);
  if (canAct(g, 1, 'Pot of Greed')) { act(g, 1, 'Pot of Greed'); settle(g); toIdle(g); }
  ok(hand(g, 1) <= h, `no extra draw (hand ${hand(g, 1)})`);
});
T('Pumpking: +100 with Castle, grows each Standby', () => {
  const g = duel({ board: [{ hand: [], m: ['Pumpking the King of Ghosts', 'Castle of Dark Illusions'], turn: 2 }, {}] });
  toIdle(g, 'Pumpking'); const pk = on(g, 0, 'Pumpking the King of Ghosts'); const a1 = E.atk(g, pk);
  ok(a1 >= 1900, `ATK with Castle ${a1}`);
  endTurn(g); endTurn(g, 'Pumpking'); toIdle(g, 'Pumpking'); const a2 = E.atk(g, pk);
  ok(a2 === a1 + 100 && E.def(g, pk) === a2 + 200, `ATK ${a2} DEF ${E.def(g, pk)} after a Standby`);
  for (let i = 0; i < 8; i++) { endTurn(g, 'Pumpking'); toIdle(g, 'Pumpking'); }
  ok(E.atk(g, pk) <= 2300, `capped (${E.atk(g, pk)})`);
});
T('Pyramid Energy: +200 ATK to own face-up monsters until End Phase', () => {
  const g = duel({ board: [{ hand: ['Pyramid Energy'], m: [W, CG], turn: 2 }, { m: [ELF] }] });
  act(g, 0, 'Pyramid Energy'); settle(g, 'ATK'); toIdle(g);
  ok(E.atk(g, on(g, 0, W)) === 2200 && E.atk(g, on(g, 0, CG)) === 1600 && E.atk(g, on(g, 1, ELF)) === 800, 'ATK +200 own only');
  endTurn(g); ok(E.atk(g, on(g, 0, W)) === 2000, 'back after End Phase');
  const g2 = duel({ board: [{ hand: ['Pyramid Energy'], m: [W], turn: 2 }, {}] });
  act(g2, 0, 'Pyramid Energy'); settle(g2, 'DEF'); toIdle(g2);
  ok(E.def(g2, on(g2, 0, W)) === 600, `DEF +500 (${E.def(g2, on(g2, 0, W))})`);
});
T('Pyramid of Light: Andro Sphinx banished when it leaves', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Andro Sphinx'], st: [up('Pyramid of Light')], turn: 2 }, {}] });
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Pyramid of Light'); toIdle(g);
  ok(inZ(g, 0, 'ban', 'Andro Sphinx'), 'Andro Sphinx banished');
});
T('Pyro Clock of Destiny: Swords end a turn sooner', () => {
  const g = duel({ board: [{ hand: ['Swords of Revealing Light'], st: [null, 'Pyro Clock of Destiny'], turn: 2 }, {}] });
  act(g, 0, 'Swords of Revealing Light'); settle(g); toIdle(g);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g); // A turn 4
  act(g, 0, 'Pyro Clock of Destiny'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Pyro Clock of Destiny'), 'Pyro Clock resolved');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g); // A turn 6
  ok(inZ(g, 0, 'gy', 'Swords of Revealing Light'), 'Swords gone after the opponent 2nd turn');
});
T("Queen's Double: attacks directly past monsters", () => {
  const g = duel({ board: [{ hand: [], m: ["Queen's Double"], turn: 2 }, { m: [W] }] });
  bp(g); ok(canAtk(g, on(g, 0, "Queen's Double"), null), 'direct attack offered');
  atkOn(g, 0, "Queen's Double", null); toIdle(g); ok(lp(g, 1) === 7650, `B ${lp(g, 1)}`);
});
T('Question: wrong call Special Summons, right call banishes', () => {
  for (const [call, res] of [[CG, 'ss'], ['Dark Magician', 'ban']]) {
    const g = duel({ board: [{ hand: ['Question'], gy: ['Dark Magician', CG, 'Pot of Greed'], turn: 2 }, {}] });
    act(g, 0, 'Question'); settle(g, call); toIdle(g, call);
    ok(res === 'ss' ? !!on(g, 0, 'Dark Magician') : inZ(g, 0, 'ban', 'Dark Magician'), `call ${call}: ${res}`);
  }
});
T('Rafflesia Seduction: FLIP takes a face-up monster until end of turn', () => {
  const g = duel({ board: [{ hand: [], m: [set('Rafflesia Seduction')], turn: 2 }, { m: [W] }] });
  choose(g, 'flip:'); settle(g, W); toIdle(g, W);
  ok(on(g, 0, W), 'Warwolf taken'); endTurn(g); ok(on(g, 1, W), 'returned at end of turn');
});
T('Raigeki: destroys all opponent monsters only', () => {
  const g = duel({ board: [{ hand: ['Raigeki'], m: [CG], turn: 2 }, { m: [W, ELF, set('Sangan')] }] });
  act(g, 0, 'Raigeki'); settle(g); toIdle(g);
  ok(cnt(g, 1, 'm') === 0 && on(g, 0, CG), 'B board cleared, A kept CG');
  const g2 = duel({ board: [{ hand: ['Raigeki'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Raigeki'), 'not with no opponent monsters');
});
T('Raimei and Rain of Mercy', () => {
  const g = duel({ board: [{ hand: ['Raimei', 'Rain of Mercy'], turn: 2 }, {}] });
  act(g, 0, 'Raimei'); settle(g); ok(lp(g, 1) === 7700, `Raimei ${lp(g, 1)}`);
  act(g, 0, 'Rain of Mercy'); settle(g); ok(lp(g, 0) === 9000 && lp(g, 1) === 8700, `Rain ${lp(g, 0)}/${lp(g, 1)}`);
});
T('Raise Body Heat: Dinosaur only, +300/+300', () => {
  const g = duel({ board: [{ hand: ['Raise Body Heat'], m: ['Sabersaurus'], turn: 2 }, {}] });
  act(g, 0, 'Raise Body Heat'); settle(g, 'Sabersaurus'); const s = on(g, 0, 'Sabersaurus');
  ok(E.atk(g, s) === 2200 && E.def(g, s) === 800, `Sabersaurus ${E.atk(g, s)}/${E.def(g, s)}`);
  const g2 = duel({ board: [{ hand: ['Raise Body Heat'], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Raise Body Heat'), 'no Dinosaur, no activation');
});
T('Rare Metal Dragon: cannot be Normal Summoned, can be Special Summoned', () => {
  const g = duel({ board: [{ hand: ['Rare Metal Dragon', 'Monster Reborn'], gy: ['Rare Metal Dragon'], turn: 2 }, {}] });
  ok(noSummon(g, card(g, 0, 'Rare Metal Dragon')), 'no NS/Set');
  act(g, 0, 'Monster Reborn'); settle(g, 'Rare Metal Dragon'); toIdle(g);
  ok(on(g, 0, 'Rare Metal Dragon'), 'revived');
});
T('Rare Metalmorph: +500 to a Machine, negates a Spell once', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: ['Rare Metalmorph'], turn: 2 }, { hand: ['Snatch Steal', 'Snatch Steal'] }] });
  act(g, 0, 'Rare Metalmorph'); settle(g, 'Cyber Dragon'); toIdle(g);
  const cd = on(g, 0, 'Cyber Dragon'); ok(E.atk(g, cd) === 2600, `Cyber Dragon ${E.atk(g, cd)}`);
  endTurn(g); toIdle(g);
  act(g, 1, 'Snatch Steal'); settle(g, 'Cyber Dragon', 'Negate the Spell'); toIdle(g);
  ok(on(g, 0, 'Cyber Dragon'), 'first Snatch Steal negated');
  act(g, 1, 'Snatch Steal'); settle(g, 'Cyber Dragon'); toIdle(g);
  ok(on(g, 1, 'Cyber Dragon'), 'second Snatch Steal works');
});
T('Raregold Armor: opponent can only attack the equipped monster', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [CG, ELF], st: [up('Raregold Armor')] }, { hand: [], m: [W] }] });
  g.p[0].st[0].equipTo = on(g, 0, ELF).u;
  toIdle(g); bp(g); const w = on(g, 1, W);
  ok(canAtk(g, w, on(g, 0, ELF)) && !canAtk(g, w, on(g, 0, CG)), 'only the equipped Elf can be attacked');
});
T('Raregold Armor: activate and equip', () => {
  const g = duel({ board: [{ hand: ['Raregold Armor'], m: [CG], turn: 2 }, {}] });
  act(g, 0, 'Raregold Armor'); settle(g, CG); toIdle(g);
  ok(inZ(g, 0, 'st', 'Raregold Armor') && card(g, 0, 'Raregold Armor').equipTo === on(g, 0, CG).u, 'equipped');
});
T('Ray of Hope: 2 LIGHT monsters back to the Deck', () => {
  const g = duel({ board: [{ hand: [], st: ['Ray of Hope'], gy: ['Sacred Crane', 'Pixie Knight', W], turn: 2 }, {}] });
  const d0 = g.p[0].deck.length; act(g, 0, 'Ray of Hope'); settle(g, 'Sacred Crane', 'Pixie Knight'); toIdle(g);
  ok(!inZ(g, 0, 'gy', 'Sacred Crane') && !inZ(g, 0, 'gy', 'Pixie Knight') && g.p[0].deck.length === d0 + 2, 'both in the Deck');
  const g2 = duel({ board: [{ hand: [], st: ['Ray of Hope'], gy: ['Sacred Crane', W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Ray of Hope'), 'not with 1 LIGHT');
});
T('Re-Fusion: pay 800, revive a Fusion, banished when destroyed', () => {
  const g = duel({ ex0: ['Punished Eagle'], board: [{ hand: ['Polymerization', 'Blue-Winged Crown', 'Niwatori', 'Dark Hole', 'Re-Fusion', 'Mystical Space Typhoon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Punished', 'Attack'); toIdle(g); act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Punished Eagle'), 'Eagle Fusion Summoned then destroyed');
  act(g, 0, 'Re-Fusion'); settle(g, 'Punished Eagle', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Punished Eagle') && lp(g, 0) === 7200, 'Eagle revived, 800 paid');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Re-Fusion'); toIdle(g);
  ok(inZ(g, 0, 'ban', 'Punished Eagle'), 'Eagle banished');
});
T('Ready for Intercepting: Warrior or Spellcaster to face-down Defense', () => {
  const g = duel({ board: [{ hand: [], st: ['Ready for Intercepting'], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'Ready for Intercepting'); settle(g, CG); toIdle(g);
  ok(on(g, 1, CG).pos === 'set', 'Celtic Guardian set');
  const g2 = duel({ board: [{ hand: [], st: ['Ready for Intercepting'], turn: 2 }, { m: [W] }] });
  ok(!canAct(g2, 0, 'Ready for Intercepting'), 'no Warrior/Spellcaster, no activation');
});
T('Really Eternal Rest: destroys equipped monsters', () => {
  const g = duel({ board: [{ hand: ['Raise Body Heat'], st: [null, 'Really Eternal Rest'], m: ['Sabersaurus', W], turn: 2 }, {}] });
  act(g, 0, 'Raise Body Heat'); settle(g, 'Sabersaurus'); toIdle(g);
  act(g, 0, 'Really Eternal Rest'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Sabersaurus') && on(g, 0, W), 'Sabersaurus destroyed, Warwolf stays');
});
T('Reaper of the Cards: FLIP destroys a Set Trap', () => {
  const g = duel({ board: [{ hand: [], m: [set('Reaper of the Cards')], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'flip:'); settle(g, 'Mirror Force'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
  const g2 = duel({ board: [{ hand: [], m: [set('Reaper of the Cards')], turn: 2 }, { st: ['Pot of Greed'] }] });
  choose(g2, 'flip:'); settle(g2, 'Pot of Greed'); toIdle(g2);
  ok(inZ(g2, 1, 'st', 'Pot of Greed'), 'a Set Spell is not destroyed');
});
T('Reasoning: right level Special Summons, wrong sends to GY', () => {
  // The batch text reads "if its Level isn't the declared number, send all to the GY, else Special Summon": a garbled
  // wording; the printed card sends everything on a correct call and summons on a wrong one.
  for (const [n, sum] of [['Level 7', true], ['Level 3', false]]) {
    const g = duel({ board: [{ hand: ['Reasoning'], deckTop: [W, 'Pot of Greed', 'Dark Hole', 'Sangan'], turn: 2 }, {}] });
    act(g, 0, 'Reasoning'); settle(g, n); toIdle(g);
    ok(inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 0, 'gy', 'Dark Hole') && (sum ? !!on(g, 0, 'Sangan') : inZ(g, 0, 'gy', 'Sangan')), `declared ${n}: ${sum ? 'summoned' : 'sent'}`);
  }
});
T('Reckless Greed: draw 2, skip the next 2 Draw Phases', () => {
  const g = duel({ board: [{ hand: [], st: ['Reckless Greed'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Reckless Greed'); settle(g); toIdle(g);
  ok(hand(g, 0) === h + 2, 'drew 2');
  const h2 = hand(g, 0); endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(hand(g, 0) === h2, 'no draw turn 4'); endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(hand(g, 0) === h2, 'no draw turn 6'); endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(hand(g, 0) === h2 + 1, 'draws again turn 8');
});
T('Recycle: pay 300 in Standby, Spell to the bottom of the Deck', () => {
  const g = duel({ board: [{ hand: [], st: [up('Recycle')], gy: ['Pot of Greed'], turn: 1 }, {}] });
  for (let i = 0; i < 6 && !idle(g); i++) { if (g.prompt.type === 'respond' && hasOpt(g, 'Recycle')) settle(g, 'Recycle', 'Pot of Greed'); else settle(g, 'Recycle', 'Pot of Greed'); }
  ok(E.name(BOT(g, 0)) === 'Pot of Greed' && lp(g, 0) === 7700, `Pot at the bottom, LP ${lp(g, 0)}`);
});
T('Reflect Bounder: damage equal to attacker ATK, then destroyed', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Reflect Bounder'] }, { hand: [], m: [W] }] });
  toIdle(g); bp(g); atkOn(g, 1, W, 'Reflect Bounder'); toIdle(g);
  ok(lp(g, 1) === 6000 && lp(g, 0) === 7700 && inZ(g, 0, 'gy', 'Reflect Bounder'), `B ${lp(g, 1)} A ${lp(g, 0)}`);
  const g2 = duel({ first: 1, board: [{ turn: 2, m: ['Reflect Bounder'] }, { hand: [], m: [CG] }] });
  toIdle(g2); bp(g2); atkOn(g2, 1, CG, 'Reflect Bounder'); toIdle(g2);
  ok(lp(g2, 1) === 6300 && inZ(g2, 0, 'gy', 'Reflect Bounder') && inZ(g2, 1, 'gy', CG), 'destroyed by its own effect after winning');
});
T('Regenerating Mummy: discarded by opponent, returns to hand', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: ['Regenerating Mummy'] }, { hand: ['Confiscation'] }] });
  toIdle(g); act(g, 1, 'Confiscation'); settle(g, 'Regenerating Mummy'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Regenerating Mummy'), 'back in hand');
});
T('Reinforcements: +500 until end of turn', () => {
  const g = duel({ board: [{ hand: [], m: [CG], st: ['Reinforcements'], turn: 2 }, {}] });
  act(g, 0, 'Reinforcements'); settle(g, CG); toIdle(g);
  ok(E.atk(g, on(g, 0, CG)) === 1900, 'CG 1900'); endTurn(g); ok(E.atk(g, on(g, 0, CG)) === 1400, 'back to 1400');
});
T('Reload: shuffle hand into Deck, draw the same number', () => {
  const g = duel({ board: [{ hand: ['Reload', 'Pot of Greed', 'Dark Hole', 'Raimei'], turn: 2 }, {}] });
  act(g, 0, 'Reload'); settle(g); toIdle(g);
  ok(hand(g, 0) === 4 && g.p[0].hand.every(c => E.name(c) === W), `hand 4 new cards (${g.p[0].hand.map(E.name)})`);
});
T('Remove Brainwashing: control returns to owners', () => {
  const g = duel({ board: [{ hand: ['Change of Heart'], st: [null, 'Remove Brainwashing'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Change of Heart'); settle(g, W); toIdle(g); ok(on(g, 0, W), 'taken');
  act(g, 0, 'Remove Brainwashing'); settle(g); toIdle(g); ok(on(g, 1, W), 'returned to B');
});
T('Remove Trap: destroys a face-up Trap', () => {
  const g = duel({ board: [{ hand: ['Remove Trap'], turn: 2 }, { st: [up('Respect Play'), 'Mirror Force'] }] });
  act(g, 0, 'Remove Trap'); settle(g, 'Respect Play'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Respect Play') && inZ(g, 1, 'st', 'Mirror Force'), 'Respect Play destroyed');
});
T('Reshef the Dark Being: Ritual Summon, discard a Spell to take a monster', () => {
  const g = duel({ board: [{ hand: ['Final Ritual of the Ancients', 'Reshef the Dark Being', 'Pot of Greed'], m: [W, CG], turn: 2 }, { m: [ELF] }] });
  act(g, 0, 'Final Ritual of the Ancients'); settle(g, 'Reshef', W, CG, 'Attack'); toIdle(g);
  const r = on(g, 0, 'Reshef the Dark Being'); ok(!!r, 'Reshef Ritual Summoned');
  if (r) { const o = optsFor(g, r).find(x => x.key.startsWith('a:')); if (o) { E.act(g, [o.key]); settle(g, 'Pot of Greed', ELF); toIdle(g); }
    ok(on(g, 0, ELF) && inZ(g, 0, 'gy', 'Pot of Greed'), 'Elf taken, Pot discarded');
    ok(optsFor(g, r).filter(x => x.key.startsWith('a:')).length === 0, 'once per turn');
    endTurn(g); ok(on(g, 1, ELF), 'Elf returned'); }
});
T('Reshef: not by another Ritual Spell', () => {
  const g = duel({ board: [{ hand: ['Advanced Ritual Art', 'Reshef the Dark Being'], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Advanced Ritual Art'), 'Advanced Ritual Art cannot summon Reshef');
});
T('Respect Play: activates and stays', () => {
  const g = duel({ board: [{ hand: [], st: ['Respect Play'], turn: 2 }, {}] });
  act(g, 0, 'Respect Play'); settle(g); toIdle(g); ok(inZ(g, 0, 'st', 'Respect Play'), 'on the field');
});
T('Restructer Revolution: 200 per card in opponent hand', () => {
  const g = duel({ board: [{ hand: ['Restructer Revolution'], turn: 2 }, {}] });
  const n = hand(g, 1); act(g, 0, 'Restructer Revolution'); settle(g); ok(lp(g, 1) === 8000 - 200 * n, `B ${lp(g, 1)} (${n} cards)`);
});
T('Reversal Quiz: send all, right call swaps LP', () => {
  const g = duel({ board: [{ hand: ['Reversal Quiz', 'Pot of Greed'], m: [CG], lp: 1000, turn: 2 }, {}] });
  act(g, 0, 'Reversal Quiz'); settle(g, 'Monster'); toIdle(g);
  ok(cnt(g, 0, 'm') === 0 && hand(g, 0) === 0 && inZ(g, 0, 'gy', 'Pot of Greed'), 'all sent');
  ok(lp(g, 0) === 8000 && lp(g, 1) === 1000, `LP swapped ${lp(g, 0)}/${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Reversal Quiz'], lp: 1000, turn: 2 }, {}] });
  act(g2, 0, 'Reversal Quiz'); settle(g2, 'Spell'); toIdle(g2); ok(lp(g2, 0) === 1000, 'wrong call keeps LP');
});
T('Reverse Trap: +300 equip becomes -300', () => {
  const g = duel({ board: [{ hand: ['Raise Body Heat'], st: [null, 'Reverse Trap'], m: ['Sabersaurus'], turn: 2 }, {}] });
  act(g, 0, 'Raise Body Heat'); settle(g, 'Sabersaurus'); toIdle(g);
  act(g, 0, 'Reverse Trap'); settle(g); toIdle(g); const s = on(g, 0, 'Sabersaurus');
  ok(E.atk(g, s) === 1600 && E.def(g, s) === 200, `Sabersaurus ${E.atk(g, s)}/${E.def(g, s)}`);
  endTurn(g); ok(E.atk(g, s) === 2200, `normal after End Phase (${E.atk(g, s)})`);
});
T('Riryoku Field: negates and destroys a Spell targeting 1 monster', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [W], st: ['Riryoku Field'] }, { hand: ['Book of Moon'] }] });
  toIdle(g); act(g, 1, 'Book of Moon'); settle(g, W, 'Riryoku Field'); toIdle(g);
  ok(on(g, 0, W).pos === 'atk' && inZ(g, 1, 'gy', 'Book of Moon') && inZ(g, 0, 'gy', 'Riryoku Field'), 'Book of Moon negated');
  const g2 = duel({ first: 1, board: [{ turn: 2, m: [W], st: ['Riryoku Field'] }, { hand: ['Dark Hole'] }] });
  toIdle(g2); act(g2, 1, 'Dark Hole'); const respondable = hasOpt(g2, 'a:' + card(g2, 0, 'Riryoku Field').u + ':'); ok(!respondable, 'not on Dark Hole');
});
T('Rising Air Current: WIND +500 ATK -400 DEF', () => {
  const g = duel({ board: [{ hand: ['Rising Air Current'], m: ['Harpie Lady', W], turn: 2 }, {}] });
  act(g, 0, 'Rising Air Current'); settle(g); const h = on(g, 0, 'Harpie Lady');
  ok(E.atk(g, h) === 1800 && E.def(g, h) === 1000 && E.atk(g, on(g, 0, W)) === 2000, `Harpie ${E.atk(g, h)}/${E.def(g, h)}`);
});
T("Robbin' Goblin: battle damage makes opponent discard", () => {
  const g = duel({ board: [{ hand: [], m: [CG], st: [up("Robbin' Goblin")], turn: 2 }, {}] });
  const n = hand(g, 1); bp(g); atkOn(g, 0, CG, null); toIdle(g);
  ok(hand(g, 1) === n - 1 && cnt(g, 1, 'gy') === 1, `B discarded (${n} -> ${hand(g, 1)})`);
});
T('Roc from the Valley of Haze: discarded from hand, shuffled into Deck', () => {
  const g = duel({ board: [{ hand: ['Cost Down', 'Roc from the Valley of Haze'], turn: 2 }, {}] });
  act(g, 0, 'Cost Down'); settle(g, 'Roc from'); toIdle(g);
  ok(!inZ(g, 0, 'gy', 'Roc from the Valley of Haze') && g.p[0].deck.some(c => E.name(c) === 'Roc from the Valley of Haze'), 'Roc in the Deck');
});
T('Rock Bombardment: send a Rock from Deck, 500 damage', () => {
  const g = duel({ board: [{ hand: [], st: ['Rock Bombardment'], deckTop: [W, 'Giant Soldier of Stone'], turn: 2 }, {}] });
  act(g, 0, 'Rock Bombardment'); settle(g, 'Giant Soldier'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Giant Soldier of Stone') && lp(g, 1) === 7500, `B ${lp(g, 1)}`);
});
T("Rod of the Mind's Eye: battle damage becomes 1000", () => {
  const g = duel({ board: [{ hand: ["Rod of the Mind's Eye"], m: ['Petit Moth'], turn: 2 }, {}] });
  act(g, 0, "Rod of the Mind's Eye"); settle(g, 'Petit Moth'); toIdle(g);
  bp(g); atkOn(g, 0, 'Petit Moth', null); toIdle(g); ok(lp(g, 1) === 7000, `B ${lp(g, 1)}`);
});
T('Rope of Life: discard hand, revive battle-destroyed monster +800', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: ['Pot of Greed'], m: [CG], st: ['Rope of Life'] }, { hand: [], m: [W] }] });
  toIdle(g); bp(g); atkOn(g, 1, W, CG, 'Rope of Life', CG); toIdle(g, 'Rope of Life', CG);
  const c = on(g, 0, CG); ok(c && E.atk(g, c) === 2200 && inZ(g, 0, 'gy', 'Pot of Greed'), `CG back with ${c && E.atk(g, c)}`);
});
T('Roulette Barrel: once per turn, destroys a monster of the chosen roll', () => {
  const g = duel({ seed: 3, board: [{ hand: [], m: ['Roulette Barrel'], turn: 2 }, { m: ['Kuriboh', 'Morphing Jar', 'Sangan', W, 'Cyber Dragon'] }] });
  const r = on(g, 0, 'Roulette Barrel'); const o = optsFor(g, r).filter(x => x.key.startsWith('a:'));
  ok(o.length > 0, 'effect offered'); E.act(g, [o[0].key]); settle(g); toIdle(g);
  const n = cnt(g, 1, 'm') + cnt(g, 0, 'm');
  ok(n === 5 || n === 6, `a monster destroyed or roll of 6 (${n} left)`);
  ok(optsFor(g, r).filter(x => x.key.startsWith('a:')).length === 0 || !on(g, 0, 'Roulette Barrel'), 'once per turn');
});
T('Sacred Crane: draw when Special Summoned, not Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn', 'Sacred Crane'], gy: ['Sacred Crane'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Monster Reborn'); settle(g, 'Sacred Crane'); toIdle(g, 'Sacred Crane');
  ok(on(g, 0, 'Sacred Crane') && hand(g, 0) === h, `drew 1 (hand ${hand(g, 0)})`);
  ns(g, 0, 'Sacred Crane'); toIdle(g); ok(hand(g, 0) === h - 1, 'no draw on Normal Summon');
});
T('Sacred Phoenix of Nephthys: returns next Standby and destroys Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Sacred Phoenix of Nephthys'], st: [up('Respect Play')], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g); ok(inZ(g, 0, 'gy', 'Sacred Phoenix of Nephthys'), 'Phoenix destroyed');
  endTurn(g); toIdle(g); ok(!on(g, 0, 'Sacred Phoenix of Nephthys'), 'not on the opponent turn');
  endTurn(g, 'Sacred Phoenix'); toIdle(g, 'Sacred Phoenix');
  ok(on(g, 0, 'Sacred Phoenix of Nephthys') && inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'Respect Play'), 'Phoenix back, Spells/Traps destroyed');
  const g2 = duel({ first: 1, board: [{ turn: 2, m: ['Sacred Phoenix of Nephthys'] }, { hand: [], m: ['Dark Magician'] }] });
  toIdle(g2); bp(g2); atkOn(g2, 1, 'Dark Magician', 'Sacred Phoenix of Nephthys'); toIdle(g2); endTurn(g2); toIdle(g2);
  ok(!on(g2, 0, 'Sacred Phoenix of Nephthys'), 'battle destruction does not bring it back');
});

// Goat: ported shared scripts and Goat-only scripts that override them
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
  const gduel = (board, ex, first) => { const g = (lastG = GE.newDuel({ decks: [0, 1].map(i => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (i ? [] : ex || []).map(gid) })), first: first || 0, seed: 1, noShuffle: true, names: ['A', 'B'], board })); return g; };
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Polymerization', () => {
    const g = gduel([{ hand: ['Polymerization', 'Blue-Winged Crown', 'Niwatori'], turn: 2 }, {}], ['Punished Eagle']); toIdle(g);
    act(g, 0, 'Polymerization'); settle(g, 'Punished', 'Attack'); toIdle(g); ok(on(g, 0, 'Punished Eagle'), 'Goat: Punished Eagle');
  });
  G('Premature Burial', () => {
    const g = gduel([{ hand: ['Premature Burial', 'Mystical Space Typhoon'], gy: ['Dark Magician'], turn: 2 }, {}]); toIdle(g);
    act(g, 0, 'Premature Burial'); settle(g, 'Dark Magician'); toIdle(g);
    ok(on(g, 0, 'Dark Magician') && lp(g, 0) === 7200, 'Goat: revived, paid 800');
    act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Premature Burial'); toIdle(g); ok(inZ(g, 0, 'gy', 'Dark Magician'), 'Goat: destroyed with it');
  });
  G('Raigeki', () => {
    const g = gduel([{ hand: ['Raigeki'], m: [GF], turn: 2 }, { m: [GF, 'Sangan'] }]); toIdle(g);
    act(g, 0, 'Raigeki'); settle(g); toIdle(g); ok(cnt(g, 1, 'm') === 0 && cnt(g, 0, 'm') === 1, 'Goat: opponent cleared');
  });
  G('Reckless Greed, Reload, Sacred Crane', () => {
    let g = gduel([{ hand: [], st: ['Reckless Greed'], turn: 2 }, {}]); toIdle(g);
    const h = hand(g, 0); act(g, 0, 'Reckless Greed'); settle(g); toIdle(g); ok(hand(g, 0) === h + 2, 'Goat: drew 2');
    endTurn(g); toIdle(g); endTurn(g); toIdle(g); ok(hand(g, 0) === h + 2, 'Goat: skipped draw');
    g = gduel([{ hand: ['Reload', 'Pot of Greed', 'Raigeki'], turn: 2 }, {}]); toIdle(g);
    act(g, 0, 'Reload'); settle(g); toIdle(g); ok(hand(g, 0) === 3 && g.p[0].hand.every(c => E.name(c) === GF), 'Goat: Reload');
    g = gduel([{ hand: ['Monster Reborn'], gy: ['Sacred Crane'], turn: 2 }, {}]); toIdle(g);
    act(g, 0, 'Monster Reborn'); settle(g, 'Sacred Crane'); toIdle(g, 'Sacred Crane'); ok(hand(g, 0) === 2, `Goat: Crane draws (${hand(g, 0)})`);
  });
  G('Pinch Hopper, Reflect Bounder, Rope of Life', () => {
    let g = gduel([{ hand: ['Insect Knight'], m: ['Pinch Hopper'], turn: 2 }, { m: [GF] }]); toIdle(g);
    bp(g); atkOn(g, 0, 'Pinch Hopper', GF, 'Pinch Hopper', 'Insect Knight'); toIdle(g, 'Insect Knight');
    ok(on(g, 0, 'Insect Knight'), 'Goat: Pinch Hopper');
    g = gduel([{ turn: 2, m: ['Reflect Bounder'] }, { hand: [], m: [GF] }], null, 1); toIdle(g);
    bp(g); atkOn(g, 1, GF, 'Reflect Bounder'); toIdle(g);
    ok(lp(g, 1) === 8000 - 1800 && inZ(g, 0, 'gy', 'Reflect Bounder'), `Goat: Reflect Bounder B ${lp(g, 1)}`);
    g = gduel([{ turn: 2, hand: ['Pot of Greed'], m: [CG], st: ['Rope of Life'] }, { hand: [], m: [GF] }], null, 1); toIdle(g);
    bp(g); atkOn(g, 1, GF, CG, 'Rope of Life', CG); toIdle(g, 'Rope of Life', CG);
    ok(on(g, 0, CG) && E.atk(g, on(g, 0, CG)) === 2200, 'Goat: Rope of Life');
  });
  G('Remove Trap, Reaper of the Cards, Reversal Quiz', () => {
    let g = gduel([{ hand: ['Remove Trap'], turn: 2 }, { st: [up('Robbin\' Goblin')] }]); toIdle(g);
    act(g, 0, 'Remove Trap'); settle(g, "Robbin' Goblin"); toIdle(g); ok(inZ(g, 1, 'gy', "Robbin' Goblin"), 'Goat: Remove Trap');
    g = gduel([{ hand: [], m: [set('Reaper of the Cards')], turn: 2 }, { st: ['Mirror Force'] }]); toIdle(g);
    choose(g, 'flip:'); settle(g, 'Mirror Force'); toIdle(g); ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Goat: Reaper');
    g = gduel([{ hand: ['Reversal Quiz'], lp: 1000, turn: 2 }, {}]); toIdle(g);
    act(g, 0, 'Reversal Quiz'); settle(g, 'Monster'); toIdle(g); ok(lp(g, 0) === 8000, 'Goat: Reversal Quiz');
  });
}
console.log(fails ? `\n${fails} failed` : '\nAll full-26 review checks passed.');
process.exit(fails ? 1 : 0);
