// Independent review checks for full pool batch 39 (written from the card text): node build/review_full-39.js
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
const mons = (g, p) => g.p[p].m.filter(Boolean);
const stOf = (g, p) => g.p[p].st.filter(Boolean);
const hasIgn = (g, c) => optsFor(g, c).some(x => x.key.startsWith('a:'));
const ign = (g, c, ...picks) => { const o = optsFor(g, c).find(x => x.key.startsWith('a:')); if (!o) throw new Error('no effect option for ' + E.name(c)); E.act(g, [o.key]); settle(g, ...picks); };
const spOpt = (g, c) => optsFor(g, c).find(x => x.key.startsWith('sp:'));
const sp = (g, c, ...picks) => { const o = spOpt(g, c); if (!o) throw new Error('no sp option for ' + E.name(c) + ': ' + g.prompt.opts.map(x => x.key).join(',')); E.act(g, [o.key]); settle(g, ...picks); };
const W = FILL, CG = 'Celtic Guardian', ELF = 'Mystical Elf', GSS = 'Giant Soldier of Stone', OJ = 'Ojama Yellow';
const set = n => ({ n, pos: 'set' }), dpos = n => ({ n, pos: 'def' });
const ctrs = c => c && c.ctr ? Object.values(c.ctr).reduce((a, b) => a + (+b || 0), 0) : 0;
const forbid = (g, a) => !!E.lib.forbid(g, a);

T('Gigantic Cephalotus: +200 when a Plant goes from the field to the GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Gigantic Cephalotus', W], turn: 2 }, { m: ['Lonefire Blossom'] }] });
  bp(g); atkOn(g, 0, W, 'Lonefire Blossom'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Gigantic Cephalotus')) === 2050, `Cephalotus ${E.atk(g, on(g, 0, 'Gigantic Cephalotus'))}`);
});
T('Gigastone Omega: Special Summon by banishing 2 EARTH, sent to GY by effect destroys opp S/T', () => {
  const g = duel({ board: [{ hand: ['Gigastone Omega'], gy: [W, CG], turn: 2 }, {}] });
  const c = card(g, 0, 'Gigastone Omega'); ok(!hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u), 'no Normal Summon or Set');
  sp(g, c, W, CG, 'Defense'); toIdle(g);
  ok(!!on(g, 0, 'Gigastone Omega') && cnt(g, 0, 'ban') === 2, `summoned, ${cnt(g, 0, 'ban')} banished`);
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Gigastone Omega'], st: ['Mirror Force'], turn: 2 }, { st: ['Magic Cylinder', 'Dust Tornado'] }] });
  act(g2, 0, 'Dark Hole'); settle(g2); toIdle(g2);
  ok(stOf(g2, 1).length === 0 && inZ(g2, 0, 'st', 'Mirror Force'), `B S/T ${stOf(g2, 1).map(E.name)}, A keeps Mirror Force`);
});
T('Gilford the Legend: equips Equip Spells from the GY on Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Gilford the Legend'], m: [W, OJ, CG], gy: ['United We Stand', 'Mage Power'], turn: 2 }, {}] });
  ns(g, 0, 'Gilford the Legend', W, OJ, 'yes', 'Gilford the Legend'); toIdle(g, 'yes');
  const eq = stOf(g, 0).filter(c => c.equipTo);
  ok(eq.length === 2 && eq.every(c => { const m = mons(g, 0).find(x => x.u === c.equipTo); return m && E.lib.race(m) === 'Warrior'; }), `${eq.length} equips on Warriors`);
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Gilford the Legend'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be revived by Monster Reborn');
});
T('Gilford the Lightning: 3-Tribute Summon destroys all opp monsters', () => {
  const g = duel({ board: [{ hand: ['Gilford the Lightning'], m: [W, OJ, CG], turn: 2 }, { m: [W, ELF] }] });
  ns(g, 0, 'Gilford the Lightning', '3 Tributes', W, OJ, CG); toIdle(g);
  ok(!!on(g, 0, 'Gilford the Lightning') && mons(g, 1).length === 0, `B monsters ${mons(g, 1).map(E.name)}`);
  const g2 = duel({ board: [{ hand: ['Gilford the Lightning'], m: [W, OJ], turn: 2 }, { m: [W] }] });
  ns(g2, 0, 'Gilford the Lightning', W, OJ); toIdle(g2);
  ok(!!on(g2, 0, 'Gilford the Lightning') && mons(g2, 1).length === 1, '2 Tributes: summoned, nothing destroyed');
});
T('Give and Take: revive to opp side in DEF, raise a Level until End Phase', () => {
  const g = duel({ board: [{ hand: [], m: [W], st: ['Give and Take'], gy: [BEWD], turn: 2 }, {}] });
  act(g, 0, 'Give and Take'); settle(g, BEWD, W); toIdle(g);
  const b = on(g, 1, BEWD);
  ok(b && b.pos === 'def' && LV(on(g, 0, W)) === 12, `BEWD on B ${b && b.pos}, Warwolf Lv ${LV(on(g, 0, W))}`);
  endTurn(g); ok(LV(on(g, 0, W)) === 4, 'Level back to 4');
});
T("Gladiator's Return: 3 Gladiator Beasts to Deck, draw 1", () => {
  const g = duel({ board: [{ hand: ["Gladiator's Return"], gy: ['Gladiator Beast Bestiari', 'Gladiator Beast Laquari', 'Gladiator Beast Darius'], turn: 2 }, {}] });
  const d = g.p[0].deck.length;
  act(g, 0, "Gladiator's Return"); settle(g, 'Bestiari', 'Laquari', 'Darius'); toIdle(g);
  ok(cnt(g, 0, 'gy') === 1 && g.p[0].deck.length === d + 2 && hand(g, 0) === 2, `GY ${cnt(g, 0, 'gy')}, deck ${d}->${g.p[0].deck.length}, hand ${hand(g, 0)}`);
});
T('Glorious Illusion: revive Lightsworn, mill 2 at End Phase, linked destruction', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Glorious Illusion'], gy: ['Lyla, Lightsworn Sorceress'], turn: 2 }, {}] });
  act(g, 0, 'Glorious Illusion'); settle(g, 'Lyla'); toIdle(g);
  const l = on(g, 0, 'Lyla, Lightsworn Sorceress'); ok(l && l.pos === 'atk', 'Lyla in Attack Position');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Glorious Illusion'); toIdle(g);
  ok(!on(g, 0, 'Lyla, Lightsworn Sorceress'), 'Lyla destroyed when Illusion left');
  const g2 = duel({ board: [{ hand: [], st: ['Glorious Illusion'], gy: ['Lyla, Lightsworn Sorceress'], turn: 2 }, {}] });
  act(g2, 0, 'Glorious Illusion'); settle(g2, 'Lyla'); toIdle(g2);
  const gy = cnt(g2, 0, 'gy'); endTurn(g2);
  ok(cnt(g2, 0, 'gy') === gy + 5, `End Phase mill 2 plus Lyla's own 3: GY ${gy} -> ${cnt(g2, 0, 'gy')}`);
});
T('Goe Goe: opponent with 5+ cards discards 2 at random', () => {
  const g = duel({ board: [{ hand: [], m: ['Goe Goe the Gallant Ninja'], turn: 2 }, { hand: [W, W, W, W, W] }] });
  bp(g); atkOn(g, 0, 'Goe Goe the Gallant Ninja', null); toIdle(g);
  ok(lp(g, 1) === 6500 && hand(g, 1) === 3, `B LP ${lp(g, 1)}, hand ${hand(g, 1)}`);
  const g2 = duel({ board: [{ hand: [], m: ['Goe Goe the Gallant Ninja'], turn: 2 }, { hand: [W, W, W, W] }] });
  bp(g2); atkOn(g2, 0, 'Goe Goe the Gallant Ninja', null); toIdle(g2);
  ok(hand(g2, 1) === 4, `4 cards: no discard (hand ${hand(g2, 1)})`);
});
T('Goggle Golem: Gemini Summon makes original ATK 2100', () => {
  const g = duel({ board: [{ hand: [], m: ['Goggle Golem'], turn: 2 }, {}] });
  const c = on(g, 0, 'Goggle Golem'); ok(E.atk(g, c) === 1500, 'ATK 1500 as a Normal Monster');
  choose(g, 'gem:' + c.u); settle(g); toIdle(g);
  ok(E.atk(g, c) === 2100, `ATK ${E.atk(g, c)} after Gemini Summon`);
});
T('Goka: Special Summon with a FIRE, destroy a FIRE; token each Standby; Tribute FIRE for +500', () => {
  const g = duel({ board: [{ hand: ['Goka, the Pyre of Malice'], m: ['UFO Turtle'], turn: 2 }, {}] });
  sp(g, card(g, 0, 'Goka, the Pyre of Malice'), 'UFO Turtle', 'Attack'); toIdle(g, 'UFO Turtle', 'NO');
  ok(!!on(g, 0, 'Goka, the Pyre of Malice') && inZ(g, 0, 'gy', 'UFO Turtle'), 'Goka summoned, UFO Turtle destroyed');
  const g2 = duel({ board: [{ hand: [], m: ['Goka, the Pyre of Malice', 'Command Knight'], turn: 2 }, {}] });
  toIdle(g2);
  ok(!!on(g2, 0, 'Fireball Token') && on(g2, 0, 'Fireball Token').pos === 'def', 'Fireball Token in Defense at the Standby Phase');
  const k = on(g2, 0, 'Goka, the Pyre of Malice'); ign(g2, k, 'Command Knight'); toIdle(g2);
  ok(E.atk(g2, k) === 2700 && inZ(g2, 0, 'gy', 'Command Knight'), `Goka ${E.atk(g2, k)}`);
  endTurn(g2); ok(E.atk(g2, k) === 2200, 'back to 2200');
});
T('Goldd: discarded by the opponent, revives and destroys up to 2', () => {
  const g = duel({ board: [{ hand: ['Delinquent Duo'], m: [W], st: ['Mirror Force'], turn: 2 }, { hand: ['Goldd, Wu-Lord of Dark World', CG] }] });
  act(g, 0, 'Delinquent Duo'); settle(g, 'Goldd', W, 'Face-down card'); toIdle(g, 'Goldd', W, 'Face-down card');
  ok(!!on(g, 1, 'Goldd, Wu-Lord of Dark World') && !on(g, 0, W) && !inZ(g, 0, 'st', 'Mirror Force'), `Goldd on B field, A field ${fieldOf(g, 0)}`);
  const g2 = duel({ board: [{ hand: ['Graceful Charity', 'Goldd, Wu-Lord of Dark World', W], turn: 2 }, { m: [W] }] });
  act(g2, 0, 'Graceful Charity'); settle(g2, 'Goldd', W); toIdle(g2);
  ok(!on(g2, 0, 'Goldd, Wu-Lord of Dark World') && inZ(g2, 0, 'gy', 'Goldd, Wu-Lord of Dark World'), 'own discard: stays in GY');
});
function fieldOf(g, p) { return [...mons(g, p), ...stOf(g, p)].map(E.name).join(', '); }
T('Gonogo: after battle, the opponent monster goes face-down', () => {
  const g = duel({ board: [{ hand: [], m: ['Gonogo'], turn: 2 }, { m: [dpos(GSS)] }] });
  bp(g); atkOn(g, 0, 'Gonogo', GSS); toIdle(g);
  const s = on(g, 1, GSS); ok(s && s.pos === 'set', `Giant Soldier ${s && s.pos}`);
});
T('Gozen Match: one Attribute each, others sent to the GY', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: [W, CG, 'Lyla, Lightsworn Sorceress'], st: ['Gozen Match'], turn: 2 }, { m: [ELF, W] }] });
  act(g, 0, 'Gozen Match'); settle(g, 'EARTH', 'LIGHT'); toIdle(g, 'EARTH', 'LIGHT');
  const a0 = new Set(mons(g, 0).map(c => E.lib.attr(c))), a1 = new Set(mons(g, 1).map(c => E.lib.attr(c)));
  ok(a0.size === 1 && a1.size === 1 && mons(g, 0).length >= 1 && mons(g, 1).length === 1, `A ${[...a0]} (${mons(g, 0).length}), B ${[...a1]}`);
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Sangan').u), 'cannot Normal Summon a DARK monster');
});
T('Gragonith: +300 per Lightsworn name, piercing, mills 3 at End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Gragonith, Lightsworn Dragon'], gy: ['Lyla, Lightsworn Sorceress', 'Lyla, Lightsworn Sorceress', 'Ryko, Lightsworn Hunter'], turn: 2 }, { m: [set(ELF)] }] });
  const c = on(g, 0, 'Gragonith, Lightsworn Dragon');
  ok(E.atk(g, c) === 2600 && E.def(g, c) === 2200, `ATK/DEF ${E.atk(g, c)}/${E.def(g, c)}`);
  bp(g); atkOn(g, 0, 'Gragonith, Lightsworn Dragon', ELF); toIdle(g);
  ok(lp(g, 1) === 7400, `piercing: B ${lp(g, 1)}`);
  const gy = cnt(g, 0, 'gy'); endTurn(g);
  ok(cnt(g, 0, 'gy') === gy + 3, `mill 3: ${gy} -> ${cnt(g, 0, 'gy')}`);
});
T('Grand Convergence: with Macro Cosmos, 300 damage and all monsters destroyed', () => {
  const g = duel({ board: [{ hand: ['Grand Convergence'], m: [W], st: [up('Macro Cosmos')], turn: 2 }, { m: [CG] }] });
  ok(canAct(g, 0, 'Grand Convergence'), 'activatable with Macro Cosmos'); act(g, 0, 'Grand Convergence'); settle(g); toIdle(g);
  ok(lp(g, 1) === 7700 && mons(g, 0).length === 0 && mons(g, 1).length === 0, `B ${lp(g, 1)}, monsters left ${mons(g, 0).length + mons(g, 1).length}`);
  const g2 = duel({ board: [{ hand: ['Grand Convergence'], m: [W], turn: 2 }, { m: [CG] }] });
  ok(!canAct(g2, 0, 'Grand Convergence'), 'not without Macro Cosmos');
});
T('Grapple Blocker: the selected monster cannot attack; End Phase 500 LP', () => {
  const g = duel({ board: [{ hand: ['Grapple Blocker'], turn: 2 }, { m: [W] }] });
  ns(g, 0, 'Grapple Blocker', 'yes', W); toIdle(g, 'yes', W);
  ok(forbid(g, { type: 'attack', c: on(g, 1, W) }), 'Warwolf cannot attack');
  endTurn(g, 'yes', 'Pay'); toIdle(g);
  ok(lp(g, 0) === 7500 && !!on(g, 0, 'Grapple Blocker'), `paid 500: A ${lp(g, 0)}`);
});
T('Grass Phantom: +500 per Grass Phantom in GY', () => {
  const g = duel({ board: [{ m: ['Grass Phantom'], gy: ['Grass Phantom', 'Grass Phantom'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Grass Phantom')) === 2000, `ATK ${E.atk(g, on(g, 0, 'Grass Phantom'))}`);
});
T('Grasschopper: Gemini, attacks every opp monster once', () => {
  const g = duel({ board: [{ hand: [], m: ['Grasschopper'], turn: 2 }, { m: [CG, OJ] }] });
  const c = on(g, 0, 'Grasschopper'); choose(g, 'gem:' + c.u); settle(g); toIdle(g);
  bp(g); atkOn(g, 0, 'Grasschopper', CG); toIdle(g);
  ok(canAtk(g, c, on(g, 1, OJ)), 'can attack the second monster');
  atkOn(g, 0, 'Grasschopper', OJ); toIdle(g);
  ok(mons(g, 1).length === 0, 'both destroyed');
});
T('Gravi-Crush Dragon: send a Continuous Spell, destroy an opp monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Gravi-Crush Dragon'], st: [up('Wave-Motion Cannon')], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, 'Gravi-Crush Dragon'), 'Wave-Motion Cannon', W); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Wave-Motion Cannon') && !on(g, 1, W), 'MoP sent, Warwolf destroyed');
});
T('Gravitic Orb: FLIP changes opp face-up monsters position', () => {
  const g = duel({ board: [{ hand: [], m: [set('Gravitic Orb')], turn: 2 }, { m: [W] }] });
  flipSum(g, 0, 'Gravitic Orb'); toIdle(g);
  ok(on(g, 1, W).pos === 'def', `Warwolf ${on(g, 1, W).pos}`);
});
T('Gravity Behemoth: no Tribute on an empty field; destroys Field Spells, then cannot attack', () => {
  const g = duel({ board: [{ hand: ['Gravity Behemoth'], turn: 2 }, {}] });
  ns(g, 0, 'Gravity Behemoth'); toIdle(g); ok(!!on(g, 0, 'Gravity Behemoth'), 'summoned without Tribute');
  const g2 = duel({ board: [{ hand: ['Gravity Behemoth'], m: [W], turn: 2 }, {}] });
  ns(g2, 0, 'Gravity Behemoth', W); toIdle(g2);
  ok(inZ(g2, 0, 'gy', W), 'needs a Tribute when the field is not empty');
  const g3 = duel({ board: [{ hand: ['Gaia Power'], m: ['Gravity Behemoth'], turn: 2 }, {}] });
  act(g3, 0, 'Gaia Power'); settle(g3); toIdle(g3);
  ign(g3, on(g3, 0, 'Gravity Behemoth')); toIdle(g3);
  ok(inZ(g3, 0, 'gy', 'Gaia Power'), 'Gaia Power destroyed');
  bp(g3); ok(!canAtk(g3, on(g3, 0, 'Gravity Behemoth'), null), 'cannot attack');
});
T('Green Baboon: pay 1000, Special Summon when a Beast is destroyed', () => {
  const g = duel({ board: [{ hand: ['Dark Hole', 'Green Baboon, Defender of the Forest'], m: [OJ], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g, 'Green Baboon', 'yes', 'Attack'); toIdle(g, 'Green Baboon', 'yes', 'Attack');
  ok(!!on(g, 0, 'Green Baboon, Defender of the Forest') && lp(g, 0) === 7000, `Baboon summoned, A ${lp(g, 0)}`);
});
T('Gren: discarded by an effect, destroys a S/T', () => {
  const g = duel({ board: [{ hand: ['Graceful Charity', 'Gren, Tactician of Dark World', W], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Graceful Charity'); settle(g, 'Gren', W, 'Face-down card'); toIdle(g, 'Face-down card');
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Grinder Golem: to opp side, 2 tokens for you, no Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Grinder Golem', W], turn: 2 }, {}] });
  sp(g, card(g, 0, 'Grinder Golem'), 'Attack'); toIdle(g);
  ok(!!on(g, 1, 'Grinder Golem') && mons(g, 0).filter(c => E.name(c) === 'Grinder Token' && c.pos === 'atk').length === 2, `B Golem, A ${mons(g, 0).map(E.name)}`);
  ok(!hasOpt(g, 'ns:' + card(g, 0, W).u) && !hasOpt(g, 'set:' + card(g, 0, W).u), 'cannot Normal Summon or Set');
});
T('Ground Spider: opp summon changed to Defense', () => {
  const g = duel({ board: [{ hand: [W], turn: 2 }, { m: [dpos('Ground Spider')] }] });
  ns(g, 0, W, 'yes', 'Ground Spider'); toIdle(g, 'yes', 'Ground Spider');
  ok(on(g, 0, W).pos === 'def', `Warwolf ${on(g, 0, W).pos}`);
});
T('Guard Dog: FLIP, opponent cannot Special Summon this turn', () => {
  const g = duel({ board: [{ hand: [], m: [set('Guard Dog')], turn: 2 }, { hand: [W] }] });
  flipSum(g, 0, 'Guard Dog'); toIdle(g);
  ok(forbid(g, { type: 'ss', c: card(g, 1, W), p: 1, how: 'special' }) && !forbid(g, { type: 'ss', c: card(g, 1, W), p: 0, how: 'special' }), 'B blocked, A not');
});
T('Guard Penalty: draw when the selected monster goes to Defense', () => {
  const g = duel({ board: [{ hand: ['Guard Penalty', 'Book of Moon'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Guard Penalty'); settle(g, W); toIdle(g);
  const h = hand(g, 0); act(g, 0, 'Book of Moon'); settle(g, W); toIdle(g);
  ok(hand(g, 0) === h, `drew 1 (hand ${h} -> ${hand(g, 0)}, Book of Moon used)`);
});
T('Gundari: returns to hand at End Phase; bounces a Synchro it battles', () => {
  const g = duel({ board: [{ hand: ['Gundari'], turn: 2 }, {}] });
  ns(g, 0, 'Gundari'); toIdle(g); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Gundari'), 'back in hand');
  const g2 = duel({ board: [{ hand: [], m: ['Gundari'], turn: 2 }, { m: ['Stardust Dragon'] }] });
  bp(g2); atkOn(g2, 0, 'Gundari', 'Stardust Dragon'); toIdle(g2);
  ok(inZ(g2, 0, 'hand', 'Gundari') && inZ(g2, 1, 'extra', 'Stardust Dragon') && lp(g2, 0) === 8000, `Gundari in hand, Stardust in Extra, A ${lp(g2, 0)}`);
});
T('Gyroid: survives the first battle each turn', () => {
  const g = duel({ board: [{ hand: [], m: [W, CG], turn: 2 }, { m: ['Gyroid'] }] });
  bp(g); atkOn(g, 0, W, 'Gyroid'); toIdle(g);
  ok(!!on(g, 1, 'Gyroid') && lp(g, 1) === 7000, `Gyroid survived, B ${lp(g, 1)}`);
  atkOn(g, 0, CG, 'Gyroid'); toIdle(g);
  ok(!on(g, 1, 'Gyroid'), 'destroyed the second time');
});
T('Half or Nothing: attacker chooses halve or end BP', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { st: ['Half or Nothing'] }] });
  bp(g); atkOn(g, 0, W, null, 'Half or Nothing', 'Halve'); toIdle(g, 'Halve');
  ok(lp(g, 1) === 7000, `halved: B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: [], m: [W], turn: 2 }, { st: ['Half or Nothing'] }] });
  bp(g2); atkOn(g2, 0, W, null, 'Half or Nothing', 'End'); toIdle(g2, 'End');
  ok(lp(g2, 1) === 8000, `ended: B ${lp(g2, 1)}`);
});
T('Hamon: summoned by 3 Continuous Spells, burns 1000 on a battle kill, attack lock in Defense', () => {
  const g = duel({ board: [{ hand: ['Hamon, Lord of Striking Thunder'], st: [up('Wave-Motion Cannon'), up('Spell Economics'), up('Card of Safe Return')], turn: 2 }, { m: [W] }] });
  sp(g, card(g, 0, 'Hamon, Lord of Striking Thunder'), 'Attack'); toIdle(g);
  ok(!!on(g, 0, 'Hamon, Lord of Striking Thunder') && cnt(g, 0, 'gy') === 3, 'summoned, 3 Spells sent');
  bp(g); atkOn(g, 0, 'Hamon, Lord of Striking Thunder', W); toIdle(g);
  ok(lp(g, 1) === 8000 - 2000 - 1000, `B ${lp(g, 1)}`);
  const g2 = duel({ first: 1, board: [{ m: [dpos('Hamon, Lord of Striking Thunder'), CG] }, { hand: [], m: [W], turn: 2 }] });
  bp(g2); ok(!canAtk(g2, on(g2, 1, W), on(g2, 0, CG)) && canAtk(g2, on(g2, 1, W), on(g2, 0, 'Hamon, Lord of Striking Thunder')), 'only Hamon can be attacked');
});
T('Hand Destruction: each player sends 2, draws 2', () => {
  const g = duel({ board: [{ hand: ['Hand Destruction', CG, ELF], turn: 2 }, { hand: [GSS, OJ, W] }] });
  act(g, 0, 'Hand Destruction'); settle(g, CG, ELF, GSS, OJ); toIdle(g);
  ok(cnt(g, 0, 'gy') === 3 && cnt(g, 1, 'gy') === 2 && hand(g, 0) === 3 && hand(g, 1) === 3, `A gy ${cnt(g, 0, 'gy')} hand ${hand(g, 0)}, B gy ${cnt(g, 1, 'gy')} hand ${hand(g, 1)}`);
});
T('Handcuffs Dragon: equips to its killer for -1800, revives when it dies', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [W], turn: 2 }, { m: ['Handcuffs Dragon'] }] });
  bp(g); atkOn(g, 0, W, 'Handcuffs Dragon', 'yes'); toIdle(g, 'yes');
  ok(E.atk(g, on(g, 0, W)) === 200 && inZ(g, 1, 'st', 'Handcuffs Dragon'), `Warwolf ${E.atk(g, on(g, 0, W))}`);
  E.act(g, ['endbp']); settle(g); act(g, 0, 'Dark Hole'); settle(g, 'yes', 'Attack'); toIdle(g, 'yes', 'Attack');
  ok(!!on(g, 1, 'Handcuffs Dragon'), 'Handcuffs Dragon Special Summoned');
});
T('Hanewata: discard to take no effect damage', () => {
  const g = duel({ board: [{ hand: ['Ookazi'], turn: 2 }, { hand: ['Hanewata'] }] });
  act(g, 0, 'Ookazi'); settle(g, 'Hanewata'); toIdle(g);
  ok(lp(g, 1) === 8000 && inZ(g, 1, 'gy', 'Hanewata'), `B ${lp(g, 1)}`);
});
T('Hannibal Necromancer: counter on summon, remove it to destroy a face-up Trap', () => {
  const g = duel({ board: [{ hand: ['Hannibal Necromancer'], turn: 2 }, { st: [up('Royal Decree')] }] });
  ns(g, 0, 'Hannibal Necromancer'); toIdle(g);
  const h = on(g, 0, 'Hannibal Necromancer'); ok(ctrs(h) === 1, 'one Spell Counter');
  ign(g, h, 'Royal Decree'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Royal Decree') && ctrs(h) === 0, 'Royal Decree destroyed, counter used');
});
T("Hard-sellin' Goblin: battle damage returns an opp S/T to the hand", () => {
  const g = duel({ board: [{ hand: [], m: [W], st: [up("Hard-sellin' Goblin")], turn: 2 }, { st: ['Mirror Force'] }] });
  bp(g); atkOn(g, 0, W, null, 'NO', 'Face-down card'); toIdle(g, 'Face-down card');
  ok(inZ(g, 1, 'hand', 'Mirror Force'), 'Mirror Force back in hand');
});
T("Hard-sellin' Zombie: battle damage puts an opp GY card on the bottom of their Deck", () => {
  const g = duel({ board: [{ hand: [], m: [W], st: [up("Hard-sellin' Zombie")], turn: 2 }, { gy: [CG] }] });
  bp(g); atkOn(g, 0, W, null, CG); toIdle(g, CG);
  ok(!inZ(g, 1, 'gy', CG) && E.name(g.p[1].deck[0]) === CG, 'Celtic Guardian at the bottom of the Deck');
});
T('Harvest Angel of Wisdom: destroyed by battle, add a Counter Trap', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Harvest Angel of Wisdom'], gy: ['Solemn Judgment'] }] });
  bp(g); atkOn(g, 0, W, 'Harvest Angel of Wisdom', 'yes', 'Solemn'); toIdle(g, 'yes', 'Solemn');
  ok(inZ(g, 1, 'hand', 'Solemn Judgment'), 'Solemn Judgment added');
});
T('Hate Buster: destroys attacker and the Fiend, burns attacker original ATK', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Archfiend Soldier'], st: ['Hate Buster'] }] });
  bp(g); atkOn(g, 0, W, 'Archfiend Soldier', 'Hate Buster'); toIdle(g);
  ok(!on(g, 0, W) && !on(g, 1, 'Archfiend Soldier') && lp(g, 0) === 6000, `A ${lp(g, 0)}`);
});
T('Healing Wave Generator: gain Level x 100, once per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Healing Wave Generator', W], turn: 2 }, {}] });
  const h = on(g, 0, 'Healing Wave Generator'); ign(g, h, W); toIdle(g);
  ok(lp(g, 0) === 8400 && !hasIgn(g, h), `A ${lp(g, 0)}, not again`);
});
T('Hecatrice: discard to search Valhalla', () => {
  const g = duel({ board: [{ hand: ['Hecatrice'], deckTop: [W, 'Valhalla, Hall of the Fallen'], turn: 2 }, {}] });
  ign(g, card(g, 0, 'Hecatrice'), 'Valhalla'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Valhalla, Hall of the Fallen') && inZ(g, 0, 'gy', 'Hecatrice'), 'Valhalla added');
});
T('Herald of Creation: discard 1, add a Level 7+ from the GY, once per turn', () => {
  const g = duel({ board: [{ hand: [CG, ELF], m: ['Herald of Creation'], gy: [BEWD], turn: 2 }, {}] });
  const h = on(g, 0, 'Herald of Creation'); ign(g, h, CG, BEWD); toIdle(g);
  ok(inZ(g, 0, 'hand', BEWD) && inZ(g, 0, 'gy', CG) && !hasIgn(g, h), 'BEWD added, Celtic discarded, once per turn');
});
T('Herald of Green Light: negates a Spell activation', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [W], turn: 2 }, { hand: ['Herald of Green Light', 'Shining Angel'], m: [CG] }] });
  act(g, 0, 'Dark Hole'); settle(g, 'Herald of Green Light', 'Shining Angel'); toIdle(g);
  ok(!!on(g, 0, W) && !!on(g, 1, CG) && inZ(g, 1, 'gy', 'Shining Angel') && inZ(g, 0, 'gy', 'Dark Hole'), 'Dark Hole negated');
});
T('Herculean Power: Special Summon a Level 4 or lower Gemini when you have no monsters', () => {
  const g = duel({ board: [{ hand: ['Goggle Golem'], st: [up('Herculean Power')], turn: 2 }, { m: [W] }] });
  ign(g, card(g, 0, 'Herculean Power'), 'Goggle Golem', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Goggle Golem'), 'Goggle Golem summoned');
});
T("HERO's Bond: 2 Level 4 or lower E-HEROs from hand", () => {
  const g = duel({ board: [{ hand: ["HERO's Bond", 'Elemental HERO Avian', 'Elemental HERO Clayman'], m: ['Elemental HERO Sparkman'], turn: 2 }, {}] });
  act(g, 0, "HERO's Bond"); settle(g, 'Avian', 'Clayman', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Elemental HERO Avian') && !!on(g, 0, 'Elemental HERO Clayman'), 'both summoned');
  const g2 = duel({ board: [{ hand: ["HERO's Bond", 'Elemental HERO Avian', 'Elemental HERO Clayman'], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, "HERO's Bond"), 'not without a HERO');
});
T("Hero's Rule 2: negates an effect targeting the GY", () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: [BEWD], turn: 2 }, { st: ["Hero's Rule 2"] }] });
  act(g, 0, 'Monster Reborn'); settle(g, BEWD, "Hero's Rule 2"); toIdle(g);
  ok(!on(g, 0, BEWD) && inZ(g, 0, 'gy', 'Monster Reborn'), 'Monster Reborn negated');
});
T('Hidden Soldiers: Special Summon a Level 4 or lower DARK on opp Normal Summon', () => {
  const g = duel({ board: [{ hand: [W], turn: 2 }, { hand: ['Sangan'], st: ['Hidden Soldiers'] }] });
  ns(g, 0, W, 'Hidden Soldiers', 'Sangan'); toIdle(g, 'Sangan');
  ok(!!on(g, 1, 'Sangan'), 'Sangan on B field');
});
T('Horseytail: destroyed by battle, Horseytail Token to opp side in DEF', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Horseytail'] }] });
  bp(g); atkOn(g, 0, W, 'Horseytail'); toIdle(g);
  const t = on(g, 0, 'Horseytail Token'); ok(t && t.pos === 'def', 'token on A side in Defense');
});
T('Hunter Owl: +500 per face-up WIND, not attackable with another WIND', () => {
  const g = duel({ first: 1, board: [{ m: ['Hunter Owl', 'Harpie Lady'] }, { hand: [], m: [BEWD], turn: 2 }] });
  ok(E.atk(g, on(g, 0, 'Hunter Owl')) === 2000, `Owl ${E.atk(g, on(g, 0, 'Hunter Owl'))}`);
  bp(g); ok(!canAtk(g, on(g, 1, BEWD), on(g, 0, 'Hunter Owl')) && canAtk(g, on(g, 1, BEWD), on(g, 0, 'Harpie Lady')), 'Owl cannot be targeted');
});
T('Hunting Instinct: opp Special Summon lets you Special Summon a Dinosaur', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: [CG], turn: 2 }, { hand: ['Sabersaurus'], st: ['Hunting Instinct'] }] });
  act(g, 0, 'Monster Reborn'); settle(g, CG, 'Attack', 'Hunting Instinct', 'Sabersaurus'); toIdle(g, 'Hunting Instinct', 'Sabersaurus', 'Attack');
  ok(!!on(g, 0, CG) && !!on(g, 1, 'Sabersaurus'), 'Sabersaurus on B field');
});
T('Hydra Viper: Tributes an Aqua per attack, up to 3 attacks', () => {
  const g = duel({ board: [{ hand: [], m: ['Hydra Viper', 'Treeborn Frog', 'Penguin Soldier'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Hydra Viper', null, 'Treeborn'); toIdle(g, 'Treeborn');
  ok(lp(g, 1) === 6200 && inZ(g, 0, 'gy', 'Treeborn Frog'), `1st: B ${lp(g, 1)}`);
  atkOn(g, 0, 'Hydra Viper', null, 'Penguin'); toIdle(g, 'Penguin');
  ok(lp(g, 1) === 4400 && inZ(g, 0, 'gy', 'Penguin Soldier'), `2nd: B ${lp(g, 1)}`);
  ok(!canAtk(g, on(g, 0, 'Hydra Viper'), null), 'no Aqua left: no 3rd attack');
});
T('Hydro Pressure Cannon: Level 3 or lower WATER only; kill sends a random opp hand card', () => {
  const g = duel({ board: [{ hand: ['Hydro Pressure Cannon'], m: ['Penguin Soldier', W], turn: 2 }, { hand: [CG, CG], m: [OJ] }] });
  act(g, 0, 'Hydro Pressure Cannon'); const pr = g.prompt; const offered = pr.opts.map(x => x.label).join('|');
  ok(!offered.includes(W), 'Warwolf not offered'); settle(g, 'Penguin'); toIdle(g);
  bp(g); atkOn(g, 0, 'Penguin Soldier', OJ); toIdle(g);
  ok(hand(g, 1) === 1 && cnt(g, 1, 'gy', CG) === 1, `B hand ${hand(g, 1)}`);
});
T('Hydrogeddon: battle kill summons another from the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Hydrogeddon'], deckTop: [W, 'Hydrogeddon'], turn: 2 }, { m: [OJ] }] });
  bp(g); atkOn(g, 0, 'Hydrogeddon', OJ, 'yes', 'Hydrogeddon', 'Attack'); toIdle(g, 'yes', 'Hydrogeddon', 'Attack');
  ok(mons(g, 0).filter(c => E.name(c) === 'Hydrogeddon').length === 2, 'two Hydrogeddon');
});
T('Hysteric Party: discard 1, revive every Harpie Lady; they die with it', () => {
  const g = duel({ board: [{ hand: [W, 'Mystical Space Typhoon'], st: ['Hysteric Party'], gy: ['Harpie Lady', 'Harpie Lady'], turn: 2 }, {}] });
  act(g, 0, 'Hysteric Party'); settle(g, W, 'Attack'); toIdle(g, 'Attack');
  ok(mons(g, 0).filter(c => E.name(c) === 'Harpie Lady').length === 2 && inZ(g, 0, 'gy', W), '2 Harpie Lady summoned');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Hysteric Party'); toIdle(g);
  ok(mons(g, 0).length === 0, 'Harpies destroyed');
});
T('Ice Master: Tribute 2 WATER to summon; Ice Counter; Tribute to destroy countered monsters', () => {
  const g = duel({ board: [{ hand: ['Ice Master'], m: ['Penguin Soldier', 'Treeborn Frog'], turn: 2 }, { m: [W, CG] }] });
  sp(g, card(g, 0, 'Ice Master'), 'Penguin', 'Treeborn', 'Attack'); toIdle(g);
  const im = on(g, 0, 'Ice Master'); ok(!!im && inZ(g, 0, 'gy', 'Penguin Soldier'), 'Ice Master summoned');
  const opts = optsFor(g, im).filter(x => x.key.startsWith('a:'));
  E.act(g, [opts[0].key]); settle(g, W); toIdle(g);
  ok(ctrs(on(g, 1, W)) === 1, 'Ice Counter on Warwolf');
  const o2 = optsFor(g, im).filter(x => x.key.startsWith('a:'));
  ok(o2.length === 1, 'counter effect once per turn, Tribute effect left');
  if (o2.length) { E.act(g, [o2[o2.length - 1].key]); settle(g); toIdle(g); }
  ok(!on(g, 1, W) && !!on(g, 1, CG) && !on(g, 0, 'Ice Master'), 'Warwolf destroyed, Celtic stays');
});
T('Ice Queen: destroyed with 3 Spellcasters in GY, add a Spell', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Ice Queen'], gy: [ELF, 'Dark Magician', 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g, 'yes', 'Pot of Greed'); toIdle(g, 'yes', 'Pot of Greed');
  ok(inZ(g, 0, 'hand', 'Pot of Greed'), 'Pot of Greed added');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Ice Queen'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be revived from the GY');
});
T('Ido: you cannot Summon; destroyed by effect, comes back next Standby', () => {
  const g = duel({ board: [{ hand: [W, 'Dark Hole'], m: ['Ido the Supreme Magical Force'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, W).u), 'cannot Normal Summon');
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Ido the Supreme Magical Force'), 'Ido in GY'); endTurn(g); toIdle(g);
  ok(!!on(g, 0, 'Ido the Supreme Magical Force'), 'Ido back on the field');
});
T('Il Blud: Gemini, Special Summons a Zombie from either GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Il Blud'], turn: 2 }, { gy: ['Pyramid Turtle'] }] });
  const c = on(g, 0, 'Il Blud'); ok(!hasIgn(g, c), 'no effect before Gemini Summon');
  choose(g, 'gem:' + c.u); settle(g); toIdle(g);
  ign(g, c, 'Pyramid Turtle', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Pyramid Turtle'), 'Pyramid Turtle summoned from the opp GY');
});
T('Immortal Ruler: Tribute it, add Zombie World', () => {
  const g = duel({ board: [{ hand: [], m: ['Immortal Ruler'], gy: ['Zombie World'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Immortal Ruler'), 'Zombie World'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Zombie World') && inZ(g, 0, 'gy', 'Immortal Ruler'), 'Zombie World added');
});
T('Imprisoned Queen Archfiend: Standby maintenance 1000 LP; GY boost with Pandemonium', () => {
  const g = duel({ board: [{ hand: [], m: ['Imprisoned Queen Archfiend'], turn: 2 }, {}] });
  toIdle(g, 'yes', 'Pay');
  ok(lp(g, 0) === 7000 && !!on(g, 0, 'Imprisoned Queen Archfiend'), `paid: A ${lp(g, 0)}`);
  const g2 = duel({ board: [{ hand: ['Pandemonium'], m: ['Archfiend Soldier'], gy: ['Imprisoned Queen Archfiend'], turn: 2 }, {}] });
  act(g2, 0, 'Pandemonium'); settle(g2); toIdle(g2); endTurn(g2); toIdle(g2); endTurn(g2); toIdle(g2, 'Archfiend Soldier');
  ok(E.atk(g2, on(g2, 0, 'Archfiend Soldier')) === 2900, `Soldier ${E.atk(g2, on(g2, 0, 'Archfiend Soldier'))}`);
});
console.log(fails ? `\n${fails} failed` : '\nAll batch 39 review checks passed.');
process.exit(fails ? 1 : 0);
