// Independent review checks for full pool batch 35 (written from the card text): node build/review_full-35.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior Level 4 2000/100
let lastG; function duel(o = {}) {
  const mk = (ex, n) => ({ name: 't', main: Array(n || 40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0, o.n0), mk(o.ex1, o.n1)], first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
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
const LV = c => E.lib.lv(c);
const up = n => ({ n, pos: 'up' });
const idle = g => g.prompt && g.prompt.type === 'idle';
const toIdle = (g, ...picks) => { for (let i = 0; i < 10 && g.prompt && !idle(g) && g.prompt.type !== 'battle'; i++) settle(g, ...picks); };
const optsFor = (g, c) => g.prompt ? g.prompt.opts.filter(x => x.u === c.u || x.key.split(':')[1] === String(c.u)) : [];
const hand = (g, p) => g.p[p].hand.length;
const ign = (g, c, ...picks) => { const o = optsFor(g, c).find(x => x.key.startsWith('a:')); if (!o) throw new Error('no effect option for ' + E.name(c)); E.act(g, [o.key]); settle(g, ...picks); };
const hasIgn = (g, c) => optsFor(g, c).some(x => x.key.startsWith('a:'));
const mons = (g, p) => g.p[p].m.filter(Boolean);
const W = FILL, CG = 'Celtic Guardian', ELF = 'Mystical Elf', BEWD = 'Blue-Eyes White Dragon';
const set = n => ({ n, pos: 'set' }), dpos = n => ({ n, pos: 'def' });
const ctrs = c => c && c.ctr ? Object.values(c.ctr).reduce((a, b) => a + (+b || 0), 0) : 0;
const turns = (g, n, ...picks) => { for (let i = 0; i < n; i++) { toIdle(g, ...picks); endTurn(g, ...picks); } toIdle(g, ...picks); };
const MST = 'Mystical Space Typhoon', DH = 'Dark Hole';

T('Advanced Ritual Art: Normal Monsters from the Deck for a Ritual Summon', () => {
  const g = duel({ board: [{ hand: ['Advanced Ritual Art', 'Black Luster Soldier'], turn: 2 }, {}] });
  const d = g.p[0].deck.length;
  act(g, 0, 'Advanced Ritual Art'); settle(g, 'Black Luster Soldier', W, W, 'Attack'); toIdle(g);
  ok(!!on(g, 0, 'Black Luster Soldier') && cnt(g, 0, 'gy', W) === 2 && g.p[0].deck.length === d - 2, `BLS summoned, ${cnt(g, 0, 'gy', W)} Warwolves from the Deck`);
});
T('Aegis of Gaia: gain 3000, lose 3000 when it leaves', () => {
  const g = duel({ board: [{ hand: [MST], st: ['Aegis of Gaia'], turn: 2 }, {}] });
  act(g, 0, 'Aegis of Gaia'); settle(g); toIdle(g);
  ok(lp(g, 0) === 11000, `A ${lp(g, 0)}`);
  act(g, 0, MST); settle(g, 'Aegis of Gaia'); toIdle(g);
  ok(lp(g, 0) === 8000 && inZ(g, 0, 'gy', 'Aegis of Gaia'), `A ${lp(g, 0)} after it left`);
});
T('Aegis of the Ocean Dragon Lord: Level 3 or lower WATER survive Dark Hole', () => {
  const g = duel({ board: [{ hand: [DH], m: ['The Six Samurai - Yaichi', W], st: ['Aegis of the Ocean Dragon Lord'], turn: 2 }, {}] });
  act(g, 0, 'Aegis of the Ocean Dragon Lord'); settle(g); toIdle(g);
  act(g, 0, DH); settle(g); toIdle(g);
  ok(!!on(g, 0, 'The Six Samurai - Yaichi') && !on(g, 0, W), 'Yaichi stays, Warwolf destroyed');
});
T('Against the Wind: take damage equal to the Blackwing ATK, add it', () => {
  const g = duel({ board: [{ hand: ['Against the Wind'], gy: ['Blackwing - Bora the Spear'], turn: 2 }, {}] });
  act(g, 0, 'Against the Wind'); settle(g, 'Bora'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Blackwing - Bora the Spear') && lp(g, 0) === 6300, `Bora added, A ${lp(g, 0)}`);
});
T('Alchemist of Black Spells: to Defense, Spell Counter on a card', () => {
  const g = duel({ board: [{ m: ['Alchemist of Black Spells', 'Royal Magical Library'], turn: 2 }, {}] });
  const a = on(g, 0, 'Alchemist of Black Spells'); ign(g, a, 'Royal Magical Library'); toIdle(g);
  ok(a.pos === 'def' && E.lib.ctr(on(g, 0, 'Royal Magical Library'), 'spell') === 1, `Alchemist ${a.pos}, Library ${E.lib.ctr(on(g, 0, 'Royal Magical Library'), 'spell')}`);
  ok(!hasIgn(g, a), 'not again from Defense');
});
T('Alchemy Cycle: original ATK 0, draw when one dies in battle', () => {
  const g = duel({ board: [{ m: [W], st: ['Alchemy Cycle'], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'Alchemy Cycle'); settle(g); toIdle(g);
  ok(E.atk(g, on(g, 0, W)) === 0, `Warwolf ATK ${E.atk(g, on(g, 0, W))}`);
  const h = hand(g, 0); bp(g); atkOn(g, 0, W, CG, 'yes'); toIdle(g, 'yes');
  ok(inZ(g, 0, 'gy', W) && hand(g, 0) === h + 1, `Warwolf destroyed, drew ${hand(g, 0) - h}`);
});
T('All-Out Attacks: Special Summoned monster goes to Attack Position', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], st: [up('All-Out Attacks')], turn: 2 }, { gy: [CG] }] });
  act(g, 0, 'Monster Reborn'); settle(g, CG, 'Defense'); toIdle(g, 'yes');
  const c = on(g, 0, CG); ok(c && c.pos === 'atk', `Celtic ${c && c.pos}`);
});
T('Ally of Justice Garadholg: +200 vs LIGHT', () => {
  const g = duel({ board: [{ m: ['Ally of Justice Garadholg'], turn: 2 }, { m: [ELF] }] });
  bp(g); atkOn(g, 0, 'Ally of Justice Garadholg', ELF); toIdle(g);
  ok(lp(g, 1) === 7000, `B ${lp(g, 1)}`);
});
T('Ally of Justice Rudra: +700 vs LIGHT', () => {
  const g = duel({ board: [{ m: ['Ally of Justice Rudra'], turn: 2 }, { m: ['Shining Angel'] }] });
  bp(g); atkOn(g, 0, 'Ally of Justice Rudra', 'Shining Angel', 'NO'); toIdle(g, 'NO');
  ok(lp(g, 1) === 6800, `B ${lp(g, 1)}`);
});
T('Ambulance Rescueroid: Fusion Summon, revives a monster destroyed by battle', () => {
  const g = duel({ ex0: ['Ambulance Rescueroid'], board: [{ hand: ['Polymerization', 'Rescueroid', 'Ambulanceroid'], m: [W], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Polymerization'); settle(g, 'Ambulance Rescueroid', 'Rescueroid', 'Ambulanceroid', 'Attack'); toIdle(g);
  ok(!!on(g, 0, 'Ambulance Rescueroid'), 'Fusion Summoned');
  bp(g); atkOn(g, 0, W, BEWD, 'yes', W); toIdle(g, 'yes', W);
  const w = on(g, 0, W); ok(w && w.pos === 'def', `Warwolf back in Defense (${w && w.pos})`);
});
T('Ambulanceroid: roid added from GY to hand can be Special Summoned', () => {
  const g = duel({ board: [{ hand: ['Monster Reincarnation', 'Pot of Greed'], m: ['Ambulanceroid'], gy: ['Gyroid'], turn: 2 }, {}] });
  act(g, 0, 'Monster Reincarnation'); settle(g, 'Pot of Greed', 'Gyroid', 'yes', 'Attack'); toIdle(g, 'yes', 'Attack');
  ok(!!on(g, 0, 'Gyroid'), 'Gyroid Special Summoned');
});
T('Ambush Fangs: negate attack on a Venom, end BP, Venom Counter', () => {
  const g = duel({ board: [{ m: [W], turn: 2 }, { m: ['Venom Snake'], st: ['Ambush Fangs'] }] });
  bp(g); atkOn(g, 0, W, 'Venom Snake', 'Ambush Fangs'); toIdle(g);
  ok(!!on(g, 1, 'Venom Snake') && lp(g, 1) === 8000 && E.lib.ctr(on(g, 0, W), 'venom') === 1, `Snake alive, Warwolf counters ${E.lib.ctr(on(g, 0, W), 'venom')}`);
  ok(g.phase !== 'battle', `phase ${g.phase}`);
});
T('Amphibious Bugroth: Fusion Summon from its materials', () => {
  const g = duel({ ex0: ['Amphibious Bugroth'], board: [{ hand: ['Polymerization', 'Ground Attacker Bugroth', 'Mother Grizzly'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Polymerization'), 'Polymerization activatable with Ground Attacker Bugroth + Mother Grizzly');
  if (canAct(g, 0, 'Polymerization')) { act(g, 0, 'Polymerization'); settle(g, 'Amphibious Bugroth', 'Ground Attacker Bugroth', 'Mother Grizzly', 'Attack'); toIdle(g); }
  ok(!!on(g, 0, 'Amphibious Bugroth'), 'Amphibious Bugroth summoned');
});
T('Amulet of Ambition: +500 per Level difference, back to Deck top', () => {
  const g = duel({ board: [{ hand: ['Amulet of Ambition', MST], m: [CG], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Amulet of Ambition'); settle(g, CG); toIdle(g);
  ok(E.atk(g, on(g, 0, CG)) === 1400, 'no bonus outside battle');
  bp(g); atkOn(g, 0, CG, BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && lp(g, 1) === 7600 && !!on(g, 0, CG), `BEWD destroyed, B ${lp(g, 1)}`);
  if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g); }
  act(g, 0, MST); settle(g, 'Amulet of Ambition', 'yes'); toIdle(g, 'yes');
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Amulet of Ambition', 'Amulet on top of the Deck');
});
T('An Unfortunate Report: opponent conducts two Battle Phases', () => {
  const g = duel({ first: 1, board: [{ m: [W], turn: 2 }, { st: ['An Unfortunate Report'], turn: 2 }] });
  act(g, 1, 'An Unfortunate Report'); settle(g); toIdle(g);
  endTurn(g); toIdle(g);
  bp(g); atkOn(g, 0, W, null); toIdle(g);
  ok(lp(g, 1) === 6000, `first attack (B ${lp(g, 1)})`);
  if (hasOpt(g, 'endbp') && !canAtk(g, on(g, 0, W), null)) { choose(g, 'endbp'); settle(g); if (hasOpt(g, 'bp')) bp(g); }
  if (canAtk(g, on(g, 0, W), null)) { atkOn(g, 0, W, null); toIdle(g); }
  ok(lp(g, 1) === 4000, `second Battle Phase attack (B ${lp(g, 1)})`);
});
T('Angel O7: Tribute Summoned, Effect Monster effects cannot activate', () => {
  const g = duel({ board: [{ hand: ['Angel O7'], m: [W, W, 'Blizzard Dragon'], turn: 2 }, { m: [CG] }] });
  const bd = on(g, 0, 'Blizzard Dragon');
  ok(hasIgn(g, bd), 'Blizzard Dragon usable before');
  ns(g, 0, 'Angel O7', W, W); toIdle(g);
  ok(!!on(g, 0, 'Angel O7') && !hasIgn(g, bd), 'Blizzard Dragon blocked after Tribute Summon');
});
T('Anteatereatingant: summon by sending 2 Spells/Traps, destroy a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Anteatereatingant'], st: ['Trap Hole', 'Sakuretsu Armor'], turn: 2 }, { st: ['Mirror Force'] }] });
  const a = card(g, 0, 'Anteatereatingant');
  ok(!hasOpt(g, 'ns:' + a.u), 'cannot be Normal Summoned');
  choose(g, 'sp:' + a.u); settle(g, 'Trap Hole', 'Sakuretsu Armor', 'Attack'); toIdle(g);
  ok(!!on(g, 0, 'Anteatereatingant') && cnt(g, 0, 'gy') === 2, 'summoned, 2 Spell/Traps sent');
  ign(g, on(g, 0, 'Anteatereatingant'), 'Face-down', 'Mirror Force'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
  bp(g); ok(!canAtk(g, on(g, 0, 'Anteatereatingant'), null), 'cannot attack after using it');
});
T('Apocatequil: Level 5 with a Tuner, revives Oracle of the Sun', () => {
  const g = duel({ board: [{ hand: [DH], m: ['Apocatequil', 'Krebons'], gy: ['Oracle of the Sun'], turn: 2 }, {}] });
  ok(LV(on(g, 0, 'Apocatequil')) === 5, `Level ${LV(on(g, 0, 'Apocatequil'))}`);
  act(g, 0, DH); settle(g, 'yes', 'Oracle of the Sun', 'Attack'); toIdle(g, 'yes', 'Oracle of the Sun', 'Attack');
  ok(!!on(g, 0, 'Oracle of the Sun'), 'Oracle revived');
});
T('Appointer of the Red Lotus: pay 2000, banish a card from hand until their End Phase', () => {
  const g = duel({ board: [{ hand: [W], st: ['Appointer of the Red Lotus'], turn: 2 }, { hand: [CG, BEWD] }] });
  act(g, 0, 'Appointer of the Red Lotus'); settle(g, BEWD); toIdle(g);
  ok(lp(g, 0) === 6000 && inZ(g, 1, 'ban', BEWD), `A ${lp(g, 0)}, BEWD banished`);
  endTurn(g); toIdle(g);
  ok(inZ(g, 1, 'ban', BEWD), 'still banished in B turn');
  endTurn(g); toIdle(g);
  ok(inZ(g, 1, 'hand', BEWD), 'BEWD back to B hand after B End Phase');
});
T('Aquarian Alessa: Gemini, random discard on battle kill', () => {
  const g = duel({ board: [{ m: ['Aquarian Alessa'], turn: 2 }, { hand: [CG], m: ['Ojama Green'] }] });
  const a = on(g, 0, 'Aquarian Alessa'); choose(g, 'gem:' + a.u); settle(g); toIdle(g);
  const h = hand(g, 1);
  bp(g); atkOn(g, 0, 'Aquarian Alessa', 'Ojama Green'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Ojama Green') && hand(g, 1) === h - 1, `B discarded ${h - hand(g, 1)}`);
});
T('Arcane Barrier: counter on Spellcaster destruction, send for draws', () => {
  const g = duel({ board: [{ m: [W, 'Gemini Elf'], st: [up('Arcane Barrier')], turn: 2 }, { m: [ELF] }] });
  bp(g); atkOn(g, 0, W, ELF); toIdle(g);
  const ab = card(g, 0, 'Arcane Barrier'); ok(E.lib.ctr(ab, 'spell') === 1, `${E.lib.ctr(ab, 'spell')} counter`);
  choose(g, 'endbp'); settle(g); toIdle(g);
  const h = hand(g, 0); ign(g, ab, 'Gemini Elf'); toIdle(g);
  ok(hand(g, 0) === h + 1 && inZ(g, 0, 'gy', 'Gemini Elf') && inZ(g, 0, 'gy', 'Arcane Barrier'), `drew ${hand(g, 0) - h}`);
});
T('Arcanite Magician Assault Mode: only via Assault Mode Activate, 2 counters, wipe', () => {
  const g0 = duel({ board: [{ hand: ['Arcanite Magician Assault Mode'], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Arcanite Magician Assault Mode')), 'cannot be Normal Summoned');
  const g = duel({ board: [{ m: ['Arcanite Magician'], st: ['Assault Mode Activate'], deckTop: [W, 'Arcanite Magician Assault Mode'], turn: 2 }, { m: [W], st: ['Mirror Force'] }] });
  act(g, 0, 'Assault Mode Activate'); settle(g, 'Arcanite Magician Assault Mode', 'Arcanite Magician', 'Attack'); toIdle(g);
  const am = on(g, 0, 'Arcanite Magician Assault Mode');
  ok(am && E.lib.ctr(am, 'spell') === 2 && E.atk(g, am) === 2900, `AMAM ${am && E.atk(g, am)}`);
  if (am) { ign(g, am); toIdle(g); }
  ok(!mons(g, 1).length && !g.p[1].st.some(Boolean), 'all opponent cards destroyed');
  ok(am && E.atk(g, am) === 900, `ATK back to ${am && E.atk(g, am)}`);
});
T('Armityle: summoned by banishing the three Sacred Beasts, 10000 on your turn', () => {
  const g = duel({ ex0: ['Armityle the Chaos Phantasm'], board: [{ m: ['Uria, Lord of Searing Flames', 'Hamon, Lord of Striking Thunder', 'Raviel, Lord of Phantasms'], turn: 2 }, { m: [BEWD] }] });
  const ar = card(g, 0, 'Armityle the Chaos Phantasm');
  choose(g, 'sp:' + ar.u); settle(g, 'Attack'); toIdle(g);
  const a = on(g, 0, 'Armityle the Chaos Phantasm');
  ok(a && cnt(g, 0, 'ban') === 3 && E.atk(g, a) === 10000, `Armityle ${a && E.atk(g, a)}`);
  bp(g); atkOn(g, 0, 'Armityle the Chaos Phantasm', BEWD); toIdle(g);
  ok(lp(g, 1) === 1000, `B ${lp(g, 1)}`);
  endTurn(g); toIdle(g);
  ok(E.atk(g, a) === 0, 'ATK 0 on opponent turn');
});
T('Ascending Soul: Ritual Tribute back to hand', () => {
  const g = duel({ board: [{ hand: ['Black Illusion Ritual', 'Relinquished'], m: [W], st: [up('Ascending Soul')], turn: 2 }, {}] });
  act(g, 0, 'Black Illusion Ritual'); settle(g, W, 'Relinquished', 'yes', W); toIdle(g, 'yes', W);
  ok(!!on(g, 0, 'Relinquished') && inZ(g, 0, 'hand', W), 'Warwolf back in hand');
});
T('At One With the Sword: +800 and draw on battle kill', () => {
  const g = duel({ board: [{ m: ['X-Saber Airbellum'], st: ['At One With the Sword'], turn: 2 }, { m: [ELF] }] });
  act(g, 0, 'At One With the Sword'); settle(g, 'X-Saber Airbellum'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'X-Saber Airbellum')) === 2400, `ATK ${E.atk(g, on(g, 0, 'X-Saber Airbellum'))}`);
  const h = hand(g, 0); bp(g); atkOn(g, 0, 'X-Saber Airbellum', ELF); toIdle(g);
  ok(hand(g, 0) === h + 1, `drew ${hand(g, 0) - h}`);
});
T('Athena: 600 per Fairy summon, revive a Fairy', () => {
  const g = duel({ board: [{ hand: ['Shining Angel'], m: ['Athena'], gy: ['Marshmallon'], turn: 2 }, {}] });
  ns(g, 0, 'Shining Angel'); toIdle(g);
  ok(lp(g, 1) === 7400, `B ${lp(g, 1)} after Normal Summon`);
  ign(g, on(g, 0, 'Athena'), 'Marshmallon', 'Attack', 'NO'); toIdle(g, 'NO');
  ok(!!on(g, 0, 'Marshmallon') && inZ(g, 0, 'gy', 'Shining Angel') && lp(g, 1) === 6800, `Marshmallon summoned, B ${lp(g, 1)}`);
});
T('Automatic Laser: reveal Iron Core, destroy a 1000+ ATK summon', () => {
  const g = duel({ board: [{ hand: [W], turn: 2 }, { hand: ["Iron Core of Koa'ki Meiru"], st: ['Automatic Laser'] }] });
  ns(g, 0, W, 'Automatic Laser'); toIdle(g);
  ok(inZ(g, 0, 'gy', W) && inZ(g, 1, 'hand', "Iron Core of Koa'ki Meiru"), 'Warwolf destroyed, Iron Core kept');
});
T('Avalanching Aussa: Tribute EARTH, summon EARTH, it dies when Aussa leaves', () => {
  const g = duel({ board: [{ hand: [W, 'Cyber Dragon'], m: ['Avalanching Aussa', CG], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Avalanching Aussa'), CG, W, 'Attack'); toIdle(g);
  ok(!!on(g, 0, W) && inZ(g, 0, 'gy', CG), 'Warwolf summoned, Celtic Tributed');
  ns(g, 0, 'Cyber Dragon', 'Avalanching Aussa'); toIdle(g);
  ok(!on(g, 0, W) && inZ(g, 0, 'gy', W), 'Warwolf destroyed when Aussa left');
});
T('Axe of Despair (Archfiend): +1000, back to Deck top for a Tribute', () => {
  const g = duel({ board: [{ hand: ['Axe of Despair (Archfiend)', MST], m: [W, CG], turn: 2 }, {}] });
  act(g, 0, 'Axe of Despair (Archfiend)'); settle(g, W); toIdle(g);
  ok(E.atk(g, on(g, 0, W)) === 3000, `ATK ${E.atk(g, on(g, 0, W))}`);
  act(g, 0, MST); settle(g, 'Axe of Despair', 'yes', CG); toIdle(g, 'yes', CG);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Axe of Despair (Archfiend)' && inZ(g, 0, 'gy', CG), 'Axe on Deck top, Celtic Tributed');
});
T('Babycerasaurus: destroyed by effect, summon a Dinosaur', () => {
  const g = duel({ board: [{ hand: [DH], m: ['Babycerasaurus'], deckTop: [W, 'Sabersaurus'], turn: 2 }, {}] });
  act(g, 0, DH); settle(g, 'Sabersaurus', 'Attack'); toIdle(g, 'Sabersaurus', 'Attack');
  ok(!!on(g, 0, 'Sabersaurus'), 'Sabersaurus summoned');
});
T('Backs to the Wall: LP to 100, Six Samurai with different names', () => {
  const g = duel({ board: [{ st: ['Backs to the Wall'], gy: ['The Six Samurai - Yaichi', 'The Six Samurai - Kamon', 'The Six Samurai - Kamon'], turn: 2 }, {}] });
  act(g, 0, 'Backs to the Wall'); settle(g, 'Yaichi', 'Kamon', 'Attack'); toIdle(g);
  ok(lp(g, 0) === 100 && !!on(g, 0, 'The Six Samurai - Yaichi') && cnt(g, 0, 'm', 'The Six Samurai - Kamon') === 1, `A ${lp(g, 0)}, ${mons(g, 0).length} summoned`);
});
T('Bamboo Scrap: Tribute a Plant, 2 Plant Tokens for the opponent', () => {
  const g = duel({ board: [{ m: ['Rose Fairy'], st: ['Bamboo Scrap'], turn: 2 }, {}] });
  act(g, 0, 'Bamboo Scrap'); settle(g, 'Rose Fairy'); toIdle(g);
  const t = mons(g, 1); ok(inZ(g, 0, 'gy', 'Rose Fairy') && t.length === 2 && t.every(x => x.pos === 'def' && E.atk(g, x) === 800), `${t.length} tokens on B side`);
});
T('Batteryman C: Machines +500 ATK per Attack Position C, DEF in Defense', () => {
  const g = duel({ board: [{ m: ['Batteryman C', 'Batteryman C', 'Cyber Dragon'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 3100, `ATK ${E.atk(g, on(g, 0, 'Cyber Dragon'))}`);
  const g2 = duel({ board: [{ m: [dpos('Batteryman C'), dpos('Batteryman C'), 'Cyber Dragon'], turn: 2 }, {}] });
  const cd = on(g2, 0, 'Cyber Dragon'); ok(E.atk(g2, cd) === 2100 && E.def(g2, cd) === 2600, `ATK ${E.atk(g2, cd)} DEF ${E.def(g2, cd)}`);
});
T('Batteryman D: other Thunders cannot be attacked', () => {
  const g = duel({ first: 1, board: [{ m: [dpos('Batteryman D'), 'Apocatequil'], turn: 2 }, { m: [W], turn: 2 }] });
  bp(g); const w = on(g, 1, W);
  ok(!canAtk(g, w, on(g, 0, 'Apocatequil')) && canAtk(g, w, on(g, 0, 'Batteryman D')), 'only Batteryman D can be attacked');
});
T('Battlestorm: +100 per Winged Beast, destroy a Spell/Trap with 3', () => {
  const g = duel({ board: [{ m: ['Battlestorm', 'Harpie Lady', 'Blackwing - Bora the Spear'], turn: 2 }, { st: ['Mirror Force'] }] });
  const b = on(g, 0, 'Battlestorm'); ok(E.atk(g, b) === 2000, `ATK ${E.atk(g, b)}`);
  ign(g, b, 'Face-down', 'Mirror Force'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
  const g2 = duel({ board: [{ m: ['Battlestorm', 'Harpie Lady'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!hasIgn(g2, on(g2, 0, 'Battlestorm')), 'not with only 2 Winged Beasts');
});
T('Beelze Frog: +300 per T.A.D.P.O.L.E.', () => {
  const g = duel({ board: [{ m: ['Beelze Frog'], gy: ['T.A.D.P.O.L.E.', 'T.A.D.P.O.L.E.'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Beelze Frog')) === 1800, `ATK ${E.atk(g, on(g, 0, 'Beelze Frog'))}`);
});
T('Beiige: discarded by an effect, Special Summon itself', () => {
  const g = duel({ board: [{ hand: ['Card Destruction', 'Beiige, Vanguard of Dark World'], turn: 2 }, { hand: [CG] }] });
  act(g, 0, 'Card Destruction'); settle(g, 'yes', 'Attack'); toIdle(g, 'yes', 'Attack');
  ok(!!on(g, 0, 'Beiige, Vanguard of Dark World'), 'Beiige summoned');
});
T('Bending Destiny: negate a Spell, banish it, back to hand at End Phase', () => {
  const g = duel({ first: 1, board: [{ m: ['Fortune Lady Light'], st: ['Bending Destiny'] }, { hand: [DH], turn: 2 }] });
  act(g, 1, DH); settle(g, 'Bending Destiny'); toIdle(g);
  ok(!!on(g, 0, 'Fortune Lady Light') && inZ(g, 1, 'ban', DH), 'Dark Hole negated and banished');
  endTurn(g); toIdle(g);
  ok(inZ(g, 1, 'hand', DH), 'Dark Hole back in hand');
});
T('Berfomet: Normal Summon adds Gazelle', () => {
  const g = duel({ board: [{ hand: ['Berfomet'], m: [W], deckTop: [W, 'Gazelle the King of Mythical Beasts'], turn: 2 }, {}] });
  ns(g, 0, 'Berfomet', W, 'yes', 'Gazelle'); toIdle(g, 'yes', 'Gazelle');
  ok(inZ(g, 0, 'hand', 'Gazelle the King of Mythical Beasts'), 'Gazelle added');
});
T('Berserker Crush: Winged Kuriboh takes the banished monster stats', () => {
  const g = duel({ board: [{ hand: ['Berserker Crush'], m: ['Winged Kuriboh'], gy: [BEWD], turn: 2 }, {}] });
  act(g, 0, 'Berserker Crush'); settle(g, BEWD, 'Winged Kuriboh'); toIdle(g);
  const k = on(g, 0, 'Winged Kuriboh');
  ok(E.atk(g, k) === 3000 && E.def(g, k) === 2500 && inZ(g, 0, 'ban', BEWD), `Kuriboh ${E.atk(g, k)}/${E.def(g, k)}`);
});
T('Berserking: one Beast loses half, the other gains it', () => {
  const g = duel({ board: [{ m: ['Giant Rat', 'Gazelle the King of Mythical Beasts'], st: [up('Berserking')], turn: 2 }, {}] });
  ign(g, card(g, 0, 'Berserking'), 'Giant Rat', 'Gazelle'); toIdle(g, 'Giant Rat', 'Gazelle');
  const a = E.atk(g, on(g, 0, 'Giant Rat')), b = E.atk(g, on(g, 0, 'Gazelle the King of Mythical Beasts'));
  ok(a + b === 2900 && (a === 700 || b === 750), `Rat ${a}, Gazelle ${b}`);
});
T('Bicular: destroyed by battle, summon Unicycular', () => {
  const g = duel({ board: [{ m: ['Bicular'], deckTop: [W, 'Unicycular'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Bicular', W, 'yes', 'Unicycular'); toIdle(g, 'yes', 'Unicycular', 'Attack');
  ok(!!on(g, 0, 'Unicycular'), 'Unicycular summoned');
});
T('Birthright: revive a Normal Monster, linked destruction', () => {
  const g = duel({ board: [{ st: ['Birthright'], gy: [BEWD], turn: 2 }, { hand: [] }] });
  act(g, 0, 'Birthright'); settle(g, BEWD); toIdle(g);
  const b = on(g, 0, BEWD); ok(b && b.pos === 'atk', 'BEWD in Attack Position');
  const g2 = duel({ board: [{ hand: [MST], st: ['Birthright'], gy: [BEWD], turn: 2 }, {}] });
  act(g2, 0, 'Birthright'); settle(g2, BEWD); toIdle(g2);
  act(g2, 0, MST); settle(g2, 'Birthright'); toIdle(g2);
  ok(!on(g2, 0, BEWD) && inZ(g2, 0, 'gy', BEWD), 'BEWD destroyed when Birthright left');
});
T('Bitelon: piercing', () => {
  const g = duel({ board: [{ m: ['Bitelon'], turn: 2 }, { m: [dpos(W)] }] });
  bp(g); atkOn(g, 0, 'Bitelon', W); toIdle(g);
  ok(lp(g, 1) === 5700, `B ${lp(g, 1)}`);
});
T('Blasting Fuse: destroys all cards in its column', () => {
  const g = duel({ board: [{ m: [W], st: ['Blasting Fuse'], turn: 2 }, { m: [CG, CG, CG, CG, CG], st: ['Mirror Force', 'Mirror Force', 'Mirror Force', 'Mirror Force', 'Mirror Force'] }] });
  act(g, 0, 'Blasting Fuse'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Blasting Fuse') && inZ(g, 0, 'gy', W) && mons(g, 1).length === 4 && g.p[1].st.filter(Boolean).length === 4, `B ${mons(g, 1).length} monsters, ${g.p[1].st.filter(Boolean).length} S/T left`);
});
T('Blazing Hiita: Tribute FIRE, summon FIRE, it dies when Hiita leaves', () => {
  const g = duel({ board: [{ hand: ['Command Knight', 'Cyber Dragon'], m: ['Blazing Hiita', 'Great Angus'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Blazing Hiita'), 'Great Angus', 'Command Knight', 'Attack'); toIdle(g);
  ok(!!on(g, 0, 'Command Knight'), 'Command Knight summoned');
  ns(g, 0, 'Cyber Dragon', 'Blazing Hiita'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Command Knight'), 'Command Knight destroyed');
});
T('Blizzard Dragon: target cannot attack or change position until end of next turn', () => {
  const g = duel({ board: [{ m: ['Blizzard Dragon'], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, 'Blizzard Dragon'), W); toIdle(g);
  const w = on(g, 1, W);
  endTurn(g); toIdle(g);
  ok(E.lib.forbid(g, { type: 'attack', c: w }) && E.lib.forbid(g, { type: 'pos', c: w }), 'Warwolf locked on B turn');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(!E.lib.forbid(g, { type: 'attack', c: w }), 'free again on the following B turn');
});
T('Blizzard Warrior: look at the top card, put it on the bottom', () => {
  const g = duel({ board: [{ m: ['Blizzard Warrior'], turn: 2 }, { m: ['Ojama Green'], deckTop: [BEWD] }] });
  bp(g); atkOn(g, 0, 'Blizzard Warrior', 'Ojama Green', 'Bottom'); toIdle(g, 'Bottom');
  ok(E.name(g.p[1].deck[0]) === BEWD, `bottom card ${E.name(g.p[1].deck[0])}`);
});
T('Blizzed: destroyed by battle, draw 1', () => {
  const g = duel({ board: [{ m: ['Blizzed, Defender of the Ice Barrier'], turn: 2 }, { m: [W] }] });
  const h = hand(g, 0); bp(g); atkOn(g, 0, 'Blizzed, Defender of the Ice Barrier', W); toIdle(g);
  ok(hand(g, 0) === h + 1, `drew ${hand(g, 0) - h}`);
});
T('Blockman: Tribute for Block Tokens that cannot attack', () => {
  const g = duel({ board: [{ hand: ['Blockman'], turn: 2 }, {}] });
  ns(g, 0, 'Blockman'); toIdle(g);
  ign(g, on(g, 0, 'Blockman')); toIdle(g);
  const t = mons(g, 0); ok(t.length === 1 && t[0].pos === 'def' && E.atk(g, t[0]) === 1000, `${t.length} token`);
  ok(t[0] && (E.lib.has(g, t[0], 'cantAttack') || E.lib.forbid(g, { type: 'attack', c: t[0] })), 'token cannot attack');
  const g2 = duel({ board: [{ hand: ['Blockman'], turn: 2 }, {}] });
  ns(g2, 0, 'Blockman'); turns(g2, 2); ign(g2, on(g2, 0, 'Blockman')); toIdle(g2);
  ok(mons(g2, 0).length === 2, `2 tokens on the 2nd turn (${mons(g2, 0).length})`);
});
T('Bone Crusher: revived by a Zombie, destroys a Spell/Trap, dies at End Phase', () => {
  const g = duel({ board: [{ hand: [CG], m: ['Zombie Master'], gy: ['Bone Crusher'], turn: 2 }, { st: ['Mirror Force'] }] });
  ign(g, on(g, 0, 'Zombie Master'), CG, 'Bone Crusher', 'Attack', 'yes', 'Face-down', 'Mirror Force'); toIdle(g, 'yes', 'Face-down', 'Mirror Force');
  ok(!!on(g, 0, 'Bone Crusher') && inZ(g, 1, 'gy', 'Mirror Force'), 'Bone Crusher summoned, Mirror Force destroyed');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Bone Crusher'), 'Bone Crusher destroyed at End Phase');
});
T('Bone Temple Block: each side summons from the other GY', () => {
  const g = duel({ board: [{ hand: [W], st: ['Bone Temple Block'], gy: [CG], turn: 2 }, { gy: [ELF] }] });
  act(g, 0, 'Bone Temple Block'); settle(g, ELF, CG, 'Attack'); toIdle(g);
  ok(!!on(g, 0, ELF) && !!on(g, 1, CG) && inZ(g, 0, 'gy', W), 'Elf on A side, Celtic on B side');
  turns(g, 2);
  ok(!on(g, 0, ELF) && !on(g, 1, CG), 'both destroyed by the End Phase of the next turn');
});
T('Boss Rush: no Normal Summon, replace a destroyed B.E.S.', () => {
  const g = duel({ board: [{ hand: [DH, W], m: ['B.E.S. Big Core'], st: [up('Boss Rush')], deckTop: [W, 'B.E.S. Big Core'], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, W).u), 'cannot Normal Summon');
  act(g, 0, DH); settle(g); toIdle(g);
  endTurn(g, 'yes', 'B.E.S. Big Core', 'Attack');
  ok(!!on(g, 0, 'B.E.S. Big Core'), 'B.E.S. Big Core from the Deck');
});
T('Botanical Girl: sent to GY, add a Plant with 1000 or less DEF', () => {
  const g = duel({ board: [{ hand: [DH], m: ['Botanical Girl'], deckTop: [W, 'Dandylion'], turn: 2 }, {}] });
  act(g, 0, DH); settle(g, 'yes', 'Dandylion'); toIdle(g, 'yes', 'Dandylion');
  ok(inZ(g, 0, 'hand', 'Dandylion'), 'Dandylion added');
});
T('Bountiful Artemis: draw after a Counter Trap resolves', () => {
  const g = duel({ first: 1, board: [{ m: ['Bountiful Artemis'], st: ['Solemn Judgment'] }, { hand: [W], turn: 2 }] });
  const h = hand(g, 0); ns(g, 1, W, 'Solemn Judgment'); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && hand(g, 0) === h + 1, `drew ${hand(g, 0) - h}`);
});
T('Brainwashing Beam: take an A-Counter monster, remove a counter each End Phase', () => {
  const g = duel({ board: [{ st: ['Brainwashing Beam'], turn: 2 }, { m: [W] }] });
  E.lib.addCtr(g, on(g, 1, W), 'A', 1); bp(g); choose(g, 'endbp'); settle(g); toIdle(g);
  act(g, 0, 'Brainwashing Beam'); settle(g, W); toIdle(g);
  ok(!!on(g, 0, W), 'A controls Warwolf');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Brainwashing Beam'), 'Beam destroyed when counters ran out');
});
T('Branch!: Fusion destroyed, revive one of its materials', () => {
  const g = duel({ ex0: ['Elemental HERO Flame Wingman'], board: [{ hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix', DH], st: [up('Branch!')], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Flame Wingman', 'Avian', 'Burstinatrix', 'Attack'); toIdle(g);
  ok(!!on(g, 0, 'Elemental HERO Flame Wingman'), 'Flame Wingman summoned');
  act(g, 0, DH); settle(g, 'yes', 'Avian', 'Attack'); toIdle(g, 'yes', 'Avian', 'Attack');
  ok(!!on(g, 0, 'Elemental HERO Avian'), 'Avian revived');
});
T('Break! Draw!: equipped Machine draws on battle kill', () => {
  const g = duel({ board: [{ hand: ['Break! Draw!'], m: ['Cyber Dragon'], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'Break! Draw!'); settle(g, 'Cyber Dragon'); toIdle(g);
  const h = hand(g, 0); bp(g); atkOn(g, 0, 'Cyber Dragon', CG, 'yes'); toIdle(g, 'yes');
  ok(hand(g, 0) === h + 1, `drew ${hand(g, 0) - h}`);
});
T('Breakthrough!: after a Six Samurai kill, Six Samurai attack directly', () => {
  const g = duel({ board: [{ m: ['The Six Samurai - Zanji', 'The Six Samurai - Kamon'], st: ['Breakthrough!'], turn: 2 }, { m: [ELF, dpos('Big Shield Gardna')] }] });
  act(g, 0, 'Breakthrough!'); settle(g, 'Zanji'); toIdle(g);
  bp(g); atkOn(g, 0, 'The Six Samurai - Zanji', ELF, 'NO'); toIdle(g, 'NO');
  ok(inZ(g, 1, 'gy', ELF), 'Elf destroyed');
  ok(canAtk(g, on(g, 0, 'The Six Samurai - Kamon'), null), 'Kamon can attack directly');
});
T('Breath of Light: destroys face-up Rocks', () => {
  const g = duel({ board: [{ hand: ['Breath of Light'], m: ['Giant Soldier of Stone', W], turn: 2 }, { m: ['Giant Soldier of Stone', set('Morphing Jar')] }] });
  act(g, 0, 'Breath of Light'); settle(g); toIdle(g);
  ok(!on(g, 0, 'Giant Soldier of Stone') && !on(g, 1, 'Giant Soldier of Stone') && !!on(g, 0, W) && !!on(g, 1, 'Morphing Jar'), 'face-up Rocks destroyed, face-down Jar stays');
});

console.log(fails ? `\n${fails} failed` : '\nAll full-35 review checks passed.');
process.exit(fails ? 1 : 0);
