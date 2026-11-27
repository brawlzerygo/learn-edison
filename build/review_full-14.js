// Independent review checks for full pool batch 14 (written from the card text): node build/review_full-14.js
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
const start = (b, o = {}, ...picks) => { const g = duel({ ...o, board: b }); settle(g, ...picks); return g; };
const BE = 'Blue-Eyes White Dragon';

/* ---------------- Ryu ---------------- */
T('Ryu Kokki destroys the Spellcaster that beat it, not a Dragon', () => {
  let g = start([{ hand: [], m: ['Dark Magician'], turn: 2 }, { m: ['Ryu Kokki'] }]);
  bp(g); atkOn(g, 0, 'Dark Magician', 'Ryu Kokki');
  ok(inZ(g, 1, 'gy', 'Ryu Kokki') && inZ(g, 0, 'gy', 'Dark Magician'), 'Kokki lost the battle and still destroyed Dark Magician');
  g = start([{ hand: [], m: [BE], turn: 2 }, { m: ['Ryu Kokki'] }]);
  bp(g); atkOn(g, 0, BE, 'Ryu Kokki');
  ok(on(g, 0, BE), 'Blue-Eyes (Dragon) survives');
  g = start([{ hand: [], m: ['Ryu Kokki'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }, 'Celtic Guardian'] }]);
  bp(g); atkOn(g, 0, 'Ryu Kokki', 'Mystical Elf');
  ok(inZ(g, 1, 'gy', 'Mystical Elf'), 'Kokki attacking a Spellcaster: it is destroyed');
});
T('Ryu Senshi: Fusion Summon, pays 1000 to negate Mirror Force', () => {
  let g = start([{ hand: ['Polymerization', 'Warrior Dai Grepher', 'Spirit Ryu'], turn: 2 }, {}], { ex0: ['Ryu Senshi'] });
  act(g, 0, 'Polymerization'); settle(g, 'Ryu Senshi', 'Warrior Dai Grepher', 'Spirit Ryu', 'Attack');
  ok(on(g, 0, 'Ryu Senshi'), 'Ryu Senshi Fusion Summoned');
  g = start([{ hand: [], m: ['Ryu Senshi'], turn: 2 }, { st: ['Mirror Force'] }]);
  bp(g); atkOn(g, 0, 'Ryu Senshi', null, 'Mirror Force', 'Ryu Senshi');
  ok(on(g, 0, 'Ryu Senshi') && lp(g, 0) === 7000 && inZ(g, 1, 'gy', 'Mirror Force'), `Mirror Force negated for 1000 LP (A ${lp(g, 0)})`);
  ok(lp(g, 1) === 6000, `direct attack went through (B ${lp(g, 1)})`);
});
T('Ryu-Kishin Clown changes a face-up monster position on summon', () => {
  const g = start([{ hand: ['Ryu-Kishin Clown'], turn: 2 }, { m: [BE] }]);
  ns(g, 0, 'Ryu-Kishin Clown', BE);
  ok(on(g, 1, BE).pos === 'def', `Blue-Eyes is in Defense Position (${on(g, 1, BE).pos})`);
});

/* ---------------- Sasuke ---------------- */
T('Sasuke Samurai destroys a face-down Defense monster at the start of the Damage Step', () => {
  const g = start([{ hand: [], m: ['Sasuke Samurai'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'set' }] }]);
  bp(g); atkOn(g, 0, 'Sasuke Samurai', 'Mystical Elf');
  ok(inZ(g, 1, 'gy', 'Mystical Elf') && on(g, 0, 'Sasuke Samurai') && lp(g, 0) === 8000, `Elf destroyed, no damage (A ${lp(g, 0)})`);
});
T('Sasuke Samurai 2: pay 800, no Spells/Traps until the End Phase, once per turn', () => {
  const g = start([{ hand: ['Pot of Greed'], m: ['Sasuke Samurai 2'], turn: 2 }, { st: ['Mirror Force'] }]);
  choose(g, 'a:' + on(g, 0, 'Sasuke Samurai 2').u + ':'); settle(g);
  ok(lp(g, 0) === 7200, `paid 800 (${lp(g, 0)})`);
  ok(!canAct(g, 0, 'Pot of Greed'), 'Pot of Greed can no longer be activated');
  ok(!hasOpt(g, 'a:' + on(g, 0, 'Sasuke Samurai 2').u + ':'), 'once per turn');
  bp(g); atkOn(g, 0, 'Sasuke Samurai 2', null, 'Mirror Force');
  ok(inZ(g, 1, 'st', 'Mirror Force') && lp(g, 1) === 7800, 'Mirror Force could not be activated');
});
T('Sasuke Samurai 3: opponent draws to 7 after battle damage', () => {
  const g = start([{ hand: [], m: ['Sasuke Samurai 3'], turn: 2 }, { hand: [FILL] }]);
  bp(g); atkOn(g, 0, 'Sasuke Samurai 3', null);
  ok(lp(g, 1) === 7000 && hand(g, 1) === 7, `B at 7000 with 7 cards (hand ${hand(g, 1)})`);
});
T('Sasuke Samurai 4: coin toss when it battles', () => {
  let killed = 0, lost = 0;
  for (let s = 1; s <= 8; s++) {
    const g = start([{ hand: [], m: ['Sasuke Samurai 4'], turn: 2 }, { m: [BE] }], { seed: s });
    bp(g); atkOn(g, 0, 'Sasuke Samurai 4', BE, 'Heads');
    for (let i = 0; i < 5 && g.prompt && g.prompt.type !== 'battle' && g.prompt.type !== 'idle'; i++) settle(g, 'Heads');
    const tossed = g.log.some(l => /coin/i.test(l));
    if (!tossed) { ok(false, `seed ${s}: no coin toss`); break; }
    if (inZ(g, 1, 'gy', BE) && on(g, 0, 'Sasuke Samurai 4')) killed++;
    else if (on(g, 1, BE) && inZ(g, 0, 'gy', 'Sasuke Samurai 4') && lp(g, 0) === 6200) lost++;
  }
  ok(killed > 0 && lost > 0 && killed + lost === 8, `right call destroys Blue-Eyes (${killed}), wrong call normal battle (${lost})`);
});

/* ---------------- Secret ---------------- */
T('Secret Barrel: 200 per card in hand and on the field', () => {
  const g = start([{ hand: [], st: ['Secret Barrel'], turn: 2 }, { hand: [FILL, FILL, FILL], m: [FILL, FILL] }]);
  act(g, 0, 'Secret Barrel'); settle(g);
  ok(lp(g, 1) === 7000, `B took 1000 (${lp(g, 1)})`);
});
T('Secret Pass to the Treasures: a 1000-or-less monster attacks directly', () => {
  const g = start([{ hand: ['Secret Pass to the Treasures'], m: ['Mystical Elf', FILL], turn: 2 }, { m: [BE] }]);
  act(g, 0, 'Secret Pass to the Treasures'); settle(g, 'Mystical Elf');
  bp(g);
  ok(canAtk(g, on(g, 0, 'Mystical Elf'), null) && !canAtk(g, on(g, 0, FILL), null), 'Elf can attack directly, the Warwolf cannot');
  atkOn(g, 0, 'Mystical Elf', null); ok(lp(g, 1) === 7200, `800 direct (${lp(g, 1)})`);
});
T('Secret Village of the Spellcasters locks Spells', () => {
  let g = start([{ hand: ['Secret Village of the Spellcasters', 'Pot of Greed'], m: ['Dark Magician'], turn: 2 }, { st: ['Mystical Space Typhoon'] }]);
  act(g, 0, 'Secret Village of the Spellcasters'); settle(g);
  ok(canAct(g, 0, 'Pot of Greed'), 'A (with a Spellcaster) can still activate Spells');
  act(g, 0, 'Pot of Greed');
  ok(!hasOpt(g, 'Mystical Space Typhoon'), 'B (no Spellcaster) cannot chain MST'); settle(g);
  g = start([{ hand: ['Secret Village of the Spellcasters', 'Pot of Greed'], turn: 2 }, {}]);
  act(g, 0, 'Secret Village of the Spellcasters'); settle(g);
  ok(!canAct(g, 0, 'Pot of Greed'), 'A without a Spellcaster cannot activate Spells');
});

/* ---------------- Shadow ---------------- */
T('Shadow Delver: Gemini Summon, a Level 4 or lower DARK attacks directly', () => {
  const g = start([{ hand: [], m: ['Shadow Delver', 'Sangan'], turn: 2 }, { m: [BE] }]);
  ok(hasOpt(g, 'gem:'), 'Gemini Summon offered'); choose(g, 'gem:'); settle(g);
  const d = on(g, 0, 'Shadow Delver'); ok(hasOpt(g, 'a:' + d.u + ':'), 'effect offered after the Gemini Summon');
  choose(g, 'a:' + d.u + ':'); settle(g, 'Sangan');
  bp(g); ok(canAtk(g, on(g, 0, 'Sangan'), null), 'Sangan can attack directly');
  atkOn(g, 0, 'Sangan', null); ok(lp(g, 1) === 7000, `1000 direct (${lp(g, 1)})`);
  const g2 = start([{ hand: [], m: ['Shadow Delver', 'Sangan'], turn: 2 }, {}]);
  ok(!hasOpt(g2, 'a:' + on(g2, 0, 'Shadow Delver').u + ':'), 'no effect before the Gemini Summon');
});
T('Shadow Ghoul: +100 per monster in your GY', () => {
  const g = start([{ hand: [], m: ['Shadow Ghoul'], gy: [FILL, FILL, 'Sangan', 'Pot of Greed'], turn: 2 }, {}]);
  ok(E.atk(g, on(g, 0, 'Shadow Ghoul')) === 1900, `1900 ATK (${E.atk(g, on(g, 0, 'Shadow Ghoul'))})`);
});
T('Shadow of Eyes flips a Set monster to Attack Position without its Flip effect', () => {
  const g = start([{ hand: ['Man-Eater Bug'], turn: 2 }, { m: [FILL], st: ['Shadow of Eyes'] }]);
  choose(g, 'set:' + card(g, 0, 'Man-Eater Bug').u); settle(g, 'Shadow of Eyes', 'Man-Eater Bug');
  const b = on(g, 0, 'Man-Eater Bug');
  ok(b && b.pos === 'atk' && on(g, 1, FILL), `Bug face-up in Attack Position, no flip effect (${b && b.pos})`);
});
T('Shadow Spell: -700 ATK, cannot attack, destroyed when it leaves', () => {
  const g = start([{ hand: ['Dark Hole'], st: ['Shadow Spell'], turn: 2 }, { m: [BE] }]);
  act(g, 0, 'Shadow Spell'); settle(g, BE);
  ok(E.atk(g, on(g, 1, BE)) === 2300, `Blue-Eyes at 2300 (${E.atk(g, on(g, 1, BE))})`);
  endTurn(g);
  bp(g); ok(!canAtk(g, on(g, 1, BE), null), 'Blue-Eyes cannot attack');
  const g2 = start([{ hand: ['Dark Hole'], st: ['Shadow Spell'], turn: 2 }, { m: [BE] }]);
  act(g2, 0, 'Shadow Spell'); settle(g2, BE); act(g2, 0, 'Dark Hole'); settle(g2);
  ok(inZ(g2, 0, 'gy', 'Shadow Spell'), 'Shadow Spell destroyed when Blue-Eyes left');
});
T('Shadow Tamer (Archfiend): FLIP takes a Fiend until the End Phase', () => {
  const g = start([{ hand: [], m: [{ n: 'Shadow Tamer (Archfiend)', pos: 'set' }], turn: 2 }, { m: ['Archfiend Soldier'] }]);
  choose(g, 'flip:'); settle(g, 'Archfiend Soldier');
  ok(on(g, 0, 'Archfiend Soldier'), 'A controls Archfiend Soldier');
  endTurn(g); ok(on(g, 1, 'Archfiend Soldier'), 'it went back at the End Phase');
});
T('Shield & Sword switches ATK and DEF', () => {
  const g = start([{ hand: ['Shield & Sword'], m: [BE], turn: 2 }, { m: ['Mystical Elf'] }]);
  act(g, 0, 'Shield & Sword'); settle(g);
  const b = on(g, 0, BE), e = on(g, 1, 'Mystical Elf');
  ok(E.atk(g, b) === 2500 && E.def(g, b) === 3000 && E.atk(g, e) === 2000 && E.def(g, e) === 800, `BE ${E.atk(g, b)}/${E.def(g, b)}, Elf ${E.atk(g, e)}/${E.def(g, e)}`);
  bp(g); atkOn(g, 0, BE, 'Mystical Elf'); ok(lp(g, 1) === 7500, `500 damage (${lp(g, 1)})`);
  endTurn(g); ok(E.atk(g, on(g, 0, BE)) === 3000, 'back to 3000 next turn');
});
T('Shield Crush destroys a Defense Position monster', () => {
  const g = start([{ hand: ['Shield Crush'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }, BE] }]);
  act(g, 0, 'Shield Crush'); settle(g, 'Mystical Elf');
  ok(inZ(g, 1, 'gy', 'Mystical Elf') && on(g, 1, BE), 'Elf destroyed, Blue-Eyes stays');
});
T('Shield Spear: +400 ATK/DEF this turn', () => {
  const g = start([{ hand: [], m: [BE], st: ['Shield Spear'], turn: 2 }, {}]);
  act(g, 0, 'Shield Spear'); settle(g, BE);
  const b = on(g, 0, BE); ok(E.atk(g, b) === 3400 && E.def(g, b) === 2900, `${E.atk(g, b)}/${E.def(g, b)}`);
  endTurn(g); ok(E.atk(g, on(g, 0, BE)) === 3000, 'gone next turn');
});
T('Shield Warrior banishes from the GY so the battle destroys nothing', () => {
  const g = start([{ hand: [], m: ['Celtic Guardian'], gy: ['Shield Warrior'], turn: 2 }, { m: [BE] }]);
  bp(g); atkOn(g, 0, 'Celtic Guardian', BE, 'Shield Warrior');
  ok(on(g, 0, 'Celtic Guardian') && inZ(g, 0, 'ban', 'Shield Warrior'), 'Celtic Guardian survives, Shield Warrior banished');
  ok(lp(g, 0) === 6400, `damage still taken (${lp(g, 0)})`);
});
T('Shield Wing survives two battles a turn', () => {
  const g = start([{ hand: [], m: [FILL, FILL, FILL], turn: 2 }, { m: [{ n: 'Shield Wing', pos: 'def' }] }]);
  bp(g);
  const ws = g.p[0].m.filter(Boolean);
  choose(g, `atk:${ws[0].u}:${on(g, 1, 'Shield Wing').u}`); settle(g);
  choose(g, `atk:${ws[1].u}:${on(g, 1, 'Shield Wing').u}`); settle(g);
  ok(on(g, 1, 'Shield Wing'), 'survives two attacks');
  choose(g, `atk:${ws[2].u}:${on(g, 1, 'Shield Wing').u}`); settle(g);
  ok(inZ(g, 1, 'gy', 'Shield Wing'), 'destroyed by the third');
});
T('Shield Worm: to Defense, mills 1 per face-up Insect', () => {
  const g = start([{ hand: ['Shield Worm'], m: ['Insect Knight'], turn: 2 }, {}]);
  ns(g, 0, 'Shield Worm');
  ok(on(g, 0, 'Shield Worm').pos === 'def' && cnt(g, 1, 'gy') === 2, `Defense, B milled ${cnt(g, 1, 'gy')}`);
});
T('Shooting Star Bow - Ceal: -1000 ATK, attacks directly', () => {
  const g = start([{ hand: ['Shooting Star Bow - Ceal'], m: [BE], turn: 2 }, { m: [FILL] }]);
  act(g, 0, 'Shooting Star Bow - Ceal'); settle(g, BE);
  ok(E.atk(g, on(g, 0, BE)) === 2000, `2000 ATK (${E.atk(g, on(g, 0, BE))})`);
  bp(g); ok(canAtk(g, on(g, 0, BE), null), 'direct attack offered'); atkOn(g, 0, BE, null);
  ok(lp(g, 1) === 6000, `2000 direct (${lp(g, 1)})`);
});

/* ---------------- Silent ---------------- */
T('Silent Abyss destroys face-down and non-WATER monsters when destroyed by battle', () => {
  const g = start([{ hand: [], m: [BE, 'Gagagigo'], turn: 2 }, { m: ['Silent Abyss', { n: FILL, pos: 'set' }, 'Giga Gagagigo'] }]);
  bp(g); atkOn(g, 0, BE, 'Silent Abyss');
  ok(inZ(g, 0, 'gy', BE) && on(g, 0, 'Gagagigo') && on(g, 1, 'Giga Gagagigo') && cnt(g, 1, 'm') === 1, 'Blue-Eyes and the Set Warwolf destroyed, WATER face-ups stay');
});
T('Silent Doom revives a Normal Monster in Defense', () => {
  const g = start([{ hand: ['Silent Doom'], gy: [BE, 'Sangan'], turn: 2 }, {}]);
  act(g, 0, 'Silent Doom'); settle(g, BE);
  const b = on(g, 0, BE); ok(b && b.pos === 'def', 'Blue-Eyes in face-up Defense');
  const g2 = start([{ hand: ['Silent Doom'], gy: ['Sangan'], turn: 2 }, {}]);
  ok(!canAct(g2, 0, 'Silent Doom'), 'not with only an Effect Monster');
});
T('Silent Insect: to Defense, negates Continuous Traps', () => {
  const g = start([{ hand: ['Silent Insect'], m: [FILL], turn: 2 }, { st: [{ n: 'Gravity Bind', pos: 'up' }] }]);
  ns(g, 0, 'Silent Insect');
  ok(on(g, 0, 'Silent Insect').pos === 'def', 'Defense Position');
  bp(g); ok(canAtk(g, on(g, 0, FILL), null), 'Gravity Bind negated: the Warwolf can attack');
});
T('Silent Magician LV4: counters on opponent draws, LV8 after 5', () => {
  const g = start([{ hand: [], m: ['Silent Magician LV4'], deckTop: [FILL, FILL, 'Silent Magician LV8'], turn: 2 }, {}]);
  const m = on(g, 0, 'Silent Magician LV4'); E.lib.addCtr(g, m, 'spell', 4);
  endTurn(g);
  ok(E.lib.ctr(m, 'spell') === 5 && E.atk(g, m) === 3500, `5 counters, 3500 ATK (${E.lib.ctr(m, 'spell')}, ${E.atk(g, m)})`);
  endTurn(g, 'Silent Magician LV8');
  ok(on(g, 0, 'Silent Magician LV8') && inZ(g, 0, 'gy', 'Silent Magician LV4'), 'LV8 Special Summoned in the Standby Phase');
});
T('Silent Magician LV8: no Normal Summon, unaffected by opponent Spells', () => {
  const g = start([{ hand: ['Silent Magician LV8', 'Dark Hole'], turn: 2 }, { m: ['Silent Magician LV8'] }]);
  ok(noSummon(g, card(g, 0, 'Silent Magician LV8')), 'cannot be Normal Summoned');
  act(g, 0, 'Dark Hole'); settle(g); ok(on(g, 1, 'Silent Magician LV8'), 'Dark Hole does not destroy it');
});
T('Silent Strider: discard to lower a Level by 1', () => {
  const g = start([{ hand: ['Silent Strider'], m: [BE], turn: 2 }, {}]);
  act(g, 0, 'Silent Strider'); settle(g, BE);
  ok(LV(on(g, 0, BE)) === 7 && inZ(g, 0, 'gy', 'Silent Strider'), `Level ${LV(on(g, 0, BE))}`);
});
T('Silent Swordsman LV3: becomes LV5 in the Standby Phase, negates targeting Spells', () => {
  const g = start([{ hand: [], m: ['Silent Swordsman LV3'], deckTop: [FILL, 'Silent Swordsman LV5'], turn: 2 }, {}], {}, 'Silent Swordsman LV5');
  ok(on(g, 0, 'Silent Swordsman LV5') && inZ(g, 0, 'gy', 'Silent Swordsman LV3'), 'LV5 Special Summoned from the Deck');
  const g2 = start([{ hand: ['Book of Moon'], turn: 2 }, { m: ['Silent Swordsman LV3'] }]);
  act(g2, 0, 'Book of Moon'); settle(g2, 'Silent Swordsman LV3');
  ok(on(g2, 1, 'Silent Swordsman LV3').pos === 'atk', 'Book of Moon negated');
  const g3 = start([{ hand: ['Silent Swordsman LV3'], deckTop: [FILL, 'Silent Swordsman LV5'], turn: 2 }, {}]);
  ns(g3, 0, 'Silent Swordsman LV3'); endTurn(g3); endTurn(g3, 'Silent Swordsman LV5');
  ok(on(g3, 0, 'Silent Swordsman LV5'), 'summoned on a later turn, it levels up');
});
T('Silent Swordsman LV5: unaffected by opponent Spells, LV7 after a direct hit', () => {
  const g = start([{ hand: ['Dark Hole'], turn: 2 }, { m: ['Silent Swordsman LV5'] }]);
  act(g, 0, 'Dark Hole'); settle(g); ok(on(g, 1, 'Silent Swordsman LV5'), 'Dark Hole does not destroy it');
  const g2 = start([{ hand: [], m: ['Silent Swordsman LV5'], deckTop: [FILL, FILL, 'Silent Swordsman LV7'], turn: 2 }, {}]);
  bp(g2); atkOn(g2, 0, 'Silent Swordsman LV5', null); ok(lp(g2, 1) === 5700, 'direct hit');
  endTurn(g2); endTurn(g2, 'Silent Swordsman LV7');
  ok(on(g2, 0, 'Silent Swordsman LV7'), 'LV7 Special Summoned');
});
T('Silent Swordsman LV7: no Normal Summon, negates Spells on the field', () => {
  const g = start([{ hand: ['Silent Swordsman LV7'], m: ['Silent Swordsman LV7'], turn: 2 }, { st: [{ n: 'Messenger of Peace', pos: 'up' }] }]);
  ok(noSummon(g, card(g, 0, 'Silent Swordsman LV7')), 'cannot be Normal Summoned');
  bp(g); ok(canAtk(g, on(g, 0, 'Silent Swordsman LV7'), null), 'Messenger of Peace negated');
});
T('Sinister Seeds: a Token per 500 battle damage', () => {
  const g = start([{ hand: [], m: [BE], turn: 2 }, { m: ['Celtic Guardian'], st: ['Sinister Seeds'] }]);
  bp(g); atkOn(g, 0, BE, 'Celtic Guardian', 'Sinister Seeds');
  ok(cnt(g, 1, 'm', 'Sinister Seed Token') === 3, `3 Tokens (${cnt(g, 1, 'm')})`);
});
T('Sinister Serpent returns to the hand in the Standby Phase', () => {
  const g = start([{ hand: [], gy: ['Sinister Serpent'], turn: 2 }, {}], {}, 'Sinister Serpent');
  ok(inZ(g, 0, 'hand', 'Sinister Serpent'), 'Serpent added to the hand');
});
T('Sinister Sprocket: Synchro material for a DARK Synchro destroys a face-up Spell/Trap', () => {
  const g = start([{ hand: [], m: ['Sinister Sprocket', FILL], turn: 2 }, { st: [{ n: 'Messenger of Peace', pos: 'up' }] }], { ex0: ['Ally of Justice Catastor'] });
  ok(hasOpt(g, 'syn:') || hasOpt(g, 'Synchro'), 'Synchro offered'); choose(g, 'Synchro'); settle(g, 'Messenger of Peace', 'Attack');
  ok(on(g, 0, 'Ally of Justice Catastor') && inZ(g, 1, 'gy', 'Messenger of Peace'), 'Catastor summoned, Messenger destroyed');
});

/* ---------------- Skull ---------------- */
T('Skull Archfiend of Lightning pays 500 in the Standby Phase', () => {
  const g = start([{ hand: [], m: ['Skull Archfiend of Lightning'], turn: 2 }, {}]);
  ok(on(g, 0, 'Skull Archfiend of Lightning') && lp(g, 0) === 7500, `paid 500 (${lp(g, 0)})`);
  const g2 = start([{ hand: [], m: ['Skull Archfiend of Lightning'], turn: 2 }, {}], {}, 'NO');
  ok(lp(g2, 0) === 8000 ? inZ(g2, 0, 'gy', 'Skull Archfiend of Lightning') : on(g2, 0, 'Skull Archfiend of Lightning'), 'not paying destroys it (or payment is forced)');
});
T('Skull Conductor: destroyed after the Battle Phase, discards to summon Zombies worth 2000', () => {
  let g = start([{ hand: [], m: ['Skull Conductor'], turn: 2 }, {}]);
  bp(g); choose(g, 'endbp'); settle(g);
  ok(inZ(g, 0, 'gy', 'Skull Conductor'), 'destroyed at the end of the Battle Phase');
  g = start([{ hand: ['Skull Conductor', 'Burning Skull Head', 'Plague Wolf'], turn: 2 }, {}]);
  act(g, 0, 'Skull Conductor'); settle(g, 'Burning Skull Head', 'Plague Wolf', 'Attack');
  ok(on(g, 0, 'Burning Skull Head') && on(g, 0, 'Plague Wolf') && inZ(g, 0, 'gy', 'Skull Conductor'), 'two Zombies Special Summoned');
});
T('Skull Dice: opponent monsters lose die x 100', () => {
  const g = start([{ hand: [], st: ['Skull Dice'], turn: 2 }, { m: [BE] }]);
  act(g, 0, 'Skull Dice'); settle(g);
  const b = on(g, 1, BE), d = 3000 - E.atk(g, b);
  ok(d >= 100 && d <= 600 && d % 100 === 0 && 2500 - E.def(g, b) === d, `lost ${d} ATK and DEF`);
});
T('Skull Flame: summons Burning Skull Head (no Battle Phase), or takes it from the GY for the draw', () => {
  let g = start([{ hand: ['Burning Skull Head'], m: ['Skull Flame'], turn: 2 }, {}]);
  choose(g, 'a:' + on(g, 0, 'Skull Flame').u + ':'); settle(g, 'Burning Skull Head', 'Attack');
  ok(on(g, 0, 'Burning Skull Head'), 'Burning Skull Head Special Summoned');
  ok(!hasOpt(g, 'bp'), 'no Battle Phase');
  g = start([{ hand: [], m: ['Skull Flame'], gy: ['Burning Skull Head'], turn: 2 }, {}], {}, 'Burning Skull Head');
  ok(inZ(g, 0, 'hand', 'Burning Skull Head') && hand(g, 0) === 1, `Burning Skull Head added instead of the draw (hand ${hand(g, 0)})`);
});
T('Skull Guardian: Ritual Summon with Novox\'s Prayer', () => {
  const g = start([{ hand: ["Novox's Prayer", 'Skull Guardian'], m: ['Dark Magician'], turn: 2 }, {}]);
  act(g, 0, "Novox's Prayer"); settle(g, 'Skull Guardian', 'Dark Magician', 'Attack');
  ok(on(g, 0, 'Skull Guardian') && inZ(g, 0, 'gy', 'Dark Magician'), 'Skull Guardian Ritual Summoned');
});
T('Skull Invitation: 300 to the owner per card sent to the GY', () => {
  const g = start([{ hand: ['Dark Hole'], m: [FILL], st: [{ n: 'Skull Invitation', pos: 'up' }], turn: 2 }, { m: [FILL, FILL] }]);
  act(g, 0, 'Dark Hole'); settle(g);
  ok(lp(g, 1) === 7400 && lp(g, 0) === 7400, `A ${lp(g, 0)} (monster + Dark Hole), B ${lp(g, 1)}`);
});
T('Skull Knight: Fusion Summon', () => {
  const g = start([{ hand: ['Polymerization', 'Tainted Wisdom', 'Ancient Brain'], turn: 2 }, {}], { ex0: ['Skull Knight'] });
  act(g, 0, 'Polymerization'); settle(g, 'Skull Knight', 'Tainted Wisdom', 'Ancient Brain', 'Attack');
  ok(on(g, 0, 'Skull Knight'), 'Skull Knight Fusion Summoned');
});
T('Skull Knight 2: Tributed for a Fiend, summons another from the Deck', () => {
  const g = start([{ hand: ['Archfiend of Gilfer'], m: ['Skull Knight 2'], deckTop: [FILL, 'Skull Knight 2'], turn: 2 }, {}]);
  ns(g, 0, 'Archfiend of Gilfer', 'Skull Knight 2');
  ok(on(g, 0, 'Archfiend of Gilfer') && on(g, 0, 'Skull Knight 2'), 'Skull Knight 2 Special Summoned from the Deck');
  const g2 = start([{ hand: [BE], m: ['Skull Knight 2', FILL], deckTop: [FILL, 'Skull Knight 2'], turn: 2 }, {}]);
  ns(g2, 0, BE, 'Skull Knight 2', FILL);
  ok(!on(g2, 0, 'Skull Knight 2'), 'not for a Dragon');
});
T('Skull Lair: banish N monsters to destroy a Level N monster', () => {
  const g = start([{ hand: [], st: [{ n: 'Skull Lair', pos: 'up' }], gy: [FILL, FILL, FILL, FILL, 'Sangan'], turn: 2 }, { m: ['Archfiend Soldier', BE] }]);
  act(g, 0, 'Skull Lair'); settle(g, 'Archfiend Soldier', '4', FILL, FILL, FILL, FILL);
  ok(inZ(g, 1, 'gy', 'Archfiend Soldier') && on(g, 1, BE) && cnt(g, 0, 'ban') === 4, `Archfiend Soldier destroyed, 4 banished (${cnt(g, 0, 'ban')})`);
});
T('Skull-Mark Ladybug: +1000 LP when sent to the GY', () => {
  const g = start([{ hand: ['Dark Hole'], m: ['Skull-Mark Ladybug'], turn: 2 }, {}]);
  act(g, 0, 'Dark Hole'); settle(g); ok(lp(g, 0) === 9000, `A ${lp(g, 0)}`);
});

/* ---------------- Snake / Sonic ---------------- */
T('Snake Deity\'s Command negates a Spell', () => {
  const g = start([{ hand: ['Pot of Greed'], turn: 2 }, { hand: ['Venom Snake'], st: ["Snake Deity's Command"] }]);
  const h = hand(g, 0); act(g, 0, 'Pot of Greed'); settle(g, "Snake Deity's Command", 'Venom Snake');
  ok(hand(g, 0) === h - 1 && inZ(g, 0, 'gy', 'Pot of Greed'), `Pot negated (hand ${hand(g, 0)})`);
  const g2 = start([{ hand: ['Pot of Greed'], turn: 2 }, { hand: [FILL], st: ["Snake Deity's Command"] }]);
  act(g2, 0, 'Pot of Greed'); ok(!hasOpt(g2, "Snake Deity"), 'not without a Venom monster'); settle(g2);
});
T('Snake Fang: -500 DEF this turn', () => {
  const g = start([{ hand: [], st: ['Snake Fang'], turn: 2 }, { m: [BE] }]);
  act(g, 0, 'Snake Fang'); settle(g, BE); ok(E.def(g, on(g, 1, BE)) === 2000, `DEF ${E.def(g, on(g, 1, BE))}`);
});
T('Snake Rain: discard 1, send 4 Reptiles from the Deck to the GY', () => {
  const g = start([{ hand: ['Snake Rain', 'Sangan'], deckTop: [FILL, 'Gagagigo', 'Gigobyte', 'Armored Lizard', 'Drooling Lizard', 'Venom Cobra'], turn: 2 }, {}]);
  act(g, 0, 'Snake Rain'); settle(g, 'Sangan', 'Gagagigo', 'Gigobyte', 'Armored Lizard', 'Drooling Lizard');
  ok(inZ(g, 0, 'gy', 'Sangan') && g.p[0].gy.filter(c => E.lib.race(c) === 'Reptile').length === 4, `4 Reptiles in the GY (${g.p[0].gy.map(E.name).join(', ')})`);
});
T('Snake Whistle: a Reptile destroyed by an effect brings a Level 4 or lower Reptile from the Deck', () => {
  const g = start([{ hand: ['Fissure'], turn: 2 }, { m: ['Gagagigo'], st: ['Snake Whistle'], deckTop: ['Ancient Lizard Warrior'] }]);
  act(g, 0, 'Fissure'); settle(g, 'Snake Whistle', 'Ancient Lizard Warrior', 'Attack');
  ok(on(g, 1, 'Ancient Lizard Warrior'), 'Ancient Lizard Warrior Special Summoned');
});
T('Sonic Bird searches a Ritual Spell', () => {
  const g = start([{ hand: ['Sonic Bird'], deckTop: [FILL, "Novox's Prayer"], turn: 2 }, {}]);
  ns(g, 0, 'Sonic Bird', "Novox's Prayer"); ok(inZ(g, 0, 'hand', "Novox's Prayer"), 'Novox\'s Prayer added');
});
T('Sonic Chick: not destroyed by battle with a 1900+ ATK monster', () => {
  const g = start([{ hand: [], m: [BE, 'Celtic Guardian'], turn: 2 }, { m: [{ n: 'Sonic Chick', pos: 'def' }] }]);
  bp(g); atkOn(g, 0, BE, 'Sonic Chick'); ok(on(g, 1, 'Sonic Chick'), 'survives Blue-Eyes');
  atkOn(g, 0, 'Celtic Guardian', 'Sonic Chick'); ok(inZ(g, 1, 'gy', 'Sonic Chick'), 'destroyed by Celtic Guardian');
});
T('Sonic Jammer: FLIP stops opponent Spells', () => {
  const g = start([{ hand: ['Pot of Greed'], m: [{ n: 'Sonic Jammer', pos: 'set' }], turn: 2 }, { st: ['Mystical Space Typhoon'] }]);
  choose(g, 'flip:'); settle(g);
  act(g, 0, 'Pot of Greed'); ok(!hasOpt(g, 'Mystical Space Typhoon'), 'B cannot chain MST'); settle(g);
});
T('Sonic Shooter: direct attack for its original ATK when the S/T Zone is empty', () => {
  let g = start([{ hand: [], m: ['Sonic Shooter'], turn: 2 }, { m: [BE] }]);
  bp(g); ok(canAtk(g, on(g, 0, 'Sonic Shooter'), null), 'direct attack offered'); atkOn(g, 0, 'Sonic Shooter', null);
  ok(lp(g, 1) === 6700, `1300 (${lp(g, 1)})`);
  g = start([{ hand: [], m: ['Sonic Shooter'], turn: 2 }, { m: [BE], st: ['Mirror Force'] }]);
  bp(g); ok(!canAtk(g, on(g, 0, 'Sonic Shooter'), null), 'no direct attack with a Set card');
});

/* ---------------- Soul ---------------- */
T('Soul of Purity and Light + Soul Absorption', () => {
  const g = start([{ hand: ['Soul of Purity and Light'], gy: ['Mystical Elf', 'Ancient Elf', 'Sangan'], st: [{ n: 'Soul Absorption', pos: 'up' }], turn: 2 }, { m: [BE] }]);
  const s = card(g, 0, 'Soul of Purity and Light');
  ok(!hasOpt(g, 'ns:' + s.u) && !hasOpt(g, 'set:' + s.u), 'cannot be Normal Summoned/Set');
  choose(g, 'sp:' + s.u); settle(g, 'Mystical Elf', 'Ancient Elf', 'Attack');
  ok(on(g, 0, 'Soul of Purity and Light') && cnt(g, 0, 'ban') === 2, 'Special Summoned by banishing 2 LIGHTs');
  ok(lp(g, 0) === 9000, `Soul Absorption gave 1000 (${lp(g, 0)})`);
  ok(E.atk(g, on(g, 1, BE)) === 3000, 'no loss outside their Battle Phase');
  endTurn(g); bp(g); ok(E.atk(g, on(g, 1, BE)) === 2700, `2700 in B's Battle Phase (${E.atk(g, on(g, 1, BE))})`);
});
T('Soul Demolition: pay 500, each player banishes 1 from the opponent GY', () => {
  const g = start([{ hand: [], m: ['Archfiend Soldier'], gy: ['Mystical Elf'], st: [{ n: 'Soul Demolition', pos: 'up' }], turn: 2 }, { gy: [BE] }]);
  ok(canAct(g, 0, 'Soul Demolition'), 'offered with a Fiend'); act(g, 0, 'Soul Demolition'); settle(g, BE, 'Mystical Elf');
  ok(lp(g, 0) === 7500 && inZ(g, 1, 'ban', BE) && inZ(g, 0, 'ban', 'Mystical Elf'), `paid 500 (${lp(g, 0)}), both banished`);
  const g2 = start([{ hand: [], m: [FILL], gy: ['Mystical Elf'], st: [{ n: 'Soul Demolition', pos: 'up' }], turn: 2 }, { gy: [BE] }]);
  ok(!canAct(g2, 0, 'Soul Demolition'), 'not without a Fiend');
});
T('Soul Devouring Bamboo Sword: battle damage skips the next Draw Phase', () => {
  const g = start([{ hand: ['Broken Bamboo Sword', 'Soul Devouring Bamboo Sword'], m: [BE], turn: 2 }, { hand: [] }]);
  act(g, 0, 'Broken Bamboo Sword'); settle(g, BE);
  act(g, 0, 'Soul Devouring Bamboo Sword'); settle(g, BE);
  bp(g); atkOn(g, 0, BE, null); ok(lp(g, 1) < 8000, 'damage dealt');
  endTurn(g); ok(hand(g, 1) === 0, `B skipped the draw (hand ${hand(g, 1)})`);
});
T('Soul of Fire: opponent draws, banish a Pyro, burn half its ATK, no attacks', () => {
  const g = start([{ hand: ['Soul of Fire'], m: [BE], deckTop: [FILL, 'Flame Cerebrus'], turn: 2 }, { hand: [] }]);
  act(g, 0, 'Soul of Fire'); settle(g, 'Flame Cerebrus');
  ok(hand(g, 1) === 1 && inZ(g, 0, 'ban', 'Flame Cerebrus') && lp(g, 1) === 6950, `B drew 1, took 1050 (${lp(g, 1)})`);
  if (hasOpt(g, 'bp')) { bp(g); ok(!canAtk(g, on(g, 0, BE), null), 'no attack'); } else ok(true, 'no Battle Phase');
});
T('Soul of the Pure: +800 LP', () => {
  const g = start([{ hand: ['Soul of the Pure'], turn: 2 }, {}]);
  act(g, 0, 'Soul of the Pure'); settle(g); ok(lp(g, 0) === 8800, `${lp(g, 0)}`);
});
T('Soul Resurrection revives a Normal Monster in Defense, linked', () => {
  const g = start([{ hand: ['Fissure'], st: ['Soul Resurrection'], gy: [BE], turn: 2 }, {}]);
  act(g, 0, 'Soul Resurrection'); settle(g, BE);
  ok(on(g, 0, BE) && on(g, 0, BE).pos === 'def', 'Blue-Eyes in Defense');
  const g2 = start([{ hand: ['Dark Hole'], st: ['Soul Resurrection'], gy: [BE], turn: 2 }, {}]);
  act(g2, 0, 'Soul Resurrection'); settle(g2, BE); act(g2, 0, 'Dark Hole'); settle(g2);
  ok(inZ(g2, 0, 'gy', 'Soul Resurrection'), 'Soul Resurrection destroyed with the monster');
  const g3 = start([{ hand: ['Mystical Space Typhoon'], st: ['Soul Resurrection'], gy: [BE], turn: 2 }, {}]);
  act(g3, 0, 'Soul Resurrection'); settle(g3, BE); act(g3, 0, 'Mystical Space Typhoon'); settle(g3, 'Soul Resurrection');
  ok(inZ(g3, 0, 'gy', BE), 'monster destroyed when Soul Resurrection leaves');
});
T('Soul Reversal: a Flip monster from the GY to the top of the Deck', () => {
  const g = start([{ hand: ['Soul Reversal'], gy: ['Man-Eater Bug'], turn: 2 }, {}]);
  act(g, 0, 'Soul Reversal'); settle(g, 'Man-Eater Bug'); ok(deckTopName(g, 0) === 'Man-Eater Bug', 'Man-Eater Bug on top');
});
T('Soul Rope: pay 1000, Special Summon a Level 4 from the Deck', () => {
  const g = start([{ hand: ['Fissure'], turn: 2 }, { m: ['Celtic Guardian'], st: ['Soul Rope'] }]);
  act(g, 0, 'Fissure'); settle(g, 'Soul Rope', FILL, 'Attack');
  ok(lp(g, 1) === 7000 && on(g, 1, FILL), `B paid 1000 (${lp(g, 1)}) and summoned a Warwolf`);
});
T('Soul-Absorbing Bone Tower: no attacks on it with another Zombie, mills 2 per Zombie Special Summon', () => {
  let g = start([{ hand: [], m: [BE], turn: 2 }, { m: ['Soul-Absorbing Bone Tower', 'Pyramid Turtle'] }]);
  bp(g);
  ok(!canAtk(g, on(g, 0, BE), on(g, 1, 'Soul-Absorbing Bone Tower')) && canAtk(g, on(g, 0, BE), on(g, 1, 'Pyramid Turtle')), 'Bone Tower cannot be attacked, Pyramid Turtle can');
  g = start([{ hand: ['Monster Reborn'], m: ['Soul-Absorbing Bone Tower'], gy: ['Pyramid Turtle'], turn: 2 }, {}]);
  act(g, 0, 'Monster Reborn'); settle(g, 'Pyramid Turtle', 'Attack');
  ok(cnt(g, 1, 'gy') === 2, `B milled 2 (${cnt(g, 1, 'gy')})`);
});

// Goat: the goat-only cards and a few shared scripts with the Goat card pool
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
  G('Sasuke Samurai #2 pays 800 and locks Spells/Traps', () => {
    const g = gduel([{ hand: ['Pot of Greed'], m: ['Sasuke Samurai #2'], turn: 2 }, {}]);
    choose(g, 'a:' + on(g, 0, 'Sasuke Samurai #2').u + ':'); settle(g);
    ok(lp(g, 0) === 7200 && !canAct(g, 0, 'Pot of Greed'), 'Goat: paid 800, Pot locked');
  });
  G('Skull Knight #2 replaces itself for a Fiend', () => {
    const g = gduel([{ hand: ['Summoned Skull'], m: ['Skull Knight #2'], deckTop: [GF, 'Skull Knight #2'], turn: 2 }, {}]);
    ns(g, 0, 'Summoned Skull', 'Skull Knight #2');
    ok(on(g, 0, 'Summoned Skull') && on(g, 0, 'Skull Knight #2'), 'Goat: Skull Knight #2 from the Deck');
  });
  G('Shadow Tamer takes a Fiend', () => {
    const g = gduel([{ hand: [], m: [{ n: 'Shadow Tamer', pos: 'set' }], turn: 2 }, { m: ['Summoned Skull'] }]);
    choose(g, 'flip:'); settle(g, 'Summoned Skull'); ok(on(g, 0, 'Summoned Skull'), 'Goat: control taken');
  });
  G('Ryu Kokki, Secret Barrel, Shadow Ghoul, Skull-Mark Ladybug', () => {
    let g = gduel([{ hand: [], m: ['Celtic Guardian'], turn: 2 }, { m: [{ n: 'Ryu Kokki', pos: 'def' }] }]);
    bp(g); atkOn(g, 0, 'Celtic Guardian', 'Ryu Kokki'); ok(inZ(g, 0, 'gy', 'Celtic Guardian') && on(g, 1, 'Ryu Kokki'), 'Goat: Kokki destroys the Warrior that attacked it');
    g = gduel([{ hand: [], st: ['Secret Barrel'], turn: 2 }, { hand: [GF, GF], m: [GF] }]);
    act(g, 0, 'Secret Barrel'); settle(g); ok(lp(g, 1) === 7400, `Goat: Barrel 600 (${lp(g, 1)})`);
    g = gduel([{ hand: [], m: ['Shadow Ghoul'], gy: [GF, GF], turn: 2 }, {}]);
    ok(E.atk(g, on(g, 0, 'Shadow Ghoul')) === 1800, 'Goat: Shadow Ghoul 1800');
    g = gduel([{ hand: ['Dark Hole'], m: ['Skull-Mark Ladybug'], turn: 2 }, {}]);
    act(g, 0, 'Dark Hole'); settle(g); ok(lp(g, 0) === 9000, 'Goat: Ladybug +1000');
  });
}
console.log(fails ? `\n${fails} failed` : '\nAll full-14 review checks passed.');
process.exit(fails ? 1 : 0);
