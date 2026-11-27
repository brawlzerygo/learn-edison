# Full pool batch 26: 60 cards. Write js/cards/full-26.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Physical Double
[trap Normal] formats: both
Text (Edison): During your opponent's turn: Target 1 face-up monster your opponent controls; Special Summon 1 "Mirage Token" with the same Level, Type, Attribute, ATK, and DEF as that target. Destroy this Token during the End Phase.
Edison rulings: ●You can't activate Physical Double during the Damage Step.
●If you activate Physical Double and your opponent chains Ring of Destruction to destroy his targeted monster, the effect of Physical Double disappears.
●You can target a Monster Token with Physical Double to create a Mirage Token copy of it.
●When the targeted monster's Level, Attribute, etc. are changed after Physical Double resolves, the stats of the Mirage Token are not changed. When the targeted monster's Level, Attribute, etc., are changed before Physical Double resolves, the changed stats are adopted by the Mirage Token.
●If a Field Spell Card was active before resolution of Physical Double that applied to the targeted monster, it applies to the original monster and to the Mirage Token. So if a Field Spell Card was increasing ATK by +500, the original would get +500 ATK and the Mirage Token would get an additional +500 ATK, for a +1000 ATK bonus total for the Mirage Token over the printed ATK of the original monster. Likewise, when A Legendary Ocean is active, and you activate Physical Double targeting a WATER monster, the Mirage Token's Level Stars are 2 fewer than the printed Level Stars of the original targeted monster.

## Pikeru's Circle of Enchantment
[trap Normal] formats: both
Text (Edison): Damage to you from card effects becomes 0 until the end of this turn.
Edison rulings: ●This effect lasts until the end of the End Phase.

## Pikeru's Second Sight
[trap Normal] formats: both
Text (Edison): Until your opponent's second End Phase, your opponent shows you all cards that they draw before adding them to their hand.
Edison rulings: ●This card’s effect lasts until the end of your opponent’s second End Phase after this card was activated.
●The opponent shows you all drawn cards, even if they are drawn by a card effect.

## Pinch Hopper
[effect Level 4 EARTH Insect 1000/1200] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When this card you control is sent to your GY: You can Special Summon 1 Insect monster from your hand.
Edison rulings: ●Missing the Timing: Because the effect of Pinch Hopper effect is an optional “when… you can” Trigger Effect, Pinch Hopper being sent to the GY has to be the very last thing that happened in order for you to activate its effect. So if you Tribute Pinch Hopper for a Tribute Summon, you can't activate the effect of “Pinch Hopper” because the last thing to happen will be the Summoning of the Tribute monster. Also, if you Tribute “Pinch Hopper” for “Cannon Soldier”, the very last thing that happened will be the 500 points of damage inflicted to your opponent, so the effect of “Pinch Hopper” won't activate.
●If you offer Pinch Hopper as a Tribute to attack with Insect Queen, you can resolve Pinch Hopper's effect after attack declaration.
●When your opponent controls your Pinch Hopper and Pinch Hopper is sent to the GY, Pinch Hopper's effect does not activate.

## Pineapple Blast
[trap Normal] formats: both
Text (Edison): When you Normal Summon a monster, if your opponent controls more monsters than you do: Destroy your opponent's monsters so that your opponent controls the same number of monsters as you (your opponent chooses which of their monsters are destroyed).
Edison rulings: ●When Ring of Destruction or Call of the Haunted is chained to Pineapple Blast, and the number of monsters on the field is changed, count the number of monsters at resolution of Pineapple Blast's effect, not at activation.
●If, when Pineapple Blast resolves, you have no monsters, all of your opponent's monsters are destroyed too.
●If you Summon a monster and want to activate Pineapple Blast, and your opponent wants to use Trap Hole, Pineapple Blast is Step 1 of the chain and Trap Hole is Step 2.

## Piranha Army
[effect Level 2 WATER Fish 800/200] formats: both
Text (Edison): The Battle Damage this card inflicts by attacking your opponent's LP directly is doubled.
Goat text: The Battle Damage this card inflicts by attacking your opponent's Life Points directly is doubled.
Edison rulings: ●The Battle Damage doubled by Piranha Army's effect is still considered Battle Damage (not effect damage).

## Pixie Knight
[effect Level 2 LIGHT Spellcaster 1300/200] formats: both
Text (Edison): When this card is sent to the GY as a result of battle, your opponent selects 1 Spell Card from your GY, and places that card on the top of your Deck.
Goat text: When this card is sent to the Graveyard as a result of battle, your opponent selects 1 Spell Card from your Graveyard, and places that card on the top of your Deck.

## Polymerization
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Fusion Summon 1 Fusion Monster from your Extra Deck, using monsters from your hand or field as Fusion Material.

## Possessed Dark Soul
[effect Level 3 DARK Fiend 1200/800] formats: both
Text (Edison): You can Tribute this face-up card; take control of all face-up Level 3 or lower monsters your opponent currently controls.
Edison rulings: ●If the opponent has more Level 3 or lower monsters on the field than you have empty Monster Card Zones, you may still activate this effect. You choose which monsters to gain control of and the rest are destroyed. If you choose to destroy "Griggle" or "Ameba" in this manner, their effects don't activate since they never came to your side of the field.
●You can't gain control of face-down monsters with this card’s effect, so the opponent may chain Book of Moon targeting a Level 3 or lower monster and they will keep control of it.
●You maintain control of the monsters indefinetely, even if they are flipped face-down or temporarily banished.

## Precious Cards from Beyond
[spell Continuous] formats: both
Text (Edison): When you Tribute Summon a monster using 2 or more Tributes: Draw 2 cards.
Edison rulings: ●You can't use your Precious Cards from Beyond when your opponent offers 2 monsters as a Tribute, only when you do.
●Precious Cards from Beyond is only for a Tribute Summon or Set, not for a Ritual Summon or Special Summon like Lava Golem.
●If you Tribute Summon Blue-Eyes White Dragon for 1 Tribute using Cost Down, you can't activate Precious Cards from Beyond's effect.
●If you have multiple Precious Cards from Beyond, you can activate each of their effects when you Tribute Summon or Set with 2 or more Tributes.
●If you Tribute Summon or Set with 2 monsters, and 1 of them was your opponent's monster that you used with Change of Heart or Soul Exchange, you can activate Precious Cards from Beyond.

## Premature Burial
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Activate this card by paying 800 LP, then target 1 monster in your GY; Special Summon that target in Attack Position and equip it with this card. When this card is destroyed, destroy the equipped monster.
Goat text: Activate this card by paying 800 LP, then target 1 monster in your Graveyard; Special Summon that target in Attack Position and equip it with this card. When this card is destroyed, destroy the equipped monster.
Edison rulings: ●You can't activate Tailor of the Fickle selecting Premature Burial as a target.
●You can't activate Fairy’s Hand Mirror to make your opponent chose a different monster when they activate Premature Burial.
●If you activate this card and your opponent chains Imperial Order the effect of Premature Burial is negated and the Special Summon never occurs, but you still pay 800 Life Points. If Imperial Order is activated after Premature Burial is already on the field, the equipped monster is NOT destroyed and Premature Burial remains on the field meaninglessly. If Premature Burial is then destroyed while Imperial Order is still active, the monster remains on the field, but if the monster is destroyed, Premature Burial is also destroyed, since it is still equipped to that monster.
●If the equipped monster is flipped face-down Premature Burial is destroyed but the monster is not destroyed.

## Prickle Fairy
[effect Level 4 EARTH Plant 300/2000] formats: both
Text (Edison): Your opponent can't attack Insect monsters. If this card battled a monster, at the end of the Damage Step: Change that monster to Defense Position.
Goat text: Your opponent cannot attack Insect monsters. If this card battled a monster, at the end of the Damage Step: Change that monster to Defense Position.
Edison rulings: ●If Prickle Fairy is changed to an Insect-Type monster with DNA Surgery, your opponent can't attack.

## Primal Seed
[spell Normal] formats: both
Text (Edison): If "Black Luster Soldier - Envoy of the Beginning" or "Chaos Emperor Dragon - Envoy of the End" is on the field: Target 2 of your banished cards; add both those targets to your hand.
Edison rulings: ●Primal Seed can add cards to your hand that were removed from play face-up (Dimensionhole) or face-down (Different Dimension Capsule).
●You target the 2 removed cards when you activate Primal Seed.
●If you don't have 2 or more cards removed from play, you can't activate Primal Seed.
●A Fusion Monster or Synrho Monster selected with Primal Seed returns to the Extra Deck.
●The required card only needs to be face-up on the field. It does not need to be a Monster Card, so if “Black Luster Soldier – Envoy of the Beginning” is equipped to “Relinquished”, you can activate “Primal Seed”.

## Protector of the Sanctuary
[effect Level 4 EARTH Fiend 1100/1900] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Your opponent can't draw cards except during Draw Phases.
Goat text: Your opponent cannot draw cards except during Draw Phases.
Rulings: 1. Your opponent cannot draw with "Airknight Parshath" while you control "Protector of the Sanctuary".
2. Most cards that would cause the opponent to draw outside of the Draw Phase, such as "Card Destruction", cannot be activated, even by the controller of "Protector of the Sanctuary". However, effects that are forcibly activated, like "Morphing Jar", can be activated (but results may vary; see below).
3. If "Protector of the Sanctuary" is on the field, then Flip Effects like "Morphing Jar" will still activate because they must activate when the monster is flipped (whether it was Flip Summoned, flipped by an attack, or flipped by "Book of Taiyou", etc.).
4. If the effect of "Morphing Jar" activates, then both players discard their hands, but if you control "Protector of the Sanctuary", your opponent does not draw a new hand.
5. You cannot activate cards if they make your opponent draw, such as "Dragged Down Into the Grave", "Card Destruction", or "Disturbance Strategy".
6. "Protector of the Sanctuary" prevents your opponent from drawing with "Mirage of Nightmare". However, your opponent can still activate "Mirage of Nightmare", "Appropriate", etc., even though he cannot use their e

## Pumpking the King of Ghosts
[effect Level 6 DARK Zombie 1800/2000] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If "Castle of Dark Illusions" is face-up on the field, increase the ATK and DEF of this card by 100 points. As long as this "Castle of Dark Illusions" remains face-up on the field, the ATK and DEF of this card continues to increase by 100 points during each of your Standby Phases. This effect continues until your 4th turn after the card is activated.
Goat text: Gains 100 ATK/DEF while "Castle of Dark Illusions" is on the field. Also, during your Standby Phase, if "Castle of Dark Illusions" is on the field: This card gains 100 ATK/DEF. This effect activates once per turn, for four of your Standby Phases (counting this as the first). "Castle of Dark Illusions" must be on the field to activate and to resolve this effect. If "Castle of Dark Illusions" is not on the field, this ATK/DEF gain disappears and this effect resets.

## Punished Eagle
[fusion Fusion Level 6 WIND Winged Beast 2100/1800] formats: both (Goat already has a goat-only script in js/cards/classic-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Blue-Winged Crown" + "Niwatori"

## Pyramid Energy
[spell Quick-Play] formats: both
Text (Edison): You can select and activate 1 of the following effects:
● Increase the ATK of all face-up monsters on your side of the field by 200 points until the End Phase of the turn this card is activated.
● Increase the DEF of all face-up monsters on your side of the field by 500 points until the End Phase of the turn this card is activated.
Edison rulings: ●You can activate Pyramid Energy during the Damage Step.
●The effect of Pyramid Energy is not applied to monsters summoned after Pyramid Energy’s resolution.

## Pyramid of Light
[trap Continuous] formats: both
Text (Edison): If this face-up card is removed from your side of the field, destroy "Andro Sphinx" and "Sphinx Teleia" on your side of the field and remove them from play.

## Pyro Clock of Destiny
[trap Normal] formats: both
Text (Edison): Move the turn count forward by 1 turn. The turn in which this card is activated continues as normal.
Edison rulings: ●You can use Pyro Clock of Destiny to advance the turn count by 1 for these cards: “Deck Devastation Virus”, Swords of Revealing Light, Lightforce Sword, or Final Countdown.

## Queen's Double
[effect Level 1 EARTH Warrior 350/300] formats: both
Text (Edison): This monster may attack your opponent's LP directly.
Goat text: This monster may attack your opponent's Life Points directly.

## Question
[spell Normal] formats: both
Text (Edison): When activating this card, your opponent can't check cards in the GY. Your opponent calls the name of the first monster found at the bottom of your GY. If he/she calls it right, the monster is removed from play. If he/she calls it wrong, the monster is Special Summoned to your side of the field.
Goat text: When activating this card, your opponent cannot check cards in the Graveyard. Your opponent calls the name of the first monster found at the bottom of your Graveyard. If he/she calls it right, the monster is removed from play. If he/she calls it wrong, the monster is Special Summoned to your side of the field.
Edison rulings: ●Remember that you can't shuffle your GY or change the order of cards in your GY at any time.
●If a monster is named with Question that could not be Special Summoned, Question’s effect disappears and the monster is neither Special Summoned nor removed from play. So the effect of Question disappears if the bottom monster is incorrectly named and is Helpoemer, Dark Ruler Ha Des, etc.
●If you would Special Summon Tyrant Dragon from the GY using Question, you must Tribute 1 Dragon and if you can't you can't Special Summon Tyrant Dragon and the effect of Question disappears.

## Rabid Horseman
[fusion Fusion Level 6 EARTH Beast-Warrior 2000/1700] formats: both (Goat already has a goat-only script in js/cards/classic-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Battle Ox" + "Mystic Horseman"

## Rafflesia Seduction
[effect Flip Effect Level 2 EARTH Plant 300/900] formats: both
Text (Edison): FLIP: Take control of 1 face-up monster on your opponent's side of the field until the end of this turn.

## Raigeki
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Destroy all monsters your opponent controls.
Edison rulings: ●If there are no monsters on your opponent’s side of the field you may not activate Raigeki.

## Raimei
[spell Normal] formats: both
Text (Edison): Decrease your opponent's LP by 300 points.
Goat text: Decrease your opponent's Life Points by 300 points.

## Rain of Mercy
[spell Normal] formats: both
Text (Edison): Increases the LP of both players by 1000 points.
Goat text: Increases the Life Points of both players by 1000 points.

## Raise Body Heat
[spell Equip] formats: both
Text (Edison): Equip only to a Dinosaur monster. It gains 300 ATK/DEF.

## Rare Metal Dragon
[effect Level 4 DARK Dragon 2400/1200] formats: both
Text (Edison): This card Cannot be Normal Summoned or Set.
Goat text: This card cannot be Normal Summoned or Set.

## Rare Metalmorph
[trap Continuous] formats: both
Text (Edison): Activate this card by targeting 1 Machine monster on the field; it gains 500 ATK. Once, negate a Spell effect that targets that monster. When that monster leaves the field, destroy this card.
Goat text: Activate this card by targeting 1 Machine-Type monster on the field; it gains 500 ATK. Once, negate a Spell effect that targets that monster. When that monster leaves the field, destroy this card.
Edison rulings: ●The Continuous Effect applies on the field.
●This effect (continuously) targets a face-up Machine-Type monster anywhere on the field.
●If the target is flipped face-down / leaves the field, this card remains face-up meaninglessly.
●If the Machine-Type monster is targeted by either player's Spell Card, that effect is negated when it resolves. A Continuous / Lingering Effect that targets a Machine-Type is permanently negated.
●If you chain Rare Metalmorph to Ekibyo Drakmord that targets a Machine-Type monster, Ekibyo Drakmord is equipped but its effect is negated while Rare Metalmorph is active.
●You can activate this card during the Damage Step.
●The Continuous Effect applies on the field. This does not start a Chain.
●This effect applies if the target is destroyed / removed from play / returned to the hand/Deck.
●This effect can be negated by Royal Decree.

## Raregold Armor
[spell Equip] formats: both
Text (Edison): As long as you control the monster equipped with this card, your opponent can't attack other monsters other than the equipped monster.
Goat text: As long as you control the monster equipped with this card, your opponent cannot attack other monsters other than the equipped monster.
Edison rulings: ●Raregold Armor & Metalsilver Armor only apply their effects when the same player controls the Equip Spell Card and the monster it is equipped to; you can equip these cards to a monster controlled by your opponent but the effect is not active.
●If you have 2 monsters equipped with Raregold Armor, then your opponent can't attack.
●If you have a Warrior-Type monster equipped with Raregold Armor, and Marauding Captain, your opponent can't attack.
●You have an Amazoness equipped with Raregold Armor, and Amazoness Tiger, your opponent can't attack.
●Ring of Magnetism 'trumps' Raregold Armor, Amazoness Tiger, and Marauding Captain. So if you have a monster equipped with Ring of Magnetism, and a monster equipped with Raregold Armor, the monster equipped with Ring of Magnetism is the target of attacks.
●If you control Patrician of Darkness and have a monster equipped with Raregold Armor, you can only re-direct attacks to the monster equipped with Raregold Armor as it is the only legal target.

## Ray of Hope
[trap Normal] formats: both
Text (Edison): Add 2 LIGHT monsters from your GY to your Deck and shuffle it.
Goat text: Add 2 LIGHT monsters from your Graveyard to your Deck and shuffle it.
Edison rulings: ●You can't activate Ray of Hope if you don't have 2 LIGHT monsters in your GY.

## Re-Fusion
[spell Equip] formats: both
Text (Edison): Activate this card by paying 800 LP, then target 1 Fusion Monster in your GY; Special Summon it and equip it with this card. When this card is destroyed, banish the equipped monster.
Edison rulings: ●You can't use “Re-Fusion” to Special Summon a Fusion Monster that was Summoned with “Magical Scientist”, or otherwise not properly Fusion Summoned.
●You can chain to the first part of this card’s effect. However, the last part (that destroys the monster) does not start a chain.

## Ready for Intercepting
[trap Normal] formats: both
Text (Edison): Target 1 Warrior or Spellcaster monster on the field; change that target to face-down Defense Position.
Edison rulings: ●If you activate Ready for Intercepting after your opponent’s attack declaration to flip face-down the monster which is being attacked, a replay does not occur. Complete the attack as normal. (This must happen during the Battle Step, not the Damage Step.)
●If you activate Ready for Intercepting and target the attacking monster, it is flipped into face-down Defense Position and the attack ends. (This must happen during the Battle Step, not the Damage Step.)
●While the effect of Light of Intervention is active, you can't activate Ready for Intercepting.
●If you chain Ready for Intercepting to Hammer Shot to flip a monster face-down, that monster won't be included in determining which monster is destroyed by the effect of Hammer Shot.

## Really Eternal Rest
[trap Normal] formats: both
Text (Edison): Destroy all monsters equipped with an Equip Card(s).

## Reaper of the Cards
[effect Flip Effect Level 5 DARK Fiend 1380/1930] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): FLIP: Select 1 Trap Card on the field and destroy it. If the selected card is Set, pick up and see the card. If it is a Trap Card, it is destroyed. If it is a Spell Card, return it to its original position.
Edison rulings: ●This card can destroy a Trap Card on either side of the field. So if your opponent has no Trap Cards and no Set Spell or Trap Cards, you must destroy a card on your side of the field. If it is face-down Spell Card you must reveal it to your opponent, and it is not destroyed.

## Reasoning
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① Your opponent declares a number from 1 to 12, 
then you reveal cards from the top of your Deck until you reveal a monster that can be Normal Summoned/Set, 
then, if its Level isn't the declared number, send all revealed cards to the GY, 
else Special Summon it, also send the remaining cards to the GY.
Edison rulings: ● You can't activate this card if you have no monsters that can be Normal Summoned/Set in your Deck.
● You can't activate this card while "Vanity's Fiend" is applying.
● If you reveal a card that can't be Summoned because EG "Power Filter" is applying, send all cards to the GY.

## Reckless Greed
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Draw 2 cards and skip your next 2 Draw Phases.
Edison rulings: ●If Reckless Greed is activated, causing you to skip your next 2 Draw phases, and you also must skip your Draw Phase due to another effect such as Offerings to the Doomed, the skipped Phases don't accumulate. So if you activate Reckless Greed and Offerings to the Doomed, you only skip 2 Draw Phases.
●Skipping a Draw Phase is an effect, not a cost, so if Reckless Greed is negated you don't skip your Draw Phases.

## Recycle
[spell Continuous] formats: both
Text (Edison): During your Standby Phase, by paying 300 LP, select 1 non-Monster Card in your GY and return it to the bottom of your Deck.
Goat text: During your Standby Phase, by paying 300 Life Points, select 1 non-Monster Card in your Graveyard and return it to the bottom of your Deck.
Edison rulings: ●If you meet the condition enough times, you can activate Recycle as many times as you want in the same Standby Phase.
●You can't activate Recycle if you have no non-Monster Cards in your GY.

## Reflect Bounder
[effect Level 4 LIGHT Machine 1700/1000] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Before damage calculation, if this card is being attacked by an opponent's monster, and was in Attack Position at the start of the Damage Step: Inflict damage to your opponent equal to the attacking monster's ATK. If you do, after damage calculation: Destroy this card.
Goat text: Before damage calculation, if this card is being attacked by an opponent's monster, and was in face-up Attack Position at the start of the Damage Step: Inflict damage to your opponent equal to the attacking monster's ATK. If you do, after damage calculation: Destroy this card.
Edison rulings: ●Reflect Bounder inflicts its effect damage, then damage calculation is applied normally, then Reflect Bounder is destroyed by its own effect.
●When an Attack Position Reflect Bounder is attacked, it is destroyed by its own effect even if the ATK of Reflect Bounder is lower than the ATK of the attacking monster.
●The damage inflicted by Reflect Bounder's effect is not Battle Damage, so it can't be reduced to 0 with Waboku.
●Effects such as Metalmorph and Injection Fairy Lily happen after Reflect Bounder's effect, because Reflect Bounder's effect happens before damage calculation.
●When your opponent attacks your Attack Position Reflect Bounder, your opponent can use Barrel Behind the Door against Reflect Bounder's effect.
●When your opponent's White Magical Hat with Axe of Despair attacks your Reflect Bounder, Reflect Bounder inflicts its effect damage, damage calculation is performed, and White Magical Hat's effect is activated.
●When Reflect Bounder is attacked by Dark Ruler Ha Des, Reflect Bounder inflicts its effect damage, damage calculation is applied, Reflect Bounder is determined to be destroyed as a result of battle, Dark Ruler Ha Des negates Reflect Bounder's effect, and Reflect Bounder does not destroy itself with its own effect, however it was still destroyed as a result of battle.
●Reflect Bounder's effect does not target.
●If Reflect Bounder is attacked by D. D. Warrior Lady, and the effect of Reflect Bounder is activated, Reflect Bounder inflicts damage, damage

## Regenerating Mummy
[effect Level 4 DARK Zombie 1800/1500] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① If this card is sent from your hand to your GY by an opponent's card effect: Return this card to the hand.
Goat text: When this card is sent from your hand to your Graveyard by an opponent's card effect: Return this card to the hand.
Edison rulings: ● Regenerating Mummy's effect will activate when sent to the GY by the effect of Morphing Jar or Card Destruction.
●Regenerating Mummy's effect will activate during the Damage Step because of Spirit Reaper or Don Zaloog.
●Regenerating Mummy's effect will activate when destroyed and sent to the GY because of Chain Destruction.

## Reinforcements
[trap Normal] formats: both
Text (Edison): Target 1 face-up monster on the field; it gains 500 ATK until the end of this turn.
Edison rulings: ●You choose the monster to receive the ATK increase when you activate this card. This card targets.
●If you activate two Reinforcements on the same monster, its ATK increases by 1000.

## Reload
[spell Quick-Play] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Add all cards in your hand to your Deck and shuffle it. Then draw the same number of cards that you added to your Deck.
Edison rulings: ●If you have your opponent's card in your hand and activate Reload, your opponent's card is shuffled to his/her Deck.
●Your opponent can activate Appropriate in response to your drawing with Reload's effect.

## Remove Brainwashing
[trap Continuous] formats: both
Text (Edison): The control of all monsters on the field returns to the owners.
Edison rulings: As long as this card remains face-up on the field, the control of all monsters on the field returns to the original owners.
●The Continuous Effect does not activate.
●Monsters like Lava Golem return to their owner's side of the field.
●Monsters revived with Autonomous Action Unit return to their owner's side of the field.
●Monsters taken with Exchange and played normally return to their owner's side of the field.
●If a player already has 5 monsters on the field, the returning monsters are destroyed. If multiple monsters are return to their owner while there aren't enough open monster card zones, the player who controlled the monsters chooses which are destroyed and which return.
●The effect DOES NOT:
●affect Monster Cards treated as Equip Spell Cards (ex: Union Monsters, Armory Arm, etc.).
●affect Blindly Loyal Goblin which is under your opponent's control.
●prevent activation of cards / effects that change control of a monster (ex: Creature Swap).
●Control is changed but then control goes back to the original owners. This means that if you give control of Griggle or Ameba to your opponent, their effect IS activated even though Griggle/Ameba then returns to the original owner's control afterwards.
●cause control to revert if Remove Brainwashing is destroyed. (ex: Remove Brainwashing is destroyed after Mind Control has resolved. Control does NOT revert control of the monster to the player who activated Mind Control).
●VS. Black Garden: Player A Normal Summoned a monster, causi

## Remove Trap
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Select 1 face-up Trap Card on the field and destroy it.

## Reshef the Dark Being
[ritual Ritual Level 8 LIGHT Fiend 2500/1500] formats: both
Text (Edison): This card can only be Ritual Summoned with the Ritual Spell Card, "Final Ritual of the Ancients". Once per turn, by discarding 1 Spell Card from your hand, take control of 1 monster on your opponent's side of the field until the end of this turn.
Edison rulings: ●The effect of “Reshef the Dark Being” is an Ignition Effect. Discarding is a cost for activation of this effect.
●If the monster that you take control of with “Reshef the Dark Being” is flipped face-down, it still returns to the opponent during the End Phase.

## Respect Play
[trap Continuous] formats: both
Text (Edison): During their respective turns, each player must show their opponent their hand.

## Restructer Revolution
[spell Normal] formats: both
Text (Edison): Inflict 200 points of damage to your opponent's LP for each card in your opponent's hand.
Goat text: Inflict 200 points of damage to your opponent's Life Points for each card in your opponent's hand.

## Reversal Quiz
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Send all cards in your hand and on your side of the field to the GY. Call the type of card (Spell, Trap, or Monster) on top of your Deck. If you call it right, exchange your current LP with your opponent's current ones.
Goat text: Send all cards in your hand and on your side of the field to the Graveyard. Call the type of card (Spell, Trap, or Monster) on top of your Deck. If you call it right, exchange your current Life Points with your opponent's current ones.
Edison rulings: ●Sending all cards in the hand and on the field to the GY is a cost. If there are no cards in your hand or on the field you can't activate this card. You must have a card either in your hand or on the field to activate this card.

## Reverse Trap
[trap Normal] formats: both
Text (Edison): Until the End Phase, all effects that add or subtract ATK or DEF are reversed. (Additions now subtract, and subtractions now add, instead. Multiplications and divisions, including halving/doubling, are not affected.)
Edison rulings: ●If a card gives a monster +100 ATK, and Reverse Trap is activated, that monster now has -100 ATK instead. This card only affects increases and decreases of a defined value, such as +200 (which becomes -200) or -500 (which becomes +500). It does not change cards which double, half, or reduce to 0 the ATK or DEF of a monster.
●You can't activate this card during the Damage Step. This card affects monsters, Spell Cards, and Trap Cards controlled by both players.
●Additional Reverse Traps activated in the same turn will have no effect. So Reverse Trap will change Axe of Despair’s effect of adding 1000 ATK to subtracting 1000 ATK. If a second Reverse Trap is activated, the equipped monster still has -1000 ATK.

## Riryoku Field
[trap Counter] formats: both
Text (Edison): When a Spell Card that targets exactly 1 monster on the field (and no other cards) is activated: Negate the activation, and if you do, destroy it.
Edison rulings: ●This card can't be used against Monster Reborn or Premature Burial since they don't target a monster on the field.
●This card can't be used against Fissure, Smashing Ground, or Dark Hole because these cards don't target.

## Rising Air Current
[spell Field] formats: both
Text (Edison): All WIND monsters gain 500 ATK and lose 400 DEF.

## Roaring Ocean Snake
[fusion Fusion Level 6 WATER Aqua 2100/1800] formats: both (Goat already has a goat-only script in a goat file: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Mystic Lamp" + "Hyosube"

## Robbin' Goblin
[trap Continuous] formats: both (Goat already has a goat-only script in a goat file: port it as the shared script, adjusted to the Edison text)
Text (Edison): Each time a monster you control inflicts Battle Damage to your opponent, your opponent discards 1 random card.
Edison rulings: Each time a monster you control inflicts Battle Damage to your opponent, your opponent discards 1 random card.
●This is a mandatory effect. It activates even if your opponent has no cards in hand.
●This effect won't activate if you inflict 0 Battle Damage.
●This effect activates in Substep 5 - After Damage Calculation (like Don Zaloog).

## Roc from the Valley of Haze
[effect Level 6 WIND Winged Beast 2400/1400] formats: both
Text (Edison): When this card is sent directly from your hand to the GY, add this card to the Deck and shuffle it.
Goat text: When this card is sent directly from your hand to the Graveyard, add this card to the Deck and shuffle it.
Edison rulings: ●Because this effect is a mandatory Trigger Effect, you can't miss the timing with it.
●So even if you send Roc from the Valley of Haze to the GY as a cost, or in the middle of a chain, it will still be shuffled into your Deck (after resolving the current series of events).

## Rock Bombardment
[trap Normal] formats: both
Text (Edison): Send 1 Rock monster from your Deck to the GY; inflict 500 damage to your opponent.

## Rod of the Mind's Eye
[spell Equip] formats: both
Text (Edison): If a monster equipped with this card inflicts Battle Damage to your opponent, the damage becomes 1000 points.
Edison rulings: ●The damage caused by Rod of the Mind's Eye is Battle Damage, so it can be reduced to zero with Waboku or Kuriboh.
●When you equip Rod of the Mind's Eye to Susa Soldier or Shadowknight Archfiend, the Battle Damage is 1000 points.
●When Gravekeeper's Vassal is equipped with Rod of the Mind's Eye, the effect is not activated because the damage caused by Gravekeeper's Vassal is effect damage.

## Rope of Life
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When a monster(s) is destroyed by battle and sent to your GY: Discard your entire hand (min.1), then target 1 of those monsters; Special Summon it, and if you do, it gains 800 ATK.
Edison rulings: ●Discarding your hand is a cost and the cost must be at least 1 card. So if you have zero cards in your hand, you can't activate Rope of Life.
●If your monster is controlled by your opponent and sent to your GY, you can activate Rope of Life. You can't activate Rope of Life when your opponent’s monster you control is sent to his/her GY.
●The increase in ATK is permanent as long as the monster remains face-up on the field.
●You can use Rope of Life to Special Summon Jinzo and Jinzo's ATK will increase by 800 points.

## Roulette Barrel
[effect Level 4 LIGHT Machine 1000/2000] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Once per turn: You can roll a six-sided die twice, choose 1 result, and destroy 1 monster on the field whose Level is equal to that result.
Edison rulings: ●You can only use Roulette Barrel's effect once per turn.
●You have to roll a die twice, not once. You must roll the die twice in a row, not once in Main Phase 1 and once in Main Phase 2, etc.
●You CAN select a die roll result which doesn't match the Level Stars of a face-up monster. But if the die roll you select does match a monster, you MUST destroy a face-up monster with the correct number of Level Stars.
●Roulette Barrel can destroy itself with its effect.
●You can't destroy a monster with 7 or more stars with Roulette Barrel's effect.

## Sacred Crane
[effect Level 4 LIGHT Winged Beast 1600/400] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card is Special Summoned: Draw 1 card.

## Sacred Phoenix of Nephthys
[effect Level 8 FIRE Winged Beast 2400/1600] formats: both
Text (Edison): Once per turn, during your next Standby Phase after this card was destroyed by a card effect and sent to the GY: Special Summon this card from the GY. If you do: Destroy all Spells and Traps on the field.
Edison rulings: ●You can activate Divine Wrath when Sacred Phoenix of Nephthys is Special Summoned by its own effect. Because this effect activates in the GY, and is being negated while Sacred Phoenix of Nepthys is in the GY, Sacred Phoenix of Nepthys is never Special Summoned (so the card is never moved from the GY) and is never destroyed. Because it is not destroyed, its effect to Special Summon itself does not activate again.
●If Sacred Phoenix of Nephthys is Special Summoned with Call of the Haunted or Premature Burial, and that card is destroyed and destroys Sacred Phoenix of Nephthys with its effect, you Special Summon Sacred Phoenix of Nephthys during your next Standby Phase because it was destroyed by a card effect.
●If Sacred Phoenix of Nephthys is destroyed while in your hand/Deck by a card effect, you still activate its effect during your next Standby Phase to Special Summon it from the GY. (For example, if an effect like Star Boy is active, and Sacred Phoenix of Nephthys is Summoned, and Chain Destruction is activated to destroy other copies of Sacred Phoenix of Nephthys in the hand and Deck, those copies will be Special Summoned during your next Standby Phase.
●If Skill Drain is active on the field, the effect of Sacred Phoenix of Nephthys that Special Summons it from the GY is still activated, because it is activated in the GY. However, the effect that destroys Spell and Trap Cards on the field is negated because it activates on the field (so Skill Drain and other Spell and Tra
