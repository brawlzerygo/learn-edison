// Scenario checks for full pool batch 11: node build/test_full-11.js
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
// answer everything up to the next free action: pass responses, say yes, take the first options.
// rules: [[prompt text part, card or label]] answer a matching pick/choose with that card (or option label)
function auto(g, o = {}) {
  const rules = o.rules || [];
  for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) {
    const pr = g.prompt;
    const r = rules.find(([t]) => pr.text.toLowerCase().includes(t.toLowerCase()));
    if (r && pr.type !== 'respond') {
      const v = r[1]; const keys = (Array.isArray(v) ? v : [v]).map(x => typeof x === 'string' ? (pr.opts.find(y => y.label.toLowerCase().includes(x.toLowerCase())) || {}).key : 'u' + x.u);
      E.act(g, keys); continue;
    }
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
const respond = (g, p, n) => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond' && !hasOpt(g, n); i++) E.act(g, ['pass']); choose(g, n, p); };

T('Levia-Dragon - Daedalus sends Umi and destroys all other cards', () => {
  const g = duel({ board: [{ hand: ['A Legendary Ocean'], m: ['Levia-Dragon - Daedalus'] }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'A Legendary Ocean'); auto(g); eff(g, on(g, 0, 'Levia-Dragon - Daedalus'), 0); auto(g);
  ok(on(g, 0, 'Levia-Dragon - Daedalus') && inZ(g, 0, 'gy', 'A Legendary Ocean') && !g.p[1].m.some(Boolean) && !st(g, 1, 'Mirror Force'), 'Umi sent, the other cards destroyed');
});
T('Light Effigy: a LIGHT Normal Monster with 1 Tribute', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon'], m: ['Light Effigy'] }, {}] });
  ok(hasOpt(g, 'ns:'), 'Tribute Summon offered'); choose(g, 'ns:'); auto(g);
  ok(on(g, 0, 'Blue-Eyes White Dragon'), 'Blue-Eyes summoned');
});
T('Light End Dragon loses 500, the other monster 1500', () => {
  const g = duel({ board: [{ m: ['Light End Dragon'], turn: 2 }, { m: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Light End Dragon'), on(g, 1, FILL)); auto(g);
  const l = on(g, 0, 'Light End Dragon'); ok(E.atk(g, l) === 2100 && E.def(g, l) === 1600, 'Light End Dragon is 2100/1600');
  ok(inZ(g, 1, 'gy', FILL) && g.p[1].lp === 8000 - 1600, `Warwolf at 500 destroyed, B took 1600 (B ${g.p[1].lp})`);
});
T('Light End Dragon Synchro: non-Tuners must be LIGHT', () => {
  const g = duel({ ex0: ['Light End Dragon'], board: [{ m: ['Mind Master', 'Blue-Eyes White Dragon'] }, {}] }); // Lv 1 Tuner + Lv 8 is 9: no
  ok(!hasOpt(g, 'Synchro Summon'), 'no summon with a wrong Level total');
  const g2 = duel({ ex0: ['Light End Dragon'], board: [{ m: ['Mind Master', 'Light Effigy', 'Light Effigy'] }, {}] }); // 1 + 4 + 4 = 9: no
  ok(!hasOpt(g2, 'Synchro Summon'), 'Levels must total 8');
  const g3 = duel({ ex0: ['Light End Dragon'], board: [{ m: ['Mind Master', 'Machine Lord Ur', 'Mad Reloader', 'Mad Reloader', 'Magical Plant Mandragola'] }, {}] });
  ok(!hasOpt(g3, 'Synchro Summon'), 'not with non-LIGHT non-Tuners');
});
T('Light Laser banishes the monster it battled', () => {
  const g = duel({ board: [{ hand: ['Light Laser'], m: ['Jain, Lightsworn Paladin'], turn: 2 }, { m: [{ n: 'Labyrinth Wall', pos: 'def' }] }] });
  act(g, 0, 'Light Laser'); auto(g); goBP(g); attack(g, on(g, 0, 'Jain, Lightsworn Paladin'), on(g, 1, 'Labyrinth Wall')); auto(g);
  ok(inZ(g, 1, 'ban', 'Labyrinth Wall'), 'the Labyrinth Wall was banished');
});
T('Light of Intervention: no monster can be Set', () => {
  const g = duel({ board: [{ hand: [FILL] }, { st: [{ n: 'Light of Intervention', pos: 'up' }] }] });
  ok(hasOpt(g, 'ns:') && g.prompt.opts.filter(o => o.key.startsWith('set:')).every(o => o.label === 'Normal Summon in Defense'), 'Normal Summon offered; a Set is a face-up Defense Normal Summon (rulings 3; 2026-11-28 audit, E4c)');
});
T('Light of Judgment discards from their hand', () => {
  const g = duel({ board: [{ hand: ['The Sanctuary in the Sky', 'Light Effigy'], st: ['Light of Judgment'] }, { hand: ['Mirror Force'] }] });
  act(g, 0, 'The Sanctuary in the Sky'); auto(g); act(g, 0, 'Light of Judgment'); auto(g, { rules: [['which effect', 'hand'], ['Discard which', g.p[1].hand.find(c => E.name(c) === 'Mirror Force')]] });
  ok(inZ(g, 0, 'gy', 'Light Effigy') && inZ(g, 1, 'gy', 'Mirror Force'), 'Effigy discarded, Mirror Force discarded');
});
T('Light of Redemption adds a banished LIGHT', () => {
  const g = duel({ board: [{ hand: ['Light of Redemption'], ban: ['Light Effigy'] }, {}] });
  act(g, 0, 'Light of Redemption'); auto(g);
  ok(inZ(g, 0, 'hand', 'Light Effigy') && g.p[0].lp === 7200, `Effigy added, paid 800 (A ${g.p[0].lp})`);
});
T('Light Spiral banishes when a Lightsworn mills', () => {
  const g = duel({ board: [{ m: ['Jain, Lightsworn Paladin'], st: [{ n: 'Light Spiral', pos: 'up' }] }, {}] });
  choose(g, 'end'); auto(g);
  ok(g.p[0].gy.length >= 2 && g.p[1].ban.length === 1, `Jain milled, 1 card banished (B ban ${g.p[1].ban.length})`);
});
T('Machine Assembly Line: +200, Junk Counters, revive', () => {
  const g = duel({ board: [{ m: ['Machine Lord Ur'], st: [{ n: 'Machine Assembly Line', pos: 'up' }], gy: ['Mind Master'], turn: 2 }, { m: [FILL] }] });
  const ur = on(g, 0, 'Machine Lord Ur'); ok(E.atk(g, ur) === 1800, 'Ur has 1800 ATK');
  goBP(g); attack(g, ur, on(g, 1, FILL)); auto(g);
  const mal = st(g, 0, 'Machine Assembly Line'); ok(E.lib.ctr(mal, 'junk') === 2, '2 Junk Counters after Ur was destroyed');
  mal.ctr.junk = 4; choose(g, 'endbp'); auto(g); eff(g, mal, 2); auto(g);
  ok(on(g, 0, 'Machine Lord Ur') && inZ(g, 0, 'gy', 'Machine Assembly Line'), 'Ur (Level 4) revived with 4 counters');
});
T('Machine King and Prototype count Machines', () => {
  const g = duel({ board: [{ m: ['Machine King', 'Machine King Prototype'] }, { m: ['Machine Lord Ur'] }] });
  ok(E.atk(g, on(g, 0, 'Machine King')) === 2500 && E.atk(g, on(g, 0, 'Machine King Prototype')) === 1800, 'King 2500, Prototype 1800');
});
T('Machine Lord Ur attacks each monster once, no battle damage to them', () => {
  const g = duel({ board: [{ m: ['Machine Lord Ur'], turn: 2 }, { m: ['Mask of Darkness', { n: FILL, pos: 'def' }] }] });
  const ur = on(g, 0, 'Machine Lord Ur'); goBP(g); attack(g, ur, on(g, 1, 'Mask of Darkness')); auto(g);
  ok(inZ(g, 1, 'gy', 'Mask of Darkness') && g.p[1].lp === 8000, 'Mask destroyed, no damage');
  ok(hasOpt(g, `atk:${ur.u}:`), 'a second attack offered'); attack(g, ur, on(g, 1, FILL)); auto(g);
  ok(inZ(g, 1, 'gy', FILL) && !hasOpt(g, `atk:${ur.u}:`), 'Warwolf destroyed, no third attack');
});
T('Mad Archfiend changes to Defense when attacked', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Mad Archfiend'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Mad Archfiend')); auto(g);
  ok(inZ(g, 1, 'gy', 'Mad Archfiend') && g.p[1].lp === 8000, 'it went to Defense: destroyed, no damage');
});
T('Mad Reloader sends 2 and draws 2', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { hand: ['Mirror Force', 'Umi'], m: ['Mad Reloader'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Mad Reloader')); auto(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Umi') && g.p[1].hand.length === 2, 'sent 2, drew 2');
});
T('Magic Drain: no Spell to discard, the Spell is negated', () => {
  const g = duel({ board: [{ hand: ['Final Flame'] }, { st: ['Magic Drain'] }] });
  act(g, 0, 'Final Flame'); respond(g, 1, 'Magic Drain'); auto(g);
  ok(g.p[1].lp === 8000 && inZ(g, 0, 'gy', 'Final Flame'), 'Final Flame negated');
  const g2 = duel({ board: [{ hand: ['Final Flame', 'Umi'] }, { st: ['Magic Drain'] }] });
  act(g2, 0, 'Final Flame'); respond(g2, 1, 'Magic Drain'); auto(g2);
  ok(g2.p[1].lp === 7400 && inZ(g2, 0, 'gy', 'Umi'), 'A discarded Umi, Final Flame resolved');
});
T('Magic Formula: +700 and 1000 LP when it leaves', () => {
  const g = duel({ board: [{ hand: ['Magic Formula', 'Heavy Storm'], m: ['Dark Magician'] }, {}] });
  act(g, 0, 'Magic Formula'); auto(g); ok(E.atk(g, on(g, 0, 'Dark Magician')) === 3200, 'Dark Magician 3200');
  act(g, 0, 'Heavy Storm'); auto(g); ok(g.p[0].lp === 9000, `A gained 1000 (A ${g.p[0].lp})`);
});
T('Magic Hole Golem halves ATK, direct attack, only that monster', () => {
  const g = duel({ board: [{ m: ['Magic Hole Golem', FILL], turn: 2 }, { m: [FILL] }] });
  const w = on(g, 0, FILL), gol = on(g, 0, 'Magic Hole Golem'); eff(g, gol, 0); auto(g, { rules: [['Which of your', w]] });
  ok(E.atk(g, w) === 1000, 'Warwolf at 1000'); goBP(g);
  ok(hasOpt(g, `atk:${w.u}:d`) && !hasOpt(g, `atk:${gol.u}:`), 'Warwolf can attack directly, Golem cannot attack');
  attack(g, w, null); auto(g); ok(g.p[1].lp === 7000, `B took 1000 (B ${g.p[1].lp})`);
});
T('Magic Reflector: a counter instead of destruction', () => {
  const g = duel({ board: [{ hand: ['Magic Reflector', 'Heavy Storm'], st: [{ n: 'Machine Assembly Line', pos: 'up' }] }, {}] });
  act(g, 0, 'Magic Reflector'); auto(g); act(g, 0, 'Heavy Storm'); auto(g);
  const m = st(g, 0, 'Machine Assembly Line'); ok(m && E.lib.ctr(m, 'reflector') === 0, 'Assembly Line stayed, counter removed');
});
T('Magical Arm Shield: the taken monster is attacked instead', () => {
  const g = duel({ board: [{ m: [FILL, 'Mask of Darkness'], turn: 2 }, { m: ['Mad Reloader'], st: ['Magical Arm Shield'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Mad Reloader')); respond(g, 1, 'Magical Arm Shield'); auto(g);
  ok(inZ(g, 0, 'gy', 'Mask of Darkness') && on(g, 1, 'Mad Reloader') && g.p[1].lp === 6900, `Mask destroyed, B took 1100 (B ${g.p[1].lp})`);
});
T('Magical Blast: burn and the Draw Phase return', () => {
  const g = duel({ board: [{ hand: ['Magical Blast'], m: ['Masked Sorcerer', 'Magical Exemplar'] }, {}] });
  act(g, 0, 'Magical Blast'); auto(g); ok(g.p[1].lp === 7600, `B took 400 (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ gy: ['Magical Blast'] }, {}] });
  // the opening draw already happened before the board; turn 1 draws again
  auto(g2); ok(inZ(g2, 0, 'hand', 'Magical Blast') && g2.p[0].hand.length === 6, `Blast back in the hand, the draw given up (hand ${g2.p[0].hand.length})`);
});
T('Magical Citadel of Endymion: counters, ② and ④', () => {
  const g = duel({ board: [{ hand: ['Magical Citadel of Endymion', 'Final Flame', 'Dark Hole'], m: ['Magical Marionette'] }, {}] });
  act(g, 0, 'Magical Citadel of Endymion'); auto(g); act(g, 0, 'Final Flame'); auto(g);
  const f = g.p[0].fz, mar = on(g, 0, 'Magical Marionette'); ok(E.lib.ctr(f, 'spell') === 1 && E.lib.ctr(mar, 'spell') === 2, 'Citadel got 1, Marionette 2 (the Citadel itself counts for it)');
  act(g, 0, 'Dark Hole'); auto(g); ok(inZ(g, 0, 'gy', 'Magical Marionette') && E.lib.ctr(f, 'spell') >= 2, `Marionette destroyed, its counter moved (Citadel ${E.lib.ctr(f, 'spell')})`);
  const n = E.lib.ctr(f, 'spell'); g.quiet = false;
  // ④ checked directly (no pending chain)
  E.lib.destroy(g, [f], { by: 1 }); ok(g.p[0].fz === f && E.lib.ctr(f, 'spell') === n - 1, 'it removed a counter instead of being destroyed');
});
T('Magical Dimension: Tribute, summon a Spellcaster, destroy', () => {
  const g = duel({ board: [{ hand: ['Magical Dimension', 'Magical Marionette'], m: ['Masked Sorcerer'] }, { m: [FILL] }] });
  const w = on(g, 1, FILL); act(g, 0, 'Magical Dimension'); auto(g, { rules: [['Destroy which', w]] });
  ok(inZ(g, 0, 'gy', 'Masked Sorcerer') && on(g, 0, 'Magical Marionette') && inZ(g, 1, 'gy', FILL), 'Sorcerer Tributed, Marionette summoned, Warwolf destroyed');
});
T('Magical Exemplar: 2 counters a Spell, summon by Level', () => {
  const g = duel({ board: [{ hand: ['Final Flame', 'Final Flame'], m: ['Magical Exemplar'], gy: ['Masked Sorcerer'] }, {}] });
  act(g, 0, 'Final Flame'); auto(g); act(g, 0, 'Final Flame'); auto(g);
  const ex = on(g, 0, 'Magical Exemplar'); ok(E.lib.ctr(ex, 'spell') === 4, '4 counters');
  eff(g, ex, 1); auto(g); ok(on(g, 0, 'Masked Sorcerer') && E.lib.ctr(ex, 'spell') === 0, 'Sorcerer (Level 4) summoned for 4 counters');
});
T('Magical Explosion: 200 per Spell with an empty hand', () => {
  const g = duel({ board: [{}, { hand: [], st: ['Magical Explosion'], gy: ['Final Flame', 'Umi', 'Heavy Storm'] }] });
  choose(g, 'end'); respond(g, 1, 'Magical Explosion'); auto(g);
  ok(g.p[0].lp === 7400, `A took 600 (A ${g.p[0].lp})`);
});
T('Magical Hats in the opponent\'s Battle Phase', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Mad Reloader'], st: ['Magical Hats'], deckTop: ['Umi', 'Final Flame'] }] });
  goBP(g); if (g.prompt.type === 'respond' && hasOpt(g, 'Magical Hats')) choose(g, 'Magical Hats', 1); else { attack(g, on(g, 0, FILL), on(g, 1, 'Mad Reloader')); respond(g, 1, 'Magical Hats'); }
  auto(g, { rules: [['Spell/Trap Cards from your Deck', ['Umi', 'Final Flame']], ['new target', "Don't attack"]] });
  ok(g.p[1].m.filter(c => c && c.pos === 'set').length === 3, 'three face-down cards');
});
T('Magical Labyrinth summons Wall Shadow', () => {
  const g = duel({ board: [{ hand: ['Magical Labyrinth'], m: ['Labyrinth Wall'], deckTop: [FILL, 'Wall Shadow'] }, {}] });
  act(g, 0, 'Magical Labyrinth'); auto(g); eff(g, st(g, 0, 'Magical Labyrinth'), 1); auto(g);
  ok(on(g, 0, 'Wall Shadow') && inZ(g, 0, 'gy', 'Labyrinth Wall'), 'Wall Shadow summoned');
});
T('Magical Mallet shuffles and redraws', () => {
  const g = duel({ board: [{ hand: ['Magical Mallet', 'Umi', 'Final Flame'] }, {}] });
  const dk = g.p[0].deck.length; act(g, 0, 'Magical Mallet'); auto(g, { rules: [['Shuffle which', g.p[0].hand.filter(c => E.name(c) !== 'Magical Mallet')]] });
  ok(g.p[0].hand.length === 3 && g.p[0].deck.length === dk, 'shuffled 3, drew 3');
});
T('Magical Marionette counters and destroy', () => {
  const g = duel({ board: [{ hand: ['Final Flame', 'Final Flame'], m: ['Magical Marionette'] }, { m: [FILL] }] });
  act(g, 0, 'Final Flame'); auto(g); act(g, 0, 'Final Flame'); auto(g);
  const m = on(g, 0, 'Magical Marionette'); ok(E.atk(g, m) === 2400, 'Marionette 2400 with 2 counters');
  eff(g, m, 1); auto(g, { rules: [['Destroy which', on(g, 1, FILL)]] }); ok(inZ(g, 1, 'gy', FILL) && E.atk(g, m) === 2000, 'Warwolf destroyed');
});
T('Magical Plant Mandragola places Spell Counters', () => {
  const g = duel({ board: [{ m: [{ n: 'Magical Plant Mandragola', pos: 'set' }, 'Magical Marionette', FILL], turn: 2 }, { m: ['Breaker the Magical Warrior'] }] });
  choose(g, 'flip:'); auto(g);
  ok(E.lib.ctr(on(g, 0, 'Magical Marionette'), 'spell') === 1 && E.lib.ctr(on(g, 1, 'Breaker the Magical Warrior'), 'spell') === 1 && E.lib.ctr(on(g, 0, FILL), 'spell') === 0, 'Marionette and Breaker got one, Warwolf none');
});
T('Magical Reflect Slime sends its battle damage back', () => {
  const g = duel({ board: [{ m: ['Magical Reflect Slime'], turn: 2 }, { m: [FILL] }] });
  on(g, 0, 'Magical Reflect Slime').flags.gemini = true;
  goBP(g); attack(g, on(g, 0, 'Magical Reflect Slime'), on(g, 1, FILL)); auto(g);
  ok(g.p[0].lp === 8000 && g.p[1].lp === 6700, `B took the 1300 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Magical Scientist summons a Fusion that goes back', () => {
  const g = duel({ ex0: ['Metal Dragon'], board: [{ m: ['Magical Scientist'], turn: 2 }, {}] });
  eff(g, on(g, 0, 'Magical Scientist'), 0); auto(g);
  const md = on(g, 0, 'Metal Dragon'); ok(md && g.p[0].lp === 7000, 'Metal Dragon summoned for 1000');
  ok(E.lib.forbid(g, { type: 'attack', c: md }), 'it cannot attack directly');
  choose(g, 'end'); auto(g); ok(inZ(g, 0, 'extra', 'Metal Dragon'), 'back in the Extra Deck');
});
T('Magical Thorn: 500 per discard', () => {
  const g = duel({ board: [{ hand: [FILL, FILL, FILL, FILL, FILL, FILL, FILL, FILL] }, { st: [{ n: 'Magical Thorn', pos: 'up' }] }] });
  choose(g, 'end'); auto(g); ok(g.p[0].lp === 6500, `A discarded 3 for the hand limit (A ${g.p[0].lp})`);
});
T('Malevolent Catastrophe destroys Spells and Traps', () => {
  const g = duel({ board: [{ m: [FILL], st: ['Mirror Force'], turn: 2 }, { m: [FILL], st: ['Malevolent Catastrophe', 'Magic Jammer'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, FILL)); respond(g, 1, 'Malevolent Catastrophe'); auto(g);
  ok(!st(g, 0, 'Mirror Force') && !st(g, 1, 'Magic Jammer'), 'every Spell and Trap destroyed');
});
T('Malevolent Nuzzler goes back on top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Malevolent Nuzzler', 'Heavy Storm'], m: [FILL] }, {}] });
  act(g, 0, 'Malevolent Nuzzler'); auto(g); ok(E.atk(g, on(g, 0, FILL)) === 2700, 'Warwolf 2700');
  act(g, 0, 'Heavy Storm'); auto(g); const d = g.p[0].deck;
  ok(E.name(d[d.length - 1]) === 'Malevolent Nuzzler' && g.p[0].lp === 7500, 'Nuzzler on top, paid 500');
});
T('Malice Ascendant mills per copy in the GY', () => {
  const g = duel({ board: [{}, { m: ['Malice Ascendant'], gy: ['Malice Ascendant', 'Malice Ascendant'] }] });
  auto(g); ok(g.p[0].gy.length === 2, `A sent 2 (GY ${g.p[0].gy.length})`);
});
T('Malice Dispersion destroys face-up Continuous Traps', () => {
  const g = duel({ board: [{ hand: ['Malice Dispersion', FILL] }, { st: [{ n: 'Magical Thorn', pos: 'up' }, 'Mirror Force'] }] });
  act(g, 0, 'Malice Dispersion'); auto(g);
  ok(inZ(g, 1, 'gy', 'Magical Thorn') && st(g, 1, 'Mirror Force') && inZ(g, 0, 'gy', FILL), 'Thorn destroyed, Mirror Force kept');
});
T('Malice Doll of Demise comes back next Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Malice Doll of Demise'], st: [{ n: 'Machine Assembly Line', pos: 'up' }] }, {}] });
  act(g, 0, 'Dark Hole'); auto(g); ok(inZ(g, 0, 'gy', 'Malice Doll of Demise'), 'destroyed (PARTIAL: with a Continuous Spell face-up)');
  choose(g, 'end'); auto(g); if (g.prompt && g.prompt.type === 'idle') choose(g, 'end'); auto(g);
  ok(on(g, 0, 'Malice Doll of Demise'), 'back on the field in the next Standby Phase');
});
T('Mask of Brutality, Mask of the Accursed, Mask of Weakness', () => {
  const g = duel({ board: [{ hand: ['Mask of Brutality', 'Mask of the Accursed'], m: [FILL] }, { m: [FILL] }] });
  act(g, 0, 'Mask of Brutality'); auto(g, { rules: [['Equip to which', on(g, 0, FILL)]] });
  ok(E.atk(g, on(g, 0, FILL)) === 3000 && E.def(g, on(g, 0, FILL)) === 0, 'Brutality: 3000/0');
  act(g, 0, 'Mask of the Accursed'); auto(g, { rules: [['Accursed', on(g, 1, FILL)]] });
  ok(E.lib.has(g, on(g, 1, FILL), 'cantAttack'), 'Accursed: it cannot attack');
});
T('Mask of Darkness adds a Trap', () => {
  const g = duel({ board: [{ m: [{ n: 'Mask of Darkness', pos: 'set' }], gy: ['Mirror Force'], turn: 2 }, {}] });
  choose(g, 'flip:'); auto(g); ok(inZ(g, 0, 'hand', 'Mirror Force'), 'Mirror Force added');
});
T('Masked Beast Des Gardius: summon and the Mask', () => {
  const g = duel({ board: [{ hand: ['Masked Beast Des Gardius', 'Dark Hole'], m: ['Grand Tiki Elder', FILL], deckTop: ['The Mask of Remnants'] }, { m: [FILL] }] });
  ok(!g.prompt.opts.some(o => o.key === 'ns:' + g.p[0].hand[0].u), 'no Normal Summon'); choose(g, 'sp:'); auto(g);
  ok(on(g, 0, 'Masked Beast Des Gardius') && inZ(g, 0, 'gy', 'Grand Tiki Elder'), 'summoned by Tributing Tiki Elder and Warwolf');
  const g2 = duel({ board: [{ hand: ['Dark Hole'] }, { m: ['Masked Beast Des Gardius', FILL] }] });
  act(g2, 0, 'Dark Hole'); auto(g2); ok(!g2.p[1].m.some(Boolean), 'both destroyed');
  const g3 = duel({ board: [{ hand: ['Dark Hole'], m: [FILL], deckTop: ['Mirror Force'] }, { m: ['Masked Beast Des Gardius'], deckTop: ['The Mask of Remnants'] }] });
  act(g3, 0, 'Dark Hole'); auto(g3); ok(!st(g3, 1, 'The Mask of Remnants'), 'no monster left to equip, the Mask stays in the Deck');
});
T('Masked Beast Des Gardius equips the Mask to a monster', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [FILL], turn: 2 }, { m: ['Masked Beast Des Gardius'], deckTop: ['The Mask of Remnants'] }] });
  const gd = on(g, 1, 'Masked Beast Des Gardius'); gd.pos = 'atk';
  // move it to the GY by battle: a strong attacker
  gd.mods.push({ set: 0, which: 'atk' }); goBP(g); attack(g, on(g, 0, FILL), gd); auto(g);
  const m = st(g, 1, 'The Mask of Remnants'); ok(m && m.equipTo === on(g, 0, FILL).u, 'the Mask is equipped to the Warwolf');
});
T('Masked Chopper: 2000 when it destroys by battle', () => {
  const g = duel({ board: [{ m: ['Masked Chopper'], turn: 2 }, { m: [{ n: 'Mad Archfiend', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Masked Chopper'), on(g, 1, 'Mad Archfiend')); auto(g);
  ok(g.p[1].lp === 6000, `B took 2000 (B ${g.p[1].lp})`);
});
T('Masked Dragon summons a Dragon from the Deck', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Masked Dragon'], deckTop: ['Masked Dragon'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Masked Dragon')); auto(g);
  ok(on(g, 1, 'Masked Dragon') && cnt(g, 1, 'gy', 'Masked Dragon') === 1, 'a new Masked Dragon came out');
});
T('Masked Sorcerer draws on battle damage', () => {
  const g = duel({ board: [{ m: ['Masked Sorcerer'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; goBP(g); attack(g, on(g, 0, 'Masked Sorcerer'), null); auto(g);
  ok(g.p[0].hand.length === h + 1, 'drew 1');
});
T('Master Gig destroys one per Psychic', () => {
  const g = duel({ board: [{ m: ['Master Gig', 'Mind Master'] }, { m: [FILL, FILL, 'Mad Reloader'] }] });
  eff(g, on(g, 0, 'Master Gig'), 0); auto(g);
  ok(g.p[0].lp === 7000 && g.p[1].m.filter(Boolean).length === 1, 'paid 1000, 2 destroyed');
});
T('Master Monk: summon by Tributing Monk Fighter, two attacks', () => {
  const g = duel({ board: [{ hand: ['Master Monk'], m: ['Monk Fighter'], turn: 2 }, { m: [{ n: 'Mad Reloader', pos: 'def' }, { n: 'Mask of Darkness', pos: 'def' }] }] });
  ok(!g.prompt.opts.some(o => o.key === 'ns:' + g.p[0].hand[0].u), 'no Normal Summon'); choose(g, 'sp:'); auto(g);
  const mm = on(g, 0, 'Master Monk'); ok(mm && inZ(g, 0, 'gy', 'Monk Fighter'), 'summoned');
  goBP(g); attack(g, mm, on(g, 1, 'Mad Reloader')); auto(g); ok(hasOpt(g, `atk:${mm.u}:`), 'a second attack');
});
T('Master of Oz and Metal Dragon recipes', () => {
  const g = duel({ ex0: ['Master of Oz', 'Metal Dragon'], board: [{ hand: ['Big Koala', 'Des Kangaroo', 'Steel Ogre Grotto 1', 'Lesser Dragon'] }, {}] });
  const f = n => E.lib.canFusion(g, 0, { from: ['hand'], filter: x => E.name(x) === n });
  ok(f('Master of Oz') && f('Metal Dragon'), 'both can be Fusion Summoned from these materials');
  const g2 = duel({ ex0: ['Master of Oz', 'Metal Dragon'], board: [{ hand: ['Big Koala', 'Lesser Dragon'] }, {}] });
  ok(!E.lib.canFusion(g2, 0, { from: ['hand'] }), 'not with the wrong pair');
});
T('Metal Detector negates a Continuous Trap', () => {
  const g = duel({ board: [{ st: ['Light of Intervention'] }, { st: ['Metal Detector'] }] });
  act(g, 0, 'Light of Intervention'); respond(g, 1, 'Metal Detector'); auto(g);
  ok(g.log.some(l => /Light of Intervention's activation was negated/.test(l)) && !st(g, 0, 'Light of Intervention'), 'negated, the card goes to the GY (a negated activation; 2026-11-28 audit, pass2 edison-09)');
});
T('Metal Shooter: counters for ATK and to survive', () => {
  const g = duel({ board: [{ hand: ['Metal Shooter', 'Dark Hole'], m: [FILL] }, {}] });
  choose(g, 'ns:'); auto(g); const s = on(g, 0, 'Metal Shooter'); ok(E.atk(g, s) === 2400, 'Shooter 2400');
  act(g, 0, 'Dark Hole'); auto(g); ok(on(g, 0, 'Metal Shooter') && E.atk(g, s) === 1600, 'survived Dark Hole, 1600');
});
T('Metallizing Parasite - Lunatite: equip and protect', () => {
  const g = duel({ board: [{ m: ['Metallizing Parasite - Lunatite', FILL] }, { hand: [] }] });
  eff(g, on(g, 0, 'Metallizing Parasite - Lunatite'), 0); auto(g);
  const w = on(g, 0, FILL); const lu = st(g, 0, 'Metallizing Parasite - Lunatite'); ok(lu && lu.equipTo === w.u, 'equipped');
  ok(E.lib.has(g, w, 'unaffectedSpells'), 'the Warwolf is unaffected by Spells');
});
T('Mind Master summons a Psychic', () => {
  const g = duel({ board: [{ m: ['Mind Master', 'Master Gig'], deckTop: [FILL, 'Mind Master'] }, {}] });
  eff(g, on(g, 0, 'Mind Master'), 0); auto(g);
  ok(cnt(g, 0, 'm', 'Mind Master') === 2 && inZ(g, 0, 'gy', 'Master Gig') && g.p[0].lp === 7200, 'Gig Tributed, a second Mind Master');
});
T('Mind Over Matter negates a Normal Summon', () => {
  const g = duel({ board: [{ hand: [FILL] }, { m: ['Mind Master'], st: ['Mind Over Matter'] }] });
  choose(g, 'ns:'); choose(g, 'Mind Over Matter', 1); auto(g);
  ok(!on(g, 0, FILL) && inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Mind Master'), 'negated and destroyed');
});
T('Mind Trust adds a Tuner', () => {
  const g = duel({ board: [{ hand: ['Mind Trust'], m: [FILL], gy: ['Mind Master'] }, {}] });
  act(g, 0, 'Mind Trust'); auto(g); ok(inZ(g, 0, 'hand', 'Mind Master') && inZ(g, 0, 'gy', FILL), 'Mind Master added');
});
T('Mind Wipe: they shuffle their hand and redraw', () => {
  const g = duel({ board: [{ hand: ['Mind Wipe'] }, { hand: ['Umi', 'Mirror Force'] }] });
  act(g, 0, 'Mind Wipe'); auto(g); ok(g.p[1].hand.length === 2 && !inZ(g, 1, 'hand', 'Umi'), 'drew 2 new cards');
});
T('Mind Haxorz: pay 500', () => {
  const g = duel({ board: [{ st: ['Mind Haxorz'] }, { hand: ['Umi'], st: ['Mirror Force'] }] });
  act(g, 0, 'Mind Haxorz'); auto(g); ok(g.p[0].lp === 7500 && g.log.some(l => /Set cards: Mirror Force/.test(l)), 'paid and saw');
});
T('Magic Jammer negates a Spell', () => {
  const g = duel({ board: [{ hand: ['Final Flame'] }, { hand: ['Umi'], st: ['Magic Jammer'] }] });
  act(g, 0, 'Final Flame'); respond(g, 1, 'Magic Jammer'); auto(g); ok(g.p[1].lp === 8000 && inZ(g, 1, 'gy', 'Umi'), 'negated');
});
T('Mask of Dispel burns the Spell controller', () => {
  const g = duel({ board: [{ st: [{ n: 'Machine Assembly Line', pos: 'up' }] }, { hand: ['Mask of Dispel'], turn: 2 }] });
  // B goes second: pass turn 1
  choose(g, 'end'); auto(g); act(g, 1, 'Mask of Dispel'); auto(g); choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(g.p[0].lp === 7500, `A took 500 in B's Standby Phase (A ${g.p[0].lp})`);
});
console.log(fails ? `${fails} FAILED` : 'all passed');
process.exitCode = fails ? 1 : 0;
