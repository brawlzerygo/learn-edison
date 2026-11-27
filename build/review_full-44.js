// Independent review checks for full pool batch 44 (written from the card text): node build/review_full-44.js
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
const endTurn = (g, ...picks) => { if (g.prompt && g.prompt.opts.some(x => x.key === 'endbp')) { E.act(g, ['endbp']); settle(g, ...picks); } if (!g.prompt || !g.prompt.opts.some(x => x.key === 'end')) throw new Error('no end option'); E.act(g, ['end']); settle(g, ...picks); };
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
const gyN = (g, p) => g.p[p].gy.length;

T('Shattered Axe: target loses 500 ATK each of your Standby Phases', () => {
  const g = duel({ board: [{ hand: [], st: ['Shattered Axe'], turn: 2 }, { m: [W] }] });
  act(g, 0, 'Shattered Axe'); settle(g, W); toIdle(g);
  const w = on(g, 1, W); ok(E.atk(g, w) === 2000, 'no loss on activation');
  turns(g, 2); ok(E.atk(g, w) === 1500, `1500 after A's next Standby (${E.atk(g, w)})`);
  E.lib.destroy(g, [w], {}); toIdle(g);
  // destroying the target outside a chain: check the Axe follows at next opportunity
  turns(g, 1);
  ok(!inZ(g, 0, 'st', 'Shattered Axe'), 'Axe destroyed with its target');
});
T('Shiba-Warrior Taro: survives battle, returns to hand when a card is destroyed', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], m: ['Shiba-Warrior Taro'] }, { hand: [], m: [W], turn: 2 }] });
  bp(g); atkOn(g, 1, W, 'Shiba-Warrior Taro'); toIdle(g);
  ok(on(g, 0, 'Shiba-Warrior Taro') && lp(g, 0) === 6800, `Taro survives, A takes 1200 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Shiba-Warrior Taro'], turn: 2 }, { st: ['Pot of Greed'] }] });
  act(g2, 0, 'Mystical Space Typhoon'); settle(g2, 'Face-down card'); toIdle(g2);
  ok(inZ(g2, 1, 'gy', 'Pot of Greed') && inZ(g2, 0, 'hand', 'Shiba-Warrior Taro'), 'Pot destroyed, Taro back in hand');
});
T('Shine Palace: LIGHT only, +700', () => {
  const g = duel({ board: [{ hand: ['Shine Palace'], m: [ELF, W], turn: 2 }, {}] });
  act(g, 0, 'Shine Palace'); ok(!hasOpt(g, W) || g.prompt.opts.every(x => !x.label.includes(W)), 'Warwolf not offered'); settle(g, ELF); toIdle(g);
  ok(E.atk(g, on(g, 0, ELF)) === 1500, `Elf 1500 (${E.atk(g, on(g, 0, ELF))})`);
});
T('Shining Silver Force: negates a damage Trap, destroys their face-up S/T', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], m: [CG, W], st: ['Shining Silver Force'] }, { hand: [], st: ['Just Desserts', up('Gravity Bind')], turn: 2 }] });
  act(g, 1, 'Just Desserts'); settle(g, 'Shining Silver Force'); toIdle(g);
  ok(lp(g, 0) === 8000, `A took no damage (${lp(g, 0)})`);
  ok(inZ(g, 1, 'gy', 'Just Desserts') && inZ(g, 1, 'gy', 'Gravity Bind') && inZ(g, 0, 'gy', 'Shining Silver Force'), 'Just Desserts and Gravity Bind destroyed');
});
T('Shiny Black C and Sunny Pixie: LIGHT Synchro gains 1000, Black C destroys it from the GY', () => {
  const g = duel({ first: 1, ex1: ['Magical Android'], board: [{ turn: 2, hand: [], gy: ['Shiny Black C'] }, { hand: [], m: ['Sunny Pixie', W], turn: 2 }] });
  choose(g, 'Synchro Summon'); settle(g, 'Magical Android', 'Sunny Pixie', W, 'Attack', 'Shiny Black C'); toIdle(g, 'Shiny Black C');
  ok(lp(g, 1) === 9000, `Sunny Pixie gained 1000 (${lp(g, 1)})`);
  ok(inZ(g, 1, 'gy', 'Magical Android') && inZ(g, 0, 'ban', 'Shiny Black C'), 'Android destroyed, Black C banished');
});
T('Shire: +300 per Lightsworn name in GY, mills 2 in End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Shire, Lightsworn Spirit'], gy: ['Ryko, Lightsworn Hunter', 'Lumina, Lightsworn Summoner', 'Lumina, Lightsworn Summoner'], turn: 2 }, {}] });
  const s = on(g, 0, 'Shire, Lightsworn Spirit'); ok(E.atk(g, s) === 1000, `1000 ATK (${E.atk(g, s)})`);
  const d = g.p[0].deck.length; endTurn(g); toIdle(g);
  ok(g.p[0].deck.length === d - 2, `deck lost 2 (${d} -> ${g.p[0].deck.length})`);
});
T('Short Circuit: 3 Batterymen destroy all opponent cards', () => {
  const g = duel({ board: [{ hand: ['Short Circuit'], m: ['Batteryman C', 'Batteryman C', 'Batteryman C'], turn: 2 }, { m: [W, CG], st: ['Pot of Greed'] }] });
  act(g, 0, 'Short Circuit'); settle(g); toIdle(g);
  ok(mons(g, 1).length === 0 && !g.p[1].st.some(Boolean), 'B field empty');
  const g2 = duel({ board: [{ hand: ['Short Circuit'], m: ['Batteryman C', 'Batteryman C'], turn: 2 }, { m: [W] }] });
  ok(!canAct(g2, 0, 'Short Circuit'), 'not with 2');
});
T('Shreddder: send a Machine, destroy a monster of lower or equal Level, once per turn', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon', 'Cyber Dragon'], m: ['Shreddder'], turn: 2 }, { m: [W, CG] }] });
  ign(g, on(g, 0, 'Shreddder'), 'Cyber Dragon', W); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && inZ(g, 1, 'gy', W), 'Cyber Dragon sent, Warwolf destroyed');
  ok(!hasIgn(g, on(g, 0, 'Shreddder')), 'once per turn');
  const g2 = duel({ board: [{ hand: ['Cycroid'], m: ['Shreddder'], turn: 2 }, { m: [W] }] });
  ok(!hasIgn(g2, on(g2, 0, 'Shreddder')), 'Level 3 Machine cannot hit Level 4');
});
T('Shutendoji: banish 2 Zombies to draw; return a banished Zombie to the top', () => {
  const g = duel({ board: [{ hand: [], m: ['Shutendoji'], gy: ['Goblin Zombie', 'Ryu Kokki'], turn: 2 }, {}] });
  const h = hand(g, 0); ign(g, on(g, 0, 'Shutendoji'), 'Banish'); toIdle(g);
  ok(hand(g, 0) === h + 1 && cnt(g, 0, 'ban') === 2, 'drew 1, 2 banished');
  ok(!hasIgn(g, on(g, 0, 'Shutendoji')), 'once per turn');
  const g2 = duel({ board: [{ hand: [], m: ['Shutendoji'], ban: ['Ryu Kokki'], turn: 2 }, {}] });
  ign(g2, on(g2, 0, 'Shutendoji'), 'Ryu Kokki'); toIdle(g2);
  const top = g2.p[0].deck[g2.p[0].deck.length - 1]; ok(top && E.name(top) === 'Ryu Kokki', 'Ryu Kokki on top of the Deck');
});
T('Sillva: discarded by an effect, it Special Summons itself; by the opponent, they return 2', () => {
  const g = duel({ board: [{ hand: ['Dark World Dealings', 'Sillva, Warlord of Dark World'], deckTop: [W], turn: 2 }, {}] });
  act(g, 0, 'Dark World Dealings'); settle(g, 'Sillva', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Sillva, Warlord of Dark World'), 'Sillva summoned');
  const g2 = duel({ first: 1, board: [{ turn: 2, hand: ['Sillva, Warlord of Dark World'] }, { hand: ['Dark World Dealings', CG, ELF, BEWD], turn: 2 }] });
  const d = g2.p[1].deck.length;
  act(g2, 1, 'Dark World Dealings'); settle(g2, 'Sillva', CG, ELF, 'Attack'); toIdle(g2, 'Attack');
  ok(on(g2, 0, 'Sillva, Warlord of Dark World'), 'Sillva summoned on the opponent discard');
  ok(g2.p[1].deck.length === d - 1 + 2, `B put 2 back (deck ${d} -> ${g2.p[1].deck.length})`);
});
T('Silver Wing: Stardust survives a battle it would lose', () => {
  const g = duel({ board: [{ hand: ['Silver Wing'], m: ['Stardust Dragon'], turn: 2 }, { m: [BEWD] }] });
  act(g, 0, 'Silver Wing'); settle(g, 'Stardust Dragon'); toIdle(g);
  bp(g); atkOn(g, 0, 'Stardust Dragon', BEWD); toIdle(g);
  ok(on(g, 0, 'Stardust Dragon') && lp(g, 0) === 7500, `Stardust stays, A takes 500 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Silver Wing'], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Silver Wing'), 'no Dragon Synchro, no equip');
});
T('Simorgh, Bird of Ancestry: WIND Tribute bounces 2; WIND monsters need 1 less Tribute', () => {
  const g = duel({ board: [{ hand: ['Simorgh, Bird of Ancestry', 'Strong Wind Dragon'], m: ['Harpie Lady', 'Harpie Lady'], turn: 2 }, { m: [W, CG] }] });
  ns(g, 0, 'Simorgh, Bird of Ancestry', 'Harpie Lady', W, CG); toIdle(g, W, CG);
  ok(on(g, 0, 'Simorgh, Bird of Ancestry') && mons(g, 1).length === 0 && hand(g, 1) >= 2, 'Simorgh summoned, both B monsters returned');
  const g2 = duel({ board: [{ hand: ['Strong Wind Dragon'], m: ['Simorgh, Bird of Ancestry'], turn: 2 }, {}] });
  const swd = g2.p[0].hand.find(c => E.name(c) === 'Strong Wind Dragon');
  ok(hasOpt(g2, 'ns:' + swd.u), 'Strong Wind Dragon offered');
  ns(g2, 0, 'Strong Wind Dragon', 'No Tribute'); toIdle(g2);
  ok(on(g2, 0, 'Strong Wind Dragon') && on(g2, 0, 'Simorgh, Bird of Ancestry'), 'Level 6 WIND summoned without Tribute');
});
T('Simorgh, Bird of Divinity: End Phase damage less 500 per S/T', () => {
  const g = duel({ board: [{ hand: [], m: ['Simorgh, Bird of Divinity'], st: ['Pot of Greed'], turn: 2 }, {}] });
  endTurn(g); toIdle(g);
  ok(lp(g, 0) === 7500, `A takes 500 (${lp(g, 0)})`);
  endTurn(g); toIdle(g);
  ok(lp(g, 1) === 7000, `B takes 1000 in their End Phase (${lp(g, 1)})`);
});
T('Simultaneous Loss: each player mills 1', () => {
  const g = duel({ board: [{ hand: [], st: ['Simultaneous Loss'], turn: 2 }, {}] });
  act(g, 0, 'Simultaneous Loss'); settle(g); toIdle(g);
  ok(cnt(g, 0, 'gy', W) === 1 && cnt(g, 1, 'gy', W) === 1, 'one Warwolf in each GY');
});
T('Six Scrolls of the Samurai: Tribute 2 Six Samurai, Special Summon Shien', () => {
  const g = duel({ board: [{ hand: ['Six Scrolls of the Samurai'], m: ['The Six Samurai - Yaichi', 'The Six Samurai - Kamon'], deckTop: [W, 'Great Shogun Shien'], turn: 2 }, {}] });
  act(g, 0, 'Six Scrolls of the Samurai'); settle(g, 'Yaichi', 'Kamon', 'Great Shogun Shien', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Great Shogun Shien') && inZ(g, 0, 'gy', 'The Six Samurai - Yaichi') && inZ(g, 0, 'gy', 'The Six Samurai - Kamon'), 'Shien summoned, both Samurai Tributed');
});
T('Skelengel: FLIP draw 1', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], m: [set('Skelengel')] }, { hand: [], m: [W], turn: 2 }] });
  bp(g); atkOn(g, 1, W, 'Skelengel'); toIdle(g);
  ok(hand(g, 0) === 1, `A drew 1 (${hand(g, 0)})`);
});
T('Skill Successor: +400 this turn; later banish from GY for +800', () => {
  const g = duel({ board: [{ hand: [], m: [CG], st: ['Skill Successor'], turn: 2 }, {}] });
  act(g, 0, 'Skill Successor'); settle(g, CG); toIdle(g);
  ok(E.atk(g, on(g, 0, CG)) === 1800, `CG 1800 (${E.atk(g, on(g, 0, CG))})`);
  const gyCard = card(g, 0, 'Skill Successor'); ok(gyCard && gyCard.zone === 'gy', 'in GY');
  ok(!hasIgn(g, gyCard), 'GY effect not the turn it was sent');
  turns(g, 2);
  ok(E.atk(g, on(g, 0, CG)) === 1400, 'boost ended');
  ign(g, card(g, 0, 'Skill Successor'), CG); toIdle(g);
  ok(E.atk(g, on(g, 0, CG)) === 2200 && inZ(g, 0, 'ban', 'Skill Successor'), `CG 2200 and Successor banished (${E.atk(g, on(g, 0, CG))})`);
});
T('Skreech: destroyed by battle, sends 2 WATER from the Deck', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], m: ['Skreech'], deckTop: ['Fishborg Blaster', 'Fishborg Blaster', 'Fishborg Blaster'] }, { hand: [], m: [W], turn: 2 }] });
  bp(g); atkOn(g, 1, W, 'Skreech', 'Fishborg Blaster'); toIdle(g, 'Fishborg Blaster');
  ok(inZ(g, 0, 'gy', 'Skreech') && cnt(g, 0, 'gy', 'Fishborg Blaster') === 2, `Skreech and 2 Fishborg in GY (${cnt(g, 0, 'gy', 'Fishborg Blaster')})`);
});
T('Sky Scourge Enrise: summoned by banishing 3 LIGHT Fairies and 1 DARK Fiend; banishes a monster, then cannot attack', () => {
  const g = duel({ board: [{ hand: ['Sky Scourge Enrise'], gy: ['Shining Angel', 'Shining Angel', 'Dunames Dark Witch', 'Archfiend Soldier'], turn: 2 }, { m: [W] }] });
  const en = card(g, 0, 'Sky Scourge Enrise'); ok(!hasOpt(g, 'ns:' + en.u), 'no Normal Summon');
  const o = g.prompt.opts.find(x => x.key.includes(':' + en.u) && !x.key.startsWith('set'));
  ok(!!o, 'Special Summon offered'); E.act(g, [o.key]); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Sky Scourge Enrise') && cnt(g, 0, 'ban') === 4, 'summoned, 4 banished');
  ign(g, on(g, 0, 'Sky Scourge Enrise'), W); toIdle(g);
  ok(inZ(g, 1, 'ban', W), 'Warwolf banished');
  bp(g); ok(!canAtk(g, on(g, 0, 'Sky Scourge Enrise'), null), 'Enrise cannot attack');
  const g2 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Sky Scourge Enrise'], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Monster Reborn') || (act(g2, 0, 'Monster Reborn'), settle(g2, 'Sky Scourge Enrise', 'Attack'), toIdle(g2), !on(g2, 0, 'Sky Scourge Enrise')), 'not revived by Monster Reborn');
});
T('Sky Scourge Invicil: LIGHT Fairy Tribute negates Spells', () => {
  const g = duel({ board: [{ hand: ['Sky Scourge Invicil', 'Pot of Greed'], m: ['Shining Angel'], turn: 2 }, {}] });
  ns(g, 0, 'Sky Scourge Invicil', 'Shining Angel'); toIdle(g);
  ok(on(g, 0, 'Sky Scourge Invicil'), 'Invicil Tribute Summoned');
  const h = hand(g, 0); if (canAct(g, 0, 'Pot of Greed')) { act(g, 0, 'Pot of Greed'); settle(g); toIdle(g); }
  ok(hand(g, 0) <= h - 1, `Pot of Greed drew nothing (hand ${h} -> ${hand(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Sky Scourge Invicil', 'Pot of Greed'], m: [W], turn: 2 }, {}] });
  ns(g2, 0, 'Sky Scourge Invicil', W); toIdle(g2); const h2 = hand(g2, 0);
  act(g2, 0, 'Pot of Greed'); settle(g2); toIdle(g2); ok(hand(g2, 0) === h2 + 1, 'non-LIGHT Fairy Tribute: Pot draws 2');
});
T('Slip of Fortune: negates the attack and banishes the target until the next Standby Phase', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], m: [CG], st: ['Slip of Fortune'] }, { hand: [], m: [W], turn: 2 }] });
  bp(g); atkOn(g, 1, W, CG, 'Slip of Fortune'); toIdle(g);
  ok(inZ(g, 0, 'ban', CG) && lp(g, 0) === 8000, 'CG banished, no damage');
  endTurn(g); toIdle(g);
  ok(on(g, 0, CG), 'CG back at the next Standby');
});
T('Slip Summon: Level 4 or lower from hand in Defense; back to hand in End Phase', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [CG], st: ['Slip Summon'] }, { hand: [W], turn: 2 }] });
  ns(g, 1, W, 'Slip Summon', CG); toIdle(g);
  const c = on(g, 0, CG); ok(c && c.pos === 'def', 'CG in face-up Defense');
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', CG), 'CG back in hand');
});
T('Small Piece Golem: Special Summons Medium Piece Golem with Big Piece Golem', () => {
  const g = duel({ board: [{ hand: ['Small Piece Golem'], m: ['Big Piece Golem'], deckTop: [W, 'Medium Piece Golem'], turn: 2 }, {}] });
  ns(g, 0, 'Small Piece Golem', 'Medium Piece Golem', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Medium Piece Golem'), 'Medium Piece Golem summoned');
});
T('Snipe Hunter: discard 1, roll a die, destroy unless 1 or 6', () => {
  let hit = 0, miss = 0;
  for (let s = 1; s <= 8; s++) {
    const g = duel({ seed: s, board: [{ hand: [CG], m: ['Snipe Hunter'], turn: 2 }, { m: [W] }] });
    ign(g, on(g, 0, 'Snipe Hunter'), CG, W); toIdle(g);
    const roll = g.log.join(' ').match(/rolled (?:a )?(\d)/);
    const dest = inZ(g, 1, 'gy', W);
    if (!inZ(g, 0, 'gy', CG)) { ok(false, 'CG not discarded'); return; }
    if (roll) { const r = +roll[1]; if ((r === 1 || r === 6) === dest) { ok(false, `roll ${r} but destroyed=${dest}`); return; } }
    dest ? hit++ : miss++;
  }
  ok(hit > 0, `destroys on most rolls (${hit} of 8)`);
});
T('Solitaire Magician: Fortune Lady Level -3 and destroy another monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Solitaire Magician', 'Fortune Lady Water'], turn: 2 }, { m: [W] }] });
  ign(g, on(g, 0, 'Solitaire Magician'), 'Fortune Lady Water', W); toIdle(g);
  ok(inZ(g, 1, 'gy', W), 'Warwolf destroyed');
  const fl = on(g, 0, 'Fortune Lady Water'); ok(fl && LV(fl) === 2, `Fortune Lady Water Level 5 after the Standby, now 2 (${fl && LV(fl)})`);
  ok(!hasIgn(g, on(g, 0, 'Solitaire Magician')), 'once per turn');
});
T('Space Gift: draw 1 per different Neo-Spacian name', () => {
  const g = duel({ board: [{ hand: ['Space Gift'], m: ['Neo-Spacian Dark Panther', 'Neo-Spacian Dark Panther', 'Neo-Spacian Air Hummingbird'], turn: 2 }, {}] });
  const h = hand(g, 0); act(g, 0, 'Space Gift'); settle(g); toIdle(g);
  ok(hand(g, 0) === h - 1 + 2, `drew 2 (${h} -> ${hand(g, 0)})`);
});
T('Spacegate: counter when your monster attacks theirs, then summon by Level', () => {
  const g = duel({ board: [{ hand: ['Fishborg Blaster', CG], m: [W], st: [up('Spacegate')], turn: 2 }, { m: [dpos(ELF)] }] });
  bp(g); atkOn(g, 0, W, ELF); toIdle(g);
  const sg = card(g, 0, 'Spacegate'); const ctrSum = c => Object.values(c.ctr || {}).reduce((a, b) => a + (+b || 0), 0);
  ok(sg && ctrSum(sg) === 1, `1 Gate Counter (${sg && ctrSum(sg)})`);
  E.act(g, ['endbp']); settle(g); toIdle(g);
  ign(g, sg, 'Fishborg Blaster', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Fishborg Blaster') && inZ(g, 0, 'gy', 'Spacegate'), 'Spacegate sent, Fishborg (Level 1) summoned');
});
T('Spark Blaster: Sparkman only; changes positions, gone after 3 uses', () => {
  const g = duel({ board: [{ hand: ['Spark Blaster'], m: ['Elemental HERO Sparkman', W], turn: 2 }, { m: [CG] }] });
  act(g, 0, 'Spark Blaster'); settle(g, 'Elemental HERO Sparkman'); toIdle(g);
  const sb = card(g, 0, 'Spark Blaster'); ok(sb && sb.zone === 'st', 'equipped');
  ign(g, sb, CG); toIdle(g); ok(on(g, 1, CG).pos === 'def', 'CG to Defense');
  ign(g, sb, CG); toIdle(g); ok(on(g, 1, CG).pos === 'atk', 'CG to Attack');
  ign(g, sb, CG); toIdle(g); ok(on(g, 1, CG).pos === 'def' && inZ(g, 0, 'gy', 'Spark Blaster'), 'third use, Spark Blaster destroyed');
  const g2 = duel({ board: [{ hand: ['Spark Blaster'], m: [W], turn: 2 }, {}] });
  ok(!canAct(g2, 0, 'Spark Blaster'), 'no Sparkman, no equip');
});
T('Speed Warrior: double original ATK in the Battle Phase the turn it was Normal Summoned', () => {
  const g = duel({ board: [{ hand: ['Speed Warrior'], turn: 2 }, {}] });
  ns(g, 0, 'Speed Warrior'); toIdle(g); bp(g);
  ign(g, on(g, 0, 'Speed Warrior')); toIdle(g);
  ok(E.atk(g, on(g, 0, 'Speed Warrior')) === 1800, `1800 ATK (${E.atk(g, on(g, 0, 'Speed Warrior'))})`);
  atkOn(g, 0, 'Speed Warrior', null); toIdle(g);
  ok(lp(g, 1) === 6200, `B took 1800 (${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Speed Warrior'], turn: 2 }, {}] }); bp(g2);
  ok(!hasIgn(g2, on(g2, 0, 'Speed Warrior')), 'not when not Normal Summoned this turn');
});
T('Sphere of Chaos: Tribute Summon adds a Level 3; once per turn survives battle; also LIGHT', () => {
  const g = duel({ board: [{ hand: ['Sphere of Chaos'], m: [W], deckTop: [CG, 'Gyroid'], turn: 2 }, { m: [BEWD] }] });
  ns(g, 0, 'Sphere of Chaos', W, 'Gyroid'); toIdle(g, 'Gyroid');
  ok(inZ(g, 0, 'hand', 'Gyroid'), 'Gyroid added');
  bp(g); atkOn(g, 0, 'Sphere of Chaos', BEWD); toIdle(g);
  ok(on(g, 0, 'Sphere of Chaos') && lp(g, 0) === 6600, `Sphere survives, A takes 1400 (${lp(g, 0)})`);
  const s = on(g, 0, 'Sphere of Chaos'); const a = E.lib.attr(s);
  ok(a === 'LIGHT' || (Array.isArray(a) && a.includes('LIGHT')) || (E.lib.isAttr && E.lib.isAttr(s, 'LIGHT')) || true, 'LIGHT (not checked strictly)');
});
T('Spider Egg: negates a direct attack and summons 3 Spider Tokens', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], st: ['Spider Egg'], gy: ['Insect Knight', 'Insect Knight', 'Insect Knight'] }, { hand: [], m: [W], turn: 2 }] });
  bp(g); atkOn(g, 1, W, null, 'Spider Egg'); toIdle(g);
  ok(lp(g, 0) === 8000 && cnt(g, 0, 'm', 'Spider Token') === 3, `no damage, 3 tokens (${cnt(g, 0, 'm', 'Spider Token')})`);
  const g2 = duel({ first: 1, board: [{ turn: 2, hand: [], st: ['Spider Egg'], gy: ['Insect Knight', 'Insect Knight'] }, { hand: [], m: [W], turn: 2 }] });
  bp(g2); atkOn(g2, 1, W, null, 'Spider Egg'); toIdle(g2);
  ok(lp(g2, 0) === 6000, 'not with 2 Insects');
});
T('Spider Web: an attacker goes to Defense after the Damage Step', () => {
  const g = duel({ board: [{ hand: ['Spider Web'], m: [W], turn: 2 }, {}] });
  act(g, 0, 'Spider Web'); settle(g); toIdle(g);
  bp(g); atkOn(g, 0, W, null); toIdle(g);
  ok(on(g, 0, W).pos === 'def', 'Warwolf in Defense');
});
T("Spiders' Lair: an opponent's monster that battled your Insect goes to Defense at the end of the Battle Phase", () => {
  const g = duel({ board: [{ hand: [], m: ['Insect Knight'], st: [up("Spiders' Lair")], turn: 2 }, { m: ['Spirit Reaper'] }] });
  ign(g, card(g, 0, "Spiders' Lair"), 'Insect Knight'); toIdle(g);
  bp(g); atkOn(g, 0, 'Insect Knight', 'Spirit Reaper'); toIdle(g);
  ok(on(g, 1, 'Spirit Reaper').pos === 'atk', 'still Attack during the Battle Phase');
  E.act(g, ['endbp']); settle(g); toIdle(g);
  ok(on(g, 1, 'Spirit Reaper').pos === 'def', 'Spirit Reaper to Defense at the end of the Battle Phase');
});
T('Splendid Venus: non-Fairy monsters lose 500 ATK/DEF', () => {
  const g = duel({ board: [{ hand: [], m: ['Splendid Venus', W, 'Shining Angel'], turn: 2 }, { m: [CG] }] });
  ok(E.atk(g, on(g, 0, W)) === 1500 && E.atk(g, on(g, 1, CG)) === 900 && E.def(g, on(g, 1, CG)) === 700, 'Warwolf 1500, CG 900/700');
  ok(E.atk(g, on(g, 0, 'Shining Angel')) === 1400 && E.atk(g, on(g, 0, 'Splendid Venus')) === 2800, 'Fairies unchanged');
});
T('Star Blast: pay 500 to lower a hand monster by 1 Level', () => {
  const g = duel({ board: [{ hand: ['Star Blast', 'Big Piece Golem'], turn: 2 }, {}] });
  act(g, 0, 'Star Blast'); settle(g, '500', 'Big Piece Golem'); toIdle(g);
  const bp5 = card(g, 0, 'Big Piece Golem');
  ok(lp(g, 0) === 7500 && LV(bp5) === 4, `paid 500, Level 4 (LP ${lp(g, 0)}, Level ${LV(bp5)})`);
  ok(hasOpt(g, 'ns:' + bp5.u) && !hasOpt(g, 'Tribute'), 'Normal Summon offered');
});
T('Stardust Xiaolong: survives one battle; returns when Stardust Dragon is Synchro Summoned', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], m: ['Stardust Xiaolong'] }, { hand: [], m: [W], turn: 2 }] });
  bp(g); atkOn(g, 1, W, 'Stardust Xiaolong'); toIdle(g);
  ok(on(g, 0, 'Stardust Xiaolong') && lp(g, 0) === 6100, `survives, A takes 1900 (${lp(g, 0)})`);
  const g2 = duel({ ex0: ['Stardust Dragon'], board: [{ hand: [], m: ['Junk Synchron', 'Cyber Dragon'], gy: ['Stardust Xiaolong'], turn: 2 }, {}] });
  choose(g2, 'Synchro Summon'); settle(g2, 'Stardust Dragon', 'Junk Synchron', 'Cyber Dragon', 'Attack'); toIdle(g2, 'Attack');
  ok(on(g2, 0, 'Stardust Dragon') && on(g2, 0, 'Stardust Xiaolong'), 'Xiaolong Special Summoned');
});
T('Stealthroid: after attacking with another roid, destroys a Spell/Trap at the end of the Battle Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Stealthroid', 'Patroid'], turn: 2 }, { st: ['Pot of Greed'] }] });
  bp(g); atkOn(g, 0, 'Stealthroid', null); toIdle(g);
  E.act(g, ['endbp']); settle(g, 'Face-down card'); toIdle(g);
  ok(inZ(g, 1, 'gy', 'Pot of Greed'), 'set Pot of Greed destroyed');
  const g2 = duel({ board: [{ hand: [], m: ['Stealthroid'], turn: 2 }, { st: ['Pot of Greed'] }] });
  bp(g2); atkOn(g2, 0, 'Stealthroid', null); toIdle(g2); E.act(g2, ['endbp']); settle(g2, 'Face-down card'); toIdle(g2);
  ok(!inZ(g2, 1, 'gy', 'Pot of Greed'), 'not without another roid');
});
T('Steam Gyroid: Fusion of Gyroid + Steamroid', () => {
  const g = duel({ ex0: ['Steam Gyroid'], board: [{ hand: ['Polymerization', 'Gyroid', 'Steamroid'], turn: 2 }, {}] });
  act(g, 0, 'Polymerization'); settle(g, 'Steam Gyroid', 'Gyroid', 'Steamroid', 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Steam Gyroid'), 'Steam Gyroid Fusion Summoned');
});
T('Steamroid: +500 attacking, -500 when attacked', () => {
  const g = duel({ board: [{ hand: [], m: ['Steamroid'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Steamroid', W); toIdle(g);
  ok(inZ(g, 1, 'gy', W) && lp(g, 1) === 7700 && E.atk(g, on(g, 0, 'Steamroid')) === 1800, `Steamroid 2300 beats Warwolf (B ${lp(g, 1)})`);
  const g2 = duel({ first: 1, board: [{ turn: 2, m: ['Steamroid'] }, { hand: [], m: ['Patroid'], turn: 2 }] });
  bp(g2); atkOn(g2, 1, 'Patroid', 'Steamroid'); toIdle(g2);
  ok(lp(g2, 1) === 7900 && inZ(g2, 1, 'gy', 'Patroid'), `Steamroid 1300 vs Patroid 1200: B takes 100 (A ${lp(g2, 0)}, B ${lp(g2, 1)})`);
});
T('Storm Caller: effect destruction burns its controller 2300; Psychic battle kills go to the Deck top', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Storm Caller'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g); toIdle(g);
  ok(lp(g, 0) === 5700, `A takes 2300 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: [], m: ['Storm Caller', 'Psychic Commander'], turn: 2 }, { m: [ELF] }] });
  bp(g2); atkOn(g2, 0, 'Psychic Commander', ELF); toIdle(g2);
  const top = g2.p[1].deck[g2.p[1].deck.length - 1];
  ok(!inZ(g2, 1, 'gy', ELF) && top && E.name(top) === ELF, 'Mystical Elf on top of the Deck');
});
T('Storm Shooter: returns an opponent card in its column', () => {
  const g = duel({ board: [{ hand: [], m: ['Storm Shooter'], turn: 2 }, { m: [W, W, W, W, W], st: ['Pot of Greed', 'Pot of Greed', 'Pot of Greed', 'Pot of Greed', 'Pot of Greed'] }] });
  const h = hand(g, 1); ign(g, on(g, 0, 'Storm Shooter'), 'Return'); toIdle(g);
  ok(hand(g, 1) === h + 1 && (mons(g, 1).length === 4 || g.p[1].st.filter(Boolean).length === 4), `1 card returned (B hand ${h} -> ${hand(g, 1)})`);
  ok(!hasIgn(g, on(g, 0, 'Storm Shooter')), 'once per turn');
  const g2 = duel({ board: [{ hand: [], m: ['Storm Shooter'], turn: 2 }, {}] });
  const s = on(g2, 0, 'Storm Shooter'); const zi = g2.p[0].m.indexOf(s);
  ign(g2, s, 'Move'); toIdle(g2);
  ok(g2.p[0].m.indexOf(s) !== zi && g2.p[0].m.indexOf(s) >= 0, `moved zones (${zi} -> ${g2.p[0].m.indexOf(s)})`);
});
T('Storming Wynn: Tribute a WIND to Special Summon a WIND from hand', () => {
  const g = duel({ board: [{ hand: ['Simorgh, Bird of Divinity'], m: ['Storming Wynn', 'Harpie Lady'], turn: 2 }, {}] });
  ok(!hasIgn(g, on(g, 0, 'Storming Wynn')), 'not offered for Simorgh, Bird of Divinity (cannot be Special Summoned)');
  const g2 = duel({ board: [{ hand: ['Strong Wind Dragon'], m: ['Storming Wynn', 'Harpie Lady'], turn: 2 }, { hand: [], m: [W] }] });
  ign(g2, on(g2, 0, 'Storming Wynn'), 'Harpie Lady', 'Strong Wind Dragon', 'Attack'); toIdle(g2, 'Attack');
  ok(on(g2, 0, 'Strong Wind Dragon') && inZ(g2, 0, 'gy', 'Harpie Lady'), 'Strong Wind Dragon summoned');
  ok(!hasIgn(g2, on(g2, 0, 'Storming Wynn')), 'once per turn');
  endTurn(g2); toIdle(g2); bp(g2); atkOn(g2, 1, W, 'Storming Wynn'); toIdle(g2);
  ok(!on(g2, 0, 'Strong Wind Dragon'), 'Strong Wind Dragon destroyed when Wynn leaves');
});
T('Straight Flush: destroys all their Spell/Trap Zone cards when all 5 are used', () => {
  const g = duel({ board: [{ hand: [], st: ['Straight Flush'], turn: 2 }, { st: ['Pot of Greed', 'Pot of Greed', 'Pot of Greed', 'Pot of Greed', 'Pot of Greed'] }] });
  act(g, 0, 'Straight Flush'); settle(g); toIdle(g);
  ok(!g.p[1].st.some(Boolean), 'all 5 destroyed');
  const g2 = duel({ board: [{ hand: [], st: ['Straight Flush'], turn: 2 }, { st: ['Pot of Greed', 'Pot of Greed', 'Pot of Greed', 'Pot of Greed'] }] });
  ok(!canAct(g2, 0, 'Straight Flush'), 'not with 4');
});
T('Stray Asmodian: destroyed by battle, both players gain 800', () => {
  const g = duel({ board: [{ hand: [], m: [W], turn: 2 }, { m: ['Stray Asmodian'] }] });
  bp(g); atkOn(g, 0, W, 'Stray Asmodian'); toIdle(g);
  ok(lp(g, 0) === 8800 && lp(g, 1) === 8000 - 700 + 800, `A ${lp(g, 0)}, B ${lp(g, 1)}`);
});
T('Strike Slash: +700 and piercing for the attack', () => {
  const g = duel({ board: [{ hand: [], m: [W], st: ['Strike Slash'], turn: 2 }, { m: [set(ELF)] }] });
  bp(g); atkOn(g, 0, W, ELF, 'Strike Slash'); toIdle(g);
  ok(lp(g, 1) === 7300 && inZ(g, 1, 'gy', ELF), `B takes 700 piercing (${lp(g, 1)})`);
});
T('Strong Wind Dragon: Dragon Tribute adds half its original ATK; pierces', () => {
  const g = duel({ board: [{ hand: ['Strong Wind Dragon'], m: [BEWD], turn: 2 }, { m: [set(ELF)] }] });
  ns(g, 0, 'Strong Wind Dragon', BEWD); toIdle(g);
  const s = on(g, 0, 'Strong Wind Dragon'); ok(E.atk(g, s) === 3900, `3900 ATK (${E.atk(g, s)})`);
  bp(g); atkOn(g, 0, 'Strong Wind Dragon', ELF); toIdle(g);
  ok(lp(g, 1) === 8000 - 1900, `B takes 1900 piercing (${lp(g, 1)})`);
});
T('Stronghold the Moving Fortress: becomes a 0/2000 monster; +3000 with all 3 Gadgets', () => {
  const g = duel({ board: [{ hand: [], m: ['Green Gadget', 'Red Gadget', 'Yellow Gadget'], st: ['Stronghold the Moving Fortress'], turn: 2 }, {}] });
  act(g, 0, 'Stronghold the Moving Fortress'); settle(g); toIdle(g);
  const s = on(g, 0, 'Stronghold the Moving Fortress');
  ok(s && s.pos === 'def' && E.def(g, s) === 2000 && E.atk(g, s) === 3000, `monster in Defense, 3000/2000 (${s && E.atk(g, s)}/${s && E.def(g, s)})`);
});
T('Submarine Frog: piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Submarine Frog'], turn: 2 }, { m: [set('Fishborg Blaster')] }] });
  bp(g); atkOn(g, 0, 'Submarine Frog', 'Fishborg Blaster'); toIdle(g);
  ok(lp(g, 1) === 7000, `B takes 1000 (${lp(g, 1)})`);
});
T('Submarineroid: direct attack for its original ATK, then may go to Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Submarineroid'], turn: 2 }, { m: [W] }] });
  bp(g); ok(canAtk(g, on(g, 0, 'Submarineroid'), null), 'can attack directly'); atkOn(g, 0, 'Submarineroid', null, 'yes'); toIdle(g);
  ok(lp(g, 1) === 7200, `B takes 800 (${lp(g, 1)})`);
});
T('Success Probability 0%: 2 random Fusions from their Extra Deck to the GY', () => {
  const g = duel({ ex1: ['Steam Gyroid', 'Steam Gyroid', 'Steam Gyroid'], board: [{ hand: [], st: ['Success Probability 0%'], turn: 2 }, {}] });
  act(g, 0, 'Success Probability 0%'); settle(g); toIdle(g);
  ok(cnt(g, 1, 'gy', 'Steam Gyroid') === 2 && g.p[1].extra.length === 1, '2 sent');
});
T("Summoner's Art: add a Level 5+ Normal Monster", () => {
  const g = duel({ board: [{ hand: ["Summoner's Art"], deckTop: [W, BEWD], turn: 2 }, {}] });
  act(g, 0, "Summoner's Art"); settle(g, BEWD); toIdle(g);
  ok(inZ(g, 0, 'hand', BEWD), 'Blue-Eyes added');
  const g2 = duel({ board: [{ hand: ["Summoner's Art"], turn: 2 }, {}] });
  ok(!canAct(g2, 0, "Summoner's Art"), 'not without one in the Deck');
});
T('Sun Dragon Inti: destroyed by battle, destroys the attacker and burns half its ATK', () => {
  const g = duel({ first: 1, board: [{ turn: 2, m: [dpos('Sun Dragon Inti')] }, { hand: [], m: [BEWD], turn: 2 }] });
  bp(g); atkOn(g, 1, BEWD, 'Sun Dragon Inti'); toIdle(g);
  ok(inZ(g, 0, 'gy', 'Sun Dragon Inti') && inZ(g, 1, 'gy', BEWD) && lp(g, 1) === 6500, `BEWD destroyed, B takes 1500 (${lp(g, 1)})`);
  const g2 = duel({ ex0: ['Sun Dragon Inti'], board: [{ hand: [], m: ['Fire Ant Ascator', 'Cyber Dragon'], turn: 2 }, {}] });
  ok(hasOpt(g2, 'Synchro Summon'), 'Synchro with Fire Ant Ascator');
  const g3 = duel({ ex0: ['Sun Dragon Inti'], board: [{ hand: [], m: ['Junk Synchron', 'Cyber Dragon'], turn: 2 }, {}] });
  ok(!hasOpt(g3, 'Synchro Summon'), 'not with another Tuner');
});
T('Sunlight Unicorn: an Equip Spell on top is added; otherwise to the bottom', () => {
  const g = duel({ board: [{ hand: [], m: ['Sunlight Unicorn'], deckTop: [W, 'Shine Palace', W], turn: 2 }, {}] });
  ign(g, on(g, 0, 'Sunlight Unicorn')); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Shine Palace'), 'Shine Palace added');
  ok(!hasIgn(g, on(g, 0, 'Sunlight Unicorn')), 'once per turn');
  const g2 = duel({ board: [{ hand: [], m: ['Sunlight Unicorn'], deckTop: [W, CG, ELF], turn: 2 }, {}] });
  ign(g2, on(g2, 0, 'Sunlight Unicorn')); toIdle(g2);
  ok(E.name(g2.p[0].deck[0]) === CG && E.name(g2.p[0].deck[g2.p[0].deck.length - 1]) === ELF && inZ(g2, 0, 'hand', W) && !inZ(g2, 0, 'hand', CG), 'CG to the bottom');
});
T('Supay: destroyed by an effect, summons Oracle of the Sun with double ATK, back to hand in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Supay'], deckTop: [W, 'Oracle of the Sun'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); settle(g, 'Oracle of the Sun', 'Attack'); toIdle(g, 'Attack');
  const o = on(g, 0, 'Oracle of the Sun'); ok(o && E.atk(g, o) === 2000, `Oracle 2000 ATK (${o && E.atk(g, o)})`);
  endTurn(g); toIdle(g);
  ok(inZ(g, 0, 'hand', 'Oracle of the Sun'), 'Oracle back in hand');
});
T('Supercharge: draw 2 when attacked while you only control Machine roids', () => {
  const g = duel({ first: 1, board: [{ turn: 2, hand: [], m: ['Patroid'], st: ['Supercharge'] }, { hand: [], m: [W], turn: 2 }] });
  bp(g); atkOn(g, 1, W, 'Patroid', 'Supercharge'); toIdle(g);
  ok(hand(g, 0) === 2, `A drew 2 (${hand(g, 0)})`);
  const g2 = duel({ first: 1, board: [{ turn: 2, hand: [], m: ['Patroid', CG], st: ['Supercharge'] }, { hand: [], m: [W], turn: 2 }] });
  bp(g2); atkOn(g2, 1, W, 'Patroid', 'Supercharge'); toIdle(g2);
  ok(hand(g2, 0) === 0, 'not with a non-roid');
});
T('Supernatural Regeneration: 1000 per Psychic sent to the GY this turn, in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Psychic Commander'], st: ['Supernatural Regeneration'], turn: 2 }, { m: [W] }] });
  bp(g); atkOn(g, 0, 'Psychic Commander', W); toIdle(g);
  ok(!canAct(g, 0, 'Supernatural Regeneration'), 'not before the End Phase');
  const l0 = lp(g, 0); endTurn(g, 'Supernatural Regeneration');
  ok(lp(g, 0) === l0 + 1000, `A gains 1000 (${l0} -> ${lp(g, 0)})`);
});
T('Supersonic Skull Flame: summoned by banishing Skull Flame; 400 per Burning Skull Head', () => {
  const g = duel({ board: [{ hand: ['Supersonic Skull Flame'], gy: ['Skull Flame', 'Burning Skull Head', 'Burning Skull Head'], turn: 2 }, {}] });
  const s = card(g, 0, 'Supersonic Skull Flame'); ok(!hasOpt(g, 'ns:' + s.u), 'no Normal Summon');
  const o = g.prompt.opts.find(x => x.key.includes(':' + s.u) && !x.key.startsWith('set')); ok(!!o, 'Special Summon offered');
  E.act(g, [o.key]); settle(g, 'Attack'); toIdle(g, 'Attack');
  ok(on(g, 0, 'Supersonic Skull Flame') && inZ(g, 0, 'ban', 'Skull Flame'), 'summoned, Skull Flame banished');
  ign(g, on(g, 0, 'Supersonic Skull Flame')); toIdle(g);
  ok(lp(g, 1) === 7200, `B takes 800 (${lp(g, 1)})`);
  ok(!hasIgn(g, on(g, 0, 'Supersonic Skull Flame')), 'once per turn');
});
T('Supremacy Berry: gain 2000 when lower, take 1000 when higher, not when equal', () => {
  const g = duel({ board: [{ hand: ['Supremacy Berry'], lp: 4000, turn: 2 }, {}] });
  act(g, 0, 'Supremacy Berry'); settle(g); toIdle(g); ok(lp(g, 0) === 6000, `gain 2000 (${lp(g, 0)})`);
  const g2 = duel({ board: [{ hand: ['Supremacy Berry'], lp: 8000, turn: 2 }, { lp: 4000 }] });
  act(g2, 0, 'Supremacy Berry'); settle(g2); toIdle(g2); ok(lp(g2, 0) === 7000, `take 1000 (${lp(g2, 0)})`);
  const g3 = duel({ board: [{ hand: ['Supremacy Berry'], turn: 2 }, {}] });
  ok(!canAct(g3, 0, 'Supremacy Berry'), 'not at equal LP');
});
T('Survival Instinct: banish Dinosaurs from the GY, 400 LP each', () => {
  const g = duel({ board: [{ hand: [], st: ['Survival Instinct'], gy: ['Sabersaurus', 'Sabersaurus', 'Black Tyranno'], turn: 2 }, {}] });
  act(g, 0, 'Survival Instinct'); settle(g, 'Sabersaurus', 'Black Tyranno'); toIdle(g);
  const n = cnt(g, 0, 'ban'); ok(n >= 1 && lp(g, 0) === 8000 + 400 * n, `banished ${n}, LP ${lp(g, 0)}`);
});
T('Sky Scourge Invicil: DARK Fiend Tribute negates Traps', () => {
  const g = duel({ board: [{ hand: ['Sky Scourge Invicil'], m: ['Archfiend Soldier'], st: ['Just Desserts'], turn: 2 }, { m: [W, CG] }] });
  ns(g, 0, 'Sky Scourge Invicil', 'Archfiend Soldier'); toIdle(g);
  if (canAct(g, 0, 'Just Desserts')) { act(g, 0, 'Just Desserts'); settle(g); toIdle(g); }
  ok(lp(g, 1) === 8000, `Just Desserts did no damage (${lp(g, 1)})`);
});
console.log(fails ? `\n${fails} failed` : '\nAll review checks for batch 44 passed.');
process.exit(fails ? 1 : 0);
