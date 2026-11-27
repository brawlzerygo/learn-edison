# Full pool batch 24: 60 cards. Write js/cards/full-24.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Labyrinth of Nightmare
[trap Continuous] formats: both
Text (Edison): Once per turn, during each player's End Phase: Change the battle positions of all face-up monsters the turn player controls.
Edison rulings: ●This will activate the effect of Dream Clown.

## Labyrinth Tank
[fusion Fusion Level 7 DARK Machine 2400/2400] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Giga-Tech Wolf" + "Cannon Soldier"

## Larvae Moth
[effect Level 2 EARTH Insect 500/400] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): © Cannot be Normal Summoned/Set. 
© Must first Special Summoned (from your hand) by Tributing 1 "Petit Moth" on your 2nd turn or later, 
after it was equipped with "Cocoon of Evolution".
Goat text: This monster cannot be Normal Summoned or Set. This card can only be Special Summoned by Tributing "Petit Moth" during your 2nd turn after "Petit Moth" has been equipped with "Cocoon of Evolution".
Edison rulings: ● As long as this card was initially Special Summoned by its own procedure (and the summon wasn't negated),
you can Summon it from the GY with card effects.

## Laser Cannon Armor
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Equip only to an Insect monster. It gains 300 ATK/DEF.

## Legacy Hunter
[effect Level 4 EARTH Warrior 1000/1500] formats: both
Text (Edison): When this card attacks a face-down Defense Position monster and destroys it and sends it to the GY as a result of battle, your opponent returns 1 random card from their hand to their Deck. Their Deck is then shuffled.
Goat text: When this card attacks a face-down Defense Position monster and destroys it and sends it to the Graveyard as a result of battle, your opponent returns 1 random card from their hand to their Deck. Their Deck is then shuffled.
Edison rulings: ●If your Legacy Hunter attacks your monster (controlled by your opponent) on your opponent's side of the field, Legacy Hunter's effect still activates and your opponent returns a card to the Deck.
●If Legacy Hunter attacks a face-down Man-Eater Bug or Cyber Jar, Legacy Hunter's effect is not applied because Legacy Hunter's effect activates when the monster he destroyed is sent to the GY, and Legacy Hunter will no longer be on the field in these instances.
●The monster that Legacy Hunter attacks must be face-down at the start of the Damage Step for Legacy Hunter's effect to activate. So if Legacy Hunter attacks a face-down Defense Position monster and your opponent activates Ceasefire to flip the monster face-up, Legacy Hunter’s effect is NOT applied. Also, if Legacy Hunter attacks a face-up monster and Book of Moon flips it face-down, Legacy Hunter's effect DOES apply.

## Leghul
[effect Level 1 EARTH Insect 300/350] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): This monster may attack your opponent's LP directly.
Goat text: This monster may attack your opponent's Life Points directly.

## Lekunga
[effect Level 4 WATER Plant 1700/500] formats: both (Goat already has a goat-only script in js/cards/goat-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): You can banish 2 WATER monsters from your GY; Special Summon 1 "Lekunga Token" (Plant/WATER/Level 2/ATK 700/DEF 700) in Attack Position.
Goat text: You can banish 2 WATER monsters from your Graveyard; Special Summon 1 "Lekunga Token" (Plant-Type/WATER/Level 2/ATK 700/DEF 700) in Attack Position.
Edison rulings: ●You can't activate Lekunga's effect if you don't have a vacant Monster Card Zone on your side of the field.

## Lesser Fiend
[effect Level 5 DARK Fiend 2100/1000] formats: goat
Text: (This card is always treated as an "Archfiend" card.)
Banish any monster destroyed by battle with this card.

## Life Absorbing Machine
[trap Continuous] formats: both
Text (Edison): During your Standby Phase, gain LP equal to half of the total LP you paid during your last turn.
Goat text: During your Standby Phase, gain Life Points equal to half of the total Life Points you paid during your last turn.
Edison rulings: ●The total Life Points you paid is defined as the Life Points paid for costs (both activation costs and maintenance costs) of cards. It does not include damage or loss of Life Points. Damage is not included even if the damage was caused by an effect you control, such as if you activate Ring of Destruction.
●In your last turn is defined as the period from the start of your previous turn’s Draw Phase to the end of that turn’s End Phase. Cost that you paid during your opponent’s turn that occurred between your last turn and the current turn are not included.
●The effect of Life Absorbing Machine increases your Life Points for each cost you paid separately. So if you had Fire Princess on the field, and you paid 2 costs during your last turn, Fire Princess will deal 1000 points of damage to the opponent.
●Life Absorbing Machine does not have to be active at the time the Life Points were paid. If you pay a cost of 2000 Life Points during your turn, then activate Life Absorbing Machine during your opponent’s turn, the effect of Life Absorbing Machine will increase your Life Points by 1000 during your Standby Phase.
●Example: It is your turn. During your Standby Phase you pay 500 Life Points for your Terrorking Archfiend. During your Main Phase 1 you activate Life Absorbing Machine. Then you activate Delinquent Duo and pay 1000 Life Points for its cost. You Set Seven Tools of the Bandit and end your turn. During your opponent’s turn they activate Reinforcements and you chain Seven To

## Lighten the Load
[spell Continuous] formats: both
Text (Edison): Once per turn, you can add 1 Level 7 or higher monster from your hand to your Deck and shuffle it, then draw 1 card.
Edison rulings: ●When you activate the effect of Lighten the Load, your opponent gets to see the Level 7 or higher monster you add to your Deck.

## Lightforce Sword
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Banish 1 random card from your opponent's hand, face-down. During your opponent's 4th Standby Phase after this card's activation, return that card to their hand.
Edison rulings: ●If you chain Lightforce Sword to your opponent's Ritual Spell Card and remove from play the only Ritual Monster they could Ritual Summon, the Ritual Spell Card's effect disappears.
●If the Standby Phase of your opponent's 4th turn is skipped, the card remains removed from play face-down.
●If your opponent adds 1 of your Spell Cards to their hand with Graverobber and it is removed from play with Lightforce Sword, during the Standby Phase of your opponent's 4th turn it is placed into your GY instead of your opponent's hand.

## Lightning Blade
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Equip only to a Warrior monster. It gains 800 ATK. All WATER monsters lose 500 ATK.
Goat text: Equip only to a Warrior-Type monster. It gains 800 ATK. All WATER monsters lose 500 ATK.
Edison rulings: ●If the equipped monster’s Type is changed into something besides Warrior-Type by DNA Surgery or Scroll of Bewitchment, Lightning Blade will be destroyed.
●If two copies of this card are equipped to a single monster, that monster’s ATK will increase by 1600 points, and the ATK of all WATER monsters will decrease by 1000 points.

## Little Chimera
[effect Level 2 FIRE Beast 600/550] formats: both
Text (Edison): All FIRE monsters on the field gain 500 ATK. All WATER monsters on the field lose 400 ATK.

## Little-Winguard
[effect Level 4 WIND Warrior 1400/1800] formats: both
Text (Edison): Once per turn, during your End Phase: You can change the battle position of this card.
Edison rulings: ●Little-Winguard's effect can be chained to.
●Effects like Spellbinding Circle don't prevent you from using Little-Winguard's effect.

## Lone Wolf
[trap Continuous] formats: both
Text (Edison): Activate only if the 1 and only monster on your side of the field is "Chu-Ske the Mouse Fighter", "Monk Fighter", or "Master Monk". That monster can't be destroyed as a result of battle, and is unaffected by any of your opponent's monster effects.
Goat text: Activate only if the 1 and only monster on your side of the field is "Chu-Ske the Mouse Fighter", "Monk Fighter", or "Master Monk". That monster cannot be destroyed as a result of battle, and is unaffected by any of your opponent's monster effects.
Edison rulings: ●If you activate “Lone Wolf” targeting an appropriate monster, and later you Summon another monster, the effect of “Lone Wolf” is still applied.
●If you target “Monk Fighter”, etc. with “Lone Wolf”, and “Monk Fighter” is later flipped face-down, the effect of “Lone Wolf” disappears and is not re-activated even if “Monk Fighter” is later flipped face-up again.
●“Your opponent’s monster effects” on “Lone Wolf” means “the effects of monsters that your opponent controls”. So if your opponent uses “Monster Reborn” on your “Exiled Force”, they still can't Tribute “Exiled Force” to destroy your “Monk Fighter” targeted by “Lone Wolf”.
●If you Summon “Monk Fighter” and target it with “Lone Wolf”, and your opponent controls “Bug-Tusked Mammoth”, you can still attack that same turn with “Monk Fighter”.
●If your “Master Monk” targeted with “Lone Wolf” attacks and destroys “D.D. Assailant”, “D.D. Assailant” is removed from play but “Master Monk” is not.
●If your opponent Summons “Dark Jeroid” and reduces your “Monk Fighter” ATK by 800 points, then later you activate “Lone Wolf” targeting the “Monk Fighter”, it does not restore the ATK of “Monk Fighter”.
●Your “Monk Fighter” targeted by “Lone Wolf” can't be destroyed by the effect of “Tribe-Infecting Virus”. Furthermore, if it is the only monster on your side of the field, your opponent can't discard cards to activate “Tribe-Infecting Virus” to destroy Rock-Type monsters, because it will have no effect.
●If you have “Monk Fighter” targeted

## Lord of D.
[effect Level 4 DARK Spellcaster 1200/1100] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Neither player can target Dragon monsters on the field with card effects.
Edison rulings: ●Lord of D. can't negate effects; he only prevents Dragon-Type monsters from being selected as targets of effects. Once a target has been selected, the effect of Lord of D. is irrelevant.
●If your opponent activates Ring of Destruction targeting your Lord of D. and you chain D. Tribe to change Lord of D. to Dragon-Type, Ring of Destruction will still resolve and destroy Lord of D. since he was selected as a target before he was changed into Dragon-Type. If your opponent activates Ring of Destruction targeting a Dragon-Type monster you control and you chain Call of the Haunted to Special Summon Lord of D. from your GY, your Dragon-Type monster is still destroyed for the same reason.
●If you have Lord of D. on the field, and activate Premature Burial to Special Summon a Dragon-Type monster from your GY, that is okay, but if your opponent later destroys Premature Burial your Dragon-Type monster is also destroyed because Premature Burial is NOT selecting your Dragon-Type as a target.
●While you have Lord of D. on the field you can't equip your Dragon-Type monsters with Equip Spell Cards, but if you already have a Dragon-Type monster equipped with an Equip Spell Card when you Summon Lord of D., the Equip Spell card is not destroyed or negated, because Lord of D. only prevents Dragon-Type monsters from being selected as a target.
●Lord of D. won't stop Dark Hole, Mirror Force, Raigeki, Fissure, Smashing Ground, Hammer Shot, or Amazoness Archers, nor will he protect your Dragon-Type

## Lost Guardian
[effect Level 4 EARTH Rock 100/0] formats: both
Text (Edison): The original DEF of this card equals the number of your banished Rock monsters × 700.
Goat text: The original DEF of this card equals the number of your banished Rock-Type monsters × 700.
Edison rulings: ●Whenever the number of your monsters removed from play changes, re-calculate the DEF of “Lost Guardian”. (Just like “Shadow Ghoul”, etc.)
●NOTE: When a monster is removed from play, it goes to a “removed zone” (for lack of a better term) of the original owner. If the opponent controlled it, it will return to the opponent’s side of the field when it returns to player, however it is considered to be in the original owner’s “removed zone” while out of play. This is important for effects such as “Lost Guardian”.
●Example: Player A controls 2 monsters. Player B activates “Change of Heart” to take control of one of them, then activates “Different Dimension Gate” to remove both from play. Both monsters are in Player A’s “removed zone” while removed from play (so Player A’s “Lost Guardian” would have 1400 DEF). When “Different Dimension Gate” is destroyed, the monster Player B took control of will return to Player B’s side of the field (if possible, if not it is destroyed) before returning to Player A’s side of the field.
●Monsters removed from play and kept face-down, like with “Different Dimension Capsule” or “Lightforce Sword”, don't count towards the DEF of “Lost Guardian”.

## Luminous Soldier
[effect Level 5 LIGHT Warrior 2100/1400] formats: both
Text (Edison): If this card battles a DARK monster, increase the ATK of this card by 500 points during the Damage Step only.
Edison rulings: ●If the ATK of Luminous Soldier is reduced to 0 because of the effect of Fairy Box the ATK will increase by 500 points in the Damage Step if it is battling with a DARK monster.
●If the attack target of Luminous Soldier is redirected to a DARK monster by the effect of Dreamsprite the ATK of Luminous Soldier will then increase by 500 points.

## Luminous Spark
[spell Field] formats: both
Text (Edison): All LIGHT monsters gain 500 ATK and lose 400 DEF.

## Magician of Faith
[effect Flip Effect Level 1 LIGHT Spellcaster 300/400] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): FLIP: Target 1 Spell in your GY; add that target to your hand.

## Magician's Circle
[trap Normal] formats: both
Text (Edison): When a Spellcaster monster declares an attack: Each player Special Summons 1 Spellcaster monster with 2000 or less ATK from their Deck in Attack Position.

## Maha Vailo
[effect Level 4 LIGHT Spellcaster 1550/1400] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): This card gains 500 ATK for each Equip Card equipped to this card.

## Maharaghi
[effect Effect Spirit Level 4 EARTH Rock 1200/1700] formats: both
Text (Edison): This card Cannot be Special Summoned. This card returns to the owner's hand during the End Phase of the turn that this card is Normal Summoned or flipped face-up. If this card is Normal Summoned or flipped face-up, look at 1 card on the top of your Deck during your next Draw Phase (before you draw), and return the card to the top or the bottom of your Deck.
Goat text: This card cannot be Special Summoned. This card returns to the owner's hand during the End Phase of the turn that this card is Normal Summoned or flipped face-up. If this card is Normal Summoned or flipped face-up, look at 1 card on the top of your Deck during your next Draw Phase (before you draw), and return the card to the top or the bottom of your Deck.
Edison rulings: ●If two copies of Maharaghi had their effects activated, you resolve them one at a time. This means you look at 1 card, and if you place it back on top of your Deck, you will see it again for the second effect.

## Maiden of the Aqua
[effect Level 4 WATER Aqua 700/2000] formats: both
Text (Edison): As long as this card remains face-up on the field, the field is treated as "Umi" (however there is no increasing or decreasing of ATK/DEF due to "Umi"'s effect). If there is an active Field Spell Card on the field, this effect is not applied.
Edison rulings: ●The effect of Maiden of the Aqua is active only when there is no face-up Field Spell Card on the field. When a Field Spell Card is activated after Maiden of the Aqua is Summoned, the effect of Maiden of the Aqua is negated as long as there is a face-up Field Spell Card. If the only Field Spell Card is face-down, the effect of Maiden of the Aqua is active. If there is a face-up Field Spell Card but it is negated by Imperial Order, the effect of Maiden of the Aqua is not active.
●If a Field Spell Card is already active, and Maiden of the Aqua is Summoned, the existing Field Spell Card continues to function and Maiden of the Aqua’s effect is not applied until there is no face-up Field Spell Card.
●While Maiden of the Aqua is making the field Umi, you can activate Tornado Wall but if Maiden of the Aqua is destroyed, Tornado Wall is also destroyed.
●If Maiden of the Aqua, Umi, and Tornado Wall are all on your side of the field, and Umi is destroyed, Tornado Wall is not destroyed because Maiden of the Aqua treats the field as Umi as soon as Umi leaves play.
●If you have Maiden of the Aqua (with her effect active) and The Legendary Fisherman or Deepsea Warrior on your side of the field, and Dark Hole is activated, The Legendary Fisherman and Deepsea Warrior won't be destroyed.
●If you have Maiden of the Aqua and Tornado Wall on the field, and Maiden of the Aqua is attacked by Dark Driceratops and Battle Damage would be inflicted, Tornado Wall still prevents the damage during damage

## Maji-Gire Panda
[effect Level 4 EARTH Beast 1000/800] formats: both
Text (Edison): Each time a Beast monster(s) on the field is destroyed, this card gains 500 ATK.
Goat text: Each time a Beast-Type monster(s) on the field is destroyed, this card gains 500 ATK.
Edison rulings: ●The effect of “Maji-Gire Panda” is a Trigger Effect that activates when 1 or more Beast-Type monster
●You can chain to the activation of “Maji-Gire Panda”’s effect, including with “Divine Wrath”.
●If 2 or more Beast-Type monsters are destroyed at the same time, the ATK of “Maji-Gire Panda” only increases by 500 points.
●Beast-Type tokens like “Sheep Tokens” are included and will increase the ATK of “Maji-Gire Panda” when destroyed.
●Monsters changed to Beast-Type by “DNA Surgery” are included and will increase the ATK of “Maji-Gire Panda” when destroyed.
●Beast-Type monsters on your opponent’s side of the field are included and will increase the ATK of “Maji-Gire Panda” when destroyed.
●When face-down Beast-Type monsters are destroyed (by a card effect), the ATK of “Maji-Gire Panda” does not increase.
●The ATK increase from the effect of “Maji-Gire Panda” remains as long as “Maji-Gire Panda” remains face-up on the field.

## Major Riot
[trap Normal] formats: both
Text (Edison): You can activate this card when 1 or more of your monsters are returned from the field to your hand by your opponent's effect. Return all Monster Cards on the field to your respective hands. Both you and your opponent then Special Summon from your hand the same number of Monster Cards on the field in face-down Defense Position.
Edison rulings: ●Both players reveal their hand while resolving Major Riot.
●The monster returned to your hand by your opponent's card effect is not included in the number of returned monsters.
●High-Level monsters can't be Set with Major Riot.

## Maju Garzett
[effect Level 7 DARK Fiend 0/0] formats: both
Text (Edison): The ATK of this card becomes equal to the combined original ATK of the 2 monsters you Tributed for the Tribute Summon of this card.
Edison rulings: ●You can't search for Maju Garzett with Sangan or Mystic Tomato.
●You can Tribute face-down monsters for Maju Garzett and their ATK will count towards Maju Garzett's ATK.
●Maju Garzett's ATK will be 0 if you Special Summon it, or Tribute Summon it with a monster with ? ATK (such as Gradius' Option or another Maju Garzett), or Tribute Summon it with only 1 Tribute using Cost Down, or equip it with Megamorph, or if it's flipped face-down and then face-up again, or if you Tribute Summon it with Mirage Tokens, or if you remove it from play with Dimensionhole and it returns to the field.
●If Skill Drain is active, Maju Garzett's ATK is reset to 0 even if Skill Drain is later destroyed.
●If Maju Garzett battles Cat's Ear Tribe, its original ATK is changed to 200 for the battle, then after the battle its ATK is reset to 0.
●When you Tribute Monster Tokens to Tribute Summon Maju Garzett, the sum of their ATK's will be the ATK of Maju Garzett.
●When you Tribute Summon Maju Garzett, your opponent can use Trap Hole or Bottomless Trap Hole if appropriate.

## Makyura the Destructor
[effect Level 4 DARK Warrior 1600/1200] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card is sent from the Monster Zone to the GY: You can activate 1 Trap Card from your hand this turn. You can only use this effect of "Makyura the Destructor" once per turn.
Edison rulings: ●This card's effect is a Continuous Effect.
●You can't activate a Raigeki Break in your hand by discard Makyura the Destructor as a cost.

## Man-Thro' Tro'
[effect Level 4 EARTH Beast-Warrior 1000/1000] formats: both
Text (Edison): By Tributing 1 Normal Monster (except a Token) on your side of the field, inflict 800 points of damage to your opponent's LP.
Goat text: By Tributing 1 Normal Monster (except a Token) on your side of the field, inflict 800 points of damage to your opponent's Life Points.

## Manga Ryu-Ran
[effect Effect Toon Level 7 FIRE Dragon 2200/2600] formats: both (Goat already has a goat-only script in a goat file: port it as the shared script, adjusted to the Edison text)
Text (Edison): (This card is always treated as a "Toon" card.)
Cannot be Normal Summoned/Set. Must first be Special Summoned (from your hand) by Tributing 2 monsters, while you control "Toon World". can't attack the turn it is Special Summoned. You must pay 500 LP to declare an attack with this monster. If "Toon World" on the field is destroyed, destroy this card. Can attack your opponent directly, unless they control a Toon monster, in which case this card must target a Toon monster for its attacks.
Goat text: (This card is always treated as a "Toon" card.)
Cannot be Normal Summoned/Set. Must first be Special Summoned (from your hand) by Tributing 2 monsters, while you control "Toon World". Cannot attack the turn it is Special Summoned. You must pay 500 LP to declare an attack with this monster. If "Toon World" on the field is destroyed, destroy this card. Can attack your opponent directly, unless they control a Toon monster, in which case this card must target a Toon monster for its attacks.
Rulings: 1. This rule applies for "Toon Mermaid", "Toon Summoned Skull", "Manga Ryu-Ran" and "Blue-Eyes Toon Dragon": If "Toon World" is returned to a player's hand, with cards such as "Giant Trunade" these Toon Monsters are not destroyed since "Toon World" was not destroyed.

## Manticore of Darkness
[effect Level 6 FIRE Beast-Warrior 2300/1000] formats: both
Text (Edison): During the End Phase of the turn this card was sent to the GY: You can send to the GY 1 Beast, Beast-Warrior, or Winged Beast monster from your hand or your side of the field; Special Summon this card from your GY.
Goat text: During the End Phase of the turn this card was sent to the Graveyard: You can send to the Graveyard 1 Beast, Beast-Warrior, or Winged Beast-Type monster from your hand or your side of the field; Special Summon this card from your Graveyard.
Edison rulings: ●Manticore of Darkness' effect can be activated during the End Phase when it was sent to the GY from the field, hand, or your Deck that same turn.
●When you send 1 Manticore of Darkness to the GY to Special Summon another Manticore of Darkness, you can then send the new Manticore of Darkness to the GY to Special Summon the first Manticore of Darkness.
●If Card of Safe Return is active, and Manticore of Darkness is Special Summoned with its effect, you can draw a card. So with 2 Manticores of Darkness, 1 of them sent to the GY, and Card of Safe Return in play, you can draw as many cards as you want.
●When Manticore of Darkness is sent to the GY because of hand size adjustment in the End Phase, you can activate its effect.
●You can send a face-down Beast, Beast-Warrior, or Winged Beast-Type monster to the GY for Manticore of Darkness' effect.
●Sending monsters to the GY for Manticore of Darkness' effect is a cost.
●You can't send a Monster Token to the GY for Manticore of Darkness' effect because Monster Tokens are taken off the field instead of going to the GY.
●The owner of Manticore of Darkness gets the effect, so if your opponent controls your Manticore of Darkness and it's sent to the GY, you get to activate the effect.

## Marauding Captain
[effect Level 3 EARTH Warrior 1200/400] formats: both
Text (Edison): Your opponent can't target Warrior monsters for attacks, except this one. When this card is Normal Summoned: You can Special Summon 1 Level 4 or lower monster from your hand.
Goat text: Your opponent cannot target Warrior monsters for attacks, except this one. When this card is Normal Summoned: You can Special Summon 1 Level 4 or lower monster from your hand.
Edison rulings: ●If you have 2 Maurading Captains on your side of the field, the opponent can't attack any face-up Warrior-Type monsters you control. They can attack your Life Points directly if they control a monster with an effect that allows it (Such as Rainbow Flower, Inaba White Rabbit, or a Toon Monster). They could also attack a non-Warrior Type monster you control.
●Your opponent can attack face-down monsters while you have Maurading Captain on the field, even if the face-down monster is Warrior-Type.
●If you control Maurading Captain and a Warrior-Type monster equipped with Ring of Magnetism, the opponent must attack the monster equipped with Ring of Magnetism if they choose to attack.
●If you control 2 Maurading Captains and one of them is equipped with Ring of Magnetism, your opponent can't attack either one.
●If you control Patrician of Darkness, Maurading Captain and a Warrior-Type monster when your opponent attacks, you can use the effect of Patrician of Darkness to redirect the attack to Patrician of Darkness or Maurading Captain only. Not to the other Warrior-Type monster because it can't be attacked.
●The monster Special Summoned by the effect of Maurading Captain does NOT have to be a Warrior-Type monster.
●If your opponent activates Torrential Tribute in response to the Summoning of Maurading Captain (by chaining to the Trigger Effect of Marauding Captain), all monsters on the field will be destroyed, and then you Special Summon for Maurading Captain’s effect. If they wait

## Maryokutai
[effect Level 3 WATER Aqua 900/900] formats: both
Text (Edison): During your opponent's turn, if your opponent activates a Spell Card (Quick): You can Tribute this card; negate the activation, and if you do, destroy it.
Edison rulings: This is an optional Quick Effect.
● It is not a mandatory effect.
● It can chain to the activation of any type of Spell Card.

This effect can be used in the Damage Step.
● This effect can be used in the Damage Step even if Maryokutai is attacking or being attacked.
● This effect can not be used in Substeps 5, 6, or 7, if Maryokutai was destroyed in Battle.

## Mass Driver
[spell Continuous] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Tribute 1 monster on your side of the field to inflict 400 points of damage to your opponent's LP.
Goat text: Tribute 1 monster on your side of the field to inflict 400 points of damage to your opponent's Life Points.
Edison rulings: ●Tributing a monster for Mass Driver is a cost.
●You can use Mass Driver's effect repeatedly in the same turn as long as you can keep paying the cost.
●The activation of Mass Driver's effect can be chained to.

## Mataza the Zapper
[effect Level 3 DARK Warrior 1300/800] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): This card can make a second attack during each Battle Phase. Control of this face-up card on the field can't switch.
Goat text: This card can make a second attack during each Battle Phase. Control of this face-up card on the field cannot switch.
Edison rulings: ●You can't use Change of Heart on a face-up Mataza the Zapper.
●If you take control of a face-down Mataza the Zapper and flip it face-up, it stays on your side of the field and doesn't return to the original controller.
●If you use Monster Reborn on Mataza the Zapper while Remove Brainwashing is active, control of Mataza the Zapper does not return to the original owner.
●While Skill Drain is active, you can take control of Mataza the Zapper from your opponent.

## Mazera DeVille
[effect Level 8 DARK Fiend 2800/2300] formats: both
Text (Edison): © Cannot be Normal Summoned/Set. 
© Must be Special Summoned by tributing 1 face-up "Warrior of Zera" you control,
while "Pandemonium" is face-up on the field.
① If this card is Special Summoned: Your opponent discards 3 random cards (their entire hand, if less than 3).
(Activate and resolve only if you control "Pandemonium").
Goat text: This card cannot be Normal Summoned or Set. This card cannot be Special Summoned except by Tributing 1 face-up "Warrior of Zera" on your side of the field while "Pandemonium" is on the field. If "Pandemonium" is on your side of the field when you Special Summon this card, your opponent discards 3 random cards from their hand. If "Pandemonium" is not on your side of the field, this effect is not applied.
Edison rulings: ● The only way you can Special Summon this card is via its own procedure.
Even if it was initially summoned that way, you still can't summon it with card effects.

## Mecha-Dog Marron
[effect Level 4 LIGHT Machine 1000/1000] formats: both
Text (Edison): When this card is destroyed by battle and sent to the GY, inflict 1000 damage to both players. When this card on the field is destroyed and sent to the GY except by battle, inflict 1000 damage to your opponent.
Goat text: When this card is destroyed by battle and sent to the Graveyard, inflict 1000 damage to both players. When this card on the field is destroyed and sent to the Graveyard except by battle, inflict 1000 damage to your opponent.
Edison rulings: ●If “Mecha-Dog Marron” is destroyed in the middle of a chain, its effect starts a new chain when the current chain has finished resolving.
●You can use “Barrel Behind the Door” against either effect of “Mecha-Dog Marron”.

## Medusa Worm
[effect Level 2 EARTH Rock 500/600] formats: both
Text (Edison): Once per turn, you can flip this card into face-down Defense Position. When this card is Flip Summoned, destroy 1 monster on your opponent's side of the field.

## Mefist the Infernal General
[effect Level 5 DARK Fiend 1800/1700] formats: both
Text (Edison): If this card attacks a Defense Position monster, inflict piercing battle damage. If this card inflicts battle damage to your opponent: Make your opponent discard 1 random card.

## Mega Ton Magical Cannon
[spell Normal] formats: both
Text (Edison): Remove 10 Spell Counters on your side of the field. Destroy all cards on your opponent's side of the field.
Edison rulings: ●Removing Spell Counters is a cost. If you don't have 10 Spell Counters you can't activate Mega-Ton Magical Cannon.

## Megamorph
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① While your LP is lower than your opponent's, the equipped monster's ATK becomes double its original ATK.
② While your LP is higher than your opponent's, the equipped monster's ATK becomes half its original ATK.
Rulings: 1. "Megamorph" changes the current ATK of the monster it is equipped to. It calculates a new current ATK by half or doubling the equipped monster's original ATK.
2. Having multiple copies of "Megamorph" equipped to a monster is the same as having one.
3. "Megamorph" is always recalculating with every change in Life Points. For example, your "Jirai Gumo" is equipped with "Megamorph" and you have 8000 Life Points compared to your 7000. You declare an attack with "Jirai Gumo" and lose the coin toss, losing 4000 Life Points. Now the ATK of "Jirai Gumo" is doubled before Damage Calculation.
4. When Life Points are equal the equipped monster's ATK is unchanged.
5. You may equip "Megamorph" to your opponent's monster, but 'your Life Points' refers to the controller of "Megamorph". So if you have more Life Points than your opponent, your opponent's monster equipped with "Megamorph" has its ATK halved.

## Megarock Dragon
[effect Level 7 EARTH Rock 0/0] formats: both
Text (Edison): © Cannot be Normal Summoned/Set. 
© Must be Special Summoned (from your hand) by banishing any number of Rocks from your GY (min.1).
① The original ATK/DEF of this card is the number of Rocks banished for its Summon x700.
Goat text: This card cannot be Normal Summoned or Set. This card cannot be Special Summoned except by removing from play a Rock-Type monster(s) in your Graveyard. The original ATK and DEF of this card become the number of Rock-Type monsters you removed from play when you Special Summoned this card x 700.
Edison rulings: ● The only way you can Special Summon this card is via its own procedure.
Even if it was initially summoned that way, you still can't summon it with card effects.
● If this card's effects become negated, or if it is flipped face-down, its ATK becomes 0.

## Mermaid Knight
[effect Level 4 WATER Aqua 1500/700] formats: both
Text (Edison): While "Umi" is face-up on the field, this card can attack twice during the same Battle Phase.
Edison rulings: ●Mermaid Knight can attack twice if Maiden of the Aqua is making the field treated as Umi.
●If you declare your second attack with Mermaid Knight, and Umi is destroyed during the Battle Step, a replay occurs and you can't attack a second time with Mermaid Knight.
●If there is no Umi on the field and Mermaid Knight attacks, then you Special Summon Maiden of the Aqua to treat the field as Umi, you can attack a second time.

## Metalmorph
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Target 1 face-up monster on the field; equip this card to that target. It gains 300 ATK/DEF. If it attacks, it gains ATK equal to half the ATK of the attack target, during damage calculation only.
Edison rulings: ●If you equip a monster with 2 or more copies of “Metalmorph”, the effect of each copy of “Metalmorph” is applied. For example, if you equip 2 “Metalmorph” onto a monster it will gain 600 ATK and DEF and when the equipped monster attacks your opponent’s monster its ATK will be increased further by the effect of each “Metalmorph”.
●If “Reverse Trap” is activated, the increase of 300 ATK and DEF is changed into a decrease of 300 ATK and DEF. When your monster that is equipped with “Metalmorph” attacks your opponent’s monster, the additional gained ATK, that is based on the ATK of the monster being attacked, is NOT changed to a decrease.
●The additional ATK gained when your equipped monster attacks your opponent’s monster is applied when you attack a face-up or face-down monster. This effect does not target.
●If you have a Warrior-Type monster equipped with “Metalmorph” and it attacks your opponent’s “Kinetic Soldier”, the effect of “Kinetic Soldier” is resolved first. The monster equipped with “Metalmorph” will gain ATK equal to half of “Kinetic Soldier’s” total ATK.
●If your monster that is equipped with “Metalmorph” attacks your opponent’s “Injection Fairy Lily”, if your opponent activates “Injection Fairy Lily’s” effect it will be resolved first, and then after “Injection Fairy Lily’s” ATK is increased by 3000 your monster will gain additional ATK equal to half of “Injection Fairy Lily’s” total ATK.
●If your monster that is equipped with “Metalmorph” attacks your opponent’s 

## Metalsilver Armor
[spell Equip] formats: both
Text (Edison): As long as you control the monster equipped with this card, your opponent can't use the effect of a Spell, Trap, or Effect Monster that targets 1 monster, except the equipped monster.
Goat text: As long as you control the monster equipped with this card, your opponent cannot use the effect of a Spell, Trap, or Effect Monster that targets 1 monster, except the equipped monster.
Edison rulings: ●Your opponent can't activate Monster Reborn and other cards that target while you have a monster equipped with Metalsilver Armor. Your opponent can activate Raigeki, Mirror Force, and other cards that don't target.
●If you attack with Dark Magician, and you control another monster equipped with Metalsilver Armor, your opponent can't activate Magic Cylinder because Magic Cylinder targets and only the monster equipped with Metalsilver Armor can be targeted (and it is not attacking).
●If you have Metalsilver Armor active, your opponent can't target his/her monsters either (with Equip Spell Cards, etc.), including with Premature Burial.
●If you have 2 monsters equipped with Metalsilver Armor, your opponent can't activate any effects that target 1 monster.
●When you have a monster equipped with Metalsilver Armor, your opponent CAN activate the effect of Nimble Momonga or Giant Germ because their effects don't target 1 card.
●When you have a monster equipped with Metalsilver Armor, your opponent CAN activate Reinforcement of the Army.
●When you have a monster equipped with Metalsilver Armor, your opponent CAN activate the effect of The Thing in the Crater because it Special Summons a monster from your HAND.

## Metalzoa
[effect Level 8 DARK Machine 3000/2300] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Cannot be Normal Summoned/Set. Must first be Special Summoned (from your Deck) by Tributing "Zoa" equipped with "Metalmorph".

## Metamorphosis
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Tribute 1 monster. Special Summon 1 Fusion Monster from your Extra Deck with the same Level as the Tributed monster.
Edison rulings: ●Metamorphosis does not properly Summon a Fusion Monster, so you can't use Monster Reborn on it afterwards.
●Tributing a monster is a cost.
●You can Tribute a face-down monster.
●If you activated “Soul Exchange” targeting your opponent’s monster, if the monster is face-down, you can't Tribute it as a cost for “Metamorphosis”.
●You can Tribute a Monster Token (including a Sheep Token from Scapegoat).
●If there is no Fusion Monster with the same level as the Tributed monster in your Extra Deck, then you can't activate this card.
●Metamorphosis vs. A Legendary Ocean: if you want to Special Summon a Level 6 Fusion Monster from your Extra Deck, you have to Tribute a Level 7 WATER monster on the field because it is treated as a Level 6.

## Meteor of Destruction
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If your opponent's LP are higher than 3000: Inflict 1000 damage to your opponent.
Goat text: If your opponent's Life Points are higher than 3000: Inflict 1000 damage to your opponent.
Edison rulings: ●If you activate “Meteor of Destruction”, and an effect is chained that causes your opponent’s Life Points to fall below 3000, “Meteor of Destruction” was already activated properly, so it resolves as normal.

## Meteorain
[trap Normal] formats: both
Text (Edison): During this turn, when your monsters attack with an ATK that is higher than the DEF of your opponent's Defense Position monster, inflict the difference as Battle Damage to your opponent's LP.
Goat text: During this turn, when your monsters attack with an ATK that is higher than the DEF of your opponent's Defense Position monster, inflict the difference as Battle Damage to your opponent's Life Points.
Edison rulings: ●You can activate Meteorain during your turn at any point from the Draw Phase to the end of your Battle Phase; you can't activate it during the Damage Step, Main Phase 2, your End Phase, or your opponent's turn.
●Meteorain's effect applies to all your monsters. Monsters that you Summon, Flip Summon, Special Summon, etc. after activating Meteorain still get its effect.
●When you attack with a monster that has Meteorain's bonus, and you attack a Defense Position Amazoness Swordswoman, then you will take the Battle Damage to your Life Points.

## Michizure
[trap Normal] formats: both
Text (Edison): When a monster is sent from the field to your GY, even during the Damage Step: Target 1 monster on the field; destroy it.

## Micro Ray
[trap Normal] formats: both
Text (Edison): Target 1 face-up monster on the field; that target's DEF becomes 0 until the end of this turn.
Edison rulings: ●You select the monster when you activate Micro Ray.
●If you apply Micro Ray's effect and then a new card increases the DEF, add the new DEF to the zero.
●You can activate Micro Ray during the Damage Step.

## Mid Shield Gardna
[effect Level 4 EARTH Warrior 100/1800] formats: both
Text (Edison): Once per turn, you can flip this card into face-down Defense Position. Negate the activation of any Spell Card that targets this 1 face-down monster. At that time, flip this card into face-up Defense Position.
Edison rulings: ●The first effect of “Mid-Shield Gardna” is an Ignition Effect. The second is a Trigger Effect. You can chain to these effects. You can activate “Divine Wrath” against these effects.

## Millennium Scorpion
[effect Level 5 EARTH Insect 2000/1800] formats: both
Text (Edison): Each time this card destroys 1 monster on your opponent's side of the field by battle and sends it to the GY, this card gains 500 ATK.
Goat text: Each time this card destroys 1 monster on your opponent's side of the field by battle and sends it to the Graveyard, this card gains 500 ATK.
Edison rulings: ●The effect of “Millennium Scorpion” is a Trigger Effect. Each time it destroys a monster on your opponent’s side of the field and sends it to the GY as a result of battle, it activates. This effect can be chained to. You can activate “Divine Wrath” against it.
●If “Millennium Scorpion” attacks and destroys a Monster Token, the effect of “Millennium Scorpion” does not activate because a Monster Token isn’t sent to the GY.
●If “Millennium Scorpion” has an ATK boost from its effect, but is removed from play with “Interdimensional Matter Transporter”, or flipped face-down, the effect is reset and its ATK returns to normal.

## Milus Radiant
[effect Level 1 EARTH Beast 300/250] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): As long as this card remains face-up on the field, increase the ATK of all EARTH monsters by 500 points and decrease the ATK of all WIND monsters by 400 points.

## Minar
[effect Level 3 EARTH Insect 850/750] formats: both
Text (Edison): When this card is discarded directly from your hand to the GY by an effect of a card controlled by your opponent, inflict 1000 points of damage to your opponent's LP.
Goat text: When this card is discarded directly from your hand to the Graveyard by an effect of a card controlled by your opponent, inflict 1000 points of damage to your opponent's Life Points.
Edison rulings: ●If the summoning of Minar is negated by Solemn Judgment, etc. its effect is not activated, as it is not considered to have gone directly from your hand to the GY.

## Mine Golem
[effect Level 3 EARTH Rock 1000/1900] formats: both
Text (Edison): When this card is destroyed by battle and sent to the GY, inflict 500 damage to your opponent.
Goat text: When this card is destroyed by battle and sent to the Graveyard, inflict 500 damage to your opponent.
Edison rulings: ●The effect of “Mine Golem” is a Trigger Effect that activates when “Mine Golem” is sent to the GY after having been destroyed as a result of battle. It can be chained to.

## Minefield Eruption
[trap Normal] formats: both
Text (Edison): Inflict 1000 damage to your opponent for each face-up "Mine Golem" on your side of the field. After that, destroy all face-up "Mine Golem"(s) on your side of the field.
Edison rulings: ●If you activate “Minefield Eruption”, you inflict damage, then send your “Mine Golem”
●The number of “Mine Golem” cards is considered when “Minefield Eruption” resolves, not when it is activated.

## Minor Goblin Official
[trap Continuous] formats: both
Text (Edison): You can only activate this card when your opponent's LP are 3000 or less. Inflict 500 points of damage to your opponent's LP during each of his/her Standby Phases.
Goat text: You can only activate this card when your opponent's Life Points are 3000 or less. Inflict 500 points of damage to your opponent's Life Points during each of his/her Standby Phases.

## Mispolymerization
[trap Normal] formats: both
Text (Edison): Activate only when a Fusion Monster is Special Summoned. Return all face-up Fusion Monsters to their respective Extra Decks.

## Moai Interceptor Cannons
[effect Level 4 EARTH Rock 1100/2000] formats: both
Text (Edison): Once per turn, you can flip this card into face-down Defense Position.
