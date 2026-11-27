// Independent review checks for full pool batch 36 (written from the card text): node build/review_full-36.js
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
const ign = (g, c, ...picks) => { const o = optsFor(g, c).find(x => x.key.startsWith('a:')); if (!o) throw new Error('no effect option for ' + E.name(c)); E.act(g, [o.key]); settle(g, ...picks); };
const hasIgn = (g, c) => optsFor(g, c).some(x => x.key.startsWith('a:'));
const mons = (g, p) => g.p[p].m.filter(Boolean);
const W = FILL, CG = 'Celtic Guardian', ELF = 'Mystical Elf', BEWD = 'Blue-Eyes White Dragon';
const set = n => ({ n, pos: 'set' }), dpos = n => ({ n, pos: 'def' });
const ctrs = c => c && c.ctr ? Object.values(c.ctr).reduce((a, b) => a + (+b || 0), 0) : 0;
const stOf = (g, p) => g.p[p].st.filter(Boolean);
const roll = (g, n) => { g.rnd = () => (n - 0.5) / 6; };
const GSS = 'Giant Soldier of Stone'; // EARTH Rock L3 1300/2000

/* ---------------- B ---------------- */
T('Broken Bamboo Sword: equips with no ATK change', () => {
  const g = duel({ board: [{ hand: ['Broken Bamboo Sword'], m: [W], turn: 2 }, {}] });
  act(g, 0, 'Broken Bamboo Sword'); settle(g, W); toIdle(g);
  const s = card(g, 0, 'Broken Bamboo Sword');
  ok(s && s.zone === 'st' && s.equipTo === on(g, 0, W).u && E.atk(g, on(g, 0, W)) === 2000, 'equipped, Warwolf still 2000');
});
T('Broken Blocker: Special Summons 2 copies when a high-DEF Defense monster dies', () => {
  const g = duel({ board: [{ hand: [], m: [BEWD], turn: 2 }, { m: [dpos(GSS)], st: ['Broken Blocker'], deckTop: [GSS, GSS] }] });
  bp(g); atkOn(g, 0, BEWD, GSS, 'Broken Blocker', GSS, GSS); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Broken Blocker') && mons(g, 1).filter(c => E.name(c) === GSS && c.pos === 'def').length === 2, `2 Giant Soldiers in Defense (B monsters ${mons(g, 1).map(c => E.name(c) + ':' + c.pos)})`);
});
T('Broww: draws 1 on own discard, 2 when the opponent discards it', () => {
  const g = duel({ board: [{ hand: ['Graceful Charity', 'Broww, Huntsman of Dark World', W, W], turn: 2 }, {}] });
  act(g, 0, 'Graceful Charity'); settle(g, 'Broww, Huntsman of Dark World', W); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Broww, Huntsman of Dark World') && hand(g, 0) === 6, `own discard: hand ${hand(g, 0)} (expected 6: 5, -1, +3, -2, +1)`);
  const g2 = duel({ board: [{ hand: ['Card Destruction'], turn: 2 }, { hand: ['Broww, Huntsman of Dark World', W] }] });
  act(g2, 0, 'Card Destruction'); settle(g2); toIdle(g2);
  ok(inZ(g2, 1, 'gy', 'Broww, Huntsman of Dark World') && hand(g2, 1) === 4, `opponent discard: B hand ${hand(g2, 1)} (expected 4)`);
});
T('Brron: may discard 1 after battle damage', () => {
  const g = duel({ board: [{ hand: [CG], m: ['Brron, Mad King of Dark World'], turn: 2 }, {}] });
  const h0 = hand(g, 0); bp(g); atkOn(g, 0, 'Brron, Mad King of Dark World', null, CG);
  ok(lp(g, 1) === 6200 && hand(g, 0) === h0 - 1, `1800 damage, discarded 1 (hand ${h0} -> ${hand(g, 0)})`);
});
T('Brutal Potion: equips and gives 1000 ATK on effect damage', () => {
  const g = duel({ board: [{ hand: ['Ookazi'], m: [W], st: ['Brutal Potion'], turn: 2 }, {}] });
  act(g, 0, 'Brutal Potion'); settle(g, W); toIdle(g);
  const bpc = card(g, 0, 'Brutal Potion');
  ok(bpc && bpc.zone === 'st' && bpc.equipTo === on(g, 0, W).u, 'Brutal Potion is equipped');
  act(g, 0, 'Ookazi'); settle(g); toIdle(g);
  ok(lp(g, 1) === 7200 && E.atk(g, on(g, 0, W)) === 3000, `Ookazi 800, Warwolf ${E.atk(g, on(g, 0, W))}`);
  endTurn(g); ok(E.atk(g, on(g, 0, W)) === 2000, 'back to 2000 after the End Phase');
});
T('Burden of the Mighty: opponent monsters lose 100 x Level', () => {
  const g = duel({ board: [{ hand: ['Burden of the Mighty'], m: [W], turn: 2 }, { m: [W, BEWD] }] });
  act(g, 0, 'Burden of the Mighty'); settle(g); toIdle(g);
  ok(E.atk(g, on(g, 1, W)) === 1600 && E.atk(g, on(g, 1, BEWD)) === 2200 && E.atk(g, on(g, 0, W)) === 2000, 'B Warwolf 1600, BEWD 2200, A unchanged');
});
T('By Order of the Emperor: negates a Normal Summon trigger, that player draws', () => {
  const g = duel({ board: [{ hand: ['Breaker the Magical Warrior'], turn: 2 }, { st: [up('By Order of the Emperor')] }] });
  const h = hand(g, 0); ns(g, 0, 'Breaker the Magical Warrior', 'By Order of the Emperor'); toIdle(g);
  const b = on(g, 0, 'Breaker the Magical Warrior');
  ok(b && ctrs(b) === 0 && hand(g, 0) === h, `Breaker got no counter, A drew 1 (hand ${h - 1} after summon -> ${hand(g, 0)})`);
});
T('Byroad Sacrifice: Special Summons Cyber Ogre after a battle loss', () => {
  const g = duel({ board: [{ hand: [], m: [BEWD], turn: 2 }, { hand: ['Cyber Ogre'], m: [W], st: ['Byroad Sacrifice'] }] });
  bp(g); atkOn(g, 0, BEWD, W, 'Byroad Sacrifice', 'Cyber Ogre'); toIdle(g);
  ok(!!on(g, 1, 'Cyber Ogre'), 'Cyber Ogre on B field');
});

/* ---------------- C ---------------- */
T('Cactus Bouncer: no Special Summons while another Plant is on the field', () => {
  const g = duel({ board: [{ hand: ['Sangan', 'Cactus Bouncer'], m: ['Cactus Bouncer'], turn: 2 }, { hand: ['Sangan'], m: ['Copy Plant'] }] });
  const fb = (p) => E.lib.forbid(g, { type: 'ss', c: g.p[p].hand.find(c => E.name(c) === 'Sangan'), p, how: 'special' });
  ok(fb(0) && fb(1), 'both players blocked');
  const g2 = duel({ board: [{ hand: ['Sangan'], m: ['Cactus Bouncer'], turn: 2 }, { hand: ['Sangan'] }] });
  ok(!E.lib.forbid(g2, { type: 'ss', c: g2.p[0].hand[0], p: 0, how: 'special' }), 'no other Plant: Special Summons allowed');
  const g3 = duel({ board: [{ hand: ['Cactus Bouncer'], turn: 2 }, {}] });
  ok(E.lib.forbid(g3, { type: 'ss', c: g3.p[0].hand[0], p: 0, how: 'special' }), 'Cactus Bouncer itself cannot be Special Summoned');
  ok(hasOpt(g3, 'ns:' + g3.p[0].hand[0].u), 'can be Normal Summoned');
});
T('Cactus Fighter: gives the opponent a Needle Token in Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Cactus Fighter'], turn: 2 }, { m: [CG] }] });
  bp(g); atkOn(g, 0, 'Cactus Fighter', CG); toIdle(g);
  const t = on(g, 1, 'Needle Token');
  ok(t && t.pos === 'def' && E.atk(g, t) === 500 && E.def(g, t) === 500, 'Needle Token 500/500 in Defense on B field');
});
T('Calming Magic: no Summons this turn', () => {
  const g = duel({ board: [{ hand: ['Calming Magic', W], turn: 2 }, {}] });
  act(g, 0, 'Calming Magic'); settle(g); toIdle(g);
  ok(!hasOpt(g, 'ns:' + card(g, 0, W).u) && !hasOpt(g, 'set:' + card(g, 0, W).u), 'cannot Normal Summon or Set');
});
T('Cannon Soldier MK-2: Tribute 2 for 1500 damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Cannon Soldier MK-2', W, CG], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Cannon Soldier MK-2'), W, CG); toIdle(g);
  ok(lp(g, 1) === 6500 && inZ(g, 0, 'gy', W) && inZ(g, 0, 'gy', CG), `1500 damage (B ${lp(g, 1)})`);
});
T('Canyon: doubles damage to the attacker of a Defense Rock', () => {
  const g = duel({ board: [{ hand: ['Canyon'], m: [CG], turn: 2 }, { m: [dpos(GSS)] }] });
  act(g, 0, 'Canyon'); settle(g); toIdle(g); bp(g); atkOn(g, 0, CG, GSS);
  ok(lp(g, 0) === 6800, `A took 1200 (LP ${lp(g, 0)})`);
});
T('Carrierroid: discard to negate a targeted destroy', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], turn: 2 }, { hand: [W], m: ['Carrierroid'], st: ['Mirror Force'] }] });
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Face-down', 'Carrierroid', W); toIdle(g);
  ok(inZ(g, 1, 'st', 'Mirror Force') && inZ(g, 1, 'gy', W) && inZ(g, 0, 'gy', 'Mystical Space Typhoon'), 'Mirror Force survives, B discarded');
});
T('Catoblepas: banish a ? ATK monster to destroy a Special Summoned monster', () => {
  const g = duel({ board: [{ hand: [], gy: [W], turn: 2 }, { m: ['Catoblepas and the Witch of Fate'], gy: ['Chaos Necromancer'], hand: ['Monster Reborn'] }] });
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: [BEWD], turn: 2 }, { m: ['Catoblepas and the Witch of Fate'], gy: ['Chaos Necromancer'] }] });
  act(g2, 0, 'Monster Reborn'); settle(g2, BEWD, 'Catoblepas and the Witch of Fate'); toIdle(g2, 'Catoblepas and the Witch of Fate');
  ok(inZ(g2, 0, 'gy', BEWD) && inZ(g2, 1, 'ban', 'Chaos Necromancer'), 'BEWD destroyed, Chaos Necromancer banished');
});
T('Celestial Transformation: Fairy at half ATK, destroyed at End Phase', () => {
  const g = duel({ board: [{ hand: ['Celestial Transformation', 'Shining Angel'], turn: 2 }, {}] });
  act(g, 0, 'Celestial Transformation'); settle(g, 'Shining Angel'); toIdle(g);
  const s = on(g, 0, 'Shining Angel');
  ok(s && E.atk(g, s) === 700, 'Shining Angel 700 ATK');
  endTurn(g, 'NO'); ok(inZ(g, 0, 'gy', 'Shining Angel'), 'destroyed in the End Phase');
});
T('Cell Explosion Virus: destroys Attack Position monsters when an A-Counter monster attacks', () => {
  const g = duel({ board: [{ hand: [], m: [W, CG, dpos(ELF)], turn: 2 }, { st: ['Cell Explosion Virus'] }] });
  E.lib.addCtr(g, on(g, 0, W), 'A', 1);
  bp(g); atkOn(g, 0, W, null, 'Cell Explosion Virus'); toIdle(g);
  ok(inZ(g, 0, 'gy', W) && inZ(g, 0, 'gy', CG) && !!on(g, 0, ELF), 'Warwolf and Celtic destroyed, Defense Elf stays');
});
T('Chainsaw Insect: opponent draws 1 after its battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Chainsaw Insect'], turn: 2 }, { m: [W] }] });
  const h = hand(g, 1); bp(g); atkOn(g, 0, 'Chainsaw Insect', W); toIdle(g);
  ok(hand(g, 1) === h + 1 && inZ(g, 1, 'gy', W), `B drew 1 (${h} -> ${hand(g, 1)})`);
});
T('Changing Destiny: negates, Defense Position, opponent picks LP gain', () => {
  const g = duel({ board: [{ hand: [], m: [BEWD], turn: 2 }, { st: ['Changing Destiny'] }] });
  bp(g); choose(g, `atk:${on(g, 0, BEWD).u}:d`);
  settle(g, 'Changing Destiny');
  if (g.prompt && g.prompt.type === 'choose') choose(g, 'gain');
  toIdle(g);
  const b = on(g, 0, BEWD);
  ok(b && b.pos === 'def' && lp(g, 1) === 8000 && lp(g, 0) === 9500, `BEWD in Defense, A gained 1500 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  ok(E.lib.forbid(g, { type: 'pos', c: b }), 'BEWD cannot change position');
});
T('Chimera: Fusion Summon, and revives Gazelle when destroyed', () => {
  const g = duel({ ex0: ['Chimera the Flying Mythical Beast'], board: [{ hand: ['Polymerization', 'Gazelle the King of Mythical Beasts', 'Berfomet'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Chimera the Flying Mythical Beast', 'Gazelle the King of Mythical Beasts', 'Berfomet', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Chimera the Flying Mythical Beast'), 'Chimera Fusion Summoned');
  const g2 = duel({ board: [{ hand: [], m: ['Chimera the Flying Mythical Beast'], gy: ['Gazelle the King of Mythical Beasts'], turn: 2 }, { m: [BEWD] }] });
  bp(g2); atkOn(g2, 0, 'Chimera the Flying Mythical Beast', BEWD, 'Gazelle'); toIdle(g2, 'Gazelle');
  ok(!!on(g2, 0, 'Gazelle the King of Mythical Beasts'), 'Gazelle Special Summoned from the GY');
});
T('Clay Charge: destroys the attacker and Clayman, 800 damage', () => {
  const g = duel({ board: [{ hand: [], m: [BEWD], turn: 2 }, { m: [dpos('Elemental HERO Clayman')], st: ['Clay Charge'] }] });
  bp(g); atkOn(g, 0, BEWD, 'Elemental HERO Clayman', 'Clay Charge'); toIdle(g);
  ok(inZ(g, 0, 'gy', BEWD) && inZ(g, 1, 'gy', 'Elemental HERO Clayman') && lp(g, 0) === 7200, `both destroyed, A LP ${lp(g, 0)}`);
});
T('Clear World: FIRE burns 1000 at the End Phase, maintenance 500', () => {
  const g = duel({ board: [{ hand: ['Clear World'], m: ['Elemental HERO Burstinatrix'], turn: 2 }, {}] });
  act(g, 0, 'Clear World'); settle(g); toIdle(g); endTurn(g);
  ok(lp(g, 0) === 6500 && g.p[0].fz && E.name(g.p[0].fz) === 'Clear World', `A paid 500 and took 1000 (LP ${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Clear World'], m: ['Sangan', 'Dark Elf'], turn: 2 }, {}] });
  act(g2, 0, 'Clear World'); settle(g2); toIdle(g2); choose(g2, 'bp'); settle(g2);
  ok(!hasOpt(g2, 'atk:'), 'DARK: 2 monsters, no attacks');
});
T('Clock Tower Prison: counters, no battle damage at 4, Dreadmaster when destroyed', () => {
  const g = duel({ board: [{ hand: ['Clock Tower Prison'], deckTop: [W, 'Destiny HERO - Dreadmaster'], turn: 2 }, { hand: ['Mystical Space Typhoon'], m: [BEWD] }] });
  act(g, 0, 'Clock Tower Prison'); settle(g); toIdle(g); endTurn(g); toIdle(g);
  const ct = g.p[0].fz;
  ok(ct && ctrs(ct) === 1, `1 counter after B's Standby Phase (${ct && ctrs(ct)})`);
  for (let i = 0; i < 3; i++) E.lib.addCtr(g, ct, Object.keys(ct.ctr)[0], 1); ct.flags.clock = 4; // the same as 3 more of B's Standby Phases
  bp(g); atkOn(g, 1, BEWD, null); toIdle(g);
  ok(lp(g, 0) === 8000, `no battle damage at 4 counters (A ${lp(g, 0)})`);
  if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g); }
  act(g, 1, 'Mystical Space Typhoon'); settle(g, 'Clock Tower Prison', 'Destiny HERO - Dreadmaster'); toIdle(g, 'Destiny HERO - Dreadmaster');
  ok(!!on(g, 0, 'Destiny HERO - Dreadmaster'), 'Dreadmaster Special Summoned');
});
T('Cloning: Clone Token copies the summoned monster', () => {
  const g = duel({ board: [{ hand: [BEWD, W, W], m: [W, W], turn: 2 }, { st: ['Cloning'] }] });
  ns(g, 0, BEWD, W, 'Cloning'); toIdle(g, 'Cloning');
  const t = on(g, 1, 'Clone Token');
  ok(t && E.atk(g, t) === 3000 && E.def(g, t) === 2500 && LV(t) === 8, 'Clone Token 3000/2500 Level 8');
});
T('Cold Enchanter: discard to place an Ice Counter, gains 300', () => {
  const g = duel({ board: [{ hand: [CG], m: ['Cold Enchanter'], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, 'Cold Enchanter'), CG, W); toIdle(g);
  ok(ctrs(on(g, 1, W)) === 1 && E.atk(g, on(g, 0, 'Cold Enchanter')) === 1900 && inZ(g, 0, 'gy', CG), 'Ice Counter placed, 1900 ATK');
});
T('Colossal Fighter Assault Mode: no Normal Summon, opponent loses 100 per Warrior in GY', () => {
  const g = duel({ board: [{ hand: ['Colossal Fighter Assault Mode'], m: ['Colossal Fighter Assault Mode'], gy: [CG, CG, W], turn: 2 }, { m: [W] }] });
  ok(noSummon(g, g.p[0].hand[0]), 'cannot be Normal Summoned or Set');
  ok(E.atk(g, on(g, 1, W)) === 1800, `B Warwolf ${E.atk(g, on(g, 1, W))} (expected 1800)`);
});
for (const cf of ['Combo Fighter', 'Combo Master']) T(cf + ': attacks twice after a 2-link chain in Main Phase 1', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [cf], st: ['Dust Tornado'], turn: 2 }, { st: ['Mystical Space Typhoon'] }] });
  const g0 = duel({ board: [{ hand: [], m: [cf], turn: 2 }, {}] });
  bp(g0); atkOn(g0, 0, cf, null); ok(!canAtk(g0, on(g0, 0, cf), null), 'no chain: only one attack');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Mystical Space Typhoon', 'Dust Tornado'); toIdle(g);
  bp(g); atkOn(g, 0, cf, null);
  ok(on(g, 0, cf) && canAtk(g, on(g, 0, cf), null), 'after a chain: second attack offered');
});
T('Command Knight: Warriors +400, cannot be attacked with another monster', () => {
  const g = duel({ board: [{ hand: [], m: [BEWD], turn: 2 }, { m: ['Command Knight', CG] }] });
  ok(E.atk(g, on(g, 1, 'Command Knight')) === 1600 && E.atk(g, on(g, 1, CG)) === 1800, 'Command Knight 1600, Celtic 1800');
  bp(g); ok(!canAtk(g, on(g, 0, BEWD), on(g, 1, 'Command Knight')) && canAtk(g, on(g, 0, BEWD), on(g, 1, CG)), 'only Celtic can be attacked');
});
T('Commander Covington: send the three Machinas, Special Summon Machina Force', () => {
  const g = duel({ board: [{ hand: [], m: ['Commander Covington', 'Machina Soldier', 'Machina Sniper', 'Machina Defender'], deckTop: [W, 'Machina Force'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Commander Covington')); toIdle(g);
  ok(!!on(g, 0, 'Machina Force') && inZ(g, 0, 'gy', 'Machina Soldier') && inZ(g, 0, 'gy', 'Machina Sniper') && inZ(g, 0, 'gy', 'Machina Defender'), 'Machina Force summoned, three Machinas in the GY');
});
T('Commander Gottoms: Saber monsters +400', () => {
  const g = duel({ board: [{ hand: [], m: ['Commander Gottoms, Swordmaster', 'Saber Beetle', W], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Saber Beetle')) === 2800 && E.atk(g, on(g, 0, W)) === 2000, `Saber Beetle ${E.atk(g, on(g, 0, 'Saber Beetle'))}`);
});
T('Common Charity: draw 2, banish a Normal Monster', () => {
  const g = duel({ board: [{ hand: [W, 'Sangan'], st: ['Common Charity'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Common Charity'); settle(g, W); toIdle(g);
  ok(hand(g, 0) === h + 1 && cnt(g, 0, 'ban', W) === 1, `drew 2, banished a Warwolf (hand ${h} -> ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Sangan'], st: ['Common Charity'], deckTop: ['Sangan', 'Pot of Greed', 'Sangan'], turn: 2 }, {}] });
  act(g2, 0, 'Common Charity'); settle(g2); toIdle(g2);
  ok(hand(g2, 0) === 0 && cnt(g2, 0, 'gy', 'Sangan') >= 2, `no Normal: whole hand to the GY (hand ${hand(g2, 0)})`);
});
T('Common Soul: Special Summons a Neo-Spacian, selected monster gains its ATK', () => {
  const g = duel({ board: [{ hand: ['Common Soul', 'Neo-Spacian Dark Panther'], m: [W], turn: 2 }, {}] });
  act(g, 0, 'Common Soul'); settle(g, W, 'Neo-Spacian Dark Panther', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Neo-Spacian Dark Panther') && E.atk(g, on(g, 0, W)) === 3000, `Panther summoned, Warwolf ${E.atk(g, on(g, 0, W))}`);
});
T('Comrade Swordsman of Landstar: Warriors +400', () => {
  const g = duel({ board: [{ hand: [], m: ['Comrade Swordsman of Landstar', CG, W], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, CG)) === 1800 && E.atk(g, on(g, 0, 'Comrade Swordsman of Landstar')) === 900 && E.atk(g, on(g, 0, W)) === 2000, 'Celtic 1800, itself 900, Warwolf 2000');
});
T('Confusion Chaff: second direct attacker battles the first', () => {
  const g = duel({ board: [{ hand: [], m: [W, CG], turn: 2 }, { st: ['Confusion Chaff'] }] });
  bp(g); atkOn(g, 0, W, null); ok(lp(g, 1) === 6000, 'first direct attack 2000');
  atkOn(g, 0, CG, null, 'Confusion Chaff'); toIdle(g);
  ok(lp(g, 1) === 6000 && inZ(g, 0, 'gy', CG) && !!on(g, 0, W), `Celtic battled Warwolf and was destroyed (B ${lp(g, 1)}, A ${lp(g, 0)})`);
});
T('Conscription: takes a Normal Summonable monster from the top of the opponent Deck', () => {
  const g = duel({ board: [{ hand: [], st: ['Conscription'], turn: 2 }, { deckTop: [CG] }] });
  act(g, 0, 'Conscription'); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, CG), 'Celtic Guardian on A field');
  const g2 = duel({ board: [{ hand: [], st: ['Conscription'], turn: 2 }, { deckTop: ['Pot of Greed'] }] });
  const h = hand(g2, 1); act(g2, 0, 'Conscription'); settle(g2); toIdle(g2);
  ok(inZ(g2, 1, 'hand', 'Pot of Greed') && hand(g2, 1) === h + 1, 'Spell added to B hand');
});
T('Contact: Chrysalis to GY, summons the Neo-Spacian it names', () => {
  const g = duel({ board: [{ hand: ['Contact'], m: ['Chrysalis Dolphin'], deckTop: [W, 'Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  act(g, 0, 'Contact'); settle(g, 'Neo-Spacian Aqua Dolphin', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Neo-Spacian Aqua Dolphin') && inZ(g, 0, 'gy', 'Chrysalis Dolphin'), 'Aqua Dolphin summoned from the Deck');
});
T('Contact Out: Neos Fusion back to Extra, materials from the Deck', () => {
  const g = duel({ board: [{ hand: ['Contact Out'], m: ['Elemental HERO Aqua Neos'], deckTop: [W, 'Elemental HERO Neos', 'Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  act(g, 0, 'Contact Out'); settle(g, 'Elemental HERO Aqua Neos', 'Attack'); toIdle(g, 'Attack');
  ok(inZ(g, 0, 'extra', 'Elemental HERO Aqua Neos') && !!on(g, 0, 'Elemental HERO Neos') && !!on(g, 0, 'Neo-Spacian Aqua Dolphin'), 'Aqua Neos in Extra, Neos and Aqua Dolphin summoned');
});
T('Copy Plant: copies another Plant Level', () => {
  const g = duel({ board: [{ hand: [], m: ['Copy Plant', 'Cactus Fighter'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Copy Plant'), 'Cactus Fighter'); toIdle(g);
  ok(LV(on(g, 0, 'Copy Plant')) === 4, `Copy Plant Level ${LV(on(g, 0, 'Copy Plant'))}`);
  ok(!hasIgn(g, on(g, 0, 'Copy Plant')), 'once per turn');
});
T('Copycat: copies an opponent monster original ATK/DEF on summon', () => {
  const g = duel({ board: [{ hand: ['Copycat'], turn: 2 }, { m: [BEWD] }] });
  ns(g, 0, 'Copycat', BEWD); toIdle(g, BEWD);
  const c = on(g, 0, 'Copycat');
  ok(c && E.atk(g, c) === 3000 && E.def(g, c) === 2500, `Copycat ${c && E.atk(g, c)}/${c && E.def(g, c)}`);
});
T('Corruption Cell A: an A-Counter on an opponent monster', () => {
  const g = duel({ board: [{ hand: ['Corruption Cell A'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Corruption Cell A'); settle(g, W); toIdle(g);
  ok(E.lib.ctr(on(g, 1, W), 'A') === 1, 'Warwolf has an A-Counter');
});
T("Cosmic Horror Gangi'el: places an A-Counter once per turn", () => {
  const g = duel({ board: [{ hand: [], m: ["Cosmic Horror Gangi'el"], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, "Cosmic Horror Gangi'el"), W); toIdle(g);
  ok(E.lib.ctr(on(g, 1, W), 'A') === 1 && !hasIgn(g, on(g, 0, "Cosmic Horror Gangi'el")), 'A-Counter placed, once per turn');
  const g2 = duel({ board: [{ hand: ["Cosmic Horror Gangi'el"], m: [W, W], turn: 2 }, {}] });
  ok(hasOpt(g2, 'ns:' + g2.p[0].hand[0].u), 'Tribute Summon with 2 offered');
});
T('Counselor Lily: pay 500, the Synchro gains 1000', () => {
  const g = duel({ ex0: ['Ancient Fairy Dragon'], board: [{ hand: [], m: ['Counselor Lily', W], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); settle(g, 'Ancient Fairy Dragon', 'Counselor Lily', W, 'Attack'); toIdle(g, 'Attack');
  const a = on(g, 0, 'Ancient Fairy Dragon');
  ok(a && E.atk(g, a) === 3100 && lp(g, 0) === 7500, `AFD ${a && E.atk(g, a)}, A LP ${lp(g, 0)}`);
});
T("Cranium Fish: Special Summon by Tributing Ocean's Keeper, discard WATER to destroy a face-down card", () => {
  const g = duel({ board: [{ hand: ['Cranium Fish', 'Treeborn Frog'], m: ["Ocean's Keeper"], turn: 2 }, { st: ['Dust Tornado'] }] });
  choose(g, 'sp:' + card(g, 0, 'Cranium Fish').u); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Cranium Fish') && inZ(g, 0, 'gy', "Ocean's Keeper"), 'Cranium Fish summoned');
  ign(g, on(g, 0, 'Cranium Fish'), 'Treeborn Frog', 'Face-down'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Dust Tornado') && inZ(g, 0, 'gy', 'Treeborn Frog'), 'face-down card destroyed');
});
T('Creature Seizure: players swap face-up Normal Monsters', () => {
  const g = duel({ board: [{ hand: ['Creature Seizure'], m: [CG], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Creature Seizure'); settle(g, CG, W); toIdle(g);
  ok(!!on(g, 0, W) && !!on(g, 1, CG), 'Warwolf on A field, Celtic on B field');
});
T('Crop Circles: send monsters to summon an Alien of matching Level', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Grey', 'Alien Ammonite'], st: ['Crop Circles'], deckTop: [W, 'Alien Dog'], turn: 2 }, {}] });
  act(g, 0, 'Crop Circles'); settle(g, 'Alien Grey', 'Alien Ammonite', 'Alien Dog', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Alien Dog') && lp(g, 0) === 8000, 'Alien Dog (Level 3) summoned');
});
T('Crusader of Endymion: Gemini Summon, Spell Counter and +600', () => {
  const g = duel({ board: [{ hand: [], m: ['Crusader of Endymion', 'Royal Magical Library'], turn: 2 }, {}] });
  const c = on(g, 0, 'Crusader of Endymion');
  choose(g, 'gem:' + c.u); settle(g);
  ign(g, on(g, 0, 'Crusader of Endymion'), 'Royal Magical Library'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Crusader of Endymion')) === 2500 && ctrs(on(g, 0, 'Royal Magical Library')) === 1, `Crusader ${E.atk(g, on(g, 0, 'Crusader of Endymion'))}, Library 1 counter`);
});
T('Crush Card Virus: Tribute a DARK 1000 or less, destroys 1500+ on field and in hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Sangan'], st: ['Crush Card Virus'], turn: 2 }, { hand: [BEWD, ELF, 'Pot of Greed'], m: [W, CG] }] });
  ok(canAct(g, 0, 'Crush Card Virus'), 'activatable with Sangan');
  act(g, 0, 'Crush Card Virus'); settle(g, 'Sangan'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Sangan') || inZ(g, 0, 'hand', 'Sangan'), 'Sangan Tributed');
  ok(inZ(g, 1, 'gy', W) && inZ(g, 1, 'gy', BEWD) && !!on(g, 1, CG) && inZ(g, 1, 'hand', ELF) && inZ(g, 1, 'hand', 'Pot of Greed'), 'Warwolf and BEWD destroyed; Celtic, Elf and Pot stay');
  const g2 = duel({ board: [{ hand: [], m: [CG], st: ['Crush Card Virus'], turn: 2 }, {}] });
  const g3 = duel({ board: [{ hand: [], m: ['Dark Elf'], st: ['Crush Card Virus'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Crush Card Virus') && !canAct(g3, 0, 'Crush Card Virus'), 'not activatable with a non-DARK or a DARK over 1000');
});
T('Cry Havoc!: banish from GY for an extra Normal Monster summon', () => {
  const g = duel({ board: [{ hand: [W, CG], st: [up('Cry Havoc!')], gy: [ELF], turn: 2 }, {}] });
  ns(g, 0, W); toIdle(g);
  ok(canAct(g, 0, 'Cry Havoc!'), 'effect offered after the Normal Summon');
  act(g, 0, 'Cry Havoc!'); settle(g, ELF, CG, 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, CG) && inZ(g, 0, 'ban', ELF), 'Celtic summoned, Elf banished');
});
T('Cryomancer: Level 4+ cannot attack while another Ice Barrier is controlled', () => {
  const g = duel({ board: [{ hand: [], m: [W, 'Alien Grey'], turn: 2 }, { m: ['Cryomancer of the Ice Barrier', 'Blizzed, Defender of the Ice Barrier'] }] });
  bp(g); ok(!hasOpt(g, 'atk:' + on(g, 0, W).u) && hasOpt(g, 'atk:' + on(g, 0, 'Alien Grey').u), 'Warwolf cannot attack, Level 2 can');
});
T('Cu Chulainn: banish a Normal from GY, gains its ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Cu Chulainn the Awakened'], gy: [BEWD], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Cu Chulainn the Awakened'), BEWD); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Cu Chulainn the Awakened')) === 3500 && inZ(g, 0, 'ban', BEWD), 'Cu Chulainn 3500');
  const g2 = duel({ board: [{ hand: ['Cu Chulainn the Awakened'], m: [W, W], turn: 2 }, {}] });
  ok(noSummon(g2, g2.p[0].hand[0]), 'cannot be Normal Summoned');
});
T('Cunning of the Six Samurai: send one, revive a Six Samurai', () => {
  const g = duel({ board: [{ hand: ['Cunning of the Six Samurai'], m: ['The Six Samurai - Yaichi'], turn: 2 }, { gy: ['The Six Samurai - Irou'] }] });
  act(g, 0, 'Cunning of the Six Samurai'); settle(g, 'The Six Samurai - Irou', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'The Six Samurai - Irou') && inZ(g, 0, 'gy', 'The Six Samurai - Yaichi'), 'Irou from B GY to A field');
});
T('Cup of Ace: Heads draws 2, Tails opponent draws 2', () => {
  const g = duel({ board: [{ hand: ['Cup of Ace'], turn: 2 }, {}] });
  g.rnd = () => 0.1; const h = hand(g, 0); act(g, 0, 'Cup of Ace'); settle(g); toIdle(g);
  ok(hand(g, 0) === h + 1, `Heads: A drew 2 (${h} -> ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Cup of Ace'], turn: 2 }, {}] });
  g2.rnd = () => 0.9; const h2 = hand(g2, 1); act(g2, 0, 'Cup of Ace'); settle(g2); toIdle(g2);
  ok(hand(g2, 1) === h2 + 2, `Tails: B drew 2 (${h2} -> ${hand(g2, 1)})`);
});
T('Cursed Fig: locks 2 Set Spell/Traps when destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: [W], st: ['Mystical Space Typhoon', 'Dust Tornado'], turn: 2 }, { m: ['Cursed Fig'], st: [ 'Sakuretsu Armor' ] }] });
  bp(g); atkOn(g, 0, W, 'Cursed Fig', 'Mystical Space Typhoon', 'Dust Tornado'); toIdle(g);
  if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g); }
  ok(inZ(g, 1, 'gy', 'Cursed Fig') && !canAct(g, 0, 'Mystical Space Typhoon') && !canAct(g, 0, 'Dust Tornado'), 'A cannot activate the two locked cards');
});
T('Cyborg Doctor: Tribute a Tuner, revive a same Attribute and Level monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyborg Doctor', 'Junk Synchron'], gy: ['Broww, Huntsman of Dark World'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Cyborg Doctor'), 'Junk Synchron', 'Broww, Huntsman of Dark World', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Broww, Huntsman of Dark World') && inZ(g, 0, 'gy', 'Junk Synchron'), 'Broww revived');
});
T('Cyclone Blade: D-HERO only, destroys a Spell/Trap after attacking', () => {
  const g = duel({ board: [{ hand: ['Cyclone Blade'], m: ['Destiny HERO - Diamond Dude', W], turn: 2 }, { st: ['Dust Tornado'] }] });
  act(g, 0, 'Cyclone Blade'); ok(g.prompt && !g.prompt.opts.some(x => x.label.includes(W)), 'Warwolf is not offered'); settle(g, 'Destiny HERO - Diamond Dude'); toIdle(g);
  ok(card(g, 0, 'Cyclone Blade').equipTo === on(g, 0, 'Destiny HERO - Diamond Dude').u, 'equipped to Diamond Dude');
  bp(g); atkOn(g, 0, 'Destiny HERO - Diamond Dude', null, 'Face-down', 'Dust Tornado'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Dust Tornado') && lp(g, 1) === 6600, 'Dust Tornado destroyed after the attack');
});
T('Cyclone Boomerang: Wildheart +500, blows up Spell/Traps when destroyed by effect', () => {
  const g = duel({ board: [{ hand: ['Cyclone Boomerang', 'Dark Hole'], m: ['Elemental HERO Wildheart'], turn: 2 }, { st: ['Dust Tornado', 'Sakuretsu Armor'] }] });
  act(g, 0, 'Cyclone Boomerang'); settle(g, 'Elemental HERO Wildheart'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Elemental HERO Wildheart')) === 2000, 'Wildheart 2000');
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(!stOf(g, 1).length && lp(g, 1) === 7800, `B Spell/Traps destroyed, 200 damage (B ${lp(g, 1)})`);
});

/* ---------------- D ---------------- */
T('D.3.S. Frog: +500 per Treeborn Frog in GY', () => {
  const g = duel({ board: [{ hand: [], m: ['D.3.S. Frog'], gy: ['Treeborn Frog', 'Treeborn Frog'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'D.3.S. Frog')) === 3500, `D.3.S. Frog ${E.atk(g, on(g, 0, 'D.3.S. Frog'))}`);
  const g2 = duel({ ex0: ['D.3.S. Frog'], board: [{ hand: ['Polymerization', 'Des Frog', 'Des Frog', 'Des Frog'], turn: 2 }, {}] });
  act(g2, 0, 'Polymerization'); settle(g2, 'D.3.S. Frog', 'Des Frog', 'Attack'); toIdle(g2, 'Attack');
  ok(!!on(g2, 0, 'D.3.S. Frog'), 'Fusion Summoned with 3 Des Frog');
});
T('Dangerous Machine Type-6: a 3 draws 1 in your Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: [up('Dangerous Machine Type-6')], turn: 2 }, {}] });
  endTurn(g); toIdle(g); endTurn(g, 'NO');
  // now A's turn 4 already drew; roll was decided by default rnd. Rerun with control:
  const g2 = duel({ board: [{ hand: [], st: [up('Dangerous Machine Type-6')], turn: 2 }, {}] });
  endTurn(g2); toIdle(g2); roll(g2, 3); const h = hand(g2, 0); endTurn(g2, 'NO'); toIdle(g2);
  ok(hand(g2, 0) === h + 2, `A drew 1 for the turn and 1 for the die (${h} -> ${hand(g2, 0)})`);
  const g3 = duel({ board: [{ hand: [], st: [up('Dangerous Machine Type-6')], turn: 2 }, {}] });
  endTurn(g3); toIdle(g3); roll(g3, 6); endTurn(g3, 'NO'); toIdle(g3);
  ok(inZ(g3, 0, 'gy', 'Dangerous Machine Type-6'), 'a 6 destroys it');
});
T('Darkblaze Dragon: doubled from the GY, burns for the destroyed monster', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Darkblaze Dragon'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Monster Reborn'); settle(g, 'Darkblaze Dragon', 'Attack'); toIdle(g, 'Attack');
  const d = on(g, 0, 'Darkblaze Dragon');
  ok(d && E.atk(g, d) === 2400 && E.def(g, d) === 2000, `Darkblaze ${d && E.atk(g, d)}/${d && E.def(g, d)}`);
  bp(g); atkOn(g, 0, 'Darkblaze Dragon', W); toIdle(g);
  ok(lp(g, 1) === 8000 - 400 - 2000, `400 battle + 2000 burn (B ${lp(g, 1)})`);
});


/* ---------------- extra checks: conditions and follow-ups ---------------- */
T('Broken Blocker: not for a monster whose DEF is lower than its ATK', () => {
  const g = duel({ board: [{ hand: [], m: [BEWD], turn: 2 }, { m: [dpos(W)], st: ['Broken Blocker'] }] });
  bp(g); atkOn(g, 0, BEWD, W, 'Broken Blocker', W, W); toIdle(g);
  ok(inZ(g, 1, 'st', 'Broken Blocker') && mons(g, 1).length === 0, 'Broken Blocker stays Set');
});
T('Cell Explosion Virus: not without an A-Counter', () => {
  const g = duel({ board: [{ hand: [], m: [W, CG], turn: 2 }, { st: ['Cell Explosion Virus'] }] });
  bp(g); atkOn(g, 0, W, null, 'Cell Explosion Virus'); toIdle(g);
  ok(inZ(g, 1, 'st', 'Cell Explosion Virus') && !!on(g, 0, CG), 'not activated');
});
T('Cryomancer: no lock without another Ice Barrier', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Cryomancer of the Ice Barrier'] }] });
  bp(g); ok(hasOpt(g, 'atk:' + on(g, 0, W).u), 'Warwolf can attack');
});
T('Calming Magic: only at the start of Main Phase 1', () => {
  const g = duel({ board: [{ hand: ['Calming Magic', W], turn: 2 }, {}] });
  ns(g, 0, W); toIdle(g);
  ok(!canAct(g, 0, 'Calming Magic'), 'not after a Normal Summon');
});
// Errata audit (2026-11-26): the original card has no "no damage" clause, so the direct attack deals damage.
T('Crush Card Virus: destroys the 1500+ monster, and the opponent still takes damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Sangan', CG], st: ['Crush Card Virus'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Crush Card Virus'); settle(g, 'Sangan'); toIdle(g);
  bp(g); atkOn(g, 0, CG, null); toIdle(g);
  ok(!on(g, 1, W) && lp(g, 1) === 6600, `Warwolf destroyed, B took 1400 (B ${lp(g, 1)})`);
});
T('Cloning: the Clone Token is destroyed with its original', () => {
  const g = duel({ board: [{ hand: [CG], turn: 2 }, { st: ['Cloning'], hand: ['Smashing Ground'] }] });
  ns(g, 0, CG, 'Cloning'); toIdle(g, 'Cloning');
  ok(!!on(g, 1, 'Clone Token'), 'token made');
  endTurn(g); toIdle(g);
  act(g, 1, 'Smashing Ground'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', CG) && !on(g, 1, 'Clone Token'), 'Celtic destroyed, the Clone Token goes too');
});
T('Common Soul: the Neo-Spacian returns to the hand when Common Soul leaves', () => {
  const g = duel({ board: [{ hand: ['Common Soul', 'Neo-Spacian Dark Panther'], m: [W], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Common Soul'); settle(g, W, 'Neo-Spacian Dark Panther', 'Attack'); toIdle(g, 'Attack');
  endTurn(g); toIdle(g); act(g, 1, 'Mystical Space Typhoon'); settle(g, 'Common Soul'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Neo-Spacian Dark Panther') && E.atk(g, on(g, 0, W)) === 2000, 'Panther back in hand, Warwolf 2000');
});
T('Cu Chulainn: the gain lasts until your next Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Cu Chulainn the Awakened'], gy: [BEWD], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Cu Chulainn the Awakened'), BEWD); toIdle(g); endTurn(g); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Cu Chulainn the Awakened')) === 3500, 'still 3500 on the opponent turn');
  endTurn(g); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Cu Chulainn the Awakened')) === 500, 'back to 500 in your next turn');
});
T("Cosmic Horror Gangi'el: 1 Tribute with an opponent-owned monster", () => {
  const g = duel({ board: [{ hand: ["Cosmic Horror Gangi'el", 'Snatch Steal'], m: [CG], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Snatch Steal'); settle(g, W); toIdle(g);
  ns(g, 0, "Cosmic Horror Gangi'el", '1 Tribute', W); toIdle(g);
  ok(!!on(g, 0, "Cosmic Horror Gangi'el") && !!on(g, 0, CG), 'summoned by Tributing only the stolen Warwolf');
});
T('Crop Circles: 2000 damage when no Alien matches', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Grey'], st: ['Crop Circles'], turn: 2 }, {}] });
  act(g, 0, 'Crop Circles'); settle(g, 'Alien Grey'); toIdle(g);
  ok(lp(g, 0) === 6000, `A took 2000 (LP ${lp(g, 0)})`);
});
T('Dangerous Machine Type-6: a 5 destroys an opponent monster', () => {
  const g = duel({ board: [{ hand: [], st: [up('Dangerous Machine Type-6')], turn: 2 }, { m: [W] }] });
  endTurn(g); toIdle(g); roll(g, 5); endTurn(g, 'NO'); toIdle(g, W);
  ok(inZ(g, 1, 'gy', W), 'Warwolf destroyed');
});
T('Clear World: WIND pays 500 to activate a Spell', () => {
  const g = duel({ board: [{ hand: ['Clear World', 'Pot of Greed'], m: ['Elemental HERO Avian'], turn: 2 }, {}] });
  act(g, 0, 'Clear World'); settle(g); toIdle(g); act(g, 0, 'Pot of Greed'); settle(g); toIdle(g);
  ok(lp(g, 0) === 7500, `A paid 500 (LP ${lp(g, 0)})`);
});
console.log(fails ? `\n${fails} failed` : '\nAll batch 36 review checks passed.');
process.exit(fails ? 1 : 0);
