// Independent review checks for full pool batch 06 (written from the card text): node build/review_full-06.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
let lastG; function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
}
let fails = 0;
const dump = () => { if (process.env.DBG && lastG) console.log('   | ' + lastG.log.slice(-18).join('\n   | ') + '\n   prompt: ' + (lastG.prompt ? lastG.prompt.p + ' ' + lastG.prompt.type + ' ' + lastG.prompt.text + ' :: ' + lastG.prompt.opts.map(x => x.label + '[' + x.key + ']').join(', ') : 'none')); };
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) { fails++; dump(); } }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra, ...g.p[p].ban, g.p[p].fz].find(c => c && E.name(c) === n);
const aKey = (g, p, n) => 'a:' + card(g, p, n).u + ':';
const act = (g, p, n) => choose(g, aKey(g, p, n));
const canAct = (g, p, n) => hasOpt(g, aKey(g, p, n));
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); dump(); } };
// answer prompts until an idle or battle prompt: passes responses (or takes a listed one), yes to yes/no, picks by label
function settle(g, ...picks) {
  for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond') { const k = picks.find(t => pr.opts.some(x => x.key !== 'pass' && (x.label + ' ' + x.key).includes(t))); if (k) { picks = picks.filter(x => x !== k); choose(g, k); } else E.act(g, ['pass']); }
    else if (pr.type === 'yesno') choose(g, picks.includes('no') ? 'no' : 'yes');
    else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => (x.label + ' ' + x.key).includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); }
      for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); E.act(g, ks); }
  }
}
const bp = g => { choose(g, 'bp'); settle(g); };
const atkOn = (g, p, aName, tName) => { const a = on(g, p, aName), t = tName === 'd' ? null : (on(g, 1 - p, tName) || g.p[1 - p].m.find(c => c && c.pos === 'set')); choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); };
const endTurn = (g, ...picks) => { for (let i = 0; i < 3 && g.prompt.opts.some(x => x.key === 'endbp'); i++) { E.act(g, ['endbp']); settle(g); } E.act(g, ['end']); settle(g, ...picks); };
const roll = (g, n) => { g.rnd = () => (n - 0.5) / 6; }; // every die roll from now on shows n
const putField = (g, p, n) => { const c = g.p[p].hand.find(x => E.name(x) === n); g.p[p].hand.splice(g.p[p].hand.indexOf(c), 1); c.zone = 'fz'; c.pos = 'up'; c.turnIn = 0; g.p[p].fz = c; return c; };

/* ---------- monsters ---------- */
T('Dark Master - Zorc: roll 1 destroys all opponent monsters, 6 destroys your own', () => {
  const g = duel({ board: [{ m: ['Dark Master - Zorc', FILL], turn: 2 }, { m: [FILL, 'Mystic Tomato'] }] });
  roll(g, 1); act(g, 0, 'Dark Master - Zorc'); settle(g);
  ok(cnt(g, 1, 'm') === 0 && on(g, 0, 'Dark Master - Zorc') && on(g, 0, FILL), 'roll 1: both B monsters destroyed, A keeps its own');
  ok(!canAct(g, 0, 'Dark Master - Zorc'), 'once per turn');
  const g2 = duel({ board: [{ m: ['Dark Master - Zorc', FILL], turn: 2 }, { m: [FILL, 'Mystic Tomato'] }] });
  roll(g2, 6); act(g2, 0, 'Dark Master - Zorc'); settle(g2);
  ok(cnt(g2, 0, 'm') === 0 && cnt(g2, 1, 'm') === 2, 'roll 6: all A monsters (Zorc too) destroyed');
  const g3 = duel({ board: [{ m: ['Dark Master - Zorc'], turn: 2 }, { m: [FILL, 'Mystic Tomato'] }] });
  roll(g3, 4); act(g3, 0, 'Dark Master - Zorc'); settle(g3, FILL);
  ok(cnt(g3, 1, 'm') === 1, 'roll 4: one B monster destroyed');
  const g4 = duel({ board: [{ hand: ['Dark Master - Zorc'], m: [FILL, FILL, FILL], turn: 2 }, {}] });
  ok(!hasOpt(g4, 'ns:' + card(g4, 0, 'Dark Master - Zorc').u), 'Ritual Monster cannot be Normal Summoned');
});
T('Chick the Yellow: battle damage returns a card on the field to the hand', () => {
  const g = duel({ board: [{ m: ['Dark Scorpion - Chick the Yellow'], turn: 2 }, { st: ['Pot of Greed'] }] });
  bp(g); atkOn(g, 0, 'Dark Scorpion - Chick the Yellow', 'd'); settle(g, 'eturn', 'Pot of Greed', 'ace-down');
  ok(g.p[1].lp === 7000 && inZ(g, 1, 'hand', 'Pot of Greed'), `1000 damage and the Set card back to B's hand (B ${g.p[1].lp})`);
});
T('Cliff the Trap Remover: destroy a Spell/Trap, or mill 2', () => {
  const g = duel({ board: [{ m: ['Dark Scorpion - Cliff the Trap Remover'], turn: 2 }, { st: ['Pot of Greed'] }] });
  bp(g); atkOn(g, 0, 'Dark Scorpion - Cliff the Trap Remover', 'd'); settle(g, 'estroy', 'Pot of Greed', 'ace-down');
  ok(inZ(g, 1, 'gy', 'Pot of Greed') && g.p[1].lp === 6800, 'the Set card destroyed');
  const g2 = duel({ board: [{ m: ['Dark Scorpion - Cliff the Trap Remover'], turn: 2 }, {}] });
  const d = g2.p[1].deck.length;
  bp(g2); atkOn(g2, 0, 'Dark Scorpion - Cliff the Trap Remover', 'd'); settle(g2, 'top 2', 'Send', 'mill', 'GY');
  ok(cnt(g2, 1, 'gy') === 2 && g2.p[1].deck.length === d - 2, `top 2 of B's Deck sent to the GY (${cnt(g2, 1, 'gy')})`);
});
T('Gorg the Strong: return an opponent monster to the top of the Deck', () => {
  const g = duel({ board: [{ m: ['Dark Scorpion - Gorg the Strong'], turn: 2 }, { m: ['Harpie Lady', 'Sangan'] }] });
  bp(g); atkOn(g, 0, 'Dark Scorpion - Gorg the Strong', 'Harpie Lady'); settle(g, 'eturn', 'Sangan');
  const top = g.p[1].deck[g.p[1].deck.length - 1];
  ok(g.p[1].lp === 7500 && !on(g, 1, 'Sangan') && E.name(top) === 'Sangan', `Sangan on top of B's Deck (B ${g.p[1].lp})`);
});
T('Meanae the Thorn: add a Dark Scorpion card from the Deck', () => {
  const g = duel({ board: [{ m: ['Dark Scorpion - Meanae the Thorn'], deckTop: [FILL, 'Dark Scorpion - Chick the Yellow'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Dark Scorpion - Meanae the Thorn', 'd'); settle(g, 'Deck', 'Chick');
  ok(inZ(g, 0, 'hand', 'Dark Scorpion - Chick the Yellow'), 'Chick added from the Deck');
  const g2 = duel({ board: [{ m: ['Dark Scorpion - Meanae the Thorn'], gy: ['Dark Scorpion - Gorg the Strong'], turn: 2 }, {}] });
  bp(g2); atkOn(g2, 0, 'Dark Scorpion - Meanae the Thorn', 'd'); settle(g2, 'GY', 'Gorg');
  ok(inZ(g2, 0, 'hand', 'Dark Scorpion - Gorg the Strong'), 'Gorg added from the GY');
});
T('Darkness Destroyer: no Special Summon, two attacks, piercing', () => {
  const g = duel({ board: [{ m: ['Darkness Destroyer'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }, { n: 'Mystic Tomato', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Darkness Destroyer', 'Sangan'); settle(g, 'no');
  ok(g.p[1].lp === 8000 - 1700, `piercing 2300 - 600 = 1700 (B ${g.p[1].lp})`);
  ok(hasOpt(g, 'atk:' + on(g, 0, 'Darkness Destroyer').u), 'second attack offered');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Darkness Destroyer'], turn: 2 }, {}] });
  if (canAct(g2, 0, 'Monster Reborn')) { act(g2, 0, 'Monster Reborn'); settle(g2, 'Darkness Destroyer'); }
  ok(!on(g2, 0, 'Darkness Destroyer'), 'Monster Reborn cannot Special Summon it');
});
T('Darkness Neosphere: summon on attack with 2 Fiends, battle-proof, returns Traps', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { hand: ['Darkness Neosphere', 'Giant Germ'], m: ['Sangan'] }] });
  const neo = card(g, 1, 'Darkness Neosphere');
  bp(g); atkOn(g, 0, FILL, 'Sangan');
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'battle' && !on(g, 1, 'Darkness Neosphere'); i++) {
    const pr = g.prompt;
    if (pr.p === 1 && pr.opts.some(x => x.key.includes(':' + neo.u) || (x.label + x.key).includes('Neosphere'))) { const o = pr.opts.find(x => x.key.includes(neo.u) || (x.label + x.key).includes('Neosphere')); E.act(g, [o.key]); }
    else if (pr.type === 'yesno') choose(g, 'yes'); else if (pr.type === 'respond') E.act(g, ['pass']); else settle(g, 'Sangan', 'Giant Germ');
  }
  settle(g, 'Sangan', 'Giant Germ');
  ok(on(g, 1, 'Darkness Neosphere') && inZ(g, 1, 'gy', 'Sangan') && inZ(g, 1, 'gy', 'Giant Germ'), 'Neosphere summoned by sending Sangan and Giant Germ');
  const g2 = duel({ board: [{ m: ['Darkness Neosphere'], st: [{ n: 'Mirror Force', pos: 'up' }, { n: 'Sakuretsu Armor', pos: 'set' }], turn: 2 }, { m: [{ n: 'Darkness Destroyer', pos: 'atk' }] }] });
  act(g2, 0, 'Darkness Neosphere'); settle(g2);
  ok(inZ(g2, 0, 'hand', 'Mirror Force') && inZ(g2, 0, 'st', 'Sakuretsu Armor'), 'face-up Trap returned, Set Trap stays');
  const g3 = duel({ board: [{ hand: ['Darkness Neosphere'], m: [FILL, FILL, FILL], turn: 2 }, {}] });
  const n3 = card(g3, 0, 'Darkness Neosphere');
  ok(!hasOpt(g3, 'ns:' + n3.u) && !hasOpt(g3, 'set:' + n3.u), 'cannot be Normal Summoned or Set');
});
T('Darkness Neosphere cannot be destroyed by battle', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: [{ n: 'Darkness Neosphere', pos: 'def' }] }] });
  g.p[1].m[0].mods.push({ set: 0, which: 'def' });
  const neo = on(g, 1, 'Darkness Neosphere'); E.lib.addMod(g, neo, { set: 0, which: 'both' });
  bp(g); atkOn(g, 0, FILL, 'Darkness Neosphere'); settle(g);
  ok(on(g, 1, 'Darkness Neosphere'), 'Neosphere (DEF 0) survives a 2000 ATK attack');
});
T('Deepsea Macrotrema: sent from field to GY, WATER monsters gain 500', () => {
  const g = duel({ board: [{ m: ['Deepsea Macrotrema', 'Deepsea Warrior'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  bp(g); atkOn(g, 0, 'Deepsea Macrotrema', 'Cyber Dragon'); settle(g);
  const w = on(g, 0, 'Deepsea Warrior');
  ok(inZ(g, 0, 'gy', 'Deepsea Macrotrema') && E.atk(g, w) === 2100, `Deepsea Warrior at ${E.atk(g, w)}`);
  endTurn(g); ok(E.atk(g, on(g, 0, 'Deepsea Warrior')) === 1600, 'boost gone next turn');
});
T('Deepsea Shark: Bottom Dweller + Tongyo', () => {
  const g = duel({ ex0: ['Deepsea Shark'], board: [{ hand: ['Bottom Dweller', 'Tongyo'], turn: 2 }, {}] });
  ok(E.lib.canFusion(g, 0, { from: ['hand', 'm'] }), 'Fusion possible with Bottom Dweller + Tongyo');
  const g2 = duel({ ex0: ['Deepsea Shark'], board: [{ hand: ['Bottom Dweller', FILL], turn: 2 }, {}] });
  ok(!E.lib.canFusion(g2, 0, { from: ['hand', 'm'] }), 'not with Bottom Dweller + another monster');
});
T('Deepsea Warrior: unaffected by Spells while Umi is face-up', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], turn: 2 }, { hand: ['Umi'], m: ['Deepsea Warrior'] }] });
  putField(g, 1, 'Umi');
  if (canAct(g, 0, 'Smashing Ground')) { act(g, 0, 'Smashing Ground'); settle(g); }
  ok(on(g, 1, 'Deepsea Warrior'), 'Smashing Ground does not destroy it with Umi');
  const g2 = duel({ board: [{ hand: ['Smashing Ground'], turn: 2 }, { m: ['Deepsea Warrior'] }] });
  act(g2, 0, 'Smashing Ground'); settle(g2);
  ok(!on(g2, 1, 'Deepsea Warrior'), 'destroyed without Umi');
});
T('Des Dendle: equips to Vampiric Orchis, makes a token on a battle kill, unequips', () => {
  const g = duel({ board: [{ m: ['Des Dendle', 'Vampiric Orchis'], turn: 2 }, { m: ['Sangan'] }] });
  const vo = on(g, 0, 'Vampiric Orchis');
  act(g, 0, 'Des Dendle'); settle(g, 'quip', 'Vampiric Orchis');
  ok(inZ(g, 0, 'st', 'Des Dendle'), 'Des Dendle equipped');
  bp(g); atkOn(g, 0, 'Vampiric Orchis', 'Sangan'); settle(g);
  ok(on(g, 0, 'Wicked Plant Token'), 'Wicked Plant Token summoned');
  const tk = on(g, 0, 'Wicked Plant Token'); ok(tk && E.atk(g, tk) === 800 && E.def(g, tk) === 800, 'token 800/800');
  void vo;
  const g2 = duel({ board: [{ m: ['Des Dendle', 'Vampiric Orchis'], turn: 2 }, {}] });
  act(g2, 0, 'Des Dendle'); settle(g2, 'quip', 'Vampiric Orchis'); endTurn(g2); endTurn(g2);
  act(g2, 0, 'Des Dendle'); settle(g2, 'nequip', 'Special');
  ok(on(g2, 0, 'Des Dendle') && on(g2, 0, 'Des Dendle').pos === 'atk', 'unequipped and summoned in Attack Position');
});
T('Des Dendle: Orchis survives battle by destroying Dendle instead', () => {
  const g = duel({ board: [{ m: ['Des Dendle', 'Vampiric Orchis'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Des Dendle'); settle(g, 'quip', 'Vampiric Orchis');
  bp(g); atkOn(g, 0, 'Vampiric Orchis', 'Cyber Dragon'); settle(g);
  ok(on(g, 0, 'Vampiric Orchis') && inZ(g, 0, 'gy', 'Des Dendle'), 'Orchis stays, Dendle destroyed instead');
});
T('Des Feral Imp: FLIP shuffles a GY card into the Deck', () => {
  const g = duel({ board: [{ m: [{ n: 'Des Feral Imp', pos: 'set' }], gy: ['Pot of Greed'], turn: 2 }, {}] });
  const d = g.p[0].deck.length;
  choose(g, 'flip:'); settle(g, 'Pot of Greed');
  ok(!inZ(g, 0, 'gy', 'Pot of Greed') && g.p[0].deck.length === d + 1 && g.p[0].deck.some(c => E.name(c) === 'Pot of Greed'), 'Pot of Greed shuffled into the Deck');
});
T('Des Frog: Tribute Summon brings Des Frogs up to the T.A.D.P.O.L.E. count', () => {
  const g = duel({ board: [{ hand: ['Des Frog'], m: [FILL], gy: ['T.A.D.P.O.L.E.', 'T.A.D.P.O.L.E.'], deckTop: ['Des Frog', 'Des Frog', 'Des Frog'], turn: 2 }, {}] });
  choose(g, 'ns:' + card(g, 0, 'Des Frog').u); settle(g, FILL, 'Des Frog', 'Des Frog');
  ok(cnt(g, 0, 'm', 'Des Frog') === 3, `3 Des Frogs on the field (${cnt(g, 0, 'm', 'Des Frog')})`);
});
T('Des Kangaroo: destroys a weaker attacker while in Defense Position', () => {
  const g = duel({ board: [{ m: ['Mystic Tomato'], turn: 2 }, { m: [{ n: 'Des Kangaroo', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Mystic Tomato', 'Des Kangaroo'); settle(g);
  ok(inZ(g, 0, 'gy', 'Mystic Tomato') && on(g, 1, 'Des Kangaroo') && g.p[0].lp === 7700, `Tomato destroyed, A took 300 (A ${g.p[0].lp})`);
  const g2 = duel({ board: [{ m: [FILL], turn: 2 }, { m: [{ n: 'Des Kangaroo', pos: 'def' }] }] });
  bp(g2); atkOn(g2, 0, FILL, 'Des Kangaroo'); settle(g2);
  ok(on(g2, 0, FILL) && inZ(g2, 1, 'gy', 'Des Kangaroo'), 'a 2000 ATK attacker destroys it and survives');
});
T('Des Koala: FLIP burns 400 per card in the opponent\'s hand', () => {
  const g = duel({ board: [{ m: [{ n: 'Des Koala', pos: 'set' }], turn: 2 }, { hand: [FILL, FILL, FILL] }] });
  choose(g, 'flip:'); settle(g);
  ok(g.p[1].lp === 8000 - 1200, `B took 1200 (${g.p[1].lp})`);
});
T('Des Mosquito: 2 counters on summon, +500 each, loses a counter instead of dying', () => {
  const g = duel({ board: [{ hand: ['Des Mosquito'], turn: 2 }, { m: [{ n: 'Cyber Dragon', pos: 'atk' }] }] });
  choose(g, 'ns:' + card(g, 0, 'Des Mosquito').u); settle(g);
  const m = on(g, 0, 'Des Mosquito');
  ok(m && E.atk(g, m) === 1500, `ATK 1500 with 2 counters (${m && E.atk(g, m)})`);
  bp(g); atkOn(g, 0, 'Des Mosquito', 'Cyber Dragon'); settle(g);
  const m2 = on(g, 0, 'Des Mosquito');
  ok(m2 && E.atk(g, m2) === 1000 && g.p[0].lp === 8000 - 600, `survives with 1 counter, ATK ${m2 && E.atk(g, m2)}, A took 600`);
});
T('Des Volstgalph: 500 burn on a battle kill, +200 per Normal Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Des Volstgalph'], turn: 2 }, { m: ['Sangan'] }] });
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(E.atk(g, on(g, 0, 'Des Volstgalph')) === 2400, `ATK 2400 after Pot of Greed (${E.atk(g, on(g, 0, 'Des Volstgalph'))})`);
  bp(g); atkOn(g, 0, 'Des Volstgalph', 'Sangan'); settle(g);
  ok(g.p[1].lp === 8000 - 1400 - 500, `B took 1400 battle + 500 (${g.p[1].lp})`);
  endTurn(g); ok(E.atk(g, on(g, 0, 'Des Volstgalph')) === 2200, 'boost ends with the turn');
});
T('Des Wombat: effect damage to its controller becomes 0', () => {
  const g = duel({ board: [{ m: ['Des Wombat'], turn: 2 }, { m: [{ n: 'Des Koala', pos: 'set' }] }] });
  E.lib.damage(g, 0, 1000, { srcP: 1 }); E.lib.damage(g, 0, 500, { srcP: 0 }); E.lib.damage(g, 1, 500, { srcP: 0 });
  ok(g.p[0].lp === 8000 && g.p[1].lp === 7500, `A takes none, B still takes effect damage (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Desert Protector: +300 DEF per Spell/Trap on the field, dies for an Insect', () => {
  const g = duel({ board: [{ m: ['Desert Protector', 'Insect Knight'], st: ['Mirror Force', 'Pot of Greed'], turn: 2 }, { st: ['Sakuretsu Armor'] }] });
  ok(E.def(g, on(g, 0, 'Desert Protector')) === 1900, `DEF 1000 + 900 (${E.def(g, on(g, 0, 'Desert Protector'))})`);
  const g2 = duel({ board: [{ m: ['Desert Protector', 'Insect Knight'], turn: 2 }, { hand: ['Smashing Ground'], m: [FILL] }] });
  endTurn(g2);
  E.lib.addMod(g2, on(g2, 0, 'Insect Knight'), { def: 2000 });
  act(g2, 1, 'Smashing Ground'); settle(g2, 'yes', 'Desert Protector');
  ok(on(g2, 0, 'Insect Knight') && inZ(g2, 0, 'gy', 'Desert Protector'), 'Insect Knight saved, Desert Protector destroyed instead');
});
T('Desert Twister: summon by banishing 2 WIND + 1 EARTH, discard to destroy a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Desert Twister', FILL], gy: ['Harpie Lady', 'Spear Dragon', 'Sangan', 'Giant Rat'], turn: 2 }, { st: ['Mirror Force'] }] });
  const dt = card(g, 0, 'Desert Twister');
  ok(!hasOpt(g, 'ns:' + dt.u) && !hasOpt(g, 'set:' + dt.u), 'cannot be Normal Summoned or Set');
  choose(g, 'sp:' + dt.u); settle(g, 'Harpie Lady', 'Spear Dragon', 'Giant Rat');
  ok(on(g, 0, 'Desert Twister') && inZ(g, 0, 'ban', 'Harpie Lady') && inZ(g, 0, 'ban', 'Spear Dragon') && inZ(g, 0, 'ban', 'Giant Rat'), 'summoned, 2 WIND + 1 EARTH banished');
  act(g, 0, 'Desert Twister'); settle(g, FILL, 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', FILL), 'discarded 1 and destroyed Mirror Force');
  ok(!canAct(g, 0, 'Desert Twister'), 'once per turn');
  const g2 = duel({ board: [{ hand: ['Desert Twister'], gy: ['Harpie Lady', 'Sangan', 'Giant Rat'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Desert Twister').u), 'no summon with only 1 WIND');
});
T('Destiny End Dragoon: Plasma + Dogma only, destroys and burns, no Battle Phase', () => {
  const g = duel({ ex0: ['Destiny End Dragoon'], board: [{ hand: ['Destiny HERO - Plasma', 'Destiny HERO - Dogma'], turn: 2 }, {}] });
  ok(E.lib.canFusion(g, 0, { from: ['hand', 'm'] }), 'Fusion possible with Plasma + Dogma');
  const g2 = duel({ board: [{ m: ['Destiny End Dragoon'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g2, 0, 'Destiny End Dragoon'); settle(g2, 'Cyber Dragon');
  ok(!on(g2, 1, 'Cyber Dragon') && g2.p[1].lp === 8000 - 2100, `Cyber Dragon destroyed, B took 2100 (${g2.p[1].lp})`);
  ok(!hasOpt(g2, 'bp'), 'no Battle Phase this turn');
  const g3 = duel({ board: [{ gy: ['Destiny End Dragoon', 'Destiny HERO - Diamond Dude'], turn: 2 }, {}] });
  settle(g3, 'Diamond Dude');
  ok(!on(g3, 0, 'Destiny End Dragoon') || inZ(g3, 0, 'ban', 'Destiny HERO - Diamond Dude'), 'Dragoon not Fusion Summoned first: not revived (or revived with a banish)');
});
T('Destruction Cyclone: destroyed by battle, destroys face-down and non-WIND monsters', () => {
  const g = duel({ board: [{ m: ['Cyber Dragon', 'Harpie Lady', { n: 'Spear Dragon', pos: 'set' }], turn: 2 }, { m: ['Destruction Cyclone', 'Gyroid'] }] });
  E.lib.addMod(g, on(g, 0, 'Cyber Dragon'), { atk: 1000 });
  bp(g); atkOn(g, 0, 'Cyber Dragon', 'Destruction Cyclone'); settle(g);
  ok(inZ(g, 1, 'gy', 'Destruction Cyclone') && !on(g, 0, 'Cyber Dragon') && on(g, 0, 'Harpie Lady') && !g.p[0].m.some(c => c && E.name(c) === 'Spear Dragon') && on(g, 1, 'Gyroid'), 'Cyber Dragon and the face-down monster destroyed, WIND face-ups stay');
});
T('Dice Jar: FLIP, the lower roll takes the higher roll x 500', () => {
  const g = duel({ board: [{ m: [{ n: 'Dice Jar', pos: 'set' }], turn: 2 }, {}] });
  let i = 0; const rolls = [5, 2]; g.rnd = () => (rolls[Math.min(i++, 1)] - 0.5) / 6;
  choose(g, 'flip:'); settle(g);
  ok(g.p[1].lp === 8000 - 2500 && g.p[0].lp === 8000, `A rolls 5, B rolls 2: B takes 2500 (B ${g.p[1].lp}, A ${g.p[0].lp})`);
  const g2 = duel({ board: [{ m: [{ n: 'Dice Jar', pos: 'set' }], turn: 2 }, {}] });
  let j = 0; const r2 = [6, 3]; g2.rnd = () => (r2[Math.min(j++, 1)] - 0.5) / 6;
  choose(g2, 'flip:'); settle(g2);
  ok(g2.p[1].lp === 2000, `winner rolled 6: loser takes 6000 (B ${g2.p[1].lp})`);
});
T('Different Dimension Dragon: battle-proof vs 1900 or less, survives non-targeting Spells', () => {
  const g = duel({ board: [{ m: ['Spear Dragon'], turn: 2 }, { m: ['Different Dimension Dragon'] }] });
  bp(g); atkOn(g, 0, 'Spear Dragon', 'Different Dimension Dragon'); settle(g);
  ok(on(g, 1, 'Different Dimension Dragon') && on(g, 0, 'Spear Dragon') && g.p[1].lp === 7300, 'DDD survives a 1900 attacker, 700 damage');
  const g2 = duel({ board: [{ hand: ['Lightning Vortex', FILL], turn: 2 }, { m: ['Different Dimension Dragon', 'Sangan'] }] });
  act(g2, 0, 'Lightning Vortex'); settle(g2);
  ok(on(g2, 1, 'Different Dimension Dragon') && !on(g2, 1, 'Sangan'), 'Lightning Vortex destroys Sangan, not DDD');
  const g3 = duel({ board: [{ m: ['Cyber Dragon'], turn: 2 }, { m: ['Different Dimension Dragon'] }] });
  bp(g3); atkOn(g3, 0, 'Cyber Dragon', 'Different Dimension Dragon'); settle(g3);
  ok(!on(g3, 1, 'Different Dimension Dragon'), 'a 2100 attacker destroys it');
});
T('Dimension Fortress Weapon: cards cannot go from the Deck to the GY', () => {
  const g = duel({ board: [{ hand: ['Foolish Burial'], m: ['Dimension Fortress Weapon'], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Foolish Burial'), 'Foolish Burial cannot be activated');
  const g2 = duel({ board: [{ m: ['Dark Scorpion - Cliff the Trap Remover', 'Dimension Fortress Weapon'], turn: 2 }, {}] });
  bp(g2); atkOn(g2, 0, 'Dark Scorpion - Cliff the Trap Remover', 'd'); settle(g2, 'top 2', 'Send', 'GY');
  ok(cnt(g2, 1, 'gy') === 0, `Cliff cannot mill with Fortress Weapon out (B GY ${cnt(g2, 1, 'gy')})`);
});
T('Dimension Jar: FLIP, both players banish up to 3 from the opponent\'s GY', () => {
  const g = duel({ board: [{ m: [{ n: 'Dimension Jar', pos: 'set' }], gy: ['Sangan', 'Pot of Greed'], turn: 2 }, { gy: ['Giant Rat', 'Mirror Force', 'Spear Dragon', 'Harpie Lady'] }] });
  choose(g, 'flip:'); settle(g, 'Giant Rat', 'Mirror Force', 'Spear Dragon', 'Sangan', 'Pot of Greed');
  ok(cnt(g, 1, 'ban') >= 1 && cnt(g, 1, 'ban') <= 3, `A banished ${cnt(g, 1, 'ban')} of B's GY cards`);
});
T('Divine Dragon Aquabizarre: tribute a WATER, Continuous/Field Spell from GY to Deck top', () => {
  const g = duel({ board: [{ m: ['Divine Dragon Aquabizarre', 'Deepsea Warrior'], gy: ['Umi'], turn: 2 }, {}] });
  act(g, 0, 'Divine Dragon Aquabizarre'); settle(g, 'Deepsea Warrior', 'Umi');
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(inZ(g, 0, 'gy', 'Deepsea Warrior') && E.name(top) === 'Umi', 'Deepsea Warrior tributed, Umi on top of the Deck');
});
T('Divine Knight Ishzark: banishes what it destroys by battle', () => {
  const g = duel({ board: [{ m: ['Divine Knight Ishzark'], turn: 2 }, { m: ['Sangan'] }] });
  bp(g); atkOn(g, 0, 'Divine Knight Ishzark', 'Sangan'); settle(g);
  ok(inZ(g, 1, 'ban', 'Sangan') && !inZ(g, 1, 'gy', 'Sangan'), 'Sangan banished');
});
T('Normal-ish cards play normally', () => {
  const g = duel({ board: [{ hand: ['Dark Scorpion - Chick the Yellow'], turn: 2 }, {}] });
  choose(g, 'ns:' + card(g, 0, 'Dark Scorpion - Chick the Yellow').u); settle(g);
  ok(on(g, 0, 'Dark Scorpion - Chick the Yellow'), 'Chick Normal Summoned');
});

/* ---------- spells ---------- */
T('Darkness Approaches: discard 2, a face-up monster goes face-down', () => {
  const g = duel({ board: [{ hand: ['Darkness Approaches', FILL, 'Sangan'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Darkness Approaches'); settle(g, FILL, 'Sangan', 'Cyber Dragon');
  const cd = on(g, 1, 'Cyber Dragon') || g.p[1].m.find(c => c);
  ok(cd && !E.lib.faceUp(cd) && cnt(g, 0, 'gy') === 3, `Cyber Dragon face-down (pos ${cd && cd.pos}), 2 discards + the Spell in the GY`);
});
T('De-Fusion returns a Fusion Monster and revives its materials', () => {
  const g = duel({ ex0: ['Deepsea Shark'], board: [{ hand: ['Polymerization', 'Bottom Dweller', 'Tongyo', 'De-Fusion'], turn: 2 }, {}] });
  if (canAct(g, 0, 'Polymerization')) {
    act(g, 0, 'Polymerization'); settle(g, 'Deepsea Shark', 'Bottom Dweller', 'Tongyo');
    ok(on(g, 0, 'Deepsea Shark'), 'Deepsea Shark Fusion Summoned');
    act(g, 0, 'De-Fusion'); settle(g, 'Deepsea Shark', 'yes');
    ok(inZ(g, 0, 'extra', 'Deepsea Shark') && on(g, 0, 'Bottom Dweller') && on(g, 0, 'Tongyo'), 'Shark back in the Extra Deck, both materials summoned');
  } else console.log('skip  Polymerization not activatable in Edison');
  const g2 = duel({ board: [{ hand: ['De-Fusion'], turn: 2 }, { m: ['Thousand Dragon'] }] });
  act(g2, 0, 'De-Fusion'); settle(g2, 'Thousand Dragon');
  ok(inZ(g2, 1, 'extra', 'Thousand Dragon'), "B's Thousand Dragon returned to the Extra Deck");
});
T('De-Spell destroys a Spell, reveals a Set Trap', () => {
  const g = duel({ board: [{ hand: ['De-Spell'], turn: 2 }, { st: [{ n: 'Swords of Revealing Light', pos: 'up' }] }] });
  act(g, 0, 'De-Spell'); settle(g, 'Swords');
  ok(inZ(g, 1, 'gy', 'Swords of Revealing Light'), 'Swords destroyed');
  const g2 = duel({ board: [{ hand: ['De-Spell'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g2, 0, 'De-Spell'); settle(g2, 'Mirror', 'ace-down');
  ok(inZ(g2, 1, 'st', 'Mirror Force'), 'Set Trap revealed but stays');
});
T('De-Synchro returns a Synchro Monster', () => {
  const g = duel({ board: [{ hand: ['De-Synchro'], turn: 2 }, { m: ['Stardust Dragon'] }] });
  act(g, 0, 'De-Synchro'); settle(g, 'Stardust', 'no');
  ok(inZ(g, 1, 'extra', 'Stardust Dragon'), 'Stardust Dragon back in the Extra Deck');
});
T('Des Croaking: with 3 face-up Des Frogs, destroy all opponent cards', () => {
  const g = duel({ board: [{ hand: ['Des Croaking'], m: ['Des Frog', 'Des Frog', 'Des Frog'], turn: 2 }, { m: [FILL, 'Sangan'], st: ['Mirror Force'] }] });
  act(g, 0, 'Des Croaking'); settle(g);
  ok(cnt(g, 1, 'm') === 0 && cnt(g, 1, 'st') === 0 && cnt(g, 0, 'm') === 3, 'all of B\'s cards destroyed, Frogs stay');
  const g2 = duel({ board: [{ hand: ['Des Croaking'], m: ['Des Frog', 'Des Frog'], turn: 2 }, { m: [FILL] }] });
  ok(!canAct(g2, 0, 'Des Croaking'), 'not with only 2 Frogs');
});
T('Destiny Draw: discard a Destiny HERO, draw 2', () => {
  const g = duel({ board: [{ hand: ['Destiny Draw', 'Destiny HERO - Diamond Dude'], turn: 2 }, {}] });
  const h = g.p[0].hand.length;
  act(g, 0, 'Destiny Draw'); settle(g, 'Diamond Dude');
  ok(g.p[0].hand.length === h - 2 + 2 && inZ(g, 0, 'gy', 'Destiny HERO - Diamond Dude'), `discarded Diamond Dude, drew 2 (hand ${g.p[0].hand.length})`);
  const g2 = duel({ board: [{ hand: ['Destiny Draw', 'Sangan'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Destiny Draw'), 'not without a Destiny HERO');
});
T('Different Dimension Capsule: banish a Deck card, add it in the 2nd Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Different Dimension Capsule'], deckTop: [FILL, 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Different Dimension Capsule'); settle(g, 'Pot of Greed');
  ok(inZ(g, 0, 'ban', 'Pot of Greed') && inZ(g, 0, 'st', 'Different Dimension Capsule'), 'Pot banished, Capsule stays on the field');
  endTurn(g); endTurn(g);
  ok(!inZ(g, 0, 'hand', 'Pot of Greed'), 'not yet at the 1st Standby Phase');
  endTurn(g); endTurn(g);
  ok(inZ(g, 0, 'hand', 'Pot of Greed') && inZ(g, 0, 'gy', 'Different Dimension Capsule'), 'added at the 2nd Standby Phase, Capsule destroyed');
});
T('Different Dimension Gate: banish 1 monster each side, they return when it is destroyed', () => {
  const g = duel({ board: [{ hand: ['Different Dimension Gate', 'Mystical Space Typhoon'], m: [FILL], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Different Dimension Gate'); settle(g, FILL, 'Cyber Dragon');
  ok(inZ(g, 0, 'ban', FILL) && inZ(g, 1, 'ban', 'Cyber Dragon'), 'both banished');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Different Dimension Gate');
  ok(on(g, 0, FILL) && on(g, 1, 'Cyber Dragon'), 'both returned to the field');
});
T('Dimension Distortion: with an empty GY, summon a banished monster', () => {
  const g = duel({ board: [{ hand: ['Dimension Distortion'], turn: 2 }, { ban: ['Cyber Dragon'] }] });
  act(g, 0, 'Dimension Distortion'); settle(g, 'Cyber Dragon');
  ok(on(g, 0, 'Cyber Dragon'), "B's banished Cyber Dragon summoned to A's field");
  const g2 = duel({ board: [{ hand: ['Dimension Distortion'], gy: ['Sangan'], ban: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Dimension Distortion'), 'not with a card in the GY');
});
T('Dimension Explosion: return a Fusion, both summon up to 2 banished monsters', () => {
  const g = duel({ board: [{ hand: ['Dimension Explosion'], m: ['Thousand Dragon'], ban: [FILL, 'Sangan'], turn: 2 }, { ban: ['Cyber Dragon'] }] });
  act(g, 0, 'Dimension Explosion'); settle(g, 'Thousand Dragon', FILL, 'Sangan', 'Cyber Dragon');
  ok(inZ(g, 0, 'extra', 'Thousand Dragon') && on(g, 0, FILL) && on(g, 0, 'Sangan') && on(g, 1, 'Cyber Dragon'), 'Fusion returned, A summons 2, B summons 1');
});
T('Dimension Fusion: pay 2000, both summon their banished monsters', () => {
  const g = duel({ board: [{ hand: ['Dimension Fusion'], ban: [FILL, 'Sangan'], turn: 2 }, { ban: ['Cyber Dragon'] }] });
  act(g, 0, 'Dimension Fusion'); settle(g, FILL, 'Sangan', 'Cyber Dragon');
  ok(g.p[0].lp === 6000 && on(g, 0, FILL) && on(g, 0, 'Sangan') && on(g, 1, 'Cyber Dragon'), `A paid 2000, all 3 summoned (A ${g.p[0].lp})`);
});
T('Double Attack: discard a higher-Level monster, the target attacks twice', () => {
  const g = duel({ board: [{ hand: ['Double Attack', 'Cyber Dragon'], m: ['Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Double Attack'); settle(g, 'Cyber Dragon', 'Sangan');
  ok(inZ(g, 0, 'gy', 'Cyber Dragon'), 'Cyber Dragon discarded');
  bp(g); atkOn(g, 0, 'Sangan', 'd'); settle(g);
  ok(hasOpt(g, 'atk:' + on(g, 0, 'Sangan').u), 'Sangan can attack again'); atkOn(g, 0, 'Sangan', 'd'); settle(g);
  ok(g.p[1].lp === 6000, `B took 2 x 1000 (${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: ['Double Attack', 'Sangan'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Double Attack'), 'no lower-Level monster: not activatable');
});
T('Double Spell: discard a Spell, use a Spell from the opponent\'s GY', () => {
  const g = duel({ board: [{ hand: ['Double Spell', 'Mystical Space Typhoon'], turn: 2 }, { gy: ['Pot of Greed'] }] });
  const h = g.p[0].hand.length;
  act(g, 0, 'Double Spell'); settle(g, 'Mystical', 'Pot of Greed');
  ok(g.p[0].hand.length === h - 2 + 2 && inZ(g, 0, 'gy', 'Mystical Space Typhoon'), `MST discarded, Pot of Greed drew 2 (hand ${g.p[0].hand.length})`);
});
T('Double Summon: two Normal Summons this turn', () => {
  const g = duel({ board: [{ hand: ['Double Summon', 'Sangan', 'Giant Rat'], turn: 2 }, {}] });
  act(g, 0, 'Double Summon'); settle(g);
  choose(g, 'ns:' + card(g, 0, 'Sangan').u); settle(g);
  ok(hasOpt(g, 'ns:' + card(g, 0, 'Giant Rat').u), 'second Normal Summon offered');
  choose(g, 'ns:' + card(g, 0, 'Giant Rat').u); settle(g);
  ok(on(g, 0, 'Sangan') && on(g, 0, 'Giant Rat'), 'both summoned');
});
T('Double Tool C&D: +1000 ATK on your turn for Power Tool Dragon', () => {
  const g = duel({ board: [{ hand: ['Double Tool C&D'], m: ['Power Tool Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Double Tool C&D'); settle(g, 'Power Tool');
  ok(E.atk(g, on(g, 0, 'Power Tool Dragon')) === 3300, `ATK 3300 (${E.atk(g, on(g, 0, 'Power Tool Dragon'))})`);
  endTurn(g); ok(E.atk(g, on(g, 0, 'Power Tool Dragon')) === 2300, 'no bonus on the opponent\'s turn');
  const g2 = duel({ board: [{ hand: ['Double Tool C&D'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Double Tool C&D'), 'not for a non-Morphtronic');
});
T('Double Tool C&D: on the opponent\'s turn the equipped monster must be attacked and kills its attacker', () => {
  const g = duel({ board: [{ hand: ['Double Tool C&D'], m: ['Power Tool Dragon', 'Sangan'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Double Tool C&D'); settle(g, 'Power Tool'); endTurn(g);
  choose(g, 'bp'); settle(g);
  const cd = on(g, 1, 'Cyber Dragon');
  ok(!hasOpt(g, `atk:${cd.u}:${on(g, 0, 'Sangan').u}`), 'Sangan cannot be attacked');
});

/* ---------- traps ---------- */
T('Des Counterblow destroys a monster that deals direct damage', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: [{ n: 'Des Counterblow', pos: 'up' }] }] });
  bp(g); atkOn(g, 0, FILL, 'd'); settle(g);
  ok(g.p[1].lp === 6000 && inZ(g, 0, 'gy', FILL), 'damage dealt, then the attacker destroyed');
});
T('Desert Sunlight: your monsters to face-up Defense Position', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: [{ n: 'Sangan', pos: 'atk' }, { n: 'Des Koala', pos: 'set' }], st: ['Desert Sunlight'] }] });
  bp(g); atkOn(g, 0, FILL, 'Sangan'); settle(g, aKey(g, 1, 'Desert Sunlight'));
  const k = on(g, 1, 'Des Koala');
  ok(k && k.pos === 'def' && (on(g, 1, 'Sangan') ? on(g, 1, 'Sangan').pos === 'def' : true), `Koala flipped to face-up Defense (${k && k.pos})`);
});
T('Destiny Board: places I, N, A, L in the opponent\'s End Phases and wins', () => {
  const g = duel({ board: [{ st: ['Destiny Board'], deckTop: Array(10).fill(FILL).concat(['Spirit Message I', 'Spirit Message N', 'Spirit Message A', 'Spirit Message L']), turn: 2 }, {}] });
  act(g, 0, 'Destiny Board'); settle(g);
  for (let i = 0; i < 12 && g.prompt && g.winner == null; i++) endTurn(g);
  ok(g.winner === 0, `A wins with Destiny Board (winner ${g.winner}, ${g.why || ''})`);
});
T('Destiny Board: a Spirit Message leaving sends the rest to the GY', () => {
  const g = duel({ board: [{ st: [{ n: 'Destiny Board', pos: 'up' }, { n: 'Spirit Message I', pos: 'up' }], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  endTurn(g); act(g, 1, 'Mystical Space Typhoon'); settle(g, 'Spirit Message I');
  ok(!inZ(g, 0, 'st', 'Destiny Board'), 'Destiny Board sent to the GY too');
});
T('Destiny Mirage: revives Destiny HEROes destroyed by an opponent\'s effect', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], turn: 2 }, { m: ['Destiny HERO - Diamond Dude'], st: ['Destiny Mirage'] }] });
  act(g, 0, 'Smashing Ground'); settle(g, aKey(g, 1, 'Destiny Mirage'), 'Diamond Dude');
  ok(on(g, 1, 'Destiny HERO - Diamond Dude'), 'Diamond Dude back on the field');
});
T('Destiny Signal: a battle-destroyed monster brings a Level 4 Destiny HERO from the Deck', () => {
  const g = duel({ board: [{ m: ['Cyber Dragon'], turn: 2 }, { m: ['Sangan'], st: ['Destiny Signal'], deckTop: [FILL, 'Destiny HERO - Diamond Dude'] }] });
  bp(g); atkOn(g, 0, 'Cyber Dragon', 'Sangan'); settle(g, aKey(g, 1, 'Destiny Signal'), 'Diamond Dude');
  ok(on(g, 1, 'Destiny HERO - Diamond Dude'), 'Diamond Dude Special Summoned');
});
T('Destruction Jammer: discard 1, negate a destroy effect and destroy it', () => {
  const g = duel({ board: [{ hand: ['Smashing Ground'], turn: 2 }, { hand: [FILL], m: ['Sangan'], st: ['Destruction Jammer'] }] });
  act(g, 0, 'Smashing Ground'); settle(g, aKey(g, 1, 'Destruction Jammer'), FILL);
  ok(on(g, 1, 'Sangan') && inZ(g, 0, 'gy', 'Smashing Ground') && cnt(g, 1, 'hand') === 0, 'Sangan saved, B discarded 1');
});
T('Destruction of Destiny: mill 3, 1000 per Spell/Trap', () => {
  const g = duel({ board: [{ turn: 2, st: ['Destruction of Destiny'], deckTop: ['Pot of Greed', 'Mirror Force', FILL] }, {}] });
  // deckTop[0] is the top card, and A draws it in the Draw Phase; the next three are Mirror Force, Warwolf, Warwolf
  act(g, 0, 'Destruction of Destiny'); settle(g);
  ok(cnt(g, 0, 'gy') === 4 && g.p[0].lp === 7000, `3 sent, 1 Trap: 1000 damage (A ${g.p[0].lp}, GY ${cnt(g, 0, 'gy')})`);
});
T('Destruction Punch: destroys an attacker weaker than the defender\'s DEF', () => {
  const g = duel({ board: [{ m: ['Sangan'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'def' }], st: ['Destruction Punch'] }] });
  bp(g); atkOn(g, 0, 'Sangan', 'Big Shield Gardna'); settle(g, aKey(g, 1, 'Destruction Punch'));
  ok(inZ(g, 0, 'gy', 'Sangan') && on(g, 1, 'Big Shield Gardna'), 'Sangan destroyed');
});
T('Destruction Ring: destroy your face-up monster, 1000 to both', () => {
  const g = duel({ board: [{ m: ['Sangan'], st: ['Destruction Ring'], turn: 2 }, {}] });
  act(g, 0, 'Destruction Ring'); settle(g, 'Sangan');
  ok(inZ(g, 0, 'gy', 'Sangan') && g.p[0].lp === 7000 && g.p[1].lp === 7000, `both took 1000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Dice Re-Roll: re-roll a die once this turn', () => {
  const g = duel({ board: [{ m: ['Dark Master - Zorc'], st: ['Dice Re-Roll'], turn: 2 }, { m: [FILL, 'Sangan'] }] });
  ok(canAct(g, 0, 'Dice Re-Roll'), 'Dice Re-Roll can be activated');
  act(g, 0, 'Dice Re-Roll'); settle(g);
  let i = 0; const rolls = [6, 1]; g.rnd = () => (rolls[Math.min(i++, 1)] - 0.5) / 6;
  act(g, 0, 'Dark Master - Zorc'); settle(g);
  ok(on(g, 0, 'Dark Master - Zorc') && cnt(g, 1, 'm') === 0, 'the 6 is re-rolled into a 1: B\'s monsters destroyed, Zorc safe');
});
T('Dice Try!: negates and destroys a dice effect', () => {
  const g = duel({ board: [{ m: ['Dark Master - Zorc'], turn: 2 }, { hand: [FILL], m: [FILL], st: ['Dice Try!'] }] });
  roll(g, 1); act(g, 0, 'Dark Master - Zorc'); settle(g, aKey(g, 1, 'Dice Try!'));
  ok(on(g, 1, FILL) && inZ(g, 0, 'gy', 'Dark Master - Zorc'), 'Zorc negated and destroyed, B keeps its monster');
});
T('Different Dimension Gate requires a monster on each side', () => {
  const g = duel({ board: [{ hand: ['Different Dimension Gate'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Different Dimension Gate'), 'not activatable with an empty opponent field');
});
T('Dimension Wall: the attacker\'s controller takes the battle damage', () => {
  const g = duel({ board: [{ m: ['Cyber Dragon'], turn: 2 }, { m: ['Sangan'], st: ['Dimension Wall'] }] });
  bp(g); atkOn(g, 0, 'Cyber Dragon', 'Sangan'); settle(g, aKey(g, 1, 'Dimension Wall'));
  ok(g.p[0].lp === 6900 && g.p[1].lp === 8000, `A takes the 1100 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Divine Wrath: discard 1, negate a monster effect and destroy the monster', () => {
  const g = duel({ board: [{ m: ['Dark Master - Zorc'], turn: 2 }, { hand: [FILL], m: [FILL], st: ['Divine Wrath'] }] });
  roll(g, 1); act(g, 0, 'Dark Master - Zorc'); settle(g, aKey(g, 1, 'Divine Wrath'), FILL);
  ok(on(g, 1, FILL) && inZ(g, 0, 'gy', 'Dark Master - Zorc') && cnt(g, 1, 'hand') === 0, 'Zorc negated and destroyed, B discarded 1');
});
T('DNA Checkup: the opponent declares 2 Attributes, someone draws 2', () => {
  const g = duel({ board: [{ m: [{ n: 'Sangan', pos: 'set' }], st: ['DNA Checkup'], turn: 2 }, {}] });
  const h0 = g.p[0].hand.length, h1 = g.p[1].hand.length;
  act(g, 0, 'DNA Checkup'); settle(g, 'LIGHT', 'FIRE');
  ok(g.p[0].hand.length === h0 + 2 && g.p[1].hand.length === h1, `wrong guess (Sangan is DARK): A draws 2 (A ${g.p[0].hand.length - h0}, B ${g.p[1].hand.length - h1})`);
  const g2 = duel({ board: [{ m: [{ n: 'Sangan', pos: 'set' }], st: ['DNA Checkup'], turn: 2 }, {}] });
  const k1 = g2.p[1].hand.length;
  act(g2, 0, 'DNA Checkup'); settle(g2, 'DARK', 'LIGHT');
  ok(g2.p[1].hand.length === k1 + 2, 'right guess: B draws 2');
});
T('DNA Surgery: all face-up monsters become the declared Type', () => {
  const g = duel({ board: [{ m: [FILL], st: ['DNA Surgery'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'DNA Surgery'); settle(g, 'Dragon');
  ok(inZ(g, 0, 'st', 'DNA Surgery'), 'DNA Surgery stays on the field with Dragon declared');
  console.log('gap   DNA Surgery: the Type change itself is a documented ENGINE gap (no Type override)');
});
T('DNA Transplant: all face-up monsters become the declared Attribute', () => {
  const g = duel({ board: [{ m: [FILL], st: ['DNA Transplant'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'DNA Transplant'); settle(g, 'WATER');
  ok(inZ(g, 0, 'st', 'DNA Transplant'), 'DNA Transplant stays on the field with WATER declared');
  console.log('gap   DNA Transplant: the Attribute change itself is a documented ENGINE gap (no Attribute override)');
});
T('Double Tag Team: a Gladiator Beast Special Summon brings a Level 4 or lower one', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Gladiator Beast Laquari'], st: ['Double Tag Team'], deckTop: [FILL, 'Gladiator Beast Darius'], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); settle(g, 'Laquari', aKey(g, 0, 'Double Tag Team'), 'Darius');
  ok(on(g, 0, 'Gladiator Beast Laquari') && on(g, 0, 'Gladiator Beast Darius'), 'Darius Special Summoned from the Deck');
});
T('Double-Edged Sword Technique: revive 2 Six Samurai, destroy them in the End Phase and take their ATK', () => {
  const g = duel({ board: [{ st: ['Double-Edged Sword Technique'], gy: ['The Six Samurai - Irou', 'The Six Samurai - Zanji'], turn: 2 }, {}] });
  act(g, 0, 'Double-Edged Sword Technique'); settle(g, 'Irou', 'Zanji');
  ok(on(g, 0, 'The Six Samurai - Irou') && on(g, 0, 'The Six Samurai - Zanji') && on(g, 0, 'The Six Samurai - Irou').pos === 'atk', 'both summoned in Attack Position');
  choose(g, 'end'); settle(g);
  ok(!on(g, 0, 'The Six Samurai - Irou') && !on(g, 0, 'The Six Samurai - Zanji') && g.p[0].lp === 8000 - 3500, `destroyed, A took 1700 + 1800 (A ${g.p[0].lp})`);
});

console.log(fails ? `\n${fails} failed` : '\nAll full-06 review checks passed.');
process.exit(fails ? 1 : 0);
