// Scenario checks for batch 7: node build/test_batch-7.js
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
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

const L = E.lib;
const passTo = (g, upto = 30) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const say = (g, yes) => { for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'yesno'; i++) E.act(g, [yes ? 'y' : 'n']); };
const endTurn = g => { choose(g, 'end'); for (let i = 0; i < 6; i++) { passTo(g); say(g, false); } };
const card = (g, p, z, n) => g.p[p][z].find(c => c && E.name(c) === n);
const ids = (g, key) => g.prompt.opts.filter(o => (o.label + ' ' + o.key).toLowerCase().includes(key.toLowerCase()));

T('Chaos Emperor Dragon: summon, then send everything and burn', () => {
  const g = duel({ board: [{ hand: ['Chaos Emperor Dragon - Envoy of the End'], gy: ['Cyber Dragon', 'Dark Armed Dragon'], turn: 2 }, { m: [FILL] }] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'hand', 'Chaos Emperor Dragon - Envoy of the End').u), 'no Normal Summon offered');
  choose(g, 'banish a LIGHT'); passTo(g);
  const ced = on(g, 0, 'Chaos Emperor Dragon - Envoy of the End'); ok(!!ced, 'summoned by banishing a LIGHT and a DARK');
  const n = g.p[0].hand.length + g.p[1].hand.length + 2;
  choose(g, 'Pay 1000'); passTo(g);
  ok(!g.p[0].hand.length && !g.p[1].hand.length && !L.fieldMons(g).length, 'hands and field are empty');
  ok(g.p[1].lp === 8000 - 300 * n && g.p[0].lp === 7000, `300 x ${n} damage (B ${g.p[1].lp})`);
  ok(!L.forbid(g, { type: 'ss', c: ced, p: 0, how: 'special' }), 'a properly summoned one can be revived');
  const g2 = duel({ board: [{ gy: ['Chaos Emperor Dragon - Envoy of the End'], turn: 2 }, {}] });
  ok(L.forbid(g2, { type: 'ss', c: g2.p[0].gy[0], p: 0, how: 'special' }), 'one never summoned can\'t be revived');
});
T('Cyber Barrier Dragon: only by Attack Reflector Unit, negates the first attack', () => {
  const g = duel({ board: [{ hand: ['Cyber Barrier Dragon'], m: ['Cyber Dragon'], st: ['Attack Reflector Unit'], turn: 2 }, { m: [FILL, FILL] }] });
  const cbd = card(g, 0, 'hand', 'Cyber Barrier Dragon');
  ok(!hasOpt(g, 'ns:' + cbd.u) && L.forbid(g, { type: 'ss', c: cbd, p: 0, how: 'special' }), 'no Normal Summon, no other Special Summon');
  act(g, 0, 'Attack Reflector Unit'); passTo(g); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) choose(g, 'Cyber Barrier'); passTo(g);
  ok(on(g, 0, 'Cyber Barrier Dragon') && on(g, 0, 'Cyber Barrier Dragon').pos === 'atk', 'Cyber Barrier Dragon summoned in Attack Position');
  endTurn(g); passTo(g);
  choose(g, 'bp'); passTo(g); choose(g, 'Attack Cyber Barrier'); passTo(g);
  ok(g.log.some(l => /Cyber Barrier Dragon negated the attack/.test(l)) && on(g, 0, 'Cyber Barrier Dragon'), 'first attack negated');
  choose(g, 'Attack Cyber Barrier'); passTo(g); passTo(g); passTo(g);
  ok(g.p[0].lp < 8000, `second attack goes through (A ${g.p[0].lp})`);
});
T('Cocoon of Evolution makes Petit Moth 0/2000', () => {
  const g = duel({ board: [{ hand: ['Cocoon of Evolution'], m: ['Petit Moth'], turn: 2 }, {}] });
  choose(g, 'Equip to Petit Moth'); passTo(g);
  const m = on(g, 0, 'Petit Moth'); ok(m && E.atk(g, m) === 0 && E.def(g, m) === 2000 && inZ(g, 0, 'st', 'Cocoon of Evolution'), `Petit Moth ${E.atk(g, m)}/${E.def(g, m)}`);
});
T('Cocoon Party: Marine Dolphin counts as 2 names', () => {
  const g = duel({ board: [{ hand: ['Cocoon Party'], gy: ['Neo-Spacian Marine Dolphin'], deckTop: [FILL, 'Chrysalis Dolphin', 'Chrysalis Mole', 'Chrysalis Larva'], turn: 2 }, {}] });
  act(g, 0, 'Cocoon Party'); passTo(g); if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); passTo(g);
  ok(L.monsOf(g, 0).filter(x => /^Chrysalis/.test(E.name(x))).length === 2, '2 Chrysalis monsters summoned');
});
T('Cocoon Veil: no effect damage, summons the Neo-Spacian', () => {
  const g = duel({ board: [{ hand: [], m: ['Chrysalis Dolphin'], st: ['Cocoon Veil'], deckTop: [FILL, 'Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  act(g, 0, 'Cocoon Veil'); passTo(g); passTo(g);
  ok(on(g, 0, 'Neo-Spacian Aqua Dolphin') && inZ(g, 0, 'gy', 'Chrysalis Dolphin'), 'Chrysalis Tributed, Aqua Dolphin summoned');
  L.damage(g, 0, 500, {}); L.damage(g, 1, 500, {}); ok(g.p[0].lp === 8000 && g.p[1].lp === 8000, 'effect damage became 0 for both');
});
T('Cyber Kirin: effect damage 0 for its controller only', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Kirin'], turn: 2 }, {}] });
  choose(g, 'no effect damage'); passTo(g);
  L.damage(g, 0, 500, {}); L.damage(g, 1, 500, {}); ok(g.p[0].lp === 8000 && g.p[1].lp === 7500, `A ${g.p[0].lp}, B ${g.p[1].lp}`);
});
T('Crimson Fire doubles D.D. Dynamite back', () => {
  const g = duel({ board: [{ hand: [], st: ['D.D. Dynamite'], ban: [FILL], turn: 2 }, { m: ['Red Dragon Archfiend'], st: ['Crimson Fire'], ban: [FILL, FILL] }] });
  act(g, 0, 'D.D. Dynamite'); choose(g, 'Crimson Fire', 1); passTo(g);
  ok(g.p[1].lp === 8000 && g.p[0].lp === 8000 - 1200, `B takes nothing, A takes 1200 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Curse of Darkness burns the Spell activator', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: [FILL], st: [{ n: 'Curse of Darkness', pos: 'up' }] }] });
  act(g, 0, 'Book of Moon'); passTo(g);
  ok(g.p[0].lp === 7000 && g.p[1].lp === 8000, `A took 1000 (A ${g.p[0].lp})`);
});
T('Curse of Royal negates Mystical Space Typhoon', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], turn: 2 }, { st: ['Curse of Royal', 'Mirror Force'] }] });
  act(g, 0, 'Mystical Space Typhoon'); choose(g, 'u' + card(g, 1, 'st', 'Mirror Force').u); ok(hasOpt(g, 'Curse of Royal'), 'Curse of Royal offered'); choose(g, 'Curse of Royal'); passTo(g);
  ok(inZ(g, 1, 'st', 'Mirror Force') && inZ(g, 0, 'gy', 'Mystical Space Typhoon'), 'Mirror Force stays');
});
T('D.D. Crazy Beast banishes what it destroys', () => {
  const g = duel({ board: [{ hand: [], m: ['D.D. Crazy Beast'], turn: 2 }, { m: ['Petit Moth'] }] });
  choose(g, 'bp'); passTo(g); choose(g, 'Attack Petit Moth'); passTo(g); passTo(g); passTo(g);
  ok(inZ(g, 1, 'ban', 'Petit Moth') && !inZ(g, 1, 'gy', 'Petit Moth'), 'Petit Moth banished');
});
T('D.D. Trap Hole on a Set monster', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { m: ['Petit Moth'], st: ['D.D. Trap Hole'] }] });
  choose(g, 'set:'); if (g.prompt.type === 'yesno') choose(g, 'yes'); passTo(g);
  ok(inZ(g, 0, 'ban', FILL) && inZ(g, 1, 'ban', 'Petit Moth') && inZ(g, 1, 'gy', 'D.D. Trap Hole'), 'both banished, trap in the GY');
});
T('Cyber Jar resets the field', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Cyber Jar', pos: 'set' }], deckTop: [FILL, 'Petit Moth', 'Book of Moon'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'Flip Summon'); passTo(g);
  for (let i = 0; i < 12 && g.prompt && g.prompt.type === 'choose'; i++) choose(g, 'Face-up Attack'); passTo(g);
  ok(inZ(g, 0, 'gy', 'Cyber Jar') && inZ(g, 1, 'gy', FILL) && on(g, 0, 'Petit Moth') && inZ(g, 0, 'hand', 'Book of Moon'), 'monsters summoned, the rest to the hand');
});
T('Cyber Ogre negates the attack and gains 2000', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: ['Cyber Ogre'], m: ['Cyber Ogre'] }] });
  choose(g, 'bp'); passTo(g); choose(g, 'Attack Cyber Ogre'); choose(g, 'negate the battle', 1); passTo(g);
  const o = on(g, 1, 'Cyber Ogre'); ok(o && E.atk(g, o) === 3900 && g.p[1].lp === 8000, `attack negated, Ogre ${E.atk(g, o)}`);
});
T('Cyber Blader doubles with 2 opponent monsters, Cyber Fusions read Zwei and Proto', () => {
  const g = duel({ ex0: ['Cyber Blader'], board: [{ hand: [], m: ['Cyber Blader'], turn: 2 }, { m: [FILL, FILL] }] });
  ok(E.atk(g, on(g, 0, 'Cyber Blader')) === 4200, 'Cyber Blader 4200 ATK');
  const g2 = duel({ ex0: ['Cyber End Dragon', 'Cyber Twin Dragon'], board: [{ hand: ['Cyber Dragon'], m: ['Proto-Cyber Dragon'], gy: ['Cyber Dragon Zwei'], turn: 2 }, {}] });
  ok(L.canFusion(g2, 0, { from: ['hand', 'm', 'gy'], filter: f => E.name(f) === 'Cyber End Dragon' }) && L.canFusion(g2, 0, { filter: f => E.name(f) === 'Cyber Twin Dragon' }), 'Cyber End and Twin take Proto and Zwei');
  ok(L.canFusion(duel({ ex0: ['Cyber Ogre 2', 'Cyber Saurus'], board: [{ hand: ['Cyber Ogre', 'Cyber Ogre', 'Blast Juggler', 'Two-Headed King Rex'] }, {}] }), 0, {}), 'Ogre 2 and Saurus recipes read');
});
T('Cyber Eltanin banishes LIGHT Machines and clears the field', () => {
  const g = duel({ board: [{ hand: ['Cyber Eltanin'], m: ['Cyber Dragon'], gy: ['Cyber Dragon', 'Proto-Cyber Dragon'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'banish all LIGHT'); passTo(g);
  const e = on(g, 0, 'Cyber Eltanin'); ok(e && E.atk(g, e) === 1500 && E.def(g, e) === 1500 && inZ(g, 1, 'gy', FILL), `Eltanin ${e && E.atk(g, e)}, Warwolf sent`);
});
T('D.D. Scout Plane and D.D. Survivor come back in the End Phase', () => {
  const g = duel({ board: [{ hand: ['D.D. Scout Plane'], m: ['D.D. Survivor'], turn: 2 }, {}] });
  L.move(g, card(g, 0, 'hand', 'D.D. Scout Plane'), 'ban', { reason: 'effect' }); L.move(g, on(g, 0, 'D.D. Survivor'), 'ban', { reason: 'effect' });
  endTurn(g);
  ok(on(g, 0, 'D.D. Scout Plane') && on(g, 0, 'D.D. Survivor'), 'both Special Summoned');
});
T('Cyber Shadow Gardna becomes a monster, copies the attacker, Sets itself', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Neo-Spacian Aqua Dolphin'], turn: 2 }, { st: ['Cyber Shadow Gardna'] }] });
  choose(g, 'ns:'); for (let i = 0; i < 3 && g.prompt.p === 0 && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); choose(g, 'Cyber Shadow Gardna', 1); passTo(g);
  const s = on(g, 1, 'Cyber Shadow Gardna'); ok(s && s.pos === 'def', 'Gardna is a Defense Position monster');
  choose(g, 'bp'); passTo(g); choose(g, 'atk:' + on(g, 0, 'Neo-Spacian Aqua Dolphin').u + ':' + s.u);
  ok(E.atk(g, s) === 600 && E.def(g, s) === 800, `Gardna copied 600/800 (${E.atk(g, s)}/${E.def(g, s)})`);
  passTo(g); passTo(g); passTo(g); choose(g, 'endbp'); passTo(g);
  endTurn(g);
  ok(inZ(g, 1, 'st', 'Cyber Shadow Gardna') && card(g, 1, 'st', 'Cyber Shadow Gardna').pos === 'set', 'Set again in the End Phase');
});
T('Cyber Archfiend draws an extra card with an empty hand, then dies with cards in hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Archfiend'], turn: 2 }, {}] });
  ok(g.p[0].hand.length === 2, `drew 2 (hand ${g.p[0].hand.length})`);
  endTurn(g); ok(inZ(g, 0, 'gy', 'Cyber Archfiend'), 'destroyed in the End Phase');
});
T('D.D. Guide goes to the opponent and banishes from its controller\'s GY', () => {
  const g = duel({ board: [{ hand: ['D.D. Guide'], turn: 2 }, { gy: [FILL] }] });
  choose(g, 'ns:'); passTo(g);
  ok(on(g, 1, 'D.D. Guide'), 'B controls D.D. Guide');
  choose(g, 'end'); passTo(g); for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); passTo(g);
  ok(inZ(g, 1, 'ban', FILL), 'card banished from B\'s GY');
});
T('Curse of Fiend from a Set card in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Curse of Fiend'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  say(g, true); passTo(g);
  ok(on(g, 0, FILL).pos === 'def' && on(g, 1, FILL).pos === 'atk' && inZ(g, 0, 'gy', 'Curse of Fiend'), 'positions swapped');
});
T('Crimson Sentry returns a battle-destroyed monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Petit Moth', 'Crimson Sentry'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'bp'); passTo(g); choose(g, 'atk:' + on(g, 0, 'Petit Moth').u); passTo(g); passTo(g); passTo(g);
  choose(g, 'endbp'); passTo(g);
  choose(g, 'Tribute: return'); passTo(g);
  ok(E.name(g.p[0].deck[0]) === 'Petit Moth', 'Petit Moth at the bottom of the Deck');
});
T('Cyber Laser Dragon destroys a monster with higher DEF', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Laser Dragon'], turn: 2 }, { m: [{ n: 'Cyber Barrier Dragon', pos: 'def' }, 'Petit Moth'] }] });
  choose(g, 'Destroy a monster with ATK'); ok(!hasOpt(g, 'Petit Moth'), 'Petit Moth not a target'); choose(g, 'Cyber Barrier'); passTo(g);
  ok(inZ(g, 1, 'gy', 'Cyber Barrier Dragon'), 'Cyber Barrier destroyed');
});
T('Cyber Phoenix draws when destroyed by battle face-up', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Cyber Phoenix'] }] });
  const h = g.p[1].hand.length; choose(g, 'bp'); passTo(g); choose(g, 'Attack Cyber Phoenix'); passTo(g); passTo(g); say(g, true); passTo(g); say(g, true); passTo(g);
  ok(g.p[1].hand.length === h + 1, 'drew 1');
});
T('Curse of Anubis: Effect Monsters to Defense with 0 DEF', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Phoenix', 'Petit Moth'], turn: 2 }, { st: ['Curse of Anubis'] }] });
  choose(g, 'bp'); choose(g, 'Curse of Anubis', 1); passTo(g);
  const c = on(g, 0, 'Cyber Phoenix'); ok(c.pos === 'def' && E.def(g, c) === 0 && on(g, 0, 'Petit Moth').pos === 'atk', 'Phoenix 0 DEF in Defense, Petit Moth untouched');
});
T('D.D. Borderline: no Battle Phase without Spells in the GY', () => {
  const g = duel({ board: [{ hand: ['D.D. Borderline'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'D.D. Borderline'); passTo(g);
  ok(!hasOpt(g, 'bp') || !L.forbid(g, { type: 'x' }) && L.forbid(g, { type: 'attack', c: on(g, 0, FILL) }), 'no Battle Phase or attack');
});
T('Cyber Dinosaur answers a Special Summon from the hand', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { hand: ['Cyber Dinosaur'], m: [FILL] }] });
  choose(g, 'only they control'); passTo(g); say(g, true); passTo(g);
  ok(on(g, 1, 'Cyber Dinosaur'), 'Cyber Dinosaur summoned');
});
T('Cyber Tutu, Cyber Shark, Cyber Summon Blaster, Cyber-Stein', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Tutu'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'bp'); passTo(g); ok(hasOpt(g, 'Attack directly'), 'Tutu attacks directly');
  const g2 = duel({ board: [{ hand: ['Cyber Shark'], m: ['Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  ok(hasOpt(g2, 'Normal Summon'), 'Cyber Shark without Tributes');
  const g3 = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: [{ n: 'Cyber Summon Blaster', pos: 'up' }] }] });
  choose(g3, 'only they control'); passTo(g3); ok(g3.p[0].lp === 7700, `Blaster 300 damage (A ${g3.p[0].lp})`);
  const g4 = duel({ ex0: ['Cyber End Dragon'], board: [{ hand: [], m: ['Cyber-Stein'], turn: 2 }, {}] });
  choose(g4, 'Pay 5000'); passTo(g4); ok(on(g4, 0, 'Cyber End Dragon') && g4.p[0].lp === 3000, 'Cyber End summoned for 5000');
});
T('D.D. Designator misses and banishes from your own hand', () => {
  const g = duel({ board: [{ hand: ['D.D. Designator', 'Petit Moth'], turn: 2 }, { hand: ['Petit Moth'] }] });
  act(g, 0, 'D.D. Designator'); choose(g, FILL); passTo(g);
  ok(g.p[0].ban.length === 1, 'one of A\'s cards banished');
});
T('D.D. Warrior and D.D. Assailant banish both', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['D.D. Warrior'] }] });
  choose(g, 'bp'); passTo(g); choose(g, 'Attack D.D. Warrior'); passTo(g); passTo(g); passTo(g);
  ok(inZ(g, 0, 'ban', FILL) && inZ(g, 1, 'ban', 'D.D. Warrior'), 'D.D. Warrior banished both');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['D.D. Assailant'] }] });
  choose(g2, 'bp'); passTo(g2); choose(g2, 'Attack D.D. Assailant'); passTo(g2); passTo(g2); passTo(g2);
  ok(inZ(g2, 0, 'ban', FILL) && inZ(g2, 1, 'ban', 'D.D. Assailant'), 'D.D. Assailant banished both');
});
T('Cyber Raider destroys an Equip, Cyber Ouroboros draws when banished', () => {
  const g = duel({ board: [{ hand: ['Cyber Raider'], turn: 2 }, { m: ['Petit Moth'], hand: ['Cocoon of Evolution'] }] });
  const moth = on(g, 1, 'Petit Moth'), coc = card(g, 1, 'hand', 'Cocoon of Evolution'); L.move(g, coc, 'st', { ctrl: 1, pos: 'up', reason: 'equip' }); coc.equipTo = moth.u; coc.flags.cocoon = true;
  choose(g, 'ns:'); passTo(g); if (g.prompt.type === 'choose') choose(g, 'Destroy'); passTo(g);
  ok(inZ(g, 1, 'gy', 'Cocoon of Evolution'), 'Equip destroyed');
  const g2 = duel({ board: [{ hand: [FILL], m: ['Cyber Ouroboros'], turn: 2 }, { m: ['D.D. Warrior'] }] });
  choose(g2, 'bp'); passTo(g2); choose(g2, 'Attack D.D. Warrior'); passTo(g2); passTo(g2); passTo(g2);
  const n = g2.p[0].hand.length; say(g2, true); for (let i = 0; i < 3 && g2.prompt.type === 'pick'; i++) E.act(g2, [g2.prompt.opts[0].key]); passTo(g2);
  ok(inZ(g2, 0, 'ban', 'Cyber Ouroboros') && g2.p[0].hand.length === n && g2.p[0].gy.length === 1, 'sent 1 card and drew 1');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-04 checks passed.');
process.exit(fails ? 1 : 0);
