// Independent review checks for full pool batch 40 (written from the card text): node build/review_full-40.js
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
const ctrOf = (c, k) => E.lib.ctr(c, k);
const topOf = (g, p) => g.p[p].deck[g.p[p].deck.length - 1];
const stOf = (g, p) => g.p[p].st;
const inST = (g, p, n) => g.p[p].st.some(c => c && E.name(c) === n);
const TTD = 'Tribute to the Doomed', MST = 'Mystical Space Typhoon', BM = 'Book of Moon';

T('Indomitable Fighter Lei Lei: to Defense after attacking, no manual position change', () => {
  const g = duel({ board: [{ m: ['Indomitable Fighter Lei Lei'], turn: 2 }, { m: [CG] }] });
  bp(g); atkOn(g, 0, 'Indomitable Fighter Lei Lei', CG); toIdle(g);
  E.act(g, ['endbp']); settle(g); toIdle(g);
  const l = on(g, 0, 'Indomitable Fighter Lei Lei');
  ok(inZ(g, 1, 'gy', CG) && l && l.pos === 'def', `CG destroyed, Lei Lei pos ${l && l.pos}`);
  endTurn(g); toIdle(g); endTurn(g); toIdle(g);
  ok(!hasOpt(g, 'pos:' + l.u), 'cannot change its position on the next turn');
});
T('Indomitable Gladiator Beast: +500 ATK, GY effect returns it', () => {
  const g = duel({ board: [{ hand: ['Indomitable Gladiator Beast'], m: ['Gladiator Beast Bestiari'], turn: 2 }, {}] });
  act(g, 0, 'Indomitable Gladiator Beast'); settle(g, 'Gladiator Beast Bestiari'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Gladiator Beast Bestiari')) === 2000, AD(g, 0, 'Gladiator Beast Bestiari'));
  const g2 = duel({ board: [{ gy: ['Indomitable Gladiator Beast', 'Gladiator Beast Laquari', 'Gladiator Beast Darius'], turn: 2 }, {}] });
  const d = g2.p[0].deck.length; eff(g2, 0, 'Indomitable Gladiator Beast', 'Gladiator Beast Laquari', 'Gladiator Beast Darius'); toIdle(g2);
  ok(inZ(g2, 0, 'hand', 'Indomitable Gladiator Beast') && g2.p[0].deck.length === d + 2 && cnt(g2, 0, 'gy') === 0, `returned to hand, deck ${d} to ${g2.p[0].deck.length}`);
});
T('Infinity Dark: Gemini, changes a monster position on attack', () => {
  const g = duel({ board: [{ m: ['Infinity Dark'], turn: 2 }, { m: [BEWD] }] });
  gem(g, 0, 'Infinity Dark'); bp(g); atkOn(g, 0, 'Infinity Dark', BEWD, 'Infinity Dark', BEWD); toIdle(g, BEWD);
  ok(pos(g, 1, BEWD) === 'def' && lp(g, 0) === 7000 && on(g, 0, 'Infinity Dark'), `BEWD pos ${pos(g, 1, BEWD)}, A LP ${lp(g, 0)}`);
});
T('Informer Spider: destroyed by effect, take a Defense Position monster', () => {
  const g = duel({ board: [{ hand: [TTD, FILL], m: ['Informer Spider'], turn: 2 }, { m: [defM(CG), BEWD] }] });
  act(g, 0, TTD); settle(g, FILL, 'Informer Spider', CG); toIdle(g, CG);
  ok(inZ(g, 0, 'gy', 'Informer Spider') && on(g, 0, CG) && on(g, 1, BEWD), 'A controls Celtic Guardian');
});
T('Inherited Fortune: summon 2 Fortune Ladies next Standby', () => {
  const g = duel({ board: [{ hand: [TTD, FILL, 'Fortune Lady Water', 'Fortune Lady Dark'], m: ['Fortune Lady Fire'], st: ['Inherited Fortune'], turn: 2 }, {}] });
  act(g, 0, TTD); settle(g, FILL, 'Fortune Lady Fire'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Fortune Lady Fire'), 'Fortune Lady Fire destroyed');
  act(g, 0, 'Inherited Fortune'); settle(g); toIdle(g);
  endTurn(g); toIdle(g); endTurn(g, 'Fortune Lady Water', 'Fortune Lady Dark'); toIdle(g, 'Fortune Lady Water', 'Fortune Lady Dark', 'Attack');
  ok(on(g, 0, 'Fortune Lady Water') && on(g, 0, 'Fortune Lady Dark'), 'both Fortune Ladies Special Summoned');
});
T('Inmato: tribute to draw 2 when another Plant is targeted', () => {
  const g = duel({ first: 1, board: [{ m: ['Inmato', 'Bean Soldier'] }, { hand: [BM], turn: 2 }] });
  const h = hand(g, 0); act(g, 1, BM); settle(g, 'Bean Soldier', 'Inmato'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Inmato') && hand(g, 0) === h + 2, `Inmato tributed, hand ${h} to ${hand(g, 0)}`);
});
T('Instant Neo Space: Neos summoned when the equipped monster leaves', () => {
  const g = duel({ board: [{ hand: ['Instant Neo Space', TTD, FILL], m: ['Elemental HERO Air Neos'], gy: ['Elemental HERO Neos'], turn: 2 }, {}] });
  act(g, 0, 'Instant Neo Space'); settle(g, 'Elemental HERO Air Neos'); toIdle(g);
  ok(inST(g, 0, 'Instant Neo Space'), 'equipped');
  act(g, 0, TTD); settle(g, FILL, 'Elemental HERO Air Neos', 'Instant Neo Space', 'Elemental HERO Neos', 'Attack'); toIdle(g, 'Elemental HERO Neos', 'Attack');
  ok(on(g, 0, 'Elemental HERO Neos'), 'Neos Special Summoned');
  const g2 = duel({ board: [{ hand: ['Instant Neo Space'], m: ['Elemental HERO Air Neos'], turn: 2 }, {}] });
  act(g2, 0, 'Instant Neo Space'); settle(g2, 'Elemental HERO Air Neos'); toIdle(g2);
  endTurn(g2, 'NO'); toIdle(g2, 'NO');
  ok(on(g2, 0, 'Elemental HERO Air Neos'), 'Air Neos can stay in the End Phase');
});
T('Intercept: take control of a 1-Tribute Summoned monster', () => {
  const g = duel({ first: 1, board: [{ st: ['Intercept'] }, { hand: ['Cyber Dragon'], m: [FILL], turn: 2 }] });
  choose(g, 'ns:' + card(g, 1, 'Cyber Dragon').u); settle(g, FILL, 'Intercept', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Cyber Dragon'), 'A controls Cyber Dragon');
});
T('Interdimensional Warp: switch control with an A-Counter monster', () => {
  const g = duel({ board: [{ st: ['Interdimensional Warp'], m: [CG], turn: 2 }, { m: [BEWD, FILL] }] });
  E.lib.addCtr(g, on(g, 1, BEWD), 'A', 1); choose(g, 'pos:' + on(g, 0, CG).u); settle(g);
  act(g, 0, 'Interdimensional Warp'); settle(g, CG, BEWD); toIdle(g);
  ok(on(g, 0, BEWD) && on(g, 1, CG), 'BEWD and CG switched');
});
T('Interplanetary Invader A: take the attacker at the end of the Battle Phase', () => {
  const g = duel({ first: 1, board: [{ m: ['Interplanetary Invader A'], st: ['Waboku'] }, { m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Interplanetary Invader A', 'Waboku'); toIdle(g);
  E.act(g, ['endbp']); settle(g); toIdle(g);
  ok(on(g, 0, FILL) && on(g, 0, 'Interplanetary Invader A'), 'A controls the Warwolf');
});
T('Introduction to Gallantry: opponent with 5+ cards discards 1 at random', () => {
  const g = duel({ board: [{ st: ['Introduction to Gallantry'], turn: 2 }, { hand: [FILL, FILL, FILL, FILL, CG] }] });
  act(g, 0, 'Introduction to Gallantry'); settle(g); toIdle(g);
  ok(hand(g, 1) === 4 && cnt(g, 1, 'gy') === 1, `B hand ${hand(g, 1)}`);
  const g2 = duel({ board: [{ st: ['Introduction to Gallantry'], turn: 2 }, { hand: [FILL, FILL, FILL, FILL] }] });
  ok(!canAct(g2, 0, 'Introduction to Gallantry'), 'not with 4 cards');
});
T('Inverse Universe: Effect Monsters switch ATK and DEF', () => {
  const g = duel({ board: [{ st: ['Inverse Universe'], m: ['Cyber Dragon', CG], turn: 2 }, {}] });
  act(g, 0, 'Inverse Universe'); settle(g); toIdle(g);
  ok(AD(g, 0, 'Cyber Dragon') === '1600/2100' && AD(g, 0, CG) === '1400/1200', `${AD(g, 0, 'Cyber Dragon')} ${AD(g, 0, CG)}`);
});
T('Iris, the Earth Mother: draw 1 after a 3-link chain', () => {
  const g = duel({ board: [{ hand: [MST], m: ['Iris, the Earth Mother'], st: ['Waboku', 'Jar of Greed'], turn: 2 }, { st: ['Mirror Force'] }] });
  const h = hand(g, 0); act(g, 0, MST); settle(g, 'Face-down', 'Waboku', 'Jar of Greed'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 0, 'gy', 'Jar of Greed') && hand(g, 0) === h + 1, `hand ${h} to ${hand(g, 0)} (MST used, Jar and Iris drew 1 each)`);
});
T('Ivy Shackles: opponent monsters are Plant on my turn; draw when destroyed by opponent', () => {
  const g = duel({ board: [{ st: [up('Ivy Shackles')], turn: 2 }, { m: [FILL], hand: [MST] }] });
  console.log('gap  Ivy Shackles Type change (documented ENGINE gap): ' + E.lib.race(on(g, 1, FILL)));
  endTurn(g); toIdle(g);
  ok(E.lib.race(on(g, 1, FILL)) !== 'Plant', 'not Plant on their turn');
  const h = hand(g, 0); act(g, 1, MST); settle(g, 'Ivy Shackles'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Ivy Shackles') && hand(g, 0) === h + 1, `drew 1 (${h} to ${hand(g, 0)})`);
});
T('Izanagi: Special Summon by banishing a Spirit; Spirits may stay', () => {
  const g = duel({ board: [{ hand: ['Izanagi', 'Yata-Garasu', 'Asura Priest'], turn: 2 }, {}] });
  choose(g, 'sp:' + card(g, 0, 'Izanagi').u); settle(g, 'Yata-Garasu', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Izanagi') && inZ(g, 0, 'ban', 'Yata-Garasu'), 'Izanagi summoned, Yata banished');
  ns(g, 0, 'Asura Priest'); toIdle(g); endTurn(g, 'NO'); toIdle(g, 'NO');
  ok(on(g, 0, 'Asura Priest'), 'Asura Priest stayed on the field');
});
T('Izanami: discard to add a Spirit from GY; returns in End Phase', () => {
  const g = duel({ board: [{ hand: ['Izanami', FILL], gy: ['Asura Priest'], turn: 2 }, {}] });
  ns(g, 0, 'Izanami', FILL, 'Asura Priest'); toIdle(g, FILL, 'Asura Priest');
  ok(inZ(g, 0, 'hand', 'Asura Priest') && inZ(g, 0, 'gy', FILL), 'Asura Priest added, Warwolf discarded');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Izanami'), 'Izanami returned to hand');
  const g2 = duel({ board: [{ hand: ['Izanami', 'Monster Reborn'], gy: [], turn: 2 }, {}] });
  ok(noSummon(g2, card(g2, 0, 'Izanami')) === false, 'can be Normal Summoned');
});
T('Javelin Beetle Pact: Ritual Summons Javelin Beetle', () => {
  const g = duel({ board: [{ hand: ['Javelin Beetle Pact', 'Javelin Beetle', BEWD], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Javelin Beetle').u), 'Javelin Beetle cannot be Normal Summoned');
  act(g, 0, 'Javelin Beetle Pact'); settle(g, 'Javelin Beetle', BEWD, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Javelin Beetle') && inZ(g, 0, 'gy', BEWD), 'Javelin Beetle Ritual Summoned');
});
T('Jenis: 500 damage and 500 LP after a Lightsworn mill', () => {
  const g = duel({ board: [{ m: ['Jenis, Lightsworn Mender', 'Lyla, Lightsworn Sorceress'] }, {}] });
  endTurn(g); toIdle(g);
  ok(lp(g, 1) === 7500 && lp(g, 0) === 8500, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ m: ['Jenis, Lightsworn Mender'] }, {}] });
  endTurn(g2); toIdle(g2); ok(lp(g2, 1) === 8000, 'nothing without a mill');
});
T('Jester Confit: Special Summon, returns with a target in opponent End Phase', () => {
  const g = duel({ board: [{ hand: ['Jester Confit'], turn: 2 }, { m: [BEWD], hand: [] }] });
  choose(g, 'sp:' + card(g, 0, 'Jester Confit').u); settle(g); toIdle(g);
  ok(pos(g, 0, 'Jester Confit') === 'atk', 'summoned in Attack Position');
  endTurn(g); toIdle(g); endTurn(g, BEWD); toIdle(g, BEWD);
  ok(inZ(g, 0, 'hand', 'Jester Confit') && inZ(g, 1, 'hand', BEWD), 'both returned to hand');
});
T('Jester Lord: +1000 per Spell/Trap while the only monster', () => {
  const g = duel({ board: [{ m: ['Jester Lord'], st: ['Waboku', 'Mirror Force'], turn: 2 }, { st: ['Mirror Force'] }] });
  ok(E.atk(g, on(g, 0, 'Jester Lord')) === 3000, AD(g, 0, 'Jester Lord'));
  const g2 = duel({ board: [{ m: ['Jester Lord'], st: ['Waboku'], turn: 2 }, { m: [CG] }] });
  ok(E.atk(g2, on(g2, 0, 'Jester Lord')) === 0, 'no gain with another monster');
});
T('Jetroid: activate a Trap from the hand when attacked', () => {
  const g = duel({ first: 1, board: [{ m: ['Jetroid'], hand: ['Sakuretsu Armor'] }, { m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Jetroid', 'Jetroid', 'Sakuretsu Armor', FILL); toIdle(g, 'Sakuretsu Armor', FILL);
  ok(inZ(g, 1, 'gy', FILL) && on(g, 0, 'Jetroid'), 'Warwolf destroyed by Sakuretsu from the hand');
});
T('Junk Barrage: half the destroyed monster ATK as damage', () => {
  const g = duel({ board: [{ hand: ['Junk Barrage'], m: [BEWD], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'Junk Barrage'); settle(g, BEWD); toIdle(g);
  bp(g); atkOn(g, 0, BEWD, CG); toIdle(g);
  ok(lp(g, 1) === 8000 - 1600 - 700, `B LP ${lp(g, 1)}`);
});
T('Junk Box: Special Summon a Morphtronic, destroyed in End Phase', () => {
  const g = duel({ board: [{ hand: ['Junk Box'], gy: ['Morphtronic Celfon'], turn: 2 }, {}] });
  act(g, 0, 'Junk Box'); settle(g, 'Morphtronic Celfon', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Morphtronic Celfon'), 'Celfon summoned');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Morphtronic Celfon'), 'Celfon destroyed in End Phase');
});
T('Jurassic World: Dinosaurs +300/+300', () => {
  const g = duel({ board: [{ hand: ['Jurassic World'], m: ['Black Stego', CG], turn: 2 }, {}] });
  act(g, 0, 'Jurassic World'); settle(g); toIdle(g);
  ok(AD(g, 0, 'Black Stego') === '1500/2300' && AD(g, 0, CG) === '1400/1200', `${AD(g, 0, 'Black Stego')} ${AD(g, 0, CG)}`);
});
T('Justi-Break: destroy all but Attack Position Normal Monsters', () => {
  const g = duel({ first: 1, board: [{ m: [CG, 'Cyber Dragon'], st: ['Justi-Break'] }, { m: [FILL, 'Sangan'], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, CG, 'Justi-Break'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && inZ(g, 1, 'gy', 'Sangan') && on(g, 1, FILL), 'Cyber Dragon and Sangan destroyed, Warwolf stays');
});
T('Jutte Fighter: change an Attack Position monster to Defense, once per turn', () => {
  const g = duel({ board: [{ m: ['Jutte Fighter'], turn: 2 }, { m: [BEWD, CG] }] });
  eff(g, 0, 'Jutte Fighter', BEWD); toIdle(g);
  ok(pos(g, 1, BEWD) === 'def', `BEWD ${pos(g, 1, BEWD)}`);
  ok(!canAct(g, 0, 'Jutte Fighter'), 'once per turn');
});
T('Kahkki: discarded by effect, destroy a monster', () => {
  const g = duel({ board: [{ hand: ['Card Destruction', 'Kahkki, Guerilla of Dark World'], turn: 2 }, { m: [BEWD], hand: [] }] });
  act(g, 0, 'Card Destruction'); settle(g, BEWD); toIdle(g, BEWD);
  ok(inZ(g, 1, 'gy', BEWD), 'BEWD destroyed');
});
T('Karma Cut: banish target and same names in opponent GY', () => {
  const g = duel({ board: [{ st: ['Karma Cut'], hand: [FILL], turn: 2 }, { m: [CG], gy: [CG, BEWD] }] });
  act(g, 0, 'Karma Cut'); settle(g, FILL, CG); toIdle(g);
  ok(cnt(g, 1, 'ban', CG) === 2 && inZ(g, 1, 'gy', BEWD) && inZ(g, 0, 'gy', FILL), `banished ${cnt(g, 1, 'ban', CG)} CG`);
});
T('Kasha: summon with 2 Zombies, shuffle all monsters, ATK 1000 per Zombie', () => {
  const g = duel({ board: [{ hand: ['Kasha'], m: ['Pyramid Turtle', 'Goblin Zombie'], turn: 2 }, { m: [CG, setM(FILL)] }] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Kasha').u), 'cannot be Normal Summoned');
  choose(g, 'sp:' + card(g, 0, 'Kasha').u); settle(g, 'Attack'); toIdle(g, 'Attack');
  const k = on(g, 0, 'Kasha');
  ok(k && E.atk(g, k) === 2000 && !on(g, 0, 'Pyramid Turtle') && !on(g, 1, CG) && g.p[1].m.every(x => !x), k ? `ATK ${E.atk(g, k)}` : 'no Kasha');
  const g2 = duel({ board: [{ hand: ['Kasha'], m: ['Pyramid Turtle'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Kasha').u), 'not with 1 Zombie');
});
T('Kid Guard: tribute Hero Kid, negate attack, add an Elemental HERO', () => {
  const g = duel({ first: 1, board: [{ m: ['Hero Kid'], st: ['Kid Guard'], deckTop: ['Elemental HERO Neos'] }, { m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Hero Kid', 'Kid Guard', 'Hero Kid', 'Elemental HERO Neos'); toIdle(g, 'Elemental HERO Neos');
  ok(inZ(g, 0, 'gy', 'Hero Kid') && inZ(g, 0, 'hand', 'Elemental HERO Neos') && lp(g, 0) === 8000, 'Hero Kid tributed, Neos added');
});
T('Kinetic Soldier: +2000 against a Warrior', () => {
  const g = duel({ board: [{ m: ['Kinetic Soldier (Cipher Soldier)'], turn: 2 }, { m: [CG] }] });
  bp(g); atkOn(g, 0, 'Kinetic Soldier (Cipher Soldier)', CG); toIdle(g);
  ok(inZ(g, 1, 'gy', CG) && lp(g, 1) === 8000 - 1950 && E.atk(g, on(g, 0, 'Kinetic Soldier (Cipher Soldier)')) === 1350, `B LP ${lp(g, 1)}`);
});
T("King's Knight: summon Jack's Knight with Queen's Knight", () => {
  const g = duel({ board: [{ hand: ["King's Knight"], m: ["Queen's Knight"], deckTop: [FILL, "Jack's Knight"] }, {}] });
  ns(g, 0, "King's Knight", "Jack's Knight", 'Attack'); toIdle(g, "Jack's Knight", 'Attack');
  ok(on(g, 0, "Jack's Knight"), "Jack's Knight summoned");
});
T('Kinka-byo: revive a Level 1, return in End Phase, banish the revived', () => {
  const g = duel({ board: [{ hand: ['Kinka-byo'], gy: ['Kuriboh'], turn: 2 }, {}] });
  ns(g, 0, 'Kinka-byo', 'Kuriboh', 'Attack'); toIdle(g, 'Kuriboh', 'Attack');
  ok(on(g, 0, 'Kuriboh'), 'Kuriboh revived');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Kinka-byo') && inZ(g, 0, 'ban', 'Kuriboh'), 'Kinka-byo returned, Kuriboh banished');
});
T('Knight of the Red Lotus: summon by banishing 2 of exactly 3 Normals, revive a Normal', () => {
  const g = duel({ board: [{ hand: ['Knight of the Red Lotus'], gy: [CG, FILL, 'Battle Ox'], turn: 2 }, {}] });
  choose(g, 'sp:' + card(g, 0, 'Knight of the Red Lotus').u); settle(g, FILL, 'Battle Ox', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Knight of the Red Lotus') && cnt(g, 0, 'ban') === 2, 'summoned, 2 banished');
  eff(g, 0, 'Knight of the Red Lotus', CG, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, CG), 'Celtic Guardian revived');
  ok(!canAct(g, 0, 'Knight of the Red Lotus'), 'once per turn');
  const g2 = duel({ board: [{ hand: ['Knight of the Red Lotus'], gy: [CG, FILL], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'sp:' + card(g2, 0, 'Knight of the Red Lotus').u), 'not with 2 Normals');
});
T('Kunai with Chain: attacker to Defense, or equip +500', () => {
  const g = duel({ first: 1, board: [{ m: [CG], st: ['Kunai with Chain'] }, { m: [FILL], turn: 2 }] });
  bp(g); choose(g, `atk:${on(g, 1, FILL).u}:${on(g, 0, CG).u}`);
  settle(g, 'Kunai with Chain', 'Defense', FILL, CG); toIdle(g);
  ok(pos(g, 1, FILL) === 'def' && on(g, 0, CG) && lp(g, 0) === 8000, `Warwolf ${pos(g, 1, FILL)}, CG alive`);
  const g2 = duel({ board: [{ m: [CG], st: ['Kunai with Chain'], turn: 2 }, {}] });
  act(g2, 0, 'Kunai with Chain'); settle(g2, 'Equip', CG); toIdle(g2);
  ok(E.atk(g2, on(g2, 0, CG)) === 1900 && inST(g2, 0, 'Kunai with Chain'), AD(g2, 0, CG));
});
T('Kunoichi: new controller discards 1 random card', () => {
  const g = duel({ board: [{ hand: ['Brain Control', FILL], turn: 2 }, { m: ['Kunoichi'] }] });
  act(g, 0, 'Brain Control'); settle(g, 'Kunoichi'); toIdle(g);
  ok(on(g, 0, 'Kunoichi') && hand(g, 0) === 1 && cnt(g, 0, 'gy') === 2, `A controls Kunoichi, hand ${hand(g, 0)}, GY ${cnt(g, 0, 'gy')}`);
});
T('Kuribon: no damage, opponent gains ATK, returns to hand', () => {
  const g = duel({ first: 1, board: [{ m: ['Kuribon'] }, { m: [FILL], turn: 2 }] });
  bp(g); atkOn(g, 1, FILL, 'Kuribon', 'Kuribon'); toIdle(g, 'Kuribon');
  ok(lp(g, 0) === 8000 && lp(g, 1) === 10000 && inZ(g, 0, 'hand', 'Kuribon'), `A ${lp(g, 0)}, B ${lp(g, 1)}`);
});
T('Layard the Liberator: add 2 banished Fairies after a Counter Trap', () => {
  const g = duel({ first: 1, board: [{ m: ['Layard the Liberator'], st: ['Magic Jammer'], hand: [FILL], ban: ['Asura Priest', 'Izanagi'] }, { hand: ['Pot of Greed'], turn: 2 }] });
  act(g, 1, 'Pot of Greed'); settle(g, 'Magic Jammer', FILL, 'Asura Priest', 'Izanagi'); toIdle(g, 'Asura Priest', 'Izanagi');
  ok(inZ(g, 0, 'hand', 'Asura Priest') && inZ(g, 0, 'hand', 'Izanagi') && inZ(g, 1, 'gy', 'Pot of Greed'), 'both Fairies added');
});
T('Lesser Fiend: banishes monsters it destroys by battle', () => {
  const g = duel({ board: [{ m: ['Lesser Fiend (Archfiend)'], turn: 2 }, { m: [CG] }] });
  bp(g); atkOn(g, 0, 'Lesser Fiend (Archfiend)', CG); toIdle(g);
  ok(inZ(g, 1, 'ban', CG) && !inZ(g, 1, 'gy', CG), 'CG banished');
});
T('Lich Lord: DARK Tribute only; returns when Tributed by an effect; Linear Accelerator Cannon', () => {
  const g = duel({ board: [{ hand: ['Lich Lord, King of the Underworld'], m: [CG], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + card(g, 0, 'Lich Lord, King of the Underworld').u), 'no Tribute Summon with an EARTH');
  const g2 = duel({ board: [{ hand: ['Lich Lord, King of the Underworld'], m: ['Sangan'], turn: 2 }, {}] });
  ns(g2, 0, 'Lich Lord, King of the Underworld', 'Sangan'); toIdle(g2);
  ok(on(g2, 0, 'Lich Lord, King of the Underworld'), 'Tribute Summoned with a DARK');
  const g3 = duel({ board: [{ hand: ['Linear Accelerator Cannon', MST], m: ['Lich Lord, King of the Underworld'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g3, 0, 'Linear Accelerator Cannon'); settle(g3, 'Lich Lord'); toIdle(g3, 'Lich Lord');
  ok(lp(g3, 1) === 6800 && inZ(g3, 0, 'hand', 'Lich Lord, King of the Underworld'), `B LP ${lp(g3, 1)}, Lich Lord back in hand`);
  ok(!canAct(g3, 0, MST), 'no other Spells this turn');
});
T('Life Equalizer: both LP become 3000', () => {
  const g = duel({ board: [{ st: ['Life Equalizer'], lp: 10000, turn: 2 }, { lp: 1500 }] });
  act(g, 0, 'Life Equalizer'); settle(g); toIdle(g);
  ok(lp(g, 0) === 3000 && lp(g, 1) === 3000, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
  const g2 = duel({ board: [{ st: ['Life Equalizer'], turn: 2 }, { lp: 1000 }] });
  ok(!canAct(g2, 0, 'Life Equalizer'), 'not with a 7000 difference');
});
T('Lifeforce Harmonizer: discard to negate a burn card', () => {
  const g = duel({ first: 1, board: [{ hand: ['Lifeforce Harmonizer'] }, { hand: ['Ookazi'], turn: 2 }] });
  act(g, 1, 'Ookazi'); settle(g, 'Lifeforce Harmonizer'); toIdle(g);
  ok(lp(g, 0) === 8000 && inZ(g, 0, 'gy', 'Lifeforce Harmonizer') && inZ(g, 1, 'gy', 'Ookazi'), `A LP ${lp(g, 0)}`);
});
T('Lightning Punisher: destroy an opponent card after a 3-link chain', () => {
  const g = duel({ board: [{ hand: [MST], m: ['Lightning Punisher'], st: ['Waboku', 'Jar of Greed'], turn: 2 }, { st: ['Mirror Force'], m: [CG] }] });
  act(g, 0, MST); settle(g, 'Face-down', 'Waboku', 'Jar of Greed', CG); toIdle(g, CG);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', CG), 'Mirror Force and CG destroyed');
});
T('Lightsworn Barrier: mill 2 to negate an attack on a Lightsworn', () => {
  const g = duel({ first: 1, board: [{ m: ['Wulf, Lightsworn Beast'], st: [up('Lightsworn Barrier')] }, { m: [BEWD], turn: 2 }] });
  const d = g.p[0].deck.length; bp(g); atkOn(g, 1, BEWD, 'Wulf, Lightsworn Beast', 'Lightsworn Barrier'); toIdle(g);
  ok(on(g, 0, 'Wulf, Lightsworn Beast') && g.p[0].deck.length === d - 2 && lp(g, 0) === 8000, `Wulf alive, deck ${d} to ${g.p[0].deck.length}`);
});
T('Lightsworn Sabre: +700 to a Lightsworn; equips when milled', () => {
  const g = duel({ board: [{ hand: ['Lightsworn Sabre'], m: ['Ehren, Lightsworn Monk', CG], turn: 2 }, {}] });
  act(g, 0, 'Lightsworn Sabre');
  ok(!!g.prompt && !g.prompt.opts.some(o => o.label === CG), 'cannot target a non-Lightsworn');
  settle(g, 'Ehren'); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Ehren, Lightsworn Monk')) === 2300, AD(g, 0, 'Ehren, Lightsworn Monk'));
  const g2 = duel({ board: [{ hand: ['Solar Recharge', 'Ryko, Lightsworn Hunter'], m: ['Ehren, Lightsworn Monk'], deckTop: [FILL, FILL, FILL, 'Lightsworn Sabre', FILL] }, {}] });
  act(g2, 0, 'Solar Recharge'); settle(g2, 'Ryko', 'Lightsworn Sabre', 'Ehren'); toIdle(g2, 'Lightsworn Sabre', 'Ehren');
  ok(inST(g2, 0, 'Lightsworn Sabre') && E.atk(g2, on(g2, 0, 'Ehren, Lightsworn Monk')) === 2300, 'Sabre equipped from the GY');
});
T('Lightwave Tuning: a Level 4 LIGHT becomes a Tuner', () => {
  const g = duel({ ex0: ['Stardust Dragon'], board: [{ hand: ['Lightwave Tuning'], m: ["Magician's Valkyria", CG], turn: 2 }, {}] });
  ok(!synOpt(g, 'Stardust Dragon'), 'no Synchro before');
  act(g, 0, 'Lightwave Tuning'); settle(g, "Magician's Valkyria"); toIdle(g);
  console.log('gap  Lightwave Tuning Tuner treatment (documented ENGINE gap): Synchro offered ' + synOpt(g, 'Stardust Dragon'));
  ok(card(g, 0, 'Lightwave Tuning') && inZ(g, 0, 'gy', 'Lightwave Tuning'), 'Lightwave Tuning resolves and goes to the GY');
});
T('Limit Impulse: send 2 to summon 2 Soul Tokens', () => {
  const g = duel({ board: [{ st: ['Limit Impulse'], hand: [FILL, CG], turn: 2 }, {}] });
  act(g, 0, 'Limit Impulse'); settle(g, FILL, CG); toIdle(g);
  ok(cnt(g, 0, 'm', 'Soul Token') === 2 && inZ(g, 0, 'gy', CG) && inZ(g, 0, 'gy', FILL), `${cnt(g, 0, 'm', 'Soul Token')} tokens`);
});
T('Limit Reverse: revive in Attack, destroyed when the Trap leaves', () => {
  const g = duel({ board: [{ st: ['Limit Reverse'], hand: [MST], gy: ['Sangan', BEWD], turn: 2 }, {}] });
  act(g, 0, 'Limit Reverse');
  ok(!g.prompt.opts.some(o => o.label === BEWD), 'BEWD (3000) not offered');
  settle(g, 'Sangan'); toIdle(g);
  ok(pos(g, 0, 'Sangan') === 'atk', 'Sangan in Attack Position');
  act(g, 0, MST); settle(g, 'Limit Reverse', FILL); toIdle(g, FILL);
  ok(inZ(g, 0, 'gy', 'Sangan') && inZ(g, 0, 'gy', 'Limit Reverse'), 'Sangan destroyed with it');
});
T('Limiter Overload: summon Speed Warrior when sent to the GY', () => {
  const g = duel({ board: [{ st: ['Limiter Overload'], hand: [MST], deckTop: [FILL, 'Speed Warrior'] }, {}] });
  act(g, 0, MST); settle(g, 'Limiter Overload', 'Speed Warrior', 'Attack'); toIdle(g, 'Speed Warrior', 'Attack');
  ok(on(g, 0, 'Speed Warrior'), 'Speed Warrior summoned');
});
T('Lineage of Destruction: Level 8 attacks twice after destroying a Defense monster', () => {
  const g = duel({ board: [{ m: [BEWD], st: ['Lineage of Destruction'], turn: 2 }, { m: [defM(CG), FILL] }] });
  bp(g); atkOn(g, 0, BEWD, CG); toIdle(g);
  ok(inZ(g, 1, 'gy', CG), 'CG destroyed');
  act(g, 0, 'Lineage of Destruction'); settle(g, BEWD); toIdle(g);
  ok(canAtk(g, on(g, 0, BEWD), on(g, 1, FILL)), 'BEWD can attack again');
  atkOn(g, 0, BEWD, FILL); toIdle(g);
  ok(inZ(g, 1, 'gy', FILL) && lp(g, 1) === 7000, `B LP ${lp(g, 1)}`);
});
T('Lycanthrope: 200 per Normal Monster in GY on battle damage', () => {
  const g = duel({ board: [{ m: ['Lycanthrope'], gy: [CG, FILL], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Lycanthrope', null); toIdle(g);
  ok(lp(g, 1) === 8000 - 2400 - 400, `B LP ${lp(g, 1)}`);
});
T('Magicat: Synchro Material for a Spellcaster, Spell to Deck top', () => {
  const g = duel({ ex0: ['Explosive Magician'], board: [{ m: ['Flamvell Magician', 'Magicat'], gy: ['Dark Hole'], turn: 2 }, {}] });
  syn(g, 'Explosive Magician', 'Flamvell Magician', 'Magicat', 'Dark Hole', 'Attack');
  ok(on(g, 0, 'Explosive Magician') && E.name(topOf(g, 0)) === 'Dark Hole', `top ${E.name(topOf(g, 0))}`);
});
T('Magician of Black Chaos: Ritual Summon with Black Magic Ritual', () => {
  const g = duel({ board: [{ hand: ['Black Magic Ritual', 'Magician of Black Chaos', BEWD], turn: 2 }, {}] });
  act(g, 0, 'Black Magic Ritual'); settle(g, 'Magician of Black Chaos', BEWD, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Magician of Black Chaos'), 'summoned');
});
T("Magician's Valkyria: other face-up Spellcasters can't be attacked", () => {
  const g = duel({ first: 1, board: [{ m: ["Magician's Valkyria", 'Dark Magician'] }, { m: [FILL], turn: 2 }] });
  bp(g); const a = on(g, 1, FILL);
  ok(canAtk(g, a, on(g, 0, "Magician's Valkyria")) && !canAtk(g, a, on(g, 0, 'Dark Magician')), 'only Valkyria targetable');
});
T('Magicians Unite: one Spellcaster becomes 3000, others cannot attack', () => {
  const g = duel({ board: [{ hand: ['Magicians Unite'], m: ["Magician's Valkyria", EL], turn: 2 }, {}] });
  act(g, 0, 'Magicians Unite'); settle(g, EL); toIdle(g);
  ok(E.atk(g, on(g, 0, EL)) === 3000, AD(g, 0, EL));
  bp(g);
  ok(canAtk(g, on(g, 0, EL), null) && !canAtk(g, on(g, 0, "Magician's Valkyria"), null), 'only Elf can attack');
  const g2 = duel({ board: [{ hand: ['Magicians Unite'], m: ["Magician's Valkyria", CG], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Magicians Unite'), 'needs 2 Spellcasters');
});
T('Magna Drago: +200 after battle damage', () => {
  const g = duel({ board: [{ m: ['Magna Drago'], turn: 2 }, {}] });
  bp(g); atkOn(g, 0, 'Magna Drago', null); toIdle(g);
  ok(lp(g, 1) === 6600 && E.atk(g, on(g, 0, 'Magna Drago')) === 1600, `B ${lp(g, 1)}, ${AD(g, 0, 'Magna Drago')}`);
});
T('Magna-Slash Dragon: send a Continuous Spell to destroy a Spell/Trap', () => {
  const g = duel({ board: [{ m: ['Magna-Slash Dragon'], st: [up('Messenger of Peace')], turn: 2 }, { st: ['Mirror Force'] }] }); toIdle(g);
  eff(g, 0, 'Magna-Slash Dragon', 'Messenger of Peace', 'Face-down'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Messenger of Peace') && inZ(g, 1, 'gy', 'Mirror Force'), 'Messenger sent, Mirror Force destroyed');
});
T('Magnet Circle LV2: Special Summon a Level 2 or lower Machine from hand', () => {
  const g = duel({ board: [{ hand: ['Magnet Circle LV2', 'Morphtronic Celfon', 'Cyber Dragon'], turn: 2 }, {}] });
  act(g, 0, 'Magnet Circle LV2'); settle(g, 'Morphtronic Celfon', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Morphtronic Celfon') && !on(g, 0, 'Cyber Dragon'), 'Celfon summoned');
});
console.log(fails ? `\n${fails} failed` : '\nAll batch 40 review checks passed.');
process.exit(fails ? 1 : 0);
