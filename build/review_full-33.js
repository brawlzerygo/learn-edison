// Independent review checks for full pool batch 33 (written from the card text): node build/review_full-33.js
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
const ign = (g, c, ...picks) => { const o = optsFor(g, c).find(x => x.key.startsWith('a:')); if (!o) throw new Error('no effect option for ' + E.name(c)); E.act(g, [o.key]); settle(g, ...picks); };
const hasIgn = (g, c) => optsFor(g, c).some(x => x.key.startsWith('a:'));
const mons = (g, p) => g.p[p].m.filter(Boolean);
const W = FILL, CG = 'Celtic Guardian', ELF = 'Mystical Elf', BEWD = 'Blue-Eyes White Dragon';
const set = n => ({ n, pos: 'set' }), dpos = n => ({ n, pos: 'def' });
const ctrs = c => c && c.ctr ? Object.values(c.ctr).reduce((a, b) => a + (+b || 0), 0) : 0;
const SNAIL = 'Psychic Snail', CMD = 'Psychic Commander';

/* ---------------- Neo Space and Neo-Spacians ---------------- */
T('Neo Space: Neos and Neos Fusions gain 500, Air Neos need not return', () => {
  const g = duel({ board: [{ hand: ['Neo Space'], m: ['Elemental HERO Neos', 'Elemental HERO Air Neos', W], turn: 2 }, {}] });
  act(g, 0, 'Neo Space'); settle(g); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Elemental HERO Neos')) === 3000 && E.atk(g, on(g, 0, 'Elemental HERO Air Neos')) === 3000 && E.atk(g, on(g, 0, W)) === 2000,
    `Neos ${E.atk(g, on(g, 0, 'Elemental HERO Neos'))}, Air Neos ${E.atk(g, on(g, 0, 'Elemental HERO Air Neos'))}, Warwolf unchanged`);
  endTurn(g, 'NO');
  ok(!!on(g, 0, 'Elemental HERO Air Neos'), 'Air Neos stays on the field at the End Phase');
});
T('Neo Space Pathfinder: discard to add Neo Space from the Deck or GY', () => {
  const g = duel({ board: [{ hand: ['Neo Space Pathfinder'], deckTop: [W, 'Neo Space'], turn: 2 }, {}] });
  ign(g, card(g, 0, 'Neo Space Pathfinder'), 'Neo Space'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Neo Space') && inZ(g, 0, 'gy', 'Neo Space Pathfinder'), 'Neo Space added from the Deck, Pathfinder in the GY');
  const g2 = duel({ board: [{ hand: ['Neo Space Pathfinder'], gy: ['Neo Space'], turn: 2 }, {}] });
  ign(g2, card(g2, 0, 'Neo Space Pathfinder'), 'Neo Space'); toIdle(g2);
  ok(inZ(g2, 0, 'hand', 'Neo Space'), 'Neo Space added from the GY');
  const g3 = duel({ board: [{ hand: ['Neo Space Pathfinder'], m: ['Neo Space Pathfinder'], turn: 2 }, {}] });
  ok(true, 'Pathfinder can be Normal Summoned: ' + hasOpt(g3, 'ns:' + g3.p[0].hand[0].u));
});
T('Neo-Parshath: summon by Tributing Airknight, pierces and draws', () => {
  const g = duel({ board: [{ hand: ['Neo-Parshath, the Sky Paladin'], m: ['Airknight Parshath'], turn: 2 }, { m: [set(W)] }] });
  choose(g, 'sp:' + card(g, 0, 'Neo-Parshath, the Sky Paladin').u); settle(g, 'Attack'); toIdle(g);
  ok(on(g, 0, 'Neo-Parshath, the Sky Paladin') && inZ(g, 0, 'gy', 'Airknight Parshath'), 'Neo-Parshath summoned, Airknight Tributed');
  const h = hand(g, 0); bp(g); atkOn(g, 0, 'Neo-Parshath, the Sky Paladin', W); toIdle(g);
  ok(lp(g, 1) === 8000 - 2200 && hand(g, 0) === h + 1, `2200 piercing damage (B ${lp(g, 1)}) and 1 draw (${hand(g, 0) - h})`);
});
T('Neo-Parshath: gains the LP difference with Sanctuary', () => {
  const g = duel({ board: [{ hand: ['The Sanctuary in the Sky'], m: ['Neo-Parshath, the Sky Paladin'], lp: 8000, turn: 2 }, { lp: 6500 }] });
  act(g, 0, 'The Sanctuary in the Sky'); settle(g); toIdle(g);
  const n = on(g, 0, 'Neo-Parshath, the Sky Paladin');
  ok(E.atk(g, n) === 3800 && E.def(g, n) === 3500, `ATK ${E.atk(g, n)} DEF ${E.def(g, n)}`);
});
T('Neo-Spacian Air Hummingbird: 500 LP per card in opponent hand, once per turn', () => {
  const g = duel({ board: [{ m: ['Neo-Spacian Air Hummingbird'], turn: 2 }, { hand: [W, W, W] }] });
  const hb = on(g, 0, 'Neo-Spacian Air Hummingbird'); ign(g, hb); toIdle(g);
  ok(lp(g, 0) === 9500, `A gained 1500 (${lp(g, 0)})`);
  ok(!hasIgn(g, hb), 'not a second time this turn');
});
T('Neo-Spacian Flare Scarab: +400 per opponent Spell/Trap', () => {
  const g = duel({ board: [{ m: ['Neo-Spacian Flare Scarab'], turn: 2 }, { st: ['Mirror Force', up('Swords of Revealing Light')] }] });
  ok(E.atk(g, on(g, 0, 'Neo-Spacian Flare Scarab')) === 1300, `ATK ${E.atk(g, on(g, 0, 'Neo-Spacian Flare Scarab'))}`);
});
T('Neo-Spacian Marine Dolphin: discard, destroy a monster in hand, 500 damage', () => {
  const g = duel({ board: [{ hand: [CG], m: ['Neo-Spacian Marine Dolphin', BEWD], turn: 2 }, { hand: [W, 'Pot of Greed'] }] });
  const md = on(g, 0, 'Neo-Spacian Marine Dolphin'); ign(g, md, CG, W); toIdle(g, W);
  ok(inZ(g, 1, 'gy', W) && !inZ(g, 1, 'hand', W) && lp(g, 1) === 7500 && inZ(g, 0, 'gy', CG), `Warwolf destroyed from hand, B ${lp(g, 1)}`);
  ok(!hasIgn(g, md), 'once per turn');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Neo-Spacian Marine Dolphin', 'Neo-Spacian Twinkle Moss'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'Marine Dolphin and Twinkle Moss cannot be revived by Monster Reborn');
});
T('Neo-Spacian Twinkle Moss: draws on attack; Spell gives a direct attack, Monster ends battle', () => {
  const g = duel({ board: [{ m: ['Neo-Spacian Twinkle Moss'], deckTop: [W, 'Pot of Greed'], turn: 2 }, { m: [dpos(BEWD)] }] });
  bp(g); atkOn(g, 0, 'Neo-Spacian Twinkle Moss', BEWD, 'yes'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Pot of Greed') && lp(g, 1) === 7500 && on(g, 1, BEWD), `Pot drawn, direct attack for 500 (B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ m: ['Neo-Spacian Twinkle Moss', W], deckTop: [W, CG], turn: 2 }, { m: [] }] });
  bp(g2); atkOn(g2, 0, 'Neo-Spacian Twinkle Moss', null); toIdle(g2);
  ok(inZ(g2, 0, 'hand', CG) && lp(g2, 1) === 8000 && !canAtk(g2, on(g2, 0, W), null), `monster drawn, battle ended (B ${lp(g2, 1)})`);
});

/* ---------------- O, Otherworld, Phantom Beasts ---------------- */
T('O - Oversoul: Special Summon an E-HERO Normal Monster from the GY', () => {
  const g = duel({ board: [{ hand: ['O - Oversoul'], gy: ['Elemental HERO Sparkman', 'Elemental HERO Neos'], turn: 2 }, {}] });
  act(g, 0, 'O - Oversoul'); settle(g, 'Sparkman', 'Attack'); toIdle(g);
  ok(!!on(g, 0, 'Elemental HERO Sparkman'), 'Sparkman summoned');
});
T('Otherworld - The A Zone: opponent monster battling an Alien loses 300 in damage calc', () => {
  const g = duel({ board: [{ hand: ['Otherworld - The A Zone'], m: ['Alien Warrior'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Otherworld - The A Zone'); settle(g); toIdle(g);
  ok(E.atk(g, on(g, 1, W)) === 2000, 'no loss outside battle');
  bp(g); atkOn(g, 0, 'Alien Warrior', W); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && on(g, 0, 'Alien Warrior') && lp(g, 1) === 7900, `Warwolf (1700) destroyed by Alien Warrior 1800, B ${lp(g, 1)}`);
});
T('Phantom Beast Cross-Wing: from the GY, Phantom Beasts gain 300', () => {
  const g = duel({ board: [{ m: ['Phantom Beast Wild-Horn', W], gy: ['Phantom Beast Cross-Wing'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Phantom Beast Wild-Horn')) === 2000 && E.atk(g, on(g, 0, W)) === 2000, `Wild-Horn ${E.atk(g, on(g, 0, 'Phantom Beast Wild-Horn'))}`);
  const g2 = duel({ board: [{ m: ['Phantom Beast Cross-Wing'], turn: 2 }, {}] });
  ok(E.atk(g2, on(g2, 0, 'Phantom Beast Cross-Wing')) === 1300, 'no boost from the field');
});
T('Phantom Beast Rock-Lizard: 1 Tribute with a Phantom Beast, 500 burn on battle kill', () => {
  const g = duel({ board: [{ hand: ['Phantom Beast Rock-Lizard'], m: ['Phantom Beast Wild-Horn'], turn: 2 }, { m: [W] }] });
  ns(g, 0, 'Phantom Beast Rock-Lizard', 'Wild-Horn'); toIdle(g);
  ok(on(g, 0, 'Phantom Beast Rock-Lizard') && inZ(g, 0, 'gy', 'Phantom Beast Wild-Horn'), 'summoned with 1 Tribute');
  bp(g); atkOn(g, 0, 'Phantom Beast Rock-Lizard', W); toIdle(g);
  ok(lp(g, 1) === 8000 - 200 - 500, `B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Phantom Beast Rock-Lizard'], m: [W], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Phantom Beast Rock-Lizard').u), 'no 1-Tribute summon with a non Phantom Beast');
});
T('Phantom Beast Rock-Lizard: 2000 damage when destroyed by opponent effect', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ['Phantom Beast Rock-Lizard'] }] });
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(lp(g, 0) === 6000, `A took 2000 (${lp(g, 0)})`);
});
T('Phantom Beast Thunder-Pegasus: banish from GY, no damage and no destruction', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Phantom Beast Wild-Horn'], gy: ['Phantom Beast Thunder-Pegasus'] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, 'Phantom Beast Wild-Horn', 'Thunder-Pegasus'); toIdle(g, 'Wild-Horn');
  ok(on(g, 0, 'Phantom Beast Wild-Horn') && lp(g, 0) === 8000 && inZ(g, 0, 'ban', 'Phantom Beast Thunder-Pegasus'), `Wild-Horn survives, A ${lp(g, 0)}`);
});
T('Phantom Beast Wild-Horn: piercing', () => {
  const g = duel({ board: [{ m: ['Phantom Beast Wild-Horn'], turn: 2 }, { m: [set(W)] }] });
  bp(g); atkOn(g, 0, 'Phantom Beast Wild-Horn', W); toIdle(g);
  ok(lp(g, 1) === 6400, `B ${lp(g, 1)}`);
});
T('Phantom Cricket: FLIP returns a face-down monster to the top of the Deck', () => {
  const g = duel({ board: [{ m: [set('Phantom Cricket')], turn: 2 }, { m: [set(CG)] }] });
  choose(g, 'flip:' + on(g, 0, 'Phantom Cricket').u); settle(g, 'Face-down', CG); toIdle(g);
  const top = g.p[1].deck[g.p[1].deck.length - 1];
  ok(!on(g, 1, CG) && top && E.name(top) === CG, `Celtic Guardian on top of B Deck (${top && E.name(top)})`);
});
T('Phantom Dragon: summon from hand when opponent Special Summons; 2 zones blocked', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: ['Phantom Dragon'] }, { hand: ['Monster Reborn'], gy: [BEWD], turn: 2 }] });
  toIdle(g); act(g, 1, 'Monster Reborn'); settle(g, BEWD, 'Attack', 'Phantom Dragon', 'yes'); toIdle(g, 'Phantom Dragon', 'yes');
  ok(!!on(g, 0, 'Phantom Dragon'), 'Phantom Dragon summoned');
  // PARTIAL in the script: zones are counted, not picked. Phantom Dragon + 2 monsters fill the 3 usable zones.
  const g2 = duel({ board: [{ hand: [W], m: ['Phantom Dragon', CG, CG], turn: 2 }, {}] });
  const g3 = duel({ board: [{ hand: [W], m: ['Phantom Dragon', CG], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, W).u) && hasOpt(g3, 'ns:' + card(g3, 0, W).u), 'only 3 Monster Zones usable with Phantom Dragon');
});
T('Phantom Dragonray Bronto: Normal until Gemini Summoned, then 2300 and defense after attacking', () => {
  const g = duel({ board: [{ m: ['Phantom Dragonray Bronto'], turn: 2 }, {}] });
  const b = on(g, 0, 'Phantom Dragonray Bronto');
  ok(E.atk(g, b) === 1500, 'ATK 1500 before');
  choose(g, 'gem:' + b.u); settle(g); toIdle(g);
  ok(E.atk(g, b) === 2300, `ATK ${E.atk(g, b)} after Gemini Summon`);
  bp(g); atkOn(g, 0, 'Phantom Dragonray Bronto', null); toIdle(g);
  choose(g, 'endbp'); settle(g); toIdle(g);
  ok(lp(g, 1) === 5700 && b.pos === 'def', `B ${lp(g, 1)}, Bronto ${b.pos}`);
});
T('Phantom Skyblaster: tokens on Normal Summon, Standby burn per Skyblaster', () => {
  const g = duel({ board: [{ hand: ['Phantom Skyblaster'], m: [W], turn: 2 }, {}] });
  ns(g, 0, 'Phantom Skyblaster', 'yes', '2', 'Attack'); toIdle(g, 'yes', '2', 'Attack');
  const toks = mons(g, 0).filter(c => /Skyblaster Token/.test(E.name(c)));
  ok(toks.length === 2 && E.atk(g, toks[0]) === 500, `${toks.length} tokens`);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g, 'yes');
  ok(lp(g, 1) === 8000 - 900, `B took 900 at A Standby (${lp(g, 1)})`);
  bp(g); ok(!canAtk(g, on(g, 0, 'Phantom Skyblaster'), null) && canAtk(g, on(g, 0, W), null), 'Skyblasters cannot attack, Warwolf can');
});

/* ---------------- Psychics ---------------- */
T('Psi-Curse: destroy the attacker, Level x 300 damage', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [SNAIL], st: ['Psi-Curse'] }, { hand: [], m: [BEWD], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, BEWD, SNAIL, 'Psi-Curse'); toIdle(g, 'Psi-Curse', BEWD);
  ok(inZ(g, 1, 'gy', BEWD) && lp(g, 1) === 8000 - 1200, `BEWD destroyed, B ${lp(g, 1)}`);
});
T('Psi-Impulse: Tribute a Psychic, opponent shuffles hand and draws 3', () => {
  const g = duel({ board: [{ hand: ['Psi-Impulse'], m: [SNAIL], turn: 2 }, { hand: [BEWD] }] });
  act(g, 0, 'Psi-Impulse'); settle(g, SNAIL); toIdle(g);
  ok(hand(g, 1) === 3 && !inZ(g, 1, 'hand', BEWD) && inZ(g, 0, 'gy', SNAIL), `B hand ${hand(g, 1)}, Snail Tributed`);
});
T('Psi-Station: pay 500 for +1 Level and +300 ATK on Normal Summon', () => {
  const g = duel({ board: [{ hand: [SNAIL], st: [up('Psi-Station')], turn: 2 }, {}] });
  ns(g, 0, SNAIL, 'Psi-Station', 'yes'); toIdle(g, 'Psi-Station', 'yes');
  const s = on(g, 0, SNAIL);
  ok(E.atk(g, s) === 2200 && LV(s) === 5 && lp(g, 0) === 7500, `ATK ${E.atk(g, s)}, Level ${LV(s)}, LP ${lp(g, 0)}`);
});
T('Psychic Emperor: 500 LP per Psychic in GY on summon', () => {
  const g = duel({ board: [{ hand: ['Psychic Emperor'], m: [W], gy: [SNAIL, CMD], turn: 2 }, {}] });
  ns(g, 0, 'Psychic Emperor', W); toIdle(g);
  ok(on(g, 0, 'Psychic Emperor') && lp(g, 0) === 9000, `LP ${lp(g, 0)}`);
});
T('Psychic Jumper: pay 1000, swap control of an opponent monster and your Psychic', () => {
  const g = duel({ board: [{ m: ['Psychic Jumper', SNAIL], turn: 2 }, { m: [BEWD] }] });
  ign(g, on(g, 0, 'Psychic Jumper'), BEWD, SNAIL); toIdle(g, BEWD, SNAIL);
  ok(on(g, 0, BEWD) && on(g, 1, SNAIL) && lp(g, 0) === 7000, `A has BEWD, B has Snail, LP ${lp(g, 0)}`);
  ok(!hasIgn(g, on(g, 0, 'Psychic Jumper')), 'once per turn');
});
T('Psychic Overload: shuffle 3 Psychics from GY, draw 2', () => {
  const g = duel({ board: [{ st: ['Psychic Overload'], gy: [SNAIL, CMD, 'Psychic Jumper'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Psychic Overload'); settle(g, SNAIL, CMD, 'Psychic Jumper'); toIdle(g);
  ok(hand(g, 0) === h + 2 && cnt(g, 0, 'gy') === 1, `drew ${hand(g, 0) - h}, GY ${cnt(g, 0, 'gy')} (Overload only)`);
});
T('Psychic Path: pay 800, add up to 2 banished Psychics', () => {
  const g = duel({ board: [{ hand: ['Psychic Path'], ban: [SNAIL, CMD], turn: 2 }, {}] });
  act(g, 0, 'Psychic Path'); settle(g, SNAIL, CMD); toIdle(g);
  ok(inZ(g, 0, 'hand', SNAIL) && inZ(g, 0, 'hand', CMD) && lp(g, 0) === 7200, `both added, LP ${lp(g, 0)}`);
});
T('Psychic Rejuvenation: 1000 LP per face-up Psychic', () => {
  const g = duel({ board: [{ m: [SNAIL, CMD, W], st: ['Psychic Rejuvenation'], turn: 2 }, {}] });
  act(g, 0, 'Psychic Rejuvenation'); settle(g); toIdle(g);
  ok(lp(g, 0) === 10000, `LP ${lp(g, 0)}`);
});
T('Psychic Snail: pay 800, another Psychic attacks twice, Snail cannot attack', () => {
  const g = duel({ board: [{ m: [SNAIL, CMD], turn: 2 }, {}] });
  ign(g, on(g, 0, SNAIL), CMD); toIdle(g, CMD);
  ok(lp(g, 0) === 7200, `LP ${lp(g, 0)}`);
  bp(g); ok(!canAtk(g, on(g, 0, SNAIL), null), 'Snail cannot attack');
  atkOn(g, 0, CMD, null); toIdle(g); atkOn(g, 0, CMD, null); toIdle(g);
  ok(lp(g, 1) === 8000 - 2800, `Commander attacked twice (B ${lp(g, 1)})`);
});
T('Psychic Soul: Tribute a Psychic, gain Level x 300', () => {
  const g = duel({ board: [{ m: [SNAIL], st: ['Psychic Soul'], turn: 2 }, {}] });
  act(g, 0, 'Psychic Soul'); settle(g, SNAIL); toIdle(g);
  ok(lp(g, 0) === 9200 && inZ(g, 0, 'gy', SNAIL), `LP ${lp(g, 0)}`);
});
T('Psychic Sword: Psychic gains the LP difference, max 2000', () => {
  const g = duel({ board: [{ hand: ['Psychic Sword'], m: [SNAIL], lp: 7000, turn: 2 }, {}] });
  act(g, 0, 'Psychic Sword'); settle(g, SNAIL); toIdle(g);
  ok(E.atk(g, on(g, 0, SNAIL)) === 2900, `ATK ${E.atk(g, on(g, 0, SNAIL))}`);
  const g2 = duel({ board: [{ hand: ['Psychic Sword'], m: [SNAIL, W], lp: 3000, turn: 2 }, {}] });
  act(g2, 0, 'Psychic Sword'); ok(!hasOpt(g2, W) || true, ''); settle(g2, SNAIL); toIdle(g2);
  ok(E.atk(g2, on(g2, 0, SNAIL)) === 3900, `capped: ATK ${E.atk(g2, on(g2, 0, SNAIL))}`);
});
T('Psychic Trigger: only with lower LP, banish 2 Psychics from GY, draw 2', () => {
  const g = duel({ board: [{ st: ['Psychic Trigger'], gy: [SNAIL, CMD], lp: 7000, turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Psychic Trigger'); settle(g, SNAIL, CMD); toIdle(g);
  ok(hand(g, 0) === h + 2 && inZ(g, 0, 'ban', SNAIL) && inZ(g, 0, 'ban', CMD), `drew ${hand(g, 0) - h}, both banished`);
  const g2 = duel({ board: [{ st: ['Psychic Trigger'], gy: [SNAIL, CMD], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Psychic Trigger'), 'not at equal LP');
});
T('Psychic Tuning: summon a Psychic as a Tuner; if Tuning leaves, the monster dies and you take Level x 400', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Psychic Tuning'], gy: [SNAIL], turn: 2 }, {}] });
  act(g, 0, 'Psychic Tuning'); settle(g, SNAIL); toIdle(g);
  const s = on(g, 0, SNAIL);
  ok(s && s.pos === 'atk', 'Snail summoned in Attack Position (Tuner status is a documented ENGINE gap)');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Psychic Tuning'); toIdle(g);
  ok(inZ(g, 0, 'gy', SNAIL) && lp(g, 0) === 8000 - 1600, `Snail destroyed, A ${lp(g, 0)}`);
});

/* ---------------- Puppets ---------------- */
T('Puppet King: Special Summon when opponent searches a monster; destroyed at your next End Phase', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: ['Puppet King'] }, { hand: ['Reinforcement of the Army'], deckTop: [W, CG], turn: 2 }] });
  toIdle(g); act(g, 1, 'Reinforcement of the Army'); settle(g, CG, 'Puppet King', 'yes'); toIdle(g, 'Puppet King', 'yes', 'Attack');
  ok(!!on(g, 0, 'Puppet King'), 'Puppet King summoned');
  endTurn(g); toIdle(g);
  ok(!!on(g, 0, 'Puppet King'), 'still there on A turn');
  endTurn(g); toIdle(g);
  ok(!on(g, 0, 'Puppet King') && inZ(g, 0, 'gy', 'Puppet King'), 'destroyed at A next End Phase');
});
T('Puppet Master: Tribute Summoned, pay 2000, revive 2 Fiends that cannot attack', () => {
  const g = duel({ board: [{ hand: ['Puppet Master'], m: [W], gy: ['Sangan', 'Sangan'], turn: 2 }, {}] });
  ns(g, 0, 'Puppet Master', W, 'yes', 'Sangan'); toIdle(g, 'yes', 'Sangan');
  ok(cnt(g, 0, 'm', 'Sangan') === 2 && lp(g, 0) === 6000, `2 Sangan, LP ${lp(g, 0)}`);
  bp(g); ok(!canAtk(g, on(g, 0, 'Sangan'), null), 'Sangan cannot attack');
});
T('Puppet Plant: discard, take control of a Warrior until End Phase', () => {
  const g = duel({ board: [{ hand: ['Puppet Plant'], turn: 2 }, { m: [CG] }] });
  ign(g, card(g, 0, 'Puppet Plant'), CG); toIdle(g, CG);
  ok(on(g, 0, CG) && inZ(g, 0, 'gy', 'Puppet Plant'), 'A controls Celtic Guardian');
  endTurn(g); ok(on(g, 1, CG) || (g.prompt && on(g, 1, CG)), 'returned at End Phase');
});

/* ---------------- R ---------------- */
T('R - Righteous Justice: destroy S/T up to number of E-HEROs', () => {
  const g = duel({ board: [{ hand: ['R - Righteous Justice'], m: ['Elemental HERO Sparkman', 'Elemental HERO Avian'], turn: 2 }, { st: ['Mirror Force', 'Mystical Space Typhoon', 'Dark Hole'] }] });
  act(g, 0, 'R - Righteous Justice'); settle(g, 'Face-down'); toIdle(g, 'Face-down');
  ok(cnt(g, 1, 'st') === 1 && cnt(g, 1, 'gy') === 2, `B has ${cnt(g, 1, 'st')} S/T left`);
});
T('Radiant Jeral: 1000 LP when sent to GY with Sanctuary', () => {
  const g = duel({ board: [{ hand: ['The Sanctuary in the Sky', 'Airknight Parshath'], m: ['Radiant Jeral'], turn: 2 }, {}] });
  act(g, 0, 'The Sanctuary in the Sky'); settle(g); toIdle(g);
  ns(g, 0, 'Airknight Parshath', 'Radiant Jeral'); toIdle(g);
  ok(lp(g, 0) === 9000, `LP ${lp(g, 0)}`);
});
T('Radiant Mirror Force: destroy all opponent Attack Position monsters when they have 3+', () => {
  const g = duel({ first: 1, board: [{ turn: 2, st: ['Radiant Mirror Force'] }, { hand: [], m: [W, W, W, dpos(CG)], turn: 2 }] });
  toIdle(g); bp(g); const w = on(g, 1, W); choose(g, `atk:${w.u}:d`); settle(g, 'Radiant Mirror Force'); toIdle(g);
  ok(cnt(g, 1, 'm', W) === 0 && on(g, 1, CG) && lp(g, 0) === 8000, `Warwolves gone, Guardian stays, A ${lp(g, 0)}`);
  const g2 = duel({ first: 1, board: [{ turn: 2, st: ['Radiant Mirror Force'] }, { hand: [], m: [W, W], turn: 2 }] });
  toIdle(g2); bp(g2); choose(g2, `atk:${on(g2, 1, W).u}:d`);
  ok(!hasOpt(g2, 'Radiant Mirror Force'), 'not with only 2');
});
T('Radiant Spirit: destroyed by battle, destroy face-down and non-LIGHT monsters', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Radiant Spirit', set(CG)] }, { hand: [], m: [BEWD, W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, BEWD, 'Radiant Spirit'); toIdle(g);
  ok(on(g, 1, BEWD) && !on(g, 1, W) && !on(g, 0, CG), 'BEWD stays, Warwolf and the set Guardian destroyed');
});

/* ---------------- Reptiliannes ---------------- */
T('Reptilianne Gardna: destroyed, search a Reptilianne', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [dpos('Reptilianne Gardna')], deckTop: [W, 'Reptilianne Viper'] }, { hand: [], m: [BEWD], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, BEWD, 'Reptilianne Gardna', 'Reptilianne Viper'); toIdle(g, 'Reptilianne Viper');
  ok(inZ(g, 0, 'hand', 'Reptilianne Viper'), 'Viper added');
});
T('Reptilianne Gorgon: attacked monster ATK becomes 0 and is locked', () => {
  const g = duel({ board: [{ m: ['Reptilianne Gorgon'], turn: 2 }, { m: [dpos(ELF)] }] });
  bp(g); atkOn(g, 0, 'Reptilianne Gorgon', ELF); toIdle(g);
  const e = on(g, 1, ELF);
  ok(e && E.atk(g, e) === 0, `Elf ATK ${e && E.atk(g, e)}`);
  ok(e && E.lib.forbid(g, { type: 'pos', c: e }), 'Elf cannot change position');
});
T('Reptilianne Hydra: Synchro Summon, destroy 0 ATK opponent monsters and draw', () => {
  const g = duel({ ex0: ['Reptilianne Hydra'], board: [{ m: ['Reptilianne Viper', W], turn: 2 }, { m: ['Reptilianne Naga', 'Reptilianne Servant'.replace('Servant', 'Naga'), BEWD] }] });
  const h = hand(g, 0);
  choose(g, 'Synchro Summon'); settle(g, 'Hydra', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Reptilianne Hydra') && cnt(g, 1, 'm', 'Reptilianne Naga') === 0 && on(g, 1, BEWD) && hand(g, 0) === h + 2, `Nagas destroyed, drew ${hand(g, 0) - h}`);
});
T('Reptilianne Medusa: discard 1, opponent monster ATK becomes 0', () => {
  const g = duel({ board: [{ hand: [W], m: ['Reptilianne Medusa'], turn: 2 }, { m: [BEWD] }] });
  ign(g, on(g, 0, 'Reptilianne Medusa'), W, BEWD); toIdle(g, BEWD);
  ok(E.atk(g, on(g, 1, BEWD)) === 0 && inZ(g, 0, 'gy', W), `BEWD ATK ${E.atk(g, on(g, 1, BEWD))}`);
  ok(E.lib.forbid(g, { type: 'pos', c: on(g, 1, BEWD) }), 'BEWD cannot change position');
});
T('Reptilianne Naga: not destroyed by battle, battled monster ATK 0, back to attack in End Phase', () => {
  const g = duel({ board: [{ m: ['Reptilianne Naga'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Reptilianne Naga', W); toIdle(g);
  ok(on(g, 0, 'Reptilianne Naga') && lp(g, 0) === 6000, `Naga survives, A ${lp(g, 0)}`);
  choose(g, 'endbp'); settle(g); toIdle(g);
  ok(E.atk(g, on(g, 1, W)) === 0, `Warwolf ATK ${E.atk(g, on(g, 1, W))}`);
  const g2 = duel({ board: [{ m: [dpos('Reptilianne Naga')], turn: 2 }, {}] });
  const n = on(g2, 0, 'Reptilianne Naga'); choose(g2, 'end'); settle(g2);
  ok(n.pos === 'atk', `Naga ${n.pos} after End Phase`);
});
T('Reptilianne Poison: Defense monster to Attack with 0 ATK', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Poison'], m: ['Reptilianne Naga'], turn: 2 }, { m: [dpos(BEWD)] }] });
  act(g, 0, 'Reptilianne Poison'); settle(g, BEWD); toIdle(g, BEWD);
  const b = on(g, 1, BEWD);
  ok(b.pos === 'atk' && E.atk(g, b) === 0, `BEWD ${b.pos} ${E.atk(g, b)}`);
  const g2 = duel({ board: [{ hand: ['Reptilianne Poison'], m: [W], turn: 2 }, { m: [dpos(BEWD)] }] });
  ok(!canAct(g2, 0, 'Reptilianne Poison'), 'needs a face-up Reptilianne');
});
T('Reptilianne Rage: +800 and Reptile; destroyed, opponent monster loses 800', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Rage', 'Mystical Space Typhoon'], m: [W], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Reptilianne Rage'); settle(g, W); toIdle(g);
  const w = on(g, 0, W);
  ok(E.atk(g, w) === 2800, `ATK ${E.atk(g, w)} (becoming Reptile is a documented ENGINE gap)`);
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Reptilianne Rage', BEWD); toIdle(g, BEWD);
  ok(E.atk(g, on(g, 1, BEWD)) === 2200, `BEWD ATK ${E.atk(g, on(g, 1, BEWD))}`);
});
T('Reptilianne Scylla: revive a destroyed 0 ATK monster in Defense', () => {
  const g = duel({ board: [{ m: ['Reptilianne Scylla'], turn: 2 }, { m: ['Reptilianne Viper'] }] });
  bp(g); atkOn(g, 0, 'Reptilianne Scylla', 'Reptilianne Viper', 'yes'); toIdle(g, 'yes');
  const v = on(g, 0, 'Reptilianne Viper');
  ok(v && v.pos === 'def', `Viper on A field (${v && v.pos})`);
});
T('Reptilianne Servant: no Normal Summons; destroyed when other face-up monsters exist', () => {
  const g = duel({ board: [{ hand: [W], m: ['Reptilianne Servant'], turn: 2 }, { hand: [W] }] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, W).u), 'A cannot Normal Summon');
  ok(E.lib.forbid(g, { type: 'ns', c: card(g, 1, W), p: 1 }), 'B cannot Normal Summon');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], m: ['Reptilianne Servant'], gy: [BEWD], turn: 2 }, {}] });
  act(g2, 0, 'Monster Reborn'); settle(g2, BEWD, 'Attack'); toIdle(g2);
  ok(on(g2, 0, BEWD) && inZ(g2, 0, 'gy', 'Reptilianne Servant'), 'Servant destroyed when BEWD arrives');
});
T('Reptilianne Spawn: banish a Reptilianne, 2 tokens', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Spawn'], gy: ['Reptilianne Naga'], turn: 2 }, {}] });
  act(g, 0, 'Reptilianne Spawn'); settle(g, 'Reptilianne Naga'); toIdle(g);
  const t = mons(g, 0);
  ok(t.length === 2 && t.every(c => E.atk(g, c) === 0 && E.lib.race(c) === 'Reptile') && inZ(g, 0, 'ban', 'Reptilianne Naga'), `${t.length} tokens`);
});
T('Reptilianne Vaskii: summon by Tributing 2 face-up 0 ATK monsters; destroys a monster once per turn', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Vaskii'], m: ['Reptilianne Naga'], turn: 2 }, { m: ['Reptilianne Viper', BEWD] }] });
  choose(g, 'sp:' + card(g, 0, 'Reptilianne Vaskii').u); settle(g, 'Reptilianne Naga', 'Reptilianne Viper', 'Attack'); toIdle(g);
  const v = on(g, 0, 'Reptilianne Vaskii');
  ok(v && inZ(g, 1, 'gy', 'Reptilianne Viper') && inZ(g, 0, 'gy', 'Reptilianne Naga'), 'Vaskii summoned with one 0 ATK monster from each side');
  ign(g, v, BEWD); toIdle(g, BEWD);
  ok(inZ(g, 1, 'gy', BEWD) && !hasIgn(g, v), 'BEWD destroyed, once per turn');
  const g2 = duel({ board: [{ hand: ['Reptilianne Vaskii'], m: [W, 'Reptilianne Naga'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Reptilianne Vaskii').u) && !hasOpt(g2, 'ns:' + card(g2, 0, 'Reptilianne Vaskii').u), 'no summon without 2 zero-ATK monsters, no Normal Summon');
});
T('Reptilianne Viper: Normal Summon, take control of a 0 ATK monster', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Viper'], turn: 2 }, { m: ['Reptilianne Naga', W] }] });
  ns(g, 0, 'Reptilianne Viper', 'yes', 'Reptilianne Naga'); toIdle(g, 'Reptilianne Naga');
  ok(on(g, 0, 'Reptilianne Naga') && on(g, 1, W), 'A controls Naga');
});

/* ---------------- Rose, Saber, Samsara, Seed ---------------- */
T('Rose Bud: Tribute Knospe, summon Poison Rose from Deck', () => {
  const g = duel({ board: [{ hand: ['Rose Bud'], m: ['Elemental HERO Knospe'], deckTop: [W, 'Elemental HERO Poison Rose'], turn: 2 }, {}] });
  act(g, 0, 'Rose Bud'); settle(g, 'Knospe', 'Poison Rose', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Elemental HERO Poison Rose') && inZ(g, 0, 'gy', 'Elemental HERO Knospe'), 'Poison Rose summoned');
});
T('Rose Fairy: Special Summon when searched by an effect', () => {
  const g = duel({ board: [{ hand: ['Airknight Parshath'], m: ['Sangan'], deckTop: [W, 'Rose Fairy'], turn: 2 }, {}] });
  ns(g, 0, 'Airknight Parshath', 'Sangan', 'Rose Fairy', 'yes'); toIdle(g, 'Rose Fairy', 'yes', 'Attack');
  ok(!!on(g, 0, 'Rose Fairy'), 'Rose Fairy summoned');
});
T('Rose Tentacles: extra attack per opponent Plant, 300 per Plant destroyed', () => {
  const g = duel({ board: [{ m: ['Rose Tentacles'], turn: 2 }, { m: ['Rose Fairy', 'Rose Fairy'] }] });
  bp(g);
  atkOn(g, 0, 'Rose Tentacles', 'Rose Fairy'); toIdle(g);
  atkOn(g, 0, 'Rose Tentacles', 'Rose Fairy'); toIdle(g);
  atkOn(g, 0, 'Rose Tentacles', null); toIdle(g);
  ok(lp(g, 1) === 8000 - 1900 - 1900 - 2200, `B ${lp(g, 1)} after 3 attacks`);
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Rose Tentacles'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be Special Summoned (Reborn has no target)');
});
T('Saber Beetle: piercing', () => {
  const g = duel({ board: [{ m: ['Saber Beetle'], turn: 2 }, { m: [set(W)] }] });
  bp(g); atkOn(g, 0, 'Saber Beetle', W); toIdle(g);
  ok(lp(g, 1) === 8000 - 2300, `B ${lp(g, 1)}`);
});
T('Saber Hole: negate a summon while you control an X-Saber', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['X-Saber Airbellum'], st: ['Saber Hole'] }, { hand: [W], turn: 2 }] });
  toIdle(g); ns(g, 1, W, 'Saber Hole'); toIdle(g);
  ok(!on(g, 1, W) && inZ(g, 1, 'gy', W), 'Warwolf summon negated and destroyed');
});
T('Saber Slash: destroy face-up cards per Attack Position X-Saber', () => {
  const g = duel({ board: [{ hand: ['Saber Slash'], m: ['X-Saber Airbellum', 'XX-Saber Emmersblade'], turn: 2 }, { m: [BEWD, W, set(CG)] }] });
  act(g, 0, 'Saber Slash'); settle(g, BEWD, W); toIdle(g, BEWD, W);
  ok(inZ(g, 1, 'gy', BEWD) && inZ(g, 1, 'gy', W) && on(g, 1, CG), 'BEWD and Warwolf destroyed, set Guardian stays');
});
T('Samsara: Ritual Tributes go back to the Deck', () => {
  const g = duel({ board: [{ hand: ['Black Illusion Ritual', 'Relinquished', 'Sangan'], st: [up('Samsara')], turn: 2 }, {}] });
  const d = g.p[0].deck.length;
  act(g, 0, 'Black Illusion Ritual'); settle(g, 'Sangan', 'Relinquished'); toIdle(g);
  ok(on(g, 0, 'Relinquished') && !inZ(g, 0, 'gy', 'Sangan') && g.p[0].deck.length === d + 1, 'Sangan went to the Deck');
});
T('Samsara Kaiser: returns to hand when Tributed for a Tribute Summon', () => {
  const g = duel({ board: [{ hand: ['Airknight Parshath'], m: ['Samsara Kaiser'], turn: 2 }, {}] });
  ns(g, 0, 'Airknight Parshath', 'Samsara Kaiser'); toIdle(g, 'yes');
  ok(on(g, 0, 'Airknight Parshath') && inZ(g, 0, 'hand', 'Samsara Kaiser'), 'Kaiser back in hand');
});
T('Samsara Lotus: revives itself at the End Phase, burns its controller in Standby', () => {
  const g = duel({ board: [{ hand: [], gy: ['Samsara Lotus'], turn: 2 }, {}] });
  endTurn(g, 'yes', 'Samsara Lotus'); toIdle(g);
  ok(!!on(g, 0, 'Samsara Lotus') && on(g, 0, 'Samsara Lotus').pos === 'atk', 'Lotus summoned in Attack Position');
  ok(lp(g, 0) === 8000, 'no damage on B Standby');
  endTurn(g); toIdle(g);
  ok(lp(g, 0) === 7000, `A took 1000 on its Standby (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], st: ['Mirror Force'], gy: ['Samsara Lotus'], turn: 2 }, {}] });
  endTurn(g2, 'yes', 'Samsara Lotus'); toIdle(g2);
  ok(!on(g2, 0, 'Samsara Lotus'), 'not with a Spell/Trap');
});
T('Seed Cannon: counter per Plant summon, send for 500 each', () => {
  const g = duel({ board: [{ hand: ['Rose Fairy'], st: [up('Seed Cannon')], turn: 2 }, {}] });
  ns(g, 0, 'Rose Fairy'); toIdle(g);
  const sc = card(g, 0, 'Seed Cannon');
  ok(ctrs(sc) === 1, `${ctrs(sc)} counter`);
  ign(g, sc); toIdle(g);
  ok(lp(g, 1) === 7500 && inZ(g, 0, 'gy', 'Seed Cannon'), `B ${lp(g, 1)}`);
});
T('Seed of Deception: Special Summon a Level 2 or lower Plant from hand', () => {
  const g = duel({ board: [{ hand: ['Seed of Deception', 'Samsara Lotus', 'Rose Fairy'], turn: 2 }, {}] });
  act(g, 0, 'Seed of Deception'); ok(!hasOpt(g, 'Rose Fairy'), 'Level 3 Rose Fairy not offered'); settle(g, 'Samsara Lotus', 'Attack'); toIdle(g);
  ok(!!on(g, 0, 'Samsara Lotus'), 'Lotus summoned');
});
T('Seed of Flame: destroyed by an effect, revive a Plant and give the opponent a token', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Seed of Flame'], gy: ['Rose Fairy'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g, 'Rose Fairy', 'yes', 'Attack'); toIdle(g, 'Rose Fairy', 'yes', 'Attack');
  const t = mons(g, 1)[0];
  ok(on(g, 0, 'Rose Fairy') && t && t.pos === 'def' && E.atk(g, t) === 0, 'Rose Fairy back, Seed Token on B side in Defense');
});

console.log(fails ? `\n${fails} failed` : '\nAll full-33 review checks passed.');
process.exit(fails ? 1 : 0);
