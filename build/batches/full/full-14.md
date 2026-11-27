# Full pool batch 14: 65 cards. Write js/cards/full-14.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Ryu Kokki
[effect Level 6 DARK Zombie 2400/2000] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): At the end of the Damage Step, if this card battled a Warrior or Spellcaster monster: Destroy that monster.
Goat text: At the end of the Damage Step, if this card battled a Warrior or Spellcaster-Type monster: Destroy that monster.
Edison rulings: ●The mandatory Trigger Effect activates in Substep 7 - End of the Damage Step.
●If Ryu Kokki was destroyed by battle, this effect still activates.
●The monster's current Type must be Warrior / Spellcaster in order for this effect to activate.
●VS. Goyo Guardian: The effects of Goyo Guardian and Ryu Kokki form a single chain during Substep 7 of the Damage Step when they battle. Kokki's mandatory trigger effect will be Chain Link 1.
●If Ryu Kokki battles with Dark Magician of Chaos, Ryu Kokki is destroyed and removed from play by Dark Magician of Chaos' effect, and Dark Magician of Chaos is removed from play because it is destroyed by Ryu Kokki's effect and removed by its own effect.

## Ryu Senshi
[fusion Fusion Level 6 EARTH Warrior 2000/1200] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Warrior Dai Grepher" + "Spirit Ryu"
A Fusion Summon of this card can only be done with the above Fusion Materials. When a Normal Trap Card is activated (Quick Effect): You can pay 1000 LP; negate that effect. This card must be face-up on the field to activate and to resolve this effect. Negate the effects of any Spell Card that targets this card and destroy it.
Edison rulings: ●This card’s effect that negates Spell Cards that target it is not optional.
●You can Special Summon this card from the GY with Monster Reborn because its effect that negates Spell Cards is not active while it is in the GY (but only if was properly Fusion Summoned originally).
●A Spell Card that targets this card may be activated, but it will be negated and destroyed.
●The effect of this card won't negate Creature Swap, Fissure, Smashing Ground, Dark Hole, Raigeki, or similar cards that don't target.
●If you try to equip Fusion Sword Murasame Blade to this monster, it will be negated and destroyed.

## Ryu-Kishin Clown
[effect Level 2 DARK Fiend 800/500] formats: both
Text (Edison): When this card is Summoned (including Flip Summon and Special Summon), select 1 face-up monster on the field and change its battle position.
Edison rulings: ●If Ryu-Kishin Clown is Special Summoned face-down, its effect does not activate.

## Sasuke Samurai
[effect Level 2 WIND Warrior 500/800] formats: both
Text (Edison): At the start of the Damage Step, if this card attacks a face-down Defense Position monster: Destroy that face-down monster.
Edison rulings: ●If Sasuke Samurai attacks a face-down monster, apply its effect after entering the Damage Step, but before flipping up the face-down monster. The monster is not flipped. Flip Effects are not activated. Monsters like Kisetai and Giant Axe Mummy don't activate their effects.
●If Sasuke Samurai attacks a face-down monster, there is no damage calculation. Sasuke Samurai destroys the monster before damage calculation is reached.
●If Sasuke Samurai destroys a face-down monster using its effect, the face-down monster is NOT destroyed as a result of battle, it is destroyed by Sasuke Samurai’s effect. So Mystic Tomato, Helpoemer, etc. won't activate their effects. However, monsters like Sangan will still activate their effects.
●If Sasuke Samurai attacks a face-down monster, and Ceasefire is activated during the Battle Step to flip it face-up, Sasuke Samurai does not destroy it with its effect and damage calculation is applied normally. The monster must be face-down at the beginning of the Damage Step in order for Sasuke Samurai to activate its effect.

## Sasuke Samurai 2
[effect Level 1 WIND Warrior 200/300] formats: edison
Text (Edison): Once per turn, during your Main Phase, you can pay 800 LP. If you do this, until the End Phase, Spell and Trap Cards can't be activated.
Rulings: 1. You can only activate the effect of "Sasuke Samurai #2" during your Main Phase 1 or 2 because it's an Ignition Effect.
2. You can only activate the effect of "Sasuke Samurai #2" once per turn.
3. The effect of "Sasuke Samurai #2" stops in the End Phase, and after the effect ends, you can activate Trap Cards or Quick-Play Spell Cards during the remainder of the End Phase.
4. While the effect of "Sasuke Samurai #2" is active, you can't activate the effects of cards that activate in the GY like "Black Pendant" and "Statue of the Wicked".
5. You cannot activate the effects of Continuous cards like "Skull Lair", "Ultimate Offering", or "Mass Driver" while the effect of "Sasuke Samurai #2" is active.

## Sasuke Samurai 3
[effect Level 3 LIGHT Warrior 1000/1000] formats: edison
Text (Edison): When this card inflicts Battle Damage to your opponent's LP, your opponent draws cards until his/her hand has 7 cards.

## Sasuke Samurai 4
[effect Level 4 WIND Warrior 1200/1200] formats: edison
Text (Edison): If this card battles a monster, toss a coin and call heads or tails before damage calculation. If you call it right, destroy the opponent's monster with this effect.
Rulings: 1. You activate the effect of "Sasuke Samurai #4" at the beginning of the Damage Step, before the monster is flipped face-up. A monster destroyed by the effect of "Sasuke Samurai #4" is not destroyed as a result of battle. There is no damage calculation. It is not flipped face-up. Any Flip Effects it has are not activated.
2. If "Sasuke Samurai #4" attacks a face-up Attack Position "Reflect Bounder", the effect of "Sasuke Samurai #4" is resolved before the effect of "Reflect Bounder".

## Sasuke Samurai #2
[effect Level 1 WIND Warrior 200/300] formats: goat
Text: Once per turn, during your Main Phase, you can pay 800 Life Points. If you do this, until the End Phase, Spell and Trap Cards cannot be activated.

## Secret Barrel
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Inflict 200 damage to your opponent for each card in their hand and for each card they control.
Edison rulings: ●If you activate Secret Barrel and your opponent activates something as a chain, the chained card is included in the number (so if your opponent's only card on the field or in his hand is Mystical Space Typhoon, and he chains Mystical Space Typhoon to Secret Barrel, he still takes 200 damage).
●Monster Tokens are counted for Secret Barrel.

## Secret Pass to the Treasures
[spell Normal] formats: both
Text (Edison): Select 1 face-up monster with an ATK equal to 1000 points or less on your side of the field. During the turn this card is activated, the selected monster can attack your opponent's LP directly.
Goat text: Select 1 face-up monster with an ATK equal to 1000 points or less on your side of the field. During the turn this card is activated, the selected monster can attack your opponent's Life Points directly.
Edison rulings: ●There is no way to have a monster with an ATK above 1000 attack directly using the effect of Secret Pass to the Treasures. When you target a monster with Secret Pass to the Treasures, and the monster’s ATK is increased above 1000 afterwards, the monster can't attack your opponent’s Life Points directly.
●If the monster attacks your opponent’s Life Points directly, you can't use an effect such as Rush Recklessly to increase its ATK above 1000 during the attack. If a monster attacks directly using the effect of Secret Pass to the Treasures, automatic increases won't apply (Super Robolady, etc.). If you use Secret Pass to the Treasures on Injection Fairy Lily, and attack directly, you can't activate the effect of Injection Fairy Lily.
●You can't activate Secret Pass to the Treasures during Main Phase 2 or on the very first turn.
●This card targets a monster.

## Secret Village of the Spellcasters
[spell Field] formats: edison
Text (Edison): If only you control a Spellcaster monster, your opponent can't activate Spell Cards. If you control no Spellcaster monsters, you can't activate Spell Cards.
Edison rulings: ●The Continuous Effect does not activate.
●This effect applies if you have a face-up Spellcaster-Type monster and your opponent does not.
●Your opponent can still Set Spell Cards face-down, but they can't be activated (played face-up).
●Your opponent can stil activate the effects of Spell Cards (ex: Magical Blast, Call of the Mummy).
●The Continuous Effect does not activate.
●This effect applies if you don't control a face-up Spellcaster-Type monster.
●You can still Set Spell Cards face-down, but they can't be activated (played face-up).
●You can still activate the effects of Spell Cards (ex: Magical Blast, Call of the Mummy).

## Shadow Delver
[effect Effect Gemini Level 4 DARK Fiend 1500/500] formats: edison
Text (Edison): This card is treated as a Normal Monster while face-up on the field or in the GY. While this card is face-up on the field, you can Normal Summon it to have it be treated as an Effect Monster with this effect:
● Once per turn, you can select 1 face-up Level 4 or lower DARK monster you control. It can attack your opponent directly this turn.
Edison rulings: These rulings apply to all Gemini Monsters: https://edisonformat.net/rules/compendium/gemini-monsters
●If a monster makes a direct attack using the effect Shadow Delver, and ceases to be a Level 4 or lower DARK monster after the attack is declared, the attack still continues. No replay occurs.

## Shadow Ghoul
[effect Level 5 DARK Zombie 1600/1300] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): This card gains 100 ATK for each monster in your GY.
Goat text: This card gains 100 ATK for each monster in your Graveyard.

## Shadow of Eyes
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When a monster(s) is Set on your opponent's field: Target 1 of those Set monsters; change that Set monster to Attack Position. (Flip Effects are not activated.)
Goat text: When a monster(s) is Set on your opponent's field: Target 1 of those Set monsters; change that Set monster to face-up Attack Position. (Flip Effects are not activated.)
Edison rulings: ●Shadow of Eyes can be activated when a monster is Special Summoned in face-down Defense Position.
●Shadow of Eyes can be activated when multiple monsters are Special Summoned in face-down Defense Position by the same effect. In this case, select a monster when you activate Shadow of Eyes.
●Shadow of Eyes can be activated when Guardian Sphinx is flipped face-down by its effect.

## Shadow Spell
[trap Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Activate this card by targeting 1 face-up monster your opponent controls; it loses 700 ATK, also it can't attack or change its battle position. When it leaves the field, destroy this card.
Goat text: Activate this card by targeting 1 face-up monster your opponent controls; it loses 700 ATK, also it cannot attack or change its battle position. When it leaves the field, destroy this card.

## Shadow Tamer (Archfiend)
[effect Flip Effect Level 3 EARTH Warrior 800/700] formats: edison
Text (Edison): (This card is always treated as an "Archfiend" card.)
FLIP: Target 1 Fiend monster your opponent controls; take control of that target until the End Phase.

## Shadow Tamer
[effect Flip Effect Level 3 EARTH Warrior 800/700] formats: goat
Text: (This card is always treated as an "Archfiend" card.)
FLIP: Target 1 Fiend-Type monster your opponent controls; take control of that target until the End Phase.

## Shield & Sword
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Switch the original ATK and DEF of all face-up monsters currently on the field, until the end of this turn.
Edison rulings: ●You can use this card with Catapult Turtle. In this case, inflict Direct Damage equal to half of the Tribute monster's original DEF to your opponent's Life Points.
●This card switches the original ATK/DEF only. After this, apply all modifiers to the new ATK/DEF.
●The effect of this card lasts for your turn only.
●This card has no effect on Relinquished because Relinquished's original ATK/DEF are both zero.
●If Shrink affects a monster affect by Shield & Sword after Shield & Sword's effect is applied, its ATK will be half of the switched ATK (ie., half of its original DEF). If Shield & Sword's effect is applied after Shrink's, that monster's ATK will become equal to its original DEF, and its original DEF will be equal to its original ATK (The effect of Shrink effectively disappears).

## Shield Crush
[spell Normal] formats: edison
Text (Edison): Target 1 Defense Position monster on the field; destroy that target.
Edison rulings: ●“Shield Crush” can select and destroy monsters in face-up or face-down Defense Position.
●“Shield Crush” will only destroy the selected monster if the selected monster is still in Defense Position when “Shield Crush” is resolved. For example, if you select a Defense Position monster to destroy with “Shield Crush” and the monster is changed into Attack Position by another card effect (“Zero Gravity”, etc.), the effect of “Shield Crush” disappears.
●“Shield Crush” targets the Defense Position monster that is selected when you activate “Shield Crush”. If the selected monster is changed into Attack Position after being selected, it is not possible to select a different monster.

## Shield Spear
[trap Normal] formats: edison
Text (Edison): Target 1 face-up monster on the field; it gains 400 ATK/DEF until the end of this turn.

## Shield Warrior
[effect Level 3 EARTH Warrior 800/1600] formats: edison
Text (Edison): During damage calculation, in either player's turn: You can banish this card from your GY; monsters you control can't be destroyed by this battle.
Edison rulings: ●Shield Warrior's effect is a Quick Effect. Removing Shield Warrior from play is a cost. This effect does not target.
●You can't activate Shield Warrior's effect if your monster would not be destroyed by the battle.
●If a monster you control is forced to battle another monster you control by the effect of your opponent's Ancient Lamp, when you activate Shield Warrior's effect during damage calculation, both of your monsters are not destroyed.

## Shield Wing
[effect Level 2 WIND Winged Beast 0/900] formats: edison
Text (Edison): Twice per turn, this card can't be destroyed by battle.

## Shield Worm
[effect Level 4 EARTH Insect 800/2000] formats: edison
Text (Edison): When this card is Summoned, it is changed to Defense Position. Then, send 1 card from the top of your opponent's Deck to the GY for each face-up Insect monster you control.
Edison rulings: ●Changing this card to Defense Position and sending cards to your opponent’s GY are both parts of the same Trigger Effect.
●They occur one after the other, so you would miss the timing to activate “Tragedy.”
●If you Special Summon this card with “Limit Reverse” you will switch it to Defense Position, send cards from your opponent’s Deck to the GY, and then destroy “Shield Worm” with “Limit Reverse.”

## Shooting Star Bow - Ceal
[spell Equip] formats: both
Text (Edison): The equipped monster loses 1000 ATK, but it can attack your opponent directly.
Edison rulings: ●Shooting Star Bow - Ceal decreases the current ATK. So if Injection Fairy Lily is equipped with Shooting Star Bow - Ceal and activates her effect, her ATK is 2400 ((400 - 1000) + 3000 = 2400).
●If a monster equipped with Shooting Star Bow - Ceal declares a direct attack, and Shooting Star Bow - Ceal is removed from the monster during the Battle Step with Mystical Space Typhoon or Tailor of the Fickle, the monster is no longer capable of attacking directly and a replay occurs.
●Tyrant Dragon must attack a monster in order to gain its second attack, so if it is equipped with Shooting Star Bow - Ceal and attacks directly, it can't get a second attack. But Tyrant Dragon equipped with Shooting Star Bow - Ceal can attack a monster, and then attack directly.

## Silent Abyss
[effect Level 7 WATER Reptile 2000/1500] formats: edison
Text (Edison): When this card is destroyed by battle and sent to the GY, destroy all face-down and non-WATER monsters.
Edison rulings: ●This card’s effect will destroy “Elemental Mistress Doriado”.

## Silent Doom
[spell Normal] formats: edison
Text (Edison): Target 1 Normal Monster in your GY; Special Summon it in face-up Defense Position, but it can't attack.

## Silent Insect
[effect Level 2 EARTH Insect 200/300] formats: edison
Text (Edison): This card is changed to Defense Position when it is Normal Summoned or Flip Summoned. Negate the effects of all Continuous Spell Cards and Continuous Trap Cards.
Edison rulings: ●Changing this card to Defense Position when it is Normal or Flip Summoned is a Trigger Effect. Its other effect is a Continuous Effect.
●If “Silent Insect” is face-up on the field, you can activate “Skill Drain” by paying 1000 Life Points, but its effect will be negated. If “Skill Drain” is active on the field when you Normal or Flip Summon “Silent Insect”, its effects are negated and it will remain in Attack Position.

## Silent Magician LV4
[effect Level 4 LIGHT Spellcaster 1000/1000] formats: both
Text (Edison): Each time your opponent draws a card(s), place 1 Spell Counter on this card (max. 5). This card gains 500 ATK for each Spell Counter on it. During the Standby Phase of your next turn after the 5th Spell Counter is placed on this card: You can send this face-up card with 5 Spell Counters on it to the GY; Special Summon 1 "Silent Magician LV8" from your hand/Deck.
Goat text: Each time your opponent draws a card(s), place 1 Spell Counter on this card (max. 5). This card gains 500 ATK for each Spell Counter on it. During the Standby Phase of your next turn after the 5th Spell Counter is placed on this card: You can send this face-up card with 5 Spell Counters on it to the Graveyard; Special Summon 1 "Silent Magician LV8" from your hand or Deck.

## Silent Magician LV8
[effect Level 8 LIGHT Spellcaster 3500/1000] formats: both
Text (Edison): Cannot be Normal Summoned/Set. Must be Special Summoned by "Silent Magician LV4" and Cannot be Special Summoned by other ways. Unaffected by your opponent's Spell effects.
Goat text: Cannot be Normal Summoned/Set. Must be Special Summoned by "Silent Magician LV4" and cannot be Special Summoned by other ways. Unaffected by your opponent's Spell effects.

## Silent Strider
[effect Level 2 EARTH Insect 300/700] formats: edison
Text (Edison): You can send this card from your hand to the GY to reduce the Level of 1 monster on the field by 1, until the End Phase.
Edison rulings: ●Silent Strider's effect is an Ignition Effect. Sending Silent Strider to the GY is a cost.
●Silent Strider's effect targets 1 face-up monster. You can't select a Level 1 monster.

## Silent Swordsman LV3
[effect Level 3 LIGHT Warrior 1000/1000] formats: both
Text (Edison): Negate your opponent's Spell effects that target this card. During your Standby Phase: You can send this face-up card to the GY; Special Summon 1 "Silent Swordsman LV5" from your hand/Deck. You can't activate this effect the turn this card is Summoned or flipped face-up.
Goat text: Negate your opponent's Spell effects that target this card. During your Standby Phase: You can send this face-up card to the Graveyard; Special Summon 1 "Silent Swordsman LV5" from your hand or Deck. You cannot activate this effect the turn this card is Summoned or flipped face-up.
Edison rulings: ●Silent Swordsman LV3 will negate the effects of your opponent’s Spell Cards that target it, whether that Spell Card targets just Silent Swordsman LV3 (such as Soul Exchange) or multiple monsters (Different Dimension Gate).

## Silent Swordsman LV5
[effect Level 5 LIGHT Warrior 2300/1000] formats: both
Text (Edison): Unaffected by your opponent's Spell effects. During your next Standby Phase after this card inflicts battle damage to your opponent by a direct attack: You can send this face-up card to the GY; Special Summon 1 "Silent Swordsman LV7" from your hand/Deck.
Goat text: Unaffected by your opponent's Spell effects. During your next Standby Phase after this card inflicts battle damage to your opponent by a direct attack: You can send this face-up card to the Graveyard; Special Summon 1 "Silent Swordsman LV7" from your hand or Deck.
Edison rulings: ●Just like “The Legendary Fisherman” and other monsters that are unaffected by Spell Cards, “Silent Swordsman LV5” can attack normally if your opponent has “Swords of Revealing Light” on the field, and its controller is unaffected by effects like “Toll” and “Gravekeeper’s Servant” when “Silent Swordsman LV5” attacks.
●If you control “Blue-Eyes White Dragon” and “Silent Swordsman LV5”, and your opponent activates “Fissure”, the monster with the lowest ATK is “Silent Swordsman LV5”, but it is unaffected by Spell Cards, so the effect of “Fissure” disappears.
●“Silent Swordsman LV5” is unaffected by Spell Cards your opponent controls, including those in your opponent’s hand due to “Exchange” or “Graverobber”.
●You can Special Summon “Silent Swordsman LV5” with “Autonomous Action Unit”. If “Autonomous Action Unit” is removed from the field, “Silent Swordsman LV5” is unaffected and remains on the field.

## Silent Swordsman LV7
[effect Level 7 LIGHT Warrior 2800/1000] formats: both
Text (Edison): Cannot be Normal Summoned/Set. Must be Special Summoned by "Silent Swordsman LV5", and Cannot be Special Summoned by other ways. Negate all Spell effects on the field.
Goat text: Cannot be Normal Summoned/Set. Must be Special Summoned by "Silent Swordsman LV5", and cannot be Special Summoned by other ways. Negate all Spell effects on the field.

## Sinister Seeds
[trap Normal] formats: edison
Text (Edison): When a monster you control is destroyed by a battle in which you took damage, and it was in Attack Position at the start of the Damage Step and when it was destroyed: Special Summon 1 "Sinister Seed Token" (Plant/DARK/Level 1/ATK 100/DEF 100) for every 500 points of battle damage you took from that battle.
Edison rulings: ●Sinister Seeds can be activated when the monster destroyed by battle is sent to the GY.
●Sinister Seeds can't be activated if you won't have enough open Monster Card Zones for every Sinister Seed Token that would be Special Summoned. You can't activate Sinister Seeds when you receive 3000 or more battle damage.
●You can't activate Sinister Seeds if you don't receive at least 500 points of Battle Damage.

## Sinister Serpent
[effect Level 1 WATER Reptile 300/250] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): During your Standby Phase, if this card is in your GY: You can add it to your hand, also banish 1 "Sinister Serpent" from your GY during your opponent's next End Phase. You can only use this effect of "Sinister Serpent" once per turn.
Edison rulings: ●The effect of this card is optional; you don't have to return it to your hand.
●The effect of this card activates no matter how it is sent to the GY. It can be destroyed, Tributed, discarded from the hand, or sent straight from the Deck to the GY.
●If your Sinister Serpent is on the field and is destroyed during your Standby Phase, you may return it to your hand during that same Standby Phase.
●If Sinister Serpent is destroyed as a result of battle with Dark Ruler Ha Des or Dark Balter the Terrible you can't activate its effect and return it to your hand during your next Standby Phase, or any subsequent Standby Phase.
●You can't activate the effect of Sinister Serpent if The End of Anubis is on the field.
●Necrovalley does not negate the effect of Sinister Serpent.

## Sinister Sprocket
[effect Effect Tuner Level 1 DARK Fiend 400/0 Tuner] formats: edison
Text (Edison): If this card is sent to the GY for the Synchro Summon of a DARK Synchro Monster, you can destroy 1 face-up Spell or Trap Card.
Edison rulings: ●When Sinister Sprocket is used as a Synchro Material Monster, if the Synchro Monster becomes a DARK monster when it is Synchro Summoned (due to DNA Transplant, etc.), you can activate Sinister Sprocket's effect.

## Skull Archfiend of Lightning
[effect Level 6 DARK Fiend 2500/1200] formats: both
Text (Edison): During each of your Standby Phases, you must pay 500 LP (this is not optional), or this card is destroyed. Before resolving an opponent's card effect that targets this card, roll a six-sided die, negate the effect if you roll 1, 3, or 6, and if you do, destroy that card.
Goat text: During each of your Standby Phases, you must pay 500 Life Points (this is not optional), or this card is destroyed. Before resolving an opponent's card effect that targets this card, roll a six-sided die, negate the effect if you roll 1, 3, or 6, and if you do, destroy that card.
Rulings: 1. ARCHFIENDS: The following rulings apply to "Vilepawn Archfiend", "Desrook Archfiend", "Shadowknight Archfiend", "Darkbishop Archfiend", "Infernalqueen Archfiend", "Terrorking Archfiend", and "Skull Archfiend of Lightning".
2. If you don't have enough Life Points to pay for an Archfiend, the Archfiend is destroyed and you don't pay the cost.
3. You roll a die for Archfiends when your opponent resolves an effect that targets the Archfiend, not when it is activated. If the activation or effect of a card that targets your Archfiend is negated by some other card, then you do not roll a die for the Archfiend.
4. If your Archfiend is targeted by "Barrel Dragon", roll a die for the Archfiend before flipping coins for "Barrel Dragon".
5. Rolling a die for an Archfiend cannot be chained to since you are resolving an effect.
6. The effect of rolling a die for an Archfiend is a Trigger Effect.
7. The effect of rolling a die for an Archfiend will be negated by "Skill Drain".
8. You can roll a die for an Archfiend during the Damage Step.

## Skull Conductor
[effect Level 4 DARK Zombie 2000/0] formats: edison
Text (Edison): If this card is face-up on the field at the end of the Battle Phase: Destroy this face-up card. You can send this card from your hand to the GY; Special Summon up to 2 Zombie monsters from your hand whose combined ATK is exactly 2000.
Edison rulings: ●You destroy this card during the End Step of the Battle Phase.
●Sending this card from your hand to the GY is a cost to activate its effect.
●If you activate this effect, you must Special Summon at least one Zombie.
●You can't activate the effect if you have no monsters to Special Summon.
●You can't Special Summon “King of the Skull Servants” or other monsters with ? ATK using this effect.
●The effect to destroy “Skull Conductor” also activates during your opponent’s Battle Phase.
●If “Skull Conductor” is face-down it won’t be destroyed at the end of the Battle Phase.
●You can Special Summon one monster with 2000 ATK or one monster with 2000 ATK and one monster with 0 ATK if you want.
●You look at the printed ATK of the monsters you want to Special Summon.

## Skull Dice
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Roll a six-sided die. All monsters your opponent currently controls lose ATK/DEF equal to the result x 100, until the end of this turn.

## Skull Flame
[effect Level 8 FIRE Zombie 2600/2000] formats: edison
Text (Edison): Once per turn, you can Special Summon 1 "Burning Skull Head" from your hand. You can't conduct your Battle Phase the turn you activate this effect. You can add 1 "Burning Skull Head" from your GY to your hand instead of conducting a normal draw in your Draw Phase.

## Skull Guardian
[ritual Ritual Level 7 LIGHT Warrior 2050/2500] formats: both
Text (Edison): This monster can only be Ritual Summoned with the Ritual Spell Card, "Novox's Prayer". You must also offer monsters whose total Level Stars equal 7 or more as a Tribute from the field or your hand.

## Skull Invitation
[trap Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Each time a card(s) is sent to the GY, inflict 300 damage to its owner for each card sent.
Goat text: Each time a card(s) is sent to the Graveyard, inflict 300 damage to its owner for each card sent.
Edison rulings: ●Cards that are Tributed or Discarded are included, because they are also sent to the GY.
●The effects of multiple Skull Invitation are cumulative.
●If Dark Hole destroys monsters controlled by both players, the damage from Skull Invitation is applied to both players simultaneously.
●If you draw the final piece of Exodia with Graceful Charity and have all 5 pieces of Exodia in your hand after discarding, you win the Duel even if the damage resulting from Skull Invitation would reduce your Life Points to 0.

## Skull Knight
[fusion Fusion Level 7 DARK Spellcaster 2650/2250] formats: both
Text (Edison): "Tainted Wisdom" + "Ancient Brain"

## Skull Knight 2
[effect Level 3 DARK Fiend 1000/1200] formats: edison
Text (Edison): If you Tribute Summon a Fiend monster by Tributing this monster, Special Summon 1 "Skull Knight 2" from your Deck. Then shuffle your Deck.
Rulings: 1. If you Tribute Set a high level Fiend-Type monster by Tributing this card, you CAN Special Summon another "Skull Knight #2" from your Deck and you do NOT have to reveal your Set monster to prove it is a Fiend-Type.
2. If you activate "Change of Heart" to control your opponent's "Skull Knight #2" and Tribute it to Tribute Summon a Fiend-Type monster you can Special Summon a "Skull Knight #2" from your Deck. But if you activate "Soul Exchange" to Tribute a "Skull Knight #2" on your opponent's side of the field, neither player can activate its effect.
3. If this card is used as a Tribute for a Special Summon, such as a Ritual Summon, the effect of this card is not activated.
4. If the Tribute Summon of a Fiend-Type monster is negated by "Solemn Judgment" or "Horn of Heaven", the effect of "Skull Knight #2" will not activate.
5. If the opponent chains "Torrential Tribute" to the effect of "Skull Knight #2", all monsters will be destroyed (including the Level 5 or higher Fiend-Type monster that was Tribute Summoned) and then "Skull Knight #2" will be Special Summoned from your Deck. If the opponent waits until the effect of "Skull Knight #2" resolves and another copy is Special Summo

## Skull Lair
[trap Continuous] formats: both
Text (Edison): Remove from play any number of Monster Cards in your GY to destroy 1 face-up monster on the field whose Level is equal to the number of the cards you removed from play.
Goat text: Remove from play any number of Monster Cards in your Graveyard to destroy 1 face-up monster on the field whose Level is equal to the number of the cards you removed from play.
Edison rulings: ●Removing Monster Cards in your GY from play is a cost to activate Skull Lair's Ignition effect.
●You can't destroy a face-down monster because its Level can't be determined.

## Skull-Mark Ladybug
[effect Level 4 EARTH Insect 500/1500] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When this card is sent to the GY, increase your LP by 1000 points.
Goat text: When this card is sent to the Graveyard, increase your Life Points by 1000 points.

## Skull Knight #2
[effect Level 3 DARK Fiend 1000/1200] formats: goat
Text: If you Tribute Summon a Fiend-Type monster by Tributing this monster, Special Summon 1 "Skull Knight #2" from your Deck. Then shuffle your Deck.

## Snake Deity's Command
[trap Counter] formats: edison
Text (Edison): Activate by showing your opponent 1 "Venom" monster in your hand. Negate the activation and effect of an opponent's Spell Card, and destroy it.
Edison rulings: ●Showing 1 “Venom” monster in your hand is a cost to activate this card.

## Snake Fang
[trap Normal] formats: both
Text (Edison): Decrease 1 selected monster's DEF by 500 points during the turn this card is activated.

## Snake Rain
[spell Normal] formats: edison
Text (Edison): Discard 1 card. Select 4 Reptile monsters from your Deck and send them to the GY.
Edison rulings: ●You can't activate this card if there are less than 4 Reptile-Type monsters in your Deck.
●If the number of Reptile-Type monsters in your Deck becomes less than 4 due to an effect chained to “Snake Rain”, you can't send any Reptile-Type monsters from your Deck to the GY when “Snake Rain” resolves.

## Snake Whistle
[trap Normal] formats: edison
Text (Edison): Activate only when a Reptile monster you control is destroyed. Special Summon 1 Level 4 or lower Reptile monster from your Deck.
Edison rulings: ●This card can be activated when a Reptile-Type monster you control is destroyed by a Spell, Trap, or Monster effect. Snake Whistle can't be activated in the Damage Step.
●You can only activate this card if the Reptile-Type monster’s destruction is the last thing to occur in a chain. This is similar to the activation timing for both “Dark Magician of Chaos” and “Peten the Dark Clown.”
●You can't activate this card when a Reptile-Type monster that is being treated as a Spell Card (by Relinquished, etc.) is destroyed.
●You can activate this card when your opponent's Reptile-Type monster you control (with Brain Control, etc.) is destroyed and sent to their GY.
●You can activate this card when a Reptile-Type monster you control is destroyed and removed from by (by Bottomless Trap Hole, etc.)
●You can't activate this card if you have no Level 4 or lower Reptile-Type monsters in your Deck.

## Sonic Bird
[effect Level 4 WIND Winged Beast 1400/1000] formats: both
Text (Edison): When this card is Normal or Flip Summoned: You can add 1 Ritual Spell from your Deck to your hand.

## Sonic Chick
[effect Level 1 EARTH Winged Beast 300/300] formats: edison
Text (Edison): can't be destroyed by battle with a monster that has 1900 or more ATK.

## Sonic Jammer
[effect Flip Effect Level 2 WIND Machine 350/650] formats: both
Text (Edison): FLIP: Your opponent can't activate any Spell Cards until the end of the End Phase of the next turn.
Goat text: FLIP: Your opponent cannot activate any Spell Cards until the end of the End Phase of the next turn.
Edison rulings: ●If you activate Sonic Jammer during your turn, it lasts until the end of your opponent's End Phase. If you activate Sonic Jammer during your opponent's turn, it lasts until the end of your End Phase.
●If Skill Drain is activated after Sonic Jammer's effect has resolved, the effect of Sonic Jammer is not negated because Skill Drain was not active when Sonic Jammer was flipped, activated its effect, and applied its effect.
●While Sonic Jammer's effect is applied, your opponent can still use the effects of Wave Motion Cannon, or Black Pendant when sent to the GY, or Field Spell Cards like Fusion Gate.
●While Sonic Jammer's effect is applied, your opponent can't activate Spiritualism.

## Sonic Shooter
[effect Level 4 WIND Winged Beast 1300/600] formats: edison
Text (Edison): If there are no cards in your opponent's Spell & Trap Zone, this card can attack your opponent directly. If it does, the battle damage inflicted to your opponent is the original ATK of this card.

## Soul Absorption
[spell Continuous] formats: both
Text (Edison): If a card(s) is banished: Gain 500 LP for each.
Edison rulings: ●Soul Absorption's effect is based on the number of cards, not on each lump sum of cards. So if 3 DARK monsters are removed from the GY to Special Summon Dark Necrofear, the controller of Soul Absorption gains 1500 Life Points.
●However, you receive the Life Points from Soul Absorption as a lump sum, so in the case of Dark Necrofear you gain 1500 Life Points but your Fire Princess would only do 500 points of damage.
●Soul Absorption is a trigger Continuous Spell Card, not a continuous Continuous Spell Card, so activate its effect after the current chain resolves that includes removing cards from play.
●The effect of Soul Absorption can, itself, be chained to after it activates.
●If Soul Absorption's effect activates in response to the Special Summon of a monster like Dark Necrofear or Inferno, Soul Absorption's effect activates after the monster is Special Summoned.
●For Chaosrider Gustapth, activate Soul Absorption's effect after Chaosrider Gustaph's effect resolves.
●Your Soul Absorption's effect activates even when your opponent's cards are removed.

## Soul Demolition
[trap Continuous] formats: both
Text (Edison): You can only activate this card's effect when you have a Fiend monster on your side of the field. Pay 500 LP to use this effect. Both players select 1 Monster Card from their opponent's GY. Remove the selected cards from play.
Goat text: You can only activate this card's effect when you have a Fiend-Type monster on your side of the field. Pay 500 Life Points to use this effect. Both players select 1 Monster Card from their opponent's Graveyard. Remove the selected cards from play.
Edison rulings: ●If either player has no monsters in their GY, the effect of this card can't be activated.
●If Kycoo the Ghost Destroyer is on the field, the effect of this card can't be activated.
●Paying 500 Life Points is a cost.
●You must select the monster in the GY you wish to target when you activate this card’s effect. You select before the opponent does. After you select the opponent may chain, with a card like Dust Tornado, to destroy Soul Demolition. In this case its effect won't resolve and no monsters will be removed. This is because it is a Continuous Trap Card and it must remain on the field for its effect to resolve. If the effect is negated you don't get a refund of the 500 Life Point cost.
●If the opponent chains to the effect of Soul Demolition with an effect that destroys all the Fiend-Type monsters on your side of the field, the effect of Soul Demolition resolves because the activation conditions were correct at the time.
●If you chain the effect of Soul Demolition to Monster Reborn and remove the monster targeted by Monster Reborn from play, the effect of Monster Reborn disappears.

## Soul Devouring Bamboo Sword
[spell Continuous] formats: edison
Text (Edison): Select 1 monster equipped with a "Bamboo Sword" Equip Spell Card. If it inflicts Battle Damage to your opponent while equipped with a "Bamboo Sword" card, they skip their next Draw Phase. Destroy this card during your second Standby Phase after activation.
Edison rulings: ●“Soul Devouring Bamboo Sword” targets the selected monster that is equipped with “Bamboo Sword”.
●The effect of “Soul Devouring Bamboo Sword” that causes the opponent to skip their next Draw Phase activates at the time the selected monster inflicts Battle Damage. This effect begins a Chain.
●If a “Bamboo Sword” equip card is no longer equipped to the selected monster, the effect of “Soul Devouring Bamboo Sword” no longer activates when the selected monster inflicts Battle Damage. The effect that destroys “Soul Devouring Bamboo Sword” during the second Standby Phase after activation is still applied.
●The effect that destroys “Soul Devouring Bamboo Sword” during the second Standby Phase after it was activated does not begin a Chain.

## Soul of Fire
[spell Normal] formats: edison
Text (Edison): Your opponent draws 1 card. Select 1 Pyro monster from your Deck and remove it from play. Inflict damage to your opponent equal to half the ATK of the removed monster. If you activate this card, you can't declare an attack this turn.
Edison rulings: ●“Your opponent draws 1 card” is not a cost to activate this card. It is part of the effect.
●You can't activate Soul of Fire if there are no Pyro-Type Monsters remaining in your Deck.

## Soul of Purity and Light
[effect Level 6 LIGHT Fairy 2000/1800] formats: both
Text (Edison): Ⓢ Cannot be Normal Summoned/Set.
Ⓢ Must first be Special Summoned by banishing 2 LIGHTs from your GY.
① Monsters your opponent controls lose 300 ATK during their Battle Phase only.
Goat text: This card cannot be Normal Summoned or Set. This card can only be Special Summoned by removing from play 2 LIGHT monsters in your Graveyard. All monsters your opponent controls lose 300 ATK during their Battle Phase only.
Edison rulings: ● If this card was initially Special Summoned by its own procedure (and the Summon wasn't negated), it can later be summoned by card effects.

## Soul of the Pure
[spell Normal] formats: both
Text (Edison): Increase your LP by 800 points.
Goat text: Increase your Life Points by 800 points.

## Soul Resurrection
[trap Continuous] formats: both
Text (Edison): Activate this card by targeting 1 Normal Monster in your GY; Special Summon it in Defense Position. When this card leaves the field, destroy that monster. When that monster is destroyed, destroy this card.
Goat text: Activate this card by targeting 1 Normal Monster in your Graveyard; Special Summon it in Defense Position. When this card leaves the field, destroy that monster. When that monster is destroyed, destroy this card.

## Soul Reversal
[spell Quick-Play] formats: both
Text (Edison): Return 1 Flip Effect Monster from your GY to the top of your Deck.
Goat text: Return 1 Flip Effect Monster from your Graveyard to the top of your Deck.
Edison rulings: ●Soul Reversal's effect targets.

## Soul Rope
[trap Normal] formats: edison
Text (Edison): When a monster you control is destroyed by a card effect and sent to the GY (except during the Damage Step): Pay 1000 LP; Special Summon 1 level 4 monster from your Deck.
Edison rulings: You can't use this card in the Damage Step (so you can't activate it when a monster is destroyed by battle).

## Soul-Absorbing Bone Tower
[effect Level 3 DARK Zombie 400/1500] formats: both
Text (Edison): If you control another Zombie monster, your opponent can't target this card for attacks. Each time a Zombie monster(s) is Special Summoned: Send the top 2 cards of your opponent's Deck to the GY.
Goat text: If you control another Zombie-Type monster, your opponent cannot target this card for attacks. Each time a Zombie-Type monster(s) is Special Summoned: Send the top 2 cards of your opponent's Deck to the Graveyard.
Edison rulings: ●If you have a Soul-Absorbing Bone Tower equipped with Raregold Armor and a Zombie-Type monster, your opponent can't attack. Even if you have a Zombie-Type monster, Gemini Elf, and a Soul-Absorbing Bone Tower equipped with Raregold Armor, your opponent can't attack.
●If you have another Zombie-Type monster and Soul-Absorbing Bone Tower, your opponent can't attack the Soul-Absorbing Bone Tower, but if you equip the Soul-Absorbing Bone Tower with Ring of Magnetism your opponent can declare an attack but must attack the Soul-Absorbing Bone Tower equipped with the Ring of Magnetism.
●If you have multiple Soul-Absorbing Bone Towers and no other monsters, your opponent can't attack.
●When your opponent attacks your Soul-Absorbing Bone Tower and during the Battle Step you activate Call of the Haunted to Special Summon another Zombie-Type monster, then a replay occurs (and you send 2 cards from your opponent's Deck to the GY).
●If DNA Surgery is in play changing all monsters to Zombie-Types, and a monster that was not originally a Zombie-Type is Special Summoned, Soul-Absorbing Bone Tower's effect is applied and you send 2 cards from your opponent's Deck to the GY.
●If a Zombie-Type monster is Special Summoned on your opponent's side of the field, Soul-Absorbing Bone Tower's effect activates.
●If a Zombie-Type monster is Special Summoned face-down (with The Shallow Grave, etc.) then Soul-Absorbing Bone Tower's effect does not activate.
●If multiple Zombie-Type monsters are Special Su
