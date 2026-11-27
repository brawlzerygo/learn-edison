# Full pool batch 28: 60 cards. Write js/cards/full-28.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Stray Lambs
[spell Normal] formats: both
Text (Edison): Special Summon 2 "Lamb Tokens" (Beast/EARTH/Level 1/ATK 0/DEF 0) in Defense Position. You can't Summon other monsters the turn you activate this card (but you can Set).
Goat text: Special Summon 2 "Lamb Tokens" (Beast/EARTH/Level 1/ATK 0/DEF 0) in Defense Position. You cannot Summon other monsters the turn you activate this card (but you can Set).
Edison rulings: ●You can't activate Stray Lambs the same turn that you Summon, Flip Summon, or Special Summon. But you can perform a Set the same turn. So you can activate Stray Lambs and then Tribute one of them to Set Labyrinth Wall.
●You can't activate Stray Lambs unless you have at least 2 vacant Monster Card Zones.

## Strike Ninja
[effect Level 4 DARK Warrior 1700/1200] formats: both
Text (Edison): ① Once per turn (Quick Effect): 
You can banish 2 DARKs from your GY; banish this face-up card (until the End Phase).
Edison rulings: ● You may activate the effects of multiple “Strike Ninja” in the same turn (but only one per copy).

## Stumbling
[spell Continuous] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Any monster that is Normal Summoned, Flip Summoned or Special Summoned is changed to Defense Position.
Edison rulings: Any monster that is Normal Summoned, Flip Summoned, or Special Summoned is changed to Defense Position.
●The mandatory Trigger Effect always starts a Chain in the Summon response timing, even if the monster was Summoned by a card effect as Chain Link 2(+).
●This effect activates as soon as a monster is successfully Summoned (or simultaneously with any mandatory Trigger Effects) before optional Trigger Effects (Red Gadget) or chained Spell / Trap Cards (Trap Hole). This supersedes Ignition Effect Priority.
●Example: Player A controls Stumbling and a set Trap Hole. Player B Normal Summons Exiled Force. Stumbling’s mandatory Trigger Effect immediately starts a chain as Chain Link 1. Player B can't claim 'priority' to activate Exiled Force’s effect, but activates Mystical Space Typhoon as Chain Link 2 targeting Stumbling. Player A responds by activating Trap Hole as Chain Link 3. When resolving the chain, Trap Hole destroys Exiled Force, then Mystical Space Typhoon destroys Stumbling and the chain is considered resolved (as Stumbling is longer face-up on the field to allow for Chain Link 1 to resolve). The last thing to happen in this case was the destruction of Stumbling.

## Suijin
[effect Level 7 WATER Aqua 2500/2400] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): During damage calculation in your opponent's turn, if this card is being attacked: You can target the attacking monster; make that target's ATK 0 during damage calculation only (this is a Quick Effect). This effect can only be used once while this card is face-up on the field.
Edison rulings: ●A marker may be placed on this card to indicate that its effect has been used. The effect resets if the monster is destroyed or removed from the field.
●You can use the effect of this card even if it is face-down when it is attacked because its effect is activated during the Damage Step, and it will be face-up at that point.
●The effect of this card targets.

## Summoner of Illusions
[effect Flip Effect Level 3 LIGHT Spellcaster 800/900] formats: both
Text (Edison): FLIP: Tribute 1 other monster, and if you do, Special Summon 1 Fusion Monster from your Extra Deck, but destroy it during the End Phase of this turn.
Edison rulings: ●Tributing 1 monster is a cost.
●You must use Summoner of Illusions’ effect when it is flipped face-up, either by Flip Summon or by being attacked. If you have no cards in your Extra Deck, the effect can't activate and you don't Tribute 1 monster.
●If you use Dimensionhole on the Fusion Monster summoned by this card’s effect, it will return during your next Standby Phase and not be destroyed.
●If the Fusion Monster summoned by this card’s effect is flipped face-down it won't be destroyed during your End Phase, since the condition is reset when the monster becomes face-down.

## Supply
[effect Flip Effect Level 4 EARTH Warrior 1300/800] formats: both
Text (Edison): FLIP: Return 2 Fusion-Material monsters that were sent to the GY as a result of a Fusion Summon to your hand.
Goat text: FLIP: Return 2 Fusion-Material monsters that were sent to the Graveyard as a result of a Fusion Summon to your hand.
Edison rulings: ●You must have 2 Fusion Material Monsters in YOUR GY otherwise this card’s effect will disappear when flipped.
●If you have Fusion Summoned 2 Fusion Monsters during the course of the Duel, you may return 1 Fusion Material Monster from each of them with this card’s effect. In other words, the returned Fusion Material Monsters don't need to be part of the same Fusion.

## Susa Soldier
[effect Effect Spirit Level 4 EARTH Thunder 2000/1600] formats: both
Text (Edison): This card Cannot be Special Summoned. This card returns to the owner's hand during the End Phase of the turn that this card is Normal Summoned or flipped face-up. The Battle Damage this card inflicts to your opponent's LP is halved.
Goat text: This card cannot be Special Summoned. This card returns to the owner's hand during the End Phase of the turn that this card is Normal Summoned or flipped face-up. The Battle Damage this card inflicts to your opponent's Life Points is halved.
Edison rulings: ●When this card inflicts Battle Damage to the opponent it is halved, regardless if it was a direct attack, or from an attack against another monster. For example, if your Susa Soldier (ATK 2000) attacks the opponent’s Gemini Elf (ATK 1900), the opponent will take 50 points of Battle Damage. The damage points are rounded up when there is a fraction.

## Swamp Battleguard
[effect Level 5 EARTH Warrior 1800/1500] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): This card gains 500 ATK for each "Lava Battleguard" you control.

## Swarm of Locusts
[effect Level 3 DARK Insect 1000/500] formats: both
Text (Edison): Once per turn: You can change this card to face-down Defense Position. When this card is Flip Summoned: Target 1 Spell/Trap Card your opponent controls; destroy that target.

## Swarm of Scarabs
[effect Level 3 DARK Insect 500/1000] formats: both
Text (Edison): Once per turn: You can change this card to face-down Defense Position. When this card is Flip Summoned: Target 1 monster your opponent controls; destroy that target.

## Swords of Revealing Light
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): © This card isn't sent to the GY after it resolves. 
© Destroy it during the End Phase of your opponent's 3rd turn after activation.
① If this card is activated: If your opponent controls a Set monster, flip all monsters they control face-up. ② Your opponent's monsters can't declare an attack.
Goat text: After this card's activation, it remains on the field, but you must destroy it during the End Phase of your opponent's 3rd turn. When this card is activated: If your opponent controls a face-down monster, flip all monsters they control face-up. While this card is face-up on the field, your opponent's monsters cannot declare an attack.
Rulings: 1. This card remains on the field and is active until the end of your opponent's third turn. This card must be on the field for its effect to be active.
2. If this card is destroyed or removed from the field by the effect of another card, such as "Heavy Storm" or "Giant Trunade", the opponent may then attack.
3. If multiple Flip Effect monsters are flipped face-up by the effect of "Swords of Revealing Light" the effects are activated simultaneously and follow the rules for simultaneous effects found in the "Advanced Gameplay" section of this website.
4. If "Imperial Order" is active on the field you can still activate "Swords of Revealing Light" and it will maintain its turn count, but it will NOT flip monsters face-up or prevent the opponent from attacking. If "Imperial Order" is destroyed after "Swords of Revealing Light" has been on the field for two of your opponent's turns, it will only prevent your opponent from attacking for one turn and then be destroyed.

## Tactical Espionage Expert
[effect Level 3 EARTH Warrior 1300/1200] formats: both
Text (Edison): When this card is Normal Summoned successfully, no Trap Cards can be activated.
Edison rulings: ●The effect of this monster prevents the activation of Trap Cards that can be activated when a monster is Normal Summoned, such as Trap Hole and Torrential Tribute.
●You can activate Trap Cards later in the turn.
●You can negate the Normal Summon of this monsters with Horn of Heaven or Solemn Judgment. (In which case the Normal Summon failed and the effect of the monster is not applied.)
●The effect of this monster is applied to both players (so you can't activate Pineapple Blast in response to your Normal Summon of this monster).
●This is a Continuous Effect that you can't chain to.

## Tailor of the Fickle
[spell Quick-Play] formats: both
Text (Edison): Switch 1 Equip Card equipped to a monster to another correct target.

## Tainted Wisdom
[effect Level 3 DARK Fiend 1250/800] formats: both
Text (Edison): If this Attack Position card is changed to face-up Defense Position: Shuffle your Deck.

## Talisman of Spell Sealing
[trap Continuous] formats: both
Text (Edison): You can only activate this card while there is a face-up "Sealmaster Meisei" on your side of the field. While this card is face-up on the field, Spell Cards can't be activated and the effects of face-up Spell Cards on the field are negated. When "Sealmaster Meisei" is removed from the field, destroy this card.
Goat text: You can only activate this card while there is a face-up "Sealmaster Meisei" on your side of the field. While this card is face-up on the field, Spell Cards cannot be activated and the effects of face-up Spell Cards on the field are negated. When "Sealmaster Meisei" is removed from the field, destroy this card.
Edison rulings: ●While Royal Decree and Talisman of Spell Sealing are both active, and Sealmaster Meisei is removed from the field, Talisman of Spell Sealing stays on the field, but if Royal Decree's effect is no longer being applied, Talisman of Spell Sealing is destroyed.
●Talisman of Spell Sealing is destroyed immediately when Sealmaster Meisei is not on the field. If your opponent chains Ring of Destruction to Talisman of Spell Sealing to destroy Sealmaster Meisei, Talisman of Spell Sealing is immediately destroyed when Ring of Destruction resolves.
●If you have Talisman of Spell Sealing and Talisman of Trap Sealing, the controller can select which effect will be applied. If both players have both, the turn player chooses which effect is applied.

## Talisman of Trap Sealing
[spell Continuous] formats: both
Text (Edison): You can only activate this card while there is a face-up "Sealmaster Meisei" on your side of the field. While this card is face-up on the field, Trap Cards can't be activated and the effects of face-up Trap Cards on the field are negated. When "Sealmaster Meisei" is removed from the field, destroy this card.
Goat text: You can only activate this card while there is a face-up "Sealmaster Meisei" on your side of the field. While this card is face-up on the field, Trap Cards cannot be activated and the effects of face-up Trap Cards on the field are negated. When "Sealmaster Meisei" is removed from the field, destroy this card.
Edison rulings: ●While Imperial Order and Talisman of Trap Sealing are both active, and Sealmaster Meisei is removed from the field, Talisman of Trap Sealing stays on the field, but if Imperial Order's effect is no longer being applied, Talisman of Trap Sealing is destroyed.
●Talisman of Trap Sealing is destroyed immediately when Sealmaster Meisei is not on the field. If your opponent chains Ring of Destruction to Talisman of Trap Sealing to destroy Sealmaster Meisei, Talisman of Trap Sealing is immediately destroyed when Ring of Destruction resolves.
●If you have Talisman of Spell Sealing and Talisman of Trap Sealing, the controller can select which effect will be applied. If both players have both, the turn player chooses which effect is applied.
●If you have Talisman of Trap Sealing and Sealmaster Meisei is destroyed in a battle that causes you to take 2000 or more damage, you can't activate Nutrient Z.

## Taunt
[trap Normal] formats: both
Text (Edison): Activate only during your opponent's Main Phase 1; select 1 monster on your side of the field. While the selected card remains on the field, if your opponent attacks with a monster(s) this turn, they must select the selected monster as the attack target.
Edison rulings: ●If a monster selected by Taunt is moved to the turn player’s side of the field, the turn player can conduct attacks normally without worrying about the effect of Taunt, because without a card effect that allows it, a player can't attack monsters on his own side of the field.
●If multiple monsters are selected by multiple Taunts, the turn player selects 1 of the monsters selected by Taunt and can attack it.
●If 1 monster is selected by Taunt and another is equipped with Ring of Magnetism, the turn player must attack the monster equipped with Ring of Magnetism if he attacks.

## Terrorking Archfiend
[effect Level 4 DARK Fiend 2000/1500] formats: both
Text (Edison): This card Cannot be Normal Summoned or Flip Summoned unless you have an Archfiend Monster Card on your side of the field. The controller of this card pays 800 LP during each of his/her Standby Phases (this is not optional). When this card is targeted by the effect of a card controlled by your opponent, when resolving the effect, roll a six-sided die. If the result is 2 or 5, negate the effect and destroy the opponent's card. The effects of an Effect Monster that this card destroyed as a result of battle are negated.
Goat text: This card cannot be Normal Summoned or Flip Summoned unless you have an Archfiend Monster Card on your side of the field. The controller of this card pays 800 Life Points during each of his/her Standby Phases (this is not optional). When this card is targeted by the effect of a card controlled by your opponent, when resolving the effect, roll a six-sided die. If the result is 2 or 5, negate the effect and destroy the opponent's card. The effects of an Effect Monster that this card destroyed as a result of battle are negated.
Edison rulings: ●When your only Archfiend monster is an Equip Spell Card equipped to Relinquished, you can't Normal Summon or Flip Summon Terrorking Archfiend.
●While Skill Drain is active, you still need to have an Archfiend Monster Card on your side of the field in order to Normal Summon or Flip Summon Terrorking Archfiend.
●You can Set or Special Summon a Terrorking Archfiend even if there are no Archfiend Monster Cards on your side of the field.

## Teva
[effect Level 5 LIGHT Warrior 2000/1500] formats: both
Text (Edison): ① If this card is Tribute Summoned: Your opponent can't declare an attack during their next turn.
Goat text: When this card is Tribute Summoned successfully, your opponent cannot declare an attack during his/her next turn.
Edison rulings: ●This effect starts a chain. 'Pulling the Rug' can be chained to it.

## Theban Nightmare
[effect Level 4 LIGHT Fiend 1500/500] formats: both
Text (Edison): Gains 1500 ATK while you have no cards in your hand nor in your Spell & Trap Zones.
Edison rulings: ●If you have only Kuriboh in your hand, and no Spell or Trap Cards on the field, and your Theban Nightmare battles with a card that has higher ATK/DEF, and you discard Kuriboh, the ATK of Theban Nightmare is increased by 1500 AFTER damage calculation (but Theban Nightmare is still destroyed by damage calculation unless an effect like Waboku had been activated previously during the turn).

## Theinen the Great Sphinx
[effect Level 10 LIGHT Beast 3500/3000] formats: both
Text (Edison): © Cannot be Normal Summoned/Set. 
© Must be Special Summoned by its own effect.
① When "Andro Sphinx" and "Sphinx Teleia" you control are destroyed at the same time: You can pay 500 LP; Special Summon this card from your hand/Deck.
② When this card is Special Summoned: You can pay 500 LP; until the End Phase, this card gains 3000 ATK.
Goat text: This card cannot be Normal Summoned or Set. This card cannot be Special Summoned except by paying 500 Life Points when both "Andro Sphinx" and "Sphinx Teleia" on your side of the field are destroyed at the same time; then you can Special Summon this monster from your hand or Deck. When this card is Special Summoned, by paying 500 Life Points, increase the ATK of this card by 3000 points until the end of the End Phase.
Edison rulings: ● The only way you can Special Summon this card is via its trigger effect.
Even if it was initially summoned that way, you still can't summon it with card effects.
● The effect to summon this card is a Trigger effect. It can activate while in the hand/Deck.
You can't activate the effects of 2 or more of this card's effect in the same Chain, so you can only Summon 1 "Thenien the Great Sphinx" at a time.
● Both of this card's effects are optional, and both can can miss their timing.

## Thestalos the Firestorm Monarch
[effect Level 6 FIRE Pyro 2400/1000] formats: both
Text (Edison): ① If Tribute Summoned: Discard 1 random card from your opponent's hand, then if it was a monster, your opponent takes damage equal to its Level x100.
Edison rulings: ● This effect is mandatory.

## Throwstone Unit
[effect Level 4 EARTH Warrior 900/2000] formats: both
Text (Edison): Tribute 1 Warrior monster on your side of the field to destroy 1 face-up monster on the field whose DEF is equal to or less than the ATK of this card.
Goat text: Tribute 1 Warrior-Type monster on your side of the field to destroy 1 face-up monster on the field whose DEF is equal to or less than the ATK of this card.
Edison rulings: ●Use the current ATK and DEF of Throwstone Unit and the targeted monster.
●You can Tribute Throwstone Unit for its own effect.

## Timeater
[effect Level 6 DARK Machine 1900/1700] formats: both
Text (Edison): ① If this card destroys an opponent's monster by battle:
Your opponent skips their next Main Phase 1.
Edison rulings: ● This effect does not specify “and sends it to the GY”. It triggers at the end of the Damage Step, even if destroyed after Damage Calculation (either by battle or by effect), as long as it destroyed a monster by battle.

## Timidity
[spell Normal] formats: both
Text (Edison): Neither player can destroy Set Spell and Trap Cards on the field until your opponent's next End Phase.
Edison rulings: ●While the effect of Timidity is active, all effects of a card which would destroy a Set Spell or Trap Card are negated.
●While the effect of Timidity is active, you can't destroy a face-down Monster Card equipped to Relinquished.
●While the effect of Timidity is active, and your opponent activates Heavy Storm, face-down Spell and Trap Cards are not destroyed but face-up cards will be.

## Token Feastevil
[trap Normal] formats: both
Text (Edison): When a Token(s) is Special Summoned: Destroy as many Tokens on the field as possible, and if you do, inflict 300 damage to your opponent for each Token destroyed.

## Token Thanksgiving
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Destroy all tokens on the field. Increase your LP by the number of tokens destroyed x 800 points.
Goat text: Destroy all tokens on the field. Increase your Life Points by the number of tokens destroyed x 800 points.
Edison rulings: ●Token Thanksgiving will destroy a Monster Token equipped to Relinquished.

## Toll
[spell Continuous] formats: both
Text (Edison): Each player must pay 500 LP to declare an attack.
Goat text: Each player must pay 500 Life Points to declare an attack.
Edison rulings: ●Paying Life Points for Toll is a cost, so if a player can't pay the 500 Life Points, they can't declare an attack. If there are two of this card on the field, a player must pay 1000 Life Points per monster to attack.

## Torpedo Fish
[effect Level 3 WATER Fish 1000/1000] formats: both
Text (Edison): While "Umi" is face-up on the field, this card is unaffected by any Spell Cards.

## Tower of Babel
[trap Continuous] formats: both
Text (Edison): Each time a Spell Card is activated, place 1 Spell Counter on this card when that Spell Card resolves. If the 4th Spell Counter is placed on this card: Destroy this card, and if you do, the player who activated the Spell Card at that time takes 3000 damage.
Rulings: 1. You place a Spell Counter on this card when the Spell Card resolves, so if "Magic Jammer" is used to negate the Spell Card's activation then you do not place a Spell Counter on this monster. But if "Imperial Order" is chained to the Spell Card, you still place a Spell Counter on this monster because the activation of the Spell Card was not negated. If the Spell Card was a Continuous, Equip, or Field Spell Card, and "Dust Tornado" is chained to its activation and destroys it before it resolves you still place a Spell Counter because the activation of the card was not negated.
2. "Tower of Babel" must be active and face-up on the field before the Spell Card was activated, and when the Spell Card resolves, in order to get a Spell Counter. If you chain "Tower of Babel" to a Spell Card, you do not get a Spell Counter for that Spell Card. If a Quick-Play Spell Card is chained to the activation of "Tower of Babel", you do not get a Spell Counter for that Quick-Play Spell Card.
3. You can move Spell Counters to "Tower of Babel" with "Pitch Black Power Stone", but if the 4th Spell Counter is placed on "Tower of Babel" with "Pitch Black Power Stone" or "Apprentice Magician", "Tower of Bab

## Tragedy
[trap Normal] formats: both
Text (Edison): When a Attack Position monster(s) your opponent controls is changed to face-up Defense Position: Destroy all Defense Position monsters your opponent controls.
Goat text: When a face-up Attack Position monster(s) your opponent controls is changed to face-up Defense Position: Destroy all Defense Position monsters your opponent controls.
Edison rulings: ●You can't activate Tragedy during the Damage Step.
●You can activate Tragedy after an Attack Position monster is changed to Defense Position by a card effect, such as Enemy Controller or Stumbling.
●Spear Dragon changes its battle position at the end of the Damage Step, so you can't activate Tragedy at that time. Goblin Attack Force and Giant Orc change their battle positions at the end of the Battle Phase, so you can activate Tragedy at that time.
●Missing the Timing: The position change must be the last thing to have happened. If “Zero Gravity” was activated as Chain Link 2 or higher, you would not be able to activate “Tragedy”.

## Tremendous Fire
[spell Normal] formats: both
Text (Edison): Inflict 1000 points of damage to your opponent's LP and 500 points of damage to your LP.
Goat text: Inflict 1000 points of damage to your opponent's Life Points and 500 points of damage to your Life Points.

## Triangle Ecstasy Spark
[spell Normal] formats: both
Text (Edison): Until the end of this turn, the ATK of all "Harpie Lady Sisters" currently on the field becomes 2700, your opponent can't activate any Trap Cards, also negate all your opponent's Trap effects on the field.
Goat text: Until the end of this turn, the ATK of all "Harpie Lady Sisters" currently on the field becomes 2700, your opponent cannot activate any Trap Cards, also negate all your opponent's Trap effects on the field.
Edison rulings: ●You can't activate Triangle Ecstasy Spark if Harpie Lady Sisters is not on the field. You can activate it if the opponent controls a Harpie Lady Sisters. In that case the ATK of the opponent’s Harpie Lady Sisters will become 2700, but the opponent still can't activate Trap Cards, and the effects of Trap Cards on the opponent’s side of the field are negated.
●If there are multiple copies of Harpie Lady Sisters on the field, the ATK of each becomes 2700 until the End Phase.
●If a Trap Card such as Waboku is chained to the activation of Triangle Ecstasy Spark, the effect of Waboku resolves first, and will apply for the rest of the turn regardless of Triangle Ecstasy Spark. (Just like if Jinzo is Summoned after Waboku is activated and resolves.)

## Triangle Power
[spell Normal] formats: both
Text (Edison): Increase the original ATK and DEF of all face-up Level 1 Normal Monsters (except Tokens) on your side of the field by 2000 points until the End Phase. Destroy all Level 1 Normal Monsters on your side of the field during the End Phase.

## Tribe-Infecting Virus
[effect Level 4 WATER Aqua 1600/1000] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Discard 1 card from your hand and declare 1 Type of monster. Destroy all face-up monsters of the declared Type on the field.
Edison rulings: ●You declare the Type when you activate the effect and discard for the cost, not when the effect resolves, so your opponent can chain after you have announced which Type will be destroyed.
●You CAN declare a Type that exists only on your opponent's side of the field. You can't declare a Type that is not face-up on the field at all.
●You can use this effect repeatedly as long as you can keep paying the cost.

## Tribute Doll
[spell Normal] formats: both
Text (Edison): Tribute 1 monster; Special Summon 1 Level 7 monster from your hand that can be Normal Summoned/Set. It can't attack this turn.
Goat text: Tribute 1 monster; Special Summon 1 Level 7 monster from your hand that can be Normal Summoned/Set. It cannot attack this turn.
Edison rulings: ●You can't use Tribute Doll to Special Summon a Special Summon-only monster like Dark Necrofear.
●You can use Monster Tokens as a cost for Tribute Doll.
●If you Special Summon a monster with Tribute Doll, you can't activate Diffusion Wave-Motion on that monster because it can't attack that turn due to Tribute Doll's effect. However, you can use Diffusion Wave-Motion on the monster during your next turn.
●You can combine Soul Exchange with Tribute Doll to Tribute your opponent's monster as the cost of Tribute Doll.

## Tribute to the Doomed
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Discard 1 card, then target 1 monster on the field; destroy it.

## Troop Dragon
[effect Level 2 WIND Dragon 700/800] formats: both
Text (Edison): If this card is destroyed by battle and sent to the GY: Special Summon 1 "Troop Dragon" from your Deck.

## Tsukuyomi
[effect Effect Spirit Level 4 DARK Spellcaster 1100/1400] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Cannot be Special Summoned. If this card is Normal Summoned or flipped face-up: Target 1 face-up monster on the field; change that target to face-down Defense Position. Once per turn, during the End Phase, if this card was Normal Summoned or flipped face-up this turn: Return it to the hand.
Edison rulings: ●You can select Tsukuyomi itself as the target of Tsukuyomi's effect, but not when Tsukuyomi was flipped face-up by an attack and destroyed by damage calculation.

## Turtle Oath
[spell Ritual] formats: both
Text (Edison): This card is used to Ritual Summon "Crab Turtle". You must also offer monsters whose total Level Stars equal 8 or more as a Tribute from the field or your hand.

## Tutan Mask
[trap Counter] formats: both
Text (Edison): When a Spell/Trap Card is activated that targets exactly 1 Zombie monster on the field (and no other cards): Negate the activation, and if you do, destroy it.
Edison rulings: ●You can't activate Tutan Mask to negate a Spell or Trap Card that targets a Zombie-Type monster in the GY or Deck (such as Monster Reborn).
●You can't use Tutan Mask to negate a Spell or Trap Card that targets a face-down Zombie-Type monster.

## Twinheaded Beast
[effect Level 6 FIRE Beast 1700/1900] formats: both
Text (Edison): This card can attack twice during the same Battle Phase.

## Type Zero Magic Crusher
[trap Continuous] formats: both
Text (Edison): Discard 1 Spell Card from your hand to inflict 500 points of damage to your opponent's LP.
Goat text: Discard 1 Spell Card from your hand to inflict 500 points of damage to your opponent's Life Points.
Edison rulings: ●Discarding 1 Spell Card is a cost to activate Type Zero Magic Crusher's Ignition effect.

## Tyrant Dragon
[effect Level 8 FIRE Dragon 2900/2500] formats: both
Text (Edison): During your Battle Phase, if your opponent controls a monster after this card's first attack, this card can make a second attack. Negate any Trap effects that target this card on the field, and if you do, destroy that Trap. This card Cannot be Special Summoned from the GY, unless you Tribute 1 Dragon monster.
Goat text: During your Battle Phase, if your opponent controls a monster after this card's first attack, this card can make a second attack. Negate any Trap effects that target this card on the field, and if you do, destroy that Trap. This card cannot be Special Summoned from the GY, unless you Tribute 1 Dragon monster.
Edison rulings: ●The first sentence of this card’s text means that after you complete an attack with Tyrant Dragon, if there is still a monster on the opponent’s side of the field, Tyrant Dragon can immediately attack again. You can't attack with another monster in between, and then attack a second time with Tyrant Dragon. If there are no monsters on your opponent’s side of the field after Tyrant Dragon’s first attack, Tyrant Dragon does not gain a second attack.
●Tyrant Dragon can't attack more than twice, even if there is another monster remaining on your opponent’s side of the field after the second attack.
●Tyrant Dragon's first attack does not have to be the first attack of the Battle Phase. You may attack with another monster, then with Tyrant Dragon, then again with Tyrant Dragon -- if the opponent still controls a monster.
●The opponent may activate Trap Cards that target Tyrant Dragon, but their effects will be negated and the cards destroyed.
●When you Summon Tyrant Dragon, the opponent can activate Torrential Tribute or Bottomless Trap Hole and destroy Tyrant Dragon because neither of these Trap Cards target. (However, Trap Hole does target and its effect will disappear if activated.)
●When you attack with Tyrant Dragon the opponent can activate Mirror Force and all your Attack Position monsters, including Tyrant Dragon, will be destroyed. This is because Mirror Force does not target.
●You may activate Last Turn and select your Tyrant Dragon as the monster to keep, because Last Tu

## UFO Turtle
[effect Level 4 FIRE Machine 1400/1200] formats: both
Text (Edison): ① If destroyed by battle and sent to the GY:
You can Special Summon 1 FIRE with 1500 or less ATK from your Deck, in Attack Position.
Goat text: When this card is destroyed by battle and sent to the Graveyard: You can Special Summon 1 FIRE monster with 1500 or less ATK from your Deck, in face-up Attack Position.
Edison rulings: ● This effect activates in the Damage Step, so it can never be negated by "Royal Oppression". 
Cards like "Bottomless Trap Hole" and "Torrential Tribute" can never be used in response to this Summon.

## Ultra Evolution Pill
[spell Normal] formats: both
Text (Edison): Tribute 1 Reptile monster; Special Summon 1 Dinosaur monster from your hand.
Edison rulings: ●You can Tribute a face-down Reptile-Type monster when you activate Ultra Evolution Pill.

## Umi
[spell Field] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): All Fish, Sea Serpent, Thunder, and Aqua monsters on the field gain 200 ATK/DEF, also all Machine and Pyro monsters on the field lose 200 ATK/DEF.

## Umiiruka
[spell Field] formats: both
Text (Edison): Increase the ATK of all WATER monsters by 500 points and decrease their DEF by 400 points.

## Union Rider
[effect Level 2 WIND Machine 1000/1000] formats: both
Text (Edison): You can take control of up to 1 Union Monster that is currently a monster on your opponent's side of the field, and equip it to this card. The Union Monster that is equipped to this card can't be changed back to a monster using its own effect.
Goat text: You can take control of up to 1 Union Monster that is currently a monster on your opponent's side of the field, and equip it to this card. The Union Monster that is equipped to this card cannot be changed back to a monster using its own effect.
Edison rulings: ●When you use Union Rider's effect to equip a Union Monster to it, because the Union Monster was not equipped to Union Rider by the Union Monster's effect, the bonuses of the Union Monster are not applied, including the If the monster that this card is equipped to is destroyed in battle, this card is destroyed instead. effect.
●You can only use the effect of Union Rider during your Main Phase 1 or 2.
●If you use Combination Attack or Formation Union on your Union Rider equipped with your opponent's Union Monster, the Union Monster is Special Summoned onto your (the controller of Union Rider's) side of the field.
●If you equip your Union Rider with your opponent's Union Monster, and attack with Union Rider, then use Combination Attack, you will then control both the Union Rider and the Union Monster on your side of the field, and both may attack (again) that turn.
●The Union Monster you equip to your Union Rider is actually placed in your Spell & Trap Card Zone, so it counts for you for Mage Power, etc.
●You must have a Spell & Trap Card Zone space vacant to activate your Union Rider's effect.

## United We Stand
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① A monster equipped with this card gains 800 ATK/DEF for each face-up monster you control.

## Unshaven Angler
[effect Level 4 WATER Fish 1500/1600] formats: both
Text (Edison): When Tribute Summoning a WATER monster, you can treat this 1 monster as 2 Tributes.

## Valkyrion the Magna Warrior
[effect Level 8 EARTH Rock 3500/3850] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Cannot be Normal Summoned/Set. Must first be Special Summoned (from your hand) by Tributing 1 "Alpha The Magnet Warrior", "Beta The Magnet Warrior", and "Gamma The Magnet Warrior" from your hand and/or field. You can Tribute this card, then target 1 "Alpha The Magnet Warrior", "Beta The Magnet Warrior", and "Gamma The Magnet Warrior" in your GY; Special Summon them.
Goat text: Cannot be Normal Summoned/Set. Must first be Special Summoned (from your hand) by Tributing 1 "Alpha The Magnet Warrior", "Beta The Magnet Warrior", and "Gamma The Magnet Warrior" from your hand and/or field. You can Tribute this card, then target 1 "Alpha The Magnet Warrior", "Beta The Magnet Warrior", and "Gamma The Magnet Warrior" in your Graveyard; Special Summon them.
Edison rulings: ●You can Tribute the three monsters required to Special Summon this card from your hand, the field, or any combination of the two.
●You can only Special Summon this card through its own effect during your Main Phase 1 or 2. You can also only use its effect to Special Summon the Magnet Warriors during your Main Phase 1 or 2.
●If your opponent gains control of your Valkyrion the Magna Warrior he / she may Tribute it to Special Summon the Magnet Warriors if they have all 3 of them in their own GY.
●If you would have 2 or less vacant Monster Card Zones after you Tribute Valkyrion the Magna Warrior you can't use its effect to Special Summon the Magnet Warriors.
●The opponent can activate Bottomless Trap Hole and Beta the Magnet Warrior and Gamma the Magnet Warrior will be destroyed.
●If you have Card of Safe Return active on the field when you Tribute Valkyrion the Magna Warrior to Special Summon the Magnet Warriors, you draw only 1 card.

## Vampiric Orchis
[effect Level 4 EARTH Plant 1700/1000] formats: both
Text (Edison): When this card is Normal Summoned: You can Special Summon 1 "Des Dendle" from your hand.

## Versago the Destroyer
[effect Level 3 DARK Fiend 1100/900] formats: both
Text (Edison): You can substitute this card for any 1 Fusion Material Monster. When you do this, the other Fusion Material Monster(s) must be the correct one(s).
Edison rulings: ●The Unclassified Effect is not an Ignition, Trigger, Quick, or Continuous Effect. It does not activate.
●This effect does not target.
●Using Versago the Destroyer as a Fusion Material does not start a Chain Link.
●This effect does not apply while Versago the Destroyer is in the Deck or removed from play.
●This card can't be sent to the GY to when Special Summoning Chimeratech Fortress Dragon or XYZ-Dragon Cannon.
●If Versago the Destroyer is named by Prohibition, you can't use its effect

## Vile Germs
[spell Equip] formats: both
Text (Edison): A Plant monster equipped with this card increases its ATK and DEF by 300 points.
Goat text: A Plant-Type monster equipped with this card increases its ATK and DEF by 300 points.

## Vilepawn Archfiend
[effect Level 2 EARTH Fiend 1200/200] formats: both
Text (Edison): The controller of this card pays 500 LP during each of his/her Standby Phases (this is not optional). When this card is targeted by the effect of a card controlled by your opponent, when resolving the effect, roll a six-sided die. If the result is 3, negate the effect and destroy the opponent's card. As long as this card remains on the field, your opponent can't attack any Archfiend Monster Card on your side of the field except "Vilepawn Archfiend".
Goat text: The controller of this card pays 500 Life Points during each of his/her Standby Phases (this is not optional). When this card is targeted by the effect of a card controlled by your opponent, when resolving the effect, roll a six-sided die. If the result is 3, negate the effect and destroy the opponent's card. As long as this card remains on the field, your opponent cannot attack any Archfiend Monster Card on your side of the field except "Vilepawn Archfiend".
Rulings: 1. ARCHFIENDS: The following rulings apply to "Vilepawn Archfiend", "Desrook Archfiend", "Shadowknight Archfiend", "Darkbishop Archfiend", "Infernalqueen Archfiend", "Terrorking Archfiend", and "Skull Archfiend of Lightning".
2. If you don't have enough Life Points to pay for an Archfiend, the Archfiend is destroyed and you don't pay the cost.
3. You roll a die for Archfiends when your opponent resolves an effect that targets the Archfiend, not when it is activated. If the activation or effect of a card that targets your Archfiend is negated by some other card, then you do not roll a die for the Archfiend.
4. If your Archfiend is targeted by "Barrel Dragon", roll a die for the Archfiend before flipping coins for "Barrel Dragon".
5. Rolling a die for an Archfiend cannot be chained to since you are resolving an effect.
6. The effect of rolling a die for an Archfiend is a Trigger Effect.
7. The effect of rolling a die for an Archfiend will be negated by "Skill Drain".
8. You can roll a die for an Archfiend during the Damage Step.

## Violet Crystal
[spell Equip] formats: both
Text (Edison): (This card is not treated as a "Crystal" card.)
Equip only to a Zombie monster. It gains 300 ATK/DEF.

## Waboku
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): You take no battle damage from your opponent's monsters this turn. Your monsters can't be destroyed by battle this turn.
Goat text: You take no battle damage from your opponent's monsters this turn. Your monsters cannot be destroyed by battle this turn.
Rulings: 1. "Waboku" makes Battle Damage dealt by your opponent's monsters to your monsters and to your Life Points become zero.
2. "Waboku" applies to ALL of the monsters on that player's side of the field for the entire turn.
3. To illustrate how "Waboku" works, here are some scenarios and their results:

SCENARIO 1: Player A's "Mega Thunderball" attacks Player B's "Mega Thunderball", and Player B activates "Waboku". RESULT: Player A's (attacking) "Mega Thunderball" is destroyed. Player B's "Mega Thunderball" (with equal ATK) is NOT destroyed.

SCENARIO 2: Player A activates "Waboku". Player A's "Mega Thunderball" then attacks Player B's "Mega Thunderball". RESULT: Player B's "Mega Thunderball" is destroyed. Player A's (attacking) "Mega Thunderball" is NOT destroyed. So you can use "Waboku" 'offensively' when attacking an equal ATK monster.

SCENARIO 3: Player A activates "Waboku". Player A's "Blue-Eyes White Dragon" then attacks Player B's "Sanga of the Thunder". Player B uses the effect of "Sanga of the Thunder" (during the Damage Step). RESULT: Player A's "Blue-Eyes White Dragon" (ATK 0) is not destroyed, nor does Player A lose any Life Points, because of Player A's "Waboku".

SCENARIO

## Wandering Mummy
[effect Level 4 EARTH Zombie 1500/1500] formats: both
Text (Edison): You can flip this card into face-down Defense Position once per turn during your Main Phase. After you use this effect, rearrange the face-down Defense Position monsters in your Main Monster Zones, then return them in face-down Defense Position.

## Wasteland
[spell Field] formats: both
Text (Edison): All Dinosaur, Zombie, and Rock monsters on the field gain 200 ATK/DEF.
