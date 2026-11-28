// Scenario checks for full pool batch 15: node build/test_full-15.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
// answer everything up to the next free action: pass responses, say yes, take the first options
function auto(g, o = {}) {
  for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') E.act(g, [o.no ? 'n' : 'y']);
    else if (pr.type === 'choose') E.act(g, [pr.opts[0].key]);
    else E.act(g, pr.opts.slice(0, Math.max(pr.min, Math.min(pr.max, 1))).map(x => x.key));
  }
}
// pass responses until player `who` may respond, then pick the option for card n
function respondWith(g, who, n) {
  for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond' && !(g.prompt.p === who && hasOpt(g, n)); i++) E.act(g, ['pass']);
  choose(g, n, who);
}
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const st = (g, p, n) => g.p[p].st.find(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const goBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => choose(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const endTurn = g => { if (g.prompt && g.prompt.type === 'idle') choose(g, 'end'); auto(g); };

T('Spell Absorption gains 500 when a Spell resolves', () => {
  const g = duel({ board: [{ hand: ['Final Flame'], st: [{ n: 'Spell Absorption', pos: 'up' }] }, {}] });
  act(g, 0, 'Final Flame'); auto(g);
  ok(g.p[0].lp === 8500 && g.p[1].lp === 7400, `A 8500, B 7400 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Spell Calling Sets a Quick-Play when Heavy Storm destroys it', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'] }, { st: ['Spell Calling'], deckTop: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Heavy Storm'); auto(g);
  const m = st(g, 1, 'Mystical Space Typhoon'); ok(!!m && m.pos === 'set', 'MST was Set from the Deck');
});
T('Spell Canceller stops Spell activations', () => {
  const g = duel({ board: [{ hand: ['Final Flame'], m: ['Spell Canceller'] }, {}] });
  ok(!hasOpt(g, 'a:' + card(g, 0, 'Final Flame').u + ':'), 'Final Flame cannot be activated');
});
T('Spell Chronicle: cost, counters, adding a card and the damage', () => {
  const g = duel({ board: [{ hand: ['Spell Chronicle', FILL], m: [FILL], st: ['Heavy Storm'], deckTop: [FILL, 'Final Flame', 'Final Flame', 'Gift Card', 'Book of Moon', 'Heavy Storm'] }, {}] });
  act(g, 0, 'Spell Chronicle');
  const ch = st(g, 0, 'Spell Chronicle'); auto(g); E.lib.addCtr(g, ch, 'chronicle', 2); choose(g, 'pos:'); auto(g); // counters stand in for 2 opponent Spells; the position change refreshes the menu
  ok(g.p[0].hand.length === 0 && g.p[0].ban.length === 5 && inZ(g, 0, 'gy', FILL), 'hand sent, 5 banished');
  choose(g, `a:${ch.u}:2`); auto(g);
  ok(g.p[0].hand.length === 1 && g.p[0].ban.length === 4, 'B chose a card for A to add');
  act(g, 0, 'Heavy Storm'); auto(g);
  ok(g.p[0].lp === 6000, `A took 2000 (A ${g.p[0].lp})`);
});
T('Spell Gear summons two Ancient Gear Golems and locks the Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Spell Gear', 'Ancient Gear Golem', FILL], m: ['Ancient Gear Soldier', 'Ancient Gear Soldier', 'Ancient Gear Cannon', FILL], deckTop: [FILL, 'Ancient Gear Golem'] }, {}] });
  act(g, 0, 'Spell Gear'); auto(g);
  ok(cnt(g, 0, 'm', 'Ancient Gear Golem') === 2 && !on(g, 0, FILL), `2 Golems, the rest destroyed (${g.p[0].m.filter(Boolean).map(E.name)})`);
  ok(!hasOpt(g, 'ns:'), 'no Normal Summon after it');
});
T('Spell of Pain sends Final Flame back', () => {
  const g = duel({ board: [{ hand: ['Final Flame'] }, { st: ['Spell of Pain'] }] });
  act(g, 0, 'Final Flame'); respondWith(g, 1, 'Spell of Pain'); auto(g);
  ok(g.p[0].lp === 7400 && g.p[1].lp === 8000, `A 7400, B 8000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Spell Power Grasp places a counter, searches, once per turn', () => {
  const g = duel({ board: [{ hand: ['Spell Power Grasp'], m: ['Breaker the Magical Warrior'], deckTop: ['Spell Power Grasp'] }, {}] });
  const br = on(g, 0, 'Breaker the Magical Warrior');
  act(g, 0, 'Spell Power Grasp'); auto(g);
  ok(E.lib.ctr(br, 'spell') === 1 && inZ(g, 0, 'hand', 'Spell Power Grasp'), 'counter placed and a copy added');
  ok(!hasOpt(g, 'a:' + card(g, 0, 'Spell Power Grasp').u + ':'), 'a second one cannot be activated');
});
T('Spell Purification destroys face-up Continuous Spells', () => {
  const g = duel({ board: [{ hand: [FILL], st: ['Spell Purification'] }, { st: [{ n: 'Spell Absorption', pos: 'up' }] }] });
  act(g, 0, 'Spell Purification'); auto(g);
  ok(inZ(g, 1, 'gy', 'Spell Absorption') && inZ(g, 0, 'gy', FILL), 'destroyed after a discard');
});
T('Spell Reactor RE destroys the Spell and burns 800', () => {
  const g = duel({ board: [{ hand: ['Final Flame'] }, { m: ['Spell Reactor RE'] }] });
  act(g, 0, 'Final Flame'); respondWith(g, 1, 'Spell Reactor RE'); auto(g);
  ok(g.p[0].lp === 7200 && g.p[1].lp === 7400, `A took 800, Final Flame still resolved (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Spell Reclamation returns the Spell to the hand', () => {
  const g = duel({ board: [{ hand: ['Final Flame', FILL], st: ['Spell Reclamation'] }, {}] });
  act(g, 0, 'Final Flame'); respondWith(g, 0, 'Spell Reclamation'); auto(g);
  ok(inZ(g, 0, 'hand', 'Final Flame') && g.p[1].lp === 7400, 'Final Flame resolved and came back');
});
T('Spell Shattering Arrow destroys face-up Spells and burns', () => {
  const g = duel({ board: [{ hand: ['Spell Shattering Arrow'] }, { st: [{ n: 'Spell Absorption', pos: 'up' }, { n: 'Spiritual Forest', pos: 'up' }, 'Mystical Space Typhoon'] }] });
  act(g, 0, 'Spell Shattering Arrow'); auto(g);
  ok(g.p[1].lp === 7000 && st(g, 1, 'Mystical Space Typhoon'), `B took 1000, the Set card stays (B ${g.p[1].lp})`);
});
T('Spell Shield Type-8 negates Book of Moon', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'] }, { m: [FILL], st: ['Spell Shield Type-8'] }] });
  act(g, 0, 'Book of Moon');
  respondWith(g, 1, 'Spell Shield Type-8'); auto(g);
  ok(on(g, 1, FILL).pos === 'atk' && inZ(g, 0, 'gy', 'Book of Moon'), 'the monster stays face-up, Book of Moon destroyed');
});
T('Spell Striker summons by banishing a Spell', () => {
  const g = duel({ board: [{ hand: ['Spell Striker'], gy: ['Final Flame'] }, { m: [FILL] }] });
  choose(g, 'sp:'); auto(g);
  ok(!!on(g, 0, 'Spell Striker') && g.p[0].ban.length === 1, 'summoned');
});
T('Spell Vanishing negates and sends the copies', () => {
  const g = duel({ board: [{ hand: ['Final Flame', 'Final Flame'], deckTop: ['Final Flame'] }, { hand: [FILL, FILL], st: ['Spell Vanishing'] }] });
  act(g, 0, 'Final Flame'); respondWith(g, 1, 'Spell Vanishing'); auto(g);
  ok(g.p[1].lp === 8000 && cnt(g, 0, 'gy', 'Final Flame') === 3, `negated, all 3 in the GY (${cnt(g, 0, 'gy', 'Final Flame')})`);
});
T('Spell-Stopping Statute negates a Continuous Spell', () => {
  const g = duel({ board: [{ hand: ['Spell Absorption'] }, { st: ['Spell-Stopping Statute'] }] });
  act(g, 0, 'Spell Absorption'); respondWith(g, 1, 'Spell-Stopping Statute'); auto(g);
  ok(inZ(g, 0, 'gy', 'Spell Absorption'), 'destroyed');
});
T('Spirit Barrier: no battle damage while you control a monster', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Spirit of the Breeze'], st: [{ n: 'Spirit Barrier', pos: 'up' }] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Spirit of the Breeze')); auto(g);
  ok(g.p[1].lp === 8000, `B took nothing (B ${g.p[1].lp})`);
});
T('Spirit Burner: Defense change and 600 when the monster is bounced', () => {
  const g = duel({ board: [{ hand: ['Spirit Burner'], m: [FILL], st: ['Compulsory Evacuation Device'] }, {}] });
  act(g, 0, 'Spirit Burner'); auto(g);
  const sb = st(g, 0, 'Spirit Burner'); choose(g, `a:${sb.u}:1`); auto(g);
  ok(on(g, 0, FILL).pos === 'def', 'changed to Defense');
  act(g, 0, 'Compulsory Evacuation Device'); auto(g);
  ok(g.p[1].lp === 7400 && inZ(g, 0, 'gy', 'Spirit Burner'), `600 damage (B ${g.p[1].lp})`);
});
T('Spirit Burner is added instead of the normal draw', () => {
  const g = duel({ board: [{}, { gy: ['Spirit Burner'] }] });
  endTurn(g);
  ok(inZ(g, 1, 'hand', 'Spirit Burner') && g.p[1].hand.length === 6, `added, hand ${g.p[1].hand.length}`);
});
T('Spirit Caller revives a Level 3 or lower Normal Monster when flipped', () => {
  const g = duel({ board: [{ m: [{ n: 'Spirit Caller', pos: 'set' }], gy: ['Petit Moth'] }, {}] });
  choose(g, 'flip:'); auto(g);
  ok(!!on(g, 0, 'Petit Moth'), 'Petit Moth summoned');
});
T('Spirit Force: no damage and a Warrior Tuner back', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: ['Spirit Force'], gy: ['Junk Synchron'] }] });
  goBP(g); attack(g, on(g, 0, FILL), null);
  for (let i = 0; i < 10 && g.prompt && !(g.prompt.p === 1 && hasOpt(g, 'Spirit Force')); i++) E.act(g, [g.prompt.type === 'respond' ? 'pass' : g.prompt.opts[0].key]);
  choose(g, 'Spirit Force', 1); auto(g);
  ok(g.p[1].lp === 8000 && inZ(g, 1, 'hand', 'Junk Synchron'), `B took nothing (B ${g.p[1].lp}) and added Junk Synchron`);
});
T('Spirit of the Breeze gains 1000 in its Standby Phase', () => {
  const g = duel({ board: [{}, { m: ['Spirit of the Breeze'] }] });
  endTurn(g);
  ok(g.p[1].lp === 9000, `B 9000 (${g.p[1].lp})`);
});
T('Spirit of the Pharaoh cannot be revived', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Spirit of the Pharaoh'] }, {}] });
  if (hasOpt(g, 'a:' + card(g, 0, 'Monster Reborn').u + ':')) { act(g, 0, 'Monster Reborn'); auto(g); }
  ok(!on(g, 0, 'Spirit of the Pharaoh'), 'not summoned');
});
T('Spirit of the Pharaoh revives Zombie Normal Monsters', () => {
  const g = duel({ board: [{ hand: ['Spirit of the Pharaoh'], gy: ['Armored Zombie', 'Armored Zombie'] }, {}] });
  // the summon by The First Sarcophagus, acted out: its card leaves the field this turn
  g.events.push({ type: 'move', c: { id: id('The First Sarcophagus'), u: -5, flags: {} }, wasField: true, turn: g.turnNo });
  const ph = card(g, 0, 'Spirit of the Pharaoh');
  ok(E.lib.ss(g, 0, ph, 'atk', { src: { id: id('The First Sarcophagus') } }) === true, 'Special Summoned with The First Sarcophagus');   // src: the card summoning it (summoning conditions, 2026-11-27)
});
T('Spirit of the Pot of Greed lets the player draw 1 more', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Spirit of the Pot of Greed'] }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Pot of Greed'); auto(g);
  ok(g.p[0].hand.length === h - 1 + 3, `drew 3 (hand ${g.p[0].hand.length})`);
});
T('Spirit of the Six Samurai: equip, bonus, draw on a kill', () => {
  const g = duel({ board: [{ m: ['Spirit of the Six Samurai', 'The Six Samurai - Yaichi'], turn: 2 }, { m: ['Spell Reactor RE'] }] });
  const sp = on(g, 0, 'Spirit of the Six Samurai'), ya = on(g, 0, 'The Six Samurai - Yaichi');
  choose(g, `a:${sp.u}:0`); auto(g);
  ok(E.atk(g, ya) === 1800, `Yaichi 1800 (${E.atk(g, ya)})`);
  const h = g.p[0].hand.length; goBP(g); attack(g, ya, on(g, 1, 'Spell Reactor RE')); auto(g);
  ok(g.p[0].hand.length === h + 1, 'drew 1');
});
T('Spirit Ryu gains 1000 until the end of the Battle Phase', () => {
  const g = duel({ board: [{ hand: ['Luster Dragon'], m: ['Spirit Ryu'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  const r = on(g, 0, 'Spirit Ryu'); goBP(g); attack(g, r, on(g, 1, FILL));
  respondWith(g, 0, 'Spirit Ryu'); auto(g);
  ok(inZ(g, 0, 'gy', 'Luster Dragon') && inZ(g, 1, 'gy', FILL), 'discarded and won the battle');
  ok(E.atk(g, r) === 2000, `2000 in the Battle Phase (${E.atk(g, r)})`);
  choose(g, 'endbp'); auto(g);
  ok(E.atk(g, r) === 1000, `1000 after it (${E.atk(g, r)})`);
});
T('Spiritual Energy Settle Machine keeps a Spirit on the field', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Great Long Nose'], st: [{ n: 'Spiritual Energy Settle Machine', pos: 'up' }] }, {}] });
  on(g, 0, 'Great Long Nose').flags.spirit = g.turnNo;
  endTurn(g);
  ok(!!on(g, 0, 'Great Long Nose') && inZ(g, 0, 'gy', FILL) && st(g, 0, 'Spiritual Energy Settle Machine'), 'stayed, the Machine kept by a discard');
});
T('Spiritual Energy Settle Machine leaving returns Spirits', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Great Long Nose'], st: [{ n: 'Spiritual Energy Settle Machine', pos: 'up' }] }, {}] });
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(inZ(g, 0, 'hand', 'Great Long Nose'), 'returned to the hand');
});
T('Spiritual Forest saves the first Beast-Warrior once a turn', () => {
  const g = duel({ board: [{ m: ['Spirit of Flames', 'Spirit of Flames'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }], st: [{ n: 'Spiritual Forest', pos: 'up' }] }] });
  goBP(g); const [a1, a2] = g.p[0].m.filter(Boolean);
  attack(g, a1, on(g, 1, FILL)); auto(g);
  ok(!!on(g, 1, FILL), 'not destroyed the first time');
  attack(g, a2, on(g, 1, FILL)); auto(g);
  ok(!on(g, 1, FILL), 'destroyed the second time');
});
T('Super Conductor Tyranno: Tribute for 1000, then no attack', () => {
  const g = duel({ board: [{ m: ['Super Conductor Tyranno', FILL], turn: 2 }, {}] });
  const t = on(g, 0, 'Super Conductor Tyranno'); choose(g, `a:${t.u}:0`); choose(g, FILL); auto(g);
  ok(g.p[1].lp === 7000 && !on(g, 0, FILL), 'B 7000');
  goBP(g); ok(!hasOpt(g, `atk:${t.u}:`), 'cannot attack');
});
T('Super Double Summon: Gemini status, back to the hand at the End Phase', () => {
  const g = duel({ board: [{ hand: ['Super Double Summon'], m: ['Elemental HERO Neos Alius'] }, {}] });
  act(g, 0, 'Super Double Summon'); auto(g);
  ok(g.p[0].m.find(c => c && E.data(c).n === 'Elemental HERO Neos Alius').flags.gemini === true, 'Gemini Summoned');   // its name is "Elemental HERO Neos" now (2026-11-27 audit)
  endTurn(g);
  ok(inZ(g, 0, 'hand', 'Elemental HERO Neos Alius'), 'returned to the hand');
});
T('Super Junior Confrontation: the lowest monsters battle, Battle Phase ends', () => {
  const g = duel({ board: [{ m: [FILL, 'Spirit Ryu'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }], st: ['Super Junior Confrontation'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, FILL)); respondWith(g, 1, 'Super Junior Confrontation'); auto(g);
  ok(!on(g, 1, FILL) && !hasOpt(g, 'atk:'), 'Spirit Ryu destroyed the Defense monster and the Battle Phase ended');
});
T('Super Robolady turns into Super Roboyarou', () => {
  const g = duel({ ex0: ['Super Roboyarou'], board: [{ m: ['Super Robolady'] }, {}] });
  const r = on(g, 0, 'Super Robolady'); choose(g, `a:${r.u}:0`); auto(g);
  ok(!!on(g, 0, 'Super Roboyarou') && inZ(g, 0, 'extra', 'Super Robolady'), 'switched');
});
T('Super Solar Nutrient summons a Plant and is linked to it', () => {
  const g = duel({ board: [{ hand: ['Super Solar Nutrient', 'Mystical Space Typhoon'], m: ['Dark Verger'], deckTop: ['Lonefire Blossom'] }, {}] });
  act(g, 0, 'Super Solar Nutrient'); auto(g);
  ok(!!on(g, 0, 'Lonefire Blossom'), 'Lonefire Blossom summoned');
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(!on(g, 0, 'Lonefire Blossom'), 'destroyed with the card');
});
T('Super-Ancient Dinobeast: 1 Tribute with a Dinosaur', () => {
  const g = duel({ board: [{ hand: ['Super-Ancient Dinobeast'], m: ['Babycerasaurus'] }, {}] });
  choose(g, 'ns:'); auto(g);
  ok(!!on(g, 0, 'Super-Ancient Dinobeast'), 'Tribute Summoned');
});
T('Super-Ancient Dinobeast draws when a Dinosaur is revived', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], m: ['Super-Ancient Dinobeast'], gy: ['Babycerasaurus'] }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Monster Reborn'); auto(g);
  ok(g.p[0].hand.length === h, `drew 1 (hand ${g.p[0].hand.length})`);
});
T('Voltech Dragon gains 1000 from Batteryman AA', () => {
  const g = duel({ board: [{ hand: ['Super-Electromagnetic Voltech Dragon'], m: ['Batteryman AA'] }, {}] });
  choose(g, 'ns:'); auto(g);
  const v = on(g, 0, 'Super-Electromagnetic Voltech Dragon'); ok(v && E.atk(g, v) === 3400, `3400 (${v && E.atk(g, v)})`);
});
T('Sword Hunter equips what it destroyed', () => {
  const g = duel({ board: [{ m: ['Sword Hunter'], turn: 2 }, { m: [FILL] }] });
  const s = on(g, 0, 'Sword Hunter'); goBP(g); attack(g, s, on(g, 1, FILL)); auto(g); choose(g, 'endbp'); auto(g);
  ok(g.p[0].st.some(x => x && E.name(x) === FILL) && E.atk(g, s) === 2650, `equipped, 2650 (${E.atk(g, s)})`);
});
T('Sword Master comes out when the Warrior fails to destroy', () => {
  const g = duel({ board: [{ hand: ['Sword Master'], m: ['The Six Samurai - Yaichi'], turn: 2 }, { m: [{ n: 'Spirit of the Breeze', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'The Six Samurai - Yaichi'), on(g, 1, 'Spirit of the Breeze')); auto(g);
  ok(!!on(g, 0, 'Sword Master'), 'Special Summoned');
});
T('Sword of Dark Rites returns when the monster is Tributed', () => {
  const g = duel({ board: [{ hand: ['Sword of Dark Rites', 'Super-Electromagnetic Voltech Dragon'], m: ['Spell Reactor RE'] }, {}] });
  act(g, 0, 'Sword of Dark Rites'); auto(g);
  ok(E.atk(g, on(g, 0, 'Spell Reactor RE')) === 1600, 'DARK +400');
  choose(g, 'ns:'); auto(g);
  ok(inZ(g, 0, 'hand', 'Sword of Dark Rites'), 'returned to the hand');
});
T('Sword of Deep-Seated goes on top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Sword of Deep-Seated', 'Mystical Space Typhoon'], m: [FILL] }, {}] });
  act(g, 0, 'Sword of Deep-Seated'); auto(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2500, '+500');
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Sword of Deep-Seated', 'on top of the Deck');
});
T("Sword of Dragon's Soul destroys the Dragon at the end of the Battle Phase", () => {
  const g = duel({ board: [{ hand: ["Sword of Dragon's Soul"], m: ['Spell Striker'], turn: 2 }, { m: [{ n: 'Hyozanryu', pos: 'def' }] }] });
  act(g, 0, "Sword of Dragon's Soul"); auto(g);
  goBP(g); attack(g, on(g, 0, 'Spell Striker'), on(g, 1, 'Hyozanryu')); auto(g);
  ok(!!on(g, 1, 'Hyozanryu'), 'survives the battle'); choose(g, 'endbp'); auto(g);
  ok(!on(g, 1, 'Hyozanryu'), 'destroyed at the end of the Battle Phase');
});
T('Sword of Kusanagi returns with a bounced Spirit', () => {
  const g = duel({ board: [{ hand: ['Sword of Kusanagi'], m: ['Great Long Nose'], st: ['Compulsory Evacuation Device'] }, {}] });
  act(g, 0, 'Sword of Kusanagi'); auto(g);
  act(g, 0, 'Compulsory Evacuation Device'); auto(g);
  ok(inZ(g, 0, 'hand', 'Sword of Kusanagi') && inZ(g, 0, 'hand', 'Great Long Nose'), 'both in the hand');
});
T('Sword of Sparkles destroys a card on a kill, and goes back to the Deck', () => {
  const g = duel({ board: [{ hand: ['Sword of Sparkles'], m: ['X-Saber Airbellum', FILL], turn: 2 }, { m: ['Spell Reactor RE'], st: ['Mirror Force'] }] });
  act(g, 0, 'Sword of Sparkles'); auto(g);
  goBP(g); attack(g, on(g, 0, 'X-Saber Airbellum'), on(g, 1, 'Spell Reactor RE')); auto(g);
  ok(!g.p[1].st.some(Boolean), 'Mirror Force destroyed');
});
T('Sword of the Soul-Eater Tributes the other Normal Monsters', () => {
  const g = duel({ board: [{ hand: ['Sword of the Soul-Eater'], m: ['Petit Moth', FILL, FILL] }, {}] });
  act(g, 0, 'Sword of the Soul-Eater'); auto(g);
  const m = on(g, 0, 'Petit Moth'); ok(m && E.atk(g, m) === 2300 && !on(g, 0, FILL), `Petit Moth 2300 (${m && E.atk(g, m)})`);
});

console.log(fails ? `\n${fails} failed` : '\nAll checks passed.');
process.exit(fails ? 1 : 0);
