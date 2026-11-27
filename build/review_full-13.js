// Independent review checks for full pool batch 13 (written from the card text): node build/review_full-13.js
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

/* ---------------- Power ---------------- */
T('Power Bond: Machine Fusion with double ATK, owner takes the bonus in the End Phase', () => {
  const g = duel({ ex0: ['Cyber Twin Dragon'], board: [{ hand: ['Power Bond', 'Cyber Dragon', 'Cyber Dragon'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Power Bond'), 'Power Bond offered'); act(g, 0, 'Power Bond'); settle(g, 'Cyber Twin Dragon', 'Attack');
  const t = on(g, 0, 'Cyber Twin Dragon');
  ok(t && E.atk(g, t) === 5600 && cnt(g, 0, 'gy', 'Cyber Dragon') === 2, `Cyber Twin Dragon has ${t && E.atk(g, t)} ATK, materials in GY`);
  endTurn(g);
  ok(lp(g, 0) === 8000 - 2800, `A took 2800 in the End Phase (${lp(g, 0)})`);
  const g2 = duel({ ex0: ['Cyber Twin Dragon'], board: [{ hand: ['Power Bond', 'Mystical Elf', 'Mystical Elf'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Power Bond'), 'not offered without Machine materials');
});
T('Power Capsule: applies a Victory Viper XX03 effect', () => {
  if (!E.scripted('Victory Viper XX03')) {
    const g = duel({ board: [{ hand: ['Power Capsule'], m: [FILL], turn: 2 }, {}] });
    ok(!canAct(g, 0, 'Power Capsule'), 'not offered without Victory Viper XX03 (Viper itself is not scripted yet)'); return; }
  const g = duel({ board: [{ hand: ['Power Capsule'], m: ['Victory Viper XX03'], turn: 2 }, { st: [up('Swords of Revealing Light')] }] });
  act(g, 0, 'Power Capsule'); settle(g, 'Victory Viper XX03', 'destroy', 'Swords');
  ok(inZ(g, 1, 'gy', 'Swords of Revealing Light') || E.atk(g, on(g, 0, 'Victory Viper XX03')) === 1600, 'an XX03 effect applied');
});
T('Power Filter: blocks Special Summons of 1000 or less ATK', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], st: [up('Power Filter')], gy: ['Sangan'], turn: 2 }, {}] });
  if (canAct(g, 0, 'Monster Reborn')) { act(g, 0, 'Monster Reborn'); settle(g, 'Sangan'); }
  ok(!on(g, 0, 'Sangan'), 'Sangan (1000 ATK) not Special Summoned');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], st: [up('Power Filter')], gy: ['Giant Rat'], turn: 2 }, {}] });
  act(g2, 0, 'Monster Reborn'); settle(g2, 'Giant Rat');
  ok(on(g2, 0, 'Giant Rat'), 'Giant Rat (1400 ATK) Special Summoned');
});
T('Power Injector: pay 600, face-up Psychics gain 500', () => {
  const g = duel({ board: [{ m: ['Power Injector', 'Psychic Commander', FILL], turn: 2 }, {}] });
  act(g, 0, 'Power Injector'); settle(g);
  ok(lp(g, 0) === 7400, `paid 600 (${lp(g, 0)})`);
  ok(E.atk(g, on(g, 0, 'Power Injector')) === 1800 && E.atk(g, on(g, 0, 'Psychic Commander')) === 1900 && E.atk(g, on(g, 0, FILL)) === 2000, 'Psychics +500, Warwolf unchanged');
  ok(!canAct(g, 0, 'Power Injector'), 'once per turn');
  endTurn(g); ok(E.atk(g, on(g, 0, 'Psychic Commander')) === 1400, 'bonus gone next turn');
});
T('Power Invader: no Tribute when the opponent has 2+ monsters', () => {
  const g = duel({ board: [{ hand: ['Power Invader'], turn: 2 }, { m: [FILL, FILL] }] });
  ns(g, 0, 'Power Invader'); ok(on(g, 0, 'Power Invader') && cnt(g, 0, 'gy') === 0, 'Normal Summoned without Tributes');
  const g2 = duel({ board: [{ hand: ['Power Invader'], turn: 2 }, { m: [FILL] }] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Power Invader').u), 'needs a Tribute against 1 monster');
});
T('Power of Kaishin: Aqua only, +300 ATK/DEF', () => {
  const g = duel({ board: [{ hand: ['Power of Kaishin'], m: ['Revival Jam', FILL], turn: 2 }, {}] });
  act(g, 0, 'Power of Kaishin'); settle(g, 'Revival Jam');
  const j = on(g, 0, 'Revival Jam'); ok(E.atk(g, j) === 1800 && E.def(g, j) === 800 && E.atk(g, on(g, 0, FILL)) === 2000, `Revival Jam ${E.atk(g, j)}/${E.def(g, j)}`);
  const g2 = duel({ board: [{ hand: ['Power of Kaishin'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Power of Kaishin'), 'no Aqua, not offered');
});
T('Power Pickaxe: banish an opponent GY monster of equal or lower Level, +500', () => {
  const g = duel({ board: [{ hand: ['Power Pickaxe'], m: [FILL], turn: 2 }, { gy: ['Dark Magician', 'Sangan'] }] });
  act(g, 0, 'Power Pickaxe'); settle(g, FILL);
  ok(canAct(g, 0, 'Power Pickaxe'), 'its effect is offered'); act(g, 0, 'Power Pickaxe'); settle(g, 'Sangan');
  ok(inZ(g, 1, 'ban', 'Sangan') && inZ(g, 1, 'gy', 'Dark Magician') && E.atk(g, on(g, 0, FILL)) === 2500, 'Sangan banished, Warwolf 2500');
  ok(!canAct(g, 0, 'Power Pickaxe'), 'once per turn');
});
T('Power Supplier: 1 face-up monster gains 400 while it stays', () => {
  const g = duel({ board: [{ m: ['Power Supplier', FILL], hand: ['Dark Hole'], turn: 2 }, {}] });
  act(g, 0, 'Power Supplier'); settle(g, FILL);
  ok(E.atk(g, on(g, 0, FILL)) === 2400, `Warwolf ${E.atk(g, on(g, 0, FILL))}`);
  endTurn(g); endTurn(g); ok(E.atk(g, on(g, 0, FILL)) === 2400, 'still 2400 next turn');
});
T('Princess Curran: no Normal Summon; 600 per opponent monster each Standby', () => {
  const g0 = duel({ board: [{ hand: ['Princess Curran'], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Princess Curran')), 'cannot be Normal Summoned or Set');
  const g = duel({ board: [{ m: ['Princess Curran'], turn: 2 }, { m: [FILL, FILL] }] }); // the board is set before A's Standby Phase
  toIdle(g); ok(lp(g, 1) === 8000 - 1200, `B took 1200 in A's Standby Phase (${lp(g, 1)})`);
  endTurn(g); toIdle(g); ok(lp(g, 1) === 6800, `nothing in B's Standby Phase (${lp(g, 1)})`);
});
T('Princess of Tsurugi: FLIP 500 per opponent Spell/Trap', () => {
  const g = duel({ board: [{ m: [{ n: 'Princess of Tsurugi', pos: 'set' }], turn: 2 }, { st: ['Mirror Force', 'Ceasefire', up('Swords of Revealing Light')] }] });
  choose(g, 'flip:' + on(g, 0, 'Princess of Tsurugi').u); settle(g);
  ok(lp(g, 1) === 8000 - 1500, `B took 1500 (${lp(g, 1)})`);
});
T('Princess Pikeru: gain 800 per own monster each Standby', () => {
  const g = duel({ board: [{ m: ['Princess Pikeru', FILL], turn: 2 }, { m: [FILL] }] });
  toIdle(g); ok(lp(g, 0) === 8000 + 1600, `A gained 1600 in its Standby Phase (${lp(g, 0)})`);
  endTurn(g); toIdle(g); ok(lp(g, 0) === 9600, `nothing in B's Standby Phase (${lp(g, 0)})`);
});
/* ---------------- Raging ---------------- */
T('Raging Cloudian: activation needs a Cloudian destroyed by its own effect', () => {
  const g = duel({ board: [{ st: ['Raging Cloudian'], m: ['Cloudian - Smoke Ball'], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Raging Cloudian'), 'not offered with no Cloudian destroyed');
});
T('Raging Earth: destroyed by battle, destroys face-down and non-EARTH monsters', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Raging Earth', 'Mystical Elf', { n: 'Giant Rat', pos: 'set' }, FILL] }] });
  bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Raging Earth');
  ok(!on(g, 0, 'Blue-Eyes White Dragon') && !on(g, 1, 'Mystical Elf') && !on(g, 1, 'Giant Rat') && on(g, 1, FILL), 'Blue-Eyes, Mystical Elf and the face-down Rat destroyed; EARTH Warwolf stays');
});
T('Raging Eria: Tribute a WATER, Special Summon a WATER from the hand', () => {
  const g = duel({ board: [{ hand: ['Amazon of the Seas'], m: ['Raging Eria', 'Revival Jam'], turn: 2 }, {}] });
  act(g, 0, 'Raging Eria'); settle(g, 'Revival Jam', 'Amazon of the Seas');
  ok(on(g, 0, 'Amazon of the Seas') && inZ(g, 0, 'gy', 'Revival Jam'), 'Amazon Special Summoned, Jam Tributed');
  ok(!canAct(g, 0, 'Raging Eria'), 'once per turn');
});
T('Raging Flame Sprite: attacks directly, gains 1000 after', () => {
  const g = duel({ board: [{ m: ['Raging Flame Sprite'], turn: 2 }, { m: [FILL] }] });
  bp(g); const s = on(g, 0, 'Raging Flame Sprite'); ok(canAtk(g, s, null), 'direct attack offered'); atkOn(g, 0, 'Raging Flame Sprite', null);
  ok(lp(g, 1) === 7900 && E.atk(g, s) === 1100, `B ${lp(g, 1)}, Sprite ${E.atk(g, s)}`);
});
T('Raging Mad Plants: +300 per Plant in GY, then Plants destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Raging Mad Plants'], m: ['Lonefire Blossom', FILL], gy: ['Dandylion', 'Dandylion'], turn: 2 }, {}] });
  act(g, 0, 'Raging Mad Plants'); settle(g);
  ok(E.atk(g, on(g, 0, 'Lonefire Blossom')) === 1100 && E.atk(g, on(g, 0, FILL)) === 2000, `Lonefire ${E.atk(g, on(g, 0, 'Lonefire Blossom'))}`);
  endTurn(g, 'NO');
  ok(!on(g, 0, 'Lonefire Blossom') && on(g, 0, FILL), 'Lonefire destroyed in the End Phase, Warwolf stays');
});
/* ---------------- Rainbow ---------------- */
const BEASTS = ['Crystal Beast Ruby Carbuncle', 'Crystal Beast Sapphire Pegasus', 'Crystal Beast Amethyst Cat', 'Crystal Beast Emerald Tortoise', 'Crystal Beast Topaz Tiger', 'Crystal Beast Amber Mammoth', 'Crystal Beast Cobalt Eagle'];
T('Rainbow Dark Dragon: banish 7 different DARKs from the GY', () => {
  const darks = ['Sangan', 'Spirit Reaper', 'Zombie Master', 'Dark Magician', 'Junk Synchron', 'Cyber Jar', 'Dokurorider'];
  const g = duel({ board: [{ hand: ['Rainbow Dark Dragon'], gy: darks, turn: 2 }, {}] });
  const r = card(g, 0, 'Rainbow Dark Dragon'); ok(!hasOpt(g, 'ns:' + r.u) && !hasOpt(g, 'set:' + r.u), 'no Normal Summon');
  ok(hasOpt(g, 'sp:' + r.u), 'Special Summon offered'); choose(g, 'sp:' + r.u); settle(g, ...darks);
  ok(on(g, 0, 'Rainbow Dark Dragon') && cnt(g, 0, 'ban') === 7, 'summoned, 7 banished');
  const g2 = duel({ board: [{ hand: ['Rainbow Dark Dragon'], gy: darks.slice(0, 6).concat(['Sangan']), turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Rainbow Dark Dragon').u), 'not with only 6 different names');
});
T('Rainbow Dragon: 7 Crystal Beasts on the field/GY; sends Beasts for ATK', () => {
  const g = duel({ board: [{ hand: ['Rainbow Dragon'], gy: BEASTS.slice(0, 5), m: BEASTS.slice(5), turn: 2 }, {}] });
  const r = card(g, 0, 'Rainbow Dragon'); ok(!hasOpt(g, 'ns:' + r.u), 'no Normal Summon');
  ok(hasOpt(g, 'sp:' + r.u), 'Special Summon offered'); choose(g, 'sp:' + r.u); settle(g);
  ok(on(g, 0, 'Rainbow Dragon'), 'Rainbow Dragon Special Summoned');
  ok(!canAct(g, 0, 'Rainbow Dragon'), 'no effects the turn it is Special Summoned');
  const g2 = duel({ board: [{ m: ['Rainbow Dragon'].concat(BEASTS.slice(5)), turn: 2 }, {}] });
  ok(canAct(g2, 0, 'Rainbow Dragon'), 'effect offered'); act(g2, 0, 'Rainbow Dragon'); settle(g2, 'send', 'GY');
  const rd = on(g2, 0, 'Rainbow Dragon');
  ok(rd && E.atk(g2, rd) === 6000 && cnt(g2, 0, 'm') === 1, `Rainbow Dragon ${rd && E.atk(g2, rd)} ATK`);
});
T('Rainbow Flower: attacks directly', () => {
  const g = duel({ board: [{ m: ['Rainbow Flower'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Rainbow Flower', null); ok(lp(g, 1) === 7600, `B ${lp(g, 1)}`);
});
T('Rainbow Gravity: 7 Crystal Beasts, Special Summon an Ultimate Crystal from the Deck', () => {
  const g = duel({ board: [{ st: ['Rainbow Gravity'], gy: BEASTS.slice(0, 4), m: BEASTS.slice(4), deckTop: [FILL, 'Rainbow Dragon'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Rainbow Gravity'), 'offered'); act(g, 0, 'Rainbow Gravity'); settle(g, 'Rainbow Dragon');
  ok(on(g, 0, 'Rainbow Dragon'), 'Rainbow Dragon Special Summoned from the Deck');
  const g2 = duel({ board: [{ st: ['Rainbow Gravity'], gy: BEASTS.slice(0, 3), m: BEASTS.slice(4), deckTop: [FILL, 'Rainbow Dragon'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Rainbow Gravity'), 'not with 6');
});
T('Rainbow Life: direct attack damage turns into gain', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: ['Rainbow Life'], hand: ['Sangan'] }] });
  bp(g); atkOn(g, 0, FILL, null, 'Rainbow Life', 'Sangan');
  ok(lp(g, 1) === 10000, `B gained 2000 (${lp(g, 1)})`);
});
T('Rainbow Neos: Fusion of Neos + an Ultimate Crystal; shuffles opponent monsters', () => {
  const g = duel({ ex0: ['Rainbow Neos'], board: [{ hand: ['Polymerization', 'Elemental HERO Neos', 'Rainbow Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Rainbow Neos', 'Attack');
  ok(on(g, 0, 'Rainbow Neos'), 'Rainbow Neos Fusion Summoned');
  const g2 = duel({ ex0: ['Rainbow Neos'], board: [{ m: ['Rainbow Neos', FILL], turn: 2 }, { m: ['Mystical Elf', 'Sangan'] }] });
  ok(canAct(g2, 0, 'Rainbow Neos'), 'effect offered'); act(g2, 0, 'Rainbow Neos'); settle(g2, 'monster', FILL);
  ok(cnt(g2, 1, 'm') === 0 && inZ(g2, 0, 'gy', FILL), 'opponent monsters shuffled away, Warwolf sent as cost');
});
T('Rainbow Path: negate an attack by sending a Crystal Beast, search Rainbow Dragon', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: ['Rainbow Path', up('Crystal Beast Ruby Carbuncle')], deckTop: [FILL, 'Rainbow Dragon'] }] });
  bp(g); atkOn(g, 0, FILL, null, 'Rainbow Path', 'Crystal Beast', 'Rainbow Dragon');
  ok(lp(g, 1) === 8000 && inZ(g, 1, 'gy', 'Crystal Beast Ruby Carbuncle') && inZ(g, 1, 'hand', 'Rainbow Dragon'), `attack negated, Ruby sent, Rainbow Dragon added (B ${lp(g, 1)})`);
});
T('Rainbow Veil: the battled monster loses its effects (Marshmallon destroyed)', () => {
  const g = duel({ board: [{ hand: ['Rainbow Veil'], m: [FILL], turn: 2 }, { m: ['Marshmallon'] }] });
  act(g, 0, 'Rainbow Veil'); settle(g, FILL);
  bp(g); atkOn(g, 0, FILL, 'Marshmallon');
  ok(inZ(g, 1, 'gy', 'Marshmallon'), 'Marshmallon destroyed by battle');
});
T('Red Dragon Archfiend Assault Mode: only by Assault Mode Activate; wipes the board when it attacks', () => {
  const g0 = duel({ board: [{ hand: ['Red Dragon Archfiend Assault Mode'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Red Dragon Archfiend Assault Mode')), 'cannot be Normal Summoned');
  const g1 = duel({ board: [{ m: ['Red Dragon Archfiend'], st: ['Assault Mode Activate'], deckTop: [FILL, 'Red Dragon Archfiend Assault Mode'], turn: 2 }, {}] });
  act(g1, 0, 'Assault Mode Activate'); settle(g1, 'Red Dragon Archfiend');
  ok(on(g1, 0, 'Red Dragon Archfiend Assault Mode'), 'Special Summoned with Assault Mode Activate');
  const g = duel({ board: [{ m: ['Red Dragon Archfiend Assault Mode', FILL], turn: 2 }, { m: ['Mystical Elf', { n: 'Sangan', pos: 'def' }, FILL] }] });
  bp(g); atkOn(g, 0, 'Red Dragon Archfiend Assault Mode', 'Mystical Elf');
  ok(cnt(g, 1, 'm') === 0 && !on(g, 0, FILL) && on(g, 0, 'Red Dragon Archfiend Assault Mode'), 'all other monsters destroyed');
  // a properly Synchro Summoned Red Dragon Archfiend (ruling: one never properly summoned can't be revived)
  const g3 = duel({ ex0: ['Red Dragon Archfiend'], board: [{ hand: ['Dark Hole'], m: ['Junk Synchron', 'Cyber Dragon'], st: ['Assault Mode Activate'], deckTop: [FILL, 'Red Dragon Archfiend Assault Mode'], turn: 2 }, {}] });
  choose(g3, 'Synchro Summon'); settle(g3, 'Junk Synchron', 'Cyber Dragon', 'Attack');
  ok(on(g3, 0, 'Red Dragon Archfiend'), 'Red Dragon Archfiend Synchro Summoned');
  act(g3, 0, 'Assault Mode Activate'); settle(g3, 'Red Dragon Archfiend');
  ok(on(g3, 0, 'Red Dragon Archfiend Assault Mode'), 'Assault Mode summoned');
  act(g3, 0, 'Dark Hole'); settle(g3, 'Red Dragon Archfiend');
  ok(on(g3, 0, 'Red Dragon Archfiend'), 'Red Dragon Archfiend revived when Assault Mode is destroyed');
  const g4 = duel({ board: [{ hand: ['Dark Hole'], m: ['Red Dragon Archfiend Assault Mode'], gy: ['Red Dragon Archfiend'], turn: 2 }, {}] });
  act(g4, 0, 'Dark Hole'); settle(g4, 'Red Dragon Archfiend');
  ok(!on(g4, 0, 'Red Dragon Archfiend'), 'a never-summoned Red Dragon Archfiend is not revived (ruling 2)');
});
T('Red Medicine: +500 LP', () => {
  const g = duel({ board: [{ hand: ['Red Medicine'], turn: 2 }, {}] });
  act(g, 0, 'Red Medicine'); settle(g); ok(lp(g, 0) === 8500, `A ${lp(g, 0)}`);
});
T('Red Ogre: on Normal Summon, discard N to bounce N field cards', () => {
  const g = duel({ board: [{ hand: ['Red Ogre', 'Sangan'], m: [FILL, FILL], deckTop: ['Dark Hole'], turn: 2 }, { m: ['Mystical Elf'], st: ['Mirror Force'] }] });
  ns(g, 0, 'Red Ogre', FILL, 'Sangan', 'Mystical Elf');
  toIdle(g, 'Sangan', 'Mystical Elf');
  ok(on(g, 0, 'Red Ogre') && inZ(g, 0, 'gy', 'Sangan') && inZ(g, 1, 'hand', 'Mystical Elf'), 'Sangan discarded, Mystical Elf returned to the hand');
});
T('Red-Eyes Black Metal Dragon: Tribute Red-Eyes with Metalmorph, summon from the Deck', () => {
  const g0 = duel({ board: [{ hand: ['Red-Eyes Black Metal Dragon'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Red-Eyes Black Metal Dragon')), 'cannot be Normal Summoned');
  const g = duel({ board: [{ m: ['Red-Eyes Black Dragon'], st: ['Metalmorph'], hand: ['Red Medicine'], deckTop: [FILL, 'Red-Eyes Black Metal Dragon'], turn: 2 }, {}] });
  // the engine announces the equip (2026-11-26), so the optional summon from the Deck is offered right after Metalmorph resolves
  act(g, 0, 'Metalmorph'); settle(g, 'Red-Eyes Black Dragon', 'Attack'); toIdle(g);
  if (!on(g, 0, 'Red-Eyes Black Metal Dragon')) { ok(E.atk(g, on(g, 0, 'Red-Eyes Black Dragon')) === 2700, 'Metalmorph equipped'); act(g, 0, 'Red Medicine'); settle(g, 'Red-Eyes Black Dragon', 'Attack'); toIdle(g); }
  ok(on(g, 0, 'Red-Eyes Black Metal Dragon') && inZ(g, 0, 'gy', 'Red-Eyes Black Dragon'), 'summoned from the Deck, Red-Eyes Tributed');
});
T('Red-Eyes Darkness Dragon: Tribute Red-Eyes from the field; +300 per Dragon in GY', () => {
  const g = duel({ board: [{ hand: ['Red-Eyes Darkness Dragon'], m: ['Red-Eyes Black Dragon'], gy: ['Debris Dragon'], turn: 2 }, {}] });
  const r = card(g, 0, 'Red-Eyes Darkness Dragon');
  ok(!hasOpt(g, 'ns:' + r.u), 'no Normal Summon'); ok(hasOpt(g, 'sp:' + r.u), 'Special Summon offered');
  choose(g, 'sp:' + r.u); settle(g, 'Red-Eyes Black Dragon', 'Attack');
  const d = on(g, 0, 'Red-Eyes Darkness Dragon');
  ok(d && E.atk(g, d) === 2400 + 600, `ATK ${d && E.atk(g, d)} with 2 Dragons in the GY`);
  const g2 = duel({ board: [{ hand: ['Red-Eyes Darkness Dragon'], m: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Red-Eyes Darkness Dragon').u), 'not without Red-Eyes');
});
T('Red-Eyes Zombie Dragon: 1 Zombie Tribute; revives Zombies it destroys', () => {
  const g = duel({ board: [{ hand: ['Red-Eyes Zombie Dragon'], m: ['Pyramid Turtle'], turn: 2 }, { m: ['Zombie Master'] }] });
  ns(g, 0, 'Red-Eyes Zombie Dragon', 'Pyramid Turtle', 'Attack');
  ok(on(g, 0, 'Red-Eyes Zombie Dragon'), 'Tribute Summoned with 1 Zombie');
  bp(g); atkOn(g, 0, 'Red-Eyes Zombie Dragon', 'Zombie Master', 'Zombie Master');
  ok(on(g, 0, 'Zombie Master'), 'Zombie Master Special Summoned to A');
  const g2 = duel({ board: [{ hand: ['Red-Eyes Zombie Dragon'], m: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Red-Eyes Zombie Dragon').u), 'not with 1 non-Zombie');
});
/* ---------------- Release / Return ---------------- */
T('Release from Stone: Special Summon a banished Rock, linked', () => {
  const g = duel({ board: [{ st: ['Release from Stone'], ban: ['Stone Statue of the Aztecs'], hand: ['Mystical Space Typhoon'], turn: 2 }, {}] });
  act(g, 0, 'Release from Stone'); settle(g, 'Stone Statue');
  ok(on(g, 0, 'Stone Statue of the Aztecs'), 'Stone Statue Special Summoned');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Release from Stone');
  ok(!on(g, 0, 'Stone Statue of the Aztecs') && inZ(g, 0, 'gy', 'Stone Statue of the Aztecs'), 'Stone Statue destroyed with the trap');
});
T('Release Restraint: Iron Knight into Swordmaster from the Deck', () => {
  const g = duel({ board: [{ hand: ['Release Restraint'], m: ['Gearfried the Iron Knight'], deckTop: [FILL, 'Gearfried the Swordmaster'], turn: 2 }, {}] });
  act(g, 0, 'Release Restraint'); settle(g, 'Gearfried the Swordmaster', 'Attack');
  ok(on(g, 0, 'Gearfried the Swordmaster') && inZ(g, 0, 'gy', 'Gearfried the Iron Knight'), 'Swordmaster summoned');
});
T('Release Restraint Wave: destroy own Equip and opponent face-down Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['Release Restraint Wave'], m: [FILL], st: [up('Power of Kaishin')], turn: 2 }, { st: ['Mirror Force', 'Ceasefire', up('Swords of Revealing Light')] }] });
  // place a real equip: use Rocket Pilder from the hand instead
  const g2 = duel({ board: [{ hand: ['Release Restraint Wave', 'Rocket Pilder'], m: [FILL], turn: 2 }, { st: ['Mirror Force', 'Ceasefire', up('Swords of Revealing Light')] }] });
  act(g2, 0, 'Rocket Pilder'); settle(g2, FILL);
  act(g2, 0, 'Release Restraint Wave'); settle(g2, 'Rocket Pilder');
  ok(inZ(g2, 0, 'gy', 'Rocket Pilder') && inZ(g2, 1, 'gy', 'Mirror Force') && inZ(g2, 1, 'gy', 'Ceasefire') && inZ(g2, 1, 'st', 'Swords of Revealing Light'), 'equip and the 2 face-down cards destroyed, face-up Swords stays');
});
T('Return of the Doomed: discard a monster, battle-destroyed monster back at end of turn', () => {
  const g = duel({ board: [{ hand: ['Return of the Doomed', 'Sangan'], m: ['Mystical Elf'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Mystical Elf', FILL); // 800 vs 100 DEF: Warwolf dies; need own monster dead
  const g2 = duel({ board: [{ hand: ['Return of the Doomed', 'Sangan'], m: ['Mystical Elf'], turn: 2 }, { m: [FILL] }] });
  bp(g2); atkOn(g2, 0, 'Mystical Elf', FILL); choose(g2, 'endbp'); settle(g2);
  ok(inZ(g2, 0, 'gy', 'Mystical Elf'), 'Mystical Elf destroyed by battle');
  act(g2, 0, 'Return of the Doomed'); settle(g2, 'Sangan', 'Mystical Elf');
  ok(inZ(g2, 0, 'gy', 'Sangan'), 'Sangan discarded');
  choose(g2, 'end'); settle(g2, 'Mystical Elf');
  ok(inZ(g2, 0, 'hand', 'Mystical Elf'), 'Mystical Elf back in the hand at end of turn');
});
T('Return of the Six Samurai: revive a Six Samurai, destroyed in the End Phase', () => {
  const g = duel({ board: [{ st: ['Return of the Six Samurai'], gy: ['The Six Samurai - Yaichi'], turn: 2 }, {}] });
  act(g, 0, 'Return of the Six Samurai'); settle(g, 'Yaichi', 'Attack');
  ok(on(g, 0, 'The Six Samurai - Yaichi'), 'Yaichi Special Summoned');
  endTurn(g); ok(inZ(g, 0, 'gy', 'The Six Samurai - Yaichi'), 'destroyed in the End Phase');
});
T('Return Soul: End Phase, return monsters destroyed this turn to the Deck', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { st: ['Return Soul'], m: ['Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Mystical Elf');
  ok(inZ(g, 1, 'gy', 'Mystical Elf'), 'Mystical Elf destroyed');
  if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g); }
  const deck0 = g.p[1].deck.length; choose(g, 'end'); settle(g, 'Return Soul', 'Mystical Elf');
  ok(!inZ(g, 1, 'gy', 'Mystical Elf') && g.p[1].deck.some(c => E.name(c) === 'Mystical Elf'), 'Mystical Elf returned to the Deck');
});
T('Return Zombie: not with cards in hand', () => {
  const g = duel({ board: [{ gy: ['Return Zombie'], turn: 2 }, {}] });
  endTurn(g); endTurn(g);
  ok(idle(g) && inZ(g, 0, 'gy', 'Return Zombie'), 'no offer when the hand has cards (drawn card)');
});
T('Revival Gift: Tuner revived negated, 2 Gift Fiend Tokens for the opponent', () => {
  const g = duel({ board: [{ st: ['Revival Gift'], gy: ['Junk Synchron'], turn: 2 }, {}] });
  act(g, 0, 'Revival Gift'); settle(g, 'Junk Synchron');
  ok(on(g, 0, 'Junk Synchron') && cnt(g, 1, 'm') === 2, `Junk Synchron summoned, B has ${cnt(g, 1, 'm')} tokens`);
  const t = g.p[1].m.find(Boolean); ok(t && E.atk(g, t) === 1500, 'tokens are 1500 ATK');
});
T('Revival Jam: pay 1000 to come back in the next Standby Phase', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Revival Jam'] }] });
  bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Revival Jam', 'Revival Jam');
  ok(inZ(g, 1, 'gy', 'Revival Jam'), 'Jam destroyed');
  endTurn(g, 'Revival Jam'); toIdle(g, 'Revival Jam');
  const j = on(g, 1, 'Revival Jam');
  ok(j && j.pos === 'def' && lp(g, 1) === 8000 - 1500 - 1000, `Jam back in Defense, B paid 1000 (B ${lp(g, 1)})`);
});
T('Revival of Dokurorider: Ritual Summon with 6+ Levels', () => {
  const g = duel({ board: [{ hand: ['Revival of Dokurorider', 'Dokurorider'], m: [FILL, 'Sangan'], deckTop: ['Dark Hole'], turn: 2 }, {}] });
  act(g, 0, 'Revival of Dokurorider'); settle(g, FILL, 'Sangan', 'Attack');
  ok(on(g, 0, 'Dokurorider') && inZ(g, 0, 'gy', FILL) && inZ(g, 0, 'gy', 'Sangan'), 'Dokurorider Ritual Summoned');
  const g2 = duel({ board: [{ hand: ['Revival of Dokurorider', 'Dokurorider'], m: [FILL], deckTop: ['Dark Hole'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Revival of Dokurorider'), 'not with 4 Levels');
});
/* ---------------- Ring ---------------- */
T('Ring of Defense: makes Trap burn 0', () => {
  const g = duel({ board: [{ st: ['Just Desserts'], turn: 2 }, { st: ['Ring of Defense'], m: [FILL, FILL] }] });
  act(g, 0, 'Just Desserts'); settle(g, 'Ring of Defense');
  ok(inZ(g, 1, 'gy', 'Ring of Defense') && lp(g, 1) === 8000, `Ring of Defense used, B ${lp(g, 1)}`);
});
T('Ring of Destruction: on the opponent turn, both take its ATK', () => {
  const g = duel({ board: [{ st: ['Ring of Destruction'], turn: 2 }, { m: [FILL] }] });
  ok(!canAct(g, 0, 'Ring of Destruction'), 'not on your own turn');
  endTurn(g);
  // B's turn: A responds when B does something; B enters the Battle Phase
  bp(g); settle(g, 'Ring of Destruction');
  if (!inZ(g, 0, 'gy', 'Ring of Destruction')) { /* try the End Phase window */ endTurn(g, 'Ring of Destruction', FILL); }
  ok(inZ(g, 1, 'gy', FILL) && lp(g, 0) === 6000 && lp(g, 1) === 6000, `Warwolf destroyed, both 6000 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Ring of Magnetism: own monster -500, opponent must attack it', () => {
  const g = duel({ board: [{ hand: ['Ring of Magnetism'], m: ['Mystical Elf', 'Sangan'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Ring of Magnetism'); settle(g, 'Mystical Elf');
  const e = on(g, 0, 'Mystical Elf'); ok(E.atk(g, e) === 300 && E.def(g, e) === 1500, `Elf ${E.atk(g, e)}/${E.def(g, e)}`);
  endTurn(g); bp(g);
  ok(canAtk(g, on(g, 1, FILL), e) && !canAtk(g, on(g, 1, FILL), on(g, 0, 'Sangan')), 'only the Elf can be attacked');
});
/* ---------------- Ritual ---------------- */
T('Ritual Buster: opponent cannot activate Spells/Traps after a Ritual Summon', () => {
  const g = duel({ board: [{ hand: ['Revival of Dokurorider', 'Dokurorider', 'Dark Hole'], m: [FILL, 'Sangan'], st: ['Ritual Buster'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Revival of Dokurorider'); settle(g, FILL, 'Sangan', 'Attack', 'Ritual Buster');
  ok(inZ(g, 0, 'gy', 'Ritual Buster'), 'Ritual Buster activated');
  bp(g); atkOn(g, 0, 'Dokurorider', null, 'Mirror Force');
  ok(on(g, 0, 'Dokurorider') && inZ(g, 1, 'st', 'Mirror Force'), 'Mirror Force could not be activated');
});
T('Ritual Cage: no battle damage from your Ritual Monster battles', () => {
  const g = duel({ board: [{ m: ['Dokurorider'], st: [up('Ritual Cage')], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Dokurorider', 'Blue-Eyes White Dragon');
  ok(lp(g, 0) === 8000, `A took no damage (${lp(g, 0)})`);
});
T('Ritual Foregone: pay 1000, Ritual Monster from the hand, cannot attack, destroyed at End Phase', () => {
  const g = duel({ board: [{ hand: ['Ritual Foregone', 'Dokurorider'], turn: 2 }, {}] });
  act(g, 0, 'Ritual Foregone'); settle(g, 'Dokurorider', 'Attack');
  const d = on(g, 0, 'Dokurorider'); ok(d && lp(g, 0) === 7000, 'summoned, 1000 paid');
  bp(g); ok(!canAtk(g, d, null), 'cannot attack');
  endTurn(g); ok(inZ(g, 0, 'gy', 'Dokurorider'), 'destroyed in the End Phase');
});
T('Ritual of Destruction: Ritual Summon Garlandolf', () => {
  const g = duel({ board: [{ hand: ['Ritual of Destruction', 'Garlandolf, King of Destruction'], m: [FILL, 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Ritual of Destruction'); settle(g, FILL, 'Sangan', 'Attack');
  ok(on(g, 0, 'Garlandolf, King of Destruction'), 'Garlandolf summoned');
});
T('Ritual of Grace: Ritual Summon Northwemko', () => {
  const g = duel({ board: [{ hand: ['Ritual of Grace', 'Divine Grace - Northwemko'], m: [FILL, 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Ritual of Grace'); settle(g, FILL, 'Sangan', 'Attack');
  ok(on(g, 0, 'Divine Grace - Northwemko'), 'Northwemko summoned');
});
T('Ritual Raven: can be played (ENGINE gap in the script: the entire-Tribute effect is not applied)', () => {
  const g = duel({ board: [{ hand: ['Ritual Raven'], turn: 2 }, {}] });
  ns(g, 0, 'Ritual Raven'); ok(on(g, 0, 'Ritual Raven'), 'Normal Summoned');
});
T('Ritual Sealing: destroy a face-up Ritual Monster', () => {
  const g = duel({ board: [{ st: ['Ritual Sealing'], turn: 2 }, { m: ['Dokurorider', FILL] }] });
  act(g, 0, 'Ritual Sealing'); settle(g, 'Dokurorider');
  ok(inZ(g, 1, 'gy', 'Dokurorider') && on(g, 1, FILL), 'Dokurorider destroyed');
});
T('Ritual Weapon: Level 6 or lower Ritual gains 1500', () => {
  const g = duel({ board: [{ hand: ['Ritual Weapon'], m: ['Dokurorider', FILL], turn: 2 }, {}] });
  act(g, 0, 'Ritual Weapon'); settle(g, 'Dokurorider');
  const d = on(g, 0, 'Dokurorider'); ok(E.atk(g, d) === 3400 && E.def(g, d) === 3350, `Dokurorider ${E.atk(g, d)}/${E.def(g, d)}`);
  const g2 = duel({ board: [{ hand: ['Ritual Weapon'], m: ['Divine Grace - Northwemko'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Ritual Weapon'), 'not on a Level 7');
});
/* ---------------- Rocket ---------------- */
T('Rocket Jumper: direct when the opponent has only Defense Position monsters', () => {
  const g = duel({ board: [{ m: ['Rocket Jumper'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); ok(canAtk(g, on(g, 0, 'Rocket Jumper'), null), 'direct attack offered'); atkOn(g, 0, 'Rocket Jumper', null);
  ok(lp(g, 1) === 7000, `B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ m: ['Rocket Jumper'], turn: 2 }, { m: [FILL] }] });
  bp(g2); ok(!canAtk(g2, on(g2, 0, 'Rocket Jumper'), null), 'not with an Attack Position monster');
});
T('Rocket Pilder: survives attacking, target loses ATK', () => {
  const g = duel({ board: [{ hand: ['Rocket Pilder'], m: ['Mystical Elf'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Rocket Pilder'); settle(g, 'Mystical Elf');
  bp(g); atkOn(g, 0, 'Mystical Elf', FILL);
  ok(on(g, 0, 'Mystical Elf') && lp(g, 0) === 8000 - 1200, `Elf survives, A took 1200 (${lp(g, 0)})`);
  ok(E.atk(g, on(g, 1, FILL)) === 1200, `Warwolf ${E.atk(g, on(g, 1, FILL))}`);
});
T('Rocket Warrior: no destruction or damage in your BP, target loses 500', () => {
  const g = duel({ board: [{ m: ['Rocket Warrior'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Rocket Warrior', FILL);
  ok(on(g, 0, 'Rocket Warrior') && lp(g, 0) === 8000 && E.atk(g, on(g, 1, FILL)) === 1500, `Rocket survives, no damage, Warwolf ${E.atk(g, on(g, 1, FILL))}`);
});
T('Rod of Silence - Kay\'est: +500 DEF', () => {
  const g = duel({ board: [{ hand: ['Rod of Silence - Kay\'est'], m: ['Mystical Elf'], turn: 2 }, {}] });
  act(g, 0, 'Rod of Silence - Kay\'est'); settle(g, 'Mystical Elf');
  ok(E.def(g, on(g, 0, 'Mystical Elf')) === 2500, 'Elf DEF 2500');
});
/* ---------------- Royal ---------------- */
T('Royal Command: Flip effects negated', () => {
  const g = duel({ board: [{ m: [{ n: 'Princess of Tsurugi', pos: 'set' }], turn: 2 }, { st: [up('Royal Command'), 'Mirror Force'] }] });
  choose(g, 'flip:' + on(g, 0, 'Princess of Tsurugi').u); settle(g);
  ok(lp(g, 1) === 8000, `no burn (${lp(g, 1)})`);
});
T('Royal Firestorm Guards: shuffle 4 Pyros, draw 2', () => {
  const g = duel({ board: [{ hand: ['Royal Firestorm Guards'], gy: ['Fire Princess', 'Solar Flare Dragon', 'Fire Princess', 'Solar Flare Dragon'], turn: 2 }, {}] });
  const h0 = g.p[0].hand.length;
  ns(g, 0, 'Royal Firestorm Guards'); toIdle(g, 'Fire Princess', 'Solar Flare Dragon');
  ok(cnt(g, 0, 'gy') === 0 && g.p[0].hand.length === h0 - 1 + 2, `Pyros shuffled, drew 2 (hand ${g.p[0].hand.length})`);
});
T('Royal Keeper: flips itself face-down, gains 300 when flipped up', () => {
  const g = duel({ board: [{ m: ['Royal Keeper'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Royal Keeper'), 'flip face-down offered'); act(g, 0, 'Royal Keeper'); settle(g);
  ok(on(g, 0, 'Royal Keeper').pos === 'set', 'face-down');
  endTurn(g); endTurn(g);
  choose(g, 'flip:' + on(g, 0, 'Royal Keeper').u); settle(g);
  const k = on(g, 0, 'Royal Keeper'); ok(E.atk(g, k) === 1900 && E.def(g, k) === 2000, `Royal Keeper ${E.atk(g, k)}/${E.def(g, k)}`);
});
T('Royal Knight: gain the DEF of the monster it destroys', () => {
  const g = duel({ board: [{ m: ['Royal Knight'], turn: 2 }, { m: [{ n: 'Hane-Hane', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Royal Knight', 'Hane-Hane', 'NO');
  ok(lp(g, 0) === 8500, `A gained 500 (${lp(g, 0)})`);
});
T('Royal Magical Library: Spell Counters, 3 to draw', () => {
  const g = duel({ board: [{ m: ['Royal Magical Library'], hand: ['Red Medicine', 'Red Medicine', 'Red Medicine'], turn: 2 }, {}] });
  for (let i = 0; i < 3; i++) { act(g, 0, 'Red Medicine'); settle(g); }
  const lib = on(g, 0, 'Royal Magical Library'); ok(E.lib.ctr(lib, 'spell') === 3, `3 counters (${E.lib.ctr(lib, 'spell')})`);
  const h = g.p[0].hand.length; act(g, 0, 'Royal Magical Library'); settle(g);
  ok(g.p[0].hand.length === h + 1 && E.lib.ctr(lib, 'spell') === 0, 'drew 1, counters removed');
});
T('Royal Surrender: negates a Continuous Trap', () => {
  const g = duel({ board: [{ st: ['Call of the Haunted'], gy: [FILL], turn: 2 }, { st: ['Royal Surrender'] }] });
  act(g, 0, 'Call of the Haunted'); settle(g, 'Royal Surrender', FILL);
  ok(!on(g, 0, FILL) && inZ(g, 0, 'gy', 'Call of the Haunted') && inZ(g, 1, 'gy', 'Royal Surrender'), 'Call of the Haunted negated and destroyed');
});
T('Royal Writ of Taxation: only in the opponent Standby Phase', () => {
  const g = duel({ board: [{ st: ['Royal Writ of Taxation'], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Royal Writ of Taxation'), 'not in your own Main Phase');
});

/* ---------------- more main-effect checks ---------------- */
T('Raging Cloudian: revives a Cloudian that destroyed itself, with a Fog Counter', () => {
  const g = duel({ board: [{ st: ['Raging Cloudian'], m: ['Cloudian - Altus'], turn: 2 }, {}] });
  choose(g, 'pos:' + on(g, 0, 'Cloudian - Altus').u); settle(g, 'Raging Cloudian', 'Cloudian - Altus');
  const a = on(g, 0, 'Cloudian - Altus');
  ok(a && a.pos === 'atk' && E.lib.ctr(a, 'fog') >= 1 && inZ(g, 0, 'gy', 'Raging Cloudian'), `Altus back in Attack Position with a Fog Counter (${a ? a.pos + ' ' + E.lib.ctr(a, 'fog') : 'none'})`);
});
T('Royal Writ of Taxation: at the opponent Standby; 1000 to them if the card is not used', () => {
  const g = duel({ board: [{ st: ['Royal Writ of Taxation'], turn: 2 }, { hand: ['Sangan'] }] });
  endTurn(g, 'Royal Writ of Taxation'); toIdle(g, 'Royal Writ of Taxation');
  ok(inZ(g, 0, 'gy', 'Royal Writ of Taxation'), 'activated in B Standby Phase');
  endTurn(g); endTurn(g);
  ok(lp(g, 1) === 7000 && lp(g, 0) === 8000, `B took 1000 at the end of A's next turn (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Rod of Silence - Kay\'est: negates and destroys a Spell that targets the equipped monster', () => {
  const g = duel({ board: [{ hand: ["Rod of Silence - Kay'est"], m: ['Mystical Elf'], turn: 2 }, { st: ['Book of Moon'] }] });
  act(g, 0, "Rod of Silence - Kay'est"); settle(g, 'Mystical Elf');
  endTurn(g); toIdle(g);
  act(g, 1, 'Book of Moon'); settle(g, 'Mystical Elf', "Rod of Silence");
  const e = on(g, 0, 'Mystical Elf');
  ok(e && e.pos !== 'set' && inZ(g, 1, 'gy', 'Book of Moon'), `Book of Moon negated, Elf stays face-up (${e && e.pos})`);
});
T('Rainbow Dark Dragon: banish other DARKs, +500 each', () => {
  const g = duel({ board: [{ m: ['Rainbow Dark Dragon', 'Sangan'], gy: ['Dark Magician', 'Spirit Reaper'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Rainbow Dark Dragon'), 'effect offered'); act(g, 0, 'Rainbow Dark Dragon'); settle(g);
  const r = on(g, 0, 'Rainbow Dark Dragon');
  ok(r && E.atk(g, r) === 5500 && cnt(g, 0, 'ban') === 3, `ATK ${r && E.atk(g, r)}, banished ${cnt(g, 0, 'ban')}`);
});
T('Rainbow Dragon: banish Crystal Beasts from the GY to shuffle the field into the Deck', () => {
  const g = duel({ board: [{ m: ['Rainbow Dragon'], gy: BEASTS.slice(0, 3), turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Rainbow Dragon'); settle(g, 'anish', 'huffle');
  ok(cnt(g, 1, 'm') === 0 && cnt(g, 1, 'st') === 0 && !on(g, 0, 'Rainbow Dragon') && cnt(g, 0, 'ban') === 3, 'field shuffled into the Deck, Beasts banished');
});
T('Raging Eria: the summoned WATER is destroyed when Eria leaves', () => {
  const g = duel({ board: [{ hand: ['Amazon of the Seas'], m: ['Raging Eria', 'Revival Jam'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Raging Eria'); settle(g, 'Revival Jam', 'Amazon of the Seas');
  bp(g); atkOn(g, 0, 'Raging Eria', FILL);
  ok(inZ(g, 0, 'gy', 'Raging Eria') && inZ(g, 0, 'gy', 'Amazon of the Seas'), 'Amazon destroyed with Eria');
});
T('Ritual of Destruction: banished from the GY, battle-destroyed monsters go to the top of the Deck', () => {
  const g = duel({ board: [{ m: ['Dokurorider'], gy: ['Ritual of Destruction'], turn: 2 }, { m: ['Mystical Elf'] }] });
  ok(canAct(g, 0, 'Ritual of Destruction'), 'GY effect offered'); act(g, 0, 'Ritual of Destruction'); settle(g);
  ok(inZ(g, 0, 'ban', 'Ritual of Destruction'), 'banished as the cost');
  bp(g); atkOn(g, 0, 'Dokurorider', 'Mystical Elf');
  const d = g.p[1].deck; ok(!inZ(g, 1, 'gy', 'Mystical Elf') && d.length && E.name(d[d.length - 1]) === 'Mystical Elf', 'Mystical Elf on top of the Deck');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-13 review checks passed.');
process.exit(fails ? 1 : 0);
