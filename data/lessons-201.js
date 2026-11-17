/* Edison 201 lessons (10-16), written from the site's card data, rulings and deck lists. */
window.EDISON_LESSONS_201=function(h){const {cn,call}=h;return [

{n:10,title:'The Big Synchros, Part 1',sub:'Levels 4 to 6: the Synchros you make with small monsters.',min:5,
cards:['Armory Arm','Ally of Justice Catastor','Magical Android','Goyo Guardian','Brionac, Dragon of the Ice Barrier','Flamvell Uruquizas'],
html:`
<div class="goals"><h4>What you will learn</h4><ul><li>What the Level 4, 5 and 6 Synchros in most Extra Decks do</li><li>Which problem each one solves</li><li>The rulings that trip people up</li></ul></div>
<h2>Why these cards matter</h2>
<p>In Lesson 3 you met the Extra Deck "toolbox." Now you learn what each tool does. This lesson covers the smaller ones, Levels 4 to 6. Lesson 11 covers Levels 7 to 9.</p>
<p>Small Synchros matter because they are easy to make. A Level 2 Tuner plus a Level 3 or 4 monster is enough. You will see them in game after game.</p>
<p>The numbers below come from the 55 decks on this site. They count a card if a deck runs it anywhere: Main, Extra or Side Deck.</p>
<div class="tbl-wrap"><table><thead><tr><th>Card</th><th>Level</th><th>ATK</th><th>In decks</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Armory Arm')}</td><td>4</td><td>1800</td><td>56%</td><td>Turns into an Equip that adds 1000 ATK and burns.</td></tr>
<tr><td>${cn('Ally of Justice Catastor')}</td><td>5</td><td>2200</td><td>87%</td><td>Destroys any non-DARK monster it battles.</td></tr>
<tr><td>${cn('Magical Android')}</td><td>5</td><td>2400</td><td>67%</td><td>A big body that gains you LP each End Phase.</td></tr>
<tr><td>${cn('Goyo Guardian')}</td><td>6</td><td>2800</td><td>84%</td><td>Steals the monsters it destroys in battle.</td></tr>
<tr><td>${cn('Brionac, Dragon of the Ice Barrier')}</td><td>6</td><td>2300</td><td>89%</td><td>Discard cards to bounce cards back to the hand.</td></tr>
</tbody></table></div>
<h2>Level 4 and 5: Armory Arm, Catastor, Magical Android</h2>
<h3>Armory Arm</h3>
<p>${cn('Armory Arm')} is a Synchro that can become an Equip Card. Once per turn, you pick one of two things:</p>
<ul><li><b>Equip it</b> to a monster on the field. That monster gains 1000 ATK.</li><li><b>Unequip it</b> and Special Summon it in Attack Position.</li></ul>
<p>While it is equipped, it has one more trick. If the equipped monster destroys a monster in battle and sends it to the Graveyard, your opponent takes damage equal to that monster's ATK.</p>
<p>It can even go on your opponent's monster. If that monster then destroys yours in battle, your opponent takes the damage. Armory Arm is still your card.</p>
<h3>Ally of Justice Catastor</h3>
<p>${cn('Ally of Justice Catastor')} is in 87% of the decks on this site. Its effect is simple. At the start of the Damage Step, if it battles a monster that is not DARK, that monster is destroyed. ATK does not matter.</p>
<p>It works when Catastor attacks and when it is attacked. It does nothing against DARK monsters, so those just battle it normally.</p>
${call('mistake','The face-down trap',`<p>The start of the Damage Step happens <b>before</b> a Set monster is flipped face-up. So if Catastor attacks a face-down monster, its effect does not activate. It only sees face-up monsters.</p>`)}
<h3>Magical Android</h3>
<p>${cn('Magical Android')} has 2400 ATK, the highest of the Level 5s here. During your End Phase, you gain 600 LP for each Psychic monster you control. Android is a Psychic itself, so it always gives you at least 600.</p>
<p>Catastor and Android are both Level 5. Catastor is the answer to a strong non-DARK monster. Android is the bigger body when there is nothing special to answer.</p>
<h2>Level 6: Goyo Guardian and Brionac</h2>
<h3>Goyo Guardian</h3>
<p>${cn('Goyo Guardian')} has 2800 ATK. When it destroys a monster in battle and sends it to the Graveyard, you can Special Summon that monster to <b>your</b> field in Defense Position.</p>
<p>So every battle it wins takes a monster away from your opponent and gives it to you. That new monster can then be Synchro Material for your next play.</p>
${call('rule','Edison text',`<p>Modern Goyo needs an EARTH Tuner. In Edison, <b>any Tuner</b> works. It is Limited, so you get one copy. See <a href="#lesson-7">Lesson 7</a> and the <a href="#errata">errata list</a>.</p>`)}
<p>The effect needs the monster to go to the Graveyard, and Goyo must still be face-up when it triggers. If the destroyed monster is banished instead, nothing happens.</p>
<h3>Brionac, Dragon of the Ice Barrier</h3>
<p>${cn('Brionac, Dragon of the Ice Barrier')} is in 89% of the decks here. Discard any number of cards, then target that many cards on the field. They go back to the hand.</p>
<p>In Edison, you can use it as many times per turn as you can pay. You can target cards on either field. That makes it flexible:</p>
<ul><li>Bounce your opponent's Set card before you attack.</li><li>Bounce an opponent's Synchro. It goes back to their Extra Deck, not their hand.</li><li>Bounce your own card to save it or reuse it.</li></ul>
${call('analogy','Think of it like this','<p>Brionac turns cards in your hand into removal. Each card you discard is one card you take off the field. You choose how much to spend.</p>')}
<p>Brionac is Limited. The discard is a cost, so it happens even if the effect is stopped.</p>
<h3>One more you will see</h3>
<p>${cn('Flamvell Uruquizas')} is a Level 6 in 22% of the decks. It deals piercing damage, and it gains 300 ATK each time it deals battle damage to your opponent.</p>
${call('mistake','Common beginner mistakes',`<ul><li>Using Catastor's effect on a face-down monster. It does not trigger.</li><li>Using Brionac only once per turn because of the modern text.</li><li>Thinking a bounced Synchro goes to the hand. It goes to the Extra Deck.</li></ul>`)}
<div class="recap"><h2>Recap</h2><ul><li>Armory Arm equips for +1000 ATK and burns for the ATK of what it destroys.</li><li>Catastor destroys any face-up non-DARK monster it battles.</li><li>Magical Android is a 2400 body that gains LP.</li><li>Goyo Guardian takes the monsters it destroys in battle. Any Tuner works in Edison.</li><li>Brionac bounces one card per discard, as often as you like.</li></ul></div>
<p class="soon">Next: <a href="#lesson-11">Lesson 11</a>, the Level 7 to 9 Synchros.</p>`,
flash:[
["Catastor attacks a face-down monster. Does its effect destroy it?","No. The effect checks at the start of the Damage Step, before the Set monster is flipped face-up."],
["Your opponent controls a face-up 2500 ATK LIGHT monster. Which Level 5 Synchro beats it in battle?","Ally of Justice Catastor. It destroys any non-DARK monster it battles, whatever its ATK."],
["Goyo Guardian destroys your opponent's monster in battle. What happens?","If the monster goes to the Graveyard, you can Special Summon it to your field in Defense Position."],
["You discard 2 cards to Brionac. What do you get?","You target 2 cards on the field and return them to the hand. In Edison you can do it again the same turn."],
["Brionac bounces your opponent's Black Rose Dragon. Where does it go?","Back to their Extra Deck."],
["Can Armory Arm be equipped to your opponent's monster?","Yes. If that monster then destroys yours in battle, your opponent takes the damage."]
]},

{n:11,title:'The Big Synchros, Part 2',sub:'Levels 7 to 9: the Synchros that end turns and win games.',min:5,
cards:['Black Rose Dragon','Ancient Fairy Dragon','Stardust Dragon','Thought Ruler Archfiend','Colossal Fighter','Red Dragon Archfiend','Dark End Dragon','Mist Wurm'],
html:`
<div class="goals"><h4>What you will learn</h4><ul><li>What the Level 7, 8 and 9 Synchros do</li><li>Why Stardust Dragon is in every deck on this site</li><li>How to pick the right big Synchro for the moment</li></ul></div>
<h2>Level 7: Black Rose and Ancient Fairy</h2>
<h3>Black Rose Dragon</h3>
<p>You met ${cn('Black Rose Dragon')} in Lesson 2. When it is Synchro Summoned, you can destroy <b>every card on the field</b>. Yours too. It is Limited, and it is in 89% of the decks here.</p>
<p>The effect is optional. You use it when your opponent has more on the field than you do. If you are ahead, you can skip it and just keep a 2400 ATK monster.</p>
<p>It has a second effect: banish a Plant from your Graveyard to turn one of your opponent's Defense Position monsters to Attack Position with 0 ATK until the End Phase. Plant decks use this. Most decks only care about the first effect.</p>
<h3>Ancient Fairy Dragon</h3>
<p>${cn('Ancient Fairy Dragon')} has 2100 ATK and 3000 DEF. Once per turn, it can Special Summon a Level 4 or lower monster from your hand. You cannot conduct your Battle Phase that turn.</p>
<p>That extra monster can be Synchro Material. Its other effect destroys a Field Spell, gains you 1000 LP, and lets you add a Field Spell from your Deck. It is in 42% of the decks.</p>
<h2>Level 8: the big four</h2>
<h3>Stardust Dragon</h3>
<p>${cn('Stardust Dragon')} is in <b>every one</b> of the 55 decks on this site. It is a shield for your whole field.</p>
<ol class="steps">
<li><div>Your opponent activates a card or effect that would destroy a card on the field.</div></li>
<li><div>You Tribute Stardust Dragon. That activation is negated and destroyed.</div></li>
<li><div>In the End Phase, Stardust comes back from your Graveyard.</div></li>
</ol>
<p>It stops cards like Black Rose Dragon, Heavy Storm, Mirror Force, Bottomless Trap Hole and Dark Armed Dragon's effect. It only works on things that would surely destroy a card.</p>
${call('key','The big idea','<p>Stardust Dragon does not stop removal that does not destroy. Bouncing, banishing without destroying, or sending to the Graveyard all get past it.</p>')}
<h3>Thought Ruler Archfiend</h3>
<p>${cn('Thought Ruler Archfiend')} has 2700 ATK. When it destroys a monster in battle and sends it to the Graveyard, you gain LP equal to that monster's original ATK.</p>
<p>It also protects itself. It is a Psychic. When a Spell or Trap targets exactly one Psychic, you can pay 1000 LP to negate it. That covers cards like Book of Moon, Brain Control and Dimensional Prison aimed at it. It only negates cards, not monster effects.</p>
<h3>Colossal Fighter</h3>
<p>${cn('Colossal Fighter')} starts at 2800 ATK. It gains 100 ATK for each Warrior in <b>both</b> Graveyards. When it is destroyed in battle, you can Special Summon a Warrior from either Graveyard. It can even bring back itself.</p>
<h3>Red Dragon Archfiend</h3>
<p>${cn('Red Dragon Archfiend')} has 3000 ATK. When it attacks a Defense Position monster, after damage, all of your opponent's Defense Position monsters are destroyed.</p>
<p>The cost: in your End Phase, your other monsters that did not attack this turn are destroyed. Plan around that before you summon it.</p>
<h3>One more Level 8</h3>
<p>${cn('Dark End Dragon')} is in 51% of the decks. It needs non-Tuner DARK monsters as material. Once per turn, it loses 500 ATK and DEF to send one of your opponent's monsters to the Graveyard. That is not destruction, so Stardust Dragon cannot stop it.</p>
<h2>Level 9: Mist Wurm</h2>
<p>${cn('Mist Wurm')} needs a Tuner plus <b>two or more</b> non-Tuners. When it is Synchro Summoned, it returns 1 to 3 of your opponent's cards to the hand. This effect must be used, and it targets.</p>
<p>Three cards at once can clear Set Traps right before you attack. Bounced Synchros go back to the Extra Deck.</p>
<h2>Picking the right one</h2>
<p>Most Extra Decks hold several of these. Pick by the problem in front of you.</p>
<div class="tbl-wrap"><table><thead><tr><th>Problem</th><th>Card</th><th>Description</th></tr></thead><tbody>
<tr><td>They have more cards out</td><td>${cn('Black Rose Dragon')}</td><td>Wipe the whole field, then rebuild first.</td></tr>
<tr><td>You fear removal</td><td>${cn('Stardust Dragon')}</td><td>Stops one destroy effect, then returns.</td></tr>
<tr><td>A wall of defenders</td><td>${cn('Red Dragon Archfiend')}</td><td>One attack on a defender clears all of them.</td></tr>
<tr><td>Set cards in the way</td><td>${cn('Mist Wurm')}</td><td>Bounces up to three cards on summon.</td></tr>
<tr><td>One strong monster</td><td>${cn('Dark End Dragon')}</td><td>Sends it to the Graveyard, past Stardust.</td></tr>
<tr><td>You need a big attacker</td><td>${cn('Colossal Fighter')}</td><td>2800 or more, and it brings back a Warrior.</td></tr>
</tbody></table></div>
${call('mistake','Common beginner mistakes',`<ul><li>Using Stardust against a bounce or a banish that does not destroy. It cannot.</li><li>Summoning Red Dragon Archfiend and forgetting your other monsters. Those that did not attack are destroyed.</li><li>Trying to make Mist Wurm with one non-Tuner. It needs two or more.</li></ul>`)}
<div class="recap"><h2>Recap</h2><ul><li>Black Rose Dragon can wipe the field when Synchro Summoned.</li><li>Stardust Dragon stops one destroy effect and comes back in the End Phase. It is in every deck on this site.</li><li>Thought Ruler, Colossal Fighter and Red Dragon Archfiend are big attackers with extra jobs.</li><li>Dark End Dragon sends to the Graveyard, which Stardust cannot stop.</li><li>Mist Wurm bounces up to three cards and needs two non-Tuners.</li></ul></div>`,
flash:[
["Your opponent activates Heavy Storm. You control Stardust Dragon. What can you do?","Tribute Stardust to negate and destroy Heavy Storm. Stardust comes back from your Graveyard in the End Phase."],
["Your opponent uses Dark End Dragon on your Stardust Dragon. Can Stardust stop it?","No. Dark End Dragon sends to the Graveyard. It does not destroy, so Stardust's effect does not apply."],
["You are ahead on the field. Do you have to use Black Rose Dragon's wipe?","No. The effect is optional."],
["You summon Red Dragon Archfiend and attack with it only. What happens to your other monsters in the End Phase?","They are destroyed, because they did not declare an attack."],
["What materials does Mist Wurm need?","1 Tuner plus 2 or more non-Tuners, adding up to Level 9."],
["Your opponent targets Thought Ruler Archfiend with Book of Moon. What can you do?","Pay 1000 LP to negate and destroy Book of Moon, because it targets exactly one Psychic."]
]},

{n:12,title:'Common Tuners',sub:'The small monsters that make Synchros possible, and how each one reaches the field.',min:4,
cards:['Plaguespreader Zombie','Blackwing - Gale the Whirlwind','Deep Sea Diva','Debris Dragon','Junk Synchron','Blackwing - Vayu the Emblem of Honor','Krebons'],
html:`
<div class="goals"><h4>What you will learn</h4><ul><li>Why Tuners change from deck to deck</li><li>The Tuners you will meet most often</li><li>How to do the Level math with common monsters</li></ul></div>
<h2>Tuners are personal</h2>
<p>The big Synchros are the same in almost every deck. Tuners are not. Each deck picks Tuners that fit its own monsters.</p>
<p>Only one Tuner is a staple by this site's rule (in 25% or more of the decks): ${cn('Plaguespreader Zombie')}, in 35%. Every other Tuner shows up in fewer decks. And 11 of the 55 decks run no Tuner in the Main Deck at all.</p>
${call('analogy','Think of it like this','<p>The Synchros are a shared toolbox. The Tuner is the key that opens it. Every deck cuts its own key.</p>')}
<p>When you meet a new Tuner, ask two questions:</p>
<ol class="steps"><li><div><b>How does it get to the field?</b> A Tuner that brings a second monster with it saves you a card.</div></li><li><div><b>What is its Level?</b> Add it to the monsters next to it. That tells you which Synchros are possible.</div></li></ol>
<h2>Plaguespreader Zombie</h2>
<p>${cn('Plaguespreader Zombie')} is a Level 2 DARK Zombie Tuner. It is Limited. Its effect works from the Graveyard:</p>
<ul><li>Put 1 card from your hand on top of your Deck.</li><li>Special Summon Plaguespreader from your Graveyard.</li><li>If it leaves the field after that, it is banished.</li></ul>
<p>So you can Normal Summon it and use it as Synchro Material. It goes to the Graveyard. Later you bring it back with its own effect and use it again. The second time, it is banished.</p>
<p>The effect is not once per turn. And because it does not use your Normal Summon, you can Normal Summon another monster in the same turn.</p>
<h2>Other Tuners you will meet</h2>
<div class="tbl-wrap"><table><thead><tr><th>Tuner</th><th>Level</th><th>In decks</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Plaguespreader Zombie')}</td><td>2</td><td>35%</td><td>Comes back from the Graveyard for a card from your hand.</td></tr>
<tr><td>${cn('Blackwing - Gale the Whirlwind')}</td><td>3</td><td>18%</td><td>Free summon next to a Blackwing. Halves a monster's ATK and DEF.</td></tr>
<tr><td>${cn('Deep Sea Diva')}</td><td>2</td><td>13%</td><td>When Normal Summoned, calls a Level 3 or lower Sea Serpent from the Deck.</td></tr>
<tr><td>${cn('Debris Dragon')}</td><td>4</td><td>11%</td><td>When Normal Summoned, revives a 500 ATK or lower monster.</td></tr>
<tr><td>${cn('Junk Synchron')}</td><td>3</td><td>5%</td><td>When Normal Summoned, revives a Level 2 or lower monster.</td></tr>
<tr><td>${cn('Krebons')}</td><td>2</td><td>5%</td><td>Pay 800 LP to stop an attack on it.</td></tr>
</tbody></table></div>
<p>Look at the pattern. ${cn('Deep Sea Diva')}, ${cn('Debris Dragon')} and ${cn('Junk Synchron')} each bring a second monster with them. One card from your hand becomes two monsters, a full Synchro recipe.</p>
<p>${cn('Blackwing - Gale the Whirlwind')} is Limited and lives in Blackwing decks, like the <a href="#deck-Blackwing">Blackwing</a> list.</p>
<h3>Tuners with rules attached</h3>
<ul><li>${cn('Debris Dragon')} can only be material for a <b>Dragon</b> Synchro, and the other materials cannot be Level 4. Debris (4) plus a Level 3 makes 7, enough for Black Rose Dragon.</li><li>The monster revived by Debris Dragon or Junk Synchron has its effects negated.</li><li>${cn('Blackwing - Vayu the Emblem of Honor')} is a Tuner that <b>cannot</b> be Synchro Material. From the Graveyard, it banishes itself and a Blackwing to summon a Blackwing Synchro. That Synchro was not Synchro Summoned, so it cannot be revived later.</li></ul>
<h2>The Level math with common monsters</h2>
<p>Most Tuners are Level 2 or 3. Here is what a Level 2 Tuner makes with monsters from <a href="#lesson-13">Lesson 13</a>:</p>
<div class="tbl-wrap"><table><thead><tr><th>Level 2 Tuner plus</th><th>Total</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Sangan')} (3)</td><td>5</td><td>Catastor or Magical Android</td></tr>
<tr><td>${cn('Fossil Dyna Pachycephalo')} (4)</td><td>6</td><td>Goyo Guardian or Brionac</td></tr>
<tr><td>${cn('Cyber Dragon')} (5)</td><td>7</td><td>Black Rose Dragon or Ancient Fairy Dragon</td></tr>
<tr><td>${cn('Caius the Shadow Monarch')} (6)</td><td>8</td><td>Stardust Dragon and the other Level 8s</td></tr>
</tbody></table></div>
<p>Add 1 to every total for a Level 3 Tuner. The habit to build: see a Tuner, add the Levels, name the Synchro.</p>
${call('mistake','Common beginner mistakes',`<ul><li>Bringing back Plaguespreader and forgetting it is banished when it leaves the field.</li><li>Using Debris Dragon for a non-Dragon Synchro, or with a Level 4 partner.</li><li>Expecting a monster revived by Junk Synchron to use its effect. Its effects are negated.</li></ul>`)}
<div class="recap"><h2>Recap</h2><ul><li>Synchros are shared. Tuners change with each deck.</li><li>Plaguespreader Zombie is the one staple Tuner. It comes back from the Graveyard, then is banished when it leaves.</li><li>The best Tuners bring a second monster with them.</li><li>Debris Dragon and Vayu have rules attached. Read them.</li><li>See a Tuner, add the Levels, name the Synchro.</li></ul></div>`,
flash:[
["You use Plaguespreader Zombie's effect. What do you pay, and what is the catch?","You put a card from your hand on top of your Deck. If Plaguespreader leaves the field after that, it is banished."],
["Why are Tuners like Deep Sea Diva and Junk Synchron valuable?","One Normal Summon gives you two monsters, which is a full Synchro recipe from one card."],
["Can you use Debris Dragon and a Level 4 monster to make a Level 8 Synchro?","No. The other materials for Debris Dragon cannot be Level 4, and the Synchro must be a Dragon."],
["You control a Level 3 Tuner and Cyber Dragon. What Level can you make?","Level 8 (3 + 5), like Stardust Dragon."],
["Can Blackwing - Vayu the Emblem of Honor be Synchro Material?","No. It summons a Blackwing Synchro from the Graveyard instead, and that Synchro cannot be revived later."],
["Junk Synchron revives a monster. Can that monster use its effect?","No. Its effects are negated while it stays on the field."]
]},

{n:13,title:'Staple Monsters',sub:'The Main Deck monsters you will see in game after game.',min:4,
cards:['Cyber Dragon','Chimeratech Fortress Dragon','D.D. Crow','Sangan','Caius the Shadow Monarch','Gorz the Emissary of Darkness','Tragoedia','Fossil Dyna Pachycephalo','Ryko, Lightsworn Hunter'],
html:`
<div class="goals"><h4>What you will learn</h4><ul><li>The staple monsters and what each one does</li><li>Which ones come out for free, which ones trade, and which ones stop plays</li><li>The rulings that matter most</li></ul></div>
<h2>Monsters that come out for free</h2>
<p>These monsters reach the field without your Normal Summon. That leaves your Normal Summon for a Tuner.</p>
<h3>Cyber Dragon</h3>
<p>${cn('Cyber Dragon')} is in 76% of the decks on this site. If only your opponent controls a monster, you can Special Summon it from your hand. It is a Level 5 with 2100 ATK. It is Semi-Limited.</p>
<p>It is also the key to ${cn('Chimeratech Fortress Dragon')} (89% of decks). Send Cyber Dragon plus any Machines from <b>either</b> field to the Graveyard. Its ATK is 1000 for each material. Catastor and Armory Arm are Machines, so your opponent's Synchros can become your material.</p>
<h3>Gorz the Emissary of Darkness</h3>
<p>${cn('Gorz the Emissary of Darkness')} (47%, Limited) waits in your hand. When you take damage from your opponent's card <b>while you control no cards</b>, you can Special Summon it.</p>
<ul><li>Battle damage: you also get a token with ATK and DEF equal to the damage.</li><li>Effect damage: your opponent takes the same damage.</li></ul>
<p>So an empty field is a risk for your opponent. A direct attack can give you a 2700 ATK monster and a token.</p>
<h3>Tragoedia</h3>
<p>${cn('Tragoedia')} (24% of decks, just under the staple line, Limited) also waits in your hand. When you take battle damage, you can Special Summon it. It gains 600 ATK and DEF for each card in your hand. Once per turn, it can also send a monster from your hand to the Graveyard to take control of your opponent's face-up monster with the same Level.</p>
${call('rule','Two rulings',`<ul><li>You can only activate one of these hand effects per chain. You cannot summon Gorz and Tragoedia off the same damage.</li><li>Tragoedia's ATK is "?" in the Deck, so ${cn('Sangan')} cannot search it.</li></ul>`)}
<h2>Monsters that trade</h2>
<p>These monsters give you something when they go. You lose the monster, but you do not lose the card.</p>
<h3>Sangan</h3>
<p>${cn('Sangan')} (33%, Limited): when it goes from the field to the Graveyard, add a monster with 1500 or less ATK from your Deck to your hand. In Edison, you can use that monster's effects the same turn. Sangan is also a Level 3, so it makes good Synchro Material: you get a Synchro and a search.</p>
<h3>Ryko, Lightsworn Hunter</h3>
<p>${cn('Ryko, Lightsworn Hunter')} (35%) is a Flip monster. When flipped, you can destroy one card on the field. Then you always send the top 3 cards of your Deck to the Graveyard. Destroying is optional; the 3 cards always go.</p>
<h3>Caius the Shadow Monarch</h3>
<p>${cn('Caius the Shadow Monarch')} (40%) is a Level 6, so it needs one Tribute. When Tribute Summoned, it banishes one card on the field. If that card was a DARK monster, its controller also takes 1000 damage. Banishing gets past Stardust Dragon, which only stops destruction.</p>
<p>Cards that stop Tributes, like Mask of Restrict, stop Caius. So does Pulling the Rug (<a href="#lesson-15">Lesson 15</a>).</p>
<h2>Monsters that stop plays</h2>
<h3>D.D. Crow</h3>
<p>${cn('D.D. Crow')} (64%) works from your hand at any time. Discard it to banish one card from your opponent's Graveyard. Use it on:</p>
<ul><li>A ${cn('Plaguespreader Zombie')} that wants to come back.</li><li>The target of Call of the Haunted or Pot of Avarice.</li><li>A DARK monster, when your opponent needs DARKs in the Graveyard.</li></ul>
<h3>Fossil Dyna Pachycephalo</h3>
<p>${cn('Fossil Dyna Pachycephalo')} (36%) is a Flip monster. When flipped face-up, it destroys every Special Summoned monster on the field. While it stays face-up, <b>neither player</b> can Special Summon. That means no Synchros for either side.</p>
${call('key','The big idea','<p>Fossil Dyna turns off Synchros entirely. If your deck relies on Normal Summons and your opponent relies on Synchros, it hurts them more than you.</p>')}
<h2>Others you will see</h2>
<div class="tbl-wrap"><table><thead><tr><th>Card</th><th>In decks</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Dark Armed Dragon')}</td><td>25%</td><td>Summoned with exactly 3 DARKs in your Graveyard. Banishes DARKs to destroy cards.</td></tr>
<tr><td>${cn('Card Trooper')}</td><td>22%</td><td>Mills 1 to 3 for +500 ATK each. Draws a card when destroyed.</td></tr>
<tr><td>${cn('Super-Nimble Mega Hamster')}</td><td>22%</td><td>When flipped, Sets a Level 3 or lower Beast from the Deck, like Ryko.</td></tr>
<tr><td>${cn('Spirit Reaper')}</td><td>15%</td><td>Cannot be destroyed by battle. Destroyed when an effect targets it.</td></tr>
</tbody></table></div>
${call('mistake','Common beginner mistakes',`<ul><li>Activating Gorz while you still control a card. You must control none.</li><li>Leaving Plaguespreader in your Graveyard when your opponent might hold D.D. Crow.</li><li>Trying to Synchro Summon while Fossil Dyna is face-up. Nobody can Special Summon.</li></ul>`)}
<div class="recap"><h2>Recap</h2><ul><li>Cyber Dragon, Gorz and Tragoedia come out without your Normal Summon.</li><li>Chimeratech Fortress Dragon uses Machines from either field.</li><li>Sangan, Ryko and Caius trade one card for value.</li><li>D.D. Crow attacks the Graveyard. Fossil Dyna stops all Special Summons.</li></ul></div>`,
flash:[
["Your opponent attacks you directly while you control no cards. You have Gorz in hand. What happens?","You can Special Summon Gorz, plus a token whose ATK and DEF equal the battle damage you took."],
["Can Sangan search Tragoedia?","No. Tragoedia's ATK is \"?\" in the Deck, so it does not count as 1500 or less."],
["Why can Caius remove a Stardust Dragon when most removal cannot?","Caius banishes. Stardust only stops effects that destroy."],
["Fossil Dyna Pachycephalo is face-up. Can either player Synchro Summon?","No. A Synchro Summon is a Special Summon, and neither player can Special Summon."],
["You hold D.D. Crow. Your opponent has Plaguespreader Zombie in the Graveyard. Why use Crow now?","Banishing Plaguespreader stops it from coming back as a Tuner."],
["You control Cyber Dragon. Your opponent controls Ally of Justice Catastor. Can you make Chimeratech Fortress Dragon?","Yes. Catastor is a Machine, and the materials can come from either field. It would have 2000 ATK."]
]},

{n:14,title:'Staple Spells',sub:'Removal, stealing and drawing: the Spells most decks run.',min:4,
cards:['Mystical Space Typhoon','Heavy Storm','Brain Control','Book of Moon','Mind Control','Allure of Darkness','Nobleman of Crossout','Pot of Avarice','Smashing Ground'],
html:`
<div class="goals"><h4>What you will learn</h4><ul><li>The staple Spells and their jobs</li><li>How Edison text changes Brain Control</li><li>How the less common Spells fit in</li></ul></div>
<h2>Removing Spells and Traps</h2>
<p>Lesson 4 showed how Set cards stop Synchros. These Spells clear the way.</p>
<div class="tbl-wrap"><table><thead><tr><th>Card</th><th>Status</th><th>In decks</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Mystical Space Typhoon')}</td><td>Limited</td><td>98%</td><td>Quick-Play. Destroy one Spell or Trap.</td></tr>
<tr><td>${cn('Heavy Storm')}</td><td>Limited</td><td>85%</td><td>Destroy every Spell and Trap on the field, yours too.</td></tr>
<tr><td>${cn('Giant Trunade')}</td><td>Limited</td><td>24%</td><td>Return every Spell and Trap on the field to the hand.</td></tr>
</tbody></table></div>
<p>${cn('Mystical Space Typhoon')} is in 98% of the decks on this site. It is a Quick-Play, so you can Set it and use it on your opponent's turn. It cannot target itself.</p>
<p>${cn('Heavy Storm')} hits both sides. Play it when your opponent has more Set cards than you. You cannot activate it if there are no other Spells or Traps on the field.</p>
<h2>Taking monsters</h2>
<h3>Brain Control</h3>
<p>${cn('Brain Control')} (67%, Limited): pay 800 LP and take one of your opponent's face-up monsters until the End Phase.</p>
${call('rule','Edison text',`<p>Modern Brain Control can only take monsters that can be Normal Summoned. In Edison, it can take <b>any</b> face-up monster, Synchros included. See the <a href="#errata">errata list</a>.</p>`)}
<p>What you do with the borrowed monster matters most. You can attack with it. You can also use it as Synchro Material or Tribute it. Either way it goes to your opponent's Graveyard, because cards go to their owner's Graveyard. They do not get it back.</p>
<h3>Mind Control</h3>
<p>${cn('Mind Control')} (31%, Limited) also takes a monster until the End Phase. It costs no LP and can take a face-down monster too. But the monster cannot attack or be Tributed.</p>
<p>Synchro Material is not a Tribute. So a face-up monster taken this way can still become part of your Synchro.</p>
${call('analogy','Think of it like this',"<p>Brain Control and Mind Control are a borrowed ingredient. You take your opponent's monster, put it in your recipe, and it never goes home.</p>")}
<h2>Removing monsters</h2>
<h3>Book of Moon</h3>
<p>${cn('Book of Moon')} (44%) is a Quick-Play that flips a face-up monster face-down. It is unlimited. Some uses:</p>
<ul><li>Stop an attack, or stop a monster's effect that needs it face-up.</li><li>Flip your own Ryko or Fossil Dyna face-down, so you can flip it again on a later turn.</li><li>Clear effects that stay on a monster. A Plaguespreader flipped face-down loses its "banish it if it leaves" rule.</li></ul>
<h3>Nobleman of Crossout</h3>
<p>${cn('Nobleman of Crossout')} (25%) destroys and banishes one Set monster. If it was a Flip monster, each player also banishes every copy of it from their Main Deck. That is strong against Ryko, Fossil Dyna and Super-Nimble Mega Hamster.</p>
<h3>Less common removal</h3>
<p>${cn('Lightning Vortex')} (22%) lets you discard one card to destroy all your opponent's face-up monsters. ${cn('Smashing Ground')} (13%) destroys your opponent's face-up monster with the highest DEF.</p>
<h2>Drawing and searching</h2>
<div class="tbl-wrap"><table><thead><tr><th>Card</th><th>In decks</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Allure of Darkness')}</td><td>31%</td><td>Draw 2, then banish a DARK from your hand. No DARK? Lose your hand.</td></tr>
<tr><td>${cn('Reinforcement of the Army')}</td><td>31%</td><td>Add a Level 4 or lower Warrior from your Deck, like Junk Synchron.</td></tr>
<tr><td>${cn('Pot of Avarice')}</td><td>18%</td><td>Shuffle 5 monsters from your Graveyard into the Deck, then draw 2.</td></tr>
<tr><td>${cn('Gold Sarcophagus')}</td><td>18%</td><td>Banish any card from your Deck. It joins your hand two turns later.</td></tr>
</tbody></table></div>
<p>${cn('Pot of Avarice')} is allowed at 3. Any Synchros you shuffle back go to your Extra Deck, ready to summon again. All 5 must go back, or none do and you draw nothing.</p>
${call('mistake','Common beginner mistakes',`<ul><li>Playing Heavy Storm when you have more Set cards than your opponent.</li><li>Thinking a Brain Controlled Synchro goes to your Graveyard. It goes to its owner's.</li><li>Playing Allure of Darkness with no DARK in hand. You must send your whole hand to the Graveyard.</li></ul>`)}
<div class="recap"><h2>Recap</h2><ul><li>MST, Heavy Storm and Giant Trunade clear Set cards before you commit.</li><li>Brain Control can take any face-up monster in Edison, Synchros included.</li><li>A borrowed monster used as material goes to its owner's Graveyard for good.</li><li>Book of Moon and Nobleman handle monsters without a fight.</li><li>Allure, Reinforcement and Pot of Avarice keep your hand full.</li></ul></div>`,
flash:[
["Can Brain Control take a Synchro Monster in Edison?","Yes. Edison Brain Control can take any face-up monster your opponent controls."],
["You Brain Control a monster and use it as Synchro Material. Where does it go?","To your opponent's Graveyard, its owner's. They do not get it back on the field."],
["Mind Control says the monster cannot be Tributed. Can you use it as Synchro Material?","Yes, if it is face-up. Synchro Material is not a Tribute."],
["When is Heavy Storm a bad play?","When you have more Spells and Traps on the field than your opponent. It destroys yours too."],
["Nobleman of Crossout destroys a Set Ryko. What else happens?","Ryko is a Flip monster, so each player banishes every copy of Ryko from their Main Deck."],
["You resolve Pot of Avarice and shuffle Stardust Dragon back. Where does it go?","To your Extra Deck."]
]},

{n:15,title:'Staple Traps',sub:'The Set cards that stop attacks, summons and big effects.',min:4,
cards:['Mirror Force','Solemn Judgment','Bottomless Trap Hole','Torrential Tribute','Dimensional Prison','Starlight Road','Royal Oppression','Pulling the Rug','Dust Tornado'],
html:`
<div class="goals"><h4>What you will learn</h4><ul><li>The staple Traps, sorted by what they stop</li><li>How Starlight Road and Royal Oppression change a game</li><li>Which Traps answer which plays</li></ul></div>
<h2>Traps that stop attacks</h2>
<p>These go off when your opponent's monster declares an attack.</p>
<div class="tbl-wrap"><table><thead><tr><th>Card</th><th>In decks</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Mirror Force')}</td><td>78%</td><td>Destroy all of the attacker's Attack Position monsters. Limited.</td></tr>
<tr><td>${cn('Dimensional Prison')}</td><td>56%</td><td>Banish the attacking monster. Unlimited.</td></tr>
</tbody></table></div>
<p>${cn('Dimensional Prison')} banishes, so a Synchro hit by it does not go back to the Extra Deck. If the attack is negated or the attacker changes position first, it is no longer attacking and Prison does nothing.</p>
<h2>Traps that stop summons</h2>
<div class="tbl-wrap"><table><thead><tr><th>Card</th><th>In decks</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Solemn Judgment')}</td><td>73%</td><td>Pay half your LP to negate a summon or a Spell/Trap. Counter Trap.</td></tr>
<tr><td>${cn('Bottomless Trap Hole')}</td><td>65%</td><td>Destroy and banish monsters with 1500+ ATK when summoned.</td></tr>
<tr><td>${cn('Torrential Tribute')}</td><td>65%</td><td>When a monster is summoned, destroy every monster on the field.</td></tr>
</tbody></table></div>
<p>You studied these in Lesson 4. Two rulings to add:</p>
<ul><li>${cn('Solemn Judgment')} cannot negate monster effects that start a Chain, even ones that summon. It cannot stop Gorz.</li><li>${cn('Bottomless Trap Hole')} destroys, so Stardust Dragon can stop it.</li></ul>
<h2>Traps that stop big effects</h2>
<h3>Starlight Road</h3>
<p>${cn('Starlight Road')} (49%) answers cards that would destroy <b>two or more</b> of your cards: Heavy Storm, Torrential Tribute, Mirror Force, Black Rose Dragon. It negates that card and destroys it. Then you can Special Summon ${cn('Stardust Dragon')} from your Extra Deck.</p>
<p>It must be chained right to the card that would destroy your cards, and it must be certain that two or more would be destroyed.</p>
<h3>Royal Oppression</h3>
<p>${cn('Royal Oppression')} (38%, Semi-Limited) is a Continuous Trap. When a monster would be Special Summoned, or a card or effect that could Special Summon is activated, <b>either player</b> can pay 800 LP to negate it and destroy it.</p>
<p>Every Synchro Summon is a Special Summon, so Royal Oppression can stop every Synchro. It can even stop Starlight Road, because Road can summon Stardust. It cannot be used in the Damage Step, so it cannot stop Tragoedia.</p>
${call('key','The big idea','<p>Royal Oppression is shared. Your opponent can pay to stop your summons too. Play it when you need Special Summons less than your opponent does.</p>')}
<h3>Pulling the Rug</h3>
<p>${cn('Pulling the Rug')} (44%) is a Counter Trap. It negates an effect that activates because a monster was Normal Summoned, and destroys that monster. That covers Caius (Tribute Summons are Normal Summons), Deep Sea Diva, Debris Dragon and Junk Synchron.</p>
<p>It cannot stop ignition effects, D.D. Crow, or effects from a Special Summon.</p>
<h2>Traps for the long game</h2>
<div class="tbl-wrap"><table><thead><tr><th>Card</th><th>In decks</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Dust Tornado')}</td><td>73%</td><td>Destroy one of your opponent's Spells or Traps, then you can Set a card.</td></tr>
<tr><td>${cn('Trap Dustshoot')}</td><td>56%</td><td>If they hold 4+ cards, see their hand and shuffle a monster away.</td></tr>
<tr><td>${cn('Call of the Haunted')}</td><td>38%</td><td>Revive a monster from your Graveyard in Attack Position.</td></tr>
<tr><td>${cn('Compulsory Evacuation Device')}</td><td>25%</td><td>Return one monster to the hand. A Synchro goes to the Extra Deck.</td></tr>
<tr><td>${cn('Mask of Restrict')}</td><td>25%</td><td>No monster can be Tributed. Synchro Material still works.</td></tr>
</tbody></table></div>
<p>${cn('Mask of Restrict')} also stops effects that need a Tribute as a cost. Stardust Dragon must Tribute itself, so under Mask of Restrict it cannot use its effect.</p>
${call('mistake','Common beginner mistakes',`<ul><li>Activating Starlight Road against a card that destroys only one of your cards.</li><li>Forgetting that your opponent can pay for Royal Oppression too.</li><li>Using Dimensional Prison after the attack was already negated.</li><li>Thinking Mask of Restrict stops Synchro Summons. It does not.</li></ul>`)}
<div class="recap"><h2>Recap</h2><ul><li>Mirror Force and Dimensional Prison stop attacks.</li><li>Solemn Judgment, Bottomless and Torrential stop summons.</li><li>Starlight Road stops a card that would destroy 2+ of yours, then brings out Stardust.</li><li>Royal Oppression lets either player pay 800 to stop a Special Summon.</li><li>Pulling the Rug stops effects that trigger on a Normal Summon.</li></ul></div>`,
flash:[
["Your opponent activates Heavy Storm. You have Starlight Road and two other Set cards. What can you do?","Chain Starlight Road. It negates and destroys Heavy Storm, then you can Special Summon Stardust Dragon from your Extra Deck."],
["Royal Oppression is face-up on your side. Can your opponent use it?","Yes. Either player can pay 800 LP to negate a Special Summon."],
["Can Solemn Judgment stop Gorz the Emissary of Darkness?","No. Gorz summons itself with an effect that starts a Chain, and Solemn cannot negate that."],
["Your opponent Tribute Summons Caius. Which Counter Trap stops its effect?","Pulling the Rug. Caius's effect activates because it was Normal Summoned."],
["Mask of Restrict is face-up. Can you Synchro Summon? Can Stardust Dragon use its effect?","You can Synchro Summon, because material is not a Tribute. Stardust cannot use its effect, because it must Tribute itself."],
["Why is Dimensional Prison good against Synchros?","It banishes the attacker, so the Synchro does not go back to the Extra Deck."]
]},

{n:16,title:'How Edison Thinks',sub:'Card advantage, one-for-one trades, and when to make a big play.',min:4,
cards:['Mystical Space Typhoon','Heavy Storm','Black Rose Dragon','Sangan','Brain Control','Pot of Avarice','Plaguespreader Zombie','Starlight Road'],
html:`
<div class="goals"><h4>What you will learn</h4><ul><li>What card advantage means</li><li>How to judge a trade, one card for one card</li><li>How to decide when to make a big play</li></ul></div>
<h2>Cards are your resource</h2>
<p>Count the cards you have: your hand plus your field. Do the same for your opponent. The player with more cards usually has more options.</p>
<p><b>Card advantage</b> means having more of those cards than your opponent. Every card you play is a trade. You give up a card to take something away, or to gain something.</p>
${call('analogy','Think of it like this','<p>Think of cards as coins. A good trade is when you pay one coin and your opponent loses two. A bad trade is when you pay two coins to take one of theirs.</p>')}
<h2>One-for-one trades</h2>
<p>Most removal is a fair trade. One of your cards for one of theirs.</p>
<div class="tbl-wrap"><table><thead><tr><th>Card</th><th>You spend</th><th>They lose</th><th>Description</th></tr></thead><tbody>
<tr><td>${cn('Mystical Space Typhoon')}</td><td>1</td><td>1</td><td>A clean one-for-one.</td></tr>
<tr><td>${cn('Bottomless Trap Hole')}</td><td>1</td><td>1 or more</td><td>Can hit more than one monster summoned at once.</td></tr>
<tr><td>${cn('Heavy Storm')}</td><td>1</td><td>All Spells/Traps</td><td>Also hits yours. Count both sides first.</td></tr>
<tr><td>${cn('Mirror Force')}</td><td>1</td><td>All attackers</td><td>Better the more Attack Position monsters they have.</td></tr>
<tr><td>${cn('Black Rose Dragon')}</td><td>2 materials</td><td>The whole field</td><td>Also wipes yours. Use it when you are behind.</td></tr>
</tbody></table></div>
<p>Edison is full of fair trades. That is why the games feel balanced. One card that trades for two is a big deal.</p>
<h2>Cards that give more</h2>
<p>Some cards replace themselves or give you extra cards. Players call these "plus" cards.</p>
<ul>
<li>${cn('Sangan')} leaves the field and adds a monster to your hand. Used as Synchro Material, it gives you a Synchro and a new card.</li>
<li>${cn('Card Trooper')} draws you a card when it is destroyed.</li>
<li>${cn('Pot of Avarice')} is one card that draws two.</li>
<li>${cn('Brain Control')} turns your opponent's monster into your material. They lose a card, and you pay only Brain Control and 800 LP.</li>
</ul>
<h3>Synchros and card count</h3>
<p>A Synchro Summon uses two or more monsters to make one. On its own, that is two cards for one. The trick is to make the materials cheap:</p>
<ul><li>${cn('Plaguespreader Zombie')} comes back from the Graveyard. You pay a card from your hand, but it goes to the top of your Deck, so you draw it again next turn.</li><li>${cn('Deep Sea Diva')}, ${cn('Junk Synchron')} and ${cn('Debris Dragon')} bring a second monster with them.</li><li>${cn('Cyber Dragon')} comes out free when you have no monsters.</li></ul>
<p>When one card from your hand becomes a Synchro, you have made a good trade.</p>
<h2>LP is a resource too</h2>
<p>Many staples cost LP: Solemn Judgment costs half, Royal Oppression and Brain Control cost 800, Thought Ruler Archfiend costs 1000. LP you never use does not win games. Spend it when it buys you a card or a turn.</p>
<p>But watch how low you go. Gorz and Tragoedia punish an attack you cannot afford.</p>
<h2>When to make a big play</h2>
<p>A big play is a turn where you commit many cards at once, like a Synchro Summon followed by attacks. If it works, you get far ahead. If your opponent stops it, you lose several cards at once.</p>
<ol class="steps">
<li><div><b>Count their Set cards.</b> Each one could be Bottomless Trap Hole, Solemn Judgment, Starlight Road or Mirror Force.</div></li>
<li><div><b>Clear the way first.</b> Use Mystical Space Typhoon, Heavy Storm or Brionac before you commit.</div></li>
<li><div><b>Start small.</b> Make your opponent use a Trap on a smaller threat before you summon your best one.</div></li>
<li><div><b>Keep something back.</b> A card in hand for next turn means one stopped play does not end the game.</div></li>
<li><div><b>Go all in when you can finish.</b> If the attack wins the game this turn, commit everything.</div></li>
</ol>
${call('key','The big idea','<p>Ask two questions before every play. What do I spend? What does my opponent lose? If you spend more than they lose, you need a good reason.</p>')}
${call('mistake','Common beginner mistakes',`<ul><li>Making a Synchro every turn just because you can. Every Synchro costs materials.</li><li>Playing Black Rose Dragon or Heavy Storm when they hurt you more than your opponent.</li><li>Committing your whole hand into four Set cards.</li></ul>`)}
<div class="recap"><h2>Recap</h2><ul><li>Count hand plus field for both players.</li><li>Most removal is one card for one card. A card that takes two is a big deal.</li><li>Sangan, Card Trooper and Pot of Avarice give you more than they cost.</li><li>Synchros cost materials. Cheap Tuners make the trade good.</li><li>Before a big play, count Set cards and clear the way.</li></ul></div>
<p class="soon">You finished Edison 201. Look up any card in the <a href="#cards">card search</a>, or check the full <a href="#staples">staples list</a>.</p>`,
flash:[
["What is card advantage?","Having more cards (hand plus field) than your opponent, which gives you more options."],
["You use Mystical Space Typhoon on a Set card. How good is that trade?","One-for-one. You spent one card and your opponent lost one."],
["Why is Sangan a plus card?","When it leaves the field, it adds a monster from your Deck to your hand, so it replaces itself."],
["A Synchro Summon uses two monsters for one. How do players make that trade good?","By using cheap materials, like Plaguespreader Zombie from the Graveyard or a Tuner that brings a second monster with it."],
["Your opponent has three Set cards. You hold a Tuner and MST. What should you do first?","Use MST, or other removal, on a Set card before committing to the Synchro."],
["When is Black Rose Dragon's field wipe a good trade?","When your opponent has more cards on the field than you do."]
]}

]};
