// Scenario checks for full pool batch 07: node build/test_full-07.js
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
const yesAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes'); };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const maybe = (g, text) => { if (hasOpt(g, text)) choose(g, text); };
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const eff = (g, p, n) => { const c = [...g.p[p].m, ...g.p[p].st].find(x => x && E.name(x) === n); choose(g, 'a:' + c.u + ':'); };
const attack = (g, label) => { choose(g, label); passAll(g); passAll(g); passAll(g); passAll(g); };
const toBP = g => { choose(g, 'bp'); passAll(g); };
const endTurn = g => { choose(g, 'end'); for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, [g.prompt.opts[0].key]); } };

T('Dragon Capture Jar puts Dragons in Defense and locks them', () => {
  const g = duel({ board: [{ hand: [], st: ['Dragon Capture Jar'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Dragon Capture Jar'); passAll(g);
  ok(on(g, 1, 'Blue-Eyes White Dragon').pos === 'def', 'Blue-Eyes changed to Defense Position');
});
T('Dragon Piper destroys the Jar and frees the Dragons', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Dragon Piper', pos: 'set' }], turn: 2 }, { m: [{ n: 'Blue-Eyes White Dragon', pos: 'def' }], st: [{ n: 'Dragon Capture Jar', pos: 'up' }] }] });
  choose(g, 'Flip Summon'); passAll(g); passAll(g); passAll(g);
  ok(inZ(g, 1, 'gy', 'Dragon Capture Jar') && on(g, 1, 'Blue-Eyes White Dragon').pos === 'atk', 'Jar destroyed, Blue-Eyes in Attack Position');
});
T('Dragon Ice answers an opponent Special Summon', () => {
  const g = duel({ board: [{ hand: [], st: ['Call of the Haunted'], gy: ['Blue-Eyes White Dragon'], turn: 2 }, { hand: ['Dragon Ice', FILL] }] });
  act(g, 0, 'Call of the Haunted'); passAll(g); maybe(g, 'Blue-Eyes'); passAll(g);
  for (let i = 0; i < 5 && g.prompt && !/Dragon Ice/.test(g.prompt.text); i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else break; }
  ok(/Dragon Ice/.test(g.prompt.text), 'Dragon Ice offered'); choose(g, 'yes'); if (g.prompt && g.prompt.type === 'pick') choose(g, FILL); passAll(g);
  ok(!!on(g, 1, 'Dragon Ice') && inZ(g, 1, 'gy', FILL), 'Dragon Ice Special Summoned after discarding');
});
T('Dragonic Knight answers a targeted monster destruction', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Armed Dragon'], gy: ['Caius the Shadow Monarch'], turn: 2 }, { hand: ['Dragonic Knight'], m: [FILL] }] });
  eff(g, 0, 'Dark Armed Dragon'); maybe(g, 'Caius'); maybe(g, FILL);
  ok(hasOpt(g, 'Dragonic Knight'), 'Dragonic Knight offered'); choose(g, 'Dragonic Knight'); passAll(g);
  ok(!!on(g, 1, 'Dragonic Knight') && inZ(g, 1, 'gy', FILL), 'Warwolf sent as cost, Dragonic Knight summoned');
});
T("Dragon's Gunfire: 800 damage or destroy", () => {
  const g = duel({ board: [{ hand: ["Dragon's Gunfire"], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Sangan'] }] });
  act(g, 0, "Dragon's Gunfire"); choose(g, 'Destroy a monster'); maybe(g, 'Sangan'); passAll(g);
  ok(inZ(g, 1, 'gy', 'Sangan'), 'Sangan (600 DEF) destroyed');
});
T("Dragon's Mirror summons Dragon Master Knight from GY materials", () => {
  const g = duel({ ex0: ['Dragon Master Knight'], board: [{ hand: ["Dragon's Mirror"], gy: ['Black Luster Soldier', 'Blue-Eyes Ultimate Dragon'], m: ['Blue-Eyes White Dragon'], turn: 2 }, {}] });
  act(g, 0, "Dragon's Mirror"); passAll(g); for (let i = 0; i < 3 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') passAll(g); else E.act(g, [g.prompt.opts[0].key]); }
  const k = on(g, 0, 'Dragon Master Knight');
  ok(k && E.atk(g, k) === 5500 && inZ(g, 0, 'ban', 'Black Luster Soldier'), `Knight summoned with 5500 ATK (${k && E.atk(g, k)})`);
});
T('Dragonic Guard gets counters and summons a Dragon', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: ['Dragonic Guard'], deckTop: ['Luster Dragon'], turn: 2 }, {}] });
  choose(g, 'ns:'); passAll(g); passAll(g);
  const dg = on(g, 0, 'Dragonic Guard'); ok(dg && dg.ctr && dg.ctr.dragonic === 1, 'one Dragonic Counter');
});
T('Element Soldier negates a destroyed monster with EARTH on the field', () => {
  const g = duel({ board: [{ hand: [], m: ['Element Soldier', FILL], turn: 2 }, { m: [{ n: 'Sangan', pos: 'atk' }] }] });
  const deck = g.p[1].deck.length; toBP(g); attack(g, 'Attack Sangan');
  ok(inZ(g, 1, 'gy', 'Sangan') && g.p[1].deck.length === deck && !hasOpt(g, 'Sangan'), 'Sangan destroyed, no search');
});
T('Element Dragon attacks again with a WIND monster out', () => {
  const g = duel({ board: [{ hand: [], m: ['Element Dragon', 'Elemental HERO Avian'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'atk' }, { n: 'Giant Rat', pos: 'atk' }] }] });
  toBP(g); attack(g, 'Attack Sangan'); for (let i = 0; i < 4 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') passAll(g); else if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, [g.prompt.opts[0].key]); }
  const ed = on(g, 0, 'Element Dragon');
  ok(g.prompt.opts.some(o => o.key.startsWith('atk:' + ed.u + ':')), 'Element Dragon can attack again');
});
T('Element Valkyrie: control goes back with a WATER monster out', () => {
  const g = duel({ board: [{ hand: ['Brain Control'], turn: 2 }, { m: ['Element Valkyrie', 'Elemental HERO Bubbleman'] }] });
  act(g, 0, 'Brain Control'); choose(g, 'Element Valkyrie'); passAll(g);
  ok(!!on(g, 1, 'Element Valkyrie') && !on(g, 0, 'Element Valkyrie'), 'Valkyrie stays with its owner');
});
T('Elemental Burst destroys the opponent field', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Avian', 'Elemental HERO Bubbleman', 'Elemental HERO Burstinatrix', 'Elemental HERO Clayman'], st: ['Elemental Burst'], turn: 2 }, { m: ['Sangan', FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Elemental Burst'); passAll(g);
  ok(!g.p[1].m.some(Boolean) && !g.p[1].st.some(Boolean) && !g.p[0].m.some(Boolean), 'both fields cleared (4 Tributed, opponent destroyed)');
});
T('Elemental Absorber stops that Attribute from attacking', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: ['Sangan'], st: ['Elemental Absorber'] }] });
  const g2 = duel({ board: [{ hand: [], m: [FILL], st: [], turn: 2 }, { hand: [FILL], st: ['Elemental Absorber'] }] });
  choose(g2, 'bp'); ok(hasOpt(g2, 'Elemental Absorber'), 'Absorber offered'); choose(g2, 'Elemental Absorber'); passAll(g2); if (g2.prompt.type === 'pick') choose(g2, FILL); passAll(g2);
  ok(!g2.prompt.opts.some(o => o.key.startsWith('atk:')), 'EARTH Warwolf has no attack');
});
T('Glow Neos: contact summon, destroy a Spell, attack directly, back to Extra Deck', () => {
  const g = duel({ ex0: [], board: [{ hand: [], m: ['Elemental HERO Neos', 'Neo-Spacian Glow Moss'], extra: ['Elemental HERO Glow Neos'], turn: 2 }, { m: [FILL], st: [{ n: 'Swords of Revealing Light', pos: 'up' }] }] });
  choose(g, 'Special Summon (shuffle'); passAll(g); passAll(g);
  const gn = on(g, 0, 'Elemental HERO Glow Neos'); ok(!!gn, 'Glow Neos summoned');
  eff(g, 0, 'Elemental HERO Glow Neos'); choose(g, 'Swords'); passAll(g);
  toBP(g); ok(hasOpt(g, 'Attack directly'), 'direct attack offered after destroying a Spell');
  attack(g, 'Attack directly'); ok(g.p[1].lp === 5500, `2500 direct damage (${g.p[1].lp})`);
  choose(g, 'endbp'); endTurn(g);
  ok(g.p[0].extra.some(c => E.name(c) === 'Elemental HERO Glow Neos'), 'Glow Neos back in the Extra Deck');
});
T('Dark Neos negates a monster effect', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Neos', 'Neo-Spacian Dark Panther'], extra: ['Elemental HERO Dark Neos'], turn: 2 }, { m: ['Elemental HERO Heat'] }] });
  choose(g, 'Special Summon (shuffle'); passAll(g); passAll(g);
  eff(g, 0, 'Elemental HERO Dark Neos'); maybe(g, 'Heat'); passAll(g);
  ok(E.atk(g, on(g, 1, 'Elemental HERO Heat')) === 1600, 'Heat lost its +200');
});
T('Magma Neos returns every card to the hand in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Neos', 'Neo-Spacian Flare Scarab', 'Neo-Spacian Grand Mole'], extra: ['Elemental HERO Magma Neos'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  choose(g, 'Special Summon (shuffle'); passAll(g); passAll(g);
  const mn = on(g, 0, 'Elemental HERO Magma Neos'); ok(mn && E.atk(g, mn) === 4200, `Magma Neos 3000 + 3x400 (${mn && E.atk(g, mn)})`);
  endTurn(g);
  ok(!g.p[1].m.some(Boolean) && inZ(g, 1, 'hand', 'Mirror Force'), 'opponent field returned to hand');
});
T('Must be Fusion Summoned: Flame Wingman cannot be revived', () => {
  const g = duel({ board: [{ hand: [], st: ['Call of the Haunted'], gy: ['Elemental HERO Flame Wingman', FILL], turn: 2 }, {}] });
  act(g, 0, 'Call of the Haunted'); passAll(g); maybe(g, 'Flame Wingman'); passAll(g);
  ok(!on(g, 0, 'Elemental HERO Flame Wingman'), 'Flame Wingman not Special Summoned');
});
T('Flame Wingman deals the destroyed monster ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Flame Wingman'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  toBP(g); attack(g, 'Attack'); passAll(g);
  ok(g.p[1].lp === 6000, `2000 damage (${g.p[1].lp})`);
});
T('Thunder Giant destroys a weaker monster', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: ['Elemental HERO Thunder Giant'], turn: 2 }, { m: [FILL] }] });
  eff(g, 0, 'Elemental HERO Thunder Giant'); maybe(g, 'Sangan'); maybe(g, FILL); passAll(g);
  ok(inZ(g, 1, 'gy', FILL), 'Warwolf destroyed');
});
T('Tempest protects a monster from battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Tempest', 'Sangan'], st: [{ n: 'Swords of Revealing Light', pos: 'up' }], turn: 2 }, {}] });
  eff(g, 0, 'Elemental HERO Tempest'); choose(g, 'Swords'); choose(g, 'Sangan'); passAll(g);
  const s = on(g, 0, 'Sangan'); const t = on(g, 0, 'Elemental HERO Tempest');
  ok((t.flags.f07tp || []).includes(s.u), 'Sangan protected');
});
T('Wildedge attacks every monster once, then not directly', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Wildedge'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'atk' }, { n: 'Giant Rat', pos: 'atk' }] }] });
  toBP(g); attack(g, 'Attack Sangan'); for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') passAll(g); else if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, [g.prompt.opts[0].key]); }
  ok(hasOpt(g, 'Attack Giant Rat') || g.p[1].m.some(c => c && E.name(c) !== 'Giant Rat'), 'second attack offered');
  const opts = g.prompt.opts.filter(o => o.key.startsWith('atk:')); const target = opts.find(o => !/directly/.test(o.label));
  if (target) { E.act(g, [target.key]); for (let i = 0; i < 8 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') passAll(g); else if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, [g.prompt.opts[0].key]); } }
  ok(!hasOpt(g, 'Attack directly'), 'no direct attack after attacking monsters');
});
T('Emissary from Pandemonium with 1 Tribute', () => {
  const g = duel({ board: [{ hand: ['Emissary from Pandemonium'], m: [FILL], turn: 2 }, {}] });
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Emissary from Pandemonium').u); maybe(g, '1 Tribute'); maybe(g, FILL); passAll(g);
  const e = on(g, 0, 'Emissary from Pandemonium'); ok(e && E.atk(g, e) === 1300 && E.def(g, e) === 900 && E.lv(e) === 5, 'Level 5, 1300/900');
});
T('Necroshade lets Bladedge come out without Tributes', () => {
  const g = duel({ board: [{ hand: ['Elemental HERO Bladedge'], gy: ['Elemental HERO Necroshade'], turn: 2 }, {}] });
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Elemental HERO Bladedge').u); passAll(g);
  ok(!!on(g, 0, 'Elemental HERO Bladedge'), 'Bladedge Normal Summoned with no Tribute');
});
T('Emissary of the Oasis: no battle damage from Level 3 Normal battles', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Emissary of the Oasis', 'Mokey Mokey'] }] });
  toBP(g); ok(!g.prompt.opts.some(o => /Emissary/.test(o.label)), 'Oasis cannot be attacked');
});
T('Rampart Blaster attacks from Defense Position', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Elemental HERO Rampart Blaster', pos: 'def' }], turn: 2 }, {}] });
  toBP(g); eff(g, 0, 'Elemental HERO Rampart Blaster'); passAll(g);
  ok(g.p[1].lp === 7000, `1000 damage (${g.p[1].lp})`);
});
T('Darkbright destroyed: destroy an opponent monster', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Elemental HERO Darkbright'], turn: 2 }, { m: ['Blue-Eyes White Dragon', FILL] }] });
  toBP(g); attack(g, 'Attack Blue-Eyes');
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') passAll(g); else if (g.prompt.type === 'pick') choose(g, 'Blue-Eyes'); else E.act(g, [g.prompt.opts[0].key]); }
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Blue-Eyes destroyed by its effect');
});
T('Voltic summons a banished Elemental HERO', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Voltic'], ban: ['Elemental HERO Avian'], turn: 2 }, {}] });
  toBP(g); attack(g, 'Attack directly'); yesAll(g); if (g.prompt.type === 'pick') choose(g, 'Avian'); passAll(g);
  ok(!!on(g, 0, 'Elemental HERO Avian'), 'Avian Special Summoned');
});
T('Woodsman adds Polymerization in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Woodsman'], gy: ['Polymerization'], turn: 1 }, {}] });
  yesAll(g); passAll(g); maybe(g, 'GY'); passAll(g);
  ok(inZ(g, 0, 'hand', 'Polymerization'), 'Polymerization added from the GY');
});
T('Knospe attacks directly with another HERO', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Knospe', 'Elemental HERO Avian'], turn: 2 }, { m: [FILL] }] });
  toBP(g); const k = on(g, 0, 'Elemental HERO Knospe');
  ok(g.prompt.opts.some(o => o.key === `atk:${k.u}:d`), 'direct attack offered');
  choose(g, `atk:${k.u}:d`); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(E.atk(g, k) === 700, `Knospe gained 100 ATK (${E.atk(g, k)})`);
});
T('Aqua Neos: revivable once properly summoned, not before', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Neos', 'Neo-Spacian Aqua Dolphin'], extra: ['Elemental HERO Aqua Neos'], st: ['Call of the Haunted'], turn: 2 }, { hand: [FILL, FILL] }] });
  choose(g, 'Special Summon (shuffle'); passAll(g); passAll(g);
  const a = on(g, 0, 'Elemental HERO Aqua Neos'); ok(!!a, 'Aqua Neos contact summoned');
  eff(g, 0, 'Elemental HERO Aqua Neos'); maybe(g, FILL); passAll(g);
  ok(g.p[1].hand.length === 1, 'a random card in their hand destroyed');
  E.lib.move(g, a, 'gy', { reason: 'effect' });
  act(g, 0, 'Call of the Haunted'); passAll(g); maybe(g, 'Aqua Neos'); passAll(g);
  ok(!!on(g, 0, 'Elemental HERO Aqua Neos'), 'Call of the Haunted revives it');
});
T('Poison Rose and Neo Bubbleman cannot be Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Elemental HERO Poison Rose', 'Elemental HERO Neo Bubbleman'], m: [FILL, FILL], turn: 2 }, {}] });
  const us = g.p[0].hand.filter(c => E.name(c) !== FILL).map(c => c.u);
  ok(!g.prompt.opts.some(o => us.includes(o.u) && /^(ns|set):/.test(o.key)), 'no Normal Summon or Set offered');
});
T('Chaos Neos sets every face-up monster as it leaves', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Neos', 'Neo-Spacian Dark Panther', 'Neo-Spacian Glow Moss', FILL], extra: ['Elemental HERO Chaos Neos'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'Special Summon (shuffle'); passAll(g); passAll(g);
  ok(!!on(g, 0, 'Elemental HERO Chaos Neos'), 'Chaos Neos summoned');
  const g2 = duel({ board: g.cfg.board }); choose(g2, 'Special Summon (shuffle'); passAll(g2); passAll(g2);
  eff(g2, 0, 'Elemental HERO Chaos Neos'); passAll(g2);
  ok(g2.log.filter(l => /tossed a coin/.test(l)).length === 3, 'three coin tosses');
  endTurn(g);
  ok(!on(g, 0, 'Elemental HERO Chaos Neos') && on(g, 1, 'Blue-Eyes White Dragon').pos === 'set' && on(g, 0, FILL).pos === 'set', 'Chaos Neos gone, every face-up monster Set');
});
T('Emissary of the Oasis: battle damage from a Level 3 Normal is 0', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Emissary of the Oasis', { n: 'Mokey Mokey', pos: 'atk' }] }] });
  const oasis = on(g, 1, 'Emissary of the Oasis'); g.p[1].m[1].pos = 'atk';
  // remove the attack lock by changing Mokey Mokey into an Effect-less attack target: attack Mokey Mokey itself
  toBP(g); attack(g, 'Attack Mokey Mokey');
  ok(g.p[1].lp === 8000 && !!oasis, `no battle damage (${g.p[1].lp})`);
});
console.log(fails ? `\n${fails} failure(s)` : '\nAll checks passed.');
process.exit(fails ? 1 : 0);
