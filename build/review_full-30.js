// Independent review checks for full pool batch 30 (written from the card text): node build/review_full-30.js
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
const W = FILL, CG = 'Celtic Guardian', ELF = 'Mystical Elf', BEWD = 'Blue-Eyes White Dragon';
const set = n => ({ n, pos: 'set' }), dpos = n => ({ n, pos: 'def' });
const ign = (g, c, ...picks) => { const o = optsFor(g, c).find(x => x.key.startsWith('a:')); if (!o) throw new Error('no effect option for ' + E.name(c)); E.act(g, [o.key]); settle(g, ...picks); };
const hasIgn = (g, c) => optsFor(g, c).some(x => x.key.startsWith('a:'));
const ctrs = c => c && c.ctr ? Object.values(c.ctr).reduce((a, b) => a + (+b || 0), 0) : 0;
const mons = (g, p) => g.p[p].m.filter(Boolean);
const DD = 'Destiny HERO - Diamond Dude', KMD = "Koa'ki Meiru Drago";
const RUBY = 'Crystal Beast Ruby Carbuncle', TOPAZ = 'Crystal Beast Topaz Tiger', PEG = 'Crystal Beast Sapphire Pegasus', AMB = 'Crystal Beast Amber Mammoth';

/* ---------------- Barrier Statues ---------------- */
T('Barrier Statues: only their Attribute can be Special Summoned, for both players', () => {
  const sample = { DARK: 'Sangan', EARTH: W, LIGHT: 'Shining Angel', FIRE: 'Elemental HERO Burstinatrix', WIND: 'Elemental HERO Avian', WATER: 'Mother Grizzly' };
  for (const [n, a] of [['Barrier Statue of the Abyss', 'DARK'], ['Barrier Statue of the Drought', 'EARTH'], ['Barrier Statue of the Heavens', 'LIGHT'],
    ['Barrier Statue of the Inferno', 'FIRE'], ['Barrier Statue of the Stormwinds', 'WIND'], ['Barrier Statue of the Torrent', 'WATER']]) {
    const other = a === 'DARK' ? W : 'Sangan';
    const g = duel({ board: [{ hand: [sample[a], other], m: [n], turn: 2 }, { hand: [sample[a], other] }] });
    const fb = (p, nm) => E.lib.forbid(g, { type: 'ss', c: g.p[p].hand.find(c => E.name(c) === nm), p, how: 'special' });
    ok(!fb(0, sample[a]) && !fb(1, sample[a]) && fb(0, other) && fb(1, other), `${n}: ${a} allowed, others blocked for both`);
  }
  const g = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { m: ['Barrier Statue of the Abyss'] }] });
  ok(!hasOpt(g, 'sp:' + card(g, 0, 'Cyber Dragon').u), 'Cyber Dragon (LIGHT) cannot use its own summon under Abyss');
});

/* ---------------- Blackwings / Belial ---------------- */
T('Belial: opponent cannot attack or target other face-up monsters', () => {
  const g = duel({ board: [{ hand: ['Snatch Steal'], m: [BEWD], turn: 2 }, { m: ['Belial - Marquis of Darkness', CG] }] });
  act(g, 0, 'Snatch Steal'); settle(g, 'Belial'); toIdle(g);
  ok(on(g, 0, 'Belial - Marquis of Darkness') && on(g, 1, CG), 'Snatch Steal could only take Belial');
  const g2 = duel({ board: [{ hand: [], m: [BEWD], turn: 2 }, { m: ['Belial - Marquis of Darkness', CG] }] });
  bp(g2); const b = on(g2, 0, BEWD);
  ok(canAtk(g2, b, on(g2, 1, 'Belial - Marquis of Darkness')) && !canAtk(g2, b, on(g2, 1, CG)), 'only Belial can be attacked');
});
T('Blackwing - Elphin: no Tribute with a Blackwing, changes a monster position', () => {
  const g = duel({ board: [{ hand: ['Blackwing - Elphin the Raven'], m: ['Blackwing - Bora the Spear'], turn: 2 }, { m: [W] }] });
  ns(g, 0, 'Blackwing - Elphin the Raven', 'No Tribute', 'Elphin', W, 'Defense'); toIdle(g, W);
  ok(on(g, 0, 'Blackwing - Elphin the Raven') && on(g, 0, 'Blackwing - Bora the Spear'), 'Elphin summoned, Bora kept');
  ok(on(g, 1, W).pos === 'def', `Warwolf changed to Defense (${on(g, 1, W).pos})`);
  const g2 = duel({ board: [{ hand: ['Blackwing - Elphin the Raven'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Blackwing - Elphin the Raven').u), 'no Normal Summon without Tribute or Blackwing');
});
T('Blackwing - Fane: attacks directly, then changes a monster to Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Blackwing - Fane the Steel Chain'], turn: 2 }, { m: [W] }] });
  bp(g); const f = on(g, 0, 'Blackwing - Fane the Steel Chain');
  ok(canAtk(g, f, null), 'direct attack offered');
  atkOn(g, 0, 'Blackwing - Fane the Steel Chain', null, 'Fane', W); toIdle(g, W);
  ok(lp(g, 1) === 7500 && on(g, 1, W).pos === 'def', `B ${lp(g, 1)}, Warwolf ${on(g, 1, W).pos}`);
});
T('Blackwing - Mistral: next battle damage this turn becomes 0', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Blackwing - Mistral the Silver Shield'] }, { hand: [], m: [W, W], turn: 2 }] });
  toIdle(g); bp(g); const [w1, w2] = mons(g, 1);
  choose(g, `atk:${w1.u}:${on(g, 0, 'Blackwing - Mistral the Silver Shield').u}`); settle(g, 'Mistral');
  ok(lp(g, 0) === 6100 && inZ(g, 0, 'gy', 'Blackwing - Mistral the Silver Shield'), `Mistral destroyed, A took 1900 (${lp(g, 0)})`);
  choose(g, `atk:${w2.u}:d`); settle(g);
  ok(lp(g, 0) === 6100, `second attack did 0 (${lp(g, 0)})`);
});

/* ---------------- B, C ---------------- */
T('Bonding - H2O: Tribute 2 Hydrogeddon + Oxygeddon, summon Water Dragon from the Deck', () => {
  const g = duel({ board: [{ hand: ['Bonding - H2O'], m: ['Hydrogeddon', 'Hydrogeddon', 'Oxygeddon'], deckTop: [W, 'Water Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Bonding - H2O'); settle(g, 'Hydrogeddon', 'Oxygeddon', 'Water Dragon', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Water Dragon') && cnt(g, 0, 'gy', 'Hydrogeddon') === 2 && inZ(g, 0, 'gy', 'Oxygeddon'), 'Water Dragon summoned, 3 Tributed');
  const g2 = duel({ board: [{ hand: ['Bonding - H2O'], m: ['Hydrogeddon', 'Oxygeddon'], deckTop: [W, 'Water Dragon'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Bonding - H2O'), 'not with only 1 Hydrogeddon');
});
T('Boot-Up Soldier - Dread Dynamo: +2000 with a Gadget', () => {
  const g = duel({ board: [{ m: ['Boot-Up Soldier - Dread Dynamo', 'Red Gadget'], turn: 2 }, {}] });
  const g2 = duel({ board: [{ m: ['Boot-Up Soldier - Dread Dynamo'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Boot-Up Soldier - Dread Dynamo')) === 2000 && E.atk(g2, on(g2, 0, 'Boot-Up Soldier - Dread Dynamo')) === 0, 'ATK 2000 with Gadget, 0 without');
});
T('Change of Hero - Reflector Ray: Level x 300 when an E-HERO Fusion dies in battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Flame Wingman'], st: ['Change of Hero - Reflector Ray'], turn: 2 }, { m: [BEWD] }] });
  bp(g); atkOn(g, 0, 'Elemental HERO Flame Wingman', BEWD, 'Reflector Ray'); toIdle(g, 'Reflector Ray');
  ok(lp(g, 1) === 6200 && inZ(g, 0, 'gy', 'Change of Hero - Reflector Ray'), `B took 1800 (${lp(g, 1)})`);
});
T('Chrysalis monsters: Tribute with Neo Space to summon their Neo-Spacian from the Deck', () => {
  for (const [ch, ns2] of [['Chrysalis Chicky', 'Neo-Spacian Air Hummingbird'], ['Chrysalis Dolphin', 'Neo-Spacian Aqua Dolphin'], ['Chrysalis Larva', 'Neo-Spacian Flare Scarab'],
    ['Chrysalis Mole', 'Neo-Spacian Grand Mole'], ['Chrysalis Pantail', 'Neo-Spacian Dark Panther'], ['Chrysalis Pinny', 'Neo-Spacian Glow Moss']]) {
    const g0 = duel({ board: [{ hand: [], m: [ch], deckTop: [W, ns2], turn: 2 }, {}] });
    const noNS = !hasIgn(g0, on(g0, 0, ch));
    const g = duel({ board: [{ hand: ['Neo Space'], m: [ch], deckTop: [W, ns2], turn: 2 }, {}] });
    act(g, 0, 'Neo Space'); settle(g); toIdle(g);
    ign(g, on(g, 0, ch), ns2, 'Attack'); toIdle(g);
    ok(noNS && on(g, 0, ns2) && inZ(g, 0, 'gy', ch), `${ch}: ${ns2} summoned (needs Neo Space: ${noNS})`);
  }
});
T('Chthonian Alliance: +800 for each other face-up monster with the same name', () => {
  const g = duel({ board: [{ hand: ['Chthonian Alliance'], m: [W, W], turn: 2 }, { m: [W, CG] }] });
  act(g, 0, 'Chthonian Alliance'); settle(g, W); toIdle(g);
  const eq = mons(g, 0).find(c => c.u === card(g, 0, 'Chthonian Alliance').equipTo) || mons(g, 0).find(c => E.atk(g, c) > 2000);
  ok(eq && E.atk(g, eq) === 3600, `equipped Warwolf ATK ${eq && E.atk(g, eq)}`);
});
T('Chthonian Blast: own monster destroyed, destroy lowest ATK and burn both for half', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [CG, W], st: ['Chthonian Blast'] }, { hand: [], m: [BEWD, ELF], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, BEWD, CG, 'Chthonian Blast', ELF); toIdle(g, ELF);
  ok(inZ(g, 1, 'gy', ELF) && lp(g, 0) === 8000 - 1600 - 400 && lp(g, 1) === 7600, `Elf destroyed, A ${lp(g, 0)} B ${lp(g, 1)}`);
});
T('Chthonian Emperor Dragon: Gemini Summoned, attacks twice', () => {
  const g = duel({ board: [{ hand: [], m: ['Chthonian Emperor Dragon'], turn: 2 }, {}] });
  const c = on(g, 0, 'Chthonian Emperor Dragon');
  bp(g); atkOn(g, 0, 'Chthonian Emperor Dragon', null); toIdle(g);
  ok(!canAtk(g, c, null), 'no second attack as a Normal Monster');
  const g2 = duel({ board: [{ hand: [], m: ['Chthonian Emperor Dragon'], turn: 2 }, {}] });
  const c2 = on(g2, 0, 'Chthonian Emperor Dragon'); choose(g2, 'gem:' + c2.u); settle(g2); toIdle(g2);
  bp(g2); atkOn(g2, 0, 'Chthonian Emperor Dragon', null); atkOn(g2, 0, 'Chthonian Emperor Dragon', null);
  ok(lp(g2, 1) === 8000 - 4800, `two attacks after Gemini Summon (B ${lp(g2, 1)})`);
});
T('Chthonian Polymer: Tribute 1 to take the opponent Fusion Summoned monster', () => {
  const g = duel({ first: 1, ex1: ['Elemental HERO Flame Wingman'], board: [{ turn: 2, m: [W], st: ['Chthonian Polymer'] }, { hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'], turn: 2 }] });
  toIdle(g); act(g, 1, 'Polymerization'); settle(g, 'Flame Wingman', 'Avian', 'Burstinatrix', 'Attack', 'Chthonian Polymer', W); toIdle(g);
  ok(on(g, 0, 'Elemental HERO Flame Wingman') && inZ(g, 0, 'gy', W), 'A controls Flame Wingman, Warwolf Tributed');
});
T('Chthonian Soldier: the battle damage you took hits the opponent too', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Chthonian Soldier'] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, 'Chthonian Soldier', 'Chthonian Soldier'); toIdle(g);
  ok(lp(g, 0) === 7200 && lp(g, 1) === 7200, `A ${lp(g, 0)} B ${lp(g, 1)}`);
});

/* ---------------- Cloudians ---------------- */
T('Cloudian - Eye of the Typhoon: survives battle, flips positions on attack, dies in Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Cloudian - Eye of the Typhoon'], turn: 2 }, { m: [W, CG] }] });
  bp(g); atkOn(g, 0, 'Cloudian - Eye of the Typhoon', W); toIdle(g);
  ok(on(g, 1, CG) && on(g, 1, CG).pos === 'def' && inZ(g, 1, 'gy', W) && lp(g, 1) === 8000, `both changed to Defense, Warwolf destroyed (CG ${on(g, 1, CG) && on(g, 1, CG).pos}, B ${lp(g, 1)})`);
  const g2 = duel({ first: 1, board: [{ turn: 2, m: ['Cloudian - Eye of the Typhoon'] }, { hand: [], m: [BEWD], turn: 2 }] });
  toIdle(g2); bp(g2); atkOn(g2, 1, BEWD, 'Cloudian - Eye of the Typhoon'); toIdle(g2);
  ok(on(g2, 0, 'Cloudian - Eye of the Typhoon') && inZ(g2, 1, 'gy', BEWD), 'Eye survives a 3000 vs 3000 battle');
  const g3 = duel({ board: [{ hand: [], m: [dpos('Cloudian - Eye of the Typhoon')], turn: 2 }, {}] }); toIdle(g3);
  ok(inZ(g3, 0, 'gy', 'Cloudian - Eye of the Typhoon'), 'destroyed in face-up Defense');
});
T('Cloudian - Ghost Fog: no battle damage, Fog Counters by the killer Level', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Cloudian - Ghost Fog'] }] });
  bp(g); atkOn(g, 0, W, 'Cloudian - Ghost Fog', W, W, W, W); toIdle(g, W);
  ok(lp(g, 1) === 8000 && inZ(g, 1, 'gy', 'Cloudian - Ghost Fog') && ctrs(on(g, 0, W)) === 4, `B ${lp(g, 1)}, Warwolf counters ${ctrs(on(g, 0, W))}`);
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Cloudian - Ghost Fog'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be Special Summoned (no Reborn target)');
});
T('Cloudian - Nimbusman: Tribute 2 WATER, 2 Fog Counters, 2000 ATK; survives battle', () => {
  const g = duel({ board: [{ hand: ['Cloudian - Nimbusman'], m: ['Mother Grizzly', 'Mother Grizzly'], turn: 2 }, {}] });
  ns(g, 0, 'Cloudian - Nimbusman', '2 Tributes', 'Mother Grizzly', 'Attack'); toIdle(g);
  const n = on(g, 0, 'Cloudian - Nimbusman');
  ok(n && cnt(g, 0, 'gy', 'Mother Grizzly') === 2 && ctrs(n) === 2 && E.atk(g, n) === 2000, `Nimbusman ${n && ctrs(n)} counters, ATK ${n && E.atk(g, n)}`);
  const g2 = duel({ board: [{ hand: ['Cloudian - Nimbusman'], m: ['Mother Grizzly'], turn: 2 }, {}] });
  ns(g2, 0, 'Cloudian - Nimbusman', 'Mother Grizzly', 'Attack'); toIdle(g2);
  const n2 = on(g2, 0, 'Cloudian - Nimbusman'); ok(n2 && E.atk(g2, n2) === 1500, `1 Tribute: ATK ${n2 && E.atk(g2, n2)}`);
});
T('Cloudian - Poison Cloud: destroys its killer and burns 800', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Cloudian - Poison Cloud'] }] });
  bp(g); atkOn(g, 0, W, 'Cloudian - Poison Cloud', 'Poison Cloud'); toIdle(g, 'Poison Cloud');
  ok(inZ(g, 0, 'gy', W) && lp(g, 0) === 7200 && lp(g, 1) === 6000, `Warwolf destroyed, A ${lp(g, 0)} B ${lp(g, 1)}`);
});
T('Cloudian - Poison Cloud: no effect if it was face-down at the start of the Damage Step', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: [set('Cloudian - Poison Cloud')] }] });
  bp(g); atkOn(g, 0, W, 'Cloudian - Poison Cloud', 'Poison Cloud'); toIdle(g, 'Poison Cloud');
  ok(on(g, 0, W) && lp(g, 0) === 8000, 'Warwolf survives, no burn');
});
T('Cloudian - Sheep Cloud: 2 Cloudian Tokens in Defense', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Cloudian - Sheep Cloud'] }] });
  bp(g); atkOn(g, 0, W, 'Cloudian - Sheep Cloud', 'Sheep Cloud'); toIdle(g, 'Sheep Cloud');
  const tk = mons(g, 1).filter(c => E.name(c) === 'Cloudian Token');
  ok(tk.length === 2 && tk.every(c => c.pos === 'def'), `${tk.length} tokens in Defense`);
});
T('Cloudian - Storm Dragon: Special Summon by banishing a Cloudian, places Fog Counters once per turn', () => {
  const g = duel({ board: [{ hand: ['Cloudian - Storm Dragon'], gy: ['Cloudian - Sheep Cloud'], turn: 2 }, { m: [W] }] });
  const c = card(g, 0, 'Cloudian - Storm Dragon');
  ok(!hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && hasOpt(g, 'sp:' + c.u), 'Special Summon only');
  choose(g, 'sp:' + c.u); settle(g, 'Sheep Cloud', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Cloudian - Storm Dragon') && inZ(g, 0, 'ban', 'Cloudian - Sheep Cloud'), 'summoned, Sheep Cloud banished');
  ign(g, on(g, 0, 'Cloudian - Storm Dragon'), W); toIdle(g);
  ok(ctrs(on(g, 1, W)) === 1 && !hasIgn(g, on(g, 0, 'Cloudian - Storm Dragon')), 'Fog Counter placed, once per turn');
  const g2 = duel({ board: [{ hand: ['Cloudian - Storm Dragon'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Cloudian - Storm Dragon').u), 'no Cloudian in the GY, no summon');
});
T('Cloudian Squall: 1 Fog Counter on every face-up monster each of your Standby Phases', () => {
  const g = duel({ board: [{ hand: [], m: [W], st: [up('Cloudian Squall')], turn: 2 }, { m: [CG, set(ELF)] }] });
  toIdle(g, 'Squall');
  ok(ctrs(on(g, 0, W)) === 1 && ctrs(on(g, 1, CG)) === 1 && ctrs(on(g, 1, ELF)) === 0, 'face-up monsters got 1 each');
});
T('Colosseum: counter on a Special Summon from the Deck, Gladiator Beasts +100, discard to save it', () => {
  const g = duel({ board: [{ hand: ['Colosseum - Cage of the Gladiator Beasts', 'Colosseum - Cage of the Gladiator Beasts'], m: ['Gladiator Beast Laquari', 'Mystic Tomato'], deckTop: [W, 'Sangan'], turn: 2 }, { m: [W], hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Colosseum - Cage of the Gladiator Beasts'); settle(g); toIdle(g);
  const lq = on(g, 0, 'Gladiator Beast Laquari'); const a0 = E.atk(g, lq);
  bp(g); atkOn(g, 0, 'Mystic Tomato', W, 'Mystic Tomato', 'Sangan', 'Attack'); toIdle(g, 'Sangan', 'Attack');
  ok(on(g, 0, 'Sangan') && E.atk(g, lq) === a0 + 100 && E.def(g, lq) === 500, `Laquari ATK ${a0} -> ${E.atk(g, lq)}, DEF ${E.def(g, lq)}`);
  endTurn(g); toIdle(g); act(g, 1, 'Mystical Space Typhoon'); settle(g, 'Colosseum'); toIdle(g);
  ok(g.p[0].fz && E.name(g.p[0].fz) === 'Colosseum - Cage of the Gladiator Beasts' && inZ(g, 0, 'gy', 'Colosseum - Cage of the Gladiator Beasts'), 'Colosseum stays, the copy in hand discarded');
});

/* ---------------- Core / Counter ---------------- */
T('Core Blast: Standby, opponent destroys down to your monster count', () => {
  const g = duel({ board: [{ hand: [], m: [KMD], st: [up('Core Blast')], turn: 2 }, { m: [W, CG, ELF] }] });
  toIdle(g, 'Core Blast', CG, ELF);
  ok(cnt(g, 1, 'm') === 1, `B has ${cnt(g, 1, 'm')} monster(s)`);
  const g2 = duel({ board: [{ hand: [], m: [W], st: [up('Core Blast')], turn: 2 }, { m: [W, CG, ELF] }] });
  toIdle(g2, 'Core Blast', CG, ELF); ok(cnt(g2, 1, 'm') === 3, 'no Koa\'ki Meiru, nothing destroyed');
});
T('Core Blaster: destroys a LIGHT monster without damage calc, returns to hand', () => {
  const g = duel({ board: [{ hand: ['Core Blaster', 'Dark Hole'], m: [KMD], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Core Blaster'); settle(g, KMD); toIdle(g);
  bp(g); atkOn(g, 0, KMD, BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && on(g, 0, KMD) && lp(g, 0) === 8000, `BEWD destroyed, Drago survives, A ${lp(g, 0)}`);
  if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g); }
  act(g, 0, 'Dark Hole'); settle(g, 'Core Blaster'); toIdle(g, 'Core Blaster');
  ok(inZ(g, 0, 'hand', 'Core Blaster'), 'Core Blaster returned to hand');
});
T('Core Compression: reveal Iron Core, discard a Koa\'ki Meiru, draw 2', () => {
  const g = duel({ board: [{ hand: ['Core Compression', "Iron Core of Koa'ki Meiru", KMD], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Core Compression'); settle(g, "Iron Core", KMD); toIdle(g);
  ok(hand(g, 0) === h - 2 + 2 && inZ(g, 0, 'gy', KMD) && inZ(g, 0, 'hand', "Iron Core of Koa'ki Meiru"), `hand ${h} -> ${hand(g, 0)}`);
  const g2 = duel({ board: [{ hand: ['Core Compression', KMD], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Core Compression'), 'not without Iron Core');
});
T('Counter Cleaner: pay 500, remove all counters', () => {
  const g = duel({ board: [{ hand: ['Counter Cleaner'], m: [W], st: [up('Cloudian Squall')], turn: 2 }, { m: [CG] }] });
  toIdle(g, 'Squall'); ok(ctrs(on(g, 0, W)) === 1, 'counter placed first');
  act(g, 0, 'Counter Cleaner'); settle(g); toIdle(g);
  ok(ctrs(on(g, 0, W)) === 0 && ctrs(on(g, 1, CG)) === 0 && lp(g, 0) === 7500, `counters removed, A ${lp(g, 0)}`);
});
T('Counter Counter: negates a Counter Trap', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: ['Counter Counter'], turn: 2 }, { st: ['Solemn Judgment'] }] });
  const h = hand(g, 0); act(g, 0, 'Pot of Greed'); settle(g, 'Solemn Judgment', 'Counter Counter'); toIdle(g);
  ok(hand(g, 0) === h + 1 && inZ(g, 1, 'gy', 'Solemn Judgment') && inZ(g, 0, 'gy', 'Counter Counter'), `Pot resolved (hand ${h} -> ${hand(g, 0)})`);
});
T('Counter Gem: S/T to GY, Crystal Beasts from GY placed, destroyed at End Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Counter Gem', 'Mirror Force'], gy: [RUBY, TOPAZ], turn: 2 }, {}] });
  act(g, 0, 'Counter Gem'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Mirror Force') && inZ(g, 0, 'st', RUBY) && inZ(g, 0, 'st', TOPAZ), 'Mirror Force sent, 2 Crystal Beasts placed');
  endTurn(g);
  ok(inZ(g, 0, 'gy', RUBY) && inZ(g, 0, 'gy', TOPAZ) && !inZ(g, 0, 'st', RUBY), 'Crystal Beasts destroyed at End Phase');
});

/* ---------------- Crystal ---------------- */
T('Crystal Abundance: send 4 Crystal Beasts, wipe the field, summon up to the opponent count', () => {
  const g = duel({ board: [{ hand: ['Crystal Abundance'], st: ['Counter Gem'], m: [W], gy: [RUBY, TOPAZ, PEG, AMB], turn: 2 }, { m: [CG, ELF] }] });
  act(g, 0, 'Counter Gem'); settle(g); toIdle(g);
  ok(cnt(g, 0, 'st') === 4, `4 Crystal Beasts placed (${cnt(g, 0, 'st')})`);
  act(g, 0, 'Crystal Abundance'); settle(g, RUBY, TOPAZ, 'Attack'); toIdle(g, RUBY, TOPAZ, 'Attack');
  ok(cnt(g, 1, 'm') === 0 && inZ(g, 1, 'gy', CG) && inZ(g, 0, 'gy', W) && mons(g, 0).length === 2 && mons(g, 0).every(c => E.name(c).startsWith('Crystal Beast')), `B field cleared, A has ${mons(g, 0).map(E.name).join(', ')}`);
});
T('Crystal Beast Amethyst Cat: half damage directly, placed in S/T when destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Crystal Beast Amethyst Cat'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Crystal Beast Amethyst Cat', null); toIdle(g);
  ok(lp(g, 1) === 7400, `B ${lp(g, 1)}`);
  const g3 = duel({ board: [{ hand: [], m: ['Crystal Beast Amethyst Cat'], turn: 2 }, {}] });
  bp(g3); atkOn(g3, 0, 'Crystal Beast Amethyst Cat', null); toIdle(g3);
  ok(lp(g3, 1) === 6800, `full damage with no opponent monsters (B ${lp(g3, 1)})`);
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Crystal Beast Amethyst Cat'], turn: 2 }, {}] });
  act(g2, 0, 'Dark Hole'); settle(g2, 'Amethyst'); toIdle(g2, 'Amethyst');
  ok(inZ(g2, 0, 'st', 'Crystal Beast Amethyst Cat'), 'placed in the Spell & Trap Zone');
});
T('Crystal Beast Cobalt Eagle: return a Crystal Beast to the top of the Deck, once per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Crystal Beast Cobalt Eagle', TOPAZ, 'Crystal Beast Amethyst Cat'], turn: 2 }, {}] });
  const e = on(g, 0, 'Crystal Beast Cobalt Eagle'); ign(g, e, TOPAZ); toIdle(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === TOPAZ && !hasIgn(g, e), 'Topaz on top of the Deck, once per turn');
});
T('Crystal Beast Emerald Tortoise: a monster that attacked goes to Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Crystal Beast Emerald Tortoise', W], turn: 2 }, {}] });
  const t = on(g, 0, 'Crystal Beast Emerald Tortoise');
  ok(!hasIgn(g, t), 'no target before attacks');
  bp(g); atkOn(g, 0, W, null); choose(g, 'endbp'); settle(g);
  ign(g, t, W); toIdle(g);
  ok(on(g, 0, W).pos === 'def', `Warwolf ${on(g, 0, W).pos}`);
});
T('Crystal Pair: places a Crystal Beast from the Deck, no more battle damage this turn', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [TOPAZ], st: ['Crystal Pair'], deckTop: [RUBY] }, { hand: [], m: [W, W], turn: 2 }] });
  toIdle(g); bp(g); const [w1, w2] = mons(g, 1);
  choose(g, `atk:${w1.u}:${on(g, 0, TOPAZ).u}`); settle(g, 'Crystal Pair', RUBY);
  ok(inZ(g, 0, 'st', RUBY) && lp(g, 0) === 7600, `Ruby placed, A ${lp(g, 0)}`);
  choose(g, `atk:${w2.u}:d`); settle(g);
  ok(lp(g, 0) === 7600, `no damage from the second attack (${lp(g, 0)})`);
});
T('Crystal Promise: Special Summon a Crystal Beast from the Spell & Trap Zone', () => {
  const g = duel({ board: [{ hand: ['Crystal Promise'], st: ['Counter Gem'], gy: [TOPAZ], turn: 2 }, {}] });
  act(g, 0, 'Counter Gem'); settle(g); toIdle(g);
  act(g, 0, 'Crystal Promise'); settle(g, TOPAZ, 'Attack'); toIdle(g);
  ok(on(g, 0, TOPAZ), 'Topaz Tiger Special Summoned');
});

/* ---------------- Cyberdark ---------------- */
T('Cyberdark Dragon: Fusion, equips a Dragon, +its ATK +100 per GY monster', () => {
  const g = duel({ ex0: ['Cyberdark Dragon'], board: [{ hand: ['Polymerization', 'Cyberdark Horn', 'Cyberdark Edge', 'Cyberdark Keel'], gy: [BEWD], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Cyberdark Dragon', 'Horn', 'Edge', 'Keel', 'Attack', BEWD); toIdle(g, BEWD);
  const d = on(g, 0, 'Cyberdark Dragon');
  ok(d && inZ(g, 0, 'st', BEWD) && E.atk(g, d) === 1000 + 3000 + 300, `Cyberdark Dragon ATK ${d && E.atk(g, d)}`);
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Cyberdark Dragon'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be revived');
});
T('Cyberdark Edge: equips, direct attack at half ATK, equip dies instead', () => {
  const g = duel({ board: [{ hand: ['Cyberdark Edge'], gy: ['Masked Dragon'], turn: 2 }, { m: [W] }] });
  ns(g, 0, 'Cyberdark Edge', 'Masked Dragon'); toIdle(g, 'Masked Dragon');
  const e = on(g, 0, 'Cyberdark Edge'); ok(E.atk(g, e) === 2200, `Edge ATK ${E.atk(g, e)}`);
  bp(g); ok(canAtk(g, e, null), 'direct attack'); atkOn(g, 0, 'Cyberdark Edge', null); toIdle(g);
  ok(lp(g, 1) === 6900, `B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Cyberdark Edge'], gy: ['Masked Dragon'], turn: 2 }, { m: [BEWD] }] });
  ns(g2, 0, 'Cyberdark Edge', 'Masked Dragon'); toIdle(g2, 'Masked Dragon');
  bp(g2); atkOn(g2, 0, 'Cyberdark Edge', BEWD, 'NO'); toIdle(g2, 'NO');
  ok(on(g2, 0, 'Cyberdark Edge') && inZ(g2, 0, 'gy', 'Masked Dragon') && lp(g2, 0) === 7200, `Edge stays, Masked Dragon destroyed, A ${lp(g2, 0)}`);
});
T('Cyberdark Horn: equips and pierces', () => {
  const g = duel({ board: [{ hand: ['Cyberdark Horn'], gy: ['Masked Dragon'], turn: 2 }, { m: [set(W)] }] });
  ns(g, 0, 'Cyberdark Horn', 'Masked Dragon'); toIdle(g, 'Masked Dragon');
  bp(g); atkOn(g, 0, 'Cyberdark Horn', W); toIdle(g);
  ok(lp(g, 1) === 8000 - 2100, `B ${lp(g, 1)}`);
});
T('Cyberdark Keel: equips, 300 damage when it destroys a monster', () => {
  const g = duel({ board: [{ hand: ['Cyberdark Keel'], gy: ['Masked Dragon'], turn: 2 }, { m: [W] }] });
  ns(g, 0, 'Cyberdark Keel', 'Masked Dragon'); toIdle(g, 'Masked Dragon');
  bp(g); atkOn(g, 0, 'Cyberdark Keel', W, 'Keel'); toIdle(g, 'Keel');
  ok(lp(g, 1) === 8000 - 200 - 300 && inZ(g, 1, 'gy', W), `B ${lp(g, 1)}`);
});
T('Cyberdark Impact!: materials from hand, GY and field go to the Deck', () => {
  const g = duel({ ex0: ['Cyberdark Dragon'], board: [{ hand: ['Cyberdark Impact!', 'Cyberdark Horn'], m: ['Cyberdark Keel'], gy: ['Cyberdark Edge', BEWD], turn: 2 }, {}] });
  act(g, 0, 'Cyberdark Impact!'); settle(g, 'Cyberdark Dragon', 'Horn', 'Edge', 'Keel', 'Attack', BEWD); toIdle(g, BEWD);
  const deckN = n => g.p[0].deck.some(c => E.name(c) === n);
  ok(on(g, 0, 'Cyberdark Dragon') && deckN('Cyberdark Horn') && deckN('Cyberdark Edge') && deckN('Cyberdark Keel'), 'Cyberdark Dragon summoned, materials in the Deck');
});
T('Cybernetic Cyclopean: +1000 with an empty hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Cybernetic Cyclopean'], turn: 2 }, {}] });
  const c = on(g, 0, 'Cybernetic Cyclopean'); const a1 = E.atk(g, c);
  ns(g, 0, W); toIdle(g);
  ok(a1 === 1400 && E.atk(g, c) === 2400, `ATK ${a1} with 1 card, ${E.atk(g, c)} with none`);
});
T('Cybernetic Hidden Technology: send Cyber Dragon, destroy the attacker', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Cyber Dragon'], st: [up('Cybernetic Hidden Technology')] }, { hand: [], m: [BEWD], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, BEWD, 'Cyber Dragon', 'Hidden Technology', 'Cyber Dragon'); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && inZ(g, 0, 'gy', 'Cyber Dragon') && lp(g, 0) === 8000, 'BEWD destroyed, Cyber Dragon sent');
});
T('Cybernetic Magician: discard 1, target ATK becomes 2000 until End Phase', () => {
  const g = duel({ board: [{ hand: [W], m: ['Cybernetic Magician'], turn: 2 }, { m: [BEWD] }] });
  ign(g, on(g, 0, 'Cybernetic Magician'), W, BEWD); toIdle(g);
  ok(E.atk(g, on(g, 1, BEWD)) === 2000 && hand(g, 0) === 1, `BEWD ATK ${E.atk(g, on(g, 1, BEWD))}, hand ${hand(g, 0)}`);
  endTurn(g); ok(E.atk(g, on(g, 1, BEWD)) === 3000, 'back to 3000');
});
T('Cybernetic Zone: banish a Machine Fusion, back at End Phase with double ATK, destroyed next Standby', () => {
  const g = duel({ board: [{ hand: ['Cybernetic Zone'], m: ['Cyber Twin Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Cybernetic Zone'); settle(g, 'Cyber Twin'); toIdle(g);
  ok(inZ(g, 0, 'ban', 'Cyber Twin Dragon'), 'banished');
  endTurn(g); toIdle(g); const c = on(g, 0, 'Cyber Twin Dragon');
  ok(c && E.atk(g, c) === 5600, `returned with ATK ${c && E.atk(g, c)}`);
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Twin Dragon'), 'destroyed in the next Standby Phase');
});

/* ---------------- D - ---------------- */
T('D - Chain: +500, 500 damage when it destroys a monster', () => {
  const g = duel({ board: [{ hand: [], m: [DD], st: ['D - Chain'], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'D - Chain'); settle(g, DD); toIdle(g);
  ok(E.atk(g, on(g, 0, DD)) === 1900, `Dude ATK ${E.atk(g, on(g, 0, DD))}`);
  bp(g); atkOn(g, 0, DD, CG, 'D - Chain'); toIdle(g, 'D - Chain');
  ok(lp(g, 1) === 8000 - 500 - 500, `B ${lp(g, 1)}`);
});
T('D - Counter: a Destiny HERO is attacked, destroy the attacker', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [DD], st: ['D - Counter'] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, DD, 'D - Counter'); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && on(g, 0, DD) && lp(g, 0) === 8000, 'Warwolf destroyed');
});
T('D - Formation: D Counters on destroyed D-HEROes, adds 2 copies on a summon', () => {
  const g = duel({ board: [{ hand: ['Dark Hole', DD], m: [DD, 'Destiny HERO - Doom Lord'], st: [up('D - Formation')], gy: [DD], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(ctrs(card(g, 0, 'D - Formation')) === 2, `2 D Counters (${ctrs(card(g, 0, 'D - Formation'))})`);
  const h = cnt(g, 0, 'hand', DD); ns(g, 0, DD, 'D - Formation', DD, DD); toIdle(g, 'D - Formation', DD, DD);
  ok(inZ(g, 0, 'gy', 'D - Formation') && cnt(g, 0, 'hand', DD) === h - 1 + 2, `2 Diamond Dudes added (hand ${cnt(g, 0, 'hand', DD)})`);
});
T('D - Fortune: banish a D-HERO, end the Battle Phase on a direct attack', () => {
  const g = duel({ first: 1, board: [{ turn: 2, st: ['D - Fortune'], gy: [DD] }, { hand: [], m: [W, CG], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, null, 'D - Fortune', DD); toIdle(g);
  ok(lp(g, 0) === 8000 && inZ(g, 0, 'ban', DD) && !(g.prompt && g.prompt.type === 'battle' && canAtk(g, on(g, 1, CG), null)), `no damage, Battle Phase over (A ${lp(g, 0)})`);
});
T('D - Shield: to Defense, equipped, cannot be destroyed by battle', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [DD], st: ['D - Shield'] }, { hand: [], m: [BEWD], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, BEWD, DD, 'D - Shield', DD); toIdle(g);
  const d = on(g, 0, DD);
  ok(d && d.pos === 'def' && inZ(g, 0, 'st', 'D - Shield') && lp(g, 0) === 8000, `Dude survives in ${d && d.pos}, A ${lp(g, 0)}`);
});
T('D - Spirit: Special Summon a Level 4 or lower D-HERO from hand', () => {
  const g = duel({ board: [{ hand: ['D - Spirit', DD], turn: 2 }, {}] });
  act(g, 0, 'D - Spirit'); settle(g, DD, 'Attack'); toIdle(g);
  ok(on(g, 0, DD), 'Diamond Dude Special Summoned');
  const g2 = duel({ board: [{ hand: ['D - Spirit', DD], m: ['Destiny HERO - Doom Lord'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'D - Spirit'), 'not while you control a face-up D-HERO');
});
T('D - Time: an E-HERO leaves, add a D-HERO of that Level or lower', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Elemental HERO Clayman'], st: ['D - Time'], deckTop: [W, DD, 'Destiny HERO - Dasher'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g, 'D - Time', DD); toIdle(g, 'D - Time', DD);
  ok(inZ(g, 0, 'hand', DD) && inZ(g, 0, 'gy', 'D - Time'), 'Diamond Dude added');
});

console.log(fails ? `\n${fails} failed` : '\nAll full-30 review checks passed.');
process.exit(fails ? 1 : 0);
