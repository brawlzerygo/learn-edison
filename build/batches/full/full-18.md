# Full pool batch 18: 60 cards. Write js/cards/full-18.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Vampire Baby
[effect Level 3 DARK Zombie 700/1000] formats: both
Text (Edison): At the end of the Battle Phase, if this card destroyed a monster by battle and sent it to the GY this turn: You can Special Summon that monster to your side of the field.
Goat text: At the end of the Battle Phase, if this card destroyed a monster by battle and sent it to the Graveyard this turn: You can Special Summon that monster to your side of the field.

## Vampire Genesis
[effect Level 8 DARK Zombie 3000/2100] formats: both
Text (Edison): Cannot be Normal Summoned/Set. Must be Special Summoned (from your hand) by banishing 1 "Vampire Lord" you control, and Cannot be Special Summoned by other ways. Once per turn: You can discard 1 Zombie monster to the GY, then target 1 Zombie monster in your GY with a Level less than the discarded Zombie monster's; Special Summon that target.
Goat text: Cannot be Normal Summoned/Set. Must be Special Summoned (from your hand) by banishing 1 "Vampire Lord" you control, and cannot be Special Summoned by other ways. Once per turn: You can discard 1 Zombie-Type monster to the Graveyard, then target 1 Zombie-Type monster in your Graveyard with a Level less than the discarded Zombie-Type monster's; Special Summon that target.

## Vampire Lady
[effect Level 4 DARK Zombie 1550/1550] formats: both
Text (Edison): When this card inflicts battle damage to your opponent: Declare 1 card type (Monster, Spell, or Trap); your opponent sends 1 card of that type from their Deck to the GY.
Goat text: When this card inflicts battle damage to your opponent: Declare 1 card type (Monster, Spell, or Trap); your opponent sends 1 card of that type from their Deck to the Graveyard.

## Vampire Lord
[effect Level 5 DARK Zombie 2000/1500] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card inflicts battle damage to your opponent: Declare 1 type of card (Monster, Spell, or Trap); your opponent sends 1 card of that type from their Deck to the GY. Once per turn, during your next Standby Phase after this card in your possession was destroyed and sent to your GY by an opponent's card effect: Special Summon this card from the GY.
Rulings: 1. Your "Vampire Lord" will only be Special Summoned by his own effect when destroyed and sent to the GY by a card effect that your opponent controls, not by your own card effects or as a result of battle.
2. "Vampire Lord" will only return to play with his effect when the owner controls it, because "Vampire Lord" must be 'destroyed and sent to YOUR GY'.
3. When your opponent takes control of your "Vampire Lord", and it inflicts Battle Damage to your Life Points, then the first effect of "Vampire Lord" is activated. But the second effect will not be activated if "Vampire Lord" is destroyed and sent to the GY while your opponent controls him.
4. If you Summon "Vampire Lord" (except by its effect) and he is destroyed by your opponent's "Horn of Heaven" or "Solemn Judgment", "Vampire Lord" will be Special Summoned in your next Standby Phase. When it is Special Summoned by its own effect "Horn of Heaven" or "Solemn Judgment" cannot be activated, because it is being Summoned by its own Trigger Effect, not by a built-in 'this is how you Summon this monster' effect.
5. When "Vampire Lord" is destroyed (by a card effect) while in your hand, in your Deck, or on the field, he will be Special

## Vengeful Bog Spirit
[spell Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Monsters can't attack the turn they are Summoned.
Goat text: Monsters cannot attack the turn they are Summoned.

## Vengeful Servant
[spell Equip] formats: edison
Text (Edison): When control of the equipped monster changes, inflict damage equal to its original ATK to its new controller.
Edison rulings: ●The effect of “Vengeful Servant” starts a chain when control of the monster switches.
●If a Continuous Effect would destroy the equipped monster first (example: an equipped “Thunder Nyan Nyan” switches sides and is destroyed immediately), then the effect of “Vengeful Servant” does not activate and it does not inflict damage.
●If “Remove Brainwashing” is active and a monster equipped with “Vengeful Servant” switches sides, that monster immediately switches back to the original controller.
●The effect of “Vengeful Servant” then starts a chain (and only activates once, in this case) and the original controller of the monster takes damage.

## Vengeful Shinobi
[effect Level 2 DARK Warrior 400/800] formats: edison
Text (Edison): If this Attack Position card is targeted for an attack: Draw 1 card.
Edison rulings: ●Vengeful Shinobi's effect is a Trigger Effect.
●If an effect is Chained to Vengeful Shinobi's effect, and changes it to Defense Position or removes it from the field, you still draw a card.

## Wall of Illusion
[effect Level 4 DARK Fiend 1000/1850] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card is attacked by a monster, after damage calculation: Return that monster to the hand.
Edison rulings: ●If the monster battling with Wall of Illusion is somehow destroyed during Damage Calculation, it is sent to the GY and NOT returned to the owner’s hand.

## Wall of Ivy
[effect Flip Effect Level 2 EARTH Plant 300/1200] formats: edison
Text (Edison): FLIP: Special Summon 1 "Ivy Token" (Plant/EARTH/Level 1/ATK 0/DEF 0) in Defense Position to your opponent's side of the field. When this Token is destroyed, its controller takes 300 damage.
Edison rulings: ●“Ivy Token’s” effect to inflict damage does not start a Chain.
●If the Ivy Token is destroyed by a card effect, inflict damage after the effect resolves. If the Ivy Token is destroyed by battle, inflict damage at the end of the Damage Step, when monsters destroyed by battle are sent to the GY.
●If Remove Brainwashing or Owner's Seal is activated, control of the Ivy Token is shifted to the player that activated Wall of Ivy's effect.

## Wall of Thorns
[trap Normal] formats: edison
Text (Edison): When a Plant monster you control is targeted for an attack: Destroy all Attack Position monsters your opponent controls.

## Wall Shadow
[effect Level 7 DARK Warrior 1600/3000] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Cannot be Normal Summoned/Set. Must first be Special Summoned with "Magical Labyrinth".

## Warrior Elimination
[spell Normal] formats: edison
Text (Edison): Destroy all Warrior monsters on the field.

## Warrior Lady of the Wasteland
[effect Level 4 EARTH Warrior 1100/1200] formats: edison
Text (Edison): When this card is destroyed by battle and sent to the GY: You can Special Summon 1 EARTH Warrior monster with 1500 or less ATK from your Deck, in Attack Position.

## Warrior of Tradition
[fusion Fusion Level 6 EARTH Warrior 1900/1700] formats: both (Goat already has a goat-only script in a goat file: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Sonic Maid" + "Beautiful Headhuntress"

## White Dragon Ritual
[spell Ritual] formats: both
Text (Edison): This card is used to Ritual Summon "Paladin of White Dragon". You must also Tribute monsters from your hand or field whose total Levels equal 4 or more.

## White Hole
[trap Normal] formats: both
Text (Edison): When your opponent activates "Dark Hole": Monsters you control can't be destroyed by that "Dark Hole's" effect.
Goat text: When your opponent activates "Dark Hole": Monsters you control cannot be destroyed by that "Dark Hole's" effect.

## White Magical Hat
[effect Level 3 LIGHT Spellcaster 1000/700] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When this card inflicts Battle Damage to your opponent's LP, your opponent discards 1 card randomly from his/her hand.
Goat text: When this card inflicts Battle Damage to your opponent's Life Points, your opponent discards 1 card randomly from his/her hand.

## White Magician Pikeru
[effect Level 2 LIGHT Spellcaster 1200/0] formats: both
Text (Edison): During your Standby Phase, increase your LP by 400 points for each monster on your side of the field.
Goat text: During your Standby Phase, increase your Life Points by 400 points for each monster on your side of the field.
Edison rulings: ●Monster tokens and face-down monsters are included for White Magician Pikeru's effect.
●Even if there are many monsters, White Magician Pikeru increases Life Points by 1 lump sum.
●White Magician Pikeru includes itself in its effect.
●If you resolve White Magician Pikeru's effect and then in the same Standby Phase the number of monsters on the field increases, you don't get additional Life Points.

## White Night Dragon
[effect Level 8 WATER Dragon 3000/2500] formats: edison
Text (Edison): ① If a Spell/Trap Card that targets this card is activated (Quick): 
Negate the activation, and if you do, destroy it.
② If another face-up monster you control is targeted for an attack: 
You can send 1 Spell/Trap you control to the GY; change the attack target to this card.
Edison rulings: ● The ① effect is mandatory.

## White Ninja
[effect Flip Effect Level 4 LIGHT Warrior 1500/800] formats: both
Text (Edison): FLIP: Target 1 Defense Position monster on the field; destroy that target.

## White Potan
[effect Level 1 LIGHT Fairy 100/200] formats: edison
Text (Edison): If you control a face-up Tuner monster, this card can't be destroyed by battle. When a face-up Tuner monster you control is destroyed by battle and sent to the GY, inflict 500 damage to your opponent.
Edison rulings: ●If “White Potan” becomes a Tuner, it can't be destroyed by battle.
●If a monster being treated as a Tuner is destroyed by battle and sent to the GY, it is not considered a Tuner in the GY, and the effect of “White Potan” to inflict damage won't activate.

## White-Horned Dragon
[effect Level 6 DARK Dragon 2200/1400] formats: edison
Text (Edison): When this card is Normal or Special Summoned: Target up to 5 Spell Cards in your opponent's GY; banish those target(s), and if you do, this card gains 300 ATK for each card banished by this effect.

## Wicked-Breaking Flamberge - Baou
[spell Equip] formats: both
Text (Edison): Send 1 card from your hand to the GY, then target 1 monster on the field; equip this card to that target. It gains 500 ATK. Negate the effects of opponent's monsters destroyed by battle with the equipped monster.
Edison rulings: ●Sending 1 card to the GY is a cost. This is not discarding so it doesn't trigger Forced Requisition, and you can pay the cost even if Goblin of Greed is in play.
●If a monster equipped with Wicked-Breaking Flamberge - Baou attacks and destroys Amazoness Fighter or Amazoness Swordswoman, their effects are not negated because they happen during damage calculation, before they are determined to have been destroyed.

## Winged Kuriboh
[effect Level 1 LIGHT Fairy 300/200] formats: both
Text (Edison): If this card on the field is destroyed and sent to the GY: For the rest of this turn, you take no battle damage.
Goat text: If this card on the field is destroyed and sent to the Graveyard: For the rest of this turn, you take no battle damage.
Edison rulings: ●If “Winged Kuriboh” is destroyed as a result of battle, its effect won't reduce the Battle Damage its owner takes from that battle, because its effect doesn’t activate until later, when it’s sent to the GY. (And damage calculation has already happened by then.)
●If “Winged Kuriboh” is destroyed and sent to the GY, its effect activates and applies for the rest of the turn, even if “Winged Kuriboh” is removed from play with “Disappear”, or shuffled back into the Deck with “Fiber Jar”.
●Because the effect of “Winged Kuriboh” activates in the GY, it won't be negated by “Skill Drain” but it will be negated by “The End of Anubis”.
●Because the effect of “Winged Kuriboh” activates in the GY, it is the original owner that will get the effect. So if the opponent took control with “Change of Heart” or “Snatch Steal”, if it is destroyed then it goes to the original owner’s GY and they get the effect.
●When “Winged Kuriboh” is destroyed and sent to the GY, the activation of its effect can be chained to.
●After the effect of “Winged Kuriboh” resolves, the application of the effect (making Battle Damage zero) does not start a chain and can't be chained to.
●If “Winged Kuriboh” is treated as an Equip Card (like if it’s equipped to “Relinquished”) and it’s destroyed and sent to the GY, its effect still activates.
●If your opponent takes control of your “Winged Kuriboh” and when it tries to return to your control you have no open Monster Card Zones, “Winged Kuriboh” is destroyed and sent to 

## Winged Kuriboh LV10
[effect Level 10 LIGHT Fairy 300/200] formats: edison
Text (Edison): Cannot be Normal Summoned/Set. Must be Special Summoned with "Transcendent Wings". During your opponent's Battle Phase (Quick Effect): You can Tribute this face-up card; destroy as many Attack Position monsters your opponent controls as possible, and if you do, inflict damage to your opponent equal to the combined original ATK of those destroyed monster(s).
Edison rulings: ●“Winged Kuriboh LV10's” effect is a Quick Effect. You can't activate this effect during the Damage Step.
●The Quick Effect of “Winged Kuriboh LV10”can be chained to. You can chain “Barrel Behind the Door” or “My Body as a Shield” to the effect.
●Tributing “Winged Kuriboh LV10” is a cost to activate its effect.
●The “combined original ATK” of the destroyed monsters is calculated after the monsters are destroyed and are no longer on the field. So a destroyed “King of the Skull Servants” would add 0 damage to this effect, and a destroyed “Fusilier Dragon – the Dual Mode Beast” that was Summoned without Tribute would add 2800 damage.
●You can't activate “Level Up!” to send “Winged Kuriboh LV10” to the GY because it does not have a monster’s name in its text.
●You may return “Winged Kuriboh LV10” from your GY to your Deck with the effect of “The GY in the Fourth Dimension”.
●If an opponent’s monster can't be destroyed by the effect of “Winged Kuriboh LV10”, no damage is dealt for that monster’s ATK. For example, if “Master Monk” targeted by “Lone Wolf” is on the field, it is unaffected by monster effects, so it won't be destroyed and its 1900 original ATK points won't be inflicted to its controller.
●You can activate the effect of “Winged Kuriboh LV10” if “Skill Drain” is on the field, and its effect will resolve normally and not be negated, because it is no longer a face-up monster on the field.

## Winged Kuriboh LV9
[effect Level 9 LIGHT Fairy 0/0] formats: edison
Text (Edison): Activate only as Chain Link 3 or higher (Quick Effect): You can Special Summon this card from your hand. Spell Cards that have been activated are banished instead of being sent to the GY. The ATK/DEF of this card are each equal to the number of Spells in your opponent's GY x 500. You can only control 1 "Winged Kuriboh LV9".

## Winged Minion
[effect Level 2 DARK Fiend 700/700] formats: both
Text (Edison): Tribute this face-up card. Select 1 face-up Fiend monster on the field. Increase the ATK and DEF of the monster by 700 points as long as it remains face-up on the field.
Goat text: Tribute this face-up card. Select 1 face-up Fiend-Type monster on the field. Increase the ATK and DEF of the monster by 700 points as long as it remains face-up on the field.
Edison rulings: ●If the Fiend-Type monster that received the ATK and DEF increase from this card’s effect is flipped face-down, the effect is reset and the ATK and DEF return to the original amounts.
●You may Tribute two Winged Minions to increase the ATK and DEF of a Fiend-Type monster by 1400 points.
●If the Fiend-Type monster that was selected for this card’s effect is changed into a different Type, by the effect of DNA Surgery for example, it retains the 700 point ATK and DEF increase.

## Winged Rhynos
[effect Level 4 WIND Beast-Warrior 1800/500] formats: edison
Text (Edison): During either player's turn, when a Trap Card is activated (except during the Damage Step): You can return this face-up card from the field to the hand.
Edison rulings: ●This effect can't be chained to the activation of the effect of an already face-up Continuous Trap Card, like Ultimate Offering. It can only be chained when a Trap Card itself is activated (ie., flipped face-up).
●This effect is a Spell Speed 2 Quick Effect. Therefore, it can't be chained to the activation of a Counter Trap Card.
●This effect can be activated multiple times in the same chain, but only once for each Trap Card activated.

## Winged Sage Falcos
[effect Level 4 WIND Winged Beast 1700/1200] formats: both
Text (Edison): When this card destroys an opponent's Attack Position monster by battle and sends it to their GY: You can place that monster on top of their Deck.
Goat text: When this card destroys an opponent's face-up Attack Position monster by battle and sends it to their Graveyard: You can place that monster on top of their Deck.

## Witch Doctor of Chaos
[effect Flip Effect Level 2 DARK Spellcaster 500/500] formats: both
Text (Edison): FLIP: Select 1 Monster Card from you or your opponent's GY. Remove it from play.
Goat text: FLIP: Select 1 Monster Card from you or your opponent's Graveyard. Remove it from play.

## Witch Doctor of Sparta
[effect Level 4 EARTH Spellcaster 400/2000] formats: edison
Text (Edison): Inflict 500 damage to your opponent each time a monster(s) is Special Summoned from either player's Deck.
Edison rulings: ●If 2 or more monsters are Special Summoned by the same effect, “Witch Doctor of Sparta’s” effect will only activate once and it will inflict 500 points of damage.

## Witch of the Black Forest
[effect Level 4 DARK Spellcaster 1100/1200] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card is sent from the field to the GY: Add 1 monster with 1500 or less DEF from your Deck to your hand, but you can't activate cards, or the effects of cards, with that name for the rest of this turn. You can only use this effect of "Witch of the Black Forest" once per turn.
Goat text: If this card is sent from the field to the GY: Add 1 monster with 1500 or less DEF from your Deck to your hand, but you cannot activate cards, or the effects of cards, with that name for the rest of this turn. You can only use this effect of "Witch of the Black Forest" once per turn.
Edison rulings: ●You must show your opponent the monster you select from your Deck for this card’s effect. If you have no eligible monsters, your opponent gets to see your Deck to verify.
●The effect of Witch of the Black Forest only activates when she is sent from the field to the GY, not from your hand/Deck, and not if she is removed from play.
●If the Summon of this card is negated with Horn of Heaven or Solemn Judgment you don't get its effect.
●If you control your opponent’s Witch of the Black Forest and it is destroyed, your opponent gets the effect since it activates in his/her GY.
●You can chain to the activation of Witch of the Black Forest’s effect.

## 3-Hump Lacooda
[effect Level 3 EARTH Beast 500/1500] formats: both
Text (Edison): ① If you control 3 "3-Hump Lacooda": 
You can tribute 2 "3-Hump Lacooda"; draw 3 cards.
Rulings: 1. The effect of "3-Hump Lacooda" is an Ignition Effect.
2. You don't have to activate the effect of "3-Hump Lacooda" just because you have 3 copies in play.
3. You can choose which of the "3-Hump Lacooda" that you activate the effect of; it can be one of the ones you are Tributing or the one that is remaining on the field.
4. Tributing 2 copies of "3-Hump Lacooda" is a cost.
5. If your opponent chains "Ring of Destruction" or "Book of Moon" to the activation of the effect of "3-Hump Lacooda", the effect is not negated.
6. If you Summon your third "3-Hump Lacooda", you can activate its effect before your opponent activates "Torrential Tribute".

## 4-Starred Ladybug of Doom
[effect Flip Effect Level 3 WIND Insect 800/1200] formats: both
Text (Edison): FLIP: Destroy all Level 4 monsters your opponent controls.

## 7
[spell Continuous] formats: both
Text (Edison): When there are 3 face-up "7" cards on your side of the field, draw 3 cards from your Deck. Then destroy all "7" cards. When this card is sent directly from the field to your GY, increase your LP by 700 points.
Goat text: When there are 3 face-up "7" cards on your side of the field, draw 3 cards from your Deck. Then destroy all "7" cards. When this card is sent directly from the field to your Graveyard, increase your Life Points by 700 points.
Rulings: 1. If you have 3 copies of "7" and destroy them all, you get 2100 Life Points.
2. If your opponent also has copies of "7", they are also destroyed.
3. If you have 3 copies of "7" and activate their effect, your opponent can chain "Imperial Order" to negate the effect.
4. Each effect of "7" that gives you 700 Life Points goes on a chain, so if multiple copies of "7" are sent to the GY simultaneously, each effect is 1 step of the chain.
5. If other cards are also sent to the GY at the same time, like "Sangan" or "Black Pendant", the card controlled by the turn player is Step 1.
6. If your 3rd "7" is activated, but destroyed by "Mystical Space Typhoon" in a chain, you can't activate its effect, but you still gain 700 Life Points for its GY effect.

## 7 Completed
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Activate this card by choosing ATK or DEF; equip only to a Machine monster. It gains 700 ATK or DEF, depending on the choice.

## 8-Claws Scorpion
[effect Level 2 DARK Insect 300/200] formats: both
Text (Edison): ① Once per turn: You can Set this card.
② If this card attacks a Set monster, during Damage Calculation: 
This card's ATK becomes 2400 until the end of Damage Calculation.
Edison rulings: ● This card's ① effect can only be used once per turn.
(It "remembers" if it used this effect even after being Set).

## Abare Ushioni
[effect Level 4 EARTH Beast-Warrior 1200/1200] formats: both
Text (Edison): Once per turn, you can toss a coin and call it. If you call it right, inflict 1000 damage to your opponent. If you call it wrong, you take 1000 damage.
Edison rulings: ●The 
●If you call the coin toss wrong for “Abare Ushioni” you can still prevent the damage with “Pikeru’s Circle of Enchantment”, etc.
●You can't chain “Barrel Behind the Door” to the effect of “Abare Ushioni” because you don’t know yet if you will take damage or not from the effect.

## Absolute End
[trap Normal] formats: both
Text (Edison): Activate only during your opponent's turn. This turn, the attacks from your opponent's monsters become direct attacks.
Edison rulings: Activate only during your opponent's turn. This turn, the attacks from your opponent's monsters become direct attacks.
●When Absolute End is activated during an attack, that attack becomes a direct attack.
●If Taunt and Absolute End are both active, the attack becomes a direct attack to your Life Points. This is because the attack target is the monster selected by Taunt, but then Absolute End turns it into a direct attack.

## Absorbing Kid from the Sky
[effect Level 4 LIGHT Fairy 1300/1000] formats: both
Text (Edison): When this card destroys a monster and sends it to the GY as a result of battle, increase your LP by the Level of the destroyed monster x 300 points.
Goat text: When this card destroys a monster and sends it to the Graveyard as a result of battle, increase your Life Points by the Level of the destroyed monster x 300 points.
Edison rulings: ●The 
●This effect activates in Substep 7 - End of the Damage Step.
●This card must be face-up on the field to activate this effect.
●The Level is the original Level printed on the card.

## Abyss Soldier
[effect Level 4 WATER Aqua 1800/1300] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① Once per turn: You can discard 1 WATER to the GY, then target 1 card on the field; return it to the hand.
Goat text: Once per turn: You can discard 1 WATER monster to the Graveyard to target 1 card on the field; return it to the hand.

## Abyssal Designator
[spell Normal] formats: both
Text (Edison): Pay 1000 LP. Declare a Type and an Attribute. Your opponent must send 1 monster with both the declared Type and Attribute from their hand/Deck to the GY.
Goat text: Pay 1000 Life Points. Declare a Type and an Attribute. Your opponent must send 1 monster with both the declared Type and Attribute from their hand or Deck to the Graveyard.
Edison rulings: Pay 1000 Life Points. Declare a Type and an Attribute. Your opponent must send 1 monster with both the declared Type and Attribute from their hand/Deck to the GY.
●If your opponent sends a monster to the GY with the declared Type and Attribute, you can't see their hand and Deck. But if they claim to have no such card, you can check their hand and Deck to confirm.

## Acid Rain
[spell Normal] formats: both
Text (Edison): Destroy all face-up Machine monsters on the field.
Goat text: Destroy all face-up Machine-Type monsters on the field.

## Acid Trap Hole
[trap Normal] formats: both
Text (Edison): Target 1 face-down Defense Position monster on the field; flip it face-up, then destroy it if its DEF is 2000 or less, or return it face-down if its DEF is more than 2000.
Edison rulings: Select 1 face-down Defense Position monster. Flip it face-up, and if the DEF of the monster is 2000 points or less, destroy the monster. If the DEF is more than 2000 points, return the monster to face-down Defense Position.
●A face-down Jinzo will be destroyed by this card.
●If the monster flipped face-up has an effect that changes its DEF, such as Enraged Muka Muka, calculate the current DEF, then determine if it will be destroyed or flipped back face-down. So if you had 4 cards in your hand, Enraged Muka Muka would not be destroyed.
●If the targeted monster has a Flip Effect, that Effect is activated whether the DEF is greater than 2000 or not. If the DEF of the selected monster is 2000 or less, such as a Hane-Hane, it can't select itself for its Flip Effect since it is destroyed.

## Adhesion Trap Hole
[trap Normal] formats: both
Text (Edison): When your opponent Summons a monster(s): Halve that monster(s)'s original ATK.
Edison rulings: Activate only when your opponent Summons a monster
●Adhesion Trap Hole works against a monster or monsters, so Adhesion Trap Hole does NOT target.
●When Cyber Jar is activated, you may use Adhesion Trap Hole against all monsters your opponent Special Summons in Attack Position, but Adhesion Trap Hole has no effect on any monsters your opponent Special Summons face-down.
●Adhesion Trap Hole can't affect monsters Special Summoned face-down with The Shallow Grave, Morphing Jar #2, etc.
●If a monster affected by Adhesion Trap Hole is flipped face-down (with Book of Moon, etc.), Adhesion Trap Hole's effect disappears and the monster's ATK is back to normal.
●Adhesion Trap Hole halves the original ATK, so if you activate another effect that alters ATK, halve the original ATK first and then resolve the other ATK-modifying effect.
●If a monster affected by Adhesion Trap Hole is then equipped with Megamorph, only Megamorph's effect applies.

## After the Struggle
[spell Normal] formats: both
Text (Edison): This card can only be activated during Main Phase 1. All monsters on both sides of the field that have been involved in damage calculation are destroyed during the End Step of the turn.
Edison rulings: This card can only be activated during Main Phase 1. All monsters on both sides of the field that have been involved in damage calculation are destroyed during the End Step of the turn.
●This card's title has been changed to After the Struggle. If you have a card titled After Genocide its name is treated as After the Struggle.
●Even if the Battle Damage is reduced to 0 by the effect of Waboku, Kuriboh, Sanga of the Thunder, etc., both the attacking and defending monster are still destroyed during the End Step by this card’s effect.
●If you activate After the Struggle, even a monster that performs a direct attack will be destroyed by this card’s effect during the End Step.
●Note that After the Struggle will destroy monsters during the End Step, not the End Phase.

## Agido
[effect Level 4 EARTH Fairy 1500/1300] formats: both
Text (Edison): When this card is destroyed and sent to the GY as a result of battle, roll a six-sided die. You can Special Summon 1 Fairy monster from your GY whose Level is equal to the number rolled. (If the result is 6, you can Special Summon a Level 6 or higher monster.)
Goat text: When this card is destroyed and sent to the Graveyard as a result of battle, roll a six-sided die. You can Special Summon 1 Fairy-Type monster from your Graveyard whose Level is equal to the number rolled. (If the result is 6, you can Special Summon a Level 6 or higher monster.)
Edison rulings: ●The 
●This effect activates in Substep 7 - End of the Damage Step.
●Agido can Special Summon itself.
●This effect does not target.

## Airknight Parshath
[effect Level 5 LIGHT Fairy 1900/1400] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card attacks a Defense Position monster, inflict piercing battle damage. If this card inflicts battle damage to your opponent: Draw 1 card.
Edison rulings: ●The 
●This effect won't apply if Total Defense Shogun attacks this card from Defense Position.
●The mandatory Trigger Effect activates & resolves on the field.
●This effect activates in Substep 5 - After Damage Calculation.
●Drawing a card is not optional. You must draw 1 card any time Airknight Parshath inflicts Battle Damage to the opponent’s Life Points. This includes direct attacks, and when it battles with a monster with a lower ATK or DEF.
●If the opponent activates Waboku or Kuriboh to reduce the Battle Damage to 0, you don't draw.
●When Airknight Parshath attacks a face-down monster with a Flip Effect and inflicts Battle Damage, you draw 1 card before the Flip Effect is activated (in Substep 6 - Resolve Effects).

## Altar for Tribute
[trap Normal] formats: both
Text (Edison): Select 1 monster on your side of the field and send it to the GY. Increase your LP by an amount equal to the original ATK of the monster.
Goat text: Select 1 monster on your side of the field and send it to the Graveyard. Increase your Life Points by an amount equal to the original ATK of the monster.
Edison rulings: Select 1 monster on your side of the field and send it to the GY. Increase your Life Points by an amount equal to the original ATK of the monster.
●Sending a monster to the GY for Altar for Tribute is a cost.
●You can select a Token Monster as the cost for Altar for Tribute, but you won't gain any Life Points because Tokens are taken off the field instead of going to the GY.
●You can send your opponent's monster that you control to the GY as the cost for Altar for Tribute, and you would gain the Life Points.

## Ameba
[effect Level 1 WATER Aqua 300/350] formats: both
Text (Edison): When the control of this face-up card on the field shifts to your opponent, inflict 2000 points of damage to your opponent's LP. This effect can only be used once as long as this card remains face-up on the field.
Goat text: When the control of this face-up card on the field shifts to your opponent, inflict 2000 points of damage to your opponent's Life Points. This effect can only be used once as long as this card remains face-up on the field.
Edison rulings: ●This card’s effect is not activated when equipped to an opponent’s Relinquished.
●If your opponent uses Mind Control on a face-down Ameba and Flip Summons it, when it returns to you during the End Phase, its effect activates and you take 2000 damage.
●The 
●The Condition is reset if this card is flipped face-down / leaves the field.

## Amphibious Bugroth MK-3
[effect Level 4 WATER Machine 1500/1300] formats: both
Text (Edison): While "Umi" is face-up on the field, this card can attack your opponent's LP directly.
Goat text: While "Umi" is face-up on the field, this card can attack your opponent's Life Points directly.
Edison rulings: ●The 
●When Umi is on the field, and Amphibious Bugroth MK-3 declares a direct attack, and Umi is destroyed during the Battle Step, Amphibious Bugroth MK-3 can no longer attack directly, so a replay occurs.

## Amplifier
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Equip only to "Jinzo". While this card is equipped, the equipped monster's effect does not negate the effects of its controller's Trap Cards. When this card is removed from the field, destroy the equipped monster. This card's activation and effect can't be negated.
Goat text: Equip only to "Jinzo". While this card is equipped, the equipped monster's effect does not negate the effects of its controller's Trap Cards. When this card is removed from the field, destroy the equipped monster. This card's activation and effect cannot be negated.
Edison rulings: Equip only to Jinzo. While this card is equipped, the equipped monster's effect does not negate the effects of its controller's Trap Cards. When this card is removed from the field, destroy the equipped monster. This card's activation and effect can't be negated.
●Note that Amplifier's activation and effect can't be negated. This is written on the card.
●It is the controller of Jinzo equipped with Amplifier, not the controller of Amplifier, that can activate Trap Cards.
●If you equip Amplifier to your opponent's Jinzo, then your opponent can activate Trap Cards and they won't be negated.
●If you control 2 Jinzos and only 1 is equipped with Amplifier, you can't activate Trap Cards.
●If you have Jinzo with Amplifier, your Trap Cards are not negated and their effects are applied, including Aqua Chorus, Royal Command, Royal Oppression, Coffin Seller, Forced Requisition, Mirror Wall, Gravity Bind, Rivalry of Warlords, Minor Goblin Official, Final Attack Orders, Pitch Black Power Stone, Bad Reaction to Simochi, Skull Invitation, Skull Lair, The Eye of Truth, Spirit Invitation, Respect Play, Ring of Destruction, Metalmorph, Torrential Tribute, Self-Destruct Button, Zero Gravity, and Big Burn.
●If you activate Mask of Restrict and you have Jinzo with Amplifier, Mask of Restrict is not negated and its effect still applies, so neither player may Tribute.
●If the controller of Jinzo with Amplifier has activated the effects of Regulation of Tribe, Spatial Collapse, Robbin' Goblin, Robbin

## An Owl of Luck
[effect Flip Effect Level 2 WIND Winged Beast 300/500] formats: both
Text (Edison): FLIP: Select 1 Field Spell Card from your Deck and place it on top of your Deck. If "Necrovalley" is on the field, you can add the selected Field Spell Card to your hand instead.
Edison rulings: FLIP: Select 1 Field Spell Card from your Deck and place it on top of your Deck. If Necrovalley is on the field, you can add the selected Field Spell Card to your hand instead.
●Show the card to your opponent.
●If Imperial Order & Necrovalley are both active, and An Owl of Luck is flipped, you add the card to your hand because Necrovalley is face-up on the field, even though its effect is negated.
●If Mystical Space Typhoon is chained to the effect to destroy Necrovalley, so that Necrovalley is not on the field when this effect resolves, you can't place the card in your hand.
●You select the card for this effect when the effect resolves, not when it activates.

## Andro Sphinx
[effect Level 10 LIGHT Beast 3000/2500] formats: both
Text (Edison): Ⓢ If ＂Pyramid of Light＂ is on the field, you can pay 500 LP to Special Summon this card (from your hand).
Ⓒ Cannot be Special Summoned from the GY.
① can't attack during the turn it is Normal/Special Summoned.
② If this card destroys a Defence Position monster by battle: Inflict damage to your opponent equal to that monster's original ATK.
Goat text: You can pay 500 Life Points to Special Summon this card when "Pyramid of Light" is on the field. This card cannot attack during the turn that it is Normal Summoned or Special Summoned. This card cannot be Special Summoned from the Graveyard. If this card destroys a Defense Position monster as a result of battle, inflict damage to your opponent's Life Points equal to half of the ATK of the destroyed monster.
Edison rulings: ●The Ignition Effect activates & resolves in the hand.
●This card’s effect which allows you to Special Summon it is a Spell Speed 1 effect that you can only activate during your Main Phase 1 or 2.
●Paying 500 Life Points is a cost.
●The Continuous Effect applies while this card is face-up on the field.
●This effect can be negated by Skill Drain.
●The Condition can't be negated.
●This card in the GY Cannot be Special Summoned face-down by The Shallow Grave.
●This banished card can be Special Summoned by Return from the Different Dimension.
●This card can be Special Summoned from the Deck by Reasoning.
●The Trigger Effect is mandatory.
●This effect activates & resolves on the field in Substep 7 - End of the Damage Step.
●This effect activates even if this card is flipped face-down / leaves the field.

## Ante
[spell Normal] formats: both
Text (Edison): Each Player reveals 1 card from their hand. If one card is higher Level than the other, the card with the lower Level is sent to the GY, and the player who revealed it takes 1000 damage. (Non-Monster Cards are treated as Level 0.)
Goat text: Each Player reveals 1 card from their hand. If one card is higher Level than the other, the card with the lower Level is sent to the Graveyard, and the player who revealed it takes 1000 damage. (Non-Monster Cards are treated as Level 0.)
Edison rulings: Each Player selects 1 card from his/her hand, then looks at the Level of the selected cards. The card with more Levels returns to the hand of the player who selected it. The player who selected the card with fewer Levels takes 1000 Life Points damage and sends the card to the GY. If a non-Monster Card is selected, it is treated as Level 0. If they are the same Level, each player returns his/her card to his/her hand.
●If Ante is the only card in your hand, you can't activate it.
●If your opponent has no cards in his hand, you can't activate Ante.
●You select cards at the resolution of Ante's effect, not at Ante's activation.
●You can't chain Barrel Behind the Door to Ante because you don't know for certain whether you will take damage.
●If either player chains Raigeki Break or Last Turn to Ante and then has no cards at resolution of Ante's effect, Ante's effect disappears.
●When A Legendary Ocean is active and you activate Ante, when you check the Level, treat the Levels of WATER monsters in the hand as 1 lower for purposes of Ante.

## Apprentice Magician
[effect Level 2 DARK Spellcaster 400/800] formats: both
Text (Edison): If this card is Summoned: Target 1 face-up card on the field that you can place a Spell Counter on; place 1 Spell Counter on that target. If this card is destroyed by battle: You can Special Summon 1 Level 2 or lower Spellcaster monster from your Deck in face-down Defense Position.
Edison rulings: ●The Trigger Effect is mandatory. It activates & resolves on the field.
●This effect activates whenever this card is (Normal / Flip / Special) Summoned face-up.
●If you Special Summon Apprentice Magician face-down (such as with Apprentice Magician’s” effect) then you don't place a Spell Counter.
●For effects that place a Spell Counter, you can chain to the activation of those effects. The Spell Counter is actually placed when the effect resolves.
●The Trigger Effect is optional. It activates & resolves in the GY (or banished).
●You must show your opponent the monster you Special Summon.
●This effect activates in Substep 7 - End of the Damage Step.
●“Apprentice Magician’s” effect activates at the same time as when monsters are sent to the GY. But it does not have to be sent to the GY; you get to Special Summon a new monster when Apprentice Magician is destroyed as a result of battle, even if Banisher of the Light is in play.
●If you take control of your opponent's Apprentice Magician, and it is destroyed as a result of battle, then your opponent (the original owner) will get to Special Summon. Because “Apprentice Magician” is no longer on your side of the field, it is now in the opponent’s GY / banished.

## Appropriate
[trap Continuous] formats: both
Text (Edison): Activate only when your opponent draws a card(s) outside of either Draw Phase. After that, each time your opponent draws a card(s) outside of either Draw Phase, immediately draw 2 cards.
Edison rulings: Activate only when your opponent draws a card
●Appropriate can only be activated if the last effect on the Chain ends with your opponent drawing a card(s) outside of their Draw Phase. (See Missing the Timing - Optional Trigger Effects in the Advanced Gameplay FAQ for more information.)
●If your opponent picks up cards with Morphing Jar #2, etc., you don't draw.
●If you have 2 face-up Appropriate, you will draw 4 cards when your opponent draws a card(s) outside of their Draw Phase.
●If you and your opponent have Appropriate face-up and you or your opponent draw a card outside of your respective Draw Phases, the effect of each Appropriate is applied until you or your opponent can't Draw a card and lose the Duel or gather all 5 pieces of Exodia into your respective hand and win the Duel. This process does not start a Chain.

## Arcane Archer of the Forest
[effect Level 3 EARTH Warrior 900/1400] formats: both
Text (Edison): While there is a Plant monster on your side of the field, this card can't be attacked. By Tributing 1 Plant monster on your side of the field, destroy 1 Spell or Trap Card on the field.
Goat text: While there is a Plant-Type monster on your side of the field, this card cannot be attacked. By Tributing 1 Plant-Type monster on your side of the field, destroy 1 Spell or Trap Card on the field.
Edison rulings: ●The Continuous Effect applies while this card is face-up on the field.
●If this card, your only monster on the field, is changed to Plant-Type: your opponent can't attack.
●The Ignition Effect activates & resolves on the field.
●Tributing 1 Plant-Type monster on your side of the field is a cost. You can Tribute your opponent's face-up Plant-Type monster targeted by Soul Exchange.
●This effect targets 1 (face-up / face-down) Spell / Trap Card on the field.
●You can Tribute this card that is treated as a Plant-Type to activate this effect.

## Archfiend's Oath
[spell Continuous] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Once per turn: You can pay 500 LP, then declare 1 card name; excavate the top card of your Deck, and if it is the declared card, add it to your hand. Otherwise, send it to the GY.
Goat text: Once per turn: You can pay 500 Life Points, then declare 1 card name; excavate the top card of your Deck, and if it is the declared card, add it to your hand. Otherwise, send it to the Graveyard.
Edison rulings: ●The Ignition Effect activates & resolves on the field.
●Paying 500 Life Points is a cost. Declare 1 card name at activation.
●You can activate Archfiend's Oath while Convulsion of Nature is active.
●If you have multiple copies of Archfiend's Oath, you can use all of them.

## Archfiend's Roar
[trap Normal] formats: both
Text (Edison): Pay 500 LP, then target 1 "Archfiend" monster in your GY; Special Summon that target. It can't be Tributed. Destroy it during the End Phase of this turn.
Goat text: Pay 500 Life Points, then target 1 "Archfiend" monster in your Graveyard; Special Summon that target. It cannot be Tributed. Destroy it during the End Phase of this turn.
Edison rulings: Pay 500 Life Points to activate this card. Special Summon 1 Archfiend Monster Card from your GY. This monster can't be Tributed under any conditions and is destroyed during the End Phase of this turn.
●Paying 500 Life Points is a cost.
●This effect targets 1 Archfiend Monster in your GY.
●The Archfiend that is Special Summoned by Archfiend's Roar is destroyed by Archfiend's Roar's effect during the End Phase.
●You can select a Special Summon-only Archfiend like Fiend Skull Dragon or Toon Summoned Skull with Archfiend's Roar, but only if they were Summoned properly earlier in the Duel.
●When you Special Summon Fiend Skull Dragon with Archfiend's Roar, Archfiend's Roar's effect is not negated and Fiend Skull Dragon will be destroyed by the effect during the End Phase.
●When you remove an Archfiend from the field that was Special Summoned with Archfiend's Roar, using Interdimensional Matter Transporter, the effect is reset and it can be offered as a Tribute, and won't be destroyed during the End Phase.
