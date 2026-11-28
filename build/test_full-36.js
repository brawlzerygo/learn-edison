// Scenario checks for full pool batch 36: node build/test_full-36.js
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
const pickAll = g => { const pr = g.prompt; E.act(g, pr.opts.slice(0, pr.max).map(o => o.key)); };
// pass every response window until `who` can use an option matching text
function waitFor(g, who, text) { for (let i = 0; i < 30 && g.prompt; i++) { if (g.prompt.p === who && hasOpt(g, text)) return; if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'yesno') E.act(g, ['y']); else break; } }
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
// answer every prompt up to the next free action: pass, yes, the first option(s)
function drive(g, upto = 60) {
  for (let i = 0; i < upto && g.prompt && g.prompt.type !== 'idle'; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') E.act(g, ['y']);
    else E.act(g, pr.opts.slice(0, Math.max(1, pr.min)).map(o => o.key));
  }
}
const cardIn = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, g.p[p].fz].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + cardIn(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const atkOf = (g, p, n) => E.atk(g, on(g, p, n));
const attack = (g, a, tn) => { choose(g, 'bp'); passAll(g); const u = on(g, 0, a).u; const t = tn ? on(g, 1, tn) : null; choose(g, `atk:${u}:${t ? t.u : 'd'}`); };
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

T('Broken Blocker summons 2 copies after a Defense monster is destroyed', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Shield Warrior', pos: 'def' }], st: ['Broken Blocker'], deckTop: ['Shield Warrior', 'Shield Warrior'] }] });
  attack(g, FILL, 'Shield Warrior'); for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick' && g.prompt.max === 2) pickAll(g); else drive(g, 1); }
  ok(g.p[1].m.filter(c => c && E.name(c) === 'Shield Warrior' && c.pos === 'def').length === 2, 'two Shield Warriors in Defense Position');
});
T('Cold Enchanter discards Broww: Ice Counter, and no draw (a cost discard: Dark World archive, 2026-11-27 audit)', () => {
  const g = duel({ board: [{ hand: ['Broww, Huntsman of Dark World'], m: ['Cold Enchanter'], turn: 2 }, { m: [FILL] }] });
  const before = g.p[0].hand.length;
  act(g, 0, 'Cold Enchanter'); choose(g, 'Broww'); drive(g);
  ok(atkOf(g, 0, 'Cold Enchanter') === 1900, 'Cold Enchanter has 1900 ATK with 1 Ice Counter');
  ok(g.p[0].hand.length === before - 1, 'Broww, discarded as a cost, draws nothing (hand ' + g.p[0].hand.length + ')');
});
T('Brron discards after battle damage', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: ['Brron, Mad King of Dark World'], turn: 2 }, {}] });
  attack(g, 'Brron, Mad King of Dark World'); drive(g);
  ok(g.p[1].lp === 6200 && g.p[0].gy.length === 1, 'B took 1800 and A discarded 1 card');
});
T('Burden of the Mighty and Comrade Swordsman', () => {
  const g = duel({ board: [{ hand: ['Burden of the Mighty'], m: ['Comrade Swordsman of Landstar', 'Elemental HERO Wildheart'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Burden of the Mighty'); drive(g);
  ok(atkOf(g, 1, FILL) === 1600, 'Warwolf loses 400');
  ok(atkOf(g, 0, 'Elemental HERO Wildheart') === 1900 && atkOf(g, 0, 'Comrade Swordsman of Landstar') === 900, 'Warriors gain 400');
});
T('By Order of the Emperor negates Armageddon Knight and that player draws', () => {
  const g = duel({ board: [{ hand: ['Armageddon Knight'], deckTop: [FILL, 'Sangan', 'Sangan'], turn: 2 }, { st: [{ n: 'By Order of the Emperor', pos: 'up' }] }] });
  choose(g, 'ns:'); waitFor(g, 1, 'By Order'); ok(hasOpt(g, 'By Order'), 'B can use By Order of the Emperor'); choose(g, 'By Order'); drive(g);
  ok(!g.p[0].gy.some(c => E.name(c) === 'Sangan') && inZ(g, 0, 'hand', 'Sangan'), 'nothing sent; A drew Sangan');
});
T('Cactus Bouncer stops Special Summons with another Plant', () => {
  const g = duel({ board: [{ hand: [], m: ['Cactus Bouncer', 'Mystic Tomato'], turn: 2 }, {}] });
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[1].deck[0], p: 1, how: 'special' }), 'Special Summon forbidden');
  const g2 = duel({ board: [{ hand: [], m: ['Cactus Bouncer'], gy: ['Cactus Bouncer'], turn: 2 }, {}] });
  ok(!E.lib.forbid(g2, { type: 'ss', c: g2.p[1].deck[0], p: 1, how: 'special' }) && E.lib.forbid(g2, { type: 'ss', c: g2.p[0].gy[0], p: 0, how: 'special' }), 'alone it only locks itself');
});
T('Cactus Fighter gives the opponent a Needle Token', () => {
  const g = duel({ board: [{ hand: [], m: ['Cactus Fighter'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }] }] });
  attack(g, 'Cactus Fighter', 'Sangan'); drive(g);
  ok(g.p[1].m.some(c => c && E.name(c) === 'Needle Token' && c.pos === 'def'), 'B has a Needle Token in Defense');
});
T('Calming Magic stops summons this turn', () => {
  const g = duel({ board: [{ hand: ['Calming Magic', 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Calming Magic'); drive(g);
  ok(!hasOpt(g, 'ns:') && !hasOpt(g, 'set:'), 'no Normal Summon or Set offered');
});
T('Cannon Soldier MK-2 and Brutal Potion', () => {
  const g = duel({ board: [{ hand: [], m: ['Cannon Soldier MK-2', 'Sangan', FILL], st: ['Brutal Potion'], turn: 2 }, {}] });
  act(g, 0, 'Brutal Potion'); choose(g, FILL); drive(g);
  ok(inZ(g, 0, 'st', 'Brutal Potion'), 'Brutal Potion stays as an Equip Card');
  act(g, 0, 'Cannon Soldier MK-2'); E.act(g, g.prompt.opts.filter(o => /Cannon|Sangan/.test(o.label)).map(o => o.key)); drive(g);
  ok(g.p[1].lp === 6500 && atkOf(g, 0, FILL) === 3000, `1500 damage and +1000 ATK (B ${g.p[1].lp})`);
});
T('Canyon doubles damage to the attacker of a Defense Rock', () => {
  const g = duel({ board: [{ hand: ['Canyon'], m: ['Cold Enchanter'], turn: 2 }, { m: [{ n: 'Giant Soldier of Stone', pos: 'def' }] }] });
  act(g, 0, 'Canyon'); drive(g); attack(g, 'Cold Enchanter', 'Giant Soldier of Stone'); drive(g);
  ok(g.p[0].lp === 7200, `A took 800 (${g.p[0].lp})`);
});
T('Carrierroid negates Mystical Space Typhoon', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], turn: 2 }, { hand: ['Sangan'], m: ['Carrierroid'], st: ['Mirror Force'] }] });
  act(g, 0, 'Mystical Space Typhoon');
  ok(hasOpt(g, 'Carrierroid'), 'Carrierroid offered'); choose(g, 'Carrierroid'); drive(g);
  ok(inZ(g, 1, 'st', 'Mirror Force') && inZ(g, 0, 'gy', 'Mystical Space Typhoon') && inZ(g, 1, 'gy', 'Sangan'), 'Mirror Force stays, Sangan discarded');
});
T('Catoblepas destroys a Special Summoned monster', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Sangan'], turn: 2 }, { m: ['Catoblepas and the Witch of Fate'], gy: ['Fortune Lady Dark'] }] });
  act(g, 0, 'Monster Reborn'); drive(g);
  ok(inZ(g, 0, 'gy', 'Sangan') && inZ(g, 1, 'ban', 'Fortune Lady Dark'), 'Sangan destroyed, Fortune Lady banished');
});
T('Celestial Transformation halves ATK and destroys at the End Phase', () => {
  const g = duel({ board: [{ hand: ['Celestial Transformation', 'Shining Angel'], turn: 2 }, {}] });
  act(g, 0, 'Celestial Transformation'); drive(g);
  ok(atkOf(g, 0, 'Shining Angel') === 700, 'Shining Angel has 700 ATK');
  choose(g, 'end'); drive(g);
  ok(inZ(g, 0, 'gy', 'Shining Angel'), 'destroyed in the End Phase');
});
T('Cell Explosion Virus destroys Attack Position monsters', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Sangan'], turn: 2 }, { st: ['Cell Explosion Virus'] }] });
  E.lib.addCtr(g, on(g, 0, FILL), 'A', 1);
  attack(g, FILL); choose(g, 'Cell Explosion', 1); drive(g);
  ok(!on(g, 0, FILL) && !on(g, 0, 'Sangan'), 'both Attack Position monsters destroyed');
});
T('Chainsaw Insect: the opponent draws', () => {
  const g = duel({ board: [{ hand: [], m: ['Chainsaw Insect'], turn: 2 }, { m: [FILL] }] });
  const h = g.p[1].hand.length; attack(g, 'Chainsaw Insect', FILL); drive(g);
  ok(g.p[1].hand.length === h + 1, 'B drew 1');
});
T('Changing Destiny', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Changing Destiny'] }] });
  attack(g, FILL); choose(g, 'Changing Destiny', 1); drive(g);
  ok(on(g, 0, FILL).pos === 'def' && g.p[1].lp === 8000 && g.p[0].lp === 9000, `attack negated, Warwolf in Defense, A gained 1000 (${g.p[0].lp})`);
  ok(E.lib.forbid(g, { type: 'pos', c: on(g, 0, FILL) }), 'it cannot change position');
});
T('Chimera revives Berfomet when destroyed', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Chimera the Flying Mythical Beast'], gy: ['Berfomet'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); drive(g);
  ok(on(g, 0, 'Berfomet') && inZ(g, 0, 'gy', 'Chimera the Flying Mythical Beast'), 'Berfomet Special Summoned');
});
T('Clay Charge', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Elemental HERO Clayman', pos: 'def' }], st: ['Clay Charge'] }] });
  attack(g, FILL, 'Elemental HERO Clayman'); choose(g, 'Clay Charge', 1); drive(g);
  ok(!on(g, 0, FILL) && !on(g, 1, 'Elemental HERO Clayman') && g.p[0].lp === 7200, 'both destroyed, A took 800');
});
T('Clear World: FIRE burn and the upkeep', () => {
  const g = duel({ board: [{ hand: ['Clear World'], m: ['Black Rose Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Clear World'); drive(g); choose(g, 'end'); drive(g);
  ok(g.p[0].lp === 6500, `A paid 500 and took 1000 (${g.p[0].lp})`);
  const g2 = duel({ board: [{ hand: ['Clear World'], m: ['Sangan', 'Armageddon Knight'], turn: 2 }, {}] });
  act(g2, 0, 'Clear World'); drive(g2); choose(g2, 'bp'); passAll(g2);
  ok(!hasOpt(g2, 'atk:'), 'DARK: no attack with 2 monsters');
});
T('Clock Tower Prison with 4 counters stops battle damage', () => {
  const g = duel({ board: [{ hand: ['Clock Tower Prison'], turn: 2 }, {}] });
  act(g, 0, 'Clock Tower Prison'); drive(g); const f = g.p[0].fz; f.flags.clock = 4;
  ok(E.lib.damage(g, 0, 1000, { battle: true }) === 0 && g.p[0].lp === 8000, 'no battle damage');
});
T('Cloning copies a Normal Summoned monster', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { st: ['Cloning'] }] });
  choose(g, 'ns:'); waitFor(g, 1, 'Cloning'); choose(g, 'Cloning', 1); drive(g);
  const t = g.p[1].m.find(c => c && E.name(c) === 'Clone Token');
  ok(t && E.atk(g, t) === 2000 && E.def(g, t) === 100 && E.lv(t) === 4, 'Clone Token 2000/100 Level 4');
});
T('Colossal Fighter Assault Mode', () => {
  const g = duel({ board: [{ hand: [], m: ['Colossal Fighter'], st: ['Assault Mode Activate'], deckTop: [FILL, 'Colossal Fighter Assault Mode', 'Elemental HERO Wildheart', 'Elemental HERO Clayman'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Assault Mode Activate'); drive(g);
  ok(on(g, 0, 'Colossal Fighter Assault Mode'), 'Assault Mode summoned');
  const n = g.p[0].gy.filter(c => E.data(c).r === 'Warrior').length;
  ok(n >= 2 && atkOf(g, 1, FILL) === 2000 - 100 * n, `opponent loses 100 per Warrior in the GY (${n})`);
  const g2 = duel({ board: [{ hand: [], gy: ['Colossal Fighter Assault Mode'], turn: 2 }, {}] });
  ok(E.lib.forbid(g2, { type: 'ss', c: g2.p[0].gy[0], p: 0, how: 'special' }), 'cannot be revived');
});
T('Combo Fighter attacks twice after a Chain', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Combo Fighter'], turn: 2 }, { st: ['Mystical Space Typhoon', 'Mirror Force'] }] });
  act(g, 0, 'Mystical Space Typhoon'); choose(g, 'u' + g.p[1].st[1].u, 0); choose(g, 'Mystical', 1); drive(g);
  ok(on(g, 0, 'Combo Fighter').flags.extraAttack === g.turnNo, 'Combo Fighter can attack twice');
});
T('Command Knight', () => {
  const g = duel({ board: [{ hand: [], m: ['Command Knight', 'Sangan'], turn: 2 }, {}] });
  ok(atkOf(g, 0, 'Command Knight') === 1600 && E.lib.has(g, on(g, 0, 'Command Knight'), 'noAttackTarget'), '1600 ATK, cannot be attacked');
});
T('Commander Covington summons Machina Force', () => {
  const g = duel({ board: [{ hand: [], m: ['Commander Covington', 'Machina Soldier', 'Machina Sniper', 'Machina Defender'], deckTop: ['Machina Force'], turn: 2 }, {}] });
  act(g, 0, 'Commander Covington'); drive(g);
  ok(on(g, 0, 'Machina Force') && inZ(g, 0, 'gy', 'Machina Sniper'), 'Machina Force Special Summoned');
});
T('Common Charity banishes a Normal Monster', () => {
  const g = duel({ board: [{ hand: [], st: ['Common Charity'], deckTop: [FILL, 'Sangan', FILL], turn: 2 }, {}] });
  act(g, 0, 'Common Charity'); drive(g);
  ok(g.p[0].ban.length === 1, 'a Normal Monster was banished');
});
T('Common Soul gives ATK and returns the Neo-Spacian', () => {
  const g = duel({ board: [{ hand: ['Common Soul', 'Neo-Spacian Aqua Dolphin', 'Heavy Storm'], m: ['Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Common Soul'); drive(g);
  ok(on(g, 0, 'Neo-Spacian Aqua Dolphin') && atkOf(g, 0, 'Sangan') === 1600, 'Sangan gains 600');
  act(g, 0, 'Heavy Storm'); drive(g);
  ok(inZ(g, 0, 'hand', 'Neo-Spacian Aqua Dolphin'), 'Aqua Dolphin back in the hand');
});
T('Confusion Chaff makes the two attackers battle', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Sangan'], turn: 2 }, { st: ['Confusion Chaff'] }] });
  attack(g, 'Sangan'); drive(g);
  choose(g, `atk:${on(g, 0, FILL).u}:d`); choose(g, 'Confusion Chaff', 1); drive(g);
  ok(g.p[1].lp === 7000 && inZ(g, 0, 'gy', 'Sangan') && g.p[0].lp === 7000, `Sangan destroyed, A took 1000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Conscription', () => {
  const g = duel({ board: [{ hand: [], st: ['Conscription'], turn: 2 }, { deckTop: ['Sangan'] }] });
  act(g, 0, 'Conscription'); drive(g);
  ok(on(g, 0, 'Sangan'), 'A Special Summoned the excavated Sangan');
});
T('Contact and Contact Out', () => {
  const g = duel({ board: [{ hand: ['Contact'], m: ['Chrysalis Dolphin'], deckTop: ['Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  act(g, 0, 'Contact'); drive(g);
  ok(on(g, 0, 'Neo-Spacian Aqua Dolphin') && inZ(g, 0, 'gy', 'Chrysalis Dolphin'), 'Aqua Dolphin summoned');
  const g2 = duel({ board: [{ hand: ['Contact Out'], m: ['Elemental HERO Aqua Neos'], deckTop: [FILL, 'Elemental HERO Neos', 'Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  act(g2, 0, 'Contact Out'); drive(g2);
  ok(on(g2, 0, 'Elemental HERO Neos') && on(g2, 0, 'Neo-Spacian Aqua Dolphin') && g2.p[0].extra.length === 1, 'materials summoned, Aqua Neos in the Extra Deck');
});
T('Copy Plant and Copycat', () => {
  const g = duel({ board: [{ hand: ['Copycat'], m: ['Copy Plant', 'Mystic Tomato'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Copy Plant'); drive(g);
  ok(E.lv(on(g, 0, 'Copy Plant')) === 4, 'Copy Plant is Level 4');
  choose(g, 'ns:'); drive(g);
  ok(atkOf(g, 0, 'Copycat') === 2000 && E.def(g, on(g, 0, 'Copycat')) === 100, 'Copycat is 2000/100');
});
T('Corruption Cell A and Gangi\'el place A-Counters', () => {
  const g = duel({ board: [{ hand: ['Corruption Cell A'], m: ["Cosmic Horror Gangi'el"], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Corruption Cell A'); drive(g); act(g, 0, "Cosmic Horror Gangi'el"); drive(g);
  ok(E.lib.ctr(on(g, 1, FILL), 'A') === 2, 'two A-Counters');
});
T('Counselor Lily boosts the Synchro', () => {
  const g = duel({ ex0: ['Black Rose Dragon'], board: [{ hand: [], m: ['Counselor Lily', FILL], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); choose(g, 'Attack Position');
  for (let i = 0; i < 10 && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'yesno') E.act(g, [/Lily/.test(pr.text) ? 'y' : 'n']); else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  ok(atkOf(g, 0, 'Black Rose Dragon') === 3400 && g.p[0].lp === 7500, 'Black Rose has 3400 ATK');
});
T('Cranium Fish', () => {
  const g = duel({ board: [{ hand: ['Cranium Fish', 'Treeborn Frog'], m: ["Ocean's Keeper"], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'sp:'); drive(g); ok(on(g, 0, 'Cranium Fish'), 'summoned by Tributing Ocean\'s Keeper');
  act(g, 0, 'Cranium Fish'); drive(g); ok(inZ(g, 1, 'gy', 'Mirror Force'), 'face-down card destroyed');
});
T('Creature Seizure swaps Normal Monsters', () => {
  const g = duel({ board: [{ hand: ['Creature Seizure'], m: ['Giant Soldier of Stone'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Creature Seizure'); drive(g);
  ok(on(g, 0, FILL) && on(g, 1, 'Giant Soldier of Stone'), 'control switched');
});
T('Crop Circles', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Crop Circles'], deckTop: [FILL, 'Alien Hunter'], turn: 2 }, {}] });
  act(g, 0, 'Crop Circles'); drive(g); ok(on(g, 0, 'Alien Hunter'), 'Level 4 Alien summoned');
});
T('Crusader of Endymion', () => {
  const g = duel({ board: [{ hand: [], m: ['Crusader of Endymion', 'Breaker the Magical Warrior'], turn: 2 }, {}] });
  choose(g, 'gem:'); drive(g); act(g, 0, 'Crusader of Endymion'); drive(g);
  ok(atkOf(g, 0, 'Crusader of Endymion') === 2500 && E.lib.ctr(on(g, 0, 'Breaker the Magical Warrior'), 'spell') === 1, '+600 and a Spell Counter on Breaker');
});
T('Crush Card Virus', () => {
  const g = duel({ board: [{ hand: [], m: ['Sangan'], st: ['Crush Card Virus'], turn: 2 }, { m: [FILL], hand: [FILL, 'Sangan'] }] });
  act(g, 0, 'Crush Card Virus'); drive(g);
  ok(!on(g, 1, FILL) && inZ(g, 1, 'hand', 'Sangan') && !inZ(g, 1, 'hand', FILL), 'Warwolves destroyed on the field and in the hand');
  // Errata audit (2026-11-26): the original card has no "no damage" clause.
  const lp = g.p[1].lp; E.lib.damage(g, 1, 500, {}); ok(g.p[1].lp === lp - 500, 'B still takes damage (original text)');
});
T('Cry Havoc! Normal Summons a Normal Monster', () => {
  const g = duel({ board: [{ hand: ['Giant Soldier of Stone', 'Sangan'], st: [{ n: 'Cry Havoc!', pos: 'up' }], gy: ['Sangan'], turn: 2 }, {}] });
  choose(g, 'ns:' + cardIn(g, 0, 'Sangan').u); drive(g); act(g, 0, 'Cry Havoc!'); drive(g);
  ok(on(g, 0, 'Giant Soldier of Stone') && g.p[0].ban.length === 1, 'second summon with Cry Havoc!');
});
T('Cryomancer stops Level 4+ attacks', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Cryomancer of the Ice Barrier', 'Blizzed, Defender of the Ice Barrier'] }] });
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'atk:'), 'no attack offered');
});
T('Cu Chulainn gains a Normal Monster\'s ATK until your next Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Cu Chulainn the Awakened'], gy: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Cu Chulainn the Awakened'); drive(g);
  ok(atkOf(g, 0, 'Cu Chulainn the Awakened') === 2500, 'Cu Chulainn has 2500 ATK');
  choose(g, 'end'); drive(g); for (let i = 0; i < 5 && g.prompt && g.prompt.p === 1; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); drive(g); }
  ok(atkOf(g, 0, 'Cu Chulainn the Awakened') === 500, 'back to 500 in your next turn');
  ok(E.lib.forbid(g, { type: 'ss', c: on(g, 0, 'Cu Chulainn the Awakened'), p: 0, how: 'special' }), 'only Ritual Summoned');
});
T('Cunning of the Six Samurai', () => {
  const g = duel({ board: [{ hand: ['Cunning of the Six Samurai'], m: ['The Six Samurai - Yaichi'], gy: ['The Six Samurai - Zanji'], turn: 2 }, {}] });
  act(g, 0, 'Cunning of the Six Samurai'); choose(g, 'Zanji'); drive(g);
  ok(on(g, 0, 'The Six Samurai - Zanji') && inZ(g, 0, 'gy', 'The Six Samurai - Yaichi'), 'Zanji revived');
});
T('Cursed Fig locks 2 Set cards', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Cursed Fig'], st: ['Mirror Force', 'Mystical Space Typhoon'] }] });
  attack(g, FILL, 'Cursed Fig'); drive(g);
  const mf = g.p[1].st.find(c => c && E.name(c) === 'Mirror Force');
  ok(E.lib.forbid(g, { type: 'activate', c: mf, p: 1, eff: {} }), 'Mirror Force cannot be activated');
});
T('Cyborg Doctor', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyborg Doctor', 'Junk Synchron'], gy: ['Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Cyborg Doctor'); drive(g); ok(on(g, 0, 'Sangan'), 'Sangan (DARK Level 3) revived');
});
T('Cyclone Blade and Cyclone Boomerang', () => {
  const g = duel({ board: [{ hand: ['Cyclone Blade'], m: ['Destiny HERO - Diamond Dude'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Cyclone Blade'); drive(g); attack(g, 'Destiny HERO - Diamond Dude'); for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick' && hasOpt(g, 'Face-down')) choose(g, 'Face-down'); else drive(g, 1); }
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed after the attack');
  const g2 = duel({ board: [{ hand: ['Cyclone Boomerang', 'Dark Hole'], m: ['Elemental HERO Wildheart'], turn: 2 }, { st: ['Mirror Force', 'Mystical Space Typhoon'] }] });
  act(g2, 0, 'Cyclone Boomerang'); drive(g2); ok(atkOf(g2, 0, 'Elemental HERO Wildheart') === 2000, 'Wildheart 2000 ATK');
  act(g2, 0, 'Dark Hole'); drive(g2);
  ok(g2.p[1].gy.length === 2 && g2.p[1].lp === 7800, `S/T destroyed, 200 damage (${g2.p[1].lp})`);
});
T('D.3.S. Frog recipe and ATK', () => {
  const g = duel({ ex0: ['D.3.S. Frog'], board: [{ hand: [], gy: ['Treeborn Frog', 'Treeborn Frog'], turn: 2 }, {}] });
  const f = g.p[0].extra[0]; const r = E.lib.fusionRecipe(f);
  ok(r && r.length === 3, '3 Des Frog recipe');
  const sc = E.SCRIPTS['D.3.S. Frog']; ok(sc.self.atk(g, { ctrl: 0 }) === 1000, '+1000 for 2 Treeborn Frogs');
});
T('Darkblaze Dragon doubles from the GY and burns', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Darkblaze Dragon'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Monster Reborn'); drive(g);
  ok(atkOf(g, 0, 'Darkblaze Dragon') === 2400, 'Darkblaze 2400 ATK');
  attack(g, 'Darkblaze Dragon', FILL); drive(g);
  ok(g.p[1].lp === 8000 - 400 - 2000, `400 battle + 2000 effect (${g.p[1].lp})`);
});
T('Dangerous Machine Type-6 rolls in the Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Dangerous Machine Type-6'], turn: 2 }, {}] });
  act(g, 0, 'Dangerous Machine Type-6'); drive(g); choose(g, 'end'); drive(g);
  for (let i = 0; i < 5 && g.prompt && g.prompt.p === 1; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); drive(g); }
  ok(g.log.some(l => /rolled a/.test(l)), 'a die was rolled');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-36 checks passed.');
process.exit(fails ? 1 : 0);
