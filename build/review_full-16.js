// Independent review checks for full pool batch 16 (written from the card text): node build/review_full-16.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior Level 4 2000/100
let lastG; function duel(o = {}) {
  const mk = (ex, n) => ({ name: 't', main: Array(n || 40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0, o.n0), mk(o.ex1, o.n1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
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
const hand = (g, p) => g.p[p].hand.length;
const cardIn = (g, p, z, n) => g.p[p][z].find(c => c && E.name(c) === n);
const allEmpty = g => g.p.every(P => P.m.every(x => !x) && P.st.every(x => !x));
const Bturn = (g, ...picks) => { endTurn(g, ...picks); toIdle(g, ...picks); }; // A ends, B's turn starts (B is at idle)

/* ---------------- A ---------------- */
T('The A. Forces: Warriors gain 200 per Warrior/Spellcaster, cumulative', () => {
  const g = duel({ board: [{ hand: ['The A. Forces'], m: ['Celtic Guardian', 'Gemini Elf', FILL], st: [up('The A. Forces')], turn: 2 }, {}] });
  const cg = on(g, 0, 'Celtic Guardian'), ge = on(g, 0, 'Gemini Elf');
  ok(E.atk(g, cg) === 1800 && E.atk(g, ge) === 1900, `one copy: Celtic ${E.atk(g, cg)} (1800), Gemini Elf ${E.atk(g, ge)} (1900)`);
  act(g, 0, 'The A. Forces'); settle(g);
  ok(E.atk(g, cg) === 2200, `two copies: Celtic ${E.atk(g, cg)} (2200)`);
});
T('The Beginning of the End: banish 5 DARK, draw 3', () => {
  const S = 'Archfiend Soldier';
  const g = duel({ board: [{ hand: ['The Beginning of the End'], gy: [S, S, S, S, S, S, S], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'The Beginning of the End'); settle(g);
  ok(cnt(g, 0, 'ban', S) === 5 && cnt(g, 0, 'gy', S) === 2 && hand(g, 0) === h - 1 + 3, `banished ${cnt(g, 0, 'ban', S)}, hand ${hand(g, 0)}`);
  const g2 = duel({ board: [{ hand: ['The Beginning of the End'], gy: [S, S, S, S, S, S], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Beginning of the End'), 'not offered with 6 DARK');
});
T('The Big March of Animals: face-up Beasts gain 200 per Beast until end of turn', () => {
  const g = duel({ board: [{ hand: ['The Big March of Animals'], m: ['Dark Rabbit', 'Dark Rabbit', { n: 'Dig Beak', pos: 'set' }, FILL], turn: 2 }, {}] });
  act(g, 0, 'The Big March of Animals'); settle(g);
  const r = on(g, 0, 'Dark Rabbit'), w = on(g, 0, FILL);
  ok(E.atk(g, r) === 1500 && E.atk(g, w) === 2000, `Dark Rabbit ${E.atk(g, r)} (1500), Warwolf ${E.atk(g, w)} (2000)`);
  Bturn(g); ok(E.atk(g, r) === 1100, `back to 1100 next turn (${E.atk(g, r)})`);
});
T('The Big Saturn: discard + 1000 LP for +1000 once per turn; burn 2800 both when destroyed by opponent', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Dark Hole'], m: ['The Big Saturn'], turn: 2 }, { hand: ['Dark Hole'] }] });
  const s = on(g, 0, 'The Big Saturn'); act(g, 0, 'The Big Saturn'); settle(g, 'Pot of Greed');
  ok(E.atk(g, s) === 3800 && lp(g, 0) === 7000 && inZ(g, 0, 'gy', 'Pot of Greed'), `ATK ${E.atk(g, s)}, LP ${lp(g, 0)}`);
  ok(!canAct(g, 0, 'The Big Saturn'), 'once per turn');
  Bturn(g); ok(E.atk(g, s) === 2800, 'ATK back to 2800');
  act(g, 1, 'Dark Hole'); settle(g);
  ok(inZ(g, 0, 'gy', 'The Big Saturn') && lp(g, 0) === 4200 && lp(g, 1) === 5200, `both took 2800 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['The Big Saturn'], turn: 2 }, {}] });
  act(g2, 0, 'Dark Hole'); settle(g2); ok(lp(g2, 0) === 8000 && lp(g2, 1) === 8000, 'own Dark Hole: no burn');
});
T('The Bistro Butcher: battle damage makes the opponent draw 2', () => {
  const g = duel({ board: [{ hand: [], m: ['The Bistro Butcher'], turn: 2 }, {}] });
  const h = hand(g, 1); bp(g); atkOn(g, 0, 'The Bistro Butcher', null);
  ok(lp(g, 1) === 6200 && hand(g, 1) === h + 2, `B LP ${lp(g, 1)}, hand ${h} -> ${hand(g, 1)}`);
});
T('The Calculator: ATK = total Levels of your face-up monsters x 300', () => {
  const g = duel({ board: [{ hand: [], m: ['The Calculator', FILL, { n: 'Dark Rabbit', pos: 'set' }], turn: 2 }, { m: ['Celtic Guardian'] }] });
  const c = on(g, 0, 'The Calculator'); ok(E.atk(g, c) === 1800, `ATK ${E.atk(g, c)} (1800)`);
});
T('The Cheerful Coffin: discard up to 3 monsters', () => {
  const g = duel({ board: [{ hand: ['The Cheerful Coffin', 'Celtic Guardian', 'Dark Rabbit', 'Gemini Elf', 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'The Cheerful Coffin'); settle(g, 'Celtic Guardian', 'Dark Rabbit', 'Gemini Elf');
  ok(inZ(g, 0, 'gy', 'Celtic Guardian') && inZ(g, 0, 'gy', 'Dark Rabbit') && inZ(g, 0, 'gy', 'Gemini Elf') && inZ(g, 0, 'hand', 'Pot of Greed'), 'three monsters discarded, Pot kept');
});
T('The Creator: send a hand card, Special Summon a GY monster, once per turn', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Dark Hole'], m: ['The Creator'], gy: ['Blue-Eyes White Dragon', 'Celtic Guardian'], turn: 2 }, {}] });
  act(g, 0, 'The Creator'); settle(g, 'Blue-Eyes White Dragon', 'Pot of Greed');
  ok(on(g, 0, 'Blue-Eyes White Dragon') && cnt(g, 0, 'gy') === 2, 'Blue-Eyes summoned, a hand card sent');
  ok(!canAct(g, 0, 'The Creator'), 'once per turn');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['The Creator'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be Special Summoned from the GY');
});
T('The Creator Incarnate: Tribute it to summon The Creator from hand', () => {
  const g = duel({ board: [{ hand: ['The Creator'], m: ['The Creator Incarnate'], turn: 2 }, {}] });
  act(g, 0, 'The Creator Incarnate'); settle(g);
  ok(on(g, 0, 'The Creator') && inZ(g, 0, 'gy', 'The Creator Incarnate'), 'The Creator summoned');
  const g2 = duel({ board: [{ hand: [], m: ['The Creator Incarnate'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Creator Incarnate'), 'not offered without The Creator in hand');
});
T('The Dark Door: only 1 monster can attack each Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Celtic Guardian'], turn: 2 }, { st: [up('The Dark Door')] }] });
  bp(g); atkOn(g, 0, FILL, null);
  ok(lp(g, 1) === 6000 && !canAtk(g, on(g, 0, 'Celtic Guardian'), null), 'second monster cannot attack');
});
T('The Dragon Dwelling in the Deep: counters each Standby, Fish/Sea Serpent gain 200 each when it leaves', () => {
  const g = duel({ board: [{ hand: [], m: ['The Dragon Dwelling in the Deep', '7 Colored Fish'], turn: 2 }, { hand: ['Fissure'] }] });
  const d = on(g, 0, 'The Dragon Dwelling in the Deep');
  Bturn(g);
  const n = Object.values(d.ctr || {}).reduce((a, b) => a + b, 0);
  ok(n === 2, `2 Ocean Counters after both Standby Phases (${n})`);
  act(g, 1, 'Fissure'); settle(g);
  const f = on(g, 0, '7 Colored Fish');
  ok(inZ(g, 0, 'gy', 'The Dragon Dwelling in the Deep') && E.atk(g, f) === 1800 + 200 * n, `Fish ATK ${E.atk(g, f)}`);
});
T('The Dragon\'s Bead: discard to negate a Trap that targets a face-up Dragon', () => {
  const g = duel({ board: [{ hand: ['Luster Dragon', 'Pot of Greed'], st: [up('The Dragon\'s Bead')], turn: 2 }, { st: ['Trap Hole'] }] });
  ns(g, 0, 'Luster Dragon', 'Trap Hole', 'The Dragon\'s Bead', 'Pot of Greed');
  toIdle(g, 'Pot of Greed');
  ok(on(g, 0, 'Luster Dragon') && inZ(g, 1, 'gy', 'Trap Hole') && inZ(g, 0, 'gy', 'Pot of Greed'), 'Luster Dragon survives, Trap Hole destroyed, Pot discarded');
});
T('The Emperor\'s Holiday: equip effects are negated', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: ['Celtic Guardian'], turn: 2 }, { st: [up('The Emperor\'s Holiday')] }] });
  act(g, 0, 'Black Pendant'); settle(g, 'Celtic Guardian');
  const c = on(g, 0, 'Celtic Guardian'); ok(E.atk(g, c) === 1400, `Celtic ATK ${E.atk(g, c)} (1400)`);
  const g2 = duel({ board: [{ hand: ['Black Pendant'], m: ['Celtic Guardian'], turn: 2 }, {}] });
  act(g2, 0, 'Black Pendant'); settle(g2, 'Celtic Guardian'); ok(E.atk(g2, on(g2, 0, 'Celtic Guardian')) === 1900, 'control: Black Pendant gives +500');
});
T('The Eye of Truth: opponent with a Spell in hand gains 1000 in their Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: [up('The Eye of Truth')], turn: 2 }, { hand: ['Pot of Greed'] }] });
  Bturn(g); ok(lp(g, 1) === 9000, `B LP ${lp(g, 1)} (9000)`);
  const g2 = duel({ board: [{ hand: [], st: [up('The Eye of Truth')], turn: 2 }, { hand: [FILL] }] });
  Bturn(g2); ok(lp(g2, 1) === 8000 || g2.p[1].hand.some(c => E.lib.isSpell(c)), `no Spell: B LP ${lp(g2, 1)}`);
});
T('The Fiend Megacyber: Special Summon when the opponent has 2+ more monsters', () => {
  const g = duel({ board: [{ hand: ['The Fiend Megacyber'], m: [FILL], turn: 2 }, { m: [FILL, FILL, FILL] }] });
  const c = cardIn(g, 0, 'hand', 'The Fiend Megacyber'); ok(hasOpt(g, 'sp:' + c.u), 'offered with 1 vs 3');
  choose(g, 'sp:' + c.u); settle(g); ok(on(g, 0, 'The Fiend Megacyber'), 'summoned');
  const g2 = duel({ board: [{ hand: ['The Fiend Megacyber'], m: [FILL], turn: 2 }, { m: [FILL, FILL] }] });
  ok(!hasOpt(g2, 'sp:' + cardIn(g2, 0, 'hand', 'The Fiend Megacyber').u), 'not offered with 1 vs 2');
});
T('The First Sarcophagus: Second and Third placed in opponent End Phases, then Spirit of the Pharaoh', () => {
  const g = duel({ board: [{ hand: ['The Second Sarcophagus', 'The Third Sarcophagus', 'Spirit of the Pharaoh'], st: [up('The First Sarcophagus')], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'The Second Sarcophagus'), 'The Second Sarcophagus cannot be activated from hand');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'st', 'The Second Sarcophagus') && !inZ(g, 0, 'st', 'The Third Sarcophagus'), 'Second placed after B\'s first End Phase');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(on(g, 0, 'Spirit of the Pharaoh') && cnt(g, 0, 'gy', 'The First Sarcophagus') === 1 && inZ(g, 0, 'gy', 'The Third Sarcophagus') && inZ(g, 0, 'gy', 'The Second Sarcophagus'), 'all 3 sent, Spirit of the Pharaoh summoned');
});
T('The First Sarcophagus: if one is removed, all go to the GY', () => {
  const g = duel({ board: [{ hand: ['The Second Sarcophagus'], st: [up('The First Sarcophagus')], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'st', 'The Second Sarcophagus'), 'Second placed'); endTurn(g); toIdle(g);
  act(g, 1, 'Mystical Space Typhoon'); settle(g, 'The Second Sarcophagus');
  ok(inZ(g, 0, 'gy', 'The First Sarcophagus') && inZ(g, 0, 'gy', 'The Second Sarcophagus'), 'both in GY');
});
T('The Flute of Summoning Dragon: needs Lord of D., summons up to 2 Dragons from hand', () => {
  const g = duel({ board: [{ hand: ['The Flute of Summoning Dragon', 'Blue-Eyes White Dragon', 'Luster Dragon'], m: ['Lord of D.'], turn: 2 }, {}] });
  act(g, 0, 'The Flute of Summoning Dragon'); settle(g, 'Blue-Eyes White Dragon', 'Luster Dragon');
  ok(on(g, 0, 'Blue-Eyes White Dragon') && on(g, 0, 'Luster Dragon'), 'both Dragons summoned');
  const g2 = duel({ board: [{ hand: ['The Flute of Summoning Dragon', 'Blue-Eyes White Dragon'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Flute of Summoning Dragon'), 'not offered without Lord of D.');
});
T('The Flute of Summoning Kuriboh: Kuriboh from Deck to hand or field', () => {
  const g = duel({ board: [{ hand: ['The Flute of Summoning Kuriboh'], deckTop: [FILL, 'Kuriboh'], turn: 2 }, {}] });
  act(g, 0, 'The Flute of Summoning Kuriboh'); settle(g, 'Kuriboh', 'hand', 'Add');
  ok(inZ(g, 0, 'hand', 'Kuriboh') || on(g, 0, 'Kuriboh'), `Kuriboh left the Deck (hand ${inZ(g, 0, 'hand', 'Kuriboh')}, field ${!!on(g, 0, 'Kuriboh')})`);
  const g2 = duel({ board: [{ hand: ['The Flute of Summoning Kuriboh'], deckTop: [FILL, 'Winged Kuriboh'], turn: 2 }, {}] });
  act(g2, 0, 'The Flute of Summoning Kuriboh'); settle(g2, 'Winged Kuriboh', 'Special', 'Summon');
  ok(on(g2, 0, 'Winged Kuriboh') || inZ(g2, 0, 'hand', 'Winged Kuriboh'), 'Winged Kuriboh taken');
  const g3 = duel({ board: [{ hand: ['The Flute of Summoning Kuriboh'], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'The Flute of Summoning Kuriboh'), 'not offered with no Kuriboh in Deck');
});
T('The Forceful Sentry: look at the hand, return 1 card to the Deck', () => {
  const g = duel({ board: [{ hand: ['The Forceful Sentry'], turn: 2 }, { hand: ['Dark Hole', FILL] }] });
  const d = g.p[1].deck.length; act(g, 0, 'The Forceful Sentry'); settle(g, 'Dark Hole');
  ok(!inZ(g, 1, 'hand', 'Dark Hole') && g.p[1].deck.length === d + 1 && g.p[1].deck.some(c => E.name(c) === 'Dark Hole'), 'Dark Hole shuffled into B\'s Deck');
});
T('The Forces of Darkness: 2 Dark World monsters from GY to hand', () => {
  const g = duel({ board: [{ hand: [], st: ['The Forces of Darkness'], gy: ['Broww, Huntsman of Dark World', 'Beiige, Vanguard of Dark World', FILL], turn: 2 }, {}] });
  act(g, 0, 'The Forces of Darkness'); settle(g, 'Broww', 'Beiige');
  ok(inZ(g, 0, 'hand', 'Broww, Huntsman of Dark World') && inZ(g, 0, 'hand', 'Beiige, Vanguard of Dark World'), 'both added');
  const g2 = duel({ board: [{ hand: [], st: ['The Forces of Darkness'], gy: ['Broww, Huntsman of Dark World', FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Forces of Darkness'), 'not offered with only 1 Dark World');
});
T('The Forgiving Maiden: Tribute to return a monster destroyed by battle this turn', () => {
  const g = duel({ board: [{ hand: [], m: ['The Forgiving Maiden', 'Celtic Guardian'], turn: 2 }, { m: ['Archfiend Soldier'] }] });
  bp(g); atkOn(g, 0, 'Celtic Guardian', 'Archfiend Soldier');
  ok(inZ(g, 0, 'gy', 'Celtic Guardian'), 'Celtic destroyed');
  choose(g, 'endbp'); settle(g);
  ok(canAct(g, 0, 'The Forgiving Maiden'), 'Maiden effect offered in Main Phase 2');
  act(g, 0, 'The Forgiving Maiden'); settle(g, 'Celtic Guardian');
  ok(inZ(g, 0, 'hand', 'Celtic Guardian') && inZ(g, 0, 'gy', 'The Forgiving Maiden'), 'Celtic back to hand, Maiden Tributed');
  // ruling: it can also be used before the battle (like Last Will)
  const g2 = duel({ board: [{ hand: [], m: ['The Forgiving Maiden', 'Celtic Guardian'], turn: 2 }, { m: ['Archfiend Soldier'] }] });
  act(g2, 0, 'The Forgiving Maiden'); settle(g2); bp(g2); atkOn(g2, 0, 'Celtic Guardian', 'Archfiend Soldier'); toIdle(g2);
  ok(inZ(g2, 0, 'hand', 'Celtic Guardian'), 'used first: Celtic returns to hand when destroyed by battle');
});
T('The Gift of Greed: opponent draws 2', () => {
  const g = duel({ board: [{ hand: [], st: ['The Gift of Greed'], turn: 2 }, {}] });
  const h = hand(g, 1); act(g, 0, 'The Gift of Greed'); settle(g);
  ok(hand(g, 1) === h + 2 && hand(g, 0) === 1, `B hand ${h} -> ${hand(g, 1)}`);
});
T('The Grave of Enkindling: after a battle destruction, both summon 1 from GY in Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Celtic Guardian'], st: ['The Grave of Enkindling'], gy: ['Luster Dragon'], turn: 2 }, { m: ['Archfiend Soldier'], gy: ['Dark Rabbit'] }] });
  bp(g); atkOn(g, 0, 'Celtic Guardian', 'Archfiend Soldier', 'The Grave of Enkindling', 'Luster Dragon', 'Dark Rabbit');
  toIdle(g, 'Luster Dragon', 'Dark Rabbit');
  const a = on(g, 0, 'Luster Dragon') || on(g, 0, 'Celtic Guardian'), b = on(g, 1, 'Dark Rabbit');
  ok(a && b && a.pos === 'def' && b.pos === 'def' && inZ(g, 0, 'gy', 'The Grave of Enkindling'), `both Special Summoned in Defense (A ${a && E.name(a)} ${a && a.pos}, B ${b && b.pos})`);
  if (a) ok(!hasOpt(g, 'pos:' + a.u), 'its position cannot be changed manually');
});
T('The Graveyard in the Fourth Dimension: 2 LV monsters from GY to Deck', () => {
  const g = duel({ board: [{ hand: ['The Graveyard in the Fourth Dimension'], gy: ['Armed Dragon LV3', 'Armed Dragon LV5', FILL], turn: 2 }, {}] });
  const d = g.p[0].deck.length; act(g, 0, 'The Graveyard in the Fourth Dimension'); settle(g, 'Armed Dragon LV3', 'Armed Dragon LV5');
  ok(!inZ(g, 0, 'gy', 'Armed Dragon LV3') && !inZ(g, 0, 'gy', 'Armed Dragon LV5') && g.p[0].deck.length === d + 2, 'both LV monsters shuffled into the Deck');
  const g2 = duel({ board: [{ hand: ['The Graveyard in the Fourth Dimension'], gy: ['Armed Dragon LV3', FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Graveyard in the Fourth Dimension'), 'not offered with 1 LV monster');
});
T('The Hunter with 7 Weapons: declared Type, +1000 in damage calculation', () => {
  const g = duel({ board: [{ hand: ['The Hunter with 7 Weapons'], turn: 2 }, { m: ['Archfiend Soldier'] }] });
  ns(g, 0, 'The Hunter with 7 Weapons', 'Fiend');
  const h = on(g, 0, 'The Hunter with 7 Weapons'); ok(E.atk(g, h) === 1000, 'ATK 1000 outside battle');
  bp(g); atkOn(g, 0, 'The Hunter with 7 Weapons', 'Archfiend Soldier');
  ok(inZ(g, 1, 'gy', 'Archfiend Soldier') && on(g, 0, 'The Hunter with 7 Weapons') && lp(g, 1) === 7900, `Soldier destroyed, B LP ${lp(g, 1)}`);
});
T('The Immortal of Thunder: FLIP gain 3000; sent from field to GY, lose 5000', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'The Immortal of Thunder', pos: 'set' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  const c = on(g, 0, 'The Immortal of Thunder'); choose(g, 'flip:' + c.u); settle(g);
  ok(lp(g, 0) === 11000, `LP ${lp(g, 0)} (11000)`);
  Bturn(g); bp(g); atkOn(g, 1, 'Blue-Eyes White Dragon', 'The Immortal of Thunder');
  ok(inZ(g, 0, 'gy', 'The Immortal of Thunder') && lp(g, 0) === 11000 - 1500 - 5000, `LP ${lp(g, 0)} (4500)`);
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: [{ n: 'The Immortal of Thunder', pos: 'set' }], turn: 2 }, {}] });
  act(g2, 0, 'Dark Hole'); settle(g2); ok(lp(g2, 0) === 8000, 'destroyed face-down: no loss');
});
T('The Inexperienced Spy: looks at a card and resolves', () => {
  const g = duel({ board: [{ hand: ['The Inexperienced Spy'], turn: 2 }, { hand: ['Dark Hole'] }] });
  act(g, 0, 'The Inexperienced Spy'); settle(g, 'Dark Hole');
  ok(inZ(g, 0, 'gy', 'The Inexperienced Spy') && inZ(g, 1, 'hand', 'Dark Hole') && idle(g), 'resolved, hand unchanged');
});
T('The Kick Man: when Special Summoned, equip an Equip Spell from the GY', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['The Kick Man', 'Black Pendant'], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); settle(g, 'The Kick Man', 'Black Pendant');
  const k = on(g, 0, 'The Kick Man'), bpd = cardIn(g, 0, 'st', 'Black Pendant');
  ok(k && bpd && bpd.equipTo === k.u && E.atk(g, k) === 1800, `Kick Man ${k && E.atk(g, k)} ATK with Black Pendant`);
});
T('The Lady in Wight: Level 3 or lower Zombies survive battle and ignore Spells; Skull Servant in the GY', () => {
  // ENGINE gaps documented in the script: the GY name change, and a Dark Hole that destroys the Lady at the same time
  const g = duel({ board: [{ hand: [], m: ['The Lady in Wight', 'Armored Zombie'], turn: 2 }, { hand: ['Hammer Shot'] }] });
  Bturn(g); act(g, 1, 'Hammer Shot'); settle(g);
  ok(on(g, 0, 'Armored Zombie') && on(g, 0, 'The Lady in Wight'), 'Armored Zombie unaffected by Hammer Shot');
  const g2 = duel({ board: [{ hand: [], m: ['The Lady in Wight', 'Armored Zombie'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g2); atkOn(g2, 0, 'Armored Zombie', 'Blue-Eyes White Dragon');
  ok(on(g2, 0, 'Armored Zombie') && lp(g2, 0) === 6500, `Armored Zombie survives battle, A took 1500 (${lp(g2, 0)})`);
});
T('The Last Warrior from Another Planet: Fusion, destroys your other monsters, no one can Summon', () => {
  const W = 'The Last Warrior from Another Planet';
  const g = duel({ ex0: [W], board: [{ hand: ['Polymerization', 'Zombyra the Dark', 'Maryokutai', FILL], m: ['Celtic Guardian'], turn: 2 }, { hand: [FILL] }] });
  act(g, 0, 'Polymerization'); settle(g, W, 'Zombyra', 'Maryokutai', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, W) && inZ(g, 0, 'gy', 'Celtic Guardian'), 'Last Warrior summoned, Celtic Guardian destroyed');
  const f = g.p[0].hand.find(c => E.name(c) === FILL);
  ok(f && !hasOpt(g, 'ns:' + f.u) && hasOpt(g, 'set:' + f.u), 'A cannot Normal Summon but can Set');
  Bturn(g); const fb = g.p[1].hand.find(c => E.name(c) === FILL);
  ok(fb && !hasOpt(g, 'ns:' + fb.u), 'B cannot Normal Summon');
});
T('The Law of the Normal: needs 5 Level 2 or lower Normals; both discard, all else destroyed', () => {
  const N = 'Dancing Elf';
  const g = duel({ board: [{ hand: ['The Law of the Normal', 'Pot of Greed'], m: [N, N, N, N, N], st: ['Mirror Force'], turn: 2 }, { hand: ['Dark Hole'], m: ['Blue-Eyes White Dragon'], st: ['Trap Hole'] }] });
  act(g, 0, 'The Law of the Normal'); settle(g);
  ok(cnt(g, 0, 'm', N) === 5 && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Trap Hole') && inZ(g, 0, 'gy', 'Mirror Force'), 'Normals stay, the rest destroyed');
  ok(hand(g, 0) === 0 && hand(g, 1) === 0, `both hands discarded (A ${hand(g, 0)}, B ${hand(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['The Law of the Normal'], m: [N, N, N, N, FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Law of the Normal'), 'not offered with 4');
});
T('The League of Uniform Nomenclature: summon copies of a Level 2 or lower Normal from the Deck', () => {
  const N = 'Dancing Elf';
  const g = duel({ board: [{ hand: [], m: [N], st: ['The League of Uniform Nomenclature'], deckTop: [FILL, N, N], turn: 2 }, {}] });
  act(g, 0, 'The League of Uniform Nomenclature'); settle(g, N);
  ok(cnt(g, 0, 'm', N) === 3, `${cnt(g, 0, 'm', N)} Dancing Elf on the field (3)`);
});
T('The Legendary Fisherman: with Umi, cannot be attacked and ignores Spells', () => {
  const g = duel({ board: [{ hand: ['Umi', 'Dark Hole'], m: [FILL], turn: 2 }, { m: ['The Legendary Fisherman'] }] });
  act(g, 0, 'Umi'); settle(g);
  bp(g); const fi = on(g, 1, 'The Legendary Fisherman');
  ok(!canAtk(g, on(g, 0, FILL), fi) && canAtk(g, on(g, 0, FILL), null), 'cannot attack Fisherman, direct attack allowed');
  atkOn(g, 0, FILL, null); ok(lp(g, 1) === 6000, 'direct attack hit');
  choose(g, 'endbp'); settle(g); act(g, 0, 'Dark Hole'); settle(g);
  ok(on(g, 1, 'The Legendary Fisherman') && inZ(g, 0, 'gy', FILL), 'Dark Hole destroyed Warwolf, not Fisherman');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['The Legendary Fisherman'] }] });
  bp(g2); ok(canAtk(g2, on(g2, 0, FILL), on(g2, 1, 'The Legendary Fisherman')), 'without Umi it can be attacked');
});
T('The Little Swordsman of Aile: Tribute a monster for +700', () => {
  const g = duel({ board: [{ hand: [], m: ['The Little Swordsman of Aile', 'Dark Rabbit'], turn: 2 }, {}] });
  act(g, 0, 'The Little Swordsman of Aile'); settle(g, 'Dark Rabbit');
  const s = on(g, 0, 'The Little Swordsman of Aile');
  ok(E.atk(g, s) === 1500 && inZ(g, 0, 'gy', 'Dark Rabbit'), `ATK ${E.atk(g, s)} (1500), Rabbit Tributed`);
  Bturn(g); ok(E.atk(g, s) === 800, 'back to 800 next turn');
});
T('The Mask of Remnants: shuffles itself into the Deck', () => {
  const g = duel({ board: [{ hand: ['The Mask of Remnants'], turn: 2 }, {}] });
  const d = g.p[0].deck.length; act(g, 0, 'The Mask of Remnants'); settle(g);
  ok(g.p[0].deck.length === d + 1 && g.p[0].deck.some(c => E.name(c) === 'The Mask of Remnants') && !inZ(g, 0, 'gy', 'The Mask of Remnants'), 'in the Deck, not the GY');
});
T('The Masked Beast: Ritual Summon with Curse of the Masked Beast', () => {
  const g = duel({ board: [{ hand: ['Curse of the Masked Beast', 'The Masked Beast'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Curse of the Masked Beast'), 'Ritual Spell offered');
  act(g, 0, 'Curse of the Masked Beast'); settle(g, 'The Masked Beast', FILL, 'Attack');
  ok(on(g, 0, 'The Masked Beast') && cnt(g, 0, 'gy', FILL) === 2, 'The Masked Beast summoned, 2 Warwolves Tributed');
  const g2 = duel({ board: [{ hand: ['The Masked Beast'], m: [FILL, FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g2, cardIn(g2, 0, 'hand', 'The Masked Beast')), 'cannot be Normal Summoned');
});
T('The Paths of Destiny: each player gains or takes 2000', () => {
  for (let s = 1; s <= 3; s++) {
    const g = duel({ seed: s, board: [{ hand: [], st: ['The Paths of Destiny'], turn: 2 }, {}] });
    act(g, 0, 'The Paths of Destiny'); settle(g);
    ok([6000, 10000].includes(lp(g, 0)) && [6000, 10000].includes(lp(g, 1)), `seed ${s}: A ${lp(g, 0)}, B ${lp(g, 1)}`);
  }
});
T('The Puppet Magic of Dark Ruler: banish Levels equal to a GY Fiend, summon it', () => {
  const g = duel({ board: [{ hand: ['The Puppet Magic of Dark Ruler'], m: [FILL, 'Celtic Guardian'], gy: ['Archfiend Soldier'], turn: 2 }, {}] });
  act(g, 0, 'The Puppet Magic of Dark Ruler'); settle(g, 'Archfiend Soldier', 'Celtic Guardian', 'Attack');
  ok(on(g, 0, 'Archfiend Soldier') && cnt(g, 0, 'ban') === 1 && cnt(g, 0, 'm') === 2, 'Soldier summoned, 1 Level 4 banished');
  const g2 = duel({ board: [{ hand: ['The Puppet Magic of Dark Ruler'], m: ['Dancing Elf'], gy: ['Archfiend Soldier'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Puppet Magic of Dark Ruler'), 'not offered when no Levels add up');
});
T('The Regulation of Tribe: declared Type cannot attack; Tribute each Standby or destroy it', () => {
  const g = duel({ board: [{ hand: [], st: ['The Regulation of Tribe'], m: ['Celtic Guardian', 'Dark Rabbit'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'The Regulation of Tribe'); settle(g, 'Beast-Warrior');
  Bturn(g); bp(g);
  ok(!canAtk(g, on(g, 1, FILL), null) && !hasOpt(g, 'atk:' + on(g, 1, FILL).u), 'Beast-Warrior cannot attack');
  choose(g, 'endbp'); settle(g); endTurn(g, 'Dark Rabbit'); toIdle(g, 'Dark Rabbit');
  ok(inZ(g, 0, 'gy', 'Dark Rabbit') && inZ(g, 0, 'st', 'The Regulation of Tribe'), 'Dark Rabbit Tributed, Regulation stays');
  const g2 = duel({ board: [{ hand: [], st: ['The Regulation of Tribe'], turn: 2 }, {}] });
  act(g2, 0, 'The Regulation of Tribe'); settle(g2, 'Dragon'); endTurn(g2); toIdle(g2); endTurn(g2); toIdle(g2);
  ok(inZ(g2, 0, 'gy', 'The Regulation of Tribe'), 'no monster to Tribute: destroyed');
});
T('The Reliable Guardian: +700 DEF until end of turn', () => {
  const g = duel({ board: [{ hand: ['The Reliable Guardian'], m: ['Celtic Guardian'], turn: 2 }, {}] });
  act(g, 0, 'The Reliable Guardian'); settle(g, 'Celtic Guardian');
  const c = on(g, 0, 'Celtic Guardian'); ok(E.def(g, c) === 1900, `DEF ${E.def(g, c)} (1900)`);
  Bturn(g); ok(E.def(g, c) === 1200, 'back to 1200');
});
T('The Rock Spirit: Special Summon by banishing an EARTH from GY; +300 in opponent\'s Battle Phase', () => {
  const g = duel({ board: [{ hand: ['The Rock Spirit'], gy: [FILL], turn: 2 }, { m: ['Celtic Guardian'] }] });
  const r = cardIn(g, 0, 'hand', 'The Rock Spirit');
  ok(!hasOpt(g, 'ns:' + r.u) && !hasOpt(g, 'set:' + r.u), 'cannot be Normal Summoned or Set');
  choose(g, 'sp:' + r.u); settle(g, FILL);
  ok(on(g, 0, 'The Rock Spirit') && inZ(g, 0, 'ban', FILL), 'summoned, Warwolf banished');
  ok(E.atk(g, r) === 1700, 'ATK 1700 on own turn');
  Bturn(g); bp(g); ok(E.atk(g, r) === 2000, `ATK ${E.atk(g, r)} in B's Battle Phase (2000)`);
  const g2 = duel({ board: [{ hand: ['The Rock Spirit'], gy: ['Archfiend Soldier'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + cardIn(g2, 0, 'hand', 'The Rock Spirit').u), 'no EARTH in GY: not offered');
});
T('The Sanctuary in the Sky: no battle damage to a Fairy\'s controller', () => {
  const g = duel({ board: [{ hand: ['The Sanctuary in the Sky'], m: ['Dancing Elf', FILL], turn: 2 }, { m: ['Celtic Guardian'] }] });
  act(g, 0, 'The Sanctuary in the Sky'); settle(g);
  bp(g); atkOn(g, 0, 'Dancing Elf', 'Celtic Guardian');
  ok(lp(g, 0) === 8000 && inZ(g, 0, 'gy', 'Dancing Elf'), `Fairy lost, no damage (${lp(g, 0)})`);
  atkOn(g, 0, FILL, 'Celtic Guardian'); ok(lp(g, 1) === 7400, 'non-Fairy battle damages normally');
});
T('The Second and Third Sarcophagus cannot be activated on their own', () => {
  const g = duel({ board: [{ hand: ['The Second Sarcophagus', 'The Third Sarcophagus'], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'The Second Sarcophagus') && !canAct(g, 0, 'The Third Sarcophagus'), 'neither offered');
});
T('The Secret of the Bandit: battle damage by the selected monster makes the opponent discard 1', () => {
  const g = duel({ board: [{ hand: ['The Secret of the Bandit'], m: [FILL], turn: 2 }, { hand: ['Dark Hole', 'Pot of Greed'] }] });
  act(g, 0, 'The Secret of the Bandit'); settle(g, FILL);
  const h = hand(g, 1); bp(g); atkOn(g, 0, FILL, null);
  ok(hand(g, 1) === h - 1 && cnt(g, 1, 'gy') === 1, `B discarded 1 (hand ${h} -> ${hand(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['The Secret of the Bandit'], m: [FILL], turn: 2 }, {}] });
  bp(g2); choose(g2, 'endbp'); settle(g2); ok(!canAct(g2, 0, 'The Secret of the Bandit'), 'not in Main Phase 2');
});
T('The Selection: pay 1000, negate a Summon of a Type already on the field', () => {
  const g = duel({ board: [{ hand: ['Axe Raider', 'Dark Rabbit'], m: ['Celtic Guardian'], turn: 2 }, { st: ['The Selection'] }] });
  ns(g, 0, 'Axe Raider', 'The Selection');
  ok(!on(g, 0, 'Axe Raider') && inZ(g, 0, 'gy', 'Axe Raider') && lp(g, 1) === 7000, `Axe Raider negated and destroyed, B LP ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Dark Rabbit'], m: ['Celtic Guardian'], turn: 2 }, { st: ['The Selection'] }] });
  ns(g2, 0, 'Dark Rabbit'); ok(on(g2, 0, 'Dark Rabbit') && lp(g2, 1) === 8000, 'a Beast with no Beast on the field is summoned');
});
T('The Shallow Grave: each player summons 1 from their GY face-down Defense', () => {
  const g = duel({ board: [{ hand: ['The Shallow Grave'], gy: ['Blue-Eyes White Dragon'], turn: 2 }, { gy: ['Celtic Guardian'] }] });
  act(g, 0, 'The Shallow Grave'); settle(g, 'Blue-Eyes White Dragon', 'Celtic Guardian');
  const a = on(g, 0, 'Blue-Eyes White Dragon'), b = on(g, 1, 'Celtic Guardian');
  ok(a && b && a.pos === 'set' && b.pos === 'set', 'both summoned face-down Defense');
  const g2 = duel({ board: [{ hand: ['The Shallow Grave'], gy: ['Blue-Eyes White Dragon'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Shallow Grave'), 'not offered when the opponent has no monster in GY');
});
T('The Spell Absorbing Life: flip all face-down monsters, 400 LP per Effect Monster', () => {
  const g = duel({ board: [{ hand: [], st: ['The Spell Absorbing Life'], m: [{ n: 'Sangan', pos: 'set' }], turn: 2 }, { m: [{ n: 'Magician of Faith', pos: 'set' }, 'Celtic Guardian', 'The Bistro Butcher'] }] });
  act(g, 0, 'The Spell Absorbing Life'); settle(g);
  ok(on(g, 0, 'Sangan').pos === 'def' && on(g, 1, 'Magician of Faith').pos === 'def', 'face-down monsters flipped to Defense');
  ok(lp(g, 0) === 9200, `A gained 1200 for 3 Effect Monsters (${lp(g, 0)})`);
  ok(idle(g), 'back to idle with no flip effect prompt');
});
T('The Stern Mystic: FLIP reveals face-down cards and puts them back', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'The Stern Mystic', pos: 'set' }], turn: 2 }, { m: [{ n: 'Magician of Faith', pos: 'set' }], st: ['Mirror Force'] }] });
  choose(g, 'flip:' + on(g, 0, 'The Stern Mystic').u); settle(g);
  ok(on(g, 1, 'Magician of Faith').pos === 'set' && cardIn(g, 1, 'st', 'Mirror Force').pos === 'set' && idle(g), 'cards stay face-down, no flip effect');
});
T('The Thing in the Crater: destroyed, Special Summon a Pyro from hand', () => {
  const g = duel({ board: [{ hand: ['Flame Champion'], m: ['The Thing in the Crater'], turn: 2 }, { hand: ['Hammer Shot'] }] });
  Bturn(g); act(g, 1, 'Hammer Shot'); settle(g, 'Flame Champion');
  ok(inZ(g, 0, 'gy', 'The Thing in the Crater') && on(g, 0, 'Flame Champion'), 'Flame Champion summoned');
});
T('The Tricky: Special Summon by discarding 1 card', () => {
  const g = duel({ board: [{ hand: ['The Tricky', 'Pot of Greed'], turn: 2 }, {}] });
  const t = cardIn(g, 0, 'hand', 'The Tricky'); choose(g, 'sp:' + t.u); settle(g, 'Pot of Greed', 'Attack');
  ok(on(g, 0, 'The Tricky') && inZ(g, 0, 'gy', 'Pot of Greed') && hasOpt(g, 'ns:'), 'summoned, Pot discarded, Normal Summon still available');
});
T('The Trojan Horse: counts as 2 Tributes for an EARTH monster', () => {
  const g = duel({ board: [{ hand: ['Gaia The Fierce Knight', 'Blue-Eyes White Dragon'], m: ['The Trojan Horse'], turn: 2 }, {}] });
  const gk = cardIn(g, 0, 'hand', 'Gaia The Fierce Knight'), be = cardIn(g, 0, 'hand', 'Blue-Eyes White Dragon');
  ok(canAct(g, 0, 'The Trojan Horse') && !hasOpt(g, 'ns:' + be.u), 'Trojan Horse Tribute offered, Blue-Eyes not summonable');
  act(g, 0, 'The Trojan Horse'); settle(g, 'Gaia The Fierce Knight', 'Attack');
  ok(on(g, 0, 'Gaia The Fierce Knight') && inZ(g, 0, 'gy', 'The Trojan Horse') && inZ(g, 0, 'hand', 'Blue-Eyes White Dragon'), 'Gaia Tribute Summoned with only Trojan Horse');
  ok(!hasOpt(g, 'ns:') && !hasOpt(g, 'set:'), 'that used the Normal Summon');
});
T('The Unfriendly Amazon: Tribute another monster each Standby or it is destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['The Unfriendly Amazon', 'Dark Rabbit'], turn: 2 }, {}] });
  toIdle(g, 'Dark Rabbit');
  ok(on(g, 0, 'The Unfriendly Amazon') && inZ(g, 0, 'gy', 'Dark Rabbit'), 'Dark Rabbit Tributed, Amazon stays');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'The Unfriendly Amazon'), 'nothing to Tribute: Amazon destroyed');
});
T('The Unhappy Girl: not destroyed by battle in Attack Position; the attacker cannot attack again', () => {
  const g = duel({ board: [{ hand: [], m: ['Celtic Guardian'], turn: 2 }, { m: ['The Unhappy Girl'] }] });
  bp(g); atkOn(g, 0, 'Celtic Guardian', 'The Unhappy Girl');
  ok(on(g, 1, 'The Unhappy Girl') && lp(g, 1) === 7000, `Girl survives, B took 1000 (${lp(g, 1)})`);
  choose(g, 'endbp'); settle(g); const cg = on(g, 0, 'Celtic Guardian');
  ok(!hasOpt(g, 'pos:' + cg.u), 'Celtic cannot change position');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g); bp(g);
  ok(!hasOpt(g, 'atk:' + cg.u), 'Celtic cannot attack next turn');
});
T('The Unhappy Maiden: destroyed by battle ends the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Celtic Guardian'], turn: 2 }, { m: ['The Unhappy Maiden'] }] });
  bp(g); atkOn(g, 0, FILL, 'The Unhappy Maiden'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'The Unhappy Maiden') && !hasOpt(g, 'atk:' + on(g, 0, 'Celtic Guardian').u) && lp(g, 1) === 6000, `Battle Phase ended (B LP ${lp(g, 1)})`);
});
T('The Warrior Returning Alive: Warrior from GY to hand', () => {
  const g = duel({ board: [{ hand: ['The Warrior Returning Alive'], gy: ['Celtic Guardian', 'Dark Rabbit'], turn: 2 }, {}] });
  act(g, 0, 'The Warrior Returning Alive'); settle(g, 'Celtic Guardian');
  ok(inZ(g, 0, 'hand', 'Celtic Guardian') && inZ(g, 0, 'gy', 'Dark Rabbit'), 'Celtic Guardian added');
  const g2 = duel({ board: [{ hand: ['The Warrior Returning Alive'], gy: ['Dark Rabbit'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'The Warrior Returning Alive'), 'not offered without a Warrior');
});
T('The Wicked Avatar: 3 Tributes; ATK highest +100; opponent locked out of Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['The Wicked Avatar'], m: [FILL, FILL, 'Dark Rabbit'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], hand: ['Dark Hole'], st: ['Mirror Force'] }] });
  const c = cardIn(g, 0, 'hand', 'The Wicked Avatar'); choose(g, 'sp:' + c.u); settle(g, FILL, 'Dark Rabbit', 'Attack');
  const a = on(g, 0, 'The Wicked Avatar'); ok(a && cnt(g, 0, 'gy') === 3, 'Tribute Summoned with 3');
  ok(E.atk(g, a) === 3100 && E.def(g, a) === 3100, `ATK/DEF ${E.atk(g, a)}/${E.def(g, a)} (3100)`);
  bp(g); atkOn(g, 0, 'The Wicked Avatar', 'Blue-Eyes White Dragon', 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 0, 'The Wicked Avatar'), 'no Mirror Force, Blue-Eyes destroyed');
  choose(g, 'endbp'); settle(g); Bturn(g); ok(!canAct(g, 1, 'Dark Hole'), 'B cannot activate Dark Hole on its turn');
  const g2 = duel({ board: [{ hand: ['The Wicked Avatar'], m: [FILL, FILL], turn: 2 }, {}] });
  const c2 = cardIn(g2, 0, 'hand', 'The Wicked Avatar'); ok(!hasOpt(g2, 'ns:' + c2.u) && !hasOpt(g2, 'sp:' + c2.u), 'not with 2 monsters');
  const g3 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['The Wicked Avatar'], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'Monster Reborn'), 'Monster Reborn cannot revive it');
});
T('The Wicked Dreadroot: 3 Tributes; halves every other monster', () => {
  const g = duel({ board: [{ hand: ['The Wicked Dreadroot'], m: [FILL, FILL, 'Dark Rabbit', 'Celtic Guardian'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'sp:' + cardIn(g, 0, 'hand', 'The Wicked Dreadroot').u); settle(g, FILL, 'Dark Rabbit', 'Attack');
  ok(!hasOpt(g, 'ns:') && !hasOpt(g, 'set:'), 'its Tribute Summon used the Normal Summon');
  const d = on(g, 0, 'The Wicked Dreadroot'), b = on(g, 1, 'Blue-Eyes White Dragon'), cg = on(g, 0, 'Celtic Guardian');
  ok(d && E.atk(g, d) === 4000 && E.atk(g, b) === 1500 && E.def(g, b) === 1250 && E.atk(g, cg) === 700, `Dreadroot ${d && E.atk(g, d)}, Blue-Eyes ${E.atk(g, b)}/${E.def(g, b)}, Celtic ${E.atk(g, cg)}`);
});
T('The Wicked Eraser: ATK = opponent cards x1000; destroyed takes the field; can destroy itself', () => {
  const g = duel({ board: [{ hand: ['The Wicked Eraser'], m: [FILL, FILL, 'Dark Rabbit', 'Celtic Guardian'], st: [up('The A. Forces')], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'] }] });
  choose(g, 'sp:' + cardIn(g, 0, 'hand', 'The Wicked Eraser').u); settle(g, FILL, 'Dark Rabbit', 'Attack');
  const e = on(g, 0, 'The Wicked Eraser'); ok(e && E.atk(g, e) === 2000 && E.def(g, e) === 2000, `ATK/DEF ${e && E.atk(g, e)}/${e && E.def(g, e)} (2000)`);
  ok(canAct(g, 0, 'The Wicked Eraser'), 'self-destroy offered in Main Phase');
  act(g, 0, 'The Wicked Eraser'); settle(g);
  ok(inZ(g, 0, 'gy', 'The Wicked Eraser') && allEmpty(g), 'everything on the field destroyed');
});
T('The Wicked Worm Beast: returns to hand in your End Phase', () => {
  const g = duel({ board: [{ hand: ['The Wicked Worm Beast'], turn: 2 }, {}] });
  ns(g, 0, 'The Wicked Worm Beast'); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', 'The Wicked Worm Beast'), 'back in hand');
});
T('The World Tree: Flower Counters from destroyed Plants; 1 counter for +400/+400', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Bean Soldier', 'Man Eater'], st: [up('The World Tree')], turn: 2 }, { m: ['Mushroom Man'] }] });
  act(g, 0, 'Dark Hole'); settle(g);
  const t = cardIn(g, 0, 'st', 'The World Tree'); const n = Object.values(t.ctr || {}).reduce((a, b) => a + b, 0);
  ok(n === 3, `3 Flower Counters (${n})`);
  const g2 = duel({ board: [{ hand: [], m: ['Bean Soldier', 'Man Eater'], st: [up('The World Tree')], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g2); atkOn(g2, 0, 'Man Eater', 'Blue-Eyes White Dragon'); choose(g2, 'endbp'); settle(g2);
  const t2 = cardIn(g2, 0, 'st', 'The World Tree');
  ok(Object.values(t2.ctr || {}).reduce((a, b) => a + b, 0) === 1, 'battle destruction gives 1 counter');
  ok(canAct(g2, 0, 'The World Tree'), 'World Tree effect offered');
  act(g2, 0, 'The World Tree'); settle(g2, '400', 'Bean Soldier');
  const bs = on(g2, 0, 'Bean Soldier'); ok(E.atk(g2, bs) === 1800 && E.def(g2, bs) === 1700, `Bean Soldier ${E.atk(g2, bs)}/${E.def(g2, bs)} (1800/1700)`);
});
// Goat: the shared scripts of the 'both' cards, quick checks with the Goat card pool
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
  G('The A. Forces, Big March of Animals', () => {
    let g = gduel([{ hand: [], m: ['Celtic Guardian', 'Gemini Elf'], st: [up('The A. Forces')], turn: 2 }, {}]);
    ok(E.atk(g, on(g, 0, 'Celtic Guardian')) === 1800, 'Goat: A. Forces +400');
    g = gduel([{ hand: ['The Big March of Animals'], m: ['Burglar', 'Burglar'], turn: 2 }, {}]);
    act(g, 0, 'The Big March of Animals'); settle(g); ok(E.atk(g, on(g, 0, 'Burglar')) === 1250, `Goat: Big March ${E.atk(g, on(g, 0, 'Burglar'))} (1250)`);
  });
  G('The Creator, Creator Incarnate', () => {
    let g = gduel([{ hand: ['Pot of Greed'], m: ['The Creator'], gy: ['Blue-Eyes White Dragon'], turn: 2 }, {}]);
    act(g, 0, 'The Creator'); settle(g, 'Blue-Eyes White Dragon', 'Pot of Greed'); ok(on(g, 0, 'Blue-Eyes White Dragon'), 'Goat: Creator revives');
    g = gduel([{ hand: ['The Creator'], m: ['The Creator Incarnate'], turn: 2 }, {}]);
    act(g, 0, 'The Creator Incarnate'); settle(g); ok(on(g, 0, 'The Creator'), 'Goat: Incarnate summons The Creator');
  });
  G('The Dark Door, Eye of Truth, Fiend Megacyber', () => {
    let g = gduel([{ hand: [], m: [GF, 'Celtic Guardian'], turn: 2 }, { st: [up('The Dark Door')] }]);
    bp(g); atkOn(g, 0, GF, null); ok(!canAtk(g, on(g, 0, 'Celtic Guardian'), null), 'Goat: Dark Door 1 attack');
    g = gduel([{ hand: [], st: [up('The Eye of Truth')], turn: 2 }, { hand: ['Pot of Greed'] }]);
    Bturn(g); ok(lp(g, 1) === 9000, 'Goat: Eye of Truth +1000');
    g = gduel([{ hand: ['The Fiend Megacyber'], turn: 2 }, { m: [GF, GF] }]);
    ok(hasOpt(g, 'sp:' + cardIn(g, 0, 'hand', 'The Fiend Megacyber').u), 'Goat: Megacyber offered 0 vs 2');
  });
  G('Sarcophagus, Flute of Summoning Dragon', () => {
    let g = gduel([{ hand: ['The Second Sarcophagus', 'The Third Sarcophagus', 'Spirit of the Pharaoh'], st: [up('The First Sarcophagus')], turn: 2 }, {}]);
    for (let i = 0; i < 4; i++) { endTurn(g); toIdle(g); }
    ok(on(g, 0, 'Spirit of the Pharaoh'), 'Goat: Spirit of the Pharaoh summoned');
    g = gduel([{ hand: ['The Flute of Summoning Dragon', 'Blue-Eyes White Dragon', 'Luster Dragon'], m: ['Lord of D.'], turn: 2 }, {}]);
    act(g, 0, 'The Flute of Summoning Dragon'); settle(g, 'Blue-Eyes White Dragon', 'Luster Dragon');
    ok(on(g, 0, 'Blue-Eyes White Dragon') && on(g, 0, 'Luster Dragon'), 'Goat: Flute summons 2');
  });
  G('Last Warrior, Legendary Fisherman, Masked Beast', () => {
    const W = 'The Last Warrior from Another Planet';
    let g = gduel([{ hand: ['Polymerization', 'Zombyra the Dark', 'Maryokutai'], m: ['Celtic Guardian'], turn: 2 }, {}], [W]);
    act(g, 0, 'Polymerization'); settle(g, W, 'Zombyra', 'Maryokutai', 'Attack'); toIdle(g, 'Attack');
    ok(on(g, 0, W) && inZ(g, 0, 'gy', 'Celtic Guardian'), 'Goat: Last Warrior summoned and cleared the field');
    g = gduel([{ hand: ['Umi'], m: [GF], turn: 2 }, { m: ['The Legendary Fisherman'] }]);
    act(g, 0, 'Umi'); settle(g); bp(g); ok(!canAtk(g, on(g, 0, GF), on(g, 1, 'The Legendary Fisherman')), 'Goat: Fisherman not attackable under Umi');
    g = gduel([{ hand: ['Curse of the Masked Beast', 'The Masked Beast'], m: [GF, GF], turn: 2 }, {}]);
    act(g, 0, 'Curse of the Masked Beast'); settle(g, 'The Masked Beast', GF, 'Attack'); ok(on(g, 0, 'The Masked Beast'), 'Goat: Masked Beast Ritual Summoned');
  });
  G('Shallow Grave, Unfriendly Amazon, Wicked Worm Beast, Bistro Butcher, Immortal of Thunder', () => {
    let g = gduel([{ hand: ['The Shallow Grave'], gy: ['Blue-Eyes White Dragon'], turn: 2 }, { gy: ['Celtic Guardian'] }]);
    act(g, 0, 'The Shallow Grave'); settle(g); ok(on(g, 0, 'Blue-Eyes White Dragon') && on(g, 1, 'Celtic Guardian'), 'Goat: Shallow Grave both');
    g = gduel([{ hand: [], m: ['The Unfriendly Amazon'], turn: 2 }, {}]); toIdle(g);
    ok(inZ(g, 0, 'gy', 'The Unfriendly Amazon'), 'Goat: Amazon destroyed with nothing to Tribute');
    g = gduel([{ hand: ['The Wicked Worm Beast'], turn: 2 }, {}]); ns(g, 0, 'The Wicked Worm Beast'); endTurn(g); toIdle(g);
    ok(inZ(g, 0, 'hand', 'The Wicked Worm Beast'), 'Goat: Worm Beast returns');
    g = gduel([{ hand: [], m: ['The Bistro Butcher'], turn: 2 }, {}]); const h = hand(g, 1); bp(g); atkOn(g, 0, 'The Bistro Butcher', null);
    ok(hand(g, 1) === h + 2, 'Goat: Bistro Butcher opponent draws 2');
    g = gduel([{ hand: [], m: [{ n: 'The Immortal of Thunder', pos: 'set' }], turn: 2 }, {}]); choose(g, 'flip:' + on(g, 0, 'The Immortal of Thunder').u); settle(g);
    ok(lp(g, 0) === 11000, 'Goat: Immortal +3000');
  });
}
console.log(fails ? `\n${fails} failed` : '\nAll full-16 review checks passed.');
process.exit(fails ? 1 : 0);
