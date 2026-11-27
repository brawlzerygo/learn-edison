# Full pool batch 29: 62 cards. Write js/cards/full-29.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Watapon
[effect Level 1 LIGHT Fairy 200/300] formats: both
Text (Edison): If this card is added from your Deck to your hand by a card effect: You can Special Summon this card.
Edison rulings: ●If you draw Watapon by the effect of Graceful Charity you can Special Summon it to the field after you discard the two cards for Graceful Charity.
●Painful Choice, Graceful Charity, and Witch of the Black Forest are all examples of the types of effects that will activate the effect of Watapon.

## Wave-Motion Cannon
[spell Continuous] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): During your Main Phase: You can send this face-up card to the GY; inflict 1000 damage to your opponent for each of your Standby Phases that have passed since this card was activated.
Edison rulings: ●The Ignition Effect activates & resolves on the field.
●Sending Wave-Motion Cannon to the GY is a cost.
●No Counters are involved in this card's effect. You simply count your own Standby Phase.
●This effect can't be negated by Magic Jammer, etc. Your opponent can chain Magic Jammer when you first activate Wave-Motion Cannon (when you place it face-up on the field).
●If Imperial Order is active, count Standby Phases as normal for Wave-Motion Cannon.
●You can activate Wave-Motion Cannon (place it face-up on the field) and send it to the GY during the same turn, but it won't do any damage.
●If Solomon's Lawbook skips your Standby Phase, or the turn is skipped with Gamble, increase the count for Wave-Motion Cannon anyway. Pyro Clock of Destiny won't increase the count.

## Weapon Change
[spell Continuous] formats: both
Text (Edison): Once during each of your Standby Phases: You can pay 700 LP, then target 1 Warrior or Machine monster you control; switch the current ATK and DEF of that target until the end of your opponent's next turn.
Goat text: Once during each of your Standby Phases: You can pay 700 Life Points, then target 1 Warrior or Machine-Type monster you control; switch the current ATK and DEF of that target until the end of your opponent's next turn.
Edison rulings: ●Weapon Change applies to the current ATK & DEF.
●Weapon Change's effect targets 1 monster. You select the monster when you activate Weapon Change's effect.
●If you use Weapon Change's effect on Freed the Matchless General, Weapon Change is destroyed.
●Even if the selected monster's Type is changed by DNA Surgery, the monster receives the effect of Weapon Change.
●If Weapon Change is removed from the field by Giant Trunade or Emergency Provisions, Weapon Change's effect is not applied.
●If Imperial Order is activated after Weapon Change, Weapon Change's effect is negated, but if Imperial Order is destroyed, then Weapon Change's effect is re-applied.
●If you switch a monster's ATK/DEF with Weapon Change, and then apply a new modifier, apply it to the switched ATK/DEF. Then, after Weapon Change's effect ceases, re-apply the modifier to the reverted ATK/DEF once again.
●If you use Weapon Change to make Gear Golem into a 2200/800 monster, then use Limiter Removal to make it 4400/800, then destroy Weapon Change, Gear Golem is 800/4400.

## Weather Report
[effect Flip Effect Level 4 WATER Aqua 950/1500] formats: both
Text (Edison): FLIP: Destroys all of your opponent's face-up "Swords of Revealing Light" on the field. If "Swords of Revealing Light" is destroyed, you can perform your Battle Phase twice this turn (or your next turn, if activated during your opponent's turn).

## Whirlwind Prodigy
[effect Level 4 WIND Fairy 1500/1600] formats: both
Text (Edison): When Tribute Summoning a WIND monster, you can treat this 1 monster as 2 Tributes.

## Widespread Ruin
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When an opponent's monster declares an attack: Destroy the Attack Position monster your opponent controls with the highest ATK (your choice, if tied).

## Wild Nature's Release
[spell Normal] formats: both
Text (Edison): Target 1 Beast or Beast-Warrior monster; it gains ATK equal to its current DEF until the End Phase. During the End Phase, destroy it.
Goat text: Target 1 Beast or Beast-Warrior-Type monster; it gains ATK equal to its current DEF until the End Phase. During the End Phase, destroy it.
Edison rulings: ●When you increase the ATK of a monster with Wild Nature's Release, then apply another modifier, the new modifier is applied to the current ATK points.
●If Ojama Yellow is equipped with Axe of Despair (1000 ATK, 1000 DEF), if Wild Nature's Release is activated then it increases Ojama Yellow to 2000 ATK, 1000 DEF. If Axe of Despair is then destroyed, Ojama Yellow remains 2000 ATK, 1000 DEF.
●If a monster is affected by Wild Nature's Release, and its Type is then changed with DNA Surgery, the effect of Wild Nature's Release is not negated and the monster is still destroyed during the End Phase.
●If you activate multiple Wild Nature's Releases, the effects are cumulative.

## Windstorm of Etaqua
[trap Normal] formats: both
Text (Edison): Change the battle positions of all face-up monsters your opponent controls.

## Witch's Apprentice
[effect Level 2 DARK Spellcaster 550/500] formats: both
Text (Edison): As long as this card remains face-up on the field, increase the ATK of all DARK monsters by 500 points and decrease the ATK of all LIGHT monsters by 400 points.

## Wodan the Resident of the Forest
[effect Level 3 EARTH Warrior 900/1200] formats: both
Text (Edison): Increase this card's ATK by 100 points for every Plant monster that is face-up on the field.
Goat text: Increase this card's ATK by 100 points for every Plant-Type monster that is face-up on the field.

## Woodland Sprite
[effect Level 3 EARTH Plant 900/400] formats: both
Text (Edison): Send 1 Equip Card equipped to this card to the GY. Inflict 500 points of damage to your opponent's LP.
Goat text: Send 1 Equip Card equipped to this card to the Graveyard. Inflict 500 points of damage to your opponent's Life Points.
Edison rulings: ●Woodland Sprite gives you the ability to send Equip Spell Cards equipped to it to the GY. Sending them to the GY for this specific purpose is the only way to activate the effect and inflict 500 points of damage to your opponent.
●This card’s effect can only be activated during your Main Phase, but may be activated more than once per turn.
●An Equip Spell Card sent to the GY by this card’s effect is not destroyed. So the effects of Butterfly Dagger – Elma, Axe of Despair, Malevolent Nuzzler, Blast with Chain, or Smoke Grenade of the Thief can't or won't be activated.
●If you send Black Pendant to the GY with this card’s effect, the effect of Black Pendant will activate, because it does not have to be destroyed, just sent to the GY.
●You can activate Premature Burial to Special Summon Woodland Sprite from your GY, and then its effect to send Premature Burial to the GY and Woodland Sprite will remain on the field. This is because Premature Burial was not destroyed.
●If you opponent activates Snatch Steal and equips it to your Woodland Sprite, they may choose to activate its effect and send Snatch Steal to the GY. You will take 500 damage, and then control of Woodland Sprite would return to you.

## World Suppression
[trap Normal] formats: both
Text (Edison): You can only activate this card when a Field Spell Card is activated. Negate the Field Spell Card during the turn this card is activated.

## Wynn the Wind Charmer
[effect Flip Effect Level 3 WIND Spellcaster 500/1500] formats: both
Text (Edison): FLIP: While this card is face-up on the field, take control of 1 WIND monster your opponent controls.
Edison rulings: ●If your opponent chains “Enemy Controller” to the activation of the Flip Effect of a “Charmer”, and takes control of the “Charmer”, the Flip Effect disappears.
●If you take control of the opponent’s monster with a “Charmer” and the opponent takes control back with “Change of Heart”, control still reverts to you after the effect of “Change of Heart” expires (even though it wasn’t your monster originally).
●If your opponent takes control of your monster with “Snatch Steal”, and you activate the Flip Effect of a “Charmer” to take it back, you keep control while the “Charmer” is face-up on the field.
●If “Book of Moon” is chained to the Flip Effect of a “Charmer” to flip the target monster face-down, the effect of the “Charmer” disappears.
●If a “Charmer” is removed from play with “Interdimensional Matter Transporter”, its effect is not re-applied when it’s back on the field.
●If “DNA Transplant” changes a monster’s Attribute so that it can be taken by a “Charmer”, and then “DNA Transplant” is destroyed so that the monster’s Attribute no longer corresponds to the effect of the “Charmer”, the controller of the “Charmer” loses control of the monster.
●If the turn player controls a “Charmer” and a monster controlled by its effect, and activates “Assault on GHQ” and targets the controlled monster, and the opponent chains an effect to destroy the “Charmer”, the controlled monster returns to the opponent’s control, but is still destroyed by the effect of “Assault on GHQ”.

## Xing Zhen Hu
[trap Continuous] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① Activate by targeting 2 Set Spells/Traps on the field. ② Those targets can't be activated.
Goat text: Activate by selecting 2 Set Spell or Trap Cards on the field. The selected Spell or Trap Cards cannot be activated.
Edison rulings: ●You can chain one of the 2 Spell or Trap Cards on the field to the activation of Xing Zhen Hu. However, the remaining one won't be able to be activated after Xing Zhen Hu resolves.
●If neither of the targeted Spell or Trap Cards is on the field when Xing Zhen Hu resolves, then Xing Zhen Hu remains on the field meaninglessly.

## XY-Dragon Cannon
[fusion Fusion Level 6 LIGHT Machine 2200/1900] formats: both
Text (Edison): "X-Head Cannon" + "Y-Dragon Head"
Must first be Special Summoned (from your Extra Deck) by banishing the above cards you control. (You don't use "Polymerization".) Cannot be Special Summoned from the GY. You can discard 1 card, then target 1 face-up Spell/Trap Card your opponent controls; destroy that target.
Goat text: "X-Head Cannon" + "Y-Dragon Head"
Must first be Special Summoned (from your Extra Deck) by banishing the above cards you control. (You do not use "Polymerization".) Cannot be Special Summoned from the Graveyard. You can discard 1 card, then target 1 face-up Spell/Trap Card your opponent controls; destroy that target.
Rulings: 1. XYZ FUSION MONSTERS: The following rules apply to "XYZ-Dragon Cannon", "YZ-Tank Dragon", "XY-Dragon Cannon", and "XZ-Tank Cannon".
2. These monsters cannot be Special Summoned from the Extra Deck except by the method described in their text. So they cannot be Special Summoned by the effect of "Magical Scientist" or "Summoner of Illusions". They cannot be Special Summoned from the GY even after they have been Special Summoned by the method described in their texts.
3. You must remove from play the monsters specified; you cannot use "Goddess with the Third Eye", etc., because you are not performing a Fusion Summon.
4. You CAN remove a face-down "X-Head Cannon", etc., from play to Special Summon one of these monsters from the Extra Deck.
5. The Special Summoning of these monsters from the Extra Deck has no Spell Speed and cannot be chained to (but can be negated with "Solemn Judgment").

## XYZ-Dragon Cannon
[fusion Fusion Level 8 LIGHT Machine 2800/2600] formats: both
Text (Edison): "X-Head Cannon" + "Y-Dragon Head" + "Z-Metal Tank"
Must first be Special Summoned (from your Extra Deck) by banishing the above cards you control. (You don't use "Polymerization".) Cannot be Special Summoned from the GY. You can discard 1 card, then target 1 card your opponent controls; destroy that target.
Goat text: "X-Head Cannon" + "Y-Dragon Head" + "Z-Metal Tank"
Must first be Special Summoned (from your Extra Deck) by banishing the above cards you control. (You do not use "Polymerization".) Cannot be Special Summoned from the GY. You can discard 1 card, then target 1 card your opponent controls; destroy that target.
Rulings: 1. XYZ FUSION MONSTERS: The following rules apply to "XYZ-Dragon Cannon", "YZ-Tank Dragon", "XY-Dragon Cannon", and "XZ-Tank Cannon".

These monsters cannot be Special Summoned from the Extra Deck except by the method described in their text. So they cannot be Special Summoned by the effect of "Magical Scientist" or "Summoner of Illusions". They cannot be Special Summoned from the GY even after they have been Special Summoned by the method described in their texts.

You must remove from play the monsters specified; you cannot use "Goddess with the Third Eye", etc., because you are not performing a Fusion Summon.

You CAN remove a face-down "X-Head Cannon", etc., from play to Special Summon one of these monsters from the Extra Deck.

The Special Summoning of these monsters from the Extra Deck has no Spell Speed and cannot be chained to (but can be negated with "Solemn Judgment").

## XZ-Tank Cannon
[fusion Fusion Level 6 LIGHT Machine 2400/2100] formats: both
Text (Edison): "X-Head Cannon" + "Z-Metal Tank"
Must first be Special Summoned (from your Extra Deck) by banishing the above cards you control. (You don't use "Polymerization".) Cannot be Special Summoned from the GY. You can discard 1 card, then target 1 face-down Spell/Trap Card your opponent controls; destroy that target.
Goat text: "X-Head Cannon" + "Z-Metal Tank"
Must first be Special Summoned (from your Extra Deck) by banishing the above cards you control. (You do not use "Polymerization".) Cannot be Special Summoned from the Graveyard. You can discard 1 card, then target 1 face-down Spell/Trap Card your opponent controls; destroy that target.
Rulings: 1. XYZ FUSION MONSTERS: The following rules apply to "XYZ-Dragon Cannon", "YZ-Tank Dragon", "XY-Dragon Cannon", and "XZ-Tank Cannon".
2. These monsters cannot be Special Summoned from the Extra Deck except by the method described in their text. So they cannot be Special Summoned by the effect of "Magical Scientist" or "Summoner of Illusions". They cannot be Special Summoned from the GY even after they have been Special Summoned by the method described in their texts.
3. You must remove from play the monsters specified; you cannot use "Goddess with the Third Eye", etc., because you are not performing a Fusion Summon.
4. You CAN remove a face-down "X-Head Cannon", etc., from play to Special Summon one of these monsters from the Extra Deck.
5. The Special Summoning of these monsters from the Extra Deck has no Spell Speed and cannot be chained to (but can be negated with "Solemn Judgment").

## Y-Dragon Head
[effect Effect Union Level 4 LIGHT Machine 1500/1600] formats: both
Text (Edison): Once per turn, you can either: Target 1 "X-Head Cannon" you control; equip this card to that target, OR: Unequip this card and Special Summon it. A monster equipped with this card gains 400 ATK/DEF, also if the equipped monster would be destroyed by battle or card effect, destroy this card instead.
Edison rulings: These rulings apply to all Union Monsters: https://edisonformat.net/rules/compendium/union-monsters

## Yado Karu
[effect Level 4 WATER Aqua 900/1700] formats: both
Text (Edison): When this card is changed from Attack Position to Defense Position, you can place any number of cards from your hand at the bottom of your Deck in any order you desire.

## Yamata Dragon
[effect Effect Spirit Level 7 FIRE Dragon 2600/3100] formats: both
Text (Edison): Ⓢ Cannot be Special Summoned. 
① During the End Phase, if this card was Normal Summoned or flipped face-up this turn: Return it to the hand.
② If this card inflicts Battle Damage to your opponent: Draw cards until you have 5 cards in hand.
Goat text: This card cannot be Special Summoned. This card returns to its owner's hand during the End Phase of the turn it is Normal Summoned or flipped face-up. When this card inflicts Battle Damage to your opponent, draw cards until you have 5 cards in your hand.
Rulings: 1. The following rules apply to all Spirit Monsters:
2. Spirit is not a monster Type; you cannot declare "Spirit" for the effect of "DNA Surgery".
3. Spirit Monsters are still Effect Monsters.
4. A Spirit Monster must be face-up on the field during the End Phase for it to return to the owner's hand. If it was destroyed or removed from play, it will not return to the owner's hand.
5. A Spirit Monster will return to the owner's hand during the End Phase, even if the opponent played it from their hand (through the effect of "Exchange".)

## Yami
[spell Field] formats: both
Text (Edison): All Fiend and Spellcaster monsters on the field gain 200 ATK/DEF, also all Fairy monsters on the field lose 200 ATK/DEF.

## Yata-Garasu
[effect Effect Spirit Level 2 WIND Fiend 200/100] formats: both
Text (Edison): This card Cannot be Special Summoned. This card returns to its owner's hand during the End Phase of the turn it is Normal Summoned or flipped face-up. When this card inflicts Battle Damage to your opponent, they skip their next Draw Phase.
Goat text: This card cannot be Special Summoned. This card returns to its owner's hand during the End Phase of the turn it is Normal Summoned or flipped face-up. When this card inflicts Battle Damage to your opponent, they skip their next Draw Phase.
Edison rulings: ●If the Battle Damage caused by this card is reduced to 0 (with the effect of Kuriboh, Waboku, etc.) its effect is not activated.
●If this face-down Defense Position card is attacked by a monster with 0 ATK, its effect will activate, since Battle Damage was inflicted to the attacking player.

## Yellow Luster Shield
[spell Continuous] formats: both
Text (Edison): Increase the DEF of all monsters on your side of the field by 300 points.

## Yomi Ship
[effect Level 3 WATER Aqua 800/1400] formats: both
Text (Edison): If this card is destroyed by battle and sent to the GY: Destroy the monster that destroyed this card.
Edison rulings: ●This card does NOT target. So it will destroy a Dragon even if Lord of D. is in play, etc.
●If destroyed by Dark Ruler Ha Des, etc., the effect of Yomi Ship is negated.

## YZ-Tank Dragon
[fusion Fusion Level 6 LIGHT Machine 2100/2200] formats: both
Text (Edison): "Y-Dragon Head" + "Z-Metal Tank"
Must first be Special Summoned (from your Extra Deck) by banishing the above cards you control. (You don't use "Polymerization".) Cannot be Special Summoned from the GY. You can discard 1 card, then target 1 face-down monster your opponent controls; destroy that target.
Goat text: "Y-Dragon Head" + "Z-Metal Tank"
Must first be Special Summoned (from your Extra Deck) by banishing the above cards you control. (You do not use "Polymerization".) Cannot be Special Summoned from the Graveyard. You can discard 1 card, then target 1 face-down monster your opponent controls; destroy that target.
Rulings: 1. XYZ FUSION MONSTERS: The following rules apply to "XYZ-Dragon Cannon", "YZ-Tank Dragon", "XY-Dragon Cannon", and "XZ-Tank Cannon".
2. These monsters cannot be Special Summoned from the Extra Deck except by the method described in their text. So they cannot be Special Summoned by the effect of "Magical Scientist" or "Summoner of Illusions". They cannot be Special Summoned from the GY even after they have been Special Summoned by the method described in their texts.
3. You must remove from play the monsters specified; you cannot use "Goddess with the Third Eye", etc., because you are not performing a Fusion Summon.
4. You CAN remove a face-down "X-Head Cannon", etc., from play to Special Summon one of these monsters from the Extra Deck.
5. The Special Summoning of these monsters from the Extra Deck has no Spell Speed and cannot be chained to (but can be negated with "Solemn Judgment").

## Z-Metal Tank
[effect Effect Union Level 4 LIGHT Machine 1500/1300] formats: both
Text (Edison): Once per turn, you can either: Target 1 "X-Head Cannon" or "Y-Dragon Head" you control; equip this card to that target, OR: Unequip this card and Special Summon it. A monster equipped with this card gains 600 ATK/DEF, also if the equipped monster would be destroyed by battle or card effect, destroy this card instead.
Edison rulings: These rulings apply to all Union Monsters: https://edisonformat.net/rules/compendium/union-monsters

## Zaborg the Thunder Monarch
[effect Level 5 LIGHT Thunder 2400/1000] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① If Tribute Summoned: Target 1 monster on the field; destroy it.
Edison rulings: ● This effect is mandatory.

## Zero Gravity
[trap Normal] formats: both
Text (Edison): Change the battle positions of all face-up monsters on the field.
Edison rulings: ●Zero Gravity won't flip a card face-down.

## Zolga
[effect Level 4 EARTH Fairy 1700/1200] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When a monster is Tribute Summoned by Tributing this card: The owner of this card gains 2000 LP.
Goat text: When a monster is Tribute Summoned by Tributing this card: The owner of this card gains 2000 Life Points.
Edison rulings: ●When your opponent Tribute Summons with your Zolga using Soul Exchange, the controller of Zolga increases his Life Points.
●When your opponent takes your Zolga with Change of Heart and Tribute Summons with it, your opponent (the controller of Zolga when it was Tributed) increases his Life Points.
●When a Tribute Summon using Zolga is negated by Solemn Judgment, you don't increase your Life Points.
●The effect of Zolga can be chained to, and is Step 1 of a chain after a successful Summon. Effects like Trap Hole would be Step 2.
●When you Tribute Summon with 2 Zolgas, both Zolgas effects are activated.

## Zombie Tiger
[effect Effect Union Level 3 EARTH Zombie 1400/1600] formats: both
Text (Edison): Once per turn, you can either: Target 1 "Decayed Commander" you control; equip this card to that target, OR: Unequip this card and Special Summon it in Attack Position. While equipped by this effect, the equipped monster gains 500 ATK/DEF. If the equipped monster destroys an opponent's monster by battle: Discard 1 random card from their hand. (A monster can only be equipped with 1 Union monster at a time. If the equipped monster would be destroyed by battle, destroy this card instead.)
Edison rulings: These rulings apply to all Union Monsters: https://edisonformat.net/rules/compendium/union-monsters
●When a monster equipped with Zombie Tiger destroys another monster, the discard effect is applied before the destroyed monster is sent to the GY.

## Zombyra the Dark
[effect Level 4 DARK Warrior 2100/500] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): This card can't attack your opponent directly. If this card destroys a monster by battle: This card loses 200 ATK.
Goat text: This card cannot attack your opponent directly. If this card destroys a monster by battle: This card loses 200 ATK.
Edison rulings: ●If this monster is flipped face-down its effect is reset (its ATK will again be 2100).
●You can damage your opponent’s Life Points by attacking an opponent’s monster with a lower ATK than Zombyra the Dark, but you can't attack directly with him.
●If Zombyra the Dark is the target of Dark Spirit of the Silent and your opponent controls no monsters, it may attack directly.
●The reduction in ATK occurs immediately after the opposing monster is destroyed.

## Alien Brain
[trap Normal] formats: edison
Text (Edison): When a Reptile monster you control is destroyed by battle with an opponent's attacking monster and sent to the GY: Take control of the opponent's monster, and if you do, it becomes Reptile.
Edison rulings: Activate only when a Reptile-Type monster you control is destroyed by battle with an opponent's attacking monster and sent to the GY. Take control of the attacking monster, and treat it as a Reptile-Type monster.
●This effect does not target.
●The destroyed monster must be Reptile-Type while on the field AND in the GY.
●Use this card in Substep 7 - End of the Damage Step after placing Trigger Effects on the Chain.
●You take control of your opponent’s monster permanently.
●If it is flipped face-down, you keep control but it is no longer treated as a Reptile-Type monster.
●You can take control of Reptile-Type monsters with this card.
●If you control your opponent’s Reptile-Type monster and it is destroyed and sent to their GY you can activate “Alien Brain.”

## Alien Dog
[effect Level 3 LIGHT Reptile 1500/1000] formats: edison
Text (Edison): When you Normal Summon an "Alien" monster, you can Special Summon this card from your hand. When you do, place 2 A-Counters on face-up monster(s) your opponent controls.
Edison rulings: ●The 
●This effect activates in the Summon response timing (like Trap Hole).
●If you wish to use this effect, you can't use Ignition Effect Priority in response to the Summon.
●This effect can't activate if the Normal Summon happens as Chain Link 2(+) by Ultimate Offering.
●Even if you have more than 1 “Alien Dog” in your hand, you can only activate the effect of 1.
●The mandatory Trigger Effect activates & resolves on the field.
●This effect activates after the Chain in which the effect resolved.
●You may place both A-Counters on a single monster, or one on each of two monsters.
●The effects of “Alien Dog” don't target. You select the monster(s) when the effect resolves.

## Alien Grey
[effect Flip Effect Level 2 LIGHT Reptile 300/800] formats: edison
Text (Edison): ① FLIP: Target 1 face-up monster your opponent controls; place 1 A-Counter on that target.
② Monsters with A-Counters lose 300 ATK/DEF for each A-Counter on them, while battling an 'Alien' monster, during Damage Calculation only.
③ After this card has been flipped face-up, if it is destroyed by battle and sent to the GY: Draw 1 card.
Edison rulings: ●While you control 2 copies of this card, a battling monster with 1 A-Counter will lose 600 ATK/DEF.

## Alien Hunter
[effect Level 4 WATER Reptile 1600/800] formats: edison
Text (Edison): ① If this card destroys a monster with an A-Counter by battle: This card can attack again in a row.
Edison rulings: ●“It can attack again in a row” means that this card can keep attacking until its condition to attack again is no longer fulfilled. It can make a second, third, fourth, etc attack this way.

## Alien Hypno
[effect Effect Gemini Level 4 WATER Reptile 1600/700] formats: edison
Text (Edison): This card is treated as a Normal Monster while face-up on the field or in the GY. While this card is face-up on the field, you can Normal Summon it to have it be treated as an Effect Monster with this effect:
● During your Main Phase, you can select 1 monster your opponent controls with an A-Counter(s), and take control of it while this card is on the field. During each of your End Phases, remove 1 A-Counter from each controlled monster. If all A-Counters are removed from one of these monsters, destroy it.
Edison rulings: These rulings apply to all Gemini Monsters: https://edisonformat.net/rules/compendium/gemini-monsters

## Alien Infiltrator
[effect Level 2 EARTH Reptile 800/500] formats: edison
Text (Edison): ① Once per turn: You can move this card to an adjasent unoccupied Monster Zone. 
② Can attack directly while your opponent controls no cards in this card's column.

## Alien Kid
[effect Level 4 LIGHT Reptile 1600/700] formats: edison
Text (Edison): ① If a monster(s) is Special Summoned to your opponent's field, place 1 A-Counter on it.
② Monsters with A-Counters lose 300 ATK/DEF for each A-Counter on them, while battling an 'Alien' monster, during Damage Calculation only.
Edison rulings: ●While you control 2 copies of this card, a battling monster with 1 A-Counter will lose 600 ATK/DEF.

## Alien Mars
[effect Level 3 FIRE Reptile 1000/1000] formats: edison
Text (Edison): ① Negate the effects of monsters with A-Coutners on them (except 'Alien Mars').
Rulings: 1. "Alien Mars" will not negate the effect of "Mystic Tomato" that was destroyed by battle but had an A-Counter, since "Mystic Tomato" does not have an A-Counter in the GY, where its effect activates.

## Alien Mother
[effect Level 6 DARK Reptile 2300/1500] formats: edison
Text (Edison): ① At the end of a Battle Phase in which this card destroyed a monster(s) with an A-Counter by battle and sent it to the GY: You can Special Summon that monster(s).
② If this card leaves the field, destroy that monster(s).
Edison rulings: ●This effect continuously targets that monster
●If this card becomes set, it no longer targets those monsters.
● If 'Skill Drain' is applying, those monsters aren't destroyed when it leaves the field.

## Alien Overlord
[effect Level 6 DARK Reptile 2200/1600] formats: edison
Text (Edison): Ⓤ You can remove 2 A-Counters from the field to Special Summon this card (from your hand).
① Once per turn: You can place 1 A-Counter on each face-up monster your opponent controls.
② Monsters with A-Counters lose 300 ATK/DEF for each A-Counter on them, while battling an 'Alien' monster, during Damage Calculation only.
Ⓤ You can only control 1 copy of this card.
Edison rulings: ●While you control 2 different monsters with the same ② effect, a battling monster with 1 A-Counter will lose 600 ATK/DEF.

## Alien Psychic
[effect Level 1 DARK Reptile 200/100] formats: edison
Text (Edison): ① If this card is Normal/Flip Summoned: Change it to Defense position.
 ② Monsters with A-Counters can't declare attacks.

## Alien Skull
[effect Level 4 WIND Reptile 1600/1800] formats: edison
Text (Edison): Ⓤ You can Special Summon this card (from your hand) to your opponent's field by tributing 1 Level 3 or lower monster they control, also place 1 A-Counter on this card (You can't Normal Summon/Set the turn you use this effect).
② Monsters with A-Counters lose 300 ATK/DEF for each A-Counter on them, while battling an 'Alien' monster, during Damage Calculation only.
Edison rulings: ● While you control 2 copies of this card, a battling monster with 1 A-Counter will lose 600 ATK/DEF.
● All of the Ⓤ is one single unclassified effect. Tributing a monster is a cost for this effect. This effect does not start a chain.

## Allure Queen LV3
[effect Level 3 DARK Spellcaster 500/500] formats: edison
Text (Edison): Once per turn, during your Main Phase, you can select 1 Level 3 or lower monster on your opponent's side of the field and equip it to this card. (Only 1 card at a time can be equipped due to this effect.) If this card would be destroyed by battle, the equipped monster is destroyed instead. During your Standby Phase, by sending this card to the GY while it's equipped due to its effect, Special Summon 1 "Allure Queen LV5" from your hand/Deck.
Edison rulings: ●The 
●This effect targets a face-up monster on your opponent's field.
●If Book of Moon is chained to the activation of Allure Queen LV3's effect to turn the Allure Queen face-down, the target is destroyed. It can't be equipped to a face-down monster.
●You can equip a monster to “Allure Queen LV3” that is having its Level reduced to 3 or lower by an effect, like “Demotion”.
●The Continuous Effect applies while this card is face-up on the field.
●Applying this effect does not start a Chain.
●The destroyed monster (that was equipped) is not considered to be destroyed by battle.
●The mandatory Trigger Effect activates & resolves on the field.
●Sending this card to the GY is a cost.
●This effect can't be activate while Macro Cosmos is in play.

## Allure Queen LV5
[effect Level 5 DARK Spellcaster 1000/1000] formats: edison
Text (Edison): Once per turn, during your Main Phase, if this card was Special Summoned by the effect of "Allure Queen LV3", you can select 1 Level 5 or lower monster on your opponent's side of the field and equip it to this card. (Only 1 card at a time can be equipped due to this effect.) If this card would be destroyed by battle, the equipped monster is destroyed instead. During your Standby Phase, by sending this card to the GY while it's equipped due to its effect, Special Summon 1 "Allure Queen LV7" from your hand/Deck.
Edison rulings: The 
●This effect targets a face-up monster on your opponent's field.
●If Book of Moon is chained to the activation of Allure Queen LV5's effect to turn the Allure Queen face-down,the target is destroyed. It can't be equipped to a face-down monster.
●You can equip a monster to “Allure Queen LV5” that is having its Level reduced to 5 or lower by an effect, like “Demotion”.
●If “Allure Queen LV5” is flipped face-down after being Special Summoned by the effect of “Allure Queen LV3”, it is no longer treated as having been Special Summoned by “Allure Queen LV3”. So you can no longer use its first effect to equip it with a monster. (However, it is still considered to have been Special Summoned for effects like “Special Hurricane”.)
●If “Allure Queen LV5” is Special Summoned by the effect of “Allure Queen LV3”, and is then temporarily removed from play with “Dimensionhole” or “Interdimensional Matter Transporter”, after it returns to the field it can still use its first effect. The fact that it was Special Summoned by “Allure Queen LV3” is not reset.
●If “Allure Queen LV5” is Special Summoned by the effect of “Allure Queen LV3”, and is then permanently removed from play with “D.D. Warrior”, if it is later Special Summoned by an effect like “Return from the Different Dimension”, it is no longer treated as being Special Summoned by “Allure Queen LV3”. So it can't use its first effect anymore.
●The Continuous Effect applies while this card is face-up on the field.
●Applying this effect

## Allure Queen LV7
[effect Level 7 DARK Spellcaster 1500/1500] formats: edison
Text (Edison): Once per turn, during your Main Phase, if this card was Special Summoned by the effect of "Allure Queen LV5", you can select 1 monster on your opponent's side of the field and equip it to this card. (Only 1 card at a time can be equipped due to this effect.) If this card would be destroyed by battle, the equipped monster is destroyed instead.
Edison rulings: ●The 
●This effect targets a face-up monster on your opponent's field.
●If Book of Moon is chained to the activation of Allure Queen LV7's effect to turn the Allure Queen face-down,the target is destroyed. It can't be equipped to a face-down monster.
●If “Allure Queen LV7” is flipped face-down after being Special Summoned by the effect of “Allure Queen LV5”, it is no longer treated as having been Special Summoned by “Allure Queen LV5”. So you can no longer use its first effect to equip it with a monster. (However, it is still considered to have been Special Summoned for effects like “Special Hurricane”.)
●If “Allure Queen LV7” is Special Summoned by the effect of “Allure Queen LV5”, and is then temporarily removed from play with “Dimensionhole” or “Interdimensional Matter Transporter”, after it returns to the field it can still use its first effect. The fact that it was Special Summoned by “Allure Queen LV5” is not reset.
●If “Allure Queen LV7” is Special Summoned by the effect of “Allure Queen LV5”, and is then permanently removed from play with “D.D. Warrior”, if it is later Special Summoned by an effect like “Return from the Different Dimension”, it is no longer treated as being Special Summoned by “Allure Queen LV5”. So it can't use its first effect anymore.
●The Continuous Effect applies while this card is face-up on the field.
●Applying this effect does not start a Chain.
●The destroyed monster (that was equipped) is not considered to be destroyed by battle.

## Arcana Call
[trap Normal] formats: edison
Text (Edison): Select 1 "Arcana Force" monster you control. Remove from play 1 "Arcana Force" monster from either player's GY. Until the End Phase, the selected monster's effect becomes the removed monster's effect for the same coin toss result.
Edison rulings: Select 1 Arcana Force monster you control. Remove from play 1 Arcana Force monster from either player's GY. Until the End Phase, the selected monster's effect becomes the removed monster's effect for the same coin toss result.
●Arcana Call targets 1 Arcana Force monster you control and 1 Arcana Force monster in the GY.
●If an effect is chained that removes the Arcana Force monster from the GY, the effect of Arcana Call disappears.
●The heads/tails effect of the Arcana Force monster you control is replaced by the effect of the removed from play Arcana Force monster. It does not have both effects simultaneously. The monster’s original heads/tails effect is reapplied when Arcana Call's effect disappears in the End Phase.

## Arcana Knight Joker
[fusion Fusion Level 9 LIGHT Warrior 3800/2500] formats: edison
Text (Edison): "Queen's Knight" + "Jack's Knight" + "King's Knight"
A Fusion Summon of this card can only be done with the above materials. Once per turn, when a Spell/Trap Card, or monster effect, is activated that targets this face-up card on the field (Quick Effect): You can discard the same type of card (Monster, Spell, or Trap); negate the effect.
Edison rulings: ●Fusion Substitute cards (like King of the Swamp) can't be used in this card's Fusion Summon.
●Elemental Hero Prisma (that has gained the name of one of this card's Fusion Material) can be used in this card's Fusion Summon.
●This card can be Special Summoned from the Extra Deck by Summoner of Illusions.
●The 
●This effect must be chained directly to the card or effect that is targeting “Arcana Knight Joker”.
●Discarding a card is a cost. This effect can be activated while Macro Cosmos is active.
●You can activate this effect during the Damage Step.
●This effect can't negate the effects of “Call of the Haunted” that destroys “Arcana Knight Joker” when it is destroyed.

## Arcana Force 0 - The Fool
[effect Level 1 LIGHT Fairy 0/0] formats: edison
Text (Edison): This card can't be destroyed by battle. This card can't be changed to Defense Position, except with a card effect. When this card is Summoned: Toss a coin and gain the appropriate effect. ● Heads: Negate your card effects that target this card, and destroy them. ● Tails: Negate your opponent's card effects that target this card, and destroy them.

## Arcana Force EX - The Dark Ruler
[effect Level 10 LIGHT Fairy 4000/4000] formats: edison
Text (Edison): Cannot be Normal Summoned/Set. Must be Special Summoned (from your hand) by sending 3 monsters you control to the GY, and Cannot be Special Summoned by other ways. When this card is Special Summoned: Toss a coin and gain the appropriate effect.
● Heads: This card can make a second attack during each Battle Phase, but if it does so using this effect, change it to Defense Position at the end of the Battle Phase. Its battle position can't be changed until the end of your next turn.
● Tails: If this card is destroyed, destroy all cards on the field.
Edison rulings: ●The Condition can't be negated.
●The Unclassified Effect applies in the hand (this Special Summon does not start a Chain).
●Sending 3 monsters you control to the GY is a cost. You can't send Monster Tokens or a face-up Battle Fader (Special Summoned by its effect) to the GY.
●You can't Special Summon this card from the GY / banished, even if properly Summoned.
●You can't Special Summon this card from the hand / Deck by another effect.
●The 
●When this effect resolves, this card gains the corresponding Effect. The corresponding effect can be negated by Skill Drain, but this card won't forget which effect is gained while face-up.
●The (HEADS) Continuous Effect applies while this card is face-up on the field.
●If your Arcana Force EX - The Dark Ruler is equipped with Twin Swords of Flashing Light - Tryce while its heads effect is applied, you will choose which effect to use when you attack twice. If you choose Arcana Force EX - The Dark Ruler's heads effect, it will be changed to Defense Position at the end of the Battle Phase.
●The (TAILS) Continuous Effect does not start a Chain.
●If Arcana Force EX - The Dark Ruler is destroyed by battle, all other cards on the field are destroyed when Arcana Force EX - The Dark Ruler is sent to the GY.

## Arcana Force EX - The Light Ruler
[effect Level 10 LIGHT Fairy 4000/4000] formats: edison
Text (Edison): Cannot be Normal Summoned/Set. Must be Special Summoned (from your hand) by sending 3 monsters you control to the GY, and Cannot be Special Summoned by other ways. When this card is Special Summoned: Toss a coin and gain the appropriate effect.
● Heads: When this card destroys an opponent's monster by battle and sends it to the GY: You can target 1 card in your GY; add that target to your hand.
● Tails: During either player's turn, when a Spell/Trap Card, or monster effect, that targets this card is activated: This card loses exactly 1000 ATK and you negate the activation, and if you do, destroy it.
Edison rulings: ●The Unclassified Effect applies in the hand (this Special Summon does not start a Chain).
●Sending 3 monsters you control to the GY is a cost. You can't send Monster Tokens or a face-up Battle Fader (Special Summoned by its effect) to the GY.
●You can't Special Summon this card from the GY / banished, even if properly Summoned.
●You can't Special Summon this card from the hand / Deck by another effect.
●The 
●When this effect resolves, this card gains the corresponding Effect. The corresponding effect can be negated by Skill Drain, but this card won't forget which effect is gained while face-up.
●If the heads / tails effect of Arcana Force EX - The Light Ruler is activated and an effect is chained that removes it from the field, the effect of Arcana Force EX - The Light Ruler still resolves.
●When Arcana Force EX - The Light Ruler is Special Summoned and its effect activates, if an effect is chained that flips it face-down or removes it from the field, the effect of Arcana Force EX - The Light Ruler disappears and you don't toss a coin.
●If Skill Drain is activated after Arcana Force EX - The Light Ruler is Special Summoned, the effect of Arcana Force EX - The Light Ruler is negated. If Skill Drain is later negated or removed from the field, the effect of Arcana Force EX - The Light Ruler is not reapplied.
●The (HEADS) Trigger Effect is optional, it activates & resolves on the field.
●This effect can activate if this card is face-up on the field in Substep 7 - End of the Dam

## Arcana Force I - The Magician
[effect Level 4 LIGHT Fairy 1100/1100] formats: edison
Text (Edison): When this card is Summoned, toss a coin:
● Heads: When a Spell Card is activated, this card's ATK becomes double its original ATK until the End Phase of that turn.
● Tails: When a Spell Card is activated, your opponent gains 500 LP.
Edison rulings: ●The Trigger Effect is mandatory, it activates & resolves on the field.
●When this effect resolves, this card gains the corresponding Effect. The corresponding effect can be negated by Skill Drain, but this card won't forget which effect is gained while face-up.
●The heads/tails effects of Arcana Force I - The Magician are Continuous Effects and are applied immediately after the Spell Card resolves.
●The (HEADS) Continuous Effect applies while this card is face-up on the field.
●The heads effect of Arcana Force I - The Magician does not change its original ATK. It creates a new current ATK equal to twice its original ATK. Any other increases or decreases of ATK are reapplied to this new ATK value.
●If Arcana Force I - The Magician is affected by a Spell Card that changes its ATK, like “Shrink” or “Rush Recklessly,” first the Spell Card’s effect is applied, then “Arcana Force I – The Magician’s” effect is applied, changing its current ATK to twice its original ATK, or 2200.
●The (TAILS) Continuous Effect applies while this card is face-up on the field.
●Your opponent gains 500 Life Points when an activated Spell resolves. This does not start a Chain.

## Arcana Force III - The Empress
[effect Level 4 LIGHT Fairy 1300/1300] formats: edison
Text (Edison): When this card is Summoned, toss a coin: ● Heads: Each time your opponent Normal Summons or Sets a monster, you can Special Summon 1 "Arcana Force" monster from your hand. ● Tails: Each time your opponent Normal Summons or Sets a monster, send 1 card from your hand to the GY.

## Arcana Force IV - The Emperor
[effect Level 4 LIGHT Fairy 1400/1400] formats: edison
Text (Edison): When this card is Summoned, toss a coin: ● Heads: All "Arcana Force" monsters you control gain 500 ATK. ● Tails: All "Arcana Force" monsters you control lose 500 ATK.

## Arcana Force VI - The Lovers
[effect Level 4 LIGHT Fairy 1600/1600] formats: edison
Text (Edison): When this card is Summoned, toss a coin: ● Heads: This card can be treated as 2 Tributes for the Tribute Summon of an "Arcana Force" monster. ● Tails: You can't Tribute Summon "Arcana Force" monsters.

## Arcana Force VII - The Chariot
[effect Level 4 LIGHT Fairy 1700/1700] formats: edison
Text (Edison): When this card is Summoned, toss a coin:
● Heads: If this card destroys an opponent's monster by battle, you can Special Summon that monster to your side of the field.
● Tails: Your opponent gains control of this card.
Edison rulings: ●The Trigger Effect is mandatory, it activates & resolves on the field.
●When this effect resolves, this card gains the corresponding Effect. The corresponding effect can be negated by Skill Drain, but this card won't forget which effect is gained while face-up.
●The (HEADS) Trigger Effect is optional, it activates & resolves on the field.
●This effect activates in Substep 7 - End of the Damage Step.
●If The Chariot is destroyed by a monster with equal ATK, its heads effect wont activate.
●If your Arcana Force VII - The Chariot destroys a Crystal Beast monster by battle and the Crystal Beast monster is placed into the Spell and Trap Card Zone, you can't Special Summon that Crystal Beast monster.
●The (TAILS) Continuous Effect applies while this card is face-up on the field.
●If Reversal of Fate changes Arcana Force VII - The Chariot's effect from heads to tails, control of Arcana Force VII - The Chariot immediately shifts to the opponent. If its effect is changed to heads again after control is shifted to the opponent, it remains under the opponent's control.

## Arcana Force XIV - Temperance
[effect Level 6 LIGHT Fairy 2400/2400] formats: edison
Text (Edison): During damage calculation, in either player's turn: You can discard this card; you take no Battle Damage from that battle. When this card is Summoned: Toss a coin and apply this effect. The effect lasts while this card is face-up on the field.
● Heads: Halve all Battle Damage you take.
● Tails: Halve all Battle Damage your opponent takes.
Edison rulings: ●The Quick Effect activates & resolves in the hand.
●Discarding this card is a cost.
●This effect is activated in Substep 4 - Damage Calculation.
●The Trigger Effect is mandatory, it activates & resolves on the field.
●When this effect resolves, this card gains the corresponding Effect. The corresponding effect can be negated by Skill Drain, but this card won't forget which effect is gained while face-up.
●The (HEADS) Continuous Effect applies while this card is face-up on the field.
●This effect applies in Substep 4 - Damage Calculation, even if this card is destroyed by battle.
●The (TAILS) Continuous Effect applies while this card is face-up on the field.
●This effect applies in Substep 4 - Damage Calculation, even if this card is destroyed by battle.

## Arcana Force XVIII - The Moon
[effect Level 7 LIGHT Fairy 2800/2800] formats: edison
Text (Edison): When this card is Summoned, toss a coin: ● Heads: During your Standby Phase, you can Special Summon 1 "Moon Token" (Fairy/LIGHT/Level 1/ATK 0/DEF 0). ● Tails: During each of your End Phases, select 1 monster you control and give control of it to your opponent.
Edison rulings: ●The Trigger Effect is mandatory, it activates & resolves on the field.
●When this effect resolves, this card gains the corresponding Effect. The corresponding effect can be negated by Skill Drain, but this card won't forget which effect is gained while face-up.
●The (HEADS) Trigger Effect is optional, it activates & resolves on the field.
●The (TAILS) Trigger Effect is mandatory, it activates & resolves on the field.
●This effect targets 1 monster you control.
●Monsters given to your opponent with Arcana Force XVIII - The Moon's tails effect will remain on your opponent's side of the field when Arcana Force XVIII - The Moon is removed from the field or flipped face-down.

## Arcana Force XXI - The World
[effect Level 8 LIGHT Fairy 3100/3100] formats: edison
Text (Edison): When this card is Summoned, toss a coin: ● Heads: During your End Phase, you can send 2 monsters you control to the GY to skip your opponent's next turn. ● Tails: During your opponent's Draw Phase, add the top card of their GY to their hand.
Edison rulings: ●The Trigger Effect is mandatory, it activates & resolves on the field.
●When this effect resolves, this card gains the corresponding Effect. The corresponding effect can be negated by Skill Drain, but this card won't forget which effect is gained while face-up.
●The (HEADS) Trigger Effect is optional, it activates & resolves on the field.
●Sending 2 monsters you control to the GY is a cost, you can send Arcana Force XXI - The World as one of those monsters.
●This effect can't activate while Macro Cosmos, since you can't pay the cost.
●The (TAILS) Trigger Effect is mandatory, it activates & resolves on the field.
●This effect does NOT target a card in your opponent's GY.
●If the activation of this effect is negated (by Light and Darkness Dragon), this effect will activate again until it resolves (even if it resolves without effect due to Skill Drain).

## Archfiend General
[effect Level 4 DARK Fiend 2100/800] formats: edison
Text (Edison): You can discard this card to the GY to add 1 "Pandemonium" from your Deck to your hand. If this card is on the field but "Pandemonium" is not on the field, destroy this card.
Edison rulings: ●The Ignition Effect activates & resolves in the hand.
●Discarding this card to the GY is a cost. This effect can't activate while Macro Cosmos is active, since you can't pay the cost.
●The Continuous Effect applies while this card is face-up on the field.
●If this monster is attacked while in face-down Defense Position, and Pandemonium is not in play, this monster will be destroyed by its effect after Damage Calculation.
●Destroying this card does not use the Chain.
●This effect does not apply while this card's effects are negated (by Skill Drain).

## Archfiend of Gilfer
[effect Level 6 DARK Fiend 2200/2500] formats: edison
Text (Edison): When this card is sent to the GY: You can target 1 face-up monster on the field; equip that target with this card. That monster loses 500 ATK while equipped with this card.

## Archfiend Zombie-Skull
[synchro Synchro Level 6 DARK Zombie 2500/1200] formats: edison
Text (Edison): Plaguespreader Zombie" + 2 or more non-Tuner Zombies
① Zombies you control can't be destroyed by Card Effects.
Rulings: 1. If monsters are being treated as Zombies by "DNA Surgery" and you attempt to Summon a 2 copy of "Gravekeeper's Chief" while you already control one, it will be destroyed because this is not considered to be a card effect.
2. If you control "Archfiend Zombie-Skull" and "Il Blud" and "Il Blud" is removed from the field, any monsters Summoned by the effect of "Il Blud" will not be destroyed.
