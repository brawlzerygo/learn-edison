// Scenario checks for full batch 06: node build/test_full-06.js
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
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

// Test stand-ins for cards other batches script (only when they are missing)
if (!E.hasScript('Polymerization')) E.addScripts({ 'Polymerization': { effs: [{ type: 'act', cond: (g, c, p) => E.lib.canFusion(g, p), res: function* (g, c, p) { yield* E.lib.fusionSummon(g, p, { from: ['hand', 'm'] }); } }] } });
if (!E.hasScript('Umi')) E.addScripts({ 'Umi': { effs: [{ type: 'act', res: function* () {} }] } });
const P = g => g.prompt ? `${g.prompt.p} ${g.prompt.type} "${g.prompt.text}": ${g.prompt.opts.map(o => o.label + '[' + o.key + ']').join(', ')}` : 'no prompt';
const lp = (g, p) => g.p[p].lp;
const respondUntilIdle = (g, n = 30) => { for (let i = 0; i < n && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'choose' && /position/i.test(g.prompt.text)) E.act(g, [g.prompt.opts[0].key]); else break; } };
const pk = (g, n) => { if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, n || g.prompt.min).map(o => o.key)); };
const attack = (g, an, tn) => { const a = on(g, 0, an); const key = 'atk:' + a.u + ':' + (tn ? on(g, 1, tn).u : 'd'); choose(g, key); };

T('Dark Scorpion - Chick puts their top card on the bottom', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Scorpion - Chick the Yellow'], turn: 2 }, { deckTop: ['Mirror Force'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Dark Scorpion - Chick the Yellow'); passAll(g); passAll(g); passAll(g);
  yesAll(g); choose(g, 'Look at the top'); passAll(g); choose(g, 'bottom');
  ok(E.name(g.p[1].deck[0]) === 'Mirror Force' && lp(g, 1) === 7000, 'Mirror Force went to the bottom after 1000 damage');
});
T('Dark Scorpion - Gorg spins a monster to the top of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Scorpion - Gorg the Strong'], turn: 2 }, { m: ['Des Koala', { n: 'Cyber Dragon', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Dark Scorpion - Gorg the Strong', 'Des Koala'); passAll(g); passAll(g); passAll(g);
  yesAll(g); choose(g, 'Return 1 of their'); choose(g, 'Cyber Dragon'); passAll(g);
  ok(lp(g, 1) === 7300 && E.name(g.p[1].deck[g.p[1].deck.length - 1]) === 'Cyber Dragon', 'Gorg dealt 700 and put Cyber Dragon on top of the Deck');
});
T('Dark Master - Zorc rolls and destroys', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Master - Zorc'] }, { m: ['Cyber Dragon', FILL] }] });
  choose(g, 'Roll a die'); passAll(g); for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]);
  const r = +g.log.find(l => /rolled a/.test(l)).match(/rolled a (\d)/)[1];
  const n1 = g.p[1].m.filter(Boolean).length, z = !!on(g, 0, 'Dark Master - Zorc');
  ok(r <= 2 ? n1 === 0 && z : r <= 5 ? n1 === 1 && z : n1 === 2 && !z, `roll ${r}: their monsters ${n1}, Zorc ${z ? 'stays' : 'gone'}`);
});
T('Darkness Approaches Sets a face-up monster', () => {
  const g = duel({ board: [{ hand: ['Darkness Approaches', FILL, FILL] }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Darkness Approaches'); pk(g); passAll(g);
  ok(on(g, 1, 'Cyber Dragon').pos === 'set' && g.p[0].gy.length === 3, 'Cyber Dragon is face-down, 2 cards discarded');
});
T('Darkness Destroyer attacks twice with piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Darkness Destroyer'], turn: 2 }, { m: [{ n: 'Des Koala', pos: 'set' }, { n: 'Des Feral Imp', pos: 'set' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); respondUntilIdle(g);
  ok(hasOpt(g, 'Attack the face-down'), 'second attack offered'); choose(g, 'Attack the face-down'); respondUntilIdle(g);
  ok(lp(g, 1) < 8000 && g.p[1].m.filter(Boolean).length === 0, `both destroyed, piercing damage (B ${lp(g, 1)})`);
});
T('Darkness Neosphere comes out when the opponent attacks', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { hand: ['Darkness Neosphere', 'Des Wombat', 'Dark Master - Zorc'], m: ['Darkness Destroyer'] }] });
  // Gene-Warped Warwolf is a Fiend: it and a Fiend in hand (Zorc) pay for Neosphere
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Darkness Destroyer');
  ok(g.prompt.type === 'yesno' && g.prompt.p === 1, 'B is asked about Neosphere'); choose(g, 'yes');
  for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]);
  passAll(g);
  ok(!!on(g, 1, 'Darkness Neosphere'), 'Neosphere is on the field');
});
T('De-Synchro returns a Synchro and revives its materials', () => {
  const g = duel({ ex0: ['Ally of Justice Catastor'], board: [{ hand: ['De-Synchro'], m: ['Junk Synchron', 'Morphing Jar'] }, {}] });
  choose(g, 'syn:'); choose(g, 'Attack Position'); respondUntilIdle(g);
  ok(!!on(g, 0, 'Ally of Justice Catastor'), 'Catastor Synchro Summoned');
  act(g, 0, 'De-Synchro'); passAll(g); yesAll(g); respondUntilIdle(g);
  ok(on(g, 0, 'Junk Synchron') && on(g, 0, 'Morphing Jar') && g.p[0].extra.some(x => E.name(x) === 'Ally of Justice Catastor'), 'materials back, Catastor in the Extra Deck');
  const g2 = duel({ ex0: ['Ally of Justice Catastor'], board: [{ hand: ['De-Synchro'], m: ['Junk Synchron', 'Morphing Jar'] }, {}] });
  choose(g2, 'syn:'); choose(g2, 'Attack Position'); respondUntilIdle(g2);
  const jar = g2.p[0].gy.find(x => E.name(x) === 'Morphing Jar'); g2.p[0].gy.splice(g2.p[0].gy.indexOf(jar), 1); jar.zone = 'ban'; g2.p[0].ban.push(jar);
  act(g2, 0, 'De-Synchro'); passAll(g2);
  ok(!g2.prompt || g2.prompt.type !== 'yesno', 'no revive when a material is missing');
  ok(!on(g2, 0, 'Junk Synchron'), 'Junk Synchron stays in the GY');
});
T('De-Fusion after Polymerization', () => {
  const g = duel({ ex0: ['Elemental HERO Flame Wingman'], board: [{ hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix', 'De-Fusion'] }, {}] });
  act(g, 0, 'Polymerization'); passAll(g); respondUntilIdle(g);
  ok(!!on(g, 0, 'Elemental HERO Flame Wingman'), 'Flame Wingman summoned');
  act(g, 0, 'De-Fusion'); passAll(g); yesAll(g); respondUntilIdle(g);
  ok(on(g, 0, 'Elemental HERO Avian') && on(g, 0, 'Elemental HERO Burstinatrix'), 'Avian and Burstinatrix are back');
});
T('De-Spell reveals a Set Trap and leaves it', () => {
  const g = duel({ board: [{ hand: ['De-Spell'] }, { st: ['Mirror Force'] }] });
  act(g, 0, 'De-Spell'); passAll(g);
  ok(inZ(g, 1, 'st', 'Mirror Force'), 'Mirror Force stays');
});
T('Deepsea Shark is a Fusion of Bottom Dweller and Tongyo', () => {
  const g = duel({ ex0: ['Deepsea Shark'], board: [{ hand: ['Polymerization', 'Bottom Dweller', 'Tongyo'] }, {}] });
  act(g, 0, 'Polymerization'); passAll(g); respondUntilIdle(g);
  ok(!!on(g, 0, 'Deepsea Shark'), 'Deepsea Shark summoned');
});
T('Deepsea Macrotrema pumps WATER monsters when it leaves', () => {
  const g2 = duel({ board: [{ hand: [], m: ['Deepsea Macrotrema', 'The Six Samurai - Yaichi'], st: [{ n: 'Destruction Ring', pos: 'set' }] }, {}] });
  act(g2, 0, 'Destruction Ring'); choose(g2, 'Deepsea Macrotrema'); respondUntilIdle(g2);
  ok(E.atk(g2, on(g2, 0, 'The Six Samurai - Yaichi')) === 1800, 'Yaichi has 1800 ATK');
  ok(lp(g2, 0) === 7000 && lp(g2, 1) === 7000, 'Destruction Ring: 1000 to both');
});
T('Deepsea Warrior is not destroyed by Spells with Umi', () => {
  const g = duel({ board: [{ hand: ['Umi', 'Dark Hole'], m: ['Deepsea Warrior'] }, { m: [FILL] }] });
  act(g, 0, 'Umi'); passAll(g); act(g, 0, 'Dark Hole'); passAll(g);
  ok(!!on(g, 0, 'Deepsea Warrior') && !on(g, 1, FILL), 'Deepsea Warrior survives Dark Hole');
});
T('Des Counterblow destroys a direct attacker', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: [{ n: 'Des Counterblow', pos: 'up' }] }] });
  choose(g, 'bp'); passAll(g); attack(g, FILL); respondUntilIdle(g);
  ok(lp(g, 1) === 6000 && !on(g, 0, FILL), 'damage taken, attacker destroyed');
});
T('Des Croaking with 3 Des Frogs', () => {
  const g = duel({ board: [{ hand: ['Des Croaking'], m: ['Des Frog', 'Des Frog', 'Des Frog'] }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Des Croaking'); passAll(g);
  ok(g.p[1].m.every(x => !x) && g.p[1].st.every(x => !x), 'their field is empty');
});
T('Des Frog Tribute Summon brings Des Frogs per T.A.D.P.O.L.E.', () => {
  const g = duel({ board: [{ hand: ['Des Frog', 'Des Frog'], m: [FILL], gy: ['T.A.D.P.O.L.E.'], deckTop: ['Des Frog'] }, {}] });
  choose(g, 'ns:' + g.p[0].hand.find(x => E.name(x) === 'Des Frog').u); pk(g); passAll(g); yesAll(g); pk(g); respondUntilIdle(g);
  ok(g.p[0].m.filter(x => x && E.name(x) === 'Des Frog').length === 2, 'two Des Frogs on the field');
});
T('Des Kangaroo destroys a weaker attacker', () => {
  const g = duel({ board: [{ hand: [], m: ['Des Koala'], turn: 2 }, { m: [{ n: 'Des Kangaroo', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Des Koala', 'Des Kangaroo'); respondUntilIdle(g);
  ok(!on(g, 0, 'Des Koala') && lp(g, 0) === 7400, 'Koala destroyed, 600 damage');
});
T('Des Mosquito survives battle by removing a counter', () => {
  const g = duel({ board: [{ hand: ['Des Mosquito'] }, {}] });
  choose(g, 'ns:'); respondUntilIdle(g);
  const m = on(g, 0, 'Des Mosquito'); ok(E.atk(g, m) === 1500, 'Des Mosquito has 1500 ATK');
  const g2 = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { hand: [], m: ['Des Mosquito'] }] });
  on(g2, 1, 'Des Mosquito').ctr = { mosquito: 2 };
  choose(g2, 'bp'); passAll(g2); attack(g2, 'Cyber Dragon', 'Des Mosquito'); respondUntilIdle(g2);
  const m2 = on(g2, 1, 'Des Mosquito'); ok(m2 && E.atk(g2, m2) === 1000, 'it survived with 1 counter');
});
T('Des Volstgalph burns and grows', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Des Volstgalph'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Mystical Space Typhoon'); pk(g); respondUntilIdle(g);
  ok(E.atk(g, on(g, 0, 'Des Volstgalph')) === 2400, 'Volstgalph has 2400 ATK');
  choose(g, 'bp'); passAll(g); attack(g, 'Des Volstgalph', FILL); respondUntilIdle(g);
  ok(lp(g, 1) === 8000 - 400 - 500, `400 battle and 500 effect damage (B ${lp(g, 1)})`);
});
T('Des Wombat stops effect damage', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Des Koala', pos: 'set' }], turn: 3 }, { m: ['Des Wombat'] }] });
  choose(g, 'flip:'); respondUntilIdle(g);
  ok(lp(g, 1) === 8000, 'no Koala damage');
});
T('Des Dendle equips to Vampiric Orchis, makes a token, takes the hit', () => {
  const g = duel({ board: [{ hand: [], m: ['Des Dendle', 'Vampiric Orchis'], turn: 2 }, { m: ['Des Koala', 'Cyber Dragon'] }] });
  choose(g, 'Equip to Vampiric Orchis'); passAll(g);
  ok(inZ(g, 0, 'st', 'Des Dendle'), 'Des Dendle is equipped');
  choose(g, 'bp'); passAll(g); attack(g, 'Vampiric Orchis', 'Des Koala'); respondUntilIdle(g);
  ok(g.p[0].m.some(x => x && E.name(x) === 'Wicked Plant Token'), 'Wicked Plant Token summoned');
  attack(g, 'Wicked Plant Token', 'Cyber Dragon'); respondUntilIdle(g);
  const g2 = duel({ board: [{ hand: [], m: ['Des Dendle', 'Vampiric Orchis'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g2, 'Equip to Vampiric Orchis'); passAll(g2); choose(g2, 'bp'); passAll(g2); attack(g2, 'Vampiric Orchis', 'Cyber Dragon'); respondUntilIdle(g2);
  ok(on(g2, 0, 'Vampiric Orchis') && inZ(g2, 0, 'gy', 'Des Dendle'), 'Orchis survives, Des Dendle destroyed instead');
});
T('Des Feral Imp shuffles a GY card into the Deck', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Des Feral Imp', pos: 'set' }], gy: ['Mirror Force'], turn: 3 }, {}] });
  const n = g.p[0].deck.length; choose(g, 'flip:'); pk(g); respondUntilIdle(g);
  ok(!inZ(g, 0, 'gy', 'Mirror Force') && g.p[0].deck.length === n + 1, 'Mirror Force went back to the Deck');
});
T('Desert Protector gains DEF and dies for an Insect', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: ['Mirror Force'], turn: 2 }, { m: ['Desert Protector', 'Insect Knight'], st: ['Mirror Force'] }] });
  ok(E.def(g, on(g, 1, 'Desert Protector')) === 1600, 'DEF 1000 + 2 x 300');
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Insect Knight'); for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']);
  ok(on(g, 1, 'Insect Knight') && !on(g, 1, 'Desert Protector') && lp(g, 1) === 7800, 'Insect Knight survives the battle, Protector destroyed instead');
});
T('Desert Sunlight flips your monsters face-up in Defense', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Des Koala', pos: 'set' }], st: ['Desert Sunlight'] }] });
  const h = g.p[0].hand.length;
  choose(g, 'bp'); passAll(g); attack(g, FILL, 'Des Koala'); ok(hasOpt(g, 'Desert Sunlight'), 'Desert Sunlight offered'); choose(g, 'Desert Sunlight'); passAll(g);
  const k = on(g, 1, 'Des Koala'); ok(!k || k.pos !== 'set', 'Des Koala was flipped face-up');
  respondUntilIdle(g); ok(lp(g, 0) === 8000 - 400 * h, `Koala's Flip effect dealt ${400 * h}`);
});
T('Desert Twister: summon rule and Spell/Trap destruction', () => {
  const g = duel({ board: [{ hand: ['Desert Twister', FILL], gy: ['Elemental HERO Avian', 'Gladiator Beast Bestiari', 'Gene-Warped Warwolf'] }, { st: ['Mirror Force'] }] });
  choose(g, 'sp:'); respondUntilIdle(g);
  ok(!!on(g, 0, 'Desert Twister') && g.p[0].ban.length === 3, 'summoned by banishing 3');
  choose(g, 'Discard 1'); pk(g); pk(g); passAll(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Destiny End Dragoon destroys and burns, and comes back only if Fusion Summoned', () => {
  const g = duel({ ex0: ['Destiny End Dragoon'], board: [{ hand: ['Polymerization', 'Destiny HERO - Plasma', 'Destiny HERO - Dogma'] }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Polymerization'); passAll(g); respondUntilIdle(g);
  ok(!!on(g, 0, 'Destiny End Dragoon'), 'Dragoon Fusion Summoned');
  choose(g, 'Destroy a monster'); passAll(g);
  ok(!on(g, 1, 'Cyber Dragon') && lp(g, 1) === 5900 && !hasOpt(g, 'bp'), '2100 damage and no Battle Phase');
  const g2 = duel({ board: [{ hand: [], gy: ['Destiny End Dragoon', 'Destiny HERO - Plasma'], turn: 3 }, {}] });
  ok(!(g2.prompt.type === 'yesno' && /Dragoon/.test(g2.prompt.text)), 'not offered when it was never Fusion Summoned');
});
T('Destiny Signal summons a Destiny HERO after a battle loss', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: ['Destiny Signal'], deckTop: ['Destiny HERO - Diamond Dude'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', FILL); for (let i = 0; i < 8 && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']);
  ok(g.prompt && g.prompt.type === 'yesno' && g.prompt.p === 1, 'B is asked about Destiny Signal'); choose(g, 'yes'); passAll(g); pk(g); respondUntilIdle(g);
  ok(!!on(g, 1, 'Destiny HERO - Diamond Dude'), 'Diamond Dude Special Summoned');
});
T('Destruction Cyclone destroys face-down and non-WIND monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon', 'Gladiator Beast Bestiari'], turn: 2 }, { m: ['Destruction Cyclone', { n: 'Des Koala', pos: 'set' }] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Destruction Cyclone'); respondUntilIdle(g);
  ok(!on(g, 0, 'Cyber Dragon') && on(g, 0, 'Gladiator Beast Bestiari') && !g.p[1].m.some(Boolean), 'only the WIND Bestiari is left');
});
T('Destruction Jammer negates Dark Hole', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [FILL] }, { hand: [FILL], m: [FILL], st: ['Destruction Jammer'] }] });
  act(g, 0, 'Dark Hole'); ok(hasOpt(g, 'Destruction Jammer'), 'Jammer offered'); choose(g, 'Destruction Jammer'); pk(g); passAll(g);
  ok(on(g, 0, FILL) && on(g, 1, FILL) && inZ(g, 0, 'gy', 'Dark Hole'), 'monsters survive');
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [FILL] }, { hand: [FILL], st: ['Destruction Jammer', 'Mirror Force'] }] });
  act(g2, 0, 'Mystical Space Typhoon'); choose(g2, 'u' + g2.p[1].st[1].u); ok(!hasOpt(g2, 'Destruction Jammer'), 'not offered against MST');
});
T('Destruction of Destiny mills 3 and burns for Spells/Traps', () => {
  const g = duel({ board: [{ hand: [] }, { st: ['Destruction of Destiny'], deckTop: ['Mirror Force', FILL, 'Dark Hole'] }] });
  choose(g, 'end');
  ok(hasOpt(g, 'Destruction of Destiny'), 'offered in the End Phase'); choose(g, 'Destruction of Destiny'); passAll(g);
  ok(lp(g, 1) === 6000, `2000 damage (B ${lp(g, 1)})`);
});
T('Destruction Punch destroys an attacker that hits a higher DEF', () => {
  const g = duel({ board: [{ hand: [], m: ['Des Koala'], turn: 2 }, { m: [{ n: 'Morphtronic Boarden', pos: 'def' }], st: ['Destruction Punch'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Des Koala', 'Morphtronic Boarden'); choose(g, 'Destruction Punch'); respondUntilIdle(g);
  ok(!on(g, 0, 'Des Koala') && lp(g, 0) === 7300, `Koala destroyed after 700 damage (A ${lp(g, 0)})`);
});
T('Dice Jar: the lower roll takes damage', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Dice Jar', pos: 'set' }], turn: 3 }, {}] });
  choose(g, 'flip:'); respondUntilIdle(g);
  ok(lp(g, 0) < 8000 || lp(g, 1) < 8000, `someone took damage (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Dice Re-Roll lets Zorc roll again', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Master - Zorc'], st: ['Dice Re-Roll'] }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Dice Re-Roll'); passAll(g);
  choose(g, 'Roll a die'); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && /Dice Re-Roll/.test(g.prompt.text), 'asked to re-roll'); choose(g, 'yes'); pk(g);
  ok(g.log.filter(l => /rolled a/.test(l)).length === 2, 'two rolls logged');
});
T('Dice Try! negates Zorc', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Master - Zorc'] }, { m: ['Cyber Dragon'], st: ['Dice Try!'] }] });
  choose(g, 'Roll a die'); ok(hasOpt(g, 'Dice Try'), 'Dice Try! offered'); choose(g, 'Dice Try'); passAll(g);
  ok(!on(g, 0, 'Dark Master - Zorc') && on(g, 1, 'Cyber Dragon'), 'Zorc destroyed, no roll');
});
T('Destiny Mirage revives Destiny HEROes destroyed by an opponent\'s effect', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'] }, { m: ['Destiny HERO - Diamond Dude', 'Destiny HERO - Dunker'], st: ['Destiny Mirage'] }] });
  act(g, 0, 'Dark Hole'); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && g.prompt.p === 1, 'B is asked about Destiny Mirage'); choose(g, 'yes'); respondUntilIdle(g);
  ok(on(g, 1, 'Destiny HERO - Diamond Dude') && on(g, 1, 'Destiny HERO - Dunker'), 'both Destiny HEROes are back');
});
T('Different Dimension Capsule adds the card on the 2nd Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Different Dimension Capsule'], deckTop: [FILL, 'Mirror Force'] }, {}] });
  act(g, 0, 'Different Dimension Capsule'); choose(g, 'Mirror Force'); passAll(g);
  ok(inZ(g, 0, 'st', 'Different Dimension Capsule') && inZ(g, 0, 'ban', 'Mirror Force'), 'Capsule stays, Mirror Force banished');
  for (let t = 0; t < 200 && g.prompt && !(g.turnNo === 5 && g.prompt.type === 'idle'); t++) { const pr = g.prompt; if (pr.type === 'idle') choose(g, 'end'); else if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'pick') pk(g); else if (pr.type === 'yesno') choose(g, 'no'); else E.act(g, [pr.opts[0].key]); }
  ok(inZ(g, 0, 'hand', 'Mirror Force') && inZ(g, 0, 'gy', 'Different Dimension Capsule') && g.turnNo === 5, `added on turn 5 (turn ${g.turnNo})`);
});
T('Different Dimension Dragon survives a weak attacker and Dark Hole', () => {
  const g = duel({ board: [{ hand: [], m: ['Des Koala'], turn: 2 }, { m: ['Different Dimension Dragon'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Des Koala', 'Different Dimension Dragon'); respondUntilIdle(g);
  ok(!!on(g, 1, 'Different Dimension Dragon') && !on(g, 0, 'Des Koala'), 'Dragon wins against a 1100 ATK monster');
  const g2 = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Different Dimension Dragon'] }] });
  choose(g2, 'bp'); passAll(g2); attack(g2, 'Cyber Dragon', 'Different Dimension Dragon'); respondUntilIdle(g2);
  ok(!on(g2, 1, 'Different Dimension Dragon'), 'destroyed by a 2100 ATK monster');
});
T('Different Dimension Gate banishes and returns', () => {
  const g = duel({ board: [{ hand: ['Different Dimension Gate', 'Mystical Space Typhoon'], m: [FILL] }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Different Dimension Gate'); passAll(g);
  ok(inZ(g, 0, 'ban', FILL) && inZ(g, 1, 'ban', 'Cyber Dragon'), 'both banished');
  act(g, 0, 'Mystical Space Typhoon'); pk(g); respondUntilIdle(g);
  ok(on(g, 0, FILL) && on(g, 1, 'Cyber Dragon'), 'both returned');
});
T('Dimension Distortion needs an empty GY', () => {
  const g = duel({ board: [{ hand: ['Dimension Distortion'], ban: ['Cyber Dragon'] }, {}] });
  act(g, 0, 'Dimension Distortion'); passAll(g);
  ok(!!on(g, 0, 'Cyber Dragon'), 'Cyber Dragon Special Summoned');
  const g2 = duel({ board: [{ hand: ['Dimension Distortion'], ban: ['Cyber Dragon'], gy: [FILL] }, {}] });
  ok(!hasOpt(g2, 'a:' + g2.p[0].hand.find(x => E.name(x) === 'Dimension Distortion').u + ':'), 'not offered with a card in the GY');
});
T('Dimension Explosion summons up to 2 banished monsters each', () => {
  const g = duel({ board: [{ hand: ['Dimension Explosion'], m: ['Thousand-Eyes Restrict'], ban: ['Cyber Dragon', FILL] }, { ban: ['Des Koala'] }] });
  act(g, 0, 'Dimension Explosion'); pk(g, 2); pk(g, 1); passAll(g);
  ok(on(g, 0, 'Cyber Dragon') && on(g, 0, FILL) && on(g, 1, 'Des Koala') && !on(g, 0, 'Thousand-Eyes Restrict'), 'three summoned, Restrict returned');
});
T('Dimension Fortress Weapon stops Foolish Burial', () => {
  const g = duel({ board: [{ hand: ['Foolish Burial'] }, { m: ['Dimension Fortress Weapon'] }] });
  ok(!hasOpt(g, 'a:' + g.p[0].hand[0].u + ':'), 'Foolish Burial cannot be activated');
});
T('Dimension Fusion summons both sides, but not face-down or unproper ones', () => {
  const g = duel({ board: [{ hand: ['Dimension Fusion'], ban: ['Cyber Dragon', 'Destiny End Dragoon'] }, { ban: ['Des Koala'] }] });
  act(g, 0, 'Dimension Fusion'); passAll(g);
  ok(on(g, 0, 'Cyber Dragon') && on(g, 1, 'Des Koala') && !on(g, 0, 'Destiny End Dragoon') && lp(g, 0) === 6000, 'Cyber Dragon and Koala back, Dragoon stays');
});
T('Dimension Jar banishes from the opponent\'s GY', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Dimension Jar', pos: 'set' }], gy: ['Mirror Force'], turn: 3 }, { gy: ['Cyber Dragon', FILL] }] });
  choose(g, 'flip:'); pk(g, 2); pk(g, 1); respondUntilIdle(g);
  ok(g.p[1].gy.length === 0 && g.p[0].gy.length === 0, 'both GYs emptied');
});
T('Dimension Wall sends the battle damage back', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { st: ['Dimension Wall'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon'); choose(g, 'Dimension Wall'); respondUntilIdle(g);
  ok(lp(g, 0) === 5900 && lp(g, 1) === 8000, `A took 2100 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Divine Dragon Aquabizarre returns a Continuous Spell', () => {
  const g = duel({ board: [{ hand: [], m: ['Divine Dragon Aquabizarre', 'The Six Samurai - Yaichi'], gy: ['Different Dimension Gate'] }, {}] });
  choose(g, 'Tribute a WATER'); passAll(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Different Dimension Gate', 'Gate is on top of the Deck');
});
T('Divine Knight Ishzark banishes what it destroys', () => {
  const g = duel({ board: [{ hand: [], m: ['Divine Knight Ishzark'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Divine Knight Ishzark', FILL); respondUntilIdle(g);
  ok(inZ(g, 1, 'ban', FILL), 'Warwolf banished');
});
T('Divine Wrath negates a monster effect', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Master - Zorc'] }, { hand: [FILL], m: ['Cyber Dragon'], st: ['Divine Wrath'] }] });
  choose(g, 'Roll a die'); choose(g, 'Divine Wrath'); pk(g); passAll(g);
  ok(!on(g, 0, 'Dark Master - Zorc') && on(g, 1, 'Cyber Dragon'), 'Zorc negated and destroyed');
});
T('DNA Checkup draws 2 for someone', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Cyber Dragon', pos: 'set' }], st: ['DNA Checkup'] }, {}] });
  const h0 = g.p[0].hand.length, h1 = g.p[1].hand.length; act(g, 0, 'DNA Checkup'); passAll(g); choose(g, 'LIGHT', 1); choose(g, 'DARK', 1);
  ok(g.p[1].hand.length === h1 + 2 && g.p[0].hand.length === h0, 'LIGHT was declared, B drew 2');
});
T('Double Attack gives a second attack', () => {
  const g = duel({ board: [{ hand: ['Double Attack', 'Cyber Dragon'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Double Attack'); pk(g); passAll(g); choose(g, 'bp'); passAll(g); attack(g, FILL); respondUntilIdle(g); attack(g, FILL); respondUntilIdle(g);
  ok(lp(g, 1) === 4000, 'two direct attacks');
});
T('Double Spell uses a Spell from the opponent\'s GY', () => {
  const g = duel({ board: [{ hand: ['Double Spell', 'Mystical Space Typhoon'] }, { gy: ['Dark Hole'], m: [FILL] }] });
  act(g, 0, 'Double Spell'); pk(g); passAll(g);
  ok(!on(g, 1, FILL) && inZ(g, 1, 'gy', 'Dark Hole'), 'Dark Hole resolved, still in their GY');
});
T('Double Summon gives a second Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Double Summon', FILL, 'Des Koala'] }, {}] });
  choose(g, 'ns:' + g.p[0].hand.find(x => E.name(x) === FILL).u); respondUntilIdle(g);
  act(g, 0, 'Double Summon'); passAll(g);
  ok(hasOpt(g, 'ns:' + g.p[0].hand.find(x => E.name(x) === 'Des Koala').u), 'second Normal Summon offered');
  choose(g, 'set:' + g.p[0].hand.find(x => E.name(x) === 'Des Koala').u); respondUntilIdle(g);
  ok(!g.prompt.opts.some(o => /^ns:/.test(o.key)), 'no third summon');
});
T('Double-Edged Sword Technique: summon 2, destroy and take damage at the End Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Double-Edged Sword Technique'], gy: ['The Six Samurai - Yaichi', 'The Six Samurai - Kamon'] }, {}] });
  act(g, 0, 'Double-Edged Sword Technique'); passAll(g); respondUntilIdle(g);
  ok(on(g, 0, 'The Six Samurai - Yaichi') && on(g, 0, 'The Six Samurai - Kamon'), 'both summoned');
  choose(g, 'end'); respondUntilIdle(g);
  ok(lp(g, 0) === 8000 - 2800 && inZ(g, 0, 'gy', 'The Six Samurai - Kamon'), `2800 damage (A ${lp(g, 0)})`);
});
T('Double Tag Team answers a Gladiator Beast Special Summon', () => {
  const g = duel({ board: [{ hand: ['Dimension Distortion', 'Gladiator Beast Laquari'], ban: ['Gladiator Beast Bestiari'], st: ['Double Tag Team'] }, {}] });
  act(g, 0, 'Dimension Distortion');
  const dtt = g.p[0].st.find(x => x && E.name(x) === 'Double Tag Team');
  // it answers in the summon's own response window (2026-11-27: once both players pass, the summon's moment is over)
  for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond' && !hasOpt(g, 'a:' + dtt.u + ':'); i++) E.act(g, ['pass']);
  ok(hasOpt(g, 'a:' + dtt.u + ':'), 'Double Tag Team offered after the summon'); choose(g, 'a:' + dtt.u + ':'); passAll(g); pk(g); respondUntilIdle(g);
  ok(on(g, 0, 'Gladiator Beast Bestiari') && on(g, 0, 'Gladiator Beast Laquari'), 'Laquari Special Summoned');
});
T('Double Tool C&D: +1000 on your turn, the rest of your monsters protected on theirs', () => {
  const g = duel({ board: [{ hand: ['Double Tool C&D'], m: ['Power Tool Dragon', FILL], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Double Tool C&D'); passAll(g);
  const ptd = on(g, 0, 'Power Tool Dragon'); ok(E.atk(g, ptd) === 3300, 'Power Tool Dragon has 3300 ATK');
  g.tp = 1; g.seq++;
  ok(E.lib.has(g, on(g, 0, FILL), 'noAttackTarget') && !E.lib.has(g, ptd, 'noAttackTarget') && E.atk(g, ptd) === 2300, 'on their turn only the equipped monster can be attacked');
  g.tp = 0; g.seq++;
});
console.log(fails ? `\n${fails} failed` : '\nAll full batch 06 checks passed.');
process.exit(fails ? 1 : 0);
