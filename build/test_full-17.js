// Scenario checks for full pool batch 17: node build/test_full-17.js
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

const endTurn = g => { choose(g, 'end'); auto(g); };
const P = g => g.prompt ? `${g.prompt.p}:${g.prompt.type} ${g.prompt.text}` : 'none';
const nM = (g, p) => g.p[p].m.filter(Boolean).length;
// answer everything up to the next free action, saying yes to optional effects
const yesTo = g => { for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else auto(g); } };

T('Venus pays 500 and summons Mystical Shine Ball', () => {
  const g = duel({ board: [{ hand: [], m: ['The Agent of Creation - Venus'], deckTop: ['Mystical Shine Ball'] }, {}] });
  choose(g, 'Mystical Shine Ball'); auto(g);
  ok(on(g, 0, 'Mystical Shine Ball') && g.p[0].lp === 7500, `Shine Ball summoned, 500 paid (${g.p[0].lp})`);
});
T('Mars gains the LP difference with The Sanctuary', () => {
  const g = duel({ board: [{ hand: [], m: ['The Agent of Force - Mars'], lp: 9000 }, {}] });
  ok(E.atk(g, on(g, 0, 'The Agent of Force - Mars')) === 0, 'no Sanctuary: 0 ATK');
  const g2 = duel({ board: [{ hand: ['The Sanctuary in the Sky'], m: ['The Agent of Force - Mars'], lp: 9000 }, {}] });
  act(g2, 0, 'The Sanctuary in the Sky'); auto(g2);
  const m2 = on(g2, 0, 'The Agent of Force - Mars'); ok(E.atk(g2, m2) === 1000 && E.def(g2, m2) === 1000, `1000 ATK/DEF (${E.atk(g2, m2)})`);
});
T('Saturn: Tribute for the LP difference, no Battle Phase', () => {
  const g = duel({ board: [{ hand: ['The Sanctuary in the Sky'], m: ['The Agent of Judgment - Saturn'], lp: 10000, turn: 3 }, {}] });
  act(g, 0, 'The Sanctuary in the Sky'); auto(g);
  choose(g, 'Tribute: damage'); auto(g);
  ok(g.p[1].lp === 6000 && inZ(g, 0, 'gy', 'The Agent of Judgment - Saturn'), `2000 damage (${g.p[1].lp})`);
  ok(!hasOpt(g, 'Battle Phase'), 'no Battle Phase offered');
});
T('Mercury draws when your hand was empty', () => {
  const g = duel({ board: [{ hand: [], m: ['The Agent of Wisdom - Mercury'], turn: 2 }, {}] });
  ok(g.p[0].hand.length === 2, `drew 1 more in the Standby Phase (hand ${g.p[0].hand.length})`);
  const g2 = duel({ board: [{ hand: [FILL], m: ['The Agent of Wisdom - Mercury'], turn: 2 }, {}] });
  ok(g2.p[0].hand.length === 2, `no extra draw with a card in hand (hand ${g2.p[0].hand.length})`);
});
T('Hex-Sealed Fusion stands in for a Fusion Material and summons the Fusion', () => {
  const g = duel({ ex0: ['Thousand Dragon'], board: [{ hand: [], m: ['The Light - Hex-Sealed Fusion', 'Time Wizard'] }, {}] });
  ok(!hasOpt(g, 'LIGHT Fusion'), 'Thousand Dragon is WIND: not offered by the LIGHT one');
  const g3 = duel({ ex0: ['Twin-Headed Thunder Dragon'], board: [{ hand: [], m: ['The Light - Hex-Sealed Fusion', 'Thunder Dragon'] }, {}] });
  choose(g3, 'LIGHT Fusion'); auto(g3);
  ok(on(g3, 0, 'Twin-Headed Thunder Dragon') && inZ(g3, 0, 'gy', 'Thunder Dragon') && inZ(g3, 0, 'gy', 'The Light - Hex-Sealed Fusion'), 'Twin-Headed Thunder Dragon summoned');
});
T('Thousand Energy: +1000, then destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Thousand Energy'], m: ['Basic Insect', 'Time Wizard'] }, {}] });
  act(g, 0, 'Thousand Energy'); auto(g);
  ok(E.atk(g, on(g, 0, 'Basic Insect')) === 1500 && E.atk(g, on(g, 0, 'Time Wizard')) === 500, 'Basic Insect 1500, Time Wizard (Effect) unchanged');
  endTurn(g);
  ok(inZ(g, 0, 'gy', 'Basic Insect') && on(g, 0, 'Time Wizard'), 'Basic Insect destroyed in the End Phase');
});
T('Thousand Knives needs Dark Magician', () => {
  const g = duel({ board: [{ hand: ['Thousand Knives'], m: ['Dark Magician'] }, { m: [FILL] }] });
  act(g, 0, 'Thousand Knives'); auto(g); ok(inZ(g, 1, 'gy', FILL), 'destroyed');
  const g2 = duel({ board: [{ hand: ['Thousand Knives'], m: [FILL] }, { m: [FILL] }] });
  ok(!hasOpt(g2, 'a:' + g2.p[0].hand.find(c => E.name(c) === 'Thousand Knives').u), 'not without Dark Magician');
});
T('Thousand Needles destroys a weaker attacker', () => {
  const g = duel({ board: [{ hand: [], m: ['Mystical Shine Ball'], turn: 2 }, { m: [{ n: 'Thousand Needles', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Mystical Shine Ball'), on(g, 1, 'Thousand Needles')); auto(g);
  ok(inZ(g, 0, 'gy', 'Mystical Shine Ball') && on(g, 1, 'Thousand Needles'), 'Shine Ball (500) destroyed');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Two Thousand Needles', pos: 'def' }] }] });
  goBP(g2); attack(g2, on(g2, 0, FILL), on(g2, 1, 'Two Thousand Needles')); auto(g2);
  ok(inZ(g2, 1, 'gy', 'Two Thousand Needles') && on(g2, 0, FILL), '2000 ATK beats 1800 DEF, attacker stays');
});
T("Thousand-Eyes Jellyfish: Tribute Ocean's Keeper only", () => {
  const g = duel({ board: [{ hand: ['Thousand-Eyes Jellyfish'], m: [FILL] }, {}] });
  ok(!hasOpt(g, 'Ocean') && !hasOpt(g, 'ns:' + g.p[0].hand[0].u), "no summon without Ocean's Keeper");
  const g2 = duel({ board: [{ hand: ['Thousand-Eyes Jellyfish'], m: ["Ocean's Keeper"] }, {}] });
  choose(g2, "Tribute Ocean's Keeper"); auto(g2);
  ok(on(g2, 0, 'Thousand-Eyes Jellyfish'), 'summoned');
  ok(E.lib.forbid(g2, { type: 'ss', c: { ...on(g2, 0, 'Thousand-Eyes Jellyfish'), zone: 'gy' }, p: 0, how: 'special' }), 'no revival from the GY');
});
T('Thousand-Eyes Restrict equips, copies stats, survives battle, locks attacks', () => {
  const g = duel({ board: [{ hand: [], m: ['Thousand-Eyes Restrict', FILL], turn: 2 }, { m: ['Time Wizard', 'Thousand Needles'] }] });
  ok(E.lib.forbid(g, { type: 'attack', c: on(g, 0, FILL) }), 'other monsters cannot attack');
  choose(g, 'Equip an opponent'); choose(g, 'Thousand Needles'); auto(g);
  const r = on(g, 0, 'Thousand-Eyes Restrict');
  ok(E.atk(g, r) === 1000 && E.def(g, r) === 1800, `1000/1800 (${E.atk(g, r)}/${E.def(g, r)})`);
  const g2 = duel({ board: [{ hand: ['Thunder Crash'], m: ['Thousand-Eyes Restrict'] }, { m: [{ n: FILL, pos: 'set' }] }] });
  choose(g2, 'Equip an opponent'); choose(g2, 'face-down'); auto(g2);
  ok(E.atk(g2, on(g2, 0, 'Thousand-Eyes Restrict')) === 0, 'a face-down monster gives 0 ATK');
});
T('Thousand-Eyes Restrict: the equipped monster is destroyed instead', () => {
  const g = duel({ board: [{ hand: [], m: ['Thousand-Eyes Restrict'], turn: 2 }, { m: ['Time Wizard', FILL] }] });
  choose(g, 'Equip an opponent'); choose(g, 'Time Wizard'); auto(g);
  const r = on(g, 0, 'Thousand-Eyes Restrict'); goBP(g); attack(g, r, on(g, 1, FILL)); auto(g);
  ok(on(g, 0, 'Thousand-Eyes Restrict') && inZ(g, 1, 'gy', 'Time Wizard') && g.p[0].lp === 6500, `Restrict stays, Time Wizard destroyed instead (${g.p[0].lp})`);
});
T('Thunder Crash and Thunder Nyan Nyan', () => {
  const g = duel({ board: [{ hand: ['Thunder Crash'], m: [FILL, 'Basic Insect'] }, {}] });
  act(g, 0, 'Thunder Crash'); auto(g);
  ok(g.p[1].lp === 7400 && nM(g, 0) === 0, `600 damage (${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: [FILL], m: ['Thunder Nyan Nyan'] }, {}] });
  choose(g2, 'ns:'); auto(g2);
  ok(inZ(g2, 0, 'gy', 'Thunder Nyan Nyan'), 'Nyan Nyan destroyed by a non-LIGHT monster');
});
T('Thunder Dragon adds 2 Thunder Dragon', () => {
  const g = duel({ board: [{ hand: ['Thunder Dragon'], deckTop: ['Thunder Dragon', 'Thunder Dragon'] }, {}] });
  choose(g, 'Discard: add'); auto(g);
  ok(g.p[0].hand.filter(c => E.name(c) === 'Thunder Dragon').length === 2 && inZ(g, 0, 'gy', 'Thunder Dragon'), '2 added, 1 discarded');
});
T('Thunder of Ruler stops the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Thunder of Ruler'] }] });
  ok(g.prompt.type === 'yesno' && g.prompt.p === 1, "B is offered Thunder of Ruler in A's Standby Phase"); choose(g, 'yes'); auto(g);
  ok(inZ(g, 1, 'gy', 'Thunder of Ruler') && !hasOpt(g, 'Battle Phase'), 'used, and A has no Battle Phase');
});
T('Time Machine brings back a monster destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Basic Insect', pos: 'def' }], st: ['Time Machine'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Basic Insect')); yesTo(g);
  const b = on(g, 1, 'Basic Insect'); ok(b && b.pos === 'def' && inZ(g, 1, 'gy', 'Time Machine'), 'Basic Insect back in Defense Position');
});
T('Time Passage raises a Fortune Lady 3 Levels until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Time Passage'], m: ['Fortune Lady Light'] }, {}] });
  passAll(g); const f = on(g, 0, 'Fortune Lady Light'); const l0 = E.lv(f);
  act(g, 0, 'Time Passage'); auto(g); ok(E.lv(f) === l0 + 3, `Level ${l0} to ${E.lv(f)}`);
  endTurn(g); ok(E.lv(f) === l0, `back to Level ${E.lv(f)}`);
});
T('Time Seal skips the next Draw Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Time Seal'], turn: 2 }, {}] });
  act(g, 0, 'Time Seal'); auto(g); endTurn(g);
  ok(g.tp === 1 && g.p[1].hand.length === 5, `B skipped the draw (hand ${g.p[1].hand.length})`);
});
T('Time Wizard: right call destroys their monsters, wrong call hurts you', () => {
  let right = 0, wrong = 0;
  for (let s = 1; s <= 8; s++) {
    const g = duel({ seed: s, board: [{ hand: [], m: ['Time Wizard', FILL] }, { m: ['Basic Insect'] }] });
    choose(g, 'Toss a coin'); auto(g); if (g.prompt && g.prompt.type === 'choose') choose(g, 'Heads'); auto(g);
    if (inZ(g, 1, 'gy', 'Basic Insect') && on(g, 0, FILL)) right++;
    else if (inZ(g, 0, 'gy', FILL) && g.p[0].lp === 8000 - 1250) wrong++;
  }
  ok(right + wrong === 8 && right && wrong, `right ${right}, wrong ${wrong} (wrong: 1250 damage)`);
});
T('Toon World and Toon Mermaid', () => {
  const g = duel({ board: [{ hand: ['Toon World', 'Toon Mermaid'], turn: 2 }, { m: [FILL] }] });
  ok(!hasOpt(g, 'Special Summon (Toon World)'), 'no Toon Mermaid without Toon World');
  act(g, 0, 'Toon World'); auto(g); ok(g.p[0].lp === 7000, 'paid 1000');
  choose(g, 'Special Summon (Toon World)'); auto(g);
  const m = on(g, 0, 'Toon Mermaid'); ok(m, 'Toon Mermaid summoned');
  goBP(g); ok(!hasOpt(g, 'atk:' + m.u), 'cannot attack the turn it was summoned');
});
T('Toon Mermaid attacks directly for 500 LP and dies with Toon World', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Toon Mermaid'], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, { m: [FILL] }] });
  const m = on(g, 0, 'Toon Mermaid'); goBP(g); attack(g, m, null); auto(g);
  ok(g.p[1].lp === 6600 && g.p[0].lp === 7500, `1400 direct, 500 paid (A ${g.p[0].lp}, B ${g.p[1].lp})`);
  choose(g, 'endbp'); auto(g); act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(inZ(g, 0, 'gy', 'Toon Mermaid'), 'destroyed with Toon World');
});
T('Toon Gemini Elf and Masked Sorcerer on battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Toon Gemini Elf', 'Toon Masked Sorcerer'], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, { hand: [FILL, FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Toon Gemini Elf'), null); auto(g);
  ok(g.p[1].hand.length === 1, 'they discarded 1 at random');
  const h = g.p[0].hand.length; attack(g, on(g, 0, 'Toon Masked Sorcerer'), null); auto(g);
  ok(g.p[0].hand.length === h + 1, 'Masked Sorcerer drew 1');
});
T('Toon Goblin Attack Force goes to Defense after attacking', () => {
  const g = duel({ board: [{ hand: [], m: ['Toon Goblin Attack Force'], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, {}] });
  const t = on(g, 0, 'Toon Goblin Attack Force'); goBP(g); attack(g, t, null); auto(g); choose(g, 'endbp'); auto(g);
  ok(t.pos === 'def' && g.p[1].lp === 5700, `Defense Position after 2300 direct (${t.pos}, ${g.p[1].lp})`);
});
T('Toon Cannon Soldier and Toon Dark Magician Girl', () => {
  const g = duel({ board: [{ hand: [], m: ['Toon Cannon Soldier', FILL] }, {}] });
  choose(g, 'Tribute: 500'); choose(g, FILL); auto(g); ok(g.p[1].lp === 7500, '500 damage');
  const g2 = duel({ board: [{ hand: ['Toon Dark Magician Girl'], m: [FILL], st: [{ n: 'Toon World', pos: 'up' }], gy: ['Dark Magician'], turn: 2 }, { gy: ['Dark Magician'] }] });
  choose(g2, 'Tribute 1, Toon World'); auto(g2); const d = on(g2, 0, 'Toon Dark Magician Girl');
  ok(d && E.atk(g2, d) === 2600, `2600 ATK (${d && E.atk(g2, d)})`);
  goBP(g2); ok(hasOpt(g2, 'atk:' + d.u + ':d'), 'can attack directly the turn it was summoned (no wait in its text)');
});
T('Toon Defense turns an attack on a Toon into a direct attack', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Toon Masked Sorcerer'], st: ['Toon Defense', { n: 'Toon World', pos: 'up' }] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Toon Masked Sorcerer'));
  choose(g, 'Toon Defense', 1); yesTo(g);
  ok(g.p[1].lp === 6000 && on(g, 1, 'Toon Masked Sorcerer'), `2000 direct, the Toon is safe (${g.p[1].lp})`);
});
T('Toon Table of Contents', () => {
  const g = duel({ board: [{ hand: ['Toon Table of Contents'], deckTop: [FILL, 'Toon World'] }, {}] });
  act(g, 0, 'Toon Table of Contents'); auto(g); ok(inZ(g, 0, 'hand', 'Toon World'), 'Toon World added');
});
T('Tornado needs 3 of their Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['Tornado'] }, { st: ['Time Seal', 'Time Machine'] }] });
  ok(!hasOpt(g, 'a:' + g.p[0].hand.find(c => E.name(c) === 'Tornado').u), 'not with 2');
  const g2 = duel({ board: [{ hand: ['Tornado'] }, { st: ['Time Seal', 'Time Machine', 'Trap Jammer'] }] });
  act(g2, 0, 'Tornado'); auto(g2); ok(g2.p[1].st.filter(Boolean).length === 2, 'destroyed 1');
});
T('Tornado Bird returns 2 Spells/Traps when flipped', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Tornado Bird', pos: 'set' }], turn: 2 }, { st: ['Time Seal', 'Time Machine'] }] });
  choose(g, 'Flip Summon'); auto(g);
  ok(inZ(g, 1, 'hand', 'Time Seal') && inZ(g, 1, 'hand', 'Time Machine'), 'both returned');
});
T('Tornado Wall stops battle damage with Umi', () => {
  const g = duel({ board: [{ hand: [], m: ['Basic Insect'], turn: 2 }, { st: [{ n: 'Tornado Wall', pos: 'up' }] }] });
  g.p[1].fz = null;
  const g2 = duel({ board: [{ hand: ['A Legendary Ocean'], m: ['Basic Insect'], turn: 2 }, { st: [{ n: 'Tornado Wall', pos: 'up' }] }] });
  act(g2, 0, 'A Legendary Ocean'); auto(g2); goBP(g2); attack(g2, on(g2, 0, 'Basic Insect'), null); auto(g2);
  ok(g2.p[1].lp === 8000, `no damage with Umi (${g2.p[1].lp})`);
});
T('Trap Eater summons by sending their face-up Trap', () => {
  const g = duel({ board: [{ hand: ['Trap Eater'] }, { st: [{ n: 'Tornado Wall', pos: 'up' }] }] });
  choose(g, 'send their face-up Trap'); auto(g);
  ok(on(g, 0, 'Trap Eater') && inZ(g, 1, 'gy', 'Tornado Wall'), 'summoned, Tornado Wall in the GY');
});
T('Trap Jammer negates a Trap in the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Trap Jammer'], turn: 2 }, { st: ['Mirror Force'] }] });
  goBP(g); attack(g, on(g, 0, FILL), null); choose(g, 'Mirror Force', 1); choose(g, 'Trap Jammer', 0); auto(g);
  ok(on(g, 0, FILL) && inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force negated and destroyed');
});
T('Trap Master destroys a Trap, leaves a Spell', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Trap Master', pos: 'set' }], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'Flip Summon'); auto(g); ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
  const g2 = duel({ board: [{ hand: [], m: [{ n: 'Trap Master', pos: 'set' }], turn: 2 }, { st: ['Mystical Space Typhoon'] }] });
  choose(g2, 'Flip Summon'); auto(g2); ok(inZ(g2, 1, 'st', 'Mystical Space Typhoon'), 'Set Spell stays');
});
T('Trap of Board Eraser negates burn and makes them discard', () => {
  const g = duel({ board: [{ hand: [], m: ['Toon Cannon Soldier', FILL] }, { st: ['Trap of Board Eraser'] }] });
  choose(g, 'Tribute: 500'); choose(g, FILL); choose(g, 'Board Eraser', 1); auto(g);
  ok(g.p[1].lp === 8000 && g.p[0].hand.length === 0, `no damage, A discarded (B ${g.p[1].lp}, A hand ${g.p[0].hand.length})`);
});
T('Trap of Darkness copies Time Seal', () => {
  const g = duel({ board: [{ hand: [], st: ['Trap of Darkness'], gy: ['Time Seal'], lp: 3000, turn: 2 }, {}] });
  act(g, 0, 'Trap of Darkness'); auto(g);
  ok(g.p[0].lp === 2000 && inZ(g, 0, 'ban', 'Time Seal'), `paid 1000, Time Seal banished (${g.p[0].lp})`);
  endTurn(g); ok(g.tp === 1 && g.p[1].hand.length === 5, `B skipped the draw (hand ${g.p[1].hand.length})`);
  const g2 = duel({ board: [{ hand: [], st: ['Trap of Darkness'], gy: ['Time Seal'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'Trap of Darkness') && !hasOpt(g2, 'a:' + g2.p[0].st[0].u), 'not above 3000 LP');
});
T('Trap of the Imperial Tomb after taking their Zombie', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], st: ['Trap of the Imperial Tomb'], turn: 2 }, { gy: ['Clown Zombie'], m: [FILL], st: ['Time Seal'] }] });
  act(g, 0, 'Monster Reborn'); for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'respond' && !/summon/i.test(g.prompt.text); i++) E.act(g, ['pass']);
  for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Clown Zombie');
  // it answers in the summon's response window (2026-11-27: once both players pass, the summon's moment is over)
  for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'respond' && !hasOpt(g, 'a:' + g.p[0].st[0].u); i++) E.act(g, ['pass']);
  ok(on(g, 0, 'Clown Zombie') && hasOpt(g, 'a:' + g.p[0].st[0].u), 'offered after the Zombie came from their GY');
  choose(g, 'a:' + g.p[0].st[0].u); E.act(g, [FILL, 'Time Seal'].map(n => g.prompt.opts.find(o => o.label === n || (n === 'Time Seal' && o.label === 'Face-down card')).key)); auto(g);
  ok(inZ(g, 1, 'gy', FILL) && nM(g, 1) === 0, '2 cards destroyed');
});
T('Trap Reactor Y FI destroys a Trap and burns', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Trap Reactor Y FI'], turn: 2 }, { st: ['Mirror Force'] }] });
  goBP(g); attack(g, on(g, 0, FILL), null); choose(g, 'Mirror Force', 1); choose(g, 'Destroy that Trap', 0); auto(g);
  ok(g.p[1].lp === 7200 && inZ(g, 1, 'gy', 'Mirror Force'), `800 damage (${g.p[1].lp})`);
  ok(!on(g, 0, FILL), 'Mirror Force still resolved (rulings)');
});
T('Trap Reclamation returns the Trap to the hand', () => {
  const g = duel({ board: [{ hand: [FILL], st: ['Time Seal', 'Trap Reclamation'], turn: 2 }, {}] });
  act(g, 0, 'Time Seal'); choose(g, 'Trap Reclamation', 0); auto(g);
  ok(inZ(g, 0, 'hand', 'Time Seal') && inZ(g, 0, 'gy', 'Trap Reclamation'), 'Time Seal back in the hand');
});
T('Twin-Barrel Dragon tosses 2 coins', () => {
  let hits = 0;
  for (let s = 1; s <= 10; s++) { const g = duel({ seed: s, board: [{ hand: ['Twin-Barrel Dragon'] }, { st: ['Time Seal'] }] }); choose(g, 'ns:'); auto(g); if (inZ(g, 1, 'gy', 'Time Seal')) hits++; }
  ok(hits > 0 && hits < 10, `destroyed in ${hits}/10`);
});
T('Twin-Headed Behemoth comes back once per Duel at 1000/1000', () => {
  const g = duel({ board: [{ hand: ['Thunder Crash'], m: ['Twin-Headed Behemoth'] }, {}] });
  act(g, 0, 'Thunder Crash'); auto(g); choose(g, 'end'); yesTo(g);
  const b = on(g, 0, 'Twin-Headed Behemoth'); ok(b && E.atk(g, b) === 1000 && E.def(g, b) === 1000, 'back with 1000/1000');
});
T('Twin-Headed Wolf negates the Flip effect of the monster it destroys', () => {
  const g = duel({ board: [{ hand: [], m: ['Twin-Headed Wolf', 'Trap Eater'], turn: 2 }, { m: [{ n: 'Tornado Bird', pos: 'set' }], st: ['Time Seal', 'Time Machine'] }] });
  goBP(g); attack(g, on(g, 0, 'Twin-Headed Wolf'), on(g, 1, 'Tornado Bird')); auto(g, { no: true });
  ok(inZ(g, 1, 'gy', 'Tornado Bird') && inZ(g, 1, 'st', 'Time Seal'), 'Tornado Bird destroyed, its Flip effect negated');
  const g2 = duel({ board: [{ hand: [], m: ['Twin-Headed Wolf'], turn: 2 }, { m: [{ n: 'Tornado Bird', pos: 'set' }], st: ['Time Seal', 'Time Machine'] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Twin-Headed Wolf'), on(g2, 1, 'Tornado Bird')); auto(g2, { no: true });
  ok(!inZ(g2, 1, 'st', 'Time Seal'), 'no other Fiend: the Flip effect resolves');
});
T('Twin-Shield Defender halves ATK', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Twin-Shield Defender'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Twin-Shield Defender')); yesTo(g);
  ok(E.atk(g, on(g, 0, FILL)) === 1000, `ATK halved (${E.atk(g, on(g, 0, FILL))})`);
});
T('Twin-Sword Marauder attacks twice after a Defense target, piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Twin-Sword Marauder'], turn: 2 }, { m: [{ n: 'Basic Insect', pos: 'def' }, { n: 'Mystical Shine Ball', pos: 'def' }] }] });
  const t = on(g, 0, 'Twin-Sword Marauder'); goBP(g); attack(g, t, on(g, 1, 'Basic Insect')); auto(g);
  ok(g.p[1].lp === 8000 - 900, `piercing 900 (${g.p[1].lp})`);
  ok(hasOpt(g, 'atk:' + t.u), 'second attack offered');
});
T('Twin Swords of Flashing Light - Tryce', () => {
  const g = duel({ board: [{ hand: ['Twin Swords of Flashing Light - Tryce', 'Time Seal'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Twin Swords of Flashing Light - Tryce'); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) { const o = g.prompt.opts.find(x => x.label === 'Time Seal') || g.prompt.opts[0]; E.act(g, [o.key]); } auto(g);
  const w = on(g, 0, FILL); ok(E.atk(g, w) === 1500 && inZ(g, 0, 'gy', 'Time Seal'), '1500 ATK, Time Seal sent');
  goBP(g); attack(g, w, null); auto(g); attack(g, w, null); auto(g);
  ok(g.p[1].lp === 5000, `attacked twice (${g.p[1].lp})`);
});
T('Two-Man Cell Battle summons in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Two-Man Cell Battle', FILL] }, {}] });
  act(g, 0, 'Two-Man Cell Battle'); auto(g); choose(g, 'end'); yesTo(g);
  ok(on(g, 0, FILL), 'Warwolf summoned');
});
T('Two-Pronged Attack', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Basic Insect'], st: ['Two-Pronged Attack'], turn: 2 }, { m: ['Time Wizard'] }] });
  act(g, 0, 'Two-Pronged Attack'); auto(g);
  ok(nM(g, 0) === 0 && nM(g, 1) === 0, 'all 3 destroyed');
});
T('Ultimate Ancient Gear Golem: no Spell/Trap on attack, revives Ancient Gear Golem', () => {
  const g = duel({ ex0: ['Ultimate Ancient Gear Golem'], board: [{ hand: [], m: [FILL], turn: 2 }, {}] });
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].extra[0], p: 0, how: 'special' }), 'cannot be Special Summoned except by Fusion');
  const g2 = duel({ board: [{ hand: [], m: ['Ultimate Ancient Gear Golem'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }], st: ['Mirror Force', 'Two-Pronged Attack'] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Ultimate Ancient Gear Golem'), on(g2, 1, FILL));
  ok(!hasOpt(g2, 'a:'), 'no Trap activation during its attack');
  auto(g2); ok(g2.p[1].lp === 8000 - 4300, `piercing 4300 (${g2.p[1].lp})`);
  const g3 = duel({ board: [{ hand: ['Thunder Crash'], m: ['Ultimate Ancient Gear Golem'], gy: ['Ancient Gear Golem'] }, {}] });
  act(g3, 0, 'Thunder Crash'); yesTo(g3);
  ok(on(g3, 0, 'Ancient Gear Golem'), 'Ancient Gear Golem revived');
});
T('Ultimate Baseball Kid', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Baseball Kid', 'Blazing Inpachi'] }, { m: ['Battle Footballer'] }] });
  const k = on(g, 0, 'Ultimate Baseball Kid'); ok(E.atk(g, k) === 2500, `2500 ATK (${E.atk(g, k)})`);
  choose(g, 'Send a FIRE'); auto(g); ok(g.p[1].lp === 7500 && E.atk(g, k) === 1500, '500 damage, now 1500');
});
T('Toon Summoned Skull (Archfiend) needs 1 Tribute and Toon World', () => {
  const g = duel({ board: [{ hand: ['Toon Summoned Skull (Archfiend)'], m: [FILL], st: [{ n: 'Toon World', pos: 'up' }] }, {}] });
  choose(g, 'Tribute 1, Toon World'); auto(g); ok(on(g, 0, 'Toon Summoned Skull (Archfiend)') && inZ(g, 0, 'gy', FILL), 'summoned');
});
T('Ultimate Insect LV5 to LV7', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Insect LV5'], deckTop: ['Ultimate Insect LV7'], turn: 2 }, { m: [FILL] }] });
  yesTo(g); const l7 = on(g, 0, 'Ultimate Insect LV7'), w = on(g, 1, FILL);
  ok(l7 && E.atk(g, w) === 1300 && E.def(g, w) === 0, `LV7 summoned, Warwolf 1300/${E.def(g, w)}`);
});
T('Ultimate Insect LV1 to LV3', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Insect LV1'], deckTop: ['Ultimate Insect LV3'], turn: 2 }, { m: [FILL] }] });
  yesTo(g);
  const l3 = on(g, 0, 'Ultimate Insect LV3'); ok(l3 && E.atk(g, on(g, 1, FILL)) === 1700, `LV3 summoned, Warwolf 1700 (${E.atk(g, on(g, 1, FILL))})`);
  const g2 = duel({ board: [{ hand: [], m: ['Ultimate Insect LV3'], turn: 2 }, { m: [FILL] }] });
  ok(E.atk(g2, on(g2, 1, FILL)) === 2000, 'a LV3 not summoned by LV1 gives no drop');
});
T('Ultimate Obedient Fiend attack rule and negation', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Obedient Fiend'], turn: 2 }, { m: [FILL] }] });
  goBP(g); ok(!hasOpt(g, 'atk:'), 'cannot attack with a card in hand');
  const g2 = duel({ board: [{ hand: [], m: ['Ultimate Obedient Fiend'], deckTop: ['Time Seal'], turn: 2 }, { m: [{ n: 'Tornado Bird', pos: 'set' }], st: ['Time Seal', 'Time Machine'] }] });
  choose(g2, 'setst:'); passAll(g2); goBP(g2); ok(!hasOpt(g2, 'atk:'), 'cannot attack with a Spell/Trap on the field');   // the opponent may respond to the Set first (2026-11-27 audit)
  const g3 = duel({ board: [{ hand: [], m: ['Ultimate Obedient Fiend'], turn: 2 }, { m: [{ n: 'Tornado Bird', pos: 'set' }], st: ['Time Seal', 'Time Machine'] }] });
  for (const c of g3.p[0].hand.splice(0)) { c.zone = 'deck'; g3.p[0].deck.unshift(c); } g3.seq++;
  const u = on(g3, 0, 'Ultimate Obedient Fiend'); goBP(g3); attack(g3, u, on(g3, 1, 'Tornado Bird')); auto(g3, { no: true });
  ok(inZ(g3, 1, 'gy', 'Tornado Bird') && inZ(g3, 1, 'st', 'Time Seal'), 'alone with no hand it attacks; the destroyed Flip monster is negated');
  const g4 = duel({ board: [{ hand: [], m: ['Ultimate Obedient Fiend'], turn: 2 }, { m: ['Sangan'] }] });
  for (const c of g4.p[0].hand.splice(0)) { c.zone = 'deck'; g4.p[0].deck.unshift(c); } g4.seq++;
  goBP(g4); attack(g4, on(g4, 0, 'Ultimate Obedient Fiend'), on(g4, 1, 'Sangan')); yesTo(g4);
  ok(inZ(g4, 1, 'gy', 'Sangan') && !g4.log.some(l => /Sangan's effect|activated Sangan/.test(l)), 'Sangan\'s GY effect is negated');
});
T('Ultimate Tyranno attacks every monster, others wait', () => {
  const g = duel({ board: [{ hand: [], m: ['Ultimate Tyranno', FILL], turn: 2 }, { m: ['Basic Insect', 'Mystical Shine Ball'] }] });
  const t = on(g, 0, 'Ultimate Tyranno'), w = on(g, 0, FILL); goBP(g);
  ok(!hasOpt(g, 'atk:' + w.u), 'Warwolf cannot attack first');
  attack(g, t, on(g, 1, 'Basic Insect')); auto(g); attack(g, t, on(g, 1, 'Mystical Shine Ball')); auto(g);
  ok(nM(g, 1) === 0, 'both destroyed');
  ok(hasOpt(g, 'atk:' + w.u), 'Warwolf can attack once Tyranno is done');
});
console.log(fails ? `\n${fails} failed` : '\nAll batch 17 checks passed.');
process.exit(fails ? 1 : 0);
