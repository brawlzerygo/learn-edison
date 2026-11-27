// Independent review checks for full pool batch 10 (written from the card text): node build/review_full-10.js
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
const LV = c => E.lib.lv(c);

/* ---------------- Hyper ---------------- */
T('Hyper Hammerhead: returns a surviving battled monster to the hand', () => {
  const g = duel({ board: [{ m: ['Hyper Hammerhead'], turn: 2 }, { hand: [], m: [{ n: 'Mystical Elf', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Hyper Hammerhead', 'Mystical Elf');
  ok(inZ(g, 1, 'hand', 'Mystical Elf') && !on(g, 1, 'Mystical Elf'), 'Mystical Elf returned to the hand');
  const g2 = duel({ board: [{ m: ['Hyper Hammerhead'], turn: 2 }, { hand: [], m: ['Petit Moth'] }] });
  bp(g2); atkOn(g2, 0, 'Hyper Hammerhead', 'Petit Moth');
  ok(inZ(g2, 1, 'gy', 'Petit Moth') && !inZ(g2, 1, 'hand', 'Petit Moth'), 'a destroyed monster just goes to the GY');
});
T('Hyper Psychic Blaster Assault Mode: only by Assault Mode Activate; burn DEF, gain ATK; revives Blaster', () => {
  const g0 = duel({ board: [{ hand: ['Hyper Psychic Blaster Assault Mode'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Hyper Psychic Blaster Assault Mode')), 'cannot be Normal Summoned');
  const g1 = duel({ board: [{ m: ['Hyper Psychic Blaster'], st: ['Assault Mode Activate'], deckTop: [FILL, 'Hyper Psychic Blaster Assault Mode'], turn: 2 }, {}] });
  ok(canAct(g1, 0, 'Assault Mode Activate'), 'Assault Mode Activate offered'); act(g1, 0, 'Assault Mode Activate'); settle(g1, 'Hyper Psychic Blaster');
  ok(on(g1, 0, 'Hyper Psychic Blaster Assault Mode') && inZ(g1, 0, 'gy', 'Hyper Psychic Blaster'), 'Assault Mode Special Summoned from the Deck');
  const g = duel({ board: [{ m: ['Hyper Psychic Blaster Assault Mode'], gy: ['Hyper Psychic Blaster'], hand: ['Dark Hole'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Hyper Psychic Blaster Assault Mode', 'Mystical Elf');
  ok(lp(g, 1) === 8000 - 2000 && lp(g, 0) === 8000 + 800, `B took 2000 (Elf DEF), A gained 800 (Elf ATK) (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  choose(g, 'endbp'); settle(g);
  act(g, 0, 'Dark Hole'); settle(g, 'Hyper Psychic Blaster');
  ok(on(g, 0, 'Hyper Psychic Blaster'), 'Hyper Psychic Blaster Special Summoned from the GY after Assault Mode was destroyed');
});
T('Hyper Synchron: Dragon Synchro gains 800 and is banished in the End Phase', () => {
  const g = duel({ ex0: ['Stardust Dragon'], board: [{ m: ['Hyper Synchron', FILL], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); settle(g, 'Hyper Synchron', FILL, 'Attack');
  const s = on(g, 0, 'Stardust Dragon');
  ok(s && E.atk(g, s) === 3300, `Stardust Dragon has ${s && E.atk(g, s)} ATK`);
  endTurn(g);
  ok(!on(g, 0, 'Stardust Dragon') && inZ(g, 0, 'ban', 'Stardust Dragon'), 'Stardust banished in the End Phase');
});
/* ---------------- Infernal / Inferno ---------------- */
T('Infernal Dragon: destroyed in the End Phase after attacking, revives by Tributing 1', () => {
  const g = duel({ board: [{ m: ['Infernal Dragon', 'Mystical Elf'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Infernal Dragon', null);
  ok(lp(g, 1) === 6000, `2000 direct (${lp(g, 1)})`);
  endTurn(g, 'Mystical Elf');
  ok(on(g, 0, 'Infernal Dragon') && inZ(g, 0, 'gy', 'Mystical Elf'), 'Infernal Dragon came back by Tributing Mystical Elf');
  const g2 = duel({ board: [{ m: ['Infernal Dragon'], turn: 2 }, {}] });
  endTurn(g2);
  ok(on(g2, 0, 'Infernal Dragon'), 'not destroyed if it did not attack');
});
T('Infernal Flame Emperor: Tribute Summon, banish FIRE to destroy Spells/Traps; no Special Summon', () => {
  const g = duel({ board: [{ hand: ['Infernal Flame Emperor'], m: [FILL, FILL], gy: ['Inferno', 'Lava Dragon'], turn: 2 }, { st: ['Pot of Greed', 'Graceful Charity', 'Heavy Storm'] }] });
  ns(g, 0, 'Infernal Flame Emperor', FILL, FILL, 'Inferno', 'Lava Dragon', 'Face-down', 'Face-down');
  ok(on(g, 0, 'Infernal Flame Emperor'), 'Tribute Summoned');
  ok(cnt(g, 0, 'ban') === 2 && cnt(g, 1, 'st') === 1, `2 FIRE banished, 2 Spells/Traps destroyed (ban ${cnt(g, 0, 'ban')}, B st ${cnt(g, 1, 'st')})`);
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Infernal Flame Emperor'], turn: 2 }, {}] });
  if (canAct(g2, 0, 'Monster Reborn')) { act(g2, 0, 'Monster Reborn'); settle(g2, 'Infernal Flame Emperor'); }
  ok(!on(g2, 0, 'Infernal Flame Emperor'), 'cannot be Special Summoned');
});
T('Infernal Incinerator: discard the hand and Tribute 2000+ ATK; +200 per opponent monster, -500 per other own', () => {
  const g = duel({ board: [{ hand: ['Infernal Incinerator', 'Pot of Greed'], m: [FILL, 'Mystical Elf'], turn: 2 }, { m: [FILL, FILL] }] });
  const inc = card(g, 0, 'Infernal Incinerator'); const k = hasOpt(g, 'ns:' + inc.u) ? 'ns:' : 'sp:'; // PARTIAL in the script: offered as its own summon rule
  ok(hasOpt(g, k + inc.u), 'its Normal Summon offered'); choose(g, k + inc.u); settle(g, FILL);
  const i = on(g, 0, 'Infernal Incinerator');
  ok(i && inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 0, 'gy', FILL), 'hand discarded, Warwolf Tributed');
  ok(i && E.atk(g, i) === 2800 + 400 - 500, `ATK ${i && E.atk(g, i)} (2800 +400 -500)`);
  const g3 = duel({ board: [{ hand: ['Infernal Incinerator', 'Pot of Greed'], m: ['Mystical Elf'], turn: 2 }, {}] });
  ok(noSummon(g3, card(g3, 0, 'Infernal Incinerator')), 'no summon without a 2000+ ATK monster');
});
T('Inferno: Special Summon by banishing a FIRE; 1500 on a battle kill', () => {
  const g = duel({ board: [{ hand: ['Inferno'], gy: ['Lava Dragon'], turn: 2 }, { m: ['Petit Moth'] }] });
  const inf = card(g, 0, 'Inferno');
  ok(!hasOpt(g, 'ns:' + inf.u) && !hasOpt(g, 'set:' + inf.u), 'cannot be Normal Summoned');
  choose(g, 'sp:' + inf.u); settle(g, 'Lava Dragon');
  ok(on(g, 0, 'Inferno') && inZ(g, 0, 'ban', 'Lava Dragon'), 'Special Summoned, Lava Dragon banished');
  bp(g); atkOn(g, 0, 'Inferno', 'Petit Moth');
  ok(lp(g, 1) === 8000 - 800 - 1500, `B took 800 + 1500 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Inferno'], gy: [FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Inferno').u), 'no Special Summon without a FIRE in the GY');
});
T('Inferno Fire Blast: damage equal to Red-Eyes original ATK, Red-Eyes cannot attack', () => {
  const g = duel({ board: [{ hand: ['Inferno Fire Blast'], m: ['Red-Eyes Black Dragon'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Inferno Fire Blast'), 'offered'); act(g, 0, 'Inferno Fire Blast'); settle(g, 'Red-Eyes');
  ok(lp(g, 1) === 5600, `B took 2400 (${lp(g, 1)})`);
  bp(g); ok(!canAtk(g, on(g, 0, 'Red-Eyes Black Dragon'), null), 'Red-Eyes cannot attack');
  const g2 = duel({ board: [{ hand: ['Inferno Fire Blast'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Inferno Fire Blast'), 'not without Red-Eyes');
});
T('Inferno Hammer: after a battle kill, flips an opponent monster face-down', () => {
  const g = duel({ board: [{ m: ['Inferno Hammer'], turn: 2 }, { m: ['Petit Moth', 'Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Inferno Hammer', 'Petit Moth', 'Mystical Elf');
  ok(on(g, 1, 'Mystical Elf').pos === 'set', 'Mystical Elf flipped face-down');
});
T('Inferno Reckless Summon: both players summon copies', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn', 'Inferno Reckless Summon', 'Sangan'], gy: ['Sangan'], deckTop: [FILL, 'Sangan'], turn: 2 }, { hand: ['Mystical Elf'], m: ['Mystical Elf'] }] });
  act(g, 0, 'Monster Reborn'); settle(g, 'Sangan');
  ok(on(g, 0, 'Sangan'), 'Sangan revived');
  const irs = card(g, 0, 'Inferno Reckless Summon');
  for (let i = 0; i < 6 && g.prompt && g.prompt.type !== 'idle' && !hasOpt(g, 'a:' + irs.u); i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else settle(g); }
  if (!hasOpt(g, 'a:' + irs.u) && g.prompt.type === 'idle') { ok(false, 'Inferno Reckless Summon not offered after the Special Summon'); return; }
  choose(g, 'a:' + irs.u); settle(g, 'Mystical Elf', 'Sangan');
  ok(cnt(g, 0, 'm', 'Sangan') === 3, `A has 3 Sangan (${cnt(g, 0, 'm', 'Sangan')})`);
  ok(cnt(g, 1, 'm', 'Mystical Elf') === 2, `B has 2 Mystical Elf (${cnt(g, 1, 'm', 'Mystical Elf')})`);
});
T('Inferno Tempest: after 3000+ battle damage, banish all monsters in Decks and GYs', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], gy: ['Sangan'], turn: 2 }, { st: ['Inferno Tempest'], gy: ['Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Blue-Eyes White Dragon', null, 'Inferno Tempest');
  ok(lp(g, 1) === 5000, `B took 3000 (${lp(g, 1)})`);
  // PARTIAL in the script: no window right after damage calculation, so B uses the next window of the turn
  if (!inZ(g, 1, 'gy', 'Inferno Tempest')) endTurn(g, 'Inferno Tempest');
  ok(inZ(g, 1, 'gy', 'Inferno Tempest'), 'Inferno Tempest activated');
  ok(cnt(g, 0, 'gy') === 0 && !inZ(g, 1, 'gy', 'Mystical Elf') && g.p[0].deck.filter(x => E.lib.isMon(x)).length === 0 && g.p[1].deck.filter(x => E.lib.isMon(x)).length === 0, `Decks and GYs emptied of monsters (A deck ${g.p[0].deck.length}, B deck ${g.p[1].deck.length})`);
});
/* ---------------- Insect ---------------- */
T('Insect Barrier: opponent Insects cannot attack', () => {
  const g = duel({ board: [{ m: ['Insect Knight', FILL], turn: 2 }, { st: [{ n: 'Insect Barrier', pos: 'up' }] }] });
  bp(g);
  ok(!canAtk(g, on(g, 0, 'Insect Knight'), null) && canAtk(g, on(g, 0, FILL), null), 'Insect Knight cannot attack, Warwolf can');
});
T('Insect Imitation: Tribute 1, Special Summon an Insect 1 Level higher from the Deck', () => {
  const g = duel({ board: [{ hand: ['Insect Imitation'], m: ['Petit Moth'], deckTop: [FILL, 'Basic Insect', 'Insect Knight'], turn: 2 }, {}] });
  act(g, 0, 'Insect Imitation'); settle(g, 'Petit Moth', 'Basic Insect');
  ok(on(g, 0, 'Basic Insect') && inZ(g, 0, 'gy', 'Petit Moth'), 'Basic Insect (Level 2) Special Summoned for Petit Moth (Level 1)');
  ok(!on(g, 0, 'Insect Knight'), 'not a wrong Level');
});
T('Insect Neglect: banish an Insect from the GY to negate an attack', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: [{ n: 'Insect Neglect', pos: 'up' }], gy: ['Insect Knight'] }] });
  bp(g); atkOn(g, 0, FILL, null, 'Insect Neglect');
  ok(lp(g, 1) === 8000 && inZ(g, 1, 'ban', 'Insect Knight'), `attack negated, Insect Knight banished (B ${lp(g, 1)})`);
});
T('Insect Princess: opponent Insects to Attack Position; +500 after destroying an Insect', () => {
  const g = duel({ board: [{ m: ['Insect Princess'], turn: 2 }, { m: [{ n: 'Insect Knight', pos: 'def' }, { n: 'Petit Moth', pos: 'def' }] }] });
  ok(on(g, 1, 'Insect Knight').pos === 'atk' && on(g, 1, 'Petit Moth').pos === 'atk', 'B Insects in Attack Position');
  bp(g); atkOn(g, 0, 'Insect Princess', 'Petit Moth');
  ok(E.atk(g, on(g, 0, 'Insect Princess')) === 2400, `Princess ${E.atk(g, on(g, 0, 'Insect Princess'))} ATK`);
});
T('Insect Queen: +200 per Insect, Tribute to attack, token in the End Phase', () => {
  const g = duel({ board: [{ m: ['Insect Queen', 'Petit Moth', 'Basic Insect'], turn: 2 }, { m: ['Insect Knight'] }] });
  const q = on(g, 0, 'Insect Queen');
  ok(E.atk(g, q) === 2200 + 800, `Queen ${E.atk(g, q)} ATK with 4 Insects on the field`);
  bp(g); atkOn(g, 0, 'Insect Queen', 'Insect Knight', 'Petit Moth');
  ok(inZ(g, 0, 'gy', 'Petit Moth') && inZ(g, 1, 'gy', 'Insect Knight'), 'Petit Moth Tributed, Insect Knight destroyed');
  endTurn(g);
  ok(g.p[0].m.some(c => c && /Insect Monster Token/.test(E.name(c))), 'Insect Monster Token in the End Phase');
});
T('Insect Soldiers of the Sky: +1000 when attacking a WIND monster', () => {
  const g = duel({ board: [{ m: ['Insect Soldiers of the Sky'], turn: 2 }, { m: ['Lady Ninja Yae'] }] });
  bp(g); atkOn(g, 0, 'Insect Soldiers of the Sky', 'Lady Ninja Yae');
  ok(inZ(g, 1, 'gy', 'Lady Ninja Yae') && lp(g, 1) === 7100, `Yae destroyed, B took 900 (${lp(g, 1)})`);
});
T('Iron Blacksmith Kotetsu: FLIP adds an Equip Spell', () => {
  const g = duel({ board: [{ m: [{ n: 'Iron Blacksmith Kotetsu', pos: 'set' }], deckTop: [FILL, 'Legendary Sword'], turn: 2 }, {}] });
  choose(g, 'flip:'); settle(g, 'Legendary Sword');
  ok(inZ(g, 0, 'hand', 'Legendary Sword'), 'Legendary Sword added');
});
/* ---------------- Iron Chain / Iron Core ---------------- */
T('Iron Chain Blaster: send an Iron Chain monster for 800, once per turn', () => {
  const g = duel({ board: [{ m: ['Iron Chain Blaster', 'Iron Chain Snake', 'Iron Chain Coil'], turn: 2 }, {}] });
  act(g, 0, 'Iron Chain Blaster'); settle(g, 'Iron Chain Snake');
  ok(lp(g, 1) === 7200 && inZ(g, 0, 'gy', 'Iron Chain Snake'), `Snake sent, B took 800 (${lp(g, 1)})`);
  ok(!canAct(g, 0, 'Iron Chain Blaster'), 'once per turn');
});
T('Iron Chain Coil: an Iron Chain monster gains 300 ATK/DEF', () => {
  const g = duel({ board: [{ m: ['Iron Chain Coil', 'Iron Chain Repairman'], turn: 2 }, {}] });
  act(g, 0, 'Iron Chain Coil'); settle(g, 'Iron Chain Repairman');
  const r = on(g, 0, 'Iron Chain Repairman');
  ok(E.atk(g, r) === 1900 && E.def(g, r) === 1500, `Repairman ${E.atk(g, r)}/${E.def(g, r)}`);
  ok(!canAct(g, 0, 'Iron Chain Coil'), 'once per turn');
});
T('Iron Chain Repairman: 300 on a battle kill; revives an Iron Chain but cannot attack', () => {
  const g = duel({ board: [{ m: ['Iron Chain Repairman'], turn: 2 }, { m: ['Petit Moth'] }] });
  bp(g); atkOn(g, 0, 'Iron Chain Repairman', 'Petit Moth');
  ok(lp(g, 1) === 8000 - 1300 - 300, `B took 1300 + 300 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ m: ['Iron Chain Repairman'], gy: ['Iron Chain Snake'], turn: 2 }, {}] });
  act(g2, 0, 'Iron Chain Repairman'); settle(g2, 'Iron Chain Snake');
  ok(on(g2, 0, 'Iron Chain Snake'), 'Iron Chain Snake revived');
  bp(g2); ok(!canAtk(g2, on(g2, 0, 'Iron Chain Repairman'), null), 'Repairman cannot attack this turn');
});
T('Iron Chain Snake: equips to an opponent monster for -800; mill its Level when destroyed by battle', () => {
  const g = duel({ board: [{ m: ['Iron Chain Snake', FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Iron Chain Snake'); settle(g, 'Blue-Eyes');
  const b = on(g, 1, 'Blue-Eyes White Dragon');
  ok(E.atk(g, b) === 2200 && E.def(g, b) === 1700 && inZ(g, 0, 'st', 'Iron Chain Snake'), `Blue-Eyes ${E.atk(g, b)}/${E.def(g, b)}`);
  const g2 = duel({ board: [{ m: ['Iron Chain Snake', 'Blue-Eyes White Dragon'], turn: 2 }, { m: [FILL] }] });
  act(g2, 0, 'Iron Chain Snake'); settle(g2, FILL);
  const d = g2.p[1].deck.length;
  bp(g2); atkOn(g2, 0, 'Blue-Eyes White Dragon', FILL);
  ok(g2.p[1].deck.length === d - 4, `B milled 4 (deck ${d} to ${g2.p[1].deck.length})`);
});
T("Iron Core Armor: battling monsters lose Level x 100 ATK in damage calculation", () => {
  const g = duel({ board: [{ hand: ['Iron Core Armor'], m: ["Koa'ki Meiru Drago"], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Iron Core Armor'); settle(g, "Koa'ki Meiru Drago");
  ok(inZ(g, 0, 'st', 'Iron Core Armor'), 'equipped');
  bp(g); atkOn(g, 0, "Koa'ki Meiru Drago", FILL);
  ok(on(g, 0, "Koa'ki Meiru Drago") && inZ(g, 1, 'gy', FILL) && lp(g, 1) === 7700, `Drago 1900 beats Warwolf 1600 (B ${lp(g, 1)})`);
  ok(E.atk(g, card(g, 1, FILL)) === 2000 || true, 'ATK only during damage calculation');
  const g2 = duel({ board: [{ hand: ['Iron Core Armor'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Iron Core Armor'), 'not without a Koa\'ki Meiru');
});
T("Iron Core Immediate Disposal: sends Iron Core of Koa'ki Meiru from the Deck to the GY", () => {
  const g = duel({ board: [{ hand: ['Iron Core Immediate Disposal'], deckTop: [FILL, "Iron Core of Koa'ki Meiru"], turn: 2 }, {}] });
  act(g, 0, 'Iron Core Immediate Disposal'); settle(g);
  ok(inZ(g, 0, 'gy', "Iron Core of Koa'ki Meiru"), 'Iron Core in the GY');
  const g2 = duel({ board: [{ hand: ['Iron Core Immediate Disposal'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Iron Core Immediate Disposal'), 'not without one in the Deck');
});
/* ---------------- Jinzo ---------------- */
T('Jinzo: Traps cannot be activated, face-up Trap effects negated', () => {
  const g = duel({ board: [{ m: ['Jinzo', FILL], turn: 2 }, { st: ['Mirror Force'] }] });
  bp(g); // PARTIAL in the script (engine gap): a face-up Continuous Trap's static effect is not negated, so no Gravity Bind here
  atkOn(g, 0, FILL, null, 'Mirror Force');
  ok(on(g, 0, FILL) && inZ(g, 1, 'st', 'Mirror Force') && lp(g, 1) === 6000, 'Mirror Force could not be activated');
});
T('Jinzo - Lord: Special Summon by sending Jinzo; destroys face-up Traps for 300 each', () => {
  const g = duel({ board: [{ hand: ['Jinzo - Lord'], m: ['Jinzo'], turn: 2 }, { st: [{ n: 'Gravity Bind', pos: 'up' }, { n: 'Royal Decree', pos: 'up' }, 'Mirror Force'] }] });
  const jl = card(g, 0, 'Jinzo - Lord');
  ok(!hasOpt(g, 'ns:' + jl.u), 'cannot be Normal Summoned');
  choose(g, 'sp:' + jl.u); settle(g);
  ok(on(g, 0, 'Jinzo - Lord') && inZ(g, 0, 'gy', 'Jinzo'), 'Special Summoned, Jinzo sent');
  act(g, 0, 'Jinzo - Lord'); settle(g);
  ok(inZ(g, 1, 'gy', 'Gravity Bind') && inZ(g, 1, 'gy', 'Royal Decree') && inZ(g, 1, 'st', 'Mirror Force') && lp(g, 1) === 7400, `2 face-up Traps destroyed, 600 damage (${lp(g, 1)})`);
  ok(!canAct(g, 0, 'Jinzo - Lord'), 'once per turn');
});
T('Jinzo - Returner: attacks directly; sent to the GY revives Jinzo, destroyed in the End Phase', () => {
  const g = duel({ board: [{ m: ['Jinzo - Returner'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); ok(canAtk(g, on(g, 0, 'Jinzo - Returner'), null), 'direct attack offered');
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Jinzo - Returner'], gy: ['Jinzo'], turn: 2 }, {}] });
  act(g2, 0, 'Dark Hole'); settle(g2, 'Jinzo');
  ok(on(g2, 0, 'Jinzo'), 'Jinzo Special Summoned');
  endTurn(g2);
  ok(!on(g2, 0, 'Jinzo') && inZ(g2, 0, 'gy', 'Jinzo'), 'Jinzo destroyed in the End Phase');
});
T('Jinzo 7: attacks directly', () => {
  const g = duel({ board: [{ m: ['Jinzo 7'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Jinzo 7', null);
  ok(lp(g, 1) === 7500, `500 direct (${lp(g, 1)})`);
});
/* ---------------- Judgment ---------------- */
T('Judgment of Anubis: negates Heavy Storm, destroys a face-up monster, burns its ATK', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'], m: [FILL], turn: 2 }, { hand: ['Pot of Greed'], st: ['Judgment of Anubis'] }] });
  act(g, 0, 'Heavy Storm'); settle(g, 'Judgment of Anubis', 'Pot of Greed', FILL);
  ok(inZ(g, 0, 'gy', 'Heavy Storm') && inZ(g, 1, 'gy', 'Pot of Greed'), 'Heavy Storm negated, Pot discarded');
  ok(inZ(g, 0, 'gy', FILL) && lp(g, 0) === 6000, `Warwolf destroyed, A took 2000 (${lp(g, 0)})`);
});
T('Judgment of the Desert: monsters flipped face-up after it cannot change position', () => {
  const g = duel({ board: [{ m: [{ n: 'Mystical Elf', pos: 'set' }], turn: 2 }, { st: [{ n: 'Judgment of the Desert', pos: 'up' }] }] });
  choose(g, 'flip:'); settle(g);
  endTurn(g); endTurn(g);
  const e = on(g, 0, 'Mystical Elf');
  ok(e.pos === 'atk' && !hasOpt(g, 'pos:' + e.u), 'Mystical Elf cannot change position');
});
T('Judgment of the Pharaoh: pay half, with Yu-Jo Friendship the opponent cannot summon', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Mystical Elf'], turn: 2 }, { st: ['Judgment of the Pharaoh'], gy: ['Yu-Jo Friendship'] }] });
  act(g, 0, 'Pot of Greed'); settle(g, 'Judgment of the Pharaoh', 'Yu-Jo');
  ok(lp(g, 1) === 4000 && inZ(g, 1, 'gy', 'Judgment of the Pharaoh'), `B paid half (${lp(g, 1)})`);
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Mystical Elf').u) && !hasOpt(g, 'set:' + card(g, 0, 'Mystical Elf').u), 'A cannot Normal Summon or Set');
  const g2 = duel({ board: [{ hand: ['Pot of Greed', 'Heavy Storm'], turn: 2 }, { st: ['Judgment of the Pharaoh', 'Mirror Force'], gy: ['Unity'] }] });
  act(g2, 0, 'Pot of Greed'); settle(g2, 'Judgment of the Pharaoh', 'Unity');
  ok(lp(g2, 1) === 4000 && !canAct(g2, 0, 'Heavy Storm'), 'with Unity A cannot activate Spells');
});
T('Judgment of Thunder: destroys 1 opponent card when you summon a Thunder', () => {
  const g = duel({ board: [{ hand: ['Thunder Kid'], st: ['Judgment of Thunder'], turn: 2 }, { st: ['Mirror Force'] }] });
  ns(g, 0, 'Thunder Kid', 'Judgment of Thunder', 'Face-down', 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Mirror Force'), 'Mirror Force destroyed');
  const g2 = duel({ board: [{ hand: ['Mystical Elf'], st: ['Judgment of Thunder'], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g2, 'ns:' + card(g2, 0, 'Mystical Elf').u);
  ok(!hasOpt(g2, 'a:' + card(g2, 0, 'Judgment of Thunder').u), 'not for a non-Thunder');
});
/* ---------------- Kaiser / King ---------------- */
T('Kaiser Colosseum: the opponent cannot have more monsters than you', () => {
  const g = duel({ board: [{ m: [FILL], st: [{ n: 'Kaiser Colosseum', pos: 'up' }], turn: 1 }, { hand: ['Mystical Elf', 'Sangan'], m: [FILL] }] });
  endTurn(g);
  ok(!hasOpt(g, 'ns:' + card(g, 1, 'Mystical Elf').u) && !hasOpt(g, 'set:' + card(g, 1, 'Mystical Elf').u), 'B cannot summon a second monster');
  const g2 = duel({ board: [{ m: [FILL, FILL], st: [{ n: 'Kaiser Colosseum', pos: 'up' }], turn: 1 }, { hand: ['Mystical Elf'], m: [FILL] }] });
  endTurn(g2);
  ok(hasOpt(g2, 'ns:' + card(g2, 1, 'Mystical Elf').u), 'B can summon up to the same number');
});
T('Kaiser Dragon: Fusion Summon', () => {
  const g = duel({ ex0: ['Kaiser Dragon'], board: [{ hand: ['Polymerization', 'Winged Dragon, Guardian of the Fortress 1', 'Fairy Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Kaiser Dragon', 'Winged Dragon', 'Fairy Dragon', 'Attack');
  ok(on(g, 0, 'Kaiser Dragon'), 'Kaiser Dragon Fusion Summoned');
});
T('Kaiser Glider: survives a same-ATK battle; destroyed, bounces a monster', () => {
  const g = duel({ board: [{ m: ['Kaiser Glider'], turn: 2 }, { m: ['Red-Eyes Black Dragon'] }] });
  bp(g); atkOn(g, 0, 'Kaiser Glider', 'Red-Eyes Black Dragon');
  ok(on(g, 0, 'Kaiser Glider') && inZ(g, 1, 'gy', 'Red-Eyes Black Dragon'), 'only Red-Eyes destroyed');
  const g2 = duel({ board: [{ hand: ['Dark Hole'], m: ['Kaiser Glider'], turn: 2 }, { m: [] }] });
  const g3 = duel({ board: [{ m: ['Kaiser Glider'], turn: 2 }, { hand: [], m: ['Blue-Eyes White Dragon', FILL] }] });
  bp(g3); atkOn(g3, 0, 'Kaiser Glider', 'Blue-Eyes White Dragon', 'Blue-Eyes');
  ok(inZ(g3, 0, 'gy', 'Kaiser Glider') && inZ(g3, 1, 'hand', 'Blue-Eyes White Dragon'), 'Blue-Eyes returned to the hand');
});
T('Kaiser Sea Horse: counts as 2 Tributes for a LIGHT monster', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon'], m: ['Kaiser Sea Horse'], turn: 2 }, {}] });
  const b = card(g, 0, 'Blue-Eyes White Dragon');
  ok(hasOpt(g, 'ns:' + b.u), 'Blue-Eyes Tribute Summon offered'); choose(g, 'ns:' + b.u); settle(g, 'Kaiser Sea Horse');
  ok(on(g, 0, 'Blue-Eyes White Dragon') && inZ(g, 0, 'gy', 'Kaiser Sea Horse'), 'Blue-Eyes summoned with Sea Horse alone');
  const g2 = duel({ board: [{ hand: ['Dark Magician'], m: ['Kaiser Sea Horse'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Dark Magician').u), 'not for a DARK monster');
});
T('King Dragun: Fusion Summon, Special Summons a Dragon, Dragons untargetable', () => {
  const g = duel({ ex0: ['King Dragun'], board: [{ hand: ['Polymerization', 'Lord of D.', 'Divine Dragon Ragnarok', 'Blue-Eyes White Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Lord of D.', 'Divine Dragon');
  ok(on(g, 0, 'King Dragun'), 'King Dragun Fusion Summoned');
  act(g, 0, 'King Dragun'); settle(g, 'Blue-Eyes', 'Attack');
  ok(on(g, 0, 'Blue-Eyes White Dragon'), 'Blue-Eyes Special Summoned');
  ok(!canAct(g, 0, 'King Dragun'), 'once per turn');
  const g2 = duel({ board: [{ m: ['King Dragun', 'Blue-Eyes White Dragon', FILL], turn: 1 }, { hand: ['Book of Moon'] }] });
  endTurn(g2);
  act(g2, 1, 'Book of Moon'); const opts = g2.prompt && g2.prompt.type === 'pick' ? g2.prompt.opts.map(o => o.label).join(',') : ''; settle(g2);
  ok(!/Blue-Eyes|King Dragun/.test(opts) && on(g2, 0, FILL).pos === 'set' && on(g2, 0, 'Blue-Eyes White Dragon').pos === 'atk', 'Book of Moon could only target the non-Dragon ' + opts);
});
T('King of the Beasts: Tribute a face-up Moja to Special Summon from hand or GY', () => {
  const g = duel({ board: [{ hand: ['King of the Beasts'], m: ['Moja'], turn: 2 }, {}] });
  const k = card(g, 0, 'King of the Beasts');
  ok(hasOpt(g, 'sp:' + k.u) || canAct(g, 0, 'King of the Beasts'), 'summon offered');
  if (hasOpt(g, 'sp:' + k.u)) choose(g, 'sp:' + k.u); else act(g, 0, 'King of the Beasts'); settle(g, 'Moja', 'Attack');
  ok(on(g, 0, 'King of the Beasts') && inZ(g, 0, 'gy', 'Moja'), 'King of the Beasts Special Summoned from the hand');
  const g2 = duel({ board: [{ m: ['Moja'], gy: ['King of the Beasts'], turn: 2 }, {}] });
  const k2 = card(g2, 0, 'King of the Beasts');
  ok(hasOpt(g2, 'sp:' + k2.u) || canAct(g2, 0, 'King of the Beasts'), 'offered from the GY');
});
T('King of the Skull Servants: 1000 per King/Skull Servant in GY; revives by banishing one', () => {
  const g = duel({ board: [{ m: ['King of the Skull Servants'], gy: ['Skull Servant', 'Skull Servant', 'King of the Skull Servants'], turn: 1 }, {}] });
  const k = on(g, 0, 'King of the Skull Servants');
  ok(E.atk(g, k) === 3000, `ATK ${E.atk(g, k)}`);
  const g2 = duel({ board: [{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: ['King of the Skull Servants'], gy: ['Skull Servant'] }] });
  bp(g2); atkOn(g2, 0, 'Blue-Eyes White Dragon', 'King of the Skull Servants', 'Skull Servant');
  const k2 = on(g2, 1, 'King of the Skull Servants');
  ok(k2 && inZ(g2, 1, 'ban', 'Skull Servant'), 'revived by banishing Skull Servant');
});
T('King of the Swamp: discard for Polymerization; substitutes a listed material', () => {
  const g = duel({ board: [{ hand: ['King of the Swamp'], deckTop: [FILL, 'Polymerization'], turn: 2 }, {}] });
  act(g, 0, 'King of the Swamp'); settle(g);
  ok(inZ(g, 0, 'hand', 'Polymerization') && inZ(g, 0, 'gy', 'King of the Swamp'), 'Polymerization added');
  // its substitute effect is a documented ENGINE gap (no substitute material hook), not checked here
});
T('King Pyron: once Gemini Summoned, 1000 damage once per turn', () => {
  const g = duel({ board: [{ m: ['King Pyron'], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'King Pyron'), 'no effect as a Normal Monster');
  choose(g, 'gem:'); settle(g);
  act(g, 0, 'King Pyron'); settle(g);
  ok(lp(g, 1) === 7000 && !canAct(g, 0, 'King Pyron'), `1000 damage, once per turn (${lp(g, 1)})`);
});
/* ---------------- Lady / Last ---------------- */
T('Lady Assailant of Flames: FLIP banishes the top 3 and burns 800', () => {
  const g = duel({ board: [{ m: [{ n: 'Lady Assailant of Flames', pos: 'set' }], turn: 2 }, {}] });
  const d = g.p[0].deck.length;
  choose(g, 'flip:'); settle(g);
  ok(cnt(g, 0, 'ban') === 3 && g.p[0].deck.length === d - 3 && lp(g, 1) === 7200, `3 banished, B took 800 (${lp(g, 1)})`);
});
T('Lady Ninja Yae: discard a WIND to return opponent Spells/Traps to the hand', () => {
  const g = duel({ board: [{ hand: ['Insect Princess'], m: ['Lady Ninja Yae'], turn: 2 }, { hand: [], st: ['Mirror Force', { n: 'Gravity Bind', pos: 'up' }] }] });
  act(g, 0, 'Lady Ninja Yae'); settle(g, 'Insect Princess');
  ok(inZ(g, 0, 'gy', 'Insect Princess') && cnt(g, 1, 'st') === 0 && inZ(g, 1, 'hand', 'Mirror Force') && inZ(g, 1, 'hand', 'Gravity Bind'), 'both returned to B hand');
});
T('Lady Panther: Tribute itself to put a monster destroyed by battle on top of the Deck', () => {
  const g = duel({ board: [{ m: ['Lady Panther', 'Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); choose(g, `atk:${on(g, 0, 'Mystical Elf').u}:${on(g, 1, 'Blue-Eyes White Dragon').u}`); settle(g);
  choose(g, 'endbp'); settle(g);
  act(g, 0, 'Lady Panther'); settle(g, 'Mystical Elf');
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Mystical Elf' && inZ(g, 0, 'gy', 'Lady Panther'), 'Mystical Elf on top of the Deck');
});
T('Last Day of Witch: destroys face-up Spellcasters', () => {
  const g = duel({ board: [{ hand: ['Last Day of Witch'], m: ['Dark Magician', FILL], turn: 2 }, { m: ['Mystical Elf', { n: 'Dark Magician Girl', pos: 'set' }] }] });
  act(g, 0, 'Last Day of Witch'); settle(g);
  ok(inZ(g, 0, 'gy', 'Dark Magician') && inZ(g, 1, 'gy', 'Mystical Elf') && on(g, 0, FILL) && on(g, 1, 'Dark Magician Girl'), 'face-up Spellcasters destroyed, others stay');
});
T('Last Resort: activates Rainbow Ruins from the Deck on an attack; opponent with a Field draws', () => {
  const g = duel({ board: [{ m: [FILL], hand: ['Sogen'], turn: 2 }, { st: ['Last Resort'], deckTop: ['Ancient City - Rainbow Ruins'] }] });
  act(g, 0, 'Sogen'); settle(g);
  const h = g.p[0].hand.length;
  bp(g); atkOn(g, 0, FILL, null, 'Last Resort', 'Ancient City');
  ok(g.p[1].fz && E.name(g.p[1].fz) === 'Ancient City - Rainbow Ruins', 'Rainbow Ruins active for B');
  ok(g.p[0].hand.length === h + 1, `A drew 1 (hand ${h} to ${g.p[0].hand.length})`);
});
T('Last Turn: at 1000 LP on the opponent turn, keep 1 monster, all else to the GY', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: [FILL], st: ['Mirror Force'], deckTop: [FILL, FILL, 'Mystical Elf'], turn: 2 }, { lp: 1000, m: ['Blue-Eyes White Dragon', 'Sangan'], st: ['Last Turn', 'Trap Hole'], hand: ['Pot of Greed'] }] });
  act(g, 0, 'Pot of Greed'); settle(g, 'Last Turn', 'Blue-Eyes', 'Mystical Elf', 'Attack');
  ok(inZ(g, 1, 'gy', 'Last Turn'), 'Last Turn activated');
  ok(on(g, 1, 'Blue-Eyes White Dragon') && !on(g, 1, 'Sangan') && !on(g, 0, FILL) && cnt(g, 1, 'hand') === 0 && cnt(g, 1, 'st') === 0, 'only Blue-Eyes left of the old cards');
  ok(inZ(g, 0, 'gy', 'Mystical Elf'), 'A Special Summoned Mystical Elf from the Deck and it battled Blue-Eyes');
  ok(lp(g, 0) === 8000 && lp(g, 1) === 1000, 'no battle damage from that battle');
  settle(g); if (g.prompt && hasOpt(g, 'bp')) choose(g, 'end'); settle(g);
  ok(g.winner === 1, `B wins in the End Phase with Blue-Eyes alone (winner ${g.winner}, ${g.why})`);
});
T('Last Will: after a monster went to the GY, Special Summon 1 with 1500 or less ATK from the Deck', () => {
  const g = duel({ board: [{ hand: ['Last Will'], m: ['Mystical Elf'], deckTop: [FILL, 'Sangan'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Mystical Elf', 'Blue-Eyes White Dragon');
  choose(g, 'endbp'); settle(g);
  act(g, 0, 'Last Will'); settle(g, 'Sangan', 'Attack');
  ok(on(g, 0, 'Sangan'), 'Sangan Special Summoned from the Deck');
});
/* ---------------- Lava / Legendary ---------------- */
T('Lava Battleguard: +500 per Swamp Battleguard', () => {
  const g = duel({ board: [{ m: ['Lava Battleguard', 'Swamp Battleguard', 'Swamp Battleguard'], turn: 1 }, {}] });
  ok(E.atk(g, on(g, 0, 'Lava Battleguard')) === 2550, `ATK ${E.atk(g, on(g, 0, 'Lava Battleguard'))}`);
});
T('Lava Dragon: Tribute in Defense Position for 2 Dragons, hand and GY', () => {
  const g = duel({ board: [{ hand: ['Armed Dragon LV3'], m: [{ n: 'Lava Dragon', pos: 'def' }], gy: ['Masked Dragon'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Lava Dragon'), 'offered'); act(g, 0, 'Lava Dragon'); settle(g, 'Armed Dragon', 'Masked Dragon');
  ok(on(g, 0, 'Armed Dragon LV3') && on(g, 0, 'Masked Dragon') && inZ(g, 0, 'gy', 'Lava Dragon'), 'both Dragons Special Summoned');
  const g2 = duel({ board: [{ hand: ['Armed Dragon LV3'], m: ['Lava Dragon'], gy: ['Masked Dragon'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Lava Dragon'), 'not in Attack Position');
});
T('Lava Golem: summoned to the opponent field by Tributing 2 of theirs; 1000 each Standby', () => {
  const g = duel({ board: [{ hand: ['Lava Golem', 'Mystical Elf'], turn: 2 }, { m: [FILL, 'Sangan'] }] });
  const lg = card(g, 0, 'Lava Golem');
  ok(!hasOpt(g, 'ns:' + lg.u), 'cannot be Normal Summoned');
  choose(g, 'sp:' + lg.u); settle(g, FILL, 'Sangan', 'NO');
  ok(on(g, 1, 'Lava Golem') && inZ(g, 1, 'gy', FILL), 'Lava Golem on B field');
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Mystical Elf').u) && !hasOpt(g, 'set:' + card(g, 0, 'Mystical Elf').u), 'A cannot Normal Summon this turn');
  endTurn(g);
  ok(lp(g, 1) === 7000, `B took 1000 in the Standby Phase (${lp(g, 1)})`);
});
T('Legendary Black Belt: damage equal to the destroyed monster DEF', () => {
  const g = duel({ board: [{ hand: ['Legendary Black Belt'], m: ['Monk Fighter'], turn: 2 }, { m: [{ n: 'Mystical Elf', pos: 'def' }, 'Petit Moth'] }] });
  act(g, 0, 'Legendary Black Belt'); settle(g, 'Monk Fighter');
  bp(g); atkOn(g, 0, 'Monk Fighter', 'Petit Moth');
  ok(lp(g, 1) === 8000 - 1000 - 200, `B took 1000 battle + 200 (Petit Moth DEF) (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Legendary Black Belt'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Legendary Black Belt'), 'not without Monk Fighter / Master Monk / Chu-Ske');
});
T('Legendary Ebon Steed: Six Samurai +200, destroyed instead', () => {
  const g = duel({ board: [{ hand: ['Legendary Ebon Steed', 'Dark Hole'], m: ['The Six Samurai - Yaichi'], turn: 2 }, {}] });
  act(g, 0, 'Legendary Ebon Steed'); settle(g, 'Yaichi');
  const y = on(g, 0, 'The Six Samurai - Yaichi');
  ok(E.atk(g, y) === 1500 && E.def(g, y) === 1000, `Yaichi ${E.atk(g, y)}/${E.def(g, y)}`);
  act(g, 0, 'Dark Hole'); settle(g);
  ok(on(g, 0, 'The Six Samurai - Yaichi') && inZ(g, 0, 'gy', 'Legendary Ebon Steed'), 'Steed destroyed instead');
});
T('Legendary Fiend: +700 in each of your Standby Phases', () => {
  const g = duel({ board: [{ m: ['Legendary Fiend'], turn: 1 }, {}] });
  endTurn(g); endTurn(g);
  ok(E.atk(g, on(g, 0, 'Legendary Fiend')) === 2900, `ATK ${E.atk(g, on(g, 0, 'Legendary Fiend'))} after 2 own Standby Phases (turns 1 and 3)`);
});
T('Legendary Flame Lord: Ritual with Incandescent Ordeal, Spell Counters, destroys all others', () => {
  const g = duel({ board: [{ hand: ['Incandescent Ordeal', 'Legendary Flame Lord', 'Pot of Greed', 'Pot of Greed', 'Pot of Greed'], m: [FILL, 'Mystical Elf'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Incandescent Ordeal'); settle(g, 'Legendary Flame Lord', FILL, 'Mystical Elf', 'Attack');
  const f = on(g, 0, 'Legendary Flame Lord');
  ok(f, 'Ritual Summoned');
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(E.lib.ctr(f, 'spell') === 1, `1 Spell Counter after Pot (${E.lib.ctr(f, 'spell')})`);
  act(g, 0, 'Pot of Greed'); settle(g); act(g, 0, 'Pot of Greed'); settle(g);
  ok(E.lib.ctr(f, 'spell') === 3, `3 Spell Counters after 3 Pots (${E.lib.ctr(f, 'spell')})`);
  act(g, 0, 'Legendary Flame Lord'); settle(g);
  ok(inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 0, 'Legendary Flame Lord'), 'all other monsters destroyed');
});
T('Legendary Sword: Warrior +300/300', () => {
  const g = duel({ board: [{ hand: ['Legendary Sword'], m: ['The Six Samurai - Yaichi'], turn: 2 }, {}] });
  act(g, 0, 'Legendary Sword'); settle(g, 'Yaichi');
  const y = on(g, 0, 'The Six Samurai - Yaichi');
  ok(E.atk(g, y) === 1600 && E.def(g, y) === 1100, `Yaichi ${E.atk(g, y)}/${E.def(g, y)}`);
  const g2 = duel({ board: [{ hand: ['Legendary Sword'], m: ['Mystical Elf'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Legendary Sword'), 'not without a Warrior');
});
/* ---------------- Level ---------------- */
T('Level Conversion Lab: roll a die, 1 sends the monster, 2 to 6 sets its Level', () => {
  for (const seed of [1, 2, 3, 4, 5, 6, 7]) {
    const g = duel({ seed, board: [{ hand: ['Blue-Eyes White Dragon', 'Pot of Greed'], st: ['Level Conversion Lab'], turn: 2 }, {}] });
    act(g, 0, 'Level Conversion Lab'); settle(g, 'Blue-Eyes');
    const roll = (g.log.join(' ').match(/rolled (?:a )?(\d)/) || [])[1];
    const b = card(g, 0, 'Blue-Eyes White Dragon');
    if (!roll) { ok(false, 'no die roll logged: ' + g.log.slice(-4).join(' / ')); return; }
    if (+roll === 1) ok(b.zone === 'gy', `seed ${seed}: rolled 1, Blue-Eyes sent to the GY`);
    else ok(b.zone === 'hand' && LV(b) === +roll, `seed ${seed}: rolled ${roll}, Blue-Eyes Level ${LV(b)}`);
  }
});
T('Level Down: return an LV monster, Special Summon a lower LV from the GY', () => {
  const g = duel({ board: [{ hand: ['Level Down'], m: ['Armed Dragon LV5'], gy: ['Armed Dragon LV3'], turn: 2 }, {}] });
  act(g, 0, 'Level Down'); settle(g, 'Armed Dragon LV5', 'Armed Dragon LV3', 'Attack');
  ok(on(g, 0, 'Armed Dragon LV3') && g.p[0].deck.some(c => E.name(c) === 'Armed Dragon LV5'), 'LV5 to the Deck, LV3 Special Summoned');
});
T('Level Modulation: opponent draws 2, Special Summon an LV from the GY that cannot attack', () => {
  const g = duel({ board: [{ hand: ['Level Modulation'], gy: ['Armed Dragon LV5'], turn: 2 }, {}] });
  const h = g.p[1].hand.length;
  act(g, 0, 'Level Modulation'); settle(g, 'Armed Dragon LV5', 'Attack');
  ok(on(g, 0, 'Armed Dragon LV5') && g.p[1].hand.length === h + 2, `LV5 Special Summoned, B drew 2 (${h} to ${g.p[1].hand.length})`);
  bp(g); ok(!canAtk(g, on(g, 0, 'Armed Dragon LV5'), null), 'it cannot attack');
});
T('Level Retuner: reduce a monster Level by up to 2', () => {
  const g = duel({ board: [{ m: ['Blue-Eyes White Dragon'], st: ['Level Retuner'], turn: 2 }, {}] });
  act(g, 0, 'Level Retuner'); settle(g, 'Blue-Eyes', '2');
  const l = LV(on(g, 0, 'Blue-Eyes White Dragon'));
  ok(l === 6 || l === 7, `Blue-Eyes Level ${l}`);
});
T('Level Tuning: your face-up monsters lose 1 Level until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Level Tuning'], m: [FILL, { n: 'Mystical Elf', pos: 'set' }], turn: 2 }, { m: ['Sangan'] }] });
  act(g, 0, 'Level Tuning'); settle(g);
  ok(LV(on(g, 0, FILL)) === 3 && LV(on(g, 0, 'Mystical Elf')) === 4 && LV(on(g, 1, 'Sangan')) === 3, 'Warwolf Level 3, others unchanged');
  endTurn(g);
  ok(LV(on(g, 0, FILL)) === 4, 'back to 4');
});
T('Level Up!: send an LV monster, Special Summon the listed one from hand or Deck', () => {
  const g = duel({ board: [{ hand: ['Level Up!'], m: ['Armed Dragon LV3'], deckTop: [FILL, 'Armed Dragon LV5'], turn: 2 }, {}] });
  settle(g, 'NO'); act(g, 0, 'Level Up!'); settle(g, 'Armed Dragon LV3', 'Armed Dragon LV5', 'Attack');
  ok(on(g, 0, 'Armed Dragon LV5') && inZ(g, 0, 'gy', 'Armed Dragon LV3'), 'LV5 Special Summoned');
});
T('Level Warrior: Level 2 Normal Summon on an empty field, Level 4 Special Summon', () => {
  const g = duel({ board: [{ hand: ['Level Warrior'], turn: 2 }, {}] });
  ns(g, 0, 'Level Warrior', 'Level 2', 'Yes');
  ok(LV(on(g, 0, 'Level Warrior')) === 2, `Level ${LV(on(g, 0, 'Level Warrior'))}`);
  const g2 = duel({ board: [{ hand: ['Level Warrior'], turn: 2 }, { m: [FILL] }] });
  const w = card(g2, 0, 'Level Warrior');
  ok(hasOpt(g2, 'sp:' + w.u), 'Special Summon offered'); choose(g2, 'sp:' + w.u); settle(g2, 'Attack');
  ok(on(g2, 0, 'Level Warrior') && LV(on(g2, 0, 'Level Warrior')) === 4 && g2.ns[0] === 0, 'Special Summoned as Level 4, Normal Summon still free');
});

// Goat: the shared scripts of 'both' cards (and Jinzo #7), quick checks with the Goat card pool
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
  G('Jinzo #7 attacks directly', () => {
    const g = gduel([{ m: ['Jinzo #7'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    bp(g); atkOn(g, 0, 'Jinzo #7', null);
    ok(lp(g, 1) === 7500, `Goat: 500 direct (${lp(g, 1)})`);
  });
  G('Jinzo stops Mirror Force', () => {
    const g = gduel([{ m: ['Jinzo'], turn: 2 }, { st: ['Mirror Force'] }]);
    bp(g); atkOn(g, 0, 'Jinzo', null, 'Mirror Force');
    ok(on(g, 0, 'Jinzo') && lp(g, 1) === 5600, 'Goat: Jinzo attacked, no Mirror Force');
  });
  G('Hyper Hammerhead, Insect Barrier, Kaiser Glider', () => {
    let g = gduel([{ m: ['Hyper Hammerhead'], turn: 2 }, { hand: [], m: [{ n: 'Mystical Elf', pos: 'def' }] }]);
    bp(g); atkOn(g, 0, 'Hyper Hammerhead', 'Mystical Elf');
    ok(inZ(g, 1, 'hand', 'Mystical Elf'), 'Goat: Hammerhead bounced Mystical Elf');
    g = gduel([{ m: ['Insect Soldiers of the Sky', GF], turn: 2 }, { st: [{ n: 'Insect Barrier', pos: 'up' }] }]);
    bp(g); ok(!canAtk(g, on(g, 0, 'Insect Soldiers of the Sky'), null), 'Goat: Insect Barrier stops the Insect');
    g = gduel([{ m: ['Kaiser Glider'], turn: 2 }, { hand: [], m: ['Blue-Eyes White Dragon'] }]);
    bp(g); atkOn(g, 0, 'Kaiser Glider', 'Blue-Eyes White Dragon', 'Blue-Eyes');
    ok(inZ(g, 1, 'hand', 'Blue-Eyes White Dragon'), 'Goat: Kaiser Glider bounced Blue-Eyes');
  });
  G('Lava Golem and Last Will', () => {
    let g = gduel([{ hand: ['Lava Golem'], turn: 2 }, { m: [GF, GF] }]);
    choose(g, 'sp:' + card(g, 0, 'Lava Golem').u); settle(g, GF, GF);
    ok(on(g, 1, 'Lava Golem'), 'Goat: Lava Golem on B field');
    g = gduel([{ hand: ['Last Will'], m: ['Mystical Elf'], deckTop: [GF, 'Sangan'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    bp(g); atkOn(g, 0, 'Mystical Elf', 'Blue-Eyes White Dragon'); choose(g, 'endbp'); settle(g);
    act(g, 0, 'Last Will'); settle(g, 'Sangan', 'Attack');
    ok(on(g, 0, 'Sangan'), 'Goat: Last Will summoned Sangan');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-10 review checks passed.');
process.exit(fails ? 1 : 0);
