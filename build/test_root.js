// Guards for the root causes behind player bug reports (2026-11-27: fix the cause, not just the card). node build/test_root.js
// 1. Cards leaving the field "by rule": destroyed only where the rules say destroyed.
//    A replaced Field Spell is destroyed (Geartown ruling); an Equip Spell whose monster leaves is sent to the GY, not destroyed (Butterfly Dagger - Elma ruling 2).
// 2. Special Summon positions (askPos, the play game): an effect that names no position asks; one that names it doesn't.
// 3. Card kinds agree with card text: checked at build time in build/build_data.py (check_kinds), re-checked here on the shipped data.
// 4. Position questions read only the sentences that Special Summon (a position named elsewhere in the text used to skip the question).
// 5. Ongoing Level changes go through lv() (A Legendary Ocean, Stygian Dirge, Synchro Boost used to do nothing or lag a step).
// 6. A summon's "when summoned" moment ends when the next action starts (Bottomless Trap Hole was offered against later cards).
// 7. A Tribute cost takes face-down monsters unless the text says face-up (Icarus Attack couldn't Tribute a Set Blackwing).
// 9. Archetype checks match every member's name, not only names that start with it (XX-Saber cards for Gottoms' Emergency Call).
// 8. A Special Summon whose text names no position asks, whatever position the script defaults to (Destiny HERO - Malicious forced Defense).
// 10. Turning a monster face-down (setFaceDown) keeps its control change, drops its Equips, counters and once-per-turn uses, cuts Call of the Haunted's link.
// 11. Once-per-turn uses reset when a card leaves the field (Swap Frog, Card Trooper: a soft once per turn).
// 12. A face-down monster an effect turns face-up activates its Flip effect (Black Rose Dragon on a Set Morphing Jar).
// 13. "Is this effect negated" checks go through negd(), so Skill Drain counts; a monster's own ATK gain is lost for good once negated (Card Trooper).
// 14. Cold Wave blocks Spell/Trap activations (its check compared an object with a number).
// 15. Halving ATK sets the halved value (Gale the Whirlwind on Colossal Fighter: later Warriors in the GY add nothing).
// 16. Summoning conditions apply to every Special Summon, read from the text (Blizzard, Dark Armed Dragon, Chaos Sorcerer, Tsukuyomi, Fusions).
// 17. A negated summon never reached the field (Sangan's "sent from the field" search doesn't activate after Solemn Judgment).
// 18. Tributes leave before the Tribute Summon (Dupe Frog's "when" effect misses the timing).
// 19. A negated activation lifts its "the turn you activate this card" lock, a negated effect keeps it (Scapegoat, Soul Exchange, Spirit Reaper).
// 20. One hand self-summon per chain (Gorz, Tragoedia) and one Treeborn Frog per chain.
// 21. Tokens can't be turned face-down (Book of Moon), and cards that Special Summon can't be activated under Vanity's Fiend.
// 22. What a chain link would destroy is read from the card (engine wouldDestroy): Starlight Road, My Body as a Shield, Stardust Dragon, Royal Oppression on Starlight Road.
// 23. "When an opponent's monster declares an attack" cards only in the first chain (Mirror Force); an attacker that stopped attacking isn't banished (Dimensional Prison).
// 24. Stardust Dragon works in the Damage Step and doesn't return after its negation was negated (Divine Wrath).
// 25. A negated attack isn't an attack for Red Dragon Archfiend; "attack each monster once" ends after a direct attack (Asura Priest).
// 26. A hand win (Exodia) is checked when the effect has resolved (Graceful Charity).
// 27. Damage to both players goes through the damage statics at once (Ring of Destruction and Des Wombat).
// 28. Resolved Normal Spells/Traps leave when the whole chain ends (Dust Tornado on a chained card), and Dust Tornado Sets only if it destroyed.
// 29. Kycoo the Ghost Destroyer stops what banishes from a GY, read from the text (not a list of names).
// 30. Mandatory draws past the Deck lose the duel (no draw capped at the Deck size).
// 31. Your own face-up "either player" card is listed once (Royal Oppression).
// 32. Call of the Haunted: destroyed only when its monster is destroyed; a negated one (Jinzo) leaves its monster.
// 33. Chaos Sorcerer (and Goat's BLS - Envoy) can't banish after declaring an attack.
// 34-55 (Group D, 2026-11-27 audit): contact Fusion materials chosen; Armory Arm; battle triggers before a battle Flip effect; a response
//   window after a Set; Soul Exchange and Tribute costs; Swap Frog's extra summon; mandatory Flip effects; Spell Counters from the engine's
//   spellResolved event; Dark World cost discards; Deck Devastation Virus draws; one-line card fixes; own ATK changes lost on negation;
//   Miracle Fusion; Goat card fixes; Prodigy, Treeborn, One for One; Gorz's token and Legacy; effects of a monster negated by Junk Synchron.
// 56-62 (Group E1, 2026-11-28 audit, the move layer): banish-instead is a replacement in move(), and costs that send to the GY can't be paid
//   under it; move(..., 'ban') honors banish forbids (Imperial Iron Wall); Necrovalley from each format's own text; Extra Deck monsters go
//   back to the Extra Deck from any zone; a "sent to the GY" trigger survives its card leaving the GY (Dandylion); a resolved chained card
//   waiting to leave isn't bounced (Giant Trunade); a monster destroyed by battle stays doomed face-down and can't activate its effects.
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

T('Position question reads only the summon sentences', () => {
  const txt = n => C.find(x => x.n === n).tx;
  for (const [n, names] of [['Monster Reborn', false], ['Red-Eyes Zombie Dragon', false], ['Infernity Necromancer', false], ['Call of the Haunted', true], ['Premature Burial', true], ['Debris Dragon', true]])
    ok(E.namesPos(txt(n)) === names, `${n}: ${names ? 'names its position' : 'asks for a position'}`);
});

T('A Legendary Ocean lowers WATER Levels in the hand (a Level 5 needs no Tribute)', () => {
  const g = duel([{ hand: ['Terrorking Salmon', 'A Legendary Ocean'] }, { hand: [] }]);
  ok(!opt(g, new RegExp('ns:' + hand(g, 'Terrorking Salmon').u)), 'no Ocean: Terrorking Salmon needs a Tribute');
  act(g, new RegExp('a:' + hand(g, 'A Legendary Ocean').u + ':')); passAll(g);
  const s = hand(g, 'Terrorking Salmon');
  ok(E.lv(s) === 4, 'with Ocean: Level 4 in the hand');
  ok(!!opt(g, new RegExp('ns:' + s.u)), 'with Ocean: Normal Summon with no Tribute');
});

T('Stygian Dirge lowers the opponent’s Levels at once', () => {
  const g0 = duel([{}, { m: ['Cyber Dragon'] }]);
  ok(E.lv(g0.p[1].m.find(Boolean)) === 5, 'Cyber Dragon starts at Level 5');
  const g = duel([{ st: [{ n: 'Stygian Dirge', pos: 'up' }] }, { m: ['Cyber Dragon'] }]);
  ok(E.lv(g.p[1].m.find(Boolean)) === 4, 'Cyber Dragon is Level 4 under a face-up Stygian Dirge');
});

T('Bottomless Trap Hole is offered only in the summon’s own moment', () => {
  const g = duel([{ hand: [FILL, 'Pot of Avarice'], gy: [FILL, FILL, FILL, FILL, FILL] }, { st: [{ n: 'Bottomless Trap Hole', pos: 'set' }] }]);
  act(g, new RegExp('ns:' + hand(g, FILL).u));
  if (g.prompt && g.prompt.p === 0 && g.prompt.type === 'respond') E.act(g, ['pass']);
  ok(g.prompt && g.prompt.p === 1 && /Bottomless/.test(g.prompt.opts.map(o => o.label).join()), 'offered right after the summon');
  E.act(g, ['pass']);
  act(g, new RegExp('a:' + hand(g, 'Pot of Avarice').u + ':'));
  ok(!(g.prompt && g.prompt.p === 1 && /Bottomless/.test(g.prompt.opts.map(o => o.label).join())), 'not offered against a later card');
});

T('Icarus Attack: a face-down Winged Beast pays the cost, and 2 targets must remain', () => {
  const g = duel([{ m: [{ n: 'Blackwing - Bora the Spear', pos: 'set' }], st: [{ n: 'Icarus Attack', pos: 'set' }], turn: 2 }, { m: ['Cyber Dragon', { n: FILL, pos: 'set' }] }]);
  const ic = g.p[0].st.find(c => c && E.name(c) === 'Icarus Attack');
  ok(!!opt(g, new RegExp('a:' + ic.u + ':')), 'offered with only a face-down Winged Beast to Tribute');
  const h = duel([{ m: ['Blackwing - Bora the Spear'], st: [{ n: 'Icarus Attack', pos: 'set' }], turn: 2 }, { m: ['Cyber Dragon'] }]);
  const ic2 = h.p[0].st.find(c => c && E.name(c) === 'Icarus Attack');
  ok(!opt(h, new RegExp('a:' + ic2.u + ':')), 'not offered when only 1 target would remain after the Tribute');
});

T('Destiny HERO - Malicious asks for a position (its text names none)', () => {
  const g = E.newDuel({ decks: [{ name: 't', main: Array(40).fill(id('Destiny HERO - Malicious')), extra: [] }, { name: 't', main: Array(40).fill(id(FILL)), extra: [] }],
    first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], askPos: true, board: [{ gy: ['Destiny HERO - Malicious'], hand: [], turn: 2 }, {}] });
  act(g, /Malicious/);
  ok(g.prompt && /which position/i.test(g.prompt.text || ''), 'asks Attack or Defense');
});

T('Tribute costs require face-up only when the text says so', () => {
  const fs = require('fs'), path = require('path'), dir = path.join(__dirname, '..', 'js');
  const byN = new Map(C.map(c => [c.n, c]));
  // summoning conditions and Viruses keep their face-up check until their rulings are checked (FEEDBACK.md, 2026-11-27)
  const KEEP = new Set(['Deck Devastation Virus', 'Masked Beast Des Gardius', 'Armed Dragon LV10', 'Infernal Incinerator', 'Red-Eyes Darkness Dragon', 'Exxod, Master of The Guard', 'Checkmate']);
  const files = ['engine.js', ...fs.readdirSync(path.join(dir, 'cards')).map(f => 'cards/' + f)];
  let bad = 0;
  for (const f of files) { let cur = null;
    fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((ln, i) => {
      const m = ln.match(/^\s*'([^']+)':\s*\{/); if (m && byN.has(m[1])) cur = m[1];
      if (!/Tribute/i.test(ln) || !/pick\(/.test(ln) || !/faceUp\(/.test(ln) || /face-up/i.test(ln) || KEEP.has(cur)) return;
      const tx = (byN.get(cur) || {}).tx || '';
      if (!/face-up/i.test(tx.split(/(?<=[.;:])\s+/).filter(x => /Tribut/i.test(x)).join(' '))) { bad++; console.log(`  ${f}:${i + 1} ${cur}`); }
    }); }
  ok(!bad, 'no Tribute cost wrongly requires a face-up monster');
});

T("Gottoms' Emergency Call revives XX-Saber monsters", () => {
  const g = duel([{ m: ['X-Saber Airbellum'], st: [{ n: "Gottoms' Emergency Call", pos: 'set' }], gy: ['XX-Saber Emmersblade', 'XX-Saber Garsem'], turn: 2 }, {}]);
  const ec = g.p[0].st.find(c => c && E.name(c) === "Gottoms' Emergency Call");
  ok(!!opt(g, new RegExp('a:' + ec.u + ':')), 'offered with two XX-Sabers in the GY');
});

T('Archetype name checks catch every monster of the archetype', () => {
  const fs = require('fs'), path = require('path'), dir = path.join(__dirname, '..', 'js');
  const files = ['engine.js', ...fs.readdirSync(path.join(dir, 'cards')).map(f => 'cards/' + f)];
  const OK = new Set(['Worm ']);   // the Worm archetype is Reptiles named "Worm ..."; Aztekipede, the Worm Warrior and others are not in it
  const seen = new Set(); let bad = 0;
  for (const f of files) for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(/\/\^([A-Za-z][A-Za-z .'\-]+?)\//g)) {
    const w = m[1]; if (seen.has(w) || OK.has(w)) continue; seen.add(w);
    const miss = C.filter(c => !['spell', 'trap'].includes(c.k) && c.n.includes(w) && !c.n.startsWith(w));
    if (miss.length) { bad++; console.log(`  /^${w}/ (${f}) misses ${miss.map(c => c.n).join(', ')}`); }
  }
  ok(!bad, 'no start-only archetype pattern misses a monster of that archetype');
});

const actU = (g, c) => act(g, new RegExp('a:' + c.u + ':'));
// end turns until player `who` has a free action on a later turn
function toTurnOf(g, who) { const t0 = g.turnNo; for (let i = 0; i < 80 && g.prompt; i++) { if (g.prompt.type === 'idle' && g.prompt.p === who && g.turnNo !== t0) return;
  if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (g.prompt.type === 'idle') E.act(g, [(g.prompt.opts.find(o => o.key === 'end') || g.prompt.opts[g.prompt.opts.length - 1]).key]);
  else if (g.prompt.type === 'yesno') E.act(g, ['n']); else E.act(g, g.prompt.opts.slice(0, g.prompt.min || 1).map(o => o.key)); } }

T('Turning a monster face-down keeps control changes and clears what it carried (Book of Moon)', () => {
  let g = duel([{ hand: ['Brain Control', 'Book of Moon'] }, { m: ['Cyber Dragon'] }]);
  actU(g, hand(g, 'Brain Control')); pickFirst(g); passAll(g); const cd = g.p[0].m.find(Boolean);
  actU(g, hand(g, 'Book of Moon')); pickFirst(g); passAll(g); toTurnOf(g, 1);
  ok(cd && cd.ctrl === 1, 'Brain Control, then Book of Moon: the monster still goes back in the End Phase');
  g = duel([{ hand: ['Snatch Steal', 'Book of Moon'] }, { m: ['Cyber Dragon'] }]);
  actU(g, hand(g, 'Snatch Steal')); pickFirst(g); passAll(g); const st = g.p[0].m.find(Boolean);
  actU(g, hand(g, 'Book of Moon')); pickFirst(g); passAll(g);
  ok(g.p[0].gy.some(c => E.name(c) === 'Snatch Steal') && st.ctrl === 0, 'Snatch Steal goes to the GY and control stays');
  toTurnOf(g, 1); ok(g.p[1].lp === 8000 && st.ctrl === 0, 'no more Standby LP gain, and the monster stays');
  g = duel([{ m: ['Card Trooper'], hand: ['Book of Moon'] }, {}]); const ct = g.p[0].m.find(Boolean);
  actU(g, ct); E.act(g, [g.prompt.opts[0].key]); passAll(g);
  actU(g, hand(g, 'Book of Moon')); pickFirst(g); passAll(g); act(g, new RegExp('flip:' + ct.u)); passAll(g);
  ok(E.atk(g, ct) === 400 && !!opt(g, new RegExp('a:' + ct.u + ':')), 'Card Trooper flipped back up: its ATK gain is gone and its effect can be used again');
  g = duel([{ st: [{ n: 'Call of the Haunted', pos: 'set' }], hand: ['Book of Moon', 'Mystical Space Typhoon'], gy: ['Cyber Dragon'], turn: 2 }, {}]);
  actU(g, g.p[0].st.find(Boolean)); pickFirst(g); passAll(g); const cd2 = g.p[0].m.find(Boolean);
  actU(g, hand(g, 'Book of Moon')); pickFirst(g); passAll(g); actU(g, hand(g, 'Mystical Space Typhoon')); pickFirst(g); passAll(g);
  ok(cd2 && cd2.zone === 'm', 'Call of the Haunted destroyed after the monster was turned face-down: the monster stays');
});

T('Once per turn resets when the card leaves the field', () => {
  const g = duel([{ m: ['Card Trooper'] }, {}]); const ct = g.p[0].m.find(Boolean);
  actU(g, ct); E.act(g, [g.prompt.opts[0].key]); passAll(g);
  E.lib.move(g, ct, 'hand', { reason: 'effect' }); E.lib.ss(g, 0, ct, 'atk', {}); passAll(g);
  ok(!Object.keys(ct.used).some(k => /^\d+$/.test(k)), 'Card Trooper back on the field has no use recorded');
});

T('An effect that flips a monster face-up activates its Flip effect (Black Rose Dragon on Morphing Jar)', () => {
  const g = duel([{ m: ['Black Rose Dragon'], gy: ['Lonefire Blossom'] }, { m: [{ n: 'Morphing Jar', pos: 'set' }] }]);
  actU(g, g.p[0].m.find(Boolean)); pickFirst(g); pickFirst(g); passAll(g);
  ok(g.log.some(l => /Morphing Jar's effect/.test(l)), "Morphing Jar's Flip effect activated");
});

T('Skill Drain switches off name-coded effects, and a lost ATK gain stays lost', () => {
  let g = duel([{ m: ['Dupe Frog'] }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]);
  ok(E.name(g.p[0].m.find(Boolean)) === 'Dupe Frog', 'Dupe Frog is not treated as Des Frog under Skill Drain');
  g = duel([{ m: ['Card Trooper'] }, { st: [{ n: 'Skill Drain', pos: 'set' }] }]); const ct = g.p[0].m.find(Boolean);
  actU(g, ct); E.act(g, [g.prompt.opts[0].key]); passAll(g);
  const sd = g.p[1].st.find(Boolean); sd.pos = 'up'; E.lib.emit(g, { type: 'pos', c: sd, p: 1 });
  ok(E.atk(g, ct) === 400, 'Card Trooper loses its gain under Skill Drain');
  E.lib.move(g, sd, 'gy', { reason: 'effect' }); ok(E.atk(g, ct) === 400, 'and it does not come back when Skill Drain leaves');
  const fs = require('fs'), path = require('path'), dir = path.join(__dirname, '..', 'js'); let bad = 0;
  for (const f of ['engine.js', ...fs.readdirSync(path.join(dir, 'cards')).map(f => 'cards/' + f)])
    fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((ln, i) => { if (/&& !\w+\.flags\.negated\b/.test(ln) && !/flags\.negated = /.test(ln)) { bad++; console.log(`  ${f}:${i + 1}`); } });
  ok(!bad, 'no effect check reads flags.negated instead of negd()');
});

T('Cold Wave stops Spell and Trap activations', () => {
  const g = duel([{ hand: ['Cold Wave', 'Mystical Space Typhoon'] }, { st: [{ n: 'Royal Oppression', pos: 'set' }] }]);
  actU(g, hand(g, 'Cold Wave')); passAll(g);
  ok(!opt(g, new RegExp('a:' + hand(g, 'Mystical Space Typhoon').u + ':')), 'Mystical Space Typhoon is not offered');
});

T('Halving sets the halved ATK (Gale the Whirlwind locks Colossal Fighter)', () => {
  const g = duel([{ m: ['Blackwing - Gale the Whirlwind'] }, { m: ['Colossal Fighter'], hand: ['Command Knight'] }]);
  const col = g.p[1].m.find(Boolean); actU(g, g.p[0].m.find(Boolean)); pickFirst(g); passAll(g);
  const h = E.atk(g, col); E.lib.move(g, g.p[1].hand.find(c => E.name(c) === 'Command Knight'), 'gy', { reason: 'effect' });
  ok(h === 1400 && E.atk(g, col) === 1400, 'Colossal Fighter stays at 1400 with a new Warrior in the GY');
  const fs = require('fs'), path = require('path'), dir = path.join(__dirname, '..', 'js'); let bad = 0;
  for (const f of ['engine.js', ...fs.readdirSync(path.join(dir, 'cards')).map(f => 'cards/' + f)])
    fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((ln, i) => { if (/(atk|def): -\((\w+) - Math\.floor\(\2 \/ 2\)\)/.test(ln)) { bad++; console.log(`  ${f}:${i + 1}`); } });
  ok(!bad, 'no halving is written as a fixed minus');
});


// answer every prompt: pass responses (or o.respond's pick), first option on picks/chooses, yes on yes/no; returns the yes/no texts seen
function drive(g, o = {}) { const seen = []; for (let i = 0; i < 60 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { const a = o.respond && o.respond(pr); E.act(g, [a || 'pass']); }
  else if (pr.type === 'yesno') { seen.push(pr.text); E.act(g, [o.no ? 'n' : 'y']); }
  else E.act(g, pr.opts.slice(0, pr.min || 1).map(x => x.key)); } return seen; }
const keyOf = (g, c) => g.prompt && g.prompt.opts.find(o => o.key.startsWith('a:' + c.u + ':'));
const respondWith = (g, p, n) => pr => { const c = g.p[p].st.find(x => x && E.name(x) === n); const o = c && pr.opts.find(x => x.key.startsWith('a:' + c.u + ':')); return o && o.key; };

T('Summoning conditions apply to every Special Summon (Blizzard, Dark Armed Dragon, Chaos Sorcerer, Tsukuyomi)', () => {
  let g = duel([{ hand: ['Blackwing - Blizzard the Far North'], gy: ['Blackwing - Blizzard the Far North'] }, {}]);
  act(g, new RegExp('ns:' + hand(g, 'Blackwing - Blizzard the Far North').u)); const asked = drive(g);
  ok(!asked.some(t => /Blizzard/.test(t)) && g.p[0].gy.some(c => E.name(c) === 'Blackwing - Blizzard the Far North'), 'Blizzard can\'t revive another Blizzard ("Cannot be Special Summoned")');
  g = duel([{ hand: ['Monster Reborn'], gy: ['Dark Armed Dragon', { n: 'Chaos Sorcerer', proper: false }, 'Elemental HERO Absolute Zero', { n: 'Stardust Dragon', proper: false }] }, {}]);
  ok(!keyOf(g, hand(g, 'Monster Reborn')), 'Monster Reborn has no target: Dark Armed Dragon and Absolute Zero never come back, Chaos Sorcerer and Stardust were never properly summoned');
  const cs = g.p[0].gy.find(c => E.name(c) === 'Chaos Sorcerer'); cs.proper = true;
  ok(!E.lib.forbid(g, { type: 'ss', c: cs, p: 0 }), 'a properly summoned Chaos Sorcerer can be revived ("Must first be")');
  g = duel([{ deckTop: [FILL, 'Tsukuyomi'] }, {}]); const tsu = g.p[0].deck.find(c => E.name(c) === 'Tsukuyomi');
  ok(!!tsu && E.lib.forbid(g, { type: 'ss', c: tsu, p: 0 }), 'Tsukuyomi can\'t be Special Summoned from the Deck');
});

T('Goat: Tsukuyomi from the Deck, and a Fusion that Metamorphosis brought out (summoning conditions)', () => {
  const vm = require('vm'), fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'goat/data/cards.js', 'js/engine.js', ...fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort().map(f => 'js/cards/' + f)];
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const G = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; G.init(GC, { format: 'goat' });
  const gid = n => GC.find(x => x.n === n).id, deck = () => ({ name: 't', main: Array(40).fill(gid('Sangan')), extra: [gid('Thousand-Eyes Restrict')] });
  const g = G.newDuel({ decks: [deck(), deck()], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: [{ hand: ['Metamorphosis'], m: ['Sinister Serpent'], deckTop: ['Sangan', 'Tsukuyomi'] }, {}] });
  const tsu = g.p[0].deck.find(c => G.name(c) === 'Tsukuyomi');
  ok(!!tsu && G.lib.forbid(g, { type: 'ss', c: tsu, p: 0 }), 'Goat Tsukuyomi can\'t be Special Summoned from the Deck (Mystic Tomato)');
  const ter = g.p[0].extra[0]; G.lib.ss(g, 0, ter, 'atk', { how: 'special' }); G.lib.move(g, ter, 'gy', { reason: 'effect', destroyed: true });
  ok(G.lib.forbid(g, { type: 'ss', c: ter, p: 0 }), 'a Fusion that wasn\'t Fusion Summoned (Metamorphosis) can\'t be revived');
});

T('A negated summon never reached the field (Sangan under Solemn Judgment)', () => {
  const g = duel([{ hand: ['Sangan'] }, { st: [{ n: 'Solemn Judgment', pos: 'set' }] }]);
  act(g, new RegExp('ns:' + hand(g, 'Sangan').u)); drive(g, { respond: respondWith(g, 1, 'Solemn Judgment') });
  ok(g.p[0].gy.some(c => E.name(c) === 'Sangan') && !g.log.some(l => /Sangan's effect/.test(l)), 'Sangan is destroyed and its search doesn\'t activate');
});

T('Tributes leave before the Tribute Summon (Dupe Frog misses the timing)', () => {
  const g = duel([{ hand: ['Raiza the Storm Monarch'], m: ['Dupe Frog'], deckTop: [FILL, 'Treeborn Frog'] }, {}]);
  act(g, new RegExp('ns:' + hand(g, 'Raiza the Storm Monarch').u)); const seen = drive(g);
  ok(g.log.some(l => /Tribute Summoned Raiza/.test(l)) && !seen.some(t => /Dupe Frog|Des Frog/.test(t)), 'no "Use Dupe Frog\'s effect?" after a Tribute Summon');
});

T('A negated activation lifts its "this turn" lock, a negated effect keeps it (Scapegoat, Soul Exchange, Spirit Reaper)', () => {
  let g = duel([{ hand: ['Scapegoat', FILL] }, { st: [{ n: 'Magic Jammer', pos: 'set' }], hand: [FILL] }]);
  actU(g, hand(g, 'Scapegoat')); drive(g, { respond: respondWith(g, 1, 'Magic Jammer') });
  ok(!g.p[0].m.some(Boolean) && !!opt(g, /^Normal Summon/), 'Scapegoat negated by Magic Jammer: you can still Normal Summon');
  g = duel([{ hand: ['Scapegoat', FILL] }, {}]); actU(g, hand(g, 'Scapegoat')); drive(g);
  ok(g.p[0].m.filter(Boolean).length === 4 && !opt(g, /^Normal Summon/) && !!opt(g, /^Set face-down/), 'Scapegoat resolved: no Normal Summon, a Set is fine');
  g = duel([{ hand: ['Scapegoat', FILL] }, { st: [{ n: 'Royal Oppression', pos: 'up' }] }]);
  actU(g, hand(g, 'Scapegoat')); drive(g, { respond: respondWith(g, 1, 'Royal Oppression') });
  ok(!g.p[0].m.some(Boolean) && !opt(g, /^Normal Summon/), 'Royal Oppression negates the summon: still no Normal Summon');
  g = duel([{ hand: ['Soul Exchange'], turn: 2 }, { m: [FILL], st: [{ n: 'Magic Jammer', pos: 'set' }], hand: [FILL] }]);
  actU(g, hand(g, 'Soul Exchange')); drive(g, { respond: respondWith(g, 1, 'Magic Jammer') });
  ok(!!opt(g, /^Battle Phase/), 'Soul Exchange negated by Magic Jammer: the Battle Phase is allowed');
  g = duel([{ hand: ['Brain Control'] }, { m: ['Spirit Reaper'], st: [{ n: 'Imperial Order', pos: 'up' }] }]);
  actU(g, hand(g, 'Brain Control')); drive(g);
  ok(g.p[1].gy.some(c => E.name(c) === 'Spirit Reaper'), 'Spirit Reaper is destroyed by a Spell whose effect Imperial Order negates (ruling 5)');
});

T('One hand self-summon per chain (Gorz, Tragoedia) and one Treeborn Frog per chain', () => {
  let g = duel([{ gy: ['Treeborn Frog', 'Treeborn Frog'], turn: 2 }, {}]); drive(g);
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Treeborn Frog').length === 1, 'only one Treeborn Frog comes back');
  const mk = () => ({ name: 't', main: Array(40).fill(id(FILL)), extra: [] });
  g = E.newDuel({ decks: [mk(), mk()], first: 1, seed: 1, noShuffle: true, names: ['A', 'B'], board: [{ hand: ['Tragoedia', 'Gorz the Emissary of Darkness'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, /^Battle Phase/); drive(g); const cd = g.p[1].m.find(Boolean); act(g, new RegExp('atk:' + cd.u + ':d')); drive(g);
  const mine = g.p[0].m.filter(Boolean).map(E.name);
  ok(mine.length && !(mine.includes('Gorz the Emissary of Darkness') && mine.includes('Tragoedia')), `Gorz and Tragoedia don't both come out (${mine.join(', ')})`);
});

T('Tokens can\'t be turned face-down, and cards that Special Summon can\'t be activated under Vanity\'s Fiend', () => {
  let g = duel([{ hand: ['Book of Moon'], m: ['Sheep Token'] }, {}]); const tok = g.p[0].m[0];
  ok(!keyOf(g, hand(g, 'Book of Moon')), 'Book of Moon can\'t target a Token (not offered with only a Sheep Token out)');
  ok(E.lib.setFaceDown(g, tok) === false && tok.pos !== 'set', 'setFaceDown leaves a Token face-up');
  g = duel([{ hand: ['Scapegoat', 'One for One', FILL, 'Treeborn Frog'] }, { m: ["Vanity's Fiend"] }]);
  ok(!keyOf(g, hand(g, 'Scapegoat')) && !keyOf(g, hand(g, 'One for One')), 'Scapegoat and One for One are not offered');
});

// ----- Group C (2026-11-27 audit, fixer 3): destruction, battle and chains -----
const respondOpt = (g, p, n) => g.prompt && g.prompt.type === 'respond' && g.prompt.p === p && g.prompt.opts.some(o => (g.p[p].st.concat(g.p[p].m, g.p[p].hand)).some(c => c && E.name(c) === n && o.key.startsWith('a:' + c.u + ':')));
const respondUntil = (g, p, n) => { for (let i = 0; i < 12 && g.prompt && g.prompt.type === 'respond'; i++) { if (respondOpt(g, p, n)) return true; E.act(g, ['pass']); } return false; };

T('What a chain link would destroy is read from the card (Dark Hole, Raigeki, Fissure, Judgment Dragon; Red Dragon Archfiend\'s empty End Phase)', () => {
  let g = duel([{ hand: ['Dark Hole'], m: [FILL] }, { m: [FILL, FILL], st: [{ n: 'Starlight Road', pos: 'set' }, { n: 'My Body as a Shield', pos: 'set' }] }]);
  actU(g, hand(g, 'Dark Hole'));
  ok(respondOpt(g, 1, 'Starlight Road') && respondOpt(g, 1, 'My Body as a Shield'), 'Dark Hole: Starlight Road and My Body as a Shield are offered');
  for (const card of ['Raigeki', 'Fissure']) {
    g = duel([{ hand: [card] }, { m: [FILL], st: [{ n: 'My Body as a Shield', pos: 'set' }] }]); actU(g, hand(g, card));
    ok(respondOpt(g, 1, 'My Body as a Shield'), `${card}: My Body as a Shield is offered (ruling 1)`);
  }
  g = duel([{ hand: ['Fissure'] }, { m: ['Morphtronic Celfon'], st: [{ n: 'Morphtronic Forcefield', pos: 'set' }], deckTop: ['Morphtronic Magnen'] }]); actU(g, hand(g, 'Fissure'));
  ok(!respondOpt(g, 1, 'Morphtronic Forcefield'), 'Fissure: Morphtronic Forcefield is not offered (it isn\'t certain which monster: ruling 2)');
  const Ld = (c, p, extra = {}) => ({ c, p, eff: E.lib.effsOf(c).find(e => e.tags && e.tags.destroy) || {}, tags: { destroy: 1 }, t: [], data: {}, negated: false, cardAct: true, ...extra });
  g = duel([{ m: ['Judgment Dragon', FILL], st: [{ n: 'Mirror Force', pos: 'set' }] }, { m: [FILL] }]);
  const jd = g.p[0].m[0];
  ok(E.lib.wouldDestroy(g, Ld(jd, 0, { cardAct: false })).length === 3, 'Judgment Dragon would destroy all other cards (3)');
  g = duel([{ m: ['Red Dragon Archfiend'] }, { st: [{ n: 'Stardust Dragon' }] }]);
  const rda = g.p[0].m[0], end = { c: rda, p: 0, eff: E.lib.effsOf(rda)[1], tags: { destroy: 1 }, t: [], data: {}, negated: false };
  ok(E.lib.wouldDestroy(g, end).length === 0, 'Red Dragon Archfiend alone: its End Phase effect destroys nothing, so Stardust can\'t negate it (ruling 9)');
  g = duel([{ hand: ['Heavy Storm'] }, { m: [FILL], st: [{ n: 'Starlight Road', pos: 'set' }, { n: 'Mirror Force', pos: 'set' }, { n: 'Royal Oppression', pos: 'up' }] }]);
  actU(g, hand(g, 'Heavy Storm')); const sr = g.p[1].st.find(c => c && E.name(c) === 'Starlight Road'); E.act(g, [opt(g, new RegExp('a:' + sr.u + ':')).key]);
  ok(respondUntil(g, 1, 'Royal Oppression') || respondUntil(g, 0, 'Royal Oppression'), 'Royal Oppression can answer Starlight Road (it Special Summons: ruling 11)');
});

T('The attack declaration\'s moment: after a pass, no Mirror Force; an attacker that stops attacking isn\'t banished or destroyed', () => {
  let g = duel([{ hand: ['Mystical Space Typhoon'], m: ['Cyber Dragon'], st: [{ n: 'Book of Moon', pos: 'set' }], turn: 2 }, { m: [FILL], st: [{ n: 'Mirror Force', pos: 'set' }, { n: 'Dust Tornado', pos: 'set' }] }]);
  act(g, /^Battle Phase/); passAll(g); act(g, /^Attack/);
  ok(respondOpt(g, 1, 'Mirror Force'), 'Mirror Force is offered at the attack declaration');
  E.act(g, ['pass']); for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'respond' && g.prompt.p === 1; i++) E.act(g, ['pass']);
  const mst = hand(g, 'Mystical Space Typhoon'); const k = g.prompt && g.prompt.opts.find(o => o.key.startsWith('a:' + mst.u + ':'));
  if (k) { E.act(g, [k.key]); pickFirst(g); }
  ok(!!k && !respondOpt(g, 1, 'Mirror Force'), 'B passed, A chains MST: Mirror Force is no longer offered (ruling 2)');
  for (const card of ['Dimensional Prison', 'Sakuretsu Armor']) {
    g = duel([{ m: ['Cyber Dragon'], st: [{ n: 'Book of Moon', pos: 'set' }], turn: 2 }, { m: [FILL], st: [{ n: card, pos: 'set' }] }]);
    act(g, /^Battle Phase/); passAll(g); act(g, /^Attack/);
    drive(g, { respond: pr => { if (pr.p === 1) return respondWith(g, 1, card)(pr); return respondWith(g, 0, 'Book of Moon')(pr); } });
    ok(g.p[0].m.some(c => c && E.name(c) === 'Cyber Dragon'), `${card}: an attacker Book of Moon turned face-down stays (archive)`);
  }
});

T('Stardust Dragon: Damage Step use, and no End Phase return once its negation was negated (ruling 17)', () => {
  ok(!!E.lib.effsOf({ id: id('Stardust Dragon') })[0].ds && !!E.lib.effsOf({ id: id('Thought Ruler Archfiend') })[1].ds, 'Stardust Dragon and Thought Ruler Archfiend can be used in the Damage Step');
  const g = duel([{ hand: ['Heavy Storm'], st: [{ n: 'Divine Wrath', pos: 'set' }], turn: 2 }, { m: ['Stardust Dragon'], st: [{ n: 'Mirror Force', pos: 'set' }], hand: [FILL] }]);
  actU(g, hand(g, 'Heavy Storm'));
  drive(g, { respond: pr => { if (pr.p === 1) { const s = g.p[1].m.find(c => c && E.name(c) === 'Stardust Dragon'); const o = s && pr.opts.find(x => x.key.startsWith('a:' + s.u + ':')); if (o) return o.key; } return respondWith(g, 0, 'Divine Wrath')(pr); } });
  ok(g.log.some(l => /Divine Wrath/.test(l)) && g.p[1].gy.some(c => E.name(c) === 'Stardust Dragon'), 'Divine Wrath negated Stardust');
  act(g, /^End turn|\[end\]/); const seen = drive(g);
  ok(!g.p[1].m.some(c => c && E.name(c) === 'Stardust Dragon') && !seen.some(t => /Stardust/.test(t)), 'Stardust doesn\'t come back in the End Phase');
});

T('A negated attack isn\'t an attack for Red Dragon Archfiend (ruling 4), and "attack each monster" stops after a direct attack (Asura Priest)', () => {
  let g = duel([{ m: ['Red Dragon Archfiend', 'Cyber Dragon'], turn: 2 }, { st: [{ n: 'Magic Cylinder', pos: 'set' }] }]);
  act(g, /^Battle Phase/); passAll(g); const cd = g.p[0].m.find(c => c && E.name(c) === 'Cyber Dragon');
  act(g, new RegExp('atk:' + cd.u + ':')); drive(g, { respond: respondWith(g, 1, 'Magic Cylinder') });
  act(g, /^End Battle|endbp/); passAll(g); act(g, /^End turn|\[end\]/); drive(g);
  ok(g.p[0].gy.some(c => E.name(c) === 'Cyber Dragon'), 'Cyber Dragon, whose attack Magic Cylinder negated, is destroyed by Red Dragon Archfiend');
  g = duel([{ m: ['Asura Priest'], turn: 2 }, {}]); const ap = g.p[0].m[0];
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + ap.u + ':d')); drive(g);
  E.lib.ss(g, 1, g.p[1].hand[0], 'atk');
  ok(!E.battleOpts(g).some(o => o.key.startsWith('atk:' + ap.u + ':')), 'Asura Priest can\'t attack a monster that appeared after its direct attack');
});

const goatEngine = () => {
  const vm = require('vm'), fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  for (const f of ['data/cards.js', 'goat/data/cards.js', 'js/engine.js', ...fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort().map(f => 'js/cards/' + f)]) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const G = ctx.window.EdisonEngine, GC = ctx.window.GOAT_CARDS; G.init(GC, { format: 'goat' });
  const gid = n => GC.find(x => x.n === n).id, deck = () => ({ name: 't', main: Array(40).fill(gid('Sangan')), extra: [] });
  return { G, mk: board => G.newDuel({ decks: [deck(), deck()], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board }) };
};
T('Goat: a hand win waits for the effect to resolve (Graceful Charity with the last Exodia pieces)', () => {
  const { G, mk } = goatEngine();
  const ex = ['Exodia the Forbidden One', 'Right Arm of the Forbidden One', 'Left Arm of the Forbidden One', 'Right Leg of the Forbidden One', 'Left Leg of the Forbidden One'];
  let g = mk([{ hand: ['Graceful Charity', ...ex.slice(0, 3)], deckTop: ['Sangan', ex[3], ex[4], 'Sangan'], turn: 2 }, {}]);
  const gc = g.p[0].hand.find(c => G.name(c) === 'Graceful Charity'); G.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + gc.u + ':')).key]);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) G.act(g, ['pass']);
  ok(g.winner == null && g.prompt && g.prompt.type === 'pick', 'all five pieces drawn: no win before the discard');
  const pieces = g.prompt.opts.filter(o => /Forbidden One/.test(o.label)).slice(0, 2); G.act(g, pieces.map(o => o.key));
  ok(g.winner == null, 'two pieces discarded: no win (ruling)');
});
T('Goat: damage to both players goes through the damage statics (Ring of Destruction and Des Wombat)', () => {
  const { G, mk } = goatEngine(); let g;
  g = mk([{ hand: ['Ring of Destruction'], m: ['Sangan'] }, { m: ['Des Wombat'] }]);
  const r = g.p[0].hand[0]; G.act(g, [g.prompt.opts.find(o => o.key.startsWith('setst:' + r.u)).key]);
  r.turnIn = -1; const wombat = g.p[1].m[0];
  for (let i = 0; i < 40 && g.prompt && !(g.prompt.p === 0 && g.prompt.opts.some(o => o.key.startsWith('a:' + r.u + ':'))); i++) { const pr = g.prompt; if (pr.type === 'respond') G.act(g, ['pass']); else if (pr.type === 'idle') G.act(g, [(pr.opts.find(o => o.key === 'end') || pr.opts[pr.opts.length - 1]).key]); else G.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  const k = g.prompt && g.prompt.opts.find(o => o.key.startsWith('a:' + r.u + ':'));
  if (k) { G.act(g, [k.key]); for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick') G.act(g, [pr.opts.find(o => /Sangan/.test(o.label)) ? pr.opts.find(o => /Sangan/.test(o.label)).key : pr.opts[0].key]); else G.act(g, ['pass']); } }
  ok(!!k && g.p[1].lp === 8000 && g.p[0].lp === 7000, `Ring of Destruction on A's Sangan with Des Wombat on B's side: B takes 0, A takes 1000 (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});

T('Resolved Normal Spells/Traps leave when the whole chain ends (Dust Tornado on a chained Normal Trap), and Dust Tornado Sets only after it destroyed', () => {
  let g = duel([{ hand: ['Book of Moon'], st: [{ n: 'Dust Tornado', pos: 'set' }], turn: 2 }, { m: [FILL], st: [{ n: 'Mystical Space Typhoon', pos: 'set' }, { n: 'Mirror Force', pos: 'set' }] }]);
  const dt = g.p[0].st[0]; actU(g, dt); const mst = g.p[1].st.find(c => c && E.name(c) === 'Mystical Space Typhoon'); E.act(g, ['u' + mst.u]);
  drive(g, { respond: pr => { if (pr.p !== 1) return null; const o = pr.opts.find(x => x.key.startsWith('a:' + mst.u + ':')); return o && o.key; } });
  ok(g.log.some(l => /Mystical Space Typhoon was destroyed/.test(l)), 'the chained MST is still on the field when Dust Tornado resolves, so it is destroyed');
  ok(g.log.some(l => /Set a card/.test(l)) || g.p[0].st.some(c => c && E.name(c) === 'Book of Moon'), 'Dust Tornado destroyed its target: A Set a card');
  g = duel([{ hand: ['Book of Moon'], st: [{ n: 'Dust Tornado', pos: 'set' }], turn: 2 }, { m: [FILL], st: [{ n: 'Mirror Force', pos: 'set' }, { n: 'Mystical Space Typhoon', pos: 'set' }] }]);
  const dt2 = g.p[0].st[0]; actU(g, dt2); const mf = g.p[1].st.find(c => c && E.name(c) === 'Mirror Force'), mst2 = g.p[1].st.find(c => c && E.name(c) === 'Mystical Space Typhoon'); E.act(g, ['u' + mf.u]);
  const seen = [];
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
    if (pr.type === 'respond') { const o = pr.p === 1 && pr.opts.find(x => x.key.startsWith('a:' + mst2.u + ':')); E.act(g, [o ? o.key : 'pass']); }
    else if (pr.type === 'pick') { const o = pr.opts.find(x => x.key === 'u' + mf.u); E.act(g, [o ? o.key : pr.opts[0].key]); }
    else if (pr.type === 'yesno') { seen.push(pr.text); E.act(g, ['y']); } else E.act(g, [pr.opts[0].key]); }
  ok(!seen.some(t => /Set a Spell\/Trap/.test(t)), 'its target was destroyed by a chained MST first: no Set');
});

T('Kycoo stops what banishes from a GY, read from the text, and nothing else', () => {
  let g = duel([{ hand: ['Chaos Sorcerer'], gy: ['Lyla, Lightsworn Sorceress', 'Dark Armed Dragon', 'Plaguespreader Zombie', 'Blackwing - Bora the Spear'], m: [{ n: 'Dark Armed Dragon' }], turn: 2 }, { m: ['Kycoo the Ghost Destroyer'] }]);
  const daf = g.p[0].m[0];
  ok(!opt(g, new RegExp('sp:' + hand(g, 'Chaos Sorcerer').u + '$')) && !opt(g, new RegExp('a:' + daf.u + ':')), 'no Chaos Sorcerer summon and no Dark Armed Dragon effect under Kycoo');
  g = duel([{ m: [{ n: 'Chaos Sorcerer' }], turn: 2 }, { m: ['Kycoo the Ghost Destroyer'] }]);
  ok(!!opt(g, new RegExp('a:' + g.p[0].m[0].u + ':')), 'Chaos Sorcerer\'s banish from the field still works under Kycoo');
  g = duel([{ hand: ['Burial from a Different Dimension'], ban: ['Cyber Dragon'] }, { m: ['Kycoo the Ghost Destroyer'] }]);
  ok(!!keyOf(g, hand(g, 'Burial from a Different Dimension')), 'Burial from a Different Dimension (returns banished cards) is not blocked');
});

T('Mandatory draws past the Deck lose the duel (no deck-size guard on a draw)', () => {
  const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..'); let bad = [];
  for (const f of ['js/engine.js', ...fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).map(f => 'js/cards/' + f)]) {
    const s = fs.readFileSync(path.join(root, f), 'utf8');
    if (/deck\.length\) draw\(|draw\(g, [^,]+, Math\.min\([^)]*deck\.length/.test(s)) bad.push(f);
  }
  ok(!bad.length, `draws aren't capped at the Deck size (${bad.join(', ') || 'none'})`);
  const g = duel([{ m: [{ n: 'Dekoichi the Battlechanted Locomotive', pos: 'set' }], turn: 2 }, {}]); g.p[0].deck.length = 0;
  act(g, new RegExp('flip:' + g.p[0].m[0].u)); drive(g);
  ok(g.winner === 1, 'Dekoichi flipped with an empty Deck: A loses');
});

T('Each activatable card is listed once (your own face-up Royal Oppression)', () => {
  const g = duel([{ st: [{ n: 'Call of the Haunted', pos: 'set' }], gy: [FILL], turn: 2 }, { st: [{ n: 'Royal Oppression', pos: 'up' }] }]);
  actU(g, g.p[0].st[0]); pickFirst(g); const ro = g.p[1].st[0];
  const n = g.prompt && g.prompt.type === 'respond' ? g.prompt.opts.filter(o => o.key.startsWith('a:' + ro.u + ':')).length : -1;
  ok(n === 1, `B's own Royal Oppression is offered once against Call of the Haunted (${n})`);
});

T('Call of the Haunted: its monster Tributed leaves it on the field; destroyed under Jinzo, the monster stays', () => {
  let g = duel([{ hand: ['Raiza the Storm Monarch'], m: [FILL], st: [{ n: 'Call of the Haunted', pos: 'up' }] }, {}]);
  const coth = g.p[0].st[0], m = g.p[0].m[0]; E.lib.link(g, coth, m);
  act(g, new RegExp('ns:' + hand(g, 'Raiza the Storm Monarch').u)); drive(g);
  ok(E.lib.onField(coth) && g.log.some(l => /Tribute Summoned Raiza/.test(l)), 'Tributing the monster leaves Call of the Haunted on the field (archive)');
  g = duel([{ m: ['Jinzo'], st: [{ n: 'Call of the Haunted', pos: 'up' }] }, {}]);
  const c2 = g.p[0].st[0], j = g.p[0].m[0]; E.lib.link(g, c2, j); E.lib.destroy(g, [c2]);
  ok(j.zone === 'm', 'Call of the Haunted destroyed while Jinzo is face-up: Jinzo stays (archive)');
});

T('Chaos Sorcerer can\'t banish after it declared an attack this turn (rulings 3, 5)', () => {
  const g = duel([{ m: [{ n: 'Chaos Sorcerer' }], turn: 2 }, { m: [FILL] }]); const cs = g.p[0].m[0];
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + cs.u + ':')); drive(g);
  act(g, /^End Battle|endbp/); drive(g);
  ok(!opt(g, new RegExp('a:' + cs.u + ':')), 'no banish in Main Phase 2 after attacking');
});

/* ---------- Group D (fixer 4, 2026-11-27 audit) ---------- */
const onM = (g, p, n) => g.p[p].m.find(c => c && E.data(c).n === n);
T('Contact Fusions: the player picks the materials, face-down ones of your own and the opponent\'s count (Chimeratech Fortress Dragon)', () => {
  const g2 = E.newDuel({ decks: [{ name: 't', main: Array(40).fill(id(FILL)), extra: [id('Chimeratech Fortress Dragon')] }, { name: 't', main: Array(40).fill(id(FILL)), extra: [] }], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'],
    board: [{ m: [{ n: 'Cyber Dragon', pos: 'set' }], turn: 2 }, { m: ['Cyber Dragon', 'Armory Arm'] }] });
  const x = g2.p[0].extra[0]; act(g2, new RegExp('cf:' + x.u));
  ok(g2.prompt && g2.prompt.type === 'pick', 'with 2 Cyber Dragons the player picks which one');
  const own = g2.p[0].m[0]; E.act(g2, ['u' + own.u]);
  ok(g2.prompt && g2.prompt.type === 'pick' && g2.prompt.max === 2 && g2.prompt.opts.length === 2, 'then 1 or more Machines, the other Cyber Dragon among them');
  const arm = g2.p[1].m[1]; E.act(g2, ['u' + arm.u]); drive(g2);
  ok(x.zone === 'm' && E.atk(g2, x) === 2000 && g2.p[1].m[0] && E.data(g2.p[1].m[0]).n === 'Cyber Dragon', 'own face-down Cyber Dragon + their Armory Arm: 2000 ATK, their Cyber Dragon stays');
});
T('Armory Arm: +1000 on whichever monster it equips, its owner\'s opponent takes the damage, and it can unequip itself', () => {
  const g = duel([{ m: ['Armory Arm'], turn: 2 }, { m: ['Cyber Dragon'] }]); const arm = g.p[0].m[0], cd = g.p[1].m[0];
  act(g, new RegExp('a:' + arm.u + ':0')); pickFirst(g); drive(g);
  ok(arm.zone === 'st' && E.atk(g, cd) === 3100, `equipped to the opponent's Cyber Dragon: 3100 ATK (${E.atk(g, cd)})`);
  const l = { ev: { snap: { atk: 1900 } } };
  const dmgEff = E.lib.effsOf(arm)[1]; const before = [g.p[0].lp, g.p[1].lp]; const it = dmgEff.res(g, arm, 0, l); it.next();
  ok(g.p[1].lp === before[1] - 1900 && g.p[0].lp === before[0], 'its damage goes to the opponent of its controller (site ruling)');
  const g2 = duel([{ m: ['Armory Arm', 'Cyber Dragon'], turn: 2 }, {}]); const a2 = g2.p[0].m[0];
  act(g2, new RegExp('a:' + a2.u + ':0')); pickFirst(g2); drive(g2);
  ok(!opt(g2, new RegExp('a:' + a2.u + ':2')), 'once per turn: no unequip the turn it equipped');
  g2.turnNo += 2; const un = E.idleOpts(g2).find(o => o.key.startsWith('a:' + a2.u + ':2'));
  ok(!!un, 'a later turn: Unequip and Special Summon is offered');
  const it2 = E.lib.effsOf(a2)[2].res(g2, a2, 0, {}); for (let r = it2.next(); !r.done; r = it2.next());
  ok(a2.zone === 'm' && a2.pos === 'atk' && !a2.equipTo, 'resolved: Armory Arm is back as a monster in Attack Position');
});
T('Battle order: Red Dragon Archfiend\'s effect resolves before the flipped monster\'s Flip effect (site ruling 1)', () => {
  const g = duel([{ m: ['Red Dragon Archfiend'], turn: 3 }, { m: [{ n: 'Cyber Jar', pos: 'set' }] }]);
  const rda = g.p[0].m[0]; act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + rda.u + ':')); 
  const order = []; for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['n']); else E.act(g, pr.opts.slice(0, pr.min || 1).map(x => x.key)); }
  const iR = g.log.findIndex(l => /activated Red Dragon Archfiend/.test(l)), iC = g.log.findIndex(l => /activated Cyber Jar/.test(l));
  ok(iR >= 0 && iC > iR && !/Chain Link/.test(g.log[iC]), `Red Dragon Archfiend's effect resolves first; Cyber Jar's Flip effect starts a new chain (${g.log[iC]})`);
  ok(g.log.some(l => /^Cyber Jar was destroyed/.test(l)) || g.p[1].gy.some(c => E.name(c) === 'Cyber Jar'), 'Cyber Jar was destroyed by Red Dragon Archfiend and its Flip effect still activated');
});
T('The opponent may respond to a Set before the next action (MST before a Synchro Summon)', () => {
  const g = duel([{ hand: ['Mirror Force'], turn: 2 }, { st: [{ n: 'Mystical Space Typhoon', pos: 'set' }] }]);
  act(g, new RegExp('setst:' + hand(g, 'Mirror Force').u));
  ok(g.prompt && g.prompt.type === 'respond' && g.prompt.p === 1 && !!keyOf(g, g.p[1].st[0]), 'B is asked to respond to the Set, MST offered (MST site ruling 1)');
  E.act(g, ['pass']); ok(g.prompt && g.prompt.type === 'idle' && g.prompt.p === 0, 'after the pass A is back at the idle prompt');
});
T('Soul Exchange: two copies give two Tributes, and its target pays Tribute costs too (site rulings 3, 5)', () => {
  const g = duel([{ hand: ['Soul Exchange', 'Soul Exchange', 'Enemy Controller'], turn: 2 }, { m: [FILL, 'Cyber Dragon', 'Ally of Justice Catastor'] }]);
  const [s1, s2] = g.p[0].hand.filter(c => E.name(c) === 'Soul Exchange');
  actU(g, s1); E.act(g, ['u' + g.p[1].m[0].u]); drive(g); actU(g, s2); E.act(g, ['u' + g.p[1].m[1].u]); drive(g);
  ok(E.lib.tributeCands(g, 0).length === 2, 'both targets can be Tributed');
  const ec = hand(g, 'Enemy Controller'); ok(!!opt(g, new RegExp('a:' + ec.u + ':')), 'Enemy Controller can be activated with no monster of your own');
  actU(g, ec); const ch = g.prompt; ok(ch && ch.type === 'choose' && ch.opts.length === 2, 'its Tribute mode is offered (a Soul Exchange target)');
});
T('Mind Control\'s monster can\'t be Tributed for Metamorphosis (Goat judge ruling)', () => {
  const { G, mk } = goatEngine();
  const g = mk([{ hand: ['Metamorphosis'], turn: 2 }, {}]); const s = G.lib;
  const m = s.tribPool(g, 0); ok(m.length === 0, 'nothing to Tribute');
  const g2 = mk([{ hand: ['Metamorphosis'], m: ['Sinister Serpent'] }, {}]); g2.p[0].m[0].flags.noTribute = true;
  ok(!g2.prompt.opts.some(o => o.key.startsWith('a:' + g2.p[0].hand[0].u + ':')), 'a monster that can\'t be Tributed (Mind Control) gives no Metamorphosis');
});
T('Swap Frog\'s extra Normal Summon: a Frog Summon only, never a Set, used first; its cost never returns a Synchro or Token', () => {
  const g = duel([{ hand: ['Dupe Frog', 'Treeborn Frog'], m: ['Swap Frog', 'Junk Warrior', FILL], turn: 2 }, {}]);
  const sw = g.p[0].m[0]; act(g, new RegExp('a:' + sw.u + ':1'));
  ok(g.prompt.type === 'pick' && !g.prompt.opts.some(o => o.key === 'u' + g.p[0].m[1].u), 'Junk Warrior (a Synchro) is not offered as the cost');
  E.act(g, ['u' + g.p[0].m[2].u]); drive(g);
  act(g, new RegExp('ns:' + hand(g, 'Dupe Frog').u)); drive(g);
  ok(g.ns[0] === 0 && !g.frogNS[0], 'the Frog used the extra summon first');
  ok(!!opt(g, new RegExp('ns:' + hand(g, 'Treeborn Frog').u)) && !!opt(g, new RegExp('set:' + hand(g, 'Treeborn Frog').u)), 'the regular Normal Summon or Set is still there');
  const g2 = duel([{ hand: ['Dupe Frog'], m: ['Swap Frog'], turn: 2 }, {}]); g2.ns[0] = 1; g2.frogNS[0] = true; g2.seq++;
  const opts = E.idleOpts(g2); const df = hand(g2, 'Dupe Frog');
  ok(opts.some(o => o.key === 'ns:' + df.u) && !opts.some(o => o.key === 'set:' + df.u), 'with only the extra summon left: Summon yes, Set no (site ruling)');
});
T('Flip effects always activate (Ryko\'s mill, Mega Hamster), Ryko\'s destroy is optional', () => {
  const g = duel([{ m: [{ n: 'Ryko, Lightsworn Hunter', pos: 'set' }, FILL], turn: 2 }, {}]);
  act(g, new RegExp('flip:' + g.p[0].m[0].u)); const texts = [];
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'yesno') { texts.push(pr.text); E.act(g, ['n']); } else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, pr.opts.slice(0, pr.min || 1).map(x => x.key)); }
  ok(texts.some(t => /target a card to destroy/.test(t)) && !texts.some(t => /Use Ryko/.test(t)), 'no "use the effect?" question, only whether to target');
  ok(g.p[0].m[1] && g.p[0].gy.length === 3, 'Warwolf stays, 3 cards milled');
  const h = duel([{ m: [{ n: 'Super-Nimble Mega Hamster', pos: 'set' }], turn: 2 }, {}]); act(h, new RegExp('flip:' + h.p[0].m[0].u)); drive(h);
  ok(h.log.some(l => /activated Super-Nimble Mega Hamster/.test(l)), 'Mega Hamster\'s Flip effect activates with no Beast in the Deck');
});
T('Spell Counters: every resolved Spell Card activation counts, Continuous Spells too, and a negated one doesn\'t (Goat SWM)', () => {
  const { G, mk } = goatEngine();
  const g = mk([{ hand: ['Swords of Revealing Light', 'Messenger of Peace'], m: ['Skilled White Magician'], turn: 2 }, {}]);
  const swm = g.p[0].m[0]; const a = n => { const c = g.p[0].hand.find(x => G.name(x) === n); G.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + c.u + ':')).key]); for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) G.act(g, g.prompt.type === 'respond' ? ['pass'] : g.prompt.opts.slice(0, g.prompt.min || 1).map(x => x.key)); };
  a('Swords of Revealing Light'); a('Messenger of Peace');
  ok(G.lib.ctr(swm, 'spell') === 2, `Swords and a Continuous Spell both give a counter (${G.lib.ctr(swm, 'spell')})`);
});
T('Dark World: a discard paid as a cost isn\'t "discarded by a card effect" (Edison archive)', () => {
  const g = duel([{ hand: ['Dark Grepher', 'Sillva, Warlord of Dark World'], turn: 2 }, {}]);
  act(g, new RegExp('sp:' + hand(g, 'Dark Grepher').u)); drive(g);
  ok(g.p[0].gy.some(c => E.name(c) === 'Sillva, Warlord of Dark World') && !g.p[0].m.some(c => c && E.name(c) === 'Sillva, Warlord of Dark World'), 'Sillva discarded for Grepher\'s summon (a cost) stays in the GY');
});
T('Deck Devastation Virus: a drawn monster is destroyed at once, with no chain, until the 3rd turn counting the activation turn', () => {
  const g = duel([{ deckTop: [FILL, 'D.D. Crow'], turn: 2 }, {}]); g.b1ddv = [{ u: -1, p: 1, victim: 0, until: g.turnNo + 4 }];
  E.lib.draw(g, 0, 1);
  ok(g.p[0].gy.some(c => E.name(c) === 'D.D. Crow') && !g.pend.length, 'D.D. Crow drawn: destroyed, nothing pending');
  const src = require('fs').readFileSync(require('path').join(__dirname, '../js/cards/batch-1.js'), 'utf8');
  ok(/g\.tp === o \? 4 : 5/.test(src), 'activated on the victim\'s turn it lasts to turn T+4 (ruling 4)');
});
T('Card fixes from the audit (one line each, read from the text and rulings)', () => {
  let g;
  g = duel([{ m: ['Ally of Justice Catastor'], turn: 3 }, { m: [{ n: 'Cyber Dragon', pos: 'set' }] }]);
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + g.p[0].m[0].u + ':')); drive(g);
  ok(!g.log.some(l => /activated Ally of Justice Catastor/.test(l)), 'Catastor\'s effect doesn\'t activate against a face-down monster');
  g = duel([{ hand: [FILL, FILL], m: ['Brionac, Dragon of the Ice Barrier'], turn: 2 }, { st: [{ n: 'Mirror Force', pos: 'set' }, { n: 'Torrential Tribute', pos: 'set' }] }]);
  const br = g.p[0].m[0]; act(g, new RegExp('a:' + br.u + ':')); for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'pick' && pr.opts.some(o => o.key === 'u' + g.p[1].st[0].u)) E.act(g, ['u' + g.p[1].st[0].u]); else E.act(g, pr.opts.slice(0, pr.min || 1).map(x => x.key)); }
  ok(!!opt(g, new RegExp('a:' + br.u + ':')), 'Brionac can be used again the same turn (2010 text)');
  g = duel([{ hand: ['Mind Crush'], turn: 2 }, {}]);
  ok(!opt(g, new RegExp('setst:')) || !g.prompt.opts.some(o => o.key.startsWith('a:' + hand(g, 'Mind Crush').u)), 'Mind Crush needs a card in both hands');
  g = duel([{ m: ['Unifrog', 'Unifrog'] }, {}]); ok(!E.lib.effsOf(g.p[0].m[0])[0].cond(g, g.p[0].m[0], 0), 'another Unifrog isn\'t the Frog Unifrog needs');
  g = duel([{ hand: ['Evil HERO Malicious Edge'], m: [FILL], turn: 2 }, { m: [FILL] }]);
  ok(!!opt(g, new RegExp('ns:' + hand(g, 'Evil HERO Malicious Edge').u)) && !opt(g, new RegExp('set:' + hand(g, 'Evil HERO Malicious Edge').u)), 'Malicious Edge: a Tribute Summon with 1 Tribute, no Set with 1');
  g = duel([{ m: ['Treeborn Frog'] }, { m: ['Substitoad'] }]); ok(E.lib.cantBattleDestroy(g, g.p[0].m[0]), 'the opponent\'s Substitoad protects your Frogs too');
  g = duel([{ hand: ['Dark Bribe'] }, {}]); g.p[1].deck.length = 0;
  ok(!E.lib.effsOf(hand(g, 'Dark Bribe'))[0].cond(g, hand(g, 'Dark Bribe'), 0, { top: { cardAct: true, c: hand(g, 'Dark Bribe'), p: 1 } }), 'no Dark Bribe when the opponent can\'t draw');
  g = duel([{ m: ['Elemental HERO Absolute Zero', 'Elemental HERO Absolute Zero'] }, {}]);
  ok(E.atk(g, g.p[0].m[0]) === 2500, `another Absolute Zero doesn't count (${E.atk(g, g.p[0].m[0])})`);
  g = duel([{ m: ['Elemental HERO Neos Alius', 'Superalloy Beast Raptinus'] }, {}]); E.lib.emit(g, { type: 'phase', ph: 'x' });
  ok(!!g.p[0].m[0].flags.gemini && E.name(g.p[0].m[0]) === 'Elemental HERO Neos', 'Superalloy Beast Raptinus makes the Gemini an Effect Monster, and Neos Alius is named "Elemental HERO Neos"');
  E.lib.move(g, g.p[0].m[1], 'gy', { reason: 'effect' }); ok(!g.p[0].m[0].flags.gemini && E.name(g.p[0].m[0]) === 'Elemental HERO Neos Alius', 'Raptinus gone: a Normal Monster again');
  g = duel([{ m: ['Card Trooper'], turn: 2 }, {}]); const ct = g.p[0].m[0]; act(g, new RegExp('a:' + ct.u + ':0'));
  E.act(g, [g.prompt.opts[2].key]); ok(g.p[0].gy.length === 3 && g.events.filter(e => e.type === 'move' && e.from === 'deck' && e.to === 'gy' && e.reason === 'cost' && e.asCost).length === 3 && E.atk(g, ct) === 1900, 'Card Trooper sends the cards as its cost (site ruling), then gains 1500');
});
T('A monster\'s own ATK change is lost once negated where its card says so (EDOPro\'s disable reset): Flamvell Uruquizas, Dark End Dragon', () => {
  const g = duel([{ m: ['Flamvell Uruquizas', 'Dark End Dragon'] }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]);
  const u = g.p[0].m[0], d = g.p[0].m[1];
  E.lib.addMod(g, u, { atk: 300, own: true }); E.lib.addMod(g, d, { atk: -500, def: -500, own: true });
  ok(E.atk(g, u) === 2100 && E.atk(g, d) === 2600, 'under Skill Drain the changes don\'t apply');
  const src = ['js/engine.js', 'js/cards/full-36.js'].map(f => require('fs').readFileSync(require('path').join(__dirname, '..', f), 'utf8')).join('\n');
  ok(/'Flamvell Uruquizas'[^\n]*\n?[^\n]*addMod\(g, c, \{ atk: 300, own: true \}\)/.test(src) && /addMod\(g, c, \{ atk: -500, def: -500, own: true \}\)/.test(src), 'the scripts mark them own');
});
T('Miracle Fusion: any Elemental HERO Fusion, face-down materials too; only the field under Kycoo', () => {
  const mkD = (b, ex) => E.newDuel({ decks: [{ name: 't', main: Array(40).fill(id(FILL)), extra: ex.map(id) }, { name: 't', main: Array(40).fill(id(FILL)), extra: [] }], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: b });
  let g = mkD([{ hand: ['Miracle Fusion'], gy: ['Elemental HERO Burstinatrix', 'Elemental HERO Bubbleman'], turn: 2 }, {}], ['Elemental HERO Steam Healer']);
  ok(!!keyOf(g, hand(g, 'Miracle Fusion')), 'Steam Healer from GY materials');
  g = mkD([{ hand: ['Miracle Fusion'], m: [{ n: 'Elemental HERO Ocean', pos: 'set' }], gy: ['Elemental HERO Stratos'], turn: 2 }, {}], ['Elemental HERO Absolute Zero']);
  ok(!!keyOf(g, hand(g, 'Miracle Fusion')), 'a Set Ocean counts as a WATER material');
  g = mkD([{ hand: ['Miracle Fusion'], gy: ['Elemental HERO Ocean', 'Elemental HERO Stratos'], turn: 2 }, { m: ['Kycoo the Ghost Destroyer'] }], ['Elemental HERO Absolute Zero']);
  ok(!keyOf(g, hand(g, 'Miracle Fusion')), 'GY-only materials under Kycoo: not activatable');
  g = mkD([{ hand: ['Miracle Fusion'], m: ['Elemental HERO Ocean', 'Elemental HERO Stratos'], turn: 2 }, { m: ['Kycoo the Ghost Destroyer'] }], ['Elemental HERO Absolute Zero']); drive(g, { no: true });
  ok(!!keyOf(g, hand(g, 'Miracle Fusion')), 'field materials under Kycoo: activatable (ruling 1)');
});
T('Goat: Thunder Dragon searches for 0, TER stops Flip Summons, an attacker turned face-down isn\'t Flip Summoned, Sangan skips "?" ATK', () => {
  const { G, mk } = goatEngine(); let g;
  g = mk([{ hand: ['Thunder Dragon'], turn: 2 }, {}]); const td = g.p[0].hand[0];
  ok(g.prompt.opts.some(o => o.key.startsWith('a:' + td.u + ':')), 'Thunder Dragon can be discarded with none left in the Deck (Netrep)');
  g = mk([{ m: [{ n: 'Magician of Faith', pos: 'set' }], turn: 2 }, { m: ['Thousand-Eyes Restrict'] }]);
  ok(!g.prompt.opts.some(o => o.key === 'flip:' + g.p[0].m[0].u), 'no Flip Summon under Thousand-Eyes Restrict');
  g = mk([{ m: [{ n: 'Sangan', pos: 'set' }], turn: 2 }, {}]); g.p[0].m[0].attacks = 1; g.seq++;
  ok(!G.idleOpts(g).some(o => o.key === 'flip:' + g.p[0].m[0].u), 'a monster that attacked this turn can\'t be Flip Summoned (Book of Moon ruling)');
  const src = require('fs').readFileSync(require('path').join(__dirname, '../js/cards/batch-1.js'), 'utf8');
  ok(/'Sangan'[\s\S]{0,200}atkLE\(x, 1500\)/.test(src), 'Sangan\'s search needs a printed ATK of 1500 or less');
});
T('Infernal Prodigy draws when banished after its Tribute; Treeborn Frog again in the same Standby Phase; One for One keeps a Level 1', () => {
  const g = duel([{ m: ['Evil HERO Infernal Prodigy'] }, {}]); const pr = g.p[0].m[0], fake = g.p[0].hand[0];
  E.lib.move(g, pr, 'gy', { reason: 'tribute' }); E.lib.emit(g, { type: 'summon', cs: [{ ...fake, id: id('Elemental HERO Stratos') }], how: 'tribute', p: 0, tribs: [pr] });
  E.lib.move(g, pr, 'ban', { reason: 'effect' }); g.pend = []; E.lib.emit(g, { type: 'phase', ph: 'end', tp: 0 });
  ok(g.pend.some(t => t.c === pr), 'banished from the GY: it still draws (ruling 2)');
  const g2 = duel([{ hand: ['One for One', 'Treeborn Frog'], deckTop: ['Pot of Greed'], turn: 2 }, {}]);
  ok(!keyOf(g2, hand(g2, 'One for One')), 'the only Level 1 can\'t be both the cost and the summon (ruling 3)');
  const tf = E.lib.effsOf({ id: id('Treeborn Frog') })[0];
  const g3 = duel([{ gy: ['Treeborn Frog'] }, {}]); g3.phase = 'standby'; const t3 = g3.p[0].gy[0];
  ok(tf.on(g3, { type: 'move', c: t3, to: 'gy' }, t3), 'sent to the GY in its own Standby Phase: it can activate again (ruling 1)');
});
T('Gorz\'s token has "?" ATK: Shrink makes it 0 (archive); Legacy of Yata-Garasu can draw 2 against a Spirit', () => {

  const src = require('fs').readFileSync(require('path').join(__dirname, '../js/cards/batch-3.js'), 'utf8');
  ok(/tokAtk != null && isNaN\(parseInt\(D\(t\)\.atk/.test(src) && E.data({ id: 'tok-gorz' }).atk === '?', 'Shrink sets a "?" Token\'s ATK to 0');
  const g2 = duel([{ st: [{ n: 'Legacy of Yata-Garasu', pos: 'set' }], turn: 2 }, { m: ['Asura Priest'] }]); actU(g2, g2.p[0].st[0]);
  ok(g2.prompt && g2.prompt.type === 'choose' && /Draw 2/.test(g2.prompt.opts[1].label), 'the draw-2 option is offered while they control a face-up Spirit');
});
T('Junk Synchron: a revived monster can still activate its effects (costs paid, resolves negated)', () => {
  const g = duel([{ m: [FILL], gy: ['Swap Frog'], turn: 2 }, {}]); const sw = g.p[0].gy[0]; E.lib.ss(g, 0, sw, 'def', { negate: true });
  ok(E.idleOpts(g).some(o => o.key.startsWith('a:' + sw.u + ':1')) && E.lib.negd(g, sw), 'Swap Frog revived by Junk Synchron can return a monster as its cost (site ruling)');
});


/* ----- Group E1 (2026-11-28 audit): the move layer ----- */
const gyOf = (g, p, n) => g.p[p].gy.some(c => E.name(c) === n), banOf = (g, p, n) => g.p[p].ban.some(c => E.name(c) === n);
T('56. Banish instead of the GY is a replacement: nothing "sent to the GY" happens, and GY costs can\'t be paid (Dimensional Fissure, Macro Cosmos, DMoC)', () => {
  let g = duel([{ hand: ['Dark Hole'] }, { m: ['Sangan'], st: [{ n: 'Dimensional Fissure', pos: 'up' }] }]);
  actU(g, hand(g, 'Dark Hole')); const seen = drive(g);
  ok(banOf(g, 1, 'Sangan') && !g.p[1].gy.some(c => E.name(c) === 'Sangan') && !seen.some(t => /Sangan/.test(t)) && !g.log.some(l => /activated Sangan/.test(l)), 'Sangan destroyed under Fissure is banished, never in the GY, and doesn\'t search');
  g = duel([{ m: ['Card Trooper', 'Cyber Dragon', 'Armory Arm'], hand: ['D.D. Crow', 'Trade-In', 'Blue-Eyes White Dragon'], extra: ['Chimeratech Fortress Dragon'], turn: 2 }, { st: [{ n: 'Dimensional Fissure', pos: 'up' }], gy: ['Sangan'] }]);
  ok(!keyOf(g, g.p[0].m[0]) && !opt(g, /^Special Summon.*cf:|cf:/), 'Card Trooper\'s mill cost and Chimeratech\'s summon aren\'t offered under Fissure (archive)');
  ok(!!keyOf(g, hand(g, 'Trade-In')), 'Trade-In\'s plain discard cost still can be paid (ruling)');
  ok(E.lib.gyCostBlocked(g, hand(g, 'D.D. Crow'), E.lib.effsOf(hand(g, 'D.D. Crow'))[0]), 'D.D. Crow can\'t be discarded to the GY under Fissure (site)');
  g = duel([{ m: ['Brionac, Dragon of the Ice Barrier'], hand: ['Sangan'], turn: 2 }, { st: [{ n: 'Macro Cosmos', pos: 'up' }], m: [FILL] }]);
  ok(!keyOf(g, g.p[0].m[0]), 'Brionac\'s discard-to-the-GY cost isn\'t offered under Macro Cosmos (archive)');
  const { G, mk } = goatEngine(); const h = mk([{ m: ['Dark Magician of Chaos'], turn: 3 }, { m: [{ n: 'Sangan', pos: 'atk' }] }]);
  const dm = h.p[0].m[0]; G.act(h, [h.prompt.opts.find(o => o.key === 'bp').key]); for (let i = 0; i < 5 && h.prompt.type === 'respond'; i++) G.act(h, ['pass']);
  G.act(h, [h.prompt.opts.find(o => o.key.startsWith('atk:' + dm.u + ':')).key]); for (let i = 0; i < 30 && h.prompt && h.prompt.type !== 'idle'; i++) G.act(h, [h.prompt.type === 'respond' ? 'pass' : h.prompt.type === 'yesno' ? 'y' : h.prompt.opts[0].key]);
  ok(h.p[1].ban.some(c => G.name(c) === 'Sangan') && !h.log.some(l => /activated Sangan/.test(l)), 'Goat: a monster DMoC destroys by battle is banished instead, so Sangan doesn\'t search');
});
T('57. move(..., \'ban\') honors banish forbids (Imperial Iron Wall: Caius, Macro Cosmos)', () => {
  let g = duel([{ m: [FILL] }, { m: ['Dark Armed Dragon'], st: [{ n: 'Imperial Iron Wall', pos: 'up' }] }]);
  const dad = g.p[1].m[0]; const r = E.lib.move(g, dad, 'ban', { reason: 'effect', by: 0 });
  ok(!r && E.onField(dad), 'an effect can\'t banish under Imperial Iron Wall (Caius: "no cards can be removed from play")');
  E.lib.destroy(g, [dad], { by: 0, banish: true }); ok(gyOf(g, 1, 'Dark Armed Dragon'), 'a destroy-and-banish still destroys, into the GY (Nobleman of Crossout site ruling)');
  g = duel([{ m: ['Sangan'] }, { st: [{ n: 'Imperial Iron Wall', pos: 'up' }, { n: 'Macro Cosmos', pos: 'up' }] }]);
  E.lib.destroy(g, [g.p[0].m[0]], { by: 1 }); ok(gyOf(g, 0, 'Sangan'), 'Imperial Iron Wall trumps Macro Cosmos: the card goes to the GY (site ruling)');
});
T('58. Necrovalley follows each format\'s text: Edison negates effects that target the GY; Goat stops moving cards out of the GY', () => {
  let g = duel([{ hand: ['Monster Reincarnation', 'Sangan'], gy: ['Cyber Dragon'] }, { fz: 'Necrovalley' }]);
  actU(g, hand(g, 'Monster Reincarnation')); drive(g);
  ok(gyOf(g, 0, 'Cyber Dragon') && g.log.some(l => /Necrovalley negated Monster Reincarnation/.test(l)), 'Edison: Monster Reincarnation targets the GY, so it is negated (site ruling)');
  g = duel([{ m: ['Red-Eyes Darkness Metal Dragon'], gy: ['Blue-Eyes White Dragon'], hand: [], turn: 2 }, { fz: 'Necrovalley' }]);
  actU(g, g.p[0].m[0]); drive(g);
  ok(g.p[0].m.some(c => c && E.name(c) === 'Blue-Eyes White Dragon'), 'Edison: Red-Eyes Darkness Metal Dragon\'s summon doesn\'t target, so Necrovalley leaves it (site ruling)');
  g = duel([{ hand: ['Chaos Sorcerer'], gy: ['Shining Angel', 'Sangan'] }, { fz: 'Necrovalley' }]);
  ok(!E.idleOpts(g).some(o => o.key === 'sp:' + hand(g, 'Chaos Sorcerer').u), 'Chaos Sorcerer can\'t be summoned by banishing from the GY under Necrovalley');
  const { G, mk } = goatEngine(); const h = mk([{ hand: ['Monster Reborn'], gy: ['Sangan'] }, { fz: 'Necrovalley' }]);
  const mr = h.p[0].hand.find(c => G.name(c) === 'Monster Reborn');
  ok(!h.prompt.opts.some(o => o.key.startsWith('a:' + mr.u + ':')), 'Goat: Monster Reborn can\'t be activated under Necrovalley (Netrep: it prevents the activation)');
  const h2 = mk([{ m: ['Winged Sage Falcos'], turn: 3 }, { m: [{ n: 'Mystic Tomato', pos: 'atk' }], fz: 'Necrovalley' }]); const fa = h2.p[0].m[0];
  G.act(h2, ['bp']); for (let i = 0; i < 5 && h2.prompt.type === 'respond'; i++) G.act(h2, ['pass']);
  G.act(h2, [h2.prompt.opts.find(o => o.key.startsWith('atk:' + fa.u + ':')).key]);
  for (let i = 0; i < 30 && h2.prompt && h2.prompt.type !== 'idle'; i++) G.act(h2, [h2.prompt.type === 'respond' ? 'pass' : h2.prompt.type === 'yesno' ? (/Falcos/.test(h2.prompt.text) ? 'y' : 'n') : h2.prompt.opts[0].key]);
  ok(!h2.p[1].gy.some(c => G.name(c) === 'Mystic Tomato'), 'Goat: Falcos still puts the monster it destroyed on the Deck under Necrovalley (archive)');
});
T('59. Extra Deck monsters go back to the Extra Deck from any zone (A Feather of the Phoenix)', () => {
  const g = duel([{ gy: ['Stardust Dragon'] }, {}]); const sd = g.p[0].gy[0];
  E.lib.move(g, sd, 'deckTop', { reason: 'effect' }); ok(sd.zone === 'extra' && g.p[0].extra.includes(sd), 'a Synchro returned to the Deck from the GY goes to the Extra Deck');
});
T('60. A "sent to the GY" trigger still activates after its card left the GY (Dandylion and Monster Reincarnation)', () => {
  const g = duel([{ hand: ['Monster Reincarnation', 'Dandylion'], gy: [FILL] }, {}]);
  actU(g, hand(g, 'Monster Reincarnation'));
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['y']); else { const d = pr.opts.find(o => /Dandylion/.test(o.label)); E.act(g, [d ? d.key : pr.opts[0].key]); } }
  ok(!!hand(g, 'Dandylion') && g.p[0].m.filter(c => c && /Fluff/.test(E.name(c))).length === 2, 'discarded and returned to the hand: Dandylion still makes 2 Fluff Tokens (ruling example 3)');
});
T('61. A resolved chained Spell/Trap waiting for the chain to end isn\'t bounced (Giant Trunade with a chained MST)', () => {
  const g = duel([{ hand: ['Giant Trunade'], st: [{ n: 'Swords of Revealing Light', pos: 'up' }] }, { st: [{ n: 'Mystical Space Typhoon', pos: 'set' }] }]);
  actU(g, hand(g, 'Giant Trunade')); drive(g, { respond: pr => { if (pr.p !== 1) return null; const m = g.p[1].st.find(x => x && E.name(x) === 'Mystical Space Typhoon'); const o = m && pr.opts.find(x => x.key.startsWith('a:' + m.u + ':')); return o && o.key; } });
  ok(gyOf(g, 1, 'Mystical Space Typhoon') && !g.p[1].hand.some(c => E.name(c) === 'Mystical Space Typhoon'), 'MST chained to Trunade goes to the GY, not the hand (site ruling)');
});
T('62. A monster destroyed by battle stays doomed when turned face-down, and can\'t activate its effects (Tsukuyomi, Stardust ruling 14)', () => {
  const g = duel([{ m: ['Tsukuyomi'] }, {}]); const ts = g.p[0].m[0], tsE = E.lib.effsOf(ts).find(e => e.target);
  ts.flags.battleDoomed = true; ok(!tsE.cond(g, ts, 0), 'Tsukuyomi destroyed by the attack that flipped it can\'t pick itself (ruling)');
  E.lib.setFaceDown(g, ts); ok(ts.flags.battleDoomed === true, 'setFaceDown keeps the battle doom (Tsukuyomi can\'t save itself)');
  const g2 = duel([{ m: ['Stardust Dragon'] }, { hand: ['Dark Hole'], m: [FILL] }]); const sd2 = g2.p[0].m[0], dh = g2.p[1].hand.find(c => E.name(c) === 'Dark Hole');
  const fake = { c: dh, eff: E.lib.effsOf(dh)[0], p: 1, t: [], speed: 1, tags: { destroy: 1 }, data: {}, link: 1 };
  g2.chain.push(fake); const can = () => E._internal.activatable(g2, 0, 'respond').some(a => a.c === sd2);
  const before = can(); sd2.flags.battleDoomed = true; g2.seq++;
  ok(before && !can(), 'a Stardust destroyed by battle, waiting after damage calculation, can\'t negate (ruling 14)');
  g2.chain.pop();
});

console.log(fails ? `\n${fails} failed` : '\nAll root-cause guards passed.');
process.exit(fails ? 1 : 0);
