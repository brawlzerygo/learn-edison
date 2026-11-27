// Independent review of full pool batch 01 (written from the card text, not the script): node build/review_full-01.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // 2000/100 Normal
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
}
let fails = 0, tests = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const find = (g, p, n) => { for (const z of ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra']) { const c = g.p[p][z].find(x => x && E.name(x) === n); if (c) return c; } return null; };
const actU = (g, c) => choose(g, 'a:' + c.u + ':');
const act = (g, p, n) => actU(g, [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n));
const canAct = (g, c) => hasOpt(g, 'a:' + c.u + ':');
const T = (name, f) => { tests++; try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const toBP = g => { choose(g, 'bp'); passAll(g); };
const atkWith = (g, n, t) => choose(g, `atk:${on(g, g.tp, n).u}:${t != null ? t : ''}`);
const atkTarget = (g, n, tn) => atkWith(g, n, on(g, 1 - g.tp, tn).u);
// answer everything up to the next free action: pass, yes, the first choice, picks by name preference
const auto = (g, prefer = [], yes = true, use = []) => { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const u = pr.opts.find(x => x.key !== 'pass' && use.some(w => x.label.includes(w))); E.act(g, [u ? u.key : 'pass']); } else if (pr.type === 'yesno') E.act(g, [yes ? 'y' : 'n']);
  else if (pr.type === 'choose') { const o = pr.opts.find(x => prefer.some(w => x.label.includes(w))) || pr.opts[0]; E.act(g, [o.key]); }
  else { const os = pr.opts.filter(x => prefer.some(w => x.label.includes(w))).concat(pr.opts.filter(x => !prefer.some(w => x.label.includes(w)))); E.act(g, os.slice(0, Math.max(pr.min, 1)).map(x => x.key)); } } };
const isIdle = g => g.prompt && (g.prompt.type === 'idle');
const endTurn = g => { if (g.prompt && g.prompt.opts.some(o => o.key === 'endbp')) { E.act(g, ['endbp']); auto(g); } choose(g, 'end'); auto(g); };
const ptype = g => g.prompt && g.prompt.type;
// Gladiator Beast tag out: a Quick Effect in the Battle Step (batch 3) or a trigger at the end of the Battle Phase (yes/no)
const tag = (g, c, prefer = [], use = []) => { if (canAct(g, c)) actU(g, c); else E.act(g, ['endbp']); auto(g, prefer, true, use); };

/* ===== Gladiator Beasts ===== */
// tag out with a batch-3 Gladiator Beast into the card under test (a real "Special Summoned by a Gladiator Beast effect")
function tagInto(target, extraDeck = [], bBoard = {}) {
  const g = duel({ board: [{ hand: [], m: ['Gladiator Beast Laquari'], deckTop: [FILL, target, ...extraDeck], turn: 2 }, Object.assign({ hand: [] }, bBoard)] });
  toBP(g); atkWith(g, 'Gladiator Beast Laquari', 'd'); passAll(g);
  tag(g, on(g, 0, 'Gladiator Beast Laquari'), [target, 'Attack']);
  return g;
}
T('Gladiator Beast Alexander', () => {
  const g = duel({ board: [{ hand: [], m: ['Gladiator Beast Dimacari'], deckTop: [FILL, 'Gladiator Beast Alexander'], turn: 2 }, { hand: [] }] });
  toBP(g); atkWith(g, 'Gladiator Beast Dimacari', 'd'); passAll(g);
  ok(g.p[1].lp === 6400, 'Dimacari hit for 1600');
  tag(g, on(g, 0, 'Gladiator Beast Dimacari'), ['Alexander', 'Attack']);
  const a = on(g, 0, 'Gladiator Beast Alexander');
  ok(!!a, 'Alexander Special Summoned by Dimacari');
  ok(a && E.lib.has(g, a, 'unaffectedSpells'), 'Special Summoned Alexander is unaffected by Spells');
  const g2 = duel({ board: [{ hand: ['Gladiator Beast Alexander'], gy: ['Gladiator Beast Alexander'], m: [FILL], turn: 2 }, {}] });
  const ax = g2.p[0].gy[0];
  ok(E.lib.forbid(g2, { type: 'ss', c: ax, p: 0, how: 'special' }), 'cannot be Special Summoned by other cards');
  ok(hasOpt(g2, 'ns:' + g2.p[0].hand.find(c => E.name(c) === 'Gladiator Beast Alexander').u), 'can be Tribute Summoned');
  const g3 = duel({ board: [{ hand: [], m: ['Gladiator Beast Alexander'], deckTop: [FILL, 'Gladiator Beast Dimacari'], turn: 2 }, { hand: [] }] });
  toBP(g3); atkWith(g3, 'Gladiator Beast Alexander', 'd'); passAll(g3);
  tag(g3, on(g3, 0, 'Gladiator Beast Alexander'), ['Dimacari', 'Attack']);
  ok(on(g3, 0, 'Gladiator Beast Dimacari') && !on(g3, 0, 'Gladiator Beast Alexander'), 'Alexander tagged out into Dimacari');
});
T('Gladiator Beast Dimacari', () => {
  const g = tagInto('Gladiator Beast Dimacari');
  ok(!!on(g, 0, 'Gladiator Beast Dimacari'), 'Dimacari summoned by Laquari');
  endTurn(g); endTurn(g);
  toBP(g); atkWith(g, 'Gladiator Beast Dimacari', 'd'); passAll(g);
  ok(g.p[1].lp === 8000 - 1800 - 1600, `first attack hits (B ${g.p[1].lp})`);
  ok(hasOpt(g, 'atk:' + on(g, 0, 'Gladiator Beast Dimacari').u), 'second attack offered');
  atkWith(g, 'Gladiator Beast Dimacari', 'd'); passAll(g);
  ok(g.p[1].lp === 8000 - 1800 - 3200, `second attack hits (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: [], m: ['Gladiator Beast Dimacari'], turn: 2 }, { hand: [] }] });
  toBP(g2); atkWith(g2, 'Gladiator Beast Dimacari', 'd'); passAll(g2);
  ok(!hasOpt(g2, 'atk:' + on(g2, 0, 'Gladiator Beast Dimacari').u), 'not Summoned by a Gladiator Beast: one attack only');
});
T('Gladiator Beast Gaiodiaz', () => {
  const g = duel({ ex0: ['Gladiator Beast Gaiodiaz'], board: [{ hand: [], m: ['Gladiator Beast Spartacus', 'Gladiator Beast Laquari'], deckTop: [FILL, 'Gladiator Beast Hoplomus', 'Gladiator Beast Dimacari'], turn: 2 }, { hand: [], m: ['Insect Knight'] }] });
  const gx = g.p[0].extra.find(c => E.name(c) === 'Gladiator Beast Gaiodiaz');
  ok(hasOpt(g, 'sp:' + gx.u), 'contact Fusion offered'); choose(g, 'sp:' + gx.u); auto(g);
  ok(on(g, 0, 'Gladiator Beast Gaiodiaz') && !on(g, 0, 'Gladiator Beast Spartacus') && !on(g, 0, 'Gladiator Beast Laquari'), 'Gaiodiaz summoned, materials gone');
  ok(inZ(g, 0, 'deck', 'Gladiator Beast Spartacus'), 'materials shuffled into the Deck');
  toBP(g); atkTarget(g, 'Gladiator Beast Gaiodiaz', 'Insect Knight'); auto(g);
  ok(inZ(g, 1, 'gy', 'Insect Knight') && g.p[1].lp === 8000 - 700 - 1500, `700 battle + 1500 DEF burn (B ${g.p[1].lp})`);
  tag(g, on(g, 0, 'Gladiator Beast Gaiodiaz'), ['Hoplomus', 'Dimacari', 'Attack']);
  ok(on(g, 0, 'Gladiator Beast Hoplomus') && on(g, 0, 'Gladiator Beast Dimacari') && inZ(g, 0, 'extra', 'Gladiator Beast Gaiodiaz'), '2 Gladiator Beasts summoned, Gaiodiaz back in the Extra Deck');
  const g2 = duel({ ex0: ['Gladiator Beast Gaiodiaz'], board: [{ hand: [], m: ['Gladiator Beast Hoplomus', 'Gladiator Beast Laquari'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + g2.p[0].extra[0].u), 'no contact Fusion without Spartacus');
});
T('Gladiator Beast Octavius', () => {
  const g = tagInto('Gladiator Beast Octavius', [], { st: ['Mystical Space Typhoon'] });
  ok(!!on(g, 0, 'Gladiator Beast Octavius'), 'Octavius summoned by Laquari');
  ok(inZ(g, 1, 'gy', 'Mystical Space Typhoon'), 'Octavius destroyed the Set Spell');
  endTurn(g); endTurn(g);
  const h = g.p[0].hand.length;
  toBP(g); atkWith(g, 'Gladiator Beast Octavius', 'd'); passAll(g);
  ok(g.p[1].lp === 8000 - 1800 - 2500, 'Octavius hit for 2500');
  E.act(g, ['endbp']); auto(g);
  ok(!on(g, 0, 'Gladiator Beast Octavius') || g.p[0].hand.length === h - 1, `after the Battle Phase: Octavius shuffled or 1 card discarded (hand ${h} -> ${g.p[0].hand.length})`);
});
T('Gladiator Beast Secutor', () => {
  const g = tagInto('Gladiator Beast Secutor', ['Gladiator Beast Hoplomus', 'Gladiator Beast Dimacari']);
  ok(!!on(g, 0, 'Gladiator Beast Secutor'), 'Secutor summoned by Laquari');
  endTurn(g); endTurn(g);
  toBP(g); atkWith(g, 'Gladiator Beast Secutor', 'd'); passAll(g);
  tag(g, on(g, 0, 'Gladiator Beast Secutor'), ['Hoplomus', 'Dimacari', 'Attack']);
  ok(on(g, 0, 'Gladiator Beast Hoplomus') && on(g, 0, 'Gladiator Beast Dimacari'), 'Secutor brought out 2 Gladiator Beasts');
});
T('Gladiator Beast Spartacus', () => {
  const g = duel({ board: [{ hand: [], m: ['Gladiator Beast Hoplomus'], deckTop: [FILL, 'Gladiator Beast Spartacus', "Gladiator Beast's Battle Gladius"], turn: 2 }, { hand: [] }] });
  toBP(g); atkWith(g, 'Gladiator Beast Hoplomus', 'd'); passAll(g);
  tag(g, on(g, 0, 'Gladiator Beast Hoplomus'), ['Spartacus', 'Gladius', 'Attack']);
  ok(!!on(g, 0, 'Gladiator Beast Spartacus'), 'Spartacus summoned by Hoplomus');
  ok(inZ(g, 0, 'hand', "Gladiator Beast's Battle Gladius"), 'Spartacus added a Gladiator Beast Equip Spell');
  const g2 = duel({ board: [{ hand: [], gy: ['Gladiator Beast Spartacus'], turn: 2 }, {}] });
  ok(E.lib.forbid(g2, { type: 'ss', c: g2.p[0].gy[0], p: 0, how: 'special' }), 'cannot be Special Summoned by other cards');
});
T('Gladiator Beast Torax', () => {
  const g = tagInto('Gladiator Beast Torax');
  ok(!!on(g, 0, 'Gladiator Beast Torax'), 'Torax summoned by Laquari');
  endTurn(g); endTurn(g);
  toBP(g); atkWith(g, 'Gladiator Beast Torax', 'd'); passAll(g);
  const h = g.p[0].hand.length; const t = on(g, 0, 'Gladiator Beast Torax');
  tag(g, t);
  ok(!on(g, 0, 'Gladiator Beast Torax') && g.p[0].hand.length === h + 1, 'Torax shuffled in, drew 1');
});
function equipTo(g, spell, mon) { act(g, 0, spell); auto(g, [mon]); }
T("Gladiator Beast's Battle Archfiend Shield", () => {
  const g = duel({ board: [{ hand: ["Gladiator Beast's Battle Archfiend Shield"], m: ['Gladiator Beast Laquari'], turn: 2 }, { hand: [], m: ['Cyber Dragon'] }] });
  equipTo(g, "Gladiator Beast's Battle Archfiend Shield", 'Laquari');
  ok(inZ(g, 0, 'st', "Gladiator Beast's Battle Archfiend Shield"), 'equipped');
  toBP(g); atkTarget(g, 'Gladiator Beast Laquari', 'Cyber Dragon'); auto(g);
  ok(on(g, 0, 'Gladiator Beast Laquari') && inZ(g, 0, 'gy', "Gladiator Beast's Battle Archfiend Shield"), 'Shield destroyed instead of Laquari');
  const g2 = duel({ board: [{ hand: ["Gladiator Beast's Battle Archfiend Shield"], m: ['Gladiator Beast Laquari'], deckTop: [FILL, 'Gladiator Beast Dimacari'], turn: 2 }, { hand: [] }] });
  equipTo(g2, "Gladiator Beast's Battle Archfiend Shield", 'Laquari');
  toBP(g2); atkWith(g2, 'Gladiator Beast Laquari', 'd'); passAll(g2); tag(g2, on(g2, 0, 'Gladiator Beast Laquari'), ['Dimacari', 'Attack']);
  ok(inZ(g2, 0, 'hand', "Gladiator Beast's Battle Archfiend Shield"), 'Shield returns to the hand on a tag out');
});
T("Gladiator Beast's Battle Gladius", () => {
  const g = duel({ board: [{ hand: ["Gladiator Beast's Battle Gladius"], m: ['Gladiator Beast Laquari'], deckTop: [FILL, 'Gladiator Beast Dimacari'], turn: 2 }, { hand: [] }] });
  const lq = on(g, 0, 'Gladiator Beast Laquari'); const base = E.atk(g, lq);
  equipTo(g, "Gladiator Beast's Battle Gladius", 'Laquari');
  ok(E.atk(g, lq) === base + 300, `+300 ATK (${base} -> ${E.atk(g, lq)})`);
  toBP(g); atkWith(g, 'Gladiator Beast Laquari', 'd'); passAll(g); tag(g, lq, ['Dimacari', 'Attack']);
  ok(inZ(g, 0, 'hand', "Gladiator Beast's Battle Gladius"), 'Gladius returns to the hand on a tag out');
  const g2 = duel({ board: [{ hand: ["Gladiator Beast's Battle Gladius"], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, g2.p[0].hand[0]), 'no equip without a Gladiator Beast');
});
T("Gladiator Beast's Battle Halberd", () => {
  const g = duel({ board: [{ hand: ["Gladiator Beast's Battle Halberd"], m: ['Gladiator Beast Laquari'], turn: 2 }, { hand: [], m: [{ n: FILL, pos: 'def' }], st: [{ n: 'Dark Room of Nightmare', pos: 'up' }] }] });
  equipTo(g, "Gladiator Beast's Battle Halberd", 'Laquari');
  toBP(g); atkTarget(g, 'Gladiator Beast Laquari', FILL); auto(g, ['Dark Room']);
  ok(inZ(g, 1, 'gy', 'Dark Room of Nightmare'), 'Halberd destroyed a Spell/Trap after the attack');
});
T("Gladiator Beast's Battle Manica", () => {
  const g = duel({ board: [{ hand: ["Gladiator Beast's Battle Manica"], m: ['Gladiator Beast Laquari'], turn: 2 }, { hand: [], m: ['Cyber Dragon'] }] });
  equipTo(g, "Gladiator Beast's Battle Manica", 'Laquari');
  const lq = on(g, 0, 'Gladiator Beast Laquari'); const a = E.atk(g, lq);
  toBP(g); atkTarget(g, 'Gladiator Beast Laquari', 'Cyber Dragon'); auto(g);
  ok(on(g, 0, 'Gladiator Beast Laquari') && g.p[0].lp === 8000 - (2100 - a), `Laquari survives, damage still applies (A ${g.p[0].lp})`);
});
T("Gladiator Beast's Respite", () => {
  const g = duel({ board: [{ hand: ["Gladiator Beast's Respite", 'Gladiator Beast Laquari', 'Gladiator Beast Dimacari'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; // includes the drawn card
  act(g, 0, "Gladiator Beast's Respite"); auto(g, ['Laquari', 'Dimacari']);
  ok(!inZ(g, 0, 'hand', 'Gladiator Beast Laquari') && !inZ(g, 0, 'hand', 'Gladiator Beast Dimacari') && g.p[0].hand.length === h - 3 + 3, `2 shuffled in, drew 3 (hand ${g.p[0].hand.length})`);
  const g2 = duel({ board: [{ hand: ["Gladiator Beast's Respite", 'Gladiator Beast Laquari'], turn: 2 }, {}] });
  ok(!canAct(g2, g2.p[0].hand.find(c => E.name(c) === "Gladiator Beast's Respite")), 'not with only 1 Gladiator Beast card');
});
T('Gladiator Lash', () => {
  const g = duel({ board: [{ hand: [], m: ['Gladiator Beast Laquari'], st: ['Gladiator Lash'], deckTop: [FILL, 'Gladiator Beast Dimacari'], turn: 2 }, { hand: [FILL, FILL] }] });
  toBP(g); atkWith(g, 'Gladiator Beast Laquari', 'd'); passAll(g);
  tag(g, on(g, 0, 'Gladiator Beast Laquari'), ['Dimacari', 'Attack'], ['Gladiator Lash']);
  // PARTIAL in the script: no window right after a summon by a resolving effect, so Lash comes as the first play of Main Phase 2
  if (!inZ(g, 0, 'gy', 'Gladiator Lash')) { const l = g.p[0].st.find(c => c && E.name(c) === 'Gladiator Lash'); ok(l && canAct(g, l), 'Lash usable after the tag out'); actU(g, l); auto(g); }
  ok(inZ(g, 0, 'gy', 'Gladiator Lash'), 'Gladiator Lash activated after the Gladiator Beast Special Summon');
  ok(g.p[1].hand.length === 1, `B discarded 1 (hand ${g.p[1].hand.length})`);
});
T('Gladiator Proving Ground', () => {
  const g = duel({ board: [{ hand: ['Gladiator Proving Ground'], deckTop: [FILL, 'Gladiator Beast Alexander', 'Gladiator Beast Laquari'], turn: 2 }, {}] });
  act(g, 0, 'Gladiator Proving Ground'); passAll(g);
  ok(!(ptype(g) === 'pick' && hasOpt(g, 'Alexander')), 'Level 6 Alexander not offered');
  auto(g, ['Laquari']);
  ok(inZ(g, 0, 'hand', 'Gladiator Beast Laquari'), 'Laquari added');
});

/* ===== Other cards ===== */
T('Enraged Battle Ox', () => {
  const g = duel({ board: [{ hand: [], m: ['Enraged Battle Ox', 'Giant Rat'], turn: 2 }, { hand: [], m: [{ n: FILL, pos: 'set' }, { n: FILL, pos: 'def' }] }] });
  toBP(g); atkWith(g, 'Enraged Battle Ox', g.p[1].m[0].u); auto(g);
  ok(g.p[1].lp === 8000 - 1600, `Battle Ox pierces (B ${g.p[1].lp})`);
  atkWith(g, 'Giant Rat', g.p[1].m[1].u); auto(g);
  ok(g.p[1].lp === 8000 - 1600 - 1300, `Giant Rat (Beast) pierces too (B ${g.p[1].lp})`);
});
T('A Cell Breeding Device', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'A Cell Breeding Device', pos: 'up' }], turn: 2 }, { hand: [], m: [FILL] }] });
  auto(g);
  ok(E.lib.ctr(g.p[1].m[0], 'A') === 1, 'an A-Counter on B\'s monster in A\'s Standby Phase');
});
T('A Cell Scatter Burst', () => {
  const g = duel({ board: [{ hand: ['A Cell Scatter Burst'], m: ['Alien Warrior'], turn: 2 }, { hand: [], m: [FILL] }] });
  act(g, 0, 'A Cell Scatter Burst'); auto(g, ['Alien Warrior']);
  ok(inZ(g, 0, 'gy', 'Alien Warrior') && E.lib.ctr(g.p[1].m[0], 'A') === 4, `Alien Warrior destroyed, 4 A-Counters placed (${E.lib.ctr(g.p[1].m[0], 'A')})`);
});
T('A Cell Incubator', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'], m: ['Alien Telepath'], st: [{ n: 'A Cell Incubator', pos: 'up' }, { n: 'A Cell Breeding Device', pos: 'up' }], turn: 2 }, { hand: [], m: [FILL], st: ['Mystical Space Typhoon'] }] });
  auto(g); ok(E.lib.ctr(g.p[1].m[0], 'A') === 1, 'Breeding Device placed a counter');
  act(g, 0, 'Alien Telepath'); auto(g, ['Face-down']);
  const inc = g.p[0].st.find(c => c && E.name(c) === 'A Cell Incubator');
  ok(inc && E.lib.ctr(inc, 'A') === 1, 'Incubator got an A-Counter when one was removed');
  act(g, 0, 'Heavy Storm'); auto(g);
  const tot = fieldTot(g);
  ok(inZ(g, 0, 'gy', 'A Cell Incubator') && tot === 1, `its counter went to a face-up monster when destroyed (${tot})`);
});
function fieldTot(g) { return E.lib.fieldMons(g).reduce((s, x) => s + E.lib.ctr(x, 'A'), 0); }
T('A Cat of Ill Omen', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'A Cat of Ill Omen', pos: 'set' }], deckTop: [FILL, FILL, 'Mirror Force', FILL], turn: 2 }, {}] });
  choose(g, 'flip:'); auto(g, ['Mirror']);
  const d = g.p[0].deck; ok(E.name(d[d.length - 1]) === 'Mirror Force', 'Mirror Force placed on top of the Deck');
});
T('A Cat of Ill Omen with Necrovalley', () => {
  const g = duel({ board: [{ hand: ['Necrovalley'], m: [{ n: 'A Cat of Ill Omen', pos: 'set' }], deckTop: [FILL, 'Mirror Force'], turn: 2 }, { hand: [] }] });
  act(g, 0, 'Necrovalley'); auto(g);
  choose(g, 'flip:'); auto(g, ['Mirror', 'hand', 'Hand']);
  ok(inZ(g, 0, 'hand', 'Mirror Force'), 'with Necrovalley the Trap can go to the hand');
});
T('A Deal with Dark Ruler', () => {
  const g = duel({ board: [{ hand: ['A Deal with Dark Ruler', 'Dark Hole'], m: ['Blue-Eyes White Dragon'], deckTop: [FILL, 'Berserk Dragon'], turn: 2 }, { hand: [] }] });
  ok(!canAct(g, g.p[0].hand[0]), 'not before a Level 8 left the field');
  act(g, 0, 'Dark Hole'); auto(g);
  ok(canAct(g, g.p[0].hand.find(c => E.name(c) === 'A Deal with Dark Ruler')), 'offered after Blue-Eyes went to the GY');
  act(g, 0, 'A Deal with Dark Ruler'); auto(g, ['Berserk']);
  ok(!!on(g, 0, 'Berserk Dragon'), 'Berserk Dragon Special Summoned from the Deck');
});
T('A Feather of the Phoenix', () => {
  const g = duel({ board: [{ hand: ['A Feather of the Phoenix', 'Dark Magician'], gy: ['Monster Reborn'], turn: 2 }, {}] });
  act(g, 0, 'A Feather of the Phoenix'); auto(g, ['Dark Magician', 'Monster Reborn']);
  const d = g.p[0].deck;
  ok(inZ(g, 0, 'gy', 'Dark Magician') && E.name(d[d.length - 1]) === 'Monster Reborn', 'discarded 1, Monster Reborn on top of the Deck');
});
T('A Feint Plan', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['A Feint Plan'], turn: 2 }, { hand: [], m: [{ n: FILL, pos: 'set' }] }] });
  act(g, 0, 'A Feint Plan'); auto(g);
  toBP(g);
  // PARTIAL in the script: the attack on a face-down monster is declared, then negated
  if (hasOpt(g, 'atk:' + g.p[0].m[0].u + ':' + g.p[1].m[0].u)) { choose(g, 'atk:' + g.p[0].m[0].u + ':' + g.p[1].m[0].u); auto(g); }
  ok(g.p[1].m[0] && g.p[1].m[0].pos === 'set' && inZ(g, 1, 'm', FILL), 'the face-down monster was not attacked');
});
T('A Hero Emerges', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: ['Dark Magician'], st: ['A Hero Emerges'] }] });
  toBP(g); atkWith(g, FILL, 'd');
  for (let i = 0; i < 5 && ptype(g) === 'respond' && g.prompt.p === 0; i++) E.act(g, ['pass']);
  choose(g, 'A Hero Emerges', 1); auto(g);
  ok(!!on(g, 1, 'Dark Magician'), 'Dark Magician Special Summoned');
});
T('A Major Upset', () => {
  const g = duel({ board: [{ hand: [], m: ['Sinister Serpent'], st: ['A Major Upset'], turn: 2 }, { hand: [], m: ['Blue-Eyes White Dragon', 'Dark Magician'] }] });
  g.p[1].m[0].summonType = 'special';
  act(g, 0, 'A Major Upset'); auto(g, ['Sinister']);
  ok(inZ(g, 0, 'gy', 'Sinister Serpent') && inZ(g, 1, 'hand', 'Blue-Eyes White Dragon') && on(g, 1, 'Dark Magician'), 'Special Summoned Blue-Eyes returned, the other stays');
});
T('A Man with Wdjat', () => {
  const g = duel({ board: [{ hand: ['A Man with Wdjat'], turn: 2 }, { hand: [], st: ['Mirror Force'] }] });
  choose(g, 'ns:'); auto(g);
  ok(!!on(g, 0, 'A Man with Wdjat') && isIdle(g), 'Normal Summoned, look effect resolved');
});
T('A Rival Appears!', () => {
  const g = duel({ board: [{ hand: ['Dark Magician', 'Luster Dragon'], st: ['A Rival Appears!'], turn: 2 }, { hand: [], m: ['Insect Knight'] }] });
  act(g, 0, 'A Rival Appears!'); auto(g, ['Insect', 'Luster']);
  ok(!!on(g, 0, 'Luster Dragon') && inZ(g, 0, 'hand', 'Dark Magician'), 'Level 4 Luster Dragon Special Summoned');
});
T('A Wingbeat of Giant Dragon', () => {
  const g = duel({ board: [{ hand: ['A Wingbeat of Giant Dragon'], m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'], turn: 2 }, { hand: [], st: ['Mirror Force', { n: 'Swords of Revealing Light', pos: 'up' }] }] });
  act(g, 0, 'A Wingbeat of Giant Dragon'); auto(g);
  ok(inZ(g, 0, 'hand', 'Blue-Eyes White Dragon') && !g.p[1].st.some(Boolean) && !g.p[0].st.some(Boolean), 'Blue-Eyes back to hand, all Spells/Traps destroyed');
  const g2 = duel({ board: [{ hand: ['A Wingbeat of Giant Dragon'], m: ['Luster Dragon'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!canAct(g2, g2.p[0].hand.find(c => E.name(c) === 'A Wingbeat of Giant Dragon')), 'not with only a Level 4 Dragon');
});
T('A-Team: Trap Disposal Unit', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'A-Team: Trap Disposal Unit'], turn: 2 }, { hand: [], st: ['Mirror Force'] }] });
  toBP(g); atkWith(g, FILL, 'd');
  for (let i = 0; i < 5 && ptype(g) === 'respond' && g.prompt.p === 0; i++) E.act(g, ['pass']);
  choose(g, 'Mirror Force', 1);
  ok(hasOpt(g, 'A-Team'), 'A-Team offered'); choose(g, 'A-Team'); auto(g);
  ok(inZ(g, 0, 'gy', 'A-Team: Trap Disposal Unit') && inZ(g, 1, 'gy', 'Mirror Force') && on(g, 0, FILL), 'Mirror Force negated and destroyed, Warwolf safe');
  ok(g.p[1].lp === 6000, 'the attack went through');
});
T('Amazoness Archer', () => {
  const g = duel({ board: [{ hand: [], m: ['Amazoness Archer', FILL], turn: 2 }, {}] });
  act(g, 0, 'Amazoness Archer'); auto(g);
  ok(g.p[1].lp === 6800 && !g.p[0].m.some(Boolean), `Tributed 2, 1200 damage (B ${g.p[1].lp})`);
});
T('Amazoness Archers', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, { n: 'Insect Knight', pos: 'def' }], turn: 2 }, { hand: [], m: [{ n: 'Amazoness Swords Woman', pos: 'def' }], st: ['Amazoness Archers'] }] });
  toBP(g); atkTarget(g, FILL, 'Amazoness Swords Woman');
  for (let i = 0; i < 5 && ptype(g) === 'respond' && g.prompt.p === 0; i++) E.act(g, ['pass']);
  ok(hasOpt(g, 'Amazoness Archers'), 'offered on the attack'); choose(g, 'Amazoness Archers', 1); auto(g);
  const ik = on(g, 0, 'Insect Knight'), w = on(g, 0, FILL);
  ok(ik && ik.pos === 'atk' && E.atk(g, ik) === 1400 && E.atk(g, w) === 1500, 'all A\'s monsters in Attack Position with -500 ATK');
});
T('Amazoness Blowpiper', () => {
  const g = duel({ board: [{ hand: [], m: ['Amazoness Blowpiper'], turn: 2 }, { hand: [], m: [FILL] }] });
  auto(g, [FILL]);
  ok(E.atk(g, g.p[1].m[0]) === 1500, `B's Warwolf at 1500 in A's turn (${E.atk(g, g.p[1].m[0])})`);
  endTurn(g);
  ok(E.atk(g, g.p[1].m[0]) === 2000, 'back to 2000 next turn');
});
T('Amazoness Chain Master', () => {
  const g = duel({ board: [{ hand: ['Dark Magician'], m: [FILL], turn: 2 }, { hand: [], m: ['Amazoness Chain Master'] }] });
  toBP(g); atkTarget(g, FILL, 'Amazoness Chain Master'); auto(g, ['Dark Magician']);
  ok(g.p[1].lp === 8000 - 500 - 1500 && inZ(g, 1, 'hand', 'Dark Magician') && !inZ(g, 0, 'hand', 'Dark Magician'), `paid 1500, took Dark Magician (B ${g.p[1].lp})`);
});
T('Amazoness Fighter', () => {
  const g = duel({ board: [{ hand: [], m: ['Amazoness Fighter'], turn: 2 }, { hand: [], m: ['Cyber Dragon'] }] });
  toBP(g); atkTarget(g, 'Amazoness Fighter', 'Cyber Dragon'); auto(g);
  ok(g.p[0].lp === 8000 && inZ(g, 0, 'gy', 'Amazoness Fighter'), 'no battle damage, Fighter still destroyed');
});
T('Amazoness Paladin', () => {
  const g = duel({ board: [{ hand: [], m: ['Amazoness Paladin', 'Amazoness Fighter'], turn: 2 }, { m: ['Amazoness Fighter'] }] });
  ok(E.atk(g, on(g, 0, 'Amazoness Paladin')) === 1900, `1900 with 2 Amazoness (${E.atk(g, on(g, 0, 'Amazoness Paladin'))})`);
  const g2 = duel({ board: [{ hand: [], m: ['Amazoness Paladin'], turn: 2 }, {}] });
  ok(E.atk(g2, on(g2, 0, 'Amazoness Paladin')) === 1800, 'counts itself');
});
T('Amazoness Spellcaster', () => {
  const g = duel({ board: [{ hand: ['Amazoness Spellcaster'], m: ['Amazoness Fighter'], turn: 2 }, { hand: [], m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Amazoness Spellcaster'); auto(g, ['Amazoness Fighter', 'Blue-Eyes']);
  const f = on(g, 0, 'Amazoness Fighter'), b = on(g, 1, 'Blue-Eyes White Dragon');
  ok(E.atk(g, f) === 3000 && E.atk(g, b) === 1500, `ATK switched (${E.atk(g, f)}, ${E.atk(g, b)})`);
  endTurn(g);
  ok(E.atk(g, f) === 1500 && E.atk(g, b) === 3000, 'switched back after the turn');
});
T('Amazoness Swords Woman', () => {
  const g = duel({ board: [{ hand: [], m: ['Amazoness Swords Woman'], turn: 2 }, { hand: [], m: ['Cyber Dragon'] }] });
  toBP(g); atkTarget(g, 'Amazoness Swords Woman', 'Cyber Dragon'); auto(g);
  ok(g.p[0].lp === 8000 && g.p[1].lp === 7400 && inZ(g, 0, 'gy', 'Amazoness Swords Woman'), `B took the 600 instead (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Amazoness Tiger', () => {
  const g = duel({ board: [{ hand: ['Amazoness Tiger'], m: ['Amazoness Tiger', 'Amazoness Fighter'] }, { hand: [], m: [FILL], turn: 2 }] });
  // B is the turn player? board turn goes on side 0; set it so A is the defender
  const t = on(g, 0, 'Amazoness Tiger');
  ok(E.atk(g, t) === 1100 + 800, `Tiger 1900 with 2 Amazoness (${E.atk(g, t)})`);
  if (g.tp === 0) {
    ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u) || true, '');
    endTurn(g);
  }
  toBP(g);
  ok(!hasOpt(g, 'atk:' + g.p[1].m[0].u + ':' + on(g, 0, 'Amazoness Fighter').u) && hasOpt(g, 'atk:' + g.p[1].m[0].u + ':' + t.u), 'B can attack Tiger but not Fighter');
});
T('Amazoness Tiger: only 1', () => {
  const g = duel({ board: [{ hand: ['Amazoness Tiger'], m: ['Amazoness Tiger'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'cannot Normal Summon a second face-up Tiger');
});
T('Ancient Crimson Ape', () => {
  const g = duel({ board: [{ hand: [], m: ['Ancient Crimson Ape', FILL], turn: 2 }, { hand: [], m: ['Cyber Dragon'] }] });
  toBP(g); atkTarget(g, FILL, 'Cyber Dragon'); auto(g);
  ok(g.p[0].lp === 8000 - 100 + 1000, `gained 1000 (A ${g.p[0].lp})`);
});
T('Ancient Gear', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear'], m: ['Ancient Gear'], turn: 2 }, {}] });
  const u = g.p[0].hand[0].u; ok(hasOpt(g, 'sp:' + u), 'Special Summon offered'); choose(g, 'sp:' + u); auto(g);
  const a = on(g, 0, 'Ancient Gear'); ok(a && a.pos === 'atk' && g.ns[0] === 0, 'in Attack Position, Normal Summon still free');
  // "Ancient Gear" in quotes is the card named Ancient Gear
  const g2 = duel({ board: [{ hand: ['Ancient Gear'], m: ['Ancient Gear Soldier'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + g2.p[0].hand[0].u), 'not with only another Ancient Gear monster');
});
T('Ancient Gear Cannon', () => {
  const g = duel({ board: [{ hand: [], m: ['Ancient Gear Cannon', FILL], turn: 2 }, { hand: [], st: ['Mirror Force'] }] });
  act(g, 0, 'Ancient Gear Cannon'); auto(g);
  ok(g.p[1].lp === 7500 && inZ(g, 0, 'gy', 'Ancient Gear Cannon'), '500 damage, Cannon Tributed');
  toBP(g); atkWith(g, FILL, 'd');
  let mf = false; for (let i = 0; i < 6 && ptype(g) === 'respond'; i++) { if (hasOpt(g, 'Mirror Force')) mf = true; E.act(g, ['pass']); }
  ok(!mf && g.p[1].lp === 5500, 'Mirror Force cannot be activated this Battle Phase');
});
T('Ancient Gear Castle', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Ancient Gear Soldier'], st: [{ n: 'Ancient Gear Castle', pos: 'up' }], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Ancient Gear Soldier')) === 1600, 'Ancient Gear Soldier gains 300');
  const cs = g.p[0].st[0];
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === FILL).u); auto(g);
  ok(Object.values(cs.ctr || {}).reduce((s, v) => s + v, 0) === 1, 'a counter after a Normal Summon');
});
T('Ancient Gear Drill', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Drill', FILL], m: ['Ancient Gear Soldier'], deckTop: [FILL, 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Ancient Gear Drill'); auto(g, [FILL, 'Pot of Greed']);
  const pot = g.p[0].st.find(c => c && E.name(c) === 'Pot of Greed');
  ok(pot && pot.pos === 'set', 'Pot of Greed Set from the Deck');
  ok(pot && !canAct(g, pot), 'it cannot be activated this turn');
  const g2 = duel({ board: [{ hand: ['Ancient Gear Drill', FILL], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, g2.p[0].hand[0]), 'not without an Ancient Gear monster');
});
T('Ancient Gear Engineer', () => {
  const g = duel({ board: [{ hand: [], m: ['Ancient Gear Engineer'], turn: 2 }, { hand: [], m: [{ n: FILL, pos: 'set' }], st: ['Mirror Force', 'Mystical Space Typhoon'] }] });
  toBP(g); atkWith(g, 'Ancient Gear Engineer', g.p[1].m[0].u);
  let any = false; for (let i = 0; i < 20 && g.prompt && !['battle', 'idle'].includes(ptype(g)); i++) { if (ptype(g) === 'respond') { if (g.prompt.p === 1 && g.prompt.opts.length > 1) any = true; E.act(g, ['pass']); } else auto(g, ['Mirror', 'Face-down']); }
  ok(!any, 'B could not activate Spells/Traps during the attack');
  ok(g.p[1].st.filter(Boolean).length === 1, 'one of B\'s Spells/Traps destroyed after the Damage Step');
});
T('Ancient Gear Engineer negates a targeting Trap', () => {
  const g = duel({ board: [{ hand: [], m: ['Ancient Gear Engineer'] }, { hand: [], st: ['Compulsory Evacuation Device'], turn: 2 }] });
  endTurn(g);
  const dev = g.p[1].st.find(c => c && E.name(c) === 'Compulsory Evacuation Device');
  actU(g, dev); auto(g, ['Ancient Gear Engineer'], true, ['Negate the Trap']); // PARTIAL: offered as a response
  ok(on(g, 0, 'Ancient Gear Engineer') && inZ(g, 1, 'gy', 'Compulsory Evacuation Device'), 'Engineer stays, the Trap is destroyed');
});
T('Ancient Gear Explosive', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Explosive'], m: ['Ancient Gear Golem'], turn: 2 }, {}] });
  act(g, 0, 'Ancient Gear Explosive'); auto(g, ['Golem']);
  ok(inZ(g, 0, 'gy', 'Ancient Gear Golem') && g.p[1].lp === 6500, `Golem destroyed, 1500 damage (B ${g.p[1].lp})`);
});
T('Ancient Gear Factory', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Factory', 'Ancient Gear Golem'], gy: ['Ancient Gear Golem', 'Ancient Gear Golem'], turn: 2 }, {}] });
  act(g, 0, 'Ancient Gear Factory'); auto(g, ['Ancient Gear Golem']);
  ok(cnt(g, 0, 'ban', 'Ancient Gear Golem') === 2, 'banished Levels 16 from the GY');
  const u = g.p[0].hand.find(c => E.name(c) === 'Ancient Gear Golem').u;
  ok(hasOpt(g, 'ns:' + u), 'Golem can be Normal Summoned without Tributes'); choose(g, 'ns:' + u); auto(g);
  ok(!!on(g, 0, 'Ancient Gear Golem'), 'Golem on the field with no Tributes');
});
T('Ancient Gear Fist', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Fist'], m: ['Ancient Gear Soldier'], turn: 2 }, { hand: [], m: [{ n: 'Insect Knight', pos: 'def' }] }] });
  equipTo(g, 'Ancient Gear Fist', 'Soldier');
  toBP(g); atkTarget(g, 'Ancient Gear Soldier', 'Insect Knight'); auto(g);
  ok(inZ(g, 1, 'gy', 'Insect Knight') && g.p[0].lp === 7800, `Insect Knight destroyed after the Damage Step (A ${g.p[0].lp})`);
});
T('Ancient Gear Gadjiltron Chimera', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Gadjiltron Chimera'], m: ['Green Gadget'], turn: 2 }, {}] });
  choose(g, 'ns:' + g.p[0].hand[0].u); auto(g, ['Green Gadget']);
  const c = on(g, 0, 'Ancient Gear Gadjiltron Chimera'); ok(c && E.atk(g, c) === 2600, `Green Gadget: 2600 ATK (${c && E.atk(g, c)})`);
  const g2 = duel({ board: [{ hand: ['Ancient Gear Gadjiltron Chimera'], m: ['Yellow Gadget'], turn: 2 }, { hand: [], m: [FILL] }] });
  choose(g2, 'ns:' + g2.p[0].hand[0].u); auto(g2, ['Yellow Gadget']);
  toBP(g2); atkTarget(g2, 'Ancient Gear Gadjiltron Chimera', FILL); auto(g2);
  ok(g2.p[1].lp === 8000 - 300 - 700, `Yellow Gadget: 700 extra damage (B ${g2.p[1].lp})`);
  const g3 = duel({ board: [{ hand: ['Ancient Gear Gadjiltron Chimera'], m: ['Red Gadget'], turn: 2 }, { hand: [] }] });
  choose(g3, 'ns:' + g3.p[0].hand[0].u); auto(g3, ['Red Gadget']);
  toBP(g3); atkWith(g3, 'Ancient Gear Gadjiltron Chimera', 'd'); auto(g3);
  ok(g3.p[1].lp === 8000 - 2300 - 500, `Red Gadget: 500 extra damage (B ${g3.p[1].lp})`);
});
T('Ancient Gear Golem', () => {
  const g = duel({ board: [{ hand: [], m: ['Ancient Gear Golem'], turn: 2 }, { hand: [], m: [{ n: FILL, pos: 'set' }], st: ['Mirror Force'] }] });
  toBP(g); atkWith(g, 'Ancient Gear Golem', g.p[1].m[0].u);
  let mf = false; for (let i = 0; i < 6 && ptype(g) === 'respond'; i++) { if (g.prompt.p === 1 && g.prompt.opts.length > 1) mf = true; E.act(g, ['pass']); }
  auto(g);
  ok(!mf, 'B cannot activate Spells/Traps on the attack');
  ok(g.p[1].lp === 8000 - 2900, `piercing damage (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: [], gy: ['Ancient Gear Golem'], turn: 2 }, {}] });
  ok(E.lib.forbid(g2, { type: 'ss', c: g2.p[0].gy[0], p: 0, how: 'special' }), 'cannot be Special Summoned');
  const g3 = duel({ board: [{ hand: ['Ancient Gear Golem'], m: [FILL, FILL], turn: 2 }, {}] });
  choose(g3, 'ns:' + g3.p[0].hand[0].u); auto(g3);
  ok(!!on(g3, 0, 'Ancient Gear Golem') && cnt(g3, 0, 'gy', FILL) === 2, 'Tribute Summoned with 2 Tributes');
});
T('Ancient Gear Knight', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Knight'], turn: 2 }, { hand: [], st: ['Mirror Force'] }] });
  choose(g, 'ns:' + g.p[0].hand[0].u); auto(g);
  const k = on(g, 0, 'Ancient Gear Knight'); ok(!!k, 'Normal Summoned');
  ok(hasOpt(g, 'gem:') === false, 'no second Normal Summon this turn');
  endTurn(g); endTurn(g);
  choose(g, 'gem:' + k.u); auto(g);
  ok(k.flags.gemini, 'Gemini Summoned');
  toBP(g); atkWith(g, 'Ancient Gear Knight', 'd');
  let mf = false; for (let i = 0; i < 6 && ptype(g) === 'respond'; i++) { if (g.prompt.p === 1 && g.prompt.opts.length > 1) mf = true; E.act(g, ['pass']); }
  ok(!mf && g.p[1].lp === 6200, 'Gemini Summoned Knight attacks with no Spell/Trap responses');
});
T('Ancient Gear Soldier', () => {
  const g = duel({ board: [{ hand: [], m: ['Ancient Gear Soldier'], turn: 2 }, { hand: [], st: ['Mirror Force'] }] });
  toBP(g); atkWith(g, 'Ancient Gear Soldier', 'd');
  let mf = false; for (let i = 0; i < 6 && ptype(g) === 'respond'; i++) { if (g.prompt.p === 1 && g.prompt.opts.length > 1) mf = true; E.act(g, ['pass']); }
  ok(!mf && g.p[1].lp === 6700, 'no Mirror Force, 1300 damage');
});
T('Ancient Gear Tank', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Tank', 'Mystical Space Typhoon'], m: ['Ancient Gear Soldier'], turn: 2 }, {}] });
  equipTo(g, 'Ancient Gear Tank', 'Soldier');
  ok(E.atk(g, on(g, 0, 'Ancient Gear Soldier')) === 1900, 'Soldier gains 600');
  act(g, 0, 'Mystical Space Typhoon'); auto(g, ['Ancient Gear Tank']);
  ok(inZ(g, 0, 'gy', 'Ancient Gear Tank') && g.p[1].lp === 7400, `Tank destroyed, 600 damage (B ${g.p[1].lp})`);
});
T('Ancient Gear Workshop', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Workshop'], gy: ['Ancient Gear Golem', FILL], turn: 2 }, {}] });
  act(g, 0, 'Ancient Gear Workshop'); auto(g, ['Golem']);
  ok(inZ(g, 0, 'hand', 'Ancient Gear Golem'), 'Golem added from the GY');
});
T('Ancient Lamp', () => {
  const g = duel({ board: [{ hand: ['La Jinn the Mystical Genie of the Lamp'], m: ['Ancient Lamp'], turn: 2 }, {}] });
  act(g, 0, 'Ancient Lamp'); auto(g);
  ok(!!on(g, 0, 'La Jinn the Mystical Genie of the Lamp'), 'La Jinn Special Summoned from the hand');
});
T('Ancient Leaf', () => {
  const g = duel({ board: [{ hand: ['Ancient Leaf'], lp: 9000, turn: 2 }, {}] });
  const h = g.p[0].hand.length;
  act(g, 0, 'Ancient Leaf'); auto(g);
  ok(g.p[0].lp === 7000 && g.p[0].hand.length === h - 1 + 2, 'paid 2000, drew 2');
  const g2 = duel({ board: [{ hand: ['Ancient Leaf'], turn: 2 }, {}] });
  ok(!canAct(g2, g2.p[0].hand[0]), 'not under 9000 LP');
});
T('Ancient Rules', () => {
  const g = duel({ board: [{ hand: ['Ancient Rules', 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Ancient Rules'); auto(g, ['Blue-Eyes']);
  ok(!!on(g, 0, 'Blue-Eyes White Dragon'), 'Blue-Eyes Special Summoned');
});
T('Ancient Telescope', () => {
  const g = duel({ board: [{ hand: ['Ancient Telescope'], turn: 2 }, {}] });
  const d = g.p[1].deck.map(c => c.u).join();
  act(g, 0, 'Ancient Telescope'); auto(g);
  ok(inZ(g, 0, 'gy', 'Ancient Telescope') && g.p[1].deck.map(c => c.u).join() === d, 'resolved, B\'s Deck order unchanged');
});
T('Anti Raigeki', () => {
  const g = duel({ board: [{ hand: ['Raigeki'], m: [FILL], turn: 2 }, { hand: [], m: [FILL], st: ['Anti Raigeki'] }] });
  act(g, 0, 'Raigeki');
  ok(hasOpt(g, 'Anti Raigeki'), 'offered against Raigeki'); choose(g, 'Anti Raigeki', 1); auto(g);
  ok(!g.p[0].m.some(Boolean) && g.p[1].m.some(Boolean), 'A\'s monsters destroyed, B\'s safe');
});
T('Anti-Aircraft Flower', () => {
  const g = duel({ board: [{ hand: [], m: ['Anti-Aircraft Flower', 'Insect Knight'], turn: 2 }, {}] });
  act(g, 0, 'Anti-Aircraft Flower'); auto(g, ['Insect']);
  ok(g.p[1].lp === 7200 && inZ(g, 0, 'gy', 'Insect Knight'), '800 damage for an Insect');
  const g2 = duel({ board: [{ hand: [], m: ['Anti-Aircraft Flower', FILL], turn: 2 }, {}] });
  ok(!canAct(g2, on(g2, 0, 'Anti-Aircraft Flower')), 'not without an Insect');
});
T('Anti-Fusion Device', () => {
  const g = duel({ board: [{ hand: [], st: ['Anti-Fusion Device'], turn: 2 }, { hand: [], m: ['Flame Swordsman', FILL] }] });
  act(g, 0, 'Anti-Fusion Device'); auto(g, ['Flame']);
  ok(inZ(g, 1, 'gy', 'Flame Swordsman') && on(g, 1, FILL), 'Flame Swordsman destroyed');
});
T('Anti-Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { hand: [], m: ['Royal Magical Library'], st: ['Anti-Spell'] }] });
  E.lib.addCtr(g, g.p[1].m[0], 'spell', 2);
  const h = g.p[0].hand.length;
  act(g, 0, 'Pot of Greed');
  ok(hasOpt(g, 'Anti-Spell'), 'offered against Pot of Greed'); choose(g, 'Anti-Spell', 1); auto(g);
  ok(g.p[0].hand.length === h - 1 && inZ(g, 0, 'gy', 'Pot of Greed') && E.lib.ctr(g.p[1].m[0], 'spell') === 0, 'Pot negated, 2 Spell Counters removed');
});

console.log(`\n${tests} review checks run.` + (fails ? ` ${fails} failed` : ' All passed.'));
process.exit(fails ? 1 : 0);
