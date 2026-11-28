// Scenario checks for full pool batch 46: node build/test_full-46.js
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
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
// answer the prompts until the turn player's idle prompt: pass windows, say yes to triggers, take the first option of picks
const settle = (g, upto = 40) => { for (let i = 0; i < upto && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['y']); else E.act(g, pr.opts.slice(0, Math.max(1, pr.min)).map(o => o.key)); } };
// pass windows until a prompt that isn't a response window
const toNext = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const find = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + find(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const ns = (g, p, n) => choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u);
const setM = (g, p, n) => choose(g, 'set:' + g.p[p].hand.find(c => E.name(c) === n).u);
const endTurn = g => { E.act(g, ['end']); settle(g); };
const toBP = g => { choose(g, 'bp'); settle(g); };
const attack = (g, a, t) => { choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); };
const pk = (g, ...cs) => E.act(g, cs.map(c => 'u' + c.u));
const pickName = (g, n) => { const pr = g.prompt; const o = pr.opts.find(x => x.label === n || (x.u != null && x.label.includes(n))); if (!o) throw new Error(`no ${n} in ${pr.type} ${pr.text}: ${pr.opts.map(x => x.label).join(', ')}`); E.act(g, [o.key]); };
const forbidSS = (g, p, c) => E.lib.forbid(g, { type: 'ss', c, p, how: 'special' });
const pt = g => g.prompt ? `${g.prompt.p}:${g.prompt.type}:${g.prompt.text}` : 'none';

/* ----- V ----- */
T('Van\'Dalgyon: a Counter Trap negates a Spell, it Special Summons itself and deals 1500', () => {
  const g = duel({ first: 1, board: [{ hand: ['Van\'Dalgyon the Dark Dragon Lord'], st: ['Solemn Judgment'], turn: 2 }, { hand: ['Pot of Greed'] }] });
  act(g, 1, 'Pot of Greed');
  ok(g.prompt.p === 0 && g.prompt.type === 'respond', 'A can respond to Pot of Greed'); act(g, 0, 'Solemn Judgment'); toNext(g);
  ok(g.prompt.type === 'yesno' && g.prompt.p === 0, `asked to Special Summon Van'Dalgyon (${pt(g)})`); E.act(g, ['y']); settle(g);
  ok(on(g, 0, 'Van\'Dalgyon the Dark Dragon Lord') && g.p[1].lp === 6500, `summoned, B at ${g.p[1].lp}`);
});
T('Vanguard of the Dragon: send a Dragon for +300, revives a Dragon Normal Monster after an opponent\'s effect', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon'], m: ['Vanguard of the Dragon'], turn: 2 }, { hand: ['Dark Hole'] }] });
  act(g, 0, 'Vanguard of the Dragon'); settle(g);
  ok(E.atk(g, on(g, 0, 'Vanguard of the Dragon')) === 2000 && inZ(g, 0, 'gy', 'Blue-Eyes White Dragon'), 'gained 300 ATK, Blue-Eyes sent');
  endTurn(g); act(g, 1, 'Dark Hole'); toNext(g);
  ok(g.prompt.type === 'yesno' && g.prompt.p === 0, `trigger offered (${pt(g)})`); E.act(g, ['y']); settle(g);
  ok(on(g, 0, 'Blue-Eyes White Dragon'), 'Blue-Eyes Special Summoned');
});
T('Vanity\'s Call: Chain Link 4 negates and destroys the other links', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: ['Waboku'], turn: 2 }, { st: ['Threatening Roar', 'Vanity\'s Call'] }] });
  const h0 = g.p[0].hand.length;
  act(g, 0, 'Pot of Greed'); act(g, 1, 'Threatening Roar'); act(g, 0, 'Waboku');
  ok(g.prompt.p === 1, 'B can respond at Chain Link 3'); act(g, 1, 'Vanity\'s Call'); settle(g);
  ok(g.p[1].lp === 4000 && g.p[0].hand.length === h0 - 1 && inZ(g, 0, 'gy', 'Waboku') && inZ(g, 1, 'gy', 'Threatening Roar'), `half LP paid, no draws (hand ${g.p[0].hand.length})`);
});
T('Vanity\'s Ruler: the opponent can\'t Special Summon, and it can\'t be Special Summoned', () => {
  const g = duel({ board: [{ m: ['Vanity\'s Ruler'], gy: ['Vanity\'s Ruler'], hand: ['Mystical Elf'], turn: 2 }, { hand: ['Mystical Elf'] }] });
  ok(forbidSS(g, 1, g.p[1].hand[0]) && !forbidSS(g, 0, g.p[0].hand[0]), 'only the opponent is stopped');
  ok(forbidSS(g, 0, g.p[0].gy[0]), 'Vanity\'s Ruler can\'t be Special Summoned');
});
T('Vanquishing Light: Tribute a Lightsworn to negate a Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Mystical Elf'], turn: 2 }, { m: ['Ryko, Lightsworn Hunter'], st: ['Vanquishing Light'] }] });
  ns(g, 0, 'Mystical Elf');
  ok(g.prompt.p === 1, `B gets the summon window (${pt(g)})`); act(g, 1, 'Vanquishing Light'); settle(g);
  ok(!on(g, 0, 'Mystical Elf') && inZ(g, 0, 'gy', 'Mystical Elf') && inZ(g, 1, 'gy', 'Ryko, Lightsworn Hunter'), 'summon negated and destroyed');
});
T('Variety Comes Out: return a Synchro, Special Summon Tuners of the same total Level', () => {
  const g = duel({ board: [{ hand: ['Variety Comes Out'], m: ['Black Rose Dragon'], gy: ['Junk Synchron', 'Debris Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Variety Comes Out'); settle(g);
  ok(on(g, 0, 'Junk Synchron') && on(g, 0, 'Debris Dragon') && inZ(g, 0, 'extra', 'Black Rose Dragon'), 'Junk Synchron and Debris Dragon summoned');
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].extra[0], p: 0, how: 'synchro' }), 'no Synchro Summons this turn');
});
T('Vehicroid Connection Zone: Fusion Summons a Vehicroid that can\'t be destroyed by card effects', () => {
  const g = duel({ ex0: ['Super Vehicroid Jumbo Drill'], board: [{ hand: ['Vehicroid Connection Zone', 'Steamroid', 'Drillroid', 'Submarineroid'], turn: 2 }, {}] });
  act(g, 0, 'Vehicroid Connection Zone'); settle(g);
  const f = on(g, 0, 'Super Vehicroid Jumbo Drill');
  ok(f && E.lib.has(g, f, 'noEffectDestroy'), 'summoned and protected');
});
T('Veil of Darkness: a drawn DARK monster is sent to the GY for a draw', () => {
  const g = duel({ board: [{ st: [{ n: 'Veil of Darkness', pos: 'up' }], deckTop: ['Dark Blade', 'Mystical Elf'], turn: 2 }, {}] });
  ok(g.prompt.type === 'yesno', `offered in the Draw Phase (${pt(g)})`); settle(g);
  ok(inZ(g, 0, 'gy', 'Dark Blade') && inZ(g, 0, 'hand', 'Mystical Elf'), 'Dark Blade sent, drew Mystical Elf');
});
T('Vennominaga: +500 per Reptile, survives Dark Hole, wins on the 3rd counter', () => {
  const g = duel({ board: [{ m: ['Vennominaga the Deity of Poisonous Snakes'], gy: ['Alien Shocktrooper', 'Armored Lizard'], turn: 2 }, { hand: ['Dark Hole'] }] });
  const v = on(g, 0, 'Vennominaga the Deity of Poisonous Snakes');
  ok(E.atk(g, v) === 1000, `1000 ATK (${E.atk(g, v)})`);
  E.lib.addCtr(g, v, 'venom', 2); toBP(g); attack(g, v, null); settle(g);
  ok(g.winner === 0, `A wins with the 3rd counter (${g.winner})`);
  const g2 = duel({ first: 1, board: [{ m: ['Vennominaga the Deity of Poisonous Snakes'], gy: ['Armored Lizard'], turn: 2 }, { hand: ['Dark Hole'] }] });
  act(g2, 1, 'Dark Hole'); settle(g2);
  ok(on(g2, 0, 'Vennominaga the Deity of Poisonous Snakes'), 'unaffected by Dark Hole');
  ok(forbidSS(g2, 0, g2.p[0].gy[0]) === false, 'other monsters unaffected by its lock');
});
T('Vennominon: destroyed by battle, banish a Reptile to come back', () => {
  const g = duel({ board: [{ m: ['Vennominon the King of Poisonous Snakes'], gy: ['Alien Shocktrooper', 'Armored Lizard'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  toBP(g); attack(g, on(g, 0, 'Vennominon the King of Poisonous Snakes'), on(g, 1, 'Blue-Eyes White Dragon')); toNext(g);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'yesno'; i++) E.act(g, ['pass']);
  ok(g.prompt.type === 'yesno', `revive offered (${pt(g)})`); settle(g);
  ok(on(g, 0, 'Vennominon the King of Poisonous Snakes') && g.p[0].ban.length === 1, 'back on the field, 1 Reptile banished');
});
T('Vicious Claw: returns to the hand instead, destroys a monster, 600 damage, Evil Token', () => {
  const g = duel({ board: [{ hand: ['Vicious Claw'], m: ['Gene-Warped Warwolf'], turn: 2 }, { m: ['Blue-Eyes White Dragon', 'Mystical Elf'] }] });
  const w = on(g, 0, 'Gene-Warped Warwolf');
  act(g, 0, 'Vicious Claw'); settle(g); ok(E.atk(g, w) === 2300, '2300 ATK');
  toBP(g); attack(g, w, on(g, 1, 'Blue-Eyes White Dragon'));
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'pick'; i++) { if (g.prompt.type === 'yesno') E.act(g, ['y']); else E.act(g, ['pass']); }
  ok(g.prompt && g.prompt.type === 'pick' && !g.prompt.opts.some(o => o.label === 'Blue-Eyes White Dragon'), `pick without Blue-Eyes (${pt(g)})`);
  pickName(g, 'Mystical Elf'); settle(g);
  ok(on(g, 0, 'Gene-Warped Warwolf') && inZ(g, 0, 'hand', 'Vicious Claw') && inZ(g, 1, 'gy', 'Mystical Elf'), 'Warwolf survived, Claw back in hand, Elf destroyed');
  ok(g.p[1].lp === 7400 && on(g, 1, 'Evil Token'), `600 damage and an Evil Token (B ${g.p[1].lp})`);
});
T('Victoria: revives a Dragon from their GY; other Fairies can\'t be attacked', () => {
  const g = duel({ board: [{ m: ['Victoria', 'Shining Angel'], turn: 2 }, { gy: ['Blue-Eyes White Dragon'] }] });
  ok(E.lib.has(g, on(g, 0, 'Shining Angel'), 'noAttackTarget') && !E.lib.has(g, on(g, 0, 'Victoria'), 'noAttackTarget'), 'Shining Angel can\'t be attacked, Victoria can');
  act(g, 0, 'Victoria'); settle(g);
  ok(on(g, 0, 'Blue-Eyes White Dragon'), 'Blue-Eyes Special Summoned to A\'s field');
});
T('Victory Dragon: can\'t be Special Summoned, needs 3 Tributes', () => {
  const g = duel({ board: [{ gy: ['Victory Dragon'], turn: 2 }, {}] });
  ok(forbidSS(g, 0, g.p[0].gy[0]), 'no Special Summon');
});
T('Victory Viper XX03: an Option Token with its stats, removed when Victory Viper leaves', () => {
  const g = duel({ board: [{ m: ['Victory Viper XX03'], hand: ['Mystical Space Typhoon'], turn: 2 }, { m: [{ n: 'Mokey Mokey', pos: 'atk' }], hand: ['Dark Hole'] }] });
  toBP(g); attack(g, on(g, 0, 'Victory Viper XX03'), on(g, 1, 'Mokey Mokey'));
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'choose'; i++) E.act(g, ['pass']);
  ok(g.prompt && g.prompt.type === 'choose', `asked for an effect (${pt(g)})`); choose(g, 'Option Token'); settle(g);
  const t = on(g, 0, 'Option Token');
  ok(t && E.atk(g, t) === 1200 && E.def(g, t) === 1000, `token is 1200/1000 (${t && E.atk(g, t)})`);
  E.act(g, ['endbp']); settle(g); endTurn(g); act(g, 1, 'Dark Hole'); settle(g);
  ok(!on(g, 0, 'Option Token'), 'token gone');
});
T('Violet Witch: destroyed by battle, adds a Plant with 1500 or less DEF', () => {
  const g = duel({ first: 1, board: [{ m: ['Violet Witch'], deckTop: ['Lonefire Blossom'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  toBP(g); attack(g, on(g, 1, 'Blue-Eyes White Dragon'), on(g, 0, 'Violet Witch')); settle(g);
  ok(inZ(g, 0, 'hand', 'Lonefire Blossom'), 'Lonefire Blossom added');
});
T('Viper\'s Rebirth: revives a non-Tuner when the GY is all Reptiles, destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Viper\'s Rebirth'], gy: ['Armored Lizard'], turn: 2 }, {}] });
  act(g, 0, 'Viper\'s Rebirth'); settle(g); ok(on(g, 0, 'Armored Lizard'), 'revived');
  E.act(g, ['end']); settle(g); ok(inZ(g, 0, 'gy', 'Armored Lizard'), 'destroyed in the End Phase');
});
T('Virus Cannon: 2 Tributes, the opponent sends 2 Spells from the Deck', () => {
  const g = duel({ first: 1, board: [{ m: ['Mystical Elf', 'Dark Blade'], st: ['Virus Cannon'], turn: 2 }, { deckTop: ['Pot of Greed', 'Dark Hole', 'Monster Reborn'] }] });
  E.act(g, ['end']); for (let i = 0; i < 20 && g.prompt && !(g.prompt.p === 0 && g.prompt.type === 'respond'); i++) E.act(g, g.prompt.type === 'yesno' ? ['y'] : ['pass']);
  act(g, 0, 'Virus Cannon');
  E.act(g, g.prompt.opts.map(o => o.key)); settle(g);
  ok(g.p[1].gy.filter(c => E.data(c).k === 'spell').length === 2 && g.p[0].gy.length >= 3, `2 Spells sent (${g.p[1].gy.map(E.name)})`);
});
T('Viser Des: its target is destroyed in its controller\'s 3rd Standby Phase; it can\'t be destroyed by battle until then', () => {
  const g = duel({ board: [{ hand: ['Viser Des'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ns(g, 0, 'Viser Des'); settle(g);
  const v = on(g, 0, 'Viser Des'); ok(E.lib.has(g, v, 'noBattleDestroy'), 'protected');
  for (let i = 0; i < 5; i++) endTurn(g);
  ok(on(g, 1, 'Blue-Eyes White Dragon'), 'still there after 2 Standby Phases');
  endTurn(g); ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'destroyed in the 3rd');
});
T('Voltanis: after a Counter Trap, Tribute all and destroy 1 card per Fairy', () => {
  const g = duel({ first: 1, board: [{ hand: ['Voltanis the Adjudicator'], m: ['Shining Angel', 'Mystical Elf'], st: ['Solemn Judgment'], turn: 2 }, { hand: ['Pot of Greed'], st: ['Waboku', 'Threatening Roar'] }] });
  act(g, 1, 'Pot of Greed'); act(g, 0, 'Solemn Judgment'); toNext(g);
  ok(g.prompt.type === 'yesno' && g.prompt.p === 0, `Voltanis offered (${pt(g)})`); E.act(g, ['y']);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'pick'; i++) E.act(g, g.prompt.type === 'yesno' ? ['y'] : ['pass']);
  ok(on(g, 0, 'Voltanis the Adjudicator') && inZ(g, 0, 'gy', 'Shining Angel') && inZ(g, 0, 'gy', 'Mystical Elf'), 'Voltanis summoned, both Tributed');
  ok(g.prompt && g.prompt.type === 'pick' && g.prompt.max === 1, `destroy up to 1 (${pt(g)})`); E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(g.p[1].st.filter(Boolean).length === 1, '1 card destroyed');
});
T('Voltic Kong: battle damage mills 1 per face-up LIGHT', () => {
  const g = duel({ board: [{ m: ['Voltic Kong', 'Mystical Elf'], turn: 2 }, {}] });
  const d = g.p[1].deck.length; toBP(g); attack(g, on(g, 0, 'Voltic Kong'), null); settle(g);
  ok(g.p[1].deck.length === d - 2, `2 cards milled (${d - g.p[1].deck.length})`);
});
T('Vortex Trooper: shuffle 2 and draw 2 on Normal Summon; draw 1 when destroyed', () => {
  const g = duel({ board: [{ hand: ['Vortex Trooper', 'Mystical Elf', 'Dark Blade'], turn: 2 }, { hand: ['Dark Hole'] }] });
  ns(g, 0, 'Vortex Trooper'); settle(g);
  ok(g.p[0].hand.length === 3 && !inZ(g, 0, 'hand', 'Mystical Elf'), `shuffled 2, drew 2 (${g.p[0].hand.map(E.name)})`);
  endTurn(g); const h = g.p[0].hand.length; act(g, 1, 'Dark Hole'); settle(g); ok(g.p[0].hand.length === h + 1, 'drew 1 when destroyed');
});
T('VW-Tiger Catapult and VWXYZ: contact Fusions; position change and banish', () => {
  const g = duel({ ex0: ['VW-Tiger Catapult', 'VWXYZ-Dragon Catapult Cannon'], board: [{ m: ['V-Tiger Jet', 'W-Wing Catapult', 'XYZ-Dragon Cannon'], hand: ['Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Waboku'] }] });
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].extra[0], p: 0, how: 'special' }), 'not by other effects from the Extra Deck');
  choose(g, 'sp:' + find(g, 0, 'VW-Tiger Catapult').u); settle(g);
  ok(on(g, 0, 'VW-Tiger Catapult') && g.p[0].ban.length === 2, 'VW-Tiger Catapult summoned');
  act(g, 0, 'VW-Tiger Catapult'); settle(g);
  ok(on(g, 1, 'Blue-Eyes White Dragon').pos === 'def', 'Blue-Eyes changed to Defense');
  choose(g, 'sp:' + find(g, 0, 'VWXYZ-Dragon Catapult Cannon').u); settle(g);
  const v = on(g, 0, 'VWXYZ-Dragon Catapult Cannon'); ok(v, 'VWXYZ summoned');
  act(g, 0, 'VWXYZ-Dragon Catapult Cannon'); E.act(g, ['u' + find(g, 1, 'Waboku').u]); settle(g);
  ok(inZ(g, 1, 'ban', 'Waboku'), 'Waboku banished');
});
T('W-Wing Catapult: equips to V-Tiger Jet for 400 ATK/DEF', () => {
  const g = duel({ board: [{ m: ['V-Tiger Jet', 'W-Wing Catapult'], turn: 2 }, {}] });
  act(g, 0, 'W-Wing Catapult'); settle(g);
  ok(E.atk(g, on(g, 0, 'V-Tiger Jet')) === 2000, `2000 ATK (${E.atk(g, on(g, 0, 'V-Tiger Jet'))})`);
});
T('War-Lion Ritual and Zera Ritual: Ritual Summons', () => {
  const g = duel({ board: [{ hand: ['War-Lion Ritual', 'Super War-Lion', 'Mystical Elf', 'Dark Blade'], turn: 2 }, {}] });
  act(g, 0, 'War-Lion Ritual'); settle(g); ok(on(g, 0, 'Super War-Lion'), 'Super War-Lion summoned');
  const g2 = duel({ board: [{ hand: ['Zera Ritual', 'Zera the Mant', 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  act(g2, 0, 'Zera Ritual'); settle(g2); ok(on(g2, 0, 'Zera the Mant'), 'Zera the Mant summoned');
});
T('Warm Worm: destroyed, mills 3 from the opponent', () => {
  const g = duel({ first: 1, board: [{ m: ['Warm Worm'], turn: 2 }, { hand: ['Dark Hole'] }] });
  const d = g.p[1].deck.length; act(g, 1, 'Dark Hole'); settle(g); ok(g.p[1].deck.length === d - 3, 'milled 3');
});
T('Water Dragon: FIRE monsters have 0 ATK; destroyed, it revives 2 Hydrogeddon and Oxygeddon', () => {
  const g = duel({ first: 1, board: [{ m: ['Water Dragon'], gy: ['Hydrogeddon', 'Hydrogeddon', 'Oxygeddon'], turn: 2 }, { m: ['UFO Turtle'], hand: ['Dark Hole'] }] });
  ok(E.atk(g, on(g, 1, 'UFO Turtle')) === 0, 'UFO Turtle at 0 ATK');
  act(g, 1, 'Dark Hole'); settle(g);
  ok(cnt(g, 0, 'm', 'Hydrogeddon') === 2 && on(g, 0, 'Oxygeddon'), 'revived all 3');
  
});
T('Water Dragon: Monster Reborn can\'t revive it', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Water Dragon'], turn: 2 }, {}] });
  // 2026-11-27 summoning conditions: with no other target, Monster Reborn isn't offered at all
  ok(!g.prompt.opts.some(o => o.key.startsWith('a:' + g.p[0].hand.find(c => E.name(c) === 'Monster Reborn').u + ':')) && inZ(g, 0, 'gy', 'Water Dragon'), 'Monster Reborn not offered, it stays in the GY');
});
T('Water Hazard: Special Summon a Level 4 or lower WATER with no monsters', () => {
  const g = duel({ board: [{ st: [{ n: 'Water Hazard', pos: 'up' }], hand: ['Tribe-Infecting Virus'], turn: 2 }, {}] });
  act(g, 0, 'Water Hazard'); settle(g); ok(on(g, 0, 'Tribe-Infecting Virus'), 'summoned');
});
T('Weed Out: destroys Attack Position Level 3 monsters', () => {
  const g = duel({ first: 1, board: [{ st: ['Weed Out'], turn: 2 }, { m: ['Sangan', { n: 'Lumina, Lightsworn Summoner', pos: 'def' }] }] });
  E.act(g, ['end']); for (let i = 0; i < 20 && g.prompt && !(g.prompt.p === 0 && g.prompt.type === 'respond'); i++) E.act(g, g.prompt.type === 'yesno' ? ['y'] : ['pass']);
  act(g, 0, 'Weed Out'); settle(g);
  ok(inZ(g, 1, 'gy', 'Sangan') && on(g, 1, 'Lumina, Lightsworn Summoner') && g.p[0].lp === 7500, 'Sangan destroyed, Lumina stays, 500 paid');
});
T('Weeping Idol: banish a Tuner to Special Summon itself', () => {
  const g = duel({ board: [{ hand: ['Weeping Idol'], gy: ['Junk Synchron'], turn: 2 }, {}] });
  act(g, 0, 'Weeping Idol'); settle(g); ok(on(g, 0, 'Weeping Idol') && inZ(g, 0, 'ban', 'Junk Synchron'), 'summoned');
});
T('Wetlands: Aqua WATER Level 2 or lower gain 1200', () => {
  const g = duel({ board: [{ st: [], hand: ['Wetlands'], m: ['Sinister Serpent', 'Ameba'], turn: 2 }, {}] });
  act(g, 0, 'Wetlands'); settle(g); ok(E.atk(g, on(g, 0, 'Sinister Serpent')) === 300 && E.atk(g, on(g, 0, 'Ameba')) === 1500, 'Ameba boosted, the WATER Reptile not');
});
T('Whirlwind Weasel: flipped, the opponent can\'t activate Spells/Traps this turn', () => {
  const g = duel({ board: [{ m: [{ n: 'Whirlwind Weasel', pos: 'set' }], turn: 2 }, { st: ['Waboku'] }] });
  choose(g, 'flip:' + on(g, 0, 'Whirlwind Weasel').u); settle(g);
  ok(E.lib.forbid(g, { type: 'activate', c: find(g, 1, 'Waboku'), eff: { type: 'act' }, p: 1 }), 'B can\'t activate Waboku');
});
T('Wicked Rebirth: revives a Synchro, negated, can\'t attack; it leaves when the Trap does', () => {
  const g = duel({ first: 1, board: [{ st: ['Wicked Rebirth'], gy: ['Stardust Dragon'], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  E.act(g, ['end']); for (let i = 0; i < 20 && g.prompt && !(g.prompt.p === 0 && g.prompt.type === 'respond'); i++) E.act(g, g.prompt.type === 'yesno' ? ['y'] : ['pass']);
  act(g, 0, 'Wicked Rebirth'); settle(g);
  const s = on(g, 0, 'Stardust Dragon'); ok(s && s.flags.negated && g.p[0].lp === 7200, 'Stardust revived, negated, 800 paid');
  endTurn(g); act(g, 1, 'Mystical Space Typhoon'); settle(g);
  ok(inZ(g, 0, 'gy', 'Stardust Dragon'), 'Stardust destroyed with it');
});
T('Widespread Dud: one selected monster leaves, both cards go', () => {
  const g = duel({ first: 1, board: [{ st: ['Widespread Dud'], turn: 2 }, { m: ['Blue-Eyes White Dragon', 'Dark Blade'], hand: ['Mystical Space Typhoon'] }] });
  E.act(g, ['end']); for (let i = 0; i < 20 && g.prompt && !(g.prompt.p === 0 && g.prompt.type === 'respond'); i++) E.act(g, g.prompt.type === 'yesno' ? ['y'] : ['pass']);
  act(g, 0, 'Widespread Dud'); settle(g);
  E.act(g, ['end']); settle(g);
  // B's turn: B destroys the Dud with MST
  act(g, 1, 'Mystical Space Typhoon'); settle(g);
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Dark Blade'), 'both monsters destroyed');
});
T('Wild Fire: destroys Blaze Accelerator and all monsters, then a token', () => {
  const g = duel({ board: [{ st: [{ n: 'Blaze Accelerator', pos: 'up' }], hand: ['Wild Fire'], m: ['Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Wild Fire'); settle(g);
  ok(inZ(g, 0, 'gy', 'Blaze Accelerator') && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 0, 'Wild Fire Token'), 'all destroyed, token summoned');
  ok(E.lib.forbid(g, { type: 'attack', c: on(g, 0, 'Wild Fire Token') }), 'no attacks this turn');
});
T('Wolf in Sheep\'s Clothing: after direct battle damage, summon a Level 1 and its copy from the Deck', () => {
  const g = duel({ first: 1, board: [{ st: ['Wolf in Sheep\'s Clothing'], hand: ['Kuriboh'], deckTop: ['Kuriboh'], turn: 2 }, { m: ['Dark Blade'] }] });
  toBP(g); attack(g, on(g, 1, 'Dark Blade'), null);
  for (let i = 0; i < 20 && g.prompt && !(g.prompt.type === 'yesno' && g.prompt.p === 0 && /Wolf/.test(g.prompt.text)); i++) E.act(g, g.prompt.type === 'yesno' ? ['n'] : ['pass']);
  ok(g.prompt.type === 'yesno', `offered (${pt(g)})`); E.act(g, ['y']); settle(g);
  ok(cnt(g, 0, 'm', 'Kuriboh') === 2, 'two Kuriboh summoned');
});
T('Wonder Clover: one monster attacks twice, the others can\'t attack', () => {
  const g = duel({ board: [{ hand: ['Wonder Clover', 'Bean Soldier'], m: ['Mystical Elf', 'Dark Blade'], turn: 2 }, {}] });
  act(g, 0, 'Wonder Clover'); for (let i = 0; i < 5 && g.prompt.type !== 'pick'; i++) E.act(g, ['pass']); pickName(g, 'Dark Blade'); settle(g);
  const db = on(g, 0, 'Dark Blade'), me = on(g, 0, 'Mystical Elf');
  ok(inZ(g, 0, 'gy', 'Bean Soldier') && db.flags.extraAttack === g.turnNo, 'Bean Soldier sent, Dark Blade gets 2 attacks');
  ok(E.lib.forbid(g, { type: 'attack', c: me }) && !E.lib.forbid(g, { type: 'attack', c: db }), 'only Dark Blade can attack');
  toBP(g); attack(g, db, null); settle(g); attack(g, db, null); settle(g);
  ok(g.p[1].lp === 8000 - 3600, `two direct attacks (${g.p[1].lp})`);
});
T('Wonder Garage: a face-down Wonder Garage destroyed lets a "roid" be Special Summoned', () => {
  const g = duel({ first: 1, board: [{ st: ['Wonder Garage'], hand: ['Drillroid'], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 1, 'Mystical Space Typhoon'); settle(g);
  ok(on(g, 0, 'Drillroid'), 'Drillroid summoned');
});
T('Woodland Archer: Special Summon with 2 Normals in the GY, Tribute it to add a Gemini', () => {
  const g = duel({ board: [{ hand: ['Woodland Archer'], gy: ['Mystical Elf', 'Dark Blade'], deckTop: [FILL, 'Elemental HERO Neos Alius'], turn: 2 }, {}] });
  choose(g, 'sp:' + find(g, 0, 'Woodland Archer').u); settle(g); ok(on(g, 0, 'Woodland Archer'), 'summoned by its rule');
  act(g, 0, 'Woodland Archer'); settle(g); ok(inZ(g, 0, 'hand', 'Elemental HERO Neos Alius'), 'Gemini added');
  ok(forbidSS(g, 0, find(g, 0, 'Woodland Archer')), 'can\'t be revived');
});
T('Wrath of Neos: Neos to the Deck, then destroy every card', () => {
  const g = duel({ board: [{ hand: ['Wrath of Neos'], m: ['Elemental HERO Neos', 'Dark Blade'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], st: ['Waboku'] }] });
  act(g, 0, 'Wrath of Neos'); settle(g);
  ok(!on(g, 0, 'Elemental HERO Neos') && !inZ(g, 0, 'gy', 'Elemental HERO Neos') && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Waboku') && inZ(g, 0, 'gy', 'Dark Blade'), 'Neos in Deck, everything else destroyed');
});
T('Wroughtweiler: destroyed by battle, adds an Elemental HERO and Polymerization', () => {
  const g = duel({ first: 1, board: [{ m: ['Wroughtweiler'], gy: ['Elemental HERO Avian', 'Polymerization'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  toBP(g); attack(g, on(g, 1, 'Blue-Eyes White Dragon'), on(g, 0, 'Wroughtweiler')); settle(g);
  ok(inZ(g, 0, 'hand', 'Elemental HERO Avian') && inZ(g, 0, 'hand', 'Polymerization'), 'both added');
});

/* ----- X, Y, Z ----- */
T('X-Saber Axel: a Saber destroyed by battle draws 1', () => {
  const g = duel({ board: [{ m: ['X-Saber Axel', 'X-Saber Airbellum'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  const h = g.p[0].hand.length; toBP(g); attack(g, on(g, 0, 'X-Saber Airbellum'), on(g, 1, 'Blue-Eyes White Dragon')); settle(g);
  ok(g.p[0].hand.length === h + 1, 'drew 1');
});
T('X-Saber Uruz: Tribute it to put the destroyed monster on top of the Deck', () => {
  const g = duel({ board: [{ m: ['X-Saber Uruz'], turn: 2 }, { m: ['Mystical Elf'] }] });
  toBP(g); attack(g, on(g, 0, 'X-Saber Uruz'), on(g, 1, 'Mystical Elf'));
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'yesno'; i++) E.act(g, ['pass']);
  ok(g.prompt.type === 'yesno', `offered (${pt(g)})`); settle(g);
  ok(E.name(g.p[1].deck[g.p[1].deck.length - 1]) === 'Mystical Elf' && inZ(g, 0, 'gy', 'X-Saber Uruz'), 'Elf on top, Uruz Tributed');
});
T('XX-Saber Gardestrike and Garsem', () => {
  const g = duel({ board: [{ hand: ['XX-Saber Gardestrike'], gy: ['X-Saber Airbellum', 'X-Saber Uruz'], deckTop: ['X-Saber Axel'], turn: 2 }, { hand: ['Dark Hole'] }] });
  choose(g, 'sp:' + find(g, 0, 'XX-Saber Gardestrike').u); settle(g); ok(on(g, 0, 'XX-Saber Gardestrike'), 'Gardestrike summoned');
  const g2 = duel({ first: 1, board: [{ m: ['XX-Saber Garsem', 'X-Saber Uruz'], deckTop: [FILL, 'X-Saber Axel'], turn: 2 }, { hand: ['Dark Hole'] }] });
  ok(E.atk(g2, on(g2, 0, 'XX-Saber Garsem')) === 1800, `Garsem 1800 (${E.atk(g2, on(g2, 0, 'XX-Saber Garsem'))})`);
  act(g2, 1, 'Dark Hole'); settle(g2); ok(inZ(g2, 0, 'hand', 'X-Saber Axel'), 'X-Saber added');
});
T('Yamato-no-Kami: banish a Spirit to summon; returns to the hand in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Yamato-no-Kami'], gy: ['Fushi No Tori'], turn: 2 }, {}] });
  ok(!!C.find(x => x.n === 'Fushi No Tori' && /Spirit/.test(x.ab)), 'Fushi No Tori is a Spirit');
  choose(g, 'sp:' + find(g, 0, 'Yamato-no-Kami').u); settle(g); ok(on(g, 0, 'Yamato-no-Kami'), 'summoned');
  E.act(g, ['end']); settle(g); ok(inZ(g, 0, 'hand', 'Yamato-no-Kami'), 'back in the hand');
});
T('Yellow Baboon: a Beast destroyed by battle, banish 2 Beasts to summon it', () => {
  const g = duel({ first: 1, board: [{ hand: ['Yellow Baboon, Archer of the Forest'], m: ['Giant Rat'], gy: ['Nimble Momonga'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  toBP(g); attack(g, on(g, 1, 'Blue-Eyes White Dragon'), on(g, 0, 'Giant Rat'));
  for (let i = 0; i < 20 && g.prompt && !(g.prompt.type === 'yesno' && /Baboon/.test(g.prompt.text)); i++) E.act(g, g.prompt.type === 'yesno' ? ['n'] : g.prompt.type === 'pick' ? [g.prompt.opts[0].key] : ['pass']);
  ok(g.prompt && g.prompt.type === 'yesno', `offered (${pt(g)})`); E.act(g, ['y']); settle(g);
  ok(on(g, 0, 'Yellow Baboon, Archer of the Forest'), 'Baboon summoned');
});
T('Yu-Jo Friendship: an accepted handshake averages the LP', () => {
  const g = duel({ board: [{ hand: ['Yu-Jo Friendship'], lp: 2000, turn: 2 }, {}] });
  act(g, 0, 'Yu-Jo Friendship'); toNext(g); ok(g.prompt.type === 'yesno' && g.prompt.p === 1, 'B is asked'); E.act(g, ['y']); settle(g);
  ok(g.p[0].lp === 5000 && g.p[1].lp === 5000, 'both at 5000');
});
T('Zeman the Ape King: send a monster to negate an attack', () => {
  const g = duel({ first: 1, ex0: ['Zeman the Ape King'], board: [{ m: ['Zeman the Ape King'], hand: ['Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  toBP(g); attack(g, on(g, 1, 'Blue-Eyes White Dragon'), on(g, 0, 'Zeman the Ape King'));
  ok(g.prompt.type === 'yesno' && g.prompt.p === 0, `offered (${pt(g)})`); E.act(g, ['y']); settle(g);
  ok(on(g, 0, 'Zeman the Ape King') && inZ(g, 0, 'gy', 'Mystical Elf') && g.p[0].lp === 8000, 'attack negated');
});
T('Zeradias: discard for Sanctuary; destroyed on the field without it', () => {
  const g = duel({ board: [{ hand: ['Zeradias, Herald of Heaven', 'Zeradias, Herald of Heaven'], deckTop: [FILL, 'The Sanctuary in the Sky'], turn: 2 }, {}] });
  act(g, 0, 'Zeradias, Herald of Heaven'); settle(g); ok(inZ(g, 0, 'hand', 'The Sanctuary in the Sky'), 'Sanctuary added');
  ns(g, 0, 'Zeradias, Herald of Heaven'); settle(g); ok(inZ(g, 0, 'gy', 'Zeradias, Herald of Heaven') && !on(g, 0, 'Zeradias, Herald of Heaven'), 'destroyed with no Sanctuary');
});
T('Zero Gardna: no battle destruction or battle damage this turn', () => {
  const g = duel({ first: 1, board: [{ m: ['Zero Gardna', 'Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  toBP(g); attack(g, on(g, 1, 'Blue-Eyes White Dragon'), on(g, 0, 'Mystical Elf'));
  ok(g.prompt.p === 0, `A can respond (${pt(g)})`); act(g, 0, 'Zero Gardna'); settle(g);
  ok(on(g, 0, 'Mystical Elf') && g.p[0].lp === 8000, 'Elf survived');
});
T('Zeta Reticulant: Eva Token when an opponent\'s monster is banished; Tribute it to summon Zeta', () => {
  const g = duel({ board: [{ gy: ['Zeta Reticulant'], m: ['Dark Blade'], hand: ['Caius the Shadow Monarch', 'Zeta Reticulant'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ns(g, 0, 'Caius the Shadow Monarch'); for (let i = 0; i < 10 && g.prompt.type !== 'pick'; i++) E.act(g, ['pass']); pickName(g, 'Blue-Eyes White Dragon'); settle(g);
  ok(inZ(g, 1, 'ban', 'Blue-Eyes White Dragon') && on(g, 0, 'Eva Token'), 'Eva Token summoned');
  choose(g, 'sp:' + g.p[0].hand.find(c => E.name(c) === 'Zeta Reticulant').u); settle(g);
  ok(on(g, 0, 'Zeta Reticulant') && !on(g, 0, 'Eva Token'), 'Zeta summoned by Tributing the token');
});
T('Zombie Mammoth: destroyed with no Zombie in the GY, damage to its controller when destroyed', () => {
  const g = duel({ board: [{ hand: ['Zombie Mammoth'], turn: 2 }, {}] });
  ns(g, 0, 'Zombie Mammoth'); settle(g);
  ok(inZ(g, 0, 'gy', 'Zombie Mammoth') && g.p[0].lp === 6100, `destroyed, 1900 to A (${g.p[0].lp})`);
});
T('Zone Eater: the attacked monster is destroyed in the End Phase 5 turns later', () => {
  const g = duel({ board: [{ m: ['Zone Eater'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'def' }] }] });
  toBP(g); attack(g, on(g, 0, 'Zone Eater'), on(g, 1, 'Big Shield Gardna')); settle(g); E.act(g, ['endbp']); settle(g);
  for (let i = 0; i < 5; i++) endTurn(g);
  ok(on(g, 1, 'Big Shield Gardna'), 'still there before the 5th turn ends');
  E.act(g, ['end']); settle(g);
  ok(inZ(g, 1, 'gy', 'Big Shield Gardna'), 'destroyed');
});

console.log(fails ? `\n${fails} FAILED` : '\nAll checks passed.');
process.exitCode = fails ? 1 : 0;
