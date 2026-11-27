# Full pool batch 16: 61 cards. Write js/cards/full-16.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## The A. Forces
[spell Continuous] formats: both
Text (Edison): All Warrior monsters you control gain 200 ATK for each Warrior or Spellcaster monster you control.
Goat text: All Warrior-Type monsters you control gain 200 ATK for each Warrior or Spellcaster-Type monster you control.
Edison rulings: ●Multiple copies of The A. Forces are cumulative. For example, if you control 3 Warrior-Type monsters and have 2 copies of The A. Forces active, each Warrior-Type monster has its ATK increased by 1200 points.

## The Beginning of the End
[spell Normal] formats: edison
Text (Edison): If you have 7 or more DARK monsters in your GY: Banish 5 DARK monsters from your GY; draw 3 cards.
Edison rulings: ●Removing from play 5 DARK monsters from your GY is a cost to activate this card.

## The Big March of Animals
[spell Quick-Play] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Until the end of this turn, all face-up Beast monsters on your side of the field gain 200 ATK for each Beast monster on your side of the field.
Goat text: Until the end of this turn, all face-up Beast-Type monsters on your side of the field gain 200 ATK for each Beast-Type monster on your side of the field.
Edison rulings: ●“The Big March of Animals” applies its effect at resolution of the card and does not recalculate during the turn. Its effect lasts as long as the affected monsters remain face-up on the field, or until the End Phase.
●“The Big March of Animals” does not affect monsters Summoned after it resolves.
●“The Big March of Animals” does not count or affect face-down monsters.
●This is not an effect that targets. It is applied to all face-up Beast-Type monsters on your side of the field.

## The Big Saturn
[effect Level 8 DARK Machine 2800/2200] formats: edison
Text (Edison): Ⓒ Cannot be Special Summoned from the hand/Deck. 
① Once per turn: You can discard 1 card and pay 1000 LP; this card gains 1000 ATK until the End Phase. 
② If this card in your possession is destroyed by your opponent's card effect and sent to your GY: Both players take 2800 damage.
Edison rulings: 1. Discard 1 card and paying 1000 Life Points are a cost.
2. If "The Big Saturn" is destroyed by your opponent while equipped to "Relinquished" its effect still activates.
3. The effect of "The Big Saturn" to inflict damage only activates while the owner of the card controls it.
4. The damage dealt is the original ATK of "The Big Saturn".
5. If "The Big Saturn" is destroyed while it's in your hand, the effect to deal damage still activates.

## The Bistro Butcher
[effect Level 4 DARK Fiend 1800/1000] formats: both
Text (Edison): When this card inflicts Battle Damage to your opponent, your opponent draws 2 cards.

## The Calculator
[effect Level 2 LIGHT Thunder 0/0] formats: edison
Text (Edison): The ATK of this card is the combined Levels of all face-up monsters you control x 300.
Edison rulings: ●The ATK determined by The Calculator's effect is not treated as its original ATK.

## The Cheerful Coffin
[spell Normal] formats: both
Text (Edison): Discard up to 3 Monster Cards from your hand to the GY.
Goat text: Discard up to 3 Monster Cards from your hand to the Graveyard.

## The Creator
[effect Level 8 LIGHT Thunder 2300/3000] formats: both (Goat already has a goat-only script in js/cards/goat-6.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Cannot be Special Summoned from the GY. Once per turn: You can target 1 monster in your GY; send 1 card from your hand to the GY, and if you do, Special Summon that target.
Goat text: Cannot be Special Summoned from the Graveyard. Once per turn: You can target 1 monster in your Graveyard; send 1 card from your hand to the Graveyard, and if you do, Special Summon that target.
Edison rulings: ●Sending 1 card from your hand to the GY is not a cost to activate the effect of The Creator. It is part of the effect. So if your opponent chains Disappear to remove the targeted monster in your GY from play, the effect of The Creator disappears and you don't send 1 card from your hand to the GY.
●If you use the effect of The Creator, and then it is flipped face-down then flipped face-up again that same turn, you may use the effect of The Creator again.
●If you activate the effect of The Creator, and it does not resolve because the opponent chains Skill Drain, or removes the targeted monster from the GY with Disappear, you’ve still used the effect. So you can't activate its effect again that turn (even if you destroy Skill Drain).
●To Special Summon The Creator with the effect of The Creator Incarnate, you must Tribute a face-up The Creator Incarnate from the field, not from your hand, etc.

## The Creator Incarnate
[effect Level 4 LIGHT Warrior 1600/1500] formats: both
Text (Edison): You can Tribute this card; Special Summon 1 "The Creator" from your hand.
Edison rulings: ●Ignition Effects on monsters can't be activated while the Effect Monster is face-down. So this face-down monster can't be Tributed for its own effect.

## The Dark Door
[spell Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Only 1 monster can attack during each Battle Phase.
Edison rulings: ●A single monster may still attack more than once while this card is on the field, such as Hayabusa Knight, Asura Priest, Black Luster Soldier – Envoy of the Beginning, a monster equipped with Twin Swords of Flashing Light – Tryce or a Spellcaster-Type Monster affected by Diffusion Wave-Motion.
●If the effect of Weather Report is used to gain an additional Battle Phase, one monster may attack once each Battle Phase.

## The Dragon Dwelling in the Deep
[effect Level 4 WATER Sea Serpent 1700/1400] formats: edison
Text (Edison): Place 1 Ocean Counter on this card during each player's Standby Phase. When this card is removed from the field, all Fish and Sea Serpent monsters you control gain 200 ATK for each Ocean Counter on this card, until the End Phase.

## The Dragon's Bead
[trap Continuous] formats: both
Text (Edison): Discard 1 card from your hand. Negate the effect of a Trap Card that targets 1 face-up Dragon monster and destroy the Trap Card.
Goat text: Discard 1 card from your hand. Negate the effect of a Trap Card that targets 1 face-up Dragon-Type monster and destroy the Trap Card.
Edison rulings: ●When you first activate this card (flip it face-up) you don't have to activate its effect.
●If The Dragon’s Bead is already face-up on the field, you may activate it multiple times in the same chain, but you must discard 1 card from you hand as a cost for each activation.
●You can't activate the effect of The Dragon’s Bead during the Damage Step.
●You can't activate the effect of The Dragon’s Bead to negate a Trap Card that has already resolved, such as a Nightmare Wheel the opponent activated on a previous turn.
●You can only activate the effect of this card to negate a Trap Card that targets a face-up Dragon-Type monster, so it can't negate Mirror Force, Waboku, Torrential Tribute, Bottomless Trap Hole, etc.

## The Emperor's Holiday
[trap Continuous] formats: both
Text (Edison): Negate all Equip Card effects on the field.
Edison rulings: ●You can chain The Emperor’s Holiday to Premature Burial and the effect of Premature Burial will be negated and the targeted monster will never leave the GY. If Premature Burial is already active when you activate The Emperor’s Holiday the equipped monster is unaffected.

## The Eye of Truth
[trap Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Your opponent must keep their hand revealed. Once per turn, during your opponent's Standby Phase, if they have a Spell(s) in their hand: They gain 1000 LP if they have a Spell(s) in their hand at resolution.
Edison rulings: ●When The Eye of Truth is activated in a chain you don't see your opponent’s hand until The Eye of Truth resolves. So if The Eye of Truth is step 3 in a 5 step chain, steps 5 and 4 will resolve, then The Eye of Truth resolves and your opponent reveals his/her hand, then steps 2 and 1 resolve.
●When The Eye of Truth is active and a card such as Robbin’ Goblin requires that the opponent discard a card from their hand randomly, the opponent should hide and shuffle his hand, discard a random card, and then reveal their hand again.

## The Fiend Megacyber
[effect Level 6 DARK Warrior 2200/1200] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If your opponent controls at least 2 more monsters than you do, you can Special Summon this card (from your hand).

## The First Sarcophagus
[trap Continuous] formats: both
Text (Edison): During each of your opponent's End Phases, place 1 card face-up on your side of the field from your hand/Deck in this order: "The Second Sarcophagus", "The Third Sarcophagus". If 1 Sarcophagus card is removed from your side of the field, all of them on your side of the field are sent to the GY. When you have all 3 Sarcophagus cards on your side of the field, send all Sarcophagus cards on your side of the field to the GY to Special Summon 1 "Spirit of the Pharaoh" from your hand/Deck.
Goat text: During each of your opponent's End Phases, place 1 card face-up on your side of the field from your hand or Deck in this order: "The Second Sarcophagus", "The Third Sarcophagus". If 1 Sarcophagus card is removed from your side of the field, all of them on your side of the field are sent to the Graveyard. When you have all 3 Sarcophagus cards on your side of the field, send all Sarcophagus cards on your side of the field to the Graveyard to Special Summon 1 "Spirit of the Pharaoh" from your hand or Deck.
Edison rulings: ●If you have all 3 Sarcophagi on your side of the field, the effect happens automatically; you have no choice in the matter.
●If you have multiple copies of The First Sarcophagus, each will have its own Second Sarcophagus and Third Sarcophagus. So if you have 2 of TheFirst Sarcophagus, you will have 2 of The Second Sarcophagus on the field. If you Special Summon Spirit of the Pharaoh or if 1 of the Sarcophagi is removed from the field, all Sarcophagi cards are sent to the GY.
●If 1 of the Sarcophagi is sent to the GY, all are sent simultaneously, not as a chain.

## The Flute of Summoning Dragon
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Special Summon up to 2 Dragon monsters from your hand. "Lord of D." must be on the field to activate and to resolve this effect.
Edison rulings: ●You can activate The Flute of Summoning Dragon if your opponent controls a face-up Lord of D. and you don't.
●You must Special Summon at least 1 Dragon-Type monster or you can't activate this card.

## The Flute of Summoning Kuriboh
[spell Quick-Play] formats: edison
Text (Edison): Take 1 "Kuriboh" or 1 "Winged Kuriboh" from your Deck, and either add it to your hand or Special Summon it.

## The Forceful Sentry
[spell Normal] formats: both
Text (Edison): Look at your opponent's hand. Select 1 card among them and return it to his/her Deck. The Deck is then shuffled.

## The Forces of Darkness
[trap Normal] formats: edison
Text (Edison): Target 2 "Dark World" monsters in your GY; add those targets to your hand.
Edison rulings: ●“The Forces of Darkness” targets 2 “Dark World” monsters in the GY. If “Disappear” is chained to remove from play 1 of the targeted monsters, the other 1 is still returned to your hand.

## The Forgiving Maiden
[effect Level 4 LIGHT Fairy 850/2000] formats: both
Text (Edison): Tribute this face-up card to return to your hand 1 of your monsters destroyed as a result of battle during this turn.
Edison rulings: ●The Forgiving Maiden's effect can be activated before or after your monster(s) are destroyed in battle, similar to Last Will.

## The Gift of Greed
[trap Normal] formats: edison
Text (Edison): Your opponent draws 2 cards.

## The Grave of Enkindling
[trap Normal] formats: edison
Text (Edison): You can only activate this card when a monster on your side of the field is destroyed as a result of battle and sent to the GY. You and your opponent each select 1 monster from your respective GYs and Special Summon them in Defense Position. Neither monster Special Summoned by this card's effect can change its battle position while it is face-up on the field, except with a card effect.

## The Graveyard in the Fourth Dimension
[spell Normal] formats: both
Text (Edison): Add 2 "LV" monsters from your GY to your Deck and shuffle it.
Goat text: Add 2 "LV" monsters from your Graveyard to your Deck and shuffle it.

## The Hunter with 7 Weapons
[effect Level 3 EARTH Warrior 1000/600] formats: both
Text (Edison): When this card is Normal Summoned, declare 1 Type of monster. When battling that Type of monster, increase the ATK of this card by 1000 points during Damage Calculation.
Edison rulings: ●When you declare an attack with this card against a monster of the selected Type, and the opponent activates Mirror Wall, the ATK will be halved first at attack declaration, and then increased by 1000 during damage calculation. So the final ATK will be 1500 = (1000/2) + 1000. Similarly, if the opponent activates the effect of Fairy Box, the ATK of this card will become 1000, because the 1000 point increase occurs after its ATK is reduced to 0.

## The Immortal of Thunder
[effect Flip Effect Level 4 LIGHT Thunder 1500/1300] formats: both
Text (Edison): FLIP: Increase your LP by 3000 points. When this card is sent from the field to the GY, you lose 5000 LP.
Goat text: FLIP: Increase your Life Points by 3000 points. When this card is sent from the field to the Graveyard, you lose 5000 Life Points.
Edison rulings: ●The owner of The Immortal of Thunder loses 5000 Life Points.
●If The Immortal of Thunder is destroyed while face-down, its owner does not lose 5000 Life Points.
●If your opponent takes control of your face-down The Immortal of Thunder and Flip Summons it, they gain 3000 Life Points. When it is sent to the GY, you lose 5000 Life Points.

## The Inexperienced Spy
[spell Normal] formats: both
Text (Edison): Select and see 1 card in your opponent's hand.

## The Kick Man
[effect Level 3 DARK Zombie 1300/300] formats: both
Text (Edison): When this card is Special Summoned, you can equip 1 appropriate Equip Spell Card from your GY to this card.
Goat text: When this card is Special Summoned, you can equip 1 appropriate Equip Spell Card from your Graveyard to this card.
Edison rulings: ●You select the Spell Card at activation of The Kick Man's effect, so your opponent can chain Disappear or Graverobber and remove the card you want to equip to him.

## The Lady in Wight
[effect Level 3 DARK Zombie 0/2200] formats: edison
Text (Edison): Face-up Level 3 or lower Zombie monsters on the field, except "The Lady in Wight", can't be destroyed by battle and are unaffected by Spell/Trap effects. This card's name becomes "Skull Servant" while it is in the GY.
Edison rulings: ●If your Level 3 or lower non-Zombie-Type monster is changed to Zombie-Type with DNA Surgery while The Lady in Wight is face-up on your side of the field, they will remain Zombie-Type monsters.
●If your Zombie-Type monster's Level is reduced to 3 or less with Demotion while The Lady in Wight is face-up on your side of the field, its Level remains reduced.

## The Last Warrior from Another Planet
[fusion Fusion Level 7 EARTH Warrior 2350/2300] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Zombyra the Dark" + "Maryokutai"
If this card is Special Summoned: Destroy all other monsters you control. Neither player can Summon monsters.
Edison rulings: ●Monsters may still be Set while this card is on the field.
●This card may be Tributed to Tribute Summon a Level 5 or higher monster.
●Neither player can activate Scapegoat, Magical Hats, Monster Reborn, etc.
●If your Parasite Paracide in your opponent’s Deck is drawn, it is not Special Summoned. It is instead destroyed and sent to your GY, and no damage is dealt.

## The Law of the Normal
[spell Normal] formats: both
Text (Edison): You can only activate this card while there are 5 face-up Level 2 or lower Normal Monsters on your side of the field. Both players discard all cards in their hands, and destroy all cards on the field except Level 2 or lower Normal Monsters.
Edison rulings: ●The Law of the Normal includes Tokens.
●The Law of the Normal also destroys all Spell & Trap Cards.
●The requirement to have 5 face-up Level 2 or lower Normal Monsters only has to be met when Law of the Normal is activated, not when it resolves.

## The League of Uniform Nomenclature
[trap Normal] formats: edison
Text (Edison): Select 1 face-up Level 2 or lower Normal Monster you control to activate this card. Special Summon as many cards as possible from your Deck with the same name as the selected monster.
Edison rulings: ●You can activate “The League of Uniform Nomenclature” and Special Summon only 1 copy of the selected monster from your Deck, but the opponent can check your Deck to verify that you don't have a second copy. You can activate “The League of Uniform Nomenclature” targeting a monster like “Right Arm of the Forbidden One” even though it is impossible to have more copies in your Deck (and your opponent can check your Deck to verify).
●A Normal Monster on the field that has its level lowered to 2 or less by an effect (like “A Legendary Ocean” or “Demotion”) is a proper target for “The League of Uniform Nomenclature”. So you can target “Archfiend Soldier” equipped with “Demotion” and Special Summon 2 copies of “Archfiend Soldier” from your Deck.
●If you target a “Harpie Lady” on the field equipped with “Demotion”, then you can Special Summon monsters that are treated as having the same name, like “Cyber Harpie Lady” or “Harpie Lady 3”.

## The Legendary Fisherman
[effect Level 5 WATER Warrior 1850/1600] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): While "Umi" is on the field, this card is unaffected by Spell effects and can't be targeted for attacks, but does not prevent your opponent from attacking you directly.
Goat text: While "Umi" is on the field, this card is unaffected by Spell effects and cannot be targeted for attacks, but does not prevent your opponent from attacking you directly.
Edison rulings: ●If you take control of your opponent's face-down The Legendary Fisherman with Change of Heart while Umi is face-up on the field, when it is flipped face-up it is immediately returned to your opponent.
●If you Special Summon The Legendary Fisherman with Premature Burial, when Premature Burial is destroyed while Umi is face-up on the field The Legendary Fisherman is not destroyed.
●If a face-up The Legendary Fisherman is the only monster you control, when your opponent's monsters attack they attack you directly.
●If a Spell Card is activated that would destroy Umi and a face-up The Legendary Fisherman simultaneously, Umi is destroyed but The Legendary Fisherman is not.
●If your opponent has Messenger of Peace or Swords of Revealing Light face-up on their side of the field, The Legendary Fisherman can attack if Umi is face-up on the field. If your opponent has Toll, you don't pay. If your opponent has Gravekeeper's Servant, you don't send a card from the top of your Deck to your GY.
●If The Legendary Fisherman is equipped with Ring of Magnetism while Umi is face-up on the field, the effect of Ring of Magnetism is not applied.
●If your opponent controls a monster equipped with Ring of Magnetism and another monster, you can attack the other monster with The Legendary Fisherman if Umi is face-up on the field.
●If your opponent has The Dark Door face-up on their side of the field, you can attack with one of your monsters and then attack with The Legendary Fisherman if Umi is face-u

## The Little Swordsman of Aile
[effect Level 3 WATER Warrior 800/1300] formats: both
Text (Edison): Offer 1 monster on your side of the field as a Tribute to increase this monster's ATK by 700 points until the end of the turn.

## The Mask of Remnants
[spell Normal] formats: edison
Text (Edison): Shuffle this card into its owner's Deck, OR if this card was put into play by the effect of "Masked Beast Des Gardius", this card is treated as an Equip Card. Control of the equipped monster is switched.

## The Masked Beast
[ritual Ritual Level 8 DARK Fiend 3200/1800] formats: both (Goat already has a goat-only script in js/cards/classic-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): You can Ritual Summon this card with "Curse of the Masked Beast".

## The Paths of Destiny
[trap Normal] formats: edison
Text (Edison): Both players toss a coin once. If a player's result is Heads, they gain 2000 LP, and if their result is Tails, they take 2000 damage.

## The Puppet Magic of Dark Ruler
[spell Normal] formats: both
Text (Edison): Select 1 Fiend monster from your GY. Remove from play monsters on your side of the field whose total Levels exactly equal the Level of the selected Fiend monster. Then Special Summon the selected monster from your GY.
Goat text: Select 1 Fiend-Type monster from your Graveyard. Remove from play monsters on your side of the field whose total Levels exactly equal the Level of the selected Fiend-Type monster. Then Special Summon the selected monster from your Graveyard.
Edison rulings: ●Removing monsters on your side of the field from play is not a cost, so the opponent must decide if they want to chain before you select which monsters are to be removed. If they chain a card that negates the effect of The Puppet Magic of Dark Ruler you don't remove any monsters.
●Face-down monsters may be removed from your side of the field.

## The Regulation of Tribe
[trap Continuous] formats: both
Text (Edison): Declare 1 Type of monster. Monsters of the declared Type can't attack. Tribute 1 monster from your side of the field during each of your Standby Phases. If you don't, this card is destroyed.
Goat text: Declare 1 Type of monster. Monsters of the declared Type cannot attack. Tribute 1 monster from your side of the field during each of your Standby Phases. If you do not, this card is destroyed.

## The Reliable Guardian
[spell Quick-Play] formats: both
Text (Edison): Increase 1 face-up monster's DEF by 700 points until the end of this turn.

## The Rock Spirit
[effect Level 4 EARTH Rock 1700/1000] formats: both
Text (Edison): This card Cannot be Normal Summoned or Set. This card can only be Special Summoned by removing from play 1 EARTH monster in your GY. Increase the ATK of this monster by 300 points during your opponent's Battle Phase.
Goat text: This card cannot be Normal Summoned or Set. This card can only be Special Summoned by removing from play 1 EARTH monster in your Graveyard. Increase the ATK of this monster by 300 points during your opponent's Battle Phase.

## The Sanctuary in the Sky
[spell Field] formats: both
Text (Edison): Battle damage to the controller of a Fairy monster from a battle involving that monster becomes 0.

## The Second Sarcophagus
[spell Continuous] formats: both
Text (Edison): This card can only be placed on the field by the effect of "The First Sarcophagus".

## The Secret of the Bandit
[spell Normal] formats: both
Text (Edison): This card can only be activated during Main Phase 1. Select 1 face-up monster on the field. Each time the selected monster inflicts Battle Damage to your opponent's LP this turn, your opponent discards 1 random card.
Goat text: This card can only be activated during Main Phase 1. Select 1 face-up monster on the field. Each time the selected monster inflicts Battle Damage to your opponent's Life Points this turn, your opponent discards 1 random card.
Edison rulings: ●This card’s effect targets a monster, so you select the target at the activation of the card. You may select a monster on the opponent’s side of the field. If you target an opponent’s monster, and then take control of it with Change of Heart and attack and do Battle Damage to your opponent, they will discard a card. If you target an opponent’s monster, and attack that monster with a weaker monster, causing Battle Damage to yourself, no one will discard a card. The monster targeted by your The Secret of the Bandit must deal Battle Damage to the opponent’s Life Points for the effect to activate.
●If the monster targeted by this card attacks directly and deals Battle Damage, this card’s effect will activate and the opponent must discard 1 card.
●If you activate multiple copies of this card targeting the same monster, the opponent will still only discard 1 card when the monster deals Battle Damage.

## The Selection
[trap Counter] formats: edison
Text (Edison): Pay 1000 LP. Negate the Summon of a monster that has the same Type as a monster on the field, and destroy it.

## The Shallow Grave
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Each player targets 1 monster in their own GY; each player Special Summons the target from their GY in face-down Defense Position.
Edison rulings: ●If The Shallow Grave is activated while Light of Intervention is active, the monsters are Special Summoned in face-up Defense Position.
●The Shallow Grave can't be activated if either play has no open Monster Card Zones or if either player does not have a monster in their GY that they can Special Summon.

## The Spell Absorbing Life
[trap Normal] formats: both
Text (Edison): Flip all face-down Defense Position Monster Cards on the field face-up. Flip Effects are not activated at this time. Increase your LP by 400 points for each Effect Monster Card on the field.
Goat text: Flip all face-down Defense Position Monster Cards on the field face-up. Flip Effects are not activated at this time. Increase your Life Points by 400 points for each Effect Monster Card on the field.
Edison rulings: ●The Spell Absorbing Life is like Ceasefire except it gives you Life Points instead of damaging your opponent.
●You can activate The Spell Absorbing Life as long as there is at least 1 face-down monster on the field, OR there is at least 1 effect monster on the field (or both).
●If you control Fire Princess and activate The Spell Absorbing Life, Fire Princess inflicts 500 damage no matter how many Life Points you gained from The Spell Absorbing Life.

## The Stern Mystic
[effect Flip Effect Level 4 LIGHT Spellcaster 1500/1200] formats: both
Text (Edison): FLIP: Reveal all face-down cards on the field (Flip Effects are not activated), then return them to their original positions.

## The Thing in the Crater
[effect Level 4 FIRE Pyro 1000/1200] formats: both
Text (Edison): When this card is destroyed and sent from the field to the GY, you can Special Summon 1 Pyro Monster from your hand.
Goat text: When this card is destroyed and sent from the field to the Graveyard, you can Special Summon 1 Pyro-Type Monster from your hand.
Edison rulings: ●You can Special Summon a high-level Normal Monster with The Thing in the Crater's effect, but not a Special Summon-only monster.
●The Thing in the Crater's effect activates even if destroyed face-down and sent to the GY.
●When you have a monster equipped with Metalsilver Armor, your opponent can activate The Thing in the Crater's effect because it doesn't target.

## The Third Sarcophagus
[spell Continuous] formats: both
Text (Edison): This card can only be placed on the field by the effect of "The First Sarcophagus".

## The Tricky
[effect Level 5 WIND Spellcaster 2000/1200] formats: edison
Text (Edison): You can Special Summon this card (from your hand) by discarding 1 card.

## The Trojan Horse
[effect Level 4 EARTH Beast 1600/1200] formats: both
Text (Edison): When Tribute Summoning an EARTH monster, you can treat this 1 monster as 2 Tributes.

## The Unfriendly Amazon
[effect Level 4 EARTH Warrior 2000/1000] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Tribute 1 of your monsters on the field (excluding this monster) during each of your Standby Phases. If you don't, this card is destroyed.
Goat text: Tribute 1 of your monsters on the field (excluding this monster) during each of your Standby Phases. If you do not, this card is destroyed.
Edison rulings: ●You may Tribute one The Unfriendly Amazon to satisfy the maintenance cost of another The Unfriendly Amazon.
●The Unfriendly Amazon is NOT an Amazoness.

## The Unhappy Girl
[effect Level 2 LIGHT Spellcaster 400/300] formats: both
Text (Edison): While this card is in Attack Position on the field, this card is not destroyed as a result of battle. (Damage calculation is applied normally.) A monster that battled with this card can't change its battle position, except with a card effect, or attack while this card is in Attack Position on the field.
Goat text: While this card is in face-up Attack Position on the field, this card is not destroyed as a result of battle. (Damage calculation is applied normally.) A monster that battled with this card cannot change its battle position, except with a card effect, or attack while this card is in face-up Attack Position on the field.
Edison rulings: ●The Unhappy Girl's effect only applies to manual changes. You can still change the monster's position with an effect.
●If The Unhappy Girl is in attack position and her controller uses Waboku or Kuriboh to take no damage from the attack, the attacking monster still can't change battle position.
●If Tyrant Dragon or Hayabusa Knight attacks The Unhappy Girl in attack position, they can't attack again that turn.
●If The Unhappy Girl is flipped face-down and then flipped face-up again, then her effect is reset and any monsters that battled with her before can change their battle position and attack again.
●If The Unhappy Girl applies her effect to a monster, and Skill Drain is then activated and resolves, and Skill Drain is then destroyed afterwards, then The Unhappy Girl's effect is re-applied and the monster that battled with her before Skill Drain was activated can't attack or change battle position once again.
●If your opponent attacks your The Unhappy Girl and you use Magic Cylinder to negate the attack, then The Unhappy Girl's effect is not applied.
●If you take control of your opponent's The Unhappy Girl, her effect on your monsters from previous attacks is still applied.

## The Unhappy Maiden
[effect Level 1 LIGHT Spellcaster 0/100] formats: both
Text (Edison): When this card is sent to the GY as a result of battle, the Battle Phase for that turn ends immediately.
Goat text: When this card is sent to the Graveyard as a result of battle, the Battle Phase for that turn ends immediately.

## The Warrior Returning Alive
[spell Normal] formats: both
Text (Edison): Target 1 Warrior monster in your GY; add that target to your hand.
Goat text: Target 1 Warrior-Type monster in your Graveyard; add that target to your hand.
Edison rulings: ●You may select a Warrior-Type Fusion Monster or Synchro Monster in your GY, but it will be returned to the Extra Deck instead of your hand.
●You may select any Warrior-Type monster to return to your hand, regardless of its Summoning requirements. So you may select a Black Luster Soldier - Envoy of the Beginning even if it was never properly Summoned.

## The Wicked Avatar
[effect Level 10 DARK Fiend 0/0] formats: edison
Text (Edison): This card Cannot be Special Summoned. This card Cannot be Normal Summoned or Set except by Tributing 3 monsters. Your opponent can't activate Spell or Trap Cards until the end of their 2nd turn after this card is Normal Summoned. The ATK and DEF of this card are each 100 points higher than the highest face-up monster's ATK on the field (except "The Wicked Avatar").
Edison rulings: ●If The Wicked Avatar is the only face-up monster on the field, its ATK and DEF are 100.

## The Wicked Dreadroot
[effect Level 10 DARK Fiend 4000/4000] formats: edison
Text (Edison): This card Cannot be Special Summoned. This card Cannot be Normal Summoned or Set except by Tributing 3 monsters. Halve the ATK and DEF of all monsters on the field, except this card.

## The Wicked Eraser
[effect Level 10 DARK Fiend 0/0] formats: edison
Text (Edison): This card Cannot be Special Summoned. This card Cannot be Normal Summoned or Set except by Tributing 3 monsters. The ATK and DEF of this card are each equal to the number of cards your opponent controls x 1000. When this card is destroyed and sent to the GY, destroy all cards on the field. During your Main Phase, you can destroy this card.

## The Wicked Worm Beast
[effect Level 3 EARTH Beast 1400/700] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): This face-up card on the field is returned to the owner's hand during the End Phase of your turn.
Edison rulings: ●If you have 7 or more cards in your hand after returning The Wicked Worm Beast to your hand, you must discard cards until you have 6 cards.

## The World Tree
[spell Continuous] formats: edison
Text (Edison): Each time a face-up Plant monster(s) on the field is destroyed, place 1 Flower Counter on this card. You can remove any number of Flower Counters from this card to activate these effects.
● 1 Counter: Target 1 Plant monster on the field; that target gains 400 ATK and DEF until the end of this turn. (This ATK gain remains even if this card leaves the field.)
● 2 Counters: Target 1 card on the field; destroy that target.
● 3 Counters: Target 1 Plant monster in your GY; Special Summon that target.
Edison rulings: ●Placing Flower Counters onto The World Tree does not start a Chain.
●Each of The World Tree's effects target. Each effect is an Ignition Effect.
●If the Monster Type of a monster on the field is changed to Plant-Type with DNA Surgery, when it is destroyed, place a Flower Counter onto The World Tree.
●If a Plant-Type monster is destroyed by battle, place a Flower Counter onto The World Tree when the destroyed monster is sent to the GY. If a Plant-Type monster is destroyed by a card effect, place a Flower Counter onto The World Tree after resolving the effect that destroyed the Plant-Type monster.
●If The World Tree is removed from the field after resolving its Remove 1: effect, the ATK and DEF increase still lasts until the End Phase.
