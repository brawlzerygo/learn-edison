// Scenario checks for full pool batch 28: node build/test_full-28.js
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
// answer the prompts until the turn player's idle prompt: pass windows, say yes to triggers, take the first option of picks
const settle = (g, upto = 40) => { for (let i = 0; i < upto && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['y']); else E.act(g, pr.opts.slice(0, pr.min).map(o => o.key)); } };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const onField = c => ['m', 'st', 'fz'].includes(c.zone);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const ns = (g, p, n) => choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u);
const endTurn = g => { choose(g, 'end'); settle(g); };
const toBP = g => { choose(g, 'bp'); settle(g); };
const attack = (g, a, t) => { choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); };

T('Stray Lambs: 2 Lamb Tokens, then no Normal Summon (Set allowed)', () => {
  const g = duel({ board: [{ hand: ['Stray Lambs', FILL], turn: 2 }, {}] });
  act(g, 0, 'Stray Lambs'); settle(g);
  ok(cnt(g, 0, 'm', 'Lamb Token') === 2 && on(g, 0, 'Lamb Token').pos === 'def', '2 Lamb Tokens in Defense Position');
  ok(!hasOpt(g, 'ns:') && hasOpt(g, 'set:'), 'Normal Summon blocked, Set allowed');
});
T('Strike Ninja banishes itself until the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Strike Ninja'], gy: ['Sangan', 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Strike Ninja'); settle(g);
  ok(inZ(g, 0, 'ban', 'Strike Ninja') && cnt(g, 0, 'ban', 'Sangan') === 2, 'Strike Ninja and 2 Sangan banished');
  endTurn(g);
  ok(on(g, 0, 'Strike Ninja'), 'Strike Ninja returned in the End Phase');
});
T('Stumbling turns a summoned monster to Defense Position', () => {
  const g = duel({ board: [{ hand: [FILL], st: [{ n: 'Stumbling', pos: 'up' }], turn: 2 }, {}] });
  ns(g, 0, FILL); settle(g);
  ok(on(g, 0, FILL).pos === 'def', 'Warwolf is in Defense Position');
});
T('Suijin makes the attacker 0 ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Suijin'] }] });
  toBP(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, 'Suijin'));
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'attacker'); i++) E.act(g, ['pass']);
  choose(g, 'attacker', 1); settle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && g.p[0].lp === 5500, `Cyber Dragon destroyed, A took 2500 (A ${g.p[0].lp})`);
});
T('Summoner of Illusions: Tribute, Fusion Monster, destroyed in the End Phase', () => {
  const g = duel({ ex0: ['Gaia the Dragon Champion'], board: [{ hand: [], m: [{ n: 'Summoner of Illusions', pos: 'set' }, FILL], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g);
  ok(on(g, 0, 'Gaia the Dragon Champion') && inZ(g, 0, 'gy', FILL), 'Warwolf Tributed, Gaia the Dragon Champion summoned');
  endTurn(g);
  ok(inZ(g, 0, 'gy', 'Gaia the Dragon Champion'), 'Gaia destroyed in the End Phase');
});
T('Supply returns 2 Fusion Materials', () => {
  const g = duel({ ex0: ['Gaia the Dragon Champion'], board: [{ hand: ['Polymerization', 'Gaia The Fierce Knight', 'Curse of Dragon'], m: [{ n: 'Supply', pos: 'set' }], gy: ['Sangan', 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g);
  ok(on(g, 0, 'Gaia the Dragon Champion'), 'Fusion Summoned');
  choose(g, 'flip:'); settle(g);
  ok(inZ(g, 0, 'hand', 'Gaia The Fierce Knight') && inZ(g, 0, 'hand', 'Curse of Dragon') && cnt(g, 0, 'gy', 'Sangan') === 2, 'both materials back in the hand, Sangans stay');
});
T('Susa Soldier halves its battle damage and returns to the hand', () => {
  const g = duel({ board: [{ hand: ['Susa Soldier'], turn: 2 }, {}] });
  ns(g, 0, 'Susa Soldier'); settle(g); toBP(g); attack(g, on(g, 0, 'Susa Soldier'), null); settle(g);
  ok(g.p[1].lp === 7000, `B took 1000 (B ${g.p[1].lp})`);
  choose(g, 'endbp'); settle(g); endTurn(g);
  ok(inZ(g, 0, 'hand', 'Susa Soldier'), 'Susa Soldier returned to the hand');
});
T('Swarm of Scarabs destroys on Flip Summon and can turn face-down', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Swarm of Scarabs', pos: 'set' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'flip:'); settle(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon'), 'Cyber Dragon destroyed');
  choose(g, 'face-down'); settle(g);
  ok(g.p[0].m.find(c => c && c.pos === 'set'), 'Swarm of Scarabs is face-down');
});
T('Swarm of Locusts destroys a Spell/Trap on Flip Summon', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Swarm of Locusts', pos: 'set' }], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'flip:'); settle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Swords of Revealing Light flips and stops attacks for 3 turns', () => {
  const g = duel({ board: [{ hand: ['Swords of Revealing Light'], turn: 2 }, { m: [{ n: 'Cyber Dragon', pos: 'set' }] }] });
  act(g, 0, 'Swords of Revealing Light'); settle(g);
  ok(on(g, 1, 'Cyber Dragon').pos === 'def' && inZ(g, 0, 'st', 'Swords of Revealing Light'), 'Cyber Dragon flipped face-up, Swords stays');
  endTurn(g); choose(g, 'pos:'); settle(g); choose(g, 'bp'); settle(g);
  ok(!hasOpt(g, 'atk:'), 'B has no attack');
  choose(g, 'endbp'); settle(g); endTurn(g); endTurn(g); endTurn(g); endTurn(g);
  ok(inZ(g, 0, 'st', 'Swords of Revealing Light'), 'Swords still there after 2 of their turns'); endTurn(g);
  ok(inZ(g, 0, 'gy', 'Swords of Revealing Light'), 'Swords destroyed after the opponent’s 3rd End Phase');
});
T('Tactical Espionage Expert: no Traps in response to its Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Tactical Espionage Expert'], turn: 2 }, { st: ['Torrential Tribute'] }] });
  ns(g, 0, 'Tactical Espionage Expert');
  let asked = false; for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.p === 1 && hasOpt(g, 'Torrential')) asked = true; E.act(g, ['pass']); }
  ok(!asked && inZ(g, 1, 'st', 'Torrential Tribute') && on(g, 0, 'Tactical Espionage Expert'), 'Torrential Tribute was not offered');
});
T('Tailor of the Fickle moves an Equip Card', () => {
  const g = duel({ board: [{ hand: ['United We Stand', 'Tailor of the Fickle'], m: ['Cyber Dragon', FILL], turn: 2 }, {}] });
  act(g, 0, 'United We Stand'); choose(g, 'Cyber Dragon'); settle(g);
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 3700, 'Cyber Dragon has 3700 ATK');
  act(g, 0, 'Tailor of the Fickle'); settle(g);
  ok(E.atk(g, on(g, 0, FILL)) === 3600 && E.atk(g, on(g, 0, 'Cyber Dragon')) === 2100, 'United We Stand moved to Warwolf');
});
T('Tainted Wisdom shuffles the Deck when changed to Defense Position', () => {
  const g = duel({ board: [{ hand: [], m: ['Tainted Wisdom'], turn: 2 }, {}] });
  choose(g, 'pos:'); settle(g);
  ok(g.log.some(l => /shuffled the Deck/.test(l)), 'Deck shuffled');
});
T('Talisman of Spell Sealing stops Spells and goes when Meisei leaves; Teva stops attacks', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Teva'], m: ['Sealmaster Meisei'], st: ['Talisman of Spell Sealing'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Talisman of Spell Sealing'); settle(g);
  ok(!hasOpt(g, 'a:' + g.p[0].hand.find(c => E.name(c) === 'Pot of Greed').u), 'Pot of Greed can’t be activated');
  ns(g, 0, 'Teva'); settle(g);
  ok(on(g, 0, 'Teva') && inZ(g, 0, 'gy', 'Talisman of Spell Sealing'), 'Meisei Tributed, Talisman destroyed');
  endTurn(g); choose(g, 'bp'); settle(g);
  ok(!hasOpt(g, 'atk:'), 'B can’t declare an attack (Teva)');
});
T('Talisman of Trap Sealing stops Trap activations', () => {
  const g = duel({ board: [{ hand: ['Talisman of Trap Sealing'], m: ['Sealmaster Meisei'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Talisman of Trap Sealing'); settle(g); toBP(g); attack(g, on(g, 0, 'Sealmaster Meisei'), null);
  let asked = false; for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (hasOpt(g, 'Mirror Force')) asked = true; E.act(g, [g.prompt.type === 'respond' ? 'pass' : g.prompt.opts[0].key]); }
  ok(!asked && g.p[1].lp === 6900, `Mirror Force not offered, B took 1100 (B ${g.p[1].lp})`);
});

T('Taunt: the opponent must attack the selected monster', () => {
  const g = duel({ first: 1, board: [{ m: [FILL, 'Sangan'], st: ['Taunt'], turn: 2 }, { hand: ['Mokey Mokey'], m: ['Cyber Dragon'] }] });
  ns(g, 1, 'Mokey Mokey');
  for (let i = 0; i < 10 && g.prompt && !(g.prompt.p === 0 && hasOpt(g, 'Taunt')); i++) E.act(g, ['pass']);
  choose(g, 'Taunt', 0); passAll(g); choose(g, 'Sangan', 0); settle(g);
  toBP(g); const cd = on(g, 1, 'Cyber Dragon'); const keys = g.prompt.opts.map(o => o.key);
  ok(keys.includes(`atk:${cd.u}:${on(g, 0, 'Sangan').u}`) && !keys.includes(`atk:${cd.u}:${on(g, 0, FILL).u}`) && !keys.includes(`atk:${cd.u}:d`), 'only Sangan can be attacked');
});
T('Terrorking Archfiend: Normal Summon needs an Archfiend; Standby costs', () => {
  const g = duel({ board: [{ hand: ['Terrorking Archfiend'], turn: 2 }, {}] });
  { const tk = g.p[0].hand.find(c => E.name(c) === 'Terrorking Archfiend').u; ok(!hasOpt(g, 'ns:' + tk) && hasOpt(g, 'set:' + tk), 'no Archfiend: Set only'); choose(g, 'set:' + tk); settle(g); ok(g.p[0].m.some(c => c && c.pos === 'set'), 'Terrorking Set'); }
  const h = duel({ board: [{ hand: ['Terrorking Archfiend'], m: ['Vilepawn Archfiend'], turn: 2 }, {}] });
  ok(hasOpt(h, 'ns:' + h.p[0].hand.find(c => E.name(c) === 'Terrorking Archfiend').u) && h.p[0].lp === 7500, `with Vilepawn: Normal Summon allowed; Vilepawn cost paid (A ${h.p[0].lp})`);
  const k = duel({ board: [{ hand: [], m: ['Terrorking Archfiend'], turn: 2 }, {}] });
  ok(k.p[0].lp === 7200, `Terrorking cost 800 (A ${k.p[0].lp})`);
});
T('Vilepawn Archfiend protects the other Archfiends from attacks', () => {
  const g = duel({ first: 1, board: [{ m: ['Vilepawn Archfiend', 'Terrorking Archfiend'], turn: 2 }, { hand: [], m: ['Cyber Dragon'] }] });
  toBP(g); const cd = on(g, 1, 'Cyber Dragon'); const keys = g.prompt.opts.map(o => o.key);
  ok(keys.includes(`atk:${cd.u}:${on(g, 0, 'Vilepawn Archfiend').u}`) && !keys.includes(`atk:${cd.u}:${on(g, 0, 'Terrorking Archfiend').u}`), 'only Vilepawn can be attacked');
});
T('Theban Nightmare gains 1500 with an empty hand and S/T Zones', () => {
  const g = duel({ board: [{ hand: [], turn: 2 }, { hand: [], m: ['Theban Nightmare'] }] });
  ok(E.atk(g, on(g, 1, 'Theban Nightmare')) === 3000, 'Theban Nightmare has 3000 ATK');
});
T('Theinen the Great Sphinx comes out when both Sphinxes are destroyed', () => {
  const g = duel({ board: [{ hand: ['Dark Hole', 'Theinen the Great Sphinx'], m: ['Andro Sphinx', 'Sphinx Teleia'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Theinen the Great Sphinx').u), 'Theinen can’t be Normal Summoned');
  act(g, 0, 'Dark Hole'); settle(g);
  const t = on(g, 0, 'Theinen the Great Sphinx');
  ok(t && E.atk(g, t) === 6500 && g.p[0].lp === 7000, `Theinen summoned with 6500 ATK, 1000 LP paid (A ${g.p[0].lp})`);
});
T('Thestalos discards at random and burns a monster', () => {
  const g = duel({ board: [{ hand: ['Thestalos the Firestorm Monarch'], m: [FILL], turn: 2 }, { hand: ['Cyber Dragon'] }] });
  ns(g, 0, 'Thestalos the Firestorm Monarch'); settle(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && g.p[1].lp === 7500, `Cyber Dragon discarded, B took 500 (B ${g.p[1].lp})`);
});
T('Throwstone Unit Tributes itself to destroy a low-DEF monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Throwstone Unit'], turn: 2 }, { m: ['Sangan', 'Cyber Dragon'] }] });
  act(g, 0, 'Throwstone Unit'); settle(g);
  ok(inZ(g, 0, 'gy', 'Throwstone Unit') && inZ(g, 1, 'gy', 'Sangan') && on(g, 1, 'Cyber Dragon'), 'Sangan (DEF 600) destroyed, Cyber Dragon (DEF 1600) not a choice');
});
T('Timeater: the opponent skips Main Phase 1', () => {
  const g = duel({ board: [{ hand: [], m: ['Timeater'], turn: 2 }, { m: ['Mokey Mokey'] }] });
  toBP(g); attack(g, on(g, 0, 'Timeater'), on(g, 1, 'Mokey Mokey')); settle(g); choose(g, 'endbp'); settle(g); endTurn(g);
  ok(g.tp === 1 && g.phase === 'main1' && !hasOpt(g, 'ns:') && !hasOpt(g, 'set:') && hasOpt(g, 'bp'), 'B can only go to the Battle Phase or end');
});
T('Timidity protects Set Spells and Traps', () => {
  const g = duel({ board: [{ hand: ['Timidity', 'Heavy Storm'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Timidity'); settle(g); act(g, 0, 'Heavy Storm'); settle(g);
  ok(inZ(g, 1, 'st', 'Mirror Force'), 'Mirror Force survives Heavy Storm');
});
T('Token Feastevil destroys the tokens; Token Thanksgiving gains LP', () => {
  const g = duel({ board: [{ hand: ['Scapegoat'], turn: 2 }, { st: ['Token Feastevil'] }] });
  act(g, 0, 'Scapegoat');
  for (let i = 0; i < 10 && g.prompt && !(g.prompt.p === 1 && hasOpt(g, 'Feastevil')); i++) E.act(g, ['pass']);
  choose(g, 'Feastevil', 1); settle(g);
  ok(cnt(g, 0, 'm', 'Sheep Token') === 0 && g.p[0].lp === 6800, `4 tokens destroyed, A took 1200 (A ${g.p[0].lp})`);
  const h = duel({ board: [{ hand: ['Scapegoat', 'Token Thanksgiving'], turn: 2 }, {}] });
  act(h, 0, 'Scapegoat'); settle(h); act(h, 0, 'Token Thanksgiving'); settle(h);
  ok(h.p[0].lp === 11200, `gained 3200 (A ${h.p[0].lp})`);
});
T('Toll: 500 LP to declare an attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: [{ n: 'Toll', pos: 'up' }], turn: 2 }, {}] });
  toBP(g); attack(g, on(g, 0, 'Cyber Dragon'), null); settle(g);
  ok(g.p[0].lp === 7500 && g.p[1].lp === 5900, `A paid 500, B took 2100 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
  const h = duel({ board: [{ hand: [], lp: 400, m: ['Cyber Dragon'], st: [{ n: 'Toll', pos: 'up' }], turn: 2 }, {}] });
  choose(h, 'bp'); settle(h); ok(!hasOpt(h, 'atk:'), 'with 400 LP no attack');
});
T('Torpedo Fish with Umi is unaffected by Raigeki', () => {
  const g = duel({ board: [{ hand: ['Umi', 'Raigeki'], turn: 2 }, { m: ['Torpedo Fish', FILL] }] });
  act(g, 0, 'Umi'); settle(g);
  ok(E.atk(g, on(g, 1, 'Torpedo Fish')) === 1000, 'Umi: Torpedo Fish keeps 1000 ATK (unaffected by Spells)');
  act(g, 0, 'Raigeki'); settle(g);
  ok(on(g, 1, 'Torpedo Fish') && inZ(g, 1, 'gy', FILL), 'Torpedo Fish stays, Warwolf destroyed');
});
T('Tower of Babel: 4th Spell Counter deals 3000', () => {
  const g = duel({ board: [{ hand: ['Tremendous Fire', 'Tremendous Fire', 'Tremendous Fire', 'Tremendous Fire'], st: ['Tower of Babel'], turn: 2 }, {}] });
  act(g, 0, 'Tower of Babel'); settle(g);
  for (let i = 0; i < 4; i++) { act(g, 0, 'Tremendous Fire'); settle(g); }
  ok(inZ(g, 0, 'gy', 'Tower of Babel') && g.p[0].lp === 3000 && g.p[1].lp === 4000, `Tower destroyed, A 3000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Tragedy after a change to Defense Position', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon', FILL], turn: 2 }, { st: ['Tragedy'] }] });
  choose(g, 'pos:' + on(g, 0, 'Cyber Dragon').u); settle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && on(g, 0, FILL), 'Cyber Dragon destroyed, Attack Position Warwolf stays');
});
T('Triangle Ecstasy Spark: 2700 ATK and no opponent Traps', () => {
  const g = duel({ board: [{ hand: ['Triangle Ecstasy Spark'], m: ['Harpie Lady Sisters'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Triangle Ecstasy Spark'); settle(g);
  ok(E.atk(g, on(g, 0, 'Harpie Lady Sisters')) === 2700, 'Harpie Lady Sisters 2700 ATK');
  toBP(g); attack(g, on(g, 0, 'Harpie Lady Sisters'), null); settle(g);
  ok(inZ(g, 1, 'st', 'Mirror Force') && g.p[1].lp === 5300, 'Mirror Force not used, 2700 damage');
});
T('Triangle Power: +2000, destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Triangle Power'], m: ['Mokey Mokey'], turn: 2 }, {}] });
  act(g, 0, 'Triangle Power'); settle(g);
  ok(E.atk(g, on(g, 0, 'Mokey Mokey')) === 2300, 'Mokey Mokey 2300 ATK');
  endTurn(g); ok(inZ(g, 0, 'gy', 'Mokey Mokey'), 'destroyed in the End Phase');
});
T('Tribe-Infecting Virus destroys a declared Type', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: ['Tribe-Infecting Virus'], turn: 2 }, { m: ['Cyber Dragon', FILL] }] });
  act(g, 0, 'Tribe-Infecting Virus'); choose(g, 'Sangan'); choose(g, 'Machine'); settle(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && on(g, 1, FILL), 'Machine destroyed, Beast-Warrior stays');
});
T('Tribute Doll: Level 7 from the hand, no attack this turn', () => {
  const g = duel({ board: [{ hand: ['Tribute Doll', 'Dark Magician'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Tribute Doll'); settle(g);
  ok(on(g, 0, 'Dark Magician') && inZ(g, 0, 'gy', FILL), 'Dark Magician summoned');
  choose(g, 'bp'); settle(g); ok(!hasOpt(g, 'atk:'), 'it can’t attack');
});
T('Troop Dragon summons another from the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Troop Dragon'], deckTop: ['Troop Dragon'] }] });
  toBP(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, 'Troop Dragon')); settle(g);
  ok(on(g, 1, 'Troop Dragon') && inZ(g, 1, 'gy', 'Troop Dragon'), 'a new Troop Dragon is on the field');
});
T('Tsukuyomi turns a monster face-down and returns', () => {
  const g = duel({ board: [{ hand: ['Tsukuyomi'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  ns(g, 0, 'Tsukuyomi'); choose(g, 'Cyber Dragon'); settle(g);
  ok(g.p[1].m.some(c => c && c.pos === 'set'), 'Cyber Dragon is face-down');
  endTurn(g); ok(inZ(g, 0, 'hand', 'Tsukuyomi'), 'Tsukuyomi returned to the hand');
});
T('Turtle Oath Ritual Summons Crab Turtle', () => {
  const g = duel({ board: [{ hand: ['Turtle Oath', 'Crab Turtle', 'Dark Magician'], m: ['Mokey Mokey'], turn: 2 }, {}] });
  act(g, 0, 'Turtle Oath'); settle(g);
  ok(on(g, 0, 'Crab Turtle'), 'Crab Turtle summoned');
});
T('Tutan Mask negates a Spell targeting a Zombie', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['Pyramid Turtle'], st: ['Tutan Mask'] }] });
  act(g, 0, 'Book of Moon');
  for (let i = 0; i < 10 && g.prompt && !(g.prompt.p === 1 && hasOpt(g, 'Tutan')); i++) E.act(g, [g.prompt.type === 'respond' ? 'pass' : g.prompt.opts[0].key]);
  choose(g, 'Tutan', 1); settle(g);
  ok(on(g, 1, 'Pyramid Turtle').pos === 'atk', 'Pyramid Turtle stays face-up');
});
T('Twinheaded Beast attacks twice', () => {
  const g = duel({ board: [{ hand: [], m: ['Twinheaded Beast'], turn: 2 }, {}] });
  toBP(g); const b = on(g, 0, 'Twinheaded Beast'); attack(g, b, null); settle(g); attack(g, b, null); settle(g);
  ok(g.p[1].lp === 4600, `B took 3400 (B ${g.p[1].lp})`);
});
T('Type Zero Magic Crusher: discard a Spell for 500', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: [{ n: 'Type Zero Magic Crusher', pos: 'up' }], turn: 2 }, {}] });
  act(g, 0, 'Type Zero Magic Crusher'); settle(g);
  ok(g.p[1].lp === 7500 && inZ(g, 0, 'gy', 'Pot of Greed'), 'Pot discarded, B took 500');
});
T('Tyrant Dragon attacks again and shrugs off a targeting Trap', () => {
  const g = duel({ board: [{ hand: [], m: ['Tyrant Dragon'], turn: 2 }, { m: ['Mokey Mokey', 'Sangan'], st: ['Sakuretsu Armor'] }] });
  toBP(g); const t = on(g, 0, 'Tyrant Dragon'); attack(g, t, on(g, 1, 'Mokey Mokey'));
  for (let i = 0; i < 10 && g.prompt && !(g.prompt.p === 1 && hasOpt(g, 'Sakuretsu')); i++) E.act(g, ['pass']);
  choose(g, 'Sakuretsu', 1);
  for (let i = 0; i < 5 && g.prompt && !(g.prompt.p === 0 && hasOpt(g, 'Negate the Trap')); i++) E.act(g, ['pass']);
  choose(g, 'Negate the Trap', 0); settle(g);
  ok(onField(t) && inZ(g, 1, 'gy', 'Sakuretsu Armor') && inZ(g, 1, 'gy', 'Mokey Mokey'), 'Sakuretsu negated and destroyed, Mokey Mokey destroyed');
  ok(hasOpt(g, `atk:${t.u}:${on(g, 1, 'Sangan').u}`), 'Tyrant Dragon can attack again');
});
T('UFO Turtle summons a FIRE monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['UFO Turtle'], deckTop: ['UFO Turtle'] }] });
  toBP(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, 'UFO Turtle')); settle(g);
  ok(on(g, 1, 'UFO Turtle'), 'a new UFO Turtle is on the field');
});
T('Ultra Evolution Pill: Reptile for a Dinosaur', () => {
  const g = duel({ board: [{ hand: ['Ultra Evolution Pill', 'Sabersaurus'], m: ['Armored Lizard'], turn: 2 }, {}] });
  act(g, 0, 'Ultra Evolution Pill'); settle(g);
  ok(on(g, 0, 'Sabersaurus') && inZ(g, 0, 'gy', 'Armored Lizard'), 'Sabersaurus summoned');
});
T('Union Rider takes a Union Monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Union Rider'], turn: 2 }, { m: ['Des Dendle'] }] });
  act(g, 0, 'Union Rider'); settle(g);
  const d = g.p[0].st.find(c => c && E.name(c) === 'Des Dendle');
  ok(d && d.equipTo === on(g, 0, 'Union Rider').u, 'Des Dendle is equipped to Union Rider');
});
T('Unshaven Angler counts as 2 Tributes for a WATER', () => {
  const g = duel({ board: [{ hand: ['Levia-Dragon - Daedalus'], m: ['Unshaven Angler'], turn: 2 }, {}] });
  act(g, 0, 'Unshaven Angler'); settle(g);
  ok(on(g, 0, 'Levia-Dragon - Daedalus') && inZ(g, 0, 'gy', 'Unshaven Angler'), 'Daedalus Tribute Summoned');
});
T('Valkyrion: summoned by Tributing the three, then splits back', () => {
  const g = duel({ board: [{ hand: ['Valkyrion the Magna Warrior', 'Alpha The Magnet Warrior', 'Beta The Magnet Warrior', 'Gamma the Magnet Warrior'], turn: 2 }, {}] });
  choose(g, 'sp:'); settle(g);
  ok(on(g, 0, 'Valkyrion the Magna Warrior'), 'Valkyrion summoned');
  act(g, 0, 'Valkyrion the Magna Warrior'); settle(g);
  ok(on(g, 0, 'Alpha The Magnet Warrior') && on(g, 0, 'Beta The Magnet Warrior') && on(g, 0, 'Gamma the Magnet Warrior'), 'the three Magnet Warriors are back');
});
T('Vampiric Orchis summons Des Dendle', () => {
  const g = duel({ board: [{ hand: ['Vampiric Orchis', 'Des Dendle'], turn: 2 }, {}] });
  ns(g, 0, 'Vampiric Orchis'); settle(g);
  ok(on(g, 0, 'Des Dendle'), 'Des Dendle summoned');
});
T('Waboku: no battle destruction or damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: ['Waboku'] }] });
  toBP(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, FILL));
  for (let i = 0; i < 10 && g.prompt && !(g.prompt.p === 1 && hasOpt(g, 'Waboku')); i++) E.act(g, ['pass']);
  choose(g, 'Waboku', 1); settle(g);
  ok(on(g, 1, FILL) && g.p[1].lp === 8000, 'Warwolf survives, no damage');
});
T('Wandering Mummy turns face-down', () => {
  const g = duel({ board: [{ hand: [], m: ['Wandering Mummy', { n: FILL, pos: 'set' }], turn: 2 }, {}] });
  act(g, 0, 'Wandering Mummy'); settle(g);
  ok(g.p[0].m.filter(c => c && c.pos === 'set').length === 2, 'both monsters face-down');
});
T('Field Spells: Umiiruka and Wasteland', () => {
  const g = duel({ board: [{ hand: ['Umiiruka'], m: ['Unshaven Angler'], turn: 2 }, {}] });
  act(g, 0, 'Umiiruka'); settle(g); const a = on(g, 0, 'Unshaven Angler');
  ok(E.atk(g, a) === 2000 && E.def(g, a) === 1200, 'Angler 2000/1200');
  const h = duel({ board: [{ hand: ['Wasteland'], m: ['Pyramid Turtle'], turn: 2 }, {}] });
  act(h, 0, 'Wasteland'); settle(h); ok(E.atk(h, on(h, 0, 'Pyramid Turtle')) === 1400, 'Pyramid Turtle 1400 ATK');
});
T('Swamp Battleguard and equips', () => {
  const g = duel({ board: [{ hand: ['Violet Crystal'], m: ['Swamp Battleguard', 'Lava Battleguard', 'Pyramid Turtle'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Swamp Battleguard')) === 2300 && E.atk(g, on(g, 0, 'Lava Battleguard')) === 2050, 'Battleguards boost each other');
  act(g, 0, 'Violet Crystal'); settle(g); ok(E.atk(g, on(g, 0, 'Pyramid Turtle')) === 1500, 'Violet Crystal +300');
});


console.log(fails ? `\n${fails} failed` : '\nAll passed');
process.exitCode = fails ? 1 : 0;
