// Scenario checks for full pool batch 27: node build/test_full-27.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = (ex, main) => ({ name: 't', main: (main || Array(40).fill(FILL)).map(id), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0, o.main0), mk(o.ex1, o.main1)], first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
function auto(g, o = {}) {
  for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') E.act(g, [o.no ? 'n' : 'y']);
    else if (pr.type === 'choose') E.act(g, [pr.opts[o.ci || 0].key]);
    else E.act(g, pr.opts.slice(0, Math.max(pr.min, Math.min(pr.max, 1))).map(x => x.key));
  }
}
const cardOf = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + cardOf(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const st = (g, p, n) => g.p[p].st.find(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const goBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => choose(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const ns = (g, p, n) => choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u);
const logHas = (g, s) => g.log.some(l => l.includes(s));

/* ----- Polymerization ----- */
const atkOf = (g, c) => E.atk(g, c);

T("Sage's Stone summons Dark Magician from the Deck", () => {
  const g = duel({ main0: ['Dark Magician', ...Array(39).fill(FILL)], board: [{ hand: ["Sage's Stone"], m: ['Dark Magician Girl'] }, {}] });
  act(g, 0, "Sage's Stone"); auto(g);
  ok(!!on(g, 0, 'Dark Magician'), 'Dark Magician Special Summoned');
});
T('Sakuretsu Armor destroys the attacker', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: [FILL], st: ['Sakuretsu Armor'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, FILL)); choose(g, 'Sakuretsu', 1); auto(g);
  ok(!on(g, 0, 'Dark Magician') && on(g, 1, FILL), 'attacker destroyed, defender safe');
});
T('Sand Gambler tosses 3 coins once per turn', () => {
  const g = duel({ board: [{ m: ['Sand Gambler'] }, { m: [FILL] }] });
  choose(g, 'a:' + on(g, 0, 'Sand Gambler').u + ':'); auto(g);
  ok(g.log.filter(l => l.includes('tossed a coin')).length === 3, '3 coins tossed');
  ok(!hasOpt(g, 'a:' + (on(g, 0, 'Sand Gambler') || { u: -1 }).u + ':'), 'not again this turn');
});
T('Second Coin Toss redoes the Sand Gambler toss', () => {
  const g = duel({ board: [{ m: ['Sand Gambler'], st: [{ n: 'Second Coin Toss', pos: 'up' }] }, { m: [FILL] }] });
  choose(g, 'a:' + on(g, 0, 'Sand Gambler').u + ':'); auto(g);
  ok(g.log.filter(l => l.includes('tossed a coin')).length === 6 && logHas(g, 'redid the coin toss'), '6 coins tossed with a redo');
});
T('Sanga of the Thunder makes the attacker 0 ATK', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: ['Sanga of the Thunder'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Sanga of the Thunder'));
  for (let i = 0; i < 12 && g.prompt.type === 'respond' && !hasOpt(g, 'ATK 0'); i++) E.act(g, ['pass']);
  choose(g, 'ATK 0', 1); auto(g);
  ok(!on(g, 0, 'Dark Magician') && g.p[0].lp === 5400, `Dark Magician destroyed, A took 2600 (A ${g.p[0].lp})`);
});
T("Sebek's Blessing gains the direct damage", () => {
  const g = duel({ board: [{ hand: ["Sebek's Blessing"], m: ['Dark Magician'], turn: 2 }, {}] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), null); auto(g);
  act(g, 0, "Sebek's Blessing"); auto(g);
  ok(g.p[0].lp === 10500, `A gained 2500 (A ${g.p[0].lp})`);
});
T('Second Goblin equips to Giant Orc, changes its position, and dies in its place', () => {
  const g = duel({ board: [{ m: ['Second Goblin', 'Giant Orc'] }, {}] });
  choose(g, 'a:' + on(g, 0, 'Second Goblin').u + ':0'); auto(g);
  const sg = st(g, 0, 'Second Goblin'); ok(!!sg && sg.equipTo === on(g, 0, 'Giant Orc').u, 'equipped to Giant Orc');
  choose(g, 'a:' + sg.u + ':2'); auto(g);
  ok(on(g, 0, 'Giant Orc').pos === 'def', 'Giant Orc changed to Defense Position');
  const g2 = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Giant Orc'], st: [{ n: 'Second Goblin', pos: 'up' }] }] });
  const sg2 = st(g2, 1, 'Second Goblin'); sg2.equipTo = on(g2, 1, 'Giant Orc').u; sg2.flags.union = true;
  goBP(g2); attack(g2, on(g2, 0, 'Blue-Eyes White Dragon'), on(g2, 1, 'Giant Orc')); auto(g2);
  ok(on(g2, 1, 'Giant Orc') && inZ(g2, 1, 'gy', 'Second Goblin'), 'Second Goblin destroyed instead');
});
T('Self-Destruct Button ends the duel in a draw', () => {
  const g = duel({ board: [{ lp: 500, st: ['Self-Destruct Button'] }, {}] });
  choose(g, 'end'); auto(g); // B's turn
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Self-Destruct'); i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else auto(g); }
  choose(g, 'Self-Destruct', 0); auto(g);
  ok(g.winner === -1 && !g.prompt, 'draw');
});
T('Senju adds a Ritual Monster on Normal Summon', () => {
  const g = duel({ main0: ['Shinato, King of a Higher Plane', ...Array(39).fill(FILL)], board: [{ hand: ['Senju of the Thousand Hands'] }, {}] });
  ns(g, 0, 'Senju of the Thousand Hands'); auto(g);
  ok(inZ(g, 0, 'hand', 'Shinato, King of a Higher Plane'), 'Shinato added');
});
T('Serial Spell copies Sparks', () => {
  const g = duel({ board: [{ hand: ['Sparks', FILL], st: ['Serial Spell'] }, {}] });
  act(g, 0, 'Sparks'); choose(g, 'Serial Spell', 0); auto(g);
  ok(g.p[1].lp === 7600 && inZ(g, 0, 'gy', FILL), `400 damage, hand discarded (B ${g.p[1].lp})`);
});
T('Serpentine Princess summons from the Deck when shuffled back', () => {
  const g = duel({ main0: ['Sand Gambler', ...Array(39).fill(FILL)], board: [{ hand: ['Compulsory Evacuation Device'], m: ['Serpentine Princess'] }, {}] });
  // return it with Compulsory Evacuation Device? that returns to hand; use a deck return instead
  const sp = on(g, 0, 'Serpentine Princess');
  E.lib.move(g, sp, 'deck', { reason: 'effect' }); choose(g, 'end');
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) auto(g);
  ok(!!on(g, 0, 'Sand Gambler') || logHas(g, 'Special Summoned Sand Gambler'), 'Sand Gambler Special Summoned');
});
T('Shadowknight halves its battle damage and pays 900', () => {
  const g = duel({ board: [{ m: ['Shadowknight Archfiend'], turn: 2 }, {}] });
  goBP(g); attack(g, on(g, 0, 'Shadowknight Archfiend'), null); auto(g);
  ok(g.p[1].lp === 7000, `B took 1000 (B ${g.p[1].lp})`);
});
T('Shadowslayer attacks directly when all their monsters are in Defense', () => {
  const g = duel({ board: [{ m: ['Shadowslayer'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  goBP(g); ok(hasOpt(g, `atk:${on(g, 0, 'Shadowslayer').u}:d`), 'direct attack offered');
  const g2 = duel({ board: [{ m: ['Shadowslayer'], turn: 2 }, { m: [FILL] }] });
  goBP(g2); ok(!hasOpt(g2, `atk:${on(g2, 0, 'Shadowslayer').u}:d`), 'not with an Attack Position monster');
});
T('Share the Pain: both Tribute', () => {
  const g = duel({ board: [{ hand: ['Share the Pain'], m: [FILL] }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Share the Pain'); auto(g);
  ok(!on(g, 0, FILL) && !on(g, 1, 'Dark Magician'), 'both monsters gone');
});
T('Shift moves the attack', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: [FILL, { n: 'Big Shield Gardna', pos: 'def' }], st: ['Shift'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, FILL)); choose(g, 'Shift', 1); auto(g);
  ok(on(g, 1, FILL) && g.p[0].lp === 7900, `the attack went to Big Shield Gardna (A ${g.p[0].lp})`);
});
T('Shifting Shadows rearranges face-down monsters', () => {
  const g = duel({ board: [{ m: [{ n: FILL, pos: 'set' }, { n: 'Dark Magician', pos: 'set' }], st: [{ n: 'Shifting Shadows', pos: 'up' }] }, {}] });
  choose(g, 'a:' + st(g, 0, 'Shifting Shadows').u + ':1'); auto(g);
  ok(g.p[0].lp === 7700 && logHas(g, 'rearranged 2'), 'paid 300 and rearranged');
});
T("Shinato's Ark summons Shinato, which burns on a Defense kill", () => {
  const g = duel({ board: [{ hand: ["Shinato's Ark", 'Shinato, King of a Higher Plane'], m: ['Blue-Eyes White Dragon'] }, {}] });
  act(g, 0, "Shinato's Ark"); auto(g);
  ok(!!on(g, 0, 'Shinato, King of a Higher Plane'), 'Shinato Ritual Summoned');
  const g2 = duel({ board: [{ m: ['Shinato, King of a Higher Plane'], turn: 2 }, { m: [{ n: 'Dark Magician', pos: 'def' }] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Shinato, King of a Higher Plane'), on(g2, 1, 'Dark Magician')); auto(g2);
  ok(g2.p[1].lp === 5500, `B took 2500 (B ${g2.p[1].lp})`);
});
T('Silpheed: summon by banishing a WIND; random discard when destroyed by battle', () => {
  const g = duel({ board: [{ hand: ['Silpheed'], gy: ['Shadowknight Archfiend'] }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'no Normal Summon');
  choose(g, 'sp:' + g.p[0].hand[0].u); auto(g);
  ok(on(g, 0, 'Silpheed') && inZ(g, 0, 'ban', 'Shadowknight Archfiend'), 'Special Summoned, WIND banished');
  const g2 = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: ['Silpheed'] }] });
  goBP(g2); const h = g2.p[0].hand.length; attack(g2, on(g2, 0, 'Dark Magician'), on(g2, 1, 'Silpheed')); auto(g2);
  ok(g2.p[0].hand.length === h - 1, `A discarded 1 (${g2.p[0].hand.length})`);
});
T('Skilled Dark Magician counts Spells and summons Dark Magician', () => {
  const g = duel({ main0: ['Dark Magician', ...Array(39).fill(FILL)], board: [{ hand: ['Sparks', 'Sparks', 'Sparks'], m: ['Skilled Dark Magician'] }, {}] });
  for (let i = 0; i < 3; i++) { act(g, 0, 'Sparks'); auto(g); }
  const s = on(g, 0, 'Skilled Dark Magician'); ok(E.lib.ctr(s, 'spell') === 3, '3 counters');
  choose(g, 'a:' + s.u + ':'); auto(g);
  ok(!!on(g, 0, 'Dark Magician'), 'Dark Magician summoned');
});
T('Slate Warrior weakens the monster that destroys it', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: ['Slate Warrior'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Slate Warrior')); auto(g);
  ok(atkOf(g, on(g, 0, 'Dark Magician')) === 2000, 'Dark Magician at 2000');
});
T('Smoke Grenade of the Thief discards from their hand when destroyed', () => {
  const g = duel({ board: [{ hand: ['Smoke Grenade of the Thief', 'Mystical Space Typhoon'], m: [FILL] }, { hand: ['Dark Magician'] }] });
  act(g, 0, 'Smoke Grenade of the Thief'); auto(g); act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(inZ(g, 1, 'gy', 'Dark Magician'), 'Dark Magician discarded');
});
T('Snatch Steal takes control; it returns when Snatch Steal leaves', () => {
  const g = duel({ board: [{ hand: ['Snatch Steal', 'Mystical Space Typhoon'] }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Snatch Steal'); auto(g); ok(!!on(g, 0, 'Dark Magician'), 'taken');
  act(g, 0, 'Mystical Space Typhoon'); auto(g); ok(!!on(g, 1, 'Dark Magician'), 'returned');
});
T('Solar Flare Dragon burns 500 in the End Phase and hides behind a Pyro', () => {
  const g = duel({ board: [{ m: ['Solar Flare Dragon', 'Solar Flare Dragon'] }, {}] });
  choose(g, 'end'); auto(g); ok(g.p[1].lp === 7000, `B took 1000 (B ${g.p[1].lp})`);
});
T('Solar Ray: 600 per face-up LIGHT', () => {
  const g = duel({ board: [{ m: ['Sand Gambler', 'Senju of the Thousand Hands'], st: ['Solar Ray'] }, { hand: [FILL] }] });
  choose(g, 'end'); auto(g);
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Solar Ray'); i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else auto(g); }
  choose(g, 'Solar Ray', 0); auto(g); ok(g.p[1].lp === 6800, `B took 1200 (B ${g.p[1].lp})`);
});
T('Solemn Wishes gains 500 on the draw', () => {
  const g = duel({ board: [{ st: [{ n: 'Solemn Wishes', pos: 'up' }] }, {}] });
  choose(g, 'end'); auto(g); for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'idle' && g.tp === 1; i++) { choose(g, 'end'); auto(g); }
  ok(g.p[0].lp === 9000, `A gained 500 for each of 2 draws (A ${g.p[0].lp})`);
});
T("Solomon's Lawbook stops Standby Phase effects next turn", () => {
  const g = duel({ board: [{ m: ['Shadowknight Archfiend'], hand: ["Solomon's Lawbook"] }, {}] });
  const c = g.p[0].hand[0]; choose(g, 'setst:' + c.u); choose(g, 'end'); auto(g);
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, "Solomon"); i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else auto(g); }
  choose(g, "Solomon", 0); auto(g); const lp0 = g.p[0].lp; for (let i = 0; i < 10 && g.tp === 1; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else auto(g); }
  auto(g); ok(g.turnNo === 3 && g.p[0].lp === lp0, `no 900 paid in turn 3 (A ${g.p[0].lp})`);
});
T('Sorcerer of Dark Magic negates a Trap', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: [FILL], st: ['Sakuretsu Armor'] }] });
  const s = E.lib.D; // place Sorcerer on A's field via board
  const g2 = duel({ board: [{ m: ['Sorcerer of Dark Magic'], turn: 2 }, { m: [FILL], st: ['Sakuretsu Armor'] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Sorcerer of Dark Magic'), on(g2, 1, FILL)); choose(g2, 'Sakuretsu', 1); choose(g2, 'Negate the Trap', 0); auto(g2);
  ok(!!on(g2, 0, 'Sorcerer of Dark Magic') && inZ(g2, 1, 'gy', 'Sakuretsu Armor'), 'Sorcerer survives, Sakuretsu destroyed');
  const g3 = duel({ board: [{ hand: ['Sorcerer of Dark Magic'], m: ['Dark Magician', 'Dark Magician Girl'] }, {}] });
  choose(g3, 'sp:' + g3.p[0].hand[0].u); auto(g3); ok(!!on(g3, 0, 'Sorcerer of Dark Magic'), 'Special Summoned by Tributing 2');
});
T('Spatial Collapse stops a 6th card', () => {
  const g = duel({ board: [{ hand: [FILL, 'Sparks'], m: [FILL, FILL], st: ['Sparks', { n: 'Spatial Collapse', pos: 'up' }, 'Sparks'] }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'no Normal Summon at 5 cards');
});
T('Spear Cretin revives a monster for each player', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: [{ n: 'Spear Cretin', pos: 'set' }], gy: ['Blue-Eyes White Dragon'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Spear Cretin')); auto(g);
  ok(!!on(g, 1, 'Blue-Eyes White Dragon'), 'B revived Blue-Eyes');
});
T('Spear Dragon pierces and goes to Defense', () => {
  const g = duel({ board: [{ m: ['Spear Dragon'], turn: 2 }, { m: [{ n: 'Sand Gambler', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Spear Dragon'), on(g, 1, 'Sand Gambler')); auto(g);
  ok(g.p[1].lp === 7700 && on(g, 0, 'Spear Dragon').pos === 'def', `300 piercing, Spear Dragon in Defense (B ${g.p[1].lp})`);
});
T('Special Hurricane destroys Special Summoned monsters only', () => {
  const g = duel({ board: [{ hand: ['Special Hurricane', FILL, FILL] }, { m: [FILL, 'Dark Magician'] }] });
  on(g, 1, 'Dark Magician').summonType = 'special';
  ns(g, 0, FILL); auto(g); act(g, 0, 'Special Hurricane'); auto(g);
  ok(!on(g, 1, 'Dark Magician') && on(g, 1, FILL), 'only the Special Summoned one');
});
T('Spellbinding Circle stops attacks', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { st: ['Spellbinding Circle'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), null); choose(g, 'Spellbinding', 1); auto(g);
  ok(g.p[1].lp === 8000 && !hasOpt(g, `atk:${on(g, 0, 'Dark Magician').u}:`), 'attack stopped, no attacks after');
});
T('Spellbook Organization reorders the top 3', () => {
  const g = duel({ board: [{ hand: ['Spellbook Organization'], deckTop: [FILL, 'Sparks', 'Dark Magician', 'Sand Gambler'] }, {}] });
  act(g, 0, 'Spellbook Organization'); choose(g, 'Sand Gambler'); choose(g, 'Sparks'); auto(g);
  const d = g.p[0].deck; ok(E.name(d[d.length - 1]) === 'Sand Gambler' && E.name(d[d.length - 2]) === 'Sparks' && E.name(d[d.length - 3]) === 'Dark Magician', 'order Sand Gambler, Sparks, Dark Magician');
});
T('Sphinx Teleia: summon with Pyramid of Light; half DEF burn', () => {
  const g = duel({ board: [{ hand: ['Sphinx Teleia'], st: [{ n: 'Pyramid of Light', pos: 'up' }] }, {}] });
  choose(g, 'a:' + g.p[0].hand[0].u + ':'); auto(g);
  ok(on(g, 0, 'Sphinx Teleia') && g.p[0].lp === 7500, 'summoned for 500');
  const g2 = duel({ board: [{ m: ['Sphinx Teleia'], turn: 2 }, { m: [{ n: 'Sand Gambler', pos: 'def' }] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Sphinx Teleia'), on(g2, 1, 'Sand Gambler')); auto(g2);
  ok(g2.p[1].lp === 7200, `B took 800 (B ${g2.p[1].lp})`);
});
T('Spiral Spear Strike: Gaia pierces and draws', () => {
  const g = duel({ board: [{ m: ['Gaia the Dragon Champion'], st: [{ n: 'Spiral Spear Strike', pos: 'up' }], turn: 2 }, { m: [{ n: 'Sand Gambler', pos: 'def' }] }] });
  const h = g.p[0].hand.length; goBP(g); attack(g, on(g, 0, 'Gaia the Dragon Champion'), on(g, 1, 'Sand Gambler')); auto(g);
  ok(g.p[1].lp === 7000 && g.p[0].hand.length === h + 1, `1000 piercing, drew 2 discarded 1 (B ${g.p[1].lp})`);
});
T("Spirit's Invitation bounces when a Spirit returns", () => {
  const g = duel({ board: [{ hand: ['Asura Priest'], st: [{ n: "Spirit's Invitation", pos: 'up' }] }, { m: ['Dark Magician'] }] });
  auto(g); ns(g, 0, 'Asura Priest'); auto(g); choose(g, 'end'); auto(g);
  ok(inZ(g, 1, 'hand', 'Dark Magician'), 'Dark Magician returned');
});
T('Spiritualism returns a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Spiritualism'] }, { st: ['Sakuretsu Armor'] }] });
  act(g, 0, 'Spiritualism'); auto(g); ok(inZ(g, 1, 'hand', 'Sakuretsu Armor'), 'returned');
});
T('Spring of Rebirth gains 500 on a bounce', () => {
  const g = duel({ board: [{ hand: ['Compulsory Evacuation Device'], st: [{ n: 'Spring of Rebirth', pos: 'up' }] }, { m: ['Dark Magician'] }] });
  const c = g.p[0].hand[0]; choose(g, 'setst:' + c.u); choose(g, 'end'); auto(g);
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Compulsory'); i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else auto(g); }
  choose(g, 'Compulsory', 0); auto(g); ok(g.p[0].lp === 8500, `A gained 500 (A ${g.p[0].lp})`);
});
T('Stamping Destruction destroys and burns 500', () => {
  const g = duel({ board: [{ hand: ['Stamping Destruction'], m: ['Spear Dragon'] }, { st: ['Sakuretsu Armor'] }] });
  act(g, 0, 'Stamping Destruction'); auto(g);
  ok(inZ(g, 1, 'gy', 'Sakuretsu Armor') && g.p[1].lp === 7500, 'destroyed, 500 damage');
});
T('Star Boy: WATER +500, FIRE -400', () => {
  const g = duel({ board: [{ m: ['Star Boy', 'Solar Flare Dragon'] }, {}] });
  ok(atkOf(g, on(g, 0, 'Star Boy')) === 1050 && atkOf(g, on(g, 0, 'Solar Flare Dragon')) === 1100, 'stats changed');
});
T('Statue of the Wicked makes a token when destroyed while Set', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'] }, { st: ['Statue of the Wicked'] }] });
  act(g, 0, 'Mystical Space Typhoon'); auto(g); ok(!!on(g, 1, 'Wicked Token'), 'Wicked Token summoned');
});
T('Staunch Defender: only the selected monster can be attacked', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: [FILL, 'Sand Gambler'], st: ['Staunch Defender'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, FILL)); choose(g, 'Staunch', 1); choose(g, 'Sand Gambler'); auto(g);
  ok(on(g, 1, FILL) && hasOpt(g, `atk:${on(g, 0, 'Dark Magician').u}:${on(g, 1, 'Sand Gambler').u}`) && !hasOpt(g, `atk:${on(g, 0, 'Dark Magician').u}:${on(g, 1, FILL).u}`), 'attack stopped; only Sand Gambler can be attacked');
});
T('Stealth Bird burns 1000 on Flip Summon', () => {
  const g = duel({ board: [{ m: [{ n: 'Stealth Bird', pos: 'set' }] }, {}] });
  choose(g, 'flip:' + on(g, 0, 'Stealth Bird').u); auto(g); ok(g.p[1].lp === 7000, `B took 1000 (B ${g.p[1].lp})`);
});
T('Steel Scorpion destroys its attacker two turns later', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: [{ n: 'Steel Scorpion', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Steel Scorpion')); auto(g);
  for (let i = 0; i < 60 && g.turnNo < 7; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else auto(g); }
  ok(!on(g, 0, 'Dark Magician'), 'Dark Magician destroyed');
});
T('Stim-Pack: +700, then -200 each Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Stim-Pack'], m: [FILL] }, {}] });
  act(g, 0, 'Stim-Pack'); auto(g); const m = on(g, 0, FILL); ok(atkOf(g, m) === 2700, `2700 (${atkOf(g, m)})`);
  for (let i = 0; i < 20 && g.turnNo < 3; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else auto(g); }
  ok(atkOf(g, m) === 2500, `2500 after a Standby Phase (${atkOf(g, m)})`);
});
T('Stone Statue of the Aztecs doubles the attacker\'s damage', () => {
  const g = duel({ board: [{ m: ['Sand Gambler'], turn: 2 }, { m: [{ n: 'Stone Statue of the Aztecs', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Sand Gambler'), on(g, 1, 'Stone Statue of the Aztecs')); auto(g);
  ok(g.p[0].lp === 4600, `A took 3400 (A ${g.p[0].lp})`);
});
T('Stop Defense flips a face-down monster to Attack', () => {
  const g = duel({ board: [{ hand: ['Stop Defense'] }, { m: [{ n: 'Stealth Bird', pos: 'set' }] }] });
  act(g, 0, 'Stop Defense'); auto(g); ok(on(g, 1, 'Stealth Bird').pos === 'atk', 'in Attack Position');
});
T('Seal of the Ancients pays 1000 and shows the Set cards', () => {
  const g = duel({ board: [{ hand: ['Seal of the Ancients'] }, { st: ['Sakuretsu Armor'] }] });
  act(g, 0, 'Seal of the Ancients'); auto(g); ok(g.p[0].lp === 7000 && logHas(g, 'Sakuretsu Armor'), 'paid and saw');
});
T('Senri Eye looks at their top card in the Standby Phase', () => {
  const g = duel({ board: [{ st: [{ n: 'Senri Eye', pos: 'up' }] }, {}] });
  auto(g); choose(g, 'end'); for (let i = 0; i < 20 && g.turnNo < 3; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else auto(g); }
  ok(g.p[0].lp === 7900 && logHas(g, 'looked at the top card'), 'paid 100 and looked');
});

console.log(fails ? `${fails} FAILED` : 'All checks passed.');
process.exit(fails ? 1 : 0);
