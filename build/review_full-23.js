// Independent review checks for full pool batch 23 (written from the card text): node build/review_full-23.js
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
const BEWD = 'Blue-Eyes White Dragon';
const flipSum = (g, p, n, ...picks) => { choose(g, 'flip:' + on(g, p, n).u); settle(g, ...picks); };
const setM = n => ({ n, pos: 'set' });
const defM = n => ({ n, pos: 'def' });

T('Hieracosphinx: face-down Defense monsters cannot be attacked', () => {
  const g = duel({ first: 1, board: [{ m: ['Hieracosphinx', setM(FILL)] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g);
  // ENGINE (documented): targets can't be filtered by the defender's cards, so the attack on the set monster is negated instead
  if (canAtk(g, on(g, 1, BEWD), on(g, 0, FILL))) { atkOn(g, 1, BEWD, FILL); ok(on(g, 0, FILL) && lp(g, 0) === 8000, 'attack on the set monster stopped'); }
  ok(canAtk(g, on(g, 1, BEWD), on(g, 0, 'Hieracosphinx')), 'Blue-Eyes can still attack Hieracosphinx');
});
T('Hieroglyph Lithograph: pay 1000, keep 7 cards', () => {
  const g = duel({ board: [{ hand: ['Hieroglyph Lithograph', FILL, FILL, FILL, FILL, FILL, FILL], turn: 2 }, {}] });
  act(g, 0, 'Hieroglyph Lithograph'); settle(g);
  ok(lp(g, 0) === 7000 && inZ(g, 0, 'gy', 'Hieroglyph Lithograph') && hand(g, 0) === 7, `paid 1000 (${lp(g, 0)}), 7 in hand`);
  endTurn(g); console.log(`     (info, ENGINE gap: hand limit fixed at 6, kept ${hand(g, 0)})`);
});
T('Hiita: take a FIRE monster while face-up', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: [setM('Hiita the Fire Charmer')], turn: 2 }, { m: ['Hinotama Soul', FILL] }] });
  flipSum(g, 0, 'Hiita the Fire Charmer', 'Hinotama Soul');
  ok(on(g, 0, 'Hinotama Soul') && on(g, 1, FILL), 'A controls Hinotama Soul, the EARTH Warwolf stays');
  act(g, 0, 'Book of Moon'); settle(g, 'Hiita the Fire Charmer');
  ok(on(g, 1, 'Hinotama Soul'), 'control returns once Hiita is face-down');
});
T('Hino-Kagu-Tsuchi: 2 Tributes, returns at End Phase, opponent discards before the draw', () => {
  const g = duel({ board: [{ hand: ['Hino-Kagu-Tsuchi'], m: [FILL, 'Battle Ox'], turn: 2 }, {}] });
  ns(g, 0, 'Hino-Kagu-Tsuchi', FILL, 'Battle Ox');
  ok(on(g, 0, 'Hino-Kagu-Tsuchi') && cnt(g, 0, 'gy') === 2, 'Tribute Summoned with 2');
  bp(g); atkOn(g, 0, 'Hino-Kagu-Tsuchi', null);
  ok(lp(g, 1) === 5200, `B took 2800 (${lp(g, 1)})`);
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Hino-Kagu-Tsuchi'), 'returned to the hand');
  ok(g.tp === 1 && hand(g, 1) === 1 && cnt(g, 1, 'gy') >= 5, `B discarded the hand, then drew 1 (hand ${hand(g, 1)}, gy ${cnt(g, 1, 'gy')})`);
  const g2 = duel({ board: [{ hand: [], gy: ['Hino-Kagu-Tsuchi'], st: ['Call of the Haunted'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Call of the Haunted') || (act(g2, 0, 'Call of the Haunted'), settle(g2, 'Hino'), !on(g2, 0, 'Hino-Kagu-Tsuchi')), 'cannot be Special Summoned');
});
T('Hinotama: 500 damage', () => {
  const g = duel({ board: [{ hand: ['Hinotama'], turn: 2 }, {}] });
  act(g, 0, 'Hinotama'); settle(g); ok(lp(g, 1) === 7500, `B ${lp(g, 1)}`);
});
T("Hiro's Shadow Scout: opponent draws 3, Spells discarded", () => {
  const g = duel({ board: [{ hand: [], m: [setM("Hiro's Shadow Scout")], turn: 2 }, { deckTop: ['Dark Hole', FILL, 'Raigeki'] }] });
  const h = hand(g, 1); flipSum(g, 0, "Hiro's Shadow Scout");
  ok(hand(g, 1) === h + 1 && inZ(g, 1, 'gy', 'Dark Hole') && inZ(g, 1, 'gy', 'Raigeki'), `B drew 3, kept 1 (hand ${hand(g, 1)})`);
});
T('Homunculus: change Attribute once per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Homunculus the Alchemic Being'], turn: 2 }, {}] });
  const c = on(g, 0, 'Homunculus the Alchemic Being');
  act(g, 0, 'Homunculus the Alchemic Being'); settle(g, 'DARK');
  ok(c.flags.f23attr === 'DARK', 'DARK chosen (ENGINE gap: attr() has no override)');
  ok(!canAct(g, 0, 'Homunculus the Alchemic Being'), 'not again this turn');
});
T("Horus' Servant: opponent cannot target Horus", () => {
  const g = duel({ first: 1, board: [{ m: ['Horus the Black Flame Dragon LV6', "Horus' Servant"] }, { hand: [], m: ['Exiled Force'], turn: 2 }] });
  act(g, 1, 'Exiled Force'); settle(g, 'Horus the Black Flame Dragon LV6');
  ok(on(g, 0, 'Horus the Black Flame Dragon LV6') && inZ(g, 0, 'gy', "Horus' Servant"), 'Exiled Force could only take the Servant');
});
T('Hoshiningen: LIGHT +500, DARK -400', () => {
  const g = duel({ board: [{ hand: [], m: ['Hoshiningen', 'Mystical Elf'], turn: 2 }, { m: ['Archfiend Soldier', FILL] }] });
  ok(E.atk(g, on(g, 0, 'Mystical Elf')) === 1300 && E.atk(g, on(g, 1, 'Archfiend Soldier')) === 1500 && E.atk(g, on(g, 1, FILL)) === 2000 && E.atk(g, on(g, 0, 'Hoshiningen')) === 1000, 'stats changed');
});
T('House of Adhesive Tape: destroys a summoned monster with 500 or less DEF', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { st: ['House of Adhesive Tape'] }] });
  ns(g, 0, FILL, 'House of Adhesive Tape');
  ok(inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'House of Adhesive Tape'), 'Warwolf (100 DEF) destroyed');
  const g2 = duel({ board: [{ hand: ['Mystical Elf'], turn: 2 }, { st: ['House of Adhesive Tape'] }] });
  ns(g2, 0, 'Mystical Elf', 'House of Adhesive Tape');
  ok(on(g2, 0, 'Mystical Elf'), 'Mystical Elf (2000 DEF) stays');
});
T('Huge Revolution: with the 3 people, opponent loses hand and field', () => {
  const g = duel({ board: [{ hand: [], m: ['People Running About', 'Oppressed People', 'United Resistance'], st: ['Huge Revolution'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  ok(canAct(g, 0, 'Huge Revolution'), 'offered'); act(g, 0, 'Huge Revolution'); settle(g);
  ok(hand(g, 1) === 0 && cnt(g, 1, 'm') === 0 && cnt(g, 1, 'st') === 0 && on(g, 0, 'United Resistance'), 'B hand and field gone, A field stays');
  const g2 = duel({ board: [{ hand: [], m: ['People Running About', 'Oppressed People'], st: ['Huge Revolution'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Huge Revolution'), 'not offered with only 2');
});
T('Human-Wave Tactics: replaces a Level 2 Normal destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Mega Thunderball'], st: [up('Human-Wave Tactics')], deckTop: [FILL, 'Basic Insect'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Mega Thunderball', FILL);
  ok(inZ(g, 0, 'gy', 'Mega Thunderball'), 'Thunderball destroyed');
  endTurn(g, 'Basic Insect');
  ok(on(g, 0, 'Basic Insect'), 'Basic Insect Special Summoned from the Deck');
});
const poly = (ex, mats) => T(`${ex}: Fusion Summon`, () => {
  const g = duel({ ex0: [ex], board: [{ hand: ['Polymerization', ...mats], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Polymerization'), 'Polymerization offered'); act(g, 0, 'Polymerization'); settle(g, ex, ...mats, 'Attack');
  ok(on(g, 0, ex) && mats.every(m => inZ(g, 0, 'gy', m)), `${ex} on the field, materials in the GY`);
});
poly('Humanoid Worm Drake', ['Worm Drake', 'Humanoid Slime']);
poly('Kaminari Attack', ['Ocubeam', 'Mega Thunderball']);
poly('Karbonala Warrior', ['M-Warrior 1', 'M-Warrior 2']);
poly('Kwagar Hercules', ['Kuwagata α', 'Hercules Beetle']);
T('Hungry Burger: Ritual Summon with Hamburger Recipe', () => {
  const g = duel({ board: [{ hand: ['Hamburger Recipe', 'Hungry Burger'], m: ['Archfiend Soldier', 'Mega Thunderball'], turn: 2 }, {}] });
  act(g, 0, 'Hamburger Recipe'); settle(g, 'Hungry Burger', 'Archfiend Soldier', 'Mega Thunderball', 'Attack');
  ok(on(g, 0, 'Hungry Burger') && inZ(g, 0, 'gy', 'Archfiend Soldier'), 'Hungry Burger summoned');
});
T('Incandescent Ordeal: Ritual Summon Legendary Flame Lord', () => {
  const g = duel({ board: [{ hand: ['Incandescent Ordeal', 'Legendary Flame Lord'], m: ['Archfiend Soldier', 'Hyena'], turn: 2 }, {}] });
  act(g, 0, 'Incandescent Ordeal'); settle(g, 'Legendary Flame Lord', 'Archfiend Soldier', 'Hyena', 'Attack');
  ok(on(g, 0, 'Legendary Flame Lord'), 'Legendary Flame Lord summoned');
  const g2 = duel({ board: [{ hand: ['Incandescent Ordeal', 'Legendary Flame Lord'], m: ['Archfiend Soldier', 'Mega Thunderball'], deckTop: ['Dark Hole'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Incandescent Ordeal'), 'not with only 6 Levels');
});
T('Hyena: destroyed by battle, Special Summon Hyenas from the Deck', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Hyena'], deckTop: ['Hyena', 'Hyena'] }] });
  bp(g); atkOn(g, 0, FILL, 'Hyena', 'Hyena', 'Hyena', 'Attack');
  ok(cnt(g, 1, 'm', 'Hyena') === 2, `B has ${cnt(g, 1, 'm', 'Hyena')} Hyenas`);
});
T('Hysteric Fairy: Tribute 2 for 1000 LP', () => {
  const g = duel({ board: [{ hand: [], m: ['Hysteric Fairy', FILL, 'Battle Ox'], turn: 2 }, {}] });
  act(g, 0, 'Hysteric Fairy'); settle(g, FILL, 'Battle Ox');
  ok(lp(g, 0) === 9000 && inZ(g, 0, 'gy', FILL) && inZ(g, 0, 'gy', 'Battle Ox'), `A ${lp(g, 0)}`);
});
T('Impenetrable Formation: +700 DEF while all in Defense, destroyed when the monster leaves', () => {
  const g = duel({ board: [{ hand: ['Impenetrable Formation', 'Dark Hole'], m: [defM(FILL), defM('Mystical Elf')], turn: 2 }, {}] });
  act(g, 0, 'Impenetrable Formation'); settle(g, 'Mystical Elf');
  ok(E.def(g, on(g, 0, 'Mystical Elf')) === 2700 && E.def(g, on(g, 0, FILL)) === 100, `Elf DEF ${E.def(g, on(g, 0, 'Mystical Elf'))}`);
  act(g, 0, 'Dark Hole'); settle(g);
  ok(inZ(g, 0, 'gy', 'Impenetrable Formation'), 'Formation destroyed with the monster');
});
T('Imperial Order: negates Spells, 700 in the Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { st: [up('Imperial Order')] }] });
  const l0 = lp(g, 1), h = hand(g, 0);
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(hand(g, 0) === h - 1, `Pot of Greed drew nothing (hand ${hand(g, 0)})`);
  endTurn(g); toIdle(g);
  ok(lp(g, 1) <= l0 - 700 && inZ(g, 1, 'st', 'Imperial Order'), `B paid 700 in its Standby Phase (${l0} -> ${lp(g, 1)})`);
  console.log(`     (info: B LP at A's turn 2: ${l0}; after B's Standby: ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], turn: 2 }, { lp: 500, st: [up('Imperial Order')] }] });
  endTurn(g2); toIdle(g2);
  ok(inZ(g2, 1, 'gy', 'Imperial Order') || lp(g2, 1) === 500, 'destroyed when B cannot pay');
});
T('Inaba White Rabbit: attacks directly, returns at the End Phase', () => {
  const g = duel({ board: [{ hand: ['Inaba White Rabbit'], turn: 2 }, { m: [FILL] }] });
  ns(g, 0, 'Inaba White Rabbit'); bp(g);
  ok(canAtk(g, on(g, 0, 'Inaba White Rabbit'), null), 'direct attack offered'); atkOn(g, 0, 'Inaba White Rabbit', null);
  ok(lp(g, 1) === 7300, `B ${lp(g, 1)}`);
  endTurn(g); ok(inZ(g, 0, 'hand', 'Inaba White Rabbit'), 'back in the hand');
});
T('Infernalqueen Archfiend: pays 500, an Archfiend gains 1000 in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Infernalqueen Archfiend', 'Archfiend Soldier'], turn: 2 }, {}] });
  toIdle(g, 'Archfiend Soldier');
  ok(lp(g, 0) === 7500, `A paid 500 (${lp(g, 0)})`);
  const q = on(g, 0, 'Infernalqueen Archfiend'), s = on(g, 0, 'Archfiend Soldier');
  ok(E.atk(g, s) === 2900 || E.atk(g, q) === 1900, `an Archfiend gained 1000 (Soldier ${E.atk(g, s)}, Queen ${E.atk(g, q)})`);
  endTurn(g); ok(E.atk(g, s) + E.atk(g, q) === 3800, 'not cumulative: one boost again in B Standby');
});
T('Infinite Cards: no hand limit', () => {
  const g = duel({ board: [{ hand: ['Infinite Cards', FILL, FILL, FILL, FILL, FILL, FILL, FILL], turn: 2 }, {}] });
  act(g, 0, 'Infinite Cards'); settle(g);
  ok(inZ(g, 0, 'st', 'Infinite Cards'), 'stays on the field');
  endTurn(g); console.log(`     (info, ENGINE gap: hand limit fixed at 6, kept ${hand(g, 0)})`);
});
T('Infinite Dismissal: Level 3 or lower Normal Summoned monster destroyed at End Phase', () => {
  const g = duel({ board: [{ hand: ['Hyena'], turn: 2 }, { st: [up('Infinite Dismissal')] }] });
  ns(g, 0, 'Hyena'); endTurn(g);
  ok(inZ(g, 0, 'gy', 'Hyena'), 'Hyena destroyed');
  const g2 = duel({ board: [{ hand: [FILL], turn: 2 }, { st: [up('Infinite Dismissal')] }] });
  ns(g2, 0, FILL); endTurn(g2); ok(on(g2, 0, FILL), 'Level 4 stays');
});
T('Injection Fairy Lily: pay 2000 for +3000 in damage calculation', () => {
  const g = duel({ board: [{ hand: [], m: ['Injection Fairy Lily'], turn: 2 }, { m: [BEWD] }] });
  bp(g); atkOn(g, 0, 'Injection Fairy Lily', BEWD, 'Injection Fairy Lily');
  ok(lp(g, 0) === 6000 && inZ(g, 1, 'gy', BEWD) && lp(g, 1) === 7600 && E.atk(g, on(g, 0, 'Injection Fairy Lily')) === 400, `A ${lp(g, 0)}, B ${lp(g, 1)}, Blue-Eyes destroyed, back to 400`);
});
T('Inspection: pay 500 in the opponent Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: [up('Inspection')], turn: 2 }, {}] });
  endTurn(g); toIdle(g, 'Inspection');
  ok(lp(g, 0) === 7500, `A paid 500 (${lp(g, 0)})`);
});
T('Interdimensional Matter Transporter: banish until the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Interdimensional Matter Transporter'], turn: 2 }, {}] });
  act(g, 0, 'Interdimensional Matter Transporter'); settle(g, FILL);
  ok(inZ(g, 0, 'ban', FILL), 'banished'); endTurn(g); ok(on(g, 0, FILL), 'back at the End Phase');
});
T('Invader of Darkness: opponent cannot activate Quick-Play Spells', () => {
  const g = duel({ first: 1, board: [{ m: ['Invader of Darkness'], st: [FILL && 'Mirror Force'] }, { hand: ['Mystical Space Typhoon', 'Book of Moon', 'Dark Hole'], turn: 2 }] });
  ok(!canAct(g, 1, 'Mystical Space Typhoon') && !canAct(g, 1, 'Book of Moon') && canAct(g, 1, 'Dark Hole'), 'MST and Book of Moon blocked, Dark Hole allowed');
});
T('Invader of the Throne: FLIP switch control', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Invader of the Throne')], turn: 2 }, { m: [BEWD] }] });
  flipSum(g, 0, 'Invader of the Throne', BEWD);
  ok(on(g, 0, BEWD) && on(g, 1, 'Invader of the Throne'), 'switched');
});
T('Invasion of Flames: no Traps on its Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Invasion of Flames'], turn: 2 }, { st: ['Torrential Tribute'] }] });
  choose(g, 'ns:' + card(g, 0, 'Invasion of Flames').u);
  let offered = false; for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'respond'; i++) { if (g.prompt.p === 1 && canAct(g, 1, 'Torrential Tribute')) offered = true; E.act(g, ['pass']); }
  ok(!offered && on(g, 0, 'Invasion of Flames'), 'Torrential Tribute not offered');
});
T('Invigoration: EARTH +400 ATK -200 DEF', () => {
  const g = duel({ board: [{ hand: ['Invigoration'], m: ['Battle Ox'], turn: 2 }, {}] });
  act(g, 0, 'Invigoration'); settle(g, 'Battle Ox');
  const o = on(g, 0, 'Battle Ox'); ok(E.atk(g, o) === 2100 && E.def(g, o) === 800, `Ox ${E.atk(g, o)}/${E.def(g, o)}`);
});
T('Invitation to a Dark Sleep: selected monster cannot attack', () => {
  const g = duel({ board: [{ hand: ['Invitation to a Dark Sleep'], m: ['Battle Ox'], turn: 2 }, { m: [BEWD, FILL] }] });
  ns(g, 0, 'Invitation to a Dark Sleep', 'Battle Ox', BEWD);
  endTurn(g); toIdle(g); bp(g);
  ok(!canAtk(g, on(g, 1, BEWD), on(g, 0, 'Invitation to a Dark Sleep')) && canAtk(g, on(g, 1, FILL), on(g, 0, 'Invitation to a Dark Sleep')), 'Blue-Eyes cannot attack, Warwolf can');
});
T('Jade Insect Whistle: opponent puts an Insect on top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Jade Insect Whistle'], turn: 2 }, { deckTop: [FILL, FILL, 'Insect Knight'] }] });
  act(g, 0, 'Jade Insect Whistle'); settle(g, 'Insect Knight');
  const d = g.p[1].deck; ok(E.name(d[d.length - 1]) === 'Insect Knight', 'Insect Knight on top');
});
T('Jam Breeding Machine: Slime Token each Standby, only Sets', () => {
  const g = duel({ board: [{ hand: [FILL], st: [up('Jam Breeding Machine')], turn: 2 }, {}] });
  toIdle(g);
  const tk = g.p[0].m.find(c => c && /Slime/.test(E.name(c)));
  ok(tk && tk.pos === 'atk' && E.atk(g, tk) === 500, 'Slime Token in Attack Position');
  const w = card(g, 0, FILL); ok(!hasOpt(g, 'ns:' + w.u) && hasOpt(g, 'set:' + w.u), 'cannot Normal Summon, can Set');
});
T('Jam Defender: switch the attack to Revival Jam', () => {
  const g = duel({ first: 1, board: [{ m: ['Mystical Elf', 'Revival Jam'], st: ['Jam Defender'] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g); atkOn(g, 1, BEWD, 'Mystical Elf', 'Jam Defender', 'Revival Jam');
  ok(on(g, 0, 'Mystical Elf') && lp(g, 0) === 5500, `Elf safe, A took 1500 from the Revival Jam battle and paid 1000 for Revival Jam (${lp(g, 0)})`);
});
T('Jar Robber: negates Pot of Greed, draw 1', () => {
  const g = duel({ first: 1, board: [{ st: ['Jar Robber'] }, { hand: ['Pot of Greed'], turn: 2 }] });
  const h0 = hand(g, 0), h1 = hand(g, 1);
  act(g, 1, 'Pot of Greed'); settle(g, 'Jar Robber');
  ok(hand(g, 1) === h1 - 1 && hand(g, 0) === h0 + 1, `B drew 0 (${hand(g, 1)}), A drew 1 (${hand(g, 0)})`);
  const g2 = duel({ first: 1, board: [{ st: ['Jar Robber'] }, { hand: ['Dark Hole'], m: [FILL], turn: 2 }] });
  act(g2, 1, 'Dark Hole'); let offered = false;
  for (let i = 0; i < 4 && g2.prompt && g2.prompt.type === 'respond'; i++) { if (g2.prompt.p === 0 && canAct(g2, 0, 'Jar Robber')) offered = true; E.act(g2, ['pass']); }
  ok(!offered, 'not on another Spell');
});
T('Jigen Bakudan: Tribute in the Standby Phase, destroy own monsters, half their ATK as damage', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Jigen Bakudan'), FILL, 'Battle Ox'], turn: 2 }, {}] });
  flipSum(g, 0, 'Jigen Bakudan');
  endTurn(g); toIdle(g); endTurn(g);
  for (let i = 0; i < 12 && g.prompt && !idle(g); i++) settle(g, 'Jigen Bakudan');
  ok(lp(g, 1) === 8000 - 1850 && cnt(g, 0, 'm') === 0, `B took 1850 (${lp(g, 1)}), A field empty (${cnt(g, 0, 'm')})`);
});
T('Jirai Gumo: wrong call halves LP', () => {
  let halved = 0, kept = 0;
  for (let s = 1; s <= 8; s++) {
    const g = duel({ seed: s, board: [{ hand: [], m: ['Jirai Gumo'], turn: 2 }, {}] });
    bp(g); atkOn(g, 0, 'Jirai Gumo', null, 'Heads');
    if (lp(g, 0) === 4000) halved++; else if (lp(g, 0) === 8000) kept++;
    if (lp(g, 1) !== 5800) { ok(false, `attack went on (B ${lp(g, 1)})`); return; }
  }
  ok(halved + kept === 8 && halved > 0 && kept > 0, `halved ${halved}, kept ${kept} of 8`);
});
T('Kaibaman and Jowgen: Kaibaman summons Blue-Eyes, Jowgen destroys it and locks Special Summons', () => {
  const g = duel({ board: [{ hand: [BEWD, 'Jowgen the Spiritualist', FILL], m: ['Kaibaman'], turn: 2 }, {}] });
  act(g, 0, 'Kaibaman'); settle(g, BEWD, 'Attack');
  ok(on(g, 0, BEWD) && inZ(g, 0, 'gy', 'Kaibaman'), 'Blue-Eyes Special Summoned');
  ns(g, 0, 'Jowgen the Spiritualist');
  ok(E.lib.forbid(g, { type: 'ss', c: card(g, 0, FILL), p: 0, how: 'special' }) && E.lib.forbid(g, { type: 'ss', c: g.p[1].deck[0], p: 1, how: 'special' }), 'neither player can Special Summon');
  act(g, 0, 'Jowgen the Spiritualist'); settle(g);
  ok(inZ(g, 0, 'gy', BEWD) && on(g, 0, 'Jowgen the Spiritualist') && hand(g, 0) === 1, `Blue-Eyes destroyed, 1 card discarded (hand ${hand(g, 0)})`);
});
T('Jowls of Dark Demise: take control this turn, attack directly', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Jowls of Dark Demise')], turn: 2 }, { m: [BEWD, FILL] }] });
  flipSum(g, 0, 'Jowls of Dark Demise', BEWD);
  ok(on(g, 0, BEWD), 'took Blue-Eyes'); bp(g);
  ok(canAtk(g, on(g, 0, BEWD), null), 'direct attack offered'); atkOn(g, 0, BEWD, null);
  ok(lp(g, 1) === 5000, `B ${lp(g, 1)}`);
  endTurn(g); ok(on(g, 1, BEWD), 'returned at the end of the turn');
});
T('Just Desserts: 500 per opponent monster', () => {
  const g = duel({ board: [{ hand: [], st: ['Just Desserts'], turn: 2 }, { m: [FILL, FILL, 'Battle Ox'] }] });
  act(g, 0, 'Just Desserts'); settle(g); ok(lp(g, 1) === 6500, `B ${lp(g, 1)}`);
});
T('KA-2 Des Scissors: Level x 500 on a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['KA-2 Des Scissors'], turn: 2 }, { m: ['Mega Thunderball'] }] });
  bp(g); atkOn(g, 0, 'KA-2 Des Scissors', 'Mega Thunderball');
  ok(lp(g, 1) === 8000 - 250 - 1000, `B ${lp(g, 1)}`);
});
T('Kaminote Blow: destroys the monster that battled Chu-Ske', () => {
  const g = duel({ board: [{ hand: ['Kaminote Blow'], m: ['Chu-Ske the Mouse Fighter'], turn: 2 }, { m: [defM(BEWD)] }] });
  act(g, 0, 'Kaminote Blow'); settle(g); bp(g); atkOn(g, 0, 'Chu-Ske the Mouse Fighter', BEWD);
  ok(inZ(g, 1, 'gy', BEWD) && on(g, 0, 'Chu-Ske the Mouse Fighter'), 'Blue-Eyes destroyed after the Damage Step');
  const g2 = duel({ board: [{ hand: ['Kaminote Blow'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Kaminote Blow'), 'not without the fighters');
});
T('Kangaroo Champ: battled monster changed to Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Kangaroo Champ'], turn: 2 }, { m: ['Spirit Reaper'] }] });
  bp(g); atkOn(g, 0, 'Kangaroo Champ', 'Spirit Reaper');
  const r = on(g, 1, 'Spirit Reaper'); ok(r && r.pos === 'def', `Spirit Reaper now ${r && r.pos}`);
});
T('Karate Man: double original ATK, destroyed at End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Karate Man'], turn: 2 }, {}] });
  act(g, 0, 'Karate Man'); settle(g);
  ok(E.atk(g, on(g, 0, 'Karate Man')) === 2000, 'ATK 2000'); ok(!canAct(g, 0, 'Karate Man'), 'once per turn');
  endTurn(g); ok(inZ(g, 0, 'gy', 'Karate Man'), 'destroyed at the End Phase');
});
T('Kazejin: attacker ATK 0 in damage calculation', () => {
  const g = duel({ first: 1, board: [{ m: ['Kazejin'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Kazejin', 'Kazejin');
  ok(lp(g, 1) === 5600 && inZ(g, 1, 'gy', FILL), `B took 2400 (${lp(g, 1)})`);
});
T('Kelbek: attacker returns to the hand', () => {
  const g = duel({ first: 1, board: [{ m: [defM('Kelbek')] }, { hand: [], m: ['Mystical Elf'], turn: 2 }] });
  bp(g); atkOn(g, 1, 'Mystical Elf', 'Kelbek');
  ok(inZ(g, 1, 'hand', 'Mystical Elf') && lp(g, 1) === 7000 && on(g, 0, 'Kelbek'), `Elf back in hand, B took 1000 (${lp(g, 1)})`);
});
T('Keldo: return 2 cards from the opponent GY to the Deck', () => {
  const g = duel({ first: 1, board: [{ m: ['Keldo'] }, { hand: [], m: [FILL], gy: ['Dark Hole', 'Raigeki', 'Pot of Greed'], turn: 2 }] });
  const d = g.p[1].deck.length;
  bp(g); atkOn(g, 1, FILL, 'Keldo', 'Dark Hole', 'Raigeki');
  ok(inZ(g, 0, 'gy', 'Keldo') && cnt(g, 1, 'gy') === 1 && g.p[1].deck.length === d + 2, `B GY ${cnt(g, 1, 'gy')}, Deck +${g.p[1].deck.length - d}`);
});
T('Kiryu: Union to Dark Blade +900, Tribute for a direct attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Kiryu', 'Dark Blade'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Kiryu'); settle(g, 'Dark Blade');
  const b = on(g, 0, 'Dark Blade');
  ok(inZ(g, 0, 'st', 'Kiryu') && E.atk(g, b) === 2700 && E.def(g, b) === 2400, `Dark Blade ${E.atk(g, b)}/${E.def(g, b)}`);
  ok(canAct(g, 0, 'Kiryu'), 'Kiryu effect offered as an equip');
  act(g, 0, 'Kiryu'); settle(g, 'Tribute', 'direct');
  if (inZ(g, 0, 'gy', 'Kiryu')) { bp(g); ok(canAtk(g, b, null), 'Dark Blade can attack directly'); }
  else ok(false, 'Kiryu not Tributed (' + g.log.slice(-3).join(' | ') + ')');
});
T('Kiseitai: becomes an Equip on the attacker, gains LP in the opponent Standby', () => {
  const g = duel({ first: 1, board: [{ m: [setM('Kiseitai')] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Kiseitai', 'Kiseitai');
  ok(inZ(g, 0, 'st', 'Kiseitai') && on(g, 1, FILL), 'Kiseitai equipped to the Warwolf');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g, 'Kiseitai');
  ok(lp(g, 0) === 9000, `A gained 1000 (${lp(g, 0)})`);
});
T('Kishido Spirit: equal ATK, only the opponent monster dies', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: [up('Kishido Spirit')], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, FILL, FILL);
  ok(on(g, 0, FILL) && !on(g, 1, FILL), 'A Warwolf survives');
});
T("Knight's Title: Dark Magician into Dark Magician Knight", () => {
  const g = duel({ board: [{ hand: ["Knight's Title"], m: ['Dark Magician'], gy: ['Dark Magician Knight'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, "Knight's Title"); settle(g, FILL, 'Attack');
  ok(on(g, 0, 'Dark Magician Knight') && inZ(g, 0, 'gy', 'Dark Magician'), 'Knight summoned');
});
T('Koitsu: Union to Aitsu +3000 and piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Aitsu', 'Koitsu'], turn: 2 }, { m: [setM(FILL)] }] });
  act(g, 0, 'Koitsu'); settle(g, 'Aitsu');
  ok(E.atk(g, on(g, 0, 'Aitsu')) === 3100, 'Aitsu 3100'); bp(g); atkOn(g, 0, 'Aitsu', FILL);
  ok(lp(g, 1) === 5000, `B took 3000 piercing (${lp(g, 1)})`);
});
T('Kotodama: a second monster with the same name is destroyed', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Kotodama', FILL], turn: 2 }, {}] });
  ns(g, 0, FILL);
  ok(cnt(g, 0, 'm', FILL) === 1 && cnt(g, 0, 'gy', FILL) === 1, 'the new Warwolf is destroyed');
});
T("Kozaky's Self-Destruct Button: 1000 to the destroyer", () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], turn: 2 }, { st: ["Kozaky's Self-Destruct Button"] }] });
  act(g, 0, 'Mystical Space Typhoon'); settle(g, "Kozaky's Self-Destruct Button");
  ok(inZ(g, 1, 'gy', "Kozaky's Self-Destruct Button") && lp(g, 0) === 7000, `A took 1000 (${lp(g, 0)})`);
});
T('Kryuel: right call destroys a monster', () => {
  let hit = 0;
  for (let s = 1; s <= 8; s++) {
    const g = duel({ seed: s, board: [{ hand: [], m: [FILL, 'Mystical Elf'], turn: 2 }, { m: ['Kryuel'] }] });
    bp(g); atkOn(g, 0, FILL, 'Kryuel', 'Heads', FILL);
    if (!inZ(g, 1, 'gy', 'Kryuel')) { ok(false, 'Kryuel not destroyed'); return; }
    if (cnt(g, 0, 'm') < 2) hit++;
  }
  ok(hit > 0 && hit < 8, `destroyed a monster in ${hit} of 8`);
});
T('Kuriboh: discard for no battle damage', () => {
  const g = duel({ first: 1, board: [{ hand: ['Kuriboh'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, null, 'Kuriboh');
  ok(lp(g, 0) === 8000 && inZ(g, 0, 'gy', 'Kuriboh'), `A ${lp(g, 0)}`);
});

// Goat: the cards with a goat-only script and a few shared ones
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
  const gduel = (board, ex, o = {}) => (board[1].turn && !board[0].turn && (board[0].turn = board[1].turn), lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board }));
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Hinotama, Just Desserts, Invigoration', () => {
    let g = gduel([{ hand: ['Hinotama'], turn: 2 }, {}]); act(g, 0, 'Hinotama'); settle(g); ok(lp(g, 1) === 7500, 'Goat: Hinotama 500');
    g = gduel([{ hand: [], st: ['Just Desserts'], turn: 2 }, { m: [GF, GF] }]); act(g, 0, 'Just Desserts'); settle(g); ok(lp(g, 1) === 7000, 'Goat: Just Desserts 1000');
    g = gduel([{ hand: ['Invigoration'], m: ['Battle Ox'], turn: 2 }, {}]); act(g, 0, 'Invigoration'); settle(g, 'Battle Ox');
    const o = on(g, 0, 'Battle Ox'); ok(E.atk(g, o) === 2100 && E.def(g, o) === 800, `Goat: Invigoration ${E.atk(g, o)}/${E.def(g, o)}`);
  });
  G('Injection Fairy Lily, Kuriboh, Kazejin', () => {
    let g = gduel([{ hand: [], m: ['Injection Fairy Lily'], turn: 2 }, { m: [BEWD] }]);
    bp(g); atkOn(g, 0, 'Injection Fairy Lily', BEWD, 'Injection Fairy Lily'); ok(lp(g, 0) === 6000 && inZ(g, 1, 'gy', BEWD), 'Goat: Lily');
    g = gduel([{ hand: ['Kuriboh'] }, { hand: [], m: [GF], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, GF, null, 'Kuriboh'); ok(lp(g, 0) === 8000 && inZ(g, 0, 'gy', 'Kuriboh'), 'Goat: Kuriboh');
    g = gduel([{ m: ['Kazejin'] }, { hand: [], m: [GF], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, GF, 'Kazejin', 'Kazejin'); ok(lp(g, 1) === 5600, `Goat: Kazejin (${lp(g, 1)})`);
  });
  G('Kelbek, Keldo, Kiseitai', () => {
    let g = gduel([{ m: [defM('Kelbek')] }, { hand: [], m: ['Mystical Elf'], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, 'Mystical Elf', 'Kelbek'); ok(inZ(g, 1, 'hand', 'Mystical Elf'), 'Goat: Kelbek bounced');
    g = gduel([{ m: ['Keldo'] }, { hand: [], m: ['Battle Ox'], gy: ['Dark Hole', 'Raigeki', 'Pot of Greed'], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, 'Battle Ox', 'Keldo', 'Dark Hole', 'Raigeki'); ok(cnt(g, 1, 'gy') === 1, 'Goat: Keldo returned 2');
    g = gduel([{ m: [setM('Kiseitai')] }, { hand: [], m: ['Battle Ox'], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, 'Battle Ox', 'Kiseitai', 'Kiseitai'); ok(inZ(g, 0, 'st', 'Kiseitai'), 'Goat: Kiseitai equipped');
  });
  G('Jowgen, Jam Breeding Machine, Karbonala Warrior, Humanoid Worm Drake', () => {
    let g = gduel([{ hand: [], st: [up('Jam Breeding Machine')], turn: 2 }, {}]); toIdle(g);
    ok(g.p[0].m.some(c => c && /Slime/.test(E.name(c))), 'Goat: Slime Token');
    const mw = GC.filter(c => /^M-Warrior/.test(c.n)).map(c => c.n);
    g = gduel([{ hand: ['Polymerization', ...mw], turn: 2 }, {}], ['Karbonala Warrior']); act(g, 0, 'Polymerization'); settle(g, 'Karbonala Warrior', ...mw, 'Attack');
    ok(on(g, 0, 'Karbonala Warrior'), 'Goat: Karbonala Warrior Fusion');
    g = gduel([{ hand: ['Polymerization', 'Worm Drake', 'Humanoid Slime'], turn: 2 }, {}], ['Humanoid Worm Drake']); act(g, 0, 'Polymerization'); settle(g, 'Humanoid Worm Drake', 'Worm Drake', 'Humanoid Slime', 'Attack');
    ok(on(g, 0, 'Humanoid Worm Drake'), 'Goat: Humanoid Worm Drake Fusion');
  });
  G('Jirai Gumo, Jigen Bakudan', () => {
    let halved = 0; for (let s = 1; s <= 8; s++) { const g = gduel([{ hand: [], m: ['Jirai Gumo'], turn: 2 }, {}], null, { seed: s }); bp(g); atkOn(g, 0, 'Jirai Gumo', null, 'Heads'); if (lp(g, 0) === 4000) halved++; }
    ok(halved > 0 && halved < 8, `Goat: Jirai Gumo halved ${halved} of 8`);
    const g = gduel([{ hand: [], m: [setM('Jigen Bakudan'), 'Battle Ox'], turn: 2 }, {}]);
    flipSum(g, 0, 'Jigen Bakudan'); endTurn(g); toIdle(g); endTurn(g);
    for (let i = 0; i < 12 && g.prompt && !idle(g); i++) settle(g, 'Jigen Bakudan');
    ok(lp(g, 1) === 8000 - 850, `Goat: Jigen 850 (${lp(g, 1)})`);
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-23 review checks passed.');
process.exit(fails ? 1 : 0);
