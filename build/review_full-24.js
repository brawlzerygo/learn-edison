// Independent review checks for full pool batch 24 (written from the card text): node build/review_full-24.js
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

const EL = 'Mystical Elf', CG = 'Celtic Guardian', PEN = 'Penguin Soldier';
const pos = (g, p, n) => { const c = on(g, p, n); return c ? c.pos : null; };

/* ---------------- L ---------------- */
T('Labyrinth of Nightmare: each End Phase changes the turn player face-up monsters', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: [up('Labyrinth of Nightmare')], turn: 2 }, { m: [FILL] }] });
  endTurn(g); toIdle(g);
  ok(pos(g, 0, FILL) === 'def' && pos(g, 1, FILL) === 'atk', `A Warwolf to Defense in A End Phase, B stays (${pos(g, 0, FILL)}, ${pos(g, 1, FILL)})`);
  endTurn(g); toIdle(g);
  ok(pos(g, 1, FILL) === 'def' && pos(g, 0, FILL) === 'def', `B Warwolf to Defense in B End Phase (${pos(g, 1, FILL)})`);
});
T('Labyrinth Tank: Fusion of Giga-Tech Wolf + Cannon Soldier', () => {
  const g = duel({ ex0: ['Labyrinth Tank'], board: [{ hand: ['Polymerization', 'Giga-Tech Wolf', 'Cannon Soldier'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Labyrinth Tank', 'Giga-Tech Wolf', 'Cannon Soldier', 'Attack');
  const t = on(g, 0, 'Labyrinth Tank'); ok(t && E.atk(g, t) === 2400, 'Labyrinth Tank 2400 on the field');
});
T('Larvae Moth: no Normal Summon; Special Summon by Tributing a Petit Moth with Cocoon on the 2nd turn after', () => {
  const g = duel({ board: [{ hand: ['Cocoon of Evolution', 'Larvae Moth'], m: ['Petit Moth'], turn: 2 }, {}] });
  const lm = card(g, 0, 'Larvae Moth');
  ok(noSummon(g, lm), 'Larvae Moth cannot be Normal Summoned or Set, or Special Summoned yet');
  act(g, 0, 'Cocoon of Evolution'); settle(g);
  ok(cnt(g, 0, 'st', 'Cocoon of Evolution') === 1, 'Cocoon equipped');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(!hasOpt(g, 'sp:' + lm.u), 'not on the 1st turn after');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(hasOpt(g, 'sp:' + lm.u), 'offered on the 2nd turn after');
  choose(g, 'sp:' + lm.u); settle(g, 'Petit Moth', 'Attack');
  ok(on(g, 0, 'Larvae Moth') && inZ(g, 0, 'gy', 'Petit Moth'), 'Larvae Moth summoned, Petit Moth Tributed');
});
T('Laser Cannon Armor: Insect only, +300 ATK/DEF', () => {
  const g = duel({ board: [{ hand: ['Laser Cannon Armor'], m: ['Leghul'], turn: 2 }, {}] });
  act(g, 0, 'Laser Cannon Armor'); settle(g, 'Leghul');
  const l = on(g, 0, 'Leghul'); ok(E.atk(g, l) === 600 && E.def(g, l) === 650, `Leghul ${E.atk(g, l)}/${E.def(g, l)}`);
  const g2 = duel({ board: [{ hand: ['Laser Cannon Armor'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Laser Cannon Armor'), 'not offered without an Insect');
});
T('Legacy Hunter: destroys a face-down Defense monster, a random card goes back to the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Legacy Hunter'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  const h = hand(g, 1), d = g.p[1].deck.length;
  bp(g); atkOn(g, 0, 'Legacy Hunter', FILL); toIdle(g);
  ok(cnt(g, 1, 'm') === 0 && hand(g, 1) === h - 1 && g.p[1].deck.length === d + 1, `B hand ${h} to ${hand(g, 1)}, Deck ${d} to ${g.p[1].deck.length}`);
  const g2 = duel({ board: [{ hand: [], m: ['Legacy Hunter'], turn: 2 }, { m: [{ n: CG, pos: 'def' }] }] });
  const h2 = hand(g2, 1); bp(g2); atkOn(g2, 0, 'Legacy Hunter', CG); toIdle(g2);
  ok(hand(g2, 1) === h2, 'no effect on a face-up Defense monster');
});
T('Leghul: attacks directly while the opponent has monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Leghul'], turn: 2 }, { m: [FILL] }] });
  bp(g); const l = on(g, 0, 'Leghul'); ok(canAtk(g, l, null), 'direct attack offered');
  choose(g, `atk:${l.u}:d`); settle(g); ok(lp(g, 1) === 7700, `B LP ${lp(g, 1)}`);
});
T('Lekunga: banish 2 WATER from the GY for a 700/700 Attack Position token', () => {
  const g = duel({ board: [{ hand: [], m: ['Lekunga'], gy: [PEN, '7 Colored Fish'], turn: 2 }, {}] });
  act(g, 0, 'Lekunga'); settle(g, PEN, '7 Colored Fish');
  const t = on(g, 0, 'Lekunga Token');
  ok(t && t.pos === 'atk' && E.atk(g, t) === 700 && E.def(g, t) === 700 && cnt(g, 0, 'ban') === 2, 'token 700/700 in Attack, 2 banished');
  const g2 = duel({ board: [{ hand: [], m: ['Lekunga'], gy: [PEN], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Lekunga'), 'not offered with 1 WATER');
});
T('Life Absorbing Machine: gain half the LP paid last turn in the Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Premature Burial'], gy: [CG], st: [up('Life Absorbing Machine')], turn: 2 }, {}] });
  act(g, 0, 'Premature Burial'); settle(g, CG, 'Attack');
  ok(lp(g, 0) === 7200, `paid 800 (${lp(g, 0)})`);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(lp(g, 0) === 7600, `gained 400 in the next Standby Phase (${lp(g, 0)})`);
});
T('Lighten the Load: Level 7+ from the hand to the Deck, draw 1, once per turn', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon', 'Dark Magician'], st: [up('Lighten the Load')], turn: 2 }, {}] });
  const h = hand(g, 0);
  act(g, 0, 'Lighten the Load'); settle(g, 'Blue-Eyes White Dragon');
  ok(hand(g, 0) === h && !inZ(g, 0, 'hand', 'Blue-Eyes White Dragon'), 'Blue-Eyes shuffled in, 1 card drawn');
  ok(!canAct(g, 0, 'Lighten the Load'), 'not again this turn');
  const g2 = duel({ board: [{ hand: [CG], st: [up('Lighten the Load')], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Lighten the Load'), 'not offered with no Level 7+');
});
T('Lightforce Sword: banish a random card from the opponent hand, back on their 4th Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Lightforce Sword'], turn: 2 }, { hand: ['Pot of Greed'] }] });
  act(g, 0, 'Lightforce Sword'); settle(g);
  ok(hand(g, 1) === 0 && inZ(g, 1, 'ban', 'Pot of Greed'), 'Pot of Greed banished');
  for (let i = 0; i < 5; i++) { endTurn(g); toIdle(g); }
  ok(g.tp === 1 && g.turnNo === 7 && !inZ(g, 1, 'hand', 'Pot of Greed'), 'not back on the 3rd Standby');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 1 && inZ(g, 1, 'hand', 'Pot of Greed'), 'back in hand on the 4th Standby');
});
T('Lightning Blade: Warrior +800, WATER -500', () => {
  const g = duel({ board: [{ hand: ['Lightning Blade'], m: [CG], turn: 2 }, { m: ['7 Colored Fish'] }] });
  act(g, 0, 'Lightning Blade'); settle(g, CG);
  ok(E.atk(g, on(g, 0, CG)) === 2200 && E.atk(g, on(g, 1, '7 Colored Fish')) === 1300, 'Celtic 2200, Fish 1300');
  const g2 = duel({ board: [{ hand: ['Lightning Blade'], m: [EL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Lightning Blade'), 'not offered without a Warrior');
});
T('Little Chimera: FIRE +500, WATER -400', () => {
  const g = duel({ board: [{ hand: [], m: ['Little Chimera', 'Giga-Tech Wolf'], turn: 2 }, { m: ['7 Colored Fish', FILL] }] });
  ok(E.atk(g, on(g, 0, 'Little Chimera')) === 1100 && E.atk(g, on(g, 0, 'Giga-Tech Wolf')) === 1700, 'FIRE monsters +500');
  ok(E.atk(g, on(g, 1, '7 Colored Fish')) === 1400 && E.atk(g, on(g, 1, FILL)) === 2000, 'WATER -400, EARTH unchanged');
});
T('Little-Winguard: may change its position in your End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Little-Winguard'], turn: 2 }, {}] });
  endTurn(g); toIdle(g);
  ok(pos(g, 0, 'Little-Winguard') === 'def', `changed to Defense (${pos(g, 0, 'Little-Winguard')})`);
});
T('Lone Wolf: the only Monk Fighter cannot be destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Monk Fighter'], st: ['Lone Wolf'], turn: 2 }, { m: [FILL] }] });
  ok(canAct(g, 0, 'Lone Wolf'), 'Lone Wolf offered'); act(g, 0, 'Lone Wolf'); settle(g, 'Monk Fighter');
  bp(g); atkOn(g, 0, 'Monk Fighter', FILL); toIdle(g);
  ok(on(g, 0, 'Monk Fighter'), 'Monk Fighter survives the battle');
  const g2 = duel({ board: [{ hand: [], m: ['Monk Fighter', FILL], st: ['Lone Wolf'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Lone Wolf'), 'not offered with 2 monsters');
});
T('Lord of D.: Dragons on the field cannot be targeted', () => {
  const g = duel({ board: [{ hand: ['Change of Heart'], m: ['Lord of D.'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Change of Heart'); settle(g); ok(on(g, 1, 'Blue-Eyes White Dragon') && cnt(g, 0, 'm') === 1, 'Change of Heart cannot take Blue-Eyes');
  const g2 = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: ['Blue-Eyes White Dragon', 'Lord of D.'] }] });
  act(g2, 0, 'Change of Heart'); settle(g2, 'Lord of D.'); ok(on(g2, 0, 'Lord of D.') && on(g2, 1, 'Blue-Eyes White Dragon'), 'Change of Heart took Lord of D., not Blue-Eyes');
});
T('Lost Guardian: DEF = banished Rocks x 700', () => {
  const g = duel({ board: [{ hand: [], m: ['Lost Guardian'], ban: ['Giant Soldier of Stone', 'Giant Soldier of Stone', FILL], turn: 2 }, {}] });
  ok(E.def(g, on(g, 0, 'Lost Guardian')) === 1400, `DEF ${E.def(g, on(g, 0, 'Lost Guardian'))}`);
});
T('Luminous Soldier: +500 in the Damage Step against a DARK monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Luminous Soldier'], turn: 2 }, { m: ['Cannon Soldier'] }] });
  ok(E.atk(g, on(g, 0, 'Luminous Soldier')) === 2100, '2100 outside battle');
  bp(g); atkOn(g, 0, 'Luminous Soldier', 'Cannon Soldier'); toIdle(g);
  ok(lp(g, 1) === 8000 - 1200, `B took 1200 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Luminous Soldier'], turn: 2 }, { m: [FILL] }] });
  bp(g2); atkOn(g2, 0, 'Luminous Soldier', FILL); toIdle(g2); ok(lp(g2, 1) === 7900, `no bonus against EARTH (${lp(g2, 1)})`);
});
T('Luminous Spark: LIGHT +500 ATK, -400 DEF', () => {
  const g = duel({ board: [{ hand: ['Luminous Spark'], m: [EL, FILL], turn: 2 }, {}] });
  act(g, 0, 'Luminous Spark'); settle(g);
  const e = on(g, 0, EL); ok(E.atk(g, e) === 1300 && E.def(g, e) === 1600 && E.atk(g, on(g, 0, FILL)) === 2000, `Elf ${E.atk(g, e)}/${E.def(g, e)}`);
});

/* ---------------- M ---------------- */
T('Magician of Faith: FLIP, add a Spell from the GY', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Magician of Faith', pos: 'set' }], gy: ['Pot of Greed', CG], turn: 2 }, {}] });
  choose(g, 'flip:' + on(g, 0, 'Magician of Faith').u); settle(g, 'Pot of Greed');
  ok(inZ(g, 0, 'hand', 'Pot of Greed'), 'Pot of Greed added');
});
T("Magician's Circle: each player Special Summons a Spellcaster with 2000 or less ATK", () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], deckTop: [FILL, EL], turn: 2 }, { st: ["Magician's Circle"], deckTop: [EL] }] });
  bp(g); choose(g, `atk:${on(g, 0, 'Dark Magician').u}:d`); settle(g, "Magician's Circle", EL, 'Attack');
  ok(on(g, 0, EL) && (on(g, 1, EL) || inZ(g, 1, 'gy', EL)) && !g.p[1].deck.some(c => E.name(c) === EL), 'both players summoned a Mystical Elf');
});
T('Maha Vailo: +500 for each Equip Card', () => {
  const g = duel({ board: [{ hand: ['Black Pendant', 'Malevolent Nuzzler'], m: ['Maha Vailo'], turn: 2 }, {}] });
  act(g, 0, 'Black Pendant'); settle(g, 'Maha Vailo'); act(g, 0, 'Malevolent Nuzzler'); settle(g, 'Maha Vailo');
  ok(E.atk(g, on(g, 0, 'Maha Vailo')) === 1550 + 500 + 700 + 1000, `ATK ${E.atk(g, on(g, 0, 'Maha Vailo'))}`);
});
T('Maharaghi: returns to the hand in the End Phase; look at the top card in the next Draw Phase', () => {
  const g = duel({ board: [{ hand: ['Maharaghi'], deckTop: [FILL, 'Pot of Greed', 'Dark Hole'], turn: 2 }, {}] });
  ok(!noSummon(g, card(g, 0, 'Maharaghi')), 'can be Normal Summoned');
  ns(g, 0, 'Maharaghi', 'Attack');
  ok(on(g, 0, 'Maharaghi'), 'on the field');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Maharaghi'), 'back in hand after the End Phase');
  choose(g, 'end'); let seen = '';
  for (let i = 0; i < 20 && g.prompt && !idle(g); i++) { const pr = g.prompt; if (pr.p === 0 && pr.type !== 'respond') { seen += pr.text + ' :: ' + pr.opts.map(x => x.label).join(',') + '; ';
    const o = pr.opts.find(x => /bottom/i.test(x.label)); E.act(g, [o ? o.key : pr.opts[0].key]); } else settle(g); }
  ok(/bottom/i.test(seen) && !inZ(g, 0, 'hand', 'Pot of Greed') && inZ(g, 0, 'hand', 'Dark Hole'), `looked, put Pot at the bottom, drew Dark Hole (${seen})`);
});
T('Maiden of the Aqua: field treated as Umi (Mermaid Knight attacks twice), no stat change', () => {
  const g = duel({ board: [{ hand: [], m: ['Maiden of the Aqua', 'Mermaid Knight'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Mermaid Knight')) === 1500 && E.atk(g, on(g, 0, 'Maiden of the Aqua')) === 700, 'no Umi boost');
  bp(g); const k = on(g, 0, 'Mermaid Knight'); choose(g, `atk:${k.u}:d`); settle(g);
  ok(canAtk(g, k, null), 'Mermaid Knight may attack again'); choose(g, `atk:${k.u}:d`); settle(g);
  ok(lp(g, 1) === 8000 - 3000, `B LP ${lp(g, 1)}`);
});
T('Maji-Gire Panda: +500 when a Beast is destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Maji-Gire Panda', FILL], turn: 2 }, { m: ['Giant Rat'] }] });
  bp(g); atkOn(g, 0, FILL, 'Giant Rat'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Maji-Gire Panda')) === 1500, `Panda ${E.atk(g, on(g, 0, 'Maji-Gire Panda'))}`);
});
T('Major Riot: after a bounce by the opponent, all monsters return and each Sets the same number', () => {
  const g = duel({ first: 1, board: [{ m: [FILL, EL], st: ['Major Riot'], turn: 2 }, { hand: [], m: [{ n: PEN, pos: 'set' }] }] });
  choose(g, 'flip:' + on(g, 1, PEN).u); settle(g, FILL, 'Major Riot');
  toIdle(g, 'Major Riot');
  const setA = g.p[0].m.filter(c => c && c.pos === 'set').length, setB = g.p[1].m.filter(c => c && c.pos === 'set').length;
  ok(cnt(g, 0, 'm') === 1 && setA === 1 && cnt(g, 1, 'm') === 1 && setB === 1, `A ${cnt(g, 0, 'm')} (${setA} set), B ${cnt(g, 1, 'm')} (${setB} set)`);
});
T('Maju Garzett: ATK = the 2 Tributes original ATK', () => {
  const g = duel({ board: [{ hand: ['Maju Garzett'], m: [FILL, EL], turn: 2 }, {}] });
  ns(g, 0, 'Maju Garzett', FILL, EL, 'Attack');
  ok(E.atk(g, on(g, 0, 'Maju Garzett')) === 2800, `ATK ${E.atk(g, on(g, 0, 'Maju Garzett'))}`);
});
T('Makyura the Destructor: after it goes to the GY, Traps can be activated from the hand', () => {
  const g = duel({ board: [{ hand: ['Jar of Greed'], m: ['Makyura the Destructor'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ok(!canAct(g, 0, 'Jar of Greed'), 'not before');
  bp(g); atkOn(g, 0, 'Makyura the Destructor', 'Blue-Eyes White Dragon'); toIdle(g);
  choose(g, 'endbp'); settle(g);
  ok(canAct(g, 0, 'Jar of Greed'), 'Jar of Greed activatable from the hand');
  const h = hand(g, 0); act(g, 0, 'Jar of Greed'); settle(g); ok(hand(g, 0) === h + 1 && inZ(g, 0, 'gy', 'Jar of Greed'), 'Jar resolved, drew 1');
});
T("Man-Thro' Tro': Tribute a Normal Monster for 800 damage", () => {
  const g = duel({ board: [{ hand: [], m: ["Man-Thro' Tro'", FILL], turn: 2 }, {}] });
  act(g, 0, "Man-Thro' Tro'"); settle(g, FILL);
  ok(lp(g, 1) === 7200 && inZ(g, 0, 'gy', FILL), `B LP ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: [], m: ["Man-Thro' Tro'", 'Sangan'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, "Man-Thro' Tro'"), 'not offered with no Normal Monster');
});
T('Manga Ryu-Ran: Special Summon with Toon World and 2 Tributes; pays 500 to attack, attacks directly', () => {
  const g = duel({ board: [{ hand: ['Manga Ryu-Ran'], m: [FILL, EL], st: [up('Toon World')], turn: 2 }, {}] });
  const mr = card(g, 0, 'Manga Ryu-Ran'); ok(!hasOpt(g, 'ns:' + mr.u) && hasOpt(g, 'sp:' + mr.u), 'no Normal Summon, Special Summon offered');
  choose(g, 'sp:' + mr.u); settle(g, FILL, EL, 'Attack');
  ok(on(g, 0, 'Manga Ryu-Ran') && cnt(g, 0, 'm') === 1, 'summoned with 2 Tributes');
  bp(g); ok(!canAtk(g, on(g, 0, 'Manga Ryu-Ran'), null), 'cannot attack the turn it is summoned');
  const g2 = duel({ board: [{ hand: [], m: ['Manga Ryu-Ran'], st: [up('Toon World')], turn: 2 }, { m: [FILL] }] });
  bp(g2); const m = on(g2, 0, 'Manga Ryu-Ran'); ok(canAtk(g2, m, null), 'direct attack offered');
  choose(g2, `atk:${m.u}:d`); settle(g2); ok(lp(g2, 0) === 7500 && lp(g2, 1) === 5800, `A ${lp(g2, 0)}, B ${lp(g2, 1)}`);
  const g3 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Manga Ryu-Ran'], st: [up('Toon World')], turn: 2 }, {}] });
  act(g3, 0, 'Mystical Space Typhoon'); settle(g3, 'Toon World'); ok(!on(g3, 0, 'Manga Ryu-Ran'), 'destroyed with Toon World');
});
T('Manticore of Darkness: End Phase revival by sending a Beast-Warrior', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Manticore of Darkness'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Manticore of Darkness', 'Blue-Eyes White Dragon'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Manticore of Darkness'), 'Manticore destroyed');
  endTurn(g, FILL);
  ok(on(g, 0, 'Manticore of Darkness') && inZ(g, 0, 'gy', FILL) && hand(g, 0) === 1, 'Manticore back, Warwolf sent from the hand');
});
T('Marauding Captain: Special Summon a Level 4 or lower; other Warriors cannot be attacked', () => {
  const g = duel({ board: [{ hand: ['Marauding Captain', CG], turn: 2 }, {}] });
  ns(g, 0, 'Marauding Captain', CG, 'Attack');
  ok(on(g, 0, 'Marauding Captain') && on(g, 0, CG), 'Celtic Guardian Special Summoned');
  const g2 = duel({ first: 1, board: [{ m: ['Marauding Captain', CG, EL], turn: 2 }, { hand: [], m: [FILL] }] });
  bp(g2); const a = on(g2, 1, FILL);
  ok(canAtk(g2, a, on(g2, 0, 'Marauding Captain')) && !canAtk(g2, a, on(g2, 0, CG)) && canAtk(g2, a, on(g2, 0, EL)), 'only the Captain or non-Warriors can be attacked');
});
T('Maryokutai: Tribute it to negate and destroy a Spell on the opponent turn', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { m: ['Maryokutai'] }] });
  act(g, 0, 'Pot of Greed'); settle(g, 'Maryokutai');
  ok(hand(g, 0) === 1 && inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 1, 'gy', 'Maryokutai'), `Pot negated (hand ${hand(g, 0)})`);
});
T('Mass Driver: Tribute a monster for 400 damage, repeatable', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, EL], st: [up('Mass Driver')], turn: 2 }, {}] });
  act(g, 0, 'Mass Driver'); settle(g, FILL); ok(lp(g, 1) === 7600 && inZ(g, 0, 'gy', FILL), `400 (${lp(g, 1)})`);
  ok(canAct(g, 0, 'Mass Driver'), 'again the same turn'); act(g, 0, 'Mass Driver'); settle(g, EL); ok(lp(g, 1) === 7200, `800 total (${lp(g, 1)})`);
});
T('Mataza the Zapper: two attacks; control cannot switch', () => {
  const g = duel({ board: [{ hand: [], m: ['Mataza the Zapper'], turn: 2 }, {}] });
  bp(g); const m = on(g, 0, 'Mataza the Zapper'); choose(g, `atk:${m.u}:d`); settle(g); choose(g, `atk:${m.u}:d`); settle(g);
  ok(lp(g, 1) === 8000 - 2600, `B LP ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: ['Mataza the Zapper'] }] });
  act(g2, 0, 'Change of Heart'); settle(g2, 'Mataza the Zapper'); toIdle(g2); ok(on(g2, 1, 'Mataza the Zapper') && !on(g2, 0, 'Mataza the Zapper'), 'Change of Heart cannot take Mataza');
});
T('Mazera DeVille: Tribute Warrior of Zera with Pandemonium; opponent discards 3 random', () => {
  const g = duel({ board: [{ hand: ['Pandemonium', 'Mazera DeVille'], m: ['Warrior of Zera'], turn: 2 }, {}] });
  const mz = card(g, 0, 'Mazera DeVille'); ok(!hasOpt(g, 'ns:' + mz.u) && !hasOpt(g, 'sp:' + mz.u), 'not without Pandemonium');
  act(g, 0, 'Pandemonium'); settle(g);
  choose(g, 'sp:' + mz.u); settle(g, 'Warrior of Zera', 'Attack');
  ok(on(g, 0, 'Mazera DeVille') && hand(g, 1) === 2, `Mazera summoned, B hand ${hand(g, 1)}`);
});
T('Mecha-Dog Marron: battle 1000 to both; other destruction 1000 to the opponent', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Mecha-Dog Marron'] }] });
  bp(g); atkOn(g, 0, FILL, 'Mecha-Dog Marron'); toIdle(g);
  ok(lp(g, 0) === 7000 && lp(g, 1) === 6000, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ['Mecha-Dog Marron'] }] });
  act(g2, 0, 'Dark Hole'); toIdle(g2); ok(lp(g2, 0) === 7000 && lp(g2, 1) === 8000, `Dark Hole: A ${lp(g2, 0)}, B ${lp(g2, 1)}`);
});
T('Medusa Worm: Flip Summon destroys a monster; flips itself face-down once per turn', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Medusa Worm', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'flip:' + on(g, 0, 'Medusa Worm').u); settle(g, FILL);
  ok(cnt(g, 1, 'm') === 0, 'Warwolf destroyed');
  const g2 = duel({ board: [{ hand: [], m: ['Medusa Worm'], turn: 2 }, {}] });
  act(g2, 0, 'Medusa Worm'); settle(g2); ok(pos(g2, 0, 'Medusa Worm') === 'set', 'flipped face-down');
});
T('Mefist the Infernal General: piercing, and a random discard on battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Mefist the Infernal General'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  const h = hand(g, 1); bp(g); atkOn(g, 0, 'Mefist the Infernal General', FILL); toIdle(g);
  ok(lp(g, 1) === 8000 - 1700 && hand(g, 1) === h - 1, `B LP ${lp(g, 1)}, hand ${h} to ${hand(g, 1)}`);
});
T('Mega Ton Magical Cannon: remove 10 Spell Counters, destroy all the opponent cards', () => {
  const g = duel({ board: [{ hand: ['Mega Ton Magical Cannon', 'Pot of Greed'], m: ['Royal Magical Library'], turn: 2 }, { m: [FILL, EL], st: ['Mirror Force'] }] });
  ok(!canAct(g, 0, 'Mega Ton Magical Cannon'), 'not offered with no counters');
  E.lib.addCtr(g, on(g, 0, 'Royal Magical Library'), 'spell', 10); choose(g, 'setst:' + card(g, 0, 'Pot of Greed').u); settle(g);
  ok(canAct(g, 0, 'Mega Ton Magical Cannon'), 'offered with 10 counters'); act(g, 0, 'Mega Ton Magical Cannon'); settle(g);
  ok(cnt(g, 1, 'm') === 0 && cnt(g, 1, 'st') === 0 && E.lib.ctr(on(g, 0, 'Royal Magical Library'), 'spell') <= 1, 'opponent field cleared, counters removed (Library then gets 1 for the Spell)');
});
T('Megamorph: double when your LP is lower, half when higher', () => {
  const g = duel({ board: [{ lp: 4000, hand: ['Megamorph'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Megamorph'); settle(g, FILL); ok(E.atk(g, on(g, 0, FILL)) === 4000, `doubled ${E.atk(g, on(g, 0, FILL))}`);
  const g2 = duel({ board: [{ hand: ['Megamorph'], m: [FILL], turn: 2 }, { lp: 4000 }] });
  act(g2, 0, 'Megamorph'); settle(g2, FILL); ok(E.atk(g2, on(g2, 0, FILL)) === 1000, `halved ${E.atk(g2, on(g2, 0, FILL))}`);
});
T('Megarock Dragon: banish Rocks from the GY, ATK/DEF 700 each', () => {
  const g = duel({ board: [{ hand: ['Megarock Dragon'], gy: ['Giant Soldier of Stone', 'Giant Soldier of Stone', 'Mine Golem'], turn: 2 }, {}] });
  const md = card(g, 0, 'Megarock Dragon'); ok(!hasOpt(g, 'ns:' + md.u) && hasOpt(g, 'sp:' + md.u), 'Special Summon only');
  choose(g, 'sp:' + md.u); settle(g, 'Giant Soldier of Stone', 'Giant Soldier of Stone', 'Mine Golem', 'Attack');
  const m = on(g, 0, 'Megarock Dragon'); ok(m && E.atk(g, m) === 700 * cnt(g, 0, 'ban') && cnt(g, 0, 'ban') >= 1 && E.def(g, m) === E.atk(g, m), `ATK ${m && E.atk(g, m)} for ${cnt(g, 0, 'ban')} banished`);
  const g2 = duel({ board: [{ hand: ['Megarock Dragon'], turn: 2 }, {}] }); ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Megarock Dragon').u), 'not with no Rock in the GY');
});
T('Mermaid Knight: attacks twice only with Umi', () => {
  const g = duel({ board: [{ hand: ['Umi'], m: ['Mermaid Knight'], turn: 2 }, {}] });
  act(g, 0, 'Umi'); settle(g); bp(g); const k = on(g, 0, 'Mermaid Knight');
  choose(g, `atk:${k.u}:d`); settle(g); ok(canAtk(g, k, null), 'second attack with Umi');
  const g2 = duel({ board: [{ hand: [], m: ['Mermaid Knight'], turn: 2 }, {}] });
  bp(g2); const k2 = on(g2, 0, 'Mermaid Knight'); choose(g2, `atk:${k2.u}:d`); settle(g2); ok(!canAtk(g2, k2, null), 'one attack without Umi');
});
T('Metalmorph: +300 ATK/DEF, half the target ATK when attacking', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Metalmorph'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Metalmorph'); settle(g, FILL);
  const w = on(g, 0, FILL); ok(E.atk(g, w) === 2300 && E.def(g, w) === 400, `${E.atk(g, w)}/${E.def(g, w)}`);
  bp(g); atkOn(g, 0, FILL, 'Blue-Eyes White Dragon'); toIdle(g);
  ok(!on(g, 1, 'Blue-Eyes White Dragon') && lp(g, 1) === 7200, `Blue-Eyes destroyed, B LP ${lp(g, 1)}`);
});
T('Metalsilver Armor: the opponent can only target the equipped monster', () => {
  const g = duel({ board: [{ hand: ['Metalsilver Armor'], m: [FILL, EL], turn: 2 }, { hand: ['Change of Heart'] }] });
  act(g, 0, 'Metalsilver Armor'); settle(g, FILL);
  endTurn(g); toIdle(g); act(g, 1, 'Change of Heart'); settle(g, EL); toIdle(g);
  ok(on(g, 1, FILL) && on(g, 0, EL), 'B could only take the equipped Warwolf');
});
T('Metalzoa: Special Summoned from the Deck by Tributing Zoa equipped with Metalmorph', () => {
  const g = duel({ board: [{ hand: [], m: ['Zoa'], st: ['Metalmorph'], deckTop: [FILL, 'Metalzoa'], turn: 2 }, {}] });
  act(g, 0, 'Metalmorph'); settle(g, 'Zoa');
  bp(g); choose(g, 'endbp'); settle(g, 'Metalzoa', 'Attack'); toIdle(g, 'Metalzoa', 'Attack');
  ok(on(g, 0, 'Metalzoa') && inZ(g, 0, 'gy', 'Zoa'), 'Metalzoa summoned (offered at the end of the Battle Phase), Zoa Tributed');
  const g2 = duel({ board: [{ hand: ['Metalzoa'], m: [FILL], turn: 2 }, {}] }); ok(noSummon(g2, card(g2, 0, 'Metalzoa')), 'no Normal Summon from the hand');
});
T('Metamorphosis: Tribute a monster for a Fusion of the same Level', () => {
  const g = duel({ ex0: ['Fusionist', 'Labyrinth Tank'], board: [{ hand: ['Metamorphosis'], m: ['Giant Soldier of Stone'], turn: 2 }, {}] });
  act(g, 0, 'Metamorphosis'); settle(g, 'Giant Soldier of Stone', 'Fusionist', 'Attack');
  ok(on(g, 0, 'Fusionist') && inZ(g, 0, 'gy', 'Giant Soldier of Stone'), 'Fusionist summoned');
  const g2 = duel({ ex0: ['Labyrinth Tank'], board: [{ hand: ['Metamorphosis'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Metamorphosis'), 'not offered with no Fusion of that Level');
});
T('Meteor of Destruction: 1000 only if the opponent has more than 3000', () => {
  const g = duel({ board: [{ hand: ['Meteor of Destruction'], turn: 2 }, {}] });
  act(g, 0, 'Meteor of Destruction'); settle(g); ok(lp(g, 1) === 7000, `B LP ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Meteor of Destruction'], turn: 2 }, { lp: 3000 }] });
  ok(!canAct(g2, 0, 'Meteor of Destruction'), 'not offered at 3000');
});
T('Meteorain: piercing for your monsters this turn', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Meteorain'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  act(g, 0, 'Meteorain'); settle(g); bp(g); atkOn(g, 0, FILL, FILL); toIdle(g);
  ok(lp(g, 1) === 8000 - 1900, `B LP ${lp(g, 1)}`);
});
T('Michizure: when your monster goes to the GY, destroy a monster', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [EL], st: ['Michizure'] }] });
  bp(g); atkOn(g, 0, FILL, EL, 'Michizure', FILL); toIdle(g, 'Michizure', FILL);
  ok(inZ(g, 1, 'gy', EL) && inZ(g, 1, 'gy', 'Michizure') && !on(g, 0, FILL), 'Warwolf destroyed by Michizure');
});
T('Micro Ray: DEF becomes 0 this turn', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Micro Ray'], turn: 2 }, { m: [{ n: EL, pos: 'def' }] }] });
  act(g, 0, 'Micro Ray'); settle(g, EL); ok(E.def(g, on(g, 1, EL)) === 0, 'Elf DEF 0');
  endTurn(g); toIdle(g); ok(E.def(g, on(g, 1, EL)) === 2000, 'back to 2000 next turn');
});
T('Mid Shield Gardna: flips face-down; negates a Spell that targets it face-down', () => {
  const g = duel({ board: [{ hand: [], m: ['Mid Shield Gardna'], turn: 2 }, {}] });
  act(g, 0, 'Mid Shield Gardna'); settle(g); ok(pos(g, 0, 'Mid Shield Gardna') === 'set', 'flipped face-down');
  const g2 = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: [{ n: 'Mid Shield Gardna', pos: 'set' }] }] });
  act(g2, 0, 'Change of Heart'); settle(g2, 'Mid Shield Gardna'); toIdle(g2);
  ok(on(g2, 1, 'Mid Shield Gardna') && pos(g2, 1, 'Mid Shield Gardna') === 'def' && inZ(g2, 0, 'gy', 'Change of Heart'), `negated, Gardna face-up Defense (${pos(g2, 1, 'Mid Shield Gardna')})`);
});
T('Millennium Scorpion: +500 when it destroys a monster by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Millennium Scorpion'], turn: 2 }, { m: [EL] }] });
  bp(g); atkOn(g, 0, 'Millennium Scorpion', EL); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Millennium Scorpion')) === 2500, `ATK ${E.atk(g, on(g, 0, 'Millennium Scorpion'))}`);
});
T('Milus Radiant: EARTH +500, WIND -400', () => {
  const g = duel({ board: [{ hand: [], m: ['Milus Radiant', FILL], turn: 2 }, { m: ['Harpie Lady', EL] }] });
  ok(E.atk(g, on(g, 0, FILL)) === 2500 && E.atk(g, on(g, 0, 'Milus Radiant')) === 800, 'EARTH +500');
  ok(E.atk(g, on(g, 1, 'Harpie Lady')) === 900 && E.atk(g, on(g, 1, EL)) === 800, 'WIND -400, LIGHT unchanged');
});
T('Minar: discarded by the opponent card, 1000 to the opponent', () => {
  const g = duel({ board: [{ hand: ['Confiscation'], turn: 2 }, { hand: ['Minar'] }] });
  act(g, 0, 'Confiscation'); settle(g, 'Minar'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Minar') && lp(g, 0) === 6000, `A LP ${lp(g, 0)} (1000 cost + 1000)`);
});
T('Mine Golem: destroyed by battle, 500 to the opponent', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Mine Golem'] }] });
  bp(g); atkOn(g, 0, FILL, 'Mine Golem'); toIdle(g);
  ok(lp(g, 0) === 7500 && lp(g, 1) === 7000, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
});
T('Minefield Eruption: 1000 per face-up Mine Golem, then destroy them', () => {
  const g = duel({ board: [{ hand: [], m: ['Mine Golem', 'Mine Golem', { n: 'Mine Golem', pos: 'set' }], st: ['Minefield Eruption'], turn: 2 }, {}] });
  act(g, 0, 'Minefield Eruption'); settle(g); toIdle(g);
  ok(lp(g, 1) === 6000 && cnt(g, 0, 'm') === 1 && cnt(g, 0, 'gy', 'Mine Golem') === 2, `B LP ${lp(g, 1)}, ${cnt(g, 0, 'm')} left`);
});
T('Minor Goblin Official: only at 3000 or less; 500 each opponent Standby', () => {
  const g = duel({ board: [{ hand: [], st: ['Minor Goblin Official'], turn: 2 }, { lp: 3000 }] });
  act(g, 0, 'Minor Goblin Official'); settle(g); endTurn(g); toIdle(g);
  ok(lp(g, 1) === 2500, `B LP ${lp(g, 1)}`);
  endTurn(g); toIdle(g); ok(lp(g, 1) === 2500, 'nothing in A Standby');
  const g2 = duel({ board: [{ hand: [], st: ['Minor Goblin Official'], turn: 2 }, { lp: 3100 }] });
  ok(!canAct(g2, 0, 'Minor Goblin Official'), 'not at 3100');
});
T('Mispolymerization: a Fusion Summon is answered by returning Fusions to the Extra Deck', () => {
  const g = duel({ ex0: ['Labyrinth Tank'], board: [{ hand: ['Polymerization', 'Giga-Tech Wolf', 'Cannon Soldier'], turn: 2 }, { st: ['Mispolymerization'] }] });
  act(g, 0, 'Polymerization'); settle(g, 'Labyrinth Tank', 'Giga-Tech Wolf', 'Cannon Soldier', 'Attack', 'Mispolymerization'); toIdle(g, 'Mispolymerization');
  ok(!on(g, 0, 'Labyrinth Tank') && inZ(g, 0, 'extra', 'Labyrinth Tank') && inZ(g, 1, 'gy', 'Mispolymerization'), 'Labyrinth Tank back in the Extra Deck');
});
T('Moai Interceptor Cannons: flips itself face-down once per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Moai Interceptor Cannons'], turn: 2 }, {}] });
  act(g, 0, 'Moai Interceptor Cannons'); settle(g); ok(pos(g, 0, 'Moai Interceptor Cannons') === 'set', 'flipped face-down');
  ok(!canAct(g, 0, 'Moai Interceptor Cannons'), 'not again');
});

// Goat: the shared scripts (and the Goat-only ones that take priority there) with the Goat card pool
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
  G('Lesser Fiend banishes what it destroys by battle', () => {
    const g = gduel([{ hand: [], m: ['Lesser Fiend'], turn: 2 }, { m: [GF] }]);
    bp(g); atkOn(g, 0, 'Lesser Fiend', GF); toIdle(g);
    ok(inZ(g, 1, 'ban', GF) && !inZ(g, 1, 'gy', GF) && lp(g, 1) === 7700, `Fish banished, B LP ${lp(g, 1)}`);
  });
  G('Labyrinth Tank Fusion, Leghul direct, Lekunga token', () => {
    let g = gduel([{ hand: ['Polymerization', 'Giga-Tech Wolf', 'Cannon Soldier'], turn: 2 }, {}], ['Labyrinth Tank']);
    act(g, 0, 'Polymerization'); settle(g, 'Labyrinth Tank', 'Giga-Tech Wolf', 'Cannon Soldier', 'Attack'); ok(on(g, 0, 'Labyrinth Tank'), 'Goat: Labyrinth Tank summoned');
    g = gduel([{ hand: [], m: ['Leghul'], turn: 2 }, { m: [GF] }]); bp(g); const l = on(g, 0, 'Leghul'); choose(g, `atk:${l.u}:d`); settle(g); ok(lp(g, 1) === 7700, 'Goat: Leghul direct');
    g = gduel([{ hand: [], m: ['Lekunga'], gy: [GF, GF], turn: 2 }, {}]); act(g, 0, 'Lekunga'); settle(g, GF, GF); ok(on(g, 0, 'Lekunga Token') && cnt(g, 0, 'ban') === 2, 'Goat: Lekunga token');
  });
  G('Laser Cannon Armor, Lightning Blade, Maha Vailo, Milus Radiant', () => {
    let g = gduel([{ hand: ['Laser Cannon Armor'], m: ['Leghul'], turn: 2 }, {}]); act(g, 0, 'Laser Cannon Armor'); settle(g, 'Leghul'); ok(E.atk(g, on(g, 0, 'Leghul')) === 600, 'Goat: Laser Cannon Armor +300');
    g = gduel([{ hand: ['Lightning Blade'], m: [CG], turn: 2 }, { m: [GF] }]); act(g, 0, 'Lightning Blade'); settle(g, CG);
    ok(E.atk(g, on(g, 0, CG)) === 2200 && E.atk(g, on(g, 1, GF)) === 1300, 'Goat: Lightning Blade +800 and WATER -500');
    g = gduel([{ hand: ['Axe of Despair'], m: ['Maha Vailo'], turn: 2 }, {}]); act(g, 0, 'Axe of Despair'); settle(g, 'Maha Vailo'); ok(E.atk(g, on(g, 0, 'Maha Vailo')) === 3050, `Goat: Maha Vailo ${E.atk(g, on(g, 0, 'Maha Vailo'))}`);
    g = gduel([{ hand: [], m: ['Milus Radiant', CG], turn: 2 }, { m: ['Harpie Lady'] }]); ok(E.atk(g, on(g, 0, CG)) === 1900 && E.atk(g, on(g, 1, 'Harpie Lady')) === 900, 'Goat: Milus Radiant');
  });
  G('Lightforce Sword, Lord of D., Magician of Faith', () => {
    let g = gduel([{ hand: [], st: ['Lightforce Sword'], turn: 2 }, { hand: ['Pot of Greed'] }]); act(g, 0, 'Lightforce Sword'); settle(g); ok(inZ(g, 1, 'ban', 'Pot of Greed'), 'Goat: Lightforce Sword banished');
    g = gduel([{ hand: ['Change of Heart'], m: ['Lord of D.'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]); act(g, 0, 'Change of Heart'); settle(g); toIdle(g); ok(on(g, 1, 'Blue-Eyes White Dragon'), 'Goat: Lord of D. protects Blue-Eyes');
    g = gduel([{ hand: [], m: [{ n: 'Magician of Faith', pos: 'set' }], gy: ['Pot of Greed'], turn: 2 }, {}]); choose(g, 'flip:' + on(g, 0, 'Magician of Faith').u); settle(g, 'Pot of Greed'); ok(inZ(g, 0, 'hand', 'Pot of Greed'), 'Goat: Magician of Faith');
  });
  G('Makyura, Mass Driver, Mataza', () => {
    let g = gduel([{ hand: ['Jar of Greed'], m: ['Makyura the Destructor'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    bp(g); atkOn(g, 0, 'Makyura the Destructor', 'Blue-Eyes White Dragon'); toIdle(g); choose(g, 'endbp'); settle(g); ok(canAct(g, 0, 'Jar of Greed'), 'Goat: Makyura lets Jar of Greed activate from the hand');
    g = gduel([{ hand: [], m: [GF, GF], st: [up('Mass Driver')], turn: 2 }, {}]); act(g, 0, 'Mass Driver'); settle(g, GF); act(g, 0, 'Mass Driver'); settle(g, GF); ok(lp(g, 1) === 7200, 'Goat: Mass Driver twice');
    g = gduel([{ hand: [], m: ['Mataza the Zapper'], turn: 2 }, {}]); bp(g); const m = on(g, 0, 'Mataza the Zapper'); choose(g, `atk:${m.u}:d`); settle(g); choose(g, `atk:${m.u}:d`); settle(g); ok(lp(g, 1) === 5400, 'Goat: Mataza twice');
    g = gduel([{ hand: ['Change of Heart'], turn: 2 }, { m: ['Mataza the Zapper'] }]); act(g, 0, 'Change of Heart'); settle(g, 'Mataza the Zapper'); toIdle(g); ok(on(g, 1, 'Mataza the Zapper'), 'Goat: Mataza cannot switch control');
  });
  G('Megamorph, Metalmorph, Metamorphosis, Meteor of Destruction', () => {
    let g = gduel([{ lp: 4000, hand: ['Megamorph'], m: [GF], turn: 2 }, {}]); act(g, 0, 'Megamorph'); settle(g, GF); ok(E.atk(g, on(g, 0, GF)) === 3600, 'Goat: Megamorph doubles');
    g = gduel([{ hand: [], m: [GF], st: ['Metalmorph'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]); act(g, 0, 'Metalmorph'); settle(g, GF);
    bp(g); atkOn(g, 0, GF, 'Blue-Eyes White Dragon'); toIdle(g); ok(!on(g, 1, 'Blue-Eyes White Dragon') && lp(g, 1) === 7400, `Goat: Metalmorph attack bonus (B ${lp(g, 1)})`);
    g = gduel([{ hand: ['Metamorphosis'], m: ['Giant Soldier of Stone'], turn: 2 }, {}], ['Fusionist']); act(g, 0, 'Metamorphosis'); settle(g, 'Giant Soldier of Stone', 'Fusionist', 'Attack'); ok(on(g, 0, 'Fusionist'), 'Goat: Metamorphosis');
    g = gduel([{ hand: ['Meteor of Destruction'], turn: 2 }, {}]); act(g, 0, 'Meteor of Destruction'); settle(g); ok(lp(g, 1) === 7000, 'Goat: Meteor 1000');
  });
  G('Manga Ryu-Ran and Metalzoa', () => {
    let g = gduel([{ hand: ['Manga Ryu-Ran'], m: [GF, GF], st: [up('Toon World')], turn: 2 }, {}]); const mr = card(g, 0, 'Manga Ryu-Ran');
    ok(hasOpt(g, 'sp:' + mr.u), 'Goat: Manga Ryu-Ran Special Summon offered'); choose(g, 'sp:' + mr.u); settle(g, GF, GF, 'Attack'); ok(on(g, 0, 'Manga Ryu-Ran'), 'Goat: summoned');
    g = gduel([{ hand: [], m: ['Zoa'], st: ['Metalmorph'], deckTop: [GF, 'Metalzoa'], turn: 2 }, {}]); act(g, 0, 'Metalmorph'); settle(g, 'Zoa');
    bp(g); choose(g, 'endbp'); settle(g, 'Metalzoa', 'Attack'); toIdle(g, 'Metalzoa', 'Attack');
    ok(on(g, 0, 'Metalzoa'), 'Goat: Metalzoa summoned from the Deck');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-24 review checks passed.');
process.exit(fails ? 1 : 0);
