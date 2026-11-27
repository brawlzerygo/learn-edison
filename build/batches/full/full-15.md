# Full pool batch 15: 53 cards. Write js/cards/full-15.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Spell Absorption
[spell Continuous] formats: both
Text (Edison): Each time a Spell Card is activated, gain 500 LP immediately after it resolves.
Edison rulings: ●The effect of “Spell Absorption” is applied when the Spell Card is activated. You can't chain to this effect. The effect is applied immediately. For example, when activating “Tribute to the Doomed” while “Spell Absorption” is on the field: 
●If the activation of a Spell Card is negated by “Magic Jammer”, etc., then you won't gain Life Points for “Spell Absorption”.
●A Spell Card used from the GY by the effect of “Double Spell” is not considered “activated”, so you will only gain Life Points for “Spell Absorption” for “Double Spell” itself, not for the card used from the GY.
●When you activate “Spell Absorption”, you don't gain Life Points for activating “Spell Absorption” itself.

## Spell Calling
[spell Normal] formats: edison
Text (Edison): When this face-down card is destroyed and sent to the GY by the effect of a Spell or Trap Card controlled by your opponent, select 1 Quick-Play Spell Card from your Deck and Set it after showing it to your opponent.

## Spell Canceller
[effect Level 5 WIND Machine 1800/1600] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Spell Cards, and their effects on the field, can't be activated. Negate all Spell effects on the field.
Goat text: Spell Cards, and their effects on the field, cannot be activated. Negate all Spell effects on the field.
Edison rulings: ●The Continuous Effect applies on the field.
●Players can't activate (play face-up) Spell Card. This does not negate the activation of Spell Cards (the way Dark Bribe does), and so Spiritualism can't be played.
●Player CAN activate the effects of Spell Cards on the field and in the GY.
●Lingering Effects that have already been established (ex: Limited Removal) are not affected.
●The Continuous Effect applies on the field.
●Negate the effects of Spell Cards that activate & resolve on the field.
●A Spell's effect that activates in the GY (ex: Geartown, Magical Blast) is not negated.
●Lingering Effects that have already been established (ex: Limited Removal) are not negated.
●VS. Named / Spell Counters: Remove all Clock Counters from Clock Tower Prison.
●VS. Premature Burial: Spell Canceller is not destroyed by the effect of Premature Burial.

## Spell Chronicle
[spell Continuous] formats: edison
Text (Edison): Activate this card by sending your entire hand to the GY; banish 5 Spells/Traps from your Deck. Each time your opponent activates a Spell Card, place 1 Chronicle Counter on this card when that Spell Card resolves. You can remove 2 Chronicle Counters from this card; your opponent chooses 1 card banished by this card's effect for you to add to your hand. If this face-up card in the Spell & Trap Zone leaves the field: You take 500 damage for each card currently banished by this card's effect.
Edison rulings: ●Sending every card in your hand to the GY is a cost to activate Spell Chronicle. The 5 Spell or Trap Cards are removed from play when Spell Chronicle resolves.
●Spell Chronicle can't be activated when you have a combined total of 4 or less Spell and Trap Cards remaining in your Deck.
●The Spell and Trap Cards are removed from play face-up.
●Placing 1 Chronicle Counter onto Spell Chronicle does not start a Chain.
●The damage inflicted by Spell Chronicle does not start a Chain.
●Adding 1 of the removed from play Spell or Trap Cards to your hand does not target the card to be added to your hand.
●When you activate Spell Chronicle, it does not gain a Chronicle Counter if a Quick-Play Spell Card is chained to its activation.

## Spell Economics
[spell Continuous] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): You don't pay LP to activate Spell Cards.
Goat text: You do not pay Life Points to activate Spell Cards.
Edison rulings: ●While Spell Economics is active, you don't have to pay Life Points to activate a Spell Card (place it face-up on the field), but to activate an effect of a Spell Card, like Archfiend's Oath, you still have to pay.
●Only the controller of Spell Economics gets its effect.
●You have to pay for Chain Energy even if you control Spell Economics.
●You pay the 500 Life Points to restore Horn of Light to your Deck even if Spell Economics is on the field.

## Spell Gear
[spell Normal] formats: edison
Text (Edison): Send 3 "Ancient Gear" cards you control to the GY. You can Special Summon up to 1 "Ancient Gear Golem" from your hand and 1 from your Deck, ignoring the Summoning conditions. Then, destroy all monsters you control except "Ancient Gear Golems". You can't Normal Summon or Set until the end of your next turn.
Edison rulings: ●'Ancient Gear' cards means any card you control that has Ancient Gear in its card name.
●You can't activate Spell Gear if you don't have any Ancient Gear Golem remaining in your Deck.
●If an effect is chained that prevents you from Special Summoning Ancient Gear Golem, you still can't Normal Summon or Set until the end of your next turn.
●The effect that prohibits Normal Summons or Sets until the end of your next turn is not a restriction on this card’s activation. So you can activate this card if you Normal Summoned earlier in the turn. But you can't Normal Summon or Set after it is activated.

## Spell of Pain
[spell Quick-Play] formats: edison
Text (Edison): When your opponent activates a card or effect that would inflict effect damage to you: Your opponent takes the effect damage from that card or effect, instead.
Edison rulings: ●“Spell of Pain” ‘switches’ damage, like “Barrel Behind the Door.” It does not actually have an effect itself that ‘inflicts’ damage. “Spell of Pain” is chained to an effect that would inflict damage to you.
●You can't activate “Spell of Pain” during the Damage Step.

## Spell Power Grasp
[spell Normal] formats: edison
Text (Edison): Target 1 face-up card on the field that you can place a Spell Counter on; place 1 Spell Counter on that target, then you can add 1 "Spell Power Grasp" from your Deck to your hand. You can only activate 1 "Spell Power Grasp" per turn.

## Spell Purification
[trap Normal] formats: both
Text (Edison): Discard 1 card from your hand. Destroy all face-up Continuous Spell Cards.

## Spell Reactor RE
[effect Level 3 DARK Machine 1200/900] formats: edison
Text (Edison): Once per turn, if your opponent activates a Spell Card (Quick): You can destroy that Spell Card, and if you do, inflict 800 damage to your opponent.
Edison rulings: ●This effect chains to that card's activation. 
●This does not negate the effect of that Spell Card (but if a Continuous, Field, or Equip card is destroyed this way, its effects won't resolve).

## Spell Reclamation
[trap Normal] formats: edison
Text (Edison): Discard 1 card and chain this card to a Spell Card you activated. Whenever that Spell Card is sent to the GY, return it to its owner's hand.
Edison rulings: ●This effect does not target.
●This card can be chained to any type of Spell Card (Normal, Continuous, Quick-Play or Equip or Field.).
●This card’s effect to return the Spell Card to its owner’s hand does not start a Chain.
●This card’s effect is only applied once, the first time the Spell Card it was chained to is sent from the field to the GY for any reason. This includes an Equip Spell Card equipped to a monster Tributed for a Tribute Summon, or a card sent to the GY as a cost for Emergency Provisions, etc.
●The Spell Card must be sent to the GY, if it is removed from play, it won't return to your hand.
●If the Spell Card that “Spell Reclamation” was chained to is removed from play, or returned to the hand, etc. instead of going to the GY, “Spell Reclamation’s” effect is no longer applied.
●If the Spell Card that Spell Reclamation affected is sent to the GY during resolution of a Chain, it returns to the owner's hand immediately after resolving the effect that sent it to the GY.
●This card can only be chained to the activation a Spell Card, and not when the effect of a Spell Card is activated (by Destiny Hero - Diamond Dude, etc.)
●If Spell Reclamation is chained to a Spell Card's activation, and Mystical Space Typhoon, etc. is chained to Spell Reclamation targeting the same Spell Card, that Spell Card won't return to its owner's hand because it is destroyed before Spell Reclamation resolves.
●If a Spell Card that has an effect that activates when it is sent to the GY, lik

## Spell Reproduction
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Send 2 Spells from your hand to the GY, then target 1 Spell in your GY; add it to your hand.

## Spell Shattering Arrow
[spell Quick-Play] formats: edison
Text (Edison): Destroy as many face-up Spells your opponent controls as possible, and if you do, inflict 500 damage to your opponent for each.

## Spell Shield Type-8
[trap Counter] formats: both
Text (Edison): Activate 1 of these effects.
● When a Spell Card is activated that targets exactly 1 monster on the field: Negate the activation, and if you do, destroy it.
● When a Spell Card is activated: Send 1 Spell Card from your hand to the GY; negate the activation, and if you do, destroy it.
Goat text: Activate 1 of these effects.
● When a Spell Card is activated that targets exactly 1 monster on the field: Negate the activation, and if you do, destroy it.
● When a Spell Card is activated: Send 1 Spell Card from your hand to the Graveyard; negate the activation, and if you do, destroy it.
Edison rulings: ●Discarding a Spell Card for Spell Shield Type-8 is a cost.

## Spell Striker
[effect Level 3 EARTH Warrior 600/200] formats: edison
Text (Edison): You can Special Summon this card (from your hand) by banishing 1 Spell Card from your GY. This card can attack directly. You take no battle damage from attacks involving this card.

## Spell Vanishing
[trap Counter] formats: both
Text (Edison): Discard 2 cards from your hand. Negate the activation of a Spell Card and destroy it. Also, look at your opponent's hand and Deck and if you find any Spell Cards of the same name as the destroyed Spell Card, send all of them to the GY.
Goat text: Discard 2 cards from your hand. Negate the activation of a Spell Card and destroy it. Also, look at your opponent's hand and Deck and if you find any Spell Cards of the same name as the destroyed Spell Card, send all of them to the Graveyard.
Edison rulings: ●When you activate Spell Vanishing, you get to search your opponent's Deck to look for any Spell Cards of the same name as the destroyed Spell Card.

## Spell-Stopping Statute
[trap Counter] formats: both
Text (Edison): Activate only when your opponent activates a Continuous Spell Card. Negate the activation and the effect of the card and destroy it.

## Spirit Barrier
[trap Continuous] formats: both
Text (Edison): While you control a monster, you take no battle damage.
Edison rulings: ●You still perform damage calculation with Spirit Barrier even though the damage to the controller’s Life Points becomes zero.
●If you have 1 monster on the field, and Airknight Parshath attack and destroys it, and would do extra damage, there is still a monster on the field when Airknight Parshath’s effect would activate and resolve, so Spirit Barrier’s effect is applied, Airknight Parshath inflicts zero damage to your Life Points, and your opponent does not draw 1 card for Airknight Parshath’s effect.

## Spirit Burner
[spell Equip] formats: edison
Text (Edison): Once per turn, you can change the battle position of the equipped monster to Defense Position. When the equipped monster is returned from the field to the hand and this card is sent to the GY, inflict 600 damage to your opponent. If this card is in the GY, you can add it to your hand instead of conducting a normal draw during your Draw Phase.
Edison rulings: ●Each effect of this card starts a Chain.

## Spirit Caller
[effect Flip Effect Level 3 LIGHT Spellcaster 1000/1000] formats: both
Text (Edison): FLIP: You can Special Summon 1 Level 3 or lower Normal Monster from your GY to your side of the field.
Goat text: FLIP: You can Special Summon 1 Level 3 or lower Normal Monster from your Graveyard to your side of the field.

## Spirit Elimination
[spell Normal] formats: both
Text (Edison): When monsters in the GY are removed from play, remove monsters on your side of the field from play as substitutes. This card remains active until the end of the turn that it is activated. The substitutes remain removed from play.
Goat text: When monsters in the Graveyard are removed from play, remove monsters on your side of the field from play as substitutes. This card remains active until the end of the turn that it is activated. The substitutes remain removed from play.
Edison rulings: ●During the turn that Spirit Elimination is activated; all monsters removed from play must be from your side of the field. This means that you can't activated Soul Release and remove two monsters from your side of the field and three from your GY.
●Any conditions set on the Monster Cards that would be removed from the GY must still be fulfilled on the Monsters removed from your side of the field. For example, to Special Summon Dark Necrofear you must remove 3 Fiend-Type Monsters from your side of the field.
●You can activate Spirit Elimination while Necrovalley is active.

## Spirit Force
[trap Normal] formats: edison
Text (Edison): During your opponent's turn, at damage calculation: Make the battle damage you take from this battle 0, then you can add 1 Warrior Tuner monster with 1500 or less DEF from your GY to your hand.
Edison rulings: ●You can activate “Spirit Force” to prevent damage, even if you don’t have a Warrior Tuner to return to your hand.
●“Spirit Force” does not target; you select the Warrior Tuner during resolution.

## Spirit Message A
[spell Continuous] formats: edison
Text (Edison): This card can only be placed on the field by the effect of "Destiny Board".

## Spirit Message I
[spell Continuous] formats: edison
Text (Edison): This card can only be placed on the field by the effect of "Destiny Board".

## Spirit Message L
[spell Continuous] formats: edison
Text (Edison): This card can only be placed on the field by the effect of "Destiny Board".

## Spirit Message N
[spell Continuous] formats: edison
Text (Edison): This card can only be placed on the field by the effect of "Destiny Board".

## Spirit of Flames
[effect Level 4 FIRE Pyro 1700/1000] formats: both
Text (Edison): Cannot be Normal Summoned/Set. Must first be Special Summoned (from your hand) by banishing 1 FIRE monster from your GY. This card gains 300 ATK during your Battle Phase only.
Goat text: Cannot be Normal Summoned/Set. Must first be Special Summoned (from your hand) by banishing 1 FIRE monster from your Graveyard. This card gains 300 ATK during your Battle Phase only.

## Spirit of the Breeze
[effect Level 3 WIND Fairy 0/1800] formats: both
Text (Edison): As long as this card remains in Attack Position on your side of the field, increase your LP by 1000 points during each of your Standby Phases.
Goat text: As long as this card remains in face-up Attack Position on your side of the field, increase your Life Points by 1000 points during each of your Standby Phases.

## Spirit of the Pharaoh
[effect Level 6 LIGHT Zombie 2500/2000] formats: both
Text (Edison): © Cannot be Normal Summoned/Set. 
© Must be Special Summoned by "The First Sarcophagus".
① When this card is Special Summoned: You can target up to 4 Lv2 or lower Zombie Normal Monsters in your GY; Special Summon them.
Goat text: This card cannot be Normal Summoned or Set. This card cannot be Special Summoned except by the effect of "The First Sarcophagus". When this card is Special Summoned, you can Special Summon up to 4 Level 2 or lower Zombie-Type Normal Monsters from your Graveyard.
Edison rulings: ● The only way you can Special Summon this card is via its own procedure.
Even if it was initially summoned that way, you still can't summon it with card effects.

## Spirit of the Pot of Greed
[effect Level 1 LIGHT Fairy 100/100] formats: both
Text (Edison): While this card is in Attack Position on the field, if a player activates "Pot of Greed", they can draw 1 more card.
Goat text: While this card is in face-up Attack Position on the field, if a player activates "Pot of Greed", they can draw 1 more card.
Edison rulings: ●Spirit of the Pot of Greed's effect does not chain to Pot of Greed; instead, you activate it after Pot of Greed resolves.
●Spirit of the Pot of Greed must be face-up on the field to resolve its effect; if Book of Moon is chained to Pot of Greed or to the effect of Spirit of the Pot of Greed, Spirit of the Pot of Greed's effect is negated.
●If Imperial Order negates the effect of Pot of Greed, Spirit of the Pot of Greed's effect still activates because Pot of Greed's activation was not negated.

## Spirit of the Six Samurai
[effect Effect Union Level 3 EARTH Warrior 500/500] formats: edison
Text (Edison): Once per turn, you can either: Target 1 face-up "Six Samurai" monster you control; equip this card to that target, OR: Unequip this card and Special Summon it in Attack Position. While equipped by this effect, the equipped monster gains 500 ATK and DEF. If the equipped monster destroys an opponent's monster by battle: Draw 1 card. (A monster can only be equipped with 1 Union Monster at a time. If the equipped monster would be destroyed, destroy this card instead.)
Edison rulings: These rulings apply to all Union Monsters: https://edisonformat.net/rules/compendium/union-monsters
●The effect of “Spirit of the Six Samurai” that activates when the equipped “Six Samurai” monster destroys a monster in battle begins a Chain at the time when the destroyed monster is sent to the GY.
●If a “Six Samurai” monster is equipped with “Legendary Ebon Steed” and “Spirit of the Six Samurai”, when the equipped “Six Samurai” monster would be destroyed both the “Legendary Ebon Steed” and “Spirit of the Six Samurai” are destroyed instead.
●If both Spirit of the Six Samurai and the equipped Six Samurai monster are destroyed by the same effect, the Spirit of the Six Samurai's effect is not applied.

## Spirit Ryu
[effect Level 4 WIND Dragon 1000/1000] formats: both
Text (Edison): During your Battle Step, if this card battles (Quick Effect): You can discard 1 Dragon monster to the GY; this card gains 1000 ATK/DEF until the end of the Battle Phase.

## Spiritual Energy Settle Machine
[spell Continuous] formats: both
Text (Edison): As long as this card remains face-up on the field, all Spirit monsters remain face-up on the field and don't return to their owners' hands during the End Phase even if they are Normal Summoned or flipped face-up. Discard 1 card from your hand during each of your End Phases. If you don't, destroy this card. When this card is removed from the field, all face-up Spirit monsters return to the owners' hands.
Goat text: As long as this card remains face-up on the field, all Spirit monsters remain face-up on the field and do not return to their owners' hands during the End Phase even if they are Normal Summoned or flipped face-up. Discard 1 card from your hand during each of your End Phases. If you do not, destroy this card. When this card is removed from the field, all face-up Spirit monsters return to the owners' hands.
Edison rulings: ●When this card is active, Spirit Monsters on both sides of the field don't return to their owner’s hand during the End Phase of the turn they were Summoned.
●Discarding 1 card during your End Phase is a maintenance cost and must be paid each turn. You may decide to not discard a card, and destroy this card instead.
●When this card is active, Spirit Monsters may still be returned to their owner’s hands by card effects such as Penguin Soldier and Compulsory Evacuation Device.

## Spiritual Forest
[spell Continuous] formats: edison
Text (Edison): Each turn, the first face-up Beast, Beast-Warrior, or Plant monster you control that would be destroyed by battle, is not destroyed.
Edison rulings: ●If the effect of “Spiritual Forest” is resolved once during a turn, it can't be resolved again even if “Spiritual Forest” is negated and then stops being negated in the same turn.
●If a face-down Beast-Type, Beast-Warrior-Type, or Plant-Type monster you control is attacked and flipped face-up by battle, the effect of “Spiritual Forest” is applied.
●You don't choose when to activate this effect.
●It automatically activates the first time the appropriate type of monster would be destroyed.

## Super Conductor Tyranno
[effect Level 8 LIGHT Dinosaur 3300/1400] formats: edison
Text (Edison): Once per turn: You can Tribute 1 monster; inflict 1000 damage to your opponent. This card can't declare an attack the turn this effect is activated.

## Super Double Summon
[spell Quick-Play] formats: edison
Text (Edison): Select 1 Gemini monster you control and Normal Summon it. During the End Phase of this turn, return it to your hand.
Edison rulings: ●The effect of returning the Gemini Monster to its owner’s hand during the End Phase does not begin a Chain.
●If the Gemini Monster Normal Summoned by “Super Double Summon” is flipped face-down or removed from the field, the effect to return it to its owner’s hand during the End Phase is not applied.
●You can activate “Super Double Summon” and select a Gemini Monster that is having its effect negated by “Skill Drain”. The Gemini Monster will be treated as having been Normal Summoned while face-up on the field, but the effects it gains will be negated by “Skill Drain”. If “Skill Drain” is negated or removed from the field later in the turn, the selected Gemini Monster’s effects will be active and can be used.

## Super Junior Confrontation
[trap Normal] formats: edison
Text (Edison): Activate only when an opponent's monster declares an attack. Negate the battle, and 1 monster with the lowest ATK in Attack Position your opponent controls battles against 1 monster with the lowest DEF in face-up Defense Position you control. After that battle, end the Battle Phase.
Edison rulings: ●“Super Junior Confrontation” does not target.
●If you don't control a face-up Defense Position monster, you can't activate “Super Junior Confrontation”.
●If “Super Junior Confrontation” is activated and there is a tie for lowest ATK among the opponent’s monsters, the player who activated the card gets to choose which monster attacks.
●When the battle for “Super Junior Confrontation” resolves, the Battle Phase ends immediately. There is no opportunity to activate additional cards.
●“Super Junior Confrontation” does not change any monsters’ battle positions.

## Super Robolady
[fusion Fusion Level 6 EARTH Machine 1200/500] formats: both
Text (Edison): "Robolady" + "Roboyarou"
You can Special Summon "Super Roboyarou" by returning this card from the field to the Extra Deck. You can't use this effect during the same turn this monster is Special Summoned. In addition, increase the ATK of this monster by 1000 points during the Damage Step when this monster inflicts Direct Damage to your opponent's LP.
Goat text: "Robolady" + "Roboyarou"
You can Special Summon "Super Roboyarou" by returning this card from the field to the Extra Deck. You cannot use this effect during the same turn this monster is Special Summoned. In addition, increase the ATK of this monster by 1000 points during the Damage Step when this monster inflicts Direct Damage to your opponent's Life Points.
Edison rulings: ●The effect of this card to Special Summon Super Roboyarou is Spell Speed 1 and can only be activated during your Main Phase 1 or 2.
●A Super Roboyarou Special Summoned by this card’s effect is not considered properly Summoned. So if it is destroyed, you can't target it with Monster Reborn.

## Super Roboyarou
[fusion Fusion Level 6 EARTH Machine 1200/500] formats: both
Text (Edison): "Roboyarou" + "Robolady"
You can Special Summon "Super Robolady" by returning this card from the field to the Extra Deck. You can't use this effect during the same turn this monster is Special Summoned. In addition, increase the ATK of this monster by 1000 points during the Damage Step when this monster battles with a monster.
Goat text: "Roboyarou" + "Robolady"
You can Special Summon "Super Robolady" by returning this card from the field to the Extra Deck. You cannot use this effect during the same turn this monster is Special Summoned. In addition, increase the ATK of this monster by 1000 points during the Damage Step when this monster battles with a monster.
Edison rulings: ●The effect of this card to Special Summon Super Robolady is Spell Speed 1 and can only be activated during your Main Phase 1 or 2.
●A Super Robolady Special Summoned by this card’s effect is not considered properly Summoned. So if it is destroyed, you can't target it with Monster Reborn.

## Super Solar Nutrient
[spell Continuous] formats: edison
Text (Edison): ① Activate this card (from your hand) by Tributing 1 Level 2 or lower Plant monster; Special Summon 1 Plant monster from your hand/Deck, whose Level is less than or equal to the Level the Tributed monster had on the field +3. 
② When this card leaves the field, destroy that monster.
③ When that monster leaves the field, destroy this card.
Edison rulings: The ①:
● Tributing a Plant monster is a cost, which must be paid in order to activate this card from your hand.
●This card can only ever summon 1 monster, similar to "Call of the Haunted".

The ② and ③: 
● This card continuously targets the card it summoned, similar to "Call of the Haunted"

## Super Vehicroid Jumbo Drill
[fusion Fusion Level 8 EARTH Machine 3000/2000] formats: edison
Text (Edison): "Steamroid" + "Drillroid" + "Submarineroid"
A Fusion Summon of this card can only be conducted with the above Fusion Material Monsters. During battle between this attacking card and a Defense Position monster whose DEF is lower than the ATK of this card, inflict the difference as Battle Damage to your opponent.

## Super War-Lion
[ritual Ritual Level 7 EARTH Beast 2300/2100] formats: edison
Text (Edison): You can Ritual Summon this card with "War-Lion Ritual".

## Super-Ancient Dinobeast
[effect Level 8 EARTH Dinosaur 2700/1400] formats: edison
Text (Edison): You can Tribute Summon this card in Attack Position by Tributing 1 Dinosaur monster. When a Dinosaur monster(s) is Special Summoned from your GY while this monster is on the field (except during the Damage Step): You can draw 1 card.

## Super-Electromagnetic Voltech Dragon
[effect Level 5 LIGHT Thunder 2400/1000] formats: edison
Text (Edison): If you Tribute Summon this card by Tributing 1 of the following monsters, it gains the appropriate effect:
● Batteryman D: Negate the effect of a Spell or Trap Card that targets this 1 card.
● Batteryman C: During battle between this attacking card and a Defense Position monster whose DEF is lower than the ATK of this card, inflict the difference as Battle Damage to your opponent.
● Batteryman AA: This card gains 1000 ATK.
Edison rulings: ●If you Tribute Summon this card by Tributing a “Batteryman” monster, this card’s Trigger Effect can be chained to. After the Trigger Effect resolves, “Voltech Dragon” then has the appropriate effect applied to it. So if you Tributed “Batteryman D”, the opponent may activate “Trap Hole” as a chain to the effect of “Voltech Dragon” and destroy “Voltech Dragon” before it can negate the effects of Spell & Trap Cards that target it. (In other words, by chaining to the effect that would give “Voltech Dragon” immunity, you can destroy it before it becomes immune.)
●You can activate “Divine Wrath” when this card is Tribute Summoned if a “Batteryman” monster was Tributed.

## Sword Hunter
[effect Level 7 EARTH Warrior 2450/1700] formats: both
Text (Edison): At the end of the Battle Phase, if this card destroyed a monster(s) by battle and sent it to the GY this Battle Phase: Equip all those monsters from the GY to this card as an Equip Spell Card(s) with this effect.
● The equipped monster gains 200 ATK.
Goat text: At the end of the Battle Phase, if this card destroyed a monster(s) by battle and sent it to the Graveyard this Battle Phase: Equip all those monsters from the Graveyard to this card as an Equip Spell Card(s) with this effect.
● The equipped monster gains 200 ATK.
Edison rulings: ●If you take control of your opponent's Sword Hunter and destroy a monster by battle, the monster is placed into your Spell and Trap Card Zone and remains there when control of Sword Hunter is returned to your opponent.
●While Imperial Order is active, you don't gain ATK for the Monster Cards equipped to Sword Hunter.
●If the monster destroyed by battle with Sword Hunter is Special Summoned from the GY before the end of the Battle Phase, it is not equipped to Sword Hunter.

## Sword Master
[effect Effect Tuner Level 3 EARTH Warrior 1200/0 Tuner] formats: edison
Text (Edison): If a Warrior monster you control attacks your opponent's monster, and the opponent's monster is not destroyed by battle, at the end of the Damage Step you can Special Summon this card from your hand. During battle between this attacking card and a Defense Position monster whose DEF is lower than the ATK of this card, inflict the difference as Battle Damage to your opponent.
Edison rulings: ●This effect activates if your opponent’s monster is not destroyed during damage calculation.
●The attacking monster must be Warrior-Type the entire time from attack declaration until the end of the Damage Step in order to Special Summon “Sword Master.”
●If your opponent’s monster is destroyed by a card effect while your Warrior-Type monster is attacking, it is still not destroyed by battle, so you can Special Summon “Sword Master.”

## Sword of Dark Destruction
[spell Equip] formats: both
Text (Edison): Equip only to a DARK monster. It gains 400 ATK and loses 200 DEF.

## Sword of Dark Rites
[spell Equip] formats: edison
Text (Edison): Equip only to a DARK monster. It gains 400 ATK. When the equipped monster is Tributed and this card is sent to the GY, return this card to your hand.
Edison rulings: ●This card's effect to return itself to the hand starts a Chain.

## Sword of Deep-Seated
[spell Equip] formats: both
Text (Edison): The equipped monster gains 500 ATK/DEF. If this card is sent to your GY: Place it on top of your Deck.
Edison rulings: ●Sword of Deep-Seated's second effect is a Trigger Effect.
●If your Sangan equipped with your Sword of Deep-Seated is sent to the GY, the effect of Sangan and Sword of Deep-Seated form a Chain. You decide their order on the Chain.
●If Sword of Deep-Seated is sent to the GY while resolving Reasoning, its effect starts a new Chain after you finish resolving Reasoning.

## Sword of Dragon's Soul
[spell Equip] formats: both
Text (Edison): Equip only to a Warrior monster. It gains 700 ATK. After damage calculation, if the equipped monster battled a Dragon monster: Destroy that monster at the end of that Battle Phase.

## Sword of Kusanagi
[spell Equip] formats: edison
Text (Edison): Equip only to a Spirit monster. During battle, when it attacks a Defense Position monster whose DEF is lower than the ATK of the equipped monster, inflict the difference as Battle Damage to your opponent. When the equipped monster you control is returned to the hand and this card is sent to the GY, return this card to your hand.
Edison rulings: ●Sword of Kusanagi's second effect activates in the GY.
●If you control your opponent's Spirit Monster and you equip it with Sword of Kusanagi, when the Spirit Monster is returned to your opponent's hand and Sword of Kusanagi is destroyed, its second effect activates.
●If you add your opponent's Sword of Kusanagi to your hand with Exchange and equip it to a Spirit Monster you control, when the Spirit Monster is returned to its owner's hand and Sword of Kusanagi is destroyed, Sword of Kusanagi's effect does not activate.

## Sword of Sparkles
[spell Equip] formats: edison
Text (Edison): Equip only to an "X-Saber" monster. If it destroys an opponent's monster by battle, you can destroy 1 card your opponent controls. You can Tribute 1 monster you control to return this card from your GY to the top of your Deck.
Edison rulings: ●Tributing 1 monster is a cost to activate the effect to return “Sword of Sparkles” to your Deck. If “Sword of Sparkles” is equipped to a monster that is unaffected by Spells, the effect to destroy 1 card your opponent controls still applies. Both effects of this card start a Chain.

## Sword of the Soul-Eater
[spell Equip] formats: both
Text (Edison): You can only equip this card to a Level 3 or lower Normal Monster on your side of the field. When you activate this card, Tribute all Normal Monsters (except Tokens) on your side of the field, except the equipped monster. Increase the ATK of the equipped monster by 1000 points for each Normal Monster that you Tributed.
Edison rulings: ●You can activate Sword of the Soul-Eater even if the monster you're equipping it to is the only monster on the field.
