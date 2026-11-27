// Scenario checks for full pool batch 41: node build/test_full-41.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
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
// pass every response window and say yes to every optional effect until a pick, choose or idle prompt
const settle = g => { for (let i = 0; i < 40 && g.prompt && ['respond', 'yesno'].includes(g.prompt.type); i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else choose(g, 'yes'); } };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const attack = (g, a, tn) => { choose(g, 'atk:' + on(g, 0, a).u + ':' + (tn === 'd' ? 'd' : on(g, 1, tn).u)); };
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

T('Magnetic Mosquito destroys face-up Machines when flipped', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Magnetic Mosquito', pos: 'set' }], turn: 2 }, { m: ['Cyber Dragon', FILL] }] });
  choose(g, 'Flip Summon'); settle(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && on(g, 1, FILL), 'Cyber Dragon destroyed, Warwolf stays');
});
T('Maiden of Macabre gets a Spell Counter for a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Maiden of Macabre'], turn: 2 }, { m: ['Hand of Nephthys'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Maiden of Macabre', 'Hand of Nephthys'); settle(g);
  const m = on(g, 0, 'Maiden of Macabre'); ok(m && E.atk(g, m) === 1900, `Maiden has 1900 ATK (${m && E.atk(g, m)})`);
});
T('Makiu destroys monsters with DEF up to the Thunder monster\'s ATK and skips the Battle Phase', () => {
  const g = duel({ board: [{ hand: ['Makiu, the Magical Mist'], m: ['Zaborg the Thunder Monarch'], turn: 2 }, { m: ['Cyber Dragon', FILL, 'Big Shield Gardna'] }] });
  act(g, 0, 'Makiu, the Magical Mist'); settle(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && inZ(g, 1, 'gy', FILL) && on(g, 1, 'Big Shield Gardna'), 'DEF 1600 and 100 destroyed, DEF 2600 stays');
  ok(!hasOpt(g, 'Battle Phase'), 'no Battle Phase');
});
T('Malefic Blue-Eyes: summon rule, attack lock, destroyed with no Field Spell', () => {
  const g = duel({ board: [{ hand: ['Malefic Blue-Eyes White Dragon', 'Sogen'], m: [FILL], deckTop: [FILL, 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Malefic Blue-Eyes White Dragon').u), 'cannot be Normal Summoned');
  act(g, 0, 'Sogen'); settle(g);
  choose(g, 'Special Summon (banish'); settle(g);
  const m = on(g, 0, 'Malefic Blue-Eyes White Dragon');
  ok(m && inZ(g, 0, 'ban', 'Blue-Eyes White Dragon'), 'summoned by banishing Blue-Eyes from the Deck');
  ok(E.lib.forbid(g, { type: 'attack', c: on(g, 0, FILL) }) && !E.lib.forbid(g, { type: 'attack', c: m }), 'only Malefic can attack');
  const g2 = duel({ board: [{ hand: ['Malefic Blue-Eyes White Dragon'], deckTop: [FILL, 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  choose(g2, 'Special Summon (banish'); settle(g2);
  ok(inZ(g2, 0, 'gy', 'Malefic Blue-Eyes White Dragon'), 'destroyed with no Field Spell');
  const mal = g2.p[0].gy.find(c => E.name(c) === 'Malefic Blue-Eyes White Dragon');
  ok(!E.lib.forbid(g2, { type: 'ss', c: mal, p: 0 }), 'can be revived after being properly summoned');
  const g3 = duel({ board: [{ hand: [], gy: ['Malefic Blue-Eyes White Dragon'], turn: 2 }, {}] });
  const mal3 = g3.p[0].gy[0]; E.act(g3, [g3.prompt.opts.find(o => o.key === 'end').key]);
  ok(E.lib.forbid(g3, { type: 'ss', c: mal3, p: 0 }), 'cannot be revived if never properly summoned');
});
T('Malfunction negates Mirror Force and Sets it again', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Malfunction'], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  choose(g, 'Mirror Force', 1); choose(g, 'Malfunction', 0); settle(g);
  const mf = g.p[1].st.find(c => c && E.name(c) === 'Mirror Force');
  ok(on(g, 0, FILL) && mf && mf.pos === 'set' && g.p[0].lp === 7500, `Warwolf alive, Mirror Force Set again, A paid 500 (A ${g.p[0].lp})`);
});
T('Man Beast of Ares gains 500 ATK after a 2-link chain', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Man Beast of Ares'], st: ['Mirror Force'], turn: 2 }, { st: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Pot of Greed'); choose(g, 'Mystical Space Typhoon', 1); choose(g, 'u' + g.p[0].st.find(c => c && E.name(c) === 'Mirror Force').u); settle(g);
  const m = on(g, 0, 'Man Beast of Ares'); ok(m && E.atk(g, m) === 1000, `Man Beast has 1000 ATK (${m && E.atk(g, m)})`);
  const g2 = duel({ board: [{ hand: ['Pot of Greed'], m: ['Man Beast of Ares'], turn: 2 }, {}] });
  act(g2, 0, 'Pot of Greed'); settle(g2); const m2 = on(g2, 0, 'Man Beast of Ares'); ok(E.atk(g2, m2) === 500, 'no gain after a 1-link chain');
});
T('Marshmallon survives and burns the attacker when attacked face-down', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Marshmallon', pos: 'set' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); settle(g);
  ok(on(g, 1, 'Marshmallon') && g.p[0].lp === 7000, `Marshmallon stays, A took 1000 (A ${g.p[0].lp})`);
});
T('Marshmallon Glasses: only Marshmallon can be attacked', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Marshmallon', 'Cyber Dragon'], st: [{ n: 'Marshmallon Glasses', pos: 'up' }] }] });
  choose(g, 'bp'); passAll(g);
  ok(hasOpt(g, 'Attack Marshmallon') && !hasOpt(g, 'Attack Cyber Dragon') && !hasOpt(g, 'directly'), 'only Marshmallon is a target');
});
T('Mass Hypnosis takes monsters with A-Counters, destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Grey'], st: ['Mass Hypnosis'], turn: 2 }, { m: [FILL, 'Cyber Dragon'] }] });
  g.p[1].m[0].ctr = { A: 1 }; choose(g, 'pos:');
  act(g, 0, 'Mass Hypnosis'); settle(g); if (g.prompt.type === 'pick') choose(g, FILL); settle(g);
  ok(on(g, 0, FILL) && on(g, 1, 'Cyber Dragon'), 'A controls the Warwolf with the A-Counter');
  choose(g, 'end'); settle(g);
  ok(inZ(g, 0, 'gy', 'Mass Hypnosis') && on(g, 0, FILL), 'Mass Hypnosis destroyed, control kept');
});
T('Max Warrior: +400 attacking, then Level 2 with halved ATK until the next Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Max Warrior'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Max Warrior', FILL); settle(g);
  const m = on(g, 0, 'Max Warrior');
  ok(g.p[1].lp === 7800 && inZ(g, 1, 'gy', FILL), `2200 beat 2000 (B ${g.p[1].lp})`);
  ok(m && E.atk(g, m) === 900 && E.def(g, m) === 400 && E.lv(m) === 2, `Max Warrior 900/400 Level 2 (${E.atk(g, m)}/${E.def(g, m)} Lv ${E.lv(m)})`);
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g); choose(g, 'end'); settle(g);
  ok(E.atk(g, m) === 1800 && E.lv(m) === 4, `back to normal on A's next turn (${E.atk(g, m)} Lv ${E.lv(m)})`);
});
T('Maximum Six gains a die roll x 200 when Tribute Summoned', () => {
  const g = duel({ board: [{ hand: ['Maximum Six'], m: [FILL], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g); if (g.prompt.type === 'pick') { choose(g, FILL); settle(g); }
  const m = on(g, 0, 'Maximum Six'); const a = m && E.atk(g, m);
  ok(a > 1900 && a <= 3100 && (a - 1900) % 200 === 0, `Maximum Six has ${a} ATK`);
});
T('Mecha Bunny: 500 damage when flipped, a new Bunny when destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Mecha Bunny', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'Flip Summon'); settle(g); if (g.prompt.type === 'pick') choose(g, FILL); settle(g);
  ok(g.p[1].lp === 7500, `B took 500 (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Mecha Bunny'], deckTop: ['Mecha Bunny'] }] });
  choose(g2, 'bp'); passAll(g2); attack(g2, FILL, 'Mecha Bunny'); settle(g2);
  ok(g2.p[1].m.some(c => c && E.name(c) === 'Mecha Bunny' && c.pos === 'set'), 'a Mecha Bunny was Special Summoned face-down');
});
T('Mechanical Hound stops the opponent\'s Spells while its controller has no hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Mechanical Hound'], turn: 2 }, { hand: ['Pot of Greed'] }] });
  const pot = g.p[1].hand.find(c => E.name(c) === 'Pot of Greed'); const a = { type: 'activate', c: pot, eff: { type: 'act' }, p: 1 };
  ok(!E.lib.forbid(g, a), 'allowed while A holds a card');
  g.p[0].deck.push(...g.p[0].hand.splice(0)); g.seq++;
  ok(E.lib.forbid(g, a), 'blocked with an empty hand');
});
T('Medium Piece Golem summons Small Piece Golem with Big Piece Golem out', () => {
  const g = duel({ board: [{ hand: ['Medium Piece Golem'], m: ['Big Piece Golem'], deckTop: [FILL, 'Small Piece Golem'], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g);
  const s = on(g, 0, 'Small Piece Golem'); ok(s && s.flags.negated, 'Small Piece Golem summoned with its effect negated');
});
T('Mei-Kou Tributes itself to destroy a Continuous Trap', () => {
  const g = duel({ board: [{ hand: [], m: ['Mei-Kou, Master of Barriers'], turn: 2 }, { st: [{ n: 'Gravity Bind', pos: 'up' }] }] });
  choose(g, 'Tribute: destroy'); settle(g);
  ok(inZ(g, 1, 'gy', 'Gravity Bind') && inZ(g, 0, 'gy', 'Mei-Kou, Master of Barriers'), 'Gravity Bind destroyed');
});
T('Meltiel gains 1000 LP after a Counter Trap resolves', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Meltiel, Sage of the Sky'], st: ['Solemn Judgment'], turn: 2 }, {}] });
  act(g, 0, 'Pot of Greed'); choose(g, 'Solemn', 0); settle(g);
  ok(g.p[0].lp === 5000, `paid 4000, gained 1000 (A ${g.p[0].lp})`);
});
T('Memory Crusher burns 100 per Extra Deck card on a direct attack', () => {
  const g = duel({ ex1: ['Stardust Dragon', 'Nitro Warrior'], board: [{ hand: [], m: ['Memory Crusher'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); settle(g);
  ok(g.p[1].lp === 8000 - 1000 - 200, `B took 1200 (B ${g.p[1].lp})`);
});
T('Mermaid Archer equips a Level 3 monster, gains 800 and survives by destroying it', () => {
  const g = duel({ board: [{ hand: [], m: ['Mermaid Archer', 'Mecha Bunny'], turn: 2 }, { st: ['Sakuretsu Armor'] }] });
  choose(g, 'Equip a Level 3'); settle(g);
  const m = on(g, 0, 'Mermaid Archer'); ok(m && E.atk(g, m) === 2000 && inZ(g, 0, 'st', 'Mecha Bunny'), 'Archer 2000 ATK with Mecha Bunny equipped');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); choose(g, 'Sakuretsu', 1); settle(g);
  ok(on(g, 0, 'Mermaid Archer') && inZ(g, 0, 'gy', 'Mecha Bunny'), 'Mecha Bunny destroyed instead');
});
T('Mesmeric Control stops position changes next turn', () => {
  const g = duel({ board: [{ hand: ['Mesmeric Control'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Mesmeric Control'); settle(g);
  ok(E.lib.forbid(g, { type: 'pos', c: on(g, 1, FILL) }), 'B can\'t change positions');
});
T('Metabo Globster: 3 tokens when Tributed for a DARK', () => {
  const g = duel({ board: [{ hand: ['Jinzo'], m: ['Metabo Globster'], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g); if (g.prompt.type === 'pick') { choose(g, 'Metabo'); settle(g); }
  ok(cnt(g, 0, 'm', 'Metabo Token') === 3 && on(g, 0, 'Jinzo'), 'Jinzo and 3 Metabo Tokens');
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Metabo Token').every(c => c.flags.noTribute), 'tokens can\'t be Tributed');
});
T('Meteor Flare: 2 cards for 2000 damage', () => {
  const g = duel({ board: [{ hand: [FILL, FILL], st: ['Meteor Flare'], turn: 2 }, {}] });
  act(g, 0, 'Meteor Flare'); if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); settle(g);
  ok(g.p[1].lp === 6000 && inZ(g, 0, 'gy', 'Meteor Flare'), `B took 2000 (B ${g.p[1].lp})`);
});
T('Minefieldriller adds a Field Spell when it leaves the field', () => {
  const g = duel({ board: [{ hand: [], m: ['Minefieldriller'], gy: ['Sogen'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Minefieldriller', 'Cyber Dragon'); settle(g);
  ok(inZ(g, 0, 'hand', 'Sogen'), 'Sogen added');
});
T('Miniaturize: -1 Level and -1000 ATK', () => {
  const g = duel({ board: [{ hand: [], st: ['Miniaturize'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Miniaturize'); settle(g);
  const m = on(g, 1, FILL); ok(E.atk(g, m) === 1000 && E.lv(m) === 3, `Warwolf 1000 ATK, Level 3 (${E.atk(g, m)}, ${E.lv(m)})`);
});
T('Minoan Centaur summons 2 Beast-Warrior Normals and can\'t be Special Summoned', () => {
  const g = duel({ board: [{ hand: [], m: ['Minoan Centaur'], turn: 2 }, {}] });
  choose(g, 'Tribute: summon'); settle(g); if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); settle(g);
  ok(cnt(g, 0, 'm', FILL) === 2 && inZ(g, 0, 'gy', 'Minoan Centaur'), 'two Warwolves summoned');
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].gy.find(c => E.name(c) === 'Minoan Centaur'), p: 0 }), 'Minoan Centaur can\'t be Special Summoned');
});
T('Miraculous Descent summons a banished Fairy, linked', () => {
  const g = duel({ board: [{ hand: [], st: ['Miraculous Descent'], ban: ['Shining Angel'], turn: 2 }, {}] });
  act(g, 0, 'Miraculous Descent'); settle(g);
  ok(on(g, 0, 'Shining Angel') && inZ(g, 0, 'st', 'Miraculous Descent'), 'Shining Angel summoned, Descent stays');
});
T('Miraculous Rebirth only as Chain Link 4 or higher', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: ['Dust Tornado', 'Miraculous Rebirth'], gy: ['Cyber Dragon'], turn: 2 }, { st: ['Mystical Space Typhoon', 'Mirror Force'] }] });
  act(g, 0, 'Pot of Greed'); ok(!hasOpt(g, 'Miraculous Rebirth'), 'not offered at Chain Link 2');
  choose(g, 'Mystical Space Typhoon', 1); choose(g, 'u' + g.p[0].st.find(c => c && E.name(c) === 'Dust Tornado').u);
  ok(!hasOpt(g, 'Miraculous Rebirth'), 'not offered at Chain Link 3');
  choose(g, 'Dust Tornado', 0); choose(g, 'u' + g.p[1].st.find(c => c && E.name(c) === 'Mirror Force').u); if (g.prompt.p === 1) E.act(g, ['pass']);
  ok(hasOpt(g, 'Miraculous Rebirth'), 'offered at Chain Link 4'); choose(g, 'Miraculous Rebirth'); settle(g);
  ok(on(g, 0, 'Cyber Dragon'), 'Cyber Dragon Special Summoned');
});
T('Misfortune burns half the original ATK, no attacks', () => {
  const g = duel({ board: [{ hand: ['Misfortune'], m: [FILL], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Misfortune'); settle(g);
  ok(g.p[1].lp === 7000, `B took 1000 (B ${g.p[1].lp})`);
  ok(E.lib.forbid(g, { type: 'attack', c: on(g, 0, FILL) }), 'A\'s monsters can\'t attack');
});
T('Moja adds a Level 4 Beast when destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Moja'], gy: ['Rescue Cat'] }] });
  choose(g, 'bp'); passAll(g); attack(g, FILL, 'Moja'); settle(g);
  ok(inZ(g, 1, 'hand', 'Rescue Cat'), 'Rescue Cat added');
});
T('Molting Escape saves the Reptile once and gives 300 ATK', () => {
  const g = duel({ board: [{ hand: ['Molting Escape'], m: ['Alien Shocktrooper'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Molting Escape'); settle(g);
  choose(g, 'bp'); passAll(g); attack(g, 'Alien Shocktrooper', 'Cyber Dragon'); settle(g);
  const m = on(g, 0, 'Alien Shocktrooper'); ok(m && E.atk(g, m) === 2200 && g.p[0].lp === 7800, `Shocktrooper survived with 2200 ATK (${m && E.atk(g, m)}, A ${g.p[0].lp})`);
});
T('Montage Dragon: ATK = sent Levels x 300', () => {
  const g = duel({ board: [{ hand: ['Montage Dragon', FILL, FILL, 'Cyber Dragon'], turn: 2 }, {}] });
  choose(g, 'Special Summon (send'); if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.filter(o => !/Montage/.test(o.label)).slice(0, 3).map(o => o.key)); settle(g);
  const m = on(g, 0, 'Montage Dragon'); ok(m && E.atk(g, m) === 13 * 300, `Montage Dragon ${m && E.atk(g, m)} ATK`);
  ok(E.lib.forbid(g, { type: 'ss', c: m, p: 0 }), 'can only be Special Summoned from the hand');
});
T('Moon Dragon Quilla needs Supay as its Tuner', () => {
  const g = duel({ ex0: ['Moon Dragon Quilla'], board: [{ hand: [], m: ['Supay', 'Battle Steer'], turn: 2 }, {}] });
  ok(hasOpt(g, 'Synchro Summon'), 'Synchro offered with Supay'); choose(g, 'Synchro Summon'); settle(g);
  ok(on(g, 0, 'Moon Dragon Quilla'), 'Quilla summoned');
  const g2 = duel({ ex0: ['Moon Dragon Quilla'], board: [{ hand: [], m: ['Nitro Synchron', 'Mecha Bunny', 'Alien Grey'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'Synchro Summon'), 'no Synchro without Supay');
});
T('Moon Dragon Quilla gains LP when attacked and revives Inti when destroyed', () => {
  const g = duel({ first: 1, board: [{ m: ['Moon Dragon Quilla'], gy: ['Sun Dragon Inti'], turn: 2 }, { hand: [], m: ['Cyber Dragon'], turn: 2 }] });
  choose(g, 'bp'); passAll(g); choose(g, 'atk:' + on(g, 1, 'Cyber Dragon').u + ':' + on(g, 0, 'Moon Dragon Quilla').u); settle(g);
  ok(g.p[0].lp === 8000 + 1050, `A gained 1050 (A ${g.p[0].lp})`);
});
T('Mormolith destroys face-up monsters with DEF up to the Tributed ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Mormolith', FILL], turn: 2 }, { m: ['Cyber Dragon', 'Big Shield Gardna'] }] });
  choose(g, 'Tribute an EARTH'); choose(g, FILL); settle(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && on(g, 1, 'Big Shield Gardna') && inZ(g, 0, 'gy', 'Mormolith'), 'DEF 1600 and Mormolith (900) destroyed, BSG stays');
});
T('Morphing Jar 2 shuffles monsters and excavates replacements', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Morphing Jar 2', pos: 'set' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'Flip Summon'); settle(g);
  ok(g.p[0].m.filter(Boolean).length === 1 && g.p[1].m.filter(Boolean).length === 1 && g.p[1].m.filter(Boolean)[0].pos === 'set', `each side has 1 face-down monster`);
});
T('Morphtransition negates the attack and changes the Morphtronic\'s position', () => {
  const g = duel({ first: 1, board: [{ m: ['Morphtronic Radion'], st: ['Morphtransition'], turn: 2 }, { hand: [], m: [FILL], turn: 2 }] });
  choose(g, 'bp'); passAll(g); choose(g, 'atk:' + on(g, 1, FILL).u + ':' + on(g, 0, 'Morphtronic Radion').u);
  choose(g, 'Morphtransition', 0); settle(g);
  const r = on(g, 0, 'Morphtronic Radion'); ok(r && r.pos === 'def' && g.p[0].lp === 8000, 'attack negated, Radion in Defense');
});
T('Mosaic Manticore brings back its Tributes next Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Mosaic Manticore'], m: [FILL, 'Cyber Dragon'], turn: 2 }, {}] });
  choose(g, 'ns:'); settle(g); if (g.prompt.type === 'pick') { E.act(g, g.prompt.opts.map(o => o.key)); settle(g); }
  ok(on(g, 0, 'Mosaic Manticore'), 'Tribute Summoned');
  choose(g, 'end'); settle(g); choose(g, 'end'); settle(g);
  const w = on(g, 0, FILL), cd = on(g, 0, 'Cyber Dragon');
  ok(w && cd && w.flags.cantAttack && cd.flags.negated, 'both Tributes back, negated and unable to attack');
});
T('Mother Spider: Special Summon by sending 2 Defense Position monsters', () => {
  const g = duel({ board: [{ hand: ['Mother Spider'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }, { n: 'Cyber Dragon', pos: 'def' }] }] });
  choose(g, 'Special Summon (send 2'); settle(g);
  ok(on(g, 0, 'Mother Spider') && inZ(g, 1, 'gy', FILL) && inZ(g, 1, 'gy', 'Cyber Dragon'), 'Mother Spider summoned');
});
T('Multiply makes Kuriboh Tokens', () => {
  const g = duel({ board: [{ hand: ['Multiply'], m: ['Kuriboh'], turn: 2 }, {}] });
  act(g, 0, 'Multiply'); settle(g);
  ok(cnt(g, 0, 'm', 'Kuriboh Token') === 5, `5 tokens (${cnt(g, 0, 'm', 'Kuriboh Token')})`);
});
T('Mushroom Man 2 costs its controller 300 LP each Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Mushroom Man 2'], turn: 2 }, {}] });
  ok(g.p[0].lp === 7700, `A lost 300 (A ${g.p[0].lp})`);
});
T('Mutant Mindmaster takes an Attack Position monster for the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Mutant Mindmaster'], turn: 2 }, { m: [FILL, 'Cyber Dragon'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Mutant Mindmaster', 'Cyber Dragon'); settle(g); if (g.prompt.type === 'pick') choose(g, FILL); settle(g);
  const w = on(g, 0, FILL); ok(!!w, 'A controls the Warwolf');
  ok(hasOpt(g, 'atk:' + (w && w.u)), 'the Warwolf can attack');
  choose(g, 'endbp'); settle(g);
  ok(on(g, 1, FILL), 'the Warwolf went back at the end of the Battle Phase');
});
T('Mythical Beast Cerberus gets a Spell Counter when a Spell resolves', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Ookazi'], m: ['Mythical Beast Cerberus'], turn: 2 }, { st: ['Magic Jammer'] }] });
  act(g, 0, 'Pot of Greed'); settle(g);
  const m = on(g, 0, 'Mythical Beast Cerberus'); ok(E.atk(g, m) === 1900, `1 counter after Pot of Greed (${E.atk(g, m)})`);
  act(g, 0, 'Ookazi'); choose(g, 'Magic Jammer', 1); if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(E.atk(g, m) === 1900, `no counter for a negated Spell (${E.atk(g, m)})`);
});
T('Nanobreaker destroys a face-up Level 3 or lower monster without damage calculation', () => {
  const g = duel({ board: [{ hand: [], m: ['Nanobreaker'], turn: 2 }, { m: ['Mecha Bunny'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Nanobreaker', 'Mecha Bunny'); settle(g);
  ok(inZ(g, 1, 'gy', 'Mecha Bunny') && g.p[1].lp === 8000, `Mecha Bunny destroyed, no damage (B ${g.p[1].lp})`);
});
T('Natural Tune makes a Normal Monster a Tuner (scripts that read the flag)', () => {
  const g = duel({ board: [{ hand: ['Natural Tune'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Natural Tune'); settle(g);
  ok(on(g, 0, FILL).flags.f41tuner, 'Warwolf is treated as a Tuner');
});
T('Nature\'s Reflection sends the opponent\'s burn back', () => {
  const g = duel({ first: 1, board: [{ st: ['Nature\'s Reflection'], turn: 2 }, { hand: ['Ookazi'], turn: 2 }] });
  act(g, 1, 'Ookazi'); choose(g, 'Nature', 0); settle(g);
  ok(g.p[0].lp === 8000 && g.p[1].lp === 7200, `B took the 800 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Necroface shuffles banished cards and gains ATK; banished, it banishes 5 from each Deck', () => {
  const g = duel({ board: [{ hand: ['Necroface'], ban: [FILL, FILL], turn: 2 }, { ban: ['Cyber Dragon'] }] });
  choose(g, 'ns:'); settle(g);
  const m = on(g, 0, 'Necroface'); ok(E.atk(g, m) === 1500 && !g.p[0].ban.length && !g.p[1].ban.length, `Necroface 1500 ATK (${E.atk(g, m)})`);
});
T('Needlebug Nest mills 5', () => {
  const g = duel({ board: [{ hand: [], st: ['Needlebug Nest'], turn: 2 }, {}] });
  act(g, 0, 'Needlebug Nest'); settle(g);
  ok(cnt(g, 0, 'gy', FILL) === 5, 'five cards milled');
});
T('Negate Attack ends the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Cyber Dragon'], turn: 2 }, { st: ['Negate Attack'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); choose(g, 'Negate Attack', 1); settle(g);
  ok(g.p[1].lp === 8000 && !hasOpt(g, 'Attack directly'), 'no damage, Battle Phase over');
});
T('Neos Force: +800 and burn for the destroyed monster\'s ATK', () => {
  const g = duel({ board: [{ hand: ['Neos Force'], m: ['Elemental HERO Neos'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Neos Force'); settle(g);
  choose(g, 'bp'); passAll(g); attack(g, 'Elemental HERO Neos', 'Cyber Dragon'); settle(g);
  ok(g.p[1].lp === 8000 - 1200 - 2100, `B took 1200 + 2100 (B ${g.p[1].lp})`);
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(!inZ(g, 0, 'st', 'Neos Force') && g.p[0].deck.some(c => E.name(c) === 'Neos Force'), 'Neos Force shuffled into the Deck');
});
T('Neos Wiseman: summon rule and battle burn', () => {
  const g = duel({ board: [{ hand: ['Neos Wiseman'], m: ['Elemental HERO Neos', 'Yubel'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'Special Summon (send'); settle(g);
  ok(on(g, 0, 'Neos Wiseman'), 'Neos Wiseman summoned');
  choose(g, 'bp'); passAll(g); attack(g, 'Neos Wiseman', FILL); settle(g);
  ok(g.p[1].lp === 8000 - 1000 - 2000 && g.p[0].lp === 8100, `B took 1000 + 2000, A gained 100 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('NEX turns Aqua Dolphin into Marine Dolphin', () => {
  const g = duel({ ex0: ['Neo-Spacian Marine Dolphin'], board: [{ hand: ['NEX'], m: ['Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  act(g, 0, 'NEX'); settle(g);
  ok(on(g, 0, 'Neo-Spacian Marine Dolphin') && inZ(g, 0, 'gy', 'Neo-Spacian Aqua Dolphin'), 'Marine Dolphin Special Summoned');
});
T('Next to be Lost sends a copy from the Deck', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Next to be Lost'], turn: 2 }, {}] });
  act(g, 0, 'Next to be Lost'); settle(g); if (g.prompt.type === 'pick') { E.act(g, [g.prompt.opts[0].key]); settle(g); }
  ok(cnt(g, 0, 'gy', FILL) === 1, 'a Warwolf went to the GY');
});
T('Night Wing Sorceress lets Assault Mode Activate be used the turn it is Set', () => {
  const g = duel({ board: [{ hand: ['Assault Mode Activate'], m: ['Night Wing Sorceress'], turn: 2 }, {}] });
  choose(g, 'setst:'); const x = g.p[0].st.find(c => c && E.name(c) === 'Assault Mode Activate');
  ok(x && x.turnIn !== g.turnNo, 'the Set Trap counts as not Set this turn');
});
T('Night\'s End Sorcerer banishes 2 cards from the opponent\'s GY when Special Summoned', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Night\'s End Sorcerer'], turn: 2 }, { gy: [FILL, 'Cyber Dragon'] }] });
  act(g, 0, 'Monster Reborn'); choose(g, 'Night'); settle(g); if (g.prompt.type === 'pick') { E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); settle(g); }
  ok(g.p[1].ban.length === 2, `2 cards banished (${g.p[1].ban.length})`);
});
T('Nightmare\'s Steelcage stops attacks and stays for 2 opponent turns', () => {
  const g = duel({ board: [{ hand: ['Nightmare\'s Steelcage'], m: [FILL], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Nightmare\'s Steelcage'); settle(g);
  ok(inZ(g, 0, 'st', 'Nightmare\'s Steelcage') && E.lib.forbid(g, { type: 'attack', c: on(g, 0, FILL) }), 'stays on the field, no attacks');
  choose(g, 'end'); settle(g); choose(g, 'end'); settle(g); ok(inZ(g, 0, 'st', 'Nightmare\'s Steelcage'), 'still there after 1 opponent turn');
  choose(g, 'end'); settle(g); choose(g, 'end'); settle(g); ok(inZ(g, 0, 'gy', 'Nightmare\'s Steelcage'), 'gone after the 2nd');
});
T('Nimble Musasabi: 500 damage and more Musasabi for the opponent', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Nimble Musasabi'], deckTop: ['Nimble Musasabi', 'Nimble Musasabi'] }] });
  choose(g, 'bp'); passAll(g); attack(g, FILL, 'Nimble Musasabi'); settle(g); if (g.prompt.type === 'pick') { E.act(g, g.prompt.opts.map(o => o.key)); settle(g); }
  ok(g.p[0].lp === 7500 && cnt(g, 0, 'm', 'Nimble Musasabi') === 2, `A took 500 and got 2 Musasabi (A ${g.p[0].lp})`);
});
T('Nitro Synchron draws for a Nitro Synchro', () => {
  const g = duel({ ex0: ['Nitro Warrior'], board: [{ hand: [], m: ['Nitro Synchron', 'Cyber Dragon'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; choose(g, 'Synchro Summon'); if (g.prompt.type === 'choose') choose(g, 'Attack'); settle(g);
  ok(on(g, 0, 'Nitro Warrior') && g.p[0].hand.length === h + 1, 'Nitro Warrior summoned and A drew');
});
T('No Entry!! turns Attack Position monsters to Defense', () => {
  const g = duel({ board: [{ hand: [], st: ['No Entry!!'], m: [FILL], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'No Entry!!'); settle(g);
  ok(on(g, 0, FILL).pos === 'def' && on(g, 1, FILL).pos === 'def', 'both in Defense');
});
T('Noisy Gnat raises a Level until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Noisy Gnat'], m: [FILL], turn: 2 }, {}] });
  choose(g, 'Send to the GY'); settle(g);
  const m = on(g, 0, FILL); ok(E.lv(m) === 5, `Level 5 (${E.lv(m)})`);
  choose(g, 'end'); settle(g); ok(E.lv(m) === 4, 'back to Level 4');
});

T('Maniacal Servant banishes DARKs for DEF in the opponent\'s Standby Phase', () => {
  const g = duel({ first: 1, board: [{ m: ['Maniacal Servant'], gy: ['Jinzo', 'Jinzo'], turn: 2 }, {}] });
  const m = on(g, 0, 'Maniacal Servant'); choose(g, 'yes'); E.act(g, g.prompt.opts.map(o => o.key)); settle(g);
  ok(E.def(g, m) === 2000 && g.p[0].ban.length === 2, `2000 DEF (${E.def(g, m)})`);
});
T('Nega-Ton Corepanel negates a monster effect', () => {
  const g = duel({ board: [{ hand: [], m: ['Mei-Kou, Master of Barriers', 'Koa\'ki Meiru Drago'], gy: ['Iron Core of Koa\'ki Meiru'], st: ['Nega-Ton Corepanel'], turn: 2 }, { st: [{ n: 'Gravity Bind', pos: 'up' }] }] });
  if (g.prompt.type === 'yesno') choose(g, 'no'); choose(g, 'Tribute: destroy'); if (g.prompt.p === 1) E.act(g, ['pass']); choose(g, 'Nega-Ton', 0); settle(g);
  ok(inZ(g, 1, 'st', 'Gravity Bind') && inZ(g, 0, 'gy', 'Nega-Ton Corepanel'), 'Gravity Bind stays');
});

console.log(fails ? `\n${fails} failed` : '\nAll full-41 checks passed.');
process.exit(fails ? 1 : 0);
