// Scenario checks for full pool batch 01: node build/test_full-01.js
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
const hasCard = (g, p, n) => g.prompt && g.prompt.opts.some(o => o.u != null && [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy].some(c => c && c.u === o.u && E.name(c) === n));
const hasOpt = (g, text) => g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const yesAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes'); };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

const yes = g => { if (g.prompt && g.prompt.type === 'yesno') choose(g, 'yes'); };
const no = g => { if (g.prompt && g.prompt.type === 'yesno') choose(g, 'no'); };
const flow = (g, n = 30) => { for (let i = 0; i < n && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const pr = g => g.prompt ? `${g.prompt.type} "${g.prompt.text}" [${g.prompt.opts.map(o => o.label).join(', ')}]` : 'none';
// attack with a, then pass every window until the Battle Phase menu returns
function attack(g, a, t) { choose(g, 'atk:' + a.u + ':' + (t ? t.u : 'd')); for (let i = 0; i < 12 && g.prompt && (g.prompt.type === 'respond' || g.prompt.type === 'yesno'); i++) { if (g.prompt.type === 'yesno') choose(g, 'no'); else E.act(g, ['pass']); } }

T('Dimacari tags out into Alexander; a Laquari tag out cannot fetch Alexander', () => {
  const g = duel({ board: [{ hand: [], m: ['Gladiator Beast Dimacari'], deckTop: [FILL, 'Gladiator Beast Alexander'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].deck.find(c => E.name(c) === 'Gladiator Beast Alexander'), p: 0 }), 'Alexander cannot be Special Summoned normally');
  choose(g, 'bp'); passAll(g); attack(g, on(g, 0, 'Gladiator Beast Dimacari'), on(g, 1, FILL)); choose(g, 'endbp'); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && /Dimacari/.test(g.prompt.text), 'tag out offered at the end of the Battle Phase: ' + pr(g));
  yes(g); passAll(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Alexander'); if (g.prompt && g.prompt.type === 'choose') choose(g, 'Attack Position'); passAll(g);
  ok(on(g, 0, 'Gladiator Beast Alexander') && inZ(g, 0, 'deck', 'Gladiator Beast Dimacari'), 'Alexander summoned, Dimacari in the Deck');
  const al = on(g, 0, 'Gladiator Beast Alexander'); ok(al && al.flags.gb && E.lib.has(g, al, 'unaffectedSpells'), 'Alexander counts as summoned by a Gladiator Beast and is unaffected by Spells');
  const g2 = duel({ board: [{ hand: [], m: ['Gladiator Beast Laquari'], deckTop: [FILL, 'Gladiator Beast Alexander'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  choose(g2, 'bp'); passAll(g2); attack(g2, on(g2, 0, 'Gladiator Beast Laquari'), on(g2, 1, FILL)); choose(g2, 'endbp'); passAll(g2);
  ok(!(g2.prompt && g2.prompt.type === 'yesno'), 'Laquari has no tag out when only Alexander is in the Deck: ' + pr(g2));
});
T('Dimacari summoned by a Gladiator Beast attacks twice', () => {
  const g = duel({ board: [{ hand: [], m: ['Gladiator Beast Dimacari'], turn: 2 }, {}] });
  on(g, 0, 'Gladiator Beast Dimacari').flags.gb = true;
  choose(g, 'bp'); passAll(g); attack(g, on(g, 0, 'Gladiator Beast Dimacari')); ok(hasOpt(g, 'Attack directly'), 'second attack offered'); attack(g, on(g, 0, 'Gladiator Beast Dimacari'));
  ok(g.p[1].lp === 8000 - 3200, 'two direct attacks for 3200: ' + g.p[1].lp);
});
T('Ancient Gear Golem cannot be revived; it pierces and locks Spells/Traps', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Ancient Gear Golem'], m: [{ n: 'Ancient Gear Golem' }], turn: 2 }, { m: [{ n: FILL, pos: 'def' }], st: ['Mirror Force'] }] });
  const golemGY = g.p[0].gy[0]; ok(E.lib.forbid(g, { type: 'ss', c: golemGY, p: 0 }), 'Golem in the GY cannot be Special Summoned');
  choose(g, 'bp'); passAll(g); choose(g, 'atk:' + on(g, 0, 'Ancient Gear Golem').u + ':' + on(g, 1, FILL).u);
  ok(!(g.prompt && g.prompt.p === 1 && g.prompt.opts.some(o => /Mirror Force/.test(o.label))), 'Mirror Force not offered');
  flow(g);
  ok(g.p[1].lp === 8000 - 2900, 'piercing 2900: ' + g.p[1].lp);
});
T('Gaiodiaz: contact summon, burn by DEF', () => {
  const g = duel({ board: [{ hand: [], m: ['Gladiator Beast Spartacus', 'Gladiator Beast Laquari'], turn: 2 }, { m: [{ n: 'Amazoness Blowpiper', pos: 'def' }] }], ex0: ['Gladiator Beast Gaiodiaz'] });
  choose(g, 'Spartacus + 1'); passAll(g);
  const gd = on(g, 0, 'Gladiator Beast Gaiodiaz'); ok(gd && inZ(g, 0, 'deck', 'Gladiator Beast Spartacus'), 'Gaiodiaz summoned, materials in the Deck');
  choose(g, 'bp'); passAll(g); attack(g, gd, on(g, 1, 'Amazoness Blowpiper'));
  ok(g.p[1].lp === 8000 - 1500, 'burn equal to Blowpiper DEF 1500: ' + g.p[1].lp);
});
T('Octavius destroys a Set card and must shuffle or discard after battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Test Tiger', 'Gladiator Beast Laquari'], deckTop: [FILL, 'Gladiator Beast Octavius'], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'Tribute: swap'); passAll(g); choose(g, 'Octavius'); choose(g, 'Attack Position'); passAll(g);
  ok(on(g, 0, 'Gladiator Beast Octavius') && inZ(g, 1, 'gy', 'Mirror Force'), 'Octavius destroyed Mirror Force: ' + pr(g));
  choose(g, 'bp'); passAll(g); attack(g, on(g, 0, 'Gladiator Beast Octavius')); choose(g, 'endbp'); passAll(g); ok(hasOpt(g, 'Discard 1 card'), 'shuffle or discard offered'); choose(g, 'Shuffle'); passAll(g);
  ok(inZ(g, 0, 'deck', 'Gladiator Beast Octavius'), 'chose to shuffle: Octavius was shuffled into the Deck: ' + pr(g));
});
T('Secutor summons 2 Gladiator Beasts; Torax draws', () => {
  const g = duel({ board: [{ hand: [], m: ['Gladiator Beast Secutor', 'Gladiator Beast Torax'], deckTop: [FILL, 'Gladiator Beast Laquari', 'Gladiator Beast Hoplomus'], turn: 2 }, {}] });
  for (const x of g.p[0].m) if (x) x.flags.gb = true;
  choose(g, 'bp'); passAll(g); attack(g, on(g, 0, 'Gladiator Beast Secutor')); attack(g, on(g, 0, 'Gladiator Beast Torax')); choose(g, 'endbp');
  const hand0 = g.p[0].hand.length;
  passAll(g); yes(g); passAll(g); E.act(g, g.prompt.opts.filter(o => /Laquari|Hoplomus/.test(o.label)).map(o => o.key)); choose(g, 'Attack'); choose(g, 'Attack'); passAll(g);
  ok(on(g, 0, 'Gladiator Beast Laquari') && on(g, 0, 'Gladiator Beast Hoplomus') && on(g, 0, 'Gladiator Beast Secutor'), 'Laquari and Hoplomus summoned, Secutor stays');
  ok(inZ(g, 0, 'deck', 'Gladiator Beast Torax') && g.p[0].hand.length === hand0 + 1, 'Torax shuffled in and drew 1');
});
T('Battle Archfiend Shield is destroyed instead and comes back after a tag out', () => {
  const g = duel({ board: [{ hand: ["Gladiator Beast's Battle Archfiend Shield", 'Mystical Space Typhoon'], m: ['Gladiator Beast Hoplomus'], deckTop: [FILL, 'Gladiator Beast Laquari'], turn: 2 }, { st: ['Bottomless Trap Hole'], m: [{ n: 'Cyber Dragon' }] }] });
  act(g, 0, "Gladiator Beast's Battle Archfiend Shield"); passAll(g);
  const h = on(g, 0, 'Gladiator Beast Hoplomus'); ok(g.p[0].st.some(x => x && x.equipTo === h.u), 'Shield equipped');
  choose(g, 'bp'); passAll(g); attack(g, h, on(g, 1, 'Cyber Dragon'));
  ok(on(g, 0, 'Gladiator Beast Hoplomus') && inZ(g, 0, 'gy', "Gladiator Beast's Battle Archfiend Shield"), 'Hoplomus survived the battle, Shield destroyed instead');
  const g2 = duel({ board: [{ hand: ["Gladiator Beast's Battle Gladius"], m: ['Gladiator Beast Dimacari'], deckTop: [FILL, 'Gladiator Beast Laquari'], turn: 2 }, {}] });
  act(g2, 0, "Gladiator Beast's Battle Gladius"); passAll(g2);
  const d = on(g2, 0, 'Gladiator Beast Dimacari'); ok(E.atk(g2, d) === 1900, 'Gladius +300: ' + E.atk(g2, d));
  choose(g2, 'bp'); passAll(g2); attack(g2, d); choose(g2, 'endbp'); passAll(g2); yes(g2); passAll(g2); if (g2.prompt.type === 'choose') choose(g2, 'Attack'); passAll(g2);
  ok(on(g2, 0, 'Gladiator Beast Laquari') && inZ(g2, 0, 'hand', "Gladiator Beast's Battle Gladius"), 'Laquari summoned and Gladius returned to the hand: ' + pr(g2));
});
T('Battle Manica and Battle Halberd', () => {
  const g = duel({ board: [{ hand: ["Gladiator Beast's Battle Halberd", "Gladiator Beast's Battle Manica"], m: ['Gladiator Beast Dimacari', 'Gladiator Beast Torax'], turn: 2 }, { m: ['Cyber Dragon', { n: FILL, pos: 'def' }], st: [{ n: 'Swords of Revealing Light', pos: 'set' }] }] });
  act(g, 0, "Gladiator Beast's Battle Halberd"); choose(g, 'Dimacari'); passAll(g);
  act(g, 0, "Gladiator Beast's Battle Manica"); choose(g, 'Torax'); passAll(g);
  choose(g, 'bp'); passAll(g); attack(g, on(g, 0, 'Gladiator Beast Torax'), on(g, 1, 'Cyber Dragon'));
  ok(on(g, 0, 'Gladiator Beast Torax'), 'Torax with Manica survives battle');
  choose(g, 'atk:' + on(g, 0, 'Gladiator Beast Dimacari').u + ':' + on(g, 1, FILL).u); for (let i = 0; i < 12 && g.prompt && g.prompt.type !== 'pick'; i++) E.act(g, ['pass']);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Face-down'); passAll(g);
  ok(inZ(g, 1, 'gy', 'Swords of Revealing Light'), 'Halberd destroyed a Spell/Trap after the Damage Step');
});
T("Respite, Proving Ground and Lash", () => {
  const g = duel({ board: [{ hand: ["Gladiator Beast's Respite", 'Gladiator Beast Laquari', "Gladiator Beast's Battle Gladius", 'Gladiator Lash', 'Gladiator Proving Ground'], deckTop: [FILL, 'Gladiator Beast Secutor'], turn: 2 }, {}] });
  const h0 = g.p[0].hand.length; act(g, 0, "Gladiator Beast's Respite"); passAll(g); if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.filter(o => /Laquari|Gladius/.test(o.label)).map(o => o.key)); passAll(g);
  ok(g.p[0].hand.length === h0 && inZ(g, 0, 'deck', 'Gladiator Beast Laquari'), 'shuffled 2, drew 3: ' + g.p[0].hand.length);
  const g2 = duel({ board: [{ hand: ['Gladiator Proving Ground'], deckTop: [FILL, 'Gladiator Beast Secutor'], turn: 2 }, {}] });
  act(g2, 0, 'Gladiator Proving Ground'); passAll(g2); ok(inZ(g2, 0, 'hand', 'Gladiator Beast Secutor'), 'Proving Ground added Secutor');
  const g3 = duel({ board: [{ hand: [], m: ['Test Tiger', 'Gladiator Beast Laquari'], st: ['Gladiator Lash'], deckTop: [FILL, 'Gladiator Beast Secutor'], turn: 2 }, {}] });
  choose(g3, 'Tribute: swap'); passAll(g3); choose(g3, 'Secutor'); if (g3.prompt.type === 'choose') choose(g3, 'Attack'); passAll(g3);
  const n1 = g3.p[1].hand.length; act(g3, 0, 'Gladiator Lash'); passAll(g3); if (g3.prompt.type === 'pick') E.act(g3, [g3.prompt.opts[0].key]); passAll(g3);
  ok(g3.p[1].hand.length === n1 - 1, 'opponent discarded 1');
});
T('A-Counter cards: Breeding Device, Scatter Burst, Incubator', () => {
  const g = duel({ board: [{ hand: ['A Cell Scatter Burst'], m: ['Alien Grey'], st: [{ n: 'A Cell Breeding Device', pos: 'up' }, { n: 'A Cell Incubator', pos: 'up' }], turn: 2 }, { m: ['Cyber Dragon', 'Amazoness Fighter'] }] });
  const cd = on(g, 1, 'Cyber Dragon');
  passAll(g); choose(g, 'Cyber Dragon'); passAll(g);
  ok(E.lib.ctr(cd, 'A') === 1, 'Breeding Device put an A-Counter in the Standby Phase');
  act(g, 0, 'A Cell Scatter Burst'); passAll(g); for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) choose(g, 'Cyber Dragon'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Alien Grey') && E.lib.ctr(cd, 'A') === 3, 'Alien Grey (Level 2) destroyed, 2 A-Counters placed: ' + E.lib.ctr(cd, 'A'));
  E.lib.addCtr(g, cd, 'A', -1); choose(g, 'End turn'); passAll(g);
  const inc = g.p[0].st.find(c => c && E.name(c) === 'A Cell Incubator'); ok(E.lib.ctr(inc, 'A') === 1, 'Incubator got a counter when one was removed: ' + E.lib.ctr(inc, 'A'));
});
T('A Cat of Ill Omen puts a Trap on top', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'A Cat of Ill Omen', pos: 'set' }], deckTop: [FILL, 'Mirror Force'], turn: 2 }, {}] });
  choose(g, 'Flip Summon'); passAll(g); if (g.prompt.type === 'pick') choose(g, 'Mirror Force'); passAll(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Mirror Force', 'Mirror Force on top of the Deck');
});
T('A Deal with Dark Ruler after a Level 8 monster goes to the GY', () => {
  const g = duel({ board: [{ hand: ['A Deal with Dark Ruler', 'Ancient Gear Explosive'], m: ['Ancient Gear Golem'], deckTop: [FILL, 'Berserk Dragon'], turn: 2 }, {}] });
  const deal = () => g.prompt.opts.some(o => o.key === 'a:' + g.p[0].hand.find(c => E.name(c) === 'A Deal with Dark Ruler').u + ':1');
  ok(!deal(), 'Deal not usable before');
  act(g, 0, 'Ancient Gear Explosive'); passAll(g);
  ok(g.p[1].lp === 6500, 'Ancient Gear Explosive: 1500 damage'); ok(deal(), 'Deal usable after the Golem was destroyed');
  act(g, 0, 'A Deal with Dark Ruler'); passAll(g); passAll(g);
  ok(on(g, 0, 'Berserk Dragon'), 'Berserk Dragon summoned from the Deck');
});
T('A Feather of the Phoenix', () => {
  const g = duel({ board: [{ hand: ['A Feather of the Phoenix', 'Cyber Dragon'], gy: ['Mirror Force'], turn: 2 }, {}] });
  act(g, 0, 'A Feather of the Phoenix'); if (g.prompt.type === 'pick') choose(g, 'Cyber Dragon'); if (g.prompt.type === 'pick') choose(g, 'Mirror Force'); passAll(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Mirror Force' && inZ(g, 0, 'gy', 'Cyber Dragon'), 'discarded Cyber Dragon, Mirror Force on top');
});
T('A Feint Plan stops attacks on face-down monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }], st: ['A Feint Plan'] }] });
  choose(g, 'bp'); act(g, 1, 'A Feint Plan'); passAll(g); passAll(g);
  choose(g, 'atk:' + on(g, 0, 'Cyber Dragon').u + ':' + on(g, 1, FILL).u); flow(g);
  ok(on(g, 1, FILL) && on(g, 1, FILL).pos === 'set', 'the face-down monster was not attacked: ' + pr(g));
});
T('A Hero Emerges summons a random monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { hand: ['Amazoness Fighter'], st: ['A Hero Emerges'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'atk:'); act(g, 1, 'A Hero Emerges'); passAll(g); if (g.prompt.type === 'choose') choose(g, 'Defense'); flow(g);
  ok(on(g, 1, 'Amazoness Fighter'), 'Amazoness Fighter summoned');
});
T('A Major Upset returns Special Summoned Level 7+ monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Gladiator Beast Octavius', 'Ancient Gear Golem'], turn: 2 }, { m: ['Ancient Gear Cannon'], st: ['A Major Upset'] }] });
  on(g, 0, 'Gladiator Beast Octavius').summonType = 'special'; on(g, 0, 'Ancient Gear Golem').summonType = 'tribute';
  choose(g, 'bp'); act(g, 1, 'A Major Upset'); passAll(g); passAll(g);
  ok(inZ(g, 0, 'hand', 'Gladiator Beast Octavius') && on(g, 0, 'Ancient Gear Golem') && inZ(g, 1, 'gy', 'Ancient Gear Cannon'), 'Octavius returned, Golem stays, Cannon Tributed');
});
T('A Man with Wdjat, A Rival Appears!, A Wingbeat of Giant Dragon', () => {
  const g = duel({ board: [{ hand: ['A Man with Wdjat'], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'ns:'); passAll(g); passAll(g);
  ok(g.log.some(l => /looked at the Set card: Mirror Force/.test(l)), 'Wdjat looked at Mirror Force');
  const g2 = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { hand: ['Cyber Dragon'], st: ['A Rival Appears!'] }] });
  choose(g2, 'bp'); act(g2, 1, 'A Rival Appears!'); passAll(g2); if (g2.prompt.type === 'choose') choose(g2, 'Attack'); passAll(g2);
  ok(on(g2, 1, 'Cyber Dragon'), 'A Rival Appears! summoned a Level 5 from the hand');
  const g3 = duel({ board: [{ hand: ['A Wingbeat of Giant Dragon'], m: ['Blue-Eyes White Dragon'], st: [{ n: 'A Cell Incubator', pos: 'up' }], turn: 2 }, { st: ['Mirror Force', 'A Feint Plan'] }] });
  act(g3, 0, 'A Wingbeat of Giant Dragon'); passAll(g3);
  ok(inZ(g3, 0, 'hand', 'Blue-Eyes White Dragon') && inZ(g3, 1, 'gy', 'Mirror Force') && inZ(g3, 0, 'gy', 'A Cell Incubator'), 'Berserk Dragon returned and every Spell/Trap destroyed');
});
T('A-Team negates a Trap; Amazoness Archers weakens attackers', () => {
  const g = duel({ board: [{ hand: [], m: ['A-Team: Trap Disposal Unit'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }], st: ['Mirror Force'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'atk:'); choose(g, 'Mirror Force', 1); ok(hasOpt(g, 'Tribute: negate'), 'A-Team offered'); choose(g, 'Tribute: negate'); flow(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'A-Team: Trap Disposal Unit'), 'Mirror Force negated and destroyed');
  const g2 = duel({ board: [{ hand: [], m: ['Cyber Dragon', { n: FILL, pos: 'set' }], turn: 2 }, { m: ['Amazoness Fighter'], st: ['Amazoness Archers'] }] });
  choose(g2, 'bp'); passAll(g2); choose(g2, 'atk:' + on(g2, 0, 'Cyber Dragon').u); act(g2, 1, 'Amazoness Archers'); passAll(g2);
  ok(E.atk(g2, on(g2, 0, 'Cyber Dragon')) === 1600 && on(g2, 0, FILL).pos === 'atk' && E.atk(g2, on(g2, 0, FILL)) === 1500, 'both attackers in Attack Position with -500 ATK');
});
T('Amazoness Fighter, Swords Woman, Paladin, Tiger', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Amazoness Swords Woman', 'Amazoness Paladin', 'Amazoness Tiger'] }] });
  const t = on(g, 1, 'Amazoness Tiger'); ok(E.atk(g, t) === 1100 + 1200 && E.atk(g, on(g, 1, 'Amazoness Paladin')) === 2000, `Tiger ${E.atk(g, t)}, Paladin ${E.atk(g, on(g, 1, 'Amazoness Paladin'))}`);
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'Attack Amazoness Swords') && hasOpt(g, 'Attack Amazoness Tiger'), 'only Tiger can be attacked');
  const g2 = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Amazoness Swords Woman'] }] });
  choose(g2, 'bp'); passAll(g2); attack(g2, on(g2, 0, 'Cyber Dragon'), on(g2, 1, 'Amazoness Swords Woman'));
  ok(g2.p[0].lp === 7400 && g2.p[1].lp === 8000, `Swords Woman sent the 600 damage back (A ${g2.p[0].lp}, B ${g2.p[1].lp})`);
  const g3 = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Amazoness Fighter'] }] });
  choose(g3, 'bp'); passAll(g3); attack(g3, on(g3, 0, 'Cyber Dragon'), on(g3, 1, 'Amazoness Fighter')); ok(g3.p[1].lp === 8000, 'Fighter: no battle damage');
  const g4 = duel({ board: [{ hand: ['Amazoness Tiger'], m: ['Amazoness Tiger'], turn: 2 }, {}] });
  ok(!hasOpt(g4, 'ns:' + g4.p[0].hand.find(c => E.name(c) === 'Amazoness Tiger').u) && hasOpt(g4, 'set:' + g4.p[0].hand.find(c => E.name(c) === 'Amazoness Tiger').u), 'a second Amazoness Tiger cannot be Normal Summoned face-up');
});
T('Blowpiper, Chain Master, Spellcaster', () => {
  const g = duel({ board: [{ hand: [], m: ['Amazoness Blowpiper'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  ok(E.atk(g, on(g, 1, 'Cyber Dragon')) === 1600, 'Blowpiper took 500 ATK in the Standby Phase: ' + pr(g));
  const g2 = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { hand: ['Gladiator Beast Laquari', 'Mirror Force'], m: ['Amazoness Chain Master'] }] });
  choose(g2, 'bp'); passAll(g2); choose(g2, 'atk:'); flow(g2); for (let i = 0; i < 6 && g2.prompt && g2.prompt.type !== 'idle'; i++) { if (g2.prompt.type === 'yesno') choose(g2, 'yes'); else if (g2.prompt.type === 'pick') choose(g2, FILL); else E.act(g2, ['pass']); }
  ok(inZ(g2, 1, 'hand', FILL) && g2.p[1].lp === 8000 - 600 - 1500, 'Chain Master took a monster from the hand for 1500 LP: ' + g2.p[1].lp);
  const g3 = duel({ board: [{ hand: ['Amazoness Spellcaster'], m: ['Amazoness Paladin'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g3, 0, 'Amazoness Spellcaster'); passAll(g3);
  ok(E.atk(g3, on(g3, 0, 'Amazoness Paladin')) === 2200 && E.atk(g3, on(g3, 1, 'Cyber Dragon')) === 1700, `ATK switched (${E.atk(g3, on(g3, 0, 'Amazoness Paladin'))}, ${E.atk(g3, on(g3, 1, 'Cyber Dragon'))})`);
  choose(g3, 'end'); passAll(g3); ok(E.atk(g3, on(g3, 1, 'Cyber Dragon')) === 2100, 'switched back at the end of the turn');
});
T('Crimson Ape, Ancient Gear, Cannon, Workshop, Tank', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm', 'Ancient Gear'], m: ['Ancient Crimson Ape', 'Ancient Gear', 'Ancient Gear Cannon'], gy: ['Ancient Gear Golem'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(hasOpt(g, 'Special Summon (you control an Ancient Gear)'), 'Ancient Gear can be Special Summoned');
  choose(g, 'Tribute: 500'); passAll(g);
  ok(g.p[1].lp === 7500, 'Cannon: 500 damage');
  ok(E.lib.forbid(g, { type: 'activate', c: g.p[1].st.find(Boolean), eff: { type: 'act' }, p: 1 }) === false, 'Traps still allowed outside the Battle Phase');
  choose(g, 'bp'); passAll(g); g.phase = 'battle';
  ok(E.lib.forbid(g, { type: 'activate', c: g.p[1].st.find(Boolean), eff: { type: 'act' }, p: 1 }), 'no Traps in the Battle Phase');
  const g2 = duel({ board: [{ hand: ['Ancient Gear Workshop', 'Ancient Gear Tank'], m: ['Ancient Gear Soldier', 'Ancient Crimson Ape'], gy: ['Ancient Gear Golem'], turn: 2 }, { hand: ['Mystical Space Typhoon'], st: ['Dust Tornado'] }] });
  act(g2, 0, 'Ancient Gear Workshop'); passAll(g2); ok(inZ(g2, 0, 'hand', 'Ancient Gear Golem'), 'Workshop added the Golem');
  act(g2, 0, 'Ancient Gear Tank'); passAll(g2); ok(E.atk(g2, on(g2, 0, 'Ancient Gear Soldier')) === 1900, 'Tank +600');
  choose(g2, 'end'); passAll(g2);
  act(g2, 1, 'Dust Tornado'); passAll(g2); if (g2.prompt.type === 'yesno') choose(g2, 'no'); passAll(g2);
  ok(g2.p[1].lp === 7400, 'Tank: 600 damage when destroyed: ' + g2.p[1].lp);
});
T('Ancient Gear Castle: +300, counters, Tribute in place of monsters', () => {
  let g = duel({ board: [{ hand: ['Ancient Gear Golem', 'Ancient Gear Soldier'], st: [{ n: 'Ancient Gear Castle', pos: 'up' }], turn: 2 }, {}] });
  const cas = g.p[0].st.find(Boolean); E.lib.addCtr(g, cas, 'gear', 1);
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Ancient Gear Soldier').u); passAll(g);
  ok(E.lib.ctr(cas, 'gear') === 2 && E.atk(g, on(g, 0, 'Ancient Gear Soldier')) === 1600, 'counter added and +300');
  const g2 = duel({ board: [{ hand: ['Ancient Gear Golem'], m: ['Ancient Gear Soldier'], st: [{ n: 'Ancient Gear Castle', pos: 'up' }], turn: 2 }, {}] });
  E.lib.addCtr(g2, g2.p[0].st.find(Boolean), 'gear', 2); g = g2; choose(g, 'pos:'); passAll(g);
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Ancient Gear Golem').u); if (g.prompt.type === 'choose') choose(g, 'No Tribute'); passAll(g);
  ok(on(g, 0, 'Ancient Gear Golem') && on(g, 0, 'Ancient Gear Soldier') && inZ(g, 0, 'gy', 'Ancient Gear Castle'), 'Golem summoned, Castle Tributed instead');
});
T('Ancient Gear Drill, Factory, Fist, Engineer', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Drill', 'Mirror Force'], m: ['Ancient Gear Soldier'], deckTop: [FILL, 'Heavy Storm'], turn: 2 }, {}] });
  act(g, 0, 'Ancient Gear Drill'); choose(g, 'Mirror Force'); passAll(g); if (g.prompt.type === 'pick') choose(g, 'Heavy Storm'); passAll(g);
  const hs = g.p[0].st.find(c => c && E.name(c) === 'Heavy Storm'); ok(hs && hs.pos === 'set' && inZ(g, 0, 'gy', 'Mirror Force'), 'Heavy Storm Set from the Deck');
  ok(!g.prompt.opts.some(o => o.key === 'a:' + hs.u + ':0'), 'it cannot be activated this turn');
  const g2 = duel({ board: [{ hand: ['Ancient Gear Factory', 'Ancient Gear Golem'], gy: ['Ancient Gear Soldier', 'Ancient Gear Soldier', 'Ancient Gear Soldier', 'Ancient Gear Soldier'], turn: 2 }, {}] });
  act(g2, 0, 'Ancient Gear Factory'); passAll(g2);
  ok(g2.p[0].ban.length === 4, 'four Level 4s banished (16 = double 8)');
  choose(g2, 'ns:' + g2.p[0].hand.find(c => E.name(c) === 'Ancient Gear Golem').u); if (g2.prompt.type === 'choose') choose(g2, 'No Tribute'); passAll(g2);
  ok(on(g2, 0, 'Ancient Gear Golem'), 'Golem Normal Summoned without Tributes');
  const g3 = duel({ board: [{ hand: ['Ancient Gear Fist'], m: ['Ancient Gear Engineer'], turn: 2 }, { m: [{ n: 'Cyber Dragon', pos: 'def' }], st: ['Dust Tornado', 'Mirror Force'] }] });
  act(g3, 0, 'Ancient Gear Fist'); passAll(g3);
  choose(g3, 'bp'); passAll(g3); choose(g3, 'atk:'); flow(g3); for (let i = 0; i < 4 && g3.prompt && g3.prompt.type === 'pick'; i++) choose(g3, 'Face-down'); flow(g3);
  ok(inZ(g3, 1, 'gy', 'Cyber Dragon') && g3.p[1].st.filter(Boolean).length === 1, 'Fist destroyed Cyber Dragon (DEF 1600), Engineer destroyed a Spell/Trap');
  const g4 = duel({ board: [{ hand: [], m: ['Ancient Gear Engineer'], turn: 2 }, { st: ['Sakuretsu Armor'] }] });
  choose(g4, 'bp'); passAll(g4); choose(g4, 'atk:'); ok(!(g4.prompt && g4.prompt.p === 1 && hasOpt(g4, 'Sakuretsu')), 'no Sakuretsu while Engineer attacks');
});
T('Gadjiltron Chimera, Knight, Lamp, Leaf, Rules, Telescope', () => {
  const g = duel({ board: [{ hand: ['Ancient Gear Gadjiltron Chimera'], m: ['Red Gadget'], turn: 2 }, {}] });
  choose(g, 'ns:'); passAll(g); passAll(g);
  const ch = on(g, 0, 'Ancient Gear Gadjiltron Chimera'); ok(ch && ch.flags.red && E.atk(g, ch) === 2300, 'Red Gadget Tributed');
  choose(g, 'bp'); passAll(g); attack(g, ch); ok(g.p[1].lp === 8000 - 2300 - 500, 'Red: 500 more after a direct attack: ' + g.p[1].lp);
  const g2 = duel({ board: [{ hand: [], m: ['Ancient Gear Knight'], turn: 2 }, { st: ['Sakuretsu Armor'] }] });
  const kn = on(g2, 0, 'Ancient Gear Knight'); kn.flags.gemini = true;
  choose(g2, 'bp'); passAll(g2); choose(g2, 'atk:'); ok(!(g2.prompt && g2.prompt.p === 1), 'Gemini Knight locks Traps');
  const g3 = duel({ board: [{ hand: ['Ancient Leaf', 'Ancient Rules', 'Blue-Eyes White Dragon', 'Ancient Telescope'], lp: 9000, turn: 2 }, {}] });
  act(g3, 0, 'Ancient Leaf'); passAll(g3); ok(g3.p[0].lp === 7000, 'Leaf paid 2000');
  act(g3, 0, 'Ancient Rules'); passAll(g3); if (g3.prompt.type === 'choose') choose(g3, 'Attack'); passAll(g3); ok(on(g3, 0, 'Blue-Eyes White Dragon'), 'Ancient Rules summoned Blue-Eyes');
  act(g3, 0, 'Ancient Telescope'); passAll(g3); ok(g3.log.some(l => /saw the top/.test(l)), 'Telescope looked at 5 cards');
  const g4 = duel({ board: [{ hand: ['La Jinn the Mystical Genie of the Lamp'], m: ['Ancient Lamp'], turn: 2 }, {}] });
  choose(g4, 'Special Summon La Jinn'); passAll(g4); ok(on(g4, 0, 'La Jinn the Mystical Genie of the Lamp'), 'Lamp summoned La Jinn');
});
T('Anti Raigeki, Anti-Aircraft Flower, Anti-Fusion Device, Anti-Spell, Enraged Battle Ox', () => {
  // Raigeki has no Edison script (Forbidden), so the chain link is built by hand
  const g = duel({ board: [{ hand: ['Raigeki'], m: ['Cyber Dragon'], turn: 2 }, { m: ['Amazoness Fighter'], st: ['Anti Raigeki'] }] });
  const ar = E.SCRIPTS['Anti Raigeki'].effs[0], rk = g.p[0].hand.find(c => E.name(c) === 'Raigeki');
  const link = { c: rk, eff: { type: 'act' }, p: 0, cardAct: true, t: [], data: {}, negated: false, tags: {} };
  ok(ar.cond(g, null, 1, { top: link }) && !ar.cond(g, null, 0, { top: link }), 'Anti Raigeki answers only the opponent\'s Raigeki');
  const g2 = duel({ board: [{ hand: [], m: ['Anti-Aircraft Flower', { n: 'Basic Insect', pos: 'set' }], turn: 2 }, {}] });
  choose(g2, 'Tribute an Insect'); passAll(g2); ok(g2.p[1].lp === 7200, 'Flower: 800 damage');
  const g3 = duel({ board: [{ hand: [], m: ['Ambulance Rescueroid'], turn: 2 }, { st: ['Anti-Fusion Device'] }] });
  choose(g3, 'bp'); act(g3, 1, 'Anti-Fusion Device'); passAll(g3); ok(inZ(g3, 0, 'gy', 'Ambulance Rescueroid'), 'Anti-Fusion Device destroyed the Fusion Monster');
  const g4 = duel({ board: [{ hand: ['Heavy Storm'], turn: 2 }, { m: ['Breaker the Magical Warrior'], st: ['Anti-Spell'] }] });
  E.lib.addCtr(g4, on(g4, 1, 'Breaker the Magical Warrior'), 'spell', 2);
  act(g4, 0, 'Heavy Storm'); ok(hasOpt(g4, 'Activate'), 'Anti-Spell offered'); choose(g4, 'Activate', 1); passAll(g4);
  ok(inZ(g4, 0, 'gy', 'Heavy Storm') && inZ(g4, 1, 'gy', 'Anti-Spell') && g4.p[1].m.some(Boolean) && E.lib.ctr(on(g4, 1, 'Breaker the Magical Warrior'), 'spell') === 0, 'Heavy Storm negated');
  const g5 = duel({ board: [{ hand: [], m: ['Enraged Battle Ox', 'Amazoness Tiger'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  choose(g5, 'bp'); passAll(g5); attack(g5, on(g5, 0, 'Amazoness Tiger'), on(g5, 1, FILL)); ok(g5.p[1].lp === 8000 - (1500 - 100), 'Tiger (Beast) pierces with Battle Ox: ' + g5.p[1].lp);
});
console.log(fails ? `\n${fails} failed` : '\nAll full-01 checks passed.');
process.exit(fails ? 1 : 0);
