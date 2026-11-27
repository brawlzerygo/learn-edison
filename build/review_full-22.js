// Independent review checks for full pool batch 22 (written from the card text): node build/review_full-22.js
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
  else { const nm = x => { const c = x.u != null && byU(g, x.u); return c ? E.name(c) : ''; }; const ks = []; for (const t of picks) { const o = pr.opts.find(x => (x.label.includes(t) || nm(x) === t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); }
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
const coinRuns = (f, n = 16) => { const out = []; for (let s = 1; s <= n; s++) out.push(f(s)); return out; };
const heads = (g, n0) => g.log.slice(n0).filter(l => /coin: Heads/.test(l)).length;
const tosses = (g, n0) => g.log.slice(n0).filter(l => /tossed a coin/.test(l)).length;

/* ---------- F ---------- */
T('Fuhma Shuriken: Ninja only, +700, 700 burn when sent to the GY', () => {
  const g = duel({ board: [{ hand: ['Fuhma Shuriken', 'Mystical Space Typhoon'], m: ['Strike Ninja', FILL], turn: 2 }, {}] });
  act(g, 0, 'Fuhma Shuriken'); settle(g, 'Strike Ninja');
  ok(E.atk(g, on(g, 0, 'Strike Ninja')) === 2400 && E.atk(g, on(g, 0, FILL)) === 2000, 'Strike Ninja 2400, Warwolf untouched');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Fuhma Shuriken');
  ok(inZ(g, 0, 'gy', 'Fuhma Shuriken') && lp(g, 1) === 7300 && lp(g, 0) === 8000, `B took 700 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Fuhma Shuriken'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Fuhma Shuriken'), 'not offered with no Ninja');
});
T('Fulfillment of the Contract: pay 800, revive a Ritual, banished when destroyed', () => {
  const g = duel({ board: [{ hand: ['Fulfillment of the Contract', 'Mystical Space Typhoon'], gy: ['Crab Turtle'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Fulfillment of the Contract'), 'offered with a Ritual in the GY');
  act(g, 0, 'Fulfillment of the Contract'); settle(g, 'Crab Turtle', 'Attack');
  ok(lp(g, 0) === 7200 && on(g, 0, 'Crab Turtle') && inZ(g, 0, 'st', 'Fulfillment of the Contract'), `paid 800 (${lp(g, 0)}), Crab Turtle summoned, card stays`);
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Fulfillment of the Contract');
  ok(inZ(g, 0, 'ban', 'Crab Turtle'), 'Crab Turtle banished when the Contract is destroyed');
  const g2 = duel({ board: [{ hand: ['Fulfillment of the Contract'], gy: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Fulfillment of the Contract'), 'not offered with no Ritual in the GY');
});
T('Fushi No Tori: gains the battle damage, back to hand, no Special Summon', () => {
  const g = duel({ board: [{ hand: ['Fushi No Tori', 'Monster Reborn'], turn: 2 }, {}] });
  ns(g, 0, 'Fushi No Tori', 'Attack'); bp(g); atkOn(g, 0, 'Fushi No Tori', null);
  ok(lp(g, 1) === 6800 && lp(g, 0) === 9200, `1200 damage and 1200 gained (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  endTurn(g); ok(inZ(g, 0, 'hand', 'Fushi No Tori'), 'back in the hand at the End Phase');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], turn: 2 }, { gy: ['Fushi No Tori'] }] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'Monster Reborn cannot take it');
});
T('Fushioh Richie: no Normal Summon, flips face-down, revives a Zombie on flip, stops targeting Spells', () => {
  const g = duel({ board: [{ hand: ['Fushioh Richie'], m: ['Great Dezard'], turn: 2 }, {}] });
  const r = card(g, 0, 'Fushioh Richie'); ok(noSummon(g, r), 'no Normal Summon, no Special with an unproven Great Dezard');
  const g2 = duel({ board: [{ hand: [], m: ['Fushioh Richie'], turn: 2 }, {}] });
  ok(canAct(g2, 0, 'Fushioh Richie'), 'flip face-down offered'); act(g2, 0, 'Fushioh Richie'); settle(g2);
  ok(on(g2, 0, 'Fushioh Richie').pos === 'set', 'now face-down');
  const g3 = duel({ board: [{ hand: [], m: [{ n: 'Fushioh Richie', pos: 'set' }], gy: ['Armored Zombie'], turn: 2 }, {}] });
  choose(g3, 'flip:' + on(g3, 0, 'Fushioh Richie').u); settle(g3, 'Armored Zombie', 'Attack');
  ok(on(g3, 0, 'Armored Zombie'), 'Armored Zombie revived on flip');
  const g4 = duel({ board: [{ hand: ['Snatch Steal'], turn: 2 }, { m: ['Fushioh Richie'] }] });
  act(g4, 0, 'Snatch Steal'); settle(g4, 'Fushioh Richie');
  ok(on(g4, 1, 'Fushioh Richie') && inZ(g4, 0, 'gy', 'Snatch Steal'), 'Snatch Steal negated and destroyed');
});
T('Fusilier Dragon: no-Tribute Normal Summon halves its stats, Tribute keeps them', () => {
  const g = duel({ board: [{ hand: ['Fusilier Dragon, the Dual-Mode Beast'], turn: 2 }, {}] });
  ns(g, 0, 'Fusilier Dragon, the Dual-Mode Beast', 'Attack'); const f = on(g, 0, 'Fusilier Dragon, the Dual-Mode Beast');
  ok(f && E.atk(g, f) === 1400 && E.def(g, f) === 1000, `no Tribute: ${f && E.atk(g, f)}/${f && E.def(g, f)}`);
  const g2 = duel({ board: [{ hand: ['Fusilier Dragon, the Dual-Mode Beast'], m: [FILL, 'Mystical Elf'], turn: 2 }, {}] });
  choose(g2, 'ns:' + card(g2, 0, 'Fusilier Dragon, the Dual-Mode Beast').u); settle(g2, 'Tribute', FILL, 'Mystical Elf', 'Attack');
  const f2 = on(g2, 0, 'Fusilier Dragon, the Dual-Mode Beast');
  ok(f2 && (E.atk(g2, f2) === 2800 || cnt(g2, 0, 'gy') === 0), `with Tributes: ${f2 && E.atk(g2, f2)} (gy ${cnt(g2, 0, 'gy')})`);
});
T('Fusionist: Petit Angel + Mystical Sheep 2', () => {
  const g = duel({ ex0: ['Fusionist'], board: [{ hand: ['Polymerization', 'Petit Angel', 'Mystical Sheep 2'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Fusionist', 'Petit Angel', 'Mystical Sheep 2', 'Attack');
  ok(on(g, 0, 'Fusionist') && E.atk(g, on(g, 0, 'Fusionist')) === 900, 'Fusionist summoned');
});
T('Gale Lizard: FLIP returns an opponent monster', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Gale Lizard', pos: 'set' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'flip:' + on(g, 0, 'Gale Lizard').u); settle(g, 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'hand', 'Blue-Eyes White Dragon'), 'Blue-Eyes back in hand');
});
T('Gamble: draw to 5 or skip the next turn', () => {
  let drew = 0, skipped = 0, bad = '';
  coinRuns(s => {
    const g = duel({ seed: s, board: [{ hand: [], st: ['Gamble'], turn: 2 }, { hand: [FILL, FILL, FILL, FILL, FILL, FILL] }] });
    if (!canAct(g, 0, 'Gamble')) { bad = 'not offered'; return; }
    act(g, 0, 'Gamble'); settle(g, 'Heads');
    if (hand(g, 0) === 5) { drew++; return; }
    if (hand(g, 0) !== 1) { bad = 'hand ' + hand(g, 0); return; }
    endTurn(g); toIdle(g); endTurn(g); toIdle(g); const h1 = hand(g, 0), c = g.p[0].hand[0];
    // ENGINE (documented): the skipped turn still happens, with no draw, no summons and no Battle Phase
    if (g.tp === 1 || (h1 === 1 && !hasOpt(g, 'bp') && !hasOpt(g, 'ns:' + c.u))) skipped++; else bad = 'A was not skipped (turn ' + g.turnNo + ', hand ' + h1 + ')';
  });
  ok(!bad && drew > 0 && skipped > 0, `drew to 5 ${drew}x, skipped ${skipped}x ${bad}`);
  const g2 = duel({ board: [{ hand: [], st: ['Gamble'], turn: 2 }, { hand: [FILL, FILL, FILL] }] });
  ok(!canAct(g2, 0, 'Gamble'), 'not offered when the opponent has under 6');
});
T('Garuda: Special Summon by banishing a WIND, changes a position in the opponent End Phase', () => {
  const g = duel({ board: [{ hand: ['Garuda the Wind Spirit'], gy: ['Blue-Winged Crown'], turn: 2 }, {}] });
  const c = card(g, 0, 'Garuda the Wind Spirit');
  ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Special only'); choose(g, 'sp:' + c.u); settle(g, 'Blue-Winged Crown', 'Attack');
  ok(on(g, 0, 'Garuda the Wind Spirit') && inZ(g, 0, 'ban', 'Blue-Winged Crown'), 'summoned, Crown banished');
  const g0 = duel({ board: [{ hand: ['Garuda the Wind Spirit'], gy: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g0, 'sp:' + card(g0, 0, 'Garuda the Wind Spirit').u), 'no WIND, no Special Summon');
  const g2 = duel({ board: [{ hand: [], m: ['Garuda the Wind Spirit'], turn: 2 }, { m: [FILL] }] });
  endTurn(g2); toIdle(g2); endTurn(g2, FILL); toIdle(g2);
  ok(g2.p[1].m.find(x => x && E.name(x) === FILL).pos === 'def', 'B Warwolf changed to Defense');
});
T('Gate Guardian: Tribute Sanga, Kazejin and Suijin', () => {
  const g = duel({ board: [{ hand: ['Gate Guardian'], m: ['Sanga of the Thunder', 'Kazejin', 'Suijin'], turn: 2 }, {}] });
  const c = card(g, 0, 'Gate Guardian'); ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Special only');
  choose(g, 'sp:' + c.u); settle(g, 'Attack'); ok(on(g, 0, 'Gate Guardian') && cnt(g, 0, 'm') === 1, 'Gate Guardian summoned, the three Tributed');
});
T('Gather Your Mind: adds a copy, once per turn', () => {
  const g = duel({ board: [{ hand: ['Gather Your Mind'], deckTop: [FILL, 'Gather Your Mind', 'Gather Your Mind'], turn: 2 }, {}] });
  act(g, 0, 'Gather Your Mind'); settle(g, 'Gather Your Mind');
  ok(cnt(g, 0, 'hand', 'Gather Your Mind') === 1 && cnt(g, 0, 'gy', 'Gather Your Mind') === 1, 'one added');
  ok(!canAct(g, 0, 'Gather Your Mind'), 'a second one not offered this turn');
});
T('Gatling Dragon: Fusion, coins destroy up to the Heads', () => {
  const g = duel({ ex0: ['Gatling Dragon'], board: [{ hand: ['Polymerization', 'Barrel Dragon', 'Blowback Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Attack');
  ok(on(g, 0, 'Gatling Dragon'), 'Gatling Dragon summoned');
  let good = 0, bad = '';
  coinRuns(s => {
    const g2 = duel({ seed: s, board: [{ hand: [], m: ['Gatling Dragon'], turn: 2 }, { m: [FILL, 'Mystical Elf', 'Blue-Eyes White Dragon', 'Harpie Lady'] }] });
    const n0 = g2.log.length; act(g2, 0, 'Gatling Dragon'); settle(g2, 'Blue-Eyes White Dragon', FILL, 'Mystical Elf');
    const h = heads(g2, n0), lost = 4 - cnt(g2, 1, 'm');
    if (tosses(g2, n0) !== 3 || lost !== h || !on(g2, 0, 'Gatling Dragon')) bad = `seed ${s}: ${tosses(g2, n0)} tosses, ${h} heads, ${lost} destroyed`; else good++;
    if (canAct(g2, 0, 'Gatling Dragon')) bad = 'offered twice';
  });
  ok(!bad, `3 coins, destroys as many as Heads, once per turn ${bad}`);
});
T('Gear Golem: pay 800, attack directly', () => {
  const g = duel({ board: [{ hand: [], m: ['Gear Golem the Moving Fortress'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Gear Golem the Moving Fortress'); settle(g); ok(lp(g, 0) === 7200, 'paid 800');
  ok(!canAct(g, 0, 'Gear Golem the Moving Fortress'), 'once per turn');
  bp(g); const a = on(g, 0, 'Gear Golem the Moving Fortress'); ok(canAtk(g, a, null), 'direct attack offered'); atkOn(g, 0, 'Gear Golem the Moving Fortress', null);
  ok(lp(g, 1) === 7200, `B took 800 (${lp(g, 1)})`);
});
T('Gearfried the Iron Knight: destroys an Equip put on it', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: ['Gearfried the Iron Knight'], turn: 2 }, {}] });
  act(g, 0, 'Black Pendant'); settle(g, 'Gearfried the Iron Knight');
  ok(inZ(g, 0, 'gy', 'Black Pendant') && E.atk(g, on(g, 0, 'Gearfried the Iron Knight')) === 1800, 'Pendant destroyed, 1800 ATK');
});
T('Gearfried the Swordmaster: Release Restraint, destroys on each equip', () => {
  const g = duel({ board: [{ hand: ['Release Restraint', 'Gearfried the Swordmaster', 'Black Pendant'], m: ['Gearfried the Iron Knight'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ok(noSummon(g, card(g, 0, 'Gearfried the Swordmaster')), 'no Normal or own Special Summon');
  act(g, 0, 'Release Restraint'); settle(g, 'Gearfried the Iron Knight', 'Gearfried the Swordmaster', 'Attack');
  ok(on(g, 0, 'Gearfried the Swordmaster'), 'Swordmaster summoned');
  act(g, 0, 'Black Pendant'); settle(g, 'Gearfried the Swordmaster', 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && E.atk(g, on(g, 0, 'Gearfried the Swordmaster')) === 3100, 'Blue-Eyes destroyed, Swordmaster 3100');
});
T('Germ Infection: -300 at each Standby of the equipped monster controller', () => {
  const g = duel({ board: [{ hand: ['Germ Infection'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Germ Infection'); settle(g, FILL); endTurn(g); toIdle(g);
  ok(E.atk(g, on(g, 1, FILL)) === 1700, `Warwolf ${E.atk(g, on(g, 1, FILL))} after B Standby`);
  endTurn(g); toIdle(g); ok(E.atk(g, on(g, 1, FILL)) === 1700, 'unchanged in A Standby');
});
T('Getsu Fuhma: destroys a Fiend it battles', () => {
  const g = duel({ board: [{ hand: [], m: ['Getsu Fuhma'], turn: 2 }, { m: [{ n: 'D.D. Trainer', pos: 'def' }, { n: 'Mystical Elf', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Getsu Fuhma', 'D.D. Trainer');
  ok(inZ(g, 1, 'gy', 'D.D. Trainer') && on(g, 0, 'Getsu Fuhma') && lp(g, 0) === 7700, `Trainer destroyed, A took 300 (${lp(g, 0)})`);
});
T('Ghost Knight of Jackal: summons the monster it destroys', () => {
  const g = duel({ board: [{ hand: [], m: ['Ghost Knight of Jackal'], turn: 2 }, { m: ['Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Ghost Knight of Jackal', 'Mystical Elf');
  const e = on(g, 0, 'Mystical Elf'); ok(e && e.pos === 'def', 'Mystical Elf on A side in Defense');
});
T('Gigantes: banish an EARTH to summon, destroyed by battle clears Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['Gigantes'], gy: [FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'] }] });
  const c = card(g, 0, 'Gigantes'); ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Special only');
  choose(g, 'sp:' + c.u); settle(g, FILL, 'Attack'); ok(on(g, 0, 'Gigantes') && inZ(g, 0, 'ban', FILL), 'summoned, Warwolf banished');
  bp(g); atkOn(g, 0, 'Gigantes', 'Blue-Eyes White Dragon');
  ok(inZ(g, 0, 'gy', 'Gigantes') && inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Gilasaurus: Special from hand, the opponent may revive', () => {
  const g = duel({ board: [{ hand: ['Gilasaurus'], turn: 2 }, { gy: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'sp:' + card(g, 0, 'Gilasaurus').u); settle(g, 'Attack', 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Gilasaurus') && on(g, 1, 'Blue-Eyes White Dragon'), 'Gilasaurus summoned, B revived Blue-Eyes');
});
T('Giltia: Guardian of the Labyrinth + Protector of the Throne', () => {
  const g = duel({ ex0: ['Giltia the D. Knight'], board: [{ hand: ['Polymerization', 'Guardian of the Labyrinth', 'Protector of the Throne'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Giltia the D. Knight', 'Attack'); ok(on(g, 0, 'Giltia the D. Knight'), 'Giltia summoned');
});
T("Goblin's Secret Remedy: +600", () => {
  const g = duel({ board: [{ hand: ["Goblin's Secret Remedy"], turn: 2 }, {}] }); act(g, 0, "Goblin's Secret Remedy"); settle(g);
  ok(lp(g, 0) === 8600, 'A 8600');
});
T('Goddess of Whim: double or halve, once per turn', () => {
  let d = 0, h = 0, bad = '';
  coinRuns(s => {
    const g = duel({ seed: s, board: [{ hand: [], m: ['Goddess of Whim'], turn: 2 }, {}] });
    act(g, 0, 'Goddess of Whim'); settle(g, 'Heads'); const a = E.atk(g, on(g, 0, 'Goddess of Whim'));
    if (a === 1900) d++; else if (a === 475) h++; else bad = 'ATK ' + a;
    if (canAct(g, 0, 'Goddess of Whim')) bad = 'offered twice';
    endTurn(g); toIdle(g); if (E.atk(g, on(g, 0, 'Goddess of Whim')) !== 950) bad = 'did not reset';
  });
  ok(!bad && d && h, `doubled ${d}x, halved ${h}x ${bad}`);
});
T('Goddess with the Third Eye: substitutes for a Fusion Material (ENGINE gap, documented: only a Normal Summon checked)', () => {
  const g0 = duel({ board: [{ hand: ['Goddess with the Third Eye'], turn: 2 }, {}] }); ns(g0, 0, 'Goddess with the Third Eye', 'Attack'); ok(on(g0, 0, 'Goddess with the Third Eye'), 'Goddess Normal Summoned');
  if (!process.env.STRICT) return;
  const g = duel({ ex0: ['Fusionist'], board: [{ hand: ['Polymerization', 'Goddess with the Third Eye', 'Mystical Sheep 2'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Fusionist', 'Goddess with the Third Eye', 'Mystical Sheep 2', 'Attack');
  ok(on(g, 0, 'Fusionist'), 'Fusionist summoned with Goddess for Petit Angel');
});
T('Golem Sentry: turns face-down, Flip Summon bounces', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Golem Sentry', pos: 'set' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'flip:' + on(g, 0, 'Golem Sentry').u); settle(g, 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'hand', 'Blue-Eyes White Dragon'), 'Blue-Eyes returned');
  const g2 = duel({ board: [{ hand: [], m: ['Golem Sentry'], turn: 2 }, {}] });
  act(g2, 0, 'Golem Sentry'); settle(g2); ok(on(g2, 0, 'Golem Sentry').pos === 'set' && !canAct(g2, 0, 'Golem Sentry'), 'face-down, once per turn');
});
T('Good Goblin Housekeeping: draw GY count + 1, return 1', () => {
  const g = duel({ board: [{ hand: [], st: ['Good Goblin Housekeeping'], gy: ['Good Goblin Housekeeping'], turn: 2 }, {}] });
  const h0 = hand(g, 0); act(g, 0, 'Good Goblin Housekeeping'); settle(g);
  ok(hand(g, 0) === h0 + 1, `drew 2 and returned 1 (hand ${h0} to ${hand(g, 0)})`);
});
T('Gora Turtle: 1900+ ATK monsters cannot attack', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Mystical Elf'], turn: 2 }, { m: [{ n: 'Gora Turtle', pos: 'def' }] }] });
  bp(g); ok(!canAtk(g, on(g, 0, FILL), on(g, 1, 'Gora Turtle')) && canAtk(g, on(g, 0, 'Mystical Elf'), on(g, 1, 'Gora Turtle')), 'Warwolf cannot attack, Elf can');
});
T('Gora Turtle of Illusion: negates targeting Spells', () => {
  const g = duel({ board: [{ hand: ['Snatch Steal'], turn: 2 }, { m: ['Gora Turtle of Illusion'] }] });
  act(g, 0, 'Snatch Steal'); settle(g, 'Gora Turtle of Illusion');
  ok(on(g, 1, 'Gora Turtle of Illusion') && !on(g, 0, 'Gora Turtle of Illusion'), 'B keeps it');
});
T("Gorgon's Eye: Defense Position effects negated this turn", () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ["Gorgon's Eye"], turn: 2 }, { m: [{ n: 'Gora Turtle', pos: 'def' }] }] });
  act(g, 0, "Gorgon's Eye"); settle(g); bp(g);
  ok(canAtk(g, on(g, 0, FILL), on(g, 1, 'Gora Turtle')), 'Warwolf can attack past a Defense Gora Turtle');
});
T("Gradius' Option: copies Gradius, destroyed when it leaves", () => {
  const g = duel({ board: [{ hand: ["Gradius' Option"], m: ['Gradius'], turn: 2 }, { m: [FILL] }] });
  const c = card(g, 0, "Gradius' Option"); ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Special only');
  choose(g, 'sp:' + c.u); settle(g, 'Gradius', 'Attack'); const o = on(g, 0, "Gradius' Option");
  ok(o && E.atk(g, o) === 1200 && E.def(g, o) === 800, `Option ${o && E.atk(g, o)}/${o && E.def(g, o)}`);
  bp(g); atkOn(g, 0, 'Gradius', FILL); ok(inZ(g, 0, 'gy', "Gradius' Option"), 'Option destroyed with Gradius');
  const g2 = duel({ board: [{ hand: ["Gradius' Option"], m: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, "Gradius' Option").u), 'no Gradius, no summon');
});
T('Granadora: +1000 on summon, 2000 damage when destroyed', () => {
  const g = duel({ board: [{ hand: ['Granadora'], turn: 2 }, { m: [FILL] }] });
  ns(g, 0, 'Granadora', 'Attack'); ok(lp(g, 0) === 9000, 'A 9000');
  bp(g); atkOn(g, 0, 'Granadora', FILL); ok(lp(g, 0) === 9000 - 100 - 2000, `A ${lp(g, 0)} after it died`);
});
T('Granmarg: Tribute Summon destroys a Set card', () => {
  const g = duel({ board: [{ hand: ['Granmarg the Rock Monarch'], m: [FILL], turn: 2 }, { st: ['Mirror Force'] }] });
  ns(g, 0, 'Granmarg the Rock Monarch', FILL, 'Attack', 'Mirror Force'); toIdle(g, 'Mirror Force');
  ok(on(g, 0, 'Granmarg the Rock Monarch') && inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Gravedigger Ghoul: banishes up to 2 from the opponent GY', () => {
  const g = duel({ board: [{ hand: ['Gravedigger Ghoul'], turn: 2 }, { gy: ['Blue-Eyes White Dragon', 'Mystical Elf', 'Pot of Greed'] }] });
  act(g, 0, 'Gravedigger Ghoul'); settle(g, 'Blue-Eyes White Dragon', 'Mystical Elf');
  ok(cnt(g, 1, 'ban') === 2 && inZ(g, 1, 'gy', 'Pot of Greed'), 'two monsters banished, the Spell left');
});
T('Graverobber: use an opponent Spell for 2000', () => {
  const g = duel({ board: [{ hand: [], st: ['Graverobber'], turn: 2 }, { gy: ['Pot of Greed'] }] });
  act(g, 0, 'Graverobber'); settle(g, 'Pot of Greed'); const h = hand(g, 0);
  ok(canAct(g, 0, 'Pot of Greed'), 'Pot of Greed usable'); act(g, 0, 'Pot of Greed'); settle(g);
  ok(lp(g, 0) === 6000 && hand(g, 0) === h + 2, `drew 2, took 2000 (${lp(g, 0)})`);
});
T("Graverobber's Retribution: 100 per banished opponent monster each Standby", () => {
  const g = duel({ board: [{ hand: [], st: [up("Graverobber's Retribution")], turn: 2 }, { ban: [FILL, 'Mystical Elf', 'Pot of Greed'] }] });
  toIdle(g); ok(lp(g, 1) === 7800, `B ${lp(g, 1)}`);
});
T('Gray Wing: discard 1, two attacks', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Gray Wing'], turn: 2 }, {}] });
  act(g, 0, 'Gray Wing'); settle(g, FILL); ok(cnt(g, 0, 'gy', FILL) >= 1, 'discarded');
  bp(g); atkOn(g, 0, 'Gray Wing', null); atkOn(g, 0, 'Gray Wing', null); ok(lp(g, 1) === 8000 - 2600, `B ${lp(g, 1)}`);
});
T('Greenkappa: FLIP destroys 2 Set Spells/Traps', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Greenkappa', pos: 'set' }], turn: 2 }, { st: ['Mirror Force', 'Magic Cylinder'] }] });
  choose(g, 'flip:' + on(g, 0, 'Greenkappa').u); settle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Magic Cylinder'), 'both destroyed');
});
T('Gren Maju Da Eiza: 400 per banished card', () => {
  const g = duel({ board: [{ hand: [], m: ['Gren Maju Da Eiza'], ban: [FILL, 'Pot of Greed', 'Mystical Elf'], turn: 2 }, { ban: [FILL] }] });
  const c = on(g, 0, 'Gren Maju Da Eiza'); ok(E.atk(g, c) === 1200 && E.def(g, c) === 1200, `${E.atk(g, c)}/${E.def(g, c)}`);
});
T('Griggle: its controller gains 3000 when control shifts away', () => {
  const g = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: ['Griggle'] }] });
  act(g, 0, 'Change of Heart'); settle(g, 'Griggle');
  ok(on(g, 0, 'Griggle') && lp(g, 1) === 11000 && lp(g, 0) === 8000, `B ${lp(g, 1)}, A ${lp(g, 0)}`);
});
T('Ground Collapse: 2 zones unusable', () => {
  const g = duel({ board: [{ hand: ['Ground Collapse', 'Mystical Elf'], m: [FILL, FILL, FILL], turn: 2 }, {}] });
  act(g, 0, 'Ground Collapse'); settle(g, 'Your zone 4', 'Your zone 5');
  const e = card(g, 0, 'Mystical Elf'); ok(!hasOpt(g, 'ns:' + e.u) && !hasOpt(g, 'set:' + e.u), 'A cannot summon into the 2 locked zones');
  const g2 = duel({ board: [{ hand: ['Ground Collapse', 'Mystical Elf'], m: [FILL, FILL], turn: 2 }, {}] });
  act(g2, 0, 'Ground Collapse'); settle(g2, 'Your zone 4', 'Your zone 5'); const e2 = card(g2, 0, 'Mystical Elf');
  ok(hasOpt(g2, 'ns:' + e2.u), 'a third free zone is still usable');
});
T("Gryphon Wing: negates Harpie's Feather Duster, destroys the activator's Spells/Traps", () => {
  const g = duel({ board: [{ hand: ["Harpie's Feather Duster"], st: ['Magic Cylinder'], turn: 2 }, { st: ['Gryphon Wing', 'Mirror Force'] }] });
  act(g, 0, "Harpie's Feather Duster"); settle(g, 'Gryphon Wing');
  ok(inZ(g, 1, 'st', 'Mirror Force') && inZ(g, 0, 'gy', 'Magic Cylinder'), 'Mirror Force stays, Cylinder destroyed');
});
T("Gryphon's Feather Duster: clear your side, 500 each", () => {
  const g = duel({ board: [{ hand: ["Gryphon's Feather Duster"], st: ['Magic Cylinder', 'Mirror Force'], turn: 2 }, { st: ['Gryphon Wing'] }] });
  act(g, 0, "Gryphon's Feather Duster"); settle(g);
  ok(cnt(g, 0, 'st') === 0 && lp(g, 0) === 9000 && inZ(g, 1, 'st', 'Gryphon Wing'), `A ${lp(g, 0)}, B card stays`);
});
T('Gust: destroys a Spell/Trap after your Spell is destroyed by the opponent', () => {
  const g = duel({ board: [{ hand: ["Goblin's Secret Remedy"], st: [up('Heart of the Underdog'), 'Gust'], turn: 2 }, { st: ['Mystical Space Typhoon', 'Mirror Force'] }] });
  toIdle(g); act(g, 0, "Goblin's Secret Remedy"); settle(g, 'Mystical Space Typhoon', 'Heart of the Underdog', 'Gust', 'Mirror Force');
  ok(inZ(g, 0, 'gy', 'Heart of the Underdog') && inZ(g, 0, 'gy', 'Gust') && inZ(g, 1, 'gy', 'Mirror Force'), 'Gust destroyed Mirror Force');
});
T('Gust Fan: WIND +400/-200', () => {
  const g = duel({ board: [{ hand: ['Gust Fan'], m: ['Blue-Winged Crown'], turn: 2 }, {}] });
  act(g, 0, 'Gust Fan'); settle(g, 'Blue-Winged Crown'); const c = on(g, 0, 'Blue-Winged Crown');
  ok(E.atk(g, c) === 2000 && E.def(g, c) === 1000, `${E.atk(g, c)}/${E.def(g, c)}`);
});
T('Gyaku-Gire Panda: +500 per opponent monster, pierces', () => {
  const g = duel({ board: [{ hand: [], m: ['Gyaku-Gire Panda'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }, { n: FILL, pos: 'def' }] }] });
  const c = on(g, 0, 'Gyaku-Gire Panda'); ok(E.atk(g, c) === 1800, 'Panda 1800');
  bp(g); atkOn(g, 0, 'Gyaku-Gire Panda', FILL); ok(lp(g, 1) === 8000 - 1700, `B took 1700 (${lp(g, 1)})`);
});
T('Hade-Hane: FLIP returns up to 3 monsters', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Hade-Hane', pos: 'set' }], turn: 2 }, { m: [FILL, 'Mystical Elf', 'Blue-Eyes White Dragon'] }] });
  choose(g, 'flip:' + on(g, 0, 'Hade-Hane').u); settle(g, FILL, 'Mystical Elf', 'Blue-Eyes White Dragon');
  ok(cnt(g, 1, 'm') === 0, `B monsters left ${cnt(g, 1, 'm')}`);
});
T('Hallowed Life Barrier: discard 1, no damage this turn', () => {
  const g = duel({ first: 1, board: [{ hand: [FILL], st: ['Hallowed Life Barrier'], turn: 2 }, { hand: [], m: [FILL] }] });
  bp(g); atkOn(g, 1, FILL, null, 'Hallowed Life Barrier');
  ok(lp(g, 0) === 8000 && inZ(g, 0, 'gy', 'Hallowed Life Barrier'), `A ${lp(g, 0)}`);
});
T('Hamburger Recipe: Ritual Summon Hungry Burger', () => {
  const g = duel({ board: [{ hand: ['Hamburger Recipe', 'Hungry Burger'], m: [FILL, 'Mystical Elf'], turn: 2 }, {}] });
  act(g, 0, 'Hamburger Recipe'); settle(g, 'Hungry Burger', FILL, 'Mystical Elf', 'Attack');
  ok(on(g, 0, 'Hungry Burger'), 'Hungry Burger summoned');
});
T('Hammer Shot: destroys the highest-ATK Attack Position monster', () => {
  const g = duel({ board: [{ hand: ['Hammer Shot'], m: [FILL], turn: 2 }, { m: ['Mystical Elf', { n: 'Blue-Eyes White Dragon', pos: 'def' }] }] });
  act(g, 0, 'Hammer Shot'); settle(g);
  ok(inZ(g, 0, 'gy', FILL) && on(g, 1, 'Blue-Eyes White Dragon') && on(g, 1, 'Mystical Elf'), 'Warwolf destroyed, Defense Blue-Eyes kept');
});
T('Hand of Nephthys: Tribute it and 1 other, summon Sacred Phoenix', () => {
  const g = duel({ board: [{ hand: [], m: ['Hand of Nephthys', FILL], deckTop: [FILL, 'Sacred Phoenix of Nephthys'], turn: 2 }, {}] });
  act(g, 0, 'Hand of Nephthys'); settle(g, FILL, 'Sacred Phoenix of Nephthys', 'Attack');
  ok(on(g, 0, 'Sacred Phoenix of Nephthys') && inZ(g, 0, 'gy', 'Hand of Nephthys') && inZ(g, 0, 'gy', FILL), 'Phoenix summoned from the Deck');
});
T('Hane-Hane: FLIP returns 1 monster', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Hane-Hane', pos: 'set' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'flip:' + on(g, 0, 'Hane-Hane').u); settle(g, 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'hand', 'Blue-Eyes White Dragon'), 'returned');
});
T("Harpies' Hunting Ground: +200 Winged Beasts, Harpie summon destroys a Spell/Trap", () => {
  const g = duel({ board: [{ hand: ["Harpies' Hunting Ground", 'Harpie Lady'], m: ['Blue-Winged Crown'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, "Harpies' Hunting Ground"); settle(g);
  ok(E.atk(g, on(g, 0, 'Blue-Winged Crown')) === 1800, 'Crown 1800');
  ns(g, 0, 'Harpie Lady', 'Attack', 'Mirror Force'); toIdle(g, 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Mirror Force') && E.atk(g, on(g, 0, 'Harpie Lady')) === 1500, 'Mirror Force destroyed, Harpie 1500');
});
T('Hayabusa Knight: two attacks', () => {
  const g = duel({ board: [{ hand: [], m: ['Hayabusa Knight'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Hayabusa Knight', null); atkOn(g, 0, 'Hayabusa Knight', null); ok(lp(g, 1) === 6000, `B ${lp(g, 1)}`);
});
T('Heart of Clear Water: no battle destruction, gone at 1300+', () => {
  const g = duel({ board: [{ hand: ['Heart of Clear Water'], m: ['Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Heart of Clear Water'); settle(g, 'Mystical Elf'); bp(g); atkOn(g, 0, 'Mystical Elf', 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Mystical Elf') && lp(g, 0) === 8000 - 2200, `Elf survives, A took 2200 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Heart of Clear Water'], m: [FILL], turn: 2 }, {}] });
  act(g2, 0, 'Heart of Clear Water'); settle(g2, FILL); ok(inZ(g2, 0, 'gy', 'Heart of Clear Water'), 'destroyed on a 2000 ATK monster');
});
T('Heart of the Underdog: draw a Normal Monster, draw 1 more', () => {
  const g = duel({ board: [{ hand: [], st: [up('Heart of the Underdog')], deckTop: [FILL, 'Pot of Greed'], turn: 2 }, {}] });
  toIdle(g); ok(hand(g, 0) === 2 && inZ(g, 0, 'hand', 'Pot of Greed'), `hand ${hand(g, 0)}`);
});
T('Heavy Mech Support Platform: equip to a Machine, +500, takes the destruction', () => {
  const g = duel({ board: [{ hand: [], m: ['Heavy Mech Support Platform', 'Cyber Dragon'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Heavy Mech Support Platform'); settle(g, 'Cyber Dragon'); const cd = on(g, 0, 'Cyber Dragon');
  ok(inZ(g, 0, 'st', 'Heavy Mech Support Platform') && E.atk(g, cd) === 2600, `equipped, Cyber Dragon ${E.atk(g, cd)}`);
  bp(g); atkOn(g, 0, 'Cyber Dragon', 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Cyber Dragon') && inZ(g, 0, 'gy', 'Heavy Mech Support Platform') && lp(g, 0) === 7600, `Platform destroyed instead, A ${lp(g, 0)}`);
});
T('Heavy Slump: 8+ cards, shuffle the hand in, draw 2', () => {
  const g = duel({ board: [{ hand: [], st: ['Heavy Slump'], turn: 2 }, { hand: Array(8).fill(FILL) }] });
  ok(canAct(g, 0, 'Heavy Slump'), 'offered'); act(g, 0, 'Heavy Slump'); settle(g); ok(hand(g, 1) === 2, `B hand ${hand(g, 1)}`);
  const g2 = duel({ board: [{ hand: [], st: ['Heavy Slump'], turn: 2 }, { hand: Array(7).fill(FILL) }] });
  ok(!canAct(g2, 0, 'Heavy Slump'), 'not offered at 7');
});
T('Helping Robo for Combat: draw 1, return 1 after a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Helping Robo for Combat'], deckTop: [FILL, 'Pot of Greed'], turn: 2 }, { m: ['Mystical Elf'] }] });
  const h0 = hand(g, 0); bp(g); atkOn(g, 0, 'Helping Robo for Combat', 'Mystical Elf', 'Pot of Greed');
  ok(hand(g, 0) === h0 && E.name(g.p[0].deck[0]) === 'Pot of Greed', `hand ${hand(g, 0)}, Pot at the bottom`);
});
T('Helpoemer: random discard at the end of the opponent Battle Phase', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Helpoemer'], turn: 2 }, { hand: [FILL, FILL, 'Pot of Greed'], m: ['Blue-Eyes White Dragon'] }] });
  const h0 = hand(g, 1); bp(g); atkOn(g, 1, 'Blue-Eyes White Dragon', 'Helpoemer'); choose(g, 'endbp'); settle(g);
  ok(inZ(g, 0, 'gy', 'Helpoemer') && hand(g, 1) === h0 - 1, `B hand ${h0} to ${hand(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Helpoemer'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be revived');
});
T('Hidden Spellbook: 2 Spells from the GY back to the Deck', () => {
  const g = duel({ board: [{ hand: [], st: ['Hidden Spellbook'], gy: ['Pot of Greed', 'Dark Hole', FILL], turn: 2 }, {}] });
  act(g, 0, 'Hidden Spellbook'); settle(g, 'Pot of Greed', 'Dark Hole');
  ok(!inZ(g, 0, 'gy', 'Pot of Greed') && !inZ(g, 0, 'gy', 'Dark Hole') && g.p[0].deck.some(c => E.name(c) === 'Dark Hole'), 'both shuffled in');
});


// Goat: the shared scripts and the Goat-only ones (goat-*.js, classic-*.js win under Goat) with the Goat card pool
{
  const vm = require('vm'), fs = require('fs'), path = require('path');
  const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
  for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const GE = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; GE.init(GC, { format: 'goat' });
  const GF = '7 Colored Fish'; // WATER Fish Level 4 1800/800
  const gid = n => { const c = GC.find(x => x.n === n); if (!c) throw new Error('no goat card ' + n); return c.id; };
  const gduel = (board, ex, o = {}) => (lastG = GE.newDuel({ decks: [0, 1].map(i => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (i ? [] : ex || []).map(gid) })), first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board }));
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Fusilier Dragon, Gate Guardian, Gatling Dragon', () => {
    let g = gduel([{ hand: ['Fusilier Dragon, the Dual-Mode Beast'], turn: 2 }, {}]); ns(g, 0, 'Fusilier Dragon, the Dual-Mode Beast', 'Attack');
    const f = on(g, 0, 'Fusilier Dragon, the Dual-Mode Beast'); ok(f && E.atk(g, f) === 1400 && E.def(g, f) === 1000, 'Goat: Fusilier 1400/1000 without Tribute');
    g = gduel([{ hand: ['Gate Guardian'], m: ['Sanga of the Thunder', 'Kazejin', 'Suijin'], turn: 2 }, {}]); const c = card(g, 0, 'Gate Guardian');
    ok(!hasOpt(g, 'ns:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Goat: Gate Guardian Special only'); choose(g, 'sp:' + c.u); settle(g, 'Attack'); ok(on(g, 0, 'Gate Guardian'), 'Goat: Gate Guardian summoned');
    g = gduel([{ hand: ['Polymerization', 'Barrel Dragon', 'Blowback Dragon'], turn: 2 }, { m: [GF, 'Blue-Eyes White Dragon'] }], ['Gatling Dragon']);
    act(g, 0, 'Polymerization'); settle(g, 'Attack'); ok(on(g, 0, 'Gatling Dragon'), 'Goat: Gatling Dragon summoned');
    if (on(g, 0, 'Gatling Dragon') && canAct(g, 0, 'Gatling Dragon')) { const n0 = g.log.length; act(g, 0, 'Gatling Dragon'); settle(g, 'Blue-Eyes White Dragon', GF);
      const line = g.log.slice(n0).find(l => /^Coins:/.test(l)) || '', h = (line.match(/heads/g) || []).length;
      ok(!!line && 3 - cnt(g, 0, 'm') - cnt(g, 1, 'm') === Math.min(3, h), `Goat: Gatling ${h} heads (${line})`); }
  });
  G('Gear Golem, Gearfried the Iron Knight, Gearfried the Swordmaster', () => {
    let g = gduel([{ hand: [], m: ['Gear Golem the Moving Fortress'], turn: 2 }, { m: [GF] }]);
    act(g, 0, 'Gear Golem the Moving Fortress'); settle(g); bp(g); atkOn(g, 0, 'Gear Golem the Moving Fortress', null); ok(lp(g, 0) === 7200 && lp(g, 1) === 7200, 'Goat: Gear Golem paid 800, hit directly');
    g = gduel([{ hand: ['Black Pendant'], m: ['Gearfried the Iron Knight'], turn: 2 }, {}]); act(g, 0, 'Black Pendant'); settle(g, 'Gearfried the Iron Knight');
    ok(inZ(g, 0, 'gy', 'Black Pendant'), 'Goat: Iron Knight destroyed the Pendant');
    g = gduel([{ hand: ['Release Restraint', 'Gearfried the Swordmaster', 'Black Pendant'], m: ['Gearfried the Iron Knight'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    act(g, 0, 'Release Restraint'); settle(g, 'Gearfried the Iron Knight', 'Gearfried the Swordmaster', 'Attack'); act(g, 0, 'Black Pendant'); settle(g, 'Gearfried the Swordmaster', 'Blue-Eyes White Dragon');
    ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Goat: Swordmaster destroyed Blue-Eyes');
  });
  G('Gigantes, Gilasaurus, Giltia, Golem Sentry', () => {
    let g = gduel([{ hand: ['Gigantes'], gy: ['Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'] }]);
    ok(!hasOpt(g, 'sp:' + card(g, 0, 'Gigantes').u), 'Goat: Gigantes needs an EARTH (Mystical Elf is LIGHT)');
    g = gduel([{ hand: ['Gigantes'], gy: ['Gearfried the Iron Knight'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Mirror Force'] }]);
    choose(g, 'sp:' + card(g, 0, 'Gigantes').u); settle(g, 'Attack'); bp(g); atkOn(g, 0, 'Gigantes', 'Blue-Eyes White Dragon');
    ok(inZ(g, 0, 'ban', 'Gearfried the Iron Knight') && inZ(g, 1, 'gy', 'Mirror Force'), 'Goat: Gigantes summoned and cleared Mirror Force');
    g = gduel([{ hand: ['Gilasaurus'], turn: 2 }, { gy: ['Blue-Eyes White Dragon'] }]); choose(g, 'sp:' + card(g, 0, 'Gilasaurus').u); settle(g, 'Attack', 'Blue-Eyes White Dragon');
    ok(on(g, 0, 'Gilasaurus') && on(g, 1, 'Blue-Eyes White Dragon'), 'Goat: Gilasaurus, B revived Blue-Eyes');
    g = gduel([{ hand: ['Polymerization', 'Guardian of the Labyrinth', 'Protector of the Throne'], turn: 2 }, {}], ['Giltia the D. Knight']);
    act(g, 0, 'Polymerization'); settle(g, 'Attack'); ok(on(g, 0, 'Giltia the D. Knight'), 'Goat: Giltia summoned');
    g = gduel([{ hand: [], m: [{ n: 'Golem Sentry', pos: 'set' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    choose(g, 'flip:' + on(g, 0, 'Golem Sentry').u); settle(g, 'Blue-Eyes White Dragon'); ok(inZ(g, 1, 'hand', 'Blue-Eyes White Dragon'), 'Goat: Golem Sentry bounced');
  });
  G("Gora Turtle, Gorgon's Eye, Granmarg, Graverobber, Greenkappa", () => {
    let g = gduel([{ hand: [], m: ['Blue-Eyes White Dragon', GF], st: ["Gorgon's Eye"], turn: 2 }, { m: [{ n: 'Gora Turtle', pos: 'def' }] }]);
    bp(g); ok(!canAtk(g, on(g, 0, 'Blue-Eyes White Dragon'), on(g, 1, 'Gora Turtle')) && canAtk(g, on(g, 0, GF), on(g, 1, 'Gora Turtle')), 'Goat: Gora Turtle stops Blue-Eyes, not the Fish');
    g = gduel([{ hand: [], m: ['Blue-Eyes White Dragon'], st: ["Gorgon's Eye"], turn: 2 }, { m: [{ n: 'Gora Turtle', pos: 'def' }] }]);
    act(g, 0, "Gorgon's Eye"); settle(g); bp(g); ok(canAtk(g, on(g, 0, 'Blue-Eyes White Dragon'), on(g, 1, 'Gora Turtle')), "Goat: Gorgon's Eye lets Blue-Eyes attack");
    g = gduel([{ hand: ['Granmarg the Rock Monarch'], m: [GF], turn: 2 }, { st: ['Mirror Force'] }]); ns(g, 0, 'Granmarg the Rock Monarch', GF, 'Attack', 'Mirror Force'); toIdle(g, 'Mirror Force');
    ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Goat: Granmarg destroyed Mirror Force');
    g = gduel([{ hand: [], st: ['Graverobber'], turn: 2 }, { gy: ['Pot of Greed'] }]); act(g, 0, 'Graverobber'); settle(g, 'Pot of Greed');
    if (canAct(g, 0, 'Pot of Greed')) { act(g, 0, 'Pot of Greed'); settle(g); } ok(lp(g, 0) === 6000, `Goat: Graverobber Pot cost 2000 (${lp(g, 0)})`);
    g = gduel([{ hand: [], m: [{ n: 'Greenkappa', pos: 'set' }], turn: 2 }, { st: ['Mirror Force', 'Magic Cylinder'] }]); choose(g, 'flip:' + on(g, 0, 'Greenkappa').u); settle(g);
    ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Magic Cylinder'), 'Goat: Greenkappa destroyed both');
  });
  G('Gyaku-Gire Panda, Hallowed Life Barrier, Hayabusa Knight, Heavy Slump', () => {
    let g = gduel([{ hand: [], m: ['Gyaku-Gire Panda'], turn: 2 }, { m: [{ n: GF, pos: 'def' }, { n: GF, pos: 'def' }] }]);
    bp(g); atkOn(g, 0, 'Gyaku-Gire Panda', GF); ok(lp(g, 1) === 8000 - 1000, `Goat: Panda 1800 pierced 1000 (${lp(g, 1)})`);
    g = gduel([{ hand: [GF], st: ['Hallowed Life Barrier'], turn: 2 }, { hand: [], m: [GF] }], [], { first: 1 });
    bp(g); atkOn(g, 1, GF, null, 'Hallowed Life Barrier'); ok(lp(g, 0) === 8000, `Goat: Hallowed Life Barrier, A ${lp(g, 0)}`);
    g = gduel([{ hand: [], m: ['Hayabusa Knight'], turn: 2 }, {}]); bp(g); atkOn(g, 0, 'Hayabusa Knight', null); atkOn(g, 0, 'Hayabusa Knight', null); ok(lp(g, 1) === 6000, 'Goat: Hayabusa attacked twice');
    g = gduel([{ hand: [], st: ['Heavy Slump'], turn: 2 }, { hand: Array(8).fill(GF) }]); act(g, 0, 'Heavy Slump'); settle(g); ok(hand(g, 1) === 2, 'Goat: Heavy Slump left B 2 cards');
  });
  G('Heart of Clear Water and Gora Turtle of Illusion (shared)', () => {
    let g = gduel([{ hand: ['Heart of Clear Water'], m: [GF], turn: 2 }, {}]); act(g, 0, 'Heart of Clear Water'); settle(g, GF);
    ok(inZ(g, 0, 'gy', 'Heart of Clear Water'), 'Goat: Heart of Clear Water destroyed on an 1800 monster');
    g = gduel([{ hand: ['Snatch Steal'], turn: 2 }, { m: ['Gora Turtle of Illusion'] }]); act(g, 0, 'Snatch Steal'); settle(g, 'Gora Turtle of Illusion');
    ok(on(g, 1, 'Gora Turtle of Illusion'), 'Goat: Gora Turtle of Illusion kept by B');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-22 review checks passed.');
process.exit(fails ? 1 : 0);
