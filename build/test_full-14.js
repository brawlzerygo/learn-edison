// Scenario checks for full pool batch 14: node build/test_full-14.js
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
const lp = g => `A ${g.p[0].lp}, B ${g.p[1].lp}`;

T('Ryu Kokki destroys a Warrior after the battle', () => {
  const g = duel({ board: [{ m: ['Ryu Kokki'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Ryu Kokki'), g.p[1].m[0]); auto(g);
  ok(inZ(g, 1, 'gy', 'Big Shield Gardna'), 'Big Shield Gardna destroyed by Ryu Kokki');
});
T('Ryu Senshi pays 1000 to negate Mirror Force', () => {
  const g = duel({ board: [{ m: ['Ryu Senshi'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }], st: ['Mirror Force'] }] });
  goBP(g); attack(g, on(g, 0, 'Ryu Senshi'), g.p[1].m[0]);
  choose(g, 'Mirror Force', 1); ok(hasOpt(g, 'Normal Trap'), 'Ryu Senshi offered'); choose(g, 'Normal Trap'); auto(g);
  ok(on(g, 0, 'Ryu Senshi') && g.p[0].lp === 7000, `Ryu Senshi survives, A paid 1000 (${lp(g)})`);
});
T('Ryu-Kishin Clown changes a position', () => {
  const g = duel({ board: [{ hand: ['Ryu-Kishin Clown'] }, { m: [FILL] }] });
  choose(g, 'ns:'); passAll(g); choose(g, FILL); auto(g);
  ok(on(g, 1, FILL).pos === 'def', 'Warwolf in Defense Position');
});
T('Sasuke Samurai destroys a face-down monster without flipping it', () => {
  const g = duel({ board: [{ m: ['Sasuke Samurai'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Sasuke Samurai'), g.p[1].m[0]); auto(g);
  ok(inZ(g, 1, 'gy', 'Big Shield Gardna') && g.p[0].lp === 8000, `Gardna destroyed, no damage (${lp(g)})`);
});
T('Sasuke Samurai 2 stops Spells and Traps', () => {
  const g = duel({ board: [{ m: ['Sasuke Samurai 2'], st: ['Mystical Space Typhoon'] }, { st: ['Mirror Force'] }] });
  eff(g, on(g, 0, 'Sasuke Samurai 2'), 0); auto(g);
  ok(g.p[0].lp === 7200 && !hasOpt(g, 'a:' + st(g, 0, 'Mystical Space Typhoon').u + ':'), 'paid 800, MST cannot be activated');
});
T('Sasuke Samurai 3 makes the opponent draw to 7', () => {
  const g = duel({ board: [{ m: ['Sasuke Samurai 3'], turn: 2 }, { hand: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Sasuke Samurai 3'), null); auto(g);
  ok(g.p[1].hand.length === 7, `B has 7 cards (${g.p[1].hand.length})`);
});
T('Sasuke Samurai 4 tosses a coin at the start of the Damage Step', () => {
  const g = duel({ board: [{ m: ['Sasuke Samurai 4'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Sasuke Samurai 4'), g.p[1].m[0]); auto(g);
  ok(g.log.some(l => /tossed a coin/.test(l)), 'a coin was tossed');
});
T('Secret Pass lets a 1000 ATK monster attack directly', () => {
  const g = duel({ board: [{ hand: ['Secret Pass to the Treasures'], m: ['Sasuke Samurai 3'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Secret Pass to the Treasures'); auto(g); goBP(g);
  ok(hasOpt(g, `atk:${on(g, 0, 'Sasuke Samurai 3').u}:d`), 'direct attack offered');
});
T('Secret Village stops the opponent’s Spells', () => {
  const g = duel({ board: [{ m: ['Dark Magician'] }, { st: ['Mystical Space Typhoon'] }] });
  const sv = E.lib.forbid; const g2 = g; const village = C.find(x => x.n === 'Secret Village of the Spellcasters');
  const g3 = duel({ board: [{ hand: ['Secret Village of the Spellcasters'], m: ['Dark Magician'] }, { st: ['Mystical Space Typhoon'] }] });
  act(g3, 0, 'Secret Village of the Spellcasters'); auto(g3);
  const mst = st(g3, 1, 'Mystical Space Typhoon');
  ok(sv(g3, { type: 'activate', c: mst, eff: E.SCRIPTS['Mystical Space Typhoon'].effs[0], p: 1 }), 'B cannot activate MST');
});
T('Shadow Delver gives a DARK a direct attack', () => {
  const g = duel({ board: [{ m: ['Shadow Delver', 'Archfiend Soldier'], turn: 2 }, { m: [FILL] }] });
  const sd = on(g, 0, 'Shadow Delver'); choose(g, 'gem:' + sd.u); auto(g);
  eff(g, sd, 1); choose(g, 'Archfiend Soldier'); auto(g); goBP(g);
  ok(hasOpt(g, `atk:${on(g, 0, 'Archfiend Soldier').u}:d`), 'direct attack offered');
});
T('Shadow of Eyes flips a Set monster', () => {
  const g = duel({ board: [{ hand: [FILL] }, { st: ['Shadow of Eyes'] }] });
  choose(g, 'set:'); auto(g);
  ok(g.p[0].m[0] && g.p[0].m[0].pos === 'atk', 'the Set monster is in Attack Position');
});
T('Shadow Spell on a face-up monster', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: ['Shadow Spell'] }] });
  goBP(g); const w = on(g, 0, FILL); attack(g, w, null); choose(g, 'Shadow Spell', 1); auto(g);
  ok(E.atk(g, w) === 1300 && E.lib.forbid(g, { type: 'attack', c: w }) && g.p[1].lp === 8000, `Warwolf 1300 ATK, the attack stopped (${lp(g)})`);
});
T('Shield Warrior keeps a monster alive', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: [{ n: FILL }], gy: ['Shield Warrior'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, FILL));
  for (let i = 0; i < 10 && g.prompt && !hasOpt(g, 'Banish: your'); i++) E.act(g, ['pass']);
  ok(hasOpt(g, 'Banish: your'), 'Shield Warrior offered'); choose(g, 'Banish: your'); auto(g);
  ok(on(g, 1, FILL) && !on(g, 0, FILL) && inZ(g, 1, 'ban', 'Shield Warrior'), 'B keeps its Warwolf, A loses its own');
  ok(!on(g, 1, FILL).flags.noBattleDestroy, 'the protection ended');
});
T('Shield Wing survives two battles', () => {
  const g = duel({ board: [{ m: [FILL, FILL, FILL], turn: 2 }, { m: [{ n: 'Shield Wing', pos: 'def' }] }] });
  goBP(g); const [a, b, c] = g.p[0].m;
  attack(g, a, on(g, 1, 'Shield Wing')); auto(g); attack(g, b, on(g, 1, 'Shield Wing')); auto(g);
  ok(on(g, 1, 'Shield Wing'), 'Shield Wing still there after 2 battles');
  attack(g, c, on(g, 1, 'Shield Wing')); auto(g);
  ok(inZ(g, 1, 'gy', 'Shield Wing'), 'destroyed by the third');
});
T('Shield Worm goes to Defense and mills', () => {
  const g = duel({ board: [{ hand: ['Shield Worm'], m: ['Man-Eater Bug'] }, {}] });
  const d = g.p[1].deck.length; choose(g, 'ns:'); auto(g);
  ok(on(g, 0, 'Shield Worm').pos === 'def' && g.p[1].deck.length === d - 2, `Defense, 2 milled (${d - g.p[1].deck.length})`);
});
T('Shooting Star Bow - Ceal gives a direct attack', () => {
  const g = duel({ board: [{ hand: ['Shooting Star Bow - Ceal'], m: [FILL], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Shooting Star Bow - Ceal'); choose(g, 'u' + g.p[0].m[0].u); auto(g); goBP(g);
  ok(E.atk(g, on(g, 0, FILL)) === 1000 && hasOpt(g, `atk:${on(g, 0, FILL).u}:d`), '1000 ATK and a direct attack');
});
T('Silent Abyss destroys face-down and non-WATER monsters', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon', 'Penguin Soldier'], turn: 2 }, { m: ['Silent Abyss', 'Penguin Soldier', { n: 'Penguin Soldier', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Blue-Eyes White Dragon'), on(g, 1, 'Silent Abyss')); auto(g);
  ok(!on(g, 0, 'Blue-Eyes White Dragon') && on(g, 0, 'Penguin Soldier') && g.p[1].m.filter(Boolean).length === 1, 'BEWD and the face-down monster destroyed');
});
T('Silent Doom summons a Normal Monster that cannot attack', () => {
  const g = duel({ board: [{ hand: ['Silent Doom'], gy: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Silent Doom'); auto(g); const w = on(g, 0, FILL);
  ok(w && w.pos === 'def' && E.lib.has(g, w, 'cantAttack'), 'Warwolf in Defense, cannot attack');
});
T('Silent Insect turns to Defense', () => {
  const g = duel({ board: [{ hand: ['Silent Insect', FILL] }, { st: [{ n: 'Skull Invitation', pos: 'up' }] }] });
  choose(g, 'ns:'); auto(g);
  ok(on(g, 0, 'Silent Insect').pos === 'def', 'Silent Insect in Defense Position');
});
T('Skull Invitation burns per card sent to the GY', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [FILL, FILL] }, { m: [FILL], st: [{ n: 'Skull Invitation', pos: 'up' }] }] });
  act(g, 0, 'Dark Hole'); auto(g);
  ok(g.p[0].lp === 7100 && g.p[1].lp === 7700, `A took 900 (2 monsters + Dark Hole), B 300 (${lp(g)})`);
});
T('Silent Insect negates Skull Invitation', () => {
  const g = duel({ board: [{ hand: ['Soul of the Pure'], m: ['Silent Insect'] }, { st: [{ n: 'Skull Invitation', pos: 'up' }] }] });
  act(g, 0, 'Soul of the Pure'); auto(g);
  ok(g.p[0].lp === 8800, `gained 800, no Skull Invitation damage (${lp(g)})`);
});
T('Silent Magician LV4 counts draws and becomes LV8', () => {
  const g = duel({ board: [{ m: ['Silent Magician LV4'], hand: ['Silent Magician LV8'] }, {}] });
  const m = on(g, 0, 'Silent Magician LV4');
  for (let i = 0; i < 6; i++) { if (g.prompt && g.prompt.type === 'idle' && g.tp === 0) choose(g, 'end'); auto(g); if (g.tp === 1 && g.prompt && g.prompt.type === 'idle') choose(g, 'end'); auto(g); if (on(g, 0, 'Silent Magician LV8')) break; }
  ok(on(g, 0, 'Silent Magician LV8'), `LV8 summoned (counters reached ${E.lib.ctr(m, 'spell')})`);
  const g2 = duel({ board: [{}, { gy: ['Silent Magician LV8'] }] });
  ok(E.lib.forbid(g2, { type: 'ss', c: g2.p[1].gy[0], p: 1 }), 'LV8 cannot be revived');
});
T('Silent Strider lowers a Level', () => {
  const g = duel({ board: [{ hand: ['Silent Strider'], m: [FILL] }, {}] });
  eff(g, g.p[0].hand[0], 0); auto(g);
  ok(E.lv(on(g, 0, FILL)) === 3 && inZ(g, 0, 'gy', 'Silent Strider'), 'Warwolf is Level 3');
});
T('Silent Swordsman LV3 to LV5 to LV7', () => {
  const g = duel({ board: [{ m: ['Silent Swordsman LV3'], hand: ['Silent Swordsman LV5', 'Silent Swordsman LV7'] }, {}] });
  auto(g);
  ok(on(g, 0, 'Silent Swordsman LV5'), 'LV5 summoned in the Standby Phase');
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  goBP(g); attack(g, on(g, 0, 'Silent Swordsman LV5'), null); auto(g); choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  const l7 = on(g, 0, 'Silent Swordsman LV7');
  ok(l7, 'LV7 summoned after the direct hit');
  const g2 = duel({ board: [{ m: ['Silent Swordsman LV7'], hand: ['Soul of the Pure'] }, {}] });
  ok(!hasOpt(g2, 'a:' + g2.p[0].hand[0].u + ':'), 'LV7 stops Spell activations');
  const g3 = duel({ board: [{}, { gy: ['Silent Swordsman LV7'] }] }); auto(g3);
  ok(E.lib.forbid(g3, { type: 'ss', c: g3.p[1].gy[0], p: 1 }), 'LV7 cannot be revived');
});
T('Sinister Seeds summons tokens for the battle damage', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['Penguin Soldier'], st: ['Sinister Seeds'] }] });
  goBP(g); attack(g, on(g, 0, 'Blue-Eyes White Dragon'), on(g, 1, 'Penguin Soldier')); auto(g);
  ok(cnt(g, 1, 'm', 'Sinister Seed Token') === 4, `2250 damage gives 4 tokens (${cnt(g, 1, 'm', 'Sinister Seed Token')})`);
});
// Errata audit (2026-11-26): the 2010 card has no banish clause, so it stays in the GY and comes back again.
T('Sinister Serpent returns, and is not banished (original text)', () => {
  const g = duel({ board: [{ gy: ['Sinister Serpent'], turn: 2 }, {}] });
  auto(g);
  ok(inZ(g, 0, 'hand', 'Sinister Serpent'), 'back in the hand');
  const sp = g.p[0].hand.find(c => E.name(c) === 'Sinister Serpent'); E.lib.move(g, sp, 'gy', { reason: 'discard' });
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(!inZ(g, 0, 'ban', 'Sinister Serpent'), 'not banished in the opponent’s End Phase');
});
T('Sinister Sprocket destroys a Spell after a DARK Synchro', () => {
  const g = duel({ ex0: ['Dark Strike Fighter'], board: [{ m: ['Sinister Sprocket', 'Dark Ruler Ha Des'] }, { st: [{ n: 'Skull Invitation', pos: 'up' }] }] });
  choose(g, 'syn:'); auto(g);
  ok(on(g, 0, 'Dark Strike Fighter') && inZ(g, 1, 'gy', 'Skull Invitation'), 'Skull Invitation destroyed');
});
T('Skull Archfiend of Lightning pays 500 each Standby Phase', () => {
  const g = duel({ board: [{ m: ['Skull Archfiend of Lightning'], turn: 2 }, {}] });
  ok(g.p[0].lp === 7500, `paid 500 (${lp(g)})`);
});
T('Skull Archfiend rolls against a targeting effect', () => {
  const g = duel({ seed: 3, board: [{ hand: ['Brain Control'] }, { m: ['Skull Archfiend of Lightning'] }] });
  act(g, 0, 'Brain Control'); choose(g, 'Roll a die', 1); auto(g);
  ok(g.log.some(l => /rolled a/.test(l)), 'a die was rolled');
});
T('Skull Conductor summons Zombies with 2000 ATK and dies at the end of the Battle Phase', () => {
  const g = duel({ board: [{ hand: ['Skull Conductor', 'Vampire Lord', 'Zombie Master', 'Spirit Reaper'], m: ['Skull Conductor'], turn: 2 }, {}] });
  eff(g, g.p[0].hand[0], 1); auto(g);
  ok(on(g, 0, 'Vampire Lord'), 'Vampire Lord (2000 ATK) summoned');
  goBP(g); choose(g, 'endbp'); auto(g);
  ok(!on(g, 0, 'Skull Conductor'), 'the face-up Skull Conductor was destroyed');
});
T('Skull Flame summons Burning Skull Head and skips the Battle Phase', () => {
  const g = duel({ board: [{ hand: ['Burning Skull Head'], m: ['Skull Flame'], turn: 2 }, {}] });
  eff(g, on(g, 0, 'Skull Flame'), 0); auto(g);
  ok(on(g, 0, 'Burning Skull Head') && g.p[1].lp === 7000 && !hasOpt(g, 'bp'), `summoned, 1000 damage, no Battle Phase (${lp(g)})`);
});
T('Skull Flame adds Burning Skull Head instead of drawing', () => {
  const g = duel({ board: [{ m: ['Skull Flame'], gy: ['Burning Skull Head'], turn: 2 }, {}] });
  auto(g);
  ok(inZ(g, 0, 'hand', 'Burning Skull Head') && g.p[0].hand.length === 6, `added it, hand ${g.p[0].hand.length}`);
});
T('Skull Knight 2 summons a copy when Tributed for a Fiend', () => {
  const g = duel({ board: [{ hand: ['Dark Ruler Ha Des'], m: ['Skull Knight 2'], deckTop: [FILL, 'Skull Knight 2'] }, {}] });
  choose(g, 'ns:'); auto(g);
  ok(on(g, 0, 'Dark Ruler Ha Des') && on(g, 0, 'Skull Knight 2'), 'Ha Des and a new Skull Knight 2');
});
T('Skull Lair banishes 4 to destroy a Level 4', () => {
  const g = duel({ board: [{ st: [{ n: 'Skull Lair', pos: 'up' }], gy: [FILL, FILL, FILL, FILL] }, { m: [FILL] }] });
  eff(g, st(g, 0, 'Skull Lair'), 1); auto(g);
  ok(!on(g, 1, FILL) && g.p[0].ban.length === 4, 'Warwolf destroyed, 4 banished');
});
T('Skull-Mark Ladybug gains 1000', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'] }, { m: ['Skull-Mark Ladybug'] }] });
  act(g, 0, 'Dark Hole'); auto(g);
  ok(g.p[1].lp === 9000, `B 9000 (${lp(g)})`);
});
T('Snake Deity’s Command negates a Spell', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [FILL] }, { hand: ['Venom Snake'], m: [FILL], st: ['Snake Deity\'s Command'] }] });
  act(g, 0, 'Dark Hole'); choose(g, 'Snake Deity', 1); auto(g);
  ok(on(g, 0, FILL) && inZ(g, 0, 'gy', 'Dark Hole'), 'Dark Hole negated');
});
T('Snake Rain sends 4 Reptiles', () => {
  const g = duel({ board: [{ hand: ['Snake Rain', FILL], deckTop: [FILL, 'Venom Snake', 'Venom Cobra', 'Venom Snake', 'Venom Cobra'] }, {}] });
  act(g, 0, 'Snake Rain'); auto(g);
  ok(g.p[0].gy.filter(c => E.lib.race(c) === 'Reptile').length === 4, 'four Reptiles in the GY');
});
T('Snake Whistle summons a Reptile when one is destroyed', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'] }, { m: ['Venom Cobra'], st: ['Snake Whistle'], deckTop: ['Venom Snake'] }] });
  act(g, 0, 'Dark Hole'); auto(g);
  ok(on(g, 1, 'Venom Snake'), 'Venom Snake summoned');
});
T('Sonic Bird adds a Ritual Spell', () => {
  const g = duel({ board: [{ hand: ['Sonic Bird'], deckTop: [FILL, 'Black Luster Ritual'] }, {}] });
  choose(g, 'ns:'); auto(g);
  ok(inZ(g, 0, 'hand', 'Black Luster Ritual'), 'added Black Luster Ritual');
});
T('Sonic Chick survives a 1900+ ATK attacker', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: [{ n: 'Sonic Chick', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Sonic Chick')); auto(g);
  ok(on(g, 1, 'Sonic Chick'), 'Sonic Chick still there');
});
T('Sonic Jammer stops the opponent’s Spells', () => {
  const g = duel({ board: [{ m: [{ n: 'Sonic Jammer', pos: 'set' }], turn: 2 }, { hand: ['Dark Hole'] }] });
  choose(g, 'flip:'); auto(g);
  const dh = g.p[1].hand.find(c => E.name(c) === 'Dark Hole');
  ok(E.lib.forbid(g, { type: 'activate', c: dh, eff: E.SCRIPTS['Dark Hole'] ? E.SCRIPTS['Dark Hole'].effs[0] : { type: 'act' }, p: 1 }), 'B cannot activate Dark Hole');
});
T('Sonic Shooter attacks directly for its original ATK', () => {
  const g = duel({ board: [{ m: ['Sonic Shooter'], turn: 2 }, { m: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Sonic Shooter'), null); auto(g);
  ok(g.p[1].lp === 6700, `B took 1300 (${lp(g)})`);
});
T('Soul Absorption gains 500 per banished card', () => {
  const g = duel({ board: [{ st: [{ n: 'Soul Absorption', pos: 'up' }, { n: 'Skull Lair', pos: 'up' }], gy: [FILL, FILL, FILL, FILL] }, { m: [FILL] }] });
  eff(g, st(g, 0, 'Skull Lair'), 1); auto(g);
  ok(g.p[0].lp === 10000, `A gained 2000 (${lp(g)})`);
});
T('Soul Demolition banishes one from each GY', () => {
  const g = duel({ board: [{ m: ['Archfiend Soldier'], st: [{ n: 'Soul Demolition', pos: 'up' }], gy: [FILL] }, { gy: ['Penguin Soldier'] }] });
  eff(g, st(g, 0, 'Soul Demolition'), 1); auto(g);
  ok(g.p[0].lp === 7500 && inZ(g, 1, 'ban', 'Penguin Soldier') && inZ(g, 0, 'ban', FILL), 'paid 500, both banished');
});
T('Soul of Fire burns half a Pyro’s ATK', () => {
  const g = duel({ board: [{ hand: ['Soul of Fire'], deckTop: [FILL, 'Fire Princess'], turn: 2 }, {}] });
  const h = g.p[1].hand.length; act(g, 0, 'Soul of Fire'); auto(g);
  ok(g.p[1].lp === 7350 && g.p[1].hand.length === h + 1 && inZ(g, 0, 'ban', 'Fire Princess'), `B drew 1 and took 650 (${lp(g)})`);
});
T('Soul of Purity and Light: its summon rule and the Battle Phase ATK loss', () => {
  const g = duel({ board: [{ hand: ['Soul of Purity and Light'], gy: ['Hysteric Fairy', 'Shining Angel'] }, { m: [FILL] }] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Soul of Purity and Light').u), 'cannot be Normal Summoned'); choose(g, 'sp:'); auto(g);
  const s = on(g, 0, 'Soul of Purity and Light'); ok(s && g.p[0].ban.length === 2, 'Special Summoned by banishing 2 LIGHTs');
  const w = on(g, 1, FILL); ok(E.atk(g, w) === 2000, 'no loss outside their Battle Phase');
  g.tp = 1; g.phase = 'battle'; g.seq++; ok(E.atk(g, w) === 1700, 'loses 300 in their Battle Phase'); g.tp = 0; g.phase = 'main1'; g.seq++;
});
T('Soul Resurrection summons a Normal Monster and is linked to it', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], st: ['Soul Resurrection'], gy: [FILL] }, {}] });
  act(g, 0, 'Soul Resurrection'); auto(g);
  const w = on(g, 0, FILL); ok(w && w.pos === 'def', 'Warwolf in Defense');
  act(g, 0, 'Dark Hole'); auto(g);
  ok(inZ(g, 0, 'gy', 'Soul Resurrection'), 'Soul Resurrection destroyed with it');
});
T('Soul Reversal puts a Flip monster on top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Soul Reversal'], gy: ['Man-Eater Bug'] }, {}] });
  act(g, 0, 'Soul Reversal'); auto(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Man-Eater Bug', 'Man-Eater Bug on top');
});
T('Soul Rope summons a Level 4 after a destruction by effect', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'] }, { m: [FILL], st: ['Soul Rope'], deckTop: ['Mother Grizzly'] }] });
  act(g, 0, 'Dark Hole'); auto(g);
  ok(g.p[1].lp === 7000 && g.p[1].m.some(Boolean), `paid 1000, a Level 4 summoned (${lp(g)})`);
});
T('Soul-Absorbing Bone Tower: no attack target and mills on a Zombie Special Summon', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Soul-Absorbing Bone Tower', 'Pyramid Turtle'] }] });
  goBP(g); ok(!hasOpt(g, `atk:${on(g, 0, FILL).u}:${on(g, 1, 'Soul-Absorbing Bone Tower').u}`), 'Bone Tower cannot be attacked');
  const g2 = duel({ board: [{ hand: ['Silent Doom'], gy: ['Armored Zombie'] }, { m: ['Soul-Absorbing Bone Tower'] }] });
  const d = g2.p[0].deck.length; act(g2, 0, 'Silent Doom'); auto(g2);
  ok(g2.p[0].deck.length === d - 2, `A milled 2 (${d - g2.p[0].deck.length})`);
});
T('Shadow Tamer takes a Fiend', () => {
  const g = duel({ board: [{ m: [{ n: 'Shadow Tamer (Archfiend)', pos: 'set' }], turn: 2 }, { m: ['Archfiend Soldier'] }] });
  choose(g, 'flip:'); auto(g);
  ok(on(g, 0, 'Archfiend Soldier'), 'took control of Archfiend Soldier');
});
T('Secret Barrel burns 200 per card', () => {
  const g = duel({ board: [{ st: ['Secret Barrel'] }, { hand: [FILL, FILL], m: [FILL] }] });
  act(g, 0, 'Secret Barrel'); auto(g);
  ok(g.p[1].lp === 7400, `B took 600 (${lp(g)})`);
});
console.log(fails ? `\n${fails} failed` : '\nAll full-14 checks passed.');
process.exit(fails ? 1 : 0);
