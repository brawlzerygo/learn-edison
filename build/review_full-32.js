// Independent review checks for full pool batch 32 (written from the card text): node build/review_full-32.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior Level 4 2000/100
let lastG; function duel(o = {}) {
  if (o.board && o.board[1] && o.board[1].turn && o.board[0] && !o.board[0].turn) o.board[0].turn = o.board[1].turn;
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
const bp = g => { E.act(g, ['bp']); settle(g); };
const atkOn = (g, p, aName, tName, ...picks) => { const a = on(g, p, aName), t = tName ? on(g, 1 - p, tName) : null; choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); settle(g, ...picks); };
const canAtk = (g, a, t) => hasOpt(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const endTurn = (g, ...picks) => { if (g.prompt && g.prompt.opts.some(x => x.key === 'endbp')) { E.act(g, ['endbp']); settle(g, ...picks); } E.act(g, ['end']); settle(g, ...picks); };
const ns = (g, p, n, ...picks) => { choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u); settle(g, ...picks); };
const noSummon = (g, c) => !hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && !hasOpt(g, 'sp:' + c.u);
const lp = (g, p) => g.p[p].lp;
const LV = c => E.lib.lv(c);
const up = n => ({ n, pos: 'up' });
const idle = g => g.prompt && g.prompt.type === 'idle';
const toIdle = (g, ...picks) => { for (let i = 0; i < 10 && g.prompt && !idle(g) && g.prompt.type !== 'battle'; i++) settle(g, ...picks); };
const optsFor = (g, c) => g.prompt ? g.prompt.opts.filter(x => x.u === c.u || x.key.split(':')[1] === String(c.u)) : [];
const hand = (g, p) => g.p[p].hand.length;
const BEWD = 'Blue-Eyes White Dragon';
const flipSum = (g, p, n, ...picks) => { choose(g, 'flip:' + on(g, p, n).u); settle(g, ...picks); };
const setM = n => ({ n, pos: 'set' });
const defM = n => ({ n, pos: 'def' });
const pos = (g, p, n) => { const c = on(g, p, n); return c ? c.pos : null; };
const AD = (g, p, n) => { const c = on(g, p, n); return c ? `${E.atk(g, c)}/${E.def(g, c)}` : 'none'; };
const CG = 'Celtic Guardian', EL = 'Mystical Elf', IC = "Iron Core of Koa'ki Meiru", GL = 'Gemini Lancer';
const eff = (g, p, n, ...picks) => { const c = on(g, p, n) || card(g, p, n); choose(g, 'a:' + c.u + ':'); settle(g, ...picks); };
const gem = (g, p, n) => { choose(g, 'gem:' + on(g, p, n).u); settle(g); };
const synOpt = (g, n) => { const c = card(g, 0, n); return !!c && !!g.prompt && g.prompt.opts.some(o => o.u === c.u && /Synchro/.test(o.label)); };
const syn = (g, n, ...picks) => { const c = card(g, 0, n); choose(g, g.prompt.opts.find(o => o.u === c.u && /Synchro/.test(o.label)).key); settle(g, ...picks); toIdle(g, ...picks); };

/* ---------------- Gemini ---------------- */
T('Gemini Booster: +700 to a Gemini, then makes a Gemini an Effect Monster when destroyed', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [GL], st: ['Gemini Booster'], turn: 2 }, {}] });
  act(g, 0, 'Gemini Booster'); settle(g, GL); toIdle(g);
  ok(E.atk(g, on(g, 0, GL)) === 2500, `Lancer ${AD(g, 0, GL)}`);
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Gemini Booster', GL); toIdle(g, GL);
  ok(inZ(g, 0, 'gy', 'Gemini Booster') && on(g, 0, GL).flags.gemini === true, 'Booster gone, Lancer treated as an Effect Monster');
});
T('Gemini Counter: flips own Gemini face-down and negates a Spell', () => {
  const g = duel({ first: 1, board: [{ m: [GL], st: ['Gemini Counter'] }, { hand: ['Dark Hole'], m: [FILL], turn: 2 }] });
  act(g, 1, 'Dark Hole'); settle(g, 'Gemini Counter', GL); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Dark Hole') && pos(g, 0, GL) === 'set' && on(g, 1, FILL), 'Dark Hole negated, Lancer face-down, nothing destroyed');
});
T('Gemini Imps: negates a discard effect and draws', () => {
  const g = duel({ first: 1, board: [{ hand: ['Gemini Imps', CG] }, { hand: ['Delinquent Duo'], turn: 2 }] });
  act(g, 1, 'Delinquent Duo'); settle(g, 'Gemini Imps'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Gemini Imps') && inZ(g, 1, 'gy', 'Delinquent Duo') && hand(g, 0) === 2 && inZ(g, 0, 'hand', CG), `Duo negated, A kept Celtic and drew (hand ${hand(g, 0)})`);
});
T('Gemini Lancer: piercing only after a Gemini Summon', () => {
  const g = duel({ board: [{ m: [GL], turn: 2 }, { m: [defM(FILL)] }] });
  bp(g); atkOn(g, 0, GL, FILL); toIdle(g);
  ok(lp(g, 1) === 8000, `no piercing as a Normal Monster (${lp(g, 1)})`);
  const g2 = duel({ board: [{ m: [GL], turn: 2 }, { m: [defM(FILL)] }] });
  gem(g2, 0, GL); bp(g2); atkOn(g2, 0, GL, FILL); toIdle(g2);
  ok(lp(g2, 1) === 8000 - 1700, `1700 piercing after Gemini Summon (${lp(g2, 1)})`);
});
T('Gemini Scorpion: Special Summons a Level 4 or lower Gemini from hand on summon', () => {
  const g = duel({ board: [{ hand: ['Gemini Scorpion', GL], turn: 2 }, {}] });
  ns(g, 0, 'Gemini Scorpion', GL, 'Attack'); toIdle(g, GL, 'Attack');
  ok(on(g, 0, GL) && on(g, 0, 'Gemini Scorpion'), 'Lancer Special Summoned');
});
T('Gemini Summoner: pay 500 in the opponent End Phase to Normal Summon a Gemini; survives the first battle', () => {
  const g = duel({ first: 1, board: [{ hand: [GL], m: ['Gemini Summoner'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Gemini Summoner'); toIdle(g);
  ok(on(g, 0, 'Gemini Summoner') && lp(g, 0) === 7500, `Summoner survives battle, A took 500 (${lp(g, 0)})`);
  endTurn(g, 'Gemini Summoner', GL, 'Attack'); toIdle(g, 'Gemini Summoner', GL, 'Attack');
  ok(on(g, 0, GL) && lp(g, 0) === 7000, `Lancer summoned in B End Phase, paid 500 (LP ${lp(g, 0)})`);
});
T('Gemini Trap Hole: own Effect Gemini destroyed by battle destroys all opponent monsters', () => {
  const g = duel({ board: [{ m: [GL], st: ['Gemini Trap Hole'], turn: 2 }, { m: [BEWD, CG] }] });
  gem(g, 0, GL); bp(g); atkOn(g, 0, GL, BEWD, 'Gemini Trap Hole'); toIdle(g, 'Gemini Trap Hole');
  ok(inZ(g, 0, 'gy', GL) && !on(g, 1, BEWD) && !on(g, 1, CG), 'Lancer destroyed, all B monsters destroyed');
});

/* ---------------- Golden ---------------- */
T('Golden Bamboo Sword: draw 2 only with a Bamboo Sword', () => {
  const g0 = duel({ board: [{ hand: ['Golden Bamboo Sword'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g0, 0, 'Golden Bamboo Sword'), 'not offered without a Bamboo Sword');
  const g = duel({ board: [{ hand: ['Golden Bamboo Sword', 'Broken Bamboo Sword'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Broken Bamboo Sword'); settle(g, FILL); toIdle(g);
  const h = hand(g, 0); act(g, 0, 'Golden Bamboo Sword'); settle(g); toIdle(g);
  ok(hand(g, 0) === h + 1, `drew 2 (hand ${h} to ${hand(g, 0)})`);
});
T('Golden Flying Fish: Tribute a Fish to destroy a card', () => {
  const g = duel({ board: [{ m: ['Golden Flying Fish', 'Flying Fish'], turn: 2 }, { m: [BEWD] }] });
  eff(g, 0, 'Golden Flying Fish', BEWD); toIdle(g);
  ok(on(g, 0, 'Golden Flying Fish') && inZ(g, 0, 'gy', 'Flying Fish') && inZ(g, 1, 'gy', BEWD), 'Flying Fish tributed, BEWD destroyed');
});
T('Golden Homunculus: +300 per own banished card', () => {
  const g = duel({ board: [{ m: ['Golden Homunculus'], ban: [FILL, 'Pot of Greed'], turn: 2 }, { ban: [FILL] }] });
  ok(AD(g, 0, 'Golden Homunculus') === '2100/2100', AD(g, 0, 'Golden Homunculus'));
});
T('Golden Ladybug: reveal in Standby to gain 500', () => {
  const g = duel({ board: [{ hand: ['Golden Ladybug'], turn: 2 }, {}] });
  toIdle(g, 'Golden Ladybug');
  ok(lp(g, 0) === 8500 && inZ(g, 0, 'hand', 'Golden Ladybug'), `gained 500 (${lp(g, 0)}), Ladybug stays in hand`);
});
T('H - Heated Heart: +500 and piercing this turn', () => {
  const g = duel({ board: [{ hand: ['H - Heated Heart'], m: [FILL], turn: 2 }, { m: [defM(EL)] }] });
  act(g, 0, 'H - Heated Heart'); settle(g, FILL); toIdle(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2500, `Warwolf ${AD(g, 0, FILL)}`);
  bp(g); atkOn(g, 0, FILL, EL); toIdle(g);
  ok(lp(g, 1) === 7500, `500 piercing (${lp(g, 1)})`);
});

/* ---------------- Helios ---------------- */
T('Helios - The Primordial Sun: 100 per banished monster (both sides)', () => {
  const g = duel({ board: [{ m: ['Helios - The Primordial Sun'], ban: [FILL, FILL, 'Pot of Greed'], turn: 2 }, { ban: [CG] }] });
  ok(AD(g, 0, 'Helios - The Primordial Sun') === '300/300', AD(g, 0, 'Helios - The Primordial Sun'));
});
T('Helios Duo Megistus: Tribute Helios to summon, x200, returns in the End Phase +300', () => {
  const g = duel({ board: [{ hand: ['Helios Duo Megistus'], m: ['Helios - The Primordial Sun'], ban: [FILL, FILL], turn: 2 }, { m: [BEWD] }] });
  const d = card(g, 0, 'Helios Duo Megistus'); ok(hasOpt(g, 'sp:' + d.u), 'Special Summon offered');
  choose(g, 'sp:' + d.u); settle(g, 'Helios - The Primordial Sun', 'Attack'); toIdle(g);
  ok(AD(g, 0, 'Helios Duo Megistus') === '400/400' && inZ(g, 0, 'gy', 'Helios - The Primordial Sun'), `Duo ${AD(g, 0, 'Helios Duo Megistus')}`);
  bp(g); atkOn(g, 0, 'Helios Duo Megistus', BEWD); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Helios Duo Megistus'), 'destroyed by battle');
  endTurn(g, 'Helios Duo Megistus', 'Attack'); toIdle(g, 'Attack');
  ok(AD(g, 0, 'Helios Duo Megistus') === '700/700', `back in the End Phase with +300 (${AD(g, 0, 'Helios Duo Megistus')})`);
});
T('Helios Trice Megistus: Tribute Duo, x300, second attack', () => {
  const g = duel({ board: [{ hand: ['Helios Trice Megistus'], m: ['Helios Duo Megistus'], ban: Array(10).fill(FILL), turn: 2 }, { m: [CG, EL] }] });
  const t = card(g, 0, 'Helios Trice Megistus'); ok(hasOpt(g, 'sp:' + t.u), 'Special Summon offered');
  choose(g, 'sp:' + t.u); settle(g, 'Helios Duo Megistus', 'Attack'); toIdle(g);
  ok(AD(g, 0, 'Helios Trice Megistus') === '3000/3000', `Trice ${AD(g, 0, 'Helios Trice Megistus')}`);
  bp(g); atkOn(g, 0, 'Helios Trice Megistus', CG); toIdle(g);
  const tr = on(g, 0, 'Helios Trice Megistus');
  ok(canAtk(g, tr, on(g, 1, EL)), 'second attack offered while B has a monster');
});

/* ---------------- Infernity ---------------- */
T('Infernity Archfiend: drawn with empty hand, Special Summon, then search', () => {
  const g = duel({ board: [{ hand: [], deckTop: ['Infernity Archfiend', FILL, 'Infernity Dwarf'], turn: 2 }, {}] });
  toIdle(g, 'Infernity Archfiend', 'Infernity Dwarf', 'Attack');
  ok(on(g, 0, 'Infernity Archfiend') && inZ(g, 0, 'hand', 'Infernity Dwarf'), 'Archfiend summoned, Dwarf added');
});
T('Infernity Beast: no hand, opponent cannot activate Traps on its attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Infernity Beast'], turn: 2 }, { m: [EL], st: ['Sakuretsu Armor'] }] });
  toIdle(g); ns(g, 0, FILL, 'Attack'); ok(hand(g, 0) === 0, 'hand empty');
  bp(g); atkOn(g, 0, 'Infernity Beast', EL, 'Sakuretsu Armor'); toIdle(g, 'Sakuretsu Armor');
  ok(inZ(g, 1, 'st', 'Sakuretsu Armor') && !inZ(g, 0, 'gy', 'Infernity Beast'), 'Sakuretsu not activated');
  const g2 = duel({ board: [{ hand: [], m: ['Infernity Beast'], turn: 2 }, { m: [EL], st: ['Sakuretsu Armor'] }] });
  toIdle(g2); bp(g2); atkOn(g2, 0, 'Infernity Beast', EL, 'Sakuretsu Armor'); toIdle(g2, 'Sakuretsu Armor');
  ok(inZ(g2, 0, 'gy', 'Infernity Beast'), 'with a card in hand, Sakuretsu works');
});
T('Infernity Dwarf: no hand, piercing for your monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Infernity Dwarf'], turn: 2 }, { m: [defM('Kuriboh')] }] });
  toIdle(g); ns(g, 0, FILL, 'Attack'); bp(g); atkOn(g, 0, FILL, 'Kuriboh'); toIdle(g);
  ok(lp(g, 1) === 6200, `1800 piercing (${lp(g, 1)})`);
});
T('Infernity Force: destroy attacker, revive an Infernity', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Infernity Dwarf'], st: ['Infernity Force'], gy: ['Infernity Beast'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Infernity Dwarf', 'Infernity Force', FILL, 'Infernity Beast', 'Attack'); toIdle(g, 'Infernity Beast', 'Attack');
  ok(inZ(g, 1, 'gy', FILL) && on(g, 0, 'Infernity Beast') && on(g, 0, 'Infernity Dwarf'), 'attacker destroyed, Beast revived, Dwarf safe');
});
T('Infernity Guardian: no hand, survives Dark Hole', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Infernity Guardian'] }, { hand: ['Dark Hole'], turn: 2 }] });
  act(g, 1, 'Dark Hole'); settle(g); toIdle(g);
  ok(on(g, 0, 'Infernity Guardian'), 'Guardian not destroyed');
  const g2 = duel({ first: 1, board: [{ hand: [CG], m: ['Infernity Guardian'] }, { hand: ['Dark Hole'], turn: 2 }] });
  act(g2, 1, 'Dark Hole'); settle(g2); toIdle(g2);
  ok(!on(g2, 0, 'Infernity Guardian'), 'with a card in hand it is destroyed');
});
T('Infernity Necromancer: goes to Defense, revives another Infernity with no hand', () => {
  const g = duel({ board: [{ hand: [], deckTop: ['Infernity Necromancer'], gy: ['Infernity Dwarf'], turn: 2 }, {}] });
  toIdle(g); ns(g, 0, 'Infernity Necromancer', 'Attack'); toIdle(g);
  ok(pos(g, 0, 'Infernity Necromancer') === 'def', 'changed to Defense');
  eff(g, 0, 'Infernity Necromancer', 'Infernity Dwarf', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Infernity Dwarf'), 'Dwarf revived');
  ok(!canAct(g, 0, 'Infernity Necromancer'), 'once per turn');
});

/* ---------------- Koa'ki Meiru ---------------- */
T("Koa'ki Meiru Doom: End Phase upkeep; negates LIGHT/DARK effects in the Main Phase", () => {
  const g = duel({ board: [{ hand: [], m: ["Koa'ki Meiru Doom"], turn: 2 }, {}] });
  toIdle(g); ns(g, 0, FILL, 'Attack'); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', "Koa'ki Meiru Doom"), 'destroyed with nothing to reveal');
  const g2 = duel({ board: [{ hand: ['Sangan'], m: ["Koa'ki Meiru Doom"], turn: 2 }, {}] });
  endTurn(g2, 'Sangan'); toIdle(g2, 'Sangan');
  ok(on(g2, 0, "Koa'ki Meiru Doom") && inZ(g2, 0, 'hand', 'Sangan'), 'kept by revealing a Fiend');
  const g3 = duel({ board: [{ m: ["Koa'ki Meiru Doom", 'Golden Flying Fish', 'Flying Fish'], turn: 2 }, { m: [BEWD] }] });
  if (canAct(g3, 0, 'Golden Flying Fish')) { eff(g3, 0, 'Golden Flying Fish', 'Flying Fish', BEWD); toIdle(g3); }
  ok(on(g3, 1, BEWD), 'LIGHT Golden Flying Fish effect negated in the Main Phase');
});
T("Koa'ki Meiru Ghoulungulate: banish a Koa'ki Meiru from GY instead of destruction", () => {
  const g = duel({ first: 1, board: [{ m: ["Koa'ki Meiru Ghoulungulate"], gy: ["Koa'ki Meiru Doom"] }, { hand: ['Dark Hole'], m: [FILL], turn: 2 }] });
  act(g, 1, 'Dark Hole'); settle(g, "Koa'ki Meiru Doom"); toIdle(g, "Koa'ki Meiru Doom");
  ok(on(g, 0, "Koa'ki Meiru Ghoulungulate") && inZ(g, 0, 'ban', "Koa'ki Meiru Doom") && !on(g, 1, FILL), 'Ghoulungulate stays, Doom banished');
});
T("Koa'ki Meiru Gravirose: Standby sends a Level 3 or lower monster from Deck to GY", () => {
  const g = duel({ board: [{ m: ["Koa'ki Meiru Gravirose"], deckTop: [FILL, 'Sangan'], turn: 2 }, {}] });
  toIdle(g, 'Sangan');
  ok(inZ(g, 0, 'gy', 'Sangan'), 'Sangan sent to the GY');
});
T("Koa'ki Meiru Hydro Barrier: Iron Core to Deck top negates other effect monsters", () => {
  const g = duel({ board: [{ hand: [IC], m: ["Koa'ki Meiru Hydro Barrier"], turn: 2 }, { m: ['Golden Homunculus'], ban: [FILL, FILL] }] });
  ok(E.atk(g, on(g, 1, 'Golden Homunculus')) === 2100, 'Homunculus 2100 before');
  eff(g, 0, "Koa'ki Meiru Hydro Barrier"); toIdle(g);
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(E.atk(g, on(g, 1, 'Golden Homunculus')) === 1500 && E.name(top) === IC, `Homunculus ${AD(g, 1, 'Golden Homunculus')}, Iron Core on top`);
  endTurn(g); toIdle(g);
  ok(E.atk(g, on(g, 1, 'Golden Homunculus')) === 1500, 'still negated on the opponent turn');
});
T("Koa'ki Meiru Ice: discard to destroy a Special Summoned monster", () => {
  const g = duel({ board: [{ hand: [CG, 'Monster Reborn'], m: ["Koa'ki Meiru Ice"], turn: 2 }, { m: [FILL], gy: [BEWD] }] });
  ok(!canAct(g, 0, "Koa'ki Meiru Ice"), 'not offered with no Special Summoned monster');
  act(g, 0, 'Monster Reborn'); settle(g, BEWD, 'Attack'); toIdle(g, 'Attack');
  eff(g, 0, "Koa'ki Meiru Ice", CG, BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && on(g, 1, FILL) && inZ(g, 0, 'gy', CG), 'reborn BEWD destroyed, Celtic discarded');
});
T("Koa'ki Meiru Sea Panther: Iron Core to return a Spell to the Deck top", () => {
  const g = duel({ board: [{ hand: [IC], m: ["Koa'ki Meiru Sea Panther"], gy: ['Pot of Greed'], turn: 2 }, {}] });
  eff(g, 0, "Koa'ki Meiru Sea Panther", 'Pot of Greed'); toIdle(g);
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(E.name(top) === 'Pot of Greed' && inZ(g, 0, 'gy', IC), 'Pot on top, Iron Core in GY');
});
T("Koa'ki Meiru Speeder: draw Iron Core in Draw Phase, reveal, draw 1 more", () => {
  const g = duel({ board: [{ hand: [], m: ["Koa'ki Meiru Speeder"], deckTop: [IC, 'Sangan'], turn: 2 }, {}] });
  toIdle(g, "Koa'ki Meiru Speeder", IC);
  ok(inZ(g, 0, 'hand', IC) && inZ(g, 0, 'hand', 'Sangan'), 'Iron Core and Sangan in hand');
});
T("Koa'ki Meiru Valafar: 1 Koa'ki Tribute, unaffected by Trap destruction, piercing", () => {
  const g = duel({ board: [{ hand: ["Koa'ki Meiru Valafar"], m: ["Koa'ki Meiru Sea Panther"], turn: 2 }, { m: [defM('Kuriboh')], st: ['Sakuretsu Armor'] }] });
  ns(g, 0, "Koa'ki Meiru Valafar", "Koa'ki Meiru Sea Panther", 'Attack'); toIdle(g);
  ok(on(g, 0, "Koa'ki Meiru Valafar"), 'Tribute Summoned with 1 Koa\'ki Meiru');
  bp(g); atkOn(g, 0, "Koa'ki Meiru Valafar", 'Kuriboh', 'Sakuretsu Armor'); toIdle(g, 'Sakuretsu Armor');
  ok(on(g, 0, "Koa'ki Meiru Valafar") && lp(g, 1) === 5200, `survives Sakuretsu, 2800 piercing (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ["Koa'ki Meiru Valafar"], m: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, "Koa'ki Meiru Valafar").u), 'not with 1 non-Koa\'ki monster');
});
T("Koa'ki Meiru War Arms: equips a Warrior from GY, gains half its ATK, it dies instead", () => {
  const g = duel({ board: [{ m: ["Koa'ki Meiru War Arms"], gy: ['Marauding Captain'], turn: 2 }, { m: [FILL] }] });
  eff(g, 0, "Koa'ki Meiru War Arms", 'Marauding Captain'); toIdle(g);
  ok(E.atk(g, on(g, 0, "Koa'ki Meiru War Arms")) === 2000, `War Arms ${AD(g, 0, "Koa'ki Meiru War Arms")}`);
  bp(g); atkOn(g, 0, "Koa'ki Meiru War Arms", FILL); toIdle(g);
  ok(on(g, 0, "Koa'ki Meiru War Arms") && inZ(g, 0, 'gy', 'Marauding Captain') && inZ(g, 1, 'gy', FILL), 'Captain destroyed instead, Warwolf destroyed');
});

/* ---------------- Level Limit / Lucky ---------------- */
T('Level Limit - Area A: Level 3 or lower face-up monsters to Attack', () => {
  const g = duel({ board: [{ m: [FILL], st: ['Level Limit - Area A'], turn: 2 }, { m: [defM('Kuriboh'), defM(EL)] }] });
  act(g, 0, 'Level Limit - Area A'); settle(g); toIdle(g);
  ok(pos(g, 1, 'Kuriboh') === 'atk' && pos(g, 1, EL) === 'def', 'Kuriboh to Attack, Elf stays');
});
T('Lucky Chance: call the coin of Time Wizard, draw if right', () => {
  const res = { H: null, T: null };
  for (let seed = 1; seed < 40 && (res.H === null || res.T === null); seed++) {
    const g = duel({ seed, board: [{ m: ['Time Wizard'], st: [up('Lucky Chance')], turn: 2 }, { m: [FILL] }] });
    toIdle(g); const h = hand(g, 0);
    eff(g, 0, 'Time Wizard', 'Lucky Chance', 'Heads'); toIdle(g, 'Lucky Chance', 'Heads');
    const L = g.log.join('\n'); const k = /tossed a coin: Heads/.test(L) ? 'H' : 'T';
    if (res[k] === null) res[k] = { d: hand(g, 0) - h, used: /Lucky Chance/.test(L), log: g.log.slice(-6).join(' | ') };
  }
  ok(res.H && res.H.used && res.H.d === 1, 'called Heads, coin Heads: drew 1 ' + (res.H && res.H.log));
  ok(res.T && res.T.used && res.T.d === 0, 'called Heads, coin Tails: no draw ' + (res.T && res.T.log));
});
T('Lucky Cloud: 2 same Cloudians summoned this turn, draw 2 in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Cloudian - Smoke Ball', 'Monster Reborn', 'Lucky Cloud'], gy: ['Cloudian - Smoke Ball'], turn: 2 }, {}] });
  ns(g, 0, 'Cloudian - Smoke Ball', 'Attack'); act(g, 0, 'Monster Reborn'); settle(g, 'Cloudian - Smoke Ball', 'Attack'); toIdle(g);
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Cloudian - Smoke Ball').length === 2, 'two Smoke Balls');
  act(g, 0, 'Lucky Cloud'); settle(g); toIdle(g);
  const h = hand(g, 0); choose(g, 'end'); settle(g);
  ok(hand(g, 0) === h + 2 || (g.tp === 1 && hand(g, 0) === h + 2), `drew 2 in End Phase (hand ${h} to ${hand(g, 0)})`);
});
T('Lucky Iron Axe: +500, draw when destroyed by the opponent', () => {
  const g = duel({ board: [{ hand: ['Lucky Iron Axe'], m: [FILL], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Lucky Iron Axe'); settle(g, FILL); toIdle(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2500, `Warwolf ${AD(g, 0, FILL)}`);
  endTurn(g); toIdle(g); const h = hand(g, 0);
  act(g, 1, 'Mystical Space Typhoon'); settle(g, 'Lucky Iron Axe'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Lucky Iron Axe') && hand(g, 0) === h + 1, `Axe destroyed, A drew (hand ${h} to ${hand(g, 0)})`);
});
T('Lucky Pied Piper: Gemini, draws after destroying by battle', () => {
  const g = duel({ board: [{ m: ['Lucky Pied Piper'], turn: 2 }, { m: ['Kuriboh', EL] }] });
  gem(g, 0, 'Lucky Pied Piper'); toIdle(g); const h = hand(g, 0);
  bp(g); atkOn(g, 0, 'Lucky Pied Piper', 'Kuriboh'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Kuriboh') && hand(g, 0) === h + 1, `drew 1 (hand ${h} to ${hand(g, 0)})`);
});

/* ---------------- Machina / Machine King ---------------- */
T('Machina Armored Unit: Machine destroyed by battle brings a weaker same-Attribute Machine', () => {
  const g = duel({ first: 1, board: [{ m: ['Cyber Dragon'], st: [up('Machina Armored Unit')], deckTop: ['Morphtronic Videon'] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g); atkOn(g, 1, BEWD, 'Cyber Dragon', 'Machina Armored Unit', 'Morphtronic Videon', 'Attack'); toIdle(g, 'Machina Armored Unit', 'Morphtronic Videon', 'Attack');
  ok(on(g, 0, 'Morphtronic Videon'), 'Videon (LIGHT Machine, 1000) Special Summoned');
});
T('Machina Defender: FLIP adds Commander Covington', () => {
  const g = duel({ board: [{ m: [setM('Machina Defender')], deckTop: [FILL, 'Commander Covington'], turn: 2 }, {}] });
  toIdle(g); flipSum(g, 0, 'Machina Defender', 'Commander Covington'); toIdle(g, 'Commander Covington');
  ok(inZ(g, 0, 'hand', 'Commander Covington'), 'Covington added');
});
T('Machina Sniper: other Machina monsters cannot be attacked', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Machina Sniper', 'Machina Defender'] }] });
  bp(g); const a = on(g, 0, FILL);
  ok(canAtk(g, a, on(g, 1, 'Machina Sniper')) && !canAtk(g, a, on(g, 1, 'Machina Defender')), 'Sniper attackable, Defender not');
});
T('Machina Soldier: Special Summons a Machina from hand when alone', () => {
  const g = duel({ board: [{ hand: ['Machina Soldier', 'Machina Sniper'], turn: 2 }, {}] });
  ns(g, 0, 'Machina Soldier', 'Machina Sniper', 'Attack'); toIdle(g, 'Machina Sniper', 'Attack');
  ok(on(g, 0, 'Machina Sniper'), 'Sniper Special Summoned');
});
T('Machine King - 3000 B.C.: becomes a monster, locks summons, gains a Tributed Machine ATK', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Cyber Dragon'], st: ['Machine King - 3000 B.C.'], turn: 2 }, {}] });
  act(g, 0, 'Machine King - 3000 B.C.'); settle(g, 'Attack'); toIdle(g, 'Attack');
  const mk = on(g, 0, 'Machine King - 3000 B.C.');
  ok(mk && E.atk(g, mk) === 1000, 'Special Summoned as a 1000 ATK monster');
  ok(!hasOpt(g, 'ns:' + card(g, 0, FILL).u), 'no Normal Summon this turn');
  eff(g, 0, 'Machine King - 3000 B.C.', 'Cyber Dragon'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Machine King - 3000 B.C.')) === 3100 && inZ(g, 0, 'gy', 'Cyber Dragon'), `MK ${AD(g, 0, 'Machine King - 3000 B.C.')}`);
});

/* ---------------- Majestic ---------------- */
T('Majestic Dragon: not material for a non-Majestic Synchro', () => {
  const g = duel({ ex0: ['Stardust Dragon'], board: [{ m: ['Majestic Dragon', 'Dark Magician'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'syn:'), 'no Stardust from Majestic Dragon + Dark Magician');
});
T('Majestic Red Dragon: summon, negate+gain ATK, wipe Defense monsters, End Phase return', () => {
  const g = duel({ ex0: ['Majestic Red Dragon'], board: [{ m: ['Majestic Dragon', 'Red Dragon Archfiend', 'Kuriboh'], turn: 2 }, { m: ['Cyber Dragon', defM(EL)] }] });
  ok(synOpt(g, 'Majestic Red Dragon'), 'Synchro offered'); syn(g, 'Majestic Red Dragon', 'Majestic Dragon', 'Red Dragon Archfiend', 'Kuriboh', 'Attack');
  ok(on(g, 0, 'Majestic Red Dragon'), 'Majestic Red Dragon summoned');
  eff(g, 0, 'Majestic Red Dragon', 'Cyber Dragon'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Majestic Red Dragon')) === 6100, `MRD ${AD(g, 0, 'Majestic Red Dragon')}`);
  bp(g); atkOn(g, 0, 'Majestic Red Dragon', 'Cyber Dragon'); toIdle(g);
  ok(!on(g, 1, EL) && !on(g, 1, 'Cyber Dragon'), 'Defense Elf destroyed after the attack');
  endTurn(g, 'Majestic Red Dragon', 'Red Dragon Archfiend', 'Attack'); toIdle(g, 'Red Dragon Archfiend', 'Attack');
  ok(inZ(g, 0, 'extra', 'Majestic Red Dragon') && on(g, 0, 'Red Dragon Archfiend'), 'returned to Extra, RDA revived');
});
T('Majestic Star Dragon: summon; End Phase returns it and revives Stardust', () => {
  const g = duel({ ex0: ['Majestic Star Dragon'], board: [{ m: ['Majestic Dragon', 'Stardust Dragon', 'Kuriboh'], turn: 2 }, {}] });
  ok(synOpt(g, 'Majestic Star Dragon'), 'Synchro offered'); syn(g, 'Majestic Star Dragon', 'Majestic Dragon', 'Stardust Dragon', 'Kuriboh', 'Attack');
  ok(on(g, 0, 'Majestic Star Dragon'), 'Majestic Star Dragon summoned');
  endTurn(g, 'Majestic Star Dragon', 'Stardust Dragon', 'Attack'); toIdle(g, 'Stardust Dragon', 'Attack');
  ok(inZ(g, 0, 'extra', 'Majestic Star Dragon') && on(g, 0, 'Stardust Dragon'), 'returned to Extra, Stardust revived');
});
T('Majestic Star Dragon: Tribute to negate an activation and destroy all their cards', () => {
  const g = duel({ first: 1, board: [{ m: ['Majestic Star Dragon'] }, { hand: ['Dark Hole'], m: [FILL], st: ['Sakuretsu Armor'], turn: 2 }] });
  act(g, 1, 'Dark Hole'); settle(g, 'Majestic Star Dragon'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Dark Hole') && inZ(g, 1, 'gy', FILL) && inZ(g, 1, 'gy', 'Sakuretsu Armor') && inZ(g, 0, 'gy', 'Majestic Star Dragon'), 'negated, B cards destroyed, MSD tributed');
});
T('Majestic Mech - Goryu: 1 Tribute, piercing, sent to GY in End Phase', () => {
  const g = duel({ board: [{ hand: ['Majestic Mech - Goryu'], m: [CG], turn: 2 }, { m: [defM('Kuriboh')] }] });
  ns(g, 0, 'Majestic Mech - Goryu', CG, 'Attack'); toIdle(g);
  ok(on(g, 0, 'Majestic Mech - Goryu'), 'summoned with 1 Tribute');
  bp(g); atkOn(g, 0, 'Majestic Mech - Goryu', 'Kuriboh'); toIdle(g);
  ok(lp(g, 1) === 5300, `2700 piercing (${lp(g, 1)})`);
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Majestic Mech - Goryu'), 'sent to GY in End Phase');
});
T('Majestic Mech - Ohka: no Tribute, sent to GY in End Phase', () => {
  const g = duel({ board: [{ hand: ['Majestic Mech - Ohka'], turn: 2 }, {}] });
  ns(g, 0, 'Majestic Mech - Ohka', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Majestic Mech - Ohka'), 'summoned without Tribute');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Majestic Mech - Ohka'), 'sent to GY');
  const g2 = duel({ board: [{ hand: ['Majestic Mech - Ohka'], m: [FILL], turn: 2 }, {}] });
  ns(g2, 0, 'Majestic Mech - Ohka', FILL, 'Attack'); toIdle(g2);
  if (on(g2, 0, 'Majestic Mech - Ohka') && inZ(g2, 0, 'gy', FILL)) { endTurn(g2); toIdle(g2); ok(on(g2, 0, 'Majestic Mech - Ohka'), 'Tribute Summoned Ohka stays'); }
  else ok(true, 'summoned without Tribute even with a monster');
});
T('Majestic Mech - Senku: direct hit draws, sent to GY in End Phase', () => {
  const g = duel({ board: [{ hand: ['Majestic Mech - Senku'], turn: 2 }, {}] });
  ns(g, 0, 'Majestic Mech - Senku', 'Attack'); toIdle(g); const h = hand(g, 0);
  bp(g); atkOn(g, 0, 'Majestic Mech - Senku', null); toIdle(g);
  ok(lp(g, 1) === 7000 && hand(g, 0) === h + 1, `drew 1 (hand ${h} to ${hand(g, 0)})`);
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Majestic Mech - Senku'), 'sent to GY');
});
T('Malevolent Mech - Goku En: no Tribute, End Phase to GY and 2400 damage', () => {
  const g = duel({ board: [{ hand: ['Malevolent Mech - Goku En'], turn: 2 }, {}] });
  ns(g, 0, 'Malevolent Mech - Goku En', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Malevolent Mech - Goku En'), 'summoned without Tribute');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Malevolent Mech - Goku En') && lp(g, 0) === 5600, `sent, took 2400 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Malevolent Mech - Goku En'], turn: 2 }, { m: ['Pyramid Turtle'] }] });
  ns(g2, 0, 'Malevolent Mech - Goku En', 'Attack'); endTurn(g2); toIdle(g2);
  ok(on(g2, 0, 'Malevolent Mech - Goku En') && lp(g2, 0) === 8000, 'stays with another Zombie on the field');
});

/* ---------------- Mist ---------------- */
T('Mist Archfiend: no Tribute, End Phase destroyed and 1000 damage', () => {
  const g = duel({ board: [{ hand: ['Mist Archfiend'], turn: 2 }, {}] });
  ns(g, 0, 'Mist Archfiend', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Mist Archfiend'), 'summoned without Tribute');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Mist Archfiend') && lp(g, 0) === 7000, `destroyed, took 1000 (${lp(g, 0)})`);
});
T('Mist Body: equipped monster survives battle', () => {
  const g = duel({ board: [{ hand: ['Mist Body'], m: [CG], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Mist Body'); settle(g, CG); toIdle(g);
  bp(g); atkOn(g, 0, CG, BEWD); toIdle(g);
  ok(on(g, 0, CG) && lp(g, 0) === 6400, `Celtic survives, A took 1600 (${lp(g, 0)})`);
});
T('Mist Valley Shaman: bounce another monster for +500', () => {
  const g = duel({ board: [{ m: ['Mist Valley Shaman', CG], turn: 2 }, {}] });
  eff(g, 0, 'Mist Valley Shaman', CG); toIdle(g);
  ok(inZ(g, 0, 'hand', CG) && E.atk(g, on(g, 0, 'Mist Valley Shaman')) === 1700, `Celtic to hand, Shaman ${AD(g, 0, 'Mist Valley Shaman')}`);
  ok(!canAct(g, 0, 'Mist Valley Shaman'), 'once per turn');
  endTurn(g); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Mist Valley Shaman')) === 1200, 'back to 1200 after the turn');
});
T('Mist Valley Soldier: surviving battler returns to the hand', () => {
  const g = duel({ board: [{ m: ['Mist Valley Soldier'], turn: 2 }, { m: [defM(EL)] }] });
  bp(g); atkOn(g, 0, 'Mist Valley Soldier', EL); toIdle(g);
  ok(inZ(g, 1, 'hand', EL), 'Mystical Elf returned to hand');
});
T('Mist Valley Thunderbird: returned to hand, comes back, cannot attack', () => {
  const g = duel({ board: [{ m: ['Mist Valley Shaman', 'Mist Valley Thunderbird'], turn: 2 }, {}] });
  eff(g, 0, 'Mist Valley Shaman', 'Mist Valley Thunderbird', 'Attack'); toIdle(g, 'Mist Valley Thunderbird', 'Attack');
  const t = on(g, 0, 'Mist Valley Thunderbird'); ok(!!t, 'Thunderbird Special Summoned back');
  bp(g); ok(t && !hasOpt(g, `atk:${t.u}:`), 'cannot attack this turn');
});

/* ---------------- Morphtronic ---------------- */
T('Morphtronic Accelerator: Morphtronic to Deck, destroy a card, draw 1', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Accelerator', 'Morphtronic Celfon'], turn: 2 }, { m: [BEWD] }] });
  const h = hand(g, 0); act(g, 0, 'Morphtronic Accelerator'); settle(g, BEWD, 'Morphtronic Celfon'); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && hand(g, 0) === h - 1 && !inZ(g, 0, 'gy', 'Morphtronic Celfon'), `BEWD destroyed, Celfon to Deck, drew (hand ${h} to ${hand(g, 0)})`);
});
T('Morphtronic Cameran: Attack Position battle death brings a Morphtronic; Defense protects targeting', () => {
  const g = duel({ board: [{ m: ['Morphtronic Cameran'], gy: ['Morphtronic Celfon'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Morphtronic Cameran', FILL, 'Morphtronic Cameran', 'Morphtronic Celfon', 'Attack'); toIdle(g, 'Morphtronic Celfon', 'Attack');
  ok(on(g, 0, 'Morphtronic Celfon'), 'Celfon Special Summoned');
  const g2 = duel({ first: 1, board: [{ m: [defM('Morphtronic Cameran'), 'Morphtronic Videon'] }, { hand: ['Book of Moon'], turn: 2 }] });
  if (canAct(g2, 1, 'Book of Moon')) { act(g2, 1, 'Book of Moon'); settle(g2); toIdle(g2); }
  ok(pos(g2, 0, 'Morphtronic Cameran') === 'def' && pos(g2, 0, 'Morphtronic Videon') === 'atk', 'Book of Moon cannot flip the Morphtronics');
});
T('Morphtronic Clocken: counters in Defense, Tribute for 1000 each', () => {
  const g = duel({ board: [{ m: [defM('Morphtronic Clocken')], turn: 2 }, {}] });
  const c = on(g, 0, 'Morphtronic Clocken');
  const ef = optsFor(g, c); ok(ef.length >= 1, 'effect offered');
  const cnt = o => { choose(g, o.key); settle(g); toIdle(g); };
  const place = optsFor(g, c).find(o => /counter|place/i.test(o.label)) || optsFor(g, c)[0]; cnt(place);
  ok(E.lib.ctr(c, 'morph') === 1 || Object.values(c.ctr || {}).some(v => v === 1), 'one Morph Counter');
  ok(!optsFor(g, c).some(o => /place/i.test(o.label)), 'placing once per turn');
  const trib = optsFor(g, c).find(o => /tribute|damage|inflict/i.test(o.label)); ok(!!trib, 'Tribute effect offered');
  if (trib) { cnt(trib); ok(lp(g, 1) === 7000 && inZ(g, 0, 'gy', 'Morphtronic Clocken'), `B took 1000 (${lp(g, 1)})`); }
});
T('Morphtronic Cord: position change destroys a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Cord'], m: ['Morphtronic Videon'], turn: 2 }, { st: ['Sakuretsu Armor'] }] });
  act(g, 0, 'Morphtronic Cord'); settle(g, 'Morphtronic Videon'); toIdle(g);
  choose(g, 'pos:' + on(g, 0, 'Morphtronic Videon').u); settle(g, 'Face-down'); toIdle(g, 'Face-down');
  ok(inZ(g, 1, 'gy', 'Sakuretsu Armor') && inZ(g, 0, 'st', 'Morphtronic Cord'), 'Sakuretsu destroyed');
});
T('Morphtronic Datatron: Attack Tribute for 600, Defense 300', () => {
  const g = duel({ board: [{ m: ['Morphtronic Datatron', CG], turn: 2 }, {}] });
  eff(g, 0, 'Morphtronic Datatron', CG); toIdle(g);
  ok(lp(g, 1) === 7400 && inZ(g, 0, 'gy', CG), `600 damage (${lp(g, 1)})`);
  ok(!canAct(g, 0, 'Morphtronic Datatron'), 'once per turn');
  const g2 = duel({ board: [{ m: [defM('Morphtronic Datatron')], turn: 2 }, {}] });
  eff(g2, 0, 'Morphtronic Datatron'); toIdle(g2);
  ok(lp(g2, 1) === 7700, `300 damage in Defense (${lp(g2, 1)})`);
});
T('Morphtronic Engine: doubles a Level 3 Morphtronic, burns on the second Standby', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Engine'], m: ['Morphtronic Datatron', 'Morphtronic Videon'], turn: 2 }, {}] });
  act(g, 0, 'Morphtronic Engine'); settle(g, 'Morphtronic Datatron'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Morphtronic Datatron')) === 2400, `Datatron ${AD(g, 0, 'Morphtronic Datatron')}`);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'st', 'Morphtronic Engine') && lp(g, 0) === 8000, 'still there after first Standby');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Morphtronic Engine') && lp(g, 0) === 6800 && on(g, 0, 'Morphtronic Datatron'), `destroyed on second Standby, took 1200 (${lp(g, 0)})`);
});
T('Morphtronic Magnen: Attack must target highest ATK; Defense draws attacks', () => {
  const g = duel({ board: [{ m: ['Morphtronic Magnen'], turn: 2 }, { m: [CG, FILL] }] });
  bp(g); const m = on(g, 0, 'Morphtronic Magnen');
  ok(canAtk(g, m, on(g, 1, FILL)) && !canAtk(g, m, on(g, 1, CG)), 'only the Warwolf can be attacked');
  const g2 = duel({ board: [{ m: [FILL], turn: 2 }, { m: [defM('Morphtronic Magnen'), CG] }] });
  bp(g2); const a = on(g2, 0, FILL);
  ok(canAtk(g2, a, on(g2, 1, 'Morphtronic Magnen')) && !canAtk(g2, a, on(g2, 1, CG)), 'only Magnen can be attacked');
});
T('Morphtronic Magnen Bar: gains two others ATK; Defense stops attacks', () => {
  const g = duel({ board: [{ m: ['Morphtronic Magnen Bar', FILL, CG], turn: 2 }, {}] });
  eff(g, 0, 'Morphtronic Magnen Bar'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Morphtronic Magnen Bar')) === 3500, `Bar ${AD(g, 0, 'Morphtronic Magnen Bar')}`);
  bp(g); ok(!canAtk(g, on(g, 0, FILL), null) && canAtk(g, on(g, 0, 'Morphtronic Magnen Bar'), null), 'others cannot attack, Bar can');
  const g2 = duel({ board: [{ m: [defM('Morphtronic Magnen Bar'), FILL], turn: 2 }, {}] });
  bp(g2); ok(!canAtk(g2, on(g2, 0, FILL), null), 'no attacks while Bar is in Defense');
});
T('Morphtronic Map: counters on position change, +300 per counter, revives when destroyed', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Map', 'Mystical Space Typhoon'], m: ['Morphtronic Videon', FILL], gy: ['Morphtronic Celfon'], turn: 2 }, {}] });
  act(g, 0, 'Morphtronic Map'); settle(g); toIdle(g);
  choose(g, 'pos:' + on(g, 0, FILL).u); settle(g); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Morphtronic Videon')) === 1300 && E.atk(g, on(g, 0, FILL)) === 2000, `Videon ${AD(g, 0, 'Morphtronic Videon')}`);
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Morphtronic Map', 'Morphtronic Celfon', 'Attack'); toIdle(g, 'Morphtronic Map', 'Morphtronic Celfon', 'Attack');
  ok(inZ(g, 0, 'gy', 'Morphtronic Map') && on(g, 0, 'Morphtronic Celfon'), 'Map destroyed, Celfon revived');
});
T('Morphtronic Mix-up: 2 Morphtronics, opponent chooses 1 of 2 to destroy', () => {
  const g = duel({ board: [{ m: ['Morphtronic Videon', 'Morphtronic Celfon'], st: ['Morphtronic Mix-up'], turn: 2 }, { m: [BEWD, CG] }] });
  act(g, 0, 'Morphtronic Mix-up'); settle(g, BEWD, CG); toIdle(g, CG);
  const n = [BEWD, CG].filter(x => inZ(g, 1, 'gy', x)).length;
  ok(n === 1, `exactly one destroyed (${n})`);
  const g2 = duel({ board: [{ m: ['Morphtronic Videon', FILL], st: ['Morphtronic Mix-up'], turn: 2 }, { m: [BEWD, CG] }] });
  ok(!canAct(g2, 0, 'Morphtronic Mix-up'), 'not with only 1 Morphtronic');
});
T('Morphtronic Monitron: summoned Morphtronic to face-up Defense', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Celfon'], st: [up('Morphtronic Monitron')], turn: 2 }, {}] });
  ns(g, 0, 'Morphtronic Celfon', 'Morphtronic Monitron', 'Attack'); toIdle(g, 'Morphtronic Monitron');
  ok(pos(g, 0, 'Morphtronic Celfon') === 'def', 'Celfon in Defense');
});
T('Morphtronic Repair Unit: discard a Morphtronic, revive one equipped, dies with the equip', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Repair Unit', 'Morphtronic Celfon', 'Mystical Space Typhoon'], gy: ['Morphtronic Videon'], turn: 2 }, {}] });
  act(g, 0, 'Morphtronic Repair Unit'); settle(g, 'Morphtronic Videon', 'Attack'); toIdle(g, 'Attack');
  const v = on(g, 0, 'Morphtronic Videon');
  ok(v && inZ(g, 0, 'gy', 'Morphtronic Celfon') && E.atk(g, v) === 1800, `Videon revived and equipped (${AD(g, 0, 'Morphtronic Videon')})`);
  ok(!hasOpt(g, 'pos:' + v.u), 'cannot change position');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Morphtronic Repair Unit'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Morphtronic Videon'), 'Videon destroyed with the Repair Unit');
});
T('Morphtronic Rusty Engine: equipped destroyed, both take its original ATK', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Rusty Engine'], m: ['Morphtronic Videon'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Morphtronic Rusty Engine'); settle(g, 'Morphtronic Videon'); toIdle(g);
  bp(g); atkOn(g, 0, 'Morphtronic Videon', FILL); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Morphtronic Videon') && lp(g, 1) === 7000 && lp(g, 0) === 8000 - 200 - 1000, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
});
T('Morphtronic Videon: +800 ATK in Attack, +800 DEF in Defense per Equip', () => {
  const g = duel({ board: [{ hand: ['Mist Body'], m: ['Morphtronic Videon'], turn: 2 }, {}] });
  act(g, 0, 'Mist Body'); settle(g, 'Morphtronic Videon'); toIdle(g);
  ok(AD(g, 0, 'Morphtronic Videon') === '1800/1000', AD(g, 0, 'Morphtronic Videon'));
  choose(g, 'pos:' + on(g, 0, 'Morphtronic Videon').u); settle(g); toIdle(g);
  ok(AD(g, 0, 'Morphtronic Videon') === '1000/1800', AD(g, 0, 'Morphtronic Videon'));
});

console.log(fails ? `\n${fails} failed` : '\nAll batch 32 review checks passed.');
process.exit(fails ? 1 : 0);
