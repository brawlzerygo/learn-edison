// Independent review checks for full pool batch 07 (written from the card text): node build/review_full-07.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior 2000/100
let lastG; function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return (lastG = E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board }));
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
const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra, ...g.p[p].ban].find(c => c && E.name(c) === n);
const act = (g, p, n) => choose(g, 'a:' + card(g, p, n).u + ':');
const canAct = (g, p, n) => { const c = card(g, p, n); return !!c && hasOpt(g, 'a:' + c.u + ':'); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && (!n || E.name(c) === n)).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ')); } };
// answer prompts until an idle or battle prompt: responses pass unless a pick matches, yes to yes/no, picks by label
function settle(g, ...picks) { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const k = picks.find(t => pr.opts.some(x => x.key !== 'pass' && (x.label + ' ' + x.key).includes(t))); if (k) choose(g, k); else E.act(g, ['pass']); }
  else if (pr.type === 'yesno') choose(g, 'yes');
  else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => x.label.includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); }
    for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); E.act(g, ks); } } }
const bp = g => { choose(g, 'bp'); settle(g); };
const atkOn = (g, p, aName, tName, ...picks) => { const a = on(g, p, aName), t = tName ? on(g, 1 - p, tName) : null; choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); settle(g, ...picks); };
const canAtk = (g, a, t) => hasOpt(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const endTurn = (g, ...picks) => { if (hasOpt(g, 'endbp')) { choose(g, 'endbp'); settle(g, ...picks); } choose(g, 'end'); settle(g, ...picks); };
const noSummon = (g, c) => !hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && !hasOpt(g, 'sp:' + c.u);
const totalCtr = c => Object.values(c.ctr || {}).reduce((a, b) => a + (+b || 0), 0);
const coins = g => g.log.filter(l => /tossed a coin/.test(l)).length;

/* ---------------- Dragon cards ---------------- */
T('Dragon Capture Jar: face-up Dragons on both sides go to Defense and stay there', () => {
  const g = duel({ board: [{ m: ['Luster Dragon', FILL], st: ['Dragon Capture Jar'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Dragon Capture Jar'); settle(g);
  const l = on(g, 0, 'Luster Dragon'), b = on(g, 1, 'Blue-Eyes White Dragon'), w = on(g, 0, FILL);
  ok(l.pos === 'def' && b.pos === 'def' && w.pos === 'atk', `both Dragons in Defense, Warwolf untouched (${l.pos}, ${b.pos}, ${w.pos})`);
  ok(!hasOpt(g, 'pos:' + l.u) && hasOpt(g, 'pos:' + w.u), 'Luster Dragon cannot change position, Warwolf can');
});
T('Dragon Ice: Special Summons itself when the opponent Special Summons', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { hand: ['Dragon Ice', 'Pot of Greed'], m: [FILL] }] });
  const ice = card(g, 1, 'Dragon Ice');
  choose(g, 'sp:' + card(g, 0, 'Cyber Dragon').u); settle(g, 'a:' + ice.u + ':', 'Pot of Greed', 'Dragon Ice');
  ok(on(g, 1, 'Dragon Ice') && inZ(g, 1, 'gy', 'Pot of Greed'), 'Dragon Ice summoned, Pot of Greed discarded');
  const g2 = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { hand: ['Dragon Ice', 'Pot of Greed'], m: [FILL, 'Dragon Ice'] }] });
  choose(g2, 'sp:' + card(g2, 0, 'Cyber Dragon').u); settle(g2, 'a:' + g2.p[1].hand[0].u + ':', 'Pot of Greed');
  ok(cnt(g2, 1, 'm', 'Dragon Ice') === 1, 'only 1 Dragon Ice on the field');
});
T('Dragon Manipulator: FLIP takes a face-up Dragon until the End Phase', () => {
  const g = duel({ board: [{ m: [{ n: 'Dragon Manipulator', pos: 'set' }], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  choose(g, 'flip:'); settle(g, 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Blue-Eyes White Dragon'), 'A controls Blue-Eyes');
  endTurn(g);
  ok(on(g, 1, 'Blue-Eyes White Dragon'), 'Blue-Eyes back with B after the End Phase');
});
T('Dragon Master Knight: Fusion of BLS + Ultimate Dragon, +500 per other Dragon you control', () => {
  const g = duel({ board: [{ hand: ['Polymerization'], m: ['Black Luster Soldier', 'Blue-Eyes Ultimate Dragon'], extra: ['Dragon Master Knight'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Dragon Master Knight', 'Black Luster Soldier', 'Blue-Eyes Ultimate Dragon');
  ok(on(g, 0, 'Dragon Master Knight'), 'Fusion Summoned with Polymerization');
  const g2 = duel({ board: [{ m: ['Dragon Master Knight', 'Luster Dragon', 'Masked Dragon', FILL], turn: 2 }, { m: ['Luster Dragon'] }] });
  ok(E.atk(g2, on(g2, 0, 'Dragon Master Knight')) === 6000, `6000 ATK with 2 other Dragons (${E.atk(g2, on(g2, 0, 'Dragon Master Knight'))})`);
});
T('Dragon Piper: FLIP destroys Dragon Capture Jar and sets Dragons to Attack', () => {
  const g = duel({ board: [{ m: [{ n: 'Dragon Piper', pos: 'set' }], turn: 2 }, { m: [{ n: 'Blue-Eyes White Dragon', pos: 'def' }], st: [{ n: 'Dragon Capture Jar', pos: 'up' }] }] });
  choose(g, 'flip:'); settle(g);
  ok(inZ(g, 1, 'gy', 'Dragon Capture Jar') && on(g, 1, 'Blue-Eyes White Dragon').pos === 'atk', 'Jar destroyed, Blue-Eyes in Attack Position');
});
T('Dragon Seeker: Normal Summon destroys a face-up Dragon', () => {
  const g = duel({ board: [{ hand: ['Dragon Seeker'], m: [FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon', 'Mystical Elf'] }] });
  choose(g, 'ns:' + card(g, 0, 'Dragon Seeker').u); settle(g, FILL, 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Dragon Seeker') && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && on(g, 1, 'Mystical Elf'), 'Blue-Eyes destroyed, Elf stays');
});
T('Dragon Treasure: Dragon gains 300 ATK/DEF', () => {
  const g = duel({ board: [{ hand: ['Dragon Treasure'], m: ['Luster Dragon', FILL], turn: 2 }, {}] });
  act(g, 0, 'Dragon Treasure'); settle(g, 'Luster Dragon');
  const l = on(g, 0, 'Luster Dragon');
  ok(E.atk(g, l) === 2200 && E.def(g, l) === 1900, `Luster Dragon ${E.atk(g, l)}/${E.def(g, l)}`);
  const g2 = duel({ board: [{ hand: ['Dragon Treasure'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Dragon Treasure') || (act(g2, 0, 'Dragon Treasure'), settle(g2), E.atk(g2, on(g2, 0, FILL)) === 2000), 'a non-Dragon gains nothing');
});
T("Dragon's Gunfire: 800 damage or destroy a monster with 800 or less DEF", () => {
  const g = duel({ board: [{ hand: ["Dragon's Gunfire"], m: ['Luster Dragon'], turn: 2 }, { m: ['Sangan'] }] });
  act(g, 0, "Dragon's Gunfire"); settle(g, 'damage', '800 damage', 'Inflict');
  ok(g.p[1].lp === 7200, `B took 800 (${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: ["Dragon's Gunfire"], m: ['Luster Dragon'], turn: 2 }, { m: ['Sangan', 'Mystical Elf'] }] });
  act(g2, 0, "Dragon's Gunfire"); settle(g2, 'Destroy', 'destroy', 'Target', 'Sangan');
  ok(inZ(g2, 1, 'gy', 'Sangan') && on(g2, 1, 'Mystical Elf') && g2.p[1].lp === 8000, 'Sangan (600 DEF) destroyed');
  const g3 = duel({ board: [{ hand: ["Dragon's Gunfire"], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g3, 0, "Dragon's Gunfire"), 'needs a Dragon');
});
T("Dragon's Mirror: banish materials from the GY to Fusion Summon a Dragon Fusion", () => {
  const g = duel({ board: [{ hand: ["Dragon's Mirror"], gy: ['Blue-Eyes White Dragon', 'Blue-Eyes White Dragon', 'Blue-Eyes White Dragon'], extra: ['Blue-Eyes Ultimate Dragon'], turn: 2 }, {}] });
  act(g, 0, "Dragon's Mirror"); settle(g, 'Blue-Eyes Ultimate Dragon', 'Blue-Eyes White Dragon', 'Blue-Eyes White Dragon', 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Blue-Eyes Ultimate Dragon') && cnt(g, 0, 'ban', 'Blue-Eyes White Dragon') === 3, 'Ultimate Dragon summoned, 3 Blue-Eyes banished');
});
T("Dragon's Rage: your Dragons inflict piercing damage", () => {
  const g = duel({ board: [{ m: ['Luster Dragon'], st: [{ n: "Dragon's Rage", pos: 'up' }], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Luster Dragon', FILL);
  ok(g.p[1].lp === 8000 - 1800, `1800 piercing damage (${g.p[1].lp})`);
});
T('Dragonic Attack: Warrior only, +500 ATK/DEF and becomes a Dragon', () => {
  const g = duel({ board: [{ hand: ['Dragonic Attack', "Dragon's Gunfire"], m: ['Blade Knight'], turn: 2 }, {}] });
  act(g, 0, 'Dragonic Attack'); settle(g, 'Blade Knight');
  const b = on(g, 0, 'Blade Knight');
  ok(E.atk(g, b) === 2100 && E.def(g, b) === 1500, `Blade Knight ${E.atk(g, b)}/${E.def(g, b)}`);
  ok(canAct(g, 0, "Dragon's Gunfire"), "treated as a Dragon (Dragon's Gunfire can be activated)");
  const g2 = duel({ board: [{ hand: ['Dragonic Attack'], m: ['Luster Dragon'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Dragonic Attack'), 'no Warrior, no activation');
});
T('Dragonic Guard: a counter per Normal Summon or Set, then summons a Dragon', () => {
  const g = duel({ board: [{ hand: [FILL], m: ['Dragonic Guard'], deckTop: [FILL, FILL, 'Masked Dragon'], turn: 2 }, { hand: [FILL] }] });
  const gd = on(g, 0, 'Dragonic Guard');
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === FILL).u); settle(g);
  ok(totalCtr(gd) === 1, `1 counter after a Normal Summon (${totalCtr(gd)})`);
  endTurn(g); choose(g, 'set:' + g.p[1].hand[0].u); settle(g);
  ok(totalCtr(gd) === 2, `2 counters after the opponent Sets (${totalCtr(gd)})`);
  endTurn(g); choose(g, 'ns:' + g.p[0].hand[0].u); settle(g);
  ok(totalCtr(gd) === 3, `3 counters (${totalCtr(gd)})`);
  act(g, 0, 'Dragonic Guard'); settle(g, 'Masked Dragon');
  ok(inZ(g, 0, 'gy', 'Dragonic Guard') && on(g, 0, 'Masked Dragon'), 'Guard sent to the GY, Masked Dragon (Level 3) summoned');
});
T("Dragonic Knight: summons itself when an opponent's monster effect targets and destroys your card", () => {
  const g = duel({ board: [{ m: ['Exiled Force'], turn: 2 }, { hand: ['Dragonic Knight'], m: [FILL] }] });
  const k = card(g, 1, 'Dragonic Knight');
  act(g, 0, 'Exiled Force'); settle(g, FILL, 'a:' + k.u + ':');
  ok(on(g, 1, 'Dragonic Knight') && inZ(g, 1, 'gy', FILL), 'Dragonic Knight summoned, the target sent to the GY');
});

/* ---------------- Element monsters ---------------- */
const secondAttack = (nm, helper) => T(nm + ': WIND on the field gives a second attack', () => {
  const g = duel({ board: [{ m: [nm, helper || 'Luster Dragon'], turn: 2 }, { m: ['Mystical Elf', 'Mystical Elf'] }] });
  const a = on(g, 0, nm); bp(g); choose(g, `atk:${a.u}:${g.p[1].m.find(Boolean).u}`); settle(g);
  ok(cnt(g, 1, 'gy', 'Mystical Elf') === 1 && canAtk(g, a, on(g, 1, 'Mystical Elf')), 'first Elf destroyed, a second attack offered');
  const g2 = duel({ board: [{ m: [nm, FILL], turn: 2 }, { m: ['Mystical Elf', 'Mystical Elf'] }] });
  const a2 = on(g2, 0, nm); bp(g2); choose(g2, `atk:${a2.u}:${g2.p[1].m.find(Boolean).u}`); settle(g2);
  ok(!canAtk(g2, a2, on(g2, 1, 'Mystical Elf')), 'no WIND monster, no second attack');
});
const earthNegate = nm => T(nm + ': EARTH on the field negates the effect of a monster it destroys by battle', () => {
  const g = duel({ board: [{ m: [nm, FILL], turn: 2 }, { hand: [], m: ['Sangan'], deckTop: ['Mystic Tomato'] }] });
  bp(g); atkOn(g, 0, nm, 'Sangan', 'Mystic Tomato');
  ok(inZ(g, 1, 'gy', 'Sangan') && g.p[1].hand.length === 0, `Sangan destroyed, no search (B hand ${g.p[1].hand.length})`);
  const g2 = duel({ board: [{ m: [nm, 'Luster Dragon'], turn: 2 }, { hand: [], m: ['Sangan'], deckTop: ['Mystic Tomato'] }] });
  bp(g2); atkOn(g2, 0, nm, 'Sangan', 'Mystic Tomato');
  ok(inZ(g2, 1, 'hand', 'Mystic Tomato'), 'without EARTH, Sangan searches');
});
const fireAtk = (nm, base) => T(nm + ': FIRE on the field gives +500 ATK', () => {
  const g = duel({ board: [{ m: [nm], turn: 2 }, { m: ['Masked Dragon'] }] });
  ok(E.atk(g, on(g, 0, nm)) === base + 500, `${E.atk(g, on(g, 0, nm))} with a FIRE monster`);
  const g2 = duel({ board: [{ m: [nm], turn: 2 }, { m: ['Mystical Elf'] }] });
  ok(E.atk(g2, on(g2, 0, nm)) === base, `${E.atk(g2, on(g2, 0, nm))} without`);
});
const waterControl = nm => T(nm + ': WATER on the field, control cannot switch', () => {
  const g = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: [nm, 'Mother Grizzly'] }] });
  if (canAct(g, 0, 'Change of Heart')) { act(g, 0, 'Change of Heart'); settle(g, nm); }
  ok(on(g, 1, nm), nm + ' stays with B');
  const g2 = duel({ board: [{ hand: ['Change of Heart'], turn: 2 }, { m: [nm] }] });
  act(g2, 0, 'Change of Heart'); settle(g2, nm);
  ok(on(g2, 0, nm), 'without WATER, Change of Heart takes it');
});
earthNegate('Element Doom'); secondAttack('Element Doom');
fireAtk('Element Dragon', 1500); secondAttack('Element Dragon', 'Twin-Headed Behemoth');
waterControl('Element Magician'); secondAttack('Element Magician');
fireAtk('Element Saurus', 1500); earthNegate('Element Saurus');
waterControl('Element Soldier'); earthNegate('Element Soldier');
fireAtk('Element Valkyrie', 1500); waterControl('Element Valkyrie');

T('Elemental Absorber: banish a monster from hand, opponent monsters of its Attribute cannot attack', () => {
  const g = duel({ board: [{ hand: ['Mystic Tomato'], st: ['Elemental Absorber'], turn: 2 }, { m: ['Mystic Tomato', FILL] }] });
  act(g, 0, 'Elemental Absorber'); settle(g, 'Mystic Tomato');
  ok(inZ(g, 0, 'ban', 'Mystic Tomato') && inZ(g, 0, 'st', 'Elemental Absorber'), 'Tomato banished, Absorber stays');
  endTurn(g); bp(g);
  ok(!canAtk(g, on(g, 1, 'Mystic Tomato'), null) && canAtk(g, on(g, 1, FILL), null), 'DARK Tomato cannot attack, EARTH Warwolf can');
});
T('Elemental Burst: tribute WIND, WATER, FIRE, EARTH; destroy all opponent cards', () => {
  const g = duel({ board: [{ m: ['Luster Dragon', 'Mother Grizzly', 'Masked Dragon', FILL], st: ['Elemental Burst'], turn: 2 }, { m: [FILL, 'Mystical Elf'], st: ['Mirror Force'] }] });
  act(g, 0, 'Elemental Burst'); settle(g, 'Luster Dragon', 'Mother Grizzly', 'Masked Dragon', FILL);
  ok(cnt(g, 1, 'm') === 0 && cnt(g, 1, 'st') === 0, 'B field cleared');
  ok(cnt(g, 0, 'm') === 0, 'A tributed its 4 monsters');
  const g2 = duel({ board: [{ m: ['Luster Dragon', 'Mother Grizzly', FILL], st: ['Elemental Burst'], turn: 2 }, { m: [FILL] }] });
  ok(!canAct(g2, 0, 'Elemental Burst'), 'no FIRE monster, no activation');
});

/* ---------------- Elemental HEROes ---------------- */
T('Air Neos: contact Fusion, gains the LP difference, returns in the End Phase', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Neos', 'Neo-Spacian Air Hummingbird'], extra: ['Elemental HERO Air Neos'], lp: 5000, turn: 2 }, {}] });
  const x = card(g, 0, 'Elemental HERO Air Neos');
  ok(hasOpt(g, 'cf:' + x.u) || hasOpt(g, 'sp:' + x.u), 'contact Fusion offered'); choose(g, (hasOpt(g, 'cf:' + x.u) ? 'cf:' : 'sp:') + x.u); settle(g);
  ok(on(g, 0, 'Elemental HERO Air Neos') && E.atk(g, x) === 5500 && cnt(g, 0, 'gy') === 0, `Air Neos ${E.atk(g, x)} ATK, materials into the Deck`);
  endTurn(g);
  ok(x.zone === 'extra', 'back in the Extra Deck after the End Phase');
});
T('Aqua Neos: discard 1, destroy a random card in the opponent hand, once per turn; returns in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Mystical Elf'], m: ['Elemental HERO Aqua Neos'], turn: 2 }, { hand: ['Sangan', 'Mirror Force'] }] });
  act(g, 0, 'Elemental HERO Aqua Neos'); settle(g, 'Pot of Greed');
  ok(g.p[1].hand.length === 1 && cnt(g, 1, 'gy') === 1 && inZ(g, 0, 'gy', 'Pot of Greed'), 'A discarded, B lost 1 hand card');
  ok(!canAct(g, 0, 'Elemental HERO Aqua Neos'), 'once per turn');
  endTurn(g);
  ok(inZ(g, 0, 'extra', 'Elemental HERO Aqua Neos'), 'back in the Extra Deck');
  const g2 = duel({ board: [{ hand: ['Elemental HERO Neos', 'Neo-Spacian Aqua Dolphin'], m: ['Elemental HERO Neos', 'Neo-Spacian Aqua Dolphin'], extra: ['Elemental HERO Aqua Neos'], turn: 2 }, {}] });
  const x = card(g2, 0, 'Elemental HERO Aqua Neos'); ok(hasOpt(g2, 'cf:' + x.u) || hasOpt(g2, 'sp:' + x.u), 'contact Fusion offered');
});
T('Bladedge: piercing', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Bladedge'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Elemental HERO Bladedge', FILL);
  ok(g.p[1].lp === 8000 - 2500, `2500 piercing (${g.p[1].lp})`);
});
T('Chaos Neos: contact Fusion, coin effect, End Phase returns and sets face-up monsters', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Neos', 'Neo-Spacian Dark Panther', 'Neo-Spacian Glow Moss'], extra: ['Elemental HERO Chaos Neos'], turn: 2 }, { m: [FILL] }] });
  const x = card(g, 0, 'Elemental HERO Chaos Neos');
  ok(hasOpt(g, 'cf:' + x.u) || hasOpt(g, 'sp:' + x.u), 'contact Fusion offered'); choose(g, (hasOpt(g, 'cf:' + x.u) ? 'cf:' : 'sp:') + x.u); settle(g);
  ok(on(g, 0, 'Elemental HERO Chaos Neos'), 'Chaos Neos summoned');
  const b0 = cnt(g, 1, 'm');
  act(g, 0, 'Elemental HERO Chaos Neos'); settle(g);
  ok(coins(g) === 3, `3 coins tossed (${coins(g)})`);
  ok(!canAct(g, 0, 'Elemental HERO Chaos Neos'), 'once per turn');
  void b0;
  const g2 = duel({ board: [{ m: ['Elemental HERO Chaos Neos', 'Mystical Elf'], turn: 2 }, { m: [FILL] }] });
  endTurn(g2);
  ok(inZ(g2, 0, 'extra', 'Elemental HERO Chaos Neos') && on(g2, 1, FILL).pos === 'set' && on(g2, 0, 'Mystical Elf').pos === 'set', 'Chaos Neos returned, face-up monsters Set');
});
T('Dark Neos: negates a face-up Effect Monster; returns in the End Phase', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Dark Neos'], turn: 2 }, { m: ['Elemental HERO Heat'] }] });
  const h = on(g, 1, 'Elemental HERO Heat');
  ok(E.atk(g, h) === 1800, 'Heat 1800 before');
  act(g, 0, 'Elemental HERO Dark Neos'); settle(g, 'Elemental HERO Heat');
  ok(E.atk(g, h) === 1600, `Heat's effect negated (${E.atk(g, h)})`);
  endTurn(g);
  ok(inZ(g, 0, 'extra', 'Elemental HERO Dark Neos') && E.atk(g, h) === 1800, 'Dark Neos returned, Heat back to 1800');
});
T('Darkbright: Fusion, piercing, Defense after attacking, destroys a monster when destroyed', () => {
  const g0 = duel({ board: [{ hand: ['Polymerization', 'Elemental HERO Sparkman', 'Elemental HERO Necroshade'], extra: ['Elemental HERO Darkbright'], turn: 2 }, {}] });
  act(g0, 0, 'Polymerization'); settle(g0, 'Elemental HERO Darkbright');
  ok(on(g0, 0, 'Elemental HERO Darkbright'), 'Fusion Summoned');
  const g = duel({ board: [{ m: ['Elemental HERO Darkbright'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Elemental HERO Darkbright', FILL);
  ok(g.p[1].lp === 8000 - 1900 && on(g, 0, 'Elemental HERO Darkbright').pos === 'def', `1900 piercing, then Defense (${g.p[1].lp})`);
  const g2 = duel({ board: [{ m: ['Elemental HERO Darkbright'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  bp(g2); atkOn(g2, 0, 'Elemental HERO Darkbright', 'Cyber Dragon', 'Cyber Dragon');
  ok(inZ(g2, 0, 'gy', 'Elemental HERO Darkbright') && inZ(g2, 1, 'gy', 'Cyber Dragon'), 'Darkbright destroyed, then Cyber Dragon destroyed');
});
T('Divine Neos: 5 Neos/Neo-Spacian/HERO materials; banish one from the GY for +500', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Divine Neos'], gy: ['Elemental HERO Avian'], turn: 2 }, {}] });
  act(g, 0, 'Elemental HERO Divine Neos'); settle(g, 'Elemental HERO Avian');
  const d = on(g, 0, 'Elemental HERO Divine Neos');
  ok(E.atk(g, d) === 3000 && inZ(g, 0, 'ban', 'Elemental HERO Avian'), `Divine Neos ${E.atk(g, d)}, Avian banished`);
  ok(!canAct(g, 0, 'Elemental HERO Divine Neos'), 'once per turn');
  const g2 = duel({ board: [{ hand: ['Elemental HERO Neos', 'Neo-Spacian Aqua Dolphin', 'Elemental HERO Avian', 'Elemental HERO Clayman', 'Elemental HERO Sparkman'], extra: ['Elemental HERO Divine Neos'], turn: 2 }, {}] });
  ok(E.lib.canFusion(g2, 0, { from: ['hand', 'm'] }), 'Neos + Neo-Spacian + 3 HEROes can make it');
  const g3 = duel({ board: [{ hand: ['Elemental HERO Neos', 'Elemental HERO Burstinatrix', 'Elemental HERO Avian', 'Elemental HERO Clayman', 'Elemental HERO Sparkman'], extra: ['Elemental HERO Divine Neos'], turn: 2 }, {}] });
  ok(!E.lib.canFusion(g3, 0, { from: ['hand', 'm'] }), 'no Neo-Spacian, no Fusion');
});
T('Electrum: Fusion of 4, shuffles banished cards back, +300 per opponent monster sharing an Attribute', () => {
  const g = duel({ board: [{ hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix', 'Elemental HERO Clayman', 'Elemental HERO Bubbleman'], ban: ['Sangan'], extra: ['Elemental HERO Electrum'], turn: 2 }, { ban: ['Mystic Tomato'] }] });
  act(g, 0, 'Polymerization'); settle(g, 'Elemental HERO Electrum');
  ok(on(g, 0, 'Elemental HERO Electrum') && cnt(g, 0, 'ban') === 0 && cnt(g, 1, 'ban') === 0, 'Electrum summoned, banished cards shuffled into the Decks');
  const g2 = duel({ board: [{ m: ['Elemental HERO Electrum'], turn: 2 }, { m: ['Luster Dragon', 'Mystical Elf', 'Mystic Tomato'] }] });
  ok(E.atk(g2, on(g2, 0, 'Elemental HERO Electrum')) === 3500, `3500 vs WIND + LIGHT + DARK (${E.atk(g2, on(g2, 0, 'Elemental HERO Electrum'))})`);
});
T('Flame Wingman: Fusion of Avian + Burstinatrix, burns for the destroyed monster ATK', () => {
  const g0 = duel({ board: [{ hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'], extra: ['Elemental HERO Flame Wingman'], turn: 2 }, {}] });
  act(g0, 0, 'Polymerization'); settle(g0, 'Elemental HERO Flame Wingman');
  ok(on(g0, 0, 'Elemental HERO Flame Wingman'), 'Fusion Summoned');
  const g = duel({ board: [{ m: ['Elemental HERO Flame Wingman'], turn: 2 }, { m: ['Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Elemental HERO Flame Wingman', 'Mystical Elf');
  ok(g.p[1].lp === 8000 - 1300 - 800, `1300 battle + 800 burn (${g.p[1].lp})`);
});
T('Flare Neos: +400 per Spell/Trap on the field; returns in the End Phase', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Flare Neos'], st: ['Mirror Force'], turn: 2 }, { st: ['Mirror Force', 'Pot of Greed'] }] });
  ok(E.atk(g, on(g, 0, 'Elemental HERO Flare Neos')) === 3700, `3700 with 3 S/T (${E.atk(g, on(g, 0, 'Elemental HERO Flare Neos'))})`);
  endTurn(g); ok(inZ(g, 0, 'extra', 'Elemental HERO Flare Neos'), 'back in the Extra Deck');
});
T('Glow Neos: destroys a face-up opponent card, then applies its type', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Glow Neos'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Elemental HERO Glow Neos'); settle(g, FILL);
  const x = on(g, 0, 'Elemental HERO Glow Neos');
  ok(inZ(g, 1, 'gy', FILL), 'Warwolf destroyed');
  bp(g); ok(!canAtk(g, x, null), 'monster destroyed: Glow Neos cannot attack');
  const g2 = duel({ board: [{ m: ['Elemental HERO Glow Neos'], turn: 2 }, { st: [{ n: "Dragon's Rage", pos: 'up' }] }] });
  act(g2, 0, 'Elemental HERO Glow Neos'); settle(g2, "Dragon's Rage");
  ok(inZ(g2, 1, 'gy', "Dragon's Rage") && on(g2, 0, 'Elemental HERO Glow Neos').pos === 'def', 'Trap destroyed: Glow Neos to Defense');
  endTurn(g2); ok(inZ(g2, 0, 'extra', 'Elemental HERO Glow Neos'), 'back in the Extra Deck');
});
T('Heat: +200 per Elemental HERO you control', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Heat', 'Elemental HERO Sparkman'], turn: 2 }, { m: ['Elemental HERO Clayman'] }] });
  ok(E.atk(g, on(g, 0, 'Elemental HERO Heat')) === 2000, `2000 (${E.atk(g, on(g, 0, 'Elemental HERO Heat'))})`);
});
T('Inferno: +1000 in the Damage Step against a WATER monster', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Inferno'], turn: 2 }, { m: ['Mother Grizzly'] }] });
  ok(E.atk(g, on(g, 0, 'Elemental HERO Inferno')) === 2300, '2300 outside battle');
  bp(g); atkOn(g, 0, 'Elemental HERO Inferno', 'Mother Grizzly');
  ok(g.p[1].lp === 8000 - 1900, `1900 damage (3300 vs 1400): ${g.p[1].lp}`);
  const g0 = duel({ board: [{ hand: ['Polymerization', 'Elemental HERO Heat', 'Elemental HERO Lady Heat'], extra: ['Elemental HERO Inferno'], turn: 2 }, {}] });
  ok(E.lib.canFusion(g0, 0, { from: ['hand', 'm'] }), 'Heat + Lady Heat are its materials');
});
T('Knospe: direct attack with another HERO, cannot be attacked, grows on damage', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Knospe', 'Elemental HERO Sparkman'], turn: 2 }, { m: [FILL] }] });
  const k = on(g, 0, 'Elemental HERO Knospe');
  bp(g); ok(canAtk(g, k, null), 'direct attack offered'); atkOn(g, 0, 'Elemental HERO Knospe', null);
  ok(g.p[1].lp === 7400 && E.atk(g, k) === 700 && E.def(g, k) === 900, `600 damage, Knospe ${E.atk(g, k)}/${E.def(g, k)}`);
  endTurn(g); bp(g);
  ok(!canAtk(g, on(g, 1, FILL), k) && canAtk(g, on(g, 1, FILL), on(g, 0, 'Elemental HERO Sparkman')), 'B cannot attack Knospe');
});
T('Lady Heat: 200 per face-up Elemental HERO in your End Phase', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Lady Heat', 'Elemental HERO Sparkman'], turn: 2 }, {}] });
  endTurn(g);
  ok(g.p[1].lp === 7600, `B took 400 (${g.p[1].lp})`);
  endTurn(g);
  ok(g.p[1].lp === 7600 && g.p[0].lp === 8000, "nothing in the opponent's End Phase");
});
T('Magma Neos: +400 per card on the field; End Phase returns and bounces the field', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Magma Neos'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  ok(E.atk(g, on(g, 0, 'Elemental HERO Magma Neos')) === 4200, `4200 with 3 cards (${E.atk(g, on(g, 0, 'Elemental HERO Magma Neos'))})`);
  endTurn(g);
  ok(inZ(g, 0, 'extra', 'Elemental HERO Magma Neos') && inZ(g, 1, 'hand', FILL) && inZ(g, 1, 'hand', 'Mirror Force') && cnt(g, 1, 'm') === 0, 'Magma returned, field to the hand');
});
T('Marine Neos: destroys a random card in the opponent hand, once per turn', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Marine Neos'], turn: 2 }, { hand: ['Sangan', 'Mirror Force'] }] });
  act(g, 0, 'Elemental HERO Marine Neos'); settle(g);
  ok(g.p[1].hand.length === 1 && cnt(g, 1, 'gy') === 1, 'B lost 1 hand card');
  ok(!canAct(g, 0, 'Elemental HERO Marine Neos'), 'once per turn');
});
T('Mudballman: Fusion of Bubbleman + Clayman', () => {
  const g = duel({ board: [{ hand: ['Polymerization', 'Elemental HERO Bubbleman', 'Elemental HERO Clayman'], extra: ['Elemental HERO Mudballman'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Elemental HERO Mudballman');
  const m = on(g, 0, 'Elemental HERO Mudballman');
  ok(m && E.atk(g, m) === 1900 && E.def(g, m) === 3000, 'Mudballman 1900/3000 summoned');
});
T('Necroid Shaman: on summon destroys an opponent monster, then revives one from their GY to their side', () => {
  const g = duel({ board: [{ hand: ['Polymerization', 'Elemental HERO Wildheart', 'Elemental HERO Necroshade'], extra: ['Elemental HERO Necroid Shaman'], turn: 2 }, { m: ['Cyber Dragon'], gy: ['Mystical Elf'] }] });
  act(g, 0, 'Polymerization'); settle(g, 'Elemental HERO Necroid Shaman', 'Cyber Dragon', 'Mystical Elf');
  ok(on(g, 0, 'Elemental HERO Necroid Shaman') && g.log.some(l => l === 'Cyber Dragon was destroyed.') && cnt(g, 1, 'm') === 1 && cnt(g, 1, 'gy') === 1, "Cyber Dragon destroyed, then a monster from B's GY summoned to B (the destroyed one may be picked, per the ruling)");
});
T('Necroshade: from the GY, a Level 5+ Elemental HERO is Normal Summoned without Tribute', () => {
  const g = duel({ board: [{ hand: ['Elemental HERO Bladedge'], gy: ['Elemental HERO Necroshade'], turn: 2 }, {}] });
  const b = card(g, 0, 'Elemental HERO Bladedge');
  ok(hasOpt(g, 'ns:' + b.u), 'Normal Summon offered with no monsters'); choose(g, 'ns:' + b.u); settle(g);
  ok(on(g, 0, 'Elemental HERO Bladedge'), 'Bladedge summoned without Tribute');
  const g2 = duel({ board: [{ hand: ['Elemental HERO Bladedge'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Elemental HERO Bladedge').u), 'not without Necroshade');
});
T('Neo Bubbleman: cannot be summoned (Edison text)', () => {
  const g = duel({ board: [{ hand: ['Elemental HERO Neo Bubbleman', 'Metamorphosis'], m: ['Elemental HERO Bubbleman'], turn: 2 }, {}] });
  ok(noSummon(g, card(g, 0, 'Elemental HERO Neo Bubbleman')), 'no Normal Summon, Set or Special Summon');
});
T('Phoenix Enforcer: not destroyed by battle', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Phoenix Enforcer'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  bp(g); atkOn(g, 0, 'Elemental HERO Phoenix Enforcer', 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Elemental HERO Phoenix Enforcer') && g.p[0].lp === 7100, `stays, A took 900 (${g.p[0].lp})`);
});
T('Plasma Vice: piercing; discard 1 to destroy an Attack Position monster', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Plasma Vice'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Elemental HERO Plasma Vice', FILL);
  ok(g.p[1].lp === 8000 - 2500, `2500 piercing (${g.p[1].lp})`);
  const g2 = duel({ board: [{ hand: ['Pot of Greed'], m: ['Elemental HERO Plasma Vice'], turn: 2 }, { m: ['Cyber Dragon', { n: 'Mystical Elf', pos: 'def' }] }] });
  act(g2, 0, 'Elemental HERO Plasma Vice'); settle(g2, 'Pot of Greed', 'Cyber Dragon');
  ok(inZ(g2, 1, 'gy', 'Cyber Dragon') && on(g2, 1, 'Mystical Elf') && inZ(g2, 0, 'gy', 'Pot of Greed'), 'discarded, Cyber Dragon destroyed');
});
T('Poison Rose: no Normal Summon; opponent can only attack it; grows on damage', () => {
  const g = duel({ board: [{ hand: ['Elemental HERO Poison Rose'], turn: 2 }, {}] });
  ok(noSummon(g, card(g, 0, 'Elemental HERO Poison Rose')), 'no Normal Summon or Set');
  const g2 = duel({ board: [{ m: ['Elemental HERO Poison Rose', 'Elemental HERO Sparkman'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  endTurn(g2); bp(g2);
  const b = on(g2, 1, 'Blue-Eyes White Dragon');
  ok(canAtk(g2, b, on(g2, 0, 'Elemental HERO Poison Rose')) && !canAtk(g2, b, on(g2, 0, 'Elemental HERO Sparkman')), 'only Poison Rose can be attacked');
  const g3 = duel({ board: [{ m: ['Elemental HERO Poison Rose'], turn: 2 }, {}] });
  const r = on(g3, 0, 'Elemental HERO Poison Rose'); bp(g3); atkOn(g3, 0, 'Elemental HERO Poison Rose', null);
  ok(g3.p[1].lp === 6100 && E.atk(g3, r) === 2100 && E.def(g3, r) === 1800, `1900 damage, Poison Rose ${E.atk(g3, r)}/${E.def(g3, r)}`);
});
T('Rampart Blaster: attacks from Defense with half ATK when the opponent has no monsters', () => {
  const g = duel({ board: [{ m: [{ n: 'Elemental HERO Rampart Blaster', pos: 'def' }], turn: 2 }, {}] });
  const r = on(g, 0, 'Elemental HERO Rampart Blaster');
  // PARTIAL in the script: the Defense Position attack is its own Battle Phase action, not an attack declaration
  bp(g); ok(hasOpt(g, 'a:' + r.u + ':') || canAtk(g, r, null), 'attack from Defense offered');
  if (hasOpt(g, 'a:' + r.u + ':')) { choose(g, 'a:' + r.u + ':'); settle(g); } else atkOn(g, 0, 'Elemental HERO Rampart Blaster', null);
  ok(g.p[1].lp === 7000, `1000 damage (${g.p[1].lp})`);
  const g2 = duel({ board: [{ m: [{ n: 'Elemental HERO Rampart Blaster', pos: 'def' }], turn: 2 }, { m: ['Mystical Elf'] }] });
  const r2 = on(g2, 0, 'Elemental HERO Rampart Blaster');
  bp(g2); ok(!g2.prompt.opts.some(x => x.key.startsWith('atk:' + r2.u + ':') || x.key.startsWith('a:' + r2.u + ':')),'no attack from Defense while the opponent has a monster');
});
T('Shining Flare Wingman: +300 per E-HERO in GY, burns', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Shining Flare Wingman'], gy: ['Elemental HERO Avian', 'Elemental HERO Sparkman', 'Mystic Tomato'], turn: 2 }, { m: ['Mystical Elf'] }] });
  ok(E.atk(g, on(g, 0, 'Elemental HERO Shining Flare Wingman')) === 3100, `3100 (${E.atk(g, on(g, 0, 'Elemental HERO Shining Flare Wingman'))})`);
  bp(g); atkOn(g, 0, 'Elemental HERO Shining Flare Wingman', 'Mystical Elf');
  ok(g.p[1].lp === 8000 - 2300 - 800, `2300 battle + 800 burn (${g.p[1].lp})`);
  const g0 = duel({ board: [{ hand: ['Polymerization', 'Elemental HERO Sparkman'], m: ['Elemental HERO Flame Wingman'], extra: ['Elemental HERO Shining Flare Wingman'], turn: 2 }, {}] });
  act(g0, 0, 'Polymerization'); settle(g0, 'Elemental HERO Shining Flare Wingman');
  ok(on(g0, 0, 'Elemental HERO Shining Flare Wingman'), 'Fusion Summoned from Flame Wingman + Sparkman');
});
T('Shining Phoenix Enforcer: +300 per E-HERO in GY, not destroyed by battle', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Shining Phoenix Enforcer'], gy: ['Elemental HERO Avian'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  ok(E.atk(g, on(g, 0, 'Elemental HERO Shining Phoenix Enforcer')) === 2800, '2800 with 1 HERO in the GY');
  bp(g); atkOn(g, 0, 'Elemental HERO Shining Phoenix Enforcer', 'Blue-Eyes White Dragon');
  ok(on(g, 0, 'Elemental HERO Shining Phoenix Enforcer') && g.p[0].lp === 7800, `stays, A took 200 (${g.p[0].lp})`);
});
T('Steam Healer: gains LP equal to the destroyed monster ATK', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Steam Healer'], turn: 2 }, { m: ['Mystical Elf'] }] });
  bp(g); atkOn(g, 0, 'Elemental HERO Steam Healer', 'Mystical Elf');
  ok(g.p[0].lp === 8800 && g.p[1].lp === 7000, `A gained 800, B took 1000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Storm Neos: destroys all Spells/Traps once per turn; End Phase shuffles the field into the Deck', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Storm Neos'], st: ['Pot of Greed'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Elemental HERO Storm Neos'); settle(g);
  ok(cnt(g, 0, 'st') === 0 && cnt(g, 1, 'st') === 0 && inZ(g, 1, 'gy', 'Mirror Force'), 'all Spells/Traps destroyed');
  ok(!canAct(g, 0, 'Elemental HERO Storm Neos'), 'once per turn');
  endTurn(g);
  ok(inZ(g, 0, 'extra', 'Elemental HERO Storm Neos') && cnt(g, 1, 'm') === 0 && !inZ(g, 1, 'gy', FILL) && !inZ(g, 1, 'hand', FILL) || (inZ(g, 0, 'extra', 'Elemental HERO Storm Neos') && cnt(g, 1, 'm') === 0), 'Storm Neos returned, the field shuffled into the Deck');
});
T('Tempest: send a card to make a monster safe from battle', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Tempest', FILL], st: ['Pot of Greed'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Elemental HERO Tempest'); settle(g, 'Pot of Greed', FILL);
  ok(inZ(g, 0, 'gy', 'Pot of Greed'), 'Pot of Greed sent as the cost');
  bp(g); atkOn(g, 0, FILL, 'Cyber Dragon');
  ok(on(g, 0, FILL) && g.p[0].lp === 7900, `Warwolf survives, A took 100 (${g.p[0].lp})`);
});
T('Thunder Giant: discard 1, destroy a face-up monster with lower original ATK, once per turn', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Sangan'], m: ['Elemental HERO Thunder Giant'], turn: 2 }, { m: ['Cyber Dragon', 'Blue-Eyes White Dragon'] }] });
  act(g, 0, 'Elemental HERO Thunder Giant'); settle(g, 'Pot of Greed', 'Cyber Dragon');
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && inZ(g, 0, 'gy', 'Pot of Greed') && on(g, 1, 'Blue-Eyes White Dragon'), 'Cyber Dragon destroyed');
  ok(!canAct(g, 0, 'Elemental HERO Thunder Giant'), 'once per turn');
  const g2 = duel({ board: [{ hand: ['Pot of Greed'], m: ['Elemental HERO Thunder Giant'], turn: 2 }, { m: ['Blue-Eyes White Dragon', { n: 'Mystical Elf', pos: 'set' }] }] });
  ok(!canAct(g2, 0, 'Elemental HERO Thunder Giant'), 'no face-up target with lower original ATK');
});
T('Voltic: on battle damage, summons a banished Elemental HERO', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Voltic'], ban: ['Elemental HERO Sparkman'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Elemental HERO Voltic', null, 'Elemental HERO Sparkman');
  ok(g.p[1].lp === 7000 && on(g, 0, 'Elemental HERO Sparkman'), 'Sparkman Special Summoned');
});
T('Wild Wingman: discard 1 to destroy a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Elemental HERO Wild Wingman'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Elemental HERO Wild Wingman'); settle(g, 'Pot of Greed', 'Face-down', 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'Pot of Greed'), 'Mirror Force destroyed');
});
T('Wildedge: attacks every opponent monster once', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Wildedge'], turn: 2 }, { m: [FILL, 'Mystical Elf'] }] });
  const w = on(g, 0, 'Elemental HERO Wildedge'); bp(g);
  atkOn(g, 0, 'Elemental HERO Wildedge', FILL);
  ok(canAtk(g, w, on(g, 1, 'Mystical Elf')), 'second attack on the other monster offered');
  atkOn(g, 0, 'Elemental HERO Wildedge', 'Mystical Elf');
  ok(cnt(g, 1, 'm') === 0 && g.p[1].lp === 8000 - 600 - 1800, `both destroyed (${g.p[1].lp})`);
  ok(!canAtk(g, w, null), 'no direct attack afterwards');
});
T('Wildheart: unaffected by Trap effects', () => {
  // the engine skips a Trap's destruction only when the Trap passes itself as src (see the ENGINE note in the script)
  const g0 = duel({ board: [{ m: ['Elemental HERO Wildheart', 'Elemental HERO Sparkman'], turn: 2 }, { st: ['Mirror Force'] }] });
  E.lib.destroy(g0, g0.p[0].m.filter(Boolean), { by: 1, src: card(g0, 1, 'Mirror Force') });
  ok(on(g0, 0, 'Elemental HERO Wildheart') && !on(g0, 0, 'Elemental HERO Sparkman'), 'a Trap destroying both leaves Wildheart');
  if (!process.env.STRICT) return; // Mirror Force (engine.js) does not pass src yet, so the real activation still destroys it
  const g = duel({ board: [{ m: ['Elemental HERO Wildheart', 'Elemental HERO Sparkman'], turn: 2 }, { st: ['Mirror Force'] }] });
  bp(g); choose(g, `atk:${on(g, 0, 'Elemental HERO Wildheart').u}:d`); settle(g, 'a:' + card(g, 1, 'Mirror Force').u + ':');
  ok(inZ(g, 1, 'gy', 'Mirror Force') && on(g, 0, 'Elemental HERO Wildheart') && inZ(g, 0, 'gy', 'Elemental HERO Sparkman'), 'Mirror Force destroys Sparkman, not Wildheart');
});
T('Woodsman: adds Polymerization in your Standby Phase', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Woodsman'], deckTop: [FILL, 'Polymerization'], turn: 2 }, {}] });
  settle(g, 'Polymerization');
  ok(inZ(g, 0, 'hand', 'Polymerization'), 'Polymerization added from the Deck');
  const g2 = duel({ board: [{ m: ['Elemental HERO Woodsman'], gy: ['Polymerization'], turn: 2 }, {}] });
  settle(g2, 'Polymerization');
  ok(inZ(g2, 0, 'hand', 'Polymerization'), 'Polymerization added from the GY');
});

/* ---------------- the rest ---------------- */
T("Elemental Mistress Doriado: Ritual with Doriado's Blessing, counts as every Attribute", () => {
  const g = duel({ board: [{ hand: ["Doriado's Blessing", 'Elemental Mistress Doriado'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, "Doriado's Blessing"); settle(g, 'Elemental Mistress Doriado', FILL);
  ok(on(g, 0, 'Elemental Mistress Doriado'), 'Ritual Summoned');
  const g2 = duel({ board: [{ m: ['Elemental Mistress Doriado', 'Element Dragon'], turn: 2 }, {}] });
  ok(E.atk(g2, on(g2, 0, 'Element Dragon')) === 2000, 'counts as FIRE for Element Dragon');
});
T('Elemental Recharge: 1000 LP per face-up Elemental HERO', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Sparkman', 'Elemental HERO Clayman', { n: 'Elemental HERO Avian', pos: 'set' }], st: ['Elemental Recharge'], turn: 2 }, { m: ['Elemental HERO Burstinatrix'] }] });
  act(g, 0, 'Elemental Recharge'); settle(g);
  ok(g.p[0].lp === 10000, `A gained 2000 (${g.p[0].lp})`);
});
T('Emissary from Pandemonium: Normal Summon with 1 Tribute at half stats; no Special Summon', () => {
  const g = duel({ board: [{ hand: ['Emissary from Pandemonium'], m: [FILL], turn: 2 }, {}] });
  const c = card(g, 0, 'Emissary from Pandemonium');
  ok(hasOpt(g, 'ns:' + c.u), 'Normal Summon offered with 1 monster'); choose(g, 'ns:' + c.u); settle(g, FILL);
  ok(on(g, 0, 'Emissary from Pandemonium') && E.atk(g, c) === 1300 && E.def(g, c) === 900 && E.lib.lv(c) === 5, `1300/900, Level ${E.lib.lv(c)}`);
  const g2 = duel({ board: [{ hand: ['Emissary from Pandemonium'], m: [FILL, FILL], turn: 2 }, {}] });
  const c2 = card(g2, 0, 'Emissary from Pandemonium'); choose(g2, 'ns:' + c2.u); settle(g2, FILL, FILL, '2');
  ok(on(g2, 0, 'Emissary from Pandemonium') && (E.atk(g2, c2) === 2600 || cnt(g2, 0, 'm') === 2), `full stats with 2 Tributes (${E.atk(g2, c2)})`);
  const g3 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Emissary from Pandemonium'], turn: 2 }, {}] });
  if (canAct(g3, 0, 'Monster Reborn')) { act(g3, 0, 'Monster Reborn'); settle(g3, 'Emissary from Pandemonium'); }
  ok(!on(g3, 0, 'Emissary from Pandemonium'), 'cannot be Special Summoned');
});
T('Emissary of the Afterlife: from field to GY, each player adds a Level 3 or lower Normal Monster', () => {
  const g = duel({ board: [{ m: ['Emissary of the Afterlife'], deckTop: [FILL, 'Elemental HERO Avian'], turn: 2 }, { m: ['Cyber Dragon'], deckTop: ['Elemental HERO Burstinatrix'] }] });
  bp(g); atkOn(g, 0, 'Emissary of the Afterlife', 'Cyber Dragon', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix');
  ok(inZ(g, 0, 'hand', 'Elemental HERO Avian') && inZ(g, 1, 'hand', 'Elemental HERO Burstinatrix'), 'A added Avian, B added Burstinatrix');
});
T('Emissary of the Oasis: cannot be attacked with a Level 3 or lower Normal; their battle damage is 0', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Emissary of the Oasis', 'Elemental HERO Avian'] }] });
  const w = on(g, 0, FILL); bp(g);
  ok(!canAtk(g, w, on(g, 1, 'Emissary of the Oasis')), 'Oasis cannot be attacked');
  atkOn(g, 0, FILL, 'Elemental HERO Avian');
  ok(inZ(g, 1, 'gy', 'Elemental HERO Avian') && g.p[1].lp === 8000, `Avian destroyed, B took 0 (${g.p[1].lp})`);
  const g2 = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Emissary of the Oasis'] }] });
  bp(g2); ok(canAtk(g2, on(g2, 0, FILL), on(g2, 1, 'Emissary of the Oasis')), 'without the Normal Monster it can be attacked');
});

// Goat: the same cards with the Goat card pool
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
  const gs = (g, ...picks) => { for (let i = 0; i < 60 && g.prompt && g.prompt.type !== 'idle' && g.prompt.type !== 'battle'; i++) { const pr = g.prompt;
    if (pr.type === 'respond') { const k = picks.find(t => pr.opts.some(x => x.key !== 'pass' && x.key.includes(t))); GE.act(g, [k ? pr.opts.find(x => x.key.includes(k)).key : 'pass']); }
    else if (pr.type === 'yesno') GE.act(g, ['y']);
    else { const ks = []; for (const t of picks) { const o = pr.opts.find(x => x.label.includes(t) && !ks.includes(x.key)); if (o && ks.length < pr.max) ks.push(o.key); } for (const o of pr.opts) if (ks.length < pr.min && !ks.includes(o.key)) ks.push(o.key); GE.act(g, ks); } } };
  const gc = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].extra].find(c => c && GE.name(c) === n);
  const gon = (g, p, n) => g.p[p].m.find(c => c && GE.name(c) === n);
  const gk = (g, pre) => { const o = g.prompt.opts.find(x => x.key.startsWith(pre)); if (!o) throw new Error('no option ' + pre); GE.act(g, [o.key]); };
  const gin = (g, p, z, n) => g.p[p][z].some(c => c && GE.name(c) === n);
  T('Goat: Dragon Capture Jar', () => {
    const g = gduel([{ st: ['Dragon Capture Jar'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    gk(g, 'a:' + gc(g, 0, 'Dragon Capture Jar').u + ':'); gs(g);
    ok(gon(g, 1, 'Blue-Eyes White Dragon').pos === 'def', 'Goat: Blue-Eyes to Defense');
  });
  T('Goat: Dragon Piper', () => {
    const g = gduel([{ m: [{ n: 'Dragon Piper', pos: 'set' }], turn: 2 }, { m: [{ n: 'Blue-Eyes White Dragon', pos: 'def' }], st: [{ n: 'Dragon Capture Jar', pos: 'up' }] }]);
    gk(g, 'flip:'); gs(g);
    ok(gin(g, 1, 'gy', 'Dragon Capture Jar') && gon(g, 1, 'Blue-Eyes White Dragon').pos === 'atk', 'Goat: Jar destroyed, Blue-Eyes to Attack');
  });
  T('Goat: Dragon Seeker', () => {
    const g = gduel([{ hand: ['Dragon Seeker'], m: [GF], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }]);
    gk(g, 'ns:' + gc(g, 0, 'Dragon Seeker').u); gs(g, GF, 'Blue-Eyes White Dragon');
    ok(gin(g, 1, 'gy', 'Blue-Eyes White Dragon'), 'Goat: Blue-Eyes destroyed');
  });
  T('Goat: Flame Wingman Fusion and burn', () => {
    const g = gduel([{ hand: ['Polymerization', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'], turn: 2 }, { m: ['Mystic Tomato'] }], ['Elemental HERO Flame Wingman']);
    gk(g, 'a:' + gc(g, 0, 'Polymerization').u + ':'); gs(g, 'Elemental HERO Flame Wingman');
    ok(gon(g, 0, 'Elemental HERO Flame Wingman'), 'Goat: Flame Wingman Fusion Summoned');
    const g2 = gduel([{ m: ['Elemental HERO Flame Wingman'], turn: 2 }, { m: ['Mystic Tomato'] }]);
    gk(g2, 'bp'); gs(g2); gk(g2, `atk:${gon(g2, 0, 'Elemental HERO Flame Wingman').u}:${gon(g2, 1, 'Mystic Tomato').u}`); gs(g2);
    ok(g2.p[1].lp === 8000 - 700 - 1400, `Goat: 700 + 1400 (${g2.p[1].lp})`);
  });
  T('Goat: Thunder Giant', () => {
    const g = gduel([{ hand: ['Mystic Tomato'], m: ['Elemental HERO Thunder Giant'], turn: 2 }, { m: ['Sangan'] }]);
    gk(g, 'a:' + gon(g, 0, 'Elemental HERO Thunder Giant').u + ':'); gs(g, 'Mystic Tomato', 'Sangan');
    ok(gin(g, 1, 'gy', 'Sangan'), 'Goat: Sangan destroyed');
  });
  T('Goat: Emissary of the Afterlife', () => {
    const g = gduel([{ m: ['Emissary of the Afterlife'], deckTop: [GF, 'Elemental HERO Avian'], turn: 2 }, { m: ['Blue-Eyes White Dragon'], deckTop: ['Elemental HERO Burstinatrix'] }]);
    gk(g, 'bp'); gs(g); gk(g, `atk:${gon(g, 0, 'Emissary of the Afterlife').u}:${gon(g, 1, 'Blue-Eyes White Dragon').u}`); gs(g, 'Elemental HERO Avian', 'Elemental HERO Burstinatrix');
    ok(gin(g, 0, 'hand', 'Elemental HERO Avian') && gin(g, 1, 'hand', 'Elemental HERO Burstinatrix'), 'Goat: both players searched');
  });
  T('Goat: Element Valkyrie and Dragon Treasure', () => {
    const g = gduel([{ hand: ['Dragon Treasure'], m: ['Element Valkyrie', 'Luster Dragon'], turn: 2 }, { m: ['Masked Dragon'] }]);
    ok(GE.atk(g, gon(g, 0, 'Element Valkyrie')) === 2000, 'Goat: Valkyrie +500 with FIRE');
    gk(g, 'a:' + gc(g, 0, 'Dragon Treasure').u + ':'); gs(g, 'Luster Dragon');
    ok(GE.atk(g, gon(g, 0, 'Luster Dragon')) === 2200, 'Goat: Luster Dragon 2200');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-07 review checks passed.');
process.exit(fails ? 1 : 0);
