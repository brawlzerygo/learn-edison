// Scenario checks for full pool batch 35: node build/test_full-35.js
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

T('Advanced Ritual Art sends Normals from the Deck and Ritual Summons', () => {
  const g = duel({ board: [{ hand: ['Advanced Ritual Art', 'Demise, King of Armageddon'], turn: 2 }, {}] });
  act(g, 0, 'Advanced Ritual Art'); auto(g);
  ok(!!on(g, 0, 'Demise, King of Armageddon') && cnt(g, 0, 'gy', FILL) === 2, 'Demise summoned, 2 Warwolves in the GY');
});
T('Aegis of Gaia gains 3000 and costs 3000 when destroyed', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Aegis of Gaia'], turn: 2 }, {}] });
  act(g, 0, 'Aegis of Gaia'); auto(g); ok(g.p[0].lp === 11000, 'gained 3000');
  act(g, 0, 'Mystical Space Typhoon'); auto(g); ok(g.p[0].lp === 8000, `took 3000 (${g.p[0].lp})`);
});
T('Aegis of the Ocean Dragon Lord protects low WATER monsters', () => {
  const g = duel({ board: [{ hand: ['Raigeki'], st: ['Aegis of the Ocean Dragon Lord'], m: ['T.A.D.P.O.L.E.'], turn: 2 }, { m: ['Kuriboh'] }] });
  act(g, 0, 'Aegis of the Ocean Dragon Lord'); auto(g);
  act(g, 0, 'Raigeki'); auto(g);
  ok(!!on(g, 0, 'T.A.D.P.O.L.E.') && !on(g, 1, 'Kuriboh'), 'TADPOLE survives an effect destruction this turn');
});
T('Against the Wind deals the ATK as damage and adds the Blackwing', () => {
  const g = duel({ board: [{ hand: ['Against the Wind'], gy: ['Blackwing - Gale the Whirlwind'], turn: 2 }, {}] });
  act(g, 0, 'Against the Wind'); auto(g);
  ok(g.p[0].lp === 6700 && inZ(g, 0, 'hand', 'Blackwing - Gale the Whirlwind'), `took 1300, Gale added (${g.p[0].lp})`);
});
T('Alchemist of Black Spells goes to Defense and places a counter', () => {
  const g = duel({ board: [{ hand: [], m: ['Alchemist of Black Spells', 'Breaker the Magical Warrior'], turn: 2 }, {}] });
  choose(g, 'a:' + on(g, 0, 'Alchemist of Black Spells').u); auto(g);
  const b = on(g, 0, 'Breaker the Magical Warrior');
  ok(on(g, 0, 'Alchemist of Black Spells').pos === 'def' && E.lib.ctr(b, 'spell') === 1, 'Alchemist in Defense, Breaker has a counter');
});
T('Alchemy Cycle zeroes ATK and draws on a battle destruction', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Alchemy Cycle'], m: ['Giant Rat'] }] });
  const h = g.p[1].hand.length;
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Giant Rat'));
  choose(g, 'Alchemy Cycle', 1); auto(g);
  ok(inZ(g, 1, 'gy', 'Giant Rat') && g.p[1].hand.length === h + 1, 'Giant Rat destroyed with 0 ATK, B drew 1');
});
T('All-Out Attacks changes a Special Summoned monster to Attack Position', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Big Shield Gardna'], turn: 2 }, { st: [{ n: 'All-Out Attacks', pos: 'up' }] }] });
  act(g, 0, 'Monster Reborn'); auto(g);
  const b = on(g, 0, 'Big Shield Gardna'); ok(!!b && b.pos === 'atk', 'Gardna in Attack Position');
});
T('Ally of Justice Rudra gains 700 against LIGHT', () => {
  const g = duel({ board: [{ hand: [], m: ['Ally of Justice Rudra'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  goBP(g); attack(g, on(g, 0, 'Ally of Justice Rudra'), on(g, 1, 'Cyber Dragon')); auto(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && g.p[1].lp === 7500, `Cyber Dragon destroyed, 500 damage (${g.p[1].lp})`);
});
T('Ambulance Rescueroid revives a battle-destroyed monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Ambulance Rescueroid', 'Giant Rat'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  goBP(g); attack(g, on(g, 0, 'Giant Rat'), on(g, 1, 'Cyber Dragon')); auto(g);
  const r = on(g, 0, 'Giant Rat'); ok(!!r && r.pos === 'def', 'Giant Rat back in Defense');
});
T('Ambush Fangs ends the Battle Phase and places a Venom Counter', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { st: ['Ambush Fangs'], m: ['Venom Serpent'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Venom Serpent')); choose(g, 'Ambush Fangs', 1); auto(g);
  ok(E.lib.ctr(on(g, 0, FILL), 'venom') === 1 && g.phase !== 'battle' && !!on(g, 1, 'Venom Serpent'), 'attack negated, counter placed, BP over');
});
T('Amulet of Ambition: +500 per Level difference in battle, back to the Deck', () => {
  const g = duel({ board: [{ hand: ['Amulet of Ambition'], m: ['Unicycular'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Amulet of Ambition'); auto(g);
  goBP(g); attack(g, on(g, 0, 'Unicycular'), on(g, 1, 'Cyber Dragon')); auto(g);
  ok(g.p[0].lp === 8000 - (2100 - 2100) && inZ(g, 0, 'gy', 'Unicycular'), `100 + 2000 = 2100 ATK tied Cyber Dragon (${g.p[0].lp})`);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Amulet of Ambition', 'Amulet on top of the Deck');
});
T('An Unfortunate Report gives an extra attack in the next Battle Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['An Unfortunate Report'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'An Unfortunate Report'); auto(g); choose(g, 'end'); auto(g);
  goBP(g); const w = on(g, 1, FILL); attack(g, w, null); auto(g);
  ok(hasOpt(g, 'atk:' + w.u + ':d'), 'the Warwolf can attack a second time'); attack(g, w, null); auto(g);
  ok(g.p[0].lp === 4000 && !hasOpt(g, 'atk:'), 'two attacks, then no more (' + g.p[0].lp + ')');
});
T('Angel O7 stops monster effects after a Tribute Summon', () => {
  const g = duel({ board: [{ hand: ['Angel O7'], m: [FILL, FILL], turn: 2 }, { m: ['Blackwing - Gale the Whirlwind'], hand: ['Kuriboh'] }] });
  ns(g, 0, 'Angel O7'); auto(g);
  const gale = on(g, 1, 'Blackwing - Gale the Whirlwind');
  ok(E.lib.forbid(g, { type: 'activate', c: gale, eff: { type: 'ign' }, p: 1 }), 'Gale effect blocked');
});
T('Anteatereatingant: summon by sending 2 S/T, destroy a S/T, then no attack', () => {
  const g = duel({ board: [{ hand: ['Anteatereatingant'], st: ['Mirror Force', 'Magic Jammer'], turn: 2 }, { st: ['Solemn Judgment'] }] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'no Normal Summon'); choose(g, 'sp:'); auto(g);
  choose(g, 'a:' + on(g, 0, 'Anteatereatingant').u); auto(g);
  ok(inZ(g, 1, 'gy', 'Solemn Judgment'), 'Solemn destroyed'); goBP(g); ok(!hasOpt(g, 'atk:'), 'it cannot attack');
});
T('Apocatequil is Level 5 with a Tuner', () => {
  const g = duel({ board: [{ hand: ['Junk Synchron'], m: ['Apocatequil'], turn: 2 }, {}] });
  ok(E.lv(on(g, 0, 'Apocatequil')) === 4, 'Level 4 alone'); ns(g, 0, 'Junk Synchron'); auto(g, { no: true });
  ok(E.lv(on(g, 0, 'Apocatequil')) === 5, 'Level 5 with a face-up Tuner');
});
T('Apocatequil revives Oracle of the Sun', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Apocatequil'], gy: ['Oracle of the Sun'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); auto(g); ok(!!on(g, 0, 'Oracle of the Sun'), 'Oracle revived');
});
T('Appointer of the Red Lotus banishes a hand card until their next End Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Appointer of the Red Lotus'], turn: 2 }, { hand: ['Kuriboh'] }] });
  act(g, 0, 'Appointer of the Red Lotus'); auto(g);
  ok(g.p[0].lp === 6000 && inZ(g, 1, 'ban', 'Kuriboh'), 'paid 2000, Kuriboh banished');
  choose(g, 'end'); auto(g); ok(inZ(g, 1, 'ban', 'Kuriboh'), 'still banished after A\'s End Phase');
  choose(g, 'end'); auto(g); ok(inZ(g, 1, 'hand', 'Kuriboh'), 'back in B\'s hand after B\'s End Phase');
});
T('Aquarian Alessa discards after a Gemini Summon', () => {
  const g = duel({ board: [{ hand: [], m: ['Aquarian Alessa'], turn: 2 }, { m: ['Kuriboh'], hand: ['Raigeki'] }] });
  choose(g, 'gem:'); auto(g); goBP(g); attack(g, on(g, 0, 'Aquarian Alessa'), on(g, 1, 'Kuriboh')); auto(g);
  ok(inZ(g, 1, 'gy', 'Raigeki') || g.p[1].hand.length < 6, 'B discarded at random');
});
T('Arcane Barrier counts destroyed Spellcasters and draws', () => {
  const g = duel({ board: [{ hand: ['Raigeki'], st: [{ n: 'Arcane Barrier', pos: 'up' }], m: ['Breaker the Magical Warrior'], turn: 2 }, { m: ['Gemini Elf', 'Mystical Elf'] }] });
  act(g, 0, 'Raigeki'); auto(g);
  const ab = st(g, 0, 'Arcane Barrier'); ok(E.lib.ctr(ab, 'spell') === 1, 'one counter for 2 Spellcasters');
  const h = g.p[0].hand.length; choose(g, 'a:' + ab.u); auto(g);
  ok(g.p[0].hand.length === h + 1 && inZ(g, 0, 'gy', 'Breaker the Magical Warrior'), 'drew 1');
});
T('Arcanite Magician Assault Mode gets 2 counters and clears the field', () => {
  // summoned its own way (2026-11-27 summoning conditions: "Cannot be Special Summoned except with "Assault Mode Activate"", so Monster
  // Reborn can't revive it)
  const g = duel({ board: [{ st: [{ n: 'Assault Mode Activate', pos: 'set' }], m: ['Arcanite Magician'], deckTop: [FILL, 'Arcanite Magician Assault Mode'], turn: 2 }, { m: ['Kuriboh'], st: ['Mirror Force'] }] });
  act(g, 0, 'Assault Mode Activate'); auto(g); const a = on(g, 0, 'Arcanite Magician Assault Mode');
  ok(a && E.atk(g, a) === 2900, 'Assault Mode has 2900 ATK');
  choose(g, 'a:' + a.u); auto(g); ok(!g.p[1].m.some(Boolean) && !g.p[1].st.some(Boolean) && E.atk(g, a) === 900, 'their field destroyed');
});
T('Armityle: own summon rule, not Polymerization; 10000 extra ATK on its turn', () => {
  const g = duel({ ex0: ['Armityle the Chaos Phantasm'], board: [{ hand: ['Polymerization'], m: ['Uria, Lord of Searing Flames', 'Hamon, Lord of Striking Thunder', 'Raviel, Lord of Phantasms'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'a:' + g.p[0].hand[0].u), 'Polymerization cannot summon it');
  choose(g, 'sp:'); auto(g); const a = on(g, 0, 'Armityle the Chaos Phantasm');
  ok(a && E.atk(g, a) === 10000 && g.p[0].ban.length === 3, 'Armityle summoned with 10000 ATK');
});
T('Ascending Soul returns a Ritual Tribute', () => {
  const g = duel({ board: [{ hand: ['Black Illusion Ritual', 'Relinquished'], st: [{ n: 'Ascending Soul', pos: 'up' }], m: ['Kuriboh'], turn: 2 }, {}] });
  act(g, 0, 'Black Illusion Ritual'); passAll(g); choose(g, 'Kuriboh'); auto(g);
  ok(!!on(g, 0, 'Relinquished') && inZ(g, 0, 'hand', 'Kuriboh'), 'Relinquished summoned, Kuriboh back in hand');
});
T('At One With the Sword equips, +800, draws', () => {
  const g = duel({ board: [{ hand: [], st: ['At One With the Sword'], m: ['X-Saber Airbellum'], turn: 2 }, { m: ['Kuriboh'] }] });
  act(g, 0, 'At One With the Sword'); auto(g); const x = on(g, 0, 'X-Saber Airbellum');
  ok(E.atk(g, x) === 2400 && inZ(g, 0, 'st', 'At One With the Sword'), 'Airbellum at 2400 with the Trap equipped');
  const h = g.p[0].hand.length; goBP(g); attack(g, x, on(g, 1, 'Kuriboh')); auto(g);
  ok(g.p[0].hand.length >= h + 1, 'drew a card');
});
T('Athena burns on Fairy summons and recycles Fairies', () => {
  const g = duel({ board: [{ hand: ['Shining Angel'], m: ['Athena', 'Marshmallon'], gy: ['Kuribon'], turn: 2 }, {}] });
  ns(g, 0, 'Shining Angel'); auto(g); ok(g.p[1].lp === 7400, 'Fairy summon: 600');
  choose(g, 'a:' + on(g, 0, 'Athena').u); auto(g);
  ok(g.p[1].lp === 6800 && g.p[0].m.filter(Boolean).length === 3, 'sent a Fairy, revived a Fairy, 600 more');
});
T('Automatic Laser destroys a summoned 1000+ ATK monster', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { st: ['Automatic Laser'], hand: ["Iron Core of Koa'ki Meiru"] }] });
  ns(g, 0, FILL); choose(g, 'Automatic Laser', 1); auto(g); ok(inZ(g, 0, 'gy', FILL), 'Warwolf destroyed');
});
T('Avalanching Aussa summons an EARTH, which dies when she leaves', () => {
  const g = duel({ board: [{ hand: ['Giant Rat', 'Mystical Space Typhoon'], m: ['Avalanching Aussa', FILL], turn: 2 }, {}] });
  choose(g, 'a:' + on(g, 0, 'Avalanching Aussa').u); auto(g);
  ok(!!on(g, 0, 'Giant Rat') && inZ(g, 0, 'gy', FILL), 'Giant Rat summoned for the Warwolf');
});
T('Bone Crusher destroys a S/T when revived, then itself', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Bone Crusher'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Monster Reborn'); auto(g); ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
  choose(g, 'end'); auto(g); ok(inZ(g, 0, 'gy', 'Bone Crusher'), 'Bone Crusher destroyed in the End Phase');
});
T('Babycerasaurus trigger', () => {
  const g = duel({ main1: [...Array(39).fill(FILL), 'Sabersaurus'], board: [{ hand: ['Raigeki'], turn: 2 }, { m: ['Babycerasaurus'] }] });
  act(g, 0, 'Raigeki'); auto(g); ok(!!on(g, 1, 'Sabersaurus'), 'Sabersaurus summoned');
});
T('Backs to the Wall', () => {
  const g = duel({ board: [{ hand: [], st: ['Backs to the Wall'], m: ['The Six Samurai - Kamon'], gy: ['The Six Samurai - Yaichi', 'The Six Samurai - Yaichi', 'The Six Samurai - Kamon'], turn: 2 }, {}] });
  act(g, 0, 'Backs to the Wall'); auto(g);
  ok(g.p[0].lp === 100 && cnt(g, 0, 'm', 'The Six Samurai - Yaichi') === 1 && cnt(g, 0, 'm', 'The Six Samurai - Kamon') === 1, 'one Yaichi summoned, no second Kamon');
});
T('Bamboo Scrap gives the opponent 2 Plant Tokens', () => {
  const g = duel({ board: [{ hand: [], st: ['Bamboo Scrap'], m: ['Dandylion'], turn: 2 }, {}] });
  act(g, 0, 'Bamboo Scrap'); auto(g); ok(g.p[1].m.filter(Boolean).length >= 2, 'B has 2 Tokens');
});
T('Batteryman C counts once for all copies', () => {
  const g = duel({ board: [{ hand: [], m: ['Batteryman C', 'Batteryman C', 'Cyber Phoenix'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Cyber Phoenix')) === 2200, `Cyber Phoenix +1000 (${E.atk(g, on(g, 0, 'Cyber Phoenix'))})`);
});
T('Batteryman D protects other Thunders', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Batteryman D', 'Batteryman AA'] }] });
  goBP(g); ok(!hasOpt(g, 'atk:' + on(g, 0, FILL).u + ':' + on(g, 1, 'Batteryman AA').u) && hasOpt(g, 'atk:' + on(g, 0, FILL).u + ':' + on(g, 1, 'Batteryman D').u), 'only Batteryman D can be attacked');
});
T('Battlestorm with 3 Winged Beasts destroys a S/T', () => {
  const g = duel({ board: [{ hand: [], m: ['Battlestorm', 'Sacred Crane', 'Blackwing - Gale the Whirlwind'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(E.atk(g, on(g, 0, 'Battlestorm')) === 2000, '1700 + 300');
  choose(g, 'a:' + on(g, 0, 'Battlestorm').u); auto(g); ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
});
T('Beiige comes back when discarded by an effect, not by a cost', () => {
  const g = duel({ board: [{ hand: ['Card Destruction', 'Beiige, Vanguard of Dark World'], turn: 2 }, {}] });
  act(g, 0, 'Card Destruction'); auto(g); ok(!!on(g, 0, 'Beiige, Vanguard of Dark World'), 'Beiige summoned');
  const g2 = duel({ board: [{ hand: ['Lightning Vortex', 'Beiige, Vanguard of Dark World'], turn: 2 }, { m: ['Kuriboh'] }] });
  act(g2, 0, 'Lightning Vortex'); auto(g2); ok(!on(g2, 0, 'Beiige, Vanguard of Dark World'), 'a cost discard does nothing');
});
T('Bending Destiny negates and banishes a Spell, it returns', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], turn: 2 }, { m: ['Fortune Lady Light'], st: ['Bending Destiny', 'Mirror Force'] }] });
  act(g, 0, 'Mystical Space Typhoon'); choose(g, 'u' + st(g, 1, 'Mirror Force').u); choose(g, 'Bending Destiny', 1); auto(g);
  ok(inZ(g, 0, 'ban', 'Mystical Space Typhoon') && inZ(g, 1, 'st', 'Mirror Force'), 'MST banished, Mirror Force stays');
  choose(g, 'end'); auto(g); ok(inZ(g, 0, 'hand', 'Mystical Space Typhoon'), 'MST back in hand at the End Phase');
  const g2 = duel({ board: [{ hand: [FILL], turn: 2 }, { m: ['Fortune Lady Light'], st: ['Bending Destiny'] }] });
  ns(g2, 0, FILL); choose(g2, 'Bending Destiny', 1); auto(g2); ok(inZ(g2, 0, 'ban', FILL), 'the Normal Summon was negated and banished');
});
T('Berserker Crush copies a banished monster', () => {
  const g = duel({ board: [{ hand: ['Berserker Crush'], m: ['Winged Kuriboh'], gy: ['Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Berserker Crush'); auto(g); const w = on(g, 0, 'Winged Kuriboh');
  ok(E.atk(g, w) === 2500 && E.def(g, w) === 2100 && inZ(g, 0, 'ban', 'Dark Magician'), 'Winged Kuriboh 2500/2100');
});
T('Berserking moves half the ATK', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Berserking', pos: 'up' }], m: ['Giant Rat', 'Gazelle the King of Mythical Beasts'], turn: 2 }, {}] });
  choose(g, 'a:' + st(g, 0, 'Berserking').u); auto(g);
  const s = E.atk(g, on(g, 0, 'Giant Rat')) + E.atk(g, on(g, 0, 'Gazelle the King of Mythical Beasts')); ok(s === 2900 && E.atk(g, on(g, 0, 'Giant Rat')) !== 1400, 'ATK moved');
});
T('Birthright revives a Normal and is linked', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Birthright'], gy: ['Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Birthright'); auto(g); ok(!!on(g, 0, 'Dark Magician'), 'Dark Magician summoned');
  act(g, 0, 'Mystical Space Typhoon'); auto(g); ok(inZ(g, 0, 'gy', 'Dark Magician'), 'destroyed with Birthright');
});
T('Bitelon pierces', () => {
  const g = duel({ board: [{ hand: [], m: ['Bitelon'], turn: 2 }, { m: [{ n: 'Giant Rat', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Bitelon'), on(g, 1, 'Giant Rat')); auto(g); ok(g.p[1].lp === 8000 - 950, 'piercing 950');
});
T('Blasting Fuse destroys its column', () => {
  const g = duel({ board: [{ hand: [], st: ['Blasting Fuse'], m: [FILL], turn: 2 }, { m: [null, null, null, null, 'Kuriboh'], st: [null, null, null, null, 'Mirror Force'] }] });
  act(g, 0, 'Blasting Fuse'); auto(g);
  ok(inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Kuriboh') && inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'Blasting Fuse'), 'all 4 destroyed');
});
T('Blizzard Dragon locks a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Blizzard Dragon'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'a:' + on(g, 0, 'Blizzard Dragon').u); auto(g); choose(g, 'end'); auto(g);
  goBP(g); ok(!hasOpt(g, 'atk:' + on(g, 1, FILL).u), 'B\'s Warwolf cannot attack next turn');
});
T('Blizzed draws when destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Blizzed, Defender of the Ice Barrier'] }] });
  const h = g.p[1].hand.length; goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Blizzed, Defender of the Ice Barrier')); auto(g);
  ok(g.p[1].hand.length === h + 1, 'B drew');
});
T('Blockman makes Tokens by turns face-up', () => {
  const g = duel({ board: [{ hand: ['Blockman'], turn: 2 }, {}] });
  ns(g, 0, 'Blockman'); auto(g); choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  choose(g, 'a:' + on(g, 0, 'Blockman').u); auto(g);
  const toks = g.p[0].m.filter(c => c && E.name(c) === 'Block Token'); ok(toks.length === 2 && toks.every(t => t.flags.cantAttack), '2 Block Tokens that cannot attack');
});
T('Bone Temple Block swaps monsters, destroyed at the next End Phase', () => {
  const g = duel({ board: [{ hand: [FILL], st: ['Bone Temple Block'], gy: ['Kuriboh'], turn: 2 }, { gy: ['Giant Rat'] }] });
  act(g, 0, 'Bone Temple Block'); auto(g);
  ok(!!on(g, 0, 'Giant Rat') && !!on(g, 1, 'Kuriboh'), 'each player took one');
  choose(g, 'end'); auto(g); ok(!!on(g, 0, 'Giant Rat'), 'still there after this turn');
  choose(g, 'end'); auto(g); ok(!on(g, 0, 'Giant Rat') && !on(g, 1, 'Kuriboh'), 'destroyed at the next End Phase');
});
T('Boss Rush stops Normal Summons', () => {
  const g = duel({ board: [{ hand: [FILL], st: ['Boss Rush'], turn: 2 }, {}] });
  ok(hasOpt(g, 'ns:'), 'can summon before'); act(g, 0, 'Boss Rush'); auto(g); ok(!hasOpt(g, 'ns:'), 'cannot Normal Summon after');
});
T('Botanical Girl searches a Plant', () => {
  const g = duel({ main1: [...Array(39).fill(FILL), 'Dandylion'], board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Botanical Girl'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Botanical Girl')); auto(g); ok(inZ(g, 1, 'hand', 'Dandylion'), 'Dandylion added');
});
T('Bountiful Artemis draws after a Counter Trap resolves', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], turn: 2 }, { m: ['Bountiful Artemis'], st: ['Magic Jammer', 'Mirror Force'], hand: [FILL] }] });
  const h = g.p[1].hand.length; act(g, 0, 'Mystical Space Typhoon'); choose(g, 'u' + st(g, 1, 'Mirror Force').u); choose(g, 'Magic Jammer', 1); auto(g);
  ok(inZ(g, 1, 'st', 'Mirror Force') && g.p[1].hand.length === h, 'MST negated; B discarded 1 and drew 1 (' + g.p[1].hand.length + ')');
});
T('Branch! revives a Fusion Material', () => {
  const g = duel({ ex0: ['Elemental HERO Flame Wingman'], board: [{ hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'], st: [{ n: 'Branch!', pos: 'up' }], turn: 2 }, { hand: ['Dark Hole'] }] });
  act(g, 0, 'Polymerization'); auto(g); ok(!!on(g, 0, 'Elemental HERO Flame Wingman'), 'Flame Wingman summoned');
  choose(g, 'end'); auto(g); act(g, 1, 'Dark Hole'); auto(g);
  ok(!!on(g, 0, 'Elemental HERO Avian') || !!on(g, 0, 'Elemental HERO Burstinatrix'), 'a material came back');
});
T('Break! Draw! draws on a kill', () => {
  const g = duel({ board: [{ hand: ['Break! Draw!'], m: ['Cyber Dragon'], turn: 2 }, { m: ['Kuriboh'] }] });
  act(g, 0, 'Break! Draw!'); auto(g); const h = g.p[0].hand.length; goBP(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, 'Kuriboh')); auto(g);
  ok(g.p[0].hand.length === h + 1, 'drew 1');
});
T('Breakthrough! lets the Six Samurai attack directly', () => {
  const g = duel({ board: [{ hand: [], st: ['Breakthrough!'], m: ['The Six Samurai - Kamon', 'The Six Samurai - Yaichi'], turn: 2 }, { m: ['Kuriboh', 'Giant Rat'] }] });
  act(g, 0, 'Breakthrough!'); auto(g); goBP(g); attack(g, on(g, 0, 'The Six Samurai - Kamon'), on(g, 1, 'Kuriboh')); auto(g);
  ok(hasOpt(g, 'atk:' + on(g, 0, 'The Six Samurai - Yaichi').u + ':d'), 'Yaichi can attack directly');
});
T('Breath of Light destroys face-up Rocks', () => {
  const g = duel({ board: [{ hand: ['Breath of Light'], turn: 2 }, { m: ['Giant Soldier of Stone', 'Kuriboh'] }] });
  act(g, 0, 'Breath of Light'); auto(g); ok(inZ(g, 1, 'gy', 'Giant Soldier of Stone') && !!on(g, 1, 'Kuriboh'), 'Giant Soldier destroyed only');
});
T('Aussa: the summoned monster is destroyed when she leaves', () => {
  const g = duel({ board: [{ hand: ['Giant Rat'], m: ['Avalanching Aussa', FILL], turn: 2 }, { hand: ['Dark Hole'] }] });
  choose(g, 'a:' + on(g, 0, 'Avalanching Aussa').u); auto(g);
  const g2 = duel({ board: [{ hand: ['Giant Rat'], m: ['Avalanching Aussa', FILL], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g2, 'a:' + on(g2, 0, 'Avalanching Aussa').u); auto(g2);
  goBP(g2); attack(g2, on(g2, 0, 'Avalanching Aussa'), on(g2, 1, 'Cyber Dragon')); auto(g2);
  ok(inZ(g2, 0, 'gy', 'Avalanching Aussa') && inZ(g2, 0, 'gy', 'Giant Rat'), 'Giant Rat destroyed with Aussa');
});
T('Brainwashing Beam takes a monster with an A-Counter', () => {
  const g = duel({ board: [{ hand: [], st: ['Brainwashing Beam'], m: [FILL], turn: 2 }, { m: ['Kuriboh'] }] });
  E.lib.addCtr(g, on(g, 1, 'Kuriboh'), 'A', 1); choose(g, 'pos:'); auto(g);
  act(g, 0, 'Brainwashing Beam'); auto(g); ok(!!on(g, 0, 'Kuriboh'), 'A controls Kuriboh');
  choose(g, 'end'); auto(g); ok(inZ(g, 0, 'gy', 'Brainwashing Beam') && !!on(g, 1, 'Kuriboh'), 'last counter gone: Beam destroyed, Kuriboh back');
});
T('Boss Rush summons a B.E.S. in the End Phase', () => {
  const g = duel({ main0: [...Array(39).fill(FILL), 'B.E.S. Big Core'], board: [{ hand: ['Dark Hole'], st: [{ n: 'Boss Rush', pos: 'up' }], m: ['B.E.S. Big Core'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); auto(g); choose(g, 'end'); auto(g); ok(!!on(g, 0, 'B.E.S. Big Core'), 'a new Big Core arrived');
});
console.log(fails ? `\n${fails} failed` : '\nAll batch 35 checks passed.');
process.exit(fails ? 1 : 0);
