# Engine gaps reported by the card batches (2026-11-20)

Fixed: Bottomless Trap Hole crash (g.sw cleared before a Battle Phase / Main Phase activation).

From batch 5:
- Multiple attacks: canAttack allows at most 2 (Chimeratech Overdragon needs N).
- No "end of Battle Phase" event (Destiny HERO - Dasher).
- Per-summon Tribute restrictions in tributeCands (The Immortal Bushi).
- No hook for ongoing Level changes in lv() (A Legendary Ocean -1 Level).
- Attack redirect: attack() keeps its target local (Crystal Beast Amber Mammoth).
- Field Zone cards aren't scanned by activatable() / emit() triggers (Ancient City - Rainbow Ruins, Field Spell effects).
- Replacement effects ("place it in the S/T Zone instead", "destroy this instead"): Crystal Beasts, Machina Gearframe, Kristya.
- Position changes emit no event (Cloudians).
- Field Spells can't be Set.
From batch 2:
- tgt()/pick for targets doesn't honor cantBeTargeted (Aurkus).
- takeControl() doesn't check forbid (Botanical Lion).
- Skill Drain: resolveChain only checks c.flags.negated; engine.js continuous monster effects ignore negd() in places.
- processTriggers doesn't call forbid() for trigger activations (Shadow-Imprisoning Mirror).
- "Before an opponent's targeting effect resolves" hook (Machina Fortress).
- Ryko's mill isn't marked for Garoth-style "sent by a card effect" checks (Lightsworn mills).
From batch 3:
- End-of-Battle-Phase moment/trigger (Gladiator Beast tag outs, Ancient Forest; also Dasher).
- "Can't be Special Summoned" generic enforcement (LADD, Dark Dust Spirit, Norleras, Ancient Gear Beast): a self flag checked in ss().
- name() / attr() / race() overrides (Prisma name copy, LADD also DARK, Zombie World, Phantom of Chaos copy).
- synCombos ignores per-material restrictions (Fishborg Blaster, Royal Swamp Eel) and Quickdraw Synchron's substitution.
- tribNeed() hook (Geartown one less Tribute).
- Banish-instead replacement in move() (Dimensional Fissure, Banisher of the Radiance).
- Destruction replacement (Machina Peacekeeper).
From batch 6:
- Field Zone ('fz') missing from emit() trigger scan and activatable() (Future Visions, Iron Core Specimen Lab; same as batch 3/5).
- Name/effect copying by changeable name (Neo-Spacian Dark Panther, Phantom of Chaos).
- Tribute-count changes (Double Coston = 2 Tributes; Big Piece Golem, Rooklord tributeless rules) need tribNeed/tribute-value hooks.
- "Must attack this card" forcing (Evil HERO Malicious Fiend).
From batch 1:
- batch-1.js uses a hidden hook ("hub") that replaces g.pend with a getter to drop negated triggers and adds permanent rules for Synchro material limits. Replace with real engine support: a forbid/negate check in processTriggers, and per-Synchro material checks in synCombos (Debris Dragon, Doomkaiser, Ha Des, Gishilnodon, Exploder, Tempest, Trident), then remove the hub.
- Destruction replacement (Clear Vice Dragon "discard instead").
- More than 2 attacks a turn (Trident Dragion).
From batch 7:
- Guard `SC(x).effs &&` where anyPlayer S/T effects are scanned (crash when an equipped monster card with no effs sits in a S/T zone); batch-7 adds empty effs to every script as a workaround.
- Destruction replacement ("destroy another card instead": Slingen, Power Tool Dragon, Six Samurai) — same hook as batches 1, 2, 3.
- tribNeed hook (Darklord Zerato).
- Forbid moves to the Deck/Extra Deck (G.B. Hunter); banish-instead in move() (Macro Cosmos) — same as batch 3.
- Field Zone activatable/emit (Ojama Country, Brain Research Lab).
- Generic "destroyed after an effect that targets it resolves" (Reaper on the Nightmare).
- "Cannot be Special Summoned" generic self flag (Witch of the Black Rose, Overdrive Teleporter, Faultroll).
- Position-change event (Scopen, Level Limit - Area B, Cloudians).
- Ritual Summons with GY material (Djinn).

Done in the engine pass (2026-11-20): Field Zone triggers and effects (and Setting Field Spells), static-effect cache refresh on flips and face changes, a position-change event ('pos'), an end-of-Battle-Phase event (phase 'bpEnd'), triggers checked against forbid() and resolving monster effects against negd() (Skill Drain), more than 2 attacks (c.flags.maxAttacks + maxAttacksTurn), cantBeTargeted honored by tgt(), a tribute-count hook (self.tributes / cont.tributes), a destruction replacement hook (self.replaceDestroy / cont.replaceDestroy, also for battle), the SC(x).effs guard, and the opponent's anyPlayer cards found from the idle and Battle Phase menus.
Still open: cards written before these hooks keep their PARTIAL workarounds until they're moved onto them (Gladiator Beast tag outs -> bpEnd; Cloudians / Scopen / Level Limit -> 'pos'; Machina Gearframe / Peacekeeper / Six Samurai / Slingen / Clear Vice -> replaceDestroy; Double Coston / Geartown / Zerato -> tributes; Aurkus / Turbo Warrior -> cantBeTargeted).

## Goat batches 3 to 7 (2026-11-25): gaps the card scripts work around
Every Goat deck card is now scripted (js/cards/goat-3.js to goat-7.js, tests build/test_goat-3.js to test_goat-7.js; `node build/test_goat.js 1000 all`: 0 crashes, 0 stuck, no unscripted cards). These cards are the closest version until the engine grows:
- No window during damage calculation: Injection Fairy Lily, Cipher Soldier, Sasuke Samurai #4 and Reflect Bounder act in the Damage Step windows instead.
- No forced attack: Berserk Gorilla's "must attack if able"; Last Turn works out its battle inside the card.
- No banish-instead replacement in move(): Banisher of the Light moves cards that reach the GY straight to the banished pile.
- Targeting has no "who is targeting": King Dragun's Dragons can't be targeted by either player.
- No face-up Defense Normal Summon and no Set-lock for face-down Special Summons: Light of Intervention.
- No equip event: Gearfried the Iron Knight destroys a flipped-up Equip at the next game event.
- No automatic negation hook: Ryu Senshi and Fiend Skull Dragon negate as an optional Spell Speed 3 response.
- Ojama King's locked zones are picked automatically; control changes ignore them. The Last Warrior can't stop Flip Summons.
- No face-up Deck: Convulsion of Nature logs the top card instead.
- No LP payment hook: Spell Economics only covers Toon World. Scapegoat tokens skip summon locks (Jowgen).
- Control changes have no "can't switch control" check: Mataza the Zapper returns to its owner.
- "Can't be Special Summoned" still only blocks the GY (Flame Wingman, Gigantes, Horus LV8, The Creator), as before.
- self.tributes returning a bare 0 is ignored (0 || []); Fusilier returns [0] to work around it.

From the classic batches (2026-11-25):
- Attack redirects: attack() keeps its target local (Ancient Lamp, Eye of Illusion, Dark Spirit of the Silent, Jam Defender, Magical Arm Shield, Shift, Roulette Spider work out their own battle).
- No response window after a battle destruction or a Set (Time Machine, Rope of Life, Shadow of Eyes are optional triggers while Set).
- No window during damage calculation (Kazejin, Sanga, Suijin use the Damage Step windows).
- No idle action for a Special Summon from the Deck (Metalzoa, Red-Eyes Black Metal Dragon are offered as triggers).
- Activating a Trap from the hand (Makyura the Destructor); Standby Phase windows (Curse of Fiend); the hand size limit is fixed (Infinite Cards).
- Type changes (Parasite Paracide); "unaffected by Spells" only covers destruction (The Legendary Fisherman); Flip Summon as a forbid action (Mesmeric Control, Insect Barrier, Jam Breeding Machine).
- Attack costs that Tribute a monster (Panther Warrior, Insect Queen use a chain link); Jinzo can't exempt its controller (Amplifier); hand cards change owner (Exchange); revealed hands (The Eye of Truth).

## Done 2026-11-26 (full card pool)
- Placeholder text: edisonformat.net puts "No Edison-Accurate PSCT available..." (3,083 cards) or "No rulings..." in `ps`. `E.init` now drops it, so Fusion/Synchro recipes, `canNormal` and scripts read `tx`.
- Effect copying: `c.flags.copyEffs = <card name>` adds that monster's field effects (not Spell/Trap activations, summon rules or continuous effects) to `c` (`effsOf`, `E.lib.effsOf`). Phantom of Chaos uses it.
- Done (2026-11-26): `canNormal(c, kind, g, p)` tells a Normal Summon from a Set: "Cannot be Normal Summoned (but can be Normal Set)" allows the Set, "while you control a monster" checks the field (Cave Dragon). The full-12 workaround that rewrote ps is gone.
- Open (several batches): no generic "can't be Special Summoned" flag, no name/Attribute/Type override, no substitute Fusion Material hook, no "can't be banished" hook, no damage replacement, no forced attacks, no attack redirect, no Standby Phase response window.
- Done (2026-11-26): `destroy()` falls back to the chain link resolving now (`g.resolvingL`) when a script passes no `src`, so "unaffected by Spells/Traps" monsters (Wildheart vs Mirror Force) are spared by every Spell/Trap, not only those that pass `src`.
- Done (2026-11-26): `canNormal` also reads "Cannot be Normal Summoned or Flip Summoned unless you have an Archfiend" (Terrorking Archfiend; a Set is allowed either way). Goat's Valkyrion (classic-3.js) had "Gamma The Magnet Warrior"; the data spells it "Gamma the Magnet Warrior".
- Done (2026-11-26): `statics()` drops a face-up Spell/Trap whose effects are negated (Jinzo on Traps, `cont.negates`, `flags.negated`), so its lasting effect stops (Gravity Bind under Jinzo). The Emperor's Holiday now relies on it instead of subtracting Equip bonuses.
- Done (2026-11-26): Goat's Ryu Kokki (goat-3.js) triggers with `loc: 'any'`, so it destroys the Warrior/Spellcaster it battled even when Kokki was destroyed too.
- To do after the full-pool reviews (2026-11-26): errata audit. Cards with no 2010 `ps` fall back to today's `tx`, which can carry later errata ("you cannot activate cards with that name", added once-per-turn limits). Check each format's script against the 2005/2010 behavior and drop restrictions the old card didn't have: Card Shuffle, Coach Goblin, Cursed Seal of the Forbidden Spell, D.D. Survivor, Dark Magician of Chaos, Dark Strike Fighter, Linear Accelerator Cannon, Makyura the Destructor, Penalty Game!, Rescue Cat, Sand Gambler, Sangan, Second Coin Toss, Sinister Serpent, Strike Ninja, Whirlwind Weasel, Witch of the Black Forest, Destiny HERO - Disk Commander ("once per Duel": check), Crush Card Virus (scripted from the modern rewrite; the 2010 card checked the opponent's draws for 3 turns; Forbidden in Edison, no deck runs it) (found with a text search; others may hide in different wording).
- Done (2026-11-26): `equip()` and `link()` bump `g.seq`, so the cached lasting effects (`statics`) refresh when a card is equipped or linked (an Equip played under The Emperor's Holiday kept its bonus).
- Done (2026-11-26): Cave Dragon may be Set while you control a monster (only the Normal Summon is blocked).
- Done (2026-11-26): `usable()` refuses an effect whose same card and effect already has a link on the chain (the once-per-chain rule; Toon Defense and Winged Kuriboh LV9 chained to themselves).
- Done (2026-11-26): `equip()` emits an `{type:'equip', c, t}` event, so equip triggers (Gearfried, Heart of Clear Water, Red-Eyes Black Metal Dragon) fire at once. `statics()` now drops negated monsters' lasting effects too (Gora Turtle under Gorgon's Eye). Goat's Kiseitai (classic-3.js) no longer flags itself negated, which had stopped its Standby LP gain.
- Open (full-31 review): ritualSummon() takes Tributes only from the hand and field, so the Djinns of Rituals can't banish themselves from the GY as Ritual material (their main use).
- Done (2026-11-26): `destroy()` checks every card's protection before moving any of them, so cards destroyed together leave together (The Lady in Wight, Orichalcos Shunoros, Energy Bravery keep protecting during a Dark Hole). Battles: two 0 ATK monsters both survive.
- Open (reviews 41, 43): monsters turned into Tuners by an effect (Natural Tune, Lightwave Tuning) aren't Tuners to `synCombos` (it reads printed data). An opponent can't attack directly when your only monster is an Earthbound Immortal (it can't be attacked, so a direct attack should be allowed). Road Synchron counts as Level 4 for every Synchro, not only Road Warrior.
