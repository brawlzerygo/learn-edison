# Full pool batch 11: 63 cards. Write js/cards/full-11.js (see build/CARD_SCRIPTS.md and the "Full pool" section there).

## Levia-Dragon - Daedalus
[effect Level 7 WATER Sea Serpent 2600/1500] formats: both
Text (Edison): You can send 1 face-up "Umi" you control to the GY; destroy all other cards on the field.
Edison rulings: ●You can send A Legendary Ocean to the GY to activate Levia-Dragon Daedalus' effect, but you can't send Maiden of the Aqua.
●You can't send a face-down Umi or A Legendary Ocean to activate Levia-Dragon Daedalus' effect.
●If you activate Levia-Dragon Daedalus' effect and your opponent chains Ring of Destruction to destroy Levia-Dragon Daedalus, Levia-Dragon Daedalus' effect still resolves even though it has been destroyed.
●If an effect is chained to “Levia-Dragon Daedalus'” effect to flip “Levia-Dragon Daedalus face-down, it is still not destroyed by its effect.

## Light Barrier
[spell Field] formats: edison
Text (Edison): During your Standby Phase, toss a coin. If the result is Tails, the following effects are negated until your next Standby Phase:
● When you Summon an "Arcana Force" monster, choose which effect to apply without tossing a coin. If an "Arcana Force" monster destroys an opponent's monster by battle, you gain LP equal to the destroyed monster's original ATK.
Edison rulings: ●Light Barrier's effect to flip a coin during the Standby Phase starts a Chain.
●The effect of the Summoned Arcana Force monster still starts a Chain, but you don't toss the coin. When the effect resolves you will select if the heads or tails effect is applied.
●If an Arcana Force monster's effect is chosen in this way, it can't be selected with Reversal of Fate or Arcana Call.
●Light Barrier's effect to gain Life Points starts a Chain when the opponent's monster is sent to the GY or Removed Zone at the end of the Damage Step.
●If your Arcana Force monster is also destroyed in the battle, Light Barrier's effect still activates.
●Only the controller of Light Barrier activates its effects.

## Light Effigy
[effect Level 4 LIGHT Fairy 1500/0] formats: edison
Text (Edison): If you Tribute Summon a LIGHT Normal Monster, you can treat this 1 monster as 2 Tributes.

## Light End Dragon
[synchro Synchro Level 8 LIGHT Dragon 2600/2100] formats: edison
Text (Edison): 1 Tuner + 1 or more non-Tuner LIGHTs
① If an attack is declared involving this monster: You can have this card lose 500 ATK/DEF, and if you do, this turn, the monster it is battling loses 1500 ATK/DEF.
Edison rulings: ● If this card can't lose 500 ATK and 500 DEF,  the other monster doesn't lose any ATK/DEF.
● This card's ATK/DEF loss is permanent (until this card is flipped face-down or leaves the field).

## Light Laser
[spell Equip] formats: edison
Text (Edison): Equip only to a LIGHT Warrior monster. Remove from play any monsters that battle with it at the end of Damage Step.

## Light of Intervention
[trap Continuous] formats: both (Goat already has a goat-only script in js/cards/goat-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): While this card is on the field, Monster Cards can't be Set or flipped face-down. If a Monster Card would be Set, it must be Normal Summoned in face-up Defense Position.
Goat text: While this card is on the field, Monster Cards cannot be Set or flipped face-down. If a Monster Card would be Set, it must be Normal Summoned in face-up Defense Position.
Edison rulings: ●You can activate (flip face-up) this card at any time; it does not need to be activated in response to a Summon.
●The effect of this card applies to both players, and does not affect monsters that are already on the field face-down. These monsters remain face-down until flipped face-up as normal.
●While this card is on the field, monsters can be Normal Summoned in face-up Defense Position, and can be the target of Trap Hole and will trigger effects like the effect of Mysterious Puppeteer.
●While this card is on the field, if a monster would be Special Summoned in face-down Defense Position (such as with Cyber Jar or Nimble Momonga), it is instead Special Summoned in face-up Defense Position.
●While this card is on the field you can't flip a monster face-down with Book of Moon, Darkness Approaches, etc.

## Light of Judgment
[trap Normal] formats: both
Text (Edison): If "The Sanctuary in the Sky" is on the field: Discard 1 LIGHT monster to the GY; apply 1 of the following effects.
● Look at your opponent's hand and discard 1 card from their hand.
● Send 1 card your opponent controls to the GY.
Edison rulings: ●Light of Judgment does NOT target. You select the card when Light of Judgment's effect resolves.
●You can look at your opponent's hand when you resolve Light of Judgment's effect.
●If your opponent chains Mystical Space Typhoon to Light of Judgment and destroys The Sanctuary in the Sky, the effect of Light of Judgment is still applied.

## Light of Redemption
[spell Normal] formats: edison
Text (Edison): Pay 800 LP, then target 1 of your banished LIGHT monsters; add that target to your hand.
Edison rulings: ●If a LIGHT monster is removed from play face-down by Different Dimension Capsule, etc., it can't be selected with Light of Redemption.
●If your opponent removes your LIGHT monster from play with Interdimensional Matter Transporter, you can select it with Light of Redemption.

## Light Spiral
[trap Continuous] formats: edison
Text (Edison): ① If a card(s) is sent from your Deck to the GY by the effect of a "Lightsworn" monster:
Banish the top card of your opponent's Deck.
Rulings: 1. The effect of "Light Spiral" starts a Chain.

## Machine Assembly Line
[spell Continuous] formats: edison
Text (Edison): All Machine monsters on the field gain 200 ATK. Each time a face-up Machine monster(s) on the field is destroyed by battle or card effect, place 2 Junk Counters on this card. You can send this card to the GY, then target 1 Machine monster in your GY whose Level is less than or equal to the number of Junk Counters that were on this card; Special Summon that target.
Edison rulings: ●The Continuous Effect applies to face-up Machine-Type monsters on BOTH sides of the field.
●The Continuous Effect does not start a Chain.
●Junk Counters are placed when an effect resolves destroying a Machine-Type monster(s), or during the Damage Step when a Machine-Type monster is destroyed by battle.
●If multiple Machine-Type monsters are destroyed at the same time, you only place 2 Junk Counters.
●A Machine-Type monster treated as an Equip Card is destroyed, don't place any Junk Counters.
●If a face-down Machine-Type monster is destroyed you don't place any Junk Counters.
●The Ignition Effect activates & resolves on the field.
●Sending this card to the GY is a cost to activate the effect to Special Summon.
●This effect targets a Machine-Type monster at activation.

## Machine Conversion Factory
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Equip only to a Machine monster. It gains 300 ATK/DEF.

## Machine King
[effect Level 6 EARTH Machine 2200/2000] formats: both (Goat already has a goat-only script in js/cards/classic-3.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): This card gains 100 ATK for each Machine monster on the field.
Goat text: This card gains 100 ATK for each Machine-Type monster on the field.

## Machine King Prototype
[effect Level 3 EARTH Machine 1600/1500] formats: edison
Text (Edison): This card gains 100 ATK and DEF for each Machine monster on the field, except this card.

## Machine Lord Ur
[effect Level 4 EARTH Machine 1600/1500] formats: edison
Text (Edison): This card can attack all monsters your opponent controls once each. If this card attacks or is attacked, your opponent takes no battle damage.

## Mad Archfiend
[effect Level 4 DARK Fiend 1800/0] formats: edison
Text (Edison): If this card attacks a Defense Position monster, inflict piercing battle damage to your opponent. If this Attack Position card is targeted for an attack: Change it to Defense Position.

## Mad Reloader
[effect Level 1 DARK Fiend 0/0] formats: edison
Text (Edison): ① If this card is destroyed by battle and sent to the GY: Send 2 cards from your hand to the GY, and if you do, draw 2 cards.
Edison rulings: ● This effect is mandatory (Unless an effect says "you can", it is a mandatory effect).
● If you can't send exactly 2 cards, you send none.
● If you don't send exactly 2 cards, you draw none.
● Sending and drawing is simultaneous. It doesn't cause anything to miss timing.
You can read more about Timing here:
https://edisonformat.net/rules/compendium/missing-the-timing

## Mad Sword Beast
[effect Level 4 EARTH Dinosaur 1400/1200] formats: both
Text (Edison): If this card attacks a Defense Position monster, inflict piercing battle damage.

## Magic Drain
[trap Counter] formats: both
Text (Edison): When your opponent activates a Spell Card: They can discard 1 Spell Card to negate this card's effect, otherwise negate the activation of their Spell Card, and if you do, destroy it.

## Magic Formula
[spell Equip] formats: edison
Text (Edison): Equip only to "Dark Magician" or "Dark Magician Girl". It gains 700 ATK. If this card is sent from the field to the GY: Gain 1000 LP.

## Magic Hole Golem
[effect Level 3 DARK Rock 0/2000] formats: edison
Text (Edison): Once per turn, you can select 1 face-up monster you control. Its ATK is halved until the End Phase, and it can attack your opponent directly this turn. During the turn you activate this effect, only the selected monster can attack.
Edison rulings: ●This effect targets 1 face-up monster you control.
●If you use “Shrink” on a monster whose ATK is halved by “Magic Hole Golem” the ATK becomes half of its original ATK. After “Shrink” is no longer applied, the ATK becomes the same as before “Magical Hole Golem” was activated.
●If you control 2 “Magic Hole Golems” and target different monsters with their effects, neither monster can attack.

## Magic Jammer
[trap Counter] formats: both (Goat already has a goat-only script in js/cards/goat-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): When a Spell Card is activated: Discard 1 card; negate the activation, and if you do, destroy it.

## Magic Reflector
[spell Normal] formats: both
Text (Edison): Target 1 face-up Spell Card you control; place 1 counter on it. If it would ever be destroyed, remove the counter instead.
Edison rulings: ●You can put 2 or more counters on a Spell Card if you activate 2 or more Magic Reflectors. When the Spell Card is destroyed, remove the counters on it 1-by-1.
●You can activate Magic Reflector and put a counter on a Monster Card equipped to Relinquished, and if the equipped card would be destroyed, remove 1 counter instead.
●If Imperial Order is active, and if a Spell Card with a counter on it would be destroyed, the counter is removed instead. Imperial Order does not negate the function of counters created by the effect of Magic Reflector.
●If a Spell Card with a maintenance cost has a counter on it, such as Messenger of Peace, and you choose not to pay the cost, the Spell Card is still destroyed.
●If a Field Spell Card has a counter on it and a player activates a new Field Spell Card, the Field Spell Card with the counter is still destroyed.
●If Swords of Revealing Light has a counter on it, it is still destroyed at the end of the opponent’s third turn after it was activated.
●If you use Magic Reflector to place a counter on a Union Monster that is an Equip Card, and the Union Monster would be destroyed instead of the equipped monster, remove the Magic Reflector counter from the Union Monster instead, and the Union Monster is not destroyed.

## Magical Arm Shield
[trap Normal] formats: edison
Text (Edison): When your opponent declares an attack while you control a monster: Target 1 face-up monster your opponent controls, except the attacking monster; take control of that target until the end of the Battle Phase, and if you do, it is attacked instead, and you proceed to damage calculation.

## Magical Blast
[spell Normal] formats: edison
Text (Edison): Inflict 200 damage to your opponent for each Spellcaster monster you control. During your Draw Phase, if this card is in your GY, before you draw: You can give up your normal draw this turn, and if you do, add this card to your hand.
Edison rulings: ●The number of Spellcaster-Type monsters is counted when “Magical Blast” resolves. If your opponent chains an effect to “Magical Blast” that destroys all of your Spellcasters, it still resolves but will do 0 damage.
●The effect of “Magical Blast” that activates in the Draw Phase can be chained to.
●If you have more than 1 “Magical Blast” in your GY during your Draw Phase, you can activate them both, but only 1 will resolve. The other will remain in GY. This forms a chain because they are activating simultaneously (at the specific point in time that you would otherwise draw). If you also have “Freed the Matchless General” on the field, you can only resolve either his effect or “Magical Blast’s” effect, but not both.
●If you can't draw a card, either because you have no cards in your Deck, of because of a card effect, then you can't activate the effect of “Magical Blast”.
●Note that the effect of “Hino-Kagu-Tsuchi” resolves before the Draw Phase, so you could activate the effect of “Magical Blast” after his effect resolves.

## Magical Citadel of Endymion
[spell Field] formats: edison
Text (Edison): ① Each time a Spell Card is activated, place 1 Spell Counter on this card when that Spell resolves.
② If a card with a Spell Counter(s) is destroyed, place its Spell Counters on this card.
③ Once per turn, if you would activate a card effect by removing a Spell Counter(s) from a card you control, you can remove that many Spell Counters from this card instead.
④ If this card would be destroyed by card effect, you can remove 1 Spell Counter from this card instead.
Edison rulings: ● All of this card's effects are continuous (Do not start a chain).

About the ① effect:
● If the activation of a Spell card is negated (e.g. by "Solemn Judgment" or "Gladiator Beast Heraklinos"), a Spell Counter will not be put on this card.
 If the effect of a Spell Card is negated (e.g. by "Royal Oppression" or "Imperial Order"), a Spell Counter is still added to this card)
● A Spell Counter will not be added to this card when a Spell effect is activated (e.g. "Blaze Acellerator" or "Miracle Fertilizer"), only when the Spell card itself is activated (place on the field).

About the ② effect:
● A Spell Counter will be put on this card even if an opponent's card with Spell Counters is destroyed.

About the ③ effect:
● You may only apply this effect for effects that remove Spell Counters as a cost to activate that effect (e.g. "Dark Valkyria", "Breaker the Magical Warrior", "Royal Magical Library", etc). It cannot be applied for effects that remove a Spell Counter (e.g. "Mythical Beast Cerberus").
● If your card with an effect that removes Spell Counters for cost has no Spell Counters on it (e.g. "Breaker the Magical Warrior"), you can still activate the effect, removing a Spell Counter from this card.

About the ④ effect:
● This effect can only be applied if this card would be destroyed by card effect. It cannot be applied if your opponent activates a Field Spell.

## Magical Dimension
[spell Quick-Play] formats: edison
Text (Edison): If you control a Spellcaster monster: Target 1 monster you control; tribute that target, and if you do, Special Summon 1 Spellcaster from your hand, then you can destroy 1 monster on the field.
Edison rulings: ●Tributing a monster for “Magical Dimension” is not a cost; it’s part of the effect and happens when the effect resolves. If the effect of “Magical Dimension” is negated then you don't Tribute a monster.
●You don’t have to destroy a monster when using “Magical Dimension”; it’s optional. If you do choose to destroy a monster, then it’s resolved at the same time as the rest of “Magical Dimension’s” effect.
●Because you select which monster to destroy when “Magical Dimension” resolves, (not when it’s activated) “Magical Dimension” does not target.
●You can't activate “Magical Dimension” unless you have a Spellcaster-Type monster in your hand that can be Special Summoned with its effect.
●If your opponent activates “Magical Dimension” and chooses not to destroy a monster on the field, then you can activate “Torrential Tribute” or “Bottomless Trap Hole” to destroy the Special Summoned Spellcaster. If your opponent does decide to destroy a monster, then you can't activate these cards because the last thing to happen was not a monster being Summoned. So you have missed the timing.
●You only need a Spellcaster-Type monster on the field when you activate “Magical Dimension”, not when it resolves. If your opponent chains an effect to destroy your Spellcasters, or flip them face-down, “Magical Dimension” still resolves as normal. Also note that you can Tribute your only Spellcaster for “Magical Dimension’s” effect and the rest of “Magical Dimension” will still resolve properly.
●You can

## Magical Exemplar
[effect Level 4 EARTH Spellcaster 1700/1400] formats: edison
Text (Edison): ① Each time a Spell Card is activated, place 2 Spell Counters on this card when it resolves. 
② Once per turn: You can remove any number of Spell Counters from this card; Special Summon 1 Spellcaster from your hand/GY whose Level is equal to the number of Spell Counters you removed.

## Magical Explosion
[trap Normal] formats: edison
Text (Edison): ① If you have no cards in your hand: Inflict 200 damage to your opponent for each Spell Card in your GY.
Edison rulings: ● Count the number of Spells at this card's resolution.

## Magical Hats
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): During your opponent's Battle Phase: Choose 2 Spell/Trap Cards from your Deck and 1 monster in your Main Monster Zone. Special Summon them as Normal Monsters (ATK 0/DEF 0) in face-down Defense Position, Set the chosen monster if it is face-up, and shuffle them on the field. The 2 cards chosen from your Deck are destroyed at the end of the Battle Phase, and can't remain on the field except during this Battle Phase.
Goat text: During your opponent's Battle Phase: Choose 2 Spell/Trap Cards from your Deck and 1 monster in your Main Monster Zone. Special Summon them as Normal Monsters (ATK 0/DEF 0) in face-down Defense Position, Set the chosen monster if it is face-up, and shuffle them on the field. The 2 cards chosen from your Deck are destroyed at the end of the Battle Phase, and cannot remain on the field except during this Battle Phase.
Edison rulings: Activate only during your opponent's Battle Phase. 
●This card can't be activated unless you can Special Summon both cards. You can't activate this card while a Barrier Statue monster restricts you to Summoning monsters of a specific Attribute.
●This card can activate in the Start Step (before Attack declaration), the Battle Step before [but not during] the Damage Step, and the End Step (before Main Phase 2) of your opponent's Battle Phase.
●The effect Special Summons 2 non-Monster Cards (they are revealed to the opponent).
●The Special Summoned Cards don't HAVE Levels, Attributes, or Types.
●The cards are Special Summoned face-down, even if Gozen Match / Rivalry of Warlords applies.
●If the Special Summoned cards have Trigger Effects that activate when destroyed (ex: Black Pendant, Geartown, Supervise), they can trigger when destroyed by battle. Cards like Statue of the Wicked & Dark Coffin must be destroyed while face-down (by card effect) in order to activate, they don't activate if flipped by an attack and destroyed by battle.
●If Light of Intervention is active, the cards are placed in face-up Defense Position.
●If Gravekeeper's Servant is Summoned and Necrovalley is active, it gains 500 ATK and DEF.
●After Special Summoning non-Monster Cards, if this effect would flip a Trap Monster (ex: Zoma the Spirit) face-down, it returns to the Spell / Trap Card Zone and is not shuffled face-down with the Special Summoned non-Monster Cards. Once Set, it can't activate that turn.
●T

## Magical Labyrinth
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): ① Equip only to "Labyrinth Wall".
①You can Tribute the equipped monster; Special Summon "Wall Shadow" from your Deck.
Edison rulings: You cannot activate the effect to Summon if "Wall Shadow" is not in your Deck.

## Magical Mallet
[spell Normal] formats: edison
Text (Edison): ① Shuffle any number of cards from your hand into the Deck, then draw that same number of cards.
Edison rulings: "Any number" cannot be 0. You cannot activate this card if there are no cards in your hand.

## Magical Marionette
[effect Level 5 DARK Spellcaster 2000/1000] formats: both (Goat already has a goat-only script in js/cards/goat-2.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Each time a Spell Card is activated, place 1 Spell Counter on this card when that Spell Card resolves. This card gains 200 ATK for each Spell Counter on it. You can remove 2 Spell Counters from this card, then target 1 monster on the field; destroy that target.
Edison rulings: ●There is no limit to the number of Spell Counters you can have on Magical Marionette.
●Removing Spell Counters from Magical Marionette to use its effect is a cost.
●You can use Magical Marionette's effect multiple times in the same turn, as long as you have enough Spell Counters to pay the cost.
●You can destroy Magical Marionette with its own effect.
●You place a Spell Counter on this card when the Spell Card resolves, so if Magic Jammer is used to negate the Spell Card's activation then you don't place a Spell Counter on this monster. But if Imperial Order is chained to the Spell Card, you still place a Spell Counter on this monster because the activation of the Spell Card was not negated. If the Spell Card was a Continuous, Equip, or Field Spell Card, and “Dust Tornado” is chained to its activation and destroys it before it resolves you still place a Spell Counter because the activation of the card was not negated.
●If you activate a Spell Card, and your opponent chains Call of the Haunted to Special Summon Magical Marionette, Magical Marionette does not get a Spell Counter for that Spell Card because Magical Marionette must be face-up on the field when the Spell Card is activated and when it resolves in order to get a Spell Counter.

## Magical Plant Mandragola
[effect Flip Effect Level 2 DARK Spellcaster 500/200] formats: both
Text (Edison): FLIP: Place 1 Spell Counter on each face-up card on the field that you can place a Spell Counter on.
Edison rulings: ●"Each face-up card" includes your opponent's cards.

## Magical Reflect Slime
[effect Effect Gemini Level 3 WATER Aqua 700/1200] formats: edison
Text (Edison): This card is treated as a Normal Monster while face-up on the field or in the GY. While this card is face-up on the field, you can Normal Summon it to have it be treated as an Effect Monster with this effect:
● Your opponent takes all Battle Damage that you would have taken from a battle involving this card.
Edison rulings: These rulings apply to all Gemini Monsters: https://edisonformat.net/rules/compendium/gemini-monsters

## Magical Scientist
[effect Level 1 DARK Spellcaster 300/300] formats: both
Text (Edison): Pay 1000 LP to Special Summon 1 level 6 or lower Fusion Monster from your Extra Deck in face-up Attack or Defense Position. That Fusion Monster can't attack your opponent's LP directly, and is returned to your Extra Deck at the end of the turn.
Goat text: Pay 1000 Life Points to Special Summon 1 level 6 or lower Fusion Monster from your Extra Deck in face-up Attack or Defense Position. That Fusion Monster cannot attack your opponent's Life Points directly, and is returned to your Extra Deck at the end of the turn.
Edison rulings: ●You can use Magical Scientist's effect multiple times in the same turn.
●Magical Scientist's effect does not target.
●If the Fusion Monster is flipped face-down with Book of Moon, or removed from play with Dimensionhole or Interdimensional Matter Transporter or Different Dimension Gate, the effect is reset and the Fusion Monster does not go back to the Extra Deck, and is not prohibited from attacking your opponent's Life Points directly.
●If you Special Summon Reaper on the Nightmare with Magical Scientist, it can't attack your opponent's Life Points directly (but can attack a monster).
●You can't activate Secret Pass to the Treasures targeting a Fusion Monster Special Summoned with Magical Scientist because it can't attack your opponent's Life Points directly that turn.
●If Skill Drain is activated after a Fusion Monster is Special Summoned with Magical Scientist, the effect of Magical Scientist (that makes the Fusion Monster unable to attack directly and have to go back to the Extra Deck) has been applied already, and is not negated, so the Special Summoned Fusion Monster still can't attack directly and must go back to the Extra Deck.
●If Jowgen the Spiritualist is on the field, you can't activate the effect of Magical Scientist (so you can't even pay the cost to try and activate Last Turn, for example).

## Magical Thorn
[trap Continuous] formats: both
Text (Edison): ① If a card(s) is discarded from your opponent's hand and sent to the GY, inflict 500 damage to them for each.
Goat text: When your opponent's card(s) in their hand are discarded to the Graveyard, inflict 500 points of damage to their Life Points for each card that was discarded.
Edison rulings: ●This is a continuous effect.
●The effect of Magical Thorn is applied when the opponent discards during the End Phase to make their hand size 6, discarding for the cost of cards such as Tribute to the Doomed, Cost Down, or Judgment of Anubis, and discarding for card effects such as Delinquent Duo, Confiscation, Robbin’ Goblin, Morphing Jar and Mefist the Infernal General.
●The effect of Magical Thorn is NOT applied when you send cards from your hand to the GY for things such as a Tribute for a Ritual Spell Card, a Fusion Material Monster, or the effects of cards like Chosen One or Gravekeeper’s Watcher.
●The effect of Magical Thorn is NOT applied when cards in your hand are destroyed by Chain Destruction or when cards are sent from the Deck to GY by the effect of Painful Choice. It is also NOT applied when cards in your hand are removed from play by the effect of Lightforce Sword.
●The effect of Magical Thorn is only applied when a card is discarded from your opponent’s hand to your opponent’s GY. So if they have your card in your hand by the effect of Exchange or Graverobber and they discard it, they don't take any damage from the effect of Magical Thorn.
●If the opponent discards from their hand as a cost to activate a card like Cost Down and you chain Magical Thorn they won't take any damage. If your opponent activates a card where discarding is part of the effect of the card, such as Card Destruction, and you chain Magical Thorn, they WILL take damage because the effect o

## Malevolent Catastrophe
[trap Normal] formats: edison
Text (Edison): When an opponent's monster declares an attack: Destroy all Spell and Trap Cards on the field.

## Malevolent Nuzzler
[spell Equip] formats: both
Text (Edison): The equipped monster gains 700 ATK. When this card is sent from the field to the GY: You can pay 500 LP; place this card on the top of your Deck.
Goat text: The equipped monster gains 700 ATK. When this card is sent from the field to the Graveyard: You can pay 500 LP; place this card on the top of your Deck.
Edison rulings: ●If a Sangan or a Witch of the Black Forest equipped with Malevolent Nuzzler is Tributed and you activate the effect of Malevolent Nuzzler, Malevolent Nuzzler goes on top of your Deck and then Sangan or Witch of the Black Forest is resolved. If Sangan is destroyed (not Tributed) the effects of Sangan and Malevolent Nuzzler are simultaneous and form a chain.

## Malice Ascendant
[effect Level 4 DARK Zombie 700/1000] formats: edison
Text (Edison): During your opponent's Standby Phase, send 1 card from the top of their Deck to the GY for each "Malice Ascendant" in your GY.
Edison rulings: ●The number of “Malice Ascendants” in your GY is counted at the resolution of its effect. If your opponent chains “Disappear” to remove 1, then it is no longer counted for the effect of your “Malice Ascendant” on the field.

## Malice Dispersion
[spell Quick-Play] formats: both
Text (Edison): Discard 1 card from your hand. Destroy all face-up Continuous Trap Cards.

## Malice Doll of Demise
[effect Level 4 DARK Fiend 1600/1700] formats: both
Text (Edison): During your next Standby Phase after this card was sent from the field to the GY by the effect of a Continuous Spell Card: Special Summon this card from the GY.
Goat text: During your next Standby Phase after this card was sent from the field to the Graveyard by the effect of a Continuous Spell Card: Special Summon this card from the Graveyard.
Edison rulings: ●If your opponent takes control of your Malice Doll of Demise, and sends it to the GY by the effect of a Continuous Spell Card, you can still activate its effect to Special Summon it during your Standby Phase.
●If Malice Doll of Demise is Tributed to activate the effect of Mass Driver, then Malice Doll of Demise’s effect does not activate because the Tribute is treated as a cost, not an effect.
●Examples of Continuous Spell Cards that would send Malice Doll of Demise from the field to the GY by their effect include Ectoplasmer and Continuous Destruction Punch.
●You can only activate the Special Summoning effect of “Malice Doll of Demise” during your first Standby Phase after it was sent to the GY by the effect of a Continuous Spell Card. If you miss that, you can't then activate the Special Summoning effect later on. If there is no monster card zone at the appropriate time, the effect is activated but you can't Special Summon the “Malice Doll of Demise”, so its effect disappears.
●The effect of Malice Doll of Demise activates in the GY. If The End of Anubis is on the field during the Standby Phase in which Malice Doll of Demise would activate its effect, then the effect is negated and Malice Doll of Demise is not Special Summoned. If The End of Anubis leaves play after that, you still can't activate Malice Doll of Demise’s effect because the opportunity has passed.

## Mask of Brutality
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): The equipped monster gains 1000 ATK and loses 1000 DEF. During each of your Standby Phases, pay 1000 LP or destroy this card.
Edison rulings: ●The payment of 1000 Life Points is optional and the controller of Mask of Brutality, not the controller of the equipped monster, chooses to pay or not. If you choose not to pay 1000 Life Points, Mask of Brutality is destroyed.

## Mask of Darkness
[effect Flip Effect Level 2 DARK Fiend 900/400] formats: both (Goat already has a goat-only script in js/cards/goat-5.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): FLIP: Target 1 Trap in your GY; add that target to your hand.

## Mask of Dispel
[spell Continuous] formats: both (Goat already has a goat-only script in js/cards/classic-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Select 1 face-up Spell Card on the field. The controller of the Spell Card takes 500 points of damage during each of your Standby Phases. When the selected card is removed from the field, destroy this card.

## Mask of the Accursed
[spell Equip] formats: both (Goat already has a goat-only script in js/cards/classic-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): The equipped monster can't attack. Once per turn, during your Standby Phase: Inflict 500 damage to the controller of the equipped monster.
Goat text: The equipped monster cannot attack. Once per turn, during your Standby Phase: Inflict 500 damage to the controller of the equipped monster.

## Mask of Weakness
[trap Normal] formats: both (Goat already has a goat-only script in js/cards/classic-1.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): Target 1 attacking monster; that target loses 700 ATK until the end of this turn.

## Masked Beast Des Gardius
[effect Level 8 DARK Fiend 3300/2500] formats: edison
Text (Edison): This card Cannot be Normal Summoned or Set. This card Cannot be Special Summoned except by Tributing 2 monsters, including at least 1 "Grand Tiki Elder" or "Melchid the Four-Face Beast". When this card is sent from the field to the GY, equip 1 "The Mask of Remnants" from your Deck to 1 monster on the field.

## Masked Chopper
[effect Level 1 EARTH Fiend 100/100] formats: edison
Text (Edison): ① If this card destroys an opponent's monster by battle: Your opponent takes 2000 damage.
Edison rulings: ● This effect does not specify “and sends it to the GY”. It triggers at the end of the Damage Step, even if destroyed after Damage Calculation (either by battle or by effect), as long as it destroyed a monster by battle.

## Masked Dragon
[effect Level 3 FIRE Dragon 1400/1100] formats: both
Text (Edison): ① If destroyed by battle and sent to the GY:
You can Special Summon 1 Dragon with 1500 or less ATK from your Deck.
Goat text: When this card is destroyed by battle and sent to the Graveyard: You can Special Summon 1 Dragon-Type monster with 1500 or less ATK from your Deck.
Edison rulings: ● This effect activates in the Damage Step, so it can never be negated by "Royal Oppression". 
Cards like "Bottomless Trap Hole" and "Torrential Tribute" can never be used in response to this Summon.

## Masked Sorcerer
[effect Level 4 DARK Spellcaster 900/1400] formats: both
Text (Edison): When this card inflicts Battle Damage to your opponent's LP, draw 1 card from your Deck.
Goat text: When this card inflicts Battle Damage to your opponent's Life Points, draw 1 card from your Deck.
Edison rulings: ●The effect of Masked Sorcerer includes Battle Damage caused when it is attacked in Defense Position by a monster with ATK lower than Masked Sorcerer’s DEF.

## Master Gig
[effect Level 8 EARTH Psychic 2600/1400] formats: edison
Text (Edison): Once per turn, you can pay 1000 LP to destroy monsters your opponent controls equal to the number of face-up Psychic monsters you control.
Edison rulings: ●Paying 1000 Life Points is a cost to activate “Master Gig’s” effect. This effect does not target.
●You determine the number of destroyed monsters based on the number of face-up Psychic monsters you control when this effect resolves.
●If the number of monsters controlled by the opponent is less than the number of face-up Psychic monsters you control, you can't activate “Master Gig’s” effect. If the effect has already been activated and you control more Psychic-Type monsters than your opponent has monsters when the effect resolves, you can't destroy any of the opponent’s monsters.

## Master Monk
[effect Level 5 EARTH Rock 1900/1000] formats: both
Text (Edison): © Cannot be Normal Summoned/Set. 
© Must be Special Summoned (from your hand) by tributing 1 "Monk Fighter".
① Can attack twice per turn.
Goat text: This card cannot be Normal Summoned or Set. This card cannot be Special Summoned except by Tributing 1 "Monk Fighter". This card can attack twice during the same turn.
Edison rulings: ● The only way you can Special Summon this card is via its own procedure.
Even if it was initially summoned that way, you still can't summon it with card effects.

## Master of Oz
[fusion Fusion Level 9 EARTH Beast 4200/3700] formats: both (Goat already has a goat-only script in js/cards/goat-4.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Big Koala" + "Des Kangaroo"

## Metal Detector
[trap Normal] formats: both
Text (Edison): You can only activate this card when a Continuous Trap Card is activated. Negate all Continuous Trap Cards during the turn this card is activated.

## Metal Dragon
[fusion Fusion Level 6 WIND Machine 1850/1700] formats: both (Goat already has a goat-only script in js/cards/goat-7.js: port it as the shared script, adjusted to the Edison text)
Text (Edison): "Steel Ogre Grotto 1" + "Lesser Dragon"
Goat text: "Steel Ogre Grotto #1" + "Lesser Dragon"

## Metal Shooter
[effect Level 5 LIGHT Machine 800/800] formats: edison
Text (Edison): When this card is Normal Summoned, place 2 counters on it. This card gains 800 ATK for each of these counters on it. If this card would be destroyed by a card effect, remove 1 of this card's counters instead.

## Metallizing Parasite - Lunatite
[effect Effect Union Level 7 WATER Aqua 1000/500] formats: both
Text (Edison): Once per turn, during your Main Phase, if you control this monster on the field, you can equip it to a face-up monster on your side of the field as an Equip Spell Card, OR unequip the Union equipment and Special Summon this card in Attack Position. While equipped to a monster by this card's effect, that monster will be unaffected by the effects of Spell Cards controlled by your opponent. (1 monster can only be equipped with 1 Union Monster at a time. If the monster that this card is equipped to is destroyed as a result of battle, destroy this card instead.)
Goat text: Once per turn, during your Main Phase, if you control this monster on the field, you can equip it to a face-up monster on your side of the field as an Equip Spell Card, OR unequip the Union equipment and Special Summon this card in face-up Attack Position. While equipped to a monster by this card's effect, that monster will be unaffected by the effects of Spell Cards controlled by your opponent. (1 monster can only be equipped with 1 Union Monster at a time. If the monster that this card is equipped to is destroyed as a result of battle, destroy this card instead.)
Edison rulings: These rulings apply to all Union Monsters: https://edisonformat.net/rules/compendium/union-monsters

## Mind Haxorz
[trap Normal] formats: both
Text (Edison): Pay 500 LP. Look at your opponent's hand and all Set cards on their side of the field.
Goat text: Pay 500 Life Points. Look at your opponent's hand and all Set cards on their side of the field.

## Mind Master
[effect Effect Tuner Level 1 LIGHT Psychic 100/200 Tuner] formats: edison
Text (Edison): ① You can pay 800 LP, and Tribute 1 Psychic (except "Mind Master"); Special Summon 1 Level 4 or lower Psychic from your Deck in Attack Position.
Rulings: 1. Paying 800 Life Points and Tributing 1 other Psychic-Type monster is a cost.
2. You can activate this effect multiple times during the same turn if you can continue to pay the cost.
3. The effect of "Mind Master" cannot be activated if you do not have any Level 4 or lower Psychic-Type Monsters in your Deck that you can Special Summon.

## Mind on Air
[effect Level 6 DARK Spellcaster 1000/1600] formats: both
Text (Edison): ① Your opponent must play with their hand revealed.
Edison rulings: ●Mind on Air’s effect is continuous, so if you Summon Mind on Air and your opponent responds with Trap Hole, your opponent must show their hand until Mind on Air is no longer on the field (after Trap Hole resolves).
●If Mind on Air is causing your opponent’s hand to be revealed, and an effect that randomly selects a card is activated (like Robbin’ Goblin), your opponent shuffles their hand and you must choose randomly without seeing the fronts of the cards.

## Mind Over Matter
[trap Counter] formats: edison
Text (Edison): When a monster would be Normal or Special Summoned, OR a Spell/Trap Card is activated: Tribute 1 Psychic monster; negate the Summon or activation, and if you do, destroy that card.
Edison rulings: ●You can Tribute a face-down Psychic-Type monster you control.

## Mind Trust
[spell Normal] formats: edison
Text (Edison): Tribute 1 Level 2 or higher monster. Add 1 Tuner Monster from your GY to your hand whose Level is less than or equal to half of the Tributed monster's.
Edison rulings: ●You can Tribute a face-down monster to pay the cost of “Mind Trust.” This effect targets 1 Tuner in your GY.
●Calculate the appropriate Level based on the Tributed monster’s Level as it was on the field.
●Round down. If you Tribute a Level 5 monster (for example) you can add a Level 1 or 2 Tuner to your hand, but not a Level 3.

## Mind Wipe
[spell Quick-Play] formats: both
Text (Edison): Activate only if your opponent has 3 or less cards in their hand. Your opponent adds their hand to the Deck and shuffles it, then draws the same number of cards they added to the Deck.
