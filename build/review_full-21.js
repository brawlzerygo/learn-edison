// Independent review checks for full pool batch 21 (written from the card text): node build/review_full-21.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior Level 4 2000/100
let lastG; function duel(o = {}) {
  const mk = (ex, n) => ({ name: 't', main: Array(n || 40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0, o.n0), mk(o.ex1, o.n1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) { fails++; if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ') + '\n   prompt: ' + (lastG.prompt ? lastG.prompt.p + ' ' + lastG.prompt.type + ' ' + lastG.prompt.text + ' :: ' + lastG.prompt.opts.map(x => x.label + '[' + x.key + ']').join(', ') : 'none')); } }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra, ...g.p[p].ban, g.p[p].fz].find(c => c && E.name(c) === n);
const byU = (g, u) => { for (const P of g.p) for (const z of ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra']) for (const c of P[z]) if (c && c.u === u) return c; return g.p.map(P => P.fz).find(c => c && c.u === u) || null; };
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const canAct = (g, p, n) => { const c = card(g, p, n); return !!c && hasOpt(g, 'a:' + c.u + ':'); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ')); } };
function settle(g, ...picks) { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const nm = x => { const c = x.u != null && byU(g, x.u); return c ? E.name(c) : ''; };
    const o = pr.opts.find(x => x.key !== 'pass' && picks.some(t => nm(x) === t || (x.label + ' ' + x.key).includes(t))); E.act(g, [o ? o.key : 'pass']); }
  else if (pr.type === 'yesno') choose(g, picks.includes('NO') ? 'no' : 'yes');
  else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => x.label.includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); }
    for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); E.act(g, ks); } } }
const bp = g => { choose(g, 'bp'); settle(g); };
const atkOn = (g, p, aName, tName, ...picks) => { const a = on(g, p, aName), t = tName ? on(g, 1 - p, tName) : null; choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); settle(g, ...picks); };
const canAtk = (g, a, t) => hasOpt(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const endTurn = (g, ...picks) => { if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g, ...picks); } choose(g, 'end'); settle(g, ...picks); };
const ns = (g, p, n, ...picks) => { choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u); settle(g, ...picks); };
const noSummon = (g, c) => !hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && !hasOpt(g, 'sp:' + c.u);
const lp = (g, p) => g.p[p].lp;
const top = (g, p) => g.p[p].deck[g.p[p].deck.length - 1];
const pickC = (g, c) => E.act(g, ['u' + c.u]);
const hand = (g, p) => g.p[p].hand.length;
const flipSum = (g, p, n) => { choose(g, 'flip:' + on(g, p, n).u); };

/* ---------------- D ---------------- */
T('Drill Bug: battle damage puts Parasite Paracide on top of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Drill Bug'], deckTop: [FILL, FILL, 'Parasite Paracide', FILL], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Drill Bug', null, 'Parasite Paracide');
  ok(lp(g, 1) === 6900, `1100 direct (${lp(g, 1)})`);
  ok(top(g, 0) && E.name(top(g, 0)) === 'Parasite Paracide', 'Parasite Paracide is on top of the Deck');
});
T('Drillago: direct attack only past face-up 1600+ monsters', () => {
  let g = duel({ board: [{ hand: [], m: ['Drillago'], turn: 2 }, { m: ['Vorse Raider'] }] });
  bp(g); ok(canAtk(g, on(g, 0, 'Drillago'), null), 'direct attack offered past Vorse Raider');
  atkOn(g, 0, 'Drillago', null); ok(lp(g, 1) === 6400, `1600 direct (${lp(g, 1)})`);
  g = duel({ board: [{ hand: [], m: ['Drillago'], turn: 2 }, { m: ['Mystical Elf'] }] });
  bp(g); ok(!canAtk(g, on(g, 0, 'Drillago'), null), 'no direct attack past Mystical Elf (800)');
  g = duel({ board: [{ hand: [], m: ['Drillago'], turn: 2 }, { m: ['Vorse Raider'], st: ['Gravity Bind'] }] });
  bp(g); ok(!canAtk(g, on(g, 0, 'Drillago'), null), 'no direct attack with a Set Spell/Trap');
});
T('Driving Snow: after opponent destroys your Trap, destroy 1 Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: [{ n: 'Gravity Bind', pos: 'up' }], turn: 2 }, { st: ['Driving Snow', 'Mirror Force'] }] });
  act(g, 0, 'Mystical Space Typhoon'); pickC(g, card(g, 1, 'Mirror Force')); settle(g, 'Driving Snow');
  if (g.prompt && g.prompt.type === 'pick') pickC(g, card(g, 0, 'Gravity Bind')); settle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Driving Snow') && inZ(g, 0, 'gy', 'Gravity Bind'), 'Driving Snow destroyed Gravity Bind');
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: [{ n: 'Gravity Bind', pos: 'up' }], turn: 2 }, { st: ['Driving Snow', { n: 'Messenger of Peace', pos: 'up' }] }] });
  act(g2, 0, 'Mystical Space Typhoon'); pickC(g2, card(g2, 1, 'Messenger of Peace')); settle(g2, 'Driving Snow', 'Gravity Bind');
  ok(inZ(g2, 1, 'st', 'Driving Snow'), 'not offered when a Spell was destroyed');
});
T('Drop Off: the opponent discards the card drawn for the normal draw', () => {
  const g = duel({ board: [{ hand: [], deckTop: ['Sangan'], turn: 2 }, { st: ['Drop Off'] }] });
  settle(g, 'Drop Off');
  ok(inZ(g, 0, 'gy', 'Sangan') && !inZ(g, 0, 'hand', 'Sangan') && inZ(g, 1, 'gy', 'Drop Off'), 'Sangan discarded');
});
T('Dummy Golem: FLIP switches control with a monster the opponent picks', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Dummy Golem', pos: 'set' }], turn: 2 }, { m: ['Vorse Raider'] }] });
  flipSum(g, 0, 'Dummy Golem'); settle(g, 'Vorse Raider');
  ok(on(g, 0, 'Vorse Raider') && on(g, 1, 'Dummy Golem'), 'A controls Vorse Raider, B controls Dummy Golem');
});
T('Dust Barrier: Normal Monsters unaffected by opponent Spells; destroyed in 2nd Standby', () => {
  const g = duel({ board: [{ hand: ['Raigeki'], turn: 2 }, { m: ['Harpie Lady', 'Sangan'], st: [{ n: 'Dust Barrier', pos: 'up' }] }] });
  act(g, 0, 'Raigeki'); settle(g, 'NO');
  ok(on(g, 1, 'Harpie Lady') && inZ(g, 1, 'gy', 'Sangan'), 'Harpie Lady survives Raigeki, Sangan does not');
  const g2 = duel({ board: [{ hand: ['Dust Barrier'], turn: 2 }, {}] });
  act(g2, 0, 'Dust Barrier'); settle(g2);
  endTurn(g2); endTurn(g2);
  ok(inZ(g2, 0, 'st', 'Dust Barrier'), 'still there after the 1st Standby Phase');
  endTurn(g2); endTurn(g2);
  ok(inZ(g2, 0, 'gy', 'Dust Barrier'), 'destroyed in the 2nd Standby Phase');
});
T('Eagle Eye: no Trap on its Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Eagle Eye'], turn: 2 }, { st: ['Trap Hole'] }] });
  ns(g, 0, 'Eagle Eye', 'Trap Hole');
  ok(on(g, 0, 'Eagle Eye') && inZ(g, 1, 'st', 'Trap Hole'), 'Eagle Eye stays, Trap Hole not used');
});
T('Earth Chant: Ritual Summons an EARTH Ritual Monster', () => {
  const g = duel({ board: [{ hand: ['Earth Chant', 'Lycanthrope'], m: ['Armaill', 'Armaill'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Earth Chant'), 'Earth Chant offered'); act(g, 0, 'Earth Chant'); settle(g, 'Lycanthrope', 'Armaill', 'Attack');
  ok(on(g, 0, 'Lycanthrope') && cnt(g, 0, 'gy', 'Armaill') === 2, 'Lycanthrope summoned with 2 Level 3s');
  const g2 = duel({ board: [{ hand: ['Earth Chant', 'Crab Turtle'], m: ['Armaill', 'Armaill', 'Armaill'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Earth Chant'), 'not for a WATER Ritual Monster');
});
T('Earthquake: all face-up monsters to Defense', () => {
  const g = duel({ board: [{ hand: ['Earthquake'], m: ['Vorse Raider'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Earthquake'); settle(g);
  ok(on(g, 0, 'Vorse Raider').pos === 'def' && on(g, 1, FILL).pos === 'def', 'both in Defense');
});
T('Earthshaker: opponent picks 1 of 2 Attributes, those face-up monsters destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Harpie Lady'], st: ['Earthshaker'], turn: 2 }, { m: [FILL, 'Vorse Raider'] }] });
  act(g, 0, 'Earthshaker'); settle(g, 'EARTH', 'WIND');
  ok(!!g.prompt, 'prompt pending');
  const n = cnt(g, 0, 'gy') + cnt(g, 1, 'gy');
  ok((inZ(g, 1, 'gy', FILL) && !inZ(g, 0, 'gy', 'Harpie Lady')) || (inZ(g, 0, 'gy', 'Harpie Lady') && !inZ(g, 1, 'gy', FILL)), 'one of the 2 Attributes destroyed');
  ok(on(g, 1, 'Vorse Raider'), 'DARK Vorse Raider survives');
});
T('Eatgaboon: destroys a Normal Summoned monster with 500 or less ATK', () => {
  const g = duel({ board: [{ hand: ['Basic Insect'], turn: 2 }, { st: ['Eatgaboon'] }] });
  ns(g, 0, 'Basic Insect', 'Eatgaboon');
  ok(inZ(g, 0, 'gy', 'Basic Insect'), 'Basic Insect destroyed');
  const g2 = duel({ board: [{ hand: ['Vorse Raider'], turn: 2 }, { st: ['Eatgaboon'] }] });
  ns(g2, 0, 'Vorse Raider', 'Eatgaboon');
  ok(on(g2, 0, 'Vorse Raider') && inZ(g2, 1, 'st', 'Eatgaboon'), 'not on a 1900 ATK monster');
});
T('Ectoplasmer: the turn player Tributes in their End Phase, half ATK burn', () => {
  const g = duel({ board: [{ hand: [], m: ['Vorse Raider'], st: [{ n: 'Ectoplasmer', pos: 'up' }], turn: 2 }, { hand: [], m: [FILL] }] });
  endTurn(g, 'Vorse Raider', FILL);
  ok(inZ(g, 0, 'gy', 'Vorse Raider') && lp(g, 1) === 8000 - 950, `A Tributed Vorse, B took 950 (${lp(g, 1)})`);
  ok(on(g, 1, FILL), 'B did not Tribute in A\'s End Phase');
  endTurn(g, FILL);
  ok(inZ(g, 1, 'gy', FILL) && lp(g, 0) === 7000, `B Tributed, A took 1000 (${lp(g, 0)})`);
});
T('Ekibyo Drakmord: equipped cannot attack, destroyed at the end of its controller\'s 2nd turn', () => {
  const g = duel({ board: [{ hand: ['Ekibyo Drakmord'], turn: 2 }, { hand: [], m: ['Vorse Raider'] }] });
  act(g, 0, 'Ekibyo Drakmord'); settle(g, 'Vorse Raider');
  endTurn(g);
  bp(g); ok(!canAtk(g, on(g, 1, 'Vorse Raider'), null), 'Vorse Raider cannot attack');
  endTurn(g); ok(on(g, 1, 'Vorse Raider'), 'survives the 1st turn');
  endTurn(g); endTurn(g);
  ok(inZ(g, 1, 'gy', 'Vorse Raider') && inZ(g, 0, 'hand', 'Ekibyo Drakmord'), 'destroyed after the 2nd turn, Ekibyo back in A\'s hand');
});
T('Electric Lizard: a non-Zombie attacker cannot attack on its next turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Vorse Raider'], turn: 2 }, { hand: [], m: ['Electric Lizard'] }] });
  bp(g); atkOn(g, 0, 'Vorse Raider', 'Electric Lizard'); endTurn(g); endTurn(g);
  bp(g); ok(!canAtk(g, on(g, 0, 'Vorse Raider'), null), 'Vorse Raider cannot attack the next turn');
  const g2 = duel({ board: [{ hand: [], m: ['Dragon Zombie'], turn: 2 }, { hand: [], m: ['Electric Lizard', 'Sangan'] }] });
  bp(g2); atkOn(g2, 0, 'Dragon Zombie', 'Electric Lizard'); endTurn(g2); endTurn(g2);
  bp(g2); ok(canAtk(g2, on(g2, 0, 'Dragon Zombie'), on(g2, 1, 'Sangan')), 'a Zombie still can');
});
T('Electric Snake: discarded by the opponent, draw 2', () => {
  const g = duel({ board: [{ hand: ['Confiscation'], turn: 2 }, { hand: ['Electric Snake'] }] });
  const h = g.p[1].deck.length; act(g, 0, 'Confiscation'); settle(g, 'Electric Snake');
  ok(inZ(g, 1, 'gy', 'Electric Snake') && hand(g, 1) === 2, `B drew 2 (hand ${hand(g, 1)})`);
});
T('Electro-Whip: Thunder +300/+300', () => {
  const g = duel({ board: [{ hand: ['Electro-Whip'], m: ['Wattkid'], turn: 2 }, {}] });
  act(g, 0, 'Electro-Whip'); settle(g, 'Wattkid'); const w = on(g, 0, 'Wattkid');
  ok(E.atk(g, w) === 1300 && E.def(g, w) === 800, `Wattkid ${E.atk(g, w)}/${E.def(g, w)}`);
});
T('Elegant Egotist: Harpie Lady on field, summon Harpie Lady Sisters from the Deck', () => {
  const g = duel({ board: [{ hand: ['Elegant Egotist'], m: ['Harpie Lady'], deckTop: [FILL, FILL, 'Harpie Lady Sisters'], turn: 2 }, {}] });
  act(g, 0, 'Elegant Egotist'); settle(g, 'Harpie Lady Sisters', 'Attack');
  ok(on(g, 0, 'Harpie Lady Sisters'), 'Harpie Lady Sisters summoned');
  const g2 = duel({ board: [{ hand: ['Elegant Egotist', 'Harpie Lady'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Elegant Egotist'), 'not without Harpie Lady on the field');
});
T('Elephant Statues: discarded by the opponent', () => {
  const g = duel({ board: [{ hand: ['Confiscation'], turn: 2 }, { hand: ['Elephant Statue of Blessing'] }] });
  act(g, 0, 'Confiscation'); settle(g, 'Elephant Statue');
  ok(lp(g, 1) === 10000, `Blessing: B gained 2000 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Confiscation'], turn: 2 }, { hand: ['Elephant Statue of Disaster'] }] });
  act(g2, 0, 'Confiscation'); settle(g2, 'Elephant Statue');
  ok(lp(g2, 0) === 8000 - 1000 - 2000, `Disaster: A paid 1000 and took 2000 (${lp(g2, 0)})`);
});
T('Elf\'s Light: LIGHT +400 ATK, -200 DEF', () => {
  const g = duel({ board: [{ hand: ['Elf\'s Light'], m: ['Bio-Mage'], turn: 2 }, {}] });
  act(g, 0, 'Elf\'s Light'); settle(g, 'Bio-Mage'); const b = on(g, 0, 'Bio-Mage');
  ok(E.atk(g, b) === 1550 && E.def(g, b) === 800, `Bio-Mage ${E.atk(g, b)}/${E.def(g, b)}`);
});
T('Emblem of Dragon Destroyer: Buster Blader from Deck or GY', () => {
  const g = duel({ board: [{ hand: ['Emblem of Dragon Destroyer'], gy: ['Buster Blader'], turn: 2 }, {}] });
  act(g, 0, 'Emblem of Dragon Destroyer'); settle(g, 'Buster Blader');
  ok(inZ(g, 0, 'hand', 'Buster Blader'), 'from the GY');
  const g2 = duel({ board: [{ hand: ['Emblem of Dragon Destroyer'], deckTop: [FILL, FILL, 'Buster Blader'], turn: 2 }, {}] });
  act(g2, 0, 'Emblem of Dragon Destroyer'); settle(g2, 'Buster Blader');
  ok(inZ(g2, 0, 'hand', 'Buster Blader'), 'from the Deck');
});
T('Embodiment of Apophis: becomes a 1600/1800 monster', () => {
  const g = duel({ board: [{ hand: [], st: ['Embodiment of Apophis'], turn: 2 }, {}] });
  act(g, 0, 'Embodiment of Apophis'); settle(g, 'Attack');
  const a = on(g, 0, 'Embodiment of Apophis');
  ok(a && E.atk(g, a) === 1600 && E.def(g, a) === 1800, 'Apophis is a 1600/1800 monster (Type/Attribute: documented PARTIAL)');
});
T('Emergency Provisions: send other Spells/Traps, gain 1000 each', () => {
  const g = duel({ board: [{ hand: [], st: ['Emergency Provisions', { n: 'Gravity Bind', pos: 'up' }, 'Trap Hole'], turn: 2 }, {}] });
  act(g, 0, 'Emergency Provisions'); settle(g, 'Gravity Bind', 'Trap Hole');
  ok(lp(g, 0) === 10000 && inZ(g, 0, 'gy', 'Gravity Bind') && inZ(g, 0, 'gy', 'Trap Hole'), `gained 2000 (${lp(g, 0)})`);
});
T('Emes the Infinity: +700 after destroying by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Emes the Infinity'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Emes the Infinity', FILL);
  ok(E.atk(g, on(g, 0, 'Emes the Infinity')) === 3200, `Emes ${E.atk(g, on(g, 0, 'Emes the Infinity'))}`);
});
T('Empress Judge and Flower Wolf: Fusion Summoned with Polymerization', () => {
  const g = duel({ ex0: ['Empress Judge'], board: [{ hand: ['Polymerization', 'Queen\'s Double', 'Hibikime'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Empress Judge', 'Queen\'s Double', 'Hibikime', 'Attack');
  ok(on(g, 0, 'Empress Judge'), 'Empress Judge summoned');
  const g2 = duel({ ex0: ['Flower Wolf'], board: [{ hand: ['Polymerization', 'Silver Fang', 'Darkworld Thorns'], turn: 2 }, {}] });
  act(g2, 0, 'Polymerization'); settle(g2, 'Flower Wolf', 'Silver Fang', 'Darkworld Thorns', 'Attack');
  ok(on(g2, 0, 'Flower Wolf'), 'Flower Wolf summoned');
});
T('Enchanted Javelin: gain LP equal to the attacker\'s ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Vorse Raider'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }], st: ['Enchanted Javelin'] }] });
  bp(g); atkOn(g, 0, 'Vorse Raider', 'Mystical Elf', 'Enchanted Javelin');
  ok(lp(g, 1) === 9900, `B gained 1900 (${lp(g, 1)})`);
});
T('Enchanting Fitting Room: pay 800, summon Level 3 or lower Normals from the top 4', () => {
  const g = duel({ board: [{ hand: ['Enchanting Fitting Room'], deckTop: [FILL, 'Basic Insect', 'Armaill', 'Vorse Raider', 'Dark Bat'], turn: 2 }, {}] });
  act(g, 0, 'Enchanting Fitting Room'); settle(g, 'Basic Insect', 'Armaill', 'Dark Bat', 'Attack');
  ok(lp(g, 0) === 7200, `paid 800 (${lp(g, 0)})`);
  ok(on(g, 0, 'Basic Insect') && on(g, 0, 'Armaill') && on(g, 0, 'Dark Bat') && !on(g, 0, 'Vorse Raider'), '3 Normals summoned, Vorse Raider (Level 4) not');
  ok(g.p[0].deck.some(c => E.name(c) === 'Vorse Raider'), 'Vorse Raider back in the Deck');
});
T('Enervating Mist: opponent hand limit 5', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Enervating Mist', pos: 'up' }], turn: 2 }, { hand: [FILL, FILL, FILL, FILL, FILL, FILL] }] });
  endTurn(g); endTurn(g);
  ok(hand(g, 1) === 5, `B hand ${hand(g, 1)}`);
});
T('Enraged Muka Muka and Flash Assailant: stats by hand size', () => {
  const g = duel({ board: [{ hand: [FILL, FILL], m: ['Enraged Muka Muka', 'Flash Assailant'], turn: 2 }, {}] });
  const m = on(g, 0, 'Enraged Muka Muka'), f = on(g, 0, 'Flash Assailant');
  ok(hand(g, 0) === 3 && E.atk(g, m) === 2400 && E.def(g, m) === 1800, `Muka Muka ${E.atk(g, m)}/${E.def(g, m)} with ${hand(g, 0)} cards`);
  ok(E.atk(g, f) === 800 && E.def(g, f) === 800, `Flash Assailant ${E.atk(g, f)}/${E.def(g, f)}`);
});
T('Eria the Water Charmer: FLIP takes a WATER monster', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Eria the Water Charmer', pos: 'set' }], turn: 2 }, { m: ['7 Colored Fish', 'Vorse Raider'] }] });
  flipSum(g, 0, 'Eria the Water Charmer'); settle(g, '7 Colored Fish');
  ok(on(g, 0, '7 Colored Fish') && on(g, 1, 'Vorse Raider'), 'A controls 7 Colored Fish');
});
T('Eternal Rest: destroys equipped monsters', () => {
  const g = duel({ board: [{ hand: ['Electro-Whip', 'Eternal Rest'], m: ['Wattkid', 'Vorse Raider'], turn: 2 }, {}] });
  act(g, 0, 'Electro-Whip'); settle(g, 'Wattkid'); act(g, 0, 'Eternal Rest'); settle(g);
  ok(inZ(g, 0, 'gy', 'Wattkid') && on(g, 0, 'Vorse Raider'), 'Wattkid destroyed, Vorse Raider stays');
});
T('Exchange: each takes 1 card from the other\'s hand', () => {
  const g = duel({ board: [{ hand: ['Exchange', 'Sangan'], turn: 2 }, { hand: ['Vorse Raider', 'Pot of Greed'] }] });
  act(g, 0, 'Exchange'); settle(g, 'Pot of Greed', 'Sangan');
  ok(inZ(g, 0, 'hand', 'Pot of Greed') && inZ(g, 1, 'hand', 'Sangan') && inZ(g, 1, 'hand', 'Vorse Raider'), 'A got Pot of Greed, B got Sangan');
});
T('Exhausting Spell: removes Spell Counters', () => {
  const g = duel({ board: [{ hand: ['Breaker the Magical Warrior'], st: ['Exhausting Spell'], turn: 2 }, {}] });
  ns(g, 0, 'Breaker the Magical Warrior'); const b = on(g, 0, 'Breaker the Magical Warrior');
  ok(E.lib.ctr(b, 'spell') === 1, 'Breaker has a counter');
  act(g, 0, 'Exhausting Spell'); settle(g);
  ok(E.lib.ctr(b, 'spell') === 0 && E.atk(g, b) === 1600, `counter removed, ATK ${E.atk(g, b)}`);
});
T('Exile of the Wicked: destroys all Fiends', () => {
  const g = duel({ board: [{ hand: ['Exile of the Wicked'], turn: 2 }, { m: ['Archfiend Soldier', FILL] }] });
  act(g, 0, 'Exile of the Wicked'); settle(g);
  ok(inZ(g, 1, 'gy', 'Archfiend Soldier') && on(g, 1, FILL), 'Archfiend Soldier destroyed only');
});
T('Exiled Force: Tribute to destroy a monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Exiled Force'], turn: 2 }, { m: ['Vorse Raider'] }] });
  act(g, 0, 'Exiled Force'); settle(g, 'Vorse Raider');
  ok(inZ(g, 0, 'gy', 'Exiled Force') && inZ(g, 1, 'gy', 'Vorse Raider'), 'both in the GY');
});
const PIECES = ['Exodia the Forbidden One', 'Right Arm of the Forbidden One', 'Left Arm of the Forbidden One', 'Right Leg of the Forbidden One', 'Left Leg of the Forbidden One'];
T('Exodia Necross: only by Contract, survives destruction, grows', () => {
  const g0 = duel({ board: [{ hand: ['Exodia Necross'], gy: PIECES, turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Exodia Necross')), 'cannot be Normal Summoned or Set');
  const g = duel({ board: [{ hand: ['Contract with Exodia', 'Exodia Necross', 'Dark Hole'], gy: PIECES, turn: 2 }, { m: ['Vorse Raider'] }] });
  act(g, 0, 'Contract with Exodia'); settle(g, 'Exodia Necross', 'Attack');
  ok(on(g, 0, 'Exodia Necross'), 'Special Summoned by Contract with Exodia');
  act(g, 0, 'Dark Hole'); settle(g);
  ok(on(g, 0, 'Exodia Necross') && inZ(g, 1, 'gy', 'Vorse Raider'), 'survives Dark Hole');
  endTurn(g); endTurn(g);
  ok(E.atk(g, on(g, 0, 'Exodia Necross')) === 2300, `2300 ATK after A's Standby (${E.atk(g, on(g, 0, 'Exodia Necross'))})`);
  const g3 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Exodia Necross', ...PIECES], turn: 2 }, {}] });
  if (canAct(g3, 0, 'Monster Reborn')) { act(g3, 0, 'Monster Reborn'); settle(g3, 'Exodia Necross', 'Attack'); }
  ok(!on(g3, 0, 'Exodia Necross'), 'not by Monster Reborn');
  const g2 = duel({ board: [{ hand: [], m: ['Exodia Necross'], gy: PIECES.slice(1), turn: 2 }, {}] });
  ok(!on(g2, 0, 'Exodia Necross'), 'destroyed without all 5 pieces (Standby)');
});
T('Exodia the Forbidden One: all 5 pieces in hand win', () => {
  const g = duel({ board: [{ hand: PIECES.slice(0, 4), deckTop: [PIECES[4]], turn: 2 }, {}] });
  ok(g.winner === 0, `A wins (${g.why})`);
});
/* ---------------- F ---------------- */
T('Fairy\'s Hand Mirror: redirects a 1-target Spell', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: ['Harpie Lady'], turn: 2 }, { m: ['Vorse Raider'], st: ['Fairy\'s Hand Mirror'] }] });
  act(g, 0, 'Book of Moon'); settle(g, 'Vorse Raider', 'Fairy\'s Hand Mirror', 'Harpie Lady');
  ok(on(g, 0, 'Harpie Lady').pos === 'set' && on(g, 1, 'Vorse Raider').pos === 'atk', 'Book of Moon set Harpie Lady instead');
});
T('Falling Down: take control with an Archfiend; 800 each opponent Standby', () => {
  const g = duel({ board: [{ hand: ['Falling Down'], m: ['Archfiend Soldier'], turn: 2 }, { hand: [], m: ['Vorse Raider'] }] });
  act(g, 0, 'Falling Down'); settle(g, 'Vorse Raider');
  ok(on(g, 0, 'Vorse Raider'), 'A controls Vorse Raider');
  endTurn(g);
  ok(lp(g, 0) === 7200, `A took 800 in B's Standby (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Falling Down'], m: [FILL], turn: 2 }, { m: ['Vorse Raider'] }] });
  if (canAct(g2, 0, 'Falling Down')) { act(g2, 0, 'Falling Down'); settle(g2, 'Vorse Raider'); }
  ok(on(g2, 1, 'Vorse Raider'), 'no control without an Archfiend');
});
T('Fatal Abacus: 500 to the owner per monster sent to the GY', () => {
  const g = duel({ board: [{ hand: ['Raigeki'], st: [{ n: 'Fatal Abacus', pos: 'up' }], turn: 2 }, { m: [FILL, 'Vorse Raider'] }] });
  act(g, 0, 'Raigeki'); settle(g);
  ok(lp(g, 1) === 7000 && lp(g, 0) === 8000, `B took 1000 (${lp(g, 1)})`);
});
T('Fear from the Dark: discarded by the opponent, Special Summons itself', () => {
  const g = duel({ board: [{ hand: ['Confiscation'], turn: 2 }, { hand: ['Fear from the Dark'] }] });
  act(g, 0, 'Confiscation'); settle(g, 'Fear from the Dark', 'Attack');
  ok(on(g, 1, 'Fear from the Dark'), 'Fear from the Dark Special Summoned');
});
T('Fengsheng Mirror: discards a Spirit', () => {
  const g = duel({ board: [{ hand: ['Fengsheng Mirror'], turn: 2 }, { hand: ['Asura Priest', 'Vorse Raider'] }] });
  act(g, 0, 'Fengsheng Mirror'); settle(g, 'Asura Priest');
  ok(inZ(g, 1, 'gy', 'Asura Priest') && inZ(g, 1, 'hand', 'Vorse Raider'), 'Asura Priest discarded');
});
T('Fenrir: summon by banishing 2 WATER, skip draw after a battle kill', () => {
  const g0 = duel({ board: [{ hand: ['Fenrir'], turn: 2 }, {}] });
  ok(!hasOpt(g0, 'ns:' + card(g0, 0, 'Fenrir').u) && !hasOpt(g0, 'sp:' + card(g0, 0, 'Fenrir').u), 'no summon without 2 WATER in the GY');
  const g = duel({ board: [{ hand: ['Fenrir'], gy: ['7 Colored Fish', '7 Colored Fish'], turn: 2 }, { hand: [], m: ['Basic Insect'] }] });
  choose(g, 'sp:' + card(g, 0, 'Fenrir').u); settle(g, '7 Colored Fish', 'Attack');
  ok(on(g, 0, 'Fenrir') && cnt(g, 0, 'ban', '7 Colored Fish') === 2, 'Fenrir summoned, 2 WATER banished');
  bp(g); atkOn(g, 0, 'Fenrir', 'Basic Insect'); endTurn(g);
  ok(hand(g, 1) === 0, `B skipped the draw (hand ${hand(g, 1)})`);
});
T('Fiber Jar: everything back to the Deck, each draws 5', () => {
  const g = duel({ board: [{ hand: ['Sangan'], m: [{ n: 'Fiber Jar', pos: 'set' }], gy: ['Raigeki'], turn: 2 }, { m: ['Vorse Raider'], st: ['Trap Hole'], gy: ['Dark Hole'] }] });
  flipSum(g, 0, 'Fiber Jar'); settle(g);
  ok(hand(g, 0) === 5 && hand(g, 1) === 5, `hands ${hand(g, 0)}/${hand(g, 1)}`);
  ok(cnt(g, 0, 'm') + cnt(g, 1, 'm') + cnt(g, 0, 'st') + cnt(g, 1, 'st') + cnt(g, 0, 'gy') + cnt(g, 1, 'gy') === 0, 'field and GYs empty');
});
T('Fiend\'s Hand Mirror: redirects a Spell that targets a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Dust Tornado'], turn: 2 }, { st: ['Gravity Bind', 'Fiend\'s Hand Mirror'] }] });
  act(g, 0, 'Mystical Space Typhoon'); pickC(g, card(g, 1, 'Gravity Bind')); settle(g, 'Fiend\'s Hand Mirror');
  if (g.prompt && g.prompt.type === 'pick') pickC(g, card(g, 0, 'Dust Tornado')); settle(g);
  ok(inZ(g, 1, 'st', 'Gravity Bind') && inZ(g, 0, 'gy', 'Dust Tornado'), 'MST destroyed Dust Tornado instead');
});
T('Firebird: +500 when a Winged Beast you control is destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Firebird', 'Harpie Lady'], turn: 2 }, { m: ['Vorse Raider'] }] });
  bp(g); atkOn(g, 0, 'Harpie Lady', 'Vorse Raider');
  ok(E.atk(g, on(g, 0, 'Firebird')) === 1500, `Firebird ${E.atk(g, on(g, 0, 'Firebird'))}`);
});
T('Fissure: destroys the lowest-ATK face-up opponent monster', () => {
  const g = duel({ board: [{ hand: ['Fissure'], turn: 2 }, { m: ['Vorse Raider', 'Harpie Lady', { n: 'Basic Insect', pos: 'set' }] }] });
  act(g, 0, 'Fissure'); settle(g);
  ok(inZ(g, 1, 'gy', 'Harpie Lady') && on(g, 1, 'Vorse Raider') && on(g, 1, 'Basic Insect'), 'Harpie Lady destroyed');
});
T('Follow Wind: Winged Beast +300/+300', () => {
  const g = duel({ board: [{ hand: ['Follow Wind'], m: ['Harpie Lady'], turn: 2 }, {}] });
  act(g, 0, 'Follow Wind'); settle(g, 'Harpie Lady'); const h = on(g, 0, 'Harpie Lady');
  ok(E.atk(g, h) === 1600 && E.def(g, h) === 1700, `Harpie ${E.atk(g, h)}/${E.def(g, h)}`);
});
T('Forest: Insect, Beast, Plant, Beast-Warrior +200', () => {
  const g = duel({ board: [{ hand: ['Forest'], m: ['Basic Insect', 'Harpie Lady'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Forest'); settle(g);
  const b = on(g, 0, 'Basic Insect');
  ok(E.atk(g, b) === 700 && E.def(g, b) === 900 && E.atk(g, on(g, 1, FILL)) === 2200 && E.atk(g, on(g, 0, 'Harpie Lady')) === 1300, 'Insect and Beast-Warrior +200, Harpie unchanged');
});
T('Formation Union: equips a Union monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Burning Beast', 'Freezing Beast'], st: ['Formation Union'], turn: 2 }, {}] });
  act(g, 0, 'Formation Union'); settle(g, 'Equip', 'Freezing Beast', 'Burning Beast');
  ok(inZ(g, 0, 'st', 'Freezing Beast') && on(g, 0, 'Burning Beast'), 'Freezing Beast equipped');
  const g2 = duel({ board: [{ hand: ['Burning Beast'], m: ['Freezing Beast'], st: [null, 'Formation Union'], turn: 2 }, {}] });
  ns(g2, 0, 'Burning Beast'); act(g2, 0, 'Freezing Beast'); settle(g2, 'Equip', 'Burning Beast');
  ok(inZ(g2, 0, 'st', 'Freezing Beast'), 'equipped by its own effect');
  act(g2, 0, 'Formation Union'); settle(g2, 'Unequip', 'Special Summon', 'Freezing Beast', 'Attack');
  const fz = on(g2, 0, 'Freezing Beast'); ok(fz && fz.pos === 'atk', 'Freezing Beast unequipped and summoned in Attack');
});
T('Fox Fire: returns in the End Phase after a battle destruction', () => {
  const g = duel({ board: [{ hand: [], m: ['Fox Fire'], turn: 2 }, { m: ['Vorse Raider'] }] });
  bp(g); atkOn(g, 0, 'Fox Fire', 'Vorse Raider');
  ok(inZ(g, 0, 'gy', 'Fox Fire'), 'Fox Fire destroyed');
  endTurn(g, 'Fox Fire', 'Attack');
  ok(on(g, 0, 'Fox Fire'), 'Fox Fire back in the End Phase');
});
T('Freed the Matchless General: negates targeting Spells; search instead of draw', () => {
  const g = duel({ board: [{ hand: [], m: ['Freed the Matchless General'], deckTop: [FILL, 'Command Knight'], turn: 2 }, {}] });
  settle(g, 'Command Knight');
  ok(inZ(g, 0, 'hand', 'Command Knight') && hand(g, 0) === 1, `searched Command Knight instead of drawing (hand ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Book of Moon'], m: ['Freed the Matchless General'], turn: 2 }, {}] });
  settle(g2, 'NO');
  act(g2, 0, 'Book of Moon'); settle(g2, 'Freed');
  ok(on(g2, 0, 'Freed the Matchless General').pos === 'atk' && inZ(g2, 0, 'gy', 'Book of Moon'), 'Book of Moon negated');
});
T('Freezing Beast: equip to Burning Beast, destroy a Set Spell/Trap on damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Burning Beast', 'Freezing Beast'], turn: 2 }, { st: ['Trap Hole'] }] });
  act(g, 0, 'Freezing Beast'); settle(g, 'Equip', 'Burning Beast');
  ok(inZ(g, 0, 'st', 'Freezing Beast'), 'equipped');
  bp(g); atkOn(g, 0, 'Burning Beast', null, 'Trap Hole');
  ok(lp(g, 1) === 6500 && inZ(g, 1, 'gy', 'Trap Hole'), 'Trap Hole destroyed');
});
T('Frontier Wiseman: negates Spells targeting your Warriors', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], m: ['Frontier Wiseman', 'Command Knight'], turn: 2 }, {}] });
  act(g, 0, 'Book of Moon'); settle(g, 'Command Knight', 'Frontier Wiseman');
  ok(on(g, 0, 'Command Knight').pos === 'atk' && inZ(g, 0, 'gy', 'Book of Moon'), 'Book of Moon negated');
});
T('Frontline Base: Special Summon a Level 4 or lower Union once per turn', () => {
  const g = duel({ board: [{ hand: ['Burning Beast', 'Freezing Beast'], st: [{ n: 'Frontline Base', pos: 'up' }], turn: 2 }, {}] });
  act(g, 0, 'Frontline Base'); settle(g, 'Burning Beast', 'Attack');
  ok(on(g, 0, 'Burning Beast'), 'Burning Beast summoned');
  ok(!canAct(g, 0, 'Frontline Base'), 'once per turn');
});
T('Frozen Soul: skip the opponent\'s next Battle Phase', () => {
  const g = duel({ board: [{ hand: ['Basic Insect'], m: ['Vorse Raider'], turn: 2 }, { lp: 5000, st: ['Frozen Soul'] }] });
  ns(g, 0, 'Basic Insect', 'Frozen Soul');
  ok(inZ(g, 1, 'gy', 'Frozen Soul'), 'Frozen Soul used');
  if (hasOpt(g, 'bp')) { choose(g, 'bp'); settle(g); }
  ok(!canAtk(g, on(g, 0, 'Vorse Raider'), null) && lp(g, 1) === 5000, 'no attack this turn');
  const g2 = duel({ board: [{ hand: ['Basic Insect'], m: ['Vorse Raider'], turn: 2 }, { lp: 7000, st: ['Frozen Soul'] }] });
  ns(g2, 0, 'Basic Insect', 'Frozen Soul');
  ok(inZ(g2, 1, 'st', 'Frozen Soul'), 'not with only 1000 less');
});
T('Fruits of Kozaky\'s Studies: reorders the top 3', () => {
  const g = duel({ board: [{ hand: [], st: ['Fruits of Kozaky\'s Studies'], deckTop: [FILL, 'Sangan', 'Raigeki', 'Dark Hole'], turn: 2 }, {}] });
  act(g, 0, 'Fruits of Kozaky\'s Studies'); settle(g, 'Dark Hole', 'Raigeki', 'Sangan');
  const d = g.p[0].deck, t3 = d.slice(-3).map(c => E.name(c)).sort();
  ok(JSON.stringify(t3) === JSON.stringify(['Dark Hole', 'Raigeki', 'Sangan']), 'the same 3 cards on top: ' + d.slice(-3).map(c => E.name(c)).join(', '));
  ok(E.name(top(g, 0)) === 'Dark Hole', 'Dark Hole chosen first is on top');
});
T('Fuh-Rin-Ka-Zan: with WIND, WATER, FIRE, EARTH face-up, destroy opponent monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Harpie Lady', '7 Colored Fish'], st: ['Fuh-Rin-Ka-Zan'], turn: 2 }, { m: ['Blazing Inpachi', FILL] }] });
  ok(canAct(g, 0, 'Fuh-Rin-Ka-Zan'), 'offered'); act(g, 0, 'Fuh-Rin-Ka-Zan'); settle(g, 'monsters');
  ok(cnt(g, 1, 'm') === 0 && on(g, 0, 'Harpie Lady'), 'opponent monsters destroyed');
  const g2 = duel({ board: [{ hand: [], m: ['Harpie Lady', '7 Colored Fish'], st: ['Fuh-Rin-Ka-Zan'], turn: 2 }, { m: [FILL] }] });
  ok(!canAct(g2, 0, 'Fuh-Rin-Ka-Zan'), 'not without FIRE');
  const g3 = duel({ board: [{ hand: [], m: ['Harpie Lady', '7 Colored Fish'], st: ['Fuh-Rin-Ka-Zan'], turn: 2 }, { m: ['Blazing Inpachi', FILL] }] });
  act(g3, 0, 'Fuh-Rin-Ka-Zan'); settle(g3, 'Draw');
  ok(hand(g3, 0) === 3, `drew 2 (hand ${hand(g3, 0)})`);
});

// Goat: quick checks of the shared scripts and Goat-only overrides
{
  const vm = require('vm'), fs = require('fs'), path = require('path');
  const root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
  for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const GE = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; GE.init(GC, { format: 'goat' });
  const GF = '7 Colored Fish';
  const gid = n => { const c = GC.find(x => x.n === n); if (!c) throw new Error('no goat card ' + n); return c.id; };
  const gduel = (board, ex) => (lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board }));
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Drillago direct past 1600+', () => {
    const g = gduel([{ hand: [], m: ['Drillago'], turn: 2 }, { m: ['Gemini Elf'] }]);
    bp(g); ok(canAtk(g, on(g, 0, 'Drillago'), null), 'Goat: Drillago direct offered');
    let g2 = gduel([{ hand: [], m: ['Drillago'], turn: 2 }, { m: ['Mystical Elf'] }]);
    bp(g2); ok(!canAtk(g2, on(g2, 0, 'Drillago'), null), 'Goat: not past Mystical Elf');
    g2 = gduel([{ hand: [], m: ['Drillago'], turn: 2 }, { m: ['Gemini Elf'], st: ['Mirror Force'] }]);
    bp(g2); ok(!canAtk(g2, on(g2, 0, 'Drillago'), null), 'Goat: not with a Set card');
  });
  G('Ectoplasmer burn', () => {
    const g = gduel([{ hand: [], m: ['Gemini Elf'], st: [{ n: 'Ectoplasmer', pos: 'up' }], turn: 2 }, { hand: [] }]);
    endTurn(g, 'Gemini Elf'); ok(lp(g, 1) === 7050, `Goat: B took 950 (${lp(g, 1)})`);
    const g2 = gduel([{ hand: [], st: [{ n: 'Ectoplasmer', pos: 'up' }], turn: 2 }, { hand: [], m: ['Mystical Elf'] }]);
    endTurn(g2); ok(on(g2, 1, 'Mystical Elf') && lp(g2, 0) === 8000, 'Goat: B does not Tribute in A\'s End Phase');
    endTurn(g2, 'Mystical Elf'); ok(lp(g2, 0) === 7600, `Goat: B Tributed in its own End Phase, A took 400 (${lp(g2, 0)})`);
  });
  G('Electric Snake and Elegant Egotist', () => {
    let g = gduel([{ hand: ['Confiscation'], turn: 2 }, { hand: ['Electric Snake'] }]);
    act(g, 0, 'Confiscation'); settle(g, 'Electric Snake'); ok(hand(g, 1) === 2, `Goat: Snake drew 2 (${hand(g, 1)})`);
    g = gduel([{ hand: ['Elegant Egotist'], m: ['Harpie Lady'], deckTop: [GF, 'Harpie Lady Sisters'], turn: 2 }, {}]);
    act(g, 0, 'Elegant Egotist'); settle(g, 'Harpie Lady Sisters', 'Attack'); ok(on(g, 0, 'Harpie Lady Sisters'), 'Goat: Egotist summoned the Sisters');
  });
  G('Elf\'s Light, Apophis, Emergency Provisions', () => {
    let g = gduel([{ hand: ['Elf\'s Light'], m: ['Bio-Mage'], turn: 2 }, {}]);
    act(g, 0, 'Elf\'s Light'); settle(g, 'Bio-Mage'); ok(E.atk(g, on(g, 0, 'Bio-Mage')) === 1550 && E.def(g, on(g, 0, 'Bio-Mage')) === 800, 'Goat: Elf\'s Light');
    g = gduel([{ hand: [], st: ['Embodiment of Apophis'], turn: 2 }, {}]);
    act(g, 0, 'Embodiment of Apophis'); settle(g, 'Attack'); ok(on(g, 0, 'Embodiment of Apophis'), 'Goat: Apophis summoned');
    g = gduel([{ hand: [], st: ['Emergency Provisions', { n: 'Gravity Bind', pos: 'up' }], turn: 2 }, {}]);
    act(g, 0, 'Emergency Provisions'); settle(g, 'Gravity Bind'); ok(lp(g, 0) === 9000, `Goat: Provisions +1000 (${lp(g, 0)})`);
  });
  G('Exchange, Exile of the Wicked, Exiled Force, Fengsheng Mirror', () => {
    let g = gduel([{ hand: ['Exchange', 'Sangan'], turn: 2 }, { hand: ['Gemini Elf', 'Pot of Greed'] }]);
    act(g, 0, 'Exchange'); settle(g, 'Pot of Greed', 'Sangan'); ok(inZ(g, 0, 'hand', 'Pot of Greed') && inZ(g, 1, 'hand', 'Sangan'), 'Goat: Exchange');
    g = gduel([{ hand: ['Exile of the Wicked'], turn: 2 }, { m: ['Archfiend Soldier', 'Gemini Elf'] }]);
    act(g, 0, 'Exile of the Wicked'); settle(g); ok(inZ(g, 1, 'gy', 'Archfiend Soldier') && on(g, 1, 'Gemini Elf'), 'Goat: Exile');
    g = gduel([{ hand: [], m: ['Exiled Force'], turn: 2 }, { m: ['Gemini Elf'] }]);
    act(g, 0, 'Exiled Force'); settle(g, 'Gemini Elf'); ok(inZ(g, 1, 'gy', 'Gemini Elf'), 'Goat: Exiled Force');
    g = gduel([{ hand: ['Fengsheng Mirror'], turn: 2 }, { hand: ['Asura Priest', 'Gemini Elf'] }]);
    act(g, 0, 'Fengsheng Mirror'); settle(g, 'Asura Priest'); ok(inZ(g, 1, 'gy', 'Asura Priest'), 'Goat: Fengsheng');
  });
  G('Empress Judge and Exodia', () => {
    let g = gduel([{ hand: ['Polymerization', 'Queen\'s Double', 'Hibikime'], turn: 2 }, {}], ['Empress Judge']);
    act(g, 0, 'Polymerization'); settle(g, 'Empress Judge', 'Queen\'s Double', 'Hibikime', 'Attack'); ok(on(g, 0, 'Empress Judge'), 'Goat: Empress Judge');
    g = gduel([{ hand: PIECES.slice(0, 4), deckTop: [PIECES[4]], turn: 2 }, {}]);
    ok(g.winner === 0, 'Goat: Exodia wins');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-21 review checks passed.');
process.exit(fails ? 1 : 0);
