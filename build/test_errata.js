// Errata audit checks (build/ENGINE_TODO.md "errata audit", 2026-11-26): node build/test_errata.js
// Each card changed back to its 2005 (Goat) or 2010 (Edison) text gets a check here, in the format(s) it was changed for.
// Edison loads like build/load.js; Goat loads like build/test_classic-5.js (Goat cards plus the classic pool).
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');

function env(format) {
  if (format === 'edison') { const { E, C } = require('./load')(); return { E, C, FILL: 'Gene-Warped Warwolf' }; }
  const ctx = { window: {}, console, Math }; ctx.self = ctx.window; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'play/data/classic-cards.js', 'js/engine.js'];
  for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const E = ctx.window.EdisonEngine, C = [...ctx.window.GOAT_CARDS, ...ctx.window.CLASSIC_CARDS.filter(c => !ctx.window.GOAT_CARDS.some(g => g.n === c.n))];
  E.init(C, { format: 'goat' });
  return { E, C, FILL: 'Giant Soldier of Stone' };
}

let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

function suite(format) {
  const { E, C, FILL } = env(format);
  const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
  const duel = (o = {}) => E.newDuel({ decks: [0, 1].map(() => ({ name: 't', main: Array(40).fill(id(FILL)), extra: [] })), first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
  const choose = (g, text) => {
    const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
    const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
    if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
    E.act(g, [o.key]);
  };
  const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  // answer everything up to the next free action; a pick whose text matches `all` takes every option it allows
  const auto = (g, all) => {
    for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) {
      const pr = g.prompt;
      if (pr.type === 'respond') E.act(g, ['pass']);
      else if (pr.type === 'yesno') E.act(g, ['y']);
      else if (pr.type === 'choose') E.act(g, [pr.opts[0].key]);
      else if (all && (pr.text || '').includes(all)) E.act(g, pr.opts.slice(0, pr.max).map(x => x.key));
      else E.act(g, pr.opts.slice(0, Math.max(pr.min, Math.min(pr.max, 1))).map(x => x.key));
    }
  };
  const card = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy].find(c => c && E.name(c) === n);
  const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st].find(c => c && E.name(c) === n).u + ':');
  const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
  const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
  const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
  const effs = (g, p, n) => E.lib.effsOf(card(g, p, n));
  const endTurn = g => { choose(g, 'end'); auto(g); };
  const F = `[${format}] `;

  T(F + 'Witch of the Black Forest: each copy searches, no lock on the added name', () => {
    const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Witch of the Black Forest', 'Witch of the Black Forest'], deckTop: [FILL, 'Sangan', 'Sangan'], turn: 2 }, {}] });
    const h = g.p[0].hand.length; act(g, 0, 'Dark Hole'); auto(g);
    ok(g.p[0].hand.length === h + 1, F + `both Witches searched (hand ${g.p[0].hand.length}, was ${h})`);
    ok(g.p[0].hand.every(x => !E.lib.forbid(g, { type: 'activate', c: x, p: 0, eff: E.lib.effsOf(x)[0] })), F + 'the added cards are not locked this turn');
  });

  T(F + 'Makyura the Destructor: only when destroyed, any number of Traps, no once per turn', () => {
    const g = duel({ board: [{ hand: ['Jar of Greed', 'Jar of Greed'], m: ['Makyura the Destructor'], turn: 2 }, { m: ['Blue-Eyes White Dragon'] }] });
    const mk = on(g, 0, 'Makyura the Destructor'), e = E.lib.effsOf(mk)[0];
    ok(!e.opt, F + 'no once per turn');
    ok(!e.on(g, { type: 'move', c: mk, wasField: true, from: 'm', to: 'gy', reason: 'cost' }, mk), F + 'sent to the GY without being destroyed: no effect');
    choose(g, 'bp'); auto(g); choose(g, `atk:${mk.u}:${on(g, 1, 'Blue-Eyes White Dragon').u}`); auto(g, 'Traps');
    ok(cnt(g, 0, 'st', 'Jar of Greed') === 2, F + `destroyed by battle: both Traps readied (${cnt(g, 0, 'st', 'Jar of Greed')})`);
  });

  T(F + 'Exchange of the Spirit: no once per Duel', () => {
    const gy = Array(15).fill(FILL);
    const g = duel({ board: [{ hand: [], gy, st: ['Exchange of the Spirit', 'Exchange of the Spirit'], turn: 2 }, { gy }] });
    act(g, 0, 'Exchange of the Spirit'); auto(g);
    ok(g.p[0].lp === 7000 && g.p[0].gy.length >= 15 && g.p[1].gy.length >= 15, F + 'first one resolved, both GYs hold 15+');
    ok(hasOpt(g, 'a:' + g.p[0].st.find(c => c && E.name(c) === 'Exchange of the Spirit').u + ':'), F + 'the second copy can be activated');
  });

  T(F + 'Crush Card Virus: field and hand, then the opponent\'s draws for 3 of their turns, no damage shield', () => {
    const BIG = 'Blue-Eyes White Dragon';
    const g = duel({ board: [{ hand: [], m: ['Sangan'], st: ['Crush Card Virus'], turn: 2 }, { m: [BIG], hand: [BIG, 'Sangan'], deckTop: [BIG, 'Sangan', BIG, BIG] }] });
    act(g, 0, 'Crush Card Virus'); auto(g);
    ok(!on(g, 1, BIG) && !inZ(g, 1, 'hand', BIG) && inZ(g, 1, 'hand', 'Sangan'), F + 'field and hand monsters with 1500+ destroyed');
    const lp = g.p[1].lp; E.lib.damage(g, 1, 100, {}); ok(g.p[1].lp === lp - 100, F + 'the opponent still takes damage');
    endTurn(g); // B's turn 3 draws Blue-Eyes
    ok(cnt(g, 1, 'gy', BIG) === 3 && !inZ(g, 1, 'hand', BIG), F + 'drawn Blue-Eyes destroyed on their 1st turn');
    endTurn(g); endTurn(g); // B's turn 5 draws Sangan (kept)
    ok(inZ(g, 1, 'hand', 'Sangan'), F + 'a drawn monster under 1500 is kept');
    endTurn(g); endTurn(g); // B's turn 7 draws Blue-Eyes (3rd turn)
    ok(cnt(g, 1, 'gy', BIG) === 4, F + 'destroyed on their 3rd turn too');
    endTurn(g); endTurn(g); // B's turn 9: over
    ok(inZ(g, 1, 'hand', BIG), F + 'checked for 3 turns only');
  });

  if (format === 'edison') {
    T(F + 'Sangan: no lock on the added name, no once per turn', () => {
      const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Sangan', 'Sangan'], deckTop: ['Witch of the Black Forest', 'Witch of the Black Forest'], turn: 2 }, {}] });
      act(g, 0, 'Dark Hole'); auto(g);
      ok(cnt(g, 0, 'hand', 'Witch of the Black Forest') === 2, F + 'both Sangans searched');
    });
    T(F + 'Sinister Serpent: back every Standby Phase, never banished', () => {
      const g = duel({ board: [{ gy: ['Sinister Serpent'], turn: 2 }, {}] });
      auto(g); ok(inZ(g, 0, 'hand', 'Sinister Serpent'), F + 'back in the hand');
      E.lib.move(g, card(g, 0, 'Sinister Serpent'), 'gy', { reason: 'discard' });
      endTurn(g); endTurn(g); auto(g);
      ok(inZ(g, 0, 'hand', 'Sinister Serpent') && !g.p[0].ban.length, F + 'back again next turn, nothing banished');
    });
    T(F + 'Dark Magician of Chaos: no once per turn on the Spell return', () => {
      const g = duel({ board: [{ hand: ['Dark Magician of Chaos'], m: [FILL, FILL], turn: 2 }, {}] });
      ok(!effs(g, 0, 'Dark Magician of Chaos')[0].opt, F + 'no once per turn');
    });
    T(F + 'Destiny HERO - Disk Commander: draws 2 each time, no once per Duel', () => {
      const g = duel({ board: [{ hand: ['Monster Reborn', 'Monster Reborn'], gy: ['Destiny HERO - Disk Commander', 'Destiny HERO - Disk Commander'], turn: 2 }, {}] });
      const h = g.p[0].hand.length;
      act(g, 0, 'Monster Reborn'); auto(g); act(g, 0, 'Monster Reborn'); auto(g);
      ok(cnt(g, 0, 'm', 'Destiny HERO - Disk Commander') === 2 && g.p[0].hand.length === h + 2, F + `both revived and drew 2 each (hand ${g.p[0].hand.length}, was ${h})`);
    });
  } else {
    T(F + 'D.D. Survivor: no once per turn', () => {
      const g = duel({ board: [{ m: ['D.D. Survivor'], turn: 2 }, {}] });
      ok(!effs(g, 0, 'D.D. Survivor')[0].opt, F + 'no once per turn');
    });
  }
}

suite('edison');
suite('goat');
console.log(fails ? `\n${fails} failed` : '\nAll errata checks passed.');
process.exit(fails ? 1 : 0);
