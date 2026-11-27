// Independent review checks for full pool batch 37 (written from the card text): node build/review_full-37.js
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
// counters added by hand after the prompt was built: change a dummy monster's position so the options are rebuilt
const reprompt = g => choose(g, 'pos:' + g.p[0].m.find(c => c && E.name(c) === CG).u);
const ctrOf = (c, k) => E.lib.ctr(c, k);
const topOf = (g, p) => g.p[p].deck[g.p[p].deck.length - 1];
const AS = 'Archfiend Soldier';

T('Darklord Nurse Reficule: opponent LP gain becomes damage', () => {
  const g = duel({ first: 1, board: [{ m: ['Darklord Nurse Reficule'] }, { hand: ['Dian Keto the Cure Master'], turn: 2 }] });
  act(g, 1, 'Dian Keto the Cure Master'); settle(g); toIdle(g);
  ok(lp(g, 1) === 7000, `B took 1000 instead of gaining (${lp(g, 1)})`);
});
T('Darknight Parshath: +100 per DARK in GY, banish a DARK to draw after a battle kill', () => {
  const g = duel({ board: [{ m: ['Darknight Parshath'], gy: [AS, 'Sangan'], turn: 2 }, { m: [CG] }] });
  ok(E.atk(g, on(g, 0, 'Darknight Parshath')) === 2100, AD(g, 0, 'Darknight Parshath'));
  const h = hand(g, 0); bp(g); atkOn(g, 0, 'Darknight Parshath', CG, AS); toIdle(g, AS);
  ok(inZ(g, 1, 'gy', CG) && hand(g, 0) === h + 1 && cnt(g, 0, 'ban') === 1, `CG destroyed, drew 1 (hand ${hand(g, 0)}), banished ${cnt(g, 0, 'ban')}`);
});
T('Darksea Float: destroyed by a card effect, owner draws 1', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Darksea Float'], turn: 2 }, { m: [CG] }] });
  const h = hand(g, 0); act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Darksea Float') && hand(g, 0) === h, `Float in GY, drew 1 (hand ${h} to ${hand(g, 0)})`);
});
T('Darksea Rescue: used as Synchro Material, owner draws 1', () => {
  const g = duel({ ex0: ['Armory Arm'], board: [{ m: ['Junk Synchron', 'Darksea Rescue'], turn: 2 }, {}] });
  const h = hand(g, 0); syn(g, 'Armory Arm', 'Junk Synchron', 'Darksea Rescue', 'Attack');
  ok(on(g, 0, 'Armory Arm') && hand(g, 0) === h + 1, `Armory Arm summoned, drew 1 (hand ${hand(g, 0)})`);
});
T('Dawnbreak Gardna: DEF 2300 after Gemini Summon', () => {
  const g = duel({ board: [{ m: ['Dawnbreak Gardna'], turn: 2 }, {}] });
  ok(E.def(g, on(g, 0, 'Dawnbreak Gardna')) === 500, 'DEF 500 as a Normal Monster');
  gem(g, 0, 'Dawnbreak Gardna');
  ok(E.def(g, on(g, 0, 'Dawnbreak Gardna')) === 2300, AD(g, 0, 'Dawnbreak Gardna'));
});
T('Deck Lockdown: no searches, no Special Summons from the Deck, gone on 2nd Standby', () => {
  const g = duel({ board: [{ hand: ['Deck Lockdown'], turn: 2 }, {}] });
  act(g, 0, 'Deck Lockdown'); settle(g); toIdle(g);
  const dc = g.p[1].deck[0];
  ok(E.lib.forbid(g, { type: 'search', p: 0 }) && E.lib.forbid(g, { type: 'search', p: 1 }), 'neither player can search');
  ok(E.lib.forbid(g, { type: 'ss', c: dc, p: 1, how: 'special' }), 'no Special Summon from the Deck');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(stOf(g, 0).some(c => c && E.name(c) === 'Deck Lockdown'), 'still there after the 1st Standby Phase');
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Deck Lockdown'), 'destroyed on the 2nd Standby Phase');
});
function stOf(g, p) { return g.p[p].st; }
T('Decoy Dragon: attacked, summons a Level 7+ Dragon from GY and redirects', () => {
  const g = duel({ first: 1, board: [{ m: ['Decoy Dragon'], gy: [BEWD] }, { m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Decoy Dragon', 'Decoy Dragon', BEWD, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, BEWD) && on(g, 0, 'Decoy Dragon') && inZ(g, 1, 'gy', FILL) && lp(g, 1) === 7000, `BEWD summoned and fought (B LP ${lp(g, 1)})`);
});
T('Decoyroid: opponent can only attack Decoyroid', () => {
  const g = duel({ first: 1, board: [{ m: ['Decoyroid', CG] }, { m: [FILL], turn: 2 }] });
  bp(g); const a = on(g, 1, FILL);
  ok(!canAtk(g, a, on(g, 0, CG)) && canAtk(g, a, on(g, 0, 'Decoyroid')), 'only Decoyroid can be attacked');
});
T('Deep Diver: destroyed by battle, put a monster from Deck on top at end of BP', () => {
  const g = duel({ first: 1, board: [{ m: ['Deep Diver'], deckTop: [CG, BEWD] }, { m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Deep Diver'); toIdle(g);
  E.act(g, ['endbp']); settle(g, 'Deep Diver', BEWD); toIdle(g, 'Deep Diver', BEWD);
  ok(E.name(topOf(g, 0)) === BEWD, `top of A Deck is ${E.name(topOf(g, 0))}`);
});
T('Defender, the Magical Knight: counter on Normal Summon, removes it to save a Spellcaster', () => {
  const g = duel({ board: [{ hand: ['Defender, the Magical Knight', 'Dark Hole'], m: [CG], turn: 2 }, { m: [FILL] }] });
  ns(g, 0, 'Defender, the Magical Knight'); toIdle(g);
  const d = on(g, 0, 'Defender, the Magical Knight'); ok(d && ctrOf(d, 'spell') === 1, 'Spell Counter placed');
  act(g, 0, 'Dark Hole'); settle(g, 'Defender'); toIdle(g, 'Defender');
  const d2 = on(g, 0, 'Defender, the Magical Knight');
  ok(d2 && ctrOf(d2, 'spell') === 0 && inZ(g, 0, 'gy', CG) && inZ(g, 1, 'gy', FILL), 'Defender survived by removing its counter');
});
T('Defense Draw: no battle damage and draw 1', () => {
  const g = duel({ first: 1, board: [{ st: ['Defense Draw'] }, { m: [FILL], turn: 2 }] });
  const h = hand(g, 0); bp(g); atkOn(g, 1, FILL, null, 'Defense Draw'); toIdle(g);
  ok(lp(g, 0) === 8000 && hand(g, 0) === h + 1, `A LP ${lp(g, 0)}, hand ${h} to ${hand(g, 0)}`);
});
T('Defensive Tactics: with a Gladiator Beast, no battle destruction or damage; goes to Deck bottom', () => {
  const g = duel({ first: 1, board: [{ m: ['Gladiator Beast Bestiari'], st: ['Defensive Tactics'] }, { m: [BEWD], turn: 2 }] });
  bp(g); atkOn(g, 1, BEWD, 'Gladiator Beast Bestiari', 'Defensive Tactics'); toIdle(g);
  ok(on(g, 0, 'Gladiator Beast Bestiari') && lp(g, 0) === 8000, `Bestiari survived, A LP ${lp(g, 0)}`);
  ok(E.name(g.p[0].deck[0]) === 'Defensive Tactics', 'Defensive Tactics at the bottom of the Deck');
});
T('Degenerate Circuit: pay 500 each Standby; bounced monsters are banished', () => {
  const g = duel({ board: [{ m: [setM('Penguin Soldier')], st: [up('Degenerate Circuit')], turn: 2 }, { m: [FILL] }] });
  toIdle(g); ok(lp(g, 0) === 7500, `paid 500 (${lp(g, 0)})`);
  flipSum(g, 0, 'Penguin Soldier', FILL); toIdle(g, FILL);
  ok(cnt(g, 1, 'ban', FILL) === 1 && !on(g, 1, FILL), 'Warwolf banished instead of returned');
});
T('Demise of the Land: on opponent Special Summon, activate a Field Spell from the Deck', () => {
  const g = duel({ first: 1, board: [{ m: [CG], st: ['Demise of the Land'], deckTop: ['Jurassic World'] }, { hand: ['Cyber Dragon'], turn: 2 }] });
  choose(g, 'sp:' + card(g, 1, 'Cyber Dragon').u); settle(g, 'Demise of the Land', 'Jurassic World', 'Attack'); toIdle(g, 'Attack');
  ok(g.p[0].fz && E.name(g.p[0].fz) === 'Jurassic World', 'Jurassic World active');
});
T('Demise, King of Armageddon: Ritual Summon with End of the World, pay 2000 to destroy all other cards', () => {
  const g = duel({ board: [{ hand: ['End of the World', 'Demise, King of Armageddon', FILL, FILL], turn: 2 }, { m: [CG], st: ['Mirror Force'] }] });
  act(g, 0, 'End of the World'); settle(g, FILL); toIdle(g);
  ok(on(g, 0, 'Demise, King of Armageddon'), 'Demise Ritual Summoned');
  eff(g, 0, 'Demise, King of Armageddon'); toIdle(g);
  ok(lp(g, 0) === 6000 && !on(g, 1, CG) && inZ(g, 1, 'gy', 'Mirror Force') && on(g, 0, 'Demise, King of Armageddon'), `all others destroyed (LP ${lp(g, 0)})`);
});
T('Depth Amulet: discard 1 to negate an attack', () => {
  const g = duel({ first: 1, board: [{ st: [up('Depth Amulet')] }, { m: [FILL], turn: 2 }] });
  const h = hand(g, 0); bp(g); atkOn(g, 1, FILL, null, 'Depth Amulet', FILL); toIdle(g);
  ok(lp(g, 0) === 8000 && hand(g, 0) === h - 1 && stOf(g, 0).some(c => c && E.name(c) === 'Depth Amulet'), `attack negated, discarded 1 (LP ${lp(g, 0)}, hand ${hand(g, 0)})`);
});
T('Descending Lost Star: Synchro back in DEF, Level -1, DEF 0', () => {
  const g = duel({ board: [{ st: ['Descending Lost Star'], gy: ['Stardust Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Descending Lost Star'); settle(g, 'Stardust Dragon'); toIdle(g);
  const s = on(g, 0, 'Stardust Dragon');
  ok(s && s.pos === 'def' && LV(s) === 7 && E.def(g, s) === 0, s ? `pos ${s.pos}, Lv ${LV(s)}, DEF ${E.def(g, s)}` : 'not summoned');
  ok(s && !hasOpt(g, 'pos:' + s.u), 'cannot change position');
});
T('Destroyersaurus: discard to add Jurassic World', () => {
  const g = duel({ board: [{ hand: ['Destroyersaurus'], deckTop: [FILL, 'Jurassic World'], turn: 2 }, {}] });
  eff(g, 0, 'Destroyersaurus', 'Jurassic World'); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Jurassic World') && inZ(g, 0, 'gy', 'Destroyersaurus'), 'Jurassic World added');
});
T('Destruct Potion: destroy own monster, gain its ATK', () => {
  const g = duel({ board: [{ st: ['Destruct Potion'], m: [BEWD], turn: 2 }, {}] });
  act(g, 0, 'Destruct Potion'); settle(g, BEWD); toIdle(g);
  ok(inZ(g, 0, 'gy', BEWD) && lp(g, 0) === 11000, `LP ${lp(g, 0)}`);
});
T('Destructive Draw: extra draw on empty hand, 700 in End Phase, 3000 when removed', () => {
  const g = duel({ board: [{ hand: [], st: [up('Destructive Draw')], deckTop: ['Mystical Space Typhoon', FILL], turn: 2 }, {}] });
  toIdle(g, 'Destructive Draw');
  ok(hand(g, 0) === 2, `drew 2 (hand ${hand(g, 0)})`);
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Destructive Draw'); toIdle(g);
  ok(lp(g, 0) === 5000, `3000 damage when removed (${lp(g, 0)})`);
  const g2 = duel({ board: [{ st: [up('Destructive Draw')], turn: 2 }, {}] });
  endTurn(g2); toIdle(g2); ok(lp(g2, 0) === 7300, `700 in End Phase (${lp(g2, 0)})`);
});
T('Destructotron: pay 1000 to destroy a Set S/T; destroys itself in End Phase when alone', () => {
  const g = duel({ board: [{ m: ['Destructotron'], turn: 2 }, { st: ['Mirror Force'] }] });
  eff(g, 0, 'Destructotron', 'Face-down'); toIdle(g);
  ok(lp(g, 0) === 7000 && inZ(g, 1, 'gy', 'Mirror Force'), `Mirror Force destroyed (LP ${lp(g, 0)})`);
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Destructotron'), 'Destructotron destroyed itself');
});
T('Detonate: destroy Kuriboh, then that many opponent cards', () => {
  const g = duel({ board: [{ hand: ['Detonate'], m: ['Kuriboh'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Detonate'); settle(g, BEWD); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Kuriboh') && inZ(g, 1, 'gy', BEWD), 'Kuriboh and BEWD destroyed');
});
T('Detonator Circle A: destroy a monster with an A-Counter, 1000 to each', () => {
  const g = duel({ board: [{ st: ['Detonator Circle A'], m: [CG], turn: 2 }, { m: [BEWD] }] });
  E.lib.addCtr(g, on(g, 1, BEWD), 'A', 1); reprompt(g);
  act(g, 0, 'Detonator Circle A'); settle(g, BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && lp(g, 0) === 7000 && lp(g, 1) === 7000, `BEWD destroyed, LP ${lp(g, 0)}/${lp(g, 1)}`);
});
T('Dharc the Dark Charmer: FLIP takes a DARK monster', () => {
  const g = duel({ board: [{ m: [setM('Dharc the Dark Charmer')], turn: 2 }, { m: [AS, CG] }] });
  flipSum(g, 0, 'Dharc the Dark Charmer', AS); toIdle(g, AS);
  ok(on(g, 0, AS) && on(g, 1, CG), 'took Archfiend Soldier');
});
T('Diabolos: DARK Tributes only; looks at opponent top card in their Draw Phase', () => {
  const g0 = duel({ board: [{ hand: ['Diabolos, King of the Abyss'], m: [AS, CG], turn: 2 }, {}] });
  const d0 = card(g0, 0, 'Diabolos, King of the Abyss');
  ok(!hasOpt(g0, 'ns:' + d0.u), 'no Tribute Summon with a non-DARK');
  const g = duel({ board: [{ hand: ['Diabolos, King of the Abyss'], m: [AS, 'Sangan', CG], turn: 2 }, { deckTop: [BEWD, EL] }] });
  ns(g, 0, 'Diabolos, King of the Abyss', AS, 'Sangan'); toIdle(g);
  ok(on(g, 0, 'Diabolos, King of the Abyss') && on(g, 0, CG), 'Tribute Summoned with 2 DARK');
  endTurn(g, 'Diabolos', 'ottom'); toIdle(g, 'Diabolos', 'ottom');
  ok(inZ(g, 1, 'hand', EL) && !inZ(g, 1, 'hand', BEWD) && E.name(g.p[1].deck[0]) === BEWD, 'BEWD put on the bottom, B drew Mystical Elf');
});
T('Diamond-Dust Cyclone: destroy a monster with 8 Fog Counters, draw 2', () => {
  const g = duel({ board: [{ hand: ['Diamond-Dust Cyclone'], m: [CG], turn: 2 }, { m: ['Cloudian - Smoke Ball'] }] });
  E.lib.addCtr(g, on(g, 1, 'Cloudian - Smoke Ball'), 'fog', 8); reprompt(g);
  const h = hand(g, 0); act(g, 0, 'Diamond-Dust Cyclone'); settle(g, 'Smoke Ball'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Cloudian - Smoke Ball') && hand(g, 0) === h + 1, `destroyed, hand ${h} to ${hand(g, 0)}`);
});
T('Dimensional Inversion: Special Summon a monster banished by the opponent', () => {
  const g = duel({ board: [{ m: [FILL], st: ['Dimensional Inversion'], turn: 2 }, { st: ['Dimensional Prison'] }] });
  bp(g); atkOn(g, 0, FILL, null, 'Dimensional Prison', 'Dimensional Inversion', FILL, 'Attack'); toIdle(g, FILL, 'Attack');
  ok(on(g, 0, FILL) && inZ(g, 0, 'gy', 'Dimensional Inversion'), 'Warwolf back on the field');
});
T('Disarm: return a Gladiator Beast from hand to negate a Spell', () => {
  const g = duel({ first: 1, board: [{ hand: ['Gladiator Beast Bestiari'], m: [CG], st: ['Disarm'] }, { hand: ['Dark Hole'], m: [FILL], turn: 2 }] });
  act(g, 1, 'Dark Hole'); settle(g, 'Disarm', 'Gladiator Beast Bestiari'); toIdle(g);
  ok(on(g, 0, CG) && on(g, 1, FILL) && inZ(g, 1, 'gy', 'Dark Hole') && !inZ(g, 0, 'hand', 'Gladiator Beast Bestiari') && g.p[0].deck.some(c => E.name(c) === 'Gladiator Beast Bestiari'), 'Dark Hole negated, Bestiari shuffled in');
});
T('Disciple of the Forbidden Spell: declares an Attribute and destroys it without damage calculation', () => {
  const g = duel({ board: [{ hand: ['Disciple of the Forbidden Spell'], gy: ['Disciple of the Forbidden Spell'], turn: 2 }, { m: [FILL] }] });
  ns(g, 0, 'Disciple of the Forbidden Spell', 'EARTH'); toIdle(g, 'EARTH');
  bp(g); atkOn(g, 0, 'Disciple of the Forbidden Spell', FILL); toIdle(g);
  ok(inZ(g, 1, 'gy', FILL) && on(g, 0, 'Disciple of the Forbidden Spell') && lp(g, 0) === 8000, `Warwolf destroyed, Disciple safe (LP ${lp(g, 0)})`);
});
T('Discord: no Synchro Summons', () => {
  const g = duel({ ex0: ['Armory Arm'], board: [{ m: ['Junk Synchron', 'Darksea Rescue'], st: ['Discord'], turn: 2 }, {}] });
  ok(hasOpt(g, 'syn:'), 'Synchro offered before');
  act(g, 0, 'Discord'); settle(g); toIdle(g);
  ok(!hasOpt(g, 'syn:'), 'no Synchro after Discord');
});
T('Disenchanter: remove a Spell Counter to return a face-up Spell', () => {
  const g = duel({ board: [{ hand: ['Defender, the Magical Knight'], m: ['Disenchanter'], turn: 2 }, { st: [up('Messenger of Peace')] }] });
  ns(g, 0, 'Defender, the Magical Knight'); toIdle(g);
  eff(g, 0, 'Disenchanter', 'Messenger of Peace', 'Defender'); toIdle(g);
  ok(inZ(g, 1, 'hand', 'Messenger of Peace') && ctrOf(on(g, 0, 'Defender, the Magical Knight'), 'spell') === 0, 'Messenger returned, counter removed');
});
T('Diskblade Rider: banish a Normal Trap from GY for +500', () => {
  const g = duel({ board: [{ m: ['Diskblade Rider'], gy: ['Mirror Force'], turn: 2 }, {}] });
  eff(g, 0, 'Diskblade Rider', 'Mirror Force'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Diskblade Rider')) === 2200 && inZ(g, 0, 'ban', 'Mirror Force'), AD(g, 0, 'Diskblade Rider'));
});
T('Doctor Cranium: destroyed by battle, pay 800 to add a Psychic', () => {
  const g = duel({ first: 1, board: [{ m: ['Doctor Cranium'], deckTop: ['Destructotron'] }, { m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Doctor Cranium', 'Doctor Cranium', 'Destructotron'); toIdle(g, 'Destructotron');
  ok(inZ(g, 0, 'hand', 'Destructotron') && lp(g, 0) === 8000 - 1900 - 800, `Destructotron added (LP ${lp(g, 0)})`);
});
T('Doitsu: equips to Soitsu for +2500', () => {
  const g = duel({ board: [{ m: ['Doitsu', 'Soitsu'], turn: 2 }, {}] });
  eff(g, 0, 'Doitsu', 'Equip', 'Soitsu'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Soitsu')) === 2500 && inZ(g, 0, 'st', 'Doitsu'), AD(g, 0, 'Soitsu'));
});
T('Domino Effect: after a battle kill, send own monster to destroy one', () => {
  const g = duel({ board: [{ m: [BEWD, CG], st: [up('Domino Effect')], turn: 2 }, { m: [FILL, AS] }] });
  bp(g); atkOn(g, 0, BEWD, FILL, 'Domino Effect', CG, AS); toIdle(g, CG, AS);
  ok(inZ(g, 0, 'gy', CG) && inZ(g, 1, 'gy', AS) && on(g, 0, BEWD), 'Celtic sent, Archfiend Soldier destroyed');
});
T('Doom Dozer: summoned by banishing 2 Insects; mills on battle damage', () => {
  const g = duel({ board: [{ hand: ['Doom Dozer'], gy: ['Insect Knight', 'Howling Insect'], turn: 2 }, {}] });
  const d = card(g, 0, 'Doom Dozer'); ok(!hasOpt(g, 'ns:' + d.u) && !hasOpt(g, 'set:' + d.u), 'no Normal Summon');
  choose(g, 'sp:' + d.u); settle(g, 'Insect Knight', 'Howling Insect', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Doom Dozer') && cnt(g, 0, 'ban') === 2, 'summoned, 2 Insects banished');
  bp(g); atkOn(g, 0, 'Doom Dozer', null); toIdle(g);
  ok(lp(g, 1) === 5200 && cnt(g, 1, 'gy') === 1, `2800 damage, 1 card milled (GY ${cnt(g, 1, 'gy')})`);
});
T('Doom Shaman: Gemini, summons a Fiend from either GY; it dies when Shaman leaves', () => {
  const g = duel({ board: [{ m: ['Doom Shaman'], st: ['Destruct Potion'], turn: 2 }, { gy: ['Sangan'] }] });
  gem(g, 0, 'Doom Shaman'); eff(g, 0, 'Doom Shaman', 'Sangan', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Sangan'), 'Sangan summoned from B GY');
  act(g, 0, 'Destruct Potion'); settle(g, 'Doom Shaman'); toIdle(g);
  ok(!on(g, 0, 'Sangan') && inZ(g, 1, 'gy', 'Sangan') && lp(g, 0) === 10400, `Sangan destroyed with Shaman (LP ${lp(g, 0)})`);
});
T('Doomkaiser Dragon Assault Mode: revives Zombies; brings Doomkaiser back when destroyed', () => {
  const g = duel({ board: [{ m: ['Doomkaiser Dragon'], st: ['Assault Mode Activate'], gy: ['Pyramid Turtle'], deckTop: [FILL, 'Doomkaiser Dragon Assault Mode'], turn: 2 }, { gy: ['Spirit Reaper'] }] });
  act(g, 0, 'Assault Mode Activate'); settle(g, 'Doomkaiser Dragon Assault Mode', 'Pyramid Turtle', 'Spirit Reaper', 'Attack'); toIdle(g, 'Pyramid Turtle', 'Spirit Reaper', 'Attack');
  ok(on(g, 0, 'Doomkaiser Dragon Assault Mode') && on(g, 0, 'Pyramid Turtle') && on(g, 0, 'Spirit Reaper'), 'Assault Mode summoned, Zombies revived');
  endTurn(g); toIdle(g);
  ok(!on(g, 0, 'Pyramid Turtle') && !on(g, 0, 'Spirit Reaper') && inZ(g, 1, 'gy', 'Spirit Reaper'), 'Zombies destroyed in the End Phase');
  const g2 = duel({ first: 1, board: [{ m: ['Doomkaiser Dragon Assault Mode'], gy: ['Doomkaiser Dragon'] }, { hand: ['Fissure'], turn: 2 }] });
  act(g2, 1, 'Fissure'); settle(g2, 'Doomkaiser', 'Attack'); toIdle(g2, 'Doomkaiser', 'Attack');
  ok(on(g2, 0, 'Doomkaiser Dragon'), 'Doomkaiser Dragon back from the GY');
});
T('Doomsday Horror: 300 per banished DARK; returns them when destroyed', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Doomsday Horror'], ban: [AS, 'Sangan', CG], turn: 2 }, { ban: ['Spirit Reaper'] }] });
  ok(AD(g, 0, 'Doomsday Horror') === '900/900', AD(g, 0, 'Doomsday Horror'));
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'gy', AS) && inZ(g, 0, 'gy', 'Sangan') && inZ(g, 1, 'gy', 'Spirit Reaper') && inZ(g, 0, 'ban', CG), 'DARK monsters returned to the GYs');
});
T('Doppelganger: reflects monster effect damage', () => {
  const g = duel({ first: 1, board: [{ st: [up('Doppelganger')] }, { m: ['Cannon Soldier', FILL], turn: 2 }] });
  eff(g, 1, 'Cannon Soldier', FILL, 'Doppelganger'); toIdle(g, 'Doppelganger');
  ok(lp(g, 0) === 7500 && lp(g, 1) === 7500, `LP ${lp(g, 0)}/${lp(g, 1)}`);
});
T('Drastic Drop Off: opponent discards 1 of the drawn cards', () => {
  const g = duel({ first: 1, board: [{ st: ['Drastic Drop Off'] }, { hand: ['Pot of Greed'], turn: 2 }] });
  ok(g.prompt && g.prompt.type === 'yesno' && g.prompt.p === 0, 'offered on the normal draw'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Drastic Drop Off') && hand(g, 1) === 1 && cnt(g, 1, 'gy', FILL) === 1, `B discarded the drawn card (hand ${hand(g, 1)})`);
  const g2 = duel({ first: 1, board: [{ st: ['Drastic Drop Off'] }, { hand: ['Pot of Greed'], turn: 2 }] });
  toIdle(g2, 'NO'); act(g2, 1, 'Pot of Greed'); settle(g2); toIdle(g2);
  ok(inZ(g2, 0, 'gy', 'Drastic Drop Off') && hand(g2, 1) === 2 && cnt(g2, 1, 'gy', FILL) === 1, `after Pot of Greed B kept 1 of 2 (hand ${hand(g2, 1)})`);
});
T('Dreadscythe Harvester: Tribute an Insect for +500 this turn', () => {
  const g = duel({ board: [{ m: ['Dreadscythe Harvester', 'Insect Knight'], turn: 2 }, {}] });
  eff(g, 0, 'Dreadscythe Harvester', 'Insect Knight'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Dreadscythe Harvester')) === 2800 && inZ(g, 0, 'gy', 'Insect Knight'), AD(g, 0, 'Dreadscythe Harvester'));
  endTurn(g); ok(E.atk(g, on(g, 0, 'Dreadscythe Harvester')) === 2300, 'back to 2300 next turn');
});
T('Drill Synchron: Warriors pierce, draw 1', () => {
  const g = duel({ board: [{ m: ['Drill Synchron', CG], turn: 2 }, { m: [defM(FILL)] }] });
  const h = hand(g, 0); bp(g); atkOn(g, 0, CG, FILL, 'Drill'); toIdle(g, 'Drill');
  ok(lp(g, 1) === 6700 && hand(g, 0) === h + 1, `1300 piercing (${lp(g, 1)}), hand ${h} to ${hand(g, 0)}`);
});
T('DUCKER Mobile Cannon: FLIP adds a Level 4 from GY', () => {
  const g = duel({ board: [{ m: [setM('DUCKER Mobile Cannon')], gy: [CG], turn: 2 }, {}] });
  flipSum(g, 0, 'DUCKER Mobile Cannon', CG); toIdle(g, CG);
  ok(inZ(g, 0, 'hand', CG), 'Celtic Guardian added');
});
T('Dweller in the Depths: +300 per Continuous Spell', () => {
  const g = duel({ board: [{ m: ['Dweller in the Depths'], st: [up('Messenger of Peace'), up('Spell Absorption')], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Dweller in the Depths')) === 2100, AD(g, 0, 'Dweller in the Depths'));
});
T('Earth Effigy: 2 Tributes for an EARTH Normal Monster', () => {
  const g = duel({ board: [{ hand: ['Gaia The Fierce Knight'], m: ['Earth Effigy'], turn: 2 }, {}] });
  ns(g, 0, 'Gaia The Fierce Knight', 'Earth Effigy'); toIdle(g);
  ok(on(g, 0, 'Gaia The Fierce Knight') && inZ(g, 0, 'gy', 'Earth Effigy'), 'Gaia Tribute Summoned with Effigy alone');
});
T('Ebon Arrow: -500, piercing, damage equal to destroyed monster original DEF', () => {
  const g = duel({ board: [{ m: [BEWD], st: ['Ebon Arrow'], turn: 2 }, { m: [defM(EL)] }] });
  act(g, 0, 'Ebon Arrow'); settle(g, BEWD); toIdle(g);
  ok(E.atk(g, on(g, 0, BEWD)) === 2500, AD(g, 0, BEWD));
  bp(g); atkOn(g, 0, BEWD, EL); toIdle(g);
  ok(lp(g, 1) === 8000 - 500 - 2000, `B LP ${lp(g, 1)}`);
});
T('Ebon Magician Curran: 300 per opponent monster in Standby', () => {
  const g = duel({ board: [{ m: ['Ebon Magician Curran'], turn: 2 }, { m: [FILL, CG] }] });
  toIdle(g); ok(lp(g, 1) === 7400, `B LP ${lp(g, 1)}`);
});
T('Eccentric Boy: Synchro with a monster in hand; the Synchro is banished when it leaves', () => {
  const g = duel({ ex0: ['Armory Arm'], board: [{ hand: ['Kuriboh', 'Dark Hole'], m: ['Eccentric Boy'], turn: 2 }, {}] });
  eff(g, 0, 'Eccentric Boy', 'Kuriboh', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Armory Arm') && inZ(g, 0, 'gy', 'Kuriboh'), 'Armory Arm summoned with Kuriboh from hand');
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(inZ(g, 0, 'ban', 'Armory Arm'), 'Armory Arm banished');
});
T('Edge Hammer: Tribute Bladedge, destroy and burn original ATK', () => {
  const g = duel({ board: [{ m: ['Elemental HERO Bladedge'], st: ['Edge Hammer'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Edge Hammer'); settle(g, 'Bladedge', BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && lp(g, 1) === 5000 && inZ(g, 0, 'gy', 'Elemental HERO Bladedge'), `B LP ${lp(g, 1)}`);
});
T('Eliminating the League: discard a Spell, destroy, send same-named cards from hand', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: ['Eliminating the League'], turn: 2 }, { hand: [FILL, CG], m: [FILL] }] });
  act(g, 0, 'Eliminating the League'); settle(g, 'Pot of Greed', FILL); toIdle(g);
  ok(cnt(g, 1, 'gy', FILL) === 2 && inZ(g, 1, 'hand', CG) && inZ(g, 0, 'gy', 'Pot of Greed'), 'Warwolf destroyed and the one in hand sent');
});
T('Emblem of the Awakening: Ritual Summon Cu Chulainn', () => {
  const g = duel({ board: [{ hand: ['Emblem of the Awakening', 'Cu Chulainn the Awakened', FILL], turn: 2 }, {}] });
  act(g, 0, 'Emblem of the Awakening'); settle(g, 'Cu Chulainn', FILL); toIdle(g, 'Attack');
  ok(on(g, 0, 'Cu Chulainn the Awakened'), 'Cu Chulainn Ritual Summoned');
});
T('Emergency Assistance: Main Phase 2, revive a Level 4 destroyed by effect this turn', () => {
  const g = duel({ board: [{ hand: ['Emergency Assistance', 'Dark Hole'], m: [CG], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(!canAct(g, 0, 'Emergency Assistance'), 'not in Main Phase 1');
  bp(g); E.act(g, ['endbp']); settle(g); toIdle(g);
  ok(canAct(g, 0, 'Emergency Assistance'), 'offered in Main Phase 2');
  act(g, 0, 'Emergency Assistance'); settle(g, CG, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, CG), 'Celtic Guardian back');
});
T('Emperor Sem: on Tribute Summon each player returns a GY card to the Deck top', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon'], m: ['Emperor Sem', CG], gy: ['Pot of Greed'], turn: 2 }, { gy: ['Mirror Force'] }] });
  choose(g, 'ns:' + card(g, 0, 'Cyber Dragon').u); choose(g, CG); settle(g, 'Emperor Sem', 'Pot of Greed', 'Mirror Force'); toIdle(g, 'Emperor Sem', 'Pot of Greed', 'Mirror Force');
  ok(on(g, 0, 'Cyber Dragon') && E.name(topOf(g, 0)) === 'Pot of Greed' && E.name(topOf(g, 1)) === 'Mirror Force', `tops: ${E.name(topOf(g, 0))}, ${E.name(topOf(g, 1))}`);
});
T('End of the World: Ritual Summon Ruin', () => {
  const g = duel({ board: [{ hand: ['End of the World', 'Ruin, Queen of Oblivion', FILL, FILL], turn: 2 }, {}] });
  act(g, 0, 'End of the World'); settle(g, 'Ruin', FILL); toIdle(g, 'Attack');
  ok(on(g, 0, 'Ruin, Queen of Oblivion'), 'Ruin Ritual Summoned');
});
T('Endymion: summoned with 6 counters, adds a Spell, discards a Spell to destroy', () => {
  const g = duel({ board: [{ hand: ['Endymion, the Master Magician', 'Magical Citadel of Endymion'], gy: ['Pot of Greed'], m: [CG], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Magical Citadel of Endymion'); settle(g); toIdle(g);
  const cit = g.p[0].fz; E.lib.addCtr(g, cit, 'spell', 6 - ctrOf(cit, 'spell')); reprompt(g);
  choose(g, 'sp:' + card(g, 0, 'Endymion, the Master Magician').u); settle(g, 'Attack', 'Pot of Greed'); toIdle(g, 'Attack', 'Pot of Greed');
  ok(on(g, 0, 'Endymion, the Master Magician') && inZ(g, 0, 'hand', 'Pot of Greed') && ctrOf(cit, 'spell') === 0, 'Endymion summoned and Pot added');
  eff(g, 0, 'Endymion, the Master Magician', 'Pot of Greed', BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD) && inZ(g, 0, 'gy', 'Pot of Greed'), 'BEWD destroyed');
});
T("Enishi: summoned by banishing 2 Six Samurai; destroys a face-up monster and can't attack", () => {
  const g = duel({ board: [{ hand: ["Enishi, Shien's Chancellor"], gy: ['The Six Samurai - Kamon', 'The Six Samurai - Yaichi'], turn: 2 }, { m: [BEWD] }] });
  choose(g, 'sp:' + card(g, 0, "Enishi, Shien's Chancellor").u); settle(g, 'Kamon', 'Yaichi', 'Attack'); toIdle(g, 'Attack');
  const en = on(g, 0, "Enishi, Shien's Chancellor"); ok(en && cnt(g, 0, 'ban') === 2, 'Enishi summoned');
  eff(g, 0, "Enishi, Shien's Chancellor", BEWD); toIdle(g);
  ok(inZ(g, 1, 'gy', BEWD), 'BEWD destroyed');
  bp(g); ok(!canAtk(g, en, null), 'Enishi cannot attack');
});
T('Enlightenment: Spellcaster attacks again; no Summon this turn', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], st: ['Enlightenment'], turn: 2 }, { m: [CG, EL] }] });
  bp(g); atkOn(g, 0, 'Dark Magician', CG); if (canAct(g, 0, 'Enlightenment')) { act(g, 0, 'Enlightenment'); settle(g); }
  const dm = on(g, 0, 'Dark Magician'); ok(inZ(g, 0, 'gy', 'Enlightenment') && canAtk(g, dm, on(g, 1, EL)), 'Dark Magician can attack again');
  atkOn(g, 0, 'Dark Magician', EL); toIdle(g);
  ok(inZ(g, 1, 'gy', EL), 'second attack destroyed Mystical Elf');
  E.act(g, ['endbp']); settle(g); toIdle(g);
  const hc = g.p[0].hand.find(c => E.lib.isMon(c)); ok(hc && !hasOpt(g, 'ns:' + hc.u) && !hasOpt(g, 'set:' + hc.u), 'no Summon after Enlightenment');
});
T('Equip Shot: moves an Equip Spell to an opponent monster and battles', () => {
  const g = duel({ board: [{ hand: ['Malevolent Nuzzler'], m: [CG], st: [null, 'Equip Shot'], turn: 2 }, { m: [EL] }] });
  act(g, 0, 'Malevolent Nuzzler'); settle(g, CG); toIdle(g);
  ok(E.atk(g, on(g, 0, CG)) === 2100, 'Nuzzler on Celtic');
  bp(g); act(g, 0, 'Equip Shot'); settle(g, 'Malevolent Nuzzler', EL); toIdle(g);
  const nz = card(g, 0, 'Malevolent Nuzzler');
  ok(lp(g, 0) === 7900 && inZ(g, 0, 'gy', CG), `Celtic lost to Elf (1500 ATK), A LP ${lp(g, 0)}`);
  ok(nz && nz.zone === 'st' && on(g, 1, EL) && nz.equipTo === on(g, 1, EL).u, 'Nuzzler equipped to Mystical Elf');
});
T('Escape from the Dark Dimension: revive a banished DARK; it is banished when this leaves', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], st: ['Escape from the Dark Dimension'], ban: [AS], turn: 2 }, {}] });
  act(g, 0, 'Escape from the Dark Dimension'); settle(g, AS, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, AS), 'Archfiend Soldier summoned');
  act(g, 0, 'Mystical Space Typhoon'); settle(g, 'Escape'); toIdle(g);
  ok(inZ(g, 0, 'ban', AS) && !on(g, 0, AS), 'Archfiend Soldier destroyed and banished');
});

console.log(fails ? `\n${fails} failed` : '\nAll batch 37 review checks passed.');
process.exit(fails ? 1 : 0);
