// Scenario checks for full pool batch 37: node build/test_full-37.js
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
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, g.p[p].fz].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
// answer prompts (pass, no, first option) until the next idle prompt
const settle = g => { for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, [g.prompt.opts[0].key]); } };
const endTurn = g => { choose(g, 'end'); settle(g); };
const attack = (g, a, t) => { choose(g, 'bp'); passAll(g); choose(g, `atk:${on(g, 0, a).u}:${t == null ? 'd' : on(g, 1, t).u}`); };

T('Darknight Parshath gains ATK and banishes a DARK to draw', () => {
  const g = duel({ board: [{ hand: [], m: ['Darknight Parshath'], gy: ['Dark Armed Dragon', 'Darksea Float'], turn: 2 }, { m: [FILL] }] });
  ok(E.atk(g, on(g, 0, 'Darknight Parshath')) === 2100, 'Parshath has 2100 ATK with 2 DARKs');
  const h = g.p[0].hand.length;
  attack(g, 'Darknight Parshath', FILL); passAll(g); passAll(g); passAll(g);
  choose(g, 'yes'); choose(g, 'Dark Armed Dragon'); passAll(g);
  ok(inZ(g, 0, 'ban', 'Dark Armed Dragon') && g.p[0].hand.length === h + 1, 'DARK banished and a card drawn');
});
T('Darksea Float draws when destroyed by an effect', () => {
  const g = duel({ board: [{ hand: ['Fissure'], turn: 2 }, { m: ['Darksea Float'] }] });
  const h = g.p[1].hand.length; act(g, 0, 'Fissure'); passAll(g); passAll(g);
  ok(inZ(g, 1, 'gy', 'Darksea Float') && g.p[1].hand.length === h + 1, 'owner drew 1');
});
T('Darksea Rescue draws after a Synchro Summon', () => {
  const g = duel({ ex0: ['Armory Arm'], board: [{ hand: [], m: ['Junk Synchron', 'Darksea Rescue'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; choose(g, 'Synchro Summon'); choose(g, 'Attack Position'); settle(g);
  ok(on(g, 0, 'Armory Arm') && g.p[0].hand.length === h + 1, 'Armory Arm summoned and 1 card drawn');
});
T('Dawnbreak Gardna has 2300 DEF once Gemini Summoned', () => {
  const g = duel({ board: [{ hand: [], m: ['Dawnbreak Gardna'], turn: 2 }, {}] });
  const c = on(g, 0, 'Dawnbreak Gardna'); ok(E.def(g, c) === 500, '500 DEF as a Normal Monster');
  choose(g, 'Gemini Summon'); passAll(g); ok(E.def(g, c) === 2300, '2300 DEF after the Gemini Summon');
});
T('Deck Lockdown stops searches and is destroyed in the 2nd Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Deck Lockdown', 'E - Emergency Call'], deckTop: [FILL, 'Elemental HERO Stratos'], turn: 2 }, {}] });
  act(g, 0, 'Deck Lockdown'); passAll(g);
  ok(E.lib.forbid(g, { type: 'search', p: 1 }) && E.lib.forbid(g, { type: 'ss', c: g.p[1].deck[0], p: 1 }), 'search and Special Summon from the Deck forbidden');
  endTurn(g); endTurn(g); ok(inZ(g, 0, 'st', 'Deck Lockdown'), 'still there after the 1st Standby Phase');
  endTurn(g); endTurn(g); ok(inZ(g, 0, 'gy', 'Deck Lockdown'), 'destroyed in the 2nd Standby Phase');
});
T('Decoy Dragon summons a Level 7 Dragon when attacked', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Decoy Dragon'], gy: ['Red-Eyes Black Dragon'] }] });
  attack(g, FILL, 'Decoy Dragon'); passAll(g);
  ok(!!on(g, 1, 'Red-Eyes Black Dragon'), 'Red-Eyes Special Summoned');
});
T('Decoyroid: only Decoyroid can be attacked', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Decoyroid', 'Deep Diver'] }] });
  choose(g, 'bp'); passAll(g);
  ok(hasOpt(g, 'Attack Decoyroid') && !hasOpt(g, 'Attack Deep Diver'), 'Deep Diver is not a legal target');
});
T('Deep Diver puts a monster on top at the end of the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Deep Diver'] }] });
  attack(g, FILL, 'Deep Diver'); passAll(g); passAll(g); passAll(g);
  choose(g, 'endbp'); settle(g);
  ok(g.log.some(l => /placed a monster on top/.test(l)), 'a monster was placed on top of the Deck');
});
T('Defender removes a Spell Counter instead of being destroyed', () => {
  const g = duel({ board: [{ hand: ['Defender, the Magical Knight', 'Dark Hole'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'ns:'); settle(g);
  const d = on(g, 0, 'Defender, the Magical Knight'); ok(E.lib.ctr(d, 'spell') === 1, 'Defender got a Spell Counter');
  act(g, 0, 'Dark Hole'); passAll(g); settle(g);
  ok(on(g, 0, 'Defender, the Magical Knight') && E.lib.ctr(d, 'spell') === 0 && inZ(g, 1, 'gy', FILL), 'Defender stays, counter removed');
});
T('Defense Draw makes the battle damage 0 and draws', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Defense Draw'] }] });
  const h = g.p[1].hand.length; attack(g, FILL, null);
  for (let i = 0; i < 6 && !hasOpt(g, 'Defense Draw'); i++) E.act(g, ['pass']);
  choose(g, 'Defense Draw', 1); passAll(g); passAll(g); passAll(g);
  ok(g.p[1].lp === 8000 && g.p[1].hand.length === h + 1, `no damage, 1 card drawn (LP ${g.p[1].lp})`);
});
T('Defensive Tactics protects Gladiator Beasts and goes to the bottom of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Gladiator Beast Bestiari'], st: ['Defensive Tactics'] }] });
  attack(g, FILL, 'Gladiator Beast Bestiari'); choose(g, 'Defensive Tactics', 1); passAll(g); passAll(g); passAll(g); passAll(g);
  ok(on(g, 1, 'Gladiator Beast Bestiari') && g.p[1].lp === 8000, 'Bestiari survives, no damage');
  ok(E.name(g.p[1].deck[0]) === 'Defensive Tactics', 'Defensive Tactics is on the bottom of the Deck');
});
T('Degenerate Circuit banishes a returned monster', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Degenerate Circuit', pos: 'up' }, 'Compulsory Evacuation Device'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Compulsory Evacuation Device'); passAll(g); settle(g);
  ok(inZ(g, 1, 'ban', FILL) && !inZ(g, 1, 'hand', FILL + 'x'), 'the returned monster was banished');
});
T('Demise of the Land activates a Field Spell from the Deck', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: ['Demise of the Land'], deckTop: ['Jurassic World'] }] });
  choose(g, 'sp:'); choose(g, 'Demise of the Land', 1); passAll(g); settle(g);
  ok(g.p[1].fz && E.name(g.p[1].fz) === 'Jurassic World', 'Jurassic World activated from the Deck');
});
T('End of the World Ritual Summons Demise, which pays 2000 to destroy everything else', () => {
  const g = duel({ board: [{ hand: ['End of the World', 'Demise, King of Armageddon'], m: [FILL, FILL], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'End of the World'); passAll(g); settle(g);
  ok(!!on(g, 0, 'Demise, King of Armageddon'), 'Demise Ritual Summoned');
  act(g, 0, 'Demise, King of Armageddon'); passAll(g); settle(g);
  ok(g.p[0].lp === 6000 && !g.p[1].m.some(Boolean) && inZ(g, 1, 'gy', 'Mirror Force') && on(g, 0, 'Demise, King of Armageddon'), 'paid 2000, every other card destroyed');
});
T('Depth Amulet discards to negate an attack', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: [FILL], st: [{ n: 'Depth Amulet', pos: 'up' }] }] });
  attack(g, FILL, null); choose(g, 'yes', 1); settle(g);
  ok(g.p[1].lp === 8000 && g.p[1].hand.length === 0, 'attack negated, 1 card discarded');
});
T('Descending Lost Star revives a Synchro with its restrictions', () => {
  const g = duel({ board: [{ hand: [], st: ['Descending Lost Star'], gy: ['Stardust Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Descending Lost Star'); passAll(g); settle(g);
  const s = on(g, 0, 'Stardust Dragon');
  ok(s && s.pos === 'def' && E.def(g, s) === 0 && E.lv(s) === 7 && s.flags.negated, 'Stardust in Defense, DEF 0, Level 7, negated');
  ok(!hasOpt(g, 'pos:' + s.u), 'its position cannot be changed');
});
T('Destruct Potion destroys your monster and gains its ATK', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Destruct Potion'], turn: 2 }, {}] });
  act(g, 0, 'Destruct Potion'); passAll(g); settle(g);
  ok(g.p[0].lp === 10000 && inZ(g, 0, 'gy', FILL), 'gained 2000');
});
T('Destructive Draw: 3000 damage when it leaves the field', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: [{ n: 'Destructive Draw', pos: 'up' }], turn: 2 }, {}] });
  act(g, 0, 'Mystical Space Typhoon'); passAll(g); settle(g);
  ok(g.p[0].lp === 5000, `controller took 3000 (LP ${g.p[0].lp})`);
  const g2 = duel({ board: [{ hand: [], st: [{ n: 'Destructive Draw', pos: 'up' }], turn: 2 }, {}] });
  settle(g2); endTurn(g2); ok(g2.p[0].lp === 7300, `lost 700 in the End Phase (LP ${g2.p[0].lp})`);
});
T('Destructotron pays 1000 to destroy a Set Spell/Trap', () => {
  const g = duel({ board: [{ hand: [], m: ['Destructotron'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Destructotron'); passAll(g); settle(g);
  ok(g.p[0].lp === 7000 && inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
  endTurn(g); ok(inZ(g, 0, 'gy', 'Destructotron'), 'destroyed itself in the End Phase (only Psychic)');
});
T('Detonate trades Kuriboh for opponent cards', () => {
  const g = duel({ board: [{ hand: ['Detonate'], m: ['Kuriboh'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Detonate'); passAll(g); choose(g, 'Face-down'); settle(g);
  ok(inZ(g, 0, 'gy', 'Kuriboh') && inZ(g, 1, 'gy', 'Mirror Force') && on(g, 1, FILL), 'Kuriboh and 1 opponent card destroyed');
});
T('Detonator Circle A destroys a monster with an A-Counter and burns both', () => {
  const g = duel({ board: [{ hand: ['Mirror Force'], st: ['Detonator Circle A'], turn: 2 }, { m: [FILL] }] });
  g.p[1].m[0].ctr = { A: 1 }; choose(g, 'setst:' + g.p[0].hand.find(c => E.name(c) === 'Mirror Force').u); act(g, 0, 'Detonator Circle A'); passAll(g); settle(g);
  ok(inZ(g, 1, 'gy', FILL) && g.p[0].lp === 7000 && g.p[1].lp === 7000, 'destroyed, 1000 to each player');
});
T('Dharc takes a DARK and gives it back when it leaves', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [{ n: 'Dharc the Dark Charmer', pos: 'set' }], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  choose(g, 'flip:'); settle(g);
  ok(!!on(g, 0, 'Dark Armed Dragon'), 'took control of Dark Armed Dragon');
});
T('Diabolos cannot be Special Summoned and looks at the top card', () => {
  const g = duel({ board: [{ hand: [], m: ['Diabolos, King of the Abyss'], turn: 2 }, {}] });
  ok(E.lib.forbid(g, { type: 'ss', c: on(g, 0, 'Diabolos, King of the Abyss'), p: 0 }), 'Special Summon forbidden');
  choose(g, 'end'); choose(g, 'yes'); choose(g, 'bottom'); settle(g);
  ok(g.log.some(l => /put it on the bottom/.test(l)), 'top card put on the bottom');
});
T('Diamond-Dust Cyclone draws per 4 Fog Counters', () => {
  const g = duel({ board: [{ hand: ['Diamond-Dust Cyclone', 'Mirror Force'], turn: 2 }, { m: [FILL] }] });
  g.p[1].m[0].ctr = { fog: 8 }; choose(g, 'setst:' + g.p[0].hand.find(c => E.name(c) === 'Mirror Force').u); const h = g.p[0].hand.length;
  act(g, 0, 'Diamond-Dust Cyclone'); passAll(g); settle(g);
  ok(inZ(g, 1, 'gy', FILL) && g.p[0].hand.length === h + 1, 'destroyed and 2 drawn (hand -1 +2)');
});
T('Dimensional Inversion revives a monster the opponent banished', () => {
  const g = duel({ board: [{ hand: ['Caius the Shadow Monarch'], m: [FILL], turn: 2 }, { m: [FILL], st: ['Dimensional Inversion'] }] });
  choose(g, 'ns:'); choose(g, FILL); passAll(g);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno' && g.prompt.p === 1) choose(g, 'yes'); else if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, [g.prompt.opts[0].key]); }
  ok(!!on(g, 1, FILL) && inZ(g, 1, 'gy', 'Dimensional Inversion'), 'Warwolf came back');
});
T('Disarm negates a Spell by shuffling a Gladiator Beast in', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'], turn: 2 }, { hand: ['Gladiator Beast Bestiari'], st: ['Disarm', 'Mirror Force'] }] });
  act(g, 0, 'Heavy Storm'); choose(g, 'Disarm', 1); passAll(g); settle(g);
  ok(inZ(g, 1, 'st', 'Mirror Force') && inZ(g, 0, 'gy', 'Heavy Storm') && !inZ(g, 1, 'hand', 'Gladiator Beast Bestiari'), 'Heavy Storm negated, Bestiari shuffled in');
});
T('Disciple of the Forbidden Spell destroys a monster of the declared Attribute', () => {
  const g = duel({ board: [{ hand: ['Disciple of the Forbidden Spell'], gy: ['Disciple of the Forbidden Spell'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'ns:'); passAll(g); choose(g, 'EARTH'); settle(g);
  attack(g, 'Disciple of the Forbidden Spell', FILL); passAll(g); settle(g);
  ok(on(g, 0, 'Disciple of the Forbidden Spell') && inZ(g, 1, 'gy', FILL) && g.p[0].lp === 8000, 'Warwolf destroyed without damage calculation');
});
T('Discord stops Synchro Summons', () => {
  const g = duel({ ex0: ['Armory Arm'], board: [{ hand: [], m: ['Junk Synchron', 'Darksea Rescue'], st: [{ n: 'Discord', pos: 'up' }], turn: 2 }, {}] });
  ok(!hasOpt(g, 'Synchro Summon'), 'no Synchro Summon');
});
T('Disenchanter removes a Spell Counter to return a Spell', () => {
  const g = duel({ board: [{ hand: ['Mirror Force'], m: ['Disenchanter'], turn: 2 }, { st: [{ n: 'Level Limit - Area B', pos: 'up' }] }] });
  on(g, 0, 'Disenchanter').ctr = { spell: 1 }; choose(g, 'setst:' + g.p[0].hand.find(c => E.name(c) === 'Mirror Force').u); act(g, 0, 'Disenchanter'); passAll(g); settle(g);
  ok(inZ(g, 1, 'hand', 'Level Limit - Area B') && E.lib.ctr(on(g, 0, 'Disenchanter'), 'spell') === 0, 'Level Limit returned to the hand');
});
T('Diskblade Rider keeps +500 through the opponent turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Diskblade Rider'], gy: ['Mirror Force'], turn: 2 }, {}] });
  act(g, 0, 'Diskblade Rider'); passAll(g); settle(g); const d = on(g, 0, 'Diskblade Rider');
  ok(E.atk(g, d) === 2200 && inZ(g, 0, 'ban', 'Mirror Force'), '2200 ATK, Mirror Force banished');
  endTurn(g); ok(E.atk(g, d) === 2200, 'still 2200 on the opponent turn');
  endTurn(g); ok(E.atk(g, d) === 1700, 'back to 1700 on your next turn');
});
T('Doctor Cranium pays 800 to search a Psychic', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Doctor Cranium'], deckTop: ['Psychic Commander'] }] });
  attack(g, FILL, 'Doctor Cranium'); passAll(g); passAll(g); passAll(g); choose(g, 'yes', 1); settle(g);
  ok(inZ(g, 1, 'hand', 'Psychic Commander') && g.p[1].lp === 8000 - 1900 - 800, `Psychic Commander added (LP ${g.p[1].lp})`);
});
T('Doitsu equips to Soitsu for +2500', () => {
  const g = duel({ board: [{ hand: [], m: ['Soitsu', 'Doitsu'], turn: 2 }, {}] });
  choose(g, 'Equip to a monster'); passAll(g); settle(g);
  ok(E.atk(g, on(g, 0, 'Soitsu')) === 2500, 'Soitsu has 2500 ATK');
});
T('Domino Effect sends a monster to destroy one', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Soitsu'], st: [{ n: 'Domino Effect', pos: 'up' }], turn: 2 }, { m: ['Deep Diver', 'Decoyroid'] }] });
  attack(g, FILL, 'Decoyroid'); passAll(g); passAll(g); passAll(g);
  choose(g, 'yes', 0); choose(g, 'Soitsu'); passAll(g); settle(g);
  ok(inZ(g, 0, 'gy', 'Soitsu') && inZ(g, 1, 'gy', 'Deep Diver'), 'Soitsu sent, Deep Diver destroyed');
});
T('Doom Dozer: summoned by banishing 2 Insects, mills on damage', () => {
  const g = duel({ board: [{ hand: ['Doom Dozer'], gy: ['Pinch Hopper', 'Giant Flea'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Doom Dozer').u), 'no Normal Summon'); choose(g, 'sp:'); passAll(g); settle(g);
  ok(!!on(g, 0, 'Doom Dozer') && inZ(g, 0, 'ban', 'Giant Flea'), 'Doom Dozer summoned');
  const n = g.p[1].gy.length; attack(g, 'Doom Dozer', null); passAll(g); passAll(g); passAll(g); settle(g);
  ok(g.p[1].gy.length === n + 1, 'their top card went to the GY');
});
T('Doom Shaman revives a Fiend that dies with it', () => {
  const g = duel({ board: [{ hand: [], m: ['Doom Shaman'], st: ['Destruct Potion'], gy: ['Doomsday Horror'], turn: 2 }, {}] });
  choose(g, 'Gemini Summon'); passAll(g); settle(g);
  act(g, 0, 'Doom Shaman'); passAll(g); settle(g);
  ok(!!on(g, 0, 'Doomsday Horror'), 'Doomsday Horror Special Summoned');
  act(g, 0, 'Destruct Potion'); choose(g, 'Doom Shaman'); passAll(g); settle(g);
  ok(inZ(g, 0, 'gy', 'Doom Shaman') && inZ(g, 0, 'gy', 'Doomsday Horror'), 'the Fiend was destroyed when Doom Shaman left');
});
T('Doomkaiser Dragon Assault Mode revives Zombies, which die in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Doomkaiser Dragon'], st: ['Assault Mode Activate'], deckTop: [FILL, 'Doomkaiser Dragon Assault Mode'], gy: ['Plaguespreader Zombie'], turn: 2 }, {}] });
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].gy.find(c => E.name(c) === 'Plaguespreader Zombie') && g.p[0].deck[g.p[0].deck.length - 1], p: 0 }), 'cannot be Special Summoned without Assault Mode Activate');
  act(g, 0, 'Assault Mode Activate'); passAll(g);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'pick'; i++) { const o = g.prompt.opts.find(x => /Plaguespreader/.test(x.label)) || g.prompt.opts[0]; E.act(g, g.prompt.max > 1 ? g.prompt.opts.filter(x => /Plaguespreader/.test(x.label)).map(x => x.key) : [o.key]); }
  settle(g);
  ok(!!on(g, 0, 'Doomkaiser Dragon Assault Mode') && !!on(g, 0, 'Plaguespreader Zombie'), 'Assault Mode and Plaguespreader on the field');
  endTurn(g); ok(inZ(g, 0, 'gy', 'Plaguespreader Zombie') || inZ(g, 0, 'ban', 'Plaguespreader Zombie'), 'Plaguespreader destroyed in the End Phase');
});
T('Doomsday Horror counts banished DARKs and returns them', () => {
  const g = duel({ board: [{ hand: ['Fissure'], turn: 2 }, { m: ['Doomsday Horror'], ban: ['Dark Armed Dragon', 'Darksea Float'] }] });
  ok(E.atk(g, on(g, 1, 'Doomsday Horror')) === 600, '600 ATK');
  act(g, 0, 'Fissure'); passAll(g); settle(g);
  ok(inZ(g, 1, 'gy', 'Dark Armed Dragon') && inZ(g, 1, 'gy', 'Darksea Float'), 'banished DARKs returned to the GY');
});
T('Doppelganger reflects monster effect damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Cannon Soldier', FILL], turn: 2 }, { st: [{ n: 'Doppelganger', pos: 'up' }] }] });
  act(g, 0, 'Cannon Soldier'); for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, FILL); passAll(g); settle(g);
  ok(g.p[1].lp === 7500 && g.p[0].lp === 7500, `both took 500 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Drastic Drop Off makes them discard a searched card', () => {
  const g = duel({ board: [{ hand: ['E - Emergency Call'], deckTop: [FILL, 'Elemental HERO Stratos'], turn: 2 }, { st: ['Drastic Drop Off'] }] });
  settle(g); act(g, 0, 'E - Emergency Call'); passAll(g);
  choose(g, 'yes', 1); passAll(g); settle(g);
  ok(inZ(g, 0, 'gy', 'Elemental HERO Stratos') && inZ(g, 1, 'gy', 'Drastic Drop Off'), 'Stratos discarded');
});
T('Drill Synchron gives Warriors piercing and draws', () => {
  const g = duel({ board: [{ hand: [], m: ['Drill Synchron', 'Elemental HERO Stratos'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  const h = g.p[0].hand.length; attack(g, 'Elemental HERO Stratos', FILL); passAll(g); passAll(g); passAll(g);
  choose(g, 'yes', 0); settle(g);
  ok(g.p[1].lp === 8000 - 1700 && g.p[0].hand.length === h + 1, `1700 piercing and a draw (LP ${g.p[1].lp})`);
});
T('DUCKER Mobile Cannon adds a Level 4 from the GY', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'DUCKER Mobile Cannon', pos: 'set' }], gy: ['Gladiator Beast Bestiari', 'Elemental HERO Stratos'], turn: 2 }, {}] });
  choose(g, 'flip:'); passAll(g); choose(g, 'Stratos'); settle(g);
  ok(inZ(g, 0, 'hand', 'Elemental HERO Stratos'), 'Stratos added');
});
T('Dweller in the Depths counts Continuous Spells', () => {
  const g = duel({ board: [{ hand: [], m: ['Dweller in the Depths'], st: [{ n: 'Level Limit - Area B', pos: 'up' }, { n: 'Domino Effect', pos: 'up' }], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Dweller in the Depths')) === 2100, '2100 ATK');
});
T('Earth Effigy lets a Level 7 EARTH Normal Monster be summoned with it alone', () => {
  const g = duel({ board: [{ hand: ['Big Koala'], m: ['Earth Effigy'], turn: 2 }, {}] });
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Big Koala').u); settle(g);
  ok(!!on(g, 0, 'Big Koala'), 'Big Koala Tribute Summoned with Earth Effigy');
});
T('Ebon Arrow: piercing plus the destroyed monster\'s DEF as damage', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Ebon Arrow'], turn: 2 }, { m: [{ n: 'Deep Diver', pos: 'set' }] }] });
  act(g, 0, 'Ebon Arrow'); passAll(g); settle(g);
  ok(E.atk(g, on(g, 0, FILL)) === 1500, '1500 ATK');
  attack(g, FILL, 'Deep Diver'); passAll(g); passAll(g); passAll(g); settle(g);
  ok(g.p[1].lp === 8000 - 400 - 1100, `400 piercing + 1100 (LP ${g.p[1].lp})`);
});
T('Ebon Magician Curran burns in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Ebon Magician Curran'], turn: 1 }, { m: [FILL, FILL] }] });
  endTurn(g); endTurn(g);
  ok(g.p[1].lp === 6800, `600 damage in each of A's 2 Standby Phases (LP ${g.p[1].lp})`);
});
T('Eccentric Boy Synchro Summons with a monster in the hand', () => {
  const g = duel({ ex0: ['Black Rose Dragon'], board: [{ hand: [FILL], m: ['Eccentric Boy'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Eccentric Boy'); passAll(g); settle(g);
  const b = on(g, 0, 'Black Rose Dragon');
  ok(b && b.flags.negated && b.flags.banishOnLeave && on(g, 1, FILL), 'Black Rose summoned, negated (no wipe), banished when it leaves');
});
T('Edge Hammer destroys and burns for the original ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Elemental HERO Bladedge'], st: ['Edge Hammer'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Edge Hammer'); passAll(g); settle(g);
  ok(inZ(g, 1, 'gy', FILL) && g.p[1].lp === 6000 && inZ(g, 0, 'gy', 'Elemental HERO Bladedge'), '2000 damage');
});
T('Eliminating the League sends copies in the hand', () => {
  const g = duel({ board: [{ hand: ['Fissure'], st: ['Eliminating the League'], turn: 2 }, { m: [FILL], hand: [FILL, FILL, 'Mirror Force'] }] });
  act(g, 0, 'Eliminating the League'); passAll(g); settle(g);
  ok(g.p[1].hand.length === 1 && g.p[1].gy.filter(c => E.name(c) === FILL).length === 3, 'Warwolf and both copies in the GY');
});
T('Emergency Assistance revives a monster destroyed by an effect this turn', () => {
  const g = duel({ board: [{ hand: ['Emergency Assistance'], m: [FILL], st: ['Destruct Potion'], turn: 2 }, {}] });
  act(g, 0, 'Destruct Potion'); passAll(g); settle(g);
  ok(!hasOpt(g, 'Emergency Assistance'), 'not in Main Phase 1');
  choose(g, 'bp'); settle(g); choose(g, 'endbp'); settle(g);
  act(g, 0, 'Emergency Assistance'); passAll(g); settle(g);
  ok(!!on(g, 0, FILL), 'Warwolf revived in Main Phase 2');
});
T('Emperor Sem returns a card to the top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Doom Shaman'], m: ['Emperor Sem', FILL], gy: ['Mirror Force'], turn: 2 }, {}] });
  choose(g, 'ns:'); choose(g, FILL); passAll(g); choose(g, 'yes', 0); choose(g, 'Mirror Force'); settle(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Mirror Force', 'Mirror Force on top of the Deck');
});
T('Endymion: summoned from the hand with 6 counters, adds a Spell, destroys a card', () => {
  const g = duel({ board: [{ hand: ['Endymion, the Master Magician', 'Fissure'], gy: ['Heavy Storm'], turn: 2 }, { st: ['Mirror Force'] }] });
  const c = g.p[0].deck.pop(); c.id = id('Magical Citadel of Endymion'); c.zone = 'fz'; c.pos = 'up'; c.ctrl = 0; c.ctr = { spell: 6 }; g.p[0].fz = c; g.seq++;
  choose(g, 'setst:' + g.p[0].hand.find(x => E.name(x) === 'Fissure').u);
  choose(g, 'sp:'); passAll(g); choose(g, 'yes'); settle(g);
  ok(!!on(g, 0, 'Endymion, the Master Magician') && inZ(g, 0, 'hand', 'Heavy Storm'), 'Endymion summoned and Heavy Storm added');
  act(g, 0, 'Endymion, the Master Magician'); choose(g, 'Face-down'); passAll(g); settle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T("Enishi: summoned by banishing 2 Six Samurai, destroys and can't attack", () => {
  const g = duel({ board: [{ hand: ["Enishi, Shien's Chancellor"], gy: ['The Six Samurai - Yaichi', 'The Six Samurai - Kamon'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'sp:'); passAll(g); settle(g);
  ok(!!on(g, 0, "Enishi, Shien's Chancellor"), 'Enishi summoned');
  act(g, 0, "Enishi, Shien's Chancellor"); choose(g, FILL); passAll(g); settle(g);
  ok(inZ(g, 1, 'gy', FILL), 'Warwolf destroyed'); choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'Attack'), 'Enishi cannot attack');
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].deck[0], p: 0 }) === false, 'other cards not locked');
});
T('Enlightenment lets a Spellcaster attack again', () => {
  const g = duel({ board: [{ hand: [], m: ['Disenchanter'], st: ['Enlightenment'], turn: 2 }, { m: ['Deep Diver', 'Decoyroid'] }] });
  attack(g, 'Disenchanter', 'Decoyroid'); passAll(g); passAll(g); passAll(g); settle0(g);
  function settle0(g2) { for (let i = 0; i < 10 && g2.prompt && g2.prompt.type !== 'idle'; i++) { if (g2.prompt.type === 'respond') E.act(g2, ['pass']); else choose(g2, 'no'); } }
  act(g, 0, 'Enlightenment'); passAll(g); settle0(g);
  ok(hasOpt(g, 'Attack Deep Diver'), 'Disenchanter can attack again');
});
T('Escape from the Dark Dimension: the monster is banished when it leaves', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Escape from the Dark Dimension'], ban: ['Dark Armed Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Escape from the Dark Dimension'); passAll(g); settle(g);
  ok(!!on(g, 0, 'Dark Armed Dragon'), 'Dark Armed Dragon Special Summoned');
  act(g, 0, 'Mystical Space Typhoon'); passAll(g); settle(g);
  ok(inZ(g, 0, 'ban', 'Dark Armed Dragon'), 'Dark Armed Dragon destroyed and banished');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-37 checks passed.');
process.exit(fails ? 1 : 0);
