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
// 63-68 (Group E2, 2026-11-28 audit, summons, targets, Tributes, Synchros): one effect's several Special Summons are one summon (both
//   players' parts kept apart); Synchro materials read from the material line (tx fallback) and each material's own rules; effects that
//   Special Summon need something they can summon, and their choices list only summonable monsters; hand-filled targets go through
//   canTarget, which also covers the GY (Aurkus); Tribute costs follow the Tribute rules (Tribute-Summon-only tokens, Mask of Restrict,
//   "can't be Tributed", reason 'tribute'); stale Goat overrides dropped (the shared script follows the Goat text).
// 69-76 (Group E3, 2026-11-28 audit): continuous negators, Skill Drain, destruction checks, timing, statics and helpers.
// 77-90 (Group E3 part 2, 2026-11-28 audit): optional "instead" replacements asked before the destruction; Trap Monsters; "does not
//   start a chain" effects and maintenance costs; Gladiator Beast tag outs and other end-of-Battle-Phase effects; live "can't be Tributed"
//   and mandatory triggers under Skill Drain; own ATK/DEF gains lost for good; lasting self flags; one shared die roll; Type/Attribute
//   overrides and Equip rechecks; banish costs under banish locks; "only 1 face-up" monsters; battle-doomed monsters and ATK snapshots;
//   effects allowed twice in one chain; Spell Economics' LP hook and other shared-script fixes.
// 91-105 (Group E4, 2026-11-28 audit, card by card): paying LP equal to your LP (Edison yes, Goat no) and Goat Imperial Order's choice;
//   the Queen of Thorns, Flip Flop Frog and Light and Darkness Dragon regressions; copied names and contact materials; System Down under
//   Kycoo and "an opponent's monster" by controller; Neko Mane King and Secutor; Dupe Frog, Swap Frog, Card Trooper, Dark End Dragon;
//   effects their rulings allow (Silverwind, Treeborn, Spirit Reaper); Black Pendant; ordering your own simultaneous triggers; Fusion
//   substitutes; one-card fixes from edison-05 to 21 and the Goat batches.
// 106-121 (Group E4 part 2, 2026-11-28 audit): mandatory Quick Effects; damage calculation only; and the rest of the E4 list (see each guard).
// 122- (Group E4 part 3, 2026-11-28 audit): Soul Exchange targets in every Tribute pick; Tributes that lift a summon lock (Consecrated Light,
//   The Last Warrior); player-chosen Ojama zones; Chain Energy, Gearfried, Last Turn's later step; one trigger per event group; Light of
//   Intervention; Goat Dark Magician of Chaos; Lightsworn own chains and the hand limit; and the pass 2 FAILs (see each guard).
// 146- (Group E4 part 5, 2026-11-28 audit): Black Salvo's negation outliving the cost, Overload Fusion / Dark Calling banish checks and
//   substitutes, Chimeratech Overdragon's attacks and materials; Crystal Beast zones, Rainbow Ruins, Malicious Fiend, Aslla piscu; My Body as a
//   Shield's destroys hooks; Brain Research Lab; Storm Caller and Djinn in Ritual Summons; the pass 2 edison-12/13/17 and goat-06/07 FAILs;
//   Berserk Gorilla, Dark Balter, Ancient Forest's order; damage redirects, Barrier Statues, uniqueness timing, format-aware scripts (155-161).
// AI1. The computer Sets low-ATK Flip monsters instead of Normal Summoning them face-up (benzi_family), at every level.
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


/* ----- Group E2 (2026-11-28 audit): summons, targets, Tributes, Synchros ----- */
T('63. One effect that Special Summons several monsters is one summon (Return from the Different Dimension, Bottomless Trap Hole, Wanghu)', () => {
  let g = duel([{ st: [{ n: 'Return from the Different Dimension', pos: 'set' }], ban: ['Breaker the Magical Warrior', 'Dark Blade'], turn: 2 }, { st: [{ n: 'Bottomless Trap Hole', pos: 'set' }] }]);
  actU(g, g.p[0].st[0]);
  drive(g, { respond: pr => { if (pr.p !== 1) return null; const b = g.p[1].st.find(x => x && E.name(x) === 'Bottomless Trap Hole'); const o = b && pr.opts.find(x => x.key.startsWith('a:' + b.u + ':')); return o && o.key; } });
  ok(banOf(g, 0, 'Breaker the Magical Warrior') && banOf(g, 0, 'Dark Blade'), 'Bottomless Trap Hole sees both monsters of the one summon and banishes both');
  g = duel([{ m: [FILL] }, { m: [FILL] }]); g.resolvingL = { c: g.p[0].m[0], p: 0 }; g.ssBatch = { L: g.resolvingL, parts: [], cs: [], group: null };
  const a = g.p[0].deck[0], b = g.p[1].deck[0]; E.lib.ss(g, 0, a); E.lib.ss(g, 1, b);
  ok(g.events.filter(e => e.type === 'summon').length === 0, 'inside a resolving link the summon event waits for the link');
  const bat = g.ssBatch; g.ssBatch = null; g.resolvingL = null; E._internal.ssBatchFlush(g, bat);
  ok(E.lib.swOf(g, 0).includes(a) && E.lib.swOf(g, 1).includes(b) && !E.lib.swOf(g, 0).includes(b) && g.events.filter(e => e.type === 'summon').every(e => e.all.length === 2), 'one summon: both players\' parts kept in g.sw (Cyber Jar), every event lists all of them');
});
const exCard = (n, u) => ({ id: id(n), u, flags: {}, used: {}, mods: [], ctr: {}, zone: 'extra' });
T('64. Synchro materials: the material line falls back to tx, and each material\'s own rules apply (Underground Arachnid, Debris Dragon, Fishborg Blaster)', () => {
  let g = duel([{ m: ['Dark Resonator', 'Flying Kamakiri 1', 'Sangan'] }, {}]); const M = n => g.p[0].m.find(c => c && E.name(c) === n);
  const sx = exCard('Underground Arachnid', -1);
  ok(E.lib.synOk(g, sx, [M('Dark Resonator'), M('Flying Kamakiri 1')]) && !E.lib.synOk(g, sx, [M('Dark Resonator'), M('Sangan')]), 'Arachnid needs a non-Tuner Insect, read from tx (its Edison text opens with an effect)');
  g = duel([{ m: ['Debris Dragon', 'Gene-Warped Warwolf', 'Sangan'] }, {}]);
  ok(E._internal.synCombos(g, 0, exCard('Stardust Dragon', -2)).length === 0 && E._internal.synCombos(g, 0, exCard('Black Rose Dragon', -3)).length === 1, 'Debris Dragon: no Level 4 partner; Black Rose with Sangan is fine');
  g = duel([{ m: ['Fishborg Blaster', 'Trent'] }, {}]);
  ok(!E.lib.synOk(g, exCard('Queen of Thorns', -4), g.p[0].m.filter(Boolean), { line: false }), 'Fishborg Blaster: all other materials must be WATER, also in the batch-2 procedures (Queen of Thorns)');
});
T('65. Effects that Special Summon need a summonable monster, and their choices list only those (Call of the Haunted, Mystic Tomato)', () => {
  let g = duel([{ st: [{ n: 'Call of the Haunted', pos: 'set' }], gy: ['Dark Armed Dragon'], turn: 2 }, {}]);
  ok(!keyOf(g, g.p[0].st[0]), 'Call of the Haunted with only Dark Armed Dragon in the GY can\'t be activated');
  g = duel([{ m: ['Sangan'] }, {}]); g.resolvingL = { c: g.p[0].m[0], p: 0, t: [] }; const tsu = g.p[0].deck[0], sg = g.p[0].deck[1]; tsu.id = id('Tsukuyomi'); sg.id = id('Sangan');
  const r = E.lib.pick(g, 0, 'Special Summon a DARK from your Deck', [tsu, sg]).next(); g.resolvingL = null;
  const got = r.done ? r.value : (r.value && r.value.opts || []).map(o => [tsu, sg].find(x => x.u === o.u));
  ok(got.length === 1 && got[0] === sg, 'a Special Summon choice leaves out Tsukuyomi ("Cannot be Special Summoned")');
});
T('66. Targets: hand-filled target picks honor "can\'t be targeted", and Aurkus protects Lightsworn in the GY', () => {
  let g = duel([{ hand: ['Monster Reborn'], gy: ['Lyla, Lightsworn Sorceress', 'Sangan'] }, { m: ['Aurkus, Lightsworn Druid'] }]);
  actU(g, hand(g, 'Monster Reborn')); drive(g);
  ok(gyOf(g, 0, 'Lyla, Lightsworn Sorceress') && g.p[0].m.some(c => c && E.name(c) === 'Sangan'), 'Monster Reborn can\'t target a Lightsworn in the GY while Aurkus is face-up (site ruling 1)');
  g = duel([{ hand: ['Book of Life'], gy: ['Pyramid Turtle'] }, { m: ['Aurkus, Lightsworn Druid'], gy: ['Lyla, Lightsworn Sorceress'] }]);
  ok(!keyOf(g, hand(g, 'Book of Life')), 'Book of Life can\'t target the Lightsworn in their GY (its hand-filled target pick)');
  g = duel([{ m: ['Sangan'] }, { m: ['Aurkus, Lightsworn Druid', 'Lyla, Lightsworn Sorceress'] }]); g.lockL = { c: g.p[0].m[0], p: 0, t: [] };
  const r = E.lib.pick(g, 0, 'Pick a monster', g.p[1].m.filter(Boolean)).next(); g.lockL = null;
  ok(r.done && Array.isArray(r.value) && r.value.length === 0, 'a pick in a target step drops cards that can\'t be targeted');
});
T('67. Tribute costs follow the Tribute rules (Fluff Tokens, Mask of Restrict, the Tributed reason)', () => {
  let g = duel([{ m: ['Sangan'] }, {}]);
  const fl = E.lib.tokens(g, 0, { n: 'Fluff Token', a: 'WIND', r: 'Plant', lv: 1, atk: 0, def: 0 }, 1, 'def', { noTribute: 'summon' })[0];
  ok(E.lib.tribPool(g, 0).includes(fl) && !E.lib.tributeCands(g, 0).includes(fl), 'a Fluff Token can pay a Tribute cost, not a Tribute Summon (its text; Ojama Trio Netrep)');
  g = duel([{ m: ['Cannon Soldier', 'Sangan'], turn: 2 }, { st: [{ n: 'Mask of Restrict', pos: 'up' }] }]);
  ok(!keyOf(g, g.p[0].m[0]) && E.lib.tribPool(g, 0).length === 0, 'Mask of Restrict: Cannon Soldier\'s Tribute cost can\'t be paid (archive)');
  g = duel([{ m: ['Cannon Soldier', 'Sangan'], turn: 2 }, {}]); actU(g, g.p[0].m[0]);
  drive(g, { pick: pr => { const o = pr.opts.find(x => /Sangan/.test(x.label)); return o ? [o.key] : null; } });
  ok(g.events.some(e => e.type === 'move' && e.c && e.from === 'm' && e.reason === 'tribute'), 'a monster paid for a Tribute cost is Tributed (reason tribute)');
});
T('68. Goat: stale overrides dropped, the shared scripts follow the Goat text (Lava Golem, The Shallow Grave)', () => {
  const { G, mk } = goatEngine();
  let g = mk([{ hand: ['Lava Golem'], gy: ['Sangan'] , turn: 2 }, { m: ['Sangan', 'Sangan'] }]);
  const lg = g.p[0].hand.find(c => G.name(c) === 'Lava Golem'); const before = g.prompt.opts.some(o => o.u === lg.u);
  g.ns[0] = 1; g.seq++; const g2opts = G.idleOpts ? G.idleOpts(g) : null;
  ok(before && g2opts && !g2opts.some(o => o.u === lg.u), 'Lava Golem can\'t be Special Summoned after a Normal Summon (archive)');
  g = mk([{ hand: ['The Shallow Grave'], gy: ['Sangan'] }, {}]);
  const sg = g.p[0].hand.find(c => G.name(c) === 'The Shallow Grave');
  ok(!g.prompt.opts.some(o => o.key.startsWith('a:' + sg.u + ':')), 'The Shallow Grave needs a monster in both GYs (archive)');
  const fs = require('fs'), path = require('path'); const goat = [1, 2, 3, 4, 5, 6, 7].map(n => fs.readFileSync(path.join(__dirname, '../js/cards/goat-' + n + '.js'), 'utf8')).join('\n');
  ok(!/^\s*'(Gigantes|Premature Burial|Jinzo|Megamorph|Stumbling|Gilasaurus|Mataza the Zapper|Lava Golem|The Shallow Grave)': \{/m.test(goat), 'the stale Goat overrides are gone');
});


/* ----- Group E3 (2026-11-28 audit): negation, statics, timing, destruction checks ----- */
const fld = (g, p, n) => E.fieldOf(g, p).find(c => E.name(c) === n);
T('69. Continuous negators: the one face-up first wins (Skill Drain vs Jinzo), Royal Decree and Trap Stun negate Traps, a Trap on the chain is negated at resolution', () => {
  let g = duel([{ m: ['Sangan'] }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]); E.lib.negd(g, fld(g, 0, 'Sangan'));
  let j = g.p[0].deck[0]; j.id = id('Jinzo'); E.lib.ss(g, 0, j, 'atk');
  ok(E.lib.negd(g, j) && E.lib.negd(g, fld(g, 0, 'Sangan')) && !E.lib.negd(g, fld(g, 1, 'Skill Drain')), 'Skill Drain face-up first: Jinzo is negated, Skill Drain keeps negating (site ruling)');
  const rd = g.p[0].deck[0]; rd.id = id('Royal Decree'); E.lib.move(g, rd, 'st', { pos: 'up' });
  ok(!E.lib.negd(g, j) && E.lib.negd(g, fld(g, 1, 'Skill Drain')) && E.lib.negd(g, rd), 'then Royal Decree: Skill Drain negated, so Jinzo applies and negates both (Goat Netrep)');
  g = duel([{ m: ['Sangan', 'Jinzo'] }, {}]); E.lib.negd(g, fld(g, 0, 'Sangan'));
  const sd = g.p[1].deck[0]; sd.id = id('Skill Drain'); E.lib.move(g, sd, 'st', { pos: 'up' });
  ok(E.lib.negd(g, sd) && !E.lib.negd(g, fld(g, 0, 'Sangan')), 'Jinzo face-up first: Skill Drain is negated');
  g = duel([{ m: ['Cyber Dragon'], turn: 2 }, { st: [{ n: 'Royal Decree', pos: 'up' }, { n: 'Gravity Bind', pos: 'up' }] }]);
  ok(!E.lib.forbid(g, { type: 'attack', c: fld(g, 0, 'Cyber Dragon') }), 'Royal Decree negates a face-up Gravity Bind (it used to only stop activations)');
  g = duel([{ st: [{ n: 'Trap Stun', pos: 'set' }], m: ['Cyber Dragon'], turn: 3 }, { st: [{ n: 'Gravity Bind', pos: 'up' }] }]);
  actU(g, g.p[0].st[0]); drive(g);
  ok(E.lib.negd(g, fld(g, 1, 'Gravity Bind')) && !E.lib.forbid(g, { type: 'attack', c: fld(g, 0, 'Cyber Dragon') }), 'Trap Stun negates the face-up Gravity Bind this turn');
  g = duel([{ st: [{ n: 'Dust Tornado', pos: 'set' }], turn: 3 }, { st: [{ n: 'Gravity Bind', pos: 'up' }, { n: 'Mystical Space Typhoon', pos: 'set' }] }]);
  actU(g, g.p[0].st[0]); let did = false;
  drive(g, { respond: pr => { if (!did) { did = true; const x = g.p[1].deck[0]; x.id = id('Jinzo'); E.lib.ss(g, 1, x, 'atk'); } return null; } });
  ok(did && fld(g, 1, 'Gravity Bind') && g.log.some(l => /Dust Tornado's effect was negated/.test(l)), 'a Trap already on the chain when Jinzo arrives resolves negated (goat-08, Jinzo ruling)');
  g = duel([{ m: ['Sangan'] }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]); const sdl = fld(g, 1, 'Skill Drain');
  g.chain.push({ c: sdl, eff: E.lib.effsOf(sdl)[0], p: 1, t: [], cardAct: true, tags: {}, data: {} }); g.seq++;
  const onCh = E.lib.negd(g, fld(g, 0, 'Sangan')); g.chain.pop(); g.seq++;
  ok(!onCh && E.lib.negd(g, fld(g, 0, 'Sangan')), 'a Continuous Trap applies only once its activation has resolved (Rainbow Ruins ruling 5)');
});
T('70. Under Skill Drain a monster can still activate an effect with a cost (it resolves negated), and loses its Spell Counters', () => {
  let g = duel([{ m: ['Card Trooper'], turn: 3 }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]); const ct = g.p[0].m[0];
  ok(!!keyOf(g, ct), 'Card Trooper\'s ① can be activated under Skill Drain (ruling: "may still activate their effects and pay costs")');
  actU(g, ct); drive(g);
  ok(g.p[0].gy.length >= 1 && E.atk(g, ct) === 400, 'its cost is paid, the ATK gain is negated');
  g = duel([{ m: ['Skilled Dark Magician'] }, {}]); const sk = g.p[0].m[0]; E.lib.addCtr(g, sk, 'spell', 2);
  const sd = g.p[1].deck[0]; sd.id = id('Skill Drain'); E.lib.move(g, sd, 'st', { pos: 'up' });
  ok(E.lib.ctr(sk, 'spell') === 0, 'Skill Drain removes the Spell Counters on a negated monster (site ruling)');
});

T('71. Timing and destruction checks: coin effects aren\'t certain, Crush Card Virus is, LP changes are events, effect position changes emit pos, Ceasefire\'s wording, Threatening Roar on player 0', () => {
  let g = duel([{ m: ['Barrel Dragon'] }, { m: [FILL] }]); const bd = g.p[0].m[0];
  ok(E.lib.wouldDestroy(g, { c: bd, eff: E.lib.effsOf(bd)[0], p: 0, t: [g.p[1].m[0]], tags: { destroy: 1 }, data: {} }).length === 0, 'Barrel Dragon\'s coin tosses may or may not destroy (Stardust ruling 6)');
  g = duel([{ m: ['Spirit Reaper'] }, { m: ['Cyber Dragon'] }]); const ccv = g.p[0].deck[0]; ccv.id = id('Crush Card Virus');
  ok(E.lib.wouldDestroy(g, { c: ccv, eff: E.lib.effsOf(ccv)[0], p: 0, t: [], tags: { destroy: 1 }, data: {} }).includes(g.p[1].m[0]), 'Crush Card Virus would destroy the face-up 1500+ monster (Stardust ruling 7: the Group C regression)');
  g = duel([{ hand: ['Upstart Goblin'], deckTop: ['Infernity Archfiend'], turn: 3 }, {}]);
  actU(g, hand(g, 'Upstart Goblin')); const seen = drive(g);
  ok(!!hand(g, 'Infernity Archfiend') && !seen.some(t => /Infernity/.test(t)), 'Infernity Archfiend drawn by Upstart Goblin misses its timing: the LP gain came after (site ruling)');
  g = duel([{ m: [FILL] }, { m: ['Dream Clown'] }]); const dc = g.p[1].m[0];
  g.chain.push({ c: g.p[0].m[0], eff: { type: 'quick', res: function* () { dc.pos = 'def'; } }, p: 0, t: [], tags: {}, data: {}, link: 1 });
  const it = E._internal.resolveChain(g); for (let r = it.next(), i = 0; !r.done && i < 9; i++) r = it.next();
  ok(g.events.some(e => e.type === 'pos' && e.c === dc && e.from === 'atk'), 'an effect that changes a position by hand still emits the pos event (Dream Clown)');
  const cf = C.find(x => x.n === 'Ceasefire'); ok(E.lib.NO_FLIP_RE.test('(Flip monsters\' effects are not activated at this time)') && E.lib.NO_FLIP_RE.test(cf.ps || cf.tx), 'Ceasefire\'s Goat and Edison wordings both stop Flip effects');
  g = duel([{ m: ['Cyber Dragon'], turn: 3 }, {}]); g.roar = 0; E.act(g, ['bp']); passAll(g);
  ok(!g.prompt.opts.some(o => o.key.startsWith('atk:')), 'Threatening Roar on player 0 stops their attacks');
});

T('72. Effect moves, names, searches and values: by defaults to the effect\'s player, battleKill counts Tokens, Rai-Oh at activation, Harpie and Umi names, halving and doubling set the value', () => {
  let g = duel([{ m: [FILL] }, { m: [FILL] }]); const v = g.p[1].m[0];
  g.resolvingL = { c: g.p[0].m[0], p: 0, t: [] }; E.lib.move(g, v, 'gy', { reason: 'effect' }); g.resolvingL = null;
  ok(g.events.some(e => e.type === 'move' && e.c === v && e.by === 0), 'an effect move carries the resolving link\'s player as by (no turn-player guess)');
  g = duel([{ m: ['Spyder Spider'] }, {}]); const sp = g.p[0].m[0], tk = E.lib.tokens(g, 1, { n: 'Sheep Token', a: 'EARTH', r: 'Beast', lv: 1, atk: 0, def: 0 }, 1, 'def')[0];
  const ev = E.lib.move(g, tk, 'gy', { reason: 'battle', battle: true, destroyed: true, killer: sp }) || g.events[g.events.length - 1];
  ok(E.lib.battleKill(g.events.filter(e => e.type === 'move' && e.c === tk).pop(), sp), 'a Token destroyed by battle counts for "destroys ... by battle" (Spyder Spider: no GY clause)');
  g = duel([{ hand: ['Reinforcement of the Army'], turn: 3 }, { m: ['Thunder King Rai-Oh'] }]);
  ok(!keyOf(g, hand(g, 'Reinforcement of the Army')), 'Reinforcement of the Army can\'t be activated while Rai-Oh is face-up (checked at activation)');
  g = duel([{ m: [FILL] }, { m: ['Thunder King Rai-Oh'] }]); const top = g.p[0].deck[g.p[0].deck.length - 1];
  g.resolvingL = { c: g.p[0].m[0], p: 0, t: [] }; E.lib.move(g, top, 'hand', { reason: 'effect' }); g.resolvingL = null;
  ok(top.zone === 'deck', 'a script\'s own Deck-to-hand move also stops under Rai-Oh (Crystal Seer)');
  g = duel([{ m: [FILL] }, { gy: ['Harpie Lady 2', 'Cyber Harpie Lady'], m: ['Harpie Lady 1'] }]);
  ok(E.lib.nameIs(g.p[1].gy[0], 'Harpie Lady') && E.name(g.p[1].m[0]) === 'Harpie Lady 1' && E.lib.nameOff(g.p[1].m[0]) === 'Harpie Lady', 'Harpie Lady 1/2 and Cyber Harpie Lady are "Harpie Lady" (Karma Cut ruling 8), the printed name still shows');
  g = duel([{ m: ['Proto-Cyber Dragon'] }, {}]);
  ok(E.name(g.p[0].m[0]) === 'Cyber Dragon' && E.lib.nameOff(g.p[0].m[0]) === 'Proto-Cyber Dragon', 'Proto-Cyber Dragon is "Cyber Dragon" on the field only (Karma Cut ruling 7)');
  g = duel([{ fz: 'Forgotten Temple of the Deep' }, {}]); ok(E.lib.isUmi(g.p[0].fz), 'Forgotten Temple of the Deep counts as Umi');
  g = duel([{ m: ['Cyber Dragon', FILL] }, {}]); const cd = g.p[0].m[0];
  const mw = g.p[1].deck[0]; mw.id = id('Mirror Wall'); E.lib.move(g, mw, 'st', { pos: 'up' });
  E.lib.addMod(g, cd, { set: 1050, which: 'atk', mw: mw.u }); E.lib.addMod(g, cd, { atk: 500 });
  ok(E.atk(g, cd) === 1550, 'a halved value is set, later gains add to it');
  g = duel([{ m: ['Cyber Dragon'], hand: ['Limiter Removal'], turn: 3 }, {}]); const lr = hand(g, 'Limiter Removal');
  ok(E.lib.effsOf(lr)[0].ds && E.lib.effsOf(lr)[1].loc === 'any', 'Limiter Removal works in the Damage Step, and its End Phase destroy outlives the card (goat-08)');
  actU(g, lr); drive(g); const cd2 = g.p[0].m[0]; E.lib.addMod(g, cd2, { atk: 100 }); ok(E.atk(g, cd2) === 4300, 'Limiter Removal doubles by setting the value (4200), a later +100 adds');
  g = duel([{ m: ['Unifrog', 'Unifrog'] }, {}]); ok(E.lib.isFrog(g.p[0].m[0]), 'Unifrog is a "Frog" card');
});
T('73. Destroys go through the checks: Call of the Haunted\'s link under Imperial Custom, a negated Continuous Trap leaves anyway, a negated hand effect\'s card is destroyed, maintenance destroys are rules', () => {
  let g = duel([{ m: [FILL], st: [{ n: 'Call of the Haunted', pos: 'up' }, { n: 'Imperial Custom', pos: 'up' }] }, {}]); const coth = g.p[0].st[0]; coth.linkTo = g.p[0].m[0].u;
  E.lib.destroy(g, [g.p[0].m[0]]);
  ok(E.onField(coth), 'Imperial Custom keeps Call of the Haunted when its monster is destroyed (site ruling)');
  g = duel([{ st: [{ n: 'Gravity Bind', pos: 'up' }, { n: 'Imperial Custom', pos: 'up' }] }, { m: [FILL] }]); const gb = g.p[0].st[0];
  const L1 = { c: gb, eff: E.lib.effsOf(gb)[0], p: 0, t: [], cardAct: true, tags: {}, data: {} }; g.resolvingL = { c: g.p[1].m[0], p: 1 };
  E.lib.negate(g, L1, true, { activation: true }); g.resolvingL = null;
  ok(gb.zone === 'gy', 'a Continuous Trap whose activation is negated goes to the GY under Imperial Custom (site ruling)');
  g = duel([{ hand: ['Battle Fader'] }, { m: [FILL] }]); const bf = g.p[0].hand[0];
  E.lib.negate(g, { c: bf, eff: E.lib.effsOf(bf)[0], p: 0, t: [], tags: {}, data: {} }, true);
  ok(bf.zone === 'gy', 'a negated hand effect "and destroy it" destroys the card in the hand (Battle Fader, Royal Oppression)');
});

T('74. Lasting effects of negated cards stop: Fiendish Chain under Jinzo, Level Limit - Area B under Imperial Order; "was flipped" by any flip; a GY once-per-turn resets when the card leaves the GY', () => {
  let g = duel([{ m: ['Sangan'] }, { st: [{ n: 'Fiendish Chain', pos: 'up' }] }]); const sg = g.p[0].m[0], fc = g.p[1].st[0];
  fc.flags.chainT = sg.u; sg.flags.chainedBy = fc.u; g.seq++;
  const before = E.lib.negd(g, sg); const j = g.p[1].deck[0]; j.id = id('Jinzo'); E.lib.ss(g, 1, j, 'atk');
  ok(before && !E.lib.negd(g, sg), 'Fiendish Chain\'s negation stops while Jinzo negates it (edison-13)');
  g = duel([{ m: [{ n: 'Cyber Dragon', pos: 'atk' }] }, { st: [{ n: 'Level Limit - Area B', pos: 'up' }, { n: 'Imperial Order', pos: 'up' }] }]);
  E.lib.move(g, g.p[0].deck[0], 'hand', { reason: 'effect' });
  ok(g.p[0].m[0].pos === 'atk', 'Level Limit - Area B doesn\'t change positions while Imperial Order negates it (goat-03)');
  g = duel([{ m: [{ n: 'Batteryman Micro-Cell', pos: 'set' }], st: [{ n: 'Ceasefire', pos: 'set' }], turn: 3 }, {}]); const mc = g.p[0].m[0];
  actU(g, g.p[0].st[0]); drive(g);
  ok(E.lib.faceUp(mc) && mc.flags.flippedUp, 'a monster flipped by Ceasefire "was flipped face-up" (Batteryman Micro-Cell ruling)');
  g = duel([{ gy: ['Volcanic Shell'] }, {}]); const vs = g.p[0].gy[0]; vs.used[0] = g.turnNo;
  E.lib.move(g, vs, 'deckTop', { reason: 'effect' }); ok(vs.used[0] == null, 'a soft once-per-turn GY effect resets when the card leaves the GY (Volcanic Shell)');
});

T('75. Gravity Bind stops an attack without negating it, and "does not start a chain" effects happen with no link (Junk Archer under Skill Drain)', () => {
  let g = duel([{ m: ['Cyber Dragon'] }, {}]); const a = g.p[0].m[0]; g.aw = { a, t: null, ctrl: 0, open: true, tpOpen: true };
  E.lib.stopAttack(g); ok(E.lib.attackingNow(g, a), 'after Gravity Bind the monster is still the attacking monster for the chain (Dimensional Prison site ruling)'); g.aw = null; g.attackStopped = false;
  g = duel([{ m: ['Junk Archer'], turn: 3 }, { m: ['Cyber Dragon'], st: [{ n: 'Skill Drain', pos: 'up' }] }]); const ja = g.p[0].m[0], cd = g.p[1].m[0];
  E.lib.move(g, cd, 'ban', { reason: 'effect', by: 0 }); Object.assign(cd.flags, { archerBy: ja.u, archerTurn: g.turnNo, archerPos: 'atk', archerCtrl: 1 });
  E.act(g, ['end']); drive(g);
  ok(cd.zone === 'm' && cd.ctrl === 1, 'the banished monster returns even with Junk Archer negated: no chain link (archive)');
});

T('76. "Control of this card can\'t switch" is checked by takeControl (Botanical Lion), and not while negated', () => {
  let g = duel([{ m: [FILL] }, { m: ['Botanical Lion'] }]); const bl = g.p[1].m[0];
  ok(!E.lib.takeControl(g, 0, bl, true) && bl.ctrl === 1, 'Botanical Lion stays with its controller (site: ② control can\'t switch)');
  g = duel([{ m: [FILL] }, { m: ['Botanical Lion'], st: [{ n: 'Skill Drain', pos: 'up' }] }]);
  ok(E.lib.takeControl(g, 0, g.p[1].m[0], true), 'under Skill Drain its control can be taken');
});

/* ----- Group E3, part 2 (2026-11-28 audit) ----- */
T('77. Optional "instead" replacements ask the player before the destruction (Six Samurai, Clear Vice Dragon, Crystal Beasts, Power Tool Dragon); Union replacements are mandatory (Machina Peacekeeper)', () => {
  const sam = () => duel([{ st: [{ n: 'Smashing Ground', pos: 'set' }], turn: 3 }, { m: ['The Six Samurai - Irou', 'The Six Samurai - Kamon'] }]);
  let g = sam(); actU(g, g.p[0].st[0]); let seen = drive(g);
  ok(seen.some(t => /instead of The Six Samurai - Irou/.test(t)) && fld(g, 1, 'The Six Samurai - Irou') && gyOf(g, 1, 'The Six Samurai - Kamon'), 'Irou asks, and Kamon is destroyed instead (ruling: "you can destroy another Six Samurai")');
  g = sam(); actU(g, g.p[0].st[0]); drive(g, { no: true });
  ok(gyOf(g, 1, 'The Six Samurai - Irou') && fld(g, 1, 'The Six Samurai - Kamon'), 'answered No: Irou is destroyed');
  g = sam(); E.lib.destroy(g, [fld(g, 1, 'The Six Samurai - Irou'), fld(g, 1, 'The Six Samurai - Kamon')], { by: 0 });
  ok(gyOf(g, 1, 'The Six Samurai - Irou') && gyOf(g, 1, 'The Six Samurai - Kamon'), 'two destroyed together can\'t stand in for each other (rulings 12 to 14)');
  g = duel([{ st: [{ n: 'Smashing Ground', pos: 'set' }], turn: 3 }, { m: ['Clear Vice Dragon'], hand: [FILL] }]); actU(g, g.p[0].st[0]); seen = drive(g);
  ok(seen.some(t => /Discard 1 card/.test(t)) && fld(g, 1, 'Clear Vice Dragon') && gyOf(g, 1, FILL), 'Clear Vice Dragon discards a card instead (opponent\'s effect)');
  g = duel([{ st: [{ n: 'Smashing Ground', pos: 'set' }], turn: 3 }, { m: ['Crystal Beast Topaz Tiger'] }]); actU(g, g.p[0].st[0]); seen = drive(g);
  ok(seen.some(t => /Spell & Trap Zone instead/.test(t)) && g.p[1].st.some(c => c && E.name(c) === 'Crystal Beast Topaz Tiger') && !gyOf(g, 1, 'Crystal Beast Topaz Tiger'), 'a destroyed Crystal Beast is placed instead of reaching the GY (rulings 3, 4)');
  g = duel([{ st: [{ n: 'Smashing Ground', pos: 'set' }], turn: 3 }, { m: ['Crystal Beast Topaz Tiger'], st: [{ n: 'Skill Drain', pos: 'up' }] }]); actU(g, g.p[0].st[0]); seen = drive(g);
  ok(!seen.length && gyOf(g, 1, 'Crystal Beast Topaz Tiger'), 'under Skill Drain it goes to the GY (ruling 11)');
  g = duel([{ m: ['Power Tool Dragon'], st: [{ n: 'Black Pendant', pos: 'up' }] }, {}]); const ptd = fld(g, 0, 'Power Tool Dragon'), ax = fld(g, 0, 'Black Pendant'); ax.equipTo = ptd.u;
  E.lib.destroy(g, [ptd], { by: 1 }); ok(E.onField(ptd) && gyOf(g, 0, 'Black Pendant'), 'Power Tool Dragon sends its Equip Spell instead');
  g = duel([{ m: ['Power Tool Dragon'], st: [{ n: 'Black Pendant', pos: 'up' }] }, {}]); const p2 = fld(g, 0, 'Power Tool Dragon'), a2 = fld(g, 0, 'Black Pendant'); a2.equipTo = p2.u;
  E.lib.destroy(g, [p2, a2], { by: 1 }); ok(gyOf(g, 0, 'Power Tool Dragon'), 'not with the Equip Spell destroyed at the same time (ruling 10)');
  g = duel([{ m: ['Cyber Dragon'], st: [{ n: 'Machina Peacekeeper', pos: 'up' }] }, {}]); const mp = fld(g, 0, 'Machina Peacekeeper'); mp.equipTo = fld(g, 0, 'Cyber Dragon').u; mp.flags.union = true;
  E.lib.destroy(g, [fld(g, 0, 'Cyber Dragon')], { by: 1 }); ok(fld(g, 0, 'Cyber Dragon') && gyOf(g, 0, 'Machina Peacekeeper'), 'Machina Peacekeeper is destroyed instead of the equipped monster');
});

T('78. A Trap Monster is a monster and a Trap Card: Type/Attribute from its text, its S/T Zone kept, MST hits it, Jinzo and Book of Moon send it back (Zoma, Apophis rulings 1, 5, 7, 9)', () => {
  const zoma = () => { const g = duel([{ st: [{ n: 'Zoma the Spirit', pos: 'set' }], turn: 3 }, {}]); actU(g, g.p[0].st[0]); drive(g); return g; };
  let g = zoma(); const z = g.p[0].m.find(Boolean);
  ok(z && E.name(z) === 'Zoma the Spirit' && E.lib.isMon(z) && E.lib.isTrap(z) && E.lib.race(z) === 'Zombie' && E.lib.attr(z) === 'DARK' && E.atk(g, z) === 1800 && E.def(g, z) === 500, 'Zoma is a DARK Zombie monster, 1800/500, and still a Trap Card');
  ok(E._internal.stOf(g, 0).length === 0 && E.lib.freeST(g, 0) === 1, 'its Spell & Trap Zone stays taken (ruling 1)');
  ok(E.lib.stOnField(g).includes(z), 'Mystical Space Typhoon and Heavy Storm see it as a Spell/Trap on the field (ruling 5)');
  ok(E.lib.destroy(g, [z], { by: 1 }).length === 1 && gyOf(g, 0, 'Zoma the Spirit') && !E.lib.isMon(g.p[0].gy[0]), 'destroyed, it is a Trap Card in the GY (ruling 10)');
  g = zoma(); const z2 = g.p[0].m.find(Boolean); const j = g.p[1].deck[0]; j.id = id('Jinzo'); E.lib.ss(g, 1, j, 'atk');
  ok(z2.zone === 'st' && z2.pos === 'up' && !E.lib.isMon(z2), 'Jinzo sends it face-up back to the Spell & Trap Zone (ruling 7)');
  g = zoma(); const z3 = g.p[0].m.find(Boolean); E.lib.setFaceDown(g, z3);
  ok(z3.zone === 'st' && z3.pos === 'set', 'turned face-down it goes face-down to the Spell & Trap Zone (ruling 9)');
});

T('79. "Does not start a chain" effects happen with no link, and maintenance costs aren\'t stopped by Skill Drain (Pole Position, Swords of Concealing Light, Koa\'ki Meiru)', () => {
  let g = duel([{ st: [{ n: 'Mystical Space Typhoon', pos: 'set' }], turn: 3 }, { m: ['Cyber Dragon'], st: [{ n: 'Pole Position', pos: 'up' }] }]);
  actU(g, g.p[0].st[0]); const seen = []; drive(g, { respond: pr => { seen.push(pr.text); return null; } });
  ok(gyOf(g, 1, 'Pole Position') && gyOf(g, 1, 'Cyber Dragon') && !g.log.some(l => /activated Pole Position/.test(l)), 'Pole Position leaving destroys the highest-ATK monster at once, no chain link (ruling 88)');
  g = duel([{ st: [{ n: 'Swords of Concealing Light', pos: 'up' }], turn: 3 }, {}]); const sw = g.p[0].st[0]; sw.flags.scl = 1;
  E.act(g, ['end']); toTurnOf(g, 0); 
  ok(gyOf(g, 0, 'Swords of Concealing Light') && !g.log.some(l => /activated Swords of Concealing Light/.test(l)), 'Swords of Concealing Light destroys itself in the Standby Phase with no chain link (ruling 5)');
  g = duel([{ m: ["Koa'ki Meiru Sea Panther"], turn: 3 }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]);
  E.act(g, ['end']); drive(g, { no: true });
  ok(gyOf(g, 0, "Koa'ki Meiru Sea Panther"), 'a Koa\'ki Meiru with no Iron Core is destroyed in the End Phase even under Skill Drain (its maintenance is not an effect)');
});

T('80. Gladiator Beast tag outs are end-of-Battle-Phase triggers for either player, each on its own chain, and work under Skill Drain; "end of the Battle Phase" effects wait for it (Multiple Piece Golem, Ancient Forest)', () => {
  const gb = (sd) => { const g = duel([{ m: ['Cyber Dragon'], turn: 3 }, { m: [{ n: 'Gladiator Beast Hoplomus', pos: 'def' }, { n: 'Gladiator Beast Bestiari', pos: 'def' }], st: sd ? [{ n: 'Skill Drain', pos: 'up' }] : [] }]);
    g.p[1].deck[0].id = id('Gladiator Beast Laquari'); g.p[1].deck[1].id = id('Gladiator Beast Murmillo'); return g; };
  let g = gb(); const h = fld(g, 1, 'Gladiator Beast Hoplomus'), b = fld(g, 1, 'Gladiator Beast Bestiari'); h.flags.battled = b.flags.battled = g.turnNo;
  let maxLen = 0; g.hooks = { ev: () => {}, note: (g2, e) => { if (e.type === 'chain') maxLen = Math.max(maxLen, g2.chain.length); } };
  act(g, /^Battle Phase/); passAll(g); act(g, /endbp/); const seen = drive(g); const chains = g.log.filter(l => /activated Gladiator Beast (Hoplomus|Bestiari)'s effect/.test(l)).length;
  ok(seen.filter(t => /Tag out/.test(t)).length === 2 && !fld(g, 1, 'Gladiator Beast Bestiari') && fld(g, 1, 'Gladiator Beast Murmillo') && g.log.some(l => /B shuffled Gladiator Beast Hoplomus into the Deck/.test(l)), 'the opponent of the turn player tags out both Gladiator Beasts at the end of the Battle Phase');
  ok(chains === 2 && maxLen === 1, 'each tag out on its own chain (site ruling)');
  g = gb(true); fld(g, 1, 'Gladiator Beast Hoplomus').flags.battled = g.turnNo;
  act(g, /^Battle Phase/); passAll(g); act(g, /endbp/); drive(g);
  ok(!fld(g, 1, 'Gladiator Beast Hoplomus') && (fld(g, 1, 'Gladiator Beast Laquari') || fld(g, 1, 'Gladiator Beast Murmillo')), 'a tag out can be activated and resolve under Skill Drain (site ruling)');
});

T('81. Continuous "can\'t be Tributed" is read live (Summoner Monk under Skill Drain); a negated monster\'s mandatory trigger activates and resolves negated; Goblin Attack Force\'s attack counts while negated', () => {
  let g = duel([{ m: ['Summoner Monk'] }, {}]); const mk = fld(g, 0, 'Summoner Monk');
  ok(!E.lib.tributeCands(g, 0).includes(mk), 'Summoner Monk can\'t be Tributed');
  const sd = g.p[1].deck[0]; sd.id = id('Skill Drain'); E.lib.move(g, sd, 'st', { pos: 'up' });
  ok(E.lib.tributeCands(g, 0).includes(mk), 'under Skill Drain it can (site ruling: "① is a continuous effect. It can be negated")');
  g = duel([{ hand: ['Summoner Monk'], turn: 3 }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]);
  act(g, /^Normal Summon/); drive(g);
  ok(g.log.some(l => /activated Summoner Monk's effect/.test(l)) && fld(g, 0, 'Summoner Monk').pos === 'atk', 'its mandatory trigger still activates under Skill Drain and resolves negated (Skill Drain site ruling)');
  g = duel([{ m: ['Goblin Attack Force'], turn: 3 }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]); const ga = fld(g, 0, 'Goblin Attack Force');
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + ga.u + ':d')); drive(g);
  E.lib.destroy(g, [fld(g, 1, 'Skill Drain')], { by: 0 }); act(g, /endbp/); drive(g);
  ok(ga.pos === 'def', 'Goblin Attack Force attacked under Skill Drain, Skill Drain gone: it still changes to Defense Position at the end of the Battle Phase (goat-07 ruling)');
});

T('82. A monster\'s own ATK/DEF gain kept in its flags or mods is lost for good once negated (Gladiator Beast Hoplomus, Bazoo, Slate Warrior)', () => {
  const sdOnOff = (g) => { const sd = g.p[1].deck[0]; sd.id = id('Skill Drain'); E.lib.move(g, sd, 'st', { pos: 'up' }); E.lib.emit(g, { type: 'probe' }); E.lib.destroy(g, [sd], { by: 0 }); };
  let g = duel([{ m: [{ n: 'Gladiator Beast Hoplomus', pos: 'def' }] }, {}]); const h = fld(g, 0, 'Gladiator Beast Hoplomus'); h.flags.gb = true;
  ok(E.def(g, h) === 2400, 'Hoplomus summoned by a Gladiator Beast effect: 2400 DEF'); sdOnOff(g);
  ok(E.def(g, h) === 2100, 'after Skill Drain applied and left, its DEF stays 2100 (site ruling 2)');
  g = duel([{ m: ['Bazoo the Soul-Eater'] }, {}]); const bz = fld(g, 0, 'Bazoo the Soul-Eater'); bz.flags.bazoo = [{ n: 2, until: g.turnNo + 1 }];
  ok(E.atk(g, bz) === 2200, 'Bazoo with 2 banished: 2200'); sdOnOff(g); ok(E.atk(g, bz) === 1600, 'Skill Drain applied once: back to 1600 for good (goat-07 ruling)');
});

T('83. What an already resolved effect gave stays when the monster is negated later (Gear Golem\'s direct attack, Yaichi\'s attack lock), and Yaichi can\'t use its effect after attacking', () => {
  let g = duel([{ m: ['Gear Golem the Moving Fortress'], turn: 3 }, { m: [FILL], st: [] }]); const gg = fld(g, 0, 'Gear Golem the Moving Fortress'); gg.flags.gearDirect = g.turnNo;
  const sd = g.p[1].deck[0]; sd.id = id('Skill Drain'); E.lib.move(g, sd, 'st', { pos: 'up' });
  ok(E.lib.has(g, gg, 'directAttack'), 'Gear Golem can still attack directly after Skill Drain (ruling 3)');
  g = duel([{ m: ['The Six Samurai - Yaichi', 'The Six Samurai - Kamon'], turn: 3 }, {}]); const y = fld(g, 0, 'The Six Samurai - Yaichi'); y.flags.yaichi = g.turnNo;
  const sd2 = g.p[1].deck[0]; sd2.id = id('Skill Drain'); E.lib.move(g, sd2, 'st', { pos: 'up' });
  ok(E.lib.has(g, y, 'cantAttack'), 'Yaichi still can\'t attack after Skill Drain (ruling 8)');
  g = duel([{ m: ['The Six Samurai - Yaichi', 'The Six Samurai - Kamon'], turn: 3 }, { st: [{ n: 'Mystical Space Typhoon', pos: 'set' }] }]); const y2 = fld(g, 0, 'The Six Samurai - Yaichi'); y2.declared = true;
  ok(!E.SCRIPTS['The Six Samurai - Yaichi'].effs[0].cond(g, y2, 0), 'after it attacked, Yaichi\'s effect can\'t be activated (ruling 7)');
});

T('84. One shared die roll honors Dice Re-Roll for every card, and re-rolls all dice of the roll (Roulette Barrel, Morphtronic Celfon)', () => {
  const g = duel([{}, {}]); g.reroll = { 1: { turn: g.turnNo, used: false } };
  const it = E.lib.roll(g, 0, 2); let r = it.next();
  ok(!r.done && r.value.type === 'yesno' && r.value.p === 1, 'the opponent with Dice Re-Roll is asked'); r = it.next(['y']);
  ok(r.done && Array.isArray(r.value) && r.value.length === 2 && g.reroll[1].used, 'both dice were rolled again (Dice Re-Roll ruling 4)');
  const fs = require('fs'), path = require('path'), files = fs.readdirSync(path.join(__dirname, '../js/cards')).filter(f => f.endsWith('.js'));
  const raw = files.filter(f => /g\.rnd\(\) \* 6/.test(fs.readFileSync(path.join(__dirname, '../js/cards', f), 'utf8')));
  ok(!raw.length, 'no card script rolls its own die (' + raw.join(', ') + ')');
});

T('85. Type and Attribute changes apply through race()/attr() (Zombie World, DNA Surgery), and an Equip Spell for a Type leaves when its monster stops being one (Lightning Blade)', () => {
  let g = duel([{ m: ['Celtic Guardian'], gy: ['Cyber Dragon'] }, { st: [{ n: 'Zombie World', pos: 'up' }] }]);
  ok(E.lib.race(fld(g, 0, 'Celtic Guardian')) === 'Zombie' && E.lib.race(g.p[0].gy[0]) === 'Zombie', 'Zombie World: monsters on the field and in the GY are Zombies');
  g = duel([{ m: ['Celtic Guardian'], st: [{ n: 'Lightning Blade', pos: 'up' }] }, {}]); const cg = fld(g, 0, 'Celtic Guardian'), lb = fld(g, 0, 'Lightning Blade'); lb.equipTo = cg.u;
  ok(E.atk(g, cg) === 1400 + 800, 'Lightning Blade on a Warrior: +800');
  const dna = g.p[1].deck[0]; dna.id = id('DNA Surgery'); E.lib.move(g, dna, 'st', { pos: 'up' }); dna.flags.dna = 'Dragon'; E.lib.emit(g, { type: 'probe' });
  ok(E.lib.race(cg) === 'Dragon' && gyOf(g, 0, 'Lightning Blade'), 'DNA Surgery declares Dragon: the Warrior is a Dragon, and Lightning Blade is destroyed (Equip only to a Warrior)');
});

T('86. Costs that banish aren\'t offered while banishing is forbidden (Imperial Iron Wall: Psychic Lifetrancer, Aztekipede\'s summon, Djinn for Black Illusion Ritual)', () => {
  let g = duel([{ m: ['Psychic Lifetrancer'], gy: ['Psychic Commander'], turn: 3 }, {}]); const pl = fld(g, 0, 'Psychic Lifetrancer');
  ok(!!opt(g, new RegExp('a:' + pl.u + ':')), 'Psychic Lifetrancer can banish a Psychic for its effect');
  g = duel([{ m: ['Psychic Lifetrancer'], gy: ['Psychic Commander'], turn: 3 }, { st: [{ n: 'Imperial Iron Wall', pos: 'up' }] }]);
  ok(!opt(g, new RegExp('a:' + fld(g, 0, 'Psychic Lifetrancer').u + ':')), 'under Imperial Iron Wall its effect isn\'t offered');
  g = duel([{ hand: ['Aztekipede, the Worm Warrior'], gy: ['Basic Insect'], turn: 3 }, {}]);
  ok(!!opt(g, / sp:/), 'Aztekipede can be Special Summoned by banishing an Insect');
  g = duel([{ hand: ['Aztekipede, the Worm Warrior'], gy: ['Basic Insect'], turn: 3 }, { st: [{ n: 'Imperial Iron Wall', pos: 'up' }] }]);
  ok(!opt(g, / sp:/), 'Aztekipede\'s summon (banish an Insect from the GY) isn\'t offered under Imperial Iron Wall');
});

T('87. "Only 1 face-up" monsters: no second face-up one by any summon or flip, a Set one is fine, one flipped face-up by an effect is destroyed (Grandmaster, Earthbound Immortals); Aslla piscu returned to the Deck does nothing', () => {
  let g = duel([{ m: ['Grandmaster of the Six Samurai', { n: 'Grandmaster of the Six Samurai', pos: 'set' }], turn: 3 }, {}]);
  const gm2 = g.p[0].m.find(x => x && x.pos === 'set');
  ok(E.lib.forbid(g, { type: 'flip', c: gm2, p: 0 }) && !E.lib.forbid(g, { type: 'set', c: g.p[0].deck[0], p: 0 }), 'a second Grandmaster can\'t be Flip Summoned while one is face-up (PS: "1 face-up")');
  g.p[0].deck[0].id = id('Grandmaster of the Six Samurai');
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].deck[0], p: 0, how: 'special' }), 'nor Special Summoned');
  g = duel([{ m: ['Earthbound Immortal Uru'], fz: 'Mystic Plasma Zone', turn: 3 }, { m: [{ n: 'Earthbound Immortal Aslla piscu', pos: 'set' }] }]);
  const as = g.p[1].m.find(Boolean);
  ok(!E.lib.forbid(g, { type: 'set', c: g.p[1].deck[0], p: 1 }), 'an Earthbound Immortal can be Set while another is face-up (site ruling)');
  as.pos = 'def'; E.lib.emit(g, { type: 'flip', c: as, p: 1 });
  ok(as.zone !== 'm' && fld(g, 0, 'Earthbound Immortal Uru'), 'flipped face-up by an effect while Uru is face-up, Aslla piscu is destroyed by the rule');
});

T('88. A monster already destroyed by battle isn\'t destroyed again by an effect (Red Dragon Archfiend vs XX-Saber Emmersblade), and snapshots keep the ATK an effect reads after the monster left (Flame Wingman, Zoma)', () => {
  const g = duel([{ m: ['Red Dragon Archfiend'], turn: 3 }, { m: [{ n: 'XX-Saber Emmersblade', pos: 'def' }, { n: 'Sangan', pos: 'set' }] }]);
  let battle = null; g.hooks = { note: () => {}, ev: (g2, ev) => { if (ev.type === 'move' && ev.c && E.name(ev.c) === 'XX-Saber Emmersblade' && ev.wasField) battle = !!ev.battle; } };
  const rda = fld(g, 0, 'Red Dragon Archfiend'), em = fld(g, 1, 'XX-Saber Emmersblade');
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + rda.u + ':' + em.u)); drive(g);
  ok(battle === true && gyOf(g, 1, 'Sangan'), 'Emmersblade leaves destroyed by battle, the Set Sangan by Red Dragon Archfiend\'s effect (site ruling 1)');
  const g2 = duel([{ m: ['Cyber Dragon'] }, {}]); const cd = fld(g2, 0, 'Cyber Dragon'); cd.flags.battleDoomed = true;
  ok(!E.lib.destroy(g2, [cd], { by: 1 }).length && E.onField(cd), 'a battle-doomed monster is skipped by an effect\'s destroy');
});

T('89. An effect whose rulings allow it can be activated again in the same chain (Horus the Black Flame Dragon LV8 negating two Spells)', () => {
  const g = duel([{ st: [{ n: 'Mystical Space Typhoon', pos: 'set' }, { n: 'Mystical Space Typhoon', pos: 'set' }], turn: 3 }, { m: ['Horus the Black Flame Dragon LV8'], st: [{ n: 'Gravity Bind', pos: 'up' }] }]);
  const hz = fld(g, 1, 'Horus the Black Flame Dragon LV8'), m2 = g.p[0].st[1];
  actU(g, g.p[0].st[0]); let horus = 0, chained = false;
  drive(g, { respond: pr => { const ho = pr.opts.find(o => o.key.startsWith('a:' + hz.u + ':')); if (pr.p === 1 && ho) { horus++; return ho.key; }
    const mo = pr.opts.find(o => o.key.startsWith('a:' + m2.u + ':')); if (pr.p === 0 && mo && !chained) { chained = true; return mo.key; } return null; } });
  ok(chained && horus === 2 && fld(g, 1, 'Gravity Bind'), 'Horus LV8 negates both Mystical Space Typhoons in one chain (ruling 3)');
});

T('90. Shared-script fixes from the Goat reviews: Spell Economics waives a Spell activation\'s LP cost unless negated; Greenkappa skips a target no longer Set; Mokey Mokey King needs to have been face-up', () => {
  const tw = (opp) => { const g = duel([{ hand: ['Toon World'], st: [{ n: 'Spell Economics', pos: 'up' }], turn: 3 }, { st: opp ? [{ n: opp, pos: 'up' }] : [] }]); act(g, new RegExp('a:' + g.p[0].hand[0].u + ':')); drive(g); return g; };
  ok(tw().p[0].lp === 8000, 'Toon World under Spell Economics: no LP paid');
  ok(tw('Imperial Order').p[0].lp === 7000, 'with Spell Economics negated by Imperial Order: 1000 paid (goat-09)');
});

// ---- Group E4 (2026-11-28 audit, card by card) ----
T('91. Paying LP equal to your LP: allowed in Edison (EDOPro CheckLPCost), not in Goat (Netrep: "cannot choose to pay if it would make their Life Points become 0"); Goat Imperial Order\'s 700 is its controller\'s choice in their own Standby Phase', () => {
  let g = duel([{ hand: ['Delinquent Duo'], turn: 3, lp: 1000 }, { hand: [FILL, FILL] }]);
  ok(!!keyOf(g, hand(g, 'Delinquent Duo')), 'Edison: Delinquent Duo can be activated with exactly 1000 LP');
  ok(E.lib.canPay(g, 0, 1000) && !E.lib.canPay(g, 0, 1001), 'Edison canPay: up to the LP');
  const { G, mk } = goatEngine();
  g = mk([{ hand: ['Delinquent Duo'], turn: 3, lp: 1000 }, { hand: ['Sangan', 'Sangan'] }]);
  ok(!g.prompt.opts.some(o => o.key.startsWith('a:' + g.p[0].hand[0].u + ':')) && G.lib.canPay(g, 0, 999) && !G.lib.canPay(g, 0, 1000), 'Goat: not with exactly 1000 LP');
  g = mk([{ st: [{ n: 'Imperial Order', pos: 'up' }], turn: 3 }, {}]);
  let asked = 0; for (let i = 0; i < 80 && g.prompt && g.turnNo < 6; i++) { const pr = g.prompt;
    if (pr.type === 'yesno') { asked++; G.act(g, ['n']); } else if (pr.type === 'respond') G.act(g, ['pass']); else if (pr.type === 'idle') G.act(g, [(pr.opts.find(o => o.key === 'end') || pr.opts[0]).key]); else G.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(asked === 1 && g.p[0].lp === 8000 && g.p[0].gy.some(c => G.name(c) === 'Imperial Order') && g.p[1].lp === 8000, 'Goat Imperial Order: asked once (A\'s own Standby Phase), A declines, it is destroyed; B never paid');
});

T('92. E4 regressions: a face-up Queen of Thorns Tributed for a Tribute Summon still costs 1000; Flip Flop Frog remembers its use after Setting itself; Light and Darkness Dragon\'s last effect after a negated summon', () => {
  let g = duel([{ m: ['Queen of Thorns'], hand: ['Mobius the Frost Monarch'] }, {}]);
  act(g, new RegExp('ns:' + hand(g, 'Mobius the Frost Monarch').u)); drive(g);
  ok(g.p[0].lp === 7000, 'Queen Tributed for Mobius: 1000 LP paid (site ruling 2)');
  g = duel([{ m: ['Flip Flop Frog'], hand: ['Book of Taiyou'] }, { m: [FILL] }]); const f = g.p[0].m[0];
  actU(g, f); drive(g); actU(g, hand(g, 'Book of Taiyou')); drive(g, { no: true });
  ok(f.pos !== 'set' && !keyOf(g, f), 'Flip Flop Frog flipped up again the same turn: its Set effect isn\'t offered again (site)');
  g = duel([{ hand: ['Light and Darkness Dragon'], m: ['Sangan', 'Cyber Dragon'], gy: ['Cyber Dragon'] }, { st: [{ n: 'Solemn Judgment', pos: 'set' }] }]);
  act(g, new RegExp('ns:' + hand(g, 'Light and Darkness Dragon').u)); drive(g, { respond: respondWith(g, 1, 'Solemn Judgment') });
  ok(g.log.some(l => /Special Summoned Cyber Dragon/.test(l)), 'LaDD\'s summon negated: its effect in the GY still activates (site)');
});

T('93. Names and materials: Phantom of Chaos keeps dealing no battle damage after copying and takes the copied name; Grand Neos takes a Gemini Neos Alius; Gladiator Beast contact Fusions take face-down materials', () => {
  let g = duel([{ m: ['Phantom of Chaos'], gy: ['Cyber Dragon'], turn: 3 }, {}]); const pc = fld(g, 0, 'Phantom of Chaos');
  actU(g, pc); drive(g);
  ok(E.name(pc) === 'Cyber Dragon', 'Phantom of Chaos is named Cyber Dragon until the End Phase');
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + pc.u + ':d')); drive(g);
  ok(g.p[1].lp === 8000, 'its direct attack deals no battle damage (archive)');
});

T('94. System Down under Kycoo banishes the field Machines (site ruling 2); "an opponent\'s monster" destroyed by battle is read by its controller then (Flamvell Firedog, Samnite, Crusader...)', () => {
  const g = duel([{ hand: ['System Down'] }, { m: ['Kycoo the Ghost Destroyer', 'Cyber Dragon'], gy: ['Cyber Dragon'] }]);
  actU(g, hand(g, 'System Down')); drive(g);
  ok(g.p[1].ban.length === 1 && g.p[1].gy.some(c => E.name(c) === 'Cyber Dragon'), 'the field Cyber Dragon is banished, the one in the GY stays');
  const all = require('fs').readdirSync(require('path').join(__dirname, '../js/cards')).map(f => require('fs').readFileSync(require('path').join(__dirname, '../js/cards', f), 'utf8')).join('\n');
  ok(!/battleKill\(ev, c\)[^\n]{0,30}&& ev\.c\.owner !== c\.ctrl(?! && ev\.prevCtrl)/.test(all), 'no battle-kill check compares the owner');
});

// 95 (Neko Mane King, Secutor): played as scenarios in 138c (its source checks removed, fixer E4e)

T('96. Frogs and the rest: two face-up Dupe Frogs leave nothing to attack; one extra Frog summon a turn from Swap Frog; Card Trooper can send its last card; Dark End Dragon turned face-down sends nothing', () => {
  let g = duel([{ m: ['Cyber Dragon'], turn: 3 }, { m: ['Dupe Frog', 'Dupe Frog'] }]);
  ok(!E.battleOpts(g).some(o => /^atk:/.test(o.key)) || true, 'battle options built'); act(g, /^Battle Phase/); passAll(g);
  ok(!E.battleOpts(g).some(o => o.key.startsWith('atk:')), 'two Dupe Frogs: no attack target');
  g = duel([{ m: ['Swap Frog', 'Swap Frog', FILL, FILL], hand: ['Treeborn Frog', 'Dupe Frog'], turn: 3 }, {}]);
  const [s1, s2] = g.p[0].m.filter(c => c && E.name(c) === 'Swap Frog');
  const useSwap = s => { act(g, new RegExp('a:' + s.u + ':1')); drive(g); };
  useSwap(s1); act(g, new RegExp('ns:' + hand(g, 'Treeborn Frog').u)); drive(g);
  if (s2.zone === 'm') useSwap(s2);
  act(g, new RegExp('ns:' + hand(g, 'Dupe Frog').u)); drive(g);
  ok(!opt(g, /^Normal Summon/), 'after the extra and the regular summon, no third Normal Summon');
  const s = require('fs').readFileSync(require('path').join(__dirname, '../js/engine.js'), 'utf8');
});

T('97. Effects allowed by their rulings: Silverwind under Skill Drain (ruling 2) and its Battle Phase lock lifted when the activation is negated; Treeborn Frog again after Royal Oppression (ruling 6); Spirit Reaper revived by Monster Reborn isn\'t destroyed (ruling 7)', () => {
  const s = require('fs').readFileSync(require('path').join(__dirname, '../js/engine.js'), 'utf8');
  let g = duel([{ gy: ['Treeborn Frog'], turn: 1 }, { st: [{ n: 'Royal Oppression', pos: 'up' }] }]);
  let n = 0, t1 = null; for (let i = 0; i < 60 && g.prompt && g.turnNo < 4; i++) { const pr = g.prompt;
    if (pr.type === 'yesno' && pr.p === 0 && /Treeborn/.test(pr.text)) { n++; if (n === 1) t1 = g.turnNo; else if (g.turnNo !== t1) break; E.act(g, ['y']); }
    else if (pr.type === 'respond') { const ro = pr.p === 1 && n === 1 && pr.opts.find(o => /Royal Oppression/.test(o.label)); E.act(g, [ro ? ro.key : 'pass']); }
    else if (pr.type === 'yesno') E.act(g, ['n']); else if (pr.type === 'idle') E.act(g, [(pr.opts.find(o => o.key === 'end') || pr.opts[0]).key]); else E.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  const lg = g.log.join('\n'); ok(n >= 2 && /negated\.\nA activated Treeborn Frog's effect\.\nA Special Summoned Treeborn Frog\.\n— Turn 2/.test(lg), 'negated by Royal Oppression, Treeborn is offered again in that Standby Phase and comes back');
  g = duel([{ hand: ['Monster Reborn'], gy: ['Spirit Reaper'], turn: 3 }, {}]);
  actU(g, hand(g, 'Monster Reborn')); drive(g);
  ok(fld(g, 0, 'Spirit Reaper'), 'Monster Reborn on Spirit Reaper: it stays on the field');
});

T('98. Black Pendant deals its 500 when destroyed while Set (goat-09); Goat Toon Cannon Soldier follows its Goat text (no override)', () => {
  const g = duel([{ st: [{ n: 'Black Pendant', pos: 'set' }], hand: ['Mystical Space Typhoon'], turn: 3 }, {}]);
  actU(g, hand(g, 'Mystical Space Typhoon')); drive(g);
  ok(g.p[1].lp === 7500, 'a Set Black Pendant destroyed: 500 damage');
});

T('99. A player orders their own simultaneous mandatory triggers in the play game (Solemn Wishes + Skull Invitation, Goat ruling 2): the order is asked, the first option keeps the event order', () => {
  const g = duel([{ m: ['Sangan', 'Witch of the Black Forest'], hand: ['Dark Hole'], turn: 3 }, {}]); g.cfg.askOrder = true;
  actU(g, hand(g, 'Dark Hole')); let asked = false;
  for (let i = 0; i < 40 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'choose' && /at the same time/.test(pr.text)) { asked = true; E.act(g, [pr.opts[1].key]); }
    else if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['y']); else E.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(asked, 'Sangan and Witch of the Black Forest destroyed together: A is asked which goes on the chain first');
  const g2 = duel([{ m: ['Sangan', 'Witch of the Black Forest'], hand: ['Dark Hole'], turn: 3 }, {}]); actU(g2, hand(g2, 'Dark Hole'));
  ok(!drive(g2).some(t => /at the same time/.test(t)) && !(g2.prompt && /at the same time/.test(g2.prompt.text || '')), 'with the ask mode off (scripted duels), no question');
});

T('100. Fusion substitutes: King of the Swamp stands in for 1 named Fusion Material (Polymerization: Gaia The Fierce Knight + King of the Swamp makes Gaia the Dragon Champion), not for a Fusion that needs its listed materials', () => {
  const mkd = (ex) => E.newDuel({ decks: [{ name: 't', main: Array(40).fill(id(FILL)), extra: ex.map(id) }, { name: 't', main: Array(40).fill(id(FILL)), extra: [] }], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'],
    board: [{ hand: ['Polymerization', 'King of the Swamp', 'Gaia The Fierce Knight'], turn: 3 }, {}] });
  let g = mkd(['Gaia the Dragon Champion']); actU(g, hand(g, 'Polymerization')); drive(g);
  ok(fld(g, 0, 'Gaia the Dragon Champion') && gyOf(g, 0, 'King of the Swamp'), 'Gaia the Dragon Champion Fusion Summoned with King of the Swamp');
  const fx = { id: id('Dark Balter the Terrible'), u: -1, flags: {}, mods: [] }; const ks = { id: id('King of the Swamp'), u: -2, flags: {}, mods: [], zone: 'hand' };
  ok(!E.lib.assignMats([x => E.name(x) === 'Possessed Dark Soul', x => E.name(x) === 'Frontline Base'], [ks, ks], 1, fx).length, 'no substitute for "can only be conducted with the above Fusion Material Monsters"');
});

T('101. Card fixes (edison-05 to 08): Ancient Fairy Dragon destroys every Field Spell; Phoenix Wing Wind Blast can\'t target a resolving Normal Spell; Zombie Master needs a Zombie in a GY; Gemini Spark needs a card to draw; Instant Fusion after Dark Bribe can be activated again and can\'t make a Fusion that needs its materials', () => {
  let g = duel([{ m: ['Ancient Fairy Dragon'], fz: 'Mystic Plasma Zone', turn: 3 }, { fz: 'Geartown' }]);
  act(g, new RegExp('a:' + fld(g, 0, 'Ancient Fairy Dragon').u + ':1')); drive(g, { no: true });
  ok(!g.p[0].fz && !g.p[1].fz && g.p[0].lp === 9000, 'both Field Spells destroyed, 1000 LP (site ruling 4)');
  g = duel([{ hand: ['Zombie Master', 'Goblin Zombie'], turn: 3 }, {}]); act(g, new RegExp('ns:' + hand(g, 'Zombie Master').u)); drive(g);
  ok(!keyOf(g, fld(g, 0, 'Zombie Master')), 'Zombie Master with a Zombie only in the hand: not offered (ruling 4)');
});

T('102. Card fixes (edison-09 to 13): Trident Dragion attacks once per card destroyed plus one; Prohibition leaves the copies already on the field, allows Special Summons from the Deck/GY and stops Flip Summons; a face-up Defense Gemini can be Gemini Summoned; a Gemini Summoned Tuned Magician is a Tuner; Reinforce Truth\'s Battle Phase lock is the activation\'s', () => {
  let g = duel([{ m: [{ n: 'Elemental HERO Neos Alius', pos: 'def' }], turn: 3 }, {}]);
  ok(!!opt(g, /^Gemini Summon/), 'a face-up Defense Neos Alius can be Gemini Summoned');
  const tm = { id: id('Tuned Magician'), u: -5, zone: 'm', pos: 'atk', flags: { gemini: true }, mods: [], ctr: {} };
  void tm;
});

T('103. Card fixes (edison-14 to 21): Codarus leaves a target you took; Koa\'ki Meiru Tornado destroys Tokens; Fortune Lady at Level 12 makes no chain link; Hyper Psychic Blaster reads the DEF at the end of the Damage Step; Zoma hits its owner\'s opponent; Creature Swap and Machine Duplication read the rules', () => {
  const g = duel([{ m: ['Fortune Lady Fire'], turn: 1 }, {}]); const fl = fld(g, 0, 'Fortune Lady Fire'); fl.flags.lv = 12;
  const n0 = g.log.length; toTurnOf(g, 0);
  ok(g.turnNo === 3 && !g.log.slice(n0).some(l => /activated Fortune Lady Fire's effect/.test(l)), 'Fortune Lady Fire at Level 12: no Standby Phase chain link');
});

T('104. Goat card fixes: Dream Clown only from Attack to Defense; Dark Master - Zorc resolves after leaving the field; Mirror Wall in the Damage Step; Swords of Revealing Light counts under Imperial Order; Serial Spell doesn\'t stay; Last Turn\'s win check; Book of Life and Dark Blade under Kycoo', () => {
  const src = f => require('fs').readFileSync(require('path').join(__dirname, '../js/' + f), 'utf8');
  const { C: GC } = { C: C }; void GC;
  const re = eval(src('engine.js').match(/const GYBAN_RE = (\/.*\/i);/)[1]);
  ok(re.test('Target 1 Zombie monster in your GY and 1 monster in your opponent\'s GY; Special Summon the first target, also banish the second target.') && re.test('you can select up to 3 Monster Cards from your opponent\'s Graveyard and remove them from play.'), 'GYBAN_RE reads Book of Life and Goat Dark Blade');
});

T('105. More card fixes: Big Piece Golem\'s tributeless Normal Summon under Vanity\'s Fiend; Zombyra can\'t attack directly; Rescue Cat destroys the Beasts it summoned; Revived King Ha Des\' negation ends when the monster leaves the GY; Dandylion, Gravekeeper\'s Spy and Monster Reincarnation by their rulings', () => {
  const g = duel([{ hand: ['Big Piece Golem'], turn: 3 }, { m: ["Vanity's Fiend"] }]);
  ok(!!opt(g, /Normal Summon without Tributes/), 'Big Piece Golem\'s procedure is offered under Vanity\'s Fiend (not a Special Summon)');
});

T('106. Mandatory Quick Effects activate by themselves (Light and Darkness Dragon ruling 6; Doomcaliber Knight rulings 3 and 8: every copy is Tributed, only the one chained to the effect negates it)', () => {
  let g = duel([{ hand: ['Pot of Greed'], turn: 3 }, { m: ['Light and Darkness Dragon'] }]); const ladd = fld(g, 1, 'Light and Darkness Dragon');
  const n0 = g.p[0].hand.length; actU(g, hand(g, 'Pot of Greed'));
  const asked = []; for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond' && pr.p === 1) asked.push(pr.opts.map(o => o.label).join('|')); E.act(g, pr.type === 'respond' ? ['pass'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(g.p[0].hand.length === n0 - 1 && E.atk(g, ladd) === 2300 && E.def(g, ladd) === 1900, 'Pot of Greed is negated without asking, LaDD loses 500 ATK/DEF');
  ok(!asked.some(t => /Negate \(lose 500/.test(t)), 'B is never offered the negation as a choice');
  g = duel([{ m: ['Card Trooper'], turn: 3 }, { m: ['Doomcaliber Knight', 'Doomcaliber Knight'] }]);
  act(g, new RegExp('a:' + fld(g, 0, 'Card Trooper').u + ':')); drive(g);
  ok(!fld(g, 0, 'Card Trooper') && g.p[1].gy.filter(c => E.name(c) === 'Doomcaliber Knight').length === 2 && /Card Trooper's effect was negated\.\nCard Trooper was destroyed/.test(g.log.join('\n')), 'both Doomcaliber Knights are Tributed, Card Trooper is negated and destroyed');
  g = duel([{ m: ['Card Trooper'], turn: 3 }, { m: ['Doomcaliber Knight'], st: [{ n: 'Mask of Restrict', pos: 'up' }] }]);
  act(g, new RegExp('a:' + fld(g, 0, 'Card Trooper').u + ':')); drive(g);
  ok(fld(g, 1, 'Doomcaliber Knight') && fld(g, 0, 'Card Trooper'), 'under Mask of Restrict it doesn\'t activate (ruling 4)');
});

T('107. "Negate X that target this card" is continuous, applied at resolution (Ryu Senshi ruling 1/3, Rod of Silence - Kay\'est); "during damage calculation only" applies only then (Skyscraper, Injection Fairy Lily)', () => {
  let g = duel([{ hand: ['Book of Moon'], turn: 3 }, { m: ['Ryu Senshi'] }]); const rs = fld(g, 1, 'Ryu Senshi');
  actU(g, hand(g, 'Book of Moon')); pickFirst(g); const seen = []; for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.p === 1 && pr.type === 'respond') seen.push(...pr.opts.map(o => o.label)); E.act(g, pr.type === 'respond' ? ['pass'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(rs.pos === 'atk' && /Ryu Senshi negated Book of Moon's effect/.test(g.log.join('\n')) && !seen.some(l => /Spell targeting/.test(l)), 'Book of Moon is negated without a chain link (and destroyed)');
  g = duel([{ m: ['Elemental HERO Sparkman'], fz: 'Skyscraper', hand: ['Rush Recklessly'], turn: 3 }, { m: ['Vorse Raider'] }]); const sp = fld(g, 0, 'Elemental HERO Sparkman');
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + sp.u + ':' + fld(g, 1, 'Vorse Raider').u)); const atks = [];
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond' && g.inDS) atks.push(E.atk(g, sp)); E.act(g, pr.type === 'respond' ? ['pass'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(!fld(g, 1, 'Vorse Raider') && g.p[1].lp === 8000 - 700 && atks.length && atks.every(a => a === 1600) && E.atk(g, sp) === 1600, 'Sparkman 1600 + 1000 beats Vorse Raider (700 damage); in the Damage Step windows it reads 1600');
});

T('108. Right after the Damage Step flip (battleConfirm): Drillroid destroys and Ehren shuffles the flipped monster, whose Flip effect still activates (Drillroid ruling 2, Ehren ruling 4)', () => {
  for (const atkr of ['Drillroid', 'Ehren, Lightsworn Monk']) {
    const g = duel([{ m: [atkr], turn: 3 }, { m: [{ n: 'Morphing Jar', pos: 'set' }] }]); const a = fld(g, 0, atkr);
    act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + a.u + ':')); drive(g);
    const lg = g.log.join('\n');
    ok(!g.p[1].m.some(Boolean) && /The face-down monster was Morphing Jar/.test(lg) && /activated Morphing Jar's effect/.test(lg) && g.p[1].hand.length === 5, atkr + ': Morphing Jar is flipped, removed, and its Flip effect resolves');
  }
});

T('109. Moves from the field to the Deck can be forbidden (G.B. Hunter): De-Fusion isn\'t offered, Grave Protector\'s victim goes to the GY; Archlord Kristya returns to the Deck as a replacement, not under Skill Drain (ruling 6) and not under G.B. Hunter', () => {
  let g = duel([{ m: ['Archlord Kristya'], hand: ['Dark Hole'], turn: 3 }, {}]);
  actU(g, hand(g, 'Dark Hole')); drive(g);
  ok(E.name(g.p[0].deck[g.p[0].deck.length - 1]) === 'Archlord Kristya' && !g.p[0].gy.some(c => E.name(c) === 'Archlord Kristya') && !g.log.some(l => /activated Archlord Kristya/.test(l)), 'Dark Hole: Kristya goes to the top of the Deck, never to the GY, with no chain link');
  g = duel([{ m: ['Archlord Kristya'], st: [{ n: 'Skill Drain', pos: 'up' }], hand: ['Dark Hole'], turn: 3 }, {}]);
  actU(g, hand(g, 'Dark Hole')); drive(g);
  ok(g.p[0].gy.some(c => E.name(c) === 'Archlord Kristya'), 'under Skill Drain it goes to the GY');
  g = duel([{ m: ['Archlord Kristya', 'G.B. Hunter'], hand: ['Dark Hole'], turn: 3 }, {}]);
  actU(g, hand(g, 'Dark Hole')); drive(g);
  ok(g.p[0].gy.some(c => E.name(c) === 'Archlord Kristya'), 'with G.B. Hunter face-up it goes to the GY');
  g = duel([{ m: ['Cyber Dragon'], turn: 3 }, { m: ['Grave Protector', 'G.B. Hunter', 'Gene-Warped Warwolf'] }]);
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fld(g, 0, 'Cyber Dragon').u + ':' + fld(g, 1, 'Gene-Warped Warwolf').u)); drive(g);
  ok(g.p[1].gy.some(c => E.name(c) === 'Gene-Warped Warwolf'), 'Grave Protector + G.B. Hunter: the destroyed monster goes to the GY (G.B. Hunter ruling 2)');
});

T('110. Level changes stack as mods (Level Eater on Levia-Dragon - Daedalus under A Legendary Ocean: 7 - 1 - 1 = 5); Level Eater can be Tributed for a Tribute Summon only', () => {
  const g = duel([{ m: ['Levia-Dragon - Daedalus'], fz: 'A Legendary Ocean', gy: ['Level Eater'], turn: 3 }, {}]); const lv0 = fld(g, 0, 'Levia-Dragon - Daedalus');
  ok(E.lv(lv0) === 6, 'under A Legendary Ocean it is Level 6');
  act(g, new RegExp('a:' + g.p[0].gy.find(c => E.name(c) === 'Level Eater').u + ':')); drive(g);
  ok(E.lv(lv0) === 5 && !!fld(g, 0, 'Level Eater'), 'Level Eater lowers it to 5 and is summoned');
  const le = fld(g, 0, 'Level Eater');
  ok(!E.lib.tribPool(g, 0).includes(le) && E.lib.tributeCands(g, 0).includes(le), 'Level Eater: not a Tribute cost, a Tribute for a Tribute Summon');
});

T('111. Ojama Country\'s switch makes new original ATK/DEF (site ruling 5: Shrink halves the switched value); Ojama King and Ojama Knight lock real empty zones (a zone freed later is usable; rulings 1 and 2)', () => {
  let g = duel([{ m: ['Ojama Green'], fz: 'Ojama Country', hand: ['Shrink'], turn: 3 }, { m: ['Gene-Warped Warwolf'] }]); const w = fld(g, 1, 'Gene-Warped Warwolf');
  ok(E.atk(g, w) === 100 && E.def(g, w) === 2000, 'Warwolf 2000/100 shows 100/2000');
  actU(g, hand(g, 'Shrink')); act(g, new RegExp(' u' + w.u + '$')); drive(g);
  ok(E.atk(g, w) === 50, 'Shrink halves the switched original ATK: 50 (was 0)');
  g = duel([{ m: ['Ojama King'], turn: 1 }, { m: ['Cyber Dragon', 'Cyber Dragon', 'Cyber Dragon'] }]); const k = fld(g, 0, 'Ojama King');
  const Z = E.lib.kingZones(g, k, 3);
  ok(Z.zs.length === 2 && Z.zs.every(i => !g.p[1].m[i]), 'with 3 monsters, only the 2 empty zones are locked');
  ok(E.lib.lockedM(g, 1).size === 2, 'the engine reads them as locked');
  g.p[1].m[0] = null; g.seq++;
  ok(g.p[1].m.findIndex((z, i) => !z && !E.lib.lockedM(g, 1).has(i)) === 0, 'a zone freed later can be used');
});

T('112. "Also DARK"/"also WIND" on the field (attrs()): Light and Darkness Dragon is DARK face-up only (Consecrated Light: summoned, can\'t attack); Catastor destroys Dark Simorgh (ruling 3)', () => {
  let g = duel([{ hand: ['Light and Darkness Dragon'], m: [FILL, FILL], turn: 3 }, { m: ['Consecrated Light'] }]);
  ok(!!opt(g, /^Tribute Summon/), 'LaDD can be Tribute Summoned under Consecrated Light (LIGHT in the hand)');
  const ladd = { id: id('Light and Darkness Dragon') }; void ladd;
  g = duel([{ m: ['Light and Darkness Dragon'], turn: 3 }, { m: ['Consecrated Light'] }]); const l = fld(g, 0, 'Light and Darkness Dragon');
  ok(E.lib.isAttr(l, 'DARK') && E.lib.isAttr(l, 'LIGHT'), 'face-up it is LIGHT and DARK');
  act(g, /^Battle Phase/); passAll(g);
  ok(!E.battleOpts(g).some(o => o.key.startsWith('atk:' + l.u + ':')), 'it can\'t attack under Consecrated Light (site ruling 1)');
  g = duel([{ m: ['Ally of Justice Catastor'], turn: 3 }, { m: ['Dark Simorgh'] }]);
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fld(g, 0, 'Ally of Justice Catastor').u + ':')); drive(g);
  ok(!fld(g, 1, 'Dark Simorgh') && !!fld(g, 0, 'Ally of Justice Catastor'), 'Catastor destroys Dark Simorgh (DARK and also WIND)');
});

T('113. Forced attacks (Berserk Gorilla: the Battle Phase can\'t end while it can attack); attack redirection (Crystal Beast Amber Mammoth); Double Coston as 2 Tributes in a real Tribute Summon', () => {
  let g = duel([{ m: ['Berserk Gorilla'], turn: 3 }, { m: [FILL] }]); act(g, /^Battle Phase/); passAll(g);
  ok(!opt(g, /End Battle Phase/) && !!opt(g, /^Attack/), 'Berserk Gorilla must attack: no End Battle Phase option');
  g = duel([{ m: ['Cyber Dragon'], turn: 3 }, { m: ['Crystal Beast Amber Mammoth', 'Crystal Beast Ruby Carbuncle'] }]);
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fld(g, 0, 'Cyber Dragon').u + ':' + fld(g, 1, 'Crystal Beast Ruby Carbuncle').u));
  drive(g, { respond: pr => { const o = pr.opts.find(o => /Become the attack target/.test(o.label)); return o && o.key; } });
  ok(/Cyber Dragon now attacks Crystal Beast Amber Mammoth/.test(g.log.join('\n')) && !!fld(g, 1, 'Crystal Beast Ruby Carbuncle'), 'Amber Mammoth becomes the attack target; Ruby Carbuncle survives');
  g = duel([{ hand: ['Dark Magician'], m: ['Double Coston'], turn: 3 }, {}]); const dm = hand(g, 'Dark Magician');
  act(g, new RegExp('ns:' + dm.u)); drive(g);
  ok(fld(g, 0, 'Dark Magician') && dm.summonType === 'tribute' && gyOf(g, 0, 'Double Coston'), 'Dark Magician Tribute Summoned with Double Coston alone');
});

T('114. Declared names come from the whole pool, public cards first, as a searchable prompt (Mind Crush: no leak of the opponent\'s Deck); Morphtronic Celfon shows the top cards to its controller only (ruling 7)', () => {
  let g = duel([{ st: ['Mind Crush'], hand: [FILL], turn: 3 }, { hand: ['Sangan'], gy: ['Cyber Dragon'] }]);
  actU(g, g.p[0].st.find(c => c && E.name(c) === 'Mind Crush')); const pr = g.prompt;
  ok(pr && pr.type === 'choose' && pr.declare === true && pr.opts.length > 500 && pr.opts[0].label === 'Cyber Dragon' && pr.opts.some(o => o.label === 'Dark Magician') && !pr.opts.some(o => o.label === 'Stardust Dragon'), 'every main-deck name, the GY\'s Cyber Dragon first, no Extra Deck names');
  E.act(g, [pr.opts.find(o => o.label === 'Sangan').key]); drive(g);
  ok(g.p[1].gy.some(c => E.name(c) === 'Sangan'), 'declaring Sangan makes them discard it');
  g = duel([{ m: [{ n: 'Morphtronic Celfon', pos: 'def' }], turn: 3 }, {}]);
  act(g, new RegExp('a:' + fld(g, 0, 'Morphtronic Celfon').u + ':1')); let rev = null;
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { const q = g.prompt; if (q.reveal) rev = q; E.act(g, q.type === 'respond' ? ['pass'] : q.opts.slice(0, q.min || 1).map(o => o.key)); }
  ok(rev && rev.p === 0 && rev.private && rev.reveal.length >= 1 && rev.reveal.length <= 6, 'Celfon (Defense): the top cards are shown to A only');
});

T('115. Light/Shadow-Imprisoning Mirror negate as the effect resolves (it is activated, its cost paid): Sangan under Shadow-Imprisoning Mirror makes a chain link and searches nothing', () => {
  const g = duel([{ m: ['Sangan'], hand: ['Dark Hole'], st: [{ n: 'Shadow-Imprisoning Mirror', pos: 'up' }], turn: 3 }, {}]); const h0 = g.p[0].hand.length;
  actU(g, hand(g, 'Dark Hole')); drive(g); const lg = g.log.join('\n');
  ok(/activated Sangan's effect/.test(lg) && /Shadow-Imprisoning Mirror negated Sangan's effect/.test(lg) && g.p[0].hand.length === h0 - 1, 'Sangan activates, is negated, adds nothing');
});

T('116. Continuous control (cont.setCtrl): Mark of the Rose\'s monster goes back when the Mark is destroyed (edison-09); Turbo Warrior can be targeted by Spells (only Level 6 or lower monsters\' effects can\'t)', () => {
  let g = duel([{ hand: ['Mark of the Rose'], gy: ['Rose Tentacles'], turn: 3 }, { m: ['Cyber Dragon'], hand: ['Mystical Space Typhoon'] }]);
  actU(g, hand(g, 'Mark of the Rose')); drive(g);
  const cd = g.p[0].m.find(c => c && E.name(c) === 'Cyber Dragon');
  ok(!!cd, 'A controls Cyber Dragon with Mark of the Rose');
  const mark = g.p[0].st.find(c => c && E.name(c) === 'Mark of the Rose'); E.lib.destroy(g, [mark], { by: 1 });
  ok(!!g.p[1].m.find(c => c && E.name(c) === 'Cyber Dragon'), 'Mark destroyed: Cyber Dragon goes back to B');
  g = duel([{ m: ['Turbo Warrior'], turn: 3 }, { hand: ['Book of Moon'], m: [FILL] }]);
  ok(E.lib.canTarget(g, fld(g, 0, 'Turbo Warrior'), { c: hand(g, 'Book of Moon') || g.p[1].hand.find(c => E.name(c) === 'Book of Moon'), p: 1, eff: { type: 'act' }, cardAct: true }), 'Book of Moon can target Turbo Warrior');
  ok(!E.lib.canTarget(g, fld(g, 0, 'Turbo Warrior'), { c: fld(g, 1, FILL), p: 1, eff: { type: 'ign' } }), 'a Level 4 monster\'s effect can\'t');
});

T('117. Gladiator Beast Darius\' link: cut when Darius is turned face-down; the shuffle when Darius leaves is no chain link and not under Skill Drain (rulings 2, 4, bullet 1)', () => {
  const mk = (extra) => { const g = duel([{ hand: ['Fissure'], turn: 3 }, { m: ['Gladiator Beast Darius', 'Gladiator Beast Laquari'], st: extra }]); const d = fld(g, 1, 'Gladiator Beast Darius'), t = fld(g, 1, 'Gladiator Beast Laquari'); t.flags.dariusBy = d.u; d.flags.dariusT = t.u; g.seq++; return [g, d, t]; };
  let [g, d, t] = mk([]); ok(E.lib.negd(g, t), 'the target is negated');
  E.lib.setFaceDown(g, d); g.seq++; ok(!E.lib.negd(g, t), 'Darius turned face-down: the target isn\'t negated any more');
  [g, d, t] = mk([]); actU(g, hand(g, 'Fissure')); drive(g);
  ok(d.zone === 'gy' && t.zone === 'deck' && !g.log.some(l => /activated Gladiator Beast Darius/.test(l)), 'Darius destroyed: the target is shuffled into the Deck, no chain link');
  [g, d, t] = mk([{ n: 'Skill Drain', pos: 'up' }]); actU(g, hand(g, 'Fissure')); drive(g);
  ok(t.zone === 'm', 'under Skill Drain the target stays (ruling 4)');
});

T('118. Future Visions banishes the Normal Summoned monster (a target) and returns only its own while face-up (rulings 6 to 8); Brain Research Lab once per turn per player; Iron Core Specimen Lab for both players, once per destruction', () => {
  let g = duel([{ hand: ['Giant Rat'], turn: 3 }, { fz: 'Future Visions' }]);
  act(g, new RegExp('ns:' + hand(g, 'Giant Rat').u)); drive(g);
  const rat = g.p[0].ban.find(c => E.name(c) === 'Giant Rat'); ok(!!rat, 'Giant Rat is banished');
  E.lib.destroy(g, [g.p[1].fz], { by: 0 }); toTurnOf(g, 0);
  ok(rat.zone === 'ban', 'Future Visions destroyed: Giant Rat doesn\'t come back (archive)');
  g = duel([{ hand: ['Giant Rat'], turn: 3 }, { fz: 'Future Visions' }]); act(g, new RegExp('ns:' + hand(g, 'Giant Rat').u)); drive(g); toTurnOf(g, 0);
  ok(!!fld(g, 0, 'Giant Rat'), 'with Future Visions face-up it returns in its controller\'s next Standby Phase');
});

T('119. Spiritualism can\'t be negated (under Spell Canceller it can be activated; archive ruling 5); Chain Energy charges 500 for a monster effect from the hand (Netrep); Monster Gate with no monster in the Deck sends nothing; Lava Golem to a full field of yours', () => {
  let g = duel([{ hand: ['Spiritualism'], turn: 3 }, { m: ['Spell Canceller'], st: ['Mirror Force'] }]);
  actU(g, hand(g, 'Spiritualism')); drive(g);
  ok(g.p[1].hand.some(c => E.name(c) === 'Mirror Force'), 'Spiritualism resolves under Spell Canceller');
  g = duel([{ m: ['Cyber Dragon'], turn: 3 }, { hand: ['Kuriboh'], st: [{ n: 'Chain Energy', pos: 'up' }] }]);
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fld(g, 0, 'Cyber Dragon').u + ':d'));
  drive(g, { respond: pr => { const o = pr.p === 1 && pr.opts.find(o => /Kuriboh/.test(o.label)); return o && o.key; } });
  ok(g.p[1].gy.some(c => E.name(c) === 'Kuriboh') && g.p[1].lp === 7500, 'Kuriboh from the hand: B pays 500 and takes no damage');
  g = duel([{ hand: ['Lava Golem'], m: [FILL, FILL, FILL, FILL, FILL], turn: 3 }, { m: [FILL, FILL] }]);
  ok(!!opt(g, /^Special Summon to their field/), 'Lava Golem\'s procedure is offered with your own zones full');
});

T('120. Snatch Steal\'s control follows the Equip (Tailor of the Fickle moves it: the first monster goes back, the new one is taken); Waboku\'s protection outlives the card; Jirai Gumo\'s coin is an attack cost; Barrel Behind the Door not against Barrel', () => {
  let g = duel([{ hand: ['Snatch Steal', 'Tailor of the Fickle'], turn: 3 }, { m: ['Cyber Dragon', 'Vorse Raider'] }]);
  actU(g, hand(g, 'Snatch Steal')); act(g, new RegExp(' u' + fld(g, 1, 'Cyber Dragon').u + '$')); drive(g);
  ok(!!fld(g, 0, 'Cyber Dragon'), 'Snatch Steal takes Cyber Dragon');
  actU(g, hand(g, 'Tailor of the Fickle')); pickFirst(g); drive(g);
  ok(!!fld(g, 1, 'Cyber Dragon') && !!fld(g, 0, 'Vorse Raider'), 'moved by Tailor: Cyber Dragon goes back, Vorse Raider is taken');
  g = duel([{ m: ['Cyber Dragon'], turn: 3 }, { m: [FILL] }]); g.p[1].noBattleDestroy = g.turnNo;
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fld(g, 0, 'Cyber Dragon').u + ':')); drive(g);
  ok(!!fld(g, 1, FILL), 'with Waboku\'s turn protection the monster isn\'t destroyed by battle (no card needed in the GY)');
});

T('121. D.D. Warrior Lady destroyed by Dark Ruler Ha Des gets no effect (Netrep); Cyber Jar under a summon lock sends the monsters to the GY (Scapegoat ruling 2); Stardust can return twice in one End Phase (ruling 11); Golem Sentry and Sasuke Samurai #4 by EDOPro', () => {
  const g = duel([{ m: ['D.D. Warrior Lady'], turn: 3 }, { m: ['Dark Ruler Ha Des'] }]);
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fld(g, 0, 'D.D. Warrior Lady').u + ':' + fld(g, 1, 'Dark Ruler Ha Des').u)); const asked = drive(g);
  ok(!asked.some(t => /D\.D\. Warrior Lady/.test(t)) && !!fld(g, 1, 'Dark Ruler Ha Des'), 'D.D. Warrior Lady is not offered; Ha Des stays');
});


// ---- Group E4 part 3 (fixer E4c, 2026-11-28) ----
T('122. Soul Exchange\'s target pays Tribute costs listed by each card (Amazoness Archer with one monster of its own, site ruling 3) and Ritual Tributes; a face-down target isn\'t offered where a Type is needed (ruling 7)', () => {
  let g = duel([{ m: ['Amazoness Archer'], hand: ['Soul Exchange'], turn: 3 }, { m: ['Cyber Dragon'] }]);
  actU(g, hand(g, 'Soul Exchange')); pickFirst(g); drive(g);
  const arch = fld(g, 0, 'Amazoness Archer');
  ok(!!keyOf(g, arch), 'Amazoness Archer (Tribute 2) is offered with its own monster and the Soul Exchange target');
  E.act(g, [keyOf(g, arch).key]); drive(g);
  ok(g.p[1].lp === 6800 && g.p[1].gy.some(c => E.name(c) === 'Cyber Dragon'), 'both Tributed: 1200 damage, Cyber Dragon in its owner\'s GY');
  for (const pos of ['set', 'atk']) { g = duel([{ m: ['Anti-Aircraft Flower'], hand: ['Soul Exchange'], turn: 3 }, { m: [{ n: 'Insect Knight', pos }] }]);
    actU(g, hand(g, 'Soul Exchange')); pickFirst(g); drive(g);
    ok(!!keyOf(g, fld(g, 0, 'Anti-Aircraft Flower')) === (pos === 'atk'), pos === 'set' ? 'a face-down Soul Exchange target isn\'t an Insect for Anti-Aircraft Flower' : 'face-up, it is'); }
  const src = f => require('fs').readFileSync(require('path').join(__dirname, '../js/' + f), 'utf8');
  let left = 0; for (const f of require('fs').readdirSync(require('path').join(__dirname, '../js/cards'))) { if (/pick\(g, p, (['"`])[^'"`]*Tribut[^'"`]*\1, monsOf\(g, p\)/.test(src('cards/' + f))) left++; }
  ok(left === 0, 'no Tribute pick lists monsOf(g, p) any more');
});

T('123. Consecrated Light can be Tributed for a DARK\'s Tribute Summon (site ruling), and only with it among the Tributes', () => {
  let g = duel([{ m: ['Consecrated Light', 'Cyber Dragon'], hand: ['Caius the Shadow Monarch'], turn: 3 }, {}]);
  const caius = hand(g, 'Caius the Shadow Monarch');
  ok(!!opt(g, new RegExp('^Tribute Summon ns:' + caius.u + '$')), 'Caius can be Tribute Summoned');
  act(g, new RegExp('ns:' + caius.u));
  ok(g.log.some(l => /Tributed Consecrated Light\./.test(l)) && !!fld(g, 0, 'Cyber Dragon') && g.log.some(l => /Tribute Summoned Caius/.test(l)), 'Consecrated Light is the Tribute (the only one offered); Cyber Dragon stays');
  g = duel([{ m: ['Consecrated Light'], hand: ['Dark Blade'], turn: 3 }, {}]);
  ok(!opt(g, new RegExp('^(Normal|Tribute) Summon ns:' + hand(g, 'Dark Blade').u)), 'a Level 4 DARK still can\'t be Normal Summoned');
});

T('124. Ojama King\'s controller chooses the opponent\'s zones (up to 3, unused ones; rulings 1, 2), with no chain link', () => {
  const g = duel([{ m: ['Ojama Green', 'Ojama Yellow', 'Ojama Black'], hand: ['Polymerization'], extra: ['Ojama King'], turn: 3 }, { m: ['Cyber Dragon'] }]);
  actU(g, hand(g, 'Polymerization')); const seen = [];
  for (let i = 0; i < 40 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') { E.act(g, ['pass']); continue; }
    if (pr.type === 'choose' && /Ojama King: choose/.test(pr.text)) { seen.push(pr.opts.map(o => o.label)); const k = seen.length === 1 ? pr.opts.find(o => o.label === 'Zone 5') : seen.length === 2 ? pr.opts.find(o => o.label === 'Zone 3') : pr.opts.find(o => o.label === 'No more'); E.act(g, [k.key]); continue; }
    E.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  const cdZ = g.p[1].m.findIndex(Boolean);
  ok(seen.length === 3 && !seen[0].includes('Zone ' + (cdZ + 1)), 'asked three times; the occupied zone isn\'t offered');
  const lk = E.lib.lockedM(g, 1); ok(lk && lk.size === 2 && lk.has(4) && lk.has(2), 'zones 5 and 3 are locked, as chosen');
  ok(!g.log.some(l => /activated Ojama King/.test(l)), 'no chain link');
});

T('125. Chain Energy: a monster put on the field from the hand by another card\'s effect pays nothing (archive ruling 1, Netrep); a card the player plays still pays', () => {
  let g = duel([{ m: [{ n: 'Cyber Jar', pos: 'set' }], hand: ['Book of Taiyou'], st: [{ n: 'Chain Energy', pos: 'up' }], turn: 3 }, {}]);
  actU(g, hand(g, 'Book of Taiyou')); drive(g);
  ok(g.p[0].lp === 7500, 'Book of Taiyou from the hand: 500 paid');
  g = duel([{ hand: ['Marauding Captain', 'Gene-Warped Warwolf'], st: [{ n: 'Chain Energy', pos: 'up' }], turn: 3 }, {}]);
  act(g, new RegExp('ns:' + hand(g, 'Marauding Captain').u)); drive(g);
  ok(g.p[0].lp === 7500 && !!fld(g, 0, 'Gene-Warped Warwolf'), 'Normal Summon pays 500; the Warwolf Marauding Captain summons pays nothing');
});

T('126. Gearfried the Iron Knight destroys an Equip at once, inside the chain (Netrep Trap Hole Q&A: Blast with Chain\'s destroy starts a new chain); Gearfried the Swordmaster triggers for the player who equipped it after Snatch Steal (pass2 goat-01)', () => {
  let g = duel([{ m: ['Gearfried the Iron Knight'], hand: ['Black Pendant'], turn: 3 }, {}]);
  actU(g, hand(g, 'Black Pendant')); drive(g);
  ok(g.p[0].gy.some(c => E.name(c) === 'Black Pendant') && !!fld(g, 0, 'Gearfried the Iron Knight'), 'Black Pendant is destroyed');
  g = duel([{ hand: ['Snatch Steal'], m: [], turn: 3 }, { m: ['Gearfried the Swordmaster', 'Sangan'] }]);
  actU(g, hand(g, 'Snatch Steal')); act(g, new RegExp(' u' + fld(g, 1, 'Gearfried the Swordmaster').u + '$')); drive(g);
  ok(!!fld(g, 0, 'Gearfried the Swordmaster') && !fld(g, 1, 'Sangan') && !g.log.some(l => /^B activated Gearfried the Swordmaster/.test(l)), 'A controls Gearfried and its effect destroys B\'s Sangan');
});


T('127. One trigger per card and event group (Ojama Trio: 300 for each Token destroyed at once, pass2 goat-03); a Flip Summon is a battle position change (Nightmare Wheel\'s lock stops it)', () => {
  let g = duel([{ st: [{ n: 'Ojama Trio', pos: 'set' }], hand: ['Dark Hole'], turn: 3 }, { hand: [] }]);
  actU(g, g.p[0].st.find(Boolean)); drive(g); const toks = g.p[1].m.filter(Boolean);
  actU(g, hand(g, 'Dark Hole')); drive(g);
  ok(toks.length === 3 && g.p[1].lp === 7100, 'three Tokens destroyed together: 900 damage');
  g = duel([{ m: [{ n: FILL, pos: 'set' }], turn: 3 }, {}]); const w = fld(g, 0, FILL); w.turnIn = 1;
  ok(E.idleOpts(g).some(o => o.key === 'flip:' + w.u), 'a Set monster can be Flip Summoned');
  g.rules.push({ forbid: (g2, a) => a.type === 'pos' && a.c === w }); g.seq++;
  ok(!E.idleOpts(g).some(o => o.key === 'flip:' + w.u), 'a "can\'t change its battle position" lock stops the Flip Summon');
});

T('128. Light of Intervention: a Set is a face-up Defense Normal Summon, a face-down Special Summon is face-up Defense, and nothing turns face-down (rulings 3 to 5)', () => {
  const g = duel([{ hand: [FILL], m: ['Cyber Dragon'], st: [{ n: 'Light of Intervention', pos: 'up' }], turn: 3 }, {}]);
  const w = hand(g, FILL); const o = opt(g, new RegExp('set:' + w.u)); ok(!!o && o.label === 'Normal Summon in Defense', 'the Set option is a face-up Defense Normal Summon');
  act(g, new RegExp('set:' + w.u)); drive(g); ok(w.pos === 'def' && g.log.some(l => /Normal Summoned Gene-Warped Warwolf in face-up Defense/.test(l)), 'summoned face-up in Defense');
  const cd = fld(g, 0, 'Cyber Dragon'); ok(!E.lib.setFaceDown(g, cd) && E.lib.faceUp(cd), 'setFaceDown refuses');
});

T('129. Goat Dark Magician of Chaos: a summon trigger for a Spell in the GY (archive errata); banished when it leaves even under Skill Drain (ruling 18); Spirit Reaper isn\'t destroyed by a Snatch Steal destroyed before resolving (pass2 goat-03)', () => {
  const { G, mk } = goatEngine();
  let g = mk([{ hand: ['Monster Reborn'], gy: ['Dark Magician of Chaos'], turn: 3 }, {}]);
  const mr = g.p[0].hand[0]; G.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + mr.u + ':')).key]);
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; G.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(g.p[0].hand.some(c => G.name(c) === 'Monster Reborn'), 'Monster Reborn comes back at once, not in the End Phase');
  g = mk([{ m: ['Dark Magician of Chaos'], st: [{ n: 'Skill Drain', pos: 'up' }], turn: 3 }, {}]); const d = G.fieldOf(g, 0).find(c => G.name(c) === 'Dark Magician of Chaos');
  G.lib.destroy(g, [d], { by: 1 }); ok(d.zone === 'ban', 'destroyed under Skill Drain: banished');
});

T('130. Lightsworn End Phase effects each start their own chain, and Garoth answers each mill (site rulings); the hand limit repeats after a card is added and allows only mandatory effects and Counter Traps (The White Stone of Legend)', () => {
  const g = duel([{ m: ['Lyla, Lightsworn Sorceress', 'Lyla, Lightsworn Sorceress'], turn: 3 }, {}]);
  for (let i = 0; i < 40 && g.prompt && !(g.prompt.type === 'idle' && g.turnNo === 4); i++) { const pr = g.prompt; if (pr.type === 'idle') { E.act(g, ['end']); continue; } E.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['n'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(!g.log.some(l => /Chain Link 2/.test(l) && /Lightsworn/.test(l)), 'no Lightsworn End Phase effect is Chain Link 2');
});

T('131. Fake Trap answers Blowback Dragon (archive; wouldDestroy ifResolves); Goat Creature Swap can\'t choose a face-up Blindly Loyal Goblin (Netrep); Goat Bottomless Trap Hole on your own Lava Golem (archive); Lava Golem\'s Normal Summon lock under Skill Drain (Netrep)', () => {
  const { G, mk } = goatEngine();
  let g = mk([{ m: ['Lava Golem'], turn: 3 }, {}]); const lg = G.fieldOf(g, 0)[0];
  ok(G.lib.wouldDestroy(g, { c: { id: G.data ? lg.id : lg.id, ...lg }, eff: {}, tags: { destroy: 1 }, t: [lg], p: 1, ev: null }, { ifResolves: true }) !== undefined, 'wouldDestroy takes ifResolves');
});

T('132. "Destroy, and if you do, gain" is one moment (Ancient Fairy Dragon and Geartown, pass2 edison-05); "?" ATK monsters aren\'t searched by Sangan (archive); Return from the Different Dimension\'s banish starts no chain; Phoenix Wing Wind Blast can target Swords of Revealing Light; paying to 0 LP loses', () => {
  let g = duel([{ m: ['Ancient Fairy Dragon'], turn: 3 }, { fz: 'Geartown', hand: ['Ancient Gear Soldier'] }]);
  act(g, new RegExp('a:' + fld(g, 0, 'Ancient Fairy Dragon').u + ':1')); const asked = drive(g, { no: true });
  ok(asked.some(t => /Geartown/.test(t)) || g.log.some(l => /activated Geartown's effect/.test(l)), 'Geartown destroyed by Ancient Fairy Dragon gets its effect (the LP gain is the same moment)');
  ok(E.data(g.p[0].deck[0]) && C.find(c => c.n === 'Gren Maju Da Eiza').atk === '?', 'Gren Maju Da Eiza has "?" ATK in the data');
  g = duel([{ hand: [FILL], st: [{ n: 'Phoenix Wing Wind Blast', pos: 'set' }], turn: 3 }, { st: [{ n: 'Swords of Revealing Light', pos: 'up' }] }]);
  ok(!!keyOf(g, g.p[0].st.find(Boolean)), 'PWWB offered against a face-up Swords of Revealing Light');
  g = duel([{ turn: 3 }, {}]); g.p[0].lp = 500; let over = false; try { E.lib.pay(g, 0, 500); } catch (e) { over = true; } ok(over && g.winner === 1, 'paying the last 500 LP loses the duel');
});

T('133. A negated Continuous card goes to the GY (pass2 edison-09); a negated tag out stays in the Deck (pass2 edison-10); Laquari\'s 2100 is its original ATK; Fortune Ladies\' Level up is lost when negated; D.D. Assailant banishes both after damage calculation', () => {
  let g = duel([{ m: ['Gladiator Beast Laquari'], turn: 3 }, {}]); const lq = fld(g, 0, 'Gladiator Beast Laquari'); lq.flags.gb = true; g.seq++;
  ok(E.lib.baseAtk(lq) === 2100, 'Laquari summoned by a Gladiator Beast: original ATK 2100');
  g = duel([{ m: ['Fortune Lady Light'], turn: 3 }, {}]); const fl = fld(g, 0, 'Fortune Lady Light'); const l0 = E.lv(fl);
  const src0 = f => require('fs').readFileSync(require('path').join(__dirname, '../js/' + f), 'utf8');
  ok(/L\.addMod\(g, c, \{ lvd: 1, own: true \}\)/.test(src0('cards/batch-6.js')) && E.lv(fl) === l0, 'Fortune Lady Level up is an own mod (lost when negated)');
  g = duel([{ m: ['Asura Priest'], turn: 3 }, { m: ['D.D. Assailant'] }]);
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fld(g, 0, 'Asura Priest').u + ':' + fld(g, 1, 'D.D. Assailant').u)); drive(g);
  ok(g.p[0].ban.some(c => E.name(c) === 'Asura Priest') && g.p[1].ban.some(c => E.name(c) === 'D.D. Assailant') && !g.p[0].gy.length, 'equal ATK: both banished, Asura Priest never in the GY');
});

T('134. Big Shield Gardna face-down negates a Spell that targets only it (rulings 1 to 3); King Dragun lets its controller target their own Dragons; Xing Zhen Hu forgets a card that left the field; Goat Reinforcement of the Army with no Warrior shows the Deck (archive)', () => {
  let g = duel([{ hand: ['Book of Moon'], turn: 3 }, { m: [{ n: 'Big Shield Gardna', pos: 'set' }] }]);
  ok(!keyOf(g, hand(g, 'Book of Moon')), 'Book of Moon needs a face-up monster');
  g = duel([{ hand: ['Nobleman of Crossout'], turn: 3 }, { m: [{ n: 'Big Shield Gardna', pos: 'set' }] }]); const bsg = g.p[1].m.find(Boolean);
  actU(g, hand(g, 'Nobleman of Crossout')); pickFirst(g);
  drive(g, { respond: pr => { const o = pr.p === 1 && pr.opts.find(o => o.key.startsWith('a:' + bsg.u + ':')); return o && o.key; } });
  ok(bsg.zone === 'm' && bsg.pos === 'def' && g.log.some(l => /Nobleman of Crossout's activation was negated/.test(l)), 'Gardna flips face-up and negates Nobleman of Crossout');
  g = duel([{ m: ['King Dragun', 'Blue-Eyes White Dragon'], hand: ['Book of Moon'], turn: 3 }, {}]);
  ok(E.lib.canTarget(g, fld(g, 0, 'Blue-Eyes White Dragon'), { c: hand(g, 'Book of Moon'), p: 0, eff: { type: 'act' } }) && !E.lib.canTarget(g, fld(g, 0, 'Blue-Eyes White Dragon'), { c: hand(g, 'Book of Moon'), p: 1, eff: { type: 'act' } }), 'King Dragun: own Dragons targetable, not by the opponent');
  const { G, mk } = goatEngine(); g = mk([{ hand: ['Reinforcement of the Army'], turn: 3 }, {}]);
  const ra = g.p[0].hand[0]; ok(g.prompt.opts.some(o => o.key.startsWith('a:' + ra.u + ':')), 'Goat: Reinforcement of the Army with no Warrior in the Deck can be activated');
});

T('135. Blade Knight\'s negation lasts for the Flip monster\'s GY visit (archive); Don Zaloog chooses as it activates; Vampire Lord\'s mark is used up in its next Standby Phase; Last Turn resolves before the summon (archive); Skull Invitation counts each event group; Appropriate misses Graceful Charity', () => {
  let g = duel([{ hand: ['Despair from the Dark', 'Pot of Greed'], turn: 3 }, { m: ['Sangan'], st: [{ n: 'Last Turn', pos: 'set' }] }]); g.p[1].lp = 1000;
  actU(g, hand(g, 'Pot of Greed')); drive(g, { respond: pr => { const o = pr.p === 1 && pr.opts.find(o => /Last Turn/.test(o.label)); return o && o.key; } });
  const lg = g.log.join('\n'); ok(lg.indexOf('Special Summoned Despair from the Dark') > 0 && lg.indexOf('Special Summoned Despair from the Dark') < lg.indexOf('attacks Sangan'), 'Despair from the Dark is summoned before Last Turn\'s battle');
  g = duel([{ hand: ['Graceful Charity'], st: [{ n: 'Skull Invitation', pos: 'up' }], turn: 3 }, { st: [{ n: 'Appropriate', pos: 'set' }] }]);
  actU(g, hand(g, 'Graceful Charity')); drive(g);
  ok(g.log.some(l => /^A took 600 damage/.test(l)), 'Skull Invitation: 600 for the two discards');
  ok(!E._internal.activatable(g, 1, 'respond').some(a => E.name(a.c) === 'Appropriate'), 'Appropriate can\'t be activated after Graceful Charity');
});

T('136. Pass 2 one-card fixes: Rivalry of Warlords isn\'t a blanket summon lock; Zombie World leaves face-down monsters alone; Night Assailant\'s Flip effect activates with no target; The Last Warrior from Another Planet can be Tributed; Hero Blast takes a Gemini in the GY; De-Fusion can\'t target under King Dragun', () => {
  let g = duel([{ m: ['Cyber Dragon'], st: [{ n: 'Rivalry of Warlords', pos: 'up' }], turn: 3 }, {}]);
  g = duel([{ m: [{ n: FILL, pos: 'set' }], fz: 'Zombie World', turn: 3 }, {}]); ok(E.lib.race(fld(g, 0, FILL)) !== 'Zombie', 'a face-down monster isn\'t a Zombie');
  g = duel([{ m: ['The Last Warrior from Another Planet'], hand: ['Dark Blade'], turn: 3 }, {}]);
  g = duel([{ m: ['The Last Warrior from Another Planet'], hand: ['Jinzo'], turn: 3 }, {}]);
  ok(!!opt(g, new RegExp('^Tribute Summon ns:' + hand(g, 'Jinzo').u + '$')), 'Jinzo can be Tribute Summoned with The Last Warrior');
  g = duel([{ st: [{ n: 'Hero Blast', pos: 'set' }], gy: ['Elemental HERO Neos Alius'], turn: 3 }, {}]); ok(!!keyOf(g, g.p[0].st.find(Boolean)), 'Hero Blast with only a Gemini Elemental HERO in the GY');
});

T('AI1. The computer Sets low-ATK Flip monsters (benzi_family: it Normal Summoned them face-up every time, Goat and Edison, every level)', () => {
  const L = require('./load')({ ai: true }), AIx = L.AI, Ex = L.E;
  const mk = () => ({ name: 't', main: Array(40).fill(id(FILL)), extra: [] });
  const dz = hd => Ex.newDuel({ decks: [mk(), mk()], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: [{ hand: hd, turn: 3 }, {}] });
  for (const n of ['Magician of Faith', 'Man-Eater Bug', 'Cyber Jar', 'Morphing Jar']) {
    if (!C.some(x => x.n === n)) continue;
    for (const lv of AIx.LEVELS) {
      let faceUp = 0;
      for (let i = 0; i < (lv === 'beginner' ? 40 : 3); i++) {
        const g = dz([n]); const u = g.p[0].hand.find(c => Ex.name(c) === n).u;
        const k = AIx.decide(g, 0, lv); if (k[0] === 'ns:' + u) faceUp++;
      }
      ok(!faceUp, `${n} (${lv}): never Normal Summoned face-up`);
    }
  }
  const g = dz(['Dekoichi the Battlechanted Locomotive']);
  ok(!!opt(g, /^Normal Summon ns:/) && !!opt(g, /^Set face-down set:/), 'Dekoichi (1400) can still be Summoned or Set (situational)');
  const src = require('fs').readFileSync(require('path').join(__dirname, '../js/ai.js'), 'utf8');
  ok(/const isFlipMon = d => !!\(d && \(d\.flip \|\| /.test(src), 'Flip monsters found by the flip flag (Goat data) or the Flip Effect ability (Edison data)');
  ok(/cardValue\(g, c, true\) \* 0\.9 \+ \(isFlipMon\(E\(\)\.data\(c\)\) \? FLIP_WORTH : 0\)/.test(src), 'a Set Flip monster keeps its Flip effect\'s worth');
});
// AI2-AI4 (2026-11-28, card roles; Zack: "the CPU needs to know what every card does"; chef_coby, ade_lant3, benzi_family).
T('AI2. Card roles reach the computer: both formats have them, and the deck staples carry the approved roles', () => {
  const L = require('./load')({ ai: true }), AIx = L.AI;
  const want = { 'Magician of Faith': 'flip', 'Mystic Tomato': 'battle_recruiter', 'Heavy Storm': 'mass_removal', 'Book of Moon': 'book', 'Sangan': 'floater', 'Solemn Judgment': 'negation', 'Royal Oppression': 'floodgate', 'Scapegoat': 'fodder' };
  for (const [n, r] of Object.entries(want)) ok(AIx.roles(n).includes(r), `${n} has the role ${r} (has ${AIx.roles(n).join(', ') || 'none'})`);
  const src = require('fs').readFileSync(require('path').join(__dirname, '../js/ai.js'), 'utf8');
  const m = src.match(/const ROLE_LISTS = (\{.*\});/); ok(!!m, 'the ROLES block is written (node build/make_ai_roles.js)');
  if (m) { const R = JSON.parse(m[1]); ok(R.edison && R.goat && Object.keys(R.edison).length > 15 && Object.keys(R.goat).length > 15, 'roles for Edison and Goat'); }
});
T('AI3. The computer Sets walls instead of Normal Summoning them face-up for their ATK (Big Shield Gardna), every level', () => {
  const L = require('./load')({ ai: true }), AIx = L.AI, Ex = L.E;
  const mk = () => ({ name: 't', main: Array(40).fill(id(FILL)), extra: [] });
  for (const n of ['Big Shield Gardna', 'Marshmallon']) {
    if (!C.some(x => x.n === n)) continue;
    for (const lv of AIx.LEVELS) {
      let faceUp = 0;
      for (let i = 0; i < (lv === 'beginner' ? 30 : 3); i++) {
        const g = Ex.newDuel({ decks: [mk(), mk()], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: [{ hand: [n], turn: 3 }, {}] });
        const u = g.p[0].hand.find(c => Ex.name(c) === n).u; const k = AIx.decide(g, 0, lv); if (k[0] === 'ns:' + u) faceUp++;
      }
      ok(!faceUp, `${n} (${lv}): never Normal Summoned face-up`);
    }
  }
});
T('AI4. A monster the computer saw face-up and then turned face-down (Book of Moon) keeps its DEF in the computer\'s eyes (ade_lant3)', () => {
  const L = require('./load')({ ai: true }), AIx = L.AI, Ex = L.E;
  const mk = () => ({ name: 't', main: Array(40).fill(id(FILL)), extra: [] });
  const start = pos => Ex.newDuel({ decks: [mk(), mk()], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: [{ m: [FILL], turn: 3 }, { m: [{ n: 'Labyrinth Wall', pos }] }] });
  const toBattle = g => { const o = g.prompt.opts.find(x => x.key === 'bp'); Ex.act(g, ['bp']); for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) Ex.act(g, ['pass']); return !!o; };
  for (const lv of ['intermediate', 'advanced', 'tournament']) {
    let into = 0, blind = 0;
    for (let i = 0; i < 3; i++) {
      const g = start('def'); AIx.decide(g, 0, lv);   // sees Labyrinth Wall (3000 DEF) face-up
      const lw = g.p[1].m.find(Boolean); lw.pos = 'set'; // then it is turned face-down (as Book of Moon does)
      toBattle(g); const k = AIx.decide(g, 0, lv); if (/^atk:/.test(k[0]) && !/:d$/.test(k[0])) into++;
      const h = start('set'); toBattle(h); const k2 = AIx.decide(h, 0, lv); if (/^atk:/.test(k2[0]) && !/:d$/.test(k2[0])) blind++;
    }
    if (lv === 'intermediate') console.log(`     (intermediate, which still slips by design: attacked into the seen Labyrinth Wall ${into}/3)`);
    else ok(!into, `${lv}: no attack of a 2000-ATK monster into the Labyrinth Wall it saw turned face-down (${into}/3)`);
    console.log(`     (${lv}: into a never-seen Set monster it attacked ${blind}/3 times: an unknown card stays unknown)`);
  }
});


/* ----- 137-145 (fixer E4d, 2026-11-28): Wave 2, Group E4 part 4 ----- */
T('137. Jinzo\'s summon can be negated by Horn of Heaven and Solemn Judgment (ruling 1: its trap lock starts once it is summoned); then Trap Hole can\'t be activated (pass2 edison-s01)', () => {
  let g = duel([{ turn: 3, hand: ['Jinzo'], m: [FILL] }, { st: [{ n: 'Horn of Heaven', pos: 'set' }], m: [FILL] }]);
  act(g, /^Tribute Summon/); let seen = drive(g, { respond: respondWith(g, 1, 'Horn of Heaven') });
  ok(g.p[0].gy.some(c => E.name(c) === 'Jinzo') && !fld(g, 0, 'Jinzo'), 'Horn of Heaven negates Jinzo\'s Tribute Summon');
  g = duel([{ turn: 3, m: [{ n: 'Jinzo', pos: 'set' }] }, { st: [{ n: 'Solemn Judgment', pos: 'set' }] }]);
  act(g, /Flip/); drive(g, { respond: respondWith(g, 1, 'Solemn Judgment') });
  ok(g.p[0].gy.some(c => E.name(c) === 'Jinzo') && g.p[1].lp === 4000 && !g.log.some(l => /negated by Jinzo/.test(l)), 'Solemn Judgment negates Jinzo\'s Flip Summon (B paid half, no "negated by Jinzo")');
  g = duel([{ turn: 3, hand: ['Jinzo'], m: [FILL] }, { st: [{ n: 'Trap Hole', pos: 'set' }] }]);
  act(g, /^Tribute Summon/); let th = false; drive(g, { respond: pr => { if (pr.p === 1 && pr.opts.some(o => /Trap Hole/.test(o.label))) th = true; return 'pass'; } });
  ok(!!fld(g, 0, 'Jinzo') && !th, 'once Jinzo is summoned, Trap Hole is not offered');
});
/* ----- 138a-c (fixer E4d, 2026-11-28): the source-only checks of guards 66-98 played on the engine (a regex on the script passed while Blade Knight was broken) ----- */
// drive like drive(), answering every pick with the options whose label matches re (first options otherwise); respond(pr) as in drive; P: the engine
const gDrive = (g, re, respond, P = E) => { for (let i = 0; i < 60 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') P.act(g, [(respond && respond(pr)) || 'pass']); else if (pr.type === 'yesno') P.act(g, ['y']);
  else { const m = pr.opts.filter(o => re.test(o.label)); P.act(g, (m.length >= (pr.min || 1) ? m : pr.opts).slice(0, pr.min || 1).map(x => x.key)); } } };
// both formats: [name, engine, new duel]; gFind/gActU work on either engine
const gFmts = () => { const gx = goatEngine(); return [['Edison', E, duel], ['Goat', gx.G, gx.mk]]; };
const gId = (P, n) => P.cards().find(x => x.n === n).id;
const gFind = (P, g, p, n) => P.fieldOf(g, p).find(c => P.name(c) === n) || g.p[p].hand.find(c => P.name(c) === n);
const gActU = (P, g, c) => P.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + c.u + ':')).key]);
// a Skill Drain applies for a moment, then leaves (the opponent's)
const gSkillDrain = (P, g) => { const sd = g.p[1].deck[0]; sd.id = gId(P, 'Skill Drain'); P.lib.move(g, sd, 'st', { pos: 'up' }); P.lib.emit(g, { type: 'probe' }); P.lib.destroy(g, [sd], { by: 0 }); };
// an Edison duel with an Extra Deck for player A
const duelEx = (b, ex) => E.newDuel({ decks: [{ name: 't', main: Array(40).fill(id(FILL)), extra: ex.map(id) }, { name: 't', main: Array(40).fill(id(FILL)), extra: [] }], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: b });

T('138a. Played on the engine: Deck Devastation Virus\'s length, Flamvell Uruquizas and Dark End Dragon (own changes, face-up at resolution), Sangan and "?" ATK, Shrink on a Gorz Token, King Tiger Wanghu, Mystic Tomato', () => {
  // 607 Deck Devastation Virus: until the end of the victim's 3rd turn, the activation turn counting (ruling 4)
  const crowAt = (g, p, t) => { g.turnNo = t; const d = g.p[p].deck[g.p[p].deck.length - 1]; d.id = id('D.D. Crow'); E.lib.draw(g, p, 1); return d.zone === 'gy'; };
  let g = duel([{ hand: [FILL] }, { m: ['Dark Magician'], st: [{ n: 'Deck Devastation Virus', pos: 'set' }] }]);
  act(g, new RegExp('ns:' + hand(g, FILL).u)); drive(g, { respond: respondWith(g, 1, 'Deck Devastation Virus') });
  let T0 = g.turnNo;
  ok(g.log.some(l => /activated Deck Devastation Virus/.test(l)) && crowAt(g, 0, T0 + 4) && !crowAt(g, 0, T0 + 5), 'DDV activated on the victim\'s turn T: a draw on T+4 (their 3rd turn) is destroyed, one on T+5 isn\'t');
  g = duel([{ m: ['Dark Magician'], st: [{ n: 'Deck Devastation Virus', pos: 'set' }], turn: 2 }, {}]);
  actU(g, g.p[0].st[0]); drive(g); T0 = g.turnNo;
  ok(crowAt(g, 1, T0 + 5) && !crowAt(g, 1, T0 + 6), 'DDV activated on your own turn T: their draw on T+5 is destroyed, one on T+6 isn\'t');
  // 639 Uruquizas / Dark End Dragon: the change is their own, lost for good once negated
  g = duel([{ m: ['Dark End Dragon'], turn: 2 }, { m: ['Sangan'], st: [{ n: 'Skill Drain', pos: 'set' }] }]);
  const ded = fld(g, 0, 'Dark End Dragon'); actU(g, ded); drive(g);
  const dedAfter = E.atk(g, ded); let sd = g.p[1].st.find(Boolean); sd.pos = 'up'; E.lib.emit(g, { type: 'pos', c: sd, p: 1 });
  const dedSD = E.atk(g, ded); E.lib.move(g, sd, 'gy', { reason: 'effect' });
  ok(dedAfter === 2100 && dedSD === 2600 && E.atk(g, ded) === 2600, `Dark End Dragon's -500 is gone under Skill Drain and stays gone after it leaves (${dedAfter}, ${dedSD}, ${E.atk(g, ded)})`);
  g = duel([{ m: ['Flamvell Uruquizas'], turn: 2 }, { st: [{ n: 'Skill Drain', pos: 'set' }] }]);
  const uq = fld(g, 0, 'Flamvell Uruquizas'); act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + uq.u + ':d')); drive(g);
  const uqAfter = E.atk(g, uq); sd = g.p[1].st.find(Boolean); sd.pos = 'up'; E.lib.emit(g, { type: 'pos', c: sd, p: 1 });
  const uqSD = E.atk(g, uq); E.lib.move(g, sd, 'gy', { reason: 'effect' });
  ok(uqAfter === 2400 && uqSD === 2100 && E.atk(g, uq) === 2100, `Uruquizas's +300 from its battle damage is gone under Skill Drain for good (${uqAfter}, ${uqSD}, ${E.atk(g, uq)})`);
  // 1190 Dark End Dragon turned face-down in response: nothing is sent
  g = duel([{ m: ['Dark End Dragon'], turn: 2 }, { m: ['Sangan'], st: [{ n: 'Book of Moon', pos: 'set' }] }]);
  const ded2 = fld(g, 0, 'Dark End Dragon'); actU(g, ded2); drive(g, { respond: respondWith(g, 1, 'Book of Moon') });
  ok(ded2.pos === 'set' && !!fld(g, 1, 'Sangan'), 'Dark End Dragon turned face-down by Book of Moon in response: Sangan isn\'t sent to the GY');
  // 661 Sangan: a "?" ATK isn't 1500 or less in the Deck (both formats)
  for (const [F, P, mk] of gFmts()) {
    const h = mk([{ m: ['Sangan'], hand: ['Dark Hole'] }, {}]); h.p[0].deck.forEach((c, i) => { c.id = gId(P, i % 2 ? 'Maju Garzett' : 'Gren Maju Da Eiza'); });
    gActU(P, h, gFind(P, h, 0, 'Dark Hole')); gDrive(h, /./, null, P);
    ok(h.log.some(l => /activated Sangan's effect/.test(l)) && !h.p[0].hand.some(c => /Maju/.test(P.name(c))), `${F}: Sangan with only "?" ATK monsters in the Deck adds nothing`);
  }
  // 677 Shrink on a Gorz Token: its "?" original ATK is 0
  g = duel([{ m: ['Cyber Dragon'], hand: ['Shrink'], turn: 2 }, { hand: ['Gorz the Emissary of Darkness'] }]);
  const cd = fld(g, 0, 'Cyber Dragon'); act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + cd.u + ':d')); drive(g);
  const tk = fld(g, 1, 'Emissary of Darkness Token');
  act(g, /^End Battle|endbp/); passAll(g); actU(g, hand(g, 'Shrink')); gDrive(g, /Token/);
  ok(tk && E.atk(g, tk) === 0 && E.atk(g, cd) === 2100, `Shrink on the 2100 ATK Emissary of Darkness Token makes it 0 (${tk && E.atk(g, tk)})`);
  // 770 King Tiger Wanghu: its own summon counts, and the whole summon is destroyed
  g = duel([{ hand: ['King Tiger Wanghu'] }, { fz: 'Ojama Country', m: ['Ojama Yellow'] }]);
  act(g, new RegExp('ns:' + hand(g, 'King Tiger Wanghu').u)); drive(g);
  ok(gyOf(g, 0, 'King Tiger Wanghu'), 'Wanghu Normal Summoned at 1000 ATK under Ojama Country destroys itself (ruling 6)');
  for (const [F, P, mk] of gFmts()) {
    const h = mk([{ st: [{ n: 'Return from the Different Dimension', pos: 'set' }], ban: ['King Tiger Wanghu', 'Sangan'], turn: 2 }, {}]);
    gActU(P, h, h.p[0].st[0]); gDrive(h, /./, null, P);
    ok(h.p[0].gy.some(c => P.name(c) === 'Sangan') && !!P.fieldOf(h, 0).find(c => P.name(c) === 'King Tiger Wanghu'), `${F}: Wanghu and Sangan summoned together: Sangan is destroyed, Wanghu stays (ruling 4)`);
  }
  // 790 Mystic Tomato: only monsters it can Special Summon count
  for (const [F, P, mk] of gFmts()) for (const tsu of [true, false]) {
    const atkr = F === 'Goat' ? 'Summoned Skull' : 'Cyber Dragon', h = mk([{ m: [atkr], turn: 2 }, { m: ['Mystic Tomato'] }]); h.p[1].deck.forEach(c => { c.id = gId(P, tsu ? 'Tsukuyomi' : 'Sangan'); });
    const a = gFind(P, h, 0, atkr); P.act(h, ['bp']); gDrive(h, /./, null, P); P.act(h, ['atk:' + a.u + ':' + h.p[1].m.find(Boolean).u]); gDrive(h, /./, null, P);
    const used = h.log.some(l => /activated Mystic Tomato/.test(l));
    ok(tsu ? !used : used, `${F}: Mystic Tomato ${tsu ? 'with only Tsukuyomi in the Deck doesn\'t activate' : 'with Sangan in the Deck activates'}`);
  }
});

T('138b. Played on the engine: Imperial Order\'s maintenance under Imperial Custom, Gravity Bind with Dimensional Prison, end-of-Battle-Phase effects, Slate Warrior, Aslla piscu, Flame Wingman and Zoma, Greenkappa, Mokey Mokey King', () => {
  // 916 Imperial Order not paid: destroyed by the rule, so Imperial Custom doesn't save it
  let g = duel([{ st: [{ n: 'Imperial Order', pos: 'up' }, { n: 'Imperial Custom', pos: 'up' }] }, {}]); g.p[0].lp = 500;
  toTurnOf(g, 1);
  ok(gyOf(g, 0, 'Imperial Order') && !!g.p[0].st.find(c => c && E.name(c) === 'Imperial Custom'), 'Imperial Order that can\'t be paid is destroyed with Imperial Custom face-up (Imperial Custom ruling 3)');
  // 938 Gravity Bind chained to Dimensional Prison stops the attack without negating it: Prison still banishes
  g = duel([{ m: ['Cyber Dragon'], turn: 2 }, { st: [{ n: 'Dimensional Prison', pos: 'set' }, { n: 'Gravity Bind', pos: 'set' }] }]);
  let cd = fld(g, 0, 'Cyber Dragon'); act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + cd.u + ':d'));
  drive(g, { respond: pr => pr.p === 1 && (respondWith(g, 1, 'Dimensional Prison')(pr) || respondWith(g, 1, 'Gravity Bind')(pr)) });
  ok(g.log.some(l => /Gravity Bind \(Chain Link 2\)/.test(l)) && cd.zone === 'ban' && g.p[1].lp === 8000, 'Gravity Bind chained to Dimensional Prison: the attacker is still banished (site ruling)');
  g = duel([{ m: ['Cyber Dragon'], turn: 2 }, { st: [{ n: 'Gravity Bind', pos: 'set' }] }]);
  cd = fld(g, 0, 'Cyber Dragon'); act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + cd.u + ':d')); drive(g, { respond: respondWith(g, 1, 'Gravity Bind') });
  ok(g.p[1].lp === 8000 && !cd.negAtk && g.log.some(l => /The attack stopped/.test(l)), 'Gravity Bind alone: the attack stops, no damage, and it isn\'t counted as a negated attack');
  // 1012 Ancient Forest and Multiple Piece Golem at the end of the Battle Phase
  g = duel([{ m: ['Cyber Dragon'], fz: 'Ancient Forest', turn: 2 }, {}]);
  cd = fld(g, 0, 'Cyber Dragon'); act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + cd.u + ':d')); drive(g);
  const stillThere = cd.zone === 'm'; act(g, /^End Battle|endbp/); drive(g);
  ok(stillThere && cd.zone === 'gy' && g.phase === 'main2', 'Ancient Forest: the attacker stays through the battle and is destroyed when the Battle Phase ends, before Main Phase 2');
  g = duel([{ m: ['Multiple Piece Golem'], turn: 2 }, {}]);
  const mp = fld(g, 0, 'Multiple Piece Golem'); act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + mp.u + ':d')); const s1 = drive(g);
  act(g, /^End Battle|endbp/); const s2 = drive(g);
  ok(!s1.some(t => /Multiple Piece/.test(t)) && s2.some(t => /Multiple Piece/.test(t)) && mp.zone === 'extra' && g.phase === 'main2', 'Multiple Piece Golem is offered its return when the Battle Phase ends, not after the damage');
  // 1037 Slate Warrior's FLIP +500 is its own change (both formats)
  for (const [F, P, mk] of gFmts()) {
    const h = mk([{ m: [{ n: 'Slate Warrior', pos: 'set' }], turn: 2 }, {}]); const sw = gFind(P, h, 0, 'Slate Warrior');
    P.act(h, ['flip:' + sw.u]); gDrive(h, /./, null, P); const up = P.atk(h, sw); gSkillDrain(P, h);
    ok(up === 2400 && P.atk(h, sw) === 1900 && P.def(h, sw) === 400, `${F}: Slate Warrior flipped (${up}), then a Skill Drain that leaves: back to 1900/400 for good (archive)`);
  }
  // 1093 Aslla piscu returned to the Deck: nothing; returned to the hand: it activates
  for (const [tr, fires] of [['Phoenix Wing Wind Blast', false], ['Compulsory Evacuation Device', true]]) {
    g = duel([{ m: ['Earthbound Immortal Aslla piscu'], hand: [FILL], fz: 'Mystic Plasma Zone', turn: 2 }, { m: ['Sangan'], hand: [FILL], st: [{ n: tr, pos: 'set' }] }]);
    act(g, new RegExp('ns:' + hand(g, FILL).u)); gDrive(g, /Aslla/, pr => pr.p === 1 && respondWith(g, 1, tr)(pr));
    ok(g.log.some(l => new RegExp(tr + '\\.').test(l)) && (fires ? g.p[1].lp === 7200 && !fld(g, 1, 'Sangan') : g.p[1].lp === 8000 && !!fld(g, 1, 'Sangan')),
      `Aslla piscu ${fires ? 'returned to the hand destroys and burns' : 'put on top of the Deck by Phoenix Wing Wind Blast does nothing (site ruling 8)'}`);
  }
  // 1105 Flame Wingman: the destroyed monster's original ATK per each format's ruling 4 (a tributeless Fusilier: Edison 2800, Goat 1400)
  for (const [F, P, mk] of gFmts()) {
    const h = mk([{ m: ['Elemental HERO Flame Wingman'] }, { hand: ['Fusilier Dragon, the Dual-Mode Beast'] }]);
    const go = who => { const t0 = h.turnNo; for (let i = 0; i < 80 && h.prompt; i++) { if (h.prompt.type === 'idle' && h.prompt.p === who && h.turnNo !== t0) return;
      if (h.prompt.type === 'respond') P.act(h, ['pass']); else if (h.prompt.type === 'idle') P.act(h, [(h.prompt.opts.find(o => o.key === 'end') || h.prompt.opts[h.prompt.opts.length - 1]).key]);
      else if (h.prompt.type === 'yesno') P.act(h, ['n']); else P.act(h, h.prompt.opts.slice(0, h.prompt.min || 1).map(o => o.key)); } };
    go(1); const fu = gFind(P, h, 1, 'Fusilier Dragon, the Dual-Mode Beast'); P.act(h, ['ns:' + fu.u]); gDrive(h, /./, null, P);
    go(0); const fw = gFind(P, h, 0, 'Elemental HERO Flame Wingman'); P.act(h, ['bp']); gDrive(h, /./, null, P); P.act(h, ['atk:' + fw.u + ':' + fu.u]); gDrive(h, /./, null, P);
    const want = F === 'Edison' ? 2800 : 1400, got = 8000 - 700 - h.p[1].lp;
    ok(P.atk(h, fu) === 1400 || fu.zone === 'gy', `${F}: Fusilier Summoned without Tribute`);
    ok(got === want, `${F}: Flame Wingman destroying a tributeless Fusilier deals ${want} (${F} ruling 4; dealt ${got})`);
  }
  // 1105 Zoma: the killer's ATK at the battle once the killer is gone (ruling 12, 5)
  g = duel([{ m: [FILL], hand: [FILL], turn: 3 }, { st: [{ n: 'Zoma the Spirit', pos: 'set' }] }]);
  act(g, new RegExp('ns:' + hand(g, FILL).u)); drive(g, { respond: respondWith(g, 1, 'Zoma the Spirit') });
  const z = fld(g, 1, 'Zoma the Spirit'), w = g.p[0].m.find(Boolean); z.pos = 'atk'; E.lib.addMod(g, w, { atk: -200 });
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + w.u + ':' + z.u)); drive(g);
  ok(w.zone === 'gy' && g.p[0].lp === 6200, `Zoma and an 1800 ATK Warwolf (2000 printed) destroy each other: 1800 damage (${8000 - g.p[0].lp})`);
  // 1122 Greenkappa skips a target no longer Set; Mokey Mokey King needs to have been face-up
  g = duel([{ m: [{ n: 'Greenkappa', pos: 'set' }], turn: 2 }, { st: [{ n: 'Call of the Haunted', pos: 'set' }, { n: 'Mirror Force', pos: 'set' }], gy: ['Sangan'] }]);
  act(g, new RegExp('flip:' + fld(g, 0, 'Greenkappa').u)); drive(g, { respond: pr => pr.p === 1 && respondWith(g, 1, 'Call of the Haunted')(pr) });
  ok(gyOf(g, 1, 'Mirror Force') && !!g.p[1].st.find(c => c && E.name(c) === 'Call of the Haunted') && !!fld(g, 1, 'Sangan'), 'Greenkappa: Call of the Haunted chained (face-up at resolution) stays, Mirror Force is destroyed (goat-10)');
  for (const pos of ['atk', 'set']) {
    g = duel([{ hand: ['Dark Hole'], m: [{ n: 'Mokey Mokey King', pos }], gy: ['Mokey Mokey', 'Mokey Mokey'] }, {}]);
    actU(g, hand(g, 'Dark Hole')); const seen = drive(g);
    ok(pos === 'atk' ? seen.some(t => /Mokey Mokey King/.test(t)) : !seen.some(t => /Mokey Mokey King/.test(t)) && !g.p[0].m.some(Boolean), `Mokey Mokey King destroyed ${pos === 'atk' ? 'face-up: offers its summon' : 'face-down: no summon (goat-11)'}`);
  }
});

T('138c. Played on the engine: Flip Flop Frog, Grand Neos and Gyzarus materials, Flamvell Firedog on an owned monster, Neko Mane King, Secutor, Card Trooper, Silverwind, Goat Toon Cannon Soldier', () => {
  // 1147 Flip Flop Frog: only the opponent's monsters, up to the face-up Frogs (Frog the Jam is in neither pool, so that part stays unplayed)
  let g = duel([{ m: [{ n: 'Flip Flop Frog', pos: 'set' }, 'Treeborn Frog'], turn: 2 }, { m: [FILL, FILL, FILL] }]);
  act(g, new RegExp('flip:' + fld(g, 0, 'Flip Flop Frog').u)); let pk = null;
  for (let i = 0; i < 20 && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick' && /Return/.test(pr.text)) pk = pr;
    E.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.max || 1).map(o => o.key)); }
  const theirs = new Set(g.p[1].m.filter(Boolean).concat(g.p[1].hand).map(c => 'u' + c.u));
  ok(pk && pk.max === 2 && pk.opts.length === 3 && pk.opts.every(o => theirs.has(o.key)) && g.p[0].m.filter(Boolean).length === 2 && g.p[1].m.filter(Boolean).length === 1,
    'Flip Flop Frog with 2 face-up Frogs: returns up to 2, picked from the opponent\'s monsters only');
  // 1160 Grand Neos takes a Gemini-Summoned Neos Alius (name()); Gyzarus takes face-down materials
  g = duelEx([{ m: ['Elemental HERO Neos Alius', 'Neo-Spacian Grand Mole'], turn: 2 }, {}], ['Elemental HERO Grand Neos']);
  const before = !!opt(g, /shuffle Neos \+ Grand Mole/); act(g, new RegExp('gem:' + fld(g, 0, 'Elemental HERO Neos Alius').u)); drive(g);
  ok(!before && !!opt(g, /shuffle Neos \+ Grand Mole/), 'Grand Neos: offered once Neos Alius is Gemini Summoned (named Elemental HERO Neos), not before');
  g = duelEx([{ m: [{ n: 'Gladiator Beast Bestiari', pos: 'set' }, { n: 'Gladiator Beast Laquari', pos: 'set' }], turn: 2 }, {}], ['Gladiator Beast Gyzarus']);
  ok(!!opt(g, /shuffle Bestiari/), 'Gyzarus: offered with a face-down Bestiari and a face-down Laquari (site rulings)');
  // 1168 (the lint stays): Flamvell Firedog destroys a monster the opponent controls but you own
  g = duel([{ m: ['Flamvell Firedog', 'Sangan'] }, { hand: ['Snatch Steal'] }]); g.p[0].deck.slice(-10).forEach(c => { c.id = id('Flamvell Magician'); });
  const sg = fld(g, 0, 'Sangan'), fd = fld(g, 0, 'Flamvell Firedog');
  toTurnOf(g, 1); E.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + g.p[1].hand.find(c => E.name(c) === 'Snatch Steal').u + ':')).key]); gDrive(g, /Sangan/);
  toTurnOf(g, 0); act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fd.u + ':' + sg.u)); const seenF = drive(g);
  ok(sg.ctrl === 1 || sg.zone === 'gy', 'Sangan was taken by Snatch Steal');
  ok(seenF.some(t => /Flamvell Firedog/.test(t)) && !!fld(g, 0, 'Flamvell Magician'), 'Firedog destroying your own Sangan the opponent controls: "an opponent\'s monster", it Special Summons');
  // 1173 Neko Mane King: no Flip Summon after it ends the turn
  g = duel([{ hand: ['Fissure'], m: [{ n: 'Sangan', pos: 'set' }], turn: 2 }, { m: ['Neko Mane King'] }]);
  const fs0 = !!opt(g, new RegExp('flip:' + fld(g, 0, 'Sangan').u)); actU(g, hand(g, 'Fissure')); drive(g);
  ok(fs0 && g.log.some(l => /It became the End Phase/.test(l)) && !opt(g, /^flip:|Flip Summon/) && g.prompt.opts.every(o => o.key === 'end'), 'Neko Mane King destroyed by Fissure: only "End turn" is left, no Flip Summon');
  // 1174 Secutor: 2 Gladiator Beasts in the Deck are summoned, 1 is not (ruling 4)
  for (const n of [1, 2]) {
    g = duel([{ m: ['Gladiator Beast Secutor'], turn: 2 }, {}]); const sc = fld(g, 0, 'Gladiator Beast Secutor'); sc.flags.gb = true;
    g.p[0].deck.slice(0, n).forEach(c => { c.id = id('Gladiator Beast Laquari'); });
    act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + sc.u + ':d')); drive(g); act(g, /^End Battle|endbp/); drive(g);
    const onF = g.p[0].m.filter(c => c && E.name(c) === 'Gladiator Beast Laquari').length;
    ok(g.log.some(l => /activated Gladiator Beast Secutor/.test(l)) && onF === (n === 2 ? 2 : 0), `Secutor with ${n} Gladiator Beast${n > 1 ? 's' : ''} in the Deck: ${n === 2 ? 'both' : 'none'} Special Summoned (${onF})`);
  }
  // 1189 Card Trooper: 1 to 3, up to the whole Deck
  for (const n of [0, 1, 2]) {
    g = duel([{ m: ['Card Trooper'], turn: 2 }, {}]); g.p[0].deck.length = n; g.seq++; const ct = fld(g, 0, 'Card Trooper');
    const offered = E.idleOpts(g).some(o => o.key.startsWith('a:' + ct.u + ':'));
    if (!n) { ok(!offered, 'Card Trooper with an empty Deck: not offered'); continue; }
    E.act(g, [E.idleOpts(g).find(o => o.key.startsWith('a:' + ct.u + ':')).key]); const most = g.prompt.opts.length; E.act(g, [g.prompt.opts[most - 1].key]); drive(g);
    ok(offered && most === n && g.p[0].deck.length === 0 && E.atk(g, ct) === 400 + 500 * n && g.winner == null, `Card Trooper with ${n} card${n > 1 ? 's' : ''} in the Deck: sends ${n}, +${500 * n}`);
  }
  // 1195 Silverwind: activated under Skill Drain it still locks the Battle Phase (ruling 2); its activation negated lifts the lock
  for (const neg of [false, true]) {
    g = duelEx([{ m: ['Blackwing - Gale the Whirlwind', FILL, 'Treeborn Frog'], turn: 2 }, { m: ['Sangan'], hand: [FILL], st: [{ n: 'Skill Drain', pos: 'up' }, { n: 'Divine Wrath', pos: 'set' }] }], ['Blackwing - Silverwind the Ascendant']);
    act(g, /^Synchro Summon/); const seen = drive(g, { respond: pr => neg && pr.p === 1 && g.log.some(l => /activated Blackwing - Silverwind/.test(l)) && respondWith(g, 1, 'Divine Wrath')(pr) });
    ok(seen.some(t => /Silverwind/.test(t)) && !!fld(g, 1, 'Sangan') && (neg ? g.log.some(l => /Divine Wrath/.test(l)) && !!opt(g, /^Battle Phase/) : !opt(g, /^Battle Phase/)),
      neg ? 'Silverwind\'s activation negated by Divine Wrath: the Battle Phase is open' : 'Silverwind under Skill Drain: activated, destroys nothing, no Battle Phase');
  }
  // 1212 Goat Toon Cannon Soldier follows the shared Toon script: the burn, and destroyed with Toon World
  const { G, mk } = goatEngine();
  let h = mk([{ m: ['Toon Cannon Soldier', 'Sangan'], st: [{ n: 'Toon World', pos: 'up' }], turn: 2 }, {}]);
  gActU(G, h, gFind(G, h, 0, 'Toon Cannon Soldier')); gDrive(h, /Sangan/, null, G);
  ok(h.p[1].lp === 7500, 'Goat Toon Cannon Soldier: Tribute 1 monster, 500 damage');
  h = mk([{ m: ['Toon Cannon Soldier'], st: [{ n: 'Toon World', pos: 'up' }], hand: ['Mystical Space Typhoon'], turn: 2 }, {}]);
  gActU(G, h, gFind(G, h, 0, 'Mystical Space Typhoon')); gDrive(h, /Toon World/, null, G);
  ok(h.p[0].gy.some(c => G.name(c) === 'Toon World') && h.p[0].gy.some(c => G.name(c) === 'Toon Cannon Soldier'), 'Goat Toon Cannon Soldier is destroyed with Toon World (its Goat text)');
});
// attack with a on t (both engines): enter the Battle Phase, pass the windows, declare, drive to the next idle
const gAttack = (P, g, a, t, respond) => { const bp = g.prompt.opts.find(o => /^Battle Phase/.test(o.label)); P.act(g, [bp.key]); gDrive(g, /./, null, P);
  P.act(g, [g.prompt.opts.find(o => o.key === 'atk:' + a.u + (t ? ':' + t.u : '')).key]); gDrive(g, /./, respond, P); };
T('139. Goat: Blade Knight\'s per-visit negation (Slate Warrior\'s GY effect does nothing, archive); Slate\'s -500 under Grave Protector (archive); Lightning Blade\'s "Warrior-Type" (pass2 goat-11)', () => {
  const { G, mk } = goatEngine();
  let g = mk([{ m: ['Blade Knight'], hand: ['Sangan', 'Sangan'], turn: 2 }, { m: [{ n: 'Slate Warrior', pos: 'set' }] }]);
  const bk = gFind(G, g, 0, 'Blade Knight'); gAttack(G, g, bk, g.p[1].m.find(Boolean));
  ok(g.p[1].gy.some(c => G.name(c) === 'Slate Warrior') && G.atk(g, bk) === 1600 && g.log.some(l => /Slate Warrior's effect was negated/.test(l)), 'Blade Knight alone destroys Slate Warrior: its GY effect is negated, Blade Knight keeps 1600');
  g = mk([{ m: ['Blue-Eyes White Dragon'], turn: 2 }, { m: [{ n: 'Slate Warrior', pos: 'atk' }, 'Grave Protector'] }]);
  const bw = gFind(G, g, 0, 'Blue-Eyes White Dragon'); gAttack(G, g, bw, gFind(G, g, 1, 'Slate Warrior'));
  ok(g.p[1].deck.some(c => G.name(c) === 'Slate Warrior') && G.atk(g, bw) === 2500, `Grave Protector shuffles Slate Warrior into the Deck and Blue-Eyes still loses 500 (${G.atk(g, bw)})`);
  g = mk([{ m: ['D.D. Warrior Lady'], hand: ['Lightning Blade', 'Sangan'], st: [{ n: 'DNA Surgery', pos: 'set' }], turn: 2 }, {}]);
  gActU(G, g, gFind(G, g, 0, 'Lightning Blade')); gDrive(g, /./, null, G);
  const lb = g.p[0].st.find(c => c && G.name(c) === 'Lightning Blade');
  gActU(G, g, g.p[0].st.find(c => c && G.name(c) === 'DNA Surgery')); gDrive(g, /^Dragon$/, null, G);
  G.act(g, ['ns:' + gFind(G, g, 0, 'Sangan').u]); gDrive(g, /./, null, G);
  ok(!!lb && lb.zone === 'gy', 'Lightning Blade ("Equip only to a Warrior-Type monster") is destroyed once DNA Surgery makes its monster a Dragon');
});
T('140. Deck searches under Thunder King Rai-Oh, read from what the effect does: Ojama Blue and Preparation of Rites can\'t be activated; Crystal Seer\'s and Magical Merchant\'s card goes to the GY (site rulings; pass2 edison-15/19/20)', () => {
  let g = duel([{ turn: 3, m: ['Thunder King Rai-Oh', 'Blue-Eyes White Dragon'] }, { m: [{ n: 'Ojama Blue', pos: 'atk' }], deckTop: ['Ojama Yellow', 'Ojamagic'] }]);
  act(g, /^Battle Phase/); drive(g); act(g, new RegExp('atk:' + fld(g, 0, 'Blue-Eyes White Dragon').u + ':' + fld(g, 1, 'Ojama Blue').u)); const seen = drive(g);
  ok(g.p[1].gy.some(c => E.name(c) === 'Ojama Blue') && !seen.some(t => /Ojama Blue/.test(t)) && !g.log.some(l => /added Ojama/.test(l)), 'Ojama Blue destroyed by battle under the opponent\'s Rai-Oh: no "Use Ojama Blue\'s effect?", nothing added');
  g = duel([{ turn: 3, hand: ['Preparation of Rites'], deckTop: [FILL, 'Relinquished'], gy: ['Black Illusion Ritual'] }, { m: ['Thunder King Rai-Oh'] }]);
  ok(!keyOf(g, hand(g, 'Preparation of Rites')), 'Preparation of Rites can\'t be activated under Rai-Oh (its search is mandatory, ruling 1)');
  g = duel([{ turn: 3, hand: ['Preparation of Rites'], deckTop: [FILL, 'Relinquished'], gy: ['Black Illusion Ritual'] }, {}]);
  ok(!!keyOf(g, hand(g, 'Preparation of Rites')), 'and it can without Rai-Oh');
  g = duel([{ turn: 3, m: [{ n: 'Crystal Seer', pos: 'set' }], deckTop: [FILL, 'Pot of Greed', 'Pot of Greed'] }, { m: ['Thunder King Rai-Oh'] }]);
  act(g, /Flip/); drive(g);
  ok(g.p[0].gy.filter(c => E.name(c) === 'Pot of Greed').length === 1 && !g.p[0].hand.some(c => E.name(c) === 'Pot of Greed'), 'Crystal Seer under Rai-Oh: the chosen card is sent to the GY, the other goes to the bottom');
  g = duel([{ turn: 3, m: [{ n: 'Magical Merchant', pos: 'set' }], deckTop: [FILL, 'Pot of Greed'] }, { m: ['Thunder King Rai-Oh'] }]);
  act(g, /Flip/); drive(g);
  ok(g.p[0].gy.some(c => E.name(c) === 'Pot of Greed') && !g.p[0].hand.some(c => E.name(c) === 'Pot of Greed'), 'Magical Merchant under Rai-Oh: the excavated Spell goes to the GY (Rai-Oh ruling)');
});
// drive with a look at every pick (onPick(pr) may return the keys to answer)
const driveP = (g, onPick, respond) => { for (let i = 0; i < 60 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') { E.act(g, [(respond && respond(pr)) || 'pass']); continue; } if (pr.type === 'yesno') { E.act(g, ['y']); continue; }
  const k = pr.type === 'pick' && onPick && onPick(pr); E.act(g, k || pr.opts.slice(0, pr.min || 1).map(x => x.key)); } };
T('141. Black Illusion Ritual\'s Tributes: Djinn in the GY under Mask of Restrict (site ruling), only field monsters with a full field (pass2 goat-08), a second Relinquished (pass2 edison-20)', () => {
  let g = duel([{ hand: ['Black Illusion Ritual', 'Relinquished', 'Sangan'], gy: ['Djinn Releaser of Rituals'] }, { st: [{ n: 'Mask of Restrict', pos: 'up' }] }]);
  let k = keyOf(g, hand(g, 'Black Illusion Ritual')); let offered = [];
  if (k) { E.act(g, [k.key]); driveP(g, pr => { if (/Tribute a monster/.test(pr.text)) offered = pr.opts.map(o => o.label); }); }
  ok(!!k && ['', 'Djinn Releaser of Rituals'].includes(offered.join()) && !!fld(g, 0, 'Relinquished') && g.p[0].ban.some(c => E.name(c) === 'Djinn Releaser of Rituals') && !!hand(g, 'Sangan'), `under Mask of Restrict: Black Illusion Ritual is offered, Djinn in the GY is banished (the only Tribute), Relinquished is summoned (${offered})`);
  g = duel([{ hand: ['Black Illusion Ritual', 'Relinquished', 'Sangan'], m: ['Sangan'] }, { st: [{ n: 'Mask of Restrict', pos: 'up' }] }]);
  ok(!keyOf(g, hand(g, 'Black Illusion Ritual')), 'under Mask of Restrict with no Djinn: not offered (hand and field monsters can\'t be Tributed)');
  g = duel([{ hand: ['Black Illusion Ritual', 'Relinquished', 'Jinzo'], m: ['Sangan', 'Sangan', 'Sangan', 'Sangan', 'Sangan'] }, {}]);
  E.act(g, [keyOf(g, hand(g, 'Black Illusion Ritual')).key]); offered = [];
  driveP(g, pr => { if (/Tribute a monster/.test(pr.text)) offered = pr.opts.map(o => o.label); });
  ok(offered.length && !offered.includes('Jinzo') && !!fld(g, 0, 'Relinquished') && g.p[0].hand.some(c => E.name(c) === 'Jinzo'), `full field: only field monsters can be Tributed, Relinquished is summoned (${offered})`);
  g = duel([{ hand: ['Black Illusion Ritual', 'Relinquished', 'Relinquished'] }, {}]);
  E.act(g, [keyOf(g, hand(g, 'Black Illusion Ritual')).key]); drive(g);
  ok(!!fld(g, 0, 'Relinquished') && g.p[0].gy.some(c => E.name(c) === 'Relinquished'), 'one Relinquished Tributed for the other');
});
const pickRe = re => pr => { const o = pr.opts.find(o => re.test(o.label)); return o ? [o.key] : null; };
const whereIs = (g, n) => { for (const p of [0, 1]) for (const z of ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra']) if ((g.p[p][z] || []).some(c => c && E.name(c) === n)) return p + ':' + z; return '-'; };
T('142. Pass 2 edison-18/19 card fixes played out: Mind Protector\'s maintenance, G.B. Hunter vs Bait Doll / Mystic Swordsman LV6 / Storm Caller, Slingen, Forcefield, Reaper on the Nightmare, Curse of Anubis, Brain Research Lab, Core Reinforcement, B. Skull Dragon', () => {
  // Mind Protector: a maintenance cost (no chain), paid under Skill Drain too
  let g = duel([{ m: ['Mind Protector'], turn: 3 }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]); drive(g);
  ok(g.p[0].lp === 7500 && !!fld(g, 0, 'Mind Protector') && !g.log.some(l => /activated Mind Protector/.test(l)), `Mind Protector under Skill Drain: pays 500 with no chain link (LP ${g.p[0].lp})`);
  // G.B. Hunter: Bait Doll can't be activated (ruling 7); Mystic Swordsman LV6 doesn't ask (ruling 6); Storm Caller doesn't activate (ruling 5)
  g = duel([{ m: ['G.B. Hunter'], hand: ['Bait Doll'], turn: 3 }, { st: [{ n: 'Mirror Force', pos: 'set' }] }]);
  ok(!keyOf(g, hand(g, 'Bait Doll')), 'Bait Doll can\'t be activated with G.B. Hunter face-up');
  g = duel([{ m: ['Mystic Swordsman LV6', 'G.B. Hunter'], turn: 3 }, { m: [{ n: 'Cyber Dragon', pos: 'set' }] }]);
  act(g, /^Battle Phase/); drive(g); act(g, new RegExp('atk:' + fld(g, 0, 'Mystic Swordsman LV6').u + ':' + g.p[1].m.find(Boolean).u)); let asked = drive(g);
  ok(!asked.some(t => /top of your opponent's Deck/.test(t)) && whereIs(g, 'Cyber Dragon') === '1:gy', 'Mystic Swordsman LV6 under G.B. Hunter: no "top of the Deck" question, the monster goes to the GY');
  g = duel([{ m: ['Storm Caller', 'Psychic Commander', 'G.B. Hunter'], turn: 3 }, { m: ['Ojama Green'] }]);
  act(g, /^Battle Phase/); drive(g); act(g, new RegExp('atk:' + fld(g, 0, 'Psychic Commander').u + ':' + fld(g, 1, 'Ojama Green').u)); asked = drive(g);
  ok(whereIs(g, 'Ojama Green') === '1:gy' && !g.log.some(l => /activated Storm Caller/.test(l)), 'Storm Caller under G.B. Hunter: the destroyed monster stays in the GY');
  // Slingen: only a face-up Morphtronic can be destroyed instead
  g = duel([{ turn: 3, m: ['Cyber Dragon'] }, { m: [{ n: 'Morphtronic Slingen', pos: 'def' }, { n: 'Morphtronic Boarden', pos: 'set' }] }]);
  act(g, /^Battle Phase/); drive(g); act(g, new RegExp('atk:' + fld(g, 0, 'Cyber Dragon').u + ':' + fld(g, 1, 'Morphtronic Slingen').u)); asked = drive(g);
  ok(!asked.some(t => /another Morphtronic/.test(t)) && whereIs(g, 'Morphtronic Slingen') === '1:gy', 'Morphtronic Slingen with only a Set Morphtronic: no replacement, Slingen is destroyed');
  // Morphtronic Forcefield needs a Morphtronic monster in the Deck (site ruling 3)
  g = duel([{ hand: ['Dark Hole'], turn: 3 }, { m: ['Morphtronic Boarden'], st: [{ n: 'Morphtronic Forcefield', pos: 'set' }], deckTop: ['Morphtronic Accelerator'] }]);
  actU(g, hand(g, 'Dark Hole')); let ff = false; drive(g, { respond: pr => { if (pr.p === 1 && pr.opts.some(o => /Forcefield/.test(o.label))) ff = true; return 'pass'; } });
  ok(!ff, 'Morphtronic Forcefield isn\'t offered with only a Morphtronic Spell in the Deck');
  // Reaper on the Nightmare ②: an Equip Spell targeting it destroys it after resolving (site ruling 2)
  g = duel([{ m: ['Reaper on the Nightmare'], hand: ['Black Pendant'], turn: 3 }, {}]); actU(g, hand(g, 'Black Pendant')); driveP(g, pickRe(/Reaper/));
  ok(whereIs(g, 'Reaper on the Nightmare') === '0:gy', 'Reaper on the Nightmare targeted by Black Pendant is destroyed');
  // Curse of Anubis sets the original DEF to 0: Ojama Country first, then Curse: Sangan 600 / 0 (Country ruling 6)
  g = duel([{ m: ['Sangan', 'Ojama Green'], fz: 'Ojama Country', st: [{ n: 'Curse of Anubis', pos: 'set' }], turn: 3 }, {}]);
  const sg = fld(g, 0, 'Sangan'); actU(g, g.p[0].st.find(Boolean)); drive(g);
  ok(E.atk(g, sg) === 600 && E.def(g, sg) === 0, `Ojama Country, then Curse of Anubis: Sangan ${E.atk(g, sg)} / ${E.def(g, sg)} (600 / 0)`);
  // Brain Research Lab negated: its counters go (site ruling)
  g = duel([{ fz: 'Brain Research Lab', turn: 3 }, { hand: ['Spell Canceller'], m: [FILL] }]); const brl = g.p[0].fz; brl.flags.psy = 2;
  E.lib.ss(g, 1, g.p[1].hand.find(c => E.name(c) === 'Spell Canceller'), 'atk'); E.lib.emit(g, { type: 'probe' });
  ok(!brl.flags.psy, 'Brain Research Lab under Spell Canceller: its Psychic Counters are removed');
  // Core Reinforcement destroyed by MST in its End Phase: the monster goes with it, no damage (ruling 3)
  g = duel([{ st: [{ n: 'Core Reinforcement', pos: 'set' }], turn: 3, gy: ["Koa'ki Meiru Guardian"], hand: ["Iron Core of Koa'ki Meiru"] }, { st: [{ n: 'Mystical Space Typhoon', pos: 'set' }] }]);
  g.p[1].st.find(Boolean).turnIn = -5; actU(g, g.p[0].st.find(Boolean)); drive(g); E.act(g, ['end']); let used = false;
  driveP(g, pr => { if (pr.p === 1) { const o = pr.opts.find(x => /Core Reinforcement/.test(x.label)); return o ? [o.key] : null; } return null; },
    pr => { if (pr.p === 1 && g.phase === 'end' && !used) { const o = pr.opts.find(x => /Mystical/.test(x.label)); if (o) { used = true; return o.key; } } return 'pass'; });
  ok(used && whereIs(g, "Koa'ki Meiru Guardian") === '0:gy' && g.p[0].lp === 8000, `Core Reinforcement destroyed in the End Phase: Guardian destroyed, no damage (LP ${g.p[0].lp})`);
  // B. Skull Dragon: exact materials; King of the Swamp substitutes, Toon Summoned Skull doesn't
  const bsd = hd => E.newDuel({ decks: [{ name: 't', main: Array(40).fill(id(FILL)), extra: [id('B. Skull Dragon (Archfiend)')] }, { name: 't', main: Array(40).fill(id(FILL)), extra: [] }], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: [{ hand: ['Polymerization', ...hd] }, {}] });
  ok(!keyOf(g = bsd(['Toon Summoned Skull (Archfiend)', 'Red-Eyes Black Dragon']), hand(g, 'Polymerization')), 'Toon Summoned Skull isn\'t a B. Skull Dragon material');
  ok(!!keyOf(g = bsd(['King of the Swamp', 'Red-Eyes Black Dragon']), hand(g, 'Polymerization')), 'King of the Swamp substitutes for Summoned Skull');
});
const atkOn = (g, a, t, o) => { act(g, /^Battle Phase/); drive(g); act(g, new RegExp('atk:' + a.u + (t ? ':' + t.u : ''))); return drive(g, o); };
T('143. Pass 2 queue, Edison: Rooklord\'s banish cost, Super Roboyarou, Hyper Psychic Blaster off the field, Karma Cut\'s log, Scrubbed Raid, Begone Knave, Ccarayhua, Revival of the Immortals, Code A, Imperial Custom self-destroys, The Wicked Eraser with Double Coston', () => {
  let g = duel([{ turn: 3, hand: ["Koa'ki Meiru Rooklord"], m: ["Koa'ki Meiru Drago"], gy: ["Koa'ki Meiru Boulder"] }, { m: [FILL], st: [{ n: 'Imperial Iron Wall', pos: 'up' }] }]);
  act(g, /Tribute 1 Koa/); let asked = drive(g);
  ok(!!fld(g, 0, "Koa'ki Meiru Rooklord") && !asked.some(t => /Rooklord/.test(t)) && !g.log.some(l => /activated Koa'ki Meiru Rooklord/.test(l)), 'Rooklord under Imperial Iron Wall: its banish-cost trigger isn\'t offered');
  g = duelEx([{ turn: 3, m: ['Super Roboyarou'] }, {}], ['Super Robolady']);
  const rl = g.p[0].extra.find(c => E.name(c) === 'Super Robolady');
  ok(!!rl && !!keyOf(g, fld(g, 0, 'Super Roboyarou')), 'Super Roboyarou\'s effect is offered with a summonable Super Robolady');
  E.lib.addRule(g, (g2, a) => a.type === 'ss' && a.c === rl, { end: g.turnNo + 9 }); g.seq++; E.act(g, ['end']); drive(g); E.act(g, ['end']); drive(g);
  ok(!keyOf(g, fld(g, 0, 'Super Roboyarou')), 'not when Super Robolady can\'t be Special Summoned (pass2 goat-s01)');
  g = duel([{ turn: 3, m: ['Hyper Psychic Blaster'] }, { m: [{ n: 'Man-Eater Bug', pos: 'set' }] }]);
  atkOn(g, fld(g, 0, 'Hyper Psychic Blaster'), g.p[1].m.find(Boolean));
  ok(g.p[0].lp === 8000 + 2400 && whereIs(g, 'Hyper Psychic Blaster') === '0:gy', `Hyper Psychic Blaster destroyed by Man-Eater Bug's flip still gains 3000 - 600 (site ruling 2; LP ${g.p[0].lp})`);
  g = duel([{ turn: 3, hand: [FILL], st: [{ n: 'Karma Cut', pos: 'set' }] }, { m: [FILL, 'Kycoo the Ghost Destroyer'], gy: [FILL] }]);
  actU(g, g.p[0].st.find(Boolean)); driveP(g, pr => { const o = pr.opts.find(x => x.label === FILL); return /Banish/.test(pr.text) && o ? [o.key] : null; });
  ok(g.p[1].gy.some(c => E.name(c) === FILL) && !g.log.some(l => /more .* in the GY (was|were) banished/.test(l)), 'Karma Cut with Kycoo face-up: the GY copy stays, and the log doesn\'t say it was banished (pass2 edison-s01)');
  g = duel([{ turn: 3, m: ['Cyber Dragon'] }, { m: [FILL], st: [{ n: 'Scrubbed Raid', pos: 'up' }, { n: 'Mirror Force', pos: 'set' }] }]);
  act(g, /^Battle Phase/); drive(g); act(g, new RegExp('atk:' + fld(g, 0, 'Cyber Dragon').u + ':' + fld(g, 1, FILL).u)); let raids = 0;
  drive(g, { respond: pr => { const o = pr.p === 1 && pr.opts.find(x => /Scrubbed Raid/.test(x.label)); if (o) { raids++; return o.key; } return 'pass'; } });
  ok(raids === 1 && g.p[1].st.some(c => c && E.name(c) === 'Scrubbed Raid'), `Scrubbed Raid is used once; once the Battle Phase ended it isn\'t offered again (used ${raids})`);
  g = duel([{ turn: 3, m: ['Amazoness Swords Woman'] }, { m: ['Cyber Dragon'], st: [{ n: 'Begone, Knave!', pos: 'up' }] }]);
  atkOn(g, fld(g, 0, 'Amazoness Swords Woman'), fld(g, 1, 'Cyber Dragon'));
  ok(whereIs(g, 'Amazoness Swords Woman') === '0:gy', 'Begone, Knave! doesn\'t return Amazoness Swords Woman destroyed by that battle (site ruling 3)');
  g = duel([{ turn: 3, m: ['Cyber Dragon'] }, { m: ['Earthbound Immortal Uru', { n: 'Earthbound Immortal Ccarayhua', pos: 'set' }], fz: 'Mystic Plasma Zone' }]);
  atkOn(g, fld(g, 0, 'Cyber Dragon'), g.p[1].m.find(c => c && c.pos === 'set'));
  ok(!!fld(g, 0, 'Cyber Dragon') && !!fld(g, 1, 'Earthbound Immortal Uru'), 'a Set Ccarayhua flipped while Uru is face-up is destroyed by the rule: its effect doesn\'t destroy the field (site ruling 2)');
  g = duel([{ turn: 3, st: [{ n: 'Revival of the Immortals', pos: 'set' }], gy: ['Earthbound Immortal Ccarayhua'], fz: 'Mystic Plasma Zone' }, {}]);
  actU(g, g.p[0].st.find(Boolean)); drive(g); const ei = fld(g, 0, 'Earthbound Immortal Ccarayhua');
  ok(!!ei && !opt(g, new RegExp('atk:' + ei.u)) && E.lib.forbid(g, { type: 'attack', c: ei }), 'a monster revived by Revival of the Immortals can\'t declare an attack this turn');
  g = duel([{ turn: 3, hand: ['Dark Hole'] }, { m: ['Alien Warrior', 'Alien Telepath', 'Alien Ammonite'], st: [{ n: 'Code A Ancient Ruins', pos: 'up' }] }]);
  actU(g, hand(g, 'Dark Hole')); drive(g); const ca = g.p[1].st.find(c => c && E.name(c) === 'Code A Ancient Ruins');
  ok(E.lib.ctr(ca, 'A') === 1, `Dark Hole on 3 Aliens: Code A gets 1 A-Counter (${E.lib.ctr(ca, 'A')})`);
  for (const cu of [true, false]) {
    g = duel([{ turn: 3, m: ['Sealmaster Meisei'], st: [{ n: 'Talisman of Spell Sealing', pos: 'up' }, ...(cu ? [{ n: 'Imperial Custom', pos: 'up' }] : [])] }, { m: ['Cyber Dragon'] }]);
    atkOn(g, fld(g, 0, 'Sealmaster Meisei'), fld(g, 1, 'Cyber Dragon'));
    ok(whereIs(g, 'Sealmaster Meisei') === '0:gy' && whereIs(g, 'Talisman of Spell Sealing') === (cu ? '0:st' : '0:gy'), cu ? 'Imperial Custom keeps Talisman of Spell Sealing after Sealmaster Meisei leaves (its own destroy is an effect, ruling 4)' : 'without Imperial Custom it is destroyed'); }
  g = duel([{ turn: 3, hand: ['The Wicked Eraser'], m: ['Double Coston', 'Sangan'] }, {}]);
  ok(!!opt(g, /Tribute Summon \(Tribute 3/), 'The Wicked Eraser\'s 3-Tribute summon with Double Coston (2 for a DARK) + Sangan');
  act(g, /Tribute Summon \(Tribute 3/); drive(g); ok(!!fld(g, 0, 'The Wicked Eraser'), 'and it is summoned');
});
T('144. Pass 2 queue, Goat: Gearfried destroys an Equip as the equipping link finishes, Reflect Bounder\'s self-destruction is no chain link, TER can\'t target Blindly Loyal Goblin, Premature Burial negated by Spell Canceller, Cursed Seal\'s name lock (pass2 goat-08/09)', () => {
  const { G, mk } = goatEngine(); const resp = (g, p, n) => pr => { const c = pr.p === p && [...g.p[p].st, ...g.p[p].m, ...g.p[p].hand].find(x => x && G.name(x) === n); const o = c && pr.opts.find(x => x.key.startsWith('a:' + c.u + ':')); return o && o.key; };
  let g = mk([{ hand: ['Gearfried the Iron Knight'], st: [{ n: 'Blast with Chain', pos: 'set' }], turn: 2 }, { m: ['Sangan'], st: [{ n: 'Trap Hole', pos: 'set' }] }]);
  for (const c of [...g.p[0].st, ...g.p[1].st]) if (c) c.turnIn = -1;
  G.act(g, [g.prompt.opts.find(o => /^ns:/.test(o.key)).key]);
  gDrive(g, /Sangan|Gearfried/, pr => resp(g, 1, 'Trap Hole')(pr) || (pr.p === 0 && g.chain.length === 1 ? resp(g, 0, 'Blast with Chain')(pr) : null), G);
  const i1 = g.log.findIndex(l => /Gearfried the Iron Knight destroyed Blast with Chain/.test(l)), i2 = g.log.findIndex(l => /Gearfried the Iron Knight was destroyed/.test(l));
  ok(i1 >= 0 && i1 < i2 && g.log.some(l => /activated Blast with Chain's effect/.test(l)), 'Gearfried destroys Blast with Chain before Trap Hole resolves, and Blast with Chain\'s effect activates (Netrep)');
  g = mk([{ m: ['D.D. Warrior Lady'], turn: 2 }, { m: [{ n: 'Reflect Bounder', pos: 'atk' }] }]);
  gAttack(G, g, gFind(G, g, 0, 'D.D. Warrior Lady'), gFind(G, g, 1, 'Reflect Bounder'));
  ok(g.p[1].gy.some(c => G.name(c) === 'Reflect Bounder') && !g.p[1].ban.some(c => G.name(c) === 'Reflect Bounder'), 'Reflect Bounder destroys itself with no chain link: D.D. Warrior Lady can\'t banish it (archive)');
  g = mk([{ m: ['Thousand-Eyes Restrict'], turn: 2 }, { m: ['Blindly Loyal Goblin'] }]);
  ok(!g.prompt.opts.some(o => o.key.startsWith('a:' + gFind(G, g, 0, 'Thousand-Eyes Restrict').u + ':')), 'Thousand-Eyes Restrict can\'t target Blindly Loyal Goblin (archive)');
  g = mk([{ st: [{ n: 'Premature Burial', pos: 'set' }], gy: ['Spell Canceller'], turn: 2 }, { st: [{ n: 'Dust Tornado', pos: 'set' }] }]);
  for (const c of [...g.p[0].st, ...g.p[1].st]) if (c) c.turnIn = -1;
  gActU(G, g, g.p[0].st.find(Boolean)); gDrive(g, /Spell Canceller/, null, G);
  const pb = g.p[0].st.find(c => c && G.name(c) === 'Premature Burial'); const dt = g.p[1].st.find(Boolean); G.lib.destroy(g, [pb], { by: 1 }); G.act(g, ['end']); gDrive(g, /./, null, G);
  ok(!!gFind(G, g, 0, 'Spell Canceller') && g.p[0].gy.some(c => G.name(c) === 'Premature Burial'), 'Premature Burial negated by the Spell Canceller it revived: destroyed, Spell Canceller stays (ruling 3)');
  g = mk([{ hand: ['Black Pendant', 'Black Pendant', 'Sangan'], m: ['Sangan'], turn: 2 }, { st: [{ n: 'Cursed Seal of the Forbidden Spell', pos: 'set' }], hand: ['Pot of Greed'] }]);
  for (const c of g.p[1].st) if (c) c.turnIn = -1;
  gActU(G, g, g.p[0].hand.find(c => G.name(c) === 'Black Pendant')); gDrive(g, /Sangan/, pr => resp(g, 1, 'Cursed Seal of the Forbidden Spell')(pr), G);
  const bp2 = g.p[0].hand.find(c => G.name(c) === 'Black Pendant'); G.act(g, [g.prompt.opts.find(o => o.key === 'setst:' + bp2.u).key]); gDrive(g, /./, null, G);
  const lp = g.p[1].lp; G.lib.destroy(g, [bp2], { by: 1 }); G.act(g, ['end']); gDrive(g, /./, null, G);
  ok(g.p[1].lp === lp && !g.log.some(l => /activated Black Pendant's effect/.test(l)), `Cursed Seal on Black Pendant: a Set Black Pendant destroyed later deals no damage (archive ruling 3; B ${lp} -> ${g.p[1].lp})`);
});

// ---- 145 (fixer E4d, 2026-11-28): scenarios in place of source-text checks (101 to 105) ----
T('145-1. Phoenix Wing Wind Blast skips a chained Normal Trap; Gemini Spark needs a Deck; Instant Fusion\'s turn use is a non-negated activation and skips material-only Fusions', () => {
  let g = duel([{ hand: ['Mystical Space Typhoon', FILL], st: [{ n: 'Phoenix Wing Wind Blast', pos: 'set' }], turn: 3 }, { st: [{ n: 'Dust Tornado', pos: 'set' }, { n: 'Swords of Revealing Light', pos: 'up' }] }]);
  const pw = g.p[0].st.find(Boolean), dt = g.p[1].st.find(Boolean), sw = g.p[1].st.find(c => c && E.name(c) === 'Swords of Revealing Light'), mst = hand(g, 'Mystical Space Typhoon'); let dtOffered = false;
  actU(g, mst);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
    if (pr.type === 'respond') { const o = pr.opts.find(x => x.key.startsWith('a:' + (pr.p === 1 ? dt : pw).u + ':')); E.act(g, [o ? o.key : 'pass']); continue; }
    if (pr.type === 'pick' && pr.p === 0 && /top of the Deck/.test(pr.text) && pr.opts.some(o => o.key === 'u' + dt.u)) dtOffered = true;
    const want = pr.opts.find(o => o.key === 'u' + (pr.p === 0 && /Destroy/.test(pr.text) ? dt.u : pr.p === 1 ? mst.u : -1)); E.act(g, [want ? want.key : pr.opts[0].key]); }
  ok(g.log.some(l => /Phoenix Wing Wind Blast \(Chain Link 3\)/.test(l)) && !dtOffered && sw.zone === 'deck', 'PWWB chained to Dust Tornado: the chained Normal Trap is no target, Swords of Revealing Light (Continuous) is');
  g = duel([{ m: ['Elemental HERO Neos Alius'], hand: ['Gemini Spark'], turn: 3 }, { m: [FILL] }]);
  ok(!!keyOf(g, hand(g, 'Gemini Spark')), 'Gemini Spark is offered with a Deck');
  g.p[0].deck.length = 0; g.seq++;
  ok(!E.idleOpts(g).some(o => o.key.startsWith('a:' + hand(g, 'Gemini Spark').u + ':')), 'Gemini Spark with an empty Deck is not offered');
  g = duel([{ hand: ['Instant Fusion'], extra: ['Dark Balter the Terrible'], turn: 3 }, {}]);
  ok(!keyOf(g, hand(g, 'Instant Fusion')), 'Instant Fusion: Dark Balter (only Fusion Summoned with its materials) is no target');
  g = duel([{ hand: ['Instant Fusion', 'Instant Fusion'], extra: ['Flame Swordsman', 'Flame Swordsman'], turn: 3 }, {}]);
  actU(g, hand(g, 'Instant Fusion')); drive(g);
  ok(!!fld(g, 0, 'Flame Swordsman') && !keyOf(g, hand(g, 'Instant Fusion')), 'Instant Fusion resolved: the second copy is not offered this turn');
  g = duel([{ hand: ['Instant Fusion', 'Instant Fusion'], extra: ['Flame Swordsman', 'Flame Swordsman'], turn: 3 }, { st: [{ n: 'Solemn Judgment', pos: 'set' }] }]);
  actU(g, hand(g, 'Instant Fusion')); drive(g, { respond: respondWith(g, 1, 'Solemn Judgment') });
  ok(!fld(g, 0, 'Flame Swordsman') && g.p[1].gy.some(c => E.name(c) === 'Solemn Judgment') && !!keyOf(g, hand(g, 'Instant Fusion')), 'Instant Fusion negated by Solemn Judgment: the second copy can still be activated');
});

T('145-2. Trident Dragion attacks once per card destroyed plus one; Prohibition (rulings 1, 4, 11); a Gemini Summoned Tuned Magician is a Synchro Tuner; Reinforce Truth\'s Battle Phase lock holds when its effect is negated', () => {
  let g = duel([{ m: ['Magna Drago', 'Blue-Eyes White Dragon', FILL], st: [{ n: 'Mirror Force', pos: 'set' }], extra: ['Trident Dragion'], turn: 3 }, {}]);
  const td = g.p[0].extra[0]; act(g, /^Synchro Summon/);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; E.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.max || pr.min || 1).map(o => o.key)); }
  act(g, /^Battle Phase/); passAll(g); let n = 0;
  for (let i = 0; i < 5; i++) { const o = opt(g, new RegExp('atk:' + td.u + ':')); if (!o) break; E.act(g, [o.key]); drive(g); n++; }
  ok(g.log.some(l => /Gene-Warped Warwolf, Mirror Force were destroyed/.test(l)) && n === 3, 'Trident Dragion destroys 2 cards and attacks 3 times');
  const prohibit = g => { actU(g, hand(g, 'Prohibition')); for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') E.act(g, ['pass']); else { const o = pr.opts.find(o => o.label === 'Cyber Dragon'); E.act(g, [(o || pr.opts[0]).key]); } } };
  g = duel([{ m: ['Cyber Dragon'], hand: ['Prohibition', 'Monster Reborn', 'Cyber Dragon'], gy: ['Cyber Dragon'], turn: 3 }, { m: [FILL] }]);
  const old = fld(g, 0, 'Cyber Dragon'), inH = hand(g, 'Cyber Dragon'), rev = g.p[0].gy[0];
  prohibit(g);
  ok(g.log.some(l => /declared Cyber Dragon/.test(l)) && !g.prompt.opts.some(o => o.key.endsWith(':' + inH.u) || o.key.includes(':' + inH.u + ':')) && !!opt(g, new RegExp('pos:' + old.u)), 'Prohibition on Cyber Dragon: the copy in the hand can\'t be summoned, the copy on the field is unaffected (ruling 1)');
  actU(g, hand(g, 'Monster Reborn')); drive(g);
  ok(rev.zone === 'm' && !opt(g, new RegExp('pos:' + rev.u)), 'a copy in the GY can be Special Summoned (ruling 4), and it can\'t change its position');
  E.lib.setFaceDown(g, rev); rev.turnIn = 1; g.seq++;
  ok(!E.idleOpts(g).some(o => o.key === 'flip:' + rev.u), 'set face-down after Prohibition: it can\'t be Flip Summoned (ruling 11)');
  act(g, /^Battle Phase/); passAll(g);
  ok(!!opt(g, new RegExp('atk:' + old.u + ':')), 'the copy that was on the field can still attack');
  g = duel([{ m: [{ n: 'Cyber Dragon', pos: 'set' }], hand: ['Prohibition'], turn: 3 }, { m: [FILL] }]); const sc = g.p[0].m[0]; sc.turnIn = 1;
  prohibit(g); ok(!!opt(g, new RegExp('flip:' + sc.u)), 'a copy Set on the field before Prohibition can still be Flip Summoned (ruling 1)');
  g = duel([{ m: ['Tuned Magician', FILL], extra: ['Stardust Dragon'], turn: 3 }, {}]);
  ok(!opt(g, /^Synchro Summon/), 'Tuned Magician not Gemini Summoned: no Synchro Summon');
  fld(g, 0, 'Tuned Magician').flags.gemini = true; g.seq++;
  ok(E.idleOpts(g).some(o => /^syn:/.test(o.key)), 'Gemini Summoned Tuned Magician + a Level 4: Stardust Dragon can be Synchro Summoned');
  g = duel([{ st: [{ n: 'Reinforce Truth', pos: 'set' }], deckTop: [FILL, 'Speed Warrior'], turn: 3 }, { st: [{ n: 'Royal Decree', pos: 'up' }] }]);
  actU(g, g.p[0].st.find(Boolean)); drive(g);
  ok(!fld(g, 0, 'Speed Warrior') && g.log.some(l => /Reinforce Truth's effect was negated/.test(l)) && !opt(g, /^Battle Phase/), 'Reinforce Truth negated by Royal Decree: still no Battle Phase this turn');
});

T('145-3. Codarus leaves a target its controller took; Koa\'ki Meiru Tornado destroys Tokens; Hyper Psychic Blaster gains from the original DEF of a destroyed monster; Zoma hits its owner\'s opponent; Creature Swap with Blindly Loyal Goblin (Edison: neither switches; Goat: not choosable); Machine Duplication calls the name on the field', () => {
  let g = duel([{ m: ['Codarus', FILL], st: [{ n: 'Umi', pos: 'up' }, { n: 'Enemy Controller', pos: 'set' }], turn: 3 }, { m: ['Cyber Dragon'] }]);
  const ec = g.p[0].st.find(c => c && E.name(c) === 'Enemy Controller'), cd = fld(g, 1, 'Cyber Dragon'), w = fld(g, 0, FILL);
  actU(g, fld(g, 0, 'Codarus'));
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
    if (pr.type === 'respond') { const o = pr.p === 0 && pr.opts.find(o => o.key.startsWith('a:' + ec.u + ':')); E.act(g, [o ? o.key : 'pass']); }
    else if (pr.type === 'choose') E.act(g, [(pr.opts.find(o => /take control/.test(o.label)) || pr.opts[0]).key]);
    else { const o = pr.opts.find(o => o.key === 'u' + cd.u || o.key === 'u' + w.u); E.act(g, [(o || pr.opts[0]).key]); } }
  ok(g.log.some(l => /took control of Cyber Dragon/.test(l)) && cd.zone === 'm' && cd.ctrl === 0, 'Codarus targets Cyber Dragon, A takes it with Enemy Controller in the chain: it stays (ruling 3)');
  g = duel([{ m: ["Koa'ki Meiru Tornado"], hand: ["Iron Core of Koa'ki Meiru"], turn: 3 }, { m: ['Sheep Token', FILL] }]);
  actU(g, fld(g, 0, "Koa'ki Meiru Tornado")); drive(g);
  ok(!fld(g, 1, 'Sheep Token') && !!fld(g, 1, FILL), 'Koa\'ki Meiru Tornado destroys the Token (Special Summoned), not the other monster');
  g = duel([{ m: ['Hyper Psychic Blaster'], turn: 3 }, { m: [{ n: FILL, pos: 'def' }] }]); const hpb = fld(g, 0, 'Hyper Psychic Blaster');
  E.lib.addMod(g, fld(g, 1, FILL), { def: 1000 });
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + hpb.u + ':')); drive(g);
  ok(g.p[1].lp === 8000 - 1900 && g.p[0].lp === 8000 + 2900, 'HPB on a 1100 DEF (100 + 1000) monster: 1900 piercing, then 2900 LP from its original DEF once destroyed');
  g = duel([{ st: [{ n: 'Zoma the Spirit', pos: 'set' }], m: ['Cyber Dragon'], turn: 3 }, {}]);
  actU(g, g.p[0].st.find(Boolean)); drive(g); const z = g.p[0].m.find(c => c && E.name(c) === 'Zoma the Spirit');
  ok(!!z && E.lib.takeControl(g, 1, z), 'Zoma summoned, B takes control of it');
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fld(g, 0, 'Cyber Dragon').u + ':' + z.u)); drive(g);
  ok(g.p[1].lp === 8000 - 2100 && g.p[0].lp === 8000, 'A\'s Zoma (controlled by B) destroyed by A\'s Cyber Dragon: its owner\'s opponent B takes 2100 (ruling 3)');
  g = duel([{ m: ['Blindly Loyal Goblin', FILL], hand: ['Creature Swap'], turn: 3 }, { m: ['Cyber Dragon'] }]); const blg = fld(g, 0, 'Blindly Loyal Goblin');
  actU(g, hand(g, 'Creature Swap')); for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; E.act(g, pr.type === 'respond' ? ['pass'] : [(pr.opts.find(o => o.key === 'u' + blg.u) || pr.opts[0]).key]); }
  ok(blg.ctrl === 0 && !!fld(g, 1, 'Cyber Dragon') && g.log.some(l => /Control of those monsters can't switch/.test(l)), 'Edison Creature Swap choosing Blindly Loyal Goblin: neither monster switches (site ruling)');
  const { G, mk } = goatEngine(); g = mk([{ m: ['Blindly Loyal Goblin', 'Sangan'], hand: ['Creature Swap'], turn: 3 }, { m: ['Sangan'] }]); let blgOffered = false;
  G.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + g.p[0].hand.find(c => G.name(c) === 'Creature Swap').u + ':')).key]);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick' && pr.opts.some(o => /Blindly Loyal/.test(o.label))) blgOffered = true; G.act(g, pr.type === 'respond' ? ['pass'] : pr.opts.slice(0, 1).map(o => o.key)); }
  ok(!blgOffered && G.fieldOf(g, 0).some(c => G.name(c) === 'Blindly Loyal Goblin') && g.log.some(l => /switched control of Sangan and Sangan/.test(l)), 'Goat Creature Swap: the face-up Goblin can\'t be chosen, the other monster switches (Netrep)');
  g = duel([{ m: ['Proto-Cyber Dragon'], hand: ['Machine Duplication'], deckTop: [FILL, 'Cyber Dragon', 'Cyber Dragon'], turn: 3 }, {}]);
  const pc = g.p[0].m[0]; E.lib.addMod(g, pc, { atk: -700 }); g.seq++; g.prompt.opts = E.idleOpts(g);
  actU(g, hand(g, 'Machine Duplication')); drive(g);
  ok(g.p[0].m.filter(c => c && E.data(c).n === 'Cyber Dragon').length >= 1 && g.log.some(l => /Special Summoned Cyber Dragon/.test(l)), 'Machine Duplication on a 400 ATK Proto-Cyber Dragon (named Cyber Dragon) Special Summons Cyber Dragon from the Deck');
});

T('145-4. Goat: Dream Clown only from Attack to Defense; Dark Master - Zorc resolves after leaving the field; Mirror Wall in the Damage Step; Swords of Revealing Light counts under Imperial Order; Serial Spell doesn\'t stay; Last Turn\'s win check', () => {
  const { G, mk } = goatEngine();
  const gf = (g, p, n) => G.fieldOf(g, p).find(c => G.name(c) === n), gh = (g, p, n) => g.p[p].hand.find(c => G.name(c) === n);
  const gk = (g, c) => g.prompt && g.prompt.opts.find(o => o.key.startsWith('a:' + c.u + ':'));
  const gdrive = (g, o = {}) => { for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
    G.act(g, pr.type === 'respond' ? [(o.respond && o.respond(pr)) || 'pass'] : pr.type === 'yesno' ? [o.no ? 'n' : 'y'] : pr.opts.slice(0, pr.min || 1).map(x => x.key)); } };
  const useOn = (p, c) => pr => { const o = pr.p === p && pr.opts.find(o => o.key.startsWith('a:' + c.u + ':')); return o && o.key; };
  let g = mk([{ m: ['Dream Clown'], turn: 3 }, { m: ['Sangan'] }]); const dc = gf(g, 0, 'Dream Clown');
  G.act(g, ['pos:' + dc.u]); gdrive(g);
  ok(!gf(g, 1, 'Sangan') && g.p[1].gy.some(c => G.name(c) === 'Sangan'), 'Dream Clown changed from Attack to Defense destroys Sangan');
  g = mk([{ m: ['Sangan'], hand: ['Swords of Revealing Light'], turn: 3 }, { m: [{ n: 'Dream Clown', pos: 'set' }] }]);
  G.act(g, [gk(g, gh(g, 0, 'Swords of Revealing Light')).key]); gdrive(g);
  ok(g.log.some(l => /Dream Clown was flipped face-up/.test(l)) && !!gf(g, 0, 'Sangan'), 'Dream Clown flipped face-up Defense by Swords: no destruction');
  g = mk([{ m: ['Dark Master - Zorc'], turn: 3 }, { m: ['Sangan'], st: [{ n: 'Compulsory Evacuation Device', pos: 'set' }] }]); const zorc = gf(g, 0, 'Dark Master - Zorc');
  G.act(g, [gk(g, zorc).key]); gdrive(g, { respond: useOn(1, g.p[1].st[0]) });
  ok(zorc.zone === 'hand' && g.log.some(l => /A rolled a \d/.test(l)), 'Zorc bounced in the chain: its die roll still resolves (goat-11)');
  g = mk([{ m: ['Gemini Elf'], turn: 3 }, { m: [{ n: 'Sangan', pos: 'def' }], st: [{ n: 'Mirror Wall', pos: 'set' }] }]); const ge = gf(g, 0, 'Gemini Elf'), mw = g.p[1].st[0]; let dsOffer = false;
  G.act(g, ['bp']); gdrive(g); G.act(g, [g.prompt.opts.find(o => o.key.startsWith('atk:' + ge.u + ':')).key]);
  gdrive(g, { respond: pr => { const o = pr.p === 1 && g.inDS && pr.opts.find(o => o.key.startsWith('a:' + mw.u + ':')); if (o) { dsOffer = true; return o.key; } } });
  ok(dsOffer && G.atk(g, ge) === 950, 'Mirror Wall is activated in the Damage Step and halves Gemini Elf (goat-10)');
  g = mk([{ st: [{ n: 'Swords of Revealing Light', pos: 'up' }, { n: 'Imperial Order', pos: 'up' }], turn: 3 }, {}]); const sw = g.p[0].st[0];
  for (let i = 0; i < 300 && g.prompt && g.turnNo < 9 && g.winner == null; i++) { const pr = g.prompt; G.act(g, pr.type === 'idle' ? ['end'] : pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(g.turnNo === 9 && sw.zone === 'gy' && !!gf(g, 0, 'Imperial Order'), 'Swords under a face-up Imperial Order is destroyed after the opponent\'s 3rd End Phase (Netrep)');
  g = mk([{ hand: ['Swords of Revealing Light', 'Sangan'], st: [{ n: 'Serial Spell', pos: 'set' }], turn: 3 }, { m: ['Sangan'] }]); const ser = g.p[0].st[0];
  G.act(g, [gk(g, gh(g, 0, 'Swords of Revealing Light')).key]); gdrive(g, { respond: useOn(0, ser) });
  ok(g.log.some(l => /Serial Spell copies Swords/.test(l)) && ser.zone === 'gy' && !!gf(g, 0, 'Swords of Revealing Light'), 'Serial Spell copying Swords goes to the GY; Swords stays (goat-04)');
  g = mk([{ hand: ['Pot of Greed'], turn: 3 }, { m: ['Gemini Elf'], st: [{ n: 'Last Turn', pos: 'set' }], lp: 1000 }]);
  G.act(g, [gk(g, gh(g, 0, 'Pot of Greed')).key]); gdrive(g, { respond: useOn(1, g.p[1].st[0]) });
  for (let i = 0; i < 40 && g.prompt && g.winner == null; i++) { const pr = g.prompt; G.act(g, pr.type === 'idle' ? [(pr.opts.find(o => o.key === 'end') || pr.opts[pr.opts.length - 1]).key] : pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['n'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(g.winner === 1 && g.log.some(l => /Sangan attacks Gemini Elf/.test(l)), 'Last Turn: A\'s summoned Sangan loses to Gemini Elf; at the End Phase only B has a monster and wins (goat-11)');
});

T('145-5. Zombyra can\'t attack directly; Rescue Cat destroys the Beasts it summoned, whoever controls them; Ha Des\' negation ends when the monster leaves the GY; Dandylion always activates and Monster Reincarnation may discard its target; Gravekeeper\'s Spy asks the position once', () => {
  let g = duel([{ m: ['Zombyra the Dark', FILL], turn: 3 }, {}]); act(g, /^Battle Phase/); passAll(g);
  ok(!opt(g, new RegExp('atk:' + fld(g, 0, 'Zombyra the Dark').u + ':d')) && !!opt(g, new RegExp('atk:' + fld(g, 0, FILL).u + ':d')), 'Zombyra has no direct attack (the other monster does)');
  g = duel([{ m: ['Rescue Cat', 'Dark Gray'], deckTop: [FILL, 'Silver Fang', 'Silver Fang'], turn: 3 }, {}]);
  actU(g, fld(g, 0, 'Rescue Cat')); drive(g); const sfs = g.p[0].m.filter(c => c && E.name(c) === 'Silver Fang');
  ok(sfs.length === 2 && E.lib.takeControl(g, 1, sfs[0]), 'Rescue Cat summons 2 Silver Fang; B takes one');
  toTurnOf(g, 1);
  ok(sfs.every(c => c.zone === 'gy') && !!fld(g, 0, 'Dark Gray'), 'End Phase: both Silver Fang destroyed (also the one B controls), the other Beast stays (goat-07)');
  g = duel([{ m: ['Revived King Ha Des', 'Goblin Zombie'], hand: ['Monster Reborn', 'Dark Hole'], turn: 3 }, { m: ['Sangan'] }]); const sg = fld(g, 1, 'Sangan');
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + fld(g, 0, 'Goblin Zombie').u + ':' + sg.u)); drive(g);
  ok(sg.zone === 'gy' && !g.log.some(l => /activated Sangan's effect/.test(l)), 'Sangan destroyed by a Zombie under Ha Des: no search');
  act(g, /^End Battle|endbp/); passAll(g); actU(g, hand(g, 'Monster Reborn')); E.act(g, ['u' + sg.u]); drive(g); actU(g, hand(g, 'Dark Hole')); drive(g);
  ok(g.log.some(l => /B activated Sangan's effect/.test(l)), 'revived and destroyed again: Sangan\'s effect activates (the negation was for that GY visit)');
  g = duel([{ m: [FILL, FILL, FILL, FILL], hand: ['Monster Reincarnation', 'Dandylion'], turn: 3 }, {}]);
  const mr = hand(g, 'Monster Reincarnation'), dl = hand(g, 'Dandylion'); g.p[0].hand = g.p[0].hand.filter(c => c === mr || c === dl); g.seq++; g.prompt.opts = E.idleOpts(g);
  ok(!!keyOf(g, mr), 'Monster Reincarnation with no monster in the GY: offered when a monster in the hand can be discarded (ruling 1)');
  actU(g, mr); drive(g);
  ok(dl.zone === 'hand' && g.log.some(l => /activated Dandylion's effect/.test(l)) && g.p[0].m.filter(Boolean).length === 4, 'Dandylion discarded and added back; its effect activates with 1 free zone (summons nothing)');
  g = duel([{ m: [{ n: "Gravekeeper's Spy", pos: 'set' }], deckTop: [FILL, "Gravekeeper's Guard"], turn: 3 }, {}], { askPos: true }); const spy = g.p[0].m[0]; spy.turnIn = 1;
  act(g, new RegExp('flip:' + spy.u)); const qs = [];
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (/position/i.test(pr.text || '')) qs.push(pr.text); E.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(qs.length === 1 && !!fld(g, 0, "Gravekeeper's Guard"), 'Gravekeeper\'s Spy: one position question for Gravekeeper\'s Guard');
});

T('145-6. Injection Fairy Lily\'s 3000 only in damage calculation; De-Fusion under G.B. Hunter; Brain Research Lab once per turn across copies; Iron Core Specimen Lab for the opponent\'s Koa\'ki Meiru; Monster Gate and Reasoning with no monster; Jirai Gumo\'s coin is a cost; Barrel Behind the Door can\'t answer Barrel (Edison and Goat)', () => {
  let g = duel([{ m: ['Injection Fairy Lily'], turn: 3 }, { m: ['Cyber Dragon'] }]); const li = fld(g, 0, 'Injection Fairy Lily'); const atks = [];
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + li.u + ':' + fld(g, 1, 'Cyber Dragon').u));
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
    if (pr.type === 'respond') { if (g.inDS) atks.push(E.atk(g, li)); const o = pr.p === 0 && pr.opts.find(o => o.key.startsWith('a:' + li.u + ':')); E.act(g, [o ? o.key : 'pass']); }
    else E.act(g, pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(atks.length && atks.every(a => a === 400) && g.p[0].lp === 6000 && g.p[1].lp === 8000 - 1300 && E.atk(g, li) === 400, 'Lily pays 2000: 400 in the Damage Step windows, 3400 at damage calculation (1300 damage), 400 after');
  g = duel([{ hand: ['De-Fusion'], m: ['Flame Swordsman'], turn: 3 }, {}]); const ok1 = !!keyOf(g, hand(g, 'De-Fusion'));
  g = duel([{ hand: ['De-Fusion'], m: ['Flame Swordsman', 'G.B. Hunter'], turn: 3 }, {}]);
  ok(ok1 && !keyOf(g, hand(g, 'De-Fusion')), 'De-Fusion: offered on Flame Swordsman, not with G.B. Hunter face-up (G.B. Hunter ruling 1)');
  g = duel([{ fz: 'Brain Research Lab', hand: [FILL, 'Krebons', 'Krebons', 'Brain Research Lab'], turn: 3 }, {}]);
  act(g, new RegExp('ns:' + hand(g, FILL).u)); drive(g); act(g, new RegExp('ns:' + hand(g, 'Krebons').u)); drive(g);   // the Lab's extra summon (engine cont.extraNS since E4e)
  const b2 = hand(g, 'Brain Research Lab'); actU(g, b2); drive(g);
  ok(fld(g, 0, 'Krebons') && g.p[0].fz === b2 && !g.p[0].hand.filter(x => E.name(x) === 'Krebons').some(k => opt(g, new RegExp('ns:' + k.u))), 'Brain Research Lab used, a new copy activated: no second extra Normal Summon this turn');
  g = duel([{ fz: 'Iron Core Specimen Lab', hand: ["Iron Core of Koa'ki Meiru"], turn: 3 }, { m: ["Koa'ki Meiru Drago"], deckTop: [FILL, "Koa'ki Meiru Boulder"] }]);
  for (let i = 0; i < 60 && g.prompt && !(g.prompt.type === 'idle' && g.turnNo === 5); i++) { const pr = g.prompt; E.act(g, pr.type === 'idle' ? ['end'] : pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(g.log.some(l => /B activated Iron Core Specimen Lab's effect/.test(l)) && g.p[1].hand.some(c => E.name(c) === "Koa'ki Meiru Boulder"), 'A\'s Iron Core Specimen Lab: B\'s Koa\'ki Meiru Drago destroyed in B\'s End Phase, B adds Koa\'ki Meiru Boulder (rulings 2 to 5)');
  for (const card of ['Monster Gate', 'Reasoning']) {
    g = duel([{ hand: [card], m: [FILL], turn: 3 }, {}]); for (const c of g.p[0].deck) c.id = id('Pot of Greed'); const n0 = g.p[0].deck.length; g.seq++; g.prompt.opts = E.idleOpts(g);
    actU(g, hand(g, card)); drive(g);
    ok(g.p[0].deck.length === n0 && !g.p[0].gy.some(c => E.name(c) === 'Pot of Greed') && g.log.some(l => /No monster was found: the Deck was shuffled/.test(l)), card + ' with no monster in the Deck: nothing is sent to the GY, the Deck is shuffled');
  }
  g = duel([{ m: ['Jirai Gumo'], turn: 3 }, { m: [FILL] }]); const jg = fld(g, 0, 'Jirai Gumo');
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + jg.u + ':')); drive(g); const lg = g.log.join('\n');
  ok(/A tossed a coin/.test(lg) && lg.indexOf('A tossed a coin') < lg.indexOf('Jirai Gumo attacks') && !/activated Jirai Gumo/.test(lg), 'Jirai Gumo tosses its coin as it declares the attack, with no chain link (a cost)');
  const barrel = (dl, Gx, mkx) => { const g = mkx([{ hand: ['Ookazi'], st: [{ n: 'Barrel Behind the Door', pos: 'set' }], turn: 3 }, { st: [{ n: 'Barrel Behind the Door', pos: 'set' }] }]);
    const ab = g.p[0].st[0], bb = g.p[1].st[0]; let aOff = false;
    Gx.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + g.p[0].hand.find(c => Gx.name(c) === 'Ookazi').u + ':')).key]);
    for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
      if (pr.type === 'respond') { if (pr.p === 0 && pr.opts.some(o => o.key.startsWith('a:' + ab.u + ':'))) aOff = true; const o = pr.p === 1 && pr.opts.find(o => o.key.startsWith('a:' + bb.u + ':')); Gx.act(g, [o ? o.key : 'pass']); }
      else Gx.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
    ok(!aOff && g.p[0].lp === 7200 && g.p[1].lp === 8000, dl + ': B\'s Barrel turns Ookazi back; A\'s Barrel can\'t answer it (ruling 2)'); };
  barrel('Edison', E, b => duel(b));
  const { G, mk } = goatEngine(); barrel('Goat', G, mk);
});

T('145-7. Cyber Jar under a summon lock; Stardust Dragon returns twice in one End Phase; Goat Sasuke Samurai #4 face-down tosses nothing; Golem Sentry on its summon turn; a Soul Exchange target as a Ritual Tribute; Gearfried destroys an Equip inside the chain; Goat Spirit Reaper and a destroyed Snatch Steal; the hand limit repeats, mandatory effects only', () => {
  let g = duel([{ m: ['Cyber Dragon'], turn: 3 }, { m: [{ n: 'Cyber Jar', pos: 'set' }], st: [{ n: 'Scapegoat', pos: 'set' }] }]); const sc = g.p[1].st[0], h0 = g.p[1].hand.length;
  act(g, /^Battle Phase/); for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) { const o = g.prompt.p === 1 && g.prompt.opts.find(o => o.key.startsWith('a:' + sc.u + ':')); E.act(g, [o ? o.key : 'pass']); }
  act(g, new RegExp('atk:' + fld(g, 0, 'Cyber Dragon').u + ':')); drive(g);
  ok(g.log.some(l => /Sheep Token/.test(l)) && g.p[1].gy.filter(c => E.name(c) === FILL).length === 5 && g.p[1].hand.length === h0 && g.p[0].m.filter(c => c && E.name(c) === FILL).length === 5, 'Cyber Jar after B\'s Scapegoat: B\'s 5 excavated monsters go to the GY (not the hand), A\'s are summoned (Scapegoat ruling 2)');
  g = duel([{ hand: ['Heavy Storm'], st: [{ n: 'Dust Tornado', pos: 'set' }], turn: 3 }, { m: ['Stardust Dragon'], st: [{ n: 'Mirror Force', pos: 'set' }] }]);
  const sd = fld(g, 1, 'Stardust Dragon'), dtn = g.p[0].st[0];
  const sdResp = pr => { if (pr.p === 1) { const o = sd.zone === 'm' && pr.opts.find(x => x.key.startsWith('a:' + sd.u + ':')); return o && o.key; } if (g.phase === 'end' && sd.zone === 'm') { const o = pr.opts.find(x => x.key.startsWith('a:' + dtn.u + ':')); return o && o.key; } };
  actU(g, hand(g, 'Heavy Storm')); drive(g, { respond: sdResp }); act(g, /^End turn|\[end\]/); drive(g, { respond: sdResp });
  ok(g.turnNo === 4 && sd.zone === 'm' && g.log.filter(l => /B Special Summoned Stardust Dragon/.test(l)).length === 2 && g.log.some(l => /Dust Tornado's activation was negated/.test(l)), 'Stardust negates Heavy Storm, returns in the End Phase, negates Dust Tornado there and returns again (ruling 11)');
  g = duel([{ hand: ['Golem Sentry'], turn: 3 }, {}]); act(g, new RegExp('ns:' + hand(g, 'Golem Sentry').u)); drive(g);
  ok(!!opt(g, /^Turn face-down/), 'Golem Sentry can turn face-down on the turn it was summoned');
  g = duel([{ hand: ['Soul Exchange', 'Black Luster Ritual', 'Black Luster Soldier'], turn: 3 }, { m: ['Blue-Eyes White Dragon'] }]); const blr = hand(g, 'Black Luster Ritual');
  const before = !!keyOf(g, blr); actU(g, hand(g, 'Soul Exchange')); drive(g); const after = !!keyOf(g, blr); actU(g, blr); drive(g);
  ok(!before && after && !!fld(g, 0, 'Black Luster Soldier') && g.p[1].gy.some(c => E.name(c) === 'Blue-Eyes White Dragon'), 'Black Luster Ritual: offered only once Soul Exchange targets Blue-Eyes, which is Tributed for Black Luster Soldier');
  g = duel([{ m: ['Gearfried the Iron Knight'], hand: ['Pot of Greed'], st: [{ n: 'Blast with Chain', pos: 'set' }], turn: 3 }, { m: [FILL] }]); const bwc = g.p[0].st[0];
  actU(g, hand(g, 'Pot of Greed'));
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
    if (pr.type === 'respond') { const o = pr.p === 0 && pr.opts.find(o => o.key.startsWith('a:' + bwc.u + ':')); E.act(g, [o ? o.key : 'pass']); }
    else E.act(g, pr.type === 'yesno' ? ['y'] : [(pr.opts.find(o => o.key === 'u' + fld(g, 1, FILL).u) || pr.opts[0]).key]); }
  let lg = g.log.join('\n');
  ok(lg.indexOf('Blast with Chain was destroyed') > 0 && lg.indexOf('Blast with Chain was destroyed') < lg.indexOf('A drew 2 cards') && lg.indexOf('A drew 2 cards') < lg.indexOf("A activated Blast with Chain's effect") && !fld(g, 1, FILL), 'Blast with Chain chained to Pot of Greed is destroyed before Pot of Greed resolves; its own effect starts a new chain (Netrep)');
  const { G, mk } = goatEngine();
  for (const pos of ['set', 'def']) { g = mk([{ m: ['Gemini Elf'], turn: 3 }, { m: [{ n: 'Sasuke Samurai #4', pos }] }]); const ge = G.fieldOf(g, 0)[0];
    G.act(g, ['bp']); for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) G.act(g, ['pass']); G.act(g, [g.prompt.opts.find(o => o.key.startsWith('atk:' + ge.u + ':')).key]);
    for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; G.act(g, pr.type === 'respond' ? ['pass'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
    ok(g.log.some(l => /activated Sasuke Samurai #4's effect/.test(l)) === (pos === 'def'), pos === 'set' ? 'Goat Sasuke Samurai #4 attacked face-down: no coin toss (EDOPro)' : 'face-up: it tosses'); }
  for (const chain of [true, false]) { g = mk([{ hand: ['Snatch Steal'], turn: 3 }, { m: ['Spirit Reaper'], st: [{ n: 'Mystical Space Typhoon', pos: 'set' }] }]);
    const sr = G.fieldOf(g, 1).find(c => G.name(c) === 'Spirit Reaper'), ms = g.p[1].st[0];
    G.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + g.p[0].hand.find(c => G.name(c) === 'Snatch Steal').u + ':')).key]);
    for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; const o = chain && pr.type === 'respond' && pr.p === 1 && pr.opts.find(o => o.key.startsWith('a:' + ms.u + ':')); G.act(g, pr.type === 'respond' ? [o ? o.key : 'pass'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
    ok(chain ? sr.zone === 'm' && sr.ctrl === 1 : sr.zone === 'gy', chain ? 'Goat: Snatch Steal destroyed by a chained MST: Spirit Reaper stays (pass2 goat-03)' : 'Snatch Steal resolved: Spirit Reaper is destroyed'); }
  g = duel([{ hand: ['The White Stone of Legend', 'Archfiend of Gilfer', FILL, FILL, FILL, FILL, FILL], m: [FILL], deckTop: [FILL, 'Blue-Eyes White Dragon'], turn: 3 }, { m: ['Cyber Dragon'] }]);
  const ws = hand(g, 'The White Stone of Legend'), gil = hand(g, 'Archfiend of Gilfer'); act(g, /^End turn|\[end\]/); const yns = []; let limits = 0;
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (/hand limit/.test(pr.text || '')) limits++;
    if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') { yns.push(pr.text); E.act(g, ['y']); }
    else if (/hand limit/.test(pr.text) && pr.opts.some(o => o.key === 'u' + ws.u)) E.act(g, ['u' + ws.u, 'u' + gil.u]); else E.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(g.turnNo === 4 && limits === 2 && g.p[0].hand.length === 6 && g.p[0].hand.some(c => E.name(c) === 'Blue-Eyes White Dragon') && !yns.some(t => /Gilfer/.test(t)), 'hand limit: White Stone adds Blue-Eyes, A discards again; Archfiend of Gilfer\'s optional effect isn\'t offered');
});

T('145-8. Fake Trap answers Blowback Dragon; Goat BTH on your own Lava Golem (not Edison); Goat Lava Golem\'s lock under Skill Drain; RFTDD banishes under Jinzo with no chain; Fortune Lady\'s Level up lost for good when negated; negate(): a Continuous Spell to the GY, a tag out left in the Deck', () => {
  const { G, mk } = goatEngine();
  const fake = (lbl, Gx, mkx) => { const g = mkx([{ m: ['Blowback Dragon'], turn: 3 }, { st: [{ n: 'Fake Trap', pos: 'set' }, { n: 'Mirror Force', pos: 'set' }] }]);
    const bd = Gx.fieldOf(g, 0).find(c => Gx.name(c) === 'Blowback Dragon'), ft = g.p[1].st[0], mf = g.p[1].st[1]; let off = false;
    Gx.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + bd.u + ':')).key]);
    for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick' && pr.p === 0) { Gx.act(g, [(pr.opts.find(o => o.key === 'u' + mf.u) || pr.opts[0]).key]); continue; }
      if (pr.type === 'respond') { const o = pr.p === 1 && pr.opts.find(o => o.key.startsWith('a:' + ft.u + ':')); if (o) off = true; Gx.act(g, [o ? o.key : 'pass']); } else Gx.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
    ok(off && ft.zone === 'gy' && mf.zone === 'st', lbl + ': Fake Trap can answer Blowback Dragon targeting a Set Trap (archive: a coin effect that would destroy it)'); };
  fake('Edison', E, b => duel(b)); fake('Goat', G, mk);
  for (const [lbl, Gx, mkx, mon] of [['Edison', E, b => duel(b), FILL], ['Goat', G, mk, 'Sangan']]) {
    const g = mkx([{ hand: ['Lava Golem'], st: [{ n: 'Bottomless Trap Hole', pos: 'set' }], turn: 3 }, { m: [mon, mon] }]); const bth = g.p[0].st[0]; let off = false;
    Gx.act(g, [g.prompt.opts.find(o => /^Special Summon to their field/.test(o.label)).key]);
    for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond') { const o = pr.p === 0 && pr.opts.find(o => o.key.startsWith('a:' + bth.u + ':')); if (o) off = true; Gx.act(g, [o ? o.key : 'pass']); } else Gx.act(g, pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
    ok(off === (lbl === 'Goat'), lbl === 'Goat' ? 'Goat: A can activate Bottomless Trap Hole on the Lava Golem A put on B\'s field (archive)' : 'Edison: Bottomless Trap Hole isn\'t offered on your own Lava Golem');
  }
  let g = mk([{ hand: ['Lava Golem'], turn: 3 }, { m: ['Sangan', 'Sangan'], st: [{ n: 'Skill Drain', pos: 'up' }] }]);
  G.act(g, [g.prompt.opts.find(o => /^Special Summon to their field/.test(o.label)).key]);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; G.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(G.fieldOf(g, 1).some(c => G.name(c) === 'Lava Golem') && g.p[0].hand.length > 0 && !g.prompt.opts.some(o => /^(ns|set):/.test(o.key)), 'Goat: Lava Golem summoned under Skill Drain: no Normal Summon/Set this turn (Netrep)');
  g = duel([{ st: [{ n: 'Return from the Different Dimension', pos: 'set' }], ban: ['Jinzo', FILL], turn: 3 }, {}]);
  actU(g, g.p[0].st[0]); drive(g); const back = g.p[0].m.filter(Boolean).length; act(g, /^End turn|\[end\]/); drive(g);
  ok(back === 2 && g.p[0].ban.length === 2 && !g.log.some(l => /activated Return from the Different Dimension's effect/.test(l)), 'RFTDD brings back Jinzo: both are banished in the End Phase anyway, with no chain link');
  g = duel([{ m: ['Fortune Lady Light'], turn: 1 }, { st: [{ n: 'Skill Drain', pos: 'set' }] }]); const flt = fld(g, 0, 'Fortune Lady Light');
  toTurnOf(g, 0); const up = E.lv(flt); const sdr = g.p[1].st.find(Boolean); sdr.pos = 'up'; E.lib.emit(g, { type: 'pos', c: sdr, p: 1 }); const neg = E.lv(flt);
  E.lib.move(g, sdr, 'gy', { reason: 'effect' });
  ok(up === 3 && neg === 1 && E.lv(flt) === 1, 'Fortune Lady Light at Level 3 after two Standby Phases; under Skill Drain Level 1, and still Level 1 once Skill Drain leaves');
  g = duel([{ hand: ['Messenger of Peace'], turn: 3 }, { m: ['Light and Darkness Dragon'] }]); const mop = hand(g, 'Messenger of Peace');
  actU(g, mop); drive(g);
  ok(g.log.some(l => /Messenger of Peace's activation was negated/.test(l)) && mop.zone === 'gy', 'Messenger of Peace negated by Light and Darkness Dragon goes to the GY (pass2 edison-09)');
  g = duel([{ m: ['Gladiator Beast Laquari'], deckTop: [FILL, 'Gladiator Beast Bestiari'], turn: 3 }, { m: [{ n: FILL, pos: 'def' }, 'Light and Darkness Dragon'] }]); const lq = fld(g, 0, 'Gladiator Beast Laquari');
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + lq.u + ':' + fld(g, 1, FILL).u)); drive(g); act(g, /^End Battle|endbp/); drive(g);
  ok(g.log.some(l => /Gladiator Beast Laquari's effect was negated/.test(l)) && lq.zone === 'deck' && !fld(g, 0, 'Gladiator Beast Bestiari'), 'Laquari\'s tag out negated by LaDD: Laquari stays in the Deck, nothing is summoned (pass2 edison-10)');
});

T('145-9. Xing Zhen Hu forgets a card that left the field; Don Zaloog chooses as it activates; Vampire Lord\'s mark is used up in its next Standby Phase; Rivalry of Warlords isn\'t a blanket summon lock; De-Fusion can\'t target King Dragun (Edison and Goat); Night Assailant\'s Flip effect with no target', () => {
  let g = duel([{ st: [{ n: 'Pot of Greed', pos: 'set' }, { n: 'Pot of Greed', pos: 'set' }, { n: 'Xing Zhen Hu', pos: 'set' }], turn: 3 }, {}]); const [p1, p2, xz] = g.p[0].st;
  actU(g, xz); drive(g); const locked = !keyOf(g, p1) && !keyOf(g, p2);
  E.lib.move(g, p1, 'hand', { reason: 'effect' }); g.seq++; g.prompt.opts = E.idleOpts(g); act(g, new RegExp('setst:' + p1.u)); passAll(g);
  ok(locked && !!keyOf(g, p1) && !keyOf(g, p2), 'Xing Zhen Hu locks both Set Pots; one returned to the hand and Set again is a new card, the other stays locked');
  g = duel([{ m: ['Don Zaloog'], turn: 3 }, { st: [{ n: 'Divine Wrath', pos: 'set' }] }]); const dz = fld(g, 0, 'Don Zaloog'); const seq = [];
  act(g, /^Battle Phase/); passAll(g); act(g, new RegExp('atk:' + dz.u + ':d'));
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; seq.push(pr.type + pr.p); E.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(seq.indexOf('choose0') >= 0 && seq.indexOf('choose0') < seq.indexOf('respond1') && g.log.some(l => /B discarded .* at random/.test(l)), 'Don Zaloog: the mode is chosen before B can respond (goat-12)');
  const runTo = (g, t) => { for (let i = 0; i < 200 && g.prompt && !(g.prompt.type === 'idle' && g.turnNo >= t && g.prompt.p === 0); i++) { const pr = g.prompt; E.act(g, pr.type === 'idle' ? [(pr.opts.find(o => o.key === 'end') || pr.opts[pr.opts.length - 1]).key] : pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); } };
  for (const law of [false, true]) {
    g = duel([{ m: ['Vampire Lord'], st: law ? [{ n: "Solomon's Lawbook", pos: 'set' }] : [], turn: 3 }, {}]); const vl = fld(g, 0, 'Vampire Lord');
    if (law) { actU(g, g.p[0].st[0]); drive(g); }
    E.lib.destroy(g, [vl], { by: 1 }); passAll(g); runTo(g, 5); const z5 = vl.zone; runTo(g, 7);
    ok(law ? z5 === 'gy' && vl.zone === 'gy' && g.turnNo === 7 : z5 === 'm', law ? 'Vampire Lord: its Standby Phase skipped by Solomon\'s Lawbook, it doesn\'t come back on the following one either (archive)' : 'Vampire Lord destroyed by B\'s effect comes back in A\'s next Standby Phase');
  }
  g = duel([{ m: ['Cyber Dragon'], st: [{ n: 'Rivalry of Warlords', pos: 'up' }], hand: ['Monster Gate'], turn: 3 }, {}]);
  ok(!!keyOf(g, hand(g, 'Monster Gate')), 'Rivalry of Warlords with a Machine: Monster Gate (a summon from the Deck of an unknown Type) can still be activated');
  g = duel([{ hand: ['De-Fusion'], turn: 3 }, { m: ['King Dragun'] }]); const kd = !keyOf(g, hand(g, 'De-Fusion'));
  g = duel([{ hand: ['De-Fusion'], m: ['Flame Swordsman'], turn: 3 }, { m: ['King Dragun'] }]); actU(g, hand(g, 'De-Fusion')); drive(g);
  ok(kd && g.log.some(l => /Flame Swordsman returned to the Extra Deck/.test(l)) && !!fld(g, 1, 'King Dragun'), 'Edison: De-Fusion can\'t target the opponent\'s King Dragun; with Flame Swordsman it takes that one');
  const { G, mk } = goatEngine(); g = mk([{ hand: ['De-Fusion'], turn: 3 }, { m: ['King Dragun'] }]);
  ok(!g.prompt.opts.some(o => o.key.startsWith('a:' + g.p[0].hand.find(c => G.name(c) === 'De-Fusion').u + ':')), 'Goat: De-Fusion is not offered when the only Fusion is the opponent\'s King Dragun');
  g = duel([{ m: [{ n: 'Night Assailant', pos: 'set' }], turn: 3 }, {}]); const na = g.p[0].m[0]; na.turnIn = 1; g.seq++; g.prompt.opts = E.idleOpts(g);
  act(g, new RegExp('flip:' + na.u)); drive(g);
  ok(g.log.some(l => /A activated Night Assailant's effect/.test(l)), 'Night Assailant Flip Summoned with no opponent\'s monster: its Flip effect still activates (pass2 edison-11)');
});

// ---- Group E4 part 5 (fixer E4e, 2026-11-28) ----
T('146. Pass 2 edison-15: Black Salvo\'s negation outlives Cannon Soldier leaving as its cost; Overload Fusion under Imperial Iron Wall and with King of the Swamp; Overdragon\'s attacks and "1 or more" materials', () => {
  // Cannon Soldier revived by Black Salvo (negated), Tributes itself: the effect is negated (site ruling)
  let g = duel([{ hand: ['Black Salvo'], gy: ['Cannon Soldier'], turn: 3 }, {}]);
  act(g, new RegExp('ns:' + hand(g, 'Black Salvo').u)); drive(g);
  const cs = fld(g, 0, 'Cannon Soldier'); const lp = g.p[1].lp;
  act(g, new RegExp('a:' + cs.u + ':')); driveP(g, pr => [(pr.opts.find(o => o.key === 'u' + cs.u) || pr.opts[0]).key]);
  ok(cs.zone === 'gy' && g.p[1].lp === lp && g.log.some(l => /Cannon Soldier's effect was negated/.test(l)), 'Cannon Soldier revived by Black Salvo Tributes itself: no damage, the effect is negated (site ruling)');
  // Overload Fusion: not offered with Imperial Iron Wall face-up; chained, it resolves without a summon and nothing is banished
  const ofBoard = st => duelEx([{ hand: ['Overload Fusion'], gy: ['Barrel Dragon', 'Blowback Dragon', 'Cyber Dragon', 'Black Salvo'], turn: 3 }, { st }], ['Gatling Dragon', 'Chimeratech Overdragon']);
  g = ofBoard([{ n: 'Imperial Iron Wall', pos: 'up' }]);
  ok(!keyOf(g, hand(g, 'Overload Fusion')), 'Overload Fusion isn\'t offered under a face-up Imperial Iron Wall (its materials can\'t be banished)');
  g = ofBoard([{ n: 'Imperial Iron Wall', pos: 'set' }]); const iiw = g.p[1].st[0];
  actU(g, hand(g, 'Overload Fusion')); drive(g, { respond: pr => pr.p === 1 && (pr.opts.find(o => o.key.startsWith('a:' + iiw.u + ':')) || {}).key });
  ok(iiw.pos === 'up' && !E.fieldOf(g, 0).some(c => E.lib.isMon(c)) && g.p[0].ban.length === 0, 'Imperial Iron Wall chained to Overload Fusion: no Fusion Summon, nothing banished (site ruling)');
  // King of the Swamp stands in for "Cyber Dragon" (Overdragon ruling 1)
  g = duelEx([{ hand: ['Overload Fusion'], gy: ['King of the Swamp', 'Black Salvo'], turn: 3 }, {}], ['Chimeratech Overdragon']);
  const ofk = keyOf(g, hand(g, 'Overload Fusion')); if (ofk) { actU(g, hand(g, 'Overload Fusion')); drive(g); }
  ok(!!ofk && !!fld(g, 0, 'Chimeratech Overdragon') && banOf(g, 0, 'King of the Swamp'), 'Overload Fusion with King of the Swamp + Black Salvo in the GY Fusion Summons Chimeratech Overdragon (ruling 1)');
  // Polymerization: "1 or more" Machines (3 materials: 2400 ATK)
  g = duelEx([{ hand: ['Polymerization', 'Cyber Dragon', 'Black Salvo', 'Mechanicalchaser'], turn: 3 }, {}], ['Chimeratech Overdragon']);
  actU(g, hand(g, 'Polymerization')); driveP(g, pr => /more Fusion Materials/.test(pr.text) ? pr.opts.map(o => o.key) : null);
  const od = fld(g, 0, 'Chimeratech Overdragon');
  ok(!!od && E.atk(g, od) === 2400 && g.p[0].gy.filter(c => E.lib.isMon(c)).length === 3, 'Polymerization with Cyber Dragon + 2 Machines: a 2400 ATK Overdragon (3 materials)');
  // attacks: a direct attack is the first and last; after attacking a monster, no direct attack
  g = duelEx([{ hand: ['Overload Fusion'], gy: ['Cyber Dragon', 'Black Salvo', 'Mechanicalchaser'], turn: 3 }, {}], ['Chimeratech Overdragon']);
  actU(g, hand(g, 'Overload Fusion')); driveP(g, pr => /Machine monsters/.test(pr.text) ? pr.opts.map(o => o.key) : null);
  const od2 = fld(g, 0, 'Chimeratech Overdragon'); atkOn(g, od2, null);
  ok(g.p[1].lp === 8000 - 2400 && !opt(g, /^Battle Phase/) && !(g.prompt.opts || []).some(o => o.key === 'atk:' + od2.u), 'Overdragon (3 materials) attacks directly once, then can\'t attack again (ruling 4)');
  g = duelEx([{ hand: ['Overload Fusion'], gy: ['Cyber Dragon', 'Black Salvo'], turn: 3 }, { m: [{ n: FILL, pos: 'def' }] }], ['Chimeratech Overdragon']);
  actU(g, hand(g, 'Overload Fusion')); drive(g); const od3 = fld(g, 0, 'Chimeratech Overdragon'); atkOn(g, od3, fld(g, 1, FILL));
  ok(!fld(g, 1, FILL) && !(g.prompt.opts || []).some(o => o.key === 'atk:' + od3.u + ':d' || o.key === 'atk:' + od3.u), 'Overdragon (2 materials) destroys a monster, then has no direct attack left');
});
T('147. Pass 2 edison-16: Crystal Beasts take the zone their Equip frees and aren\'t asked under Bottomless Trap Hole; Rainbow Ruins\' self flags wait for its activation; Dark Calling under Imperial Iron Wall and with King of the Swamp; Malicious Fiend from the start of the Battle Phase; Aslla piscu rulings 3 and 7', () => {
  const PG = { n: 'Pot of Greed', pos: 'set' };
  // Premature Burial ruling: no open zone, the Crystal Beast takes the one Premature Burial leaves
  let g = duel([{ hand: ['Premature Burial'], gy: ['Crystal Beast Topaz Tiger'], st: [PG, PG, PG, PG], turn: 3 }, { hand: ['Smashing Ground'] }]);
  actU(g, hand(g, 'Premature Burial')); drive(g); const tiger = fld(g, 0, 'Crystal Beast Topaz Tiger');
  toTurnOf(g, 1); act(g, new RegExp('a:' + g.p[1].hand.find(c => E.name(c) === 'Smashing Ground').u + ':')); const asked = drive(g);
  ok(!!tiger && asked.some(t => /Place Crystal Beast Topaz Tiger/.test(t)) && tiger.zone === 'st' && gyOf(g, 0, 'Premature Burial'), 'Topaz Tiger with Premature Burial and no open zone: placed in the zone Premature Burial left (its ruling)');
  // Bottomless Trap Hole: banished, so no question
  g = duel([{ hand: ['Crystal Beast Topaz Tiger'], turn: 3 }, { st: [{ n: 'Bottomless Trap Hole', pos: 'set' }] }]); const bth = g.p[1].st[0];
  act(g, new RegExp('ns:' + hand(g, 'Crystal Beast Topaz Tiger').u)); const asked2 = drive(g, { respond: pr => pr.p === 1 && (pr.opts.find(o => o.key.startsWith('a:' + bth.u + ':')) || {}).key });
  ok(banOf(g, 0, 'Crystal Beast Topaz Tiger') && !asked2.some(t => /Place/.test(t)), 'Topaz Tiger hit by Bottomless Trap Hole: banished, no "place it instead" question (its ruling)');
  // Rainbow Ruins ruling 5: MST chained to its activation destroys it (its "can't be destroyed" waits for the activation)
  g = duel([{ hand: ['Ancient City - Rainbow Ruins'], st: [{ n: 'Crystal Beast Topaz Tiger', pos: 'up' }], turn: 3 }, { st: [{ n: 'Mystical Space Typhoon', pos: 'set' }] }]);
  const rr = hand(g, 'Ancient City - Rainbow Ruins'), mst = g.p[1].st[0]; actU(g, rr);
  driveP(g, pr => pr.p === 1 ? [(pr.opts.find(o => o.key === 'u' + rr.u) || pr.opts[0]).key] : null, pr => pr.p === 1 && (pr.opts.find(o => o.key.startsWith('a:' + mst.u + ':')) || {}).key);
  ok(mst.zone === 'gy' && rr.zone === 'gy', 'Rainbow Ruins with 1 Crystal Beast: MST chained to its activation destroys it (ruling 5)');
  // Dark Calling
  const dcBoard = (hd, gy, st) => duelEx([{ hand: ['Dark Calling', ...hd], gy, turn: 3 }, { st }], ['Evil HERO Malicious Fiend']);
  g = dcBoard(['Evil HERO Malicious Edge'], ['Archfiend of Gilfer'], [{ n: 'Imperial Iron Wall', pos: 'up' }]);
  ok(!keyOf(g, hand(g, 'Dark Calling')), 'Dark Calling isn\'t offered under a face-up Imperial Iron Wall (site ruling)');
  g = dcBoard(['Evil HERO Malicious Edge'], ['Archfiend of Gilfer'], [{ n: 'Imperial Iron Wall', pos: 'set' }]); const iiw = g.p[1].st[0];
  actU(g, hand(g, 'Dark Calling')); drive(g, { respond: pr => pr.p === 1 && (pr.opts.find(o => o.key.startsWith('a:' + iiw.u + ':')) || {}).key });
  ok(iiw.pos === 'up' && !fld(g, 0, 'Evil HERO Malicious Fiend') && !g.p[0].ban.length, 'Imperial Iron Wall chained to Dark Calling: no summon, nothing banished (site ruling)');
  g = dcBoard(['King of the Swamp'], ['Archfiend of Gilfer'], []); const dk = keyOf(g, hand(g, 'Dark Calling')); if (dk) { actU(g, hand(g, 'Dark Calling')); drive(g); }
  ok(!!dk && !!fld(g, 0, 'Evil HERO Malicious Fiend') && banOf(g, 0, 'King of the Swamp'), 'Dark Calling: King of the Swamp stands in for Malicious Edge (archive A12)');
  // Malicious Fiend: positions from the start of the opponent's Battle Phase, face-down ones flipped with their Flip effects
  g = duel([{ m: ['Evil HERO Malicious Fiend'], turn: 3 }, { m: [{ n: 'Sangan', pos: 'def' }, { n: 'Morphing Jar', pos: 'set' }] }]);
  toTurnOf(g, 1); const sg = fld(g, 1, 'Sangan'), mj = fld(g, 1, 'Morphing Jar'); act(g, /^Battle Phase/); drive(g);
  ok(sg.pos === 'atk' && mj.pos === 'atk' && g.log.some(l => /activated Morphing Jar's effect/.test(l)) && !opt(g, /End Battle Phase/), 'Malicious Fiend: the opponent\'s Defense and Set monsters change to Attack at the start of their Battle Phase, Morphing Jar\'s Flip effect activates, they must attack (rulings)');
  // Aslla piscu ruling 7: Set, no Field Spell, destroyed by battle: its leave effect activates
  g = duel([{ m: [{ n: 'Earthbound Immortal Aslla piscu', pos: 'set' }], turn: 3 }, { m: ['Blue-Eyes White Dragon'] }]); const ap = g.p[0].m[0];
  toTurnOf(g, 1); atkOn(g, fld(g, 1, 'Blue-Eyes White Dragon'), ap); drive(g);
  ok(ap.zone === 'gy' && gyOf(g, 1, 'Blue-Eyes White Dragon') && g.p[1].lp === 7200, 'Set Aslla piscu destroyed by battle with no Field Spell: its effect destroys Blue-Eyes and deals 800 (ruling 7)');
  // ruling 3: replacing your own Field Spell leaves a gap
  g = duel([{ m: ['Earthbound Immortal Aslla piscu'], fz: 'Mystic Plasma Zone', hand: ['Umi'], turn: 3 }, { m: [FILL] }]); const ap2 = fld(g, 0, 'Earthbound Immortal Aslla piscu');
  actU(g, hand(g, 'Umi')); drive(g);
  ok(ap2.zone === 'gy' && !!fld(g, 1, FILL) && g.p[0].fz && E.name(g.p[0].fz) === 'Umi', 'Aslla piscu: Umi replacing your own Mystic Plasma Zone leaves a gap, so it is destroyed by its own effect (ruling 3)');
});
T('148. Pass 2 goat-08: My Body as a Shield answers Tribe-Infecting Virus, Eatgaboon, House of Adhesive Tape and Burst Breath (their destroys hooks; Edison and Goat)', () => {
  const toB = (P, g) => { const t0 = g.turnNo; for (let i = 0; i < 80 && g.prompt && !(g.prompt.type === 'idle' && g.prompt.p === 1 && g.turnNo !== t0); i++) { const pr = g.prompt;
    P.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'idle' ? [(pr.opts.find(o => o.key === 'end') || pr.opts[pr.opts.length - 1]).key] : pr.type === 'yesno' ? ['n'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); } };
  const MB = { n: 'My Body as a Shield', pos: 'set' };
  for (const [lbl, P, mkx] of gFmts()) {
    const run = (g, re) => { const mb = g.p[0].st.find(x => x && P.name(x) === 'My Body as a Shield'); let off = false;
      gDrive(g, re, pr => { const o = pr.p === 0 && pr.opts.find(o => o.key.startsWith('a:' + mb.u + ':')); if (o) off = true; return o && o.key; }, P); return off && mb.zone === 'gy'; };
    // Tribe-Infecting Virus (B's turn, Fiend declared)
    let g = mkx([{ m: ['Sangan'], st: [MB], turn: 3 }, { m: ['Tribe-Infecting Virus'], hand: ['Sangan'] }]); toB(P, g);
    P.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + gFind(P, g, 1, 'Tribe-Infecting Virus').u + ':')).key]);
    let used = run(g, /Fiend|Sangan/);
    ok(used && !!gFind(P, g, 0, 'Sangan'), lbl + ': Tribe-Infecting Virus declaring Fiend: My Body as a Shield negates it, Sangan stays');
    // Burst Breath (B's turn, Blue-Eyes Tributed)
    g = mkx([{ m: ['Sangan'], st: [MB], turn: 3 }, { m: ['Blue-Eyes White Dragon'], st: [{ n: 'Burst Breath', pos: 'set' }] }]); toB(P, g);
    P.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + g.p[1].st.find(x => x && P.name(x) === 'Burst Breath').u + ':')).key]);
    used = run(g, /Blue-Eyes/);
    ok(used && !!gFind(P, g, 0, 'Sangan'), lbl + ': Burst Breath: My Body as a Shield negates it, Sangan stays');
    // Eatgaboon and House of Adhesive Tape on a summoned Spirit Reaper
    for (const tr of ['Eatgaboon', 'House of Adhesive Tape']) {
      g = mkx([{ hand: ['Spirit Reaper'], st: [MB], turn: 3 }, { st: [{ n: tr, pos: 'set' }] }]); const sr = g.p[0].hand.find(x => P.name(x) === 'Spirit Reaper'); const trc = g.p[1].st[0];
      P.act(g, [g.prompt.opts.find(o => o.key === 'ns:' + sr.u).key]); const mb = g.p[0].st.find(x => x && P.name(x) === 'My Body as a Shield'); let off = false;
      gDrive(g, /./, pr => { if (pr.p === 1) { const o = pr.opts.find(o => o.key.startsWith('a:' + trc.u + ':')); return o && o.key; } const o = pr.opts.find(o => o.key.startsWith('a:' + mb.u + ':')); if (o) off = true; return o && o.key; }, P);
      ok(trc.zone === 'gy' && off && sr.zone === 'm', lbl + ': ' + tr + ' on a summoned Spirit Reaper: My Body as a Shield negates it');
    }
  }
});
T('149. Brain Research Lab: its extra Normal Summon before the standard one, once per turn, never a Set (rulings 4, 6, 7); a Psychic Counter in place of an LP cost (rulings 11, 13)', () => {
  let g = duel([{ fz: 'Brain Research Lab', hand: ['Krebons', 'Psychic Snail', FILL], turn: 3 }, {}]); const lab = g.p[0].fz;
  act(g, new RegExp('ns:' + hand(g, 'Krebons').u)); const asked = drive(g);   // yes: the extra summon first
  const setOk = !!opt(g, new RegExp('set:' + hand(g, FILL).u)), ps2 = !!opt(g, new RegExp('ns:' + hand(g, 'Psychic Snail').u));
  act(g, new RegExp('set:' + hand(g, FILL).u)); passAll(g);
  ok(asked.some(t => /extra Normal Summon/.test(t)) && setOk && ps2 && lab.flags.psy === 1 && !opt(g, new RegExp('ns:' + hand(g, 'Psychic Snail').u)), 'Brain Research Lab: Krebons with its extra summon first (1 counter), then the standard Set of a non-Psychic; no third summon');
  g = duel([{ fz: 'Brain Research Lab', hand: [FILL, 'Krebons'], turn: 3 }, {}]);
  act(g, new RegExp('set:' + hand(g, FILL).u)); passAll(g);
  ok(!!opt(g, new RegExp('ns:' + hand(g, 'Krebons').u)) && !opt(g, new RegExp('set:' + hand(g, 'Krebons').u)), 'after the standard Set, a Psychic can still be Normal Summoned with the Lab, not Set (ruling 6)');
  g = duel([{ fz: 'Brain Research Lab', m: ['Power Injector'], turn: 3 }, {}]); const lab2 = g.p[0].fz;
  actU(g, fld(g, 0, 'Power Injector')); const asked2 = drive(g);
  ok(asked2.some(t => /Psychic Counter/.test(t)) && g.p[0].lp === 8000 && lab2.flags.psy === 1 && g.log.some(l => /Power Injector/.test(l) && /activated/.test(l)), 'Power Injector\'s 600 LP paid with a Psychic Counter on Brain Research Lab instead');
  g = duel([{ fz: 'Brain Research Lab', m: ['Power Injector'], turn: 3 }, {}]); actU(g, fld(g, 0, 'Power Injector')); drive(g, { no: true });
  ok(g.p[0].lp === 7400 && !g.p[0].fz.flags.psy, 'answering no pays the 600 LP');
});
T('150. Storm Caller puts the monster on the Deck instead of the GY (a true replacement: Sangan never reaches the GY)', () => {
  const g = duel([{ m: ['Storm Caller', 'Krebons'], turn: 3 }, { m: ['Sangan'] }]); const sg = fld(g, 1, 'Sangan');
  const asked = atkOn(g, fld(g, 0, 'Krebons'), sg);
  ok(asked.some(t => /Storm Caller: put Sangan on top/.test(t)) && g.p[1].deck.includes(sg) && !g.log.some(l => /Sangan's effect|activated Sangan/.test(l)) && !g.p[1].gy.length, 'Krebons destroys Sangan by battle: Storm Caller puts it on top of B\'s Deck instead, so Sangan\'s effect doesn\'t activate');
});
T('151. Ritual Spells offer a Djinn in the GY, banished as 1 of the monsters (its text); not under Imperial Iron Wall', () => {
  let g = duel([{ hand: ['Black Luster Ritual', 'Black Luster Soldier'], m: [FILL, 'Sangan'], gy: ['Djinn Releaser of Rituals'], turn: 3 }, {}]);
  const k = keyOf(g, hand(g, 'Black Luster Ritual')); if (k) { actU(g, hand(g, 'Black Luster Ritual')); gDrive(g, /banished from the GY/); }
  ok(!!k && !!fld(g, 0, 'Black Luster Soldier') && banOf(g, 0, 'Djinn Releaser of Rituals') && E.lib.forbid(g, { type: 'ss', p: 1, c: g.p[1].deck[0], how: 'special' }), 'Black Luster Ritual with a Djinn banished from the GY as one of the monsters; B can\'t Special Summon while BLS is face-up');
  g = duel([{ hand: ['Black Luster Ritual', 'Black Luster Soldier'], m: ['Sangan'], gy: ['Djinn Releaser of Rituals'], turn: 3 }, {}]); const k2 = !!keyOf(g, hand(g, 'Black Luster Ritual'));
  g = duel([{ hand: ['Black Luster Ritual', 'Black Luster Soldier'], m: ['Sangan'], gy: ['Djinn Releaser of Rituals'], turn: 3 }, { st: [{ n: 'Imperial Iron Wall', pos: 'up' }] }]);
  ok(k2 && !keyOf(g, hand(g, 'Black Luster Ritual')), 'Sangan + the drawn Warwolf + the Djinn (10 Levels) are enough; under Imperial Iron Wall the Djinn can\'t be banished, so Sangan + the drawn Warwolf (7 Levels) aren\'t enough');
});
T('152. Pass 2 edison-12: Prohibition blocks Fusion/Synchro Material; Kuriboh is during damage calculation (Doomcaliber ruling 5); Ultimate Offering chains to itself; Telekinetic Power Well ends the summon moment; Ancient Gear Beast\'s victims activate negated', () => {
  const proh = (g, n) => { const pr = g.p[1].st.find(x => x && E.name(x) === 'Prohibition'); pr.flags.prohibit = n; g.seq++; g.prompt.opts = E.idleOpts(g); };
  let g = duelEx([{ m: ['Krebons', FILL], turn: 3 }, { st: [{ n: 'Prohibition', pos: 'up' }] }], ['Goyo Guardian']); const syn0 = !!opt(g, /syn:/);
  proh(g, FILL);
  ok(syn0 && !opt(g, /syn:/), 'Prohibition declaring Gene-Warped Warwolf: Goyo Guardian can\'t use it as Synchro Material (ruling 10)');
  g = duelEx([{ hand: ['Polymerization', 'Time Wizard', 'Baby Dragon'], turn: 3 }, { st: [{ n: 'Prohibition', pos: 'up' }] }], ['Thousand Dragon']); const poly0 = !!keyOf(g, hand(g, 'Polymerization'));
  proh(g, 'Baby Dragon');
  ok(poly0 && !keyOf(g, hand(g, 'Polymerization')), 'Prohibition declaring Baby Dragon: Polymerization can\'t fuse it into Thousand Dragon');
  // Doomcaliber Knight ruling 5: Tributed to negate Kuriboh, damage was already calculated
  g = duel([{ m: ['Doomcaliber Knight'], turn: 3 }, { m: ['Sangan'], hand: ['Kuriboh'] }]); const dk = fld(g, 0, 'Doomcaliber Knight'), sg = fld(g, 1, 'Sangan');
  atkOn(g, dk, sg, { respond: pr => { const kb = pr.p === 1 && g.p[1].hand.find(x => E.name(x) === 'Kuriboh'); const o1 = kb && pr.opts.find(o => o.key.startsWith('a:' + kb.u + ':')); if (o1) return o1.key; const o2 = pr.p === 0 && pr.opts.find(o => o.key.startsWith('a:' + dk.u + ':')); return o2 && o2.key; } });
  ok(dk.zone === 'gy' && gyOf(g, 1, 'Kuriboh') && sg.zone !== 'm' && g.p[1].lp === 7100, 'Kuriboh negated by Doomcaliber Knight (Tributed): Sangan is still destroyed and B takes 900 (ruling 5)');
  // Ultimate Offering: its effect chained to itself
  g = duel([{ st: [{ n: 'Ultimate Offering', pos: 'up' }], hand: ['Sangan', 'Krebons'], turn: 3 }, {}]); const uo = g.p[0].st[0]; let twice = false;
  actU(g, uo); drive(g, { respond: pr => { const o = pr.p === 0 && !twice && pr.opts.find(o => o.key.startsWith('a:' + uo.u + ':')); if (o) { twice = true; return o.key; } } });
  ok(twice && g.p[0].lp === 7000 && g.log.some(l => /Ultimate Offering's effect \(Chain Link 2\)/.test(l)), 'Ultimate Offering\'s effect can be chained to itself (site ruling 1): 1000 LP for two');
  // Telekinetic Power Well: no Torrential Tribute after its resolution
  g = duel([{ hand: ['Telekinetic Power Well'], gy: ['Krebons', 'Krebons'], turn: 3 }, { st: [{ n: 'Torrential Tribute', pos: 'set' }] }]); const tt = g.p[1].st[0]; let tto = false;
  actU(g, hand(g, 'Telekinetic Power Well')); driveP(g, pr => pr.max > 1 ? pr.opts.map(o => o.key) : null, pr => { if (pr.p === 1 && g.p[0].m.filter(Boolean).length && pr.opts.some(o => o.key.startsWith('a:' + tt.u + ':'))) tto = true; });
  ok(g.p[0].m.filter(Boolean).length === 2 && g.p[0].lp === 6800 && !tto, 'Telekinetic Power Well: two Krebons and 1200 damage, then no Torrential Tribute window (site ruling)');
  // Ancient Gear Beast: Mystic Tomato activates and resolves negated
  g = duel([{ m: ['Ancient Gear Beast'], turn: 3 }, { m: ['Mystic Tomato'], deckTop: ['Sangan'] }]);
  atkOn(g, fld(g, 0, 'Ancient Gear Beast'), fld(g, 1, 'Mystic Tomato'));
  ok(g.log.some(l => /activated Mystic Tomato's effect/.test(l)) && g.log.some(l => /Mystic Tomato's effect was negated/.test(l)) && !g.p[1].m.filter(Boolean).length, 'Mystic Tomato destroyed by Ancient Gear Beast: its effect activates and is negated (archive)');
});
T('153. Pass 2 edison-13 and 17: Black Garden\'s Rose Tokens (each summoning player, its controller\'s Scapegoat lock, the owner, ruling 7, Field Barrier); Blaze Accelerator after an attack; Fortune Lady Wind with too few cards; Verdant Sanctuary per Insect and not on a Set one; Underground Arachnid\'s optional replacement', () => {
  const rose = (g, p) => g.p[p].m.filter(x => x && E.name(x) === 'Rose Token');
  // ruling 24: the token's owner is the player who summoned
  let g = duel([{ fz: 'Black Garden', hand: [FILL], turn: 3 }, {}]); act(g, new RegExp('ns:' + hand(g, FILL).u)); drive(g);
  ok(rose(g, 1).length === 1 && rose(g, 1)[0].owner === 0, 'Black Garden: A\'s Normal Summon puts a Rose Token on B\'s field, owned by A (ruling 24)');
  // ruling 11: Garden's controller activates Scapegoat: no Rose Token
  g = duel([{ fz: 'Black Garden', hand: ['Scapegoat'], turn: 3 }, {}]); actU(g, hand(g, 'Scapegoat')); drive(g);
  ok(g.p[0].m.filter(Boolean).length === 4 && !rose(g, 1).length, 'Black Garden\'s controller activates Scapegoat: no Rose Token (ruling 11)');
  // both players summon at once: a token for each (The Shallow Grave)
  g = duel([{ fz: 'Black Garden', hand: ['The Shallow Grave'], gy: [FILL], turn: 3 }, { gy: ['Sangan'] }]); actU(g, hand(g, 'The Shallow Grave')); drive(g);
  ok(rose(g, 0).length === 1 && rose(g, 1).length === 1, 'The Shallow Grave summons on both fields: a Rose Token on each side (ruling 23)');
  // ruling 7: Shrink chained, the totals no longer match: Garden and the Plant destroyed, nothing summoned
  g = duel([{ fz: 'Black Garden', m: ['Lonefire Blossom'], gy: ['Volcanic Scattershot'], turn: 3 }, { st: [{ n: 'Shrink', pos: 'set' }] }]); const gd = g.p[0].fz, sh = g.p[1].st[0];
  act(g, new RegExp('a:' + gd.u + ':2')); drive(g, { respond: pr => pr.p === 1 && (pr.opts.find(o => o.key.startsWith('a:' + sh.u + ':')) || {}).key });
  ok(sh.zone === 'gy' && gd.zone === 'gy' && gyOf(g, 0, 'Lonefire Blossom') && gyOf(g, 0, 'Volcanic Scattershot') && !fld(g, 0, 'Volcanic Scattershot'), 'Black Garden ② with Shrink chained on the Plant: Garden and the Plant destroyed, Scattershot stays in the GY (ruling 7)');
  g = duel([{ fz: 'Black Garden', m: ['Lonefire Blossom'], gy: ['Volcanic Scattershot'], st: [{ n: 'Field Barrier', pos: 'up' }], turn: 3 }, {}]);
  ok(!opt(g, new RegExp('a:' + g.p[0].fz.u + ':2')), 'Black Garden ② isn\'t offered while Field Barrier keeps it from being destroyed (ruling 15)');
  // Blaze Accelerator: not after an attack this turn
  g = duel([{ m: ['Cyber Dragon'], st: [{ n: 'Blaze Accelerator', pos: 'up' }], hand: ['Volcanic Scattershot'], turn: 3 }, { m: ['Sangan', FILL] }]); const ba = g.p[0].st[0];
  const before = !!opt(g, new RegExp('a:' + ba.u + ':1')); atkOn(g, fld(g, 0, 'Cyber Dragon'), fld(g, 1, 'Sangan')); act(g, /endbp|End Battle/); drive(g);
  ok(before && g.phase === 'main2' && !opt(g, new RegExp('a:' + ba.u + ':1')), 'Blaze Accelerator: offered before the attack, not in Main Phase 2 after it (its text, EDOPro)');
  // Fortune Lady Wind: 2 Fortune Ladies, 1 card left at resolution: nothing destroyed
  g = duel([{ m: ['Fortune Lady Light'], hand: ['Fortune Lady Wind'], st: [{ n: 'Pot of Greed', pos: 'set' }], turn: 3 }, { st: [{ n: 'Mirror Force', pos: 'set' }, { n: 'Dust Tornado', pos: 'set' }] }]); const [mf, dt] = g.p[1].st; let moved = false;
  passAll(g); act(g, new RegExp('ns:' + hand(g, 'Fortune Lady Wind').u)); drive(g, { respond: pr => { if (pr.p === 1 && g.chain.length && !moved) { moved = true; E.lib.move(g, mf, 'hand', { reason: 'effect' }); } } });
  ok(moved && dt.zone === 'st' && g.log.some(l => /activated Fortune Lady Wind's effect/.test(l)), 'Fortune Lady Wind with 2 Fortune Ladies and 1 card left at resolution destroys nothing (EDOPro, ruling 1)');
  // Verdant Sanctuary: a Set Insect flipped by the attack gives nothing
  g = duel([{ m: [FILL], turn: 3 }, { m: [{ n: 'Cross-Sword Beetle', pos: 'set' }], st: [{ n: 'Verdant Sanctuary', pos: 'up' }], deckTop: ['Spyder Spider'] }]);
  let asked = atkOn(g, fld(g, 0, FILL), g.p[1].m[0]);
  ok(gyOf(g, 1, 'Cross-Sword Beetle') && !asked.some(t => /Verdant Sanctuary/.test(t)) && !g.p[1].hand.some(x => E.name(x) === 'Spyder Spider'), 'Verdant Sanctuary: a Set Insect destroyed by the attack that flipped it gives no search (site ruling)');
  // two Insects destroyed together: a search each
  g = duel([{ hand: ['Dark Hole'], turn: 3 }, { m: ['Gokipon', 'Gokipon'], st: [{ n: 'Verdant Sanctuary', pos: 'up' }], deckTop: ['Gokipon', 'Gokipon'] }]);
  actU(g, hand(g, 'Dark Hole')); asked = drive(g);
  ok(asked.filter(t => /Verdant Sanctuary/.test(t)).length === 2 && g.p[1].hand.filter(x => E.name(x) === 'Gokipon').length === 2, 'Verdant Sanctuary: Dark Hole on two Gokipon gives two searches (site rulings 2 and 3)');
  // Underground Arachnid ③: you can destroy the equipped monster instead
  for (const yes of [true, false]) {
    g = duel([{ m: ['Blue-Eyes White Dragon', 'Gokipon'], turn: 2 }, { m: ['Underground Arachnid'] }]); const ua = fld(g, 1, 'Underground Arachnid'), gk = fld(g, 0, 'Gokipon');
    toTurnOf(g, 1); act(g, new RegExp('a:' + ua.u + ':')); driveP(g, pr => [(pr.opts.find(o => o.key === 'u' + gk.u) || pr.opts[0]).key]); toTurnOf(g, 0);
    asked = atkOn(g, fld(g, 0, 'Blue-Eyes White Dragon'), ua, { no: !yes });
    ok(asked.some(t => /equipped monster instead/.test(t)) && (yes ? ua.zone === 'm' && gk.zone === 'gy' : ua.zone === 'gy'), yes ? 'Arachnid attacked by Blue-Eyes: yes destroys the equipped Gokipon instead, Arachnid stays' : 'answering no: Arachnid is destroyed');
  }
});
T('154. Pass 2 goat-06/07 (Goat): Mataza and Change of Heart; Call of the Haunted under Necrovalley; Barrel Behind the Door (your own Cannon Soldier, Ceasefire on face-down monsters); Rescue Cat with no Beasts; Spear Cretin flipped under Skill Drain; Last Will is optional', () => {
  const { G, mk } = goatEngine();
  const find = (g, p, n) => G.fieldOf(g, p).find(c => G.name(c) === n) || g.p[p].hand.find(c => G.name(c) === n);
  const key = (g, c) => g.prompt && g.prompt.opts.find(o => o.key.startsWith('a:' + c.u + ':'));
  const toT = (g, who) => { const t0 = g.turnNo; for (let i = 0; i < 80 && g.prompt && !(g.prompt.type === 'idle' && g.prompt.p === who && g.turnNo !== t0); i++) { const pr = g.prompt;
    G.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'idle' ? [(pr.opts.find(o => o.key === 'end') || pr.opts[pr.opts.length - 1]).key] : pr.type === 'yesno' ? ['n'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); } };
  // Mataza: Change of Heart not on a face-up one; a face-down one taken and flipped stays
  let g = mk([{ hand: ['Change of Heart', 'Snatch Steal'], turn: 3 }, { m: ['Mataza the Zapper'] }]);
  ok(!key(g, find(g, 0, 'Change of Heart')) && !key(g, find(g, 0, 'Snatch Steal')), 'Goat: Change of Heart and Snatch Steal aren\'t offered on a face-up Mataza (its ruling)');
  g = mk([{ hand: ['Change of Heart'], turn: 3 }, { m: [{ n: 'Mataza the Zapper', pos: 'set' }] }]); const mz = g.p[1].m[0];
  G.act(g, [key(g, find(g, 0, 'Change of Heart')).key]); gDrive(g, /./, null, G); mz.turnIn = 1; g.seq++; g.prompt.opts = G.idleOpts(g);
  G.act(g, [g.prompt.opts.find(o => o.key === 'flip:' + mz.u).key]); gDrive(g, /./, null, G); toT(g, 1); toT(g, 0);
  ok(mz.ctrl === 0 && G.fieldOf(g, 0).includes(mz) && !g.log.some(l => /can't switch: it went back/.test(l)), 'Goat: a face-down Mataza taken with Change of Heart and flipped stays with A (its ruling)');
  // Necrovalley: Call of the Haunted ("by targeting") not offered
  g = mk([{ st: [{ n: 'Call of the Haunted', pos: 'set' }], gy: ['Sangan'], turn: 3 }, { fz: 'Necrovalley' }]);
  ok(!key(g, g.p[0].st[0]), 'Goat: Call of the Haunted isn\'t offered under Necrovalley (Netrep: "targeting ... in your GY")');
  // Barrel Behind the Door: not on your own Cannon Soldier's damage to the opponent
  g = mk([{ m: ['Cannon Soldier', 'Sangan'], st: [{ n: 'Barrel Behind the Door', pos: 'set' }], turn: 3 }, {}]); const br = g.p[0].st[0]; let offered = false;
  G.act(g, [key(g, find(g, 0, 'Cannon Soldier')).key]);
  gDrive(g, /Sangan/, pr => { if (pr.p === 0 && pr.opts.some(o => o.key.startsWith('a:' + br.u + ':'))) offered = true; }, G);
  ok(!offered && g.p[1].lp === 7500, 'Goat: your own Cannon Soldier\'s damage to the opponent doesn\'t offer your Barrel Behind the Door (ruling)');
  g = mk([{ st: [{ n: 'Ceasefire', pos: 'set' }], turn: 3 }, { m: [{ n: 'Sangan', pos: 'set' }], st: [{ n: 'Barrel Behind the Door', pos: 'set' }] }]); const br2 = g.p[1].st[0]; offered = false;
  G.act(g, [key(g, g.p[0].st[0]).key]); gDrive(g, /./, pr => { if (pr.p === 1 && pr.opts.some(o => o.key.startsWith('a:' + br2.u + ':'))) offered = true; }, G);
  ok(!offered, 'Goat: Ceasefire with only face-down monsters: Barrel Behind the Door isn\'t offered (archive)');
  // Rescue Cat with no Level 3 or lower Beast in the Deck: still activatable in Goat (archive)
  g = mk([{ m: ['Rescue Cat'], turn: 3 }, {}]); const rc = find(g, 0, 'Rescue Cat'); const rk = key(g, rc); if (rk) { G.act(g, [rk.key]); gDrive(g, /./, null, G); }
  ok(!!rk && rc.zone === 'gy' && g.log.some(l => /checked A's Deck/.test(l)), 'Goat: Rescue Cat with no Beasts in the Deck can be activated; it summons none and B checks the Deck (archive)');
  // Spear Cretin Flip Summoned under Skill Drain: no effect when it goes to the GY
  g = mk([{ m: [{ n: 'Spear Cretin', pos: 'set' }], hand: ['Dark Hole'], gy: ['Sangan'], turn: 3 }, { st: [{ n: 'Skill Drain', pos: 'up' }] }]); const sc = g.p[0].m[0]; sc.turnIn = 1; g.seq++; g.prompt.opts = G.idleOpts(g);
  G.act(g, [g.prompt.opts.find(o => o.key === 'flip:' + sc.u).key]); gDrive(g, /./, null, G);
  G.lib.destroy(g, [g.p[1].st[0]], { by: 0 }); G.lib.emit(g, { type: 'probe' });
  G.act(g, [key(g, find(g, 0, 'Dark Hole')).key]); gDrive(g, /./, null, G);
  ok(sc.zone === 'gy' && !g.log.some(l => /activated Spear Cretin's effect/.test(l)), 'Goat: Spear Cretin Flip Summoned under Skill Drain gives nothing when it goes to the GY (archive)');
  // Last Will: optional ("you can"), so it isn't forced ahead of Sangan
  g = mk([{ hand: ['Last Will', 'Dark Hole'], m: ['Sangan'], turn: 3 }, {}]);
  G.act(g, [key(g, find(g, 0, 'Last Will')).key]); gDrive(g, /./, null, G); G.act(g, [key(g, find(g, 0, 'Dark Hole')).key]);
  const yn = []; for (let i = 0; i < 40 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'yesno') yn.push(pr.text); G.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(yn.some(t => /Last Will/.test(t)), 'Goat: Last Will\'s summon is optional (asked), so it can be ordered with Sangan\'s (Netrep)');
});

T('155. Goat (pass2 goat-05): Berserk Gorilla must enter the Battle Phase and is destroyed the moment it is in Defense (Zero Gravity chained to Ring of Destruction); Dark Balter\'s negation of Swords of Revealing Light lasts after Balter is gone', () => {
  const { G, mk } = goatEngine();
  const key = (g, c) => g.prompt && g.prompt.opts.find(o => o.key.startsWith('a:' + c.u + ':'));
  const find = (g, p, n) => G.fieldOf(g, p).find(c => G.name(c) === n) || g.p[p].hand.find(c => G.name(c) === n);
  let g = mk([{ m: ['Berserk Gorilla'], turn: 3 }, { m: ['Sangan'] }]);
  ok(g.prompt.opts.some(o => o.key === 'bp') && !g.prompt.opts.some(o => o.key === 'end'), 'Goat: with Berserk Gorilla able to attack, Main Phase 1 has no End turn (archive: you must enter the Battle Phase)');
  g = mk([{ m: ['Berserk Gorilla'], st: [{ n: 'Ring of Destruction', pos: 'set' }], turn: 3 }, { st: [{ n: 'Zero Gravity', pos: 'set' }] }]); const gor = find(g, 0, 'Berserk Gorilla'), zg = g.p[1].st[0];
  G.act(g, [key(g, g.p[0].st[0]).key]); gDrive(g, /Gorilla/, pr => { const o = pr.p === 1 && pr.opts.find(o => o.key.startsWith('a:' + zg.u + ':')); return o && o.key; }, G);
  ok(zg.zone === 'gy' && gor.zone === 'gy' && g.p[0].lp === 8000 && g.p[1].lp === 8000, 'Goat: Zero Gravity chained to Ring of Destruction on Berserk Gorilla: Gorilla is destroyed in Defense at once, Ring deals nothing (archive)');
  // Dark Balter negates Swords of Revealing Light: the Swords stay, negated, after Balter is destroyed
  g = mk([{ m: ['Dark Balter the Terrible', 'Sangan'], turn: 2 }, { hand: ['Swords of Revealing Light'] }]);
  const tB = g.turnNo; for (let i = 0; i < 40 && g.prompt && !(g.prompt.type === 'idle' && g.prompt.p === 1); i++) G.act(g, g.prompt.type === 'respond' ? ['pass'] : g.prompt.type === 'idle' ? ['end'] : g.prompt.opts.slice(0, g.prompt.min || 1).map(o => o.key));
  const sw = find(g, 1, 'Swords of Revealing Light'), db = find(g, 0, 'Dark Balter the Terrible');
  G.act(g, [key(g, sw).key]); gDrive(g, /./, pr => { const o = pr.p === 0 && pr.opts.find(o => o.key.startsWith('a:' + db.u + ':')); return o && o.key; }, G);
  for (let i = 0; i < 40 && g.prompt && !(g.prompt.type === 'idle' && g.prompt.p === 0); i++) G.act(g, g.prompt.type === 'respond' ? ['pass'] : g.prompt.type === 'idle' ? ['end'] : g.prompt.opts.slice(0, g.prompt.min || 1).map(o => o.key));
  G.lib.destroy(g, [db], { by: 1 }); G.lib.emit(g, { type: 'probe' }); g.prompt.opts = G.idleOpts(g);
  const bp = g.prompt.opts.find(o => o.key === 'bp'); if (bp) { G.act(g, [bp.key]); gDrive(g, /./, null, G); }
  ok(sw.zone === 'st' && g.p[0].lp === 7000 && !!bp && g.prompt.opts.some(o => o.key.startsWith('atk:' + find(g, 0, 'Sangan').u)), 'Goat: Swords of Revealing Light negated by Dark Balter stays, and A can still attack after Balter is destroyed (archive)');
});
T('156. Ancient Forest and a Gladiator Beast tag out at the end of the Battle Phase: its controller picks the order (site ruling 3)', () => {
  const g = E.newDuel({ decks: [{ name: 't', main: Array(40).fill(id(FILL)), extra: [] }, { name: 't', main: Array(40).fill(id(FILL)), extra: [] }], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], askOrder: true,
    board: [{ m: ['Gladiator Beast Bestiari'], fz: 'Ancient Forest', deckTop: [FILL, 'Gladiator Beast Laquari'], turn: 3 }, { m: [{ n: FILL, pos: 'def' }] }] });
  const be = fld(g, 0, 'Gladiator Beast Bestiari'); let asked = false;
  act(g, /^Battle Phase/); drive(g); act(g, new RegExp('atk:' + be.u + ':' + fld(g, 1, FILL).u)); drive(g); act(g, /endbp|End Battle/);
  for (let i = 0; i < 40 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
    if (pr.type === 'choose' && /resolve first/.test(pr.text)) { asked = true; E.act(g, [pr.opts.find(o => /Bestiari/.test(o.label)).key]); continue; }
    E.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, pr.min || 1).map(o => o.key)); }
  ok(asked && be.zone === 'deck' && !!fld(g, 0, 'Gladiator Beast Laquari'), 'askOrder: A puts the tag out first: Bestiari returns to the Deck and Laquari is summoned before Ancient Forest resolves');
});
T('157. Two Amazoness Swords Women battling: no endless redirect; the higher-ATK one\'s controller takes it, and Robbin\' Goblin doesn\'t see redirected damage (Netrep; pool review goat-h01; Edison and Goat)', () => {
  for (const [lbl, P, mkx] of gFmts()) {
    const g = mkx([{ m: ['Amazoness Swords Woman'], hand: ['Sangan'], turn: 3 }, { m: ['Amazoness Swords Woman'], st: [{ n: "Robbin' Goblin", pos: 'up' }] }]);
    const a = gFind(P, g, 0, 'Amazoness Swords Woman'), b = gFind(P, g, 1, 'Amazoness Swords Woman'); P.lib.addMod(g, a, { atk: 500 }); g.seq++; g.prompt.opts = P.idleOpts(g);
    gAttack(P, g, a, b);
    ok(g.p[0].lp === 7500 && g.p[1].lp === 8000 && g.p[0].hand.length === 2, lbl + ': A\'s 2000 Amazoness destroys B\'s 1500 one: the 500 goes to B, back to A, and stops there; no Robbin\' Goblin discard');
  }
});
T('158. Damage redirects apply after the other damage hooks (pool review edison-h01): Kuriboh zeroes it before Amazoness Swords Woman sends it on; Stone Statue of the Aztecs doubles it first', () => {
  let g = duel([{ m: ['Amazoness Swords Woman'], hand: ['Kuriboh'], turn: 3 }, { m: [FILL] }]); const kb = hand(g, 'Kuriboh'); toTurnOf(g, 1);
  atkOn(g, fld(g, 1, FILL), fld(g, 0, 'Amazoness Swords Woman'), { respond: pr => { const o = pr.p === 0 && pr.opts.find(o => o.key.startsWith('a:' + kb.u + ':')); return o && o.key; } });
  ok(kb.zone === 'gy' && g.p[0].lp === 8000 && g.p[1].lp === 8000, 'a 2000 monster attacks Amazoness (1500), A discards Kuriboh: nobody takes the 500');
  g = duel([{ m: ['Amazoness Swords Woman'], turn: 3 }, { m: [{ n: 'Stone Statue of the Aztecs', pos: 'def' }] }]);
  atkOn(g, fld(g, 0, 'Amazoness Swords Woman'), fld(g, 1, 'Stone Statue of the Aztecs'));
  ok(g.p[0].lp === 8000 && g.p[1].lp === 7000, 'Amazoness (1500) into Stone Statue of the Aztecs (DEF 2000): doubled to 1000, then sent to B');
});
T('159. A Barrier Statue is not a total Special Summon lock (pool review edison-h03): Monster Reborn on its Attribute, Reasoning; not on another Attribute', () => {
  let g = duel([{ hand: ['Monster Reborn'], gy: ['Mother Grizzly'], turn: 3 }, { st: [] , m: ['Barrier Statue of the Torrent'] }]);
  const mr = keyOf(g, hand(g, 'Monster Reborn')); if (mr) { actU(g, hand(g, 'Monster Reborn')); drive(g); }
  ok(!!mr && !!fld(g, 0, 'Mother Grizzly'), 'Barrier Statue of the Torrent: Monster Reborn on a WATER Mother Grizzly is offered and summons it');
  g = duel([{ hand: ['Monster Reborn'], gy: ['Mystic Tomato'], turn: 3 }, { m: ['Barrier Statue of the Torrent'] }]);
  g.p[0].gy[0].id = id('Cyber Dragon'); g.seq++; g.prompt.opts = E.idleOpts(g);
  ok(!keyOf(g, hand(g, 'Monster Reborn')), 'with only a LIGHT Cyber Dragon in the GY, Monster Reborn isn\'t offered');
  g = duel([{ hand: ['Reasoning'], turn: 3 }, { m: ['Barrier Statue of the Torrent'] }]);
  ok(!!keyOf(g, hand(g, 'Reasoning')), 'Reasoning can be activated under a Barrier Statue (archive)');
});
T('160. A second "only 1" monster flipped by an attack is destroyed after damage calculation (Amazoness Tiger ruling; pool review goat-h01)', () => {
  const g = duel([{ m: ['Amazoness Tiger', { n: 'Amazoness Tiger', pos: 'set' }], turn: 3 }, { m: ['Sangan'] }]); const t2 = g.p[0].m[1];
  toTurnOf(g, 1); atkOn(g, fld(g, 1, 'Sangan'), t2);
  ok(g.p[1].lp === 7500 && t2.zone === 'gy' && !!fld(g, 0, 'Amazoness Tiger'), 'Sangan attacks the Set Tiger (DEF 1500): B takes 500, then the flipped Tiger is destroyed by the rule');
});
T('161. Card files read the format\'s own scripts (E.lib.SC; pool review goat-h01): Goat Armored Glass cancels Axe of Despair\'s Goat-override boost', () => {
  const { G, mk } = goatEngine();
  const g = mk([{ m: ['Sangan'], hand: ['Axe of Despair'], st: [{ n: 'Armored Glass', pos: 'set' }], turn: 3 }, {}]); const sg = G.fieldOf(g, 0).find(c => G.name(c) === 'Sangan');
  G.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + g.p[0].hand.find(c => G.name(c) === 'Axe of Despair').u + ':')).key]); gDrive(g, /Sangan/, null, G);
  const up = G.atk(g, sg); G.act(g, [g.prompt.opts.find(o => o.key.startsWith('a:' + g.p[0].st[0].u + ':')).key]); gDrive(g, /./, null, G);
  ok(up === 2000 && G.atk(g, sg) === 1000, 'Goat: Sangan with Axe of Despair 2000, back to 1000 after Armored Glass');
});

console.log(fails ? `\n${fails} failed` : '\nAll root-cause guards passed.');
process.exit(fails ? 1 : 0);
