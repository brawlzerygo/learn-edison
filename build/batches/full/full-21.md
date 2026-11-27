# Full pool batch 21: 60 cards. Write js/cards/full-21.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Drill Bug
[effect Level 2 EARTH Insect 1100/200] formats: both
Text (Edison): When this card inflicts Battle Damage to your opponent's LP, you can select 1 "Parasite Paracide" card from your Deck, shuffle the Deck, and place "Parasite Paracide" on top of the Deck.
Goat text: When this card inflicts Battle Damage to your opponent's Life Points, you can select 1 "Parasite Paracide" card from your Deck, shuffle the Deck, and place "Parasite Paracide" on top of the Deck.

## Drillago
[effect Level 4 DARK Machine 1600/1100] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If the only cards your opponent controls are face-up monsters with 1600 or more ATK, this card can attack your opponent directly.
Edison rulings: ●If there are Spell or Trap Cards, or face-down monsters, on your opponent's side of the field, Drillago can't attack directly.
●If Drillago attacks directly, and your opponent activates an effect to reduce one of his face-up monsters to less than 1600 ATK, there is no longer a condition allowing Drillago to attack directly, and a replay occurs.
●If Drillago attacks directly, and your opponent activates Ready for Intercepting from his hand, because his/her Makyura the Destructor was sent to the GY earlier this turn, to flip one of his face-up monsters face-down, there is no longer a condition allowing Drillago to attack directly, and a replay occurs.

## Driving Snow
[trap Normal] formats: both
Text (Edison): You can only activate this card when 1 or more of your Trap Cards are destroyed and sent from the field to the GY by a card effect your opponent controls. Destroy 1 Spell or Trap Card on the field.
Goat text: You can only activate this card when 1 or more of your Trap Cards are destroyed and sent from the field to the Graveyard by a card effect your opponent controls. Destroy 1 Spell or Trap Card on the field.

## Drop Off
[trap Normal] formats: both
Text (Edison): When your opponent draws for their normal draw in their Draw Phase: Your opponent discards 1 card they just drew.
Edison rulings: ●The card discarded by the effect of Drop Off is considered to be discarded from your hand, not your Deck. If Penguin Knight is the card discarded, its effect won't activate. If Electric Snake, Regenerating Mummy, or Fear from the Dark is the card discarded, its effect will activate.
●This card is activated during the opponent’s Draw Phase in response to the opponent drawing a card. It is not chained to the draw.
●If a Quick-Play Spell Card is drawn, the opponent may activate it in a chain to Drop Off and the effect of Drop Off will disappear since the drawn card is no longer in the opponent’s hand.
●If the fifth and final piece of Exodia is drawn, the opponent wins before the effect of Drop Off is resolved.

## Dummy Golem
[effect Flip Effect Level 2 EARTH Rock 800/800] formats: both
Text (Edison): FLIP: Your opponent selects 1 monster they control. Switch control of the selected monster and this card.
Edison rulings: ●If “Dummy Golem” is attacked, flipped, and destroyed by damage calculation, its effect is not applied because it is destroyed. So control does not switch.
●If an effect like “Ring of Destruction” is chained to the Flip Effect of “Dummy Golem”, destroying “Dummy Golem”, the effect of “Dummy Golem” disappears.
●If the opponent only has one monster, and it is “Blindly Loyal Goblin” or “Mataza the Zapper”, and you activate the Flip Effect of “Dummy Golem”, the effect does activate and can be chained to, however its effect disappears because control of “Blindly Loyal Goblin” can't switch.
●If the opponent has “Blindly Loyal Goblin” and “Gemini Elf” on the field, and you activate the Flip Effect of “Dummy Golem”, the opponent can't select “Blindly Loyal Goblin”. They must select “Gemini Elf”.
●If control of monsters switches with “Dummy Golem”, it stays switched as long as the cards remain on the field. (Like “Creature Swap”.)
●The effect of “Dummy Golem” won't resolve if any of the following is true: “Dummy Golem” is not on the field when the effect resolves; “Dummy Golem” has been destroyed before the effect resolves, such as by damage calculation; there is no opponent’s monster when the effect resolves, such as if it was returned to the hand with “Compulsory Evacuation Device”.

## Dust Barrier
[spell Continuous] formats: both
Text (Edison): Face-up Normal Monsters on the field are unaffected by your opponent's Spell Cards. This card is destroyed during your second Standby Phase after activation.
Edison rulings: ●If you skip your second Standby Phase with Solomon's Lawbook, etc., then Dust Barrier remains on the field and its effect continues to apply.
●If Imperial Order is active during the 2nd Standby Phase after activation, Dust Barrier is still destroyed.

## Eagle Eye
[effect Level 3 WIND Winged Beast 1300/1200] formats: both
Text (Edison): When this card is Normal Summoned successfully, no Trap Cards can be activated.
Edison rulings: ●The effect of this monster prevents the activation of Trap Cards that can be activated when a monster is Normal Summoned, such as Trap Hole and Torrential Tribute.
●You can activate Trap Cards later in the turn.
●You can negate the Normal Summon of this monsters with Horn of Heaven or Solemn Judgment. (In which case the Normal Summon failed and the effect of the monster is not applied.)
●The effect of this monster is applied to both players (so you can't activate Pineapple Blast in response to your Normal Summon of this monster).
●This is a Continuous Effect that you can't chain to.

## Earth Chant
[spell Ritual] formats: both
Text (Edison): This card can be used to Ritual Summon any EARTH Ritual Monster. You must also Tribute monsters from your hand or field whose total Levels exactly equal the Level of the Ritual Monster you Ritual Summon.

## Earthquake
[spell Normal] formats: both
Text (Edison): Change all face-up monsters on the field to Defense Position.

## Earthshaker
[trap Normal] formats: both
Text (Edison): Select 2 Monster Card Attributes. Your opponent then selects 1 of the 2 Attributes and destroys all face-up monsters with that Attribute on the field.

## Eatgaboon
[trap Normal] formats: both
Text (Edison): If the ATK of a monster summoned by your opponent (excluding Special Summon) is 500 points or less, the monster is destroyed.

## Ectoplasmer
[spell Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Once per turn, during each player's End Phase: The turn player must Tribute 1 face-up monster, and if they do, inflict damage to their opponent equal to half the original ATK of the Tributed monster.
Edison rulings: ●Ectoplasmer causes the turn player to Tribute during his/her End Phase, but the opponent does not Tribute. So while Ectoplasmer is out, I Tribute in my End Phase, and you Tribute in your End Phase. But I don't Tribute in yours and you don't Tribute in mine.
●So 1 Tribute is performed during the End Phase of each player's turn. The Tribute is performed by the turn player. (Both players have to do this during their respective End Phases, not just the controller of Ectoplasmer.)
●Tributing a monster for Ectoplasmer is not a cost, it’s an effect, so you can't Tribute monsters unaffected by Spell Cards.
●If you have a face-up monster on your side of the field during the End Phase, you have to Tribute for Ectoplasmer’s effect.
●You can chain Mystical Space Typhoon or Raigeki Break to Ectoplasmer's effect, and if there is no Ectoplasmer on the field, then its effect is not applied.
●You can activate Soul Exchange during your Main Phase and use its effect to Tribute your opponent’s monster for Ectoplasmer during the End Phase.
●If you Tribute your opponent’s monster that you controlled with Snatch Steal or Change of Heart, your opponent takes the damage even though it was their monster.

## Ekibyo Drakmord
[spell Equip] formats: both
Text (Edison): The equipped monster can't attack. Destroy the equipped monster at the end of its controller's 2nd turn after this card is activated. At that time, this card is returned to the owner's hand.
Goat text: The equipped monster cannot attack. Destroy the equipped monster at the end of its controller's 2nd turn after this card is activated. At that time, this card is returned to the owner's hand.
Edison rulings: ●If Imperial Order was active during the end of the second turn, a monster equipped with Ekibyo Drakmord won't be destroyed and Ekibyo Drakmord will remain equipped to it.
●If control of a monster equipped with Ekibyo Drakmord changes, the turn count resets. If Ekibyo Drakmord is moved by Collected Power or Tailor of the Fickle to another monster, the turn count resets.
●If Ekibyo Drakmord is no longer on the field, a previously equipped monster won't be destroyed on the 2nd turn after Ekibyo Drakmord was played.
●If Ekibyo Drakmord is equipped to The Legendary Fisherman and then Umi is activated, Ekibyo Drakmord will remain meaninglessly equipped to The Legendary Fisherman.

## Electric Lizard
[effect Level 3 EARTH Thunder 850/800] formats: both
Text (Edison): A non Zombie monster attacking "Electric Lizard" can't attack on its following turn.
Goat text: A non Zombie-Type monster attacking "Electric Lizard" cannot attack on its following turn.
Edison rulings: ●If the non-Zombie-Type monster is removed from the field or flipped face-down, it can attack in the following turn.

## Electric Snake
[effect Level 3 LIGHT Thunder 800/900] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When this card is discarded from your hand to the GY by an effect of a card controlled by your opponent, draw 2 cards from your Deck.
Goat text: When this card is discarded from your hand to the Graveyard by an effect of a card controlled by your opponent, draw 2 cards from your Deck.
Edison rulings: ●If the summoning of Electric Snake is negated by Solemn Judgment, etc. its effect is not activated, as it is not considered to have gone directly from your hand to the GY.

## Electro-Whip
[spell Equip] formats: both
Text (Edison): Increase the ATK and DEF of a Thunder monster equipped with this card by 300 points.
Goat text: Increase the ATK and DEF of a Thunder-Type monster equipped with this card by 300 points.

## Elegant Egotist
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If "Harpie Lady" is on the field: Special Summon 1 "Harpie Lady" or "Harpie Lady Sisters" from your hand/Deck.
Goat text: If "Harpie Lady" is on the field: Special Summon 1 "Harpie Lady" or "Harpie Lady Sisters" from your hand or Deck.

## Elephant Statue of Blessing
[effect Level 3 EARTH Rock 1500/0] formats: both
Text (Edison): When this card is sent from your hand to your GY by an opponent's card effect: You gain 2000 LP.
Goat text: When this card is sent from your hand to your Graveyard by an opponent's card effect: You gain 2000 Life Points.
Edison rulings: ●Elephant Statue of Blessing must be sent from the owner's hand to the owner's GY in order for its effect to activate.
●Elephant Statue of Blessing's effect can be activated during the Damage Step.
●Elephant Statue of Blessing's effect activates when sent from the hand to the GY by the effect of Last Turn or Chaos Emperor Dragon - Envoy of the End.

## Elephant Statue of Disaster
[effect Level 3 EARTH Rock 1500/0] formats: both
Text (Edison): When this card is sent from your hand to your GY by an opponent's card effect: Inflict 2000 damage to your opponent.
Goat text: When this card is sent from your hand to your Graveyard by an opponent's card effect: Inflict 2000 damage to your opponent.
Edison rulings: ●Elephant Statue of Disaster must be sent from the owner's hand to the owner's GY in order for its effect to activate.
●Elephant Statue of Disaster's effect can be activated during the Damage Step.
●Elephant Statue of Disaster's effect activates when sent from the hand to the GY by the effect of Last Turn or Chaos Emperor Dragon - Envoy of the End.
●You can use Barrel Behind the Door against the effect of Elephant Statue of Disaster.

## Elf's Light
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): A LIGHT monster equipped with this card increases its ATK by 400 points and decreases its DEF by 200 points.

## Emblem of Dragon Destroyer
[spell Normal] formats: both
Text (Edison): Add 1 "Buster Blader" from your Deck/GY to your hand.
Goat text: Add 1 "Buster Blader" from your Deck or Graveyard to your hand.

## Embodiment of Apophis
[trap Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): During either player's Main Phase: Special Summon this card as a Normal Monster (Reptile/EARTH/Level 4/ATK 1600/DEF 1800). (This card is also still a Trap Card.)
Goat text: During either player's Main Phase: Special Summon this card as a Normal Monster (Reptile-Type/EARTH/Level 4/ATK 1600/DEF 1800). (This card is also still a Trap Card.)
Edison rulings: Trap Monster Rulings
● When this card is activated, its Spell/Trap Zone cannot be used until the card is removed from the field, even while it is in the Monster Zone.
● While in the Monster Zone, this card can still be targeted by "Mystical Space Typhoon", and be destroyed by "Heavy Storm".
● If an effect is applying that negates Trap Effects ("Royal Decree", "Jinzo", "Trap Stun"), this card returns face-up to the Spell/Trap Zone, and is not Summoned again even when that effect stops applying.
● If this card becomes Set while in the Monster Zone, eg by "Book of Moon", it returns face-down to the Spell/Trap Zone.

## Emergency Provisions
[spell Quick-Play] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Send any number of other Spell/Trap Cards you control to the GY; gain 1000 LP for each card sent to the GY this way.
Goat text: Send any number of other Spell/Trap Cards you control to the Graveyard; gain 1000 LP for each card sent to the Graveyard this way.
Edison rulings: ●Sending Spell and Trap Cards on your side of the field to the GY is a cost for activating this card.
●You can activate a Normal Spell Card, such as Raigeki, then chain Emergency Provisions and send Raigeki to the GY to gain 1000 Life Points, and the effect of Raigeki will still resolve.
●If your opponent activates Heavy Storm you can chain Emergency Provisions to send your Spell and Trap Cards to GY first (and gain the appropriate amount of Life Points).
●You gain the Life Points from this card’s effect in one lump sum, so if you control Fire Princess her effect will only inflict 500 points of damage.
●The effect of this card does not destroy your Spell and Trap Cards; it sends them to the GY. So, for example, you may send a Spell Card to the GY with a counter on it from Magic Reflector. You can also send Fusion Sword Murasame Blade even though it can't be destroyed.
●If you control a monster equipped with Premature Burial and you send Premature Burial to the GY to activate Emergency Provisions the equipped monster is not destroyed, because Premature Burial was not destroyed. The same is true for Toon Monsters: if you send Toon World to the GY with Emergency Provisions, Toon Monsters you control are not destroyed.
●If you send Smoke Grenade of the Thief or Blast with Chain to the GY for the cost of Emergency Provisions their effects don't activate, because they were not destroyed.
●If you send Black Pendant to the GY for the cost of Emergency Provisions its effect does activ

## Emes the Infinity
[effect Level 7 LIGHT Machine 2500/2000] formats: both
Text (Edison): Each time this card destroys an opponent's monster and sends it to the GY as a result of battle, increase the ATK of this card by 700 points.
Goat text: Each time this card destroys an opponent's monster and sends it to the Graveyard as a result of battle, increase the ATK of this card by 700 points.

## Empress Judge
[fusion Fusion Level 6 EARTH Warrior 2100/1700] formats: both (Goat already has a goat-only script in a goat file: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Queen's Double" + "Hibikime"

## Enchanted Javelin
[trap Normal] formats: both
Text (Edison): Select 1 attacking monster. Gain LP equal to its ATK.
Goat text: Select 1 attacking monster. Gain Life Points equal to its ATK.

## Enchanting Fitting Room
[spell Normal] formats: both
Text (Edison): Pay 800 LP; excavate the top 4 cards of your Deck and Special Summon all excavated Level 3 or lower Normal Monsters, also, after that, shuffle the rest back into your Deck.
Edison rulings: ●If you have no vacant monster zones, you can't Special Summon with Enchanting Fitting Room. So the Level 3 or lower Normal Monsters that would be Special Summoned are sent to the GY instead. All other cards are still returned to the Deck and it is shuffled.
●If you have some vacant Monster Card Zones, but not enough, select the monsters you wish to Summon with Enchanting Fitting Room and Special Summon them.

## Enervating Mist
[trap Continuous] formats: both
Text (Edison): Your opponent's hand size limit becomes 5.
Edison rulings: ●If Enervating Mist and Infinite Cards are both active, whichever effect resolved last is dominant.

## Enraged Muka Muka
[effect Level 5 EARTH Rock 1200/600] formats: both
Text (Edison): This card gains 400 ATK and DEF for each card in your hand.

## Eria the Water Charmer
[effect Flip Effect Level 3 WATER Spellcaster 500/1500] formats: both
Text (Edison): FLIP: Target 1 face-up WATER monster your opponent controls; take control of that target while this card is face-up on the field.
Edison rulings: ●If your opponent chains “Enemy Controller” to the activation of the Flip Effect of a “Charmer”, and takes control of the “Charmer”, the Flip Effect disappears.
●If you take control of the opponent’s monster with a “Charmer” and the opponent takes control back with “Change of Heart”, control still reverts to you after the effect of “Change of Heart” expires (even though it wasn’t your monster originally).
●If your opponent takes control of your monster with “Snatch Steal”, and you activate the Flip Effect of a “Charmer” to take it back, you keep control while the “Charmer” is face-up on the field.
●If “Book of Moon” is chained to the Flip Effect of a “Charmer” to flip the target monster face-down, the effect of the “Charmer” disappears.
●If a “Charmer” is removed from play with “Interdimensional Matter Transporter”, its effect is not re-applied when it’s back on the field.
●If “DNA Transplant” changes a monster’s Attribute so that it can be taken by a “Charmer”, and then “DNA Transplant” is destroyed so that the monster’s Attribute no longer corresponds to the effect of the “Charmer”, the controller of the “Charmer” loses control of the monster.
●If the turn player controls a “Charmer” and a monster controlled by its effect, and activates “Assault on GHQ” and targets the controlled monster, and the opponent chains an effect to destroy the “Charmer”, the controlled monster returns to the opponent’s control, but is still destroyed by the effect of “Assault on GHQ”.

## Eternal Rest
[spell Normal] formats: both
Text (Edison): Destroy all monsters equipped with Equip Cards.

## Exchange
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Both players reveal their hands and add 1 card from each other's hand to their hand.
Edison rulings: ●You can't activate Exchange if you have no other card in your hand besides Exchange.
●The opponent is still considered the owner of the card you take by the effect of Exchange for all purposes.
●If you take your opponent’s Kuriboh through the effect of Exchange you may discard it to activate its effect (but it is discarded to your opponent’s GY).

## Exhausting Spell
[trap Normal] formats: both
Text (Edison): Remove all Spell Counters on both sides of the field.

## Exile of the Wicked
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Destroy all Fiend monsters on the field.

## Exiled Force
[effect Level 4 EARTH Warrior 1000/1000] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): You can Tribute this card to target 1 monster on the field; destroy that target.
Edison rulings: ●You can't activate the effect of Exiled Force if it is the only monster on the field.

## Exodia Necross
[effect Level 4 DARK Spellcaster 1800/0] formats: both
Text (Edison): Cannot be Normal Summoned/Set. Must be Special Summoned with "Contract with Exodia", and Cannot be Special Summoned by other ways. can't be destroyed by battle or Spell/Trap effect. Once per turn, during your Standby Phase: This card gains 500 ATK. Destroy this card unless all 5 of these cards are in your GY - "Exodia the Forbidden One", "Right Arm of the Forbidden One", "Left Arm of the Forbidden One", "Right Leg of the Forbidden One" and "Left Leg of the Forbidden One".
Goat text: Cannot be Normal Summoned/Set. Must be Special Summoned with "Contract with Exodia", and cannot be Special Summoned by other ways. Cannot be destroyed by battle or Spell/Trap effect. Once per turn, during your Standby Phase: This card gains 500 ATK. Destroy this card unless all 5 of these cards are in your Graveyard - "Exodia the Forbidden One", "Right Arm of the Forbidden One", "Left Arm of the Forbidden One", "Right Leg of the Forbidden One" and "Left Leg of the Forbidden One".
Edison rulings: ●Exodia Necross Cannot be Normal Summoned or Set, and Cannot be Special Summoned EXCEPT by the effect of Contract with Exodia. So Exodia Necross Cannot be Special Summoned with Monster Reborn, etc., even if Special Summoned properly first.
●Players can activate Spell & Trap Card effects that destroy monsters, but Exodia Necross won't be destroyed by them.
●If a piece of Exodia is removed from the GY while Exodia Necross is removed from play due to Dimensionhole, Exodia Necross is destroyed when it returns to the field.
●If your opponent takes control of your Exodia Necross and does not have all 5 pieces of Exodia in his/her GY, Exodia Necross is destroyed if face-up.
●While Skill Drain is active, Exodia Necross' ATK is returned to its original 1800 points. Even if Skill Drain then leaves play, Exodia Necross does no regain any ATK increases it had because of its effect, but it will begin to accumulate ATK points again.
●While Skill Drain is active, Exodia Necross is not destroyed if Exodia pieces are removed from the GY, but it will be destroyed if the effect of Skill Drain disappears.

## Exodia the Forbidden One
[effect Level 3 DARK Spellcaster 1000/1000] formats: both (Goat already has a goat-only script in js/cards/classic-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): © If this card, and the following cards, are in your hand, you win the Duel.
● "Left Arm of the Forbidden One"
● "Left Leg of the Forbidden One"
● "Right Arm of the Forbidden One"
● "Right Leg of the Forbidden One
Edison rulings: ● This isn't an effect; it's a condition. It just happens as soon as you have all 5 pieces in hand.
● The victory "check" happens in between chain links, but not while resolving effects.
EG: If you draw the last piece with "Graveful Charity", you must discard first.
EG: If you activate 2 "Reckless Greed", and draw the last piece with the 1st, you win before the 2nd resolves.
● If both players draw all 5 pieces at the same time, everbody wins! It's a draw.

## Fairy's Hand Mirror
[trap Normal] formats: both
Text (Edison): When your opponent activates a Spell Card that targets exactly 1 monster (and no other cards) on the field: Target another card that would be an appropriate target; that Spell now targets the new target.

## Falling Down
[spell Equip] formats: both
Text (Edison): Activate this card by targeting an opponent's monster; equip this card to it. Take control of it. Destroy this card unless you control an "Archfiend" card. During each of your opponent's Standby Phases: You take 800 damage.
Edison rulings: ●If there are no Archfiends on your side of the field, Falling Down is destroyed immediately, even in the middle of a chain.
●The Archfiend you need for Falling Down doesn't have to be a monster. Cards like Axe of Despair, or an Archfiend monster equipped to your Relinquished, will prevent Falling Down from being destroyed.
●You can activate Falling Down when there are no Archfiends on your side of the field, but it is destroyed immediately before it is equipped to a monster.
●You can't use Barrel Behind the Door against the damage from Falling Down because you can't use Barrel Behind the Door against a Continuous or Equip Spell Card.

## Fatal Abacus
[trap Continuous] formats: both
Text (Edison): Each time 1 monster is sent from the field to the GY, inflict 500 points of damage per card to the respective card owner's LP.
Goat text: Each time 1 monster is sent from the field to the Graveyard, inflict 500 points of damage per card to the respective card owner's Life Points.
Edison rulings: ●For the effect of Fatal Abacus to trigger, a Monster Card that is being treated as a monster must be sent from the field to the GY. This means that a Monster Card equipped to Relinquished or Sword Hunter that is sent to the GY won't trigger this effect. Also, a Spell or Trap Card that is destroyed while being treated as a monster by the effect of Magical Hats won't trigger this effect.
●Monster Tokens don't trigger this card’s effect because they are not sent to the GY.
●Monsters that are removed from play and monsters that are destroyed while Banisher of the Light is on the field don't trigger this card’s effect. This is because they never go to the GY.
●Sent from the field to the GY includes cards that are destroyed, Tributed, or sent straight from the field to the GY.
●If multiple Fatal Abacus cards are active on the field, a player will take 500 points of damage for each when one of their monsters is sent from the field to the GY. So if 2 are active, a player will take 1000 points of damage and if 4 are on the field (you have 3 active and your opponent has 1 active) a player will take 2000 points of damage.
●It is the owner of the Monster Card that takes the damage, so if you control your opponent’s monster through the effect of Change of Heart and Tribute it, your opponent takes the 500 points of damage.

## Fear from the Dark
[effect Level 4 DARK Zombie 1700/1500] formats: both
Text (Edison): When this card is sent from your hand/Deck to your GY by an opponent's card effect: Special Summon this card.
Goat text: When this card is sent from your hand or Deck to your Graveyard by an opponent's card effect: Special Summon this card.
Edison rulings: ●Fear from the Dark can be Normal Summoned.
●Only the owner of Fear from the Dark can use its effect, because it has to be sent from your hand to your GY.
●When you discard Fear from the Dark with Painful Choice, Fear from the Dark's effect does not activate because it was your own card effect that caused it.
●If Fear from the Dark is sent to the GY during a card effect's resolution, or during a chain, activate Fear from the Dark's effect after the current effect or chain has resolved.
●If Fear from the Dark is sent to the GY by Last Turn's effect, Fear from the Dark is Special Summoned to the field before the attack of Last Turn happens.

## Fengsheng Mirror
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Look at your opponent's hand. Select and discard 1 Spirit monster to the GY if Spirit monsters exist in his/her hand.
Goat text: Look at your opponent's hand. Select and discard 1 Spirit monster to the Graveyard if Spirit monsters exist in his/her hand.

## Fenrir
[effect Level 4 WATER Beast 1400/1200] formats: both
Text (Edison): © Cannot be Normal Summoned/Set. 
© Must first be Special Summoned (from your hand) by banishing 2 WATERs from your GY. 
① If this card destroys an opponent's monster by battle: Your opponent skips their next Draw Phase.
Goat text: This card cannot be Normal Summoned or Set. This card can only be Special Summoned by removing from play 2 WATER monsters in your Graveyard. When this card destroys an opponent's monster as a result of battle, your opponent skips their next Draw Phase.
Edison rulings: ● As long as this card was initially Special Summoned by its own procedure (and the summon wasn't negated),
you can Summon it from the GY with card effects.

## Fiber Jar
[effect Flip Effect Level 3 EARTH Plant 500/500] formats: both
Text (Edison): FLIP: Each player shuffles all cards from their hand, field, and GY into the Deck, then draws 5 cards.
Goat text: FLIP: Each player shuffles all cards from their hand, field, and Graveyard into the Deck, then draws 5 cards.
Edison rulings: ●When this card’s effect is activated all cards on the field, in hand, and in the GYs are returned to their owner’s Deck. Fusion Monsters and Synchro Monsters in any of these places are returned to the Extra Deck. Cards removed from play remain removed from play.
●When the effect of Fiber Jar is activated, Fiber Jar itself is united with the Deck, even if it has been attacked and destroyed as a result of battle.
●If the effect of Fiber Jar activates during the Battle Phase, it does not end the Battle Phase, although the turn player will have no monsters after the effect resolves.
●If your opponent’s Parasite Paracide is face-up in your Deck when the effect of Fiber Jar is activated, it will remain there. The opponent should cut your Deck with his / her eyes closed after you shuffle to ensure fairness.
●If Twin-Headed Behemoth is returned to the Deck by the effect of Fiber Jar and its effect has already been used once this Duel, that condition is not reset. If you again draw and Summon your Twin-Headed Behemoth you may not activate its effect again.

## Fiend's Hand Mirror
[trap Normal] formats: both
Text (Edison): Switch the opponent's Spell Card effect that targets 1 Spell or Trap Card to another correct target.
Edison rulings: ●Since Mystical Space Typhoon can't destroy itself, when you chain Fiend's Hand Mirror to your opponent's Mystical Space Typhoon, you can't re-direct the Mystical Space Typhoon to target itself. But you can re-direct it to target and destroy Fiend's Hand Mirror.
●When your opponent activates Mystical Space Typhoon to destroy his/her Mirage of Nightmare, you can chain Fiend's Hand Mirror and have Mystical Space Typhoon destroy Fiend's Hand Mirror instead.

## Firebird
[effect Level 4 FIRE Winged Beast 1000/800] formats: both
Text (Edison): Each time a Winged Beast monster(s) on your side of the field is destroyed, this card gains 500 ATK.
Goat text: Each time a Winged Beast-Type monster(s) on your side of the field is destroyed, this card gains 500 ATK.
Edison rulings: ●The effect of “Firebird” is a Trigger Effect that activates when 1 or more Winged Beast-Type monster
●You can chain to the activation of “Firebird”’s effect, including with “Divine Wrath”.
●If 2 or more Winged Beast-Type monsters on the controller’s side of the field are destroyed at the same time, the ATK of “Firebird” only increases by 500 points.
●Winged Beast-Type tokens on the controller’s side of the field are included and will increase the ATK of “Firebird” when destroyed.
●Monsters on the controller’s side of the field that are changed to Winged Beast-Type by “DNA Surgery” are included and will increase the ATK of “Firebird” when destroyed.
●When face-down Winged Beast-Type monsters are destroyed (by a card effect), the ATK of “Firebird” does not increase.
●The ATK increase from the effect of “Firebird” remains as long as “Firebird” remains face-up on the field.

## Fissure
[spell Normal] formats: both
Text (Edison): ① Destroy the 1 face-up monster your opponent controls that has the lowest ATK (your choice, if tied).
Edison rulings: ● The monster to destroy is chosen as this card resolves.

## Flash Assailant
[effect Level 4 DARK Fiend 2000/2000] formats: both
Text (Edison): Decrease the ATK and DEF of this card by 400 points for each card in your hand.

## Flower Wolf
[fusion Fusion Level 5 EARTH Beast 1800/1400] formats: both
Text (Edison): "Silver Fang" + "Darkworld Thorns"

## Follow Wind
[spell Equip] formats: both
Text (Edison): Increase the ATK and DEF of a Winged Beast monster equipped with this card by 300 points.
Goat text: Increase the ATK and DEF of a Winged Beast-Type monster equipped with this card by 300 points.

## Forest
[spell Field] formats: both
Text (Edison): All Insect, Beast, Plant, and Beast-Warrior monsters on the field gain 200 ATK/DEF.

## Formation Union
[trap Normal] formats: both
Text (Edison): Select and activate 1 of the following effects:
● Equip 1 Union Monster on your side of the field to an appropriate monster on your side of the field as an Equip Spell Card.
● Unequip 1 of your equipped Union Monsters and Special Summon it to your side of the field in Attack Position.
Goat text: Select and activate 1 of the following effects:
● Equip 1 Union Monster on your side of the field to an appropriate monster on your side of the field as an Equip Spell Card.
● Unequip 1 of your equipped Union Monsters and Special Summon it to your side of the field in face-up Attack Position.
Edison rulings: ●The monster you equip the Union Monster to must be appropriate, meaning the monster name written in the text of the Union Monster.
●The Union Monster is considered to be equipped 'by its effect' so any bonuses the Union Monster grants are granted if equipped with Formation Union.
●A Union Monster that is detached during the Battle Phase using Formation Union can attack during that Battle Phase.
●If the player who would control the Union Monster already has 5 monsters on the field, you can't activate Formation Union and choose the second effect.

## Fox Fire
[effect Level 2 FIRE Pyro 300/200] formats: both
Text (Edison): During the End Phase, if this card was destroyed by battle and sent to the GY this turn and was face-up at the start of the Damage Step: Special Summon this card from the GY. This face-up card can't be Tributed for a Tribute Summon.
Goat text: During the End Phase, if this card was destroyed by battle and sent to the Graveyard this turn and was face-up at the start of the Damage Step: Special Summon this card from the Graveyard. This face-up card cannot be Tributed for a Tribute Summon.
Edison rulings: ●In order to activate its effect, Fox Fire must be face-up when the attack that destroyed it was declared (like Atomic Firefly). If a face-down Fox Fire is attacked, its effect is not applied even though it is face-up when destroyed.
●While Skill Drain is active, you can Tribute Fox Fire for a Tribute Summon.
●If the opponent controls your face-up Fox Fire, and it is destroyed as a result of battle, it will be Special Summoned to your (the owner’s) side of the field during the End Phase.

## Freed the Matchless General
[effect Level 5 EARTH Warrior 2300/1700] formats: both
Text (Edison): Negate any Spell effects that target this card, and if you do, destroy that Spell Card. During your Draw Phase, instead of conducting your normal draw: You can add 1 Level 4 or lower Warrior monster from your Deck to your hand. This card must be face-up on the field to activate and to resolve this effect.
Goat text: Negate any Spell effects that target this card, and if you do, destroy that Spell Card. During your Draw Phase, instead of conducting your normal draw: You can add 1 Level 4 or lower Warrior-Type monster from your Deck to your hand. This card must be face-up on the field to activate and to resolve this effect.
Edison rulings: ●The Continuous Effect applies while this card is face-up on the field.
●This effect does not apply while Freed is in the GY / removed from play.
●Spell Cards / Effects that target this card can be activated, but will be negated and destroyed.
●If D.D.R. - Different Dimension Reincarnation Special Summons this card, Freed's effect will negate the Continuous Effect of D.D.R. that would destroy the Special Summoned monster.
●This effect does not negate Spell Cards / Effects that don't target (ex: Creature Swap, Fissure).
●If you equip Fusion Sword Murasame Blade to this monster, it will be negated and destroyed.
●The optional Trigger Effect activates during the Draw Phase.
●This effect can't be activated if you have no Level 4 or lower Warrior-Type monsters in your Deck.
●You can only forfeit your normal draw. If you activate Jar of Greed during the Draw Phase, you can't replace that draw with the effect of Freed the Matchless General.
●If you have two copies of this card on the field, you can still only add 1 Warrior-Type monster to your hand by forfeiting your normal draw.
●If you control two copies of Freed the Matchless General, you can only activate the effect of one.
●This card must be face-up on the field to activate and to resolve this effect.

## Freezing Beast
[effect Effect Union Level 4 WATER Aqua 1500/1000] formats: both
Text (Edison): Once per turn, during your Main Phase, if you control this monster on the field, you can equip it to your "Burning Beast" as an Equip Spell Card, OR unequip the Union equipment and Special Summon this card in Attack Position. While equipped to a monster by this card's effect, each time the equipped monster inflicts Battle Damage to your opponent, destroy 1 face-down Spell or Trap Card on the field. (1 monster can only be equipped with 1 Union Monster at a time. If the equipped monster is destroyed as a result of battle, destroy this card instead.)
Goat text: Once per turn, during your Main Phase, if you control this monster on the field, you can equip it to your "Burning Beast" as an Equip Spell Card, OR unequip the Union equipment and Special Summon this card in face-up Attack Position. While equipped to a monster by this card's effect, each time the equipped monster inflicts Battle Damage to your opponent, destroy 1 face-down Spell or Trap Card on the field. (1 monster can only be equipped with 1 Union Monster at a time. If the equipped monster is destroyed as a result of battle, destroy this card instead.)
Edison rulings: These rulings apply to all Union Monsters: https://edisonformat.net/rules/compendium/union-monsters

## Frontier Wiseman
[effect Level 3 EARTH Spellcaster 1600/800] formats: both
Text (Edison): Negate any Spell effects that target a Warrior monster you control, and if you do, destroy that card.
Goat text: Negate any Spell effects that target a Warrior-Type monster you control, and if you do, destroy that card.

## Frontline Base
[spell Continuous] formats: both
Text (Edison): Once per turn: You can Special Summon 1 Level 4 or lower Union monster from your hand.
Edison rulings: ●If you have multiple Frontline Bases, you can Special Summon 1 Union Monster for each.

## Frozen Soul
[trap Normal] formats: both
Text (Edison): You can only activate this card when your LP are at least 2000 lower than your opponent's. Skip your opponent's next Battle Phase.
Goat text: You can only activate this card when your Life Points are at least 2000 lower than your opponent's. Skip your opponent's next Battle Phase.
Edison rulings: You can only activate this card when your Life Points are at least 2000 lower than your opponent's. Skip your opponent's next Battle Phase.
●If you activate Frozen Soul, and your opponent skips his next Battle Phase somehow, his Battle Phase of the next turn is skipped with Frozen Soul.
●Skipping a Phase is not the same as Conducting a Phase. You can only Skip your Battle Phase if you attempt to Conduct it (declare you are entering the Battle Phase so it will be skipped), since the Battle Phase is optional. The player is responsible for attempting to conduct their Battle Phase.
●If Frozen Soul resolves in your opponent's Standby Phase, and they don't enter the Battle Phase, this effect lingers until a turn where your opponent enters the Battle Phase (and is skipped).
●If multiple copies of Frozen Soul resolve, all their lingering effects disappear together when your opponent enters the Battle Phase (which is skipped). Like Reckless Greed, the effect of Frozen Soul does not stack with itself.
●VS. Thunder of Ruler: If Thunder of Ruler and Frozen Soul both resolve before your opponent entered the Battle Phase, then they can't conduct this first Battle Phase (due to Thunder of Ruler), and Frozen Soul's effect lingers until a future turn when your opponent conducts the Battle Phase.
●While Frozen Soul applies, you can't activate Last Turn as it involves conducting a Battle Phase.
●When you activate Frozen Soul, and effects are chained that result in the Life Point difference bein

## Fruits of Kozaky's Studies
[trap Normal] formats: both
Text (Edison): Look at the top 3 cards of your Deck and return those cards to the top of the Deck in any order.

## Fuh-Rin-Ka-Zan
[trap Normal] formats: both
Text (Edison): When there are face-up WIND, WATER, FIRE and EARTH monster(s) on the field: Apply 1 of these effects.
● Destroy all monsters your opponent controls.
● Destroy all Spell and Trap Cards your opponent controls.
● Discard 2 random cards from your opponent's hand.
● Draw 2 cards.
