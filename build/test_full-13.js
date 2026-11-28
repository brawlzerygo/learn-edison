// Scenario checks for full pool batch 13: node build/test_full-13.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = (ex, top) => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
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
const all = g => { const out = []; for (const P of g.p) for (const z of ['hand', 'deck', 'gy', 'ban', 'extra', 'm', 'st']) for (const c of P[z]) if (c) out.push(c); return out; };
// pick the prompt option for card n (an activation, a proc, a summon, a target)
const use = (g, n, pre = '') => { const cs = all(g).filter(c => E.data(c).n === n); const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + n);
  const o = pr.opts.find(x => cs.some(c => x.key === 'u' + c.u || x.key.startsWith((pre || 'a') + ':' + c.u + ':') || x.key === (pre || 'sp') + ':' + c.u || (!pre && x.key.startsWith('a:' + c.u + ':'))));
  if (!o) throw new Error(`no option for ${n} in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`); E.act(g, [o.key]); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
// answer prompts until the turn player's idle prompt: pass responses, yes to triggers, first option otherwise
const settle = (g, k = 40) => { for (let i = 0; i < k && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') choose(g, 'yes'); else E.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); } };
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const L = E.lib;

T('Power Bond doubles a Machine Fusion and burns in the End Phase', () => {
  const g = duel({ ex0: ['Cyber Twin Dragon'], board: [{ hand: ['Power Bond', 'Cyber Dragon', 'Cyber Dragon'] }, {}] });
  use(g, 'Power Bond'); passAll(g); settle(g);
  const t = on(g, 0, 'Cyber Twin Dragon'); ok(t && E.atk(g, t) === 5600, `Cyber Twin Dragon has 5600 ATK (${t && E.atk(g, t)})`);
  choose(g, 'end'); settle(g); ok(g.p[0].lp === 8000 - 2800, `2800 damage in the End Phase (${g.p[0].lp})`);
});
T('Power Capsule gives Victory Viper 400 ATK', () => {
  const g = duel({ board: [{ hand: ['Power Capsule'], m: ['Victory Viper XX03'] }, {}] });
  use(g, 'Power Capsule'); passAll(g); choose(g, 'gains 400'); settle(g);
  ok(E.atk(g, on(g, 0, 'Victory Viper XX03')) === 1600, 'Victory Viper has 1600 ATK');
});
T('Power Filter stops low-ATK Special Summons', () => {
  const g = duel({ board: [{ st: [{ n: 'Power Filter', pos: 'up' }], gy: ['Rocket Jumper', 'Cyber Dragon'] }, {}] });
  ok(L.forbid(g, { type: 'ss', c: g.p[0].gy[0], p: 0 }) && !L.forbid(g, { type: 'ss', c: g.p[0].gy[1], p: 0 }), 'Rocket Jumper blocked, Cyber Dragon allowed');
});
T('Power Invader without Tributes when the opponent has 2 monsters', () => {
  const g = duel({ board: [{ hand: ['Power Invader'] }, { m: [FILL, FILL] }] });
  ok(hasOpt(g, 'Normal Summon'), 'Normal Summon offered with no Tributes'); choose(g, 'ns:'); settle(g); ok(!!on(g, 0, 'Power Invader'), 'Power Invader summoned');
});
T('Power Pickaxe banishes and gives 500', () => {
  const g = duel({ board: [{ hand: ['Power Pickaxe'], m: [FILL] }, { gy: ['Junk Synchron'] }] });
  use(g, 'Power Pickaxe'); settle(g); use(g, 'Power Pickaxe'); settle(g);
  ok(inZ(g, 1, 'ban', 'Junk Synchron') && E.atk(g, on(g, 0, FILL)) === 2500, 'Junk Synchron banished, Warwolf 2500');
});
T('Power Supplier: +400 while face-up', () => {
  const g = duel({ board: [{ m: ['Power Supplier', FILL] }, {}] });
  use(g, 'Power Supplier'); choose(g, FILL); settle(g);
  const w = on(g, 0, FILL); ok(E.atk(g, w) === 2400, 'Warwolf 2400');
  L.destroy(g, [on(g, 0, 'Power Supplier')], {}); ok(E.atk(g, w) === 2000, 'back to 2000 when Supplier leaves');
});
T('Princesses: no Normal Summon, Standby effects', () => {
  const g = duel({ board: [{ hand: ['Princess Curran'], m: ['Princess Pikeru'], turn: 1 }, { m: [FILL, FILL] }] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand.find(c => E.data(c).n === 'Princess Curran').u), 'Curran cannot be Normal Summoned');
  ok(L.forbid(g, { type: 'ss', c: g.p[0].hand.find(c => E.data(c).n === 'Princess Curran'), p: 0 }), 'Curran cannot be Special Summoned without Trial');
  choose(g, 'end'); settle(g); // B's turn
  choose(g, 'end'); settle(g); // A's standby
  ok(g.p[0].lp === 9600, `Pikeru gained 800 in each of A's Standby Phases (${g.p[0].lp})`);
});
T('Princess of Tsurugi burns per Spell/Trap', () => {
  const g = duel({ board: [{ m: [{ n: 'Princess of Tsurugi', pos: 'set' }], turn: 2 }, { st: ['Mirror Force', 'Trap Hole'] }] });
  choose(g, 'flip:'); settle(g); ok(g.p[1].lp === 7000, `1000 damage (${g.p[1].lp})`);
});
T('Raging Earth destroys face-down and non-EARTH monsters', () => {
  const g = duel({ board: [{ m: ['Cyber Twin Dragon'], turn: 2 }, { m: ['Raging Earth', { n: FILL, pos: 'set' }, 'Royal Keeper'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Raging Earth'); settle(g);
  ok(inZ(g, 1, 'gy', 'Raging Earth') && inZ(g, 1, 'gy', FILL) && !on(g, 0, 'Cyber Twin Dragon') && on(g, 1, 'Royal Keeper'), 'Warwolf and Cyber Twin gone, EARTH Royal Keeper stays');
});
T('Raging Eria summons a WATER and takes it down with it', () => {
  const g = duel({ board: [{ hand: ['Revival Jam'], m: ['Raging Eria', { n: 'Revival Jam', pos: 'set' }] }, {}] });
  use(g, 'Raging Eria'); settle(g);
  const j = g.p[0].m.find(c => c && E.data(c).n === 'Revival Jam' && c.pos === 'atk'); ok(!!j, 'Revival Jam summoned');
  L.destroy(g, [on(g, 0, 'Raging Eria')], {}); choose(g, 'end'); settle(g); ok(!g.p[0].m.some(c => c && E.data(c).n === 'Revival Jam'), 'it was destroyed with Raging Eria');
});
T('Raging Flame Sprite grows on a direct hit', () => {
  const g = duel({ board: [{ m: ['Raging Flame Sprite'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); settle(g);
  ok(E.atk(g, on(g, 0, 'Raging Flame Sprite')) === 1100 && g.p[1].lp === 7900, 'Sprite 1100 ATK after 100 damage');
});
T('Raging Mad Plants pumps Plants and destroys them', () => {
  const g = duel({ board: [{ hand: ['Raging Mad Plants'], m: ['Lonefire Blossom'], gy: ['Firegrass', 'Bean Soldier'] }, {}] });
  use(g, 'Raging Mad Plants'); settle(g); ok(E.atk(g, on(g, 0, 'Lonefire Blossom')) === 1100, 'Lonefire 1100');
  choose(g, 'end'); settle(g); ok(inZ(g, 0, 'gy', 'Lonefire Blossom'), 'destroyed in the End Phase');
});
const CB7 = ['Crystal Beast Amber Mammoth', 'Crystal Beast Amethyst Cat', 'Crystal Beast Cobalt Eagle', 'Crystal Beast Emerald Tortoise', 'Crystal Beast Ruby Carbuncle', 'Crystal Beast Sapphire Pegasus', 'Crystal Beast Topaz Tiger'];
T('Rainbow Dragon: summon by its rule, Quick Effect and field shuffle', () => {
  const g = duel({ board: [{ hand: ['Rainbow Dragon'], m: ['Crystal Beast Topaz Tiger'], gy: CB7.slice(0, 6) }, { m: [FILL], st: ['Mirror Force'] }] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'no Normal Summon');
  use(g, 'Rainbow Dragon', 'sp'); settle(g); const r = on(g, 0, 'Rainbow Dragon'); ok(!!r, 'Rainbow Dragon Special Summoned');
  ok(!hasOpt(g, 'a:' + r.u + ':'), 'no effects the turn it is summoned');
  choose(g, 'end'); settle(g); choose(g, 'end'); settle(g);
  use(g, 'Rainbow Dragon'); settle(g); ok(E.atk(g, r) === 5000 && inZ(g, 0, 'gy', 'Crystal Beast Topaz Tiger'), 'sent Topaz Tiger, 5000 ATK');
  const opts = g.prompt.opts.filter(o => o.key.startsWith('a:' + r.u + ':')); E.act(g, [opts[opts.length - 1].key]); settle(g);
  ok(L.allField(g).length === 0, 'every card on the field was shuffled away');
});
T('Rainbow Dark Dragon: summon by banishing 7 DARKs', () => {
  const darks = ['Ally of Justice Clausolas', 'Ancient Brain', 'Archfiend Soldier', 'Armored Zombie', 'Baron of the Fiend Sword', 'Blackland Fire Dragon', 'Blocker'];
  const g = duel({ board: [{ hand: ['Rainbow Dark Dragon'], gy: [...darks, 'Dark Magician'] }, {}] });
  use(g, 'Rainbow Dark Dragon', 'sp'); for (let i = 0; i < 7; i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  const r = on(g, 0, 'Rainbow Dark Dragon'); ok(!!r && g.p[0].ban.length === 7, 'summoned, 7 banished');
  use(g, 'Rainbow Dark Dragon'); settle(g); ok(E.atk(g, r) === 4500 && inZ(g, 0, 'ban', 'Dark Magician'), 'banished Dark Magician, 4500 ATK');
  ok(L.forbid(g, { type: 'ss', c: { ...r, zone: 'deck' }, p: 0 }), 'cannot be Special Summoned from the Deck');
});
T('Rainbow Gravity summons Rainbow Dragon from the Deck', () => {
  const g = duel({ board: [{ st: ['Rainbow Gravity'], gy: CB7, deckTop: [FILL, 'Rainbow Dragon'], turn: 2 }, {}] });
  use(g, 'Rainbow Gravity'); settle(g); ok(!!on(g, 0, 'Rainbow Dragon'), 'Rainbow Dragon summoned');
});
T('Rainbow Life turns damage into LP', () => {
  const g = duel({ board: [{ st: ['Rainbow Life'], hand: [FILL], turn: 2 }, {}] });
  use(g, 'Rainbow Life'); settle(g); L.damage(g, 0, 1000, {}); ok(g.p[0].lp === 9000, `gained 1000 (${g.p[0].lp})`);
});
T('Rainbow Neos: Fusion only, shuffles their monsters', () => {
  const g0 = duel({ ex0: ['Rainbow Neos'], board: [{ hand: ['Elemental HERO Neos'], m: ['Rainbow Dragon'] }, {}] });
  const rn = g0.p[0].extra[0]; ok(L.forbid(g0, { type: 'ss', c: rn, p: 0, how: 'special' }) && !L.forbid(g0, { type: 'ss', c: rn, p: 0, how: 'fusion' }), 'only by Fusion Summon');
  ok(L.canFusion(g0, 0), 'Neos + Rainbow Dragon is a legal recipe');
  const g = duel({ board: [{ m: ['Rainbow Neos', FILL] }, { m: [FILL, FILL] }] }); const r = on(g, 0, 'Rainbow Neos');
  choose(g, 'shuffle their monsters'); use(g, FILL); settle(g); ok(L.monsOf(g, 1).length === 0 && inZ(g, 0, 'gy', FILL), 'their monsters shuffled away');
  ok(!hasOpt(g, 'a:' + r.u + ':'), 'once per turn');
});
T('Rainbow Path negates the attack and searches', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: ['Rainbow Path', { n: 'Crystal Beast Topaz Tiger', pos: 'up' }], deckTop: ['Rainbow Dragon'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); use(g, 'Rainbow Path'); settle(g);
  ok(g.p[1].lp === 8000 && inZ(g, 1, 'hand', 'Rainbow Dragon'), 'attack negated, Rainbow Dragon added');
});
T('Rainbow Veil negates the battled monster in the Battle Phase', () => {
  const g = duel({ board: [{ m: [FILL], st: [{ n: 'Rainbow Veil', pos: 'up' }], turn: 2 }, { m: ['Spirit Reaper'] }] });
  g.p[0].st[0].equipTo = g.p[0].m[0].u;
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Spirit Reaper'); settle(g);
  ok(inZ(g, 1, 'gy', 'Spirit Reaper'), 'Spirit Reaper destroyed by battle');
});
T('Red Dragon Archfiend Assault Mode clears the field and brings back Red Dragon Archfiend', () => {
  const g = duel({ board: [{ m: ['Red Dragon Archfiend Assault Mode', FILL], gy: ['Red Dragon Archfiend'], turn: 2 }, { m: ['Cyber Dragon', FILL] }] });
  g.p[0].gy[0].f13proper = true;
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Cyber Dragon'); settle(g);
  ok(L.fieldMons(g).length === 1, 'only Assault Mode left');
  const h = duel({ board: [{ m: ['Red Dragon Archfiend Assault Mode'], gy: ['Red Dragon Archfiend'], turn: 2 }, { st: ['Mirror Force'] }] });
  h.p[0].gy[0].f13proper = true;
  choose(h, 'bp'); passAll(h); choose(h, 'Attack directly'); use(h, 'Mirror Force'); settle(h);
  ok(!!on(h, 0, 'Red Dragon Archfiend'), 'Red Dragon Archfiend came back after Mirror Force');
});
T('Red Ogre returns cards to the hand', () => {
  const g = duel({ board: [{ hand: ['Red Ogre', 'Mirror Force'], m: [FILL, FILL] }, { m: ['Cyber Dragon'] }] });
  choose(g, 'ns:'); passAll(g); yesAll(g);
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick' && /Return/.test(g.prompt.text)) { use(g, 'Cyber Dragon'); continue; } settle(g, 1); }
  ok(inZ(g, 1, 'hand', 'Cyber Dragon') && inZ(g, 0, 'gy', 'Mirror Force'), 'Mirror Force sent, Cyber Dragon returned');
});
T('Red-Eyes Darkness Dragon: Tribute Red-Eyes, +300 per Dragon', () => {
  const g = duel({ board: [{ hand: ['Red-Eyes Darkness Dragon'], m: ['Red-Eyes Black Dragon'], gy: ['Blackland Fire Dragon'] }, {}] });
  use(g, 'Red-Eyes Darkness Dragon', 'sp'); settle(g); const r = on(g, 0, 'Red-Eyes Darkness Dragon');
  ok(r && E.atk(g, r) === 3000, `3000 ATK with 2 Dragons in the GY (${r && E.atk(g, r)})`);
  ok(L.forbid(g, { type: 'ss', c: { ...r, zone: 'gy' }, p: 0 }), 'cannot be revived');
});
T('Red-Eyes Black Metal Dragon from the Deck', () => {
  const g = duel({ board: [{ m: ['Red-Eyes Black Dragon'], st: [{ n: 'Metalmorph', pos: 'up' }], deckTop: [FILL, 'Red-Eyes Black Metal Dragon'], turn: 2 }, {}] });
  g.p[0].st[0].equipTo = g.p[0].m[0].u;
  choose(g, 'bp'); settle(g); choose(g, 'endbp'); settle(g);
  ok(!!on(g, 0, 'Red-Eyes Black Metal Dragon'), 'Red-Eyes Black Metal Dragon summoned');
});
T('Red-Eyes Zombie Dragon revives the Zombie it destroys', () => {
  const g = duel({ board: [{ m: ['Red-Eyes Zombie Dragon'], turn: 2 }, { m: ['Return Zombie'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Return Zombie'); settle(g);
  ok(!!on(g, 0, 'Return Zombie'), 'Return Zombie now on A\'s side');
});
T('Release from Stone summons and links', () => {
  const g = duel({ board: [{ st: ['Release from Stone'], ban: ['Rocket Jumper'], turn: 2 }, {}] });
  use(g, 'Release from Stone'); settle(g); ok(!!on(g, 0, 'Rocket Jumper'), 'Rocket Jumper summoned');
  L.destroy(g, [g.p[0].st.find(Boolean)], {}); ok(inZ(g, 0, 'gy', 'Rocket Jumper'), 'destroyed with the trap');
});
T('Release Restraint and Release Restraint Wave', () => {
  const g = duel({ board: [{ hand: ['Release Restraint'], m: ['Gearfried the Iron Knight'], deckTop: ['Gearfried the Swordmaster'] }, {}] });
  use(g, 'Release Restraint'); settle(g); ok(!!on(g, 0, 'Gearfried the Swordmaster'), 'Swordmaster summoned');
  const h = duel({ board: [{ hand: ['Release Restraint Wave', 'Power of Kaishin'], m: ['Revival Jam'] }, { st: ['Mirror Force', 'Trap Hole'] }] });
  use(h, 'Power of Kaishin'); settle(h);
  use(h, 'Release Restraint Wave'); settle(h); ok(h.p[1].gy.length === 2 && inZ(h, 0, 'gy', 'Power of Kaishin'), 'Equip and both Set cards destroyed');
});
T('Return of the Six Samurai: summon, destroyed in the End Phase', () => {
  const g = duel({ board: [{ st: ['Return of the Six Samurai'], gy: ['The Six Samurai - Zanji'], turn: 2 }, {}] });
  use(g, 'Return of the Six Samurai'); settle(g); ok(!!on(g, 0, 'The Six Samurai - Zanji'), 'Zanji summoned');
  choose(g, 'end'); settle(g); ok(inZ(g, 0, 'gy', 'The Six Samurai - Zanji'), 'destroyed in the End Phase');
});
T('Return Soul returns monsters destroyed this turn', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Cyber Twin Dragon'], turn: 2 }, { m: [FILL], st: ['Return Soul'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack ' + FILL); settle(g); choose(g, 'endbp'); settle(g);
  for (let i = 0; i < 20 && !hasOpt(g, 'Return Soul') && g.prompt; i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else settle(g, 1); }
  use(g, 'Return Soul'); E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(!inZ(g, 1, 'gy', FILL), 'the Warwolf left the GY');
});
T('Return Zombie comes back at the Standby Phase with an empty hand', () => {
  const g = duel({ board: [{ hand: [], gy: ['Return Zombie'], turn: 2 }, {}] });
  g.p[0].hand.length = 0; // draws happen, so empty it at the start of the next turn
  choose(g, 'end'); settle(g);
  for (const c of g.p[0].hand.splice(0)) { c.zone = 'deck'; g.p[0].deck.push(c); }
  choose(g, 'end'); // to A's turn: A draws, so the hand isn't empty
  settle(g); ok(inZ(g, 0, 'gy', 'Return Zombie'), 'not returned while holding a card');
});
T('Revival Gift summons a Tuner and gives 2 tokens', () => {
  const g = duel({ board: [{ st: ['Revival Gift'], gy: ['Junk Synchron'], turn: 2 }, {}] });
  use(g, 'Revival Gift'); settle(g);
  ok(!!on(g, 0, 'Junk Synchron') && L.monsOf(g, 1).length === 2, 'Junk Synchron and 2 Gift Fiend Tokens');
});
T('Revival Jam returns next Standby Phase', () => {
  const g = duel({ board: [{ m: ['Cyber Twin Dragon'], turn: 2 }, { m: ['Revival Jam'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Revival Jam'); settle(g); choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(!!on(g, 1, 'Revival Jam') && g.p[1].lp < 7000, 'Revival Jam back after paying 1000');
});
T('Ring of Defense makes trap damage 0', () => {
  const g = duel({ board: [{ m: [FILL], st: ['Ring of Defense'], turn: 2 }, { st: ['Magic Cylinder'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); use(g, 'Magic Cylinder'); use(g, 'Ring of Defense'); settle(g);
  ok(g.p[0].lp === 8000, `no damage (${g.p[0].lp})`);
});
T('Ring of Destruction on the opponent’s turn', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: ['Ring of Destruction'] }] });
  choose(g, 'bp'); use(g, 'Ring of Destruction'); settle(g);
  ok(g.p[0].lp === 6000 && g.p[1].lp === 6000 && inZ(g, 0, 'gy', FILL), 'both took 2000');
});
T('Ring of Magnetism: only the equipped monster can be attacked', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Cyber Dragon', 'Royal Keeper'], st: [{ n: 'Ring of Magnetism', pos: 'up' }] }] });
  g.p[1].st[0].equipTo = g.p[1].m[1].u;
  choose(g, 'bp'); passAll(g); ok(hasOpt(g, 'Attack Royal Keeper') && !hasOpt(g, 'Attack Cyber Dragon'), 'only Royal Keeper attackable');
  ok(E.atk(g, on(g, 1, 'Royal Keeper')) === 1100, 'Royal Keeper -500');
});
T('Ritual Buster locks Spells and Traps', () => {
  const g = duel({ board: [{ hand: ['Revival of Dokurorider', 'Dokurorider'], m: [FILL, FILL] }, { st: ['Ritual Buster'] }] });
  use(g, 'Revival of Dokurorider'); passAll(g); if (g.prompt.type === 'choose') E.act(g, [g.prompt.opts[0].key]);
  use(g, 'Ritual Buster'); settle(g);
  ok(!!on(g, 0, 'Dokurorider') && inZ(g, 1, 'gy', 'Ritual Buster'), 'Dokurorider summoned and Ritual Buster used');
  ok(L.forbid(g, { type: 'activate', c: g.p[0].deck[0], eff: {}, p: 0 }) === false, 'monsters unaffected');
  const st = { ...g.p[0].hand[0] || g.p[0].deck[0] }; st.id = C.find(x => x.n === 'Mirror Force').id;
  ok(L.forbid(g, { type: 'activate', c: st, eff: {}, p: 0 }), 'A cannot activate Traps');
});
T('Ritual Cage: no battle damage with Ritual Monsters', () => {
  const g = duel({ board: [{ m: ['Cyber Twin Dragon'], turn: 2 }, { m: ['Dokurorider'], st: [{ n: 'Ritual Cage', pos: 'up' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Dokurorider'); settle(g); ok(g.p[1].lp === 8000, 'no battle damage');
});
T('Ritual Foregone: summoned, can’t attack, destroyed', () => {
  const g = duel({ board: [{ hand: ['Ritual Foregone', 'Dokurorider'], turn: 2 }, {}] });
  use(g, 'Ritual Foregone'); settle(g); ok(!!on(g, 0, 'Dokurorider') && g.p[0].lp === 7000, 'summoned for 1000');
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'Attack'), 'it can’t attack'); choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(inZ(g, 0, 'gy', 'Dokurorider'), 'destroyed in the End Phase');
});
T('Ritual of Destruction: battle-destroyed monsters go to the Deck', () => {
  const g = duel({ board: [{ m: ['Dokurorider'], gy: ['Ritual of Destruction'], turn: 2 }, { m: ['Junk Synchron'] }] });
  use(g, 'Ritual of Destruction'); settle(g); choose(g, 'bp'); passAll(g); choose(g, 'Attack Junk Synchron'); settle(g);
  ok(!inZ(g, 1, 'gy', 'Junk Synchron') && E.data(g.p[1].deck[g.p[1].deck.length - 1]).n === 'Junk Synchron', 'Junk Synchron on top of the Deck');
});
T('Ritual of Grace: untargetable this turn', () => {
  const g = duel({ board: [{ m: ['Dokurorider'], gy: ['Ritual of Grace'] }, {}] });
  use(g, 'Ritual of Grace'); settle(g); ok(L.has(g, on(g, 0, 'Dokurorider'), 'cantBeTargeted'), 'Dokurorider untargetable');
});
T('Rocket Jumper attacks directly over Defense monsters only', () => {
  const g = duel({ board: [{ m: ['Rocket Jumper'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); ok(hasOpt(g, 'Attack directly'), 'direct attack offered');
  const h = duel({ board: [{ m: ['Rocket Jumper'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }], st: ['Trap Hole'] }] });
  choose(h, 'bp'); passAll(h); ok(!hasOpt(h, 'Attack directly'), 'not with a Spell/Trap');
});
T('Rocket Pilder: survives the attack and cuts the target’s ATK', () => {
  const g = duel({ board: [{ m: ['Rocket Jumper'], st: [{ n: 'Rocket Pilder', pos: 'up' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  g.p[0].st[0].equipTo = g.p[0].m[0].u;
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Cyber Dragon'); settle(g);
  ok(!!on(g, 0, 'Rocket Jumper') && E.atk(g, on(g, 1, 'Cyber Dragon')) === 1100, 'Rocket Jumper stays, Cyber Dragon 1100');
});
T('Rocket Warrior: no destruction or damage on your turn, -500', () => {
  const g = duel({ board: [{ m: ['Rocket Warrior'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Cyber Dragon'); settle(g);
  ok(!!on(g, 0, 'Rocket Warrior') && g.p[0].lp === 8000 && E.atk(g, on(g, 1, 'Cyber Dragon')) === 1600, 'Rocket Warrior stays, no damage, Cyber Dragon 1600');
});
T("Rod of Silence negates a Spell targeting the equipped monster", () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['Cyber Dragon'], st: [{ n: "Rod of Silence - Kay'est", pos: 'up' }] }] });
  g.p[1].st[0].equipTo = g.p[1].m[0].u;
  use(g, 'Book of Moon'); settle(g);   // a continuous negation as Book of Moon resolves (2026-11-28 audit, E4b), not a chain link
  ok(on(g, 1, 'Cyber Dragon').pos === 'atk' && E.def(g, on(g, 1, 'Cyber Dragon')) === 2100 && g.p[0].gy.some(c => E.name(c) === 'Book of Moon'), 'Book of Moon negated and destroyed, +500 DEF');
});
T('Royal Command negates Flip effects', () => {
  const g = duel({ board: [{ m: [{ n: 'Princess of Tsurugi', pos: 'set' }], turn: 2 }, { st: [{ n: 'Royal Command', pos: 'up' }, 'Trap Hole'] }] });
  choose(g, 'flip:'); settle(g); ok(g.p[1].lp === 8000, 'no Flip damage');
});
T('Royal Firestorm Guards shuffles 4 Pyros and draws 2', () => {
  const g = duel({ board: [{ hand: ['Royal Firestorm Guards'], gy: ['Blazing Inpachi', 'Burning Algae', 'Burning Beast', 'Charcoal Inpachi'] }, {}] });
  const n = g.p[0].hand.length; choose(g, 'ns:'); settle(g);
  ok(g.p[0].gy.length === 0 && g.p[0].hand.length === n + 1, 'GY empty, 2 drawn');
});
T('Royal Keeper flips down and gains 300 when flipped up', () => {
  const g = duel({ board: [{ m: ['Royal Keeper'], turn: 2 }, {}] });
  use(g, 'Royal Keeper'); settle(g); ok(on(g, 0, 'Royal Keeper').pos === 'set', 'face-down');
  choose(g, 'end'); settle(g); choose(g, 'end'); settle(g);
  choose(g, 'flip:'); settle(g); ok(E.atk(g, on(g, 0, 'Royal Keeper')) === 1900, 'Royal Keeper 1900');
});
T('Royal Knight gains the DEF of what it destroys', () => {
  const g = duel({ board: [{ m: ['Royal Knight'], turn: 2 }, { m: [{ n: 'Return Zombie', pos: 'atk' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Return Zombie'); settle(g); ok(g.p[0].lp === 8000 + 1600, `gained 1600 (${g.p[0].lp})`);
});
T('Royal Magical Library counts Spells and draws', () => {
  const g = duel({ board: [{ hand: ['Red Medicine', 'Red Medicine', 'Red Medicine'], m: ['Royal Magical Library'] }, {}] });
  for (let i = 0; i < 3; i++) { use(g, 'Red Medicine'); settle(g); }
  const n = g.p[0].hand.length; ok(g.p[0].lp === 9500, 'gained 1500'); use(g, 'Royal Magical Library'); settle(g); ok(g.p[0].hand.length === n + 1, 'drew 1');
});
T('Royal Surrender negates a Continuous Trap', () => {
  const g = duel({ board: [{ st: ['Release from Stone'], ban: ['Rocket Jumper'], turn: 2 }, { st: ['Royal Surrender'] }] });
  use(g, 'Release from Stone'); use(g, 'Royal Surrender'); settle(g);
  ok(!on(g, 0, 'Rocket Jumper') && inZ(g, 0, 'gy', 'Release from Stone'), 'negated and destroyed');
});
T('Royal Writ of Taxation burns the opponent if the card isn’t used', () => {
  const g = duel({ board: [{ st: ['Royal Writ of Taxation'] }, { hand: [FILL] }] });
  choose(g, 'end'); settle(g, 3); if (g.prompt && g.prompt.type === 'yesno') choose(g, 'yes'); settle(g);
  ok(inZ(g, 0, 'gy', 'Royal Writ of Taxation'), 'activated in their Standby Phase');
  // B Normal Summons the Warwolf: A takes 1000 at the end of A's next turn
  if (hasOpt(g, 'ns:')) choose(g, 'ns:'); settle(g); choose(g, 'end'); settle(g); choose(g, 'end'); settle(g);
  ok(g.p[0].lp === 7000, `A took 1000 because the card was summoned (${g.p[0].lp})`);
});

console.log(fails ? `\n${fails} failed` : '\nAll full-13 checks passed.');
process.exit(fails ? 1 : 0);
