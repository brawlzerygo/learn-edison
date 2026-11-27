# Full pool batch 19: 60 cards. Write js/cards/full-19.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Archlord Zerato
[effect Level 8 LIGHT Fairy 2800/2300] formats: both
Text (Edison): © Cannot be Normal Summoned/Set. 
© Must be Special Summoned by Tributing 1 face-up "Warrior of Zera" you control, 
while "The Sanctuary in the Sky" is face-up on the field. 
① You can discard 1 LIGHT to the GY; destroy all monsters your opponent controls 
(Activate and resolve only if you control "The Sanctuary in the Sky").
Goat text: This card cannot be Normal Summoned or Set. This card cannot be Special Summoned except by Tributing 1 face-up "Warrior of Zera" on your side of the field while "The Sanctuary in the Sky" is on the field. If "The Sanctuary in the Sky" is on your side of the field, by discarding 1 LIGHT Monster Card from your hand to the Graveyard, destroy all monsters on your opponent's side of the field. If "The Sanctuary in the Sky" is not on your side of the field, this effect is not applied.
Edison rulings: ● The only way you can Special Summon this card is via its own procedure.
Even if it was initially summoned that way, you still can't summon it with card effects.

## Array of Revealing Light
[spell Field] formats: both
Text (Edison): Declare 1 Type of monster. Any monster of the declared Type can't declare an attack during the turn it is Normal Summoned, Flip Summoned or Special Summoned.
Goat text: Declare 1 Type of monster. Any monster of the declared Type cannot declare an attack during the turn it is Normal Summoned, Flip Summoned or Special Summoned.
Edison rulings: Declare 1 Type of monster. 
●You declare the Type of monster when you activate this card, not when it resolves. This means you pick the Type before the opponent decides whether to chain or not.
●You can't change your mind about the Type after you activate this card. The declared Type remains the same as long as this card is on the field.
●The Continuous Effect applies while this card is face-up on the field.
●This effect does not target, so the effects of Lord of D. or Frontier Wiseman won't protect monsters from this card’s effect.
●If the Type of a monster is changed (by the effect of DNA Surgery for example) during the turn which it was Summoned, it may attack that turn.
●If a monster of the declared Type is Summoned, then flipped face-down (by Book of Moon) and face-up again (by Book of Taiyou), it CAN attack because the non-attack effect was reset AND because flipping it face-up with Book of Taiyou was NOT a Flip Summon.

## Arsenal Robber
[trap Normal] formats: both
Text (Edison): Your opponent selects 1 Equip Spell Card from his/her Deck and sends it to the GY.
Goat text: Your opponent selects 1 Equip Spell Card from his/her Deck and sends it to the Graveyard.

## Arsenal Summoner
[effect Flip Effect Level 4 WIND Spellcaster 1600/1600] formats: both
Text (Edison): FLIP: Add 1 "Guardian" card from your Deck to your hand, except "Celtic Guardian", "Winged Dragon, Guardian of the Fortress 1", "Winged Dragon, Guardian of the Fortress 2", "Guardian of the Labyrinth", or "The Reliable Guardian".
Goat text: FLIP: Add 1 "Guardian" card from your Deck to your hand, except "Celtic Guardian", "Winged Dragon, Guardian of the Fortress #1", "Winged Dragon, Guardian of the Fortress #2", "Guardian of the Labyrinth", or "The Reliable Guardian".
Edison rulings: FLIP: Add 1 card that includes Guardian in its card name from your Deck to your hand. You can't add Celtic Guardian, Winged Dragon, Guardian of the Fortress #1, Winged Dragon, Guardian of the Fortress #2, Guardian of of the Labyrinth, or The Reliable Guardian.
●The FLIP Effect is mandatory, it activates & resolves on the field.
●You must show your opponent the card you retrieved with Arsenal Summoner.
●If you don't have any Guardian monsters you can retrieve when you activate Arsenal Summoner's effect, you must show your Deck to your opponent to prove it.
●You can add a card to your hand with Guardian in its name as long as it's not listed on Arsenal Summoner, such as Guardian of the Throne Room or Guardian Sphinx.

## Astral Barrier
[trap Continuous] formats: both
Text (Edison): If your opponent's monster attacks a monster you control: You can make the attack a direct attack instead.
Edison rulings: ●The Trigger Effect is optional, it activates & resolves on the field.
●This effect activates in Start of the Battle Step - Attack Declaration (like Mirror Force).
●If a Fusion Monster is Special Summoned with Magical Scientist, and attacks, you can't choose to make the attack a direct attack on your Life Points, because the effect of Magical Scientist prohibiting this is mandatory, but the effect of Astral Barrier is optional.
●The effect of Astral Barrier does not target the attacking monster.
●If Earthbound Spirit's Invitation is chained to Astral Barrier, Astral Barrier is applied. If Astral Barrier is chained to Earthbound Spirit's Invitation, Earthbound Spirit's Invitation is applied.

## Asura Priest
[effect Effect Spirit Level 4 LIGHT Fairy 1700/1200] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Cannot be Special Summoned. During the End Phase of the turn this card is Normal Summoned or flipped face-up: Return it to the hand. This card can attack all monsters your opponent controls once each.
Edison rulings: ●The 
●If the activation of this effect is negated (by Light and Darkness Dragon), this effect will activate again until it resolves (even if it resolves without effect due to Skill Drain).
●The Continuous Effect applies while this card is face-up on the field.
●Asura Priest may attack directly if it has not already attacked a monster this turn.
●Asura Priest can't attack a monster if it has already attacked directly this turn.
●These attacks don't have to be all in a row. You can attack monsters with Asura Priest, then attack with another monster, and Asura Priest can still attack again as long as it attacks a monster it has not attacked yet. If the opponent controls Spirit Reaper you can't continually attack it.
●Asura Priest does not have to attack all your opponent’s monsters.
●While Gravekeeper’s Servant / Toll is active, you pay each time Asura Priest attacks.
●If “Asura Priest” attacks a monster and your opponent activates “Magic Cylinder” to negate the attack, “Asura Priest” can attack that same monster again.
●Your opponent's Patrician of Darkness can re-direct all of your “Asura Priest” attacks to their “Spirit Reaper”.
●When Asura Priest attacks your opponent’s only monster, if the monster is removed from the field in the battle step, a replay occurs. Since Asura Priest never battled with a monster it can attack directly.

## Aswan Apparition
[effect Level 3 DARK Fiend 500/500] formats: both
Text (Edison): If this card inflicts Battle Damage to your opponent's LP, you can return 1 Trap Card from your GY to the top of your Deck.
Goat text: If this card inflicts Battle Damage to your opponent's Life Points, you can return 1 Trap Card from your Graveyard to the top of your Deck.
Edison rulings: ●The Trigger Effect is optional, it activates & resolves on the field.
●This effect activates in Substep 5 - After Damage Calculation.
●This effect targets a card in the GY, it will be negated by Necrovalley.

## Atomic Firefly
[effect Level 1 LIGHT Insect 100/200] formats: both
Text (Edison): When this face-up card on the field attacks or is attacked and it is destroyed as a result of battle, the player who destroyed it takes 1000 points of damage.
Edison rulings: ●The Trigger Effect is mandatory, it activates & resolves in the GY / banished.
●The card text is very correct on the card mechanics; Atomic Firefly has to be face-up BEFORE the attack is declared.
●This effect activates in Substep 7 - End of the Damage Step.
●You can use Barrel Behind the Door against Atomic Firefly's effect.

## Aussa the Earth Charmer
[effect Flip Effect Level 3 EARTH Spellcaster 500/1500] formats: both
Text (Edison): FLIP: While this card is face-up on the field, take control of 1 EARTH monster your opponent controls.
Edison rulings: FLIP: Take control of 1 EARTH monster on your opponent's side of the field, for as long as this card remains face-up on the field.
●The FLIP Effect is mandatory, it activates & resolves on the field.
●This effect activates (starting a Chain) even if there isn't a legal target on the field.
●This effect targets 1 EARTH monster your opponent controls.
●If “Enemy Controller” is chained to this effect and your opponent takes control of the “Charmer”, the Flip Effect disappears.
●If your opponent takes control of the target with “Mind Control”, control still reverts to you after the effect of “Mind Control” expires (even though it wasn’t your monster originally).
●If your opponent takes control of your monster with “Brain Control”, and you activate the Flip Effect of a “Charmer” to take it back, you keep control while the “Charmer” is face-up on the field.
●If “Book of Moon” is chained to the Flip Effect of a “Charmer” to flip the target monster face-down, the effect of the “Charmer” disappears.
●If a “Charmer” is removed from play with “Interdimensional Matter Transporter”, its effect is not re-applied when it’s back on the field.
●If “DNA Transplant” changes a monster’s Attribute so that it can be taken by a “Charmer”, and then “DNA Transplant” is destroyed so that the monster’s Attribute no longer corresponds to the effect of the “Charmer”, the controller of the “Charmer” loses control of the monster.
●If the turn player controls a “Charmer” and a monster controlled by its effe

## Autonomous Action Unit
[spell Equip] formats: both
Text (Edison): Pay 1500 LP, then target 1 monster in your opponent's GY; Special Summon that target to your side of the field in Attack Position, and equip it with this card. When this card leaves the field, destroy the equipped monster.
Goat text: Pay 1500 Life Points, then target 1 monster in your opponent's Graveyard; Special Summon that target to your side of the field in face-up Attack Position, and equip it with this card. When this card leaves the field, destroy the equipped monster.
Edison rulings: Pay 1500 Life Points. Select 1 Monster Card from your opponent's GY. Special Summon it to your side of the field in Attack Position, and equip it with this card. 
●Paying 1500 Life Points is a cost.
●This effect targets 1 monster in your opponent GY, it is negated by Necrovalley.
●The Continuous Effect does not start a Chain.
●If this card returns to the hand (by Giant Trunade), destroy the equipped monster immediately.
●If you use Autonomous Action Unit to Special Summon a monster from your opponent's GY and then activate Dimensionhole, Autonomous Action Unit is destroyed and when the monster returns to the field it returns to the original owner's control.

## Avatar of The Pot
[effect Level 3 EARTH Rock 1200/1300] formats: both
Text (Edison): By sending 1 "Pot of Greed" from your hand to the GY, draw 3 cards from your Deck.
Goat text: By sending 1 "Pot of Greed" from your hand to the Graveyard, draw 3 cards from your Deck.
Edison rulings: ●The Ignition Effect activates & resolves on the field.
●Sending Pot of Greed to the GY is a cost.
●If you have your opponent's Pot of Greed in your hand because of Exchange or Graverobber, you CAN send your opponent's Pot of Greed to the GY to activate your Avatar of the Pot's effect. But if you did this with Graverobber, you take 2000 points of damage to do so.
●You can't activate Avatar of the Pot's effect while Banisher of the Light is in play.

## Back to Square One
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/goat-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Discard 1 card, then target 1 monster on the field; place that target on the top of the Deck.

## Backfire
[trap Continuous] formats: both
Text (Edison): If a face-up FIRE monster(s) you control is destroyed and sent to the GY: Inflict 500 damage to your opponent.
Edison rulings: When a FIRE monster
●If a monster is FIRE because it is equipped with Scroll of Bewitchment, you can't activate Backfire's effect when it is sent to the GY because it is no longer equipped when it arrives in the GY.
●When multiple FIRE monsters are sent to the GY simultaneously, the damage is only 500 points.
●If you control Backfire and your opponent's FIRE monster, you can activate Backfire's effect when your opponent's monster that you control is destroyed.

## Backup Soldier
[trap Normal] formats: both
Text (Edison): While there are 5 or more monsters in your GY: Target up to 3 non-Effect Monsters with 1500 or less ATK in your GY; add them to your hand.
Goat text: While there are 5 or more monsters in your Graveyard: Target up to 3 non-Effect Monsters with 1500 or less ATK in your Graveyard; add them to your hand.
Edison rulings: Activate only if there are 5 or more monsters in your GY. Add up to 3 non-Effect Monsters with 1500 or less ATK from your GY to your hand.
●This effect selects up to 3 targets. You can even target Gemini, Fusion, and Synchro monsters.
●If you have 4 Effect Monsters and 1 Normal Monster with 1500 ATK in your GY, you can activate this card and return the 1 Normal Monster to your hand.
●If you have 5 Normal Monsters in your GY, you can activate Backup Soldier and chain a second Backup Soldier before the first resolves, because the 5 monster requirement only needs to be fulfilled at activation. This would allow you to put all 5 monsters in your hand, 3 with the first Backup Soldier and 2 with the second.
●If your opponent activates Delinquent Duo and you chain Backup Soldier with 2 pieces of Exodia and retrieve the other 3 from your GY you win the Duel before you have to discard for Delinquent Duo. This is because you check for victory conditions in between steps in a chain, (but not in between two separate effects of a single card like Graceful Charity).

## Bad Reaction to Simochi
[trap Continuous] formats: both
Text (Edison): As long as this card remains face-up on the field, any effect of increasing your opponent's LP is changed to inflict the same amount of points in damage to your opponent's LP.
Goat text: As long as this card remains face-up on the field, any effect of increasing your opponent's Life Points is changed to inflict the same amount of points in damage to your opponent's Life Points.
Edison rulings: As long as this card remains face-up on the field, any effect of increasing your opponent's Life Points is changed to inflict the same amount of points in damage to your opponent's Life Points.
●The Continuous Effect applies while this card is face-up on the field. It does not activate.
●This effect is not cumulative. If you control 2 copies of Bad Reaction to Simochi and your opponent activates Dian Keto the Cure Master, they only take 1000 points of damage.
●VS. Prime Material Dragon: if both Bad Reaction to Simochi and Prime Material Dragon are on the field when Player A's Upstart Goblin resolves, Player B will gain 1000 Life Points (gains / damage happen normally).
●These rules apply similarly to Nurse Reficule the Fallen One (erratum: Darklord Nurse Reficule).
●If you control this card on the field and activate Rain of Mercy (which makes both players gain 1000 LP): you gain 1000 Life Points and your opponent takes 1000 points of damage.

## Bait Doll
[spell Normal] formats: both
Text (Edison): Target 1 Set card in the Spell & Trap Card Zone; reveal that target, force its activation if it is a Trap Card, then negate its effect if the activation timing is incorrect, and if you do, destroy it. (If it is not a Trap Card, return it face-down.) When this card resolves, shuffle it into the Deck instead of sending it to the GY.
Goat text: Target 1 Set card in the Spell & Trap Card Zone; reveal that target, force its activation if it is a Trap Card, then negate its effect if the activation timing is incorrect, and if you do, destroy it. (If it is not a Trap Card, return it face-down.) When this card resolves, shuffle it into the Deck instead of sending it to the Graveyard.
Edison rulings: Force the activation of 1 face-down Trap Card. If the timing of the activation of the Trap Card is incorrect, negate the effect and destroy it. If it is not a Trap Card, it is returned to its original position. After this card is activated, it is placed into the Deck (not the GY). Then shuffle the Deck.
●You can't activate this card if you can't return cards to the Deck (by G.B. Hunter).
●As long as the activation and effect of Bait Doll are not negated, the effect of Bait Doll that shuffles it back into the Deck still resolves.
●This effect targets 1 Set Spell / Trap card on the field.
●The target can be chained if its activation requirement is met.
●The target can't be chained if it was just Set this turn (by Dust Tornado).
●If this card activates a Trap Card with a cost, and that Trap Card's activation timing is correct, its owner must pay all possible costs. If they can't pay the costs, the Trap Card is negated and destroyed.
●If Bait Doll targets a Set Royal Oppression, the opponent can chain the Royal Oppression which will negate the effect of Bait Doll (it won't return to your Deck), or the opponent can allow Bait Doll to force the activation of Royal Oppression, and Bait Doll will then be shuffled into the Deck and Royal Oppression will remain active since its activation timing was legitimate.
●If Jinzo is face-up on the field and the effect of Bait Doll forces the activation of a Normal or Counter Trap Card, that Trap Card’s effect is negated and the Trap Card is des

## Ballista of Rampart Smashing
[spell Equip] formats: both
Text (Edison): If the equipped monster attacks a face-down Defense Position monster, it gains 1500 ATK during damage calculation only.
Edison rulings: If the equipped monster attacks a face-down Defense Position monster, it gains 1500 ATK during damage calculation only.
●This Continuous Effect increases the ATK in Substep 4 - Damage Calculation.
●Ballista of Rampart Smashing only increases the ATK for damage calculation, then the increase disappears after the end of damage calculation.

## Balloon Lizard
[effect Level 4 EARTH Reptile 500/1900] formats: both
Text (Edison): Put 1 counter on this card during each of your Standby Phases. When this card is destroyed, inflict damage to the controller of the card that destroyed it equal to the number of counters X 400 points.
Edison rulings: ●The Trigger Effect is mandatory, it activates & resolves on the field.
●While Skill Drain is active, you can't put new counters on Balloon Lizard.
●The counters on Balloon Lizard are NOT Spell Counters.
●Remove all counters on Balloon Lizard if it is flipped face-down or removed from the field.
●The Trigger Effect is mandatory, it activates & resolves in the GY (or banished).
●If this card is destroyed by battle, this effect activates in Substep 7 - End of the Damage Step.
●You can use Barrel Behind the Door against Balloon Lizard's effect.

## Banisher of the Light
[effect Level 3 LIGHT Fairy 100/2000] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Any card sent to the GY is banished instead.
Goat text: Any card sent to the Graveyard is banished instead.
Edison rulings: ●The Continuous Effect applies while this card is face-up on the field.
●If Banisher of the Light is destroyed, it will be sent to the GY. If Banisher of the Light and other monsters are destroyed simultaneously all monsters are sent to the GY.
●If Don Zaloog battles an Attack Position Banisher of the Light, Banisher is marked as destroyed at the end of Substep 4 - Damage Calculation, but its Continuous Effect still applies, so any card sent to the GY in Substep 5 - After Damage Calculation (by Don Zaloog) will be banished. Finally, in Substep 7 - End of the Damage Step, Banisher of the Light is sent to the GY.
●Kuriboh and Thunder Dragon can be discarded from your hand and activated while Banisher of the Light is on the field.

## Banner of Courage
[spell Continuous] formats: both
Text (Edison): All monsters you control gain 200 ATK during your Battle Phase only.
Edison rulings: ●Multiple copies of this card are cumulative.

## Bark of Dark Ruler
[trap Normal] formats: both
Text (Edison): If a Fiend monster you control battles, during the Damage Step: Pay LP (in multiples of 100 points), then target the opponent's battling monster; that opponent's monster loses that much ATK and DEF, until the end of this turn.
Goat text: If a Fiend-Type monster you control battles, during the Damage Step: Pay LP (in multiples of 100 points), then target the opponent's battling monster; that opponent's monster loses that much ATK and DEF, until the end of this turn.
Edison rulings: ●This card targets your opponent’s monster that is battling your Fiend-Type monster.
●Paying Life Points for this card is a cost.
●You can't pay more Life Points than necessary. This means that if the target monster has ATK 1500 / DEF 1800, the highest amount of Life Points you can pay is 1800. The target monster will then be an ATK 0 / DEF 0. If the target monster has ATK 1850 / DEF 500, the most you can pay is 1800. This is because you have to play in multiples of 100, and paying 1900 would be paying more than necessary. So you may pay 1800 Life Points and the target monster would become an ATK 50 / DEF 0.

## Barrel Behind the Door
[trap Counter] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Activate only when a card's effect that would inflict damage to you is activated. Your opponent takes the damage instead.
Edison rulings: ●Barrel Behind the Door can only be activated against an effect that inflicts damage to YOUR Life Points.
●Barrel Behind the Door can only be activated against DAMAGE. It can't be activated against costs like Imperial Order or Wall of Revealing Light. It can't be activated against effects that cause you to lose Life Points like The Immortal of Thunder. It can't be activated against effects that switch damage, like another Barrel Behind the Door, because they don't inflict damage, they simply transfer it.
●You can't activate Barrel Behind the Door against a Continuous Spell or Trap Card, an Equip Spell Card, or a Field Spell Card. So you can't activate it against Magical Thorn, Dark Snake Syndrome, Wave-Motion Cannon, or Black Pendant.
●You can't activate Barrel Behind the Door against a Continuous Effect Monster like Gravekeeper’s Vassal or Fire Princess (even if an effect like Gift of the Mystical Elf is activated while Fire Princess is on the field).
●You can activate Barrel Behind the Door against Normal and Quick-Play Spell and Trap Cards, such as Tremendous Fire or Attack and Receive.
●You can activate Barrel Behind the Door against Trigger Effects like Lava Golem, Giant Germ, Relinquished (when it inflicts effect damage, since Barrel Behind the Door can be activated during the Damage Step because it is a Counter-Trap Card), Minar (when discarded), Parasite Paracide (when it inflicts effect damage), Bowganian, Mushroom Man #2, Reflect Bounder (when it is attacked), Shina

## Barrel Dragon
[effect Level 7 DARK Machine 2600/2200] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Once per turn: You can target 1 monster your opponent controls; toss a coin 3 times and destroy it if at least 2 of the results are heads.

## Bazoo the Soul-Eater
[effect Level 4 EARTH Beast 1600/900] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Once per turn: You can banish up to 3 monsters from your GY; this card gains 300 ATK for each, until the end of your opponent's turn.
Goat text: Once per turn: You can banish up to 3 monsters from your Graveyard; this card gains 300 ATK for each, until the end of your opponent's turn.
Edison rulings: ●If you remove Monster Cards from your GY to increase the ATK of Bazoo the Soul-Eater, then on your opponent’s turn he uses Change of Heart to gain control of the same Bazoo the Soul-Eater, your opponent can remove cards from his GY to further increase the ATK. The ATK increase you caused will end during that End Phase, and the ATK increase your opponent caused will end during your End Phase.
●Removing Monster Cards from the GY is a cost of Bazoo the Soul-Eater’s effect, so if your opponent chains to the activation of this effect with Call of the Haunted, to Special Summon Kycoo the Ghost Destroyer, the effect of Bazoo the Soul-Eater is not negated since the Monster Cards were already removed.

## Beastking of the Swamps
[effect Level 4 WATER Aqua 1000/1100] formats: both
Text (Edison): You can substitute this card for any 1 Fusion Material Monster. When you do this, the other Fusion Material Monster(s) must be the correct one(s).
Edison rulings: ●The effect does not have any classification. It is not an Ignition, Trigger, Quick, or Continuous Effect.
●This effect does not target.
●Using King of the Swamp as a Fusion Material does not start a Chain Link.
●The effect You can substitute this card for any 1 Fusion Material monster. of a monster like King of the Swamp is not applied while the monster is banished. If you activate Parallel World Fusion, then you can't use it as a substitute for a Fusion Material.
●The effect You can substitute this card for any 1 Fusion Material Monster of a monster like King of the Swamp or Goddess with the Third Eye is not applied while the monster is in the Deck.
●When Special Summoning Chimeratech Fortress Dragon or XYZ-Dragon Cannon, you can't send to the GY a monster like The Dark - Hex-Sealed Fusion as a substitute for a Fusion Material.
●If King of the Swamp is selected for the effect of Prohibition, you can't use either of its effects.

## Beckoning Light
[trap Normal] formats: both
Text (Edison): Discard your entire hand, then for each card you discarded to the GY by this effect, add 1 LIGHT monster from your GY to your hand.
Edison rulings: Discard all the cards in your hand, then select a number of LIGHT monsters in your GY equal to the number of cards you discarded, and add them to your hand.
●Discarding is not a cost.
●Beckoning Light doesn't target. When you resolve Beckoning Light, first discard, then pick cards to add to your hand. So you can add cards to your hand that you discarded while resolving Beckoning Light.
●You can't activate Beckoning Light if you have no cards in your hand.
●You can't activate Beckoning Light if there are fewer LIGHT monsters in your GY than there are cards in your hand, even if 1 or more of the cards in your hand are LIGHT monsters.
●You can activate Beckoning Light while Macro Cosmos is active, but since no cards will be discarded to the GY, you can't add any LIGHT monsters from your GY to your hand.
●If Disappear is chained, and there are now fewer LIGHT monsters in your GY than cards in your hand, Beckoning Light resolves without effect (you don't discard your hand or add cards to your hand).

## Behemoth the King of All Animals
[effect Level 7 EARTH Beast 2700/1500] formats: both
Text (Edison): This card can be Normal Summoned or Set with 1 Tribute. In that case, the original ATK of this card becomes 2000. When this card is Tribute Summoned, you can return from your GY to the owner's hand a number of Beast monsters equal to the number of Tributed monsters.
Goat text: This card can be Normal Summoned or Set with 1 Tribute. In that case, the original ATK of this card becomes 2000. When this card is Tribute Summoned, you can return from your Graveyard to the owner's hand a number of Beast-Type monsters equal to the number of Tributed monsters.
Edison rulings: ●It is possible to properly Tribute Summon Behemoth the King of All Animals with just 1 Tribute. For example, you can Tribute Summon it with Trojan Horse, or use Cost Down and then Tribute 1 monster because Behemoth the King of All Animals is only Level 5. In cases such as this, either 2000 ATK or 2700 ATK is correct, so the controller can select which ATK it will have.
●If Trojan Horse is Tributed to Tribute Summon Behemoth the King of All Animals, you still only return 1 monster from the GY to your hand, because it’s the same number as the number of monsters you Tributed to perform the Summon.
●If Behemoth the King of All Animals is Tribute Summoned with 2000 ATK, and is then flipped face-down or removed from play temporarily, its ATK becomes 2700 points when it is again face-up on the field.
●If you Tribute Summon Behemoth the King of All Animals with 1 Tribute, and Skill Drain is activated, its ATK becomes 2700 points. Even if Skill Drain is destroyed, the ATK remains at 2700 points.
●If you Tribute Set Behemoth the King of All Animals with 1 Tribute, its ATK will only be 2000 points when flipped face-up. However, once it is face-up, if it is flipped face-down again, the effect is reset and its ATK becomes 2700 points.
●The second effect of Behemoth the King of All Animals is a Trigger Effect that can be chained to. It is a targeting effect that targets a monster
●If you Tribute Summon this card with 1 Tribute and equip it with Megamorph, its current ATK will become 4000 

## Berserk Dragon
[effect Level 8 DARK Zombie 3500/0] formats: both
Text (Edison): Cannot be Normal Summoned/Set. Must be Special Summoned with "A Deal with Dark Ruler" and Cannot be Special Summoned by other ways. This card can attack all monsters your opponent controls once each. During each of your End Phases, this card loses 500 ATK.
Goat text: Cannot be Normal Summoned/Set. Must be Special Summoned with "A Deal with Dark Ruler" and cannot be Special Summoned by other ways. This card can attack all monsters your opponent controls once each. During each of your End Phases, this card loses 500 ATK.
Edison rulings: ●Berserk Dragon Cannot be Normal Summoned or Set, and Cannot be Special Summoned EXCEPT by the effect of A Deal with Dark Ruler. So Berserk Dragon Cannot be Special Summoned with Monster Reborn, etc., even if Special Summoned properly first.
●If Berserk Dragon is removed from play with Interdimension Matter Transporter, you can't try to resolve Berserk Dragon's effect before it returns to play; you must return it to play first and then it loses 500 ATK.
●While Skill Drain is active, Berserk Dragon's effects are negated. But Berserk Dragon's effect doesn't count turns, so if Skill Drain was active for 4 turns, and is then destroyed, don't reduce Berserk Dragon's ATK for those 4 turns.

## Berserk Gorilla
[effect Level 4 EARTH Beast 2000/1000] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card is in face-up Defense Position, destroy this card. This card must attack if able.
Edison rulings: ●If a face-down Berserk Gorilla is attacked and flipped face-up, it's destroyed after damage calculation.
●If a face-down Berserk Gorilla is flipped face-up by Swords of Revealing Light, it's destroyed after resolving Swords of Revealing Light.
●Berserk Gorilla can't attack if Swords of Revealing Light, multiple Marauding Captains, etc. are in play.
●If Stumbling and Final Attack Orders are both in play, and Berserk Gorilla is Summoned, Berserk Gorilla is destroyed when it is changed to Defense Position by Stumbling.
●If Final Attack Orders and Berserk Gorilla are both on the field, and the opponent targets Berserk Gorilla with Ring of Destruction, and you chain Zero Gravity, Berserk Gorilla is destroyed in the middle of the chain due to Zero Gravity's effect, and Ring of Destruction's effect disappears.
●If you control Berserk Gorilla and another monster, Berserk Gorilla doesn't have to be the first monster you attack with, you can attack with other monsters first, as long as you do attack with Berserk Gorilla.
●If The Dark Door is active and you control Berserk Gorilla and another monster, you can choose for your other monster to be the 1 monster that attacks.
●If you control “Berserk Gorilla” you must enter your Battle Phase, even if “Gravity Bind” is active on the field, preventing it from attacking.

## Bickuribox
[fusion Fusion Level 7 DARK Fiend 2300/2000] formats: both (Goat already has a goat-only script in js/cards/classic-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Crass Clown" + "Dream Clown"

## Birdface
[effect Level 4 WIND Winged Beast 1600/1600] formats: both
Text (Edison): When this card is destroyed by battle and sent to the GY: You can add 1 "Harpie Lady" from your Deck to your hand.

## Bite Shoes
[effect Flip Effect Level 2 DARK Fiend 500/300] formats: both
Text (Edison): FLIP: Change the battle position of 1 face-up monster on the field.

## Blade Knight
[effect Level 4 LIGHT Warrior 1600/1000] formats: both (Goat already has a goat-only script in js/cards/goat-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Gains 400 ATK while you have 1 or less cards in your hand. If you control no other monsters, the effects of Flip monsters destroyed by battle with this card are negated.
Edison rulings: ●If you control Blade Knight and a face-down monster on your side of the field, Blade Knight’s second effect is not applied because you control another monster (whether it is face-up or face-down is not important).
●If you have two Blade Knights, then their second effects are not applied because for each one, you have another monster on the field besides the Blade Knight.
●If Blade Knight destroys a Flip Effect Monster like Slate Warrior, even that monster’s non-Flip effects are negated. So in this case, Slate Warrior does not reduce the ATK and DEF of the Blade Knight that destroyed it, because Blade Knight negates its effect.
●If Blade Knight destroys The Immortal of Thunder, its effect is negated. If your opponent had already gained the 3000 Life Points, then your opponent does not lose the 5000 Life Points. If Blade Knight attacked The Immortal of Thunder while it was face-down, your opponent neither gains nor loses Life Points from The Immortal of Thunder’s effect.
●If Blade Knight destroys Spear Cretin, Spear Cretin’s effect is not applied.
●The effect of a Flip Effect monster destroyed by Blade Knight is negated while the destroyed card is in the GY. If the monster is Set again on the field, then the Flip Effect is activated when it’s flipped again.
●If Blade Knight attacks a face-down Attack Position Flip Effect Monster with equal ATK, and both monsters are destroyed, then Blade Knight’s effect is applied because it destroyed the monster, and the monster’s effect is n

## Blade Rabbit
[effect Level 2 EARTH Beast 400/300] formats: both
Text (Edison): When this card is changed from Attack Position to face-up Defense Position, destroy 1 monster on your opponent's side of the field.

## Bladefly
[effect Level 2 WIND Insect 600/700] formats: both
Text (Edison): As long as this card remains face-up on the field, increase the ATK of all WIND monsters by 500 points and decrease the ATK of all EARTH monsters by 400 points.

## Blasting the Ruins
[trap Normal] formats: both
Text (Edison): You can only activate this card if there are 30 or more cards in your GY. Inflict 3000 points of damage to your opponent's LP.
Goat text: You can only activate this card if there are 30 or more cards in your Graveyard. Inflict 3000 points of damage to your opponent's Life Points.
Edison rulings: ●Even if you activate Blasting the Ruins and an effect is chained that reduces your GY to less than 30 cards, Blasting the Ruins still resolves because the condition was correct at the time of activation.

## Blessings of the Nile
[spell Continuous] formats: both
Text (Edison): Each time card(s) are discarded from your hand to the GY by the effect of a card controlled by your opponent, increase your LP by 1000 points.
Goat text: Each time card(s) are discarded from your hand to the Graveyard by the effect of a card controlled by your opponent, increase your Life Points by 1000 points.

## Blind Destruction
[trap Continuous] formats: both
Text (Edison): Once per turn, during your Standby Phase: Roll a six-sided die. If the result is 1-5, destroy all monsters on the field with the same Level as the number rolled. If it is 6, destroy all Level 6 and higher monsters on the field.
Edison rulings: ●Rolling a die is not optional, you must roll one each of your Standby Phases. If you have two copies of Blind Destruction active on the field you roll two dice each of your Standby Phases.

## Blindly Loyal Goblin
[effect Level 4 EARTH Warrior 1800/1500] formats: both
Text (Edison): As long as this card remains face-up on the field, control of this card can't switch.
Goat text: As long as this card remains face-up on the field, control of this card cannot switch.
Edison rulings: ●If your opponent takes control of your Blindly Loyal Goblin with Change of Heart and flips it face-up, control of the monster does not return to you.
●If you Special Summon your opponent's Blindly Loyal Goblin with Monster Reborn, and Remove Brainwashing is activated, control of Blindly Loyal Goblin does not return to your opponent.
●Your opponent can't use Change of Heart, Snatch Steal, or Brain Control on your face-up Blindly Loyal Goblin.
●Neither player can activate Creature Swap if the only monster you control is Blindly Loyal Goblin. If you control Blindly Loyal Goblin and 1 other monster when Creature Swap is activated, you must select the other monster.
●If your opponent tries to use Change of Heart on your face-down Blindly Loyal Goblin, and you chain Ceasefire to flip it face-up, the effect of Change of Heart is negated.
●Your opponent can't target your Blindly Loyal Goblin with the effect of Relinquished or Thousand-Eyes Restrict.

## Block Attack
[spell Normal] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Target 1 Attack Position monster your opponent controls; change that target to face-up Defense Position.
Goat text: Target 1 face-up Attack Position monster your opponent controls; change that target to face-up Defense Position.

## Blowback Dragon
[effect Level 6 DARK Machine 2300/1200] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Once per turn: You can target 1 card your opponent controls; toss a coin 3 times and destroy that target if at least 2 of the results are heads.
Edison rulings: ●Blowback Dragon's effect does target. The target is the selected card.
●If your opponent uses Blowback Dragon on a Trap Card, you can use Fake Trap to save it.
●You select the target of Blowback Dragon's effect when you activate the effect, BEFORE flipping the coins.

## Boar Soldier
[effect Level 4 EARTH Beast-Warrior 2000/500] formats: both (Goat already has a goat-only script in js/cards/classic-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card is Normal Summoned, destroy this card. If your opponent controls 1 or more monsters, decrease the ATK of this card by 1000 points.

## Bombardment Beetle
[effect Flip Effect Level 2 WIND Insect 400/900] formats: both
Text (Edison): FLIP: Pick up and see 1 face-down Defense Position Monster Card on your opponent's side of the field. If it is an Effect Monster, destroy it (its Flip Effect is not activated), and if the card is not, return it to its original position.

## Bottomless Shifting Sand
[trap Continuous] formats: both
Text (Edison): At the end of your opponent's turn, destroy the face-up monster(s) with the highest ATK on the field. During your own Standby Phase, if you have 4 or less cards in your hand, this card is destroyed.
Edison rulings: ●If there are multiple monsters tied for the highest ATK, they are all destroyed.
●If Bottomless Shifting Sand is active and Tyrant Dragon is the monster with the highest ATK, Tyrant Dragon is destroyed because Bottomless Shifting Sand does not target a monster.

## Bowganian
[effect Level 3 DARK Machine 1300/1000] formats: both
Text (Edison): Once per turn, during your Standby Phase: Inflict 600 damage to your opponent.
Edison rulings: ●You can use Barrel Behind the Door against Bowganian's effect.
●Bowganian's effect is a Trigger Effect.

## Bubonic Vermin
[effect Flip Effect Level 3 EARTH Beast 900/600] formats: both
Text (Edison): FLIP: You can Special Summon 1 "Bubonic Vermin" from your Deck in face-down Defense Position. Then shuffle your Deck.

## Buster Blader
[effect Level 7 EARTH Warrior 2600/2300] formats: both (Goat already has a goat-only script in js/cards/goat-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Gains 500 ATK for each Dragon monster your opponent controls or is in their GY.

## Buster Rancher
[spell Equip] formats: both
Text (Edison): Only a monster with an ATK of 1000 points or less can be equipped with this card. During damage calculation, increase the ATK of the monster equipped with this card by 2500 points if the opponent's monster that battles it is in Attack Position and its ATK is 2500 or more, OR if the opponent's monster that battles it is in Defense Position and its DEF is 2500 or more.
Edison rulings: ●If the equipped monster’s ATK is raised above 1000 points, by any effect other than Buster Rancher’s own effect, Buster Rancher is destroyed.
●You can equip 2 copies of Buster Rancher to the same monster but because of Buster Rancher’s effect, when you increase the ATK by 1 Buster Rancher effect, the other Buster Rancher is destroyed.
●If Injection Fairy Lily is equipped with Buster Rancher, and you use her effect to increase her ATK, Buster Rancher is destroyed. If Injection Fairy Lily battles a monster equipped with Buster Rancher, and her effect is used to increase her ATK, then Buster Rancher’s effect activates and increases the ATK of the other monster.

## Byser Shock
[effect Level 5 DARK Fiend 800/600] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): If this card is Summoned: Return all Set cards on the field to the hand.
Edison rulings: ●You can chain against the effect of Byser Shock.
●A Trap Card like Ceasefire that is chained to the activation of Byser Shock’s effect is not returned to the hand.

## Cannon Soldier
[effect Level 4 DARK Machine 1400/1300] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): You can Tribute 1 monster; inflict 500 damage to your opponent.

## Cannonball Spear Shellfish
[effect Level 2 WATER Aqua 1000/1000] formats: both
Text (Edison): While "Umi" is face-up on the field, this card is unaffected by any Spell Cards.

## Cat's Ear Tribe
[effect Level 1 EARTH Beast-Warrior 200/100] formats: both
Text (Edison): The original ATK of your opponent's monster(s) that battles with this card during his/her turn becomes 200 points during the Damage Step.

## Catapult Turtle
[effect Level 5 WATER Aqua 1000/2000] formats: both (Goat already has a goat-only script in js/cards/goat-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① You can Tribute 1 monster; Your opponent takes damage equal to half of its ATK on the field.
Edison rulings: ● You can use this effect multiple times per turn.

## Catnipped Kitty
[effect Level 2 EARTH Beast 0/500] formats: both
Text (Edison): This card can't be attacked if there is another Beast monster on your side of the field. Once per turn, you can make the DEF of 1 monster on your opponent's side of the field 0 until the end of this turn.
Goat text: This card cannot be attacked if there is another Beast-Type monster on your side of the field. Once per turn, you can make the DEF of 1 monster on your opponent's side of the field 0 until the end of this turn.
Edison rulings: ●The first effect of “Catnipped Kitty” is a Continuous Effect and the second is an Ignition Effect.
●You can't target a face-down monster with the effect of “Catnipped Kitty”.
●If you control 2 copies of “Catnipped Kitty” on the field, and no other monsters, your opponent can't attack, except with monsters that have an effect which allows them to attack directly.

## Cave Dragon
[effect Level 4 WIND Dragon 2000/100] formats: both
Text (Edison): Cannot be Normal Summoned while you control a monster. This card can't declare an attack unless you control another Dragon monster.
Goat text: Cannot be Normal Summoned while you control a monster. This card cannot declare an attack unless you control another Dragon-Type monster.
Edison rulings: ●If you have 2 copies of Cave Dragon on the field, they can both attack.
●You can still Set, Flip Summon, and Special Summon Cave Dragon if there is another monster on your side of the field.

## Ceasefire
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① If a Set monster or Effect Monster is on the field: 
Change all face-down Defense Position monsters on the field to face-up Defense Position, 
(Flip effects aren't activated), also your opponent takes 500 damage for each Effect Monster on the field.
Rulings: 1. "Ceasefire" can be activated if there is at least 1 face-down Defense Position monster and/or at least 1 face-up Effect Monster.
2. Monsters flipped by "Ceasefire" are not Flip Summoned, so the effect of "Mysterious Puppeteer" does not activate.
3. If you chain "Ceasefire" to the Flip Effect of a monster, the Flip Effect is not negated.
4. If "Jinzo" is flipped by "Ceasefire", the damage from the effect of "Ceasefire" is still inflicted.
5. Monster Tokens and monsters being treated as Equip Cards are not counted as Effect Monsters.

## Cemetary Bomb
[trap Normal] formats: both
Text (Edison): Inflict 100 damage to your opponent for each card in their GY.
Goat text: Inflict 100 damage to your opponent for each card in their Graveyard.
Rulings: 1. The damage inflicted by "Cemetery Bomb" is based on the number of cards in the GY when "Cemetery Bomb" resolves, not when it activates.

## Centrifugal Field
[spell Field] formats: both
Text (Edison): When a Fusion Monster(s) is destroyed by a card effect and sent to the GY: Its owner targets 1 Fusion Material Monster in their GY that is listed on that Fusion Monster; that player Special Summons that target.
Goat text: When a Fusion Monster(s) is destroyed by a card effect and sent to the Graveyard: Its owner targets 1 Fusion Material Monster in their Graveyard that is listed on that Fusion Monster; that player Special Summons that target.
Edison rulings: ●Only the owner of the Fusion Monster that was destroyed and sent to the GY by a card effect can Special Summon a Fusion Material Monster written on the Fusion Monster Card. However, this effect can be used by both players (when their Fusion Monsters are destroyed and sent to the GY by a card effect).
●If both players have Fusion Monsters destroyed and sent to the GY by card effects at the same time, each of them can Special Summon a Fusion Material Monster. However, when multiple Fusion Monsters controlled by the same player are destroyed and sent to the GY by a card effect, that player can only select and Special Summon 1 Fusion Material Monster.
●Unlike “De-Fusion”, the Fusion Material Monsters Special Summoned with “Centrifugal Field” don't have to have been used to Fusion Summon the Fusion Monster. In fact, that Fusion Monster does not have to have been properly Fusion Summoned at all (it could have been Special Summoned with “Magical Scientist” or “Summoner of Illusions” instead).
●Substitute Fusion Material Monsters like “King of the Swamp” Cannot be Special Summoned with “Centrifugal Field” because they are not written on the Fusion Monster Card. However, if they were used as substitutes to Fusion Summon the Fusion Monster, you can still use “Centrifugal Field” to Special Summon the other Fusion Material monster from the Fusion Summon.
●You can chain to the activation of the effect of “Centrifugal Field”.

## Ceremonial Bell
[effect Level 3 LIGHT Spellcaster 0/1850] formats: both
Text (Edison): Both players must keep their hands revealed.

## Cestus of Dagla
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Equip only to a Fairy monster. It gains 500 ATK. If it inflicts battle damage to your opponent: Gain LP equal to the damage inflicted.
Goat text: Equip only to a Fairy-Type monster. It gains 500 ATK. If it inflicts battle damage to your opponent: Gain LP equal to the damage inflicted.
Edison rulings: ●When Airknight Parshath equipped with Cestus of Dagla inflicts damage to your opponent's Life Points, the simultaneous effects go on a chain, so the controller decides which effect is resolved first.
●If you have multiple copies of Cestus of Dagla equipped to your monster, the effects accumulate.
●When your opponent takes control of your Fairy-Type monster equipped with your Cestus of Dagla, and your opponent uses the monster to damage your Life Points, neither player increases their Life Points. This is because the controller of Cestus of Dagla is still you, and Cestus of Dagla's effect only activates when the equipped monster inflicts damage to your opponent's Life Points. Likewise, if you equip Cestus of Dagla to your opponent's Fairy-Type monster, neither player will gain any Life Points from Cestus of Dagla.
