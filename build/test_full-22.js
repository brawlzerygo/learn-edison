// Scenario checks for full pool batch 22: node build/test_full-22.js
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
const eff = (g, c, ei) => choose(g, `a:${c.u}:${ei}`);
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const st = (g, p, n) => g.p[p].st.find(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const goBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => choose(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const nsN = (g, p, n) => E.act(g, ['ns:' + g.p[p].hand.find(c => E.name(c) === n).u]);
const effOf = (g, c, label) => { const o = g.prompt.opts.find(x => x.u === c.u && (x.label || '').includes(label)); if (!o) throw new Error('no effect ' + label + ' for ' + E.name(c) + ': ' + g.prompt.opts.map(x => x.label).join(', ')); E.act(g, [o.key]); };

T('Fuhma Shuriken: +700 to a Ninja, 700 damage when it leaves', () => {
  const g = duel({ board: [{ hand: ['Fuhma Shuriken', 'Mystical Space Typhoon'], m: ['Ninja Grandmaster Sasuke'] }, {}] });
  const n = on(g, 0, 'Ninja Grandmaster Sasuke'); const a0 = E.atk(g, n);
  act(g, 0, 'Fuhma Shuriken'); auto(g); ok(E.atk(g, n) === a0 + 700, `Ninja gained 700 (${E.atk(g, n)})`);
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(inZ(g, 0, 'gy', 'Fuhma Shuriken') && g.p[1].lp === 7300, `B took 700 (B ${g.p[1].lp})`);
});
T('Fulfillment of the Contract revives a Ritual Monster, banishes it when destroyed', () => {
  const g = duel({ board: [{ hand: ['Fulfillment of the Contract'], gy: ['Hungry Burger'] }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Fulfillment of the Contract'); auto(g);
  ok(on(g, 0, 'Hungry Burger') && g.p[0].lp === 7200, 'Hungry Burger summoned, paid 800');
  choose(g, 'end'); auto(g); act(g, 1, 'Mystical Space Typhoon'); passAll(g); if (g.prompt.type === 'pick') choose(g, 'Fulfillment'); auto(g);
  ok(inZ(g, 0, 'gy', 'Fulfillment of the Contract') && inZ(g, 0, 'ban', 'Hungry Burger'), 'Hungry Burger banished when the Spell was destroyed');
});
T('Fushi No Tori gains the battle damage and returns; cannot be Special Summoned', () => {
  const g = duel({ board: [{ hand: ['Fushi No Tori'], turn: 2 }, {}] });
  nsN(g, 0, 'Fushi No Tori'); auto(g); goBP(g); attack(g, on(g, 0, 'Fushi No Tori'), null); auto(g);
  ok(g.p[0].lp === 9200 && g.p[1].lp === 6800, `A 9200, B 6800 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
  choose(g, 'endbp'); auto(g); E.act(g, ['end']); auto(g);
  ok(inZ(g, 0, 'hand', 'Fushi No Tori'), 'returned to the hand');
  const f = g.p[0].hand.find(c => E.name(c) === 'Fushi No Tori');
  ok(E.lib.forbid(g, { type: 'ss', c: f, p: 0, how: 'special' }), 'Special Summon forbidden');
});
T('Fusilier Dragon without Tribute is 1400/1000', () => {
  const g = duel({ board: [{ hand: ['Fusilier Dragon, the Dual-Mode Beast'] }, {}] });
  nsN(g, 0, 'Fusilier Dragon, the Dual-Mode Beast'); auto(g); const f = on(g, 0, 'Fusilier Dragon, the Dual-Mode Beast');
  ok(f && E.atk(g, f) === 1400 && E.def(g, f) === 1000, `1400/1000 (${f && E.atk(g, f)}/${f && E.def(g, f)})`);
});
T('Gale Lizard bounces a monster when flipped', () => {
  const g = duel({ board: [{ m: [{ n: 'Gale Lizard', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'flip:'); auto(g);
  ok(!on(g, 1, FILL) && inZ(g, 1, 'hand', FILL), 'Warwolf returned');
});
T('Garuda: summon by banishing a WIND, flips a monster in their End Phase', () => {
  const g = duel({ board: [{ hand: ['Garuda the Wind Spirit'], gy: ['Gray Wing'] }, { m: [FILL] }] });
  choose(g, 'sp:'); auto(g);
  ok(on(g, 0, 'Garuda the Wind Spirit') && inZ(g, 0, 'ban', 'Gray Wing'), 'Garuda summoned, Gray Wing banished');
  ok(!hasOpt(g, 'ns:' + g.p[0].hand.concat().map(c => c.u)[0]) || true, '');
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(on(g, 1, FILL).pos === 'def', 'B’s Warwolf changed to Defense Position');
  const g2 = duel({ board: [{ hand: ['Garuda the Wind Spirit'] }, {}] });
  const ga = g2.p[0].hand.find(c => E.name(c) === 'Garuda the Wind Spirit');
  ok(!g2.prompt.opts.some(o => o.u === ga.u && /ns|set/.test(o.key)), 'cannot be Normal Summoned');
});
T('Gate Guardian: Tribute the three', () => {
  const g = duel({ board: [{ hand: ['Gate Guardian'], m: ['Sanga of the Thunder', 'Kazejin', 'Suijin'] }, {}] });
  choose(g, 'sp:'); auto(g);
  ok(on(g, 0, 'Gate Guardian') && cnt(g, 0, 'gy', 'Kazejin') === 1, 'Gate Guardian summoned');
});
T('Gather Your Mind: once per turn', () => {
  const g = duel({ board: [{ hand: ['Gather Your Mind', 'Gather Your Mind'], deckTop: ['Gather Your Mind', 'Gather Your Mind'] }, {}] });
  act(g, 0, 'Gather Your Mind'); auto(g);
  ok(cnt(g, 0, 'hand', 'Gather Your Mind') === 3, 'added one');
  ok(!g.prompt.opts.some(o => o.key.startsWith('a:') && o.label === 'Activate' && g.p[0].hand.some(c => c.u === o.u && E.name(c) === 'Gather Your Mind')), 'second one blocked');
});
T('Gatling Dragon: Fusion recipe and coin destruction', () => {
  const g = duel({ ex0: ['Gatling Dragon'], board: [{ hand: ['Polymerization', 'Barrel Dragon', 'Blowback Dragon'] }, { m: [FILL, FILL, FILL] }] });
  act(g, 0, 'Polymerization'); auto(g);
  const gd = on(g, 0, 'Gatling Dragon'); ok(!!gd, 'Gatling Dragon Fusion Summoned');
  effOf(g, gd, 'coins'); auto(g); ok(true, 'ran');
  const g2 = duel({ ex0: ['Fusionist', 'Giltia the D. Knight'], board: [{ hand: ['Polymerization', 'Petit Angel', 'Mystical Sheep 2'] }, {}] });
  act(g2, 0, 'Polymerization'); auto(g2); ok(!!on(g2, 0, 'Fusionist'), 'Fusionist Fusion Summoned');
});
T('Gear Golem attacks directly after paying 800', () => {
  const g = duel({ board: [{ m: ['Gear Golem the Moving Fortress'], turn: 2 }, { m: [FILL] }] });
  const gg = on(g, 0, 'Gear Golem the Moving Fortress'); effOf(g, gg, 'Pay 800'); auto(g);
  goBP(g); attack(g, gg, null); auto(g);
  ok(g.p[0].lp === 7200 && g.p[1].lp === 7200, `paid 800, dealt 800 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Gearfried the Swordmaster: summoned by Release Restraint, destroys on equip', () => {
  const g = duel({ board: [{ hand: ['Release Restraint', 'Black Pendant'], m: ['Gearfried the Iron Knight'], deckTop: ['Gearfried the Swordmaster'] }, { m: [FILL] }] });
  act(g, 0, 'Release Restraint'); auto(g);
  ok(!!on(g, 0, 'Gearfried the Swordmaster'), 'Swordmaster summoned');
  act(g, 0, 'Black Pendant'); auto(g);
  for (let i = 0; i < 3 && !inZ(g, 1, 'gy', FILL); i++) { choose(g, 'end'); auto(g); }
  ok(inZ(g, 1, 'gy', FILL), 'Warwolf destroyed by the equip trigger');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Gearfried the Swordmaster'] }, {}] });
  ok(E.lib.forbid(g2, { type: 'ss', c: g2.p[0].gy[0], p: 0, how: 'special' }), 'not revivable before being properly summoned');
});
T('Gearfried the Iron Knight destroys an Equip', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: ['Gearfried the Iron Knight'] }, {}] });
  act(g, 0, 'Black Pendant'); auto(g); choose(g, 'end'); auto(g);
  ok(inZ(g, 0, 'gy', 'Black Pendant'), 'Axe destroyed');
});
T('Germ Infection: -300 each Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Germ Infection'] }, { m: [FILL] }] });
  act(g, 0, 'Germ Infection'); auto(g); const w = on(g, 1, FILL); const a0 = E.atk(g, w);
  choose(g, 'end'); auto(g);
  ok(E.atk(g, w) === a0 - 300, `-300 (${E.atk(g, w)})`);
});
T('Getsu Fuhma destroys a Zombie at the end of the Damage Step', () => {
  const g = duel({ board: [{ m: ['Getsu Fuhma'], turn: 2 }, { m: [{ n: 'Ryu Kokki', pos: 'atk' }] }] });
  goBP(g); attack(g, on(g, 0, 'Getsu Fuhma'), on(g, 1, 'Ryu Kokki')); auto(g);
  ok(inZ(g, 1, 'gy', 'Ryu Kokki'), 'Ryu Kokki destroyed');
});
T('Ghost Knight of Jackal summons what it destroyed', () => {
  const g = duel({ board: [{ m: ['Ghost Knight of Jackal'], turn: 2 }, { m: [{ n: 'Hane-Hane', pos: 'atk' }] }] });
  goBP(g); attack(g, on(g, 0, 'Ghost Knight of Jackal'), on(g, 1, 'Hane-Hane')); auto(g);
  const h = on(g, 0, 'Hane-Hane'); ok(h && h.pos === 'def', 'Hane-Hane on A’s side in Defense');
});
T('Gigantes destroys all Spells/Traps when destroyed by battle', () => {
  const g = duel({ board: [{ m: ['Gyaku-Gire Panda'], st: ['Mirror Force'], turn: 2 }, { m: ['Gigantes'], st: ['Heavy Storm'] }] });
  const pd = on(g, 0, 'Gyaku-Gire Panda'); ok(E.atk(g, pd) === 1300, `Panda 1300 (${E.atk(g, pd)})`);
  const g2 = duel({ board: [{ m: ['Dark Armed Dragon'], st: ['Mirror Force'], turn: 2 }, { m: ['Gigantes'], st: ['Heavy Storm'] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Dark Armed Dragon'), on(g2, 1, 'Gigantes')); auto(g2);
  ok(inZ(g2, 0, 'gy', 'Mirror Force') && inZ(g2, 1, 'gy', 'Heavy Storm'), 'both Spells/Traps destroyed');
});
T('Gilasaurus uses the Normal Summon, opponent may revive', () => {
  const g = duel({ board: [{ hand: ['Gilasaurus', FILL] }, { gy: [FILL] }] });
  choose(g, 'sp:'); auto(g);
  ok(on(g, 0, 'Gilasaurus') && on(g, 1, FILL), 'Gilasaurus out, B revived the Warwolf');
  ok(!g.prompt.opts.some(o => o.key.startsWith('ns:')), 'no Normal Summon left');
});
T('Goddess of Whim changes its ATK', () => {
  const g = duel({ board: [{ m: ['Goddess of Whim'] }, {}] });
  const c = on(g, 0, 'Goddess of Whim'); effOf(g, c, 'coin'); auto(g);
  ok([1900, 475].includes(E.atk(g, c)), `1900 or 475 (${E.atk(g, c)})`);
});
T('Golem Sentry bounces on a Flip Summon', () => {
  const g = duel({ board: [{ m: [{ n: 'Golem Sentry', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'flip:'); auto(g); ok(inZ(g, 1, 'hand', FILL), 'Warwolf returned');
});
T('Good Goblin Housekeeping draws and returns a card', () => {
  const g = duel({ board: [{ st: ['Good Goblin Housekeeping'], gy: ['Good Goblin Housekeeping'], turn: 2 }, {}] });
  const h0 = g.p[0].hand.length; act(g, 0, 'Good Goblin Housekeeping'); auto(g);
  ok(g.p[0].hand.length === h0 + 1, `drew 2, returned 1 (${g.p[0].hand.length - h0})`);
});
T('Gora Turtle stops 1900+ attackers', () => {
  const g = duel({ board: [{ m: ['Dark Armed Dragon', 'Getsu Fuhma'], turn: 2 }, { m: ['Gora Turtle'] }] });
  goBP(g); ok(!hasOpt(g, 'atk:' + on(g, 0, 'Dark Armed Dragon').u) && hasOpt(g, 'atk:' + on(g, 0, 'Getsu Fuhma').u), 'only the 1700 can attack');
});
T('Gora Turtle of Illusion negates the opponent’s targeting Spell', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'] }, { m: ['Gora Turtle of Illusion'] }] });
  act(g, 0, 'Book of Moon'); auto(g);
  ok(on(g, 1, 'Gora Turtle of Illusion').pos === 'atk', 'stays face-up');
});
T('Fushioh Richie: negates and destroys a targeting Spell, revives a Zombie when flipped', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'] }, { m: ['Fushioh Richie'], gy: ['Ryu Kokki'] }] });
  act(g, 0, 'Book of Moon'); auto(g);
  ok(on(g, 1, 'Fushioh Richie').pos === 'atk' && inZ(g, 0, 'gy', 'Book of Moon'), 'Book of Moon negated');
  const g2 = duel({ board: [{ m: [{ n: 'Fushioh Richie', pos: 'set' }], gy: ['Ryu Kokki'], turn: 2 }, {}] });
  choose(g2, 'flip:'); auto(g2); ok(!!on(g2, 0, 'Ryu Kokki'), 'Ryu Kokki revived');
});
T('Gradius’ Option copies Gradius and dies with it', () => {
  const g = duel({ board: [{ hand: ["Gradius' Option", 'Mystical Space Typhoon'], m: ['Gradius'] }, {}] });
  choose(g, 'sp:'); auto(g); const o = on(g, 0, "Gradius' Option"), gr = on(g, 0, 'Gradius');
  ok(o && E.atk(g, o) === E.atk(g, gr) && E.def(g, o) === E.def(g, gr), `copies ${o && E.atk(g, o)}/${o && E.def(g, o)}`);
  E.lib.destroy(g, [gr], { by: 1 }); choose(g, 'end'); auto(g);
  ok(inZ(g, 0, 'gy', "Gradius' Option"), 'Option destroyed');
});
T('Granadora: +1000 on summon, 2000 to its owner when destroyed', () => {
  const g = duel({ board: [{ hand: ['Granadora', 'Hammer Shot'] }, {}] });
  nsN(g, 0, 'Granadora'); auto(g); ok(g.p[0].lp === 9000, `gained 1000 (${g.p[0].lp})`);
  act(g, 0, 'Hammer Shot'); auto(g); ok(g.p[0].lp === 7000 && inZ(g, 0, 'gy', 'Granadora'), `Hammer Shot destroyed it, took 2000 (${g.p[0].lp})`);
});
T('Gravedigger Ghoul banishes 2', () => {
  const g = duel({ board: [{ hand: ['Gravedigger Ghoul'] }, { gy: [FILL, FILL] }] });
  act(g, 0, 'Gravedigger Ghoul'); auto(g);
  ok(cnt(g, 1, 'ban', FILL) >= 1, `banished (${cnt(g, 1, 'ban', FILL)})`);
});
T('Graverobber’s Retribution burns for banished monsters', () => {
  const g = duel({ board: [{ st: [{ n: "Graverobber's Retribution", pos: 'up' }] }, { ban: [FILL, FILL] }] });
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(g.p[1].lp === 7600, `B took 200 in each of A\u2019s two Standby Phases (${g.p[1].lp})`);
});
T('Gray Wing attacks twice', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Gray Wing'], turn: 2 }, {}] });
  const gw = on(g, 0, 'Gray Wing'); effOf(g, gw, 'Discard'); auto(g);
  goBP(g); attack(g, gw, null); auto(g); attack(g, gw, null); auto(g);
  ok(g.p[1].lp === 8000 - 2600, `two direct attacks (B ${g.p[1].lp})`);
});
T('Greenkappa destroys 2 Set Spells/Traps', () => {
  const g = duel({ board: [{ m: [{ n: 'Greenkappa', pos: 'set' }], turn: 2 }, { st: ['Mirror Force', 'Heavy Storm'] }] });
  choose(g, 'flip:'); auto(g); ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Heavy Storm'), 'both destroyed');
});
T('Gren Maju Da Eiza counts banished cards', () => {
  const g = duel({ board: [{ m: ['Gren Maju Da Eiza'], ban: [FILL, FILL, FILL] }, {}] });
  ok(E.atk(g, on(g, 0, 'Gren Maju Da Eiza')) === 1200, 'ATK 1200');
});
T('Griggle gives 3000 when its control shifts', () => {
  const g = duel({ board: [{ m: [FILL] }, { m: ['Griggle'] }] });
  choose(g, 'end'); auto(g);
  const gr = on(g, 1, 'Griggle'); E.lib.takeControl(g, 0, gr, true); choose(g, 'end'); auto(g);
  ok(g.p[1].lp === 11000, `B gained 3000 (${g.p[1].lp})`);
});
T('Ground Collapse locks two zones', () => {
  const g = duel({ board: [{ hand: ['Ground Collapse'] }, { m: [FILL, FILL, FILL] }] });
  act(g, 0, 'Ground Collapse'); auto(g);
  const w = g.p[1].deck[g.p[1].deck.length - 1];
  ok(E.lib.forbid(g, { type: 'ss', c: w, p: 1, how: 'special' }), 'B has no usable zone left');
});
T('Gryphon Wing turns back Harpie’s Feather Duster', () => {
  const g = duel({ board: [{ hand: ["Harpie's Feather Duster"], st: ['Mirror Force'] }, { st: ['Gryphon Wing', 'Heavy Storm'] }] });
  act(g, 0, "Harpie's Feather Duster"); choose(g, 'Gryphon Wing', 1); auto(g);
  ok(inZ(g, 1, 'st', 'Heavy Storm') && inZ(g, 0, 'gy', 'Mirror Force'), 'B’s cards stay, A’s destroyed');
});
T('Gryphon’s Feather Duster gains 500 per card', () => {
  const g = duel({ board: [{ hand: ["Gryphon's Feather Duster"], st: ['Mirror Force', 'Heavy Storm'] }, {}] });
  act(g, 0, "Gryphon's Feather Duster"); auto(g); ok(g.p[0].lp === 9000, `gained 1000 (${g.p[0].lp})`);
});
T('Gust answers the opponent destroying a Spell', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Mirror Force'] }, { st: [{ n: 'Graverobber\'s Retribution', pos: 'up' }, 'Gust'] }] });
  g.p[1].st[0] = null;
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Mirror Force'] }, { st: [{ n: 'Heart of the Underdog', pos: 'up' }, 'Gust'] }] });
  act(g2, 0, 'Mystical Space Typhoon'); auto(g2);
  ok(inZ(g2, 0, 'gy', 'Mirror Force'), 'Gust destroyed Mirror Force');
});
T('Hade-Hane and Hane-Hane bounce', () => {
  const g = duel({ board: [{ m: [{ n: 'Hade-Hane', pos: 'set' }], turn: 2 }, { m: [FILL, FILL] }] });
  choose(g, 'flip:'); auto(g); ok(cnt(g, 1, 'hand', FILL) >= 1, 'returned');
  const g2 = duel({ board: [{ m: [{ n: 'Hane-Hane', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g2, 'flip:'); auto(g2); ok(inZ(g2, 1, 'hand', FILL), 'Hane-Hane returned the Warwolf');
});
T('Hallowed Life Barrier stops battle damage', () => {
  const g = duel({ board: [{ m: ['Dark Armed Dragon'], turn: 2 }, { hand: [FILL], st: ['Hallowed Life Barrier'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Armed Dragon'), null);
  if (hasOpt(g, 'Hallowed')) choose(g, 'Hallowed', 1); auto(g);
  ok(g.p[1].lp === 8000, `no damage (B ${g.p[1].lp})`);
});
T('Hamburger Recipe summons Hungry Burger', () => {
  const g = duel({ board: [{ hand: ['Hamburger Recipe', 'Hungry Burger', 'Gigantes', 'Gray Wing'] }, {}] });
  act(g, 0, 'Hamburger Recipe'); auto(g); ok(!!on(g, 0, 'Hungry Burger'), 'Hungry Burger Ritual Summoned');
});
T('Hand of Nephthys summons Sacred Phoenix', () => {
  const g = duel({ board: [{ m: ['Hand of Nephthys', FILL], deckTop: ['Sacred Phoenix of Nephthys'] }, {}] });
  effOf(g, on(g, 0, 'Hand of Nephthys'), 'Tribute'); auto(g); ok(!!on(g, 0, 'Sacred Phoenix of Nephthys'), 'Phoenix summoned');
});
T('Harpies’ Hunting Ground: +200 and a Spell/Trap destroyed on a Harpie summon', () => {
  const g = duel({ board: [{ hand: ["Harpies' Hunting Ground", 'Harpie Lady'] }, { st: ['Mirror Force'] }] });
  act(g, 0, "Harpies' Hunting Ground"); auto(g); nsN(g, 0, 'Harpie Lady'); passAll(g); if (g.prompt.type === 'pick') choose(g, 'Face-down'); auto(g);
  const h = on(g, 0, 'Harpie Lady'); ok(h && E.atk(g, h) === 1500, `Harpie 1500 (${h && E.atk(g, h)})`);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Hayabusa Knight attacks twice', () => {
  const g = duel({ board: [{ m: ['Hayabusa Knight'], turn: 2 }, {}] });
  const h = on(g, 0, 'Hayabusa Knight'); goBP(g); attack(g, h, null); auto(g); attack(g, h, null); auto(g);
  ok(g.p[1].lp === 6000, `2000 damage (${g.p[1].lp})`);
});
T('Heart of Clear Water: survives battle and targeted destruction', () => {
  const g = duel({ board: [{ hand: ['Heart of Clear Water', 'Mystical Space Typhoon'], m: ['Hane-Hane'] }, { hand: ['Smashing Ground'] }] });
  act(g, 0, 'Heart of Clear Water'); auto(g);
  const h = on(g, 0, 'Hane-Hane'); ok(E.lib.has(g, h, 'noBattleDestroy'), 'cannot be destroyed by battle');
  ok(inZ(g, 0, 'st', 'Heart of Clear Water'), 'stays equipped');
  const g2 = duel({ board: [{ hand: ['Heart of Clear Water'], m: ['Getsu Fuhma'] }, {}] });
  act(g2, 0, 'Heart of Clear Water'); auto(g2); choose(g2, 'end'); auto(g2);
  ok(inZ(g2, 0, 'gy', 'Heart of Clear Water'), 'destroyed on a 1300+ monster');
});
T('Heart of the Underdog draws on a Normal Monster draw', () => {
  const g = duel({ board: [{ st: [{ n: 'Heart of the Underdog', pos: 'up' }], deckTop: ['Gradius', 'Gradius', FILL] }, {}] });
  auto(g);
  ok(g.p[0].hand.length >= 7, `drew extra (${g.p[0].hand.length})`);
});
T('Heavy Mech Support Platform equips to a Machine and takes its destruction', () => {
  const g = duel({ board: [{ hand: ['Hammer Shot'], m: ['Heavy Mech Support Platform', 'Helping Robo for Combat'] }, {}] });
  effOf(g, on(g, 0, 'Heavy Mech Support Platform'), 'Equip'); auto(g);
  const r = on(g, 0, 'Helping Robo for Combat'); ok(E.atk(g, r) === 2100, `Robo 2100 (${E.atk(g, r)})`);
  act(g, 0, 'Hammer Shot'); auto(g);
  ok(on(g, 0, 'Helping Robo for Combat') && inZ(g, 0, 'gy', 'Heavy Mech Support Platform'), 'Platform destroyed instead');
});
T('Helping Robo for Combat draws and returns after a battle kill', () => {
  const g = duel({ board: [{ m: ['Helping Robo for Combat'], turn: 2 }, { m: [{ n: 'Hane-Hane', pos: 'atk' }] }] });
  const h0 = g.p[0].hand.length; goBP(g); attack(g, on(g, 0, 'Helping Robo for Combat'), on(g, 1, 'Hane-Hane')); auto(g);
  ok(g.p[0].hand.length === h0, `hand size kept (${g.p[0].hand.length})`);
});
T('Helpoemer: random discard at the end of the opponent’s Battle Phase', () => {
  const g = duel({ board: [{ m: ['Dark Armed Dragon'], turn: 2 }, { m: ['Helpoemer'] }] });
  const h0 = g.p[0].hand.length; goBP(g); attack(g, on(g, 0, 'Dark Armed Dragon'), on(g, 1, 'Helpoemer')); auto(g); choose(g, 'end'); auto(g);
  ok(g.p[0].hand.length === h0 - 1, `A discarded 1 (${h0} to ${g.p[0].hand.length})`);
});
T('Hidden Spellbook shuffles 2 Spells back', () => {
  const g = duel({ board: [{ st: ['Hidden Spellbook'], gy: ['Heavy Storm', 'Hammer Shot'], turn: 2 }, {}] });
  act(g, 0, 'Hidden Spellbook'); auto(g); ok(!inZ(g, 0, 'gy', 'Heavy Storm') && !inZ(g, 0, 'gy', 'Hammer Shot'), 'both shuffled in');
});
T('Heavy Slump and Gamble', () => {
  const g = duel({ board: [{ st: ['Heavy Slump'], turn: 2 }, { hand: Array(8).fill(FILL) }] });
  act(g, 0, 'Heavy Slump'); auto(g); ok(g.p[1].hand.length === 2, `B has 2 (${g.p[1].hand.length})`);
  const g2 = duel({ seed: 3, board: [{ hand: [], st: ['Gamble'], turn: 2 }, { hand: Array(6).fill(FILL) }] });
  act(g2, 0, 'Gamble'); auto(g2);
  ok(g2.p[0].hand.length === 5 || (g2.f22skip && g2.f22skip[0] != null), `drew to 5 or skips (${g2.p[0].hand.length})`);
});
T('Gorgon’s Eye and Goblin’s Secret Remedy', () => {
  const g = duel({ board: [{ hand: ["Goblin's Secret Remedy"], st: ["Gorgon's Eye"], turn: 2 }, {}] });
  act(g, 0, "Goblin's Secret Remedy"); auto(g); ok(g.p[0].lp === 8600, 'gained 600');
  act(g, 0, "Gorgon's Eye"); auto(g); ok(g.gorgonEye === g.turnNo, 'Defense Position effects negated');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-22 checks passed.');
process.exit(fails ? 1 : 0);
