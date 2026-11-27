// Independent review checks for full pool batch 09 (written from the card text): node build/review_full-09.js
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
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra, ...g.p[p].ban].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const canAct = (g, p, n) => { const c = card(g, p, n); return !!c && hasOpt(g, 'a:' + c.u + ':'); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ')); } };
// answer prompts until an idle or battle prompt: responses pass unless a pick matches, yes to yes/no (unless no:true), picks by label
function settle(g, ...picks) { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const k = picks.find(t => pr.opts.some(x => x.key !== 'pass' && (x.label + ' ' + x.key).includes(t))); if (k) choose(g, k); else E.act(g, ['pass']); }
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
const GK = n => "Gravekeeper's " + n;

/* ---------------- Grave cards ---------------- */
T('Grave Lure: the face-up top card is sent to the GY when drawn', () => {
  const g = duel({ n1: 6, board: [{ st: ['Grave Lure'], turn: 2 }, {}] });
  ok(g.p[1].deck.length === 1, 'B has 1 card left in the Deck');
  act(g, 0, 'Grave Lure'); settle(g);
  endTurn(g);
  ok(cnt(g, 1, 'gy') === 1 && g.p[1].hand.length === 5, `the drawn card went to the GY (B GY ${cnt(g, 1, 'gy')}, hand ${g.p[1].hand.length})`);
});
T('Grave of the Super Ancient Organism: Special Summoned Level 6+ cannot attack or use effects', () => {
  const g = duel({ board: [{ hand: ['Dark Armed Dragon', FILL], st: [{ n: 'Grave of the Super Ancient Organism', pos: 'up' }], gy: ['Sangan', 'Sangan', 'Sangan'], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'sp:' + card(g, 0, 'Dark Armed Dragon').u); settle(g);
  const d = on(g, 0, 'Dark Armed Dragon');
  ok(d, 'Dark Armed Dragon Special Summoned');
  ok(!hasOpt(g, 'a:' + d.u + ':'), 'its effect cannot be activated');
  ns(g, 0, FILL); bp(g);
  ok(!canAtk(g, d, null) && canAtk(g, on(g, 0, FILL), null), 'Dark Armed Dragon cannot attack, the Level 4 can');
});
T('Grave Ohja: cannot be attacked with a face-down Defense monster, 300 per Flip Summon', () => {
  const g = duel({ board: [{ m: ['Grave Ohja', { n: 'Mystical Elf', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'flip:' + on(g, 0, 'Mystical Elf').u); settle(g);
  ok(lp(g, 1) === 7700, `B took 300 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Grave Ohja', { n: 'Mystical Elf', pos: 'set' }] }] });
  bp(g2);
  ok(!canAtk(g2, on(g2, 0, FILL), on(g2, 1, 'Grave Ohja')) && canAtk(g2, on(g2, 0, FILL), on(g2, 1, 'Mystical Elf')), 'Ohja cannot be attacked, the face-down can');
  const g3 = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Grave Ohja'] }] });
  bp(g3); ok(canAtk(g3, on(g3, 0, FILL), on(g3, 1, 'Grave Ohja')), 'without a face-down monster Ohja can be attacked');
});
T('Grave Protector: monsters destroyed by battle are shuffled into the Deck', () => {
  const g = duel({ board: [{ m: [FILL, 'Grave Protector'], turn: 2 }, { m: ['Sangan'], deckTop: ['Mystic Tomato'] }] });
  bp(g); atkOn(g, 0, FILL, 'Sangan', 'Mystic Tomato');
  ok(!inZ(g, 1, 'gy', 'Sangan') && g.p[1].deck.some(c => E.name(c) === 'Sangan'), 'Sangan went to the Deck, not the GY');
  ok(!inZ(g, 1, 'hand', 'Mystic Tomato'), 'Sangan did not search');
});
T('Grave Squirmer: destroyed by battle, destroys 1 card on the field', () => {
  const g = duel({ board: [{ m: [FILL, 'Mystical Elf'], turn: 2 }, { m: ['Grave Squirmer'] }] });
  bp(g); atkOn(g, 0, FILL, 'Grave Squirmer', FILL);
  ok(inZ(g, 1, 'gy', 'Grave Squirmer') && inZ(g, 0, 'gy', FILL), 'Squirmer destroyed the Warwolf');
});
T("Gravekeeper's Cannonholder: Tribute another Gravekeeper's for 700 damage", () => {
  const g = duel({ board: [{ m: [GK('Cannonholder'), GK('Spy')], turn: 2 }, {}] });
  act(g, 0, GK('Cannonholder')); settle(g, GK('Spy'));
  ok(lp(g, 1) === 7300 && inZ(g, 0, 'gy', GK('Spy')), `Spy tributed, B took 700 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ m: [GK('Cannonholder'), FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, GK('Cannonholder')), 'no other Gravekeeper\'s, no activation');
});
T("Gravekeeper's Chief: Tribute Summon revives a Gravekeeper's, only 1 face-up", () => {
  const g = duel({ board: [{ hand: [GK('Chief')], m: [GK('Spy')], gy: [GK('Curse')], turn: 2 }, {}] });
  ns(g, 0, GK('Chief'), GK('Spy'), GK('Spy'));
  ok(on(g, 0, GK('Chief')) && on(g, 0, GK('Spy')), 'Chief summoned and Spy Special Summoned back');
  const g2 = duel({ board: [{ hand: [GK('Chief')], m: [GK('Chief'), FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, GK('Chief')).u) || (() => { const c = g2.p[0].hand[0]; choose(g2, 'ns:' + c.u); settle(g2, FILL); return cnt(g2, 0, 'm', GK('Chief')) === 1; })(), 'cannot control a second face-up Chief');
});
T("Gravekeeper's Curse: 500 damage when Summoned", () => {
  const g = duel({ board: [{ hand: [GK('Curse')], turn: 2 }, {}] });
  ns(g, 0, GK('Curse'));
  ok(lp(g, 1) === 7500, `B took 500 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: [GK('Curse')], turn: 2 }, {}] });
  act(g2, 0, 'Monster Reborn'); settle(g2, GK('Curse'));
  ok(lp(g2, 1) === 7500, `Special Summon also burns (${lp(g2, 1)})`);
});
T("Gravekeeper's Guard: FLIP returns an opponent's monster to the hand", () => {
  const g = duel({ board: [{ m: [{ n: GK('Guard'), pos: 'set' }], turn: 2 }, { hand: [], m: ['Mystical Elf'] }] });
  choose(g, 'flip:'); settle(g, 'Mystical Elf');
  ok(inZ(g, 1, 'hand', 'Mystical Elf'), 'Elf back in B hand');
});
// The field counts as Necrovalley, so its +500 applies on top of Priestess's +200 (700 in all).
T("Gravekeeper's Priestess: Gravekeeper's monsters gain 200 ATK/DEF, plus Necrovalley's 500", () => {
  const g = duel({ board: [{ m: [GK('Priestess'), GK('Spy'), FILL], turn: 2 }, { m: [GK('Curse')] }] });
  const s = on(g, 0, GK('Spy')), pr = on(g, 0, GK('Priestess')), cu = on(g, 1, GK('Curse'));
  ok(E.atk(g, s) === 1900 && E.def(g, s) === 2700, `Spy ${E.atk(g, s)}/${E.def(g, s)}`);
  ok(E.atk(g, pr) === 1700 && E.def(g, pr) === 2200, `Priestess ${E.atk(g, pr)}/${E.def(g, pr)}`);
  ok(E.atk(g, cu) === 1500 && E.atk(g, on(g, 0, FILL)) === 2000, 'opponent Gravekeeper\'s gains too, the Warwolf does not');
});
T("Gravekeeper's Servant: the opponent mills 1 to declare an attack", () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: [{ n: GK('Servant'), pos: 'up' }] }] });
  const d0 = g.p[0].deck.length;
  bp(g); atkOn(g, 0, FILL, null);
  ok(g.p[0].deck.length === d0 - 1 && cnt(g, 0, 'gy') === 1 && lp(g, 1) === 6000, `A milled 1 and attacked (deck ${g.p[0].deck.length}, B ${lp(g, 1)})`);
});
T("Gravekeeper's Spear Soldier: piercing", () => {
  const g = duel({ board: [{ m: [GK('Spear Soldier')], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); atkOn(g, 0, GK('Spear Soldier'), FILL);
  ok(lp(g, 1) === 6600, `1400 piercing (${lp(g, 1)})`);
});
T("Gravekeeper's Vassal: its battle damage still lowers LP (as effect damage)", () => {
  const g = duel({ board: [{ m: [GK('Vassal')], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, GK('Vassal'), null);
  ok(lp(g, 1) === 7300, `B took 700 (${lp(g, 1)})`);
  const dm = g.log.filter(l => /700/.test(l)).join(' ');
  ok(!/battle damage/i.test(dm), 'not logged as battle damage: ' + dm);
});
T("Gravekeeper's Visionary: 1-Tribute summon, +200 per Gravekeeper's in GY, discard to survive", () => {
  const g = duel({ board: [{ hand: [GK('Visionary')], m: [GK('Spy')], gy: [GK('Curse')], turn: 2 }, {}] });
  ns(g, 0, GK('Visionary'), GK('Spy'));
  const v = on(g, 0, GK('Visionary'));
  ok(v && E.atk(g, v) === 2400, `summoned with 1 Tribute, ${v && E.atk(g, v)} ATK with 2 in the GY`);
  const g2 = duel({ board: [{ hand: [GK('Spy')], m: [GK('Visionary')], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g2); atkOn(g2, 0, GK('Visionary'), 'Blue-Eyes White Dragon', GK('Spy'));
  ok(on(g2, 0, GK('Visionary')) && inZ(g2, 0, 'gy', GK('Spy')), 'Spy discarded instead, Visionary stays');
});
T("Gravekeeper's Watcher: negates Graceful Charity", () => {
  const g = duel({ board: [{ hand: ['Graceful Charity'], turn: 2 }, { hand: [GK('Watcher')] }] });
  const w = card(g, 1, GK('Watcher'));
  act(g, 0, 'Graceful Charity'); settle(g, 'a:' + w.u + ':');
  ok(inZ(g, 1, 'gy', GK('Watcher')) && inZ(g, 0, 'gy', 'Graceful Charity') && g.p[0].hand.length === 1, `Charity negated, no draw (A hand ${g.p[0].hand.length})`);
});
T('Gravity Axe - Grarl: +500 ATK, opponent monsters cannot change position', () => {
  const g = duel({ board: [{ hand: ['Gravity Axe - Grarl'], m: [FILL], turn: 2 }, { m: ['Mystical Elf'] }] });
  act(g, 0, 'Gravity Axe - Grarl'); settle(g, FILL);
  ok(E.atk(g, on(g, 0, FILL)) === 2500, `Warwolf ${E.atk(g, on(g, 0, FILL))}`);
  endTurn(g);
  ok(!hasOpt(g, 'pos:' + on(g, 1, 'Mystical Elf').u), 'B cannot change the Elf position');
});

/* ---------------- Great cards ---------------- */
T('Great Dezard: after 1 kill negates targeting Spells; after 2 summons Fushioh Richie', () => {
  const g = duel({ board: [{ hand: ['Fushioh Richie'], m: ['Great Dezard'], turn: 2 }, { hand: ['Book of Moon'], m: ['Mystic Tomato', 'Mystic Tomato'] }] });
  bp(g); atkOn(g, 0, 'Great Dezard', 'Mystic Tomato');
  endTurn(g);
  const dz = on(g, 0, 'Great Dezard');
  if (canAct(g, 1, 'Book of Moon')) { act(g, 1, 'Book of Moon'); settle(g, 'Great Dezard'); }
  ok(dz.pos === 'atk' && dz.zone === 'm', 'Book of Moon had no effect on Dezard');
  ok(inZ(g, 1, 'gy', 'Book of Moon'), 'Book of Moon destroyed / sent to the GY');
  endTurn(g); bp(g); atkOn(g, 0, 'Great Dezard', 'Mystic Tomato');
  choose(g, 'endbp'); settle(g);
  ok(canAct(g, 0, 'Great Dezard'), 'Tribute effect offered after the 2nd kill');
  act(g, 0, 'Great Dezard'); settle(g, 'Fushioh Richie');
  ok(on(g, 0, 'Fushioh Richie') && inZ(g, 0, 'gy', 'Great Dezard'), 'Fushioh Richie Special Summoned');
});
T('Great Long Nose: skips the next Battle Phase, returns to the hand', () => {
  const g = duel({ board: [{ hand: ['Great Long Nose'], m: [FILL], turn: 2 }, { m: [] }] });
  ns(g, 0, 'Great Long Nose', FILL);
  bp(g); atkOn(g, 0, 'Great Long Nose', null);
  ok(lp(g, 1) === 6100, `1900 damage (${lp(g, 1)})`);
  endTurn(g);
  ok(inZ(g, 0, 'hand', 'Great Long Nose'), 'back in the hand in the End Phase');
  ok(!hasOpt(g, 'bp'), 'B cannot enter the Battle Phase');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Great Long Nose'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn') || (act(g2, 0, 'Monster Reborn'), settle(g2), !on(g2, 0, 'Great Long Nose')), 'cannot be Special Summoned');
});
T('Great Maju Garzett: ATK twice the Tribute original ATK', () => {
  const g = duel({ board: [{ hand: ['Great Maju Garzett'], m: [FILL], turn: 2 }, {}] });
  ns(g, 0, 'Great Maju Garzett', FILL);
  ok(E.atk(g, on(g, 0, 'Great Maju Garzett')) === 4000, `ATK ${E.atk(g, on(g, 0, 'Great Maju Garzett'))}`);
});
T('Great Moth: not Normal Summonable; Tribute Petit Moth with Cocoon on the 4th turn', () => {
  const g = duel({ board: [{ hand: ['Great Moth', 'Cocoon of Evolution'], m: ['Petit Moth'], turn: 2 }, {}] });
  const gm = card(g, 0, 'Great Moth');
  ok(noSummon(g, gm), 'no summon at first');
  act(g, 0, 'Cocoon of Evolution'); settle(g, 'Petit Moth');
  ok(!hasOpt(g, 'sp:' + gm.u), 'not on the turn of the equip');
  let first = 0;
  for (let k = 1; k <= 5; k++) { endTurn(g); endTurn(g); if (!first && hasOpt(g, 'sp:' + gm.u)) first = k; }
  ok(first === 4, `Special Summon offered first on A's 4th turn after the equip (turn ${first})`);
  if (hasOpt(g, 'sp:' + gm.u)) { choose(g, 'sp:' + gm.u); settle(g); }
  ok(on(g, 0, 'Great Moth') && inZ(g, 0, 'gy', 'Petit Moth'), 'Great Moth Special Summoned');
});
T('Great Phantom Thief: battle damage, declare a name, discard all copies', () => {
  const g = duel({ board: [{ m: ['Great Phantom Thief'], turn: 2 }, { hand: ['Pot of Greed', 'Pot of Greed', 'Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Great Phantom Thief', null, 'Pot of Greed');
  ok(cnt(g, 1, 'gy', 'Pot of Greed') === 2 && inZ(g, 1, 'hand', 'Mystical Elf'), 'both Pots discarded, Elf stays');
});
T('Great Shogun Shien: summon with 2 Six Samurai, opponent 1 Spell/Trap per turn, substitute destruction', () => {
  const g = duel({ board: [{ hand: ['Great Shogun Shien'], m: ['The Six Samurai - Yaichi', 'The Six Samurai - Kamon'], turn: 2 }, { hand: ['Pot of Greed', 'Upstart Goblin'], m: ['Exiled Force'] }] });
  const sh = card(g, 0, 'Great Shogun Shien');
  ok(hasOpt(g, 'sp:' + sh.u), 'Special Summon offered'); choose(g, 'sp:' + sh.u); settle(g);
  ok(on(g, 0, 'Great Shogun Shien'), 'Shien on the field');
  endTurn(g);
  act(g, 1, 'Pot of Greed'); settle(g);
  ok(!canAct(g, 1, 'Upstart Goblin'), 'B cannot activate a second Spell');
  act(g, 1, 'Exiled Force'); settle(g, 'Great Shogun Shien', 'The Six Samurai - Kamon');
  ok(on(g, 0, 'Great Shogun Shien') && cnt(g, 0, 'gy') === 1, 'a Six Samurai destroyed instead of Shien');
  const g2 = duel({ board: [{ hand: ['Great Shogun Shien'], m: ['The Six Samurai - Yaichi', FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Great Shogun Shien').u), 'no Special Summon with 1 Six Samurai');
});
T('Great Spirit: flips itself face-down; Flip Summon swaps an EARTH ATK/DEF', () => {
  const g = duel({ board: [{ m: [{ n: 'Great Spirit', pos: 'set' }, FILL], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g, FILL);
  const w = on(g, 0, FILL);
  ok(E.atk(g, w) === 100 && E.def(g, w) === 2000, `Warwolf ${E.atk(g, w)}/${E.def(g, w)}`);
  endTurn(g); endTurn(g);
  ok(E.atk(g, w) === 2000, 'back to 2000 next turn');
  act(g, 0, 'Great Spirit'); settle(g);
  ok(on(g, 0, 'Great Spirit').pos === 'set', 'flipped face-down');
});
T('Greed: 500 per card drawn by an effect, in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: [{ n: 'Greed', pos: 'up' }], turn: 2 }, {}] });
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(lp(g, 0) === 8000, 'no damage yet');
  endTurn(g);
  ok(lp(g, 0) === 7000 && lp(g, 1) === 8000, `A took 1000 in the End Phase (${lp(g, 0)}), B's normal draw is free (${lp(g, 1)})`);
});
T('Greed Grado: draw 2 after destroying an opponent Synchro', () => {
  const g = duel({ board: [{ hand: ['Greed Grado', 'Raigeki'], turn: 2 }, { m: ['Goyo Guardian'] }] });
  ok(!canAct(g, 0, 'Greed Grado'), 'not before a Synchro is destroyed');
  act(g, 0, 'Raigeki'); settle(g);
  const h = g.p[0].hand.length;
  ok(canAct(g, 0, 'Greed Grado'), 'available after'); act(g, 0, 'Greed Grado'); settle(g);
  ok(g.p[0].hand.length === h + 1, `drew 2 (hand ${h} to ${g.p[0].hand.length})`);
});
T('Greed Quasar: Level x 300, gains the Level of monsters it destroys', () => {
  const g = duel({ board: [{ m: ['Greed Quasar'], turn: 2 }, { m: [FILL] }] });
  const q = on(g, 0, 'Greed Quasar');
  ok(E.atk(g, q) === 2100 && E.def(g, q) === 2100, `${E.atk(g, q)}/${E.def(g, q)}`);
  bp(g); atkOn(g, 0, 'Greed Quasar', FILL);
  ok(E.lib.lv(q) === 11 && E.atk(g, q) === 3300, `Level ${E.lib.lv(q)}, ATK ${E.atk(g, q)}`);
});

/* ---------------- Guardians ---------------- */
T('Guardian Angel Joan: gains the destroyed monster original ATK', () => {
  const g = duel({ board: [{ m: ['Guardian Angel Joan'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Guardian Angel Joan', FILL);
  ok(lp(g, 0) === 10000, `A gained 2000 (${lp(g, 0)})`);
});
T('Guardian Baou: needs Flamberge; +1000 on a kill and negates the destroyed monster', () => {
  const g0 = duel({ board: [{ hand: ['Guardian Baou'], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Guardian Baou')), 'no summon without Flamberge');
  const g = duel({ board: [{ hand: ['Wicked-Breaking Flamberge - Baou', 'Guardian Baou', 'Pot of Greed'], m: [FILL], turn: 2 }, { hand: [], m: [{ n: 'Sangan', pos: 'def' }], deckTop: ['Mystic Tomato'] }] });
  act(g, 0, 'Wicked-Breaking Flamberge - Baou'); settle(g, 'Pot of Greed', FILL);
  ns(g, 0, 'Guardian Baou');
  const b = on(g, 0, 'Guardian Baou'); ok(b, 'Guardian Baou summoned with Flamberge face-up');
  bp(g); atkOn(g, 0, 'Guardian Baou', 'Sangan', 'Mystic Tomato');
  ok(E.atk(g, b) === 1800, `Baou ${E.atk(g, b)} ATK`);
  ok(!inZ(g, 1, 'hand', 'Mystic Tomato'), 'Sangan effect negated');
});
T('Guardian Ceal: needs the Bow; send an equipped Equip Spell to destroy a monster', () => {
  const g0 = duel({ board: [{ hand: ['Guardian Ceal'], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Guardian Ceal')), 'no summon without the Bow');
  const g = duel({ board: [{ hand: ['Shooting Star Bow - Ceal', 'Guardian Ceal', 'Gravity Axe - Grarl'], m: [FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Shooting Star Bow - Ceal'); settle(g, FILL);
  ns(g, 0, 'Guardian Ceal');
  act(g, 0, 'Gravity Axe - Grarl'); settle(g, 'Guardian Ceal');
  ok(E.atk(g, on(g, 0, 'Guardian Ceal')) === 2200, 'Axe on Ceal');
  act(g, 0, 'Guardian Ceal'); settle(g, 'Gravity Axe - Grarl', 'Blue-Eyes White Dragon');
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && inZ(g, 0, 'gy', 'Gravity Axe - Grarl'), 'Axe sent, Blue-Eyes destroyed');
});
T('Guardian Eatos: Special Summon with no monsters in GY; send an equip to banish and gain ATK', () => {
  const g = duel({ board: [{ hand: ['Guardian Eatos', 'Gravity Axe - Grarl'], turn: 2 }, { gy: ['Sangan', 'Mystic Tomato'] }] });
  const e = card(g, 0, 'Guardian Eatos');
  choose(g, 'sp:' + e.u); settle(g);
  act(g, 0, 'Gravity Axe - Grarl'); settle(g, 'Guardian Eatos');
  ok(E.atk(g, e) === 3000, `3000 with the Axe (${E.atk(g, e)})`);
  act(g, 0, 'Guardian Eatos'); settle(g, 'Gravity Axe - Grarl', 'Sangan', 'Mystic Tomato');
  ok(cnt(g, 1, 'ban') === 2 && E.atk(g, e) === 3500, `2 banished, ${E.atk(g, e)} ATK`);
  const g2 = duel({ board: [{ hand: ['Guardian Eatos'], gy: ['Sangan'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Guardian Eatos').u), 'no Special Summon with a monster in the GY');
});
T('Guardian Elma: needs the Dagger; on summon equips an Equip Spell from the GY', () => {
  const g0 = duel({ board: [{ hand: ['Guardian Elma'], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Guardian Elma')), 'no summon without the Dagger');
  const g = duel({ board: [{ hand: ['Butterfly Dagger - Elma', 'Guardian Elma'], m: [FILL], gy: ['Gravity Axe - Grarl'], turn: 2 }, {}] });
  act(g, 0, 'Butterfly Dagger - Elma'); settle(g, FILL);
  ns(g, 0, 'Guardian Elma', 'Gravity Axe - Grarl');
  ok(E.atk(g, on(g, 0, 'Guardian Elma')) === 1800 && inZ(g, 0, 'st', 'Gravity Axe - Grarl'), `Elma ${E.atk(g, on(g, 0, 'Guardian Elma'))} with the Axe`);
});
T('Guardian Grarl: needs the Axe; Special Summon when it is the only card in hand', () => {
  const g0 = duel({ board: [{ hand: ['Guardian Grarl'], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Guardian Grarl')), 'no summon without the Axe');
  const g = duel({ board: [{ hand: ['Gravity Axe - Grarl', 'Guardian Grarl'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Gravity Axe - Grarl'); settle(g, FILL);
  // the drawn Warwolf is still in hand; it gets Normal Summoned first
  ns(g, 0, FILL);
  const gr = card(g, 0, 'Guardian Grarl');
  ok(g.p[0].hand.length === 1 && hasOpt(g, 'sp:' + gr.u), 'Special Summon offered as the only card');
  choose(g, 'sp:' + gr.u); settle(g);
  ok(on(g, 0, 'Guardian Grarl'), 'Grarl Special Summoned');
});
T("Guardian Kay'est: needs the Rod; unaffected by Spells, cannot be attacked", () => {
  const g0 = duel({ board: [{ hand: ["Guardian Kay'est"], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, "Guardian Kay'est")), 'no summon without the Rod');
  const g = duel({ board: [{ hand: ['Raigeki'], m: [FILL], turn: 2 }, { m: ["Guardian Kay'est"] }] });
  act(g, 0, 'Raigeki'); settle(g);
  ok(on(g, 1, "Guardian Kay'est"), 'Raigeki did not destroy it');
  bp(g);
  ok(!canAtk(g, on(g, 0, FILL), on(g, 1, "Guardian Kay'est")) && canAtk(g, on(g, 0, FILL), null), 'not attackable, direct attack allowed');
});
T('Guardian of Order: Special Summon with 2 LIGHT, only 1', () => {
  const g = duel({ board: [{ hand: ['Guardian of Order', 'Guardian of Order'], m: ['Mystical Elf', 'Mystical Elf'], turn: 2 }, {}] });
  const [a, b] = g.p[0].hand.filter(c => E.name(c) === 'Guardian of Order');
  ok(hasOpt(g, 'sp:' + a.u), 'Special Summon offered'); choose(g, 'sp:' + a.u); settle(g);
  ok(on(g, 0, 'Guardian of Order') && !hasOpt(g, 'sp:' + b.u) && !hasOpt(g, 'ns:' + b.u), 'second one cannot be summoned');
  const g2 = duel({ board: [{ hand: ['Guardian of Order'], m: ['Mystical Elf', FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Guardian of Order').u), 'no Special Summon with 1 LIGHT');
});
T('Guardian Sphinx: Flip Summon bounces all opponent monsters; flips itself down', () => {
  const g = duel({ board: [{ m: [{ n: 'Guardian Sphinx', pos: 'set' }], turn: 2 }, { hand: [], m: [FILL, 'Mystical Elf'] }] });
  choose(g, 'flip:'); settle(g);
  ok(cnt(g, 1, 'm') === 0 && g.p[1].hand.length === 2, 'both B monsters in hand');
  const g2 = duel({ board: [{ m: ['Guardian Sphinx'], turn: 2 }, {}] });
  act(g2, 0, 'Guardian Sphinx'); settle(g2);
  ok(on(g2, 0, 'Guardian Sphinx').pos === 'set', 'set face-down');
  ok(!canAct(g2, 0, 'Guardian Sphinx'), 'once per turn');
});
T('Guardian Statue: Flip Summon bounces 1 opponent monster; flips itself down', () => {
  const g = duel({ board: [{ m: [{ n: 'Guardian Statue', pos: 'set' }], turn: 2 }, { hand: [], m: [FILL, 'Mystical Elf'] }] });
  choose(g, 'flip:'); settle(g, 'Mystical Elf');
  ok(cnt(g, 1, 'm') === 1 && inZ(g, 1, 'hand', 'Mystical Elf'), 'Elf in B hand, Warwolf stays');
  const g2 = duel({ board: [{ m: ['Guardian Statue'], turn: 2 }, {}] });
  act(g2, 0, 'Guardian Statue'); settle(g2);
  ok(on(g2, 0, 'Guardian Statue').pos === 'set', 'set face-down');
});
T('Guardian Tryce: needs the Swords; destroyed, revives its Tribute', () => {
  const g0 = duel({ board: [{ hand: ['Guardian Tryce'], m: [FILL], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Guardian Tryce')), 'no summon without the Swords');
  const g = duel({ board: [{ hand: ['Twin Swords of Flashing Light - Tryce', 'Guardian Tryce', 'Pot of Greed'], m: [FILL, 'Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Twin Swords of Flashing Light - Tryce'); settle(g, 'Pot of Greed', FILL);
  ns(g, 0, 'Guardian Tryce', 'Mystical Elf');
  ok(on(g, 0, 'Guardian Tryce') && inZ(g, 0, 'gy', 'Mystical Elf'), 'Tryce Tribute Summoned with the Elf');
  bp(g); atkOn(g, 0, 'Guardian Tryce', 'Blue-Eyes White Dragon');
  ok(inZ(g, 0, 'gy', 'Guardian Tryce') && on(g, 0, 'Mystical Elf'), 'Elf Special Summoned back');
});

/* ---------------- Harpies ---------------- */
T('Harpie Lady 1: all WIND +300', () => {
  const g = duel({ board: [{ m: ['Harpie Lady 1'], turn: 2 }, { m: ['Harpie Lady 2', FILL] }] });
  ok(E.atk(g, on(g, 0, 'Harpie Lady 1')) === 1600 && E.atk(g, on(g, 1, 'Harpie Lady 2')) === 1600 && E.atk(g, on(g, 1, FILL)) === 2000, 'both Harpies 1600, Warwolf 2000');
});
T('Harpie Lady 2: negates the effect of a Flip monster it destroys', () => {
  const g = duel({ board: [{ m: ['Harpie Lady 2'], turn: 2 }, { m: [{ n: 'Man-Eater Bug', pos: 'set' }] }] });
  bp(g); atkOn(g, 0, 'Harpie Lady 2', 'Man-Eater Bug');
  ok(on(g, 0, 'Harpie Lady 2') && inZ(g, 1, 'gy', 'Man-Eater Bug'), 'Bug destroyed, its FLIP did not destroy Harpie Lady 2');
});
T('Harpie Lady 3: the monster that battles it cannot attack for 2 opponent turns', () => {
  const g = duel({ board: [{ m: ['Harpie Lady 3'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Harpie Lady 3', 'Mystical Elf');
  const e = on(g, 1, 'Mystical Elf');
  endTurn(g); choose(g, 'pos:' + e.u); settle(g); bp(g);
  ok(!canAtk(g, e, on(g, 0, 'Harpie Lady 3')), 'Elf cannot attack on B next turn');
  endTurn(g); endTurn(g); bp(g);
  ok(!canAtk(g, e, on(g, 0, 'Harpie Lady 3')), 'nor the turn after');
  endTurn(g); endTurn(g); bp(g);
  ok(canAtk(g, e, on(g, 0, 'Harpie Lady 3')), 'it can attack on the third turn');
});
T('Harpie Lady Sisters: not Normal Summonable, Elegant Egotist summons it', () => {
  const g = duel({ board: [{ hand: ['Harpie Lady Sisters', 'Elegant Egotist'], m: ['Harpie Lady', FILL], turn: 2 }, {}] });
  ok(noSummon(g, card(g, 0, 'Harpie Lady Sisters')), 'no Normal Summon or Set');
  act(g, 0, 'Elegant Egotist'); settle(g, 'Harpie Lady Sisters');
  ok(on(g, 0, 'Harpie Lady Sisters'), 'Sisters Special Summoned by Egotist');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Harpie Lady Sisters'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn') || (act(g2, 0, 'Monster Reborn'), settle(g2), !on(g2, 0, 'Harpie Lady Sisters')), 'not properly summoned, cannot be revived');
});
T("Harpie Queen: discard to search Harpies' Hunting Ground; named Harpie Lady on the field", () => {
  const g = duel({ board: [{ hand: ['Harpie Queen'], deckTop: [FILL, "Harpies' Hunting Ground"], turn: 2 }, {}] });
  act(g, 0, 'Harpie Queen'); settle(g);
  ok(inZ(g, 0, 'hand', "Harpies' Hunting Ground") && g.p[0].gy.some(c => c.u && /Harpie/.test(E.name(c))), 'Hunting Ground added, Queen in the GY');
  const g2 = duel({ board: [{ m: ['Harpie Queen', "Harpie's Pet Dragon"], turn: 2 }, {}] });
  ok(E.atk(g2, on(g2, 0, "Harpie's Pet Dragon")) === 2300, 'Queen counts as a Harpie Lady on the field: Pet Dragon +300');
});
T("Harpie's Feather Duster: destroys all opponent Spells/Traps", () => {
  const g = duel({ board: [{ hand: ["Harpie's Feather Duster"], st: ['Mirror Force'], turn: 2 }, { st: ['Mirror Force', { n: GK('Servant'), pos: 'up' }] }] });
  act(g, 0, "Harpie's Feather Duster"); settle(g);
  ok(cnt(g, 1, 'st') === 0 && inZ(g, 0, 'st', 'Mirror Force'), 'B Spells/Traps gone, A keeps its own');
});
T("Harpie's Pet Baby Dragon: 1, 2, 3 Harpies", () => {
  const g = duel({ board: [{ m: ["Harpie's Pet Baby Dragon", 'Harpie Lady 2', 'Harpie Lady 3', 'Harpie Queen'], turn: 2 }, { st: [{ n: GK('Servant'), pos: 'up' }], m: [FILL] }] });
  const b = on(g, 0, "Harpie's Pet Baby Dragon");
  ok(E.atk(g, b) === 2400 && E.def(g, b) === 1200, `2400/1200 (${E.atk(g, b)}/${E.def(g, b)})`);
  act(g, 0, "Harpie's Pet Baby Dragon"); settle(g, GK('Servant'));
  ok(inZ(g, 1, 'gy', GK('Servant')) && on(g, 1, FILL), 'destroyed the chosen card');
  ok(!canAct(g, 0, "Harpie's Pet Baby Dragon"), 'once per turn');
  endTurn(g); bp(g);
  const w = on(g, 1, FILL);
  ok(canAtk(g, w, b) && !g.p[0].m.filter(c => c && c !== b).some(h => canAtk(g, w, h)), 'B can attack only the Baby Dragon');
  const g2 = duel({ board: [{ m: ["Harpie's Pet Baby Dragon", 'Harpie Lady 2'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(E.atk(g2, on(g2, 0, "Harpie's Pet Baby Dragon")) === 1200 && !canAct(g2, 0, "Harpie's Pet Baby Dragon"), 'with 1 Harpie: 1200, no destroy');
});
T("Harpie's Pet Dragon: +300 ATK/DEF per Harpie Lady on both sides", () => {
  const g = duel({ board: [{ m: ["Harpie's Pet Dragon", 'Harpie Lady 2'], turn: 2 }, { m: ['Harpie Lady 3'] }] });
  const d = on(g, 0, "Harpie's Pet Dragon");
  ok(E.atk(g, d) === 2600 && E.def(g, d) === 3100, `${E.atk(g, d)}/${E.def(g, d)}`);
});

/* ---------------- HERO cards ---------------- */
T('Hero Barrier: negates an attack with an Elemental HERO face-up', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Elemental HERO Avian'], st: ['Hero Barrier'] }] });
  const hb = card(g, 1, 'Hero Barrier');
  bp(g); atkOn(g, 0, FILL, 'Elemental HERO Avian', 'a:' + hb.u + ':');
  ok(on(g, 1, 'Elemental HERO Avian') && lp(g, 1) === 8000 && inZ(g, 1, 'gy', 'Hero Barrier'), 'attack negated');
});
T('Hero Counterattack: a random HERO from hand is summoned and an opponent monster destroyed', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { hand: ['Elemental HERO Sparkman'], m: ['Elemental HERO Avian'], st: ['Hero Counterattack'] }] });
  const hc = card(g, 1, 'Hero Counterattack');
  bp(g); atkOn(g, 0, FILL, 'Elemental HERO Avian', 'a:' + hc.u + ':', 'Elemental HERO Sparkman', FILL);
  ok(on(g, 1, 'Elemental HERO Sparkman') && inZ(g, 0, 'gy', FILL), 'Sparkman summoned, Warwolf destroyed');
});
T('Hero Flash!!: banish H, E, R, O; summon a Normal HERO; direct attacks', () => {
  const g = duel({ board: [{ hand: ['Hero Flash!!'], gy: ['H - Heated Heart', 'E - Emergency Call', 'R - Righteous Justice', 'O - Oversoul'], m: ['Elemental HERO Clayman'], deckTop: [FILL, 'Elemental HERO Avian'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Hero Flash!!'); settle(g, 'Elemental HERO Avian');
  ok(on(g, 0, 'Elemental HERO Avian') && cnt(g, 0, 'ban') === 4, 'Avian summoned, 4 banished');
  bp(g);
  ok(canAtk(g, on(g, 0, 'Elemental HERO Avian'), null) && canAtk(g, on(g, 0, 'Elemental HERO Clayman'), null), 'both can attack directly');
  const g2 = duel({ board: [{ hand: ['Hero Flash!!'], gy: ['H - Heated Heart', 'E - Emergency Call', 'R - Righteous Justice'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Hero Flash!!'), 'needs all four');
});
T('Hero Heart: halve a HERO ATK, attack twice', () => {
  const g = duel({ board: [{ hand: ['Hero Heart'], m: ['Elemental HERO Sparkman'], turn: 2 }, {}] });
  act(g, 0, 'Hero Heart'); settle(g, 'Elemental HERO Sparkman');
  const s = on(g, 0, 'Elemental HERO Sparkman');
  ok(E.atk(g, s) === 800, `Sparkman ${E.atk(g, s)}`);
  bp(g); atkOn(g, 0, 'Elemental HERO Sparkman', null);
  ok(canAtk(g, s, null), 'a second attack'); atkOn(g, 0, 'Elemental HERO Sparkman', null);
  ok(lp(g, 1) === 6400, `B took 1600 (${lp(g, 1)})`);
});
T('Hero Kid: when Special Summoned, summon more from the Deck', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Hero Kid'], deckTop: [FILL, 'Hero Kid', 'Hero Kid'], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); settle(g, 'Hero Kid', 'Hero Kid', 'Hero Kid');
  ok(cnt(g, 0, 'm', 'Hero Kid') === 3, `3 Hero Kids (${cnt(g, 0, 'm', 'Hero Kid')})`);
});
T('Hero Mask: a monster takes the name of a HERO sent from the Deck', () => {
  const g = duel({ board: [{ hand: ['Hero Mask'], m: [FILL], deckTop: [FILL, 'Elemental HERO Avian'], turn: 2 }, {}] });
  const w = on(g, 0, FILL);
  act(g, 0, 'Hero Mask'); settle(g, FILL, 'Elemental HERO Avian');
  // PARTIAL / ENGINE in the script: name() can't be changed, so only the send and the logged name change are checked.
  ok(inZ(g, 0, 'gy', 'Elemental HERO Avian') && g.log.some(l => /treated as Elemental HERO Avian/.test(l)), 'Avian sent to the GY, the name change logged');
});
T('Hero Medal: destroyed while Set by the opponent, shuffles back and draws', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'], turn: 2 }, { st: ['Hero Medal'] }] });
  const h = g.p[1].hand.length, d = g.p[1].deck.length;
  act(g, 0, 'Heavy Storm'); settle(g);
  ok(!inZ(g, 1, 'gy', 'Hero Medal') && g.p[1].hand.length === h + 1 && g.p[1].deck.length === d, `Medal back in the Deck, B drew 1 (hand ${g.p[1].hand.length})`);
});
// Hero Ring is PARTIAL by design: the 1900+ attack is negated as it is declared instead of being kept off the target list.
T('Hero Ring: opponent monsters with 1900+ ATK cannot attack the equipped Warrior', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Avian'], st: ['Hero Ring'], turn: 2 }, { m: [FILL, 'Mystic Tomato'] }] });
  act(g, 0, 'Hero Ring'); settle(g, 'Elemental HERO Avian');
  ok(inZ(g, 0, 'st', 'Hero Ring'), 'Hero Ring equipped');
  endTurn(g); bp(g);
  const a = on(g, 0, 'Elemental HERO Avian');
  atkOn(g, 1, FILL, 'Elemental HERO Avian');
  ok(on(g, 0, 'Elemental HERO Avian') && lp(g, 0) === 8000, 'the Warwolf attack on Avian does nothing');
  atkOn(g, 1, 'Mystic Tomato', 'Elemental HERO Avian');
  ok(!on(g, 0, 'Elemental HERO Avian'), 'Mystic Tomato (1400) can attack and destroy it');
});
T('Hero Signal: a monster destroyed by battle brings out a Level 4 HERO', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { hand: ['Elemental HERO Sparkman'], m: ['Mystical Elf'], st: ['Hero Signal'] }] });
  const hs = card(g, 1, 'Hero Signal');
  bp(g); atkOn(g, 0, FILL, 'Mystical Elf', 'a:' + hs.u + ':', 'Elemental HERO Sparkman');
  ok(on(g, 1, 'Elemental HERO Sparkman'), 'Sparkman Special Summoned');
});
T('Hero Spirit: after a HERO dies in battle, 0 damage from 1 monster', () => {
  const g = duel({ board: [{ m: [FILL, 'Luster Dragon'], turn: 2 }, { m: ['Elemental HERO Avian'], st: ['Hero Spirit'] }] });
  const sp = card(g, 1, 'Hero Spirit');
  bp(g); atkOn(g, 0, FILL, 'Elemental HERO Avian');
  ok(lp(g, 1) === 7000, `B took 1000 (${lp(g, 1)})`);
  atkOn(g, 0, 'Luster Dragon', null, 'a:' + sp.u + ':', 'Luster Dragon');
  ok(lp(g, 1) === 7000 && inZ(g, 1, 'gy', 'Hero Spirit'), `no damage from Luster Dragon (${lp(g, 1)})`);
});

/* ---------------- Horns and Horus ---------------- */
T('Horn of Heaven: Tribute 1, negate a Normal Summon and destroy it', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { m: ['Sangan'], st: ['Horn of Heaven'] }] });
  const h = card(g, 1, 'Horn of Heaven');
  choose(g, 'ns:' + g.p[0].hand[0].u); settle(g, 'a:' + h.u + ':', 'Sangan');
  ok(cnt(g, 0, 'm') === 0 && inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Sangan'), 'summon negated, Sangan tributed');
});
T('Horn of Light: +800 DEF; pay 500 to return it to the top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Horn of Light'], m: [FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Horn of Light'); settle(g, FILL);
  ok(E.def(g, on(g, 0, FILL)) === 900, `DEF ${E.def(g, on(g, 0, FILL))}`);
  bp(g); atkOn(g, 0, FILL, 'Blue-Eyes White Dragon');
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(E.name(top) === 'Horn of Light' && lp(g, 0) === 6500, `Horn on top of the Deck, A paid 500 (${lp(g, 0)})`);
});
T('Horn of the Unicorn: +700 ATK/DEF, back on top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Horn of the Unicorn'], m: [FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Horn of the Unicorn'); settle(g, FILL);
  const w = on(g, 0, FILL);
  ok(E.atk(g, w) === 2700 && E.def(g, w) === 800, `${E.atk(g, w)}/${E.def(g, w)}`);
  bp(g); atkOn(g, 0, FILL, 'Blue-Eyes White Dragon');
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(E.name(top) === 'Horn of the Unicorn' && lp(g, 0) === 7700, 'Horn on top of the Deck');
});
T('Horus LV4: control cannot switch; End Phase after a kill summons LV6', () => {
  const g = duel({ board: [{ hand: ['Horus the Black Flame Dragon LV6'], m: ['Horus the Black Flame Dragon LV4'], turn: 2 }, { m: ['Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Horus the Black Flame Dragon LV4', 'Mystical Elf');
  endTurn(g);
  ok(on(g, 0, 'Horus the Black Flame Dragon LV6') && inZ(g, 0, 'gy', 'Horus the Black Flame Dragon LV4'), 'LV6 summoned in the End Phase');
  const g2 = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: ['Horus the Black Flame Dragon LV4'] }] });
  if (canAct(g2, 0, 'Change of Heart')) { act(g2, 0, 'Change of Heart'); settle(g2, 'Horus'); }
  ok(on(g2, 1, 'Horus the Black Flame Dragon LV4'), 'Change of Heart cannot take it');
});
T('Horus LV6: unaffected by Spells; End Phase after a kill summons LV8', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Horus the Black Flame Dragon LV6'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Dark Hole'); settle(g);
  ok(on(g, 0, 'Horus the Black Flame Dragon LV6') && cnt(g, 1, 'm') === 0, 'Dark Hole did not destroy LV6');
  const g2 = duel({ board: [{ hand: ['Horus the Black Flame Dragon LV8'], m: ['Horus the Black Flame Dragon LV6'], turn: 2 }, { m: ['Mystical Elf'] }] });
  bp(g2); atkOn(g2, 0, 'Horus the Black Flame Dragon LV6', 'Mystical Elf');
  endTurn(g2);
  ok(on(g2, 0, 'Horus the Black Flame Dragon LV8'), 'LV8 summoned in the End Phase');
});
T('Horus LV8: not Normal Summonable; negates a Spell activation', () => {
  const g0 = duel({ board: [{ hand: ['Horus the Black Flame Dragon LV8'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Horus the Black Flame Dragon LV8')), 'no Normal Summon');
  const g = duel({ board: [{ m: ['Horus the Black Flame Dragon LV8'], turn: 2 }, { hand: ['Pot of Greed'] }] });
  endTurn(g);
  const h8 = on(g, 0, 'Horus the Black Flame Dragon LV8');
  const h = g.p[1].hand.length;
  act(g, 1, 'Pot of Greed'); settle(g, 'a:' + h8.u + ':');
  ok(inZ(g, 1, 'gy', 'Pot of Greed') && g.p[1].hand.length === h - 1, `Pot negated (B hand ${g.p[1].hand.length})`);
});

// Goat: shared scripts of 'both' cards with the Goat card pool
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
  const gduel = board => (lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: [] })), first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board }));
  const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = E0; } });
  G('Grave Protector', () => {
    const g = gduel([{ m: [GF, 'Grave Protector'], turn: 2 }, { m: ['Sangan'] }]);
    bp(g); atkOn(g, 0, GF, 'Sangan');
    ok(!inZ(g, 1, 'gy', 'Sangan') && g.p[1].deck.some(c => E.name(c) === 'Sangan'), 'Goat: Sangan shuffled into the Deck');
  });
  G("Gravekeeper's Spear Soldier", () => {
    const g = gduel([{ m: [GK('Spear Soldier')], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }] }]);
    bp(g); atkOn(g, 0, GK('Spear Soldier'), 'Sangan');
    ok(lp(g, 1) === 7100, `Goat: 900 piercing (${lp(g, 1)})`);
  });
  G('Great Long Nose', () => {
    const g = gduel([{ hand: ['Great Long Nose'], m: [GF], turn: 2 }, {}]);
    ns(g, 0, 'Great Long Nose', GF); bp(g); atkOn(g, 0, 'Great Long Nose', null); endTurn(g);
    ok(inZ(g, 0, 'hand', 'Great Long Nose') && !hasOpt(g, 'bp'), 'Goat: back to hand, B skips the Battle Phase');
  });
  G('Harpie Lady Sisters and Elegant Egotist', () => {
    const g = gduel([{ hand: ['Harpie Lady Sisters', 'Elegant Egotist'], m: ['Harpie Lady'], turn: 2 }, {}]);
    ok(noSummon(g, card(g, 0, 'Harpie Lady Sisters')), 'Goat: no Normal Summon');
    act(g, 0, 'Elegant Egotist'); settle(g, 'Harpie Lady Sisters');
    ok(on(g, 0, 'Harpie Lady Sisters'), 'Goat: Sisters summoned');
  });
  G("Harpie's Feather Duster", () => {
    const g = gduel([{ hand: ["Harpie's Feather Duster"], turn: 2 }, { st: ['Mirror Force', 'Mirror Force'] }]);
    act(g, 0, "Harpie's Feather Duster"); settle(g);
    ok(cnt(g, 1, 'st') === 0, 'Goat: B backrow destroyed');
  });
  G('Horn of the Unicorn', () => {
    const g = gduel([{ hand: ['Horn of the Unicorn', 'Heavy Storm'], m: [GF], turn: 2 }, {}]);
    act(g, 0, 'Horn of the Unicorn'); settle(g, GF);
    const atk0 = E.atk(g, on(g, 0, GF));
    act(g, 0, 'Heavy Storm'); settle(g);
    ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Horn of the Unicorn' && atk0 === 1800 + 700, `Goat: +700 then back on top (${atk0})`);
  });
  G('Horus LV8 negates a Spell', () => {
    const g = gduel([{ m: ['Horus the Black Flame Dragon LV8'], turn: 2 }, { hand: ['Pot of Greed'] }]);
    endTurn(g); const h8 = on(g, 0, 'Horus the Black Flame Dragon LV8');
    act(g, 1, 'Pot of Greed'); settle(g, 'a:' + h8.u + ':');
    ok(inZ(g, 1, 'gy', 'Pot of Greed'), 'Goat: Pot negated');
  });
  G('Hero Signal', () => {
    const g = gduel([{ m: [GF], turn: 2 }, { hand: ['Elemental HERO Sparkman'], m: ['Sangan'], st: ['Hero Signal'] }]);
    const hs = card(g, 1, 'Hero Signal');
    bp(g); atkOn(g, 0, GF, 'Sangan', 'a:' + hs.u + ':', 'Elemental HERO Sparkman');
    ok(on(g, 1, 'Elemental HERO Sparkman'), 'Goat: Sparkman summoned');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-09 review checks passed.');
process.exit(fails ? 1 : 0);
