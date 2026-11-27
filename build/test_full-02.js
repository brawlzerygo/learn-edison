// Scenario checks for full pool batch 02: node build/test_full-02.js
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
const flow = (g, n = 30) => { for (let i = 0; i < n && g.prompt && ['respond', 'yesno'].includes(g.prompt.type); i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else E.act(g, ['pass']); } };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const uOf = (g, p, z, n) => g.p[p][z].find(c => c && E.name(c) === n).u;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const toBP = g => { choose(g, 'bp'); passAll(g); };
// answer everything up to the next free action: pass, yes, the first choice, picks by name preference
const auto = (g, prefer = []) => { for (let i = 0; i < 60 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['y']);
  else if (pr.type === 'choose') { const o = pr.opts.find(x => prefer.some(w => x.label.includes(w))) || pr.opts[0]; E.act(g, [o.key]); }
  else { const os = pr.opts.filter(x => prefer.some(w => x.label.includes(w))).concat(pr.opts.filter(x => !prefer.some(w => x.label.includes(w)))); E.act(g, os.slice(0, Math.max(pr.min, 1)).map(x => x.key)); } } };
const atkWith = (g, n, t) => choose(g, `atk:${on(g, 0, n).u}:${t || ''}`);

T('Aqua Spirit and Armed Dragon LV7: no Normal Summon, Aqua Spirit by its own rule', () => {
  const g = duel({ board: [{ hand: ['Aqua Spirit', 'Armed Dragon LV7'], gy: ['Unifrog', 'Armed Dragon LV10'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + uOf(g, 0, 'hand', 'Aqua Spirit')) && !hasOpt(g, 'set:' + uOf(g, 0, 'hand', 'Armed Dragon LV7')), 'no Normal Summon or Set');
  const lv10 = g.p[0].gy.find(c => E.name(c) === 'Armed Dragon LV10');
  ok(E.lib.forbid(g, { type: 'ss', c: lv10, p: 0, how: 'special' }), 'Armed Dragon LV10 cannot be revived from the GY');
  choose(g, 'sp:' + uOf(g, 0, 'hand', 'Aqua Spirit')); passAll(g);
  ok(on(g, 0, 'Aqua Spirit') && inZ(g, 0, 'ban', 'Unifrog'), 'Aqua Spirit summoned by banishing Unifrog');
});
T('Armed Dragon LV10 from LV7, then destroys face-up monsters', () => {
  const g = duel({ board: [{ hand: ['Armed Dragon LV10', 'Sangan'], m: ['Armed Dragon LV7'], turn: 2 }, { m: [FILL, { n: FILL, pos: 'set' }] }] });
  choose(g, 'sp:'); passAll(g);
  ok(on(g, 0, 'Armed Dragon LV10') && inZ(g, 0, 'gy', 'Armed Dragon LV7'), 'LV10 summoned by Tributing LV7');
  act(g, 0, 'Armed Dragon LV10'); choose(g, 'Sangan'); passAll(g); flow(g);
  ok(g.p[1].m.filter(Boolean).length === 1 && g.p[1].m.find(Boolean).pos === 'set', 'face-up monster destroyed, face-down one stays');
});
T('Armed Dragon LV7 destroys monsters up to the sent monster ATK', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: ['Armed Dragon LV7'], turn: 2 }, { m: ['Kuriboh', FILL] }] });
  act(g, 0, 'Armed Dragon LV7'); choose(g, 'Sangan'); passAll(g); flow(g);
  ok(!on(g, 1, 'Kuriboh') && on(g, 1, FILL), 'Kuriboh (300) destroyed, Warwolf (2000) stays');
});
T('Armed Dragon LV3 levels up in the Standby Phase, LV5 to LV7 after a battle kill', () => {
  const g = duel({ board: [{ hand: ['Armed Dragon LV5', 'Armed Dragon LV7'], m: ['Armed Dragon LV3'], turn: 2 }, { m: ['Kuriboh'] }] });
  yesAll(g); passAll(g); flow(g);
  ok(on(g, 0, 'Armed Dragon LV5') && inZ(g, 0, 'gy', 'Armed Dragon LV3'), 'LV3 became LV5');
  toBP(g); choose(g, 'Attack Kuriboh'); flow(g); flow(g);
  choose(g, 'endbp'); flow(g); choose(g, 'end'); flow(g);
  ok(on(g, 0, 'Armed Dragon LV7') && inZ(g, 0, 'gy', 'Armed Dragon LV5'), 'LV5 became LV7 in the End Phase');
});
T('Armed Dragon LV5 sends a monster to destroy one with less ATK', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: ['Armed Dragon LV5'], turn: 2 }, { m: ['Kuriboh'] }] });
  act(g, 0, 'Armed Dragon LV5'); auto(g, ['Sangan']);
  ok(!on(g, 1, 'Kuriboh') && inZ(g, 0, 'gy', 'Sangan'), 'Kuriboh destroyed');
});
T('Armed Ninja flip destroys a Set Spell, leaves a Set Trap', () => {
  const g = duel({ board: [{ m: [{ n: 'Armed Ninja', pos: 'set' }], turn: 2 }, { st: ['Mystical Space Typhoon'] }] });
  choose(g, 'flip:'); flow(g);
  ok(inZ(g, 1, 'gy', 'Mystical Space Typhoon'), 'Set Spell destroyed');
  const h = duel({ board: [{ m: [{ n: 'Armed Ninja', pos: 'set' }], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(h, 'flip:'); flow(h);
  ok(inZ(h, 1, 'st', 'Mirror Force'), 'Set Trap stays');
});
T('Armed Sea Hunter negates the battled monster and uses a substitute', () => {
  const g = duel({ board: [{ m: ['Armed Sea Hunter', 'Unifrog'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }] }] });
  toBP(g); choose(g, 'Attack Sangan'); flow(g); flow(g);
  ok(inZ(g, 1, 'gy', 'Sangan') && g.log.some(l => /Sangan's effects were negated/.test(l)), 'Sangan destroyed and negated');
  ok(!g.log.some(l => /activated Sangan/.test(l)), 'Sangan did not activate in the GY');
  const h = duel({ board: [{ hand: ['Dark Hole'], m: ['Armed Sea Hunter', 'Unifrog'], turn: 2 }, {}] });
  act(h, 0, 'Dark Hole'); passAll(h); flow(h);
  ok(on(h, 0, 'Armed Sea Hunter') && inZ(h, 0, 'gy', 'Unifrog'), 'Unifrog destroyed instead');
});
T('Armed Samurai - Ben Kei attacks twice with one Equip', () => {
  const g = duel({ board: [{ m: ['Armed Samurai - Ben Kei'], st: [{ n: 'Beast Fangs', pos: 'up' }], turn: 2 }, {}] });
  const b = on(g, 0, 'Armed Samurai - Ben Kei'); g.p[0].st[0].equipTo = b.u;
  toBP(g); choose(g, 'Attack directly'); flow(g); flow(g); choose(g, 'Attack directly'); flow(g); flow(g);
  ok(g.p[1].lp === 6400 && !hasOpt(g, 'Attack directly'), `two attacks of 800 (B ${g.p[1].lp})`);
});
T('Armor Break negates an Equip Spell', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: [FILL], turn: 2 }, { st: ['Armor Break'] }] });
  act(g, 0, 'Black Pendant'); choose(g, 'Armor Break', 1); flow(g);
  ok(inZ(g, 0, 'gy', 'Black Pendant') && E.atk(g, on(g, 0, FILL)) === 2000, 'Black Pendant negated and destroyed');
});
T('Armor Breaker equips, destroys a card on battle damage, and dies instead', () => {
  const g = duel({ board: [{ m: ['Junk Synchron', 'Armor Breaker'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Armor Breaker'); flow(g);
  ok(inZ(g, 0, 'st', 'Armor Breaker'), 'equipped');
  toBP(g); choose(g, 'Attack directly'); auto(g, ['Face-down']);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed after battle damage');
  const h = duel({ board: [{ hand: ['Dark Hole'], m: ['Junk Synchron', 'Armor Breaker'], turn: 2 }, {}] });
  act(h, 0, 'Armor Breaker'); flow(h); act(h, 0, 'Dark Hole'); flow(h);
  ok(on(h, 0, 'Junk Synchron') && inZ(h, 0, 'gy', 'Armor Breaker'), 'Armor Breaker destroyed instead of the Warrior');
});
T('Armor Exe: no attack the turn it arrives, Spell Counter upkeep', () => {
  const g = duel({ board: [{ hand: ['Armor Exe'], turn: 2 }, {}] });
  choose(g, 'ns:'); passAll(g); choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'Attack directly'), 'cannot attack on its summon turn');
  choose(g, 'endbp'); flow(g); choose(g, 'end'); flow(g);
  ok(inZ(g, 0, 'gy', 'Armor Exe'), 'destroyed in the next Standby Phase with no Spell Counter');
});
T('Armored Axon Kicker: no Tribute with a Psychic, damage and revive', () => {
  const g = duel({ board: [{ hand: ['Armored Axon Kicker'], m: ['Psychic Commander'], gy: ['Kuriboh'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'ns:'); if (g.prompt.type === 'choose') choose(g, 'No Tribute'); passAll(g);
  ok(on(g, 0, 'Armored Axon Kicker') && on(g, 0, 'Psychic Commander'), 'summoned without Tributing');
  toBP(g); atkWith(g, 'Armored Axon Kicker'); auto(g);
  ok(g.p[0].lp === 7000 && on(g, 0, 'Kuriboh'), `took 1000 and revived Kuriboh (A ${g.p[0].lp})`);
});
T('Armored Cybern equips Cyber Dragon and destroys a monster', () => {
  const g = duel({ board: [{ m: ['Cyber Dragon', 'Armored Cybern'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Armored Cybern'); flow(g);
  choose(g, '-1000 ATK'); auto(g, [FILL]);
  ok(!on(g, 1, FILL) && E.atk(g, on(g, 0, 'Cyber Dragon')) === 1100, 'Warwolf destroyed, Cyber Dragon at 1100');
});
T('Armored Glass negates Equip bonuses this turn', () => {
  const g = duel({ board: [{ m: [FILL], st: [{ n: 'Black Pendant', pos: 'up' }], turn: 2 }, { st: ['Armored Glass'] }] });
  const w = on(g, 0, FILL); g.p[0].st[0].equipTo = w.u; g.p[0].st[0].flags.pendant = true;
  ok(E.atk(g, w) === 2500, 'Black Pendant gives 500');
  toBP(g); if (hasOpt(g, 'Armored Glass')) choose(g, 'Armored Glass');
  else { choose(g, 'Attack directly'); choose(g, 'Armored Glass', 1); }
  flow(g);
  ok(E.atk(g, w) === 2000, `ATK back to 2000 (${E.atk(g, w)})`);
});
T('Assault Armor: +300, then attack twice', () => {
  const h = duel({ board: [{ hand: ['Assault Armor'], m: ['Junk Synchron'], turn: 2 }, {}] });
  act(h, 0, 'Assault Armor'); flow(h);
  ok(E.atk(h, on(h, 0, 'Junk Synchron')) === 1600, 'Junk Synchron at 1600');
  choose(h, 'attack twice'); flow(h);
  toBP(h); choose(h, 'Attack directly'); flow(h); flow(h); choose(h, 'Attack directly'); flow(h); flow(h);
  ok(h.p[1].lp === 8000 - 2600, `attacked twice for 1300 (B ${h.p[1].lp})`);
});
T('Assault Counter negates while an Assault Mode monster is out', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ['Stardust Dragon Assault Mode'], st: ['Assault Counter'] }] });
  act(g, 0, 'Dark Hole'); choose(g, 'Assault Counter', 1); flow(g);
  ok(on(g, 1, 'Stardust Dragon Assault Mode') && inZ(g, 0, 'gy', 'Dark Hole'), 'Dark Hole negated');
});
T('Assault Mercenary, Assault on GHQ, Assault Teleport', () => {
  const g = duel({ board: [{ hand: ['Assault Mode Activate'], m: ['Assault Mercenary'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Assault Mercenary'); flow(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && !inZ(g, 0, 'hand', 'Assault Mode Activate'), 'returned Assault Mode Activate, Mirror Force destroyed');
  const h = duel({ board: [{ m: [FILL], st: ['Assault on GHQ'], turn: 2 }, {}] });
  const d1 = h.p[1].deck.length; choose(h, 'a:' + h.p[0].st[0].u + ':'); auto(h);
  ok(!on(h, 0, FILL) && h.p[1].deck.length === d1 - 2, 'own monster destroyed, 2 milled');
  const k = duel({ board: [{ hand: ['Assault Teleport', 'Stardust Dragon Assault Mode'], turn: 2 }, {}] });
  act(k, 0, 'Assault Teleport'); flow(k);
  ok(k.p[0].hand.length === 3 && !inZ(k, 0, 'hand', 'Stardust Dragon Assault Mode'), 'returned and drew 2');
});
T('Assault Overload damages both, Assault Revival summons from the GY', () => {
  const g = duel({ board: [{ hand: ['Assault Overload'], m: ['Stardust Dragon Assault Mode'], turn: 2 }, {}] });
  act(g, 0, 'Assault Overload'); flow(g);
  ok(g.p[0].lp === 6000 && g.p[1].lp === 6000, `2000 to both (A ${g.p[0].lp}, B ${g.p[1].lp})`);
  const h = duel({ board: [{ hand: ['Assault Revival'], m: [FILL], gy: ['Assault Mode Activate', 'Stardust Dragon Assault Mode'], turn: 2 }, {}] });
  act(h, 0, 'Assault Revival'); flow(h);
  const s = on(h, 0, 'Stardust Dragon Assault Mode');
  ok(s && s.flags.negated && s.flags.noTribute && inZ(h, 0, 'gy', FILL), 'summoned negated, Warwolf destroyed');
});
T('Assault Slash destroys face-up monsters', () => {
  const g = duel({ board: [{ m: ['Stardust Dragon Assault Mode'], st: ['Assault Slash'], turn: 2 }, { m: [FILL, { n: 'Kuriboh', pos: 'set' }] }] });
  act(g, 0, 'Assault Slash'); flow(g);
  ok(!on(g, 0, 'Stardust Dragon Assault Mode') && !on(g, 1, FILL) && g.p[1].m.some(Boolean), 'face-up monsters destroyed, Set stays');
});
T('Attack and Receive burns after damage', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: ['Attack and Receive'], gy: ['Attack and Receive'] }] });
  toBP(g); choose(g, 'Attack directly'); flow(g); flow(g);
  ok(g.p[1].lp === 6000 && g.p[0].lp === 7000, `B took 2000, A took 1000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Attack of the Cornered Rat lowers the attacker ATK', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Fairy Dragon'], st: [{ n: 'Attack of the Cornered Rat', pos: 'up' }] }] });
  // Fairy Dragon is a Level 4 Normal: use a Level 3 Normal instead
  const h = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Dragon Zombie'], st: [{ n: 'Attack of the Cornered Rat', pos: 'up' }] }] });
  toBP(h); choose(h, 'Attack Dragon Zombie'); passAll(h, 1);
  for (let i = 0; i < 6 && h.prompt && h.prompt.type === 'respond'; i++) { if (h.prompt.p === 1 && hasOpt(h, 'Pay LP')) { choose(h, 'Pay LP'); choose(h, '500'); } else E.act(h, ['pass']); }
  flow(h);
  ok(on(h, 1, 'Dragon Zombie') && h.p[1].lp === 7500 && h.p[0].lp === 8000 - 100, `paid 500, Warwolf at 1500 lost to 1600 (A ${h.p[0].lp}, B ${h.p[1].lp})`);
});
T('Attack Pheromones turns a Defense monster to Attack', () => {
  const g = duel({ board: [{ m: ['Gagagigo'], st: [{ n: 'Attack Pheromones', pos: 'up' }], turn: 2 }, { m: [{ n: 'Black Stego', pos: 'def' }] }] });
  toBP(g); choose(g, 'Attack Black Stego'); auto(g);
  ok(on(g, 1, 'Black Stego') && on(g, 1, 'Black Stego').pos === 'atk', 'Black Stego (2000 DEF) is in Attack Position');
});
T('Attack Reflector Unit summons Cyber Barrier Dragon', () => {
  const g = duel({ board: [{ hand: ['Cyber Barrier Dragon'], m: ['Cyber Dragon'], st: ['Attack Reflector Unit'], turn: 2 }, {}] });
  act(g, 0, 'Attack Reflector Unit'); flow(g);
  ok(on(g, 0, 'Cyber Barrier Dragon') && inZ(g, 0, 'gy', 'Cyber Dragon'), 'Cyber Barrier Dragon summoned');
});
T('B.E.S. Big Core counters, Covered Core coin, Crystal Core and Tetran', () => {
  const g = duel({ board: [{ hand: ['B.E.S. Big Core'], m: ['Kuriboh'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'ns:'); auto(g);
  const b = on(g, 0, 'B.E.S. Big Core');
  ok(b && E.lib.ctr(b, 'bes') === 3, 'Big Core has 3 counters');
  toBP(g); choose(g, 'Attack Cyber Dragon'); auto(g);
  ok(on(g, 0, 'B.E.S. Big Core') && E.lib.ctr(b, 'bes') === 2, 'survived battle, 2 counters left');
  const h = duel({ board: [{ m: ['B.E.S. Covered Core'], turn: 2 }, { m: [FILL] }] });
  toBP(h); choose(h, 'Attack ' + FILL); for (let i = 0; i < 20 && h.prompt && h.prompt.type !== 'idle'; i++) { if (h.prompt.type === 'choose') choose(h, 'Heads'); else if (h.prompt.type === 'yesno') choose(h, 'yes'); else E.act(h, ['pass']); }
  ok(inZ(h, 0, 'gy', 'B.E.S. Covered Core'), 'Covered Core with no counter is destroyed after battle');
  const k = duel({ board: [{ m: ['B.E.S. Crystal Core', 'B.E.S. Tetran'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  on(k, 0, 'B.E.S. Tetran').ctr = { bes: 1 }; act(k, 0, 'B.E.S. Crystal Core'); flow(k);
  ok(on(k, 1, FILL).pos === 'def', 'Crystal Core changed Warwolf to Defense');
  act(k, 0, 'B.E.S. Tetran'); flow(k);
  ok(inZ(k, 1, 'gy', 'Mirror Force') && E.lib.ctr(on(k, 0, 'B.E.S. Tetran'), 'bes') === 0, 'Tetran used a counter to destroy Mirror Force');
});
T('B.E.S. Big Core MK-2 without Tribute', () => {
  const g = duel({ board: [{ hand: ['B.E.S. Big Core MK-2'], turn: 2 }, {}] });
  choose(g, 'ns:'); if (g.prompt.type === 'choose') choose(g, 'No Tribute'); flow(g);
  ok(on(g, 0, 'B.E.S. Big Core MK-2'), 'Normal Summoned with no Tribute');
});
T('Battle Mania changes their monsters to Attack', () => {
  const g = duel({ board: [{ m: [{ n: FILL, pos: 'def' }], turn: 2 }, { st: ['Battle Mania'] }] });
  for (let i = 0; i < 40 && g.prompt && !(g.prompt.type === 'yesno' && /Battle Mania/.test(g.prompt.text)); i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else if (g.prompt.type === 'yesno') choose(g, 'no'); else auto(g); }
  choose(g, 'yes'); auto(g); // B's turn 3: A's standby? Battle Mania is for the opponent's Standby Phase
  // turn 3 is B's: Battle Mania belongs to B, so it fires in A's standby (turn 4)
  for (let i = 0; i < 6 && g.prompt && g.prompt.p === 1; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else flow(g); }
  flow(g);
  ok(on(g, 0, FILL).pos === 'atk', 'A\'s Warwolf in Attack Position');
});
T('Battle of the Elements leaves one Attribute each', () => {
  const g = duel({ board: [{ m: [FILL, 'Sangan'], st: ['Battle of the Elements'], turn: 2 }, { m: ['Kuriboh'] }] });
  act(g, 0, 'Battle of the Elements'); for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'choose') choose(g, 'EARTH'); else E.act(g, ['pass']); }
  ok(on(g, 0, FILL) && inZ(g, 0, 'gy', 'Sangan') && on(g, 1, 'Kuriboh'), 'Sangan sent, Kuriboh stays');
});
T('Battle Teleportation: direct attack, then control passes', () => {
  const g = duel({ board: [{ m: ['Psychic Commander'], st: ['Battle Teleportation'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Battle Teleportation'); flow(g);
  toBP(g); choose(g, 'Attack directly'); flow(g); flow(g);
  ok(g.p[1].lp === 6600, `direct attack for 1400 (B ${g.p[1].lp})`);
  choose(g, 'endbp'); flow(g);
  ok(on(g, 1, 'Psychic Commander') && !on(g, 0, 'Psychic Commander'), 'Psychic Commander went to B');
});
T('Battle Tuned, Battle-Scarred', () => {
  const g = duel({ board: [{ hand: ['Battle Tuned'], m: [FILL], gy: ['Junk Synchron'], turn: 2 }, {}] });
  act(g, 0, 'Battle Tuned'); flow(g);
  ok(E.atk(g, on(g, 0, FILL)) === 3300 && inZ(g, 0, 'ban', 'Junk Synchron'), 'Warwolf gained 1300');
  const h = duel({ board: [{ m: ['Vilepawn Archfiend'], st: ['Battle-Scarred'], turn: 2 }, {}] });
  act(h, 0, 'Battle-Scarred'); flow(h); choose(h, 'end'); flow(h);
  for (let i = 0; i < 4 && h.prompt && h.prompt.p === 1; i++) { if (h.prompt.type === 'idle') choose(h, 'end'); else flow(h); }
  flow(h);
  ok(h.p[1].lp === 7500, `B paid 500 in A's Standby Phase (B ${h.p[1].lp})`);
});
T('Beast King Barbaros: 1900 without Tribute, 3 Tributes destroy all', () => {
  const g = duel({ board: [{ hand: ['Beast King Barbaros'], turn: 2 }, {}] });
  choose(g, 'ns:'); if (g.prompt.type === 'choose') choose(g, 'No Tribute'); flow(g);
  ok(E.atk(g, on(g, 0, 'Beast King Barbaros')) === 1900, 'ATK 1900');
  const h = duel({ board: [{ hand: ['Beast King Barbaros'], m: [FILL, 'Kuriboh', 'Sangan'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  choose(h, 'ns:'); choose(h, '3 Tributes'); flow(h); flow(h);
  ok(E.atk(h, on(h, 0, 'Beast King Barbaros')) === 3000 && !h.p[1].m.some(Boolean) && inZ(h, 1, 'gy', 'Mirror Force'), 'ATK 3000, all their cards destroyed');
});
T('Beast Machine King Barbaros Ur: summon rule and no battle damage', () => {
  const g = duel({ board: [{ hand: ['Beast Machine King Barbaros Ür', 'Cyber Dragon'], gy: [FILL], turn: 2 }, {}] });
  choose(g, 'sp:'); auto(g, [FILL]);
  ok(on(g, 0, 'Beast Machine King Barbaros Ür') && inZ(g, 0, 'ban', FILL) && inZ(g, 0, 'ban', 'Cyber Dragon'), 'summoned by banishing a Machine and a Beast-Warrior');
  toBP(g); choose(g, 'Attack directly'); flow(g); flow(g);
  ok(g.p[1].lp === 8000, 'no battle damage');
});
T('Beast of the Pharaoh, Beast Soul Swap, Beast Striker, Beast Fangs', () => {
  const g = duel({ ex0: ['Goyo Guardian'], board: [{ m: ['Beast of the Pharaoh', 'Junk Synchron'], gy: ['Pyramid Turtle'], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); auto(g, ['Attack', 'Pyramid']);
  ok(on(g, 0, 'Goyo Guardian') && on(g, 0, 'Pyramid Turtle'), 'Synchro Summon, then Pyramid Turtle revived');
  const h = duel({ board: [{ hand: ['Big-Tusked Mammoth'], m: ['Big-Tusked Mammoth'], st: ['Beast Soul Swap'], turn: 2 }, {}] });
  act(h, 0, 'Beast Soul Swap'); auto(h);
  ok(on(h, 0, 'Big-Tusked Mammoth') && h.p[0].hand.some(c => E.name(c) === 'Big-Tusked Mammoth'), 'returned one Mammoth and summoned the other');
  const k = duel({ board: [{ hand: ['Sangan'], m: ['Beast Striker'], deckTop: [FILL, 'Moja'], turn: 2 }, {}] });
  act(k, 0, 'Beast Striker'); auto(k, ['Sangan']);
  ok(on(k, 0, 'Moja'), 'Moja Special Summoned');
  const f = duel({ board: [{ hand: ['Beast Fangs'], m: ['Moja'], turn: 2 }, {}] });
  act(f, 0, 'Beast Fangs'); flow(f);
  ok(E.atk(f, on(f, 0, 'Moja')) === 400 && E.def(f, on(f, 0, 'Moja')) === 400, 'Moja 400/400');
});
T('Big Bang Shot pierces and banishes, Black Pendant burns', () => {
  const g = duel({ board: [{ hand: ['Big Bang Shot', 'Mystical Space Typhoon'], m: [FILL], turn: 2 }, { m: [{ n: 'Kuriboh', pos: 'def' }] }] });
  act(g, 0, 'Big Bang Shot'); auto(g);
  toBP(g); choose(g, 'Attack Kuriboh'); flow(g); flow(g);
  ok(g.p[1].lp === 8000 - 2200, `piercing 2200 (B ${g.p[1].lp})`);
  choose(g, 'endbp'); flow(g); act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(inZ(g, 0, 'ban', FILL), 'Warwolf banished when Big Bang Shot left');
  const h = duel({ board: [{ hand: ['Black Pendant', 'Mystical Space Typhoon'], m: [FILL], turn: 2 }, {}] });
  act(h, 0, 'Black Pendant'); auto(h); act(h, 0, 'Mystical Space Typhoon'); auto(h);
  ok(h.p[1].lp === 7500, `500 damage (B ${h.p[1].lp})`);
});
T('Big Burn banishes the GYs in answer to Call of the Haunted', () => {
  const g = duel({ board: [{ st: ['Call of the Haunted'], gy: ['Sangan'], turn: 2 }, { st: ['Big Burn'], gy: ['Kuriboh'] }] });
  act(g, 0, 'Call of the Haunted'); if (g.prompt.type === 'pick') choose(g, 'Sangan'); choose(g, 'Big Burn', 1); flow(g);
  ok(inZ(g, 0, 'ban', 'Sangan') && inZ(g, 1, 'ban', 'Kuriboh') && !on(g, 0, 'Sangan'), 'both GYs banished, Reborn found nothing');
});
T('Big Evolution Pill: Tribute-free Dinosaurs, gone after 3 of their End Phases', () => {
  const g = duel({ board: [{ hand: ['Big Evolution Pill', 'Black Tyranno'], m: ['Black Stego'], turn: 2 }, {}] });
  act(g, 0, 'Big Evolution Pill'); flow(g);
  ok(inZ(g, 0, 'st', 'Big Evolution Pill') && inZ(g, 0, 'gy', 'Black Stego'), 'Pill stays, Stego Tributed');
  choose(g, 'ns:'); if (g.prompt.type === 'choose') choose(g, 'No Tribute'); flow(g);
  ok(on(g, 0, 'Black Tyranno'), 'Black Tyranno Normal Summoned with no Tribute');
  for (let t = 0; t < 6; t++) { auto(g); if (g.prompt) choose(g, 'end'); }
  flow(g);
  ok(inZ(g, 0, 'gy', 'Big Evolution Pill'), 'Pill destroyed after the third End Phase of B');
});
T('Big Eye reorders the top of the Deck', () => {
  const g = duel({ board: [{ m: [{ n: 'Big Eye', pos: 'set' }], deckTop: ['Sangan', 'Kuriboh'], turn: 2 }, {}] });
  // the turn's draw took the first deckTop card (Sangan), so Kuriboh is on top now
  choose(g, 'flip:'); for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') choose(g, FILL); else E.act(g, ['pass']); }
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(E.name(top) === FILL, 'a Warwolf was put on top');
});
T('Big Shield Gardna changes to Attack after being attacked', () => {
  const g = duel({ board: [{ m: ['Kuriboh'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'set' }] }] });
  toBP(g); choose(g, 'Attack the face-down'); flow(g); flow(g);
  ok(on(g, 1, 'Big Shield Gardna') && on(g, 1, 'Big Shield Gardna').pos === 'atk', 'Big Shield Gardna in Attack Position');
});
T('Big Wave Small Wave swaps WATER monsters', () => {
  const g = duel({ board: [{ hand: ['Big Wave Small Wave', 'Mother Grizzly'], m: ['Unifrog'], turn: 2 }, {}] });
  act(g, 0, 'Big Wave Small Wave'); for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') choose(g, 'Mother Grizzly'); else E.act(g, ['pass']); }
  ok(on(g, 0, 'Mother Grizzly') && inZ(g, 0, 'gy', 'Unifrog'), 'Unifrog destroyed, Mother Grizzly summoned');
});
T('Big-Tusked Mammoth stops attacks the turn they are summoned', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { m: ['Big-Tusked Mammoth'] }] });
  choose(g, 'ns:'); flow(g); toBP(g);
  ok(!hasOpt(g, 'Attack'), 'the new Warwolf cannot attack');
});
T('Black Dragon\'s Chick, Black Horn of Heaven, Black Luster Ritual', () => {
  const g = duel({ board: [{ hand: ['Red-Eyes Black Dragon'], m: ['Black Dragon\'s Chick'], turn: 2 }, {}] });
  act(g, 0, 'Black Dragon\'s Chick'); flow(g);
  ok(on(g, 0, 'Red-Eyes Black Dragon'), 'Red-Eyes summoned');
  const h = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: ['Black Horn of Heaven'] }] });
  choose(h, 'sp:'); choose(h, 'Black Horn', 1); flow(h);
  ok(!on(h, 0, 'Cyber Dragon') && inZ(h, 0, 'gy', 'Cyber Dragon'), 'Cyber Dragon negated and destroyed');
  const k = duel({ board: [{ hand: ['Black Luster Ritual', 'Black Luster Soldier'], m: [FILL, 'Pyramid Turtle'], turn: 2 }, {}] });
  act(k, 0, 'Black Luster Ritual'); auto(k, ['Pyramid']);
  ok(on(k, 0, 'Black Luster Soldier'), 'Black Luster Soldier Ritual Summoned');
});
T('Black Potan, Black Ptera, Black Stego, Black Tyranno, Black Veloci', () => {
  const g = duel({ board: [{ m: ['Black Potan', 'Junk Synchron'], st: ['Assault on GHQ'], turn: 2 }, {}] });
  choose(g, 'a:' + g.p[0].st[0].u + ':'); auto(g, ['Junk']);
  ok(g.p[0].lp === 8800, `gained 800 when the Tuner left (A ${g.p[0].lp})`);
  const p2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Black Ptera'], turn: 2 }, {}] });
  act(p2, 0, 'Dark Hole'); auto(p2);
  ok(inZ(p2, 0, 'hand', 'Black Ptera'), 'Black Ptera back to the hand');
  const h = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Black Stego'] }] });
  toBP(h); choose(h, 'Attack Black Stego'); flow(h); flow(h);
  ok(on(h, 1, 'Black Stego') && h.p[1].lp === 8000, 'Stego switched to Defense and survived');
  const k = duel({ board: [{ m: ['Black Tyranno'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  toBP(k); ok(hasOpt(k, 'Attack directly'), 'Black Tyranno can attack directly');
  const v = duel({ board: [{ m: ['Black Veloci'], turn: 2 }, { m: [FILL] }] });
  toBP(v); choose(v, 'Attack ' + FILL); flow(v); flow(v);
  ok(!on(v, 1, FILL) && v.p[1].lp === 7800, `Veloci at 2200 beat Warwolf (B ${v.p[1].lp})`);
});
T('Aqua Chorus, Armed Changer', () => {
  const g = duel({ board: [{ m: [FILL, FILL], st: [{ n: 'Aqua Chorus', pos: 'up' }], turn: 2 }, {}] });
  ok(E.atk(g, g.p[0].m[0]) === 2500, 'same-name monsters gain 500');
  const h = duel({ board: [{ hand: ['Armed Changer', 'Beast Fangs'], m: [FILL], gy: ['Sangan'], turn: 2 }, { m: ['Kuriboh'] }] });
  act(h, 0, 'Armed Changer'); for (let i = 0; i < 6 && h.prompt && h.prompt.type !== 'idle'; i++) { if (h.prompt.type === 'pick' && hasOpt(h, FILL)) choose(h, FILL); else if (h.prompt.type === 'pick') choose(h, 'Beast Fangs'); else E.act(h, ['pass']); }
  ok(inZ(h, 0, 'gy', 'Beast Fangs') && inZ(h, 0, 'st', 'Armed Changer'), 'Beast Fangs sent as the cost');
  toBP(h); choose(h, 'Attack Kuriboh'); flow(h); flow(h);
  ok(inZ(h, 0, 'hand', 'Sangan'), 'Sangan added from the GY');
});
console.log(fails ? `\n${fails} check(s) failed.` : '\nAll checks passed.');
process.exit(fails ? 1 : 0);
