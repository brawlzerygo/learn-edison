// Scenario checks for full pool batch 23: node build/test_full-23.js
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
const monsOf = (g, p) => g.p[p].m.filter(Boolean);
const logHas = (g, s) => g.log.some(l => l.includes(s));
const B3 = (a, b) => [{ turn: 3, ...a }, b || {}];

T('Hieracosphinx stops attacks on face-down Defense monsters', () => {
  const g = duel({ board: B3({ m: [FILL] }, { m: ['Hieracosphinx', { n: 'Kuriboh', pos: 'set' }] }) });
  goBP(g); attack(g, on(g, 0, FILL), g.p[1].m[1]); auto(g);
  ok(g.p[1].m[1] && g.p[1].m[1].pos === 'set' && logHas(g, 'The attack was negated'), 'the attack on the face-down monster was negated');
});
T('Hieroglyph Lithograph pays 1000', () => {
  const g = duel({ board: [{ hand: ['Hieroglyph Lithograph'] }, {}] });
  act(g, 0, 'Hieroglyph Lithograph'); auto(g); ok(g.p[0].lp === 7000, `A 7000 (A ${g.p[0].lp})`);
});
T('Hiita takes a FIRE monster while face-up', () => {
  const g = duel({ board: B3({ m: [{ n: 'Hiita the Fire Charmer', pos: 'set' }], hand: ['Book of Moon'] }, { m: ['Fire Princess'] }) });
  choose(g, 'flip:'); auto(g);
  ok(on(g, 0, 'Fire Princess'), 'A controls Fire Princess');
  act(g, 0, 'Book of Moon'); const pr = g.prompt; E.act(g, ['u' + on(g, 0, 'Hiita the Fire Charmer').u]); auto(g);
  ok(on(g, 1, 'Fire Princess'), 'control went back when Hiita was turned face-down');
});
T('Hino-Kagu-Tsuchi: the opponent discards before the draw', () => {
  const g = duel({ board: B3({ m: ['Hino-Kagu-Tsuchi'] }, {}) });
  goBP(g); attack(g, on(g, 0, 'Hino-Kagu-Tsuchi'), null); auto(g); choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(g.tp === 1 && g.p[1].hand.length === 1 && g.p[1].gy.length === 5, `B kept only the drawn card (hand ${g.p[1].hand.length}, GY ${g.p[1].gy.length})`);
});
T("Hiro's Shadow Scout: opponent draws 3 and discards the Spells", () => {
  const g = duel({ board: B3({ m: [{ n: "Hiro's Shadow Scout", pos: 'set' }] }, { deckTop: ['Pot of Greed', FILL, 'Book of Moon'] }) });
  const h = g.p[1].hand.length; choose(g, 'flip:'); auto(g);
  ok(g.p[1].hand.length === h + 1 && inZ(g, 1, 'gy', 'Pot of Greed') && inZ(g, 1, 'gy', 'Book of Moon'), 'B drew 3 and discarded the 2 Spells');
});
T('House of Adhesive Tape destroys a low-DEF summon', () => {
  const g = duel({ board: [{ hand: [FILL] }, { st: ['House of Adhesive Tape'] }] });
  choose(g, 'ns:'); choose(g, 'House of Adhesive Tape', 1); auto(g);
  ok(inZ(g, 0, 'gy', FILL), 'the 100 DEF monster was destroyed');
});
T('Huge Revolution clears the opponent', () => {
  const g = duel({ board: [{ m: ['People Running About', 'Oppressed People', 'United Resistance'], st: ['Huge Revolution'] }, { m: [FILL], st: ['Book of Moon'] }] });
  act(g, 0, 'Huge Revolution'); auto(g);
  ok(g.p[1].hand.length === 0 && monsOf(g, 1).length === 0 && !g.p[1].st.some(Boolean), 'B has no hand and no field');
});
T('Human-Wave Tactics replaces a Level 2 Normal destroyed by battle', () => {
  const g = duel({ board: B3({ m: ['Archfiend Marmot of Nefariousness'], st: [{ n: 'Human-Wave Tactics', pos: 'up' }], deckTop: [FILL, 'Archfiend Marmot of Nefariousness'] }, { m: [FILL] }) });
  goBP(g); attack(g, on(g, 0, 'Archfiend Marmot of Nefariousness'), on(g, 1, FILL)); auto(g); choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(on(g, 0, 'Archfiend Marmot of Nefariousness'), 'a new Marmot came from the Deck');
});
T('Hyena summons Hyenas when destroyed by battle', () => {
  const g = duel({ board: B3({ m: ['Hyena'], deckTop: [FILL, 'Hyena', 'Hyena'] }, { m: [FILL] }) });
  goBP(g); attack(g, on(g, 0, 'Hyena'), on(g, 1, FILL)); for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') E.act(g, ['y']); else if (g.prompt.type === 'pick' && g.prompt.text.includes('Hyena')) E.act(g, g.prompt.opts.map(x => x.key)); else auto(g); }
  ok(monsOf(g, 0).filter(x => E.name(x) === 'Hyena').length === 2, 'two Hyenas came from the Deck');
});
T('Hysteric Fairy Tributes 2 for 1000 LP', () => {
  const g = duel({ board: [{ m: ['Hysteric Fairy', FILL, FILL] }, {}] });
  choose(g, 'Tribute 2'); auto(g); ok(g.p[0].lp === 9000 && monsOf(g, 0).length === 1, `A 9000 with 1 monster left (A ${g.p[0].lp})`);
});
T('Impenetrable Formation: +700 DEF while all in Defense', () => {
  const g = duel({ board: [{ m: [{ n: FILL, pos: 'def' }, { n: 'Kuriboh', pos: 'def' }], hand: ['Impenetrable Formation'] }, {}] });
  act(g, 0, 'Impenetrable Formation'); auto(g);
  ok(E.def(g, on(g, 0, FILL)) === 800, `Warwolf DEF 800 (${E.def(g, on(g, 0, FILL))})`);
});
T('Imperial Order negates a Spell', () => {
  const g = duel({ board: [{ hand: ['Hinotama'] }, { st: [{ n: 'Imperial Order', pos: 'up' }] }] });
  act(g, 0, 'Hinotama'); auto(g); ok(g.p[1].lp === 7300 && logHas(g, 'Imperial Order negates'), `B only paid the 700 in the Standby Phase (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: ['Hinotama'] }, { st: ['Imperial Order'] }] });
  act(g2, 0, 'Hinotama'); choose(g2, 'Imperial Order', 1); auto(g2); ok(g2.p[1].lp === 8000, `chained Imperial Order negates it too (B ${g2.p[1].lp})`);
});
T('Inaba White Rabbit only attacks directly', () => {
  const g = duel({ board: B3({ m: ['Inaba White Rabbit'] }, { m: [FILL] }) });
  goBP(g); const r = on(g, 0, 'Inaba White Rabbit');
  ok(hasOpt(g, `atk:${r.u}:d`) && !hasOpt(g, `atk:${r.u}:${on(g, 1, FILL).u}`), 'direct attack only');
});
T('Infinite Dismissal destroys a Normal Summoned Level 3', () => {
  const g = duel({ board: [{ hand: ['Kaibaman'] }, { st: [{ n: 'Infinite Dismissal', pos: 'up' }] }] });
  choose(g, 'ns:'); auto(g); choose(g, 'end'); auto(g); ok(inZ(g, 0, 'gy', 'Kaibaman'), 'Kaibaman was destroyed in the End Phase');
});
T('Interdimensional Matter Transporter banishes until the End Phase', () => {
  const g = duel({ board: [{ m: [{ n: FILL, pos: 'def' }], st: ['Interdimensional Matter Transporter'] }, {}] });
  act(g, 0, 'Interdimensional Matter Transporter'); auto(g); ok(inZ(g, 0, 'ban', FILL), 'banished');
  choose(g, 'end'); auto(g); const w = on(g, 0, FILL); ok(w && w.pos === 'def', 'back in Defense Position');
});
T('Invader of Darkness blocks the opponent’s Quick-Play Spells', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'] }, { m: ['Invader of Darkness'], st: ['Book of Moon'] }] });
  ok(!hasOpt(g, 'a:' + g.p[0].hand.find(c => E.name(c) === 'Mystical Space Typhoon').u + ':'), 'MST is not offered');
});
T('Invader of the Throne switches control', () => {
  const g = duel({ board: B3({ m: [{ n: 'Invader of the Throne', pos: 'set' }] }, { m: ['Dark Blade'] }) });
  choose(g, 'flip:'); auto(g); ok(on(g, 0, 'Dark Blade') && on(g, 1, 'Invader of the Throne'), 'swapped');
});
T('Invasion of Flames: no Traps on its Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Invasion of Flames'] }, { st: ['Trap Hole'] }] });
  choose(g, 'ns:'); ok(!hasOpt(g, 'Trap Hole'), 'Trap Hole is not offered'); auto(g); ok(on(g, 0, 'Invasion of Flames'), 'still on the field');
});
T('Invitation to a Dark Sleep stops an attacker', () => {
  const g = duel({ board: [{ hand: ['Invitation to a Dark Sleep'], m: [FILL] }, { m: ['Dark Blade'] }] });
  choose(g, 'ns:'); auto(g); ok(E.lib.forbid(g, { type: 'attack', c: on(g, 1, 'Dark Blade') }), 'Dark Blade can’t attack');
});
T('Jade Insect Whistle puts an Insect on top', () => {
  const g = duel({ board: [{ hand: ['Jade Insect Whistle'] }, { deckTop: [FILL, 'Jirai Gumo'] }] });
  act(g, 0, 'Jade Insect Whistle'); auto(g); const d = g.p[1].deck; ok(E.name(d[d.length - 1]) === 'Jirai Gumo', 'Jirai Gumo on top');
});
T('Jar Robber negates Pot of Greed and draws', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'] }, { st: ['Jar Robber'] }] });
  const ha = g.p[0].hand.length, hb = g.p[1].hand.length; act(g, 0, 'Pot of Greed'); choose(g, 'Jar Robber', 1); auto(g);
  ok(g.p[0].hand.length === ha - 1 && g.p[1].hand.length === hb + 1, `A drew none, B drew 1 (A ${g.p[0].hand.length}, B ${g.p[1].hand.length})`);
});
T('Jowls of Dark Demise: the taken monster attacks directly', () => {
  const g = duel({ board: B3({ m: [{ n: 'Jowls of Dark Demise', pos: 'set' }] }, { m: ['Dark Blade', FILL] }) });
  choose(g, 'flip:'); auto(g); const t = monsOf(g, 0).find(x => E.name(x) !== 'Jowls of Dark Demise'); ok(!!t, 'took a monster');
  goBP(g); ok(hasOpt(g, `atk:${t.u}:d`), 'it can attack directly');
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g); ok(monsOf(g, 1).length === 2 && !t.flags.directAttack, 'control and the flag are gone after the turn');
});
T('KA-2 Des Scissors burns Level x 500', () => {
  const g = duel({ board: B3({ m: ['KA-2 Des Scissors'] }, { m: ['Kaibaman'] }) });
  goBP(g); attack(g, on(g, 0, 'KA-2 Des Scissors'), on(g, 1, 'Kaibaman')); auto(g);
  ok(g.p[1].lp === 8000 - 800 - 1500, `B 5700 (B ${g.p[1].lp})`);
});
T('Kaibaman summons Blue-Eyes', () => {
  const g = duel({ board: [{ m: ['Kaibaman'], hand: ['Blue-Eyes White Dragon'] }, {}] });
  choose(g, 'Blue-Eyes White Dragon'); auto(g); ok(on(g, 0, 'Blue-Eyes White Dragon') && inZ(g, 0, 'gy', 'Kaibaman'), 'Blue-Eyes is out');
});
T('Kangaroo Champ changes its opponent to Defense', () => {
  const g = duel({ board: B3({ m: ['Kuriboh'] }, { m: [{ n: 'Kangaroo Champ', pos: 'def' }] }) });
  goBP(g); attack(g, on(g, 0, 'Kuriboh'), on(g, 1, 'Kangaroo Champ')); auto(g); ok(on(g, 0, 'Kuriboh').pos === 'def', 'Kuriboh is in Defense Position');
});
T('Karate Man doubles, then is destroyed', () => {
  const g = duel({ board: [{ m: ['Karate Man'] }, {}] });
  choose(g, 'Double'); auto(g); ok(E.atk(g, on(g, 0, 'Karate Man')) === 2000, 'ATK 2000');
  choose(g, 'end'); auto(g); ok(inZ(g, 0, 'gy', 'Karate Man'), 'destroyed in the End Phase');
});
T('Kiryu: union bonus, then Tribute for a direct attack', () => {
  const g = duel({ board: B3({ m: ['Dark Blade', 'Kiryu'] }, { m: [FILL] }) });
  choose(g, 'Equip to Dark Blade'); auto(g); const b = on(g, 0, 'Dark Blade'); ok(E.atk(g, b) === 2700 && E.def(g, b) === 2400, `Dark Blade 2700/2400 (${E.atk(g, b)})`);
  choose(g, 'Tribute Kiryu'); auto(g); goBP(g); ok(hasOpt(g, `atk:${b.u}:d`), 'Dark Blade can attack directly');
});
T('Kishido Spirit: equal ATK, only the opponent’s is destroyed', () => {
  const g = duel({ board: B3({ m: [FILL], st: [{ n: 'Kishido Spirit', pos: 'up' }] }, { m: [FILL] }) });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, FILL)); auto(g); ok(on(g, 0, FILL) && !on(g, 1, FILL), 'A keeps its monster');
});
T("Knight's Title summons Dark Magician Knight from the Deck", () => {
  const g = duel({ board: [{ m: ['Dark Magician'], hand: ["Knight's Title"], deckTop: ['Dark Magician Knight'] }, {}] });
  act(g, 0, "Knight's Title"); auto(g); ok(logHas(g, 'Special Summoned Dark Magician Knight') && inZ(g, 0, 'gy', 'Dark Magician'), 'DMK was Special Summoned');
});
T('Koitsu: +3000 and piercing on Aitsu', () => {
  const g = duel({ board: B3({ m: ['Aitsu', 'Koitsu'] }, { m: [{ n: FILL, pos: 'def' }] }) });
  choose(g, 'Equip to Aitsu'); auto(g); goBP(g); attack(g, on(g, 0, 'Aitsu'), on(g, 1, FILL)); auto(g);
  ok(g.p[1].lp === 8000 - 3000, `piercing 3000 (B ${g.p[1].lp})`);
});
T('Kotodama destroys the newer copy', () => {
  const g = duel({ board: [{ m: [FILL], hand: [FILL] }, { m: ['Kotodama'] }] });
  choose(g, 'ns:'); auto(g); ok(monsOf(g, 0).length === 1 && cnt(g, 0, 'gy', FILL) === 1, 'one Warwolf left');
});
T("Kozaky's Self-Destruct Button burns whoever destroys it", () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'] }, { st: ["Kozaky's Self-Destruct Button"] }] });
  act(g, 0, 'Mystical Space Typhoon'); auto(g); ok(g.p[0].lp === 7000, `A took 1000 (A ${g.p[0].lp})`);
});
T('Kelbek returns its attacker', () => {
  const g = duel({ board: B3({ m: ['Kaibaman'] }, { m: [{ n: 'Kelbek', pos: 'def' }] }) });
  goBP(g); attack(g, on(g, 0, 'Kaibaman'), on(g, 1, 'Kelbek')); auto(g); ok(inZ(g, 0, 'hand', 'Kaibaman'), 'Kaibaman is back in the hand');
});
T('Kuriboh stops the battle damage', () => {
  const g = duel({ board: B3({ m: [FILL] }, { hand: ['Kuriboh'] }) });
  goBP(g); attack(g, on(g, 0, FILL), null);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (hasOpt(g, 'Discard: no battle')) { choose(g, 'Discard: no battle', 1); continue; } auto(g); break; }
  auto(g); ok(g.p[1].lp === 8000, `B took no damage (B ${g.p[1].lp})`);
});
T('Infernalqueen rolls a die when targeted', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'] }, { m: ['Infernalqueen Archfiend'] }] });
  act(g, 0, 'Book of Moon'); auto(g); ok(logHas(g, 'rolled a'), 'a die was rolled');
});
T('Fusion recipes read', () => {
  const g = duel({ ex0: ['Humanoid Worm Drake', 'Kaminari Attack', 'Karbonala Warrior', 'Kwagar Hercules'], board: [{ hand: ['Worm Drake', 'Humanoid Slime', 'Ocubeam', 'Mega Thunderball', 'M-Warrior 1'] }, {}] });
  for (const x of g.p[0].extra) ok(!!E.lib.fusionRecipe(x), `${E.name(x)} recipe read`);
  ok(E.lib.canFusion(g, 0, { filter: x => E.name(x) === 'Humanoid Worm Drake' }) && E.lib.canFusion(g, 0, { filter: x => E.name(x) === 'Kaminari Attack' }), 'Humanoid Worm Drake and Kaminari Attack can be made');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-23 checks passed.');
process.exit(fails ? 1 : 0);
