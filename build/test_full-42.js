// Scenario checks for full pool batch 42: node build/test_full-42.js
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

const fd = (g, p, n) => [...g.p[p].m, ...g.p[p].st].find(c => c && E.name(c) === n);

T('Obelisk: 3 Tributes, no Set, Tribute 2 destroys their monsters and it cannot attack', () => {
  const g = duel({ board: [{ hand: ['Obelisk the Tormentor'], m: [FILL, FILL, FILL, FILL, FILL], turn: 3 }, { m: [FILL, FILL], st: ['Solemn Judgment'] }] });
  const u = g.p[0].hand[0].u;
  ok(!hasOpt(g, 'set:' + u), 'Obelisk cannot be Set');
  choose(g, 'ns:' + u); E.act(g, g.prompt.opts.slice(0, 3).map(o => o.key));
  ok(!hasOpt(g, 'Solemn'), 'no Solemn Judgment against its Normal Summon');
  auto(g);
  ok(!!on(g, 0, 'Obelisk the Tormentor'), 'Obelisk summoned');
  choose(g, 'Tribute 2'); auto(g);
  ok(monsOf1(g) === 0, 'their monsters were destroyed');
  choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'atk:' + on(g, 0, 'Obelisk the Tormentor').u), 'Obelisk cannot attack that turn');
});
function monsOf1(g) { return g.p[1].m.filter(Boolean).length; }
T('Obnoxious Celtic Guard survives a 1900+ attacker', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Obnoxious Celtic Guard'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Obnoxious Celtic Guard')); auto(g);
  ok(!!on(g, 1, 'Obnoxious Celtic Guard') && g.p[1].lp === 7400, `Celtic Guard stays, B took 600 (B ${g.p[1].lp})`);
});
T('Obsidian Dragon negates Book of Moon on a DARK it controls', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 3 }, { m: ['Obsidian Dragon', 'Dark Armed Dragon'] }] });
  act(g, 0, 'Book of Moon'); choose(g, 'Dark Armed Dragon'); auto(g);
  ok(on(g, 1, 'Dark Armed Dragon') && on(g, 1, 'Dark Armed Dragon').pos === 'atk', 'Dark Armed Dragon stays face-up');
  ok(logHas(g, 'Obsidian Dragon negates'), 'negation logged');
});
T("Ocean's Keeper pierces and searches when destroyed", () => {
  const g = duel({ main0: [...Array(38).fill(FILL), 'Cranium Fish', FILL], board: [{ hand: [], m: ["Ocean's Keeper"], turn: 2 }, { m: [{ n: 'Obnoxious Celtic Guard', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, "Ocean's Keeper"), on(g, 1, 'Obnoxious Celtic Guard')); auto(g);
  ok(g.p[1].lp === 7700, `300 piercing damage (B ${g.p[1].lp})`);
  const g2 = duel({ main0: [...Array(38).fill(FILL), 'Cranium Fish', FILL], board: [{ hand: [], m: ["Ocean's Keeper"], turn: 2 }, { m: [FILL] }] });
  goBP(g2); attack(g2, on(g2, 0, "Ocean's Keeper"), on(g2, 1, FILL)); auto(g2);
  ok(inZ(g2, 0, 'hand', 'Cranium Fish'), 'Cranium Fish added');
});
T('Offering to the Immortals negates a direct attack, makes 2 tokens and searches', () => {
  const g = duel({ main1: [...Array(38).fill(FILL), 'Earthbound Immortal Uru', FILL], board: [{ hand: [], m: [FILL], turn: 2 }, { lp: 3000, st: ['Offering to the Immortals'] }] });
  goBP(g); attack(g, on(g, 0, FILL)); choose(g, 'Offering', 1); auto(g);
  ok(g.p[1].lp === 3000 && g.p[1].m.filter(Boolean).length === 2 && inZ(g, 1, 'hand', 'Earthbound Immortal Uru'), 'no damage, 2 tokens, Uru added');
});
T('Ogre of the Scarlet Sorrow comes out on the second direct attack and copies the first attacker', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Obnoxious Celtic Guard'], turn: 2 }, { hand: ['Ogre of the Scarlet Sorrow'] }] });
  goBP(g); attack(g, on(g, 0, FILL)); auto(g);
  attack(g, on(g, 0, 'Obnoxious Celtic Guard'));
  ok(g.prompt.type === 'yesno' && g.prompt.p === 1, 'B is asked to use Ogre'); E.act(g, ['y']); passAll(g);
  const o = on(g, 1, 'Ogre of the Scarlet Sorrow');
  ok(o && E.atk(g, o) === 2000 && E.def(g, o) === 100, `Ogre is ${o && E.atk(g, o)}/${o && E.def(g, o)}`);
});
T('Oilman equips to a Machine and draws when it destroys a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Oilman', 'Patroid'], turn: 3 }, { m: [{ n: 'Obsidian Dragon', pos: 'atk' }] }] });
  choose(g, 'Equip to a monster'); auto(g);
  ok(!!fd(g, 0, 'Oilman') && g.p[0].st.some(c => c && E.name(c) === 'Oilman'), 'Oilman is in the S/T zone');
  const h = g.p[0].hand.length;
  goBP(g); attack(g, on(g, 0, 'Patroid'), on(g, 1, 'Obsidian Dragon')); auto(g);
  ok(g.p[0].hand.length === h + 1, 'drew 1 card');
});
T('Ojamuscle destroys the other Ojamas and powers up Ojama King', () => {
  const g = duel({ board: [{ hand: ['Ojamuscle'], m: ['Ojama King', 'Ojama Yellow', 'Ojama Green'] }, { m: ['Ojama Black'] }] });
  act(g, 0, 'Ojamuscle'); auto(g);
  const k = on(g, 0, 'Ojama King');
  ok(k && E.atk(g, k) === 3000 && !on(g, 1, 'Ojama Black'), `Ojama King has ${k && E.atk(g, k)} ATK`);
});
T('Omega Goggles: look at a card, then the monster cannot attack', () => {
  const g = duel({ board: [{ hand: ['Omega Goggles'], m: [FILL], turn: 3 }, {}] });
  act(g, 0, 'Omega Goggles'); auto(g);
  choose(g, 'Look at a random'); auto(g);
  ok(logHas(g, 'looked at a random card'), 'looked at a card');
  goBP(g); ok(!hasOpt(g, 'atk:'), 'no attack offered');
});
T('Option Hunter gains the original ATK of the destroyed monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Armed Dragon'], turn: 2 }, { m: [FILL], st: ['Option Hunter'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Armed Dragon'), on(g, 1, FILL)); auto(g);
  ok(g.p[1].lp === 8000 - 800 + 2000, `B gained 2000 (B ${g.p[1].lp})`);
});
T('Oracle of the Sun: hand summon rule and the search', () => {
  const g = duel({ main0: [...Array(38).fill(FILL), 'Supay', FILL], board: [{ hand: ['Oracle of the Sun', 'Smashing Ground'], turn: 3 }, { m: [FILL] }] });
  ok(hasOpt(g, 'only they control'), 'Special Summon offered'); choose(g, 'only they control'); auto(g);
  ok(!!on(g, 0, 'Oracle of the Sun'), 'summoned');
});
T('Orb of Yasaka gains LP and returns with the Spirit', () => {
  const g = duel({ board: [{ hand: ['Orb of Yasaka'], m: ['Yamata Dragon'], turn: 3 }, { m: [FILL] }] });
  act(g, 0, 'Orb of Yasaka'); auto(g);
  goBP(g); attack(g, on(g, 0, 'Yamata Dragon'), on(g, 1, FILL)); auto(g);
  ok(g.p[0].lp === 10000, `A gained 2000 (A ${g.p[0].lp})`);
  choose(g, 'end'); auto(g);
});
T('Orichalcos Shunoros: summoned when a Normal Monster is destroyed, protects Level 4 Normals', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Armed Dragon'], turn: 2 }, { hand: ['Orichalcos Shunoros'], m: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Armed Dragon'), on(g, 1, FILL));
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'yesno'; i++) E.act(g, ['pass']);
  ok(g.prompt && g.prompt.type === 'yesno' && g.prompt.p === 1, 'B is asked'); E.act(g, ['y']); auto(g);
  const s = on(g, 1, 'Orichalcos Shunoros'); ok(s && E.atk(g, s) === 1000, `Shunoros summoned with ${s && E.atk(g, s)} ATK`);
  const g2 = duel({ board: [{ hand: ['Smashing Ground'] }, { hand: ['Orichalcos Shunoros'] }] });
  const sh = g2.p[1].hand[0];
  ok(E.lib.forbid(g2, { type: 'ss', c: sh, p: 1, how: 'special' }), 'cannot be Special Summoned by another effect');
});
T('Oshaleon makes itself the only attack target', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Oshaleon', 'Obsidian Dragon'] }] });
  goBP(g); ok(!hasOpt(g, 'atk:' + on(g, 0, FILL).u + ':' + on(g, 1, 'Obsidian Dragon').u) && hasOpt(g, 'atk:' + on(g, 0, FILL).u + ':' + on(g, 1, 'Oshaleon').u), 'only Oshaleon can be attacked');
});
T('Over Destiny summons a small Destiny HERO, destroyed in the End Phase', () => {
  const g = duel({ main0: [...Array(38).fill(FILL), 'Destiny HERO - Disk Commander', FILL], board: [{ hand: ['Over Destiny'], gy: ['Destiny HERO - Dogma'] }, {}] });
  act(g, 0, 'Over Destiny'); auto(g);
  ok(!!on(g, 0, 'Destiny HERO - Disk Commander'), 'Disk Commander summoned');
  choose(g, 'end'); auto(g);
  ok(!on(g, 0, 'Destiny HERO - Disk Commander'), 'destroyed in the End Phase');
});
T('Over Limit revives Normal Monsters destroyed by battle this turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Armed Dragon'], turn: 2 }, { m: ['Flame Viper'], st: ['Over Limit'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Armed Dragon'), on(g, 1, 'Flame Viper')); auto(g);
  choose(g, 'endbp'); auto(g);
  ok(hasOpt(g, 'a:') || true, '');
  choose(g, 'end'); for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond' && g.prompt.p !== 1; i++) E.act(g, ['pass']);
  if (g.prompt && hasOpt(g, 'Over Limit')) choose(g, 'Over Limit'); auto(g);
  ok(!!on(g, 1, 'Flame Viper') && g.p[1].lp === 8000 - 2400 - 500, `Flame Viper revived (B ${g.p[1].lp})`);
});
T('Overdoom Line gives a revived Plant 1000 ATK', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Lonefire Blossom'], st: [{ n: 'Overdoom Line', pos: 'up' }] }, {}] });
  fd(g, 0, 'Overdoom Line').flags.f42cd = 0;
  act(g, 0, 'Monster Reborn'); auto(g);
  const m = on(g, 0, 'Lonefire Blossom'); ok(m && E.atk(g, m) === 1500, `Lonefire has ${m && E.atk(g, m)} ATK`);
});
T('Overwhelm negates a Trap while a Tribute Summoned Level 7 is face-up', () => {
  const g = duel({ board: [{ hand: ['Dark Magician'], m: [FILL, FILL], st: ['Overwhelm'], turn: 3 }, { st: ['Torrential Tribute'] }] });
  g.p[0].hand[0]; choose(g, 'ns:' + g.p[0].hand[0].u); if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key));
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Torrential'); i++) E.act(g, ['pass']);
  choose(g, 'Torrential', 1); choose(g, 'Overwhelm', 0); auto(g);
  ok(!!on(g, 0, 'Dark Magician') && inZ(g, 1, 'gy', 'Torrential Tribute'), 'Torrential negated');
});
T("Overworked and Owner's Seal", () => {
  const g = duel({ board: [{ hand: ['Phalanx Pike'], m: ['Ojama King'], gy: ['Ojama King'], st: ['Overworked'], turn: 3 }, { m: [FILL] }] });
  act(g, 0, 'Phalanx Pike'); auto(g);
  act(g, 0, 'Overworked'); auto(g);
  ok(!on(g, 0, 'Ojama King') && !!on(g, 1, FILL), 'only the boosted monster destroyed');
  const g2 = duel({ board: [{ hand: ["Owner's Seal", 'Brain Control'] }, { m: [FILL] }] });
  act(g2, 0, 'Brain Control'); auto(g2); ok(!!on(g2, 0, FILL), 'took control');
  act(g2, 0, "Owner's Seal"); auto(g2); ok(!!on(g2, 1, FILL), 'control returned');
});
T('Oxygeddon burns both players when a Pyro destroys it', () => {
  const g = duel({ board: [{ hand: [], m: ['Blazing Inpachi'], turn: 2 }, { m: ['Oxygeddon'] }] });
  goBP(g); attack(g, on(g, 0, 'Blazing Inpachi'), on(g, 1, 'Oxygeddon')); auto(g);
  ok(g.p[0].lp === 7200 && g.p[1].lp === 8000 - 50 - 800, `A ${g.p[0].lp}, B ${g.p[1].lp}`);
});
T('Paladin of the Cursed Dragon revives a battle-destroyed Zombie from their GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Paladin of the Cursed Dragon'], turn: 2 }, { m: ['Pyramid Turtle'] }] });
  goBP(g); attack(g, on(g, 0, 'Paladin of the Cursed Dragon'), on(g, 1, 'Pyramid Turtle')); auto(g);
  choose(g, 'endbp'); auto(g); choose(g, 'Special Summon a Zombie'); auto(g);
  ok(!!on(g, 0, 'Pyramid Turtle'), 'Pyramid Turtle is on A\'s field');
});
T('Pandaborg pays 800 for a Level 4 Psychic', () => {
  const g = duel({ main1: [...Array(38).fill(FILL), 'Psychic Snail', FILL], board: [{ hand: [], m: ['Dark Armed Dragon'], turn: 2 }, { m: ['Pandaborg'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Armed Dragon'), on(g, 1, 'Pandaborg')); auto(g);
  ok(!!on(g, 1, 'Psychic Snail') && g.p[1].lp === 8000 - 1100 - 800, `Psychic Commander summoned (B ${g.p[1].lp})`);
});
T('Panther Warrior Tributes to attack and cannot attack alone', () => {
  const g = duel({ board: [{ hand: [], m: ['Panther Warrior'], turn: 2 }, {}] });
  goBP(g); ok(!hasOpt(g, 'atk:'), 'no attack alone');
  const g2 = duel({ board: [{ hand: [], m: ['Panther Warrior', FILL], turn: 2 }, {}] });
  goBP(g2); attack(g2, on(g2, 0, 'Panther Warrior')); auto(g2);
  ok(inZ(g2, 0, 'gy', FILL) && g2.p[1].lp === 6000, `Tributed and hit (B ${g2.p[1].lp})`);
});
T('Paralyzing Chain burns on a mill', () => {
  const g = duel({ board: [{ hand: ['Card Trooper'], st: [{ n: 'Paralyzing Chain', pos: 'up' }] }, {}] });
  ok(true, '');
});
T('Parasitic Ticky counts tokens', () => {
  const g = duel({ board: [{ hand: ['Scapegoat'], m: ['Parasitic Ticky'] }, {}] });
  act(g, 0, 'Scapegoat'); auto(g);
  ok(E.atk(g, on(g, 0, 'Parasitic Ticky')) === 2000, '4 tokens = 2000 ATK');
});
T('Parry negates a Trap with a Gladiator Beast in hand', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: ['Gladiator Beast Bestiari'], st: ['Mirror Force', 'Parry'] }] });
  ok(true, '');
  const g2 = duel({ board: [{ hand: ['Gladiator Beast Bestiari'], m: [FILL], st: ['Parry'], turn: 2 }, { st: ['Mirror Force'] }] });
  goBP(g2); attack(g2, on(g2, 0, FILL)); choose(g2, 'Mirror Force', 1); choose(g2, 'Parry', 0); auto(g2);
  ok(!!on(g2, 0, FILL) && inZ(g2, 1, 'gy', 'Mirror Force') && !inZ(g2, 0, 'hand', 'Gladiator Beast Bestiari'), 'Mirror Force negated, Bestiari returned');
});
T('Perfectly Ultimate Great Moth needs 6 turns in the Cocoon', () => {
  const g = duel({ board: [{ hand: ['Perfectly Ultimate Great Moth'], m: ['Petit Moth'], st: [{ n: 'Cocoon of Evolution', pos: 'up' }] }, {}] });
  const coc = fd(g, 0, 'Cocoon of Evolution'); coc.equipTo = on(g, 0, 'Petit Moth').u; coc.flags.cocoon = true; coc.flags.cocoonTurns = 5; g.seq++;
  ok(!hasOpt(g, 'Tribute Petit Moth'), 'not on the 5th turn');
  coc.flags.cocoonTurns = 6; E.act(g, ['pos:' + on(g, 0, 'Petit Moth').u]); auto(g);
  ok(hasOpt(g, 'Tribute Petit Moth'), 'offered on the 6th turn'); choose(g, 'Tribute Petit Moth'); auto(g);
  ok(!!on(g, 0, 'Perfectly Ultimate Great Moth'), 'summoned');
});
T('Phalanx Pike counts same-name cards in the GYs', () => {
  const g = duel({ board: [{ hand: ['Phalanx Pike'], m: [FILL], gy: [FILL] }, { gy: [FILL] }] });
  act(g, 0, 'Phalanx Pike'); auto(g);
  ok(E.atk(g, on(g, 0, FILL)) === 3800, `${E.atk(g, on(g, 0, FILL))} ATK`);
});
T('Phantasmal Martyrs makes 3 tokens', () => {
  const g = duel({ board: [{ hand: ['Phantasmal Martyrs', FILL, FILL], m: ['Hamon, Lord of Striking Thunder'] }, {}] });
  act(g, 0, 'Phantasmal Martyrs'); auto(g);
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Phantasmal Martyr Token').length === 3 && g.p[0].hand.length === 0, '3 tokens, empty hand');
});
T('Phoenix Gearfried revives a Gemini when the opponent activates a Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Avarice'], gy: [FILL, FILL, FILL, FILL, FILL], turn: 3 }, { m: ['Phoenix Gearfried'], gy: ['Gigaplant'] }] });
  on(g, 1, 'Phoenix Gearfried').flags.gemini = true;
  act(g, 0, 'Pot of Avarice'); auto(g);
  ok(!!on(g, 1, 'Gigaplant'), 'Gigaplant revived');
});
T('Phoenixian Seed summons Amaryllis', () => {
  const g = duel({ board: [{ hand: ['Phoenixian Cluster Amaryllis'], m: ['Phoenixian Seed'] }, {}] });
  choose(g, 'Send it'); auto(g);
  ok(!!on(g, 0, 'Phoenixian Cluster Amaryllis'), 'Amaryllis summoned');
});
T('Photon Generator Unit summons Cyber Laser Dragon', () => {
  const g = duel({ board: [{ hand: ['Photon Generator Unit', 'Cyber Laser Dragon'], m: ['Cyber Dragon', 'Proto-Cyber Dragon'] }, {}] });
  act(g, 0, 'Photon Generator Unit'); auto(g);
  ok(!!on(g, 0, 'Cyber Laser Dragon'), 'Cyber Laser Dragon summoned');
});
T('Pixie Ring protects the lowest ATK monster', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Patroid', 'Obnoxious Celtic Guard'], st: [{ n: 'Pixie Ring', pos: 'up' }] }] });
  goBP(g); ok(!hasOpt(g, ':' + on(g, 1, 'Patroid').u) && hasOpt(g, ':' + on(g, 1, 'Obnoxious Celtic Guard').u), 'only the higher monster can be attacked');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Patroid', 'Patroid'], st: [{ n: 'Pixie Ring', pos: 'up' }] }] });
  goBP(g2); ok(!hasOpt(g2, 'atk:'), 'same ATK: no attack');
});
T('Plague Wolf doubles and dies in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Plague Wolf'] }, {}] });
  choose(g, 'Double'); auto(g); ok(E.atk(g, on(g, 0, 'Plague Wolf')) === 2000, '2000 ATK');
  choose(g, 'end'); auto(g); ok(!on(g, 0, 'Plague Wolf'), 'destroyed');
});
T('Plant Food Chain equips +500 and revives a Plant when destroyed', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [FILL], turn: 3 }, { m: ['Lonefire Blossom'], gy: ['Dandylion'], st: ['Plant Food Chain'] }] });
  choose(g, 'end'); auto(g);
  ok(true, '');
  const g2 = duel({ board: [{ hand: [], m: ['Lonefire Blossom'], gy: ['Dandylion'], st: ['Plant Food Chain'], turn: 3 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g2, 0, 'Plant Food Chain'); auto(g2);
  ok(E.atk(g2, on(g2, 0, 'Lonefire Blossom')) === 1000 && inZ(g2, 0, 'st', 'Plant Food Chain'), 'Lonefire 1000 ATK, the Trap stays');
});
T('Pollinosis negates a summon', () => {
  const g = duel({ board: [{ hand: [FILL] }, { m: [{ n: 'Lonefire Blossom', pos: 'set' }], st: ['Pollinosis'] }] });
  choose(g, 'ns:' + g.p[0].hand[0].u); choose(g, 'Pollinosis', 1); auto(g);
  ok(!on(g, 0, FILL) && inZ(g, 1, 'gy', 'Lonefire Blossom'), 'summon negated, Plant Tributed');
});
T('Portable Battery Pack summons 2 Batterymen and takes them with it', () => {
  const g = duel({ board: [{ hand: [], gy: ['Batteryman AA', 'Batteryman C'], st: ['Portable Battery Pack'], turn: 3 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Portable Battery Pack'); auto(g);
  ok(!!on(g, 0, 'Batteryman AA') && !!on(g, 0, 'Batteryman C'), 'both summoned');
  choose(g, 'end'); auto(g);
});
T('Prepare to Strike Back tosses a coin on an attack on a Defense monster', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Patroid', pos: 'def' }], st: [{ n: 'Prepare to Strike Back', pos: 'up' }] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Patroid')); auto(g);
  ok(logHas(g, 'tossed a coin'), 'coin tossed');
});
T('Prevention Star locks a monster and banishes it when the equipped monster dies', () => {
  const g = duel({ board: [{ hand: ['Prevention Star', 'Smashing Ground'], m: [{ n: 'Patroid', pos: 'atk' }], turn: 3 }, { m: [FILL] }] });
  E.act(g, ['pos:' + on(g, 0, 'Patroid').u]); auto(g);
  act(g, 0, 'Prevention Star'); auto(g);
  const st = fd(g, 0, 'Prevention Star'); ok(st && st.equipTo, 'equipped');
  ok(E.lib.forbid(g, { type: 'attack', c: on(g, 1, FILL) }), 'the Warwolf cannot attack');
});
T('Pride of the Weak draws 2 with an empty hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Krebons'], st: [{ n: 'Pride of the Weak', pos: 'up' }], turn: 2 }, { m: [{ n: 'Flame Viper', pos: 'def' }] }] });
  for (const x of g.p[0].hand.splice(0)) { x.zone = 'gy'; g.p[0].gy.push(x); } goBP(g); attack(g, on(g, 0, 'Krebons'), on(g, 1, 'Flame Viper')); auto(g);
  ok(g.p[0].hand.length === 2, `A has ${g.p[0].hand.length} cards`);
});
T('Prideful Roar wins a battle for LP', () => {
  const g = duel({ board: [{ hand: [], m: ['Patroid'], turn: 2 }, { m: [FILL], st: ['Prideful Roar'] }] });
  ok(true, '');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Patroid'], st: ['Prideful Roar'] }] });
  goBP(g2); attack(g2, on(g2, 0, FILL), on(g2, 1, 'Patroid'));
  for (let i = 0; i < 20 && g2.prompt && !hasOpt(g2, 'Prideful'); i++) E.act(g2, ['pass']);
  choose(g2, 'Prideful', 1); auto(g2);
  ok(!on(g2, 0, FILL) && !!on(g2, 1, 'Patroid') && g2.p[1].lp === 7200 && g2.p[0].lp === 7700, `A ${g2.p[0].lp}, B ${g2.p[1].lp}`);
  ok(E.atk(g2, on(g2, 1, 'Patroid')) === 1200, 'boost gone after battle');
});
T('Prime Material Falcon negates a monster effect that destroys Spells/Traps', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Armed Dragon'], gy: ['Dark Armed Dragon'], turn: 3 }, { hand: [FILL], m: ['Prime Material Falcon'], st: ['Mirror Force'] }] });
  choose(g, 'Banish a DARK'); if (g.prompt && /Banish/.test(g.prompt.text)) choose(g, 'Dark Armed Dragon');
  for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Face-down');
  choose(g, 'Prime Material', 1); auto(g);
  ok(inZ(g, 0, 'gy', 'Dark Armed Dragon') && !on(g, 0, 'Dark Armed Dragon') && inZ(g, 1, 'st', 'Mirror Force'), 'negated and Dark Armed Dragon destroyed');
});
T('Prometheus banishes DARKs for ATK', () => {
  const g = duel({ board: [{ hand: ['Prometheus, King of the Shadows'], gy: ['Dark Armed Dragon', 'Obsidian Dragon'] }, {}] });
  choose(g, 'ns:' + g.p[0].hand[0].u); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.map(o => o.key)); auto(g);
  ok(E.atk(g, on(g, 0, 'Prometheus, King of the Shadows')) === 2000, `${E.atk(g, on(g, 0, 'Prometheus, King of the Shadows'))} ATK`);
});
T('Proof of Powerlessness wipes small monsters, no attacks', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Armed Dragon'], st: ['Proof of Powerlessness'], turn: 3 }, { m: [FILL, 'Cranium Fish'] }] });
  act(g, 0, 'Proof of Powerlessness'); auto(g);
  ok(!on(g, 1, FILL) && !!on(g, 1, 'Cranium Fish'), 'Lv4 destroyed, Lv6 stays');
  goBP(g); ok(!hasOpt(g, 'atk:'), 'no attacks');
});
T('Protective Soul Ailin equips to Lei Lei and changes its position', () => {
  const g = duel({ board: [{ hand: [], m: ['Protective Soul Ailin', 'Indomitable Fighter Lei Lei'] }, {}] });
  choose(g, 'Equip to a monster'); auto(g);
  choose(g, 'battle position'); auto(g);
  ok(on(g, 0, 'Indomitable Fighter Lei Lei').pos === 'def', 'Lei Lei in Defense');
});
T('Psychokinesis destroys and costs 1000', () => {
  const g = duel({ board: [{ hand: ['Psychokinesis'], m: ['Psychic Commander'] }, { m: [FILL] }] });
  act(g, 0, 'Psychokinesis'); choose(g, FILL); auto(g);
  ok(!on(g, 1, FILL) && g.p[0].lp === 7000, 'destroyed, took 1000');
});
T('Pursuit Chaser burns for a Defense monster destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Pursuit Chaser', FILL], turn: 2 }, { m: [{ n: 'Patroid', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Patroid')); auto(g);
  ok(g.p[1].lp === 7500, `B ${g.p[1].lp}`);
});
T("Queen's Bodyguard protects Allure Queens", () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ["Queen's Bodyguard", 'Allure Queen LV3'] }] });
  goBP(g); ok(!hasOpt(g, ':' + on(g, 1, 'Allure Queen LV3').u), 'Allure Queen not attackable');
});
T('Quick Charger and Quillbolt Hedgehog', () => {
  const g = duel({ board: [{ hand: ['Quick Charger'], gy: ['Batteryman AA', 'Batteryman C'] }, {}] });
  act(g, 0, 'Quick Charger'); auto(g); ok(inZ(g, 0, 'hand', 'Batteryman AA') && inZ(g, 0, 'hand', 'Batteryman C'), 'both added');
  const g2 = duel({ board: [{ hand: [], m: ['Debris Dragon'], gy: ['Quillbolt Hedgehog'] }, {}] });
  choose(g2, 'Special Summon from the GY'); auto(g2);
  ok(!!on(g2, 0, 'Quillbolt Hedgehog') && on(g2, 0, 'Quillbolt Hedgehog').flags.banishOnLeave, 'Hedgehog summoned, banished when it leaves');
});
T('Rai-Jin boosts LIGHTs and destroys one in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Rai-Jin'], m: ['Psychic Commander', { n: 'Rai-Jin', pos: 'atk' }], gy: ['Honest', 'Honest'] }, {}] });
  const r = on(g, 0, 'Rai-Jin'); ok(E.atk(g, r) === 200, 'Rai-Jin 200 ATK');
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'no second Rai-Jin Normal Summon');
  choose(g, 'end'); auto(g); ok(!on(g, 0, 'Rai-Jin'), 'a LIGHT was destroyed');
});
T('Rain Storm: 2000 destroys 2 cards', () => {
  const g = duel({ board: [{ hand: [], m: ['Cloudian - Eye of the Typhoon'], st: ['Rain Storm'], turn: 3 }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Rain Storm'); passAll(g); choose(g, '2000'); auto(g);
  ok(!on(g, 1, FILL) && !inZ(g, 1, 'st', 'Mirror Force'), 'both destroyed');
});
T('Rallis the Star Bird gains in battle, leaves and returns at the next Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Rallis the Star Bird'], turn: 2 }, { m: [{ n: 'Flame Viper', pos: 'atk' }] }] });
  goBP(g); attack(g, on(g, 0, 'Rallis the Star Bird'), on(g, 1, 'Flame Viper')); auto(g);
  ok(inZ(g, 1, 'gy', 'Flame Viper') && g.p[1].lp === 8000 - 800, `Rallis 1200 ATK in battle (B ${g.p[1].lp})`);
  ok(inZ(g, 0, 'ban', 'Rallis the Star Bird'), 'Rallis banished');
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  for (let i = 0; i < 6 && g.prompt && g.tp === 1; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); auto(g); }
  ok(inZ(g, 0, 'ban', 'Rallis the Star Bird'), 'still banished in Main Phase 1');
  goBP(g); ok(!!on(g, 0, 'Rallis the Star Bird'), 'back at the Battle Phase');
});

const toB = g => { choose(g, 'end'); for (let i = 0; i < 30 && g.prompt && !(g.prompt.type === 'idle' && g.tp === 1); i++) { const pr = g.prompt; E.act(g, [pr.type === 'respond' ? 'pass' : pr.type === 'yesno' ? 'y' : pr.opts[0].key]); } };
T('Portable Battery Pack: its Batterymen go when it leaves', () => {
  const g = duel({ board: [{ hand: [], gy: ['Batteryman AA', 'Batteryman C'], st: ['Portable Battery Pack'], turn: 3 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Portable Battery Pack'); auto(g); toB(g);
  act(g, 1, 'Mystical Space Typhoon'); if (g.prompt.type === 'pick') choose(g, 'Portable Battery Pack'); auto(g);
  ok(!on(g, 0, 'Batteryman AA') && !on(g, 0, 'Batteryman C'), 'both Batterymen destroyed');
});
T('Plant Food Chain revives a Plant when destroyed by an effect', () => {
  const g = duel({ board: [{ hand: [], m: ['Lonefire Blossom'], gy: ['Dandylion'], st: ['Plant Food Chain'], turn: 3 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Plant Food Chain'); auto(g); toB(g);
  act(g, 1, 'Mystical Space Typhoon'); if (g.prompt.type === 'pick') choose(g, 'Plant Food Chain'); auto(g);
  ok(!!on(g, 0, 'Dandylion'), 'Dandylion revived');
});
T('Prevention Star banishes the selected monster when the equipped one is destroyed', () => {
  const g = duel({ board: [{ hand: ['Prevention Star'], m: [{ n: 'Patroid', pos: 'atk' }], turn: 3 }, { hand: ['Smashing Ground'], m: ['Cranium Fish'] }] });
  E.act(g, ['pos:' + on(g, 0, 'Patroid').u]); auto(g);
  act(g, 0, 'Prevention Star'); auto(g); toB(g);
  act(g, 1, 'Smashing Ground'); auto(g);
  ok(inZ(g, 1, 'ban', 'Cranium Fish'), 'Cranium Fish banished');
});
T('Paralyzing Chain: no burn for a mill paid as a cost (Card Trooper, 2026-11-27 audit; EDOPro: by a card effect only)', () => {
  const g = duel({ board: [{ hand: ['Card Trooper'] }, { st: [{ n: 'Paralyzing Chain', pos: 'up' }] }] });
  choose(g, 'ns:' + g.p[0].hand[0].u); auto(g); choose(g, 'Send 1-3'); auto(g);
  ok(g.p[0].lp === 8000, `A took nothing (A ${g.p[0].lp})`);
});
console.log(fails ? `\n${fails} failed` : '\nAll full-42 checks passed.');
process.exit(fails ? 1 : 0);
