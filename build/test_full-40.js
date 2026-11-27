// Scenario checks for full pool batch 40: node build/test_full-40.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: o.first || 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const passUntil = (g, text, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond' && !hasOpt(g, text); i++) E.act(g, ['pass']); };
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const yesAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes'); };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const logHas = (g, s) => g.log.some(l => l.includes(s));
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
// pass everything until player p's Main Phase 1 (answers No to optional effects)
function toMain(g, p, guard = 200) {
  for (let i = 0; i < guard && g.prompt; i++) {
    const pr = g.prompt;
    if (pr.type === 'idle' && pr.p === p && g.phase === 'main1') return;
    if (pr.type === 'idle') E.act(g, [pr.opts.some(o => o.key === 'endbp') ? 'endbp' : 'end']);
    else if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') E.act(g, ['n']);
    else E.act(g, pr.opts.slice(0, Math.max(1, pr.min)).map(o => o.key));
  }
}

T('Lei Lei goes to Defense after attacking and is locked', () => {
  const g = duel({ board: [{ hand: [], m: ['Indomitable Fighter Lei Lei'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g); passAll(g);
  choose(g, 'endbp'); passAll(g);
  const c = on(g, 0, 'Indomitable Fighter Lei Lei');
  ok(c && c.pos === 'def', 'Lei Lei is in Defense Position after the Battle Phase');
  toMain(g, 0); ok(g.turnNo === 4 && !hasOpt(g, 'pos:' + c.u), 'no position change on its next turn');
  toMain(g, 1); toMain(g, 0); ok(g.turnNo === 6 && hasOpt(g, 'pos:' + c.u), 'position change allowed two turns later');
});
T('Indomitable Gladiator Beast: +500 and returns from the GY', () => {
  const g = duel({ board: [{ hand: ['Indomitable Gladiator Beast'], m: ['Gladiator Beast Laquari'], gy: ['Gladiator Beast Bestiari', 'Gladiator Beast Bestiari'], turn: 2 }, {}] });
  const gb = on(g, 0, 'Gladiator Beast Laquari'); const a0 = E.atk(g, gb);
  act(g, 0, 'Indomitable Gladiator Beast'); passAll(g);
  ok(E.atk(g, gb) === a0 + 500, 'Laquari gained 500 ATK');
  ok(hasOpt(g, 'Shuffle 2 Gladiator Beast'), 'GY effect offered'); act(g, 0, 'Indomitable Gladiator Beast'); passAll(g);
  ok(inZ(g, 0, 'hand', 'Indomitable Gladiator Beast') && !inZ(g, 0, 'gy', 'Gladiator Beast Bestiari'), 'back in the hand, the Bestiari shuffled away');
});
T('Infinity Dark (Gemini Summoned) changes a position on attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Infinity Dark'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'Gemini Summon'); passAll(g);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Cyber Dragon'); yesAll(g); passAll(g);
  ok(on(g, 1, 'Cyber Dragon').pos === 'def', 'Cyber Dragon went to Defense Position');
});
T('Informer Spider takes a Defense Position monster when destroyed by an effect', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], m: [{ n: 'Cyber Dragon', pos: 'set' }], turn: 2 }, { m: ['Informer Spider'] }] });
  act(g, 0, 'Smashing Ground'); passAll(g); passAll(g);
  ok(inZ(g, 1, 'gy', 'Informer Spider') && g.p[1].m.some(c => c && E.data(c).n === 'Cyber Dragon'), 'B took control of the face-down Cyber Dragon');
});
T('Inherited Fortune: Fortune Ladies come out in the next Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Dark Hole', 'Fortune Lady Dark'], m: ['Fortune Lady Light'], st: ['Inherited Fortune'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); passAll(g); for (let i = 0; i < 5 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'no'); else passAll(g); }
  act(g, 0, 'Inherited Fortune'); passAll(g);
  toMain(g, 1);
  // A's next Standby Phase: the summon trigger
  for (let i = 0; i < 30 && g.prompt && !(g.prompt.type === 'pick' && g.prompt.text.includes('Fortune Ladies')); i++) { const pr = g.prompt; if (pr.type === 'idle') E.act(g, ['end']); else if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['n']); else E.act(g, pr.opts.slice(0, pr.min).map(o => o.key)); }
  choose(g, 'Fortune Lady Dark'); passAll(g);
  ok(on(g, 0, 'Fortune Lady Dark') && g.turnNo === 4, 'Fortune Lady Dark Special Summoned in the Standby Phase');
});
T('Inmato draws 2 when a Plant is targeted by a Spell', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['Inmato', 'Lonefire Blossom'] }] });
  const h = g.p[1].hand.length;
  act(g, 0, 'Book of Moon'); choose(g, 'Lonefire'); ok(hasOpt(g, 'Inmato'), 'Inmato offered'); choose(g, 'Inmato'); passAll(g);
  ok(g.p[1].hand.length === h + 2 && inZ(g, 1, 'gy', 'Inmato'), 'B drew 2 and Inmato was Tributed');
});
T('Instant Neo Space: no End Phase return, Neos comes out when the Fusion leaves', () => {
  const g = duel({ board: [{ hand: ['Instant Neo Space', 'Dark Hole'], m: ['Elemental HERO Air Neos'], gy: ['Elemental HERO Neos'], turn: 2 }, {}] });
  act(g, 0, 'Instant Neo Space'); passAll(g);
  act(g, 0, 'Dark Hole'); passAll(g); yesAll(g); passAll(g);
  ok(on(g, 0, 'Elemental HERO Neos'), 'Neos Special Summoned from the GY');
  const g2 = duel({ board: [{ hand: ['Instant Neo Space'], m: ['Elemental HERO Air Neos'], turn: 2 }, {}] });
  act(g2, 0, 'Instant Neo Space'); passAll(g2); toMain(g2, 1);
  ok(on(g2, 0, 'Elemental HERO Air Neos'), 'Air Neos stayed on the field through the End Phase');
});
T('Intercept takes a monster Tribute Summoned with 1 Tribute', () => {
  const g = duel({ board: [{ hand: ['Lesser Fiend (Archfiend)'], m: ['Sangan'], turn: 2 }, { st: ['Intercept'] }] });
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Lesser Fiend (Archfiend)').u); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); passUntil(g, 'Intercept');
  ok(hasOpt(g, 'Intercept'), 'Intercept offered'); choose(g, 'Intercept'); passAll(g);
  ok(on(g, 1, 'Lesser Fiend (Archfiend)'), 'B took Lesser Fiend');
});
T('Interdimensional Warp switches control with an A-Counter monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Sangan'], st: ['Interdimensional Warp'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  E.lib.addCtr(g, on(g, 1, 'Cyber Dragon'), 'A', 1);
  g.prompt.opts = E.idleOpts(g);
  act(g, 0, 'Interdimensional Warp'); passAll(g);
  ok(on(g, 0, 'Cyber Dragon') && on(g, 1, 'Sangan'), 'control switched');
});
T('Interplanetary Invader A takes its attacker at the end of the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Interplanetary Invader A'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Interplanetary'); passAll(g); passAll(g); passAll(g);
  choose(g, 'endbp'); passAll(g);
  ok(on(g, 1, 'Cyber Dragon'), 'B controls Cyber Dragon');
});
T('Inverse Universe switches ATK and DEF of Effect Monsters only', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon', 'Giant Rat'], st: ['Inverse Universe'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Inverse Universe'); passAll(g);
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 1600 && E.def(g, on(g, 0, 'Cyber Dragon')) === 2100, 'Cyber Dragon is 1600/2100');
  ok(E.atk(g, on(g, 1, FILL)) === 2000, 'Normal Monster unchanged');
});
T('Iris draws after a 3-link chain; Lightning Punisher destroys', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Iris, the Earth Mother', 'Lightning Punisher'], st: ['Book of Moon'], turn: 2 }, { m: [FILL], st: ['Dust Tornado', 'Mirror Force'] }] });
  const h = g.p[0].hand.length;
  const dt = g.p[1].st.find(c => c && E.name(c) === 'Dust Tornado'), bom = g.p[0].st.find(c => c && E.name(c) === 'Book of Moon');
  act(g, 0, 'Mystical Space Typhoon'); choose(g, 'u' + dt.u);
  // B chains Dust Tornado onto Book of Moon, A chains Book of Moon on B's monster
  choose(g, 'a:' + dt.u + ':', 1); choose(g, 'u' + bom.u); choose(g, 'a:' + bom.u + ':', 0); choose(g, FILL);
  passAll(g);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') choose(g, 'u' + g.p[1].st.find(c => c && E.name(c) === 'Mirror Force').u); else passAll(g); }
  ok(logHas(g, "Iris, the Earth Mother's effect"), 'Iris activated');
  ok(logHas(g, "Lightning Punisher's effect"), 'Lightning Punisher activated');
  ok(g.p[1].st.filter(Boolean).length === 0, 'B has no Spell/Trap left (Punisher destroyed the last one)');
});
T('Ivy Shackles draws when the opponent destroys it', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], turn: 2 }, { st: [{ n: 'Ivy Shackles', pos: 'up' }] }] });
  const h = g.p[1].hand.length; act(g, 0, 'Mystical Space Typhoon'); passAll(g); passAll(g);
  ok(g.p[1].hand.length === h + 1, 'B drew 1');
});
T('Izanami searches a Spirit and returns in the End Phase; Izanagi stops the return', () => {
  const g = duel({ board: [{ hand: ['Izanami', 'Sangan'], gy: ['Kinka-byo'], turn: 2 }, {}] });
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Izanami').u); passAll(g); yesAll(g); choose(g, 'Sangan'); passAll(g);
  ok(inZ(g, 0, 'hand', 'Kinka-byo'), 'Kinka-byo added');
  toMain(g, 1); ok(inZ(g, 0, 'hand', 'Izanami'), 'Izanami returned to the hand');
  const g2 = duel({ board: [{ hand: ['Izanami'], m: ['Izanagi'], turn: 2 }, {}] });
  choose(g2, 'ns:' + g2.p[0].hand.find(c => E.name(c) === 'Izanami').u); passAll(g2); toMain(g2, 1);
  ok(on(g2, 0, 'Izanami'), 'with Izanagi, Izanami stays');
  const g3 = duel({ board: [{ hand: ['Izanagi', 'Izanami'], turn: 2 }, {}] });
  ok(hasOpt(g3, 'banish a Spirit'), 'Izanagi summon rule offered'); choose(g3, 'banish a Spirit'); passAll(g3);
  ok(on(g3, 0, 'Izanagi') && inZ(g3, 0, 'ban', 'Izanami'), 'Izanagi summoned by banishing Izanami');
  ok(E.lib.forbid(g3, { type: 'ss', c: g3.p[0].ban[0], p: 0, how: 'special' }), 'Izanami can\'t be Special Summoned');
});
T('Javelin Beetle Pact Ritual Summons Javelin Beetle', () => {
  const g = duel({ board: [{ hand: ['Javelin Beetle Pact', 'Javelin Beetle'], m: ['Cyber Dragon', 'Breaker the Magical Warrior'], turn: 2 }, {}] });
  act(g, 0, 'Javelin Beetle Pact'); passAll(g); for (let i = 0; i < 3 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'choose') E.act(g, [g.prompt.opts[0].key]); else passAll(g); }
  ok(on(g, 0, 'Javelin Beetle'), 'Javelin Beetle Ritual Summoned');
});
T('Jenis burns after a Lightsworn mill', () => {
  const g = duel({ board: [{ hand: [], m: ['Jenis, Lightsworn Mender', 'Jain, Lightsworn Paladin'], turn: 2 }, {}] });
  toMain(g, 1);
  ok(g.p[1].lp === 7500 && g.p[0].lp === 8500, `500 damage and 500 LP (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Jester Confit: one at a time, returns with a monster', () => {
  const g = duel({ board: [{ hand: ['Jester Confit', 'Jester Confit'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'Attack Position'); passAll(g);
  ok(on(g, 0, 'Jester Confit') && !hasOpt(g, 'Attack Position'), 'summoned; a second one is not offered');
  toMain(g, 1); choose(g, 'end'); for (let i = 0; i < 10 && g.prompt && g.turnNo === 3; i++) { if (g.prompt.type === 'pick') choose(g, 'Warwolf'); else passAll(g); }
  ok(inZ(g, 1, 'hand', 'Cyber Dragon') && g.p[0].hand.filter(c => E.name(c) === 'Jester Confit').length === 2, 'both returned in B\'s End Phase');
});
T('Jester Lord counts Spell/Trap cards', () => {
  const g = duel({ board: [{ m: ['Jester Lord'], st: ['Dust Tornado'], turn: 2 }, { st: ['Mirror Force', 'Book of Moon'] }] });
  ok(E.atk(g, on(g, 0, 'Jester Lord')) === 3000, 'Jester Lord has 3000 ATK');
});
T('Jetroid lets a Trap be activated from the hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { hand: ['Mirror Force'], m: ['Jetroid'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Jetroid'); yesAll(g);
  ok(hasOpt(g, 'Mirror Force'), 'Mirror Force can be activated'); choose(g, 'Mirror Force'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon'), 'Cyber Dragon destroyed');
});
T('Junk Barrage burns half the destroyed monster\'s ATK', () => {
  const g = duel({ board: [{ hand: ['Junk Barrage'], m: ['Cyber Dragon'], turn: 2 }, { m: ['Breaker the Magical Warrior'] }] });
  act(g, 0, 'Junk Barrage'); choose(g, 'Cyber Dragon'); passAll(g);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Breaker'); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(g.p[1].lp === 8000 - 500 - 800, `B took 500 battle + 800 (${g.p[1].lp})`);
});
T('Junk Box revives a Morphtronic and destroys it in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Junk Box'], gy: ['Morphtronic Celfon'], turn: 2 }, {}] });
  act(g, 0, 'Junk Box'); passAll(g);
  ok(on(g, 0, 'Morphtronic Celfon'), 'Celfon summoned'); toMain(g, 1); ok(inZ(g, 0, 'gy', 'Morphtronic Celfon'), 'Celfon destroyed in the End Phase');
});
T('Justi-Break destroys all but Attack Position Normal Monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon', FILL], turn: 2 }, { m: ['Giant Rat', FILL], st: ['Justi-Break'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack ' + FILL); choose(g, 'Justi-Break'); passAll(g);
  ok(!on(g, 0, 'Cyber Dragon') && !on(g, 1, 'Giant Rat') && on(g, 0, FILL) && on(g, 1, FILL), 'only the Normal Monsters remain');
});
T('Kahkki destroys a monster when discarded by an effect', () => {
  const g = duel({ board: [{ hand: ['Card Destruction'], turn: 2 }, { hand: ['Kahkki, Guerilla of Dark World'], m: ['Cyber Dragon'] }] });
  act(g, 0, 'Card Destruction'); passAll(g); for (let i = 0; i < 6 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') choose(g, 'Cyber'); else passAll(g); }
  ok(inZ(g, 1, 'gy', 'Cyber Dragon'), 'a monster was destroyed (Cyber Dragon, the only one)');
});
T('Karma Cut banishes the target and its copies in the GY', () => {
  const g = duel({ board: [{ hand: ['Sangan'], st: ['Karma Cut'], turn: 2 }, { m: ['Cyber Dragon'], gy: ['Cyber Dragon', 'Sangan'] }] });
  act(g, 0, 'Karma Cut'); choose(g, 'Sangan'); passAll(g);
  ok(g.p[1].ban.filter(c => E.name(c) === 'Cyber Dragon').length === 2 && inZ(g, 1, 'gy', 'Sangan'), 'both Cyber Dragons banished');
});
T('Kasha shuffles the field away and counts Zombies', () => {
  const g = duel({ board: [{ hand: ['Kasha'], m: ['Goblin Zombie', 'Pyramid Turtle'], turn: 2 }, { m: ['Cyber Dragon', 'Mezuki'] }] });
  choose(g, 'you control 2 Zombies'); passAll(g); passAll(g);
  const k = on(g, 0, 'Kasha');
  ok(k && E.atk(g, k) === 3000 && g.p[1].m.filter(Boolean).length === 0, `Kasha alone with 3000 ATK (${k && E.atk(g, k)})`);
  ok(E.lib.forbid(g, { type: 'ss', c: k, p: 0, how: 'special' }), 'Kasha outside the hand can\'t be Special Summoned');
});
T('Kid Guard negates the attack and searches an Elemental HERO', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Hero Kid'], st: ['Kid Guard'], deckTop: ['Elemental HERO Neos'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Hero Kid'); choose(g, 'Kid Guard'); passAll(g);
  ok(inZ(g, 1, 'hand', 'Elemental HERO Neos') && inZ(g, 1, 'gy', 'Hero Kid') && g.p[1].lp === 8000, 'attack negated, Neos added');
});
T('Kinetic Soldier gains 2000 against a Warrior', () => {
  const g = duel({ board: [{ hand: [], m: ['Goblin Attack Force'], turn: 2 }, { m: ['Kinetic Soldier (Cipher Soldier)'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Kinetic'); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(inZ(g, 0, 'gy', 'Goblin Attack Force') && on(g, 1, 'Kinetic Soldier (Cipher Soldier)'), 'Breaker destroyed');
});
T("King's Knight brings Jack's Knight", () => {
  const g = duel({ board: [{ hand: ["King's Knight"], m: ["Queen's Knight"], deckTop: [FILL, "Jack's Knight"], turn: 2 }, {}] });
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === "King's Knight").u); passAll(g); yesAll(g); passAll(g);
  ok(on(g, 0, "Jack's Knight"), "Jack's Knight summoned");
});
T('Kinka-byo revives a Level 1 and banishes it when it leaves', () => {
  const g = duel({ board: [{ hand: ['Kinka-byo', 'Dark Hole'], gy: ['Kuribon'], turn: 2 }, {}] });
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Kinka-byo').u); passAll(g); yesAll(g); passAll(g);
  ok(on(g, 0, 'Kuribon'), 'Kuribon revived');
  toMain(g, 1); ok(inZ(g, 0, 'hand', 'Kinka-byo') && inZ(g, 0, 'ban', 'Kuribon'), 'Kinka-byo returned, Kuribon banished');
});
T('Knight of the Red Lotus: summon rule and revive', () => {
  const g = duel({ board: [{ hand: ['Knight of the Red Lotus'], gy: [FILL, FILL, 'Giant Rat', 'Mystic Tomato'], turn: 2 }, {}] });
  g.p[0].gy.push(...g.p[0].gy.splice(0, 0)); // FILL x2 are Normal; Giant Rat/Tomato are Effect
  ok(!hasOpt(g, 'banish 2 Normal'), 'not offered with 2 Normals');
  const g2 = duel({ board: [{ hand: ['Knight of the Red Lotus'], gy: [FILL, FILL, FILL], turn: 2 }, {}] });
  choose(g2, 'banish 2 Normal'); E.act(g2, g2.prompt.opts.slice(0, 2).map(o => o.key)); passAll(g2);
  ok(on(g2, 0, 'Knight of the Red Lotus') && g2.p[0].ban.length === 2, 'summoned by banishing 2');
  act(g2, 0, 'Knight of the Red Lotus'); passAll(g2);
  ok(on(g2, 0, FILL), 'revived a Normal Monster');
});
T('Kunai with Chain: Defense Position and equip', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Sangan'], st: ['Kunai with Chain'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Sangan'); choose(g, 'Kunai'); choose(g, 'Both'); passAll(g);
  ok(on(g, 0, 'Cyber Dragon').pos === 'def' && E.atk(g, on(g, 1, 'Sangan')) === 1500 && inZ(g, 1, 'st', 'Kunai with Chain'), 'attacker in Defense, Sangan 1500');
});
T('Kunoichi: new controller discards at random', () => {
  const g = duel({ board: [{ hand: ['Snatch Steal', 'Sangan'], turn: 2 }, { m: ['Kunoichi'] }] });
  act(g, 0, 'Snatch Steal'); passAll(g); passAll(g); toMain(g, 1); // control changes make no event: the discard comes at the next one
  ok(on(g, 0, 'Kunoichi') && g.p[0].hand.length === 1 && g.p[0].gy.length === 1, 'A controls Kunoichi and discarded 1 card');
});
T('Kuribon returns to the hand and the attacker gains LP', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Kuribon'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Kuribon'); passUntil(g, 'Kuribon');
  choose(g, 'Kuribon'); passAll(g);
  ok(inZ(g, 1, 'hand', 'Kuribon') && g.p[0].lp === 10100 && g.p[1].lp === 8000, `A gained 2100, no damage (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Layard adds 2 banished Fairies after a Counter Trap', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ['Layard the Liberator'], st: ['Solemn Judgment'], ban: ['Shining Angel', 'Shining Angel'] }] });
  act(g, 0, 'Dark Hole'); choose(g, 'Solemn'); passAll(g); passAll(g);
  ok(g.p[1].hand.filter(c => E.name(c) === 'Shining Angel').length === 2, 'both Shining Angels added');
});
T('Lesser Fiend banishes what it destroys by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Lesser Fiend (Archfiend)'], turn: 2 }, { m: ['Sangan'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Sangan'); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(inZ(g, 1, 'ban', 'Sangan'), 'Sangan banished');
});
T('Lich Lord comes back when Tributed by a card effect', () => {
  const g = duel({ board: [{ hand: ['Linear Accelerator Cannon'], m: ['Lich Lord, King of the Underworld'], turn: 2 }, {}] });
  act(g, 0, 'Linear Accelerator Cannon'); passAll(g); passAll(g);
  ok(inZ(g, 0, 'hand', 'Lich Lord, King of the Underworld') && g.p[1].lp === 6800, `Lich Lord back in hand, 1200 damage (${g.p[1].lp})`);
});
T('Linear Accelerator Cannon stops other Spells', () => {
  const g = duel({ board: [{ hand: ['Linear Accelerator Cannon', 'Dark Hole'], m: ['Cyber Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Linear Accelerator Cannon'); passAll(g);
  ok(g.p[1].lp === 8000 - 1050 && !hasOpt(g, 'a:' + g.p[0].hand.find(c => E.name(c) === 'Dark Hole').u), 'damage dealt, Dark Hole blocked');
  const g2 = duel({ board: [{ hand: ['Dark Hole', 'Linear Accelerator Cannon'], m: ['Cyber Dragon'], turn: 2 }, { m: ['Sangan'] }] });
  act(g2, 0, 'Dark Hole'); passAll(g2); for (let i = 0; i < 5 && g2.prompt.type !== 'idle'; i++) { if (g2.prompt.type === 'yesno') choose(g2, 'no'); else if (g2.prompt.type === 'pick') E.act(g2, [g2.prompt.opts[0].key]); else passAll(g2); }
  ok(!hasOpt(g2, 'a:' + g2.p[0].hand.find(c => E.name(c) === 'Linear Accelerator Cannon').u), 'not offered after another Spell');
});
T('Life Equalizer', () => {
  const g = duel({ board: [{ st: ['Life Equalizer'], lp: 9000, turn: 2 }, { lp: 1000 }] });
  act(g, 0, 'Life Equalizer'); passAll(g);
  ok(g.p[0].lp === 3000 && g.p[1].lp === 3000, 'both at 3000');
});
T('Lifeforce Harmonizer negates a burn card', () => {
  const g = duel({ board: [{ hand: ['Ookazi'], turn: 2 }, { hand: ['Lifeforce Harmonizer'] }] });
  act(g, 0, 'Ookazi'); ok(hasOpt(g, 'Lifeforce'), 'offered'); choose(g, 'Lifeforce'); passAll(g);
  ok(g.p[1].lp === 8000 && inZ(g, 1, 'gy', 'Lifeforce Harmonizer'), 'no damage');
  const g2 = duel({ board: [{ hand: ['Graceful Charity'], turn: 2 }, { hand: ['Lifeforce Harmonizer'] }] });
  act(g2, 0, 'Graceful Charity'); ok(!hasOpt(g2, 'Lifeforce'), 'not offered against Graceful Charity');
});
T('Lightsworn Barrier negates an attack on a Lightsworn', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Lyla, Lightsworn Sorceress'], st: [{ n: 'Lightsworn Barrier', pos: 'up' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Lyla'); choose(g, 'negate the attack'); passAll(g);
  ok(on(g, 1, 'Lyla, Lightsworn Sorceress') && g.p[1].gy.length === 2, 'Lyla survives, 2 cards milled');
});
T('Lightsworn Sabre equips itself when milled', () => {
  const g = duel({ board: [{ hand: [], m: ['Jain, Lightsworn Paladin'], deckTop: [FILL, 'Lightsworn Sabre'], turn: 2 }, {}] });
  choose(g, 'end'); for (let i = 0; i < 10 && g.turnNo === 2 && g.prompt; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); else passAll(g); }
  const ly = on(g, 0, 'Jain, Lightsworn Paladin');
  ok(ly && E.atk(g, ly) === 1800 + 700 && inZ(g, 0, 'st', 'Lightsworn Sabre'), 'Jain equipped with the Sabre');
});
T('Limit Impulse makes 2 Soul Tokens', () => {
  const g = duel({ board: [{ hand: ['Sangan', 'Giant Rat'], st: ['Limit Impulse'], turn: 2 }, {}] });
  act(g, 0, 'Limit Impulse'); E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); passAll(g);
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Soul Token').length === 2 && g.p[0].hand.length === 1, '2 Soul Tokens');
});
T('Limit Reverse: Defense Position destroys both', () => {
  const g = duel({ board: [{ gy: ['Sangan'], st: ['Limit Reverse'], turn: 2 }, {}] });
  act(g, 0, 'Limit Reverse'); passAll(g);
  const s = on(g, 0, 'Sangan'); ok(s && s.pos === 'atk', 'Sangan in Attack Position');
  toMain(g, 1); toMain(g, 0); choose(g, 'pos:' + s.u); passAll(g);
  ok(inZ(g, 0, 'gy', 'Sangan') && inZ(g, 0, 'gy', 'Limit Reverse'), 'both destroyed');
});
T('Limiter Overload summons Speed Warrior', () => {
  const g = duel({ board: [{ st: ['Limiter Overload'], deckTop: ['Speed Warrior'], turn: 2 }, {}] });
  act(g, 0, 'Limiter Overload'); passAll(g); passAll(g);
  ok(on(g, 0, 'Speed Warrior'), 'Speed Warrior from the Deck');
});
T('Lineage of Destruction gives a second attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], st: ['Lineage of Destruction'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }, 'Giant Rat'] }] });
  // Dark Magician is Level 7: use Javelin Beetle (Level 8)
  const g2 = duel({ board: [{ hand: [], m: ['Javelin Beetle'], st: ['Lineage of Destruction'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }, 'Giant Rat'] }] });
  choose(g2, 'bp'); passAll(g2); choose(g2, 'Attack Sangan'); for (let i = 0; i < 6 && g2.prompt.type !== 'idle'; i++) { if (g2.prompt.type === 'yesno') choose(g2, 'no'); else passAll(g2); }
  act(g2, 0, 'Lineage of Destruction'); passAll(g2);
  ok(hasOpt(g2, 'Attack Giant Rat'), 'Javelin Beetle can attack again');
});
T('Lycanthrope burns 200 per Normal Monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Lycanthrope'], gy: [FILL, FILL], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(g.p[1].lp === 8000 - 2400 - 400, `2400 + 400 (${g.p[1].lp})`);
});
T("Magician's Valkyria protects other Spellcasters", () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ["Magician's Valkyria", 'Dark Magician'] }] });
  choose(g, 'bp'); passAll(g); ok(hasOpt(g, "Attack Magician's Valkyria") && !hasOpt(g, 'Attack Dark Magician'), 'only Valkyria can be attacked');
});
T('Magicians Unite: 3000 ATK, others can\'t attack', () => {
  const g = duel({ board: [{ hand: ['Magicians Unite'], m: ["Magician's Valkyria", 'Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Magicians Unite'); choose(g, "Valkyria"); passAll(g);
  ok(E.atk(g, on(g, 0, "Magician's Valkyria")) === 3000, 'Valkyria at 3000');
  choose(g, 'bp'); passAll(g); ok(hasOpt(g, 'Attack directly') && g.prompt.opts.filter(o => o.kind === 'atk' || /^atk:/.test(o.key)).length === 1, 'only Valkyria attacks');
});
T('Magna Drago gains 200 ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Magna Drago'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(E.atk(g, on(g, 0, 'Magna Drago')) === 1600, 'Magna Drago is 1600');
});
T('Magna-Slash Dragon sends a Continuous Spell to destroy a Spell/Trap', () => {
  const g = duel({ board: [{ hand: [], m: ['Magna-Slash Dragon'], st: [{ n: 'Jurassic World', pos: 'up' }], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!hasOpt(g, 'Send a Continuous Spell'), 'Field Spell is not Continuous');
  const g2 = duel({ board: [{ hand: [], m: ['Magna-Slash Dragon'], st: [{ n: 'Ivy Shackles', pos: 'up' }, { n: 'Level Limit - Area B', pos: 'up' }], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g2, 'Send a Continuous Spell'); passAll(g2);
  ok(inZ(g2, 0, 'gy', 'Level Limit - Area B') && inZ(g2, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Magnet Circle LV2 and Magicat', () => {
  const g = duel({ board: [{ hand: ['Magnet Circle LV2', 'Morphtronic Celfon'], turn: 2 }, {}] });
  act(g, 0, 'Magnet Circle LV2'); passAll(g); ok(on(g, 0, 'Morphtronic Celfon'), 'Celfon summoned');
});
T('Magicat returns a Spell after a Spellcaster Synchro Summon', () => {
  const g = duel({ ex0: ['Explosive Magician'], board: [{ hand: [], m: ['Magicat', 'Krebons', 'Apprentice Magician'], gy: ['Dark Hole'], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); for (let i = 0; i < 4 && g.prompt.type === 'choose'; i++) E.act(g, [g.prompt.opts[0].key]);
  for (let i = 0; i < 6 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else passAll(g); }
  ok(on(g, 0, 'Explosive Magician') && g.p[0].deck[g.p[0].deck.length - 1] && E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Dark Hole', 'Dark Hole on top of the Deck');
});
T('Introduction to Gallantry discards at random', () => {
  const g = duel({ board: [{ st: ['Introduction to Gallantry'], turn: 2 }, {}] });
  const h = g.p[1].hand.length; act(g, 0, 'Introduction to Gallantry'); passAll(g);
  ok(g.p[1].hand.length === h - 1 && g.p[1].gy.length === 1, 'B discarded 1');
});
T('Jurassic World boosts Dinosaurs', () => {
  const g = duel({ board: [{ hand: ['Jurassic World'], m: ['Black Tyranno'], turn: 2 }, {}] });
  act(g, 0, 'Jurassic World'); passAll(g);
  ok(E.atk(g, on(g, 0, 'Black Tyranno')) === 2900, 'Black Tyranno 2900');
});
console.log(fails ? `\n${fails} FAILED` : '\nAll passed.');
process.exit(fails ? 1 : 0);
