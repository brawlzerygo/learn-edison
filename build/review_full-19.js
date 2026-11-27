// Independent review checks for full pool batch 19 (written from the card text): node build/review_full-19.js
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
const inZ = (g, p, z, n) => z === 'fz' ? !!(g.p[p].fz && E.name(g.p[p].fz) === n) : g.p[p][z].some(c => c && E.name(c) === n);
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
const lp = (g, p) => g.p[p].lp;
const hand = (g, p) => g.p[p].hand.length;
const A = (g, c) => E.atk(g, c), Df = (g, c) => E.def(g, c);
const deckTopName = (g, p) => E.name(g.p[p].deck[g.p[p].deck.length - 1]);
const heads = g => { g.rnd = () => 0.1; };
const tails = g => { g.rnd = () => 0.9; };

T('Archlord Zerato: Tribute Zera with Sanctuary, discard LIGHT to destroy all', () => {
  const g = duel({ board: [{ hand: ['The Sanctuary in the Sky', 'Archlord Zerato', 'Shining Angel'], m: ['Warrior of Zera'], turn: 2 }, { m: [FILL, 'Blue-Eyes White Dragon'] }] });
  const z = card(g, 0, 'Archlord Zerato');
  ok(!hasOpt(g, 'ns:' + z.u) && !hasOpt(g, 'set:' + z.u), 'cannot be Normal Summoned or Set');
  ok(!hasOpt(g, 'sp:' + z.u), 'no Special Summon without Sanctuary');
  act(g, 0, 'The Sanctuary in the Sky'); settle(g);
  ok(hasOpt(g, 'sp:' + z.u), 'Special Summon offered with Sanctuary and Zera'); choose(g, 'sp:' + z.u); settle(g, 'Warrior of Zera', 'Attack');
  ok(on(g, 0, 'Archlord Zerato') && inZ(g, 0, 'gy', 'Warrior of Zera'), 'Zerato summoned, Zera tributed');
  const zz = on(g, 0, 'Archlord Zerato'); ok(hasOpt(g, 'a:' + zz.u + ':'), 'destroy effect offered');
  choose(g, 'a:' + zz.u + ':'); settle(g, 'Shining Angel');
  ok(cnt(g, 1, 'm') === 0 && inZ(g, 0, 'gy', 'Shining Angel'), 'Shining Angel discarded, all B monsters destroyed');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Archlord Zerato'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be revived with Monster Reborn');
});
T('Array of Revealing Light: the declared Type cannot attack the turn it is summoned', () => {
  const g = duel({ board: [{ hand: ['Array of Revealing Light', FILL], m: ['Baby Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Array of Revealing Light'); settle(g, 'Beast-Warrior');
  ok(inZ(g, 0, 'fz', 'Array of Revealing Light'), 'Array face-up in the Field Zone');
  ns(g, 0, FILL, 'Attack'); bp(g);
  ok(!canAtk(g, on(g, 0, FILL), null), 'the just-summoned Beast-Warrior cannot attack');
  ok(canAtk(g, on(g, 0, 'Baby Dragon'), null), 'Baby Dragon (not summoned this turn) can attack');
});
T('Arsenal Robber: the opponent sends 1 Equip Spell from the Deck to the GY', () => {
  const g = duel({ board: [{ st: ['Arsenal Robber'], turn: 2 }, { deckTop: ['United We Stand'] }] });
  act(g, 0, 'Arsenal Robber'); settle(g, 'United We Stand');
  ok(inZ(g, 1, 'gy', 'United We Stand') && inZ(g, 0, 'gy', 'Arsenal Robber'), 'United We Stand sent to B GY');
});
T('Arsenal Summoner: FLIP adds a Guardian card, not Celtic Guardian', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Arsenal Summoner', pos: 'set' }], deckTop: [FILL, 'Celtic Guardian', 'Guardian Sphinx'], turn: 2 }, {}] });
  choose(g, 'flip:' + on(g, 0, 'Arsenal Summoner').u);
  const pr = g.prompt; const offersCeltic = pr && pr.opts.some(x => x.label.includes('Celtic'));
  settle(g, 'Guardian Sphinx');
  ok(inZ(g, 0, 'hand', 'Guardian Sphinx') && !offersCeltic && !inZ(g, 0, 'hand', 'Celtic Guardian'), 'Guardian Sphinx added, Celtic Guardian not offered');
});
T('Astral Barrier: an attack on your monster becomes a direct attack', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Mystical Elf'], st: [{ n: 'Astral Barrier', pos: 'up' }] }] });
  bp(g); atkOn(g, 0, FILL, 'Mystical Elf', 'Astral Barrier');
  ok(on(g, 1, 'Mystical Elf') && lp(g, 1) === 6000, `Elf safe, B took 2000 direct (${lp(g, 1)})`);
});
T('Asura Priest: attacks every monster once, returns to hand on its summon turn, no Special Summon', () => {
  const g = duel({ board: [{ m: ['Asura Priest'], turn: 2 }, { m: ['Baby Dragon', 'Flame Manipulator'] }] });
  bp(g); atkOn(g, 0, 'Asura Priest', 'Baby Dragon');
  ok(canAtk(g, on(g, 0, 'Asura Priest'), on(g, 1, 'Flame Manipulator')), 'second attack on the other monster offered');
  atkOn(g, 0, 'Asura Priest', 'Flame Manipulator');
  ok(cnt(g, 1, 'm') === 0 && lp(g, 1) === 8000 - 500 - 800, `both destroyed (B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Asura Priest'], turn: 2 }, {}] });
  ns(g2, 0, 'Asura Priest', 'Attack'); endTurn(g2);
  ok(inZ(g2, 0, 'hand', 'Asura Priest'), 'returned to the hand in the End Phase');
  const g3 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Asura Priest'], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'Monster Reborn'), 'cannot be Special Summoned');
});
T('Aswan Apparition: battle damage returns a Trap from the GY to the Deck top', () => {
  const g = duel({ board: [{ m: ['Aswan Apparition'], gy: ['Mirror Force'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Aswan Apparition', null, 'Mirror Force');
  ok(lp(g, 1) === 7500 && deckTopName(g, 0) === 'Mirror Force', `Mirror Force on top of the Deck (top ${deckTopName(g, 0)})`);
});
T('Atomic Firefly: the player who destroyed it takes 1000', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Atomic Firefly'] }] });
  bp(g); atkOn(g, 0, FILL, 'Atomic Firefly');
  ok(inZ(g, 1, 'gy', 'Atomic Firefly') && lp(g, 0) === 7000 && lp(g, 1) === 8000 - 1900, `A took 1000 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Aussa the Earth Charmer: FLIP takes an EARTH monster while face-up', () => {
  const g = duel({ board: [{ m: [{ n: 'Aussa the Earth Charmer', pos: 'set' }], turn: 2 }, { m: [FILL, 'Harpie Lady'] }] });
  choose(g, 'flip:' + on(g, 0, 'Aussa the Earth Charmer').u); settle(g, FILL);
  ok(on(g, 0, FILL) && on(g, 1, 'Harpie Lady'), 'A controls the EARTH Warwolf, not the WIND Harpie');
});
T('Autonomous Action Unit: pay 1500, revive from the opponent GY, destroyed when it leaves', () => {
  const g = duel({ board: [{ hand: ['Autonomous Action Unit', 'Mystical Space Typhoon'], turn: 2 }, { gy: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Autonomous Action Unit'); settle(g, 'Blue-Eyes');
  const b = on(g, 0, 'Blue-Eyes White Dragon');
  ok(b && b.pos === 'atk' && lp(g, 0) === 6500, `Blue-Eyes on A field in Attack Position, A paid 1500 (${lp(g, 0)})`);
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Autonomous Action Unit');
  ok(!on(g, 0, 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Blue-Eyes destroyed when the Unit left');
});
T('Avatar of The Pot: send Pot of Greed, draw 3', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Avatar of The Pot'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Avatar of The Pot'); settle(g, 'Pot of Greed');
  ok(hand(g, 0) === h - 1 + 3 && inZ(g, 0, 'gy', 'Pot of Greed'), `drew 3 (hand ${hand(g, 0)})`);
});
T('Back to Square One: discard 1, put a monster on top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Back to Square One', 'Baby Dragon'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Back to Square One'); settle(g, 'Baby Dragon', 'Blue-Eyes');
  ok(inZ(g, 0, 'gy', 'Baby Dragon') && deckTopName(g, 1) === 'Blue-Eyes White Dragon', 'Baby Dragon discarded, Blue-Eyes on top of B Deck');
});
T('Backfire: 500 when a FIRE monster you control is destroyed', () => {
  const g = duel({ board: [{ m: ['Flame Manipulator'], st: [{ n: 'Backfire', pos: 'up' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Flame Manipulator', 'Blue-Eyes White Dragon', 'Backfire');
  ok(lp(g, 1) === 7500, `B took 500 (${lp(g, 1)})`);
});
T('Backup Soldier: 5 monsters in GY, add up to 3 non-Effect with 1500 or less', () => {
  const g = duel({ board: [{ hand: [], st: ['Backup Soldier'], gy: ['Baby Dragon', 'Flame Manipulator', 'Mystical Elf', 'Sangan', 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Backup Soldier'); settle(g, 'Baby Dragon', 'Flame Manipulator', 'Mystical Elf');
  ok(inZ(g, 0, 'hand', 'Baby Dragon') && inZ(g, 0, 'hand', 'Flame Manipulator') && inZ(g, 0, 'hand', 'Mystical Elf'), '3 Normal Monsters added');
  ok(inZ(g, 0, 'gy', 'Sangan') && inZ(g, 0, 'gy', 'Blue-Eyes White Dragon'), 'Sangan and Blue-Eyes stay');
  const g2 = duel({ board: [{ st: ['Backup Soldier'], gy: ['Baby Dragon', 'Flame Manipulator', 'Mystical Elf', 'Sangan'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Backup Soldier'), 'not with 4 monsters in GY');
});
T('Bad Reaction to Simochi: the opponent LP gain becomes damage', () => {
  const g = duel({ board: [{ hand: ['Upstart Goblin'], st: [{ n: 'Bad Reaction to Simochi', pos: 'up' }], turn: 2 }, {}] });
  act(g, 0, 'Upstart Goblin'); settle(g);
  ok(lp(g, 1) === 7000, `B took 1000 instead of gaining (${lp(g, 1)})`);
});
T('Bait Doll: forces a Set Trap with wrong timing, destroys it, Bait Doll goes to the Deck', () => {
  const g = duel({ board: [{ hand: ['Bait Doll'], turn: 2 }, { st: ['Mirror Force', 'Pot of Greed'] }] });
  const dk = g.p[0].deck.length;
  act(g, 0, 'Bait Doll'); settle(g, 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
  ok(!inZ(g, 0, 'gy', 'Bait Doll') && g.p[0].deck.length === dk + 1, 'Bait Doll shuffled into the Deck');
  const g2 = duel({ board: [{ hand: ['Bait Doll'], turn: 2 }, { st: ['Pot of Greed'] }] });
  act(g2, 0, 'Bait Doll'); settle(g2, 'Pot of Greed');
  const pg = g2.p[1].st.find(c => c && E.name(c) === 'Pot of Greed');
  ok(pg && pg.pos === 'set', 'a Set Spell goes back face-down');
});
T('Ballista of Rampart Smashing: +1500 only when attacking a face-down Defense monster', () => {
  const g = duel({ board: [{ hand: ['Ballista of Rampart Smashing'], m: [FILL], turn: 2 }, { m: [{ n: 'Giant Soldier of Stone', pos: 'set' }] }] });
  act(g, 0, 'Ballista of Rampart Smashing'); settle(g, FILL);
  ok(A(g, on(g, 0, FILL)) === 2000, 'no ATK change outside battle');
  bp(g); atkOn(g, 0, FILL, 'Giant Soldier of Stone');
  ok(inZ(g, 1, 'gy', 'Giant Soldier of Stone') && A(g, on(g, 0, FILL)) === 2000, 'the 2000 DEF Soldier is destroyed, ATK back to 2000');
});
T('Balloon Lizard: a counter each Standby, damage to the destroyer', () => {
  const g = duel({ board: [{ m: ['Balloon Lizard'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  const bl = on(g, 0, 'Balloon Lizard');
  const n = Object.values(bl.ctr || {}).reduce((a, b) => a + b, 0);
  ok(n === 1, `1 counter after the first Standby (${JSON.stringify(bl.ctr)})`);
  endTurn(g); bp(g); atkOn(g, 1, 'Blue-Eyes White Dragon', 'Balloon Lizard');
  ok(inZ(g, 0, 'gy', 'Balloon Lizard') && lp(g, 1) === 7600, `B took 400 (${lp(g, 1)})`);
});
T('Banisher of the Light: cards sent to the GY are banished', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Banisher of the Light'], turn: 2 }, {}] });
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(inZ(g, 0, 'ban', 'Pot of Greed') && !inZ(g, 0, 'gy', 'Pot of Greed'), 'Pot of Greed banished');
});
T('Banner of Courage: +200 ATK during your Battle Phase only', () => {
  const g = duel({ board: [{ m: [FILL], st: [{ n: 'Banner of Courage', pos: 'up' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  ok(A(g, on(g, 0, FILL)) === 2000, 'ATK 2000 in Main Phase 1');
  bp(g); ok(A(g, on(g, 0, FILL)) === 2200, `ATK 2200 in the Battle Phase (${A(g, on(g, 0, FILL))})`);
  atkOn(g, 0, FILL, 'Cyber Dragon');
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && lp(g, 1) === 7900, `Cyber Dragon destroyed, B took 100 (${lp(g, 1)})`);
});
T('Bark of Dark Ruler: pay LP so the opponent monster loses that much', () => {
  const g = duel({ board: [{ m: ['Crass Clown'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: [] }] });
  // A's Trap in A's own turn: set it on the board
  const g2 = duel({ board: [{ m: ['Crass Clown'], st: ['Bark of Dark Ruler'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g2); const a = on(g2, 0, 'Crass Clown'), t = on(g2, 1, 'Blue-Eyes White Dragon');
  choose(g2, `atk:${a.u}:${t.u}`);
  let used = false;
  for (let i = 0; i < 60 && g2.prompt && g2.prompt.type !== 'idle' && g2.prompt.type !== 'battle'; i++) {
    const pr = g2.prompt;
    if (pr.type === 'respond') { const o = pr.p === 0 && pr.opts.find(x => x.key !== 'pass' && byU(g2, x.u) && E.name(byU(g2, x.u)) === 'Bark of Dark Ruler'); if (o) { used = true; E.act(g2, [o.key]); } else E.act(g2, ['pass']); }
    else if (pr.type === 'yesno') choose(g2, 'yes');
    else { const o = pr.opts.find(x => /1700/.test(x.label)) || pr.opts.find(x => x.label.includes('Blue-Eyes')) || pr.opts[pr.opts.length - 1]; E.act(g2, [o.key]); }
  }
  ok(used, 'Bark offered in the Damage Step');
  ok(lp(g2, 0) <= 7900 && (inZ(g2, 1, 'gy', 'Blue-Eyes White Dragon') || A(g2, t) < 3000), `LP paid and Blue-Eyes lost ATK (A LP ${lp(g2, 0)})`);
  ok(inZ(g2, 1, 'gy', 'Blue-Eyes White Dragon') && on(g2, 0, 'Crass Clown') && lp(g2, 0) === 6300, `paying 1700 lets Crass Clown win (A ${lp(g2, 0)}, B ${lp(g2, 1)})`);
});
T('Barrel Behind the Door: the burn hits the opponent instead', () => {
  const g = duel({ board: [{ st: ['Barrel Behind the Door'], turn: 2 }, { hand: ['Hinotama'] }] });
  endTurn(g); act(g, 1, 'Hinotama'); settle(g, 'Barrel Behind the Door');
  ok(lp(g, 0) === 8000 && lp(g, 1) === 7500, `B took the 500 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Barrel Dragon: 2 of 3 heads destroys the target, once per turn', () => {
  const g = duel({ board: [{ m: ['Barrel Dragon'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  heads(g); act(g, 0, 'Barrel Dragon'); settle(g, 'Blue-Eyes');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Blue-Eyes destroyed on heads');
  ok(!canAct(g, 0, 'Barrel Dragon'), 'once per turn');
  const g2 = duel({ board: [{ m: ['Barrel Dragon'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  tails(g2); act(g2, 0, 'Barrel Dragon'); settle(g2, 'Blue-Eyes');
  ok(on(g2, 1, 'Blue-Eyes White Dragon'), 'Blue-Eyes survives on tails');
});
T('Bazoo the Soul-Eater: banish up to 3, +300 each until the end of the opponent turn', () => {
  const g = duel({ board: [{ m: ['Bazoo the Soul-Eater'], gy: ['Baby Dragon', 'Sangan', 'Mystical Elf'], turn: 2 }, {}] });
  act(g, 0, 'Bazoo the Soul-Eater'); settle(g, 'Baby Dragon', 'Sangan', 'Mystical Elf');
  const b = on(g, 0, 'Bazoo the Soul-Eater');
  ok(A(g, b) === 2500 && cnt(g, 0, 'ban') === 3, `2500 ATK, 3 banished (${A(g, b)})`);
  ok(!canAct(g, 0, 'Bazoo the Soul-Eater'), 'once per turn');
  endTurn(g); ok(A(g, b) === 2500, 'still 2500 in the opponent turn');
  endTurn(g); ok(A(g, b) === 1600, `back to 1600 after the opponent turn (${A(g, b)})`);
});
// ENGINE (documented in the script): substitute Fusion Materials aren't read, so only a normal Summon is checked.
T('Beastking of the Swamps: can be Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Beastking of the Swamps'], turn: 2 }, {}] });
  ns(g, 0, 'Beastking of the Swamps', 'Attack'); ok(on(g, 0, 'Beastking of the Swamps'), 'on the field');
});
T('Beckoning Light: discard the hand, add that many LIGHT monsters', () => {
  const g = duel({ board: [{ hand: [FILL, 'Baby Dragon'], st: ['Beckoning Light'], gy: ['Mystical Elf', 'Shining Angel', 'Marshmallon'], turn: 2 }, {}] });
  act(g, 0, 'Beckoning Light'); settle(g, 'Mystical Elf', 'Shining Angel');
  ok(hand(g, 0) === 3 && g.p[0].hand.every(c => E.lib.attr(c) === 'LIGHT') && inZ(g, 0, 'gy', 'Baby Dragon') && cnt(g, 0, 'gy', FILL) === 2, 'hand of 3 (with the draw) discarded, 3 LIGHT monsters added');
  const g2 = duel({ board: [{ hand: [FILL, 'Baby Dragon'], st: ['Beckoning Light'], gy: ['Mystical Elf', 'Shining Angel'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Beckoning Light'), 'not with fewer LIGHT monsters in GY than cards in hand');
});
T('Behemoth: 1 Tribute makes it 2000 ATK, returns a Beast per Tribute', () => {
  const g = duel({ board: [{ hand: ['Behemoth the King of All Animals'], m: [FILL], gy: ['Blade Rabbit'], turn: 2 }, {}] });
  ns(g, 0, 'Behemoth the King of All Animals', FILL, 'Blade Rabbit', 'Attack');
  const b = on(g, 0, 'Behemoth the King of All Animals');
  ok(b && A(g, b) === 2000, `2000 ATK with 1 Tribute (${b && A(g, b)})`);
  ok(inZ(g, 0, 'hand', 'Blade Rabbit'), 'Blade Rabbit returned to hand');
  const g2 = duel({ board: [{ hand: ['Behemoth the King of All Animals'], m: [FILL, 'Baby Dragon'], turn: 2 }, {}] });
  const bh = card(g2, 0, 'Behemoth the King of All Animals'); choose(g2, 'ns:' + bh.u);
  for (let i = 0; i < 20 && g2.prompt && g2.prompt.type !== 'idle'; i++) { const pr = g2.prompt;
    if (pr.type === 'pick' && pr.max >= 2 && pr.min <= 2) E.act(g2, pr.opts.slice(0, 2).map(x => x.key));
    else if (pr.type === 'yesno') choose(g2, 'yes'); else if (pr.type === 'respond') E.act(g2, ['pass']);
    else { const o = pr.opts.find(x => /2 Tribute|two|2/.test(x.label)) || pr.opts.find(x => /Attack/.test(x.label)) || pr.opts[0]; E.act(g2, [o.key]); } }
  const b2 = on(g2, 0, 'Behemoth the King of All Animals');
  ok(b2 && A(g2, b2) === 2700, `2700 ATK with 2 Tributes (${b2 && A(g2, b2)})`);
});
T('Berserk Dragon: no Normal Summon or revival, attacks all, loses 500 each End Phase', () => {
  const g = duel({ board: [{ hand: ['Berserk Dragon', 'Monster Reborn'], gy: ['Berserk Dragon'], turn: 2 }, {}] });
  const bd = g.p[0].hand.find(c => E.name(c) === 'Berserk Dragon');
  ok(!hasOpt(g, 'ns:' + bd.u) && !hasOpt(g, 'set:' + bd.u), 'cannot be Normal Summoned or Set');
  ok(!canAct(g, 0, 'Monster Reborn'), 'cannot be revived with Monster Reborn');
  const g2 = duel({ board: [{ m: ['Berserk Dragon'], turn: 2 }, { m: ['Baby Dragon', 'Flame Manipulator'] }] });
  bp(g2); atkOn(g2, 0, 'Berserk Dragon', 'Baby Dragon'); atkOn(g2, 0, 'Berserk Dragon', 'Flame Manipulator');
  ok(cnt(g2, 1, 'm') === 0, 'both B monsters destroyed');
  endTurn(g2); ok(A(g2, on(g2, 0, 'Berserk Dragon')) === 3000, `3000 after A End Phase (${A(g2, on(g2, 0, 'Berserk Dragon'))})`);
  endTurn(g2); ok(A(g2, on(g2, 0, 'Berserk Dragon')) === 3000, 'no loss in the opponent End Phase');
});
T('Berserk Gorilla: destroyed in face-up Defense, must attack', () => {
  const g = duel({ board: [{ m: ['Berserk Gorilla'], turn: 2 }, {}] });
  choose(g, 'pos:' + on(g, 0, 'Berserk Gorilla').u); settle(g);
  ok(inZ(g, 0, 'gy', 'Berserk Gorilla'), 'destroyed when changed to Defense Position');
  // ENGINE (documented in the script): "must attack if able" isn't enforced.
});
T('Bickuribox: Fusion of Crass Clown and Dream Clown', () => {
  const g = duel({ ex0: ['Bickuribox'], board: [{ hand: ['Polymerization', 'Crass Clown', 'Dream Clown'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Bickuribox', 'Crass Clown', 'Dream Clown', 'Attack');
  const b = on(g, 0, 'Bickuribox'); ok(b && A(g, b) === 2300, 'Bickuribox 2300 on the field');
});
T('Birdface: destroyed by battle, add Harpie Lady', () => {
  const g = duel({ board: [{ m: ['Birdface'], deckTop: [FILL, 'Harpie Lady'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Birdface', 'Blue-Eyes White Dragon', 'Harpie Lady');
  ok(inZ(g, 0, 'hand', 'Harpie Lady'), 'Harpie Lady added');
});
T('Bite Shoes: FLIP changes a face-up monster battle position', () => {
  const g = duel({ board: [{ m: [{ n: 'Bite Shoes', pos: 'set' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'flip:' + on(g, 0, 'Bite Shoes').u); settle(g, 'Blue-Eyes');
  ok(on(g, 1, 'Blue-Eyes White Dragon').pos === 'def', 'Blue-Eyes in Defense Position');
});
T('Blade Knight: +400 with 1 or fewer cards, negates the Flip of monsters it destroys', () => {
  const g = duel({ board: [{ hand: [], m: ['Blade Knight'], turn: 2 }, { m: [{ n: 'Man-Eater Bug', pos: 'set' }] }] });
  const bk = on(g, 0, 'Blade Knight'); ok(A(g, bk) === 2000, `2000 with 1 card in hand (${A(g, bk)})`);
  bp(g); atkOn(g, 0, 'Blade Knight', 'Man-Eater Bug', 'Blade Knight');
  ok(on(g, 0, 'Blade Knight') && inZ(g, 1, 'gy', 'Man-Eater Bug'), 'Man-Eater Bug destroyed, its Flip negated');
  const g2 = duel({ board: [{ hand: [FILL, FILL], m: ['Blade Knight'], turn: 2 }, {}] });
  ok(A(g2, on(g2, 0, 'Blade Knight')) === 1600, 'only 1600 with 3 cards in hand');
});
T('Blade Rabbit: Attack to Defense destroys an opponent monster', () => {
  const g = duel({ board: [{ m: ['Blade Rabbit'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'pos:' + on(g, 0, 'Blade Rabbit').u); settle(g, 'Blue-Eyes');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Blue-Eyes destroyed');
});
T('Bladefly: WIND +500, EARTH -400', () => {
  const g = duel({ board: [{ m: ['Bladefly'], turn: 2 }, { m: [FILL, 'Harpie Lady'] }] });
  ok(A(g, on(g, 1, FILL)) === 1600 && A(g, on(g, 1, 'Harpie Lady')) === 1800 && A(g, on(g, 0, 'Bladefly')) === 1100, 'EARTH 1600, Harpie 1800, Bladefly 1100');
});
T('Blasting the Ruins: 30 cards in GY, 3000 damage', () => {
  const g = duel({ board: [{ st: ['Blasting the Ruins'], gy: Array(30).fill(FILL), turn: 2 }, {}] });
  act(g, 0, 'Blasting the Ruins'); settle(g);
  ok(lp(g, 1) === 5000, `B took 3000 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ st: ['Blasting the Ruins'], gy: Array(29).fill(FILL), turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Blasting the Ruins'), 'not with 29');
});
T('Blessings of the Nile: gain 1000 when the opponent effect discards from your hand', () => {
  const g = duel({ board: [{ hand: [FILL, 'Baby Dragon'], st: [{ n: 'Blessings of the Nile', pos: 'up' }], turn: 2 }, { hand: ['Confiscation'] }] });
  endTurn(g); act(g, 1, 'Confiscation'); settle(g);
  ok(cnt(g, 0, 'gy') >= 1 && lp(g, 0) === 9000, `A discarded 1 and gained 1000 (${lp(g, 0)})`);
});
T('Blind Destruction: roll in your Standby Phase, destroy that Level', () => {
  const g = duel({ board: [{ m: ['Kuriboh', 'Time Wizard', 'Baby Dragon', FILL], st: [{ n: 'Blind Destruction', pos: 'up' }], turn: 2 }, { m: ['Marshmallon', 'Cyber Dragon', 'Dark Magician', 'Blue-Eyes White Dragon'] }] });
  const roll = g.log.map(s => /rolled a (\d)/.exec(s)).filter(Boolean).map(m => +m[1]);
  ok(roll.length === 1, `one roll in the first Standby (${roll})`);
  const n = roll[0]; const lvOf = c => E.lib.lv(c);
  const left = [...g.p[0].m, ...g.p[1].m].filter(Boolean);
  const bad = left.filter(c => n < 6 ? lvOf(c) === n : lvOf(c) >= 6);
  ok(bad.length === 0 && left.length < 8, `rolled ${n}, those monsters destroyed (left ${left.map(E.name).join(', ')})`);
});
T('Blindly Loyal Goblin: control cannot switch', () => {
  const g = duel({ board: [{ hand: ['Change of Heart', 'Snatch Steal', 'Brain Control'], turn: 2 }, { m: ['Blindly Loyal Goblin'] }] });
  ok(!canAct(g, 0, 'Change of Heart') && !canAct(g, 0, 'Snatch Steal') && !canAct(g, 0, 'Brain Control'), 'Change of Heart, Snatch Steal and Brain Control cannot be used on it');
  const g2 = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: ['Blindly Loyal Goblin', FILL] }] });
  act(g2, 0, 'Change of Heart'); const offersG = g2.prompt && g2.prompt.opts.some(x => x.label.includes('Goblin')); settle(g2, FILL);
  ok(!offersG && on(g2, 0, FILL) && on(g2, 1, 'Blindly Loyal Goblin'), 'with another monster, only that one is taken');
});
T('Block Attack: an Attack Position monster goes to Defense', () => {
  const g = duel({ board: [{ hand: ['Block Attack'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Block Attack'); settle(g, 'Blue-Eyes');
  ok(on(g, 1, 'Blue-Eyes White Dragon').pos === 'def', 'Blue-Eyes in Defense Position');
});
T('Blowback Dragon: 2 of 3 heads destroys any opponent card', () => {
  const g = duel({ board: [{ m: ['Blowback Dragon'], turn: 2 }, { st: ['Mirror Force'] }] });
  heads(g); act(g, 0, 'Blowback Dragon'); settle(g, 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
  ok(!canAct(g, 0, 'Blowback Dragon'), 'once per turn');
});
T('Boar Soldier: destroyed if Normal Summoned, -1000 while the opponent has a monster', () => {
  const g = duel({ board: [{ hand: ['Boar Soldier'], turn: 2 }, {}] });
  ns(g, 0, 'Boar Soldier', 'Attack');
  ok(inZ(g, 0, 'gy', 'Boar Soldier'), 'destroyed on Normal Summon');
  const g2 = duel({ board: [{ m: ['Boar Soldier'], turn: 2 }, { m: [FILL] }] });
  ok(A(g2, on(g2, 0, 'Boar Soldier')) === 1000, '1000 ATK while B has a monster');
  const g3 = duel({ board: [{ m: ['Boar Soldier'], turn: 2 }, {}] });
  ok(A(g3, on(g3, 0, 'Boar Soldier')) === 2000, '2000 ATK otherwise');
});
T('Bombardment Beetle: FLIP destroys a face-down Effect Monster', () => {
  const g = duel({ board: [{ m: [{ n: 'Bombardment Beetle', pos: 'set' }], turn: 2 }, { m: [{ n: 'Man-Eater Bug', pos: 'set' }] }] });
  choose(g, 'flip:' + on(g, 0, 'Bombardment Beetle').u); settle(g, 'Man-Eater Bug');
  ok(inZ(g, 1, 'gy', 'Man-Eater Bug') && on(g, 0, 'Bombardment Beetle'), 'Man-Eater Bug destroyed, no Flip effect');
  const g2 = duel({ board: [{ m: [{ n: 'Bombardment Beetle', pos: 'set' }], turn: 2 }, { m: [{ n: 'Baby Dragon', pos: 'set' }] }] });
  choose(g2, 'flip:' + on(g2, 0, 'Bombardment Beetle').u); settle(g2, 'Baby Dragon');
  const bd = on(g2, 1, 'Baby Dragon'); ok(bd && bd.pos === 'set', 'a Normal Monster stays face-down');
});
T('Bottomless Shifting Sand: destroys the highest ATK at the end of the opponent turn, then itself', () => {
  const g = duel({ board: [{ hand: [FILL, FILL, FILL, FILL], m: [FILL], st: [{ n: 'Bottomless Shifting Sand', pos: 'up' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ok(card(g, 0, 'Bottomless Shifting Sand').zone === 'st', 'stays with 5 cards in hand in your Standby Phase');
  endTurn(g); ok(on(g, 1, 'Blue-Eyes White Dragon'), 'not at the end of your own turn');
  endTurn(g);
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 0, FILL), 'Blue-Eyes destroyed at the end of B turn');
  const g2 = duel({ board: [{ hand: [], st: [{ n: 'Bottomless Shifting Sand', pos: 'up' }], turn: 2 }, {}] });
  ok(inZ(g2, 0, 'gy', 'Bottomless Shifting Sand'), 'Sand destroyed in your Standby with 4 or fewer cards');
});
T('Bowganian: 600 in your Standby Phase', () => {
  const g = duel({ board: [{ m: ['Bowganian'], turn: 2 }, {}] });
  ok(lp(g, 1) === 7400, `B took 600 (${lp(g, 1)})`);
  endTurn(g); ok(lp(g, 1) === 7400, 'not in the opponent Standby Phase');
});
T('Bubonic Vermin: FLIP Special Summons another face-down', () => {
  const g = duel({ board: [{ m: [{ n: 'Bubonic Vermin', pos: 'set' }], deckTop: [FILL, 'Bubonic Vermin'], turn: 2 }, {}] });
  choose(g, 'flip:' + on(g, 0, 'Bubonic Vermin').u); settle(g, 'Bubonic Vermin');
  const vs = g.p[0].m.filter(c => c && E.name(c) === 'Bubonic Vermin');
  ok(vs.length === 2 && vs.some(c => c.pos === 'set'), 'second Vermin face-down');
});
T('Buster Blader: +500 per Dragon on the opponent field and GY', () => {
  const g = duel({ board: [{ m: ['Buster Blader'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], gy: ['Baby Dragon'] }] });
  ok(A(g, on(g, 0, 'Buster Blader')) === 3600, `3600 (${A(g, on(g, 0, 'Buster Blader'))})`);
});
T('Buster Rancher: only 1000 or less, +2500 against a 2500+ monster', () => {
  const g = duel({ board: [{ hand: ['Buster Rancher'], m: ['Exiled Force', FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Buster Rancher'); const offersFill = g.prompt && g.prompt.opts.some(x => x.label.includes(FILL)); settle(g, 'Exiled Force');
  ok(!offersFill, 'the 2000 ATK Warwolf is not offered');
  bp(g); atkOn(g, 0, 'Exiled Force', 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && lp(g, 1) === 7500, `Blue-Eyes destroyed, B took 500 (${lp(g, 1)})`);
});
T('Byser Shock: returns all Set cards to the hand', () => {
  const g = duel({ board: [{ hand: ['Byser Shock'], m: [FILL], st: ['Pot of Greed'], turn: 2 }, { m: [{ n: 'Baby Dragon', pos: 'set' }], st: ['Trap Hole'] }] });
  ns(g, 0, 'Byser Shock', FILL, 'Attack');
  ok(on(g, 0, 'Byser Shock'), 'Byser Shock summoned');
  ok(inZ(g, 1, 'hand', 'Baby Dragon') && inZ(g, 1, 'hand', 'Trap Hole') && inZ(g, 0, 'hand', 'Pot of Greed'), 'Set cards of both players returned');
});
T('Cannon Soldier: Tribute 1, 500 damage', () => {
  const g = duel({ board: [{ m: ['Cannon Soldier', FILL], turn: 2 }, {}] });
  act(g, 0, 'Cannon Soldier'); settle(g, FILL);
  ok(lp(g, 1) === 7500 && inZ(g, 0, 'gy', FILL), `B took 500 (${lp(g, 1)})`);
});
T('Cannonball Spear Shellfish: unaffected by Spells while Umi is face-up', () => {
  const g = duel({ board: [{ hand: ['Umi', 'Dark Hole'], m: ['Cannonball Spear Shellfish'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Umi'); settle(g);
  act(g, 0, 'Dark Hole'); settle(g);
  ok(on(g, 0, 'Cannonball Spear Shellfish') && inZ(g, 1, 'gy', FILL), 'Shellfish survives Dark Hole');
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Cannonball Spear Shellfish'], turn: 2 }, {}] });
  act(g2, 0, 'Dark Hole'); settle(g2);
  ok(inZ(g2, 0, 'gy', 'Cannonball Spear Shellfish'), 'destroyed without Umi');
});
T('Cat\'s Ear Tribe: the attacker original ATK becomes 200 in the opponent turn', () => {
  const g = duel({ board: [{ m: ["Cat's Ear Tribe"], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  endTurn(g); bp(g); atkOn(g, 1, 'Blue-Eyes White Dragon', "Cat's Ear Tribe");
  ok(lp(g, 0) === 8000 && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), `200 vs 200, no damage, Blue-Eyes destroyed (A ${lp(g, 0)})`);
  ok(cnt(g, 1, 'm') === 0 || A(g, on(g, 1, 'Blue-Eyes White Dragon')) === 3000, 'back to normal after');
});
T('Catapult Turtle: Tribute 1, half its ATK as damage', () => {
  const g = duel({ board: [{ m: ['Catapult Turtle', 'Blue-Eyes White Dragon', FILL], turn: 2 }, {}] });
  act(g, 0, 'Catapult Turtle'); settle(g, 'Blue-Eyes');
  ok(lp(g, 1) === 6500, `B took 1500 (${lp(g, 1)})`);
  ok(canAct(g, 0, 'Catapult Turtle'), 'can be used again the same turn');
});
T('Catnipped Kitty: cannot be attacked with another Beast, makes DEF 0', () => {
  const g = duel({ board: [{ m: ['Catnipped Kitty', 'Blade Rabbit'], turn: 2 }, { m: ['Giant Soldier of Stone', 'Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Catnipped Kitty'); settle(g, 'Giant Soldier');
  ok(Df(g, on(g, 1, 'Giant Soldier of Stone')) === 0, 'Soldier DEF 0');
  ok(!canAct(g, 0, 'Catnipped Kitty'), 'once per turn');
  endTurn(g); ok(Df(g, on(g, 1, 'Giant Soldier of Stone')) === 2000, 'DEF back next turn');
  bp(g); const be = on(g, 1, 'Blue-Eyes White Dragon');
  ok(!canAtk(g, be, on(g, 0, 'Catnipped Kitty')) && canAtk(g, be, on(g, 0, 'Blade Rabbit')), 'Kitty cannot be attacked, Rabbit can');
});
T('Cave Dragon: no Normal Summon with a monster, attacks only with another Dragon', () => {
  const g = duel({ board: [{ hand: ['Cave Dragon'], m: [FILL], turn: 2 }, {}] });
  const cd = card(g, 0, 'Cave Dragon'); ok(!hasOpt(g, 'ns:' + cd.u), 'no Normal Summon while you control a monster'); // ENGINE: canNormal also blocks the Set (ruling allows it)
  const g2 = duel({ board: [{ m: ['Cave Dragon'], turn: 2 }, {}] });
  bp(g2); ok(!canAtk(g2, on(g2, 0, 'Cave Dragon'), null), 'cannot attack alone');
  const g3 = duel({ board: [{ m: ['Cave Dragon', 'Baby Dragon'], turn: 2 }, {}] });
  bp(g3); ok(canAtk(g3, on(g3, 0, 'Cave Dragon'), null), 'can attack with Baby Dragon');
  const g4 = duel({ board: [{ hand: ['Cave Dragon'], turn: 2 }, {}] });
  ok(hasOpt(g4, 'ns:' + card(g4, 0, 'Cave Dragon').u), 'Normal Summon allowed with an empty field');
});
T('Ceasefire: flips Set monsters without Flip effects, 500 per Effect Monster', () => {
  const g = duel({ board: [{ st: ['Ceasefire'], turn: 2 }, { m: [{ n: 'Man-Eater Bug', pos: 'set' }, 'Sangan', FILL] }] });
  act(g, 0, 'Ceasefire'); settle(g);
  const mb = on(g, 1, 'Man-Eater Bug');
  ok(mb && mb.pos === 'def' && lp(g, 1) === 7000, `Man-Eater face-up Defense, B took 1000 (${lp(g, 1)})`);
});
T('Cemetary Bomb: 100 per card in the opponent GY', () => {
  const g = duel({ board: [{ st: ['Cemetary Bomb'], turn: 2 }, { gy: Array(7).fill(FILL) }] });
  act(g, 0, 'Cemetary Bomb'); settle(g);
  ok(lp(g, 1) === 7300, `B took 700 (${lp(g, 1)})`);
});
T('Centrifugal Field: a Fusion destroyed by an effect brings back a listed material', () => {
  const g = duel({ board: [{ hand: ['Centrifugal Field', 'Dark Hole'], m: ['Bickuribox'], gy: ['Crass Clown'], turn: 2 }, {}] });
  act(g, 0, 'Centrifugal Field'); settle(g);
  act(g, 0, 'Dark Hole'); settle(g, 'Crass Clown', 'Attack');
  ok(inZ(g, 0, 'gy', 'Bickuribox') && on(g, 0, 'Crass Clown'), 'Crass Clown Special Summoned');
});
T('Ceremonial Bell: can be Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Ceremonial Bell'], turn: 2 }, {}] });
  ns(g, 0, 'Ceremonial Bell', 'Attack');
  ok(on(g, 0, 'Ceremonial Bell'), 'on the field');
});
T('Cestus of Dagla: Fairy only, +500, gain LP equal to battle damage', () => {
  const g = duel({ board: [{ hand: ['Cestus of Dagla'], m: ['Shining Angel', FILL], turn: 2 }, {}] });
  act(g, 0, 'Cestus of Dagla'); const offersFill = g.prompt && g.prompt.opts.some(x => x.label.includes(FILL)); settle(g, 'Shining Angel');
  ok(!offersFill, 'non-Fairy not offered');
  ok(A(g, on(g, 0, 'Shining Angel')) === 1900, 'Shining Angel 1900');
  bp(g); atkOn(g, 0, 'Shining Angel', null);
  ok(lp(g, 1) === 6100 && lp(g, 0) === 9900, `1900 damage, 1900 gained (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});

console.log(fails ? `\n${fails} failed` : '\nAll full-19 review checks passed.');
process.exit(fails ? 1 : 0);
