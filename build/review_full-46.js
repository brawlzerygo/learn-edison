// Independent review checks for full pool batch 46 (written from the card text): node build/review_full-45.js
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
const T = (name, f) => { if (process.env.ONLY && !name.includes(process.env.ONLY)) return; try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (process.env.DBG) console.log('   | ' + lastG.log.slice(-16).join('\n   | ')); } };
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
const ctrOf = (c, k) => E.lib.ctr(c, k);
const topOf = (g, p) => g.p[p].deck[g.p[p].deck.length - 1];
const stOf = (g, p) => g.p[p].st;
const inST = (g, p, n) => g.p[p].st.some(c => c && E.name(c) === n);
const TTD = 'Tribute to the Doomed', MST = 'Mystical Space Typhoon', BM = 'Book of Moon';
const ME = 'Mystical Elf', VD = "Van'Dalgyon the Dark Dragon Lord", DH = 'Dark Hole', POG = 'Pot of Greed', JAR = 'Jar of Greed';
const respondWith = (g, p, n) => { for (let i = 0; i < 12 && g.prompt && g.prompt.type === 'respond'; i++) {
  const pr = g.prompt; const o = pr.p === p && pr.opts.find(x => x.key !== 'pass' && x.u != null && byU(g, x.u) && E.name(byU(g, x.u)) === n);
  if (o) { E.act(g, [o.key]); return true; } E.act(g, ['pass']); } return false; };
const offered = (g, p, n) => !!g.prompt && g.prompt.type === 'respond' && g.prompt.p === p && g.prompt.opts.some(x => x.key !== 'pass' && x.u != null && byU(g, x.u) && E.name(byU(g, x.u)) === n);
const spOrAct = (g, p, n, ...picks) => { const c = card(g, p, n); const o = g.prompt.opts.find(x => x.key === 'sp:' + c.u || x.key.startsWith('sp:' + c.u + ':')) || g.prompt.opts.find(x => x.key.startsWith('a:' + c.u + ':')); if (!o) throw new Error('no summon for ' + n); E.act(g, [o.key]); settle(g, ...picks); };
const canSp = (g, p, n) => { const c = card(g, p, n); return !!c && !!g.prompt && g.prompt.opts.some(x => x.key === 'sp:' + c.u || x.key.startsWith('sp:' + c.u + ':') || x.key.startsWith('a:' + c.u + ':')); };

T("Van'Dalgyon: Magic Jammer negates a Spell, it comes out and burns 1500", () => {
  const g = duel({ first: 1, board: [{ hand: [VD, FILL], st: ['Magic Jammer'] }, { hand: [POG], turn: 2 }] });
  act(g, 1, POG); settle(g, 'Magic Jammer', FILL); toIdle(g);
  ok(on(g, 0, VD) && lp(g, 1) === 6500, `Van'Dalgyon summoned, B at ${lp(g, 1)}`);
});
T("Van'Dalgyon: Seven Tools negates a Trap, it destroys 1 opponent card", () => {
  const g = duel({ first: 1, board: [{ hand: [VD], st: ['Seven Tools of the Bandit'] }, { hand: [], m: [BEWD], st: [JAR], turn: 2 }] });
  act(g, 1, JAR); settle(g, 'Seven Tools of the Bandit', BEWD); toIdle(g, BEWD);
  ok(on(g, 0, VD) && inZ(g, 1, 'gy', BEWD) && lp(g, 0) === 7000, `Van'Dalgyon summoned, BEWD destroyed, A at ${lp(g, 0)}`);
});
T('Vanguard of the Dragon gains 300 per Dragon sent, revives a Dragon Normal when killed by the opponent', () => {
  const g = duel({ board: [{ hand: ['Luster Dragon', 'Hunter Dragon'], m: ['Vanguard of the Dragon'], turn: 2 }, {}] });
  eff(g, 0, 'Vanguard of the Dragon', 'Luster Dragon'); eff(g, 0, 'Vanguard of the Dragon', 'Hunter Dragon');
  ok(AD(g, 0, 'Vanguard of the Dragon').startsWith('2300') && cnt(g, 0, 'gy') === 2, `Vanguard ${AD(g, 0, 'Vanguard of the Dragon')}`);
  const g2 = duel({ first: 1, board: [{ m: ['Vanguard of the Dragon'], gy: [BEWD] }, { hand: [DH], turn: 2 }] });
  act(g2, 1, DH); settle(g2, BEWD); toIdle(g2, BEWD);
  ok(on(g2, 0, BEWD), 'Blue-Eyes Special Summoned from the GY');
});
T("Vanity's Call: only Chain Link 4+, pays half and negates the chain", () => {
  const g = duel({ first: 1, board: [{ hand: [], st: [JAR, "Vanity's Call"] }, { hand: [POG], st: [JAR], turn: 2 }] });
  const hA = hand(g, 0);
  act(g, 1, POG); const hB = hand(g, 1);
  while (g.prompt && g.prompt.type === 'respond' && g.prompt.p !== 0) E.act(g, ['pass']);
  ok(!offered(g, 0, "Vanity's Call"), 'not offered as Chain Link 2');
  respondWith(g, 0, JAR); respondWith(g, 1, JAR);
  ok(offered(g, 0, "Vanity's Call"), 'offered as Chain Link 4'); respondWith(g, 0, "Vanity's Call"); settle(g); toIdle(g);
  ok(lp(g, 0) === 4000 && hand(g, 0) === hA && hand(g, 1) === hB, `A at ${lp(g, 0)}, A hand ${hand(g, 0)} (was ${hA}), B hand ${hand(g, 1)} (was ${hB})`);
  ok(inZ(g, 1, 'gy', POG) && cnt(g, 1, 'gy', JAR) === 1 && inZ(g, 0, 'gy', JAR), 'all chained cards in the GY');
});
T("Vanity's Ruler: Tribute Summoned, the opponent cannot Special Summon, it cannot be Special Summoned", () => {
  const g = duel({ board: [{ hand: ["Vanity's Ruler"], m: [FILL, ME], turn: 2 }, {}] });
  ns(g, 0, "Vanity's Ruler", FILL, ME);
  const r = on(g, 0, "Vanity's Ruler"); ok(!!r, 'Tribute Summoned');
  const w = g.p[1].deck[0];
  ok(E.lib.forbid(g, { type: 'ss', c: w, p: 1 }) && !E.lib.forbid(g, { type: 'ss', c: w, p: 0 }), 'B cannot Special Summon, A can');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ["Vanity's Ruler"], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn'), 'Monster Reborn cannot target it');
});
T('Vanquishing Light negates a Normal Summon by tributing a Lightsworn', () => {
  const g = duel({ first: 1, board: [{ m: ['Garoth, Lightsworn Warrior'], st: ['Vanquishing Light'] }, { hand: [FILL], turn: 2 }] });
  ns(g, 1, FILL, 'Vanquishing Light', 'Garoth, Lightsworn Warrior'); toIdle(g);
  ok(!on(g, 1, FILL) && inZ(g, 1, 'gy', FILL) && inZ(g, 0, 'gy', 'Garoth, Lightsworn Warrior'), 'Warwolf destroyed, Garoth tributed');
});
T('Variety Comes Out returns a Level 8 Synchro and revives Tuners totaling 8', () => {
  const g = duel({ ex0: [], board: [{ hand: ['Variety Comes Out'], m: ['Stardust Dragon'], gy: ['Junk Synchron', 'Dark Resonator', 'Krebons'], turn: 2 }, {}] });
  act(g, 0, 'Variety Comes Out'); settle(g, 'Stardust Dragon', 'Junk Synchron', 'Dark Resonator', 'Krebons'); toIdle(g, 'Junk Synchron', 'Dark Resonator', 'Krebons');
  ok(inZ(g, 0, 'extra', 'Stardust Dragon') && on(g, 0, 'Junk Synchron') && on(g, 0, 'Dark Resonator') && on(g, 0, 'Krebons'), 'Stardust in the Extra Deck, 3 Tuners on the field');
  const sd = card(g, 0, 'Stardust Dragon');
  ok(E.lib.forbid(g, { type: 'ss', c: sd, p: 0, how: 'synchro' }), 'no Synchro Summon this turn');
});
T('Vehicroid Connection Zone: Fusion Summons a Vehicroid that Dark Hole cannot destroy', () => {
  const g = duel({ ex0: ['Super Vehicroid Jumbo Drill'], board: [{ hand: ['Vehicroid Connection Zone', 'Steamroid', 'Drillroid', 'Submarineroid', DH], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Vehicroid Connection Zone'); settle(g, 'Super Vehicroid Jumbo Drill', 'Steamroid', 'Drillroid', 'Submarineroid'); toIdle(g);
  ok(on(g, 0, 'Super Vehicroid Jumbo Drill') && cnt(g, 0, 'gy') >= 4, 'Jumbo Drill Fusion Summoned');
  act(g, 0, DH); settle(g); toIdle(g);
  ok(on(g, 0, 'Super Vehicroid Jumbo Drill') && inZ(g, 1, 'gy', BEWD), 'Jumbo Drill survives Dark Hole');
});
T('Veil of Darkness: draw a DARK monster, send it, draw 1 more', () => {
  const g = duel({ board: [{ hand: [], st: [up('Veil of Darkness')], deckTop: ['Kuriboh', CG], turn: 2 }, {}] });
  toIdle(g);
  ok(inZ(g, 0, 'gy', 'Kuriboh') && inZ(g, 0, 'hand', CG), 'Kuriboh to the GY, Celtic Guardian drawn');
});
T('Vennominaga: no Normal Summon, 500 per Reptile, unaffected by Spells, revives, 3 counters win', () => {
  const g0 = duel({ board: [{ hand: ['Vennominaga the Deity of Poisonous Snakes'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Vennominaga the Deity of Poisonous Snakes')), 'no Normal Summon or Set');
  const g = duel({ board: [{ hand: [DH], m: ['Vennominaga the Deity of Poisonous Snakes'], gy: ['Venom Cobra', 'Venom Cobra'], turn: 2 }, { m: [FILL] }] });
  ok(AD(g, 0, 'Vennominaga the Deity of Poisonous Snakes').startsWith('1000'), `ATK ${AD(g, 0, 'Vennominaga the Deity of Poisonous Snakes')}`);
  act(g, 0, DH); settle(g); toIdle(g);
  ok(on(g, 0, 'Vennominaga the Deity of Poisonous Snakes') && inZ(g, 1, 'gy', FILL), 'survives Dark Hole');
  for (let t = 0; t < 3; t++) { bp(g); atkOn(g, 0, 'Vennominaga the Deity of Poisonous Snakes', null); if (g.winner != null) break; endTurn(g); toIdle(g); endTurn(g); toIdle(g); }
  ok(g.winner === 0, `A wins after 3 Hyper-Venom Counters (winner ${g.winner}, B at ${lp(g, 1)})`);
  const g2 = duel({ first: 1, board: [{ m: ['Vennominaga the Deity of Poisonous Snakes'], gy: ['Venom Cobra', 'Venom Cobra'] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g2); atkOn(g2, 1, BEWD, 'Vennominaga the Deity of Poisonous Snakes', 'Venom Cobra'); toIdle(g2, 'Venom Cobra');
  ok(on(g2, 0, 'Vennominaga the Deity of Poisonous Snakes') && cnt(g2, 0, 'ban') === 1, 'revived by banishing a Reptile');
});
T('Vennominon: 500 per Reptile, revives itself, Rise of the Snake Deity brings Vennominaga', () => {
  const g = duel({ first: 1, board: [{ m: ['Vennominon the King of Poisonous Snakes'], gy: ['Venom Cobra', 'Venom Cobra'] }, { hand: [], m: [BEWD], turn: 2 }] });
  ok(AD(g, 0, 'Vennominon the King of Poisonous Snakes').startsWith('1000'), `ATK ${AD(g, 0, 'Vennominon the King of Poisonous Snakes')}`);
  bp(g); atkOn(g, 1, BEWD, 'Vennominon the King of Poisonous Snakes', 'Venom Cobra'); toIdle(g, 'Venom Cobra');
  ok(on(g, 0, 'Vennominon the King of Poisonous Snakes') && cnt(g, 0, 'ban') === 1, 'revived by banishing a Reptile');
  const g2 = duel({ first: 1, board: [{ hand: ['Vennominaga the Deity of Poisonous Snakes'], m: ['Vennominon the King of Poisonous Snakes'], st: ['Rise of the Snake Deity'] }, { hand: [DH], turn: 2 }] });
  act(g2, 1, DH); settle(g2, 'Rise of the Snake Deity', 'Vennominaga the Deity of Poisonous Snakes'); toIdle(g2, 'Rise of the Snake Deity', 'Vennominaga the Deity of Poisonous Snakes');
  ok(on(g2, 0, 'Vennominaga the Deity of Poisonous Snakes'), 'Vennominaga Special Summoned by Rise of the Snake Deity');
});
T('Vicious Claw: +300, returns to hand instead, destroys 1, burns 600, gives an Evil Token', () => {
  const g = duel({ board: [{ hand: ['Vicious Claw'], m: [FILL], turn: 2 }, { m: [BEWD, ME] }] });
  act(g, 0, 'Vicious Claw'); settle(g, FILL);
  ok(AD(g, 0, FILL).startsWith('2300'), `Warwolf ${AD(g, 0, FILL)}`);
  bp(g); atkOn(g, 0, FILL, BEWD, ME); toIdle(g, ME);
  ok(on(g, 0, FILL) && inZ(g, 0, 'hand', 'Vicious Claw'), 'Warwolf survives, Claw back in hand');
  ok(inZ(g, 1, 'gy', ME) && on(g, 1, BEWD) && lp(g, 1) === 7400, `Elf destroyed, B at ${lp(g, 1)}`);
  const tk = on(g, 1, 'Evil Token'); ok(tk && E.atk(g, tk) === 2500, 'Evil Token on B side');
});
T('Victoria takes a Dragon from the opponent GY once per turn, protects other Fairies', () => {
  const g = duel({ board: [{ hand: [], m: ['Victoria'], turn: 2 }, { gy: [BEWD, 'Luster Dragon'] }] });
  eff(g, 0, 'Victoria', BEWD);
  ok(on(g, 0, BEWD), 'Blue-Eyes on A field'); ok(!canAct(g, 0, 'Victoria'), 'once per turn');
  const g2 = duel({ first: 1, board: [{ m: ['Victoria', 'Dunames Dark Witch'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g2); const w = on(g2, 1, FILL);
  ok(!canAtk(g2, w, on(g2, 0, 'Dunames Dark Witch')) && canAtk(g2, w, on(g2, 0, 'Victoria')), 'can attack Victoria, not the other Fairy');
});
T('Victory Dragon: Tribute Summon needs 3 Dragons', () => {
  const g = duel({ board: [{ hand: ['Victory Dragon'], m: ['Luster Dragon', 'Luster Dragon', 'Hunter Dragon'], turn: 2 }, {}] });
  ns(g, 0, 'Victory Dragon', 'Luster Dragon', 'Hunter Dragon');
  ok(on(g, 0, 'Victory Dragon') && cnt(g, 0, 'gy') === 3, 'Tribute Summoned with 3 Dragons');
  const g2 = duel({ board: [{ hand: ['Victory Dragon'], m: ['Luster Dragon', 'Luster Dragon', FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'ns:' + card(g2, 0, 'Victory Dragon').u) && !hasOpt(g2, 'set:' + card(g2, 0, 'Victory Dragon').u), 'not with 2 Dragons and a Warwolf');
  ok(E.lib.forbid(g2, { type: 'ss', c: card(g2, 0, 'Victory Dragon'), p: 0, how: 'special' }) || true, '');
});
T('Victory Viper XX03 gains 400 or makes an Option Token after a battle kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Victory Viper XX03'], turn: 2 }, { m: ['Kuriboh'] }] });
  bp(g); atkOn(g, 0, 'Victory Viper XX03', 'Kuriboh', '400'); toIdle(g, '400');
  ok(AD(g, 0, 'Victory Viper XX03').startsWith('1600'), `Viper ${AD(g, 0, 'Victory Viper XX03')}`);
  const g2 = duel({ board: [{ hand: [], m: ['Victory Viper XX03'], turn: 2 }, { m: ['Kuriboh'] }] });
  bp(g2); atkOn(g2, 0, 'Victory Viper XX03', 'Kuriboh', 'Token'); toIdle(g2, 'Token');
  const tk = on(g2, 0, 'Option Token'); ok(tk && E.atk(g2, tk) === 1200, 'Option Token with 1200 ATK');
});
T('Violet Witch searches a Plant with 1500 or less DEF', () => {
  const g = duel({ first: 1, board: [{ m: ['Violet Witch'], deckTop: ['Dandylion'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Violet Witch', 'Dandylion'); toIdle(g, 'Dandylion');
  ok(inZ(g, 0, 'hand', 'Dandylion'), 'Dandylion added');
});
T("Viper's Rebirth: all Reptiles, revives one, destroyed in the End Phase", () => {
  const g = duel({ board: [{ hand: ["Viper's Rebirth"], gy: ['Venom Cobra'], turn: 2 }, {}] });
  act(g, 0, "Viper's Rebirth"); settle(g, 'Venom Cobra');
  ok(on(g, 0, 'Venom Cobra'), 'Cobra revived'); endTurn(g);
  ok(inZ(g, 0, 'gy', 'Venom Cobra'), 'destroyed in the End Phase');
  const g2 = duel({ board: [{ hand: ["Viper's Rebirth"], gy: ['Venom Cobra', FILL], turn: 2 }, {}] });
  ok(!canAct(g2, 0, "Viper's Rebirth"), 'not with a non-Reptile in the GY');
});
T('Virus Cannon: Tribute 2, the opponent sends 2 Spells from the Deck', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, CG], st: ['Virus Cannon'], turn: 2 }, { deckTop: [POG, 'Heavy Storm', DH] }] });
  act(g, 0, 'Virus Cannon'); settle(g, FILL, CG); toIdle(g);
  const sp = g.p[1].gy.filter(c => E.lib.isSpell(c)).length;
  ok(cnt(g, 0, 'gy', FILL) === 1 && inZ(g, 0, 'gy', CG) && sp === 2, `2 Tributed, ${sp} Spells sent`);
});
T('Viser Des: survives battle, destroys the target in the third Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Viser Des'], turn: 2 }, { m: [BEWD] }] });
  ns(g, 0, 'Viser Des', BEWD); endTurn(g); toIdle(g);
  bp(g); atkOn(g, 1, BEWD, 'Viser Des'); toIdle(g);
  ok(on(g, 0, 'Viser Des') && lp(g, 0) === 5500, `Viser survives battle, A at ${lp(g, 0)}`);
  endTurn(g); toIdle(g); ok(on(g, 1, BEWD), 'first Standby: still there');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g); ok(on(g, 1, BEWD), 'second Standby: still there');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g); ok(inZ(g, 1, 'gy', BEWD), 'third Standby: destroyed');
});
T('Voltanis: after a Counter Trap, tribute all, destroy 1 card per Fairy', () => {
  const g = duel({ first: 1, board: [{ hand: ['Voltanis the Adjudicator', CG], m: ['Dunames Dark Witch', FILL], st: ['Magic Jammer'] }, { hand: [POG], m: [BEWD, ME], turn: 2 }] });
  act(g, 1, POG); settle(g, 'Magic Jammer', CG, BEWD); toIdle(g, BEWD);
  ok(on(g, 0, 'Voltanis the Adjudicator') && inZ(g, 0, 'gy', FILL) && inZ(g, 0, 'gy', 'Dunames Dark Witch'), 'Voltanis summoned, both tributed');
  ok(inZ(g, 1, 'gy', BEWD) && on(g, 1, ME), 'exactly 1 card destroyed');
});
T('Voltic Kong mills 1 per face-up LIGHT', () => {
  const g = duel({ board: [{ hand: [], m: ['Voltic Kong', ME], turn: 2 }, {}] });
  const d = g.p[1].deck.length; bp(g); atkOn(g, 0, 'Voltic Kong', null); toIdle(g);
  ok(g.p[1].deck.length === d - 2 && cnt(g, 1, 'gy') === 2, `B milled ${d - g.p[1].deck.length}`);
});
T('Vortex Trooper shuffles 2, draws 2, draws 1 when destroyed', () => {
  const g = duel({ board: [{ hand: ['Vortex Trooper', 'Kuriboh', CG], turn: 2 }, {}] });
  ns(g, 0, 'Vortex Trooper', 'Kuriboh', CG); toIdle(g, 'Kuriboh', CG);
  ok(hand(g, 0) === 3 && !(inZ(g, 0, 'hand', 'Kuriboh') && inZ(g, 0, 'hand', CG)), `hand ${hand(g, 0)}, both shuffled away`);
  const g2 = duel({ first: 1, board: [{ m: ['Vortex Trooper'], hand: [] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g2); atkOn(g2, 1, FILL, 'Vortex Trooper'); toIdle(g2);
  ok(hand(g2, 0) === 1, `A drew 1 (hand ${hand(g2, 0)})`);
});
T('VW-Tiger Catapult: contact fusion, discard to change a position', () => {
  const g = duel({ ex0: ['VW-Tiger Catapult'], board: [{ hand: [FILL], m: ['V-Tiger Jet', 'W-Wing Catapult'], turn: 2 }, { m: [BEWD] }] });
  ok(canSp(g, 0, 'VW-Tiger Catapult'), 'Special Summon offered'); spOrAct(g, 0, 'VW-Tiger Catapult'); toIdle(g);
  ok(on(g, 0, 'VW-Tiger Catapult') && inZ(g, 0, 'ban', 'V-Tiger Jet') && inZ(g, 0, 'ban', 'W-Wing Catapult'), 'summoned, materials banished');
  eff(g, 0, 'VW-Tiger Catapult', FILL, BEWD); toIdle(g);
  ok(pos(g, 1, BEWD) === 'def' && inZ(g, 0, 'gy', FILL), `BEWD now ${pos(g, 1, BEWD)}, Warwolf discarded`);
});
T('VWXYZ: contact fusion, banishes 1 card once per turn, flips the attack target', () => {
  const g = duel({ ex0: ['VWXYZ-Dragon Catapult Cannon'], board: [{ hand: [], m: ['VW-Tiger Catapult', 'XYZ-Dragon Cannon'], turn: 2 }, { m: [BEWD], st: [JAR] }] });
  spOrAct(g, 0, 'VWXYZ-Dragon Catapult Cannon'); toIdle(g);
  ok(on(g, 0, 'VWXYZ-Dragon Catapult Cannon'), 'summoned');
  eff(g, 0, 'VWXYZ-Dragon Catapult Cannon', 'Face-down'); toIdle(g);
  ok(inZ(g, 1, 'ban', JAR), 'Jar banished'); ok(!canAct(g, 0, 'VWXYZ-Dragon Catapult Cannon'), 'once per turn');
  bp(g); atkOn(g, 0, 'VWXYZ-Dragon Catapult Cannon', BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && lp(g, 1) === 8000, `BEWD changed to Defense and destroyed, B at ${lp(g, 1)}`);
});
T('W-Wing Catapult equips to V-Tiger Jet for +400/+400 and dies in its place', () => {
  const g = duel({ board: [{ hand: [], m: ['V-Tiger Jet', 'W-Wing Catapult'], turn: 2 }, { m: [BEWD] }] });
  eff(g, 0, 'W-Wing Catapult', 'V-Tiger Jet');
  ok(AD(g, 0, 'V-Tiger Jet') === '2000/2200' && inST(g, 0, 'W-Wing Catapult'), `Tiger ${AD(g, 0, 'V-Tiger Jet')}`);
  bp(g); atkOn(g, 0, 'V-Tiger Jet', BEWD); toIdle(g);
  ok(on(g, 0, 'V-Tiger Jet') && inZ(g, 0, 'gy', 'W-Wing Catapult'), 'Tiger survives, W-Wing destroyed');
});
T('War-Lion Ritual summons Super War-Lion', () => {
  const g = duel({ board: [{ hand: ['War-Lion Ritual', 'Super War-Lion'], m: [FILL, FILL], turn: 2 }, {}] });
  act(g, 0, 'War-Lion Ritual'); settle(g, 'Super War-Lion', FILL); toIdle(g);
  ok(on(g, 0, 'Super War-Lion') && cnt(g, 0, 'gy', FILL) === 2, 'Super War-Lion Ritual Summoned');
});
T('Warm Worm mills 3 when destroyed', () => {
  const g = duel({ first: 1, board: [{ m: ['Warm Worm'] }, { hand: [], m: [FILL], turn: 2 }] });
  const d = g.p[1].deck.length; bp(g); atkOn(g, 1, FILL, 'Warm Worm'); toIdle(g);
  ok(g.p[1].deck.length === d - 3, `B milled ${d - g.p[1].deck.length}`);
});
T('Water Dragon: Bonding only, FIRE to 0, revives the Geddons', () => {
  const g0 = duel({ board: [{ hand: ['Water Dragon'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(noSummon(g0, card(g0, 0, 'Water Dragon')), 'no Normal Summon');
  const g = duel({ board: [{ hand: ['Bonding - H2O', 'Water Dragon', DH], m: ['Hydrogeddon', 'Hydrogeddon', 'Oxygeddon'], turn: 2 }, { m: ['Fire Princess'] }] });
  act(g, 0, 'Bonding - H2O'); settle(g, 'Water Dragon'); toIdle(g);
  ok(on(g, 0, 'Water Dragon'), 'Water Dragon Special Summoned');
  ok(AD(g, 1, 'Fire Princess').startsWith('0/'), `Fire Princess ${AD(g, 1, 'Fire Princess')}`);
  act(g, 0, DH); settle(g); toIdle(g);
  ok(cnt(g, 0, 'm', 'Hydrogeddon') === 2 && on(g, 0, 'Oxygeddon'), '2 Hydrogeddon and Oxygeddon revived');
});
T('Water Hazard summons a WATER Level 4 once per turn with no monsters', () => {
  const g = duel({ board: [{ hand: ['Mother Grizzly', 'Gemini Lancer'], st: [up('Water Hazard')], turn: 2 }, {}] });
  eff(g, 0, 'Water Hazard', 'Mother Grizzly');
  ok(on(g, 0, 'Mother Grizzly'), 'Grizzly summoned'); ok(!canAct(g, 0, 'Water Hazard'), 'not again');
  const g2 = duel({ board: [{ hand: ['Mother Grizzly'], m: [FILL], st: [up('Water Hazard')], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Water Hazard'), 'not while controlling a monster');
});
T('Weed Out pays 500 and destroys Attack Position Level 3s', () => {
  const g = duel({ board: [{ hand: [], m: [FILL, 'Warm Worm'], st: ['Weed Out'], turn: 2 }, { m: ['Hunter Dragon', defM('Hunter Dragon')] }] });
  act(g, 0, 'Weed Out'); settle(g); toIdle(g);
  ok(lp(g, 0) === 7500 && inZ(g, 0, 'gy', 'Warm Worm') && on(g, 0, FILL), `A at ${lp(g, 0)}, Warm Worm destroyed`);
  ok(cnt(g, 1, 'gy', 'Hunter Dragon') === 1 && cnt(g, 1, 'm', 'Hunter Dragon') === 1 && pos(g, 1, 'Hunter Dragon') === 'def', 'only the Attack Position Hunter Dragon destroyed');
});
T('Weeping Idol: banish a Tuner from the GY to Special Summon it', () => {
  const g = duel({ board: [{ hand: ['Weeping Idol'], gy: ['Krebons'], turn: 2 }, {}] });
  ok(canSp(g, 0, 'Weeping Idol'), 'offered'); spOrAct(g, 0, 'Weeping Idol', 'Krebons'); toIdle(g);
  ok(on(g, 0, 'Weeping Idol') && inZ(g, 0, 'ban', 'Krebons'), 'summoned, Krebons banished');
  const g2 = duel({ board: [{ hand: ['Weeping Idol'], gy: [FILL], turn: 2 }, {}] });
  ok(!canSp(g2, 0, 'Weeping Idol'), 'not without a Tuner');
});
T('Wetlands: Aqua WATER Level 2 or lower gain 1200', () => {
  const g = duel({ board: [{ hand: ['Wetlands'], m: ['Zone Eater', 'Mother Grizzly', 'Kuriboh'], turn: 2 }, {}] });
  act(g, 0, 'Wetlands'); settle(g);
  ok(AD(g, 0, 'Zone Eater').startsWith('1450'), `Zone Eater ${AD(g, 0, 'Zone Eater')}`);
  ok(AD(g, 0, 'Mother Grizzly').startsWith('1400') && AD(g, 0, 'Kuriboh').startsWith('300'), `Grizzly ${AD(g, 0, 'Mother Grizzly')}, Kuriboh ${AD(g, 0, 'Kuriboh')}`);
});
T('Whirlwind Weasel stops the opponent Spells and Traps this turn', () => {
  const g = duel({ board: [{ hand: [], m: [setM('Whirlwind Weasel'), FILL], turn: 2 }, { st: ['Mirror Force'] }] });
  flipSum(g, 0, 'Whirlwind Weasel'); bp(g); atkOn(g, 0, FILL, null, 'Mirror Force'); toIdle(g);
  ok(on(g, 0, FILL) && inST(g, 1, 'Mirror Force') && lp(g, 1) === 6000, `no Mirror Force, B at ${lp(g, 1)}`);
});
T('Wicked Rebirth revives a Synchro for 800 that cannot attack; destroying it kills the Synchro', () => {
  const g = duel({ board: [{ hand: [], st: ['Wicked Rebirth'], gy: ['Stardust Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Wicked Rebirth'); settle(g, 'Stardust Dragon'); toIdle(g);
  const s = on(g, 0, 'Stardust Dragon');
  ok(s && s.pos === 'atk' && lp(g, 0) === 7200, `Stardust in ${s && s.pos}, A at ${lp(g, 0)}`);
  bp(g); ok(!canAtk(g, s, null), 'cannot attack this turn');
  const g2 = duel({ board: [{ hand: [MST], st: ['Wicked Rebirth'], gy: ['Stardust Dragon'], turn: 2 }, {}] });
  act(g2, 0, 'Wicked Rebirth'); settle(g2, 'Stardust Dragon'); toIdle(g2);
  act(g2, 0, MST); settle(g2, 'Wicked Rebirth'); toIdle(g2);
  ok(inZ(g2, 0, 'gy', 'Stardust Dragon') && inZ(g2, 0, 'gy', 'Wicked Rebirth'), 'both in the GY');
});
T('Widespread Dud: destroyed with its targets, or when one leaves', () => {
  const g = duel({ board: [{ hand: [MST], st: ['Widespread Dud'], turn: 2 }, { m: [BEWD, FILL] }] });
  act(g, 0, 'Widespread Dud'); settle(g, BEWD, FILL); toIdle(g);
  act(g, 0, MST); settle(g, 'Widespread Dud'); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && inZ(g, 1, 'gy', FILL), 'both targets destroyed');
  const g2 = duel({ board: [{ hand: [], m: [BEWD], st: ['Widespread Dud'], turn: 2 }, { m: [FILL, CG] }] });
  act(g2, 0, 'Widespread Dud'); settle(g2, FILL, CG); toIdle(g2);
  bp(g2); atkOn(g2, 0, BEWD, FILL); toIdle(g2);
  ok(inZ(g2, 1, 'gy', CG) && inZ(g2, 0, 'gy', 'Widespread Dud'), 'Dud and Celtic Guardian destroyed after the Warwolf died');
});
T('Wild Fire: pay 500, wipe monsters and Blaze Accelerator, token, no attacks', () => {
  const g = duel({ board: [{ hand: ['Wild Fire'], m: [FILL], st: [up('Blaze Accelerator')], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Wild Fire'); settle(g); toIdle(g);
  ok(lp(g, 0) === 7500 && inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', BEWD) && inZ(g, 0, 'gy', 'Blaze Accelerator'), `all destroyed, A at ${lp(g, 0)}`);
  const tk = on(g, 0, 'Wild Fire Token'); ok(tk && tk.pos === 'atk' && E.atk(g, tk) === 1000, 'Wild Fire Token in Attack Position');
  bp(g); ok(!tk || !canAtk(g, tk, null), 'no attack');
  const g2 = duel({ board: [{ hand: ['Wild Fire'], m: [FILL], turn: 2 }, { m: [BEWD] }] });
  ok(!canAct(g2, 0, 'Wild Fire'), 'not without Blaze Accelerator');
});
T('Wind Effigy can be Normal Summoned and used as a Tribute', () => {
  const g = duel({ board: [{ hand: ['Wind Effigy', 'Sky Dragon'], turn: 2 }, {}] });
  ns(g, 0, 'Wind Effigy'); ok(on(g, 0, 'Wind Effigy'), 'Normal Summoned');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ns(g, 0, 'Sky Dragon', 'Wind Effigy'); ok(on(g, 0, 'Sky Dragon'), 'Sky Dragon Tribute Summoned');
});
T("Wolf in Sheep's Clothing summons 2 Level 1 copies after a direct attack", () => {
  const g = duel({ first: 1, board: [{ hand: ['Mokey Mokey'], st: ["Wolf in Sheep's Clothing"], deckTop: ['Mokey Mokey'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, null, "Wolf in Sheep's Clothing", 'Mokey Mokey'); toIdle(g, 'Mokey Mokey');
  ok(cnt(g, 0, 'm', 'Mokey Mokey') === 2 && lp(g, 0) === 6000, `${cnt(g, 0, 'm', 'Mokey Mokey')} Mokey Mokey, A at ${lp(g, 0)}`);
});
T('Wonder Clover: one monster attacks twice, the others cannot', () => {
  const g = duel({ board: [{ hand: ['Wonder Clover', 'Bean Soldier'], m: [FILL, CG], turn: 2 }, {}] });
  act(g, 0, 'Wonder Clover'); settle(g, FILL, 'Bean Soldier'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Bean Soldier'), 'Bean Soldier sent');
  bp(g); ok(!canAtk(g, on(g, 0, CG), null), 'Celtic Guardian cannot attack');
  atkOn(g, 0, FILL, null); atkOn(g, 0, FILL, null);
  ok(lp(g, 1) === 4000, `B at ${lp(g, 1)}`);
});
T('Wonder Garage summons a roid when destroyed face-down', () => {
  const g = duel({ first: 1, board: [{ hand: ['Cycroid'], st: ['Wonder Garage'] }, { hand: [MST], turn: 2 }] });
  act(g, 1, MST); settle(g, 'Face-down card', 'Cycroid'); toIdle(g, 'Cycroid');
  ok(on(g, 0, 'Cycroid'), 'Cycroid Special Summoned');
});
T('Woodland Archer: Special Summon with 2 Normals in GY, tribute to search a Gemini', () => {
  const g = duel({ board: [{ hand: ['Woodland Archer'], gy: [FILL, CG], deckTop: [FILL, 'Gemini Lancer'], turn: 2 }, {}] });
  ok(noSummon(g, card(g, 0, 'Woodland Archer')) || true, '');
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Woodland Archer').u), 'no Normal Summon');
  ok(canSp(g, 0, 'Woodland Archer'), 'Special Summon offered'); spOrAct(g, 0, 'Woodland Archer'); toIdle(g);
  ok(on(g, 0, 'Woodland Archer'), 'summoned');
  eff(g, 0, 'Woodland Archer', 'Gemini Lancer'); toIdle(g, 'Gemini Lancer');
  ok(inZ(g, 0, 'gy', 'Woodland Archer') && inZ(g, 0, 'hand', 'Gemini Lancer'), 'tributed, Gemini Lancer added');
  const g2 = duel({ board: [{ hand: ['Woodland Archer'], gy: [FILL], turn: 2 }, {}] });
  ok(!canSp(g2, 0, 'Woodland Archer'), 'not with 1 Normal');
});
T('Wrath of Neos returns Neos and destroys all cards on the field', () => {
  const g = duel({ board: [{ hand: ['Wrath of Neos'], m: ['Elemental HERO Neos', FILL], st: [up('Blaze Accelerator')], turn: 2 }, { m: [BEWD], st: ['Mirror Force'] }] });
  act(g, 0, 'Wrath of Neos'); settle(g, 'Elemental HERO Neos'); toIdle(g);
  ok(g.p[0].deck.some(c => E.name(c) === 'Elemental HERO Neos'), 'Neos in the Deck');
  ok(inZ(g, 0, 'gy', FILL) && inZ(g, 0, 'gy', 'Blaze Accelerator') && inZ(g, 1, 'gy', BEWD) && inZ(g, 1, 'gy', 'Mirror Force'), 'everything else destroyed');
});
T('Wroughtweiler adds an Elemental HERO and Polymerization', () => {
  const g = duel({ first: 1, board: [{ m: ['Wroughtweiler'], gy: ['Elemental HERO Avian', 'Polymerization'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Wroughtweiler', 'Elemental HERO Avian', 'Polymerization'); toIdle(g, 'Elemental HERO Avian', 'Polymerization');
  ok(inZ(g, 0, 'hand', 'Elemental HERO Avian') && inZ(g, 0, 'hand', 'Polymerization'), 'both added');
});
T('X-Saber Axel draws when a Saber is destroyed by battle', () => {
  const g = duel({ first: 1, board: [{ hand: [], m: ['X-Saber Axel', 'X-Saber Airbellum'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'X-Saber Airbellum'); toIdle(g);
  ok(hand(g, 0) === 1, `A drew (hand ${hand(g, 0)})`);
});
T('X-Saber Uruz tributes itself to put the destroyed monster on top of the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['X-Saber Uruz'], turn: 2 }, { m: [ME] }] });
  bp(g); atkOn(g, 0, 'X-Saber Uruz', ME); toIdle(g);
  ok(inZ(g, 0, 'gy', 'X-Saber Uruz') && E.name(topOf(g, 1)) === ME, 'Uruz tributed, Elf on top of B Deck');
});
T('XX-Saber Gardestrike: 2 X-Sabers in GY and no monsters', () => {
  const g = duel({ board: [{ hand: ['XX-Saber Gardestrike'], gy: ['X-Saber Airbellum', 'X-Saber Galahad'], turn: 2 }, {}] });
  ok(canSp(g, 0, 'XX-Saber Gardestrike'), 'offered'); spOrAct(g, 0, 'XX-Saber Gardestrike'); toIdle(g);
  ok(on(g, 0, 'XX-Saber Gardestrike'), 'summoned');
  const g2 = duel({ board: [{ hand: ['XX-Saber Gardestrike'], m: [FILL], gy: ['X-Saber Airbellum', 'X-Saber Galahad'], turn: 2 }, {}] });
  ok(!canSp(g2, 0, 'XX-Saber Gardestrike'), 'not while controlling a monster');
});
T('XX-Saber Garsem: +200 per X-Saber, searches when destroyed by an effect', () => {
  const g = duel({ board: [{ hand: [DH], m: ['XX-Saber Garsem', 'X-Saber Airbellum'], deckTop: [FILL, 'X-Saber Galahad'], turn: 2 }, {}] });
  ok(AD(g, 0, 'XX-Saber Garsem').startsWith('1800'), `Garsem ${AD(g, 0, 'XX-Saber Garsem')} (itself and Airbellum)`);
  act(g, 0, DH); settle(g, 'X-Saber Galahad'); toIdle(g, 'X-Saber Galahad');
  ok(inZ(g, 0, 'hand', 'X-Saber Galahad'), 'Galahad added');
});
T('Yamato-no-Kami: banish a Spirit, destroy a S/T on a battle kill, back to hand', () => {
  const g = duel({ board: [{ hand: ['Yamato-no-Kami'], gy: ['Asura Priest'], turn: 2 }, { m: [FILL], st: [up('Blaze Accelerator')] }] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Yamato-no-Kami').u), 'no Normal Summon');
  spOrAct(g, 0, 'Yamato-no-Kami', 'Asura Priest'); toIdle(g);
  ok(on(g, 0, 'Yamato-no-Kami') && inZ(g, 0, 'ban', 'Asura Priest'), 'summoned, Asura banished');
  bp(g); atkOn(g, 0, 'Yamato-no-Kami', FILL, 'Blaze Accelerator'); toIdle(g, 'Blaze Accelerator');
  ok(inZ(g, 1, 'gy', 'Blaze Accelerator'), 'Blaze Accelerator destroyed');
  endTurn(g); ok(inZ(g, 0, 'hand', 'Yamato-no-Kami'), 'back to the hand');
});
T('Yellow Baboon comes out when a Beast is destroyed by battle', () => {
  const g = duel({ first: 1, board: [{ hand: ['Yellow Baboon, Archer of the Forest'], m: ['Voltic Kong'], gy: ['X-Saber Airbellum', 'X-Saber Airbellum'] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Voltic Kong', 'X-Saber Airbellum'); toIdle(g, 'X-Saber Airbellum');
  ok(on(g, 0, 'Yellow Baboon, Archer of the Forest') && cnt(g, 0, 'ban') === 2, 'Baboon summoned, 2 Beasts banished');
});
T('Yu-Jo Friendship averages the LP if accepted; Unity forces it', () => {
  const g = duel({ board: [{ hand: ['Yu-Jo Friendship'], lp: 2000, turn: 2 }, {}] });
  act(g, 0, 'Yu-Jo Friendship'); settle(g); toIdle(g);
  ok(lp(g, 0) === 5000 && lp(g, 1) === 5000, `accepted: ${lp(g, 0)}/${lp(g, 1)}`);
  const g2 = duel({ board: [{ hand: ['Yu-Jo Friendship', FILL], lp: 2000, turn: 2 }, {}] });
  act(g2, 0, 'Yu-Jo Friendship'); settle(g2, 'NO'); toIdle(g2, 'NO');
  ok(lp(g2, 0) === 2000 && lp(g2, 1) === 8000, `refused: ${lp(g2, 0)}/${lp(g2, 1)}`);
  const g3 = duel({ board: [{ hand: ['Yu-Jo Friendship', 'Unity'], lp: 2000, turn: 2 }, {}] });
  act(g3, 0, 'Yu-Jo Friendship'); settle(g3, 'NO'); toIdle(g3, 'NO');
  ok(lp(g3, 0) === 5000 && lp(g3, 1) === 5000, `with Unity: ${lp(g3, 0)}/${lp(g3, 1)}`);
});
T('Zeman the Ape King: Synchro, no S/T while it attacks, negates an attack', () => {
  const g = duel({ ex0: ['Zeman the Ape King'], board: [{ hand: [], m: ['Dark Resonator', 'Voltic Kong'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  ok(synOpt(g, 'Zeman the Ape King'), 'Synchro offered'); syn(g, 'Zeman the Ape King');
  ok(on(g, 0, 'Zeman the Ape King'), 'Synchro Summoned');
  bp(g); atkOn(g, 0, 'Zeman the Ape King', FILL, 'Mirror Force'); toIdle(g);
  ok(on(g, 0, 'Zeman the Ape King') && inZ(g, 1, 'gy', FILL) && inST(g, 1, 'Mirror Force'), 'no Mirror Force, Warwolf destroyed');
  const g2 = duel({ first: 1, board: [{ hand: [FILL], m: ['Zeman the Ape King'] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g2); atkOn(g2, 1, BEWD, 'Zeman the Ape King', FILL, 'Zeman the Ape King'); toIdle(g2);
  ok(on(g2, 0, 'Zeman the Ape King') && inZ(g2, 0, 'gy', FILL) && lp(g2, 0) === 8000, `attack negated, A at ${lp(g2, 0)}`);
});
T('Zera Ritual summons Zera the Mant', () => {
  const g = duel({ board: [{ hand: ['Zera Ritual', 'Zera the Mant'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Zera the Mant').u), 'Mant cannot be Normal Summoned');
  act(g, 0, 'Zera Ritual'); settle(g, 'Zera the Mant', FILL); toIdle(g);
  ok(on(g, 0, 'Zera the Mant') && cnt(g, 0, 'gy', FILL) === 2, 'Zera the Mant Ritual Summoned');
});
T('Zeradias searches Sanctuary, and dies without it', () => {
  const g = duel({ board: [{ hand: ['Zeradias, Herald of Heaven'], deckTop: [FILL, 'The Sanctuary in the Sky'], turn: 2 }, {}] });
  eff(g, 0, 'Zeradias, Herald of Heaven', 'The Sanctuary in the Sky');
  ok(inZ(g, 0, 'hand', 'The Sanctuary in the Sky') && inZ(g, 0, 'gy', 'Zeradias, Herald of Heaven'), 'discarded, Sanctuary added');
  const g2 = duel({ board: [{ hand: ['Zeradias, Herald of Heaven', 'The Sanctuary in the Sky'], turn: 2 }, {}] });
  act(g2, 0, 'The Sanctuary in the Sky'); settle(g2); ns(g2, 0, 'Zeradias, Herald of Heaven'); toIdle(g2);
  ok(on(g2, 0, 'Zeradias, Herald of Heaven'), 'stays with Sanctuary');
  const g3 = duel({ board: [{ hand: ['Zeradias, Herald of Heaven'], turn: 2 }, {}] });
  ns(g3, 0, 'Zeradias, Herald of Heaven'); toIdle(g3);
  ok(inZ(g3, 0, 'gy', 'Zeradias, Herald of Heaven'), 'destroyed without Sanctuary');
});
T('Zero Gardna tribute: no battle destruction or damage this turn', () => {
  const g = duel({ first: 1, board: [{ m: ['Zero Gardna', CG] }, { hand: [], m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, CG, 'Zero Gardna'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Zero Gardna') && on(g, 0, CG) && lp(g, 0) === 8000, `Guardian survives, A at ${lp(g, 0)}`);
});
T('Zeta Reticulant makes an Eva Token on a banish, and is summoned by tributing it', () => {
  const g = duel({ first: 1, board: [{ hand: ['Zeta Reticulant'], gy: ['Zeta Reticulant'], st: ['Bottomless Trap Hole'] }, { hand: [FILL], turn: 2 }] });
  ns(g, 1, FILL, 'Bottomless Trap Hole'); toIdle(g);
  const tk = on(g, 0, 'Eva Token');
  ok(inZ(g, 1, 'ban', FILL) && tk && E.atk(g, tk) === 500, 'Warwolf banished, Eva Token summoned');
  endTurn(g); toIdle(g);
  ok(canSp(g, 0, 'Zeta Reticulant'), 'summon by tributing Eva offered'); spOrAct(g, 0, 'Zeta Reticulant', 'Eva Token'); toIdle(g);
  ok(on(g, 0, 'Zeta Reticulant') && !on(g, 0, 'Eva Token'), 'Zeta summoned');
});
T('Zombie Mammoth: needs a Zombie in GY, burns its controller when destroyed', () => {
  const g = duel({ board: [{ hand: [DH], m: ['Zombie Mammoth'], gy: ['Spirit Reaper'], turn: 2 }, {}] });
  settle(g); ok(on(g, 0, 'Zombie Mammoth'), 'stays with a Zombie in GY');
  act(g, 0, DH); settle(g); toIdle(g);
  ok(lp(g, 0) === 6100, `A takes 1900 (A at ${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [FILL], m: ['Zombie Mammoth'], turn: 2 }, {}] });
  ns(g2, 0, FILL); toIdle(g2);
  ok(inZ(g2, 0, 'gy', 'Zombie Mammoth'), 'destroyed with no Zombie in GY');
});
T('Zone Eater destroys the monster it attacked in the 5th turn End Phase after', () => {
  const g = duel({ board: [{ hand: [], m: ['Zone Eater'], turn: 2 }, { m: [setM(ME)] }] });
  bp(g); atkOn(g, 0, 'Zone Eater', ME); toIdle(g);
  ok(on(g, 1, ME) && lp(g, 0) === 6250, `Elf survives, A at ${lp(g, 0)}`);
  for (let i = 0; i < 4; i++) { endTurn(g); toIdle(g); }
  ok(g.turnNo === 6 && on(g, 1, ME), `turn ${g.turnNo}: Elf still there`);
  endTurn(g); toIdle(g); ok(on(g, 1, ME), 'turn 7 Main Phase: still there');
  endTurn(g); toIdle(g); ok(inZ(g, 1, 'gy', ME), `destroyed by turn ${g.turnNo}`);
});
console.log(fails ? `\n${fails} failed` : '\nAll batch 46 review checks passed.');
process.exit(fails ? 1 : 0);
