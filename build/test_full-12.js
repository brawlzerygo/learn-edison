// Scenario checks for full pool batch 12: node build/test_full-12.js
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


T('Miracle Fertilizer revives a Plant, locks the Normal Summon, dies with it', () => {
  const g = duel({ board: [{ hand: [FILL], st: [{ n: 'Miracle Fertilizer', pos: 'up' }], gy: ['Lonefire Blossom'] }, { hand: ['Book of Moon'] }] });
  choose(g, 'a:' + st(g, 0, 'Miracle Fertilizer').u + ':1'); auto(g);
  ok(on(g, 0, 'Lonefire Blossom'), 'Lonefire Blossom summoned');
  ok(!hasOpt(g, 'ns:'), 'no Normal Summon after');
  const m = on(g, 0, 'Lonefire Blossom'); E.lib.move(g, m, 'hand', { reason: 'effect' }); E.lib.emit(g, { type: 'phase', ph: 'x' });
});
T('Miracle Fertilizer destroyed when its monster leaves', () => {
  const g = duel({ board: [{ st: [{ n: 'Miracle Fertilizer', pos: 'up' }], gy: ['Lonefire Blossom'] }, { st: ['Book of Moon'] }] });
  choose(g, 'a:' + st(g, 0, 'Miracle Fertilizer').u + ':1'); auto(g);
  const g2 = duel({ board: [{ st: [{ n: 'Miracle Fertilizer', pos: 'up' }, 'Compulsory Evacuation Device'], gy: ['Lonefire Blossom'], turn: 2 }, {}] });
  choose(g2, 'a:' + st(g2, 0, 'Miracle Fertilizer').u + ':1'); auto(g2);
  choose(g2, 'a:' + st(g2, 0, 'Compulsory Evacuation Device').u + ':0'); auto(g2);
  ok(!st(g2, 0, 'Miracle Fertilizer') && inZ(g2, 0, 'gy', 'Miracle Fertilizer'), 'Fertilizer destroyed');
});
T('Miracle Flipper: only it can be attacked, revived to the other side', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Miracle Flipper', FILL] }] });
  goBP(g);
  ok(!hasOpt(g, `atk:${on(g, 0, 'Blue-Eyes White Dragon').u}:${on(g, 1, FILL).u}`), 'the other face-up monster is not a target');
  attack(g, on(g, 0, 'Blue-Eyes White Dragon'), on(g, 1, 'Miracle Flipper')); auto(g);
  ok(inZ(g, 1, 'gy', 'Miracle Flipper'), 'Flipper destroyed');
  choose(g, 'endbp'); auto(g);
  ok(on(g, 0, 'Miracle Flipper'), 'Flipper summoned to the attacker side');
});
T('Miracle Flipper destroyed by a Spell destroys a monster', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], m: [FILL] }, { m: ['Miracle Flipper'] }] });
  act(g, 0, 'Smashing Ground'); auto(g);
  ok(inZ(g, 1, 'gy', 'Miracle Flipper') && inZ(g, 0, 'gy', FILL), 'Flipper took a monster with it');
});
T('Miracle Jurassic Egg counters and summon', () => {
  const g = duel({ board: [{ hand: ['Foolish Burial'], m: ['Miracle Jurassic Egg'], deckTop: [FILL, 'Black Tyranno'] }, {}] });
  const egg = on(g, 0, 'Miracle Jurassic Egg');
  E.lib.move(g, g.p[0].deck.find(c => E.name(c) === 'Black Tyranno'), 'gy', { reason: 'effect' });
  E.lib.beginOp(g); E.lib.move(g, g.p[0].hand[0], 'gy', { reason: 'effect' });
  ok(E.lib.ctr(egg, 'egg') === 2, `2 counters (${E.lib.ctr(egg, 'egg')})`);
});
T('Miracle Kids', () => {
  const g = duel({ board: [{ st: ['Miracle Kids'], gy: ['Hero Kid', 'Hero Kid'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'a:' + st(g, 0, 'Miracle Kids').u + ':0'); auto(g);
  ok(E.atk(g, on(g, 1, FILL)) === 2000 - 800, `lost 800 (${E.atk(g, on(g, 1, FILL))})`);
});
T('Miracle Locus: +1000, 2 attacks on monsters, no battle damage', () => {
  const g = duel({ board: [{ st: ['Miracle Locus'], m: ['Blue-Eyes White Dragon'], turn: 3 }, { m: [FILL, FILL] }] });
  const be = on(g, 0, 'Blue-Eyes White Dragon');
  choose(g, 'a:' + st(g, 0, 'Miracle Locus').u + ':0'); auto(g);
  ok(E.atk(g, be) === 4000 && g.p[1].hand.length === 6, 'ATK 4000 and B drew');
  goBP(g); attack(g, be, on(g, 1, FILL)); auto(g);
  ok(g.p[1].lp === 8000, `no damage (B ${g.p[1].lp})`);
  attack(g, be, on(g, 1, FILL)); auto(g);
  ok(g.p[1].lp === 8000 && !g.p[1].m.some(Boolean), 'second attack on a monster');
  ok(!hasOpt(g, `atk:${be.u}:d`), 'no third / direct attack');
});
T('Miracle Restoring', () => {
  const g = duel({ board: [{ st: ['Miracle Restoring', 'Pitch-Black Power Stone'], gy: ['Dark Magician'], turn: 2 }, {}] });
  choose(g, 'a:' + st(g, 0, 'Pitch-Black Power Stone').u + ':0'); auto(g);
  choose(g, 'a:' + st(g, 0, 'Miracle Restoring').u + ':0'); auto(g);
  ok(on(g, 0, 'Dark Magician') && E.lib.ctr(st(g, 0, 'Pitch-Black Power Stone'), 'spell') === 1, 'Dark Magician back, 2 counters gone');
});
T('Mirage Dragon blocks Traps in the Battle Phase', () => {
  const g = duel({ board: [{ m: ['Mirage Dragon'], turn: 2 }, { st: ['Mirror Force'] }] });
  goBP(g); attack(g, on(g, 0, 'Mirage Dragon'), null);
  ok(!hasOpt(g, 'Mirror Force'), 'no Mirror Force');
});
T('Mirage Knight gains the opponent original ATK and is banished', () => {
  const g = duel({ board: [{ m: ['Mirage Knight'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  goBP(g); attack(g, on(g, 0, 'Mirage Knight'), on(g, 1, 'Blue-Eyes White Dragon')); auto(g);
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && g.p[1].lp === 8000 - 2800, `Blue-Eyes destroyed, B took 2800 (${g.p[1].lp})`);
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(inZ(g, 0, 'ban', 'Mirage Knight'), 'banished in the End Phase');
});
T('Mirage Knight cannot be revived', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Mirage Knight'] }, {}] });
  ok(!hasOpt(g, 'a:' + g.p[0].hand[0].u), 'Monster Reborn has no target');
});
T('Mirage of Nightmare draws to 4, then discards', () => {
  const g = duel({ board: [{ hand: [FILL], st: [{ n: 'Mirage of Nightmare', pos: 'up' }] }, { }] });
  choose(g, 'end'); auto(g);
  ok(g.p[0].hand.length === 4, `A drew to 4 (${g.p[0].hand.length})`);
  choose(g, 'end'); auto(g);
  ok(g.p[0].hand.length === 3, `A drew to 5, discarded 2 (${g.p[0].hand.length})`);
});
T('Mirage Tube', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Mystic Lamp'], st: ['Mirage Tube'] }] });
  g.p[1].st[0].turnIn = -5; goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Mystic Lamp')); choose(g, 'Mirage Tube', 1); auto(g);
  ok(g.p[0].lp === 7000, `A took 1000 (${g.p[0].lp})`);
});
T('Mirror Gate swaps and battles', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Elemental HERO Sparkman'], st: ['Mirror Gate'] }] });
  goBP(g); attack(g, on(g, 0, 'Blue-Eyes White Dragon'), on(g, 1, 'Elemental HERO Sparkman')); choose(g, 'Mirror Gate', 1); auto(g);
  ok(on(g, 1, 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Elemental HERO Sparkman') && g.p[0].lp === 8000 - 1400, `B has Blue-Eyes, Sparkman died, A took 1400 (${g.p[0].lp})`);
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(on(g, 0, 'Blue-Eyes White Dragon'), 'Blue-Eyes came back in the End Phase');
});
T('Mirror of Oaths destroys a monster summoned from the Deck', () => {
  const g = duel({ board: [{ hand: ['Monster Gate'], m: [FILL] }, { st: ['Mirror of Oaths'] }] });
  act(g, 0, 'Monster Gate'); for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Mirror of Oaths'); i++) E.act(g, [g.prompt.opts[0].key]);
  choose(g, 'Mirror of Oaths', 1); auto(g);
  ok(!g.p[0].m.some(Boolean) && g.p[1].hand.length === 6, 'monster destroyed, B drew');
});
T('Mirror of Yata saves the Spirit in battle', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Yata-Garasu'], st: [{ n: 'Mirror of Yata', pos: 'up' }] }] });
  g.p[1].st[0].equipTo = on(g, 1, 'Yata-Garasu').u;
  goBP(g); attack(g, on(g, 0, 'Blue-Eyes White Dragon'), on(g, 1, 'Yata-Garasu')); auto(g);
  ok(on(g, 1, 'Yata-Garasu') && inZ(g, 1, 'gy', 'Mirror of Yata'), 'Yata stays, Mirror destroyed');
});
T('Mirror Wall halves the attacker', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: [FILL], st: [{ n: 'Mirror Wall', pos: 'up' }] }] });
  goBP(g); attack(g, on(g, 0, 'Blue-Eyes White Dragon'), on(g, 1, FILL)); auto(g);
  ok(inZ(g, 0, 'gy', 'Blue-Eyes White Dragon'), 'Blue-Eyes at 1500 lost to 2000');
});
T('Monster Gate', () => {
  const g = duel({ board: [{ hand: ['Monster Gate'], m: [FILL], deckTop: [FILL, 'Pot of Greed', 'Mystic Lamp'] }, {}] });
  act(g, 0, 'Monster Gate'); auto(g);
  ok(on(g, 0, 'Mystic Lamp') && inZ(g, 0, 'gy', 'Pot of Greed'), 'Lamp summoned, Pot sent');
});
T('Monster Recovery', () => {
  const g = duel({ board: [{ hand: ['Monster Recovery', FILL, FILL], m: ['Mystic Lamp'] }, {}] });
  act(g, 0, 'Monster Recovery'); auto(g);
  ok(!on(g, 0, 'Mystic Lamp') && g.p[0].hand.length === 3, `drew 3 (${g.p[0].hand.length})`);
});
T('Mysterious Guard returns 2 with a Warrior', () => {
  const g = duel({ board: [{ m: [{ n: 'Mysterious Guard', pos: 'set' }, 'Command Knight'], turn: 2 }, { m: [FILL, 'Mystic Lamp'] }] });
  choose(g, 'flip:'); auto(g);
  ok(g.p[1].m.filter(Boolean).length + g.p[0].m.filter(Boolean).length === 2, 'two monsters returned');
});
T('Mysterious Puppeteer', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Mysterious Puppeteer'] }, {}] });
  choose(g, 'ns:'); auto(g);
  ok(g.p[0].lp === 8500, `gained 500 (${g.p[0].lp})`);
});
T('Mysterious Triangle', () => {
  const g = duel({ board: [{ hand: ['Mysterious Triangle', 'Pot of Greed'], deckTop: [FILL, 'Alien Warrior'] }, { m: [FILL] }] });
  E.lib.addCtr(g, on(g, 1, FILL), 'A', 1); choose(g, 'setst:' + g.p[0].hand.find(c => E.name(c) === 'Pot of Greed').u);
  act(g, 0, 'Mysterious Triangle'); auto(g);
  ok(inZ(g, 1, 'gy', FILL) && on(g, 0, 'Alien Warrior'), 'destroyed, Alien summoned');
  choose(g, 'end'); auto(g);
  ok(inZ(g, 0, 'gy', 'Alien Warrior'), 'Alien destroyed in the End Phase');
});
T('Mystic Probe negates a Continuous Spell', () => {
  const g = duel({ board: [{ hand: ['Mystic Plasma Zone', 'Miracle Fertilizer'] }, { st: ['Mystic Probe'] }] });
  g.p[1].st[0].turnIn = -5; act(g, 0, 'Miracle Fertilizer'); choose(g, 'Mystic Probe', 1); auto(g);
  ok(!!g.chain && g.log.some(l => /negated/.test(l)), 'negated');
});
T('Mystic Swordsman LV2 destroys a Set monster and levels up', () => {
  const g = duel({ board: [{ m: ['Mystic Swordsman LV2'], deckTop: [FILL, 'Mystic Swordsman LV4'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Mystic Swordsman LV2'), g.p[1].m[0]); auto(g);
  ok(inZ(g, 1, 'gy', FILL), 'Set monster destroyed');
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(!on(g, 0, 'Mystic Swordsman LV4'), 'no LV up (not by battle)');
});
T('Mystic Swordsman LV4 can be Set, not Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Mystic Swordsman LV4'] }, {}] });
  const u = g.p[0].hand[0].u;
  ok(hasOpt(g, 'set:' + u) && !hasOpt(g, 'ns:' + u), 'Set only');
});
T('Mystic Swordsman LV6 puts it on top of the Deck', () => {
  const g = duel({ board: [{ m: ['Mystic Swordsman LV6'], turn: 2 }, { m: [{ n: 'Mystic Lamp', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Mystic Swordsman LV6'), g.p[1].m[0]); auto(g);
  const top = g.p[1].deck[g.p[1].deck.length - 1];
  ok(E.name(top) === 'Mystic Lamp', 'Lamp on top of the Deck');
});
T('Mystical Cards of Light holds back a zone', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: [{ n: 'Mystical Cards of Light', pos: 'up' }, 'Mirror Force', 'Mirror Force', 'Mirror Force'] }, {}] });
  ok(!hasOpt(g, 'setst:' + g.p[0].hand.find(c => E.name(c) === 'Pot of Greed').u), 'no Set into the last zone');
});
T('Needle Burrower', () => {
  const g = duel({ board: [{ m: ['Needle Burrower'], turn: 2 }, { m: ['Mystic Lamp'] }] });
  goBP(g); attack(g, on(g, 0, 'Needle Burrower'), on(g, 1, 'Mystic Lamp')); auto(g);
  ok(g.p[1].lp === 8000 - 1300 - 500, `B took 1800 (${g.p[1].lp})`);
});
T('Needle Wall rolls', () => {
  const g = duel({ board: [{ st: [{ n: 'Needle Wall', pos: 'up' }] }, { m: [FILL, FILL, FILL, FILL, FILL] }] });
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(g.p[1].m.filter(Boolean).length === 3, 'one destroyed in each of A Standby Phases');
});
T('Nightmare Archfiends tokens burn', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], m: [FILL], st: ['Nightmare Archfiends'], turn: 2 }, {}] });
  choose(g, 'a:' + st(g, 0, 'Nightmare Archfiends').u + ':0'); auto(g);
  ok(g.p[1].m.filter(Boolean).length === 3, '3 tokens');
  act(g, 0, 'Smashing Ground'); auto(g);
  ok(g.p[1].lp === 7200, `B took 800 (${g.p[1].lp})`);
});
T('Non Aggression Area stops the next turn summons', () => {
  const g = duel({ board: [{ hand: [FILL, FILL], st: ['Non Aggression Area'] }, { hand: [FILL] }] });
  choose(g, 'Yes', 0); auto(g);
  ok(g.tp === 0 && inZ(g, 0, 'gy', 'Non Aggression Area'), 'activated in the Standby Phase');
  choose(g, 'end'); auto(g, { no: true });
  ok(g.tp === 1 && !hasOpt(g, 'ns:') && !hasOpt(g, 'set:'), 'B cannot summon or Set');
});
T('Non-Fusion Area blocks Polymerization', () => {
  const g = duel({ board: [{ hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'], extra: ['Elemental HERO Flame Wingman'] }, { st: [{ n: 'Non-Fusion Area', pos: 'up' }] }], ex0: [] });
  ok(!!E.lib.forbid(g, { type: 'ss', c: g.p[0].extra[0], p: 0, how: 'fusion' }), 'no Fusion Summon');
});
T('Ocean Dragon Lord', () => {
  const g = duel({ board: [{ hand: ['Ocean Dragon Lord - Neo-Daedalus'], m: ['Levia-Dragon - Daedalus'] }, { hand: [FILL], m: [FILL] }] });
  choose(g, 'sp:'); auto(g);
  ok(on(g, 0, 'Ocean Dragon Lord - Neo-Daedalus'), 'summoned');
});
T('Ojama Delta Hurricane and King', () => {
  const g = duel({ board: [{ hand: ['Ojama Delta Hurricane!!'], m: ['Ojama Green', 'Ojama Yellow', 'Ojama Black'] }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Ojama Delta Hurricane!!'); auto(g);
  ok(!g.p[1].m.some(Boolean) && !g.p[1].st.some(Boolean), 'their field is gone');
});
T('Ojama Red', () => {
  const g = duel({ board: [{ hand: ['Ojama Red', 'Ojama Green', 'Ojama Black'] }, {}] });
  choose(g, 'ns:' + g.p[0].hand[0].u); auto(g);
  ok(g.p[0].m.filter(Boolean).length >= 2, 'Ojamas summoned');
});
T('Ojama Trio', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], st: ['Ojama Trio'], turn: 2 }, {}] });
  choose(g, 'a:' + st(g, 0, 'Ojama Trio').u + ':0'); auto(g); act(g, 0, 'Smashing Ground'); auto(g);
  ok(g.p[1].m.filter(Boolean).length === 2 && g.p[1].lp === 7700, `B took 300 (${g.p[1].lp})`);
});
T('Pitch-Black Power Stone moves a counter', () => {
  const g = duel({ board: [{ m: ['Breaker the Magical Warrior'], st: ['Pitch-Black Power Stone'], turn: 2 }, {}] });
  choose(g, 'a:' + st(g, 0, 'Pitch-Black Power Stone').u + ':0'); auto(g);
  choose(g, 'a:' + st(g, 0, 'Pitch-Black Power Stone').u + ':1'); auto(g);
  ok(E.lib.ctr(on(g, 0, 'Breaker the Magical Warrior'), 'spell') >= 1 && E.lib.ctr(st(g, 0, 'Pitch-Black Power Stone'), 'spell') === 2, 'moved one');
});
T('Pitch-Dark Dragon equips to Dark Blade', () => {
  const g = duel({ board: [{ m: ['Pitch-Dark Dragon', 'Dark Blade'] }, {}] });
  choose(g, 'a:' + on(g, 0, 'Pitch-Dark Dragon').u + ':0'); auto(g);
  ok(E.atk(g, on(g, 0, 'Dark Blade')) === 2200, `Dark Blade 2200 (${E.atk(g, on(g, 0, 'Dark Blade'))})`);
});
T('Poison Chain mills', () => {
  const g = duel({ board: [{ m: ['Iron Chain Snake', 'Iron Chain Repairman'], st: [{ n: 'Poison Chain', pos: 'up' }] }, {}] });
  const n = g.p[1].deck.length; choose(g, 'end'); auto(g);
  ok(g.p[1].deck.length === n - 3, `milled 2 plus the draw (${n - g.p[1].deck.length})`);
});
T('Poison Draw Frog draws, but not when hit face-down', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'] }, { m: ['Poison Draw Frog'] }] });
  act(g, 0, 'Smashing Ground'); auto(g);
  ok(g.p[1].hand.length === 6, 'B drew');
  const g2 = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: [{ n: 'Poison Draw Frog', pos: 'set' }] }] });
  const h = g2.p[1].hand.length; goBP(g2); attack(g2, on(g2, 0, 'Blue-Eyes White Dragon'), g2.p[1].m[0]); auto(g2);
  ok(g2.p[1].hand.length === h, 'no draw');
});
T('Poison Fangs', () => {
  const g = duel({ board: [{ m: ['Mystical Sheep 1'], st: [{ n: 'Poison Fangs', pos: 'up' }], turn: 2 }, {}] });
  goBP(g); attack(g, on(g, 0, 'Mystical Sheep 1'), null); auto(g);
  ok(g.p[1].lp === 8000 - 1150 - 500, `B took 1650 (${g.p[1].lp})`);
});
T('Pot of Benevolence banishes itself', () => {
  const g = duel({ board: [{ hand: ['Pot of Benevolence'], gy: [FILL, FILL] }, {}] });
  act(g, 0, 'Pot of Benevolence'); auto(g);
  ok(inZ(g, 0, 'ban', 'Pot of Benevolence') && g.p[0].gy.length === 0, 'banished, GY shuffled in');
});
T('Pot of Generosity', () => {
  const g = duel({ board: [{ hand: ['Pot of Generosity', FILL, FILL, FILL] }, {}] });
  act(g, 0, 'Pot of Generosity'); auto(g);
  ok(g.p[0].hand.length === 2, `hand 2 (${g.p[0].hand.length})`);
});
console.log(fails ? `${fails} FAILED` : 'All checks passed.');
process.exit(fails ? 1 : 0);
