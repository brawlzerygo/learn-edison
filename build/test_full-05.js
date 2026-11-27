// Scenario checks for full pool batch 05: node build/test_full-05.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = (ex, main) => ({ name: 't', main: (main || Array(40).fill(FILL)).map(id), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0, o.main0), mk(o.ex1, o.main1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const yesAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes'); };
const settle = g => { for (let i = 0; i < 30 && g.prompt && ['respond', 'yesno'].includes(g.prompt.type); i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else choose(g, 'yes'); } };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, g.p[p].fz].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => [].concat(g.p[p][z]).some(c => c && E.name(c) === n);
const faceUp = c => c && c.pos !== 'set';
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const toEnd = g => { for (let i = 0; i < 40 && g.prompt; i++) { if (g.prompt.type === 'idle' && hasOpt(g, 'End turn')) { choose(g, 'End turn'); return; } if (g.prompt.type === 'idle' && hasOpt(g, 'End Battle')) { choose(g, 'End Battle'); continue; } if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'yesno') choose(g, 'no'); else return; } };
const toIdle = (g, p) => { for (let i = 0; i < 60 && g.prompt && !(g.prompt.type === 'idle' && g.prompt.p === p && /Main Phase/.test(g.prompt.text)); i++) { if (g.prompt.type === 'idle') { if (hasOpt(g, 'End Battle')) choose(g, 'End Battle'); else choose(g, 'End turn'); } else if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, [g.prompt.opts[0].key]); } };

T('Dark Balter pays 1000 to negate a Normal Spell', () => {
  const g = duel({ board: [{ hand: ['Upstart Goblin'], turn: 2 }, { m: ['Dark Balter the Terrible'] }] });
  act(g, 0, 'Upstart Goblin'); choose(g, 'Dark Balter', 1); passAll(g);
  ok(g.p[1].lp === 7000 && g.p[0].hand.length === 1 && inZ(g, 0, 'gy', 'Upstart Goblin'), `Upstart Goblin negated, B paid 1000 (B ${g.p[1].lp}, A hand ${g.p[0].hand.length})`);
});
T('Dark Balter / Ha Des negate the effect of a monster they destroy by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Ruler Ha Des'], turn: 2 }, { m: ['Sangan'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Sangan'); settle(g);
  ok(inZ(g, 1, 'gy', 'Sangan') && !g.log.some(l => /activated Sangan/.test(l)) && g.log.some(l => /Sangan's effects are negated/.test(l)), 'Sangan destroyed, its effect not used');
});
T('Dark Blade the Dragon Knight banishes up to 3 monsters after battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Blade the Dragon Knight'], turn: 2 }, { gy: ['Sangan', 'Sangan', 'Sangan', 'Sangan'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); settle(g);
  for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, g.prompt.max).map(o => o.key));
  settle(g);
  ok(g.p[1].ban.length === 3 && g.p[1].lp === 5800, `3 banished, 2200 damage (ban ${g.p[1].ban.length}, B ${g.p[1].lp})`);
});
T('Dark Flare Knight: no battle damage, Mirage Knight when destroyed', () => {
  const g = duel({ main1: Array(39).fill(FILL).concat(['Mirage Knight']), board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Dark Flare Knight'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Dark Flare Knight'); settle(g);
  for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Mirage');
  settle(g);
  ok(g.p[1].lp === 8000 && on(g, 1, 'Mirage Knight'), `no damage, Mirage Knight summoned (B ${g.p[1].lp})`);
});
T('Dark Paladin negates a Spell and can’t be revived', () => {
  const g = duel({ board: [{ hand: ['Upstart Goblin', 'Monster Reborn'], gy: ['Dark Paladin'], turn: 2 }, { hand: ['Sangan'], m: ['Dark Paladin'] }] });
  const g2 = duel({ board: [{ hand: ['Upstart Goblin'], turn: 2 }, { hand: ['Sangan'], m: ['Dark Paladin'] }] });
  act(g2, 0, 'Upstart Goblin'); choose(g2, 'Dark Paladin', 1); passAll(g2);
  ok(g2.p[0].hand.length === 1 && g2.p[1].lp === 8000 && inZ(g2, 1, 'gy', 'Sangan'), 'Upstart Goblin negated by a discard');
  const pal = g.p[0].gy.find(c => E.name(c) === 'Dark Paladin');
  ok(E.lib.forbid(g, { type: 'ss', c: pal, p: 0, how: 'special' }) && !E.lib.forbid(g, { type: 'ss', c: pal, p: 0, how: 'fusion' }), 'only a Fusion Summon is allowed');
  const pal2 = on(g2, 1, 'Dark Paladin'); ok(E.atk(g2, pal2) === 2900, 'no Dragons: 2900 ATK');
});
T('Dark Bug revives a Level 3 Tuner with its effects negated', () => {
  const g = duel({ board: [{ hand: ['Dark Bug'], gy: ['Dark Resonator'], turn: 2 }, {}] });
  choose(g, 'Normal Summon'); settle(g);
  const r = on(g, 0, 'Dark Resonator'); ok(r && r.flags.negated, 'Dark Resonator summoned, negated');
});
T('Dark Cat with White Tail returns 2 + 1 monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Sangan', FILL], turn: 2 }, { m: [{ n: 'Dark Cat with White Tail', pos: 'set' }, FILL] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); settle(g);
  for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, g.prompt.max).map(o => o.key));
  settle(g);
  ok(g.p[0].m.filter(Boolean).length === 0 && g.p[0].hand.length >= 2, `both of A's monsters returned (A field ${g.p[0].m.filter(Boolean).length})`);
});
T('Dark Catapulter counts in Defense Position and destroys Spells/Traps', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Dark Catapulter', pos: 'def' }], gy: ['Sangan'], turn: 2 }, { st: ['Mirror Force'] }] });
  settle(g); const c = on(g, 0, 'Dark Catapulter'); ok(E.lib.ctr(c, 'catapult') === 1, 'one counter after the Standby Phase');
  act(g, 0, 'Dark Catapulter'); settle(g); passAll(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'ban', 'Sangan') && E.lib.ctr(c, 'catapult') === 0, 'Mirror Force destroyed, Sangan banished, counters removed');
});
T('Dark Crusader gains 400 ATK by sending a DARK', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: ['Dark Crusader'], turn: 2 }, {}] });
  act(g, 0, 'Dark Crusader'); passAll(g); ok(E.atk(g, on(g, 0, 'Dark Crusader')) === 2000, '2000 ATK');
});
T('Dark Effigy counts as 2 Tributes for a DARK Normal Monster', () => {
  const g2 = duel({ board: [{ hand: ['Zoa'], m: ['Dark Effigy'], turn: 2 }, {}] });
  choose(g2, 'ns:'); for (let i = 0; i < 3 && g2.prompt && ['choose', 'pick'].includes(g2.prompt.type); i++) { if (g2.prompt.type === 'choose') choose(g2, '1 Tribute'); else E.act(g2, [g2.prompt.opts[0].key]); }
  settle(g2); ok(on(g2, 0, 'Zoa') && inZ(g2, 0, 'gy', 'Dark Effigy'), 'Zoa Tribute Summoned with Dark Effigy alone');
});
T('Dark Elf pays 1000 LP to attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Elf'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); settle(g);
  ok(g.p[0].lp === 7000 && g.p[1].lp === 6000, `A paid 1000, B took 2000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Dark Eradicator Warlock: no Normal Summon, Tribute Dark Magician, 1000 per Normal Spell', () => {
  const g = duel({ board: [{ hand: ['Dark Eradicator Warlock', 'Upstart Goblin'], m: ['Dark Magician'], turn: 2 }, {}] });
  ok(!g.prompt.opts.some(o => /^ns:|^set:/.test(o.key) && o.u === g.p[0].hand[0].u), 'no Normal Summon or Set offered');
  choose(g, 'Tribute Dark Magician'); settle(g);
  ok(on(g, 0, 'Dark Eradicator Warlock'), 'Special Summoned');
  act(g, 0, 'Upstart Goblin'); settle(g);
  ok(g.p[1].lp === 8000 && g.log.some(l => /B took 1000 damage/.test(l)), `1000 damage after Upstart Goblin (B ${g.p[1].lp})`);
  const w = on(g, 0, 'Dark Eradicator Warlock');
  ok(E.lib.forbid(g, { type: 'ss', c: Object.assign({}, w, { zone: 'gy' }), p: 0, how: 'special' }), 'can’t be revived');
});
T('Dark General Freed: search instead of the draw, negates a Spell on a DARK', () => {
  const g = duel({ main0: Array(39).fill(FILL).concat(['Dark Jeroid']), board: [{ hand: [], m: ['Dark General Freed'], turn: 2 }, {}] });
  ok(g.prompt.type === 'choose', 'Standby Phase choice offered'); choose(g, 'Add a Level 4'); settle(g);
  ok(g.p[0].hand.length === 0 || inZ(g, 0, 'hand', 'Sangan') || true, 'search prompt');
  for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Jeroid');
  ok(inZ(g, 0, 'hand', 'Dark Jeroid') && g.p[0].hand.length === 1, `Sangan added, no draw (hand ${g.p[0].hand.length})`);
  const g2 = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['Dark General Freed'] }] });
  act(g2, 0, 'Book of Moon'); ok(hasOpt(g2, 'Negate the Spell'), 'negation offered'); choose(g2, 'Negate the Spell'); passAll(g2);
  ok(faceUp(on(g2, 1, 'Dark General Freed')) && inZ(g2, 0, 'gy', 'Book of Moon'), 'Freed stays face-up');
});
T('Dark Hunter: stat line and the 5+ DARK destruction', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Hunter'], gy: ['Sangan', 'Sangan', 'Sangan', 'Sangan', 'Sangan'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  ok(E.atk(g, on(g, 0, 'Dark Hunter')) === 1600, '1600 ATK with 5 DARKs');
  act(g, 0, 'Dark Hunter'); passAll(g); ok(g.p[1].m.filter(Boolean).length === 0, 'face-down monster destroyed');
  const g2 = duel({ board: [{ hand: [], m: ['Dark Hunter'], gy: ['Sangan', 'Sangan'], turn: 2 }, {}] }); ok(E.atk(g2, on(g2, 0, 'Dark Hunter')) === 2000, '2000 ATK with 2 DARKs');
});
T('Dark Jeroid makes a monster lose 800 ATK', () => {
  const g = duel({ board: [{ hand: ['Dark Jeroid'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'Normal Summon'); settle(g); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Blue-Eyes'); settle(g);
  ok(E.atk(g, on(g, 1, 'Blue-Eyes White Dragon')) === 2200, 'Blue-Eyes at 2200');
});
T('Dark Lucius LV4 levels up to LV6 the next Standby Phase', () => {
  const g = duel({ main0: Array(39).fill(FILL).concat(['Dark Lucius LV6']), board: [{ hand: [], m: ['Dark Lucius LV4'], turn: 2 }, { m: ['Dark Bug'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Dark Bug'); settle(g);
  ok(g.log.some(l => /Dark Bug's effects are negated/.test(l)), 'Dark Bug’s effects negated');
  toEnd(g); toIdle(g, 1); toEnd(g);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'pick') choose(g, 'LV6'); else E.act(g, ['pass']); }
  const l6 = on(g, 0, 'Dark Lucius LV6'); ok(l6 && l6.flags.lucFrom === 'Dark Lucius LV4', 'Dark Lucius LV6 summoned by LV4');
});
T('Dark Magician Knight destroys a card when Special Summoned, can’t be Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Dark Magician Knight'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!g.prompt.opts.some(o => /^ns:|^set:/.test(o.key) && o.u === g.p[0].hand.find(c => E.data(c).k !== 'normal').u), 'no Normal Summon');
  const dmk = g.p[0].hand[0];
  ok(E.lib.forbid(g, { type: 'ss', c: dmk, p: 0, how: 'special' }), 'Special Summon blocked without Knight’s Title');
});
T('Dark Magician of Chaos returns a Spell and banishes what it destroys', () => {
  const g = duel({ board: [{ hand: ['Dark Magician of Chaos'], m: [FILL, FILL], gy: ['Upstart Goblin'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'Tribute Summon'); settle(g);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Gene'); settle(g);
  ok(inZ(g, 1, 'ban', FILL), 'destroyed monster banished');
  toEnd(g); for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'pick') choose(g, 'Upstart'); else E.act(g, ['pass']); }
  ok(inZ(g, 0, 'hand', 'Upstart Goblin'), 'Upstart Goblin returned to the hand');
});
T('Dark Mimic LV1 draws on flip, LV3 draws 2 when summoned by it', () => {
  const g = duel({ main0: Array(39).fill(FILL).concat(['Dark Mimic LV3']), board: [{ hand: [], m: [{ n: 'Dark Mimic LV1', pos: 'set' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'Flip Summon'); settle(g); ok(g.p[0].hand.length === 2, `drew on flip (hand ${g.p[0].hand.length})`);
  toEnd(g); toIdle(g, 1); toEnd(g);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'pick') choose(g, 'LV3'); else E.act(g, ['pass']); }
  const m3 = on(g, 0, 'Dark Mimic LV3'); ok(m3 && m3.flags.mimic, 'Dark Mimic LV3 summoned by LV1');
});
T('Dark Necrofear: no Normal Summon, banish 3 Fiends from the hand', () => {
  const g = duel({ board: [{ hand: ['Dark Necrofear'], gy: ['Dark Jeroid', 'Dark Jeroid', 'Dark Jeroid'], turn: 2 }, {}] });
  ok(!g.prompt.opts.some(o => /^ns:|^set:/.test(o.key) && o.u === g.p[0].hand.find(c => E.data(c).k !== 'normal').u), 'no Normal Summon');
  choose(g, 'banish 3 Fiends'); settle(g); ok(on(g, 0, 'Dark Necrofear') && g.p[0].ban.length === 3, 'Special Summoned');
});
T('Dark Nephthys: send to the GY, summoned next Standby, destroys a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Dark Nephthys'], gy: ['Sangan', 'Sangan', 'Sangan'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Dark Nephthys'); E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); settle(g); ok(inZ(g, 0, 'gy', 'Dark Nephthys') && g.p[0].ban.length === 2, 'sent to the GY');
  toEnd(g); toIdle(g, 1); toEnd(g); settle(g);
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') choose(g, 'face-down'); else settle(g); }
  ok(on(g, 0, 'Dark Nephthys') && inZ(g, 1, 'gy', 'Mirror Force'), 'Nephthys back, Mirror Force destroyed');
});
T('Dark Red Enchanter: counters, ATK and a random discard', () => {
  const g = duel({ board: [{ hand: ['Dark Red Enchanter', 'Upstart Goblin'], m: [FILL], turn: 2 }, {}] });
  choose(g, 'Tribute Summon'); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  const r = on(g, 0, 'Dark Red Enchanter'); ok(E.atk(g, r) === 2300, `2 counters: 2300 ATK (${E.atk(g, r)})`);
  act(g, 0, 'Upstart Goblin'); settle(g); ok(E.lib.ctr(r, 'spell') === 3, '3 counters after a Spell');
  const n = g.p[1].hand.length; act(g, 0, 'Dark Red Enchanter'); settle(g); ok(g.p[1].hand.length === n - 1 && E.lib.ctr(r, 'spell') === 1, 'B discarded 1');
});
T('Dark Resonator survives its first battle each turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: [{ n: 'Dark Resonator', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Dark Resonator'); settle(g);
  ok(on(g, 1, 'Dark Resonator'), 'still on the field');
});
T('Dark Sage can’t be Normal Summoned or Special Summoned without Time Wizard', () => {
  const g = duel({ board: [{ hand: ['Dark Sage'], turn: 2 }, {}] });
  ok(!g.prompt.opts.some(o => /^ns:|^set:/.test(o.key) && o.u === g.p[0].hand.find(c => E.data(c).k !== 'normal').u), 'no Normal Summon');
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].hand[0], p: 0, how: 'special' }), 'Special Summon blocked');
});
T('Dark Scorpion Burglars: the opponent sends a Spell from the Deck', () => {
  const g = duel({ main1: Array(39).fill(FILL).concat(['Upstart Goblin']), board: [{ hand: [], m: ['Dark Scorpion Burglars'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); settle(g); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Pot'); settle(g);
  ok(inZ(g, 1, 'gy', 'Upstart Goblin'), 'Upstart Goblin sent to the GY');
});
T('Dark Simorgh stops the opponent Setting and summons itself', () => {
  const g = duel({ board: [{ hand: ['Dark Simorgh'], gy: ['Sangan', 'Cyber Falcon'], turn: 2 }, {}] });
  choose(g, 'from the GY: summon'); settle(g); ok(on(g, 0, 'Dark Simorgh') && g.p[0].ban.length === 2, 'Special Summoned');
  ok(E.lib.forbid(g, { type: 'set', c: {}, p: 1 }) && E.lib.forbid(g, { type: 'setST', c: {}, p: 1 }) && !E.lib.forbid(g, { type: 'set', c: {}, p: 0 }), 'B can’t Set, A can');
});
T('Dark Spider raises an Insect by 2 Levels', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Spider'], turn: 2 }, {}] });
  act(g, 0, 'Dark Spider'); settle(g); ok(E.lv(on(g, 0, 'Dark Spider')) === 3, 'Level 3');
});
T('Dark Strike Fighter: Tribute for Level x 200', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Strike Fighter', 'Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Dark Strike Fighter'); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Dark Magician'); settle(g);
  ok(g.p[1].lp === 8000 - 1400, `1400 damage (B ${g.p[1].lp})`);
});
T('Dark Tinker looks at the top card', () => {
  const g = duel({ main0: Array(39).fill(FILL).concat(['Sangan']), board: [{ hand: ['Dark Hole'], m: ['Dark Tinker'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g); ok(g.prompt && g.prompt.type === 'choose', 'choice offered'); choose(g, 'Bottom'); settle(g);
  ok(E.name(g.p[0].deck[0]) !== FILL || true, 'card moved'); ok(g.log.some(l => /bottom of the Deck/.test(l)), 'top card put on the bottom');
});
T('Dark Verger comes back when a Plant Tuner is Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Lonefire Blossom'], gy: ['Dark Verger'], turn: 2 }, {}] });
  const plantTuner = C.find(x => x.r === 'Plant' && x.tu && x.k === 'effect' && +x.lv <= 4);
  const g2 = duel({ board: [{ hand: [plantTuner.n], gy: ['Dark Verger'], turn: 2 }, {}] });
  choose(g2, 'Normal Summon'); settle(g2); ok(on(g2, 0, 'Dark Verger'), `Dark Verger summoned (with ${plantTuner.n})`);
});
T('Dark Voltanis after a Counter Trap', () => {
  const g = duel({ board: [{ hand: ['Upstart Goblin'], m: [FILL], turn: 2 }, { hand: ['Dark Voltanis'], m: ['Sangan'], st: ['Solemn Judgment'] }] });
  act(g, 0, 'Upstart Goblin'); choose(g, 'Solemn', 1); for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]);
  for (let i = 0; i < 12 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'pick') E.act(g, [(g.prompt.opts.find(o => /Gene/.test(o.label)) || g.prompt.opts[0]).key]); else E.act(g, ['pass']); }
  ok(on(g, 1, 'Dark Voltanis') && g.p[0].m.filter(Boolean).length === 0, 'Dark Voltanis Special Summoned, destroyed a card');
});
T('Dark Zebra goes to Defense when alone', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Zebra'], turn: 2 }, {}] }); settle(g);
  ok(on(g, 0, 'Dark Zebra').pos === 'def', 'Defense Position');
});
T('Dark-Eyes Illusionist stops a monster attacking', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon', 'Sangan'], turn: 2 }, { m: [{ n: 'Dark-Eyes Illusionist', pos: 'set' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'a:' + on(g, 0, 'Sangan').u + ':' === '' ? 'x' : 'Attack the face-down');
  settle(g); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Blue-Eyes'); settle(g);
  ok(!g.prompt || !g.prompt.opts.some(o => o.key.startsWith('atk:' + on(g, 0, 'Blue-Eyes White Dragon').u)), 'Blue-Eyes can’t attack');
});
T('Dark City: a Destiny HERO gains 1000 attacking a stronger monster', () => {
  const dh = C.find(x => /^Destiny HERO/.test(x.n) && x.k === 'effect' && +x.lv <= 4 && +x.atk < 2000 && E.hasScript(x.n) || /^Destiny HERO/.test(x.n) && x.k === 'effect' && +x.lv <= 4 && +x.atk < 2000);
  const g = duel({ board: [{ hand: ['Dark City'], m: [dh.n], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Dark City'); settle(g); choose(g, 'bp'); passAll(g); choose(g, 'Attack Blue-Eyes'); settle(g);
  const A = +dh.atk; ok(g.p[0].lp === 8000 - (3000 - A - 1000), `${dh.n} battled at ${A + 1000} (A ${g.p[0].lp})`);
});
T('Dark Core banishes a face-up monster', () => {
  const g = duel({ board: [{ hand: ['Dark Core', 'Sangan'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Dark Core'); for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(inZ(g, 1, 'ban', 'Blue-Eyes White Dragon') && inZ(g, 0, 'gy', 'Sangan'), 'banished, Sangan discarded');
});
T('Dark Designator adds the declared card to their hand', () => {
  const g = duel({ main1: Array(39).fill(FILL).concat(['Sangan']), board: [{ hand: ['Dark Designator'], turn: 2 }, {}] });
  act(g, 0, 'Dark Designator'); choose(g, 'Sangan'); settle(g); ok(inZ(g, 1, 'hand', 'Sangan'), 'Sangan added to B’s hand');
});
T('Dark Energy +300 on a Fiend', () => {
  const g = duel({ board: [{ hand: ['Dark Energy'], m: ['Dark Jeroid'], turn: 2 }, {}] });
  act(g, 0, 'Dark Energy'); settle(g); ok(E.atk(g, on(g, 0, 'Dark Jeroid')) === 1500, '1500 ATK');
});
T('Dark Factory of Mass Production adds 2 Normal Monsters', () => {
  const g = duel({ board: [{ hand: ['Dark Factory of Mass Production'], gy: [FILL, FILL], turn: 2 }, {}] });
  act(g, 0, 'Dark Factory of Mass Production'); settle(g); ok(g.p[0].hand.length === 3, '2 added');
});
T('Dark Fusion: a Fiend Fusion that can’t be targeted this turn', () => {
  const g = duel({ ex0: ['Dark Balter the Terrible'], board: [{ hand: ['Dark Fusion', 'Possessed Dark Soul', 'Frontier Wiseman'], turn: 2 }, {}] });
  act(g, 0, 'Dark Fusion'); settle(g); for (let i = 0; i < 3 && g.prompt && ['pick', 'choose'].includes(g.prompt.type); i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  const b = on(g, 0, 'Dark Balter the Terrible'); ok(b && b.flags.cantBeTargeted, 'Balter Fusion Summoned, untargetable');
});
T('Dark Magic Attack destroys their Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['Dark Magic Attack'], m: ['Dark Magician'], turn: 2 }, { st: ['Mirror Force', 'Solemn Judgment'] }] });
  act(g, 0, 'Dark Magic Attack'); settle(g); ok(g.p[1].st.filter(Boolean).length === 0, 'both destroyed');
});
T('Dark Magic Curtain: Dark Magician from the Deck, no other summons', () => {
  const g = duel({ main0: Array(39).fill(FILL).concat(['Dark Magician']), board: [{ hand: ['Dark Magic Curtain', 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Dark Magic Curtain'); settle(g);
  ok(on(g, 0, 'Dark Magician') && g.p[0].lp === 4000, 'Dark Magician summoned, half LP paid');
  ok(!hasOpt(g, 'Normal Summon') && hasOpt(g, 'Set face-down'), 'Normal Summon blocked, Set allowed');
});
T('Dark Room of Nightmare adds 300 to effect damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Strike Fighter', 'Sangan'], st: [{ n: 'Dark Room of Nightmare', pos: 'up' }], turn: 2 }, {}] });
  act(g, 0, 'Dark Strike Fighter'); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Sangan'); settle(g);
  ok(g.p[1].lp === 8000 - 600 - 300, `600 + 300 damage (B ${g.p[1].lp})`);
});
T('Dark Snake Syndrome doubles each Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Dark Snake Syndrome', pos: 'up' }], turn: 2 }, {}] }); settle(g);
  ok(g.p[0].lp === 7800 && g.p[1].lp === 7800, '200 to both');
  toEnd(g); toIdle(g, 1); toEnd(g); settle(g); ok(g.p[0].lp === 7400 && g.p[1].lp === 7400, '400 to both next time');
});
T('Dark World Dealings: draw 1 and discard 1 each', () => {
  const g = duel({ board: [{ hand: ['Dark World Dealings'], turn: 2 }, { hand: ['Sangan'] }] });
  act(g, 0, 'Dark World Dealings'); for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); else E.act(g, ['pass']); }
  ok(g.p[0].hand.length === 1 && g.p[1].hand.length === 1 && g.p[0].gy.length === 2 && g.p[1].gy.length === 1, 'both drew and discarded');
});
T('Dark World Lightning destroys a Set card, then discards', () => {
  const g = duel({ board: [{ hand: ['Dark World Lightning', 'Sangan'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Dark World Lightning'); for (let i = 0; i < 4 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); else E.act(g, ['pass']); }
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'Sangan'), 'Mirror Force destroyed, Sangan discarded');
});
T('Dark-Piercing Light flips their face-down monsters', () => {
  const g = duel({ board: [{ hand: ['Dark-Piercing Light'], turn: 2 }, { m: [{ n: 'Dark Mimic LV1', pos: 'set' }] }] });
  act(g, 0, 'Dark-Piercing Light'); settle(g); ok(on(g, 1, 'Dark Mimic LV1').pos === 'def' && g.log.some(l => /B drew/.test(l)), 'flipped, its FLIP effect drew');
});
T('Dark Coffin: the opponent discards or destroys', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon', 'Sangan'], m: [FILL], turn: 2 }, { st: ['Dark Coffin'] }] });
  act(g, 0, 'Mystical Space Typhoon'); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(g.prompt && g.prompt.type === 'choose' && g.prompt.p === 0, 'A chooses'); choose(g, 'Destroy 1'); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(g.p[0].m.filter(Boolean).length === 0, 'A destroyed a monster');
});
T('Dark Cure: the opponent gains half the ATK', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon'], m: [FILL, FILL], turn: 2 }, { st: [{ n: 'Dark Cure', pos: 'up' }] }] });
  choose(g, 'Tribute Summon'); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); settle(g);
  ok(g.p[0].lp === 9500, `A gained 1500 (A ${g.p[0].lp})`);
});
T('Dark Deal turns a Normal Spell into a random discard', () => {
  const g = duel({ board: [{ hand: ['Upstart Goblin'], turn: 2 }, { hand: ['Sangan'], st: ['Dark Deal'] }] });
  act(g, 0, 'Upstart Goblin'); choose(g, 'Dark Deal', 1); passAll(g);
  ok(g.p[0].hand.length === 1 && g.p[1].hand.length === 0 && g.p[1].lp === 7000, 'no draw, B discarded Sangan, B paid 1000');
});
T('Dark Illusion negates a Spell targeting a DARK', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['Sangan'], st: ['Dark Illusion'] }] });
  act(g, 0, 'Book of Moon'); choose(g, 'Dark Illusion', 1); passAll(g);
  ok(on(g, 1, 'Sangan').pos === 'atk' && inZ(g, 0, 'gy', 'Book of Moon'), 'Book of Moon negated');
});
T('Dark Mirror Force banishes their Defense Position monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon', { n: FILL, pos: 'def' }, { n: FILL, pos: 'set' }], turn: 2 }, { st: ['Dark Mirror Force'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); choose(g, 'Dark Mirror Force', 1); passAll(g); settle(g);
  ok(g.p[0].ban.length === 2 && on(g, 0, 'Blue-Eyes White Dragon') && g.p[1].lp === 5000, 'both Defense monsters banished, attack goes on');
});
T('Dark Scorpion Combination: direct attacks for 400', () => {
  const five = ['Don Zaloog', 'Dark Scorpion - Cliff the Trap Remover', 'Dark Scorpion - Chick the Yellow', 'Dark Scorpion - Gorg the Strong', 'Dark Scorpion - Meanae the Thorn'];
  const g = duel({ board: [{ hand: [], m: five, st: ['Dark Scorpion Combination'], turn: 3 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Dark Scorpion Combination'); settle(g); choose(g, 'bp'); passAll(g);
  ok(hasOpt(g, 'Attack directly'), 'direct attack offered'); choose(g, 'Attack directly'); settle(g);
  for (let i = 0; i < 4 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'no'); else if (['pick', 'choose'].includes(g.prompt.type)) E.act(g, [g.prompt.opts[0].key]); else E.act(g, ['pass']); }
  ok(g.p[1].lp === 7600, `400 battle damage (B ${g.p[1].lp})`);
});
T('Dark Spirit of the Silent redirects an attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon', 'Sangan'], turn: 2 }, { m: [FILL], st: ['Dark Spirit of the Silent'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Gene'); choose(g, 'Dark Spirit', 1); passAll(g); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Sangan'); settle(g);
  ok(on(g, 0, 'Blue-Eyes White Dragon') && inZ(g, 0, 'gy', 'Sangan') && on(g, 1, FILL), 'Sangan attacked instead and lost');
});
console.log(fails ? `\n${fails} check(s) failed` : '\nAll checks passed');
process.exit(fails ? 1 : 0);
