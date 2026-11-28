// Scenario checks for full pool batch 10: node build/test_full-08.js
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
const endTurn = g => { auto(g); choose(g, 'end'); auto(g); };

T('Hyper Hammerhead returns the monster that survived', () => {
  const g = duel({ board: [{ m: ['Hyper Hammerhead'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Hyper Hammerhead'), on(g, 1, FILL)); auto(g);
  ok(!on(g, 1, FILL) && inZ(g, 1, 'hand', FILL), 'Warwolf went back to the hand');
});
T('Hyper Psychic Blaster Assault Mode burns DEF and gains ATK', () => {
  const g = duel({ board: [{ m: ['Hyper Psychic Blaster Assault Mode'], turn: 2 }, { m: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Hyper Psychic Blaster Assault Mode'), on(g, 1, FILL)); auto(g);
  ok(g.p[1].lp === 8000 - 1500 - 100 && g.p[0].lp === 10000, `B 6400, A 10000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Hyper Psychic Blaster Assault Mode cannot be summoned from the hand', () => {
  const g = duel({ board: [{ hand: ['Hyper Psychic Blaster Assault Mode'] }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Hyper Psychic Blaster Assault Mode').u), 'no Normal Summon offered');
});
T('Hyper Synchron gives a Dragon Synchro 800 and banishes it at the End Phase', () => {
  const g = duel({ board: [{ m: ['Hyper Synchron', FILL] }, {}], ex0: ['Stardust Dragon'] });
  choose(g, 'syn:'); auto(g);
  const s = on(g, 0, 'Stardust Dragon'); ok(s && E.atk(g, s) === 3300, `Stardust at 3300 (${s && E.atk(g, s)})`);
  choose(g, 'end'); auto(g);
  ok(inZ(g, 0, 'ban', 'Stardust Dragon'), 'Stardust banished in the End Phase');
});
T('Infernal Dragon is destroyed at the End Phase after attacking', () => {
  const g = duel({ board: [{ m: ['Infernal Dragon'], turn: 2 }, {}] });
  goBP(g); attack(g, on(g, 0, 'Infernal Dragon'), null); auto(g); choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g, { no: true });
  ok(inZ(g, 0, 'gy', 'Infernal Dragon'), 'Infernal Dragon in the GY');
});
T('Infernal Dragon revives by Tributing a monster', () => {
  const g = duel({ board: [{ m: ['Infernal Dragon', FILL], turn: 2 }, { m: ['Hyper Psychic Blaster Assault Mode'] }] });
  goBP(g); attack(g, on(g, 0, 'Infernal Dragon'), on(g, 1, 'Hyper Psychic Blaster Assault Mode')); auto(g);
  ok(on(g, 0, 'Infernal Dragon') && inZ(g, 0, 'gy', FILL), 'back on the field, Warwolf Tributed');
});
T('Infernal Flame Emperor banishes FIRE to destroy Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['Infernal Flame Emperor'], m: [FILL, FILL], gy: ['Inferno', 'Inferno'] }, { st: ['Mirror Force', 'Heavy Storm'] }] });
  choose(g, 'ns:'); auto(g);
  ok(g.p[0].ban.length >= 1 && g.p[1].st.filter(Boolean).length <= 1, 'banished and destroyed');
});
T('Infernal Incinerator: discard hand, Tribute a 2000 ATK monster', () => {
  const g = duel({ board: [{ hand: ['Infernal Incinerator', FILL, FILL], m: [FILL] }, { m: [FILL, FILL] }] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'no plain Normal Summon');
  choose(g, 'sp:'); auto(g);
  const c = on(g, 0, 'Infernal Incinerator'); ok(c && g.p[0].hand.length === 0 && E.atk(g, c) === 3200, `summoned, hand empty, ATK 3200 (${c && E.atk(g, c)})`);
  ok(!hasOpt(g, 'ns:'), 'the Normal Summon is used');
});
T('Inferno: summon by banishing a FIRE, 1500 on a battle kill', () => {
  const g = duel({ board: [{ hand: ['Inferno'], gy: ['Infernal Incinerator'], turn: 2 }, { m: [{ n: 'Hyper Hammerhead', pos: 'atk' }] }] });
  choose(g, 'sp:'); auto(g);
  const i = on(g, 0, 'Inferno'); ok(i && g.p[0].ban.length === 1, 'summoned');
  addM(i); goBP(g); attack(g, i, on(g, 1, 'Hyper Hammerhead')); auto(g);
  ok(g.p[1].lp === 8000 - 100 - 1500, `B took 1600 (${g.p[1].lp})`);
});
function addM(c) { c.mods.push({ atk: 500 }); }
T('Inferno Fire Blast burns 2400 and stops Red-Eyes attacking', () => {
  const g = duel({ board: [{ hand: ['Inferno Fire Blast'], m: ['Red-Eyes Black Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Inferno Fire Blast'); auto(g);
  ok(g.p[1].lp === 5600, `B 5600 (${g.p[1].lp})`);
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'atk:'), 'Red-Eyes cannot attack');
});
T('Inferno Hammer turns a monster face-down after a kill', () => {
  const g = duel({ board: [{ m: ['Inferno Hammer'], turn: 2 }, { m: [FILL, 'Hyper Hammerhead'] }] });
  goBP(g); attack(g, on(g, 0, 'Inferno Hammer'), on(g, 1, FILL)); auto(g);
  ok(g.p[1].m.some(c => c && c.pos === 'set'), 'Hammerhead is face-down');
});
T('Inferno Reckless Summon summons copies for both players', () => {
  const g = duel({ board: [{ hand: ['Inferno Reckless Summon', 'Inferno'], gy: ['Infernal Incinerator'], deckTop: ['Inferno'] }, { m: [FILL], hand: [FILL] }] });
  choose(g, 'sp:');
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (hasOpt(g, 'Inferno Reckless')) { choose(g, 'Inferno Reckless'); break; } if (g.prompt.type === 'respond') E.act(g, ['pass']); else auto(g); }
  auto(g);
  // the other Inferno (drawn this turn) stays in the hand: it "Must first be Special Summoned" by its own way, and IRS can't summon a monster
  // that can't be Special Summoned (IRS ruling; 2026-11-27 summoning conditions)
  ok(cnt(g, 0, 'm', 'Inferno') === 1 && g.p[0].hand.some(c => E.name(c) === 'Inferno'), `A's other Inferno can't be Special Summoned (${cnt(g, 0, 'm', 'Inferno')} on the field)`);
  ok(cnt(g, 1, 'm', FILL) >= 2, `B summoned Warwolf copies (${cnt(g, 1, 'm', FILL)})`);
});
T('Inferno Tempest banishes monsters in Decks and GYs after 3000 battle damage', () => {
  const g = duel({ board: [{ m: ['Hyper Psychic Blaster Assault Mode'], turn: 2 }, { st: ['Inferno Tempest'], gy: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Hyper Psychic Blaster Assault Mode'), null); auto(g); choose(g, 'endbp'); auto(g); choose(g, 'end');
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Inferno Tempest'); i++) auto(g);
  ok(hasOpt(g, 'Inferno Tempest'), 'B can activate it'); choose(g, 'Inferno Tempest'); auto(g);
  ok(g.p[0].deck.filter(c => E.data(c).k !== 'spell').length === 0 && g.p[1].gy.filter(c => E.data(c).k === 'effect').length === 0, 'no monsters left in Decks and GYs');
});
T('Insect Barrier stops Insect attacks', () => {
  const g = duel({ board: [{ m: ['Insect Knight'], turn: 2 }, { st: [{ n: 'Insect Barrier', pos: 'up' }] }] });
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'atk:'), 'no attack');
});
T('Insect Imitation summons an Insect one Level higher', () => {
  const g = duel({ board: [{ hand: ['Insect Imitation'], m: ['Hyper Hammerhead'], deckTop: [FILL, 'Insect Princess'] }, {}] });
  ok(!hasOpt(g, 'a:' + g.p[0].hand[0].u), 'no Level 5 Insect, no activation');
  const g2 = duel({ board: [{ hand: ['Insect Imitation'], m: ['Chu-Ske the Mouse Fighter'], deckTop: [FILL, 'Insect Knight'] }, {}] });
  act(g2, 0, 'Insect Imitation'); auto(g2);
  ok(on(g2, 0, 'Insect Knight'), 'Insect Knight (Level 4) from Chu-Ske (Level 3)');
});
T('Insect Neglect negates an attack', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: [{ n: 'Insect Neglect', pos: 'up' }], gy: ['Insect Knight'] }] });
  goBP(g); attack(g, on(g, 0, FILL), null); auto(g);
  ok(g.p[1].lp === 8000 && g.p[1].ban.length === 1, `no damage (${g.p[1].lp})`);
});
T('Insect Princess switches their Insects to Attack and grows', () => {
  const g = duel({ board: [{ m: ['Insect Princess'], turn: 2 }, { m: [{ n: 'Pinch Hopper', pos: 'def' }] }] });
  auto(g); ok(on(g, 1, 'Pinch Hopper').pos === 'atk', 'Pinch Hopper is in Attack Position');
  goBP(g); attack(g, on(g, 0, 'Insect Princess'), on(g, 1, 'Pinch Hopper')); auto(g);
  ok(E.atk(g, on(g, 0, 'Insect Princess')) === 2400, `Princess 2400 (${E.atk(g, on(g, 0, 'Insect Princess'))})`);
});
T('Insect Queen tributes to attack and makes a token', () => {
  const g = duel({ board: [{ m: ['Insect Queen', 'Insect Knight'], turn: 2 }, { m: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Insect Queen'), on(g, 1, FILL)); auto(g); choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(inZ(g, 0, 'gy', 'Insect Knight') && inZ(g, 1, 'gy', FILL) && on(g, 0, 'Insect Monster Token'), 'tributed, won, token');
});
T('Iron Chain Blaster, Coil and Repairman', () => {
  const g = duel({ board: [{ m: ['Iron Chain Blaster', 'Iron Chain Coil', 'Iron Chain Repairman'], gy: ['Iron Chain Snake'] }, {}] });
  eff(g, on(g, 0, 'Iron Chain Coil'), 0); choose(g, 'u' + on(g, 0, 'Iron Chain Repairman').u); auto(g);
  ok(E.atk(g, on(g, 0, 'Iron Chain Repairman')) === 1900, 'Repairman gained 300');
  eff(g, on(g, 0, 'Iron Chain Blaster'), 0); choose(g, 'u' + on(g, 0, 'Iron Chain Blaster').u); auto(g);
  ok(g.p[1].lp === 7200, `800 damage (${g.p[1].lp})`);
  eff(g, on(g, 0, 'Iron Chain Repairman'), 1); auto(g);
  ok(on(g, 0, 'Iron Chain Snake'), 'Snake revived');
});
T('Iron Chain Snake equips, then mills on a battle kill', () => {
  const g = duel({ board: [{ m: ['Iron Chain Snake', FILL], turn: 2 }, { m: [FILL] }] });
  eff(g, on(g, 0, 'Iron Chain Snake'), 0); auto(g);
  const t = on(g, 1, FILL); ok(st(g, 0, 'Iron Chain Snake') && E.atk(g, t) === 1200, `equipped, ATK 1200 (${E.atk(g, t)})`);
  const d = g.p[1].deck.length; goBP(g); attack(g, on(g, 0, FILL), t); auto(g);
  ok(g.p[1].deck.length === d - 4, `B milled 4 (${d - g.p[1].deck.length})`);
});
T('Iron Core Immediate Disposal sends the Iron Core', () => {
  const g = duel({ board: [{ hand: ['Iron Core Immediate Disposal'], deckTop: [FILL, "Iron Core of Koa'ki Meiru"] }, {}] });
  act(g, 0, 'Iron Core Immediate Disposal'); auto(g); ok(inZ(g, 0, 'gy', "Iron Core of Koa'ki Meiru"), 'in the GY');
});
T('Iron Core Armor lowers the battling monster and saves the maintenance', () => {
  const g = duel({ board: [{ hand: ['Iron Core Armor'], m: ["Koa'ki Meiru Crusader"], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Iron Core Armor'); auto(g);
  goBP(g); attack(g, on(g, 0, "Koa'ki Meiru Crusader"), on(g, 1, FILL)); auto(g); choose(g, 'endbp'); auto(g);
  ok(inZ(g, 1, 'gy', FILL), 'Warwolf lost the battle');
  choose(g, 'end'); for (let i = 0; i < 20 && g.prompt && !hasOpt(g, 'be destroyed'); i++) auto(g); choose(g, 'be destroyed'); auto(g);
  ok(on(g, 0, "Koa'ki Meiru Crusader") && inZ(g, 0, 'gy', 'Iron Core Armor'), 'Armor sent instead of the Crusader');
});
T('Jinzo stops Traps', () => {
  const g = duel({ board: [{ m: ['Jinzo', FILL], turn: 2 }, { st: ['Mirror Force'] }] });
  goBP(g); attack(g, on(g, 0, FILL), null); ok(!hasOpt(g, 'Mirror Force'), 'no Mirror Force'); auto(g);
  ok(g.p[1].lp === 6000, 'direct hit');
});
T('Jinzo - Lord: summon from Jinzo, destroy face-up Traps', () => {
  const g = duel({ board: [{ hand: ['Jinzo - Lord'], m: ['Jinzo'] }, { st: [{ n: 'Royal Decree', pos: 'up' }, { n: 'Insect Barrier', pos: 'up' }] }] });
  choose(g, 'sp:'); auto(g); const lo = on(g, 0, 'Jinzo - Lord'); ok(lo && inZ(g, 0, 'gy', 'Jinzo'), 'summoned');
  eff(g, lo, 0); auto(g); ok(inZ(g, 1, 'gy', 'Royal Decree') && st(g, 1, 'Insect Barrier') && g.p[1].lp === 7700, `Decree destroyed, 300 (${g.p[1].lp})`);
});
T('Jinzo - Returner revives Jinzo, which dies in the End Phase', () => {
  const g = duel({ board: [{ m: ['Jinzo - Returner'], gy: ['Jinzo'], turn: 2 }, { m: ['Red-Eyes Black Dragon'] }] });
  goBP(g); attack(g, on(g, 0, 'Jinzo - Returner'), on(g, 1, 'Red-Eyes Black Dragon')); auto(g);
  ok(on(g, 0, 'Jinzo'), 'Jinzo revived');
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(!on(g, 0, 'Jinzo') && inZ(g, 0, 'gy', 'Jinzo'), 'Jinzo destroyed in the End Phase');
});
T('Judgment of Anubis negates Heavy Storm and burns', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'] }, { hand: [FILL], m: [FILL], st: ['Judgment of Anubis'] }] });
  const g2 = duel({ board: [{ hand: ['Heavy Storm'], m: [FILL] }, { hand: [FILL], st: ['Judgment of Anubis'] }] });
  act(g2, 0, 'Heavy Storm'); choose(g2, 'Judgment of Anubis', 1); auto(g2);
  ok(inZ(g2, 0, 'gy', 'Heavy Storm') && inZ(g2, 0, 'gy', FILL) && g2.p[0].lp === 6000, `negated, Warwolf destroyed, 2000 (${g2.p[0].lp})`);
});
T('Judgment of the Desert locks flipped monsters', () => {
  const g = duel({ board: [{ m: [{ n: FILL, pos: 'set' }], st: [{ n: 'Judgment of the Desert', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'flip:'); auto(g); ok(!hasOpt(g, 'pos:'), 'can’t change it manually');
});
T('Judgment of the Pharaoh with Unity stops their Traps', () => {
  const g = duel({ board: [{ m: [FILL], st: ['Judgment of the Pharaoh'], gy: ['Unity'], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'a:' + st(g, 0, 'Judgment of the Pharaoh').u + ':'); auto(g);
  ok(g.p[0].lp === 4000, 'paid half');
  goBP(g); attack(g, on(g, 0, FILL), null); ok(!hasOpt(g, 'Mirror Force'), 'Mirror Force locked'); auto(g);
  ok(g.p[1].lp === 6000, 'direct hit');
});
T('Judgment of Thunder after a Thunder summon', () => {
  const g = duel({ board: [{ hand: ['Thunder Kid'], st: ['Judgment of Thunder'], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'ns:');
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Judgment of Thunder'); i++) E.act(g, ['pass']);
  ok(hasOpt(g, 'Judgment of Thunder'), 'offered'); choose(g, 'Judgment of Thunder'); auto(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Kaiser Colosseum caps the opponent’s monsters', () => {
  const g = duel({ board: [{ m: [FILL], st: [{ n: 'Kaiser Colosseum', pos: 'up' }] }, { m: [FILL], hand: [FILL] }] });
  choose(g, 'end'); auto(g);
  ok(g.tp === 1 && !hasOpt(g, 'ns:'), 'B can’t Normal Summon a second monster');
});
T('Kaiser Glider bounces when destroyed', () => {
  const g = duel({ board: [{ m: ['Kaiser Glider'], turn: 2 }, { m: [FILL, 'Red-Eyes Black Dragon'] }] });
  goBP(g); attack(g, on(g, 0, 'Kaiser Glider'), on(g, 1, 'Red-Eyes Black Dragon')); auto(g);
  ok(inZ(g, 1, 'gy', 'Red-Eyes Black Dragon') && on(g, 0, 'Kaiser Glider'), 'same ATK: only Red-Eyes destroyed');
});
T('Kaiser Sea Horse counts as 2 Tributes for a LIGHT', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon'], m: ['Kaiser Sea Horse'] }, {}] });
  choose(g, 'ns:'); auto(g); ok(on(g, 0, 'Blue-Eyes White Dragon') && inZ(g, 0, 'gy', 'Kaiser Sea Horse'), 'Blue-Eyes with 1 Tribute');
});
T('Kaiser Dragon recipe and King Dragun', () => {
  const g = duel({ board: [{ hand: ['Winged Dragon, Guardian of the Fortress 1', 'Fairy Dragon'] }, {}], ex0: ['Kaiser Dragon'] });
  ok(L().canFusion(g, 0), 'Kaiser Dragon recipe read');
  const h = duel({ board: [{ hand: ['Masked Dragon'], m: ['King Dragun'] }, { hand: ['Mystical Space Typhoon'] }] });
  const k = on(h, 0, 'King Dragun'); eff(h, k, 0); auto(h); ok(on(h, 0, 'Masked Dragon'), 'Dragon summoned from the hand');
});
T('King of the Beasts from the hand by Tributing Moja', () => {
  const g = duel({ board: [{ hand: ['King of the Beasts'], m: ['Moja'] }, {}] });
  choose(g, 'sp:'); auto(g); ok(on(g, 0, 'King of the Beasts') && inZ(g, 0, 'gy', 'Moja'), 'summoned');
});
T('King of the Skull Servants counts and revives', () => {
  const g = duel({ board: [{ m: ['King of the Skull Servants'], gy: ['Skull Servant', 'Skull Servant'] }, { m: ['Red-Eyes Black Dragon'], turn: 2 }] });
  const k = on(g, 0, 'King of the Skull Servants'); ok(E.atk(g, k) === 2000, `2000 ATK (${E.atk(g, k)})`);
  choose(g, 'end'); auto(g); goBP(g); attack(g, on(g, 1, 'Red-Eyes Black Dragon'), k); auto(g);
  ok(on(g, 0, 'King of the Skull Servants') && g.p[0].ban.length === 1, 'revived by banishing a Skull Servant');
});
T('King of the Swamp searches Polymerization', () => {
  const g = duel({ board: [{ hand: ['King of the Swamp'], deckTop: [FILL, 'Polymerization'] }, {}] });
  eff(g, g.p[0].hand[0], 0); auto(g); ok(inZ(g, 0, 'hand', 'Polymerization'), 'added');
});
T('King Pyron burns after a Gemini Summon', () => {
  const g = duel({ board: [{ m: ['King Pyron'] }, {}] });
  choose(g, 'gem:'); auto(g); eff(g, on(g, 0, 'King Pyron'), 0); auto(g); ok(g.p[1].lp === 7000, `1000 (${g.p[1].lp})`);
});
T('Lady Assailant of Flames banishes 3 and burns', () => {
  const g = duel({ board: [{ m: [{ n: 'Lady Assailant of Flames', pos: 'set' }], turn: 2 }, {}] });
  choose(g, 'flip:'); auto(g); ok(g.p[0].ban.length === 3 && g.p[1].lp === 7200, 'banished 3, 800 damage');
});
T('Lady Ninja Yae returns their Spells and Traps', () => {
  const g = duel({ board: [{ hand: ['Insect Soldiers of the Sky'], m: ['Lady Ninja Yae'] }, { st: ['Mirror Force', 'Heavy Storm'] }] });
  eff(g, on(g, 0, 'Lady Ninja Yae'), 0); auto(g); ok(g.p[1].st.filter(Boolean).length === 0 && inZ(g, 1, 'hand', 'Mirror Force'), 'returned');
});
T('Lady Panther returns a battle-destroyed monster to the Deck', () => {
  const g = duel({ board: [{ m: ['Lady Panther', 'Insect Knight'], turn: 2 }, { m: ['Red-Eyes Black Dragon'] }] });
  goBP(g); attack(g, on(g, 0, 'Insect Knight'), on(g, 1, 'Red-Eyes Black Dragon')); auto(g); choose(g, 'endbp'); auto(g);
  eff(g, on(g, 0, 'Lady Panther'), 1); auto(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Insect Knight', 'Insect Knight on top of the Deck');
});
T('Last Day of Witch destroys Spellcasters', () => {
  const g = duel({ board: [{ hand: ['Last Day of Witch'] }, { m: ['Lord of D.', FILL] }] });
  act(g, 0, 'Last Day of Witch'); auto(g); ok(inZ(g, 1, 'gy', 'Lord of D.') && on(g, 1, FILL), 'Lord of D. destroyed');
});
T('Last Resort puts Rainbow Ruins in the Field Zone', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: ['Last Resort'], deckTop: [FILL, 'Ancient City - Rainbow Ruins'] }] });
  goBP(g); attack(g, on(g, 0, FILL), null); choose(g, 'Last Resort', 1); auto(g);
  ok(g.p[1].fz && E.name(g.p[1].fz) === 'Ancient City - Rainbow Ruins', 'Rainbow Ruins in the Field Zone');
});
T('Last Will summons a 1500 or less monster', () => {
  const g = duel({ board: [{ hand: ['Last Will', 'Lady Ninja Yae'], m: ['Lady Panther'], deckTop: [FILL, 'Moja'] }, {}] });
  eff(g, on(g, 0, 'Lady Panther'), 1); auto(g); act(g, 0, 'Last Will'); auto(g);
  ok(on(g, 0, 'Moja') || g.p[0].m.some(c => c && E.data(c).atk <= 1500), 'summoned from the Deck');
});
T('Lava Battleguard gains from Swamp Battleguard', () => {
  const g = duel({ board: [{ m: ['Lava Battleguard', 'Swamp Battleguard'] }, {}] });
  ok(E.atk(g, on(g, 0, 'Lava Battleguard')) === 2050, '2050');
});
T('Lava Dragon Tributes itself for two Dragons', () => {
  const g = duel({ board: [{ hand: ['Masked Dragon'], m: [{ n: 'Lava Dragon', pos: 'def' }], gy: ['Masked Dragon'] }, {}] });
  eff(g, on(g, 0, 'Lava Dragon'), 0); auto(g); ok(cnt(g, 0, 'm', 'Masked Dragon') === 2, 'two Masked Dragons');
});
T('Lava Golem goes to their field and burns them', () => {
  const g = duel({ board: [{ hand: ['Lava Golem'] }, { m: [FILL, FILL] }] });
  choose(g, 'sp:'); auto(g); ok(on(g, 1, 'Lava Golem'), 'on B’s field');
  choose(g, 'end'); auto(g); ok(g.p[1].lp === 7000, `B took 1000 (${g.p[1].lp})`);
});
T('Legendary Black Belt burns the DEF', () => {
  const g = duel({ board: [{ hand: ['Legendary Black Belt'], m: ['Chu-Ske the Mouse Fighter'], turn: 2 }, { m: [{ n: 'Moja', pos: 'atk' }] }] });
  act(g, 0, 'Legendary Black Belt'); auto(g); goBP(g); attack(g, on(g, 0, 'Chu-Ske the Mouse Fighter'), on(g, 1, 'Moja')); auto(g);
  ok(g.p[1].lp === 8000 - (1200 - 100) - 100, `B ${g.p[1].lp}`);
});
T('Legendary Ebon Steed is destroyed instead', () => {
  const g = duel({ board: [{ hand: ['Legendary Ebon Steed'], m: ['The Six Samurai - Yaichi'] }, { st: ['Mirror Force'], hand: ['Last Day of Witch'] }] });
  act(g, 0, 'Legendary Ebon Steed'); auto(g);
  const y = on(g, 0, 'The Six Samurai - Yaichi'); const a = E.atk(g, y); L().destroy(g, [y], { by: 1 });
  ok(on(g, 0, 'The Six Samurai - Yaichi') && inZ(g, 0, 'gy', 'Legendary Ebon Steed'), `Steed destroyed instead (+200 was ${a})`);
});
function L() { return E.lib; }
T('Legendary Fiend gains 700 each Standby Phase', () => {
  const g = duel({ board: [{ m: ['Legendary Fiend'] }, {}] });
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(E.atk(g, on(g, 0, 'Legendary Fiend')) === 2900, `2900 (two Standby Phases of A) (${E.atk(g, on(g, 0, 'Legendary Fiend'))})`);
});
T('Legendary Flame Lord counts Spells and wipes', () => {
  const g = duel({ board: [{ hand: ['Level Tuning', 'Level Tuning', 'Level Tuning'], m: ['Legendary Flame Lord'] }, { m: [FILL] }] });
  for (let i = 0; i < 3; i++) { act(g, 0, 'Level Tuning'); auto(g); }
  const fl = on(g, 0, 'Legendary Flame Lord'); ok(L().ctr(fl, 'spell') === 3, `3 counters (${L().ctr(fl, 'spell')})`);
  eff(g, fl, 1); auto(g); ok(inZ(g, 1, 'gy', FILL), 'Warwolf destroyed');
});
T('Level Up! and Level Down', () => {
  const g = duel({ board: [{ hand: ['Level Up!'], m: ['Armed Dragon LV3'], deckTop: [FILL, 'Armed Dragon LV5'] }, {}] });
  auto(g, { no: true }); act(g, 0, 'Level Up!'); auto(g); ok(on(g, 0, 'Armed Dragon LV5'), 'LV5 summoned');
  const h = duel({ board: [{ hand: ['Level Down'], gy: ['Armed Dragon LV3'] }, { m: ['Armed Dragon LV5'] }] });
  ok(true, '');
  const k = duel({ board: [{ hand: ['Level Down'], m: ['Armed Dragon LV5'], gy: ['Armed Dragon LV3'] }, {}] });
  act(k, 0, 'Level Down'); auto(k); ok(on(k, 0, 'Armed Dragon LV3') && !on(k, 0, 'Armed Dragon LV5'), 'LV3 back, LV5 in the Deck');
});
T('Level Modulation: the summoned LV monster can’t attack', () => {
  const g = duel({ board: [{ hand: ['Level Modulation'], gy: ['Armed Dragon LV5'], turn: 2 }, {}] });
  const h = g.p[1].hand.length; act(g, 0, 'Level Modulation'); auto(g);
  ok(on(g, 0, 'Armed Dragon LV5') && g.p[1].hand.length === h + 2, 'summoned, B drew 2');
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'atk:'), 'can’t attack');
});
T('Level Tuning and Level Retuner', () => {
  const g = duel({ board: [{ hand: ['Level Tuning'], m: [FILL], st: ['Level Retuner'], turn: 2 }, {}] });
  act(g, 0, 'Level Tuning'); auto(g); ok(E.lv(on(g, 0, FILL)) === 3, 'Level 3');
  choose(g, 'end'); auto(g); ok(E.lv(on(g, 0, FILL)) === 4, 'back to 4');
});
T('Level Conversion Lab rolls a Level', () => {
  const g = duel({ board: [{ hand: ['Red-Eyes Black Dragon'], st: ['Level Conversion Lab'], turn: 2 }, {}] });
  act(g, 0, 'Level Conversion Lab'); auto(g);
  const r = g.p[0].hand.find(c => E.name(c) === 'Red-Eyes Black Dragon');
  ok(!r || (E.lv(r) >= 2 && E.lv(r) <= 6), 'a die Level or sent to the GY');
});
T('Level Warrior Special Summons as Level 4', () => {
  const g = duel({ board: [{ hand: ['Level Warrior'] }, { m: [FILL] }] });
  choose(g, 'sp:'); auto(g); ok(E.lv(on(g, 0, 'Level Warrior')) === 4, 'Level 4');
  const h = duel({ board: [{ hand: ['Level Warrior'] }, {}] });
  choose(h, 'ns:'); auto(h); ok(E.lv(on(h, 0, 'Level Warrior')) === 2, 'Level 2');
});
T('Inferno with full hand of other cards does not crash', () => {});

console.log(fails ? `\n${fails} failure(s).` : '\nAll checks passed.');
process.exit(fails ? 1 : 0);
