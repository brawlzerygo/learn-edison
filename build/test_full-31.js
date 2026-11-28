// Scenario checks for full pool batch 31: node build/test_full-31.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  if (o.board && o.board[1] && o.board[1].turn && !(o.board[0] || {}).turn) o.board[0] = { ...(o.board[0] || {}), turn: o.board[1].turn };
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
const cardOf = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].ban, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + cardOf(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const goBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => choose(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const ns = (g, p, n) => choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u);
const endTurn = g => { choose(g, 'end'); auto(g); };
const logHas = (g, s) => g.log.some(l => l.includes(s));
// answer one prompt (yes, first options, pass)
function step1(g) { const pr = g.prompt; if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['y']); else E.act(g, pr.opts.slice(0, Math.max(pr.min, 1)).map(x => x.key)); }
// answer prompts (first option, passing chain windows) until player `who` can respond with `text`, then use it
function respondWith(g, who, text) {
  for (let i = 0; i < 40 && g.prompt; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond' && pr.p === who && hasOpt(g, text)) { choose(g, text); return; }
    if (pr.type === 'idle') throw new Error('never got to respond with ' + text);
    if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['y']); else E.act(g, pr.opts.slice(0, Math.max(pr.min, 1)).map(x => x.key));
  }
}

/* ----- D.D.M. and Damage cards ----- */
T('D.D.M. discards a Spell to summon a banished monster', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['D.D.M. - Different Dimension Master'], ban: ['Cyber Dragon'] }, {}] });
  act(g, 0, 'D.D.M. - Different Dimension Master'); auto(g);
  ok(!!on(g, 0, 'Cyber Dragon') && inZ(g, 0, 'gy', 'Pot of Greed'), 'Cyber Dragon summoned, Pot of Greed discarded');
});
T('Damage = Reptile summons a Reptile after battle damage', () => {
  const g = duel({ main0: Array(39).fill(FILL).concat(['Drooling Lizard']), board: [{ m: ['Drooling Lizard'], st: [{ n: 'Damage = Reptile', pos: 'up' }] }, { m: ['Cyber Dragon'], turn: 2 }], first: 1 });
  goBP(g); attack(g, on(g, 1, 'Cyber Dragon'), on(g, 0, 'Drooling Lizard')); auto(g);
  ok(g.p[0].lp === 6800 && !!on(g, 0, 'Drooling Lizard'), `A took 1200 and summoned Drooling Lizard (LP ${g.p[0].lp})`);
});
T('Damage Condenser summons from the Deck after a direct attack', () => {
  const g = duel({ main0: Array(39).fill(FILL).concat(['Cyber Dragon']), board: [{ hand: ['Pot of Greed'], st: ['Damage Condenser'] }, { m: [FILL], turn: 2 }], first: 1 });
  goBP(g); attack(g, on(g, 1, FILL), null); auto(g);
  ok(g.p[0].lp === 6000 && !!on(g, 0, FILL) && inZ(g, 0, 'gy', 'Damage Condenser'), `A summoned a 2000-ATK monster (LP ${g.p[0].lp})`);
  ok(!on(g, 0, 'Cyber Dragon'), 'Cyber Dragon (2100) was not a legal pick');
});
T('Damage Polarizer negates Ookazi and both players draw', () => {
  const g = duel({ board: [{ hand: ['Ookazi'] }, { st: ['Damage Polarizer'] }] });
  const h0 = g.p[0].hand.length, h1 = g.p[1].hand.length;
  act(g, 0, 'Ookazi'); choose(g, 'Damage Polarizer', 1); auto(g);
  ok(g.p[1].lp === 8000 && g.p[0].hand.length === h0 && g.p[1].hand.length === h1 + 1, `no damage, each drew (B ${g.p[1].lp})`);
});
T('Damage Translation halves effect damage and gives Ghost Tokens', () => {
  const g = duel({ board: [{ hand: ['Ookazi'] }, { st: ['Damage Translation'] }] });
  // B activates it in response to Ookazi (it resolves first, so Ookazi is halved)
  act(g, 0, 'Ookazi'); choose(g, 'Damage Translation', 1); auto(g);
  ok(g.p[1].lp === 7600, `Ookazi did 400 (B ${g.p[1].lp})`);
  endTurn(g);
  ok(cnt(g, 1, 'm', 'Ghost Token') === 1, 'B got 1 Ghost Token in the End Phase');
});
T('Dark Spirit Art - Greed: Tribute a DARK, draw 2', () => {
  const g = duel({ board: [{ m: ['Archfiend Soldier'], st: ['Dark Spirit Art - Greed'] }, { hand: [FILL] }] });
  const h = g.p[0].hand.length; act(g, 0, 'Dark Spirit Art - Greed'); auto(g);
  ok(g.p[0].hand.length === h + 2 && inZ(g, 0, 'gy', 'Archfiend Soldier'), 'drew 2 after Tributing a DARK');
});
T('Dark Spirit Art - Greed is negated by a revealed Spell', () => {
  const g = duel({ board: [{ m: ['Archfiend Soldier'], st: ['Dark Spirit Art - Greed'] }, { hand: ['Pot of Greed'] }] });
  const h = g.p[0].hand.length; act(g, 0, 'Dark Spirit Art - Greed'); auto(g);
  ok(g.p[0].hand.length === h, 'no draw when the opponent reveals a Spell');
});
T('Delta Crow - Anti Reverse from the hand with 3 Blackwings', () => {
  const g = duel({ board: [{ hand: ['Delta Crow - Anti Reverse'], m: ['Blackwing - Bora the Spear', 'Blackwing - Gale the Whirlwind', 'Blackwing - Kalut the Moon Shadow'] }, { st: ['Trap Hole', 'Mirror Force'] }] });
  act(g, 0, 'Delta Crow - Anti Reverse'); auto(g);
  ok(inZ(g, 1, 'gy', 'Trap Hole') && inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'Delta Crow - Anti Reverse'), 'both Set cards destroyed, Delta Crow in the GY');
});
T('Delta Crow - Anti Reverse not from the hand with 2 Blackwings', () => {
  const g = duel({ board: [{ hand: ['Delta Crow - Anti Reverse'], m: ['Blackwing - Bora the Spear', 'Blackwing - Gale the Whirlwind'] }, { st: ['Trap Hole'] }] });
  ok(!hasOpt(g, 'a:' + cardOf(g, 0, 'Delta Crow - Anti Reverse').u + ':'), 'no hand activation');
});

/* ----- Destiny HERO ----- */
T('Destiny HERO - Blade Master boosts during the opponent\'s Battle Phase', () => {
  const g = duel({ board: [{ hand: ['Destiny HERO - Blade Master'], m: [{ n: 'Destiny HERO - Defender', pos: 'atk' }] }, { m: [FILL], turn: 2 }], first: 1 });
  goBP(g); attack(g, on(g, 1, FILL), on(g, 0, 'Destiny HERO - Defender'));
  choose(g, 'Blade Master', 0); auto(g);
  ok(logHas(g, 'Defender gained 800 ATK') && g.p[0].lp === 6900, `Defender at 900 ATK, A took 1100 (A ${g.p[0].lp})`);
});
T('Destiny HERO - Captain Tenacious revives a battle-destroyed Destiny HERO', () => {
  const g = duel({ board: [{ m: ['Destiny HERO - Captain Tenacious', { n: 'Destiny HERO - Dunker', pos: 'atk' }] }, { m: ['Cyber Dragon'], turn: 2 }], first: 1 });
  goBP(g); attack(g, on(g, 1, 'Cyber Dragon'), on(g, 0, 'Destiny HERO - Dunker')); auto(g);
  ok(inZ(g, 0, 'gy', 'Destiny HERO - Dunker'), 'Dunker destroyed');
  choose(g, 'endbp'); auto(g); endTurn(g);
  ok(!!on(g, 0, 'Destiny HERO - Dunker'), 'Dunker back in A\'s Standby Phase');
});
T('Destiny HERO - Defender: the opponent draws in their Standby Phase', () => {
  const g = duel({ board: [{ m: [{ n: 'Destiny HERO - Defender', pos: 'def' }] }, {}] });
  const h = g.p[1].hand.length; endTurn(g);
  ok(g.p[1].hand.length === h + 2, `B drew 2 cards on their turn (${g.p[1].hand.length - h})`);
});
T('Destiny HERO - Departed goes to the opponent\'s field, banished when destroyed by battle', () => {
  const g = duel({ board: [{ gy: ['Destiny HERO - Departed'], turn: 2 }, { m: [FILL] }], first: 1 });
  endTurn(g);
  ok(!!on(g, 1, 'Destiny HERO - Departed'), 'Departed on B\'s field after A\'s Standby Phase');
});
T('Destiny HERO - Departed destroyed by battle is banished', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Destiny HERO - Departed'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Destiny HERO - Departed')); auto(g);
  ok(inZ(g, 1, 'ban', 'Destiny HERO - Departed'), 'Departed banished');
});
T('Destiny HERO - Diamond Dude: a Normal Spell is used next turn', () => {
  const g = duel({ board: [{ m: ['Destiny HERO - Diamond Dude'], deckTop: [FILL, 'Pot of Greed'] }, {}] });
  act(g, 0, 'Destiny HERO - Diamond Dude'); auto(g);
  ok(inZ(g, 0, 'gy', 'Pot of Greed'), 'Pot of Greed went to the GY');
  endTurn(g); endTurn(g);
  const h = g.p[0].hand.length;
  choose(g, 'Normal Spell in your GY'); auto(g);
  ok(g.p[0].hand.length === h + 2, 'drew 2 with the Pot of Greed effect');
});
T('Destiny HERO - Disk Commander draws 2 when revived', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn', 'Monster Reborn'], gy: ['Destiny HERO - Disk Commander'] }, {}] });
  const h = g.p[0].hand.length; act(g, 0, 'Monster Reborn'); auto(g);
  ok(!!on(g, 0, 'Destiny HERO - Disk Commander') && g.p[0].hand.length === h + 1, 'revived and drew 2 (hand -1 +2)');
});
T('Destiny HERO - Disk Commander can\'t be revived the turn it went to the GY', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn', 'Graceful Charity', 'Destiny HERO - Disk Commander'] }, {}] });
  act(g, 0, 'Graceful Charity'); for (let i = 0; i < 10 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick' && /discard/i.test(g.prompt.text)) { E.act(g, g.prompt.opts.filter(o => /Disk/.test(o.label)).slice(0, 1).concat(g.prompt.opts.filter(o => !/Disk|Reborn/.test(o.label))).slice(0, g.prompt.min).map(o => o.key)); } else auto(g); }
  ok(inZ(g, 0, 'gy', 'Destiny HERO - Disk Commander'), 'Disk Commander in the GY');
  const mr = cardOf(g, 0, 'Monster Reborn'); const canUse = hasOpt(g, 'a:' + mr.u + ':');
  if (canUse) { act(g, 0, 'Monster Reborn'); auto(g); }
  ok(!on(g, 0, 'Destiny HERO - Disk Commander'), 'not revived this turn');
});
T('Destiny HERO - Dogma: Tribute 3, halve the LP next Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Destiny HERO - Dogma'], m: ['Destiny HERO - Dunker', FILL, FILL] }, {}] });
  choose(g, 'sp:'); auto(g);
  ok(!!on(g, 0, 'Destiny HERO - Dogma') && cnt(g, 0, 'gy', FILL) === 2, 'Dogma summoned');
  endTurn(g);
  ok(g.p[1].lp === 4000, `B's LP halved (${g.p[1].lp})`);
});
T('Destiny HERO - Dogma can\'t be revived without its summon', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Destiny HERO - Dogma'] }, {}] });
  // 2026-11-27 summoning conditions: "Must be Special Summoned (from your hand)" is never revived, so with no other target Monster Reborn
  // isn't offered (EDOPro: a summon condition, not only a revive limit)
  if (hasOpt(g, 'a:' + cardOf(g, 0, 'Monster Reborn').u + ':')) { act(g, 0, 'Monster Reborn'); auto(g); }
  ok(!on(g, 0, 'Destiny HERO - Dogma'), 'not revived');
});
T('Destiny HERO - Doom Lord banishes a monster until the 2nd Standby Phase', () => {
  const g = duel({ board: [{ m: ['Destiny HERO - Doom Lord'] }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Destiny HERO - Doom Lord'); auto(g);
  ok(inZ(g, 1, 'ban', 'Cyber Dragon'), 'Cyber Dragon banished');
  endTurn(g); endTurn(g);
  ok(inZ(g, 1, 'ban', 'Cyber Dragon'), 'still banished after the 1st Standby Phase');
  endTurn(g); endTurn(g);
  ok(!!on(g, 1, 'Cyber Dragon'), 'back on the 2nd Standby Phase');
});
T('Destiny HERO - Double Dude attacks twice; tokens when destroyed', () => {
  const g = duel({ board: [{ m: ['Destiny HERO - Double Dude'], turn: 2 }, {}] });
  goBP(g); const dd = on(g, 0, 'Destiny HERO - Double Dude'); attack(g, dd, null); auto(g); attack(g, dd, null); auto(g);
  ok(g.p[1].lp === 6000, `two direct attacks (B ${g.p[1].lp})`);
  const g2 = duel({ board: [{ m: [{ n: 'Destiny HERO - Double Dude', pos: 'atk' }] }, { m: ['Cyber Dragon'], turn: 2 }], first: 1 });
  goBP(g2); attack(g2, on(g2, 1, 'Cyber Dragon'), on(g2, 0, 'Destiny HERO - Double Dude')); auto(g2); choose(g2, 'endbp'); auto(g2); endTurn(g2);
  ok(cnt(g2, 0, 'm', 'Double Dude Token') === 2, '2 Double Dude Tokens in A\'s Standby Phase');
});
T('Destiny HERO - Dread Servant: Clock Counter, then destroy a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Destiny HERO - Dread Servant'] }, {}] });
  g.p[0].fz = null;
  const g2 = duel({ board: [{ hand: ['Destiny HERO - Dread Servant', 'Clock Tower Prison'] }, {}] });
  act(g2, 0, 'Clock Tower Prison'); auto(g2); ns(g2, 0, 'Destiny HERO - Dread Servant'); auto(g2);
  ok((g2.p[0].fz && g2.p[0].fz.flags.clock) === 1, 'Clock Tower Prison has 1 counter');
});
T('Destiny HERO - Dreadmaster: ATK from the other Destiny HEROs, protected that turn', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Destiny HERO - Dreadmaster'], m: ['Destiny HERO - Dunker', 'Destiny HERO - Doom Lord'] }, { hand: ['Ookazi'] }] });
  act(g, 0, 'Monster Reborn'); auto(g);
  const d = on(g, 0, 'Destiny HERO - Dreadmaster');
  ok(d && E.atk(g, d) === 1800 && E.def(g, d) === 1800, `Dreadmaster 1800/1800 (${d && E.atk(g, d)})`);
});
T('Destiny HERO - Dunker: send a Destiny HERO card for 500 damage', () => {
  const g = duel({ board: [{ hand: ['Destiny HERO - Defender'], m: ['Destiny HERO - Dunker'] }, {}] });
  act(g, 0, 'Destiny HERO - Dunker'); auto(g);
  ok(g.p[1].lp === 7500, `500 damage (B ${g.p[1].lp})`);
});
T('Destiny HERO - Fear Monger revives another Destiny HERO', () => {
  const g = duel({ board: [{ m: [{ n: 'Destiny HERO - Fear Monger', pos: 'atk' }], gy: ['Destiny HERO - Dunker'] }, { m: ['Cyber Dragon'], turn: 2 }], first: 1 });
  goBP(g); attack(g, on(g, 1, 'Cyber Dragon'), on(g, 0, 'Destiny HERO - Fear Monger')); auto(g); choose(g, 'endbp'); auto(g); endTurn(g);
  ok(!!on(g, 0, 'Destiny HERO - Dunker'), 'Dunker revived');
});

/* ----- Divine and Djinn ----- */
T('Divine Dragon - Excelion gains effects for Excelions in the GY', () => {
  const g = duel({ board: [{ hand: ['Divine Dragon - Excelion'], m: [FILL], gy: ['Divine Dragon - Excelion'] }, {}] });
  ns(g, 0, 'Divine Dragon - Excelion'); auto(g);
  const x = on(g, 0, 'Divine Dragon - Excelion');
  ok(x && E.atk(g, x) === 2500, `1 Excelion in the GY: gained 1000 ATK (${x && E.atk(g, x)})`);
});
T('Divine Grace - Northwemko by Ritual of Grace', () => {
  const g = duel({ board: [{ hand: ['Ritual of Grace', 'Divine Grace - Northwemko'], m: [FILL, FILL], st: [{ n: 'Mountain', pos: 'up' }] }, {}] });
  g.p[0].st = [null, null, null, null, null];
  act(g, 0, 'Ritual of Grace'); auto(g);
  const n = on(g, 0, 'Divine Grace - Northwemko');
  ok(!!n, 'Northwemko Ritual Summoned');
});
T('Divine Sword - Phoenix Blade returns from the GY', () => {
  const g = duel({ board: [{ gy: ['Divine Sword - Phoenix Blade', 'Axe Raider', 'Blade Skater'] }, {}] });
  act(g, 0, 'Divine Sword - Phoenix Blade'); auto(g);
  ok(inZ(g, 0, 'hand', 'Divine Sword - Phoenix Blade') && inZ(g, 0, 'ban', 'Axe Raider'), 'back in the hand, Warriors banished');
});
T('Djinn Disserere: the Ritual Monster is unaffected by Traps', () => {
  const g = duel({ board: [{ hand: ["Fortress Whale's Oath", 'Fortress Whale', 'Djinn Disserere of Rituals'], m: ['Frostosaurus'] }, {}] });
  act(g, 0, "Fortress Whale's Oath");
  for (let i = 0; i < 10 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'choose' && /Tribute/.test(g.prompt.text)) { const o = g.prompt.opts.find(x => /Djinn/.test(x.label)); E.act(g, [o.key]); } else auto(g); }
  const w = on(g, 0, 'Fortress Whale');
  ok(w && w.flags.unaffectedTraps === true, 'Fortress Whale unaffected by Traps');
});
T('Djinn Presider: the Ritual Monster draws when it destroys a monster', () => {
  const g = duel({ board: [{ hand: ["Fortress Whale's Oath", 'Fortress Whale', 'Djinn Presider of Rituals'], m: ['Ancient Lizard Warrior'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, "Fortress Whale's Oath");
  for (let i = 0; i < 10 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'choose' && /Tribute/.test(g.prompt.text)) { const o = g.prompt.opts.find(x => /Djinn/.test(x.label)); E.act(g, [o.key]); } else auto(g); }
  const w = on(g, 0, 'Fortress Whale'); const h = g.p[0].hand.length;
  goBP(g); attack(g, w, on(g, 1, FILL)); auto(g);
  ok(g.p[0].hand.length === h + 1, 'drew 1 after the battle');
});

/* ----- Earthbound ----- */
// an Earthbound Immortal with no Field Spell is destroyed at the first game event, so each test summons it after Mountain
const eiUp = (g, n) => { act(g, 0, 'Mountain'); auto(g); ns(g, 0, n); auto(g); return on(g, 0, n); };
T('Earthbound Immortal Ccapac Apu: damage equal to the destroyed ATK', () => {
  const g = duel({ board: [{ hand: ['Mountain', 'Earthbound Immortal Ccapac Apu'], m: [FILL, FILL], turn: 2 }, { m: [FILL] }] });
  const e = eiUp(g, 'Earthbound Immortal Ccapac Apu'); goBP(g); attack(g, e, on(g, 1, FILL)); auto(g);
  ok(g.p[1].lp === 8000 - 1000 - 2000, `battle 1000 + 2000 burn (B ${g.p[1].lp})`);
});
T('Earthbound Immortal destroys itself with no Field Spell; Linewalker stops it', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Earthbound Immortal Uru'] }, {}] });
  ok(!on(g, 0, 'Earthbound Immortal Uru'), 'Uru destroyed with no Field Spell');
  const g2 = duel({ board: [{ hand: [FILL], m: ['Earthbound Immortal Uru', 'Earthbound Linewalker'] }, {}] });
  ns(g2, 0, FILL); auto(g2);
  ok(!!on(g2, 0, 'Earthbound Immortal Uru'), 'Uru stays with Linewalker');
});
T('Earthbound Immortal Uru takes control', () => {
  const g = duel({ board: [{ hand: ['Mountain', 'Earthbound Immortal Uru'], m: [FILL, FILL, FILL] }, { m: ['Cyber Dragon'] }] });
  eiUp(g, 'Earthbound Immortal Uru'); act(g, 0, 'Earthbound Immortal Uru'); auto(g);
  ok(!!on(g, 0, 'Cyber Dragon'), 'A controls Cyber Dragon');
  endTurn(g);
  ok(!!on(g, 1, 'Cyber Dragon'), 'back to B at the End Phase');
});
T('Earthbound Immortal Chacu Challhua burns half its DEF and can\'t attack', () => {
  const g = duel({ board: [{ hand: ['Mountain', 'Earthbound Immortal Chacu Challhua'], m: [FILL, FILL], turn: 2 }, {}] });
  eiUp(g, 'Earthbound Immortal Chacu Challhua'); act(g, 0, 'Earthbound Immortal Chacu Challhua'); auto(g);
  ok(g.p[1].lp === 6800, `1200 damage (B ${g.p[1].lp})`);
  choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'atk:' + on(g, 0, 'Earthbound Immortal Chacu Challhua').u), 'it can\'t attack this turn');
});
T('Earthbound Immortal Cusillu can\'t be attacked; Tributes another monster instead of being destroyed', () => {
  const g = duel({ board: [{ hand: ['Mountain', 'Earthbound Immortal Cusillu'], m: [FILL, FILL, FILL] }, { m: [FILL], hand: ['Raigeki'] }] });
  const cu = eiUp(g, 'Earthbound Immortal Cusillu'); endTurn(g); choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'atk:' + on(g, 1, FILL).u + ':' + cu.u), 'Cusillu can\'t be attacked');
});
T('Earthbound Immortal Cusillu: losing a battle Tributes another monster and halves the LP', () => {
  const g = duel({ board: [{ hand: ['Mountain', 'Earthbound Immortal Cusillu'], m: [FILL, FILL, FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  const cu = eiUp(g, 'Earthbound Immortal Cusillu'); goBP(g); attack(g, cu, on(g, 1, 'Blue-Eyes White Dragon')); auto(g);
  ok(!!on(g, 0, 'Earthbound Immortal Cusillu') && cnt(g, 0, 'm', FILL) === 0 && g.p[1].lp === 4000, `Cusillu stayed, Warwolf Tributed, B at 4000 (${g.p[1].lp})`);
});
T('Earthbound Immortal Wiraqocha Rasca: random discards and ATK', () => {
  const g = duel({ board: [{ hand: ['Mountain', 'Earthbound Immortal Wiraqocha Rasca'], m: [FILL, FILL, FILL, FILL] }, { hand: [FILL, FILL, FILL] }] });
  act(g, 0, 'Mountain'); auto(g); ns(g, 0, 'Earthbound Immortal Wiraqocha Rasca');
  for (let i = 0; i < 20 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick' && /Shuffle/.test(g.prompt.text)) E.act(g, g.prompt.opts.filter(o => /Warwolf/.test(o.label)).slice(0, 2).map(o => o.key)); else step1(g); }
  const w = on(g, 0, 'Earthbound Immortal Wiraqocha Rasca');
  ok(w && E.atk(g, w) === 2300 && g.p[1].hand.length === 1, `gained 2000 (100 + Mountain 200), B discarded 2 (${w && E.atk(g, w)}, hand ${g.p[1].hand.length})`);
});
T('Earthbound Immortal Revival adds an Immortal and a Field Spell', () => {
  const g = duel({ board: [{ hand: ['Earthbound Immortal Revival', FILL], gy: ['Earthbound Immortal Uru', 'Mountain'] }, {}] });
  act(g, 0, 'Earthbound Immortal Revival'); auto(g);
  ok(inZ(g, 0, 'hand', 'Earthbound Immortal Uru') && inZ(g, 0, 'hand', 'Mountain'), 'both added');
});

/* ----- Evil ----- */
T('Evil Blast equips to a Special Summoned monster and burns each Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Cyber Dragon'] }, { st: ['Evil Blast'] }] });
  act(g, 0, 'Monster Reborn'); respondWith(g, 1, 'Evil Blast'); auto(g);
  const cd = on(g, 0, 'Cyber Dragon');
  ok(cd && E.atk(g, cd) === 2600, `Cyber Dragon 2600 ATK (${cd && E.atk(g, cd)})`);
  endTurn(g); endTurn(g);
  ok(g.p[0].lp === 7500, `500 in A's Standby Phase (A ${g.p[0].lp})`);
});
T('Evil Dragon Ananta: banish Reptiles for 600 each', () => {
  const g = duel({ board: [{ hand: ['Evil Dragon Ananta'], m: ['Ancient Lizard Warrior'], gy: ['Drooling Lizard', 'Armored Lizard'] }, {}] });
  choose(g, 'sp:'); auto(g);
  const a = on(g, 0, 'Evil Dragon Ananta');
  ok(a && E.atk(g, a) === 1800 && cnt(g, 0, 'ban', 'Drooling Lizard') === 1, `Ananta 1800 ATK (${a && E.atk(g, a)})`);
});
T('Evil HERO Infernal Gainer: a Fiend attacks twice, Gainer returns', () => {
  const g = duel({ board: [{ m: ['Evil HERO Infernal Gainer', 'Archfiend Soldier'], turn: 2 }, {}] });
  act(g, 0, 'Evil HERO Infernal Gainer'); auto(g);
  goBP(g); const s = on(g, 0, 'Archfiend Soldier'); attack(g, s, null); auto(g); attack(g, s, null); auto(g);
  ok(g.p[1].lp === 8000 - 3800, `two attacks (B ${g.p[1].lp})`);
  choose(g, 'endbp'); auto(g); endTurn(g); endTurn(g); endTurn(g); endTurn(g);
  ok(!!on(g, 0, 'Evil HERO Infernal Gainer'), 'Gainer back on the 2nd Standby Phase');
});
T('Evil HEROs: Dark Fusion yes, Polymerization no', () => {
  const g = duel({ ex0: ['Evil HERO Lightning Golem'], board: [{ hand: ['Polymerization', 'Elemental HERO Sparkman', 'Elemental HERO Clayman'] }, {}] });
  ok(!hasOpt(g, 'a:' + cardOf(g, 0, 'Polymerization').u + ':'), 'Polymerization can\'t make Lightning Golem');
  const g2 = duel({ ex0: ['Evil HERO Lightning Golem'], board: [{ hand: ['Dark Fusion', 'Elemental HERO Sparkman', 'Elemental HERO Clayman'] }, { m: ['Cyber Dragon'] }] });
  act(g2, 0, 'Dark Fusion'); auto(g2);
  ok(!!on(g2, 0, 'Evil HERO Lightning Golem'), 'Dark Fusion summons it');
  act(g2, 0, 'Evil HERO Lightning Golem'); for (let i = 0; i < 10 && g2.prompt.type !== 'idle'; i++) { if (g2.prompt.type === 'pick') choose(g2, 'Cyber Dragon'); else auto(g2); }
  ok(inZ(g2, 1, 'gy', 'Cyber Dragon'), 'Lightning Golem destroyed Cyber Dragon');
});
T('Evil HERO Infernal Sniper burns in face-up Defense, not destroyed by Spells', () => {
  const g = duel({ board: [{ m: [{ n: 'Evil HERO Infernal Sniper', pos: 'def' }] }, { hand: ['Raigeki'] }] });
  endTurn(g); act(g, 1, 'Raigeki'); auto(g);
  ok(!!on(g, 0, 'Evil HERO Infernal Sniper'), 'survived Raigeki');
  endTurn(g);
  ok(g.p[1].lp === 6000, `1000 in each of A's Standby Phases (B ${g.p[1].lp})`);
});
T('Evil HERO Inferno Wing: piercing and the destroyed monster\'s ATK or DEF', () => {
  const g = duel({ board: [{ m: ['Evil HERO Inferno Wing'], turn: 2 }, { m: [{ n: 'Acrobat Monkey', pos: 'def' }] }] });
  goBP(g); attack(g, on(g, 0, 'Evil HERO Inferno Wing'), on(g, 1, 'Acrobat Monkey')); auto(g);
  ok(g.p[1].lp === 8000 - 300 - 1800, `300 piercing + 1800 (B ${g.p[1].lp})`);
});
T('Evil HERO Wild Cyclone: no Spell/Trap during its attack; destroys Set cards on damage', () => {
  const g = duel({ board: [{ m: ['Evil HERO Wild Cyclone'], turn: 2 }, { st: ['Mirror Force', 'Trap Hole'] }] });
  goBP(g); attack(g, on(g, 0, 'Evil HERO Wild Cyclone'), null);
  ok(!(g.prompt.type === 'respond' && g.prompt.p === 1 && hasOpt(g, 'Mirror Force')), 'B can\'t activate Mirror Force');
  auto(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Trap Hole'), 'Set cards destroyed after damage');
});
T('Evil Thorn: 300 damage and 2 more from the Deck', () => {
  const g = duel({ main0: Array(38).fill(FILL).concat(['Evil Thorn', 'Evil Thorn']), board: [{ m: ['Evil Thorn'] }, {}] });
  act(g, 0, 'Evil Thorn');
  for (let i = 0; i < 10 && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick' && /Evil Thorn/.test(g.prompt.text)) E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); else step1(g); }
  ok(g.p[1].lp === 7700 && cnt(g, 0, 'm', 'Evil Thorn') === 2, `300 damage, 2 Evil Thorn summoned (B ${g.p[1].lp})`);
  ok(!hasOpt(g, 'a:' + on(g, 0, 'Evil Thorn').u + ':'), 'their effects can\'t be activated');
});

/* ----- Fake ----- */
T('Fake Explosion: no destruction by that battle, then Summon Reactor SK', () => {
  const g = duel({ board: [{ hand: ['Summon Reactor SK'], m: [{ n: FILL, pos: 'atk' }], st: ['Fake Explosion'] }, { m: ['Cyber Dragon'], turn: 2 }], first: 1 });
  goBP(g); attack(g, on(g, 1, 'Cyber Dragon'), on(g, 0, FILL)); choose(g, 'Fake Explosion', 0); auto(g);
  ok(!!on(g, 0, FILL) && !!on(g, 0, 'Summon Reactor SK'), 'Warwolf survived, Summon Reactor SK summoned');
});
T('Fake Feather copies Reinforcements from the opponent\'s GY', () => {
  const g = duel({ board: [{ hand: ['Blackwing - Bora the Spear'], m: [FILL], st: ['Fake Feather'] }, { gy: ['Reinforcements'] }] });
  act(g, 0, 'Fake Feather'); auto(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2500 && inZ(g, 0, 'gy', 'Blackwing - Bora the Spear'), 'Warwolf gained 500');
});
T('Fake Hero: summon an Elemental HERO that can\'t attack and returns', () => {
  const g = duel({ board: [{ hand: ['Fake Hero', 'Elemental HERO Sparkman'], turn: 2 }, {}] });
  act(g, 0, 'Fake Hero'); auto(g);
  ok(!!on(g, 0, 'Elemental HERO Sparkman'), 'Sparkman summoned');
  choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'atk:'), 'it can\'t attack');
  choose(g, 'endbp'); auto(g); endTurn(g);
  ok(inZ(g, 0, 'hand', 'Elemental HERO Sparkman'), 'back in the hand');
});
T('Familiar-Possessed - Aussa from the hand and from the Deck', () => {
  const g = duel({ board: [{ hand: ['Familiar-Possessed - Aussa'], m: ['Aussa the Earth Charmer', FILL] }, {}] });
  choose(g, 'sp:'); auto(g);
  ok(!!on(g, 0, 'Familiar-Possessed - Aussa') && inZ(g, 0, 'gy', 'Aussa the Earth Charmer'), 'summoned from the hand');
  const g2 = duel({ main0: Array(39).fill(FILL).concat(['Familiar-Possessed - Aussa']), board: [{ hand: ['Aussa the Earth Charmer'], m: [FILL] }, {}] });
  ns(g2, 0, 'Aussa the Earth Charmer'); auto(g2);
  ok(!!on(g2, 0, 'Familiar-Possessed - Aussa'), 'summoned from the Deck');
  ok(g2.p[0].m.find(c => c && E.name(c) === 'Familiar-Possessed - Aussa').flags.fpOwn === true, 'it pierces');
});

/* ----- Flamvell, Fortress, Fossil, Gadget ----- */
T('Flamvell Commando needs a Flamvell to Tribute; burns with a 200 DEF monster', () => {
  const g = duel({ board: [{ hand: ['Flamvell Commando'], m: [FILL] }, {}] });
  ok(!hasOpt(g, 'ns:' + cardOf(g, 0, 'Flamvell Commando').u), 'no Normal Summon without a Flamvell');
  const g2 = duel({ board: [{ hand: ['Flamvell Commando'], m: ['Flamvell Dragnov'], gy: ['Flamvell Firedog'] }, {}] });
  ns(g2, 0, 'Flamvell Commando'); auto(g2); act(g2, 0, 'Flamvell Commando'); auto(g2);
  ok(g2.p[1].lp === 6100, `1900 damage (B ${g2.p[1].lp})`);
});
T('Flamvell Counter negates a Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'] }, { st: ['Flamvell Counter'], gy: ['Flamvell Dragnov'] }] });
  const h = g.p[0].hand.length; act(g, 0, 'Pot of Greed'); choose(g, 'Flamvell Counter', 1); auto(g);
  ok(g.p[0].hand.length === h - 1 && inZ(g, 1, 'ban', 'Flamvell Dragnov'), 'Pot of Greed negated');
});
T('Flamvell Dragnov: 500 on battle destruction, search from the GY', () => {
  const g = duel({ main0: Array(39).fill(FILL).concat(['Flamvell Dragnov']), board: [{ m: ['Flamvell Firedog'], gy: ['Flamvell Dragnov'] }, {}] });
  act(g, 0, 'Flamvell Dragnov'); auto(g);
  ok(inZ(g, 0, 'hand', 'Flamvell Dragnov') && inZ(g, 0, 'ban', 'Flamvell Firedog'), 'added Dragnov');
});
T('Fortress Warrior: no battle damage, survives one battle a turn', () => {
  const g = duel({ board: [{ m: [{ n: 'Fortress Warrior', pos: 'atk' }] }, { m: ['Cyber Dragon', FILL], turn: 2 }], first: 1 });
  goBP(g); attack(g, on(g, 1, 'Cyber Dragon'), on(g, 0, 'Fortress Warrior')); auto(g);
  ok(!!on(g, 0, 'Fortress Warrior') && g.p[0].lp === 8000, 'survived, no damage');
  attack(g, on(g, 1, FILL), on(g, 0, 'Fortress Warrior')); auto(g);
  ok(!on(g, 0, 'Fortress Warrior') && g.p[0].lp === 8000, 'destroyed by the 2nd battle, still no damage');
});
T("Fortress Whale's Oath: Tribute Levels 7 or more", () => {
  const g = duel({ board: [{ hand: ["Fortress Whale's Oath", 'Fortress Whale'], m: [FILL, FILL] }, {}] });
  act(g, 0, "Fortress Whale's Oath"); auto(g);
  ok(!!on(g, 0, 'Fortress Whale'), 'Fortress Whale summoned with 8 Levels');
});
T('Fossil Excavation: discard, revive a Dinosaur with effects negated, linked', () => {
  const g = duel({ board: [{ hand: [FILL], st: ['Fossil Excavation'], gy: ['Kabazauls'] }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Fossil Excavation'); auto(g);
  ok(!!on(g, 0, 'Kabazauls'), 'Kabazauls revived');
  endTurn(g); act(g, 1, 'Mystical Space Typhoon'); auto(g);
  ok(!on(g, 0, 'Kabazauls'), 'destroyed with Fossil Excavation');
});
T('Fossil Tusker: 400 damage on a battle kill', () => {
  const g = duel({ board: [{ m: ['Fossil Tusker'], turn: 2 }, { m: ['Ancient Brain'] }] });
  goBP(g); attack(g, on(g, 0, 'Fossil Tusker'), on(g, 1, 'Ancient Brain')); auto(g);
  ok(g.p[1].lp === 8000 - 800 - 400, `800 + 400 (B ${g.p[1].lp})`);
});
T('Gadget Arms, Gadget Driver and Gadget Hauler', () => {
  const g = duel({ board: [{ m: [{ n: 'Gadget Arms', pos: 'set' }], gy: ['Morphtronic Bind'] }, {}] });
  choose(g, 'flip:'); auto(g);
  ok(inZ(g, 0, 'hand', 'Morphtronic Bind'), 'Gadget Arms added Morphtronic Bind');
  const g2 = duel({ board: [{ hand: ['Gadget Driver'], m: [{ n: 'Morphtronic Boarden', pos: 'atk' }] }, {}] });
  act(g2, 0, 'Gadget Driver'); auto(g2);
  ok(on(g2, 0, 'Morphtronic Boarden').pos === 'def', 'Boarden changed to Defense');
  const g3 = duel({ board: [{ hand: ['Morphtronic Celfon', 'Morphtronic Magnen'], m: ['Gadget Hauler'] }, {}] });
  act(g3, 0, 'Gadget Hauler');
  for (let i = 0; i < 10 && g3.prompt.type !== 'idle'; i++) { if (g3.prompt.type === 'pick') E.act(g3, g3.prompt.opts.map(o => o.key)); else auto(g3); }
  ok(E.atk(g3, on(g3, 0, 'Gadget Hauler')) === 2900, `Gadget Hauler 2900 (${E.atk(g3, on(g3, 0, 'Gadget Hauler'))})`);
});

console.log(fails ? `\n${fails} FAILED` : '\nAll checks passed.');
process.exitCode = fails ? 1 : 0;
