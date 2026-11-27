// Independent review checks for full pool batch 38 (written from the card text): node build/review_full-38.js
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
const endTurn = (g, ...picks) => { if (g.prompt && g.prompt.opts.some(x => x.key === 'endbp')) { E.act(g, ['endbp']); settle(g, ...picks); } if (!g.prompt || !g.prompt.opts.some(x => x.key === 'end')) throw new Error('no end option'); E.act(g, ['end']); settle(g, ...picks); };
const ns = (g, p, n, ...picks) => { choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u); settle(g, ...picks); };
const noSummon = (g, c) => !hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && !hasOpt(g, 'sp:' + c.u);
const lp = (g, p) => g.p[p].lp;
const LV = c => E.lib.lv(c);
const up = n => ({ n, pos: 'up' });
const idle = g => g.prompt && g.prompt.type === 'idle';
const toIdle = (g, ...picks) => { for (let i = 0; i < 10 && g.prompt && !idle(g) && g.prompt.type !== 'battle'; i++) settle(g, ...picks); };
const optsFor = (g, c) => g.prompt ? g.prompt.opts.filter(x => x.u === c.u || x.key.split(':')[1] === String(c.u)) : [];
const hand = (g, p) => g.p[p].hand.length;
const W = FILL, CG = 'Celtic Guardian', ELF = 'Mystical Elf', BEWD = 'Blue-Eyes White Dragon';
const set = n => ({ n, pos: 'set' }), dpos = n => ({ n, pos: 'def' });
const ign = (g, c, ...picks) => { const o = optsFor(g, c).find(x => x.key.startsWith('a:')); if (!o) throw new Error('no effect option for ' + E.name(c)); E.act(g, [o.key]); settle(g, ...picks); };
const hasIgn = (g, c) => optsFor(g, c).some(x => x.key.startsWith('a:'));
const DD = 'Destiny HERO - Diamond Dude', MPZ = 'Mystic Plasma Zone', GP = 'Gaia Power', WHALE = 'Fortress Whale', OATH = "Fortress Whale's Oath";
const mons = (g, p) => g.p[p].m.filter(Boolean);
// play turns until it is player p's Main Phase again (passing everything, answering prompts with picks)
const nextMain = (g, p, ...picks) => { for (let i = 0; i < 6; i++) { toIdle(g, ...picks); if (g.tp === p && g.phase === 'main1' && idle(g) && i > 0) return; endTurn(g, ...picks); } };
const turns = (g, n, ...picks) => { for (let i = 0; i < n; i++) { toIdle(g, ...picks); endTurn(g, ...picks); } toIdle(g, ...picks); };

const ctrSum = c => Object.values(c.ctr || {}).reduce((a, b) => a + (+b || 0), 0);
const turnDraws = 0; void turnDraws;

T('Eternal Dread: 2 Clock Counters on Clock Tower Prison', () => {
  const g = duel({ board: [{ hand: ['Clock Tower Prison'], st: ['Eternal Dread'], turn: 2 }, {}] });
  act(g, 0, 'Clock Tower Prison'); settle(g); toIdle(g);
  const ctp = g.p[0].fz; ok(ctp && E.name(ctp) === 'Clock Tower Prison', 'Clock Tower Prison on the field');
  act(g, 0, 'Eternal Dread'); settle(g); toIdle(g);
  ok(ctp && ((ctp.flags.clock || 0) === 2 || E.lib.ctr(ctp, 'clock') === 2), `2 Clock Counters (${ctp && ctp.flags.clock}/${ctp && E.lib.ctr(ctp, 'clock')})`);
});
T('Etoile Cyber: +500 on a direct attack only', () => {
  const g = duel({ board: [{ hand: [], m: ['Etoile Cyber'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Etoile Cyber', null); toIdle(g);
  ok(lp(g, 1) === 6300, `B took 1700 (${lp(g, 1)})`);
  ok(E.atk(g, on(g, 0, 'Etoile Cyber')) === 1200, 'back to 1200 after battle');
  const g2 = duel({ board: [{ hand: [], m: ['Etoile Cyber'], turn: 2 }, { m: [dpos(ELF)] }] });
  bp(g2); atkOn(g2, 0, 'Etoile Cyber', ELF); toIdle(g2);
  ok(lp(g2, 0) === 7200, `attacking Mystical Elf (2000 DEF) costs A 800 (${lp(g2, 0)})`);
});
T('Everliving Underworld Cannon: 800 the first time a Zombie is Special Summoned each turn', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn', 'Monster Reborn'], st: [up('Everliving Underworld Cannon')], gy: ['Ryu Kokki', 'Goblin Zombie'], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); settle(g, 'Ryu Kokki', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Ryu Kokki') && lp(g, 1) === 7200, `Ryu Kokki summoned, B took 800 (${lp(g, 1)})`);
  act(g, 0, 'Monster Reborn'); settle(g, 'Goblin Zombie', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Goblin Zombie') && lp(g, 1) === 7200, `second Zombie: no more damage (${lp(g, 1)})`);
});
T('Evolution Burst: needs Cyber Dragon, destroys 1 card, Cyber Dragon cannot attack', () => {
  const g = duel({ board: [{ hand: ['Evolution Burst'], m: ['Cyber Dragon'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Evolution Burst'); settle(g, W); toIdle(g);
  ok(inZ(g, 1, 'gy', W), 'Warwolf destroyed');
  choose(g, 'bp'); settle(g);
  ok(!canAtk(g, on(g, 0, 'Cyber Dragon'), null), 'Cyber Dragon cannot attack');
  const g2 = duel({ board: [{ hand: ['Evolution Burst'], m: [W], turn: 2 }, { m: [W] }] });
  ok(!canAct(g2, 0, 'Evolution Burst'), 'not without Cyber Dragon');
});
T('Exarion Universe: lose 400 to pierce a Defense Position monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Exarion Universe'], turn: 2 }, { m: [dpos(CG)] }] });
  bp(g); atkOn(g, 0, 'Exarion Universe', CG, 'Exarion Universe'); toIdle(g);
  ok(inZ(g, 1, 'gy', CG) && lp(g, 1) === 7800, `Celtic destroyed, 200 piercing (B ${lp(g, 1)})`);
  ok(E.atk(g, on(g, 0, 'Exarion Universe')) === 1400, 'Exarion has 1400 ATK this turn');
});
// Errata audit (2026-11-26): no once-per-Duel on the 2010 card, so the second copy can follow.
T('Exchange of the Spirit: pay 1000, swap GY and Deck', () => {
  const g = duel({ board: [{ hand: [], st: ['Exchange of the Spirit', 'Exchange of the Spirit'], gy: Array(15).fill(CG), turn: 2 }, { gy: Array(15).fill(ELF) }] });
  const d0 = g.p[0].deck.length, d1 = g.p[1].deck.length;
  act(g, 0, 'Exchange of the Spirit'); settle(g); toIdle(g);
  ok(lp(g, 0) === 7000, `paid 1000 (${lp(g, 0)})`);
  ok(cnt(g, 0, 'deck', CG) === 15 && cnt(g, 0, 'deck') === 15 && cnt(g, 0, 'gy', W) === d0, `A: 15 Celtics in the Deck, ${d0} Warwolves in the GY (${cnt(g, 0, 'gy', W)})`);
  ok(cnt(g, 1, 'deck', ELF) === 15 && cnt(g, 1, 'gy', W) === d1, 'B swapped too');
  ok(canAct(g, 0, 'Exchange of the Spirit'), 'the second copy can still be activated (both GYs hold 15+ again)');
  const g2 = duel({ board: [{ hand: [], st: ['Exchange of the Spirit'], gy: Array(15).fill(CG), turn: 2 }, { gy: Array(14).fill(ELF) }] });
  ok(!canAct(g2, 0, 'Exchange of the Spirit'), 'not with 14 cards in a GY');
});
T('Exodius: summoned by shuffling GY monsters in, mills on attack, gains 1000 per Normal', () => {
  const X = 'Exodius the Ultimate Forbidden Lord';
  const g = duel({ board: [{ hand: [X], gy: [CG, W], turn: 2 }, {}] });
  const x = card(g, 0, X); ok(!hasOpt(g, 'ns:' + x.u) && !hasOpt(g, 'set:' + x.u), 'cannot be Normal Summoned/Set');
  choose(g, 'sp:' + x.u); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, X) && cnt(g, 0, 'gy') === 0 && cnt(g, 0, 'deck', CG) === 1, 'Exodius summoned, GY monsters shuffled into the Deck');
  ok(E.atk(g, on(g, 0, X)) === 0, 'ATK 0 with no Normals in the GY');
  bp(g); atkOn(g, 0, X, null, W); toIdle(g);
  ok(cnt(g, 0, 'gy', W) === 1 && lp(g, 1) === 7000, `a Warwolf sent to the GY, 1000 direct damage (B ${lp(g, 1)})`);
  const g3 = duel({ board: [{ hand: [X, 'Dark Hole'], gy: [CG], turn: 2 }, {}] });
  choose(g3, 'sp:' + card(g3, 0, X).u); settle(g3, 'Attack'); toIdle(g3, 'Attack');
  act(g3, 0, 'Dark Hole'); settle(g3); toIdle(g3);
  ok(inZ(g3, 0, 'ban', X), 'Exodius is banished instead of leaving the field');
  const g2 = duel({ board: [{ hand: [X], gy: ['Pot of Greed'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, X).u), 'needs at least 1 monster in the GY');
});
T('Explosive Magician: remove 2 Spell Counters to destroy a Spell/Trap; Spellcaster Synchro', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Pot of Greed'], m: ['Explosive Magician', 'Royal Magical Library'], turn: 2 }, { st: ['Mirror Force'] }] });
  const lib = on(g, 0, 'Royal Magical Library'); act(g, 0, 'Pot of Greed'); settle(g); toIdle(g); act(g, 0, 'Pot of Greed'); settle(g); toIdle(g);
  ok(E.lib.ctr(lib, 'spell') === 2, 'Library has 2 Spell Counters');
  ign(g, on(g, 0, 'Explosive Magician'), 'Face-down card'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && E.lib.ctr(lib, 'spell') === 0, 'Mirror Force destroyed, 2 counters removed');
  const g2 = duel({ board: [{ hand: ['Pot of Greed'], m: ['Explosive Magician', 'Royal Magical Library'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g2, 0, 'Pot of Greed'); settle(g2); toIdle(g2);
  ok(!hasIgn(g2, on(g2, 0, 'Explosive Magician')), 'not with 1 counter');
  const g3 = duel({ ex0: ['Explosive Magician'], board: [{ hand: [], m: ['Frequency Magician', 'Breaker the Magical Warrior'], turn: 2 }, {}] });
  ok(hasOpt(g3, 'Synchro Summon'), 'Synchro with a Tuner and a Spellcaster');
  const g4 = duel({ ex0: ['Explosive Magician'], board: [{ hand: [], m: ['Frequency Magician', W], turn: 2 }, {}] });
  ok(!hasOpt(g4, 'Synchro Summon'), 'not with a non-Spellcaster');
});
T('Exxod: Tribute a Sphinx; 1000 damage when an EARTH monster is Flip Summoned', () => {
  const X = 'Exxod, Master of The Guard';
  const g = duel({ board: [{ hand: [X], m: ['Andro Sphinx', set(CG)], turn: 2 }, {}] });
  const x = card(g, 0, X); ok(!hasOpt(g, 'ns:' + x.u), 'no Normal Summon');
  choose(g, 'sp:' + x.u); settle(g, 'Andro Sphinx', 'Defense'); toIdle(g, 'Andro Sphinx');
  ok(on(g, 0, X) && inZ(g, 0, 'gy', 'Andro Sphinx'), 'Exxod summoned, Sphinx Tributed');
  choose(g, 'flip:' + on(g, 0, CG).u); settle(g); toIdle(g);
  ok(lp(g, 1) === 7000, `Celtic (EARTH) Flip Summoned: B took 1000 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [X], m: [W], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, X).u), 'not without a Sphinx');
});
T('Factory of 100 Machines: banish Morphtronics, +200 each to a Machine', () => {
  const g = duel({ board: [{ hand: ['Factory of 100 Machines'], m: ['Cyber Dragon'], gy: ['Morphtronic Celfon', 'Morphtronic Radion', W], turn: 2 }, {}] });
  act(g, 0, 'Factory of 100 Machines'); settle(g, 'Cyber Dragon'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 2500 && cnt(g, 0, 'ban') === 2 && inZ(g, 0, 'gy', W), `Cyber Dragon 2500, 2 Morphtronics banished (${E.atk(g, on(g, 0, 'Cyber Dragon'))})`);
});
T('Faustian Bargain: send a Special Summoned monster to the GY, summon a Normal from the hand', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn', 'Faustian Bargain', CG], gy: [BEWD], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); settle(g, BEWD, 'Attack'); toIdle(g, 'Attack');
  act(g, 0, 'Faustian Bargain'); settle(g, BEWD, CG, 'Attack'); toIdle(g, CG, 'Attack');
  ok(inZ(g, 0, 'gy', BEWD) && on(g, 0, CG), 'Blue-Eyes sent to the GY, Celtic Guardian summoned');
  const g2 = duel({ board: [{ hand: ['Faustian Bargain', CG], turn: 2 }, { m: [W] }] });
  ok(!canAct(g2, 0, 'Faustian Bargain'), 'no target that was Special Summoned');
});
T('Feather Shot: Avian attacks once per monster you control, others cannot attack', () => {
  const AV = 'Elemental HERO Avian', CF = 'Morphtronic Celfon';
  const g = duel({ board: [{ hand: ['Feather Shot'], m: [AV, CG, ELF], turn: 2 }, { m: [CF, CF, CF] }] });
  act(g, 0, 'Feather Shot'); settle(g, AV); toIdle(g);
  choose(g, 'bp'); settle(g);
  ok(!canAtk(g, on(g, 0, CG), on(g, 1, CF)), 'Celtic cannot attack');
  for (let i = 0; i < 3; i++) if (on(g, 1, CF) && canAtk(g, on(g, 0, AV), on(g, 1, CF))) atkOn(g, 0, AV, CF);
  ok(cnt(g, 1, 'm') === 0, `Avian destroyed all 3 Celfons (${cnt(g, 1, 'm')} left)`);
  ok(!canAtk(g, on(g, 0, AV), null), 'no direct attack');
});
T('Feather Wind: negates a Spell while you control Avian', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Elemental HERO Avian'], st: ['Feather Wind'] }, { hand: ['Dark Hole'], turn: 2 }] });
  toIdle(g); act(g, 1, 'Dark Hole'); settle(g, 'Feather Wind'); toIdle(g);
  ok(on(g, 0, 'Elemental HERO Avian') && inZ(g, 1, 'gy', 'Dark Hole') && inZ(g, 0, 'gy', 'Feather Wind'), 'Dark Hole negated, Avian stays');
  const g2 = duel({ first: 1, board: [{ turn: 2, m: [CG], st: ['Feather Wind'] }, { hand: ['Dark Hole'], turn: 2 }] });
  toIdle(g2); act(g2, 1, 'Dark Hole'); ok(!hasOpt(g2, 'Feather Wind'), 'not offered without Avian'); settle(g2); toIdle(g2);
});
T('Featherizer: destroyed by battle, send a Gemini from the Deck and draw 1', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], m: ['Featherizer'], deckTop: ['Gemini Soldier'] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, 'Featherizer', 'Featherizer', 'Gemini Soldier'); toIdle(g, 'Featherizer', 'Gemini Soldier');
  ok(inZ(g, 0, 'gy', 'Gemini Soldier') && hand(g, 0) === 1, `Gemini Soldier sent, drew 1 (hand ${hand(g, 0)})`);
});
T('Felgrand Dragon: revived after leaving the field, gains Level x 200', () => {
  const F = 'Felgrand Dragon';
  const g = duel({ board: [{ hand: ['Dark Hole', 'Monster Reborn'], m: [F], gy: [W], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  act(g, 0, 'Monster Reborn'); settle(g, F, 'Attack', W); toIdle(g, 'Attack', W);
  ok(on(g, 0, F) && E.atk(g, on(g, 0, F)) === 3600, `Felgrand back with 3600 ATK (${on(g, 0, F) && E.atk(g, on(g, 0, F))})`);
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: [F], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be revived if it never was on the field');
});
T('Field Barrier: no new Field Spells, Field Spells cannot be destroyed', () => {
  const g = duel({ board: [{ hand: ['Gaia Power', 'Field Barrier', 'Mystic Plasma Zone', 'Mystical Space Typhoon'], turn: 2 }, {}] });
  act(g, 0, 'Gaia Power'); settle(g); toIdle(g);
  act(g, 0, 'Field Barrier'); settle(g); toIdle(g);
  ok(!canAct(g, 0, 'Mystic Plasma Zone'), 'a new Field Spell cannot be activated');
  if (canAct(g, 0, 'Mystical Space Typhoon')) { act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Gaia Power'); toIdle(g); }
  ok(g.p[0].fz && E.name(g.p[0].fz) === 'Gaia Power', 'Gaia Power stays');
});
T('Field-Commander Rahz: puts a Level 4 or lower Warrior on top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Field-Commander Rahz'], deckTop: [W, W, 'Marauding Captain'], turn: 2 }, {}] });
  ns(g, 0, 'Field-Commander Rahz', 'Marauding Captain'); toIdle(g, 'Marauding Captain');
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(top && E.name(top) === 'Marauding Captain', `top card is Marauding Captain (${top && E.name(top)})`);
});
T('Fiend Skull Dragon: Fusion; destroys a Trap that targets it; negates Flip effects', () => {
  const F = 'Fiend Skull Dragon (Archfiend)';
  const g = duel({ ex0: [F], board: [{ hand: ['Polymerization', 'Cave Dragon', 'Lesser Fiend (Archfiend)'], turn: 2 }, { st: ['Sakuretsu Armor'], m: [CG] }] });
  act(g, 0, 'Polymerization'); settle(g, F, 'Cave Dragon', 'Lesser Fiend', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, F), 'Fiend Skull Dragon Fusion Summoned');
  bp(g); atkOn(g, 0, F, CG, 'Sakuretsu Armor', F); toIdle(g, F);
  ok(on(g, 0, F) && inZ(g, 1, 'gy', 'Sakuretsu Armor') && inZ(g, 1, 'gy', CG), 'Sakuretsu negated, Celtic destroyed');
  const g2 = duel({ board: [{ hand: [], m: [F], turn: 2 }, { m: [set('Man-Eater Bug')] }] });
  bp(g2); atkOn(g2, 0, F, 'Man-Eater Bug', F); toIdle(g2, F);
  ok(on(g2, 0, F), 'Man-Eater Bug flip effect negated');
});
T("Fiend's Sanctuary: Metal Fiend Token, can't attack, battle damage goes to the opponent", () => {
  const MF = 'Metal Fiend Token';
  const g = duel({ board: [{ hand: ["Fiend's Sanctuary"], turn: 2 }, { m: [W] }] });
  act(g, 0, "Fiend's Sanctuary"); settle(g, 'Attack'); toIdle(g, 'Attack');
  const t = on(g, 0, MF); ok(t && E.atk(g, t) === 0, 'token summoned');
  choose(g, 'bp'); settle(g); ok(!canAtk(g, t, on(g, 1, W)), 'the token cannot attack');
  endTurn(g); toIdle(g);
  bp(g); atkOn(g, 1, W, MF); toIdle(g);
  ok(lp(g, 0) === 8000 && lp(g, 1) === 6000, `B took the 2000 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ["Fiend's Sanctuary"], turn: 2 }, {}] });
  act(g2, 0, "Fiend's Sanctuary"); settle(g2, 'Attack'); toIdle(g2, 'Attack'); endTurn(g2); toIdle(g2); endTurn(g2); toIdle(g2, 'Pay');
  ok((lp(g2, 0) === 7000 && on(g2, 0, MF)) || (lp(g2, 0) === 8000 && !on(g2, 0, MF)), `Standby: paid 1000 or token destroyed (A ${lp(g2, 0)})`);
});
T('Fiendish Engine Omega: Engine Token at your End Phase; +1000 then destroyed', () => {
  const F = 'Fiendish Engine Omega';
  const g = duel({ board: [{ hand: [], m: [F], turn: 2 }, {}] });
  toIdle(g); endTurn(g); toIdle(g);
  const tk = on(g, 0, 'Engine Token'); ok(tk && tk.pos === 'atk' && on(g, 0, F), 'Engine Token in Attack, Omega stays');
  const g2 = duel({ board: [{ hand: [], m: [F], turn: 2 }, {}] });
  ign(g2, on(g2, 0, F)); toIdle(g2);
  ok(E.atk(g2, on(g2, 0, F)) === 3800, 'Omega 3800 ATK');
  ok(!hasIgn(g2, on(g2, 0, F)), 'once per turn');
  endTurn(g2); toIdle(g2);
  ok(inZ(g2, 0, 'gy', F), 'Omega destroyed in the End Phase');
});
const HEROES = ['Elemental HERO Sparkman', 'Elemental HERO Burstinatrix', 'Elemental HERO Clayman', 'Elemental HERO Avian', 'Elemental HERO Bubbleman'];
T('Fifth Hope: shuffle 5 HEROes, draw 2, or 3 with nothing else', () => {
  const g = duel({ board: [{ hand: [], st: ['Fifth Hope'], gy: HEROES }, {}] });
  { const x = g.p[0].hand.pop(); x.zone = 'deck'; g.p[0].deck.push(x); } // the turn's draw goes back: empty hand, only Fifth Hope on the field
  act(g, 0, 'Fifth Hope'); settle(g, ...HEROES); toIdle(g);
  ok(hand(g, 0) === 3 && cnt(g, 0, 'gy') === 1, `drew 3 with an empty field and hand (hand ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Fifth Hope', CG], gy: HEROES }, {}] });
  act(g2, 0, 'Fifth Hope'); settle(g2, ...HEROES); toIdle(g2);
  ok(hand(g2, 0) === 4, `drew 2 with other cards in hand (hand ${hand(g2, 0)})`);
  ok(HEROES.every(h => [...g2.p[0].deck, ...g2.p[0].hand].some(c => E.name(c) === h)) && cnt(g2, 0, 'gy') === 1, 'HEROes shuffled into the Deck');
});
T('Fighting Spirit: +300 per opponent monster, destroyed instead of the monster', () => {
  const g = duel({ board: [{ hand: ['Fighting Spirit'], m: [CG], turn: 2 }, { m: [W, W] }] });
  act(g, 0, 'Fighting Spirit'); settle(g, CG); toIdle(g);
  ok(E.atk(g, on(g, 0, CG)) === 2000, `Celtic 2000 (${E.atk(g, on(g, 0, CG))})`);
  bp(g); atkOn(g, 0, CG, W, 'Fighting Spirit'); toIdle(g, 'Fighting Spirit');
  ok(on(g, 0, CG) && inZ(g, 0, 'gy', 'Fighting Spirit') && cnt(g, 1, 'gy', W) === 1, 'Celtic survives, Fighting Spirit destroyed, 1 Warwolf destroyed');
});
T('Fine: discard 2 cards', () => {
  const g = duel({ board: [{ hand: [CG, ELF], st: ['Fine'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Fine'); settle(g, CG, ELF); toIdle(g);
  ok(hand(g, 0) === h - 2 && inZ(g, 0, 'gy', CG), `discarded 2 (hand ${h} -> ${hand(g, 0)})`);
});
T('Fires of Doomsday: 2 Doomsday Tokens in Defense, no other Summons (Set ok)', () => {
  const g = duel({ board: [{ hand: ['Fires of Doomsday', CG], turn: 2 }, {}] });
  act(g, 0, 'Fires of Doomsday'); settle(g); toIdle(g);
  const tk = mons(g, 0).filter(c => E.name(c) === 'Doomsday Token');
  ok(tk.length === 2 && tk.every(t => t.pos === 'def'), `2 tokens in Defense (${tk.length})`);
  const c = card(g, 0, CG); ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'set:' + c.u), 'no Normal Summon, Set allowed');
});
T('Firestorm Prominence: destroyed by battle, destroys face-down and non-FIRE monsters', () => {
  const FP = 'Firestorm Prominence';
  const g = duel({ board: [{ hand: [], m: [FP, W, 'UFO Turtle'], turn: 2 }, { m: [BEWD, set(CG)] }] });
  bp(g); atkOn(g, 0, FP, BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && inZ(g, 1, 'gy', CG) && inZ(g, 0, 'gy', W) && on(g, 0, 'UFO Turtle'), 'Blue-Eyes, the face-down Celtic and the Warwolf destroyed; UFO Turtle (FIRE) stays');
});
T('Firewall: banish a Pyro to negate a direct attack; 500 LP each Standby', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], st: [up('Firewall')], gy: ['Fox Fire'] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, null, 'Firewall'); toIdle(g, 'Firewall');
  ok(lp(g, 0) === 8000 && inZ(g, 0, 'ban', 'Fox Fire'), `attack negated, Fox Fire banished (A ${lp(g, 0)})`);
  endTurn(g, 'Pay'); toIdle(g, 'Pay');
  ok(lp(g, 0) === 7500 && inZ(g, 0, 'st', 'Firewall'), `paid 500 in the Standby Phase (A ${lp(g, 0)})`);
});
T('Fish Depth Charge: Tribute a Fish, destroy a card, draw 1', () => {
  const g = duel({ board: [{ hand: [], m: ['7 Colored Fish'], st: ['Fish Depth Charge'], turn: 2 }, { st: ['Mirror Force'] }] });
  const h = hand(g, 0); act(g, 0, 'Fish Depth Charge'); settle(g, '7 Colored Fish', 'Face-down card'); toIdle(g);
  ok(inZ(g, 0, 'gy', '7 Colored Fish') && inZ(g, 1, 'gy', 'Mirror Force') && hand(g, 0) === h + 1, 'Fish Tributed, Mirror Force destroyed, drew 1');
  const g2 = duel({ board: [{ hand: [], m: [W], st: ['Fish Depth Charge'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!canAct(g2, 0, 'Fish Depth Charge'), 'needs a Fish');
});
T('Flash of the Forbidden Spell: only with 5 opponent monsters, destroys them all', () => {
  const g = duel({ board: [{ hand: ['Flash of the Forbidden Spell'], turn: 2 }, { m: [W, W, W, W, CG] }] });
  act(g, 0, 'Flash of the Forbidden Spell'); settle(g); toIdle(g);
  ok(cnt(g, 1, 'm') === 0, 'all 5 destroyed');
  const g2 = duel({ board: [{ hand: ['Flash of the Forbidden Spell'], turn: 2 }, { m: [W, W, W, W] }] });
  ok(!canAct(g2, 0, 'Flash of the Forbidden Spell'), 'not with 4');
});
T('Flashbang: after a direct attack, it becomes the End Phase', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], st: ['Flashbang'] }, { hand: [], m: [W, CG], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, null, 'Flashbang'); toIdle(g, 'Flashbang');
  if (g.tp === 1 && g.prompt && g.prompt.type === 'battle' && canAtk(g, on(g, 1, CG), null)) atkOn(g, 1, CG, null);
  ok(lp(g, 0) === 6000 && inZ(g, 0, 'gy', 'Flashbang'), `only the Warwolf hit (A ${lp(g, 0)})`);
});
T('Flying Fortress SKY FIRE: discard to destroy; destroys what the opponent summons (800)', () => {
  const SF = 'Flying Fortress SKY FIRE';
  const g = duel({ board: [{ hand: [CG], m: [SF], turn: 2 }, { st: ['Mirror Force'] }] });
  ign(g, on(g, 0, SF), CG, 'Face-down card'); toIdle(g);
  ok(inZ(g, 0, 'gy', CG) && inZ(g, 1, 'gy', 'Mirror Force'), 'Celtic discarded, Mirror Force destroyed');
  const g2 = duel({ first: 1, board: [{ turn: 2, hand: [], m: [SF] }, { hand: [W], turn: 2 }] });
  toIdle(g2); ns(g2, 1, W, SF); toIdle(g2, SF);
  ok(inZ(g2, 1, 'gy', W) && lp(g2, 1) === 7200, `summoned Warwolf destroyed, 800 damage (B ${lp(g2, 1)})`);
  const g3 = duel({ board: [{ hand: [SF], m: [W, W], turn: 2 }, {}] });
  ok(noSummon(g3, card(g3, 0, SF)), 'cannot be Normal Summoned');
});
T("Flying Saucer Muusik'i: search an Alien instead of the normal draw", () => {
  const g = duel({ board: [{ hand: [], m: ["Flying Saucer Muusik'i"], deckTop: [W, W, 'Alien Grey', W], turn: 2 }, {}] });
  toIdle(g); endTurn(g); toIdle(g); endTurn(g, 'Alien Grey'); toIdle(g, 'Alien Grey');
  ok(g.tp === 0 && inZ(g, 0, 'hand', 'Alien Grey'), 'Alien Grey added in the Draw Phase');
});
T('Fog Control: Tribute a Cloudian, 3 Fog Counters on a monster', () => {
  const g = duel({ board: [{ hand: ['Fog Control'], m: ['Cloudian - Smoke Ball', CG], turn: 2 }, {}] });
  act(g, 0, 'Fog Control'); settle(g, 'Cloudian - Smoke Ball', CG); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Cloudian - Smoke Ball') && ctrSum(on(g, 0, CG)) === 3, `Smoke Ball Tributed, Celtic has 3 counters (${on(g, 0, CG) && JSON.stringify(on(g, 0, CG).ctr)})`);
});
T('Fog King: 0 or 1 Tribute, ATK of the Tribute, nobody can Tribute', () => {
  const FK = 'Fog King';
  const g = duel({ board: [{ hand: [FK], m: [W], turn: 2 }, {}] });
  ns(g, 0, FK, '1 Tribute', W); toIdle(g, W);
  ok(on(g, 0, FK) && E.atk(g, on(g, 0, FK)) === 2000, `Fog King 2000 ATK (${on(g, 0, FK) && E.atk(g, on(g, 0, FK))})`);
  const g2 = duel({ board: [{ hand: [FK], turn: 2 }, {}] });
  const c = card(g2, 0, FK); ok(hasOpt(g2, 'ns:' + c.u) && !hasOpt(g2, 'set:' + c.u), 'Normal Summon with no Tribute offered, no Set');
  const g3 = duel({ first: 1, board: [{ turn: 2, m: [FK] }, { hand: ['Cyber Dragon', 'Summon Reactor SK'], m: [W], turn: 2 }] }); toIdle(g3);
  ok(!hasOpt(g3, 'ns:' + card(g3, 1, 'Summon Reactor SK').u), 'opponent cannot Tribute Summon');
});
T('Foolish Revival: summon a monster from the opponent GY to their field in Defense', () => {
  const g = duel({ board: [{ hand: [], st: ['Foolish Revival'], turn: 2 }, { gy: [CG] }] });
  act(g, 0, 'Foolish Revival'); settle(g, CG); toIdle(g);
  const c = on(g, 1, CG); ok(c && c.pos === 'def', 'Celtic on B field in Defense');
});
T('Forbidden Chalice: +400 and effects negated until end of turn', () => {
  const FLE = 'Fortune Lady Earth';
  const g = duel({ board: [{ hand: ['Forbidden Chalice'], turn: 2 }, { m: [FLE] }] });
  ok(E.atk(g, on(g, 1, FLE)) === 2400, 'Fortune Lady Earth 2400');
  act(g, 0, 'Forbidden Chalice'); settle(g, FLE); toIdle(g);
  ok(E.atk(g, on(g, 1, FLE)) === 400, `negated, 0 + 400 (${E.atk(g, on(g, 1, FLE))})`);
  const g2 = duel({ board: [{ hand: ['Forbidden Chalice'], m: [W], turn: 2 }, {}] });
  act(g2, 0, 'Forbidden Chalice'); settle(g2, W); toIdle(g2);
  ok(E.atk(g2, on(g2, 0, W)) === 2400, 'Warwolf 2400'); endTurn(g2); toIdle(g2);
  ok(E.atk(g2, on(g2, 0, W)) === 2000, 'back to 2000 next turn');
});
T('Fortune Lady Earth: Level x 400, Level up each Standby with 400 damage', () => {
  const FLE = 'Fortune Lady Earth';
  const g = duel({ board: [{ hand: [], m: [FLE], turn: 2 }, {}] });
  toIdle(g); // the board is set before the turn-2 Standby Phase, so it already leveled up once
  ok(LV(on(g, 0, FLE)) === 7 && E.atk(g, on(g, 0, FLE)) === 2800 && E.def(g, on(g, 0, FLE)) === 2800 && lp(g, 1) === 7600, `Level 7, 2800/2800, B took 400 (${LV(on(g, 0, FLE))}, ${lp(g, 1)})`);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(LV(on(g, 0, FLE)) === 8 && E.atk(g, on(g, 0, FLE)) === 3200 && lp(g, 1) === 7200, `Level 8, 3200 ATK, B took 400 more (${LV(on(g, 0, FLE))}, ${lp(g, 1)})`);
  const g2 = duel({ first: 1, board: [{ turn: 2, m: [FLE] }, { turn: 2 }] }); toIdle(g2);
  ok(E.atk(g2, on(g2, 0, FLE)) === 2400 && lp(g2, 1) === 8000, 'Level 6: 2400 ATK before its first Standby Phase');
});
T('Fortune Lady Fire: Level x 200, Level up in your Standby', () => {
  const F = 'Fortune Lady Fire';
  const g = duel({ board: [{ hand: [], m: [F], turn: 2 }, {}] });
  toIdle(g); ok(E.atk(g, on(g, 0, F)) === 600 && LV(on(g, 0, F)) === 3, 'Level 3 after the first Standby Phase, ATK 600');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(LV(on(g, 0, F)) === 4 && E.atk(g, on(g, 0, F)) === 800, `Level 3, 600 (${LV(on(g, 0, F))})`);
});
T('Fragrance Storm: destroy a Plant, draw, reveal a Plant to draw again', () => {
  const g = duel({ board: [{ hand: ['Fragrance Storm'], deckTop: [W, 'Dandylion', W], turn: 2 }, { m: ['Mystic Tomato'] }] });
  act(g, 0, 'Fragrance Storm'); settle(g, 'Mystic Tomato'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Mystic Tomato') && inZ(g, 0, 'hand', 'Dandylion') && hand(g, 0) === 3, `Tomato destroyed, drew Dandylion and 1 more (hand ${hand(g, 0)})`);
});
T('Frequency Magician: Spell Counter on Normal Summon, remove it for +500', () => {
  const FM = 'Frequency Magician';
  const g = duel({ board: [{ hand: [FM], m: [W], turn: 2 }, {}] });
  ns(g, 0, FM); toIdle(g);
  ok(E.lib.ctr(on(g, 0, FM), 'spell') === 1, '1 Spell Counter');
  ign(g, on(g, 0, FM), W); toIdle(g, W);
  ok(E.atk(g, on(g, 0, W)) === 2500 && E.lib.ctr(on(g, 0, FM), 'spell') === 0, 'Warwolf 2500, counter removed');
});
T('Freya: Fairies +400, cannot be attacked while you have another Fairy', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Freya, Spirit of Victory', 'Shining Angel'] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g);
  ok(E.atk(g, on(g, 0, 'Shining Angel')) === 1800 && E.atk(g, on(g, 0, 'Freya, Spirit of Victory')) === 500, 'Shining Angel 1800, Freya 500');
  bp(g); ok(!canAtk(g, on(g, 1, W), on(g, 0, 'Freya, Spirit of Victory')) && canAtk(g, on(g, 1, W), on(g, 0, 'Shining Angel')), 'Freya cannot be attacked');
});
T('Froggy Forcefield: a Frog attacked, destroy all opponent Attack Position monsters', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Des Frog'], st: ['Froggy Forcefield'] }, { hand: [], m: [W, CG, dpos(ELF)], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, 'Des Frog', 'Froggy Forcefield'); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && inZ(g, 1, 'gy', CG) && on(g, 1, ELF) && on(g, 0, 'Des Frog'), 'Attack Position monsters destroyed, Elf stays');
});
T('Frost and Flame Dragon: banish 1 FIRE + 2 WATER; discard to destroy', () => {
  const FF = 'Frost and Flame Dragon';
  const g = duel({ board: [{ hand: [FF, CG], gy: ['Blazing Inpachi', 'Mobius the Frost Monarch', 'Penguin Soldier'], turn: 2 }, { m: [W] }] });
  choose(g, 'sp:' + card(g, 0, FF).u); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, FF) && cnt(g, 0, 'ban') === 3, 'summoned, 3 banished');
  ign(g, on(g, 0, FF), CG, W); toIdle(g);
  ok(inZ(g, 0, 'gy', CG) && inZ(g, 1, 'gy', W), 'Celtic discarded, Warwolf destroyed');
  ok(!hasIgn(g, on(g, 0, FF)), 'once per turn');
  const g2 = duel({ board: [{ hand: [FF], gy: ['Blazing Inpachi', 'Mobius the Frost Monarch'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, FF).u), 'not with only 1 WATER');
});
T('Full Salvo: send the hand, 200 per card', () => {
  const g = duel({ board: [{ hand: [CG, ELF], st: ['Full Salvo'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Full Salvo'); settle(g); toIdle(g);
  ok(hand(g, 0) === 0 && lp(g, 1) === 8000 - 200 * h, `sent ${h}, B at ${lp(g, 1)}`);
});
T('Future Samurai: Gemini; once Gemini Summoned, banish from GY to destroy a face-up monster', () => {
  const FS = 'Future Samurai';
  const g = duel({ board: [{ hand: [], m: [FS], gy: [CG], turn: 2 }, { m: [W] }] });
  ok(!hasIgn(g, on(g, 0, FS)), 'no effect before Gemini Summon');
  choose(g, 'gem:' + on(g, 0, FS).u); settle(g); toIdle(g);
  ign(g, on(g, 0, FS), CG, W); toIdle(g);
  ok(inZ(g, 0, 'ban', CG) && inZ(g, 1, 'gy', W), 'Celtic banished, Warwolf destroyed');
});
T('Gaap: all monsters in Attack Position; reveal Fiends for +300 each', () => {
  const G = 'Gaap the Divine Soldier';
  const g = duel({ board: [{ hand: ['Sangan', "Hiro's Shadow Scout"], m: [G, dpos(ELF)], turn: 2 }, { m: [dpos(CG), set(W)] }] });
  const posOk = [on(g, 0, ELF), on(g, 1, CG)].every(c => c.pos === 'atk');
  ok(posOk, `face-up monsters are in Attack Position (${on(g, 0, ELF).pos}, ${on(g, 1, CG).pos})`);
  ign(g, on(g, 0, G), 'Sangan', "Hiro's Shadow Scout"); toIdle(g);
  ok(E.atk(g, on(g, 0, G)) === 2800, `Gaap 2800 (${E.atk(g, on(g, 0, G))})`);
});
T('Gale Dogra: pay 3000 to send an Extra Deck monster to the GY', () => {
  const g = duel({ ex0: ['Stardust Dragon'], board: [{ hand: [], m: ['Gale Dogra'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Gale Dogra'), 'Stardust Dragon'); toIdle(g);
  ok(lp(g, 0) === 5000 && inZ(g, 0, 'gy', 'Stardust Dragon'), 'paid 3000, Stardust in the GY');
});
T('Gambler of Legend: 3 Heads destroys the opponent monsters; 3 Tails discards your hand', () => {
  const GL = 'Gambler of Legend';
  const g = duel({ board: [{ hand: [CG], m: [GL], turn: 2 }, { m: [W, ELF] }] });
  const r = g.rnd; g.rnd = () => 0.1; ign(g, on(g, 0, GL)); toIdle(g); g.rnd = r;
  ok(cnt(g, 1, 'm') === 0 && on(g, 0, GL), '3 Heads: B monsters destroyed');
  ok(!hasIgn(g, on(g, 0, GL)), 'once per turn');
  const g2 = duel({ board: [{ hand: [CG], m: [GL], turn: 2 }, { m: [W] }] });
  const r2 = g2.rnd; g2.rnd = () => 0.9; ign(g2, on(g2, 0, GL)); toIdle(g2); g2.rnd = r2;
  ok(hand(g2, 0) === 0 && on(g2, 1, W), '3 Tails: A discarded the hand');
});
T('Gandora: pay half, destroy and banish all other cards, +300 each; Normal Summoned goes to GY', () => {
  const GD = 'Gandora the Dragon of Destruction';
  const g = duel({ board: [{ hand: [], m: [GD, W], turn: 2 }, { m: [W, CG], st: ['Mirror Force'] }] });
  ign(g, on(g, 0, GD)); toIdle(g);
  ok(lp(g, 0) === 4000 && cnt(g, 0, 'ban') + cnt(g, 1, 'ban') === 4 && E.atk(g, on(g, 0, GD)) === 1200, `paid 4000, 4 banished, ATK ${E.atk(g, on(g, 0, GD))}`);
  endTurn(g); toIdle(g); ok(on(g, 0, GD), 'not Normal Summoned this turn: stays');
  const g2 = duel({ board: [{ hand: [GD], m: [W, W], turn: 2 }, {}] });
  ns(g2, 0, GD, W); toIdle(g2, W); ok(on(g2, 0, GD), 'Tribute Summoned');
  endTurn(g2); ok(inZ(g2, 0, 'gy', GD), 'sent to the GY in the End Phase');
});
T('Garlandolf: Ritual of Destruction; destroys face-up monsters with DEF up to 2500, +100 each', () => {
  const GK = 'Garlandolf, King of Destruction';
  const g = duel({ board: [{ hand: ['Ritual of Destruction', GK], m: [BEWD], turn: 2 }, { m: [CG, 'Big Shield Gardna', set(ELF)] }] });
  act(g, 0, 'Ritual of Destruction'); settle(g, GK, BEWD, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, GK) && inZ(g, 1, 'gy', CG) && on(g, 1, 'Big Shield Gardna') && on(g, 1, ELF), 'Celtic destroyed, Big Shield and the face-down Elf stay');
  ok(E.atk(g, on(g, 0, GK)) === 2600, `Garlandolf 2600 (${on(g, 0, GK) && E.atk(g, on(g, 0, GK))})`);
});
T('Garma Sword Oath: Ritual Summons Garma Sword', () => {
  const g = duel({ board: [{ hand: ['Garma Sword Oath', 'Garma Sword'], m: [W, W], turn: 2 }, {}] });
  act(g, 0, 'Garma Sword Oath'); settle(g, 'Garma Sword', W, W, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Garma Sword') && E.atk(g, on(g, 0, 'Garma Sword')) === 2550 && cnt(g, 0, 'gy', W) === 2, 'Garma Sword summoned, 2 Tributes');
  const g2 = duel({ board: [{ hand: ['Garma Sword Oath', 'Garma Sword'], m: ['Alien Grey'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Garma Sword Oath'), 'not with only 6 Levels (Alien Grey + the drawn Warwolf)');
});
T('Gateway to Dark World: revive a Dark World monster; no other Summons (Set ok)', () => {
  const B = 'Brron, Mad King of Dark World';
  const g = duel({ board: [{ hand: ['Gateway to Dark World', CG], gy: [B], turn: 2 }, {}] });
  act(g, 0, 'Gateway to Dark World'); settle(g, B, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, B), 'Brron summoned');
  const c = card(g, 0, CG); ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'set:' + c.u), 'no Normal Summon, Set allowed');
});
T('Gauntlet Warrior: Tribute it, Warriors gain 500 ATK/DEF', () => {
  const g = duel({ board: [{ hand: [], m: ['Gauntlet Warrior', CG, W], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Gauntlet Warrior')); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Gauntlet Warrior') && E.atk(g, on(g, 0, CG)) === 1900 && E.def(g, on(g, 0, CG)) === 1700 && E.atk(g, on(g, 0, W)) === 2000, 'Celtic 1900/1700, Warwolf (not a Warrior) unchanged');
});
T('Gellenduo: not destroyed by battle; destroyed when you take damage', () => {
  const GE = 'Gellenduo';
  const g = duel({ first: 1, board: [{ turn: 2, m: [dpos(GE)] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, GE); toIdle(g);
  ok(on(g, 0, GE), 'survives battle in Defense');
  const g2 = duel({ first: 1, board: [{ turn: 2, m: [GE] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g2); bp(g2); atkOn(g2, 1, W, GE); toIdle(g2);
  ok(lp(g2, 0) === 7700 && inZ(g2, 0, 'gy', GE), `took 300, Gellenduo destroyed (A ${lp(g2, 0)})`);
  const g3 = duel({ board: [{ hand: ['Splendid Venus'], m: [GE], turn: 2 }, {}] });
  ns(g3, 0, 'Splendid Venus', GE); toIdle(g3, GE);
  ok(on(g3, 0, 'Splendid Venus') && inZ(g3, 0, 'gy', GE), 'Splendid Venus Tribute Summoned with Gellenduo alone');
});
T('Gem Flash Energy: 300 per face-up Continuous Spell each Standby', () => {
  const g = duel({ board: [{ hand: [], st: [up('Gem Flash Energy'), up('Level Limit - Area B'), up('Spell Absorption')], turn: 2 }, {}] });
  toIdle(g); endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(lp(g, 1) === 6800, `B took 600 in each of 2 Standby Phases (${lp(g, 1)})`);
});
T('Generation Shift: destroy your monster, add one with the same name', () => {
  const g = duel({ board: [{ hand: [], m: [CG], st: ['Generation Shift'], deckTop: [W, W, CG], turn: 2 }, {}] });
  act(g, 0, 'Generation Shift'); settle(g, CG); toIdle(g, CG);
  ok(inZ(g, 0, 'gy', CG) && inZ(g, 0, 'hand', CG), 'Celtic destroyed, another Celtic added');
});
T('Genesis Dragon: send a Dragon from hand to add a Dragon from GY; leaving returns Dragons', () => {
  const G = 'Genesis Dragon';
  const g = duel({ board: [{ hand: ['Masked Dragon'], m: [G], gy: [BEWD], turn: 2 }, {}] });
  ign(g, on(g, 0, G), BEWD, 'Masked Dragon'); toIdle(g);
  ok(inZ(g, 0, 'hand', BEWD) && inZ(g, 0, 'gy', 'Masked Dragon'), 'Blue-Eyes added, Masked Dragon sent');
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: [G], gy: [BEWD, 'Masked Dragon', CG], turn: 2 }, {}] });
  act(g2, 0, 'Dark Hole'); settle(g2, G); toIdle(g2, G);
  ok(!inZ(g2, 0, 'gy', BEWD) && !inZ(g2, 0, 'gy', G) && inZ(g2, 0, 'gy', CG), 'Dragons (Genesis too) back in the Deck, Celtic stays');
});
T('Genetic Woman: pay 1000, add a banished Psychic', () => {
  const g = duel({ board: [{ hand: [], m: ['Genetic Woman'], ban: ['Psychic Commander'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Genetic Woman'), 'Psychic Commander'); toIdle(g);
  ok(lp(g, 0) === 7000 && inZ(g, 0, 'hand', 'Psychic Commander'), 'paid 1000, Psychic Commander added');
});
T('Gernia: destroyed by an opponent card effect, returns in your next Standby', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Gernia'] }, { hand: ['Dark Hole'], turn: 2 }] });
  toIdle(g); act(g, 1, 'Dark Hole'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Gernia'), 'Gernia destroyed');
  endTurn(g, 'Attack'); toIdle(g, 'Attack');
  ok(g.tp === 0 && on(g, 0, 'Gernia'), 'Gernia back in A Standby Phase');
});
T('Ghost Gardna: takes the attack; when destroyed an opponent monster loses 1000', () => {
  const GG = 'Ghost Gardna';
  const g = duel({ first: 1, board: [{ turn: 2, m: [dpos(GG), CG] }, { hand: [], m: [W, W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, CG, GG); toIdle(g, GG, W);
  ok(on(g, 0, CG) && inZ(g, 0, 'gy', GG), 'Celtic safe, Ghost Gardna destroyed');
  const ws = mons(g, 1).map(c => E.atk(g, c)).sort();
  ok(ws.join() === '1000,2000', `one Warwolf at 1000 (${ws})`);
});

console.log(fails ? `\n${fails} failed` : '\nAll full-38 review checks passed.');
process.exit(fails ? 1 : 0);
