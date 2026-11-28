# Writing card scripts for the Learn Edison engine

The duel engine is `js/engine.js`. Every card effect is a small script registered by card name. The 84 cards of the five Best decks are scripted inside `engine.js` (the `SCRIPTS` object, after the line `/* ---------- card scripts ---------- */`). Read those first: they are the reference examples. Every other card goes in a batch file `js/cards/batch-N.js`.

## Ground rules

- **Edison text only.** Script each card from the `Text:` line in your batch list (its April 2010 text) and its rulings, not from its modern text. "Remove from play" means banish. Card text written before Problem-Solving Card Text has no colons or semicolons. Read it the 2010 way: the cost is what you do "to activate", and "When ..." conditions are triggers.
- **Once per turn** only when the text says so (`opt: true`).
- **PSCT:** the part before a colon (`:`) is the activation condition, the part before a semicolon (`;`) is the cost, and the rest is the effect. Costs go in `cost`, choosing targets goes in `target`, and everything else goes in `res`.
- **Check at resolution.** By the time `res` runs, targets may have left the field. Use `live(L)` for targets that must still be on the field. For cards in the GY or hand, check `c.zone`. If the card itself must still be there (most monster effects), check `onField(c)`.
- **"When ... you can"** optional triggers use `when: true`, so they can miss the timing. **"If ..."** triggers don't. Mandatory triggers (no "you can") use `mand: true`.
- **Edit only your own batch file.** Never edit `js/engine.js`, other batch files, `index.html` or the tests. If a card truly needs a change to the engine core, script the closest correct behaviour. Then mark it with a `// ENGINE: what is missing` comment and list it in your final report.
- **Logs:** short plain sentences, no em dashes. Example: `log(g, \`${PN(g, p)} added ${name(x)} to the hand.\`)`. The helpers already log draws, destroys, summons and damage.
- **Partial cards:** when a card can't be done exactly, do the closest version and add `// PARTIAL: why`. Never leave a card out: every card in your list gets an entry.

## File shape

```js
/* Batch N: <decks>. Card scripts for js/engine.js (see build/CARD_SCRIPTS.md). */
(function () {
'use strict';
const E = window.EdisonEngine, L = E.lib;
const { pick, tgt, yn, choose, move, destroy, ss, draw, damage, gain, pay, mill, search, takeControl, setFaceDown, negate, addMod,
  equip, equippedTo, link, addCtr, ctr, negateAttack, endBattle, addRule, token, tokens, fusionSummon, canFusion, ritualSummon, canRitual,
  name, D, isMon, isST, isSpell, isTrap, onField, faceUp, attr, race, lv, baseAtk, monsOf, stOf, fieldOf, allField, fieldMons,
  freeM, freeST, nFreeM, allCards, shuffleDeck, log, PN, has, live, opp, oppFaceUp, stOnField, spellTrapAct, evSummoned,
  fromFieldToGY, battleKill, isGemini } = L;
const atk = L.atk, def = L.def;
E.addScripts({
  'Card Name': { effs: [ /* effects */ ] },
});
})();
```

## A card script

`{ effs, proc, self, cont, mats, noSynchro }`

- **`effs`**: a list of effects (below).
- **`proc`**: a summon rule of its own. Example: "You can Special Summon this card from your hand by ...".
  - `{ cond(g,c,p), cost: function*(g,c,p,group), label, pos, how, extra }`.
  - The engine offers it as an idle action and handles the summon window (Solemn, Royal Oppression).
  - Use `extra: true` for an Extra Deck monster with its own summon rule. Example: a Fusion summoned by sending materials from the field.
- **`self`**: facts about the card while face-up. Each is a value, or a function `(g, c)`.
  - Flags: `piercing`, `directAttack`, `noBattleDestroy`, `noEffectDestroy`, `cantAttack`, `noAttackTarget` (it can't be attacked), `noBattleDamage` (its controller takes no battle damage from its battles), `unaffectedSpells`, `unaffectedTraps`.
  - `atk(g,c)` and `def(g,c)` return a number added to its ATK/DEF, for "gains X for each ...".
- **`cont`**: effects on other cards while this card is face-up on the field.
  - `atk(g,src,c)` and `def(g,src,c)`: numbers added to any monster `c`.
  - `grant(g,src,c,flag)`: true gives monster `c` one of the `self` flags.
  - `forbid(g,src,action)`: true blocks an action (shapes below).
  - `dmg(g,src,p,n,o)`: return a new damage number, or `{gain: n}` to turn the damage into a gain.
  - `negates(g,src,c)`: true negates `c`'s effects (Skill Drain, Jinzo for Traps).
  - `loc: 'gy'` or `'hand'` makes it work from there instead of the field.
- **`mats`** (Fusion): a list of predicates, one per material, for when the text's first line can't be read automatically. `fusionRecipe` reads plain recipes such as `"A" + "B"` and `1 "HERO" monster + 1 WATER monster`.
- **`noSynchro: true`**: a Synchro Monster with its own summon rule that can't be Synchro Summoned normally.

**forbid actions:**
- `{type:'activate', c, eff, p}` (any card or effect activation)
- `{type:'ns', c, p}` and `{type:'set', c, p}`
- `{type:'ss', c, p, how, src, proc, proper}`, where `how` is `special`, `synchro`, `fusion` or `ritual`. `src` is the card summoning (default: the card activating now, else the link resolving); `proc: true` marks the card's own procedure.
- **Summoning conditions are the engine's (2026-11-27):** `forbid` reads every monster's text for "Cannot be Special Summoned" (never), "Cannot be Special Summoned from the GY/hand/Deck", the summon-only lines ("Must be Special Summoned ...", "Must be Fusion Summoned", "Cannot be Special Summoned except ...", "... by other ways": only its own way, never revived) and "Must first be ..." / "can only be Special Summoned by" (its own way first, then revivable). Fusion, Synchro and Ritual Monsters in the GY or banished come back only if properly summoned (`c.proper`, set by procedures, Fusion/Synchro/Ritual Summons and the card's enabler, lost in the hand/Deck/Extra Deck). A card the condition names (`"Dark Fusion"`, `"Armed Dragon LV5"`) or the card itself is its own way; a source whose text says "ignoring its Summoning conditions" skips them. Don't write per-card "can't be Special Summoned" locks any more; filter summon targets with `canSS(g,p,c)`. `cfg.board` GY/banished monsters count as properly summoned unless given `{n, proper: false}`.
- `{type:'search', p}` (add from the Deck to the hand)
- `{type:'attack', c}`, `{type:'setST', c, p}`, `{type:'draw', p}`, `{type:'pos', c}`

## An effect

```js
{ type: 'act' | 'ign' | 'quick' | 'trig',
  loc: 'm' (default for monsters) | 'st' | 'hand' | 'gy' | 'any',
  opt: true,              // once per turn
  ds: true,               // may be activated in the Damage Step
  speed: 2,               // override (rare)
  tags: { destroy: 1, ss: 1 },  // destroy: Stardust Dragon can negate it; ss: Royal Oppression can negate it
  negSummon: true,        // can be used in a summon negation window (Solemn style)
  anyPlayer: true,        // either player may use it (Royal Oppression)
  gemini: true,           // only while this Gemini is Gemini Summoned (c.flags.gemini)
  label: 'Short button text',
  cond(g, c, p, x) {},    // can it be activated now? x.top is the chain link it would respond to (for responses)
  cost: function* (g, c, p, L) {},
  target: function* (g, c, p, L) {},   // use tgt(g, p, L, text, cards, min, max, hint) so L.t holds the targets
  res: function* (g, c, p, L) {},
  // triggers only:
  on(g, ev, c) {},        // does this event trigger it? (no prompts here)
  when: true, mand: true, faceDownOk: true,
}
```

- **`act`** is a Spell or Trap card's own activation. The engine moves it from the hand or turns it face-up. A Normal Spell or Trap goes to the GY after it resolves. Continuous, Equip and Field cards stay.
  - **Equip Spells** call `equip(g, c, target)` in `res`. If no equip happens, the card goes to the GY.
  - The equipped monster's bonus goes in `cont.atk: (g, src, m) => src.equipTo === m.u ? 500 : 0`.
- **`ign`**: Ignition (Spell Speed 1, your Main Phase). **`quick`**: Spell Speed 2.
- **`trig`**: Trigger and Flip effects, which fire on events:
  - `move` `{c, from, to, wasField, reason, destroyed, battle, killer, by, prevCtrl, snap}`. `snap` is the card as it was on the field (atk, attr, lv, race, name). Reasons: draw, effect, cost, battle, tribute, synchro, fusion, ritual, discard, rule, summon, set, activate, equip.
  - `summon` `{cs, how, p, tribs, byEffect}`. `how` is one of: normal, tribute, flip, special, synchro, fusion, ritual, gemini.
  - `flip` `{c, p, battle}`: a Flip effect is `on: (g,ev,c) => ev.type==='flip' && ev.c===c`. An effect that sets a face-down monster's `pos` face-up gets the `flip` event from the engine after its link resolves (`byEffect: true`), unless the resolving card's text says Flip effects are not activated; a script that emits its own `flip` isn't doubled.
  - `set` `{c, p}`, `attack` `{a, t, p, direct}` (the attack declaration), `dsStart` `{a, t}`.
  - `afterCalc` `{a, t, tWasDef, flipped}`, `dsEnd` `{a, t}`.
  - `damage` `{p, n, battle, src, srcP, direct}`, `phase` `{ph: 'standby'|'end', tp}`.
- **Battle and chain state:**
  - Attack declaration window: `g.aw = {a, t, ctrl, open, tpOpen}`. During battle: `g.battle = {a, t}`. In the Damage Step: `g.inDS`. A card whose text answers the attack declaration ("declares an attack", "targeted for an attack") and whose `cond` reads `g.aw` is usable only in the first chain after it (the engine checks `open`/`tpOpen`; no script change needed). At resolution, `attackingNow(g, t)` says whether t is still the attacking monster (not turned face-down, moved, negated or the Battle Phase ended).
  - Normal and Quick-Play Spells, Normal and Counter Traps stay on the field until the whole chain has resolved (`c.pendLeave` meanwhile), then leave together with move option `chainEnd: true`, `link` and `chainLinks` (the whole chain). A `cont` with `loc: 'gy'` on such a card already applies while it waits. Scripts that count links or read what a Counter Trap negated from that move use `ev.chainLinks`, not `g.chain`.
  - The monster(s) just summoned, which "when summoned" Traps can respond to: `g.sw = {cs, p, how}`.
  - A summon being attempted, which Solemn can negate: `g.attempt = {cs, how, p}`. Set `g.attempt.negated = true` to negate it.
  - The chain: `g.chain` (links `L = {c, eff, p, t, data, negated, tags, cardAct}`). The link you respond to is `x.top` in `cond`.
  - To negate a link: `L2.negBy = p; negate(g, L2, destroyIt)`.
- **Game state:**
  - Players: `g.p[p]` has `lp, deck (top = last), hand, gy, ban, extra, m[5], st[5], fz`.
  - The turn: `g.tp` (turn player), `g.turnNo`, `g.phase` (draw, standby, main1, battle, main2, end).
  - Card fields: `c.u` (unique id), `c.owner`, `c.ctrl`, `c.zone` (hand, deck, gy, ban, extra, m, st, fz), `c.pos` (atk, def, set for monsters; up, set for S/T), `c.turnIn`, `c.flags`, `c.mods`, `c.ctr`, `c.equipTo`, `c.linkTo`.
- **Turn flags:**
  - `lockBP(g, p)` ("you can't conduct your Battle Phase the turn you activate this card": from `after` or `target` it belongs to the link, so a negated activation lifts it); `g.noBP[p] = true` for a lock with no link. Read it with `bpLocked(g, p)`.
  - `g.noSummon[p]` (can't Normal Summon or Set; Scapegoat uses a rule instead, since it allows Sets).
  - `g.onlyAttacker[p] = u`.
  - A rule added with `addRule` inside `after` belongs to that link: if the activation is negated (`L.actNegated`), the rule is gone; a negated effect (`L.negated` only: Imperial Order, Royal Oppression) keeps it. `negate(g, L)` reads the negating card's text to tell "negate the activation" from "negate the effect" (`{effect: true}` / `{activation: true}` override).
  - `g.p[p].noBattleDamage = g.turnNo` (no battle damage this turn).
  - `c.flags.extraAttack = g.turnNo` (a second attack this turn).
  - For "until the End Phase" or "until your next turn" restrictions, use `addRule(g, forbidFn, {end: g.turnNo})` or `{startOf: p}`.

## Helpers (`E.lib`)

- **Prompts.** These are all generators, so call them with `yield*`:
  - `pick(g,p,text,cards,min,max,hint)` returns the chosen cards.
  - `tgt(...)` is the same, but also stores the targets in `L.t`.
  - `yn(g,p,text)` returns true or false. `choose(g,p,text,labels)` returns an index.
  - **Hints** guide the computer: `'good'` (best for the picker), `'bad'` (hurts the other side: pick their best), `'cost'` (what the picker can spare most).
- **Moving cards:**
  - `move(g,c,to,o)`, where `to` is hand, deck (shuffled in), deckTop, gy, ban, m, st.
  - `destroy(g,cards,{by:p, src:c})` returns the destroyed cards. Pass `src` so "unaffected by Spells/Traps" works.
  - `ss(g,p,c,pos,{negate, banishOnLeave, how, src, proper})` returns false if it couldn't summon (`src`: the summoning card when no link is resolving; `proper: true` forces a proper summon). `canSS(g,p,c)` is the target-list check.
  - Tokens can't be turned face-down: filter face-down targets with `canFaceDown(c)`; `setFaceDown` returns false on a Token.
  - Effects that can't share a chain: one hand trigger that Special Summons itself (`type:'trig', loc:'hand', tags.ss`) per chain; `oneName: true` on an effect allows one copy of the card per chain (Treeborn Frog). An effect with `tags.ss` can't be activated while nothing can be Special Summoned (Vanity's Fiend), so tag every effect that Special Summons.
  - `takeControl(g,p,c,untilEnd)` and `setFaceDown(g,c)`. `setFaceDown` clears the monster's mods, flags, counters and once-per-turn uses, sends its Equips to the GY (move option `lostTarget: true`) and cuts Call of the Haunted's link; it keeps the control-return flags in `KEEP_FACE_DOWN` (engine.js). A script that keeps a control change in its own flag on the monster adds the flag name there. Once-per-turn uses (`c.used[effect index]`) also reset when the card leaves the field; keep your own per-card data under a named key (`c.used.union`).
- **LP and the Deck:** `draw(g,p,n)`, `damage(g,p,n,{src:c, srcP:p})`, `damageMany(g,[[p,n],[q,m]],o)` (damage to both players at once: every amount through the damage statics, one LP check, a draw if both reach 0), `gain`, `pay`, `mill(g,p,n)`, and `yield* search(g,p,filter,text,to)`, where `to` is `'hand'` (the default) or `'gy'`. Never cap a draw at the Deck size or guard it with `deck.length`: a draw past the Deck loses the duel (`draw` handles it). An optional draw effect checks the Deck in its `cond`. A hand win (`self.handWin`) is checked once the effect adding the card has resolved.
- **What a link destroys:** `wouldDestroy(g, L)` (the cards it certainly destroys) and `destroysSome(g, L, filter)` (it will destroy at least one card passing the filter; counts "the 1 monster with the lowest ATK" picks). Any "would destroy" response (Stardust Dragon, Starlight Road, My Body as a Shield) asks these. They read the effect's `destroys(g, c, p, L)` if it has one, else a negate-and-destroy card's link below, else the card's one "destroy all ..." sentence plus its targets, else its targets, else the battle partner or summoned monsters for "destroy that monster". Give an effect `destroys` when its text can't be read that way (Red Dragon Archfiend, Bottomless Trap Hole, Deck Devastation Virus).
- **Kycoo and Necrovalley style locks:** `banishesFromGY(c, eff)` (or `'proc'` for the summon procedure) says whether that effect banishes from a GY, read from the text; don't list card names.
- **Attacks:** `attackEach` is the `self` for "can attack all your opponent's monsters once each" (Asura Priest): no attack after a direct one. `canTarget(g, x, {c, p})` checks "can't be targeted" in a `cond`.
- **Stats:** `addMod(g,c,{atk, def, end:true})`, or `{set: 0, which: 'atk'|'def'|'both', end:true}`. `end` means "until the End Phase". Read the current values with `atk(g,c)` and `def(g,c)`. Halving is a `set` to the halved current value, never a fixed minus. `own: true` marks a monster's change to its own ATK/DEF that its negation removes for good (Card Trooper); `c.flags.ownBaseAtk` does the same for an original ATK the card sets itself (Chimeratech Fortress Dragon). Check negation with `negd(g,c)`, never `c.flags.negated` (that misses Skill Drain).
- **Equips, links and counters:**
  - `equip(g,eq,target)` and `equippedTo(g,eq)`.
  - `link(g,st,m)` (Call of the Haunted style). The engine reads the linked card's text: "when this card leaves the field, destroy that monster" (not while this card's effect is negated: Jinzo), and "when that monster is destroyed, destroy this card" only on a destroy (Tributed, bounced or sent, the card stays), "leaves the field" on any move.
  - `addCtr(g,c,'spell',n)` and `ctr(c,'spell')`.
- **Battle:** `negateAttack(g)` (Necro Gardna, Sakuretsu-style negation) and `endBattle(g)`.
- **Tokens:**
  - `tokens(g,p,{n:'Fluff Token',a:'WIND',r:'Plant',lv:1,atk:0,def:0},count,'def',{noTribute:true})` summons several at once.
  - `token(...)` makes a single one.
- **Fusion and Ritual:**
  - `yield* fusionSummon(g,p,{from:['hand','m'], banish:false, filter:fx=>...})` and `canFusion(g,p,o)`.
  - `yield* ritualSummon(g,p,{monster:c=>..., exact:true})` and `canRitual(g,p,o)`.
- **Card facts:** `name(c)` (the name on the field), `D(c)` (raw data: n, k, sub, a, r, lv, atk, def, tu), `attr`, `race`, `lv`, `baseAtk`, `isMon`, `isST`, `isSpell`, `isTrap`, `onField`, `faceUp`, `has(g,c,flag)`.
- **Lists:** `monsOf(g,p)`, `stOf(g,p)`, `fieldOf(g,p)`, `allField(g)`, `fieldMons(g)`, `oppFaceUp(g,p)`, `stOnField(g)`, `allCards(g,'gy')`, `freeM(g,p)` (-1 if full), `freeST(g,p)`, `nFreeM(g,p)`.
- **Matching events:** `evSummoned(ev,c,[hows])`, `fromFieldToGY(ev,c)`, `battleKill(ev,c)` ("this card destroys a monster by battle and sends it to the GY"), `spellTrapAct(L)` (this link is a Spell/Trap card activation).

## Testing

From `learn-edison/`:
1. `node build/test_cards.js js/cards/batch-N.js 12` plays random duels around each card. It reports crashes (with the stack), stuck games, and cards whose effect never happened ("ok?"). Fix every crash. Look at each "ok?": usually the card's condition never comes true in random play, but it can also be a broken `cond`.
2. `node build/test_engine.js 300 all` plays random duels with every deck and must show 0 crashes and 0 stuck.
3. For tricky cards, write a scenario check in `build/test_batch-N.js`, modelled on `build/test_rules.js`. `cfg.board` sets up hands, fields and GYs. Example: `duel([FILL],[FILL],{board:[{hand:['X'], m:['Y'], st:['Z'], gy:[...], extra:[...]}, {...}]})`.

## Classic cards (Duelist Kingdom and Battle City, 2026-11-25)
- `js/cards/classic-1.js` to `classic-5.js` script the cards of the play site's Duelist Kingdom and Battle City draft pools, registered for Goat (`E.addScripts(obj, 'goat')`). Cards the Goat site doesn't list come from `play/data/classic-cards.js` (`play/tools/build_classic.mjs`). Test: `node build/test_classic.js js/cards/classic-N.js 12` and `node build/test_classic-N.js`.
- Engine hooks added for them: `E.lib.winDuel(g, p, why)`, `E.lib.coin(g, p)` (true for Heads), `E.lib.dice(g, p)` (1 to 6), `self.tribExact` (exact Tributes, the Egyptian Gods), `self.attackCost(g, c)` (LP paid to declare an attack, Toons), `self.handWin(g, c, p)` (checked whenever a card enters a hand, Exodia).

## Full pool (Zack, 2026-11-26: "make sure all legal cards in the formats are available, they all interact in the correct ways")
- Every legal Edison and Goat card gets a script, so the Deck Builder offers the whole card pool. `node build/make_full_batches.js` lists the cards still missing in `build/batches/full/full-NN.md`, and each list is scripted in `js/cards/full-NN.js`.
- `formats: both` (in both card lists): one shared script from the Edison text (`E.addScripts(obj)`). A `Goat text:` line means the 2005 wording differs; if the card *plays* differently in 2005, also add a Goat version in the same file with `E.addScripts(goatObj, 'goat')`. `formats: edison`: shared script. `formats: goat`: `E.addScripts(obj, 'goat')` only.
- "Goat already has a goat-only script": read it, and port it as the shared script, adjusted to the Edison text and rulings.
- Every card gets an entry, nothing left out: an exact script, or the closest version marked `// PARTIAL: what differs`. A card no rule can make work yet still gets its summon rules right and `// ENGINE:` for the gap. Never edit `js/engine.js` or other card files; list engine gaps in your report.
- Tests, from `learn-edison/`: `node build/test_cards.js js/cards/full-NN.js 12` (no crashes, no stuck games; check every "ok?"), a scenario file `build/test_full-NN.js` (copy the helpers from `build/test_batch-7.js`) with a check for every card whose effect is more than a stat line or a simple search/destroy, and finally `node build/test_engine.js 200 all` and `node build/test_goat.js 200 all` (0 crashes, 0 stuck).
