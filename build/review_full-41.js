// Independent review checks for full pool batch 41 (written from the card text): node build/review_full-41.js
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
const stOf = (g, p) => g.p[p].st.filter(Boolean);
const roll = (g, n) => { g.rnd = () => (n - 0.5) / 6; };
const GSS = 'Giant Soldier of Stone'; // EARTH Rock L3 1300/2000
const set2 = n => ({ n, pos: 'set' });
const flipSum = (g, p, n, ...picks) => { choose(g, 'flip:' + on(g, p, n).u); settle(g, ...picks); };

T('Magnetic Mosquito: FLIP destroys all face-up Machines', () => {
  const g = duel({ board: [{ hand: [], m: [set2('Magnetic Mosquito'), 'Cyber Dragon'], turn: 2 }, { m: ['Cyber Dragon', set2('Jinzo'), CG] }] });
  flipSum(g, 0, 'Magnetic Mosquito'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && inZ(g, 1, 'gy', 'Cyber Dragon') && !!on(g, 1, 'Jinzo') && !!on(g, 1, CG), 'both face-up Cyber Dragons destroyed, set Jinzo and Celtic stay');
});
T('Maiden of Macabre: Spell Counter and +200 per battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Maiden of Macabre'], turn: 2 }, { m: [CG] }] });
  bp(g); atkOn(g, 0, 'Maiden of Macabre', CG); toIdle(g);
  const m = on(g, 0, 'Maiden of Macabre');
  ok(m && inZ(g, 1, 'gy', CG) && ctrs(m) === 1 && E.atk(g, m) === 1900, `1 counter, ATK ${m && E.atk(g, m)}`);
});
T('Makiu: destroys opponent monsters with DEF <= Thunder ATK, no Battle Phase', () => {
  const g = duel({ board: [{ hand: ['Makiu, the Magical Mist'], m: ['Zaborg the Thunder Monarch'], turn: 2 }, { m: [CG, BEWD, 'Labyrinth Wall'] }] });
  act(g, 0, 'Makiu, the Magical Mist'); settle(g, 'Zaborg'); toIdle(g);
  ok(inZ(g, 1, 'gy', CG) && inZ(g, 1, 'gy', BEWD) === false && !!on(g, 1, 'Labyrinth Wall') && !!on(g, 1, BEWD), 'Celtic (1200) destroyed, BEWD (2500) and Wall (3000) stay');
  ok(!hasOpt(g, 'bp'), 'no Battle Phase');
  const g2 = duel({ board: [{ hand: ['Makiu, the Magical Mist'], m: ['Zaborg the Thunder Monarch'], turn: 2 }, { m: [{ n: 'Labyrinth Wall', pos: 'set' }] }] });
  ok(canAct(g2, 0, 'Makiu, the Magical Mist'), 'activatable with a Thunder');
  const g3 = duel({ board: [{ hand: ['Makiu, the Magical Mist'], m: [W], turn: 2 }, { m: [CG] }] });
  ok(!canAct(g3, 0, 'Makiu, the Magical Mist'), 'not activatable without Summoned Skull or Thunder');
});
T('Malefic Blue-Eyes: banish BEWD from Deck, others cannot attack, dies without a Field Spell', () => {
  const g = duel({ board: [{ hand: ['Malefic Blue-Eyes White Dragon', 'Mountain'], m: [W], deckTop: [W, BEWD], turn: 2 }, {}] });
  act(g, 0, 'Mountain'); settle(g); toIdle(g);
  const mc = card(g, 0, 'Malefic Blue-Eyes White Dragon');
  ok(noSummon(g, mc) === false && !hasOpt(g, 'ns:' + mc.u), 'no Normal Summon, Special Summon offered');
  choose(g, 'sp:' + mc.u); settle(g, BEWD, 'Attack'); toIdle(g);
  ok(!!on(g, 0, 'Malefic Blue-Eyes White Dragon') && inZ(g, 0, 'ban', BEWD), 'Malefic summoned, BEWD banished from Deck');
  bp(g); ok(!canAtk(g, on(g, 0, W), null) && canAtk(g, on(g, 0, 'Malefic Blue-Eyes White Dragon'), null), 'Warwolf cannot attack, Malefic can');
  const g2 = duel({ board: [{ hand: ['Malefic Blue-Eyes White Dragon'], deckTop: [BEWD], turn: 2 }, {}] });
  const m2 = card(g2, 0, 'Malefic Blue-Eyes White Dragon');
  if (hasOpt(g2, 'sp:' + m2.u)) { choose(g2, 'sp:' + m2.u); settle(g2, BEWD, 'Attack'); toIdle(g2); }
  ok(!on(g2, 0, 'Malefic Blue-Eyes White Dragon'), 'no Field Spell: Malefic is not left on the field');
  const g3 = duel({ board: [{ hand: ['Malefic Blue-Eyes White Dragon', 'Mountain'], turn: 2 }, {}] });
  act(g3, 0, 'Mountain'); settle(g3); toIdle(g3);
  ok(!hasOpt(g3, 'sp:' + card(g3, 0, 'Malefic Blue-Eyes White Dragon').u), 'no BEWD in Deck: no Special Summon');
});
T('Malfunction: negates a Trap and returns it face-down', () => {
  const g = duel({ board: [{ hand: [], m: [W], st: ['Malfunction'], turn: 2 }, { m: [CG], st: ['Sakuretsu Armor'] }] });
  bp(g); choose(g, `atk:${on(g, 0, W).u}:${on(g, 1, CG).u}`);
  const used = new Set();
  for (let i = 0; i < 30 && g.prompt && g.prompt.type === 'respond'; i++) { const o = g.prompt.opts.find(x => { const c = x.u != null && byU(g, x.u); const n = c ? E.name(c) : ''; return ['Sakuretsu Armor', 'Malfunction'].includes(n) && !used.has(n); });
    if (o) { used.add(E.name(byU(g, o.u))); E.act(g, [o.key]); } else E.act(g, ['pass']);
    for (let j = 0; j < 5 && g.prompt && !['respond', 'idle', 'battle'].includes(g.prompt.type); j++) E.act(g, [g.prompt.opts[0].key]); }
  const s = card(g, 1, 'Sakuretsu Armor');
  ok(!!on(g, 0, W) && s && s.zone === 'st' && s.pos === 'set' && lp(g, 0) === 7500 && inZ(g, 1, 'gy', CG), `Warwolf survives, Sakuretsu set again, A paid 500 (LP ${lp(g, 0)})`);
});
T('Man Beast of Ares: +500 after a chain of 2 links', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Man Beast of Ares'], turn: 2 }, { st: ['Threatening Roar', 'Dust Tornado'] }] });
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Face-down', 'Threatening Roar'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Man Beast of Ares')) === 1000, `ATK ${E.atk(g, on(g, 0, 'Man Beast of Ares'))} after a 2-link chain`);
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Man Beast of Ares'], turn: 2 }, { st: [up('Swords of Revealing Light')] }] });
  act(g2, 0, 'Mystical Space Typhoon'); settle(g2, 'Swords'); toIdle(g2);
  ok(E.atk(g2, on(g2, 0, 'Man Beast of Ares')) === 500, 'no gain after a 1-link chain');
});
T('Maniacal Servant: banish DARKs in the opponent Standby for +500 DEF each', () => {
  const g = duel({ board: [{ hand: [], m: ['Maniacal Servant'], gy: ['Dark Elf', 'Jinzo', CG], turn: 2 }, {}] });
  endTurn(g, 'Maniacal Servant', 'Dark Elf', 'Jinzo');
  toIdle(g, 'Maniacal Servant', 'Dark Elf', 'Jinzo'); const used = g.tp === 1;
  const s = on(g, 0, 'Maniacal Servant');
  ok(used && g.phase !== 'standby' && inZ(g, 0, 'ban', 'Dark Elf') && inZ(g, 0, 'ban', 'Jinzo') && inZ(g, 0, 'gy', CG) && E.def(g, s) === 2000, `used in B Standby, DEF ${E.def(g, s)}`);
});
T('Marshmallon: not destroyed by battle, 1000 to the attacker if it was face-down', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: [set2('Marshmallon')] }] });
  bp(g); atkOn(g, 0, W, 'Marshmallon'); toIdle(g);
  ok(!!on(g, 1, 'Marshmallon') && lp(g, 0) === 7000, `Marshmallon survives, A LP ${lp(g, 0)}`);
  const g2 = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Marshmallon'] }] });
  bp(g2); atkOn(g2, 0, W, 'Marshmallon'); toIdle(g2);
  ok(!!on(g2, 1, 'Marshmallon') && lp(g2, 0) === 8000 && lp(g2, 1) === 6300, `face-up: no 1000, B took 1700 (A ${lp(g2, 0)}, B ${lp(g2, 1)})`);
});
T('Marshmallon Glasses: only Marshmallon can be attacked', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Marshmallon', CG], st: [up('Marshmallon Glasses')] }] });
  bp(g);
  ok(canAtk(g, on(g, 0, W), on(g, 1, 'Marshmallon')) && !canAtk(g, on(g, 0, W), on(g, 1, CG)), 'Marshmallon targetable, Celtic not');
});
T('Mass Hypnosis: take up to 3 A-Counter monsters, destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Alien Shocktrooper'], st: ['Mass Hypnosis'], turn: 2 }, { m: [CG, BEWD, W] }] });
  E.lib.addCtr(g, on(g, 1, CG), 'A', 1); E.lib.addCtr(g, on(g, 1, BEWD), 'A', 1);
  choose(g, 'pos:' + on(g, 0, 'Alien Shocktrooper').u); settle(g); // refresh the idle options
  act(g, 0, 'Mass Hypnosis'); settle(g, CG, 'Blue-Eyes'); toIdle(g);
  ok(!!on(g, 0, CG) && !!on(g, 0, BEWD) && !!on(g, 1, W), 'A took Celtic and BEWD, not Warwolf');
  endTurn(g);
  ok(inZ(g, 0, 'gy', 'Mass Hypnosis'), 'Mass Hypnosis destroyed in the End Phase');
});
T('Max Warrior: +400 in the Damage Step, then Level 2 and halved', () => {
  const g = duel({ board: [{ hand: [], m: ['Max Warrior'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Max Warrior', W); toIdle(g);
  const m = on(g, 0, 'Max Warrior');
  ok(inZ(g, 1, 'gy', W) && lp(g, 1) === 7800, `beat Warwolf with 2200 (B LP ${lp(g, 1)})`);
  ok(m && LV(m) === 2 && E.atk(g, m) === 900 && E.def(g, m) === 400, `Level ${m && LV(m)}, ${m && E.atk(g, m)}/${m && E.def(g, m)}`);
  endTurn(g); endTurn(g);
  ok(LV(m) === 4 && E.atk(g, m) === 1800, `back to Level 4, 1800 on the next turn (Lv ${LV(m)}, ATK ${E.atk(g, m)})`);
});
T('Maximum Six: Tribute Summon rolls a die for +200 each', () => {
  const g = duel({ board: [{ hand: ['Maximum Six'], m: [W], turn: 2 }, {}] });
  roll(g, 3); ns(g, 0, 'Maximum Six', W); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Maximum Six')) === 2500, `ATK ${E.atk(g, on(g, 0, 'Maximum Six'))} on a 3`);
});
T('Mecha Bunny: flip burns 500, battle death fetches a copy face-down', () => {
  const g = duel({ board: [{ hand: [], m: [set2('Mecha Bunny')], turn: 2 }, { m: [CG] }] });
  flipSum(g, 0, 'Mecha Bunny', CG); toIdle(g);
  ok(lp(g, 1) === 7500, `B took 500 (LP ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Mecha Bunny'], deckTop: ['Mecha Bunny'] }] });
  bp(g2); atkOn(g2, 0, W, 'Mecha Bunny', 'Mecha Bunny'); toIdle(g2, 'Mecha Bunny');
  const b = on(g2, 1, 'Mecha Bunny');
  ok(inZ(g2, 1, 'gy', 'Mecha Bunny') && b && b.pos === 'set', 'new Mecha Bunny set from the Deck');
});
T('Mechanical Hound: opponent cannot activate Spells while its controller has no hand', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon', 'Upstart Goblin'], turn: 2 }, { hand: [], m: ['Mechanical Hound'], st: ['Mirror Force'] }] });
  ok(!canAct(g, 0, 'Upstart Goblin') && !canAct(g, 0, 'Mystical Space Typhoon'), 'A cannot activate Spells');
  const g2 = duel({ board: [{ hand: ['Upstart Goblin'], turn: 2 }, { hand: [W], m: ['Mechanical Hound'] }] });
  ok(canAct(g2, 0, 'Upstart Goblin'), 'with a card in B hand, A can');
});
T('Medium Piece Golem: Summons Small Piece Golem with Big Piece Golem', () => {
  const g = duel({ board: [{ hand: ['Medium Piece Golem'], m: ['Big Piece Golem'], deckTop: [W, 'Small Piece Golem'], turn: 2 }, {}] });
  ns(g, 0, 'Medium Piece Golem', 'Small Piece Golem'); toIdle(g, 'Small Piece Golem');
  ok(!!on(g, 0, 'Small Piece Golem'), 'Small Piece Golem Special Summoned');
});
T('Mei-Kou: Tribute to destroy a face-up Continuous Spell/Trap', () => {
  const g = duel({ board: [{ hand: [], m: ['Mei-Kou, Master of Barriers'], turn: 2 }, { st: [up('Marshmallon Glasses'), 'Mirror Force'] }] });
  ign(g, on(g, 0, 'Mei-Kou, Master of Barriers'), 'Marshmallon Glasses'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Mei-Kou, Master of Barriers') && inZ(g, 1, 'gy', 'Marshmallon Glasses') && inZ(g, 1, 'st', 'Mirror Force'), 'Mei-Kou tributed, Glasses destroyed');
});
T('Meltiel: gain 1000 after a Counter Trap resolves', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Meltiel, Sage of the Sky'], st: ['Negate Attack'] }] });
  bp(g); atkOn(g, 0, W, 'Meltiel, Sage of the Sky', 'Negate Attack'); toIdle(g);
  ok(lp(g, 1) === 9000 && !!on(g, 1, 'Meltiel, Sage of the Sky'), `B LP ${lp(g, 1)}`);
});
T('Memory Crusher: direct hit burns 100 per Extra Deck card', () => {
  const g = duel({ ex1: ['Stardust Dragon', 'Nitro Warrior', 'Sun Dragon Inti'], board: [{ hand: [], m: ['Memory Crusher'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Memory Crusher', null); toIdle(g);
  ok(lp(g, 1) === 8000 - 1000 - 300, `B LP ${lp(g, 1)}`);
});
T('Mermaid Archer: equips a Level 3 or lower monster for +800', () => {
  const g = duel({ board: [{ hand: [], m: ['Mermaid Archer', 'Giant Soldier of Stone'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Mermaid Archer'), 'Giant Soldier'); toIdle(g);
  const a = on(g, 0, 'Mermaid Archer'), s = card(g, 0, 'Giant Soldier of Stone');
  ok(s && s.zone === 'st' && s.equipTo === a.u && E.atk(g, a) === 2000, `Giant Soldier equipped, ATK ${E.atk(g, a)}`);
});
T('Mesmeric Control: opponent cannot change positions next turn', () => {
  const g = duel({ board: [{ hand: ['Mesmeric Control'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Mesmeric Control'); settle(g); toIdle(g); endTurn(g); toIdle(g);
  ok(g.tp === 1 && !hasOpt(g, 'pos:' + on(g, 1, W).u), 'B cannot change Warwolf position');
});
T('Metabo Globster: Tribute for a DARK gives 3 Metabo Tokens', () => {
  const g = duel({ board: [{ hand: ['Jinzo'], m: ['Metabo Globster'], turn: 2 }, {}] });
  ns(g, 0, 'Jinzo', 'Metabo Globster'); toIdle(g);
  const t = mons(g, 0).filter(c => E.name(c) === 'Metabo Token');
  ok(!!on(g, 0, 'Jinzo') && t.length === 3 && t.every(c => c.pos === 'def'), `${t.length} tokens in Defense`);
  const g2 = duel({ board: [{ hand: [BEWD], m: ['Metabo Globster', W], turn: 2 }, {}] });
  ns(g2, 0, BEWD, 'Metabo Globster', W); toIdle(g2);
  ok(!mons(g2, 0).some(c => E.name(c) === 'Metabo Token'), 'no tokens for a LIGHT Tribute Summon');
});
T('Meteor Flare: discard 2 for 2000 damage', () => {
  const g = duel({ board: [{ hand: [W, CG, W], st: ['Meteor Flare'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Meteor Flare'); settle(g, CG, W); toIdle(g);
  ok(lp(g, 1) === 6000 && hand(g, 0) === h - 2, `B LP ${lp(g, 1)}, hand ${h} -> ${hand(g, 0)}`);
  const g2 = duel({ board: [{ hand: [W, CG], st: ['Meteor Flare'], turn: 2 }, { lp: 3000 }] });
  ok(!canAct(g2, 0, 'Meteor Flare'), 'not at 3000 LP');
});
T('Minefieldriller: adds a Field Spell from the GY when it leaves the field', () => {
  const g = duel({ board: [{ hand: [], m: ['Minefieldriller'], gy: ['Mountain'], turn: 2 }, { m: [BEWD] }] });
  bp(g); atkOn(g, 0, 'Minefieldriller', BEWD, 'Minefieldriller', 'Mountain'); toIdle(g, 'Minefieldriller', 'Mountain');
  ok(inZ(g, 0, 'hand', 'Mountain'), 'Mountain added');
});
T('Miniaturize: Level -1 and -1000 ATK', () => {
  const g = duel({ board: [{ hand: [], st: ['Miniaturize'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Miniaturize'); settle(g, 'Blue-Eyes'); toIdle(g);
  const b = on(g, 1, BEWD);
  ok(E.atk(g, b) === 2000 && LV(b) === 7, `BEWD ${E.atk(g, b)} Lv ${LV(b)}`);
});
T('Minoan Centaur: Tribute for 2 Level 4 Beast-Warrior Normals', () => {
  const g = duel({ board: [{ hand: [], m: ['Minoan Centaur'], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Minoan Centaur'), 'Attack'); toIdle(g, 'Attack');
  ok(inZ(g, 0, 'gy', 'Minoan Centaur') && mons(g, 0).filter(c => E.name(c) === W).length === 2, '2 Warwolves from the Deck');
  const g2 = duel({ board: [{ hand: ['Minoan Centaur'], m: [W, CG], turn: 2 }, {}] });
  ok(hasOpt(g2, 'ns:' + card(g2, 0, 'Minoan Centaur').u), 'can be Tribute Summoned');
});
T('Miraculous Descent: Summons a banished Fairy, linked destruction', () => {
  const g = duel({ board: [{ hand: [], st: ['Miraculous Descent'], ban: ['Shining Angel'], turn: 2 }, { hand: ['Mystical Space Typhoon'] }] });
  act(g, 0, 'Miraculous Descent'); settle(g, 'Shining Angel', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Shining Angel'), 'Shining Angel Special Summoned');
  const d = card(g, 0, 'Miraculous Descent');
  E.lib.destroy(g, [d], { by: 1 }); E.lib.destroy && 0;
  ok(!on(g, 0, 'Shining Angel'), 'Angel destroyed when Descent leaves');
});
T('Miraculous Rebirth: not as Chain Link 1', () => {
  const g = duel({ board: [{ hand: ['Miraculous Rebirth'], gy: [BEWD], turn: 2 }, {}] });
  ok(!canAct(g, 0, 'Miraculous Rebirth'), 'not activatable in an open game state');
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon', 'Miraculous Rebirth'], st: ['Dust Tornado'], gy: [BEWD], turn: 2 }, { st: ['Threatening Roar', 'Mirror Force'] }] });
  const fd = () => { for (let j = 0; j < 4 && g2.prompt && !['respond', 'idle', 'battle'].includes(g2.prompt.type); j++) { const o = g2.prompt.opts.find(x => x.label.includes('Face-down')) || g2.prompt.opts[0]; E.act(g2, [o.key]); } };
  act(g2, 0, 'Mystical Space Typhoon'); fd();
  const step = (who, n) => { for (let i = 0; i < 6 && g2.prompt && g2.prompt.type === 'respond'; i++) { const o = g2.prompt.opts.find(x => { const c = x.u != null && byU(g2, x.u); return c && E.name(c) === n; });
    if (g2.prompt.p === who && o) { E.act(g2, [o.key]); return true; } E.act(g2, ['pass']); } return false; };
  const r1 = step(1, 'Threatening Roar'); fd();
  const r2 = step(0, 'Dust Tornado'); fd();
  const r3 = step(0, 'Miraculous Rebirth'); settle(g2, BEWD, 'Attack'); toIdle(g2, 'Attack');
  ok(r1 && r2 && r3 && !!on(g2, 0, BEWD), `activated as Chain Link 4, BEWD revived (${r1} ${r2} ${r3})`);
});
T('Misfortune: half original ATK as damage, no attacks', () => {
  const g = duel({ board: [{ hand: ['Misfortune'], m: [W], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Misfortune'); settle(g, 'Blue-Eyes'); toIdle(g);
  ok(lp(g, 1) === 6500, `B LP ${lp(g, 1)}`);
  if (hasOpt(g, 'bp')) bp(g);
  ok(!hasOpt(g, 'atk:'), 'no attacks');
});
T('Moja: battle death adds a Level 4 Beast from the GY', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Moja'], gy: ['Gazelle the King of Mythical Beasts'] }] });
  bp(g); atkOn(g, 0, W, 'Moja', 'Moja', 'Gazelle'); toIdle(g, 'Moja', 'Gazelle');
  ok(inZ(g, 1, 'hand', 'Gazelle the King of Mythical Beasts'), 'Gazelle added');
});
T('Molting Escape: survives battle once and gains 300', () => {
  const g = duel({ board: [{ hand: ['Molting Escape'], m: ['Alien Shocktrooper'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Molting Escape'); settle(g, 'Alien Shocktrooper'); toIdle(g);
  bp(g); atkOn(g, 0, 'Alien Shocktrooper', BEWD); toIdle(g);
  const a = on(g, 0, 'Alien Shocktrooper');
  ok(a && E.atk(g, a) === 2200 && lp(g, 0) === 6900, `survived, ATK ${a && E.atk(g, a)}, A LP ${lp(g, 0)}`);
  const g2 = duel({ board: [{ hand: ['Molting Escape'], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Molting Escape'), 'needs a Reptile');
});
T('Montage Dragon: send 3 monsters, ATK = Levels x 300', () => {
  const g = duel({ board: [{ hand: ['Montage Dragon', W, CG, 'Giant Soldier of Stone'], turn: 2 }, {}] });
  const m = card(g, 0, 'Montage Dragon');
  ok(!hasOpt(g, 'ns:' + m.u) && !hasOpt(g, 'set:' + m.u), 'no Normal Summon');
  choose(g, 'sp:' + m.u); settle(g, W, CG, 'Giant Soldier', 'Attack'); toIdle(g, 'Attack');
  const d = on(g, 0, 'Montage Dragon');
  ok(d && E.atk(g, d) === 3300 && hand(g, 0) === 1, `ATK ${d && E.atk(g, d)} (4+4+3 = 11 x 300)`);
});
T('Moon Dragon Quilla: gains half the attacker ATK, revives Inti when destroyed', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Moon Dragon Quilla'] }] });
  bp(g); atkOn(g, 0, W, 'Moon Dragon Quilla', 'Moon Dragon Quilla'); toIdle(g, 'Moon Dragon Quilla');
  ok(lp(g, 1) === 9000, `B gained 1000 (LP ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: [BEWD], turn: 2 }, { m: ['Moon Dragon Quilla'], gy: ['Sun Dragon Inti'] }] });
  bp(g2); atkOn(g2, 0, BEWD, 'Moon Dragon Quilla', 'Moon Dragon Quilla', 'Sun Dragon Inti', 'Attack'); toIdle(g2, 'Moon Dragon Quilla', 'Sun Dragon Inti', 'Attack');
  ok(!!on(g2, 1, 'Sun Dragon Inti') && lp(g2, 1) === 8000 + 1500 - 500, `Inti revived, B LP ${lp(g2, 1)}`);
});
T('Mormolith: Tribute an EARTH to destroy face-up monsters with DEF <= its ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Mormolith', W], turn: 2 }, { m: [CG, BEWD, set2('Giant Soldier of Stone')] }] });
  ign(g, on(g, 0, 'Mormolith'), W); toIdle(g);
  ok(inZ(g, 0, 'gy', W) && inZ(g, 1, 'gy', CG) && !!on(g, 1, BEWD) && !!on(g, 1, 'Giant Soldier of Stone'), 'Celtic destroyed, BEWD and the set monster stay');
});
T('Morphing Jar 2: shuffles monsters, excavates and Sets the same number', () => {
  const g = duel({ board: [{ hand: [], m: [set2('Morphing Jar 2'), CG], turn: 2 }, { m: [W, BEWD] }] });
  flipSum(g, 0, 'Morphing Jar 2'); toIdle(g);
  const a = mons(g, 0), b = mons(g, 1);
  ok(!!on(g, 0, 'Morphing Jar 2') && a.length === 2 && b.length === 2 && b.every(c => c.pos === 'set') && a.filter(c => c.pos === 'set').length === 1 && !b.some(c => E.name(c) === BEWD), `A ${a.map(c => E.name(c) + ':' + c.pos)}, B ${b.map(c => E.name(c) + ':' + c.pos)}`);
});
T('Morphtransition: negates the attack on a Morphtronic and changes its position', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Morphtronic Radion'], st: ['Morphtransition'] }] });
  bp(g); atkOn(g, 0, W, 'Morphtronic Radion', 'Morphtransition'); toIdle(g);
  const r = on(g, 1, 'Morphtronic Radion');
  ok(r && r.pos === 'def' && lp(g, 1) === 8000, `Radion in ${r && r.pos}, B LP ${lp(g, 1)}`);
});
T('Mosaic Manticore: Tributes come back in the next Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Mosaic Manticore'], m: [W, CG], turn: 2 }, {}] });
  ns(g, 0, 'Mosaic Manticore', W, CG); toIdle(g);
  ok(!!on(g, 0, 'Mosaic Manticore'), 'Tribute Summoned');
  endTurn(g); endTurn(g); toIdle(g, 'Mosaic', 'Attack');
  ok(g.tp === 0 && !!on(g, 0, W) && !!on(g, 0, CG), 'Warwolf and Celtic back on A field');
  bp(g); ok(!canAtk(g, on(g, 0, W), null), 'they cannot attack');
});
T('Mother Spider: send 2 face-up Defense monsters to Special Summon', () => {
  const g = duel({ board: [{ hand: ['Mother Spider'], gy: ['Magnetic Mosquito'], turn: 2 }, { m: [{ n: CG, pos: 'def' }, { n: W, pos: 'def' }, BEWD] }] });
  const ms = card(g, 0, 'Mother Spider');
  ok(hasOpt(g, 'sp:' + ms.u), 'Special Summon offered');
  choose(g, 'sp:' + ms.u); settle(g, CG, W, 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Mother Spider') && inZ(g, 1, 'gy', CG) && inZ(g, 1, 'gy', W) && !!on(g, 1, BEWD), 'Spider summoned, 2 Defense monsters sent');
  const g2 = duel({ board: [{ hand: ['Mother Spider'], gy: [W], turn: 2 }, { m: [{ n: CG, pos: 'def' }, { n: W, pos: 'def' }] }] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Mother Spider').u), 'not with a non-Insect in the GY');
});
T('Multiply: Tribute Kuriboh for Kuriboh Tokens', () => {
  const g = duel({ board: [{ hand: ['Multiply'], m: ['Kuriboh', W], turn: 2 }, {}] });
  act(g, 0, 'Multiply'); settle(g, 'Kuriboh'); toIdle(g);
  const t = mons(g, 0).filter(c => E.name(c) === 'Kuriboh Token');
  ok(t.length === 4 && t.every(c => c.pos === 'def' && E.atk(g, c) === 300) && inZ(g, 0, 'gy', 'Kuriboh'), `${t.length} tokens`);
});
T('Mushroom Man 2: controller loses 300 in Standby, pay 500 to pass control', () => {
  const g = duel({ board: [{ hand: [], m: ['Mushroom Man 2'], turn: 2 }, {}] });
  endTurn(g, 'Mushroom');
  ok(g.tp === 1 && !!on(g, 1, 'Mushroom Man 2') && lp(g, 0) === 7200, `control passed to B, A paid 500 (A ${lp(g, 0)})`);
  toIdle(g, 'Mushroom');
  ok(lp(g, 1) === 7700, `B lost 300 in its Standby (B ${lp(g, 1)})`);
});
T('Mutant Mindmaster: borrows an Attack Position monster to attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Mutant Mindmaster'], turn: 2 }, { m: [BEWD, CG] }] });
  bp(g); choose(g, `atk:${on(g, 0, 'Mutant Mindmaster').u}:${on(g, 1, CG).u}`); settle(g, 'Mutant Mindmaster', 'Blue-Eyes', 'Celtic'); toIdle(g, 'Celtic');
  ok(!!on(g, 0, BEWD), 'A took control of BEWD');
  if (on(g, 0, BEWD) && canAtk(g, on(g, 0, BEWD), on(g, 1, CG))) atkOn(g, 0, BEWD, CG);
  ok(inZ(g, 1, 'gy', CG) && lp(g, 1) === 8000 - 1600, `Celtic destroyed by BEWD (B LP ${lp(g, 1)})`);
  endTurn(g);
  ok(!!on(g, 1, BEWD), 'BEWD back to B');
  const g2 = duel({ board: [{ hand: [], m: ['Mutant Mindmaster'], turn: 2 }, { m: [BEWD] }] });
  bp(g2); atkOn(g2, 0, 'Mutant Mindmaster', BEWD, 'Mutant Mindmaster', 'Blue-Eyes'); toIdle(g2);
  ok(!!on(g2, 0, BEWD) && !canAtk(g2, on(g2, 0, BEWD), null) && lp(g2, 1) === 8000, 'the borrowed monster cannot attack directly');
});
T('Mythical Beast Cerberus: +500 per Spell, cleared after battle', () => {
  const g = duel({ board: [{ hand: ['Upstart Goblin', 'Upstart Goblin'], m: ['Mythical Beast Cerberus'], turn: 2 }, {}] });
  act(g, 0, 'Upstart Goblin'); settle(g); toIdle(g); act(g, 0, 'Upstart Goblin'); settle(g); toIdle(g);
  const c = on(g, 0, 'Mythical Beast Cerberus');
  ok(E.atk(g, c) === 2400, `ATK ${E.atk(g, c)} after 2 Spells`);
  bp(g); atkOn(g, 0, 'Mythical Beast Cerberus', null); choose(g, 'endbp'); settle(g);
  ok(E.atk(g, c) === 1400, `ATK ${E.atk(g, c)} after battling`);
});
T('Nanobreaker: destroys a face-up Level 3 or lower without damage calculation', () => {
  const g = duel({ board: [{ hand: [], m: ['Nanobreaker'], turn: 2 }, { m: [{ n: 'Giant Soldier of Stone', pos: 'def' }] }] });
  bp(g); atkOn(g, 0, 'Nanobreaker', 'Giant Soldier of Stone'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Giant Soldier of Stone') && lp(g, 0) === 8000, `destroyed, A LP ${lp(g, 0)}`);
});
T('Natural Disaster: 500 when a Cloudian effect destroys a card', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Cloudian - Poison Cloud'], st: [up('Natural Disaster')] }] });
  bp(g); atkOn(g, 0, W, 'Cloudian - Poison Cloud', 'Poison Cloud', 'Natural Disaster'); toIdle(g, 'Poison Cloud', 'Natural Disaster');
  ok(inZ(g, 0, 'gy', W) && lp(g, 0) === 8000 - 800 - 500, `A LP ${lp(g, 0)}`);
});
T('Natural Tune: a Normal Monster becomes a Tuner', () => {
  const g = duel({ ex0: ['Stardust Dragon'], board: [{ hand: ['Natural Tune'], m: [W, CG], turn: 2 }, {}] });
  ok(!hasOpt(g, 'Synchro Summon'), 'no Synchro before');
  act(g, 0, 'Natural Tune'); settle(g, W); toIdle(g);
  // ENGINE gap documented in the script: the engine's Synchro check reads Tuners from card data only
  ok(on(g, 0, W).flags.f41tuner === true, 'Warwolf flagged as a Tuner (engine Synchro check does not read it: documented gap)');
});
T("Nature's Reflection: opponent burn hits themselves", () => {
  const g = duel({ board: [{ hand: ['Ookazi'], turn: 2 }, { st: ["Nature's Reflection"] }] });
  act(g, 0, 'Ookazi'); settle(g, "Nature's Reflection"); toIdle(g);
  ok(lp(g, 0) === 7200 && lp(g, 1) === 8000, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
});
T('Necroface: shuffles banished cards, +100 each; banished: both mill-banish 5', () => {
  const g = duel({ board: [{ hand: ['Necroface'], ban: [CG, CG, CG], turn: 2 }, { ban: [BEWD, BEWD] }] });
  ns(g, 0, 'Necroface'); toIdle(g);
  const n = on(g, 0, 'Necroface');
  ok(n && E.atk(g, n) === 1700 && g.p[0].ban.length === 0 && g.p[1].ban.length === 0, `ATK ${n && E.atk(g, n)}, bans ${g.p[0].ban.length}/${g.p[1].ban.length}`);
  const g2 = duel({ board: [{ hand: ['Soul Release'], gy: ['Necroface'], turn: 2 }, {}] });
  const d0 = g2.p[0].deck.length, d1 = g2.p[1].deck.length;
  act(g2, 0, 'Soul Release'); settle(g2, 'Necroface'); toIdle(g2);
  ok(g2.p[0].deck.length === d0 - 5 && g2.p[1].deck.length === d1 - 5, `decks ${d0}->${g2.p[0].deck.length}, ${d1}->${g2.p[1].deck.length}`);
});
T('Needlebug Nest: top 5 to the GY', () => {
  const g = duel({ board: [{ hand: [], st: ['Needlebug Nest'], turn: 2 }, {}] });
  const d = g.p[0].deck.length; act(g, 0, 'Needlebug Nest'); settle(g); toIdle(g);
  ok(g.p[0].deck.length === d - 5 && cnt(g, 0, 'gy', W) === 5, `Deck ${d} -> ${g.p[0].deck.length}`);
});
T('Nega-Ton Corepanel: negates and destroys an Effect Monster effect', () => {
  const g = duel({ board: [{ hand: ['Breaker the Magical Warrior'], turn: 2 }, { m: ["Koa'ki Meiru Boulder"], st: ['Nega-Ton Corepanel', 'Mirror Force'], gy: ["Iron Core of Koa'ki Meiru"] }] });
  ns(g, 0, 'Breaker the Magical Warrior'); toIdle(g);
  ign(g, on(g, 0, 'Breaker the Magical Warrior'), 'Face-down', 'Nega-Ton'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Breaker the Magical Warrior') && inZ(g, 1, 'st', 'Mirror Force') && inZ(g, 1, 'gy', 'Nega-Ton Corepanel'), 'Breaker destroyed, Mirror Force stays');
});
T('Negate Attack: negates the attack and ends the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: [W, CG], turn: 2 }, { st: ['Negate Attack'] }] });
  bp(g); atkOn(g, 0, W, null, 'Negate Attack'); toIdle(g);
  ok(lp(g, 1) === 8000 && !hasOpt(g, 'atk:') && g.phase !== 'battle', `no damage, Battle Phase over (phase ${g.phase})`);
});
T('Neos Force: +800, burns the destroyed monster ATK, back to the Deck in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Neos Force'], m: ['Elemental HERO Neos'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Neos Force'); settle(g, 'Neos'); toIdle(g);
  const n = on(g, 0, 'Elemental HERO Neos');
  ok(E.atk(g, n) === 3300, `Neos ${E.atk(g, n)}`);
  bp(g); atkOn(g, 0, 'Elemental HERO Neos', BEWD, 'Neos Force'); toIdle(g, 'Neos Force');
  ok(inZ(g, 1, 'gy', BEWD) && lp(g, 1) === 8000 - 300 - 3000, `B LP ${lp(g, 1)}`);
  endTurn(g, 'Neos Force');
  ok(!card(g, 0, 'Neos Force') && g.p[0].deck.some(c => E.name(c) === 'Neos Force'), 'Neos Force shuffled into the Deck');
});
T('Neos Wiseman: summoned with Neos and Yubel, burns and heals after battle', () => {
  const g = duel({ board: [{ hand: ['Neos Wiseman'], m: ['Elemental HERO Neos', 'Yubel'], turn: 2 }, { m: [CG] }] });
  const w = card(g, 0, 'Neos Wiseman');
  ok(!hasOpt(g, 'ns:' + w.u), 'no Normal Summon');
  choose(g, 'sp:' + w.u); settle(g, 'Neos', 'Yubel', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Neos Wiseman') && inZ(g, 0, 'gy', 'Elemental HERO Neos') && inZ(g, 0, 'gy', 'Yubel'), 'Wiseman summoned');
  bp(g); atkOn(g, 0, 'Neos Wiseman', CG, 'Neos Wiseman'); toIdle(g, 'Neos Wiseman');
  ok(lp(g, 1) === 8000 - 1600 - 1400 && lp(g, 0) === 9200, `B ${lp(g, 1)}, A ${lp(g, 0)}`);
  E.lib.destroy(g, [on(g, 0, 'Neos Wiseman')], { by: 1 });
  ok(!!on(g, 0, 'Neos Wiseman'), 'not destroyed by a card effect');
});
T('NEX: Neo-Spacian becomes its Level 4 form from the Extra Deck', () => {
  const g = duel({ ex0: ['Neo-Spacian Marine Dolphin'], board: [{ hand: ['NEX'], m: ['Neo-Spacian Aqua Dolphin'], turn: 2 }, {}] });
  act(g, 0, 'NEX'); settle(g, 'Aqua Dolphin', 'Marine Dolphin', 'Attack'); toIdle(g, 'Attack');
  ok(!!on(g, 0, 'Neo-Spacian Marine Dolphin') && inZ(g, 0, 'gy', 'Neo-Spacian Aqua Dolphin'), 'Marine Dolphin Special Summoned');
});
T('Next to be Lost: sends a same-name card from the Deck', () => {
  const g = duel({ board: [{ hand: [], m: [W], st: ['Next to be Lost'], turn: 2 }, {}] });
  act(g, 0, 'Next to be Lost'); settle(g, W); toIdle(g);
  ok(cnt(g, 0, 'gy', W) === 1, 'a Warwolf from the Deck in the GY');
});
T('Night Wing Sorceress: Assault Mode Activate the turn it is Set', () => {
  for (const nws of [true, false]) {
    const g = duel({ board: [{ hand: ['Assault Mode Activate'], m: nws ? ['Night Wing Sorceress', 'Stardust Dragon'] : [CG, 'Stardust Dragon'], deckTop: [W, 'Stardust Dragon Assault Mode'], turn: 2 }, {}] });
    choose(g, 'setst:' + card(g, 0, 'Assault Mode Activate').u); settle(g); toIdle(g);
    const c = card(g, 0, 'Assault Mode Activate');
    const acts = g.prompt.opts.some(x => x.key.startsWith('a:' + c.u + ':'));
    ok(acts === nws, nws ? 'with Night Wing: activatable the turn it was Set' : 'without Night Wing: not activatable the turn it was Set');
    if (nws) { act(g, 0, 'Assault Mode Activate'); settle(g, 'Stardust Dragon', 'Stardust Dragon Assault Mode', 'Attack'); toIdle(g, 'Attack'); ok(!!on(g, 0, 'Stardust Dragon Assault Mode'), 'Assault Mode summoned'); }
  }
});
T("Night's End Sorcerer: Special Summon banishes up to 2 from the opponent GY", () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ["Night's End Sorcerer"], turn: 2 }, { gy: [BEWD, CG, W] }] });
  act(g, 0, 'Monster Reborn'); settle(g, "Night's End", 'Blue-Eyes', 'Celtic', 'Attack'); toIdle(g, "Night's End", 'Blue-Eyes', 'Celtic', 'Attack');
  ok(!!on(g, 0, "Night's End Sorcerer") && inZ(g, 1, 'ban', BEWD) && inZ(g, 1, 'ban', CG) && inZ(g, 1, 'gy', W), 'BEWD and Celtic banished');
});
T("Nightmare's Steelcage: no attacks, lasts 2 opponent turns", () => {
  const g = duel({ board: [{ hand: ["Nightmare's Steelcage"], m: [W], turn: 2 }, { m: [CG] }] });
  act(g, 0, "Nightmare's Steelcage"); settle(g); toIdle(g);
  ok(inZ(g, 0, 'st', "Nightmare's Steelcage"), 'stays on the field');
  bp(g); ok(!hasOpt(g, 'atk:'), 'A cannot attack');
  endTurn(g); toIdle(g); bp(g); ok(!hasOpt(g, 'atk:'), 'B cannot attack');
  endTurn(g); toIdle(g); ok(inZ(g, 0, 'st', "Nightmare's Steelcage"), 'still there on A next turn');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', "Nightmare's Steelcage"), 'gone after the second opponent turn');
});
T('Nimble Musasabi: 500 burn, may send 2 copies to the opponent field', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Nimble Musasabi'], deckTop: ['Nimble Musasabi', 'Nimble Musasabi'] }] });
  bp(g); atkOn(g, 0, W, 'Nimble Musasabi', 'Nimble Musasabi', 'Nimble Musasabi'); toIdle(g, 'Nimble Musasabi', 'Nimble Musasabi');
  const n = mons(g, 0).filter(c => E.name(c) === 'Nimble Musasabi');
  ok(lp(g, 0) === 7500 && n.length === 2 && n.every(c => c.pos === 'atk'), `A LP ${lp(g, 0)}, ${n.length} Musasabi on A field`);
  const g2 = duel({ board: [{ hand: [BEWD], m: ['Nimble Musasabi', W], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, BEWD).u), 'Musasabi cannot be one of the 2 Tributes');
});
T('Nitro Synchron: draws 1 when used for a Nitro Synchro', () => {
  const g = duel({ ex0: ['Nitro Warrior'], board: [{ hand: [], m: ['Nitro Synchron', 'Cyber Dragon'], turn: 2 }, {}] });
  const h = hand(g, 0); choose(g, 'Synchro Summon'); settle(g, 'Nitro Synchron', 'Cyber Dragon', 'Attack'); toIdle(g, 'Nitro Synchron', 'Attack');
  ok(!!on(g, 0, 'Nitro Warrior') && hand(g, 0) === h + 1, `drew 1 (${h} -> ${hand(g, 0)})`);
});
T('No Entry!!: all Attack Position monsters to Defense', () => {
  const g = duel({ board: [{ hand: [], m: [W], st: ['No Entry!!'], turn: 2 }, { m: [BEWD, CG] }] });
  act(g, 0, 'No Entry!!'); settle(g); toIdle(g);
  ok([on(g, 0, W), on(g, 1, BEWD), on(g, 1, CG)].every(c => c.pos === 'def'), 'all in Defense');
});
T('Noisy Gnat: discard to raise a Level by 1 until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Noisy Gnat'], m: [W], turn: 2 }, {}] });
  act(g, 0, 'Noisy Gnat'); settle(g, W); toIdle(g);
  ok(LV(on(g, 0, W)) === 5 && inZ(g, 0, 'gy', 'Noisy Gnat'), `Level ${LV(on(g, 0, W))}`);
  endTurn(g); ok(LV(on(g, 0, W)) === 4, 'back to 4');
});

console.log(fails ? `\n${fails} failed` : '\nAll batch 41 review checks passed.');
process.exit(fails ? 1 : 0);
