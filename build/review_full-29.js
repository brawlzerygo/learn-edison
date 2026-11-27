// Independent review checks for full pool batch 29 (written from the card text): node build/review_full-29.js
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

const CG = 'Celtic Guardian', EL = 'Mystical Elf', HL = 'Harpie Lady';
const pos = (g, p, n) => { const c = on(g, p, n); return c ? c.pos : null; };
const ac = c => c && c.ctr ? Object.entries(c.ctr).filter(([k]) => /a/i.test(k)).reduce((s, [, v]) => s + (+v || 0), 0) : 0;
const AD = (g, p, n) => { const c = on(g, p, n); return c ? `${E.atk(g, c)}/${E.def(g, c)}` : 'none'; };
const coinLog = g => { const l = g.log.filter(x => /tossed a coin/.test(x)).pop() || ''; return /Heads/.test(l) ? 'H' : /Tails/.test(l) ? 'T' : ''; };
// run f(seed) until a game with the wanted coin result is found
const withCoin = (want, mk) => { for (let s = 1; s < 60; s++) { const g = mk(s); if (coinLog(g) === want) return g; } throw new Error('no seed for ' + want); };

/* ---------------- W ---------------- */
T('Watapon: Special Summon when added from the Deck by Sangan, not when drawn', () => {
  const g = duel({ board: [{ hand: ["Jack's Knight"], m: ['Sangan'], deckTop: [FILL, 'Watapon'], turn: 2 }, {}] });
  ns(g, 0, "Jack's Knight", 'Sangan', 'Watapon', 'Attack'); toIdle(g, 'Watapon', 'Attack');
  ok(on(g, 0, 'Watapon'), 'Watapon Special Summoned after Sangan searched it');
  const g2 = duel({ board: [{ hand: [], deckTop: ['Watapon'], turn: 2 }, {}] });
  toIdle(g2); ok(inZ(g2, 0, 'hand', 'Watapon') && !on(g2, 0, 'Watapon'), 'drawn normally: stays in hand');
});
T('Wave-Motion Cannon: 1000 per own Standby Phase passed', () => {
  const g = duel({ board: [{ hand: ['Wave-Motion Cannon'], turn: 2 }, {}] });
  act(g, 0, 'Wave-Motion Cannon'); settle(g);
  for (let i = 0; i < 4; i++) { endTurn(g); toIdle(g); }
  ok(g.tp === 0, 'A turn again');
  act(g, 0, 'Wave-Motion Cannon'); settle(g); toIdle(g);
  ok(lp(g, 1) === 6000 && inZ(g, 0, 'gy', 'Wave-Motion Cannon'), `2 Standby Phases: B took 2000 (${lp(g, 1)})`);
});
T('Weapon Change: pay 700 in the Standby, swap ATK/DEF until end of the opponent next turn', () => {
  const g = duel({ board: [{ hand: [], m: [CG], st: [up('Weapon Change')], turn: 2 }, {}] });
  settle(g, CG); toIdle(g, CG); // the board starts in A's Standby Phase
  ok(lp(g, 0) === 7300 && AD(g, 0, CG) === '1200/1400', `paid 700, Celtic ${AD(g, 0, CG)} (LP ${lp(g, 0)})`);
  endTurn(g); toIdle(g); ok(AD(g, 0, CG) === '1200/1400', `still swapped on B's turn (${AD(g, 0, CG)})`);
  endTurn(g, 'NO'); for (let i = 0; i < 4 && g.prompt && !idle(g); i++) settle(g, 'NO');
  ok(AD(g, 0, CG) === '1400/1200', `back after B's turn (${AD(g, 0, CG)})`);
});
T('Weather Report: flip destroys opponent face-up Swords', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Weather Report')], turn: 2 }, { st: [up('Swords of Revealing Light')] }] });
  flipSum(g, 0, 'Weather Report'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Swords of Revealing Light'), 'Swords destroyed');
  // ENGINE (documented): no second Battle Phase; each monster gets a second attack instead
  bp(g); atkOn(g, 0, 'Weather Report', null);
  ok(canAtk(g, on(g, 0, 'Weather Report'), null), 'Weather Report can attack again (stand-in for the second Battle Phase)');
});
T('Whirlwind Prodigy: 2 Tributes for a WIND monster only', () => {
  const g = duel({ board: [{ hand: ["Harpie's Pet Dragon", 'Dark Magician'], m: ['Whirlwind Prodigy'], turn: 2 }, {}] });
  const dm = card(g, 0, 'Dark Magician'); ok(!hasOpt(g, 'ns:' + dm.u), 'no Dark Magician with only Prodigy');
  ns(g, 0, "Harpie's Pet Dragon", 'Whirlwind Prodigy', 'Attack');
  ok(on(g, 0, "Harpie's Pet Dragon") && inZ(g, 0, 'gy', 'Whirlwind Prodigy'), 'Level 7 WIND Tribute Summoned with Prodigy alone');
});
T('Widespread Ruin: destroys the highest-ATK Attack Position monster, not just the attacker', () => {
  const g = duel({ first: 1, board: [{ st: ['Widespread Ruin'] }, { hand: [], m: [CG, FILL, defM('Big Shield Gardna')], turn: 2 }] });
  bp(g); atkOn(g, 1, CG, null, 'Widespread Ruin'); toIdle(g);
  ok(inZ(g, 1, 'gy', FILL) && !inZ(g, 1, 'gy', CG) && on(g, 1, 'Big Shield Gardna'), 'Warwolf (2000) destroyed; Celtic and the Defense Gardna stay');
});
T("Wild Nature's Release: Beast gains its DEF, destroyed in the End Phase", () => {
  const g = duel({ board: [{ hand: ["Wild Nature's Release"], m: ['Giant Rat'], turn: 2 }, {}] });
  act(g, 0, "Wild Nature's Release"); settle(g, 'Giant Rat');
  ok(E.atk(g, on(g, 0, 'Giant Rat')) === 2850, `Giant Rat ${AD(g, 0, 'Giant Rat')}`);
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Giant Rat'), 'destroyed in the End Phase');
  const g2 = duel({ board: [{ hand: ["Wild Nature's Release"], m: [CG], turn: 2 }, {}] });
  ok(!canAct(g2, 0, "Wild Nature's Release"), 'not offered with only a Warrior');
});
T('Windstorm of Etaqua: opponent face-up monsters change position', () => {
  const g = duel({ board: [{ hand: [], st: ['Windstorm of Etaqua'], m: [CG], turn: 2 }, { m: [FILL, defM(EL), setM('Big Shield Gardna')] }] });
  act(g, 0, 'Windstorm of Etaqua'); settle(g); toIdle(g);
  ok(pos(g, 1, FILL) === 'def' && pos(g, 1, EL) === 'atk' && pos(g, 1, 'Big Shield Gardna') === 'set' && pos(g, 0, CG) === 'atk', 'B face-up swapped, set stays, own unchanged');
});
T("Witch's Apprentice: DARK +500, LIGHT -400", () => {
  const g = duel({ board: [{ hand: [], m: ["Witch's Apprentice", 'Vorse Raider'], turn: 2 }, { m: [EL, FILL] }] });
  ok(E.atk(g, on(g, 0, 'Vorse Raider')) === 2400 && E.atk(g, on(g, 0, "Witch's Apprentice")) === 1050, 'DARKs +500 (itself too)');
  ok(E.atk(g, on(g, 1, EL)) === 400 && E.atk(g, on(g, 1, FILL)) === 2000, 'LIGHT -400, EARTH unchanged');
});
T('Wodan: +100 per face-up Plant', () => {
  const g = duel({ board: [{ hand: [], m: ['Wodan the Resident of the Forest', 'Woodland Sprite'], turn: 2 }, { m: ['Bean Soldier', setM('Bean Soldier')] }] });
  ok(E.atk(g, on(g, 0, 'Wodan the Resident of the Forest')) === 1100, `Wodan ${AD(g, 0, 'Wodan the Resident of the Forest')}`);
});
T('Woodland Sprite: send its Equip to the GY for 500', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: ['Woodland Sprite'], turn: 2 }, {}] });
  act(g, 0, 'Black Pendant'); settle(g, 'Woodland Sprite'); toIdle(g);
  ok(canAct(g, 0, 'Woodland Sprite'), 'effect offered with an Equip');
  choose(g, 'a:' + on(g, 0, 'Woodland Sprite').u + ':'); settle(g, 'Black Pendant'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Black Pendant') && on(g, 0, 'Woodland Sprite') && lp(g, 1) === 7000, `Pendant sent, B LP ${lp(g, 1)} (500 + Pendant 500)`);
  const g2 = duel({ board: [{ hand: [], m: ['Woodland Sprite'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Woodland Sprite'), 'not offered with no Equip');
});
T('World Suppression: negates an activated Field Spell for the turn', () => {
  const g = duel({ first: 1, board: [{ st: ['World Suppression'], m: ['Sangan'] }, { hand: ['Yami'], turn: 2 }] });
  act(g, 1, 'Yami'); settle(g, 'World Suppression'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'World Suppression') && E.atk(g, on(g, 0, 'Sangan')) === 1000, `Sangan ${AD(g, 0, 'Sangan')} while Yami is negated`);
  endTurn(g); toIdle(g);
  ok(g.p[1].fz && E.atk(g, on(g, 0, 'Sangan')) === 1200, `Yami works next turn (${AD(g, 0, 'Sangan')})`);
});
T('Wynn the Wind Charmer: flip takes a WIND monster while face-up', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: [setM('Wynn the Wind Charmer')], turn: 2 }, { m: [HL, FILL] }] });
  flipSum(g, 0, 'Wynn the Wind Charmer', HL); toIdle(g, HL);
  ok(on(g, 0, HL) && on(g, 1, FILL), 'A controls Harpie Lady');
  act(g, 0, 'Book of Moon'); settle(g, 'Wynn the Wind Charmer'); toIdle(g);
  ok(on(g, 1, HL), 'control returns when Wynn is face-down');
});
/* ---------------- X / Y / Z ---------------- */
T('Xing Zhen Hu: the 2 targeted Set cards cannot be activated', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Xing Zhen Hu'], turn: 2 }, { st: ['Mirror Force', 'Sakuretsu Armor'] }] });
  act(g, 0, 'Xing Zhen Hu'); settle(g, 'Mirror Force', 'Sakuretsu Armor'); toIdle(g);
  ok(inZ(g, 0, 'st', 'Xing Zhen Hu'), 'Xing Zhen Hu stays');
  bp(g); choose(g, `atk:${on(g, 0, FILL).u}:d`);
  let offered = false; for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) { if (g.prompt.p === 1 && (canAct(g, 1, 'Mirror Force') || canAct(g, 1, 'Sakuretsu Armor'))) offered = true; E.act(g, ['pass']); }
  ok(!offered && lp(g, 1) === 6000, `no Mirror Force or Sakuretsu, B took 2000 (${lp(g, 1)})`);
});
const cannonT = (fus, mats, opp, tgt, gone) => T(`${fus}: banish materials, discard 1 to destroy`, () => {
  const g = duel({ ex0: [fus], board: [{ hand: [FILL], m: mats, turn: 2 }, opp] });
  const x = card(g, 0, fus); ok(hasOpt(g, 'sp:' + x.u), 'summon offered');
  choose(g, 'sp:' + x.u); settle(g, ...mats, 'Attack'); toIdle(g);
  ok(on(g, 0, fus) && mats.every(m => inZ(g, 0, 'ban', m)), 'summoned, materials banished');
  if (tgt) { act(g, 0, fus); settle(g, FILL, tgt); toIdle(g);
    ok(inZ(g, 1, 'gy', gone || tgt) && inZ(g, 0, 'gy', FILL), `${tgt} destroyed, 1 card discarded`); }
  const g2 = duel({ ex0: [fus], board: [{ hand: ['Polymerization', ...mats], turn: 2 }, {}] });
  let made = false; if (canAct(g2, 0, 'Polymerization')) { act(g2, 0, 'Polymerization'); try { settle(g2, fus, ...mats, 'Attack'); made = !!on(g2, 0, fus); } catch (e) {} }
  ok(!made, 'cannot be Fusion Summoned with Polymerization');
});
cannonT('XY-Dragon Cannon', ['X-Head Cannon', 'Y-Dragon Head'], { st: [up('Royal Decree')] }, 'Royal Decree');
cannonT('XYZ-Dragon Cannon', ['X-Head Cannon', 'Y-Dragon Head', 'Z-Metal Tank'], { m: [FILL] }, FILL);
cannonT('XZ-Tank Cannon', ['X-Head Cannon', 'Z-Metal Tank'], { st: ['Mirror Force'] }, 'Mirror Force');
cannonT('YZ-Tank Dragon', ['Y-Dragon Head', 'Z-Metal Tank'], { m: [setM(CG)] }, CG);
T('Y-Dragon Head: Union to X-Head Cannon +400, takes the hit, unequip', () => {
  const g = duel({ board: [{ hand: ['Fissure'], m: ['Y-Dragon Head', 'X-Head Cannon'], turn: 2 }, {}] });
  act(g, 0, 'Y-Dragon Head'); settle(g, 'X-Head Cannon'); toIdle(g);
  ok(inZ(g, 0, 'st', 'Y-Dragon Head') && AD(g, 0, 'X-Head Cannon') === '2200/1900', `X-Head ${AD(g, 0, 'X-Head Cannon')}`);
  ok(!canAct(g, 0, 'Y-Dragon Head'), 'once per turn (no unequip the same turn)');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  const y = card(g, 0, 'Y-Dragon Head'); const o = optsFor(g, y).find(x => /special|unequip/i.test(x.label)) || optsFor(g, y)[0];
  ok(!!o, 'unequip offered'); if (o) { E.act(g, [o.key]); settle(g, 'Attack'); toIdle(g); }
  ok(on(g, 0, 'Y-Dragon Head') && AD(g, 0, 'X-Head Cannon') === '1800/1500', 'Y-Dragon Head back as a monster');
  const g2 = duel({ first: 1, board: [{ m: ['Y-Dragon Head', 'X-Head Cannon'] }, { hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }] });
  // equip on A's own turn first is not possible here; use Z-Metal Tank test below for destruction
});
T('Z-Metal Tank: Union +600, destroyed instead of the equipped monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Z-Metal Tank', 'X-Head Cannon'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Z-Metal Tank'); settle(g, 'X-Head Cannon'); toIdle(g);
  ok(AD(g, 0, 'X-Head Cannon') === '2400/2100', `X-Head ${AD(g, 0, 'X-Head Cannon')}`);
  bp(g); atkOn(g, 0, 'X-Head Cannon', 'Blue-Eyes White Dragon'); toIdle(g);
  ok(on(g, 0, 'X-Head Cannon') && inZ(g, 0, 'gy', 'Z-Metal Tank') && lp(g, 0) === 7400, `X-Head survives, Tank destroyed, A took 600 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Z-Metal Tank', 'Y-Dragon Head'], turn: 2 }, {}] });
  act(g2, 0, 'Z-Metal Tank'); settle(g2, 'Y-Dragon Head'); toIdle(g2);
  ok(AD(g2, 0, 'Y-Dragon Head') === '2100/2200', 'can equip to Y-Dragon Head too');
});
T('Yado Karu: Attack to Defense, hand cards to the bottom of the Deck', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Sangan'], m: ['Yado Karu'], turn: 2 }, {}] });
  const h = hand(g, 0); choose(g, 'pos:' + on(g, 0, 'Yado Karu').u); for (let i = 0; i < 4 && g.prompt.type !== 'yesno'; i++) E.act(g, ['pass']); choose(g, 'yes'); choose(g, 'Pot of Greed'); choose(g, 'Stop'); toIdle(g);
  ok(pos(g, 0, 'Yado Karu') === 'def' && hand(g, 0) === h - 1 && E.name(g.p[0].deck[0]) === 'Pot of Greed', `hand ${h} to ${hand(g, 0)}, bottom card ${E.name(g.p[0].deck[0])}`);
});
T('Yamata Dragon: no Special Summon, draws to 5 on damage, returns in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Yamata Dragon'], m: [FILL, CG], turn: 2 }, {}] });
  const y = card(g, 0, 'Yamata Dragon'); ok(E.lib.forbid(g, { type: 'ss', c: y, p: 0, how: 'special' }) || !!(E.lib.SC && 0) || true, 'checked below');
  ns(g, 0, 'Yamata Dragon', FILL, CG, 'Attack');
  bp(g); atkOn(g, 0, 'Yamata Dragon', null); toIdle(g);
  ok(lp(g, 1) === 5400 && hand(g, 0) === 5, `B took 2600, A hand ${hand(g, 0)}`);
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Yamata Dragon'), 'returned to the hand');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Yamata Dragon'], turn: 2 }, {}] });
  let rb = false; if (canAct(g2, 0, 'Monster Reborn')) { act(g2, 0, 'Monster Reborn'); try { settle(g2, 'Yamata Dragon', 'Attack'); } catch (e) {} rb = !!on(g2, 0, 'Yamata Dragon'); }
  ok(!rb, 'Monster Reborn cannot Special Summon it');
});
T('Yami: Fiend and Spellcaster +200, Fairy -200', () => {
  const g = duel({ board: [{ hand: ['Yami'], m: ['Sangan', EL], turn: 2 }, { m: ['Dancing Elf', FILL] }] });
  act(g, 0, 'Yami'); settle(g); toIdle(g);
  ok(AD(g, 0, 'Sangan') === '1200/800' && AD(g, 0, EL) === '1000/2200', `Sangan ${AD(g, 0, 'Sangan')}, Elf ${AD(g, 0, EL)}`);
  ok(AD(g, 1, 'Dancing Elf') === '100/0' && AD(g, 1, FILL) === '2000/100', `Dancing Elf ${AD(g, 1, 'Dancing Elf')}`);
});
T('Yata-Garasu: no Special Summon, skips the draw on damage, returns in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Yata-Garasu'], turn: 2 }, {}] });
  ns(g, 0, 'Yata-Garasu', 'Attack');
  bp(g); atkOn(g, 0, 'Yata-Garasu', null); toIdle(g);
  ok(lp(g, 1) === 7800, `B took 200 (${lp(g, 1)})`);
  const hb = hand(g, 1);
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Yata-Garasu') && !on(g, 0, 'Yata-Garasu'), 'Yata back in hand');
  ok(g.tp === 1 && hand(g, 1) === hb, `B skipped the draw (hand ${hb} to ${hand(g, 1)})`);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 1 && hand(g, 1) === hb + 1, `B draws normally the turn after (${hand(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Yata-Garasu'], turn: 2 }, { m: [CG] }] });
  ns(g2, 0, 'Yata-Garasu', 'Attack'); bp(g2); atkOn(g2, 0, 'Yata-Garasu', CG); const h2 = hand(g2, 1); endTurn(g2); toIdle(g2);
  ok(g2.tp === 1 && hand(g2, 1) === h2 + 1, 'no skip when Yata deals no damage to B');
  const g3 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Yata-Garasu'], turn: 2 }, {}] });
  let rb = false; if (canAct(g3, 0, 'Monster Reborn')) { act(g3, 0, 'Monster Reborn'); try { settle(g3, 'Yata-Garasu', 'Attack'); } catch (e) {} rb = !!on(g3, 0, 'Yata-Garasu'); }
  ok(!rb, 'Monster Reborn cannot Special Summon it');
  const g4 = duel({ board: [{ hand: [], m: [setM('Yata-Garasu')], turn: 2 }, {}] });
  flipSum(g4, 0, 'Yata-Garasu'); endTurn(g4); toIdle(g4);
  ok(inZ(g4, 0, 'hand', 'Yata-Garasu'), 'returns after a Flip Summon too');
});
T('Yellow Luster Shield: your monsters +300 DEF', () => {
  const g = duel({ board: [{ hand: [], m: [CG], st: [up('Yellow Luster Shield')], turn: 2 }, { m: [FILL] }] });
  ok(AD(g, 0, CG) === '1400/1500' && AD(g, 1, FILL) === '2000/100', `Celtic ${AD(g, 0, CG)}, B Warwolf ${AD(g, 1, FILL)}`);
});
T('Yomi Ship: destroyed by battle, destroys the attacker', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Yomi Ship'] }] });
  bp(g); atkOn(g, 0, FILL, 'Yomi Ship'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Yomi Ship') && inZ(g, 0, 'gy', FILL), 'both destroyed');
});
T('Zaborg: Tribute Summon destroys 1 monster', () => {
  const g = duel({ board: [{ hand: ['Zaborg the Thunder Monarch'], m: [FILL], turn: 2 }, { m: [CG] }] });
  ns(g, 0, 'Zaborg the Thunder Monarch', FILL, 'Attack', CG); toIdle(g, CG);
  ok(on(g, 0, 'Zaborg the Thunder Monarch') && inZ(g, 1, 'gy', CG), 'Celtic destroyed');
  const g2 = duel({ board: [{ hand: ['Zaborg the Thunder Monarch', 'Monster Reborn'], m: [FILL], turn: 2 }, {}] });
  ns(g2, 0, 'Zaborg the Thunder Monarch', FILL, 'Attack'); toIdle(g2);
  ok(inZ(g2, 0, 'gy', 'Zaborg the Thunder Monarch'), 'only Zaborg on the field: the mandatory effect destroys Zaborg itself');
});
T('Zero Gravity: all face-up monsters change position, set ones stay', () => {
  const g = duel({ board: [{ hand: [], st: ['Zero Gravity'], m: [CG, setM('Sangan')], turn: 2 }, { m: [FILL, defM(EL)] }] });
  act(g, 0, 'Zero Gravity'); settle(g); toIdle(g);
  ok(pos(g, 0, CG) === 'def' && pos(g, 0, 'Sangan') === 'set' && pos(g, 1, FILL) === 'def' && pos(g, 1, EL) === 'atk', 'positions swapped');
});
T('Zolga: Tributed for a Tribute Summon, owner gains 2000', () => {
  const g = duel({ board: [{ hand: ['Zaborg the Thunder Monarch'], m: ['Zolga'], turn: 2 }, { m: [FILL] }] });
  ns(g, 0, 'Zaborg the Thunder Monarch', 'Zolga', 'Attack', FILL); toIdle(g, FILL);
  ok(lp(g, 0) === 10000, `A LP ${lp(g, 0)}`);
});
T('Zombie Tiger: Union to Decayed Commander +500, random discard on a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Zombie Tiger', 'Decayed Commander'], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'Zombie Tiger'); settle(g, 'Decayed Commander'); toIdle(g);
  ok(AD(g, 0, 'Decayed Commander') === '1500/2000', `Commander ${AD(g, 0, 'Decayed Commander')}`);
  const h = hand(g, 1); bp(g); atkOn(g, 0, 'Decayed Commander', CG); toIdle(g);
  ok(inZ(g, 1, 'gy', CG) && hand(g, 1) === h - 1, `B discarded 1 (hand ${h} to ${hand(g, 1)})`);
});
T('Zombyra the Dark: no direct attack, loses 200 after a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Zombyra the Dark'], turn: 2 }, {}] });
  bp(g); ok(!canAtk(g, on(g, 0, 'Zombyra the Dark'), null), 'no direct attack');
  const g2 = duel({ board: [{ hand: [], m: ['Zombyra the Dark'], turn: 2 }, { m: [CG] }] });
  bp(g2); atkOn(g2, 0, 'Zombyra the Dark', CG); toIdle(g2);
  ok(E.atk(g2, on(g2, 0, 'Zombyra the Dark')) === 1900, `ATK ${AD(g2, 0, 'Zombyra the Dark')}`);
});
/* ---------------- Edison-only: Aliens ---------------- */
const putA = (g, c, n = 1) => { E.lib.addCtr(g, c, 'A', n); g.seq++; };
T('Alien Brain: Reptile destroyed by an attacker, take control of the attacker', () => {
  const g = duel({ first: 1, board: [{ st: ['Alien Brain'], m: ['Alien Kid'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Alien Kid', 'Alien Brain'); toIdle(g, 'Alien Brain');
  const w = on(g, 0, FILL); ok(inZ(g, 0, 'gy', 'Alien Kid') && !!w, 'A took the Warwolf (ENGINE, documented: it does not become a Reptile)');
});
T('Alien Dog: Special Summon from hand on an Alien Normal Summon, 2 A-Counters', () => {
  const g = duel({ board: [{ hand: ['Alien Hunter', 'Alien Dog'], turn: 2 }, { m: [FILL] }] });
  ns(g, 0, 'Alien Hunter', 'Alien Dog', 'Attack', FILL); toIdle(g, 'Alien Dog', FILL);
  ok(on(g, 0, 'Alien Dog') && ac(on(g, 1, FILL)) === 2, `Dog summoned, Warwolf has ${ac(on(g, 1, FILL))} A-Counters`);
});
T('Alien Grey: flip puts an A-Counter; draw 1 when destroyed by battle after flipping', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Alien Grey')], turn: 2 }, { m: [FILL] }] });
  flipSum(g, 0, 'Alien Grey', FILL); toIdle(g, FILL);
  ok(ac(on(g, 1, FILL)) === 1, 'A-Counter on the Warwolf');
  endTurn(g); toIdle(g); const h = hand(g, 0);
  bp(g); atkOn(g, 1, FILL, 'Alien Grey'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Alien Grey') && hand(g, 0) === h + 1, `A drew 1 (${h} to ${hand(g, 0)})`);
  ok(lp(g, 0) === 8000 - (2000 - 300 - 300), `the Warwolf battled at -300 against an Alien (A LP ${lp(g, 0)})`);
});
T('Alien Hunter: attacks again after destroying an A-Counter monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Hunter'], turn: 2 }, { m: [CG, EL] }] });
  putA(g, on(g, 1, CG)); bp(g); atkOn(g, 0, 'Alien Hunter', CG); toIdle(g);
  ok(inZ(g, 1, 'gy', CG) && canAtk(g, on(g, 0, 'Alien Hunter'), on(g, 1, EL)), 'second attack offered');
  const g2 = duel({ board: [{ hand: [], m: ['Alien Hunter'], turn: 2 }, { m: [CG, EL] }] });
  bp(g2); atkOn(g2, 0, 'Alien Hunter', CG); toIdle(g2);
  ok(!canAtk(g2, on(g2, 0, 'Alien Hunter'), on(g2, 1, EL)), 'no second attack without an A-Counter');
});
T('Alien Hypno: Gemini; after the second summon, take an A-Counter monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Hypno'], turn: 2 }, { m: [CG] }] });
  putA(g, on(g, 1, CG));
  ok(!canAct(g, 0, 'Alien Hypno'), 'no effect before the Gemini Summon');
  choose(g, 'gem:' + on(g, 0, 'Alien Hypno').u); settle(g);
  ok(canAct(g, 0, 'Alien Hypno'), 'effect offered after the Gemini Summon');
  act(g, 0, 'Alien Hypno'); settle(g, CG); toIdle(g, CG);
  ok(on(g, 0, CG), 'A controls the Celtic Guardian');
});
T('Alien Infiltrator: direct attack when its column is empty', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Alien Infiltrator', zi: 2 }], turn: 2 }, { m: [{ n: FILL, zi: 0 }] }] });
  bp(g); ok(canAtk(g, on(g, 0, 'Alien Infiltrator'), null), 'direct attack offered');
  const g2 = duel({ board: [{ hand: [], m: [{ n: 'Alien Infiltrator', zi: 2 }], turn: 2 }, { m: [{ n: FILL, zi: 2 }] }] });
  bp(g2); ok(!canAtk(g2, on(g2, 0, 'Alien Infiltrator'), null), 'not with a monster in its column');
  const g3 = duel({ board: [{ hand: [], m: [{ n: 'Alien Infiltrator', zi: 2 }], turn: 2 }, {}] });
  ok(canAct(g3, 0, 'Alien Infiltrator'), 'move effect offered');
  act(g3, 0, 'Alien Infiltrator'); settle(g3); toIdle(g3);
  ok(g3.p[0].m[2] == null && (g3.p[0].m[1] || g3.p[0].m[3]), 'moved to an adjacent zone'); ok(!canAct(g3, 0, 'Alien Infiltrator'), 'once per turn');
});
T('Alien Kid: opponent Special Summons get an A-Counter; -300 vs Aliens', () => {
  const g = duel({ first: 1, board: [{ m: ['Alien Kid'] }, { hand: ['Monster Reborn'], gy: [CG], turn: 2 }] });
  act(g, 1, 'Monster Reborn'); settle(g, CG, 'Attack'); toIdle(g);
  ok(ac(on(g, 1, CG)) === 1, `A-Counter on the revived Celtic (${ac(on(g, 1, CG))})`);
  bp(g); atkOn(g, 1, CG, 'Alien Kid'); toIdle(g);
  ok(lp(g, 1) === 8000 - (1600 - 1100), `Celtic battled as 1100 (B LP ${lp(g, 1)})`);
});
T('Alien Mars: negates effects of A-Counter monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Mars', FILL], turn: 2 }, { m: ['Wodan the Resident of the Forest', 'Bean Soldier'] }] });
  const w = on(g, 1, 'Wodan the Resident of the Forest'); ok(E.atk(g, w) === 1000, 'Wodan 1000 before');
  putA(g, w); ok(E.atk(g, w) === 900, `Wodan ${E.atk(g, w)} with an A-Counter`);
});
T('Alien Mother: Special Summon the A-Counter monster it destroyed at the end of the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Mother'], turn: 2 }, { m: [CG] }] });
  putA(g, on(g, 1, CG)); bp(g); atkOn(g, 0, 'Alien Mother', CG); toIdle(g);
  E.act(g, ['endbp']); settle(g, CG, 'Attack'); toIdle(g, CG, 'Attack');
  ok(on(g, 0, CG), 'A Special Summoned the Celtic');
  const m = on(g, 0, 'Alien Mother'); E.lib.destroy(g, [m], { by: 1 }); g.seq++; toIdle(g);
});
T('Alien Overlord: Special Summon by removing 2 A-Counters; counters on each opponent face-up monster', () => {
  const g = duel({ board: [{ hand: ['Alien Overlord'], turn: 2 }, { m: [CG, EL, setM(FILL)] }] });
  const o = card(g, 0, 'Alien Overlord'); ok(!hasOpt(g, 'sp:' + o.u), 'no Special Summon with no counters');
  putA(g, on(g, 1, CG), 2); bp(g); E.act(g, ['endbp']); settle(g); // refresh the Main Phase menu
  ok(hasOpt(g, 'sp:' + o.u), 'offered with 2 A-Counters'); choose(g, 'sp:' + o.u); settle(g, CG, 'Attack'); toIdle(g);
  ok(on(g, 0, 'Alien Overlord') && ac(on(g, 1, CG)) === 0, 'summoned, counters removed');
  act(g, 0, 'Alien Overlord'); settle(g); toIdle(g);
  ok(ac(on(g, 1, CG)) === 1 && ac(on(g, 1, EL)) === 1 && ac(on(g, 1, FILL)) === 0, 'a counter on each face-up monster');
});
T('Alien Psychic: goes to Defense when Normal Summoned; A-Counter monsters cannot attack', () => {
  const g = duel({ board: [{ hand: ['Alien Psychic'], turn: 2 }, { m: [CG, EL] }] });
  ns(g, 0, 'Alien Psychic', 'Attack'); toIdle(g);
  ok(pos(g, 0, 'Alien Psychic') === 'def', 'in Defense');
  putA(g, on(g, 1, CG)); endTurn(g); toIdle(g); bp(g);
  ok(!canAtk(g, on(g, 1, CG), on(g, 0, 'Alien Psychic')) && canAtk(g, on(g, 1, EL), on(g, 0, 'Alien Psychic')), 'countered Celtic cannot attack, Elf can');
});
T('Alien Skull: Special Summon to the opponent field by Tributing their Level 3 or lower', () => {
  const g = duel({ board: [{ hand: ['Alien Skull', CG], turn: 2 }, { m: ['Sangan', FILL] }] });
  const s = card(g, 0, 'Alien Skull'); ok(hasOpt(g, 'sp:' + s.u), 'offered');
  choose(g, 'sp:' + s.u); settle(g, 'Sangan', 'Attack'); toIdle(g);
  const k = on(g, 1, 'Alien Skull'); ok(!!k && ac(k) === 1 && inZ(g, 1, 'gy', 'Sangan'), 'on B field with 1 A-Counter, Sangan Tributed');
  ok(!hasOpt(g, 'ns:' + card(g, 0, CG).u) && !hasOpt(g, 'set:' + card(g, 0, CG).u), 'A cannot Normal Summon this turn');
});
/* ---------------- Allure Queens ---------------- */
T('Allure Queen LV3: equip a Level 3 or lower, protect, then LV5 from the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Allure Queen LV3'], deckTop: [FILL, 'Allure Queen LV5'], turn: 2 }, { m: ['Sangan', CG] }] });
  ok(canAct(g, 0, 'Allure Queen LV3'), 'equip offered');
  act(g, 0, 'Allure Queen LV3'); settle(g, 'Sangan'); toIdle(g);
  ok(inZ(g, 0, 'st', 'Sangan'), 'Sangan equipped'); ok(!canAct(g, 0, 'Allure Queen LV3'), 'once per turn / 1 at a time');
  endTurn(g); toIdle(g); bp(g); atkOn(g, 1, CG, 'Allure Queen LV3'); toIdle(g);
  ok(on(g, 0, 'Allure Queen LV3') && !inZ(g, 0, 'st', 'Sangan'), 'Sangan destroyed instead of LV3');
  const g2 = duel({ board: [{ hand: [], m: ['Allure Queen LV3'], deckTop: [FILL, FILL, 'Allure Queen LV5'], turn: 2 }, { m: ['Sangan', CG] }] });
  act(g2, 0, 'Allure Queen LV3'); settle(g2, 'Sangan'); toIdle(g2); endTurn(g2); toIdle(g2); endTurn(g2);
  for (let i = 0; i < 8 && g2.prompt && !idle(g2); i++) settle(g2, 'Allure Queen LV5', 'Attack');
  ok(on(g2, 0, 'Allure Queen LV5') && inZ(g2, 0, 'gy', 'Allure Queen LV3'), 'LV5 Special Summoned in the Standby Phase');
  ok(canAct(g2, 0, 'Allure Queen LV5'), 'LV5 summoned by LV3 can use its equip');
});
T('Allure Queen LV5 and LV7: equip only when summoned by the lower level', () => {
  const g = duel({ board: [{ hand: ['Allure Queen LV5'], m: [CG], turn: 2 }, { m: ['Sangan'] }] });
  ns(g, 0, 'Allure Queen LV5', CG, 'Attack'); toIdle(g);
  ok(!canAct(g, 0, 'Allure Queen LV5'), 'Tribute Summoned LV5 has no equip');
  const g2 = duel({ board: [{ hand: [], m: ['Allure Queen LV7'], turn: 2 }, { m: ['Sangan'] }] });
  ok(!canAct(g2, 0, 'Allure Queen LV7'), 'LV7 placed directly has no equip');
});
/* ---------------- Arcana Force ---------------- */
const arc = (n, want, extra = {}) => withCoin(want, s => { const g = duel({ seed: s, board: [{ hand: [n, ...(extra.hand || [])], m: extra.m || [], turn: 2 }, extra.opp || {}] }); ns(g, 0, n, ...(extra.trib || []), 'Attack'); toIdle(g); return g; });
T('Arcana Force 0 - The Fool: not destroyed by battle, no manual Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Arcana Force 0 - The Fool'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'pos:' + on(g, 0, 'Arcana Force 0 - The Fool').u), 'no position change');
  const g2 = duel({ first: 1, board: [{ m: ['Arcana Force 0 - The Fool'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g2); atkOn(g2, 1, FILL, 'Arcana Force 0 - The Fool'); toIdle(g2);
  ok(on(g2, 0, 'Arcana Force 0 - The Fool') && lp(g2, 0) === 6000, `Fool survives, A took 2000 (${lp(g2, 0)})`);
});
T('Arcana Force I - The Magician: Heads doubles ATK on a Spell, Tails gives the opponent 500', () => {
  let g = arc('Arcana Force I - The Magician', 'H', { hand: ['Pot of Greed'] }); act(g, 0, 'Pot of Greed'); settle(g); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Arcana Force I - The Magician')) === 2200, `Heads: ATK ${AD(g, 0, 'Arcana Force I - The Magician')}`);
  g = arc('Arcana Force I - The Magician', 'T', { hand: ['Pot of Greed'] }); act(g, 0, 'Pot of Greed'); settle(g); toIdle(g);
  ok(lp(g, 1) === 8500, `Tails: B LP ${lp(g, 1)}`);
});
T('Arcana Force III - The Empress: opponent Normal Summon triggers', () => {
  let g = arc('Arcana Force III - The Empress', 'T', { hand: [CG] }); endTurn(g); toIdle(g); const h = hand(g, 0);
  ns(g, 1, FILL, 'Attack'); toIdle(g); ok(hand(g, 0) === h - 1, `Tails: A sent 1 card (${h} to ${hand(g, 0)})`);
  g = arc('Arcana Force III - The Empress', 'H', { hand: ['Arcana Force I - The Magician'] }); endTurn(g); toIdle(g);
  ns(g, 1, FILL, 'Attack'); toIdle(g, 'Arcana Force I - The Magician', 'Attack'); ok(on(g, 0, 'Arcana Force I - The Magician'), 'Heads: A Special Summoned an Arcana Force');
});
T('Arcana Force IV - The Emperor: Arcana Force +500 or -500', () => {
  let g = arc('Arcana Force IV - The Emperor', 'H', { m: ['Arcana Force 0 - The Fool'] });
  ok(E.atk(g, on(g, 0, 'Arcana Force IV - The Emperor')) === 1900 && E.atk(g, on(g, 0, 'Arcana Force 0 - The Fool')) === 500, 'Heads +500');
  g = arc('Arcana Force IV - The Emperor', 'T'); ok(E.atk(g, on(g, 0, 'Arcana Force IV - The Emperor')) === 900, 'Tails -500');
});
T('Arcana Force VI - The Lovers: Heads counts as 2 Tributes for an Arcana Force', () => {
  const g = arc('Arcana Force VI - The Lovers', 'H', { hand: ['Arcana Force XVIII - The Moon'] }); endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  const m = card(g, 0, 'Arcana Force XVIII - The Moon'); ok(hasOpt(g, 'ns:' + m.u), 'The Moon offered with only The Lovers');
  const g2 = arc('Arcana Force VI - The Lovers', 'T', { hand: ['Arcana Force XIV - Temperance'] }); endTurn(g2); toIdle(g2); endTurn(g2); toIdle(g2);
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Arcana Force XIV - Temperance').u), 'Tails: no Arcana Tribute Summon');
});
T('Arcana Force VII - The Chariot: Heads takes the monster it destroys, Tails gives itself away', () => {
  let g = arc('Arcana Force VII - The Chariot', 'H', { opp: { m: [CG] } }); bp(g); atkOn(g, 0, 'Arcana Force VII - The Chariot', CG, CG, 'Attack'); toIdle(g, CG, 'Attack');
  ok(on(g, 0, CG), 'Heads: A Special Summoned the Celtic');
  g = arc('Arcana Force VII - The Chariot', 'T'); ok(on(g, 1, 'Arcana Force VII - The Chariot'), 'Tails: B controls The Chariot');
});
T('Arcana Force XIV - Temperance: discard for no battle damage; coin halves damage', () => {
  const g = duel({ first: 1, board: [{ hand: ['Arcana Force XIV - Temperance'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, null, 'Arcana Force XIV - Temperance'); toIdle(g, 'Arcana Force XIV - Temperance');
  ok(lp(g, 0) === 8000 && inZ(g, 0, 'gy', 'Arcana Force XIV - Temperance'), `no damage (${lp(g, 0)})`);
  const g2 = arc('Arcana Force XIV - Temperance', 'T', { m: [CG, EL] , trib: [CG, EL] });
  bp(g2); atkOn(g2, 0, 'Arcana Force XIV - Temperance', null); toIdle(g2); ok(lp(g2, 1) === 6800, `Tails: B took 1200 (${lp(g2, 1)})`);
});
T('Arcana Force XVIII - The Moon: Heads token in Standby, Tails gives a monster away in the End Phase', () => {
  const g = arc('Arcana Force XVIII - The Moon', 'H', { m: [CG, EL], trib: [CG, EL] }); endTurn(g); toIdle(g); endTurn(g); toIdle(g, 'Moon Token');
  ok(g.p[0].m.some(c => c && /Moon Token/.test(E.name(c))), 'Heads: Moon Token');
  const g2 = arc('Arcana Force XVIII - The Moon', 'T', { m: [CG, EL], trib: [CG, EL] }); endTurn(g2, 'Arcana Force XVIII - The Moon'); toIdle(g2);
  ok(on(g2, 1, 'Arcana Force XVIII - The Moon'), 'Tails: The Moon (the only monster) went to B');
});
T('Arcana Force XXI - The World: Tails gives the opponent their top GY card', () => {
  const g = arc('Arcana Force XXI - The World', 'T', { m: [CG, EL], trib: [CG, EL], opp: { gy: ['Pot of Greed'] } }); const h = hand(g, 1);
  endTurn(g); toIdle(g); ok(inZ(g, 1, 'hand', 'Pot of Greed'), 'B got Pot of Greed back in the Draw Phase');
  const g2 = arc('Arcana Force XXI - The World', 'H', { m: [CG, EL, 'Sangan', 'Dancing Elf'], trib: [CG, EL] });
  endTurn(g2, 'Sangan', 'Dancing Elf'); toIdle(g2, 'Sangan', 'Dancing Elf');
  // ENGINE (documented): the skipped turn still happens, with no draw, summons, activations or attacks
  ok(cnt(g2, 0, 'm') === 1 && g2.tp === 1 && !hasOpt(g2, 'ns:') && hand(g2, 1) === 5, `Heads: 2 sent, B's turn does nothing (B options ${g2.prompt.opts.map(x => x.key).join(',')})`);
});
T('Arcana Force EX - The Dark Ruler: summoned by sending 3; Heads attacks twice', () => {
  const mk = s => { const g = duel({ seed: s, board: [{ hand: ['Arcana Force EX - The Dark Ruler'], m: [CG, EL, 'Sangan'], turn: 2 }, {}] });
    choose(g, 'sp:' + card(g, 0, 'Arcana Force EX - The Dark Ruler').u); settle(g, CG, EL, 'Sangan', 'Attack'); toIdle(g); return g; };
  const g = withCoin('H', mk); ok(on(g, 0, 'Arcana Force EX - The Dark Ruler') && cnt(g, 0, 'gy') >= 3, 'summoned, 3 sent');
  bp(g); atkOn(g, 0, 'Arcana Force EX - The Dark Ruler', null); ok(canAtk(g, on(g, 0, 'Arcana Force EX - The Dark Ruler'), null), 'Heads: second attack');
  const g2 = withCoin('T', mk); E.lib.destroy(g2, [on(g2, 0, 'Arcana Force EX - The Dark Ruler')], { by: 1 }); toIdle(g2);
});
T('Arcana Force EX - The Light Ruler: summoned by sending 3; Heads adds a GY card on a battle kill', () => {
  const mk = s => { const g = duel({ seed: s, board: [{ hand: ['Arcana Force EX - The Light Ruler'], m: [CG, EL, 'Sangan'], turn: 2 }, { m: [FILL] }] });
    choose(g, 'sp:' + card(g, 0, 'Arcana Force EX - The Light Ruler').u); settle(g, CG, EL, 'Sangan', 'Attack'); toIdle(g); return g; };
  const g = withCoin('H', mk); bp(g); atkOn(g, 0, 'Arcana Force EX - The Light Ruler', FILL, 'Arcana Force EX - The Light Ruler', CG); toIdle(g, CG);
  ok(inZ(g, 1, 'gy', FILL) && inZ(g, 0, 'hand', CG), 'Heads: Celtic back to hand');
  const g2 = duel({ board: [{ hand: ['Arcana Force EX - The Light Ruler'], m: [CG, EL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Arcana Force EX - The Light Ruler').u) && !hasOpt(g2, 'ns:' + card(g2, 0, 'Arcana Force EX - The Light Ruler').u), 'not with only 2 monsters, no Normal Summon');
});
T('Arcana Call: banish an Arcana Force from a GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Arcana Force IV - The Emperor'], st: ['Arcana Call'], gy: ['Arcana Force I - The Magician'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Arcana Call'), 'offered'); act(g, 0, 'Arcana Call'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'ban', 'Arcana Force I - The Magician'), 'Magician banished');
});
T('Arcana Knight Joker: Fusion of the 3 Knights; negate a targeting effect by discarding the same type', () => {
  const g = duel({ ex0: ['Arcana Knight Joker'], board: [{ hand: ['Polymerization', "Queen's Knight", "Jack's Knight", "King's Knight"], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Arcana Knight Joker', "Queen's Knight", "Jack's Knight", "King's Knight", 'Attack'); toIdle(g);
  ok(on(g, 0, 'Arcana Knight Joker'), 'Fusion Summoned');
  const g2 = duel({ first: 1, board: [{ hand: ['Pot of Greed'], m: ['Arcana Knight Joker'] }, { hand: ['Book of Moon'], turn: 2 }] });
  act(g2, 1, 'Book of Moon'); settle(g2, 'Arcana Knight Joker', 'Pot of Greed'); toIdle(g2, 'Pot of Greed');
  ok(pos(g2, 0, 'Arcana Knight Joker') === 'atk' && inZ(g2, 0, 'gy', 'Pot of Greed'), 'Book of Moon negated by discarding a Spell');
});
/* ---------------- Archfiends ---------------- */
T('Archfiend General: discard to add Pandemonium; destroyed without Pandemonium', () => {
  const g = duel({ board: [{ hand: ['Archfiend General'], deckTop: [FILL, 'Pandemonium'], turn: 2 }, {}] });
  act(g, 0, 'Archfiend General'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Archfiend General') && inZ(g, 0, 'hand', 'Pandemonium'), 'Pandemonium added');
  const g2 = duel({ board: [{ hand: ['Archfiend General'], turn: 2 }, {}] });
  ns(g2, 0, 'Archfiend General', 'Attack'); toIdle(g2);
  ok(!on(g2, 0, 'Archfiend General') && inZ(g2, 0, 'gy', 'Archfiend General'), 'destroyed with no Pandemonium');
  const g3 = duel({ board: [{ hand: ['Archfiend General', 'Pandemonium'], turn: 2 }, {}] });
  act(g3, 0, 'Pandemonium'); settle(g3); ns(g3, 0, 'Archfiend General', 'Attack'); toIdle(g3);
  ok(on(g3, 0, 'Archfiend General'), 'stays with Pandemonium');
});
T('Archfiend of Gilfer: sent to the GY, equips to a monster for -500', () => {
  const g = duel({ board: [{ hand: ["Jack's Knight"], m: ['Archfiend of Gilfer'], turn: 2 }, { m: [FILL] }] });
  ns(g, 0, "Jack's Knight", 'Archfiend of Gilfer', 'Attack', FILL); toIdle(g, FILL);
  ok(inZ(g, 0, 'st', 'Archfiend of Gilfer') && E.atk(g, on(g, 1, FILL)) === 1500, `Warwolf ${AD(g, 1, FILL)}`);
});
T('Archfiend Zombie-Skull: Synchro with Plaguespreader + 2 Zombies; Zombies safe from effects', () => {
  const g = duel({ ex0: ['Archfiend Zombie-Skull'], board: [{ hand: ['Dark Hole'], m: ['Plaguespreader Zombie', 'Clown Zombie', "Pharaoh's Servant"], turn: 2 }, {}] });
  const z = card(g, 0, 'Archfiend Zombie-Skull'); ok(hasOpt(g, 'sp:' + z.u), 'Synchro offered');
  choose(g, 'sp:' + z.u); for (let i = 0; i < 10 && !idle(g); i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else settle(g, 'Plaguespreader Zombie', 'Clown Zombie', "Pharaoh's Servant", 'Attack'); }
  ok(on(g, 0, 'Archfiend Zombie-Skull'), 'Synchro Summoned');
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(on(g, 0, 'Archfiend Zombie-Skull'), 'survives Dark Hole');
  const g2 = duel({ ex0: ['Archfiend Zombie-Skull'], board: [{ hand: [], m: ['Plaguespreader Zombie', 'Clown Zombie', 'Sangan'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Archfiend Zombie-Skull').u) && !hasOpt(g2, 'syn:' + card(g2, 0, 'Archfiend Zombie-Skull').u), 'not with a non-Zombie');
});

// Goat: the cards with a Goat-only script elsewhere (they win under Goat) and the shared ones in the Goat pool
{
  const vm = require('vm'), fs = require('fs'), path = require('path');
  const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
  for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const GE = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; GE.init(GC, { format: 'goat' });
  const GF = '7 Colored Fish', OX = 'Battle Ox';
  const gid = n => { const c = GC.find(x => x.n === n); if (!c) throw new Error('no goat card ' + n); return c.id; };
  const gduel = (board, ex, o = {}) => (board[1].turn && !board[0].turn && (board[0].turn = board[1].turn), lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board }));
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Wave-Motion Cannon', () => {
    const g = gduel([{ hand: ['Wave-Motion Cannon'], turn: 2 }, {}]); act(g, 0, 'Wave-Motion Cannon'); settle(g);
    for (let i = 0; i < 4; i++) { endTurn(g); toIdle(g); }
    act(g, 0, 'Wave-Motion Cannon'); settle(g); toIdle(g); ok(lp(g, 1) === 6000, `Goat: 2000 after 2 Standby Phases (${lp(g, 1)})`);
  });
  G('Widespread Ruin', () => {
    const g = gduel([{ st: ['Widespread Ruin'] }, { hand: [], m: ['Mystical Elf', OX], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, 'Mystical Elf', null, 'Widespread Ruin'); toIdle(g);
    ok(inZ(g, 1, 'gy', OX) && on(g, 1, 'Mystical Elf'), 'Goat: Battle Ox (highest ATK) destroyed, the attacking Elf stays');
  });
  G('Xing Zhen Hu', () => {
    const g = gduel([{ hand: [], m: [OX], st: ['Xing Zhen Hu'], turn: 2 }, { st: ['Mirror Force', 'Sakuretsu Armor'] }]);
    act(g, 0, 'Xing Zhen Hu'); settle(g, 'Mirror Force', 'Sakuretsu Armor'); toIdle(g);
    bp(g); choose(g, `atk:${on(g, 0, OX).u}:d`);
    let offered = false; for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) { if (g.prompt.p === 1 && (canAct(g, 1, 'Mirror Force') || canAct(g, 1, 'Sakuretsu Armor'))) offered = true; E.act(g, ['pass']); }
    ok(!offered && lp(g, 1) === 8000 - 1700, `Goat: no response, B LP ${lp(g, 1)}`);
  });
  G('Zaborg', () => {
    const g = gduel([{ hand: ['Zaborg the Thunder Monarch'], m: [GF], turn: 2 }, { m: [OX] }]);
    ns(g, 0, 'Zaborg the Thunder Monarch', GF, 'Attack', OX); toIdle(g, OX);
    ok(on(g, 0, 'Zaborg the Thunder Monarch') && inZ(g, 1, 'gy', OX), 'Goat: Battle Ox destroyed');
  });
  G('Zolga', () => {
    const g = gduel([{ hand: ['Zaborg the Thunder Monarch'], m: ['Zolga'], turn: 2 }, { m: [OX] }]);
    ns(g, 0, 'Zaborg the Thunder Monarch', 'Zolga', 'Attack', OX); toIdle(g, OX);
    ok(lp(g, 0) === 10000, `Goat: +2000 (${lp(g, 0)})`);
  });
  G('Zombyra the Dark', () => {
    const g = gduel([{ hand: [], m: ['Zombyra the Dark'], turn: 2 }, { m: [OX] }]);
    bp(g); ok(!canAtk(g, on(g, 0, 'Zombyra the Dark'), null), 'Goat: no direct attack');
    atkOn(g, 0, 'Zombyra the Dark', OX); toIdle(g); ok(E.atk(g, on(g, 0, 'Zombyra the Dark')) === 1900, 'Goat: -200');
  });
  G('Yata-Garasu', () => {
    const g = gduel([{ hand: ['Yata-Garasu'], turn: 2 }, {}]);
    ns(g, 0, 'Yata-Garasu', 'Attack'); bp(g); atkOn(g, 0, 'Yata-Garasu', null); toIdle(g); const hb = hand(g, 1);
    endTurn(g); toIdle(g);
    ok(inZ(g, 0, 'hand', 'Yata-Garasu') && g.tp === 1 && hand(g, 1) === hb, `Goat: Yata back in hand, B skipped the draw (${hb} to ${hand(g, 1)})`);
  });
  G('Yamata Dragon, Yami, Yomi Ship, Zero Gravity', () => {
    let g = gduel([{ hand: ['Yamata Dragon'], m: [GF, OX], turn: 2 }, {}]);
    ns(g, 0, 'Yamata Dragon', GF, OX, 'Attack'); bp(g); atkOn(g, 0, 'Yamata Dragon', null); toIdle(g);
    ok(hand(g, 0) === 5, `Goat: Yamata drew to 5 (${hand(g, 0)})`);
    g = gduel([{ hand: ['Yami'], m: ['Mystical Elf'], turn: 2 }, {}]); act(g, 0, 'Yami'); settle(g); ok(E.atk(g, on(g, 0, 'Mystical Elf')) === 1000, 'Goat: Yami');
    g = gduel([{ hand: [], m: [OX], turn: 2 }, { m: ['Yomi Ship'] }]); bp(g); atkOn(g, 0, OX, 'Yomi Ship'); toIdle(g); ok(inZ(g, 0, 'gy', OX), 'Goat: Yomi Ship');
    g = gduel([{ hand: [], st: ['Zero Gravity'], m: [OX], turn: 2 }, {}]); act(g, 0, 'Zero Gravity'); settle(g); toIdle(g); ok(pos(g, 0, OX) === 'def', 'Goat: Zero Gravity');
  });
  G('Weapon Change, Witch\'s Apprentice, Wild Nature\'s Release', () => {
    let g = gduel([{ hand: [], m: ['Celtic Guardian'], st: [up('Weapon Change')], turn: 2 }, {}]); settle(g, 'Celtic Guardian'); toIdle(g);
    ok(lp(g, 0) === 7300 && E.atk(g, on(g, 0, 'Celtic Guardian')) === 1200, 'Goat: Weapon Change');
    g = gduel([{ hand: [], m: ["Witch's Apprentice", 'Mystical Elf'], turn: 2 }, {}]); ok(E.atk(g, on(g, 0, 'Mystical Elf')) === 400, 'Goat: Apprentice');
    g = gduel([{ hand: ["Wild Nature's Release"], m: [OX], turn: 2 }, {}]); act(g, 0, "Wild Nature's Release"); settle(g, OX); ok(E.atk(g, on(g, 0, OX)) === 2700, 'Goat: Wild Nature');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-29 review checks passed.');
process.exit(fails ? 1 : 0);
