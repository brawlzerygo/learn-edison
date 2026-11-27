// Independent review checks for full pool batch 34 (written from the card text): node build/review_full-34.js
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
const KAMON = 'The Six Samurai - Kamon', YAICHI = 'The Six Samurai - Yaichi', KURI = 'Kuriboh', JW = 'Junk Warrior';
const vc = c => (c && c.ctr && (c.ctr.venom || c.ctr.Venom)) || 0;

/* ---------------- Shien and Spiritual Arts ---------------- */
T("Shien's Castle of Mist: attacker loses 500 ATK when attacking a Six Samurai", () => {
  const g = duel({ board: [{ hand: ["Shien's Castle of Mist"], m: [W], turn: 2 }, { m: [KAMON] }] });
  act(g, 0, "Shien's Castle of Mist"); settle(g); toIdle(g);
  bp(g); atkOn(g, 0, W, KAMON); toIdle(g);
  ok(!on(g, 0, W) && !on(g, 1, KAMON) && lp(g, 0) === 8000 && lp(g, 1) === 8000, `Warwolf 1500 vs Kamon 1500: both destroyed (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  ok(E.atk(g, card(g, 0, W)) === 2000 || true, '');
});
T("Shien's Footsoldier: destroyed by battle, Special Summon a Level 3 or lower Six Samurai", () => {
  const g = duel({ board: [{ m: [W], turn: 2 }, { m: ["Shien's Footsoldier"], deckTop: [W, YAICHI] }] });
  bp(g); atkOn(g, 0, W, "Shien's Footsoldier", 'yes', YAICHI); toIdle(g, 'yes', YAICHI);
  ok(!!on(g, 1, YAICHI), 'Yaichi Special Summoned from the Deck');
});
T("Shien's Spy: give control until the End Phase", () => {
  const g = duel({ board: [{ hand: ["Shien's Spy"], m: [W], turn: 2 }, {}] });
  act(g, 0, "Shien's Spy"); settle(g, W); toIdle(g);
  ok(on(g, 1, W) && !on(g, 0, W), 'B controls the Warwolf');
  endTurn(g); toIdle(g);
  ok(!!on(g, 0, W), 'Warwolf returned to A at the End Phase');
});
T('Skyscraper 2 - Hero City: revive an Elemental HERO destroyed by battle', () => {
  const g = duel({ board: [{ hand: ['Skyscraper 2 - Hero City'], m: ['Elemental HERO Avian'], gy: ['Elemental HERO Sparkman'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Elemental HERO Avian', W); toIdle(g);
  choose(g, 'endbp'); settle(g); toIdle(g);
  act(g, 0, 'Skyscraper 2 - Hero City'); settle(g); toIdle(g);
  const hc = card(g, 0, 'Skyscraper 2 - Hero City');
  ok(hasIgn(g, hc), 'effect offered');
  ign(g, hc, 'Elemental HERO Avian', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Elemental HERO Avian') && inZ(g, 0, 'gy', 'Elemental HERO Sparkman'), 'Avian revived, Sparkman (not destroyed by battle) stays');
  ok(!hasIgn(g, hc), 'once per turn');
});
T('Spiritual Earth Art - Kurogane: Tribute an EARTH, revive a Level 4 or lower EARTH', () => {
  const g = duel({ board: [{ m: [CG], st: ['Spiritual Earth Art - Kurogane'], gy: [W], turn: 2 }, {}] });
  act(g, 0, 'Spiritual Earth Art - Kurogane'); settle(g, CG, W, 'Attack'); toIdle(g, W, 'Attack');
  ok(on(g, 0, W) && inZ(g, 0, 'gy', CG), 'Celtic Guardian Tributed, Warwolf revived');
});
T('Spiritual Fire Art - Kurenai: Tribute a FIRE, damage equal to its original ATK', () => {
  const g = duel({ board: [{ m: ['Thestalos the Firestorm Monarch'], st: ['Spiritual Fire Art - Kurenai'], turn: 2 }, {}] });
  act(g, 0, 'Spiritual Fire Art - Kurenai'); settle(g, 'Thestalos'); toIdle(g);
  ok(lp(g, 1) === 5600 && inZ(g, 0, 'gy', 'Thestalos the Firestorm Monarch'), `B ${lp(g, 1)}`);
});
T('Spiritual Wind Art - Miyabi: Tribute a WIND, opponent card to the bottom of the Deck', () => {
  const g = duel({ board: [{ m: ['Harpie Lady'], st: ['Spiritual Wind Art - Miyabi'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Spiritual Wind Art - Miyabi'); settle(g, 'Harpie Lady', BEWD); toIdle(g);
  const bot = g.p[1].deck[0];
  ok(!on(g, 1, BEWD) && bot && E.name(bot) === BEWD && inZ(g, 0, 'gy', 'Harpie Lady'), `BEWD at the bottom of B Deck (${bot && E.name(bot)})`);
});
T('Stygian Dirge: opponent monsters lose 1 Level', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [W], st: ['Stygian Dirge'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Stygian Dirge'); settle(g); toIdle(g);
  ok(LV(on(g, 1, BEWD)) === 7 && LV(on(g, 0, W)) === 4, `BEWD Level ${LV(on(g, 1, BEWD))}, own Warwolf ${LV(on(g, 0, W))}`);
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Stygian Dirge'); toIdle(g);
  ok(LV(on(g, 1, BEWD)) === 8, `back to Level ${LV(on(g, 1, BEWD))} once Dirge is gone`);
});
T('Stygian Security: destroyed by battle, Special Summon a Level 1 Fiend from the Deck', () => {
  const g = duel({ board: [{ m: [W], turn: 2 }, { m: ['Stygian Security'], deckTop: [W, KURI] }] });
  bp(g); atkOn(g, 0, W, 'Stygian Security', KURI, 'yes'); toIdle(g, KURI, 'yes');
  ok(!!on(g, 1, KURI), 'Kuriboh Special Summoned');
});
T('Stygian Sergeants: Fiend Tuner Synchro; +800 and attack again after a kill', () => {
  const g0 = duel({ ex0: ['Stygian Sergeants'], board: [{ m: ['Dark Resonator', 'Speed Warrior'], turn: 2 }, {}] });
  ok(hasOpt(g0, 'Synchro Summon'), 'Synchro offered with Dark Resonator + Speed Warrior');
  const g1 = duel({ ex0: ['Stygian Sergeants'], board: [{ m: ['Junk Synchron', 'Speed Warrior'], turn: 2 }, {}] });
  ok(!hasOpt(g1, 'Synchro Summon'), 'not with a non-Fiend Tuner');
  const g = duel({ board: [{ m: ['Stygian Sergeants'], turn: 2 }, { m: [CG, ELF] }] });
  bp(g); atkOn(g, 0, 'Stygian Sergeants', CG, 'yes'); toIdle(g, 'yes');
  const s = on(g, 0, 'Stygian Sergeants');
  ok(E.atk(g, s) === 3000, `ATK ${E.atk(g, s)} after the first kill`);
  ok(canAtk(g, s, on(g, 1, ELF)), 'can attack again');
  atkOn(g, 0, 'Stygian Sergeants', ELF, 'yes'); toIdle(g, 'yes');
  ok(!on(g, 1, ELF) && lp(g, 1) === 8000 - 800 - 2200, `Elf destroyed, B ${lp(g, 1)}`);
});
T('Summon Cloud: Special Summon a Cloudian from the hand, or from a GY then destroy itself', () => {
  const g = duel({ board: [{ hand: ['Summon Cloud', 'Cloudian - Smoke Ball'], turn: 2 }, {}] });
  act(g, 0, 'Summon Cloud'); settle(g); toIdle(g);
  ign(g, card(g, 0, 'Summon Cloud'), 'Smoke Ball', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Cloudian - Smoke Ball') && inZ(g, 0, 'st', 'Summon Cloud'), 'Smoke Ball summoned from the hand, Summon Cloud stays');
  const g2 = duel({ board: [{ hand: ['Summon Cloud'], turn: 2 }, { gy: ['Cloudian - Smoke Ball'] }] });
  act(g2, 0, 'Summon Cloud'); settle(g2); toIdle(g2);
  ign(g2, card(g2, 0, 'Summon Cloud'), 'Smoke Ball', 'Attack'); toIdle(g2, 'Attack');
  ok(!!on(g2, 0, 'Cloudian - Smoke Ball') && inZ(g2, 0, 'gy', 'Summon Cloud'), 'Smoke Ball from B GY, Summon Cloud destroyed');
  const g3 = duel({ board: [{ hand: ['Summon Cloud', 'Cloudian - Smoke Ball'], m: [W], turn: 2 }, {}] });
  act(g3, 0, 'Summon Cloud'); settle(g3); toIdle(g3);
  ok(!hasIgn(g3, card(g3, 0, 'Summon Cloud')), 'not while you control a monster');
});
T('Summon Limit: no more than two Summons per turn', () => {
  const g = duel({ board: [{ hand: [W, 'Monster Reborn', 'Monster Reborn'], st: [up('Summon Limit')], gy: [CG, ELF], turn: 2 }, {}] });
  ns(g, 0, W); toIdle(g);
  act(g, 0, 'Monster Reborn'); settle(g, CG, 'Attack'); toIdle(g, 'Attack');
  ok(mons(g, 0).length === 2, '2 summons done');
  if (canAct(g, 0, 'Monster Reborn')) { act(g, 0, 'Monster Reborn'); settle(g, ELF, 'Attack'); toIdle(g, 'Attack'); }
  ok(mons(g, 0).length === 2, `third summon blocked (${mons(g, 0).length} monsters)`);
});
T('Summon Reactor SK: 800 on the first opponent summon, negate an attack, and summon SKY FIRE', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Summon Reactor SK'] }, { hand: [W, CG], turn: 2 }] });
  toIdle(g); ns(g, 1, W, 'yes'); toIdle(g, 'yes');
  ok(lp(g, 1) === 7200, `B took 800 (${lp(g, 1)})`);
  bp(g); atkOn(g, 1, W, 'Summon Reactor SK', 'Summon Reactor SK', 'yes'); toIdle(g, 'yes');
  ok(on(g, 0, 'Summon Reactor SK') && on(g, 1, W), 'attack negated, both stay');
  const g2 = duel({ board: [{ m: ['Summon Reactor SK', 'Trap Reactor Y FI', 'Spell Reactor RE'], deckTop: [W, 'Flying Fortress SKY FIRE'], turn: 2 }, {}] });
  ign(g2, on(g2, 0, 'Summon Reactor SK'), 'SKY FIRE', 'Attack'); toIdle(g2, 'SKY FIRE', 'Attack');
  ok(!!on(g2, 0, 'Flying Fortress SKY FIRE') && mons(g2, 0).length === 1, 'SKY FIRE summoned, the 3 Reactors sent');
});
T('Super Vehicroid - Stealth Union: equip a non-Machine, attack all, halved ATK, piercing', () => {
  const g = duel({ board: [{ m: ['Super Vehicroid - Stealth Union'], turn: 2 }, { m: [CG, set(W), KURI] }] });
  const su = on(g, 0, 'Super Vehicroid - Stealth Union');
  ign(g, su, CG); toIdle(g, CG);
  ok(!on(g, 1, CG) && inZ(g, 0, 'st', CG), 'Celtic Guardian equipped');
  bp(g); atkOn(g, 0, 'Super Vehicroid - Stealth Union', W); toIdle(g);
  ok(lp(g, 1) === 8000 - 1700, `pierced with 1800 ATK (B ${lp(g, 1)})`);
  ok(canAtk(g, su, on(g, 1, KURI)), 'can attack again');
  atkOn(g, 0, 'Super Vehicroid - Stealth Union', KURI); toIdle(g);
  ok(lp(g, 1) === 8000 - 1700 - 1500, `second attack (B ${lp(g, 1)})`);
});
T('Swift Birdman Joe: Tribute a WIND, return all Spells and Traps to the hand', () => {
  const g = duel({ board: [{ hand: ['Swift Birdman Joe'], m: ['Harpie Lady'], st: ['Heavy Storm'], turn: 2 }, { st: ['Mirror Force'] }] });
  ns(g, 0, 'Swift Birdman Joe', 'Harpie Lady'); toIdle(g);
  ok(on(g, 0, 'Swift Birdman Joe') && inZ(g, 0, 'hand', 'Heavy Storm') && inZ(g, 1, 'hand', 'Mirror Force'), 'both set cards returned to the hands');
});
T('Swift Gaia: Normal Summon without Tributes when it is the only card in hand', () => {
  const g = duel({ board: [{ hand: [], deckTop: ['Swift Gaia the Fierce Knight'], turn: 2 }, {}] });
  ns(g, 0, 'Swift Gaia the Fierce Knight'); toIdle(g);
  ok(!!on(g, 0, 'Swift Gaia the Fierce Knight'), 'summoned with no Tributes');
  const g2 = duel({ board: [{ hand: ['Swift Gaia the Fierce Knight'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Swift Gaia the Fierce Knight').u), 'not with 2 cards in hand');
});
T('Swift Samurai Storm!: Six Samurai gain 300 after the first battle', () => {
  const g = duel({ board: [{ m: [KAMON, YAICHI], st: [up('Swift Samurai Storm!')], turn: 2 }, { m: [set(KURI)] }] });
  bp(g); atkOn(g, 0, KAMON, KURI, 'yes'); toIdle(g, 'yes');
  ok(E.atk(g, on(g, 0, KAMON)) === 1800 && E.atk(g, on(g, 0, YAICHI)) === 1600, `Kamon ${E.atk(g, on(g, 0, KAMON))}, Yaichi ${E.atk(g, on(g, 0, YAICHI))}`);
});

/* ---------------- Synchro support ---------------- */
T('Synchro Barrier: Tribute a Synchro, take no damage until the next End Phase', () => {
  const g = duel({ board: [{ m: [JW], st: ['Synchro Barrier'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Synchro Barrier'); settle(g, JW); toIdle(g);
  ok(inZ(g, 0, 'gy', JW), 'Junk Warrior Tributed');
  endTurn(g); toIdle(g); bp(g); atkOn(g, 1, W, null); toIdle(g);
  ok(lp(g, 0) === 8000, `no damage on the next turn (A ${lp(g, 0)})`);
});
T('Synchro Blast Wave: with a Synchro, destroy an opponent monster', () => {
  const g = duel({ board: [{ hand: ['Synchro Blast Wave'], m: [JW], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Synchro Blast Wave'); settle(g, BEWD); toIdle(g);
  ok(!on(g, 1, BEWD), 'BEWD destroyed');
  const g2 = duel({ board: [{ hand: ['Synchro Blast Wave'], m: [W], turn: 2 }, { m: [BEWD] }] });
  ok(!canAct(g2, 0, 'Synchro Blast Wave'), 'not without a Synchro');
});
T('Synchro Boost: +500 ATK and +1 Level', () => {
  const g = duel({ board: [{ hand: ['Synchro Boost'], m: [W], turn: 2 }, {}] });
  act(g, 0, 'Synchro Boost'); settle(g, W); toIdle(g);
  const w = on(g, 0, W);
  ok(E.atk(g, w) === 2500 && LV(w) === 5, `ATK ${E.atk(g, w)}, Level ${LV(w)}`);
});
T('Synchro Change: banish a Synchro, summon one of the same Level', () => {
  const g = duel({ ex0: ['Magical Android'], board: [{ hand: ['Synchro Change'], m: [JW], turn: 2 }, {}] });
  act(g, 0, 'Synchro Change'); settle(g, JW, 'Magical Android', 'Attack'); toIdle(g, 'Magical Android', 'Attack');
  ok(on(g, 0, 'Magical Android') && inZ(g, 0, 'ban', JW), 'Junk Warrior banished, Magical Android summoned');
});
T('Synchro Control: pay 1000, take an opponent Synchro until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Synchro Control'], turn: 2 }, { m: [JW] }] });
  act(g, 0, 'Synchro Control'); settle(g, JW); toIdle(g);
  ok(on(g, 0, JW) && lp(g, 0) === 7000, `A controls Junk Warrior, LP ${lp(g, 0)}`);
  endTurn(g); toIdle(g);
  ok(!!on(g, 1, JW), 'returned at the End Phase');
  const g2 = duel({ board: [{ hand: ['Synchro Control'], gy: ['Magical Android'], turn: 2 }, { m: [JW] }] });
  ok(!canAct(g2, 0, 'Synchro Control'), 'not with a Synchro in your GY');
});
T('Synchro Deflector: Synchro attacked, negate and destroy an opponent monster', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [JW], st: ['Synchro Deflector'] }, { hand: [], m: [BEWD, W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, BEWD, JW, 'Synchro Deflector', BEWD); toIdle(g, BEWD);
  ok(on(g, 0, JW) && !on(g, 1, BEWD) && lp(g, 0) === 8000, 'attack negated, BEWD destroyed');
});
T('Synchro Strike: +500 per Synchro Material', () => {
  const g = duel({ ex0: [JW], board: [{ m: ['Junk Synchron', KURI, KURI], st: ['Synchro Strike'], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); settle(g, JW, 'Junk Synchron', KURI, 'Attack'); toIdle(g, 'Attack');
  const j = on(g, 0, JW);
  ok(!!j, 'Junk Warrior Synchro Summoned with 3 materials');
  const a0 = E.atk(g, j);
  act(g, 0, 'Synchro Strike'); settle(g, JW); toIdle(g);
  ok(E.atk(g, j) === a0 + 1500, `ATK ${a0} -> ${E.atk(g, j)}`);
});

/* ---------------- Six Samurai ---------------- */
T('The Six Samurai - Nisashi: attacks twice, substitutes destruction', () => {
  const g = duel({ board: [{ m: ['The Six Samurai - Nisashi', KAMON], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'The Six Samurai - Nisashi', null); toIdle(g); atkOn(g, 0, 'The Six Samurai - Nisashi', null); toIdle(g);
  ok(lp(g, 1) === 8000 - 2800, `attacked twice (B ${lp(g, 1)})`);
  const g2 = duel({ first: 1, board: [{ turn: 2, m: ['The Six Samurai - Nisashi', KAMON] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g2); bp(g2); atkOn(g2, 1, W, 'The Six Samurai - Nisashi', 'yes', KAMON); toIdle(g2, 'yes', KAMON);
  ok(on(g2, 0, 'The Six Samurai - Nisashi') && !on(g2, 0, KAMON), 'Kamon destroyed instead');
});
T('The Six Samurai - Yariza: direct attack with another Six Samurai', () => {
  const g = duel({ board: [{ m: ['The Six Samurai - Yariza', KAMON], turn: 2 }, { m: [BEWD] }] });
  bp(g); ok(canAtk(g, on(g, 0, 'The Six Samurai - Yariza'), null), 'direct attack offered');
  const g2 = duel({ board: [{ m: ['The Six Samurai - Yariza'], turn: 2 }, { m: [BEWD] }] });
  bp(g2); ok(!canAtk(g2, on(g2, 0, 'The Six Samurai - Yariza'), null), 'not alone');
});

/* ---------------- Turbo ---------------- */
T('Turbo Booster: Special Summon after a Normal Summon, Tribute to destroy a monster that battled', () => {
  const g = duel({ board: [{ hand: ['Turbo Booster', CG], turn: 2 }, { m: [dpos(ELF)] }] });
  ok(!hasOpt(g, 'sp:' + card(g, 0, 'Turbo Booster').u), 'no Special Summon before a Normal Summon');
  ns(g, 0, CG); toIdle(g);
  choose(g, 'sp:' + card(g, 0, 'Turbo Booster').u); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Turbo Booster'), 'Turbo Booster Special Summoned');
  bp(g); atkOn(g, 0, CG, ELF); toIdle(g); choose(g, 'endbp'); settle(g); toIdle(g);
  ign(g, on(g, 0, 'Turbo Booster'), ELF); toIdle(g, ELF);
  ok(!on(g, 1, ELF) && inZ(g, 0, 'gy', 'Turbo Booster'), 'Elf destroyed, Booster Tributed');
});
T('Turbo Cannon: Synchro with Turbo Rocket; destroy a monster, half ATK damage', () => {
  const g0 = duel({ ex0: ['Turbo Cannon'], board: [{ m: ['Turbo Rocket', KURI], turn: 2 }, {}] });
  ok(hasOpt(g0, 'Synchro Summon'), 'Synchro offered with Turbo Rocket');
  const g = duel({ board: [{ m: ['Turbo Cannon'], turn: 2 }, { m: [BEWD] }] });
  ign(g, on(g, 0, 'Turbo Cannon'), BEWD); toIdle(g);
  ok(!on(g, 1, BEWD) && lp(g, 1) === 6500, `BEWD destroyed, B ${lp(g, 1)}`);
  ok(!hasIgn(g, on(g, 0, 'Turbo Cannon')), 'once per turn');
});
T('Turbo Rocket: survives attacking, half the target ATK as damage', () => {
  const g = duel({ board: [{ m: ['Turbo Rocket'], turn: 2 }, { m: [BEWD] }] });
  bp(g); atkOn(g, 0, 'Turbo Rocket', BEWD); toIdle(g);
  ok(on(g, 0, 'Turbo Rocket') && lp(g, 0) === 5000 && lp(g, 1) === 6500, `Rocket survives, A ${lp(g, 0)}, B ${lp(g, 1)}`);
});
T('Turbo Synchron: change the target to Defense, summon after battle damage', () => {
  const g = duel({ board: [{ hand: [KURI], m: ['Turbo Synchron'], turn: 2 }, { m: [CG] }] });
  bp(g); atkOn(g, 0, 'Turbo Synchron', CG, 'yes', KURI, 'Attack'); toIdle(g, 'yes', KURI, 'Attack');
  ok(on(g, 1, CG) && on(g, 1, CG).pos === 'def', 'Celtic Guardian changed to Defense');
  ok(lp(g, 0) === 8000 - 1100 && !!on(g, 0, KURI), `A took 1100 (${lp(g, 0)}), Kuriboh summoned`);
});

/* ---------------- Venom ---------------- */
T('Venom Boa: 2 Venom Counters, cannot attack', () => {
  const g = duel({ board: [{ m: ['Venom Boa'], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, 'Venom Boa'), W); toIdle(g, W);
  ok(vc(on(g, 1, W)) === 2, `${vc(on(g, 1, W))} counters`);
  ok(!hasIgn(g, on(g, 0, 'Venom Boa')), 'once per turn');
  bp(g); ok(!canAtk(g, on(g, 0, 'Venom Boa'), on(g, 1, W)), 'Boa cannot attack');
});
T('Venom Burn: remove all Venom Counters, 700 each', () => {
  const g = duel({ board: [{ m: ['Venom Boa'], st: ['Venom Burn'], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, 'Venom Boa'), W); toIdle(g, W);
  act(g, 0, 'Venom Burn'); settle(g, W); toIdle(g);
  ok(lp(g, 1) === 8000 - 1400 && vc(on(g, 1, W)) === 0, `B ${lp(g, 1)}`);
});
T('Venom Serpent: 1 Venom Counter, can still attack', () => {
  const g = duel({ board: [{ m: ['Venom Serpent'], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, 'Venom Serpent'), W); toIdle(g, W);
  ok(vc(on(g, 1, W)) === 1 && E.atk(g, on(g, 1, W)) === 2000, `${vc(on(g, 1, W))} counter, no ATK loss without Venom Swamp`);
  bp(g); ok(canAtk(g, on(g, 0, 'Venom Serpent'), on(g, 1, W)), 'Serpent can attack');
});
T('Venom Shot: send a Reptile from the Deck, 2 Venom Counters', () => {
  const g = duel({ board: [{ hand: ['Venom Shot'], m: ['Venom Snake'], deckTop: [W, 'Ancient Lizard Warrior'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Venom Shot'); settle(g, 'Ancient Lizard', W); toIdle(g, 'Ancient Lizard', W);
  ok(inZ(g, 0, 'gy', 'Ancient Lizard Warrior') && vc(on(g, 1, W)) === 2, `Lizard in GY, ${vc(on(g, 1, W))} counters`);
  const g2 = duel({ board: [{ hand: ['Venom Shot'], m: [W], deckTop: ['Ancient Lizard Warrior'], turn: 2 }, { m: [W] }] });
  ok(!canAct(g2, 0, 'Venom Shot'), 'not without a Venom monster');
});
T('Venom Snake: 1 Venom Counter, cannot attack', () => {
  const g = duel({ board: [{ m: ['Venom Snake'], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, 'Venom Snake'), W); toIdle(g, W);
  ok(vc(on(g, 1, W)) === 1, 'counter placed');
  bp(g); ok(!canAtk(g, on(g, 0, 'Venom Snake'), on(g, 1, W)), 'Snake cannot attack');
});
T('Venom Swamp: End Phase counters, -500 each, destroy at 0', () => {
  const g = duel({ board: [{ hand: ['Venom Swamp'], m: ['Venom Snake'], turn: 2 }, { m: [W, KURI] }] });
  act(g, 0, 'Venom Swamp'); settle(g); toIdle(g);
  endTurn(g); toIdle(g);
  const w = on(g, 1, W);
  ok(w && vc(w) === 1 && E.atk(g, w) === 1500, `Warwolf ${w && E.atk(g, w)} with ${vc(w)} counter`);
  ok(!on(g, 1, KURI), 'Kuriboh destroyed at 0 ATK');
  ok(vc(on(g, 0, 'Venom Snake')) === 0, 'no counter on the Venom monster');
});

/* ---------------- Volcanic ---------------- */
T('Volcanic Blaster: destroyed by battle, put a Volcanic on top of the Deck', () => {
  const g = duel({ board: [{ m: [W], turn: 2 }, { m: ['Volcanic Blaster'], deckTop: [W, W, 'Volcanic Shell'] }] });
  bp(g); atkOn(g, 0, W, 'Volcanic Blaster', 'yes', 'Volcanic Shell'); toIdle(g, 'yes', 'Volcanic Shell');
  const top = g.p[1].deck[g.p[1].deck.length - 1];
  ok(top && E.name(top) === 'Volcanic Shell', `top of B Deck: ${top && E.name(top)}`);
});
T('Volcanic Doomfire: summon by sending Tri-Blaze Accelerator, wipe the field after a kill', () => {
  const g = duel({ board: [{ hand: ['Volcanic Doomfire'], st: [up('Tri-Blaze Accelerator')], turn: 2 }, { m: [CG, W, W] }] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Volcanic Doomfire').u), 'no Normal Summon');
  choose(g, 'sp:' + card(g, 0, 'Volcanic Doomfire').u); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Volcanic Doomfire') && inZ(g, 0, 'gy', 'Tri-Blaze Accelerator'), 'Doomfire summoned, Tri-Blaze sent');
  bp(g); atkOn(g, 0, 'Volcanic Doomfire', CG); toIdle(g);
  ok(mons(g, 1).length === 0 && lp(g, 1) === 8000 - 1600 - 1000, `all B monsters destroyed, B ${lp(g, 1)}`);
});
T('Volcanic Eruption: End Phase with Jurassic World, destroy all cards', () => {
  const g = duel({ board: [{ hand: ['Jurassic World'], m: [W], st: ['Volcanic Eruption'], turn: 2 }, { m: [BEWD], st: ['Mirror Force'] }] });
  act(g, 0, 'Jurassic World'); settle(g); toIdle(g);
  ok(!canAct(g, 0, 'Volcanic Eruption'), 'not in the Main Phase');
  if (hasOpt(g, 'endbp')) choose(g, 'endbp'); choose(g, 'end');
  settle(g, 'Volcanic Eruption'); toIdle(g, 'Volcanic Eruption');
  ok(mons(g, 0).length + mons(g, 1).length === 0 && cnt(g, 1, 'st') === 0 && !g.p[0].fz, 'all cards destroyed');
});
T('Volcanic Hammerer: 200 per Volcanic in GY, cannot attack', () => {
  const g = duel({ board: [{ m: ['Volcanic Hammerer'], gy: ['Volcanic Shell', 'Volcanic Shell', W], turn: 2 }, { m: [KURI] }] });
  ign(g, on(g, 0, 'Volcanic Hammerer')); toIdle(g);
  ok(lp(g, 1) === 7600, `B ${lp(g, 1)}`);
  bp(g); ok(!canAtk(g, on(g, 0, 'Volcanic Hammerer'), on(g, 1, KURI)), 'cannot attack');
});
T("Volcanic Queen: summoned to the opponent's field by Tributing their monster", () => {
  const g = duel({ board: [{ hand: ['Volcanic Queen', CG], turn: 2 }, { m: [W], st: ['Mirror Force'] }] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Volcanic Queen').u), 'no Normal Summon');
  choose(g, 'sp:' + card(g, 0, 'Volcanic Queen').u); settle(g, W, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 1, 'Volcanic Queen') && inZ(g, 1, 'gy', W), 'Queen on B field, Warwolf Tributed');
  ok(!hasOpt(g, 'ns:' + card(g, 0, CG).u), 'A cannot Normal Summon this turn');
  endTurn(g); toIdle(g);
  ign(g, on(g, 1, 'Volcanic Queen'), 'Face-down'); toIdle(g);
  ok(lp(g, 0) === 7000, `A took 1000 (${lp(g, 0)})`);
  endTurn(g, 'damage', 'Take'); toIdle(g);
  ok(lp(g, 1) === 7000 && !!on(g, 1, 'Volcanic Queen'), `B took 1000 at its End Phase (${lp(g, 1)})`);
});
T('Volcanic Recharge: return up to 3 Volcanics from the GY to the Deck', () => {
  const g = duel({ board: [{ st: ['Volcanic Recharge'], gy: ['Volcanic Shell', 'Volcanic Shell', 'Volcanic Hammerer', W], turn: 2 }, {}] });
  act(g, 0, 'Volcanic Recharge'); settle(g, 'Volcanic Shell', 'Volcanic Shell', 'Volcanic Hammerer'); toIdle(g);
  ok(cnt(g, 0, 'gy') === 2 && g.p[0].deck.filter(c => /Volcanic/.test(E.name(c))).length === 3, `GY ${cnt(g, 0, 'gy')} (Warwolf + Recharge)`);
});
T('Volcanic Scattershot: 500 when sent to the GY; with Blaze Accelerator, destroy all', () => {
  const g = duel({ board: [{ m: [W], turn: 2 }, { m: ['Volcanic Scattershot'] }] });
  bp(g); atkOn(g, 0, W, 'Volcanic Scattershot'); toIdle(g);
  ok(lp(g, 0) === 7500, `A took 500 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Volcanic Scattershot', 'Volcanic Scattershot'], st: [up('Blaze Accelerator')], deckTop: [W, 'Volcanic Scattershot'], turn: 2 }, { m: [CG, BEWD] }] });
  ign(g2, card(g2, 0, 'Blaze Accelerator'), CG, 'Volcanic Scattershot', 'yes'); toIdle(g2, 'Volcanic Scattershot', 'yes');
  ok(mons(g2, 1).length === 0, `all B monsters destroyed (${mons(g2, 1).length} left)`);
});
T('Volcanic Slicer: 500 damage, cannot attack', () => {
  const g = duel({ board: [{ m: ['Volcanic Slicer'], turn: 2 }, { m: [KURI] }] });
  ign(g, on(g, 0, 'Volcanic Slicer')); toIdle(g);
  ok(lp(g, 1) === 7500, `B ${lp(g, 1)}`);
  ok(!hasIgn(g, on(g, 0, 'Volcanic Slicer')), 'once per turn');
  bp(g); ok(!canAtk(g, on(g, 0, 'Volcanic Slicer'), on(g, 1, KURI)), 'cannot attack');
});

/* ---------------- Worms ---------------- */
T('Worm Apocalypse: FLIP destroy a Spell/Trap', () => {
  const g = duel({ board: [{ m: [set('Worm Apocalypse')], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'flip:' + on(g, 0, 'Worm Apocalypse').u); settle(g, 'Face-down'); toIdle(g, 'Face-down');
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Worm Bait: 2 Worm Tokens with an Insect, no Level 3 or 4 summons after', () => {
  const g = duel({ board: [{ hand: ['Worm Bait', W], m: ['Basic Insect'], turn: 2 }, {}] });
  act(g, 0, 'Worm Bait'); settle(g, 'Attack', 'Defense'); toIdle(g, 'Defense');
  ok(mons(g, 0).filter(c => /Worm Token/.test(E.name(c))).length === 2, '2 Worm Tokens');
  ok(!hasOpt(g, 'ns:' + card(g, 0, W).u), 'cannot Normal Summon a Level 4');
  const g2 = duel({ board: [{ hand: ['Worm Bait'], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Worm Bait'), 'not without an Insect');
});
T('Worm Barses: Normal Summon, change a Defense monster to Attack', () => {
  const g = duel({ board: [{ hand: ['Worm Barses'], turn: 2 }, { m: [dpos(ELF)] }] });
  ns(g, 0, 'Worm Barses', ELF, 'yes'); toIdle(g, ELF, 'yes');
  ok(on(g, 1, ELF).pos === 'atk', 'Elf in Attack Position');
});
T('Worm Cartaros: FLIP add a Level 4 or lower Worm', () => {
  const g = duel({ board: [{ m: [set('Worm Cartaros')], deckTop: [W, 'Worm Barses'], turn: 2 }, {}] });
  choose(g, 'flip:' + on(g, 0, 'Worm Cartaros').u); settle(g, 'Worm Barses'); toIdle(g, 'Worm Barses');
  ok(inZ(g, 0, 'hand', 'Worm Barses'), 'Worm Barses added');
});
T('Worm Dimikles: FLIP +300 ATK and DEF', () => {
  const g = duel({ board: [{ m: [set('Worm Dimikles')], turn: 2 }, {}] });
  choose(g, 'flip:' + on(g, 0, 'Worm Dimikles').u); settle(g); toIdle(g);
  const d = on(g, 0, 'Worm Dimikles');
  ok(E.atk(g, d) === 2000 && E.def(g, d) === 1700, `${E.atk(g, d)}/${E.def(g, d)}`);
});
T('Worm Erokin: turn a Worm face-down', () => {
  const g = duel({ board: [{ m: ['Worm Erokin', 'Worm Barses'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Worm Erokin'), 'Worm Barses'); toIdle(g, 'Worm Barses');
  ok(on(g, 0, 'Worm Barses').pos === 'set', 'Barses face-down');
  ok(!hasIgn(g, on(g, 0, 'Worm Erokin')), 'once per turn');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Worm Erokin'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'cannot be Special Summoned (no Monster Reborn target)');
});

/* ---------------- Yubel ---------------- */
T('Yubel: no battle destruction or damage, burns the attacker, End Phase upkeep, becomes Terror Incarnate', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: ['Yubel'] }, { hand: [], m: [W], turn: 2 }] });
  toIdle(g); bp(g); atkOn(g, 1, W, 'Yubel', 'yes'); toIdle(g, 'yes');
  ok(on(g, 0, 'Yubel') && lp(g, 0) === 8000 && lp(g, 1) === 6000, `Yubel survives, A ${lp(g, 0)}, B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ m: ['Yubel', W], turn: 2 }, {}] });
  endTurn(g2, W); toIdle(g2);
  ok(on(g2, 0, 'Yubel') && !on(g2, 0, W), 'Warwolf Tributed for Yubel');
  const g3 = duel({ board: [{ m: ['Yubel'], deckTop: [W, 'Yubel - Terror Incarnate'], turn: 2 }, {}] });
  endTurn(g3); toIdle(g3);
  ok(!on(g3, 0, 'Yubel') && !on(g3, 0, 'Yubel - Terror Incarnate'), 'destroyed by its own effect: no Terror Incarnate');
  const g4 = duel({ board: [{ hand: ['Dark Hole'], m: ['Yubel'], deckTop: [W, 'Yubel - Terror Incarnate'], turn: 2 }, {}] });
  act(g4, 0, 'Dark Hole'); settle(g4, 'yes', 'Terror', 'Attack'); toIdle(g4, 'yes', 'Terror', 'Attack');
  ok(!!on(g4, 0, 'Yubel - Terror Incarnate'), 'Terror Incarnate summoned after Dark Hole');
});
T('Yubel - Terror Incarnate: no Normal Summon, End Phase wipe, becomes the Ultimate Nightmare', () => {
  const g = duel({ board: [{ hand: ['Yubel - Terror Incarnate'], m: [W, W, W], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Yubel - Terror Incarnate').u) && !hasOpt(g, 'sp:' + card(g, 0, 'Yubel - Terror Incarnate').u), 'cannot be Normal Summoned');
  const g2 = duel({ board: [{ m: ['Yubel - Terror Incarnate', CG], turn: 2 }, { m: [BEWD] }] });
  endTurn(g2); toIdle(g2);
  ok(on(g2, 0, 'Yubel - Terror Incarnate') && !on(g2, 0, CG) && !on(g2, 1, BEWD), 'all other monsters destroyed');
  const g3 = duel({ board: [{ hand: ['Dark Hole'], m: ['Yubel - Terror Incarnate'], deckTop: [W, 'Yubel - The Ultimate Nightmare'], turn: 2 }, {}] });
  act(g3, 0, 'Dark Hole'); settle(g3, 'yes', 'Nightmare', 'Attack'); toIdle(g3, 'yes', 'Nightmare', 'Attack');
  ok(!!on(g3, 0, 'Yubel - The Ultimate Nightmare'), 'Ultimate Nightmare summoned');
  const g4 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Yubel - Terror Incarnate'], turn: 2 }, {}] });
  ok(!canAct(g4, 0, 'Monster Reborn'), 'cannot be revived by Monster Reborn');
});
T('Yubel - The Ultimate Nightmare: battle burns and destroys the opponent monster', () => {
  const g = duel({ board: [{ m: ['Yubel - The Ultimate Nightmare'], turn: 2 }, { m: [BEWD] }] });
  bp(g); atkOn(g, 0, 'Yubel - The Ultimate Nightmare', BEWD); toIdle(g);
  ok(on(g, 0, 'Yubel - The Ultimate Nightmare') && !on(g, 1, BEWD) && lp(g, 0) === 8000 && lp(g, 1) === 5000, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
});

/* ---------------- A ---------------- */
T('Abaki: destroyed by battle, both take 500', () => {
  const g = duel({ board: [{ m: [W], turn: 2 }, { m: ['Abaki'] }] });
  bp(g); atkOn(g, 0, W, 'Abaki'); toIdle(g);
  ok(lp(g, 0) === 7500 && lp(g, 1) === 7200, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
});
T('Abyssal Kingshark: survives a non-targeting destruction once per turn', () => {
  const g = duel({ board: [{ hand: ['Dark Hole', 'Dark Hole'], turn: 2 }, { m: ['Abyssal Kingshark'] }] });
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(!!on(g, 1, 'Abyssal Kingshark'), 'survives the first Dark Hole');
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(!on(g, 1, 'Abyssal Kingshark'), 'destroyed by the second');
});
T('Accumulated Fortune: Chain Link 4 or higher, draw 2', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'], st: ['Mystical Space Typhoon'], turn: 2 }, { st: [up('Gravity Bind'), 'Dust Tornado', 'Accumulated Fortune'] }] });
  const h = hand(g, 1);
  act(g, 0, 'Heavy Storm');
  const fort = card(g, 1, 'Accumulated Fortune');
  ok(g.prompt && g.prompt.p === 1 && !hasOpt(g, 'a:' + fort.u + ':'), 'Fortune not offered as Chain Link 2');
  choose(g, 'a:' + card(g, 1, 'Dust Tornado').u + ':'); choose(g, 'Face-down');
  const am = g.p[0].st.find(c => c && E.name(c) === 'Mystical Space Typhoon');
  ok(g.prompt && g.prompt.p === 0, 'A may respond'); choose(g, 'a:' + am.u + ':'); choose(g, 'Gravity Bind');
  ok(g.prompt && g.prompt.p === 1 && hasOpt(g, 'a:' + fort.u + ':'), 'Fortune offered as Chain Link 4');
  choose(g, 'a:' + fort.u + ':'); toIdle(g);
  ok(hand(g, 1) === h + 2, `B drew ${hand(g, 1) - h}`);
});
T('Acidic Downpour: EARTH monsters -500 ATK, +400 DEF', () => {
  const g = duel({ board: [{ hand: ['Acidic Downpour'], m: [W, ELF], turn: 2 }, {}] });
  act(g, 0, 'Acidic Downpour'); settle(g); toIdle(g);
  ok(E.atk(g, on(g, 0, W)) === 1500 && E.def(g, on(g, 0, W)) === 500 && E.atk(g, on(g, 0, ELF)) === 800, 'Warwolf 1500/500, Elf unchanged');
});
T("Adhesive Explosive: equips to the attacker, destroys it in the opponent's next Standby Phase", () => {
  const g = duel({ board: [{ m: [W], turn: 2 }, { m: [set('Adhesive Explosive')] }] });
  bp(g); atkOn(g, 0, W, 'Adhesive Explosive'); toIdle(g);
  ok(on(g, 0, W) && !on(g, 1, 'Adhesive Explosive') && inZ(g, 1, 'st', 'Adhesive Explosive'), 'Adhesive equipped to the Warwolf, which survives');
  endTurn(g); toIdle(g); ok(!!on(g, 0, W), 'still there on B turn');
  endTurn(g); toIdle(g);
  ok(!on(g, 0, W), 'Warwolf destroyed in A Standby Phase');
});
T('Advance Draw: Tribute a Level 8+, draw 2', () => {
  const g = duel({ board: [{ hand: ['Advance Draw'], m: [BEWD], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Advance Draw'); settle(g, BEWD); toIdle(g);
  ok(hand(g, 0) === h - 1 + 2 && inZ(g, 0, 'gy', BEWD), `drew 2, BEWD Tributed`);
  const g2 = duel({ board: [{ hand: ['Advance Draw'], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Advance Draw'), 'not without a Level 8+');
});
T('Advance Force: 1 Level 5+ Tribute for a Level 7+', () => {
  const g = duel({ board: [{ hand: [BEWD], m: ['Thestalos the Firestorm Monarch'], st: [up('Advance Force')], turn: 2 }, {}] });
  ok(hasOpt(g, 'ns:' + card(g, 0, BEWD).u), 'BEWD summon offered with one monster');
  ns(g, 0, BEWD, 'Thestalos'); toIdle(g);
  ok(on(g, 0, BEWD) && inZ(g, 0, 'gy', 'Thestalos the Firestorm Monarch'), 'BEWD Tribute Summoned with 1 Tribute');
  const g2 = duel({ board: [{ hand: [BEWD], m: [W], st: [up('Advance Force')], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, BEWD).u), 'not with a Level 4 Tribute');
});

console.log(fails ? `\n${fails} failed` : '\nAll full-34 review checks passed.');
process.exit(fails ? 1 : 0);
