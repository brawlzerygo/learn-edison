// Scenario checks for full pool batch 08: node build/test_full-08.js
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

T('Energy-Absorbing Monolith turns Final Flame into a gain', () => {
  const g = duel({ board: [{ hand: ['Final Flame'] }, { st: ['Energy-Absorbing Monolith'] }] });
  act(g, 0, 'Final Flame'); choose(g, 'Monolith', 1); auto(g);
  ok(g.p[1].lp === 8600, `B gained 600 (B ${g.p[1].lp})`);
});
T('Fire Princess burns when Goblin Thief gains LP', () => {
  const g = duel({ board: [{ hand: ['Goblin Thief'], m: ['Fire Princess'] }, {}] });
  act(g, 0, 'Goblin Thief'); auto(g);
  ok(g.p[0].lp === 8500 && g.p[1].lp === 7000, `A 8500, B 7000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Gift of The Mystical Elf and Gift Card', () => {
  const g = duel({ board: [{ m: [FILL, FILL], st: ['Gift of The Mystical Elf', 'Gift Card'] }, { m: [FILL] }] });
  act(g, 0, 'Gift of The Mystical Elf'); auto(g); act(g, 0, 'Gift Card'); auto(g);
  ok(g.p[0].lp === 8900 && g.p[1].lp === 11000, `A 8900, B 11000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Fairy Wind destroys face-up Spells/Traps and burns both', () => {
  const g = duel({ board: [{ st: ['Fairy Wind', { n: 'Final Attack Orders', pos: 'up' }, 'Mirror Force'] }, { st: [{ n: 'Fairy Box', pos: 'up' }] }] });
  act(g, 0, 'Fairy Wind'); auto(g);
  ok(inZ(g, 0, 'gy', 'Final Attack Orders') && inZ(g, 1, 'gy', 'Fairy Box') && inZ(g, 0, 'st', 'Mirror Force'), 'the face-up cards are destroyed, the Set one stays');
  ok(g.p[0].lp === 7400 && g.p[1].lp === 7400, `both took 600 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Familiar Knight lets each player summon a Level 4', () => {
  const g = duel({ board: [{ hand: [FILL], m: [FILL], turn: 2 }, { hand: ['Goblin Attack Force'], m: ['Familiar Knight'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Familiar Knight')); auto(g);
  ok(on(g, 1, 'Goblin Attack Force') && cnt(g, 0, 'm', FILL) === 2, 'both players Special Summoned');
});
T('Final Countdown wins after 20 turns', () => {
  const g = duel({ board: [{ hand: ['Final Countdown'] }, {}] });
  act(g, 0, 'Final Countdown'); auto(g);
  ok(g.p[0].lp === 6000 && g.fcd && g.fcd.length === 1, 'paid 2000 and started counting');
  g.fcd[0].t = g.turnNo - 18; choose(g, 'end'); auto(g);
  ok(g.winner == null, 'no win yet at turn 19');
  for (let i = 0; i < 4 && g.winner == null && g.prompt; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); auto(g); }
  ok(g.winner === 0, `A won (winner ${g.winner})`);
});
T('Final Destiny discards 5 and destroys the field', () => {
  const g = duel({ board: [{ hand: ['Final Destiny', FILL, FILL, FILL, FILL, FILL], m: [FILL] }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Final Destiny'); auto(g);
  ok(g.p[0].hand.length === 1 && !g.p[0].m.some(Boolean) && !g.p[1].m.some(Boolean) && !st(g, 1, 'Mirror Force'), 'hand gone, field empty');
});
T('Final Ritual of the Ancients summons Reshef', () => {
  const g = duel({ board: [{ hand: ['Final Ritual of the Ancients', 'Reshef the Dark Being'], m: [FILL, FILL] }, {}] });
  act(g, 0, 'Final Ritual of the Ancients'); auto(g);
  ok(on(g, 0, 'Reshef the Dark Being') && cnt(g, 0, 'gy', FILL) === 2, 'Reshef Ritual Summoned with 2 Level 4s');
});
T('Fire Ant Ascator revives a Level 5 that leaves in the End Phase', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Fire Ant Ascator'], gy: ['Giant Axe Mummy'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Fire Ant Ascator')); auto(g);
  const m = on(g, 1, 'Giant Axe Mummy'); ok(m && m.flags.negated, 'Mummy summoned with its effects negated');
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(inZ(g, 1, 'gy', 'Giant Axe Mummy'), 'Mummy sent to the GY in the End Phase');
});
T('Fire Darts with an empty hand', () => {
  const g = duel({ board: [{ hand: [], st: ['Fire Darts'] }, {}] });
  choose(g, 'ns:'); auto(g); act(g, 0, 'Fire Darts'); auto(g);
  ok(g.p[1].lp <= 7700 && g.p[1].lp >= 6200 && g.p[1].lp % 100 === 0, `B took 300 to 1800 (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: [FILL], st: ['Fire Darts'] }, {}] });
  ok(!hasOpt(g2, 'a:' + st(g2, 0, 'Fire Darts').u + ':'), 'not with a card in hand');
});
T('Fire Sorcerer banishes 2 random cards for 800', () => {
  const g = duel({ board: [{ hand: [FILL, FILL, FILL], m: [{ n: 'Fire Sorcerer', pos: 'set' }], turn: 2 }, {}] });
  choose(g, 'flip:'); auto(g);
  ok(g.p[0].ban.length === 2 && g.p[1].lp === 7200, `2 banished, B 7200 (B ${g.p[1].lp})`);
});
T('Fire Trooper sends itself for 1000', () => {
  const g = duel({ board: [{ hand: ['Fire Trooper'] }, {}] });
  choose(g, 'ns:'); auto(g);
  ok(inZ(g, 0, 'gy', 'Fire Trooper') && g.p[1].lp === 7000, `Trooper in the GY, B 7000 (B ${g.p[1].lp})`);
});
T('Flame Ogre draws on Normal Summon; Flame Ruler counts as 2 Tributes', () => {
  const g = duel({ board: [{ hand: ['Flame Ogre'], m: ['Flame Ruler'] }, {}] });
  ok(hasOpt(g, 'ns:'), 'Tribute Summon offered with only Flame Ruler'); const h = g.p[0].hand.length;
  choose(g, 'ns:'); auto(g);
  ok(on(g, 0, 'Flame Ogre') && g.p[0].hand.length === h, 'Ogre summoned with 1 Tribute and drew 1');
  const g2 = duel({ board: [{}, { gy: ['Flame Ogre'] }] });
  ok(E.lib.forbid(g2, { type: 'ss', c: g2.p[1].gy[0], p: 1 }), 'Ogre cannot be Special Summoned from the GY');
});
T('Flame Spirit Ignis burns 100 per FIRE in the GY', () => {
  const g = duel({ board: [{ m: ['Flame Spirit Ignis'], gy: ['Fire Princess', 'Fire Trooper'] }, {}] });
  eff(g, on(g, 0, 'Flame Spirit Ignis'), 0); auto(g);
  ok(g.p[1].lp === 7700, `B took 300 (B ${g.p[1].lp})`);
});
T('Flint, Flint Lock and Flint Missile', () => {
  const g = duel({ board: [{ hand: ['Flint', 'Flint Missile'], m: ['Flint Lock'], turn: 2 }, { m: [FILL, FILL] }] });
  const [w1, w2] = g.p[1].m; const fl = on(g, 0, 'Flint Lock');
  act(g, 0, 'Flint'); choose(g, 'u' + w1.u); auto(g);
  ok(E.atk(g, w1) === 1700 && E.lib.forbid(g, { type: 'attack', c: w1 }), 'equipped Warwolf has 1700 ATK and cannot attack');
  eff(g, fl, 0); auto(g);
  ok(E.atk(g, w1) === 2000 && E.atk(g, fl) === 1500 && !E.lib.forbid(g, { type: 'attack', c: fl }), 'Flint Lock took Flint and ignores it');
  eff(g, fl, 1); choose(g, 'u' + w2.u); auto(g);
  ok(E.atk(g, w2) === 1700, 'Flint moved to the other Warwolf');
  act(g, 0, 'Flint Missile'); auto(g);
  const f = st(g, 0, 'Flint');
  ok(inZ(g, 1, 'gy', FILL) && f && f.equipTo === fl.u, 'Warwolf destroyed, Flint re-equipped (to Flint Lock)');
  ok(g.p[0].deck.some(c => E.name(c) === 'Flint Missile'), 'Flint Missile returned to the Deck');
});
T('Forced Back returns a Normal Summon to the hand', () => {
  const g = duel({ board: [{ hand: [FILL] }, { st: ['Forced Back'] }] });
  choose(g, 'ns:'); choose(g, 'Forced Back', 1); auto(g);
  ok(!on(g, 0, FILL) && g.p[0].hand.length === 2 && !hasOpt(g, 'ns:'), 'back in the hand, Normal Summon used');
});
T('Forced Ceasefire stops Trap activations; Forced Requisition copies discards', () => {
  const g = duel({ board: [{ hand: [FILL, 'Graceful Charity'], st: ['Forced Ceasefire', 'Forced Requisition'] }, { hand: [FILL, FILL, FILL, FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Forced Ceasefire'); choose(g, 'u' + g.p[0].hand.find(c => E.name(c) === FILL).u); choose(g, 'Forced Requisition', 0); auto(g);
  const mf = st(g, 1, 'Mirror Force');
  ok(E.lib.forbid(g, { type: 'activate', c: mf, eff: { type: 'act' }, p: 1 }), 'Mirror Force cannot be activated');
  ok(st(g, 0, 'Forced Requisition') && st(g, 0, 'Forced Requisition').pos === 'up', 'Forced Requisition activated on the discard');
  act(g, 0, 'Graceful Charity'); auto(g);
  ok(g.p[1].hand.length === 2, `B discarded 2 too (B hand ${g.p[1].hand.length})`);
});
T('Fusion Devourer makes a Fusion Monster 0 ATK in battle', () => {
  const g = duel({ board: [{ m: ['Fusion Devourer'], turn: 2 }, { m: ['Gaia the Dragon Champion'] }] });
  const gd = on(g, 1, 'Gaia the Dragon Champion'); ok(E.atk(g, gd) === 2600, 'Gaia 2600 outside battle');
  goBP(g); attack(g, on(g, 0, 'Fusion Devourer'), gd); auto(g);
  ok(inZ(g, 1, 'gy', 'Gaia the Dragon Champion') && g.p[1].lp === 6600, `Gaia destroyed, B took 1400 (B ${g.p[1].lp})`);
});
T('Fusion Gate summons Flame Ghost by banishing', () => {
  const g = duel({ ex0: ['Flame Ghost'], board: [{ hand: ['Fusion Gate', 'Skull Servant', 'Dissolverock'] }, {}] });
  act(g, 0, 'Fusion Gate'); auto(g);
  choose(g, 'Fusion Summon (banish'); auto(g);
  ok(on(g, 0, 'Flame Ghost') && inZ(g, 0, 'ban', 'Skull Servant') && inZ(g, 0, 'ban', 'Dissolverock'), 'Flame Ghost summoned, materials banished');
});
T('Fusion Guard negates burn and sends a Fusion', () => {
  const g = duel({ ex1: ['Flame Ghost'], board: [{ hand: ['Final Flame'] }, { st: ['Fusion Guard'] }] });
  act(g, 0, 'Final Flame'); choose(g, 'Fusion Guard', 1); auto(g);
  ok(g.p[1].lp === 8000 && inZ(g, 1, 'gy', 'Flame Ghost'), 'no damage, Flame Ghost in the GY');
});
T('Fusion Recovery adds Polymerization and a Fusion Material', () => {
  const g = duel({ board: [{ hand: ['Fusion Recovery', 'Skull Servant'], gy: ['Polymerization', 'Dissolverock'] }, {}] });
  E.lib.move(g, g.p[0].hand.find(c => E.name(c) === 'Skull Servant'), 'gy', { reason: 'fusion' }); choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === FILL).u); auto(g);
  act(g, 0, 'Fusion Recovery'); auto(g);
  ok(inZ(g, 0, 'hand', 'Polymerization') && inZ(g, 0, 'hand', 'Skull Servant') && inZ(g, 0, 'gy', 'Dissolverock'), 'Polymerization and Skull Servant added, Dissolverock (not a material) stays');
});
T('Fusion Sword Murasame Blade and Fusion Weapon', () => {
  const g = duel({ board: [{ hand: ['Fusion Sword Murasame Blade', 'Fusion Weapon'], m: ['Goblin Attack Force', 'Flame Ghost'] }, {}] });
  act(g, 0, 'Fusion Sword Murasame Blade'); auto(g);
  ok(E.atk(g, on(g, 0, 'Goblin Attack Force')) === 3100, 'Warrior gains 800');
  ok(E.lib.destroy(g, [st(g, 0, 'Fusion Sword Murasame Blade')], { by: 1 }).length === 0, 'the Blade survives a destroy effect');
  act(g, 0, 'Fusion Weapon'); auto(g);
  const fg = on(g, 0, 'Flame Ghost'); ok(E.atk(g, fg) === 2500 && E.def(g, fg) === 2300, 'Flame Ghost 2500/2300');
});
T('Gaia Plate: summon by banishing 2 Rocks, halves its battle opponent', () => {
  const g = duel({ board: [{ hand: ['Gaia Plate the Earth Giant'], gy: ['Giant Soldier of Stone', 'Giant Soldier of Stone'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'sp:'); auto(g);
  const gp = on(g, 0, 'Gaia Plate the Earth Giant'); ok(gp && g.p[0].ban.length === 2, 'summoned, 2 Rocks banished');
  goBP(g); attack(g, gp, on(g, 1, FILL)); auto(g);
  ok(g.p[1].lp === 6200, `B took 1800 (Warwolf halved to 1000) (B ${g.p[1].lp})`);
  ok(E.atk(g, gp) === 2800, 'Gaia Plate keeps 2800');
});
T('Gaia Power and Goblin King', () => {
  const g = duel({ board: [{ hand: ['Gaia Power'], m: ['Goblin Attack Force', 'Goblin King', 'Goblin of Greed', 'Goblin Elite Attack Force'] }, {}] });
  act(g, 0, 'Gaia Power'); auto(g);
  const ga = on(g, 0, 'Goblin Attack Force'); ok(E.atk(g, ga) === 2800 && E.def(g, ga) === 0, 'EARTH +500 ATK, DEF floors at 0');
  const k = on(g, 0, 'Goblin King'); ok(E.atk(g, k) === 2000 && E.lib.has(g, k, 'noAttackTarget'), 'Goblin King 2000 ATK and cannot be attacked');
});
T('Gaia Soul tributes Pyros, pierces and dies in the End Phase', () => {
  const g = duel({ board: [{ m: ['Gaia Soul the Combustible Collective', 'Fire Princess'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  const gs = on(g, 0, 'Gaia Soul the Combustible Collective'); eff(g, gs, 0); auto(g);
  ok(E.atk(g, gs) === 3000, 'Gaia Soul 3000');
  goBP(g); attack(g, gs, on(g, 1, FILL)); auto(g);
  ok(g.p[1].lp === 8000 - 2900, `2900 piercing (B ${g.p[1].lp})`);
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(inZ(g, 0, 'gy', 'Gaia Soul the Combustible Collective'), 'destroyed in the End Phase');
});
T('Giant Axe Mummy destroys a weaker attacker', () => {
  const g = duel({ board: [{ m: ['Fire Princess'], turn: 2 }, { m: [{ n: 'Giant Axe Mummy', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Fire Princess'), on(g, 1, 'Giant Axe Mummy')); auto(g);
  ok(inZ(g, 0, 'gy', 'Fire Princess') && g.p[0].lp === 7300, `Fire Princess destroyed, A took 700 (A ${g.p[0].lp})`);
});
T('Giant Germ burns and calls more Germs', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Giant Germ'], deckTop: ['Giant Germ', 'Giant Germ'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Giant Germ'));
  for (let i = 0; i < 40 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick') E.act(g, pr.opts.slice(0, pr.max).map(x => x.key)); else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  ok(g.p[0].lp === 7500 && cnt(g, 1, 'm', 'Giant Germ') === 2, `A took 500, B has 2 Germs (A ${g.p[0].lp})`);
});
T('Giant Kozaky destroys itself without Kozaky and burns its controller', () => {
  const g = duel({ board: [{ hand: ['Giant Kozaky'] }, {}] });
  choose(g, 'ns:'); auto(g);
  ok(inZ(g, 0, 'gy', 'Giant Kozaky') && g.p[0].lp === 5500, `destroyed, A took 2500 (A ${g.p[0].lp})`);
  const g2 = duel({ board: [{ hand: ['Giant Kozaky'], m: ['Kozaky'] }, {}] });
  choose(g2, 'ns:'); auto(g2); ok(on(g2, 0, 'Giant Kozaky'), 'stays with Kozaky');
});
T('Goblin lock: Attack Force goes to Defense and stays there', () => {
  const g = duel({ board: [{ m: ['Goblin Attack Force'], turn: 2 }, {}] });
  const ga = on(g, 0, 'Goblin Attack Force');
  goBP(g); attack(g, ga, null); auto(g); choose(g, 'endbp'); auto(g);
  ok(ga.pos === 'def' && g.p[1].lp === 5700, 'in Defense Position after attacking');
  ok(E.lib.forbid(g, { type: 'pos', c: ga }), 'cannot change position');
  g.turnNo += 3; g.seq++; ok(!E.lib.forbid(g, { type: 'pos', c: ga }), 'free again after your next turn');
});
T('Goblin Decoy Squad draws, Goblin Recon Squad sends a Spell, Black Ops attacks directly', () => {
  const g = duel({ board: [{ m: ['Goblin Decoy Squad', 'Goblin Recon Squad', 'Goblin Black Ops'], turn: 2 }, { hand: ['Final Flame'] }] });
  const h = g.p[0].hand.length; goBP(g);
  attack(g, on(g, 0, 'Goblin Black Ops'), null); auto(g);
  ok(g.p[1].lp === 6700, 'Black Ops hit directly');
  attack(g, on(g, 0, 'Goblin Decoy Squad'), null); auto(g); ok(g.p[0].hand.length === h + 1, 'Decoy Squad drew 1');
  attack(g, on(g, 0, 'Goblin Recon Squad'), null); auto(g); ok(inZ(g, 1, 'gy', 'Final Flame'), 'Recon Squad sent Final Flame to the GY');
});
T('Giant Trap Hole after Scapegoat', () => {
  const g2 = duel({ board: [{ hand: ['Scapegoat'], m: [FILL] }, { st: ['Giant Trap Hole'] }] });
  act(g2, 0, 'Scapegoat'); for (let i = 0; i < 10 && g2.prompt && g2.prompt.type !== 'idle'; i++) { if (hasOpt(g2, 'Giant Trap Hole')) { choose(g2, 'Giant Trap Hole', 1); continue; } auto(g2); }
  auto(g2);
  ok(!g2.p[0].m.some(Boolean), 'every monster destroyed');
});
T('Gift of the Martyr', () => {
  const g = duel({ board: [{ hand: ['Gift of the Martyr'], m: [FILL, 'Fire Princess'] }, {}] });
  act(g, 0, 'Gift of the Martyr'); choose(g, 'Gene-Warped'); auto(g);
  ok(E.atk(g, on(g, 0, 'Fire Princess')) === 3300, 'Fire Princess 1300 + 2000');
});
T('Goblin Fan destroys a Flip Summoned Man-Eater Bug before its effect', () => {
  const g = duel({ board: [{ m: [{ n: 'Man-Eater Bug', pos: 'set' }], turn: 2 }, { m: [FILL], st: [{ n: 'Goblin Fan', pos: 'up' }] }] });
  choose(g, 'flip:'); auto(g);
  ok(inZ(g, 0, 'gy', 'Man-Eater Bug') && on(g, 1, FILL), 'Bug destroyed, its effect did not happen');
});
T('Goblin of Greed stops discard costs', () => {
  const g = duel({ board: [{ hand: ['Lightning Vortex'], m: ['Goblin of Greed'] }, {}] });
  const lv = g.p[0].hand[0];
  ok(E.lib.forbid(g, { type: 'activate', c: lv, eff: E.SCRIPTS['Lightning Vortex'].effs[0], p: 0 }), 'Lightning Vortex blocked');
  ok(!E.lib.forbid(g, { type: 'activate', c: lv, eff: E.SCRIPTS['Graceful Charity'].effs[0], p: 0 }), 'an effect without a discard cost is fine');
});
T('Goblin Out of the Frying Pan returns the Spell', () => {
  const g = duel({ board: [{ hand: ['Final Flame'] }, { st: ['Goblin Out of the Frying Pan'] }] });
  act(g, 0, 'Final Flame'); choose(g, 'Frying Pan', 1); auto(g);
  ok(inZ(g, 0, 'hand', 'Final Flame') && g.p[1].lp === 7500, `Final Flame back in hand, B paid 500 (B ${g.p[1].lp})`);
});
T('Graceful Revival summons and links', () => {
  const g = duel({ board: [{ st: ['Graceful Revival'], gy: ['Giant Germ'] }, {}] });
  act(g, 0, 'Graceful Revival'); auto(g);
  const m = on(g, 0, 'Giant Germ'); ok(m && st(g, 0, 'Graceful Revival').linkTo === m.u, 'Giant Germ summoned and linked');
});
T('Energy Drain, Energy Bravery, Truesdale, Meteor Crush, Fairy of the Spring', () => {
  const g = duel({ board: [{ hand: ['Fairy Meteor Crush'], m: [FILL, { n: 'Fairy King Truesdale', pos: 'def' }, 'Elemental HERO Neos Alius', 'Energy Bravery'], st: ['Energy Drain'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  act(g, 0, 'Energy Drain'); choose(g, 'u' + on(g, 0, FILL).u); auto(g);
  const w = on(g, 0, FILL); ok(E.atk(g, w) === 3000, `+1000 for 5 cards (${E.atk(g, w)})`);
  ok(E.atk(g, on(g, 0, 'Fairy King Truesdale')) === 2700, 'Truesdale in Defense gives Plants 500');
  const al = on(g, 0, 'Elemental HERO Neos Alius'); ok(!E.lib.has(g, al, 'noEffectDestroy'), 'Gemini not yet protected'); al.flags.gemini = true; g.seq++;
  ok(E.lib.has(g, al, 'noEffectDestroy'), 'Gemini Summoned Alius protected by Energy Bravery');
  act(g, 0, 'Fairy Meteor Crush'); choose(g, 'u' + w.u); auto(g);
  goBP(g); attack(g, w, g.p[1].m[0]); auto(g);
  ok(g.p[1].lp === 8000 - 2900, `piercing 2900 (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: ['Fairy of the Spring'], gy: ['Fusion Weapon'], m: ['Flame Ghost'] }, {}] });
  act(g2, 0, 'Fairy of the Spring'); auto(g2);
  ok(inZ(g2, 0, 'hand', 'Fusion Weapon') && !hasOpt(g2, 'a:' + g2.p[0].hand.find(c => E.name(c) === 'Fusion Weapon').u + ':'), 'Fusion Weapon added, cannot be activated this turn');
});
T('Final Attack Orders turns Defense monsters to Attack', () => {
  const g = duel({ board: [{ st: ['Final Attack Orders'], m: [{ n: FILL, pos: 'def' }] }, { m: [{ n: FILL, pos: 'def' }] }] });
  act(g, 0, 'Final Attack Orders'); auto(g);
  ok(g.p[0].m[0].pos === 'atk' && g.p[1].m[0].pos === 'atk' && E.lib.forbid(g, { type: 'pos', c: g.p[1].m[0] }), 'both in Attack, locked');
});
T('Fairy Guardian returns a Spell the opponent destroyed', () => {
  const g = duel({ board: [{ hand: ['Final Flame'], m: ['Fairy Guardian'], st: ['Fusion Sage'] }, { st: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Final Flame'); choose(g, 'Mystical', 1); auto(g);
  ok(inZ(g, 0, 'gy', 'Fusion Sage'), 'Fusion Sage destroyed by MST');
  eff(g, on(g, 0, 'Fairy Guardian'), 0); auto(g);
  ok(E.name(g.p[0].deck[0]) === 'Fusion Sage' && inZ(g, 0, 'gy', 'Fairy Guardian'), 'Fusion Sage on the bottom of the Deck');
});
T('Flame Ghost and Gaia the Dragon Champion read their recipes', () => {
  const g = duel({ ex0: ['Flame Ghost', 'Gaia the Dragon Champion'], board: [{ hand: ['Skull Servant', 'Dissolverock', 'Gaia The Fierce Knight', 'Curse of Dragon'] }, {}] });
  ok(E.lib.fusionRecipe(g.p[0].extra[0]) && E.lib.fusionRecipe(g.p[0].extra[1]) && E.lib.canFusion(g, 0, { filter: x => E.name(x) === 'Gaia the Dragon Champion' }), 'both recipes read, Gaia can be made');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-08 checks passed.');
process.exit(fails ? 1 : 0);
