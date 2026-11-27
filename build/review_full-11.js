// Independent review checks for full pool batch 11 (written from the card text): node build/review_full-11.js
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
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, g.p[p].fz, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra, ...g.p[p].ban].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const canAct = (g, p, n) => { const c = card(g, p, n); return !!c && hasOpt(g, 'a:' + c.u + ':'); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ')); } };
// answer prompts until an idle or battle prompt: responses pass unless a pick matches, yes to yes/no (unless no:true), picks by label
function settle(g, ...picks) { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const k = picks.find(t => pr.opts.some(x => x.key !== 'pass' && (x.label + ' ' + x.key).includes(t))); if (k) choose(g, k); else E.act(g, ['pass']); }
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
const fz = (g, p, n) => !!g.p[p].fz && E.name(g.p[p].fz) === n;
const ctrOf = (c, k) => (c && c.ctr && c.ctr[k]) || 0;
const toMain = (g, ...picks) => { endTurn(g, ...picks); endTurn(g, ...picks); }; // to A's next Main Phase 1

T('Levia-Dragon - Daedalus: send face-up Umi, destroy all other cards', () => {
  const g = duel({ board: [{ hand: ['Umi'], m: ['Levia-Dragon - Daedalus', 'Mystical Elf'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  const lv = on(g, 0, 'Levia-Dragon - Daedalus');
  ok(!hasOpt(g, 'a:' + lv.u + ':'), 'no Umi, no activation');
  act(g, 0, 'Umi'); settle(g);
  act(g, 0, 'Levia-Dragon - Daedalus'); settle(g, 'Umi');
  ok(on(g, 0, 'Levia-Dragon - Daedalus') && inZ(g, 0, 'gy', 'Umi') && inZ(g, 0, 'gy', 'Mystical Elf') && inZ(g, 1, 'gy', FILL) && inZ(g, 1, 'gy', 'Mirror Force'), 'Levia stays, everything else destroyed');
});
T('Light Barrier: Arcana Force battle kill gains LP equal to original ATK', () => {
  const g = duel({ board: [{ hand: ['Light Barrier'], m: ['Arcana Force I - The Magician'], turn: 2 }, { m: ['Mega Thunderball'] }] });
  act(g, 0, 'Light Barrier'); settle(g);
  ok(fz(g, 0, 'Light Barrier'), 'Light Barrier on the field');
  bp(g); atkOn(g, 0, 'Arcana Force I - The Magician', 'Mega Thunderball');
  ok(inZ(g, 1, 'gy', 'Mega Thunderball') && lp(g, 0) === 8750, `A gained 750 (${lp(g, 0)})`);
});
T('Light Effigy: counts as 2 Tributes for a LIGHT Normal Monster', () => {
  const g = duel({ board: [{ hand: ['Elemental HERO Neos', 'Big Koala'], m: ['Light Effigy'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Big Koala').u) && !hasOpt(g, 'set:' + card(g, 0, 'Big Koala').u), 'not for an EARTH Normal Monster');
  ns(g, 0, 'Elemental HERO Neos', 'Light Effigy');
  ok(on(g, 0, 'Elemental HERO Neos') && inZ(g, 0, 'gy', 'Light Effigy'), 'Neos Tribute Summoned with Effigy alone');
});
T('Light End Dragon: Synchro, -500 itself, -1500 the battle target', () => {
  const g = duel({ ex0: ['Light End Dragon'], board: [{ hand: [], m: ['Mind Master', 'Elemental HERO Neos'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  ok(hasOpt(g, 'Synchro Summon'), 'Synchro offered'); choose(g, 'Synchro Summon'); settle(g, 'Light End Dragon', 'Mind Master', 'Elemental HERO Neos', 'Attack');
  const d = on(g, 0, 'Light End Dragon'); ok(!!d, 'Light End Dragon summoned');
  bp(g); atkOn(g, 0, 'Light End Dragon', 'Cyber Dragon');
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && lp(g, 1) === 6500 && E.atk(g, d) === 2100 && E.def(g, d) === 1600, `Cyber destroyed, B ${lp(g, 1)}, LED ${E.atk(g, d)}/${E.def(g, d)}`);
  const g2 = duel({ ex0: ['Light End Dragon'], board: [{ hand: [], m: ['Mind Master', 'Cyber Dragon', 'Mega Thunderball'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'Synchro Summon'), 'no Synchro with non-LIGHT non-Tuners');
});
T('Light Laser: LIGHT Warrior only, banishes the monster it battled', () => {
  const g = duel({ board: [{ hand: ['Light Laser'], m: ['Elemental HERO Neos'], turn: 2 }, { m: [{ n: 'Labyrinth Wall', pos: 'def' }] }] });
  act(g, 0, 'Light Laser'); settle(g, 'Elemental HERO Neos');
  bp(g); atkOn(g, 0, 'Elemental HERO Neos', 'Labyrinth Wall');
  ok(inZ(g, 1, 'ban', 'Labyrinth Wall'), 'Labyrinth Wall banished');
  const g2 = duel({ board: [{ hand: ['Light Laser'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Light Laser'), 'cannot equip a Beast-Warrior');
});
T('Light of Intervention: no Sets, Book of Moon cannot flip face-down', () => {
  const g = duel({ board: [{ hand: ['Sangan', 'Book of Moon'], st: [{ n: 'Light of Intervention', pos: 'up' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  ok(!canAct(g, 0, 'Book of Moon'), 'Book of Moon cannot be activated');
  const s = card(g, 0, 'Sangan');
  if (hasOpt(g, 'set:' + s.u)) { choose(g, 'set:' + s.u); settle(g); const m = on(g, 0, 'Sangan'); ok(m && m.pos === 'def', 'Set becomes face-up Defense: ' + (m && m.pos)); }
  else ok(true, 'no Set option');
});
T('Light of Judgment: with Sanctuary, discard a LIGHT, send 1 opponent card to the GY', () => {
  const g = duel({ board: [{ hand: ['The Sanctuary in the Sky', 'Mystical Elf'], st: ['Light of Judgment'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  ok(!canAct(g, 0, 'Light of Judgment'), 'no Sanctuary, no activation');
  act(g, 0, 'The Sanctuary in the Sky'); settle(g);
  act(g, 0, 'Light of Judgment'); settle(g, 'Mystical Elf', 'Send', 'Cyber Dragon');
  ok(inZ(g, 0, 'gy', 'Mystical Elf') && inZ(g, 1, 'gy', 'Cyber Dragon'), 'Elf discarded, Cyber Dragon sent to the GY');
});
T('Light of Redemption: pay 800, add a banished LIGHT', () => {
  const g = duel({ board: [{ hand: ['Light of Redemption'], ban: ['Mystical Elf', FILL], turn: 2 }, {}] });
  act(g, 0, 'Light of Redemption'); settle(g, 'Mystical Elf');
  ok(inZ(g, 0, 'hand', 'Mystical Elf') && lp(g, 0) === 7200, `Elf added, A ${lp(g, 0)}`);
});
T('Light Spiral: Lightsworn mill banishes the top of the opponent Deck', () => {
  const g = duel({ board: [{ m: [{ n: 'Ryko, Lightsworn Hunter', pos: 'set' }], st: [{ n: 'Light Spiral', pos: 'up' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'flip:' + on(g, 0, 'Ryko, Lightsworn Hunter').u); settle(g, FILL);
  ok(cnt(g, 0, 'gy') >= 3, `A milled (GY ${cnt(g, 0, 'gy')})`);
  ok(cnt(g, 1, 'ban') === 1, `B had 1 card banished (${cnt(g, 1, 'ban')})`);
});
T('Machine Assembly Line: +200 to all Machines, 2 counters per destruction, revives', () => {
  const g = duel({ board: [{ m: ['Cyber Dragon', 'Jinzo'], st: [{ n: 'Machine Assembly Line', pos: 'up' }], gy: ['Steamroid'], turn: 2 }, { m: ['Dekoichi the Battlechanted Locomotive', { n: 'Reflect Bounder', pos: 'def' }] }] });
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 2300 && E.atk(g, on(g, 1, 'Dekoichi the Battlechanted Locomotive')) === 1600, 'both sides gain 200');
  bp(g); atkOn(g, 0, 'Cyber Dragon', 'Dekoichi the Battlechanted Locomotive'); atkOn(g, 0, 'Jinzo', 'Reflect Bounder');
  const mal = card(g, 0, 'Machine Assembly Line');
  ok(ctrOf(mal, 'junk') === 4, `4 Junk Counters (${JSON.stringify(mal.ctr)})`);
  choose(g, 'endbp'); settle(g);
  act(g, 0, 'Machine Assembly Line'); settle(g, 'Steamroid', 'Attack');
  ok(on(g, 0, 'Steamroid') && inZ(g, 0, 'gy', 'Machine Assembly Line'), 'Steamroid Special Summoned');
});
T('Machine Conversion Factory: Machine +300/+300', () => {
  const g = duel({ board: [{ hand: ['Machine Conversion Factory'], m: ['Cyber Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Machine Conversion Factory'); settle(g, 'Cyber Dragon');
  const c = on(g, 0, 'Cyber Dragon'); ok(E.atk(g, c) === 2400 && E.def(g, c) === 1900, `${E.atk(g, c)}/${E.def(g, c)}`);
  const g2 = duel({ board: [{ hand: ['Machine Conversion Factory'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Machine Conversion Factory'), 'not on a non-Machine');
});
T('Machine King and Prototype: +100 per Machine', () => {
  const g = duel({ board: [{ m: ['Machine King', 'Machine King Prototype', 'Cyber Dragon'], turn: 2 }, { m: ['Jinzo', FILL] }] });
  const k = on(g, 0, 'Machine King'), pr = on(g, 0, 'Machine King Prototype');
  ok(E.atk(g, k) === 2600, `Machine King ${E.atk(g, k)} (4 Machines incl. itself)`);
  ok(E.atk(g, pr) === 1900 && E.def(g, pr) === 1800, `Prototype ${E.atk(g, pr)}/${E.def(g, pr)} (3 others)`);
});
T('Machine Lord Ur: attacks every monster, no battle damage to the opponent', () => {
  const g = duel({ board: [{ m: ['Machine Lord Ur'], turn: 2 }, { m: ['Mystical Elf', 'Mega Thunderball'] }] });
  bp(g); atkOn(g, 0, 'Machine Lord Ur', 'Mystical Elf'); atkOn(g, 0, 'Machine Lord Ur', 'Mega Thunderball');
  ok(inZ(g, 1, 'gy', 'Mystical Elf') && inZ(g, 1, 'gy', 'Mega Thunderball') && lp(g, 1) === 8000, `both destroyed, B ${lp(g, 1)}`);
});
T('Mad Archfiend: piercing; turns to Defense when targeted', () => {
  const g = duel({ board: [{ m: ['Mad Archfiend'], turn: 2 }, { m: [{ n: 'Mega Thunderball', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Mad Archfiend', 'Mega Thunderball');
  ok(lp(g, 1) === 6800, `1200 piercing (${lp(g, 1)})`);
  const g2 = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Mad Archfiend'] }] });
  bp(g2); atkOn(g2, 0, FILL, 'Mad Archfiend');
  ok(inZ(g2, 1, 'gy', 'Mad Archfiend') && lp(g2, 1) === 8000, `changed to Defense, no damage (B ${lp(g2, 1)})`);
});
T('Mad Reloader: destroyed by battle, send 2 from hand, draw 2', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { hand: ['Sangan', 'Pot of Greed'], m: ['Mad Reloader'] }] });
  bp(g); atkOn(g, 0, FILL, 'Mad Reloader', 'Sangan', 'Pot of Greed');
  ok(inZ(g, 1, 'gy', 'Sangan') && inZ(g, 1, 'gy', 'Pot of Greed') && g.p[1].hand.length === 2, `sent 2, drew 2 (hand ${g.p[1].hand.length})`);
});
T('Mad Sword Beast: piercing', () => {
  const g = duel({ board: [{ m: ['Mad Sword Beast'], turn: 2 }, { m: [{ n: 'Mega Thunderball', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Mad Sword Beast', 'Mega Thunderball');
  ok(lp(g, 1) === 7200, `800 piercing (${lp(g, 1)})`);
});
T('Magic Drain: negates a Spell unless a Spell is discarded', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', FILL], turn: 2 }, { st: ['Magic Drain'] }] });
  act(g, 0, 'Pot of Greed'); settle(g, 'Magic Drain');
  ok(inZ(g, 0, 'gy', 'Pot of Greed') && g.p[0].hand.length === 2, `Pot negated (hand ${g.p[0].hand.length})`);
  const g2 = duel({ board: [{ hand: ['Pot of Greed', 'Heavy Storm'], turn: 2 }, { st: ['Magic Drain'] }] });
  act(g2, 0, 'Pot of Greed'); settle(g2, 'Magic Drain', 'Heavy Storm');
  ok(inZ(g2, 0, 'gy', 'Heavy Storm') && g2.p[0].hand.length === 3, `A discarded Heavy Storm, Pot resolved (hand ${g2.p[0].hand.length})`);
});
T('Magic Formula: Dark Magician +700, 1000 LP when sent to the GY', () => {
  const g = duel({ board: [{ hand: ['Magic Formula', 'Mystical Space Typhoon'], m: ['Dark Magician'], turn: 2 }, {}] });
  act(g, 0, 'Magic Formula'); settle(g, 'Dark Magician');
  ok(E.atk(g, on(g, 0, 'Dark Magician')) === 3200, 'Dark Magician 3200');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Magic Formula');
  ok(lp(g, 0) === 9000, `gained 1000 (${lp(g, 0)})`);
});
T('Magic Hole Golem: halve ATK, direct attack, only that monster attacks', () => {
  const g = duel({ board: [{ m: ['Magic Hole Golem', FILL, 'Cyber Dragon'], turn: 2 }, { m: ['Labyrinth Wall'] }] });
  act(g, 0, 'Magic Hole Golem'); settle(g, FILL);
  const w = on(g, 0, FILL); ok(E.atk(g, w) === 1000, 'Warwolf 1000');
  bp(g);
  ok(canAtk(g, w, null) && !canAtk(g, on(g, 0, 'Cyber Dragon'), on(g, 1, 'Labyrinth Wall')), 'Warwolf attacks directly, Cyber Dragon cannot attack');
  atkOn(g, 0, FILL, null); ok(lp(g, 1) === 7000, `B ${lp(g, 1)}`);
});
T('Magic Jammer: discard 1, negate a Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { hand: ['Sangan'], st: ['Magic Jammer'] }] });
  act(g, 0, 'Pot of Greed'); settle(g, 'Magic Jammer', 'Sangan');
  ok(inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 1, 'gy', 'Sangan') && g.p[0].hand.length === 1, 'Pot negated, Sangan discarded');
});
T('Magic Reflector: a counter saves the Spell from destruction', () => {
  const g = duel({ board: [{ hand: ['Magic Reflector', 'Heavy Storm'], st: [{ n: 'Level Limit - Area B', pos: 'up' }], turn: 2 }, {}] });
  act(g, 0, 'Magic Reflector'); settle(g, 'Level Limit - Area B');
  act(g, 0, 'Heavy Storm'); settle(g);
  ok(inZ(g, 0, 'st', 'Level Limit - Area B'), 'Level Limit - Area B survived Heavy Storm');
});
T('Magical Arm Shield: take a monster, it is attacked instead', () => {
  const g = duel({ board: [{ m: [FILL, 'Cyber Dragon'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }], st: ['Magical Arm Shield'] }] });
  bp(g); atkOn(g, 0, FILL, 'Mystical Elf', 'Magical Arm Shield', 'Cyber Dragon');
  ok(inZ(g, 0, 'gy', FILL) && lp(g, 0) === 7900, `Warwolf destroyed by its own Cyber Dragon, A ${lp(g, 0)}`);
  choose(g, 'endbp'); settle(g);
  ok(on(g, 0, 'Cyber Dragon'), 'Cyber Dragon back to A after the Battle Phase');
});
T('Magical Blast: 200 per Spellcaster; returns instead of the draw', () => {
  const g = duel({ board: [{ hand: ['Magical Blast'], m: ['Mystical Elf', 'Dark Magician', FILL], turn: 2 }, {}] });
  act(g, 0, 'Magical Blast'); settle(g);
  ok(lp(g, 1) === 7600, `400 damage (${lp(g, 1)})`);
  const g3 = duel({ board: [{ gy: ['Magical Blast'], turn: 1 }, {}] });
    choose(g3, 'yes'); settle(g3);
  ok(inZ(g3, 0, 'hand', 'Magical Blast') && g3.p[0].hand.length === 6 && g3.p[0].deck.length === 35, `added instead of the draw (hand ${g3.p[0].hand.length}, deck ${g3.p[0].deck.length}/35)`);
});
T('Magical Citadel of Endymion: counters from Spells, removes one to survive', () => {
  const g = duel({ board: [{ hand: ['Magical Citadel of Endymion', 'Pot of Greed', 'Heavy Storm'], turn: 2 }, {}] });
  act(g, 0, 'Magical Citadel of Endymion'); settle(g);
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(ctrOf(g.p[0].fz, 'spell') === 1, `1 Spell Counter (${JSON.stringify(g.p[0].fz && g.p[0].fz.ctr)})`);
  act(g, 0, 'Heavy Storm'); settle(g);
  ok(fz(g, 0, 'Magical Citadel of Endymion'), 'Citadel survived Heavy Storm');
});
T('Magical Dimension: Tribute, Special Summon a Spellcaster, destroy 1', () => {
  const g = duel({ board: [{ hand: ['Magical Dimension', 'Dark Magician'], m: ['Mystical Elf', FILL], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Magical Dimension'); settle(g, 'Cyber Dragon', FILL, 'Dark Magician', 'Attack');
  ok(on(g, 0, 'Dark Magician') && inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Cyber Dragon'), 'Warwolf Tributed, Dark Magician summoned, Cyber Dragon destroyed');
});
T('Magical Exemplar: 2 counters per Spell, summons a Spellcaster of that Level', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Old Vindictive Magician'], m: ['Magical Exemplar'], turn: 2 }, {}] });
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(ctrOf(on(g, 0, 'Magical Exemplar'), 'spell') === 2, '2 counters');
  act(g, 0, 'Magical Exemplar'); settle(g, '2', 'Old Vindictive Magician', 'Attack');
  ok(on(g, 0, 'Old Vindictive Magician'), 'Old Vindictive Magician (Level 2) Special Summoned');
});
T('Magical Explosion: empty hand, 200 per Spell in the GY', () => {
  const g = duel({ board: [{ hand: [], st: ['Magical Explosion'], gy: ['Pot of Greed', 'Heavy Storm', 'Mystical Space Typhoon', 'Mirror Force'], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Magical Explosion'), 'cannot activate with a card in hand');
  ns(g, 0, FILL);
  act(g, 0, 'Magical Explosion'); settle(g);
  ok(lp(g, 1) === 7400, `600 damage (${lp(g, 1)})`);
});
T('Magical Hats: 2 Spells/Traps from the Deck become face-down monsters until the end of the Battle Phase', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Mystical Elf'], st: ['Magical Hats'], deckTop: ['Pot of Greed', 'Heavy Storm'] }] });
  choose(g, 'bp'); settle(g, 'Magical Hats', 'Pot of Greed', 'Heavy Storm', 'Mystical Elf');
  ok(cnt(g, 1, 'm') === 3 && g.p[1].m.every(c => !c || c.pos === 'set'), `3 face-down monsters (${g.p[1].m.filter(Boolean).map(c => E.name(c) + ':' + c.pos).join(', ')})`);
  choose(g, 'endbp'); settle(g);
  ok(inZ(g, 1, 'gy', 'Pot of Greed') && inZ(g, 1, 'gy', 'Heavy Storm') && on(g, 1, 'Mystical Elf'), 'the 2 cards destroyed at the end of the Battle Phase');
});
T('Magical Labyrinth: Tribute Labyrinth Wall for Wall Shadow', () => {
  const g = duel({ board: [{ hand: ['Magical Labyrinth'], m: ['Labyrinth Wall'], deckTop: [FILL, 'Wall Shadow'], turn: 2 }, {}] });
  act(g, 0, 'Magical Labyrinth'); settle(g, 'Labyrinth Wall');
  act(g, 0, 'Magical Labyrinth'); settle(g, 'Wall Shadow', 'Attack');
  ok(on(g, 0, 'Wall Shadow') && inZ(g, 0, 'gy', 'Labyrinth Wall'), 'Wall Shadow summoned');
});
T('Magical Mallet: shuffle cards in, draw the same number', () => {
  const g = duel({ board: [{ hand: ['Magical Mallet', 'Sangan', 'Pot of Greed'], turn: 2 }, {}] });
  const d0 = g.p[0].deck.length;
  act(g, 0, 'Magical Mallet'); settle(g, 'Sangan', 'Pot of Greed');
  ok(g.p[0].hand.length === 3 && g.p[0].deck.length === d0, `hand ${g.p[0].hand.length}, deck ${g.p[0].deck.length}/${d0}`);
});
T('Magical Marionette: counters give ATK, remove 2 to destroy', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Pot of Greed'], m: ['Magical Marionette'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Pot of Greed'); settle(g);
  const mm = on(g, 0, 'Magical Marionette'); ok(E.atk(g, mm) === 2200, `2200 (${E.atk(g, mm)})`);
  act(g, 0, 'Pot of Greed'); settle(g);
  act(g, 0, 'Magical Marionette'); settle(g, 'Cyber Dragon');
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && ctrOf(mm, 'spell') === 0, 'Cyber Dragon destroyed, counters removed');
});
T('Magical Plant Mandragola: 1 Spell Counter on each face-up card that takes one', () => {
  const g = duel({ board: [{ m: [{ n: 'Magical Plant Mandragola', pos: 'set' }, 'Magical Marionette'], turn: 2 }, { m: ['Breaker the Magical Warrior'] }] });
  choose(g, 'flip:' + on(g, 0, 'Magical Plant Mandragola').u); settle(g);
  ok(ctrOf(on(g, 0, 'Magical Marionette'), 'spell') === 1 && ctrOf(on(g, 1, 'Breaker the Magical Warrior'), 'spell') === 1, 'both got a counter');
});
T('Magical Reflect Slime: Gemini, the opponent takes its battle damage', () => {
  const g = duel({ board: [{ m: ['Magical Reflect Slime'], turn: 2 }, { m: [FILL] }] });
  choose(g, 'gem:'); settle(g);
  bp(g); atkOn(g, 0, 'Magical Reflect Slime', FILL);
  ok(lp(g, 0) === 8000 && lp(g, 1) === 6700, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ m: ['Magical Reflect Slime'], turn: 2 }, { m: [FILL] }] });
  bp(g2); atkOn(g2, 0, 'Magical Reflect Slime', FILL);
  ok(lp(g2, 0) === 6700, `not Gemini Summoned: A takes it (${lp(g2, 0)})`);
});
T('Magical Scientist: pay 1000, Level 6 Fusion, no direct attack, back at the end', () => {
  const g = duel({ ex0: ['Metal Dragon'], board: [{ m: ['Magical Scientist'], turn: 2 }, {}] });
  act(g, 0, 'Magical Scientist'); settle(g, 'Metal Dragon', 'Attack');
  const md = on(g, 0, 'Metal Dragon'); ok(md && lp(g, 0) === 7000, 'Metal Dragon summoned, paid 1000');
  bp(g); ok(!canAtk(g, md, null), 'no direct attack');
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(inZ(g, 0, 'extra', 'Metal Dragon'), 'returned to the Extra Deck');
});
T('Magical Thorn: 500 per card the opponent discards', () => {
  const g = duel({ board: [{ hand: ['Card Destruction', 'Sangan'], st: [{ n: 'Magical Thorn', pos: 'up' }], turn: 2 }, { hand: [FILL, FILL, FILL] }] });
  act(g, 0, 'Card Destruction'); settle(g);
  ok(lp(g, 1) === 6500 && lp(g, 0) === 8000, `B ${lp(g, 1)}, A ${lp(g, 0)}`);
});
T('Malevolent Catastrophe: on an attack, destroy all Spells and Traps', () => {
  const g = duel({ board: [{ m: [FILL], st: ['Pot of Greed'], turn: 2 }, { st: ['Malevolent Catastrophe', 'Mirror Force'] }] });
  bp(g); atkOn(g, 0, FILL, null, 'Malevolent Catastrophe');
  ok(inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 1, 'gy', 'Mirror Force'), 'all Spells and Traps destroyed');
});
T('Malevolent Nuzzler: +700, pay 500 to return to the top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Malevolent Nuzzler', 'Mystical Space Typhoon'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Malevolent Nuzzler'); settle(g, FILL);
  ok(E.atk(g, on(g, 0, FILL)) === 2700, 'Warwolf 2700');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Malevolent Nuzzler');
  const top = g.p[0].deck[g.p[0].deck.length - 1];
  ok(lp(g, 0) === 7500 && E.name(top) === 'Malevolent Nuzzler', `paid 500, Nuzzler on top (${lp(g, 0)})`);
});
T('Malice Ascendant: mills 1 per Ascendant in your GY in the opponent Standby Phase', () => {
  const g = duel({ board: [{ m: ['Malice Ascendant'], gy: ['Malice Ascendant', 'Malice Ascendant'], turn: 2 }, {}] });
  endTurn(g);
  ok(cnt(g, 1, 'gy') === 2, `B milled 2 (${cnt(g, 1, 'gy')})`);
});
T('Malice Dispersion: discard 1, destroy face-up Continuous Traps', () => {
  const g = duel({ board: [{ hand: ['Malice Dispersion', 'Sangan'], turn: 2 }, { st: [{ n: 'Royal Decree', pos: 'up' }, 'Call of the Haunted'] }] });
  act(g, 0, 'Malice Dispersion'); settle(g, 'Sangan');
  ok(inZ(g, 1, 'gy', 'Royal Decree') && inZ(g, 1, 'st', 'Call of the Haunted') && inZ(g, 0, 'gy', 'Sangan'), 'Royal Decree destroyed, the Set card stays');
});
T('Malice Doll of Demise: returns in the next Standby Phase after a Continuous Spell sends it', () => {
  const g = duel({ board: [{ m: ['Malice Doll of Demise'], st: [{ n: 'Ectoplasmer', pos: 'up' }], turn: 2 }, {}] });
  endTurn(g, 'Malice Doll of Demise');
  ok(inZ(g, 0, 'gy', 'Malice Doll of Demise'), 'Tributed by Ectoplasmer');
  endTurn(g, 'Malice Doll of Demise', 'Attack');
  ok(on(g, 0, 'Malice Doll of Demise'), 'back in A\'s Standby Phase');
});
T('Mask of Brutality: +1000 ATK -1000 DEF, pay 1000 in Standby', () => {
  const g = duel({ board: [{ hand: ['Mask of Brutality'], m: ['Mystical Elf'], turn: 2 }, {}] });
  act(g, 0, 'Mask of Brutality'); settle(g, 'Mystical Elf');
  const e = on(g, 0, 'Mystical Elf'); ok(E.atk(g, e) === 1800 && E.def(g, e) === 1000, `${E.atk(g, e)}/${E.def(g, e)}`);
  toMain(g);
  ok(lp(g, 0) === 7000 && inZ(g, 0, 'st', 'Mask of Brutality'), `paid 1000 (${lp(g, 0)})`);
});
T('Mask of Darkness: FLIP adds a Trap from the GY', () => {
  const g = duel({ board: [{ m: [{ n: 'Mask of Darkness', pos: 'set' }], gy: ['Mirror Force'], turn: 2 }, {}] });
  choose(g, 'flip:' + on(g, 0, 'Mask of Darkness').u); settle(g, 'Mirror Force');
  ok(inZ(g, 0, 'hand', 'Mirror Force'), 'Mirror Force added');
});
T('Mask of Dispel: the Spell controller takes 500 in your Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Mask of Dispel'], turn: 2 }, { st: [{ n: 'Level Limit - Area B', pos: 'up' }] }] });
  act(g, 0, 'Mask of Dispel'); settle(g, 'Level Limit - Area B');
  toMain(g);
  ok(lp(g, 1) === 7500, `B took 500 (${lp(g, 1)})`);
});
T('Mask of the Accursed: equipped cannot attack, 500 to its controller', () => {
  const g = duel({ board: [{ hand: ['Mask of the Accursed'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Mask of the Accursed'); settle(g, 'Cyber Dragon');
  endTurn(g); bp(g);
  ok(!canAtk(g, on(g, 1, 'Cyber Dragon'), null), 'Cyber Dragon cannot attack');
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(lp(g, 1) === 7500, `B took 500 (${lp(g, 1)})`);
});
T('Mask of Weakness: attacker loses 700', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Luster Dragon'], st: ['Mask of Weakness'] }] });
  bp(g); atkOn(g, 0, FILL, 'Luster Dragon', 'Mask of Weakness');
  ok(inZ(g, 0, 'gy', FILL) && lp(g, 0) === 7400, `Warwolf destroyed, A ${lp(g, 0)}`);
});
T('Masked Beast Des Gardius: summoned with Grand Tiki Elder, equips The Mask of Remnants', () => {
  const g = duel({ board: [{ hand: ['Masked Beast Des Gardius', 'Masked Beast Des Gardius'], m: ['Grand Tiki Elder', FILL], deckTop: [FILL, 'The Mask of Remnants'], turn: 2 }, { m: ['Cyber Dragon'], st: ['Mirror Force'] }] });
  const h = card(g, 0, 'Masked Beast Des Gardius');
  ok(!hasOpt(g, 'ns:' + h.u) && !hasOpt(g, 'set:' + h.u), 'no Normal Summon');
  choose(g, 'sp:' + h.u); settle(g, 'Grand Tiki Elder', FILL, 'Attack');
  ok(on(g, 0, 'Masked Beast Des Gardius'), 'Special Summoned');
  bp(g); atkOn(g, 0, 'Masked Beast Des Gardius', 'Cyber Dragon', 'Mirror Force', 'Cyber Dragon');
  ok(inZ(g, 0, 'gy', 'Masked Beast Des Gardius'), 'destroyed by Mirror Force');
  const mask = card(g, 0, 'The Mask of Remnants') || card(g, 1, 'The Mask of Remnants');
  ok(mask && mask.zone === 'st' && mask.equipTo, `The Mask of Remnants equipped (${mask && mask.zone})`);
  const g2 = duel({ board: [{ hand: ['Masked Beast Des Gardius'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Masked Beast Des Gardius').u), 'no Tiki or Melchid, no summon');
});
T('Masked Chopper: 2000 damage when it destroys a monster', () => {
  const g = duel({ board: [{ m: ['Masked Chopper'], turn: 2 }, { m: [{ n: 'Light Effigy', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Masked Chopper', 'Light Effigy');
  ok(lp(g, 1) === 6000, `B ${lp(g, 1)}`);
});
T('Masked Dragon: Special Summons a Dragon with 1500 or less ATK', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Masked Dragon'], deckTop: ['Armed Dragon LV3'] }] });
  bp(g); atkOn(g, 0, FILL, 'Masked Dragon', 'Armed Dragon LV3', 'Attack');
  ok(on(g, 1, 'Armed Dragon LV3'), 'Armed Dragon LV3 summoned');
});
T('Masked Sorcerer: draws when it deals battle damage', () => {
  const g = duel({ board: [{ m: ['Masked Sorcerer'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; bp(g); atkOn(g, 0, 'Masked Sorcerer', null);
  ok(g.p[0].hand.length === h + 1 && lp(g, 1) === 7100, `drew 1 (hand ${g.p[0].hand.length})`);
});
T('Master Gig: pay 1000, destroy 1 per face-up Psychic', () => {
  const g = duel({ board: [{ m: ['Master Gig', 'Psychic Snail'], turn: 2 }, { m: ['Cyber Dragon', 'Luster Dragon', FILL] }] });
  act(g, 0, 'Master Gig'); settle(g, 'Cyber Dragon', 'Luster Dragon');
  ok(lp(g, 0) === 7000 && cnt(g, 1, 'm') === 1, `paid 1000, 2 destroyed (B has ${cnt(g, 1, 'm')})`);
});
T('Master Monk: summoned by Tributing Monk Fighter, attacks twice', () => {
  const g = duel({ board: [{ hand: ['Master Monk'], m: ['Monk Fighter'], turn: 2 }, {}] });
  const h = card(g, 0, 'Master Monk'); ok(!hasOpt(g, 'ns:' + h.u), 'no Normal Summon');
  choose(g, 'sp:' + h.u); settle(g, 'Monk Fighter', 'Attack');
  ok(on(g, 0, 'Master Monk'), 'Special Summoned');
  bp(g); atkOn(g, 0, 'Master Monk', null); atkOn(g, 0, 'Master Monk', null);
  ok(lp(g, 1) === 4200, `2 attacks (${lp(g, 1)})`);
});
T('Master of Oz: Fusion of Big Koala + Des Kangaroo', () => {
  const g = duel({ ex0: ['Master of Oz'], board: [{ hand: ['Polymerization', 'Big Koala', 'Des Kangaroo'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Master of Oz', 'Big Koala', 'Des Kangaroo', 'Attack');
  const o = on(g, 0, 'Master of Oz'); ok(o && E.atk(g, o) === 4200, 'Master of Oz 4200');
});
T('Metal Detector: negates Continuous Traps this turn', () => {
  const g = duel({ board: [{ st: ['Call of the Haunted', 'Metal Detector'], gy: ['Cyber Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Call of the Haunted'); settle(g, 'Metal Detector', 'Cyber Dragon');
  ok(!on(g, 0, 'Cyber Dragon'), 'Call of the Haunted negated');
});
T('Metal Dragon: Fusion of Steel Ogre Grotto 1 + Lesser Dragon', () => {
  const g = duel({ ex0: ['Metal Dragon'], board: [{ hand: ['Polymerization', 'Steel Ogre Grotto 1', 'Lesser Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Metal Dragon', 'Steel Ogre Grotto 1', 'Lesser Dragon', 'Attack');
  ok(on(g, 0, 'Metal Dragon'), 'Metal Dragon summoned');
});
T('Metal Shooter: 2 counters on Normal Summon, survives an effect by losing one', () => {
  const g = duel({ board: [{ hand: ['Metal Shooter', 'Dark Hole'], m: [FILL], turn: 2 }, {}] });
  ns(g, 0, 'Metal Shooter', FILL);
  const s = on(g, 0, 'Metal Shooter'); ok(s && E.atk(g, s) === 2400, `2400 (${s && E.atk(g, s)})`);
  act(g, 0, 'Dark Hole'); settle(g);
  ok(on(g, 0, 'Metal Shooter') && E.atk(g, s) === 1600, `survived with 1600 (${E.atk(g, s)})`);
});
T('Metallizing Parasite - Lunatite: equips as a Union', () => {
  const g = duel({ board: [{ m: ['Metallizing Parasite - Lunatite', FILL], turn: 2 }, {}] });
  act(g, 0, 'Metallizing Parasite - Lunatite'); settle(g, FILL);
  const l = card(g, 0, 'Metallizing Parasite - Lunatite'), w = on(g, 0, FILL);
  ok(l.zone === 'st' && l.equipTo === w.u, 'equipped to the Warwolf');
});
T('Mind Haxorz: pay 500', () => {
  const g = duel({ board: [{ st: ['Mind Haxorz'], turn: 2 }, { hand: [FILL] }] });
  act(g, 0, 'Mind Haxorz'); settle(g);
  ok(lp(g, 0) === 7500 && inZ(g, 0, 'gy', 'Mind Haxorz'), `paid 500 (${lp(g, 0)})`);
});
T('Mind Master: pay 800 + Tribute a Psychic, summon a Level 4 Psychic from the Deck', () => {
  const g = duel({ board: [{ m: ['Mind Master', 'Psychic Snail'], deckTop: [FILL, 'Destructotron'], turn: 2 }, {}] });
  act(g, 0, 'Mind Master'); settle(g, 'Psychic Snail', 'Destructotron');
  const d = on(g, 0, 'Destructotron');
  ok(d && d.pos === 'atk' && lp(g, 0) === 7200 && inZ(g, 0, 'gy', 'Psychic Snail'), 'Destructotron in Attack Position, paid 800');
});
T('Mind on Air: can be Tribute Summoned', () => {
  const g = duel({ board: [{ hand: ['Mind on Air'], m: [FILL], turn: 2 }, {}] });
  ns(g, 0, 'Mind on Air', FILL); ok(on(g, 0, 'Mind on Air'), 'summoned');
});
T('Mind Over Matter: Tribute a Psychic, negate a Summon', () => {
  const g = duel({ board: [{ hand: [FILL], turn: 2 }, { m: ['Psychic Snail'], st: ['Mind Over Matter'] }] });
  ns(g, 0, FILL, 'Mind Over Matter', 'Psychic Snail');
  ok(!on(g, 0, FILL) && inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Psychic Snail'), 'Summon negated, Snail Tributed');
});
T('Mind Trust: Tribute a Level 4, add a Level 2 or lower Tuner', () => {
  const g = duel({ board: [{ hand: ['Mind Trust'], m: [FILL], gy: ['Krebons', 'Psychic Commander'], turn: 2 }, {}] });
  act(g, 0, 'Mind Trust'); settle(g, FILL, 'Psychic Commander', 'Krebons');
  ok(inZ(g, 0, 'hand', 'Krebons') && inZ(g, 0, 'gy', 'Psychic Commander') && inZ(g, 0, 'gy', FILL), 'Krebons added, not the Level 3 Commander');
});
T('Mind Wipe: opponent with 3 or fewer shuffles the hand in and draws that many', () => {
  const g = duel({ board: [{ hand: ['Mind Wipe'], turn: 2 }, { hand: ['Sangan', 'Pot of Greed', 'Mystical Space Typhoon'] }] });
  const d = g.p[1].deck.length;
  act(g, 0, 'Mind Wipe'); settle(g);
  ok(g.p[1].hand.length === 3 && g.p[1].deck.length === d && inZ(g, 0, 'gy', 'Mind Wipe'), `B hand ${g.p[1].hand.length}, deck ${g.p[1].deck.length}/${d}`);
  const g2 = duel({ board: [{ hand: ['Mind Wipe'], turn: 2 }, { hand: [FILL, FILL, FILL, FILL] }] });
  ok(!canAct(g2, 0, 'Mind Wipe'), 'not with 4 cards');
});
console.log(fails ? `\n${fails} failed` : '\nAll review checks passed.');
process.exit(fails ? 1 : 0);
