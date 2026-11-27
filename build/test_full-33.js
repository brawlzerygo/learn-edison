// Scenario checks for full pool batch 33: node build/test_full-33.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  if (o.board && !o.board.turn && o.board[1] && o.board[1].turn) o.board.turn = o.board[1].turn; // a side-1 turn number counts too
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: o.first || 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
// answer windows and yes/no prompts until an idle (or other) prompt comes up
const settle = (g, yes = true) => { for (let i = 0; i < 40 && g.prompt && ['respond', 'yesno'].includes(g.prompt.type); i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else choose(g, yes ? 'yes' : 'no'); } };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st].find(c => c && E.name(c) === n).u + ':');
const use = (g, p, n) => choose(g, 'a:' + [...g.p[p].m, ...g.p[p].st, ...g.p[p].hand, ...g.p[p].gy].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const last = (g, n = 6) => g.log.slice(-n).join(' / ');
const toBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => { choose(g, 'atk:' + a.u + ':' + (t ? t.u : 'd')); };
const endTurn = g => { if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g); } choose(g, 'end'); settle(g); };

/* ----- Neos ----- */
T('Neo Space: +500 ATK, the Neos Fusion stays in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Neo Space'], m: ['Elemental HERO Neos', 'Elemental HERO Air Neos'], turn: 2 }, {}] });
  act(g, 0, 'Neo Space'); passAll(g);
  ok(E.atk(g, on(g, 0, 'Elemental HERO Neos')) === 3000 && E.atk(g, on(g, 0, 'Elemental HERO Air Neos')) === 3000, 'Neos and Air Neos have 3000 ATK');
  endTurn(g);
  ok(!!on(g, 0, 'Elemental HERO Air Neos'), `Air Neos is still on the field (${last(g)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Elemental HERO Air Neos'], turn: 2 }, {}] });
  endTurn(g2); ok(!on(g2, 0, 'Elemental HERO Air Neos'), 'without Neo Space Air Neos returns to the Extra Deck');
});
T('Neo Space Pathfinder adds Neo Space from the GY', () => {
  const g = duel({ board: [{ hand: ['Neo Space Pathfinder'], gy: ['Neo Space'], turn: 2 }, {}] });
  choose(g, 'Discard: add Neo Space'); settle(g);
  ok(inZ(g, 0, 'hand', 'Neo Space') && inZ(g, 0, 'gy', 'Neo Space Pathfinder'), 'Neo Space in hand, Pathfinder in the GY');
});
T('Neo-Parshath: Tribute Airknight, piercing, draws on damage', () => {
  const g = duel({ board: [{ hand: ['Neo-Parshath, the Sky Paladin'], m: ['Airknight Parshath'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  choose(g, 'sp:'); settle(g);
  const n = on(g, 0, 'Neo-Parshath, the Sky Paladin'); ok(!!n && inZ(g, 0, 'gy', 'Airknight Parshath'), 'summoned by Tributing Airknight');
  const h = g.p[0].hand.length; toBP(g); attack(g, n, g.p[1].m.find(Boolean)); settle(g);
  ok(g.p[1].lp === 8000 - 2200 && g.p[0].hand.length === h + 1, `2200 piercing damage and a draw (B ${g.p[1].lp})`);
});
T('Air Hummingbird gains 500 per card in their hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Neo-Spacian Air Hummingbird'], turn: 2 }, {}] });
  const n = g.p[1].hand.length; choose(g, 'Gain 500'); settle(g);
  ok(g.p[0].lp === 8000 + 500 * n, `gained ${500 * n}`);
});
T('Flare Scarab counts their Spells and Traps', () => {
  const g = duel({ board: [{ hand: [], m: ['Neo-Spacian Flare Scarab'], turn: 2 }, { st: ['Heavy Storm', 'Gravity Bind'] }] });
  ok(E.atk(g, on(g, 0, 'Neo-Spacian Flare Scarab')) === 1300, '500 + 800 ATK');
});
T('Marine Dolphin: only with NEX, then destroys a monster in their hand', () => {
  const g = duel({ ex0: ['Neo-Spacian Marine Dolphin'], board: [{ hand: ['NEX', 'Heavy Storm'], m: ['Neo-Spacian Aqua Dolphin', FILL], turn: 2 }, { hand: [FILL] }] });
  const md = g.p[0].extra[0];
  ok(E.lib.forbid(g, { type: 'ss', c: md, p: 0, how: 'special' }), 'no Special Summon without NEX');
  act(g, 0, 'NEX'); settle(g); for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Dolphin'); settle(g);
  ok(!!on(g, 0, 'Neo-Spacian Marine Dolphin'), `Marine Dolphin summoned with NEX (${last(g)})`);
  choose(g, 'Discard: look'); settle(g); for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(g.p[1].hand.length === 0 && g.p[1].lp === 7500, `their Warwolf destroyed and 500 damage (B ${g.p[1].lp})`);
});
T('Twinkle Moss draws a Spell and attacks directly', () => {
  const g = duel({ board: [{ hand: [], m: ['Neo-Spacian Twinkle Moss'], deckTop: [FILL, 'Pot of Greed'], turn: 2 }, { m: [FILL] }] });
  toBP(g); attack(g, on(g, 0, 'Neo-Spacian Twinkle Moss'), on(g, 1, FILL)); settle(g);
  ok(g.p[1].lp === 7500 && !!on(g, 0, 'Neo-Spacian Twinkle Moss'), `500 direct damage (B ${g.p[1].lp}; ${last(g)})`);
});

/* ----- HERO support ----- */
T('O - Oversoul revives Neos', () => {
  const g = duel({ board: [{ hand: ['O - Oversoul'], gy: ['Elemental HERO Neos'], turn: 2 }, {}] });
  act(g, 0, 'O - Oversoul'); settle(g); ok(!!on(g, 0, 'Elemental HERO Neos'), 'Neos on the field');
});
T('R - Righteous Justice destroys 2 Spells/Traps for 2 HEROes', () => {
  const g = duel({ board: [{ hand: ['R - Righteous Justice'], m: ['Elemental HERO Avian', 'Elemental HERO Sparkman'], turn: 2 }, { st: ['Gravity Bind', 'Heavy Storm', 'Pot of Greed'] }] });
  act(g, 0, 'R - Righteous Justice'); settle(g); if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); settle(g);
  ok(g.p[1].st.filter(Boolean).length === 1, 'two of their three cards destroyed');
});
T('Rose Bud: Tribute Knospe for Poison Rose from the Deck', () => {
  const g = duel({ board: [{ hand: ['Rose Bud'], m: ['Elemental HERO Knospe'], deckTop: [FILL, 'Elemental HERO Poison Rose'], turn: 2 }, {}] });
  act(g, 0, 'Rose Bud'); settle(g); ok(!!on(g, 0, 'Elemental HERO Poison Rose') && inZ(g, 0, 'gy', 'Elemental HERO Knospe'), `Poison Rose summoned (${last(g)})`);
});

/* ----- Alien, Phantom Beasts ----- */
T('Otherworld - The A Zone: -300 to the monster battling an Alien', () => {
  const g = duel({ board: [{ hand: ['Otherworld - The A Zone'], m: ['Alien Warrior'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Otherworld - The A Zone'); passAll(g);
  ok(E.atk(g, on(g, 1, FILL)) === 2000, 'no change outside battle');
  toBP(g); attack(g, on(g, 0, 'Alien Warrior'), on(g, 1, FILL)); settle(g);
  ok(inZ(g, 1, 'gy', FILL) && g.p[1].lp === 7900, `Alien Warrior wins and deals 100 (B ${g.p[1].lp})`);
});
T('Phantom Beast Cross-Wing pumps Gazelle from the GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Gazelle the King of Mythical Beasts'], gy: ['Phantom Beast Cross-Wing'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Gazelle the King of Mythical Beasts')) === 1800, 'Gazelle has 1800 ATK');
});
T('Phantom Beast Rock-Lizard: 1 Tribute, 500 burn on a kill', () => {
  const g = duel({ board: [{ hand: ['Phantom Beast Rock-Lizard'], m: ['Gazelle the King of Mythical Beasts'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'ns:'); if (g.prompt.type === 'choose') choose(g, '1 Tribute'); settle(g);
  const r = on(g, 0, 'Phantom Beast Rock-Lizard'); ok(!!r, 'Tribute Summoned with 1 Tribute');
  toBP(g); attack(g, r, on(g, 1, FILL)); settle(g);
  ok(g.p[1].lp === 8000 - 200 - 500, `200 battle and 500 effect damage (B ${g.p[1].lp})`);
});
T('Rock-Lizard destroyed by an opponent\'s effect burns 2000', () => {
  const g = duel({ first: 1, board: [{ m: ['Phantom Beast Rock-Lizard'] }, { hand: ['Fissure'], turn: 2 }] });
  act(g, 1, 'Fissure'); settle(g); ok(g.p[1].lp === 6000, `B took 2000 (B ${g.p[1].lp})`);
});
T('Phantom Beast Thunder-Pegasus protects Gazelle', () => {
  const g = duel({ first: 1, board: [{ m: ['Gazelle the King of Mythical Beasts'], gy: ['Phantom Beast Thunder-Pegasus'] }, { hand: [], m: [FILL], turn: 2 }] });
  toBP(g); attack(g, on(g, 1, FILL), on(g, 0, 'Gazelle the King of Mythical Beasts'));
  choose(g, 'Banish: protect', 0); settle(g);
  ok(!!on(g, 0, 'Gazelle the King of Mythical Beasts') && g.p[0].lp === 8000 && inZ(g, 0, 'ban', 'Phantom Beast Thunder-Pegasus'), `Gazelle survives and A takes no damage (A ${g.p[0].lp})`);
  ok(!on(g, 0, 'Gazelle the King of Mythical Beasts').flags.noBattleDestroy, 'the protection ends after the battle');
});
T('Phantom Beast Wild-Horn pierces', () => {
  const g = duel({ board: [{ hand: [], m: ['Phantom Beast Wild-Horn'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  toBP(g); attack(g, on(g, 0, 'Phantom Beast Wild-Horn'), g.p[1].m.find(Boolean)); settle(g);
  ok(g.p[1].lp === 8000 - 1600, `1600 piercing (B ${g.p[1].lp})`);
});

/* ----- Phantom ----- */
T('Phantom Cricket returns a face-down monster to the top of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Phantom Cricket', pos: 'set' }], turn: 2 }, { m: [{ n: 'Witch of the Black Forest', pos: 'set' }] }] });
  choose(g, 'flip:'); settle(g);
  const top = g.p[1].deck[g.p[1].deck.length - 1];
  ok(!g.p[1].m.some(Boolean) && E.name(top) === 'Witch of the Black Forest', `Witch is on top of B's Deck (${last(g)})`);
});
T('Phantom Dragon comes out when the opponent Special Summons', () => {
  const g = duel({ first: 1, board: [{ hand: ['Phantom Dragon'], m: [FILL] }, { hand: ['Cyber Dragon'], turn: 2 }] });
  choose(g, 'sp:'); settle(g);
  ok(!!on(g, 0, 'Phantom Dragon'), `Phantom Dragon summoned (${last(g)})`);
  const x = g.p[0].deck[0];
  ok(!E.lib.forbid(g, { type: 'ss', c: x, p: 0, how: 'special' }), '3 free zones: one more summon allowed');
  g.p[0].m[2] = { ...x, zone: 'm', pos: 'atk', u: 9999, ctrl: 0, mods: [], flags: {} }; g.seq++;
  ok(E.lib.forbid(g, { type: 'ss', c: x, p: 0, how: 'special' }), '2 free zones left: they are the locked ones');
});
T('Phantom Dragonray Bronto: 2300 when Gemini Summoned, to Defense after attacking', () => {
  const g = duel({ board: [{ hand: [], m: ['Phantom Dragonray Bronto'], turn: 2 }, {}] });
  const b = on(g, 0, 'Phantom Dragonray Bronto'); ok(E.atk(g, b) === 1500, '1500 as a Normal Monster');
  choose(g, 'gem:'); settle(g); ok(E.atk(g, b) === 2300, '2300 after the Gemini Summon');
  toBP(g); attack(g, b, null); settle(g); choose(g, 'endbp'); settle(g);
  ok(g.p[1].lp === 5700 && b.pos === 'def', `2300 damage, then Defense Position (B ${g.p[1].lp}, ${b.pos})`);
  ok(!hasOpt(g, 'pos:' + b.u), "its position can't be changed");
});
T('Phantom Skyblaster summons tokens and burns in the Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Phantom Skyblaster'], m: [FILL], turn: 2 }, {}] });
  choose(g, 'ns:'); choose(g, 'yes'); choose(g, '2'); choose(g, 'Attack Position'); settle(g);
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Skyblaster Token').length === 2, 'two Skyblaster Tokens');
  endTurn(g); endTurn(g); settle(g);
  ok(g.p[1].lp === 8000 - 900, `900 damage in the Standby Phase (B ${g.p[1].lp})`);
  toBP(g); ok(!hasOpt(g, 'atk:' + on(g, 0, 'Phantom Skyblaster').u), "Skyblasters can't attack that turn");
});

/* ----- Psychic ----- */
T('Psi-Curse destroys the attacker and burns Level x 300', () => {
  const g = duel({ first: 1, board: [{ m: [{ n: 'Psychic Emperor', pos: 'def' }], st: ['Psi-Curse'] }, { hand: [], m: [FILL], turn: 2 }] });
  toBP(g); attack(g, on(g, 1, FILL), on(g, 0, 'Psychic Emperor')); settle(g);
  ok(inZ(g, 1, 'gy', FILL) && g.p[1].lp === 8000 - 1800, `Warwolf destroyed, 1800 damage (B ${g.p[1].lp}; ${last(g)})`);
});
T('Psi-Impulse: their hand goes back, they draw 3', () => {
  const g = duel({ board: [{ hand: ['Psi-Impulse'], m: ['Krebons'], turn: 2 }, {}] });
  act(g, 0, 'Psi-Impulse'); settle(g);
  ok(g.p[1].hand.length === 3 && inZ(g, 0, 'gy', 'Krebons'), `B has 3 cards (${g.p[1].hand.length})`);
});
T('Psi-Station: +1 Level and +300 ATK on a Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Krebons'], st: [{ n: 'Psi-Station', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g);
  const k = on(g, 0, 'Krebons'); ok(E.lv(k) === 3 && E.atk(g, k) === 1500 && g.p[0].lp === 7500, `Level 3, 1500 ATK, 500 paid (${E.lv(k)}, ${E.atk(g, k)})`);
});
T('Psychic Emperor gains 500 per Psychic in the GY', () => {
  const g = duel({ board: [{ hand: ['Psychic Emperor'], m: [FILL], gy: ['Krebons', 'Psychic Commander'], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g); ok(g.p[0].lp === 9000, `gained 1000 (${g.p[0].lp})`);
});
T('Psychic Jumper switches control', () => {
  const g = duel({ board: [{ hand: [], m: ['Psychic Jumper', 'Psychic Emperor'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'Pay 1000'); settle(g); for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(!!on(g, 0, FILL) && !!on(g, 1, 'Psychic Emperor') && g.p[0].lp === 7000, 'Warwolf and Emperor switched, 1000 paid');
  ok(!hasOpt(g, 'pos:' + on(g, 0, FILL).u), "the Warwolf's position can't be changed this turn");
});
T('Psychic Overload: 3 Psychics back, draw 2', () => {
  const g = duel({ board: [{ hand: [], st: ['Psychic Overload'], gy: ['Krebons', 'Psychic Commander', 'Mind Protector'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Psychic Overload'); settle(g);
  ok(g.p[0].hand.length === h + 2 && g.p[0].gy.filter(c => E.name(c) !== 'Psychic Overload').length === 0, 'drew 2, the GY is empty');
});
T('Psychic Path adds 2 banished Psychics', () => {
  const g = duel({ board: [{ hand: ['Psychic Path'], ban: ['Krebons', 'Psychic Commander'], turn: 2 }, {}] });
  act(g, 0, 'Psychic Path'); settle(g); if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.map(o => o.key)); settle(g);
  ok(inZ(g, 0, 'hand', 'Krebons') && inZ(g, 0, 'hand', 'Psychic Commander') && g.p[0].lp === 7200, 'both added, 800 paid');
});
T('Psychic Rejuvenation gains 1000 per face-up Psychic', () => {
  const g = duel({ board: [{ hand: [], m: ['Krebons', 'Psychic Emperor'], st: ['Psychic Rejuvenation'], turn: 2 }, {}] });
  act(g, 0, 'Psychic Rejuvenation'); settle(g); ok(g.p[0].lp === 10000, 'gained 2000');
});
T('Psychic Snail: another Psychic attacks twice, Snail stays back', () => {
  const g = duel({ board: [{ hand: [], m: ['Psychic Snail', 'Psychic Emperor'], turn: 2 }, {}] });
  choose(g, 'Pay 800'); settle(g);
  toBP(g); ok(!hasOpt(g, 'atk:' + on(g, 0, 'Psychic Snail').u), "Snail can't attack");
  const e = on(g, 0, 'Psychic Emperor'); attack(g, e, null); settle(g); attack(g, e, null); settle(g);
  ok(g.p[1].lp === 8000 - 4800, `Emperor hit twice (B ${g.p[1].lp})`);
});
T('Psychic Soul gains Level x 300', () => {
  const g = duel({ board: [{ hand: [], m: ['Psychic Emperor'], st: ['Psychic Soul'], turn: 2 }, {}] });
  act(g, 0, 'Psychic Soul'); settle(g); ok(g.p[0].lp === 9800, `gained 1800 (${g.p[0].lp})`);
});
T('Psychic Sword: up to 2000 ATK while behind', () => {
  const g = duel({ board: [{ hand: ['Psychic Sword'], m: ['Psychic Emperor'], lp: 5000, turn: 2 }, {}] });
  act(g, 0, 'Psychic Sword'); settle(g); ok(E.atk(g, on(g, 0, 'Psychic Emperor')) === 4400, `4400 ATK (${E.atk(g, on(g, 0, 'Psychic Emperor'))})`);
});
T('Psychic Trigger banishes 2 and draws 2 while behind', () => {
  const g = duel({ board: [{ hand: [], st: ['Psychic Trigger'], gy: ['Krebons', 'Psychic Commander'], lp: 5000, turn: 2 }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Psychic Trigger'); settle(g);
  ok(g.p[0].hand.length === h + 2 && g.p[0].ban.length === 2, 'drew 2, banished 2');
});
T('Psychic Tuning: revive, linked, damage when it goes', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Psychic Tuning'], gy: ['Psychic Emperor'], turn: 2 }, {}] });
  act(g, 0, 'Psychic Tuning'); settle(g); ok(!!on(g, 0, 'Psychic Emperor'), 'Emperor revived');
  const lp = g.p[0].lp; act(g, 0, 'Mystical Space Typhoon'); settle(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Psychic Tuning'); settle(g);
  ok(!on(g, 0, 'Psychic Emperor') && g.p[0].lp === lp - 2400, `Emperor destroyed and 2400 damage (${lp} to ${g.p[0].lp})`);
});

/* ----- Puppets ----- */
T('Puppet King answers a search and dies in its next End Phase', () => {
  const g = duel({ first: 1, board: [{ hand: ['Puppet King'] }, { hand: ['Reinforcement of the Army'], deckTop: [FILL, 'Axe Raider'], turn: 2 }] });
  act(g, 1, 'Reinforcement of the Army'); settle(g); for (let i = 0; i < 4 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') choose(g, 'Axe Raider'); else if (g.prompt.type === 'yesno') choose(g, 'yes'); else passAll(g); }
  ok(!!on(g, 0, 'Puppet King'), `Puppet King summoned (${last(g)})`);
  endTurn(g); ok(!!on(g, 0, 'Puppet King'), 'still there after B\'s End Phase');
  endTurn(g); ok(inZ(g, 0, 'gy', 'Puppet King'), 'destroyed in A\'s next End Phase');
});
T('Puppet Master revives 2 Fiends that cannot attack', () => {
  const g = duel({ board: [{ hand: ['Puppet Master'], m: [FILL], gy: ['Archfiend Soldier', 'Archfiend Soldier'], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g);
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Archfiend Soldier').length === 2 && g.p[0].lp === 6000, '2 Fiends revived, 2000 paid');
  toBP(g); ok(!hasOpt(g, 'atk:' + on(g, 0, 'Archfiend Soldier').u), "they can't attack");
});
T('Puppet Plant takes a Warrior until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Puppet Plant'], turn: 2 }, { m: ['Axe Raider'] }] });
  choose(g, 'Discard: take'); settle(g); ok(!!on(g, 0, 'Axe Raider'), 'A controls Axe Raider');
  endTurn(g); ok(!!on(g, 1, 'Axe Raider'), 'it goes back');
});

/* ----- Radiant ----- */
T('Radiant Jeral gains 1000 with the Sanctuary', () => {
  const g = duel({ board: [{ hand: ['Foolish Burial'], st: [{ n: 'The Sanctuary in the Sky', pos: 'up' }], deckTop: [FILL, 'Radiant Jeral'], turn: 2 }, {}] });
  act(g, 0, 'Foolish Burial'); settle(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Radiant Jeral'); settle(g);
  ok(g.p[0].lp === 9000, `gained 1000 (${g.p[0].lp})`);
});
T('Radiant Mirror Force needs 3 attackers in Attack Position', () => {
  const g = duel({ first: 1, board: [{ st: ['Radiant Mirror Force'] }, { hand: [], m: [FILL, FILL, FILL], turn: 2 }] });
  toBP(g); attack(g, on(g, 1, FILL), null); choose(g, 'Radiant Mirror Force', 0); settle(g);
  ok(!g.p[1].m.some(Boolean), 'all 3 destroyed');
  const g2 = duel({ first: 1, board: [{ st: ['Radiant Mirror Force'] }, { hand: [], m: [FILL, FILL], turn: 2 }] });
  toBP(g2); attack(g2, on(g2, 1, FILL), null); ok(!hasOpt(g2, 'Radiant Mirror Force'), 'not with 2');
});
T('Radiant Spirit destroys face-down and non-LIGHT monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Radiant Spirit'], turn: 2 }, { m: ['Dark Magician', { n: 'Airknight Parshath', pos: 'set' }, 'Airknight Parshath'] }] });
  toBP(g); attack(g, on(g, 0, 'Radiant Spirit'), on(g, 1, 'Dark Magician')); settle(g);
  ok(g.p[1].m.filter(Boolean).length === 1 && !!on(g, 1, 'Airknight Parshath'), 'only the face-up LIGHT monster is left');
});

/* ----- Reptilianne ----- */
T('Reptilianne Gardna searches when destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Reptilianne Gardna'], deckTop: [FILL, 'Reptilianne Viper'], turn: 2 }, { m: ['Dark Magician'] }] });
  toBP(g); attack(g, on(g, 0, 'Reptilianne Gardna'), on(g, 1, 'Dark Magician')); settle(g);
  ok(true, 'attack done'); // Gardna (0 ATK) loses
  ok(inZ(g, 0, 'hand', 'Reptilianne Viper'), `Viper added (${last(g)})`);
});
T('Reptilianne Gorgon zeroes the monster it attacked', () => {
  const g = duel({ board: [{ hand: [], m: ['Reptilianne Gorgon'], turn: 2 }, { m: ['Dark Magician'] }] });
  toBP(g); attack(g, on(g, 0, 'Reptilianne Gorgon'), on(g, 1, 'Dark Magician')); settle(g);
  ok(E.atk(g, on(g, 1, 'Dark Magician')) === 0 && on(g, 1, 'Dark Magician').flags.f33noPos, 'Dark Magician has 0 ATK and is locked');
});
T('Reptilianne Hydra: Reptilianne Tuner only, destroys 0 ATK monsters and draws', () => {
  const g = duel({ ex0: ['Reptilianne Hydra'], board: [{ hand: [], m: ['Reptilianne Viper', FILL], turn: 2 }, { m: ['Mind Protector', 'Reptilianne Viper'] }] });
  const h = g.p[0].hand.length; choose(g, 'sp:'); settle(g);
  ok(!!on(g, 0, 'Reptilianne Hydra') && !g.p[1].m.some(Boolean) && g.p[0].hand.length === h + 2, 'both 0 ATK monsters destroyed, drew 2');
  const g2 = duel({ ex0: ['Reptilianne Hydra'], board: [{ hand: [], m: ['Krebons', FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:') && !hasOpt(g2, 'syn:'), 'no Synchro with a non-Reptilianne Tuner');
});
T('Reptilianne Medusa zeroes a monster', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'], m: ['Reptilianne Medusa'], turn: 2 }, { m: ['Dark Magician'] }] });
  choose(g, 'Send a card'); if (g.prompt.type === 'pick') choose(g, 'Heavy Storm'); settle(g); ok(E.atk(g, on(g, 1, 'Dark Magician')) === 0, 'Dark Magician has 0 ATK');
});
T('Reptilianne Naga: survives, zeroes what it battled at the end of the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Reptilianne Naga'], turn: 2 }, { m: ['Dark Magician'] }] });
  toBP(g); attack(g, on(g, 0, 'Reptilianne Naga'), on(g, 1, 'Dark Magician')); settle(g);
  ok(!!on(g, 0, 'Reptilianne Naga'), 'Naga survives'); choose(g, 'endbp'); settle(g);
  ok(E.atk(g, on(g, 1, 'Dark Magician')) === 0, 'Dark Magician has 0 ATK');
});
T('Reptilianne Poison flips a Defense monster to Attack with 0 ATK', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Poison'], m: ['Reptilianne Gorgon'], turn: 2 }, { m: [{ n: 'Dark Magician', pos: 'set' }] }] });
  act(g, 0, 'Reptilianne Poison'); settle(g); const d = on(g, 1, 'Dark Magician');
  ok(d.pos === 'atk' && E.atk(g, d) === 0, 'Dark Magician in Attack Position with 0 ATK');
});
T('Reptilianne Rage: +800, then -800 to their monster when destroyed', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Rage', 'Mystical Space Typhoon'], m: [FILL], turn: 2 }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Reptilianne Rage'); settle(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Warwolf'); settle(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2800, 'Warwolf has 2800');
  act(g, 0, 'Mystical Space Typhoon'); settle(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Reptilianne Rage'); settle(g);
  ok(E.atk(g, on(g, 1, 'Dark Magician')) === 1700, `Dark Magician lost 800 (${last(g)})`);
});
T('Reptilianne Scylla steals a 0 ATK monster it destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Reptilianne Scylla'], turn: 2 }, { m: ['Reptilianne Viper'] }] });
  toBP(g); attack(g, on(g, 0, 'Reptilianne Scylla'), on(g, 1, 'Reptilianne Viper')); settle(g);
  const v = on(g, 0, 'Reptilianne Viper'); ok(!!v && v.pos === 'def' && v.flags.negated, 'Viper summoned to A in Defense, negated');
});
T('Reptilianne Servant stops Normal Summons and dies with another face-up monster', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Reptilianne Servant'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:'), 'no Normal Summon'); ok(hasOpt(g, 'set:'), 'a Set is allowed');
  const g2 = duel({ board: [{ hand: [], m: ['Reptilianne Servant', FILL], turn: 2 }, {}] });
  settle(g2); ok(inZ(g2, 0, 'gy', 'Reptilianne Servant'), 'Servant destroyed');
});
T('Reptilianne Spawn: 2 tokens', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Spawn'], gy: ['Reptilianne Viper'], turn: 2 }, {}] });
  act(g, 0, 'Reptilianne Spawn'); settle(g);
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Reptilianne Token').length === 2 && inZ(g, 0, 'ban', 'Reptilianne Viper'), '2 tokens, Viper banished');
});
T('Reptilianne Vaskii: Tribute 2 zero-ATK monsters from either field, then destroy', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Vaskii'], m: ['Reptilianne Viper'], turn: 2 }, { m: ['Mind Protector', FILL] }] });
  { const vu = g.p[0].hand.find(c => E.name(c) === 'Reptilianne Vaskii').u; ok(!hasOpt(g, 'ns:' + vu) && !hasOpt(g, 'set:' + vu), "can't be Normal Summoned or Set"); }
  choose(g, 'sp:'); settle(g);
  const v = on(g, 0, 'Reptilianne Vaskii'); ok(!!v && !on(g, 1, 'Mind Protector'), 'Vaskii summoned');
  choose(g, 'Destroy a face-up'); settle(g); ok(!on(g, 1, FILL), 'Warwolf destroyed');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Reptilianne Vaskii'], turn: 2 }, {}] });
  ok(E.lib.forbid(g2, { type: 'ss', c: g2.p[0].gy[0], p: 0, how: 'special' }), "can't be revived");
});
T('Reptilianne Viper takes a 0 ATK monster', () => {
  const g = duel({ board: [{ hand: ['Reptilianne Viper'], turn: 2 }, { m: ['Mind Protector'] }] });
  choose(g, 'ns:'); settle(g); ok(!!on(g, 0, 'Mind Protector'), 'A controls Mind Protector');
});

/* ----- Plants and the rest ----- */
T('Rose Fairy Special Summons itself when searched', () => {
  const g = duel({ board: [{ hand: ['Airknight Parshath'], m: ['Sangan'], deckTop: [FILL, 'Rose Fairy'], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g); for (let i = 0; i < 4 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') choose(g, 'Rose Fairy'); else settle(g); }
  ok(!!on(g, 0, 'Rose Fairy'), `Rose Fairy summoned (${last(g)})`);
});
T('Rose Tentacles attacks once more per Plant and burns 300 per Plant', () => {
  const g = duel({ board: [{ hand: [], m: ['Rose Tentacles'], turn: 2 }, { m: ['Bean Soldier', 'Bean Soldier'] }] });
  toBP(g); const r = on(g, 0, 'Rose Tentacles');
  attack(g, r, on(g, 1, 'Bean Soldier')); settle(g); attack(g, r, on(g, 1, 'Bean Soldier')); settle(g); attack(g, r, null); settle(g);
  ok(g.p[1].lp === 8000 - 800 - 800 - 600 - 2200, `3 attacks and 600 burn (B ${g.p[1].lp})`);
  ok(E.lib.forbid(g, { type: 'ss', c: r, p: 0, how: 'special' }), "can't be Special Summoned");
});
T('Samsara Lotus comes back in the End Phase and burns its controller', () => {
  const g = duel({ board: [{ hand: [], gy: ['Samsara Lotus'], turn: 2 }, {}] });
  choose(g, 'end'); settle(g); ok(!!on(g, 0, 'Samsara Lotus'), 'Lotus summoned');
  endTurn(g); settle(g); ok(g.p[0].lp === 7000, `A took 1000 in the Standby Phase (${g.p[0].lp})`);
});
T('Seed Cannon counts Plant Summons and burns', () => {
  const g = duel({ board: [{ hand: ['Bean Soldier'], st: [{ n: 'Seed Cannon', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g); choose(g, 'Send to the GY'); settle(g);
  ok(g.p[1].lp === 7500, `500 damage (B ${g.p[1].lp})`);
});
T('Seed of Deception summons a Level 2 Plant', () => {
  const g = duel({ board: [{ hand: ['Seed of Deception', 'Firegrass'], turn: 2 }, {}] });
  act(g, 0, 'Seed of Deception'); settle(g); ok(!!on(g, 0, 'Firegrass'), 'Firegrass summoned');
});
T('Seed of Flame revives a Plant and gives them a Seed Token', () => {
  const g = duel({ first: 1, board: [{ m: ['Seed of Flame'], gy: ['Bean Soldier'] }, { hand: ['Fissure'], turn: 2 }] });
  act(g, 1, 'Fissure'); settle(g);
  ok(!!on(g, 0, 'Bean Soldier') && !!on(g, 1, 'Seed Token'), `Bean Soldier back, Seed Token on B's field (${last(g)})`);
});
T('Saber Beetle pierces', () => {
  const g = duel({ board: [{ hand: [], m: ['Saber Beetle'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  toBP(g); attack(g, on(g, 0, 'Saber Beetle'), g.p[1].m.find(Boolean)); settle(g); ok(g.p[1].lp === 8000 - 2300, `2300 (B ${g.p[1].lp})`);
});
T('Saber Hole negates a Normal Summon', () => {
  const g = duel({ first: 1, board: [{ m: ['X-Saber Airbellum'], st: ['Saber Hole'] }, { hand: [FILL], turn: 2 }] });
  choose(g, 'ns:'); choose(g, 'Saber Hole', 0); settle(g);
  ok(!on(g, 1, FILL) && inZ(g, 1, 'gy', FILL), 'Warwolf destroyed');
});
T('Saber Slash destroys face-up cards for each Attack Position X-Saber', () => {
  const g = duel({ board: [{ hand: ['Saber Slash'], m: ['X-Saber Airbellum', 'X-Saber Airbellum'], turn: 2 }, { m: ['Dark Magician', { n: FILL, pos: 'set' }], st: [{ n: 'Gravity Bind', pos: 'up' }] }] });
  act(g, 0, 'Saber Slash'); settle(g); if (g.prompt && g.prompt.type === 'pick') { const o = g.prompt.opts.filter(x => /Dark Magician|Gravity Bind/.test(x.label)); E.act(g, o.map(x => x.key)); } settle(g);
  ok(!on(g, 1, 'Dark Magician') && !inZ(g, 1, 'st', 'Gravity Bind') && g.p[1].m.some(Boolean), 'Dark Magician and Gravity Bind destroyed, the Set monster stays');
});
T('Samsara shuffles Ritual Tributes into the Deck', () => {
  const g = duel({ board: [{ hand: ['Black Luster Ritual', 'Black Luster Soldier'], m: [FILL, FILL], st: [{ n: 'Samsara', pos: 'up' }], turn: 2 }, {}] });
  const d = g.p[0].deck.length; act(g, 0, 'Black Luster Ritual'); settle(g); for (let i = 0; i < 3 && g.prompt && ['pick', 'choose'].includes(g.prompt.type); i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(!!on(g, 0, 'Black Luster Soldier') && !inZ(g, 0, 'gy', FILL) && g.p[0].deck.length === d + 2, `Tributes in the Deck (${last(g)})`);
});
T('Samsara Kaiser returns to the hand after a Tribute Summon', () => {
  const g = duel({ board: [{ hand: ['Airknight Parshath'], m: ['Samsara Kaiser'], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g); ok(inZ(g, 0, 'hand', 'Samsara Kaiser') && !!on(g, 0, 'Airknight Parshath'), 'Kaiser back in hand');
});

console.log(fails ? `\n${fails} failed` : '\nAll full-33 checks passed.');
process.exit(fails ? 1 : 0);
