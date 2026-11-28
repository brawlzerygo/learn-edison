/* Learn Retro computer player (first version 2026-11-20; Goat knowledge and the four levels 2026-11-24). Built on js/engine.js.
 For each decision it copies the duel (E.clone), tries every choice, plays the copy forward until the next free
 action, and scores the position. It never sees hidden cards: in every copy the opponent's hand, face-down cards
 and Deck are swapped for blank stand-ins, and its own Deck is shuffled, so it plays like a person who only knows what they can see.
 Levels: see LEVELS below (Beginner to Tournament). */
(function (root) {
'use strict';
const AI = {};
const E = () => root.EdisonEngine;
const I = () => E()._internal;
const VALUE = { // cards worth more than their stats (in or out of the hand)
  'Heavy Storm': 1700, 'Mirror Force': 1600, 'Torrential Tribute': 1600, 'Solemn Judgment': 1500, 'Brain Control': 1400, 'Mystical Space Typhoon': 1100,
  'Bottomless Trap Hole': 1300, 'Dimensional Prison': 1200, 'Book of Moon': 1100, 'Dark Armed Dragon': 2600, 'Gorz the Emissary of Darkness': 1800,
  'Royal Oppression': 1300, 'Trap Dustshoot': 900, 'Dark Bribe': 1100, 'Icarus Attack': 1300, 'Raigeki Break': 1200, 'Allure of Darkness': 1100,
  'Gold Sarcophagus': 900, 'Reinforcement of the Army': 1000, 'E - Emergency Call': 1000, 'One for One': 900, 'Scapegoat': 1100, 'Enemy Controller': 1100,
  'Miracle Fusion': 1200, 'Compulsory Evacuation Device': 1100, 'Dust Tornado': 900, 'Black Whirlwind': 1300, 'Battle Fader': 1000, 'Tragoedia': 1300,
  'Plaguespreader Zombie': 1100, 'Card Trooper': 1000, 'Spirit Reaper': 1000, 'Dupe Frog': 900, 'Treeborn Frog': 900, 'Blackwing - Kalut the Moon Shadow': 1000,
  'Caius the Shadow Monarch': 1800, 'Stardust Dragon': 2800, 'Brionac, Dragon of the Ice Barrier': 2600,
};
/* On the field a monster is worth its stats plus what its effect keeps doing there; cards like Battle Fader or Gorz
 are worth a lot in the hand and little once summoned. */
const FIELD_BONUS = { 'Dark Armed Dragon': 1400, 'Stardust Dragon': 700, 'Brionac, Dragon of the Ice Barrier': 700, 'Dark End Dragon': 500, 'Blackwing - Gale the Whirlwind': 300,
  'Card Trooper': 300, 'Spirit Reaper': 500, 'Dupe Frog': 500, 'Substitoad': 500, 'Thought Ruler Archfiend': 300, 'Blackwing Armor Master': 600, 'Goyo Guardian': 300,
  'Tragoedia': 300, 'Elemental HERO Ocean': 300, 'Swap Frog': 200, 'Blackwing - Sirocco the Dawn': 200, 'Armory Arm': 300, 'Red Dragon Archfiend': 300 };
/* Goat (2005) values (2026-11-24), from the site's Goat lessons and matchup notes (goat/data/lessons-*.js, opponents.js):
 the format is won one card at a time, so the steal (Snatch Steal), the mass removal (Heavy Storm, Mirror Force,
 Torrential, Ring of Destruction) and the cards that answer anything (Book of Moon, Nobleman, Sakuretsu, Dustshoot) are
 worth far more than a card's stats, and so are the monsters that make a plus (Sangan, Magician of Faith, Tsukuyomi,
 Breaker, D.D. Warrior Lady, Tribe-Infecting Virus, Airknight) and the two Chaos monsters. The draw cards (Pot, Graceful
 Charity, Delinquent Duo) are valued at less than what they bring in, so the computer plays them instead of holding them. */
const GOAT_VALUE = {
  'Pot of Greed': 1000, 'Graceful Charity': 900, 'Delinquent Duo': 950, 'Snatch Steal': 1500, 'Heavy Storm': 1600, 'Mirror Force': 1500,
  'Torrential Tribute': 1500, 'Ring of Destruction': 1350, 'Book of Moon': 1250, 'Scapegoat': 1350, 'Nobleman of Crossout': 1150, 'Sakuretsu Armor': 1150,
  'Trap Dustshoot': 1050, 'Raigeki Break': 1150, 'Mystical Space Typhoon': 1050, 'Dust Tornado': 950, 'Metamorphosis': 950, 'Card Destruction': 800,
  'Premature Burial': 1150, 'Call of the Haunted': 1100, 'Confiscation': 1300, 'Exiled Force': 1200, 'Solemn Judgment': 1400, 'Magic Cylinder': 1000,
  'Black Luster Soldier - Envoy of the Beginning': 2700, 'Chaos Sorcerer': 2200, 'Breaker the Magical Warrior': 1500, 'Tsukuyomi': 1350, 'Sangan': 1150,
  'Magician of Faith': 1250, 'Airknight Parshath': 1500, 'Asura Priest': 1200, 'D.D. Warrior Lady': 1300, 'Tribe-Infecting Virus': 1350,
  'Dekoichi the Battlechanted Locomotive': 1000, 'Dark Mimic LV1': 1000, 'Sinister Serpent': 600, 'Thunder Dragon': 950, 'Night Assailant': 1150,
  'Gravekeeper\'s Spy': 950, 'Mystic Tomato': 950, 'Kycoo the Ghost Destroyer': 1150, 'Magical Merchant': 950, 'Skilled White Magician': 1100,
  'Jinzo': 1700, 'Dark Magician of Chaos': 1900, 'Cyber Jar': 1200, 'Morphing Jar': 1100, 'Spirit Reaper': 1100, 'Twin-Headed Behemoth': 1100,
};
const GOAT_FIELD_BONUS = { 'Black Luster Soldier - Envoy of the Beginning': 1100, 'Chaos Sorcerer': 550, 'Thousand-Eyes Restrict': 1500, 'Airknight Parshath': 500,
  'Breaker the Magical Warrior': 150, 'Tribe-Infecting Virus': 500, 'D.D. Warrior Lady': 350, 'Asura Priest': 300, 'Sangan': 350, 'Mystic Tomato': 250,
  'Kycoo the Ghost Destroyer': 250, 'Skilled White Magician': 250, 'Jinzo': 900, 'Dark Magician of Chaos': 600, 'Spirit Reaper': 500, 'Night Assailant': 150,
  'Magician of Faith': 100, 'Sheep Token': 100 };
const CHAOS = new Set(['Black Luster Soldier - Envoy of the Beginning', 'Chaos Sorcerer']);
const goat = () => E().format && E().format() === 'goat';
/* Card roles (2026-11-28, Zack approved the list: "the CPU needs to know what every card does"). Every card the game can
 play has one or more roles for the job it does in a deck (searcher, floater, boss, floodgate, Book / Blanket...), read from
 its text and checked by hand for the deck cards (play/.audit/roles/, the review page and its definitions). The hand-tuned
 tables above still win for the cards they name; roles cover every other card, which the computer used to value by stats
 alone (any Spell or Trap it didn't know was a flat 750). Only roles of high confidence are here. */
// ROLES:BEGIN written by build/make_ai_roles.js from play/.audit/roles (approved 2026-11-28); do not edit by hand
const ROLE_LISTS = {"edison":{"boss":"Airknight Parshath|Ancient Gear Gadjiltron Dragon|Arcanite Magician|Archlord Kristya|Black Luster Soldier - Envoy of the Beginning|Black Rose Dragon|Blackwing - Silverwind the Ascendant|Blackwing Armor Master|Blue-Eyes Ultimate Dragon|Blue-Eyes White Dragon|Brionac, Dragon of the Ice Barrier|Chaos Emperor Dragon - Envoy of the End|Chaos Sorcerer|Chimeratech Fortress Dragon|Colossal Fighter|Cyber End Dragon|Cyber Twin Dragon|Dark Armed Dragon|Dark End Dragon|Dark Magician of Chaos|Dark Strike Fighter|Destiny HERO - Dogma|Destiny HERO - Plasma|Elemental HERO Absolute Zero|Elemental HERO Gaia|Exodia the Forbidden One|Five-Headed Dragon|Gilford the Lightning|Gladiator Beast Heraklinos|Goyo Guardian|Jinzo|Judgment Dragon|Light and Darkness Dragon|Machina Force|Machina Fortress|Mist Wurm|Montage Dragon|Obelisk the Tormentor|Prime Material Dragon|Red Dragon Archfiend|Red-Eyes Darkness Metal Dragon|Sacred Phoenix of Nephthys|Stardust Dragon|The Dark Creator|The Wicked Avatar|The Wicked Dreadroot|The Wicked Eraser|Thought Ruler Archfiend|Thousand-Eyes Restrict|Tytannial, Princess of Camellias|Uria, Lord of Searing Flames|Vampire Lord","negation":"A-Team: Trap Disposal Unit|Amplifier|Ancient City - Rainbow Ruins|Ancient Gear Beast|Anti Raigeki|Anti-Spell|Arcana Force EX - The Light Ruler|Arcana Knight Joker|Armed Sea Hunter|Armor Break|Armored Glass|Assault Counter|Bait Doll|Bending Destiny|Black Horn of Heaven|By Order of the Emperor|Call of the Grave|Carrierroid|Chaos Command Magician|Counter Counter|Curse of Royal|Cursed Seal of the Forbidden Spell|Cyber Blader|Damage Polarizer|Dark Balter the Terrible|Dark Bribe|Dark Illusion|Dark Lucius LV4|Dark Lucius LV6|Dark Paladin|Dark Ruler Ha Des|Darkbishop Archfiend|Desrook Archfiend|Destiny HERO - Plasma|Destruction Jammer|Dice Try!|Disarm|Divine Wrath|Doomcaliber Knight|Earthbound Wave|Element Doom|Element Saurus|Element Soldier|Feather Wind|Fiend Skull Dragon (Archfiend)|Fiendish Chain|Flamvell Counter|Forced Back|Fossil Excavation|Fushioh Richie|Fusion Guard|Gemini Counter|Gemini Imps|Gladiator Beast Heraklinos|Gladiator Beast War Chariot|Goblin Out of the Frying Pan|Gora Turtle of Illusion|Gravekeeper's Watcher|Great Dezard|Gryphon Wing|Guardian Baou|Harpie Lady 2|Herald of Green Light|Herald of Orange Light|Herald of Purple Light|Hero's Rule 2|Horn of Heaven|Horus the Black Flame Dragon LV8|Infernalqueen Archfiend|Iron Core Luster|Jar Robber|Judgment of Anubis|Judgment of the Pharaoh|Koa'ki Meiru Doom|Koa'ki Meiru Guardian|Lifeforce Harmonizer|Light and Darkness Dragon|Magic Drain|Magic Jammer|Majestic Red Dragon|Majestic Star Dragon|Malfunction|Maryokutai|Mid Shield Gardna|Mind Over Matter|Morphtronic Forcefield|My Body as a Shield|Nega-Ton Corepanel|Obsidian Dragon|Overwhelm|Parry|Phoenix Gearfried|Pollinosis|Prime Material Dragon|Prime Material Falcon|Pulling the Rug|Rare Metalmorph|Revived King Ha Des|Riryoku Field|Royal Oppression|Royal Surrender|Ryu Senshi|Saber Hole|Seven Tools of the Bandit|Shadowknight Archfiend|Shining Silver Force|Silent Insect|Skull Archfiend of Lightning|Sky Scourge Invicil|Snake Deity's Command|Solemn Judgment|Sorcerer of Dark Magic|Spell Shield Type-8|Spell Vanishing|Spell-Stopping Statute|Stardust Dragon|Stardust Dragon Assault Mode|Starlight Road|Super Polymerization|Super-Electromagnetic Voltech Dragon|Superancient Deepsea King Coelacanth|Swallow Flip|Terrorking Archfiend|The Dragon's Bead|The Selection|Thought Ruler Archfiend|Thunder King Rai-Oh|Trap Jammer|Trap Stun|Trap of Board Eraser|Tutan Mask|Twin-Headed Wolf|Tytannial, Princess of Camellias|Van'Dalgyon the Dark Dragon Lord|Vanity's Call|Vanquishing Light|Vilepawn Archfiend|White Night Dragon|Wicked-Breaking Flamberge - Baou","protection":"Imperial Custom|My Body as a Shield|Spirit Barrier|Stardust Dragon|Starlight Road","spot_backrow":"Alien Telepath|Ancient Gear Engineer|Anteatereatingant|Arcane Archer of the Forest|Armed Ninja|Assault Mercenary|Aswan Apparition|B.E.S. Tetran|Batteryman Industrial Strength|Battlestorm|Black Brutdrago|Bone Crusher|Breaker the Magical Warrior|Brionac, Dragon of the Ice Barrier|Burning Beast|Caius the Shadow Monarch|Chiron the Mage|Cloudian - Acid Cloud|Crimson Ninja|Curse of Royal|Cursed Fig|Cyclone Blade|Dark Catapulter|Dark General Freed|Dark Nephthys|Dark Scorpion - Cliff the Trap Remover|De-Spell|Desert Twister|Destiny HERO - Dread Servant|Destructotron|Driving Snow|Dust Tornado|Elemental HERO Stratos|Elemental HERO Wild Wingman|Explosive Magician|Fairy Guardian|Fiend Skull Dragon (Archfiend)|Freed the Matchless General|Freezing Beast|Gladiator Beast Bestiari|Gladiator Beast Octavius|Gladiator Beast's Battle Halberd|Gren, Tactician of Dark World|Gust|Hannibal Necromancer|Icarus Attack|Koa'ki Meiru Sea Panther|Lyla, Lightsworn Sorceress|Magicat|Magna-Slash Dragon|Mobius the Frost Monarch|Morphtronic Cord|Mystical Space Typhoon|Mystical Wind Typhoon|Nobleman of Extermination|Nubian Guard|Orbital Bombardment|Orca Mega-Fortress of Darkness|Phoenix Wing Wind Blast|Pseudo Space|Raigeki Break|Rain Storm|Raiza the Storm Monarch|Rod of Silence - Kay'est|Ryko, Lightsworn Hunter|Sinister Sprocket|Snipe Hunter|Spell Striker|Spiritualism|Stamping Destruction|Stealthroid|Swarm of Locusts|The Six Samurai - Kamon|The Six Samurai - Yaichi|Twister|Unifrog|Uria, Lord of Searing Flames|Victory Viper XX03|Worm Apocalypse|XY-Dragon Cannon|XZ-Tank Cannon|Yamato-no-Kami","mass_removal":"4-Starred Ladybug of Doom|7|A Major Upset|A Wingbeat of Giant Dragon|Acid Rain|Anti Raigeki|Arcana Force EX - The Dark Ruler|Arcanite Magician Assault Mode|Archlord Zerato|Armed Dragon LV10|Armed Dragon LV7|Armoroid|Assault Revival|Assault Slash|Beast King Barbaros|Big Wave Small Wave|Black Rose Dragon|Blast Held by a Tribute|Blasting Fuse|Blind Destruction|Breath of Light|Burst Breath|Burst Return|Burst Stream of Destruction|Byser Shock|Card Rotator|Card of Sanctity|Cell Explosion Virus|Chain Destruction|Chaos Emperor Dragon - Envoy of the End|Chaos End|Chimeratech Overdragon|Chosen One|Colossal Fighter Assault Mode|Contact|Counter Gem|Crystal Abundance|Cyber Eltanin|Cyber Jar|Cyber Prima|Cyclone Boomerang|Dark Armed Dragon|Dark Dust Spirit|Dark Hole|Dark Hunter|Dark Magic Attack|Dark Master - Zorc|Dark Mirror Force|Darklord Zerato|Darkness Neosphere|Deck Devastation Virus|Delta Crow - Anti Reverse|Demise, King of Armageddon|Des Croaking|Destiny Board|Destiny HERO - Dreadmaster|Destruction Cyclone|Detonate|Diffusion Wave-Motion|Disarmament|Doom Shaman|Doomsday Horror|Dragon Piper|Earthbound Immortal Aslla piscu|Earthbound Immortal Ccarayhua|Earthbound Whirlwind|Elemental Burst|Elemental HERO Absolute Zero|Elemental HERO Chaos Neos|Elemental HERO Magma Neos|Elemental HERO Storm Neos|Eliminating the League|Eradicator Epidemic Virus|Eternal Rest|Evil HERO Wild Cyclone|Exile of the Wicked|Fairy Wind|Final Destiny|Firestorm Prominence|Flash of the Forbidden Spell|Froggy Forcefield|Fuh-Rin-Ka-Zan|Fushioh Richie|Gambler of Legend|Gandora the Dragon of Destruction|Garlandolf, King of Destruction|Gatling Dragon|Gemini Trap Hole|Genesis Dragon|Giant Trap Hole|Giant Trunade|Gigantes|Gigastone Omega|Gilford the Lightning|Gozen Match|Grand Convergence|Gravity Behemoth|Great Dezard|Gryphon Wing|Gryphon's Feather Duster|Guardian Sphinx|Harpie's Feather Duster|Heavy Storm|Huge Revolution|Icarus Attack|Ice Master|Ido the Supreme Magical Force|Il Blud|Jigen Bakudan|Jinzo - Lord|Judgment Dragon|Justi-Break|Karma Cut|Koa'ki Meiru Tornado|Koa'ki Meiru War Arms|Lady Ninja Yae|Last Day of Witch|Legendary Flame Lord|Levia-Dragon - Daedalus|Lightning Vortex|Magnetic Mosquito|Majestic Red Dragon|Majestic Star Dragon|Major Riot|Makiu, the Magical Mist|Malevolent Catastrophe|Malice Dispersion|Mega Ton Magical Cannon|Minefield Eruption|Mirror Force|Mispolymerization|Mist Wurm|Moisture Creature|Mormolith|Needle Ceiling|Obelisk the Tormentor|Ocean Dragon Lord - Neo-Daedalus|Offering to the Snake Deity|Ojama Delta Hurricane!!|Ojamuscle|Planet Pollutant Virus|Proof of Powerlessness|Psi-Impulse|Radiant Mirror Force|Radiant Spirit|Raging Earth|Raging Mad Plants|Raigeki|Rainbow Dark Dragon|Rainbow Dragon|Rainbow Neos|Really Eternal Rest|Reckoned Power|Red Dragon Archfiend|Red Dragon Archfiend Assault Mode|Reign-Beaux, Overlord of Dark World|Relinquished Spider|Reptilianne Hydra|Reversal Quiz|Sacred Phoenix of Nephthys|Sand Gambler|Savage Colosseum|Short Circuit|Silent Abyss|Sky Scourge Norleras|Special Hurricane|Spell Gear|Spell Purification|Spell Shattering Arrow|Spell Vanishing|Straight Flush|Swift Birdman Joe|Swords of Concealing Light|System Down|The First Sarcophagus|The Last Warrior from Another Planet|The Law of the Normal|The Wicked Eraser|Thousand Energy|Thunder Crash|Time Wizard|Token Feastevil|Token Thanksgiving|Torrential Tribute|Tragedy|Triangle Power|Tribe-Infecting Virus|Trident Dragion|Tualatin|Umbral Soul|Volcanic Doomfire|Volcanic Eruption|Volcanic Scattershot|Wall of Thorns|Warrior Elimination|Weed Out|Wild Fire|Winged Kuriboh LV10|Wrath of Neos|Yubel - Terror Incarnate","spot_monster":"Abyss Soldier|Adhesive Explosive|Ally of Justice Catastor|Ancient Gear Fist|Anti-Fusion Device|Arcanite Magician|Armed Dragon LV5|Armed Sea Hunter|Armored Cybern|Automatic Laser|Barrel Dragon|Batteryman Industrial Strength|Black Luster Soldier - Envoy of the Beginning|Blackwing - Silverwind the Ascendant|Blade Rabbit|Blast Magician|Blast Sphere|Blaze Accelerator|Blowback Dragon|Book of Life|Bottomless Shifting Sand|Bottomless Trap Hole|Brionac, Dragon of the Ice Barrier|Caius the Shadow Monarch|Catoblepas and the Witch of Fate|Chaos Sorcerer|Clay Charge|Cloudian - Cirrostratus|Cloudian - Poison Cloud|Compulsory Evacuation Device|Continuous Destruction Punch|Core Blaster|Core Reinforcement|Crass Clown|Cross Counter|Crush Card Virus|Cyber Laser Dragon|Cyberdark Edge|Cyberdark Horn|Cyberdark Keel|D - Counter|D.D. Assailant|D.D. Warrior Lady|Dangerous Machine Type-6|Dark Armed Dragon|Dark Core|Dark End Dragon|Dark Master - Zorc|Dark Valkyria|Des Kangaroo|Destiny End Dragoon|Destiny HERO - Doom Lord|Destruction Punch|Destruction Ring|Detonator Circle A|Dimensional Prison|Disc Fighter|Disciple of the Forbidden Spell|Divine Wrath|Domino Effect|Dragon Seeker|Drillroid|Edge Hammer|Ehren, Lightsworn Monk|Elemental HERO Darkbright|Elemental HERO Grand Neos|Elemental HERO Necroid Shaman|Elemental HERO Thunder Giant|Eliminating the League|Evil HERO Lightning Golem|Exiled Force|Exploder Dragon|Exploder Dragonwing|Flint Missile|Flip Flop Frog|Fortune Lady Fire|Freed the Brave Wanderer|Frost and Flame Dragon|Future Samurai|Gale Lizard|Gearfried the Swordmaster|Gemini Spark|Getsu Fuhma|Golem Sentry|Gravekeeper's Descendant|Gravekeeper's Guard|Gravi-Crush Dragon|Guardian Ceal|Guardian Statue|Hammer Shot|Hand of the Six Samurai|Hero Blast|Hero Counterattack|Horn of Heaven|Icarus Attack|Infernity Force|Jester Confit|Judgment of Anubis|Junk Archer|Kahkki, Guerilla of Dark World|Kaiser Glider|Kaminote Blow|Karma Cut|Koa'ki Meiru Guardian|Koa'ki Meiru Ice|Kryuel|Kuraz the Light Monarch|Legendary Jujitsu Master|Machina Fortress|Magical Dimension|Magical Marionette|Man-Eater Bug|Master Gig|Medusa Worm|Mermaid Archer|Michizure|Miracle Flipper|Mirror of Oaths|Mysterious Guard|Mysterious Triangle|Mystic Box|Mystic Swordsman LV2|Mystic Swordsman LV4|Mystic Swordsman LV6|Nanobreaker|Needle Wall|Neo-Spacian Grand Mole|Nettles|Newdoria|Night Assailant|Ninja Grandmaster Sasuke|Nobleman of Crossout|Offerings to the Doomed|Old Vindictive Magician|Orca Mega-Fortress of Darkness|Order to Charge|Paladin of White Dragon|Phoenix Wing Wind Blast|Pole Position|Psychic Tuning|Pulling the Rug|Rai-Jin|Raigeki Break|Raiza the Storm Monarch|Razor Lizard|Release from Stone|Relinquished|Reptilianne Vaskii|Ring of Destruction|Ritual Sealing|Roulette Barrel|Ryko, Lightsworn Hunter|Ryu Kokki|Sakuretsu Armor|Sasuke Samurai|Search Striker|Security Orb|Shreddder|Skull Lair|Smashing Ground|Snipe Hunter|Snowman Eater|Soul Taker|Stealthroid|Sun Dragon Inti|Swarm of Scarabs|Sword of Dragon's Soul|Synchro Blast Wave|Synchro Deflector|Telepathic Power|The Six Samurai - Irou|The Six Samurai - Zanji|Thousand Knives|Thousand Needles|Thousand-Eyes Restrict|Throwstone Unit|Trap Hole|Treacherous Trap Hole|Tri-Blaze Accelerator|Tribute to the Doomed|Trojan Blast|Turbo Booster|Turbo Cannon|Two Thousand Needles|Underground Arachnid|Vanquishing Light|Vicious Claw|Viser Des|Widespread Ruin|YZ-Tank Dragon|Yomi Ship|Yubel - The Ultimate Nightmare|Zaborg the Thunder Monarch","steal":"Alien Brain|Alien Hypno|Aussa the Earth Charmer|Brain Control|Brain Jacker|Brainwashing Beam|Change of Heart|Chthonian Polymer|Creature Swap|Dark Necrofear|Dharc the Dark Charmer|Doomkaiser Dragon|Dragon Manipulator|Earthbound Immortal Uru|Electric Virus|Enemy Controller|Eria the Water Charmer|Falling Down|Goyo Guardian|Hiita the Fire Charmer|Informer Spider|Intercept|Interplanetary Invader A|Jowls of Dark Demise|Lava Golem|Magical Arm Shield|Marionette Mite|Mark of the Rose|Mass Hypnosis|Mind Control|Mutant Mindmaster|Mystic Box|Possessed Dark Soul|Puppet Plant|Rafflesia Seduction|Reptilianne Viper|Reshef the Dark Being|Shadow Tamer (Archfiend)|Snatch Steal|Synchro Control|Tragoedia|Tuner's Scheme|Union Rider|Wynn the Wind Charmer","revival":"Agido|Alien Ammonite|Apocatequil|Arcanite Magician Assault Mode|Archfiend's Roar|Armored Axon Kicker|Assault Revival|Athena|Autonomous Action Unit|Backs to the Wall|Battery Charger|Beast of the Pharaoh|Black Garden|Black Salvo|Blackwing - Blizzard the Far North|Blazewing Butterfly|Bone Temple Block|Book of Life|Branch!|Call of the Haunted|Call of the Reaper|Chimera the Flying Mythical Beast|Cloudian - Turbulence|Cocoon Party|Cocoon Rebirth|Cocoon Veil|Code A Ancient Ruins|Colossal Fighter|Colossal Fighter Assault Mode|Core Reinforcement|Crystal Abundance|Cunning of the Six Samurai|Cyborg Doctor|Dark Bug|Dark Horus|Debris Dragon|Decoy Dragon|Descending Lost Star|Destiny HERO - Captain Tenacious|Destiny HERO - Dreadmaster|Destiny HERO - Fear Monger|Dimension Fusion|Doom Shaman|Doomkaiser Dragon Assault Mode|Elemental HERO Necroid Shaman|Emergency Assistance|Falchion Beta|Fire Ant Ascator|Fortune Lady Dark|Fossil Excavation|Fulfillment of the Contract|Fushioh Richie|Gaia Plate the Earth Giant|Gateway of the Six|Gateway to Dark World|Give and Take|Gladiator Beast Darius|Gottoms' Emergency Call|Gravekeeper's Chief|Hyper Psychic Blaster Assault Mode|Hysteric Party|Ido the Supreme Magical Force|Il Blud|Infernity Force|Iron Chain Repairman|Jinzo - Returner|Junk Box|Junk Synchron|Kinka-byo|Lava Dragon|Level Modulation|Limit Reverse|Lord Poison|Lumina, Lightsworn Summoner|Machine Assembly Line|Majestic Red Dragon|Majestic Star Dragon|Mezuki|Miracle Fertilizer|Miracle Restoring|Mokey Mokey King|Monster Reborn|Moon Dragon Quilla|Morphtronic Map|O - Oversoul|Ojama Country|Paladin of the Cursed Dragon|Phoenix Gearfried|Plant Food Chain|Premature Burial|Raging Cloudian|Re-Fusion|Red Dragon Archfiend Assault Mode|Red-Eyes Darkness Metal Dragon|Red-Eyes Wyvern|Rekindling|Return from the Different Dimension|Return of the Six Samurai|Revival of the Immortals|Rite of Spirit|Seed of Flame|Silent Doom|Skyscraper 2 - Hero City|Spell Striker|Spirit Caller|Spirit of the Pharaoh|Spiritual Earth Art - Kurogane|Spyder Spider|Stardust Dragon Assault Mode|Summon Cloud|Sun Dragon Inti|Supersonic Skull Flame|Supervise|Swing of Memories|Symbols of Duty|Telekinetic Power Well|The Creator|The Dark Creator|The Puppet Magic of Dark Ruler|The Shallow Grave|The World Tree|Treeborn Frog|Ultimate Ancient Gear Golem|Vampire Genesis|Van'Dalgyon the Dark Dragon Lord|Vanguard of the Dragon|Variety Comes Out|Victoria|Wicked Rebirth|XX-Saber Faultroll|XX-Saber Fulhelmknight|Zombie Master","extender":"Alien Dog|Allure Queen LV3|Allure Queen LV5|Ancient Fairy Dragon|Ancient Gear|Arcana Force III - The Empress|Archlord Kristya|Armed Dragon LV3|Armed Dragon LV5|Avalanching Aussa|Batteryman Charger|Beast Machine King Barbaros Ür|Bicular|Blackwing - Blizzard the Far North|Blackwing - Bora the Spear|Blackwing - Gale the Whirlwind|Blackwing - Sirocco the Dawn|Blackwing - Vayu the Emblem of Honor|Blazing Hiita|Chrysalis Chicky|Chrysalis Dolphin|Chrysalis Larva|Chrysalis Mole|Chrysalis Pantail|Chrysalis Pinny|Commander Covington|Cross Porter|Cyber Dinosaur|Cyber Dragon|Dark Grepher|Dark Lucius LV4|Dark Lucius LV6|Debris Dragon|Decayed Commander|Deep Sea Diva|Destiny HERO - Disk Commander|Destiny HERO - Malicious|Doom Shaman|Emergency Teleport|Geartown|Gemini Scorpion|Gigantes|Gigaplant|Gilasaurus|Goka, the Pyre of Malice|Gorz the Emissary of Darkness|Grandmaster of the Six Samurai|Great Dezard|Great Shogun Shien|Guardian Eatos|Guardian of Order|Hand of Nephthys|Hardened Armed Dragon|Horus the Black Flame Dragon LV4|Horus the Black Flame Dragon LV6|Ice Master|Il Blud|Instant Fusion|Izanagi|Jester Confit|Junk Synchron|Kaibaman|Knight of the Red Lotus|Last Will|Level Warrior|Lonefire Blossom|Machina Soldier|Magical Exemplar|Marauding Captain|Mausoleum of the Emperor|Morphtronic Cameran|Morphtronic Scopen|Mystic Swordsman LV4|Neo-Parshath, the Sky Paladin|Ogre of the Scarlet Sorrow|Ojama Red|One for One|Oracle of the Sun|Orichalcos Shunoros|Paladin of White Dragon|Peten the Dark Clown|Phantom Dragon|Phoenixian Seed|Pinch Hopper|Plaguespreader Zombie|Puppet King|Quickdraw Synchron|Raging Eria|Red-Eyes Darkness Metal Dragon|Rescue Cat|Silent Magician LV4|Silent Swordsman LV3|Silent Swordsman LV5|Skilled White Magician|Skull Conductor|Skull Flame|Spell Striker|Storming Wynn|Summon Reactor SK|Summoner Monk|Swap Frog|Sword Master|Test Tiger|The Agent of Creation - Venus|The Creator Incarnate|The Fiend Megacyber|The Thing in the Crater|The Tricky|Tragoedia|Tricular|Tualatin|Turbo Booster|Turbo Synchron|Turret Warrior|Twilight Rose Knight|Ultimate Insect LV1|Ultimate Insect LV3|Ultimate Insect LV5|Ultimate Offering|Vampiric Orchis|Van'Dalgyon the Dark Dragon Lord|Winged Kuriboh LV9|XX-Saber Gardestrike|Yubel - Terror Incarnate","beatstick":"Abyss Soldier|Airknight Parshath|Alien Shocktrooper|Alien Warrior|Ancient Gear Knight|Apocatequil|Archfiend General|Armed Sea Hunter|Armor Exe|Arsenal Bug|Assault Beast|Assault Mercenary|Asura Priest|Avenging Knight Parshath|Aztekipede, the Worm Warrior|Bazoo the Soul-Eater|Beast Striker|Berserk Gorilla|Black Veloci|Blackwing - Bora the Spear|Blackwing - Shura the Blue Flame|Blackwing - Sirocco the Dawn|Blackwing Armed Wing|Blade Knight|Blindly Loyal Goblin|Blizzard Dragon|Boar Soldier|Breaker the Magical Warrior|Brron, Mad King of Dark World|Cactus Bouncer|Cactus Fighter|Caius the Shadow Monarch|Card Trooper|Catoblepas and the Witch of Fate|Cave Dragon|Chainsaw Insect|Chiron the Mage|Cross-Sword Beetle|Crusader of Endymion|Crystal Beast Sapphire Pegasus|Cyber Dragon|Cyber Harpie Lady|D.D. Survivor|D.D. Warrior Lady|Dark Elf|Dark Valkyria|Dark Zebra|Destroyersaurus|Djinn Presider of Rituals|Don Zaloog|Doomcaliber Knight|Drill Warrior|Elemental HERO Captain Gold|Elemental HERO Neos Alius|Elemental HERO Stratos|Evil HERO Malicious Edge|Evocator Chevalier|Exarion Universe|Exodia Necross|Familiar-Possessed - Aussa|Familiar-Possessed - Eria|Familiar-Possessed - Hiita|Familiar-Possessed - Wynn|Flamvell Firedog|Flamvell Uruquizas|Flash Assailant|Fossil Tusker|Gaia Knight, the Force of Earth|Gaia Soul the Combustible Collective|Garoth, Lightsworn Warrior|Gearfried the Iron Knight|Gemini Lancer|Giant Kozaky|Giant Orc|Gigantes|Gigantic Cephalotus|Gladiator Beast Laquari|Goblin Attack Force|Goblin Elite Attack Force|Granadora|Gyaku-Gire Panda|Harpie Queen|Harvest Angel of Wisdom|Herald of Creation|Homunculus the Alchemic Being|Hydra Viper|Hysteric Fairy|Immortal Ruler|Indomitable Fighter Lei Lei|Infernal Dragon|Infernity Archfiend|Injection Fairy Lily|Jain, Lightsworn Paladin|Jinzo|Jirai Gumo|Junk Warrior|Koa'ki Meiru Beetle|Koa'ki Meiru Crusader|Koa'ki Meiru Drago|Koa'ki Meiru Gravirose|Koa'ki Meiru Guardian|Koa'ki Meiru Ice|Koa'ki Meiru Powerhand|Koa'ki Meiru Sea Panther|Koa'ki Meiru Urnight|Kunoichi|Kycoo the Ghost Destroyer|Machina Gearframe|Machina Sniper|Mad Archfiend|Mataza the Zapper|Max Warrior|Metabo-Shark|Mobius the Frost Monarch|Mystic Swordsman LV4|Neo Space Pathfinder|Ninja Grandmaster Sasuke|Nitro Warrior|Nuvia the Wicked|Oxygeddon|Paladin of White Dragon|Paladin of the Cursed Dragon|Panther Warrior|Phantom of Chaos|Princess Curran|Princess Pikeru|Psychic Snail|Raiza the Storm Monarch|Rare Metal Dragon|Regenerating Mummy|Reptilianne Scylla|Rockstone Warrior|Ryu Kokki|Shadowknight Archfiend|Skull Conductor|Slate Warrior|Spear Dragon|Spined Gillman|St. Joan|Steamroid|Sunlight Unicorn|Superalloy Beast Raptinus|Susa Soldier|Terrorking Archfiend|The Bistro Butcher|The Six Samurai - Zanji|The Unfriendly Amazon|Thunder King Rai-Oh|Thunder Nyan Nyan|Toon Gemini Elf|Toon Goblin Attack Force|Trap Eater|Tribe-Infecting Virus|Tuned Magician|Turbo Warrior|Vampire Lord|Victoria|Volcanic Rocket|Volcanic Slicer|Voltic Kong|Warrior of Atlantis|Wind Effigy|Winged Rhynos|Wulf, Lightsworn Beast|X-Saber Galahad|Zaborg the Thunder Monarch|Zeradias, Herald of Heaven|Zombie Mammoth|Zombie Master|Zombyra the Dark","hand_trap":"Battle Fader|Blackwing - Kalut the Moon Shadow|D.D. Crow|Gorz the Emissary of Darkness|Honest|Kuriboh|Tragoedia","wall":"Amazoness Fighter|Ambush Fangs|Arcana Force XIV - Temperance|Arcanite Magician Assault Mode|Archfiend of Gilfer|Armored Cybern|B.E.S. Tetran|Banisher of the Light|Battle Fader|Big Shield Gardna|Black Stego|Blackwing Armor Master|Book of Eclipse|Boot-Up Soldier - Dread Dynamo|Botanical Lion|Castle Gate|Catapult Turtle|Changing Destiny|Cloudian - Ghost Fog|Cocoon of Evolution|Consecrated Light|Criosphinx|Crystal Beast Emerald Tortoise|Crystal Pair|Curse of Anubis|Cyber Archfiend|Cyber Barrier Dragon|Cyber Valley|D - Fortune|D.D. Assailant|Dark Flare Knight|Dark Necrofear|Dark Red Enchanter|Dark Sage|Dark Spirit of the Silent|Defender, the Magical Knight|Depth Amulet|Des Dendle|Des Wombat|Despair from the Dark|Destiny HERO - Defender|Destiny HERO - Dreadmaster|Dimensional Prison|Disenchanter|Djinn Releaser of Rituals|Dragon Capture Jar|Dragon Ice|Dragon Queen of Tragic Endings|Dragon Seeker|Draining Shield|Dupe Frog|Earth Effigy|Earthquake|Elemental HERO Poison Rose|Elemental HERO Woodsman|Emissary of the Oasis|Emperor Sem|Exxod, Master of The Guard|Fiendish Chain|Flamvell Guard|Flying Saucer Muusik'i|Fortress Warrior|Fossil Dyna Pachycephalo|Fushioh Richie|G.B. Hunter|Gear Golem the Moving Fortress|Giant Axe Mummy|Gigastone Omega|Gladiator Beast Hoplomus|Gorz the Emissary of Darkness|Grapple Blocker|Grave Protector|Gravity Bind|Great Dezard|Guardian Sphinx|Half or Nothing|Harpie Lady Sisters|Harpie's Pet Dragon|Hedge Guard|Hino-Kagu-Tsuchi|Infernity Necromancer|Insect Neglect|Insect Queen|Javelin Beetle|Jenis, Lightsworn Mender|Kid Guard|Koa'ki Meiru Speeder|Krebons|Kuriboh|Kuribon|Legendary Jujitsu Master|Level Limit - Area B|Lightsworn Barrier|Magic Cylinder|Magic Hole Golem|Maiden of the Aqua|Manga Ryu-Ran|Marshmallon|Messenger of Peace|Mind Protector|Miracle Jurassic Egg|Moai Interceptor Cannons|Moisture Creature|Monk Fighter|Morphtransition|Morphtronic Boomboxen|Mutant Mindmaster|Necro Gardna|Negate Attack|Neo-Spacian Glow Moss|Neo-Spacian Twinkle Moss|No Entry!!|Obsidian Dragon|Offering to the Immortals|Oracle of the Sun|Phantom Beast Thunder-Pegasus|Prickle Fairy|Pumpking the King of Ghosts|Radiant Jeral|Rainbow Path|Reptilianne Gardna|Ritual Cage|Rocket Warrior|Rockstone Warrior|Royal Magical Library|Sakuretsu Armor|Sand Moth|Sauropod Brachion|Scapegoat|Scary Moth|Scrap-Iron Scarecrow|Scrubbed Raid|Serpentine Princess|Shark Cruiser|Shield Worm|Skull Guardian|Slip of Fortune|Spell Striker|Sphinx Teleia|Spider Egg|Spirit Barrier|Spirit Reaper|Stone Statue of the Aztecs|Summon Reactor SK|Super Junior Confrontation|Swords of Concealing Light|Swords of Revealing Light|Synchro Deflector|The Creator|The Forgiving Maiden|The Lady in Wight|Thousand-Eyes Jellyfish|Thousand-Eyes Restrict|Threatening Roar|Throwstone Unit|Tornado Wall|Total Defense Shogun|Truckroid|Turret Warrior|Valkyrion the Magna Warrior|Victory Dragon|Waboku|Wall Shadow|Wall of Revealing Light|Winged Kuriboh|Witch Doctor of Sparta|X-Saber Galahad|Yamata Dragon|Yubel|Yubel - Terror Incarnate|Yubel - The Ultimate Nightmare|Zeman the Ape King|Zero Gardna","burn":"Abare Ushioni|Amazoness Archer|Ameba|Ancient Gear Cannon|Ancient Gear Explosive|Ancient Gear Tank|Andro Sphinx|Anti-Aircraft Flower|Armory Arm|Athena|Attack and Receive|Backfire|Bad Reaction to Simochi|Barrel Behind the Door|Black Pendant|Blast Asmodian|Blast Held by a Tribute|Blast Sphere|Blasting the Ruins|Bowganian|Brutal Potion|Burning Skull Head|Caius the Shadow Monarch|Cannon Soldier|Cannon Soldier MK-2|Castle Gate|Catapult Turtle|Ceasefire|Cemetary Bomb|Chain Detonation|Chain Strike|Change of Hero - Reflector Ray|Chaos Burst|Chaos Emperor Dragon - Envoy of the End|Clay Charge|Cloudian - Poison Cloud|Cobra Jar|Coffin Seller|Cyber Summon Blaster|Cyberdark Keel|Cyclone Boomerang|D - Chain|D.D. Dynamite|Dark Eradicator Warlock|Dark Room of Nightmare|Dark Strike Fighter|Darkblaze Dragon|Des Koala|Des Volstgalph|Destiny End Dragoon|Destiny HERO - Dunker|Destruction Ring|Destructive Draw|Detonator Circle A|Divine Dragon - Excelion|Doppelganger|Dora of Fate|Dragon's Gunfire|Earthbound Immortal Aslla piscu|Earthbound Immortal Ccapac Apu|Earthbound Immortal Chacu Challhua|Ebon Magician Curran|Edge Hammer|Elemental HERO Flame Wingman|Elemental HERO Lady Heat|Elemental HERO Shining Flare Wingman|Elephant Statue of Disaster|Everliving Underworld Cannon|Evil Blast|Evil HERO Infernal Sniper|Evil Thorn|Exploder Dragonwing|Exxod, Master of The Guard|Final Flame|Fire Darts|Fire Princess|Fire Sorcerer|Fire Trooper|Flame Spirit Ignis|Flamvell Commando|Flamvell Dragnov|Flying Fortress SKY FIRE|Fortune Lady Earth|Fortune Lady Fire|Fossil Tusker|Fuhma Shuriken|Full Salvo|Gallis the Star Beast|Gem Flash Energy|Giant Germ|Gladiator Beast Gaiodiaz|Goblin Thief|Grand Convergence|Grave Ohja|Gravekeeper's Cannonholder|Gravekeeper's Curse|Graverobber's Retribution|Hamon, Lord of Striking Thunder|Hate Buster|Hinotama|Hyper Psychic Blaster Assault Mode|Inferno|Inferno Fire Blast|Iron Chain Blaster|Iron Chain Repairman|Jenis, Lightsworn Mender|Jigen Bakudan|Jinzo - Lord|Judgment of Anubis|Junk Barrage|Just Desserts|KA-2 Des Scissors|King Pyron|Kozaky's Self-Destruct Button|Lady Assailant of Flames|Lava Golem|Legendary Black Belt|Linear Accelerator Cannon|Magic Cylinder|Magical Blast|Magical Explosion|Man-Thro' Tro'|Marshmallon|Mask of the Accursed|Masked Chopper|Mass Driver|Mecha Bunny|Mecha-Dog Marron|Memory Crusher|Meteor Flare|Meteor of Destruction|Minar|Mine Golem|Minefield Eruption|Minor Goblin Official|Mirage Tube|Misfortune|Morphtronic Clocken|Morphtronic Datatron|Natural Disaster|Needle Burrower|Neo-Spacian Aqua Dolphin|Neo-Spacian Marine Dolphin|Neos Force|Neos Wiseman|Nightmare Wheel|Nimble Musasabi|Nitro Unit|Ominous Fortunetelling|Ookazi|Paralyzing Chain|Phantom Beast Rock-Lizard|Phantom Skyblaster|Phoenixian Cluster Amaryllis|Poison Mummy|Poison of the Old Man|Princess Curran|Princess of Tsurugi|Psi-Curse|Pursuit Chaser|Rapid-Fire Magician|Reflect Bounder|Restructer Revolution|Ring of Destruction|Roar of the Earthbound Immortal|Rock Bombardment|Rose Tentacles|Royal Writ of Taxation|Secret Barrel|Seed Cannon|Seismic Crasher|Shadowpriestess of Ohm|Shinato, King of a Higher Plane|Skull Invitation|Solar Flare Dragon|Solar Ray|Soul of Fire|Sparks|Spell Reactor RE|Spell Shattering Arrow|Sphinx Teleia|Spirit Burner|Spiritual Fire Art - Kurenai|Stamping Destruction|Stealth Bird|Summon Reactor SK|Sun Dragon Inti|Super Conductor Tyranno|Supersonic Skull Flame|Synchronized Realm|Tempest Magician|The Agent of Judgment - Saturn|Thestalos the Firestorm Monarch|Thunder Crash|Token Feastevil|Toon Cannon Soldier|Trap Reactor Y FI|Tremendous Fire|Tri-Blaze Accelerator|Trojan Blast|Turbo Rocket|Tyler the Great Warrior|Type Zero Magic Crusher|Ultimate Baseball Kid|Updraft|Van'Dalgyon the Dark Dragon Lord|Venom Burn|Vicious Claw|Volcanic Doomfire|Volcanic Hammerer|Volcanic Queen|Volcanic Scattershot|Volcanic Slicer|Wave-Motion Cannon|White Potan|Winged Kuriboh LV10|Witch Doctor of Sparta|Woodland Sprite|Yubel|Yubel - Terror Incarnate|Yubel - The Ultimate Nightmare|Zoma the Spirit","hand_disruption":"Amazoness Chain Master|Appointer of the Red Lotus|Card Destruction|Cloudian - Altus|Confiscation|Crush Card Virus|D.D. Designator|Dangerous Machine Type-6|Dark Deal|Dark Red Enchanter|Deck Devastation Virus|Delinquent Duo|Don Zaloog|Dragged Down into the Grave|Dragon Queen of Tragic Endings|Drop Off|Eliminating the League|Eradicator Epidemic Virus|Exchange|Fengsheng Mirror|Fuh-Rin-Ka-Zan|Gambler of Legend|Gladiator Lash|Great Phantom Thief|Introduction to Gallantry|Jowgen the Spiritualist|Light of Judgment|Machina Fortress|Mazera DeVille|Mind Crush|Mind Haxorz|Mirage of Nightmare|Morphing Jar|Necklace of Command|Neo-Spacian Aqua Dolphin|Neo-Spacian Marine Dolphin|Reaper on the Nightmare|Reload|Robbin' Goblin|Secrets of the Gallant|Silpheed|Smoke Grenade of the Thief|Spell Vanishing|Spirit Reaper|Spiritual Water Art - Aoi|Terrible Deal|The Forceful Sentry|The Secret of the Bandit|Thestalos the Firestorm Monarch|Toon Gemini Elf|Trap Dustshoot|White Magical Hat|X-Saber Airbellum|X-Saber Urbellum|XX-Saber Gottoms","book":"Book of Moon|Tsukuyomi","searcher":"Ancient Fairy Dragon|Arcane Apprentice|Archfiend General|Arsenal Summoner|Assault Beast|Berfomet|Birdface|Black Whirlwind|Botanical Girl|Charge of the Light Brigade|Core Transport Unit|Cross Porter|D - Time|Dark General Freed|Dark Sage|Dark Scorpion - Meanae the Thorn|Destroyersaurus|Doctor Cranium|Dupe Frog|E - Emergency Call|Elemental HERO Captain Gold|Elemental HERO Stratos|Flamvell Dragnov|Flying Saucer Muusik'i|Fossil Dig|Freed the Matchless General|Fusion Sage|Gather Your Mind|Generation Shift|Gladiator Beast Samnite|Gladiator Beast Spartacus|Gladiator Proving Ground|Goblin Zombie|Gokipon|Gold Sarcophagus|Gravekeeper's Commandant|Green Gadget|Harpie Queen|Hecatrice|Infernity Archfiend|Iron Blacksmith Kotetsu|Jade Knight|Kid Guard|King of the Swamp|Koa'ki Meiru Boulder|Machina Defender|Machina Gearframe|Machina Peacekeeper|Manju of the Ten Thousand Hands|Morphtronic Forcefield|Morphtronic Remoten|Ocean's Keeper|Offering to the Immortals|Ojama Blue|Ojamagic|Oracle of the Sun|Oshaleon|Preparation of Rites|Rai-Mei|Rainbow Path|Raptor Wing Strike|Red Gadget|Reinforcement of the Army|Reptilianne Gardna|Sangan|Scarr, Scout of Dark World|Senju of the Thousand Hands|Sonic Bird|Spell Power Grasp|Sphere of Chaos|Summoner's Art|Swap Frog|Terraforming|The White Stone of Legend|Thunder Dragon|Toon Table of Contents|Violet Witch|Volcanic Shell|Warrior of Atlantis|Witch of the Black Forest|Woodland Archer|Worm Cartaros|XX-Saber Garsem|Yellow Gadget|Zeradias, Herald of Heaven","floodgate":"Ancient Gear Gadjiltron Dragon|Archlord Kristya|Banisher of the Radiance|Chain Energy|Cold Wave|Consecrated Light|Dimensional Fissure|Fossil Dyna Pachycephalo|Gravity Bind|Imperial Iron Wall|Jinzo|Jowgen the Spiritualist|King Tiger Wanghu|Koa'ki Meiru Drago|Kycoo the Ghost Destroyer|Lava Golem|Level Limit - Area B|Light-Imprisoning Mirror|Mask of Restrict|Messenger of Peace|Necrovalley|Nightmare Wheel|Prohibition|Rivalry of Warlords|Royal Decree|Royal Oppression|Shadow-Imprisoning Mirror|Skill Drain|Soul Release|Spell Canceller|Thousand-Eyes Restrict|Thunder King Rai-Oh|Vanity's Fiend|Wall of Revealing Light|Xing Zhen Hu|Zombie World","flip":"4-Starred Ladybug of Doom|A Cat of Ill Omen|Alien Grey|An Owl of Luck|Armed Ninja|Arsenal Summoner|Aussa the Earth Charmer|Batteryman Micro-Cell|Big Eye|Bite Shoes|Bombardment Beetle|Brain Jacker|Bubonic Vermin|Castle of Dark Illusions|Cobra Jar|Crimson Ninja|Crystal Seer|Cyber Jar|DUCKER Mobile Cannon|Dark Cat with White Tail|Dark Mimic LV1|Dark-Eyes Illusionist|Dekoichi the Battlechanted Locomotive|Des Feral Imp|Des Koala|Desertapir|Dharc the Dark Charmer|Dice Jar|Dimension Jar|Dragon Manipulator|Dragon Piper|Dummy Golem|Eria the Water Charmer|Fiber Jar|Fire Sorcerer|Gadget Arms|Gale Lizard|Gravekeeper's Guard|Gravekeeper's Spy|Gravitic Orb|Greenkappa|Guard Dog|Hade-Hane|Hane-Hane|Hiita the Fire Charmer|Hiro's Shadow Scout|Invader of the Throne|Iron Blacksmith Kotetsu|Jigen Bakudan|Jowls of Dark Demise|Lady Assailant of Flames|Machina Defender|Magical Merchant|Magical Plant Mandragola|Magician of Faith|Magnetic Mosquito|Man-Eater Bug|Mask of Darkness|Morphing Jar|Morphing Jar 2|Mysterious Guard|Needle Worm|Night Assailant|Nobleman-Eater Bug|Old Vindictive Magician|Parasite Paracide|Penguin Soldier|Phantom Cricket|Poison Mummy|Princess of Tsurugi|Rafflesia Seduction|Reaper of the Cards|Rigorous Reaver|Rinyan, Lightsworn Rogue|Ryko, Lightsworn Hunter|Searchlightman|Shadow Tamer (Archfiend)|Skelengel|Slate Warrior|Snowman Eater|Sonic Jammer|Spear Cretin|Spirit Caller|Summoner of Illusions|Super-Nimble Mega Hamster|Supply|The Immortal of Thunder|The Stern Mystic|Tornado Bird|Trap Master|Wall of Ivy|Weather Report|Whirlwind Weasel|White Ninja|Witch Doctor of Chaos|Worm Apocalypse|Worm Cartaros|Worm Dimikles|Wynn the Wind Charmer","mill":"Archfiend's Oath|Armageddon Knight|Aurkus, Lightsworn Druid|Card Destruction|Card Trooper|Celestia, Lightsworn Angel|Charge of the Light Brigade|Colossal Fighter Assault Mode|Conscription|Crystal Seer|Dark Grepher|Destiny HERO - Diamond Dude|Ehren, Lightsworn Monk|Elemental HERO Prisma|Enchanting Fitting Room|Featherizer|Foolish Burial|Future Fusion|Garoth, Lightsworn Warrior|Glorious Illusion|Graceful Charity|Gragonith, Lightsworn Dragon|Hero Mask|Iron Chain Dragon|Jain, Lightsworn Paladin|Lightsworn Barrier|Lumina, Lightsworn Summoner|Lyla, Lightsworn Sorceress|Magical Merchant|Monster Gate|Morphing Jar 2|Needlebug Nest|Next to be Lost|Reasoning|Rock Bombardment|Ryko, Lightsworn Hunter|Scrap Recycler|Shire, Lightsworn Spirit|Skreech|Solar Recharge|Sunlight Unicorn|Swap Frog|Venom Shot","tuner":"Alien Ammonite|Arcane Apprentice|Black Salvo|Blackwing - Blizzard the Far North|Blackwing - Gale the Whirlwind|Blackwing - Mistral the Silver Shield|Blackwing - Vayu the Emblem of Honor|Chaos-End Master|Comrade Swordsman of Landstar|Copy Plant|Counselor Lily|Cryomancer of the Ice Barrier|Dark Resonator|Dark Tinker|Debris Dragon|Deep Sea Diva|Drill Synchron|Eccentric Boy|Emissary from Pandemonium|Fire Ant Ascator|Fishborg Blaster|Flamvell Guard|Flamvell Magician|Frequency Magician|Hanewata|Herald of Orange Light|Hyper Synchron|Iron Chain Coil|Junk Synchron|Jutte Fighter|Krebons|Magna Drago|Majestic Dragon|Mind Master|Mist Valley Shaman|Mist Valley Soldier|Morphtronic Remoten|Morphtronic Scopen|Nettles|Night's End Sorcerer|Nitro Synchron|Plaguespreader Zombie|Psychic Commander|Psychic Jumper|Quickdraw Synchron|Reptilianne Viper|Road Synchron|Rose, Warrior of Revenge|Royal Swamp Eel|Shiba-Warrior Taro|Sinister Sprocket|Stygian Security|Sunny Pixie|Supay|Sword Master|The White Stone of Legend|Torapart|Trap Eater|Turbo Rocket|Turbo Synchron|Twilight Rose Knight|Witch of the Black Rose|X-Saber Airbellum|XX-Saber Fulhelmknight","gy_effect":"Arcane Apprentice|Archfiend of Gilfer|Beast of the Pharaoh|Beiige, Vanguard of Dark World|Black Ptera|Blackwing - Vayu the Emblem of Honor|Botanical Girl|Broww, Huntsman of Dark World|Burning Algae|Cockroach Knight|Counselor Lily|Cross Porter|Dandylion|Dark Necrofear|Dark Nephthys|Dark Simorgh|Dark Verger|Deepsea Macrotrema|Destiny End Dragoon|Destiny HERO - Dasher|Destiny HERO - Departed|Destiny HERO - Fear Monger|Destiny HERO - Malicious|Djinn Cursenchanter of Rituals|Djinn Disserere of Rituals|Djinn Presider of Rituals|Djinn Prognosticator of Rituals|Djinn Releaser of Rituals|Dragon Queen of Tragic Endings|Dupe Frog|Electric Snake|Emissary of the Afterlife|Fishborg Blaster|Flamvell Dragnov|Fox Fire|Genesis Dragon|Goldd, Wu-Lord of Dark World|Gren, Tactician of Dark World|Hyper Synchron|Infernal Dragon|Informer Spider|Jinzo - Returner|Kahkki, Guerilla of Dark World|Kryuel|Level Eater|Machina Fortress|Magicat|Makyura the Destructor|Malice Doll of Demise|Manticore of Darkness|Masked Beast Des Gardius|Mezuki|Necro Gardna|Nitro Synchron|Oyster Meister|Peten the Dark Clown|Phoenixian Cluster Amaryllis|Pixie Knight|Plaguespreader Zombie|Quillbolt Hedgehog|Radiant Jeral|Red-Eyes Wyvern|Reign-Beaux, Overlord of Dark World|Sacred Phoenix of Nephthys|Samsara Lotus|Sangan|Shield Warrior|Shiny Black C|Sillva, Warlord of Dark World|Sinister Serpent|Sinister Sprocket|Skull-Mark Ladybug|Spear Cretin|Stardust Dragon Assault Mode|Stardust Xiaolong|Sunny Pixie|Supay|Supersonic Skull Flame|The Immortal Bushi|The Immortal of Thunder|The Unhappy Maiden|The White Stone of Legend|Totem Dragon|Treeborn Frog|Tuningware|Vampire Lord|Volcanic Counter|Volcanic Scattershot|Witch of the Black Forest|Wulf, Lightsworn Beast|Zeta Reticulant","floater":"Card Trooper|Dandylion|Elemental HERO Absolute Zero|Flying Kamakiri 1|Giant Germ|Giant Rat|Goblin Zombie|Howling Insect|Hyena|Machina Peacekeeper|Masked Dragon|Mother Grizzly|Mystic Tomato|Nimble Momonga|Nova Summoner|Pyramid Turtle|Sangan|Shien's Footsoldier|Shining Angel|Stygian Security|Troop Dragon|UFO Turtle|Warrior Lady of the Wasteland|XX-Saber Emmersblade","fodder":"Arcana Force VI - The Lovers|Arcana Force XVIII - The Moon|Bamboo Scrap|Black Garden|Blockman|Blue Thunder T-45|Cactus Fighter|Cloning|Cloudian - Sheep Cloud|Cobra Jar|Damage Translation|Dandylion|Des Dendle|Destiny HERO - Double Dude|Destiny HERO - Malicious|Double Coston|Earth Effigy|Exiled Force|Fiend's Sanctuary|Fiendish Engine Omega|Fires of Doomsday|Flame Ruler|Gellenduo|Goka, the Pyre of Malice|Grinder Golem|Horseytail|Insect Queen|Jam Breeding Machine|Kaiser Sea Horse|Lekunga|Limit Impulse|Lord British Space Fighter|Metabo Globster|Multiplication of Ants|Multiply|Mystik Wok|Nightmare Archfiends|Offering to the Immortals|Ojama Trio|Oyster Meister|Phantasmal Martyrs|Phantom Skyblaster|Physical Double|Raviel, Lord of Phantasms|Regenerating Rose|Reptilianne Spawn|Revival Gift|Rockstone Warrior|Sangan|Scapegoat|Seed of Flame|Sinister Seeds|Sinister Serpent|Soul Exchange|Spider Egg|Statue of the Wicked|Stray Lambs|Substitoad|Synthetic Seraphim|Thunder Dragon|Token Feastevil|Totem Dragon|Treeborn Frog|Tricky Spell 4|Vicious Claw|Victory Viper XX03|Wall of Ivy|Wild Fire|Wind Effigy|Worm Bait|Zeta Reticulant","draw":"7|Accumulated Fortune|Advance Draw|Airknight Parshath|Alchemy Cycle|Alien Grey|Allure of Darkness|Arcane Barrier|Assault Teleport|At One With the Sword|Avatar of The Pot|Batteryman Micro-Cell|Bee List Soldier|Blizzed, Defender of the Ice Barrier|Bountiful Artemis|Break! Draw!|Broww, Huntsman of Dark World|Card Trader|Cards of Consonance|Chaos Greed|Common Charity|Convert Contact|Core Compression|Cup of Ace|Cyber Archfiend|Cyber Jar|Cyber Valley|Dangerous Machine Type-6|Dark Mimic LV1|Dark Mimic LV3|Dark Spirit Art - Greed|Darknight Parshath|Defense Draw|Dekoichi the Battlechanted Locomotive|Des Lacooda|Destiny Draw|Destiny HERO - Diamond Dude|Destiny HERO - Disk Commander|Diamond-Dust Cyclone|Electric Snake|Evil HERO Infernal Prodigy|Fifth Hope|Fish Depth Charge|Flame Ogre|Fortune Lady Water|Fortune's Future|Fragrance Storm|Garoth, Lightsworn Warrior|Gemini Imps|Gemini Spark|Gladiator Beast's Respite|Gladiator's Return|Golden Bamboo Sword|Good Goblin Housekeeping|Graceful Charity|Greed Grado|Guard Penalty|Heart of the Underdog|Heavy Slump|Helping Robo for Combat|Hero Medal|Iris, the Earth Mother|Ivy Shackles|Jar of Greed|Kuraz the Light Monarch|Legacy of Yata-Garasu|Lighten the Load|Lucky Chance|Lucky Cloud|Lucky Iron Axe|Lucky Pied Piper|Mad Reloader|Magic Planter|Majestic Mech - Senku|Masked Sorcerer|Mirage of Nightmare|Mirror of Oaths|Molten Zombie|Monster Recovery|Moray of Greed|Morphing Jar|Neo-Parshath, the Sky Paladin|Neo-Spacian Twinkle Moss|Nitro Synchron|Oilman|Pot of Avarice|Pot of Greed|Precious Cards from Beyond|Pride of the Weak|Psychic Overload|Reckless Greed|Rinyan, Lightsworn Rogue|Royal Firestorm Guards|Royal Magical Library|Sacred Crane|Scrap Recycler|Shutendoji|Six Samurai United|Skelengel|Sky Scourge Norleras|Solar Recharge|Space Gift|Spiral Spear Strike|Spirit of the Six Samurai|Supercharge|Tempest Magician|Tethys, Goddess of Light|The Agent of Wisdom - Mercury|The Beginning of the End|Tongue Twister|Toon Masked Sorcerer|Trade-In|Treasure Map|Trojan Gladiator Beast|Tuningware|Upstart Goblin|Vengeful Shinobi|Vortex Trooper|Witch of the Black Rose|X-Saber Axel|Yamata Dragon","recruiter":"Blackwing - Shura the Blue Flame|Deep Sea Diva|Flying Kamakiri 1|Giant Germ|Giant Rat|Gravekeeper's Spy|Howling Insect|Hyena|Last Will|Lonefire Blossom|Machina Armored Unit|Masked Dragon|Monster Gate|Mother Grizzly|Mystic Tomato|Nimble Momonga|Nova Summoner|One for One|Pyramid Turtle|Reasoning|Rescue Cat|Shien's Footsoldier|Shining Angel|Stygian Security|Substitoad|Summoner Monk|Super-Nimble Mega Hamster|Troop Dragon|UFO Turtle|Warrior Lady of the Wasteland|XX-Saber Emmersblade","recursion":"A Feather of the Phoenix|Ambulanceroid|Beckoning Light|Behemoth the King of All Animals|Burial from a Different Dimension|Dark Magician of Chaos|Dimensional Alchemist|Drill Warrior|Elemental HERO Ocean|Genesis Dragon|Gladiator Beast Equeste|Hero Blast|Izanami|Koa'ki Meiru Crusader|Lich Lord, King of the Underworld|Magician of Faith|Mask of Darkness|Mind Trust|Moja|Monster Reincarnation|Morphtronic Remoten|Night Assailant|Pot of Avarice|Preparation of Rites|Quick Charger|Return Zombie|Salvage|Sinister Serpent|Skull Flame|Spell Reproduction|Spirit Force|XX-Saber Ragigura","buff":"A Legendary Ocean|Big Bang Shot|Blackwing - Gale the Whirlwind|Blackwing - Kalut the Moon Shadow|Honest|Limiter Removal|Megamorph|Shrink|Solidarity|United We Stand","summon_enabler":"Advanced Ritual Art|Ascending Soul|Black Illusion Ritual|Black Luster Ritual|Black Magic Ritual|Branch!|Chain Material|Chthonian Polymer|Commencement Dance|Contract with the Abyss|Contract with the Dark Master|Curse of the Masked Beast|Cyber-Stein|Cyberdark Impact!|Dark Calling|Dark Fusion|De-Fusion|Doriado's Blessing|Dragon's Mirror|Earth Chant|Emblem of the Awakening|End of the World|Final Ritual of the Ancients|Fortress Whale's Oath|Fusion Gate|Fusion Recovery|Fusion Sage|Future Fusion|Garma Sword Oath|Hamburger Recipe|Incandescent Ordeal|Instant Fusion|Javelin Beetle Pact|Metamorphosis|Miracle Fusion|NEX|Non-Fusion Area|Novox's Prayer|Overload Fusion|Polymerization|Power Bond|Revival of Dokurorider|Revoke Fusion|Ritual Buster|Ritual Foregone|Ritual of Destruction|Ritual of Grace|Samsara|Shinato's Ark|Skilled Dark Magician|Super Polymerization|Synthesis Spell|Turtle Oath|War-Lion Ritual|White Dragon Ritual|Zera Ritual","position_change":"Enemy Controller","battle_recruiter":"Flying Kamakiri 1|Giant Germ|Giant Rat|Howling Insect|Hyena|Masked Dragon|Mother Grizzly|Mystic Tomato|Nimble Momonga|Nova Summoner|Pyramid Turtle|Shien's Footsoldier|Shining Angel|Stygian Security|Troop Dragon|UFO Turtle|Warrior Lady of the Wasteland|XX-Saber Emmersblade"},"goat":{"draw":"7|Airknight Parshath|Avatar of The Pot|Chaos Greed|Cyber Jar|Dark Mimic LV1|Dark Mimic LV3|Dekoichi the Battlechanted Locomotive|Des Lacooda|Electric Snake|Good Goblin Housekeeping|Graceful Charity|Heart of the Underdog|Heavy Slump|Helping Robo for Combat|Jar of Greed|Lighten the Load|Masked Sorcerer|Mirage of Nightmare|Molten Zombie|Monster Recovery|Morphing Jar|Pot of Greed|Precious Cards from Beyond|Reckless Greed|Royal Magical Library|Sacred Crane|Spiral Spear Strike|The Agent of Wisdom - Mercury|Toon Masked Sorcerer|Upstart Goblin|Yamata Dragon","mill":"Archfiend's Oath|Card Destruction|Enchanting Fitting Room|Graceful Charity|Magical Merchant|Monster Gate|Morphing Jar #2|Reasoning|Rock Bombardment","mass_removal":"4-Starred Ladybug of Doom|7|A Wingbeat of Giant Dragon|Acid Rain|Anti Raigeki|Archlord Zerato|Armed Dragon LV7|Big Wave Small Wave|Blast Held by a Tribute|Blind Destruction|Burst Breath|Burst Stream of Destruction|Byser Shock|Card of Sanctity|Chain Destruction|Chaos Emperor Dragon - Envoy of the End|Chaos End|Chosen One|Cyber Jar|Dark Dust Spirit|Dark Hole|Dark Magic Attack|Dark Master - Zorc|Dark Mirror Force|Deck Devastation Virus|Destiny Board|Diffusion Wave-Motion|Disarmament|Dragon Piper|Elemental Burst|Eternal Rest|Exile of the Wicked|Final Destiny|Fuh-Rin-Ka-Zan|Fushioh Richie|Gatling Dragon|Giant Trunade|Gigantes|Great Dezard|Gryphon Wing|Gryphon's Feather Duster|Guardian Sphinx|Harpie's Feather Duster|Heavy Storm|Huge Revolution|Jigen Bakudan|Lady Ninja Yae|Legendary Flame Lord|Levia-Dragon - Daedalus|Lightning Vortex|Major Riot|Malice Dispersion|Mega Ton Magical Cannon|Minefield Eruption|Mirror Force|Mispolymerization|Moisture Creature|Needle Ceiling|Ocean Dragon Lord - Neo-Daedalus|Ojama Delta Hurricane!!|Raigeki|Really Eternal Rest|Reversal Quiz|Sacred Phoenix of Nephthys|Sand Gambler|Special Hurricane|Spell Purification|Spell Vanishing|Swords of Concealing Light|The First Sarcophagus|The Law of the Normal|Thousand Energy|Thunder Crash|Time Wizard|Token Feastevil|Token Thanksgiving|Torrential Tribute|Tragedy|Triangle Power|Tribe-Infecting Virus","steal":"Aussa the Earth Charmer|Brain Control|Brain Jacker|Change of Heart|Creature Swap|Dark Necrofear|Dragon Manipulator|Enemy Controller|Eria the Water Charmer|Falling Down|Hiita the Fire Charmer|Jowls of Dark Demise|Lava Golem|Mind Control|Possessed Dark Soul|Rafflesia Seduction|Reshef the Dark Being|Shadow Tamer|Snatch Steal|Union Rider|Wynn the Wind Charmer","spot_backrow":"Arcane Archer of the Forest|Armed Ninja|Aswan Apparition|Breaker the Magical Warrior|Burning Beast|Chiron the Mage|Crimson Ninja|Curse of Royal|Dark Scorpion - Cliff the Trap Remover|De-Spell|Driving Snow|Dust Tornado|Fairy Guardian|Freed the Matchless General|Freezing Beast|Gust|Mobius the Frost Monarch|Mystical Space Typhoon|Nobleman of Extermination|Nubian Guard|Orca Mega-Fortress of Darkness|Phoenix Wing Wind Blast|Raigeki Break|Rod of Silence - Kay'est|Spiritualism|Stamping Destruction|Swarm of Locusts|XY-Dragon Cannon|XZ-Tank Cannon","spot_monster":"Abyss Soldier|Armed Dragon LV5|Barrel Dragon|Black Luster Soldier - Envoy of the Beginning|Blade Rabbit|Blast Magician|Blowback Dragon|Book of Life|Bottomless Shifting Sand|Bottomless Trap Hole|Chaos Sorcerer|Compulsory Evacuation Device|Continuous Destruction Punch|Crass Clown|Cross Counter|D.D. Assailant|D.D. Warrior Lady|Dark Core|Dark Master - Zorc|Des Kangaroo|Destruction Punch|Destruction Ring|Disc Fighter|Divine Wrath|Dragon Seeker|Elemental HERO Thunder Giant|Exiled Force|Freed the Brave Wanderer|Gale Lizard|Gearfried the Swordmaster|Getsu Fuhma|Golem Sentry|Gravekeeper's Guard|Guardian Ceal|Guardian Statue|Hammer Shot|Horn of Heaven|Judgment of Anubis|Kaiser Glider|Kaminote Blow|Kryuel|Legendary Jujitsu Master|Magical Marionette|Man-Eater Bug|Medusa Worm|Michizure|Mysterious Guard|Mystic Swordsman LV2|Mystic Swordsman LV4|Mystic Swordsman LV6|Needle Wall|Newdoria|Night Assailant|Ninja Grandmaster Sasuke|Nobleman of Crossout|Offerings to the Doomed|Old Vindictive Magician|Orca Mega-Fortress of Darkness|Order to Charge|Paladin of White Dragon|Phoenix Wing Wind Blast|Pole Position|Raigeki Break|Relinquished|Ring of Destruction|Roulette Barrel|Ryu Kokki|Sakuretsu Armor|Sasuke Samurai|Skull Lair|Smashing Ground|Swarm of Scarabs|Sword of Dragon's Soul|Thousand Knives|Thousand Needles|Thousand-Eyes Restrict|Throwstone Unit|Trap Hole|Tribute to the Doomed|Two Thousand Needles|Widespread Ruin|YZ-Tank Dragon|Yomi Ship|Zaborg the Thunder Monarch","burn":"Abare Ushioni|Amazoness Archer|Ameba|Andro Sphinx|Anti-Aircraft Flower|Attack and Receive|Backfire|Bad Reaction to Simochi|Barrel Behind the Door|Black Pendant|Blast Held by a Tribute|Blasting the Ruins|Bowganian|Cannon Soldier|Catapult Turtle|Ceasefire|Cemetary Bomb|Chaos Emperor Dragon - Envoy of the End|Cobra Jar|Coffin Seller|D.D. Dynamite|Dark Room of Nightmare|Des Koala|Des Volstgalph|Destruction Ring|Dora of Fate|Dragon's Gunfire|Elemental HERO Flame Wingman|Elephant Statue of Disaster|Final Flame|Fire Princess|Fire Sorcerer|Fuhma Shuriken|Giant Germ|Goblin Thief|Grave Ohja|Gravekeeper's Cannonholder|Gravekeeper's Curse|Graverobber's Retribution|Hinotama|Inferno|Inferno Fire Blast|Jigen Bakudan|Judgment of Anubis|Just Desserts|KA-2 Des Scissors|Kozaky's Self-Destruct Button|Lady Assailant of Flames|Lava Golem|Legendary Black Belt|Magic Cylinder|Man-Thro' Tro'|Mask of the Accursed|Mass Driver|Mecha-Dog Marron|Meteor of Destruction|Minar|Mine Golem|Minefield Eruption|Minor Goblin Official|Needle Burrower|Nightmare Wheel|Nitro Unit|Ominous Fortunetelling|Ookazi|Poison Mummy|Poison of the Old Man|Princess of Tsurugi|Reflect Bounder|Restructer Revolution|Ring of Destruction|Rock Bombardment|Secret Barrel|Shinato, King of a Higher Plane|Skull Invitation|Solar Flare Dragon|Solar Ray|Sparks|Sphinx Teleia|Stamping Destruction|Stealth Bird|The Agent of Judgment - Saturn|Thestalos the Firestorm Monarch|Thunder Crash|Token Feastevil|Toon Cannon Soldier|Tremendous Fire|Type Zero Magic Crusher|Ultimate Baseball Kid|Wave-Motion Cannon|Woodland Sprite","beatstick":"Abyss Soldier|Airknight Parshath|Armor Exe|Arsenal Bug|Asura Priest|Bazoo the Soul-Eater|Berserk Gorilla|Black Skull Dragon|Blade Knight|Blindly Loyal Goblin|Boar Soldier|Breaker the Magical Warrior|Cave Dragon|Chiron the Mage|Cipher Soldier|Cyber Harpie Lady|D.D. Survivor|D.D. Warrior Lady|Dark Elf|Dark Zebra|Don Zaloog|Exodia Necross|Fiend Skull Dragon|Flash Assailant|Gagagigo|Gaia Soul the Combustible Collective|Gearfried the Iron Knight|Giant Orc|Gigantes|Goblin Attack Force|Granadora|Gyaku-Gire Panda|Homunculus the Alchemic Being|Hysteric Fairy|Injection Fairy Lily|Jinzo|Jirai Gumo|Kycoo the Ghost Destroyer|Master of Oz|Mataza the Zapper|Mobius the Frost Monarch|Mystic Swordsman LV4|Ninja Grandmaster Sasuke|Nuvia the Wicked|Paladin of White Dragon|Rare Metal Dragon|Regenerating Mummy|Ryu Kokki|Shadowknight Archfiend|Slate Warrior|Spear Dragon|St. Joan|Susa Soldier|Terrorking Archfiend|The Bistro Butcher|The Unfriendly Amazon|Thousand Dragon|Thunder Nyan Nyan|Toon Gemini Elf|Toon Goblin Attack Force|Tribe-Infecting Virus|Twin-Headed Thunder Dragon|Vampire Lord|Zaborg the Thunder Monarch|Zombyra the Dark","boss":"Airknight Parshath|Black Luster Soldier - Envoy of the Beginning|Chaos Emperor Dragon - Envoy of the End|Chaos Sorcerer|Dark Magician of Chaos|Exodia the Forbidden One|Jinzo|Sacred Phoenix of Nephthys|Thousand-Eyes Restrict|Vampire Lord","wall":"A Feint Plan|Amazoness Fighter|Array of Revealing Light|B.E.S. Big Core|Banisher of the Light|Big Shield Gardna|Burst Stream of Destruction|Catapult Turtle|Charm of Shabti|Cocoon of Evolution|Criosphinx|Curse of Anubis|D.D. Assailant|Dark Necrofear|Dark Sage|Dark Spirit of the Silent|Des Dendle|Des Wombat|Despair from the Dark|Different Dimension Dragon|Diffusion Wave-Motion|Dragon Capture Jar|Dragon Seeker|Draining Shield|Earthquake|Ekibyo Drakmord|Emissary of the Oasis|Exodia Necross|Fushioh Richie|Gear Golem the Moving Fortress|Giant Axe Mummy|Giant Soldier of Stone|Grave Protector|Gravity Bind|Great Dezard|Guardian Sphinx|Harpie Lady Sisters|Harpie's Pet Dragon|Hino-Kagu-Tsuchi|Inferno Fire Blast|Insect Barrier|Kaiser Glider|Kuriboh|Legendary Jujitsu Master|Level Limit - Area B|Magic Cylinder|Maiden of the Aqua|Manga Ryu-Ran|Mask of the Accursed|Messenger of Peace|Moai Interceptor Cannons|Moisture Creature|Monk Fighter|Paralyzing Potion|Prickle Fairy|Pumpking the King of Ghosts|Raregold Armor|Royal Magical Library|Sakuretsu Armor|Scapegoat|Serpentine Princess|Shadow Spell|Skull Guardian|Spellbinding Circle|Sphinx Teleia|Spirit Barrier|Spirit Reaper|Stone Statue of the Aztecs|Swords of Concealing Light|Swords of Revealing Light|The Creator|The Forgiving Maiden|The Regulation of Tribe|Thousand-Eyes Restrict|Threatening Roar|Throwstone Unit|Tornado Wall|Tribute Doll|Valkyrion the Magna Warrior|Vengeful Bog Spirit|Waboku|Wall Shadow|Wall of Revealing Light|Winged Kuriboh|Yamata Dragon","floodgate":"Chain Energy|Cold Wave|Dark Blade the Dragon Knight|Gravity Bind|Jinzo|Jowgen the Spiritualist|King Tiger Wanghu|Kycoo the Ghost Destroyer|Lava Golem|Level Limit - Area B|Mask of Restrict|Messenger of Peace|Necrovalley|Nightmare Wheel|Ojama King|Prohibition|Rivalry of Warlords|Royal Decree|Royal Oppression|Skill Drain|Soul Release|Spell Canceller|The Last Warrior from Another Planet|Thousand-Eyes Restrict|Wall of Revealing Light|Xing Zhen Hu","floater":"Dark Flare Knight|Flying Kamakiri #1|Giant Germ|Giant Rat|Howling Insect|Hyena|Masked Dragon|Mother Grizzly|Mystic Tomato|Nimble Momonga|Pyramid Turtle|Sangan|Shining Angel|Troop Dragon|UFO Turtle","searcher":"Arsenal Summoner|Birdface|Dark Sage|Dark Scorpion - Meanae the Thorn|Freed the Matchless General|Fusion Sage|Gather Your Mind|Iron Blacksmith Kotetsu|King of the Swamp|Manju of the Ten Thousand Hands|Reinforcement of the Army|Sangan|Senju of the Thousand Hands|Sonic Bird|Terraforming|Thunder Dragon|Toon Table of Contents|Witch of the Black Forest","gy_effect":"Burning Algae|Cockroach Knight|Dark Necrofear|Electric Snake|Emissary of the Afterlife|Fox Fire|Kryuel|Makyura the Destructor|Malice Doll of Demise|Manticore of Darkness|Peten the Dark Clown|Pixie Knight|Sacred Phoenix of Nephthys|Sangan|Sinister Serpent|Skull-Mark Ladybug|Spear Cretin|The Immortal of Thunder|The Unhappy Maiden|Vampire Lord|Witch of the Black Forest","fodder":"Cobra Jar|Des Dendle|Double Coston|Exiled Force|Flame Ruler|Jam Breeding Machine|Kaiser Sea Horse|Lekunga|Multiplication of Ants|Mystik Wok|Ojama Trio|Physical Double|Sangan|Scapegoat|Sinister Serpent|Soul Exchange|Statue of the Wicked|Stray Lambs|Thunder Dragon|Token Feastevil","hand_disruption":"Amazoness Chain Master|Card Destruction|Confiscation|D.D. Designator|Deck Devastation Virus|Delinquent Duo|Don Zaloog|Dragged Down into the Grave|Drop Off|Exchange|Fengsheng Mirror|Fuh-Rin-Ka-Zan|Great Phantom Thief|Jowgen the Spiritualist|Light of Judgment|Mazera DeVille|Mind Crush|Mind Haxorz|Mirage of Nightmare|Morphing Jar|Necklace of Command|Reaper on the Nightmare|Reload|Robbin' Goblin|Silpheed|Smoke Grenade of the Thief|Spell Vanishing|Spirit Reaper|The Forceful Sentry|The Secret of the Bandit|Thestalos the Firestorm Monarch|Toon Gemini Elf|Trap Dustshoot|White Magical Hat","negation":"A-Team: Trap Disposal Unit|Amplifier|Ancient Gear Beast|Anti Raigeki|Anti-Spell|Armor Break|Armored Glass|Bait Doll|Call of the Grave|Chaos Command Magician|Curse of Royal|Cursed Seal of the Forbidden Spell|Dark Balter the Terrible|Dark Paladin|Dark Ruler Ha Des|Darkbishop Archfiend|Desrook Archfiend|Divine Wrath|Element Doom|Element Saurus|Element Soldier|Fiend Skull Dragon|Fushioh Richie|Gora Turtle of Illusion|Gravekeeper's Watcher|Great Dezard|Gryphon Wing|Guardian Baou|Harpie Lady 2|Horn of Heaven|Horus the Black Flame Dragon LV8|Infernalqueen Archfiend|Jar Robber|Judgment of Anubis|Magic Drain|Magic Jammer|Maryokutai|Mid Shield Gardna|My Body as a Shield|Rare Metalmorph|Riryoku Field|Royal Oppression|Royal Surrender|Ryu Senshi|Seven Tools of the Bandit|Shadowknight Archfiend|Skull Archfiend of Lightning|Solemn Judgment|Sorcerer of Dark Magic|Spell Shield Type-8|Spell Vanishing|Spell-Stopping Statute|Terrorking Archfiend|The Dragon's Bead|Trap Jammer|Trap of Board Eraser|Tutan Mask|Twin-Headed Wolf|Vilepawn Archfiend|Wicked-Breaking Flamberge - Baou","revival":"Agido|Archfiend's Roar|Autonomous Action Unit|Battery Charger|Book of Life|Call of the Haunted|Dimension Fusion|Fulfillment of the Contract|Fushioh Richie|Gravekeeper's Chief|Lord Poison|Miracle Restoring|Mokey Mokey King|Monster Reborn|Premature Burial|Re-Fusion|Return from the Different Dimension|Rite of Spirit|Spirit Caller|Spirit of the Pharaoh|The Creator|The Puppet Magic of Dark Ruler|The Shallow Grave|Vampire Genesis","book":"Book of Moon|Tsukuyomi","protection":"King Dragun|My Body as a Shield|Spirit Barrier","recursion":"A Feather of the Phoenix|Beckoning Light|Behemoth the King of All Animals|Dark Magician of Chaos|Magician of Faith|Mask of Darkness|Monster Reincarnation|Night Assailant|Salvage|Sinister Serpent|Spell Reproduction","flip":"4-Starred Ladybug of Doom|A Cat of Ill Omen|An Owl of Luck|Armed Ninja|Arsenal Summoner|Aussa the Earth Charmer|Big Eye|Bite Shoes|Bombardment Beetle|Brain Jacker|Bubonic Vermin|Castle of Dark Illusions|Cobra Jar|Crimson Ninja|Cyber Jar|Dark Cat with White Tail|Dark Mimic LV1|Dekoichi the Battlechanted Locomotive|Des Feral Imp|Des Koala|Desertapir|Dice Jar|Dimension Jar|Dragon Manipulator|Dragon Piper|Dummy Golem|Eria the Water Charmer|Fiber Jar|Fire Sorcerer|Gale Lizard|Gravekeeper's Guard|Gravekeeper's Spy|Greenkappa|Hade-Hane|Hane-Hane|Hiita the Fire Charmer|Hiro's Shadow Scout|Invader of the Throne|Iron Blacksmith Kotetsu|Jigen Bakudan|Jowls of Dark Demise|Lady Assailant of Flames|Magical Merchant|Magical Plant Mandragola|Magician of Faith|Man-Eater Bug|Mask of Darkness|Morphing Jar|Morphing Jar #2|Mysterious Guard|Needle Worm|Night Assailant|Nobleman-Eater Bug|Old Vindictive Magician|Parasite Paracide|Penguin Soldier|Poison Mummy|Princess of Tsurugi|Rafflesia Seduction|Reaper of the Cards|Shadow Tamer|Slate Warrior|Sonic Jammer|Spear Cretin|Spirit Caller|Summoner of Illusions|Supply|The Immortal of Thunder|The Stern Mystic|Tornado Bird|Trap Master|Weather Report|White Ninja|Witch Doctor of Chaos|Wynn the Wind Charmer","summon_enabler":"Black Illusion Ritual|Black Luster Ritual|Commencement Dance|Contract with the Abyss|Contract with the Dark Master|Curse of the Masked Beast|Cyber-Stein|De-Fusion|Doriado's Blessing|Earth Chant|Final Ritual of the Ancients|Fusion Gate|Fusion Sage|Hamburger Recipe|Incandescent Ordeal|Metamorphosis|Novox's Prayer|Polymerization|Revival of Dokurorider|Shinato's Ark|Skilled Dark Magician|Turtle Oath|White Dragon Ritual","recruiter":"Flying Kamakiri #1|Giant Germ|Giant Rat|Gravekeeper's Spy|Howling Insect|Hyena|Last Will|Masked Dragon|Monster Gate|Mother Grizzly|Mystic Tomato|Nimble Momonga|Pyramid Turtle|Reasoning|Rescue Cat|Shining Angel|Troop Dragon|UFO Turtle","battle_recruiter":"Flying Kamakiri #1|Giant Germ|Giant Rat|Howling Insect|Hyena|Masked Dragon|Mother Grizzly|Mystic Tomato|Nimble Momonga|Pyramid Turtle|Shining Angel|Troop Dragon|UFO Turtle","position_change":"Enemy Controller","buff":"A Legendary Ocean|Axe of Despair|Big Bang Shot|Limiter Removal|Mage Power|Megamorph|United We Stand","extender":"Armed Dragon LV3|Armed Dragon LV5|Decayed Commander|Gigantes|Gilasaurus|Great Dezard|Hand of Nephthys|Horus the Black Flame Dragon LV4|Horus the Black Flame Dragon LV6|Kaibaman|Last Will|Marauding Captain|Mystic Swordsman LV4|Paladin of White Dragon|Peten the Dark Clown|Pinch Hopper|Rescue Cat|Silent Magician LV4|Silent Swordsman LV3|Silent Swordsman LV5|Skilled White Magician|The Agent of Creation - Venus|The Creator Incarnate|The Fiend Megacyber|The Thing in the Crater|Ultimate Insect LV1|Ultimate Insect LV3|Ultimate Insect LV5|Ultimate Offering|Vampiric Orchis","hand_trap":"Kuriboh"}};
// ROLES:END
const ROLE_SETS = {}, NO_ROLES = new Set();
function roleMap() {
  const f = goat() ? 'goat' : 'edison';
  if (!ROLE_SETS[f]) { const m = new Map(), L = ROLE_LISTS[f] || {}; for (const r in L) for (const n of L[r].split('|')) { if (!m.has(n)) m.set(n, new Set()); m.get(n).add(r); } ROLE_SETS[f] = m; }
  return ROLE_SETS[f];
}
const rolesOf = n => roleMap().get(n) || NO_ROLES;
AI.roles = n => [...rolesOf(n)];
/* What a Spell or Trap the tables don't name is worth in hand, by its best role: mass removal is held for two or more
 cards, negation and steals for a real threat, so they are worth more than they cost to play on something small. */
const ST_ROLE_VALUE = { mass_removal: 1350, steal: 1300, negation: 1150, spot_monster: 1050, floodgate: 1000, book: 1000, revival: 1000,
  spot_backrow: 950, hand_disruption: 950, draw: 900, searcher: 900, protection: 900, wall: 900, position_change: 850, recursion: 850, buff: 800, burn: 800 };
/* What a monster's role adds on the field when the tables don't name it: a boss, a floodgate or a negating monster is the
 one removal is for; a floater, battle recruiter or fodder replaces itself or exists to be used up, so losing it costs less
 and it goes first as a Tribute or cost. */
const FIELD_ROLE = { boss: 300, floodgate: 400, negation: 250, floater: -150, battle_recruiter: -150, fodder: -150 };
/* The discounts (floater, fodder) apply to the opponent's cards only: they say "not worth a removal card". On my own
 side they would only make summoning a blocker look worse (2026-11-28 audit: it kept Destiny HERO - Malicious in hand on
 an empty field); my own fodder goes first as a cost through costRank instead. */
let EVAL_ME = null;
function roleFieldBonus(n, G, theirs) {
  const R = rolesOf(n); if (!R.size) return 0;
  let b = 0; for (const r in FIELD_ROLE) if (R.has(r) && (FIELD_ROLE[r] > 0 || theirs)) b += FIELD_ROLE[r];
  if (!G && R.has('tuner')) b += 120; // a Tuner on the field is half of a Synchro Summon
  return b;
}
let KNOW = 1; // how much of the card-value table this level knows (1 = all; lower levels see more of the plain stats)
function cardValue(g, c, onField) {
  const d = E().data(c); const n = d.n;
  if (n === 'Unknown card') return 1000;
  const G = goat(), VT = G ? GOAT_VALUE : VALUE, FB = G ? GOAT_FIELD_BONUS : FIELD_BONUS;
  const know = v => KNOW >= 1 ? v : v * KNOW + (1 - KNOW) * 750;
  if (d.k === 'spell' || d.k === 'trap') {
    if (VT[n] != null) return know(VT[n]);
    let rv = 750; for (const r of rolesOf(n)) if (ST_ROLE_VALUE[r] > rv) rv = ST_ROLE_VALUE[r];
    return know(rv);
  }
  const A = onField ? E().atk(g, c) : parseInt(d.atk, 10) || 0, Df = onField ? E().def(g, c) : parseInt(d.def, 10) || 0;
  if (d.k === 'token') return 150 + A * 0.6 + Df * 0.2 + (G ? FB[n] || 0 : 0);
  let stats = 400 + A * 0.75 + Df * 0.15;
  // a wall holds the field in Defense: there its DEF is what it's for
  if (onField && c.pos !== 'atk' && rolesOf(n).has('wall')) stats += Df * 0.2;
  if (onField) return stats + (FB[n] != null ? FB[n] : roleFieldBonus(n, G, EVAL_ME != null && c.ctrl !== EVAL_ME)) * KNOW;
  let v = Math.max(know(VT[n] || 0), stats + (d.k === 'effect' ? 150 : 0));
  // a hand trap is worth its effect while it stays in the hand, not its stats on the field
  if (VT[n] == null && rolesOf(n).has('hand_trap')) v = Math.max(v, know(1000));
  if (G && CHAOS.has(n) && !chaosFuel(g, c.owner)) v *= 0.7; // can't be summoned yet: no LIGHT and DARK in the Graveyard
  return v;
}
/* A Set card of mine keeps most of its worth; in Goat a Set Spell that isn't a Quick-Play only waits there to be hit by
 Heavy Storm or Breaker, so it is worth less than in the hand (play it, or keep it in hand). */
/* Flip monsters (2026-11-28, benzi_family: the computer Normal Summoned Flip monsters face-up every time, in Goat and Edison).
 A Set monster scored 0.9 of a face-up one, so Setting never looked better, and a Flip effect was worth nothing until it
 happened. A Flip monster face-down now keeps its Flip effect's worth (FLIP_WORTH), and one with low ATK (under FLIP_SET_ATK:
 Magician of Faith, Man-Eater Bug, Cyber Jar, Morphing Jar...) is never Normal Summoned face-up when it can be Set, at every
 level (its face-up summon isn't a candidate, so no slip or wobble picks it). Stronger ones (Dekoichi, 1400) weigh the Flip
 against attacking (Zack: "dekoichi could go either way situationally"). */
const FLIP_WORTH = 350, FLIP_SET_ATK = 1200;
const isFlipMon = d => !!(d && (d.flip || /\bFlip\b/.test(d.ab || '')));
function setShare(c, i) { if (!goat()) return 0.9; const d = E().data(c); return (d.k === 'trap' || d.sub === 'Quick-Play' ? 0.85 : 0.5) - (i >= 2 ? 0.08 * (i - 1) : 0); } // the 3rd Set card on is more Heavy Storm bait
function chaosFuel(g, p) { let l = 0, dk = 0; for (const c of g.p[p].gy) { const d = E().data(c); if (d.k === 'spell' || d.k === 'trap') continue; if (d.a === 'LIGHT') l++; else if (d.a === 'DARK') dk++; } return Math.min(l, dk); }
function evaluate(g, me) {
  if (g.winner != null) return g.winner === me ? 1e7 : g.winner === -1 ? 0 : -1e7;
  let s = 0;
  for (const p of [0, 1]) {
    const sign = p === me ? 1 : -1, P = g.p[p];
    let v = Math.min(P.lp, 8000) * 0.55 + Math.max(0, P.lp - 8000) * 0.15;
    if (P.lp <= 2000) v -= (2000 - P.lp) * 0.4; // low LP is extra dangerous
    for (const c of P.m) if (c) {
      if (c.pos === 'set') v += p === me ? cardValue(g, c, true) * 0.9 + (isFlipMon(E().data(c)) ? FLIP_WORTH : 0) : 1000;
      else v += cardValue(g, c, true) * (c.ctrl !== c.owner && c.flags.ctrlUntil != null ? 0.15 : 1);
    }
    let nSet = 0;
    for (const c of P.st) if (c) v += c.pos === 'set' ? (p === me ? cardValue(g, c) * setShare(c, nSet++) : 850) : 500;
    v += P.hand.length * (p === me ? 0 : 750);
    if (p === me) for (const c of P.hand) v += cardValue(g, c) * 0.8;
    v += Math.min(P.gy.length, 10) * 15;
    s += sign * v;
  }
  // board pressure: their strongest face-up attacker against my best
  const best = p => Math.max(0, ...g.p[p].m.filter(c => c && c.pos === 'atk').map(c => E().atk(g, c)));
  s += (best(me) - best(1 - me)) * 0.2;
  s -= exposure(g, me);
  if (goat()) s += goatTerms(g, me);
  return s;
}
/* Exposure (2026-11-27): the lookahead never plays their turn, so an open field cost nothing and the computer kept
 Magician of Faith or a Thunder Dragon in hand with Breaker staring at an empty board (a monster is worth less on the
 field than in the hand, so Setting one only ever looked like a loss). This is the damage their face-up attackers can
 deal me next turn past my blockers (each of my monsters stops one attack, their strongest get through), with an extra
 cost when it is lethal. Only my own exposure counts: theirs is what my Battle Phase is for. */
let EXPOSE = 0;
function exposure(g, me) {
  if (!EXPOSE || g.winner != null) return 0;
  const their = g.p[1 - me].m.filter(c => c && c.pos === 'atk').map(c => E().atk(g, c)).filter(a => a > 0).sort((a, b) => b - a);
  const free = their.length - g.p[me].m.filter(Boolean).length; if (free <= 0) return 0;
  const lp = g.p[me].lp; let dmg = 0; for (let i = 0; i < free; i++) dmg += their[i];
  return EXPOSE * (Math.min(dmg, lp) * 0.3 + (dmg >= lp ? 1500 : 0));
}
/* Goat extras (2026-11-24), each a lesson from the site's Goat course:
 - Chaos fuel: with Black Luster Soldier or Chaos Sorcerer still to come, a LIGHT and a DARK monster in the Graveyard
   are worth something (they pay for the summon).
 - Sinister Serpent in the Graveyard comes back every turn, so it is nearly a card in hand.
 - Their Set Spells and Traps: every face-up monster I commit can walk into Mirror Force, Torrential Tribute or
   Sakuretsu Armor, so a board is discounted by what one of those would take (play around Set cards, don't overextend). */
function goatTerms(g, me) {
  let s = 0; const P = g.p[me];
  let chaosLeft = 0; for (const c of [...P.hand, ...P.deck]) if (CHAOS.has(E().data(c).n)) chaosLeft++;
  if (chaosLeft) {
    let l = 0, dk = 0; for (const c of P.gy) { const d = E().data(c); if (d.k === 'spell' || d.k === 'trap') continue; if (d.a === 'LIGHT') l++; else if (d.a === 'DARK') dk++; }
    const pairs = Math.min(l, dk, chaosLeft);
    s += pairs * 260 + Math.min(Math.max(l, dk) - pairs, 1) * 60;
  }
  for (const p of [0, 1]) for (const c of g.p[p].gy) if (E().data(c).n === 'Sinister Serpent') s += (p === me ? 1 : -1) * 450;
  const sets = g.p[1 - me].st.filter(c => c && c.pos === 'set').length;
  if (sets && TRAPRISK) {
    const mons = P.m.filter(c => c && c.pos !== 'set').map(c => cardValue(g, c, true) * (c.ctrl !== c.owner && c.flags.ctrlUntil != null ? 0.15 : 1));
    if (mons.length) {
      const tot = mons.reduce((a, b) => a + b, 0), top = Math.max(...mons);
      const pMass = 1 - Math.pow(0.82, sets), pOne = 1 - Math.pow(0.7, sets);
      s -= TRAPRISK * (pMass * (tot - top) * 0.6 + pOne * top * 0.25);
    }
  }
  return s;
}
let TRAPRISK = 1;
/* Hide what `me` can't see: the opponent's hand, face-down cards, and both Decks become stand-ins. */
let UNKNOWN = null, HIDE_SEED = 1;
function setupUnknown() { // re-inits the engine once per card list with two stand-in cards added, keeping the format (Edison or Goat)
  const E0 = E(); const base = E0.cards ? E0.cards() : root.EDISON_CARDS;
  if (UNKNOWN === base || (base && base.__withUnknown)) return;
  const list = [...base.filter(c => c.n !== 'Unknown card'), { id: 'unk-mon', n: 'Unknown card', k: 'normal', a: 'EARTH', r: 'Warrior', lv: 4, atk: '1000', def: '1200' }, { id: 'unk-st', n: 'Unknown card', k: 'trap', sub: 'Normal' }];
  list.__withUnknown = true;
  E0.init(list, { format: E0.format ? E0.format() : 'edison' });
  UNKNOWN = list;
}
/* Face-down cards it has seen (2026-11-28, ade_lant3: the computer used Book of Moon on a monster, then attacked into it
 as if it were an unknown card with 1200 DEF, and lost the battle). A person remembers a card they saw face-up that was
 turned face-down and never left the field, so the computer keeps those cards as they are when it hides the rest. The
 memory is per duel; a card seen anywhere off the field (hand, Deck, Graveyard, banished) is forgotten, so a card Set
 later from the hand stays unknown. */
const SEEN = new WeakMap(); let KNOWN = null;
function remember(g, me) {
  let m = SEEN.get(g); if (!m) SEEN.set(g, m = new Map());
  const o = g.p[1 - me];
  for (const z of ['hand', 'gy', 'ban', 'deck', 'extra']) for (const c of o[z]) m.delete(c.u);
  for (const c of [...o.m, ...o.st]) if (c && c.pos !== 'set') m.set(c.u, c.id);
  KNOWN = m;
}
const known = c => !!(KNOWN && c && KNOWN.get(c.u) === c.id);
function hide(h, me) {
  const o = h.p[1 - me];
  for (const c of o.hand) c.id = 'unk-mon';
  for (const c of o.m) if (c && c.pos === 'set' && !known(c)) c.id = 'unk-mon';
  o.st.forEach((c, i) => { if (c && c.pos === 'set' && !known(c)) c.id = TRAPPLAN && TRAPPLAN.zone === i ? TRAPPLAN.id : 'unk-st'; });
  for (const c of o.deck) c.id = 'unk-mon';
  const d = h.p[me].deck; let a = HIDE_SEED >>> 0; const r = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
}
/* Rebuild the real position, hide what `me` can't see (the same way every time within one decision), then play
 the given answers. Lines are always rebuilt from the real game, never from a copy that has stand-ins in it. */
function play(g, me, seq) { const h = E().clone(g); hide(h, me); for (const k of seq) E().act(h, k); return h; }
let DREW = false; // set when a line drew or searched from my Deck (only then do more guesses at my Deck order matter)
let DEADLINE = Infinity; // past it, lines are no longer looked at deeper (a time limit per decision)
/* My own response windows inside a line (2026-11-27). Until then a line stopped at my first response window and was
 scored there, so an attack was scored before its damage whenever I held a quick effect or a Trap I could chain (Kalut
 in hand, a Set Solemn Judgment), and the computer skipped direct attacks, even lethal ones. Now a line passes in my
 windows and plays on to the next free action. (Trying each of my responses there as well was tested: it found little
 the real decision at that window doesn't, and it doubled the thinking time.) */
let QUIESCE = false; // score every line at the end of the turn (finishTurn; Advanced and Tournament)
function sim(g, me, keys, depth, pre = [], width = 14, width2 = width) {
  let h; if (TRAPPLAN) TRAPPLAN.sprung = false;
  try { h = play(g, me, [...pre, keys]); trapGone(h, me); rollout(h, me, true); trapGone(h, me); } catch (e) { return -1e6; }
  const mine = h.prompt && h.prompt.p === me && h.prompt.type === 'idle' && h.tp === me && h.turnNo === g.turnNo;
  const line = mine ? h.history.slice(g.history.length) : null, opts = mine && depth > 0 ? candidates(h, h.prompt).filter(k => k[0] !== 'end').slice(0, width) : [];
  let v;
  if (QUIESCE && mine) v = finishTurn(h, me); // h is used up here
  else {
    v = evaluate(h, me);
    // a line that ends my turn is scored after their draw, the others before it; give that draw back so ending the
    // turn is compared fairly with doing something (otherwise it Sets or summons anything rather than pass the turn).
    // Goat since 2026-11-24, Edison too since 2026-11-27.
    if (h.turnNo > g.turnNo && h.tp !== me && g.tp === me) v += 750;
  }
  if (h.p[me].deck.length !== g.p[me].deck.length) DREW = true;
  if (TRAPPLAN && !TRAPPLAN.sprung) v -= trapLive(h, me);
  if (depth > 0 && Date.now() < DEADLINE && mine) {
    // follow-ups: every action except ending the turn (stopping here is already the value v)
    let best = -Infinity;
    for (const k of opts) best = Math.max(best, sim(g, me, k, depth - 1, line, width2, width2));
    if (best > v) v = best;
  }
  return v;
}
/* Finishing the turn (2026-11-27, Advanced and Tournament). A line used to be scored wherever the lookahead stopped:
 a summon in Main Phase 1 counted as a body on the field and never as the damage it deals this turn, and only the
 lines that ended the turn saw End Phase effects (Judgment Dragon's mill, Return from the Different Dimension's
 monsters leaving, a stolen monster going back, the hand limit). So the computer skipped attacks into an open field,
 and its choices swung on luck in the End Phase. Now every line is scored at the same point: from where it stops, the
 rest of the Battle Phase is played the plain way (greedyBattle), the turn is ended, and the position is scored once
 the opponent reaches their Main Phase, as a line that ends the turn always was. */
function finishTurn(h, me) {
  try {
    greedyBattle(h, me);
    if (h.prompt && h.prompt.p === me && h.prompt.type === 'idle' && h.tp === me && (h.phase === 'main1' || h.phase === 'main2')) { E().act(h, ['end']); rollout(h, me, true); trapGone(h, me); }
    return evaluate(h, me) + (h.tp !== me ? 750 : 0);
  } catch (e) { return -1e6; }
}
/* The rest of my Battle Phase, played the plain way on the line's own copy: direct attacks first, then attacks that
 win their battle (the most valuable target first), a face-down monster only with 1800 or more ATK. */
// whether the guessed Trap has left its zone (sprung earlier in the line, which a replay doesn't flag)
function trapGone(h, me) { if (!TRAPPLAN || TRAPPLAN.sprung) return; const c = h.p[1 - me].st[TRAPPLAN.zone]; if (!(c && c.u === TRAPPLAN.u && c.pos === 'set')) TRAPPLAN.sprung = true; }
function greedyBattle(h, me) {
  try {
    for (let n = 0; n < 12 && h.prompt && h.prompt.p === me && h.prompt.type === 'idle' && h.tp === me; n++) {
      const pr = h.prompt;
      if (h.phase === 'main1') { if (!pr.opts.some(o => o.key === 'bp')) break; E().act(h, ['bp']); rollout(h, me, true); continue; }
      if (h.phase !== 'battle') break;
      let best = null, bv = -Infinity;
      for (const o of pr.opts) {
        if (o.kind !== 'atk') continue;
        const a = findCard(h, o.u); if (!a) continue; const A = E().atk(h, a);
        let s;
        if (o.t == null) s = 1e5 + A;
        else { const t = findCard(h, o.t); if (!t) continue;
          if (t.pos === 'set' && !known(t)) { if (A < 1800) continue; s = A - 1200; }
          else if (t.pos === 'set') { if (A <= E().def(h, t)) continue; s = 5e4 + cardValue(h, t, true); }
          else { const T = t.pos === 'atk' ? E().atk(h, t) : E().def(h, t); if (A <= T) continue; s = 5e4 + cardValue(h, t, true); } }
        if (s > bv) { bv = s; best = o.key; }
      }
      E().act(h, [best || 'endbp']); rollout(h, me, true);
      if (!best) break;
    }
    return evaluate(h, me);
  } catch (e) { return -Infinity; }
}
function rollout(h, me, autoPass) { // play forward until the next free action or a real choice for `me`
  for (let n = 0; n < 60 && h.prompt; n++) {
    const pr = h.prompt;
    if (pr.type === 'idle') return;
    if (!autoPass && pr.p === me && pr.type === 'respond' && !(TRAPPLAN && TRAPPLAN.sprung)) return;
    E().act(h, TRAPPLAN && pr.type === 'respond' && pr.p !== me ? trapAnswer(h, pr, me) : defaultAnswer(h, pr));
  }
}
/* Their Set cards (2026-11-24). A stand-in Set card never does anything, so on its own the computer would attack and
 summon into every Set card as if it were a blank. The stronger levels also check their best plays against a guess that one
 of the Set cards is a common Trap of the format (Goat: Mirror Force, Sakuretsu Armor, Torrential Tribute), which the
 opponent springs when it can (Torrential only on a summon that leaves more of my monsters than theirs). The guesses come
 from the format's card pool, never from the real cards. */
const TRAP_GUESS = { goat: { q: 0.3, cards: [['Mirror Force', 0.35], ['Sakuretsu Armor', 0.35], ['Torrential Tribute', 0.3]] } }; // Goat only (an Edison list tested no better)
let TRAPPLAN = null; const TRAP_IDS = {};
/* A guessed Trap that a line didn't spring is still there for my next attack: it costs about half of the monster it would
 take (my best face-up one). At 300 flat the computer stopped attacking directly with Chaos Sorcerer into two Set cards. */
function trapLive(h, me) { let top = 0; for (const c of h.p[me].m) if (c && c.pos !== 'set') top = Math.max(top, cardValue(h, c, true)); return 150 + top * 0.5; }
function trapId(n) { const k = (E().format ? E().format() : 'edison') + ':' + n; if (!(k in TRAP_IDS)) { const c = (E().cards ? E().cards() : []).find(x => x.n === n); TRAP_IDS[k] = c ? c.id : null; } return TRAP_IDS[k]; }
function trapAnswer(h, pr, me) {
  for (const o of pr.opts) {
    if (!o.u || !TRAPPLAN || o.u !== TRAPPLAN.u) continue;
    if (TRAPPLAN.n === 'Torrential Tribute') { const mine = h.p[me].m.filter(Boolean).length, theirs = h.p[1 - me].m.filter(Boolean).length; if (mine < Math.max(1, theirs)) continue; }
    // an attack Trap only on an attack that hurts them: direct, one that wins its battle, or by a monster worth the Trap
    // (2026-11-27: springing it on anything made a 300-ATK Sinister Serpent attack into a bigger Defense monster look good, as bait)
    if (TRAPPLAN.n !== 'Torrential Tribute' && h.aw && h.aw.a) {
      const a = h.aw.a, t = h.aw.t, A = E().atk(h, a);
      const wins = !t || (t.pos === 'set' ? A > 1200 : A > (t.pos === 'atk' ? E().atk(h, t) : E().def(h, t)));
      if (!wins && cardValue(h, a, true) < 1800) continue;
    }
    TRAPPLAN.sprung = true; return [o.key]; // from here on the line plays itself out (I don't answer their Trap)
  }
  return defaultAnswer(h, pr);
}
function defaultAnswer(g, pr) {
  if (pr.type === 'respond') return ['pass'];
  if (pr.type === 'yesno') return ['y'];
  if (pr.type === 'choose') return [pr.opts[0].key];
  if (pr.type === 'pick') {
    const cards = pr.opts.map(o => findCard(g, o.u));
    const val = c => c ? cardValue(g, c, E().onField(c)) : 0;
    const mine = c => c && (E().onField(c) ? c.ctrl : c.owner) === pr.p;
    let order;
    // a cost (Tribute, discard, material) is paid with fodder, floaters and Graveyard-effect cards first (roles)
    const costRank = c => { if (!c) return 0; const R = rolesOf(E().data(c).n); return val(c) - (R.has('fodder') || R.has('floater') || R.has('gy_effect') ? 400 * KNOW : 0); };
    if (pr.hint === 'cost') order = cards.slice().sort((a, b) => (mine(b) - mine(a)) || costRank(a) - costRank(b));
    else if (pr.hint === 'bad') order = cards.slice().sort((a, b) => (mine(a) - mine(b)) || val(b) - val(a));
    else order = cards.slice().sort((a, b) => val(b) - val(a));
    const n = pr.hint === 'cost' ? pr.min : pr.max;
    return order.slice(0, Math.max(pr.min, n)).map(c => 'u' + c.u);
  }
  return [pr.opts[0].key];
}
function findCard(g, u) { for (const P of g.p) for (const z of ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra']) for (const c of P[z]) if (c && c.u === u) return c; return null; }
function candidates(g, pr) {
  // a declared card name (engine declareName: every name in the pool, the public ones first): only those few are worth scoring (2026-11-28 audit)
  if (pr.declare) return pr.opts.slice(0, Math.max(1, Math.min(pr.suggested || 1, 6))).map(o => [o.key]);
  if (pr.type === 'pick') {
    if (pr.max === 1) return pr.opts.map(o => [o.key]);
    const out = []; const keys = pr.opts.map(o => o.key);
    const rec = (s, cur) => { if (out.length > 40) return; if (cur.length >= pr.min && cur.length <= pr.max && cur.length) out.push(cur.slice()); if (cur.length === pr.max) return; for (let i = s; i < keys.length; i++) { cur.push(keys[i]); rec(i + 1, cur); cur.pop(); } };
    rec(0, []); return out.length ? out : [defaultAnswer(g, pr)];
  }
  let opts = pr.opts;
  if (pr.type === 'idle') { // a low-ATK Flip monster that can be Set is never Normal Summoned face-up (FLIP_SET_ATK)
    const setU = new Set(opts.filter(o => o.kind === 'set').map(o => o.u));
    opts = opts.filter(o => !(o.kind === 'ns' && setU.has(o.u) && o.label === 'Normal Summon' && weakFlip(g, o.u)));
  }
  return opts.map(o => [o.key]);
}
/* Set, never face-up (2026-11-28, roles): a low-ATK Flip monster (FLIP_SET_ATK) and a wall whose DEF is its point
 (Big Shield Gardna, Marshmallon: under 1200 ATK and more DEF than ATK) are Set when they can be. */
function weakFlip(g, u) {
  const c = findCard(g, u), d = c && E().data(c); if (!d) return false;
  const A = parseInt(d.atk, 10) || 0, Df = parseInt(d.def, 10) || 0;
  if (isFlipMon(d) && A < FLIP_SET_ATK) return true;
  return A < FLIP_SET_ATK && Df > A && rolesOf(d.n).has('wall') && !rolesOf(d.n).has('beatstick');
}
/* Four levels (Zack, 2026-11-24, for Learn Retro Play): Beginner, Intermediate, Advanced, Tournament.
 slip: how often it makes a plain mistake (a random play, or missing a response it had); noise: how much its judgment of a
 play wobbles (variety, and misreads at the low end); depth: how many of its own moves it looks ahead in its Main Phase
 (multi-step plays; the biggest single step in strength); width: how many follow-ups it tries per step; careful: respects
 Set cards when attacking; samples: how many guesses at its own Deck order it checks a drawing line against; beam: re-checks
 its best few plays one move deeper (width2 follow-ups each); know: how much of the card-value table it knows (lower levels
 lean on plain ATK and DEF, so they trade a Mirror Force like any card); trapRisk: how much it discounts a board it commits
 into their Set Spells and Traps (Goat); trapSamples/trapTop: checks its best few plays against guesses at their Set cards
 (TRAP_GUESS; trapSamples only switches the check on since 2026-11-27, when every guess is checked once); budget: a soft
 time limit in ms (the extra checks are skipped when there is no room, so a decision stays well under 4 s). Added
 2026-11-27 for Advanced and Tournament after an audit of Tournament play (build/ai_audit.js): quiesce scores every line at
 the end of the turn (finishTurn), expose counts the damage an open field lets through next turn (exposure), sanity
 swings when the direct attacks on board are lethal. The old names still work: easy = Beginner, normal = Intermediate, hard = Advanced, experienced = Tournament.
 Goat, tier A decks, each level against the one below (2026-11-24, build/test_levels.js): Intermediate won 77% of 60 games,
 Advanced 65% of 60, Tournament 60% of 80 (and 62 to 64% in earlier runs of 60). */
const LEVELS = {
  beginner:     { slip: 0.5, missResponse: 0.65, noise: 1000, depth: 0, width: 14, careful: 0, samples: 1, beam: 0, know: 0.3, trapRisk: 0 },
  intermediate: { slip: 0.16, missResponse: 0.35, noise: 350, depth: 0, width: 14, careful: 0.4, samples: 1, beam: 0, know: 0.65, trapRisk: 0.4 },
  advanced:     { slip: 0.05, missResponse: 0.1, noise: 120, depth: 0, width: 6, width2: 6, careful: 1, samples: 1, beam: 3, know: 1, trapRisk: 1, budget: 600, quiesce: 1, expose: 1, sanity: 1 },
  tournament:   { slip: 0, missResponse: 0, noise: 12, depth: 1, width: 14, width2: 10, careful: 1, samples: 3, beam: 6, know: 1, trapRisk: 1, trapSamples: 2, trapTop: 4, budget: 1200, quiesce: 1, expose: 1, sanity: 1 },
};
// four levels since 2026-11-24 (Zack cut Experienced); old names still work
const ALIAS = { easy: 'beginner', normal: 'intermediate', hard: 'advanced', experienced: 'tournament' };
AI.LEVELS = Object.keys(LEVELS);
AI._levels = LEVELS; // the level settings, for the strength tests in build/
/* Per-format changes to a level. Edison's Advanced keeps its first settings (a full move of lookahead), which already sat
 well between Intermediate and Tournament there; Goat's Advanced looks deeper only on its best few plays. */
/* Edison's Tournament re-checks its best 3 plays one move deeper, not 6 (2026-11-27): scoring every line at the end of
 the turn made each line dearer, and 3 kept the thinking time within about 1.5x of before while it still won more. */
const FORMAT_LEVELS = { edison: { advanced: { slip: 0.05, missResponse: 0.12, noise: 110, depth: 1, width: 10, beam: 0 }, tournament: { beam: 3 } } };
const levelOf = name => {
  const key = LEVELS[ALIAS[name] || name] ? ALIAS[name] || name : 'intermediate';
  const f = FORMAT_LEVELS[E().format ? E().format() : 'edison'], o = f && f[key];
  return o ? { ...LEVELS[key], ...o } : LEVELS[key];
};
/* Attack order: with their Set cards in play, attack with the weakest monster that still wins first. */
function attackBias(g, me, keys, careful, trapModel) {
  const k = keys[0]; if (!k.startsWith('atk:')) return 0;
  const [, au, tu] = k.split(':'); const a = findCard(g, +au); if (!a) return 0;
  const sets = g.p[1 - me].st.filter(c => c && c.pos === 'set').length;
  let b = 0;
  if (sets && !trapModel) b -= E().atk(g, a) * 0.04 * sets * careful; // not when the guesses at their Set cards already price it in (2026-11-27)
  if (tu !== 'd') { const t = findCard(g, +tu); if (t && t.pos === 'set' && !known(t)) b -= 60 + 90 * careful; }
  return b;
}
/* Score every candidate the way level L sees it (no slips, no noise). Guesses at hidden cards: the first guess always;
 more guesses (samples) only for a line that drew or searched, the only lines where my Deck order changes the result. */
function scoreAll(g, me, L, cands) {
  EVAL_ME = me; KNOW = L.know != null ? L.know : 1; TRAPRISK = L.trapRisk != null ? L.trapRisk : 1; QUIESCE = !!L.quiesce; EXPOSE = L.expose || 0;
  const pr = g.prompt; const depth = pr.type === 'idle' ? L.depth : 0; const w2 = L.width2 || L.width;
  const score = (k, d) => {
    const seed0 = HIDE_SEED; DREW = false;
    let v = sim(g, me, k, d, [], L.width, w2), n = 1;
    if (DREW) for (let i = 1; i < L.samples; i++) { HIDE_SEED = (seed0 + i * 7919) >>> 0; v += sim(g, me, k, d, [], L.width, w2); n++; }
    HIDE_SEED = seed0; return v / n;
  };
  const TGm = TRAP_GUESS[E().format ? E().format() : 'edison'], TM = !!(L.trapSamples && TGm && g.p[1 - me].st.some(c => c && c.pos === 'set'));
  const t0 = Date.now(), budget = L.budget || Infinity; DEADLINE = t0 + budget * 2;
  const room = cost => Date.now() - t0 + cost <= budget; // time left for an extra check of the best few
  const scored = cands.map(k => {
    let v = score(k, depth) + attackBias(g, me, k, L.careful, TM);
    if (k[0] === 'pass') v += 5; // break ties toward keeping cards
    if (k[0] === 'end' || k[0] === 'endbp') v += 2;
    return { k, v };
  });
  // the best few, checked one move deeper (Advanced and Tournament)
  const per = (Date.now() - t0) / Math.max(1, cands.length);
  if (L.beam && pr.type === 'idle' && scored.length > 1 && room(per * L.beam * 4)) {
    scored.sort((a, b) => b.v - a.v);
    for (const s of scored.slice(0, L.beam)) if (s.k[0] !== 'end') s.v = Math.max(s.v, score(s.k, depth + 1) + attackBias(g, me, s.k, L.careful, TM) + (s.k[0] === 'endbp' ? 2 : 0));
  }
  // the best few, checked again against a guess at their Set cards (TRAP_GUESS)
  const TG = TRAP_GUESS[E().format ? E().format() : 'edison'];
  const sets = []; g.p[1 - me].st.forEach((c, i) => { if (c && c.pos === 'set') sets.push({ zone: i, u: c.u }); });
  /* 2026-11-27: every guess in TRAP_GUESS is checked once, weighted by its share (it used to draw 2 guesses at random, so
   the same attack was taken in one decision and skipped in the next: a Chaos Sorcerer stopped attacking directly into
   two Set cards whenever both draws came up Mirror Force or Sakuretsu). In the guess where their Trap is real but a
   line doesn't spring it, the Trap is still waiting for a later attack, so that line keeps part of its cost (trapLive). */
  if (L.trapSamples && TG && sets.length && pr.type === 'idle' && scored.length > 1 && room(per * (L.trapTop || 3) * TG.cards.length)) {
    const w0 = Math.pow(1 - TG.q, sets.length);
    let a = (HIDE_SEED ^ 0x5bd1e995) >>> 0; const r = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
    const plans = [];
    for (const [n, wt] of TG.cards) { const st = sets[Math.floor(r() * sets.length)]; const id = trapId(n); if (id != null) plans.push({ ...st, n, id, wt }); }
    const wsum = plans.reduce((x, p) => x + p.wt, 0);
    if (plans.length) {
      scored.sort((a, b) => b.v - a.v);
      for (const s of scored.slice(0, L.trapTop || 3)) {
        let t = 0; for (const pl of plans) { TRAPPLAN = { ...pl, sprung: false }; try { t += pl.wt * score(s.k, depth); } finally { TRAPPLAN = null; } }
        s.v = w0 * s.v + (1 - w0) * (t / wsum + attackBias(g, me, s.k, L.careful, TM) + (s.k[0] === 'pass' ? 5 : 0) + (s.k[0] === 'end' || s.k[0] === 'endbp' ? 2 : 0));
      }
    }
  }
  DEADLINE = Infinity;
  return scored;
}
AI.decide = function (g, me, level = 'intermediate') {
  const L = levelOf(level);
  setupUnknown(); HIDE_SEED = Math.floor(Math.random() * 2 ** 31); remember(g, me);
  const pr = g.prompt;
  const cands = candidates(g, pr);
  if (cands.length === 1) return cands[0];
  // a plain mistake
  if (Math.random() < L.slip) {
    if (pr.type === 'respond' && Math.random() < 0.6) return ['pass'];
    if (pr.type === 'idle') { const act = cands.filter(k => !['end', 'endbp'].includes(k[0])); if (act.length && Math.random() < 0.7) return act[Math.floor(Math.random() * act.length)]; }
    return cands[Math.floor(Math.random() * cands.length)];
  }
  if (pr.type === 'respond' && L.missResponse && Math.random() < L.missResponse * 0.5) return ['pass']; // didn't see the response
  if (pr.type === 'pick' && pr.opts.some(o => { const c = findCard(g, o.u); return c && c.zone === 'deck' && c.owner !== me; })) return defaultAnswer(g, pr);
  const scored = scoreAll(g, me, L, cands);
  let best = null, bestV = -Infinity;
  for (const s of scored) { const v = s.v + (s.v > 5e6 ? 0 : (Math.random() - 0.5) * L.noise); if (v > bestV) { bestV = v; best = s.k; } } // no wobble between won lines (it chained Solemn to its own Brain Control on the way to a win)
  if (L.sanity) best = sanity(g, me, best);
  return best || defaultAnswer(g, pr);
};
/* A last check on the pick (2026-11-27, Advanced and Tournament): with lethal on board in the Battle Phase (direct
 attacks whose ATK adds up to their LP), it swings, biggest first, whatever the lookahead made of it. */
function sanity(g, me, pick) {
  const pr = g.prompt; if (!pick || pr.type !== 'idle' || g.tp !== me || g.phase !== 'battle' || pick[0].startsWith('atk:')) return pick;
  const direct = pr.opts.filter(o => o.kind === 'atk' && o.t == null).map(o => ({ o, a: E().atk(g, findCard(g, o.u)) })).filter(x => x.a > 0);
  const seen = new Set(); let dmg = 0; for (const x of direct) if (!seen.has(x.o.u)) { seen.add(x.o.u); dmg += x.a; }
  if (!direct.length || dmg < g.p[1 - me].lp) return pick;
  direct.sort((x, y) => y.a - x.a); return [direct[0].o.key];
}
/* For the game's post-match review (Learn Retro Play): every legal answer to the current prompt scored the way the
 given level scores them (no slips, no noise), and the position a line leads to, for explaining the difference.
 Keep these two signatures: play/js/worker.js uses them. */
AI.scoreMoves = function (g, me, level = 'tournament') {
  const L = levelOf(level); setupUnknown(); HIDE_SEED = Math.floor(Math.random() * 2 ** 31); remember(g, me);
  const cands = candidates(g, g.prompt); const sc = scoreAll(g, me, L, cands);
  return cands.map(k => sc.find(s => s.k === k)).map(s => ({ k: s.k, v: s.v }));
};
AI.lineState = function (g, me, keys) { setupUnknown(); KNOWN = SEEN.get(g) || null; try { const h = play(g, me, [keys]); rollout(h, me); return h; } catch (e) { return null; } };
AI.evaluate = (g, me) => { const k = KNOW, t = TRAPRISK, x = EXPOSE; EVAL_ME = me; KNOW = 1; TRAPRISK = 1; EXPOSE = 1; try { return evaluate(g, me); } finally { KNOW = k; TRAPRISK = t; EXPOSE = x; } };
root.EdisonAI = AI;
})(typeof window !== 'undefined' ? window : globalThis);
