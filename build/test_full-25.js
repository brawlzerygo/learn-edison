// Scenario checks for full pool batch 25: node build/test_full-25.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = (ex, main) => ({ name: 't', main: (main || Array(40).fill(FILL)).map(id), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0, o.main0), mk(o.ex1, o.main1)], first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
function auto(g, o = {}) {
  for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') E.act(g, [o.no ? 'n' : 'y']);
    else if (pr.type === 'choose') E.act(g, [pr.opts[o.ci || 0].key]);
    else E.act(g, pr.opts.slice(0, Math.max(pr.min, Math.min(pr.max, 1))).map(x => x.key));
  }
}
const cardOf = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + cardOf(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const st = (g, p, n) => g.p[p].st.find(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const goBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => choose(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const ns = (g, p, n) => choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u);
const logHas = (g, s) => g.log.some(l => l.includes(s));
function autoMax(g) { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['y']); else if (pr.type === 'choose') E.act(g, [pr.opts[0].key]); else E.act(g, pr.opts.slice(0, pr.max).map(x => x.key)); } }

/* ----- M ----- */
T('Moisture Creature with 3 Tributes destroys their Spells and Traps', () => {
  const g = duel({ board: [{ hand: ['Moisture Creature'], m: [FILL, FILL, FILL] }, { st: ['Mirror Force', 'Sakuretsu Armor'] }] });
  ns(g, 0, 'Moisture Creature'); choose(g, '3 Tribute'); auto(g);
  ok(on(g, 0, 'Moisture Creature') && inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Sakuretsu Armor'), 'both Set cards destroyed');
  const g2 = duel({ board: [{ hand: ['Moisture Creature'], m: [FILL, FILL, FILL] }, {}] });
  ns(g2, 0, 'Moisture Creature'); ok(g2.prompt.type === 'pick', 'no 3 Tribute choice without their Spells/Traps');
});
T('Mokey Mokey King brings back Mokey Mokey when it leaves the field', () => {
  const g = duel({ board: [{ hand: ['Raigeki'] }, { m: ['Mokey Mokey King'], gy: ['Mokey Mokey', 'Mokey Mokey', 'Mokey Mokey'] }] });
  act(g, 0, 'Raigeki'); auto(g);
  ok(cnt(g, 1, 'm', 'Mokey Mokey') === 3 && inZ(g, 1, 'gy', 'Mokey Mokey King'), `3 Mokey Mokey summoned (${cnt(g, 1, 'm', 'Mokey Mokey')})`);
});
T('Mokey Mokey Smackdown: a Fairy destroyed makes Mokey Mokey 3000 ATK this turn', () => {
  const g = duel({ board: [{ hand: ['Offerings to the Doomed', 'Mokey Mokey'], m: ['Mokey Mokey', 'Mudora'], st: [{ n: 'Mokey Mokey Smackdown', pos: 'up' }] }, {}] });
  act(g, 0, 'Offerings to the Doomed'); choose(g, 'Mudora'); auto(g);
  ok(E.atk(g, on(g, 0, 'Mokey Mokey')) === 3000, `Mokey Mokey has 3000 ATK (${E.atk(g, on(g, 0, 'Mokey Mokey'))})`);
});
T('Molten Zombie draws when revived from the GY', () => {
  const g = duel({ board: [{ hand: ['Premature Burial'], gy: ['Molten Zombie'] }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Premature Burial'); auto(g);
  ok(on(g, 0, 'Molten Zombie') && g.p[0].hand.length === h, 'Reborn used, 1 card drawn');
});
T('Monk Fighter: no battle damage to its controller', () => {
  const g = duel({ board: [{ hand: [], m: ['Battle Ox'], turn: 2 }, { m: ['Monk Fighter'] }] });
  goBP(g); attack(g, on(g, 0, 'Battle Ox'), on(g, 1, 'Monk Fighter')); auto(g);
  ok(g.p[1].lp === 8000 && inZ(g, 1, 'gy', 'Monk Fighter'), `no damage (B ${g.p[1].lp})`);
});
T('Morale Boost: +1000 on equip, 1000 damage when it leaves', () => {
  const g = duel({ board: [{ hand: ['Paralyzing Potion', 'Mystical Space Typhoon', FILL], st: [{ n: 'Morale Boost', pos: 'up' }] }, { m: ['Battle Ox'] }] });
  act(g, 0, 'Paralyzing Potion'); auto(g);
  ns(g, 0, FILL); auto(g);
  ok(g.p[0].lp === 9000, `A gained 1000 (A ${g.p[0].lp})`);
  ok(E.lib.has(g, on(g, 1, 'Battle Ox'), 'cantAttack'), 'Paralyzing Potion: Battle Ox can\'t attack');
  act(g, 0, 'Mystical Space Typhoon'); choose(g, 'Paralyzing Potion'); auto(g);
  ok(g.p[0].lp === 8000, `A took 1000 when it left (A ${g.p[0].lp})`);
});
T('Mucus Yolk gains 1000 in the next Standby Phase after battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Mucus Yolk'], turn: 2 }, { m: [FILL] }] });
  const y = on(g, 0, 'Mucus Yolk'); E.lib.addMod(g, y, { atk: 100 });
  goBP(g); ok(hasOpt(g, `atk:${y.u}:d`), 'direct attack offered'); attack(g, y, null); auto(g);
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(E.atk(g, y) === 1100, `ATK 1100 (${E.atk(g, y)})`);
});
T('Mudora and Muka Muka count', () => {
  const g = duel({ board: [{ hand: [FILL, FILL], m: ['Mudora', 'Muka Muka'], gy: ['Mokey Mokey', 'Mokey Mokey'] }, {}] });
  ok(E.atk(g, on(g, 0, 'Mudora')) === 1900, 'Mudora +400');
  const hn = g.p[0].hand.length; ok(E.atk(g, on(g, 0, 'Muka Muka')) === 600 + 300 * hn && E.def(g, on(g, 0, 'Muka Muka')) === 300 + 300 * hn, 'Muka Muka +300 per hand card');
});
T('Muko sends the drawn cards to the GY', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'] }, { st: ['Muko'] }] });
  const h = g.p[0].hand.length; act(g, 0, 'Pot of Greed'); choose(g, 'Muko', 1); auto(g);
  ok(g.p[0].hand.length === h - 1 && cnt(g, 0, 'gy', FILL) === 2, 'no cards added, 2 in the GY');
});
T('Multiplication of Ants makes 2 Tokens that can\'t be Tributed', () => {
  const g = duel({ board: [{ hand: ['Multiplication of Ants', 'Dark Magician'], m: ['Basic Insect'] }, {}] });
  act(g, 0, 'Multiplication of Ants'); auto(g);
  ok(cnt(g, 0, 'm', 'Army Ant Token') === 2 && inZ(g, 0, 'gy', 'Basic Insect'), '2 tokens');
  ok(!hasOpt(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Dark Magician').u), 'no Tribute Summon with the tokens');
});
T('Mustering of the Dark Scorpions summons one of each', () => {
  const g = duel({ board: [{ hand: ['Mustering of the Dark Scorpions', 'Dark Scorpion - Cliff the Trap Remover', 'Dark Scorpion - Cliff the Trap Remover', 'Dark Scorpion - Chick the Yellow'], m: ['Don Zaloog'] }, {}] });
  act(g, 0, 'Mustering of the Dark Scorpions'); auto(g);
  ok(cnt(g, 0, 'm', 'Dark Scorpion - Cliff the Trap Remover') === 1 && cnt(g, 0, 'm', 'Dark Scorpion - Chick the Yellow') === 1, 'Cliff and Chick summoned, 1 Cliff stays');
});
T('Mystik Wok gains the chosen ATK', () => {
  const g = duel({ board: [{ hand: ['Mystik Wok'], m: ['Dark Magician'] }, {}] });
  act(g, 0, 'Mystik Wok'); choose(g, 'ATK (2500)'); auto(g);
  ok(g.p[0].lp === 10500 && inZ(g, 0, 'gy', 'Dark Magician'), `gained 2500 (A ${g.p[0].lp})`);
});

/* ----- N ----- */
T('Narrow Pass counts Normal Summons and stops the third', () => {
  const g = duel({ board: [{ hand: [FILL, FILL], st: ['Narrow Pass'] }, {}] });
  const np = g.p[0].st[0]; act(g, 0, 'Narrow Pass'); auto(g);
  ns(g, 0, FILL); auto(g);
  ok(np.flags.f25np && np.flags.f25np[0] === 1, 'one Normal Summon counted');
  np.flags.f25np[0] = 2; g.seq++;
  ok(E.lib.forbid(g, { type: 'ns', c: g.p[0].hand[0], p: 0 }) && !E.lib.forbid(g, { type: 'ns', c: g.p[0].hand[0], p: 1 }), 'A blocked after 2, B not');
});
T('Necklace of Command draws when the equipped monster dies in battle', () => {
  const g = duel({ board: [{ hand: ['Necklace of Command'], m: ['Celtic Guardian'], turn: 2 }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Necklace of Command'); choose(g, 'Celtic Guardian'); auto(g);
  const h = g.p[0].hand.length; goBP(g); attack(g, on(g, 0, 'Celtic Guardian'), on(g, 1, 'Dark Magician'));
  auto(g, { ci: 0 });
  ok(inZ(g, 0, 'gy', 'Necklace of Command') && g.p[0].hand.length === h + 1, 'Necklace in the GY, drew 1');
});
T('Neko Mane King ends the opponent\'s turn', () => {
  const g = duel({ board: [{ hand: ['Raigeki'], m: ['Battle Ox'], turn: 2 }, { m: ['Neko Mane King'] }] });
  act(g, 0, 'Raigeki'); auto(g);
  ok(inZ(g, 1, 'gy', 'Neko Mane King') && g.noBP[0] && !hasOpt(g, 'bp'), 'no Battle Phase left');
  choose(g, 'end'); auto(g);
  ok(g.tp === 1, 'turn passed');
});
T('Newdoria destroys a monster when destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Battle Ox', 'Dark Magician'], turn: 2 }, { m: ['Newdoria'] }] });
  goBP(g); attack(g, on(g, 0, 'Battle Ox'), on(g, 1, 'Newdoria')); passAll(g); passAll(g);
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'pick'; i++) E.act(g, [g.prompt.opts.find(o => o.key === 'pass') ? 'pass' : g.prompt.opts[0].key]);
  choose(g, 'Dark Magician'); auto(g);
  ok(inZ(g, 0, 'gy', 'Dark Magician'), 'Dark Magician destroyed');
});
T('Nimble Momonga gains 1000 and summons more', () => {
  const g = duel({ main1: [...Array(38).fill(FILL), 'Nimble Momonga', 'Nimble Momonga'], board: [{ hand: [], m: ['Battle Ox'], turn: 2 }, { m: [{ n: 'Nimble Momonga', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Battle Ox'), on(g, 1, 'Nimble Momonga'));
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick' && pr.p === 1) E.act(g, pr.opts.slice(0, pr.max).map(o => o.key)); else E.act(g, [pr.opts.find(o => o.key === 'pass') ? 'pass' : pr.opts[0].key]); }
  ok(g.p[1].lp === 9000 && cnt(g, 1, 'm', 'Nimble Momonga') === 2, `B 9000 LP, 2 Momongas Set (${g.p[1].lp}, ${cnt(g, 1, 'm', 'Nimble Momonga')})`);
});
T('Ninja Grandmaster Sasuke destroys a face-up Defense monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Ninja Grandmaster Sasuke'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Ninja Grandmaster Sasuke'), on(g, 1, 'Mystical Elf')); auto(g);
  ok(inZ(g, 1, 'gy', 'Mystical Elf'), 'Mystical Elf destroyed');
});
T('Ninjitsu Art of Decoy protects a Ninja in battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Strike Ninja'], st: ['Ninjitsu Art of Decoy'] }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Ninjitsu Art of Decoy'); auto(g);
  ok(E.lib.has(g, on(g, 0, 'Strike Ninja'), 'noBattleDestroy'), 'Strike Ninja can\'t be destroyed by battle');
});
T('Ninjitsu Art of Transformation: Ninja into a Beast; it dies when the Trap leaves', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Strike Ninja'], st: ['Ninjitsu Art of Transformation'], deckTop: ['Nimble Momonga'] }, {}] });
  act(g, 0, 'Ninjitsu Art of Transformation'); auto(g);
  ok(!!on(g, 0, 'Nimble Momonga') && inZ(g, 0, 'gy', 'Strike Ninja'), 'Nimble Momonga (Beast) summoned');
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(!on(g, 0, 'Nimble Momonga'), 'the Beast is destroyed with the Trap');
});
T('Nitro Unit burns the opponent for the monster\'s ATK', () => {
  const g = duel({ board: [{ hand: ['Nitro Unit'], m: ['Dark Magician'], turn: 2 }, { m: ['Battle Ox'] }] });
  act(g, 0, 'Nitro Unit'); auto(g);
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Battle Ox')); auto(g);
  ok(g.p[1].lp === 8000 - 800 - 1700, `B took 800 + 1700 (B ${g.p[1].lp})`);
});
T('Nobleman-Eater Bug destroys 2 monsters', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Nobleman-Eater Bug', pos: 'set' }], turn: 2 }, { m: ['Battle Ox', 'Dark Magician'] }] });
  choose(g, 'flip:'); passAll(g); E.act(g, g.prompt.opts.filter(o => !o.label.includes('Nobleman')).map(o => o.key)); auto(g);
  ok(inZ(g, 1, 'gy', 'Battle Ox') && inZ(g, 1, 'gy', 'Dark Magician') && !!on(g, 0, 'Nobleman-Eater Bug'), 'both destroyed');
});
T("Novox's Prayer Ritual Summons Skull Guardian", () => {
  const g = duel({ board: [{ hand: ["Novox's Prayer", 'Skull Guardian', 'Dark Magician'] }, {}] });
  act(g, 0, "Novox's Prayer"); auto(g);
  ok(!!on(g, 0, 'Skull Guardian'), 'Skull Guardian summoned');
});
T('Nubian Guard returns a Continuous Spell to the top of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Nubian Guard'], gy: ['Morale Boost'], turn: 2 }, {}] });
  goBP(g); attack(g, on(g, 0, 'Nubian Guard'), null); auto(g);
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(E.name(top) === 'Morale Boost', 'Morale Boost on top');
});
T('Numinous Healer gains LP after damage', () => {
  const g = duel({ board: [{ hand: ['Ookazi'] }, { st: ['Numinous Healer'], gy: ['Numinous Healer'] }] });
  act(g, 0, 'Ookazi'); auto(g);
  ok(g.p[1].lp === 8000 - 800 + 1500, `B ${g.p[1].lp}`);
});
T('Nutrient Z gains 4000 before a 2000+ hit', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], turn: 2 }, { st: ['Nutrient Z'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), null);
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Nutrient'); i++) E.act(g, ['pass']);
  ok(hasOpt(g, 'Nutrient') && g.inDS, 'offered in the Damage Step'); choose(g, 'Nutrient'); auto(g);
  ok(g.p[1].lp === 8000 + 4000 - 2500, `B ${g.p[1].lp}`);
});
T('Nuvia the Wicked is destroyed when Normal Summoned; loses ATK', () => {
  const g = duel({ board: [{ hand: ['Nuvia the Wicked', 'Nuvia the Wicked'] }, { m: [FILL, FILL] }] });
  ns(g, 0, 'Nuvia the Wicked'); auto(g);
  ok(inZ(g, 0, 'gy', 'Nuvia the Wicked'), 'destroyed');
});

/* ----- O ----- */
T('Offerings to the Doomed skips the next Draw Phase', () => {
  const g = duel({ board: [{ hand: ['Offerings to the Doomed'] }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Offerings to the Doomed'); auto(g);
  ok(inZ(g, 1, 'gy', 'Dark Magician'), 'destroyed');
  choose(g, 'end'); auto(g); const hb = g.p[0].hand.length; choose(g, 'end'); auto(g);
  ok(g.tp === 0 && g.p[0].hand.length === hb, `A drew nothing (${g.p[0].hand.length} vs ${hb})`);
});
T('Old Vindictive Magician destroys on flip', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Old Vindictive Magician', pos: 'set' }], turn: 2 }, { m: ['Dark Magician'] }] });
  choose(g, 'flip:'); auto(g); ok(inZ(g, 1, 'gy', 'Dark Magician'), 'destroyed');
});
T('Ominous Fortunetelling calls a card in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Ominous Fortunetelling', pos: 'up' }] }, {}] });
  auto(g, { no: true }); choose(g, 'end'); auto(g); choose(g, 'end'); auto(g, { ci: 0 });
  ok(logHas(g, 'called Monster'), 'a call was made');
  ok(g.p[1].lp === 7300, `right call on an all-monster hand: 700 (B ${g.p[1].lp})`);
});
T('Ooguchi and Opti-Camouflage Armor attack directly', () => {
  const g = duel({ board: [{ hand: ['Opti-Camouflage Armor'], m: ['Ooguchi', 'Mokey Mokey'], turn: 2 }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Opti-Camouflage Armor'); choose(g, 'Mokey Mokey'); auto(g);
  goBP(g); ok(hasOpt(g, `atk:${on(g, 0, 'Ooguchi').u}:d`) && hasOpt(g, `atk:${on(g, 0, 'Mokey Mokey').u}:d`), 'both can attack directly');
});
T('Orca Mega-Fortress: Tribute Torpedo Fish to destroy a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Orca Mega-Fortress of Darkness', 'Torpedo Fish', 'Cannonball Spear Shellfish'] }, { m: ['Dark Magician'], st: ['Mirror Force'] }] });
  choose(g, 'Torpedo Fish: destroy'); choose(g, 'Dark Magician'); auto(g);
  choose(g, 'Shellfish: destroy'); choose(g, 'Face-down'); auto(g);
  ok(inZ(g, 1, 'gy', 'Dark Magician') && inZ(g, 1, 'gy', 'Mirror Force'), 'both destroyed');
});
T('Ordeal of a Traveler can bounce the attacker', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], turn: 2 }, { hand: ['Mirror Force'], st: [{ n: 'Ordeal of a Traveler', pos: 'up' }] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), null); auto(g, { ci: 0 });
  ok(inZ(g, 0, 'hand', 'Dark Magician') && g.p[1].lp === 8000, 'wrong call (Monster for a Trap): Dark Magician returned');
});
T('Order to Charge and Order to Smash', () => {
  const g = duel({ board: [{ hand: ['Order to Charge'], m: ['Battle Ox', 'Mokey Mokey'], st: ['Order to Smash'] }, { m: ['Dark Magician'], st: ['Mirror Force', 'Sakuretsu Armor'] }] });
  act(g, 0, 'Order to Charge'); choose(g, 'Battle Ox'); auto(g);
  ok(inZ(g, 0, 'gy', 'Battle Ox') && inZ(g, 1, 'gy', 'Dark Magician'), 'Charge: Battle Ox for Dark Magician');
  act(g, 0, 'Order to Smash'); autoMax(g);
  ok(inZ(g, 0, 'gy', 'Mokey Mokey') && inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Sakuretsu Armor'), 'Smash: Mokey Mokey for 2 Set cards');
});
T('Otohime changes a position, then returns to the hand', () => {
  const g = duel({ board: [{ hand: ['Otohime'] }, { m: ['Dark Magician'] }] });
  ns(g, 0, 'Otohime'); auto(g);
  ok(on(g, 1, 'Dark Magician').pos === 'def', 'Dark Magician in Defense Position');
  choose(g, 'end'); auto(g); ok(inZ(g, 0, 'hand', 'Otohime'), 'Otohime back in the hand');
  // "Cannot be Special Summoned" applies from anywhere (2026-11-27 summoning conditions; it was a GY-only lock)
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].hand.find(c => E.name(c) === 'Otohime'), p: 0 }) === true, 'can\u2019t be Special Summoned from the hand either');
});
T('Outstanding Dog Marron shuffles back into the Deck', () => {
  const g = duel({ board: [{ hand: ['Raigeki'] }, { m: ['Outstanding Dog Marron'] }] });
  act(g, 0, 'Raigeki'); auto(g);
  ok(g.p[1].deck.some(c => E.name(c) === 'Outstanding Dog Marron') && !inZ(g, 1, 'gy', 'Outstanding Dog Marron'), 'in the Deck');
});

/* ----- P ----- */
T('Painful Choice: 5 shown, 1 added, 4 to the GY', () => {
  const g = duel({ board: [{ hand: ['Painful Choice'] }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Painful Choice'); auto(g);
  ok(g.p[0].hand.length === h && cnt(g, 0, 'gy', FILL) === 4, '1 added, 4 in the GY');
});
T('Paladin of White Dragon: destroys a face-down; Tributes for Blue-Eyes that can\'t attack', () => {
  const g = duel({ main0: ['Blue-Eyes White Dragon', ...Array(39).fill(FILL)], board: [{ hand: [], m: ['Paladin of White Dragon'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Paladin of White Dragon'), g.p[1].m[0]); auto(g);
  ok(inZ(g, 1, 'gy', 'Mystical Elf') && g.p[1].lp === 8000, 'face-down Mystical Elf destroyed');
  choose(g, 'endbp'); auto(g);
  choose(g, 'Tribute: Special Summon'); auto(g);
  ok(!!on(g, 0, 'Blue-Eyes White Dragon') && E.lib.forbid(g, { type: 'attack', c: on(g, 0, 'Blue-Eyes White Dragon') }), 'Blue-Eyes summoned, can\'t attack');
});
T('Pandemonium: Archfiend search and no Standby payment', () => {
  const g = duel({ main0: ['Vilepawn Archfiend', ...Array(39).fill(FILL)], board: [{ hand: ['Offerings to the Doomed'], m: ['Archfiend Soldier'] }, {}] });
  const fz = E.lib.allCards ? null : null; void fz;
  g.p[0].fz = (() => { const c = { u: g.nextU++, id: C.find(x => x.n === 'Pandemonium').id, owner: 0, ctrl: 0, zone: 'fz', pos: 'up', mods: [], flags: {}, used: {}, attacks: 0, turnIn: 0 }; return c; })(); g.seq++;
  act(g, 0, 'Offerings to the Doomed'); auto(g);
  ok(inZ(g, 0, 'hand', 'Vilepawn Archfiend'), 'Vilepawn Archfiend added');
  const g2 = duel({ board: [{ hand: [], m: ['Skull Archfiend of Lightning'] }, {}] });
  g2.p[0].fz = { u: g2.nextU++, id: C.find(x => x.n === 'Pandemonium').id, owner: 0, ctrl: 0, zone: 'fz', pos: 'up', mods: [], flags: {}, used: {}, attacks: 0, turnIn: 0 }; g2.seq++;
  const lp0 = g2.p[0].lp; choose(g2, 'end'); auto(g2); choose(g2, 'end'); auto(g2);
  ok(g2.tp === 0 && g2.p[0].lp === lp0 && !!on(g2, 0, 'Skull Archfiend of Lightning'), `no 500 paid (A ${g2.p[0].lp})`);
});
T('Pandemonium Watchbear keeps Pandemonium from the opponent\'s MST', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'] }, { m: ['Pandemonium Watchbear'] }] });
  g.p[1].fz = { u: g.nextU++, id: C.find(x => x.n === 'Pandemonium').id, owner: 1, ctrl: 1, zone: 'fz', pos: 'up', mods: [], flags: {}, used: {}, attacks: 0, turnIn: 0 }; g.seq++;
  ns(g, 0, FILL); auto(g); act(g, 0, 'Heavy Storm'); auto(g);
  ok(g.p[1].fz && E.name(g.p[1].fz) === 'Pandemonium', 'Pandemonium stays');
});
T('Penalty Game! stops their Spells and Traps', () => {
  const g = duel({ board: [{ hand: [FILL, FILL, FILL, 'Pot of Greed'], turn: 2 }, { st: ['Penalty Game!'] }] });
  ns(g, 0, FILL); E.act(g, ['pass']); choose(g, 'Penalty Game!', 1); choose(g, 'Spell/Trap'); auto(g);
  ok(!hasOpt(g, 'a:' + g.p[0].hand.find(c => E.name(c) === 'Pot of Greed').u + ':'), 'Pot of Greed can\'t be activated');
});
T('Penguin Soldier returns up to 2 monsters', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Penguin Soldier', pos: 'set' }], turn: 2 }, { m: ['Battle Ox', 'Dark Magician'] }] });
  choose(g, 'flip:'); passAll(g); if (g.prompt.type === 'yesno') E.act(g, ['y']); E.act(g, g.prompt.opts.filter(o => !o.label.includes('Penguin')).map(o => o.key)); auto(g);
  ok(inZ(g, 1, 'hand', 'Battle Ox') && inZ(g, 1, 'hand', 'Dark Magician'), 'both returned');
});
T('Penumbral Soldier Lady +1000 against LIGHT in the Damage Step', () => {
  const g = duel({ board: [{ hand: [], m: ['Penumbral Soldier Lady'], turn: 2 }, { m: ['Mystical Elf'] }] });
  goBP(g); attack(g, on(g, 0, 'Penumbral Soldier Lady'), on(g, 1, 'Mystical Elf')); auto(g);
  ok(g.p[1].lp === 8000 - 2300, `3100 against 800 (B ${g.p[1].lp})`);
});
T('Perfect Machine King +500 per other Machine', () => {
  const g = duel({ board: [{ hand: [], m: ['Perfect Machine King', 'Patrol Robo'] }, { m: ['Patrol Robo'] }] });
  ok(E.atk(g, on(g, 0, 'Perfect Machine King')) === 3700, `3700 (${E.atk(g, on(g, 0, 'Perfect Machine King'))})`);
});
T('Peten the Dark Clown summons another Peten', () => {
  const g = duel({ main1: ['Peten the Dark Clown', ...Array(39).fill(FILL)], board: [{ hand: [], m: ['Battle Ox'], turn: 2 }, { m: ['Peten the Dark Clown'] }] });
  goBP(g); attack(g, on(g, 0, 'Battle Ox'), on(g, 1, 'Peten the Dark Clown')); auto(g);
  ok(inZ(g, 1, 'ban', 'Peten the Dark Clown') && !!on(g, 1, 'Peten the Dark Clown'), 'banished one, summoned another');
});
T("Pharaoh's Treasure: drawn, it brings a GY card back", () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: ["Pharaoh's Treasure"], gy: ['Dark Magician'] }, {}] });
  const t = g.p[0].st[0]; act(g, 0, "Pharaoh's Treasure"); auto(g);
  ok(t.zone === 'deck' && t.flags.f25ph, 'shuffled face-up into the Deck');
  const d = g.p[0].deck; d.splice(d.indexOf(t), 1); d.push(t);
  act(g, 0, 'Pot of Greed'); auto(g);
  ok(inZ(g, 0, 'gy', "Pharaoh's Treasure") && inZ(g, 0, 'hand', 'Dark Magician'), 'Treasure to the GY, Dark Magician to the hand');
});

/* ----- Goat only ----- */
{
  const vm = require('vm'), fs = require('fs'), path = require('path'); const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  for (const f of ['data/cards.js', 'goat/data/cards.js', 'js/engine.js', ...fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort().map(f => 'js/cards/' + f)]) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const G = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; G.init(GC, { format: 'goat' });
  const gid = n => { const c = GC.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
  const GF = 'Battle Ox'; const gduel = (o = {}) => G.newDuel({ decks: [0, 1].map(i => ({ name: 't', main: (o['main' + i] || Array(40).fill(GF)).map(gid), extra: [] })), first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
  const gauto = g => { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') G.act(g, ['pass']); else if (pr.type === 'yesno') G.act(g, ['y']); else if (pr.type === 'choose') G.act(g, [pr.opts[0].key]); else G.act(g, pr.opts.slice(0, Math.max(pr.min, 1)).map(x => x.key)); } };
  const gch = (g, s) => { const o = g.prompt.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(s.toLowerCase())); if (!o) throw new Error('no option ' + s + ': ' + g.prompt.opts.map(x => x.label + '[' + x.key + ']').join(', ')); G.act(g, [o.key]); };
  T('Goat: Morphing Jar #2 shuffles the field and excavates', () => {
    const g = gduel({ main1: [...Array(38).fill('Mystical Elf'), 'Dark Magician', 'Celtic Guardian'], board: [{ hand: [], m: [{ n: 'Morphing Jar #2', pos: 'set' }, 'Battle Ox'], turn: 2 }, { m: ['Dark Magician'] }] });
    gch(g, 'flip:'); gauto(g);
    const a = g.p[0].m.filter(Boolean), b = g.p[1].m.filter(Boolean);
    ok(a.length === 2 && a.every(c => c.pos === 'set') && b.length === 1 && b.every(c => c.pos === 'set'), `A 2 Set, B 1 Set (${a.length}, ${b.length})`);
  });
  T('Goat: Mushroom Man #2 costs 300 a Standby and changes control for 500', () => {
    const g = gduel({ board: [{ hand: [], m: ['Mushroom Man #2'] }, {}] });
    gch(g, 'end'); gauto(g);
    ok(g.p[1].m.some(c => c && G.name(c) === 'Mushroom Man #2') && g.p[0].lp === 8000 - 300 - 500, `control moved, A lost 300 and paid 500 (${g.p[0].lp})`);
    ok(g.p[1].lp === 7700, `B lost 300 in their Standby (${g.p[1].lp})`);
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-25 checks passed.');
process.exit(fails ? 1 : 0);
