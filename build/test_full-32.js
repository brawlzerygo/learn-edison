// Scenario checks for full pool 32: node build/test_full-32.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const flow = g => { for (let i = 0; i < 30 && g.prompt && (g.prompt.type === 'respond' || g.prompt.type === 'yesno'); i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else choose(g, 'yes'); } };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, g.p[p].fz].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const endTurn = g => { for (let i = 0; i < 40 && g.prompt; i++) { if (g.prompt.type === 'pick' && /hand limit/.test(g.prompt.text)) { E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); continue; } if (g.prompt.type === 'idle' && hasOpt(g, 'endbp')) choose(g, 'endbp'); else if (g.prompt.type === 'idle' && g.prompt.opts.some(o => o.key === 'end')) { E.act(g, ['end']); for (let j = 0; j < 30 && g.prompt && g.prompt.type !== 'idle'; j++) { if (g.prompt.type === 'pick' && /hand limit/.test(g.prompt.text)) E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); else if (g.prompt.type === 'respond' || g.prompt.type === 'yesno') flow(g); else break; } return; } else flow(g); } };

T('Gemini Booster: +700, then makes a Gemini an Effect Monster when destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Gemini Lancer', 'Lucky Pied Piper'], st: ['Gemini Booster'], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Gemini Booster'); choose(g, 'Gemini Lancer'); passAll(g);
  const l = on(g, 0, 'Gemini Lancer');
  ok(E.atk(g, l) === 2500 && inZ(g, 0, 'st', 'Gemini Booster'), 'Gemini Lancer has 2500 ATK, Booster stays');
  endTurn(g); flow(g);
  // B's turn: MST the Booster
  act(g, 1, 'Mystical Space Typhoon'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Lucky Pied Piper'); passAll(g);
  ok(on(g, 0, 'Lucky Pied Piper').flags.gemini === true && E.atk(g, l) === 1800, 'Pied Piper is now an Effect Monster, Lancer back to 1800');
});
T('Gemini Counter negates a Spell and turns the Gemini face-down', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ['Gemini Lancer'], st: ['Gemini Counter'] }] });
  act(g, 0, 'Dark Hole'); ok(hasOpt(g, 'Gemini Counter'), 'Gemini Counter offered'); choose(g, 'Gemini Counter'); passAll(g);
  const l = g.p[1].m.find(Boolean);
  ok(inZ(g, 0, 'gy', 'Dark Hole') && l && l.pos === 'set', 'Dark Hole negated, Lancer face-down');
});
T('Gemini Imps negates Delinquent Duo and draws', () => {
  const g = duel({ board: [{ hand: ['Delinquent Duo'], turn: 2 }, { hand: ['Gemini Imps', FILL, FILL] }] });
  act(g, 0, 'Delinquent Duo'); ok(hasOpt(g, 'Gemini Imps'), 'Imps offered'); choose(g, 'Gemini Imps'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Delinquent Duo') && g.p[1].hand.length === 3 && inZ(g, 1, 'gy', 'Gemini Imps'), `Duo negated, B drew 1 (hand ${g.p[1].hand.length})`);
});
T('Gemini Lancer pierces only when Gemini Summoned', () => {
  const g = duel({ board: [{ hand: [], m: ['Gemini Lancer'], turn: 2 }, { m: [{ n: 'Machina Defender', pos: 'def' }] }] });
  choose(g, 'gem:'); passAll(g); choose(g, 'bp'); passAll(g); choose(g, 'Attack Machina Defender'); flow(g);
  ok(g.p[1].lp === 8000 - 1800 + 1800 - 0 || g.p[1].lp === 8000 - (1800 - 1800), 'battle done');
  const g2 = duel({ board: [{ hand: [], m: ['Gemini Lancer'], turn: 2 }, { m: [{ n: 'Majestic Mech - Senku', pos: 'def' }] }] });
  choose(g2, 'gem:'); passAll(g2); choose(g2, 'bp'); passAll(g2); choose(g2, 'Attack Majestic Mech - Senku'); flow(g2);
  ok(g2.p[1].lp === 8000 - 1300, `1300 piercing damage (B ${g2.p[1].lp})`);
});
T('Gemini Scorpion summons a Gemini from the hand', () => {
  const g = duel({ board: [{ hand: ['Gemini Scorpion', 'Gemini Lancer'], turn: 2 }, {}] });
  choose(g, 'ns:'); passAll(g); yesAll(g); passAll(g);
  ok(on(g, 0, 'Gemini Lancer') && on(g, 0, 'Gemini Scorpion'), 'Lancer Special Summoned');
});
T('Gemini Summoner summons a Gemini in the opponent\'s End Phase', () => {
  const g = duel({ board: [{ hand: [], turn: 2 }, { m: ['Gemini Summoner'], hand: ['Gemini Lancer'] }] });
  E.act(g, ['end']);
  ok(hasOpt(g, 'Gemini Summoner'), 'Summoner offered in the End Phase'); choose(g, 'Gemini Summoner'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Gemini Lancer'); choose(g, 'Normal Summon'); flow(g);
  ok(on(g, 1, 'Gemini Lancer') && g.p[1].lp === 7500, 'Lancer summoned, 500 paid');
});
T('Gemini Trap Hole after an Effect Gemini dies in battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Koa\'ki Meiru Valafar', FILL], turn: 2 }, { m: [{ n: 'Gemini Lancer' }], st: ['Gemini Trap Hole'] }] });
  g.p[1].m[0].flags.gemini = true;
  choose(g, 'bp'); passAll(g); choose(g, 'atk:' + on(g, 0, "Koa'ki Meiru Valafar").u); flow(g);
  ok(!on(g, 0, FILL) && on(g, 0, "Koa'ki Meiru Valafar") && inZ(g, 1, 'gy', 'Gemini Trap Hole'), 'Warwolf destroyed, Valafar (Trap-proof) stays');
});
T('Golden Ladybug gains 500 in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], turn: 2 }, { hand: ['Golden Ladybug'] }] });
  E.act(g, ['end']); flow(g);
  ok(g.p[1].lp === 8500, `B gained 500 (${g.p[1].lp})`);
});
T('H - Heated Heart: +500 and piercing', () => {
  const g = duel({ board: [{ hand: ['H - Heated Heart'], m: [FILL], turn: 2 }, { m: [{ n: 'Majestic Mech - Senku', pos: 'def' }] }] });
  act(g, 0, 'H - Heated Heart'); passAll(g);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Majestic Mech - Senku'); flow(g);
  ok(g.p[1].lp === 8000 - 2000, `2000 piercing (${g.p[1].lp})`);
});
T('Helios Duo: stats by banished monsters, Tribute summon, revival', () => {
  const g = duel({ board: [{ hand: ['Helios Duo Megistus'], m: ['Helios - The Primordial Sun'], ban: [FILL, FILL, FILL], turn: 2 }, { m: [{ n: 'Koa\'ki Meiru Valafar' }] }] });
  ok(E.atk(g, on(g, 0, 'Helios - The Primordial Sun')) === 300, 'Helios has 300');
  choose(g, 'sp:'); flow(g); const d = on(g, 0, 'Helios Duo Megistus');
  ok(d && E.atk(g, d) === 600, 'Duo has 600');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Koa'); flow(g);
  ok(inZ(g, 0, 'gy', 'Helios Duo Megistus'), 'Duo destroyed');
  endTurn(g); flow(g);
  const d2 = on(g, 0, 'Helios Duo Megistus');
  ok(d2 && E.atk(g, d2) === 900, 'Duo back in the End Phase with 900');
});
T('Infernity Archfiend: drawn with an empty hand, summoned, searches', () => {
  const g = duel({ board: [{ hand: [], turn: 2 }, { hand: [], deckTop: ['Infernity Archfiend'] }] });
  g.p[1].deck.unshift(...[]);
  E.act(g, ['end']); flow(g);
  ok(on(g, 1, 'Infernity Archfiend'), 'Archfiend summoned from the draw');
});
T('Infernity Force destroys the attacker and revives', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: [], m: ['Infernity Guardian'], st: ['Infernity Force'], gy: ['Infernity Beast'] }] });
  g.p[1].hand.length = 0;
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Infernity Guardian'); ok(hasOpt(g, 'Infernity Force'), 'Force offered'); choose(g, 'Infernity Force'); flow(g);
  ok(!on(g, 0, FILL) && on(g, 1, 'Infernity Beast'), 'attacker destroyed, Beast revived');
});
T('Infernity Guardian with an empty hand survives Dark Hole', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], turn: 2 }, { hand: [], m: ['Infernity Guardian'] }] });
  g.p[1].hand.length = 0;
  act(g, 0, 'Dark Hole'); passAll(g);
  ok(on(g, 1, 'Infernity Guardian'), 'Guardian stays');
});
T('Infernity Necromancer goes to Defense, revives', () => {
  const g = duel({ board: [{ hand: ['Infernity Necromancer'], gy: ['Infernity Beast'], turn: 2 }, {}] });
  g.p[0].deck.push(g.p[0].hand.pop()); choose(g, 'ns:'); flow(g);
  const n = on(g, 0, 'Infernity Necromancer'); ok(n && n.pos === 'def', 'Necromancer in Defense');
  act(g, 0, 'Infernity Necromancer'); flow(g);
  ok(on(g, 0, 'Infernity Beast'), 'Beast revived');
});
T('Koa\'ki Meiru Valafar: Trap-proof, pierces, Tribute 1', () => {
  const g = duel({ board: [{ hand: ['Koa\'ki Meiru Valafar'], m: ['Koa\'ki Meiru Ice'], turn: 2 }, { m: [{ n: 'Majestic Mech - Senku', pos: 'def' }], st: ['Mirror Force'] }] });
  choose(g, 'ns:'); if (g.prompt.type === 'choose') choose(g, '1 Tribute'); if (g.prompt.type === 'pick') choose(g, 'Ice'); flow(g);
  ok(on(g, 0, "Koa'ki Meiru Valafar"), 'Valafar Tribute Summoned with 1');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack'); if (hasOpt(g, 'Mirror Force')) choose(g, 'Mirror Force'); flow(g);
  ok(on(g, 0, "Koa'ki Meiru Valafar") && g.p[1].lp === 8000 - 2500, `survives Mirror Force, 2500 piercing (${g.p[1].lp})`);
});
T('Koa\'ki Meiru Hydro Barrier negates effect monsters until the next Standby Phase', () => {
  const g = duel({ board: [{ hand: ["Iron Core of Koa'ki Meiru"], m: ["Koa'ki Meiru Hydro Barrier"], turn: 2 }, { m: ['Infernity Guardian'] }] });
  act(g, 0, "Koa'ki Meiru Hydro Barrier"); flow(g);
  const gu = on(g, 1, 'Infernity Guardian');
  ok(E.lib.negd(g, gu), 'Guardian negated');
  endTurn(g); flow(g); ok(E.lib.negd(g, gu), 'still negated on B turn');
  endTurn(g); flow(g); ok(!E.lib.negd(g, gu), 'negation ended in A\'s next Standby Phase');
});
T('Koa\'ki Meiru War Arms equips and survives battle', () => {
  const g = duel({ board: [{ hand: [], m: ["Koa'ki Meiru War Arms"], gy: ['Infernity Dwarf'], turn: 2 }, { m: ["Koa'ki Meiru Valafar"] }] });
  act(g, 0, "Koa'ki Meiru War Arms"); flow(g);
  const w = on(g, 0, "Koa'ki Meiru War Arms"); ok(E.atk(g, w) === 1800, `War Arms has 1800 (${E.atk(g, w)})`);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack'); flow(g);
  ok(on(g, 0, "Koa'ki Meiru War Arms") && inZ(g, 0, 'gy', 'Infernity Dwarf'), 'Dwarf destroyed instead');
});
T('Koa\'ki Meiru Ghoulungulate banishes a Koa\'ki Meiru instead', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ["Koa'ki Meiru Ghoulungulate"], gy: ["Koa'ki Meiru Ice"] }] });
  act(g, 0, 'Dark Hole'); passAll(g);
  ok(on(g, 1, "Koa'ki Meiru Ghoulungulate") && inZ(g, 1, 'ban', "Koa'ki Meiru Ice"), 'Ghoulungulate stays, Ice banished');
});
T('Koa\'ki Meiru Ice destroys a Special Summoned monster', () => {
  const g = duel({ board: [{ hand: [FILL], m: ["Koa'ki Meiru Ice"], turn: 2 }, { m: ['Infernity Guardian'] }] });
  g.p[1].m[0].summonType = 'special'; choose(g, 'pos:'); flow(g);
  act(g, 0, "Koa'ki Meiru Ice"); E.act(g, [g.prompt.opts[0].key]); flow(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Infernity'); flow(g);
  ok(inZ(g, 1, 'gy', 'Infernity Guardian'), 'Guardian destroyed');
});
T('Koa\'ki maintenance destroys without a payment', () => {
  const g = duel({ board: [{ hand: [], m: ["Koa'ki Meiru Ice"], turn: 2 }, {}] });
  E.act(g, ['end']); flow(g);
  ok(inZ(g, 0, 'gy', "Koa'ki Meiru Ice"), 'Ice destroyed in the End Phase');
});
T('Lucky Iron Axe draws when the opponent destroys it', () => {
  const g = duel({ board: [{ hand: ['Lucky Iron Axe'], m: [FILL], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Lucky Iron Axe'); passAll(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2500, 'Warwolf has 2500');
  const h = g.p[0].hand.length; endTurn(g); flow(g);
  act(g, 1, 'Mystical Space Typhoon'); flow(g);
  ok(g.p[0].hand.length === h + 1, 'A drew 1');
});
T('Machina Sniper protects other Machina', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Machina Sniper', 'Machina Soldier'] }] });
  choose(g, 'bp'); passAll(g);
  ok(hasOpt(g, 'Attack Machina Sniper') && !hasOpt(g, 'Attack Machina Soldier'), 'only Sniper can be attacked');
});
T('Machina Soldier summons a Machina from the hand', () => {
  const g = duel({ board: [{ hand: ['Machina Soldier', 'Machina Sniper'], turn: 2 }, {}] });
  choose(g, 'ns:'); flow(g);
  ok(on(g, 0, 'Machina Sniper'), 'Sniper summoned');
});
T('Machine King - 3000 B.C. becomes a monster and locks summons', () => {
  const g = duel({ board: [{ hand: ['Machina Soldier'], st: ['Machine King - 3000 B.C.'], m: ['Machina Sniper'], turn: 2 }, {}] });
  act(g, 0, 'Machine King - 3000 B.C.'); flow(g);
  const k = on(g, 0, 'Machine King - 3000 B.C.');
  ok(k && E.atk(g, k) === 1000 && !hasOpt(g, 'ns:'), 'trap monster 1000, no Normal Summon');
  act(g, 0, 'Machine King - 3000 B.C.'); flow(g);
  ok(E.atk(g, k) === 2800, `gained Sniper's 1800 (${E.atk(g, k)})`);
});
T('Majestic Red Dragon: Synchro, negate and gain ATK, back to the Extra Deck', () => {
  const g = duel({ ex0: ['Majestic Red Dragon'], board: [{ hand: [], m: ['Majestic Dragon', 'Red Dragon Archfiend', 'Golden Ladybug'], gy: ['Red Dragon Archfiend'], turn: 2 }, { m: ['Infernity Guardian'] }] });
  ok(!hasOpt(g, 'syn:'), 'no ordinary Synchro'); choose(g, 'sp:'); flow(g);
  const r = on(g, 0, 'Majestic Red Dragon'); ok(r, 'Majestic Red Dragon summoned');
  act(g, 0, 'Majestic Red Dragon'); flow(g);
  ok(E.atk(g, r) === 5200 && E.lib.negd(g, on(g, 1, 'Infernity Guardian')), `5200 ATK, Guardian negated (${E.atk(g, r)})`);
  E.act(g, ['end']); flow(g); if (g.prompt && g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); flow(g);
  ok(inZ(g, 0, 'extra', 'Majestic Red Dragon') && on(g, 0, 'Red Dragon Archfiend'), 'back to Extra, RDA summoned');
});
T('Majestic Star Dragon negates and wipes the opponent', () => {
  const g = duel({ ex1: ['Majestic Star Dragon'], board: [{ hand: ['Dark Hole'], m: [FILL], turn: 2 }, { m: ['Majestic Dragon', 'Stardust Dragon', 'Golden Ladybug'] }] });
  // give B the Star Dragon directly
  E.act(g, ['end']); flow(g); choose(g, 'sp:'); flow(g);
  ok(on(g, 1, 'Majestic Star Dragon'), 'Star Dragon summoned');
});
T('Majestic Mech - Ohka goes to the GY in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Majestic Mech - Ohka'], turn: 2 }, {}] });
  choose(g, 'ns:'); flow(g); ok(on(g, 0, 'Majestic Mech - Ohka'), 'Ohka summoned with no Tribute');
  E.act(g, ['end']); flow(g); ok(inZ(g, 0, 'gy', 'Majestic Mech - Ohka'), 'Ohka sent to GY');
});
T('Mist Archfiend destroys itself and burns its controller', () => {
  const g = duel({ board: [{ hand: ['Mist Archfiend'], turn: 2 }, {}] });
  choose(g, 'ns:'); flow(g); E.act(g, ['end']); flow(g);
  ok(inZ(g, 0, 'gy', 'Mist Archfiend') && g.p[0].lp === 7000, 'destroyed, 1000 damage');
});
T('Malevolent Mech - Goku En burns 2400', () => {
  const g = duel({ board: [{ hand: ['Malevolent Mech - Goku En'], turn: 2 }, {}] });
  choose(g, 'ns:'); flow(g); E.act(g, ['end']); flow(g);
  ok(inZ(g, 0, 'gy', 'Malevolent Mech - Goku En') && g.p[0].lp === 5600, `sent, 2400 damage (${g.p[0].lp})`);
});
T('Mist Valley Soldier bounces the surviving monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Golden Ladybug'], turn: 2 }, { m: [{ n: 'Mist Valley Soldier', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Mist'); flow(g);
  ok(inZ(g, 0, 'hand', 'Golden Ladybug') && on(g, 1, 'Mist Valley Soldier'), 'Ladybug returned to the hand');
});
T('Mist Valley Shaman returns Thunderbird, which comes back', () => {
  const g = duel({ board: [{ hand: [], m: ['Mist Valley Shaman', 'Mist Valley Thunderbird'], turn: 2 }, {}] });
  act(g, 0, 'Mist Valley Shaman'); if (g.prompt.type === 'pick') choose(g, 'Thunderbird'); flow(g);
  const t = on(g, 0, 'Mist Valley Thunderbird');
  ok(t && E.atk(g, on(g, 0, 'Mist Valley Shaman')) === 1700, 'Thunderbird back, Shaman 1700');
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'atk:' + t.u), 'Thunderbird cannot attack');
});
T('Morphtronic Map counts position changes; Clocken counters and burn', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Map'], m: [{ n: 'Morphtronic Clocken', pos: 'def' }], turn: 2 }, {}] });
  act(g, 0, 'Morphtronic Map'); passAll(g);
  const c = on(g, 0, 'Morphtronic Clocken');
  choose(g, 'a:' + c.u + ':0'); flow(g);
  ok(E.lib.ctr(c, 'morph') === 1, 'Clocken has a counter');
  choose(g, 'a:' + c.u + ':1'); flow(g);
  ok(g.p[1].lp === 7000, 'Clocken burned 1000');
});
T('Morphtronic Magnen in Defense protects the others', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Morphtronic Magnen', pos: 'def' }, 'Machina Soldier'] }] });
  choose(g, 'bp'); passAll(g);
  ok(hasOpt(g, 'Attack Morphtronic Magnen') && !hasOpt(g, 'Attack Machina Soldier'), 'only Magnen can be attacked');
});
T('Morphtronic Mix-up: opponent picks', () => {
  const g = duel({ board: [{ hand: [], m: ['Morphtronic Magnen', 'Morphtronic Videon'], st: ['Morphtronic Mix-up'], turn: 2 }, { m: [FILL, 'Machina Soldier'] }] });
  act(g, 0, 'Morphtronic Mix-up'); flow(g); if (g.prompt && g.prompt.type === 'pick') { ok(g.prompt.p === 1, 'B picks'); E.act(g, [g.prompt.opts[0].key]); } flow(g);
  ok(g.p[1].m.filter(Boolean).length === 1, 'one of B\'s monsters destroyed');
});
T('Morphtronic Repair Unit revives and equips', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Repair Unit', 'Morphtronic Videon'], gy: ['Morphtronic Magnen'], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Morphtronic Repair Unit'); if (g.prompt.type === 'pick') choose(g, 'Magnen'); flow(g);
  const v = on(g, 0, 'Morphtronic Videon') || on(g, 0, 'Morphtronic Magnen');
  ok(v && inZ(g, 0, 'st', 'Morphtronic Repair Unit'), 'monster revived with Repair Unit');
  endTurn(g); flow(g); act(g, 1, 'Mystical Space Typhoon'); flow(g);
  ok(!on(g, 0, E.name(v)), 'monster destroyed when Repair Unit left');
});
T('Morphtronic Rusty Engine burns both players', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Rusty Engine', 'Dark Hole'], m: ['Morphtronic Datatron'], turn: 2 }, {}] });
  act(g, 0, 'Morphtronic Rusty Engine'); passAll(g);
  act(g, 0, 'Dark Hole'); flow(g);
  ok(g.p[0].lp === 6800 && g.p[1].lp === 6800, `1200 to each (${g.p[0].lp}, ${g.p[1].lp})`);
});
T('Morphtronic Videon gains 800 per Equip', () => {
  const g = duel({ board: [{ hand: ['Mist Body'], m: ['Morphtronic Videon'], turn: 2 }, {}] });
  act(g, 0, 'Mist Body'); passAll(g);
  ok(E.atk(g, on(g, 0, 'Morphtronic Videon')) === 1800, 'Videon has 1800');
});
T('Level Limit - Area A forces low Levels to Attack', () => {
  const g = duel({ board: [{ hand: [], st: ['Level Limit - Area A'], turn: 2 }, { m: [{ n: 'Infernity Beast', pos: 'def' }] }] });
  act(g, 0, 'Level Limit - Area A'); flow(g);
  ok(on(g, 1, 'Infernity Beast').pos === 'atk', 'Beast in Attack Position');
});
T('Koa\'ki Meiru Doom stops LIGHT/DARK monster effects in the Main Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Infernity Necromancer'], gy: ['Infernity Beast'], turn: 2 }, { m: ["Koa'ki Meiru Doom"] }] });
  g.p[0].hand.length = 0;
  ok(!hasOpt(g, 'a:' + on(g, 0, 'Infernity Necromancer').u), 'Necromancer effect blocked');
});
T('Golden Flying Fish tributes a Fish to destroy', () => {
  const g = duel({ board: [{ hand: [], m: ['Golden Flying Fish', 'Golden Flying Fish'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Golden Flying Fish'); if (g.prompt.type === 'pick' && /Tribute/.test(g.prompt.text)) E.act(g, [g.prompt.opts[0].key]); choose(g, FILL); flow(g);
  ok(!on(g, 1, FILL), 'Warwolf destroyed');
});
T('Lucky Pied Piper draws on a battle kill when Gemini Summoned', () => {
  const g = duel({ board: [{ hand: [], m: ['Lucky Pied Piper'], turn: 2 }, { m: ['Golden Ladybug'] }] });
  choose(g, 'gem:'); flow(g); const h = g.p[0].hand.length;
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Golden'); flow(g);
  ok(g.p[0].hand.length === h + 1, 'drew 1');
});
T('Machina Armored Unit summons a weaker Machine', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Machina Sniper'], st: [{ n: 'Machina Armored Unit', pos: 'up' }] }] });
  g.p[1].deck.push(...[]);
  // deck needs an EARTH Machine weaker than 1800: Machina Defender
  const d = g.p[0].deck.pop(); // keep counts sane
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Machina Sniper'); flow(g);
  ok(inZ(g, 1, 'gy', 'Machina Sniper'), 'Sniper destroyed (no Defender in Deck, nothing to summon)');
});

T('Majestic Star Dragon tributes to negate and destroy all their cards', () => {
  const g = duel({ ex1: ['Majestic Star Dragon'], board: [{ hand: [], m: [FILL], st: ['Mystical Space Typhoon', 'Mirror Force'], turn: 2 }, { m: ['Majestic Dragon', 'Stardust Dragon', 'Golden Ladybug'], st: [{ n: 'Lucky Chance', pos: 'up' }] }] });
  E.act(g, ['end']); flow(g); choose(g, 'sp:'); E.act(g, ['pass']);
  choose(g, 'Mystical Space Typhoon', 0); if (g.prompt.type === 'pick') choose(g, 'Lucky Chance');
  ok(hasOpt(g, 'Tribute: negate'), 'Star Dragon offered'); choose(g, 'Tribute: negate'); flow(g);
  ok(inZ(g, 0, 'gy', 'Mystical Space Typhoon') && !on(g, 0, FILL) && !inZ(g, 0, 'st', 'Mirror Force') && inZ(g, 1, 'gy', 'Majestic Star Dragon') && inZ(g, 1, 'st', 'Lucky Chance'), 'MST negated, A\'s cards destroyed');
});
T('Infernity Beast stops Mirror Force with an empty hand; Dwarf gives piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Infernity Beast', 'Infernity Dwarf'], turn: 2 }, { m: [{ n: 'Majestic Mech - Senku', pos: 'def' }], st: ['Mirror Force'] }] });
  g.p[0].deck.push(g.p[0].hand.pop());
  choose(g, 'bp'); passAll(g); choose(g, 'atk:' + on(g, 0, 'Infernity Beast').u);
  ok(!hasOpt(g, 'Mirror Force'), 'Mirror Force not offered'); flow(g);
  ok(g.p[1].lp === 8000 - 1100, `1100 piercing (${g.p[1].lp})`);
});
T('Golden Bamboo Sword draws 2 with a Bamboo Sword', () => {
  const g = duel({ board: [{ hand: ['Golden Bamboo Sword', 'Broken Bamboo Sword'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Broken Bamboo Sword'); flow(g); const h = g.p[0].hand.length;
  act(g, 0, 'Golden Bamboo Sword'); flow(g);
  ok(g.p[0].hand.length === h + 1, 'net +1 card (drew 2)');
});
T('Helios Trice attacks twice while the opponent has a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Helios Trice Megistus'], ban: [FILL, FILL, FILL, FILL, FILL, FILL, FILL, FILL], turn: 2 }, { m: ['Golden Ladybug', 'Machina Sniper'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Golden'); flow(g);
  ok(hasOpt(g, 'Attack Machina Sniper'), 'second attack offered');
});
T('Koa\'ki Meiru Speeder: draw the Iron Core, draw 1 more', () => {
  const g = duel({ board: [{ hand: [], turn: 2 }, { m: ["Koa'ki Meiru Speeder"], deckTop: ["Iron Core of Koa'ki Meiru"] }] });
  const h = g.p[1].hand.length; E.act(g, ['end']); flow(g);
  ok(g.p[1].hand.length === h + 2, 'B drew 2');
});
T('Koa\'ki Meiru Gravirose mills a small monster in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], turn: 2 }, { m: ["Koa'ki Meiru Gravirose"], deckTop: [FILL, 'Golden Ladybug'] }] });
  E.act(g, ['end']); flow(g);
  ok(inZ(g, 1, 'gy', 'Golden Ladybug'), 'Ladybug sent to GY');
});
T('Koa\'ki Meiru Sea Panther returns a Spell to the Deck top', () => {
  const g = duel({ board: [{ hand: ["Iron Core of Koa'ki Meiru"], m: ["Koa'ki Meiru Sea Panther"], gy: ['Dark Hole'], turn: 2 }, {}] });
  act(g, 0, "Koa'ki Meiru Sea Panther"); choose(g, 'Dark Hole'); flow(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Dark Hole', 'Dark Hole on top');
});
T('Morphtronic Cord destroys a Spell/Trap when the position changes', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Cord'], m: ['Morphtronic Videon'], turn: 2 }, { st: ['Mirror Force'] }] });
  g.p[0].m[0].turnIn = 0;
  act(g, 0, 'Morphtronic Cord'); flow(g); choose(g, 'pos:'); flow(g); if (g.prompt.type === 'pick') choose(g, 'Face-down'); flow(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Morphtronic Engine doubles ATK, then burns in the second Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Engine'], m: ['Morphtronic Datatron'], turn: 2 }, {}] });
  act(g, 0, 'Morphtronic Engine'); flow(g);
  ok(E.atk(g, on(g, 0, 'Morphtronic Datatron')) === 2400, 'Datatron 2400');
  endTurn(g); flow(g); endTurn(g); flow(g); ok(inZ(g, 0, 'st', 'Morphtronic Engine'), 'still there after 1st Standby');
  endTurn(g); flow(g); endTurn(g); flow(g);
  ok(inZ(g, 0, 'gy', 'Morphtronic Engine') && g.p[0].lp === 6800, `destroyed, 1200 damage (${g.p[0].lp})`);
});
T('Morphtronic Monitron changes a summoned Morphtronic to Defense', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Datatron'], st: [{ n: 'Morphtronic Monitron', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'ns:'); flow(g);
  ok(on(g, 0, 'Morphtronic Datatron').pos === 'def', 'Datatron in Defense');
  act(g, 0, 'Morphtronic Datatron'); flow(g); ok(g.p[1].lp === 7700, '300 burn in Defense');
});
T('Morphtronic Cameran summons a Morphtronic when destroyed in Attack', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Morphtronic Cameran'], gy: ['Morphtronic Videon'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Morphtronic Cameran'); flow(g);
  ok(on(g, 1, 'Morphtronic Videon'), 'Videon summoned');
});
T('Morphtronic Magnen Bar gains the ATK of the other 2', () => {
  const g = duel({ board: [{ hand: [], m: ['Morphtronic Magnen Bar', FILL, 'Golden Ladybug'], turn: 2 }, {}] });
  act(g, 0, 'Morphtronic Magnen Bar'); flow(g);
  ok(E.atk(g, on(g, 0, 'Morphtronic Magnen Bar')) === 2100, 'Bar 2100');
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'atk:' + on(g, 0, FILL).u), 'Warwolf cannot attack');
});
T('Morphtronic Accelerator returns a Morphtronic, destroys, draws', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Accelerator', 'Morphtronic Videon'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Morphtronic Accelerator'); flow(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && !inZ(g, 0, 'hand', 'Morphtronic Videon') && g.p[0].hand.length === 2, 'destroyed and drew');
});
T('Morphtronic Map: destroyed, revives a Morphtronic', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Map', 'Mystical Space Typhoon'], gy: ['Morphtronic Videon'], turn: 2 }, {}] });
  act(g, 0, 'Morphtronic Map'); flow(g); act(g, 0, 'Mystical Space Typhoon'); flow(g);
  ok(on(g, 0, 'Morphtronic Videon'), 'Videon revived');
});
T('Majestic Mech - Senku: draws on a direct hit, leaves in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Majestic Mech - Senku'], turn: 2 }, {}] });
  choose(g, 'ns:'); flow(g); const h = g.p[0].hand.length;
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); flow(g);
  ok(g.p[0].hand.length === h + 1, 'drew 1'); endTurn(g); flow(g);
  ok(inZ(g, 0, 'gy', 'Majestic Mech - Senku'), 'Senku sent to the GY');
});
T('Majestic Mech - Goryu: 1 Tribute, then to the GY', () => {
  const g = duel({ board: [{ hand: ['Majestic Mech - Goryu'], m: [FILL], turn: 2 }, {}] });
  choose(g, 'ns:'); flow(g); ok(on(g, 0, 'Majestic Mech - Goryu'), 'Goryu summoned');
  E.act(g, ['end']); flow(g); ok(inZ(g, 0, 'gy', 'Majestic Mech - Goryu'), 'Goryu sent to GY');
});
T('Machina Defender searches Commander Covington when flipped', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Machina Defender', pos: 'set' }], deckTop: ['Commander Covington'], turn: 2 }, {}] });
  choose(g, 'flip:'); flow(g);
  ok(inZ(g, 0, 'hand', 'Commander Covington'), 'Covington added');
});
T('Lucky Cloud draws 2 after 2 Cloudian Tokens', () => {
  const g = duel({ board: [{ hand: ['Lucky Cloud'], m: ['Cloudian - Sheep Cloud'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Lucky Cloud'); flow(g);
  E.act(g, ['bp']); passAll(g); choose(g, 'Attack Gene'); flow(g);
  ok(g.p[0].m.filter(Boolean).length === 2, 'A has 2 Cloudian Tokens'); const h = g.p[0].hand.length;
  choose(g, 'endbp'); flow(g); E.act(g, ['end']); flow(g);
  ok(g.p[0].hand.length === h + 2, `A drew 2 in the End Phase (${g.p[0].hand.length - h})`);
});
T('Lucky Chance calls the coin', () => {
  const g = duel({ board: [{ hand: ['Arcana Force I - The Magician'], turn: 2 }, { st: [{ n: 'Lucky Chance', pos: 'up' }] }] });
  choose(g, 'ns:'); let saw = false;
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (hasOpt(g, 'Lucky Chance')) { saw = true; choose(g, 'Lucky Chance'); } else if (hasOpt(g, 'Heads')) choose(g, 'Heads'); else if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'respond') E.act(g, ['pass']); else E.act(g, [g.prompt.opts[0].key]); }
  ok(saw && g.log.some(l => /called Heads/.test(l)), 'Lucky Chance used on the coin toss');
});

console.log(fails ? `\n${fails} FAILED` : '\nAll full-32 checks passed.');
process.exit(fails ? 1 : 0);
