// Scenario checks for full pool batch 29: node build/test_full-29.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
// answer the prompts until the turn player's idle prompt: pass windows, say yes to triggers, take the first option of picks
const settle = (g, upto = 40) => { for (let i = 0; i < upto && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['y']); else E.act(g, pr.opts.slice(0, Math.max(1, pr.min)).map(o => o.key)); } };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const ns = (g, p, n) => choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u);
const setM = (g, p, n) => choose(g, 'set:' + g.p[p].hand.find(c => E.name(c) === n).u);
const endTurn = g => { E.act(g, ['end']); settle(g); };
const toBP = g => { choose(g, 'bp'); settle(g); };
const attack = (g, a, t) => { choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); };
const pickName = (g, n) => { const pr = g.prompt; const o = pr.opts.find(x => x.label === n || (x.u != null && x.label.includes(n))); if (!o) throw new Error(`no ${n} in ${pr.text}: ${pr.opts.map(x => x.label).join(', ')}`); E.act(g, [o.key]); };
const untilYN = g => { for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'yesno'; i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else break; } };
const forbidSS = (g, p, c) => E.lib.forbid(g, { type: 'ss', c, p, how: 'special' });

/* ----- Watapon to Zombyra ----- */
T('Watapon: a normal draw does nothing, a draw by Pot of Greed lets it Special Summon itself', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], deckTop: [FILL, 'Watapon', 'Watapon'], turn: 2 }, {}] });
  ok(g.prompt.type === 'idle' && !on(g, 0, 'Watapon'), 'no prompt from the Draw Phase draw');
  act(g, 0, 'Pot of Greed'); passAll(g);
  ok(g.prompt.type === 'yesno', 'asked to Special Summon Watapon'); settle(g);
  ok(on(g, 0, 'Watapon'), 'Watapon Special Summoned');
});
T('Wave-Motion Cannon: 1000 damage per Standby Phase, sending it is a cost', () => {
  const g = duel({ board: [{ hand: ['Wave-Motion Cannon'], turn: 2 }, {}] });
  act(g, 0, 'Wave-Motion Cannon'); settle(g); endTurn(g); endTurn(g); endTurn(g); endTurn(g);
  const wc = g.p[0].st.find(c => c && E.name(c) === 'Wave-Motion Cannon');
  ok(E.lib.ctr(wc, 'wave') === 2, 'counted 2 Standby Phases');
  act(g, 0, 'Wave-Motion Cannon'); settle(g);
  ok(g.p[1].lp === 6000 && inZ(g, 0, 'gy', 'Wave-Motion Cannon'), `2000 damage (B ${g.p[1].lp})`);
});
T('Weapon Change: pay 700 in the Standby Phase, switch ATK and DEF until the end of the opponent\'s next turn', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Clayman'], st: [{ n: 'Weapon Change', pos: 'up' }], turn: 2 }, {}] });
  ok(g.prompt.type === 'yesno', 'offered in the Standby Phase'); settle(g);
  const cl = on(g, 0, 'Elemental HERO Clayman');
  ok(E.atk(g, cl) === 2000 && E.def(g, cl) === 800 && g.p[0].lp === 7300, `Clayman is 2000/800, 700 paid (${E.atk(g, cl)}/${E.def(g, cl)})`);
  endTurn(g); ok(E.atk(g, cl) === 2000, 'still switched in the opponent\'s turn'); E.act(g, ['end']);
  untilYN(g); choose(g, 'no'); settle(g);
  ok(E.atk(g, cl) === 800, 'back to 800 ATK after that turn');
});
T('Weather Report: destroys Swords of Revealing Light, then two attacks', () => {
  const g = duel({ board: [{ m: [{ n: 'Weather Report', pos: 'set' }, FILL], turn: 2 }, { st: [{ n: 'Swords of Revealing Light', pos: 'up' }] }] });
  choose(g, 'flip:'); settle(g);
  ok(inZ(g, 1, 'gy', 'Swords of Revealing Light'), 'Swords destroyed');
  toBP(g); const w = on(g, 0, FILL); attack(g, w, null); settle(g);
  ok(hasOpt(g, `atk:${w.u}:d`), 'Warwolf can attack again'); attack(g, w, null); settle(g);
  ok(g.p[1].lp === 4000, `two direct attacks (B ${g.p[1].lp})`);
});
T('Whirlwind Prodigy: a WIND Level 7 with 1 Tribute', () => {
  const g = duel({ board: [{ hand: ["Harpie's Pet Dragon"], m: ['Whirlwind Prodigy'], turn: 2 }, {}] });
  ok(hasOpt(g, 'ns:'), 'Tribute Summon offered with one monster'); ns(g, 0, "Harpie's Pet Dragon"); settle(g);
  ok(on(g, 0, "Harpie's Pet Dragon") && inZ(g, 0, 'gy', 'Whirlwind Prodigy'), 'summoned by Tributing Prodigy');
});
T('Widespread Ruin destroys the highest ATK Attack Position monster', () => {
  const g = duel({ board: [{ m: [FILL, 'Elemental HERO Clayman'], turn: 2 }, { st: ['Widespread Ruin'] }] });
  toBP(g); attack(g, on(g, 0, 'Elemental HERO Clayman'), null);
  choose(g, 'Widespread Ruin', 1); settle(g);
  ok(inZ(g, 0, 'gy', FILL) && on(g, 0, 'Elemental HERO Clayman'), 'Warwolf (2000) destroyed, Clayman stays');
});
T('Wild Nature\'s Release: +DEF to ATK, destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: ["Wild Nature's Release"], m: [FILL], turn: 2 }, {}] });
  act(g, 0, "Wild Nature's Release"); settle(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2100, 'Warwolf 2100 ATK'); endTurn(g);
  ok(inZ(g, 0, 'gy', FILL), 'destroyed in the End Phase');
});
T('Windstorm of Etaqua and Zero Gravity change positions', () => {
  const g = duel({ board: [{ hand: ['Zero Gravity'], m: [FILL], st: ['Windstorm of Etaqua'], turn: 2 }, { m: ['Elemental HERO Clayman', { n: FILL, pos: 'def' }] }] });
  act(g, 0, 'Windstorm of Etaqua'); settle(g);
  ok(on(g, 1, 'Elemental HERO Clayman').pos === 'def' && on(g, 1, FILL).pos === 'atk' && on(g, 0, FILL).pos === 'atk', 'only the opponent\'s monsters changed');
  choose(g, 'setst:'); endTurn(g); endTurn(g);
  act(g, 0, 'Zero Gravity'); settle(g);
  ok(on(g, 1, 'Elemental HERO Clayman').pos === 'atk' && on(g, 0, FILL).pos === 'def', 'every face-up monster changed');
});
T('Witch\'s Apprentice, Wodan, Yami and Yellow Luster Shield stats', () => {
  const g = duel({ board: [{ m: ["Witch's Apprentice", 'Wodan the Resident of the Forest', 'Bean Soldier', 'Neo the Magic Swordsman'], st: [{ n: 'Yellow Luster Shield', pos: 'up' }], hand: ['Yami'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, "Witch's Apprentice")) === 1050 && E.atk(g, on(g, 0, 'Neo the Magic Swordsman')) === 1300, 'DARK +500, LIGHT -400');
  ok(E.atk(g, on(g, 0, 'Wodan the Resident of the Forest')) === 1000, 'Wodan +100 for a Plant');
  ok(E.def(g, on(g, 0, 'Bean Soldier')) === 1600, 'Yellow Luster Shield +300 DEF');
  act(g, 0, 'Yami'); settle(g);
  ok(E.atk(g, on(g, 0, 'Neo the Magic Swordsman')) === 1500, 'Yami +200 to a Spellcaster');
});
T('Woodland Sprite: send an Equip Card for 500 damage', () => {
  const g = duel({ board: [{ hand: ['United We Stand'], m: ['Woodland Sprite'], turn: 2 }, {}] });
  act(g, 0, 'United We Stand'); settle(g); act(g, 0, 'Woodland Sprite'); settle(g);
  ok(g.p[1].lp === 7500 && inZ(g, 0, 'gy', 'United We Stand') && on(g, 0, 'Woodland Sprite'), `500 damage, United We Stand sent (B ${g.p[1].lp})`);
});
T('World Suppression negates a Field Spell activation', () => {
  const g = duel({ board: [{ hand: ['Yami'], m: ['Neo the Magic Swordsman'], turn: 2 }, { st: ['World Suppression'] }] });
  act(g, 0, 'Yami'); choose(g, 'World Suppression', 1); settle(g);
  ok(g.log.some(l => /Yami is negated/.test(l)), 'Yami negated this turn');
});
T('Wynn the Wind Charmer takes a WIND monster while face-up', () => {
  const g = duel({ board: [{ m: [{ n: 'Wynn the Wind Charmer', pos: 'set' }], hand: ['Book of Moon'], turn: 2 }, { m: ['Baby Dragon'] }] });
  choose(g, 'flip:'); settle(g);
  ok(on(g, 0, 'Baby Dragon'), 'took Baby Dragon');
  act(g, 0, 'Book of Moon'); settle(g);
  ok(on(g, 1, 'Baby Dragon'), 'Baby Dragon went back when Wynn was turned face-down');
});
T('Xing Zhen Hu locks 2 Set cards', () => {
  const g = duel({ board: [{ st: ['Xing Zhen Hu'], turn: 2 }, { st: ['Book of Moon', 'Mystical Space Typhoon'] }] });
  act(g, 0, 'Xing Zhen Hu'); settle(g);
  const bm = g.p[1].st.find(c => c && E.name(c) === 'Book of Moon');
  ok(E.lib.forbid(g, { type: 'activate', c: bm, eff: {}, p: 1 }), 'Book of Moon can\'t be activated');
});
T('XYZ Fusions: by banishing the pieces, never by Polymerization or from the GY', () => {
  const g = duel({ ex0: ['XYZ-Dragon Cannon', 'XY-Dragon Cannon'], board: [{ hand: ['Polymerization', FILL], m: ['X-Head Cannon', { n: 'Y-Dragon Head', pos: 'set' }, 'Z-Metal Tank'], turn: 2 }, { st: ['Book of Moon'], m: [FILL] }] });
  ok(!hasOpt(g, 'a:' + g.p[0].hand.find(c => E.name(c) === 'Polymerization').u + ':'), 'Polymerization can\'t make them');
  choose(g, 'banish X-Head Cannon + Y-Dragon Head + Z-Metal Tank'); settle(g);
  const x = on(g, 0, 'XYZ-Dragon Cannon');
  ok(x && cnt(g, 0, 'ban', 'X-Head Cannon') === 1 && inZ(g, 0, 'ban', 'Y-Dragon Head'), 'XYZ summoned, a face-down piece banished too');
  act(g, 0, 'XYZ-Dragon Cannon'); pickName(g, FILL); settle(g);
  ok(inZ(g, 1, 'gy', 'Face-down card') || g.p[1].gy.some(c => E.name(c) === 'Book of Moon') || g.p[1].gy.some(c => E.name(c) === FILL), 'a card destroyed after a discard');
  ok(hasOpt(g, 'Discard: destroy'), 'can use it again the same turn');
  const xy = g.p[0].extra.find(c => E.name(c) === 'XY-Dragon Cannon');
  ok(forbidSS(g, 0, xy), 'XY-Dragon Cannon can\'t be Special Summoned from the Extra Deck by an effect');
});
T('Y-Dragon Head: Union on X-Head Cannon, +400, destroyed instead', () => {
  const g = duel({ board: [{ m: ['X-Head Cannon', 'Y-Dragon Head'], turn: 2 }, { m: [{ n: 'Gogiga Gagagigo' }] }] });
  act(g, 0, 'Y-Dragon Head'); settle(g);
  const xh = on(g, 0, 'X-Head Cannon');
  ok(E.atk(g, xh) === 2200 && inZ(g, 0, 'st', 'Y-Dragon Head'), 'X-Head Cannon 2200 ATK with Y equipped');
  toBP(g); attack(g, xh, on(g, 1, 'Gogiga Gagagigo')); settle(g);
  ok(on(g, 0, 'X-Head Cannon') && inZ(g, 0, 'gy', 'Y-Dragon Head'), 'Y destroyed instead of X');
});
T('Yado Karu: Attack to Defense puts hand cards on the bottom', () => {
  const g = duel({ board: [{ m: ['Yado Karu'], hand: ['Pot of Greed', 'Book of Moon'], turn: 2 }, {}] });
  const h0 = g.p[0].hand.length;
  choose(g, 'pos:'); ok(g.prompt.type === 'yesno', 'asked'); choose(g, 'yes'); passAll(g);
  choose(g, 'Pot of Greed'); choose(g, 'Stop'); settle(g);
  ok(g.p[0].hand.length === h0 - 1 && E.name(g.p[0].deck[0]) === 'Pot of Greed', 'Pot of Greed is the bottom card');
});
T('Yamata Dragon: draw to 5 on battle damage, back to the hand, never Special Summoned', () => {
  const g = duel({ board: [{ hand: ['Yamata Dragon'], m: [FILL, 'Elemental HERO Clayman'], turn: 2 }, {}] });
  ns(g, 0, 'Yamata Dragon'); settle(g);
  toBP(g); attack(g, on(g, 0, 'Yamata Dragon'), null); settle(g);
  ok(g.p[0].hand.length === 5, `hand is 5 (${g.p[0].hand.length})`);
  E.act(g, ['endbp']); settle(g); E.act(g, ['end']); settle(g);
  ok(inZ(g, 0, 'hand', 'Yamata Dragon'), 'returned to the hand in the End Phase');
  const y = g.p[0].hand.find(c => E.name(c) === 'Yamata Dragon'); ok(forbidSS(g, 0, y), 'can\'t be Special Summoned');
});
T('Yata-Garasu: the opponent skips their next Draw Phase; returns to the hand', () => {
  const g = duel({ board: [{ hand: ['Yata-Garasu'], turn: 2 }, {}] });
  ns(g, 0, 'Yata-Garasu'); settle(g); toBP(g); attack(g, on(g, 0, 'Yata-Garasu'), null); settle(g);
  E.act(g, ['endbp']); settle(g); const h1 = g.p[1].hand.length; E.act(g, ['end']); settle(g);
  ok(inZ(g, 0, 'hand', 'Yata-Garasu') && g.p[1].lp === 7800, 'Yata back in the hand after 200 damage');
  ok(g.p[1].hand.length === h1, `B drew no card (${h1} -> ${g.p[1].hand.length})`);
  const y = g.p[0].hand.find(c => E.name(c) === 'Yata-Garasu'); ok(forbidSS(g, 0, y), 'can\'t be Special Summoned');
});
T('Yomi Ship destroys the monster that destroyed it', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Yomi Ship'] }] });
  toBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Yomi Ship')); settle(g);
  ok(inZ(g, 1, 'gy', 'Yomi Ship') && inZ(g, 0, 'gy', FILL), 'both destroyed');
});
T('Zaborg destroys a monster when Tribute Summoned', () => {
  const g = duel({ board: [{ hand: ['Zaborg the Thunder Monarch'], m: ['Zolga'], turn: 2 }, { m: ['Gogiga Gagagigo'] }] });
  ns(g, 0, 'Zaborg the Thunder Monarch'); for (let i = 0; i < 10 && g.prompt.type !== 'pick'; i++) settle(g, 1); pickName(g, 'Gogiga Gagagigo'); settle(g);
  ok(inZ(g, 1, 'gy', 'Gogiga Gagagigo'), 'Gogiga destroyed');
  ok(g.p[0].lp === 10000, `Zolga gave 2000 LP (${g.p[0].lp})`);
});
T('Zombie Tiger: Union on Decayed Commander; random discard on a battle kill', () => {
  const g = duel({ board: [{ m: ['Decayed Commander', 'Zombie Tiger'], turn: 2 }, { m: ['Gigobyte'], hand: ['Pot of Greed', 'Book of Moon'] }] });
  act(g, 0, 'Zombie Tiger'); settle(g); const dc = on(g, 0, 'Decayed Commander');
  ok(E.atk(g, dc) === 1500, 'Decayed Commander 1500 ATK');
  const h = g.p[1].hand.length; toBP(g); attack(g, dc, on(g, 1, 'Gigobyte')); settle(g);
  ok(g.p[1].hand.length === h - 1, 'B discarded 1 card');
});
T('Zombyra the Dark: no direct attack, loses 200 ATK per kill', () => {
  const g = duel({ board: [{ m: ['Zombyra the Dark'], turn: 2 }, { m: ['Gigobyte'] }] });
  toBP(g); const z = on(g, 0, 'Zombyra the Dark'); ok(!hasOpt(g, `atk:${z.u}:d`), 'no direct attack offered');
  attack(g, z, on(g, 1, 'Gigobyte')); settle(g);
  ok(E.atk(g, z) === 1900 && !hasOpt(g, `atk:${z.u}:d`), 'lost 200 ATK, still no direct attack');
});

/* ----- Aliens ----- */
T('Alien Brain takes the attacker when a Reptile is destroyed', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Gigobyte'], st: ['Alien Brain'] }] });
  toBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Gigobyte'));
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno' && g.prompt.p === 1) choose(g, 'yes'); else settle(g, 1); }
  ok(on(g, 1, FILL), 'B controls Warwolf');
});
T('Alien Dog follows an Alien Normal Summon and places 2 A-Counters', () => {
  const g = duel({ board: [{ hand: ['Alien Dog', 'Alien Shocktrooper'], turn: 2 }, { m: ['Gigobyte'] }] });
  ns(g, 0, 'Alien Shocktrooper'); settle(g);
  ok(on(g, 0, 'Alien Dog') && E.lib.ctr(on(g, 1, 'Gigobyte'), 'A') === 2, 'Alien Dog summoned, 2 A-Counters placed');
});
T('Alien Grey: FLIP A-Counter, -300 in battle with an Alien, draw when destroyed', () => {
  const g = duel({ board: [{ m: [{ n: 'Alien Grey', pos: 'set' }, 'Alien Shocktrooper'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'flip:'); settle(g);
  const w = on(g, 1, FILL); ok(E.lib.ctr(w, 'A') === 1, 'A-Counter on Warwolf');
  toBP(g); attack(g, on(g, 0, 'Alien Shocktrooper'), w); settle(g);
  ok(inZ(g, 1, 'gy', FILL), 'Warwolf (2000-300) lost to Shocktrooper (1900)');
  const h = g.p[0].hand.length; attack(g, on(g, 0, 'Alien Grey'), null); settle(g); E.act(g, ['endbp']); settle(g); E.act(g, ['end']); settle(g);
  // B's turn: B attacks Alien Grey
  const g2 = duel({ board: [{ m: [{ n: 'Alien Grey', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g2, 'flip:'); settle(g2); endTurn(g2); const h2 = g2.p[0].hand.length;
  toBP(g2); attack(g2, on(g2, 1, FILL), on(g2, 0, 'Alien Grey')); settle(g2);
  ok(g2.p[0].hand.length === h2 + 1, 'A drew 1 card when Alien Grey was destroyed');
  void h;
});
T('Alien Hunter attacks again after destroying a monster with an A-Counter', () => {
  const g = duel({ board: [{ m: ['Alien Hunter'], turn: 2 }, { m: ['Gigobyte', 'Drooling Lizard'] }] });
  E.lib.addCtr(g, on(g, 1, 'Gigobyte'), 'A', 1);
  toBP(g); const h = on(g, 0, 'Alien Hunter'); attack(g, h, on(g, 1, 'Gigobyte')); settle(g);
  ok(hasOpt(g, `atk:${h.u}:`), 'can attack again'); attack(g, h, on(g, 1, 'Drooling Lizard')); settle(g);
  ok(!hasOpt(g, `atk:${h.u}:`), 'no third attack (that monster had no A-Counter)');
});
T('Alien Hypno takes an A-Counter monster, removes a counter each End Phase', () => {
  const g = duel({ board: [{ m: ['Alien Hypno'], turn: 2 }, { m: [FILL] }] });
  E.lib.addCtr(g, on(g, 1, FILL), 'A', 1);
  choose(g, 'gem:'); settle(g); act(g, 0, 'Alien Hypno'); settle(g);
  ok(on(g, 0, FILL), 'took Warwolf'); E.act(g, ['end']); settle(g);
  ok(inZ(g, 1, 'gy', FILL), 'Warwolf destroyed when its last A-Counter was removed');
});
T('Alien Infiltrator moves and attacks directly through an empty column', () => {
  const g = duel({ board: [{ m: ['Alien Infiltrator'], turn: 2 }, { m: [null, null, null, null, FILL] }] });
  const a = on(g, 0, 'Alien Infiltrator'); ok(!E.lib.has(g, a, 'directAttack'), 'column 0 faces the Warwolf');
  act(g, 0, 'Alien Infiltrator'); settle(g);
  ok(g.p[0].m[1] === a && E.lib.has(g, a, 'directAttack'), 'moved right, can attack directly');
});
T('Alien Kid, Alien Mars, Alien Psychic', () => {
  const g = duel({ board: [{ m: ['Alien Kid', 'Alien Mars', 'Alien Psychic'], turn: 2 }, { hand: ['Monster Reborn'], gy: ['Neo the Magic Swordsman'] }] });
  endTurn(g); act(g, 1, 'Monster Reborn'); settle(g);
  const n = on(g, 1, 'Neo the Magic Swordsman'); ok(n && E.lib.ctr(n, 'A') === 1, 'A-Counter on the Special Summoned monster');
  ok(E.lib.negd(g, n), 'its effects are negated by Alien Mars');
  ok(E.lib.forbid(g, { type: 'attack', c: n }), 'it can\'t attack (Alien Psychic)');
  const g2 = duel({ board: [{ hand: ['Alien Psychic'], turn: 2 }, {}] }); ns(g2, 0, 'Alien Psychic'); settle(g2);
  ok(on(g2, 0, 'Alien Psychic').pos === 'def', 'Alien Psychic changes itself to Defense Position');
});
T('Alien Mother revives the A-Counter monster it destroyed', () => {
  const g = duel({ board: [{ m: ['Alien Mother'], turn: 2 }, { m: [FILL] }] });
  E.lib.addCtr(g, on(g, 1, FILL), 'A', 1);
  toBP(g); attack(g, on(g, 0, 'Alien Mother'), on(g, 1, FILL)); settle(g); E.act(g, ['endbp']); settle(g);
  ok(on(g, 0, FILL), 'Warwolf Special Summoned to A\'s field');
});
T('Alien Overlord: Special Summon by removing 2 A-Counters; counters on every face-up monster', () => {
  const g = duel({ board: [{ hand: ['Alien Overlord', 'Pot of Greed'], turn: 2 }, { m: [FILL, 'Gigobyte'] }] });
  E.lib.addCtr(g, on(g, 1, FILL), 'A', 2); act(g, 0, 'Pot of Greed'); settle(g);
  choose(g, 'remove 2 A-Counters'); settle(g);
  ok(on(g, 0, 'Alien Overlord') && E.lib.ctr(on(g, 1, FILL), 'A') === 0, 'summoned, 2 counters removed');
  act(g, 0, 'Alien Overlord'); settle(g);
  ok(E.lib.ctr(on(g, 1, FILL), 'A') === 1 && E.lib.ctr(on(g, 1, 'Gigobyte'), 'A') === 1, 'each face-up monster got 1');
});
T('Alien Skull goes to the opponent\'s field with an A-Counter; no Normal Summon after', () => {
  const g = duel({ board: [{ hand: ['Alien Skull', FILL], turn: 2 }, { m: ['Gigobyte'] }] });
  choose(g, 'Tribute their Level 3'); settle(g);
  const s = on(g, 1, 'Alien Skull'); ok(s && E.lib.ctr(s, 'A') === 1 && inZ(g, 1, 'gy', 'Gigobyte'), 'Alien Skull on B\'s field with an A-Counter');
  ok(!hasOpt(g, 'ns:') && !hasOpt(g, 'set:'), 'A can\'t Normal Summon or Set this turn');
});

/* ----- Allure Queens ----- */
T('Allure Queen LV3 equips a monster, survives battle, becomes LV5', () => {
  const g = duel({ board: [{ m: ['Allure Queen LV3'], turn: 2 }, { m: ['Gigobyte', FILL] }] });
  act(g, 0, 'Allure Queen LV3'); settle(g);
  ok(inZ(g, 0, 'st', 'Gigobyte'), 'Gigobyte equipped');
  endTurn(g); toBP(g); attack(g, on(g, 1, FILL), on(g, 0, 'Allure Queen LV3')); settle(g); E.act(g, ['endbp']); settle(g);
  ok(on(g, 0, 'Allure Queen LV3') && inZ(g, 1, 'gy', 'Gigobyte'), 'Gigobyte destroyed instead');
  const g2 = duel({ board: [{ m: ['Allure Queen LV3'], turn: 2, deckTop: ['Allure Queen LV5', FILL] }, { m: ['Gigobyte', 'Drooling Lizard'] }] });
  act(g2, 0, 'Allure Queen LV3'); settle(g2); endTurn(g2); E.act(g2, ['end']); untilYN(g2);
  ok(g2.prompt.type === 'yesno', 'offered in the Standby Phase'); settle(g2);
  const q5 = on(g2, 0, 'Allure Queen LV5'); ok(q5 && inZ(g2, 0, 'gy', 'Allure Queen LV3'), 'LV5 Special Summoned');
  ok(hasOpt(g2, 'a:' + q5.u + ':'), 'LV5 can use its equip effect');
});

/* ----- Arcana Force ----- */
const arcSet = (g, c, side) => { c.flags.arc = side; g.seq++; };
T('Arcana Force: a coin on every summon; Emperor, Chariot, Fool, Temperance effects', () => {
  const g = duel({ board: [{ hand: ['Arcana Force IV - The Emperor'], m: ['Arcana Force VII - The Chariot'], turn: 2 }, {}] });
  ns(g, 0, 'Arcana Force IV - The Emperor'); settle(g);
  const em = on(g, 0, 'Arcana Force IV - The Emperor'); ok(['H', 'T'].includes(em.flags.arc), 'coin tossed on summon');
  arcSet(g, em, 'H'); const ch = on(g, 0, 'Arcana Force VII - The Chariot');
  ok(E.atk(g, ch) === 2200 && E.atk(g, em) === 1900, 'heads: Arcana Force monsters +500');
  arcSet(g, em, 'T'); ok(E.atk(g, ch) === 1200, 'tails: -500');
  const g2 = duel({ board: [{ hand: ['Arcana Force VII - The Chariot'], turn: 2 }, {}], seed: 3 });
  ns(g2, 0, 'Arcana Force VII - The Chariot'); settle(g2);
  const c2 = g2.p[0].m.concat(g2.p[1].m).find(c => c && E.name(c) === 'Arcana Force VII - The Chariot');
  ok(c2.flags.arc === 'T' ? c2.ctrl === 1 : c2.ctrl === 0, `Chariot ${c2.flags.arc}: control ${c2.ctrl}`);
  const g3 = duel({ board: [{ m: ['Arcana Force 0 - The Fool'], turn: 2 }, { m: [FILL] }] });
  const f = on(g3, 0, 'Arcana Force 0 - The Fool'); ok(!hasOpt(g3, 'pos:' + f.u), 'The Fool can\'t change to Defense');
  endTurn(g3); toBP(g3); attack(g3, on(g3, 1, FILL), f); settle(g3);
  ok(on(g3, 0, 'Arcana Force 0 - The Fool') && g3.p[0].lp === 6000, 'not destroyed by battle, 2000 damage');
  const g4 = duel({ board: [{ m: [FILL], turn: 2 }, { hand: ['Arcana Force XIV - Temperance'] }] });
  toBP(g4); attack(g4, on(g4, 0, FILL), null);
  for (let i = 0; i < 12 && g4.prompt && g4.prompt.type === 'respond'; i++) { if (g4.prompt.p === 1 && hasOpt(g4, 'no battle damage')) choose(g4, 'no battle damage'); else E.act(g4, ['pass']); }
  settle(g4);
  ok(g4.p[1].lp === 8000 && inZ(g4, 1, 'gy', 'Arcana Force XIV - Temperance'), `Temperance discarded, no damage (B ${g4.p[1].lp})`);
});
T('Arcana Force EX - The Dark Ruler: summoned by sending 3; heads attacks twice; tails wipes the field', () => {
  const g = duel({ board: [{ hand: ['Arcana Force EX - The Dark Ruler'], m: [FILL, 'Gigobyte', 'Drooling Lizard'], turn: 2 }, { m: ['Elemental HERO Clayman'], st: ['Book of Moon'] }] });
  choose(g, 'send 3 monsters'); settle(g);
  const d = on(g, 0, 'Arcana Force EX - The Dark Ruler'); ok(d && g.p[0].gy.length === 3, 'summoned by sending 3');
  arcSet(g, d, 'H'); toBP(g); attack(g, d, on(g, 1, 'Elemental HERO Clayman')); settle(g);
  ok(hasOpt(g, `atk:${d.u}:d`), 'heads: a second attack'); attack(g, d, null); settle(g); E.act(g, ['endbp']); settle(g);
  ok(d.pos === 'def', 'changed to Defense at the end of the Battle Phase');
  ok(!hasOpt(g, 'pos:' + d.u), 'position locked');
  const gy = g.p[0].gy.find(c => E.name(c) === FILL); ok(forbidSS(g, 0, { ...d, zone: 'gy' }), 'can\'t be Special Summoned from the GY');
  arcSet(g, d, 'T'); E.lib.destroy(g, [d], { by: 1 });
  ok(!g.p[1].st.some(Boolean), 'tails: destroyed, so every card on the field is destroyed');
  void gy;
});
T('Arcana Call swaps in another Arcana Force effect', () => {
  const g = duel({ board: [{ m: ['Arcana Force I - The Magician', 'Arcana Force VII - The Chariot'], st: ['Arcana Call'], gy: ['Arcana Force IV - The Emperor'], turn: 2 }, {}] });
  const m = on(g, 0, 'Arcana Force I - The Magician'), ch = on(g, 0, 'Arcana Force VII - The Chariot'); arcSet(g, m, 'H'); arcSet(g, ch, 'H');
  act(g, 0, 'Arcana Call'); pickName(g, 'Arcana Force I - The Magician'); settle(g);
  ok(inZ(g, 0, 'ban', 'Arcana Force IV - The Emperor') && E.atk(g, ch) === 2200, 'Magician now has the Emperor\'s heads (+500)');
});
T('Arcana Force I - The Magician: heads doubles its ATK when a Spell resolves', () => {
  const g = duel({ board: [{ m: ['Arcana Force I - The Magician'], hand: ['Pot of Greed'], turn: 2 }, {}] });
  const m = on(g, 0, 'Arcana Force I - The Magician'); arcSet(g, m, 'H');
  act(g, 0, 'Pot of Greed'); settle(g); ok(E.atk(g, m) === 2200, 'ATK 2200');
});
T('Arcana Knight Joker negates a targeting Spell by discarding a Spell', () => {
  const g = duel({ board: [{ m: ['Arcana Knight Joker'], hand: ['Pot of Greed'], turn: 2 }, { hand: ['Book of Moon'] }] });
  endTurn(g); act(g, 1, 'Book of Moon'); ok(hasOpt(g, 'negate the effect'), 'Joker offered'); choose(g, 'negate the effect', 0); settle(g);
  ok(on(g, 0, 'Arcana Knight Joker').pos === 'atk' && inZ(g, 0, 'gy', 'Pot of Greed'), 'Book of Moon negated, Pot of Greed discarded');
});

/* ----- Archfiends ----- */
T('Archfiend General: searches Pandemonium; destroyed without it', () => {
  const g = duel({ board: [{ hand: ['Archfiend General', 'Archfiend General'], deckTop: [FILL, 'Pandemonium'], turn: 2 }, {}] });
  act(g, 0, 'Archfiend General'); settle(g);
  ok(inZ(g, 0, 'hand', 'Pandemonium'), 'Pandemonium added');
  ns(g, 0, 'Archfiend General'); settle(g);
  ok(inZ(g, 0, 'gy', 'Archfiend General') && !on(g, 0, 'Archfiend General'), 'destroyed with no Pandemonium');
});
T('Archfiend of Gilfer equips from the GY for -500', () => {
  const g = duel({ board: [{ m: ['Archfiend of Gilfer'], turn: 1 }, { m: ['Gogiga Gagagigo'] }] });
  endTurn(g); toBP(g); attack(g, on(g, 1, 'Gogiga Gagagigo'), on(g, 0, 'Archfiend of Gilfer')); settle(g);
  ok(inZ(g, 0, 'st', 'Archfiend of Gilfer') && E.atk(g, on(g, 1, 'Gogiga Gagagigo')) === 2450, 'Gogiga 2450 ATK');
});
T('Archfiend Zombie-Skull: Plaguespreader + 2 Zombies; Zombies safe from effects', () => {
  const g = duel({ ex0: ['Archfiend Zombie-Skull'], board: [{ m: ['Plaguespreader Zombie', 'Clown Zombie', 'Pharaoh\'s Servant', 'Armored Zombie'], turn: 2 }, {}] });
  ok(hasOpt(g, 'Synchro Summon'), 'Synchro offered'); choose(g, 'Synchro Summon'); settle(g);
  const z = on(g, 0, 'Archfiend Zombie-Skull'); ok(!!z, 'summoned');
  const az = on(g, 0, 'Armored Zombie'); E.lib.destroy(g, [az], { by: 1 });
  ok(on(g, 0, 'Armored Zombie'), 'Armored Zombie not destroyed by an effect');
  const g2 = duel({ ex0: ['Archfiend Zombie-Skull'], board: [{ m: ['Plaguespreader Zombie', 'Armored Zombie', FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'Synchro Summon'), 'no Synchro with 1 Zombie non-Tuner');
});

console.log(fails ? `\n${fails} failed` : '\nAll passed');
process.exitCode = fails ? 1 : 0;
