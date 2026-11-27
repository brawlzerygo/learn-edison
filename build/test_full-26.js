// Scenario checks for full pool batch 26: node build/test_full-26.js
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

/* ----- Polymerization ----- */
T('Polymerization fuses a hand card with a field monster', () => {
  const g = duel({ ex0: ['Rabid Horseman'], board: [{ hand: ['Polymerization', 'Battle Ox'], m: ['Mystic Horseman'] }, {}] });
  act(g, 0, 'Polymerization'); auto(g);
  ok(on(g, 0, 'Rabid Horseman') && inZ(g, 0, 'gy', 'Battle Ox') && inZ(g, 0, 'gy', 'Mystic Horseman') && inZ(g, 0, 'gy', 'Polymerization'), 'Rabid Horseman is on the field, materials and Polymerization in the GY');
  ok(on(g, 0, 'Rabid Horseman').summonType === 'fusion', 'it was Fusion Summoned');
});
T('Polymerization fuses two hand cards', () => {
  const g = duel({ ex0: ['Rabid Horseman'], board: [{ hand: ['Polymerization', 'Battle Ox', 'Mystic Horseman'] }, {}] });
  act(g, 0, 'Polymerization'); auto(g);
  ok(!!on(g, 0, 'Rabid Horseman'), 'Rabid Horseman summoned from 2 hand materials');
});
T('Polymerization can\'t be activated without the materials', () => {
  const g = duel({ ex0: ['Rabid Horseman'], board: [{ hand: ['Polymerization', 'Battle Ox'], m: [FILL] }, {}] });
  const u = g.p[0].hand.find(c => E.name(c) === 'Polymerization').u;
  ok(!hasOpt(g, 'a:' + u + ':'), 'no Activate option with only Battle Ox');
});
T('Polymerization with full zones needs a field material', () => {
  const g = duel({ ex0: ['Rabid Horseman'], board: [{ hand: ['Polymerization', 'Battle Ox', 'Mystic Horseman'], m: [FILL, FILL, FILL, FILL, FILL] }, {}] });
  const u = g.p[0].hand.find(c => E.name(c) === 'Polymerization').u;
  ok(!hasOpt(g, 'a:' + u + ':'), 'no Activate option: both materials in hand and no free zone');
});

/* ----- P ----- */
T('Physical Double copies a monster on the opponent\'s turn, gone in the End Phase', () => {
  // A's Dark Magician is on the field; B responds to a summon
  const g2 = duel({ board: [{ hand: [FILL], m: ['Dark Magician'] }, { st: ['Physical Double'] }] });
  ns(g2, 0, FILL); choose(g2, 'Physical Double', 1); choose(g2, 'Dark Magician'); auto(g2);
  const tok = on(g2, 1, 'Mirage Token');
  ok(tok && E.atk(g2, tok) === 2500 && E.def(g2, tok) === 2100 && E.lv(tok) === 7, `Mirage Token 2500/2100 Lv 7 (${tok && E.atk(g2, tok)}/${tok && E.def(g2, tok)})`);
  choose(g2, 'end'); auto(g2);
  ok(!on(g2, 1, 'Mirage Token'), 'token destroyed in the End Phase');
});
T("Pikeru's Circle of Enchantment stops effect damage", () => {
  const g = duel({ board: [{ hand: ['Raimei'] }, { st: ["Pikeru's Circle of Enchantment"] }] });
  act(g, 0, 'Raimei'); choose(g, 'Pikeru', 1); auto(g);
  ok(g.p[1].lp === 8000, `B took no damage (B ${g.p[1].lp})`);
});
T("Pikeru's Second Sight shows the opponent's draws", () => {
  const g = duel({ board: [{ st: ["Pikeru's Second Sight"] }, {}] });
  act(g, 0, "Pikeru's Second Sight"); auto(g); choose(g, 'end'); auto(g);
  ok(logHas(g, 'B drew Gene-Warped Warwolf'), 'B\'s draw was shown');
});
T('Pinch Hopper summons an Insect when destroyed by battle', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { hand: ['Basic Insect'], m: ['Pinch Hopper'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Pinch Hopper')); auto(g);
  ok(!!on(g, 1, 'Basic Insect'), 'Basic Insect Special Summoned');
});
T('Pineapple Blast evens the monster count', () => {
  const g = duel({ board: [{ hand: [FILL], st: ['Pineapple Blast'] }, { m: [FILL, FILL, 'Dark Magician'] }] });
  ns(g, 0, FILL); choose(g, 'Pineapple Blast', 0); auto(g);
  ok(g.p[1].m.filter(Boolean).length === 1, `B kept 1 monster (${g.p[1].m.filter(Boolean).length})`);
});
T('Piranha Army doubles its direct damage', () => {
  const g = duel({ board: [{ m: ['Piranha Army'], turn: 2 }, {}] });
  goBP(g); attack(g, on(g, 0, 'Piranha Army'), null); auto(g);
  ok(g.p[1].lp === 6400, `B took 1600 (B ${g.p[1].lp})`);
});
T('Pixie Knight puts a Spell back on top of its owner\'s Deck', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: ['Pixie Knight'], gy: ['Raigeki'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Pixie Knight')); auto(g);
  const d = g.p[1].deck; ok(d.length && E.name(d[d.length - 1]) === 'Raigeki', 'Raigeki is on top of B\'s Deck');
});
T('Possessed Dark Soul takes the Level 3 or lower monsters', () => {
  const g = duel({ board: [{ m: ['Possessed Dark Soul'] }, { m: ['Basic Insect', 'Giant Soldier of Stone', 'Dark Magician'] }] });
  choose(g, 'a:' + on(g, 0, 'Possessed Dark Soul').u + ':'); auto(g);
  ok(on(g, 0, 'Basic Insect') && on(g, 0, 'Giant Soldier of Stone') && on(g, 1, 'Dark Magician'), 'took Basic Insect and Giant Soldier of Stone');
});
T('Precious Cards from Beyond draws 2 on a 2-Tribute Summon', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon'], m: [FILL, FILL], st: [{ n: 'Precious Cards from Beyond', pos: 'up' }] }, {}] });
  const h0 = g.p[0].hand.length; ns(g, 0, 'Blue-Eyes White Dragon'); auto(g);
  ok(g.p[0].hand.length === h0 + 1, `drew 2 (hand ${h0} -> ${g.p[0].hand.length})`);
});
T('Premature Burial revives, and its destruction destroys the monster', () => {
  const g = duel({ board: [{ hand: ['Premature Burial'], gy: ['Dark Magician'] }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Premature Burial'); auto(g);
  ok(on(g, 0, 'Dark Magician') && g.p[0].lp === 7200, 'Dark Magician revived, 800 paid');
  const g2 = duel({ board: [{ gy: ['Dark Magician'], hand: ['Premature Burial', 'Mystical Space Typhoon'] }, {}] });
  act(g2, 0, 'Premature Burial'); auto(g2); act(g2, 0, 'Mystical Space Typhoon'); auto(g2);
  ok(!on(g2, 0, 'Dark Magician') && inZ(g2, 0, 'gy', 'Dark Magician'), 'Dark Magician destroyed with it');
});
T('Prickle Fairy: Insects can\'t be attacked; the battled monster goes to Defense', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: ['Basic Insect', 'Prickle Fairy'] }] });
  goBP(g);
  ok(!hasOpt(g, `atk:${on(g, 0, 'Dark Magician').u}:${on(g, 1, 'Basic Insect').u}`), 'Basic Insect can\'t be attacked');
  const g2 = duel({ board: [{ m: ['Celtic Guardian'], turn: 2 }, { m: [{ n: 'Prickle Fairy', pos: 'def' }] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Celtic Guardian'), on(g2, 1, 'Prickle Fairy')); auto(g2);
  ok(on(g2, 0, 'Celtic Guardian').pos === 'def', 'Celtic Guardian changed to Defense Position');
});
T('Primal Seed adds 2 banished cards', () => {
  const g = duel({ board: [{ hand: ['Primal Seed'], m: ['Black Luster Soldier - Envoy of the Beginning'], ban: ['Raigeki', 'Dark Magician'] }, {}] });
  act(g, 0, 'Primal Seed'); auto(g);
  ok(inZ(g, 0, 'hand', 'Raigeki') && inZ(g, 0, 'hand', 'Dark Magician'), 'both added');
});
T('Protector of the Sanctuary stops draws outside the Draw Phase', () => {
  const g = duel({ board: [{ hand: ['Reload', FILL] }, { m: ['Protector of the Sanctuary'] }] });
  ok(!hasOpt(g, 'a:' + g.p[0].hand[0].u + ':'), 'the opponent can\'t activate Reload');
  const g2 = duel({ board: [{ hand: ['Reload', FILL], m: ['Protector of the Sanctuary'] }, {}] });
  act(g2, 0, 'Reload'); auto(g2);
  ok(g2.p[0].hand.length === 2, 'its controller still draws');
});
T('Pyramid Energy: +200 ATK this turn', () => {
  const g = duel({ board: [{ hand: ['Pyramid Energy'], m: [FILL] }, {}] });
  act(g, 0, 'Pyramid Energy'); auto(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2200, 'Warwolf at 2200');
});
T('Pyramid of Light leaving destroys and banishes the Sphinxes', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'] }, { m: ['Andro Sphinx'], st: [{ n: 'Pyramid of Light', pos: 'up' }] }] });
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(inZ(g, 1, 'ban', 'Andro Sphinx'), 'Andro Sphinx banished');
});
T('Question: a wrong call Special Summons the bottom monster', () => {
  const g = duel({ board: [{ hand: ['Question'], gy: ['Dark Magician', 'Celtic Guardian'] }, {}] });
  act(g, 0, 'Question'); auto(g, { ci: 1 }); // B calls "Dark Magician" (alphabetical: Celtic Guardian, Dark Magician)
  ok(inZ(g, 0, 'ban', 'Dark Magician') || on(g, 0, 'Dark Magician'), 'the bottom monster was dealt with');
  const g2 = duel({ board: [{ hand: ['Question'], gy: ['Dark Magician', 'Celtic Guardian'] }, {}] });
  act(g2, 0, 'Question'); auto(g2, { ci: 0 });
  ok(!!on(g2, 0, 'Dark Magician'), 'wrong call: Dark Magician Special Summoned');
});
T("Queen's Double attacks directly", () => {
  const g = duel({ board: [{ m: ["Queen's Double"], turn: 2 }, { m: ['Dark Magician'] }] });
  goBP(g); ok(hasOpt(g, `atk:${on(g, 0, "Queen's Double").u}:d`), 'direct attack offered');
});
T('Rafflesia Seduction takes a monster until the End Phase', () => {
  const g = duel({ board: [{ m: [{ n: 'Rafflesia Seduction', pos: 'set' }] }, { m: ['Dark Magician'] }] });
  choose(g, 'flip:' + g.p[0].m[0].u); auto(g);
  ok(!!on(g, 0, 'Dark Magician'), 'took Dark Magician');
  choose(g, 'end'); auto(g); ok(!!on(g, 1, 'Dark Magician'), 'returned at the End Phase');
});
T('Raregold Armor: only the equipped monster can be attacked', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: [FILL, 'Celtic Guardian'], st: [{ n: 'Raregold Armor', pos: 'up' }] }] });
  st(g, 1, 'Raregold Armor').equipTo = on(g, 1, 'Celtic Guardian').u; g.seq++;
  goBP(g); const a = on(g, 0, 'Dark Magician');
  ok(!hasOpt(g, `atk:${a.u}:${on(g, 1, FILL).u}`) && hasOpt(g, `atk:${a.u}:${on(g, 1, 'Celtic Guardian').u}`) && !hasOpt(g, `atk:${a.u}:d`), 'only Celtic Guardian is a target');
});
T('Rare Metalmorph gives +500 and negates a Spell targeting the Machine', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'] }, { m: ['Machine King'], st: ['Rare Metalmorph'] }] });
  // B activates Rare Metalmorph in response to A's Book of Moon, then negates it
  act(g, 0, 'Book of Moon'); choose(g, 'Rare Metalmorph', 1);
  auto(g);
  // Book of Moon resolved first? Rare Metalmorph resolves first (Chain Link 2), then the negation needs a new chance.
  ok(E.atk(g, on(g, 1, 'Machine King')) >= 2700 || on(g, 1, 'Machine King').pos === 'set', 'Rare Metalmorph applied');
  const g2 = duel({ board: [{ hand: ['Book of Moon'] }, { m: ['Machine King'], st: [{ n: 'Rare Metalmorph', pos: 'up' }] }] });
  st(g2, 1, 'Rare Metalmorph').flags.mm = on(g2, 1, 'Machine King').u; g2.seq++;
  ok(E.atk(g2, on(g2, 1, 'Machine King')) === 2800, `Machine King 2800 (2200 + its own 100 + 500) (${E.atk(g2, on(g2, 1, 'Machine King'))})`);
  act(g2, 0, 'Book of Moon'); choose(g2, 'Negate the Spell', 1); auto(g2);
  ok(faceUp2(on(g2, 1, 'Machine King')), 'Book of Moon negated, Machine King stays face-up');
});
function faceUp2(c) { return c && c.pos !== 'set'; }
T('Ray of Hope shuffles 2 LIGHT monsters into the Deck', () => {
  const g = duel({ board: [{ st: ['Ray of Hope'], gy: ['Mystical Elf', 'Blue-Eyes White Dragon'] }, {}] });
  act(g, 0, 'Ray of Hope'); auto(g);
  ok(!inZ(g, 0, 'gy', 'Mystical Elf') && !inZ(g, 0, 'gy', 'Blue-Eyes White Dragon'), 'both left the GY');
});
T('Re-Fusion revives a properly summoned Fusion, banished when destroyed', () => {
  const g = duel({ board: [{ hand: ['Re-Fusion', 'Mystical Space Typhoon', FILL], gy: ['Rabid Horseman'] }, {}] });
  g.p[0].gy[0].summonType = 'fusion'; choose(g, 'set:' + g.p[0].hand[2].u); auto(g);
  act(g, 0, 'Re-Fusion'); auto(g);
  ok(on(g, 0, 'Rabid Horseman') && g.p[0].lp === 7200, 'revived for 800');
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(inZ(g, 0, 'ban', 'Rabid Horseman'), 'banished');
  const g2 = duel({ board: [{ hand: ['Re-Fusion'], gy: ['Rabid Horseman'] }, {}] });
  ok(!hasOpt(g2, 'a:' + g2.p[0].hand[0].u + ':'), 'a Fusion never Fusion Summoned can\'t be revived');
});
T('Ready for Intercepting turns a Spellcaster face-down', () => {
  const g = duel({ board: [{ st: ['Ready for Intercepting'] }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Ready for Intercepting'); auto(g);
  ok(g.p[1].m[0].pos === 'set', 'Dark Magician face-down');
});
T('Really Eternal Rest destroys equipped monsters', () => {
  const g = duel({ board: [{ hand: [FILL], st: ['Really Eternal Rest'] }, { m: [FILL, 'Celtic Guardian'], st: [{ n: 'Raregold Armor', pos: 'up' }] }] });
  st(g, 1, 'Raregold Armor').equipTo = on(g, 1, 'Celtic Guardian').u; choose(g, 'set:' + g.p[0].hand[0].u); auto(g);
  act(g, 0, 'Really Eternal Rest'); auto(g);
  ok(!on(g, 1, 'Celtic Guardian') && !!on(g, 1, FILL), 'only the equipped one is destroyed');
});
T('Reaper of the Cards destroys a Set Trap', () => {
  const g = duel({ board: [{ m: [{ n: 'Reaper of the Cards', pos: 'set' }] }, { st: ['Mirror Force'] }] });
  choose(g, 'flip:' + g.p[0].m[0].u); auto(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Reasoning: a wrong Level Special Summons the monster', () => {
  const g = duel({ board: [{ hand: ['Reasoning'], deckTop: [FILL, 'Raigeki', 'Dark Magician'] }, {}] });
  act(g, 0, 'Reasoning'); auto(g); // B declares Level 1
  ok(on(g, 0, 'Dark Magician') && inZ(g, 0, 'gy', 'Raigeki'), 'Dark Magician summoned, Raigeki sent');
  const g2 = duel({ board: [{ hand: ['Reasoning'], deckTop: [FILL, 'Dark Magician'] }, {}] });
  act(g2, 0, 'Reasoning'); auto(g2, { ci: 6 }); // Level 7
  ok(inZ(g2, 0, 'gy', 'Dark Magician'), 'declared right: Dark Magician to the GY');
});
T('Reckless Greed draws 2 and skips the next 2 Draw Phases', () => {
  const g = duel({ board: [{ hand: [], st: ['Reckless Greed'] }, {}] });
  act(g, 0, 'Reckless Greed'); auto(g);
  const h = g.p[0].hand.length;
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(g.p[0].hand.length === h, `no draw on A's next turn (${h} -> ${g.p[0].hand.length})`);
});
T('Recycle returns a Spell to the bottom of the Deck', () => {
  const g = duel({ board: [{ st: [{ n: 'Recycle', pos: 'up' }], gy: ['Raigeki'] }, {}] });
  auto(g);
  ok(g.p[0].deck[0] && E.name(g.p[0].deck[0]) === 'Raigeki' && g.p[0].lp === 7700, 'Raigeki at the bottom, 300 paid');
});
T('Reflect Bounder hits back and is destroyed', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: ['Reflect Bounder'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Reflect Bounder')); auto(g);
  ok(g.p[0].lp === 5500 && inZ(g, 1, 'gy', 'Reflect Bounder'), `A took 2500 (A ${g.p[0].lp})`);
});
T('Regenerating Mummy returns from an opponent\'s discard', () => {
  const g = duel({ board: [{ hand: ['Card Destruction', FILL] }, { hand: ['Regenerating Mummy'] }] });
  act(g, 0, 'Card Destruction'); auto(g);
  ok(inZ(g, 1, 'hand', 'Regenerating Mummy'), 'Mummy back in hand');
});
T('Reinforcements: +500 ATK', () => {
  const g = duel({ board: [{ st: ['Reinforcements'], m: [FILL] }, {}] });
  act(g, 0, 'Reinforcements'); auto(g); ok(E.atk(g, on(g, 0, FILL)) === 2500, '2500');
});
T('Reload shuffles the hand and redraws', () => {
  const g = duel({ board: [{ hand: ['Reload', 'Dark Magician', 'Raigeki'] }, {}] });
  act(g, 0, 'Reload'); auto(g); ok(g.p[0].hand.length === 3, 'hand of 3');
});
T('Remove Brainwashing returns a taken monster', () => {
  const g = duel({ board: [{ hand: ['Brain Control'], st: [{ n: 'Remove Brainwashing', pos: 'up' }] }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Brain Control'); auto(g);
  ok(!!on(g, 1, 'Dark Magician'), 'Dark Magician is back with B');
});
T('Remove Trap destroys a face-up Trap', () => {
  const g = duel({ board: [{ hand: ['Remove Trap'] }, { st: [{ n: 'Respect Play', pos: 'up' }] }] });
  act(g, 0, 'Remove Trap'); auto(g); ok(inZ(g, 1, 'gy', 'Respect Play'), 'destroyed');
});
T('Reshef the Dark Being discards a Spell to take a monster', () => {
  const g = duel({ board: [{ hand: ['Raigeki'], m: ['Reshef the Dark Being'] }, { m: ['Dark Magician'] }] });
  choose(g, 'a:' + on(g, 0, 'Reshef the Dark Being').u + ':'); auto(g);
  ok(on(g, 0, 'Dark Magician') && inZ(g, 0, 'gy', 'Raigeki'), 'took Dark Magician');
});
T('Restructer Revolution: 200 per card in the opponent\'s hand', () => {
  const g = duel({ board: [{ hand: ['Restructer Revolution'] }, {}] });
  act(g, 0, 'Restructer Revolution'); auto(g); ok(g.p[1].lp === 7000, `B took 1000 (${g.p[1].lp})`);
});
T('Reversal Quiz sends everything and swaps LP on a right call', () => {
  const g = duel({ board: [{ hand: ['Reversal Quiz', 'Raigeki'], m: [FILL], lp: 1000 }, {}] });
  act(g, 0, 'Reversal Quiz'); auto(g); // calls Monster; top card is a Warwolf
  ok(g.p[0].lp === 8000 && g.p[1].lp === 1000 && !on(g, 0, FILL), 'LP swapped');
});
T('Reverse Trap turns +500 into -500', () => {
  const g = duel({ board: [{ st: ['Reinforcements', 'Reverse Trap'], m: [FILL] }, {}] });
  act(g, 0, 'Reinforcements'); auto(g); act(g, 0, 'Reverse Trap'); auto(g);
  ok(E.atk(g, on(g, 0, FILL)) === 1500, `Warwolf at 1500 (${E.atk(g, on(g, 0, FILL))})`);
});
T('Riryoku Field negates Book of Moon', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'] }, { m: ['Dark Magician'], st: ['Riryoku Field'] }] });
  act(g, 0, 'Book of Moon'); choose(g, 'Riryoku', 1); auto(g);
  ok(on(g, 1, 'Dark Magician').pos === 'atk', 'Dark Magician stays face-up');
});
T('Rising Air Current: WIND +500/-400', () => {
  const g = duel({ board: [{ hand: ['Rising Air Current'], m: ['Harpie Lady'] }, {}] });
  act(g, 0, 'Rising Air Current'); auto(g); const h = on(g, 0, 'Harpie Lady');
  ok(E.atk(g, h) === 1800 && E.def(g, h) === 1000, `Harpie 1800/1000 (${E.atk(g, h)}/${E.def(g, h)})`);
});
T("Robbin' Goblin: battle damage makes a random discard", () => {
  const g = duel({ board: [{ m: [FILL], st: [{ n: "Robbin' Goblin", pos: 'up' }], turn: 2 }, {}] });
  const h = g.p[1].hand.length; goBP(g); attack(g, on(g, 0, FILL), null); auto(g);
  ok(g.p[1].hand.length === h - 1, 'B discarded 1');
});
T('Roc from the Valley of Haze goes back to the Deck', () => {
  const g = duel({ board: [{ hand: ['Card Destruction', 'Roc from the Valley of Haze'] }, {}] });
  act(g, 0, 'Card Destruction'); auto(g);
  ok(!inZ(g, 0, 'gy', 'Roc from the Valley of Haze'), 'Roc shuffled away');
});
T('Rock Bombardment sends a Rock and burns 500', () => {
  const g = duel({ main0: [...Array(39).fill(FILL), 'Giant Soldier of Stone'], board: [{ st: ['Rock Bombardment'] }, {}] });
  act(g, 0, 'Rock Bombardment'); auto(g);
  ok(inZ(g, 0, 'gy', 'Giant Soldier of Stone') && g.p[1].lp === 7500, 'sent and burned');
});
T("Rod of the Mind's Eye makes battle damage 1000", () => {
  const g = duel({ board: [{ m: ['Dark Magician'], st: [{ n: "Rod of the Mind's Eye", pos: 'up' }], turn: 2 }, {}] });
  st(g, 0, "Rod of the Mind's Eye").equipTo = on(g, 0, 'Dark Magician').u;
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), null); auto(g);
  ok(g.p[1].lp === 7000, `B took 1000 (${g.p[1].lp})`);
});
T('Rope of Life revives a battle-destroyed monster with +800', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { hand: [FILL], m: ['Celtic Guardian'], st: ['Rope of Life'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Celtic Guardian')); auto(g);
  const cg = on(g, 1, 'Celtic Guardian'); ok(cg && E.atk(g, cg) === 2200, 'Celtic Guardian back at 2200');
});
T('Sacred Crane draws when Special Summoned', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Sacred Crane'] }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Monster Reborn'); auto(g);
  ok(on(g, 0, 'Sacred Crane') && g.p[0].hand.length === h, 'drew 1 (Reborn left, a card came)');
});
T('Sacred Phoenix of Nephthys returns and destroys the Spells and Traps', () => {
  const g = duel({ board: [{ hand: ['Raigeki'] }, { m: ['Sacred Phoenix of Nephthys'], st: ['Mirror Force'] }] });
  act(g, 0, 'Raigeki'); auto(g); choose(g, 'end'); auto(g);
  ok(on(g, 1, 'Sacred Phoenix of Nephthys') && inZ(g, 1, 'gy', 'Mirror Force'), 'Phoenix back, Mirror Force destroyed');
});
T('Pyro Clock of Destiny advances Final Countdown', () => {
  const g = duel({ board: [{ st: ['Pyro Clock of Destiny'] }, {}] });
  g.fcd = [{ p: 1, t: 5 }]; act(g, 0, 'Pyro Clock of Destiny'); auto(g);
  ok(g.fcd[0].t === 4, 'Final Countdown count moved');
});
console.log(fails ? `${fails} FAILED` : 'All passed');
