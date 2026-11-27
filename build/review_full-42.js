// Independent review checks for full pool batch 42 (written from the card text): node build/review_full-42.js
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
const W = FILL, CG = 'Celtic Guardian', ELF = 'Mystical Elf', BEWD = 'Blue-Eyes White Dragon';
const set = n => ({ n, pos: 'set' }), dpos = n => ({ n, pos: 'def' });
const ign = (g, c, ...picks) => { const o = optsFor(g, c).find(x => x.key.startsWith('a:')); if (!o) throw new Error('no effect option for ' + E.name(c)); E.act(g, [o.key]); settle(g, ...picks); };
const hasIgn = (g, c) => optsFor(g, c).some(x => x.key.startsWith('a:'));
const DD = 'Destiny HERO - Diamond Dude', MPZ = 'Mystic Plasma Zone', GP = 'Gaia Power', WHALE = 'Fortress Whale', OATH = "Fortress Whale's Oath";
const mons = (g, p) => g.p[p].m.filter(Boolean);
// play turns until it is player p's Main Phase again (passing everything, answering prompts with picks)
const nextMain = (g, p, ...picks) => { for (let i = 0; i < 6; i++) { toIdle(g, ...picks); if (g.tp === p && g.phase === 'main1' && idle(g) && i > 0) return; endTurn(g, ...picks); } };
const turns = (g, n, ...picks) => { for (let i = 0; i < n; i++) { toIdle(g, ...picks); endTurn(g, ...picks); } toIdle(g, ...picks); };

const ctrSum = c => Object.values(c.ctr || {}).reduce((a, b) => a + (+b || 0), 0);
const B1 = { first: 1 };
const opp = (b0, b1) => duel({ first: 1, board: [{ ...b0, turn: 2 }, { hand: [], ...b1, turn: 2 }] });
const flipSum = (g, p, n, ...picks) => { choose(g, 'flip:' + on(g, p, n).u); settle(g, ...picks); };

T('Obelisk: 3 Tributes, no Set, Tribute 2 to destroy all opponent monsters, then no attack', () => {
  const O = 'Obelisk the Tormentor';
  const g = duel({ board: [{ hand: [O], m: [W, W, W, CG, ELF], turn: 2 }, { m: [W, BEWD] }] });
  const o = card(g, 0, O); ok(!hasOpt(g, 'set:' + o.u), 'cannot be Set');
  ns(g, 0, O, W); toIdle(g, W);
  ok(on(g, 0, O) && cnt(g, 0, 'gy', W) === 3, 'Obelisk Tribute Summoned with 3 Tributes');
  ign(g, on(g, 0, O), CG, ELF); toIdle(g, CG, ELF);
  ok(cnt(g, 1, 'm') === 0 && inZ(g, 0, 'gy', CG) && inZ(g, 0, 'gy', ELF), 'Tributed 2, all B monsters destroyed');
  choose(g, 'bp'); settle(g);
  ok(!canAtk(g, on(g, 0, O), null), 'Obelisk cannot attack this turn');
  const g2 = duel({ board: [{ hand: [O], m: [W, W], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, O).u), 'not with only 2 monsters');
});
T('Obnoxious Celtic Guard: survives battle with 1900+ ATK, not with less', () => {
  const g = opp({ m: ['Obnoxious Celtic Guard'] }, { m: [BEWD] });
  bp(g); atkOn(g, 1, BEWD, 'Obnoxious Celtic Guard'); toIdle(g);
  ok(on(g, 0, 'Obnoxious Celtic Guard') && lp(g, 0) === 6400, `survives Blue-Eyes, A took 1600 (${lp(g, 0)})`);
  const g2 = opp({ m: ['Obnoxious Celtic Guard'] }, { m: ['Gladiator Beast Laquari'] });
  bp(g2); atkOn(g2, 1, 'Gladiator Beast Laquari', 'Obnoxious Celtic Guard'); toIdle(g2);
  ok(inZ(g2, 0, 'gy', 'Obnoxious Celtic Guard'), 'destroyed by an 1800 ATK monster');
});
T('Obsidian Dragon: negates and destroys a Spell targeting 1 DARK monster', () => {
  const g = opp({ m: ['Obsidian Dragon'] }, { hand: ['Book of Moon'] });
  act(g, 1, 'Book of Moon'); settle(g, 'Obsidian Dragon'); toIdle(g);
  const o = on(g, 0, 'Obsidian Dragon');
  ok(o && o.pos === 'atk' && inZ(g, 1, 'gy', 'Book of Moon'), 'Obsidian Dragon stays face-up, Book of Moon destroyed');
});
T("Ocean's Keeper: piercing-style difference damage, searches on battle destruction", () => {
  const g = duel({ board: [{ hand: [], m: ["Ocean's Keeper"], turn: 2 }, { m: [dpos(CG)] }] });
  bp(g); atkOn(g, 0, "Ocean's Keeper", CG); toIdle(g);
  ok(inZ(g, 1, 'gy', CG) && lp(g, 1) === 7700, `300 damage to B (${lp(g, 1)})`);
  const g2 = opp({ m: ["Ocean's Keeper"], deckTop: ['Thousand-Eyes Jellyfish'] }, { m: [BEWD] });
  bp(g2); atkOn(g2, 1, BEWD, "Ocean's Keeper", 'Thousand-Eyes Jellyfish'); toIdle(g2, 'Thousand-Eyes Jellyfish');
  ok(inZ(g2, 0, 'hand', 'Thousand-Eyes Jellyfish'), 'Jellyfish added to the hand');
});
T('Offering to the Immortals: negates a direct attack at 3000 LP, 2 tokens, Earthbound search', () => {
  const g = opp({ lp: 3000, st: ['Offering to the Immortals'], deckTop: ['Earthbound Immortal Uru'] }, { m: [W] });
  bp(g); atkOn(g, 1, W, null, 'Offering to the Immortals', 'Earthbound Immortal Uru'); toIdle(g, 'Earthbound Immortal Uru');
  ok(lp(g, 0) === 3000, `attack negated (${lp(g, 0)})`);
  ok(cnt(g, 0, 'm') === 2 && inZ(g, 0, 'hand', 'Earthbound Immortal Uru'), 'two tokens and Uru added');
  const g2 = opp({ st: ['Offering to the Immortals'] }, { m: [W] });
  bp(g2); atkOn(g2, 1, W, null, 'Offering to the Immortals'); toIdle(g2);
  ok(lp(g2, 0) === 6000 && inZ(g2, 0, 'st', 'Offering to the Immortals'), 'not at 8000 LP');
});
T('Ogre of the Scarlet Sorrow: Special Summoned on the second direct attack with the first attacker stats', () => {
  const g = opp({ hand: ['Ogre of the Scarlet Sorrow'] }, { m: [W, 'Gladiator Beast Laquari'] });
  bp(g); atkOn(g, 1, W, null); toIdle(g);
  ok(lp(g, 0) === 6000, 'first direct attack hit');
  atkOn(g, 1, 'Gladiator Beast Laquari', null, 'Ogre of the Scarlet Sorrow', 'Attack');
  const o = on(g, 0, 'Ogre of the Scarlet Sorrow');
  ok(o && E.atk(g, o) === 2000 && E.def(g, o) === 100, `Ogre summoned with 2000/100 (${o && E.atk(g, o)}/${o && E.def(g, o)})`);
});
T('Oilman: equips to a Machine, draws when it destroys a monster by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Oilman', 'Cyber Dragon'], turn: 2 }, { m: [CG] }] });
  ign(g, on(g, 0, 'Oilman'), 'Cyber Dragon'); toIdle(g, 'Cyber Dragon');
  ok(inZ(g, 0, 'st', 'Oilman'), 'Oilman equipped');
  const h = hand(g, 0);
  bp(g); atkOn(g, 0, 'Cyber Dragon', CG); toIdle(g);
  ok(inZ(g, 1, 'gy', CG) && hand(g, 0) === h + 1, `drew 1 (${hand(g, 0)} vs ${h})`);
});
T('Ojamuscle: destroys the other Ojamas, King gains 1000 each', () => {
  const g = duel({ board: [{ hand: ['Ojamuscle'], m: ['Ojama King', 'Ojama Yellow'], turn: 2 }, { m: ['Ojama Green', W] }] });
  act(g, 0, 'Ojamuscle'); settle(g, 'Ojama King'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Ojama Yellow') && inZ(g, 1, 'gy', 'Ojama Green') && on(g, 1, W), 'Yellow and Green destroyed, Warwolf stays');
  ok(E.atk(g, on(g, 0, 'Ojama King')) === 2000, `King 2000 ATK (${E.atk(g, on(g, 0, 'Ojama King'))})`);
});
T('Omega Goggles: equip, look at a card, equipped monster cannot attack that turn', () => {
  const g = duel({ board: [{ hand: ['Omega Goggles'], m: [W], turn: 2 }, {}] });
  act(g, 0, 'Omega Goggles'); settle(g, W); toIdle(g);
  ok(inZ(g, 0, 'st', 'Omega Goggles'), 'equipped');
  ok(canAct(g, 0, 'Omega Goggles'), 'look effect offered'); act(g, 0, 'Omega Goggles'); settle(g); toIdle(g);
  ok(!canAct(g, 0, 'Omega Goggles'), 'once per turn');
  choose(g, 'bp'); settle(g);
  ok(!canAtk(g, on(g, 0, W), null), 'Warwolf cannot attack');
});
T('Option Hunter: gain the original ATK of the monster destroyed by battle', () => {
  const g = opp({ m: [CG], st: ['Option Hunter'] }, { m: [BEWD] });
  bp(g); atkOn(g, 1, BEWD, CG, 'Option Hunter'); toIdle(g);
  ok(lp(g, 0) === 8000 - 1600 + 1400, `A at 7800 (${lp(g, 0)})`);
});
T('Oracle of the Sun: Special Summon when only the opponent has monsters; search when destroyed', () => {
  const g = duel({ board: [{ hand: ['Oracle of the Sun', 'Dark Hole'], deckTop: ['Supay'], turn: 2 }, { m: [W] }] });
  choose(g, 'sp:' + card(g, 0, 'Oracle of the Sun').u); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Oracle of the Sun'), 'Oracle Special Summoned');
  act(g, 0, 'Dark Hole'); settle(g, 'Supay'); toIdle(g, 'Supay');
  ok(inZ(g, 0, 'hand', 'Supay'), 'Supay added');
  const g2 = duel({ board: [{ hand: ['Oracle of the Sun'], m: [CG], turn: 2 }, { m: [W] }] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Oracle of the Sun').u), 'not while A controls a monster');
});
T('Orb of Yasaka: Spirit gains LP equal to the destroyed monster original ATK', () => {
  const g = duel({ board: [{ hand: ['Orb of Yasaka'], m: ['Asura Priest'], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'Orb of Yasaka'); settle(g, 'Asura Priest'); toIdle(g);
  bp(g); atkOn(g, 0, 'Asura Priest', CG); toIdle(g);
  ok(lp(g, 0) === 9400, `gained 1400 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Orb of Yasaka'], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Orb of Yasaka'), 'not without a Spirit');
});
T('Orbital Bombardment: send an Alien to destroy a Spell/Trap', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Grey'], st: ['Orbital Bombardment'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Orbital Bombardment'); settle(g, 'Alien Grey', 'Face-down card'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Alien Grey') && inZ(g, 1, 'gy', 'Mirror Force'), 'Alien sent, Mirror Force destroyed');
});
T('Orichalcos Shunoros: summoned when a Normal Monster is destroyed by battle, 1000 ATK per opp monster', () => {
  const S = 'Orichalcos Shunoros';
  const g = opp({ hand: [S], m: [CG] }, { m: [BEWD, W] });
  ok(true, '');
  bp(g); atkOn(g, 1, BEWD, CG, S, 'Attack'); toIdle(g, 'Attack');
  const s = on(g, 0, S);
  ok(s && E.atk(g, s) === 2000, `Shunoros summoned with 2000 ATK (${s && E.atk(g, s)})`);
  const g2 = duel({ board: [{ hand: [S, 'Dark Hole'], m: [CG], turn: 2 }, {}] });
  ok(noSummon(g2, card(g2, 0, S)), 'cannot be Normal Summoned or summoned by itself');
  const g3 = duel({ board: [{ hand: ['Dark Hole'], m: [CG, S], turn: 2 }, { m: [W] }] });
  act(g3, 0, 'Dark Hole'); settle(g3); toIdle(g3);
  // the text protects face-up Level 4 Normals on the whole field, so the opponent's Normal survives too (destroyed together, 2026-11-26)
  ok(on(g3, 0, CG) && on(g3, 1, W) && inZ(g3, 0, 'gy', S), 'face-up Level 4 Normals on both sides survive Dark Hole');
});
T('Oshaleon: must be attacked, searches a 500 ATK or less Reptile', () => {
  const g = opp({ m: ['Oshaleon', CG], deckTop: ['Alien Grey'] }, { m: [W] });
  bp(g); ok(!canAtk(g, on(g, 1, W), on(g, 0, CG)), 'cannot attack Celtic');
  atkOn(g, 1, W, 'Oshaleon', 'Alien Grey'); toIdle(g, 'Alien Grey');
  ok(inZ(g, 0, 'hand', 'Alien Grey'), 'Alien Grey added');
});
T('Over Destiny: Special Summon a Destiny HERO of half the Level, destroyed in the End Phase', () => {
  const DD = 'Destiny HERO - Diamond Dude';
  const g = duel({ board: [{ hand: ['Over Destiny'], gy: ['Destiny HERO - Dogma'], deckTop: [W, DD], turn: 2 }, {}] });
  act(g, 0, 'Over Destiny'); settle(g, 'Destiny HERO - Dogma', DD, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, DD), 'Diamond Dude summoned');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', DD), 'destroyed in the End Phase');
});
T('Over Limit: pay 500, revive both players Normals of 1000 or less destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: [W, 'Ojama Yellow'], st: [null, 'Over Limit'], turn: 2 }, { m: ['Ojama Green', CG] }] });
  bp(g); atkOn(g, 0, 'Ojama Yellow', CG); atkOn(g, 0, W, 'Ojama Green'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Ojama Yellow') && inZ(g, 1, 'gy', 'Ojama Green'), 'both Ojamas destroyed');
  const l = lp(g, 0);
  act(g, 0, 'Over Limit'); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Ojama Yellow') && on(g, 0, 'Ojama Green') && lp(g, 0) === l - 500, `both back under A, paid 500 (${l} to ${lp(g, 0)})`);
});
T('Overdoom Line: Plant Special Summoned from the GY gains 1000', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], st: [up('Overdoom Line')], gy: ['Botanical Girl'], turn: 2 }, {}] });
  act(g, 0, 'Monster Reborn'); settle(g, 'Botanical Girl', 'Attack'); toIdle(g, 'Attack');
  ok(E.atk(g, on(g, 0, 'Botanical Girl')) === 2300, `Botanical Girl 2300 (${E.atk(g, on(g, 0, 'Botanical Girl'))})`);
});
T('Overwhelm: with a Tribute Summoned Level 7, negate a Trap', () => {
  const g = duel({ board: [{ hand: ['Dark Magician'], m: [CG, ELF], st: ['Overwhelm'], turn: 2 }, { st: ['Mirror Force'] }] });
  ns(g, 0, 'Dark Magician', CG, ELF); toIdle(g, CG, ELF);
  bp(g); atkOn(g, 0, 'Dark Magician', null, 'Mirror Force', 'Overwhelm'); toIdle(g);
  ok(on(g, 0, 'Dark Magician') && inZ(g, 1, 'gy', 'Mirror Force') && lp(g, 1) === 5500, `Mirror Force negated, DM hit (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Dark Magician'], st: ['Overwhelm'], turn: 2 }, { st: ['Mirror Force'] }] });
  bp(g2); atkOn(g2, 0, 'Dark Magician', null, 'Mirror Force', 'Overwhelm'); toIdle(g2);
  ok(inZ(g2, 0, 'gy', 'Dark Magician'), 'not with a monster that was not Tribute Summoned');
});
T('Overworked: destroys monsters above their original ATK', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: [W, CG], st: ['Overworked'], turn: 2 }, { m: [ELF] }] });
  act(g, 0, 'Black Pendant'); settle(g, W); toIdle(g);
  act(g, 0, 'Overworked'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', W) && on(g, 0, CG) && on(g, 1, ELF), 'only the boosted Warwolf destroyed');
});
T("Owner's Seal: control returns to the owner", () => {
  const g = duel({ board: [{ hand: ['Change of Heart', "Owner's Seal"], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Change of Heart'); settle(g, BEWD); toIdle(g);
  ok(on(g, 0, BEWD), 'Blue-Eyes taken');
  act(g, 0, "Owner's Seal"); settle(g); toIdle(g);
  ok(on(g, 1, BEWD) && !on(g, 0, BEWD), 'Blue-Eyes back with B');
});
T('Oxygeddon: 800 to each player when destroyed by a Pyro', () => {
  const g = opp({ m: ['Oxygeddon'] }, { m: ['Gaia Soul the Combustible Collective'] });
  bp(g); atkOn(g, 1, 'Gaia Soul the Combustible Collective', 'Oxygeddon'); toIdle(g);
  ok(lp(g, 0) === 8000 - 200 - 800 && lp(g, 1) === 7200, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
});
T('Paladin of the Cursed Dragon: revive an opponent Zombie destroyed by battle', () => {
  const P = 'Paladin of the Cursed Dragon';
  const g = duel({ board: [{ hand: [], m: [P], turn: 2 }, { m: ['Dark Assailant'] }] });
  bp(g); atkOn(g, 0, P, 'Dark Assailant'); toIdle(g);
  E.act(g, ['endbp']); settle(g); toIdle(g);
  ign(g, on(g, 0, P), 'Dark Assailant', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Dark Assailant'), 'Dark Assailant summoned to A');
  const g2 = duel({ board: [{ hand: [], m: [P], turn: 2 }, { gy: ['Dark Assailant'] }] });
  ok(!hasIgn(g2, on(g2, 0, P)), 'not for a Zombie that was not destroyed by battle');
});
T('Pandaborg: pay 800 to summon a Level 4 Psychic when destroyed by battle', () => {
  const g = opp({ m: ['Pandaborg'], deckTop: ['Psychic Snail'] }, { m: [BEWD] });
  bp(g); atkOn(g, 1, BEWD, 'Pandaborg', 'Psychic Snail', 'Attack'); toIdle(g, 'Psychic Snail', 'Attack');
  ok(on(g, 0, 'Psychic Snail') && lp(g, 0) === 8000 - 1300 - 800, `Snail summoned, LP ${lp(g, 0)}`);
});
T('Panther Warrior: Tribute 1 monster to attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Panther Warrior', CG], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Panther Warrior', null, CG); toIdle(g, CG);
  ok(inZ(g, 0, 'gy', CG) && lp(g, 1) === 6000, `Celtic Tributed, 2000 damage (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Panther Warrior'], turn: 2 }, {}] });
  bp(g2); ok(!canAtk(g2, on(g2, 0, 'Panther Warrior'), null), 'cannot attack with nothing to Tribute');
});
T('Paralyzing Chain: 300 when the opponent Deck is milled', () => {
  const g = duel({ board: [{ hand: [], m: [set('Needle Worm')], st: [up('Paralyzing Chain')], turn: 2 }, {}] });
  flipSum(g, 0, 'Needle Worm'); toIdle(g);
  ok(cnt(g, 1, 'gy') === 5 && lp(g, 1) === 7700, `5 milled, B at ${lp(g, 1)}`);
});
T('Parasitic Ticky: 500 ATK per token', () => {
  const g = duel({ board: [{ hand: ['Scapegoat'], m: ['Parasitic Ticky'], turn: 2 }, {}] });
  act(g, 0, 'Scapegoat'); settle(g); toIdle(g);
  const t = on(g, 0, 'Parasitic Ticky'); ok(E.atk(g, t) === 2000 && E.def(g, t) === 2000, `2000/2000 (${E.atk(g, t)})`);
});
T('Parry: return a Gladiator Beast to negate a Trap', () => {
  const g = duel({ board: [{ hand: ['Gladiator Beast Laquari'], m: [W], st: ['Parry'], turn: 2 }, { st: ['Mirror Force'] }] });
  bp(g); atkOn(g, 0, W, null, 'Mirror Force', 'Parry', 'Gladiator Beast Laquari'); toIdle(g);
  ok(on(g, 0, W) && inZ(g, 1, 'gy', 'Mirror Force') && !inZ(g, 0, 'hand', 'Gladiator Beast Laquari'), 'Mirror Force negated, Laquari returned');
});
T('Patroid: look at a face-down card once per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Patroid'], turn: 2 }, { st: ['Mirror Force'] }] });
  const p = on(g, 0, 'Patroid'); ok(hasIgn(g, p), 'offered'); ign(g, p, 'Face-down card'); toIdle(g);
  ok(g.p[1].st.find(Boolean).pos === 'set' && !hasIgn(g, p), 'card stays face-down, once per turn');
});
T('Perfectly Ultimate Great Moth: cannot be Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Perfectly Ultimate Great Moth'], m: [W, W], turn: 2 }, {}] });
  ok(noSummon(g, card(g, 0, 'Perfectly Ultimate Great Moth')), 'no summon from hand');
});
T('Phalanx Pike: 900 per card of the same name in the GYs', () => {
  const g = duel({ board: [{ hand: ['Phalanx Pike'], m: [W], gy: [W], turn: 2 }, { gy: [W] }] });
  act(g, 0, 'Phalanx Pike'); settle(g, W); toIdle(g);
  ok(E.atk(g, on(g, 0, W)) === 3800, `Warwolf 3800 (${E.atk(g, on(g, 0, W))})`);
});
T('Phantasmal Martyrs: send the hand, 3 tokens', () => {
  const g = duel({ board: [{ hand: ['Phantasmal Martyrs', CG, ELF], m: ['Uria, Lord of Searing Flames'], turn: 2 }, {}] });
  act(g, 0, 'Phantasmal Martyrs'); settle(g); toIdle(g);
  ok(hand(g, 0) === 0 && cnt(g, 0, 'm') === 4 && inZ(g, 0, 'gy', CG), `hand sent, 3 tokens (${cnt(g, 0, 'm')} monsters)`);
  const g2 = duel({ board: [{ hand: ['Phantasmal Martyrs', CG], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Phantasmal Martyrs'), 'not without Uria or Hamon');
});
T('Phoenix Gearfried: after a Gemini Summon, revives a Gemini when the opponent activates a Spell', () => {
  const PG = 'Phoenix Gearfried';
  const g = duel({ board: [{ hand: [], m: [PG], gy: ['Gemini Lancer'], turn: 2 }, { hand: ['Pot of Greed'] }] });
  choose(g, 'gem:' + on(g, 0, PG).u); settle(g); toIdle(g);
  endTurn(g); toIdle(g);
  act(g, 1, 'Pot of Greed'); settle(g, PG, 'Gemini Lancer', 'Attack'); toIdle(g, 'Gemini Lancer', 'Attack');
  ok(on(g, 0, 'Gemini Lancer'), 'Gemini Lancer Special Summoned');
  const g2 = duel({ board: [{ hand: [], m: [PG], gy: ['Gemini Lancer'], turn: 2 }, { hand: ['Pot of Greed'] }] });
  endTurn(g2); toIdle(g2); act(g2, 1, 'Pot of Greed'); settle(g2, PG, 'Gemini Lancer'); toIdle(g2);
  ok(!on(g2, 0, 'Gemini Lancer'), 'no effect as a Normal Monster');
});
T('Phoenixian Seed: send it to summon Phoenixian Cluster Amaryllis', () => {
  const g = duel({ board: [{ hand: ['Phoenixian Cluster Amaryllis'], m: ['Phoenixian Seed'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Phoenixian Seed'), 'Phoenixian Cluster Amaryllis', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Phoenixian Cluster Amaryllis') && inZ(g, 0, 'gy', 'Phoenixian Seed'), 'Amaryllis summoned');
});
T('Photon Generator Unit + Proto-Cyber Dragon: Tribute 2 Cyber Dragons for Cyber Laser Dragon', () => {
  const g = duel({ board: [{ hand: ['Photon Generator Unit', 'Cyber Laser Dragon'], m: ['Cyber Dragon', 'Proto-Cyber Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Photon Generator Unit'); settle(g, 'Cyber Dragon', 'Attack'); toIdle(g);
  ok(on(g, 0, 'Cyber Laser Dragon') && cnt(g, 0, 'm') === 1, 'Cyber Laser Dragon summoned, 2 Tributed');
});
T('Pixie Ring: lowest ATK monster cannot be attacked', () => {
  const g = opp({ m: [CG, W], st: [up('Pixie Ring')] }, { m: [BEWD] });
  bp(g); const b = on(g, 1, BEWD);
  ok(!canAtk(g, b, on(g, 0, CG)) && canAtk(g, b, on(g, 0, W)), 'only Warwolf can be attacked');
});
T('Plague Wolf: double ATK, destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Plague Wolf'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Plague Wolf')); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Plague Wolf')) === 2000, 'ATK 2000');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Plague Wolf'), 'destroyed in the End Phase');
});
T('Plant Food Chain: +500 to a Plant, revives a Plant when destroyed', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Botanical Girl'], st: ['Plant Food Chain'], gy: ['Botanical Lion'], turn: 2 }, {}] });
  act(g, 0, 'Plant Food Chain'); settle(g, 'Botanical Girl'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Botanical Girl')) === 1800, 'Botanical Girl 1800');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Plant Food Chain', 'Botanical Lion', 'Attack'); toIdle(g, 'Botanical Lion', 'Attack');
  ok(on(g, 0, 'Botanical Lion'), 'Botanical Lion summoned');
});
T('Pollinosis: Tribute a Plant to negate a Summon', () => {
  const g = opp({ m: ['Botanical Lion'], st: ['Pollinosis'] }, { hand: [W] });
  ns(g, 1, W, 'Pollinosis', 'Botanical Lion'); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && inZ(g, 0, 'gy', 'Botanical Lion'), 'Summon negated, Plant Tributed');
});
T('Portable Battery Pack: summons 2 Batterymen, destroys them when it leaves', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Portable Battery Pack'], gy: ['Batteryman AA', 'Batteryman C'], turn: 2 }, {}] });
  act(g, 0, 'Portable Battery Pack'); settle(g, 'Batteryman AA', 'Batteryman C'); toIdle(g);
  ok(on(g, 0, 'Batteryman AA') && on(g, 0, 'Batteryman C') && on(g, 0, 'Batteryman C').pos === 'atk', 'both summoned in Attack Position');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Portable Battery Pack'); toIdle(g);
  ok(cnt(g, 0, 'm') === 0, 'both destroyed with the Pack');
});
T('Powered Tuner: +500 per face-up Tuner', () => {
  const g = duel({ board: [{ hand: [], m: ['Powered Tuner', 'Psychic Commander'], turn: 2 }, { m: ['Krebons', set('Mind Master')] }] });
  ok(E.atk(g, on(g, 0, 'Powered Tuner')) === 2400, `2400 (${E.atk(g, on(g, 0, 'Powered Tuner'))})`);
});
T('Pragtical: Fusion of Trakodon and Flame Viper', () => {
  const g = duel({ ex0: ['Pragtical'], board: [{ hand: ['Polymerization', 'Trakodon', 'Flame Viper'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Pragtical', 'Trakodon', 'Flame Viper', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Pragtical'), 'Pragtical summoned');
});
T('Prepare to Strike Back: coin on a Defense Position target', () => {
  const g = opp({ m: [dpos(CG)], st: [up('Prepare to Strike Back')] }, { m: [BEWD] });
  bp(g); atkOn(g, 1, BEWD, CG); toIdle(g);
  const L = g.log.join('\n');
  ok(/coin/i.test(L) && inZ(g, 0, 'gy', CG) && (lp(g, 0) === 6400 || lp(g, 0) === 6200), `coin tossed, A at ${lp(g, 0)}`);
});
T('Prevention Star: chosen monster cannot attack; banished when the equipped monster is destroyed', () => {
  const g = duel({ board: [{ hand: ['Prevention Star'], m: [W], turn: 2 }, { m: [BEWD, CG] }] });
  const w = on(g, 0, W); choose(g, 'pos:' + w.u); settle(g); toIdle(g);
  ok(w.pos === 'def', 'Warwolf to Defense');
  act(g, 0, 'Prevention Star'); settle(g, W, BEWD); toIdle(g);
  ok(inZ(g, 0, 'st', 'Prevention Star'), 'equipped');
  endTurn(g); toIdle(g); bp(g);
  ok(!canAtk(g, on(g, 1, BEWD), w), 'Blue-Eyes cannot attack');
  atkOn(g, 1, CG, W); toIdle(g);
  ok(inZ(g, 0, 'gy', W) && inZ(g, 1, 'ban', BEWD), 'Warwolf destroyed, Blue-Eyes banished');
  const g2 = duel({ board: [{ hand: ['Prevention Star'], m: [dpos(W)], turn: 2 }, { m: [BEWD] }] });
  ok(!canAct(g2, 0, 'Prevention Star'), 'not without a position change this turn');
});
T('Pride of the Weak: Level 2 or lower destroys a monster with an empty hand: draw 2', () => {
  const g = duel({ board: [{ hand: [], m: ['Krebons'], st: [up('Pride of the Weak')], turn: 2 }, { m: ['Ojama Green'] }] });
  ns(g, 0, W); ok(hand(g, 0) === 0, 'hand empty');
  bp(g); atkOn(g, 0, 'Krebons', 'Ojama Green'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Ojama Green') && hand(g, 0) === 2, `drew 2 (${hand(g, 0)})`);
});
T('Prideful Roar: pay the difference, gain it +300 in damage calculation', () => {
  const g = duel({ board: [{ hand: [], m: [CG], st: ['Prideful Roar'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, CG, W, 'Prideful Roar'); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && on(g, 0, CG) && lp(g, 0) === 7400 && lp(g, 1) === 7700, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
  ok(E.atk(g, on(g, 0, CG)) === 1400, 'back to 1400 after damage calculation');
});
T('Prime Material Falcon: discard 1 to negate a monster effect that destroys a Spell/Trap', () => {
  const g = opp({ hand: [CG], m: ['Prime Material Falcon'], st: ['Mirror Force'] }, { hand: ['Breaker the Magical Warrior'] });
  ns(g, 1, 'Breaker the Magical Warrior'); toIdle(g);
  const b = on(g, 1, 'Breaker the Magical Warrior'); ign(g, b, 'Face-down card', 'Prime Material Falcon', CG); toIdle(g);
  ok(inZ(g, 0, 'st', 'Mirror Force') && inZ(g, 1, 'gy', 'Breaker the Magical Warrior') && inZ(g, 0, 'gy', CG), 'Mirror Force stays, Breaker destroyed, Celtic discarded');
});
T('Prometheus: banish DARK monsters for 400 ATK each this turn', () => {
  const P = 'Prometheus, King of the Shadows';
  const g = duel({ board: [{ hand: [P], gy: ['Spirit Reaper', 'Dark Magician', CG], turn: 2 }, {}] });
  ns(g, 0, P, 'Spirit Reaper', 'Dark Magician'); toIdle(g, 'Spirit Reaper', 'Dark Magician');
  ok(E.atk(g, on(g, 0, P)) === 2000 && inZ(g, 0, 'ban', 'Dark Magician') && inZ(g, 0, 'gy', CG), `2000 ATK (${E.atk(g, on(g, 0, P))})`);
  endTurn(g); toIdle(g);
  ok(E.atk(g, on(g, 0, P)) === 1200, 'back to 1200 next turn');
});
T('Proof of Powerlessness: destroy face-up Level 5 or lower, no attacks', () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Magician'], st: ['Proof of Powerlessness'], turn: 2 }, { m: [W, BEWD, set(CG)] }] });
  act(g, 0, 'Proof of Powerlessness'); settle(g); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && on(g, 1, BEWD) && on(g, 1, CG), 'Warwolf destroyed, Blue-Eyes and set Celtic stay');
  choose(g, 'bp'); settle(g);
  ok(!canAtk(g, on(g, 0, 'Dark Magician'), on(g, 1, BEWD)), 'Dark Magician cannot attack');
});
T('Protective Soul Ailin: equips to Lei Lei, which can change position', () => {
  const g = duel({ board: [{ hand: [], m: ['Protective Soul Ailin', 'Indomitable Fighter Lei Lei'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Protective Soul Ailin'), 'Indomitable Fighter Lei Lei'); toIdle(g, 'Indomitable Fighter Lei Lei');
  ok(inZ(g, 0, 'st', 'Protective Soul Ailin'), 'Ailin equipped');
  const l = on(g, 0, 'Indomitable Fighter Lei Lei'); const pos0 = l.pos;
  const o = optsFor(g, l).find(x => x.key.startsWith('pos:') || x.key.startsWith('a:'));
  if (o) { E.act(g, [o.key]); settle(g, 'Defense'); toIdle(g); }
  ok(l.pos !== pos0, `Lei Lei changed position (${pos0} to ${l.pos})`);
});
T('Pseudo Space: copies a banished Field Spell', () => {
  const g = duel({ board: [{ hand: ['Pseudo Space'], m: [W], gy: ['Gaia Power'], turn: 2 }, {}] });
  act(g, 0, 'Pseudo Space'); settle(g); toIdle(g);
  act(g, 0, 'Pseudo Space'); settle(g, 'Gaia Power'); toIdle(g);
  ok(inZ(g, 0, 'ban', 'Gaia Power'), 'Gaia Power banished (copying its effect is a documented ENGINE gap)');
});
T('Psychokinesis: destroy a card, take 1000', () => {
  const g = duel({ board: [{ hand: ['Psychokinesis'], m: ['Psychic Snail'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Psychokinesis'); settle(g, BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && lp(g, 0) === 7000, `Blue-Eyes destroyed, A ${lp(g, 0)}`);
  const g2 = duel({ board: [{ hand: ['Psychokinesis'], m: [W], turn: 2 }, { m: [BEWD] }] });
  ok(!canAct(g2, 0, 'Psychokinesis'), 'not without a Psychic');
});
T('Pursuit Chaser: 500 when a Defense Position monster is destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Pursuit Chaser', W], turn: 2 }, { m: [dpos(CG)] }] });
  bp(g); atkOn(g, 0, W, CG); toIdle(g);
  ok(lp(g, 1) === 7500, `B ${lp(g, 1)}`);
});
T("Queen's Bodyguard: Allure Queen cannot be attacked", () => {
  const g = opp({ m: ["Queen's Bodyguard", 'Allure Queen LV3'] }, { m: [BEWD] });
  bp(g); const b = on(g, 1, BEWD);
  ok(!canAtk(g, b, on(g, 0, 'Allure Queen LV3')) && canAtk(g, b, on(g, 0, "Queen's Bodyguard")), 'only the Bodyguard is a target');
});
T('Quick Charger: add 2 Batterymen from the GY', () => {
  const g = duel({ board: [{ hand: ['Quick Charger'], gy: ['Batteryman AA', 'Batteryman C'], turn: 2 }, {}] });
  act(g, 0, 'Quick Charger'); settle(g, 'Batteryman AA', 'Batteryman C'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Batteryman AA') && inZ(g, 0, 'hand', 'Batteryman C'), 'both added');
});
T('Quillbolt Hedgehog: revives with a Tuner, banished when it leaves', () => {
  const Q = 'Quillbolt Hedgehog';
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Psychic Commander'], gy: [Q], turn: 2 }, {}] });
  ok(canAct(g, 0, Q), 'offered from the GY'); act(g, 0, Q); settle(g, 'Defense'); toIdle(g, 'Defense');
  ok(on(g, 0, Q), 'Hedgehog summoned');
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'ban', Q), 'banished when it left');
  const g2 = duel({ board: [{ hand: [], m: [W], gy: [Q], turn: 2 }, {}] });
  ok(!canAct(g2, 0, Q), 'not without a Tuner');
});
T('Rai-Jin: LIGHT monsters +100 per LIGHT in the GY, destroys a LIGHT in your End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Rai-Jin'], gy: [ELF, ELF], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Rai-Jin')) === 200, `Rai-Jin 200 (${E.atk(g, on(g, 0, 'Rai-Jin'))})`);
  endTurn(g, 'Rai-Jin'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Rai-Jin'), 'Rai-Jin destroyed in the End Phase');
});
T('Rain Storm: -1000 ATK to destroy a Spell/Trap', () => {
  const g = duel({ board: [{ hand: [], m: ['Cloudian - Altus'], st: ['Rain Storm'], turn: 2 }, { st: ['Mirror Force'], m: [W] }] });
  act(g, 0, 'Rain Storm'); settle(g, 'Cloudian - Altus', '1000', 'Face-down card'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && on(g, 1, W) && E.atk(g, on(g, 0, 'Cloudian - Altus')) === 300, 'Mirror Force destroyed, Altus 300');
});
T('Rallis the Star Bird: +200 x Level in the Damage Step, leaves and returns next Battle Phase', () => {
  const R = 'Rallis the Star Bird';
  const g = duel({ board: [{ hand: [], m: [R], turn: 2 }, { m: [ELF] }] });
  bp(g); atkOn(g, 0, R, ELF); toIdle(g);
  ok(inZ(g, 1, 'gy', ELF) && inZ(g, 0, 'ban', R), 'Mystical Elf destroyed (Rallis 800 + 7 x 200 = 2200 ATK), Rallis banished');
  turns(g, 2); bp(g);
  ok(on(g, 0, R) && on(g, 0, R).pos === 'atk', 'Rallis back at the Battle Phase');
});

console.log(fails ? `\n${fails} failed` : '\nAll full-42 review checks passed.');
process.exit(fails ? 1 : 0);
