// Independent review checks for full pool batch 05 (written from the card text): node build/review_full-05.js
let { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
let lastG; function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
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
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ')); } };
// answer prompts until an idle prompt (or one of the stop types): passes responses, yes to yes/no, picks by label
function settle(g, ...picks) { for (let i = 0; i < 60 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const k = picks.find(t => pr.opts.some(x => x.key !== 'pass' && (x.label + ' ' + x.key).includes(t))); if (k) choose(g, k); else E.act(g, ['pass']); }
  else if (pr.type === 'yesno') choose(g, 'yes');
  else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => x.label.includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); }
    for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); E.act(g, ks); } } }
const attack = (g, aName, tLabel) => { choose(g, 'atk:' + on(g, 0, aName).u + ':' + (tLabel === 'd' ? 'd' : '')); };
const bp = g => { choose(g, 'bp'); settle(g); };
const atkOn = (g, aName, tName) => { const a = on(g, 0, aName), t = on(g, 1, tName); choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); };
const endTurn = g => { choose(g, 'end'); settle(g); };
const lp = (g, p) => g.p[p].lp;

T('Dark Balter: Fusion only with its listed materials, negates a Normal Spell for 1000, negates battle-killed effects', () => {
  const g = duel({ ex0: ['Dark Balter the Terrible'], board: [{ hand: ['Polymerization', 'Possessed Dark Soul', 'Frontier Wiseman'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Dark Balter', 'Possessed Dark Soul', 'Frontier Wiseman');
  ok(on(g, 0, 'Dark Balter the Terrible'), 'Dark Balter Fusion Summoned');
  const g2 = duel({ ex0: ['Dark Balter the Terrible'], board: [{ hand: ['Polymerization', 'King of the Swamp', 'Frontier Wiseman'], turn: 2 }, {}] });
  ok(!E.lib.canFusion(g2, 0, { from: ['hand', 'm'] }), 'King of the Swamp cannot substitute');
  const g3 = duel({ board: [{ m: ['Dark Balter the Terrible'], turn: 2 }, { hand: ['Pot of Greed'] }] });
  endTurn(g3);
  const h = g3.p[1].hand.length;
  act(g3, 1, 'Pot of Greed'); settle(g3, 'Dark Balter');
  ok(lp(g3, 0) === 7000 && g3.p[1].hand.length === h - 1, `A paid 1000, Pot of Greed drew nothing (A ${lp(g3, 0)}, B hand ${g3.p[1].hand.length} from ${h})`);
  const g4 = duel({ board: [{ m: ['Dark Balter the Terrible'], turn: 2 }, { m: ['Sangan'], deckTop: ['Mystic Tomato'] }] });
  bp(g4); atkOn(g4, 'Dark Balter the Terrible', 'Sangan'); settle(g4, 'Mystic Tomato');
  ok(inZ(g4, 1, 'gy', 'Sangan') && !inZ(g4, 1, 'hand', 'Mystic Tomato'), 'Sangan destroyed, its search negated');
});
T('Dark Blade the Dragon Knight banishes up to 3 monsters from the opponent GY on battle damage', () => {
  const g = duel({ ex0: ['Dark Blade the Dragon Knight'], board: [{ hand: ['Polymerization', 'Dark Blade', 'Pitch-Dark Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Dark Blade the Dragon Knight', 'Dark Blade', 'Pitch-Dark Dragon');
  ok(on(g, 0, 'Dark Blade the Dragon Knight'), 'Fusion Summoned from Dark Blade + Pitch-Dark Dragon');
  const g2 = duel({ board: [{ m: ['Dark Blade the Dragon Knight'], turn: 2 }, { gy: ['Sangan', 'Mystic Tomato', 'Cyber Dragon', 'Pot of Greed'] }] });
  bp(g2); attack(g2, 'Dark Blade the Dragon Knight', 'd'); settle(g2, 'Sangan', 'Mystic Tomato', 'Cyber Dragon');
  ok(lp(g2, 1) === 5800 && cnt(g2, 1, 'ban') === 3 && inZ(g2, 1, 'gy', 'Pot of Greed'), `2200 damage, 3 monsters banished, Spell stays (B ${lp(g2, 1)}, ban ${cnt(g2, 1, 'ban')})`);
});
T('Dark Bug revives a Level 3 Tuner with its effect negated', () => {
  const g = duel({ board: [{ hand: ['Dark Bug'], gy: ['Dark Resonator'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'ns:' + card(g, 0, 'Dark Bug').u); settle(g, 'Dark Resonator');
  const r = on(g, 0, 'Dark Resonator');
  ok(on(g, 0, 'Dark Bug') && r, 'Dark Resonator Special Summoned');
  endTurn(g); choose(g, 'bp'); settle(g); choose(g, 'atk:' + on(g, 1, 'Cyber Dragon').u + ':' + r.u); settle(g);
  ok(r.zone === 'gy', 'its effect is negated: destroyed by its first battle');
});
T('Dark Cat with White Tail returns 2 opponent monsters and 1 own monster', () => {
  const g = duel({ board: [{ m: [{ n: 'Dark Cat with White Tail', pos: 'set' }, FILL], turn: 2 }, { m: ['Cyber Dragon', 'Mystic Tomato'] }] });
  choose(g, 'flip:'); settle(g, 'Cyber Dragon', 'Mystic Tomato', FILL);
  ok(cnt(g, 1, 'm') === 0 && inZ(g, 1, 'hand', 'Cyber Dragon') && inZ(g, 1, 'hand', 'Mystic Tomato'), 'both opponent monsters returned to the hand');
  ok(cnt(g, 0, 'm') === 1, `one of A's monsters returned (A has ${cnt(g, 0, 'm')} left)`);
});
T('Dark Catapulter gets a counter in Defense and banishes GY cards to destroy Spells/Traps', () => {
  const g = duel({ board: [{ m: [{ n: 'Dark Catapulter', pos: 'def' }], gy: ['Sangan'], turn: 2 }, { st: ['Mirror Force'] }] });
  settle(g);
  const c = on(g, 0, 'Dark Catapulter');
  ok(E.lib.ctr(c) >= 1 || Object.values(c.ctr || {}).some(v => v === 1), 'one counter in the Standby Phase');
  choose(g, 'a:' + c.u + ':'); settle(g, 'Sangan', 'Mirror Force');
  ok(inZ(g, 0, 'ban', 'Sangan') && inZ(g, 1, 'gy', 'Mirror Force'), 'Sangan banished, Mirror Force destroyed');
  ok(!Object.values(c.ctr || {}).some(v => v > 0), 'counters removed');
  const g2 = duel({ board: [{ m: ['Dark Catapulter'], turn: 2 }, {}] });
  const c2 = on(g2, 0, 'Dark Catapulter');
  ok(!Object.values(c2.ctr || {}).some(v => v > 0), 'no counter in Attack Position');
});
T('Dark City: an attacking Destiny HERO gains 1000 when the target is stronger', () => {
  const g = duel({ board: [{ m: ['Destiny HERO - Diamond Dude'], st: [{ n: 'Dark City', pos: 'up' }], turn: 2 }, { m: ['Shining Angel', 'Gene-Warped Warwolf'] }] });
  if (!g.p[0].fz) { const dc = g.p[0].st.find(x => x && E.name(x) === 'Dark City'); if (dc) { g.p[0].st[g.p[0].st.indexOf(dc)] = null; dc.zone = 'fz'; g.p[0].fz = dc; } }
  bp(g); atkOn(g, 'Destiny HERO - Diamond Dude', FILL); settle(g);
  ok(lp(g, 1) === 8000 - 400 && inZ(g, 1, 'gy', FILL), `2400 vs 2000: Warwolf destroyed, B took 400 (B ${lp(g, 1)})`);
  const dd = on(g, 0, 'Destiny HERO - Diamond Dude');
  ok(dd && E.atk(g, dd) === 1400, 'back to 1400 after damage calculation');
});
T('Dark Coffin: opponent discards at random or destroys a monster', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon', 'Pot of Greed'], m: ['Sangan'], turn: 2 }, { st: ['Dark Coffin'] }] });
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Dark Coffin', 'Destroy');
  ok(inZ(g, 1, 'gy', 'Dark Coffin'), 'Dark Coffin destroyed');
  ok(inZ(g, 0, 'gy', 'Sangan') || inZ(g, 0, 'gy', 'Pot of Greed'), 'A lost a monster or a random hand card');
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon', 'Pot of Greed'], turn: 2 }, { st: ['Dark Coffin'] }] });
  act(g2, 0, 'Mystical Space Typhoon'); settle(g2, 'Dark Coffin');
  ok(cnt(g2, 0, 'gy') === 2 && g2.p[0].hand.length === 1, 'with no monster, A must discard');
});
T('Dark Core discards 1 and banishes a face-up monster', () => {
  const g = duel({ board: [{ hand: ['Dark Core', 'Pot of Greed'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Dark Core'); settle(g, 'Pot of Greed', 'Cyber Dragon');
  ok(inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 1, 'ban', 'Cyber Dragon'), 'Pot of Greed discarded, Cyber Dragon banished');
});
T('Dark Crusader sends a DARK monster from the hand for 400 ATK', () => {
  const g = duel({ board: [{ hand: ['Sangan', 'Mystic Tomato'], m: ['Dark Crusader'], turn: 2 }, {}] });
  const c = on(g, 0, 'Dark Crusader');
  choose(g, 'a:' + c.u + ':'); settle(g, 'Sangan'); choose(g, 'a:' + c.u + ':'); settle(g, 'Mystic Tomato');
  ok(E.atk(g, c) === 2400 && cnt(g, 0, 'hand', 'Sangan') === 0, `ATK ${E.atk(g, c)} after two uses`);
});
T('Dark Cure: the opponent gains half the summoned monster ATK', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { st: [{ n: 'Dark Cure', pos: 'up' }] }] });
  choose(g, 'ns:'); settle(g);
  ok(lp(g, 0) === 9000, `A gained 1000 (A ${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [FILL], st: [{ n: 'Dark Cure', pos: 'up' }], turn: 2 }, {}] });
  choose(g2, 'ns:'); settle(g2);
  ok(lp(g2, 0) === 8000 && lp(g2, 1) === 8000, 'no gain for its own controller summons');
});
T('Dark Deal: pay 1000, the Normal Spell becomes a random discard', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', FILL], turn: 2 }, { st: ['Dark Deal'] }] });
  const h = g.p[0].deck.length, hb = g.p[1].hand.length;
  act(g, 0, 'Pot of Greed'); settle(g, 'Dark Deal');
  ok(lp(g, 1) === 7000 && g.p[0].deck.length === h && g.p[1].hand.length === hb - 1, `B paid 1000, A drew nothing, B discarded 1 (B hand ${g.p[1].hand.length} from ${hb})`);
});
T('Dark Designator adds the declared monster from the opponent Deck to their hand', () => {
  const g = duel({ board: [{ hand: ['Dark Designator'], turn: 2 }, { hand: [], deckTop: ['Cyber Dragon'] }] });
  act(g, 0, 'Dark Designator'); settle(g, 'Cyber Dragon');
  ok(inZ(g, 1, 'hand', 'Cyber Dragon'), 'Cyber Dragon added to B\'s hand');
});
T('Dark Driceratops inflicts piercing damage', () => {
  const g = duel({ board: [{ m: ['Dark Driceratops'], turn: 2 }, { m: [{ n: 'Mystic Tomato', pos: 'def' }] }] });
  bp(g); atkOn(g, 'Dark Driceratops', 'Mystic Tomato'); settle(g);
  ok(lp(g, 1) === 8000 - 1300, `B took 1300 (${lp(g, 1)})`);
});
T('Dark Effigy counts as 2 Tributes for a DARK Normal Monster', () => {
  const g = duel({ board: [{ hand: ['Dark Magician'], m: ['Dark Effigy'], turn: 2 }, {}] });
  ok(hasOpt(g, 'ns:' + card(g, 0, 'Dark Magician').u), 'Dark Magician can be Tribute Summoned with Effigy alone');
  choose(g, 'ns:' + card(g, 0, 'Dark Magician').u); settle(g, 'Dark Effigy');
  ok(on(g, 0, 'Dark Magician') && inZ(g, 0, 'gy', 'Dark Effigy'), 'Dark Magician summoned');
  const g2 = duel({ board: [{ hand: ['Dark Armed Dragon'], m: ['Dark Effigy'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Dark Armed Dragon').u), 'not for an Effect Monster');
});
T('Dark Elf pays 1000 LP to attack', () => {
  const g = duel({ board: [{ m: ['Dark Elf'], turn: 2 }, {}] });
  bp(g); attack(g, 'Dark Elf', 'd'); settle(g);
  ok(lp(g, 0) === 7000 && lp(g, 1) === 6000, `A paid 1000, B took 2000 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Dark Energy gives a Fiend 300 ATK and DEF', () => {
  const g = duel({ board: [{ hand: ['Dark Energy'], m: ['Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Dark Energy'); settle(g, 'Sangan');
  const s = on(g, 0, 'Sangan');
  ok(E.atk(g, s) === 1300 && E.def(g, s) === 900, `Sangan ${E.atk(g, s)}/${E.def(g, s)}`);
  const g2 = duel({ board: [{ hand: ['Dark Energy'], m: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Dark Energy').u + ':'), 'no Fiend: cannot be activated');
});
T('Dark Eradicator Warlock: summoned by tributing Dark Magician, 1000 per Normal Spell', () => {
  const g = duel({ board: [{ hand: ['Dark Eradicator Warlock', 'Pot of Greed'], m: ['Dark Magician'], turn: 2 }, {}] });
  const w = card(g, 0, 'Dark Eradicator Warlock');
  ok(!hasOpt(g, 'ns:' + w.u) && !hasOpt(g, 'set:' + w.u), 'cannot be Normal Summoned');
  choose(g, 'sp:' + w.u); settle(g, 'Dark Magician');
  ok(on(g, 0, 'Dark Eradicator Warlock') && inZ(g, 0, 'gy', 'Dark Magician'), 'summoned by tributing Dark Magician');
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(lp(g, 1) === 7000, `B took 1000 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ m: ['Dark Eradicator Warlock'], turn: 1 }, { hand: ['Pot of Greed'] }] });
  endTurn(g2); act(g2, 1, 'Pot of Greed'); settle(g2);
  ok(lp(g2, 1) === 7000 && lp(g2, 0) === 8000, `the opponent Normal Spell also burns the opponent (B ${lp(g2, 1)})`);
});
T('Dark Eruption adds a DARK monster with 1500 or less ATK from the GY', () => {
  const g = duel({ board: [{ hand: ['Dark Eruption'], gy: ['Sangan', 'Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Dark Eruption'); settle(g, 'Sangan');
  ok(inZ(g, 0, 'hand', 'Sangan') && inZ(g, 0, 'gy', 'Dark Magician'), 'Sangan added');
  const g2 = duel({ board: [{ hand: ['Dark Eruption'], gy: ['Dark Magician'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Dark Eruption').u + ':'), 'not with only a 2500 ATK DARK');
});
T('Dark Factory of Mass Production adds 2 Normal Monsters from the GY', () => {
  const g = duel({ board: [{ hand: ['Dark Factory of Mass Production'], gy: [FILL, 'Dark Magician', 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Dark Factory of Mass Production'); settle(g, FILL, 'Dark Magician');
  ok(inZ(g, 0, 'hand', FILL) && inZ(g, 0, 'hand', 'Dark Magician') && inZ(g, 0, 'gy', 'Sangan'), 'both Normal Monsters added');
  const g2 = duel({ board: [{ hand: ['Dark Factory of Mass Production'], gy: [FILL, 'Sangan'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Dark Factory of Mass Production').u + ':'), 'needs 2 Normal Monsters');
});
T('Dark Flare Knight: no battle damage, Mirage Knight comes out when destroyed', () => {
  const g = duel({ ex0: ['Dark Flare Knight'], board: [{ hand: ['Polymerization', 'Dark Magician', 'Flame Swordsman'], turn: 2 }, {}] });
  ok(E.lib.canFusion(g, 0, { from: ['hand', 'm'] }), 'Dark Magician + Flame Swordsman are its materials');
  const g2 = duel({ board: [{ m: ['Dark Flare Knight'], deckTop: ['Mirage Knight'], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  bp(g2); atkOn(g2, 'Dark Flare Knight', 'Dark Armed Dragon'); settle(g2, 'Mirage Knight');
  ok(lp(g2, 0) === 8000, `A took no battle damage (${lp(g2, 0)})`);
  ok(inZ(g2, 0, 'gy', 'Dark Flare Knight') && on(g2, 0, 'Mirage Knight'), 'Mirage Knight Special Summoned from the Deck');
});
T('Dark Fusion Fusion Summons a Fiend Fusion Monster', () => {
  const g = duel({ ex0: ['Dark Balter the Terrible', 'Evil HERO Inferno Wing'], board: [{ hand: ['Dark Fusion', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'], turn: 2 }, {}] });
  act(g, 0, 'Dark Fusion'); settle(g, 'Evil HERO Inferno Wing', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix');
  ok(on(g, 0, 'Evil HERO Inferno Wing') && inZ(g, 0, 'gy', 'Elemental HERO Avian'), 'Inferno Wing Fusion Summoned');
  const g2 = duel({ ex0: ['Dark Flare Knight'], board: [{ hand: ['Dark Fusion', 'Dark Magician', 'Flame Swordsman'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Dark Fusion').u + ':'), 'not for a Warrior Fusion');
});
T('Dark General Freed: cannot be Special Summoned, searches a Level 4 DARK in place of the draw', () => {
  const g = duel({ board: [{ m: ['Dark General Freed'], turn: 1 }, {}] });
  const d0 = g.p[0].deck.length;
  endTurn(g);
  // B's turn now; end it to reach A's Draw Phase
  const g2 = duel({ board: [{ m: ['Dark General Freed'], deckTop: ['Sangan', 'Archfiend Soldier'], turn: 2 }, {}] });
  void d0;
  settle(g2, 'Archfiend Soldier');
  ok(inZ(g2, 0, 'hand', 'Archfiend Soldier') && g2.p[0].deck.some(c => E.name(c) === 'Sangan'), 'added Archfiend Soldier instead of drawing Sangan');
  const g3 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Dark General Freed'], turn: 2 }, {}] });
  ok(!hasOpt(g3, 'a:' + card(g3, 0, 'Monster Reborn').u + ':'), 'Monster Reborn cannot revive it');
  const g4 = duel({ board: [{ m: ['Dark General Freed'], turn: 1 }, { hand: ['Book of Moon'] }] });
  endTurn(g4); act(g4, 1, 'Book of Moon'); settle(g4, 'Dark General Freed');
  ok(on(g4, 0, 'Dark General Freed').pos === 'atk' && inZ(g4, 1, 'gy', 'Book of Moon'), 'Book of Moon on Freed is negated');
});
T('Dark Hole destroys all monsters', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [FILL], turn: 2 }, { m: ['Cyber Dragon', 'Sangan'] }] });
  act(g, 0, 'Dark Hole'); settle(g);
  ok(cnt(g, 0, 'm') === 0 && cnt(g, 1, 'm') === 0, 'no monsters left');
});
T('Dark Hunter: ATK by DARK count, 5 or more destroys face-down monsters', () => {
  const mk = gy => duel({ board: [{ m: ['Dark Hunter'], gy, turn: 2 }, { m: [{ n: 'Sangan', pos: 'set' }, 'Cyber Dragon'] }] });
  let g = mk(['Sangan']); ok(E.atk(g, on(g, 0, 'Dark Hunter')) === 1200, '1 DARK: 1200');
  g = mk(['Sangan', 'Dark Magician']); ok(E.atk(g, on(g, 0, 'Dark Hunter')) === 2000, '2 DARK: 2000');
  g = mk(['Sangan', 'Dark Magician', 'Mystic Tomato', 'Dark Elf', 'Archfiend Soldier']);
  ok(E.atk(g, on(g, 0, 'Dark Hunter')) === 1600, '5 DARK: 1600');
  choose(g, 'a:' + on(g, 0, 'Dark Hunter').u + ':'); settle(g);
  ok(inZ(g, 0, 'gy', 'Dark Hunter') && inZ(g, 1, 'gy', 'Sangan') && on(g, 1, 'Cyber Dragon'), 'face-down Sangan destroyed, Cyber Dragon stays');
});
T('Dark Illusion negates a card that targets a DARK monster', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['Dark Magician'], st: ['Dark Illusion'] }] });
  act(g, 0, 'Book of Moon'); settle(g, 'Dark Magician', 'Dark Illusion');
  const dm = on(g, 1, 'Dark Magician');
  ok(dm && dm.pos === 'atk' && inZ(g, 0, 'gy', 'Book of Moon') && inZ(g, 1, 'gy', 'Dark Illusion'), 'Book of Moon negated, Dark Magician stays face-up');
});
T('Dark Jeroid: target loses 800 ATK when summoned', () => {
  const g = duel({ board: [{ hand: ['Dark Jeroid'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'ns:'); settle(g, 'Cyber Dragon');
  ok(E.atk(g, on(g, 1, 'Cyber Dragon')) === 1300, `Cyber Dragon ATK ${E.atk(g, on(g, 1, 'Cyber Dragon'))}`);
});
T('Dark Lucius LV4 to LV6 to LV8: negates, then banishes battle-destroyed monsters', () => {
  const g = duel({ board: [{ m: ['Dark Lucius LV4'], deckTop: [FILL, FILL, FILL, FILL, 'Dark Lucius LV6', 'Dark Lucius LV8'], turn: 2 },
    { m: [{ n: 'Sangan', pos: 'def' }, { n: 'Sangan', pos: 'def' }, { n: 'Sangan', pos: 'def' }], deckTop: ['Mystic Tomato', 'Mystic Tomato', 'Mystic Tomato'] }] });
  bp(g); atkOn(g, 'Dark Lucius LV4', 'Sangan'); settle(g, 'Mystic Tomato');
  ok(inZ(g, 1, 'gy', 'Sangan') && !inZ(g, 1, 'hand', 'Mystic Tomato'), 'LV4: Sangan destroyed, search negated');
  choose(g, 'endbp'); settle(g); endTurn(g); endTurn(g); settle(g, 'Dark Lucius LV6');
  ok(on(g, 0, 'Dark Lucius LV6') && inZ(g, 0, 'gy', 'Dark Lucius LV4'), 'LV6 Special Summoned from the Deck');
  let tom = cnt(g, 1, 'hand', 'Mystic Tomato'); bp(g); atkOn(g, 'Dark Lucius LV6', 'Sangan'); settle(g, 'Mystic Tomato');
  ok(cnt(g, 1, 'gy', 'Sangan') === 2 && cnt(g, 1, 'hand', 'Mystic Tomato') === tom, 'LV6: second Sangan destroyed, search negated');
  choose(g, 'endbp'); settle(g); endTurn(g); endTurn(g); settle(g, 'Dark Lucius LV8');
  ok(on(g, 0, 'Dark Lucius LV8'), 'LV8 Special Summoned');
  tom = cnt(g, 1, 'hand', 'Mystic Tomato'); bp(g); atkOn(g, 'Dark Lucius LV8', 'Sangan'); settle(g, 'Mystic Tomato');
  ok(inZ(g, 1, 'ban', 'Sangan') && cnt(g, 1, 'hand', 'Mystic Tomato') === tom, 'LV8: third Sangan banished, search negated');
  const g2 = duel({ board: [{ m: ['Dark Lucius LV6'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }], deckTop: ['Mystic Tomato'] }] });
  bp(g2); atkOn(g2, 'Dark Lucius LV6', 'Sangan'); settle(g2, 'Mystic Tomato');
  ok(inZ(g2, 1, 'hand', 'Mystic Tomato'), 'LV6 not summoned by LV4: Sangan searches');
});
T('Dark Magic Attack destroys the opponent Spells and Traps with Dark Magician', () => {
  const g = duel({ board: [{ hand: ['Dark Magic Attack'], m: ['Dark Magician'], st: ['Mirror Force'], turn: 2 }, { st: ['Mirror Force', 'Dark Coffin'] }] });
  act(g, 0, 'Dark Magic Attack'); settle(g);
  ok(cnt(g, 1, 'st') === 0 && inZ(g, 0, 'st', 'Mirror Force'), 'B\'s Spells/Traps destroyed, A\'s stay');
  const g2 = duel({ board: [{ hand: ['Dark Magic Attack'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Dark Magic Attack').u + ':'), 'needs Dark Magician');
});
T('Dark Magic Curtain: half LP for Dark Magician from the Deck, then no more summons', () => {
  const g = duel({ board: [{ hand: ['Dark Magic Curtain', 'Sangan'], deckTop: [FILL, 'Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Dark Magic Curtain'); settle(g, 'Dark Magician');
  ok(on(g, 0, 'Dark Magician') && lp(g, 0) === 4000, `Dark Magician summoned, A at ${lp(g, 0)}`);
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Sangan').u) && hasOpt(g, 'set:' + card(g, 0, 'Sangan').u), 'no Normal Summon after, Set allowed');
  const g2 = duel({ board: [{ hand: ['Dark Magic Curtain', 'Sangan'], deckTop: [FILL, 'Dark Magician'], turn: 2 }, {}] });
  choose(g2, 'ns:' + card(g2, 0, 'Sangan').u); settle(g2);
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Dark Magic Curtain').u + ':'), 'not after a Normal Summon');
});
T('Dark Magician Girl gains 300 per Dark Magician / Magician of Black Chaos in the GYs', () => {
  const g = duel({ board: [{ m: ['Dark Magician Girl'], gy: ['Dark Magician'], turn: 2 }, { gy: ['Magician of Black Chaos', 'Dark Magician'] }] });
  ok(E.atk(g, on(g, 0, 'Dark Magician Girl')) === 2900, `ATK ${E.atk(g, on(g, 0, 'Dark Magician Girl'))}`);
});
T('Dark Magician Knight cannot be Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Dark Magician Knight'], m: [FILL, FILL], turn: 2 }, {}] });
  const c = card(g, 0, 'Dark Magician Knight');
  ok(!hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u), 'no Normal Summon or Set');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Dark Magician Knight'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Monster Reborn').u + ':'), 'Monster Reborn cannot summon it');
});
T('Dark Magician of Chaos: End Phase Spell back, banishes its battle kills and itself', () => {
  const g = duel({ board: [{ hand: ['Dark Magician of Chaos'], m: [FILL, 'Sangan'], gy: ['Pot of Greed'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'ns:' + card(g, 0, 'Dark Magician of Chaos').u); settle(g, FILL, 'Sangan');
  ok(on(g, 0, 'Dark Magician of Chaos'), 'Tribute Summoned');
  bp(g); atkOn(g, 'Dark Magician of Chaos', 'Cyber Dragon'); settle(g);
  ok(inZ(g, 1, 'ban', 'Cyber Dragon'), 'Cyber Dragon banished');
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g, 'Pot of Greed');
  ok(inZ(g, 0, 'hand', 'Pot of Greed'), 'Pot of Greed added in the End Phase');
  const g2 = duel({ board: [{ hand: ['Monster Reborn', 'Dark Hole'], gy: ['Dark Magician of Chaos'], turn: 2 }, {}] });
  act(g2, 0, 'Monster Reborn'); settle(g2, 'Dark Magician of Chaos'); act(g2, 0, 'Dark Hole'); settle(g2);
  ok(inZ(g2, 0, 'ban', 'Dark Magician of Chaos'), 'banished instead of going to the GY');
});
T('Dark Mimic LV1 draws on flip, becomes LV3; LV3 draws 2 when destroyed', () => {
  const g = duel({ board: [{ m: [{ n: 'Dark Mimic LV1', pos: 'set' }], deckTop: [FILL, 'Pot of Greed'], turn: 2 }, {}] });
  const h = g.p[0].hand.length;
  choose(g, 'flip:'); settle(g);
  ok(g.p[0].hand.length === h + 1, 'flip drew 1');
  const g2 = duel({ board: [{ m: ['Dark Mimic LV1'], deckTop: [FILL, 'Dark Mimic LV3'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  settle(g2, 'Dark Mimic LV3');
  ok(on(g2, 0, 'Dark Mimic LV3') && inZ(g2, 0, 'gy', 'Dark Mimic LV1'), 'LV3 Special Summoned in the Standby Phase');
  endTurn(g2);
  const h2 = g2.p[0].hand.length;
  choose(g2, 'bp'); settle(g2); choose(g2, 'atk:' + on(g2, 1, 'Cyber Dragon').u + ':' + on(g2, 0, 'Dark Mimic LV3').u); settle(g2);
  ok(inZ(g2, 0, 'gy', 'Dark Mimic LV3') && g2.p[0].hand.length === h2 + 2, `LV3 destroyed, A drew 2 (hand ${g2.p[0].hand.length} from ${h2})`);
  const g3 = duel({ board: [{ m: ['Dark Mimic LV3'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  endTurn(g3); const h3 = g3.p[0].hand.length;
  choose(g3, 'bp'); settle(g3); choose(g3, 'atk:' + on(g3, 1, 'Cyber Dragon').u + ':' + on(g3, 0, 'Dark Mimic LV3').u); settle(g3);
  ok(g3.p[0].hand.length === h3 + 1, `not from LV1: drew 1 (hand ${g3.p[0].hand.length} from ${h3})`);
});
T('Dark Mirror Force banishes the attacker side Defense Position monsters', () => {
  const g = duel({ board: [{ m: [FILL, { n: 'Sangan', pos: 'def' }, { n: 'Mystic Tomato', pos: 'set' }], turn: 2 }, { st: ['Dark Mirror Force'] }] });
  bp(g); attack(g, FILL, 'd'); settle(g, 'Dark Mirror Force');
  ok(inZ(g, 0, 'ban', 'Sangan') && inZ(g, 0, 'ban', 'Mystic Tomato') && on(g, 0, FILL), 'both Defense Position monsters banished, attacker stays');
});
T('Dark Necrofear: summoned by banishing 3 Fiends, takes a monster when destroyed', () => {
  const g = duel({ board: [{ hand: ['Dark Necrofear'], gy: ['Sangan', 'Archfiend Soldier', 'Possessed Dark Soul'], turn: 2 }, {}] });
  const c = card(g, 0, 'Dark Necrofear');
  ok(!hasOpt(g, 'ns:' + c.u), 'no Normal Summon');
  choose(g, 'sp:' + c.u); settle(g, 'Sangan', 'Archfiend Soldier', 'Possessed Dark Soul');
  ok(on(g, 0, 'Dark Necrofear') && cnt(g, 0, 'ban') === 3, 'summoned, 3 Fiends banished');
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Cyber Dragon'], turn: 2 }, { m: ['Dark Necrofear'] }] });
  act(g2, 0, 'Dark Hole'); settle(g2);
  // revive a monster for A to be the target
  const g3 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Cyber Dragon', 'Dark Elf'], turn: 2 }, { m: ['Dark Necrofear'] }] });
  void g2;
  bp(g3); atkOn(g3, 'Cyber Dragon', 'Dark Necrofear'); settle(g3);
  // 2100 vs 2200: Cyber Dragon dies. Use Dark Hole instead on a field with an A monster that survives: none. Use a battle with a stronger attacker.
  const g4 = duel({ board: [{ m: ['Dark Armed Dragon', 'Cyber Dragon'], turn: 2 }, { m: ['Dark Necrofear'] }] });
  bp(g4); atkOn(g4, 'Dark Armed Dragon', 'Dark Necrofear'); settle(g4);
  ok(inZ(g4, 1, 'gy', 'Dark Necrofear'), 'Necrofear destroyed by battle');
  choose(g4, 'endbp'); settle(g4); choose(g4, 'end'); settle(g4, 'Dark Armed Dragon');
  const taken = g4.p[1].m.some(x => x && ['Dark Armed Dragon', 'Cyber Dragon'].includes(E.name(x)));
  ok(inZ(g4, 1, 'st', 'Dark Necrofear') && taken, 'Necrofear equipped, B controls one of A\'s monsters');
});
T('Dark Nephthys: banish 2 DARK to send it, comes back next Standby and destroys a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Dark Nephthys'], gy: ['Sangan', 'Archfiend Soldier', 'Dark Magician'], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'a:' + card(g, 0, 'Dark Nephthys').u + ':'); settle(g, 'Sangan', 'Archfiend Soldier');
  ok(inZ(g, 0, 'gy', 'Dark Nephthys') && cnt(g, 0, 'ban') === 2, 'sent to the GY, 2 DARK banished');
  endTurn(g); endTurn(g); settle(g, 'Mirror Force');
  ok(on(g, 0, 'Dark Nephthys') && inZ(g, 1, 'gy', 'Mirror Force'), 'Special Summoned in the Standby Phase, Mirror Force destroyed');
});
T('Dark Paladin: Fusion only, discards to negate a Spell, +500 per Dragon', () => {
  const g = duel({ ex0: ['Dark Paladin'], board: [{ hand: ['Polymerization', 'Dark Magician', 'Buster Blader'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Dark Paladin', 'Dark Magician', 'Buster Blader');
  ok(on(g, 0, 'Dark Paladin'), 'Fusion Summoned');
  const g2 = duel({ board: [{ m: ['Dark Paladin'], gy: ['Pitch-Dark Dragon'], turn: 2 }, { m: ['Cyber Dragon', 'Dark Armed Dragon'] }] });
  ok(E.atk(g2, on(g2, 0, 'Dark Paladin')) === 3900, `2 Dragons: ATK ${E.atk(g2, on(g2, 0, 'Dark Paladin'))}`);
  const g3 = duel({ board: [{ m: ['Dark Paladin'], hand: [FILL], turn: 1 }, { hand: ['Dark Hole'] }] });
  endTurn(g3); act(g3, 1, 'Dark Hole'); settle(g3, 'Dark Paladin', FILL);
  ok(on(g3, 0, 'Dark Paladin') && inZ(g3, 0, 'gy', FILL) && inZ(g3, 1, 'gy', 'Dark Hole'), 'Dark Hole negated by discarding');
  const g4 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Dark Paladin'], turn: 2 }, {}] });
  ok(!hasOpt(g4, 'a:' + card(g4, 0, 'Monster Reborn').u + ':'), 'Monster Reborn cannot summon it');
});
T('Dark Red Enchanter: 2 counters on Normal Summon, +1 per Spell, removes 2 to discard', () => {
  const g = duel({ board: [{ hand: ['Dark Red Enchanter', 'Pot of Greed'], m: [FILL], turn: 2 }, { hand: ['Cyber Dragon'] }] });
  choose(g, 'ns:' + card(g, 0, 'Dark Red Enchanter').u); settle(g, FILL);
  const c = on(g, 0, 'Dark Red Enchanter');
  ok(E.atk(g, c) === 2300, `2 counters: ATK ${E.atk(g, c)}`);
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(E.atk(g, c) === 2600, `after a Spell: ATK ${E.atk(g, c)}`);
  choose(g, 'a:' + c.u + ':'); settle(g);
  ok(g.p[1].hand.length === 0 && inZ(g, 1, 'gy', 'Cyber Dragon') && E.atk(g, c) === 2000, `B discarded, ATK ${E.atk(g, c)}`);
});
T('Dark Resonator survives its first battle each turn', () => {
  const g = duel({ board: [{ m: ['Cyber Dragon', 'Dark Armed Dragon'], turn: 2 }, { m: ['Dark Resonator'] }] });
  bp(g); atkOn(g, 'Cyber Dragon', 'Dark Resonator'); settle(g);
  ok(on(g, 1, 'Dark Resonator') && lp(g, 1) === 8000 - 800, `first battle: survives, B took 800 (B ${lp(g, 1)})`);
  atkOn(g, 'Dark Armed Dragon', 'Dark Resonator'); settle(g);
  ok(inZ(g, 1, 'gy', 'Dark Resonator'), 'second battle: destroyed');
});
T('Dark Room of Nightmare adds 300 to effect damage', () => {
  const g = duel({ board: [{ hand: ['Dark Room of Nightmare', 'Pot of Greed'], m: ['Dark Eradicator Warlock'], turn: 2 }, {}] });
  act(g, 0, 'Dark Room of Nightmare'); settle(g); act(g, 0, 'Pot of Greed'); settle(g);
  ok(lp(g, 1) === 8000 - 1300, `1000 + 300 (B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ st: [{ n: 'Dark Room of Nightmare', pos: 'up' }], m: [FILL], turn: 2 }, {}] });
  bp(g2); attack(g2, FILL, 'd'); settle(g2);
  ok(lp(g2, 1) === 6000, `no extra for battle damage (B ${lp(g2, 1)})`);
});
T('Dark Ruler Ha Des negates Fiend battle kills, cannot come back from the GY', () => {
  const g = duel({ board: [{ m: ['Dark Ruler Ha Des', 'Archfiend Soldier'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }], deckTop: ['Mystic Tomato'] }] });
  bp(g); atkOn(g, 'Archfiend Soldier', 'Sangan'); settle(g, 'Mystic Tomato');
  ok(inZ(g, 1, 'gy', 'Sangan') && !inZ(g, 1, 'hand', 'Mystic Tomato'), 'Sangan killed by a Fiend: no search');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Dark Ruler Ha Des'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Monster Reborn').u + ':'), 'Monster Reborn cannot target it in the GY');
  const g3 = duel({ board: [{ m: ['Dark Ruler Ha Des', 'Gene-Warped Warwolf'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }], deckTop: ['Mystic Tomato'] }] });
  bp(g3); atkOn(g3, FILL, 'Sangan'); settle(g3, 'Mystic Tomato');
  ok(inZ(g3, 1, 'hand', 'Mystic Tomato'), 'killed by a non-Fiend: Sangan searches');
});
T('Dark Sage cannot be Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Dark Sage'], m: [FILL, FILL, FILL], turn: 2 }, {}] });
  const c = card(g, 0, 'Dark Sage');
  ok(!hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u), 'no Normal Summon or Set');
});
T('Dark Magician Knight via Knight\'s Title destroys 1 card', () => {
  const g = duel({ board: [{ hand: ["Knight's Title"], m: ['Dark Magician'], deckTop: [FILL, 'Dark Magician Knight'], turn: 2 }, { st: [{ n: 'Dark Room of Nightmare', pos: 'up' }] }] });
  act(g, 0, "Knight's Title"); settle(g, 'Dark Room', 'Dark Magician Knight', 'Dark Magician');
  ok(on(g, 0, 'Dark Magician Knight') && inZ(g, 1, 'gy', 'Dark Room of Nightmare'), 'Dark Magician Knight summoned, Dark Room destroyed');
});
T('Dark Sage via Time Wizard searches a Spell', () => {
  let g;
  for (const call of ['Heads', 'Tails']) {
    g = duel({ board: [{ m: ['Time Wizard', 'Dark Magician'], deckTop: [FILL, 'Dark Sage', 'Pot of Greed'], turn: 2 }, { m: ['Sangan'] }] });
    choose(g, 'a:' + on(g, 0, 'Time Wizard').u + ':'); settle(g, call, 'Dark Sage', 'Pot of Greed');
    if (g.log.some(l => /called it right/.test(l))) break;
  }
  ok(on(g, 0, 'Dark Sage') && inZ(g, 0, 'hand', 'Pot of Greed'), 'Dark Sage summoned and Pot of Greed added');
});
T('Dark Scorpion Burglars mills a Spell from the opponent Deck', () => {
  const g = duel({ board: [{ m: ['Dark Scorpion Burglars'], turn: 2 }, { deckTop: [FILL, 'Pot of Greed'] }] });
  bp(g); attack(g, 'Dark Scorpion Burglars', 'd'); settle(g, 'Pot of Greed');
  ok(lp(g, 1) === 7000 && inZ(g, 1, 'gy', 'Pot of Greed'), 'B took 1000 and sent Pot of Greed to the GY');
});
T('Dark Scorpion Combination: the 5 attack directly for 400 each', () => {
  const five = ['Don Zaloog', 'Dark Scorpion - Cliff the Trap Remover', 'Dark Scorpion - Chick the Yellow', 'Dark Scorpion - Gorg the Strong', 'Dark Scorpion - Meanae the Thorn'];
  const g = duel({ board: [{ m: five, st: ['Dark Scorpion Combination'], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  act(g, 0, 'Dark Scorpion Combination'); settle(g);
  bp(g); attack(g, 'Dark Scorpion - Gorg the Strong', 'd'); settle(g);
  ok(lp(g, 1) === 7600, `Gorg hit directly for 400 (B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ m: five.slice(0, 4), st: ['Dark Scorpion Combination'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Dark Scorpion Combination').u + ':'), 'needs all 5');
});
T('Dark Simorgh: summoned from hand by banishing DARK + WIND, the opponent cannot Set', () => {
  const g = duel({ board: [{ hand: ['Dark Simorgh'], gy: ['Sangan', 'Harpie Lady'], turn: 2 }, { hand: [FILL, 'Mirror Force'] }] });
  choose(g, 'a:' + card(g, 0, 'Dark Simorgh').u + ':'); settle(g, 'Sangan', 'Harpie Lady');
  const s = on(g, 0, 'Dark Simorgh');
  ok(s && inZ(g, 0, 'ban', 'Sangan') && inZ(g, 0, 'ban', 'Harpie Lady'), 'Special Summoned from the hand');
  endTurn(g);
  ok(!g.prompt.opts.some(x => x.key.startsWith('set:') || x.key.startsWith('setst:')), 'B cannot Set monsters or Spells/Traps');
  const g2 = duel({ board: [{ hand: ['Sangan', 'Harpie Lady'], gy: ['Dark Simorgh'], turn: 2 }, {}] });
  choose(g2, 'a:' + card(g2, 0, 'Dark Simorgh').u + ':'); settle(g2, 'Sangan', 'Harpie Lady');
  ok(on(g2, 0, 'Dark Simorgh'), 'Special Summoned from the GY by banishing from the hand');
});
T('Dark Snake Syndrome: 200 to both, doubling each of its controller Standby Phases', () => {
  const g = duel({ board: [{ st: [{ n: 'Dark Snake Syndrome', pos: 'up' }], turn: 2 }, {}] });
  settle(g);
  ok(lp(g, 0) === 7800 && lp(g, 1) === 7800, `first Standby: 200 each (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  endTurn(g);
  ok(lp(g, 0) === 7800, 'nothing in the opponent Standby Phase');
  endTurn(g); settle(g);
  ok(lp(g, 0) === 7400 && lp(g, 1) === 7400, `second: 400 each (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Dark Spider raises an Insect by 2 Levels', () => {
  const g = duel({ board: [{ m: ['Dark Spider', 'Insect Knight'], turn: 2 }, {}] });
  choose(g, 'a:' + on(g, 0, 'Dark Spider').u + ':'); settle(g, 'Insect Knight');
  ok(E.lib.lv(on(g, 0, 'Insect Knight')) === 6, 'Insect Knight is Level 6');
  ok(!hasOpt(g, 'a:' + on(g, 0, 'Dark Spider').u + ':'), 'once per turn');
});
T('Dark Spirit of the Silent: another opponent monster attacks instead', () => {
  const g = duel({ board: [{ m: ['Dark Armed Dragon', 'Sangan'], turn: 2 }, { m: ['Cyber Dragon'], st: ['Dark Spirit of the Silent'] }] });
  bp(g); atkOn(g, 'Dark Armed Dragon', 'Cyber Dragon'); settle(g, 'Dark Spirit of the Silent', 'Sangan');
  ok(on(g, 1, 'Cyber Dragon') && inZ(g, 0, 'gy', 'Sangan') && lp(g, 0) === 8000 - 1100, `Sangan attacked Cyber Dragon instead (A ${lp(g, 0)})`);
});
T('Dark Strike Fighter: Synchro, tributes a monster for Level x 200 once per turn', () => {
  const g = duel({ ex0: ['Dark Strike Fighter'], board: [{ m: ['Dark Resonator', 'Gene-Warped Warwolf', 'Sangan', 'Archfiend Soldier'], turn: 2 }, {}] });
  ok(hasOpt(g, 'syn:'), 'Synchro offered'); choose(g, 'syn:'); settle(g, 'Dark Resonator', FILL);
  const f = on(g, 0, 'Dark Strike Fighter'); ok(!!f, 'Synchro Summoned');
  choose(g, 'a:' + f.u + ':'); settle(g, 'Archfiend Soldier');
  ok(lp(g, 1) === 8000 - 800, `Level 4: 800 damage (B ${lp(g, 1)})`);
  ok(!hasOpt(g, 'a:' + f.u + ':'), 'once per turn');
  const g2 = duel({ board: [{ m: ['Dark Strike Fighter', 'Sangan'], turn: 2 }, {}] });
  bp(g2); choose(g2, 'endbp'); settle(g2);
  ok(!hasOpt(g2, 'a:' + on(g2, 0, 'Dark Strike Fighter').u + ':'), 'not in Main Phase 2');
});
T('Dark Tinker looks at the top card and may put it on the bottom', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Dark Tinker'], deckTop: [FILL, 'Pot of Greed'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g, 'Bottom', 'bottom');
  ok(E.name(g.p[0].deck[0]) === 'Pot of Greed' || E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Pot of Greed', 'Pot of Greed is on the top or bottom');
  ok(inZ(g, 0, 'gy', 'Dark Tinker'), 'Tinker in the GY');
});
T('Dark Verger comes back when a Plant Tuner is Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Copy Plant'], gy: ['Dark Verger'], turn: 2 }, {}] });
  choose(g, 'ns:' + card(g, 0, 'Copy Plant').u); settle(g, 'Dark Verger');
  const v = on(g, 0, 'Dark Verger');
  ok(v && v.pos === 'atk', 'Dark Verger Special Summoned in Attack Position');
});
T('Dark Voltanis: after a Counter Trap resolves, tribute a DARK to summon it and destroy 1 card', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: [FILL], turn: 2 }, { hand: ['Dark Voltanis', FILL], m: ['Sangan'], st: ['Magic Jammer', 'Mirror Force'] }] });
  g.p[1].hand.push(...[]);
  act(g, 0, 'Pot of Greed');
  settle(g, 'Magic Jammer', FILL, 'Dark Voltanis', 'Sangan');
  ok(on(g, 1, 'Dark Voltanis') && inZ(g, 1, 'gy', 'Sangan'), 'Dark Voltanis Special Summoned by tributing Sangan');
  ok(!on(g, 0, FILL), 'it destroyed A\'s monster');
});
T('Dark World Dealings: each player draws 1 then discards 1', () => {
  const g = duel({ board: [{ hand: ['Dark World Dealings'], turn: 2 }, {}] });
  const h0 = g.p[0].hand.length - 1, h1 = g.p[1].hand.length;
  act(g, 0, 'Dark World Dealings'); settle(g);
  ok(g.p[0].hand.length === h0 && g.p[1].hand.length === h1 && cnt(g, 0, 'gy') === 2 && cnt(g, 1, 'gy') === 1, 'hands the same size, 1 discard each');
});
T('Dark World Grimoire summons a monster discarded for the hand limit', () => {
  const g = duel({ board: [{ hand: ['Sangan', FILL, FILL, FILL, FILL, FILL, FILL], st: [{ n: 'Dark World Grimoire', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'end'); settle(g, 'Sangan');
  ok(on(g, 0, 'Sangan') || on(g, 0, FILL), 'the discarded monster was Special Summoned');
});
T('Dark World Lightning destroys a Set card, then discards 1', () => {
  const g = duel({ board: [{ hand: ['Dark World Lightning', 'Pot of Greed'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Dark World Lightning'); settle(g, 'Mirror Force', 'Pot of Greed');
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'Pot of Greed'), 'Mirror Force destroyed, Pot of Greed discarded');
});
T('Dark Zebra goes to Defense when it is the only monster', () => {
  const g = duel({ board: [{ m: ['Dark Zebra'], turn: 2 }, {}] });
  settle(g);
  const z = on(g, 0, 'Dark Zebra');
  ok(z.pos === 'def' && !hasOpt(g, 'pos:' + z.u), 'changed to Defense, locked this turn');
  const g2 = duel({ board: [{ m: ['Dark Zebra', FILL], turn: 2 }, {}] });
  ok(on(g2, 0, 'Dark Zebra').pos === 'atk', 'stays in Attack with another monster');
});
T('Dark-Eyes Illusionist: flip, the target cannot attack', () => {
  const g = duel({ board: [{ turn: 1 }, { m: ['Cyber Dragon', FILL] }] });
  // A sets Illusionist; B attacks it with Cyber Dragon
  const g2 = duel({ board: [{ m: [{ n: 'Dark-Eyes Illusionist', pos: 'set' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  void g;
  choose(g2, 'flip:'); settle(g2, 'Cyber Dragon');
  endTurn(g2); choose(g2, 'bp'); settle(g2);
  ok(!hasOpt(g2, 'atk:' + on(g2, 1, 'Cyber Dragon').u), 'Cyber Dragon cannot attack');
});
T('Dark-Piercing Light flips the opponent face-down monsters face-up', () => {
  const g = duel({ board: [{ hand: ['Dark-Piercing Light'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'set' }, { n: FILL, pos: 'set' }] }] });
  act(g, 0, 'Dark-Piercing Light'); settle(g);
  ok(g.p[1].m.filter(c => c).every(c => c.pos === 'def'), 'both face-up Defense');
});

T('More: Balter ignores Quick-Play Spells, Jeroid on Flip Summon, Catapulter with 2 counters', () => {
  const g = duel({ board: [{ m: ['Dark Balter the Terrible'], turn: 1 }, { hand: ['Book of Moon'] }] });
  endTurn(g); act(g, 1, 'Book of Moon'); settle(g, 'Dark Balter the Terrible');
  ok(!g.log.some(l => /Dark Balter the Terrible's effect/.test(l)) && lp(g, 0) === 8000, 'no negation offered for a Quick-Play Spell');
  const g2 = duel({ board: [{ m: [{ n: 'Dark Jeroid', pos: 'set' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g2, 'flip:'); settle(g2, 'Cyber Dragon');
  ok(E.atk(g2, on(g2, 1, 'Cyber Dragon')) === 1300, 'Flip Summon: Cyber Dragon loses 800');
  const g3 = duel({ board: [{ m: [{ n: 'Dark Catapulter', pos: 'def' }], gy: ['Sangan', 'Mystic Tomato'], turn: 2 }, { st: ['Mirror Force', 'Dark Coffin'] }] });
  settle(g3); endTurn(g3); endTurn(g3); settle(g3);
  const c = on(g3, 0, 'Dark Catapulter');
  ok(Object.values(c.ctr || {}).some(v => v === 2), 'two counters after two Standby Phases');
  choose(g3, 'a:' + c.u + ':'); settle(g3, 'Sangan', 'Mystic Tomato', 'Mirror Force', 'Dark Coffin');
  ok(cnt(g3, 0, 'ban') === 2 && inZ(g3, 1, 'gy', 'Mirror Force'), 'banished 2 to destroy 2');
});

// Goat: the shared scripts of 'both' cards, quick checks with the Goat card pool
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
  G('Polymerization makes Dark Balter and Dark Paladin', () => {
    let g = gduel([{ hand: ['Polymerization', 'Possessed Dark Soul', 'Frontier Wiseman'], turn: 2 }, {}], ['Dark Balter the Terrible']);
    act(g, 0, 'Polymerization'); settle(g, 'Dark Balter', 'Possessed Dark Soul', 'Frontier Wiseman');
    ok(on(g, 0, 'Dark Balter the Terrible'), 'Goat: Dark Balter Fusion Summoned');
    g = gduel([{ hand: ['Polymerization', 'Dark Magician', 'Buster Blader'], turn: 2 }, {}], ['Dark Paladin']);
    act(g, 0, 'Polymerization'); settle(g, 'Dark Paladin', 'Dark Magician', 'Buster Blader');
    ok(on(g, 0, 'Dark Paladin'), 'Goat: Dark Paladin Fusion Summoned');
  });
  G('Dark Magician of Chaos adds a Spell in the End Phase and banishes its kill', () => {
    const g = gduel([{ hand: ['Dark Magician of Chaos'], m: [GF, 'Sangan'], gy: ['Pot of Greed'], turn: 2 }, { m: ['Mystic Tomato'] }]);
    choose(g, 'ns:' + card(g, 0, 'Dark Magician of Chaos').u); settle(g, GF, 'Sangan');
    bp(g); atkOn(g, 'Dark Magician of Chaos', 'Mystic Tomato'); settle(g);
    ok(inZ(g, 1, 'ban', 'Mystic Tomato'), 'Goat: Mystic Tomato banished');
    choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g, 'Pot of Greed');
    ok(inZ(g, 0, 'hand', 'Pot of Greed'), 'Goat: Pot of Greed back to the hand');
  });
  G('Dark Mimic LV1 becomes LV3 in the Standby Phase', () => {
    const g = gduel([{ m: ['Dark Mimic LV1'], deckTop: [GF, 'Dark Mimic LV3'], turn: 2 }, {}]);
    settle(g, 'Dark Mimic LV3');
    ok(on(g, 0, 'Dark Mimic LV3'), 'Goat: LV3 Special Summoned');
  });
  G('Dark Elf pays 1000 to attack, Dark Ruler Ha Des negates Sangan', () => {
    const g = gduel([{ m: ['Dark Elf', 'Dark Ruler Ha Des'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }], deckTop: [GF, 'Mystic Tomato'] }]);
    bp(g); atkOn(g, 'Dark Ruler Ha Des', 'Sangan'); settle(g, 'Mystic Tomato');
    ok(inZ(g, 1, 'gy', 'Sangan') && !inZ(g, 1, 'hand', 'Mystic Tomato'), 'Goat: no Sangan search');
    attack(g, 'Dark Elf', 'd'); settle(g);
    ok(lp(g, 0) === 7000 && lp(g, 1) === 6000, `Goat: A paid 1000, B took 2000 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  });
  G('Dark Core, Dark Hole, Dark Magic Attack', () => {
    let g = gduel([{ hand: ['Dark Core', 'Pot of Greed'], turn: 2 }, { m: ['Sangan'] }]);
    act(g, 0, 'Dark Core'); settle(g, 'Pot of Greed', 'Sangan');
    ok(inZ(g, 1, 'ban', 'Sangan'), 'Goat: Dark Core banished Sangan');
    g = gduel([{ hand: ['Dark Hole'], m: [GF], turn: 2 }, { m: ['Sangan'] }]);
    act(g, 0, 'Dark Hole'); settle(g);
    ok(cnt(g, 0, 'm') === 0 && cnt(g, 1, 'm') === 0, 'Goat: Dark Hole cleared the field');
    g = gduel([{ hand: ['Dark Magic Attack'], m: ['Dark Magician'], turn: 2 }, { st: ['Mirror Force', 'Dark Coffin'] }]);
    act(g, 0, 'Dark Magic Attack'); settle(g);
    ok(cnt(g, 1, 'st') === 0, 'Goat: Dark Magic Attack cleared the Spells/Traps');
  });
  G('Dark Spirit of the Silent and Dark Mirror Force', () => {
    let g = gduel([{ m: ['Dark Magician', 'Sangan'], turn: 2 }, { m: ['Mystic Tomato'], st: ['Dark Spirit of the Silent'] }]);
    bp(g); atkOn(g, 'Dark Magician', 'Mystic Tomato'); settle(g, 'Dark Spirit of the Silent', 'Sangan');
    ok(on(g, 1, 'Mystic Tomato') && inZ(g, 0, 'gy', 'Sangan'), 'Goat: Sangan attacked instead');
    g = gduel([{ m: [GF, { n: 'Sangan', pos: 'def' }], turn: 2 }, { st: ['Dark Mirror Force'] }]);
    bp(g); attack(g, GF, 'd'); settle(g, 'Dark Mirror Force');
    ok(inZ(g, 0, 'ban', 'Sangan'), 'Goat: Defense Position Sangan banished');
  });
  G('Dark Necrofear Special Summon', () => {
    const g = gduel([{ hand: ['Dark Necrofear'], gy: ['Sangan', 'Sangan', 'Possessed Dark Soul'], turn: 2 }, {}]);
    choose(g, 'sp:' + card(g, 0, 'Dark Necrofear').u); settle(g);
    ok(on(g, 0, 'Dark Necrofear') && cnt(g, 0, 'ban') === 3, 'Goat: summoned by banishing 3 Fiends');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-05 review checks passed.');
process.exit(fails ? 1 : 0);
