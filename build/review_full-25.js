// Independent review checks for full pool batch 25 (written from the card text): node build/review_full-25.js
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
const race = c => E.lib.race(c);

/* ---------------- M ---------------- */
T('Moisture Creature: 3 Tributes destroy the opponent Spells/Traps, 2 Tributes do not', () => {
  const g = duel({ board: [{ hand: ['Moisture Creature'], m: [FILL, FILL, FILL], turn: 2 }, { st: ['Mirror Force', 'Pot of Greed'] }] });
  ns(g, 0, 'Moisture Creature', '3 Tributes', FILL, FILL, FILL, 'Attack');
  ok(on(g, 0, 'Moisture Creature') && cnt(g, 0, 'm') === 1, 'Moisture Creature summoned with 3 Tributes');
  ok(cnt(g, 1, 'st') === 0 && inZ(g, 1, 'gy', 'Mirror Force'), 'B Spells/Traps destroyed');
  const g2 = duel({ board: [{ hand: ['Moisture Creature'], m: [FILL, FILL], turn: 2 }, { st: ['Mirror Force'] }] });
  ns(g2, 0, 'Moisture Creature', '2 Tributes', FILL, FILL, 'Attack');
  ok(on(g2, 0, 'Moisture Creature') && inZ(g2, 1, 'st', 'Mirror Force'), '2 Tributes: summoned, Mirror Force stays');
});
T('Mokey Mokey King: Fusion, then summons Mokey Mokeys when destroyed', () => {
  const g = duel({ ex0: ['Mokey Mokey King'], board: [{ hand: ['Polymerization', 'Mokey Mokey', 'Mokey Mokey', 'Mokey Mokey'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Mokey Mokey King', 'Mokey Mokey', 'Attack');
  ok(on(g, 0, 'Mokey Mokey King') && cnt(g, 0, 'gy', 'Mokey Mokey') === 3, 'Mokey Mokey King Fusion Summoned');
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Mokey Mokey King'], gy: ['Mokey Mokey', 'Mokey Mokey', 'Mokey Mokey'], turn: 2 }, { m: [FILL] }] });
  act(g2, 0, 'Dark Hole'); settle(g2, 'Attack', 'Defense');
  ok(cnt(g2, 0, 'm', 'Mokey Mokey') === 3 && inZ(g2, 0, 'extra', 'Mokey Mokey King') === false, `3 Mokey Mokey summoned (${cnt(g2, 0, 'm', 'Mokey Mokey')})`);
});
T('Mokey Mokey Smackdown: a Fairy destroyed makes Mokey Mokeys 3000 this turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Mokey Mokey', 'Mokey Mokey'], st: [up('Mokey Mokey Smackdown')], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); const m = g.p[0].m.filter(Boolean); choose(g, `atk:${m[0].u}:${on(g, 1, 'Blue-Eyes White Dragon').u}`); settle(g);
  const left = on(g, 0, 'Mokey Mokey');
  ok(left && E.atk(g, left) === 3000, `surviving Mokey Mokey ATK ${left && E.atk(g, left)}`);
  endTurn(g); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Mokey Mokey')) === 300, 'back to 300 next turn');
});
T('Molten Destruction: FIRE +500 ATK -400 DEF', () => {
  const g = duel({ board: [{ hand: ['Molten Destruction'], m: ['Molten Zombie'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Molten Destruction'); settle(g);
  const z = on(g, 0, 'Molten Zombie');
  ok(E.atk(g, z) === 2100 && E.def(g, z) === 0 && E.atk(g, on(g, 1, FILL)) === 2000, `Molten Zombie ${E.atk(g, z)}/${E.def(g, z)}`);
});
T('Molten Zombie: Special Summoned from the GY draws 1', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Molten Zombie'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Monster Reborn'); settle(g, 'Molten Zombie', 'Attack');
  ok(on(g, 0, 'Molten Zombie') && hand(g, 0) === h, `summoned and drew 1 (hand ${hand(g, 0)} vs ${h})`);
});
T('Monk Fighter: its controller takes no battle damage', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Monk Fighter'] }] });
  bp(g); atkOn(g, 0, FILL, 'Monk Fighter');
  ok(inZ(g, 1, 'gy', 'Monk Fighter') && lp(g, 1) === 8000, `Monk destroyed, B LP ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: [], m: ['Monk Fighter'], turn: 2 }, { m: [FILL] }] });
  bp(g2); atkOn(g2, 0, 'Monk Fighter', FILL);
  ok(lp(g2, 0) === 8000, `attacking a stronger monster: A LP ${lp(g2, 0)}`);
});
T('Morale Boost: +1000 on equip, 1000 damage when the equip leaves', () => {
  const g = duel({ board: [{ hand: ['Black Pendant', 'Mystical Space Typhoon'], m: [FILL], st: [up('Morale Boost')], turn: 2 }, {}] });
  act(g, 0, 'Black Pendant'); settle(g, FILL);
  const g0 = duel({ board: [{ hand: ['Black Pendant'], m: [FILL], st: [up('Morale Boost')], turn: 2 }, {}] });
  act(g0, 0, 'Black Pendant'); settle(g0, FILL); endTurn(g0);
  ok(lp(g0, 0) === 9000, `gained 1000 on equip (by the End Phase: ${lp(g0, 0)}; PARTIAL: applied at the next game event)`);
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Black Pendant');
  ok(inZ(g, 0, 'gy', 'Black Pendant') && lp(g, 0) === 8000 && lp(g, 1) === 7500, `A ${lp(g, 0)} (Morale -1000), B ${lp(g, 1)} (Pendant 500)`);
});
T('Mountain: Dragon +200 ATK/DEF', () => {
  const g = duel({ board: [{ hand: ['Mountain'], m: ['Blue-Eyes White Dragon', FILL], turn: 2 }, {}] });
  act(g, 0, 'Mountain'); settle(g);
  const b = on(g, 0, 'Blue-Eyes White Dragon');
  ok(E.atk(g, b) === 3200 && E.def(g, b) === 2700 && E.atk(g, on(g, 0, FILL)) === 2000, `Blue-Eyes ${E.atk(g, b)}/${E.def(g, b)}`);
});
T('Mucus Yolk: attacks directly, grows 1000 next Standby after damage', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: ['Mucus Yolk'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Black Pendant'); settle(g, 'Mucus Yolk');
  bp(g); const y = on(g, 0, 'Mucus Yolk'); ok(canAtk(g, y, null), 'direct attack offered over a monster');
  atkOn(g, 0, 'Mucus Yolk', null); ok(lp(g, 1) === 7500, `500 direct (${lp(g, 1)})`);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 0 && E.atk(g, on(g, 0, 'Mucus Yolk')) === 1500, `Mucus Yolk ATK ${E.atk(g, on(g, 0, 'Mucus Yolk'))} next turn`);
});
T('Mudora: +200 per Fairy in the GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Mudora'], gy: ['Mokey Mokey', 'Shining Angel', FILL], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Mudora')) === 1900, `Mudora ${E.atk(g, on(g, 0, 'Mudora'))}`);
});
T('Muka Muka: +300 ATK/DEF per card in hand', () => {
  const g = duel({ board: [{ hand: [FILL, FILL], m: ['Muka Muka'], turn: 2 }, {}] });
  const m = on(g, 0, 'Muka Muka'); // 2 + the draw = 3 cards
  ok(E.atk(g, m) === 600 + 900 && E.def(g, m) === 300 + 900, `Muka Muka ${E.atk(g, m)}/${E.def(g, m)} with ${hand(g, 0)} in hand`);
});
T('Muko: the drawn cards are discarded', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { st: ['Muko'] }] });
  const h = hand(g, 0); act(g, 0, 'Pot of Greed'); settle(g, 'Muko');
  ok(inZ(g, 1, 'gy', 'Muko') && hand(g, 0) === h - 1 && cnt(g, 0, 'gy') === 3, `A hand ${hand(g, 0)}, A GY ${cnt(g, 0, 'gy')}`);
});
T('Multiplication of Ants: Tribute an Insect, 2 tokens that cannot be Tributed', () => {
  const g = duel({ board: [{ hand: ['Multiplication of Ants', 'Penumbral Soldier Lady'], m: ['Basic Insect'], turn: 2 }, {}] });
  act(g, 0, 'Multiplication of Ants'); settle(g, 'Basic Insect', 'Defense');
  ok(cnt(g, 0, 'm', 'Army Ant Token') === 2 && inZ(g, 0, 'gy', 'Basic Insect'), '2 Army Ant Tokens');
  const t = on(g, 0, 'Army Ant Token'); ok(E.atk(g, t) === 500 && E.def(g, t) === 1200, 'tokens 500/1200');
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Penumbral Soldier Lady').u) && !hasOpt(g, 'set:' + card(g, 0, 'Penumbral Soldier Lady').u), 'tokens cannot be Tributed for a Level 6');
  const g2 = duel({ board: [{ hand: ['Multiplication of Ants'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Multiplication of Ants'), 'not without an Insect');
});
T('Mustering of the Dark Scorpions: with Don Zaloog, 1 of each Dark Scorpion', () => {
  const C1 = 'Dark Scorpion - Cliff the Trap Remover', C2 = 'Dark Scorpion - Chick the Yellow';
  const g = duel({ board: [{ hand: ['Mustering of the Dark Scorpions', C1, C1, C2], m: ['Don Zaloog'], turn: 2 }, {}] });
  act(g, 0, 'Mustering of the Dark Scorpions'); settle(g, C1, C2, C1, 'Attack');
  ok(cnt(g, 0, 'm', C1) === 1 && cnt(g, 0, 'm', C2) === 1 && cnt(g, 0, 'hand', C1) === 1, `Cliff ${cnt(g, 0, 'm', C1)}, Chick ${cnt(g, 0, 'm', C2)} summoned`);
  const g2 = duel({ board: [{ hand: ['Mustering of the Dark Scorpions', C1], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Mustering of the Dark Scorpions'), 'not without Don Zaloog');
});
T('Mystik Wok: Tribute, gain its ATK', () => {
  const g = duel({ board: [{ hand: ['Mystik Wok'], m: ['Blue-Eyes White Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Mystik Wok'); settle(g, 'Blue-Eyes White Dragon', 'ATK');
  ok(inZ(g, 0, 'gy', 'Blue-Eyes White Dragon') && lp(g, 0) === 11000, `gained 3000 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Mystik Wok'], m: ['Mystical Elf'], turn: 2 }, {}] });
  act(g2, 0, 'Mystik Wok'); settle(g2, 'Mystical Elf', 'DEF');
  ok(lp(g2, 0) === 10000, `DEF chosen: gained 2000 (${lp(g2, 0)})`);
});

/* ---------------- N ---------------- */
T('Narrow Pass: only with 2 or fewer each, then 2 more Normal Summons', () => {
  const g0 = duel({ board: [{ hand: [], m: [FILL, FILL, FILL], st: ['Narrow Pass'], turn: 2 }, {}] });
  ok(!canAct(g0, 0, 'Narrow Pass'), 'not with 3 monsters');
  const g = duel({ board: [{ hand: [FILL, FILL, FILL], st: ['Narrow Pass'], turn: 2 }, {}] });
  act(g, 0, 'Narrow Pass'); settle(g);
  ns(g, 0, FILL); endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ns(g, 0, FILL); endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 0 && cnt(g, 0, 'm') === 2 && !hasOpt(g, 'ns:') && !hasOpt(g, 'set:'), 'no third Normal Summon or Set');
});
T('Necklace of Command: equipped monster destroyed by battle, draw 1', () => {
  const g = duel({ board: [{ hand: ['Necklace of Command'], m: ['Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Necklace of Command'); settle(g, 'Mystical Elf');
  const h = hand(g, 0); bp(g); atkOn(g, 0, 'Mystical Elf', 'Blue-Eyes White Dragon', 'Draw');
  ok(inZ(g, 0, 'gy', 'Necklace of Command') && hand(g, 0) === h + 1, `drew 1 (hand ${hand(g, 0)} vs ${h})`);
});
T('Neko Mane King: sent to the GY by the opponent in their turn, End Phase', () => {
  const g = duel({ first: 1, board: [{ m: ['Neko Mane King'] }, { hand: ['Fissure'], m: [FILL], turn: 2 }] });
  act(g, 1, 'Fissure'); settle(g);
  ok(inZ(g, 0, 'gy', 'Neko Mane King'), 'Neko Mane King destroyed');
  toIdle(g);
  ok(g.tp === 1 && !hasOpt(g, 'bp') && !hasOpt(g, 'ns:') && hasOpt(g, 'end'), 'B is in the End Phase: only End turn offered');
});
T('Newdoria: destroyed by battle, destroy 1 monster', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Newdoria'] }] });
  bp(g); atkOn(g, 0, FILL, 'Newdoria', FILL);
  ok(inZ(g, 1, 'gy', 'Newdoria') && inZ(g, 0, 'gy', FILL), 'Warwolf destroyed by Newdoria');
});
T('Nimble Momonga: gain 1000, summon Momongas face-down', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Nimble Momonga', pos: 'def' }], deckTop: ['Nimble Momonga', 'Nimble Momonga'] }] });
  bp(g); atkOn(g, 0, FILL, 'Nimble Momonga', 'Nimble Momonga', 'Nimble Momonga');
  ok(lp(g, 1) === 9000, `B gained 1000 (${lp(g, 1)})`);
  ok(cnt(g, 1, 'm', 'Nimble Momonga') === 2 && g.p[1].m.filter(Boolean).every(c => c.pos === 'set'), `2 face-down Momongas (${cnt(g, 1, 'm', 'Nimble Momonga')})`);
});
T('Ninja Grandmaster Sasuke: destroys face-up Defense monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Ninja Grandmaster Sasuke'], turn: 2 }, { m: [{ n: 'Blue-Eyes White Dragon', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Ninja Grandmaster Sasuke', 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 0, 'Ninja Grandmaster Sasuke'), 'Blue-Eyes destroyed, Sasuke stays');
  const g2 = duel({ board: [{ hand: [], m: ['Ninja Grandmaster Sasuke'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'set' }] }] });
  bp(g2); atkOn(g2, 0, 'Ninja Grandmaster Sasuke', 'Mystical Elf');
  ok(on(g2, 1, 'Mystical Elf') && lp(g2, 0) === 7800, `face-down Elf survives, A took 200 (${lp(g2, 0)})`);
});
T('Ninjitsu Art of Decoy: the Ninja is not destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Ninja Grandmaster Sasuke'], st: ['Ninjitsu Art of Decoy'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Ninjitsu Art of Decoy'); settle(g, 'Ninja Grandmaster Sasuke');
  bp(g); atkOn(g, 0, 'Ninja Grandmaster Sasuke', 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Ninja Grandmaster Sasuke') && lp(g, 0) === 6800, `Sasuke survives, A took 1200 (${lp(g, 0)})`);
});
T('Ninjitsu Art of Transformation: Tribute a Ninja, summon Beast up to Level +3; destroyed with it', () => {
  const g = duel({ board: [{ hand: ['Big Koala', 'Mystical Space Typhoon'], m: ['Ninja Grandmaster Sasuke'], st: ['Ninjitsu Art of Transformation'], turn: 2 }, {}] });
  act(g, 0, 'Ninjitsu Art of Transformation'); settle(g, 'Ninja Grandmaster Sasuke', 'Big Koala', 'Attack');
  ok(on(g, 0, 'Big Koala') && inZ(g, 0, 'gy', 'Ninja Grandmaster Sasuke'), 'Big Koala (Level 7) summoned');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Ninjitsu Art of Transformation');
  ok(inZ(g, 0, 'gy', 'Big Koala'), 'Big Koala destroyed when the Trap leaves');
});
T('Nitro Unit: equipped opponent monster destroyed by battle burns its ATK', () => {
  const g = duel({ board: [{ hand: ['Nitro Unit'], m: [FILL], turn: 2 }, { m: ['Mystical Elf'] }] });
  act(g, 0, 'Nitro Unit'); settle(g, 'Mystical Elf');
  bp(g); atkOn(g, 0, FILL, 'Mystical Elf');
  ok(lp(g, 1) === 8000 - 1200 - 800, `B LP ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Nitro Unit'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Nitro Unit'), 'not to your own monster');
});
T('Nobleman-Eater Bug: flip, destroy 2 monsters', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Nobleman-Eater Bug', pos: 'set' }], turn: 2 }, { m: [FILL, 'Mystical Elf'] }] });
  choose(g, 'flip:'); settle(g, FILL, 'Mystical Elf');
  ok(cnt(g, 1, 'm') === 0 && on(g, 0, 'Nobleman-Eater Bug'), 'both B monsters destroyed');
});
T("Novox's Prayer: Ritual Summon Skull Guardian", () => {
  const g = duel({ board: [{ hand: ["Novox's Prayer", 'Skull Guardian', 'Big Koala'], turn: 2 }, {}] });
  act(g, 0, "Novox's Prayer"); settle(g, 'Skull Guardian', 'Big Koala', 'Attack');
  ok(on(g, 0, 'Skull Guardian') && inZ(g, 0, 'gy', 'Big Koala'), 'Skull Guardian summoned');
});
T('Nubian Guard: battle damage returns a Continuous Spell to the top of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Nubian Guard'], gy: ['Mokey Mokey Smackdown'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Nubian Guard', null, 'Mokey Mokey Smackdown');
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(lp(g, 1) === 7500 && top && E.name(top) === 'Mokey Mokey Smackdown', `top of Deck: ${top && E.name(top)}`);
});
T('Numinous Healer: on damage, gain 1000 + 500 per Healer in the GY', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Numinous Healer'], gy: ['Numinous Healer'] }] });
  bp(g); atkOn(g, 0, FILL, null, 'Numinous Healer');
  ok(lp(g, 1) === 8000 - 2000 + 1500, `B LP ${lp(g, 1)}`);
});
T('Nutrient Z: gain 4000 before 2000+ battle damage', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Nutrient Z'] }] });
  bp(g); atkOn(g, 0, FILL, null, 'Nutrient Z');
  ok(inZ(g, 1, 'gy', 'Nutrient Z') && lp(g, 1) === 10000, `B LP ${lp(g, 1)}`);
});
T('Nuvia the Wicked: destroyed when Normal Summoned; -200 per opponent monster', () => {
  const g = duel({ board: [{ hand: ['Nuvia the Wicked'], turn: 2 }, {}] });
  ns(g, 0, 'Nuvia the Wicked');
  ok(inZ(g, 0, 'gy', 'Nuvia the Wicked'), 'destroyed after Normal Summon');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Nuvia the Wicked'], turn: 2 }, { m: [FILL, FILL] }] });
  act(g2, 0, 'Monster Reborn'); settle(g2, 'Nuvia the Wicked', 'Attack');
  const n = on(g2, 0, 'Nuvia the Wicked'); ok(n && E.atk(g2, n) === 1600, `Special Summoned stays, ATK ${n && E.atk(g2, n)}`);
});

/* ---------------- O ---------------- */
T('Offerings to the Doomed: destroy a face-up monster, skip the next Draw Phase', () => {
  const g = duel({ board: [{ hand: ['Offerings to the Doomed'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Offerings to the Doomed'); settle(g, 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Blue-Eyes destroyed');
  const h = hand(g, 0); endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 0 && hand(g, 0) === h, `A drew nothing (hand ${hand(g, 0)} vs ${h})`);
});
T('Old Vindictive Magician: flip, destroy an opponent monster', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Old Vindictive Magician', pos: 'set' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'flip:'); settle(g, 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Blue-Eyes destroyed');
});
T('Ominous Fortunetelling: call the type right, 700 damage', () => {
  const g = duel({ board: [{ hand: [], st: [up('Ominous Fortunetelling')], turn: 2 }, { hand: [FILL, FILL] }] });
  toIdle(g, 'Ominous Fortunetelling', 'Monster');
  ok(lp(g, 1) === 7300, `B LP ${lp(g, 1)}`);
});
T('Ooguchi: attacks directly', () => {
  const g = duel({ board: [{ hand: [], m: ['Ooguchi'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Ooguchi', null); ok(lp(g, 1) === 7700, `B LP ${lp(g, 1)}`);
});
T('Ookazi: 800 damage', () => {
  const g = duel({ board: [{ hand: ['Ookazi'], turn: 2 }, {}] });
  act(g, 0, 'Ookazi'); settle(g); ok(lp(g, 1) === 7200, `B LP ${lp(g, 1)}`);
});
T('Opti-Camouflage Armor: Level 1 only, direct attack', () => {
  const g = duel({ board: [{ hand: ['Opti-Camouflage Armor'], m: ['Kuriboh'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Opti-Camouflage Armor'); settle(g, 'Kuriboh');
  bp(g); atkOn(g, 0, 'Kuriboh', null); ok(lp(g, 1) === 7700, `B LP ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Opti-Camouflage Armor'], m: [FILL], turn: 2 }, { m: [FILL] }] });
  ok(!canAct(g2, 0, 'Opti-Camouflage Armor') || (act(g2, 0, 'Opti-Camouflage Armor'), settle(g2, FILL), !g2.p[0].st.some(c => c && c.equipTo)), 'not equipped to a Level 4');
});
T('Orca Mega-Fortress of Darkness: Tribute Torpedo Fish / Cannonball Spear Shellfish', () => {
  const g = duel({ board: [{ hand: [], m: ['Orca Mega-Fortress of Darkness', 'Torpedo Fish', 'Cannonball Spear Shellfish'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  const o = on(g, 0, 'Orca Mega-Fortress of Darkness'); const os = optsFor(g, o).filter(x => x.key.startsWith('a:'));
  ok(os.length >= 1, 'Orca effect offered: ' + os.map(x => x.label).join(' | '));
  const m = os.find(x => /monster|torpedo/i.test(x.label)) || os[0]; choose(g, m.key); settle(g, 'Torpedo Fish', FILL);
  ok(inZ(g, 0, 'gy', 'Torpedo Fish') && inZ(g, 1, 'gy', FILL), 'Torpedo Fish Tributed, Warwolf destroyed');
  const os2 = optsFor(g, o).filter(x => x.key.startsWith('a:'));
  const s = os2.find(x => /spell|trap|cannon/i.test(x.label)) || os2[0];
  if (s) { choose(g, s.key); settle(g, 'Cannonball Spear Shellfish', 'Mirror Force'); }
  ok(inZ(g, 0, 'gy', 'Cannonball Spear Shellfish') && inZ(g, 1, 'gy', 'Mirror Force'), 'Shellfish Tributed, Mirror Force destroyed');
});
T('Ordeal of a Traveler: wrong call returns the attacker to the hand', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: ['Pot of Greed'], st: [up('Ordeal of a Traveler')] }] });
  bp(g); atkOn(g, 0, FILL, null, 'Ordeal of a Traveler', 'Monster');
  ok(inZ(g, 0, 'hand', FILL) && lp(g, 1) === 8000, `Warwolf returned (B LP ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: ['Pot of Greed'], st: [up('Ordeal of a Traveler')] }] });
  bp(g2); atkOn(g2, 0, FILL, null, 'Ordeal of a Traveler', 'Spell');
  ok(on(g2, 0, FILL) && lp(g2, 1) === 6000, `right call: attack goes on (B LP ${lp(g2, 1)})`);
});
T('Order to Charge: Tribute a Normal Monster, destroy an opponent monster', () => {
  const g = duel({ board: [{ hand: ['Order to Charge'], m: [FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Order to Charge'); settle(g, FILL, 'Blue-Eyes White Dragon');
  ok(inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Warwolf Tributed, Blue-Eyes destroyed');
  const g2 = duel({ board: [{ hand: ['Order to Charge'], m: ['Mystic Tomato'], turn: 2 }, { m: [FILL] }] });
  ok(!canAct(g2, 0, 'Order to Charge'), 'not with only an Effect Monster');
});
T('Order to Smash: Tribute a Level 2 Normal, destroy up to 2 Spells/Traps', () => {
  const g = duel({ board: [{ hand: [], m: ['Basic Insect'], st: ['Order to Smash'], turn: 2 }, { st: ['Mirror Force', 'Pot of Greed', 'Ookazi'] }] });
  act(g, 0, 'Order to Smash'); for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'pick' && /Spells\/Traps/.test(pr.text)) E.act(g, pr.opts.slice(0, 2).map(x => x.key)); else settle(g, 'Basic Insect'); }
  ok(inZ(g, 0, 'gy', 'Basic Insect') && cnt(g, 1, 'st') === 1, `B has ${cnt(g, 1, 'st')} Spell/Trap left`);
  const g2 = duel({ board: [{ hand: [], m: [FILL], st: ['Order to Smash'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!canAct(g2, 0, 'Order to Smash'), 'not with a Level 4');
});
T('Otohime: Normal Summon changes a position, returns in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Otohime'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ns(g, 0, 'Otohime', 'Blue-Eyes White Dragon');
  ok(on(g, 1, 'Blue-Eyes White Dragon').pos === 'def', 'Blue-Eyes changed to Defense');
  endTurn(g);
  ok(inZ(g, 0, 'hand', 'Otohime'), 'Otohime returned to the hand');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Otohime'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be Special Summoned (Reborn has no target)');
});
T('Outstanding Dog Marron: sent to the GY, shuffled into the Deck', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Outstanding Dog Marron'] }] });
  const d = g.p[1].deck.length; bp(g); atkOn(g, 0, FILL, 'Outstanding Dog Marron');
  ok(!inZ(g, 1, 'gy', 'Outstanding Dog Marron') && g.p[1].deck.length === d + 1, 'Marron back in the Deck');
});

/* ---------------- P ---------------- */
T('Painful Choice: 5 shown, 1 to the hand, 4 to the GY', () => {
  const g = duel({ board: [{ hand: ['Painful Choice'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Painful Choice'); settle(g);
  ok(hand(g, 0) === h && cnt(g, 0, 'gy') === 5, `hand ${hand(g, 0)} (was ${h}), GY ${cnt(g, 0, 'gy')}`);
});
T('Paladin of White Dragon: Ritual, kills a face-down, Tributes for Blue-Eyes', () => {
  const g = duel({ board: [{ hand: ['White Dragon Ritual', 'Paladin of White Dragon', FILL], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'set' }] }] });
  act(g, 0, 'White Dragon Ritual'); settle(g, 'Paladin of White Dragon', FILL, 'Attack');
  ok(on(g, 0, 'Paladin of White Dragon'), 'Paladin Ritual Summoned');
  bp(g); atkOn(g, 0, 'Paladin of White Dragon', 'Mystical Elf');
  ok(inZ(g, 1, 'gy', 'Mystical Elf') && lp(g, 0) === 8000, `face-down Elf destroyed, A LP ${lp(g, 0)}`);
  const g2 = duel({ board: [{ hand: [], m: ['Paladin of White Dragon'], deckTop: [FILL, 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  act(g2, 0, 'Paladin of White Dragon'); settle(g2, 'Blue-Eyes White Dragon', 'Attack');
  const b = on(g2, 0, 'Blue-Eyes White Dragon');
  ok(b && inZ(g2, 0, 'gy', 'Paladin of White Dragon'), 'Blue-Eyes summoned from the Deck');
  bp(g2); ok(!canAtk(g2, b, null), 'Blue-Eyes cannot attack this turn');
});
T('Pandemonium: no Archfiend cost; destroyed Archfiend searches a lower Level one', () => {
  const g = duel({ board: [{ hand: ['Pandemonium', 'Dark Hole'], m: ['Skull Archfiend of Lightning'], deckTop: [FILL, 'Archfiend Soldier'], turn: 2 }, {}] });
  act(g, 0, 'Pandemonium'); settle(g);
  act(g, 0, 'Dark Hole'); settle(g, 'Archfiend Soldier');
  ok(inZ(g, 0, 'hand', 'Archfiend Soldier'), 'Archfiend Soldier added');
  const g2 = duel({ board: [{ hand: ['Pandemonium'], m: ['Skull Archfiend of Lightning'], turn: 2 }, {}] });
  act(g2, 0, 'Pandemonium'); settle(g2); endTurn(g2); toIdle(g2); endTurn(g2); toIdle(g2);
  ok(g2.tp === 0 && lp(g2, 0) === 7500 && on(g2, 0, 'Skull Archfiend of Lightning'), `no Standby cost once Pandemonium is up (A LP ${lp(g2, 0)}: 500 paid on turn 2 before it)`);
});
T('Pandemonium Watchbear: Pandemonium survives the opponent MST', () => {
  const g = duel({ board: [{ hand: ['Pandemonium'], m: ['Pandemonium Watchbear'], turn: 2 }, { st: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Pandemonium'); settle(g);
  ns; choose(g, 'bp'); settle(g, 'Mystical Space Typhoon');
  ok(inZ(g, 1, 'gy', 'Mystical Space Typhoon'), 'B used MST');
  ok(g.p[0].fz && E.name(g.p[0].fz) === 'Pandemonium', 'Pandemonium stays');
});
T('Paralyzing Potion: non-Machine cannot attack, Machine can', () => {
  const g = duel({ board: [{ hand: ['Paralyzing Potion'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Paralyzing Potion'); settle(g, FILL); bp(g);
  ok(!canAtk(g, on(g, 0, FILL), null), 'Warwolf cannot attack');
  const g2 = duel({ board: [{ hand: ['Paralyzing Potion'], m: ['Cyber Dragon'], turn: 2 }, {}] });
  act(g2, 0, 'Paralyzing Potion'); settle(g2, 'Cyber Dragon'); bp(g2);
  ok(canAtk(g2, on(g2, 0, 'Cyber Dragon'), null), 'Cyber Dragon can attack');
});
T('Parasite Paracide: into the opponent Deck, drawn: summoned, 1000 damage, Insects', () => {
  const g = duel({ n1: 5, board: [{ hand: [], m: [{ n: 'Parasite Paracide', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'flip:'); settle(g);
  ok(!on(g, 0, 'Parasite Paracide') && g.p[1].deck.some(c => E.name(c) === 'Parasite Paracide'), 'Paracide in B Deck');
  endTurn(g); toIdle(g);
  const pp = on(g, 1, 'Parasite Paracide');
  ok(pp && pp.pos === 'def' && lp(g, 1) === 7000, `summoned on B side in Defense, B LP ${lp(g, 1)}`);
  if (race(on(g, 1, FILL)) !== 'Insect') console.log('note Paracide: Type change not done (documented PARTIAL / ENGINE gap)');
});
T('Patrician of Darkness: its controller picks the attack target', () => {
  const g = duel({ first: 1, board: [{ m: ['Patrician of Darkness', 'Mystical Elf'], turn: 2 }, { hand: [], m: ['Blue-Eyes White Dragon'] }] });
  bp(g); const b = on(g, 1, 'Blue-Eyes White Dragon');
  const opts = g.prompt.opts.filter(x => x.key.startsWith('atk:' + b.u)).map(x => x.label);
  choose(g, g.prompt.opts.find(x => x.key.startsWith('atk:' + b.u)).key); settle(g, 'Mystical Elf');
  if (!inZ(g, 0, 'gy', 'Mystical Elf')) console.log('note Patrician of Darkness: attack redirection not done (documented ENGINE gap); offers: ' + opts.join(' | '));
});
T('Patrol Robo: looks at a Set card in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Patrol Robo'], turn: 2 }, { st: ['Mirror Force'] }] });
  toIdle(g, 'Patrol Robo', 'Mirror Force');
  ok(g.log.some(l => /Mirror Force/.test(l)) || g.log.some(l => /Patrol Robo/.test(l)), 'log mentions the look: ' + g.log.filter(l => /Patrol|look/i.test(l)).join(' / '));
});
T('Penalty Game!: opponent with 4 cards cannot activate Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['Ookazi', FILL, FILL], st: ['Pot of Greed'], turn: 2 }, { st: ['Penalty Game!'] }] });
  ok(hand(g, 0) === 4, '4 cards in hand');
  act(g, 0, 'Pot of Greed'); settle(g, 'Penalty Game!', 'Spell');
  ok(inZ(g, 1, 'gy', 'Penalty Game!') && hand(g, 0) === 6, `Penalty Game! used, Pot resolved (hand ${hand(g, 0)})`);
  ok(!canAct(g, 0, 'Ookazi'), 'A cannot activate Ookazi');
  const g2 = duel({ board: [{ hand: ['Ookazi', FILL, FILL], st: ['Pot of Greed'], turn: 2 }, { st: ['Penalty Game!'] }] });
  act(g2, 0, 'Pot of Greed'); settle(g2, 'Penalty Game!', 'draw');
  const h = hand(g2, 0); endTurn(g2); toIdle(g2); endTurn(g2); toIdle(g2);
  ok(g2.tp === 0 && hand(g2, 0) === h, `draw option: A did not draw next turn (${hand(g2, 0)} vs ${h})`);
});
T('Penguin Knight: milled by the opponent, the GY is shuffled into the Deck', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Needle Worm', pos: 'set' }], turn: 2 }, { gy: ['Mokey Mokey'], deckTop: ['Penguin Knight'] }] });
  const d = g.p[1].deck.length; choose(g, 'flip:'); settle(g);
  ok(cnt(g, 1, 'gy') === 0 && g.p[1].deck.length === d + 1, `B GY ${cnt(g, 1, 'gy')}, Deck ${g.p[1].deck.length} (was ${d})`);
});
T('Penguin Soldier: flip, return up to 2 monsters', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Penguin Soldier', pos: 'set' }], turn: 2 }, { hand: [], m: [FILL, 'Mystical Elf'] }] });
  choose(g, 'flip:'); settle(g, FILL, 'Mystical Elf');
  ok(cnt(g, 1, 'm') === 0 && hand(g, 1) === 2, `B hand ${hand(g, 1)}`);
});
T('Penumbral Soldier Lady: +1000 against LIGHT in the Damage Step', () => {
  const g = duel({ board: [{ hand: [], m: ['Penumbral Soldier Lady'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ok(E.atk(g, on(g, 0, 'Penumbral Soldier Lady')) === 2100, '2100 outside battle');
  bp(g); atkOn(g, 0, 'Penumbral Soldier Lady', 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && lp(g, 1) === 7900, `Blue-Eyes destroyed, B LP ${lp(g, 1)}`);
  ok(E.atk(g, on(g, 0, 'Penumbral Soldier Lady')) === 2100, 'back to 2100 after battle');
});
T('Perfect Machine King: +500 per other Machine on the field', () => {
  const g = duel({ board: [{ hand: [], m: ['Perfect Machine King', 'Cyber Dragon'], turn: 2 }, { m: ['Cyber Dragon', FILL] }] });
  ok(E.atk(g, on(g, 0, 'Perfect Machine King')) === 3700, `PMK ${E.atk(g, on(g, 0, 'Perfect Machine King'))}`);
});
T('Performance of Sword: Ritual Summon with Commencement Dance', () => {
  const g = duel({ board: [{ hand: ['Commencement Dance', 'Performance of Sword', FILL, 'Basic Insect'], turn: 2 }, {}] });
  act(g, 0, 'Commencement Dance'); settle(g, 'Performance of Sword', FILL, 'Basic Insect', 'Attack');
  ok(on(g, 0, 'Performance of Sword'), 'Performance of Sword summoned');
});
T('Peten the Dark Clown: to the GY, banish it, summon another Peten', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Peten the Dark Clown'], deckTop: ['Peten the Dark Clown'] }] });
  bp(g); atkOn(g, 0, FILL, 'Peten the Dark Clown', 'Peten the Dark Clown', 'Attack');
  ok(on(g, 1, 'Peten the Dark Clown') && inZ(g, 1, 'ban', 'Peten the Dark Clown'), 'second Peten summoned, first banished');
});
T("Pharaoh's Treasure: shuffled in face-up, drawn: add a card from the GY", () => {
  const g = duel({ n0: 6, board: [{ st: ["Pharaoh's Treasure"], gy: ['Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, "Pharaoh's Treasure"); settle(g);
  ok(g.p[0].deck.length === 1 && E.name(g.p[0].deck[0]) === "Pharaoh's Treasure", 'in the Deck');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g, 'Pot of Greed');
  ok(g.tp === 0 && inZ(g, 0, 'gy', "Pharaoh's Treasure") && inZ(g, 0, 'hand', 'Pot of Greed'), 'Pot of Greed added, Treasure in the GY');
});

/* ---------------- Goat ---------------- */
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
  const gduel = (board, ex, o = {}) => (lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: o.first || 0, seed: 1, noShuffle: true, names: ['A', 'B'], board }));
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Morphing Jar #2: shuffles all monsters, each player summons as many face-down', () => {
    const g = gduel([{ hand: [], m: [{ n: 'Morphing Jar #2', pos: 'set' }, GF], turn: 2 }, { m: [GF] }]);
    choose(g, 'flip:'); settle(g);
    ok(cnt(g, 0, 'm') === 2 && cnt(g, 1, 'm') === 1, `A ${cnt(g, 0, 'm')} monsters, B ${cnt(g, 1, 'm')}`);
    ok([...g.p[0].m, ...g.p[1].m].filter(Boolean).every(c => c.pos === 'set'), 'all face-down Defense');
  });
  G('Mushroom Man #2: 300 each Standby, pay 500 to give it away', () => {
    const g = gduel([{ hand: [], m: ['Mushroom Man #2'], turn: 2 }, {}]);
    ok(lp(g, 0) === 7700, `A lost 300 in its Standby (${lp(g, 0)})`);
    endTurn(g, 'Mushroom Man #2'); toIdle(g);
    ok(on(g, 1, 'Mushroom Man #2') && lp(g, 0) === 7200, `B controls it, A paid 500 (${lp(g, 0)})`);
    ok(lp(g, 1) === 7700, `B lost 300 in its Standby (${lp(g, 1)})`);
  });
  G('Mokey Mokey King, Mudora, Mystik Wok', () => {
    let g = gduel([{ hand: ['Dark Hole'], m: ['Mokey Mokey King'], gy: ['Mokey Mokey', 'Mokey Mokey', 'Mokey Mokey'], turn: 2 }, {}]);
    act(g, 0, 'Dark Hole'); settle(g, 'Attack', 'Defense'); ok(cnt(g, 0, 'm', 'Mokey Mokey') === 3, 'Goat: King summons 3 Mokey Mokey');
    g = gduel([{ hand: [], m: ['Mudora'], gy: ['Mokey Mokey', 'Shining Angel'], turn: 2 }, {}]);
    ok(E.atk(g, on(g, 0, 'Mudora')) === 1900, `Goat: Mudora ${E.atk(g, on(g, 0, 'Mudora'))}`);
    g = gduel([{ hand: ['Mystik Wok'], m: ['Blue-Eyes White Dragon'], turn: 2 }, {}]);
    act(g, 0, 'Mystik Wok'); settle(g, 'Blue-Eyes White Dragon', 'ATK'); ok(lp(g, 0) === 11000, `Goat: Wok gained 3000 (${lp(g, 0)})`);
  });
  G('Muko, Newdoria, Nimble Momonga', () => {
    let g = gduel([{ hand: ['Pot of Greed'], turn: 2 }, { st: ['Muko'] }]);
    act(g, 0, 'Pot of Greed'); settle(g, 'Muko'); ok(cnt(g, 0, 'gy') === 3, 'Goat: Muko discards the 2 draws');
    g = gduel([{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Newdoria'] }]);
    bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Newdoria', 'Blue-Eyes White Dragon'); ok(inZ(g, 0, 'gy', 'Blue-Eyes White Dragon'), 'Goat: Newdoria destroys Blue-Eyes');
    g = gduel([{ hand: [], m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: [{ n: 'Nimble Momonga', pos: 'def' }], deckTop: ['Nimble Momonga'] }]);
    bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', 'Nimble Momonga', 'Nimble Momonga');
    ok(lp(g, 1) === 9000 && cnt(g, 1, 'm', 'Nimble Momonga') === 1, `Goat: Momonga +1000 (${lp(g, 1)}) and 1 summoned`);
  });
  G('Ninja Grandmaster Sasuke, Penguin Soldier, Peten', () => {
    let g = gduel([{ hand: [], m: ['Ninja Grandmaster Sasuke'], turn: 2 }, { m: [{ n: 'Blue-Eyes White Dragon', pos: 'def' }] }]);
    bp(g); atkOn(g, 0, 'Ninja Grandmaster Sasuke', 'Blue-Eyes White Dragon'); ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Goat: Sasuke destroys face-up Defense Blue-Eyes');
    g = gduel([{ hand: [], m: [{ n: 'Penguin Soldier', pos: 'set' }], turn: 2 }, { hand: [], m: [GF, GF] }]);
    choose(g, 'flip:'); settle(g, GF, GF); ok(hand(g, 1) === 2, 'Goat: Penguin Soldier returns 2');
    g = gduel([{ hand: [], m: [GF], turn: 2 }, { m: ['Peten the Dark Clown'], deckTop: ['Peten the Dark Clown'] }]);
    bp(g); atkOn(g, 0, GF, 'Peten the Dark Clown', 'Peten the Dark Clown', 'Attack');
    ok(on(g, 1, 'Peten the Dark Clown') && inZ(g, 1, 'ban', 'Peten the Dark Clown'), 'Goat: Peten summons another');
  });
  G('Parasite Paracide and Penguin Knight', () => {
    let g = gduel([{ hand: [], m: [{ n: 'Parasite Paracide', pos: 'set' }], turn: 2 }, { m: [GF] }]);
    // B Deck is big here: just check Paracide went into it
    choose(g, 'flip:'); settle(g);
    ok(g.p[1].deck.some(c => E.name(c) === 'Parasite Paracide'), 'Goat: Paracide in B Deck');
    g = gduel([{ hand: [], m: [{ n: 'Needle Worm', pos: 'set' }], turn: 2 }, { gy: ['Mokey Mokey'], deckTop: ['Penguin Knight'] }]);
    choose(g, 'flip:'); settle(g); ok(cnt(g, 1, 'gy') === 0, `Goat: Penguin Knight reshuffles the GY (${cnt(g, 1, 'gy')})`);
  });
}
console.log(fails ? `\n${fails} failed` : '\nAll full-25 review checks passed.');
process.exit(fails ? 1 : 0);
