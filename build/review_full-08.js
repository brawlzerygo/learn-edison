// Independent review checks for full pool batch 08 (written from the card text): node build/review_full-08.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
let FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior 2000/100
let lastG; function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
}
let fails = 0;
const dump = g => '   | ' + g.log.slice(-18).join('\n   | ') + '\n   prompt: ' + (g.prompt ? g.prompt.p + ' ' + g.prompt.type + ' ' + g.prompt.text + ' :: ' + g.prompt.opts.map(x => x.label + '[' + x.key + ']').join(', ') : 'none');
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) { fails++; if (process.env.DBG) console.log(dump(lastG)); } }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra, ...g.p[p].ban, g.p[p].fz].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const canAct = (g, p, n) => { const c = card(g, p, n); return !!c && hasOpt(g, 'a:' + c.u + ':'); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const lp = (g, p) => g.p[p].lp;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log(dump(lastG)); } };
// answer prompts until an idle or battle prompt: responses pass unless a pick matches, yes to yes/no, picks by label
function settle(g, ...picks) { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const k = picks.find(t => pr.opts.some(x => x.key !== 'pass' && (x.label + ' ' + x.key).includes(t))); if (k) choose(g, k); else E.act(g, ['pass']); }
  else if (pr.type === 'yesno') choose(g, picks.includes('NO') ? 'no' : 'yes');
  else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => x.label.includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); }
    for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); E.act(g, ks); } } }
const bp = g => { choose(g, 'bp'); settle(g); };
const atkOn = (g, p, aName, tName, ...picks) => { const a = on(g, p, aName), t = tName ? on(g, 1 - p, tName) : null; choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); settle(g, ...picks); };
const canAtk = (g, a, t) => hasOpt(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const endTurn = (g, ...picks) => { if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g, ...picks); } choose(g, 'end'); settle(g, ...picks); };
const ns = (g, p, n, ...picks) => { choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u); settle(g, ...picks); };

/* ---------------- Energy / Fairy ---------------- */
T('Energy Bravery: Gemini-Summoned Geminis you control are not destroyed by card effects', () => {
  const g = duel({ board: [{ hand: [], m: ['Energy Bravery', 'Elemental HERO Neos Alius'], turn: 2 }, { hand: ['Smashing Ground'] }] });
  choose(g, 'gem:' + on(g, 0, 'Elemental HERO Neos Alius').u); settle(g);
  endTurn(g); act(g, 1, 'Smashing Ground'); settle(g);
  ok(on(g, 0, 'Elemental HERO Neos Alius') && on(g, 0, 'Energy Bravery'), 'Gemini Summoned Alius survives Smashing Ground');
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Energy Bravery', 'Elemental HERO Neos Alius'], turn: 2 }, {}] });
  act(g2, 0, 'Dark Hole'); settle(g2);
  ok(!on(g2, 0, 'Elemental HERO Neos Alius'), 'a Gemini not Gemini Summoned is destroyed');
});
T('Energy Drain: +200 ATK/DEF per card in the opponent hand until the end of the turn', () => {
  const g = duel({ board: [{ m: ['Blade Knight'], st: ['Energy Drain'], turn: 2 }, { hand: [FILL, FILL, FILL, FILL, FILL] }] });
  act(g, 0, 'Energy Drain'); settle(g, 'Blade Knight');
  const b = on(g, 0, 'Blade Knight');
  ok(E.atk(g, b) === 2600 && E.def(g, b) === 2000, `Blade Knight ${E.atk(g, b)}/${E.def(g, b)}`);
  endTurn(g);
  ok(E.atk(g, b) === 1600, `back to 1600 after the turn (${E.atk(g, b)})`);
});
T('Energy-Absorbing Monolith: opponent burn becomes a gain', () => {
  const g = duel({ board: [{ hand: ['Ookazi'], turn: 2 }, { st: ['Energy-Absorbing Monolith'] }] });
  const mono = card(g, 1, 'Energy-Absorbing Monolith');
  act(g, 0, 'Ookazi'); settle(g, 'a:' + mono.u + ':');
  ok(lp(g, 1) === 8800 && inZ(g, 1, 'gy', 'Energy-Absorbing Monolith'), `B gained 800 instead of taking it (${lp(g, 1)})`);
});
T('Fairy Box: coin on attack declaration, ATK 0 on a right call; 500 LP or destroy in Standby', () => {
  let right = 0, wrong = 0;
  for (let s = 1; s <= 8; s++) {
    const g = duel({ seed: s, board: [{ m: [FILL], turn: 2 }, { st: [{ n: 'Fairy Box', pos: 'up' }] }] });
    bp(g); choose(g, `atk:${on(g, 0, FILL).u}:d`); settle(g, 'a:' + card(g, 1, 'Fairy Box').u + ':', 'Heads');
    if (lp(g, 1) === 8000) right++; else if (lp(g, 1) === 6000) wrong++;
  }
  ok(right > 0 && right + wrong === 8, `right calls stop the damage, wrong calls let 2000 through (${right} right, ${wrong} wrong)`);
  const g = duel({ board: [{ turn: 1 }, { st: [{ n: 'Fairy Box', pos: 'up' }] }] });
  endTurn(g); settle(g);
  ok(lp(g, 1) === 7500 && inZ(g, 1, 'st', 'Fairy Box'), `B paid 500 in the Standby Phase (${lp(g, 1)})`);
  const g2 = duel({ board: [{ turn: 1 }, { st: [{ n: 'Fairy Box', pos: 'up' }] }] });
  endTurn(g2, 'NO'); settle(g2, 'NO');
  ok(lp(g2, 1) === 8000 && inZ(g2, 1, 'gy', 'Fairy Box'), 'not paying destroys Fairy Box');
});
T('Fairy Guardian: tribute to return a Spell the opponent sent to the GY this turn to the Deck bottom', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Fairy Guardian'], st: ['Pot of Greed'], turn: 2 }, { st: ['Mystical Space Typhoon'] }] });
  const mst = card(g, 1, 'Mystical Space Typhoon');
  ns(g, 0, FILL, 'a:' + mst.u + ':', 'Pot of Greed');
  ok(inZ(g, 0, 'gy', 'Pot of Greed'), 'MST destroyed the Set Pot of Greed');
  ok(hasOpt(g, 'a:' + on(g, 0, 'Fairy Guardian').u + ':'), 'Fairy Guardian effect offered');
  act(g, 0, 'Fairy Guardian'); settle(g, 'Pot of Greed');
  ok(inZ(g, 0, 'gy', 'Fairy Guardian') && E.name(g.p[0].deck[0]) === 'Pot of Greed', 'Guardian tributed, Pot of Greed at the bottom of the Deck');
  const g2 = duel({ board: [{ m: ['Fairy Guardian'], gy: ['Pot of Greed'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Fairy Guardian'), 'no Spell sent by the opponent this turn, no activation');
});
T('Fairy King Truesdale: in Defense Position your Plants gain 500 ATK/DEF', () => {
  const g = duel({ board: [{ m: [{ n: 'Fairy King Truesdale', pos: 'def' }, 'Lonefire Blossom', FILL], turn: 2 }, { m: ['Mystic Tomato'] }] });
  const lb = on(g, 0, 'Lonefire Blossom');
  ok(E.atk(g, lb) === 1000 && E.def(g, lb) === 1900, `Lonefire ${E.atk(g, lb)}/${E.def(g, lb)}`);
  ok(E.atk(g, on(g, 0, FILL)) === 2000 && E.atk(g, on(g, 1, 'Mystic Tomato')) === 1400, 'non-Plants and the opponent Plants unchanged');
  const g2 = duel({ board: [{ m: ['Fairy King Truesdale', 'Lonefire Blossom'], turn: 2 }, {}] });
  ok(E.atk(g2, on(g2, 0, 'Lonefire Blossom')) === 500, 'no bonus in Attack Position');
});
T('Fairy Meteor Crush: piercing', () => {
  const g = duel({ board: [{ hand: ['Fairy Meteor Crush'], m: [FILL], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }] }] });
  act(g, 0, 'Fairy Meteor Crush'); settle(g, FILL);
  bp(g); atkOn(g, 0, FILL, 'Sangan');
  ok(lp(g, 1) === 6600, `1400 piercing damage (${lp(g, 1)})`);
});
T('Fairy of the Spring: add an Equip Spell from the GY, it cannot be activated this turn', () => {
  const g = duel({ board: [{ hand: ['Fairy of the Spring'], m: [FILL], gy: ['Fairy Meteor Crush'], turn: 2 }, {}] });
  act(g, 0, 'Fairy of the Spring'); settle(g, 'Fairy Meteor Crush');
  ok(inZ(g, 0, 'hand', 'Fairy Meteor Crush'), 'Equip Spell added');
  ok(!canAct(g, 0, 'Fairy Meteor Crush'), 'cannot be activated this turn');
  const g2 = duel({ board: [{ hand: ['Fairy of the Spring'], gy: ['Pot of Greed'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Fairy of the Spring'), 'no Equip Spell in the GY, no activation');
});
T('Fairy Wind: destroys the other face-up Spells/Traps, 300 per card to each player', () => {
  const g = duel({ board: [{ st: ['Fairy Wind', { n: 'Final Attack Orders', pos: 'up' }], turn: 2 }, { st: [{ n: 'Fairy Box', pos: 'up' }, 'Mirror Force'] }] });
  act(g, 0, 'Fairy Wind'); settle(g);
  ok(inZ(g, 0, 'gy', 'Final Attack Orders') && inZ(g, 1, 'gy', 'Fairy Box') && inZ(g, 1, 'st', 'Mirror Force'), 'face-up cards destroyed, Set Mirror Force stays');
  ok(lp(g, 0) === 7400 && lp(g, 1) === 7400, `each took 600 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ st: ['Fairy Wind'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!canAct(g2, 0, 'Fairy Wind'), 'no other face-up Spell/Trap, no activation');
});
T('Familiar Knight: destroyed by battle, each player can Special Summon a Level 4 from hand', () => {
  const g = duel({ board: [{ hand: ['Blade Knight'], m: [FILL], turn: 2 }, { hand: ['Exiled Force'], m: ['Familiar Knight'] }] });
  bp(g); atkOn(g, 0, FILL, 'Familiar Knight', 'Blade Knight', 'Exiled Force');
  ok(on(g, 0, 'Blade Knight') && on(g, 1, 'Exiled Force'), 'both players Special Summoned a Level 4');
});
T('Final Attack Orders: face-up monsters to Attack Position, cannot change', () => {
  const g = duel({ board: [{ m: [{ n: 'Mystical Elf', pos: 'def' }, FILL], st: ['Final Attack Orders'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'def' }, { n: 'Sangan', pos: 'set' }] }] });
  act(g, 0, 'Final Attack Orders'); settle(g);
  ok(on(g, 0, 'Mystical Elf').pos === 'atk' && on(g, 1, 'Big Shield Gardna').pos === 'atk' && on(g, 1, 'Sangan').pos === 'set', 'face-up monsters in Attack, the face-down one untouched');
  ok(!hasOpt(g, 'pos:' + on(g, 0, FILL).u), 'Warwolf cannot change position');
});
T('Final Countdown: pay 2000, win after 20 turns', () => {
  const g = duel({ board: [{ hand: ['Final Countdown'], turn: 2 }, {}] });
  act(g, 0, 'Final Countdown'); settle(g);
  ok(lp(g, 0) === 6000, `paid 2000 (${lp(g, 0)})`);
  let turns = 0;
  for (; turns < 25 && g.winner == null; turns++) { try { endTurn(g); } catch (e) { break; } }
  ok(g.winner === 0 && g.turnNo === 21, `A wins at the end of the 20th turn (winner ${g.winner}, turn ${g.turnNo})`);
});
T('Final Destiny: discard 5, destroy all cards on the field', () => {
  const g = duel({ board: [{ hand: ['Final Destiny', FILL, FILL, FILL, FILL, 'Sangan'], m: [FILL], st: ['Mirror Force'], turn: 2 }, { m: ['Mystical Elf'], st: ['Magic Cylinder'] }] });
  act(g, 0, 'Final Destiny'); settle(g, 'Sangan', FILL, FILL, FILL, FILL);
  ok(cnt(g, 0, 'm') + cnt(g, 1, 'm') + cnt(g, 0, 'st') + cnt(g, 1, 'st') === 0, 'field cleared');
  ok(g.p[0].hand.length === 1, `5 discarded (hand ${g.p[0].hand.length})`);
  const g2 = duel({ board: [{ hand: ['Final Destiny', FILL, FILL], turn: 2 }, { m: ['Mystical Elf'] }] });
  ok(!canAct(g2, 0, 'Final Destiny'), 'fewer than 5 other cards, no activation');
});
T('Final Flame: 600 damage', () => {
  const g = duel({ board: [{ hand: ['Final Flame'], turn: 2 }, {}] });
  act(g, 0, 'Final Flame'); settle(g);
  ok(lp(g, 1) === 7400, `600 damage (${lp(g, 1)})`);
});
T('Final Ritual of the Ancients: Ritual Summons Reshef with 8+ Levels', () => {
  const g = duel({ board: [{ hand: ['Final Ritual of the Ancients', 'Reshef the Dark Being'], m: ['Dark Magician', 'Sangan'], deckTop: ['Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Final Ritual of the Ancients'); settle(g, 'Reshef', 'Dark Magician', 'Sangan');
  ok(on(g, 0, 'Reshef the Dark Being') && inZ(g, 0, 'gy', 'Dark Magician') && inZ(g, 0, 'gy', 'Sangan'), 'Reshef Ritual Summoned with 10 Levels (8 or more)');
  const g2 = duel({ board: [{ hand: ['Final Ritual of the Ancients', 'Reshef the Dark Being'], m: ['Curse of Dragon'], deckTop: ['Pot of Greed'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Final Ritual of the Ancients'), 'only 5 Levels, no activation');
});
T('Fire Ant Ascator: destroyed by battle, revives a Level 5 negated, sent to the GY in the End Phase', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Fire Ant Ascator'], gy: ['Cyber Dragon'] }] });
  bp(g); atkOn(g, 0, FILL, 'Fire Ant Ascator', 'Cyber Dragon');
  ok(on(g, 1, 'Cyber Dragon'), 'Cyber Dragon Special Summoned');
  endTurn(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon'), 'Cyber Dragon sent to the GY in the End Phase');
});
T('Fire Darts: only with no hand, 3 dice x 100', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { hand: [], st: ['Fire Darts'] }] });
  const fd = card(g, 1, 'Fire Darts');
  bp(g); choose(g, `atk:${on(g, 0, FILL).u}:d`); settle(g, 'a:' + fd.u + ':');
  const dmg = 8000 - lp(g, 0);
  ok(inZ(g, 1, 'gy', 'Fire Darts') && dmg >= 300 && dmg <= 1800 && dmg % 100 === 0, `A took ${dmg} from the dice`);
  const g2 = duel({ board: [{ m: [FILL], turn: 2 }, { hand: [FILL], st: ['Fire Darts'] }] });
  const fd2 = card(g2, 1, 'Fire Darts');
  bp(g2); choose(g2, `atk:${on(g2, 0, FILL).u}:d`);
  ok(!(g2.prompt && g2.prompt.p === 1 && hasOpt(g2, 'a:' + fd2.u + ':')), 'not offered with a card in hand');
});
T('Fire Princess: each LP gain inflicts 500', () => {
  const g = duel({ board: [{ hand: ['Goblin Thief'], m: ['Fire Princess'], turn: 2 }, {}] });
  act(g, 0, 'Goblin Thief'); settle(g);
  ok(lp(g, 0) === 8500 && lp(g, 1) === 7000, `A 8500, B 7000 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Fire Sorcerer: FLIP banishes 2 random hand cards, 800 damage', () => {
  const g = duel({ board: [{ hand: [FILL, 'Sangan'], m: [{ n: 'Fire Sorcerer', pos: 'set' }], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g);
  ok(cnt(g, 0, 'ban') === 2 && g.p[0].hand.length === 1 && lp(g, 1) === 7200, `2 banished, 800 damage (ban ${cnt(g, 0, 'ban')}, B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: [{ n: 'Fire Sorcerer', pos: 'set' }], turn: 2 }, {}] });
  choose(g2, 'flip:'); settle(g2);
  ok(cnt(g2, 0, 'ban') === 0 && lp(g2, 1) === 8000, 'with 1 card in hand, nothing happens');
});
T('Fire Trooper: when Summoned, send it to the GY for 1000 damage', () => {
  const g = duel({ board: [{ hand: ['Fire Trooper'], turn: 2 }, {}] });
  ns(g, 0, 'Fire Trooper');
  ok(inZ(g, 0, 'gy', 'Fire Trooper') && lp(g, 1) === 7000, `Trooper in the GY, B ${lp(g, 1)}`);
});
T('Flame Ghost: Polymerization with Skull Servant + Dissolverock', () => {
  const g = duel({ ex0: ['Flame Ghost'], board: [{ hand: ['Polymerization', 'Skull Servant', 'Dissolverock'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Flame Ghost', 'Skull Servant', 'Dissolverock', 'Attack');
  ok(on(g, 0, 'Flame Ghost') && inZ(g, 0, 'gy', 'Skull Servant') && inZ(g, 0, 'gy', 'Dissolverock'), 'Flame Ghost Fusion Summoned');
});
T('Flame Ogre: Normal Summon draws 1, cannot be Special Summoned', () => {
  const g = duel({ board: [{ hand: ['Flame Ogre'], m: [FILL, FILL], turn: 2 }, {}] });
  const h0 = g.p[0].hand.length;
  ns(g, 0, 'Flame Ogre', FILL, FILL);
  ok(on(g, 0, 'Flame Ogre') && g.p[0].hand.length === h0, `Ogre summoned and drew 1 (hand ${h0} -> ${g.p[0].hand.length})`);
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Flame Ogre'], turn: 2 }, {}] });
  if (canAct(g2, 0, 'Monster Reborn')) { act(g2, 0, 'Monster Reborn'); settle(g2, 'Flame Ogre'); }
  ok(!on(g2, 0, 'Flame Ogre'), 'Monster Reborn cannot summon it');
});
T('Flame Ruler: counts as 2 Tributes for a FIRE monster', () => {
  const g = duel({ board: [{ hand: ['Flame Ogre'], m: ['Flame Ruler'], turn: 2 }, {}] });
  ok(hasOpt(g, 'ns:' + card(g, 0, 'Flame Ogre').u), 'Level 7 FIRE Tribute Summon offered with only Flame Ruler');
  ns(g, 0, 'Flame Ogre', 'Flame Ruler');
  ok(on(g, 0, 'Flame Ogre') && inZ(g, 0, 'gy', 'Flame Ruler'), 'Flame Ogre summoned with Flame Ruler as 2 Tributes');
  const g2 = duel({ board: [{ hand: ['Dark Armed Dragon'], m: ['Flame Ruler'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Dark Armed Dragon').u), 'not for a non-FIRE monster');
});
T('Flame Spirit Ignis: tribute a face-up FIRE, 100 per FIRE in the GY', () => {
  const g = duel({ board: [{ m: ['Flame Spirit Ignis', 'Inferno'], gy: ['Volcanic Shell', 'Volcanic Shell'], turn: 2 }, {}] });
  act(g, 0, 'Flame Spirit Ignis'); settle(g, 'Inferno');
  ok(inZ(g, 0, 'gy', 'Inferno') && lp(g, 1) === 7700, `Inferno tributed, 300 damage (B ${lp(g, 1)})`);
});
T('Flint: -300 ATK, cannot attack or change position; moves to another monster when its monster is destroyed', () => {
  const g = duel({ board: [{ hand: ['Flint'], m: ['Dark Armed Dragon'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Flint'); settle(g, 'Cyber Dragon');
  const cd = on(g, 1, 'Cyber Dragon');
  ok(E.atk(g, cd) === 1800 && E.lib.forbid(g, { type: 'attack', c: cd }) && E.lib.forbid(g, { type: 'pos', c: cd }), `Cyber Dragon 1800, cannot attack or change position (${E.atk(g, cd)})`);
  bp(g); atkOn(g, 0, 'Dark Armed Dragon', 'Cyber Dragon', 'Dark Armed Dragon');
  const dad = on(g, 0, 'Dark Armed Dragon');
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && inZ(g, 0, 'st', 'Flint') && E.atk(g, dad) === 2500, `Flint moved to Dark Armed Dragon (${E.atk(g, dad)})`);
});
T('Flint Lock: takes Flint, is unaffected by it and not destroyed by battle; moves it to another monster', () => {
  const g = duel({ board: [{ hand: ['Flint'], m: ['Flint Lock'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Flint'); settle(g, 'Cyber Dragon');
  const fl = on(g, 0, 'Flint Lock'), cd = on(g, 1, 'Cyber Dragon'), fz = card(g, 0, 'Flint');
  act(g, 0, 'Flint Lock'); settle(g, 'Flint');
  ok(fz.equipTo === fl.u && E.atk(g, cd) === 2100 && E.atk(g, fl) === 1500, `Flint on Flint Lock, Lock keeps 1500 (${E.atk(g, fl)}), Cyber Dragon 2100`);
  bp(g); ok(canAtk(g, fl, cd), 'Flint Lock can still attack'); atkOn(g, 0, 'Flint Lock', 'Cyber Dragon');
  ok(on(g, 0, 'Flint Lock') && lp(g, 0) === 7400, `Flint Lock not destroyed by battle, A took 600 (${lp(g, 0)})`);
  choose(g, 'endbp'); settle(g);
  ok(hasOpt(g, 'a:' + fl.u + ':'), 'move effect offered in Main Phase 2');
  const o = g.prompt.opts.filter(x => x.key.startsWith('a:' + fl.u + ':'));
  E.act(g, [o[o.length - 1].key]); settle(g, 'Flint', 'Cyber Dragon');
  ok(fz.equipTo === cd.u && E.atk(g, cd) === 1800, `Flint moved to Cyber Dragon (${E.atk(g, cd)})`);
});
T('Flint Missile: destroy a monster equipped with Flint', () => {
  const g = duel({ board: [{ hand: ['Flint', 'Flint Missile'], turn: 2 }, { m: ['Cyber Dragon', 'Sangan'] }] });
  act(g, 0, 'Flint'); settle(g, 'Cyber Dragon');
  act(g, 0, 'Flint Missile'); settle(g, 'Cyber Dragon');
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && on(g, 1, 'Sangan'), 'Cyber Dragon destroyed, Sangan stays');
  ok(card(g, 0, 'Flint Missile') == null || !inZ(g, 0, 'st', 'Flint Missile'), 'Flint Missile left the field');
  const g2 = duel({ board: [{ hand: ['Flint Missile'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  ok(!canAct(g2, 0, 'Flint Missile'), 'no Flint equipped monster, no activation');
});
T('Forced Back: negate a Normal Summon and return it to the hand', () => {
  const g = duel({ board: [{ hand: ['Blade Knight'], turn: 2 }, { st: ['Forced Back'] }] });
  choose(g, 'ns:' + card(g, 0, 'Blade Knight').u); settle(g, 'a:' + card(g, 1, 'Forced Back').u + ':');
  ok(!on(g, 0, 'Blade Knight') && inZ(g, 0, 'hand', 'Blade Knight') && inZ(g, 1, 'gy', 'Forced Back'), 'Blade Knight back in the hand');
});
T('Forced Ceasefire: discard 1, no Traps this turn', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: [FILL], st: ['Forced Ceasefire'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Forced Ceasefire'); settle(g, 'Sangan');
  ok(inZ(g, 0, 'gy', 'Sangan'), 'discarded 1');
  const mf = card(g, 1, 'Mirror Force');
  bp(g); choose(g, `atk:${on(g, 0, FILL).u}:d`);
  let offered = false; for (let i = 0; i < 20 && g.prompt && g.prompt.type === 'respond'; i++) { if (hasOpt(g, 'a:' + mf.u + ':')) offered = true; E.act(g, ['pass']); }
  ok(!offered && lp(g, 1) === 6000, `Mirror Force not offered, attack went through (${lp(g, 1)})`);
});
T('Forced Requisition: each time you discard, the opponent discards the same number', () => {
  const g = duel({ board: [{ hand: ['Graceful Charity'], st: [{ n: 'Forced Requisition', pos: 'up' }], turn: 2 }, { hand: [FILL, FILL, FILL, FILL, FILL] }] });
  act(g, 0, 'Graceful Charity'); settle(g);
  ok(g.p[1].hand.length === 3, `B discarded 2 (hand ${g.p[1].hand.length})`);
});
T('Fusion Devourer: a Fusion Monster battling it has 0 ATK', () => {
  const g = duel({ board: [{ m: ['Fusion Devourer'], turn: 2 }, { m: ['Elemental HERO Flame Wingman'] }] });
  bp(g); atkOn(g, 0, 'Fusion Devourer', 'Elemental HERO Flame Wingman');
  ok(inZ(g, 1, 'gy', 'Elemental HERO Flame Wingman') && lp(g, 1) === 6600 && on(g, 0, 'Fusion Devourer'), `Wingman destroyed, B took 1400 (${lp(g, 1)})`);
});
T('Fusion Gate: Fusion Summon by banishing materials', () => {
  const g = duel({ ex0: ['Elemental HERO Flame Wingman'], board: [{ hand: ['Elemental HERO Avian', 'Elemental HERO Burstinatrix'], st: [], turn: 2 }, {}] });
  // put the Field Spell in via a hand activation
  const g0 = duel({ ex0: ['Elemental HERO Flame Wingman'], board: [{ hand: ['Fusion Gate', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'], turn: 2 }, {}] });
  act(g0, 0, 'Fusion Gate'); settle(g0);
  ok(g0.p[0].fz && E.name(g0.p[0].fz) === 'Fusion Gate', 'Fusion Gate on the field');
  act(g0, 0, 'Fusion Gate'); settle(g0, 'Flame Wingman', 'Avian', 'Burstinatrix', 'Attack');
  ok(on(g0, 0, 'Elemental HERO Flame Wingman') && inZ(g0, 0, 'ban', 'Elemental HERO Avian') && inZ(g0, 0, 'ban', 'Elemental HERO Burstinatrix'), 'Wingman Fusion Summoned, materials banished');
  void g;
});
T('Fusion Guard: negate a burn effect, send a random Fusion from your Extra Deck to the GY', () => {
  const g = duel({ ex1: ['Flame Ghost'], board: [{ hand: ['Ookazi'], turn: 2 }, { st: ['Fusion Guard'] }] });
  act(g, 0, 'Ookazi'); settle(g, 'a:' + card(g, 1, 'Fusion Guard').u + ':');
  ok(lp(g, 1) === 8000 && inZ(g, 1, 'gy', 'Flame Ghost') && inZ(g, 0, 'gy', 'Ookazi'), `Ookazi negated, Flame Ghost to the GY (B ${lp(g, 1)})`);
});
T('Fusion Recovery: add Polymerization and a used Fusion Material from the GY', () => {
  const g = duel({ ex0: ['Flame Ghost'], board: [{ hand: ['Polymerization', 'Skull Servant', 'Dissolverock', 'Fusion Recovery'], gy: ['Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Flame Ghost', 'Skull Servant', 'Dissolverock', 'Attack');
  act(g, 0, 'Fusion Recovery'); settle(g, 'Polymerization', 'Skull Servant');
  ok(inZ(g, 0, 'hand', 'Polymerization') && inZ(g, 0, 'hand', 'Skull Servant') && inZ(g, 0, 'gy', 'Fusion Recovery'), 'Polymerization and Skull Servant added');
  const g2 = duel({ board: [{ hand: ['Fusion Recovery'], gy: ['Polymerization', 'Sangan'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Fusion Recovery'), 'a monster never used as material does not qualify');
});
T('Fusion Sage: add Polymerization from the Deck', () => {
  const g = duel({ board: [{ hand: ['Fusion Sage'], deckTop: [FILL, FILL, 'Polymerization'], turn: 2 }, {}] });
  act(g, 0, 'Fusion Sage'); settle(g, 'Polymerization');
  ok(inZ(g, 0, 'hand', 'Polymerization'), 'Polymerization added');
  const g2 = duel({ board: [{ hand: ['Fusion Sage'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Fusion Sage'), 'no Polymerization in the Deck, no activation');
});
T('Fusion Sword Murasame Blade: Warrior only, +800, not destroyed by card effects', () => {
  const g = duel({ board: [{ hand: ['Fusion Sword Murasame Blade', 'Heavy Storm'], m: ['Blade Knight', FILL], turn: 2 }, {}] });
  act(g, 0, 'Fusion Sword Murasame Blade'); settle(g, 'Blade Knight');
  ok(E.atk(g, on(g, 0, 'Blade Knight')) === 2400, `Blade Knight ${E.atk(g, on(g, 0, 'Blade Knight'))}`);
  act(g, 0, 'Heavy Storm'); settle(g);
  ok(inZ(g, 0, 'st', 'Fusion Sword Murasame Blade'), 'survives Heavy Storm');
  const g2 = duel({ board: [{ hand: ['Fusion Sword Murasame Blade'], m: [FILL], turn: 2 }, { m: ['Mystical Elf'] }] });
  ok(!canAct(g2, 0, 'Fusion Sword Murasame Blade'), 'no Warrior, no activation');
});
T('Fusion Weapon: Level 6 or lower Fusion gains 1500 ATK/DEF', () => {
  const g = duel({ board: [{ hand: ['Fusion Weapon'], m: ['Flame Ghost'], turn: 2 }, {}] });
  act(g, 0, 'Fusion Weapon'); settle(g, 'Flame Ghost');
  const f = on(g, 0, 'Flame Ghost');
  ok(E.atk(g, f) === 2500 && E.def(g, f) === 2300, `Flame Ghost ${E.atk(g, f)}/${E.def(g, f)}`);
  const g2 = duel({ board: [{ hand: ['Fusion Weapon'], m: ['Gaia the Dragon Champion', FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Fusion Weapon'), 'a Level 7 Fusion or a non-Fusion cannot take it');
});

/* ---------------- Gaia / Giant ---------------- */
T('Gaia Plate: Special Summon by banishing 2 Rocks, halves its battle opponent', () => {
  const g = duel({ board: [{ hand: ['Gaia Plate the Earth Giant'], gy: ['Giant Soldier of Stone', 'Giant Soldier of Stone', 'Dissolverock'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  const gp = card(g, 0, 'Gaia Plate the Earth Giant');
  ok(hasOpt(g, 'sp:' + gp.u), 'Special Summon offered'); choose(g, 'sp:' + gp.u); settle(g, 'Giant Soldier of Stone', 'Giant Soldier of Stone', 'Attack');
  ok(on(g, 0, 'Gaia Plate the Earth Giant') && cnt(g, 0, 'ban') === 2, '2 Rocks banished');
  bp(g); atkOn(g, 0, 'Gaia Plate the Earth Giant', 'Cyber Dragon');
  ok(lp(g, 1) === 8000 - 1750, `damage uses 1050 for Cyber Dragon (B ${lp(g, 1)})`);
  ok(E.atk(g, on(g, 0, 'Gaia Plate the Earth Giant')) === 2800, 'Gaia keeps 2800');
});
T('Gaia Plate: Standby Phase, banish 1 Rock or send it to the GY', () => {
  const g = duel({ board: [{ m: ['Gaia Plate the Earth Giant'], gy: ['Giant Soldier of Stone'], turn: 2 }, {}] });
  settle(g, 'Giant Soldier of Stone');
  ok(on(g, 0, 'Gaia Plate the Earth Giant') && inZ(g, 0, 'ban', 'Giant Soldier of Stone'), 'Rock banished, Gaia stays');
  const g2 = duel({ board: [{ m: ['Gaia Plate the Earth Giant'], turn: 2 }, {}] });
  settle(g2);
  ok(inZ(g2, 0, 'gy', 'Gaia Plate the Earth Giant'), 'no Rock, Gaia sent to the GY');
});
T('Gaia Power: EARTH +500 ATK, -400 DEF', () => {
  const g = duel({ board: [{ hand: ['Gaia Power'], m: ['Gigantes'], turn: 2 }, { m: ['Mystical Elf', 'Exiled Force'] }] });
  act(g, 0, 'Gaia Power'); settle(g);
  const gi = on(g, 0, 'Gigantes'), ex = on(g, 1, 'Exiled Force'), el = on(g, 1, 'Mystical Elf');
  ok(E.atk(g, gi) === 2400 && E.def(g, gi) === 900 && E.atk(g, ex) === 1500 && E.atk(g, el) === 800, `Gigantes ${E.atk(g, gi)}/${E.def(g, gi)}, Exiled Force ${E.atk(g, ex)}, Elf ${E.atk(g, el)}`);
});
T('Gaia Soul: tribute up to 2 Pyros for +1000 each, pierces, destroyed in the End Phase', () => {
  const g = duel({ board: [{ m: ['Gaia Soul the Combustible Collective', 'Inferno', 'Volcanic Shell'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }] }] });
  act(g, 0, 'Gaia Soul the Combustible Collective'); settle(g, 'Inferno', 'Volcanic Shell');
  const gs = on(g, 0, 'Gaia Soul the Combustible Collective');
  ok(E.atk(g, gs) === 4000 && cnt(g, 0, 'm') === 1, `Gaia Soul ${E.atk(g, gs)}`);
  ok(!hasOpt(g, 'a:' + gs.u + ':'), 'once per turn');
  bp(g); atkOn(g, 0, 'Gaia Soul the Combustible Collective', 'Mystical Elf');
  ok(lp(g, 1) === 6000, `2000 piercing (${lp(g, 1)})`);
  endTurn(g);
  ok(inZ(g, 0, 'gy', 'Gaia Soul the Combustible Collective'), 'destroyed in the End Phase');
});
T('Gaia the Dragon Champion: Polymerization with Gaia The Fierce Knight + Curse of Dragon', () => {
  const g = duel({ ex0: ['Gaia the Dragon Champion'], board: [{ hand: ['Polymerization', 'Gaia The Fierce Knight', 'Curse of Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Gaia the Dragon Champion', 'Gaia The Fierce Knight', 'Curse of Dragon', 'Attack');
  ok(on(g, 0, 'Gaia the Dragon Champion'), 'Gaia the Dragon Champion Fusion Summoned');
});
T('Giant Axe Mummy: flips itself face-down; destroys a weaker attacker while face-down', () => {
  const g = duel({ board: [{ m: ['Giant Axe Mummy'], turn: 2 }, {}] });
  const gm = on(g, 0, 'Giant Axe Mummy');
  ok(hasOpt(g, 'a:' + gm.u + ':'), 'flip face-down offered'); act(g, 0, 'Giant Axe Mummy'); settle(g);
  ok(gm.pos === 'set', 'now face-down');
  const g2 = duel({ board: [{ m: ['Blade Knight', 'Dark Armed Dragon'], turn: 2 }, { m: [{ n: 'Giant Axe Mummy', pos: 'set' }] }] });
  bp(g2); atkOn(g2, 0, 'Blade Knight', 'Giant Axe Mummy');
  ok(inZ(g2, 0, 'gy', 'Blade Knight') && on(g2, 1, 'Giant Axe Mummy'), 'Blade Knight (1600) destroyed');
});
T('Giant Germ: battle death inflicts 500, then summons Germs from the Deck', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Giant Germ'], deckTop: ['Giant Germ', 'Giant Germ'] }] });
  bp(g); atkOn(g, 0, FILL, 'Giant Germ', 'Giant Germ', 'Giant Germ');
  ok(lp(g, 0) === 7500, `A took 500 (${lp(g, 0)})`);
  ok(cnt(g, 1, 'm', 'Giant Germ') === 2 && g.p[1].m.filter(Boolean).every(c => c.pos === 'atk'), `2 Germs summoned in Attack (${cnt(g, 1, 'm', 'Giant Germ')})`);
});
T('Giant Kozaky: destroyed without a face-up Kozaky, damage to its controller', () => {
  const g = duel({ board: [{ hand: ['Giant Kozaky'], turn: 2 }, {}] });
  ns(g, 0, 'Giant Kozaky'); settle(g);
  ok(inZ(g, 0, 'gy', 'Giant Kozaky') && lp(g, 0) === 5500, `destroyed, A took 2500 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Giant Kozaky'], m: ['Kozaky'], turn: 2 }, {}] });
  ns(g2, 0, 'Giant Kozaky'); settle(g2);
  ok(on(g2, 0, 'Giant Kozaky') && lp(g2, 0) === 8000, 'stays with Kozaky');
});
const goblinDef = (nm, nextTurnEnd) => T(nm + ': to Defense after attacking, locked', () => {
  const g = duel({ board: [{ m: [nm], turn: 2 }, {}] });
  const c = on(g, 0, nm);
  bp(g); choose(g, `atk:${c.u}:d`); settle(g); choose(g, 'endbp'); settle(g);
  ok(c.pos === 'def', nm + ' in Defense after the Battle Phase');
  endTurn(g); endTurn(g); // B's turn passes, A's next turn
  ok(!hasOpt(g, 'pos:' + c.u), 'cannot change position in the next turn');
  endTurn(g); endTurn(g);
  ok(hasOpt(g, 'pos:' + c.u), 'can change position two turns later');
  void nextTurnEnd;
});
goblinDef('Giant Orc'); goblinDef('Goblin Attack Force'); goblinDef('Goblin Elite Attack Force');
T('Giant Trap Hole: 2+ monsters Special Summoned at once, destroy all monsters', () => {
  const g = duel({ board: [{ hand: ['Scapegoat'], m: [FILL], turn: 2 }, { m: ['Mystical Elf'], st: ['Giant Trap Hole'] }] });
  act(g, 0, 'Scapegoat'); settle(g, 'a:' + card(g, 1, 'Giant Trap Hole').u + ':');
  ok(cnt(g, 0, 'm') === 0 && cnt(g, 1, 'm') === 0, 'all monsters destroyed');
  const g2 = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: ['Giant Trap Hole'] }] });
  const gth = card(g2, 1, 'Giant Trap Hole');
  choose(g2, 'sp:' + card(g2, 0, 'Cyber Dragon').u);
  let offered = false; for (let i = 0; i < 10 && g2.prompt && g2.prompt.type === 'respond'; i++) { if (hasOpt(g2, 'a:' + gth.u + ':')) offered = true; E.act(g2, ['pass']); }
  ok(!offered, 'not for a single Special Summon');
});
T('Gift Card: opponent gains 3000', () => {
  const g = duel({ board: [{ st: ['Gift Card'], turn: 2 }, {}] });
  act(g, 0, 'Gift Card'); settle(g);
  ok(lp(g, 1) === 11000 && lp(g, 0) === 8000, `B ${lp(g, 1)}`);
});
T('Gift of the Martyr: send a monster, another gains its ATK', () => {
  const g = duel({ board: [{ hand: ['Gift of the Martyr'], m: ['Cyber Dragon', FILL], turn: 2 }, {}] });
  act(g, 0, 'Gift of the Martyr'); settle(g, 'Cyber Dragon', FILL);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && E.atk(g, on(g, 0, FILL)) === 4100, `Warwolf ${on(g, 0, FILL) && E.atk(g, on(g, 0, FILL))}`);
  endTurn(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2000, 'back to 2000 next turn');
});
T('Gift of The Mystical Elf: 300 LP per monster on the field', () => {
  const g = duel({ board: [{ m: [FILL], st: ['Gift of The Mystical Elf'], turn: 2 }, { m: ['Sangan', 'Mystical Elf'] }] });
  act(g, 0, 'Gift of The Mystical Elf'); settle(g);
  ok(lp(g, 0) === 8900, `A ${lp(g, 0)}`);
});

/* ---------------- Goblins / Graceful ---------------- */
T('Goblin Black Ops: attacks directly over monsters, then Defense', () => {
  const g = duel({ board: [{ m: ['Goblin Black Ops'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  const c = on(g, 0, 'Goblin Black Ops');
  bp(g); ok(canAtk(g, c, null), 'direct attack offered'); choose(g, `atk:${c.u}:d`); settle(g);
  ok(lp(g, 1) === 6700, `1300 direct (${lp(g, 1)})`);
  choose(g, 'endbp'); settle(g);
  ok(c.pos === 'def', 'in Defense after the Battle Phase');
});
T('Goblin Decoy Squad: battle damage draws 1, then Defense', () => {
  const g = duel({ board: [{ m: ['Goblin Decoy Squad'], turn: 2 }, {}] });
  const c = on(g, 0, 'Goblin Decoy Squad'), h = g.p[0].hand.length;
  bp(g); choose(g, `atk:${c.u}:d`); settle(g);
  ok(g.p[0].hand.length === h + 1 && lp(g, 1) === 7000, `drew 1 (hand ${h} -> ${g.p[0].hand.length})`);
  choose(g, 'endbp'); settle(g);
  ok(c.pos === 'def', 'in Defense');
});
T('Goblin Fan: a Flip Summoned Level 2 or lower is destroyed, no Flip effect', () => {
  const g = duel({ board: [{ hand: [FILL], m: [{ n: 'Morphing Jar', pos: 'set' }], turn: 2 }, { hand: [FILL, FILL], st: [{ n: 'Goblin Fan', pos: 'up' }] }] });
  const h0 = g.p[0].hand.length, h1 = g.p[1].hand.length;
  choose(g, 'flip:'); settle(g);
  ok(inZ(g, 0, 'gy', 'Morphing Jar') && g.p[0].hand.length === h0 && g.p[1].hand.length === h1, 'Morphing Jar destroyed, hands untouched');
  const g2 = duel({ board: [{ m: [{ n: 'Fire Sorcerer', pos: 'set' }], turn: 2 }, { st: [{ n: 'Goblin Fan', pos: 'up' }] }] });
  choose(g2, 'flip:'); settle(g2);
  ok(on(g2, 0, 'Fire Sorcerer'), 'a Level 4 is not affected');
});
T('Goblin King: ATK/DEF 1000 per other Fiend on the field, cannot be attacked with another Fiend', () => {
  const g = duel({ board: [{ m: [FILL, 'Kuriboh'], turn: 2 }, { m: ['Goblin King', 'Sangan', { n: 'Night Assailant', pos: 'set' }] }] });
  const gk = on(g, 1, 'Goblin King');
  ok(E.atk(g, gk) === 2000 && E.def(g, gk) === 2000, `Goblin King ${E.atk(g, gk)}/${E.def(g, gk)} (Sangan and Kuriboh, not the face-down)`);
  bp(g);
  ok(!canAtk(g, on(g, 0, FILL), gk) && canAtk(g, on(g, 0, FILL), on(g, 1, 'Sangan')), 'Goblin King cannot be attacked, Sangan can');
});
T('Goblin of Greed: no discard costs', () => {
  const g = duel({ board: [{ hand: ['Lightning Vortex', 'Sangan', 'Graceful Charity'], turn: 2 }, { m: ['Goblin of Greed', 'Mystical Elf'] }] });
  ok(!canAct(g, 0, 'Lightning Vortex'), 'Lightning Vortex (discard cost) blocked');
  ok(canAct(g, 0, 'Graceful Charity'), 'Graceful Charity (discard in the effect) allowed');
});
T('Goblin Out of the Frying Pan: pay 500, negate a Spell and return it to the hand', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { st: ['Goblin Out of the Frying Pan'] }] });
  const h = g.p[0].hand.length;
  act(g, 0, 'Pot of Greed'); settle(g, 'a:' + card(g, 1, 'Goblin Out of the Frying Pan').u + ':');
  ok(lp(g, 1) === 7500 && inZ(g, 0, 'hand', 'Pot of Greed') && g.p[0].hand.length === h, `B paid 500, Pot of Greed back, no draws (hand ${g.p[0].hand.length})`);
});
T('Goblin Recon Squad: direct hit looks at a random hand card, a Spell is sent to the GY', () => {
  const g = duel({ board: [{ m: ['Goblin Recon Squad'], turn: 2 }, { hand: ['Pot of Greed'] }] });
  const c = on(g, 0, 'Goblin Recon Squad');
  bp(g); choose(g, `atk:${c.u}:d`); settle(g);
  ok(inZ(g, 1, 'gy', 'Pot of Greed'), 'Pot of Greed sent to the GY');
  choose(g, 'endbp'); settle(g);
  ok(c.pos === 'def', 'in Defense');
  const g2 = duel({ board: [{ m: ['Goblin Recon Squad'], turn: 2 }, { hand: ['Sangan'] }] });
  bp(g2); choose(g2, `atk:${on(g2, 0, 'Goblin Recon Squad').u}:d`); settle(g2);
  ok(inZ(g2, 1, 'hand', 'Sangan'), 'a monster stays in the hand');
});
T('Goblin Thief: 500 damage and gain 500', () => {
  const g = duel({ board: [{ hand: ['Goblin Thief'], turn: 2 }, {}] });
  act(g, 0, 'Goblin Thief'); settle(g);
  ok(lp(g, 0) === 8500 && lp(g, 1) === 7500, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
});
T('Graceful Charity: draw 3, discard 2', () => {
  const g = duel({ board: [{ hand: ['Graceful Charity'], turn: 2 }, {}] });
  const h = g.p[0].hand.length;
  act(g, 0, 'Graceful Charity'); settle(g);
  ok(g.p[0].hand.length === h - 1 + 3 - 2 && cnt(g, 0, 'gy') === 3, `hand ${h} -> ${g.p[0].hand.length}, GY ${cnt(g, 0, 'gy')}`);
});
T('Graceful Dice: your monsters gain the die x 100 ATK/DEF', () => {
  const g = duel({ board: [{ hand: ['Graceful Dice'], m: [FILL, 'Mystical Elf'], turn: 2 }, { m: ['Sangan'] }] });
  act(g, 0, 'Graceful Dice'); settle(g);
  const up = E.atk(g, on(g, 0, FILL)) - 2000, upE = E.def(g, on(g, 0, 'Mystical Elf')) - 2000;
  ok(up >= 100 && up <= 600 && up % 100 === 0 && upE === up && E.atk(g, on(g, 1, 'Sangan')) === 1000, `+${up} to both of A's monsters, B unchanged`);
  endTurn(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2000, 'until the end of the turn');
});
T('Graceful Revival: revive a Level 2 or lower in Attack; bound to it', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Graceful Revival'], gy: ['Kuriboh', 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Graceful Revival'); settle(g, 'Kuriboh');
  const k = on(g, 0, 'Kuriboh');
  ok(k && k.pos === 'atk' && inZ(g, 0, 'st', 'Graceful Revival'), 'Kuriboh revived in Attack, Revival stays');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Graceful Revival');
  ok(inZ(g, 0, 'gy', 'Graceful Revival') && inZ(g, 0, 'gy', 'Kuriboh'), 'Revival destroyed, Kuriboh destroyed');
  const g2 = duel({ board: [{ st: ['Graceful Revival'], gy: ['Sangan'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Graceful Revival'), 'Level 3 Sangan cannot be targeted');
});

// Goat: quick checks of the shared scripts of 'both' cards in the Goat card pool
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
  const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = E0; } });
  G('Graceful Charity, Goblin Thief, Fire Princess', () => {
    let g = gduel([{ hand: ['Graceful Charity'], turn: 2 }, {}]);
    const h = g.p[0].hand.length; act(g, 0, 'Graceful Charity'); settle(g);
    ok(g.p[0].hand.length === h, 'Goat: Graceful Charity draw 3 discard 2');
    g = gduel([{ hand: ['Goblin Thief'], m: ['Fire Princess'], turn: 2 }, {}]);
    act(g, 0, 'Goblin Thief'); settle(g);
    ok(lp(g, 0) === 8500 && lp(g, 1) === 7000, `Goat: Goblin Thief with Fire Princess (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  });
  G('Energy Drain and Gift of The Mystical Elf', () => {
    let g = gduel([{ m: ['Blade Knight'], st: ['Energy Drain'], turn: 2 }, { hand: [GF, GF, GF] }]);
    act(g, 0, 'Energy Drain'); settle(g, 'Blade Knight');
    ok(E.atk(g, on(g, 0, 'Blade Knight')) === 2200, 'Goat: Energy Drain +600');
    g = gduel([{ m: [GF], st: ['Gift of The Mystical Elf'], turn: 2 }, { m: [GF] }]);
    act(g, 0, 'Gift of The Mystical Elf'); settle(g);
    ok(lp(g, 0) === 8600, `Goat: Gift of The Mystical Elf +600 (${lp(g, 0)})`);
  });
  G('Giant Germ and Goblin Attack Force', () => {
    let g = gduel([{ m: [GF], turn: 2 }, { m: ['Giant Germ'], deckTop: ['Giant Germ'] }]);
    bp(g); atkOn(g, 0, GF, 'Giant Germ', 'Giant Germ');
    ok(lp(g, 0) === 7500 && on(g, 1, 'Giant Germ'), 'Goat: Giant Germ 500 and a new Germ');
    g = gduel([{ m: ['Goblin Attack Force'], turn: 2 }, {}]);
    const c = on(g, 0, 'Goblin Attack Force'); bp(g); choose(g, `atk:${c.u}:d`); settle(g); choose(g, 'endbp'); settle(g);
    ok(c.pos === 'def', 'Goat: Goblin Attack Force to Defense');
  });
  G('Flame Ghost and Gaia the Dragon Champion Fusions', () => {
    let g = gduel([{ hand: ['Polymerization', 'Skull Servant', 'Dissolverock'], turn: 2 }, {}], ['Flame Ghost']);
    act(g, 0, 'Polymerization'); settle(g, 'Flame Ghost', 'Skull Servant', 'Dissolverock', 'Attack');
    ok(on(g, 0, 'Flame Ghost'), 'Goat: Flame Ghost');
    g = gduel([{ hand: ['Polymerization', 'Gaia The Fierce Knight', 'Curse of Dragon'], turn: 2 }, {}], ['Gaia the Dragon Champion']);
    act(g, 0, 'Polymerization'); settle(g, 'Gaia the Dragon Champion', 'Gaia The Fierce Knight', 'Curse of Dragon', 'Attack');
    ok(on(g, 0, 'Gaia the Dragon Champion'), 'Goat: Gaia the Dragon Champion');
  });
  G('Fairy Box and Graceful Dice', () => {
    let g = gduel([{ m: [GF], turn: 2 }, { st: [{ n: 'Fairy Box', pos: 'up' }] }]);
    bp(g); choose(g, `atk:${on(g, 0, GF).u}:d`); settle(g, 'a:' + card(g, 1, 'Fairy Box').u + ':', 'Heads');
    ok(/coin/i.test(g.log.join('\n')), 'Goat: Fairy Box tosses a coin');
    g = gduel([{ hand: ['Graceful Dice'], m: [GF], turn: 2 }, {}]);
    act(g, 0, 'Graceful Dice'); settle(g);
    const up = E.atk(g, on(g, 0, GF)) - 1800;
    ok(up >= 100 && up <= 600, `Goat: Graceful Dice +${up}`);
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-08 review checks passed.');
process.exit(fails ? 1 : 0);
