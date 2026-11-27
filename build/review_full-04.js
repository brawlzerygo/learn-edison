// Independent review checks for full pool batch 04 (written from the card text): node build/review_full-04.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
let lastG; function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) { fails++; if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ') + '\n   prompt: ' + (lastG.prompt ? lastG.prompt.p + ' ' + lastG.prompt.type + ' ' + lastG.prompt.text + ' :: ' + lastG.prompt.opts.map(x => x.label + '[' + x.key + ']').join(', ') : 'none')); } }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ')); } };
// answer prompts until an idle prompt (or one of the stop types): passes responses, yes to yes/no, picks by label
function settle(g, ...picks) { for (let i = 0; i < 60 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const k = picks.find(t => pr.opts.some(x => x.key !== 'pass' && (x.label + ' ' + x.key).includes(t))); if (k) choose(g, k); else E.act(g, ['pass']); }
  else if (pr.type === 'yesno') choose(g, 'yes');
  else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => x.label.includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); }
    for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); E.act(g, ks); } } }
const attack = (g, aName, tLabel) => { choose(g, 'atk:' + on(g, 0, aName).u + ':' + (tLabel === 'd' ? 'd' : '')); };
const bp = g => { choose(g, 'bp'); settle(g); };
const atkOn = (g, aName, tName) => { const a = on(g, 0, aName), t = on(g, 1, tName); choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); };

T('Chaos Emperor Dragon: no Normal Summon, banish LIGHT+DARK to summon, wipe and burn', () => {
  const g = duel({ board: [{ hand: ['Chaos Emperor Dragon - Envoy of the End'], gy: ['Honest', 'Dark Armed Dragon'], turn: 2 },
    { hand: ['Pot of Greed', 'Heavy Storm'], m: [FILL, 'Cyber Dragon'], st: ['Mirror Force'] }] });
  const c = card(g, 0, 'Chaos Emperor Dragon - Envoy of the End');
  ok(!hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u), 'cannot be Normal Summoned or Set');
  choose(g, 'sp:' + c.u); settle(g);
  ok(on(g, 0, 'Chaos Emperor Dragon - Envoy of the End') && inZ(g, 0, 'ban', 'Honest') && inZ(g, 0, 'ban', 'Dark Armed Dragon'), 'summoned by banishing Honest and Dark Armed Dragon');
  choose(g, 'a:' + c.u + ':'); settle(g);
  ok(g.p[0].lp === 7000, `A paid 1000 LP (${g.p[0].lp})`);
  ok(cnt(g, 1, 'm') === 0 && cnt(g, 1, 'st') === 0 && g.p[1].hand.length === 0 && cnt(g, 0, 'm') === 0 && g.p[0].hand.length === 0, 'both hands and fields sent to the GY');
  // Edison ruling: the damage counts the cards BOTH players send (7 here: B's 5, A's hand card and the Dragon itself)
  ok(g.p[1].lp === 8000 - 7 * 300, `300 per card sent to either GY: 7 cards (B ${g.p[1].lp})`);
  ok(!g.prompt.opts.some(x => x.key.startsWith('a:')), 'no other activations this turn');
  const g2 = duel({ board: [{ hand: ['Chaos Emperor Dragon - Envoy of the End'], gy: ['Dark Armed Dragon', 'Cyber Dragon Zwei'].slice(0, 1).concat(['Mystic Tomato']), turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Chaos Emperor Dragon - Envoy of the End').u), 'no summon without a LIGHT in the GY');
});
T('Cocoon of Evolution equips to Petit Moth and gives it 0/2000', () => {
  const g = duel({ board: [{ hand: ['Cocoon of Evolution'], m: ['Petit Moth'], turn: 2 }, {}] });
  act(g, 0, 'Cocoon of Evolution'); settle(g, 'Petit Moth');
  const m = on(g, 0, 'Petit Moth');
  ok(inZ(g, 0, 'st', 'Cocoon of Evolution') && m && E.atk(g, m) === 0 && E.def(g, m) === 2000, `Cocoon in S/T, Petit Moth ${m && E.atk(g, m)}/${m && E.def(g, m)}`);
});
T('Cocoon Party summons a Chrysalis per Neo-Spacian name in the GY', () => {
  const g = duel({ board: [{ hand: ['Cocoon Party'], gy: ['Neo-Spacian Aqua Dolphin', 'Neo-Spacian Dark Panther'], deckTop: [FILL, 'Chrysalis Dolphin', 'Chrysalis Pantail', 'Chrysalis Mole'], turn: 2 }, {}] });
  act(g, 0, 'Cocoon Party'); settle(g, 'Chrysalis Dolphin', 'Chrysalis Pantail');
  ok(g.p[0].m.filter(c => c && /^Chrysalis/.test(E.name(c))).length === 2, 'two Chrysalis monsters Special Summoned');
  const g2 = duel({ board: [{ hand: ['Cocoon Party'], deckTop: ['Chrysalis Dolphin'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Cocoon Party').u + ':'), 'not activatable with no Neo-Spacian in the GY');
});
T('Cocoon Rebirth tributes a Chrysalis to revive its Neo-Spacian from either GY', () => {
  const g = duel({ board: [{ m: ['Chrysalis Dolphin'], st: [{ n: 'Cocoon Rebirth', pos: 'up' }], turn: 2 }, { gy: ['Neo-Spacian Aqua Dolphin'] }] });
  act(g, 0, 'Cocoon Rebirth'); settle(g, 'Chrysalis Dolphin', 'Neo-Spacian Aqua Dolphin');
  ok(on(g, 0, 'Neo-Spacian Aqua Dolphin') && inZ(g, 0, 'gy', 'Chrysalis Dolphin'), 'Aqua Dolphin summoned from B\'s GY, Chrysalis tributed');
  ok(inZ(g, 0, 'st', 'Cocoon Rebirth'), 'Cocoon Rebirth stays');
});
T('Cocoon Veil: tribute a Chrysalis, summon its Neo-Spacian, effect damage 0 this turn', () => {
  const g = duel({ board: [{ m: ['Chrysalis Dolphin'], st: ['Cocoon Veil'], deckTop: [FILL, 'Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  act(g, 0, 'Cocoon Veil'); settle(g, 'Chrysalis Dolphin', 'Neo-Spacian Aqua Dolphin');
  ok(on(g, 0, 'Neo-Spacian Aqua Dolphin') && inZ(g, 0, 'gy', 'Chrysalis Dolphin'), 'Aqua Dolphin summoned, Chrysalis tributed');
  E.lib.damage(g, 0, 1000, { srcP: 1 }); E.lib.damage(g, 1, 500, { srcP: 0 });
  ok(g.p[0].lp === 8000 && g.p[1].lp === 8000, `effect damage becomes 0 for both (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Contract with Exodia summons Exodia Necross with all 5 pieces in the GY', () => {
  const pieces = ['Exodia the Forbidden One', 'Right Arm of the Forbidden One', 'Left Arm of the Forbidden One', 'Right Leg of the Forbidden One', 'Left Leg of the Forbidden One'];
  const g = duel({ board: [{ hand: ['Contract with Exodia', 'Exodia Necross'], gy: pieces, turn: 2 }, {}] });
  act(g, 0, 'Contract with Exodia'); settle(g, 'Exodia Necross');
  ok(on(g, 0, 'Exodia Necross'), 'Exodia Necross Special Summoned');
  const g2 = duel({ board: [{ hand: ['Contract with Exodia', 'Exodia Necross'], gy: pieces.slice(0, 4), turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Contract with Exodia').u + ':'), 'not activatable with only 4 pieces');
});
T('Contract with the Abyss Ritual Summons a DARK Ritual Monster with exact Levels', () => {
  const g = duel({ board: [{ hand: ['Contract with the Abyss', 'Dark Master - Zorc'], m: [FILL, FILL], turn: 2 }, {}] });
  act(g, 0, 'Contract with the Abyss'); settle(g, 'Dark Master - Zorc', FILL);
  ok(on(g, 0, 'Dark Master - Zorc') && cnt(g, 0, 'gy', FILL) === 2, 'Zorc summoned with two Level 4s');
  const g2 = duel({ board: [{ hand: ['Contract with the Abyss', 'Paladin of White Dragon'], m: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Contract with the Abyss').u + ':'), 'no LIGHT Ritual Monster');
});
T('Contract with the Dark Master Ritual Summons Zorc with 8 or more Levels', () => {
  const g = duel({ board: [{ hand: ['Contract with the Dark Master', 'Dark Master - Zorc'], m: ['Dark Armed Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Contract with the Dark Master'); settle(g, 'Dark Master - Zorc', 'Dark Armed Dragon');
  ok(on(g, 0, 'Dark Master - Zorc') && inZ(g, 0, 'gy', 'Dark Armed Dragon'), 'Zorc summoned by tributing a Level 7... ' + (on(g, 0, 'Dark Master - Zorc') ? 'summoned' : 'not summoned'));
});
T('Crimson Fire doubles burn back to the opponent with Red Dragon Archfiend', () => {
  const g = duel({ board: [{ hand: ['Final Flame'], turn: 2 }, { m: ['Red Dragon Archfiend'], st: ['Crimson Fire'] }] });
  act(g, 0, 'Final Flame'); ok(hasOpt(g, 'a:' + card(g, 1, 'Crimson Fire').u + ':'), 'Crimson Fire offered'); settle(g, 'a:' + card(g, 1, 'Crimson Fire').u + ':');
  ok(g.p[1].lp === 8000 && g.p[0].lp === 8000 - 1200, `A takes 1200, B none (A ${g.p[0].lp}, B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: ['Final Flame'], turn: 2 }, { m: [FILL], st: ['Crimson Fire'] }] });
  act(g2, 0, 'Final Flame'); ok(!hasOpt(g2, 'a:' + card(g2, 1, 'Crimson Fire').u + ':'), 'not offered without Red Dragon Archfiend');
});
T('Crimson Ninja flip destroys a Trap', () => {
  const g = duel({ board: [{ m: [{ n: 'Crimson Ninja', pos: 'set' }], turn: 2 }, { st: ['Mirror Force', 'Pot of Greed'] }] });
  choose(g, 'flip:'); settle(g, 'Face-down', 'Mirror');
  ok(inZ(g, 1, 'gy', 'Mirror Force') || inZ(g, 1, 'st', 'Pot of Greed') && !inZ(g, 1, 'st', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Crimson Sentry returns a battle-destroyed monster to the bottom of the Deck', () => {
  const g = duel({ board: [{ m: ['Crimson Sentry', 'Mystic Tomato'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  const tom = on(g, 0, 'Mystic Tomato');
  bp(g); atkOn(g, 'Mystic Tomato', 'Cyber Dragon'); settle(g);
  choose(g, 'endbp'); settle(g);
  ok(tom.zone === 'gy', 'Tomato destroyed');
  act(g, 0, 'Crimson Sentry'); settle(g, 'Mystic Tomato');
  ok(tom.zone === 'deck' && g.p[0].deck[0] === tom && inZ(g, 0, 'gy', 'Crimson Sentry'), 'Tomato on the bottom of the Deck, Sentry tributed');
});
T('Curse of Aging: discard 1, opponent monsters lose 500 ATK/DEF', () => {
  const g = duel({ board: [{ st: ['Curse of Aging'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  const h = g.p[0].hand.length;
  act(g, 0, 'Curse of Aging'); settle(g);
  const cd = on(g, 1, 'Cyber Dragon');
  ok(E.atk(g, cd) === 1600 && E.def(g, cd) === 1100 && g.p[0].hand.length === h - 1, `Cyber Dragon ${E.atk(g, cd)}/${E.def(g, cd)}, A discarded 1`);
});
T('Curse of Anubis: Effect Monsters to Defense, DEF 0', () => {
  const g = duel({ board: [{ m: [FILL], st: ['Curse of Anubis'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Curse of Anubis'); settle(g);
  const cd = on(g, 1, 'Cyber Dragon'), w = on(g, 0, FILL);
  ok(cd.pos === 'def' && E.def(g, cd) === 0 && w.pos === 'atk', `Cyber Dragon in ${cd.pos} with DEF ${E.def(g, cd)}, Normal Monster untouched`);
});
T('Curse of Darkness: Spell activator takes 1000', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { st: [{ n: 'Curse of Darkness', pos: 'up' }] }] });
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(g.p[0].lp === 7000 && g.p[1].lp === 8000, `A took 1000 (A ${g.p[0].lp})`);
});
T('Curse of Fiend: only in the Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Curse of Fiend'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  ok(!hasOpt(g, 'a:' + card(g, 0, 'Curse of Fiend').u + ':'), 'not activatable in the Main Phase');
  const g2 = duel({ board: [{ st: ['Curse of Fiend'], m: ['Cyber Dragon'], turn: 2 }, { m: [{ n: 'Mystic Tomato', pos: 'def' }] }] });
  ok(g2.prompt.type === 'yesno' && /Curse of Fiend/.test(g2.prompt.text), 'offered in the Standby Phase when Set');
  settle(g2);
  const cd = on(g2, 0, 'Cyber Dragon'), mt = on(g2, 1, 'Mystic Tomato');
  ok(cd.pos === 'def' && mt.pos === 'atk' && inZ(g2, 0, 'gy', 'Curse of Fiend'), `positions swapped (Cyber Dragon ${cd.pos}, Tomato ${mt.pos})`);
  ok(!hasOpt(g2, 'pos:' + cd.u), 'positions locked this turn');
});
T('Curse of Royal negates a Spell that destroys a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], turn: 2 }, { st: ['Curse of Royal', 'Mirror Force'] }] });
  act(g, 0, 'Mystical Space Typhoon'); choose(g, 'u' + card(g, 1, 'Mirror Force').u);
  const cr = card(g, 1, 'Curse of Royal');
  ok(hasOpt(g, 'a:' + cr.u + ':'), 'Curse of Royal offered'); settle(g, 'a:' + cr.u + ':');
  ok(inZ(g, 1, 'st', 'Mirror Force') || inZ(g, 1, 'gy', 'Curse of Royal') && inZ(g, 0, 'gy', 'Mystical Space Typhoon'), 'MST negated and destroyed');
  ok(inZ(g, 1, 'st', 'Mirror Force') && inZ(g, 0, 'gy', 'Mystical Space Typhoon'), 'Mirror Force stays');
});
T('Curse of the Masked Beast Ritual Summons The Masked Beast', () => {
  const g = duel({ board: [{ hand: ['Curse of the Masked Beast', 'The Masked Beast'], m: [FILL, FILL], turn: 2 }, {}] });
  act(g, 0, 'Curse of the Masked Beast'); settle(g, 'The Masked Beast', FILL);
  ok(on(g, 0, 'The Masked Beast'), 'The Masked Beast summoned');
});
T('Cyber Archfiend: extra draw on an empty hand, destroyed in End Phase with cards in hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Archfiend'], turn: 2 }, {}] });
  ok(g.p[0].hand.length === 2, `drew 2 (hand ${g.p[0].hand.length})`);
  choose(g, 'end'); settle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Archfiend'), 'destroyed in the End Phase');
});
T('Cyber Barrier Dragon: no Normal Summon, negates the first attack', () => {
  const g = duel({ board: [{ hand: ['Cyber Barrier Dragon'], m: [FILL, 'Mystic Tomato'], turn: 2 }, { m: ['Cyber Barrier Dragon'] }] });
  const c = card(g, 0, 'Cyber Barrier Dragon');
  ok(!hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && !hasOpt(g, 'sp:' + c.u), 'cannot be Normal Summoned, Set or summoned by itself');
  bp(g); atkOn(g, FILL, 'Cyber Barrier Dragon'); settle(g);
  ok(on(g, 1, 'Cyber Barrier Dragon') && g.p[1].lp === 8000, 'first attack negated');
  atkOn(g, 'Mystic Tomato', 'Cyber Barrier Dragon'); settle(g);
  ok(!on(g, 1, 'Cyber Barrier Dragon'), 'second attack goes through and destroys it');
});
T('Cyber Blader: battle-safe vs 1, double ATK vs 2', () => {
  const g = duel({ board: [{ m: ['Cyber Blader'], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  bp(g); atkOn(g, 'Cyber Blader', 'Dark Armed Dragon'); settle(g);
  ok(on(g, 0, 'Cyber Blader') && g.p[0].lp === 7300, `not destroyed by battle vs 1 monster (A ${g.p[0].lp})`);
  const g2 = duel({ board: [{ m: ['Cyber Blader'], turn: 2 }, { m: [FILL, FILL] }] });
  ok(E.atk(g2, on(g2, 0, 'Cyber Blader')) === 4200, 'ATK 4200 vs 2 monsters');
  const g4 = duel({ board: [{ m: ['Cyber Blader'], turn: 2 }, { m: [FILL, FILL, 'Cyber Gymnast'] }] });
  const gy = on(g4, 1, 'Cyber Gymnast');
  ok(E.atk(g4, on(g4, 0, 'Cyber Blader')) === 2100 && !hasOpt(g4, 'a:' + gy.u), 'ATK back to 2100 vs 3 monsters');
  choose(g4, 'end'); settle(g4);
  ok(!hasOpt(g4, 'a:' + gy.u + ':'), "vs 3 monsters the opponent's Effect Monster can't use its effect");
  const g3 = duel({ ex0: ['Cyber Blader'], board: [{ hand: ['Etoile Cyber'], m: ['Blade Skater'], turn: 2 }, {}] });
  ok(E.lib.canFusion(g3, 0, { from: ['hand', 'm'] }), 'Etoile Cyber + Blade Skater are its materials');
});
T('Cyber Dinosaur: summon from hand when the opponent Special Summons from hand', () => {
  const g = duel({ board: [{ hand: ['Cyber Dinosaur'], m: [FILL], turn: 2 }, { hand: ['Cyber Dragon'] }] });
  choose(g, 'end'); settle(g);
  const cd = card(g, 1, 'Cyber Dragon'); choose(g, 'sp:' + cd.u);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.p === 0 && (pr.type === 'yesno' || hasOpt(g, 'Cyber Dinosaur') || hasOpt(g, 'a:' + card(g, 0, 'Cyber Dinosaur').u))) { if (pr.type === 'yesno') choose(g, 'yes'); else choose(g, 'a:' + card(g, 0, 'Cyber Dinosaur').u); } else settle(g); }
  ok(on(g, 0, 'Cyber Dinosaur'), 'Cyber Dinosaur Special Summoned');
});
T('Cyber Dragon Zwei gains 300 when attacking a monster', () => {
  const g = duel({ board: [{ m: ['Cyber Dragon Zwei'], turn: 2 }, { m: ['Mystic Tomato'] }] });
  bp(g); atkOn(g, 'Cyber Dragon Zwei', 'Mystic Tomato'); settle(g);
  ok(g.p[1].lp === 8000 - 400, `B took 400 (1800 vs 1400): B ${g.p[1].lp}`);
  const g2 = duel({ ex0: ['Cyber Twin Dragon'], board: [{ hand: ['Pot of Greed'], m: ['Cyber Dragon Zwei', 'Cyber Dragon'], turn: 2 }, {}] });
  ok(!E.lib.canFusion(g2, 0, { from: ['hand', 'm'] }), 'Zwei is not Cyber Dragon before its effect');
  choose(g2, 'a:' + on(g2, 0, 'Cyber Dragon Zwei').u + ':'); settle(g2, 'Pot of Greed');
  ok(E.lib.canFusion(g2, 0, { from: ['hand', 'm'] }) && !hasOpt(g2, 'a:' + on(g2, 0, 'Cyber Dragon Zwei').u + ':'), 'after revealing a Spell it counts as Cyber Dragon (once per turn)');
});
T('Cyber Eltanin: banish all LIGHT Machines, ATK per banished, clear the field', () => {
  const g = duel({ board: [{ hand: ['Cyber Eltanin'], m: ['Cyber Dragon'], gy: ['Cyber Dragon', 'Cyber Dragon'], turn: 2 }, { m: [FILL] }] });
  const c = card(g, 0, 'Cyber Eltanin');
  ok(!hasOpt(g, 'ns:' + c.u), 'cannot be Normal Summoned');
  choose(g, 'sp:' + c.u); settle(g);
  const el = on(g, 0, 'Cyber Eltanin');
  ok(el && cnt(g, 0, 'ban', 'Cyber Dragon') === 3 && E.atk(g, el) === 1500 && E.def(g, el) === 1500, `3 banished, ${el && E.atk(g, el)}/${el && E.def(g, el)}`);
  ok(inZ(g, 1, 'gy', FILL), 'other face-up monsters sent to the GY');
});
T('Cyber End Dragon: Fusion with 3 Cyber Dragon, pierces', () => {
  const g0 = duel({ ex0: ['Cyber End Dragon'], board: [{ hand: ['Cyber Dragon'], m: ['Cyber Dragon', 'Cyber Dragon'], turn: 2 }, {}] });
  const g1 = duel({ ex0: ['Cyber End Dragon'], board: [{ hand: ['Cyber Dragon'], m: ['Cyber Dragon', FILL], turn: 2 }, {}] });
  ok(E.lib.canFusion(g0, 0, { from: ['hand', 'm'] }) && !E.lib.canFusion(g1, 0, { from: ['hand', 'm'] }), 'needs exactly 3 Cyber Dragon');
  const g = duel({ board: [{ m: ['Cyber End Dragon'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); atkOn(g, 'Cyber End Dragon', FILL); settle(g);
  ok(g.p[1].lp === 8000 - 3900, `piercing 3900 (B ${g.p[1].lp})`);
});
T('Cyber Esper can be Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Cyber Esper'], turn: 2 }, {}] });
  choose(g, 'ns:' + card(g, 0, 'Cyber Esper').u); settle(g);
  ok(on(g, 0, 'Cyber Esper'), 'summoned');
});
T('Cyber Gymnast: discard 1 to destroy an Attack Position monster', () => {
  const g = duel({ board: [{ m: ['Cyber Gymnast'], turn: 2 }, { m: ['Cyber Dragon', { n: FILL, pos: 'def' }] }] });
  const h = g.p[0].hand.length;
  act(g, 0, 'Cyber Gymnast'); settle(g, 'Cyber Dragon');
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && g.p[0].hand.length === h - 1, 'Cyber Dragon destroyed, A discarded 1');
  ok(!hasOpt(g, 'a:' + on(g, 0, 'Cyber Gymnast').u + ':'), 'once per turn');
});
T('Cyber Harpie Lady can be Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Cyber Harpie Lady'], turn: 2 }, {}] });
  choose(g, 'ns:' + card(g, 0, 'Cyber Harpie Lady').u); settle(g);
  ok(g.p[0].m.some(c => c && E.data(c).n === 'Cyber Harpie Lady'), 'summoned');
});
T('Cyber Jar: destroy all, both reveal 5, summon Level 4 or lower, rest to hand', () => {
  const g = duel({ board: [{ m: [{ n: 'Cyber Jar', pos: 'set' }], deckTop: [FILL, 'Pot of Greed', FILL, FILL, FILL, 'Dark Armed Dragon'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'flip:'); settle(g, 'Attack');
  ok(inZ(g, 0, 'gy', 'Cyber Jar') && inZ(g, 1, 'gy', 'Cyber Dragon'), 'all monsters destroyed');
  ok(inZ(g, 0, 'hand', 'Pot of Greed') && inZ(g, 0, 'hand', 'Dark Armed Dragon') && cnt(g, 0, 'm', FILL) === 3, `A: Pot and DAD to hand, 3 Warwolves summoned (${cnt(g, 0, 'm', FILL)})`);
  ok(cnt(g, 1, 'm', FILL) === 5, `B summoned 5 Warwolves (${cnt(g, 1, 'm', FILL)})`);
});
T('Cyber Kirin: Tribute to make effect damage 0 this turn', () => {
  const g = duel({ board: [{ m: ['Cyber Kirin'], turn: 2 }, {}] });
  act(g, 0, 'Cyber Kirin'); settle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Kirin'), 'tributed');
  E.lib.damage(g, 0, 1000, { srcP: 1 });
  ok(g.p[0].lp === 8000, `no effect damage (A ${g.p[0].lp})`);
});
T('Cyber Laser Dragon destroys a monster with ATK or DEF >= 2400', () => {
  const g = duel({ board: [{ hand: ['Cyber Laser Dragon'], m: [{ n: 'Cyber Laser Dragon' }], turn: 2 }, { m: ['Dark Armed Dragon', FILL] }] });
  const h = card(g, 0, 'Cyber Laser Dragon');
  ok(!g.p[0].hand.some(c => hasOpt(g, 'ns:' + c.u) && E.name(c) === 'Cyber Laser Dragon'), 'cannot be Normal Summoned');
  choose(g, 'a:' + on(g, 0, 'Cyber Laser Dragon').u + ':'); ok(!hasOpt(g, FILL) || hasOpt(g, 'Dark Armed'), 'targets'); settle(g, 'Dark Armed Dragon');
  ok(inZ(g, 1, 'gy', 'Dark Armed Dragon') && on(g, 1, FILL), 'Dark Armed Dragon destroyed, Warwolf stays');
  void h;
});
T('Cyber Ogre: discard to negate its battle and gain 2000', () => {
  const g = duel({ board: [{ hand: ['Cyber Ogre'], m: ['Cyber Ogre'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  const og = on(g, 0, 'Cyber Ogre'), oh = card(g, 0, 'Cyber Ogre') === og ? g.p[0].hand.find(c => E.name(c) === 'Cyber Ogre') : g.p[0].hand.find(c => E.name(c) === 'Cyber Ogre');
  bp(g); choose(g, `atk:${og.u}:${on(g, 1, 'Cyber Dragon').u}`);
  let used = false;
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { if (!used && hasOpt(g, 'a:' + oh.u + ':')) { choose(g, 'a:' + oh.u + ':'); used = true; } else settle(g); if (!used && g.prompt && g.prompt.type === 'battle') break; }
  ok(used, 'Cyber Ogre offered from the hand');
  ok(og.zone === 'm' && inZ(g, 1, 'm', 'Cyber Dragon') && E.atk(g, og) === 3900 && g.p[0].lp === 8000, `battle negated, Ogre ATK ${E.atk(g, og)}`);
});
T('Cyber Ogre 2 gains half the target ATK in damage calculation', () => {
  const g = duel({ board: [{ m: ['Cyber Ogre 2'], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  bp(g); atkOn(g, 'Cyber Ogre 2', 'Dark Armed Dragon'); settle(g);
  ok(inZ(g, 1, 'gy', 'Dark Armed Dragon') && g.p[1].lp === 8000 - 1200, `4000 vs 2800 (B ${g.p[1].lp})`);
});
T('D.D. Warrior banishes both; Cyber Ouroboros trades a card for a draw when banished', () => {
  const g = duel({ board: [{ m: ['D.D. Warrior'], turn: 2 }, { m: ['Cyber Ouroboros'] }] });
  const h = g.p[1].hand.length;
  bp(g); atkOn(g, 'D.D. Warrior', 'Cyber Ouroboros'); settle(g);
  ok(inZ(g, 0, 'ban', 'D.D. Warrior') && inZ(g, 1, 'ban', 'Cyber Ouroboros'), 'both banished');
  ok(g.p[1].hand.length === h && g.p[1].gy.length === 1, `B sent 1 and drew 1 (hand ${g.p[1].hand.length}, gy ${g.p[1].gy.length})`);
});
T('Cyber Phoenix draws when destroyed by battle', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Cyber Phoenix'] }] });
  const h = g.p[1].hand.length;
  bp(g); atkOn(g, FILL, 'Cyber Phoenix'); settle(g);
  ok(inZ(g, 1, 'gy', 'Cyber Phoenix') && g.p[1].hand.length === h + 1, 'B drew 1');
});
T('Cyber Phoenix negates a Spell that targets a Machine', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['Cyber Phoenix', 'Cyber Dragon'] }] });
  act(g, 0, 'Book of Moon'); settle(g, 'Cyber Dragon', 'Negate');
  ok(on(g, 1, 'Cyber Dragon') && on(g, 1, 'Cyber Dragon').pos === 'atk', 'Cyber Dragon stays face-up');
  ok(g.log.some(l => /negat/i.test(l)) && inZ(g, 0, 'gy', 'Book of Moon'), 'Book of Moon negated');
});
T('Cyber Prima destroys face-up Spells when Tribute Summoned', () => {
  const g = duel({ board: [{ hand: ['Cyber Prima'], m: [FILL], st: [{ n: 'Curse of Darkness', pos: 'up' }], turn: 2 }, { st: [{ n: 'Swords of Revealing Light', pos: 'up' }, 'Pot of Greed'] }] });
  choose(g, 'ns:' + card(g, 0, 'Cyber Prima').u); settle(g, FILL);
  ok(on(g, 0, 'Cyber Prima') && inZ(g, 1, 'gy', 'Swords of Revealing Light') && inZ(g, 1, 'st', 'Pot of Greed') && inZ(g, 0, 'st', 'Curse of Darkness'), 'face-up Spell destroyed, Set Spell and Trap stay');
});
T('Cyber Raider takes or destroys an Equip Card', () => {
  for (const mode of ['equip', 'destroy']) {
    const g = duel({ board: [{ hand: ['Gravity Axe - Grarl', 'Cyber Raider'], m: [FILL], turn: 2 }, {}] });
    act(g, 0, 'Gravity Axe - Grarl'); settle(g, FILL);
    ok(E.atk(g, on(g, 0, FILL)) === 2500, 'Grarl equipped');
    choose(g, 'ns:' + card(g, 0, 'Cyber Raider').u);
    for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
      if (pr.type === 'choose') { const o = pr.opts.find(x => x.label.toLowerCase().startsWith(mode === 'equip' ? 'equip an' : 'destroy')); E.act(g, [o ? o.key : pr.opts[0].key]); } else settle(g, 'Gravity'); }
    const r = on(g, 0, 'Cyber Raider');
    if (mode === 'equip') ok(E.atk(g, r) === 1900 && E.atk(g, on(g, 0, FILL)) === 2000, `Raider ${E.atk(g, r)}: took the equip`);
    else ok(inZ(g, 0, 'gy', 'Gravity Axe - Grarl') && E.atk(g, on(g, 0, FILL)) === 2000, 'Grarl destroyed');
  }
});
T('Cyber Saurus Fusion Summon', () => {
  const g = duel({ ex0: ['Cyber Saurus'], board: [{ hand: ['Blast Juggler', 'Two-Headed King Rex'], turn: 2 }, {}] });
  ok(E.lib.canFusion(g, 0, { from: ['hand', 'm'] }), 'Blast Juggler + Two-Headed King Rex are its materials');
});
T('Cyber Shadow Gardna: becomes a monster in the opponent Main Phase, copies the attacker', () => {
  const g = duel({ board: [{ st: ['Cyber Shadow Gardna'], turn: 2 }, { hand: ['Mystic Tomato'] }] });
  const gd = g.p[0].st[0];
  choose(g, 'end'); settle(g);
  choose(g, 'ns:' + card(g, 1, 'Mystic Tomato').u);
  let used = false;
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.p === 0 && hasOpt(g, 'a:' + gd.u + ':')) { choose(g, 'a:' + gd.u + ':'); used = true; } else settle(g); }
  ok(used && gd.zone === 'm', 'Gardna Special Summoned as a monster');
  if (gd.zone !== 'm') return;
  choose(g, 'bp'); settle(g);
  choose(g, `atk:${on(g, 1, 'Mystic Tomato').u}:${gd.u}`); settle(g);
  ok(gd.zone === 'm' || gd.zone === 'gy', 'battle happened');
  ok(g.p[0].lp === 8000 && g.p[1].lp === 8000, `same stats: no damage (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Cyber Shark: no tribute with a WATER monster', () => {
  const g = duel({ board: [{ hand: ['Cyber Shark'], m: ['Mother Grizzly'], turn: 2 }, {}] });
  const s = card(g, 0, 'Cyber Shark');
  ok(g.prompt.opts.some(x => x.key === 'ns:' + s.u && x.label === 'Normal Summon'), 'Normal Summon without tributes offered');
  choose(g, 'ns:' + s.u); settle(g, 'No Tribute');
  ok(on(g, 0, 'Cyber Shark') && on(g, 0, 'Mother Grizzly'), 'Shark summoned, Grizzly stays');
  const g2 = duel({ board: [{ hand: ['Cyber Shark'], m: [FILL], turn: 2 }, {}] });
  const s2 = card(g2, 0, 'Cyber Shark');
  ok(g2.prompt.opts.some(x => x.key === 'ns:' + s2.u && x.label === 'Tribute Summon'), 'needs a tribute without WATER');
});
T('Cyber Summon Blaster: 300 when a Machine is Special Summoned', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon'], st: [{ n: 'Cyber Summon Blaster', pos: 'up' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'sp:' + card(g, 0, 'Cyber Dragon').u); settle(g);
  ok(g.p[1].lp === 7700, `B took 300 (B ${g.p[1].lp})`);
});
T('Cyber Tutu attacks directly past stronger monsters', () => {
  const g = duel({ board: [{ m: ['Cyber Tutu'], turn: 2 }, { m: [FILL] }] });
  bp(g); const t = on(g, 0, 'Cyber Tutu');
  ok(hasOpt(g, `atk:${t.u}:d`), 'direct attack offered');
  choose(g, `atk:${t.u}:d`); settle(g);
  ok(g.p[1].lp === 7000, `B took 1000 (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ m: ['Cyber Tutu'], turn: 2 }, { m: [FILL, 'Cyber Ouroboros'] }] });
  bp(g2); ok(!hasOpt(g2, `atk:${on(g2, 0, 'Cyber Tutu').u}:d`), 'no direct attack when one monster is weaker');
});
T('Cyber Twin Dragon attacks twice', () => {
  const g = duel({ board: [{ m: ['Cyber Twin Dragon'], turn: 2 }, {}] });
  bp(g); atkOn(g, 'Cyber Twin Dragon', null); settle(g);
  atkOn(g, 'Cyber Twin Dragon', null); settle(g);
  ok(g.p[1].lp === 8000 - 5600, `B took 5600 (B ${g.p[1].lp})`);
  const g2 = duel({ ex0: ['Cyber Twin Dragon'], board: [{ hand: ['Cyber Dragon', 'Cyber Dragon'], turn: 2 }, {}] });
  ok(E.lib.canFusion(g2, 0, { from: ['hand', 'm'] }), '2 Cyber Dragon are its materials');
});
T('Cyber-Stein: pay 5000 to summon a Fusion in Attack Position', () => {
  const g = duel({ ex0: ['Cyber End Dragon'], board: [{ m: ['Cyber-Stein'], turn: 2 }, {}] });
  act(g, 0, 'Cyber-Stein'); settle(g, 'Cyber End Dragon');
  const c = on(g, 0, 'Cyber End Dragon');
  ok(c && c.pos === 'atk' && g.p[0].lp === 3000, `Cyber End Dragon in Attack Position, A ${g.p[0].lp}`);
});
T('D.D. Assailant banishes itself and its destroyer', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['D.D. Assailant'] }] });
  bp(g); atkOn(g, FILL, 'D.D. Assailant'); settle(g);
  ok(inZ(g, 0, 'ban', FILL) && inZ(g, 1, 'ban', 'D.D. Assailant'), 'both banished');
});
T('D.D. Borderline: no Battle Phase without a Spell in the GY', () => {
  const g = duel({ board: [{ m: [FILL], st: [{ n: 'D.D. Borderline', pos: 'up' }], turn: 2 }, {}] });
  if (hasOpt(g, 'bp')) { choose(g, 'bp'); settle(g); }
  ok(!hasOpt(g, 'atk:'), 'no Battle Phase (no attack possible)');
  const g2 = duel({ board: [{ m: [FILL], st: [{ n: 'D.D. Borderline', pos: 'up' }], gy: ['Pot of Greed'], turn: 2 }, {}] });
  ok(hasOpt(g2, 'bp'), 'Battle Phase with a Spell in the GY');
});
T('D.D. Crazy Beast banishes what it destroys by battle', () => {
  const g = duel({ board: [{ m: ['D.D. Crazy Beast'], turn: 2 }, { m: ['Cyber Tutu'] }] });
  bp(g); atkOn(g, 'D.D. Crazy Beast', 'Cyber Tutu'); settle(g);
  ok(inZ(g, 1, 'ban', 'Cyber Tutu') && !inZ(g, 1, 'gy', 'Cyber Tutu'), 'Cyber Tutu banished');
});
T('D.D. Designator banishes the declared card from the opponent hand', () => {
  const g = duel({ board: [{ hand: ['D.D. Designator'], turn: 2 }, { hand: ['Pot of Greed', FILL] }] });
  act(g, 0, 'D.D. Designator'); settle(g, 'Pot of Greed');
  ok(inZ(g, 1, 'ban', 'Pot of Greed'), 'Pot of Greed banished');
  const g2 = duel({ board: [{ hand: ['D.D. Designator', 'Heavy Storm'], turn: 2 }, { hand: [FILL], gy: ['Pot of Greed'] }] });
  const n0 = g2.p[0].hand.length;
  act(g2, 0, 'D.D. Designator'); settle(g2, 'Pot of Greed');
  ok(g2.p[0].ban.length === 1 && g2.p[0].hand.length === n0 - 2, 'wrong guess: A banishes 1 random card of its own');
});
T('D.D. Dynamite: 300 per banished card of the opponent', () => {
  const g = duel({ board: [{ st: ['D.D. Dynamite'], turn: 2 }, { ban: [FILL, FILL, 'Pot of Greed'] }] });
  act(g, 0, 'D.D. Dynamite'); settle(g);
  ok(g.p[1].lp === 7100, `B took 900 (B ${g.p[1].lp})`);
});
T('D.D. Guide goes to the opponent and banishes from its controller GY each End Phase', () => {
  const g = duel({ board: [{ hand: ['D.D. Guide'], turn: 2 }, { gy: ['Pot of Greed'] }] });
  choose(g, 'ns:' + card(g, 0, 'D.D. Guide').u); settle(g);
  ok(on(g, 1, 'D.D. Guide'), 'control given to B');
  choose(g, 'end'); settle(g, 'Pot of Greed');
  ok(inZ(g, 1, 'ban', 'Pot of Greed'), 'a card in B\'s GY banished in the End Phase');
});
T('D.D. Scout Plane returns in the End Phase after being banished', () => {
  const g = duel({ board: [{ m: ['D.D. Warrior'], turn: 2 }, { m: ['D.D. Scout Plane'] }] });
  bp(g); atkOn(g, 'D.D. Warrior', 'D.D. Scout Plane'); settle(g);
  ok(inZ(g, 1, 'ban', 'D.D. Scout Plane'), 'banished');
  if (hasOpt(g, 'endbp')) choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  const s = on(g, 1, 'D.D. Scout Plane');
  ok(s && s.pos === 'atk', 'Special Summoned in Attack Position in the End Phase');
});
T('D.D. Survivor returns in the End Phase after being banished from the field', () => {
  const g = duel({ board: [{ m: ['D.D. Warrior'], turn: 2 }, { m: [{ n: 'D.D. Survivor', pos: 'def' }] }] });
  bp(g); atkOn(g, 'D.D. Warrior', 'D.D. Survivor'); settle(g);
  ok(inZ(g, 1, 'ban', 'D.D. Survivor'), 'banished');
  if (hasOpt(g, 'endbp')) choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(on(g, 1, 'D.D. Survivor'), 'Special Summoned in the End Phase');
});
T('D.D. Trap Hole banishes a Set monster and one of yours', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { m: ['Mystic Tomato'], st: ['D.D. Trap Hole'] }] });
  choose(g, 'set:' + g.p[0].hand[0].u);
  const t = card(g, 1, 'D.D. Trap Hole');
  settle(g, 'a:' + t.u + ':', 'Mystic Tomato');
  ok(cnt(g, 0, 'm') === 0 && inZ(g, 0, 'ban', FILL) && inZ(g, 1, 'ban', 'Mystic Tomato'), 'both banished');
});

// Goat: same texts, quick checks with the Goat card pool
{
  const vm = require('vm'), fs = require('fs'), path = require('path');
  const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
  for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const GE = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; GE.init(GC, { format: 'goat' });
  const gid = n => { const c = GC.find(x => x.n === n); if (!c) throw new Error('no goat card ' + n); return c.id; };
  const gduel = (board, ex) => (lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board }));
  const GF = '7 Colored Fish';
  const Esave = E;
  const gsettle = (g, ...picks) => { for (let i = 0; i < 40 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') GE.act(g, ['pass']); else if (pr.type === 'yesno') GE.act(g, ['y']); else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => x.label.includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); } for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); GE.act(g, ks); } } };
  const gact = (g, n) => { const c = g.p[0].hand.find(x => GE.name(x) === n); GE.act(g, [g.prompt.opts.find(x => x.key.startsWith('a:' + c.u + ':')).key]); };
  for (const [fu, mats] of [['Cyber End Dragon', ['Cyber Dragon', 'Cyber Dragon', 'Cyber Dragon']], ['Cyber Saurus', ['Blast Juggler', 'Two-Headed King Rex']], ['Cyber Twin Dragon', ['Cyber Dragon', 'Cyber Dragon']]]) T('Goat: Polymerization makes ' + fu, () => {
    if (!GC.find(x => x.n === fu)) { console.log('skip  ' + fu + ' is not in the Goat pool'); return; }
    const g = gduel([{ hand: ['Polymerization', ...mats], turn: 2 }, {}], [fu]);
    gact(g, 'Polymerization'); gsettle(g, fu, ...mats);
    ok(g.p[0].m.some(c => c && GE.name(c) === fu), 'Goat: ' + fu + ' Fusion Summoned');
  });
  T('Goat: Chaos Emperor Dragon summons and burns', () => {
    const g = gduel([{ hand: ['Chaos Emperor Dragon - Envoy of the End'], gy: ['Mystic Tomato', 'Shining Angel'], turn: 2 }, { hand: ['Pot of Greed'], m: [GF] }]);
    const c = g.p[0].hand.find(x => GE.name(x) === 'Chaos Emperor Dragon - Envoy of the End');
    const o = g.prompt.opts.find(x => x.key === 'sp:' + c.u); ok(!!o, 'Goat: summon rule offered'); GE.act(g, [o.key]);
    for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) GE.act(g, g.prompt.type === 'respond' ? ['pass'] : g.prompt.type === 'yesno' ? ['y'] : g.prompt.opts.slice(0, g.prompt.min).map(x => x.key));
    const e = g.prompt.opts.find(x => x.key.startsWith('a:' + c.u + ':')); ok(!!e, 'Goat: effect offered'); GE.act(g, [e.key]);
    for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) GE.act(g, g.prompt.type === 'respond' ? ['pass'] : g.prompt.type === 'yesno' ? ['y'] : g.prompt.opts.slice(0, g.prompt.min).map(x => x.key));
    ok(g.p[0].lp === 7000 && g.p[1].lp === 8000 - 1200, `Goat: A paid 1000, B took 1200 (4 cards to either GY, the 2005 card counted both) (A ${g.p[0].lp}, B ${g.p[1].lp})`);
  });
  T('Goat: D.D. Borderline stops the Battle Phase', () => {
    const g = gduel([{ m: [GF], st: [{ n: 'D.D. Borderline', pos: 'up' }], turn: 2 }, {}]);
    const b = g.prompt.opts.find(x => x.key === 'bp'); if (b) { GE.act(g, ['bp']); gsettle(g); }
    ok(!g.prompt.opts.some(x => x.key.startsWith('atk:')), 'Goat: no Battle Phase');
  });
  void Esave;
}

console.log(fails ? `\n${fails} failed` : '\nAll full-04 review checks passed.');
process.exit(fails ? 1 : 0);
