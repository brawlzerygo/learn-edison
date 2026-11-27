// Independent review checks for full pool batch 27 (written from the card text): node build/review_full-27.js
const { E: E0, C } = require('./load')();
let E = E0;
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf'; // EARTH Beast-Warrior Level 4 2000/100
let lastG; function duel(o = {}) {
  const mk = (ex, n) => ({ name: 't', main: Array(n || 40).fill(id(FILL)), extra: (ex || []).map(id) });
  const b = o.board; if (b && b[1] && b[1].turn && !b[0].turn) b[0].turn = b[1].turn;
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
const up = n => ({ n, pos: 'up' });
const setM = n => ({ n, pos: 'set' });
const defM = n => ({ n, pos: 'def' });
const idle = g => g.prompt && g.prompt.type === 'idle';
const toIdle = (g, ...picks) => { for (let i = 0; i < 10 && g.prompt && !idle(g) && g.prompt.type !== 'battle'; i++) settle(g, ...picks); };
const optsFor = (g, c) => g.prompt ? g.prompt.opts.filter(x => x.u === c.u || x.key.split(':')[1] === String(c.u)) : [];
const hand = (g, p) => g.p[p].hand.length;
const flipSum = (g, p, n, ...picks) => { choose(g, 'flip:' + on(g, p, n).u); settle(g, ...picks); };
const tosses = (g, n0) => g.log.slice(n0).filter(l => /tossed a coin/.test(l)).length;
const HEADS = g => { g.rnd = () => 0.1; }, TAILS = g => { g.rnd = () => 0.9; };
const BEWD = 'Blue-Eyes White Dragon', CG = 'Celtic Guardian', EL = 'Mystical Elf', DM = 'Dark Magician', GTW = 'Giga-Tech Wolf', FISH = '7 Colored Fish';

/* ---------------- Sa ---------------- */
T("Sage's Stone: with Dark Magician Girl, Special Summon Dark Magician from the Deck", () => {
  const g = duel({ board: [{ hand: ["Sage's Stone"], m: ['Dark Magician Girl'], deckTop: [FILL, DM], turn: 2 }, {}] });
  act(g, 0, "Sage's Stone"); settle(g, DM, 'Attack');
  ok(on(g, 0, DM), 'Dark Magician on the field');
  const g2 = duel({ board: [{ hand: ["Sage's Stone", DM], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, "Sage's Stone"), 'not offered without Dark Magician Girl');
});
T('Sakuretsu Armor: destroys the attacking monster', () => {
  const g = duel({ first: 1, board: [{ st: ['Sakuretsu Armor'] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g); atkOn(g, 1, BEWD, null, 'Sakuretsu Armor'); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && lp(g, 0) === 8000, `Blue-Eyes destroyed, A at ${lp(g, 0)}`);
});
T('Salamandra: FIRE only, +700 ATK', () => {
  const g = duel({ board: [{ hand: ['Salamandra'], m: [GTW, FILL], turn: 2 }, {}] });
  act(g, 0, 'Salamandra'); settle(g, GTW);
  ok(E.atk(g, on(g, 0, GTW)) === 1900, `Giga-Tech Wolf ${E.atk(g, on(g, 0, GTW))}`);
  const g2 = duel({ board: [{ hand: ['Salamandra'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Salamandra'), 'not offered without a FIRE monster');
});
T('Sand Gambler: 3 Heads destroy the opponent monsters, 3 Tails destroy yours, once per turn', () => {
  let g = duel({ board: [{ hand: [], m: ['Sand Gambler', FILL], turn: 2 }, { m: [BEWD, CG] }] });
  HEADS(g); const n0 = g.log.length; act(g, 0, 'Sand Gambler'); settle(g);
  ok(tosses(g, n0) === 3 && cnt(g, 1, 'm') === 0 && on(g, 0, FILL), `3 Heads: B field cleared (${tosses(g, n0)} tosses, B ${cnt(g, 1, 'm')})`);
  ok(!canAct(g, 0, 'Sand Gambler'), 'once per turn');
  g = duel({ board: [{ hand: [], m: ['Sand Gambler', FILL], turn: 2 }, { m: [BEWD] }] });
  TAILS(g); act(g, 0, 'Sand Gambler'); settle(g);
  ok(cnt(g, 0, 'm') === 0 && on(g, 1, BEWD), 'all Tails: own monsters destroyed');
  g = duel({ board: [{ hand: [], m: ['Sand Gambler', FILL], turn: 2 }, { m: [BEWD] }] });
  let i = 0; g.rnd = () => (i++ % 2 ? 0.9 : 0.1); act(g, 0, 'Sand Gambler'); settle(g);
  ok(cnt(g, 0, 'm') === 2 && on(g, 1, BEWD), 'mixed: nothing destroyed');
});
T('Sanga of the Thunder: attacker ATK 0 in damage calculation', () => {
  const g = duel({ first: 1, board: [{ m: ['Sanga of the Thunder'] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g); atkOn(g, 1, BEWD, 'Sanga of the Thunder', 'Sanga of the Thunder'); toIdle(g, 'Sanga of the Thunder');
  ok(inZ(g, 1, 'gy', BEWD) && on(g, 0, 'Sanga of the Thunder') && lp(g, 1) === 5400, `Blue-Eyes destroyed, B took 2600 (${lp(g, 1)})`);
});
T('Sanwitch: Sangan + Witch of the Black Forest', () => {
  const g = duel({ ex0: ['Sanwitch'], board: [{ hand: ['Polymerization', 'Sangan', 'Witch of the Black Forest'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Sanwitch', 'Sangan', 'Witch of the Black Forest', 'Attack');
  ok(on(g, 0, 'Sanwitch') && E.atk(g, on(g, 0, 'Sanwitch')) === 2100, 'Sanwitch summoned');
});
T('Scroll of Bewitchment: the equipped monster takes the chosen Attribute', () => {
  const g = duel({ board: [{ hand: ['Scroll of Bewitchment'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Scroll of Bewitchment'); settle(g, FILL, 'DARK');
  // ENGINE gap documented in the script: no Attribute override, so only the equip and the choice are checked
  ok(inZ(g, 0, 'st', 'Scroll of Bewitchment') && card(g, 0, 'Scroll of Bewitchment').equipTo === on(g, 0, FILL).u && card(g, 0, 'Scroll of Bewitchment').flags.f27attr === 'DARK', 'equipped, DARK chosen (Attribute change itself is an ENGINE gap)');
});
T('Seal of the Ancients: pay 1000, the Set cards stay', () => {
  const g = duel({ board: [{ hand: ['Seal of the Ancients'], turn: 2 }, { m: [setM(FILL)], st: ['Mirror Force'] }] });
  act(g, 0, 'Seal of the Ancients'); settle(g);
  ok(lp(g, 0) === 7000 && on(g, 1, FILL).pos === 'set' && inZ(g, 1, 'st', 'Mirror Force'), `A ${lp(g, 0)}, Set cards untouched`);
});
T("Sebek's Blessing: gain the direct attack damage", () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ["Sebek's Blessing"], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, FILL, null, "Sebek's Blessing"); toIdle(g, "Sebek's Blessing");
  if (canAct(g, 0, "Sebek's Blessing")) { act(g, 0, "Sebek's Blessing"); settle(g); }
  ok(lp(g, 1) === 6000 && lp(g, 0) === 10000, `B ${lp(g, 1)}, A ${lp(g, 0)}`);
});
T('Second Coin Toss: offers a redo of your coin toss', () => {
  const g = duel({ board: [{ hand: [], m: ['Sand Gambler'], st: [up('Second Coin Toss')], turn: 2 }, { m: [BEWD] }] });
  TAILS(g); const n0 = g.log.length; act(g, 0, 'Sand Gambler');
  let asked = false;
  for (let i = 0; i < 40 && g.prompt && !idle(g); i++) { if (g.prompt.type === 'yesno' && /coin|toss/i.test(g.prompt.text)) { asked = true; HEADS(g); choose(g, 'yes'); } else settle(g); }
  ok(asked && tosses(g, n0) === 6 && cnt(g, 1, 'm') === 0 && cnt(g, 0, 'm') === 1, `redo offered (${asked}), ${tosses(g, n0)} tosses, the redone Heads applied`);
});
T('Second Goblin: equips to Giant Orc, unequips next turn in Attack Position', () => {
  const g = duel({ board: [{ hand: [], m: ['Second Goblin', 'Giant Orc'], turn: 2 }, {}] });
  const sg = on(g, 0, 'Second Goblin'); const o = optsFor(g, sg);
  ok(o.length > 0, 'effect offered: ' + o.map(x => x.label).join(', '));
  choose(g, (o.find(x => /equip/i.test(x.label)) || o[0]).key); settle(g, 'Giant Orc');
  ok(inZ(g, 0, 'st', 'Second Goblin') && sg.equipTo === on(g, 0, 'Giant Orc').u, 'Second Goblin equipped to Giant Orc');
  ok(!optsFor(g, sg).some(x => /unequip/i.test(x.label)), 'no unequip the same turn');
  const pc = optsFor(g, sg).find(x => /position/i.test(x.label)); ok(!!pc, 'position change of the equipped monster offered');
  if (pc) { choose(g, pc.key); settle(g); ok(on(g, 0, 'Giant Orc').pos === 'def', 'Giant Orc changed to Defense'); }
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  const o2 = optsFor(g, sg).filter(x => /unequip/i.test(x.label)); ok(o2.length > 0, 'unequip offered next turn: ' + o2.map(x => x.label).join(', '));
  if (o2.length) { choose(g, (o2.find(x => /unequip|summon/i.test(x.label)) || o2[0]).key); settle(g); }
  const s = on(g, 0, 'Second Goblin'); ok(s && s.pos === 'atk', 'Second Goblin back in Attack Position');
});
T('Self-Destruct Button: both LP become 0 at a 7000 gap', () => {
  const g = duel({ board: [{ hand: [], st: ['Self-Destruct Button'], lp: 500, turn: 2 }, {}] });
  ok(canAct(g, 0, 'Self-Destruct Button'), 'offered at 500 vs 8000');
  act(g, 0, 'Self-Destruct Button'); settle(g);
  ok(lp(g, 0) === 0 && lp(g, 1) === 0 && !g.prompt, `both LP 0 and the duel is over (${g.why})`);
  const g2 = duel({ board: [{ hand: [], st: ['Self-Destruct Button'], lp: 1500, turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Self-Destruct Button'), 'not offered at a 6500 gap');
});
T('Senju of the Thousand Hands: Normal Summon adds a Ritual Monster', () => {
  const g = duel({ board: [{ hand: ['Senju of the Thousand Hands'], deckTop: [FILL, 'Shinato, King of a Higher Plane'], turn: 2 }, {}] });
  ns(g, 0, 'Senju of the Thousand Hands', 'Shinato');
  ok(inZ(g, 0, 'hand', 'Shinato, King of a Higher Plane'), 'Shinato added');
});
T('Senri Eye: pay 100 in your Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: [up('Senri Eye')], turn: 2 }, {}] });
  toIdle(g); ok(lp(g, 0) === 7900, `A paid 100 in this Standby (${lp(g, 0)})`);
  endTurn(g); toIdle(g); ok(lp(g, 0) === 7900, 'nothing in B Standby');
  endTurn(g); toIdle(g); ok(g.tp === 0 && lp(g, 0) === 7800, `A paid 100 again (${lp(g, 0)})`);
});
T('Serial Spell: discard the hand, copy Pot of Greed', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Serial Spell', CG], turn: 2 }, {}] });
  act(g, 0, 'Pot of Greed'); settle(g, 'Serial Spell');
  ok(inZ(g, 0, 'gy', CG) && inZ(g, 0, 'gy', 'Serial Spell') && hand(g, 0) === 4, `Celtic discarded, drew 4 (hand ${hand(g, 0)})`);
});
T('Serpentine Princess: returned to the Deck, Special Summon a Level 3 or lower from the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Serpentine Princess', setM('Fiber Jar')], deckTop: [FILL, 'Sangan'], turn: 2 }, {}] });
  flipSum(g, 0, 'Fiber Jar', 'Sangan', 'Attack'); toIdle(g, 'Sangan', 'Attack');
  const sg = g.p[0].m.find(c => c && c.pos !== 'set' && E.lib.lv(c) <= 3);
  ok(sg && g.log.some(l => /Serpentine Princess's effect/.test(l)), 'Serpentine returned to the Deck, a Level 3 or lower Special Summoned face-up: ' + (sg && E.name(sg)));
});
T('Servant of Catabolism: attacks directly', () => {
  const g = duel({ board: [{ hand: [], m: ['Servant of Catabolism'], turn: 2 }, { m: [BEWD] }] });
  bp(g); atkOn(g, 0, 'Servant of Catabolism', null); toIdle(g);
  ok(lp(g, 1) === 7300, `B ${lp(g, 1)}`);
});
T('Shadowknight Archfiend: pays 900 each Standby, halves its battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Shadowknight Archfiend'], turn: 2 }, {}] });
  toIdle(g); ok(lp(g, 0) === 7100, `paid 900 in this Standby (${lp(g, 0)})`);
  bp(g); atkOn(g, 0, 'Shadowknight Archfiend', null); toIdle(g);
  ok(lp(g, 1) === 7000, `B took 1000 (${lp(g, 1)})`);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(lp(g, 0) === 6200 && on(g, 0, 'Shadowknight Archfiend'), `A paid 900 again (${lp(g, 0)})`);
});
T('Shadowslayer: direct attack only when every opponent monster is in Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Shadowslayer'], turn: 2 }, { m: [defM(CG), setM(FILL)] }] });
  bp(g); ok(canAtk(g, on(g, 0, 'Shadowslayer'), null), 'direct attack offered');
  const g2 = duel({ board: [{ hand: [], m: ['Shadowslayer'], turn: 2 }, { m: [defM(CG), FILL] }] });
  bp(g2); ok(!canAtk(g2, on(g2, 0, 'Shadowslayer'), null), 'no direct attack with an Attack Position monster');
});
T('Share the Pain: you Tribute 1, the opponent Tributes 1', () => {
  const g = duel({ board: [{ hand: ['Share the Pain'], m: [CG], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Share the Pain'); settle(g, CG, BEWD);
  ok(inZ(g, 0, 'gy', CG) && inZ(g, 1, 'gy', BEWD), 'both monsters Tributed');
});
T('Shift: redirects the attack to another of your monsters', () => {
  const g = duel({ first: 1, board: [{ m: [FILL, CG], st: ['Shift'] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g); atkOn(g, 1, BEWD, FILL, 'Shift', CG); toIdle(g);
  ok(on(g, 0, FILL) && inZ(g, 0, 'gy', CG) && lp(g, 0) === 6400, `Celtic took the attack (A ${lp(g, 0)})`);
});
T('Shifting Shadows: pay 300 with 2+ face-down monsters, once per turn', () => {
  const g = duel({ board: [{ hand: [], m: [setM(FILL), setM(CG)], st: [up('Shifting Shadows')], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Shifting Shadows'), 'offered'); act(g, 0, 'Shifting Shadows'); settle(g);
  ok(lp(g, 0) === 7700 && cnt(g, 0, 'm') === 2 && g.p[0].m.filter(Boolean).every(c => c.pos === 'set'), `paid 300 (${lp(g, 0)}), both still Set`);
  ok(!canAct(g, 0, 'Shifting Shadows'), 'once per turn');
  const g2 = duel({ board: [{ hand: [], m: [setM(FILL)], st: [up('Shifting Shadows')], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Shifting Shadows'), 'not with 1 face-down monster');
});
T("Shinato's Ark ritual; Shinato burns the original ATK of a Defense monster it destroys", () => {
  const g = duel({ board: [{ hand: ["Shinato's Ark", 'Shinato, King of a Higher Plane', BEWD], turn: 2 }, { m: [defM(FILL)] }] });
  act(g, 0, "Shinato's Ark"); settle(g, 'Shinato', BEWD, 'Attack');
  ok(on(g, 0, 'Shinato, King of a Higher Plane') && inZ(g, 0, 'gy', BEWD), 'Shinato Ritual Summoned with Blue-Eyes');
  const g2 = duel({ board: [{ hand: [], m: ['Shinato, King of a Higher Plane'], turn: 2 }, { m: [defM(FILL)] }] });
  bp(g2); atkOn(g2, 0, 'Shinato, King of a Higher Plane', FILL); toIdle(g2);
  ok(inZ(g2, 1, 'gy', FILL) && lp(g2, 1) === 6000, `B took 2000 (${lp(g2, 1)})`);
});
T('Silpheed: Special Summon by banishing a WIND; destroyed by battle, opponent discards 1 random', () => {
  const g = duel({ board: [{ hand: ['Silpheed'], gy: ['Harpie Lady'], turn: 2 }, {}] });
  const s = card(g, 0, 'Silpheed');
  ok(!hasOpt(g, 'ns:' + s.u) && !hasOpt(g, 'set:' + s.u) && hasOpt(g, 'sp:' + s.u), 'Special Summon only');
  choose(g, 'sp:' + s.u); settle(g, 'Harpie Lady', 'Attack');
  ok(on(g, 0, 'Silpheed') && inZ(g, 0, 'ban', 'Harpie Lady'), 'summoned, Harpie banished');
  const g2 = duel({ first: 1, board: [{ m: ['Silpheed'] }, { m: [BEWD], turn: 2 }] });
  const h = hand(g2, 1); bp(g2); atkOn(g2, 1, BEWD, 'Silpheed'); toIdle(g2);
  ok(inZ(g2, 0, 'gy', 'Silpheed') && hand(g2, 1) === h - 1, `B discarded 1 (${h} to ${hand(g2, 1)})`);
});
T('Silver Bow and Arrow: Fairy +300/+300', () => {
  const g = duel({ board: [{ hand: ['Silver Bow and Arrow'], m: ['Shining Angel'], turn: 2 }, {}] });
  act(g, 0, 'Silver Bow and Arrow'); settle(g, 'Shining Angel');
  const s = on(g, 0, 'Shining Angel'); ok(E.atk(g, s) === 1700 && E.def(g, s) === 1100, `${E.atk(g, s)}/${E.def(g, s)}`);
  const g2 = duel({ board: [{ hand: ['Silver Bow and Arrow'], m: [FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Silver Bow and Arrow'), 'not offered without a Fairy');
});
for (const [sk, tg] of [['Skilled Dark Magician', DM], ['Skilled White Magician', 'Buster Blader']])
  T(`${sk}: 3 Spell Counters, Tribute it for ${tg}`, () => {
    const g = duel({ board: [{ hand: ['Sparks', 'Sparks', 'Sparks'], m: [sk], deckTop: [FILL, tg], turn: 2 }, {}] });
    for (let i = 0; i < 3; i++) { ok(!canAct(g, 0, sk) || i === 3, `no Tribute with ${i} counters`); act(g, 0, 'Sparks'); settle(g); }
    ok(E.lib.ctr(on(g, 0, sk), 'spell') === 3, 'three counters');
    act(g, 0, sk); settle(g, tg, 'Attack');
    ok(on(g, 0, tg) && inZ(g, 0, 'gy', sk), `${tg} Special Summoned`);
  });
T('Slate Warrior: FLIP +500/+500; its killer loses 500', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Slate Warrior')], turn: 2 }, {}] });
  flipSum(g, 0, 'Slate Warrior'); const s = on(g, 0, 'Slate Warrior');
  ok(E.atk(g, s) === 2400 && E.def(g, s) === 900, `${E.atk(g, s)}/${E.def(g, s)}`);
  const g2 = duel({ first: 1, board: [{ m: ['Slate Warrior'] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g2); atkOn(g2, 1, BEWD, 'Slate Warrior'); toIdle(g2);
  const b = on(g2, 1, BEWD); ok(inZ(g2, 0, 'gy', 'Slate Warrior') && b && E.atk(g2, b) === 2500 && E.def(g2, b) === 2000, `Blue-Eyes ${b && E.atk(g2, b)}/${b && E.def(g2, b)}`);
});
T('Smoke Grenade of the Thief: destroyed by an effect, discard 1 from the opponent hand', () => {
  const g = duel({ board: [{ hand: ['Smoke Grenade of the Thief', 'Mystical Space Typhoon'], m: [FILL], turn: 2 }, { hand: ['Pot of Greed'] }] });
  act(g, 0, 'Smoke Grenade of the Thief'); settle(g, FILL);
  ok(inZ(g, 0, 'st', 'Smoke Grenade of the Thief'), 'equipped');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Smoke Grenade', 'Pot of Greed'); toIdle(g, 'Pot of Greed');
  ok(inZ(g, 1, 'gy', 'Pot of Greed') && hand(g, 1) === 0, 'Pot of Greed discarded');
});
T('Snatch Steal: take control; the opponent gains 1000 each of their Standby Phases', () => {
  const g = duel({ board: [{ hand: ['Snatch Steal'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Snatch Steal'); settle(g, BEWD);
  ok(on(g, 0, BEWD), 'A controls Blue-Eyes');
  endTurn(g); toIdle(g);
  ok(g.tp === 1 && lp(g, 1) === 9000 && on(g, 0, BEWD), `B gained 1000 (${lp(g, 1)}), A keeps Blue-Eyes`);
});
T('Sogen: Warrior and Beast-Warrior +200/+200', () => {
  const g = duel({ board: [{ hand: ['Sogen'], m: [CG, EL], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Sogen'); settle(g);
  ok(E.atk(g, on(g, 0, CG)) === 1600 && E.def(g, on(g, 0, CG)) === 1400 && E.atk(g, on(g, 1, FILL)) === 2200 && E.atk(g, on(g, 0, EL)) === 800, 'Celtic 1600/1400, Warwolf 2200, Elf 800');
});
T('Solar Flare Dragon: cannot be attacked with another Pyro, 500 each End Phase', () => {
  const g = duel({ first: 1, board: [{ m: ['Solar Flare Dragon', 'Fire Princess'] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g); ok(!canAtk(g, on(g, 1, BEWD), on(g, 0, 'Solar Flare Dragon')) && canAtk(g, on(g, 1, BEWD), on(g, 0, 'Fire Princess')), 'Solar Flare not attackable, Fire Princess is');
  const g2 = duel({ board: [{ hand: [], m: ['Solar Flare Dragon'], turn: 2 }, {}] });
  endTurn(g2); toIdle(g2);
  ok(lp(g2, 1) === 7500, `B took 500 in A End Phase (${lp(g2, 1)})`);
  endTurn(g2); toIdle(g2); ok(lp(g2, 1) === 7500, 'not in B End Phase');
});
T('Solar Ray: 600 per face-up LIGHT you control', () => {
  const g = duel({ board: [{ hand: [], m: [EL, 'Shining Angel', FILL], st: ['Solar Ray'], turn: 2 }, {}] });
  act(g, 0, 'Solar Ray'); settle(g);
  ok(lp(g, 1) === 6800, `B ${lp(g, 1)}`);
});
T('Solemn Wishes: gain 500 when you draw', () => {
  const g = duel({ board: [{ hand: [], st: [up('Solemn Wishes')], turn: 2 }, {}] });
  toIdle(g); ok(lp(g, 0) === 8500, `A gained 500 on this turn draw (${lp(g, 0)})`);
  endTurn(g); toIdle(g); ok(lp(g, 0) === 8500, 'nothing when B draws');
  endTurn(g); toIdle(g); ok(lp(g, 0) === 9000, `A gained 500 on the next draw (${lp(g, 0)})`);
});
T('Solemn Wishes: one 500 gain for 2 cards drawn together', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: [up('Solemn Wishes')], turn: 2 }, {}] });
  toIdle(g); const l0 = lp(g, 0); act(g, 0, 'Pot of Greed'); settle(g);
  ok(lp(g, 0) === l0 + 500, `gained 500 once (${l0} to ${lp(g, 0)})`);
});
T("Solomon's Lawbook: skip your next Standby Phase", () => {
  const g = duel({ board: [{ hand: [], m: ['Shadowknight Archfiend'], st: ["Solomon's Lawbook"], turn: 2 }, {}] });
  toIdle(g); act(g, 0, "Solomon's Lawbook"); settle(g);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 0 && lp(g, 0) === 7100, `no Standby payment (${lp(g, 0)})`);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(lp(g, 0) === 6200, `paid again the Standby after (${lp(g, 0)})`);
});
T('Sorcerer of Dark Magic: Special Summon by Tributing 2 Level 6+ Spellcasters, negates Traps', () => {
  const g = duel({ board: [{ hand: ['Sorcerer of Dark Magic'], m: [DM, DM], turn: 2 }, {}] });
  const s = card(g, 0, 'Sorcerer of Dark Magic');
  ok(!hasOpt(g, 'ns:' + s.u) && !hasOpt(g, 'set:' + s.u) && hasOpt(g, 'sp:' + s.u), 'Special Summon only');
  choose(g, 'sp:' + s.u); settle(g, DM, DM, 'Attack');
  ok(on(g, 0, 'Sorcerer of Dark Magic') && cnt(g, 0, 'gy', DM) === 2, 'summoned, 2 Dark Magicians Tributed');
  const g2 = duel({ board: [{ hand: ['Sorcerer of Dark Magic'], m: [DM, CG], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Sorcerer of Dark Magic').u), 'not with a Level 4 non-Spellcaster');
  const g3 = duel({ board: [{ hand: [], m: ['Sorcerer of Dark Magic'], turn: 2 }, { st: ['Mirror Force'] }] });
  bp(g3); atkOn(g3, 0, 'Sorcerer of Dark Magic', null, 'Mirror Force', 'Sorcerer of Dark Magic'); toIdle(g3);
  ok(on(g3, 0, 'Sorcerer of Dark Magic') && inZ(g3, 1, 'gy', 'Mirror Force') && lp(g3, 1) === 4800, `Mirror Force negated, B ${lp(g3, 1)}`);
});
T('Sparks: 200 damage', () => {
  const g = duel({ board: [{ hand: ['Sparks'], turn: 2 }, {}] });
  act(g, 0, 'Sparks'); settle(g); ok(lp(g, 1) === 7800, `B ${lp(g, 1)}`);
});
T('Spatial Collapse: each player is capped at 5 cards on the field', () => {
  const g = duel({ board: [{ hand: [CG], m: [FILL, FILL, FILL, FILL], st: ['Spatial Collapse'], turn: 2 }, {}] });
  ok(canAct(g, 0, 'Spatial Collapse'), 'offered at 5 cards'); act(g, 0, 'Spatial Collapse'); settle(g);
  const c = card(g, 0, CG); ok(inZ(g, 0, 'st', 'Spatial Collapse') && !hasOpt(g, 'ns:' + c.u) && !hasOpt(g, 'set:' + c.u) && !hasOpt(g, 'setst'), 'no sixth card can be played');
  const g2 = duel({ board: [{ hand: [], m: [FILL, FILL, FILL, FILL], st: ['Spatial Collapse', 'Sparks', 'Sparks'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Spatial Collapse'), 'not with 7 cards on the field');
});
T('Spear Cretin: flipped and sent to the GY, each player revives 1', () => {
  const g = duel({ first: 1, board: [{ m: [setM('Spear Cretin')], gy: [CG] }, { hand: [], m: [FILL], gy: [BEWD], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Spear Cretin', CG, BEWD, 'Attack'); toIdle(g, CG, BEWD, 'Attack');
  ok(inZ(g, 0, 'gy', 'Spear Cretin') && on(g, 0, CG) && on(g, 1, BEWD), 'A revived Celtic, B revived Blue-Eyes');
});
T('Spear Dragon: piercing, then to Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Spear Dragon'], turn: 2 }, { m: [defM(FILL)] }] });
  bp(g); atkOn(g, 0, 'Spear Dragon', FILL); toIdle(g);
  ok(lp(g, 1) === 6200 && on(g, 0, 'Spear Dragon').pos === 'def', `B ${lp(g, 1)}, Spear Dragon ${on(g, 0, 'Spear Dragon').pos}`);
});
T('Special Hurricane: discard 1, destroy every Special Summoned monster', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn', 'Special Hurricane', CG, EL], turn: 2 }, { gy: [BEWD] }] });
  act(g, 0, 'Monster Reborn'); settle(g, BEWD, 'Attack');
  ns(g, 0, EL);
  act(g, 0, 'Special Hurricane'); settle(g, CG);
  ok(inZ(g, 0, 'gy', CG) && inZ(g, 1, 'gy', BEWD) && on(g, 0, EL), 'Blue-Eyes destroyed, Elf (Normal Summoned) stays, Celtic discarded');
});
T('Spellbinding Circle: the target cannot attack', () => {
  const g = duel({ board: [{ hand: [], st: ['Spellbinding Circle'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Spellbinding Circle'); settle(g, BEWD); endTurn(g); toIdle(g);
  const b = on(g, 1, BEWD); ok(!hasOpt(g, 'pos:' + b.u), 'no position change'); bp(g);
  ok(!canAtk(g, b, null), 'Blue-Eyes cannot attack');
});
T('Spellbook Organization: the top 3 stay on top', () => {
  const g = duel({ board: [{ hand: ['Spellbook Organization'], deckTop: [FILL, CG, EL, BEWD], turn: 2 }, {}] });
  const d = g.p[0].deck.length; act(g, 0, 'Spellbook Organization'); settle(g);
  const top = g.p[0].deck.slice(-3).map(E.name).sort();
  ok(g.p[0].deck.length === d && top.join() === [CG, EL, BEWD].sort().join(), 'same 3 cards on top: ' + top);
});
T('Sphinx Teleia: pay 500 with Pyramid of Light, no attack that turn; half DEF burn', () => {
  const g = duel({ board: [{ hand: ['Sphinx Teleia'], st: [up('Pyramid of Light')], turn: 2 }, {}] });
  const s = card(g, 0, 'Sphinx Teleia'); const o = optsFor(g, s).filter(x => !/^(ns|set)/.test(x.key));
  ok(o.length > 0, 'Special Summon offered'); if (o.length) { choose(g, o[0].key); settle(g, 'Attack'); }
  ok(on(g, 0, 'Sphinx Teleia') && lp(g, 0) === 7500, `summoned, paid 500 (${lp(g, 0)})`);
  if (on(g, 0, 'Sphinx Teleia')) { bp(g); ok(!canAtk(g, on(g, 0, 'Sphinx Teleia'), null), 'cannot attack that turn'); }
  const g2 = duel({ board: [{ hand: [], m: ['Sphinx Teleia'], turn: 2 }, { m: [defM(EL)] }] });
  bp(g2); atkOn(g2, 0, 'Sphinx Teleia', EL); toIdle(g2);
  ok(inZ(g2, 1, 'gy', EL) && lp(g2, 1) === 7000, `B took 1000 (${lp(g2, 1)})`);
});
T('Spiral Spear Strike: Gaia pierces; the Dragon Champion draws 2 and discards 1', () => {
  const g = duel({ board: [{ hand: [], m: ['Gaia The Fierce Knight'], st: [up('Spiral Spear Strike')], turn: 2 }, { m: [defM(FILL)] }] });
  bp(g); atkOn(g, 0, 'Gaia The Fierce Knight', FILL); toIdle(g);
  ok(lp(g, 1) === 5800, `B took 2200 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Gaia the Dragon Champion'], st: [up('Spiral Spear Strike')], turn: 2 }, { m: [defM(FILL)] }] });
  const h = hand(g2, 0); bp(g2); atkOn(g2, 0, 'Gaia the Dragon Champion', FILL); toIdle(g2);
  ok(lp(g2, 1) === 5500 && hand(g2, 0) === h + 1 && cnt(g2, 0, 'gy') === 1, `B took 2500, drew 2 discarded 1 (hand ${h} to ${hand(g2, 0)})`);
});
T("Spirit's Invitation: a Spirit returning bounces an opponent monster; 500 each Standby", () => {
  const g = duel({ board: [{ hand: ['Asura Priest'], st: [up("Spirit's Invitation")], turn: 2 }, { m: [BEWD] }] });
  toIdle(g); ok(lp(g, 0) === 7500, 'paid 500 this Standby'); ns(g, 0, 'Asura Priest'); endTurn(g, BEWD); toIdle(g, BEWD);
  ok(inZ(g, 0, 'hand', 'Asura Priest') && inZ(g, 1, 'hand', BEWD), 'Asura back to hand, Blue-Eyes bounced');
  if (g.tp === 1) { endTurn(g); toIdle(g); }
  ok(g.tp === 0 && lp(g, 0) === 7000 && inZ(g, 0, 'st', "Spirit's Invitation"), `paid 500 again (${lp(g, 0)})`);
});
T('Spiritualism: returns an opponent Spell/Trap to the hand', () => {
  const g = duel({ board: [{ hand: ['Spiritualism'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Spiritualism'); settle(g, 'Mirror Force');
  ok(inZ(g, 1, 'hand', 'Mirror Force') && !inZ(g, 1, 'st', 'Mirror Force'), 'Mirror Force back in hand');
});
T('Spring of Rebirth: 500 each time monsters return to the hand', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Penguin Soldier')], st: [up('Spring of Rebirth')], turn: 2 }, { m: [BEWD, CG] }] });
  flipSum(g, 0, 'Penguin Soldier', BEWD, CG); toIdle(g);
  ok(cnt(g, 1, 'm') === 0 && lp(g, 0) === 8500, `two returned at once, gained 500 (${lp(g, 0)})`);
});
T('St. Joan: The Forgiving Maiden + Darklord Marie', () => {
  const g = duel({ ex0: ['St. Joan'], board: [{ hand: ['Polymerization', 'The Forgiving Maiden', 'Darklord Marie'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'St. Joan', 'The Forgiving Maiden', 'Darklord Marie', 'Attack');
  ok(on(g, 0, 'St. Joan') && E.atk(g, on(g, 0, 'St. Joan')) === 2800, 'St. Joan summoned');
});
T('Stamping Destruction: with a Dragon, destroy a Spell/Trap and burn 500', () => {
  const g = duel({ board: [{ hand: ['Stamping Destruction'], m: [BEWD], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Stamping Destruction'); settle(g, 'Mirror Force');
  ok(inZ(g, 1, 'gy', 'Mirror Force') && lp(g, 1) === 7500, `destroyed, B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Stamping Destruction'], m: [FILL], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(!canAct(g2, 0, 'Stamping Destruction'), 'not offered without a Dragon');
});
T('Star Boy: WATER +500, FIRE -400', () => {
  const g = duel({ board: [{ hand: [], m: ['Star Boy', GTW], turn: 2 }, { m: [FISH, FILL] }] });
  ok(E.atk(g, on(g, 1, FISH)) === 2300 && E.atk(g, on(g, 0, GTW)) === 800 && E.atk(g, on(g, 0, 'Star Boy')) === 1050 && E.atk(g, on(g, 1, FILL)) === 2000, 'Fish 2300, Wolf 800, Star Boy 1050');
});
T('Statue of the Wicked: destroyed while Set, summon a Wicked Token', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Statue of the Wicked'], turn: 2 }, {}] });
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Statue of the Wicked'); toIdle(g);
  const t = g.p[0].m.find(c => c && /Wicked Token/.test(E.name(c)));
  ok(t && E.atk(g, t) === 1000 && E.def(g, t) === 1000, 'Wicked Token 1000/1000');
});
T('Staunch Defender: the opponent must attack the chosen monster', () => {
  const g = duel({ first: 1, board: [{ m: [CG, EL], st: ['Staunch Defender'] }, { hand: [], m: [BEWD, FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, BEWD, EL, 'Staunch Defender', CG); toIdle(g, CG);
  if (hasOpt(g, 'atk:' + on(g, 1, BEWD).u)) { ok(!canAtk(g, on(g, 1, BEWD), on(g, 0, EL)), 'replay: Elf not a legal target'); choose(g, `atk:${on(g, 1, BEWD).u}:${on(g, 0, CG).u}`); settle(g); }
  ok(inZ(g, 0, 'gy', CG) && on(g, 0, EL), 'Blue-Eyes attacked Celtic, Elf safe');
  const w = on(g, 1, FILL); if (w && idle(g)) ok(!canAtk(g, w, on(g, 0, EL)) && !canAtk(g, w, null), 'Warwolf can only attack the chosen (now gone) monster');
});
T('Stealth Bird: Flip Summon burns 1000; turns itself face-down once per turn', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Stealth Bird')], turn: 2 }, {}] });
  flipSum(g, 0, 'Stealth Bird'); toIdle(g); ok(lp(g, 1) === 7000, `B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: [], m: ['Stealth Bird'], turn: 2 }, {}] });
  ok(canAct(g2, 0, 'Stealth Bird'), 'offered'); act(g2, 0, 'Stealth Bird'); settle(g2);
  ok(on(g2, 0, 'Stealth Bird').pos === 'set' && !canAct(g2, 0, 'Stealth Bird'), 'face-down, once');
});
T("Steel Scorpion: a non-Machine attacker dies at the End Phase of its controller's 2nd turn after", () => {
  const g = duel({ first: 1, board: [{ m: [defM('Steel Scorpion')] }, { hand: [], m: ['Kuriboh'], turn: 2 }] });
  bp(g); atkOn(g, 1, 'Kuriboh', 'Steel Scorpion'); toIdle(g);
  ok(on(g, 0, 'Steel Scorpion') && on(g, 1, 'Kuriboh'), 'both survive the battle');
  endTurn(g); toIdle(g); ok(on(g, 1, 'Kuriboh'), 'alive after the attack turn');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  const after1 = !!on(g, 1, 'Kuriboh');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(!on(g, 1, 'Kuriboh') && inZ(g, 1, 'gy', 'Kuriboh'), `Kuriboh destroyed by the End Phase of B's 2nd turn after (alive after the 1st: ${after1})`);
});
T('Steel Shell: WATER +400 ATK, -200 DEF', () => {
  const g = duel({ board: [{ hand: ['Steel Shell'], m: [FISH], turn: 2 }, {}] });
  act(g, 0, 'Steel Shell'); settle(g, FISH);
  const f = on(g, 0, FISH); ok(E.atk(g, f) === 2200 && E.def(g, f) === 600, `${E.atk(g, f)}/${E.def(g, f)}`);
});
T('Stim-Pack: +700, -200 each of your Standby Phases', () => {
  const g = duel({ board: [{ hand: ['Stim-Pack'], m: [FILL], turn: 2 }, {}] });
  act(g, 0, 'Stim-Pack'); settle(g, FILL);
  ok(E.atk(g, on(g, 0, FILL)) === 2700, `${E.atk(g, on(g, 0, FILL))}`);
  endTurn(g); toIdle(g); ok(E.atk(g, on(g, 0, FILL)) === 2700, 'not in B Standby');
  endTurn(g); toIdle(g); ok(E.atk(g, on(g, 0, FILL)) === 2500, `2500 after A Standby (${E.atk(g, on(g, 0, FILL))})`);
});
T('Stone Statue of the Aztecs: doubles the attacker battle damage', () => {
  const g = duel({ first: 1, board: [{ m: [defM('Stone Statue of the Aztecs')] }, { hand: [], m: [CG], turn: 2 }] });
  bp(g); atkOn(g, 1, CG, 'Stone Statue of the Aztecs'); toIdle(g);
  ok(lp(g, 1) === 6800, `B took 1200 (${lp(g, 1)})`);
});
T('Stop Defense: a Defense Position monster to Attack', () => {
  const g = duel({ board: [{ hand: ['Stop Defense'], turn: 2 }, { m: [defM(BEWD)] }] });
  act(g, 0, 'Stop Defense'); settle(g, BEWD);
  ok(on(g, 1, BEWD).pos === 'atk', 'Blue-Eyes in Attack');
});

// Goat: the cards with goat-only scripts (they take priority under Goat) and a few shared ones
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
  const gduel = (board, ex, o = {}) => (board[1].turn && !board[0].turn && (board[0].turn = board[1].turn), lastG = GE.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(gid(GF)), extra: (ex || []).map(gid) })), first: o.first || 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board }));
  const Eo = E; const G = (nm, f) => T('Goat: ' + nm, () => { E = GE; try { f(); } finally { E = Eo; } });
  G('Sakuretsu Armor, Shift, Spellbinding Circle', () => {
    let g = gduel([{ st: ['Sakuretsu Armor'] }, { hand: [], m: [BEWD], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, BEWD, null, 'Sakuretsu Armor'); toIdle(g); ok(inZ(g, 1, 'gy', BEWD), 'Goat: Sakuretsu');
    g = gduel([{ m: [GF, CG], st: ['Shift'] }, { hand: [], m: [BEWD], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, BEWD, GF, 'Shift', CG); toIdle(g); ok(on(g, 0, GF) && inZ(g, 0, 'gy', CG), 'Goat: Shift');
    g = gduel([{ hand: [], st: ['Spellbinding Circle'], turn: 2 }, { m: [BEWD] }]);
    act(g, 0, 'Spellbinding Circle'); settle(g, BEWD); endTurn(g); toIdle(g); bp(g);
    ok(!canAtk(g, on(g, 1, BEWD), null), 'Goat: Spellbinding Circle');
  });
  G('Salamandra, Silver Bow and Arrow, Stop Defense, Snatch Steal', () => {
    let g = gduel([{ hand: ['Salamandra'], m: [GTW], turn: 2 }, {}]); act(g, 0, 'Salamandra'); settle(g, GTW);
    ok(E.atk(g, on(g, 0, GTW)) === 1900, 'Goat: Salamandra');
    g = gduel([{ hand: ['Silver Bow and Arrow'], m: ['Shining Angel'], turn: 2 }, {}]); act(g, 0, 'Silver Bow and Arrow'); settle(g, 'Shining Angel');
    ok(E.atk(g, on(g, 0, 'Shining Angel')) === 1700, 'Goat: Silver Bow');
    g = gduel([{ hand: ['Stop Defense'], turn: 2 }, { m: [defM(BEWD)] }]); act(g, 0, 'Stop Defense'); settle(g, BEWD);
    ok(on(g, 1, BEWD).pos === 'atk', 'Goat: Stop Defense');
    g = gduel([{ hand: ['Snatch Steal'], turn: 2 }, { m: [BEWD] }]); act(g, 0, 'Snatch Steal'); settle(g, BEWD); endTurn(g); toIdle(g);
    ok(on(g, 0, BEWD) && lp(g, 1) === 9000, `Goat: Snatch Steal (${lp(g, 1)})`);
  });
  G('Sanga, Slate Warrior, Stone Statue, Stealth Bird', () => {
    let g = gduel([{ m: ['Sanga of the Thunder'] }, { hand: [], m: [BEWD], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, BEWD, 'Sanga of the Thunder', 'Sanga of the Thunder'); toIdle(g, 'Sanga of the Thunder');
    ok(inZ(g, 1, 'gy', BEWD) && lp(g, 1) === 5400, `Goat: Sanga (${lp(g, 1)})`);
    g = gduel([{ hand: [], m: [setM('Slate Warrior')], turn: 2 }, {}]); flipSum(g, 0, 'Slate Warrior');
    ok(E.atk(g, on(g, 0, 'Slate Warrior')) === 2400, 'Goat: Slate Warrior FLIP');
    g = gduel([{ m: [defM('Stone Statue of the Aztecs')] }, { hand: [], m: [CG], turn: 2 }], null, { first: 1 });
    bp(g); atkOn(g, 1, CG, 'Stone Statue of the Aztecs'); toIdle(g); ok(lp(g, 1) === 6800, `Goat: Aztecs (${lp(g, 1)})`);
    g = gduel([{ hand: [], m: [setM('Stealth Bird')], turn: 2 }, {}]); flipSum(g, 0, 'Stealth Bird'); toIdle(g);
    ok(lp(g, 1) === 7000, 'Goat: Stealth Bird');
  });
  G('Senju, Serial Spell, Serpentine Princess, Self-Destruct Button', () => {
    let g = gduel([{ hand: ['Senju of the Thousand Hands'], deckTop: [GF, 'Relinquished'], turn: 2 }, {}]);
    ns(g, 0, 'Senju of the Thousand Hands', 'Relinquished'); ok(inZ(g, 0, 'hand', 'Relinquished'), 'Goat: Senju');
    g = gduel([{ hand: ['Pot of Greed', 'Serial Spell', CG], turn: 2 }, {}]); act(g, 0, 'Pot of Greed'); settle(g, 'Serial Spell');
    ok(hand(g, 0) === 4 && inZ(g, 0, 'gy', CG), `Goat: Serial Spell (hand ${hand(g, 0)})`);
    g = gduel([{ hand: [], m: ['Serpentine Princess', setM('Morphing Jar #2')], deckTop: [GF, 'Sangan'], turn: 2 }, {}]);
    flipSum(g, 0, 'Morphing Jar #2', 'Sangan', 'Attack'); toIdle(g, 'Sangan', 'Attack');
    ok(on(g, 0, 'Sangan') && on(g, 0, 'Sangan').pos !== 'set', 'Goat: Serpentine Princess');
    g = gduel([{ hand: [], st: ['Self-Destruct Button'], lp: 500, turn: 2 }, {}]); act(g, 0, 'Self-Destruct Button'); settle(g);
    ok(lp(g, 0) === 0 && lp(g, 1) === 0, 'Goat: Self-Destruct Button');
  });
  G('Skilled Dark/White Magician, Smoke Grenade, Solar Flare Dragon, Sanwitch, St. Joan', () => {
    let g = gduel([{ hand: ['Sparks', 'Sparks', 'Sparks'], m: ['Skilled Dark Magician'], deckTop: [GF, DM], turn: 2 }, {}]);
    for (let i = 0; i < 3; i++) { act(g, 0, 'Sparks'); settle(g); }
    act(g, 0, 'Skilled Dark Magician'); settle(g, DM, 'Attack'); ok(on(g, 0, DM), 'Goat: Skilled Dark Magician');
    g = gduel([{ hand: ['Sparks', 'Sparks', 'Sparks'], m: ['Skilled White Magician'], deckTop: [GF, 'Buster Blader'], turn: 2 }, {}]);
    for (let i = 0; i < 3; i++) { act(g, 0, 'Sparks'); settle(g); }
    act(g, 0, 'Skilled White Magician'); settle(g, 'Buster Blader', 'Attack'); ok(on(g, 0, 'Buster Blader'), 'Goat: Skilled White Magician');
    g = gduel([{ hand: ['Smoke Grenade of the Thief', 'Mystical Space Typhoon'], m: [GF], turn: 2 }, { hand: ['Pot of Greed'] }]);
    act(g, 0, 'Smoke Grenade of the Thief'); settle(g, GF); act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Smoke Grenade', 'Pot of Greed'); toIdle(g, 'Pot of Greed');
    ok(inZ(g, 1, 'gy', 'Pot of Greed'), 'Goat: Smoke Grenade');
    g = gduel([{ hand: [], m: ['Solar Flare Dragon'], turn: 2 }, {}]); endTurn(g); toIdle(g); ok(lp(g, 1) === 7500, 'Goat: Solar Flare Dragon burn');
    g = gduel([{ hand: ['Polymerization', 'Sangan', 'Witch of the Black Forest'], turn: 2 }, {}], ['Sanwitch']);
    act(g, 0, 'Polymerization'); settle(g, 'Sanwitch', 'Sangan', 'Witch of the Black Forest', 'Attack'); ok(on(g, 0, 'Sanwitch'), 'Goat: Sanwitch');
    g = gduel([{ hand: ['Polymerization', 'The Forgiving Maiden', 'Darklord Marie'], turn: 2 }, {}], ['St. Joan']);
    act(g, 0, 'Polymerization'); settle(g, 'St. Joan', 'The Forgiving Maiden', 'Darklord Marie', 'Attack'); ok(on(g, 0, 'St. Joan'), 'Goat: St. Joan');
  });
}

console.log(fails ? `\n${fails} failed` : '\nAll full-27 review checks passed.');
process.exit(fails ? 1 : 0);
