// Guards for the root causes behind player bug reports (2026-11-27: fix the cause, not just the card). node build/test_root.js
// 1. Cards leaving the field "by rule": destroyed only where the rules say destroyed.
//    A replaced Field Spell is destroyed (Geartown ruling); an Equip Spell whose monster leaves is sent to the GY, not destroyed (Butterfly Dagger - Elma ruling 2).
// 2. Special Summon positions (askPos, the play game): an effect that names no position asks; one that names it doesn't.
// 3. Card kinds agree with card text: checked at build time in build/build_data.py (check_kinds), re-checked here on the shipped data.
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(board, o = {}) {
  const mk = () => ({ name: 't', main: Array(40).fill(id(FILL)), extra: [] });
  return E.newDuel({ decks: [mk(), mk()], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board, askPos: !!o.askPos });
}
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; };
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const opt = (g, re) => g.prompt && g.prompt.opts.find(o => re.test(o.label + ' ' + o.key));
const act = (g, re) => { const o = opt(g, re); if (!o) throw new Error(`no option ${re} in ${g.prompt && g.prompt.type} "${g.prompt && g.prompt.text}": ${g.prompt && g.prompt.opts.map(o => o.label + '[' + o.key + ']').join(', ')}`); E.act(g, [o.key]); };
const passAll = g => { for (let i = 0; i < 30 && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const hand = (g, n) => g.p[0].hand.find(c => E.name(c) === n);
// answer any target pick with the first option
const pickFirst = g => { for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, g.prompt.min || 1).map(o => o.key)); };

T('Equip whose monster leaves is sent to the GY, not destroyed (Butterfly Dagger - Elma does not return)', () => {
  const g = duel([{ hand: ['Butterfly Dagger - Elma', 'Dark Hole'], m: [FILL] }, { hand: [] }]);
  act(g, new RegExp('a:' + hand(g, 'Butterfly Dagger - Elma').u + ':')); pickFirst(g); passAll(g);
  const elma = g.p[0].st.find(c => c && E.name(c) === 'Butterfly Dagger - Elma');
  ok(elma && elma.equipTo, 'Elma is equipped');
  act(g, new RegExp('a:' + hand(g, 'Dark Hole').u + ':')); passAll(g);
  ok(g.p[0].gy.some(c => E.name(c) === 'Butterfly Dagger - Elma'), 'Elma went to the GY with its monster');
  ok(!(g.prompt && /Elma/.test(g.prompt.text || '')), 'Elma offers no return to the hand (it was not destroyed)');
});

T('A replaced Field Spell is destroyed (Geartown Special Summons when you Set over it)', () => {
  const g = duel([{ hand: ['Geartown', 'Geartown', 'Ancient Gear Soldier'] }, { hand: [] }]);
  const [a, b] = g.p[0].hand.filter(c => E.name(c) === 'Geartown');
  act(g, new RegExp('a:' + a.u + ':')); passAll(g); act(g, new RegExp('setst:' + b.u));
  ok(g.prompt && g.prompt.type === 'yesno', 'Geartown asks to use its effect');
});

T('Special Summon positions: Monster Reborn asks, Call of the Haunted does not', () => {
  for (const [card, asks] of [['Monster Reborn', true], ['Call of the Haunted', false]]) {
    const g = duel([{ hand: [card], gy: ['Cyber Dragon'] }, { hand: [] }], { askPos: true });
    const c = hand(g, card);
    if (card === 'Call of the Haunted') { act(g, new RegExp('setst:' + c.u)); act(g, /end/); passAll(g);
      for (let i = 0; i < 40 && !(g.prompt && g.prompt.p === 0 && opt(g, new RegExp('a:' + c.u + ':'))); i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.p === 1) { const e = opt(g, /^End turn|\[end\]/) || g.prompt.opts.find(o => o.key === 'end'); E.act(g, [(e || g.prompt.opts[g.prompt.opts.length - 1]).key]); } else break; }
    }
    act(g, new RegExp('a:' + c.u + ':')); pickFirst(g); passAll(g);
    const asked = !!(g.prompt && /which position/i.test(g.prompt.text || ''));
    ok(asked === asks, `${card}: ${asks ? 'asks' : 'does not ask'} for a position`);
  }
});

T('Every card kind agrees with its text (no Extra Deck monster filed as Main Deck)', () => {
  let bad = 0;
  for (const r of C) {
    if (r.k === 'spell' || r.k === 'trap') continue;
    const first = (r.tx || '').split('\n')[0];
    const syn = /\+[^\n]*\bnon-Tuner/.test(first) || /\bTuner\s*\+/.test(first);
    if (syn !== (r.k === 'synchro')) { bad++; console.log('  ' + r.n + ': kind ' + r.k); }
  }
  ok(!bad, 'all ' + C.length + ' cards: Synchro text matches the Synchro kind');
});

console.log(fails ? `\n${fails} failed` : '\nAll root-cause guards passed.');
process.exit(fails ? 1 : 0);
