# Full pool batch 27: 60 cards. Write js/cards/full-27.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Sage's Stone
[spell Normal] formats: both
Text (Edison): If you control a face-up "Dark Magician Girl": Special Summon 1 "Dark Magician" from your hand/Deck.
Goat text: If you control a face-up "Dark Magician Girl": Special Summon 1 "Dark Magician" from your hand or Deck.

## Sakuretsu Armor
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When an opponent's monster declares an attack: Target the attacking monster; destroy that target.
Edison rulings: ●Sakuretsu Armor targets 1 monster.
●If the turn player chains Book of Moon to Sakuretsu Armor to flip the attacking monster face-down, then the attacking monster is not destroyed by Sakuretsu Armor.

## Salamandra
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Equip only to a FIRE monster. It gains 700 ATK.

## Sand Gambler
[effect Level 3 LIGHT Spellcaster 300/1600] formats: both
Text (Edison): Toss a coin 3 times. If all 3 results are Heads, destroy all monsters on your opponent's side of the field. If all 3 results are Tails, destroy all monsters on your side of the field. You can only activate this effect once per turn, during your Main Phase.

## Sanga of the Thunder
[effect Level 7 LIGHT Thunder 2600/2200] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): During damage calculation in your opponent's turn, if this card is being attacked: You can target the attacking monster; make that target's ATK 0 during damage calculation only (this is a Quick Effect). This effect can only be used once while this card is face-up on the field.
Edison rulings: ●A marker may be placed on this card to indicate that its effect has been used. The effect resets if the monster is destroyed or removed from the field.
●You can use the effect of this card even if it is face-down when it is attacked because its effect is activated during the Damage Step, and it will be face-up at that point.
●The effect of this card targets.

## Sanwitch
[fusion Fusion Level 6 DARK Spellcaster 2100/1800] formats: both (Goat already has a goat-only script in a goat file: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Sangan" + "Witch of the Black Forest"

## Scroll of Bewitchment
[spell Equip] formats: both
Text (Edison): Select 1 Attribute. Change the Attribute of the equipped monster to the one you select.
Edison rulings: ●If you switch the target of this card with Collected Power or Tailor of the Fickle you don't select a new Attribute.
●The newly equipped monster becomes the Attribute that was originally selected when Scroll of Bewitchment was activated, even if it is the same as the monster’s original Attribute.

## Seal of the Ancients
[spell Normal] formats: both
Text (Edison): Pay 1000 LP. Pick up and see all face-down cards on your opponent's side of the field, then return them to their original positions. (The effects of the face-down cards are not activated.)
Goat text: Pay 1000 Life Points. Pick up and see all face-down cards on your opponent's side of the field, then return them to their original positions. (The effects of the face-down cards are not activated.)

## Sebek's Blessing
[spell Quick-Play] formats: both
Text (Edison): If your monster inflicts battle damage to your opponent by a direct attack: Gain the same amount of LP.

## Second Coin Toss
[spell Continuous] formats: both
Text (Edison): When a coin toss is performed, you can choose to redo the coin toss. (If the toss involved multiple coin flips, redo all of them.) You can only use the effect of "Second Coin Toss" once per turn.
Edison rulings: ●The effect of this card only applies when you perform a coin toss, not when your opponent performs a coin toss.
●If an effect requires multiple coin flips, like Barrel Dragon, you would redo all 3 coin flips.
●Even if multiple Second Coin Toss cards are active, you can only redo each coin toss once.
●Even if the original coin toss came out in your favor, you may use the effect of Second Coin Toss and redo the toss.

## Second Goblin
[effect Effect Union Level 1 DARK Fiend 100/100] formats: both
Text (Edison): Once per turn, during your Main Phase, if you control this monster on the field, you can equip it to your "Giant Orc" as an Equip Spell Card, OR unequip the Union equipment and Special Summon this card in Attack Position. While equipped to a monster by this card's effect, you can change the equipped monster's battle position once per turn. (1 monster can only be equipped with 1 Union Monster at a time. If the equipped monster is destroyed as a result of battle, destroy this card instead.)
Goat text: Once per turn, during your Main Phase, if you control this monster on the field, you can equip it to your "Giant Orc" as an Equip Spell Card, OR unequip the Union equipment and Special Summon this card in face-up Attack Position. While equipped to a monster by this card's effect, you can change the equipped monster's battle position once per turn. (1 monster can only be equipped with 1 Union Monster at a time. If the equipped monster is destroyed as a result of battle, destroy this card instead.)
Edison rulings: These rulings apply to all Union Monsters: https://edisonformat.net/rules/compendium/union-monsters

## Self-Destruct Button
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): You can only activate this card while your LP are lower than your opponent's LP and the difference is 7000 points or more. Both players' LP become 0.
Goat text: You can only activate this card while your Life Points are lower than your opponent's Life Points and the difference is 7000 points or more. Both players' Life Points become 0.
Rulings: 1. If you activate "Self-Destruction Button", and an effect is chained so that the different in Life Points is less than 7000, "Self-Destruction Button" still resolves because its conditions were correct at the time of activation.

## Senju of the Thousand Hands
[effect Level 4 LIGHT Fairy 1400/1000] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When this card is Normal or Flip Summoned: You can add 1 Ritual Monster from your Deck to your hand.

## Senri Eye
[spell Continuous] formats: both
Text (Edison): Once per turn, during each of your Standby Phases, you can pay 100 LP to look at 1 card on the top of your opponent's Deck and return it to its original position. Your opponent can't look at the card.
Goat text: Once per turn, during each of your Standby Phases, you can pay 100 Life Points to look at 1 card on the top of your opponent's Deck and return it to its original position. Your opponent cannot look at the card.
Edison rulings: ●You can't use Senri Eye's effect more than once during the same Standby Phase.
●You can use the effect of Senri Eye if the top card on the Deck is face-up (due to Convulsion of Nature or Parasite Paracide), and in that case you don't hide the card from your opponent.

## Serial Spell
[spell Quick-Play] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Activate only when you activate one of your Normal Spell Cards. Discard all the cards in your hand to the GY. The effect of this card becomes the same as the Normal Spell Card.
Goat text: Activate only when you activate one of your Normal Spell Cards. Discard all the cards in your hand to the Graveyard. The effect of this card becomes the same as the Normal Spell Card.
Edison rulings: ●Serial Spell must be chained to the activation of your Normal Spell Card. Nothing can be chained in-between by yourself or your opponent. If your opponent chains to your Normal Spell Card, you can't chain Serial Spell to that Normal Spell Card. Because of this, it is impossible to chain 2 copies of Serial Spell to the same Normal Spell Card.
●Serial Spell does not target a card.
●If you chain Serial Spell to a Normal Spell Card that targets a card
●Discarding your hand is a cost to activate Serial Spell. You can't activate Serial Spell if it is the only card in your hand, or if it is Set and you have no cards in your hand.
●Serial Spell only copies the effects of your Normal Spell Card, not any costs of that Spell Card. So if you chain Serial Spell to Delinquent Duo you don't pay an additional 1000 Life Points.
●If you activate Monster Reborn, and chain Serial Spell, discarding your entire hand, you can select and revive one of the monsters you discarded for the cost of Serial Spell to be the monster that Serial Spell Special Summons to the field. (For example, if you target Dark Magician with Monster Reborn, then chain Serial Spell and discard Buster Blader, you can use Serial Spell to Special Summon the Buster Blader you discarded to activate Serial Spell.)
●You can't level up Horus the Black Flame Dragon from 4 to 8 with just Level Up! and Serial Spell. Because you would send LV4 to the GY for Level Up!, but even if you copy it with Serial Spell, the first Level Up! hasn'

## Serpentine Princess
[effect Level 4 WATER Reptile 1400/2000] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this face-up card is returned from the field to your Deck, select and Special Summon 1 Level 3 or lower monster from your Deck to your side of the field. Then shuffle your Deck.
Edison rulings: ●When Serpentine Princess is returned to the Deck by an effect occurring in a chain, the effect of Serpentine Princess starts a new Chain after the current Chain resolves completely.
●If the effect of Fiber Jar places Serpentine Princess from the field into your Deck, the effect of Serpentine Princess is activated and will be applied after the effect of Fiber Jar has finished resolving.

## Servant of Catabolism
[effect Level 3 LIGHT Aqua 700/500] formats: both
Text (Edison): This monster may attack your opponent's LP directly.
Goat text: This monster may attack your opponent's Life Points directly.

## Shadowknight Archfiend
[effect Level 4 WIND Fiend 2000/1600] formats: both
Text (Edison): The controller of this card pays 900 LP during each of his/her Standby Phases (this is not optional). When this card is targeted by the effect of a card controlled by your opponent, when resolving the effect, roll a six-sided die. If the result is 3, negate the effect and destroy the opponent's card. The Battle Damage this card inflicts to your opponent is halved.
Goat text: The controller of this card pays 900 Life Points during each of his/her Standby Phases (this is not optional). When this card is targeted by the effect of a card controlled by your opponent, when resolving the effect, roll a six-sided die. If the result is 3, negate the effect and destroy the opponent's card. The Battle Damage this card inflicts to your opponent is halved.
Rulings: 1. ARCHFIENDS: The following rulings apply to "Vilepawn Archfiend", "Desrook Archfiend", "Shadowknight Archfiend", "Darkbishop Archfiend", "Infernalqueen Archfiend", "Terrorking Archfiend", and "Skull Archfiend of Lightning".
2. If you don't have enough Life Points to pay for an Archfiend, the Archfiend is destroyed and you don't pay the cost.
3. You roll a die for Archfiends when your opponent resolves an effect that targets the Archfiend, not when it is activated. If the activation or effect of a card that targets your Archfiend is negated by some other card, then you do not roll a die for the Archfiend.
4. If your Archfiend is targeted by "Barrel Dragon", roll a die for the Archfiend before flipping coins for "Barrel Dragon".
5. Rolling a die for an Archfiend cannot be chained to since you are resolving an effect.
6. The effect of rolling a die for an Archfiend is a Trigger Effect.
7. The effect of rolling a die for an Archfiend will be negated by "Skill Drain".
8. You can roll a die for an Archfiend during the Damage Step.

## Shadowslayer
[effect Level 4 DARK Fiend 1400/200] formats: both
Text (Edison): If all monsters your opponent controls are in Defense Position, this card can attack your opponent directly.
Edison rulings: ●For Shadowslayer (unlike cards like Black Tyranno and Drillago), only the Monster Card Zones are looked at. If all of your opponent’s monsters are in Defense Position, then Shadowslayer can attack directly even if your opponent has Spell and Trap Cards on the field.
●If Shadowslayer attacks a Attack Position monster, and the opponent activates Book of Moon so that his only monster on the field is now in Defense Position, a replay occurs, because Shadowslayer is now able to attack directly.
●If all of your opponent’s monsters are in Defense Position but one of them is equipped with Ring of Magnetism, Shadowslayer can't attack directly and must attack that monster if it attacks.

## Share the Pain
[spell Normal] formats: both
Text (Edison): Tribute 1 monster; make your opponent Tribute 1 monster (for no effect).
Edison rulings: ●Tributing 1 monster you control is a cost.
●Your opponent decides which monster they Tribute when this effect resolves.
●No monsters are Summoned by this Tribute.

## Shift
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When your opponent targets exactly 1 monster you control (and no other cards) for an attack, or with a Spell/Trap effect: Target another monster you control that would be an appropriate target; that attack/Spell/Trap now targets the new target.

## Shifting Shadows
[spell Continuous] formats: both
Text (Edison): Once per turn, by paying 300 LP, rearrange the face-down Defense Position monsters in your Main Monster Zones, then return them in face-down Defense Position.
Goat text: Once per turn, by paying 300 Life Points, rearrange the face-down Defense Position monsters in your Main Monster Zones, then return them in face-down Defense Position.
Edison rulings: ●If you have only 1 face-down Defense Position monster you can't activate the effect of Shifting Shadows.
●If you control a monster that is targeted by your opponent's Nightmare Wheel, and you flip it face-down with Book of Moon, and control at least 1 other face-down Defense Position monster, you can activate the effect of “Shifting Shadows”. However, afterwards you must tell your opponent which monster is targeted by “Nightmare Wheel”.

## Shinato, King of a Higher Plane
[ritual Ritual Level 8 LIGHT Fairy 3300/3000] formats: both
Text (Edison): Ⓢ Can be Ritual Summoned with ＂Shinato's Ark＂. 
① If this card destroys a Defense Position monster by battle and sends it to the GY: Inflict damage to your opponent equal to that monster's original ATK (even if it is no longer in the GY).
Goat text: This card can only be Ritual Summoned with the Ritual Spell Card, "Shinato's Ark". You must also Tribute monsters whose total Levels equal 8 or more from the field or your hand. When this card destroys a Defense Position monster and sends it to the Graveyard as a result of battle, inflict damage to your opponent's Life Points equal to the original ATK of the destroyed monster.
Edison rulings: ●When your Shinato, King of a Higher Plane destroys Gradius' Option or Maju Garzett, your opponent takes no damage from Shinato, King of a Higher Plane's effect.
●If Shinato, King of a Higher Plane is destroyed before monsters are sent to the GY, for example if removed from play by D. D. Warrior Lady, his effect does not activate. But if Shinato, King of a Higher Plane attacks Yomi Ship, Shinato, King of a Higher Plane inflicts the damage from his effect even though he will be destroyed by Yomi Ship's effect after Yomi Ship is sent to the GY.
●When Shinato, King of a Higher Plane destroys a Defense Position monster, your opponent can activate Barrel Behind the Door as a chain to Shinato, King of a Higher Plane's effect.
●When your Shinato, King of a Higher Plane is equipped with Fairy Meteor Crush and destroys your opponent's Defense Position monster, first, during damage calculation, Shinato, King of a Higher Plane inflicts Battle Damage to your opponent's Life Points because of Fairy Meteor Crush, and then, when the Defense Position monster is sent to the GY, Shinato, King of a Higher Plane's effect inflicts damage equal to the original ATK of the destroyed monster.

## Shinato's Ark
[spell Ritual] formats: both
Text (Edison): This card is used to Ritual Summon "Shinato, King of a Higher Plane". You must also Tribute monsters whose total Levels equal 8 or more from the field or your hand.

## Silpheed
[effect Level 4 WIND Fairy 1700/700] formats: both
Text (Edison): © Cannot be Normal Summoned/Set. 
© Must first be Special Summoned (from your hand) by banishing 1 WIND from your GY. 
① If this card is destroyed by battle and sent to the GY: Your opponent discards 1 random card.
Goat text: This card cannot be Normal Summoned or Set. This card can only be Special Summoned by removing from play 1 WIND monster in your Graveyard. When this card is destroyed as a result of battle and sent to the Graveyard, your opponent discards 1 random card from their hand.
Edison rulings: ● As long as this card was initially Special Summoned by its own procedure (and the summon wasn't negated),
you can Summon it from the GY with card effects.

## Silver Bow and Arrow
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): A Fairy monster equipped with this card increases its ATK and DEF by 300 points.
Goat text: A Fairy-Type monster equipped with this card increases its ATK and DEF by 300 points.

## Skilled Dark Magician
[effect Level 4 DARK Spellcaster 1900/1700] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Each time a Spell Card is activated, place 1 Spell Counter on this card when that Spell resolves (max. 3). You can Tribute this card with 3 Spell Counters on it; Special Summon 1 "Dark Magician" from your hand, Deck, or GY.
Edison rulings: ●You place a Spell Counter on this card when the Spell Card resolves, so if Magic Jammer is used to negate the Spell Card's activation then you don't place a Spell Counter on this monster. But if Imperial Order is chained to the Spell Card, you still place a Spell Counter on this monster because the activation of the Spell Card was not negated. If the Spell Card was a Continuous, Equip, or Field Spell Card, and “Dust Tornado” is chained to its activation and destroys it before it resolves you still place a Spell Counter because the activation of the card was not negated.
●If you activate a Spell Card, and your opponent chains Call of the Haunted to Special Summon Skilled Dark Magician, Skilled Dark Magician does not get a Spell Counter for that Spell Card because Skilled Dark Magician must be face-up on the field when the Spell Card is activated and when it resolves in order to get a Spell Counter.
●You place a Spell Counter for any Spell Card that is activated, including Equip Spell, Field Spell, etc.
●When you use the effect of a Continuous Spell Card that is already face-up on the field, such as Inspection, or sending Wave-Motion Cannon to the GY, or paying for Messenger of Peace, you don't place a Spell Counter on this monster.
●When Double Spell is played, you get a Spell Counter on this monster for the activation of Double Spell, but not for the target of Double Spell because the target is never activated; so you get 1 Spell Counter on this monster.
●You don't place a S

## Skilled White Magician
[effect Level 4 LIGHT Spellcaster 1700/1900] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Each time a Spell Card is activated, place 1 Spell Counter on this card when that Spell Card resolves (max. 3). You can Tribute this card with 3 Spell Counters on it; Special Summon 1 "Buster Blader" from your hand, Deck, or GY.
Goat text: Each time a Spell Card is activated, place 1 Spell Counter on this card when that Spell Card resolves (max. 3). You can Tribute this card with 3 Spell Counters on it; Special Summon 1 "Buster Blader" from your hand, Deck, or Graveyard.
Edison rulings: ●You place a Spell Counter on this card when the Spell Card resolves, so if Magic Jammer is used to negate the Spell Card's activation then you don't place a Spell Counter on this monster. But if Imperial Order is chained to the Spell Card, you still place a Spell Counter on this monster because the activation of the Spell Card was not negated. If the Spell Card was a Continuous, Equip, or Field Spell Card, and “Dust Tornado” is chained to its activation and destroys it before it resolves you still place a Spell Counter because the activation of the card was not negated.
●If you activate a Spell Card, and your opponent chains Call of the Haunted to Special Summon Skilled White Magician, Skilled White Magician does not get a Spell Counter for that Spell Card because Skilled White Magician must be face-up on the field when the Spell Card is activated and when it resolves in order to get a Spell Counter.
●You place a Spell Counter for any Spell Card that is activated, including Equip Spell, Field Spell, etc.
●When you use the effect of a Continuous Spell Card that is already face-up on the field, such as Inspection, or sending Wave-Motion Cannon to the GY, or paying for Messenger of Peace, you don't place a Spell Counter on this monster.
●When Double Spell is played, you get a Spell Counter on this monster for the activation of Double Spell, but not for the target of Double Spell because the target is never activated; so you get 1 Spell Counter on this monster.
●You don't place 

## Slate Warrior
[effect Flip Effect Level 4 WIND Fiend 1900/400] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): FLIP: This card gains 500 ATK and DEF.
If this card is destroyed by battle: The monster that destroyed it loses 500 ATK and DEF.

## Smoke Grenade of the Thief
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/goat-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① If this Equip Card is destroyed by an effect: Look at your opponent's hand and discard 1 card from it.
Edison rulings: ● If the equipped monster is destroyed by battle, this effect does not activate.
● If the equipped monster is destroyed at the same time as this card, this effect does activate.

## Snatch Steal
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Equip only to a monster your opponent controls. Take control of the equipped monster. During each of your opponent's Standby Phases: They gain 1000 LP.
Goat text: Equip only to a monster your opponent controls. Take control of the equipped monster. During each of your opponent's Standby Phases: They gain 1000 Life Points.
Edison rulings: ●Your can't select your opponent's face-down monster.
●If you equip your opponent's monster with Snatch Steal, and later your opponent equips the same monster with Snatch Steal, your opponent gains control of the monster.
●If you control your opponent's monster with Snatch Steal and your opponent takes control of it with Brain Control, the monster is returned to you during the End Phase.
●If you control your opponent's monster with Snatch Steal and your opponent takes control of it with Brain Control, if Snatch Steal is removed from the field your opponent keeps the monster. It does not return to you during the End Phase.
●If you control your opponent's monster with Snatch Steal and Giant Trunade returns Snatch Steal to its owner's hand, the equipped monster is returned to its owner.
●If you control your opponent's monster with Snatch Steal and it is flipped face-down while you control it, the monster remains under your control and does not return to your opponent, even if it is flipped face-up.

## Sogen
[spell Field] formats: both
Text (Edison): All Warrior and Beast-Warrior monsters on the field gain 200 ATK/DEF.

## Solar Flare Dragon
[effect Level 4 FIRE Pyro 1500/1000] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): While you control another Pyro monster, this card can't be attacked. During each of your End Phases: Inflict 500 damage to your opponent.
Goat text: While you control another Pyro-Type monster, this card cannot be attacked. During each of your End Phases: Inflict 500 damage to your opponent.
Edison rulings: ●If you have 2 Solar Flare Dragons, or a Solar Flare Dragon equipped with Raregold Armor and another Pyro-Type monster, your opponent can't attack.
●Even if Solar Flare Dragon's Type is changed, as long as there is another Pyro-Type monster on your side of the field, Solar Flare Dragon can't be attacked.
●You can apply Barrel Behind the Door to the effect of Solar Flare Dragon.

## Solar Ray
[trap Normal] formats: both
Text (Edison): Inflict 600 points of damage to your opponent's LP for each face-up LIGHT monster on your side of the field.
Goat text: Inflict 600 points of damage to your opponent's Life Points for each face-up LIGHT monster on your side of the field.

## Solemn Wishes
[trap Continuous] formats: both
Text (Edison): Increase your LP by 500 points each time you draw a card (or cards).
Goat text: Increase your Life Points by 500 points each time you draw a card (or cards).

## Solomon's Lawbook
[trap Normal] formats: both
Text (Edison): Skip your next Standby Phase.

## Sorcerer of Dark Magic
[effect Level 9 DARK Spellcaster 3200/2800] formats: both
Text (Edison): Cannot be Normal Summoned/Set. Must be Special Summoned (from your hand) by Tributing 2 Level 6 or higher Spellcaster monsters, and Cannot be Special Summoned by other ways. During either player's turn, when a Trap Card is activated: You can negate the activation, and if you do, destroy it. This card must be face-up on the field to activate and to resolve this effect.
Goat text: Cannot be Normal Summoned/Set. Must be Special Summoned (from your hand) by Tributing 2 Level 6 or higher Spellcaster-Type monsters, and cannot be Special Summoned by other ways. During either player's turn, when a Trap Card is activated: You can negate the activation, and if you do, destroy it. This card must be face-up on the field to activate and to resolve this effect.

## Sparks
[spell Normal] formats: both
Text (Edison): Inflict 200 points of damage to your opponent's LP.
Goat text: Inflict 200 points of damage to your opponent's Life Points.

## Spatial Collapse
[trap Continuous] formats: both
Text (Edison): You can only activate this card if both you and your opponent each have 5 or less cards on the field. The maximum number of cards that each player can have on the field is 5.
Edison rulings: ●If Spatial Collapse is activated, and an effect is chained so that a player has more than 5 cards on the field after Spatial Collapse resolves, the controller selects cards to send to the GY to make the number 5.
●You can activate Spatial Collapse when you have 5 or less cards on the field and your opponent has 5 or less cards on the field.
●Spatial Collapse includes Tokens, too.
●While Spatial Collapse is active and you have 1 or more cards already on your side of the field, you can't activate Scapegoat because you would have your 1 previous card + the Scapegoat card + 4 monster tokens = 6.
●When you have 4 cards on your side of the field while Spatial Collapse is active, you can't activate Change of Heart.
●When Cyber Jar is activated while Spatial Collapse is active, if the number of cards exceeds 5, each player selects cards to send to the GY to make the number 5.
●When you have 4 cards on the field and you activate Remove Brainwashing, you select cards to destroy to make the number of cards you control 5.

## Spear Cretin
[effect Flip Effect Level 2 DARK Fiend 500/500] formats: both
Text (Edison): FLIP: When this card is sent to the GY after being flipped, each player selects 1 monster from their GY, and Special Summons it in Attack Position or face-down Defense Position.
Goat text: FLIP: When this card is sent to the Graveyard after being flipped, each player selects 1 monster from their Graveyard, and Special Summons it in face-up Attack Position or face-down Defense Position.
Edison rulings: ●If you can Special Summon a monster but your opponent can't, you will still Special Summon. If your opponent can Special Summon a monster and you can't, your opponent will still Special Summon.
●Special Summoning a monster is optional.
●Spear Cretin can't Special Summon itself from the GY, but it can Special Summon another copy of Spear Cretin.
●After Spear Cretin is flipped face-up, if it and another monster you control are destroyed by the same effect, you can Special Summon the other destroyed monster.

## Spear Dragon
[effect Level 4 WIND Dragon 1900/0] formats: both
Text (Edison): During battle between this attacking card and a Defense Position monster whose DEF is lower than the ATK of this card, inflict the difference as Battle Damage to your opponent. If this card attacks, it is changed to Defense Position at the end of the Damage Step.
Edison rulings: ●If Spear Dragon attacks, even if the damage is reduced to 0 by the effect of Waboku or Kuriboh, it is still changed to Defense Position.
●Spear Dragon will change to Defense Position after it attacks, regardless of the battle position of the opponent’s monster.
●The effect of Spear Dragon does not prevent you from manually changing its battle position later on. Of course, you can't change it in the same turn after you attacked with Spear Dragon. But during your next turn you can change it back to Attack Position (and attack again the same turn, if you choose).
●If you attack your opponent’s Defense Position monster with 0 DEF with your Spear Dragon, and have Dragon’s Rage active on the field, the opponent only takes 1900 points of damage. The effects are not cumulative.
●The effect of Lord of D. won't prevent the effect of Spear Dragon from changing it to Defense Position after it attacks.

## Special Hurricane
[spell Normal] formats: both
Text (Edison): Discard 1 card from your hand. Destroy all Special Summoned monsters on the field.
Edison rulings: ●Special Hurricane will destroy face-down monsters that were Special Summoned.
●If a monster is Special Summoned, then removed from the field with Interdimensional Matter Transporter, and returns to the field, Special Hurricane WILL destroy it if activated after it returns to the field.

## Spellbinding Circle
[trap Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Activate this card by targeting 1 monster your opponent controls; it can't attack or change its battle position. When that monster is destroyed, destroy this card.
Goat text: Activate this card by targeting 1 monster your opponent controls; it cannot attack or change its battle position. When that monster is destroyed, destroy this card.
Edison rulings: ●The Battle Position of a monster targeted by this card can still be changed by card effects, such as Book of Moon, Stop Defense, etc.
●This card may select a face-down monster as a target. This prevents the monster from being Flip Summoned, but it will still be flipped face-up if it is the target of an attack.
●If the targeted monster is Tributed, changed into an Equip Spell Card by the effect of Relinquished, returned to the owner’s hand, or otherwise removed from the field without being destroyed, Spellbinding Circle remains on the field meaninglessly.
●You can chain Spellbinding Circle to the activation of a Flip Effect when a monster is Flip Summoned or flipped face-up, but it won't negate the activation or resolution of the Flip Effect.
●You can activate Change of Heart and take control of a monster targeted by Spellbinding Circle but you can't attack with it or change its Battle Position.
●If a monster attacks and you activate Spellbinding Circle, the monster’s attack stops.

## Spellbook Organization
[spell Quick-Play] formats: both
Text (Edison): Look at the top 3 cards of your Deck, then return them to the top of the Deck in any order.

## Sphinx Teleia
[effect Level 10 LIGHT Beast 2500/3000] formats: both
Text (Edison): You can pay 500 LP to Special Summon this card when "Pyramid of Light" is on the field. This card can't attack during the turn that it is Normal Summoned or Special Summoned. This card Cannot be Special Summoned from the GY. If this card destroys a Defense Position monster as a result of battle, inflict damage to your opponent's LP equal to half of the DEF of the destroyed monster.
Goat text: You can pay 500 Life Points to Special Summon this card when "Pyramid of Light" is on the field. This card cannot attack during the turn that it is Normal Summoned or Special Summoned. This card cannot be Special Summoned from the Graveyard. If this card destroys a Defense Position monster as a result of battle, inflict damage to your opponent's Life Points equal to half of the DEF of the destroyed monster.
Edison rulings: ●This card’s effect which allows you to Special Summon it is a Spell Speed 1 effect that you can only activate during your Main Phase 1 or 2.

## Spiral Spear Strike
[spell Continuous] formats: both
Text (Edison): If "Gaia The Fierce Knight", "Swift Gaia the Fierce Knight", or "Gaia the Dragon Champion" you control attacks a Defense Position monster, inflict piercing battle damage to your opponent. If "Gaia the Dragon Champion" inflicts battle damage with this effect: Draw 2 cards, then discard 1 card.
Edison rulings: ●The effect of “Spiral Spear Strike” that causes you to draw can be chained to. But the first effect is a Continuous Effect that can't be chained to.
●If you have 2 copies of “Spiral Spear Strike”, or “Spiral Spear Strike” and a “Gaia the Dragon Champion” equipped with “Fairy Meteor Crush”, the damage to your opponent’s Life Points is not doubled. (In the case of “Fairy Meteor Crush”, you still can draw for the “Spiral Spear Strike” effect.)

## Spirit's Invitation
[trap Continuous] formats: both
Text (Edison): Each time your Spirit monster returns to your hand, select 1 monster on your opponent's side of the field and return it to its owner's hand. Pay 500 LP during each of your Standby Phases. If you don't, destroy this card.
Goat text: Each time your Spirit monster returns to your hand, select 1 monster on your opponent's side of the field and return it to its owner's hand. Pay 500 Life Points during each of your Standby Phases. If you do not, destroy this card.
Edison rulings: ●You can choose not to pay 500 Life Points during your Standby Phase, and destroy this card instead.
●The effect of this card is applied even when a Spirit Monster is returned to its owner’s hand by the effect of another card, such as Penguin Soldier.

## Spiritualism
[spell Normal] formats: both
Text (Edison): Return 1 Spell/Trap Card your opponent controls to the hand. This card's activation and effect can't be negated.
Goat text: Return 1 Spell/Trap Card your opponent controls to the hand. This card's activation and effect cannot be negated.
Edison rulings: Return 1 Spell or Trap Card on your opponent's side of the field to the owner's hand. This card's activation and effect can't be negated by any other card.
●The Spell / Trap Card goes to its owner’s hand.
●This targets 1 Spell / Trap Card your opponent controls, even monsters treated as Equip Spell Cards.
●If you can't activate (play face-up) Spell Cards, you can't activate this card.
●This may be due to an effect like Spell Canceller, Sonic Jammer, or Cold Wave.

## Spring of Rebirth
[spell Continuous] formats: both
Text (Edison): Increase your LP by 500 points every time monsters return from the field to the owner's hand.
Goat text: Increase your Life Points by 500 points every time monsters return from the field to the owner's hand.
Edison rulings: ●Only the controller of Spring of Rebirth gains Life Points by its effect. If you control Spring of Rebirth, you gain Life Points even when a monster is returned to your opponent’s hand.
●You gain 500 Life Points each time a monster or monsters on the field are returned to their owner’s hand. So if Penguin Soldier returns two monsters at once, you only gain 500 Life Points.
●Spirit Monsters are sent to the owner’s hand one at a time during the End Phase. So if you have 4 face-up Spirit Monsters during the End Phase, you will gain 500 Life Points for each, totaling 2000 Life Points.
●Multiple Spring of Rebirth cards are cumulative.

## St. Joan
[fusion Fusion Level 7 LIGHT Fairy 2800/2000] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "The Forgiving Maiden" + "Darklord Marie"

## Stamping Destruction
[spell Normal] formats: both
Text (Edison): If you control a Dragon monster: Target 1 Spell/Trap on the field; destroy that target, and if you do, inflict 500 damage to its controller.
Rulings: 1. When you activate this card, if the opponent activates an effect in a chain that destroys the targeted Spell or Trap Card, the opponent will not take the 500 points of damage. If your opponent merely chains the Spell or Trap card that you targeted, the Spell or Trap Card will be destroyed when "Stamping Destruction" resolves and your opponent will take 500 points of damage. (Remember that Spell and Trap Cards remain on the field until the entire chain resolves, unless destroyed by a card effect during the chain.)
2. If your opponent destroys all the Dragon-Type monsters on your side of the field as a chain to the activation of this card, this card will still resolve since the conditions were met at the time of activation.

## Star Boy
[effect Level 2 WATER Aqua 550/500] formats: both
Text (Edison): As long as this card remains face-up on the field, increase the ATK of all WATER monsters by 500 points and decrease the ATK of all FIRE monsters by 400 points.

## Statue of the Wicked
[trap Normal] formats: both
Text (Edison): When this face-down card is destroyed and sent to the GY, Special Summon 1 "Wicked Token" (Fiend/DARK/Level 4/ATK 1000/DEF 1000) on your side of the field.
Goat text: When this face-down card is destroyed and sent to the Graveyard, Special Summon 1 "Wicked Token" (Fiend-Type/DARK/Level 4/ATK 1000/DEF 1000) on your side of the field.
Edison rulings: ●This card is only activated if sent from the field to the GY. There is no way to activate this card while it is Set on the field.
●The effect of Statue of the Wicked is activated in the GY, so its effect is activated even if Jinzo is on the field, because Jinzo only applies to Trap Cards and Trap Card effects on the field. Also, cards like Seven Tools of the Bandit can't be used against Statue of the Wicked.
●Statue of the Wicked activates its effect even if it is destroyed on the same turn it was Set.
●If Banisher of the Light is in play, then Statue of the Wicked does not activate its effect when destroyed, because it is not sent to the GY.
●Statue of the Wicked activates its effect even if you destroy your own Statue of the Wicked.
●You can Tribute a Wicked Token.

## Staunch Defender
[trap Normal] formats: both
Text (Edison): You can only activate this card when your opponent declares an attack. Select 1 face-up monster on your side of the field. During this turn, your opponent can only designate the selected monster as an attack target and your opponent must attack the selected monster with all face-up monsters.
Edison rulings: ●This card only affects Attack Position monsters on your opponent's side of the field that can attack.
●Activating the card causes a replay.
●Monsters Special Summoned during the Battle Phase after activation of Staunch Defender must also attack the monster selected by Staunch Defender.
●If your monster selected with Staunch Defender is destroyed, your opponent's remaining monsters can't attack.
●When your opponent chains Ring of Destruction to your Staunch Defender to destroy the selected monster, the effect of Staunch Defender is negated and battle is conducted normally.
●While Staunch Defender is active, your opponent must still pay costs to attack with Dark Elf, etc., if he/she attacks with that monster.
●You can't select Guardian Kay'est or The Legendary Fisherman for Staunch Defender if they can't be attacked.
●You can activate Staunch Defender when a monster affected by Diffusion Wave Motion declares an attack. The monster affected by Diffusion Wave Motion will then attack your selected monster once (and only once).
●When you select Spirit Reaper or The Reaper on the Nightmare as the target of Staunch Defender, resolve the chain, and after the effect of Staunch Defender resolves, the selected monster is destroyed. A replay will occur, but the opponent can no longer attack because the selected monster is gone.
●If two Staunch Defenders are activated during the same turn, the last one to resolve will be the one that applies.
●If Absolute End and Staunch Defender are both

## Stealth Bird
[effect Level 3 DARK Winged Beast 700/1700] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Once per turn: You can change this card to face-down Defense Position. When this card is Flip Summoned: Inflict 1000 damage to your opponent.

## Steel Scorpion
[effect Level 1 EARTH Machine 250/300] formats: both
Text (Edison): A non Machine Monster attacking "Steel Scorpion" will be destroyed at the End Phase of your opponent's 2nd turn after the attack.
Goat text: A non Machine-Type Monster attacking "Steel Scorpion" will be destroyed at the End Phase of your opponent's 2nd turn after the attack.
Edison rulings: ●If the affected monster is removed from the field or flipped face-down, it is not destroyed during the End Phase.

## Steel Shell
[spell Equip] formats: both
Text (Edison): A WATER monster equipped with this card increases its ATK by 400 points and decreases its DEF by 200 points.

## Stim-Pack
[spell Equip] formats: both
Text (Edison): The equipped monster gains 700 ATK. During each of your Standby Phases, the equipped monster loses 200 ATK.

## Stone Statue of the Aztecs
[effect Level 4 EARTH Rock 300/2000] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Double any Battle Damage your opponent takes when they attack this monster.
Edison rulings: ●The Battle Damage doubled by Stone Statue of the Aztecs' effect is still considered Battle Damage (not effect damage).
●If Rod of the Mind's Eye is equipped to Stone Statue of the Aztecs, the Battle Damage will be 1000.
●The Battle Damage is doubled during damage calculation.
●When Amazoness Swordswoman (1500 ATK) attacks Stone Statue of the Aztecs (2000 DEF), the controller of Stone Statue of the Aztecs takes 1000 Battle Damage.

## Stop Defense
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Select 1 Defense Position monster on your opponent's side of the field and change it to Attack Position.
Edison rulings: ●Using Stop Defense on a face-down monster does not constitute a Flip Summon, so Trap Hole could not be used.
