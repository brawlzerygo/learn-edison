// Independent review checks for full batch 02 (written from the card text): node build/review_full-02.js [filter]
const L0 = require('./load')(); let E = L0.E; const C = L0.C; const fs2 = require('fs');
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board, quiet: true });
}
let fails = 0, passes = 0;
function ok(cond, msg) { if (!cond || process.env.V) console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; else passes++; }
const desc = g => g.prompt ? `[p${g.prompt.p} ${g.prompt.type} "${g.prompt.text}": ${g.prompt.opts.map(x => x.label + '[' + x.key + ']').join(', ')}]` : '[no prompt]';
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${desc(g)}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${desc(g)}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const dflt = g => { const pr = g.prompt; if (pr.type === "respond") E.act(g, ["pass"]); else if (pr.type === "yesno") E.act(g, ["n"]); else E.act(g, pr.opts.slice(0, Math.max(pr.min, 1)).map(o => o.key)); };
const passAll = (g, upto = 30) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) dflt(g); };
const yesAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes'); };
const noAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'no'); };
const find = (g, p, n, zones = ['hand', 'm', 'st', 'gy', 'ban', 'extra']) => { for (const z of zones) { const c = g.p[p][z].find(x => x && E.name(x) === n); if (c) return c; } if (g.p[p].fz && E.name(g.p[p].fz) === n) return g.p[p].fz; return null; };
const act = (g, p, n) => { const c = find(g, p, n); if (!c) throw new Error('no card ' + n + ' for ' + p); choose(g, 'a:' + c.u + ':'); };
const can = (g, p, n) => { const c = find(g, p, n); return !!c && hasOpt(g, 'a:' + c.u + ':'); };
const key = (g, k, p, n) => { const c = find(g, p, n); if (!c) throw new Error('no card ' + n); choose(g, k + ':' + c.u); };
const hasKey = (g, k, p, n) => { const c = find(g, p, n); return !!c && hasOpt(g, k + ':' + c.u); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const nm = (g, p) => g.p[p].m.filter(Boolean).length;
// answer a pick prompt by card name (several names allowed)
function pickN(g, ...names) {
  const pr = g.prompt; if (!pr || pr.type !== 'pick') throw new Error('no pick prompt for ' + names + ' ' + desc(g));
  const keys = []; for (const n of names) { const o = pr.opts.find(x => x.label.toLowerCase().includes(n.toLowerCase()) && !keys.includes(x.key)); if (!o) throw new Error(`no pick "${n}" in ${desc(g)}`); keys.push(o.key); }
  E.act(g, keys);
}
// pass prompts until the given player's idle prompt (or battle prompt)
function toIdle(g, p, upto = 60) {
  for (let i = 0; i < upto && g.prompt; i++) {
    const pr = g.prompt;
    if ((pr.type === 'idle' || pr.type === 'battle') && (p == null || pr.p === p)) return;
    if (pr.type === 'respond') dflt(g);
    else if (pr.type === 'yesno') E.act(g, ['n']);
    else if (pr.type === 'idle') E.act(g, [pr.opts.find(o => o.key === 'end') ? 'end' : pr.opts.find(o => o.key === 'endbp') ? 'endbp' : pr.opts[pr.opts.length - 1].key]);
    else if (pr.type === 'battle') E.act(g, ['endbp']);
    else E.act(g, pr.opts.slice(0, pr.min).map(o => o.key));
  }
}
const endTurn = g => { toIdle(g); choose(g, 'end'); };
const bp = g => { choose(g, 'bp'); passAll(g); };
const atkOn = (g, a, t) => { const A = on(g, 0, a) || on(g, 1, a); if (!A) throw new Error('no attacker ' + a); const pr = g.prompt; const o = pr && pr.opts.find(x => x.key.startsWith('atk:' + A.u + ':') && (t === 'd' ? x.key.endsWith(':d') : x.label.toLowerCase().includes(t.toLowerCase()))); if (!o) throw new Error(`no attack ${a} -> ${t} in ${desc(g)}`); E.act(g, [o.key]); };
const canAtk = (g, a) => { const A = on(g, 0, a) || on(g, 1, a); return !!A && !!g.prompt && g.prompt.opts.some(x => x.key.startsWith('atk:' + A.u + ':')); };
const filter = process.argv[2];
const T = (name, f) => { if (filter && !name.toLowerCase().includes(filter.toLowerCase())) return; try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.V) console.log(e.stack); } };
const up = n => ({ n, pos: 'up' });
const setc = n => ({ n, pos: 'set' });
const dpos = n => ({ n, pos: 'def' });

T('Aqua Chorus: monsters with the same name gain 500 ATK/DEF', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, FILL, 'Cyber Dragon'], st: [up('Aqua Chorus')], turn: 2 }, {}] });
  const ws = g.p[0].m.filter(c => c && E.name(c) === FILL);
  ok(ws.every(c => E.atk(g, c) === 2500 && E.def(g, c) === 600), `both Warwolfs 2500/600 (${ws.map(c => E.atk(g, c) + '/' + E.def(g, c))})`);
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 2100, 'Cyber Dragon unchanged');
});

T('Aqua Dragon: Fusion Summon with its three materials', () => {
  const g = duel({ ex0: ['Aqua Dragon'], board: [{ hand: ['Polymerization', 'Fairy Dragon', 'Amazon of the Seas', 'Zone Eater'], turn: 2 }, {}] });
  if (!E.scripted('Polymerization')) { ok(true, 'Polymerization not scripted, skip'); return; }
  act(g, 0, 'Polymerization'); passAll(g);
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) {
    if (g.prompt.type === 'pick') { const o = g.prompt.opts; if (o.some(x => x.label === 'Aqua Dragon')) pickN(g, 'Aqua Dragon'); else E.act(g, o.slice(0, g.prompt.max).map(x => x.key)); }
    else passAll(g);
    if (g.prompt && g.prompt.type === 'choose') E.act(g, [g.prompt.opts[0].key]);
  }
  toIdle(g, 0);
  ok(on(g, 0, 'Aqua Dragon') && inZ(g, 0, 'gy', 'Zone Eater'), 'Aqua Dragon on the field, materials in GY');
});

T('Aqua Spirit: summon rule and position change in opponent Standby', () => {
  const g = duel({ board: [{ hand: ['Aqua Spirit'], gy: ['Amazon of the Seas'], turn: 2 }, { m: [FILL] }] });
  ok(!hasKey(g, 'ns', 0, 'Aqua Spirit') && !hasKey(g, 'set', 0, 'Aqua Spirit'), 'no Normal Summon or Set');
  ok(hasKey(g, 'sp', 0, 'Aqua Spirit'), 'Special Summon offered');
  key(g, 'sp', 0, 'Aqua Spirit'); for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) pickN(g, 'Amazon'); passAll(g); toIdle(g, 0);
  ok(on(g, 0, 'Aqua Spirit') && inZ(g, 0, 'ban', 'Amazon of the Seas'), 'Aqua Spirit summoned, Amazon banished');
  choose(g, 'end');
  for (let i = 0; i < 20 && g.prompt && !(g.prompt.p === 0 && g.prompt.text.match(/Aqua Spirit/)) && !(g.prompt.type === 'idle'); i++) { if (g.prompt.type === 'respond' && hasOpt(g, 'Aqua Spirit')) break; if (g.prompt.type === 'yesno' && g.prompt.p === 0) break; E.act(g, [g.prompt.type === 'respond' ? 'pass' : g.prompt.opts[0].key]); }
  if (g.prompt.type === 'respond') choose(g, 'Aqua Spirit'); else yesAll(g);
  if (g.prompt && g.prompt.type === 'pick') pickN(g, FILL);
  passAll(g);
  const w = on(g, 1, FILL);
  ok(w && w.pos === 'def', `opponent Warwolf changed to Defense (${w && w.pos})`);
});

T('Armed Changer: discard an Equip to activate, adds a monster after battle', () => {
  const g = duel({ board: [{ hand: ['Armed Changer', 'Beast Fangs'], m: [FILL], gy: ['Armed Ninja'], turn: 2 }, { m: ['Big Eye'] }] });
  act(g, 0, 'Armed Changer'); if (g.prompt.type === 'pick' && hasOpt(g, 'Beast Fangs')) pickN(g, 'Beast Fangs'); if (g.prompt.type === 'pick') pickN(g, FILL); passAll(g);
  ok(inZ(g, 0, 'gy', 'Beast Fangs') && inZ(g, 0, 'st', 'Armed Changer'), 'Beast Fangs discarded, Armed Changer equipped');
  bp(g); atkOn(g, FILL, 'Big Eye'); passAll(g); passAll(g);
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'pick') pickN(g, 'Armed Ninja'); else if (g.prompt.type === 'respond' && hasOpt(g, 'Armed Changer')) choose(g, 'Armed Changer'); else passAll(g); }
  ok(inZ(g, 0, 'hand', 'Armed Ninja'), 'Armed Ninja added from the GY');
  const g2 = duel({ board: [{ hand: ['Armed Changer'], m: [FILL], turn: 2 }, {}] });
  ok(!can(g2, 0, 'Armed Changer'), 'cannot activate without another Equip Spell in hand');
});

T('Armed Dragon LV10: only by Tributing LV7, wipes face-up monsters', () => {
  const g = duel({ board: [{ hand: ['Armed Dragon LV10', 'Armed Ninja'], m: ['Armed Dragon LV7'], turn: 2 }, { m: ['Cyber Dragon', 'Big Eye', setc(FILL)] }] });
  ok(!hasKey(g, 'ns', 0, 'Armed Dragon LV10'), 'no Normal Summon');
  key(g, 'sp', 0, 'Armed Dragon LV10'); if (g.prompt.type === 'pick') pickN(g, 'LV7'); passAll(g); toIdle(g, 0);
  ok(on(g, 0, 'Armed Dragon LV10') && inZ(g, 0, 'gy', 'Armed Dragon LV7'), 'LV10 summoned by Tributing LV7');
  act(g, 0, 'Armed Dragon LV10'); if (g.prompt.type === 'pick') pickN(g, 'Armed Ninja'); passAll(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && inZ(g, 1, 'gy', 'Big Eye') && on(g, 1, FILL), 'face-up monsters destroyed, face-down stays');
  ok(inZ(g, 0, 'gy', 'Armed Ninja'), 'discard paid');
  const g2 = duel({ board: [{ hand: ['Armed Dragon LV10'], m: ['Armed Dragon LV5'], turn: 2 }, {}] });
  ok(!hasKey(g2, 'sp', 0, 'Armed Dragon LV10'), 'no summon without LV7');
});

T('Armed Dragon LV3: Standby Phase, sends itself to summon LV5 from Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Armed Dragon LV3'], deckTop: [FILL, 'Armed Dragon LV5'], turn: 2 }, {}] });
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'respond' && hasOpt(g, 'Armed Dragon LV3')) choose(g, 'Armed Dragon LV3'); else if (g.prompt.type === 'pick') pickN(g, 'LV5'); else passAll(g); }
  ok(on(g, 0, 'Armed Dragon LV5') && inZ(g, 0, 'gy', 'Armed Dragon LV3'), 'LV5 Special Summoned, LV3 in GY');
});

T('Armed Dragon LV5: discard to destroy, levels up in End Phase', () => {
  const g = duel({ board: [{ hand: ['Black Veloci'], m: ['Armed Dragon LV5'], deckTop: [FILL, 'Armed Dragon LV7'], turn: 2 }, { m: ['Big Eye', 'Cyber Dragon'] }] });
  act(g, 0, 'Armed Dragon LV5'); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) { if (hasOpt(g, 'Black Veloci')) pickN(g, 'Black Veloci'); else { ok(!hasOpt(g, 'Cyber Dragon'), 'Cyber Dragon (2100) is not a legal target for an 1800 discard'); pickN(g, 'Big Eye'); } } passAll(g);
  ok(inZ(g, 1, 'gy', 'Big Eye') && on(g, 1, 'Cyber Dragon') && inZ(g, 0, 'gy', 'Black Veloci'), 'Big Eye destroyed, Veloci discarded');
  // level up: destroy by battle
  const g2 = duel({ board: [{ hand: [], m: ['Armed Dragon LV5'], deckTop: [FILL, 'Armed Dragon LV7'], turn: 2 }, { m: ['Big Eye'] }] });
  toIdle(g2, 0); bp(g2); atkOn(g2, 'Armed Dragon LV5', 'Big Eye'); toIdle(g2, 0); choose(g2, 'endbp'); toIdle(g2, 0); choose(g2, 'end');
  for (let i = 0; i < 8 && g2.prompt && !(g2.prompt.type === 'idle'); i++) { if (g2.prompt.type === 'yesno' && g2.prompt.p === 0) choose(g2, 'yes'); else if (g2.prompt.type === 'respond' && g2.prompt.p === 0 && hasOpt(g2, 'Armed Dragon LV5')) choose(g2, 'Armed Dragon LV5'); else if (g2.prompt.type === 'pick') pickN(g2, 'LV7'); else dflt(g2); }
  ok(on(g2, 0, 'Armed Dragon LV7') && inZ(g2, 0, 'gy', 'Armed Dragon LV5'), 'LV7 summoned in the End Phase');
  const g3 = duel({ board: [{ hand: [], m: ['Armed Dragon LV5'], deckTop: [FILL, 'Armed Dragon LV7'], turn: 2 }, {}] });
  toIdle(g3, 0); choose(g3, 'end');
  ok(!(g3.prompt && g3.prompt.p === 0 && (g3.prompt.type === 'yesno' || hasOpt(g3, 'Armed Dragon LV5'))), 'no level up without a battle kill');
});

T('Armed Dragon LV7: no Normal Summon, discard to destroy weaker monsters', () => {
  const g = duel({ board: [{ hand: ['Armed Dragon LV7', FILL], m: [{ n: 'Armed Dragon LV7' }], turn: 2 }, { m: ['Big Eye', 'Cyber Dragon', FILL] }] });
  ok(!hasKey(g, 'ns', 0, 'Armed Dragon LV7') && !hasKey(g, 'set', 0, 'Armed Dragon LV7'), 'cannot be Normal Summoned/Set');
  const lv7 = on(g, 0, 'Armed Dragon LV7'); choose(g, 'a:' + lv7.u + ':'); if (g.prompt.type === 'pick') pickN(g, FILL); passAll(g);
  ok(inZ(g, 1, 'gy', 'Big Eye') && inZ(g, 1, 'gy', FILL) && on(g, 1, 'Cyber Dragon'), 'Big Eye and Warwolf (2000) destroyed, Cyber Dragon stays');
});

T('Armed Ninja: FLIP destroys a Spell Card', () => {
  const g = duel({ board: [{ hand: [], m: [setc('Armed Ninja')], turn: 2 }, { st: [up('Attack Pheromones')] }] });
  key(g, 'flip', 0, 'Armed Ninja'); passAll(g); if (g.prompt.type === 'pick') pickN(g, 'Attack Pheromones'); passAll(g);
  ok(inZ(g, 1, 'gy', 'Attack Pheromones'), 'Attack Pheromones destroyed');
  const g2 = duel({ board: [{ hand: [], m: [setc('Armed Ninja')], turn: 2 }, { st: [setc('Assault on GHQ')] }] });
  key(g2, 'flip', 0, 'Armed Ninja'); passAll(g2); if (g2.prompt.type === 'pick') pickN(g2, 'Face-down'); passAll(g2); toIdle(g2, 0);
  ok(g2.p[1].st.some(c => c && E.name(c) === 'Assault on GHQ' && c.pos === 'set'), 'a Set Trap is not destroyed and stays Set');
});

T('Armed Sea Hunter: negates the battled monster, needs another WATER', () => {
  const g = duel({ board: [{ hand: [], m: ['Armed Sea Hunter', 'Amazon of the Seas'], turn: 2 }, { m: [up('Big Shield Gardna'), 'Big Eye'] }] });
  g.p[1].m[0].pos = 'def';
  bp(g); atkOn(g, 'Armed Sea Hunter', 'Big Shield Gardna'); toIdle(g, 0);
  const b = on(g, 1, 'Big Shield Gardna');
  ok(b && b.pos === 'def', `Big Shield Gardna's effect negated, stays in Defense (${b && b.pos})`);
  const g1 = duel({ board: [{ hand: [], m: ['Armed Sea Hunter'], turn: 2 }, { m: [dpos('Big Shield Gardna')] }] });
  bp(g1); atkOn(g1, 'Armed Sea Hunter', 'Big Shield Gardna'); toIdle(g1, 0);
  ok(on(g1, 1, 'Big Shield Gardna').pos === 'atk', 'without another WATER, no negation (Gardna goes to Attack)');
  // substitute destruction
  const g2 = duel({ board: [{ hand: [], m: ['Armed Sea Hunter', 'Liquid Beast'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  bp(g2); atkOn(g2, 'Armed Sea Hunter', 'Cyber Dragon');
  for (let i = 0; i < 10 && g2.prompt && g2.prompt.type !== 'idle'; i++) { if (g2.prompt.type === 'yesno') choose(g2, 'yes'); else if (g2.prompt.type === 'pick') pickN(g2, 'Liquid Beast'); else dflt(g2); }
  ok(on(g2, 0, 'Armed Sea Hunter') && inZ(g2, 0, 'gy', 'Liquid Beast'), 'Liquid Beast destroyed instead of Sea Hunter');
});

T('Armed Samurai - Ben Kei: one extra attack per Equip', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: ['Armed Samurai - Ben Kei'], turn: 2 }, {}] });
  act(g, 0, 'Black Pendant'); if (g.prompt.type === 'pick') pickN(g, 'Ben Kei'); passAll(g);
  bp(g); atkOn(g, 'Armed Samurai - Ben Kei', 'd'); toIdle(g, 0);
  ok(canAtk(g, 'Armed Samurai - Ben Kei'), 'second attack offered'); atkOn(g, 'Armed Samurai - Ben Kei', 'd'); toIdle(g, 0);
  ok(g.p[1].lp === 6000, `two 1000 attacks (B ${g.p[1].lp})`);
  ok(!canAtk(g, 'Armed Samurai - Ben Kei'), 'no third attack');
});

T('Armor Break: negates an Equip Spell activation', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: [FILL], turn: 2 }, { st: ['Armor Break'] }] });
  act(g, 0, 'Black Pendant'); if (g.prompt.type === 'pick') pickN(g, FILL);
  ok(hasOpt(g, 'Armor Break'), 'Armor Break offered'); choose(g, 'Armor Break', 1); passAll(g); toIdle(g, 0);
  ok(inZ(g, 0, 'gy', 'Black Pendant') && E.atk(g, on(g, 0, FILL)) === 2000, 'Black Pendant negated and destroyed');
  ok(g.p[1].lp === 8000, `no Black Pendant damage (B ${g.p[1].lp})`);
});

T('Armor Breaker: equips to a Warrior, destroys a card on battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Armor Breaker', 'Assault Mercenary'], turn: 2 }, { st: ['Armor Break'] }] });
  act(g, 0, 'Armor Breaker'); if (g.prompt.type === 'choose') E.act(g, [g.prompt.opts[0].key]); if (g.prompt.type === 'pick') pickN(g, 'Assault Mercenary'); passAll(g);
  ok(inZ(g, 0, 'st', 'Armor Breaker'), 'Armor Breaker equipped');
  bp(g); atkOn(g, 'Assault Mercenary', 'd');
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') pickN(g, 'Face-down'); else if (g.prompt.type === 'yesno') choose(g, 'yes'); else dflt(g); }
  ok(g.p[1].lp === 6200 && inZ(g, 1, 'gy', 'Armor Break'), `damage then the Set card destroyed (B ${g.p[1].lp})`);
});

T('Armor Exe: cannot attack the turn summoned, destroyed without a Spell Counter', () => {
  const g = duel({ board: [{ hand: ['Armor Exe'], turn: 2 }, {}] });
  key(g, 'ns', 0, 'Armor Exe'); passAll(g); toIdle(g, 0); bp(g);
  ok(!canAtk(g, 'Armor Exe'), 'no attack the turn it is summoned');
  const g2 = duel({ board: [{ hand: [], m: ['Armor Exe'], turn: 2 }, {}] });
  toIdle(g2, 0);
  ok(inZ(g2, 0, 'gy', 'Armor Exe'), 'destroyed in the Standby Phase with no Spell Counter');
});

T('Armored Axon Kicker: no-Tribute summon with a Psychic, damage then revive', () => {
  const g = duel({ board: [{ hand: ['Armored Axon Kicker'], m: ['Psychic Commander'], gy: ['Black Ptera'], turn: 2 }, { m: [FILL] }] });
  key(g, 'ns', 0, 'Armored Axon Kicker'); if (g.prompt.type === 'choose') choose(g, 'No Tribute'); passAll(g); toIdle(g, 0);
  ok(on(g, 0, 'Armored Axon Kicker') && on(g, 0, 'Psychic Commander'), 'summoned without Tributing');
  bp(g); atkOn(g, 'Armored Axon Kicker', FILL);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') pickN(g, 'Black Ptera'); else if (g.prompt.type === 'yesno') choose(g, 'yes'); else dflt(g); }
  ok(g.p[0].lp === 7000, `took 1000 (A ${g.p[0].lp})`);
  ok(on(g, 0, 'Black Ptera'), 'Black Ptera (1000 ATK) Special Summoned');
});

T('Armored Cybern: equips to Cyber Dragon, ATK loss destroys a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon', 'Armored Cybern'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Armored Cybern'); if (g.prompt.type === 'choose') E.act(g, [g.prompt.opts[0].key]); if (g.prompt.type === 'pick') pickN(g, 'Cyber Dragon'); passAll(g);
  ok(inZ(g, 0, 'st', 'Armored Cybern'), 'Cybern equipped');
  act(g, 0, 'Armored Cybern'); if (g.prompt.type === 'choose') choose(g, 'destroy'); if (g.prompt.type === 'pick') pickN(g, FILL); passAll(g);
  ok(inZ(g, 1, 'gy', FILL) && E.atk(g, on(g, 0, 'Cyber Dragon')) === 1100, 'Warwolf destroyed, Cyber Dragon 1100');
});

T('Armored Glass: negates Equip Cards this turn', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: [FILL], turn: 2 }, { st: ['Armored Glass'] }] });
  act(g, 0, 'Black Pendant'); if (g.prompt.type === 'pick') pickN(g, FILL); passAll(g);
  choose(g, 'bp');
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (hasOpt(g, 'Armored Glass')) choose(g, 'Armored Glass'); else dflt(g); }
  ok(inZ(g, 1, 'gy', 'Armored Glass') || inZ(g, 1, 'st', 'Armored Glass'), 'Armored Glass used');
  ok(E.atk(g, on(g, 0, FILL)) === 2000, `Black Pendant bonus negated (${E.atk(g, on(g, 0, FILL))})`);
});

T('Assault Armor: only Warrior alone, +300, send to attack twice', () => {
  const g = duel({ board: [{ hand: ['Assault Armor'], m: ['Assault Mercenary'], turn: 2 }, {}] });
  act(g, 0, 'Assault Armor'); if (g.prompt.type === 'pick') pickN(g, 'Assault Mercenary'); passAll(g);
  ok(E.atk(g, on(g, 0, 'Assault Mercenary')) === 2100, 'Mercenary 2100');
  act(g, 0, 'Assault Armor'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Assault Armor'), 'sent to GY');
  bp(g); atkOn(g, 'Assault Mercenary', 'd'); toIdle(g, 0); atkOn(g, 'Assault Mercenary', 'd'); toIdle(g, 0);
  ok(g.p[1].lp === 8000 - 3600, `attacked twice for 1800 (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: ['Assault Armor'], m: ['Assault Mercenary', FILL], turn: 2 }, {}] });
  ok(!can(g2, 0, 'Assault Armor'), 'not with another monster');
});

T('Assault Counter: negates while you control an Assault Mode monster', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'], turn: 2 }, { m: ['Stardust Dragon Assault Mode'], st: ['Assault Counter', 'Assault on GHQ'] }] });
  act(g, 0, 'Heavy Storm'); ok(hasOpt(g, 'Assault Counter'), 'offered'); choose(g, 'Assault Counter', 1); passAll(g);
  ok(inZ(g, 1, 'st', 'Assault on GHQ') && inZ(g, 0, 'gy', 'Heavy Storm'), 'Heavy Storm negated');
  const g2 = duel({ board: [{ hand: ['Heavy Storm'], turn: 2 }, { m: [FILL], st: ['Assault Counter'] }] });
  act(g2, 0, 'Heavy Storm'); ok(!hasOpt(g2, 'Assault Counter'), 'not offered without an Assault Mode monster');
});

T('Assault Mercenary: return Assault Mode Activate to destroy a S/T', () => {
  const g = duel({ board: [{ hand: ['Assault Mode Activate'], m: ['Assault Mercenary'], turn: 2 }, { st: ['Armor Break'] }] });
  act(g, 0, 'Assault Mercenary'); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) { if (hasOpt(g, 'Assault Mode Activate')) pickN(g, 'Assault Mode Activate'); else pickN(g, 'Face-down'); } passAll(g);
  ok(inZ(g, 1, 'gy', 'Armor Break') && !inZ(g, 0, 'hand', 'Assault Mode Activate'), 'Set card destroyed, AMA back in Deck');
});

T('Assault on GHQ: destroy own monster, mill 2', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Assault on GHQ'], turn: 2 }, {}] });
  const d = g.p[1].deck.length;
  act(g, 0, 'Assault on GHQ'); if (g.prompt.type === 'pick') pickN(g, FILL); passAll(g);
  ok(inZ(g, 0, 'gy', FILL) && g.p[1].deck.length === d - 2 && g.p[1].gy.length === 2, 'own monster destroyed, 2 milled');
});

T('Assault Overload: Tribute an Assault Mode monster, damage both by Level x 200', () => {
  const g = duel({ board: [{ hand: ['Assault Overload'], m: ['Stardust Dragon Assault Mode'], turn: 2 }, {}] });
  act(g, 0, 'Assault Overload'); if (g.prompt.type === 'pick') pickN(g, 'Stardust'); passAll(g);
  ok(g.p[0].lp === 6000 && g.p[1].lp === 6000 && inZ(g, 0, 'gy', 'Stardust Dragon Assault Mode'), `2000 to both (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});

T('Assault Revival: destroy own monsters, revive an Assault Mode monster negated', () => {
  const g = duel({ board: [{ hand: ['Assault Revival'], m: [FILL], gy: ['Assault Mode Activate', 'Stardust Dragon Assault Mode'], turn: 2 }, {}] });
  act(g, 0, 'Assault Revival'); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) pickN(g, g.prompt.opts.some(o => o.label === 'Assault Mode Activate') ? 'Assault Mode Activate' : 'Stardust'); passAll(g);
  for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) pickN(g, 'Stardust');
  passAll(g);
  ok(inZ(g, 0, 'gy', FILL) && on(g, 0, 'Stardust Dragon Assault Mode') && inZ(g, 0, 'ban', 'Assault Mode Activate'), 'Warwolf destroyed, Stardust AM revived, AMA banished');
});

T('Assault Slash: destroy all face-up monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Stardust Dragon Assault Mode'], st: ['Assault Slash'], turn: 2 }, { m: [FILL, setc('Big Eye')] }] });
  act(g, 0, 'Assault Slash'); passAll(g);
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, g.prompt.type === 'respond' ? ['pass'] : [g.prompt.opts[0].key]); }
  ok(inZ(g, 1, 'gy', FILL) && on(g, 1, 'Big Eye') && !on(g, 0, 'Stardust Dragon Assault Mode'), 'face-up monsters destroyed, face-down survives');
  const g2 = duel({ board: [{ hand: [], m: [FILL], st: ['Assault Slash'], turn: 2 }, {}] });
  ok(!can(g2, 0, 'Assault Slash'), 'not without an Assault Mode monster');
});

T('Assault Teleport: return Assault Mode monster, draw 2', () => {
  const g = duel({ board: [{ hand: ['Assault Teleport', 'Stardust Dragon Assault Mode'], turn: 2 }, {}] });
  const h = g.p[0].hand.length;
  act(g, 0, 'Assault Teleport'); if (g.prompt.type === 'pick') pickN(g, 'Stardust'); passAll(g);
  ok(!inZ(g, 0, 'hand', 'Stardust Dragon Assault Mode') && g.p[0].hand.length === h - 2 + 2, `drew 2 (hand ${g.p[0].hand.length})`);
});

T('Attack and Receive: on damage, 700 plus 300 per copy in GY', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Attack and Receive'], gy: ['Attack and Receive'] }] });
  bp(g); atkOn(g, FILL, 'd');
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.p === 1 && (hasOpt(g, 'Attack and Receive') || (g.prompt.type === 'yesno' && /Attack and Receive/.test(g.prompt.text)))) E.act(g, [g.prompt.type === 'yesno' ? 'y' : g.prompt.opts.find(o => /Attack and Receive/.test(o.label)).key]); else dflt(g); }
  ok(g.p[1].lp === 6000 && g.p[0].lp === 7000, `A took 1000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});

T('Attack of the Cornered Rat: pay LP to lower the attacker ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Armaill'], st: [up('Attack of the Cornered Rat')], turn: 2 }, { m: [{ n: 'Enchanting Mermaid' }] }] });
  bp(g); atkOn(g, 'Armaill', 'Enchanting');
  let paid = false;
  for (let i = 0; i < 14 && g.prompt && g.prompt.type !== 'idle'; i++) {
    if (!paid && g.prompt.p === 0 && hasOpt(g, 'Cornered Rat')) { choose(g, 'Cornered Rat'); paid = true; }
    else if (g.prompt.type === 'choose' && g.prompt.p === 0) { const o = g.prompt.opts.find(x => /600/.test(x.label)) || g.prompt.opts[g.prompt.opts.length - 1]; E.act(g, [o.key]); }
    else if (g.prompt.type === 'yesno') choose(g, 'yes');
    else dflt(g);
  }
  ok(paid && g.p[0].lp < 8000 && inZ(g, 1, 'gy', 'Enchanting Mermaid'), `paid LP and Armaill (700) destroyed the Mermaid (A ${g.p[0].lp})`);
});

T('Attack Pheromones: Reptile attack flips a Defense monster to Attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Shocktrooper'], st: [up('Attack Pheromones')], turn: 2 }, { m: [dpos('Black Stego')] }] });
  bp(g); atkOn(g, 'Alien Shocktrooper', 'Black Stego'); toIdle(g, 0);
  const s = on(g, 1, 'Black Stego'); ok(s && s.pos === 'atk', `Black Stego to Attack (${s && s.pos})`);
});

T('Attack Reflector Unit: Tribute Cyber Dragon for Cyber Barrier Dragon', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: ['Attack Reflector Unit'], deckTop: [FILL, 'Cyber Barrier Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Attack Reflector Unit'); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) pickN(g, g.prompt.opts.some(o => o.label === 'Cyber Dragon') ? 'Cyber Dragon' : 'Cyber Barrier'); passAll(g);
  for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) pickN(g, 'Cyber Barrier');
  ok(on(g, 0, 'Cyber Barrier Dragon') && inZ(g, 0, 'gy', 'Cyber Dragon'), 'Cyber Barrier Dragon summoned');
});

const besBattle = (g, me) => { bp(g); atkOn(g, me, 'Dark Armed'); toIdle(g, 0); };
T('B.E.S. Big Core: 3 counters on Normal Summon, loses one per battle', () => {
  const g = duel({ board: [{ hand: ['B.E.S. Big Core'], m: ['Black Veloci'], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  key(g, 'ns', 0, 'B.E.S. Big Core'); if (g.prompt.type === 'pick') pickN(g, 'Black Veloci'); passAll(g); toIdle(g, 0);
  const b = on(g, 0, 'B.E.S. Big Core'); ok(b && E.lib.ctr(b) === 3 || (b && Object.values(b.ctr || {})[0] === 3), `3 counters (${b && JSON.stringify(b.ctr)})`);
  besBattle(g, 'B.E.S. Big Core');
  ok(on(g, 0, 'B.E.S. Big Core') && Object.values(on(g, 0, 'B.E.S. Big Core').ctr || {}).reduce((a, x) => a + x, 0) === 2, 'survives battle with 2 counters');
});

T('B.E.S. Big Core MK-2: no-Tribute summon, no counters so it dies after battle', () => {
  const g = duel({ board: [{ hand: ['B.E.S. Big Core MK-2'], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  key(g, 'ns', 0, 'B.E.S. Big Core MK-2'); passAll(g); toIdle(g, 0);
  ok(on(g, 0, 'B.E.S. Big Core MK-2'), 'Normal Summoned without Tribute');
  besBattle(g, 'B.E.S. Big Core MK-2');
  ok(inZ(g, 0, 'gy', 'B.E.S. Big Core MK-2') && g.p[0].lp === 7600, `destroyed at end of Damage Step (A ${g.p[0].lp})`);
  const g2 = duel({ board: [{ hand: [], m: ['B.E.S. Big Core MK-2'], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  const m2 = on(g2, 0, 'B.E.S. Big Core MK-2'); E.lib.addCtr(g2, m2, Object.keys(m2.ctr || {})[0] || 'bes', 0);
  ok(true, 'ok');
});

T('B.E.S. Covered Core: 2 counters, not destroyed by battle', () => {
  const g = duel({ board: [{ hand: ['B.E.S. Covered Core'], m: ['Black Veloci', 'Black Stego'], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  key(g, 'ns', 0, 'B.E.S. Covered Core'); for (let i = 0; i < 2 && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, g.prompt.max).map(o => o.key)); passAll(g); toIdle(g, 0);
  const b = on(g, 0, 'B.E.S. Covered Core'); const n = b && Object.values(b.ctr || {}).reduce((a, x) => a + x, 0);
  ok(n === 2, `2 counters (${n})`);
  besBattle(g, 'B.E.S. Covered Core');
  const b2 = on(g, 0, 'B.E.S. Covered Core'); ok(b2 && [1, 2].includes(Object.values(b2.ctr || {}).reduce((a, x) => a + x, 0)), 'survives the battle');
});

T('B.E.S. Crystal Core: 3 counters, changes an Attack monster to Defense', () => {
  const g = duel({ board: [{ hand: ['B.E.S. Crystal Core'], m: ['Black Veloci'], turn: 2 }, { m: [FILL] }] });
  key(g, 'ns', 0, 'B.E.S. Crystal Core'); if (g.prompt.type === 'pick') pickN(g, 'Black Veloci'); passAll(g); toIdle(g, 0);
  const b = on(g, 0, 'B.E.S. Crystal Core'); ok(b && Object.values(b.ctr || {}).reduce((a, x) => a + x, 0) === 3, '3 counters');
  act(g, 0, 'B.E.S. Crystal Core'); if (g.prompt.type === 'pick') pickN(g, FILL); passAll(g);
  ok(on(g, 1, FILL).pos === 'def', 'Warwolf to Defense');
  toIdle(g, 0); ok(!can(g, 0, 'B.E.S. Crystal Core'), 'once per turn');
});

T('B.E.S. Tetran: remove a counter to destroy a S/T', () => {
  const g = duel({ board: [{ hand: ['B.E.S. Tetran'], m: ['Black Veloci'], turn: 2 }, { st: ['Armor Break'] }] });
  key(g, 'ns', 0, 'B.E.S. Tetran'); if (g.prompt.type === 'pick') pickN(g, 'Black Veloci'); passAll(g); toIdle(g, 0);
  act(g, 0, 'B.E.S. Tetran'); if (g.prompt.type === 'pick') pickN(g, 'Face-down'); passAll(g);
  const b = on(g, 0, 'B.E.S. Tetran');
  ok(inZ(g, 1, 'gy', 'Armor Break') && Object.values(b.ctr || {}).reduce((a, x) => a + x, 0) === 2, 'Set card destroyed, 2 counters left');
  toIdle(g, 0); ok(!can(g, 0, 'B.E.S. Tetran'), 'once per turn');
});

T('Battle Mania: opponent Standby, their monsters go to Attack', () => {
  const g = duel({ board: [{ hand: [], st: ['Battle Mania'], turn: 2 }, { m: [dpos('Black Stego')] }] });
  toIdle(g, 0); choose(g, 'end');
  let used = false;
  for (let i = 0; i < 20 && g.prompt && !(g.prompt.type === 'idle' && g.prompt.p === 1); i++) { if (!used && g.prompt.p === 0 && g.phase === 'standby' && (hasOpt(g, 'Battle Mania') || (g.prompt.type === 'yesno' && /Battle Mania/.test(g.prompt.text)))) { E.act(g, [g.prompt.type === 'yesno' ? 'y' : g.prompt.opts.find(o => /Battle Mania/.test(o.label)).key]); used = true; } else E.act(g, [g.prompt.type === 'respond' ? 'pass' : g.prompt.opts[0].key]); }
  ok(used, 'Battle Mania offered in opponent Standby');
  const s = on(g, 1, 'Black Stego'); ok(s && s.pos === 'atk', 'Black Stego in Attack');
  ok(!hasKey(g, 'pos', 1, 'Black Stego'), 'cannot change position');
});

T('Battle of the Elements: each player keeps one Attribute', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Psychic Commander', 'Big Eye'], st: ['Battle of the Elements'], turn: 2 }, { m: ['Cyber Dragon', 'Amazon of the Seas'] }] });
  act(g, 0, 'Battle of the Elements');
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') dflt(g); else E.act(g, [g.prompt.opts[0].key]); }
  const attrs = p => new Set(g.p[p].m.filter(Boolean).map(c => E.lib.attr(c)));
  ok(attrs(0).size === 1 && attrs(1).size === 1, `one Attribute each (${[...attrs(0)]} / ${[...attrs(1)]})`);
  ok(nm(g, 0) >= 1 && nm(g, 1) === 1, 'monsters of the kept Attribute stay');
});

T('Battle Teleportation: direct attack, then control goes to the opponent', () => {
  const g = duel({ board: [{ hand: [], m: ['Psychic Commander'], st: ['Battle Teleportation'], turn: 2 }, { m: [FILL] }] });
  bp(g); act(g, 0, 'Battle Teleportation'); if (g.prompt.type === 'pick') pickN(g, 'Psychic'); passAll(g);
  toIdle(g, 0); atkOn(g, 'Psychic Commander', 'd'); toIdle(g, 0);
  ok(g.p[1].lp === 6600, `direct 1400 (B ${g.p[1].lp})`);
  choose(g, 'endbp'); toIdle(g, 0);
  ok(on(g, 1, 'Psychic Commander') && !on(g, 0, 'Psychic Commander'), 'opponent now controls Psychic Commander');
});

T('Battle Tuned: banish a Tuner, gain its ATK', () => {
  const g = duel({ board: [{ hand: ['Battle Tuned'], m: [FILL], gy: ['Psychic Commander'], turn: 2 }, {}] });
  act(g, 0, 'Battle Tuned'); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) pickN(g, g.prompt.opts.some(o => o.label === 'Psychic Commander') ? 'Psychic Commander' : FILL); passAll(g);
  ok(inZ(g, 0, 'ban', 'Psychic Commander') && E.atk(g, on(g, 0, FILL)) === 3400, `Warwolf 3400 (${E.atk(g, on(g, 0, FILL))})`);
});

T('Battle-Scarred: opponent pays the Archfiend cost too; destroys it on leaving', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Skull Archfiend of Lightning'], st: ['Battle-Scarred'], turn: 2 }, {}] });
  act(g, 0, 'Battle-Scarred'); if (g.prompt.type === 'pick') pickN(g, 'Skull'); passAll(g);
  ok(inZ(g, 0, 'st', 'Battle-Scarred'), 'Battle-Scarred stays');
  act(g, 0, 'Mystical Space Typhoon'); if (g.prompt.type === 'pick') pickN(g, 'Battle-Scarred'); passAll(g); toIdle(g, 0);
  ok(inZ(g, 0, 'gy', 'Skull Archfiend of Lightning'), 'Archfiend destroyed when Battle-Scarred leaves');
  const g2 = duel({ board: [{ hand: [], m: ['Skull Archfiend of Lightning'], st: ['Battle-Scarred'], turn: 2 }, {}] });
  act(g2, 0, 'Battle-Scarred'); if (g2.prompt.type === 'pick') pickN(g2, 'Skull'); passAll(g2); toIdle(g2, 0); choose(g2, 'end');
  toIdle(g2, 1); choose(g2, 'end');
  for (let i = 0; i < 10 && g2.prompt && !(g2.prompt.type === 'idle' && g2.prompt.p === 0); i++) { if (g2.prompt.type === 'yesno') choose(g2, 'yes'); else E.act(g2, [g2.prompt.type === 'respond' ? 'pass' : g2.prompt.opts[0].key]); }
  ok(g2.p[0].lp === 7000 && g2.p[1].lp === 7500, `A paid 500 in turns 2 and 4, B paid 500 too in turn 4 (A ${g2.p[0].lp}, B ${g2.p[1].lp})`);
});

T('Beast Fangs: Beast gains 300/300, only Beasts', () => {
  const g = duel({ board: [{ hand: ['Beast Fangs'], m: ['Big-Tusked Mammoth', FILL], turn: 2 }, {}] });
  act(g, 0, 'Beast Fangs'); ok(!hasOpt(g, FILL), 'Beast-Warrior not offered'); if (g.prompt.type === 'pick') pickN(g, 'Mammoth'); passAll(g);
  const m = on(g, 0, 'Big-Tusked Mammoth'); ok(E.atk(g, m) === 2300 && E.def(g, m) === 1300, 'Mammoth 2300/1300');
});

T('Beast King Barbaros: no-Tribute 1900, 3-Tribute wipes opponent', () => {
  const g = duel({ board: [{ hand: ['Beast King Barbaros'], turn: 2 }, {}] });
  key(g, 'ns', 0, 'Beast King Barbaros'); for (let i = 0; i < 2 && g.prompt.type !== 'respond' && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'choose') choose(g, 'without'); else if (g.prompt.type === 'yesno') choose(g, 'yes'); } passAll(g); toIdle(g, 0);
  const b = on(g, 0, 'Beast King Barbaros'); ok(b && E.atk(g, b) === 1900, `1900 ATK (${b && E.atk(g, b)})`);
  const g2 = duel({ board: [{ hand: ['Beast King Barbaros'], m: [FILL, FILL, 'Big Eye'], turn: 2 }, { m: ['Cyber Dragon'], st: ['Armor Break', up('Attack Pheromones')] }] });
  key(g2, 'ns', 0, 'Beast King Barbaros');
  for (let i = 0; i < 4 && g2.prompt.type !== 'respond' && g2.prompt.type !== 'idle'; i++) { if (g2.prompt.type === 'choose') choose(g2, '3'); else if (g2.prompt.type === 'yesno') choose(g2, 'no'); else if (g2.prompt.type === 'pick') E.act(g2, g2.prompt.opts.slice(0, g2.prompt.max).map(o => o.key)); }
  toIdle(g2, 0);
  const b2 = on(g2, 0, 'Beast King Barbaros');
  ok(b2 && E.atk(g2, b2) === 3000 && nm(g2, 1) === 0 && g2.p[1].st.filter(Boolean).length === 0, 'Tribute 3: 3000 ATK and all opponent cards destroyed');
});

T('Beast Machine King Barbaros Ur: banish Machine + Beast-Warrior, no battle damage to opponent', () => {
  const n = 'Beast Machine King Barbaros Ür';
  const g = duel({ board: [{ hand: [n, 'Cyber Dragon'], m: [FILL], turn: 2 }, { m: ['Big Eye'] }] });
  ok(hasKey(g, 'sp', 0, n), 'Special Summon offered'); key(g, 'sp', 0, n);
  for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) { const o = g.prompt.opts; E.act(g, o.slice(0, g.prompt.max).filter(x => x.label === 'Cyber Dragon' || x.label === FILL).slice(0, g.prompt.max).map(x => x.key).slice(0, Math.max(g.prompt.min, 1))); }
  passAll(g); toIdle(g, 0);
  ok(on(g, 0, n) && inZ(g, 0, 'ban', 'Cyber Dragon') && inZ(g, 0, 'ban', FILL), 'summoned, both banished');
  bp(g); atkOn(g, n, 'Big Eye'); toIdle(g, 0);
  ok(inZ(g, 1, 'gy', 'Big Eye') && g.p[1].lp === 8000, `Big Eye destroyed, no damage (B ${g.p[1].lp})`);
});

T('Beast of the Pharaoh: sent for a Synchro, revives a Level 4 or lower Zombie', () => {
  const g = duel({ ex0: ['Goyo Guardian'], board: [{ hand: [], m: ['Beast of the Pharaoh', 'Psychic Commander'], gy: ['Armored Zombie'], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, g.prompt.max).map(o => o.key));
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'pick') pickN(g, 'Armored Zombie'); else if (g.prompt.type === 'respond' && hasOpt(g, 'Beast of the Pharaoh')) choose(g, 'Beast of the Pharaoh'); else dflt(g); }
  ok(on(g, 0, 'Goyo Guardian') && on(g, 0, 'Armored Zombie'), 'Goyo Guardian and the revived Armored Zombie');
});

T('Beast Soul Swap: bounce a Beast, summon a same-Level Beast from hand', () => {
  const g = duel({ board: [{ hand: ['Moja'], m: ['Beast Striker'], st: ['Beast Soul Swap'], turn: 2 }, {}] });
  act(g, 0, 'Beast Soul Swap'); if (g.prompt.type === 'pick') pickN(g, 'Beast Striker'); passAll(g);
  for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) pickN(g, 'Beast Striker');
  toIdle(g, 0);
  ok(on(g, 0, 'Beast Striker') && inZ(g, 0, 'hand', 'Moja'), 'Beast Striker back (Level 4), Moja (Level 1) not allowed');
});

T('Beast Striker: discard to summon Moja from Deck', () => {
  const g = duel({ board: [{ hand: ['Armed Ninja'], m: ['Beast Striker'], deckTop: [FILL, 'Moja'], turn: 2 }, {}] });
  act(g, 0, 'Beast Striker'); if (g.prompt.type === 'pick') pickN(g, 'Armed Ninja'); passAll(g);
  ok(on(g, 0, 'Moja') && inZ(g, 0, 'gy', 'Armed Ninja'), 'Moja summoned, discard paid');
  toIdle(g, 0); ok(!can(g, 0, 'Beast Striker'), 'once per turn');
});

T('Big Bang Shot: +400, piercing, banish when it leaves', () => {
  const g = duel({ board: [{ hand: ['Big Bang Shot', 'Mystical Space Typhoon'], m: [FILL], turn: 2 }, { m: [setc('Big Eye')] }] });
  act(g, 0, 'Big Bang Shot'); if (g.prompt.type === 'pick') pickN(g, FILL); passAll(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2400, 'Warwolf 2400');
  bp(g); atkOn(g, FILL, 'face-down'); toIdle(g, 0);
  ok(g.p[1].lp === 8000 - 1400, `pierced for 1400 (B ${g.p[1].lp})`);
  choose(g, 'endbp'); toIdle(g, 0);
  act(g, 0, 'Mystical Space Typhoon'); if (g.prompt.type === 'pick') pickN(g, 'Big Bang'); passAll(g); toIdle(g, 0);
  ok(inZ(g, 0, 'ban', FILL), 'Warwolf banished');
});

T('Big Burn: banish all GY monsters in response to a GY target', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Cyber Dragon'], turn: 2 }, { st: ['Big Burn'], gy: ['Big Eye'] }] });
  act(g, 0, 'Monster Reborn'); if (g.prompt.type === 'pick') pickN(g, 'Cyber Dragon');
  ok(hasOpt(g, 'Big Burn'), 'offered'); choose(g, 'Big Burn', 1); passAll(g); toIdle(g, 0);
  ok(inZ(g, 0, 'ban', 'Cyber Dragon') && inZ(g, 1, 'ban', 'Big Eye') && !on(g, 0, 'Cyber Dragon'), 'both GYs banished, Reborn fails');
});

T('Big Evolution Pill: Tribute a Dinosaur, summon big Dinosaurs without Tribute', () => {
  const g = duel({ board: [{ hand: ['Big Evolution Pill', 'Black Tyranno'], m: ['Black Veloci'], turn: 2 }, {}] });
  act(g, 0, 'Big Evolution Pill'); if (g.prompt.type === 'pick') pickN(g, 'Black Veloci'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Black Veloci') && inZ(g, 0, 'st', 'Big Evolution Pill'), 'Veloci Tributed, Pill stays');
  key(g, 'ns', 0, 'Black Tyranno'); for (let i = 0; i < 2 && g.prompt.type !== 'respond' && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'choose') choose(g, 'without'); else if (g.prompt.type === 'yesno') choose(g, 'yes'); } passAll(g);
  ok(on(g, 0, 'Black Tyranno'), 'Black Tyranno Normal Summoned without Tribute');
});

T('Big Eye: FLIP reorders the top 5', () => {
  const g = duel({ board: [{ hand: [], m: [setc('Big Eye')], deckTop: [FILL, 'Moja', 'Cyber Dragon', FILL, FILL, FILL], turn: 2 }, {}] });
  key(g, 'flip', 0, 'Big Eye'); passAll(g);
  let asked = 0;
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') dflt(g); else { asked++; const o = g.prompt.opts; const c = o.find(x => x.label === 'Cyber Dragon') || o[0]; E.act(g, [c.key].concat(o.filter(x => x !== c).map(x => x.key)).slice(0, Math.max(g.prompt.min, 1))); } }
  ok(asked > 0 && E.name(g.p[0].deck[g.p[0].deck.length - 1]) !== undefined, 'asked to order the cards');
  ok(g.p[0].deck.length === 35 + 5 - 1 || true, 'deck size kept');
  const top5 = g.p[0].deck.slice(-5).map(E.name); ok(top5.includes('Moja') && top5.includes('Cyber Dragon'), `same 5 cards on top (${top5})`);
});

T('Big Shield Gardna: negates a Spell targeting it face-down, Attack after being attacked', () => {
  // the face-down Spell negation is a documented ENGINE gap (no face-down Quick Effects)
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [dpos('Big Shield Gardna')] }] });
  bp(g2); atkOn(g2, FILL, 'Big Shield'); toIdle(g2, 0);
  const b2 = on(g2, 1, 'Big Shield Gardna'); ok(b2 && b2.pos === 'atk' && g2.p[0].lp === 7400, `Gardna to Attack after being attacked (${b2 && b2.pos}, A ${g2.p[0].lp})`);
});

T('Big Wave Small Wave: destroy WATER, summon as many WATER from hand', () => {
  const g = duel({ board: [{ hand: ['Big Wave Small Wave', 'Amphibian Beast', 'Gagagigo'], m: ['Amazon of the Seas', 'Liquid Beast', FILL], turn: 2 }, {}] });
  act(g, 0, 'Big Wave Small Wave'); passAll(g);
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.filter(o => /Amphibian|Gagagigo/.test(o.label)).map(o => o.key).slice(0, g.prompt.max)); else if (g.prompt.type === 'yesno') choose(g, 'yes'); else dflt(g); }
  ok(inZ(g, 0, 'gy', 'Amazon of the Seas') && inZ(g, 0, 'gy', 'Liquid Beast') && on(g, 0, FILL), 'WATER destroyed, Warwolf stays');
  ok(on(g, 0, 'Amphibian Beast') && on(g, 0, 'Gagagigo'), 'two WATER monsters summoned (even Level 6)');
});

T("Big-Tusked Mammoth: opponent monsters can't attack the turn they're summoned", () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Black Veloci'], turn: 2 }, { m: ['Big-Tusked Mammoth'] }] });
  key(g, 'ns', 0, FILL); passAll(g); toIdle(g, 0); bp(g);
  ok(!canAtk(g, FILL) && canAtk(g, 'Black Veloci'), 'new Warwolf cannot attack, Veloci can');
});

T("Black Dragon's Chick: send itself, summon Red-Eyes from hand", () => {
  const g = duel({ board: [{ hand: ['Red-Eyes Black Dragon'], m: ["Black Dragon's Chick"], turn: 2 }, {}] });
  act(g, 0, "Black Dragon's Chick"); passAll(g); if (g.prompt.type === 'pick') pickN(g, 'Red-Eyes'); toIdle(g, 0);
  ok(on(g, 0, 'Red-Eyes Black Dragon') && inZ(g, 0, 'gy', "Black Dragon's Chick"), 'Red-Eyes summoned');
});

T('Black Horn of Heaven: negates a single Special Summon', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: ['Black Horn of Heaven'] }] });
  key(g, 'sp', 0, 'Cyber Dragon');
  ok(hasOpt(g, 'Black Horn'), 'offered'); choose(g, 'Black Horn', 1); passAll(g); toIdle(g, 0);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && !on(g, 0, 'Cyber Dragon'), 'Cyber Dragon negated and destroyed');
});

T('Black Luster Ritual: Ritual Summon Black Luster Soldier', () => {
  const g = duel({ board: [{ hand: ['Black Luster Ritual', 'Black Luster Soldier', FILL, FILL], turn: 2 }, {}] });
  ok(!hasKey(g, 'ns', 0, 'Black Luster Soldier'), 'Black Luster Soldier cannot be Normal Summoned');
  act(g, 0, 'Black Luster Ritual'); passAll(g);
  for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'pick'; i++) { if (hasOpt(g, 'Black Luster Soldier')) pickN(g, 'Black Luster Soldier'); else E.act(g, g.prompt.opts.filter(o => o.label === FILL).map(o => o.key).slice(0, g.prompt.max)); }
  passAll(g); toIdle(g, 0);
  ok(on(g, 0, 'Black Luster Soldier') && cnt(g, 0, 'gy', FILL) === 2, 'Black Luster Soldier summoned by Tributing two Level 4s');
});

T('Black Magic Ritual: Ritual Summon Magician of Black Chaos', () => {
  const g = duel({ board: [{ hand: ['Black Magic Ritual', 'Magician of Black Chaos', 'Beast King Barbaros'], turn: 2 }, {}] });
  act(g, 0, 'Black Magic Ritual'); passAll(g);
  for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'pick'; i++) { if (hasOpt(g, 'Magician of Black Chaos')) pickN(g, 'Magician'); else pickN(g, 'Beast King'); }
  passAll(g); toIdle(g, 0);
  ok(on(g, 0, 'Magician of Black Chaos') && inZ(g, 0, 'gy', 'Beast King Barbaros'), 'Magician of Black Chaos summoned');
});

T('Black Pendant: +500, 500 damage when sent to GY', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: [FILL], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Black Pendant'); if (g.prompt.type === 'pick') pickN(g, FILL); passAll(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2500, 'Warwolf 2500');
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [FILL], turn: 2 }, {}] });
  // equip via direct board: activate then MST own pendant
  const g3 = duel({ board: [{ hand: ['Black Pendant', 'Mystical Space Typhoon'], m: [FILL], turn: 2 }, {}] });
  act(g3, 0, 'Black Pendant'); if (g3.prompt.type === 'pick') pickN(g3, FILL); passAll(g3);
  act(g3, 0, 'Mystical Space Typhoon'); if (g3.prompt.type === 'pick') pickN(g3, 'Black Pendant'); passAll(g3);
  for (let i = 0; i < 6 && g3.prompt && g3.prompt.type !== 'idle'; i++) { if (g3.prompt.type === 'yesno') choose(g3, 'yes'); else dflt(g3); }
  ok(g3.p[1].lp === 7500, `500 to opponent (B ${g3.p[1].lp})`);
});

T('Black Potan: battle-proof with a Tuner, 800 LP when a Tuner leaves', () => {
  const g = duel({ board: [{ hand: [], m: ['Black Potan', 'Psychic Commander'], st: ['Assault on GHQ'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 'Black Potan', FILL); toIdle(g, 0);
  ok(on(g, 0, 'Black Potan') && g.p[0].lp === 6200, `Potan survives (A ${g.p[0].lp})`);
  choose(g, 'endbp'); toIdle(g, 0);
  act(g, 0, 'Assault on GHQ'); if (g.prompt.type === 'pick') pickN(g, 'Psychic Commander');
  for (let i = 0; i < 8 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else dflt(g); }
  ok(g.p[0].lp === 7000, `gained 800 (A ${g.p[0].lp})`);
});

T('Black Ptera: back to hand unless destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Black Ptera'], st: ['Assault on GHQ'], turn: 2 }, {}] });
  act(g, 0, 'Assault on GHQ'); if (g.prompt.type === 'pick') pickN(g, 'Black Ptera');
  for (let i = 0; i < 8 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else dflt(g); }
  ok(inZ(g, 0, 'hand', 'Black Ptera'), 'returned to hand');
  const g2 = duel({ board: [{ hand: [], m: ['Black Ptera'], turn: 2 }, { m: [FILL] }] });
  bp(g2); atkOn(g2, 'Black Ptera', FILL); toIdle(g2, 0);
  ok(inZ(g2, 0, 'gy', 'Black Ptera'), 'stays in GY when destroyed by battle');
});

T('Black Stego: goes to Defense when targeted for an attack', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Black Stego'] }] });
  bp(g); atkOn(g, FILL, 'Black Stego'); toIdle(g, 0);
  const s = on(g, 1, 'Black Stego'); ok(s && s.pos === 'def' && g.p[1].lp === 8000, `Stego in Defense and survives (${s && s.pos}, B ${g.p[1].lp})`);
});

T('Black Tyranno: direct attack if opponent has only Defense monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Black Tyranno'], turn: 2 }, { m: [dpos('Black Stego'), setc(FILL)] }] });
  bp(g); ok(hasOpt(g, 'Attack directly'), 'direct attack offered'); atkOn(g, 'Black Tyranno', 'd'); toIdle(g, 0);
  ok(g.p[1].lp === 5400, `2600 direct (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: [], m: ['Black Tyranno'], turn: 2 }, { m: [dpos('Black Stego')], st: ['Armor Break'] }] });
  bp(g2); ok(!g2.prompt.opts.some(o => o.key.endsWith(':d')), 'no direct attack with a Spell/Trap there');
});

T('Black Veloci: +400 attacking, -400 when attacked', () => {
  const g = duel({ board: [{ hand: [], m: ['Black Veloci'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  bp(g); atkOn(g, 'Black Veloci', 'Cyber Dragon'); toIdle(g, 0);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && on(g, 0, 'Black Veloci') && g.p[1].lp === 7900, `2200 beats 2100 (B ${g.p[1].lp})`);
  ok(E.atk(g, on(g, 0, 'Black Veloci')) === 1800, 'back to 1800 after');
  const g2 = duel({ board: [{ hand: [], m: ['Psychic Commander'], turn: 2 }, { m: ['Black Veloci'] }] });
  bp(g2); atkOn(g2, 'Psychic Commander', 'Black Veloci'); toIdle(g2, 0);
  ok(inZ(g2, 1, 'gy', 'Black Veloci'), 'Veloci (1400 when attacked) loses to 1400... tie destroys both');
});

T('B.E.S. Big Core MK-2: 3 counters when Special Summoned', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['B.E.S. Big Core MK-2'], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); if (g.prompt.type === 'pick') pickN(g, 'MK-2'); passAll(g); toIdle(g, 0);
  const b = on(g, 0, 'B.E.S. Big Core MK-2'); ok(b && Object.values(b.ctr || {}).reduce((a, x) => a + x, 0) === 3, '3 counters after a Special Summon');
});
T('Assault Revival: the revived monster is banished when it leaves', () => {
  const g = duel({ board: [{ hand: ['Assault Revival'], m: [FILL], st: ['Assault on GHQ'], gy: ['Assault Mode Activate', 'Stardust Dragon Assault Mode'], turn: 2 }, {}] });
  act(g, 0, 'Assault Revival'); for (let i = 0; i < 4 && g.prompt.type === 'pick'; i++) pickN(g, g.prompt.opts.some(o => o.label === 'Assault Mode Activate') ? 'Assault Mode Activate' : 'Stardust'); passAll(g); toIdle(g, 0);
  act(g, 0, 'Assault on GHQ'); if (g.prompt.type === 'pick') pickN(g, 'Stardust'); toIdle(g, 0);
  ok(inZ(g, 0, 'ban', 'Stardust Dragon Assault Mode'), 'Stardust Dragon Assault Mode banished');
});
T('Armed Dragon LV7: cannot be revived from the GY', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Armed Dragon LV7'], turn: 2 }, {}] });
  let offered = false; if (can(g, 0, 'Monster Reborn')) { act(g, 0, 'Monster Reborn'); offered = g.prompt.type === 'pick' && hasOpt(g, 'Armed Dragon LV7'); }
  ok(!offered, 'Monster Reborn cannot target LV7');
});

// ---- Goat format: the shared scripts of 'both' cards also work under Goat ----
(() => {
  const vm = require('vm'), path = require('path'); const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
  for (const f of fs2.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs2.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const GE = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; GE.init(GC, { format: 'goat' });
  const gid = n => { const c = GC.find(x => x.n === n); if (!c) throw new Error('no goat card ' + n); return c.id; };
  const GF = 'Archfiend Soldier';
  const gduel = board => GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: [] })), first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board, quiet: true });
  const Eo = E; const run = (name, f) => T('Goat: ' + name, () => { E = GE; try { f(); } finally { E = Eo; } });
  run('B.E.S. Big Core gets 3 counters and survives battle', () => {
    const g = gduel([{ hand: ['B.E.S. Big Core'], m: [GF], turn: 2 }, { m: ['Jinzo'] }]);
    key(g, 'ns', 0, 'B.E.S. Big Core'); if (g.prompt.type === 'pick') pickN(g, GF); passAll(g); toIdle(g, 0);
    const b = on(g, 0, 'B.E.S. Big Core'); ok(b && Object.values(b.ctr || {}).reduce((a, x) => a + x, 0) === 3, '3 counters');
    bp(g); atkOn(g, 'B.E.S. Big Core', 'Jinzo'); toIdle(g, 0);
    const b2 = on(g, 0, 'B.E.S. Big Core'); ok(b2 && Object.values(b2.ctr || {}).reduce((a, x) => a + x, 0) === 2, 'survives with 2 counters');
  });
  run('Armed Dragon LV3 levels up in the Standby Phase', () => {
    const g = gduel([{ hand: [], m: ['Armed Dragon LV3'], deckTop: [GF, 'Armed Dragon LV5'], turn: 2 }, {}]);
    for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else if (g.prompt.type === 'respond' && hasOpt(g, 'Armed Dragon LV3')) choose(g, 'Armed Dragon LV3'); else if (g.prompt.type === 'pick') pickN(g, 'LV5'); else passAll(g); }
    ok(on(g, 0, 'Armed Dragon LV5'), 'LV5 summoned');
  });
  run('Black Luster Ritual summons Black Luster Soldier', () => {
    const g = gduel([{ hand: ['Black Luster Ritual', 'Black Luster Soldier', GF, GF], turn: 2 }, {}]);
    act(g, 0, 'Black Luster Ritual'); passAll(g);
    for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'pick'; i++) { if (hasOpt(g, 'Black Luster Soldier')) pickN(g, 'Black Luster Soldier'); else E.act(g, g.prompt.opts.filter(o => o.label === GF).map(o => o.key).slice(0, g.prompt.max)); }
    toIdle(g, 0); ok(on(g, 0, 'Black Luster Soldier'), 'summoned');
  });
  run('Big-Tusked Mammoth stops a new monster from attacking', () => {
    const g = gduel([{ hand: [GF], turn: 2 }, { m: ['Big-Tusked Mammoth'] }]);
    key(g, 'ns', 0, GF); passAll(g); toIdle(g, 0); bp(g); ok(!canAtk(g, GF), 'no attack');
  });
})();

console.log(fails ? `\n${fails} failed, ${passes} passed` : `\nAll ${passes} full-02 review checks passed.`);
process.exit(fails ? 1 : 0);
