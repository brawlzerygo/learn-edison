# Full pool batch 25: 60 cards. Write js/cards/full-25.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Moisture Creature
[effect Level 9 LIGHT Fairy 2800/2900] formats: both
Text (Edison): If you Tribute Summon this monster by Tributing 3 monsters on the field, destroy all Spell and Trap Cards on your opponent's side of the field.
Edison rulings: ●You can Summon Moisture Creature by Tributing 2 monsters, but the effect won't be activated.
●You can't Summon Moisture Creature by Tributing 3 monsters if there are no Spell or Trap Cards on your opponent’s side of the field.
●If you activate the effect of Moisture Creature and your opponent chains Book of Moon to the effect, the effect still resolves and all Spell and Trap Cards on your opponent’s side of the field are destroyed.

## Mokey Mokey King
[fusion Fusion Level 6 LIGHT Fairy 300/100] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Mokey Mokey" + "Mokey Mokey" + "Mokey Mokey"
When this card is removed from the field, you can Special Summon as many "Mokey Mokey" as possible from your GY.
Goat text: "Mokey Mokey" + "Mokey Mokey" + "Mokey Mokey"
When this card is removed from the field, you can Special Summon as many "Mokey Mokey" as possible from your Graveyard.
Edison rulings: ●When Mokey Mokey King that was Special Summoned by Magical Scientist is returned to the Extra Deck, it has been removed from the field so its effect activates and you Special Summon as many Mokey Mokey as possible from your GY.
●Missing the Timing: If Mokey Mokey King leaves the field in the middle of a chain (for example, if destroyed by Ring of Destruction chained to Pot of Greed, or Tributed for a Tribute Summon or for the effect of Cannon Soldier, etc.,), you miss the timing and you can't Special Summon. Only when the last action of the chain is the removal of Mokey Mokey King from the field, can you activate its effect.

## Mokey Mokey Smackdown
[spell Continuous] formats: both
Text (Edison): While a face-up "Mokey Mokey" is on your side of the field, if a Fairy monster on your side of the field is destroyed, the ATK of each "Mokey Mokey" on your side of the field becomes 3000 until the end of this turn.
Goat text: While a face-up "Mokey Mokey" is on your side of the field, if a Fairy-Type monster on your side of the field is destroyed, the ATK of each "Mokey Mokey" on your side of the field becomes 3000 until the end of this turn.
Edison rulings: ●If the effect of Mokey Mokey Smackdown is activated (by a Fairy-Type monster on your side of the field being destroyed), and afterwards you Summon a Mokey Mokey, that Mokey Mokey will also have 3000 ATK even though it wasn’t on the field when the Fairy-Type monster is destroyed.

## Molten Destruction
[spell Field] formats: both
Text (Edison): All FIRE monsters gain 500 ATK and lose 400 DEF.

## Molten Zombie
[effect Level 4 FIRE Pyro 1600/400] formats: both
Text (Edison): When this card is Special Summoned from the GY: Draw 1 card.
Goat text: When this card is Special Summoned from the Graveyard: Draw 1 card.
Edison rulings: ●If you Special Summon Molten Zombie face-down with The Shallow Grave, etc., its effect does not activate.
●When you Special Summon Molten Zombie and you have Card of Safe Return, either effect can be Step 1 of the chain; your choice.

## Monk Fighter
[effect Level 3 EARTH Rock 1300/1000] formats: both
Text (Edison): Battle Damage to this card's controller from a battle involving this card becomes 0.

## Morale Boost
[spell Continuous] formats: both
Text (Edison): Each time a player equips an Equip Spell Card, increase the LP of the controller of that Equip Spell Card by 1000 points. Each time an Equip Spell Card is removed from the field, the controller of that Equip Spell Card takes 1000 points of damage.
Goat text: Each time a player equips an Equip Spell Card, increase the Life Points of the controller of that Equip Spell Card by 1000 points. Each time an Equip Spell Card is removed from the field, the controller of that Equip Spell Card takes 1000 points of damage.
Edison rulings: ●If Morale Boost and other Equip Spell Cards are destroyed at the same time with Harpie's Feather Duster or Heavy Storm, Morale Boost does not inflict any damage.
●While your Morale Boost is active, and you activate your opponent's Equip Spell Card that you had because of Exchange, when that Equip Spell Card is removed from the field it is you that takes the damage.
●Morale Boost's effect includes when monsters are equipped to Relinquished or Sword Hunter, and when such equipped monsters are removed from the field.
●Morale Boost's effect includes Kisetai, and Union Monsters equipped to another monster by their own effect, and when such equipped monsters are removed from the field, and when Union Monsters detach and become monsters again.
●Morale Boost's effect includes when you equip an Equip Spell Card to your opponent's monsters, and when such cards are removed from the field.
●Morale Boost's effect includes when you Summon Guardian Elma and resolve her effect.
●Morale Boost's effect includes when Tailor of the Fickle is used.

## Morphing Jar #2
[effect Flip Effect Level 3 EARTH Rock 800/700] formats: goat
Text: FLIP: Shuffle all monsters on the field into the Deck. Then, each player excavates cards from the top of their Deck, until they excavate the same number of monsters they shuffled into their Main Deck. Special Summon all excavated Level 4 or lower monsters in face-down Defense Position, also send the remaining cards to the Graveyard.

## Mountain
[spell Field] formats: both
Text (Edison): All Dragon, Winged Beast, and Thunder monsters on the field gain 200 ATK/DEF.

## Mucus Yolk
[effect Level 3 DARK Aqua 0/100] formats: both
Text (Edison): This card can attack your opponent's LP directly. Each time this card inflicts Battle Damage to your opponent's LP, increase the ATK of this card by 1000 points during your next Standby Phase. The ATK increase lasts as long as this card remains face-up on the field.
Goat text: This card can attack your opponent's Life Points directly. Each time this card inflicts Battle Damage to your opponent's Life Points, increase the ATK of this card by 1000 points during your next Standby Phase. The ATK increase lasts as long as this card remains face-up on the field.
Edison rulings: ●Zero damage is not damage, so Mucus Yolk must have its ATK increased somehow in order to inflict damage to the opponent and activate its effect.
●Mucus Yolk can continue to activate its effect over and over again, as long as it keeps inflicting Battle Damage to the opponent.
●If Mucus Yolk inflicts damage multiple times in the same turn, such as with Twin Swords of Flashing Light – Tryce, it only increases by 1000 points during your next Standby Phase.

## Mudora
[effect Level 4 EARTH Fairy 1500/1800] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): This card gains 200 ATK for each Fairy monster in your GY.
Goat text: This card gains 200 ATK for each Fairy-Type monster in your Graveyard.

## Muka Muka
[effect Level 2 EARTH Rock 600/300] formats: both
Text (Edison): This card gains 300 ATK and DEF for each card in your hand.

## Muko
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Activate only when an effect of drawing card(s) is activated. Both players see the cards drawn by the effect and discard them all to the GY.
Goat text: Activate only when an effect of drawing card(s) is activated. Both players see the cards drawn by the effect and discard them all to the Graveyard.
Rulings: 1. You can only chain "Null and Void" to an effect that draws cards and does nothing else. You can chain "Null and Void" to the activation of "Pot of Greed" or "Jar of Greed". You can chain "Null and Void" to the activation of the effect of cards like "Airknight Parshath".
2. You can chain "Null and Void" to a Continuous Spell or Trap Card that causes drawing, such as "Mirage of Nightmare" or "Heart of the Underdog".
3. You cannot chain "Null and Void" to "Disturbance Strategy", "Graceful Charity", "Card Destruction", "Morphing Jar", "Mind Wipe", "Dragged Down into the Grave", or "Reload".
4. You can activate "Null and Void" during the Damage Step, for example against the effects of "Airknight Parshath", "Sasuke Samurai #3" or "Bistro Butcher".
5. The card(s) discarded by the effect of "Null and Void" are never treated as actually drawn, so they are considered sent from the Deck to the GY.
6. You can chain "Null and Void" to "Reckless Greed". Since you cannot draw by the effect of "Reckless Greed", the effect of skipping 2 Draw Phases is NOT applied.
7. You can chain "Null and Void" to the effect of "Royal Magical Library".
8. You cannot chain "Null and Void" to the effect of "Appr

## Multiplication of Ants
[spell Normal] formats: both
Text (Edison): Tribute 1 Insect Monster on your side of the field. Special Summon 2 "Army Ant Tokens" (Insect/EARTH/Level 4/ATK 500/DEF 1200) on your side of the field. The tokens can't be used as a Tribute for a Tribute Summon.
Goat text: Tribute 1 Insect-Type Monster on your side of the field. Special Summon 2 "Army Ant Tokens" (Insect-Type/EARTH/Level 4/ATK 500/DEF 1200) on your side of the field. The tokens cannot be used as a Tribute for a Tribute Summon.
Edison rulings: ●You can Tribute a face-down Insect-Type monster when you activate Multiplication of Ants.

## Mushroom Man #2
[effect Level 3 EARTH Warrior 1250/800] formats: goat
Text: A player controlling this monster loses 300 Life Points during each of his/her Standby Phases when this card is face-up on the field. Control of this card is shifted to your opponent by paying 500 Life Points at your own End Phase.

## Mustering of the Dark Scorpions
[spell Normal] formats: both
Text (Edison): If you control a face-up "Don Zaloog": You can Special Summon any number of "Dark Scorpion" monsters from your hand, but only 1 copy of each.
Edison rulings: ●If you have 2 copies of Cliff the Trap Remover (for example) in your hand, you can Special Summon 1 of them with Mustering of the Dark Scorpions. You can Special Summon him even if you already have Cliff the Trap Remover on your side of the field from before you activated Mustering of the Dark Scorpions.
●You don't have to Special Summon all possible monsters with Mustering of the Dark Scorpions; you can keep some in your hand if you want.
●If your opponent chains Ring of Destruction to Mustering of the Dark Scorpions to destroy your Don Zaloog, Mustering of the Dark Scorpions still resolves.

## Mystik Wok
[spell Quick-Play] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Tribute 1 monster. Select either its ATK or DEF and gain that many LP.
Goat text: Tribute 1 monster. Select either its ATK or DEF and gain that many Life Points.
Edison rulings: ●Tributing a monster for Mystik Wok is a cost, so you can Tribute The Legendary Fisherman or The Agent of Force - Mars.
●The ATK or DEF is the current number, not the original number.
●You select ATK or DEF when Mystik Wok is activated.
●You can Tribute face-down monsters, or your opponent's monster using Soul Exchange.

## Narrow Pass
[trap Continuous] formats: both
Text (Edison): This card can only be activated when both players have 2 monsters or less on their respective sides of the field. Both players can only Normal Summon up to 2 additional monsters on their sides of the field.
Edison rulings: ●Narrow Pass can only be activated when Player A has 2 or fewer monsters and Player B has 2 or fewer monsters. So if there are 3 monsters in play (2 controlled by A and 1 by B) you can activate Narrow Pass. But if either player controls 3 or more monsters on his side of the field then you can't activate this card.
●Once Narrow Pass is activate, as long as it remains face-up on the field, Player A can Normal Summon or Set 2 up to 2 additional monsters, and Player B can Normal Summon or Set up to 2 additional monsters. It is helpful to place counters on Narrow Pass to keep track.
●If Narrow Pass is activate, and a player Normal Summons his 2 permitted monsters afterwards, if 1 of those is destroyed then he can't replace it with another Normal Summon. Each player gets 2 additional Normal Summons or Sets, no matter what happens to those monsters afterwards.
●Narrow Pass does not restrict Special Summons or Flip Summons.

## Necklace of Command
[spell Equip] formats: both
Text (Edison): When a monster you control that's equipped with this card is destroyed by battle, and this card is sent to the GY, you can either:
● Draw 1 card. OR
● Discard 1 random card from your opponent's hand.
Goat text: When a monster you control that's equipped with this card is destroyed by battle, and this card is sent to the Graveyard, you can either:
● Draw 1 card. OR
● Discard 1 random card from your opponent's hand.

## Neko Mane King
[effect Level 1 EARTH Beast 0/0] formats: both
Text (Edison): During your opponent's turn, when this card in your possession is sent to your GY by an opponent's card effect: It becomes the End Phase of this turn.
Goat text: During your opponent's turn, when this card in your possession is sent to your Graveyard by an opponent's card effect: It becomes the End Phase of this turn.
Edison rulings: ●The Trigger Effect is mandatory.
●This effect can be activated during the Damage Step.
●This effect forces your opponent into the End Phase. This effect DOES NOT end the turn
●This effect activates if an opponent's card sent NMK to the GY from the field / hand / Deck.
●VS. Prohibition: this effect activates so long as Neko Mane King was already on the field.
●The Trigger Effect won't ACTIVATE if Neko Mane King:
●is under the opponent's control when it is sent to the GY by either player's card effect.
●is sent to the GY (from the hand/Deck) AFTER it was named by Prohibition.

## Newdoria
[effect Level 4 DARK Fiend 1200/800] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card is destroyed by battle and sent to the GY: Target 1 monster on the field; destroy that target.
Edison rulings: ●This effect targets 1 monster.
●You can destroy a face-down monster with Newdoria.

## Nimble Momonga
[effect Level 2 EARTH Beast 1000/100] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When this card is destroyed by battle and sent to the GY: Gain 1000 LP, then you can Special Summon any number of "Nimble Momongas" from your Deck in face-down Defense Position.
Goat text: When this card is destroyed by battle and sent to the Graveyard: Gain 1000 Life Points, then you can Special Summon any number of "Nimble Momongas" from your Deck in face-down Defense Position.
Rulings: 1. The owner of "Nimble Momonga" activates its effect because it activates in its owner's GY.
2. Gaining Life Points is mandatory, but Special Summoning "Nimble Momonga" from the Deck is not. You Special Summon the "Nimble Momonga" when you gain the Life Points.

## Ninja Grandmaster Sasuke
[effect Level 4 LIGHT Warrior 1800/1000] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): At the start of the Damage Step, if this card attacks a face-up Defense Position monster: Destroy that monster.
Edison rulings: ●Ninja Grandmaster Sasuke’s effect activates at the beginning of the Damage Step, before the monster is flipped face-up. So if Ninja Grandmaster Sasuke attacks a face-down Defense Position monster, Ninja Grandmaster Sasuke won't destroy it with his effect because it is not flipped face-up until after Ninja Grandmaster Sasuke’s effect would activate.
●A face-up Defense Position Spirit Reaper will be destroyed by the effect of Ninja Grandmaster Sasuke. Ninja Grandmaster Sasuke’s effect does not target. So if Ninja Grandmaster Sasuke attacks Spirit Reaper, Spirit Reaper is destroyed by Ninja Grandmaster Sasuke’s effect, not by Spirit Reaper’s effect.
●If Ninja Grandmaster Sasuke attacks a face-up Defense Position D. D. Warrior Lady, D. D. Warrior Lady is destroyed by the effect of Ninja Grandmaster Sasuke and D. D. Warrior Lady’s effect is not activated.
●If Ninja Grandmaster Sasuke attacks a face-up Defense Position monster, and you flip it face-down during the Battle Step with Book of Moon, the monster is face-down at the start of the Damage Step so Ninja Grandmaster Sasuke won't destroy it with his effect.
●If Ninja Grandmaster Sasuke attacks a face-down Defense Position monster, and Ceasefire is activated during the Battle Step, the monster is face-up at the start of the Damage Step so it will be destroyed by Ninja Grandmaster Sasuke’s effect.

## Ninjitsu Art of Decoy
[trap Continuous] formats: both
Text (Edison): Target 1 face-up "Ninja" monster you control; it can't be destroyed by battle.
Goat text: Target 1 face-up "Ninja" monster you control; it cannot be destroyed by battle.
Edison rulings: ●If the Ninja is destroyed or otherwise removed from the field by a card effect, Ninjitsu Art of Decoy remains on the field meaninglessly.
●If the Ninja is removed from the field temporarily, or flipped face-down, Ninjitsu Art of Decoy’s effect is no longer applied.
●If Ninjitsu Art of Decoy is active, then Royal Decree is activated and negates Ninjitsu Art of Decoy’s effect, then Royal Decree is later destroyed, Ninjitsu Art of Decoy’s effect is not re-applied.

## Ninjitsu Art of Transformation
[trap Continuous] formats: both
Text (Edison): Activate this card by Tributing 1 face-up "Ninja" monster; Special Summon 1 Beast, Winged Beast, or Insect monster from your hand/Deck whose Level is less than or equal to the Level the Tributed monster had on the field +3. When this card leaves the field, destroy that monster.
Goat text: Activate this card by Tributing 1 face-up "Ninja" monster; Special Summon 1 Beast, Winged Beast, or Insect monster from your hand or Deck whose Level is less than or equal to the Level the Tributed monster had on the field +3. When this card leaves the field, destroy that monster.
Edison rulings: ●Ninjitsu Art of Transformation does not target; you select the monster to Special Summon when you resolve its effect.
●If The Legendary Ocean is active, your WATER monsters in your hand are lowered by 1 level so if you Special Summon from your hand using Ninjitsu Art of Transformation, you can Summon at 1 level lower (effectively making it Level +4 if looking at the original Level).
●The selected card means the Tributed card.

## Nitro Unit
[spell Equip] formats: both
Text (Edison): Equip only to a monster on your opponent's side of the field. When the equipped monster is destroyed by battle and sent to the GY, inflict damage to your opponent equal to the ATK of the equipped monster.
Goat text: Equip only to a monster on your opponent's side of the field. When the equipped monster is destroyed by battle and sent to the Graveyard, inflict damage to your opponent equal to the ATK of the equipped monster.
Edison rulings: ●If you equip “Nitro Unit” to a monster on your opponent’s side of the field, then you take control of that monster, “Nitro Unit” is destroyed because the monster is no longer on your opponent’s side of the field.
●If your opponent controls your monster, and you target it with “Nitro Unit”, but your opponent chains “Remove Brainwashing”, “Nitro Unit” is destroyed because its target is no longer on your opponent’s side of the field when “Nitro Unit” resolves.
●When the monster equipped with “Nitro Unit” is destroyed and sent to the GY as a result of battle, the effect of “Nitro Unit” can be chained to.
●The damage inflicted by “Nitro Unit” is based on the equipped monster’s original ATK (in the GY).

## Nobleman-Eater Bug
[effect Flip Effect Level 5 EARTH Insect 900/1200] formats: both
Text (Edison): FLIP: Destroy 2 monsters on the field.
Edison rulings: ●If you activate the effect of Nobleman-Eater Bug and select 2 monsters, then Ring of Destruction is chained and destroys 1 of the selected monsters, you still destroy the remaining monster when Nobleman-Eater Bug’s effect resolves.
●If Nobleman-Eater Bug is the only monster on the field and it is flipped face-up, then it destroys itself with its effect.

## Novox's Prayer
[spell Ritual] formats: both
Text (Edison): This card is used to Ritual Summon "Skull Guardian". You must also offer monsters whose total Level Stars equal 7 or more as a Tribute from the field or your hand.

## Nubian Guard
[effect Level 2 FIRE Warrior 500/500] formats: both
Text (Edison): If this card inflicts Battle Damage to your opponent's LP, you can return 1 Continuous Spell Card from your GY to the top of your Deck.
Goat text: If this card inflicts Battle Damage to your opponent's Life Points, you can return 1 Continuous Spell Card from your Graveyard to the top of your Deck.
Edison rulings: ●Nubian Guard's effect is resolved after damage calculation.
●Nubian Guard's effect does target a monster in the GY, so the effect will be negated if The End of Anubis is face-up on the field.

## Numinous Healer
[trap Normal] formats: both
Text (Edison): You can only activate this card when you take damage to your LP. Increase your LP by 1000 points. Also, increase your LP by 500 points for each "Numinous Healer" card in your GY.
Goat text: You can only activate this card when you take damage to your Life Points. Increase your Life Points by 1000 points. Also, increase your Life Points by 500 points for each "Numinous Healer" card in your Graveyard.
Edison rulings: ●You can't activate Numinous Healer when you pay a cost. You can only activate it when you receive Battle Damage or damage from an effect.

## Nutrient Z
[trap Normal] formats: both
Text (Edison): During damage calculation, when you are about to take 2000 or more battle damage: Gain 4000 LP first.
Edison rulings: ●This card can only be activated during your opponent’s Damage Step during the Calculate and Apply Damage portion or at any point in the Damage Step prior to that.
●You must take the 2000 points or more of Battle Damage from a single attack. If you take 1000 points of damage from one attack, and then 1200 points of damage from a second attack, the effect of this card won't activate.
●If Hayabusa Knight attacks you directly twice, the effect of this card won't activate. The Battle Damage must come from a single attack, not a single monster attacking twice.
●You can activate 2 copies of Nutrient Z and you will gain 8000 Life Points if you would take 2000 points or more of Battle Damage.
●You can't activate Kuriboh in a chain to Nutrient Z’s effect. The effect of Kuriboh would reduce the Battle Damage to 0, and then the effect of Nutrient Z will no longer increase you Life Points. You must actually take the damage to gain the benefit of Nutrient Z’s effect.

## Nuvia the Wicked
[effect Level 4 DARK Fiend 2000/800] formats: both
Text (Edison): If this monster is Normal Summoned, destroy this card. If your opponent controls any monster, decrease the ATK of this card by 200 points for each monster on your opponents side of the field.
Edison rulings: ●If Light of Intervention is on the field this card can't be Set and if Normal Summoned in face-up Defense Position it will be destroyed.

## Offerings to the Doomed
[spell Quick-Play] formats: both
Text (Edison): Target 1 face-up monster on the field; destroy that target, also skip your next Draw Phase.
Edison rulings: ●Skipping your next Draw Phase is not a cost, so if your opponent chains Magic Jammer or Imperial Order to negate this card, you don't skip your next Draw Phase.
●If your opponent chains Book of Moon to flip the target of this card face-down, the monster is not destroyed and you will skip your next Draw Phase.

## Old Vindictive Magician
[effect Flip Effect Level 2 DARK Spellcaster 450/600] formats: both
Text (Edison): FLIP: Target 1 monster your opponent controls; destroy that target.

## Ominous Fortunetelling
[trap Continuous] formats: both
Text (Edison): During your Standby Phase, select 1 random card from your opponent's hand. Call the type of card (Monster, Spell, or Trap). If you call it right, inflict 700 points of damage to your opponent's LP. You can use this effect only once per turn.
Goat text: During your Standby Phase, select 1 random card from your opponent's hand. Call the type of card (Monster, Spell, or Trap). If you call it right, inflict 700 points of damage to your opponent's Life Points. You can use this effect only once per turn.
Edison rulings: ●The opponent must reveal the randomly selected card to you after you call a type to confirm if you were right or wrong.
●If the opponent’s hand is revealed by the effect of Mind on Air, etc., turn his/her hand face-down and then randomly select a card.
●If you have two copies of Ominous Fortunetelling on the field, you select a card and call a type for the first copy, and then select a new card and call a type again for the second copy.

## Ooguchi
[effect Level 1 WATER Aqua 300/250] formats: both
Text (Edison): This monster may attack your opponent's LP directly.
Goat text: This monster may attack your opponent's Life Points directly.

## Ookazi
[spell Normal] formats: both
Text (Edison): Inflict 800 damage to your opponent.

## Opti-Camouflage Armor
[spell Equip] formats: both
Text (Edison): You can only equip this card to a Level 1 monster. A monster equipped with this card can attack your opponent's LP directly.
Goat text: You can only equip this card to a Level 1 monster. A monster equipped with this card can attack your opponent's Life Points directly.
Edison rulings: ●After you have declared a direct attack with your monster equipped with Opti-Camouflage Armor, and then the Opti-Camouflage Armor is destroyed during the attack, you can no longer attack directly and a replay occurs.

## Orca Mega-Fortress of Darkness
[effect Level 5 WATER Sea Serpent 2100/1200] formats: both
Text (Edison): By Tributing 1 "Torpedo Fish" on your side of the field, destroy 1 monster on the field. By Tributing 1 "Cannonball Spear Shellfish" on your side of the field, destroy 1 Spell or Trap Card on the field.
Edison rulings: ●You can Tribute a face-down Torpedo Fish or Cannonball Spear Shellfish to activate Orca Mega-Fortress of Darkness' effect.

## Ordeal of a Traveler
[trap Continuous] formats: both
Text (Edison): When an opponent's monster declares an attack: Your opponent chooses 1 random card in your hand and calls the type of the card (Monster, Spell, or Trap), and if they call it wrong, return the attacking monster to the hand.
Edison rulings: ●You can activate the effect of Ordeal of a Traveler each time your opponent attacks.
●You must show the card your opponent selects to your opponent.
●If your opponent calls it right, the attack resolves normally.
●You can't activate Ordeal of a Traveler’s effect if you have no cards in your hand.
●When Ordeal of a Traveler & Fairy Box are both active, Fairy Box (mandatory) is step 1 of the chain, and Ordeal of a Traveler (optional) is step 2.
●When you activate Ordeal of a Traveler’s effect as a chain to Magic Cylinder, since Ordeal of a Traveler resolves first, if your opponent guesses incorrectly then the attack does not resolve and the effect of Magic Cylinder disappears. If multiple copies of Ordeal of a Traveler are active, their effects are cumulative.

## Order to Charge
[spell Quick-Play] formats: both
Text (Edison): Target 1 non-Token Normal Monster you control; Tribute that Normal Monster, and if you do, destroy 1 monster your opponent controls.

## Order to Smash
[trap Normal] formats: both
Text (Edison): Target 1 Level 2 or lower non-Token Normal Monster you control; Tribute that Normal Monster, and if you do, destroy up to 2 Spells/Traps your opponent controls.
Edison rulings: ●You Tribute when you resolve Order to Smash's effect.
●You select the Spell/Trap Card when you resolve Order to Smash's effect.

## Otohime
[effect Effect Spirit Level 3 LIGHT Spellcaster 0/100] formats: both
Text (Edison): Cannot be Special Summoned. During the End Phase of the turn this card is Normal Summoned or flipped face-up: Return it to the hand. When this card is Normal Summoned or flipped face-up: You can target 1 face-up monster your opponent controls; change that target's battle position.
Rulings: 1. The following rules apply to all Spirit Monsters:
2. Spirit is not a monster Type; you cannot declare "Spirit" for the effect of "DNA Surgery".
3. Spirit Monsters are still Effect Monsters.
4. A Spirit Monster must be face-up on the field during the End Phase for it to return to the owner's hand. If it was destroyed or removed from play, it will not return to the owner's hand.
5. A Spirit Monster will return to the owner's hand during the End Phase, even if the opponent played it from their hand (through the effect of "Exchange".)

## Outstanding Dog Marron
[effect Level 1 LIGHT Beast 100/100] formats: both
Text (Edison): When this card is sent to your GY, add it to your Deck and shuffle it.
Goat text: When this card is sent to your Graveyard, add it to your Deck and shuffle it.
Edison rulings: ●When Outstanding Dog Marron is sent to the GY during a chain, its effect is activated after the current chain resolves (just like Witch of the Black Forest).
●When Mystical Knight of Jackal attacks Outstanding Dog Marron and destroys it, the effects are simultaneous. So Mystical Knight of Jackal's effect is Step 1 of a chain and Outstanding Dog Marron is Step 2. Outstanding Dog Marron is returned to the Deck and Mystical Knight of Jackal's effect disappears.

## Painful Choice
[spell Normal] formats: both
Text (Edison): Select 5 cards from your Deck and show them to your opponent. Your opponent selects 1 card among them. Add that card to your hand and discard the remaining cards to the GY.
Goat text: Select 5 cards from your Deck and show them to your opponent. Your opponent selects 1 card among them. Add that card to your hand and discard the remaining cards to the Graveyard.

## Paladin of White Dragon
[ritual Ritual Level 4 LIGHT Dragon 1900/1200] formats: both
Text (Edison): You can Ritual Summon this card with "White Dragon Ritual". At the start of the Damage Step, if this card attacks a face-down Defense Position monster: Destroy that face-down monster. You can Tribute this card; Special Summon 1 "Blue-Eyes White Dragon" from your hand/Deck, but "Blue-Eyes White Dragons" can't attack for the rest of this turn.
Goat text: You can Ritual Summon this card with "White Dragon Ritual". At the start of the Damage Step, if this card attacks a face-down Defense Position monster: Destroy that face-down monster. You can Tribute this card; Special Summon 1 "Blue-Eyes White Dragon" from your hand or Deck, but "Blue-Eyes White Dragons" cannot attack for the rest of this turn.

## Pandemonium
[spell Field] formats: both
Text (Edison): Neither player has to pay LP during the Standby Phase for "Archfiend" monsters. Each time a player's "Archfiend" monster(s) is destroyed and sent to the GY, except by battle, that player can add 1 "Archfiend" monster from their Deck to their hand that is a lower Level than the destroyed card.
Goat text: Neither player has to pay Life Points during the Standby Phase for "Archfiend" monsters. Each time a player's "Archfiend" monster(s) is destroyed and sent to the Graveyard, except by battle, that player can add 1 "Archfiend" monster from their Deck to their hand that is a lower Level than the destroyed card.
Edison rulings: ●You can't use Pandemonium to add a Fusion Monster Archfiend or Synchro Monster Archfiend from the Extra Deck to your hand, like Fiend Skull Dragon or Red Dragon Archfiend.
●If multiple Archfiends are destroyed at the same time by Raigeki, you can only add 1 Archfiend from your Deck to your hand with Pandemonium.
●When your Archfiends controlled by your opponent are sent to your GY, you can add an Archfiend from your Deck to your hand with Pandemonium.

## Pandemonium Watchbear
[effect Level 4 DARK Beast 1300/1800] formats: both
Text (Edison): As long as this card remains face-up on your side of the field, "Pandemonium" on your side of the field is not destroyed by your opponent's card effects.
Edison rulings: ●When your opponent activates Huge Revolution while your Pandemonium Watchbear is on your side of the field, your Pandemonium won't be destroyed.
●When your Pandemonium is going to be destroyed by Mystical Space Typhoon, you can chain Ceasefire to flip your Pandemonium Watchbear face-up, and Pandemonium won't be destroyed.

## Paralyzing Potion
[spell Equip] formats: both
Text (Edison): A non Machine monster equipped with this card can't attack.
Goat text: A non Machine-Type monster equipped with this card cannot attack.

## Parasite Paracide
[effect Flip Effect Level 2 EARTH Insect 500/300] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): FLIP: Put this card face-up in your opponent's Deck and shuffle it. When your opponent draws this card, it is Special Summoned to their side of the field in face-up Defense Position, and inflicts 1000 damage to them. Then, while this card is face-up on the field, all monsters your opponent controls become Insect monsters.
Goat text: FLIP: Put this card face-up in your opponent's Deck and shuffle it. When your opponent draws this card, it is Special Summoned to their side of the field in face-up Defense Position, and inflicts 1000 damage to them. Then, while this card is face-up on the field, all monsters your opponent controls become Insect-Type monsters.

## Patrician of Darkness
[effect Level 5 DARK Zombie 2000/1400] formats: both
Text (Edison): You choose the attack targets for your opponent's attacks.
Edison rulings: ●For this card’s effect, the chosen attack target must still be legal. You can't force a monster to attack directly if it normally can't, or force a monster to attack a monster on its own side of the field.
●The effect of Patrician of Darkness does not override the effects of Marauding Captain, The Legendary Fisherman, Solar Flare Dragon, etc. You can't choose an attack target prevented by the effects of these cards. Examples: You can't choose The Legendary Fisherman as an attack target if Umi is on the field. You can't choose another Warrior-Type monster as an attack target when you control Marauding Captain.
●Inaba White Rabbit must still attack your Life Points directly since it is not able to attack other monsters. You can't force it to with this card’s effect.
●If a monster has the optional effect of attacking directly, such as Rainbow Flower, you may choose a monster as an attack, or a direct attack.
●When you control Patrician of Darkness and a monster equipped with Ring of Magnetism you must chose the equipped monster as the attack target.
●Replays may occur as normal when this card is on the field. If, after the replay, Patrician of Darkness is still on the field and they choose to restart the attack, you will still choose the attack target with the effect of Patrician of Darkness.
●If you control Patrician of Darkness and Lord of D. you may still choose Dragon-Type monsters on your side of the field as attack targets.

## Patrol Robo
[effect Level 3 EARTH Machine 1100/900] formats: both
Text (Edison): During your Standby Phase, you can look at 1 face-down card that's been Set by your opponent as long as this card remains face-up on the field.

## Penalty Game!
[trap Normal] formats: both
Text (Edison): When your opponent has 4 cards in their hand: Activate 1 of these effects.
● Your opponent can't draw during their next Draw Phase.
● Your opponent can't activate Spell/Trap Cards this turn.
Goat text: When your opponent has 4 cards in their hand: Activate 1 of these effects.
● Your opponent cannot draw during their next Draw Phase.
● Your opponent cannot activate Spell/Trap Cards this turn.
Edison rulings: ●Penalty Game! only requires your opponent to have 4 cards in hand when it is activated, not when it resolves. So your opponent can activate Jar of Greed to have 5 cards, or chain a Quick-Play Spell Card from his hand and have 3 cards, and Penalty Game! will still resolve.
●If you choose the first effect, neither player can activate a card that would require the opponent to draw during their next Draw Phase, such as Jar of Greed or Disturbance Strategy.
●If the second effect of Penalty Game! is chosen, the opponent can still activate the effects of cards that are already face-up on the field, such as Skull Lair or The Dragon’s Bead.

## Penguin Knight
[effect Level 3 WATER Aqua 900/800] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When this card is sent directly from your Deck to the GY by an effect of a card controlled by your opponent, unite your GY cards and your own Deck, shuffle them and form a new Deck.
Goat text: When this card is sent directly from your Deck to the Graveyard by an effect of a card controlled by your opponent, unite your Graveyard cards and your own Deck, shuffle them and form a new Deck.

## Penguin Soldier
[effect Flip Effect Level 2 WATER Aqua 750/500] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): FLIP: You can target up to 2 monsters on the field; return those targets to the hand.
Edison rulings: ●You may choose to return 0, 1, or 2 monsters to their owners’ hands.
●You may target Monster Tokens, and they will be taken off the field, instead of returning to the hand.
●Spirit Monsters can still be returned to their owners’ hands by the effect of Penguin Soldier even if Spiritual Energy Settle Machine is in play.

## Penumbral Soldier Lady
[effect Level 6 DARK Warrior 2100/1400] formats: both
Text (Edison): If this card battles a LIGHT monster, this card gains 1000 ATK during the Damage Step only.
Edison rulings: ●Penumbral Soldier Lady’s ATK increases during the Damage Step and this effect can be chained to.
●Penbumbral Soldier Lady’s ATK increases when appropriate, no matter whose turn it is or whether she attacked or was attacked.
●The increase to Penumbral Soldier Lady’s ATK from her effect only lasts until the end of the Damage Step.

## Perfect Machine King
[effect Level 8 EARTH Machine 2700/1500] formats: both
Text (Edison): This card gains 500 ATK for each other Machine monster on the field.
Goat text: This card gains 500 ATK for each other Machine-Type monster on the field.

## Performance of Sword
[ritual Ritual Level 6 EARTH Warrior 1950/1850] formats: both
Text (Edison): This monster can only be Ritual Summoned with the Ritual Spell Card, "Commencement Dance". You must also offer monsters whose total Level Stars equal 6 or more as a Tribute from the field or your hand.

## Peten the Dark Clown
[effect Level 3 DARK Spellcaster 500/1200] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When this card is sent to your GY: You can banish this card from your GY; Special Summon 1 "Peten the Dark Clown" from your hand/Deck.
Goat text: When this card is sent to your Graveyard: You can banish this card from your Graveyard; Special Summon 1 "Peten the Dark Clown" from your hand or Deck.
Edison rulings: ●Missing the Timing: “Peten the Dark Clown” is a “when… you can” optional Trigger Effect. This means that “Peten” being sent to the GY has to be the very last thing that happened in order to activate its effect.
●If “Peten the Dark Clown” is Tributed for a Tribute Summon, the last thing that happened was that a monster was Summoned, so the effect of “Peten” does not activate.
●If “Peten the Dark Clown” is Tributed for “Mystik Wok” or “Cannon Soldier”, the last thing that happened was that those effects resolved, so the effect of “Peten” does not activate.
●If “Peten the Dark Clown” is destroyed in a chain and not as Chain Link 1, his effect does not activate. (Example: “Pot of Greed” is activated and “Ring of Destruction” is chained, targeting “Peten”.)
●If “Peten the Dark Clown” is destroyed by “Cyber Jar”, the last thing that happened was that monsters were Summoned to the field, so the effect of “Peten” does not activate.
●If “Peten the Dark Clown” is discarded as a cost for “Tribe-Infecting Virus” or “Raigeki Break”, the last thing that happened was that those effects resolved, so the effect of “Peten” does not activate.
●If “Peten the Dark Clown” is discarded because of “Morphing Jar” or “Card Destruction”, the last thing that happened was that both players drew cards. So the effect of “Peten” does not activate.
●If “Peten the Dark Clown” is sent to the GY as a result of battle, or by “Painful Choice”, the last thing that happened WAS that “Peten” was sent to the GY, so 

## Pharaoh's Treasure
[trap Normal] formats: both
Text (Edison): Shuffle this card face-up into your Deck. If you draw this face-up card that was added to the Deck by this effect: Send it to the GY, then target 1 card in your GY, except this card; add that target to your hand.
Edison rulings: ●You can't select the Pharaoh’s Treasure you just drew and sent to the GY as the card to place in your hand.
●You can select a face-up Pharaoh’s Treasure in your deck as 1 of the 5 cards for Painful Choice, but because Painful Choice is not a draw, the effect of Pharaoh’s Treasure won't be activated.
●If you take Pharaoh’s Treasure from your opponent’s hand with Exchange and activate it, the card goes in your Deck, not the original owner’s Deck. When you draw your opponent’s Pharaoh’s Treasure from your Deck after that, the controller gets the effect of Pharaoh’s Treasure and retrieves a card from his GY, but Pharaoh’s Treasure goes to the owner’s GY.
●If Convulsion of Nature is active, place Pharaoh’s Treasure face-down so that it is the opposite direction of the rest of the cards.
●If a face-up Pharaoh’s Treasure is in your deck and Fiber Jar is activated, shuffle the Deck with Pharaoh’s Treasure in it; if you draw the Pharaoh’s Treasure in your new 5-card hand, the effect is activated but because there are no cards in the GY to retrieve, its effect disappears.
●If you pick up a face-up Pharaoh’s Treasure because of Cyber Jar, this is not drawing so the effect is not activated; you may Set the Pharaoh’s Treasure you picked up and activate it again (placing it back into your Deck, etc.).
●You can't activate Seven Tools of the Bandit or Solemn Judgment when Pharaoh’s Treasure is drawn.
●You can select a face-up Pharaoh’s Treasure from your Deck for Different Dimension Capsule
