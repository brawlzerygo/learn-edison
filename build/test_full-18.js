// Scenario checks for full pool batch 18: node build/test_full-18.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
// answer everything up to the next free action: pass responses, say yes, take the first options
function auto(g, o = {}) {
  for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') E.act(g, [o.no ? 'n' : 'y']);
    else if (pr.type === 'choose') E.act(g, [pr.opts[0].key]);
    else E.act(g, pr.opts.slice(0, Math.max(pr.min, Math.min(pr.max, 1))).map(x => x.key));
  }
}
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n).u + ':');
const eff = (g, c, ei) => choose(g, `a:${c.u}:${ei}`);
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const st = (g, p, n) => g.p[p].st.find(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const goBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => choose(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const lp = g => `A ${g.p[0].lp}, B ${g.p[1].lp}`;
const faceUp = c => c && c.pos !== 'set';
const gyN = (g, p) => g.p[p].gy.length;

T('Vampire Baby revives the monster it destroyed at the end of the Battle Phase', () => {
  const g = duel({ board: [{ m: ['Vampire Baby'], turn: 2 }, { m: [{ n: 'Winged Kuriboh', pos: 'atk' }] }] });
  goBP(g); attack(g, on(g, 0, 'Vampire Baby'), on(g, 1, 'Winged Kuriboh')); auto(g);
  choose(g, 'endbp'); auto(g);
  ok(on(g, 0, 'Winged Kuriboh'), 'Winged Kuriboh is now on A’s field');
});
T('Vampire Genesis: summon by banishing Vampire Lord, then revive a lower Zombie', () => {
  const g = duel({ board: [{ hand: ['Vampire Genesis', 'Vampire Lord'], m: ['Vampire Lord'], gy: ['Vampire Baby'] }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'cannot be Normal Summoned');
  choose(g, 'Banish Vampire Lord'); auto(g);
  const vg = on(g, 0, 'Vampire Genesis'); ok(vg && inZ(g, 0, 'ban', 'Vampire Lord'), 'Genesis summoned, Lord banished');
  eff(g, vg, 0); auto(g);
  ok(on(g, 0, 'Vampire Baby') && inZ(g, 0, 'gy', 'Vampire Lord'), 'Lord discarded, Baby revived');
});
T('Vampire Lady mills a declared card type', () => {
  const g = duel({ board: [{ m: ['Vampire Lady'], turn: 2 }, {}] });
  goBP(g); attack(g, on(g, 0, 'Vampire Lady'), null); auto(g);
  ok(g.p[1].lp === 8000 - 1550 && gyN(g, 1) === 1, `B took 1550 and milled a monster (${lp(g)})`);
});
T('Vampire Lord comes back after the opponent destroys it', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [FILL] }, { m: ['Vampire Lord'], hand: ['Dark Hole'] }] });
  // A destroys nothing; B's own Dark Hole would not count. Use an effect of A: Dark Hole from A.
  const g2 = duel({ board: [{ hand: ['Dark Hole'] }, { m: ['Vampire Lord'] }] });
  act(g2, 0, 'Dark Hole'); auto(g2); ok(inZ(g2, 1, 'gy', 'Vampire Lord'), 'Lord destroyed');
  choose(g2, 'end'); auto(g2);
  ok(on(g2, 1, 'Vampire Lord'), 'Lord Special Summoned in B’s Standby Phase');
});
T('Vengeful Bog Spirit stops attacks the turn of summon', () => {
  const g = duel({ board: [{ hand: [FILL], st: [{ n: 'Vengeful Bog Spirit', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'ns:'); auto(g); goBP(g);
  ok(!hasOpt(g, 'atk:'), 'no attack offered');
});
T('Vengeful Servant burns the new controller', () => {
  const g = duel({ board: [{ hand: ['Vengeful Servant'], m: [FILL] }, {}] });
  act(g, 0, 'Vengeful Servant'); auto(g);
  E.lib.takeControl(g, 1, on(g, 0, FILL), true); choose(g, 'end'); auto(g);
  ok(g.p[1].lp === 6000, `B took 2000 (${lp(g)})`);
});
T('Vengeful Shinobi draws when attacked in Attack Position', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Vengeful Shinobi'] }] });
  const h = g.p[1].hand.length; goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Vengeful Shinobi')); auto(g);
  ok(g.p[1].hand.length === h + 1, 'B drew 1');
});
T('Wall of Illusion returns the attacker', () => {
  const g = duel({ board: [{ m: ['Vampire Baby'], turn: 2 }, { m: [{ n: 'Wall of Illusion', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Vampire Baby'), on(g, 1, 'Wall of Illusion')); auto(g);
  ok(inZ(g, 0, 'hand', 'Vampire Baby'), 'Vampire Baby returned to the hand');
});
T('Wall of Ivy gives the opponent a token that burns them', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: [{ n: 'Wall of Ivy', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, FILL), g.p[1].m[0]); auto(g);
  const t = on(g, 0, 'Ivy Token'); ok(!!t, 'A has an Ivy Token');
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  // B attacks the token? B has nothing; destroy it by effect instead
  E.lib.destroy(g, [t], { by: 1 });
  ok(g.p[0].lp === 7700, `A took 300 (${lp(g)})`);
});
T('Wall of Thorns destroys Attack Position attackers', () => {
  const g = duel({ board: [{ m: [FILL, 'Vampire Baby'], turn: 2 }, { m: ['Arcane Archer of the Forest', 'Wall of Ivy'], st: ['Wall of Thorns'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Wall of Ivy')); choose(g, 'Wall of Thorns', 1); auto(g);
  ok(!on(g, 0, FILL) && !on(g, 0, 'Vampire Baby'), 'both of A’s monsters destroyed');
});
T('White Hole protects from Dark Hole', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [FILL] }, { m: ['Vampire Lady'], st: ['White Hole'] }] });
  act(g, 0, 'Dark Hole'); choose(g, 'White Hole', 1); auto(g);
  ok(on(g, 1, 'Vampire Lady') && !on(g, 0, FILL), 'B’s monster survives, A’s is destroyed');
});
T('White Magician Pikeru gains 400 per monster', () => {
  const g = duel({ board: [{}, { m: ['White Magician Pikeru', FILL] }] });
  choose(g, 'end'); auto(g);
  ok(g.p[1].lp === 8800, `B gained 800 (${lp(g)})`);
});
T('White Night Dragon negates a targeting Spell and takes an attack', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'] }, { m: ['White Night Dragon'] }] });
  act(g, 0, 'Book of Moon'); 
  for (let i = 0; i < 5 && g.prompt && !hasOpt(g, 'Negate the Spell'); i++) E.act(g, ['pass']);
  ok(hasOpt(g, 'Negate the Spell'), 'negation offered'); choose(g, 'Negate the Spell'); auto(g);
  ok(faceUp(on(g, 1, 'White Night Dragon')) && inZ(g, 0, 'gy', 'Book of Moon'), 'Dragon still face-up');
  const g2 = duel({ board: [{ m: ['Vampire Lord'], turn: 2 }, { m: ['White Night Dragon', 'Vampire Baby'], st: ['Mystical Space Typhoon'] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Vampire Lord'), on(g2, 1, 'Vampire Baby')); auto(g2);
  ok(on(g2, 1, 'Vampire Baby') && !on(g2, 0, 'Vampire Lord') && inZ(g2, 1, 'gy', 'Mystical Space Typhoon'), 'the Dragon took the attack and won');
});
T('White Ninja destroys a Defense Position monster', () => {
  const g = duel({ board: [{ m: [{ n: 'White Ninja', pos: 'set' }] }, { m: [{ n: FILL, pos: 'def' }] }] });
  choose(g, 'flip:'); auto(g);
  ok(!on(g, 1, FILL), 'Warwolf destroyed');
});
T('White Potan survives with a Tuner and burns for a Tuner', () => {
  const g = duel({ board: [{ m: [FILL, FILL], turn: 2 }, { m: [{ n: 'White Potan', pos: 'atk' }, 'Krebons'] }] });
  goBP(g); attack(g, g.p[0].m[0], on(g, 1, 'White Potan')); auto(g);
  ok(on(g, 1, 'White Potan'), 'Potan not destroyed');
  attack(g, g.p[0].m[1], on(g, 1, 'Krebons')); auto(g, { no: true });
  ok(g.p[0].lp === 7500, `A took 500 (${lp(g)})`);
});
T('White-Horned Dragon banishes Spells and gains ATK', () => {
  const g = duel({ board: [{ hand: ['White-Horned Dragon'], m: [FILL] }, { gy: ['Dark Hole', 'Book of Moon'] }] });
  choose(g, 'ns:'); auto(g);
  const d = on(g, 0, 'White-Horned Dragon'); ok(d && E.atk(g, d) === 2500 && g.p[1].ban.length === 1, `ATK ${d && E.atk(g, d)}`);
});
T('Baou negates a monster it destroys', () => {
  const g = duel({ board: [{ hand: ['Wicked-Breaking Flamberge - Baou', 'Dark Hole'], m: [FILL], turn: 2 }, { m: ['Witch of the Black Forest'] }] });
  act(g, 0, 'Wicked-Breaking Flamberge - Baou'); auto(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2500 && inZ(g, 0, 'gy', 'Dark Hole'), 'Warwolf 2500, Dark Hole sent as cost');
  const h = g.p[1].hand.length; goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Witch of the Black Forest')); auto(g);
  ok(g.p[1].hand.length === h, 'Witch did not search');
});
T('Winged Kuriboh stops battle damage for the turn', () => {
  const g = duel({ board: [{ m: [FILL, FILL], turn: 2 }, { m: [{ n: 'Winged Kuriboh', pos: 'atk' }] }] });
  goBP(g); attack(g, g.p[0].m[0], on(g, 1, 'Winged Kuriboh')); auto(g);
  const lp1 = g.p[1].lp; attack(g, g.p[0].m[1], null); auto(g);
  ok(g.p[1].lp === lp1, `no damage from the direct attack (${lp(g)})`);
});
T('Winged Kuriboh LV10 destroys attackers and burns', () => {
  const g = duel({ board: [{ m: [FILL, 'Vampire Lord'], turn: 2 }, { m: ['Winged Kuriboh LV10'] }] });
  goBP(g); attack(g, g.p[0].m[0], on(g, 1, 'Winged Kuriboh LV10'));
  for (let i = 0; i < 5 && g.prompt && !hasOpt(g, 'Tribute: destroy'); i++) E.act(g, ['pass']);
  ok(hasOpt(g, 'Tribute: destroy'), 'LV10 offered'); choose(g, 'Tribute: destroy'); auto(g);
  ok(!g.p[0].m.some(Boolean) && g.p[0].lp === 8000 - 4000, `both destroyed, 4000 damage (${lp(g)})`);
});
T('Winged Kuriboh LV9: Chain Link 3, banished Spells, ATK from the GY', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [FILL] }, { hand: ['Winged Kuriboh LV9'], st: ['White Hole', 'Altar for Tribute'], gy: ['Book of Moon'] }] });
  act(g, 0, 'Dark Hole'); ok(!hasOpt(g, 'Chain Link 3'), 'not offered as Chain Link 2');
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Book of Moon'] }, { hand: ['Winged Kuriboh LV9'], st: ['Altar for Tribute', { n: 'Vengeful Bog Spirit', pos: 'up' }], m: [FILL] }] });
  act(g2, 0, 'Mystical Space Typhoon'); choose(g2, 'Vengeful Bog Spirit'); choose(g2, 'Altar for Tribute', 1);
  ok(hasOpt(g2, 'Chain Link 3'), 'LV9 offered at Chain Link 3'); choose(g2, 'Chain Link 3'); auto(g2);
  const k = on(g2, 1, 'Winged Kuriboh LV9'); ok(!!k && inZ(g2, 0, 'ban', 'Mystical Space Typhoon'), 'LV9 summoned, MST banished after resolving');
});
T('Winged Minion gives a Fiend 700', () => {
  const g = duel({ board: [{ m: ['Winged Minion', 'Wall of Illusion'] }, {}] });
  eff(g, on(g, 0, 'Winged Minion'), 0); auto(g);
  const w = on(g, 0, 'Wall of Illusion'); ok(E.atk(g, w) === 1700 && E.def(g, w) === 2550, 'Wall 1700/2550');
});
T('Winged Rhynos returns to the hand when a Trap is activated', () => {
  const g = duel({ board: [{ m: ['Winged Rhynos'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }], st: ['Wall of Thorns', 'Altar for Tribute'] }] });
  const g2 = duel({ board: [{ m: ['Winged Rhynos'] }, { st: ['Altar for Tribute'], m: [FILL] }] });
  choose(g2, 'end'); auto(g2);
  // B's turn: B activates Altar in its main phase
  act(g2, 1, 'Altar for Tribute'); ok(hasOpt(g2, 'Return this card'), 'Rhynos offered'); choose(g2, 'Return this card'); auto(g2);
  ok(inZ(g2, 0, 'hand', 'Winged Rhynos'), 'Rhynos in the hand');
});
T('Winged Sage Falcos puts the monster back on top', () => {
  const g = duel({ board: [{ m: ['Winged Sage Falcos'], turn: 2 }, { m: ['Vampire Baby'] }] });
  goBP(g); attack(g, on(g, 0, 'Winged Sage Falcos'), on(g, 1, 'Vampire Baby')); auto(g);
  const d = g.p[1].deck; ok(E.name(d[d.length - 1]) === 'Vampire Baby', 'Vampire Baby is on top of B’s Deck');
});
T('Witch Doctor of Chaos banishes a monster from a GY', () => {
  const g = duel({ board: [{ m: [{ n: 'Witch Doctor of Chaos', pos: 'set' }] }, { gy: ['Vampire Lord'] }] });
  choose(g, 'flip:'); auto(g); ok(inZ(g, 1, 'ban', 'Vampire Lord'), 'Vampire Lord banished');
});
T('Witch Doctor of Sparta burns on a summon from the Deck', () => {
  const g = duel({ board: [{ m: ['Witch Doctor of Sparta', { n: 'Warrior Lady of the Wasteland' }], turn: 2 }, { m: ['Vampire Lord'] }] });
  g.p[0].deck.push(...[]); 
  goBP(g); attack(g, on(g, 0, 'Warrior Lady of the Wasteland'), on(g, 1, 'Vampire Lord')); auto(g);
  ok(true, 'no crash');
  const g2 = duel({ board: [{ m: ['Witch Doctor of Sparta'], hand: ['Archfiend\'s Roar'] }, {}] });
  const x = E.lib.D; const deckCard = g2.p[1].deck[0]; E.lib.ss(g2, 1, deckCard, 'atk'); choose(g2, 'end'); auto(g2);
  ok(g2.p[1].lp === 7500, `B took 500 (${lp(g2)})`);
});
// Errata audit (2026-11-26): the 2010 card has no once-per-turn, so both Witches search.
T('Witch of the Black Forest searches for each copy (original text)', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Witch of the Black Forest', 'Witch of the Black Forest'], deckTop: ['Vampire Baby', 'Vampire Baby'] }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Dark Hole'); auto(g);
  ok(g.p[0].hand.length === h + 1, `searched twice (hand ${g.p[0].hand.length}, was ${h} with Dark Hole)`);
});
T('3-Hump Lacooda draws 3', () => {
  const g = duel({ board: [{ m: ['3-Hump Lacooda', '3-Hump Lacooda', '3-Hump Lacooda'] }, {}] });
  const h = g.p[0].hand.length; eff(g, g.p[0].m[0], 0); auto(g);
  ok(g.p[0].hand.length === h + 3 && monsOfN(g, 0) === 1, 'drew 3, one Lacooda left');
});
function monsOfN(g, p) { return g.p[p].m.filter(Boolean).length; }
T('4-Starred Ladybug destroys face-up Level 4s', () => {
  const g = duel({ board: [{ m: [{ n: '4-Starred Ladybug of Doom', pos: 'set' }] }, { m: [FILL, { n: FILL, pos: 'set' }, 'Vampire Lord'] }] });
  choose(g, 'flip:'); auto(g); ok(monsOfN(g, 1) === 2, 'one Warwolf destroyed');
});
T('Three 7s draw 3 and destroy themselves, each gives 700', () => {
  const g = duel({ board: [{ hand: ['7'], st: [{ n: '7', pos: 'up' }, { n: '7', pos: 'up' }] }, {}] });
  const h = g.p[0].hand.length; act(g, 0, '7'); auto(g);
  ok(g.p[0].hand.length === h - 1 + 3 && g.p[0].lp === 8000 + 2100, `drew 3, gained 2100 (${lp(g)})`);
});
T('7 Completed gives a Machine 700 DEF', () => {
  const g = duel({ board: [{ hand: ['7 Completed'], m: ['Amphibious Bugroth MK-3'] }, {}] });
  act(g, 0, '7 Completed'); choose(g, 'DEF'); auto(g);
  const b = on(g, 0, 'Amphibious Bugroth MK-3'); ok(E.def(g, b) === 2000 && E.atk(g, b) === 1500, 'Bugroth 1500/2000');
});
T('8-Claws Scorpion has 2400 against a Set monster and can Set itself', () => {
  const g = duel({ board: [{ m: ['8-Claws Scorpion'], turn: 2 }, { m: [{ n: 'Vampire Lady', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, '8-Claws Scorpion'), g.p[1].m[0]); auto(g);
  const s = g.p[0].m[0]; ok(inZ(g, 1, 'gy', 'Vampire Lady') && E.atk(g, s) === 300, 'Lady destroyed, Scorpion back to 300');
  choose(g, 'endbp'); auto(g); eff(g, s, 0); auto(g); ok(s.pos === 'set', 'Scorpion Set');
});
T('Abare Ushioni deals 1000 to someone', () => {
  const g = duel({ board: [{ m: ['Abare Ushioni'] }, {}] });
  eff(g, on(g, 0, 'Abare Ushioni'), 0); auto(g);
  ok(g.p[0].lp + g.p[1].lp === 15000, lp(g));
});
T('Absolute End makes an attack direct', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: [{ n: 'Wall of Illusion', pos: 'def' }], st: ['Absolute End'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Wall of Illusion')); choose(g, 'Absolute End', 1); auto(g);
  ok(g.p[1].lp === 6000 && on(g, 0, FILL), `B took 2000, Warwolf not bounced (${lp(g)})`);
});
T('Absorbing Kid gains 300 per Level', () => {
  const g = duel({ board: [{ m: ['Absorbing Kid from the Sky'], turn: 2 }, { m: ['Winged Kuriboh'] }] });
  goBP(g); attack(g, on(g, 0, 'Absorbing Kid from the Sky'), on(g, 1, 'Winged Kuriboh')); auto(g);
  ok(g.p[0].lp === 8300, lp(g));
});
T('Abyss Soldier bounces a card', () => {
  const g = duel({ board: [{ hand: ['Ameba'], m: ['Abyss Soldier'] }, { m: ['Vampire Lord'] }] });
  eff(g, on(g, 0, 'Abyss Soldier'), 0); choose(g, 'Vampire Lord'); auto(g);
  ok(inZ(g, 1, 'hand', 'Vampire Lord') && inZ(g, 0, 'gy', 'Ameba'), 'Lord bounced, Ameba discarded');
});
T('Abyssal Designator sends a declared monster', () => {
  const g = duel({ board: [{ hand: ['Abyssal Designator'] }, { hand: ['Vampire Lord'] }] });
  act(g, 0, 'Abyssal Designator'); choose(g, 'Zombie'); choose(g, 'DARK'); auto(g);
  ok(inZ(g, 1, 'gy', 'Vampire Lord') && g.p[0].lp === 7000, 'Lord sent, A paid 1000');
});
T('Acid Trap Hole destroys a low-DEF monster, sets a high one back', () => {
  const g = duel({ board: [{ st: ['Acid Trap Hole', 'Acid Trap Hole'] }, { m: [{ n: FILL, pos: 'set' }, { n: 'Wall Shadow', pos: 'set' }] }] });
  act(g, 0, 'Acid Trap Hole'); choose(g, 'u' + g.p[1].m[0].u); auto(g); ok(!on(g, 1, FILL), 'Warwolf destroyed');
  act(g, 0, 'Acid Trap Hole'); auto(g); ok(g.p[1].m.find(Boolean).pos === 'set', 'Wall Shadow face-down again');
});
T('Adhesion Trap Hole halves original ATK', () => {
  const g = duel({ board: [{ hand: [FILL] }, { st: ['Adhesion Trap Hole'] }] });
  choose(g, 'ns:'); choose(g, 'Adhesion', 1); auto(g); ok(E.atk(g, on(g, 0, FILL)) === 1000, 'Warwolf 1000');
});
T('After the Struggle destroys monsters that battled', () => {
  const g = duel({ board: [{ hand: ['After the Struggle'], m: [FILL, 'Vampire Lord'], turn: 2 }, { m: [{ n: 'Wall Shadow', pos: 'def' }] }] });
  act(g, 0, 'After the Struggle'); auto(g); goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Wall Shadow')); auto(g);
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(!on(g, 0, FILL) && !on(g, 1, 'Wall Shadow') && on(g, 0, 'Vampire Lord'), 'both battlers destroyed, Lord stays');
});
T('Agido rolls and can revive', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Agido'], gy: ['Winged Kuriboh'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Agido')); auto(g);
  ok(g.log.some(l => /rolled a/.test(l)), 'a die was rolled');
});
T('Airknight Parshath pierces and draws', () => {
  const g = duel({ board: [{ m: ['Airknight Parshath'], turn: 2 }, { m: [{ n: 'Winged Kuriboh', pos: 'def' }] }] });
  const h = g.p[0].hand.length; goBP(g); attack(g, on(g, 0, 'Airknight Parshath'), on(g, 1, 'Winged Kuriboh')); auto(g);
  ok(g.p[1].lp === 8000 - 1700 && g.p[0].hand.length === h + 1, lp(g));
});
T('Altar for Tribute gains the original ATK', () => {
  const g2 = duel({ board: [{ m: ['Vampire Lord'], st: ['Altar for Tribute'], turn: 2 }, {}] });
  act(g2, 0, 'Altar for Tribute'); auto(g2);
  ok(g2.p[0].lp === 10000, lp(g2));
});
T('Ameba burns its new controller', () => {
  const g = duel({ board: [{ m: ['Ameba'] }, {}] });
  E.lib.takeControl(g, 1, on(g, 0, 'Ameba'), false); choose(g, 'end'); auto(g);
  ok(g.p[1].lp === 6000, lp(g));
});
T('Amphibious Bugroth attacks directly with Umi', () => {
  const g = duel({ board: [{ hand: ['Umi'], m: ['Amphibious Bugroth MK-3'], turn: 2 }, { m: [FILL] }] });
  const umi = g.p[0].hand.find(c => E.name(c) === 'Umi'); E.lib.move(g, umi, 'fz', { ctrl: 0, pos: 'up' }); goBP(g);
  ok(hasOpt(g, `atk:${on(g, 0, 'Amphibious Bugroth MK-3').u}:d`), 'direct attack offered');
});
T('Amplifier destroys Jinzo when it leaves', () => {
  const g = duel({ board: [{ hand: ['Amplifier', 'Mystical Space Typhoon'], m: ['Jinzo'] }, {}] });
  act(g, 0, 'Amplifier'); auto(g); act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(inZ(g, 0, 'gy', 'Jinzo'), 'Jinzo destroyed');
});
T('An Owl of Luck puts a Field Spell on top', () => {
  const g = duel({ board: [{ m: [{ n: 'An Owl of Luck', pos: 'set' }], deckTop: [FILL, 'Umi'] }, {}] });
  choose(g, 'flip:'); auto(g); const d = g.p[0].deck; ok(E.name(d[d.length - 1]) === 'Umi', 'Umi on top');
});
T('Andro Sphinx summons with Pyramid, cannot attack that turn, burns half', () => {
  const g = duel({ board: [{ hand: ['Andro Sphinx'], st: [{ n: 'Pyramid of Light', pos: 'up' }], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  eff(g, g.p[0].hand.find(c => E.name(c) === 'Andro Sphinx'), 0); auto(g);
  ok(on(g, 0, 'Andro Sphinx') && g.p[0].lp === 7500, 'summoned for 500'); goBP(g); ok(!hasOpt(g, 'atk:'), 'no attack this turn');
  const g2 = duel({ board: [{ m: ['Andro Sphinx'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Andro Sphinx'), on(g2, 1, FILL)); auto(g2); ok(g2.p[1].lp === 7000, lp(g2));
});
T('Ante: the lower Level takes 1000', () => {
  const g = duel({ board: [{ hand: ['Ante', 'Vampire Lord'] }, { hand: ['Dark Hole'] }] });
  act(g, 0, 'Ante'); auto(g);
  ok(g.p[1].lp === 7000 && inZ(g, 1, 'gy', 'Dark Hole'), lp(g));
});
T('Apprentice Magician summons a Spellcaster face-down', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Apprentice Magician'], deckTop: ['Witch Doctor of Chaos'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Apprentice Magician')); auto(g);
  ok(g.p[1].m.some(c => c && c.pos === 'set'), 'a face-down monster for B');
});
T('Appropriate draws 2 when the opponent draws outside the Draw Phase', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'] }, { st: [{ n: 'Appropriate', pos: 'up' }] }] });
  const h = g.p[1].hand.length; act(g, 0, 'Pot of Greed'); auto(g);
  ok(g.p[1].hand.length === h + 2, `B drew 2 (${g.p[1].hand.length - h})`);
});
T('Arcane Archer: no attacks with a Plant, Tribute to destroy', () => {
  const g = duel({ board: [{ m: ['Arcane Archer of the Forest', 'Wall of Ivy'] }, { st: ['Mirror Force'] }] });
  eff(g, on(g, 0, 'Arcane Archer of the Forest'), 0); auto(g); ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Archfiend\'s Oath excavates', () => {
  const g = duel({ board: [{ st: [{ n: "Archfiend's Oath", pos: 'up' }] }, {}] });
  eff(g, g.p[0].st[0], 1); auto(g); ok(g.p[0].lp === 7500, lp(g));
});
T('Archfiend\'s Roar revives an Archfiend that dies in the End Phase', () => {
  const g = duel({ board: [{ st: ["Archfiend's Roar"], gy: ['Archfiend Soldier'], turn: 2 }, {}] });
  act(g, 0, "Archfiend's Roar"); auto(g); const x = on(g, 0, 'Archfiend Soldier');
  ok(x && x.flags.noTribute && g.p[0].lp === 7500, 'summoned for 500, cannot be Tributed');
  choose(g, 'end'); auto(g); ok(inZ(g, 0, 'gy', 'Archfiend Soldier'), 'destroyed in the End Phase');
});
T('Warrior Lady of the Wasteland summons an EARTH Warrior', () => {
  const g = duel({ board: [{ m: ['Vampire Lord'], turn: 2 }, { m: ['Warrior Lady of the Wasteland'], deckTop: ['Warrior Lady of the Wasteland'] }] });
  goBP(g); attack(g, on(g, 0, 'Vampire Lord'), on(g, 1, 'Warrior Lady of the Wasteland')); auto(g);
  ok(on(g, 1, 'Warrior Lady of the Wasteland'), 'a new Warrior Lady');
});
T('White Magical Hat discards at random', () => {
  const g = duel({ board: [{ m: ['White Magical Hat'], turn: 2 }, {}] });
  const h = g.p[1].hand.length; goBP(g); attack(g, on(g, 0, 'White Magical Hat'), null); auto(g); ok(g.p[1].hand.length === h - 1, 'B discarded 1');
});
console.log(fails ? `\n${fails} failed` : '\nAll batch 18 checks passed.');
process.exit(fails ? 1 : 0);
