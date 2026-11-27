// Scenario checks for full pool batch 39: node build/test_full-39.js
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
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const goBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => choose(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const ns = (g, p, n) => choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u);
const logHas = (g, s) => g.log.some(l => l.includes(s));
const endTurn = g => { const t = g.turnNo; for (let i = 0; i < 80 && g.prompt && g.turnNo === t; i++) { const pr = g.prompt;
  if (pr.type === 'idle') E.act(g, [pr.opts.some(o => o.key === 'end') ? 'end' : 'endbp']); else if (pr.type === 'respond') E.act(g, ['pass']);
  else if (pr.type === 'yesno') E.act(g, ['y']); else if (pr.type === 'choose') E.act(g, [pr.opts[0].key]); else E.act(g, pr.opts.slice(0, pr.min).map(o => o.key)); } auto(g); };
const pickName = (g, n) => choose(g, n);

/* ----- Gi ----- */
T('Gigantic Cephalotus gains 200 when a Plant goes from the field to the GY', () => {
  const g = duel({ board: [{ m: ['Gigantic Cephalotus', 'Jerry Beans Man'], turn: 2 }, { m: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Jerry Beans Man'), on(g, 1, FILL)); auto(g);
  ok(inZ(g, 0, 'gy', 'Jerry Beans Man') && E.atk(g, on(g, 0, 'Gigantic Cephalotus')) === 2050, 'Cephalotus is 2050 ATK');
});
T('Gigastone Omega: own summon, no Normal Summon, sent by an effect destroys their Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['Gigastone Omega', 'Dark Hole'], gy: [FILL, 'Battle Ox'] }, { st: ['Mirror Force', 'Fairy Box'] }] });
  ok(!hasOpt(g, 'ns:' + cardOf(g, 0, 'Gigastone Omega').u), 'no Normal Summon');
  choose(g, 'sp:'); auto(g);
  ok(!!on(g, 0, 'Gigastone Omega') && g.p[0].ban.length === 2, 'summoned, 2 EARTHs banished');
  act(g, 0, 'Dark Hole'); auto(g);
  ok(inZ(g, 0, 'gy', 'Gigastone Omega') && g.p[1].st.every(x => !x), 'their Spells/Traps were destroyed');
});
T('Gilford the Legend equips Equip Spells from the GY', () => {
  const g = duel({ board: [{ hand: ['Gilford the Legend'], m: ['Celtic Guardian', 'Celtic Guardian', FILL], gy: ['Black Pendant', 'Black Pendant'] }, {}] });
  ns(g, 0, 'Gilford the Legend'); E.act(g, g.p[0].m.filter(x => x && E.name(x) === 'Celtic Guardian').map(x => 'u' + x.u)); auto(g);
  const g2 = on(g, 0, 'Gilford the Legend');
  ok(!!g2 && g.p[0].st.filter(x => x && E.name(x) === 'Black Pendant' && x.equipTo === g2.u).length === 2, 'both Black Pendants equipped to Gilford');
  ok(E.atk(g, g2) === 3600, 'Gilford is 3600 ATK');
});
T('Gilford the Lightning with 3 Tributes destroys their monsters', () => {
  const g = duel({ board: [{ hand: ['Gilford the Lightning'], m: [FILL, FILL, FILL] }, { m: [FILL, 'Battle Ox'] }] });
  ns(g, 0, 'Gilford the Lightning'); choose(g, '3 Tributes'); auto(g);
  ok(!!on(g, 0, 'Gilford the Lightning') && E.monsOf(g, 1).length === 0, 'their monsters were destroyed');
  const h = duel({ board: [{ hand: ['Gilford the Lightning'], m: [FILL, FILL, FILL] }, { m: [FILL] }] });
  ns(h, 0, 'Gilford the Lightning'); choose(h, '2 Tributes'); auto(h);
  ok(!!on(h, 0, 'Gilford the Lightning') && E.monsOf(h, 1).length === 1, 'with 2 Tributes nothing is destroyed');
});
T('Give and Take', () => {
  const g = duel({ board: [{ st: ['Give and Take'], m: [FILL], gy: ['Dark Magician'] }, {}] });
  act(g, 0, 'Give and Take'); auto(g);
  const dm = on(g, 1, 'Dark Magician');
  ok(!!dm && dm.pos === 'def', 'Dark Magician is on their side in Defense');
  ok(E.lv(on(g, 0, FILL)) === 11, 'Warwolf is Level 11'); endTurn(g); ok(E.lv(on(g, 0, FILL)) === 4, 'back to Level 4 after the turn');
});
T('Gladiator\'s Return shuffles 3 and draws 1', () => {
  const g = duel({ board: [{ hand: ['Gladiator\'s Return'], gy: ['Gladiator Beast Bestiari', 'Gladiator Beast Darius', 'Gladiator Beast Laquari'] }, {}] });
  const h0 = g.p[0].hand.length; act(g, 0, 'Gladiator\'s Return'); auto(g);
  ok(g.p[0].gy.filter(x => /Gladiator Beast/.test(E.name(x))).length === 0 && g.p[0].hand.length === h0, 'GBs left the GY, 1 card drawn');
  ok(g.p[0].deck.filter(x => /Gladiator Beast/.test(E.name(x))).length === 3, 'they are in the Deck');
});
T('Glorious Illusion revives a Lightsworn and is linked to it', () => {
  const g = duel({ board: [{ st: ['Glorious Illusion'], hand: ['Mystical Space Typhoon'], gy: ['Ehren, Lightsworn Monk'] }, {}] });
  act(g, 0, 'Glorious Illusion'); auto(g);
  ok(!!on(g, 0, 'Ehren, Lightsworn Monk') && on(g, 0, 'Ehren, Lightsworn Monk').pos === 'atk', 'Ehren summoned in Attack');
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(!on(g, 0, 'Ehren, Lightsworn Monk') && inZ(g, 0, 'gy', 'Ehren, Lightsworn Monk'), 'Ehren destroyed with it');
  const h = duel({ board: [{ st: ['Glorious Illusion'], gy: ['Ehren, Lightsworn Monk'] }, {}] });
  act(h, 0, 'Glorious Illusion'); auto(h); const d = h.p[0].deck.length; endTurn(h);
  ok(h.p[0].deck.length === d - 5, 'End Phase sent 2 cards from the Deck (and Ehren 3 more)');
});

/* ----- Go ----- */
T('Goe Goe and Goldd: discard 2 at random, Goldd comes back and destroys', () => {
  const g = duel({ first: 1, board: [{ hand: Array(5).fill('Goldd, Wu-Lord of Dark World'), turn: 2 }, { m: ['Goe Goe the Gallant Ninja'], st: ['Fairy Box'] }] });
  goBP(g); attack(g, on(g, 1, 'Goe Goe the Gallant Ninja'), null); auto(g);
  ok(g.p[0].hand.length === 3, 'A discarded 2');
  ok(E.monsOf(g, 0).filter(x => E.name(x) === 'Goldd, Wu-Lord of Dark World').length >= 1, 'Goldd was Special Summoned');
  ok(!on(g, 1, 'Goe Goe the Gallant Ninja') || g.p[1].st.every(x => !x), 'Goldd destroyed their cards');
});
T('Goe Goe needs 5 cards in their hand', () => {
  const g = duel({ board: [{ m: ['Goe Goe the Gallant Ninja'], turn: 2 }, { hand: [FILL, FILL, FILL, FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Goe Goe the Gallant Ninja'), null); auto(g);
  ok(g.p[1].hand.length === 4, 'no discard with 4 cards');
});
T('Gren destroys a Spell/Trap when discarded by an effect', () => {
  const g = duel({ first: 1, board: [{ hand: Array(5).fill('Gren, Tactician of Dark World'), turn: 2 }, { m: ['Goe Goe the Gallant Ninja'], st: ['Fairy Box'] }] });
  goBP(g); attack(g, on(g, 1, 'Goe Goe the Gallant Ninja'), null); auto(g);
  ok(g.p[1].st.every(x => !x), 'Fairy Box destroyed');
});
T('Goggle Golem is 2100 ATK once Gemini Summoned', () => {
  const g = duel({ board: [{ m: ['Goggle Golem'] }, {}] });
  ok(E.atk(g, on(g, 0, 'Goggle Golem')) === 1500, '1500 as a Normal Monster');
  choose(g, 'gem:'); auto(g); ok(E.atk(g, on(g, 0, 'Goggle Golem')) === 2100, '2100 after the Gemini Summon');
});
T('Goka, the Pyre of Malice', () => {
  const g = duel({ board: [{ hand: ['Goka, the Pyre of Malice'], m: ['Blazing Inpachi', 'Charcoal Inpachi'] }, {}] });
  choose(g, 'sp:'); passAll(g); choose(g, 'Blazing Inpachi'); auto(g);
  ok(!!on(g, 0, 'Goka, the Pyre of Malice') && inZ(g, 0, 'gy', 'Blazing Inpachi'), 'summoned and destroyed a FIRE monster');
  choose(g, 'Tribute a FIRE'); auto(g);
  ok(E.atk(g, on(g, 0, 'Goka, the Pyre of Malice')) === 2700 && inZ(g, 0, 'gy', 'Charcoal Inpachi'), 'Tributed for +500');
  endTurn(g); endTurn(g);
  ok(!!on(g, 0, 'Fireball Token'), 'a Fireball Token in the Standby Phase');
});
T('Gonogo turns the monster it battled face-down', () => {
  const g = duel({ board: [{ m: ['Gonogo'], turn: 2 }, { m: [{ n: 'Elemental HERO Clayman', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Gonogo'), on(g, 1, 'Elemental HERO Clayman')); auto(g);
  ok(on(g, 1, 'Elemental HERO Clayman').pos === 'set', 'Clayman is face-down');
});
T('Gozen Match', () => {
  const g = duel({ board: [{ st: ['Gozen Match'], m: [FILL, 'Dark Magician'], hand: ['Mystic Tomato', 'Battle Ox'] }, { m: [FILL, 'Harpie Lady'] }] });
  act(g, 0, 'Gozen Match'); passAll(g); choose(g, 'EARTH'); choose(g, 'WIND'); auto(g);
  ok(!on(g, 0, 'Dark Magician') && !!on(g, 0, FILL), 'A kept EARTH');
  ok(!on(g, 1, FILL) && !!on(g, 1, 'Harpie Lady'), 'B kept WIND');
  ok(!hasOpt(g, 'ns:' + cardOf(g, 0, 'Mystic Tomato').u) && hasOpt(g, 'ns:' + cardOf(g, 0, 'Battle Ox').u), 'a DARK monster can\'t be Normal Summoned, an EARTH can');
});
T('Gragonith counts different Lightsworn names', () => {
  const g = duel({ board: [{ m: ['Gragonith, Lightsworn Dragon'], gy: ['Ehren, Lightsworn Monk', 'Ehren, Lightsworn Monk', 'Garoth, Lightsworn Warrior'] }, {}] });
  const c = on(g, 0, 'Gragonith, Lightsworn Dragon'); ok(E.atk(g, c) === 2600 && E.def(g, c) === 2200, '+600 ATK/DEF');
  const d = g.p[0].deck.length; endTurn(g); ok(g.p[0].deck.length === d - 3, 'End Phase sent 3 cards');
});

/* ----- Gr ----- */
T('Grand Convergence', () => {
  const g = duel({ board: [{ hand: ['Grand Convergence'], st: [{ n: 'Macro Cosmos', pos: 'up' }], m: [FILL] }, { m: [FILL] }] });
  act(g, 0, 'Grand Convergence'); auto(g);
  ok(g.p[1].lp === 7700 && E.monsOf(g, 0).length === 0 && E.monsOf(g, 1).length === 0, '300 damage and all monsters destroyed');
  const h = duel({ board: [{ hand: ['Grand Convergence'] }, { m: [FILL] }] });
  ok(!hasOpt(h, 'a:' + cardOf(h, 0, 'Grand Convergence').u), 'needs Macro Cosmos');
});
T('Grapple Blocker', () => {
  const g = duel({ board: [{ hand: ['Grapple Blocker'] }, { m: [FILL] }] });
  ns(g, 0, 'Grapple Blocker'); auto(g);
  const w = on(g, 1, FILL); ok(!!w.flags.noTribute, 'the selected monster can\'t be Tributed');
  endTurn(g); ok(g.p[0].lp === 7500, 'paid 500 in the End Phase');
  goBP(g); ok(!hasOpt(g, 'atk:' + w.u), 'the selected monster can\'t attack');
});
T('Grass Phantom', () => {
  const g = duel({ board: [{ m: ['Grass Phantom'], gy: ['Grass Phantom', 'Grass Phantom'] }, {}] });
  ok(E.atk(g, on(g, 0, 'Grass Phantom')) === 2000, '1000 + 2 x 500');
});
T('Grasschopper attacks every monster once', () => {
  const g = duel({ board: [{ m: ['Grasschopper'], turn: 2 }, { m: ['Celtic Guardian', 'Celtic Guardian'] }] });
  choose(g, 'gem:'); auto(g); goBP(g);
  const gc = on(g, 0, 'Grasschopper');
  attack(g, gc, g.p[1].m.find(Boolean)); auto(g);
  attack(g, gc, g.p[1].m.find(Boolean)); auto(g);
  ok(E.monsOf(g, 1).length === 0, 'both monsters destroyed');
  const h = duel({ board: [{ m: ['Grasschopper'], turn: 2 }, { m: ['Celtic Guardian', 'Celtic Guardian'] }] });
  goBP(h); attack(h, on(h, 0, 'Grasschopper'), h.p[1].m.find(Boolean)); auto(h);
  ok(!hasOpt(h, 'atk:'), 'without the Gemini Summon only 1 attack');
});
T('Gravi-Crush Dragon', () => {
  const g = duel({ board: [{ m: ['Gravi-Crush Dragon'], st: [{ n: 'Messenger of Peace', pos: 'up' }] }, { m: [FILL] }] }); auto(g);
  choose(g, 'Send a Continuous Spell'); auto(g);
  ok(inZ(g, 0, 'gy', 'Messenger of Peace') && E.monsOf(g, 1).length === 0, 'Messenger sent, their monster destroyed');
});
T('Gravitic Orb flips their positions', () => {
  const g = duel({ board: [{ m: [{ n: 'Gravitic Orb', pos: 'set' }] }, { m: [FILL, { n: 'Battle Ox', pos: 'def' }] }] });
  choose(g, 'flip:'); auto(g);
  ok(on(g, 1, FILL).pos === 'def' && on(g, 1, 'Battle Ox').pos === 'atk', 'positions changed');
});
T('Gravity Behemoth', () => {
  const g = duel({ board: [{ hand: ['Gravity Behemoth', 'Pandemonium'], turn: 2 }, {}] });
  ok(hasOpt(g, 'ns:' + cardOf(g, 0, 'Gravity Behemoth').u), 'Normal Summon with no Tributes on an empty field');
  ns(g, 0, 'Gravity Behemoth'); auto(g);
  ok(!!on(g, 0, 'Gravity Behemoth'), 'summoned');
  act(g, 0, 'Pandemonium'); auto(g);
  choose(g, 'Destroy all Field Spells'); auto(g);
  ok(!g.p[0].fz && inZ(g, 0, 'gy', 'Pandemonium'), 'Pandemonium destroyed');
  goBP(g); ok(!hasOpt(g, 'atk:' + on(g, 0, 'Gravity Behemoth').u), 'it can\'t attack this turn');
  const h = duel({ board: [{ hand: ['Gravity Behemoth'], m: [FILL] }, {}] });
  ok(hasOpt(h, 'ns:' + cardOf(h, 0, 'Gravity Behemoth').u) && cardOf(h, 0, 'Gravity Behemoth') && E.idleOpts(h).find(o => o.key === 'ns:' + cardOf(h, 0, 'Gravity Behemoth').u).label === 'Tribute Summon', 'needs a Tribute when the field has cards');
});
T('Green Baboon comes from the hand when a Beast is destroyed', () => {
  const g = duel({ board: [{ hand: ['Green Baboon, Defender of the Forest', 'Dark Hole'], m: ['Burglar'] }, {}] });
  act(g, 0, 'Dark Hole'); auto(g);
  ok(!!on(g, 0, 'Green Baboon, Defender of the Forest') && g.p[0].lp === 7000, 'Baboon summoned for 1000 LP');
});
T('Grinder Golem goes to the opponent, 2 Tokens for you', () => {
  const g = duel({ board: [{ hand: ['Grinder Golem', FILL] }, {}] });
  ok(!hasOpt(g, 'ns:' + cardOf(g, 0, 'Grinder Golem').u), 'no Normal Summon');
  choose(g, 'sp:'); auto(g);
  ok(!!on(g, 1, 'Grinder Golem') && g.p[0].m.filter(x => x && E.name(x) === 'Grinder Token').length === 2, 'Golem on their side, 2 Tokens on ours');
  ok(!hasOpt(g, 'ns:') && !hasOpt(g, 'set:' + cardOf(g, 0, FILL).u), 'no Normal Summon or Set this turn');
});
T('Ground Spider changes a summoned monster to Defense', () => {
  const g = duel({ board: [{ hand: [FILL] }, { m: [{ n: 'Ground Spider', pos: 'def' }] }] });
  ns(g, 0, FILL); auto(g);
  ok(on(g, 0, FILL).pos === 'def', 'Warwolf is in Defense');
});
T('Guard Dog stops their Special Summons', () => {
  const g = duel({ board: [{ m: [{ n: 'Guard Dog', pos: 'set' }] }, {}] });
  choose(g, 'flip:'); auto(g);
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[1].deck[0], p: 1, how: 'special' }) && !E.lib.forbid(g, { type: 'ss', c: g.p[0].deck[0], p: 0, how: 'special' }), 'only the opponent is locked');
  endTurn(g); ok(!E.lib.forbid(g, { type: 'ss', c: g.p[1].deck[0], p: 1, how: 'special' }), 'the lock ends with the turn');
});
T('Guard Penalty draws when the monster goes to Defense', () => {
  const g = duel({ board: [{ hand: ['Guard Penalty'], m: [FILL] }, {}] });
  act(g, 0, 'Guard Penalty'); auto(g); const h = g.p[0].hand.length;
  choose(g, 'pos:'); auto(g);
  ok(g.p[0].hand.length === h + 1, 'drew 1 card');
});
T('Gundari returns itself and a Synchro to the hand', () => {
  const g = duel({ board: [{ m: ['Gundari'], turn: 2 }, { m: ['Stardust Dragon'] }] });
  goBP(g); attack(g, on(g, 0, 'Gundari'), on(g, 1, 'Stardust Dragon')); auto(g);
  ok(inZ(g, 0, 'hand', 'Gundari') && inZ(g, 1, 'extra', 'Stardust Dragon') && g.p[0].lp === 8000, 'both returned, no damage');
});
T('Gyroid survives 1 battle a turn', () => {
  const g = duel({ board: [{ m: ['Gyroid'], turn: 2 }, { m: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Gyroid'), on(g, 1, FILL)); auto(g);
  ok(!!on(g, 0, 'Gyroid') && g.p[0].lp === 7000, 'still on the field, damage taken');
});

/* ----- Ha ----- */
T('Half or Nothing: halve their ATK until the Battle Phase ends', () => {
  const g = duel({ first: 1, board: [{ st: ['Half or Nothing'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'bp'); choose(g, 'a:' + cardOf(g, 0, 'Half or Nothing').u); passAll(g); choose(g, 'Halve'); auto(g);
  ok(E.atk(g, on(g, 1, FILL)) === 1000, 'ATK halved');
  choose(g, 'endbp'); auto(g); ok(E.atk(g, on(g, 1, FILL)) === 2000, 'back after the Battle Phase');
  const h = duel({ first: 1, board: [{ st: ['Half or Nothing'], turn: 2 }, { m: [FILL] }] });
  choose(h, 'bp'); choose(h, 'a:' + cardOf(h, 0, 'Half or Nothing').u); passAll(h); choose(h, 'End the Battle'); auto(h);
  ok(h.phase === 'main2', 'the Battle Phase ended');
});
T('Hamon', () => {
  const g = duel({ board: [{ hand: ['Hamon, Lord of Striking Thunder'], st: [{ n: 'Messenger of Peace', pos: 'up' }, { n: 'Level Limit - Area B', pos: 'up' }, { n: 'Ancient Gear Castle', pos: 'up' }] }, {}] }); auto(g);
  choose(g, 'sp:'); auto(g);
  ok(!!on(g, 0, 'Hamon, Lord of Striking Thunder') && g.p[0].st.every(x => !x), 'summoned by sending 3 Continuous Spells');
  const h = duel({ first: 1, board: [{ m: [{ n: 'Hamon, Lord of Striking Thunder', pos: 'def' }, FILL], turn: 2 }, { m: ['Dark Magician'] }] });
  goBP(h); ok(!hasOpt(h, 'atk:' + on(h, 1, 'Dark Magician').u + ':' + on(h, 0, FILL).u) && hasOpt(h, 'atk:' + on(h, 1, 'Dark Magician').u + ':' + on(h, 0, 'Hamon, Lord of Striking Thunder').u), 'only Hamon can be attacked');
  const k = duel({ board: [{ m: ['Hamon, Lord of Striking Thunder'], turn: 2 }, { m: [FILL] }] });
  goBP(k); attack(k, on(k, 0, 'Hamon, Lord of Striking Thunder'), on(k, 1, FILL)); auto(k);
  ok(k.p[1].lp === 8000 - 2000 - 1000, '2000 battle damage plus 1000');
});
T('Hand Destruction', () => {
  const g = duel({ board: [{ hand: ['Hand Destruction', FILL, 'Battle Ox', 'Celtic Guardian'] }, { hand: ['Dark Magician', 'Sangan', 'Battle Ox'] }] });
  const d0 = g.p[0].deck.length, d1 = g.p[1].deck.length;
  act(g, 0, 'Hand Destruction'); auto(g);
  ok(g.p[0].gy.length === 3 && g.p[1].gy.length === 2, '2 cards each to the GY');
  ok(g.p[0].deck.length === d0 - 2 && g.p[1].deck.length === d1 - 2, 'each drew 2');
});
T('Handcuffs Dragon equips to the attacker, then comes back', () => {
  const g = duel({ first: 1, board: [{ m: ['Handcuffs Dragon'], hand: ['Dark Hole'], turn: 2 }, { m: ['Dark Magician'] }] });
  goBP(g); attack(g, on(g, 1, 'Dark Magician'), on(g, 0, 'Handcuffs Dragon')); auto(g);
  ok(g.p[0].st.some(x => x && E.name(x) === 'Handcuffs Dragon') && E.atk(g, on(g, 1, 'Dark Magician')) === 700, 'equipped, Dark Magician is 700 ATK');
  endTurn(g); act(g, 0, 'Dark Hole'); auto(g);
  ok(!!on(g, 0, 'Handcuffs Dragon'), 'Handcuffs Dragon Special Summoned when the equipped monster was destroyed');
});
T('Hanewata stops effect damage', () => {
  const g = duel({ board: [{ hand: ['Hanewata'] }, {}] });
  choose(g, 'Discard: no effect damage'); auto(g);
  E.lib.damage(g, 0, 500, {}); ok(g.p[0].lp === 8000, 'no effect damage this turn');
});
T('Hannibal Necromancer destroys a face-up Trap', () => {
  const g = duel({ board: [{ hand: ['Hannibal Necromancer'] }, { st: [{ n: 'Fairy Box', pos: 'up' }] }] });
  ns(g, 0, 'Hannibal Necromancer'); auto(g);
  choose(g, 'Remove a counter'); auto(g);
  ok(inZ(g, 1, 'gy', 'Fairy Box'), 'Fairy Box destroyed');
});
T('Hard-sellin\' Goblin and Zombie', () => {
  const g = duel({ board: [{ m: [FILL], st: [{ n: 'Hard-sellin\' Goblin', pos: 'up' }], turn: 2 }, { st: ['Mirror Force'] }] });
  goBP(g); attack(g, on(g, 0, FILL), null); auto(g);
  ok(inZ(g, 1, 'hand', 'Mirror Force'), 'Mirror Force back to the hand');
  const h = duel({ board: [{ m: [FILL], st: [{ n: 'Hard-sellin\' Zombie', pos: 'up' }], turn: 2 }, { gy: ['Monster Reborn'] }] });
  goBP(h); attack(h, on(h, 0, FILL), null); auto(h);
  ok(h.p[1].gy.length === 0 && E.name(h.p[1].deck[0]) === 'Monster Reborn', 'Monster Reborn at the bottom of their Deck');
});
T('Harvest Angel of Wisdom adds a Counter Trap', () => {
  const g = duel({ first: 1, board: [{ m: ['Harvest Angel of Wisdom'], gy: ['Magic Jammer'], turn: 2 }, { m: ['Dark Magician'] }] });
  goBP(g); attack(g, on(g, 1, 'Dark Magician'), on(g, 0, 'Harvest Angel of Wisdom')); auto(g);
  ok(inZ(g, 0, 'hand', 'Magic Jammer'), 'Magic Jammer added');
});
T('Hate Buster', () => {
  const g = duel({ first: 1, board: [{ m: ['Archfiend Soldier'], st: ['Hate Buster'], turn: 2 }, { m: ['Dark Magician'] }] });
  goBP(g); attack(g, on(g, 1, 'Dark Magician'), on(g, 0, 'Archfiend Soldier'));
  choose(g, 'a:' + cardOf(g, 0, 'Hate Buster').u); auto(g);
  ok(!on(g, 1, 'Dark Magician') && !on(g, 0, 'Archfiend Soldier') && g.p[1].lp === 5500, 'both destroyed, 2500 damage');
});
T('Healing Wave Generator', () => {
  const g = duel({ board: [{ m: ['Healing Wave Generator', 'Dark Magician'] }, {}] });
  choose(g, 'Gain LP'); auto(g); ok(g.p[0].lp === 8700, 'gained 700');
});
T('Hecatrice adds Valhalla', () => {
  const g = duel({ board: [{ hand: ['Hecatrice'], deckTop: [FILL, 'Valhalla, Hall of the Fallen'] }, {}] });
  choose(g, 'Discard: add Valhalla'); auto(g);
  ok(inZ(g, 0, 'hand', 'Valhalla, Hall of the Fallen') && inZ(g, 0, 'gy', 'Hecatrice'), 'Valhalla added');
});
T('Herald of Creation', () => {
  const g = duel({ board: [{ m: ['Herald of Creation'], hand: [FILL], gy: ['Dark Magician'] }, {}] });
  choose(g, 'Discard: add'); auto(g); ok(inZ(g, 0, 'hand', 'Dark Magician') && inZ(g, 0, 'gy', FILL), 'Dark Magician added');
});
T('Herald of Green Light negates a Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'] }, { hand: ['Herald of Green Light', 'Shining Angel'] }] });
  const h = g.p[0].hand.length; act(g, 0, 'Pot of Greed');
  choose(g, 'a:' + cardOf(g, 1, 'Herald of Green Light').u); auto(g);
  ok(g.p[0].hand.length === h - 1 && inZ(g, 1, 'gy', 'Shining Angel') && inZ(g, 0, 'gy', 'Pot of Greed'), 'Pot of Greed negated');
});
T('Herculean Power summons a Gemini', () => {
  const g = duel({ board: [{ st: [{ n: 'Herculean Power', pos: 'up' }], hand: ['Aquarian Alessa'] }, { m: [FILL] }] });
  choose(g, 'Special Summon a Gemini'); auto(g); ok(!!on(g, 0, 'Aquarian Alessa'), 'Alessa summoned');
});
T('HERO\'s Bond', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Avian'], hand: ['HERO\'s Bond', 'Elemental HERO Burstinatrix', 'Elemental HERO Clayman'] }, {}] });
  act(g, 0, 'HERO\'s Bond'); auto(g);
  ok(!!on(g, 0, 'Elemental HERO Burstinatrix') && !!on(g, 0, 'Elemental HERO Clayman'), '2 HEROes summoned');
});
T('Hero\'s Rule 2 negates a GY-targeting card', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Dark Magician'] }, { st: ['Hero\'s Rule 2'] }] });
  act(g, 0, 'Monster Reborn'); if (g.prompt.type === 'pick') choose(g, 'Dark Magician');
  choose(g, 'a:' + cardOf(g, 1, 'Hero\'s Rule 2').u, 1);
  auto(g);
  ok(!on(g, 0, 'Dark Magician') && inZ(g, 0, 'gy', 'Dark Magician'), 'Monster Reborn negated');
});
T('Hidden Soldiers', () => {
  const g = duel({ board: [{ hand: [FILL] }, { st: ['Hidden Soldiers'], hand: ['Sangan'] }] });
  ns(g, 0, FILL);
  choose(g, 'a:' + cardOf(g, 1, 'Hidden Soldiers').u); auto(g);
  ok(!!on(g, 1, 'Sangan'), 'Sangan summoned');
});
T('Horseytail and its Token', () => {
  const g = duel({ first: 1, board: [{ m: ['Horseytail'], turn: 2 }, { m: ['Dark Magician'], hand: [FILL, FILL] }] });
  goBP(g); attack(g, on(g, 1, 'Dark Magician'), on(g, 0, 'Horseytail')); auto(g);
  const tok = on(g, 1, 'Horseytail Token'); ok(!!tok && tok.pos === 'def', 'Token on their side in Defense');
  endTurn(g);
  const h = duel({ board: [{ m: ['Jerry Beans Man'], turn: 2 }, { m: [{ n: 'Horseytail', pos: 'atk' }], hand: [FILL, FILL] }] });
  goBP(h); attack(h, on(h, 0, 'Jerry Beans Man'), on(h, 1, 'Horseytail')); auto(h);
  const tk = on(h, 0, 'Horseytail Token'); ok(!!tk, 'Token on A\'s side');
});
T('Hunter Owl', () => {
  const g = duel({ first: 1, board: [{ m: ['Hunter Owl', 'Harpie Lady'], turn: 2 }, { m: ['Dark Magician'] }] });
  ok(E.atk(g, on(g, 0, 'Hunter Owl')) === 2000, '+1000 for 2 WINDs');
  goBP(g); ok(!hasOpt(g, 'atk:' + on(g, 1, 'Dark Magician').u + ':' + on(g, 0, 'Hunter Owl').u), 'can\'t be attacked');
});
T('Hunting Instinct', () => {
  const g = duel({ first: 1, board: [{ st: ['Hunting Instinct'], hand: ['Sabersaurus'], turn: 2 }, { hand: ['Monster Reborn'], gy: ['Dark Magician'] }] });
  act(g, 1, 'Monster Reborn'); for (let i = 0; i < 10 && g.prompt && !(g.prompt.type === 'respond' && g.prompt.p === 0 && hasOpt(g, 'a:' + cardOf(g, 0, 'Hunting Instinct').u)); i++) { const pr = g.prompt; if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  choose(g, 'a:' + cardOf(g, 0, 'Hunting Instinct').u); auto(g);
  ok(!!on(g, 0, 'Sabersaurus'), 'Sabersaurus summoned');
});
T('Hydra Viper Tributes an Aqua each attack', () => {
  const g = duel({ board: [{ m: ['Hydra Viper', 'Mad Lobster', 'Mad Lobster'], turn: 2 }, {}] });
  goBP(g); const hv = on(g, 0, 'Hydra Viper');
  for (let i = 0; i < 2; i++) { choose(g, `atk:${hv.u}:d`); auto(g); }
  ok(g.p[1].lp === 8000 - 3600 - 0 || g.p[1].lp >= 8000 - 3600 - 3400, 'attacked twice');
  ok(cnt(g, 0, 'gy', 'Mad Lobster') === 2 && !hasOpt(g, `atk:${hv.u}:`), '2 Lobsters Tributed, no third attack without an Aqua');
});
T('Hydro Pressure Cannon', () => {
  const g = duel({ board: [{ m: ['Enchanting Mermaid'], hand: ['Hydro Pressure Cannon'], turn: 2 }, { m: ['Dancing Elf'], hand: [FILL, FILL] }] });
  act(g, 0, 'Hydro Pressure Cannon'); auto(g); const h = g.p[1].hand.length;
  goBP(g); attack(g, on(g, 0, 'Enchanting Mermaid'), on(g, 1, 'Dancing Elf')); auto(g);
  ok(g.p[1].hand.length === h - 1, 'a random card from their hand went to the GY');
});
T('Hydrogeddon summons another from the Deck', () => {
  const g = duel({ board: [{ m: ['Hydrogeddon'], deckTop: [FILL, 'Hydrogeddon'], turn: 2 }, { m: ['Dancing Elf'] }] });
  goBP(g); attack(g, on(g, 0, 'Hydrogeddon'), on(g, 1, 'Dancing Elf')); auto(g);
  ok(cnt(g, 0, 'm', 'Hydrogeddon') === 2, '2 Hydrogeddons');
});
T('Hysteric Party', () => {
  const g = duel({ board: [{ st: ['Hysteric Party'], hand: [FILL, 'Mystical Space Typhoon'], gy: ['Harpie Lady', 'Harpie Lady 1'] }, {}] });
  act(g, 0, 'Hysteric Party'); choose(g, FILL); auto(g);
  ok(E.monsOf(g, 0).length === 2, '2 Harpies summoned');
  act(g, 0, 'Mystical Space Typhoon'); auto(g);
  ok(E.monsOf(g, 0).length === 0, 'they are destroyed when it leaves');
});

/* ----- I ----- */
T('Ice Master', () => {
  const g = duel({ board: [{ hand: ['Ice Master'], m: ['Mad Lobster', 'Mad Lobster'] }, { m: [FILL] }] });
  choose(g, 'sp:'); auto(g); ok(!!on(g, 0, 'Ice Master'), 'summoned by Tributing 2 WATERs');
  choose(g, 'Place an Ice Counter'); choose(g, 'u' + on(g, 1, FILL).u); auto(g);
  choose(g, 'Tribute: destroy'); auto(g);
  ok(E.monsOf(g, 1).length === 0 && inZ(g, 0, 'gy', 'Ice Master'), 'the monster with an Ice Counter destroyed');
});
T('Ice Queen adds a Spell', () => {
  const g = duel({ board: [{ m: ['Ice Queen'], hand: ['Dark Hole'], gy: ['Dark Magician', 'Skilled Dark Magician', 'Pot of Greed'] }, {}] });
  act(g, 0, 'Dark Hole'); auto(g); ok(inZ(g, 0, 'hand', 'Pot of Greed') || inZ(g, 0, 'hand', 'Dark Hole'), 'a Spell added');
  const h = duel({ board: [{ gy: ['Ice Queen'], hand: ['Monster Reborn'] }, {}] });
  ok(!hasOpt(h, 'a:' + cardOf(h, 0, 'Monster Reborn').u) || (choose(h, 'a:' + cardOf(h, 0, 'Monster Reborn').u), auto(h), !on(h, 0, 'Ice Queen')), 'can\'t be Special Summoned from the GY');
});
T('Ido the Supreme Magical Force', () => {
  const g = duel({ board: [{ m: ['Ido the Supreme Magical Force'], hand: ['Dark Hole', FILL] }, {}] });
  ok(!hasOpt(g, 'ns:' + cardOf(g, 0, FILL).u), 'can\'t summon while Ido is face-up');
  act(g, 0, 'Dark Hole'); auto(g); ns(g, 0, FILL); auto(g); endTurn(g);
  ok(!!on(g, 0, 'Ido the Supreme Magical Force') && !on(g, 0, FILL), 'Ido came back and destroyed the other monster');
});
T('Il Blud', () => {
  const g = duel({ board: [{ m: ['Il Blud'], st: ['Compulsory Evacuation Device'], gy: ['Pyramid Turtle'] }, {}] });
  choose(g, 'gem:'); auto(g); choose(g, 'Special Summon a Zombie'); auto(g);
  ok(!!on(g, 0, 'Pyramid Turtle'), 'Pyramid Turtle summoned');
  act(g, 0, 'Compulsory Evacuation Device'); choose(g, 'Il Blud'); auto(g);
  ok(!on(g, 0, 'Pyramid Turtle'), 'Pyramid Turtle destroyed when Il Blud left');
});
T('Immortal Ruler', () => {
  const g = duel({ board: [{ m: ['Immortal Ruler'], gy: ['Zombie World'] }, {}] });
  choose(g, 'Tribute: add Zombie World'); auto(g); ok(inZ(g, 0, 'hand', 'Zombie World'), 'Zombie World added');
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].gy.find(x => E.name(x) === 'Immortal Ruler'), p: 0, how: 'special' }), 'can\'t be Special Summoned');
});
T('Imprisoned Queen Archfiend', () => {
  const g = duel({ board: [{ m: ['Imprisoned Queen Archfiend'] }, {}] });
  ok(g.p[0].lp === 7000, 'paid 1000 in the first Standby Phase'); endTurn(g); endTurn(g); ok(g.p[0].lp === 6000, 'and again in the next one');
  const h = duel({ board: [{ gy: ['Imprisoned Queen Archfiend'], hand: ['Pandemonium'], m: ['Night Assailant'] }, {}] });
  act(h, 0, 'Pandemonium'); auto(h); endTurn(h); endTurn(h);
  ok(E.atk(h, on(h, 0, 'Night Assailant')) === 1200, 'Night Assailant gained 1000');
});

console.log(fails ? `\n${fails} check(s) failed.` : '\nAll checks passed.');
process.exit(fails ? 1 : 0);
