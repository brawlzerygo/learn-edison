# Full pool batch 08: 62 cards. Write js/cards/full-08.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Energy Bravery
[effect Level 4 LIGHT Warrior 1700/1200] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●If you Summon a Gemini monster from your GY with “Swing of Memories” while “Energy Bravery” is on the field, and you Normal Summon that monster again, it won't be destroyed during the End Phase.
●If a Gemini monster that is being treated as an Effect Monster is destroyed at the same time as “Energy Bravery” the effect of “Energy Bravery” will still apply and protect the Gemini monster.

## Energy Drain
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●When Hayabusa Knight, boosted by Energy Drain, attacks, and the opponent's hand is reduced during the battle, the ATK of Hayabusa Knight for the second attack is not changed because the effect of Energy Drain is determined when Energy Drain resolves.

## Energy-Absorbing Monolith
[trap Normal] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●The “Energy-Absorbing Monolith” does not increase your Life Points with its own effect. Instead, it changes what the damage inflicting card would have done, so that you gain Life Points instead of taking damage.
●If you activate “Energy-Absorbing Monolith” while your opponent has “Bad Reaction to Simoichi” face-up on their side of the field, instead of gaining Life Points you will receive damage due to the effect of “Bad Reaction to Simochi”.
●If you chain “Energy-Absorbing Monolith” to “Ring of Destruction”, when the monster is destroyed you will gain Life Points equal to the destroyed monster’s ATK and your opponent will receive damage equal to the destroyed monster’s ATK.

## Fairy Box
[trap Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: When your opponent's monster declares an attack: Toss a coin and call it. If you call it right, the attacking monster's ATK becomes 0 until the end of the Battle Phase. During each of your Standby Phases, pay 500 Life Points or destroy this card.
Edison rulings: ●If you have two copies of Fairy Box active on the field you may flip a coin twice, but only need to call 1 correctly to reduce the attacking monster’s ATK to 0.
●The current ATK is reduced to 0, including all Equip Spell Cards. Trap Cards and Quick-Play Spell Cards can't further increase the monster’s ATK this battle. A monster effect such as Injection Fairy Lily can increase its own ATK after Fairy Box is successful.
●Paying 500 Life Points is optional, if you choose not to pay Fairy Box is destroyed.
●The effect of Fairy Box does not target, so Lord of D. won't prevent Fairy Box from reducing the ATK of an attacking Dragon-Type monster to 0.

## Fairy Guardian
[effect Level 3 WIND Fairy 1000/1000] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Tribute this face-up card to return 1 Spell Card sent to your Graveyard by your opponent's card effect during this turn to the bottom of your Deck.
Edison rulings: ●Spell Cards that are eligible for this card’s effect include: Set Spell Cards, Equip Spell Cards, or Continuous Spell Cards destroyed by your opponent’s card effects and Spell Cards negated and destroyed by an opponent’s Magic Jammer, Solemn Judgment, Horus the Black Flame Dragon LV8, etc. It also includes Spell Cards discarded from your hand by your opponent’s card effect, like Delinquent Duo or Confiscation and Spell Cards sent from your Deck to GY by your opponent’s Needle Worm, Don Zaloog, Vampire Lord, etc.
●If you activate Painful Choice and a Spell Card is included in the 4 cards that are sent to the GY, it can't be targeted with the effect of Fairy Guardian since it was YOUR Painful Choice that sent the card to the GY, even though your opponent decided which card you kept.

## Fairy King Truesdale
[effect Level 6 WATER Plant 2200/1500] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: While this card is in Defense Position, all Plant-Type monsters you control gain 500 ATK and DEF.

## Fairy Meteor Crush
[spell Equip] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●You can't double the effect of Fairy Meteor Crush by equipping two copies to the same monster.
●If you equip your Fairy Meteor Crush to an opponent’s monster, and it attacks a Defense Position monster on your side of the field with ATK greater than your monster’s DEF, the opponent will take the difference as Battle Damage. This is because your opponent is the opponent of the player who controls Fairy Meteor Crush not necessarily the opponent of the player who controls the monster.
●Kuriboh or Waboku can be used to prevent the damage caused by Fairy Meteor Crush because it is Battle Damage.

## Fairy of the Spring
[spell Normal] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Target 1 Equip Spell Card in your Graveyard; add that target to your hand. That Equip Spell Card cannot be activated this turn.
Edison rulings: ●You can Set the Equip Spell Card the same turn you play Fairy of the Spring.
●When you add an Equip Spell Card to your hand with Fairy of the Spring, and the same turn it is returned to the Deck with Fiber Jar, and you draw it, you can activate it that same turn.

## Fairy Wind
[trap Normal] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●Fairy Wind does not destroy itself. Both parts of the effect are performed at the same time.
●You can still activate “Fairy Wind” even if the only face-up Spell and Trap Cards on the field can't be destroyed.
●You can't activate “Fairy Wind” unless there is at least 1 other Spell and Trap Card on the field.
●Both players still take damage for each destroyed card even if some of the face-up Spell and Trap Cards are not destroyed. Both players take damage for all the cards destroyed, not just the ones they control.
●If “Heavy Storm” or “Giant Trunade” is activated, you can't activate “Fairy Wind” unless there is another face-up Spell or Trap Card other than “Heavy Storm” or “Giant Trunade.”

## Familiar Knight
[effect Level 3 DARK Warrior 1200/1400] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: When this card is destroyed by battle and sent to the Graveyard: Each player can Special Summon 1 Level 4 monster from their hand.

## Final Attack Orders
[trap Continuous] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: All face-up monsters on the field are changed to Attack Position and their battle positions cannot be changed.
Edison rulings: ●While Final Attack Orders is active, if you attack a face-down Defense Position monster, the monster is changed to Attack Position, then damage calculation is applied with the monster in Attack Position.
●While Final Attack Orders is active, you can change monsters like Guardian Sphinx to face-down Defense Position, and while they are face-down, Final Attack Orders has no effect on them.
●While Final Attack Orders is active, you can change the Battle Positions of monsters with Curse of Fiend or Little-Winguard, but the Battle Positions are immediately changed back to Attack Position by Final Attack Orders.
●While Final Attack Orders is active, effects of Goblin Attack Force, Giant Orc, and Dark Zebra are resolved, but they are immediately changed back to Attack Position.
●While Final Attack Orders and Light of Intervention are active, you can Special Summon a monster in face-up Defense Position, but it is immediately changed to Attack Position.
●The effect of Final Attack Orders can't be chained to.

## Final Countdown
[spell Normal] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Pay 2000 Life Points. After 20 turns have passed (counting the turn you activate this card as the 1st turn), you win the Duel.
Edison rulings: ●You count turns for Final Countdown like this: Turn 1 is the turn you activate it, Turn 2 is your opponent's turn, Turn 3 is your turn after you activated Final Countdown, etc.
●Final Countdown is immediately sent to the GY when it resolves.
●You can activate Pyro Clock of Destiny to advance the turn count by 1 for Final Countdown. Final Countdown does not have to be on the field when you use Pyro Clock of Destiny.
●You win when the 20th turn ends, before the Draw Phase of the 21st turn.
●When your opponent chains Imperial Order to your Final Countdown, the effect of Final Countdown is negated and you can't start counting turns. But if Final Countdown is activated and resolves, and later Imperial Order is activated, it will have no effect on Final Countdown because Final Countdown will be in the GY.
●When you activate Final Countdown, and your opponent activates Final Countdown during his next turn, and then uses Pyro Clock of Destiny to advance his Final Countdown by 1, both Final Countdowns win at the same time and the Duel is a DRAW.

## Final Destiny
[spell Normal] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●Discarding 5 cards from your hand is a cost. You can't activate this card if you have less than 5 cards in your hand.

## Final Flame
[spell Normal] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Inflict 600 points of damage to your opponent's Life Points.

## Final Ritual of the Ancients
[spell Ritual] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.

## Fire Ant Ascator
[effect Effect Tuner Level 3 EARTH Insect 700/1300 Tuner] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●Sending the Special Summoned monster to the GY does not start a Chain.
●The effect to Special Summon targets the monster you want to Special Summon.

## Fire Darts
[trap Normal] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Fire Princess
[effect Level 4 FIRE Pyro 1300/1500] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Each time you gain Life Points, inflict 500 damage to your opponent.
Edison rulings: ●If you have 1 Fire Princess and 2 Solemn Wishes on the field, Fire Princess’s effect deals 1000 damage to your opponent when you draw. If you have 1 Fire Princess and 2 Marie the Fallen One in your GY, Fire Princess’s effect deals 1000 damage to your opponent during your Standby Phase.
●If you have 2 Fire Princesses and 1 Solemn Wishes on the field, your opponent takes 1000 damage when you draw a card (and takes 2000 damage if you had 2 Solemn Wishes on the field instead of 1).
●If Mysterious Puppeteer is on the field when you Summon Fire Princess, Fire Princess’s effect will deal 500 damage to your opponent because of Mysterious Puppeteer’s effect.
●If you have Soul Absorption and Fire Princess face-up on the field when your opponent removes 3 monsters from his GY to Summon Dark Necrofear you will gain 1500 Life Points and Fire Princess’s effect will deal 500 Damage to your opponent.
●If you have a face-up Fire Princess and a Set Poison of the Old Man when your opponent activates Dark Hole you may chain Poison of the Old Man to increase your Life Points and the effect of Fire Princess will deal 500 damage to your opponent even though she is then destroyed by Dark Hole, because the effect of Fire Princess is a Continuous Effect.

## Fire Sorcerer
[effect Flip Effect Level 4 FIRE Spellcaster 1000/1500] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: FLIP: Randomly select 2 cards from your hand and remove them from play to inflict 800 points of damage to your opponent's Life Points.
Edison rulings: ●If you have fewer than 2 cards in your hand when this card is flipped face-up its Flip Effect is not activated.
●Removing 2 cards from your hand is part of the resolution of this card’s Flip Effect, not part of the cost. So if its Flip Summon is negated by Solemn Judgment you don't remove any cards from your hand.

## Fire Trooper
[effect Level 3 FIRE Warrior 1000/1000] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●Fire Trooper's effect is a Trigger Effect. Sending Fire Trooper to the GY is a cost.

## Flame Ghost
[fusion Fusion Level 3 DARK Zombie 1000/800] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.

## Flame Ogre
[effect Level 7 FIRE Fiend 2400/1700] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Flame Ruler
[effect Level 4 FIRE Pyro 1500/1600] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.

## Flame Spirit Ignis
[effect Level 4 FIRE Pyro 1500/1200] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Flint
[spell Equip] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: The equipped monster loses 300 ATK and cannot change its battle position or declare an attack. If this card is destroyed because the equipped monster is destroyed: Target 1 monster on the field; equip this card to that monster.
Edison rulings: ●The effect of Flint that equips it to a new monster is an effect that targets. This effect also can be chained to.

## Flint Lock
[effect Level 4 LIGHT Machine 1500/800] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●The effect of Flint Lock that moves Flint from Flint Lock to another monster can be activated multiple times in the same turn.
●You can't target activate Flint from you hand targeting a Flint Lock that is already equipped with Flint.
●This card's effect to equip Flint to itself targets the Flint card.
●This card's effect to to equip Flint to another monster targets that monster and Flint.

## Flint Missile
[spell Quick-Play] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Rulings: 1. If the activation of "Flint Missile" is negated, or it is destroyed by a card chained to its activation, you cannot return it to your Deck.

## Forced Back
[trap Counter] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●You can't activate this card when a monster is Set.
●If a monster with a Flip Effect is Flip Summoned and you activate “Forced Back”, then the Flip Effect never activates.
●If you negate the Normal or Flip Summon of “Dark Magician of Chaos” with “Forced Back”, it is returned to the hand and is not removed from play.
●You can activate “Forced Back” when you Normal or Flip Summon your own monster. You should announce this immediately after your Summon. Once you allow your opponent to activate “Torrential Tribute” you are acknowledging that the Summon was successful and you can't activate “Forced Back”.

## Forced Ceasefire
[trap Normal] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●You can activate the effect of a Continuous Trap Card that is already face-up on the field during the turn that “Forced Ceasefire” is active.
●This effect applies to both players.

## Forced Requisition
[trap Continuous] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.

## Fusion Devourer
[effect Level 4 DARK Fiend 1400/1200] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●This effect is constantly applied during the Damage Step. If “Skyscraper” is on the field and this card battles an “Elemental Hero” Fusion Monster, that Fusion Monster’s ATK will still be 0 for Damage Calculation.
●If this card battles a Fusion Monster that is equipped with “Axe of Despair”, etc. that Fusion Monster’s ATK will be 0 for Damage Calculation.
●If “Shrink” is activated in the Damage Step targeting a Fusion Monster battling “Fusion Devourer”, that Fusion Monster’s ATK will be 0 for Damage Calculation.
●This is a Continuous Effect.

## Fusion Gate
[spell Field] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●The Ignition Effect activates & resolves on the field.
●Both Players can activate this effect on their turn.
●This effect can be activated more than once per turn.
●There is no activation cost. Fusion Material monsters are banished when this effect resolves.
●This effect can be negated by Royal Oppression, and this card will be destroyed.
●Fusion Summoned monster can later be Special Summoned from the GY / banished.

## Fusion Guard
[trap Counter] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Fusion Recovery
[spell Normal] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●You can use “Fusion Recovery” to retrieve a Fusion Material Monster that was used with “Power Bond” or “Fusion Gate” or “Polymerization”.
●You can use “Fusion Recovery” to retrieve a fusion substitute monster like “King of the Swamp” or “Goddess with the Third Eye” as long as it was used in a Fusion Summon.
●“Fusion Recovery” targets 1 monster and 1 “Polymerization” in the GY (so it will be negated by “Necrovalley” or “The End of Anubis”).
●If 1 of the targeted cards is no longer in the GY when this effect resolve, you still resolve the rest of the effect as best you can.

## Fusion Sage
[spell Normal] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●You can't activate Fusion Sage if you don't have any copies of Polymerization in your Deck.

## Fusion Sword Murasame Blade
[spell Equip] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Equip only to a Warrior-Type monster. It gains 800 ATK. While equipped to a monster, this card cannot be destroyed by card effects.
Edison rulings: ●If this card is face-down on the field, it can be destroyed by effects that destroy Spell Cards.
●When you activate this card, the opponent can chain a card like Magic Jammer that will negate its activation and destroy it.
●If you equip this card to Freed the Matchless General, Ryu Senshi or to a Warrior-Type monster you control when you have Frontier Wiseman on the field, it is negated and destroyed.
●If you equip this card to Gearfried the Iron Knight it is not destroyed.
●This card is not destroyed by cards that target, like Mystical Space Typhoon or Dust Tornado, or by cards that don't target, like Heavy Storm, Harpie’s Feather Duster, or Gryphon Wing.
●If a monster equipped with this card is flipped face-down, or removed from the field, this card is destroyed.
●This card can be sent from your hand or your Deck to the GY by the effect of Confiscation, Delinquent Duo, etc.
●If Imperial Order is active, this card can be destroyed by Dust Tornado, etc.
●This card can be returned to the owner’s hand by the effect of Giant Trunade or ‘Tornado Bird.
●If the monster this card is equipped to has its Type changed to anything but Warrior-Type, this card is destroyed.
●If the opponent chains Mystical Space Typhoon to the activation of this card, this card is destroyed before its effect can be applied.

## Fusion Weapon
[spell Equip] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.

## Gaia Plate the Earth Giant
[effect Level 8 EARTH Rock 2800/1000] formats: edison
Text (Edison): ① You can Special Summon this card (from your hand) by banishing 2 Rock Monsters from your GY. 
② Halve the ATK/DEF of any monster that battles with this card during Damage Calculation only.
Ⓜ During your Standby Phase, send this card you control to the GY, unless you banish 1 Rock monster from your GY.
Edison rulings: The Ⓜ :
This is a Maintenance Cost. It does not activate, and cannot be negated.

The ②:
● This applies in Damage Calculation.
● This effect is "Supercontinuous", meaning that it will apply and re-apply after any other ATK/DEF modifier.
EG, vs "Honest": This effect will apply before Honest is activated, and will re-apply after Honest resolves.
Once this effect stops applying, reapply all other ATK/DEF modifiers, including Lingering Effects.

## Gaia Power
[spell Field] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.

## Gaia Soul the Combustible Collective
[effect Level 4 FIRE Pyro 2000/0] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Once per turn: You can Tribute up to 2 Pyro-Type monsters; this card gains 1000 ATK for each. If this card attacks a Defense Position monster, inflict piercing battle damage to your opponent. During the End Phase: Destroy this card.
Edison rulings: ●Gaia Soul the Combustible Collective is destroyed during the End Phase even if you don’t activate its effect.
●You can only use the effect of Gaia Soul the Combustible Collective to Tribute Pyro-Type Monsters once per turn.

## Gaia the Dragon Champion
[fusion Fusion Level 7 WIND Dragon 2600/2100] formats: both (Goat already has a goat-only script in a goat file: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.

## Giant Axe Mummy
[effect Level 5 EARTH Zombie 1700/2000] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●When a monster with ATK less than Giant Axe Mummy’s DEF attacks Giant Axe Mummy, the monster is treated as being destroyed by the effect of Giant Axe Mummy, NOT as a result of battle.

## Giant Germ
[effect Level 2 DARK Fiend 1000/100] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: When this card is destroyed by battle and sent to the Graveyard: Inflict 500 damage to your opponent, then you can Special Summon any number of "Giant Germs" from your Deck in face-up Attack Position.

## Giant Kozaky
[effect Level 4 DARK Fiend 2500/2400] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●The first part of “Giant Kozaky” is a Continuous Effect that does not start a chain. The second part is a Trigger Effect that can be chained to.
●You can chain “Barrel Behind the Door” to the Trigger Effect (the damage) of “Giant Kozaky”.
●If “Giant Kozaky” is destroyed while face-down, then its effect that inflicts damage is not activated. If “Giant Kozaky” is face-up on the field and is targeted by “Tribute to the Doomed”, and you chain “Book of Moon” so that “Giant Kozaky” is face-down when destroyed by “Tribute to the Doomed”, there is no damage.
●Like “Atomic Firefly”, “Foxfire”, and “Poison Draw Frog”, if a face-down “Giant Kozaky” is attacked and destroyed, its effect is not applied. However, if a face-down “Giant Kozaky” is attacked, and is not destroyed by the attack, if “Kozaky” is not face-up on the field, then “Giant Kozaky” is destroyed by its own effect after damage calculation, and damage is inflicted by its effect.
●If “Drillroid” attacks a face-down “Giant Kozaky” while “Kozaky” is not on the field, “Giant Kozaky” is destroyed by the effect of “Drillroid” after being flipped face-up. The effect of “Giant Kozaky” is not applied and it does not inflict damage.
●The effect of “Giant Kozaky” that inflicts damage to the controller activates in the GY or the “removed zone”, wherever “Giant Kozaky” goes to after being destroyed. “The End of Anubis” will negate the effect of “Giant Kozaky” if it was destroyed and sent to the GY, but “Banisher of the Light” won't (be

## Giant Orc
[effect Level 4 DARK Fiend 2200/0] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: If this card attacks, it is changed to Defense Position at the end of the Battle Phase. You cannot change this battle position until the end of your next turn.

## Giant Trap Hole
[trap Normal] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●You can't activate “Giant Trap Hole” during the Damage Step.
●You can activate “Giant Trap Hole” when 1 monster is Special Summoned to each side of the field, by “The Shallow Grave”, etc.
●You can't activate “Giant Trap Hole” when “Grinder Golem” is Special Summoned.

## Gift Card
[trap Normal] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Gift of the Martyr
[spell Normal] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Send 1 monster on your side of the field to the Graveyard. Select 1 monster on your side of the field. The selected monster gains ATK equal to the ATK of the sent monster until the end of this turn.
Edison rulings: ●“Gift of the Martyr” increases the monster’s ATK by the original ATK of the monster sent to the GY.
●Sending a monster to the GY is a cost for “Gift of the Martyr”. This is an effect that targets.
●You can send a face-down monster to the GY as the cost of “Gift of the Martyr”. Refer to the original ATK of the monster.

## Gift of The Mystical Elf
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Increase your Life Points by 300 points for each monster on the field.

## Goblin Attack Force
[effect Level 4 EARTH Warrior 2300/0] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: If this card attacks, it is changed to Defense Position at the end of the Battle Phase, and its battle position cannot be changed until the End Phase of your next turn.
Edison rulings: ●If Goblin Attack Force's attack is negated, it is not shifted to Defense Position at the end of the Battle Phase.
●If you attack with Goblin Attack Force and it is shifted to Defense Position with its effect, if your opponent takes control of it during their following turn they can't manually change it to Attack Position.
●When you attack with Goblin Attack Force, its Battle Position can't be changed until the end of your next turn:
●Turn 1: You attack with Goblin Attack Force. It is shifted to Defense Position.
●Turn 2: If your opponent takes control of Goblin Attack Force, they can't manually change it to Attack Position.
●Turn 3: You can't manually change Goblin Attack Force to Attack Position.
●Turn 4: If your opponent takes control of Goblin Attack Force, they can manually change it to Attack Position.
●Turn 5: If you still control Goblin Attack Force, you can manually change Goblin Attack Force to Attack Position.

## Goblin Black Ops
[effect Level 4 DARK Beast-Warrior 1300/0] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Goblin Decoy Squad
[effect Level 4 DARK Warrior 1000/0] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Goblin Elite Attack Force
[effect Level 4 EARTH Fiend 2200/1500] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Goblin Fan
[trap Continuous] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: When a Level 2 or lower monster is Flip Summoned, destroy it. Its effects do not activate at that time.

## Goblin King
[effect Level 1 DARK Fiend 0/0] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: While you control another Fiend-Type monster, this card cannot be attacked. The ATK and DEF of this card are each equal to the number of Fiend-Type monsters on the field (excluding this card) x 1000.
Edison rulings: ●If you have 2 Goblin Kings, or a Goblin King equipped with Raregold Armor and another Fiend-Type monster, your opponent can't attack.
●Goblin King's second effect includes Fiend-Type monsters on your opponent's side of the field.
●Face-down Fiend-Type monsters are not included for Goblin King's second effect.
●If you equip Megamorph to Goblin King, Goblin King's ATK is 0.
●If you have a Fiend-Type monster and a face-down Goblin King, and Goblin King is attacked, Goblin King's ATK and DEF increase after he's flipped face-up, but before damage calculation is applied.

## Goblin of Greed
[effect Level 4 EARTH Fiend 1000/1800] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●Goblin of Greed prevents discarding as a cost, but not as part of an effect. So Goblin of Greed will stop Kuriboh, but not Mirage of Nightmare or Graceful Charity.
●If your opponent activates an effect and discards as a cost, and you chain Call of the Haunted to Special Summon Goblin of Greed, he doesn't stop the effect because the cost was already paid.

## Goblin Out of the Frying Pan
[trap Counter] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Goblin Recon Squad
[effect Level 4 WIND Warrior 1700/0] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.

## Goblin Thief
[spell Normal] formats: both
Text (Edison): No Edison-Accurate PSCT available for this card.
Goat text: Inflict 500 points of damage to your opponent's Life Points and increase your Life Points by 500 points.
Edison rulings: ●You can chain Barrel Behind the Door to Goblin Thief.

## Graceful Charity
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.
Edison rulings: ●Your opponent can't activate Appropriate after you activate Graceful Charity since the last effect that resolves with Graceful Charity is discarding, not drawing, and your opponent misses the timing. But if your opponent already has an active Appropriate face-up on the field, he/she can draw 2 cards after you activate Graceful Charity.
●If Solemn Wishes is on the field when you activate Graceful Charity, you gain 500 Life Points after you finish both drawing and discarding. If Solemn Wishes and Skull Invitation are on the field, you finish both drawing and discarding for the effect of Graceful Charity then you gain 500 Life Points, then you lose 600 Life Points.
●If you have three pieces of Exodia in your hand, Graceful Charity, and no other cards, and then you activate Graceful Charity and draw the final 2 pieces of Exodia, you must discard 2 cards before a victory can be declared, but after you discard you will no longer have all 5 pieces of Exodia, and can't declare a victory.

## Graceful Dice
[spell Quick-Play] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): No Edison-Accurate PSCT available for this card.

## Graceful Revival
[trap Continuous] formats: edison
Text (Edison): No Edison-Accurate PSCT available for this card.
