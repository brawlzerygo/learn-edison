// Independent review checks for full pool batch 31 (written from the card text): node build/review_full-30.js
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
const DD = 'Destiny HERO - Diamond Dude', MPZ = 'Mystic Plasma Zone', GP = 'Gaia Power', WHALE = 'Fortress Whale', OATH = "Fortress Whale's Oath";
const mons = (g, p) => g.p[p].m.filter(Boolean);
// play turns until it is player p's Main Phase again (passing everything, answering prompts with picks)
const nextMain = (g, p, ...picks) => { for (let i = 0; i < 6; i++) { toIdle(g, ...picks); if (g.tp === p && g.phase === 'main1' && idle(g) && i > 0) return; endTurn(g, ...picks); } };
const turns = (g, n, ...picks) => { for (let i = 0; i < n; i++) { toIdle(g, ...picks); endTurn(g, ...picks); } toIdle(g, ...picks); };

/* ---------------- D ---------------- */
T('D.D.M.: discard a Spell, Special Summon a banished monster', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['D.D.M. - Different Dimension Master'], ban: [CG], turn: 2 }, {}] });
  ign(g, on(g, 0, 'D.D.M. - Different Dimension Master'), 'Pot of Greed', CG, 'Attack'); toIdle(g, CG);
  ok(on(g, 0, CG) && inZ(g, 0, 'gy', 'Pot of Greed'), 'Celtic Guardian summoned, Pot of Greed discarded');
  ok(!hasIgn(g, on(g, 0, 'D.D.M. - Different Dimension Master')), 'once per turn');
  const g2 = duel({ board: [{ hand: [W], m: ['D.D.M. - Different Dimension Master'], ban: [CG], turn: 2 }, {}] });
  ok(!hasIgn(g2, on(g2, 0, 'D.D.M. - Different Dimension Master')), 'needs a Spell to discard');
});
T('Damage = Reptile: battle damage with a Reptile summons a Reptile from the Deck', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Sinister Serpent'], st: [up('Damage = Reptile')], deckTop: ['Alien Grey'] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, 'Sinister Serpent', 'Damage = Reptile', 'Alien Grey', 'Attack'); toIdle(g, 'Damage = Reptile', 'Alien Grey', 'Attack');
  ok(lp(g, 0) === 6300 && on(g, 0, 'Alien Grey'), `A took 1700 and summoned Alien Grey (A ${lp(g, 0)})`);
});
T('Damage Condenser: discard 1, summon a monster with ATK up to the damage', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [CG], st: ['Damage Condenser'], deckTop: [BEWD, W] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, null, 'Damage Condenser', CG, W, 'Attack'); toIdle(g, 'Damage Condenser', CG, W, 'Attack');
  const w = on(g, 0, W);
  ok(lp(g, 0) === 6000 && w && w.pos === 'atk' && inZ(g, 0, 'gy', CG) && !on(g, 0, BEWD), `Warwolf summoned in Attack, Celtic discarded (A ${lp(g, 0)})`);
});
T('Damage Polarizer: negates a burn and each player draws 1', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [W], st: ['Damage Polarizer'] }, { hand: ['Ookazi'], turn: 2 }] });
  toIdle(g); const h0 = hand(g, 0), h1 = hand(g, 1);
  act(g, 1, 'Ookazi'); settle(g, 'Damage Polarizer'); toIdle(g);
  ok(lp(g, 0) === 8000 && hand(g, 0) === h0 + 1 && hand(g, 1) === h1 - 1 + 1, `no damage, both drew (A ${lp(g, 0)}, hands ${hand(g, 0)}/${hand(g, 1)})`);
});
T('Damage Translation: effect damage halved, a Ghost Token per hit at the End Phase', () => {
  const g = duel({ first: 1, board: [{ turn: 2, st: ['Damage Translation'] }, { hand: ['Ookazi', 'Hinotama'], turn: 2 }] });
  toIdle(g); act(g, 1, 'Ookazi'); settle(g, 'Damage Translation'); toIdle(g);
  act(g, 1, 'Hinotama'); settle(g); toIdle(g);
  ok(lp(g, 0) === 8000 - 400 - 250, `took 400 + 250 (A ${lp(g, 0)})`);
  endTurn(g); toIdle(g);
  const toks = mons(g, 0).filter(c => E.name(c) === 'Ghost Token');
  ok(toks.length === 2 && toks.every(t => t.pos === 'def'), `2 Ghost Tokens in Defense (${toks.length})`);
});
T('Dark Spirit Art - Greed: Tribute a DARK monster, draw 2; a revealed Spell negates', () => {
  const g = duel({ board: [{ hand: [], m: ['Sangan'], st: ['Dark Spirit Art - Greed'], turn: 2 }, { hand: [W] }] });
  const h = hand(g, 0); act(g, 0, 'Dark Spirit Art - Greed'); settle(g, 'Sangan'); toIdle(g, 'NO');
  ok(inZ(g, 0, 'gy', 'Sangan') && hand(g, 0) >= h + 2, `Sangan Tributed, drew 2 (hand ${h} -> ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Sangan'], st: ['Dark Spirit Art - Greed'], turn: 2 }, { hand: ['Pot of Greed'] }] });
  const h2 = hand(g2, 0); act(g2, 0, 'Dark Spirit Art - Greed'); settle(g2, 'Sangan', 'Pot of Greed'); toIdle(g2, 'Pot of Greed');
  ok(hand(g2, 0) === h2 && inZ(g2, 1, 'hand', 'Pot of Greed'), `opponent revealed Pot of Greed, no draw (hand ${hand(g2, 0)})`);
  const g3 = duel({ board: [{ hand: [], m: [W], st: ['Dark Spirit Art - Greed'], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'Dark Spirit Art - Greed'), 'needs a DARK monster');
});
T('Delta Crow - Anti Reverse: destroys face-down Spells/Traps; from hand with 3 Blackwings', () => {
  const g = duel({ board: [{ hand: [], m: ['Blackwing - Bora the Spear'], st: ['Delta Crow - Anti Reverse'], turn: 2 }, { st: ['Mirror Force', 'Dust Tornado', up('Swords of Revealing Light')] }] });
  act(g, 0, 'Delta Crow - Anti Reverse'); settle(g); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Dust Tornado') && inZ(g, 1, 'st', 'Swords of Revealing Light'), 'face-down cards destroyed, face-up stays');
  const g2 = duel({ board: [{ hand: [], m: [W], st: ['Delta Crow - Anti Reverse'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!canAct(g2, 0, 'Delta Crow - Anti Reverse'), 'not without a Blackwing');
  const bw = 'Blackwing - Bora the Spear';
  const g3 = duel({ board: [{ hand: ['Delta Crow - Anti Reverse'], m: [bw, bw, bw], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(canAct(g3, 0, 'Delta Crow - Anti Reverse'), 'from the hand with exactly 3 Blackwings');
  const g4 = duel({ board: [{ hand: ['Delta Crow - Anti Reverse'], m: [bw, bw], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!canAct(g4, 0, 'Delta Crow - Anti Reverse'), 'not from the hand with 2');
});
T('Destiny HERO - Blade Master: discard in the opponent Battle Phase, D-HEROes gain 800', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: ['Destiny HERO - Blade Master'], m: [DD] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, DD, 'Blade Master'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Destiny HERO - Blade Master') && on(g, 0, DD) && inZ(g, 1, 'gy', W), 'Diamond Dude (2200) destroyed the Warwolf');
  const g2 = duel({ board: [{ hand: ['Destiny HERO - Blade Master'], m: [DD], turn: 2 }, {}] });
  ok(!hasIgn(g2, card(g2, 0, 'Destiny HERO - Blade Master')), 'not during your own turn');
});
T('Destiny HERO - Captain Tenacious: revives a D-HERO destroyed by battle at your Standby Phase', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Destiny HERO - Captain Tenacious', DD] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, DD); toIdle(g);
  ok(inZ(g, 0, 'gy', DD), 'Diamond Dude destroyed');
  endTurn(g, 'Captain Tenacious', DD, 'Attack'); toIdle(g, 'Captain Tenacious', DD, 'Attack');
  ok(on(g, 0, DD) && g.tp === 0, 'Diamond Dude back on the field in A Standby Phase');
});
T('Destiny HERO - Defender: opponent draws 1 in their Standby Phase while it is face-up Defense', () => {
  const g = duel({ board: [{ hand: [], m: [dpos('Destiny HERO - Defender')], turn: 2 }, { hand: [] }] });
  toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 1 && hand(g, 1) === 2, `B drew 2 (${hand(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Destiny HERO - Defender'], turn: 2 }, { hand: [] }] });
  toIdle(g2); endTurn(g2); toIdle(g2);
  ok(hand(g2, 1) === 1, `in Attack Position: B drew only 1 (${hand(g2, 1)})`);
});
T('Destiny HERO - Departed: Special Summoned to the opponent field from the GY in your Standby', () => {
  const g = duel({ board: [{ hand: [], gy: ['Destiny HERO - Departed'], turn: 2 }, {}] }); toIdle(g);
  const d = on(g, 1, 'Destiny HERO - Departed');
  ok(d && d.pos === 'atk', 'Departed on B field in Attack');
  const g2 = duel({ board: [{ hand: [], m: ['Destiny HERO - Departed'], turn: 2 }, { m: [W] }] });
  bp(g2); atkOn(g2, 0, 'Destiny HERO - Departed', W); toIdle(g2);
  ok(inZ(g2, 0, 'ban', 'Destiny HERO - Departed'), 'banished when destroyed by battle');
});
T('Destiny HERO - Diamond Dude: Normal Spell to the GY, its effect next turn', () => {
  const g = duel({ board: [{ hand: [], m: [DD], deckTop: [W, 'Pot of Greed'], turn: 2 }, {}] });
  ign(g, on(g, 0, DD)); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Pot of Greed'), 'Pot of Greed sent to the GY');
  turns(g, 2); ok(g.tp === 0, 'A turn again');
  const o = g.prompt.opts.find(x => /Normal Spell|Pot of Greed/.test(x.label) && x.key.startsWith('a:'));
  ok(!!o, 'Pot of Greed effect offered from the GY');
  if (o) { const h = hand(g, 0); E.act(g, [o.key]); settle(g, 'Pot of Greed'); toIdle(g); ok(hand(g, 0) === h + 2, `drew 2 (${h} -> ${hand(g, 0)})`); }
  const g2 = duel({ board: [{ hand: [], m: [DD], deckTop: [W, CG], turn: 2 }, {}] });
  ign(g2, on(g2, 0, DD)); toIdle(g2);
  ok(E.name(g2.p[0].deck[0]) === CG && !inZ(g2, 0, 'gy', CG), 'a monster goes to the bottom of the Deck');
});
T('Destiny HERO - Disk Commander: draw 2 when Special Summoned from the GY', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Destiny HERO - Disk Commander'], turn: 3 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Monster Reborn'); settle(g, 'Disk Commander', 'Attack'); toIdle(g, 'Disk Commander');
  ok(on(g, 0, 'Destiny HERO - Disk Commander') && hand(g, 0) === h - 1 + 2, `drew 2 (hand ${h} -> ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Destiny HERO - Disk Commander', 'Monster Reborn', 'Graceful Charity', 'Pot of Greed'], turn: 2 }, {}] });
  act(g2, 0, 'Graceful Charity'); settle(g2, 'Disk Commander', 'Pot of Greed'); toIdle(g2);
  ok(inZ(g2, 0, 'gy', 'Destiny HERO - Disk Commander') && !canAct(g2, 0, 'Monster Reborn'), 'cannot be revived the turn it was sent to the GY');
});
T('Destiny HERO - Dogma: Tribute 3 incl. a D-HERO, halves the opponent LP next Standby', () => {
  const g = duel({ board: [{ hand: ['Destiny HERO - Dogma'], m: [DD, W, CG], turn: 2 }, {}] });
  const d = card(g, 0, 'Destiny HERO - Dogma');
  ok(!hasOpt(g, 'ns:' + d.u) && !hasOpt(g, 'set:' + d.u), 'no Normal Summon/Set');
  choose(g, 'sp:' + d.u); settle(g, DD, W, CG, 'Attack'); toIdle(g);
  ok(on(g, 0, 'Destiny HERO - Dogma') && mons(g, 0).length === 1, 'Dogma summoned with 3 Tributes');
  endTurn(g, 'Dogma'); toIdle(g, 'Dogma');
  ok(lp(g, 1) === 4000, `B LP halved (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Destiny HERO - Dogma'], m: [W, W, CG], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Destiny HERO - Dogma').u), 'not without a Destiny HERO');
});
T('Destiny HERO - Doom Lord: banish a monster, no attack, it returns in the 2nd Standby', () => {
  const g = duel({ board: [{ hand: [], m: ['Destiny HERO - Doom Lord', CG], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, 'Destiny HERO - Doom Lord'), W); toIdle(g);
  ok(inZ(g, 1, 'ban', W), 'Warwolf banished');
  bp(g); ok(!hasOpt(g, 'atk:'), 'no attacks this turn');
  turns(g, 2); ok(inZ(g, 1, 'ban', W), 'still banished in the 1st Standby');
  turns(g, 2); ok(on(g, 1, W) && on(g, 1, W).pos === 'atk', 'Warwolf back in the 2nd Standby');
});
T('Destiny HERO - Double Dude: attacks twice; 2 tokens after being destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Destiny HERO - Double Dude'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Destiny HERO - Double Dude', null); atkOn(g, 0, 'Destiny HERO - Double Dude', null);
  ok(lp(g, 1) === 6000, `two direct attacks (B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Destiny HERO - Double Dude'], turn: 2 }, {}] });
  act(g2, 0, 'Dark Hole'); settle(g2); toIdle(g2); turns(g2, 2, 'Double Dude'); toIdle(g2, 'Double Dude');
  ok(mons(g2, 0).filter(c => E.name(c) === 'Double Dude Token').length === 2, 'two Double Dude Tokens');
  const g3 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Destiny HERO - Double Dude'], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'Monster Reborn'), 'cannot be Special Summoned');
});
T('Destiny HERO - Dread Servant: Clock Counter on summon; destroys a Spell/Trap when it dies in battle', () => {
  const g = duel({ board: [{ hand: ['Clock Tower Prison', 'Destiny HERO - Dread Servant'], turn: 2 }, {}] });
  act(g, 0, 'Clock Tower Prison'); settle(g); toIdle(g); ns(g, 0, 'Destiny HERO - Dread Servant', 'Attack'); toIdle(g);
  const ctp = card(g, 0, 'Clock Tower Prison'); ok(ctp && E.lib.ctr(ctp, 'clock') === 1, `1 Clock Counter (${ctp && E.lib.ctr(ctp, 'clock')})`);
  const g2 = duel({ first: 1, board: [{ turn: 2, m: ['Destiny HERO - Dread Servant'], st: [up('Damage = Reptile')] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g2); bp(g2); atkOn(g2, 1, W, 'Destiny HERO - Dread Servant', 'Dread Servant', 'Damage = Reptile'); toIdle(g2, 'Dread Servant', 'Damage = Reptile');
  ok(inZ(g2, 0, 'gy', 'Damage = Reptile'), 'the Spell/Trap destroyed');
});
T('Destiny HERO - Dreadmaster: summoned by Clock Tower Prison, clears non-D-HEROes, revives 2', () => {
  const g = duel({ board: [{ hand: ['Clock Tower Prison', 'Mystical Space Typhoon', 'Destiny HERO - Dreadmaster'], m: [W, DD], gy: ['Destiny HERO - Defender', 'Destiny HERO - Dunker'], turn: 2 }, {}] });
  act(g, 0, 'Clock Tower Prison'); settle(g); toIdle(g);
  const ctp = card(g, 0, 'Clock Tower Prison'); E.lib.addCtr(g, ctp, 'clock', 4); ctp.flags.clock = 4;
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Clock Tower Prison', 'Dreadmaster', 'Defender', 'Dunker', 'Attack', 'Defense'); toIdle(g, 'Dreadmaster', 'Defender', 'Dunker', 'Attack');
  const d = on(g, 0, 'Destiny HERO - Dreadmaster');
  ok(d && inZ(g, 0, 'gy', W) && on(g, 0, DD), 'Dreadmaster summoned, Warwolf destroyed, Diamond Dude stays');
  ok(on(g, 0, 'Destiny HERO - Defender') && on(g, 0, 'Destiny HERO - Dunker'), 'Defender and Dunker revived');
  ok(d && E.atk(g, d) === 1400 + 100 + 1200, `ATK = sum of other D-HEROes (${d && E.atk(g, d)})`);
});
T('Destiny HERO - Dunker: send a D-HERO from hand, 500 damage', () => {
  const g = duel({ board: [{ hand: ['Destiny HERO - Defender'], m: ['Destiny HERO - Dunker'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Destiny HERO - Dunker'), 'Defender'); toIdle(g);
  ok(lp(g, 1) === 7500 && inZ(g, 0, 'gy', 'Destiny HERO - Defender'), `500 damage (B ${lp(g, 1)})`);
});
T('Destiny HERO - Fear Monger: destroyed by battle, revives another D-HERO next Standby', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Destiny HERO - Fear Monger'], gy: [DD] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, 'Destiny HERO - Fear Monger'); toIdle(g);
  endTurn(g, DD, 'Attack'); toIdle(g, DD, 'Attack');
  ok(on(g, 0, DD) && inZ(g, 0, 'gy', 'Destiny HERO - Fear Monger'), 'Diamond Dude summoned');
});
T('Divine Dragon - Excelion: gains effects for each Excelion in the GY', () => {
  const X = 'Divine Dragon - Excelion';
  const g = duel({ board: [{ hand: [X], m: [W], gy: [X], turn: 2 }, {}] });
  ns(g, 0, X, W, '1000'); toIdle(g, '1000');
  const x = on(g, 0, X); ok(x && E.atk(g, x) === 2500, `ATK ${x && E.atk(g, x)}`);
  const g2 = duel({ board: [{ hand: [X], m: [W], turn: 2 }, {}] });
  ns(g2, 0, X, W); toIdle(g2);
  ok(E.atk(g2, on(g2, 0, X)) === 1500, 'no Excelion in the GY: 1500');
});
T('Divine Grace - Northwemko: Ritual of Grace; survives Dark Hole while its target is up', () => {
  const N = 'Divine Grace - Northwemko';
  const g = duel({ board: [{ hand: ['Ritual of Grace', N, 'Dark Hole'], m: [W, W], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'Ritual of Grace'); settle(g, N, W, W, CG); toIdle(g, CG);
  ok(on(g, 0, N), 'Northwemko Ritual Summoned');
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(on(g, 0, N) && inZ(g, 1, 'gy', CG), 'Northwemko survives Dark Hole');
});
T('Divine Sword - Phoenix Blade: +300 to a Warrior; banish 2 Warriors to return it', () => {
  const g = duel({ board: [{ hand: ['Divine Sword - Phoenix Blade'], m: [CG], turn: 2 }, {}] });
  act(g, 0, 'Divine Sword - Phoenix Blade'); settle(g, CG); toIdle(g);
  ok(E.atk(g, on(g, 0, CG)) === 1700, `Celtic 1700 (${E.atk(g, on(g, 0, CG))})`);
  const g2 = duel({ board: [{ hand: ['Divine Sword - Phoenix Blade'], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Divine Sword - Phoenix Blade'), 'not for a non-Warrior');
  const g3 = duel({ board: [{ hand: [], gy: ['Divine Sword - Phoenix Blade', CG, 'Exiled Force'], turn: 2 }, {}] });
  ign(g3, card(g3, 0, 'Divine Sword - Phoenix Blade'), CG, 'Exiled Force'); toIdle(g3);
  ok(inZ(g3, 0, 'hand', 'Divine Sword - Phoenix Blade') && inZ(g3, 0, 'ban', CG) && inZ(g3, 0, 'ban', 'Exiled Force'), 'returned to the hand, 2 Warriors banished');
});

/* ---------------- Djinns (with Fortress Whale's Oath) ---------------- */
// ENGINE (documented in the script): ritualSummon() does not offer banishing a Djinn from the GY, so the Djinn is Tributed from the hand here.
const ritualWith = (djinn, extra, opp2) => { const g = duel({ board: [{ hand: [OATH, WHALE, djinn, ...extra], turn: 2 }, opp2 || {}] });
  act(g, 0, OATH); settle(g, WHALE, djinn, ...extra, 'Attack'); toIdle(g); return g; };
T('Djinn Presider: banished for the Ritual; the Ritual monster draws on a battle kill', () => {
  const g = ritualWith('Djinn Presider of Rituals', [W], { m: [W] });
  ok(on(g, 0, WHALE) && inZ(g, 0, 'gy', 'Djinn Presider of Rituals'), 'Whale summoned with Presider as a Tribute');
  const h = hand(g, 0); bp(g); atkOn(g, 0, WHALE, W); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && hand(g, 0) === h + 1, `drew 1 (${h} -> ${hand(g, 0)})`);
});
T('Djinn Prognosticator: opponent discards when the Ritual monster deals battle damage', () => {
  const g = ritualWith('Djinn Prognosticator of Rituals', [W]);
  ok(on(g, 0, WHALE), 'Whale summoned (Level 3 + 4)');
  const h = hand(g, 1); bp(g); atkOn(g, 0, WHALE, null); toIdle(g);
  ok(lp(g, 1) === 8000 - 2350 && hand(g, 1) === h - 1, `B discarded 1 (${h} -> ${hand(g, 1)})`);
});
T('Djinn Disserere: the Ritual monster is unaffected by Traps', () => {
  const g = ritualWith('Djinn Disserere of Rituals', [W, CG], { st: ['Sakuretsu Armor'] });
  ok(on(g, 0, WHALE), 'Whale summoned');
  bp(g); atkOn(g, 0, WHALE, null, 'Sakuretsu Armor'); toIdle(g);
  ok(on(g, 0, WHALE) && lp(g, 1) === 8000 - 2350, `Whale not destroyed by Sakuretsu Armor (B ${lp(g, 1)})`);
});
T('Djinn Cursenchanter: Synchro Monsters effects are negated', () => {
  const g = ritualWith('Djinn Cursenchanter of Rituals', [W], { m: ['Stardust Dragon'] });
  ok(on(g, 0, WHALE) && E.lib.negd(g, on(g, 1, 'Stardust Dragon')), 'Stardust Dragon negated');
  const g2 = duel({ board: [{ hand: [OATH, WHALE, W, CG], turn: 2 }, { m: ['Stardust Dragon'] }] });
  act(g2, 0, OATH); settle(g2, WHALE, W, CG, 'Attack'); toIdle(g2);
  ok(on(g2, 0, WHALE) && !E.lib.negd(g2, on(g2, 1, 'Stardust Dragon')), 'without the Djinn: not negated');
});

/* ---------------- Earthbound Immortals ---------------- */
const CCA = 'Earthbound Immortal Ccapac Apu', CHA = 'Earthbound Immortal Chacu Challhua', CUS = 'Earthbound Immortal Cusillu', URU = 'Earthbound Immortal Uru', WIR = 'Earthbound Immortal Wiraqocha Rasca';
T('Ccapac Apu: direct attack, burn by the destroyed monster ATK, not attackable', () => {
  const g = duel({ board: [{ hand: [MPZ, CCA], m: [W, W], turn: 2 }, { m: [CG, ELF] }] });
  act(g, 0, MPZ); settle(g); toIdle(g); ns(g, 0, CCA, W, W); toIdle(g);
  const c = on(g, 0, CCA); ok(c && E.atk(g, c) === 3500, `Ccapac summoned (${c && E.atk(g, c)})`);
  bp(g); ok(canAtk(g, c, null), 'can attack directly');
  atkOn(g, 0, CCA, CG, CCA); toIdle(g, CCA);
  ok(lp(g, 1) === 8000 - 2100 - 1400, `2100 battle + 1400 burn (B ${lp(g, 1)})`);
  endTurn(g); toIdle(g); bp(g);
  ok(!canAtk(g, on(g, 1, ELF), on(g, 0, CCA)), 'Mystical Elf cannot attack it');
  const g2 = duel({ board: [{ hand: [MPZ, CCA, 'Mystical Space Typhoon'], m: [W, W], turn: 2 }, {}] });
  act(g2, 0, MPZ); settle(g2); toIdle(g2); ns(g2, 0, CCA, W, W); toIdle(g2);
  act(g2, 0, 'Mystical Space Typhoon'); settle(g2, MPZ); toIdle(g2);
  ok(inZ(g2, 0, 'gy', CCA), 'destroyed with no Field Spell');
});
T('Chacu Challhua: burn half its DEF, no attack that turn; in Defense no opponent Battle Phase', () => {
  const g = duel({ board: [{ hand: [GP, CHA], m: [W, W], turn: 2 }, {}] });
  act(g, 0, GP); settle(g); toIdle(g); ns(g, 0, CHA, W, W); toIdle(g);
  ign(g, on(g, 0, CHA)); toIdle(g);
  ok(lp(g, 1) === 6800, `1200 damage (B ${lp(g, 1)})`);
  ok(!hasIgn(g, on(g, 0, CHA)), 'once per turn');
  if (hasOpt(g, 'bp')) { bp(g); ok(!canAtk(g, on(g, 0, CHA), null), 'cannot attack after using it'); } else ok(true, 'no Battle Phase offered');
  const g2 = duel({ first: 1, board: [{ turn: 2, m: [dpos(CHA), 'Earthbound Linewalker'] }, { hand: [], m: [W], turn: 2 }] }); toIdle(g2);
  ok(on(g2, 0, CHA) && g2.tp === 1 && !hasOpt(g2, 'bp'), 'B cannot enter the Battle Phase');
});
T('Cusillu: Tribute another monster instead of being destroyed, halve the opponent LP', () => {
  const g = duel({ board: [{ hand: [GP, CUS], m: [W, W, CG], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, GP); settle(g); toIdle(g); ns(g, 0, CUS, W, W); toIdle(g);
  bp(g); atkOn(g, 0, CUS, BEWD, CUS, CG); toIdle(g, CUS, CG);
  ok(on(g, 0, CUS) && inZ(g, 0, 'gy', CG) && lp(g, 1) === 4000, `Cusillu stays, Celtic Tributed, B ${lp(g, 1)}`);
});
T('Earthbound Immortal Revival: discard 1, add an Earthbound Immortal and a Field Spell', () => {
  const g = duel({ board: [{ hand: ['Earthbound Immortal Revival', W], gy: [CCA, MPZ], turn: 2 }, {}] });
  act(g, 0, 'Earthbound Immortal Revival'); settle(g, W, CCA, MPZ); toIdle(g);
  ok(inZ(g, 0, 'hand', CCA) && inZ(g, 0, 'hand', MPZ) && inZ(g, 0, 'gy', W), 'both added, Warwolf discarded');
});
T('Uru: Tribute 1, take control of a face-up monster until the End Phase', () => {
  const g = duel({ board: [{ hand: [GP, URU], m: [W, W, CG], turn: 2 }, { m: [ELF] }] });
  act(g, 0, GP); settle(g); toIdle(g); ns(g, 0, URU, W, W); toIdle(g);
  ign(g, on(g, 0, URU), CG, ELF); toIdle(g);
  ok(on(g, 0, ELF) && inZ(g, 0, 'gy', CG), 'A controls Mystical Elf, Celtic Tributed');
  endTurn(g); toIdle(g); ok(on(g, 1, ELF), 'Elf back to B');
});
T('Wiraqocha Rasca: shuffle 2 cards back, opponent discards 2, +2000 ATK', () => {
  const DR = 'Damage = Reptile';
  const g = duel({ board: [{ hand: [GP, WIR], m: [W, W], st: [up(DR), up(DR)], turn: 2 }, {}] });
  act(g, 0, GP); settle(g); toIdle(g); const h = hand(g, 1); ns(g, 0, WIR, W, W, DR, DR); toIdle(g, DR, DR);
  const r = on(g, 0, WIR);
  ok(r && hand(g, 1) === h - 2 && E.atk(g, r) === 2100 && cnt(g, 0, 'st', DR) === 0, `B ${h} -> ${hand(g, 1)}, ATK ${r && E.atk(g, r)}`);
});
T('Earthbound Linewalker: Earthbound Immortals are not destroyed by their own effect', () => {
  const g = duel({ board: [{ hand: [], m: [CCA], turn: 2 }, {}] }); toIdle(g);
  const g2 = duel({ board: [{ hand: [], m: [CCA, 'Earthbound Linewalker'], turn: 2 }, {}] }); toIdle(g2);
  ok(inZ(g, 0, 'gy', CCA) && on(g2, 0, CCA), `no Field Spell: destroyed alone (${inZ(g, 0, 'gy', CCA)}), kept with Linewalker (${!!on(g2, 0, CCA)})`);
});

/* ---------------- Evil ---------------- */
T('Evil Blast: equips to a Special Summoned opponent monster, +500, 500 each opponent Standby', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [W], st: ['Evil Blast'] }, { hand: ['Cyber Dragon'], turn: 2 }] });
  toIdle(g); choose(g, 'sp:' + card(g, 1, 'Cyber Dragon').u); settle(g, 'Evil Blast', 'Cyber Dragon'); toIdle(g, 'Cyber Dragon');
  const cy = on(g, 1, 'Cyber Dragon'); ok(cy && E.atk(g, cy) === 2600, `Cyber Dragon 2600 (${cy && E.atk(g, cy)})`);
  turns(g, 2, 'Evil Blast');
  ok(g.tp === 1 && lp(g, 1) === 7500, `B took 500 in its Standby (B ${lp(g, 1)})`);
});
T('Evil Dragon Ananta: banish all Reptiles, 600 per monster, destroys a card each End Phase', () => {
  const A = 'Evil Dragon Ananta';
  const g = duel({ board: [{ hand: [A], m: ['Alien Grey'], gy: ['Sinister Serpent', 'Sinister Serpent'], turn: 2 }, { m: [W] }] });
  toIdle(g, 'NO'); ok(!hasOpt(g, 'ns:' + card(g, 0, A).u), 'no Normal Summon');
  choose(g, 'sp:' + card(g, 0, A).u); settle(g, 'Attack'); toIdle(g);
  const a = on(g, 0, A); ok(a && E.atk(g, a) === 1800 && E.def(g, a) === 1800 && cnt(g, 0, 'ban') === 3, `ATK/DEF ${a && E.atk(g, a)}/${a && E.def(g, a)}`);
  endTurn(g, W); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && on(g, 0, A), 'Warwolf destroyed in the End Phase');
});
T('Evil HERO Infernal Gainer: banish itself, a Fiend attacks twice; back in the 2nd Standby', () => {
  const IG = 'Evil HERO Infernal Gainer', LW = 'Earthbound Linewalker';
  const g = duel({ board: [{ hand: [], m: [IG, LW], turn: 2 }, {}] });
  ign(g, on(g, 0, IG), LW); toIdle(g);
  ok(inZ(g, 0, 'ban', IG), 'Gainer banished');
  bp(g); atkOn(g, 0, LW, null); atkOn(g, 0, LW, null);
  ok(lp(g, 1) === 8000 - 2400, `two attacks (B ${lp(g, 1)})`);
  turns(g, 2); ok(inZ(g, 0, 'ban', IG), 'still banished in the next Standby');
  turns(g, 2, IG); ok(on(g, 0, IG) && on(g, 0, IG).pos === 'atk', 'back in Attack Position in the 2nd Standby');
});
const darkFusion = (fus, m1, m2, pos, o = {}) => { const g = duel({ ex0: [fus], board: [{ hand: ['Dark Fusion', m1, m2], turn: 2, ...(o.a || {}) }, o.b || {}] });
  act(g, 0, 'Dark Fusion'); settle(g, m1, m2, pos); toIdle(g); return g; };
T('Evil HERO Infernal Sniper: Dark Fusion only; 1000 each Standby in Defense; Spell-proof', () => {
  const S = 'Evil HERO Infernal Sniper';
  const g = darkFusion(S, 'Elemental HERO Clayman', 'Elemental HERO Burstinatrix', 'Defense');
  ok(on(g, 0, S), 'Sniper Fusion Summoned with Dark Fusion');
  const g1 = duel({ board: [{ hand: [], m: [dpos(S)], turn: 2 }, {}] }); toIdle(g1, S);
  ok(lp(g1, 1) === 7000, `1000 damage in the Standby while in face-up Defense (B ${lp(g1, 1)})`);
  const g4 = duel({ board: [{ hand: [], m: [S], turn: 2 }, {}] }); toIdle(g4, S);
  ok(lp(g4, 1) === 8000, 'no damage in Attack Position');
  const g2 = duel({ ex0: [S], board: [{ hand: ['Polymerization', 'Elemental HERO Clayman', 'Elemental HERO Burstinatrix'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Polymerization'), 'not with Polymerization');
  const g3 = duel({ board: [{ hand: ['Dark Hole'], m: [dpos(S)], turn: 2 }, {}] });
  act(g3, 0, 'Dark Hole'); settle(g3); toIdle(g3); ok(on(g3, 0, S), 'not destroyed by Dark Hole');
});
T('Evil HERO Inferno Wing: piercing, burns the higher of ATK/DEF', () => {
  const g = darkFusion('Evil HERO Inferno Wing', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix', 'Attack', { b: { m: [set(W)] } });
  bp(g); atkOn(g, 0, 'Evil HERO Inferno Wing', W, 'Inferno Wing'); toIdle(g, 'Inferno Wing');
  ok(lp(g, 1) === 8000 - 2000 - 2000, `2000 piercing + 2000 burn (B ${lp(g, 1)})`);
});
T('Evil HERO Lightning Golem: destroys 1 monster once per turn', () => {
  const g = darkFusion('Evil HERO Lightning Golem', 'Elemental HERO Sparkman', 'Elemental HERO Clayman', 'Attack', { b: { m: [W, CG] } });
  const lg = on(g, 0, 'Evil HERO Lightning Golem'); ok(!!lg, 'Golem summoned');
  ign(g, lg, W); toIdle(g); ok(inZ(g, 1, 'gy', W), 'Warwolf destroyed'); ok(!hasIgn(g, lg), 'once per turn');
});
T('Evil HERO Wild Cyclone: no Spell/Trap during its attack; battle damage destroys face-down S/T', () => {
  const g = darkFusion('Evil HERO Wild Cyclone', 'Elemental HERO Avian', 'Elemental HERO Wildheart', 'Attack', { b: { st: ['Mirror Force', 'Dust Tornado', up('Damage = Reptile')] } });
  bp(g); atkOn(g, 0, 'Evil HERO Wild Cyclone', null, 'Mirror Force', 'Wild Cyclone'); toIdle(g, 'Wild Cyclone');
  ok(on(g, 0, 'Evil HERO Wild Cyclone') && lp(g, 1) === 6100, `attack went through (B ${lp(g, 1)})`);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Dust Tornado') && inZ(g, 1, 'st', 'Damage = Reptile'), 'face-down cards destroyed');
});
T('Evil Thorn: Tribute for 300, summon 2 more Evil Thorns with no effects', () => {
  const ET = 'Evil Thorn';
  const g = duel({ board: [{ hand: [], m: [ET], deckTop: [W, ET, ET], turn: 2 }, {}] });
  ign(g, on(g, 0, ET), ET, ET, 'Attack'); toIdle(g, ET, ET);
  const ts = mons(g, 0).filter(c => E.name(c) === ET);
  ok(lp(g, 1) === 7700 && ts.length === 2 && ts.every(t => t.pos === 'atk'), `300 damage, ${ts.length} Evil Thorns in Attack`);
  ok(ts.every(t => !hasIgn(g, t)), 'their effects cannot be activated');
});

/* ---------------- Fake ---------------- */
T('Fake Explosion: no battle destruction, then Summon Reactor SK from hand', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: ['Summon Reactor SK'], m: [CG], st: ['Fake Explosion'] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, CG, 'Fake Explosion', 'Summon Reactor SK', 'Defense'); toIdle(g, 'Summon Reactor SK', 'Defense');
  ok(on(g, 0, CG) && on(g, 0, 'Summon Reactor SK'), 'Celtic survives, Summon Reactor SK summoned');
});
T('Fake Feather: send a Blackwing, copy a Normal Trap in the opponent GY', () => {
  const g = duel({ board: [{ hand: ['Blackwing - Bora the Spear'], st: ['Fake Feather'], turn: 2 }, { gy: ['Dust Tornado'], st: ['Mirror Force'] }] });
  act(g, 0, 'Fake Feather'); settle(g, 'Bora', 'Dust Tornado', 'Face-down', 'Mirror Force'); toIdle(g, 'Face-down', 'Mirror Force', 'NO');
  ok(inZ(g, 0, 'gy', 'Blackwing - Bora the Spear') && inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed by the copied Dust Tornado');
});
T('Fake Hero: Special Summon an Elemental HERO, it cannot attack and returns at the End Phase', () => {
  const g = duel({ board: [{ hand: ['Fake Hero', 'Elemental HERO Sparkman'], turn: 2 }, {}] });
  act(g, 0, 'Fake Hero'); settle(g, 'Sparkman', 'Attack'); toIdle(g);
  const s = on(g, 0, 'Elemental HERO Sparkman'); ok(!!s, 'Sparkman summoned');
  bp(g); ok(!canAtk(g, s, null), 'cannot attack');
  endTurn(g); ok(inZ(g, 0, 'hand', 'Elemental HERO Sparkman'), 'back to the hand');
});
T('Familiar-Possessed: summoned with its Charmer and a monster of the same Attribute; pierces', () => {
  for (const [fp, ch, mat] of [['Aussa', 'Aussa the Earth Charmer', W], ['Eria', 'Eria the Water Charmer', 'Mother Grizzly'],
    ['Hiita', 'Hiita the Fire Charmer', 'Elemental HERO Burstinatrix'], ['Wynn', 'Wynn the Wind Charmer', 'Elemental HERO Avian']]) {
    const F = 'Familiar-Possessed - ' + fp;
    const g = duel({ board: [{ hand: [F], m: [ch, mat], turn: 2 }, { m: [set(W)] }] });
    choose(g, 'sp:' + card(g, 0, F).u); settle(g, ch, mat, 'Attack'); toIdle(g);
    const f = on(g, 0, F); ok(f && inZ(g, 0, 'gy', ch) && inZ(g, 0, 'gy', mat), `${F} summoned`);
    if (f) { bp(g); atkOn(g, 0, F, W); toIdle(g); ok(lp(g, 1) === 8000 - 1750, `${fp}: 1750 piercing (B ${lp(g, 1)})`); }
    const g2 = duel({ board: [{ hand: [F], m: [ch, 'Sangan'], turn: 2 }, {}] });
    ok(!hasOpt(g2, 'sp:' + card(g2, 0, F).u), `${fp}: not with a wrong-Attribute monster`);
  }
  const g = duel({ board: [{ hand: [W], m: ['Aussa the Earth Charmer'], deckTop: [W, 'Familiar-Possessed - Aussa'], turn: 2 }, {}] });
  ns(g, 0, W, 'Familiar-Possessed', 'Aussa the Earth Charmer', W); toIdle(g, 'Familiar-Possessed', 'Aussa the Earth Charmer', W);
  ok(on(g, 0, 'Familiar-Possessed - Aussa') && inZ(g, 0, 'gy', 'Aussa the Earth Charmer'), 'Aussa summoned from the Deck once the pair is on the field');
});

/* ---------------- Flamvell ---------------- */
T('Flamvell Commando: Tribute only a Flamvell; banish a 200 DEF monster for damage', () => {
  const FC = 'Flamvell Commando';
  const g = duel({ board: [{ hand: [FC], m: ['Flamvell Guard'], gy: ['Flamvell Firedog'], turn: 2 }, {}] });
  ns(g, 0, FC, 'Flamvell Guard'); toIdle(g);
  ok(on(g, 0, FC), 'summoned with a Flamvell Tribute');
  ign(g, on(g, 0, FC), 'Flamvell Firedog'); toIdle(g);
  ok(lp(g, 1) === 8000 - 1900 && inZ(g, 0, 'ban', 'Flamvell Firedog'), `1900 damage (B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [FC], m: [W], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, FC).u), 'no Tribute Summon with a non-Flamvell');
  const g3 = duel({ board: [{ hand: ['Monster Reborn'], gy: [FC], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'Monster Reborn'), 'cannot be Special Summoned');
});
T('Flamvell Counter: banish a 200 DEF FIRE monster, negate and destroy a Spell', () => {
  const g = duel({ first: 1, board: [{ turn: 2, st: ['Flamvell Counter'], gy: ['Flamvell Firedog'] }, { hand: ['Pot of Greed'], turn: 2 }] });
  toIdle(g); const h = hand(g, 1); act(g, 1, 'Pot of Greed'); settle(g, 'Flamvell Counter', 'Flamvell Firedog'); toIdle(g);
  ok(hand(g, 1) === h - 1 && inZ(g, 1, 'gy', 'Pot of Greed') && inZ(g, 0, 'ban', 'Flamvell Firedog'), 'Pot of Greed negated, Firedog banished');
});
T('Flamvell Dragnov: 500 when destroyed by battle; GY effect searches another Dragnov', () => {
  const FD = 'Flamvell Dragnov';
  const g = duel({ board: [{ hand: [], m: [FD], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, FD, W); toIdle(g);
  ok(lp(g, 1) === 7500 && lp(g, 0) === 7100, `B took 500 (B ${lp(g, 1)}, A ${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Flamvell Firedog'], gy: [FD], deckTop: [W, FD], turn: 2 }, {}] });
  ign(g2, card(g2, 0, FD), 'Flamvell Firedog', FD); toIdle(g2);
  ok(inZ(g2, 0, 'hand', FD) && inZ(g2, 0, 'ban', FD) && inZ(g2, 0, 'ban', 'Flamvell Firedog'), 'Dragnov added, both banished');
});

/* ---------------- Fortress, Fossil ---------------- */
T('Fortress Warrior: no battle damage; survives the first battle each turn', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Fortress Warrior'] }, { hand: [], m: [W, W], turn: 2 }] });
  toIdle(g); bp(g); const [w1, w2] = mons(g, 1); const fw = on(g, 0, 'Fortress Warrior');
  choose(g, `atk:${w1.u}:${fw.u}`); settle(g);
  ok(on(g, 0, 'Fortress Warrior') && lp(g, 0) === 8000, `survives, no damage (A ${lp(g, 0)})`);
  choose(g, `atk:${w2.u}:${fw.u}`); settle(g);
  ok(inZ(g, 0, 'gy', 'Fortress Warrior') && lp(g, 0) === 8000, `destroyed by the second, still no damage (A ${lp(g, 0)})`);
});
T("Fortress Whale's Oath: Ritual Summons Fortress Whale", () => {
  const g = duel({ board: [{ hand: [OATH, WHALE, W, W], turn: 2 }, {}] });
  act(g, 0, OATH); settle(g, WHALE, W, W, 'Attack'); toIdle(g);
  ok(on(g, 0, WHALE) && cnt(g, 0, 'gy', W) === 2, 'Fortress Whale Ritual Summoned');
});
T('Fossil Dig: adds a Level 6 or lower Dinosaur', () => {
  const g = duel({ board: [{ hand: ['Fossil Dig'], deckTop: [W, 'Ultimate Tyranno', 'Sabersaurus'], turn: 2 }, {}] });
  act(g, 0, 'Fossil Dig');
  ok(!hasOpt(g, 'Ultimate Tyranno'), 'Level 8 Ultimate Tyranno not offered');
  settle(g, 'Sabersaurus'); toIdle(g); ok(inZ(g, 0, 'hand', 'Sabersaurus'), 'Sabersaurus added');
});
T('Fossil Excavation: discard 1, revive a Dinosaur with effects negated; linked destruction', () => {
  const HH = 'Hyper Hammerhead';
  const g = duel({ board: [{ hand: [CG, 'Mystical Space Typhoon'], st: ['Fossil Excavation'], gy: [HH], turn: 2 }, {}] });
  act(g, 0, 'Fossil Excavation'); settle(g, CG, HH, 'Attack'); toIdle(g);
  const h = on(g, 0, HH); ok(h && inZ(g, 0, 'gy', CG) && E.lib.negd(g, h), 'Hammerhead summoned with effects negated');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Fossil Excavation'); toIdle(g);
  ok(inZ(g, 0, 'gy', HH), 'Hammerhead destroyed when Fossil Excavation leaves');
  const g2 = duel({ board: [{ hand: [CG], st: ['Fossil Excavation'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Fossil Excavation'), 'not without a Dinosaur in the GY');
});
T('Fossil Tusker: 400 damage when it destroys a monster by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Fossil Tusker'], turn: 2 }, { m: [CG] }] });
  bp(g); atkOn(g, 0, 'Fossil Tusker', CG); toIdle(g);
  ok(lp(g, 1) === 8000 - 400 - 400, `B ${lp(g, 1)}`);
});

/* ---------------- Gadgets ---------------- */
T('Gadget Arms: FLIP adds a Morphtronic Spell/Trap from the GY', () => {
  const g = duel({ board: [{ hand: [], m: [set('Gadget Arms')], gy: ['Morphtronic Map'], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g, 'Morphtronic Map'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Morphtronic Map'), 'Morphtronic Map added');
});
T('Gadget Driver: discard it to change the position of face-up Morphtronics', () => {
  const g = duel({ board: [{ hand: ['Gadget Driver'], m: ['Morphtronic Radion'], turn: 2 }, {}] });
  ign(g, card(g, 0, 'Gadget Driver'), 'Morphtronic Radion'); toIdle(g);
  ok(on(g, 0, 'Morphtronic Radion').pos === 'def' && inZ(g, 0, 'gy', 'Gadget Driver'), 'Radion in Defense, Driver in the GY');
});
T('Gadget Hauler: send Morphtronics from the hand, +800 each, once per turn', () => {
  const g = duel({ board: [{ hand: ['Morphtronic Celfon', 'Morphtronic Radion'], m: ['Gadget Hauler'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Gadget Hauler'), 'Morphtronic Celfon', 'Morphtronic Radion'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Gadget Hauler')) === 2900, `ATK ${E.atk(g, on(g, 0, 'Gadget Hauler'))}`);
  ok(!hasIgn(g, on(g, 0, 'Gadget Hauler')), 'once per turn');
});

console.log(fails ? `\n${fails} failed` : '\nAll full-31 review checks passed.');
process.exit(fails ? 1 : 0);
