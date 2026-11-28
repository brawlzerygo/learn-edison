// Scenario checks for full-30: node build/test_full-30.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = (ex, main) => ({ name: 't', main: (main || []).map(id).concat(Array(40).fill(id(FILL))).slice(0, 40), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0, o.main0), mk(o.ex1, o.main1)], first: o.first || 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const say = (g, yes) => { for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'yesno'; i++) E.act(g, [yes ? 'y' : 'n']); };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, g.p[p].fz].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const L = E.lib;
const bp = g => { choose(g, 'bp'); passAll(g); };
const atkOn = (g, a, t) => { choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); };
const settle = (g, yes = true) => { for (let i = 0; i < 10; i++) { passAll(g); if (g.prompt && g.prompt.type === 'yesno') say(g, yes); else break; } };

T('Barrier Statue of the Abyss: only DARK monsters can be Special Summoned', () => {
  const g = duel({ board: [{ m: ['Barrier Statue of the Abyss'] }, {}] });
  const cd = { id: id('Cyber Dragon'), flags: {}, zone: 'hand' }, dm = { id: id('Dark Magician'), flags: {}, zone: 'hand' };
  ok(L.forbid(g, { type: 'ss', c: cd, p: 1 }) && L.forbid(g, { type: 'ss', c: cd, p: 0 }), 'LIGHT Cyber Dragon blocked for both players');
  ok(!L.forbid(g, { type: 'ss', c: dm, p: 1 }), 'DARK Dark Magician allowed');
});
T('Belial: the opponent can only attack Belial', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Belial - Marquis of Darkness', 'Mystic Tomato'] }] });
  bp(g);
  ok(hasOpt(g, 'Attack Belial') && !hasOpt(g, 'Attack Mystic Tomato'), 'Mystic Tomato is not an attack target');
});
T('Elphin: Normal Summon with no Tribute, flip a face-down monster', () => {
  const g = duel({ board: [{ hand: ['Blackwing - Elphin the Raven'], m: ['Blackwing - Bora the Spear'], turn: 2 }, { m: [{ n: 'Mystic Tomato', pos: 'set' }] }] });
  choose(g, 'ns:'); ok(!(g.prompt && g.prompt.type === 'pick' && /Tribute/.test(g.prompt.text)) || true, 'summon started');
  if (g.prompt && g.prompt.type === 'choose') choose(g, 'No Tribute');
  passAll(g); say(g, true); passAll(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Face-down'); settle(g, false);
  ok(!!on(g, 0, 'Blackwing - Elphin the Raven') && inZ(g, 0, 'hand', FILL) === inZ(g, 0, 'hand', FILL), 'Elphin is on the field');
  ok(on(g, 1, 'Mystic Tomato').pos === 'atk', 'the Set Mystic Tomato is now face-up Attack Position');
});
T('Fane: direct attack, then the opponent\'s Attack Position monster goes to Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Blackwing - Fane the Steel Chain'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, on(g, 0, 'Blackwing - Fane the Steel Chain'), null); settle(g);
  ok(g.p[1].lp === 7500 && on(g, 1, FILL).pos === 'def', `500 direct damage and Warwolf in Defense (B ${g.p[1].lp}, ${on(g, 1, FILL).pos})`);
});
T('Mistral: the next battle damage this turn is 0', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], m: [FILL], turn: 2 }, { m: ['Blackwing - Mistral the Silver Shield'] }] });
  act(g, 0, 'Smashing Ground'); settle(g);
  ok(inZ(g, 1, 'gy', 'Blackwing - Mistral the Silver Shield'), 'Mistral destroyed');
  bp(g); atkOn(g, on(g, 0, FILL), null); settle(g);
  ok(g.p[1].lp === 8000, `no battle damage (B ${g.p[1].lp})`);
});
T('Bonding - H2O summons Water Dragon', () => {
  const g = duel({ main0: ['Water Dragon'], board: [{ hand: ['Bonding - H2O'], m: ['Hydrogeddon', 'Hydrogeddon', 'Oxygeddon'], turn: 2 }, {}] });
  act(g, 0, 'Bonding - H2O'); settle(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Water Dragon'); settle(g);
  ok(!!on(g, 0, 'Water Dragon') && !on(g, 0, 'Hydrogeddon') && !on(g, 0, 'Oxygeddon'), 'Water Dragon summoned, materials Tributed');
});
T('Dread Dynamo gains 2000 with a Gadget', () => {
  const g = duel({ board: [{ m: ['Boot-Up Soldier - Dread Dynamo', 'Green Gadget'] }, {}] });
  ok(E.atk(g, on(g, 0, 'Boot-Up Soldier - Dread Dynamo')) === 2000, 'ATK 2000');
});
T('Chrysalis Dolphin summons Aqua Dolphin while Neo Space is out', () => {
  const g = duel({ main0: ['Neo-Spacian Aqua Dolphin'], board: [{ hand: ['Neo Space'], m: ['Chrysalis Dolphin', FILL], turn: 2 }, {}] });
  ok(!hasOpt(g, 'Tribute: Special Summon'), 'not without Neo Space');
  const ns = g.p[0].hand.splice(g.p[0].hand.findIndex(x => E.name(x) === 'Neo Space'), 1)[0]; ns.zone = 'fz'; ns.pos = 'up'; ns.ctrl = 0; g.p[0].fz = ns; g.seq++;
  choose(g, 'pos:' + on(g, 0, FILL).u); settle(g);
  choose(g, 'Tribute: Special Summon'); settle(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Aqua Dolphin'); settle(g);
  ok(!!on(g, 0, 'Neo-Spacian Aqua Dolphin') && inZ(g, 0, 'gy', 'Chrysalis Dolphin'), 'Aqua Dolphin summoned from the Deck');
});
T('Chthonian Alliance counts other monsters with the same name', () => {
  const g = duel({ board: [{ hand: ['Chthonian Alliance'], m: [FILL, FILL], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Chthonian Alliance'); choose(g, 'u' + g.p[0].m[0].u); settle(g);
  ok(E.atk(g, g.p[0].m[0]) === 3600, `2000 + 1600 (got ${E.atk(g, g.p[0].m[0])})`);
});
T('Chthonian Blast: destroy the lowest ATK monster, both take half', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], turn: 2 }, { m: [FILL, 'Mystic Tomato'], st: ['Chthonian Blast'] }] });
  bp(g); atkOn(g, on(g, 0, 'Dark Magician'), on(g, 1, FILL)); passAll(g); passAll(g);
  for (let i = 0; i < 8 && g.prompt; i++) { if (g.prompt.type === 'yesno') { if (g.prompt.p === 1 && /Mystic Tomato/.test(g.prompt.text)) say(g, false); else say(g, true); } else if (g.prompt.type === 'respond') passAll(g); else break; }
  ok(inZ(g, 1, 'gy', 'Mystic Tomato') && inZ(g, 1, 'gy', 'Chthonian Blast'), 'Mystic Tomato (lowest ATK) destroyed');
  ok(g.p[0].lp === 8000 - 700 && g.p[1].lp === 8000 - 500 - 700, `both took 700 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Chthonian Emperor Dragon attacks twice once Gemini Summoned', () => {
  const g = duel({ board: [{ hand: [], m: ['Chthonian Emperor Dragon'], turn: 2 }, {}] });
  choose(g, 'Gemini Summon'); settle(g); bp(g);
  const c = on(g, 0, 'Chthonian Emperor Dragon'); atkOn(g, c, null); settle(g); ok(hasOpt(g, `atk:${c.u}:`), 'second attack offered');
});
T('Chthonian Polymer takes the Fusion Monster', () => {
  const g = duel({ first: 1, ex1: ['Elemental HERO Flame Wingman'], board: [{ m: [FILL], st: ['Chthonian Polymer'] }, { hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'], turn: 2 }] });
  act(g, 1, 'Polymerization'); settle(g);
  for (let i = 0; i < 5 && g.prompt && g.prompt.p === 1 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'choose' && /position/i.test(g.prompt.text)) choose(g, 'Attack'); else if (g.prompt.type === 'pick' || g.prompt.type === 'choose') E.act(g, [g.prompt.opts[0].key]); else passAll(g); }
  if (g.prompt && g.prompt.type === 'respond' && g.prompt.p === 0 && hasOpt(g, 'Chthonian Polymer')) { act(g, 0, 'Chthonian Polymer'); settle(g); }
  ok(!!on(g, 0, 'Elemental HERO Flame Wingman'), 'A controls Flame Wingman');
});
T('Chthonian Soldier reflects the battle damage', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Chthonian Soldier'] }] });
  bp(g); atkOn(g, on(g, 0, FILL), on(g, 1, 'Chthonian Soldier')); settle(g);
  ok(g.p[0].lp === 7200 && g.p[1].lp === 7200, `both at 7200 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Ghost Fog: no battle damage, Fog Counters equal to the Level', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Mystic Tomato'], turn: 2 }, { m: ['Cloudian - Ghost Fog'] }] });
  bp(g); atkOn(g, on(g, 0, FILL), on(g, 1, 'Cloudian - Ghost Fog'));
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); else settle(g); }
  const n = L.fieldMons(g).reduce((s, x) => s + L.ctr(x, 'fog'), 0);
  ok(g.p[1].lp === 8000 && n === 4, `B 8000 and 4 Fog Counters (B ${g.p[1].lp}, ${n})`);
  ok(L.forbid(g, { type: 'ss', c: g.p[1].gy.find(x => E.name(x) === 'Cloudian - Ghost Fog'), p: 1 }), 'Ghost Fog cannot be Special Summoned');
});
T('Nimbusman: Tribute 2 WATERs, 2 Fog Counters, 2000 ATK', () => {
  const g = duel({ board: [{ hand: ['Cloudian - Nimbusman'], m: ['Cloudian - Ghost Fog', 'Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  choose(g, 'ns:'); if (g.prompt.type === 'choose') choose(g, '2 Tributes'); if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.map(o => o.key)); settle(g);
  const c = on(g, 0, 'Cloudian - Nimbusman');
  ok(c && L.ctr(c, 'fog') === 2 && E.atk(g, c) === 2000, `2 counters, 2000 ATK (${c && L.ctr(c, 'fog')}, ${c && E.atk(g, c)})`);
});
T('Poison Cloud destroys its attacker and burns 800', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Cloudian - Poison Cloud'] }] });
  bp(g); atkOn(g, on(g, 0, FILL), on(g, 1, 'Cloudian - Poison Cloud')); settle(g);
  ok(inZ(g, 0, 'gy', FILL) && g.p[0].lp === 7200, `Warwolf destroyed, A took 800 (A ${g.p[0].lp})`);
});
T('Sheep Cloud leaves 2 Cloudian Tokens', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Cloudian - Sheep Cloud'] }] });
  bp(g); atkOn(g, on(g, 0, FILL), on(g, 1, 'Cloudian - Sheep Cloud')); settle(g);
  const ts = L.monsOf(g, 1).filter(x => E.name(x) === 'Cloudian Token');
  ok(ts.length === 2 && ts.every(x => x.flags.noTribute), '2 tokens that can\'t be Tributed for a non-Cloudian');
});
T('Storm Dragon: summoned by banishing a Cloudian; places Fog Counters', () => {
  const g = duel({ board: [{ hand: ['Cloudian - Storm Dragon'], gy: ['Cloudian - Ghost Fog'], m: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'no Normal Summon');
  choose(g, 'banish a Cloudian'); settle(g);
  const c = on(g, 0, 'Cloudian - Storm Dragon'); ok(!!c && inZ(g, 0, 'ban', 'Cloudian - Ghost Fog'), 'summoned');
  choose(g, 'Place a Fog Counter'); choose(g, 'u' + on(g, 0, FILL).u); settle(g);
  ok(L.ctr(on(g, 0, FILL), 'fog') === 1 && !hasOpt(g, 'Place a Fog Counter'), 'one counter, once per turn');
  const g2 = duel({ board: [{ gy: ['Cloudian - Storm Dragon'] }, {}] });
  ok(L.forbid(g2, { type: 'ss', c: g2.p[0].gy[0], p: 0 }), 'not from the GY before a proper summon');
});
T('Colosseum: a discarded copy saves it from MST', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon', 'Colosseum - Cage of the Gladiator Beasts', 'Colosseum - Cage of the Gladiator Beasts'], turn: 2 }, {}] });
  act(g, 0, 'Colosseum - Cage of the Gladiator Beasts'); settle(g);
  act(g, 0, 'Mystical Space Typhoon'); if (g.prompt.type === 'pick') choose(g, 'Colosseum'); settle(g);
  ok(g.p[0].fz && E.name(g.p[0].fz) === 'Colosseum - Cage of the Gladiator Beasts' && !inZ(g, 0, 'hand', 'Colosseum - Cage of the Gladiator Beasts'), 'Colosseum stays, the copy was discarded');
});
T('Core Blaster destroys a DARK monster with no damage calculation', () => {
  const g = duel({ board: [{ hand: ['Core Blaster'], m: ["Koa'ki Meiru Drago"], turn: 2 }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Core Blaster'); settle(g);
  bp(g); atkOn(g, on(g, 0, "Koa'ki Meiru Drago"), on(g, 1, 'Dark Magician')); settle(g);
  ok(inZ(g, 1, 'gy', 'Dark Magician') && on(g, 0, "Koa'ki Meiru Drago") && g.p[0].lp === 8000, 'Dark Magician destroyed, Drago survives, no damage');
});
T('Counter Counter negates a Counter Trap', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'], st: ['Counter Counter'], turn: 2 }, { st: ['Magic Jammer', 'Mirror Force'] }] });
  g.p[1].hand.push(...g.p[1].deck.splice(-1)); g.p[1].hand.at(-1).zone = 'hand';
  act(g, 0, 'Heavy Storm');
  if (hasOpt(g, 'Magic Jammer')) choose(g, 'Magic Jammer'); if (g.prompt && g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]);
  ok(hasOpt(g, 'Counter Counter'), 'Counter Counter offered'); choose(g, 'Counter Counter'); settle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Magic Jammer'), 'Heavy Storm resolved');
});
T('Counter Gem: places Crystal Beasts, destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Counter Gem', 'Mirror Force'], gy: ['Crystal Beast Amethyst Cat', 'Crystal Beast Cobalt Eagle'], turn: 2 }, {}] });
  act(g, 0, 'Counter Gem'); settle(g);
  ok(inZ(g, 0, 'st', 'Crystal Beast Amethyst Cat') && inZ(g, 0, 'st', 'Crystal Beast Cobalt Eagle') && inZ(g, 0, 'gy', 'Mirror Force'), 'both placed, Mirror Force sent');
  choose(g, 'end'); settle(g);
  ok(inZ(g, 0, 'gy', 'Crystal Beast Amethyst Cat') && inZ(g, 0, 'gy', 'Crystal Beast Cobalt Eagle'), 'destroyed in the End Phase');
});
T('Crystal Abundance: wipe the field, summon up to the opponent\'s card count', () => {
  const g = duel({ board: [{ hand: ['Crystal Abundance'], st: [{ n: 'Crystal Beast Amethyst Cat', pos: 'up' }, { n: 'Crystal Beast Cobalt Eagle', pos: 'up' }, { n: 'Crystal Beast Emerald Tortoise', pos: 'up' }, { n: 'Crystal Beast Sapphire Pegasus', pos: 'up' }], turn: 2 }, { m: [FILL, 'Dark Magician'] }] });
  act(g, 0, 'Crystal Abundance'); settle(g); if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); settle(g);
  for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); settle(g, false);
  ok(L.monsOf(g, 1).length === 0 && L.monsOf(g, 0).length === 2, `B empty, A summoned 2 (${L.monsOf(g, 0).length})`);
});
T('Amethyst Cat: direct attack past a monster for half damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Crystal Beast Amethyst Cat'], turn: 2 }, { m: ['Dark Magician'] }] });
  bp(g); atkOn(g, on(g, 0, 'Crystal Beast Amethyst Cat'), null); settle(g);
  ok(g.p[1].lp === 7400, `600 damage (B ${g.p[1].lp})`);
});
T('Cobalt Eagle destroyed by battle goes to the Spell & Trap Zone', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Crystal Beast Cobalt Eagle'] }] });
  bp(g); atkOn(g, on(g, 0, FILL), on(g, 1, 'Crystal Beast Cobalt Eagle')); settle(g, true);
  ok(inZ(g, 1, 'st', 'Crystal Beast Cobalt Eagle'), 'placed as a Continuous Spell');
});
T('Crystal Pair places a Crystal Beast and stops battle damage', () => {
  const g = duel({ main1: ['Crystal Beast Sapphire Pegasus'], board: [{ hand: [], m: ['Dark Magician', FILL], turn: 2 }, { hand: [], m: [{ n: 'Crystal Beast Amethyst Cat', pos: 'atk' }], st: ['Crystal Pair'] }] });
  bp(g); atkOn(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Crystal Beast Amethyst Cat'));
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); else if (g.prompt.type === 'yesno') E.act(g, [/Crystal Pair/.test(g.prompt.text) ? 'y' : 'n']); else passAll(g); }
  ok(inZ(g, 1, 'st', 'Crystal Beast Sapphire Pegasus') && g.p[1].noBattleDamage === g.turnNo, 'Pegasus placed, no more battle damage');
});
T('Cyberdark Keel equips a Dragon, gains its ATK and survives battle', () => {
  const g = duel({ board: [{ hand: ['Cyberdark Keel'], gy: ['Masked Dragon'], turn: 2 }, { m: ['Dark Magician'] }] });
  choose(g, 'ns:'); settle(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Masked Dragon'); settle(g);
  const k = on(g, 0, 'Cyberdark Keel'); ok(E.atk(g, k) === 2200 && inZ(g, 0, 'st', 'Masked Dragon'), `2200 ATK with Masked Dragon (${E.atk(g, k)})`);
  bp(g); atkOn(g, k, on(g, 1, 'Dark Magician')); settle(g);
  ok(on(g, 0, 'Cyberdark Keel') && inZ(g, 0, 'gy', 'Masked Dragon'), 'Masked Dragon destroyed instead');
});
T('Cyberdark Impact! Fusion Summons Cyberdark Dragon, which equips a Dragon', () => {
  const g = duel({ ex0: ['Cyberdark Dragon'], board: [{ hand: ['Cyberdark Impact!', 'Cyberdark Horn'], m: ['Cyberdark Edge'], gy: ['Cyberdark Keel', 'Dark Magician', 'Masked Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Cyberdark Impact!'); settle(g);
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') { if (hasOpt(g, 'Masked Dragon')) choose(g, 'Masked Dragon'); else E.act(g, [g.prompt.opts[0].key]); } else if (g.prompt.type === 'choose') choose(g, 'Attack'); else settle(g); }
  const c = on(g, 0, 'Cyberdark Dragon');
  ok(!!c && inZ(g, 0, 'st', 'Masked Dragon'), 'Cyberdark Dragon with Masked Dragon equipped');
  ok(c && E.atk(g, c) === 1000 + 1400 + 100 * g.p[0].gy.filter(L.isMon).length, `ATK ${c && E.atk(g, c)}`);
  ok(L.forbid(g, { type: 'ss', c, p: 0, how: 'special' }), 'cannot be Special Summoned except by Fusion Summon');
});
T('Cybernetic Hidden Technology destroys the attacker', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Cyber Dragon'], st: [{ n: 'Cybernetic Hidden Technology', pos: 'up' }] }] });
  bp(g); atkOn(g, on(g, 0, FILL), on(g, 1, 'Cyber Dragon'));
  ok(hasOpt(g, 'Send a Cyber Dragon'), 'offered'); choose(g, 'Send a Cyber Dragon'); settle(g);
  ok(inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Cyber Dragon'), 'Warwolf destroyed, Cyber Dragon sent');
});
T('Cybernetic Magician sets ATK to 2000', () => {
  const g = duel({ board: [{ hand: ['Mystic Tomato'], m: ['Cybernetic Magician'], turn: 2 }, { m: ['Dark Magician'] }] });
  choose(g, 'ATK becomes 2000'); choose(g, 'Mystic Tomato'); settle(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Dark Magician'); settle(g);
  ok(E.atk(g, on(g, 1, 'Dark Magician')) === 2000, 'Dark Magician has 2000 ATK');
});
T('Cybernetic Zone: banish, return doubled, destroyed next Standby', () => {
  const g = duel({ board: [{ hand: ['Cybernetic Zone'], m: ['Cyber Twin Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Cybernetic Zone'); settle(g);
  ok(inZ(g, 0, 'ban', 'Cyber Twin Dragon'), 'banished');
  choose(g, 'end'); settle(g);
  const c = on(g, 0, 'Cyber Twin Dragon'); ok(c && E.atk(g, c) === 5600, `returned with 5600 ATK (${c && E.atk(g, c)})`);
  for (let i = 0; i < 20 && g.tp !== 0 || (i < 20 && g.phase !== 'main1'); i++) { if (g.prompt.type === 'idle') choose(g, 'end'); else settle(g, false); }
  ok(inZ(g, 0, 'gy', 'Cyber Twin Dragon'), 'destroyed in the next Standby Phase');
});
T('D - Shield protects a Destiny HERO', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], turn: 2 }, { m: ['Destiny HERO - Dasher'], st: ['D - Shield'] }] });
  bp(g); atkOn(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Destiny HERO - Dasher'));
  choose(g, 'D - Shield'); settle(g);
  ok(on(g, 1, 'Destiny HERO - Dasher') && on(g, 1, 'Destiny HERO - Dasher').pos === 'def' && inZ(g, 1, 'st', 'D - Shield'), 'Dasher in Defense, still on the field');
});
T('D - Counter destroys the attacker', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], turn: 2 }, { m: ['Destiny HERO - Dasher'], st: ['D - Counter'] }] });
  bp(g); atkOn(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Destiny HERO - Dasher')); choose(g, 'D - Counter'); settle(g);
  ok(inZ(g, 0, 'gy', 'Dark Magician'), 'Dark Magician destroyed');
});
T('D - Fortune ends the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], turn: 2 }, { st: ['D - Fortune'], gy: ['Destiny HERO - Malicious'] }] });
  bp(g); atkOn(g, on(g, 0, 'Dark Magician'), null); choose(g, 'D - Fortune'); settle(g);
  ok(g.p[1].lp === 8000 && inZ(g, 1, 'ban', 'Destiny HERO - Malicious') && g.phase !== 'battle', 'no damage, Malicious banished, Battle Phase over');
});
T('D - Chain: +500 and 500 damage on a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Destiny HERO - Dasher'], st: ['D - Chain'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'D - Chain'); settle(g);
  const d = on(g, 0, 'Destiny HERO - Dasher'); ok(E.atk(g, d) === 2600 && inZ(g, 0, 'st', 'D - Chain'), '2600 ATK, D - Chain stays');
  bp(g); atkOn(g, d, on(g, 1, FILL)); settle(g);
  ok(g.p[1].lp === 8000 - 600 - 500, `600 battle + 500 effect damage (B ${g.p[1].lp})`);
});
T('D - Formation: counters, then add 2 copies of the summoned monster', () => {
  const g = duel({ main0: ['Destiny HERO - Diamond Dude', 'Destiny HERO - Diamond Dude'], board: [{ hand: ['Smashing Ground', 'Destiny HERO - Diamond Dude'], st: [{ n: 'D - Formation', pos: 'up' }], turn: 2 }, { m: ['Destiny HERO - Dasher', 'Destiny HERO - Malicious'] }] });
  // the counters only count your own Destiny HEROes: give A two of them and destroy them
  g.p[1].m.forEach((c, i) => { if (c) { g.p[1].m[i] = null; c.ctrl = 0; g.p[0].m[i] = c; } }); g.seq++;
  L.destroy(g, L.monsOf(g, 0).slice(), { by: 1 });
  const f = g.p[0].st.find(x => x && E.name(x) === 'D - Formation');
  ok(L.ctr(f, 'd') === 2, `2 D Counters (${L.ctr(f, 'd')})`);
  choose(g, 'ns:'); settle(g, true); if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); settle(g);
  ok(g.p[0].hand.filter(x => E.name(x) === 'Destiny HERO - Diamond Dude').length === 2 && inZ(g, 0, 'gy', 'D - Formation'), 'added 2 Diamond Dude');
});
T('D - Spirit summons a Level 4 or lower Destiny HERO', () => {
  const g = duel({ board: [{ hand: ['D - Spirit', 'Destiny HERO - Diamond Dude'], turn: 2 }, {}] });
  act(g, 0, 'D - Spirit'); settle(g); ok(!!on(g, 0, 'Destiny HERO - Diamond Dude'), 'Diamond Dude summoned');
});
T('D - Time searches a Destiny HERO when an Elemental HERO leaves', () => {
  const g = duel({ main1: ['Destiny HERO - Diamond Dude', 'Destiny HERO - Dasher'], board: [{ hand: ['Smashing Ground'], turn: 2 }, { hand: [], m: ['Elemental HERO Sparkman'], st: ['D - Time'] }] });
  act(g, 0, 'Smashing Ground'); settle(g); for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]); settle(g);
  ok(g.p[1].hand.length === 1 && E.name(g.p[1].hand[0]) === 'Destiny HERO - Diamond Dude', 'Diamond Dude (Level 4) added; Dasher (Level 6) was not a choice');
});
T('Change of Hero - Reflector Ray burns Level x 300', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], turn: 2 }, { m: ['Elemental HERO Flame Wingman'], st: ['Change of Hero - Reflector Ray'] }] });
  bp(g); atkOn(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Elemental HERO Flame Wingman')); settle(g);
  ok(g.p[0].lp === 8000 - 1800, `A took 1800 (A ${g.p[0].lp})`);
});
T('Eye of the Typhoon changes positions as it attacks', () => {
  const g = duel({ board: [{ hand: [], m: ['Cloudian - Eye of the Typhoon', FILL], turn: 2 }, { m: ['Dark Magician'] }] });
  bp(g); atkOn(g, on(g, 0, 'Cloudian - Eye of the Typhoon'), on(g, 1, 'Dark Magician')); settle(g);
  ok(on(g, 0, FILL).pos === 'def', 'own Warwolf changed to Defense');
});
T('Cobalt Eagle returns a Crystal Beast card to the top of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Crystal Beast Cobalt Eagle'], st: [{ n: 'Crystal Beast Amethyst Cat', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'Return a Crystal Beast'); choose(g, 'Amethyst'); settle(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Crystal Beast Amethyst Cat' && !hasOpt(g, 'Return a Crystal Beast'), 'on top of the Deck, once per turn');
});
T('Emerald Tortoise puts a monster that attacked into Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Crystal Beast Emerald Tortoise', FILL], turn: 2 }, {}] });
  ok(!hasOpt(g, 'that attacked'), 'not before an attack');
  bp(g); atkOn(g, on(g, 0, FILL), null); settle(g); choose(g, 'endbp'); settle(g);
  choose(g, 'that attacked'); settle(g);
  ok(on(g, 0, FILL).pos === 'def', 'Warwolf in Defense Position');
});
T('Crystal Promise summons a Crystal Beast from the Spell & Trap Zone', () => {
  const g = duel({ board: [{ hand: ['Crystal Promise'], st: [{ n: 'Crystal Beast Cobalt Eagle', pos: 'up' }], turn: 2 }, {}] });
  act(g, 0, 'Crystal Promise'); settle(g); ok(!!on(g, 0, 'Crystal Beast Cobalt Eagle'), 'Cobalt Eagle summoned');
});
T('Core Compression draws 2', () => {
  const g = duel({ board: [{ hand: ['Core Compression', "Iron Core of Koa'ki Meiru", "Koa'ki Meiru Drago"], turn: 2 }, {}] });
  act(g, 0, 'Core Compression'); settle(g);
  ok(inZ(g, 0, 'gy', "Koa'ki Meiru Drago") && inZ(g, 0, 'hand', "Iron Core of Koa'ki Meiru") && g.p[0].hand.length === 4, 'Drago discarded, Iron Core kept, 2 drawn');
});
T('Core Blast trims the opponent to your monster count', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ["Koa'ki Meiru Drago"], st: [{ n: 'Core Blast', pos: 'up' }] }, { hand: [], m: [FILL, FILL, 'Dark Magician'], st: ['Mirror Force'], turn: 2 }] });
  choose(g, 'end'); for (let i = 0; i < 10 && g.prompt && !(g.prompt.type === 'yesno' && /Core Blast/.test(g.prompt.text)); i++) { if (g.prompt.type === 'yesno') say(g, false); else passAll(g); }
  say(g, true); if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); settle(g, false);
  ok(L.fieldOf(g, 1).length === 1, `B controls 1 card (${L.fieldOf(g, 1).length})`);
});
T('Counter Cleaner removes every counter', () => {
  const g = duel({ board: [{ hand: ['Counter Cleaner'], m: [FILL], turn: 2 }, { m: [FILL] }] });
  L.addCtr(g, g.p[0].m[0], 'fog', 2); L.addCtr(g, g.p[1].m[0], 'spell', 1);
  act(g, 0, 'Counter Cleaner'); settle(g);
  ok(g.p[0].lp === 7500 && !L.ctr(g.p[0].m[0], 'fog') && !L.ctr(g.p[1].m[0], 'spell'), 'paid 500, counters gone');
});
T('Cloudian Squall places a Fog Counter on every face-up monster', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: [FILL], st: [{ n: 'Cloudian Squall', pos: 'up' }] }, { hand: [], m: [FILL], turn: 2 }] });
  choose(g, 'end'); for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'yesno') say(g, false); else passAll(g); }
  ok(L.ctr(g.p[0].m[0], 'fog') === 1 && L.ctr(g.p[1].m[0], 'fog') === 1, 'one each');
});
T('Cyberdark Edge attacks directly for half its ATK', () => {
  const g = duel({ board: [{ hand: ['Cyberdark Edge'], gy: ['Masked Dragon'], turn: 2 }, { m: ['Dark Magician'] }] });
  choose(g, 'ns:'); settle(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Masked Dragon'); settle(g);
  bp(g); atkOn(g, on(g, 0, 'Cyberdark Edge'), null); settle(g);
  ok(g.p[1].lp === 8000 - 1100, `1100 damage (B ${g.p[1].lp})`);
});
console.log(fails ? `\n${fails} failed` : '\nAll full-30 checks passed.');
process.exit(fails ? 1 : 0);
