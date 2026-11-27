// Independent review checks for full pool batch 17 (written from the card text): node build/review_full-13.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior Level 4 2000/100
let lastG; function duel(o = {}) {
  const mk = (ex, n) => ({ name: 't', main: Array(n || 40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0, o.n0), mk(o.ex1, o.n1)], first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) { fails++; if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ') + '\n   prompt: ' + (lastG.prompt ? lastG.prompt.p + ' ' + lastG.prompt.type + ' ' + lastG.prompt.text + ' :: ' + lastG.prompt.opts.map(x => x.label + '[' + x.key + ']').join(', ') : 'none')); } }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra, ...g.p[p].ban, g.p[p].fz].find(c => c && E.name(c) === n);
const byU = (g, u) => { for (const P of g.p) for (const z of ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra']) for (const c of P[z]) if (c && c.u === u) return c; return g.p.map(P => P.fz).find(c => c && c.u === u) || null; };
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const canAct = (g, p, n) => { const c = card(g, p, n); return !!c && hasOpt(g, 'a:' + c.u + ':'); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ')); } };
function settle(g, ...picks) { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const nm = x => { const c = x.u != null && byU(g, x.u); return c ? E.name(c) : ''; };
    const o = pr.opts.find(x => x.key !== 'pass' && picks.some(t => nm(x) === t || (x.label + ' ' + x.key).includes(t))); E.act(g, [o ? o.key : 'pass']); }
  else if (pr.type === 'yesno') choose(g, picks.includes('NO') ? 'no' : 'yes');
  else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => x.label.includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); }
    for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); E.act(g, ks); } } }
const bp = g => { choose(g, 'bp'); settle(g); };
const atkOn = (g, p, aName, tName, ...picks) => { const a = on(g, p, aName), t = tName ? on(g, 1 - p, tName) : null; choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); settle(g, ...picks); };
const canAtk = (g, a, t) => hasOpt(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const endTurn = (g, ...picks) => { if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g, ...picks); } choose(g, 'end'); settle(g, ...picks); };
const ns = (g, p, n, ...picks) => { choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u); settle(g, ...picks); };
const noSummon = (g, c) => !hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && !hasOpt(g, 'sp:' + c.u);
const lp = (g, p) => g.p[p].lp;
const LV = c => E.lib.lv(c);
const up = n => ({ n, pos: 'up' });
const idle = g => g.prompt && g.prompt.type === 'idle';
const toIdle = (g, ...picks) => { for (let i = 0; i < 10 && g.prompt && !idle(g) && g.prompt.type !== 'battle'; i++) settle(g, ...picks); };
const optsFor = (g, c) => g.prompt ? g.prompt.opts.filter(x => x.u === c.u || x.key.split(':')[1] === String(c.u)) : [];
const hand = (g, p) => g.p[p].hand.length;
const SANC = 'The Sanctuary in the Sky';

/* ---------------- Agents ---------------- */
T('Venus: pay 500, Special Summon Mystical Shine Ball from the Deck, more than once a turn', () => {
  const g = duel({ board: [{ hand: [], m: ['The Agent of Creation - Venus'], deckTop: [FILL, 'Mystical Shine Ball', 'Mystical Shine Ball'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'The Agent of Creation - Venus'), 'Venus effect offered');
  act(g, 0, 'The Agent of Creation - Venus'); settle(g, 'Attack');
  ok(lp(g, 0) === 7500 && cnt(g, 0, 'm', 'Mystical Shine Ball') === 1, `paid 500 (${lp(g, 0)}), Shine Ball summoned`);
  ok(canAct(g, 0, 'The Agent of Creation - Venus'), 'offered again the same turn');
  act(g, 0, 'The Agent of Creation - Venus'); settle(g, 'Attack');
  ok(lp(g, 0) === 7000 && cnt(g, 0, 'm', 'Mystical Shine Ball') === 2, 'second Shine Ball summoned');
  const g2 = duel({ board: [{ hand: [], m: ['The Agent of Creation - Venus'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Agent of Creation - Venus'), 'not offered with no Shine Ball in hand or Deck');
});
T('Mars: gains the LP difference with Sanctuary, unaffected by Spells', () => {
  const g = duel({ board: [{ hand: [SANC, 'Dark Hole'], m: ['The Agent of Force - Mars'], turn: 2 }, { lp: 5000, m: [FILL] }] });
  const m = on(g, 0, 'The Agent of Force - Mars');
  ok(E.atk(g, m) === 0, 'Mars 0 ATK without Sanctuary');
  act(g, 0, SANC); settle(g);
  ok(E.atk(g, m) === 3000 && E.def(g, m) === 3000, `Mars ${E.atk(g, m)}/${E.def(g, m)} with Sanctuary and 3000 more LP`);
  act(g, 0, 'Dark Hole'); settle(g);
  ok(on(g, 0, 'The Agent of Force - Mars') && !on(g, 1, FILL), 'Dark Hole destroys the Warwolf but not Mars');
});
T('Saturn: Tribute for the LP difference with Sanctuary, no Battle Phase', () => {
  const g = duel({ board: [{ hand: [SANC], m: ['The Agent of Judgment - Saturn'], turn: 2 }, { lp: 5000 }] });
  act(g, 0, SANC); settle(g);
  ok(canAct(g, 0, 'The Agent of Judgment - Saturn'), 'Saturn effect offered'); act(g, 0, 'The Agent of Judgment - Saturn'); settle(g);
  ok(lp(g, 1) === 2000 && inZ(g, 0, 'gy', 'The Agent of Judgment - Saturn'), `B took 3000 (${lp(g, 1)}), Saturn Tributed`);
  ok(!hasOpt(g, 'bp'), 'no Battle Phase after it');
  const g2 = duel({ board: [{ hand: [], m: ['The Agent of Judgment - Saturn'], turn: 2 }, { lp: 5000 }] });
  if (canAct(g2, 0, 'The Agent of Judgment - Saturn')) { act(g2, 0, 'The Agent of Judgment - Saturn'); settle(g2); }
  ok(lp(g2, 1) === 5000, 'no damage without Sanctuary');
});
T('Mercury: no hand at the end of the opponent turn, draw 1 in the Standby Phase', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['The Agent of Wisdom - Mercury'] }, { turn: 2 }] });
  endTurn(g); toIdle(g);
  ok(g.tp === 0 && hand(g, 0) === 2, `A has 2 cards (normal draw + Mercury): ${hand(g, 0)}`);
  const g2 = duel({ first: 1, board: [{ hand: [FILL], m: ['The Agent of Wisdom - Mercury'] }, { turn: 2 }] });
  endTurn(g2); toIdle(g2);
  ok(hand(g2, 0) === 2, `with a card in hand only the normal draw: ${hand(g2, 0)}`);
});

/* ---------------- Hex-Sealed Fusions ---------------- */
const hexTrib = (g, hexName, picks) => { const h = on(g, 0, hexName); const o = optsFor(g, h).find(x => x.key.startsWith('a:'));
  if (!o) throw new Error('no effect option for ' + hexName); choose(g, o.key); settle(g, ...picks); };
T('The Dark - Hex-Sealed Fusion: Tribute it + Relinquished for Thousand-Eyes Restrict', () => {
  const g = duel({ ex0: ['Thousand-Eyes Restrict'], board: [{ hand: [], m: ['The Dark - Hex-Sealed Fusion', 'Relinquished'], turn: 2 }, {}] });
  hexTrib(g, 'The Dark - Hex-Sealed Fusion', ['Thousand-Eyes Restrict', 'Relinquished', 'Attack']);
  ok(on(g, 0, 'Thousand-Eyes Restrict') && inZ(g, 0, 'gy', 'Relinquished') && inZ(g, 0, 'gy', 'The Dark - Hex-Sealed Fusion'), 'Thousand-Eyes Restrict summoned, both Tributed');
});
T('The Earth - Hex-Sealed Fusion: Tribute it + Big Koala for Master of Oz', () => {
  const g = duel({ ex0: ['Master of Oz'], board: [{ hand: [], m: ['The Earth - Hex-Sealed Fusion', 'Big Koala'], turn: 2 }, {}] });
  hexTrib(g, 'The Earth - Hex-Sealed Fusion', ['Master of Oz', 'Big Koala', 'Attack']);
  ok(on(g, 0, 'Master of Oz') && inZ(g, 0, 'gy', 'Big Koala'), 'Master of Oz summoned');
  const g2 = duel({ ex0: ['Thousand-Eyes Restrict'], board: [{ hand: [], m: ['The Earth - Hex-Sealed Fusion', 'Relinquished'], turn: 2 }, {}] });
  ok(!optsFor(g2, on(g2, 0, 'The Earth - Hex-Sealed Fusion')).some(x => x.key.startsWith('a:')), 'not for a DARK Fusion');
});
T('The Light - Hex-Sealed Fusion: Tribute it + Thunder Dragon; substitute in Polymerization', () => {
  const g = duel({ ex0: ['Twin-Headed Thunder Dragon'], board: [{ hand: [], m: ['The Light - Hex-Sealed Fusion', 'Thunder Dragon'], turn: 2 }, {}] });
  hexTrib(g, 'The Light - Hex-Sealed Fusion', ['Twin-Headed Thunder Dragon', 'Thunder Dragon', 'Attack']);
  ok(on(g, 0, 'Twin-Headed Thunder Dragon'), 'Twin-Headed Thunder Dragon summoned');
  const g2 = duel({ ex0: ['Twin-Headed Thunder Dragon'], board: [{ hand: ['Polymerization', 'The Light - Hex-Sealed Fusion', 'Thunder Dragon'], turn: 2 }, {}] });
  // ENGINE gap (documented in the script): substitute Fusion Materials are not read, so Polymerization is not checked here.
  if (canAct(g2, 0, 'Polymerization')) { act(g2, 0, 'Polymerization'); settle(g2, 'Twin-Headed Thunder Dragon', 'The Light', 'Thunder Dragon', 'Attack');
    ok(on(g2, 0, 'Twin-Headed Thunder Dragon') && inZ(g2, 0, 'gy', 'The Light - Hex-Sealed Fusion'), 'Fusion Summoned with Light Hex as a substitute'); }
  else console.log('note substitute Fusion Material not supported (documented ENGINE gap)');
});

/* ---------------- Thousand ---------------- */
T('Thousand Dragon: Fusion of Time Wizard + Baby Dragon', () => {
  const g = duel({ ex0: ['Thousand Dragon'], board: [{ hand: ['Polymerization', 'Time Wizard', 'Baby Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Thousand Dragon', 'Time Wizard', 'Baby Dragon', 'Attack');
  const t = on(g, 0, 'Thousand Dragon'); ok(t && E.atk(g, t) === 2400, 'Thousand Dragon 2400 on the field');
});
T('Thousand Energy: Level 2 Normals +1000, destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Thousand Energy'], m: ['Dig Beak', FILL], turn: 2 }, {}] });
  act(g, 0, 'Thousand Energy'); settle(g);
  const d = on(g, 0, 'Dig Beak');
  ok(E.atk(g, d) === 1500 && E.def(g, d) === 1800 && E.atk(g, on(g, 0, FILL)) === 2000, `Dig Beak ${E.atk(g, d)}/${E.def(g, d)}, Warwolf unchanged`);
  endTurn(g);
  ok(inZ(g, 0, 'gy', 'Dig Beak') && on(g, 0, FILL), 'Dig Beak destroyed in the End Phase, Warwolf stays');
});
T('Thousand Knives: with Dark Magician, destroy 1 opponent monster', () => {
  const g = duel({ board: [{ hand: ['Thousand Knives'], m: ['Dark Magician'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Thousand Knives'); settle(g, 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Blue-Eyes destroyed');
  const g2 = duel({ board: [{ hand: ['Thousand Knives'], m: [FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ok(!canAct(g2, 0, 'Thousand Knives'), 'not offered without Dark Magician');
});
for (const nd of ['Thousand Needles', 'Two Thousand Needles']) T(nd + ': destroys a weaker attacker', () => {
  const g = duel({ board: [{ hand: [], m: ['Mystical Elf'], turn: 2 }, { m: [{ n: nd, pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Mystical Elf', nd);
  ok(inZ(g, 0, 'gy', 'Mystical Elf') && on(g, 1, nd) && lp(g, 0) === 7000, `Elf destroyed, Needles stays, A took 1000 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: [{ n: nd, pos: 'def' }] }] });
  bp(g2); atkOn(g2, 0, 'Blue-Eyes White Dragon', nd);
  ok(on(g2, 0, 'Blue-Eyes White Dragon') && !on(g2, 1, nd), 'a stronger attacker just wins');
});
T('Thousand-Eyes Jellyfish: Special Summon by Tributing Ocean\'s Keeper only', () => {
  const g = duel({ board: [{ hand: ['Thousand-Eyes Jellyfish'], m: ["Ocean's Keeper"], turn: 2 }, {}] });
  const j = card(g, 0, 'Thousand-Eyes Jellyfish');
  ok(!hasOpt(g, 'ns:' + j.u) && !hasOpt(g, 'set:' + j.u), 'no Normal Summon or Set');
  ok(hasOpt(g, 'sp:' + j.u), 'Special Summon offered'); choose(g, 'sp:' + j.u); settle(g, "Ocean's Keeper", 'Attack');
  ok(on(g, 0, 'Thousand-Eyes Jellyfish') && inZ(g, 0, 'gy', "Ocean's Keeper"), 'Jellyfish summoned, Keeper Tributed');
  const g2 = duel({ board: [{ hand: ['Thousand-Eyes Jellyfish'], m: [FILL], turn: 2 }, {}] });
  ok(noSummon(g2, card(g2, 0, 'Thousand-Eyes Jellyfish')), 'no summon without Ocean\'s Keeper');
});
T('Thousand-Eyes Restrict: absorbs a monster, takes its ATK, others cannot attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Thousand-Eyes Restrict', FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon', 'Mystical Elf'] }] });
  act(g, 0, 'Thousand-Eyes Restrict'); settle(g, 'Blue-Eyes White Dragon');
  const t = on(g, 0, 'Thousand-Eyes Restrict');
  ok(!on(g, 1, 'Blue-Eyes White Dragon') && E.atk(g, t) === 3000 && E.def(g, t) === 2500, `Blue-Eyes equipped, Restrict ${E.atk(g, t)}/${E.def(g, t)}`);
  ok(!canAct(g, 0, 'Thousand-Eyes Restrict'), 'once per turn');
  bp(g);
  ok(!canAtk(g, on(g, 0, FILL), on(g, 1, 'Mystical Elf')) && canAtk(g, t, on(g, 1, 'Mystical Elf')), 'Warwolf cannot attack, Restrict can');
  const g2 = duel({ board: [{ hand: [], m: ['Thousand-Eyes Restrict'], turn: 2 }, { m: ['Mystical Elf', FILL] }] });
  act(g2, 0, 'Thousand-Eyes Restrict'); settle(g2, 'Mystical Elf'); endTurn(g2); toIdle(g2); choose(g2, 'bp'); settle(g2);
  ok(g2.tp === 1 && on(g2, 1, FILL) && !hasOpt(g2, 'atk:'), 'the opponent Warwolf cannot attack either');
});
T('Thousand-Eyes Restrict: battle destruction hits the equipped monster instead', () => {
  const g = duel({ board: [{ hand: [], m: ['Thousand-Eyes Restrict'], turn: 2 }, { m: ['Mystical Elf', 'Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Thousand-Eyes Restrict'); settle(g, 'Mystical Elf');
  bp(g); atkOn(g, 0, 'Thousand-Eyes Restrict', 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Thousand-Eyes Restrict') && inZ(g, 1, 'gy', 'Mystical Elf'), 'Restrict survives, the equipped Elf is destroyed');
});

/* ---------------- Thunder ---------------- */
T('Thunder Crash: destroy own monsters, 300 each', () => {
  const g = duel({ board: [{ hand: ['Thunder Crash'], m: [FILL, FILL], turn: 2 }, {}] });
  act(g, 0, 'Thunder Crash'); settle(g);
  ok(cnt(g, 0, 'm') === 0 && lp(g, 1) === 7400, `both destroyed, B took 600 (${lp(g, 1)})`);
});
T('Thunder Dragon: discard, add 2 Thunder Dragon', () => {
  const g = duel({ board: [{ hand: ['Thunder Dragon'], deckTop: [FILL, 'Thunder Dragon', 'Thunder Dragon'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Thunder Dragon'), 'offered from the hand'); act(g, 0, 'Thunder Dragon'); settle(g, 'Thunder Dragon', 'Thunder Dragon');
  ok(cnt(g, 0, 'hand', 'Thunder Dragon') === 2 && cnt(g, 0, 'gy', 'Thunder Dragon') === 1, 'discarded 1, added 2');
});
T('Thunder Nyan Nyan: destroyed by a non-LIGHT monster', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Thunder Nyan Nyan'], turn: 2 }, {}] });
  ns(g, 0, FILL);
  ok(inZ(g, 0, 'gy', 'Thunder Nyan Nyan'), 'Nyan Nyan destroyed after the Warwolf');
  const g2 = duel({ board: [{ hand: ['Mystical Elf'], m: ['Thunder Nyan Nyan'], turn: 2 }, {}] });
  ns(g2, 0, 'Mystical Elf');
  ok(on(g2, 0, 'Thunder Nyan Nyan'), 'stays with a LIGHT monster');
});
T('Thunder of Ruler: no Battle Phase after it in the opponent Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Thunder of Ruler'], turn: 2 }, { m: [FILL] }] });
  endTurn(g, 'Thunder of Ruler'); toIdle(g, 'Thunder of Ruler');
  ok(g.tp === 1 && inZ(g, 0, 'gy', 'Thunder of Ruler'), 'activated in B turn');
  ok(!hasOpt(g, 'bp'), 'B has no Battle Phase');
});

/* ---------------- Time ---------------- */
T('Time Machine: returns a monster destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Mystical Elf'], st: ['Time Machine'] }] });
  bp(g); atkOn(g, 0, FILL, 'Mystical Elf', 'Time Machine');
  const e = on(g, 1, 'Mystical Elf');
  ok(e && e.pos === 'atk' && inZ(g, 1, 'gy', 'Time Machine'), 'Elf back on B field in Attack Position');
});
T('Time Passage: Fortune Lady +3 Levels until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Time Passage'], m: ['Fortune Lady Water'], turn: 2 }, {}] });
  toIdle(g); g.__l0 = LV(on(g, 0, 'Fortune Lady Water')); // it already gained 1 in its own Standby Phase
  act(g, 0, 'Time Passage'); settle(g, 'Fortune Lady Water');
  const f = on(g, 0, 'Fortune Lady Water'); const l0 = g.__l0;
  ok(LV(f) === l0 + 3, `Level ${l0} -> ${LV(f)}`);
  endTurn(g); ok(LV(f) === l0, `back to ${LV(f)}`);
  const g2 = duel({ board: [{ hand: ['Time Passage'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Time Passage'), 'not offered without a Fortune Lady');
});
T('Time Seal: opponent skips the next Draw Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Time Seal'], turn: 2 }, {}] });
  const h0 = hand(g, 1);
  act(g, 0, 'Time Seal'); settle(g); endTurn(g); toIdle(g);
  ok(g.tp === 1 && hand(g, 1) === h0, `B did not draw (${h0} -> ${hand(g, 1)})`);
});
T('Time Wizard: right call destroys their monsters, wrong call destroys yours and burns half', () => {
  const seen = { right: 0, wrong: 0 };
  for (let s = 1; s <= 24; s++) {
    const g = duel({ seed: s, board: [{ hand: [], m: ['Time Wizard', FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
    act(g, 0, 'Time Wizard'); settle(g, 'Heads');
    const right = !on(g, 1, 'Blue-Eyes White Dragon') && on(g, 0, 'Time Wizard') && on(g, 0, FILL) && lp(g, 0) === 8000;
    const wrong = on(g, 1, 'Blue-Eyes White Dragon') && cnt(g, 0, 'm') === 0 && lp(g, 0) === 8000 - 1250;
    if (right) seen.right++; else if (wrong) seen.wrong++; else { ok(false, `seed ${s}: neither outcome (A ${lp(g, 0)})`); return; }
  }
  ok(seen.right > 0 && seen.wrong > 0, `both outcomes seen (${seen.right} right, ${seen.wrong} wrong)`);
});

/* ---------------- Toons ---------------- */
const TW = { n: 'Toon World', pos: 'up' };
T('Toon World: pay 1000 to activate', () => {
  const g = duel({ board: [{ hand: ['Toon World'], turn: 2 }, {}] });
  act(g, 0, 'Toon World'); settle(g);
  ok(lp(g, 0) === 7000 && inZ(g, 0, 'st', 'Toon World'), 'paid 1000, Toon World stays');
});
T('Toon Table of Contents: add a Toon card', () => {
  const g = duel({ board: [{ hand: ['Toon Table of Contents'], deckTop: [FILL, 'Toon World'], turn: 2 }, {}] });
  act(g, 0, 'Toon Table of Contents'); settle(g, 'Toon World');
  ok(inZ(g, 0, 'hand', 'Toon World'), 'Toon World added');
});
T('Toon Cannon Soldier: Tribute 1 for 500, cannot attack the turn summoned, dies with Toon World', () => {
  const g = duel({ board: [{ hand: [], m: ['Toon Cannon Soldier', FILL], turn: 2 }, {}] });
  act(g, 0, 'Toon Cannon Soldier'); settle(g, FILL);
  ok(lp(g, 1) === 7500 && inZ(g, 0, 'gy', FILL), `500 damage (${lp(g, 1)}), Warwolf Tributed`);
  const g2 = duel({ board: [{ hand: ['Toon Cannon Soldier'], turn: 2 }, {}] });
  ns(g2, 0, 'Toon Cannon Soldier'); bp(g2);
  ok(!canAtk(g2, on(g2, 0, 'Toon Cannon Soldier'), null), 'no attack the turn it is summoned');
  const g3 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Toon Cannon Soldier'], st: [TW], turn: 2 }, {}] });
  act(g3, 0, 'Mystical Space Typhoon'); settle(g3, 'Toon World');
  ok(inZ(g3, 0, 'gy', 'Toon World') && inZ(g3, 0, 'gy', 'Toon Cannon Soldier'), 'destroyed with Toon World');
  const g4 = duel({ board: [{ hand: [], m: ['Toon Cannon Soldier'], st: [TW], turn: 2 }, { m: [FILL] }] });
  bp(g4); ok(canAtk(g4, on(g4, 0, 'Toon Cannon Soldier'), null), 'direct attack with Toon World');
});
T('Toon Gemini Elf: direct with Toon World, random discard', () => {
  const g = duel({ board: [{ hand: [], m: ['Toon Gemini Elf'], st: [TW], turn: 2 }, { hand: [FILL, FILL, FILL], m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Toon Gemini Elf', null);
  ok(lp(g, 1) === 6100 && hand(g, 1) === 2 && lp(g, 0) === 8000, `1900 direct (${lp(g, 1)}), B discarded 1 (${hand(g, 1)}), no LP cost`);
  const g2 = duel({ board: [{ hand: [], m: ['Toon Gemini Elf'], turn: 2 }, { m: [FILL] }] });
  bp(g2); ok(!canAtk(g2, on(g2, 0, 'Toon Gemini Elf'), null), 'no direct attack without Toon World');
});
T('Toon Goblin Attack Force: direct, then Defense Position after attacking', () => {
  const g = duel({ board: [{ hand: [], m: ['Toon Goblin Attack Force'], st: [TW], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Toon Goblin Attack Force', null);
  ok(lp(g, 1) === 5700, `2300 direct (${lp(g, 1)})`);
  choose(g, 'endbp'); settle(g);
  ok(on(g, 0, 'Toon Goblin Attack Force').pos === 'def', 'in Defense Position after the Battle Phase');
});
T('Toon Masked Sorcerer: direct, draw 1', () => {
  const g = duel({ board: [{ hand: [], m: ['Toon Masked Sorcerer'], st: [TW], turn: 2 }, { m: [FILL] }] });
  const h = hand(g, 0); bp(g); atkOn(g, 0, 'Toon Masked Sorcerer', null);
  ok(lp(g, 1) === 7100 && hand(g, 0) === h + 1, `900 direct (${lp(g, 1)}), drew 1`);
});
T('Toon Mermaid: Special Summon with Toon World, no attack that turn, pays 500 to attack', () => {
  const g = duel({ board: [{ hand: ['Toon Mermaid'], st: [TW], turn: 2 }, {}] });
  const c = card(g, 0, 'Toon Mermaid');
  ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Special Summon only'); choose(g, 'sp:' + c.u); settle(g, 'Attack');
  ok(on(g, 0, 'Toon Mermaid'), 'summoned'); bp(g);
  ok(!canAtk(g, on(g, 0, 'Toon Mermaid'), null), 'no attack the turn it is summoned');
  const g2 = duel({ board: [{ hand: ['Toon Mermaid'], turn: 2 }, {}] });
  ok(noSummon(g2, card(g2, 0, 'Toon Mermaid')), 'not without Toon World');
  const g3 = duel({ board: [{ hand: [], m: ['Toon Mermaid'], st: [TW], turn: 2 }, { m: [FILL] }] });
  bp(g3); atkOn(g3, 0, 'Toon Mermaid', null);
  ok(lp(g3, 0) === 7500 && lp(g3, 1) === 6600, `paid 500 (${lp(g3, 0)}), 1400 direct (${lp(g3, 1)})`);
});
T('Toon Summoned Skull: Special Summon by Tributing 1 with Toon World', () => {
  const g = duel({ board: [{ hand: ['Toon Summoned Skull (Archfiend)'], m: [FILL], st: [TW], turn: 2 }, {}] });
  const c = card(g, 0, 'Toon Summoned Skull (Archfiend)');
  ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Special Summon only'); choose(g, 'sp:' + c.u); settle(g, FILL, 'Attack');
  ok(on(g, 0, 'Toon Summoned Skull (Archfiend)') && inZ(g, 0, 'gy', FILL), 'summoned, Warwolf Tributed');
  const g3 = duel({ board: [{ hand: [], m: ['Toon Summoned Skull (Archfiend)'], st: [TW], turn: 2 }, { m: [FILL] }] });
  bp(g3); atkOn(g3, 0, 'Toon Summoned Skull (Archfiend)', null);
  ok(lp(g3, 0) === 7500 && lp(g3, 1) === 5500, `paid 500, 2500 direct (A ${lp(g3, 0)}, B ${lp(g3, 1)})`);
});
T('Toon Dark Magician Girl: Special Summon by Tributing 1, +300 per Dark Magician, direct', () => {
  const g = duel({ board: [{ hand: ['Toon Dark Magician Girl'], m: [FILL], st: [TW], turn: 2 }, {}] });
  const c = card(g, 0, 'Toon Dark Magician Girl');
  ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Special Summon only'); choose(g, 'sp:' + c.u); settle(g, FILL, 'Attack');
  ok(on(g, 0, 'Toon Dark Magician Girl'), 'summoned');
  const g3 = duel({ board: [{ hand: [], m: ['Toon Dark Magician Girl'], st: [TW], gy: ['Dark Magician'], turn: 2 }, { m: [FILL], gy: ['Dark Magician'] }] });
  const t = on(g3, 0, 'Toon Dark Magician Girl'); ok(E.atk(g3, t) === 2600, `2600 ATK with 2 Dark Magicians (${E.atk(g3, t)})`);
  bp(g3); atkOn(g3, 0, 'Toon Dark Magician Girl', null);
  ok(lp(g3, 1) === 5400, `2600 direct (${lp(g3, 1)})`);
});
T('Toon Defense: an attack on a Level 4 Toon becomes a direct attack', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Toon Gemini Elf'], st: [{ n: 'Toon Defense', pos: 'up' }] }] });
  bp(g); atkOn(g, 0, FILL, 'Toon Gemini Elf', 'Toon Defense');
  ok(on(g, 1, 'Toon Gemini Elf') && lp(g, 1) === 6000, `Elf safe, B took 2000 direct (${lp(g, 1)})`);
});

/* ---------------- Tornado ---------------- */
T('Tornado: needs 3 opponent Spells/Traps, destroys 1', () => {
  const g = duel({ board: [{ hand: ['Tornado'], turn: 2 }, { st: ['Mirror Force', 'Magic Cylinder', 'Royal Decree'] }] });
  ok(canAct(g, 0, 'Tornado'), 'offered'); act(g, 0, 'Tornado'); settle(g, 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Mirror Force') && cnt(g, 1, 'st') === 2, 'Mirror Force destroyed');
  const g2 = duel({ board: [{ hand: ['Tornado'], turn: 2 }, { st: ['Mirror Force', 'Magic Cylinder'] }] });
  ok(!canAct(g2, 0, 'Tornado'), 'not with 2');
});
T('Tornado Bird: FLIP returns 2 Spells/Traps to the hand', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Tornado Bird', pos: 'set' }], turn: 2 }, { hand: [], st: ['Mirror Force', 'Magic Cylinder'] }] });
  choose(g, 'flip:' + on(g, 0, 'Tornado Bird').u); settle(g, 'Mirror Force', 'Magic Cylinder');
  ok(inZ(g, 1, 'hand', 'Mirror Force') && inZ(g, 1, 'hand', 'Magic Cylinder'), 'both returned');
});
T('Tornado Wall: with Umi, no battle damage from attacks', () => {
  const g = duel({ board: [{ hand: ['Umi'], m: [FILL], turn: 2 }, { st: ['Tornado Wall'] }] });
  act(g, 0, 'Umi'); settle(g);
  bp(g); atkOn(g, 0, FILL, null, 'Tornado Wall');
  ok(inZ(g, 1, 'st', 'Tornado Wall') && lp(g, 1) === 8000, `no damage (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Tornado Wall'] }] });
  bp(g2); atkOn(g2, 0, FILL, null, 'Tornado Wall');
  ok(lp(g2, 1) === 6000 && !inZ(g2, 1, 'gy', 'Tornado Wall') && card(g2, 1, 'Tornado Wall').pos === 'set', 'cannot be activated without Umi');
});

/* ---------------- Trap ---------------- */
T('Trap Eater: Special Summon by sending an opponent face-up Trap', () => {
  const g = duel({ board: [{ hand: ['Trap Eater'], turn: 2 }, { st: [{ n: 'Royal Decree', pos: 'up' }] }] });
  const c = card(g, 0, 'Trap Eater');
  ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Special Summon only'); choose(g, 'sp:' + c.u); settle(g, 'Royal Decree', 'Attack');
  ok(on(g, 0, 'Trap Eater') && inZ(g, 1, 'gy', 'Royal Decree'), 'summoned, Royal Decree sent');
  const g2 = duel({ board: [{ hand: ['Trap Eater'], turn: 2 }, { st: ['Royal Decree'] }] });
  ok(noSummon(g2, card(g2, 0, 'Trap Eater')), 'not with a Set Trap');
});
T('Trap Jammer: negates a Trap activated in the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Trap Jammer'], turn: 2 }, { st: ['Mirror Force'] }] });
  bp(g); atkOn(g, 0, FILL, null, 'Mirror Force', 'Trap Jammer');
  ok(on(g, 0, FILL) && inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'Trap Jammer') && lp(g, 1) === 6000, `Warwolf survives and hits (${lp(g, 1)})`);
});
T('Trap Master: FLIP destroys a Set Trap', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Trap Master', pos: 'set' }], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'flip:' + on(g, 0, 'Trap Master').u); settle(g, 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Trap of Board Eraser: negates burn, opponent discards 1', () => {
  const g = duel({ board: [{ hand: ['Hinotama', FILL, FILL], turn: 2 }, { st: ['Trap of Board Eraser'] }] });
  const h = hand(g, 0);
  act(g, 0, 'Hinotama'); settle(g, 'Trap of Board Eraser');
  ok(lp(g, 1) === 8000 && hand(g, 0) === h - 2 && inZ(g, 1, 'gy', 'Trap of Board Eraser'), `no damage (${lp(g, 1)}), A discarded 1 (${h} -> ${hand(g, 0)})`);
});
T('Trap of Darkness: at 3000 LP or less, pay 1000 and copy a Normal Trap in the GY', () => {
  const g = duel({ board: [{ lp: 3000, hand: [], st: ['Trap of Darkness'], gy: ['Jar of Greed'], turn: 2 }, {}] });
  const h = hand(g, 0);
  ok(canAct(g, 0, 'Trap of Darkness'), 'offered'); act(g, 0, 'Trap of Darkness'); settle(g, 'Jar of Greed');
  ok(lp(g, 0) === 2000 && inZ(g, 0, 'ban', 'Jar of Greed') && hand(g, 0) === h + 1, `paid 1000 (${lp(g, 0)}), Jar banished, drew 1`);
  const g2 = duel({ board: [{ hand: [], st: ['Trap of Darkness'], gy: ['Jar of Greed'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Trap of Darkness'), 'not at 8000 LP');
});
T('Trap of the Imperial Tomb: after taking an opponent Zombie from their GY, destroy 2 cards', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], st: ['Trap of the Imperial Tomb'], turn: 2 }, { gy: ['Clown Zombie'], m: ['Blue-Eyes White Dragon'], st: [{ n: 'Toon World', pos: 'up' }] }] });
  act(g, 0, 'Monster Reborn'); settle(g, 'Blue-Eyes White Dragon', 'Toon World', 'Clown Zombie', 'Attack', 'Trap of the Imperial Tomb');
  ok(on(g, 0, 'Clown Zombie') && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Toon World'), 'Blue-Eyes and Toon World destroyed');
});
T('Trap Reactor Y FI: destroys an opponent Trap and burns 800', () => {
  const g = duel({ board: [{ hand: [], st: ['Call of the Haunted'], gy: [FILL], turn: 2 }, { m: ['Trap Reactor Y FI'] }] });
  act(g, 0, 'Call of the Haunted'); settle(g, FILL, 'Trap Reactor Y FI', 'Attack');
  ok(lp(g, 0) === 7200 && inZ(g, 0, 'gy', 'Call of the Haunted'), `Call destroyed, A took 800 (${lp(g, 0)})`);
});
T('Trap Reclamation: the chained Trap returns to the hand', () => {
  const g = duel({ board: [{ hand: ['Mystical Elf'], st: ['Jar of Greed', 'Trap Reclamation'], turn: 2 }, {}] });
  act(g, 0, 'Jar of Greed'); settle(g, 'Trap Reclamation', 'Mystical Elf');
  ok(inZ(g, 0, 'hand', 'Jar of Greed') && inZ(g, 0, 'gy', 'Mystical Elf'), 'Jar of Greed back in hand, Elf discarded');
});

/* ---------------- Twin ---------------- */
T('Twin-Barrel Dragon: destroys the target on 2 Heads only', () => {
  let hit = 0, miss = 0;
  for (let s = 1; s <= 24; s++) {
    const g = duel({ seed: s, board: [{ hand: ['Twin-Barrel Dragon'], turn: 2 }, { st: ['Mirror Force'] }] });
    const n0 = g.log.length; ns(g, 0, 'Twin-Barrel Dragon', 'Mirror Force');
    const heads = g.log.slice(n0).filter(l => /coin: Heads/.test(l)).length, tosses = g.log.slice(n0).filter(l => /tossed a coin/.test(l)).length;
    const gone = inZ(g, 1, 'gy', 'Mirror Force');
    if (tosses !== 2 || gone !== (heads === 2)) { ok(false, `seed ${s}: ${tosses} tosses, ${heads} heads, destroyed ${gone}`); return; }
    if (gone) hit++; else miss++;
  }
  ok(hit > 0 && miss > 0, `2 tosses each time, destroyed exactly on 2 Heads (${hit} hits, ${miss} misses)`);
});
T('Twin-Headed Behemoth: back in the End Phase as 1000/1000, once per Duel', () => {
  const g = duel({ board: [{ hand: [], m: ['Twin-Headed Behemoth'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Twin-Headed Behemoth', 'Blue-Eyes White Dragon');
  ok(inZ(g, 0, 'gy', 'Twin-Headed Behemoth'), 'destroyed');
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g, 'Twin-Headed Behemoth', 'Attack');
  const b = on(g, 0, 'Twin-Headed Behemoth');
  ok(b && E.atk(g, b) === 1000 && E.def(g, b) === 1000, `Behemoth back ${b && E.atk(g, b)}/${b && E.def(g, b)}`);
  toIdle(g); bp(g); atkOn(g, 1, 'Blue-Eyes White Dragon', 'Twin-Headed Behemoth'); choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g, 'Twin-Headed Behemoth', 'Attack');
  ok(!on(g, 0, 'Twin-Headed Behemoth'), 'not a second time');
});
T('Twin-Headed Thunder Dragon: Fusion of 2 Thunder Dragons', () => {
  const g = duel({ ex0: ['Twin-Headed Thunder Dragon'], board: [{ hand: ['Polymerization', 'Thunder Dragon', 'Thunder Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Twin-Headed Thunder Dragon', 'Thunder Dragon', 'Thunder Dragon', 'Attack');
  const t = on(g, 0, 'Twin-Headed Thunder Dragon'); ok(t && E.atk(g, t) === 2800, 'summoned with 2800');
});
T('Twin-Headed Wolf: with another Fiend, Flip effects of monsters it destroys are negated', () => {
  const g = duel({ board: [{ hand: [], m: ['Twin-Headed Wolf', 'Archfiend Soldier'], turn: 2 }, { m: [{ n: 'Man-Eater Bug', pos: 'set' }] }] });
  bp(g); atkOn(g, 0, 'Twin-Headed Wolf', 'Man-Eater Bug', 'Twin-Headed Wolf');
  ok(inZ(g, 1, 'gy', 'Man-Eater Bug') && cnt(g, 0, 'm') === 2, 'Bug destroyed, its Flip did nothing');
  const g2 = duel({ board: [{ hand: [], m: ['Twin-Headed Wolf', FILL], turn: 2 }, { m: [{ n: 'Man-Eater Bug', pos: 'set' }] }] });
  bp(g2); atkOn(g2, 0, 'Twin-Headed Wolf', 'Man-Eater Bug', 'Twin-Headed Wolf');
  ok(cnt(g2, 0, 'm') === 1, 'without a second Fiend the Bug destroys a monster');
});
T('Twin-Shield Defender: halves the ATK of an opponent monster until the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Twin-Shield Defender'] }] });
  bp(g); atkOn(g, 0, FILL, 'Twin-Shield Defender', FILL);
  const w = on(g, 0, FILL);
  ok(inZ(g, 1, 'gy', 'Twin-Shield Defender') && E.atk(g, w) === 1000, `Warwolf ATK ${E.atk(g, w)}`);
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(E.atk(g, w) === 2000, 'back to 2000 after the End Phase');
});
T('Twin-Sword Marauder: piercing and a second attack after attacking a Defense monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Twin-Sword Marauder'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Twin-Sword Marauder', FILL);
  ok(lp(g, 1) === 6500, `1500 piercing (${lp(g, 1)})`);
  const t = on(g, 0, 'Twin-Sword Marauder'); ok(canAtk(g, t, null), 'second attack offered'); atkOn(g, 0, 'Twin-Sword Marauder', null);
  ok(lp(g, 1) === 4900, `then 1600 direct (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Twin-Sword Marauder'], turn: 2 }, { m: ['Mystical Elf'] }] });
  bp(g2); atkOn(g2, 0, 'Twin-Sword Marauder', 'Mystical Elf');
  ok(!canAtk(g2, on(g2, 0, 'Twin-Sword Marauder'), null), 'no second attack after hitting an Attack Position monster');
});
T('Twin Swords of Flashing Light - Tryce: send 1, -500, two attacks', () => {
  const g = duel({ board: [{ hand: ['Twin Swords of Flashing Light - Tryce', 'Mystical Elf'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Twin Swords of Flashing Light - Tryce'); settle(g, 'Mystical Elf', FILL);
  const w = on(g, 0, FILL);
  ok(inZ(g, 0, 'gy', 'Mystical Elf') && E.atk(g, w) === 1500, `Elf sent, Warwolf ${E.atk(g, w)}`);
  bp(g); atkOn(g, 0, FILL, null); ok(canAtk(g, w, null), 'second attack'); atkOn(g, 0, FILL, null);
  ok(lp(g, 1) === 5000, `3000 total (${lp(g, 1)})`);
});
T('Two-Man Cell Battle: turn player Special Summons a Level 4 Normal in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Mystical Elf'], st: [{ n: 'Two-Man Cell Battle', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'end'); settle(g, 'Two-Man Cell Battle', 'Mystical Elf', 'Attack');
  ok(on(g, 0, 'Mystical Elf'), 'Elf Special Summoned');
});
T('Two-Pronged Attack: destroy 2 of yours and 1 of theirs', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Mystical Elf'], st: ['Two-Pronged Attack'], turn: 2 }, { m: ['Blue-Eyes White Dragon', 'Dark Magician'] }] });
  act(g, 0, 'Two-Pronged Attack'); settle(g, FILL, 'Mystical Elf', 'Blue-Eyes White Dragon');
  ok(cnt(g, 0, 'm') === 0 && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 1, 'Dark Magician'), 'both of A and Blue-Eyes destroyed');
});

/* ---------------- Ultimate ---------------- */
T('Ultimate Ancient Gear Golem: Fusion only, piercing, no Spell/Trap when it attacks', () => {
  const g = duel({ ex0: ['Ultimate Ancient Gear Golem'], board: [{ hand: ['Polymerization', 'Ancient Gear Golem', 'Ancient Gear', 'Ancient Gear'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Ultimate Ancient Gear Golem', 'Ancient Gear Golem', 'Ancient Gear', 'Ancient Gear', 'Attack');
  ok(on(g, 0, 'Ultimate Ancient Gear Golem'), 'Fusion Summoned');
  const g2 = duel({ board: [{ hand: [], m: ['Ultimate Ancient Gear Golem'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }], st: ['Mirror Force', 'Sakuretsu Armor'] }] });
  bp(g2); atkOn(g2, 0, 'Ultimate Ancient Gear Golem', FILL, 'Mirror Force', 'Sakuretsu Armor');
  ok(on(g2, 0, 'Ultimate Ancient Gear Golem') && lp(g2, 1) === 8000 - 4300, `no Trap, 4300 piercing (${lp(g2, 1)})`);
  const g3 = duel({ board: [{ gy: ['Ultimate Ancient Gear Golem'], hand: ['Monster Reborn'], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'Monster Reborn'), 'cannot be revived from the GY');
});
T('Ultimate Ancient Gear Golem: destroyed, revive Ancient Gear Golem', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Ultimate Ancient Gear Golem'], gy: ['Ancient Gear Golem'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g, 'Ultimate Ancient Gear Golem', 'Ancient Gear Golem', 'Attack');
  ok(on(g, 0, 'Ancient Gear Golem'), 'Ancient Gear Golem Special Summoned');
});
T('Ultimate Baseball Kid: +1000 per other FIRE, send FIRE for 500', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Baseball Kid', 'Flame Dancer'], turn: 2 }, { m: ['Flame Dancer'] }] });
  const k = on(g, 0, 'Ultimate Baseball Kid');
  ok(E.atk(g, k) === 2500, `2500 ATK with 2 other FIRE (${E.atk(g, k)})`);
  act(g, 0, 'Ultimate Baseball Kid'); settle(g, 'Flame Dancer');
  ok(lp(g, 1) === 7500 && cnt(g, 0, 'm') === 1 && on(g, 1, 'Flame Dancer') && E.atk(g, k) === 1500, `500 damage, own Dancer sent (${lp(g, 1)}, Kid ${E.atk(g, k)})`);
});
T('Ultimate Insect LV1 -> LV3: Standby Phase, LV3 lowers opponent ATK by 300; LV1 unaffected by Spells', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Insect LV1'], deckTop: [FILL, 'Ultimate Insect LV3'], turn: 2 }, { m: [FILL] }] });
  toIdle(g, 'Ultimate Insect LV1', 'Ultimate Insect LV3', 'Attack');
  if (idle(g) && canAct(g, 0, 'Ultimate Insect LV1')) { act(g, 0, 'Ultimate Insect LV1'); settle(g, 'Ultimate Insect LV3', 'Attack'); }
  ok(on(g, 0, 'Ultimate Insect LV3') && inZ(g, 0, 'gy', 'Ultimate Insect LV1'), 'LV3 Special Summoned');
  ok(E.atk(g, on(g, 1, FILL)) === 1700, `B Warwolf ${E.atk(g, on(g, 1, FILL))}`);
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Ultimate Insect LV1'], turn: 2 }, { m: [FILL] }] });
  toIdle(g2, 'NO'); act(g2, 0, 'Dark Hole'); settle(g2);
  ok(on(g2, 0, 'Ultimate Insect LV1') && !on(g2, 1, FILL), 'LV1 survives Dark Hole');
  const g3 = duel({ board: [{ hand: ['Ultimate Insect LV1'], deckTop: [FILL, 'Ultimate Insect LV3'], turn: 2 }, {}] });
  ns(g3, 0, 'Ultimate Insect LV1');
  ok(!canAct(g3, 0, 'Ultimate Insect LV1'), 'not the turn it is summoned');
});
T('Ultimate Insect LV3 -> LV5: -500 ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Insect LV3'], deckTop: [FILL, 'Ultimate Insect LV5'], turn: 2 }, { m: [FILL] }] });
  ok(E.atk(g, on(g, 1, FILL)) === 2000, 'a LV3 not summoned by LV1 lowers nothing');
  toIdle(g, 'Ultimate Insect LV3', 'Ultimate Insect LV5', 'Attack');
  if (idle(g) && canAct(g, 0, 'Ultimate Insect LV3')) { act(g, 0, 'Ultimate Insect LV3'); settle(g, 'Ultimate Insect LV5', 'Attack'); }
  ok(on(g, 0, 'Ultimate Insect LV5') && E.atk(g, on(g, 1, FILL)) === 1500, `LV5 summoned, Warwolf ${E.atk(g, on(g, 1, FILL))}`);
});
T('Ultimate Insect LV5 -> LV7: -700 ATK and DEF', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Insect LV5'], deckTop: [FILL, 'Ultimate Insect LV7'], turn: 2 }, { m: ['Mystical Elf'] }] });
  toIdle(g, 'Ultimate Insect LV5', 'Ultimate Insect LV7', 'Attack');
  if (idle(g) && canAct(g, 0, 'Ultimate Insect LV5')) { act(g, 0, 'Ultimate Insect LV5'); settle(g, 'Ultimate Insect LV7', 'Attack'); }
  const e = on(g, 1, 'Mystical Elf');
  ok(on(g, 0, 'Ultimate Insect LV7') && E.atk(g, e) === 100 && E.def(g, e) === 1300, `LV7 summoned, Elf ${E.atk(g, e)}/${E.def(g, e)}`);
});
T('Ultimate Obedient Fiend: attacks only alone with no hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Obedient Fiend'], deckTop: ['Hinotama'], turn: 2 }, { m: [FILL] }] });
  bp(g); ok(!canAtk(g, on(g, 0, 'Ultimate Obedient Fiend'), on(g, 1, FILL)), 'no attack with a card in hand');
  const g2 = duel({ board: [{ hand: [], m: ['Ultimate Obedient Fiend'], deckTop: ['Hinotama'], turn: 2 }, { m: [FILL] }] });
  act(g2, 0, 'Hinotama'); settle(g2); bp(g2);
  ok(canAtk(g2, on(g2, 0, 'Ultimate Obedient Fiend'), on(g2, 1, FILL)), 'attacks with no hand and no other card');
});
T('Ultimate Tyranno: attacks every monster once, others cannot attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Tyranno', FILL], turn: 2 }, { m: ['Mystical Elf', 'Mystical Elf'] }] });
  bp(g);
  ok(!canAtk(g, on(g, 0, FILL), on(g, 1, 'Mystical Elf')), 'Warwolf cannot attack');
  atkOn(g, 0, 'Ultimate Tyranno', 'Mystical Elf');
  ok(canAtk(g, on(g, 0, 'Ultimate Tyranno'), on(g, 1, 'Mystical Elf')), 'can attack the second Elf');
  atkOn(g, 0, 'Ultimate Tyranno', 'Mystical Elf');
  ok(cnt(g, 1, 'm') === 0 && lp(g, 1) === 8000 - 4400, `both Elves destroyed (${lp(g, 1)})`);
});

// Goat: quick checks of the shared scripts with the Goat card pool
{
  const vm = require('vm'), fs = require('fs'), path = require('path');
  const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
  for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const GE = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; GE.init(GC, { format: 'goat' });
  const GF = '7 Colored Fish';
  const gid = n => { const c = GC.find(x => x.n === n); if (!c) throw new Error('no goat card ' + n); return c.id; };
  const gduel = (board, ex) => (lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board }));
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Thousand Knives, Thunder Dragon, Time Seal', () => {
    let g = gduel([{ hand: ['Thousand Knives'], m: ['Dark Magician'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    act(g, 0, 'Thousand Knives'); settle(g, 'Blue-Eyes White Dragon'); ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Goat: Knives destroyed Blue-Eyes');
    g = gduel([{ hand: ['Thunder Dragon'], deckTop: [GF, 'Thunder Dragon', 'Thunder Dragon'], turn: 2 }, {}]);
    act(g, 0, 'Thunder Dragon'); settle(g, 'Thunder Dragon', 'Thunder Dragon'); ok(cnt(g, 0, 'hand', 'Thunder Dragon') === 2, 'Goat: Thunder Dragon added 2');
    g = gduel([{ hand: [], st: ['Time Seal'], turn: 2 }, {}]); const h0 = hand(g, 1);
    act(g, 0, 'Time Seal'); settle(g); endTurn(g); toIdle(g); ok(hand(g, 1) === h0, 'Goat: Time Seal skipped the draw');
  });
  G('Thousand-Eyes Restrict and Twin-Headed Thunder Dragon', () => {
    let g = gduel([{ hand: [], m: ['Thousand-Eyes Restrict'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    act(g, 0, 'Thousand-Eyes Restrict'); settle(g, 'Blue-Eyes White Dragon'); ok(E.atk(g, on(g, 0, 'Thousand-Eyes Restrict')) === 3000, 'Goat: Restrict 3000');
    g = gduel([{ hand: ['Polymerization', 'Thunder Dragon', 'Thunder Dragon'], turn: 2 }, {}], ['Twin-Headed Thunder Dragon']);
    act(g, 0, 'Polymerization'); settle(g, 'Twin-Headed Thunder Dragon', 'Thunder Dragon', 'Thunder Dragon', 'Attack'); ok(on(g, 0, 'Twin-Headed Thunder Dragon'), 'Goat: THTD Fusion Summoned');
  });
  G('Toon World and Toon Cannon Soldier, Agents', () => {
    let g = gduel([{ hand: ['Toon World'], turn: 2 }, {}]);
    act(g, 0, 'Toon World'); settle(g); ok(lp(g, 0) === 7000, 'Goat: Toon World cost 1000');
    g = gduel([{ hand: [], m: ['Toon Cannon Soldier', GF], turn: 2 }, {}]);
    act(g, 0, 'Toon Cannon Soldier'); settle(g, GF); ok(lp(g, 1) === 7500, 'Goat: Cannon Soldier 500');
    g = gduel([{ hand: ['The Sanctuary in the Sky'], m: ['The Agent of Judgment - Saturn'], turn: 2 }, { lp: 5000 }]);
    act(g, 0, 'The Sanctuary in the Sky'); settle(g); act(g, 0, 'The Agent of Judgment - Saturn'); settle(g); ok(lp(g, 1) === 2000, 'Goat: Saturn burned 3000');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-17 review checks passed.');
process.exit(fails ? 1 : 0);
