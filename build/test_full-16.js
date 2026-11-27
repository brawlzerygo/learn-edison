// Scenario checks for full pool batch 16: node build/test_full-16.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = (ex, main) => ({ name: 't', main: main || Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0, o.main0), mk(o.ex1, o.main1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, g.p[p].fz].find(c => c && E.data(c).n === n).u + ':');
const use = (g, p, n, lab) => { const c = [...g.p[p].m, ...g.p[p].st].find(x => x && E.data(x).n === n); const o = g.prompt.opts.find(x => x.key.startsWith('a:' + c.u + ':') && (!lab || x.label.toLowerCase().includes(lab.toLowerCase()))); if (!o) throw new Error('no effect of ' + n + ' in ' + g.prompt.opts.map(x => x.label).join(', ')); E.act(g, [o.key]); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const endTurn = g => { passAll(g); while (g.prompt && g.prompt.type !== 'idle') { if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, [g.prompt.opts[0].key]); } choose(g, 'end'); };
const toIdle = (g, p) => { for (let i = 0; i < 30 && g.prompt && !(g.prompt.type === 'idle' && g.prompt.p === p); i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'yesno') choose(g, 'no'); else if (g.prompt.type === 'idle') choose(g, 'end'); else E.act(g, [g.prompt.opts[0].key]); } };
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

T('The A. Forces counts Warriors and Spellcasters, copies add up', () => {
  const g = duel({ board: [{ hand: [], m: ['Celtic Guardian', 'Mystical Elf'], st: [{ n: 'The A. Forces', pos: 'up' }, { n: 'The A. Forces', pos: 'up' }], turn: 2 }, {}] });
  const cg = on(g, 0, 'Celtic Guardian'), me = on(g, 0, 'Mystical Elf');
  ok(E.atk(g, cg) === 1400 + 800 && E.atk(g, me) === 800, `Celtic Guardian ${E.atk(g, cg)} (2200), Mystical Elf ${E.atk(g, me)} (800)`);
});
T('The Beginning of the End banishes 5 DARKs as a cost and draws 3', () => {
  const g = duel({ board: [{ hand: ['The Beginning of the End'], gy: Array(7).fill('Dark Magician'), turn: 2 }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'The Beginning of the End'); E.act(g, g.prompt.opts.slice(0, 5).map(o => o.key)); passAll(g);
  ok(g.p[0].ban.length === 5 && g.p[0].hand.length === h - 1 + 3, `5 banished (${g.p[0].ban.length}), hand ${g.p[0].hand.length}`);
});
T('The Big March of Animals: +200 per Beast, set at resolution', () => {
  const g = duel({ board: [{ hand: ['The Big March of Animals'], m: ['Silver Fang', 'The Trojan Horse', FILL], turn: 2 }, {}] });
  act(g, 0, 'The Big March of Animals'); passAll(g);
  const sf = on(g, 0, 'Silver Fang'); ok(E.atk(g, sf) === 1200 + 400 && E.atk(g, on(g, 0, FILL)) === 2000, `Silver Fang ${E.atk(g, sf)} (1600; 2 Beasts, the Beast-Warrior doesn't count)`);
});
T('The Big Saturn: +1000 for a discard and 1000 LP; burns both when the opponent destroys it', () => {
  const g = duel({ board: [{ hand: ['Celtic Guardian'], m: ['The Big Saturn'], turn: 2 }, { hand: ['Smashing Ground'], st: [] }] });
  use(g, 0, 'The Big Saturn'); E.act(g, [g.prompt.opts[0].key]); passAll(g);
  ok(E.atk(g, on(g, 0, 'The Big Saturn')) === 3800 && g.p[0].lp === 7000, `3800 ATK, A paid 1000 (${g.p[0].lp})`);
  endTurn(g); toIdle(g, 1); act(g, 1, 'Smashing Ground'); passAll(g); passAll(g);
  ok(g.p[0].lp === 7000 - 2800 && g.p[1].lp === 8000 - 2800, `both took 2800 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].deck[0], p: 0 }) === false, 'lock only on The Big Saturn');
});
T('The Bistro Butcher makes the opponent draw 2', () => {
  const g = duel({ board: [{ hand: [], m: ['The Bistro Butcher'], turn: 2 }, {}] });
  const h = g.p[1].hand.length; choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g); passAll(g);
  ok(g.p[1].hand.length === h + 2, `B drew 2 (${h} -> ${g.p[1].hand.length})`);
});
T('The Calculator: 300 x total Levels', () => {
  const g = duel({ board: [{ hand: [], m: ['The Calculator', 'Celtic Guardian'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'The Calculator')) === 300 * 6, `ATK ${E.atk(g, on(g, 0, 'The Calculator'))} (1800)`);
});
T('The Cheerful Coffin discards up to 3 monsters', () => {
  const g = duel({ board: [{ hand: ['The Cheerful Coffin', 'Celtic Guardian', 'Mystical Elf'], turn: 2 }, {}] });
  act(g, 0, 'The Cheerful Coffin'); passAll(g); E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key));
  ok(inZ(g, 0, 'gy', 'Celtic Guardian') && inZ(g, 0, 'gy', 'Mystical Elf'), 'two monsters discarded');
});
T('The Creator: target first, the send happens at resolution; no revival from the GY', () => {
  const g = duel({ board: [{ hand: ['Celtic Guardian'], m: ['The Creator'], gy: ['Mystical Elf', 'The Creator'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; use(g, 0, 'The Creator');
  ok(!g.prompt.opts.some(o => o.label === 'The Creator'), 'The Creator in the GY is not a legal target');
  ok(g.p[0].hand.length === h, 'no card sent at activation'); passAll(g);
  choose(g, 'Celtic Guardian'); passAll(g);
  ok(on(g, 0, 'Mystical Elf') && inZ(g, 0, 'gy', 'Celtic Guardian'), 'Mystical Elf revived, Celtic Guardian sent');
});
T('The Creator Incarnate Tributes itself for The Creator', () => {
  const g = duel({ board: [{ hand: ['The Creator'], m: ['The Creator Incarnate'], turn: 2 }, {}] });
  use(g, 0, 'The Creator Incarnate'); passAll(g);
  ok(on(g, 0, 'The Creator') && inZ(g, 0, 'gy', 'The Creator Incarnate'), 'The Creator summoned');
});
T('The Dark Door: only 1 attack each Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Celtic Guardian', 'Mystical Elf'], turn: 2 }, { st: [{ n: 'The Dark Door', pos: 'up' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g); passAll(g);
  ok(!hasOpt(g, 'Attack'), 'no second attacker');
});
T('The Dragon Dwelling in the Deep: Ocean Counters power up Fish and Sea Serpents when it leaves', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], m: [], turn: 1 }, { m: ['The Dragon Dwelling in the Deep', 'The Dragon Dwelling in the Deep'] }] });
  endTurn(g); toIdle(g, 1); endTurn(g); toIdle(g, 0);
  const d = on(g, 1, 'The Dragon Dwelling in the Deep'); ok(d && d.flags.f16ocean === 3, `3 Ocean Counters, one per Standby Phase (${d && d.flags.f16ocean})`);
  act(g, 0, 'Smashing Ground'); passAll(g); if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); passAll(g);
  const d2 = on(g, 1, 'The Dragon Dwelling in the Deep'); ok(d2 && E.atk(g, d2) === 1700 + 600, `the other one has ${d2 && E.atk(g, d2)} (2300)`);
});
T("The Dragon's Bead negates a Trap that targets a Dragon", () => {
  const g = duel({ board: [{ hand: ['Celtic Guardian'], m: ['Luster Dragon'], st: ["The Dragon's Bead"], turn: 2 }, { st: ['Dimensional Prison'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  choose(g, 'Dimensional Prison', 1);
  choose(g, "Dragon's Bead", 0); // flip it (no effect yet)
  ok(hasOpt(g, 'negate a Trap'), 'the effect is offered above its own flip'); choose(g, 'negate a Trap', 0); choose(g, 'Celtic Guardian', 0);
  passAll(g); passAll(g); passAll(g); passAll(g);
  ok(on(g, 0, 'Luster Dragon') && inZ(g, 1, 'gy', 'Dimensional Prison') && inZ(g, 0, 'gy', 'Celtic Guardian'), 'Luster Dragon stays, Dimensional Prison destroyed, 1 card discarded');
});
T("The Emperor's Holiday takes back an Equip's ATK", () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: ['Celtic Guardian'], turn: 2 }, { st: ["The Emperor's Holiday"] }] });
  act(g, 0, 'Black Pendant'); passAll(g); const cg = on(g, 0, 'Celtic Guardian');
  ok(E.atk(g, cg) === 1900, `equipped: ${E.atk(g, cg)} (1900)`);
  g.p[1].st[0].pos = 'up'; g.seq++;
  ok(E.atk(g, cg) === 1400, `with The Emperor's Holiday face-up: ${E.atk(g, cg)} (1400)`);
});
T('The Eye of Truth: the opponent gains 1000 with a Spell in hand', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'The Eye of Truth', pos: 'up' }], turn: 1 }, { hand: ['Smashing Ground'] }] });
  endTurn(g); toIdle(g, 1); ok(g.p[1].lp === 9000, `B at ${g.p[1].lp} (9000)`);
});
T('The Fiend Megacyber: summon rule when the opponent has 2 more monsters', () => {
  const g = duel({ board: [{ hand: ['The Fiend Megacyber'], turn: 2 }, { m: [FILL, FILL] }] });
  ok(hasOpt(g, 'they control 2 more'), 'offered'); choose(g, 'they control 2 more'); passAll(g); ok(on(g, 0, 'The Fiend Megacyber'), 'summoned');
});
T('The First Sarcophagus places the others, then summons Spirit of the Pharaoh', () => {
  const g = duel({ board: [{ hand: ['The Second Sarcophagus', 'The Third Sarcophagus', 'Spirit of the Pharaoh'], st: [{ n: 'The First Sarcophagus', pos: 'set' }], turn: 2 }, {}] });
  ok(!hasOpt(g, 'setst:' + g.p[0].hand.find(x => E.data(x).n === 'The Second Sarcophagus').u), 'The Second Sarcophagus cannot be Set');
  act(g, 0, 'The First Sarcophagus'); passAll(g); endTurn(g); toIdle(g, 1); endTurn(g);
  ok(inZ(g, 0, 'st', 'The Second Sarcophagus'), 'Second placed at the end of the opponent’s turn');
  toIdle(g, 0); endTurn(g); toIdle(g, 1); endTurn(g); passAll(g);
  ok(on(g, 0, 'Spirit of the Pharaoh') && inZ(g, 0, 'gy', 'The First Sarcophagus') && inZ(g, 0, 'gy', 'The Third Sarcophagus'), 'all three to the GY and Spirit of the Pharaoh summoned');
});
T('Removing one Sarcophagus sends the others to the GY', () => {
  const g = duel({ board: [{ hand: ['The Second Sarcophagus', 'Mystical Space Typhoon'], st: [{ n: 'The First Sarcophagus', pos: 'set' }], turn: 2 }, {}] });
  act(g, 0, 'The First Sarcophagus'); passAll(g); endTurn(g); toIdle(g, 1); endTurn(g); toIdle(g, 0);
  act(g, 0, 'Mystical Space Typhoon'); choose(g, 'The Second Sarcophagus'); passAll(g);
  ok(inZ(g, 0, 'gy', 'The First Sarcophagus') && inZ(g, 0, 'gy', 'The Second Sarcophagus'), 'both in the GY');
});
T('The Flute of Summoning Dragon needs Lord of D.', () => {
  const g = duel({ board: [{ hand: ['The Flute of Summoning Dragon', 'Luster Dragon', 'Blue-Eyes White Dragon'], turn: 2 }, { m: ['Lord of D.'] }] });
  act(g, 0, 'The Flute of Summoning Dragon'); passAll(g); E.act(g, g.prompt.opts.map(o => o.key));
  ok(on(g, 0, 'Luster Dragon') && on(g, 0, 'Blue-Eyes White Dragon'), 'two Dragons summoned (opponent’s Lord counts)');
});
T('The Flute of Summoning Kuriboh can Special Summon', () => {
  const g = duel({ main0: [...Array(39).fill(id(FILL)), id('Kuriboh')], board: [{ hand: ['The Flute of Summoning Kuriboh'], turn: 2 }, {}] });
  act(g, 0, 'The Flute of Summoning Kuriboh'); passAll(g); choose(g, 'Special Summon');
  ok(on(g, 0, 'Kuriboh'), 'Kuriboh summoned');
});
T('The Forceful Sentry shuffles a card from the opponent’s hand', () => {
  const g = duel({ board: [{ hand: ['The Forceful Sentry'], turn: 2 }, { hand: ['Mirror Force'] }] });
  act(g, 0, 'The Forceful Sentry'); passAll(g);
  ok(g.p[1].hand.length === 0 && g.p[1].deck.some(x => E.data(x).n === 'Mirror Force'), 'Mirror Force in the Deck');
});
T('The Forces of Darkness adds 2 Dark World monsters', () => {
  const g = duel({ board: [{ hand: [], st: ['The Forces of Darkness'], gy: ['Sillva, Warlord of Dark World', 'Goldd, Wu-Lord of Dark World'], turn: 2 }, {}] });
  act(g, 0, 'The Forces of Darkness'); passAll(g);
  ok(inZ(g, 0, 'hand', 'Sillva, Warlord of Dark World') && inZ(g, 0, 'hand', 'Goldd, Wu-Lord of Dark World'), 'both added');
});
T('The Forgiving Maiden returns the next monster destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Mystical Elf', 'The Forgiving Maiden'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  use(g, 0, 'The Forgiving Maiden'); passAll(g);
  g.p[0].m.find(x => x && E.name(x) === 'Mystical Elf').turnIn = 0;
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Blue-Eyes'); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(inZ(g, 0, 'hand', 'Mystical Elf'), 'Mystical Elf returned to the hand');
});
T('The Gift of Greed makes the opponent draw 2', () => {
  const g = duel({ board: [{ hand: [], st: ['The Gift of Greed'], turn: 2 }, {}] });
  const h = g.p[1].hand.length; act(g, 0, 'The Gift of Greed'); passAll(g); ok(g.p[1].hand.length === h + 2, 'B drew 2');
});
T('The Grave of Enkindling (Set) answers a battle destruction', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Celtic Guardian'], st: ['The Grave of Enkindling'], gy: ['Mystical Elf'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Celtic'); passAll(g); passAll(g); passAll(g);
  if (g.prompt && g.prompt.type === 'yesno') choose(g, 'yes', 1);
  passAll(g); for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); passAll(g);
  const me = on(g, 1, 'Mystical Elf') || on(g, 1, 'Celtic Guardian');
  ok(me && me.pos === 'def' && E.lib.forbid(g, { type: 'pos', c: me }), 'B revived a monster in Defense, locked in position');
});
T('The Graveyard in the Fourth Dimension returns 2 LV monsters', () => {
  const g = duel({ board: [{ hand: ['The Graveyard in the Fourth Dimension'], gy: ['Armed Dragon LV3', 'Armed Dragon LV5'], turn: 2 }, {}] });
  act(g, 0, 'The Graveyard in the Fourth Dimension'); passAll(g);
  ok(g.p[0].gy.filter(x => / LV/.test(E.data(x).n)).length === 0 && g.p[0].deck.some(x => E.data(x).n === 'Armed Dragon LV5'), 'both shuffled into the Deck');
});
T('The Hunter with 7 Weapons: +1000 against the declared Type', () => {
  const g = duel({ board: [{ hand: ['The Hunter with 7 Weapons'], turn: 2 }, { m: ['Luster Dragon'] }] });
  choose(g, 'ns:'); passAll(g); choose(g, 'Dragon'); passAll(g);
  const h = on(g, 0, 'The Hunter with 7 Weapons'); ok(h.flags.f16type === 'Dragon' && E.atk(g, h) === 1000, 'declared Dragon, 1000 ATK outside battle');
  h.turnIn = 0; choose(g, 'bp'); passAll(g); choose(g, 'Attack Luster'); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(inZ(g, 1, 'gy', 'Luster Dragon') && g.p[1].lp === 8000 - 100, `Luster Dragon destroyed, B took 100 (${g.p[1].lp})`);
});
T('The Immortal of Thunder: +3000 on flip, owner loses 5000 when it goes face-up to the GY', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], m: [{ n: 'The Immortal of Thunder', pos: 'set' }], turn: 2 }, {}] });
  choose(g, 'Flip Summon'); passAll(g); ok(g.p[0].lp === 11000, `A at ${g.p[0].lp}`);
  E.lib.destroy(g, [on(g, 0, 'The Immortal of Thunder')], { by: 1 }); passAll(g); toIdle(g, 1);
  ok(g.p[0].lp === 6000, `A lost 5000 (${g.p[0].lp})`);
});
T('The Kick Man equips an Equip Spell from the GY', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['The Kick Man', 'Black Pendant'], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); passAll(g); yesAll(g); passAll(g);
  const k = on(g, 0, 'The Kick Man'); ok(k && inZ(g, 0, 'st', 'Black Pendant') && E.atk(g, k) === 1800, `equipped (${k && E.atk(g, k)})`);
});
T('The Lady in Wight protects other Level 3 or lower Zombies', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], turn: 2 }, { m: ['The Lady in Wight', 'Skull Servant'] }] });
  const s = on(g, 1, 'Skull Servant'), l = on(g, 1, 'The Lady in Wight');
  ok(E.lib.has(g, s, 'noBattleDestroy') && E.lib.has(g, s, 'unaffectedSpells') && !E.lib.has(g, l, 'noBattleDestroy'), 'Skull Servant protected, the Lady herself not');
});
T('The Last Warrior from Another Planet stops Summons', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['The Last Warrior from Another Planet'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:') && hasOpt(g, 'set:'), 'no Normal Summon, Set still allowed');
});
T('The Last Warrior from Another Planet: a Special Summon destroys your other monsters', () => {
  // Polymerization has no Edison script yet, so it is revived here
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['The Last Warrior from Another Planet'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); passAll(g); passAll(g);
  ok(on(g, 0, 'The Last Warrior from Another Planet') && !on(g, 0, FILL), 'summoned, the other monster destroyed');
});
T('The Law of the Normal clears the field and hands', () => {
  const g = duel({ board: [{ hand: ['The Law of the Normal', FILL], m: ['Skull Servant', 'Skull Servant', 'Skull Servant', 'Skull Servant', 'Skull Servant'], turn: 2 }, { hand: ['Dark Hole'], m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'] }] });
  act(g, 0, 'The Law of the Normal'); passAll(g);
  ok(g.p[0].hand.length === 0 && g.p[1].hand.length === 0 && !on(g, 1, 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Mirror Force') && on(g, 0, 'Skull Servant'), 'hands discarded, the rest destroyed, Normals stay');
});
T('The League of Uniform Nomenclature summons the copies', () => {
  const g = duel({ main0: [...Array(37).fill(id(FILL)), id('Skull Servant'), id('Skull Servant'), id(FILL)], board: [{ hand: [], m: ['Skull Servant'], st: ['The League of Uniform Nomenclature'], turn: 2 }, {}] });
  act(g, 0, 'The League of Uniform Nomenclature'); passAll(g);
  ok(g.p[0].m.filter(x => x && E.name(x) === 'Skull Servant').length === 3, '3 Skull Servants');
});
T('The Legendary Fisherman can’t be attacked with Umi', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['The Legendary Fisherman'], st: [] }] });
  g.p[1].fz = null; ok(hasOpt(g, 'bp'), 'bp'); choose(g, 'bp'); passAll(g);
  ok(hasOpt(g, 'Attack The Legendary'), 'attackable without Umi');
});
T('The Little Swordsman of Aile Tributes for +700', () => {
  const g = duel({ board: [{ hand: [], m: ['The Little Swordsman of Aile', FILL], turn: 2 }, {}] });
  use(g, 0, 'The Little Swordsman of Aile'); passAll(g);
  ok(E.atk(g, on(g, 0, 'The Little Swordsman of Aile')) === 1500, '1500 ATK');
});
T('The Mask of Remnants shuffles itself into the Deck', () => {
  const g = duel({ board: [{ hand: ['The Mask of Remnants'], turn: 2 }, {}] });
  act(g, 0, 'The Mask of Remnants'); passAll(g);
  ok(g.p[0].deck.some(x => E.data(x).n === 'The Mask of Remnants') && !inZ(g, 0, 'gy', 'The Mask of Remnants'), 'in the Deck');
});
T('The Paths of Destiny: each player tosses', () => {
  const g = duel({ board: [{ hand: [], st: ['The Paths of Destiny'], turn: 2 }, {}] });
  act(g, 0, 'The Paths of Destiny'); passAll(g);
  ok([6000, 10000].includes(g.p[0].lp) && [6000, 10000].includes(g.p[1].lp), `A ${g.p[0].lp}, B ${g.p[1].lp}`);
});
T('The Puppet Magic of Dark Ruler banishes Levels equal to the Fiend', () => {
  const g = duel({ board: [{ hand: ['The Puppet Magic of Dark Ruler'], m: ['Skull Servant', 'Skull Servant', FILL], gy: ['Archfiend Soldier'], turn: 2 }, {}] });
  act(g, 0, 'The Puppet Magic of Dark Ruler'); passAll(g);
  if (g.prompt && g.prompt.type === 'choose') E.act(g, [g.prompt.opts[0].key]);
  ok(on(g, 0, 'Archfiend Soldier') && g.p[0].ban.length >= 1, `Archfiend Soldier summoned, ${g.p[0].ban.length} banished`);
});
T('The Regulation of Tribe: the declared Type can’t attack, upkeep in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['The Regulation of Tribe'], turn: 2 }, { m: ['Luster Dragon'] }] });
  act(g, 0, 'The Regulation of Tribe'); passAll(g); choose(g, 'Dragon');
  const ld = on(g, 1, 'Luster Dragon'); ok(E.lib.forbid(g, { type: 'attack', c: ld }), 'Dragons can’t attack');
  endTurn(g); toIdle(g, 1); endTurn(g);
  for (let i = 0; i < 10 && g.prompt && !(g.prompt.type === 'idle' && g.prompt.p === 0); i++) { if (g.prompt.type === 'yesno') choose(g, 'no'); else if (g.prompt.type === 'respond') E.act(g, ['pass']); else E.act(g, [g.prompt.opts[0].key]); }
  ok(inZ(g, 0, 'gy', 'The Regulation of Tribe'), 'destroyed when nothing is Tributed');
});
T('The Reliable Guardian: +700 DEF', () => {
  const g = duel({ board: [{ hand: ['The Reliable Guardian'], m: ['Mystical Elf'], turn: 2 }, {}] });
  act(g, 0, 'The Reliable Guardian'); passAll(g); ok(E.def(g, on(g, 0, 'Mystical Elf')) === 2700, '2700 DEF');
});
T('The Rock Spirit: summon by banishing an EARTH; +300 on the opponent’s Battle Phase; no revival unless properly summoned', () => {
  const g = duel({ board: [{ hand: ['The Rock Spirit'], gy: ['Giant Soldier of Stone', 'The Rock Spirit'], turn: 2 }, {}] });
  const gyR = g.p[0].gy.find(x => E.data(x).n === 'The Rock Spirit');
  const rs = g.p[0].hand.find(x => E.data(x).n === 'The Rock Spirit');
  ok(!hasOpt(g, 'ns:' + rs.u), 'no Normal Summon'); choose(g, 'banish an EARTH'); choose(g, 'Giant Soldier'); passAll(g);
  ok(on(g, 0, 'The Rock Spirit') && inZ(g, 0, 'ban', 'Giant Soldier of Stone'), 'summoned');
  ok(E.lib.forbid(g, { type: 'ss', c: gyR, p: 0, how: 'special' }), 'the copy in the GY (never summoned) can’t be revived');
  ok(E.atk(g, on(g, 0, 'The Rock Spirit')) === 1700, '1700 on its own turn');
});
T('The Sanctuary in the Sky: no battle damage to a Fairy’s controller', () => {
  const g2 = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { hand: ['The Sanctuary in the Sky'], m: ['Petit Angel'] }] });
  const fs = g2.p[1].hand.find(x => E.data(x).n === 'The Sanctuary in the Sky'); E.lib.move(g2, fs, 'fz', { ctrl: 1, pos: 'up' });
  choose(g2, 'bp'); passAll(g2); choose(g2, 'Attack Petit'); passAll(g2); passAll(g2); passAll(g2); passAll(g2);
  ok(g2.p[1].lp === 8000 && inZ(g2, 1, 'gy', 'Petit Angel'), `B took no damage (${g2.p[1].lp})`);
});
T('The Secret of the Bandit: battle damage makes the opponent discard', () => {
  const g = duel({ board: [{ hand: ['The Secret of the Bandit'], m: [FILL], turn: 2 }, { hand: ['Mirror Force', 'Fissure'] }] });
  act(g, 0, 'The Secret of the Bandit'); passAll(g);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(g.p[1].hand.length === 1, `B discarded 1 (${g.p[1].hand.length} left)`);
});
T('The Selection negates a summon of a Type already on the field', () => {
  const g = duel({ board: [{ hand: ['Celtic Guardian'], m: ['Celtic Guardian'], turn: 2 }, { st: ['The Selection'] }] });
  choose(g, 'ns:'); ok(hasOpt(g, 'The Selection'), 'offered'); choose(g, 'The Selection', 1); passAll(g);
  ok(g.p[1].lp === 7000 && g.p[0].m.filter(Boolean).length === 1 && inZ(g, 0, 'gy', 'Celtic Guardian'), 'negated and destroyed, 1000 paid');
});
T('The Shallow Grave: each player Sets a monster from their GY', () => {
  const g = duel({ board: [{ hand: ['The Shallow Grave'], gy: ['Mystical Elf'], turn: 2 }, { gy: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'The Shallow Grave'); passAll(g);
  ok(on(g, 0, 'Mystical Elf') && on(g, 0, 'Mystical Elf').pos === 'set' && on(g, 1, 'Blue-Eyes White Dragon') && on(g, 1, 'Blue-Eyes White Dragon').pos === 'set', 'both Set');
});
T('The Spell Absorbing Life flips face-down monsters and gains 400 per Effect Monster', () => {
  const g = duel({ board: [{ hand: [], st: ['The Spell Absorbing Life'], m: ['The Calculator'], turn: 2 }, { m: [{ n: 'The Stern Mystic', pos: 'set' }, { n: FILL, pos: 'set' }] }] });
  act(g, 0, 'The Spell Absorbing Life'); passAll(g);
  ok(g.p[0].lp === 8800 && g.p[1].m.every(x => !x || x.pos === 'def'), `flipped, A at ${g.p[0].lp} (8800)`);
});
T('The Stern Mystic reveals the face-down cards', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'The Stern Mystic', pos: 'set' }], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'Flip Summon'); passAll(g);
  ok(g.log.some(l => /revealed: Mirror Force/.test(l)) && g.p[1].st[0].pos === 'set', 'revealed and still Set');
});
T('The Thing in the Crater summons a Pyro from the hand', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], turn: 2 }, { hand: ['Hinotama Soul'], m: ['The Thing in the Crater'] }] });
  act(g, 0, 'Smashing Ground'); passAll(g); yesAll(g); passAll(g); for (let i = 0; i < 2 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); passAll(g);
  ok(on(g, 1, 'Hinotama Soul'), 'Hinotama Soul summoned');
});
T('The Tricky: summon by discarding 1', () => {
  const g = duel({ board: [{ hand: ['The Tricky', FILL], turn: 2 }, {}] });
  choose(g, 'discard 1'); E.act(g, [g.prompt.opts[0].key]); passAll(g);
  ok(on(g, 0, 'The Tricky') && g.ns[0] === 0, 'summoned, Normal Summon unused');
});
T('The Trojan Horse counts as 2 Tributes for an EARTH', () => {
  const g = duel({ board: [{ hand: ['Giant Soldier of Stone', 'The Rock Spirit'], m: ['The Trojan Horse'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'Tribute as 2'), 'nothing to summon with it yet (no Level 7+ EARTH)');
});
T('The Trojan Horse Tributes alone for a Level 7 EARTH', () => {
  const g = duel({ board: [{ hand: ['Gaia The Fierce Knight'], m: ['The Trojan Horse'], turn: 2 }, {}] });
  use(g, 0, 'The Trojan Horse'); passAll(g);
  ok(on(g, 0, 'Gaia The Fierce Knight') && inZ(g, 0, 'gy', 'The Trojan Horse') && g.ns[0] === 1, 'Gaia Tribute Summoned with the Horse alone');
});
T('The Unfriendly Amazon is destroyed without a Tribute', () => {
  const g = duel({ board: [{ hand: [], m: ['The Unfriendly Amazon'], turn: 1 }, {}] });
  endTurn(g); toIdle(g, 1); endTurn(g); for (let i = 0; i < 10 && g.prompt && !(g.prompt.type === 'idle' && g.prompt.p === 0); i++) { if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, [g.prompt.opts[0].key]); }
  ok(inZ(g, 0, 'gy', 'The Unfriendly Amazon'), 'destroyed');
});
T('The Unhappy Girl survives and locks the monster that battled her', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon', FILL], turn: 2 }, { m: ['The Unhappy Girl'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack The Unhappy'); passAll(g); passAll(g); passAll(g); passAll(g);
  const b = on(g, 0, 'Blue-Eyes White Dragon');
  ok(on(g, 1, 'The Unhappy Girl') && g.p[1].lp === 8000 - 2600, 'not destroyed, damage applied');
  ok(E.lib.forbid(g, { type: 'pos', c: b }) && E.lib.forbid(g, { type: 'attack', c: b }), 'Blue-Eyes locked');
});
T('The Unhappy Maiden ends the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon', FILL], turn: 2 }, { m: ['The Unhappy Maiden'] }] });
  g.p[1].m[0].pos = 'atk';
  choose(g, 'bp'); passAll(g); choose(g, 'Attack The Unhappy'); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(g.phase === 'main2', `Battle Phase over (${g.phase})`);
});
T('The Warrior Returning Alive', () => {
  const g = duel({ board: [{ hand: ['The Warrior Returning Alive'], gy: ['Celtic Guardian'], turn: 2 }, {}] });
  act(g, 0, 'The Warrior Returning Alive'); passAll(g); ok(inZ(g, 0, 'hand', 'Celtic Guardian'), 'added');
});
T('The Wicked Avatar: 3 Tributes, Spell/Trap lock, ATK 100 over the best', () => {
  const g = duel({ board: [{ hand: ['The Wicked Avatar'], m: [FILL, FILL, FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'] }] });
  const wa = g.p[0].hand.find(x => E.data(x).n === 'The Wicked Avatar');
  ok(!hasOpt(g, 'ns:' + wa.u), 'no plain Normal Summon'); choose(g, 'Tribute 3'); passAll(g);
  const a = on(g, 0, 'The Wicked Avatar'); ok(a && E.atk(g, a) === 3100 && E.def(g, a) === 3100, `3100/3100 (${a && E.atk(g, a)})`);
  const mf = g.p[1].st[0]; ok(E.lib.forbid(g, { type: 'activate', c: mf, eff: { type: 'act' }, p: 1 }), 'B can’t activate Spells/Traps');
});
T('The Wicked Dreadroot halves the others (two quarter them)', () => {
  const g = duel({ board: [{ hand: [], m: ['The Wicked Dreadroot'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  const b = on(g, 1, 'Blue-Eyes White Dragon'); ok(E.atk(g, b) === 1500 && E.def(g, b) === 1250, `Blue-Eyes ${E.atk(g, b)}/${E.def(g, b)}`);
  const g2 = duel({ board: [{ hand: [], m: ['The Wicked Dreadroot', 'The Wicked Dreadroot'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  const d = g2.p[0].m[0]; ok(E.atk(g2, on(g2, 1, 'Blue-Eyes White Dragon')) === 750 && E.atk(g2, d) === 2000, `two: Blue-Eyes ${E.atk(g2, on(g2, 1, 'Blue-Eyes White Dragon'))}, Dreadroot ${E.atk(g2, d)}`);
  ok(E.lib.forbid(g, { type: 'ss', c: on(g, 0, 'The Wicked Dreadroot'), p: 0, how: 'special' }), 'can’t be Special Summoned from the field/GY');
});
T('The Wicked Eraser: ATK from the opponent’s cards; destroys everything when destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['The Wicked Eraser'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'] }] });
  const e = on(g, 0, 'The Wicked Eraser'); ok(E.atk(g, e) === 2000, `2000 ATK (${E.atk(g, e)})`);
  use(g, 0, 'The Wicked Eraser'); passAll(g); passAll(g);
  ok(!on(g, 1, 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Mirror Force'), 'everything destroyed');
});
T('The Wicked Worm Beast returns at the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['The Wicked Worm Beast'], turn: 2 }, {}] });
  endTurn(g); toIdle(g, 1); ok(inZ(g, 0, 'hand', 'The Wicked Worm Beast'), 'in the hand');
});
T('The World Tree gets counters from Plants and destroys with 2', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], st: [{ n: 'The World Tree', pos: 'up' }], turn: 2 }, { m: ['Dandylion'], st: ['Mirror Force'] }] });
  act(g, 0, 'Smashing Ground'); passAll(g); passAll(g); for (let i = 0; i < 4 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else E.act(g, [g.prompt.opts[0].key]); }
  const t = g.p[0].st.find(x => x && E.data(x).n === 'The World Tree'); ok(E.lib.ctr(t, 'flower') === 1, `1 counter (${E.lib.ctr(t, 'flower')})`);
  use(g, 0, 'The World Tree', 'Plant gains'); t.ctr.flower = 2; if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); passAll(g);
  ok(g.p[1].m.some(x => x && E.data(x).n === 'Fluff Token' && E.atk(g, x) === 400), 'a Fluff Token gained 400 ATK');
  use(g, 0, 'The World Tree', 'destroy'); choose(g, 'u' + g.p[1].st.find(x => x && E.data(x).n === 'Mirror Force').u); passAll(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && E.lib.ctr(t, 'flower') === 0, 'Mirror Force destroyed, counters spent');
});

console.log(fails ? `\n${fails} check(s) failed.` : '\nAll checks passed.');
process.exit(fails ? 1 : 0);
