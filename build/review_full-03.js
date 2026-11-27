// Independent review of full pool batch 03, written from the card text: node build/review_full-03.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
let cur = null;
function duel(o = {}) {
  const mk = (ex, main) => ({ name: 't', main: (main || Array(40).fill(FILL)).map(id), extra: (ex || []).map(id) });
  cur = E.newDuel({ decks: [mk(o.ex0, o.main0), mk(o.ex1, o.main1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
  return cur;
}
let fails = 0;
const VERBOSE = process.argv.includes('-v');
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) { fails++; if (VERBOSE && cur) console.log('   log: ' + cur.log.slice(-12).join(' / ')); } }
const pr = g => g.prompt ? `${g.prompt.p} ${g.prompt.type} "${g.prompt.text}" [${g.prompt.opts.map(o => o.label).join(', ')}]` : 'none';
function choose(g, text, who) {
  const p = g.prompt; if (!p) throw new Error('no prompt for ' + text);
  if (who != null && p.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr(g)}`);
  const o = p.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr(g)}`);
  E.act(g, [o.key]);
}
const ZONES = ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra'];
const byU = (g, u) => { for (const P of g.p) { for (const z of ZONES) for (const c of P[z]) if (c && c.u === u) return c; if (P.fz && P.fz.u === u) return P.fz; } return null; };
const optFor = (g, n, pre = 'a:') => g.prompt && g.prompt.opts.find(o => o.key.startsWith(pre) && o.u != null && byU(g, o.u) && E.name(byU(g, o.u)) === n);
const canUse = (g, n) => !!optFor(g, n);
function use(g, n) { const o = optFor(g, n); if (!o) throw new Error(`cannot use ${n}: ${pr(g)}`); E.act(g, [o.key]); }
// answer every prompt until an idle prompt: responses pass unless listed in o.use ([player, card]), yes/no is yes unless o.no
// matches the text, picks take the names in o.pick in order (else the first options), chooses take o.choose labels in order
function run(g, o = {}, n = 80) {
  const uses = (o.use || []).slice(), picks = (o.pick || []).slice(), chs = (o.choose || []).slice();
  for (let i = 0; i < n && g.prompt && g.prompt.type !== 'idle'; i++) {
    const p = g.prompt;
    if (p.type === 'respond') {
      const k = uses.findIndex(([pl, nm]) => pl === p.p && optFor(g, nm));
      if (k >= 0) { const [, nm] = uses.splice(k, 1)[0]; use(g, nm); } else E.act(g, ['pass']);
    } else if (p.type === 'yesno') E.act(g, [o.no && o.no.test(p.text) ? 'n' : 'y']);
    else if (p.type === 'pick') {
      let keys = [];
      for (let j = 0; j < picks.length && !keys.length; j++) { const ws = Array.isArray(picks[j]) ? picks[j] : [picks[j]]; for (const w of ws) { const x = p.opts.find(q => !keys.includes(q.key) && q.label.toLowerCase().includes(w.toLowerCase())); if (x) keys.push(x.key); } if (keys.length) picks.splice(j, 1); }
      for (const q of p.opts) if (keys.length < p.min && !keys.includes(q.key)) keys.push(q.key);
      E.act(g, keys.slice(0, p.max));
    } else if (p.type === 'choose') {
      let x = null; if (chs.length) { const w = chs.shift(); x = p.opts.find(q => q.label.toLowerCase().includes(String(w).toLowerCase())); }
      E.act(g, [(x || p.opts[0]).key]);
    } else E.act(g, [p.opts[0].key]);
  }
}
const act = (g, n, o) => { use(g, n); run(g, o); };
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const hasOpt = (g, text) => !!(g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase())));
const canAtk = (g, c) => !!(g.prompt && c && g.prompt.opts.some(o => o.key.startsWith('atk:' + c.u + ':')));
function bp(g, o) { choose(g, 'bp'); run(g, o); }
function attack(g, a, t, o) { choose(g, 'atk:' + a.u + ':' + (t ? t.u : 'd')); run(g, o); }
function endTurn(g, o) { if (g.prompt && g.prompt.opts.some(x => x.key === 'endbp')) { choose(g, 'endbp'); run(g, o); } choose(g, 'end'); run(g, o); }
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); if (VERBOSE && cur) console.log('   log: ' + cur.log.slice(-12).join(' / ')); } };
const lp = (g, p) => g.p[p].lp;

/* ---------- monsters ---------- */
T('Black Luster Soldier - Envoy of the Beginning', () => {
  const BLS = 'Black Luster Soldier - Envoy of the Beginning';
  const g = duel({ board: [{ hand: [BLS], gy: ['Cyber Dragon', 'Dark Armed Dragon'], turn: 2 }, { m: [FILL, 'Blast Magician'] }] });
  ok(!optFor(g, BLS, 'ns:') && !optFor(g, BLS, 'set:'), 'BLS cannot be Normal Summoned or Set');
  ok(!!optFor(g, BLS, 'sp:'), 'Special Summon offered with a LIGHT and a DARK in the GY');
  E.act(g, [optFor(g, BLS, 'sp:').key]); run(g);
  ok(on(g, 0, BLS) && inZ(g, 0, 'ban', 'Cyber Dragon') && inZ(g, 0, 'ban', 'Dark Armed Dragon') && !g.p[0].gy.length, 'summoned by banishing both');
  ok(canUse(g, BLS), 'banish effect offered in Main Phase 1');
  act(g, BLS, { pick: ['Warwolf'] });
  ok(inZ(g, 1, 'ban', FILL), 'targeted Warwolf banished');
  ok(!canUse(g, BLS), 'only once per turn');
  bp(g); ok(!canAtk(g, on(g, 0, BLS)), 'BLS cannot attack the turn it banished');
  const g2 = duel({ board: [{ hand: [], m: [BLS], turn: 2 }, { m: ['Blast Magician', 'Card Ejector'] }] });
  bp(g2); attack(g2, on(g2, 0, BLS), on(g2, 1, 'Blast Magician'), { use: [[0, BLS]] });
  ok(inZ(g2, 1, 'gy', 'Blast Magician') && canAtk(g2, on(g2, 0, BLS)), 'second attack after destroying a monster: ' + pr(g2));
  if (canAtk(g2, on(g2, 0, BLS))) { attack(g2, on(g2, 0, BLS), on(g2, 1, 'Card Ejector')); ok(inZ(g2, 1, 'gy', 'Card Ejector'), 'second attack destroys Card Ejector'); }
  const g3 = duel({ board: [{ hand: [BLS], gy: ['Cyber Dragon', 'Card Ejector'], turn: 2 }, {}] });
  ok(!optFor(g3, BLS, 'sp:'), 'no Special Summon without a DARK in the GY');
});
T('Blast Asmodian burns when a Spell/Trap is chained', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Blast Asmodian'], turn: 2 }, { st: ['Castle Walls'], m: [FILL] }] });
  use(g, 'Mystical Space Typhoon'); run(g, { pick: ['Face-down'], use: [[1, 'Castle Walls']] });
  ok(lp(g, 1) === 7500, 'opponent took 500 when Castle Walls was chained: ' + lp(g, 1));
  const g2 = duel({ board: [{ hand: ['Blue Medicine'], m: ['Blast Asmodian'], turn: 2 }, {}] });
  act(g2, 'Blue Medicine'); ok(lp(g2, 1) === 8000, 'no burn for an unchained Spell');
});
T('Blast Held by a Tribute', () => {
  const g = duel({ board: [{ hand: [], st: ['Blast Held by a Tribute'], turn: 2 }, { hand: ['Cyber Dragon'], m: [FILL, 'Card Ejector'] }] });
  endTurn(g);
  ok(g.prompt && g.prompt.p === 1, 'B to move');
  E.act(g, [optFor(g, 'Cyber Dragon', 'ns:').key]); run(g, { pick: ['Warwolf'] });
  ok(on(g, 1, 'Cyber Dragon') && inZ(g, 1, 'gy', FILL), 'B Tribute Summoned Cyber Dragon');
  bp(g); attack(g, on(g, 1, 'Cyber Dragon'), null, { use: [[0, 'Blast Held by a Tribute']] });
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && inZ(g, 1, 'gy', 'Card Ejector'), 'all Attack Position monsters destroyed');
  ok(lp(g, 1) === 7000 && lp(g, 0) === 8000, `1000 to B, no attack damage (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Blast Juggler in the Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Blast Juggler'], turn: 2 }, { m: ['Card Ejector', 'Card Guard', 'Elemental HERO Avian'] }] });
  const saw = g.phase === 'standby' && g.prompt.type === 'yesno' && /Blast Juggler/.test(g.prompt.text);
  ok(saw, 'Juggler offered in A\'s Standby Phase: ' + g.phase + ' ' + pr(g));
  run(g, { pick: [['Card Ejector', 'Avian']] });
  ok(inZ(g, 0, 'gy', 'Blast Juggler') && inZ(g, 1, 'gy', 'Card Ejector') && inZ(g, 1, 'gy', 'Elemental HERO Avian') && on(g, 1, 'Card Guard'), 'Juggler Tributed, two 1000-or-less monsters destroyed, Card Guard (1600) stays');
  const g2 = duel({ board: [{ hand: [], m: ['Blast Juggler'], turn: 2 }, { m: ['Card Ejector', 'Card Guard'] }] });
  run(g2, { no: /Juggler/ }); ok(!canUse(g2, 'Blast Juggler'), 'not in the Main Phase');
});
T('Blast Magician counters and destroys', () => {
  const g = duel({ board: [{ hand: ['Blue Medicine', 'Blue Medicine'], m: ['Blast Magician'], turn: 2 }, { m: ['Elemental HERO Burstinatrix', 'Card Guard'] }] });
  act(g, 'Blue Medicine'); act(g, 'Blue Medicine');
  const bm = on(g, 0, 'Blast Magician');
  ok(E.lib.ctr(bm, 'spell') === 2, 'two Spell Counters after two Spells: ' + E.lib.ctr(bm, 'spell'));
  ok(canUse(g, 'Blast Magician'), 'effect offered');
  use(g, 'Blast Magician'); run(g, { choose: ['2'], pick: ['Burstinatrix'] });
  ok(inZ(g, 1, 'gy', 'Elemental HERO Burstinatrix') && on(g, 1, 'Card Guard') && E.lib.ctr(bm, 'spell') === 0, '1200 ATK Burstinatrix destroyed with 2 counters');
});
T('Blast Sphere equips to the attacker, then destroys and burns', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Blast Sphere', pos: 'set' }] }] });
  bp(g); attack(g, on(g, 0, FILL), g.p[1].m.find(Boolean));
  ok(inZ(g, 0, 'st', 'Blast Sphere') && on(g, 0, FILL) && lp(g, 0) === 8000, 'Blast Sphere equipped to Warwolf, no battle');
  endTurn(g); endTurn(g);
  ok(!on(g, 0, FILL) && lp(g, 0) === 6000, 'Warwolf destroyed in A\'s Standby Phase and A took 2000: ' + lp(g, 0));
});
T('Brain Crusher revives what it destroyed', () => {
  const g = duel({ board: [{ hand: [], m: ['Brain Crusher'], turn: 2 }, { m: [FILL] }] });
  bp(g); attack(g, on(g, 0, 'Brain Crusher'), on(g, 1, FILL)); choose(g, 'endbp'); run(g); choose(g, 'end'); run(g, { pick: ['Warwolf'] });
  ok(on(g, 0, FILL) && !inZ(g, 1, 'gy', FILL), 'Warwolf Special Summoned to A\'s field in the End Phase');
});
T('Brain Golem negates LIGHT monsters and attacks again', () => {
  const g = duel({ board: [{ hand: [], m: ['Brain Golem'], turn: 2 }, { m: ['Blue-Eyes Shining Dragon', FILL], gy: ['Blue-Eyes White Dragon', 'Blue-Eyes White Dragon'] }] });
  ok(E.atk(g, on(g, 1, 'Blue-Eyes Shining Dragon')) === 3000, 'Shining Dragon gains nothing while Golem is face-up: ' + E.atk(g, on(g, 1, 'Blue-Eyes Shining Dragon')));
  const g2 = duel({ board: [{ hand: [], m: ['Brain Golem'], turn: 2 }, { m: ['Cyber Dragon', FILL] }] });
  bp(g2); attack(g2, on(g2, 0, 'Brain Golem'), on(g2, 1, 'Cyber Dragon'), {});
  ok(inZ(g2, 1, 'gy', 'Cyber Dragon') && canAtk(g2, on(g2, 0, 'Brain Golem')), 'second attack after destroying a LIGHT monster');
  if (canAtk(g2, on(g2, 0, 'Brain Golem'))) attack(g2, on(g2, 0, 'Brain Golem'), on(g2, 1, FILL));
  ok(lp(g2, 1) === 8000 - 400 - 500, 'both attacks dealt damage: ' + lp(g2, 1));
  const g3 = duel({ board: [{ hand: [], m: ['Brain Golem'], turn: 2 }, { m: [FILL, 'Card Ejector'] }] });
  bp(g3); attack(g3, on(g3, 0, 'Brain Golem'), on(g3, 1, FILL));
  ok(!canAtk(g3, on(g3, 0, 'Brain Golem')), 'no second attack after a non-LIGHT');
});
T('Brain Jacker takes control', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Brain Jacker', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  E.act(g, [optFor(g, 'Brain Jacker', 'flip:').key]); run(g, { pick: ['Warwolf'] });
  ok(on(g, 0, FILL) && inZ(g, 0, 'st', 'Brain Jacker'), 'A controls Warwolf, Brain Jacker is an Equip Card');
  endTurn(g);
  ok(lp(g, 1) === 8500, 'B gained 500 in their Standby Phase: ' + lp(g, 1));
});
T('Burning Algae gives the opponent 1000', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Burning Algae'] }] });
  bp(g); attack(g, on(g, 0, FILL), on(g, 1, 'Burning Algae'));
  ok(lp(g, 0) === 9000 && lp(g, 1) === 6500, `A gained 1000, B took 1500 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
});
T('Burning Beast Union with Freezing Beast', () => {
  const g = duel({ board: [{ hand: [], m: ['Burning Beast', 'Freezing Beast'], turn: 2 }, { st: [{ n: 'Toon World', pos: 'up' }] }] });
  ok(canUse(g, 'Burning Beast'), 'equip offered');
  use(g, 'Burning Beast'); run(g, { choose: ['equip'], pick: ['Freezing'] });
  ok(inZ(g, 0, 'st', 'Burning Beast') && on(g, 0, 'Freezing Beast'), 'Burning Beast equipped to Freezing Beast');
  ok(!canUse(g, 'Burning Beast'), 'once per turn');
  bp(g); attack(g, on(g, 0, 'Freezing Beast'), null, { pick: ['Toon World'] });
  ok(inZ(g, 1, 'gy', 'Toon World'), 'battle damage destroyed a face-up Spell');
  const g2 = duel({ board: [{ hand: [], m: ['Burning Beast', 'Freezing Beast'], turn: 2 }, {}] });
  use(g2, 'Burning Beast'); run(g2, { choose: ['equip'], pick: ['Freezing'] }); endTurn(g2); endTurn(g2);
  ok(canUse(g2, 'Burning Beast'), 'unequip offered next turn');
  use(g2, 'Burning Beast'); run(g2, { choose: ['unequip', 'special'] });
  const bb = on(g2, 0, 'Burning Beast'); ok(bb && bb.pos === 'atk', 'unequipped and Special Summoned in Attack Position');
});
T('Burning Skull Head and Call of the Mummy', () => {
  const g = duel({ board: [{ hand: ['Burning Skull Head'], st: [{ n: 'Call of the Mummy', pos: 'up' }], turn: 2 }, {}] });
  ok(canUse(g, 'Call of the Mummy'), 'Call of the Mummy offered with no monsters');
  act(g, 'Call of the Mummy', { pick: ['Burning Skull Head'] });
  ok(on(g, 0, 'Burning Skull Head') && lp(g, 1) === 7000, 'Skull Head Special Summoned from the hand, 1000 damage: ' + lp(g, 1));
  ok(!canUse(g, 'Call of the Mummy'), 'Mummy not usable while A controls a monster');
  const g2 = duel({ board: [{ hand: ['Burning Skull Head'], turn: 2 }, {}] });
  E.act(g2, [optFor(g2, 'Burning Skull Head', 'ns:').key]); run(g2);
  ok(lp(g2, 1) === 8000, 'no damage on a Normal Summon');
  const g3 = duel({ board: [{ hand: [], m: ['Burning Skull Head'], ban: ['Skull Flame'], turn: 2 }, {}] });
  ok(canUse(g3, 'Burning Skull Head'), 'banish effect offered with a banished Skull Flame');
  act(g3, 'Burning Skull Head');
  ok(inZ(g3, 0, 'ban', 'Burning Skull Head') && inZ(g3, 0, 'gy', 'Skull Flame'), 'Skull Head banished, Skull Flame to the GY');
});
T('Card Blocker', () => {
  const g = duel({ board: [{ hand: ['Card Blocker'], turn: 2 }, {}] });
  E.act(g, [optFor(g, 'Card Blocker', 'ns:').key]); run(g);
  ok(on(g, 0, 'Card Blocker') && on(g, 0, 'Card Blocker').pos === 'def', 'changed to Defense Position when Summoned');
  const g2 = duel({ board: [{ hand: [], m: ['Blast Magician'], turn: 2 }, { m: [{ n: 'Card Blocker', pos: 'def' }, 'Card Ejector'] }] });
  bp(g2); choose(g2, 'atk:' + on(g2, 0, 'Blast Magician').u + ':' + on(g2, 1, 'Card Ejector').u);
  run(g2, { use: [[1, 'Card Blocker'], [1, 'Card Blocker']], choose: ['3'] });
  ok(on(g2, 1, 'Card Ejector') && on(g2, 1, 'Card Blocker') && g2.p[1].gy.length === 3, 'attack moved to Card Blocker, 3 cards milled');
  ok(lp(g2, 0) === 8000 - 500, 'Card Blocker at 1900 DEF bounced the 1400 attacker: ' + lp(g2, 0));
});
T('Card Ejector banishes from the opponent\'s GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Card Ejector'], turn: 2 }, { gy: ['Cyber Dragon', FILL] }] });
  act(g, 'Card Ejector', { pick: ['Cyber Dragon'] });
  ok(inZ(g, 1, 'ban', 'Cyber Dragon') && inZ(g, 1, 'gy', FILL), 'Cyber Dragon banished');
  ok(!canUse(g, 'Card Ejector'), 'once per turn');
});
T('Card Guard', () => {
  const g = duel({ board: [{ hand: ['Card Guard', 'Mystical Space Typhoon'], st: [{ n: 'Call of the Mummy', pos: 'up' }], turn: 2 }, {}] });
  E.act(g, [optFor(g, 'Card Guard', 'ns:').key]); run(g);
  const cg = on(g, 0, 'Card Guard');
  ok(cg && E.atk(g, cg) === 1900, 'Guard Counter, 1900 ATK: ' + (cg && E.atk(g, cg)));
  act(g, 'Card Guard', { pick: ['Call of the Mummy'] });
  ok(E.atk(g, cg) === 1600, 'counter moved, back to 1600');
  act(g, 'Mystical Space Typhoon', { pick: ['Call of the Mummy'] });
  ok(inZ(g, 0, 'st', 'Call of the Mummy'), 'Call of the Mummy survived MST by losing its counter');
});
T('Castle Gate', () => {
  const g = duel({ board: [{ hand: [], m: ['Castle Gate', FILL], turn: 2 }, {}] });
  act(g, 'Castle Gate', { pick: ['Warwolf'] });
  ok(inZ(g, 0, 'gy', FILL) && lp(g, 1) === 6000, '2000 damage for Tributing Warwolf: ' + lp(g, 1));
  ok(!canUse(g, 'Castle Gate'), 'once per turn');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Castle Gate', pos: 'def' }] }] });
  bp(g2); attack(g2, on(g2, 0, FILL), on(g2, 1, 'Castle Gate'));
  ok(on(g2, 1, 'Castle Gate'), 'not destroyed by battle');
  const g3 = duel({ board: [{ hand: [], m: [{ n: 'Castle Gate', pos: 'def' }, FILL], turn: 2 }, {}] });
  ok(!canUse(g3, 'Castle Gate'), 'not in Defense Position');
});
T('Castle of Dark Illusions powers up Zombies', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Castle of Dark Illusions', pos: 'set' }, 'Burning Skull Head'], turn: 2 }, { m: ['Burning Skull Head'] }] });
  E.act(g, [optFor(g, 'Castle of Dark Illusions', 'flip:').key]); run(g);
  const z = on(g, 0, 'Burning Skull Head'), z2 = on(g, 1, 'Burning Skull Head');
  ok(E.atk(g, z) === 1200 && E.def(g, z) === 1000 && E.atk(g, z2) === 1200, 'all Zombies +200 ATK/DEF: ' + E.atk(g, z));
  endTurn(g); endTurn(g);
  ok(E.atk(g, z) === 1400, '+200 more in the next Standby Phase: ' + E.atk(g, z));
});
T('Chain Thrasher attacks again per copy in the GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Chain Thrasher'], gy: ['Chain Thrasher'], turn: 2 }, {}] });
  bp(g); const ct = on(g, 0, 'Chain Thrasher'); attack(g, ct, null); ok(canAtk(g, ct), 'second attack offered'); if (canAtk(g, ct)) attack(g, ct, null);
  ok(lp(g, 1) === 6000 && !canAtk(g, ct), 'two attacks, no third: ' + lp(g, 1));
});
T('Chaos Command Magician negates a monster effect targeting it', () => {
  const BLS = 'Black Luster Soldier - Envoy of the Beginning';
  const g = duel({ board: [{ hand: [], m: [BLS], turn: 2 }, { m: ['Chaos Command Magician'] }] });
  act(g, BLS, { pick: ['Chaos Command'] });
  ok(on(g, 1, 'Chaos Command Magician'), 'BLS banish negated');
});
T('Chaos Necromancer ATK from the GY', () => {
  const g = duel({ board: [{ hand: [], m: ['Chaos Necromancer'], gy: [FILL, 'Cyber Dragon', 'Card Ejector', 'Blue Medicine'], turn: 2 }, { gy: [FILL] }] });
  ok(E.atk(g, on(g, 0, 'Chaos Necromancer')) === 900, '3 monsters in its own GY = 900: ' + E.atk(g, on(g, 0, 'Chaos Necromancer')));
});
T('Chaos-End Master summons from the Deck', () => {
  const g = duel({ board: [{ hand: [], m: ['Chaos-End Master'], deckTop: [FILL, 'Castle Gate'], turn: 2 }, { m: ['Card Ejector'] }] });
  bp(g); attack(g, on(g, 0, 'Chaos-End Master'), on(g, 1, 'Card Ejector'), { pick: ['Castle Gate'] });
  ok(on(g, 0, 'Castle Gate'), 'Castle Gate (Level 6, 0 ATK) Special Summoned from the Deck');
});
T('Blue-Eyes Shining Dragon', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes Shining Dragon'], m: ['Blue-Eyes Ultimate Dragon'], gy: ['Blue-Eyes White Dragon', 'Dark Armed Dragon', FILL], turn: 2 }, { st: ['Castle Walls'] }] });
  ok(!optFor(g, 'Blue-Eyes Shining Dragon', 'ns:'), 'cannot be Normal Summoned');
  ok(!!optFor(g, 'Blue-Eyes Shining Dragon', 'sp:'), 'Special Summon offered with Ultimate Dragon');
  E.act(g, [optFor(g, 'Blue-Eyes Shining Dragon', 'sp:').key]); run(g);
  const s = on(g, 0, 'Blue-Eyes Shining Dragon');
  ok(s && inZ(g, 0, 'gy', 'Blue-Eyes Ultimate Dragon'), 'Ultimate Dragon Tributed');
  ok(s && E.atk(g, s) === 3000 + 300 * 3, '300 per Dragon in the GY (3): ' + (s && E.atk(g, s)));
  const g2 = duel({ board: [{ hand: ['Blue-Eyes Shining Dragon'], m: [FILL, FILL, FILL], turn: 2 }, {}] });
  ok(!optFor(g2, 'Blue-Eyes Shining Dragon', 'sp:'), 'no Special Summon without Ultimate Dragon');
  const g3 = duel({ board: [{ hand: [], st: ['Castle Walls'], turn: 2 }, { m: [{ n: 'Blue-Eyes Shining Dragon', pos: 'def' }] }] });
  use(g3, 'Castle Walls'); run(g3, { pick: ['Shining'], use: [[1, 'Blue-Eyes Shining Dragon']] });
  ok(E.def(g3, on(g3, 1, 'Blue-Eyes Shining Dragon')) === 2500, 'Castle Walls targeting it was negated: ' + E.def(g3, on(g3, 1, 'Blue-Eyes Shining Dragon')));
});
T('Blue-Eyes Toon Dragon', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes Toon Dragon'], m: [FILL, FILL], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, { m: ['Card Ejector'] }] });
  ok(!optFor(g, 'Blue-Eyes Toon Dragon', 'ns:'), 'cannot be Normal Summoned');
  E.act(g, [optFor(g, 'Blue-Eyes Toon Dragon', 'sp:').key]); run(g, { pick: [['Warwolf', 'Warwolf']] });
  const t = on(g, 0, 'Blue-Eyes Toon Dragon'); ok(t && cnt(g, 0, 'gy', FILL) === 2, 'Special Summoned by Tributing 2');
  bp(g); ok(!canAtk(g, t), 'cannot attack the turn it is Special Summoned');
  endTurn(g); endTurn(g); bp(g);
  ok(hasOpt(g, 'atk:' + t.u + ':d'), 'can attack directly past a non-Toon');
  attack(g, t, null);
  ok(lp(g, 0) === 7500 && lp(g, 1) === 5000, `paid 500, dealt 3000 (A ${lp(g, 0)}, B ${lp(g, 1)})`);
  const g2 = duel({ board: [{ hand: ['Blue-Eyes Toon Dragon'], m: [FILL, FILL], turn: 2 }, {}] });
  ok(!optFor(g2, 'Blue-Eyes Toon Dragon', 'sp:'), 'no Special Summon without Toon World');
  const g3 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Blue-Eyes Toon Dragon'], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, {}] });
  act(g3, 'Mystical Space Typhoon', { pick: ['Toon World'] });
  ok(inZ(g3, 0, 'gy', 'Blue-Eyes Toon Dragon'), 'destroyed when Toon World is destroyed');
});

/* ---------- Spells ---------- */
T('Blue Medicine', () => { const g = duel({ board: [{ hand: ['Blue Medicine'], turn: 2 }, {}] }); act(g, 'Blue Medicine'); ok(lp(g, 0) === 8400, '400 LP gained'); });
T('Book of Eclipse', () => {
  const g = duel({ board: [{ hand: ['Book of Eclipse'], m: [FILL], turn: 2 }, { m: [FILL, 'Card Ejector'] }] });
  const h = g.p[1].hand.length;
  act(g, 'Book of Eclipse');
  ok([...g.p[0].m, ...g.p[1].m].filter(Boolean).every(c => c.pos === 'set'), 'every monster face-down Defense');
  endTurn(g);
  ok(g.p[1].m.filter(Boolean).every(c => c.pos === 'def') && on(g, 0, FILL).pos === 'set', 'B\'s monsters face-up Defense at the End Phase, A\'s stay face-down');
  ok(g.p[1].hand.length === h + 2 + 1, 'B drew 2 (plus the turn draw): ' + (g.p[1].hand.length - h));
});
T('Book of Secret Arts', () => {
  const g = duel({ board: [{ hand: ['Book of Secret Arts'], m: ['Blast Magician', FILL], turn: 2 }, {}] });
  use(g, 'Book of Secret Arts');
  ok(!(g.prompt && g.prompt.type === 'pick' && g.prompt.opts.some(o => /Warwolf/.test(o.label))), 'only Spellcasters offered: ' + pr(g));
  run(g, { pick: ['Blast Magician'] });
  const m = on(g, 0, 'Blast Magician'); ok(E.atk(g, m) === 1700 && E.def(g, m) === 2000, '+300 ATK and DEF');
});
T('Book of Taiyou', () => {
  const g = duel({ board: [{ hand: ['Book of Taiyou'], turn: 2 }, { m: [{ n: FILL, pos: 'set' }] }] });
  act(g, 'Book of Taiyou');
  const m = g.p[1].m.find(Boolean); ok(m && m.pos === 'atk', 'face-down monster flipped to Attack Position');
});
T('Bubble Blaster', () => {
  const g = duel({ board: [{ hand: ['Bubble Blaster'], m: ['Elemental HERO Bubbleman', FILL], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
  use(g, 'Bubble Blaster');
  ok(g.prompt && g.prompt.type !== 'pick' || !g.prompt.opts.some(o => /Warwolf/.test(o.label)), 'only Bubbleman offered');
  run(g, { pick: ['Bubbleman'] });
  const b = on(g, 0, 'Elemental HERO Bubbleman'); ok(b && E.atk(g, b) === 1600, '+800 ATK');
  bp(g); attack(g, b, on(g, 1, 'Blue-Eyes White Dragon'));
  ok(on(g, 0, 'Elemental HERO Bubbleman') && inZ(g, 0, 'gy', 'Bubble Blaster') && lp(g, 0) === 8000, 'Blaster destroyed instead, no battle damage: ' + lp(g, 0));
});
T('Bubble Illusion lets a Trap be activated from the hand', () => {
  const g = duel({ board: [{ hand: ['Bubble Illusion', 'Castle Walls'], m: ['Elemental HERO Bubbleman'], turn: 2 }, {}] });
  ok(!canUse(g, 'Castle Walls'), 'Trap not activatable from the hand before');
  act(g, 'Bubble Illusion');
  ok(canUse(g, 'Castle Walls'), 'Castle Walls activatable from the hand');
  const g2 = duel({ board: [{ hand: ['Bubble Illusion'], m: [FILL], turn: 2 }, {}] });
  ok(!canUse(g2, 'Bubble Illusion'), 'needs a face-up Bubbleman');
});
T('Bubble Shuffle', () => {
  const g = duel({ board: [{ hand: ['Bubble Shuffle', 'Elemental HERO Avian'], m: ['Elemental HERO Bubbleman'], turn: 2 }, { m: [FILL] }] });
  act(g, 'Bubble Shuffle', { pick: ['Bubbleman', 'Warwolf', 'Avian'] });
  ok(inZ(g, 0, 'gy', 'Elemental HERO Bubbleman') && on(g, 0, 'Elemental HERO Avian') && on(g, 1, FILL).pos === 'def', 'Bubbleman Tributed, Avian summoned, Warwolf in Defense');
});
T('Burning Land', () => {
  const g = duel({ board: [{ hand: ['Gaia Power', 'Burning Land'], turn: 2 }, {}] });
  act(g, 'Gaia Power'); ok(g.p[0].fz && E.name(g.p[0].fz) === 'Gaia Power', 'Gaia Power on the field');
  act(g, 'Burning Land');
  ok(!g.p[0].fz && inZ(g, 0, 'gy', 'Gaia Power'), 'Field Spell destroyed on activation');
  endTurn(g);
  ok(lp(g, 1) === 7500 && lp(g, 0) === 8000, 'B took 500 in their Standby Phase: ' + lp(g, 1));
});
T('Burning Spear', () => {
  const g = duel({ board: [{ hand: ['Burning Spear'], m: ['Blast Magician', FILL], turn: 2 }, {}] });
  use(g, 'Burning Spear'); ok(!(g.prompt && g.prompt.type === 'pick' && g.prompt.opts.some(o => /Warwolf/.test(o.label))), 'only FIRE monsters offered');
  run(g, { pick: ['Blast Magician'] });
  const m = on(g, 0, 'Blast Magician'); ok(E.atk(g, m) === 1800 && E.def(g, m) === 1500, '+400 ATK, -200 DEF');
});
T('Burst Return', () => {
  const g = duel({ board: [{ hand: ['Burst Return'], m: ['Elemental HERO Burstinatrix', 'Elemental HERO Avian', FILL], turn: 2 }, { m: ['Elemental HERO Clayman'] }] });
  act(g, 'Burst Return');
  ok(on(g, 0, 'Elemental HERO Burstinatrix') && inZ(g, 0, 'hand', 'Elemental HERO Avian') && inZ(g, 1, 'hand', 'Elemental HERO Clayman') && on(g, 0, FILL), 'other HEROes returned, Burstinatrix and Warwolf stay');
});
T('Burst Stream of Destruction', () => {
  const g = duel({ board: [{ hand: ['Burst Stream of Destruction'], m: ['Blue-Eyes White Dragon', FILL], turn: 2 }, { m: [FILL, { n: FILL, pos: 'set' }] }] });
  act(g, 'Burst Stream of Destruction');
  ok(!g.p[1].m.some(Boolean) && on(g, 0, FILL), 'all opponent monsters destroyed');
  bp(g); ok(!canAtk(g, on(g, 0, 'Blue-Eyes White Dragon')) && canAtk(g, on(g, 0, FILL)), 'Blue-Eyes cannot attack, Warwolf can');
  const g2 = duel({ board: [{ hand: ['Burst Stream of Destruction'], m: [FILL], turn: 2 }, { m: [FILL] }] });
  ok(!canUse(g2, 'Burst Stream of Destruction'), 'needs Blue-Eyes');
});
T('Butterfly Dagger - Elma', () => {
  const g = duel({ board: [{ hand: ['Butterfly Dagger - Elma', 'Mystical Space Typhoon'], m: [FILL], turn: 2 }, {}] });
  act(g, 'Butterfly Dagger - Elma', { pick: ['Warwolf'] });
  ok(E.atk(g, on(g, 0, FILL)) === 2300, '+300 ATK');
  act(g, 'Mystical Space Typhoon', { pick: ['Elma'] });
  ok(inZ(g, 0, 'hand', 'Butterfly Dagger - Elma'), 'returned to the hand after being destroyed');
});
T('Call of the Mummy needs no monsters', () => {
  const g = duel({ board: [{ hand: ['Burning Skull Head'], m: [FILL], st: [{ n: 'Call of the Mummy', pos: 'up' }], turn: 2 }, {}] });
  ok(!canUse(g, 'Call of the Mummy'), 'not with a monster on the field');
  const g2 = duel({ board: [{ hand: [FILL, 'Burning Skull Head'], st: [{ n: 'Call of the Mummy', pos: 'up' }], turn: 2 }, {}] });
  act(g2, 'Call of the Mummy', { pick: ['Warwolf'] }); // a non-Zombie must not be offered
  ok(!on(g2, 0, FILL), 'non-Zombie not summoned');
});
T('Card of Safe Return', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: [FILL], st: [{ n: 'Card of Safe Return', pos: 'up' }], turn: 2 }, {}] });
  const h = g.p[0].hand.length; act(g, 'Monster Reborn', { pick: ['Warwolf'] });
  ok(on(g, 0, FILL) && g.p[0].hand.length === h - 1 + 1, 'drew 1 after the Special Summon from the GY');
});
T('Card of Sanctity', () => {
  const g = duel({ board: [{ hand: ['Card of Sanctity', 'Blue Medicine'], m: [FILL], turn: 2 }, {}] });
  act(g, 'Card of Sanctity');
  ok(inZ(g, 0, 'ban', 'Blue Medicine') && inZ(g, 0, 'ban', FILL) && g.p[0].hand.length === 2 && inZ(g, 0, 'gy', 'Card of Sanctity'), 'banished hand and field, drew to 2');
  const g2 = duel({ board: [{ hand: ['Card of Sanctity'], turn: 1 }, {}] }); // turn 1: the first player draws, so empty the hand
  for (const c of g2.p[0].hand.filter(c => E.name(c) !== 'Card of Sanctity')) { g2.p[0].hand.splice(g2.p[0].hand.indexOf(c), 1); c.zone = 'deck'; g2.p[0].deck.unshift(c); }
  ok(!E._internal.activatable(g2, 0, 'idle').some(x => E.name(x.c) === 'Card of Sanctity'), 'needs at least 1 other card (ruling)');
});
T('Card Rotator', () => {
  const g = duel({ board: [{ hand: ['Card Rotator', 'Blue Medicine'], turn: 2 }, { m: [FILL, { n: 'Card Ejector', pos: 'set' }] }] });
  act(g, 'Card Rotator', { pick: ['Blue Medicine'] });
  ok(inZ(g, 0, 'gy', 'Blue Medicine') && on(g, 1, FILL).pos === 'def' && on(g, 1, 'Card Ejector').pos === 'atk', 'cost paid, positions changed');
});
T('Card Shuffle', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Card Shuffle', pos: 'up' }], turn: 2 }, {}] });
  ok(canUse(g, 'Card Shuffle'), 'offered');
  act(g, 'Card Shuffle'); ok(lp(g, 0) === 7700, 'paid 300'); ok(!canUse(g, 'Card Shuffle'), 'once per turn');
});
T('Card Trader', () => {
  const g = duel({ board: [{ hand: ['Blue Medicine'], st: [{ n: 'Card Trader', pos: 'up' }], turn: 2 }, {}] });
  const saw = g.prompt.type === 'yesno' && /Card Trader/.test(g.prompt.text);
  ok(saw && g.phase === 'standby', 'offered in A\'s Standby Phase: ' + g.phase + ' ' + pr(g));
  if (saw) { if (g.prompt.type === 'yesno') choose(g, 'yes'); else use(g, 'Card Trader'); const h = g.p[0].hand.length; run(g, { pick: ['Blue Medicine'] }); ok(!inZ(g, 0, 'hand', 'Blue Medicine') && g.p[0].hand.length === h, 'Blue Medicine shuffled in, 1 drawn'); }
});
T('Chaos End', () => {
  const g = duel({ board: [{ hand: ['Chaos End'], m: [FILL], ban: Array(7).fill(FILL), turn: 2 }, { m: [FILL, 'Card Ejector'] }] });
  act(g, 'Chaos End');
  ok(!g.p[0].m.some(Boolean) && !g.p[1].m.some(Boolean), 'all monsters destroyed');
  const g2 = duel({ board: [{ hand: ['Chaos End'], ban: Array(6).fill(FILL), turn: 2 }, { m: [FILL] }] });
  ok(!canUse(g2, 'Chaos End'), 'not with only 6 banished');
});
T('Chaos Greed', () => {
  const g = duel({ board: [{ hand: ['Chaos Greed'], ban: Array(4).fill(FILL), turn: 2 }, {}] });
  act(g, 'Chaos Greed'); ok(g.p[0].hand.length === 3, 'drew 2 (plus the turn draw): ' + g.p[0].hand.length);
  const g2 = duel({ board: [{ hand: ['Chaos Greed'], ban: Array(4).fill(FILL), gy: [FILL], turn: 2 }, {}] });
  ok(!canUse(g2, 'Chaos Greed'), 'not with a card in the GY');
});
T('Chain Energy', () => {
  const g = duel({ board: [{ hand: [FILL], st: [{ n: 'Chain Energy', pos: 'up' }], turn: 2 }, {}] });
  E.act(g, [optFor(g, FILL, 'ns:').key]); run(g);
  ok(lp(g, 0) === 7500 && on(g, 0, FILL), 'paid 500 to Normal Summon');
});
T('Chain Energy only while face-up; costs for Spells from the hand', () => {
  const g = duel({ board: [{ hand: [FILL], st: [{ n: 'Chain Energy', pos: 'set' }], turn: 2 }, {}] });
  E.act(g, [optFor(g, FILL, 'ns:').key]); run(g); ok(lp(g, 0) === 8000, 'a Set Chain Energy charges nothing: ' + lp(g, 0));
  const g2 = duel({ board: [{ hand: ['Blue Medicine'], st: [{ n: 'Chain Energy', pos: 'up' }], turn: 2 }, {}] });
  act(g2, 'Blue Medicine'); ok(lp(g2, 0) === 8000 - 500 + 400, 'paid 500 to activate a Spell from the hand: ' + lp(g2, 0));
});
T('Chain Healing as Chain Link 2 goes back to the Deck', () => {
  const g = duel({ board: [{ hand: ['Blue Medicine'], turn: 2 }, { st: ['Chain Healing'] }] });
  act(g, 'Blue Medicine', { use: [[1, 'Chain Healing']] });
  ok(lp(g, 1) === 8500 && inZ(g, 1, 'deck', 'Chain Healing'), 'gained 500, shuffled into the Deck');
});
T('Chain Strike', () => {
  const g = duel({ board: [{ hand: ['Chain Strike', 'Blue Medicine'], turn: 2 }, { st: ['Chain Strike'] }] });
  ok(!canUse(g, 'Chain Strike'), 'not as Chain Link 1');
  act(g, 'Blue Medicine', { use: [[1, 'Chain Strike']] });
  ok(lp(g, 0) === 8400 - 800, '800 damage as Chain Link 2: ' + lp(g, 0));
});
T('Chain Summoning', () => {
  const g = duel({ board: [{ hand: ['Blue Medicine', FILL, 'Card Ejector', 'Blast Magician'], st: ['Chain Summoning'], turn: 2 }, { st: ['Chain Healing'] }] });
  act(g, 'Blue Medicine', { use: [[1, 'Chain Healing'], [0, 'Chain Summoning']] });
  ok(inZ(g, 0, 'gy', 'Chain Summoning'), 'Chain Summoning activated as Chain Link 3');
  for (const n of [FILL, 'Card Ejector', 'Blast Magician']) { const o = optFor(g, n, 'ns:'); if (o) { E.act(g, [o.key]); run(g); } }
  ok(on(g, 0, FILL) && on(g, 0, 'Card Ejector') && on(g, 0, 'Blast Magician'), '3 Normal Summons this turn');
});
T('Chain Material', () => {
  const g = duel({ ex0: ['Elemental HERO Flame Wingman'], main0: [...Array(38).fill(FILL), 'Elemental HERO Avian', 'Elemental HERO Burstinatrix'],
    board: [{ hand: ['Polymerization'], st: ['Chain Material'], turn: 2 }, {}] });
  // PARTIAL in the script: Chain Material offers the Fusion Summon (with a Polymerization from the hand) as it resolves
  act(g, 'Chain Material', { pick: ['Flame Wingman', 'Avian', 'Burstinatrix'] });
  ok(inZ(g, 0, 'gy', 'Polymerization'), 'Polymerization used');
  ok(on(g, 0, 'Elemental HERO Flame Wingman') && inZ(g, 0, 'ban', 'Elemental HERO Avian') && inZ(g, 0, 'ban', 'Elemental HERO Burstinatrix'), 'Fusion Summoned by banishing Deck materials');
  ok(!hasOpt(g, 'bp') || (() => { choose(g, 'bp'); run(g); return !canAtk(g, on(g, 0, 'Elemental HERO Flame Wingman')); })(), 'cannot attack this turn');
  endTurn(g);
  ok(!on(g, 0, 'Elemental HERO Flame Wingman'), 'Flame Wingman destroyed in the End Phase');
});

/* ---------- Traps ---------- */
T('Blast with Chain', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: [FILL], st: ['Blast with Chain'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 'Blast with Chain', { pick: ['Warwolf'] });
  ok(E.atk(g, on(g, 0, FILL)) === 2500 && inZ(g, 0, 'st', 'Blast with Chain'), 'equipped, +500 ATK');
  act(g, 'Mystical Space Typhoon', { pick: ['Blast with Chain', 'Cyber Dragon'] });
  ok(inZ(g, 1, 'gy', 'Cyber Dragon'), 'destroyed by a card effect: Cyber Dragon destroyed');
});
T('Bubble Crash', () => {
  const g = duel({ board: [{ hand: ['Blue Medicine'], st: ['Bubble Crash'], turn: 2 }, { hand: [FILL, FILL, FILL, FILL, FILL, FILL, FILL], m: [FILL] }] });
  act(g, 'Bubble Crash');
  ok(g.p[1].hand.length + g.p[1].m.filter(Boolean).length === 5 && g.p[1].gy.length === 3, 'B sent 3 cards to get to 5');
  ok(g.p[0].hand.length === 2, 'A (under 6) keeps its cards');
});
T('Burst Breath', () => {
  const g = duel({ board: [{ hand: [], m: ['Blue-Eyes White Dragon', FILL], st: ['Burst Breath'], turn: 2 }, { m: ['Blue-Eyes White Dragon', 'Castle Gate', { n: 'Card Ejector', pos: 'set' }] }] });
  act(g, 'Burst Breath', { pick: ['Blue-Eyes'] });
  ok(inZ(g, 0, 'gy', 'Blue-Eyes White Dragon') && inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Blue-Eyes White Dragon') && inZ(g, 1, 'gy', 'Castle Gate'), 'face-up monsters with DEF up to 3000 destroyed');
  ok(on(g, 1, 'Card Ejector'), 'face-down monster stays');
});
T('Call of Darkness', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: [FILL], st: [{ n: 'Call of Darkness', pos: 'up' }], turn: 2 }, {}] });
  ok(!canUse(g, 'Monster Reborn'), 'Monster Reborn cannot be activated');
});
T('Call of the Earthbound', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [FILL, 'Blue-Eyes White Dragon'], st: ['Call of the Earthbound'] }] });
  bp(g); choose(g, 'atk:' + on(g, 0, FILL).u + ':' + on(g, 1, FILL).u);
  run(g, { use: [[1, 'Call of the Earthbound']], pick: ['Blue-Eyes'] });
  ok(!on(g, 0, FILL) && on(g, 1, FILL) && lp(g, 0) === 7000, 'attack moved onto Blue-Eyes: ' + lp(g, 0));
});
T('Call of the Grave', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: [FILL], turn: 2 }, { st: ['Call of the Grave'] }] });
  act(g, 'Monster Reborn', { use: [[1, 'Call of the Grave']], pick: ['Warwolf'] });
  ok(!on(g, 0, FILL) && inZ(g, 0, 'gy', 'Monster Reborn'), 'Monster Reborn negated');
});
T('Call of the Reaper', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: [FILL, 'Supay'], st: ['Call of the Reaper'], turn: 2 }, {}] });
  use(g, 'Monster Reborn'); run(g, { pick: ['Warwolf', 'Supay'], use: [[0, 'Call of the Reaper']] });
  ok(on(g, 0, FILL) && on(g, 0, 'Supay'), 'Supay Special Summoned after a Special Summon from the GY');
});
T('Castle Walls', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: ['Castle Walls'], turn: 2 }, {}] });
  act(g, 'Castle Walls', { pick: ['Warwolf'] });
  ok(E.def(g, on(g, 0, FILL)) === 600, '+500 DEF'); endTurn(g); ok(E.def(g, on(g, 0, FILL)) === 100, 'gone after the turn');
});
T('Chain Burst', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: [{ n: 'Chain Burst', pos: 'up' }, 'Castle Walls'], turn: 2 }, {}] });
  act(g, 'Castle Walls', { pick: ['Warwolf'] }); ok(lp(g, 0) === 7000, 'trap activator took 1000: ' + lp(g, 0));
});
T('Chain Destruction', () => {
  const g = duel({ main0: [...Array(37).fill(FILL), 'Blast Magician', 'Blast Magician', 'Card Ejector'], board: [{ hand: ['Blast Magician', 'Card Ejector'], turn: 2 }, { st: ['Chain Destruction'] }] });
  E.act(g, [optFor(g, 'Blast Magician', 'ns:').key]); run(g, { use: [[1, 'Chain Destruction']], pick: ['Blast Magician'] });
  ok(on(g, 0, 'Blast Magician') && cnt(g, 0, 'deck', 'Blast Magician') === 0 && cnt(g, 0, 'hand', 'Blast Magician') === 0 && cnt(g, 0, 'gy', 'Blast Magician') === 2 && inZ(g, 0, 'hand', 'Card Ejector'), 'other Blast Magicians in hand and Deck destroyed');
});
T('Chain Detonation', () => {
  const g = duel({ board: [{ hand: [], st: ['Chain Detonation'], turn: 2 }, {}] });
  act(g, 'Chain Detonation'); ok(lp(g, 1) === 7500 && inZ(g, 0, 'gy', 'Chain Detonation'), '500 damage, to the GY as Chain Link 1');
  const g2 = duel({ board: [{ hand: ['Blue Medicine'], turn: 2 }, { st: ['Chain Detonation'] }] });
  act(g2, 'Blue Medicine', { use: [[1, 'Chain Detonation']] });
  ok(lp(g2, 0) === 7900 && inZ(g2, 1, 'deck', 'Chain Detonation'), 'as Chain Link 2: 500 damage and shuffled into the Deck');
});
T('Chain Disappearance', () => {
  const g = duel({ main0: [...Array(38).fill(FILL), 'Card Ejector', 'Card Ejector'], board: [{ hand: ['Card Ejector', 'Card Ejector'], turn: 2 }, { st: ['Chain Disappearance'] }] });
  E.act(g, [optFor(g, 'Card Ejector', 'ns:').key]); run(g, { use: [[1, 'Chain Disappearance']] });
  ok(cnt(g, 0, 'ban', 'Card Ejector') === 4 && !on(g, 0, 'Card Ejector'), 'all 4 Card Ejectors banished');
});
T('Chain Healing', () => {
  const g = duel({ board: [{ hand: [], st: ['Chain Healing'], turn: 2 }, {}] });
  act(g, 'Chain Healing'); ok(lp(g, 0) === 8500 && inZ(g, 0, 'gy', 'Chain Healing'), '500 LP, to the GY as Chain Link 1');
});
T('Chaos Burst', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: ['Chaos Burst'] }] });
  bp(g); attack(g, on(g, 0, 'Cyber Dragon'), on(g, 1, FILL), { use: [[1, 'Chaos Burst']], pick: ['Warwolf', 'Cyber Dragon'] });
  ok(inZ(g, 1, 'gy', FILL) && inZ(g, 0, 'gy', 'Cyber Dragon') && lp(g, 0) === 7000, 'Tributed Warwolf, destroyed the attacker, 1000 damage: ' + lp(g, 0));
});

console.log(fails ? `\n${fails} failed` : '\nAll full-03 review checks passed.');
process.exit(fails ? 1 : 0);
