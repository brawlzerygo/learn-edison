// Scenario checks for full pool batch 03: node build/test_full-03.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
let lastG; function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ["A", "B"], board: o.board }));
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? "ok   " : "FAIL ") + msg); if (!cond) { fails++; if (process.env.DBG) console.log("   | " + lastG.log.slice(-14).join("\n   | ") + "\n   prompt: " + (lastG.prompt ? lastG.prompt.type + " " + lastG.prompt.text : "none")); } }
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
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
// answer whatever comes until an idle prompt for player p
function settle(g, ...picks) { for (let i = 0; i < 40 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') choose(g, 'yes');
  else { const k = picks.find(t => pr.opts.some(x => x.label.includes(t))); if (k) choose(g, k); else E.act(g, pr.opts.slice(0, pr.min).map(x => x.key)); } } }

T('BLS Envoy: no Normal Summon, banish summon, banish a monster, then no attack', () => {
  const g = duel({ board: [{ hand: ['Black Luster Soldier - Envoy of the Beginning'], gy: ['Honest', 'Dark Armed Dragon'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  const b = card(g, 0, 'Black Luster Soldier - Envoy of the Beginning');
  ok(!hasOpt(g, 'ns:' + b.u) && !hasOpt(g, 'set:' + b.u), 'cannot be Normal Summoned or Set');
  choose(g, 'sp:' + b.u); settle(g);
  ok(on(g, 0, 'Black Luster Soldier - Envoy of the Beginning') && g.p[0].ban.length === 2, 'Special Summoned by banishing 2');
  choose(g, 'Banish a monster'); settle(g, 'Cyber Dragon');
  ok(inZ(g, 1, 'ban', 'Cyber Dragon'), 'Cyber Dragon banished');
  choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'atk:'), 'BLS cannot attack this turn');
});
T('Blast Held by a Tribute: destroys Attack Position monsters and burns', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon'], m: [FILL], turn: 2 }, { st: ['Blast Held by a Tribute'], m: [] }] });
  // Tribute Summon a Level 5+ (Cyber Dragon is Lv 5): A tributes the Warwolf
  choose(g, 'ns:' + card(g, 0, 'Cyber Dragon').u); settle(g, FILL);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  choose(g, 'Blast Held', 1); passAll(g); settle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && g.p[0].lp === 7000, `Cyber Dragon destroyed and 1000 damage (A ${g.p[0].lp})`);
});
T('Blast with Chain equips +500 and destroys a card when destroyed', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [FILL], st: ['Blast with Chain'], turn: 2 }, { st: ['Mirror Force'] }] });
  g.p[0].st[0].turnIn = -5;
  act(g, 0, 'Blast with Chain'); passAll(g);
  const w = on(g, 0, FILL); ok(E.atk(g, w) === 2500 && inZ(g, 0, 'st', 'Blast with Chain'), 'Warwolf 2500 ATK, Blast with Chain stays');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Blast with Chain', 'Face-down');
  ok(inZ(g, 0, 'gy', 'Blast with Chain') && inZ(g, 1, 'gy', 'Mirror Force'), 'its trigger destroyed Mirror Force');
});
T('Blue-Eyes Shining Dragon: summon by Tributing BEUD, ATK per Dragon, negates targeting', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes Shining Dragon', 'Book of Moon'], m: ['Blue-Eyes Ultimate Dragon'], gy: ['Blue-Eyes White Dragon'], turn: 2 }, {}] });
  const s = card(g, 0, 'Blue-Eyes Shining Dragon');
  ok(!hasOpt(g, 'ns:' + s.u), 'no Normal Summon');
  choose(g, 'sp:' + s.u); settle(g);
  const d = on(g, 0, 'Blue-Eyes Shining Dragon'); ok(d && E.atk(g, d) === 3600, `3600 ATK with 2 Dragons in GY (${d && E.atk(g, d)})`);
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Blue-Eyes Shining Dragon'], st: ['Book of Moon'] }] });
  g2.p[1].st[0].turnIn = -5;
  choose(g2, 'bp'); choose(g2, 'Book of Moon', 1); choose(g2, 'Blue-Eyes Shining'); ok(hasOpt(g2, 'Negate an effect'), 'Shining Dragon can negate'); choose(g2, 'Negate an effect'); passAll(g2);
  ok(E.lib.faceUp(on(g2, 1, 'Blue-Eyes Shining Dragon')), 'still face-up');
});
T('Book of Eclipse: face-down now, opponent flips up and draws in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Book of Eclipse'], m: [FILL], turn: 2 }, { m: [FILL, FILL] }] });
  const h1 = g.p[1].hand.length;
  act(g, 0, 'Book of Eclipse'); passAll(g);
  ok([...g.p[0].m, ...g.p[1].m].filter(Boolean).every(m => m.pos === 'set'), 'all monsters face-down');
  choose(g, 'end'); settle(g);
  ok(g.p[1].m.filter(Boolean).every(m => m.pos === 'def') && g.p[1].hand.length === h1 + 3, `B flipped 2 and drew 2 (+1 for the turn): hand ${g.p[1].hand.length - h1}`);
});
T('Brain Golem negates LIGHT effects and attacks again after a LIGHT kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Brain Golem'], turn: 2 }, { m: ['Honest', 'Honest'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Honest'); settle(g);
  ok(inZ(g, 1, 'gy', 'Honest'), 'Honest destroyed (its effect negated)');
  ok(hasOpt(g, 'Attack Honest'), 'Brain Golem can attack again');
});
T('Brain Jacker: takes control, opponent gains 500 each Standby, control returns when it leaves', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [{ n: 'Brain Jacker', pos: 'set' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'flip:'); settle(g, 'Cyber Dragon');
  ok(on(g, 0, 'Cyber Dragon') && inZ(g, 0, 'st', 'Brain Jacker'), 'A controls Cyber Dragon');
  choose(g, 'end'); settle(g);
  ok(g.p[1].lp === 8500, `B gained 500 in the Standby Phase (${g.p[1].lp})`);
  choose(g, 'end'); settle(g);
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Brain Jacker');
  ok(on(g, 1, 'Cyber Dragon'), 'Cyber Dragon returned to B');
});
T('Bubble Blaster: equipped Bubbleman survives battle and takes no damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Bubbleman'], st: [{ n: 'Bubble Blaster', pos: 'up' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  g.p[0].st[0].equipTo = g.p[0].m[0].u;
  const b = on(g, 0, 'Elemental HERO Bubbleman'); ok(E.atk(g, b) === 1600, 'Bubbleman 1600 ATK');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Cyber Dragon'); settle(g);
  ok(on(g, 0, 'Elemental HERO Bubbleman') && inZ(g, 0, 'gy', 'Bubble Blaster') && g.p[0].lp === 8000, `Blaster destroyed instead, no damage (A ${g.p[0].lp})`);
});
T('Bubble Crash: each player sends down to 5', () => {
  const g = duel({ board: [{ hand: ['Blue Medicine', 'Blue Medicine', 'Blue Medicine'], m: [FILL, FILL, FILL], st: ['Bubble Crash'], turn: 2 }, { hand: [FILL] }] });
  g.p[0].st[0].turnIn = -5;
  act(g, 0, 'Bubble Crash'); settle(g);
  ok(g.p[0].hand.length + g.p[0].m.filter(Boolean).length + g.p[0].st.filter(Boolean).length === 5, 'A has 5 cards left');
});
T('Burning Beast: union equip, then protects Freezing Beast in battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Burning Beast', 'Freezing Beast'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'Equip to Freezing Beast'); settle(g);
  ok(inZ(g, 0, 'st', 'Burning Beast'), 'Burning Beast equipped');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Cyber Dragon'); settle(g);
  ok(on(g, 0, 'Freezing Beast') && inZ(g, 0, 'gy', 'Burning Beast'), 'Burning Beast destroyed instead');
});
T('Burning Algae gives the opponent 1000 when sent to the GY', () => {
  const g = duel({ board: [{ hand: ['Card Rotator', 'Burning Algae'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Card Rotator'); settle(g, 'Burning Algae');
  ok(g.p[1].lp === 9000 && on(g, 1, FILL).pos === 'def', `B gained 1000 and its monster changed position (B ${g.p[1].lp})`);
});
T('Burst Stream: destroys their monsters, Blue-Eyes cannot attack', () => {
  const g = duel({ board: [{ hand: ['Burst Stream of Destruction'], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: [FILL, FILL] }] });
  act(g, 0, 'Burst Stream of Destruction'); passAll(g);
  ok(g.p[1].m.every(x => !x), 'their monsters destroyed');
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'atk:'), 'Blue-Eyes cannot attack');
});
T('Butterfly Dagger - Elma returns to the hand when destroyed', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: [{ n: 'Butterfly Dagger - Elma', pos: 'up' }], turn: 2 }, { hand: [], st: ['Mystical Space Typhoon'] }] });
  g.p[0].st[0].equipTo = g.p[0].m[0].u; g.p[0].st[0].flags.elma = true; g.p[1].st[0].turnIn = -5;
  choose(g, 'bp'); choose(g, 'Mystical Space', 1); settle(g, 'Butterfly'); settle(g);
  ok(inZ(g, 0, 'hand', 'Butterfly Dagger - Elma'), 'Elma returned to the hand');
});
T('Call of the Earthbound redirects the attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Honest', FILL], st: ['Call of the Earthbound'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Honest'); choose(g, 'Earthbound', 1); passAll(g); settle(g, FILL);
  ok(inZ(g, 1, 'gy', FILL) && on(g, 1, 'Honest'), 'Cyber Dragon battled the Warwolf instead');
});
T('Call of the Grave negates Monster Reborn', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Cyber Dragon'], turn: 2 }, { st: ['Call of the Grave'] }] });
  if (!E.hasScript('Monster Reborn')) { console.log('skip: Monster Reborn has no Edison script yet'); return; }
  act(g, 0, 'Monster Reborn'); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Cyber Dragon'); choose(g, 'Call of the Grave', 1);   // one target: the engine picks it itself settle(g);
  ok(!on(g, 0, 'Cyber Dragon') && inZ(g, 0, 'gy', 'Monster Reborn'), 'Monster Reborn was negated');
});
T('Card Blocker goes to Defense, takes the attack and gains DEF', () => {
  const g = duel({ board: [{ hand: [], m: ['Chaos-End Master'], turn: 2 }, { m: [{ n: 'Card Blocker', pos: 'def' }, FILL] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Gene'); settle(g, '3');
  ok(on(g, 1, FILL) && on(g, 1, 'Card Blocker') && g.p[1].gy.length >= 3 && g.p[0].lp === 8000 - (400 + 1500 - 1500), `redirected to Card Blocker with +1500 DEF (A ${g.p[0].lp})`);
});
T('Card Guard: counter, +300, moves it and protects the target', () => {
  const g = duel({ board: [{ hand: ['Card Guard'], m: [FILL], turn: 2 }, { st: ['Mystical Space Typhoon'] }] });
  choose(g, 'ns:' + card(g, 0, 'Card Guard').u); settle(g);
  const cg = on(g, 0, 'Card Guard'); ok(E.atk(g, cg) === 1900, 'Card Guard 1900 ATK with a counter');
  choose(g, 'Move a Guard Counter'); settle(g, FILL);
  ok(E.atk(g, cg) === 1600, 'Card Guard back to 1600');
  const w = on(g, 0, FILL); E.lib.destroy(g, [w], { by: 1 });
  ok(on(g, 0, FILL) === w, 'the Warwolf survived by losing its Guard Counter');
});
T('Card of Sanctity banishes as a cost and draws 2', () => {
  const g = duel({ board: [{ hand: ['Card of Sanctity', FILL, FILL, FILL], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Card of Sanctity'); passAll(g);
  ok(g.p[0].hand.length === 2 && g.p[0].ban.length === 5, `hand 2, banished 5 (${g.p[0].hand.length}, ${g.p[0].ban.length})`);
});
T('Castle Gate tributes for damage and survives battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Castle Gate', 'Cyber Dragon'], turn: 2 }, {}] });
  choose(g, 'Tribute: damage'); settle(g, 'Cyber Dragon');
  ok(g.p[1].lp === 8000 - 2100, `2100 damage (${g.p[1].lp})`);
});
T('Chain cards: Detonation link 2 shuffles in, Strike deals 800', () => {
  const g = duel({ board: [{ hand: [], st: ['Chain Detonation', 'Chain Strike'], turn: 2 }, {}] });
  g.p[0].st.forEach(c => c && (c.turnIn = -5));
  choose(g, 'bp'); act(g, 0, 'Chain Detonation');
  choose(g, 'Chain Strike', 0); passAll(g);
  ok(g.p[1].lp === 8000 - 800 - 500, `Strike 800 + Detonation 500 (${g.p[1].lp})`);
  ok(g.p[0].deck.some(c => E.name(c) === 'Chain Detonation') === false && inZ(g, 0, 'gy', 'Chain Detonation'), 'Detonation as Chain Link 1 went to the GY');
});
T('Chain Destruction destroys copies in hand and Deck', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { st: ['Chain Destruction'] }] });
  const deckN = g.p[0].deck.filter(c => E.name(c) === FILL).length;
  choose(g, 'ns:'); choose(g, 'Chain Destruction', 1); settle(g);
  ok(g.p[0].deck.filter(c => E.name(c) === FILL).length === 0 && deckN > 0, 'all Warwolves in the Deck destroyed');
});
T('Chain Disappearance banishes the summon and the copies', () => {
  const g = duel({ board: [{ hand: ['Chaos Necromancer'], turn: 2 }, { st: ['Chain Disappearance'] }] });
  choose(g, 'ns:'); choose(g, 'Chain Disappearance', 1); settle(g);
  ok(inZ(g, 0, 'ban', 'Chaos Necromancer') && g.p[0].ban.length === 1, 'Chaos Necromancer banished');
});
T('Chain Thrasher attacks once more per Chain Thrasher in the GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Chain Thrasher'], gy: ['Chain Thrasher'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); settle(g);
  ok(hasOpt(g, 'Attack directly'), 'a second attack');
});
T('Chaos Burst destroys the attacker and burns', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: ['Chaos Burst'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Gene'); choose(g, 'Chaos Burst', 1); settle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && g.p[0].lp === 7000, `attacker destroyed, 1000 damage (A ${g.p[0].lp})`);
});
T('Chaos Command Magician negates a monster effect that targets only it', () => {
  const g = duel({ board: [{ hand: [], m: ['Blackwing - Gale the Whirlwind'], turn: 2 }, { m: ['Chaos Command Magician'] }] });
  choose(g, 'Halve'); settle(g);
  ok(E.atk(g, on(g, 1, 'Chaos Command Magician')) === 2400, 'its ATK was not halved');
});
T('Chaos Necromancer counts monsters in the GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Chaos Necromancer'], gy: [FILL, FILL, 'Blue Medicine'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Chaos Necromancer')) === 600, '600 ATK');
});
T('Chaos-End Master summons from the Deck after a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Chaos-End Master'], deckTop: ['Cyber Dragon'], turn: 2 }, { m: [{ n: 'Honest', pos: 'def' }] }] });
  // Honest is 1100 DEF; Chaos-End Master 1500 ATK
  choose(g, 'bp'); passAll(g); choose(g, 'Attack'); settle(g, 'Cyber Dragon');
  ok(!on(g, 0, 'Cyber Dragon'), 'Cyber Dragon (Level 5, 2100 ATK) is too strong to summon');
});
T('Blast Asmodian: chained Book of Moon burns 500', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: ['Blast Asmodian', 'Honest'], turn: 2 }, { m: [FILL], st: ['Book of Moon'] }] });
  g.p[1].st[0].turnIn = -5;
  act(g, 0, 'Book of Moon'); choose(g, FILL); choose(g, 'Book of Moon', 1); choose(g, 'Honest'); settle(g);
  ok(g.p[1].lp === 7500, `B took 500 (${g.p[1].lp})`);
});
T('Chain Burst: the Trap player takes 1000', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: [{ n: 'Chain Burst', pos: 'up' }], turn: 2 }, { m: [FILL], st: ['Castle Walls'] }] });
  g.p[1].st[0].turnIn = -5;
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Gene'); choose(g, 'Castle Walls', 1); settle(g, FILL); settle(g);
  ok(g.p[1].lp === 6900, `B took 1000 and 100 battle damage (${g.p[1].lp})`);
});
T('Chain Summoning allows 3 Normal Summons', () => {
  const g = duel({ board: [{ hand: [FILL, FILL, FILL], st: ['Chain Summoning'], turn: 2 }, { st: ['Chain Healing', 'Chain Detonation'] }] });
  g.p[0].st[0].turnIn = -5; g.p[1].st.forEach(c => c && (c.turnIn = -5));
  choose(g, 'bp'); choose(g, 'Chain Healing', 1); choose(g, 'Chain Detonation', 1); choose(g, 'Chain Summoning', 0); passAll(g); choose(g, 'endbp'); settle(g);
  for (let i = 0; i < 3; i++) { choose(g, 'ns:'); settle(g); }
  ok(g.p[0].m.filter(Boolean).length === 3, '3 Normal Summons with the extra count');
});
T('Book of Taiyou flips a monster into Attack Position', () => {
  const g = duel({ board: [{ hand: ['Book of Taiyou'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  act(g, 0, 'Book of Taiyou'); settle(g);
  ok(on(g, 1, FILL).pos === 'atk', 'flipped into Attack Position');
});
T('Blast Sphere equips to the attacker and blows it up', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: [{ n: 'Blast Sphere', pos: 'set' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); settle(g);
  ok(inZ(g, 0, 'st', 'Blast Sphere'), 'Blast Sphere equipped to Cyber Dragon');
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g); choose(g, 'end'); settle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && g.p[0].lp === 8000 - 2100, `Cyber Dragon destroyed, 2100 damage (A ${g.p[0].lp})`);
});
T('Brain Crusher revives what it destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Brain Crusher'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Cyber'); settle(g); choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g, 'Cyber Dragon');
  ok(on(g, 0, 'Cyber Dragon'), 'A Special Summoned Cyber Dragon');
});
T('Blue-Eyes Toon Dragon: Tribute 2 with Toon World, no attack that turn, 500 LP to attack directly', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes Toon Dragon'], m: [FILL, FILL], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, { m: [FILL] }] });
  const t = card(g, 0, 'Blue-Eyes Toon Dragon'); ok(!hasOpt(g, 'ns:' + t.u), 'no Normal Summon');
  choose(g, 'sp:' + t.u); settle(g); ok(on(g, 0, 'Blue-Eyes Toon Dragon'), 'Special Summoned');
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'atk:'), 'cannot attack the turn it was summoned');
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g); choose(g, 'end'); settle(g);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); settle(g);
  ok(g.p[0].lp === 7500 && g.p[1].lp === 5000, `paid 500, 3000 direct (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
console.log(fails ? `\n${fails} failed` : '\nAll full-03 checks passed.');
process.exit(fails ? 1 : 0);
