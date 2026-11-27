// Scenario checks for full pool batch 21: node build/test_full-21.js
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
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
// answer prompts with defaults until the turn number changes (yes to every optional effect)
function endTurn(g) { const t = g.turnNo; for (let i = 0; i < 80 && g.prompt && g.turnNo === t; i++) {
  const pr = g.prompt;
  if (pr.type === 'idle') E.act(g, [pr.opts.some(o => o.key === 'end') ? 'end' : 'endbp']);
  else if (pr.type === 'respond') E.act(g, ['pass']);
  else if (pr.type === 'yesno') E.act(g, ['y']);
  else E.act(g, pr.opts.slice(0, pr.min).map(o => o.key));
} }
const attack = (g, target) => { choose(g, 'bp'); passAll(g); choose(g, target); for (let i = 0; i < 12 && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };

T('Drill Bug puts Parasite Paracide on top', () => {
  const g = duel({ board: [{ hand: [], m: ['Drill Bug'], deckTop: [FILL, FILL, 'Parasite Paracide'], turn: 2 }, {}] });
  attack(g, 'Attack directly'); choose(g, 'yes'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Parasite');
  passAll(g);
  const d = g.p[0].deck; ok(E.name(d[d.length - 1]) === 'Parasite Paracide', 'Parasite Paracide is the top card');
});
T('Drillago attacks directly past 1600+ monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Drillago'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'bp'); passAll(g); ok(hasOpt(g, 'Attack directly'), 'direct attack offered');
  const g2 = duel({ board: [{ hand: [], m: ['Drillago'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  choose(g2, 'bp'); passAll(g2); ok(!hasOpt(g2, 'Attack directly'), 'not with a Set card');
});
T('Dummy Golem switches control', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Dummy Golem', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'Flip Summon'); passAll(g); for (let i = 0; i < 5 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') choose(g, FILL); else passAll(g); }
  ok(on(g, 1, 'Dummy Golem') && on(g, 0, FILL), 'B controls Dummy Golem, A controls the Warwolf');
});
T('Eagle Eye: no Traps on its Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Eagle Eye'], turn: 2 }, { st: ['Torrential Tribute'] }] });
  choose(g, 'Normal Summon'); let offered = false;
  for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) { if (hasOpt(g, 'Torrential')) offered = true; E.act(g, ['pass']); }
  ok(!offered && on(g, 0, 'Eagle Eye'), 'Torrential Tribute was never offered');
});
T('Electric Lizard stops the attacker next turn', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Electric Lizard', pos: 'atk' }] }] });
  attack(g, 'Attack Electric Lizard'); passAll(g);
  const w = on(g, 0, FILL); ok(w && w.flags.f21liz === 4, 'Warwolf marked for turn 4');
  endTurn(g); endTurn(g); choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'Attack'), 'Warwolf cannot attack on turn 4');
});
T('Elephant Statue of Disaster and Fear from the Dark answer Spirit Reaper', () => {
  const g = duel({ board: [{ hand: [], m: ['Spirit Reaper'], turn: 2 }, { hand: ['Elephant Statue of Disaster'] }] });
  attack(g, 'Attack directly'); passAll(g);
  ok(g.p[0].lp === 6000, `A took 2000 (A ${g.p[0].lp})`);
  const g2 = duel({ board: [{ hand: [], m: ['Spirit Reaper'], turn: 2 }, { hand: ['Fear from the Dark'] }] });
  attack(g2, 'Attack directly'); passAll(g2);
  ok(on(g2, 1, 'Fear from the Dark'), 'Fear from the Dark was Special Summoned');
});
T('Emes the Infinity gains 700 after a kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Emes the Infinity'], turn: 2 }, { m: [FILL] }] });
  attack(g, 'Attack Gene'); passAll(g);
  ok(E.atk(g, on(g, 0, 'Emes the Infinity')) === 3200, 'Emes has 3200 ATK');
});
T('Exodia Necross: Standby ATK, destroyed without the pieces, SS lock', () => {
  const pieces = ['Exodia the Forbidden One', 'Right Arm of the Forbidden One', 'Left Arm of the Forbidden One', 'Right Leg of the Forbidden One', 'Left Leg of the Forbidden One'];
  const g = duel({ board: [{ hand: [], m: ['Exodia Necross'], gy: pieces, turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Exodia Necross')) === 2300, 'gained 500 in the Standby Phase');
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Exodia Necross'], gy: pieces.slice(1), turn: 2 }, { st: ['Mirror Force'] }] });
  passAll(g2); ok(!on(g2, 0, 'Exodia Necross'), 'destroyed without Exodia in the GY');
  const n = g2.p[0].gy.find(c => E.name(c) === 'Exodia Necross');
  ok(n && E.lib.forbid(g2, { type: 'ss', c: n, p: 0, how: 'special' }), 'cannot be Special Summoned from the GY');
});
T('Exodia the Forbidden One wins in hand', () => {
  const g = duel({ board: [{ hand: ['Right Arm of the Forbidden One', 'Left Arm of the Forbidden One', 'Right Leg of the Forbidden One', 'Left Leg of the Forbidden One'], deckTop: ['Exodia the Forbidden One'], turn: 2 }, {}] });
  ok(g.winner === 0, 'A won on the draw');
});
T('Fiber Jar resets the game', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: [{ n: 'Fiber Jar', pos: 'set' }, FILL], gy: [FILL], turn: 2 }, { m: [FILL], hand: [FILL, FILL] }] });
  choose(g, 'Flip Summon'); passAll(g); passAll(g);
  ok(g.p[0].hand.length === 5 && g.p[1].hand.length === 5 && !E.fieldOf(g, 0).length && !E.fieldOf(g, 1).length && !g.p[0].gy.length, 'both hands 5, fields and GYs empty');
});
T('Falling Down takes control and needs an Archfiend', () => {
  const g = duel({ board: [{ hand: ['Falling Down'], m: ['Archfiend Soldier'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Falling Down'); passAll(g); passAll(g);
  ok(on(g, 0, FILL) && inZ(g, 0, 'st', 'Falling Down'), 'A controls the Warwolf');
  const g2 = duel({ board: [{ hand: ['Falling Down'], turn: 2 }, { m: [FILL] }] });
  act(g2, 0, 'Falling Down'); passAll(g2); passAll(g2);
  ok(on(g2, 1, FILL) && inZ(g2, 0, 'gy', 'Falling Down'), 'no Archfiend: destroyed, no control change');
});
T('Fissure destroys the lowest ATK; Dust Barrier saves Normals', () => {
  const g = duel({ board: [{ hand: ['Fissure'], turn: 2 }, { m: [FILL, 'Exiled Force'] }] });
  act(g, 0, 'Fissure'); passAll(g);
  ok(on(g, 1, FILL) && !on(g, 1, 'Exiled Force'), 'Exiled Force destroyed');
  const g2 = duel({ board: [{ hand: ['Fissure'], turn: 2 }, { m: ['Petit Moth'], st: [{ n: 'Dust Barrier', pos: 'up' }] }] });
  act(g2, 0, 'Fissure'); passAll(g2);
  ok(on(g2, 1, 'Petit Moth'), 'Petit Moth survived');
});
T('Fatal Abacus burns the owner', () => {
  const g = duel({ board: [{ hand: ['Fissure'], st: [{ n: 'Fatal Abacus', pos: 'up' }], turn: 2 }, { m: ['Exiled Force'] }] });
  act(g, 0, 'Fissure'); passAll(g); passAll(g);
  ok(g.p[1].lp === 7500, `B took 500 (B ${g.p[1].lp})`);
});
T('Fox Fire comes back in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Fox Fire', pos: 'atk' }] }] });
  attack(g, 'Attack Fox Fire'); passAll(g); ok(!on(g, 1, 'Fox Fire'), 'destroyed by battle');
  endTurn(g);
  ok(on(g, 1, 'Fox Fire'), 'Special Summoned in the End Phase');
});
T('Freed: search instead of the draw, negate a targeting Spell', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: ['Freed the Matchless General'], deckTop: ['Exiled Force'], turn: 2 }, {}] });
  passAll(g); choose(g, 'Add a Level 4'); if (g.prompt.type === 'pick') choose(g, 'Exiled Force');
  ok(inZ(g, 0, 'hand', 'Exiled Force') && g.p[0].hand.length === 2, 'Exiled Force added, no draw');
  act(g, 0, 'Book of Moon'); if (g.prompt.type === 'pick') choose(g, 'Freed'); let offered = false;
  for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'respond'; i++) { if (hasOpt(g, 'Negate the Spell')) { offered = true; choose(g, 'Negate the Spell'); } else E.act(g, ['pass']); }
  ok(offered, 'negation offered');
  const f = on(g, 0, 'Freed the Matchless General'); ok(f && f.pos === 'atk' && inZ(g, 0, 'gy', 'Book of Moon'), 'Freed stays face-up, Book of Moon destroyed');
});
T("Fairy's Hand Mirror redirects Book of Moon", () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: ['Exiled Force'], turn: 2 }, { m: [FILL], st: ["Fairy's Hand Mirror"] }] });
  act(g, 0, 'Book of Moon'); choose(g, FILL); choose(g, "Fairy's Hand Mirror", 1); passAll(g);
  ok(on(g, 0, 'Exiled Force').pos === 'set' && on(g, 1, FILL).pos === 'atk', 'Exiled Force went face-down instead');
});
T("Fiend's Hand Mirror redirects MST", () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Mirror Force'], turn: 2 }, { st: ['Torrential Tribute', "Fiend's Hand Mirror"] }] });
  act(g, 0, 'Mystical Space Typhoon'); choose(g, 'Face-down', 0); choose(g, "Fiend's Hand Mirror", 1); passAll(g);
  ok(inZ(g, 0, 'gy', 'Mirror Force') && inZ(g, 1, 'st', 'Torrential Tribute'), 'MST destroyed Mirror Force instead');
});
T('Driving Snow answers MST', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Mirror Force'], turn: 2 }, { st: ['Torrential Tribute', 'Driving Snow'] }] });
  const tor = g.p[1].st.find(c => c && E.name(c) === 'Torrential Tribute');
  act(g, 0, 'Mystical Space Typhoon'); choose(g, 'u' + tor.u); passAll(g);
  choose(g, 'yes', 1); passAll(g);
  ok(inZ(g, 1, 'gy', 'Torrential Tribute') && inZ(g, 0, 'gy', 'Mirror Force'), 'Driving Snow destroyed Mirror Force');
});
T('Drop Off discards the drawn card', () => {
  const g = duel({ board: [{ hand: [], deckTop: ['Exiled Force'], turn: 2 }, { st: ['Drop Off'] }] });
  choose(g, 'yes', 1); passAll(g);
  ok(inZ(g, 0, 'gy', 'Exiled Force') && !g.p[0].hand.length, 'Exiled Force discarded');
});
T('Ekibyo Drakmord: no attacks, destroyed at the end of the 2nd turn, back to hand', () => {
  const g = duel({ board: [{ hand: ['Ekibyo Drakmord'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Ekibyo Drakmord'); passAll(g); passAll(g);
  const w = on(g, 1, FILL); ok(w && E.lib.has(g, w, 'cantAttack'), 'the Warwolf cannot attack');
  endTurn(g); endTurn(g); endTurn(g); ok(on(g, 1, FILL), 'still there after its 1st turn');
  endTurn(g); ok(!on(g, 1, FILL) && inZ(g, 0, 'hand', 'Ekibyo Drakmord'), 'destroyed at the end of its 2nd turn, Ekibyo back in hand');
});
T('Enchanting Fitting Room summons excavated Normals', () => {
  const g = duel({ board: [{ hand: ['Enchanting Fitting Room'], deckTop: [FILL, 'Petit Moth', 'Petit Moth', FILL, 'Exiled Force'], turn: 2 }, {}] });
  act(g, 0, 'Enchanting Fitting Room'); passAll(g);
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Petit Moth').length === 2 && g.p[0].lp === 7200, 'two Petit Moth summoned, 800 paid');
});
T('Earthquake and Earthshaker', () => {
  const g = duel({ board: [{ hand: ['Earthquake'], m: [FILL], turn: 2 }, { m: ['Exiled Force'] }] });
  act(g, 0, 'Earthquake'); passAll(g);
  ok(on(g, 0, FILL).pos === 'def' && on(g, 1, 'Exiled Force').pos === 'def', 'both in Defense Position');
  const g2 = duel({ board: [{ hand: [], m: ['Archfiend Soldier'], st: ['Earthshaker'], turn: 2 }, { m: [FILL] }] });
  act(g2, 0, 'Earthshaker'); choose(g2, 'EARTH'); choose(g2, 'DARK'); passAll(g2); choose(g2, 'EARTH', 1);
  ok(!on(g2, 1, FILL) && on(g2, 0, 'Archfiend Soldier'), 'B picked EARTH: the Warwolf was destroyed');
});
T('Eatgaboon destroys a weak Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Petit Moth'], turn: 2 }, { st: ['Eatgaboon'] }] });
  choose(g, 'Normal Summon'); for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'respond'; i++) { if (g.prompt.p === 1 && hasOpt(g, 'Eatgaboon')) choose(g, 'Eatgaboon'); else E.act(g, ['pass']); }
  ok(!on(g, 0, 'Petit Moth') && inZ(g, 0, 'gy', 'Petit Moth'), 'Petit Moth destroyed');
});
T('Frozen Soul skips the Battle Phase', () => {
  const g = duel({ board: [{ hand: ['Petit Moth'], turn: 2 }, { st: ['Frozen Soul'], lp: 5000 }] });
  choose(g, 'Normal Summon'); for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'respond'; i++) { if (g.prompt.p === 1 && hasOpt(g, 'Frozen Soul')) choose(g, 'Frozen Soul'); else E.act(g, ['pass']); }
  ok(g.prompt && g.prompt.type === 'idle' && !hasOpt(g, 'bp'), 'no Battle Phase for A');
});
T('Formation Union equips Freezing Beast to Burning Beast', () => {
  const g = duel({ board: [{ hand: [], m: ['Burning Beast', 'Freezing Beast'], st: ['Formation Union'], turn: 2 }, {}] });
  act(g, 0, 'Formation Union'); if (g.prompt.type === 'choose') choose(g, 'Equip'); passAll(g);
  if (g.prompt.type === 'pick') choose(g, 'Freezing'); if (g.prompt.type === 'pick') choose(g, 'Burning'); passAll(g);
  const f = g.p[0].st.find(c => c && E.name(c) === 'Freezing Beast'); ok(f && f.equipTo === on(g, 0, 'Burning Beast').u, 'Freezing Beast is equipped');
});
T('Eria takes a WATER monster while face-up', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: [{ n: 'Eria the Water Charmer', pos: 'set' }], turn: 2 }, { m: ['Mermaid Knight'] }] });
  choose(g, 'Flip Summon'); passAll(g); for (let i = 0; i < 4 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') choose(g, 'Mermaid'); else passAll(g); }
  ok(on(g, 0, 'Mermaid Knight'), 'A controls Mermaid Knight');
  act(g, 0, 'Book of Moon'); choose(g, 'Eria'); passAll(g); passAll(g);
  ok(on(g, 1, 'Mermaid Knight'), 'control returned after Eria went face-down');
});
T('Fuh-Rin-Ka-Zan draws 2', () => {
  const g = duel({ board: [{ hand: [], m: ['Mermaid Knight', FILL, 'Harpie Lady'], st: ['Fuh-Rin-Ka-Zan'], turn: 2 }, { m: ['Burning Beast'] }] });
  const h = g.p[0].hand.length; act(g, 0, 'Fuh-Rin-Ka-Zan'); choose(g, 'Draw 2'); passAll(g);
  ok(g.p[0].hand.length === h + 2, 'drew 2');
});
T('Firebird gains ATK when a Winged Beast is destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Firebird', 'Harpie Lady', 'Exiled Force'], turn: 2 }, {}] });
  choose(g, 'Tribute: destroy'); choose(g, 'Harpie Lady'); passAll(g); passAll(g);
  ok(E.atk(g, on(g, 0, 'Firebird')) === 1500, 'Firebird has 1500 ATK');
});
T('Fenrir: own summon rule, then Monster Reborn-style lock', () => {
  const g = duel({ board: [{ hand: ['Fenrir'], gy: ['Mermaid Knight', 'Mobius the Frost Monarch'], turn: 2 }, { m: [{ n: 'Petit Moth', pos: 'atk' }] }] });
  choose(g, 'Special Summon (banish'); passAll(g); passAll(g);
  ok(on(g, 0, 'Fenrir') && g.p[0].ban.length === 2, 'Fenrir summoned, 2 WATERs banished');
  attack(g, 'Attack Petit Moth'); passAll(g);
  ok(g.rules.some(r => /draw/.test(String(r.forbid))), 'B skips the next Draw Phase');
  const g2 = duel({ board: [{ hand: [], gy: ['Fenrir'], turn: 2 }, {}] });
  passAll(g2); const fe = g2.p[0].gy[0]; g2.events.length; E.act(g2, ['end']);
  ok(E.lib.forbid(g2, { type: 'ss', c: fe, p: 0, how: 'special' }), 'cannot be revived without its own summon first');
});
T('Enervating Mist: hand limit 5', () => {
  const g = duel({ board: [{ hand: [FILL, FILL, FILL, FILL, FILL, FILL], turn: 2 }, { st: [{ n: 'Enervating Mist', pos: 'up' }] }] });
  choose(g, 'end'); for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key));
  ok(g.p[0].hand.length === 5, `A has 5 cards (${g.p[0].hand.length})`);
});
T('Ectoplasmer: turn player Tributes, opponent takes half', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: [{ n: 'Ectoplasmer', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'end'); passAll(g);
  ok(!on(g, 0, FILL) && g.p[1].lp === 7000, `Warwolf Tributed, B took 1000 (B ${g.p[1].lp})`);
});
T('Frontline Base summons a Union monster', () => {
  const g = duel({ board: [{ hand: ['Freezing Beast'], st: [{ n: 'Frontline Base', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'Special Summon a Union'); passAll(g);
  ok(on(g, 0, 'Freezing Beast'), 'Freezing Beast summoned');
});
T('Enraged Muka Muka and Flash Assailant count the hand', () => {
  const g = duel({ board: [{ hand: [FILL, FILL], m: ['Enraged Muka Muka', 'Flash Assailant'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Enraged Muka Muka')) === 1200 + 400 * 3 && E.atk(g, on(g, 0, 'Flash Assailant')) === 2000 - 400 * 3, 'stats follow 3 cards in hand');
});

console.log(fails ? `\n${fails} failed` : '\nAll passed');
process.exit(fails ? 1 : 0);
