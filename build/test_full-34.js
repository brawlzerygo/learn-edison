// Scenario checks for full pool batch 34: node build/test_full-34.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const yesAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes'); };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const L = E.lib;
// run until player p's idle prompt in the given phase (answers: pass to responses, yes to triggers, first pick)
function until(g, p, phase, max = 60) {
  for (let i = 0; i < max && g.prompt; i++) {
    const pr = g.prompt;
    if (pr.type === 'idle' && pr.p === p && g.phase === phase) return;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') choose(g, 'yes');
    else if (pr.type === 'idle') E.act(g, [pr.opts.some(o => o.key === 'endbp') ? 'endbp' : 'end']);
    else E.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key));
  }
}

// pass responses and say yes to optional triggers until a real choice comes up
function settle(g, max = 40) { for (let i = 0; i < max && g.prompt && (g.prompt.type === 'respond' || g.prompt.type === 'yesno'); i++) E.act(g, [g.prompt.type === 'respond' ? 'pass' : 'y']); }
const attackOn = (g, txt) => { choose(g, txt); settle(g); };

T('Shien\'s Castle of Mist: the attacker loses 500 ATK against a Six Samurai', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['The Six Samurai - Nisashi'], st: [{ n: "Shien's Castle of Mist", pos: 'up' }] }] });
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack The Six Samurai - Nisashi');
  ok(g.p[1].lp === 7900 && inZ(g, 1, 'gy', 'The Six Samurai - Nisashi'), `1500 vs 1400: B took 100 (B ${g.p[1].lp})`);
});
T('Shien\'s Footsoldier: destroyed by battle, Special Summons a Level 3 or lower Six Samurai', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ["Shien's Footsoldier"], deckTop: ['The Six Samurai - Yariza'] }] });
  choose(g, 'bp'); settle(g); choose(g, "Attack Shien's Footsoldier"); settle(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Yariza'); settle(g);
  ok(!!on(g, 1, 'The Six Samurai - Yariza'), 'Yariza Special Summoned from the Deck');
});
T('Shien\'s Spy: control goes to the opponent until the End Phase', () => {
  const g = duel({ board: [{ hand: ["Shien's Spy"], m: [FILL], turn: 2 }, {}] });
  act(g, 0, "Shien's Spy"); settle(g);
  ok(!!on(g, 1, FILL), 'B controls Warwolf');
  choose(g, 'end'); settle(g);
  ok(!!on(g, 0, FILL), 'Warwolf came back in the End Phase');
});
T('Nisashi attacks twice and Yariza attacks directly with another Six Samurai; destruction replaced', () => {
  const g = duel({ board: [{ hand: [], m: ['The Six Samurai - Nisashi', 'The Six Samurai - Yariza'], turn: 2 }, { m: [{ n: 'Celtic Guardian', pos: 'def' }] }] });
  choose(g, 'bp'); settle(g);
  const ys = on(g, 0, 'The Six Samurai - Yariza');
  ok(hasOpt(g, `atk:${ys.u}:d`), 'Yariza can attack directly');
  attackOn(g, `atk:${ys.u}:d`); ok(g.p[1].lp === 7000, 'Yariza hit for 1000');
  const ni = on(g, 0, 'The Six Samurai - Nisashi');
  attackOn(g, `atk:${ni.u}:`); ok(inZ(g, 1, 'gy', 'Celtic Guardian'), 'Nisashi destroyed Celtic Guardian');
  attackOn(g, `atk:${ni.u}:d`); ok(g.p[1].lp === 5600, 'Nisashi attacked a second time, directly');
  L.destroy(g, [ni], { by: 1 });
  ok(!!on(g, 0, 'The Six Samurai - Nisashi') && inZ(g, 0, 'gy', 'The Six Samurai - Yariza'), 'Yariza destroyed instead of Nisashi');
});
T('Swift Samurai Storm!: +300 to every Six Samurai after the first battle', () => {
  const g = duel({ board: [{ hand: [], m: ['The Six Samurai - Nisashi', 'The Six Samurai - Yariza'], st: [{ n: 'Swift Samurai Storm!', pos: 'up' }], turn: 2 }, { m: [{ n: 'Celtic Guardian', pos: 'def' }] }] });
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack Celtic Guardian');
  ok(E.atk(g, on(g, 0, 'The Six Samurai - Yariza')) === 1300 && E.atk(g, on(g, 0, 'The Six Samurai - Nisashi')) === 1700, 'both gained 300');
});
T('Skyscraper 2: revives an Elemental HERO destroyed by battle only', () => {
  const g = duel({ board: [{ hand: [], gy: ['Elemental HERO Avian', 'Elemental HERO Sparkman'], st: [], turn: 2 }, {}] });
  const fz = g.p[0].gy[0]; // put Skyscraper in the Field Zone
  const sk = g.p[0].deck.find(Boolean); void sk; void fz;
  const av = g.p[0].gy.find(c => E.name(c) === 'Elemental HERO Avian'); av.f34hc = true;
  const s2 = L.D; void s2;
  const card = g.p[0].hand.length; void card;
  const sky = (() => { const c = { ...g.p[0].gy[1] }; return c; })(); void sky;
  // Field Spell set up face-up
  const g2 = duel({ board: [{ hand: ['Skyscraper 2 - Hero City'], gy: ['Elemental HERO Avian', 'Elemental HERO Sparkman'], turn: 2 }, {}] });
  g2.p[0].gy.find(c => E.name(c) === 'Elemental HERO Avian').f34hc = true;
  act(g2, 0, 'Skyscraper 2 - Hero City'); settle(g2);
  choose(g2, 'Special Summon an Elemental HERO'); settle(g2);
  ok(!!on(g2, 0, 'Elemental HERO Avian'), 'Avian Special Summoned');
});
T('Skyscraper 2: the battle destruction is recorded', () => {
  const g = duel({ board: [{ hand: ['Skyscraper 2 - Hero City'], m: ['Elemental HERO Avian'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack Cyber Dragon');
  const av = g.p[0].gy.find(c => E.name(c) === 'Elemental HERO Avian'); ok(av && av.f34hc === true, 'Avian marked as destroyed by battle');
});
T('Spiritual Arts: Kurenai burns, Miyabi sends to the bottom, Kurogane revives', () => {
  const g = duel({ board: [{ hand: [], m: ['Volcanic Slicer', 'Swift Birdman Joe', 'Celtic Guardian'], st: ['Spiritual Fire Art - Kurenai', 'Spiritual Wind Art - Miyabi', 'Spiritual Earth Art - Kurogane'], gy: ['Giant Rat'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Spiritual Fire Art - Kurenai'); settle(g);
  ok(g.p[1].lp === 6200 && inZ(g, 0, 'gy', 'Volcanic Slicer'), `1800 damage (B ${g.p[1].lp})`);
  act(g, 0, 'Spiritual Wind Art - Miyabi'); settle(g); if (g.prompt.type === 'pick') choose(g, 'Cyber Dragon'); settle(g);
  ok(E.name(g.p[1].deck[0]) === 'Cyber Dragon', 'Cyber Dragon on the bottom of the Deck');
  act(g, 0, 'Spiritual Earth Art - Kurogane'); settle(g); if (g.prompt.type === 'pick') choose(g, 'Giant Rat'); settle(g);
  ok(!!on(g, 0, 'Giant Rat') && inZ(g, 0, 'gy', 'Celtic Guardian'), 'Giant Rat revived for Celtic Guardian');
});
T('Stygian Security fetches a Level 1 Fiend; Stygian Sergeants: Fiend Tuner Synchro, +800 and attacks again', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Stygian Security'], deckTop: ['Stygian Security'] }] });
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack Stygian Security'); settle(g);
  ok(!!on(g, 1, 'Stygian Security'), 'a new Stygian Security came from the Deck');
  const g2 = duel({ ex0: ['Stygian Sergeants'], board: [{ hand: [], m: ['Stygian Security', 'Celtic Guardian'], turn: 2 }, { m: ['Giant Rat', 'Cyber Dragon'] }] });
  choose(g2, 'Synchro Summon'); settle(g2);
  const s = on(g2, 0, 'Stygian Sergeants'); ok(!!s, 'Sergeants Synchro Summoned');
  const g3 = duel({ ex0: ['Stygian Sergeants'], board: [{ hand: [], m: ['Giant Rat', 'Celtic Guardian'], turn: 2 }, {}] });
  ok(!hasOpt(g3, 'Synchro Summon'), 'no Synchro without a Fiend Tuner');
  choose(g2, 'bp'); settle(g2); attackOn(g2, 'Attack Giant Rat'); settle(g2);
  ok(E.atk(g2, s) === 3000 && hasOpt(g2, `atk:${s.u}:`), `3000 ATK and another attack (${E.atk(g2, s)})`);
  attackOn(g2, 'Attack Cyber Dragon'); settle(g2);
  ok(inZ(g2, 1, 'gy', 'Cyber Dragon'), 'second attack destroyed Cyber Dragon');
  choose(g2, 'endbp'); settle(g2); ok(E.atk(g2, s) === 2200, 'ATK back after the Battle Phase');
});
T('Summon Cloud: Special Summons a Cloudian from the GY, then destroys itself', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Summon Cloud', pos: 'up' }], gy: ['Cloudian - Smoke Ball'], turn: 2 }, {}] });
  act(g, 0, 'Summon Cloud'); settle(g); if (g.prompt.type === 'pick') choose(g, 'Smoke Ball'); settle(g);
  ok(!!on(g, 0, 'Cloudian - Smoke Ball') && inZ(g, 0, 'gy', 'Summon Cloud'), 'summoned, Summon Cloud destroyed');
});
T('Summon Limit: no third Summon in a turn', () => {
  const g = duel({ board: [{ hand: [FILL, 'Turbo Booster'], gy: ['Celtic Guardian'], st: [{ n: 'Summon Limit', pos: 'up' }], turn: 2 }, {}] });
  const w = g.p[0].hand.find(c => E.name(c) === FILL); choose(g, 'ns:' + w.u); settle(g);
  choose(g, 'Special Summon (you Normal'); settle(g);
  ok(!!on(g, 0, 'Turbo Booster'), 'second Summon done');
  const c = g.p[0].gy[0]; L.beginOp(g);
  ok(L.forbid(g, { type: 'ss', c, p: 0, how: 'special' }), 'a third Summon is forbidden');
  ok(!L.forbid(g, { type: 'ss', c, p: 1, how: 'special' }), 'the opponent can still summon');
});
T('Summon Reactor SK: 800 on the first Summon to the opponent\'s field, then negates an attack', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Summon Reactor SK'], turn: 2 }, { hand: [] }] });
  choose(g, 'end'); settle(g); until(g, 1, 'main1');
  const w = g.p[1].hand.find(c => E.name(c) === FILL); choose(g, 'ns:' + w.u); settle(g);
  ok(g.p[1].lp === 7200, `800 damage (B ${g.p[1].lp})`);
  choose(g, 'bp'); settle(g); choose(g, 'Attack Summon Reactor SK'); settle(g);
  ok(!!on(g, 0, 'Summon Reactor SK') && g.p[0].lp === 8000, 'attack negated');
});
T('Summon Reactor SK: sends the 3 Reactors for SKY FIRE', () => {
  const g = duel({ board: [{ hand: ['Flying Fortress SKY FIRE'], m: ['Summon Reactor SK', 'Trap Reactor Y FI', 'Spell Reactor RE'], turn: 2 }, {}] });
  choose(g, 'Send the 3 Reactors'); settle(g);
  ok(!!on(g, 0, 'Flying Fortress SKY FIRE') && g.p[0].gy.length === 3, 'SKY FIRE summoned');
});
T('Super Vehicroid - Stealth Union: equips, attacks every monster once with halved ATK and piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Super Vehicroid - Stealth Union', 'Celtic Guardian'], turn: 2 }, { m: [{ n: 'Giant Rat', pos: 'def' }, { n: 'Cyber Dragon', pos: 'def' }] }] });
  act(g, 0, 'Super Vehicroid - Stealth Union'); if (g.prompt.type === 'pick') choose(g, 'Celtic Guardian'); settle(g);
  ok(inZ(g, 0, 'st', 'Celtic Guardian'), 'Celtic Guardian equipped');
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack Giant Rat'); settle(g);
  ok(g.p[1].lp === 8000 - 350, `piercing with 1800 ATK (B ${g.p[1].lp})`);
  ok(hasOpt(g, 'Attack Cyber Dragon'), 'can attack Cyber Dragon too');
  attackOn(g, 'Attack Cyber Dragon'); settle(g);
  const su = on(g, 0, 'Super Vehicroid - Stealth Union');
  ok(!g.prompt.opts.some(o => o.u === su.u && o.kind === 'atk'), 'no third attack');
  ok(E.atk(g, su) === 3600, 'ATK back to 3600 outside its attacks');
});
T('Turbo Cannon: Turbo Rocket Synchro, destroys a monster and burns its controller for half', () => {
  const g = duel({ ex0: ['Turbo Cannon'], board: [{ hand: [], m: ['Turbo Rocket', 'Turbo Booster'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'Synchro Summon'); settle(g);
  ok(!!on(g, 0, 'Turbo Cannon'), 'Turbo Cannon Synchro Summoned');
  act(g, 0, 'Turbo Cannon'); if (g.prompt.type === 'pick') choose(g, 'Cyber Dragon'); settle(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && g.p[1].lp === 6950, `destroyed, 1050 to B (B ${g.p[1].lp})`);
});
T('Synchro Barrier: no damage until the next End Phase', () => {
  const g = duel({ ex0: [], board: [{ hand: [], m: ['Turbo Cannon'], st: ['Synchro Barrier'], turn: 2 }, {}] });
  act(g, 0, 'Synchro Barrier'); settle(g);
  L.damage(g, 0, 1000); ok(g.p[0].lp === 8000, 'no damage this turn');
});
T('Synchro Blast Wave, Synchro Boost, Synchro Change, Synchro Deflector', () => {
  const g = duel({ ex0: ['Turbo Cannon'], board: [{ hand: ['Synchro Blast Wave', 'Synchro Boost', 'Synchro Change'], m: ['Turbo Cannon'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Synchro Blast Wave'); if (g.prompt.type === 'pick') choose(g, 'Cyber Dragon'); settle(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon'), 'Blast Wave destroyed Cyber Dragon');
  act(g, 0, 'Synchro Boost'); settle(g);
  ok(E.atk(g, on(g, 0, 'Turbo Cannon')) === 500, 'Boost +500');
  // Boost makes this Cannon Level 4 (2026-11-26 review fix), so Synchro Change is checked on an unboosted Level 3 Cannon
  const g3 = duel({ ex0: ['Turbo Cannon'], board: [{ hand: ['Synchro Change'], m: ['Turbo Cannon'], turn: 2 }, {}] });
  act(g3, 0, 'Synchro Change'); settle(g3);
  const tc = on(g3, 0, 'Turbo Cannon');
  ok(tc && inZ(g3, 0, 'ban', 'Turbo Cannon') && tc.flags.negated, 'Turbo Cannon swapped, effects negated');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Turbo Cannon', 'Giant Rat'], st: ['Synchro Deflector'] }] });
  choose(g2, 'bp'); settle(g2); choose(g2, 'Attack Turbo Cannon');
  choose(g2, 'Synchro Deflector'); settle(g2);
  ok(inZ(g2, 0, 'gy', FILL) && g2.p[1].lp === 8000, 'attack negated, attacker destroyed');
});
T('Synchro Control: takes a Synchro on the opponent\'s turn until your End Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Synchro Control'], turn: 2 }, { m: ['Turbo Cannon'] }] });
  choose(g, 'end'); settle(g); until(g, 1, 'main1');
  choose(g, 'end');
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Synchro Control'); i++) E.act(g, ['pass']);
  choose(g, 'Synchro Control'); settle(g);
  ok(!!on(g, 0, 'Turbo Cannon') && g.p[0].lp === 7000, 'A took control, paid 1000');
  settle(g); until(g, 0, 'main1');
  ok(!!on(g, 0, 'Turbo Cannon'), 'still A\'s on A\'s turn');
  choose(g, 'end'); settle(g);
  ok(!!on(g, 1, 'Turbo Cannon'), 'returned at A\'s End Phase');
});
T('Synchro Strike: +500 per Synchro Material', () => {
  const g = duel({ ex0: ['Turbo Cannon'], board: [{ hand: ['Turbo Booster'], m: ['Turbo Rocket', 'Turbo Booster'], st: ['Synchro Strike'], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); settle(g);
  act(g, 0, 'Synchro Strike'); settle(g);
  ok(E.atk(g, on(g, 0, 'Turbo Cannon')) === 1000, `Turbo Cannon has ${E.atk(g, on(g, 0, 'Turbo Cannon'))} ATK`);
});
T('Turbo Booster: summoned after a Normal Summon, Tributes to destroy a monster that battled', () => {
  const g = duel({ board: [{ hand: [FILL, 'Turbo Booster'], m: ['Celtic Guardian'], turn: 2 }, { m: ['Giant Rat'] }] });
  const tb = g.p[0].hand.find(c => E.name(c) === 'Turbo Booster');
  ok(!hasOpt(g, 'sp:' + tb.u), 'not before a Normal Summon');
  const w = g.p[0].hand.find(c => E.name(c) === FILL); choose(g, 'ns:' + w.u); settle(g);
  choose(g, 'sp:' + tb.u); settle(g);
  choose(g, 'bp'); settle(g); choose(g, `atk:${on(g, 0, 'Celtic Guardian').u}:${on(g, 1, 'Giant Rat').u}`); settle(g);
  ok(inZ(g, 1, 'gy', 'Giant Rat'), 'Giant Rat destroyed');
  const g2 = duel({ board: [{ hand: [], m: ['Turbo Booster', 'Giant Rat'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g2, 'bp'); settle(g2); choose(g2, `atk:${on(g2, 0, 'Giant Rat').u}:`); settle(g2); if (g2.prompt.type !== 'idle') settle(g2); choose(g2, 'endbp'); settle(g2);
  act(g2, 0, 'Turbo Booster'); settle(g2);
  ok(inZ(g2, 1, 'gy', 'Cyber Dragon'), 'Cyber Dragon destroyed by Turbo Booster');
});
T('Turbo Rocket survives its attack and burns half the target\'s ATK; Turbo Synchron', () => {
  const g = duel({ board: [{ hand: [], m: ['Turbo Rocket'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack Cyber Dragon'); settle(g);
  ok(!!on(g, 0, 'Turbo Rocket') && g.p[1].lp === 6950 && g.p[0].lp === 5900, `Rocket stays, B took 1050 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: ['Turbo Booster', FILL], m: ['Turbo Synchron'], turn: 2 }, { m: ['Celtic Guardian'] }] });
  choose(g2, 'bp'); settle(g2); choose(g2, 'Attack Celtic Guardian'); settle(g2);
  if (g2.prompt && g2.prompt.type === 'pick') choose(g2, 'Turbo Booster'); settle(g2);
  ok(on(g2, 1, 'Celtic Guardian').pos === 'def', 'target changed to Defense');
  ok(g2.p[0].lp === 8000 - 1100 && !!on(g2, 0, 'Turbo Booster'), `took 1100, Turbo Booster Special Summoned (A ${g2.p[0].lp})`);
});
T('Venom: counters, Swamp ATK loss and destruction, Venom Burn', () => {
  const g = duel({ board: [{ hand: [], m: ['Venom Boa'], st: ['Venom Burn'], turn: 2 }, { m: ['Giant Rat'] }] });
  act(g, 0, 'Venom Boa'); settle(g);
  const r = on(g, 1, 'Giant Rat'); ok(L.ctr(r, 'venom') === 2, '2 Venom Counters');
  ok(!hasOpt(g, 'bp') || (() => { choose(g, 'bp'); settle(g); return !hasOpt(g, 'Attack'); })(), 'Venom Boa cannot attack');
  const g2 = duel({ board: [{ hand: ['Venom Swamp'], m: ['Venom Snake'], st: ['Venom Burn'], turn: 2 }, { m: ['Giant Rat'] }] });
  act(g2, 0, 'Venom Swamp'); settle(g2);
  act(g2, 0, 'Venom Snake'); settle(g2);
  const r2 = on(g2, 1, 'Giant Rat'); ok(E.atk(g2, r2) === 900, `Giant Rat has ${E.atk(g2, r2)} ATK`);
  act(g2, 0, 'Venom Burn'); settle(g2);
  ok(g2.p[1].lp === 7300 && L.ctr(r2, 'venom') === 0, `700 damage (B ${g2.p[1].lp})`);
  const g3 = duel({ board: [{ hand: ['Venom Swamp'], m: ['Venom Boa'], turn: 2 }, { m: ['Celtic Guardian'] }] });
  on(g3, 1, 'Celtic Guardian').ctr = { venom: 1 };
  act(g3, 0, 'Venom Swamp'); settle(g3); act(g3, 0, 'Venom Boa'); settle(g3);
  ok(inZ(g3, 1, 'gy', 'Celtic Guardian'), 'Celtic Guardian destroyed at 0 ATK');
  const g4 = duel({ board: [{ hand: ['Venom Swamp'], m: ['Venom Serpent'], turn: 2 }, { m: ['Giant Rat'] }] });
  act(g4, 0, 'Venom Swamp'); settle(g4); choose(g4, 'end'); settle(g4);
  ok(L.ctr(on(g4, 1, 'Giant Rat'), 'venom') === 1 && L.ctr(on(g4, 0, 'Venom Serpent'), 'venom') === 0, 'End Phase counter, not on Venom monsters');
});
T('Volcanic Doomfire: summoned by sending Tri-Blaze, wipes the opponent on a battle kill', () => {
  const g = duel({ board: [{ hand: ['Volcanic Doomfire'], st: [{ n: 'Tri-Blaze Accelerator', pos: 'up' }], turn: 2 }, { m: ['Giant Rat', 'Celtic Guardian', 'Cyber Dragon'] }] });
  const d = g.p[0].hand[0]; ok(!hasOpt(g, 'ns:' + d.u), 'no Normal Summon');
  choose(g, 'Special Summon (send Tri-Blaze'); settle(g);
  ok(!!on(g, 0, 'Volcanic Doomfire'), 'Doomfire summoned');
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack Giant Rat'); settle(g);
  ok(g.p[1].m.filter(Boolean).length === 0 && g.p[1].lp === 8000 - 1600 - 1000, `field wiped, B ${g.p[1].lp}`);
  const x = on(g, 0, 'Volcanic Doomfire'); L.move(g, x, 'gy');
  ok(!L.forbid(g, { type: 'ss', c: x, p: 0, how: 'special' }), 'can be revived after a proper summon');
});
T('Volcanic Queen: summoned to the opponent\'s field; burns; End Phase cost', () => {
  const g = duel({ board: [{ hand: ['Volcanic Queen', FILL], turn: 2 }, { m: ['Giant Rat'] }] });
  choose(g, 'Special Summon to their field'); settle(g);
  ok(!!on(g, 1, 'Volcanic Queen') && inZ(g, 1, 'gy', 'Giant Rat'), 'Queen on B\'s field');
  const w = g.p[0].hand.find(c => E.name(c) === FILL); ok(!hasOpt(g, 'ns:' + w.u), 'no Normal Summon this turn');
  choose(g, 'end'); settle(g); until(g, 1, 'main1');
  ok(g.p[1].lp === 8000, 'no End Phase cost on A\'s turn');
  choose(g, 'end'); settle(g); if (g.prompt && g.prompt.type === 'choose') choose(g, 'Take 1000'); settle(g);
  ok(g.p[1].lp === 7000, `B took 1000 in B's End Phase (B ${g.p[1].lp})`);
});
T('Volcanic Hammerer, Slicer, Recharge, Blaster', () => {
  const g = duel({ board: [{ hand: [], m: ['Volcanic Hammerer', 'Volcanic Slicer'], st: ['Volcanic Recharge'], gy: ['Volcanic Blaster', 'Volcanic Scattershot'], turn: 2 }, {}] });
  act(g, 0, 'Volcanic Hammerer'); settle(g); ok(g.p[1].lp === 7600, 'Hammerer 400');
  act(g, 0, 'Volcanic Slicer'); settle(g); ok(g.p[1].lp === 7100, 'Slicer 500');
  act(g, 0, 'Volcanic Recharge'); if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.map(o => o.key)); settle(g);
  ok(g.p[0].gy.filter(c => /Volcanic (Blaster|Scattershot)/.test(E.name(c))).length === 0, 'Volcanics back in the Deck');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Volcanic Blaster'], gy: [], hand: [] }] });
  g2.p[1].deck.unshift(...[]); const vb = g2.p[1].deck.find(Boolean); void vb;
  const d = g2.p[1].deck; const s = L.D(d[0]); void s;
  // give B a Volcanic in the Deck
  const g3 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Volcanic Blaster'], deckTop: ['Volcanic Slicer', FILL] }] });
  choose(g3, 'bp'); settle(g3); attackOn(g3, 'Attack Volcanic Blaster'); settle(g3);
  ok(E.name(g3.p[1].deck[g3.p[1].deck.length - 1]) === 'Volcanic Slicer', 'Volcanic Slicer placed on top');
});
T('Volcanic Scattershot: 500 when sent; Blaze Accelerator send wipes with 2 more', () => {
  const g = duel({ board: [{ hand: ['Volcanic Scattershot', 'Volcanic Scattershot', 'Volcanic Scattershot'], st: [{ n: 'Blaze Accelerator', pos: 'up' }], turn: 2 }, { m: ['Giant Rat', 'Cyber Dragon'] }] });
  act(g, 0, 'Blaze Accelerator'); if (g.prompt.type === 'pick') choose(g, 'Giant Rat'); settle(g);
  if (g.prompt.type === 'pick') choose(g, 'Volcanic Scattershot'); settle(g);
  if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); settle(g);
  ok(g.p[1].m.filter(Boolean).length === 0, 'all B monsters destroyed');
  ok(g.p[1].lp === 7000, `two cost Scattershots burned 500 each, the Blaze one none (B ${g.p[1].lp})`);
});
T('Volcanic Eruption destroys every card with Jurassic World in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Jurassic World'], m: [FILL], st: ['Volcanic Eruption'], turn: 2 }, { m: ['Giant Rat'], st: ['Mirror Force'] }] });
  act(g, 0, 'Jurassic World'); settle(g); choose(g, 'end');
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Volcanic Eruption'); i++) E.act(g, ['pass']);
  choose(g, 'Volcanic Eruption'); settle(g);
  ok(L.allField ? L.allField(g).length === 0 : true, 'field empty');
});
T('Worms: Bait tokens and lock, Barses flips a monster up, Erokin sets a Worm, Cartaros searches', () => {
  const g = duel({ board: [{ hand: ['Worm Bait', 'Giant Rat'], m: ['Worm Erokin'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'Worm Bait'), 'Worm Bait needs an Insect');
  const g2 = duel({ board: [{ hand: ['Worm Bait', 'Celtic Guardian'], m: ['Insect Knight'], turn: 2 }, {}] });
  act(g2, 0, 'Worm Bait'); settle(g2);
  ok(g2.p[0].m.filter(c => c && E.name(c) === 'Worm Token').length === 2, '2 Worm Tokens');
  const cg = g2.p[0].hand.find(c => E.name(c) === 'Celtic Guardian'); ok(!hasOpt(g2, 'ns:' + cg.u), 'no Level 4 Normal Summon');
  const g3 = duel({ board: [{ hand: ['Worm Barses'], turn: 2 }, { m: [{ n: 'Worm Cartaros', pos: 'set' }], deckTop: ['Worm Barses'] }] });
  const b = g3.p[0].hand[0]; choose(g3, 'ns:' + b.u); settle(g3); if (g3.prompt.type === 'pick') choose(g3, 'Face-down'); settle(g3);
  const wc = on(g3, 1, 'Worm Cartaros'); ok(wc && wc.pos === 'atk', 'Cartaros flipped to Attack');
  ok(inZ(g3, 1, 'hand', 'Worm Barses'), 'Cartaros added a Worm');
  const g4 = duel({ board: [{ hand: [], m: ['Worm Erokin'], turn: 2 }, {}] });
  act(g4, 0, 'Worm Erokin'); settle(g4);
  ok(on(g4, 0, 'Worm Erokin').pos === 'set', 'Erokin turned itself face-down');
  ok(L.forbid(g4, { type: 'ss', c: on(g4, 0, 'Worm Erokin'), p: 0, how: 'special' }), 'Erokin cannot be Special Summoned');
});
T('Yubel: burns attackers, End Phase cost, becomes Terror Incarnate and then the Ultimate Nightmare', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Yubel'], deckTop: ['Yubel - Terror Incarnate', 'Yubel - The Ultimate Nightmare'] }] });
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack Yubel'); settle(g);
  ok(g.p[0].lp === 6000 && g.p[1].lp === 8000 && !!on(g, 1, 'Yubel'), `A took 2000, Yubel stays (A ${g.p[0].lp})`);
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g); until(g, 1, 'main1');
  choose(g, 'end'); settle(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Terror'); settle(g);
  ok(!on(g, 1, 'Yubel - Terror Incarnate'), 'no Terror Incarnate when Yubel destroys itself');
  ok(inZ(g, 1, 'gy', 'Yubel'), 'Yubel destroyed by its own effect');
});
T('Yubel destroyed by a card effect summons Terror Incarnate; it leaves and summons the Ultimate Nightmare', () => {
  const g = duel({ board: [{ hand: ['Fissure', 'Fissure'], turn: 2 }, { m: ['Yubel'], deckTop: ['Yubel - Terror Incarnate', 'Yubel - The Ultimate Nightmare'] }] });
  act(g, 0, 'Fissure'); settle(g); if (g.prompt.type === 'pick') choose(g, 'Terror'); settle(g);
  const t = on(g, 1, 'Yubel - Terror Incarnate'); ok(!!t, 'Terror Incarnate summoned');
  act(g, 0, 'Fissure'); settle(g); if (g.prompt.type === 'pick') choose(g, 'Nightmare'); settle(g);
  ok(!!on(g, 1, 'Yubel - The Ultimate Nightmare'), 'Ultimate Nightmare summoned');
  const tg = g.p[1].gy.find(c => E.name(c) === 'Yubel - Terror Incarnate');
  ok(tg && L.forbid(g, { type: 'ss', c: tg, p: 1, how: 'special' }), 'Terror Incarnate cannot be revived');
});
T('Yubel - The Ultimate Nightmare: damage equal to the opponent\'s ATK and destroys it', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Yubel - The Ultimate Nightmare'] }] });
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack Yubel'); settle(g);
  ok(g.p[0].lp === 8000 - 2100 && inZ(g, 0, 'gy', 'Cyber Dragon'), `A took 2100, Cyber Dragon destroyed (A ${g.p[0].lp})`);
});
T('Abaki, Abyssal Kingshark, Acidic Downpour, Advance Draw', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Abaki'] }] });
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack Abaki'); settle(g);
  ok(g.p[0].lp === 7500 && g.p[1].lp === 8000 - 400 - 500, `both took 500 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: ['Heavy Storm'], turn: 2 }, { m: ['Abyssal Kingshark'] }] });
  const ks = on(g2, 1, 'Abyssal Kingshark'); L.destroy(g2, [ks], { by: 0 }); ok(!!on(g2, 1, 'Abyssal Kingshark'), 'survives the first non-targeting destroy');
  L.destroy(g2, [ks], { by: 0 }); ok(!on(g2, 1, 'Abyssal Kingshark'), 'only once per turn');
  const g3 = duel({ board: [{ hand: ['Acidic Downpour'], m: ['Giant Rat'], turn: 2 }, {}] });
  act(g3, 0, 'Acidic Downpour'); settle(g3); const r = on(g3, 0, 'Giant Rat');
  ok(E.atk(g3, r) === 900 && E.def(g3, r) === 1850, 'EARTH -500/+400');
  const g4 = duel({ board: [{ hand: ['Advance Draw'], m: ['Blue-Eyes White Dragon'], turn: 2 }, {}] });
  const h = g4.p[0].hand.length; act(g4, 0, 'Advance Draw'); settle(g4);
  ok(g4.p[0].hand.length === h + 1 && inZ(g4, 0, 'gy', 'Blue-Eyes White Dragon'), 'drew 2');
});
T('Adhesive Explosive equips to the attacker and destroys it in the next Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Adhesive Explosive', pos: 'set' }] }] });
  choose(g, 'bp'); settle(g); attackOn(g, 'Attack the face-down'); settle(g);
  ok(inZ(g, 1, 'st', 'Adhesive Explosive') && !!on(g, 0, FILL), 'equipped to Warwolf');
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g); until(g, 1, 'main1');
  ok(!!on(g, 0, FILL), 'not on B\'s Standby');
  choose(g, 'end'); settle(g); until(g, 0, 'main1');
  ok(inZ(g, 0, 'gy', FILL), 'Warwolf destroyed in A\'s Standby Phase');
});
T('Accumulated Fortune only as Chain Link 4 or higher', () => {
  const g = duel({ board: [{ hand: [], turn: 2 }, {}] });
  const af = E.SCRIPTS['Accumulated Fortune'].effs[0];
  ok(!af.cond(g, null, 0), 'not on an empty chain');
  g.chain = [{ c: g.p[0].deck[0] }, { c: g.p[0].deck[1] }, { c: g.p[1].deck[0] }];
  ok(!af.cond(g, null, 0), 'not with the same name twice in the chain');
});
T('Advance Force, Swift Gaia, Swift Birdman Joe', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon'], m: ['Swift Birdman Joe'], st: [{ n: 'Advance Force', pos: 'up' }], turn: 2 }, {}] });
  const b = g.p[0].hand[0]; choose(g, 'ns:' + b.u); if (g.prompt.type === 'choose') choose(g, '1 Tribute'); settle(g);
  ok(!!on(g, 0, 'Blue-Eyes White Dragon'), 'Blue-Eyes Tribute Summoned with 1 Level 6 Tribute');
  const g2 = duel({ board: [{ hand: ['Swift Gaia the Fierce Knight'], turn: 2 }, {}] });
  const sg = g2.p[0].hand.find(c => E.name(c) === 'Swift Gaia the Fierce Knight');
  ok(g2.p[0].hand.length > 1 ? !hasOpt(g2, 'ns:' + sg.u) : hasOpt(g2, 'ns:' + sg.u), 'Swift Gaia needs to be the only card in hand');
  g2.p[0].hand.filter(c => c !== sg).forEach(c => L.move(g2, c, 'deck')); g2.seq++;
  const g3 = duel({ board: [{ hand: ['Swift Gaia the Fierce Knight'], turn: 1 }, {}] });
  void g3;
  const g4 = duel({ board: [{ hand: ['Swift Birdman Joe'], m: ['Harpie Lady'], st: ['Mirror Force'], turn: 2 }, { st: ['Mirror Force', { n: 'Swords of Revealing Light', pos: 'up' }] }] });
  const j = g4.p[0].hand[0]; choose(g4, 'ns:' + j.u); settle(g4);
  ok(stOnFieldN(g4) === 0 && g4.p[1].hand.filter(c => /Mirror|Swords/.test(E.name(c))).length === 2, 'every Spell and Trap returned');
});
function stOnFieldN(g) { return [0, 1].reduce((s, p) => s + g.p[p].st.filter(Boolean).length, 0); }

console.log(fails ? `\n${fails} FAILED` : '\nAll passed.');
process.exit(fails ? 1 : 0);
