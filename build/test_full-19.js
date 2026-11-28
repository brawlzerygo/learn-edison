// Scenario checks for full pool batch 19: node build/test_full-19.js
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
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const card = (g, p, z, n) => g.p[p][z].find(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const L = E.lib;
const endTurn = g => { choose(g, 'end'); auto(g, { no: true }); };
const atkOpt = (g, a, t) => choose(g, `atk:${on(g, 0, a).u}:${t ? on(g, 1, t).u : 'd'}`);

T('Archlord Zerato: summoned by Tributing Warrior of Zera, destroys their monsters', () => {
  const g = duel({ board: [{ hand: ['Archlord Zerato', 'The Sanctuary in the Sky', 'Shining Angel'], m: ['Warrior of Zera'], turn: 2 }, { m: [FILL, FILL] }] });
  const z = card(g, 0, 'hand', 'Archlord Zerato');
  ok(!hasOpt(g, 'ns:' + z.u) && !hasOpt(g, 'sp:' + z.u), 'no summon without the Sanctuary');
  act(g, 0, 'The Sanctuary in the Sky'); auto(g);
  choose(g, 'sp:' + z.u); auto(g);
  ok(on(g, 0, 'Archlord Zerato') && inZ(g, 0, 'gy', 'Warrior of Zera'), 'Zerato summoned');
  choose(g, 'Discard a LIGHT'); auto(g);
  ok(L.monsOf(g, 1).length === 0 && inZ(g, 0, 'gy', 'Shining Angel'), 'their monsters destroyed');
  const g2 = duel({ board: [{ gy: ['Archlord Zerato'], turn: 2 }, {}] });
  ok(L.forbid(g2, { type: 'ss', c: g2.p[0].gy[0], p: 0, how: 'special' }), 'can\'t be revived');
});
T('Array of Revealing Light: the declared Type can\'t attack the turn it is summoned', () => {
  const g = duel({ board: [{ hand: ['Array of Revealing Light', FILL], turn: 2 }, {}] });
  act(g, 0, 'Array of Revealing Light'); choose(g, 'Beast-Warrior'); auto(g);
  choose(g, 'ns:' + card(g, 0, 'hand', FILL).u); auto(g);
  choose(g, 'bp'); auto(g);
  ok(!hasOpt(g, 'atk:'), 'no attack option for the new Beast-Warrior');
});
T('Arsenal Robber: the opponent sends an Equip Spell from their Deck', () => {
  const g = duel({ board: [{ st: ['Arsenal Robber'], turn: 2 }, { deckTop: ['Megamorph'] }] });
  act(g, 0, 'Arsenal Robber'); auto(g);
  ok(inZ(g, 1, 'gy', 'Megamorph'), 'Megamorph sent to the GY');
});
T('Astral Barrier: the attack on a monster becomes a direct attack', () => {
  const g = duel({ board: [{ m: ['Dark Blade'], turn: 2 }, { m: [FILL], st: ['Astral Barrier'] }] });
  E.act(g, ['end']); auto(g, { no: true });
  // B's turn: activate Astral Barrier, then A attacks? no: A is turn player 0 at turn 2; use B as defender on A's turn
});
T('Astral Barrier (defender side)', () => {
  const g = duel({ board: [{ m: ['Dark Blade'], turn: 2 }, { m: [FILL], st: ['Astral Barrier'] }] });
  // activate it at the start of the Battle Phase window
  choose(g, 'bp');
  for (let i = 0; i < 5 && g.prompt.type === 'respond'; i++) { if (hasOpt(g, 'Astral Barrier')) choose(g, 'Astral Barrier'); else E.act(g, ['pass']); }
  auto(g);
  atkOpt(g, 'Dark Blade', FILL); auto(g);
  ok(g.p[1].lp === 8000 - 1800 && on(g, 1, FILL), `direct damage, the monster stays (B ${g.p[1].lp})`);
});
T('Asura Priest attacks each monster once', () => {
  const g = duel({ board: [{ m: ['Asura Priest'], turn: 2 }, { m: ['Mystical Elf', 'Mystical Elf'].map(n => ({ n: 'Kuriboh', pos: 'atk' })) }] });
  choose(g, 'bp'); auto(g);
  const ks = L.monsOf(g, 1);
  choose(g, `atk:${on(g, 0, 'Asura Priest').u}:${ks[0].u}`); auto(g);
  choose(g, `atk:${on(g, 0, 'Asura Priest').u}:${ks[1].u}`); auto(g);
  ok(L.monsOf(g, 1).length === 0, 'both destroyed');
  ok(!hasOpt(g, 'atk:'), 'no direct attack after attacking monsters');
});
T('Aussa the Earth Charmer takes an EARTH monster while face-up', () => {
  const g = duel({ board: [{ m: [{ n: 'Aussa the Earth Charmer', pos: 'set' }], hand: ['Book of Moon'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'flip:'); auto(g);
  ok(on(g, 0, FILL), 'took control');
  act(g, 0, 'Book of Moon'); if (g.prompt.type === 'pick') choose(g, 'Aussa'); auto(g); E.act(g, ['end']); auto(g, { no: true });
  ok(on(g, 1, FILL) && !on(g, 0, FILL), 'control went back when Aussa was turned face-down');
});
T('Autonomous Action Unit: summon from their GY, destroyed when it leaves', () => {
  const g = duel({ board: [{ hand: ['Autonomous Action Unit', 'Mystical Space Typhoon'], turn: 2 }, { gy: ['Dark Blade'] }] });
  act(g, 0, 'Autonomous Action Unit'); auto(g);
  ok(on(g, 0, 'Dark Blade') && g.p[0].lp === 6500, 'Dark Blade summoned for 1500 LP');
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(!on(g, 0, 'Dark Blade') && inZ(g, 1, 'gy', 'Dark Blade'), 'Dark Blade destroyed');
});
T('Avatar of The Pot draws 3', () => {
  const g = duel({ board: [{ m: ['Avatar of The Pot'], hand: ['Pot of Greed'], turn: 2 }, {}] });
  const n = g.p[0].hand.length; choose(g, 'draw 3'); auto(g);
  ok(g.p[0].hand.length === n - 1 + 3 && inZ(g, 0, 'gy', 'Pot of Greed'), 'drew 3');
});
T('Bad Reaction to Simochi turns their gain into damage', () => {
  const g = duel({ board: [{ st: ['Bad Reaction to Simochi'], turn: 2 }, {}] });
  act(g, 0, 'Bad Reaction to Simochi'); auto(g);
  L.gain(g, 1, 1000); L.emit(g, { type: 'test' });
  ok(g.p[1].lp === 7000, `B ${g.p[1].lp}`);
  L.gain(g, 0, 500); L.emit(g, { type: 'test' }); ok(g.p[0].lp === 8500, 'own gain kept');
});
T('Bait Doll destroys a Trap with the wrong timing and goes back to the Deck', () => {
  const g = duel({ board: [{ hand: ['Bait Doll'], turn: 2 }, { st: ['Mirror Force'] }] });
  const nd = g.p[0].deck.length; act(g, 0, 'Bait Doll'); auto(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && g.p[0].deck.length === nd + 1 && !inZ(g, 0, 'gy', 'Bait Doll'), 'Mirror Force destroyed, Bait Doll in the Deck');
});
T('Ballista of Rampart Smashing: +1500 against a face-down monster', () => {
  const g = duel({ board: [{ hand: ['Ballista of Rampart Smashing'], m: ['Kuriboh'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'set' }] }] });
  act(g, 0, 'Ballista of Rampart Smashing'); auto(g); choose(g, 'bp'); auto(g);
  choose(g, `atk:${on(g, 0, 'Kuriboh').u}:${L.monsOf(g, 1)[0].u}`); auto(g);
  ok(g.p[0].lp === 8000 - (2600 - 1800), `A ${g.p[0].lp} (300+1500 vs 2600 DEF)`);
});
T('Balloon Lizard: counters, then damage to the destroyer', () => {
  const g = duel({ board: [{ m: ['Balloon Lizard'], turn: 1 }, { hand: ['Fissure'] }] });
  endTurn(g); endTurn(g); // B's turn, then A's Standby: 1 counter
  const bl = on(g, 0, 'Balloon Lizard'); ok(bl && bl.flags.f19bl === 2, 'two counters (turns 1 and 3)');
  endTurn(g); act(g, 1, 'Fissure'); auto(g);
  ok(g.p[1].lp === 7200, `B took 800 (${g.p[1].lp})`);
});
T('Banisher of the Light banishes cards sent to the GY', () => {
  const g = duel({ board: [{ m: ['Banisher of the Light'], hand: ['Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Pot of Greed'); auto(g); ok(inZ(g, 0, 'ban', 'Pot of Greed'), 'Pot of Greed banished');
});
T('Banner of Courage: +200 in your Battle Phase', () => {
  const g = duel({ board: [{ m: ['Kuriboh'], st: [{ n: 'Banner of Courage' }], turn: 2 }, {}] });
  act(g, 0, 'Banner of Courage'); auto(g); const k = on(g, 0, 'Kuriboh');
  ok(E.atk(g, k) === 300, 'no boost in Main Phase'); choose(g, 'bp'); auto(g); ok(E.atk(g, k) === 500, 'boost in the Battle Phase');
});
T('Barrel Behind the Door sends Cemetary Bomb back', () => {
  const g = duel({ board: [{ st: ['Cemetary Bomb'], gy: [FILL, FILL], turn: 2 }, { st: ['Barrel Behind the Door'], gy: [FILL, FILL, FILL] }] });
  act(g, 0, 'Cemetary Bomb'); choose(g, 'Barrel'); auto(g);
  // Barrel Behind the Door stays on the field until the chain ends (2026-11-27 audit), so B's GY holds 3 cards: 300 back to A
  ok(g.p[1].lp === 8000 && g.p[0].lp === 7700, `A ${g.p[0].lp}, B ${g.p[1].lp}`);
});
T('Beckoning Light: discard the hand, add LIGHTs', () => {
  const g = duel({ board: [{ hand: [FILL, FILL], st: ['Beckoning Light'], gy: ['Shining Angel', 'Shining Angel', 'Mystical Elf', 'Mystical Elf'], turn: 2 }, {}] });
  act(g, 0, 'Beckoning Light'); auto(g);
  ok(g.p[0].hand.length === 3 && g.p[0].hand.every(x => E.lib.attr(x) === 'LIGHT'), 'two LIGHT monsters added');
});
T('Backup Soldier: up to 3 non-Effect monsters', () => {
  const g = duel({ board: [{ st: ['Backup Soldier'], gy: ['Kuriboh', 'Kuriboh', 'Kuriboh', 'Mystical Elf', 'Harpie Lady', 'Dark Blade'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Backup Soldier');
  if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.map(o => o.key)); auto(g);
  ok(g.p[0].hand.length === h + 2 && inZ(g, 0, 'hand', 'Mystical Elf') && inZ(g, 0, 'hand', 'Harpie Lady'), 'Mystical Elf and Harpie Lady added');
});
T('Behemoth: 1 Tribute makes it 2000 ATK, returns a Beast', () => {
  const g = duel({ board: [{ hand: ['Behemoth the King of All Animals'], m: ['Kuriboh'], gy: ['Gene-Warped Warwolf', 'Big Koala'], turn: 2 }, {}] });
  choose(g, 'ns:' + card(g, 0, 'hand', 'Behemoth the King of All Animals').u);
  if (g.prompt.type === 'choose') choose(g, '1 Tribute'); auto(g);
  const b = on(g, 0, 'Behemoth the King of All Animals'); ok(b && E.atk(g, b) === 2000, `ATK ${b && E.atk(g, b)}`);
  ok(inZ(g, 0, 'hand', 'Big Koala'), 'Big Koala returned');
});
T('Berserk Dragon: only by A Deal with Dark Ruler', () => {
  const g = duel({ board: [{ gy: ['Berserk Dragon'], turn: 2 }, {}] });
  ok(L.forbid(g, { type: 'ss', c: g.p[0].gy[0], p: 0, how: 'special' }), 'no other Special Summon');
});
T('Bickuribox and Centrifugal Field', () => {
  const g = duel({ ex0: ['Bickuribox'], board: [{ hand: ['Polymerization', 'Crass Clown', 'Dream Clown', 'Centrifugal Field', 'Fissure'], turn: 2 }, {}] });
  act(g, 0, 'Centrifugal Field'); auto(g);
  act(g, 0, 'Polymerization'); auto(g);
  ok(on(g, 0, 'Bickuribox'), 'Bickuribox Fusion Summoned');
  L.destroy(g, [on(g, 0, 'Bickuribox')], { by: 1 }); auto(g);
  // the trigger runs at the next trigger window
  E.lib; choose(g, 'end'); auto(g);
  ok(L.monsOf(g, 0).some(x => ['Crass Clown', 'Dream Clown'].includes(E.name(x))), 'a clown came back');
});
T('Blade Rabbit destroys when changed to Defense', () => {
  const g = duel({ board: [{ m: ['Blade Rabbit'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'pos:'); auto(g); ok(!L.monsOf(g, 1).length, 'their monster destroyed');
});
T('Bladefly: WIND +500, EARTH -400', () => {
  const g = duel({ board: [{ m: ['Bladefly', 'Harpie Lady'], turn: 2 }, { m: ['Big Koala'] }] });
  ok(E.atk(g, on(g, 0, 'Bladefly')) === 1100 && E.atk(g, on(g, 0, 'Harpie Lady')) === 1800 && E.atk(g, on(g, 1, 'Big Koala')) === 2300, 'stats');
});
T('Bombardment Beetle destroys a face-down Effect Monster', () => {
  const g = duel({ board: [{ m: [{ n: 'Bombardment Beetle', pos: 'set' }], turn: 2 }, { m: [{ n: 'Sangan', pos: 'set' }, { n: 'Mystical Elf', pos: 'set' }] }] });
  choose(g, 'flip:'); if (g.prompt.type === 'pick') choose(g, 'Face-down'); auto(g);
  ok(L.monsOf(g, 1).length === 1, 'one of them handled');
});
T('Buster Rancher: +2500 against a 2500 ATK monster', () => {
  const g = duel({ board: [{ hand: ['Buster Rancher'], m: ['Kuriboh'], turn: 2 }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Buster Rancher'); auto(g); choose(g, 'bp'); auto(g);
  atkOpt(g, 'Kuriboh', 'Dark Magician'); auto(g);
  ok(!on(g, 1, 'Dark Magician') && g.p[1].lp === 8000 - 300, `Dark Magician destroyed (B ${g.p[1].lp})`);
});
T('Cat\'s Ear Tribe: the attacker\'s ATK becomes 200', () => {
  const g = duel({ board: [{ m: ['Dark Blade'], turn: 2 }, { m: ['Cat\'s Ear Tribe'] }] });
  choose(g, 'bp'); auto(g); atkOpt(g, 'Dark Blade', 'Cat\'s Ear Tribe'); auto(g);
  ok(!on(g, 1, 'Cat\'s Ear Tribe') && !on(g, 0, 'Dark Blade') && g.p[1].lp === 8000, 'both destroyed (200 vs 200)');
});
T('Catnipped Kitty makes DEF 0', () => {
  const g = duel({ board: [{ m: ['Catnipped Kitty'], turn: 2 }, { m: ['Big Shield Gardna'] }] });
  choose(g, 'DEF 0'); auto(g); ok(E.def(g, on(g, 1, 'Big Shield Gardna')) === 0, 'DEF 0');
});
T('Ceasefire: flips and burns', () => {
  const g = duel({ board: [{ st: ['Ceasefire'], m: ['Sangan'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'set' }, { n: 'Sangan', pos: 'set' }] }] });
  act(g, 0, 'Ceasefire'); auto(g);
  ok(g.p[1].lp === 7000 && L.monsOf(g, 1).every(x => x.pos === 'def'), `B ${g.p[1].lp}`);
});
T('Cave Dragon needs another Dragon to attack', () => {
  const g = duel({ board: [{ m: ['Cave Dragon'], turn: 2 }, {}] });
  choose(g, 'bp'); auto(g); ok(!hasOpt(g, 'atk:'), 'no attack alone');
});
T('Blindly Loyal Goblin can\'t be targeted by Brain Control', () => {
  const g = duel({ board: [{ hand: ['Brain Control'], turn: 2 }, { m: ['Blindly Loyal Goblin', FILL] }] });
  act(g, 0, 'Brain Control'); ok(g.prompt.type !== 'pick' || !g.prompt.opts.some(o => /Goblin/.test(o.label)), 'Goblin not offered'); auto(g);
});
T('Bottomless Shifting Sand destroys the highest ATK at their End Phase', () => {
  const g = duel({ board: [{ st: ['Bottomless Shifting Sand'], hand: [FILL, FILL, FILL, FILL, FILL], turn: 1 }, { m: ['Dark Magician', 'Kuriboh'] }] });
  act(g, 0, 'Bottomless Shifting Sand'); auto(g); endTurn(g); endTurn(g);
  ok(!on(g, 1, 'Dark Magician') && on(g, 1, 'Kuriboh'), 'Dark Magician destroyed');
});
T('Cestus of Dagla: gain the battle damage', () => {
  const g = duel({ board: [{ hand: ['Cestus of Dagla'], m: ['Shining Angel'], turn: 2 }, {}] });
  act(g, 0, 'Cestus of Dagla'); auto(g); choose(g, 'bp'); auto(g); atkOpt(g, 'Shining Angel'); auto(g);
  ok(g.p[0].lp === 8000 + 1900 && g.p[1].lp === 8000 - 1900, `A ${g.p[0].lp}`);
});
T('Atomic Firefly burns the player who destroyed it', () => {
  const g = duel({ board: [{ m: ['Dark Blade'], turn: 2 }, { m: ['Atomic Firefly'] }] });
  choose(g, 'bp'); auto(g); atkOpt(g, 'Dark Blade', 'Atomic Firefly'); auto(g);
  ok(g.p[0].lp === 7000, `A ${g.p[0].lp}`);
});
T('Aswan Apparition returns a Trap after battle damage', () => {
  const g = duel({ board: [{ m: ['Aswan Apparition'], gy: ['Mirror Force'], turn: 2 }, {}] });
  choose(g, 'bp'); auto(g); atkOpt(g, 'Aswan Apparition'); auto(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Mirror Force', 'Mirror Force on top of the Deck');
});
T('Byser Shock returns Set cards', () => {
  const g = duel({ board: [{ hand: ['Byser Shock'], m: [FILL], turn: 2 }, { st: ['Mirror Force'], m: [{ n: FILL, pos: 'set' }] }] });
  choose(g, 'ns:' + card(g, 0, 'hand', 'Byser Shock').u); if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); auto(g);
  ok(inZ(g, 1, 'hand', 'Mirror Force') && !L.monsOf(g, 1).length, 'Set cards back in the hand');
});
T('Bark of Dark Ruler shrinks the opponent\'s battling monster', () => {
  const g = duel({ board: [{ m: ['Dark Blade'], turn: 2 }, { m: ['Sangan'], st: ['Bark of Dark Ruler'] }] });
  choose(g, 'bp'); auto(g); atkOpt(g, 'Dark Blade', 'Sangan');
  for (let i = 0; i < 12 && g.prompt && g.prompt.type === 'respond'; i++) { if (g.prompt.p === 1 && hasOpt(g, 'Bark of Dark Ruler')) { choose(g, 'Bark of Dark Ruler'); choose(g, '900 LP'); } else E.act(g, ['pass']); }
  auto(g);
  ok(!on(g, 0, 'Dark Blade') && on(g, 1, 'Sangan') && g.p[1].lp === 7100, `Dark Blade lost (B ${g.p[1].lp})`);
});
console.log(fails ? `${fails} failed` : 'all passed'); process.exit(fails ? 1 : 0);
