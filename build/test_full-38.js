// Scenario checks for full pool batch 38: node build/test_full-38.js
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
const yesAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes'); };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const L = E.lib;
// run until player p's idle prompt in the given phase (answers: pass to responses, yes to triggers, first pick)
function until(g, p, phase, max = 60) {
  for (let i = 0; i < max && g.prompt; i++) {
    const pr = g.prompt;
    if (pr.type === 'idle' && pr.p === p && g.phase === phase) return;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') choose(g, 'yes');
    else if (pr.type === 'idle') E.act(g, [pr.opts.some(o => o.key === 'endbp') ? 'endbp' : 'end']);
    else E.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key));
  }
}

T('Exodius: summoned by shuffling the GY, sends a Forbidden One on attack and wins with 5', () => {
  const g = duel({ board: [{ hand: ['Exodius the Ultimate Forbidden Lord'], gy: ['Left Arm of the Forbidden One', 'Right Arm of the Forbidden One', 'Left Leg of the Forbidden One', 'Right Leg of the Forbidden One', 'Celtic Guardian'], deckTop: ['Exodia the Forbidden One'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Exodius the Ultimate Forbidden Lord').u), 'no Normal Summon');
  choose(g, 'Special Summon (shuffle'); passAll(g);
  const x = on(g, 0, 'Exodius the Ultimate Forbidden Lord');
  ok(x && g.p[0].gy.length === 0 && E.atk(g, x) === 0, 'Exodius summoned, GY shuffled in, 0 ATK');
  // put 4 pieces back as if Exodius had sent them
  for (const n of ['Left Arm of the Forbidden One', 'Right Arm of the Forbidden One', 'Left Leg of the Forbidden One', 'Right Leg of the Forbidden One']) { const c = g.p[0].deck.find(y => E.name(y) === n); L.move(g, c, 'gy'); c.f38exo = true; }
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g);
  choose(g, 'Exodia the Forbidden One');
  ok(g.winner === 0, `A wins with the fifth piece (${g.why})`);
});
T('Exodius is banished when it leaves the field', () => {
  const g = duel({ board: [{ hand: ['Exodius the Ultimate Forbidden Lord'], gy: [FILL], turn: 2 }, { hand: [], st: ['Compulsory Evacuation Device'] }] });
  choose(g, 'Special Summon (shuffle'); passAll(g);
  const x = on(g, 0, 'Exodius the Ultimate Forbidden Lord'); L.destroy(g, [x], { by: 1 });
  ok(inZ(g, 0, 'ban', 'Exodius the Ultimate Forbidden Lord'), 'destroyed Exodius is banished');
});
T('Explosive Magician: Spellcaster-only Synchro, removes 2 Spell Counters to destroy a Spell/Trap', () => {
  const g = duel({ ex0: ['Explosive Magician'], board: [{ hand: [], m: ['Frequency Magician', 'Gambler of Legend'], st: [{ n: 'Field Barrier', pos: 'up' }], turn: 2 }, { st: ['Mirror Force'] }] });
  const fb = g.p[0].st.find(c => c && E.name(c) === 'Field Barrier'); fb.ctr = { spell: 2 };
  ok(hasOpt(g, 'Synchro Summon'), 'Synchro offered'); choose(g, 'Synchro Summon'); passAll(g);
  const x = on(g, 0, 'Explosive Magician'); ok(!!x, 'Explosive Magician on the field');
    act(g, 0, 'Explosive Magician'); passAll(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && L.ctr(fb, 'spell') === 0, 'Mirror Force destroyed, counters removed');
  const g2 = duel({ ex0: ['Explosive Magician'], board: [{ hand: [], m: ['Frequency Magician', FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'Synchro Summon'), 'no Synchro with a non-Spellcaster');
});
T('Exxod: summoned by Tributing a Sphinx, burns on an EARTH Flip Summon, never revived', () => {
  const g = duel({ board: [{ hand: ['Exxod, Master of The Guard'], m: ['Andro Sphinx', { n: 'Celtic Guardian', pos: 'set' }], turn: 2 }, {}] });
  choose(g, 'Special Summon (Tribute'); passAll(g);
  ok(on(g, 0, 'Exxod, Master of The Guard') && inZ(g, 0, 'gy', 'Andro Sphinx'), 'Exxod summoned');
  choose(g, 'flip:'); passAll(g);
  ok(g.p[1].lp === 7000, `1000 damage on the EARTH Flip Summon (B ${g.p[1].lp})`);
  const x = on(g, 0, 'Exxod, Master of The Guard'); L.move(g, x, 'gy');
  ok(L.forbid(g, { type: 'ss', c: x, p: 0, how: 'special' }), 'Exxod in the GY cannot be Special Summoned');
});
T('Frost and Flame Dragon: own summon rule only, discard to destroy', () => {
  const g = duel({ board: [{ hand: ['Frost and Flame Dragon', FILL], gy: ['Battle Footballer', '7 Colored Fish', 'Aqua Madoor'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'Special Summon (banish'); passAll(g);
  ok(on(g, 0, 'Frost and Flame Dragon') && g.p[0].ban.length === 3, 'summoned, 3 monsters banished');
  act(g, 0, 'Frost and Flame Dragon'); choose(g, FILL); choose(g, 'Cyber Dragon'); passAll(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon'), 'Cyber Dragon destroyed');
  const x = on(g, 0, 'Frost and Flame Dragon'); L.move(g, x, 'gy');
  ok(L.forbid(g, { type: 'ss', c: x, p: 0, how: 'special' }), 'no revival');
});
T('Felgrand Dragon: revived only after leaving the field, gains Level x 200', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Felgrand Dragon', 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  const f = g.p[0].gy.find(c => E.name(c) === 'Felgrand Dragon');
  ok(L.forbid(g, { type: 'ss', c: f, p: 0, how: 'special' }), 'not sent from the field: cannot be Special Summoned');
  f.f38ff = true;
  ok(!L.forbid(g, { type: 'ss', c: f, p: 0, how: 'special' }), 'sent from the field: can be');
  act(g, 0, 'Monster Reborn'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Felgrand Dragon');
  passAll(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Blue-Eyes White Dragon'); passAll(g);
  const x = on(g, 0, 'Felgrand Dragon');
  ok(x && E.atk(g, x) === 2800 + 1600, `Felgrand has ${x && E.atk(g, x)} ATK`);
});
T('Gandora: pays half, destroys and banishes everything, gains 300 each; no Special Summon', () => {
  const g = duel({ board: [{ hand: [], m: ['Gandora the Dragon of Destruction'], turn: 2 }, { m: ['Cyber Dragon', FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Gandora the Dragon of Destruction'); passAll(g);
  const x = on(g, 0, 'Gandora the Dragon of Destruction');
  ok(g.p[0].lp === 4000 && g.p[1].ban.length === 3 && E.atk(g, x) === 900, `4000 LP, 3 banished, ${E.atk(g, x)} ATK`);
  ok(L.forbid(g, { type: 'ss', c: x, p: 0, how: 'special' }), 'Gandora cannot be Special Summoned');
});
T('Fog King: 1 Tribute, ATK = the Tribute\'s original ATK, no Set, no other Tributes', () => {
  const g = duel({ board: [{ hand: ['Fog King'], m: ['Cyber Dragon'], turn: 2 }, {}] });
  const fk = g.p[0].hand.find(c => E.name(c) === 'Fog King');
  ok(!hasOpt(g, 'set:' + fk.u), 'Fog King cannot be Set');
  choose(g, 'ns:' + fk.u); if (g.prompt.type === 'choose') choose(g, '1 Tribute'); passAll(g);
  const x = on(g, 0, 'Fog King');
  ok(x && E.atk(g, x) === 2100, `Fog King has ${x && E.atk(g, x)} ATK`);
  L.ss(g, 0, g.p[0].deck[0], 'atk'); g.seq++;
  ok(g.p[0].m.filter(Boolean).every(m => m === x || m.flags.noTribute), 'other monsters cannot be Tributed');
});
T('Exchange of the Spirit swaps each GY with its Deck', () => {
  const gy = Array(15).fill(FILL);
  const g = duel({ board: [{ hand: [], gy: [...gy, 'Cyber Dragon'], st: ['Exchange of the Spirit'], turn: 2 }, { gy }] });
  const d0 = g.p[0].deck.length, d1 = g.p[1].deck.length;
  act(g, 0, 'Exchange of the Spirit'); passAll(g);
  ok(g.p[0].deck.length === 16 && g.p[1].deck.length === 15 && g.p[0].gy.length === d0 + 1 && g.p[1].gy.length === d1, `swapped (A deck ${g.p[0].deck.length}, B deck ${g.p[1].deck.length})`);
  ok(g.p[0].lp === 7000, 'paid 1000');
});
T('Fighting Spirit: +300 per opponent monster, destroyed instead of the monster', () => {
  const g = duel({ board: [{ hand: ['Fighting Spirit'], m: [FILL], turn: 2 }, { m: ['Cyber Dragon', { n: FILL, pos: 'def' }] }] });
  act(g, 0, 'Fighting Spirit'); passAll(g); choose(g, FILL); passAll(g);
  const w = on(g, 0, FILL); ok(E.atk(g, w) === 2000 + 600, `Warwolf has ${E.atk(g, w)} ATK`);
  L.destroy(g, [w], { battle: true });
  ok(on(g, 0, FILL) && inZ(g, 0, 'gy', 'Fighting Spirit'), 'Warwolf stays, Fighting Spirit destroyed');
});
T('Fires of Doomsday: 2 Tokens, then no Normal Summon but Set is allowed', () => {
  const g = duel({ board: [{ hand: ['Fires of Doomsday', FILL], turn: 2 }, {}] });
  act(g, 0, 'Fires of Doomsday'); passAll(g);
  ok(g.p[0].m.filter(Boolean).length === 2, 'two Doomsday Tokens');
  const w = g.p[0].hand.find(c => E.name(c) === FILL);
  ok(!hasOpt(g, 'ns:' + w.u) && hasOpt(g, 'set:' + w.u), 'no Normal Summon, Set allowed');
});
T('Fiend\'s Sanctuary: the token\'s battle damage goes to the opponent', () => {
  const g = duel({ board: [{ hand: ['Fiend\'s Sanctuary'], turn: 2 }, { hand: [], m: ['Cyber Dragon'] }] });
  act(g, 0, 'Fiend\'s Sanctuary'); passAll(g);
  const t = on(g, 0, 'Metal Fiend Token'); ok(!!t, 'Metal Fiend Token summoned');
  choose(g, 'end'); passAll(g); until(g, 1, 'main1');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Metal Fiend Token'); passAll(g); passAll(g); passAll(g);
  ok(g.p[0].lp === 8000 && g.p[1].lp === 8000 - 2100, `B took the 2100 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Gaap turns every monster to Attack Position', () => {
  const g = duel({ board: [{ hand: [], m: ['Gaap the Divine Soldier'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }, { n: 'Cyber Dragon', pos: 'def' }] }] });
  ok(g.p[1].m.filter(Boolean).every(m => m.pos === 'atk'), 'opponent monsters are in Attack Position');
});
T('Generation Shift destroys a monster and adds a copy', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: ['Generation Shift'], deckTop: ['Cyber Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Generation Shift'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && inZ(g, 0, 'hand', 'Cyber Dragon'), 'Cyber Dragon destroyed and another added');
});
T('Gauntlet Warrior boosts Warriors until their next battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Gauntlet Warrior', 'Celtic Guardian'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  act(g, 0, 'Gauntlet Warrior'); passAll(g);
  const cg = on(g, 0, 'Celtic Guardian'); ok(E.atk(g, cg) === 1900, `Celtic Guardian has ${E.atk(g, cg)} ATK`);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack ' + FILL); passAll(g); passAll(g); passAll(g);
  ok(inZ(g, 1, 'gy', FILL) && on(g, 0, 'Celtic Guardian') && E.atk(g, on(g, 0, 'Celtic Guardian')) === 1400, 'won the battle, boost gone after it');
});
T('Gernia comes back in the next Standby Phase after an opponent\'s effect', () => {
  const g = duel({ board: [{ hand: [FILL], st: ['Raigeki Break'], turn: 2 }, { m: ['Gernia'] }] });
  act(g, 0, 'Raigeki Break'); choose(g, FILL); passAll(g);
  ok(inZ(g, 1, 'gy', 'Gernia'), 'Gernia destroyed');
  choose(g, 'end'); passAll(g); until(g, 1, 'main1');
  ok(on(g, 1, 'Gernia'), 'Gernia Special Summoned in B\'s Standby Phase');
});
T('Flashbang ends the Battle Phase after a direct attack', () => {
  const g = duel({ board: [{ hand: [FILL], m: [FILL, 'Cyber Dragon'], turn: 2 }, { st: ['Flashbang'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g);
  choose(g, 'yes', 1); passAll(g); passAll(g);
  ok(inZ(g, 1, 'gy', 'Flashbang'), 'Flashbang used');
  until(g, 0, 'main2', 10);
  ok(g.phase === 'main2' && !hasOpt(g, 'atk:') && !hasOpt(g, 'ns:'), 'no more attacks and no summons in Main Phase 2');
});
T('Firewall negates a direct attack by banishing a Pyro', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: [{ n: 'Firewall', pos: 'up' }], gy: ['Blazing Inpachi'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  choose(g, 'Firewall', 1); passAll(g);
  ok(g.p[1].lp === 8000 && inZ(g, 1, 'ban', 'Blazing Inpachi'), 'no damage, Pyro banished');
});
T('Ghost Gardna: destroyed, an opponent monster loses 1000 ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: [{ n: 'Ghost Gardna', pos: 'atk' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Ghost Gardna'); passAll(g); passAll(g); passAll(g);
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 1100, 'Cyber Dragon lost 1000 ATK');
});
T('Flying Fortress SKY FIRE destroys a summoned monster on the opponent\'s turn', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { m: ['Flying Fortress SKY FIRE'] }] });
  choose(g, 'ns:'); choose(g, 'SKY FIRE', 1); passAll(g);
  ok(inZ(g, 0, 'gy', FILL) && g.p[0].lp === 7200, 'summoned monster destroyed, 800 damage');
  const x = on(g, 1, 'Flying Fortress SKY FIRE'); L.move(g, x, 'gy');
  ok(L.forbid(g, { type: 'ss', c: x, p: 1, how: 'special' }), 'no revival from the GY');
});
T('Fortune Lady Earth levels up and burns 400', () => {
  const g = duel({ board: [{ hand: [], m: ['Fortune Lady Earth'], turn: 2 }, {}] });
  const x = on(g, 0, 'Fortune Lady Earth');
  ok(E.lv(x) === 7 && E.atk(g, x) === 2800 && g.p[1].lp === 7600, `Level ${E.lv(x)}, ${E.atk(g, x)} ATK, B ${g.p[1].lp}`);
});
T('Fortune Lady Fire: summoned by a Fortune Lady, destroys and burns', () => {
    const g2 = duel({ board: [{ hand: [FILL], st: ['Raigeki Break'], m: ['Fortune Lady Light'], deckTop: [FILL, 'Fortune Lady Fire'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  until(g2, 0, 'main1'); act(g2, 0, 'Raigeki Break'); choose(g2, FILL); choose(g2, 'Fortune Lady Light'); passAll(g2);
  yesAll(g2); if (g2.prompt && g2.prompt.type === 'pick') choose(g2, 'Fortune Lady Fire'); passAll(g2);
  ok(on(g2, 0, 'Fortune Lady Fire') && inZ(g2, 1, 'gy', 'Cyber Dragon') && g2.p[1].lp === 8000 - 2100, `Cyber Dragon destroyed, B ${g2.p[1].lp}`);
});
T('Flying Saucer Muusik\'i adds an Alien instead of drawing', () => {
  const g = duel({ board: [{ hand: [], m: ['Flying Saucer Muusik\'i'], deckTop: [FILL, 'Alien Grey'], turn: 2 }, {}] });
  choose(g, 'yes'); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Alien Grey');
  ok(inZ(g, 0, 'hand', 'Alien Grey'), 'Alien Grey added');
});
T('Exarion Universe: -400 ATK and piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Exarion Universe'], turn: 2 }, { m: [{ n: 'Celtic Guardian', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Celtic Guardian'); choose(g, 'Lose 400', 0); passAll(g); passAll(g); passAll(g);
  ok(g.p[1].lp === 8000 - (1400 - 1200), `piercing 200 (B ${g.p[1].lp})`);
});
T('Feather Shot: Avian attacks once per monster you control', () => {
  const g = duel({ board: [{ hand: ['Feather Shot'], m: ['Elemental HERO Avian', FILL, FILL], turn: 2 }, { m: [{ n: 'Celtic Guardian', pos: 'def' }, { n: 'Celtic Guardian', pos: 'def' }, { n: 'Celtic Guardian', pos: 'def' }] }] });
  act(g, 0, 'Feather Shot'); passAll(g);
  const av = on(g, 0, 'Elemental HERO Avian');
  choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'atk:' + g.p[0].m.find(c => c && E.name(c) === FILL).u), 'other monsters cannot attack');
  for (let i = 0; i < 3; i++) { choose(g, 'atk:' + av.u); passAll(g); passAll(g); passAll(g); }
  ok(av.attacks === 3 && !hasOpt(g, 'atk:' + av.u), `Avian attacked ${av.attacks} times`);
});
T('Gellenduo counts as 2 Tributes for a LIGHT Fairy', () => {
  const g = duel({ board: [{ hand: ['Guardian Angel Joan'], m: ['Gellenduo'], turn: 2 }, {}] });
  choose(g, 'ns:'); passAll(g);
  ok(on(g, 0, 'Guardian Angel Joan') && inZ(g, 0, 'gy', 'Gellenduo'), 'Tribute Summoned with only Gellenduo');
});
T('Everliving Underworld Cannon burns 800 on a Zombie Special Summon', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Armored Zombie'], st: [{ n: 'Everliving Underworld Cannon', pos: 'up' }], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); passAll(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Armored Zombie'); passAll(g);
  ok(g.p[1].lp === 7200, `800 damage (B ${g.p[1].lp})`);
});
T('Field Barrier: Field Spells survive Heavy Storm and no new Field Spell', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm', 'Mountain'], st: [{ n: 'Field Barrier', pos: 'up' }], turn: 2 }, {}] });
  const fz = { ...{} }; const P = g.p[1]; const m = g.p[0].hand.find(c => E.name(c) === 'Mountain');
  ok(!hasOpt(g, 'a:' + m.u + ':'), 'Mountain cannot be activated');
  L.move(g, m, 'fz', { ctrl: 1, pos: 'up' }); g.seq++;
  act(g, 0, 'Heavy Storm'); passAll(g);
  ok(P.fz && E.name(P.fz) === 'Mountain', 'Mountain survives');
});
T('Garlandolf destroys monsters with DEF at or under its ATK', () => {
  const g = duel({ board: [{ hand: ['Ritual of Destruction', 'Garlandolf, King of Destruction'], m: [FILL, 'Celtic Guardian'], turn: 2 }, { m: [FILL, 'Cyber Dragon', 'Big Shield Gardna'] }] });
  act(g, 0, 'Ritual of Destruction'); passAll(g); for (let i = 0; i < 5 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else E.act(g, [g.prompt.opts[0].key]); }
  const x = on(g, 0, 'Garlandolf, King of Destruction');
  ok(x && on(g, 1, 'Big Shield Gardna') && g.p[1].m.filter(Boolean).length === 1 && [2700, 2800].includes(E.atk(g, x)), `Garlandolf has ${x && E.atk(g, x)} ATK, B keeps Big Shield Gardna`);
});
T('Gateway to Dark World: revive a Dark World monster, then no more summons', () => {
  const g = duel({ board: [{ hand: ['Gateway to Dark World', FILL], gy: ['Broww, Huntsman of Dark World'], turn: 2 }, {}] });
  act(g, 0, 'Gateway to Dark World'); passAll(g);
  const w = g.p[0].hand.find(c => E.name(c) === FILL);
  ok(on(g, 0, 'Broww, Huntsman of Dark World') && !hasOpt(g, 'ns:' + w.u) && hasOpt(g, 'set:' + w.u), 'Broww summoned, Set only');
});
T('Genesis Dragon and Genetic Woman', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon'], m: ['Genesis Dragon', 'Genetic Woman'], gy: ['Tyrant Dragon'], ban: ['Psychic Commander'], turn: 2 }, {}] });
  act(g, 0, 'Genesis Dragon'); passAll(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Tyrant Dragon'); passAll(g);
  ok(inZ(g, 0, 'hand', 'Tyrant Dragon') && inZ(g, 0, 'gy', 'Blue-Eyes White Dragon'), 'a Dragon added from the GY');
  act(g, 0, 'Genetic Woman'); passAll(g);
  ok(inZ(g, 0, 'hand', 'Psychic Commander') && g.p[0].lp === 7000, 'banished Psychic added for 1000 LP');
});
T('Fifth Hope draws 3 with an empty field and hand', () => {
  const g = duel({ board: [{ hand: ['Fifth Hope'], gy: ['Elemental HERO Avian', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix', 'Elemental HERO Clayman', 'Elemental HERO Sparkman'], turn: 2 }, {}] });
  act(g, 0, 'Fifth Hope'); passAll(g);
  ok(g.p[0].hand.length === 3 && g.p[0].gy.length === 1, `drew ${g.p[0].hand.length}`);
});
T('Faustian Bargain sends a Special Summoned monster and summons a Normal', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn', 'Faustian Bargain', 'Celtic Guardian'], gy: ['Cyber Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); act(g, 0, 'Faustian Bargain'); passAll(g); choose(g, 'Celtic Guardian'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && on(g, 0, 'Celtic Guardian'), 'Cyber Dragon sent, Celtic Guardian summoned');
});
T('Forbidden Chalice: +400 and effects negated until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Forbidden Chalice'], m: ['Fortune Lady Earth'], turn: 2 }, {}] });
  const x = on(g, 0, 'Fortune Lady Earth');
  act(g, 0, 'Forbidden Chalice'); passAll(g);
  ok(E.atk(g, x) === 400 && x.flags.negated, `${E.atk(g, x)} ATK with its effect negated`);
  choose(g, 'end'); passAll(g); until(g, 1, 'main1');
  ok(!x.flags.negated && E.atk(g, x) === E.lv(x) * 400, 'negation ends with the turn');
});
T('Future Samurai destroys only after a Gemini Summon', () => {
  const g = duel({ board: [{ hand: [], m: ['Future Samurai'], gy: [FILL], turn: 2 }, { m: ['Cyber Dragon'] }] });
  const s = on(g, 0, 'Future Samurai');
  ok(!hasOpt(g, 'a:' + s.u + ':'), 'no effect before the Gemini Summon');
  choose(g, 'gem:'); act(g, 0, 'Future Samurai'); choose(g, 'Cyber Dragon'); passAll(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && inZ(g, 0, 'ban', FILL), 'Cyber Dragon destroyed');
});
T('Gale Dogra: the sent Extra Deck monster cannot be revived', () => {
  const g = duel({ ex0: ['Stardust Dragon'], board: [{ hand: [], m: ['Gale Dogra'], turn: 2 }, {}] });
  act(g, 0, 'Gale Dogra'); passAll(g);
  const s = g.p[0].gy.find(c => E.name(c) === 'Stardust Dragon');
  ok(s && g.p[0].lp === 5000 && L.forbid(g, { type: 'ss', c: s, p: 0, how: 'special' }), 'Stardust in the GY, 3000 paid, no revival');
});
T('Fiendish Engine Omega: token at End Phase, destroyed after its boost', () => {
  const g = duel({ board: [{ hand: [], m: ['Fiendish Engine Omega'], turn: 2 }, {}] });
  act(g, 0, 'Fiendish Engine Omega'); passAll(g);
  ok(E.atk(g, on(g, 0, 'Fiendish Engine Omega')) === 3800, '3800 ATK');
  choose(g, 'end'); passAll(g); until(g, 1, 'main1');
  ok(inZ(g, 0, 'gy', 'Fiendish Engine Omega') && on(g, 0, 'Engine Token'), 'destroyed, Engine Token left');
});
T('Fish Depth Charge, Fragrance Storm, Froggy Forcefield, Full Salvo, Feather Wind', () => {
  const g = duel({ board: [{ hand: [], m: ['7 Colored Fish', 'Man Eater'], st: ['Fish Depth Charge', 'Full Salvo', 'Fragrance Storm'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  const h = g.p[0].hand.length;
  act(g, 0, 'Fish Depth Charge'); passAll(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && g.p[0].hand.length === h + 1, 'Fish Depth Charge destroyed and drew');
  const g3 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Beelze Frog'], st: ['Froggy Forcefield'] }] });
  choose(g3, 'bp'); passAll(g3); choose(g3, 'Attack Beelze Frog'); choose(g3, 'Froggy', 1); passAll(g3);
  ok(inZ(g3, 0, 'gy', FILL), 'Froggy Forcefield destroyed the attacker');
  const g4 = duel({ board: [{ hand: ['Heavy Storm', FILL], st: ['Full Salvo'], turn: 2 }, {}] });
  const hn = g4.p[0].hand.length; act(g4, 0, 'Full Salvo'); passAll(g4);
  ok(g4.p[0].hand.length === 0 && g4.p[1].lp === 8000 - 200 * hn, `Full Salvo: B ${g4.p[1].lp}`);
  const g5 = duel({ board: [{ hand: ['Heavy Storm'], turn: 2 }, { m: ['Elemental HERO Avian'], st: ['Feather Wind', 'Mirror Force'] }] });
  act(g5, 0, 'Heavy Storm'); choose(g5, 'Feather Wind', 1); passAll(g5);
  ok(inZ(g5, 0, 'gy', 'Heavy Storm') && inZ(g5, 1, 'st', 'Mirror Force'), 'Feather Wind negated Heavy Storm');
});
T('Evolution Burst destroys a card and Cyber Dragon cannot attack', () => {
  const g = duel({ board: [{ hand: ['Evolution Burst'], m: ['Cyber Dragon'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Evolution Burst'); passAll(g);
  choose(g, 'bp'); passAll(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && !hasOpt(g, 'atk:'), 'Mirror Force destroyed, no attack');
});
T('Etoile Cyber hits for 1700 directly; Freya gives Fairies 400', () => {
  const g = duel({ board: [{ hand: [], m: ['Etoile Cyber'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g); passAll(g);
  ok(g.p[1].lp === 6300, `B ${g.p[1].lp}`);
  const g2 = duel({ board: [{ hand: [], m: ['Freya, Spirit of Victory', 'Gellenduo'], turn: 2 }, {}] });
  ok(E.atk(g2, on(g2, 0, 'Gellenduo')) === 2100 && E.atk(g2, on(g2, 0, 'Freya, Spirit of Victory')) === 500, 'Fairies gain 400');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-38 checks passed.');
process.exit(fails ? 1 : 0);
