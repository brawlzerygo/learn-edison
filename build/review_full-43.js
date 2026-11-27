// Independent review checks for full pool batch 43 (written from the card text): node build/review_full-40.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior Level 4 2000/100
let lastG; function duel(o = {}) {
  if (o.board && o.board[1] && o.board[1].turn && o.board[0] && !o.board[0].turn) o.board[0].turn = o.board[1].turn;
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
const bp = g => { E.act(g, ['bp']); settle(g); };
const atkOn = (g, p, aName, tName, ...picks) => { const a = on(g, p, aName), t = tName ? on(g, 1 - p, tName) : null; choose(g, `atk:${a.u}:${t ? t.u : 'd'}`); settle(g, ...picks); };
const canAtk = (g, a, t) => hasOpt(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const endTurn = (g, ...picks) => { if (g.prompt && g.prompt.opts.some(x => x.key === 'endbp')) { E.act(g, ['endbp']); settle(g, ...picks); } E.act(g, ['end']); settle(g, ...picks); };
const ns = (g, p, n, ...picks) => { choose(g, 'ns:' + g.p[p].hand.find(c => E.name(c) === n).u); settle(g, ...picks); };
const noSummon = (g, c) => !hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && !hasOpt(g, 'sp:' + c.u);
const lp = (g, p) => g.p[p].lp;
const LV = c => E.lib.lv(c);
const up = n => ({ n, pos: 'up' });
const idle = g => g.prompt && g.prompt.type === 'idle';
const toIdle = (g, ...picks) => { for (let i = 0; i < 10 && g.prompt && !idle(g) && g.prompt.type !== 'battle'; i++) settle(g, ...picks); };
const optsFor = (g, c) => g.prompt ? g.prompt.opts.filter(x => x.u === c.u || x.key.split(':')[1] === String(c.u)) : [];
const hand = (g, p) => g.p[p].hand.length;
const BEWD = 'Blue-Eyes White Dragon';
const flipSum = (g, p, n, ...picks) => { choose(g, 'flip:' + on(g, p, n).u); settle(g, ...picks); };
const setM = n => ({ n, pos: 'set' });
const defM = n => ({ n, pos: 'def' });
const pos = (g, p, n) => { const c = on(g, p, n); return c ? c.pos : null; };
const AD = (g, p, n) => { const c = on(g, p, n); return c ? `${E.atk(g, c)}/${E.def(g, c)}` : 'none'; };
const CG = 'Celtic Guardian', EL = 'Mystical Elf', IC = "Iron Core of Koa'ki Meiru", GL = 'Gemini Lancer';
const eff = (g, p, n, ...picks) => { const c = on(g, p, n) || card(g, p, n); choose(g, 'a:' + c.u + ':'); settle(g, ...picks); };
const gem = (g, p, n) => { choose(g, 'gem:' + on(g, p, n).u); settle(g); };
const synOpt = (g, n) => { const c = card(g, 0, n); return !!c && !!g.prompt && g.prompt.opts.some(o => o.u === c.u && /Synchro/.test(o.label)); };
const syn = (g, n, ...picks) => { const c = card(g, 0, n); choose(g, g.prompt.opts.find(o => o.u === c.u && /Synchro/.test(o.label)).key); settle(g, ...picks); toIdle(g, ...picks); };
const KG = 'Kagemusha of the Blue Flame', SAB = 'Sabersaurus', ME = 'Mystical Elf';
const gyN = (g, p) => g.p[p].gy.length;
const zoneOf = (g, p, n) => g.p[p].m.findIndex(c => c && E.name(c) === n);

T('Rampaging Rhynos moves once per turn and gains 500 attacking its column', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Rampaging Rhynos', zi: 0 }], turn: 2 }, { m: [{ n: SAB, zi: 3 }] }] });
  eff(g, 0, 'Rampaging Rhynos', 'Right');
  ok(zoneOf(g, 0, 'Rampaging Rhynos') === 1, 'Rhynos moved to zone 1 (faces zone 3)');
  ok(!canAct(g, 0, 'Rampaging Rhynos'), 'no second move this turn');
  bp(g); atkOn(g, 0, 'Rampaging Rhynos', SAB);
  ok(inZ(g, 1, 'gy', SAB) && lp(g, 1) === 7900, `2000 vs 1900: Sabersaurus destroyed, B at ${lp(g, 1)}`);
});
T('Rapid-Fire Magician burns 400 on a Normal Spell, not a Quick-Play', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Mystical Space Typhoon'], m: ['Rapid-Fire Magician'], turn: 2 }, { st: ['Jar of Greed'] }] });
  act(g, 0, 'Pot of Greed'); settle(g);
  ok(lp(g, 1) === 7600, `Pot of Greed: B at ${lp(g, 1)}`);
  act(g, 0, 'Mystical Space Typhoon'); settle(g);
  ok(lp(g, 1) === 7600, `MST: no burn, B at ${lp(g, 1)}`);
});
T('Raptor Wing Strike shuffles a Blackwing in and adds one', () => {
  const g = duel({ board: [{ hand: ['Raptor Wing Strike'], m: ['Blackwing - Bora the Spear'], deckTop: [FILL, 'Blackwing - Gale the Whirlwind'], turn: 2 }, {}] });
  act(g, 0, 'Raptor Wing Strike'); settle(g, 'Gale');
  ok(!on(g, 0, 'Blackwing - Bora the Spear') && g.p[0].deck.some(c => E.name(c) === 'Blackwing - Bora the Spear'), 'Bora shuffled into the Deck');
  ok(inZ(g, 0, 'hand', 'Blackwing - Gale the Whirlwind'), 'Gale added to the hand');
});
T('Raviel: Special Summoned by 3 Fiends, not Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Raviel, Lord of Phantasms'], m: ['Archfiend Soldier', 'Archfiend Soldier', 'Archfiend Soldier'] }, {}] });
  const r = card(g, 0, 'Raviel, Lord of Phantasms');
  ok(!hasOpt(g, 'ns:' + r.u) && !hasOpt(g, 'set:' + r.u), 'no Normal Summon or Set');
  ok(hasOpt(g, 'sp:' + r.u), 'Special Summon offered'); choose(g, 'sp:' + r.u); settle(g);
  ok(on(g, 0, 'Raviel, Lord of Phantasms') && cnt(g, 0, 'gy', 'Archfiend Soldier') === 3, 'Raviel on the field, 3 Fiends in the GY');
  const g2 = duel({ board: [{ hand: ['Raviel, Lord of Phantasms'], m: ['Archfiend Soldier', 'Archfiend Soldier', KG] }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Raviel, Lord of Phantasms').u), 'no Special Summon with only 2 Fiends');
});
T('Raviel: Tribute 1 monster to gain its original ATK, once per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Raviel, Lord of Phantasms', 'Archfiend Soldier', KG], turn: 2 }, {}] });
  eff(g, 0, 'Raviel, Lord of Phantasms', 'Archfiend Soldier');
  ok(AD(g, 0, 'Raviel, Lord of Phantasms').startsWith('5900') && inZ(g, 0, 'gy', 'Archfiend Soldier'), `Raviel ${AD(g, 0, 'Raviel, Lord of Phantasms')}`);
  ok(!canAct(g, 0, 'Raviel, Lord of Phantasms'), 'once per turn');
  endTurn(g); toIdle(g);
  ok(AD(g, 0, 'Raviel, Lord of Phantasms').startsWith('4000'), 'back to 4000 next turn');
});
T('Raviel: a Phantasm Token for each opponent Normal Summon, it cannot attack', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Raviel, Lord of Phantasms'] }, { hand: [FILL], turn: 2 }] });
  ns(g, 1, FILL); toIdle(g);
  const tk = on(g, 0, 'Phantasm Token');
  ok(tk && E.atk(g, tk) === 1000, 'A has a 1000 ATK Phantasm Token');
  endTurn(g); toIdle(g); bp(g);
  ok(tk && !canAtk(g, tk, on(g, 1, FILL)) && canAtk(g, on(g, 0, 'Raviel, Lord of Phantasms'), on(g, 1, FILL)), 'the token cannot attack, Raviel can');
});
T('Razor Lizard destroys a face-down monster with another Reptile', () => {
  const g = duel({ board: [{ hand: [], m: ['Razor Lizard', 'Armored Lizard'], turn: 2 }, { m: [setM(ME)] }] });
  bp(g); atkOn(g, 0, 'Razor Lizard', ME);
  ok(inZ(g, 1, 'gy', ME) && lp(g, 0) === 8000, `Elf destroyed, A at ${lp(g, 0)}`);
  const g2 = duel({ board: [{ hand: [], m: ['Razor Lizard'], turn: 2 }, { m: [setM(ME)] }] });
  bp(g2); atkOn(g2, 0, 'Razor Lizard', ME);
  ok(on(g2, 1, ME) && lp(g2, 0) === 7500, `no other Reptile: normal battle, A at ${lp(g2, 0)}`);
});
T('Realm of Light gets a Shine Counter on a mill and pumps Lightsworn', () => {
  const g = duel({ board: [{ hand: ['Realm of Light'], m: ['Card Trooper', 'Jain, Lightsworn Paladin'], turn: 2 }, {}] });
  act(g, 0, 'Realm of Light'); settle(g);
  eff(g, 0, 'Card Trooper', '3'); toIdle(g, '3');
  const fz = g.p[0].fz;
  ok(fz && E.lib.ctr(fz, 'shine') + E.lib.ctr(fz, 'Shine') >= 1, 'a Shine Counter placed');
  ok(AD(g, 0, 'Jain, Lightsworn Paladin').startsWith('1900'), `Jain ${AD(g, 0, 'Jain, Lightsworn Paladin')}`);
});
T('Reborn Zombie survives battle with an empty hand', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Reborn Zombie'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Reborn Zombie');
  ok(on(g, 0, 'Reborn Zombie') && lp(g, 0) === 7000, `Zombie survives, A at ${lp(g, 0)}`);
  const g2 = duel({ first: 1, board: [{ hand: [FILL], m: ['Reborn Zombie'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g2); atkOn(g2, 1, FILL, 'Reborn Zombie');
  ok(inZ(g2, 0, 'gy', 'Reborn Zombie'), 'with a card in hand it is destroyed');
});
T('Reckoned Power destroys all face-down Spell/Traps of the opponent', () => {
  const g = duel({ board: [{ hand: [IC], st: ['Reckoned Power'], turn: 2 }, { st: ['Mirror Force', 'Jar of Greed', up('Gravity Bind')] }] });
  ok(canAct(g, 0, 'Reckoned Power'), 'activatable with Iron Core in hand'); act(g, 0, 'Reckoned Power'); settle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Jar of Greed') && inZ(g, 1, 'st', 'Gravity Bind'), 'set cards destroyed, face-up Gravity Bind stays');
  ok(inZ(g, 0, 'hand', IC), 'Iron Core stays in hand (revealed)');
  const g2 = duel({ board: [{ hand: [FILL], st: ['Reckoned Power'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!canAct(g2, 0, 'Reckoned Power'), 'not activatable without Iron Core');
});
T('Recurring Nightmare adds 2 DARK 0 DEF monsters', () => {
  const g = duel({ board: [{ hand: ['Recurring Nightmare'], gy: ['Armored Zombie', 'Clown Zombie'], turn: 2 }, {}] });
  act(g, 0, 'Recurring Nightmare'); settle(g, 'Armored Zombie', 'Clown Zombie');
  ok(inZ(g, 0, 'hand', 'Armored Zombie') && inZ(g, 0, 'hand', 'Clown Zombie'), 'both added');
});
T('Recycling Batteries adds 2 Thunder monsters', () => {
  const g = duel({ board: [{ hand: ['Recycling Batteries'], gy: ['Thunder Kid', 'Wattkid'], turn: 2 }, {}] });
  act(g, 0, 'Recycling Batteries'); settle(g, 'Thunder Kid', 'Wattkid');
  ok(inZ(g, 0, 'hand', 'Thunder Kid') && inZ(g, 0, 'hand', 'Wattkid'), 'both added');
});
T('Regenerating Rose makes 2 tokens when destroyed by battle', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Regenerating Rose'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Regenerating Rose'); toIdle(g);
  const t = g.p[0].m.filter(c => c && E.name(c) === 'Regenerating Rose Token');
  ok(t.length === 2 && E.atk(g, t[0]) === 1200, `${t.length} tokens`);
});
T('Regretful Rebirth revives in defense, destroyed in its owner End Phase', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: [KG], st: ['Regretful Rebirth'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, KG, 'Regretful Rebirth', KG);
  ok(pos(g, 0, KG) === 'def', `Kagemusha back in ${pos(g, 0, KG)}`);
  endTurn(g); toIdle(g);
  ok(on(g, 0, KG), 'still there on A turn'); endTurn(g);
  ok(inZ(g, 0, 'gy', KG), 'destroyed in A End Phase');
});
T('Regulus shuffles a Field Spell from the GY into the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Regulus'], gy: ['Forest'], turn: 2 }, {}] });
  eff(g, 0, 'Regulus', 'Forest');
  ok(!inZ(g, 0, 'gy', 'Forest') && g.p[0].deck.some(c => E.name(c) === 'Forest'), 'Forest in the Deck');
});
T('Reign-Beaux: discarded by the opponent, summons itself and wipes one side', () => {
  const g = duel({ first: 1, board: [{ hand: ['Reign-Beaux, Overlord of Dark World'] }, { hand: ['Card Destruction'], m: [FILL], st: ['Jar of Greed'], turn: 2 }] });
  act(g, 1, 'Card Destruction'); toIdle(g);
  ok(on(g, 0, 'Reign-Beaux, Overlord of Dark World'), 'Reign-Beaux Special Summoned');
  ok(inZ(g, 1, 'gy', FILL) !== inZ(g, 1, 'gy', 'Jar of Greed'), 'exactly one of the two kinds destroyed');
});
T('Reinforced Human Psychic Borg gains 500 twice per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Reinforced Human Psychic Borg'], gy: ['Krebons', 'Doctor Cranium', 'Genetic Woman'], turn: 2 }, {}] });
  eff(g, 0, 'Reinforced Human Psychic Borg', 'Krebons'); eff(g, 0, 'Reinforced Human Psychic Borg', 'Doctor Cranium');
  ok(AD(g, 0, 'Reinforced Human Psychic Borg').startsWith('2500') && cnt(g, 0, 'ban') === 2, `Borg ${AD(g, 0, 'Reinforced Human Psychic Borg')}`);
  ok(!canAct(g, 0, 'Reinforced Human Psychic Borg'), 'no third use');
});
T('Relieve Monster returns a monster and Special Summons a Level 4', () => {
  const g = duel({ first: 1, board: [{ hand: [FILL], m: [KG], st: ['Relieve Monster'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, KG, 'Relieve Monster', KG, FILL);
  ok(inZ(g, 0, 'hand', KG) && (on(g, 0, FILL) || inZ(g, 0, 'gy', FILL)), 'Kagemusha in hand, Warwolf Special Summoned (the attack replays on it)');
});
T('Relinquished Spider destroys face-up Defense monsters with 4 Insects in GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Relinquished Spider'], gy: Array(4).fill('Basic Insect'), turn: 2 }, { m: [defM(FILL), SAB] }] });
  eff(g, 0, 'Relinquished Spider');
  ok(inZ(g, 1, 'gy', FILL) && on(g, 1, SAB) && inZ(g, 0, 'gy', 'Relinquished Spider'), 'defense monster destroyed, attack one stays, Spider tributed');
  const g2 = duel({ board: [{ hand: [], m: ['Relinquished Spider'], gy: Array(3).fill('Basic Insect'), turn: 2 }, { m: [defM(FILL)] }] });
  ok(!canAct(g2, 0, 'Relinquished Spider'), 'not with only 3 Insects');
});
T('Remote Revenge switches a destroy target to the opponent monster', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: [ME], st: ['Remote Revenge'] }, { hand: [], m: ['Exiled Force', SAB], turn: 2 }] });
  eff(g, 1, 'Exiled Force', ME, 'Remote Revenge', SAB); toIdle(g, 'Remote Revenge', SAB);
  ok(on(g, 0, ME) && inZ(g, 1, 'gy', SAB), 'Elf survives, Sabersaurus destroyed');
});
T('Rescueroid returns a roid destroyed by battle to the hand', () => {
  const g = duel({ board: [{ hand: [], m: ['Rescueroid', 'Cycroid'], turn: 2 }, { m: [FILL] }] });
  bp(g); atkOn(g, 0, 'Cycroid', FILL);
  ok(inZ(g, 0, 'hand', 'Cycroid'), 'Cycroid back in hand');
});
T('Reversal of Fate flips an Arcana Force coin result', () => {
  const g = duel({ board: [{ hand: [], m: ['Arcana Force I - The Magician'], st: ['Reversal of Fate'], turn: 2 }, {}] });
  on(g, 0, 'Arcana Force I - The Magician').flags.arc = 'H';
  act(g, 0, 'Reversal of Fate'); settle(g);
  ok(on(g, 0, 'Arcana Force I - The Magician').flags.arc === 'T', 'Heads became Tails');
  const g2 = duel({ board: [{ hand: [], m: [FILL], st: ['Reversal of Fate'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Reversal of Fate'), 'not without an Arcana Force');
});
T('Reverse of Neos summons Neos with +1000 when a Neos Fusion is destroyed', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Elemental HERO Air Neos'], st: ['Reverse of Neos'], deckTop: ['Elemental HERO Neos'] }, { hand: [], m: ['Exiled Force'], turn: 2 }] });
  eff(g, 1, 'Exiled Force', 'Air Neos', 'Reverse of Neos'); toIdle(g, 'Reverse of Neos');
  const n = on(g, 0, 'Elemental HERO Neos');
  ok(n && E.atk(g, n) === 3500 && n.pos === 'atk', `Neos ${AD(g, 0, 'Elemental HERO Neos')}`);
  endTurn(g);
  ok(inZ(g, 0, 'gy', 'Elemental HERO Neos'), 'Neos destroyed in the End Phase');
});
T('Revoke Fusion: discard Poly, send the Fusion, summon a material', () => {
  const g = duel({ ex0: ['Elemental HERO Air Neos'], board: [{ hand: ['Revoke Fusion', 'Polymerization', 'Elemental HERO Neos'], turn: 2 }, {}] });
  act(g, 0, 'Revoke Fusion'); settle(g, 'Air Neos', 'Elemental HERO Neos');
  ok(inZ(g, 0, 'gy', 'Polymerization') && inZ(g, 0, 'gy', 'Elemental HERO Air Neos') && on(g, 0, 'Elemental HERO Neos'), 'Poly and Air Neos in GY, Neos summoned');
  endTurn(g);
  ok(inZ(g, 0, 'gy', 'Elemental HERO Neos'), 'Neos sent to the GY in the End Phase');
});
T('Ribbon of Rebirth brings back the equipped monster in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Ribbon of Rebirth'], m: [KG], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Ribbon of Rebirth'); settle(g, KG);
  bp(g); atkOn(g, 0, KG, FILL);
  ok(inZ(g, 0, 'gy', KG), 'Kagemusha destroyed');
  endTurn(g);
  ok(on(g, 0, KG), 'Kagemusha back in the End Phase');
});
T('Rigorous Reaver: each player discards; its killer loses 500', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: [setM('Rigorous Reaver')], turn: 2 }, { hand: ['Jar of Greed'] }] });
  flipSum(g, 0, 'Rigorous Reaver');
  ok(inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 1, 'gy', 'Jar of Greed'), 'both players discarded');
  const g2 = duel({ first: 1, board: [{ hand: [], m: ['Rigorous Reaver'] }, { hand: [], m: [SAB], turn: 2 }] });
  bp(g2); atkOn(g2, 1, SAB, 'Rigorous Reaver');
  ok(inZ(g2, 0, 'gy', 'Rigorous Reaver') && AD(g2, 1, SAB) === '1400/0', `Sabersaurus ${AD(g2, 1, SAB)}`);
});
T('Rinyan shuffles a Lightsworn back and draws 1', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Rinyan, Lightsworn Rogue')], gy: ['Jain, Lightsworn Paladin'], turn: 2 }, {}] });
  const h0 = hand(g, 0); flipSum(g, 0, 'Rinyan, Lightsworn Rogue', 'Jain');
  ok(!inZ(g, 0, 'gy', 'Jain, Lightsworn Paladin') && hand(g, 0) === h0 + 1, 'Jain shuffled in, 1 card drawn');
});
T('Riryoku halves one monster and gives the ATK to the other', () => {
  const g = duel({ board: [{ hand: ['Riryoku'], m: [KG], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Riryoku'); settle(g, 'Gene-Warped', KG);
  const a = E.atk(g, on(g, 0, KG)), b = E.atk(g, on(g, 1, FILL));
  ok((a === 1800 && b === 1000) || (a === 400 && b === 2400), `Kagemusha ${a}, Warwolf ${b}`);
  endTurn(g); toIdle(g);
  ok(E.atk(g, on(g, 0, KG)) === 800 && E.atk(g, on(g, 1, FILL)) === 2000, 'back to normal next turn');
});
T('Rise of the Snake Deity summons Vennominaga when Vennominon is destroyed', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Vennominon the King of Poisonous Snakes'], st: ['Rise of the Snake Deity'], deckTop: ['Vennominaga the Deity of Poisonous Snakes'] }, { hand: [], m: ['Exiled Force'], turn: 2 }] });
  eff(g, 1, 'Exiled Force', 'Vennominon', 'Rise of the Snake Deity'); toIdle(g, 'Rise of the Snake Deity', 'Vennominaga');
  ok(on(g, 0, 'Vennominaga the Deity of Poisonous Snakes'), 'Vennominaga Special Summoned');
});
T('Rising Energy: discard 1, a monster gains 1500 until the End Phase', () => {
  const g = duel({ board: [{ hand: [FILL], m: [KG], st: ['Rising Energy'], turn: 2 }, {}] });
  g.p[0].hand.splice(1); // keep only the listed card plus nothing drawn
  act(g, 0, 'Rising Energy'); settle(g, FILL, KG);
  ok(E.atk(g, on(g, 0, KG)) === 2300 && inZ(g, 0, 'gy', FILL), `Kagemusha ${E.atk(g, on(g, 0, KG))}`);
  endTurn(g);
  ok(E.atk(g, on(g, 0, KG)) === 800, 'back to 800');
  const g2 = duel({ first: 1, board: [{ hand: [], m: [KG], st: ['Rising Energy'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g2); choose(g2, `atk:${on(g2, 1, FILL).u}:${on(g2, 0, KG).u}`);
  ok(!canAct(g2, 0, 'Rising Energy'), 'not with an empty hand');
  const g3 = duel({ first: 1, board: [{ hand: [FILL], m: [KG], st: ['Rising Energy'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g3); choose(g3, `atk:${on(g3, 1, FILL).u}:${on(g3, 0, KG).u}`);
  ok(canAct(g3, 0, 'Rising Energy'), 'control: activatable on an attack with a card in hand');
});
T('Road Synchron + Road Warrior', () => {
  const g = duel({ ex0: ['Road Warrior', 'Stardust Dragon'], board: [{ hand: [], m: ['Road Synchron', KG, 'Bokoichi the Freightening Car'], deckTop: [FILL, 'Dharma Cannon'], turn: 2 }, {}] });
  ok(synOpt(g, 'Road Warrior'), 'Road Warrior offered (4+2+2)');
  syn(g, 'Road Warrior', 'Road Synchron', KG, 'Bokoichi');
  ok(on(g, 0, 'Road Warrior'), 'Road Warrior summoned');
  eff(g, 0, 'Road Warrior', 'Dharma Cannon');
  ok(on(g, 0, 'Dharma Cannon'), 'Dharma Cannon Special Summoned from the Deck');
  const g2 = duel({ ex0: ['Brionac, Dragon of the Ice Barrier', 'Stardust Dragon'], board: [{ hand: [], m: ['Road Synchron', FILL] }, {}] });
  console.log('info Road Synchron as Level 2 for other Synchros (documented ENGINE gap): Brionac ' + synOpt(g2, 'Brionac, Dragon of the Ice Barrier') + ', Stardust ' + synOpt(g2, 'Stardust Dragon'));
  const g3 = duel({ board: [{ hand: [], m: ['Road Synchron'], turn: 2 }, {}] });
  bp(g3); atkOn(g3, 0, 'Road Synchron', null);
  ok(LV(on(g3, 0, 'Road Synchron')) === 5, `Level after attacking: ${LV(on(g3, 0, 'Road Synchron'))}`);
});
T('Roar of the Earthbound Immortal destroys the attacker and burns half its ATK', () => {
  const g = duel({ board: [{ hand: ['Forest', 'Earthbound Immortal Uru'], m: [KG, 'Bokoichi the Freightening Car', defM(ME)], st: [up('Roar of the Earthbound Immortal')], turn: 2 }, { hand: [], m: [FILL] }] });
  act(g, 0, 'Forest'); settle(g); ns(g, 0, 'Earthbound Immortal Uru', KG, 'Bokoichi'); endTurn(g); toIdle(g);
  ok(on(g, 0, 'Earthbound Immortal Uru'), 'Uru still on the field');
  bp(g); atkOn(g, 1, FILL, ME, 'Roar of the Earthbound Immortal');
  ok(inZ(g, 1, 'gy', FILL) && lp(g, 1) === 6900 && lp(g, 0) === 8000, `attacker destroyed, B at ${lp(g, 1)}, A at ${lp(g, 0)}`);
});
T("Robbin' Zombie mills the opponent on battle damage", () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: [up("Robbin' Zombie")], turn: 2 }, {}] });
  const n = g.p[1].deck.length; bp(g); atkOn(g, 0, FILL, null);
  ok(g.p[1].deck.length === n - 1 && gyN(g, 1) === 1, 'top card milled');
});
T('Rockstone Warrior: no battle damage, 2 tokens when destroyed attacking', () => {
  const g = duel({ board: [{ hand: [], m: ['Rockstone Warrior'], turn: 2 }, { m: ['Frostosaurus'] }] });
  bp(g); atkOn(g, 0, 'Rockstone Warrior', 'Frostosaurus');
  ok(lp(g, 0) === 8000 && cnt(g, 0, 'm', 'Rockstone Token') === 2, `A at ${lp(g, 0)}, tokens ${cnt(g, 0, 'm', 'Rockstone Token')}`);
});
T('Roll Out! equips a Union monster from the GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Cycroid'], st: ['Roll Out!'], gy: ['Oilman'], turn: 2 }, {}] });
  act(g, 0, 'Roll Out!'); settle(g, 'Oilman', 'Cycroid');
  const o = g.p[0].st.find(c => c && E.name(c) === 'Oilman');
  ok(o && o.equipTo === on(g, 0, 'Cycroid').u, 'Oilman equipped to Cycroid');
});
T('Rose, Warrior of Revenge burns 300 more on battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Rose, Warrior of Revenge'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Rose, Warrior of Revenge', null);
  ok(lp(g, 1) === 6100, `B at ${lp(g, 1)}`);
});
T('Ruin, Queen of Oblivion: Ritual Summon and a second attack', () => {
  const g = duel({ board: [{ hand: ['End of the World', 'Ruin, Queen of Oblivion'], m: [FILL, FILL], turn: 2 }, { m: [KG, 'Bokoichi the Freightening Car'] }] });
  act(g, 0, 'End of the World'); settle(g, 'Ruin', FILL); toIdle(g, 'Ruin', FILL);
  ok(on(g, 0, 'Ruin, Queen of Oblivion'), 'Ruin Ritual Summoned');
  bp(g); atkOn(g, 0, 'Ruin, Queen of Oblivion', KG);
  ok(inZ(g, 1, 'gy', KG) && canAtk(g, on(g, 0, 'Ruin, Queen of Oblivion'), on(g, 1, 'Bokoichi the Freightening Car')), 'Ruin can attack again');
});
T('Ruthless Denial sends your monster and a random opponent card to the GY', () => {
  const g = duel({ board: [{ hand: ['Ruthless Denial'], m: [KG], turn: 2 }, { hand: [SAB] }] });
  act(g, 0, 'Ruthless Denial'); settle(g, KG);
  ok(inZ(g, 0, 'gy', KG) && inZ(g, 1, 'gy', SAB) && hand(g, 1) === 0, 'both sent to the GY');
});
T('Sage of Silence: no Spells for the opponent next turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Sage of Silence'], turn: 2 }, { hand: ['Pot of Greed'], m: [KG] }] });
  bp(g); atkOn(g, 0, 'Sage of Silence', KG); toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 1 && !canAct(g, 1, 'Pot of Greed'), 'B cannot activate Pot of Greed');
  const g2 = duel({ first: 1, board: [{ hand: [] }, { hand: ['Pot of Greed'], turn: 2 }] });
  ok(canAct(g2, 1, 'Pot of Greed'), 'control: Pot of Greed normally activatable');
});
T('Sage of Stillness: no Traps for the opponent next turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Sage of Stillness'], turn: 2 }, { st: ['Jar of Greed'], m: [KG] }] });
  bp(g); atkOn(g, 0, 'Sage of Stillness', KG); toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 1 && !canAct(g, 1, 'Jar of Greed'), 'B cannot activate Jar of Greed');
});
T('Samurai Sword Baron flips a Defense monster to Attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Samurai Sword Baron'], turn: 2 }, { m: [setM(ME)] }] });
  eff(g, 0, 'Samurai Sword Baron', ME);
  ok(pos(g, 1, ME) === 'atk', `Elf is ${pos(g, 1, ME)}`);
});
T('Sand Moth: destroyed face-down by an effect, comes back 2000/1000', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: [setM('Sand Moth')], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); toIdle(g);
  const s = on(g, 0, 'Sand Moth');
  ok(s && E.atk(g, s) === 2000 && E.def(g, s) === 1000, `Sand Moth ${AD(g, 0, 'Sand Moth')}`);
});
T('Sanguine Swamp: face-down S/T cannot be activated; destroyed with another S/T', () => {
  const g = duel({ board: [{ hand: [], st: ['Sanguine Swamp'], turn: 2 }, { st: ['Jar of Greed'] }] });
  act(g, 0, 'Sanguine Swamp'); settle(g); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'st', 'Sanguine Swamp') && !canAct(g, 1, 'Jar of Greed'), 'B cannot activate the set Jar of Greed');
  const g2 = duel({ board: [{ hand: [], st: ['Sanguine Swamp', 'Jar of Greed'], turn: 2 }, {}] });
  act(g2, 0, 'Sanguine Swamp'); settle(g2);
  ok(inZ(g2, 0, 'gy', 'Sanguine Swamp'), 'destroyed while you control another S/T');
});
T('Satellite Cannon gains 1000 each End Phase, battle-proof vs Level 7 or lower', () => {
  const g = duel({ board: [{ hand: [], m: ['Satellite Cannon'], turn: 2 }, { hand: [], m: [FILL] }] });
  endTurn(g); toIdle(g);
  ok(AD(g, 0, 'Satellite Cannon').startsWith('1000'), `after A End Phase: ${AD(g, 0, 'Satellite Cannon')}`);
  bp(g); atkOn(g, 1, FILL, 'Satellite Cannon');
  ok(on(g, 0, 'Satellite Cannon') && lp(g, 0) === 7000, `Cannon survives, A at ${lp(g, 0)}`);
  endTurn(g); toIdle(g);
  ok(AD(g, 0, 'Satellite Cannon').startsWith('1000'), 'no gain in the opponent End Phase');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(AD(g, 0, 'Satellite Cannon').startsWith('2000'), `after next A End Phase: ${AD(g, 0, 'Satellite Cannon')}`);
  bp(g); atkOn(g, 0, 'Satellite Cannon', FILL);
  ok(AD(g, 0, 'Satellite Cannon').startsWith('0/') && inZ(g, 1, 'gy', FILL) && on(g, 0, 'Satellite Cannon'), `2000 vs 2000: Warwolf destroyed, Cannon stays, back to 0 (${AD(g, 0, 'Satellite Cannon')})`);
});
T('Sauropod Brachion: 1-Dinosaur Tribute Summon and Flip Summon sets everything', () => {
  const g = duel({ board: [{ hand: ['Sauropod Brachion'], m: [SAB] }, {}] });
  ns(g, 0, 'Sauropod Brachion', SAB);
  ok(on(g, 0, 'Sauropod Brachion') && inZ(g, 0, 'gy', SAB), 'summoned with 1 Dinosaur');
  const g2 = duel({ board: [{ hand: [], m: [setM('Sauropod Brachion'), KG], turn: 2 }, { m: [FILL] }] });
  flipSum(g2, 0, 'Sauropod Brachion');
  ok(pos(g2, 1, FILL) === 'set' && pos(g2, 0, KG) === 'set', 'all other monsters set');
});
T('Savage Colosseum: 300 LP after attacking, non-attackers destroyed', () => {
  const g = duel({ board: [{ hand: ['Savage Colosseum'], m: [FILL, KG], turn: 2 }, {}] });
  act(g, 0, 'Savage Colosseum'); settle(g);
  bp(g); atkOn(g, 0, FILL, null);
  ok(lp(g, 0) === 8300, `A at ${lp(g, 0)}`);
  if (g.prompt && g.prompt.opts.some(o => o.key === 'endbp')) { E.act(g, ['endbp']); settle(g); }
  if (idle(g)) { E.act(g, ['end']); settle(g); }
  ok(inZ(g, 0, 'gy', KG) && on(g, 0, FILL), 'Kagemusha (no attack) destroyed, Warwolf stays');
});
T('Scanner copies a banished opponent monster until the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Scanner'], turn: 2 }, { ban: [FILL] }] });
  eff(g, 0, 'Scanner', FILL);
  const s = g.p[0].m.find(c => c);
  ok(E.atk(g, s) === 2000 && E.def(g, s) === 100 && LV(s) === 4, `Scanner copies 2000/100 Level 4 (${E.atk(g, s)}/${E.def(g, s)} L${LV(s)}); name and Attribute: documented ENGINE gap`);
  endTurn(g);
  ok(E.atk(g, s) === 0 && LV(s) === 1, 'back to 0 ATK Level 1 after the End Phase');
});
T('Scarr searches a Dark World monster when destroyed by battle', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Scarr, Scout of Dark World'], deckTop: ['Broww, Huntsman of Dark World'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Scarr, Scout of Dark World', 'Broww');
  ok(inZ(g, 0, 'hand', 'Broww, Huntsman of Dark World'), 'Broww added');
});
T('Scary Moth: one Special Summon per turn', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], m: ['Scary Moth'], gy: [FILL, KG], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); settle(g, FILL);
  ok(on(g, 0, FILL), 'first Special Summon works');
  const k = g.p[0].gy.find(c => E.name(c) === KG);
  ok(E.lib.forbid(g, { type: 'ss', c: k, p: 0, how: 'special' }), 'second Special Summon forbidden');
});
T('Sea Koala sets an opponent monster ATK to 0 with another Beast', () => {
  const g = duel({ board: [{ hand: [], m: ['Sea Koala', 'Burglar'], turn: 2 }, { m: [FILL] }] });
  eff(g, 0, 'Sea Koala', FILL);
  ok(E.atk(g, on(g, 1, FILL)) === 0, 'Warwolf at 0');
  const g2 = duel({ board: [{ hand: [], m: ['Sea Koala'], turn: 2 }, { m: [FILL] }] });
  ok(!canAct(g2, 0, 'Sea Koala'), 'not without another Beast');
});
T('Seal of Wickedness negates a card in the opponent Standby, costs 500 in yours', () => {
  const g = duel({ first: 1, board: [{ hand: [], st: [up('Seal of Wickedness')] }, { hand: ['Pot of Greed'], m: ['Rapid-Fire Magician'], turn: 2 }] });
  toIdle(g, 'Rapid-Fire Magician');
  act(g, 1, 'Pot of Greed'); settle(g);
  ok(lp(g, 0) === 8000, `Rapid-Fire negated, A at ${lp(g, 0)}`);
  endTurn(g); toIdle(g, 'Seal');
  ok(lp(g, 0) === 7500 && inZ(g, 0, 'st', 'Seal of Wickedness'), `A paid 500 (${lp(g, 0)})`);
});
T('Search Striker destroys a face-down monster, then goes to Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Search Striker'], turn: 2 }, { m: [setM(ME)] }] });
  bp(g); atkOn(g, 0, 'Search Striker', ME);
  ok(inZ(g, 1, 'gy', ME) && lp(g, 0) === 8000, 'Elf destroyed without damage');
  E.act(g, ['endbp']); settle(g);
  ok(pos(g, 0, 'Search Striker') === 'def', `Striker is ${pos(g, 0, 'Search Striker')}`);
});
T('Searchlightman: the opponent cannot Set this turn', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: [setM('Searchlightman')] }, { hand: [KG, 'Jar of Greed'], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Searchlightman'); E.act(g, ['endbp']); settle(g);
  const k = card(g, 1, KG), j = card(g, 1, 'Jar of Greed');
  ok(!hasOpt(g, 'set:' + k.u) && !hasOpt(g, 'setst:' + j.u) && hasOpt(g, 'ns:' + k.u), 'no Set, Normal Summon still allowed');
});
T('Secrets of the Gallant: 2 random discards on battle damage', () => {
  const g = duel({ board: [{ hand: [], m: [KG], st: ['Secrets of the Gallant'], turn: 2 }, { hand: [FILL, FILL, FILL] }] });
  act(g, 0, 'Secrets of the Gallant'); settle(g, KG);
  bp(g); atkOn(g, 0, KG, null);
  ok(hand(g, 1) === 1 && lp(g, 1) === 7200, `B hand ${hand(g, 1)}`);
});
T('Security Orb changes the attacker position', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: [KG], st: ['Security Orb'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, KG, 'Security Orb');
  ok(pos(g, 1, FILL) === 'def' && on(g, 0, KG), `Warwolf ${pos(g, 1, FILL)}, Kagemusha safe`);
});
T('Security Orb destroyed by an opponent Spell destroys 1 monster', () => {
  const g = duel({ first: 1, board: [{ hand: [], st: ['Security Orb'] }, { hand: ['Mystical Space Typhoon'], m: [FILL], turn: 2 }] });
  act(g, 1, 'Mystical Space Typhoon'); settle(g, 'Face-down', FILL); toIdle(g, FILL);
  ok(inZ(g, 0, 'gy', 'Security Orb') && inZ(g, 1, 'gy', FILL), 'Warwolf destroyed');
});
T('Seismic Crasher: send a face-up Continuous card for 500, twice per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Seismic Crasher'], st: [up('Gravity Bind'), up('Level Limit - Area B'), up("Robbin' Zombie")], turn: 2 }, {}] });
  eff(g, 0, 'Seismic Crasher', 'Gravity'); eff(g, 0, 'Seismic Crasher', 'Level Limit');
  ok(lp(g, 1) === 7000 && cnt(g, 0, 'gy') === 2, `B at ${lp(g, 1)}`);
  ok(!canAct(g, 0, 'Seismic Crasher'), 'no third use');
});
T('Seismic Shockwave locks 3 opponent S/T zones', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: [SAB], st: ['Seismic Shockwave'] }, { hand: ['Smashing Ground', 'Jar of Greed', 'Jar of Greed', 'Jar of Greed'], turn: 2 }] });
  act(g, 1, 'Smashing Ground'); settle(g, 'Seismic Shockwave'); toIdle(g, 'Seismic Shockwave');
  ok(inZ(g, 0, 'gy', SAB) && inZ(g, 0, 'st', 'Seismic Shockwave') && card(g, 0, 'Seismic Shockwave').pos === 'up', 'Shockwave activated');
  let n = 0; for (let i = 0; i < 3; i++) { const j = g.p[1].hand.find(c => E.name(c) === 'Jar of Greed'); if (j && hasOpt(g, 'setst:' + j.u)) { choose(g, 'setst:' + j.u); settle(g); n++; } }
  ok(n === 2, `B could Set ${n} cards (2 zones left)`);
});
T('Senet Switch moves a monster once per turn', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: FILL, zi: 0 }], st: [up('Senet Switch')], turn: 2 }, {}] });
  act(g, 0, 'Senet Switch'); settle(g, FILL, 'Right'); toIdle(g, 'Right');
  ok(zoneOf(g, 0, FILL) === 1, `Warwolf in zone ${zoneOf(g, 0, FILL)}`);
  ok(!canAct(g, 0, 'Senet Switch'), 'once per turn');
});
T('Serpent Suppression: opponent 0 ATK monsters survive Reptilianne attacks', () => {
  const g = duel({ board: [{ hand: [], m: ['Reptilianne Scylla'], st: [up('Serpent Suppression')], turn: 2 }, { m: ['Battle Fader'] }] });
  bp(g); atkOn(g, 0, 'Reptilianne Scylla', 'Battle Fader');
  ok(on(g, 1, 'Battle Fader') && lp(g, 1) === 6200, `Battle Fader survives, B at ${lp(g, 1)}`);
});
T('Shadowpriestess of Ohm: Tribute a face-up DARK for 800', () => {
  const g = duel({ board: [{ hand: [], m: ['Shadowpriestess of Ohm', 'Krebons'], turn: 2 }, {}] });
  eff(g, 0, 'Shadowpriestess of Ohm', 'Krebons');
  ok(lp(g, 1) === 7200 && inZ(g, 0, 'gy', 'Krebons'), `B at ${lp(g, 1)}`);
});
T('Shark Cruiser summons up to 2 WATER Level 4 when destroyed by an opponent effect', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['Shark Cruiser'], deckTop: ['Amazon of the Seas', 'Amazon of the Seas'] }, { hand: ['Smashing Ground'], turn: 2 }] });
  act(g, 1, 'Smashing Ground'); settle(g, 'Amazon of the Seas', 'Amazon of the Seas'); toIdle(g, 'Amazon of the Seas', 'Amazon of the Seas');
  ok(inZ(g, 0, 'gy', 'Shark Cruiser') && cnt(g, 0, 'm', 'Amazon of the Seas') === 2, `${cnt(g, 0, 'm', 'Amazon of the Seas')} Amazons summoned`);
});
console.log(fails ? `\n${fails} failed` : '\nAll full-43 review checks passed.');
process.exit(fails ? 1 : 0);
