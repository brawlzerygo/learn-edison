// Scenario checks for full pool batch 24: node build/test_full-24.js
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
const endTurn = g => { choose(g, 'end'); auto(g); };
const UP = n => ({ n, pos: 'up' });
const SET = n => ({ n, pos: 'set' });

T('Labyrinth of Nightmare changes the turn player\'s monsters in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: [UP('Labyrinth of Nightmare')] }, { m: [FILL] }] });
  endTurn(g);
  ok(g.p[0].m[0].pos === 'def' && g.p[1].m[0].pos === 'atk', 'A\'s monster went to Defense, B\'s stayed');
});
T('Legacy Hunter returns a random card after killing a face-down monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Legacy Hunter'], turn: 2 }, { m: [SET('Kuriboh')] }] });
  const h = g.p[1].hand.length; goBP(g); attack(g, on(g, 0, 'Legacy Hunter'), g.p[1].m[0]); auto(g);
  ok(inZ(g, 1, 'gy', 'Kuriboh') && g.p[1].hand.length === h - 1, `B lost a hand card (${h} -> ${g.p[1].hand.length})`);
});
T('Lekunga banishes 2 WATER for a token', () => {
  const g = duel({ board: [{ hand: [], m: ['Lekunga'], gy: ['Maiden of the Aqua', 'Mermaid Knight'] }, {}] });
  choose(g, 'Lekunga Token'); auto(g);
  ok(g.p[0].m.some(c => c && E.name(c) === 'Lekunga Token') && g.p[0].ban.length === 2, 'token summoned, 2 banished');
});
T('Life Absorbing Machine gives back half the LP paid last turn', () => {
  const g = duel({ board: [{ hand: ['Premature Burial'], gy: [FILL], st: [UP('Life Absorbing Machine')] }, {}] });
  act(g, 0, 'Premature Burial'); auto(g);
  ok(g.p[0].lp === 7200, 'paid 800'); endTurn(g); endTurn(g);
  ok(g.p[0].lp === 7600, `gained 400 in the next Standby Phase (${g.p[0].lp})`);
});
T('Lighten the Load shuffles a Level 7 in and draws', () => {
  const g = duel({ board: [{ hand: ['Dark Magician'], st: [UP('Lighten the Load')] }, {}] });
  const n0 = g.p[0].hand.length; choose(g, 'Shuffle a Level 7'); auto(g);
  ok(!inZ(g, 0, 'hand', 'Dark Magician') && g.p[0].hand.length === n0, 'Dark Magician shuffled in, 1 card drawn');
});
T('Lightforce Sword banishes and returns on their 4th Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Lightforce Sword'], turn: 2 }, { hand: ['Dark Hole'] }] });
  act(g, 0, 'Lightforce Sword'); auto(g);
  ok(inZ(g, 1, 'ban', 'Dark Hole'), 'Dark Hole banished');
  for (let i = 0; i < 7; i++) { if (g.tp === 1 && inZ(g, 1, 'hand', 'Dark Hole')) break; endTurn(g); }
  ok(inZ(g, 1, 'hand', 'Dark Hole') && g.turnNo === 9, `back in B's hand on turn ${g.turnNo}`);
});
T('Lone Wolf: its monster survives battle', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Monk Fighter', pos: 'atk' }], st: ['Lone Wolf'] }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Lone Wolf'); auto(g); endTurn(g);
  goBP(g); attack(g, on(g, 1, 'Cyber Dragon'), on(g, 0, 'Monk Fighter')); auto(g);
  ok(on(g, 0, 'Monk Fighter'), 'Monk Fighter survived the attack');
});
T('Lord of D. stops targeting Dragons', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: ['Lord of D.'] }, { m: [UP('Cyber Dragon'), 'Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Book of Moon'); const pr = g.prompt;
  ok(pr && !pr.opts.some(o => /Blue-Eyes/.test(o.label)), 'Blue-Eyes is not a target');
});
T('Lost Guardian DEF from banished Rocks', () => {
  const g = duel({ board: [{ hand: [], m: ['Lost Guardian'], ban: ['Giant Soldier of Stone', 'Medusa Worm', FILL] }, {}] });
  ok(E.def(g, on(g, 0, 'Lost Guardian')) === 1400, 'DEF 1400');
});
T('Luminous Soldier gains 500 against a DARK', () => {
  const g = duel({ board: [{ hand: [], m: ['Luminous Soldier'], turn: 2 }, { m: ['Dark Magician'] }] });
  goBP(g); attack(g, on(g, 0, 'Luminous Soldier'), on(g, 1, 'Dark Magician')); auto(g);
  ok(inZ(g, 1, 'gy', 'Dark Magician') && g.p[1].lp === 7900, `Dark Magician destroyed, 100 damage (${g.p[1].lp})`);
});
T('Magician of Faith returns a Spell', () => {
  const g = duel({ board: [{ hand: [], m: [SET('Magician of Faith')], gy: ['Pot of Greed'], turn: 2 }, {}] });
  choose(g, 'flip:'); auto(g);
  ok(inZ(g, 0, 'hand', 'Pot of Greed'), 'Pot of Greed back in hand');
});
T('Magician\'s Circle summons a Spellcaster for each player', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], deckTop: [FILL, 'Skilled Dark Magician'], turn: 2 }, { st: ['Magician\'s Circle'], deckTop: ['Breaker the Magical Warrior'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), null); choose(g, 'Magician', 1); auto(g);
  ok(inZ(g, 0, 'gy', 'Magician\'s Circle') || inZ(g, 1, 'gy', 'Magician\'s Circle'), 'Circle used');
  ok(g.log.includes('B Special Summoned Breaker the Magical Warrior.') && on(g, 0, 'Skilled Dark Magician'), 'both players summoned');
});
T('Maharaghi returns and lets you look at the top card', () => {
  const g = duel({ board: [{ hand: ['Maharaghi'] }, {}] });
  choose(g, 'ns:'); auto(g); endTurn(g);
  ok(inZ(g, 0, 'hand', 'Maharaghi'), 'back in hand');
  choose(g, 'end'); let looked = false;
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'choose' && /Maharaghi/.test(g.prompt.text)) { looked = true; choose(g, 'bottom'); } else auto(g); }
  ok(looked, 'looked at the top card before the next draw');
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].hand.find(c => E.name(c) === 'Maharaghi'), p: 0 }), 'can\'t be Special Summoned');
});
T('Maiden of the Aqua lets Mermaid Knight attack twice', () => {
  const g = duel({ board: [{ hand: [], m: ['Maiden of the Aqua', 'Mermaid Knight'], turn: 2 }, {}] });
  const k = on(g, 0, 'Mermaid Knight'); goBP(g); attack(g, k, null); auto(g); attack(g, k, null); auto(g);
  ok(g.p[1].lp === 8000 - 3000, `two direct attacks (${g.p[1].lp})`);
});
T('Maji-Gire Panda gains 500 when a Beast is destroyed', () => {
  const g2 = duel({ board: [{ hand: [], m: ['Maji-Gire Panda', 'Cyber Dragon'], turn: 2 }, { m: ['Rescue Cat'] }] });
  goBP(g2); attack(g2, on(g2, 0, 'Cyber Dragon'), g2.p[1].m[0]); auto(g2);
  ok(E.atk(g2, on(g2, 0, 'Maji-Gire Panda')) === 1500, 'Panda at 1500');
});
T('Major Riot after Compulsory Evacuation Device', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: ['Compulsory Evacuation Device'], turn: 2 }, { hand: ['Kuriboh', 'Sangan'], m: [FILL, 'Mine Golem'], st: ['Major Riot'] }] });
  act(g, 0, 'Compulsory Evacuation Device'); choose(g, FILL); auto(g);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'yesno') E.act(g, ['y']); else if (pr.type === 'pick') E.act(g, pr.opts.slice(0, pr.min).map(x => x.key)); else E.act(g, [pr.opts.find(x => x.key === 'pass') ? 'pass' : pr.opts[0].key]); }
  ok(inZ(g, 1, 'gy', 'Major Riot') && inZ(g, 0, 'hand', 'Cyber Dragon'), 'Major Riot resolved, Cyber Dragon returned');
  ok(g.p[1].m.filter(Boolean).every(c => c.pos === 'set') && g.p[1].m.filter(Boolean).length === 1 && g.p[0].m.filter(Boolean).length === 1 && g.p[0].m.filter(Boolean)[0].pos === 'set', 'each player Set 1 monster (one returned each)');
});
T('Maju Garzett takes its Tributes\' ATK', () => {
  const g = duel({ board: [{ hand: ['Maju Garzett'], m: [FILL, 'Cyber Dragon'] }, {}] });
  choose(g, 'ns:'); auto(g);
  ok(E.atk(g, on(g, 0, 'Maju Garzett')) === 4100, 'ATK 4100');
});
T('Man-Thro\' Tro\' tributes a Normal Monster for 800', () => {
  const g = duel({ board: [{ hand: [], m: ['Man-Thro\' Tro\'', FILL] }, {}] });
  choose(g, '800 damage'); auto(g);
  ok(g.p[1].lp === 7200, 'B at 7200');
});
T('Manticore of Darkness comes back in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Manticore of Darkness'], m: [FILL] }, {}] });
  E.lib.move(g, g.p[0].hand.find(c => E.name(c) === 'Manticore of Darkness'), 'gy', { reason: 'discard' });
  choose(g, 'end'); auto(g);
  ok(on(g, 0, 'Manticore of Darkness') && inZ(g, 0, 'gy', FILL), 'Manticore back, Warwolf sent');
});
T('Marauding Captain summons and shields Warriors', () => {
  const g = duel({ board: [{ hand: ['Marauding Captain', 'Legacy Hunter'] }, { m: [FILL] }] });
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Marauding Captain').u); auto(g);
  ok(on(g, 0, 'Legacy Hunter'), 'Legacy Hunter summoned');
  endTurn(g); goBP(g);
  ok(hasOpt(g, 'Attack Marauding') && !hasOpt(g, 'Attack Legacy'), 'only the Captain can be attacked');
});
T('Maryokutai negates an opponent\'s Spell', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [FILL], turn: 2 }, { m: ['Maryokutai'] }] });
  act(g, 0, 'Dark Hole'); choose(g, 'negate the Spell', 1); auto(g);
  ok(on(g, 0, FILL) && inZ(g, 0, 'gy', 'Dark Hole') && inZ(g, 1, 'gy', 'Maryokutai'), 'Dark Hole negated');
});
T('Mass Driver burns for each Tribute', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, FILL], st: [UP('Mass Driver')] }, {}] });
  choose(g, '400 damage'); auto(g); choose(g, '400 damage'); auto(g);
  ok(g.p[1].lp === 7200, 'B at 7200');
});
T('Mataza can\'t change control', () => {
  const g = duel({ board: [{ hand: ['Change of Heart'] }, { m: ['Mataza the Zapper'] }] });
  act(g, 0, 'Change of Heart'); auto(g);
  ok(on(g, 1, 'Mataza the Zapper'), 'Mataza stays with B');
});
T('Mazera DeVille: summoned from Warrior of Zera, discards 3', () => {
  const g2 = duel({ board: [{ hand: ['Pandemonium', 'Mazera DeVille'], m: ['Warrior of Zera'], turn: 2 }, { hand: [FILL, FILL, FILL, FILL] }] });
  act(g2, 0, 'Pandemonium'); auto(g2);
  choose(g2, 'sp:'); auto(g2);
  ok(on(g2, 0, 'Mazera DeVille') && g2.p[1].hand.length === 1, `Mazera out, B has ${g2.p[1].hand.length} card`);
});
T('Mecha-Dog Marron burns both on battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Mecha-Dog Marron'] }] });
  goBP(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, 'Mecha-Dog Marron')); auto(g);
  ok(g.p[0].lp === 7000 && g.p[1].lp === 8000 - 1100 - 1000, `A ${g.p[0].lp}, B ${g.p[1].lp}`);
});
T('Medusa Worm destroys on Flip Summon and turns face-down', () => {
  const g = duel({ board: [{ hand: [], m: [SET('Medusa Worm')], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'flip:'); auto(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon'), 'Cyber Dragon destroyed');
  const g2 = duel({ board: [{ hand: [], m: ['Medusa Worm'] }, {}] });
  choose(g2, 'Flip it face-down'); auto(g2);
  ok(g2.p[0].m[0].pos === 'set' && !hasOpt(g2, 'flip:'), 'face-down, no Flip Summon this turn');
});
T('Mefist pierces and discards', () => {
  const g = duel({ board: [{ hand: [], m: ['Mefist the Infernal General'], turn: 2 }, { hand: [FILL], m: [{ n: 'Kuriboh', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Mefist the Infernal General'), on(g, 1, 'Kuriboh')); auto(g);
  ok(g.p[1].lp === 8000 - 1600 && g.p[1].hand.length === 0, `pierced ${g.p[1].lp}, hand ${g.p[1].hand.length}`);
});
T('Megamorph doubles at lower LP', () => {
  const g = duel({ board: [{ hand: ['Megamorph'], m: ['Cyber Dragon'], lp: 4000 }, {}] });
  act(g, 0, 'Megamorph'); auto(g);
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 4200, 'ATK 4200');
});
T('Megarock Dragon from 3 Rocks', () => {
  const g = duel({ board: [{ hand: ['Megarock Dragon'], gy: ['Giant Soldier of Stone', 'Medusa Worm', 'Mine Golem'] }, {}] });
  choose(g, 'sp:'); for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.map(x => x.key)); auto(g);
  const m = on(g, 0, 'Megarock Dragon');
  ok(m && E.atk(g, m) === 2100 && E.def(g, m) === 2100, 'Megarock 2100/2100');
});
T('Metalmorph adds half the target\'s ATK when attacking', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Metalmorph'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Metalmorph'); auto(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2300, '2300 ATK');
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Cyber Dragon')); auto(g);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && g.p[1].lp === 8000 - (2300 + 1050 - 2100), `Cyber Dragon destroyed (${g.p[1].lp})`);
});
T('Metalsilver Armor stops their targeting of your other monsters', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: ['Cyber Dragon'] }, { m: [FILL, 'Kuriboh'], st: [UP('Metalsilver Armor')] }] });
  g.p[1].st[0].equipTo = g.p[1].m[0].u; g.seq++;
  act(g, 0, 'Book of Moon'); auto(g);
  ok(g.p[1].m[0].pos === 'set' && g.p[1].m[1].pos !== 'set', 'Book of Moon could only target the equipped Warwolf');
});
T('Metalzoa from Zoa with Metalmorph', () => {
  const g = duel({ board: [{ hand: [], m: ['Zoa'], st: ['Metalmorph'], deckTop: [FILL, 'Metalzoa'], turn: 2 }, {}] });
  act(g, 0, 'Metalmorph'); auto(g);
  goBP(g); choose(g, 'endbp'); auto(g);
  ok(on(g, 0, 'Metalzoa') && inZ(g, 0, 'gy', 'Zoa'), 'Metalzoa summoned at the end of the Battle Phase');
});
T('Metamorphosis turns a Level 4 into a Level 4 Fusion', () => {
  const g = duel({ ex0: ['Labyrinth Tank'], board: [{ hand: ['Metamorphosis'], m: ['Mataza the Zapper'] }, {}] });
  ok(!hasOpt(g, 'a:' + g.p[0].hand[0].u), 'no Level 3 Fusion: no activation');
});
T('Meteorain gives piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: ['Meteorain'], turn: 2 }, { m: [{ n: 'Kuriboh', pos: 'def' }] }] });
  act(g, 0, 'Meteorain'); auto(g); goBP(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, 'Kuriboh')); auto(g);
  ok(g.p[1].lp === 8000 - 1900, `pierced (${g.p[1].lp})`);
});
T('Michizure destroys after your monster dies', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon', FILL], turn: 2 }, { m: ['Kuriboh'], st: ['Michizure'] }] });
  goBP(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, 'Kuriboh'));
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'yesno') E.act(g, ['y']); else if (pr.type === 'pick') choose(g, 'Cyber Dragon'); else E.act(g, ['pass']); }
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && inZ(g, 1, 'gy', 'Michizure'), 'Cyber Dragon destroyed by Michizure');
});
T('Micro Ray makes DEF 0', () => {
  const g = duel({ board: [{ hand: [], st: ['Micro Ray'], turn: 2 }, { m: ['Kuriboh'] }] });
  act(g, 0, 'Micro Ray'); auto(g);
  ok(E.def(g, on(g, 1, 'Kuriboh')) === 0, 'DEF 0');
});
T('Mid Shield Gardna negates Nobleman of Crossout', () => {
  const g = duel({ board: [{ hand: ['Nobleman of Crossout'], turn: 2 }, { m: [SET('Mid Shield Gardna')] }] });
  act(g, 0, 'Nobleman of Crossout'); auto(g);
  const m = on(g, 1, 'Mid Shield Gardna');
  ok(m && m.pos === 'def' && inZ(g, 0, 'gy', 'Nobleman of Crossout'), 'Gardna stays, face-up Defense');
});
T('Millennium Scorpion grows', () => {
  const g = duel({ board: [{ hand: [], m: ['Millennium Scorpion'], turn: 2 }, { m: ['Kuriboh'] }] });
  goBP(g); attack(g, on(g, 0, 'Millennium Scorpion'), on(g, 1, 'Kuriboh')); auto(g);
  ok(E.atk(g, on(g, 0, 'Millennium Scorpion')) === 2500, 'ATK 2500');
});
T('Minar burns when the opponent makes you discard', () => {
  const g = duel({ board: [{ hand: ['Delinquent Duo'] }, { hand: ['Minar'] }] });
  act(g, 0, 'Delinquent Duo'); auto(g);
  ok(g.p[0].lp === 8000 - 1000 - 1000, `A paid and took 1000 (${g.p[0].lp})`);
});
T('Mine Golem and Minefield Eruption', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Mine Golem'] }] });
  goBP(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, 'Mine Golem')); auto(g);
  ok(g.p[0].lp === 7500, 'Mine Golem burned 500');
  const g2 = duel({ board: [{ hand: [], m: ['Mine Golem', 'Mine Golem'], st: ['Minefield Eruption'], turn: 2 }, {}] });
  act(g2, 0, 'Minefield Eruption'); auto(g2);
  ok(g2.p[1].lp === 6000 && g2.p[0].gy.length === 3, `2000 damage, both Golems destroyed (B ${g2.p[1].lp})`);
});
T('Minor Goblin Official burns each opponent Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: ['Minor Goblin Official'], turn: 2 }, { lp: 3000 }] });
  act(g, 0, 'Minor Goblin Official'); auto(g); endTurn(g);
  ok(g.p[1].lp === 2500, `B at ${g.p[1].lp}`);
});
T('Mispolymerization returns a Fusion', () => {
  const g = duel({ ex0: ['Elemental HERO Flame Wingman'], board: [{ hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'] }, { st: ['Mispolymerization'] }] });
  act(g, 0, 'Polymerization'); for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { if (hasOpt(g, 'Mispolymerization')) { choose(g, 'Mispolymerization', 1); continue; } const pr = g.prompt; E.act(g, [pr.type === 'respond' ? 'pass' : pr.type === 'yesno' ? 'y' : pr.opts[0].key]); }
  ok(!on(g, 0, 'Elemental HERO Flame Wingman') && inZ(g, 0, 'extra', 'Elemental HERO Flame Wingman'), 'Flame Wingman back in the Extra Deck');
});
T('Larvae Moth from a cocooned Petit Moth', () => {
  const g = duel({ board: [{ hand: ['Cocoon of Evolution', 'Larvae Moth'], m: ['Petit Moth'] }, {}] });
  choose(g, 'Equip to Petit Moth'); auto(g); endTurn(g); endTurn(g); endTurn(g); endTurn(g);
  ok(hasOpt(g, 'sp:'), 'Larvae Moth offered'); choose(g, 'sp:'); auto(g);
  ok(on(g, 0, 'Larvae Moth'), 'summoned');
});
T('Manga Ryu-Ran with Toon World', () => {
  const g = duel({ board: [{ hand: ['Manga Ryu-Ran'], m: [FILL, FILL], st: [UP('Toon World')] }, {}] });
  choose(g, 'sp:'); auto(g);
  ok(on(g, 0, 'Manga Ryu-Ran'), 'summoned');
});
T('Lesser Fiend (Goat) banishes what it destroys', () => {
  const vm = require('vm'), fs = require('fs'), path = require('path'); const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  for (const f of ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js', ...fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort().map(f => 'js/cards/' + f)]) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const GE = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; GE.init(GC, { format: 'goat' });
  const gid = n => GC.find(x => x.n === n).id;
  const mk = () => ({ name: 't', main: Array(40).fill(gid('Kuriboh')), extra: [] });
  const g = GE.newDuel({ decks: [mk(), mk()], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: [{ hand: [], m: ['Lesser Fiend'], turn: 2 }, { m: ['Kuriboh'] }] });
  const ch = t => { const o = g.prompt.opts.find(x => (x.label + ' ' + x.key).includes(t)); GE.act(g, [o.key]); };
  const au = () => { for (let i = 0; i < 40 && g.prompt && g.prompt.type !== 'idle'; i++) GE.act(g, [g.prompt.type === 'respond' ? 'pass' : g.prompt.type === 'yesno' ? 'y' : g.prompt.opts[0].key]); };
  ch('bp'); au(); const a = g.p[0].m[0], t = g.p[1].m[0]; ch(`atk:${a.u}:${t.u}`); au();
  ok(g.p[1].ban.some(c => GE.name(c) === 'Kuriboh') && !g.p[1].gy.some(c => GE.name(c) === 'Kuriboh'), 'Kuriboh banished');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-24 checks passed.');
process.exit(fails ? 1 : 0);
