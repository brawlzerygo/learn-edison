// Scenario checks for full pool batch 20: node build/test_full-20.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
function choose(g, text, who) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  if (who != null && pr.p !== who) throw new Error(`expected player ${who} prompt for "${text}", got ${pr.p}: ${pr.type} ${pr.text}`);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
// answer everything up to the next free action: pass responses, say yes, take the first options
function auto(g, o = {}) {
  for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') E.act(g, [o.no ? 'n' : 'y']);
    else if (pr.type === 'choose') E.act(g, [pr.opts[0].key]);
    else E.act(g, pr.opts.slice(0, Math.max(pr.min, Math.min(pr.max, 1))).map(x => x.key));
  }
}
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n).u + ':');
const eff = (g, c, ei) => choose(g, `a:${c.u}:${ei}`);
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const st = (g, p, n) => g.p[p].st.find(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const goBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => choose(g, `atk:${a.u}:${t ? t.u : 'd'}`);


T('Change of Heart takes a monster until the End Phase', () => {
  const g = duel({ board: [{ hand: ['Change of Heart'] }, { m: ['Dark Magician'] }] });
  act(g, 0, 'Change of Heart'); auto(g);
  ok(on(g, 0, 'Dark Magician'), 'A controls Dark Magician');
  choose(g, 'end'); auto(g);
  ok(on(g, 1, 'Dark Magician'), 'it went back to B');
});
T('Chaosrider Gustaph banishes Spells for ATK that lasts through the next turn', () => {
  const g = duel({ board: [{ m: ['Chaosrider Gustaph'], gy: ['Heavy Storm', 'Pot of Greed'] }, {}] });
  eff(g, on(g, 0, 'Chaosrider Gustaph'), 1); for (let i = 0; i < 3 && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); auto(g);
  const c = on(g, 0, 'Chaosrider Gustaph'); ok(E.atk(g, c) === 2000 && g.p[0].ban.length === 2, `2000 ATK (${E.atk(g, c)})`);
  choose(g, 'end'); auto(g); ok(E.atk(g, c) === 2000, 'still 2000 on the opponent turn');
  choose(g, 'end'); auto(g); ok(E.atk(g, c) === 1400, `back to 1400 after it (${E.atk(g, c)})`);
});
T('Charm of Shabti keeps a Gravekeeper alive in battle', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { hand: ['Charm of Shabti'], m: ["Gravekeeper's Spy"] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, "Gravekeeper's Spy"));
  choose(g, 'Charm of Shabti', 1); auto(g);
  ok(on(g, 1, "Gravekeeper's Spy") && inZ(g, 1, 'gy', 'Charm of Shabti'), 'the Spy survived');
});
T('Charubin the Fire Knight can be Fusion Summoned', () => {
  const g = duel({ ex0: ['Charubin the Fire Knight'], board: [{ hand: ['Polymerization', 'Monster Egg', 'Hinotama Soul'] }, {}] });
  act(g, 0, 'Polymerization'); auto(g);
  ok(on(g, 0, 'Charubin the Fire Knight'), 'Charubin summoned');
});
T('Checkmate lets Terrorking Archfiend attack directly', () => {
  const g = duel({ board: [{ hand: ['Checkmate'], m: ['Terrorking Archfiend', 'Desrook Archfiend'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Checkmate'); auto(g);
  ok(inZ(g, 0, 'gy', 'Desrook Archfiend'), 'Desrook was Tributed');
  goBP(g); ok(hasOpt(g, `atk:${on(g, 0, 'Terrorking Archfiend').u}:d`), 'direct attack offered');
});
T('Chiron the Mage discards a Spell to destroy a Spell/Trap', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], m: ['Chiron the Mage'] }, { st: ['Mirror Force'] }] });
  eff(g, on(g, 0, 'Chiron the Mage'), 0); auto(g);
  ok(inZ(g, 0, 'gy', 'Pot of Greed') && inZ(g, 1, 'gy', 'Mirror Force'), 'Pot discarded, Mirror Force destroyed');
});
T('Chopman equips an Equip Spell from the GY when Flip Summoned', () => {
  const g = duel({ board: [{ m: [{ n: 'Chopman the Desperate Outlaw', pos: 'set' }], gy: ['Black Pendant'], turn: 2 }, {}] });
  choose(g, 'Flip Summon'); auto(g);
  const c = on(g, 0, 'Chopman the Desperate Outlaw'); ok(c && E.atk(g, c) === 1600 && st(g, 0, 'Black Pendant'), `Chopman has 1600 ATK (${c && E.atk(g, c)})`);
});
T('Chorus of Sanctuary raises Defense Position DEF', () => {
  const g = duel({ board: [{ hand: ['Chorus of Sanctuary'], m: [{ n: 'Dark Magician', pos: 'def' }, 'Mystical Elf'] }, {}] });
  act(g, 0, 'Chorus of Sanctuary'); auto(g);
  ok(E.def(g, on(g, 0, 'Dark Magician')) === 2600 && E.def(g, on(g, 0, 'Mystical Elf')) === 2000, 'only the Defense Position one gains 500');
});
T('Chosen One summons or sends all 3', () => {
  const g = duel({ seed: 3, board: [{ hand: ['Chosen One', 'Dark Magician', 'Pot of Greed', 'Heavy Storm'] }, {}] });
  act(g, 0, 'Chosen One'); auto(g);
  const summoned = !!on(g, 0, 'Dark Magician');
  ok(g.p[0].hand.length === 1 && (summoned ? g.p[0].gy.length === 3 : g.p[0].gy.length === 4), `3 cards used, ${summoned ? 'Dark Magician summoned' : 'all sent'}`);
});
T('Coach Goblin returns a Normal Monster to draw in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Dark Magician'], m: ['Coach Goblin'] }, {}] });
  const n = g.p[0].hand.length; choose(g, 'end'); auto(g);
  ok(g.p[0].deck[0] && E.name(g.p[0].deck[0]) === 'Dark Magician' && g.p[0].hand.length === n, 'Dark Magician on the bottom, a card drawn');
});
T('Cobra Jar: token battle destruction burns the opponent', () => {
  const g = duel({ board: [{ m: ['Dark Magician', FILL], turn: 2 }, { m: [{ n: 'Cobra Jar', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Cobra Jar')); auto(g);
  const t = on(g, 1, 'Poisonous Snake Token'); ok(!!t, 'token summoned on the flip');
  attack(g, on(g, 0, FILL), t); auto(g);
  ok(!on(g, 1, 'Poisonous Snake Token') && g.p[0].lp === 7500, `the token was destroyed and A took 500 (A ${g.p[0].lp})`);
});
T('Cobraman Sakuzy flips itself face-down and looks at Set cards when flipped', () => {
  const g = duel({ board: [{ m: [{ n: 'Cobraman Sakuzy', pos: 'set' }], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'Flip Summon'); auto(g);
  ok(g.log.some(l => /looked at B's Set cards: Mirror Force/.test(l)), 'Mirror Force was seen');
});
T('Cockroach Knight goes back to the top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Cockroach Knight', 'Graceful Charity'] }, {}] });
  act(g, 0, 'Graceful Charity'); auto(g);
  for (let i = 0; i < 5 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick') { const ck = pr.opts.find(o => o.label === 'Cockroach Knight'); E.act(g, [ck.key, pr.opts.find(o => o !== ck).key]); } else auto(g); }
  auto(g);
  const top = g.p[0].deck[g.p[0].deck.length - 1]; ok(top && E.name(top) === 'Cockroach Knight', 'Cockroach Knight is on top of the Deck');
});
T('Coffin Seller burns once per batch of monsters', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], st: [{ n: 'Coffin Seller', pos: 'up' }] }, { m: [FILL, FILL] }] });
  act(g, 0, 'Dark Hole'); auto(g);
  ok(g.p[1].lp === 7700, `B took 300 once (B ${g.p[1].lp})`);
});
T('Collected Power moves every Equip Card', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: [FILL, 'Dark Magician'], st: [null, 'Collected Power'] }, {}] });
  act(g, 0, 'Black Pendant'); choose(g, 'Gene-Warped'); auto(g);
  act(g, 0, 'Collected Power'); choose(g, 'Dark Magician'); auto(g);
  ok(E.atk(g, on(g, 0, 'Dark Magician')) === 3000 && E.atk(g, on(g, 0, FILL)) === 2000, 'the Pendant moved to Dark Magician');
});
T('Commencement Dance summons Performance of Sword', () => {
  const g = duel({ board: [{ hand: ['Commencement Dance', 'Performance of Sword'], m: [FILL, FILL] }, {}] });
  act(g, 0, 'Commencement Dance'); auto(g);
  ok(on(g, 0, 'Performance of Sword'), 'Ritual Summoned');
});
T('Confiscation pays 1000 and discards a chosen card', () => {
  const g = duel({ board: [{ hand: ['Confiscation'] }, { hand: ['Mirror Force', FILL] }] });
  act(g, 0, 'Confiscation'); auto(g);
  ok(g.p[0].lp === 7000 && g.p[1].hand.length === 1 && g.p[1].gy.length === 1, 'paid 1000, 1 card discarded');
});
T('Continuous Destruction Punch destroys an attacker weaker than the DEF', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'def' }], st: [{ n: 'Continuous Destruction Punch', pos: 'up' }] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Big Shield Gardna')); auto(g);
  ok(inZ(g, 0, 'gy', FILL) && g.p[0].lp === 7400, `the Warwolf was destroyed and A took 600 (A ${g.p[0].lp})`);
});
T('Cost Down lets a Level 6 be Normal Summoned with no Tribute', () => {
  const g = duel({ board: [{ hand: ['Cost Down', 'Jinzo', FILL] }, {}] });
  act(g, 0, 'Cost Down'); choose(g, 'Gene-Warped'); auto(g);
  const sk = g.p[0].hand.find(c => E.name(c) === 'Jinzo');
  ok(E.lv(sk) === 4, `Jinzo is Level ${E.lv(sk)}`);
  choose(g, 'ns:' + sk.u); auto(g);
  const s2 = on(g, 0, 'Jinzo'); ok(s2 && E.lv(s2) === 4, 'summoned with no Tribute, still Level 4');
  choose(g, 'end'); auto(g); ok(E.lv(s2) === 6, `Level 6 again after the turn (${E.lv(s2)})`);
});
T('Covering Fire adds another monster ATK in the Damage Step', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: [FILL, 'Mystical Elf'], st: ['Covering Fire'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, FILL));
  for (let i = 0; i < 6 && g.prompt && !hasOpt(g, 'Covering Fire'); i++) E.act(g, ['pass']);
  choose(g, 'Covering Fire', 1); auto(g);
  ok(inZ(g, 0, 'gy', 'Dark Magician') && on(g, 1, FILL) && E.atk(g, on(g, 1, FILL)) === 2000, 'Dark Magician lost to 2800, boost gone after');
});
T('Crass Clown bounces when changed to Attack Position', () => {
  const g = duel({ board: [{ m: [{ n: 'Crass Clown', pos: 'def' }] }, { m: [FILL] }] });
  choose(g, 'Change to Attack'); auto(g);
  ok(inZ(g, 1, 'hand', FILL), 'Warwolf returned to the hand');
});
T('Dream Clown destroys when changed to Defense Position', () => {
  const g = duel({ board: [{ m: ['Dream Clown'] }, { m: [FILL] }] });
  choose(g, 'Change to Defense'); auto(g);
  ok(inZ(g, 1, 'gy', FILL), 'Warwolf destroyed');
});
T('Creeping Doom Manta stops Traps against its Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Creeping Doom Manta'] }, { st: ['Trap Hole'] }] });
  choose(g, 'ns:'); auto(g);
  ok(on(g, 0, 'Creeping Doom Manta') && st(g, 1, 'Trap Hole'), 'Trap Hole could not be used');
});
T('Criosphinx makes the owner of a bounced monster send a card', () => {
  const g = duel({ board: [{ hand: ['Crass Clown'], m: ['Criosphinx', { n: 'Crass Clown', pos: 'def' }] }, { hand: ['Pot of Greed'], m: [FILL] }] });
  choose(g, 'Change to Attack'); auto(g);
  ok(inZ(g, 1, 'hand', FILL) && inZ(g, 1, 'gy', 'Pot of Greed') || (inZ(g, 1, 'gy', FILL) && inZ(g, 1, 'hand', 'Pot of Greed')), 'B sent 1 card from the hand to the GY');
  ok(g.p[1].hand.length === 1, `B has 1 card in hand (${g.p[1].hand.length})`);
});
T('Cross Counter doubles the damage and destroys the attacker', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'def' }], st: ['Cross Counter'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Big Shield Gardna'));
  for (let i = 0; i < 6 && g.prompt && !hasOpt(g, 'Cross Counter'); i++) E.act(g, ['pass']);
  choose(g, 'Cross Counter', 1); auto(g);
  ok(g.p[0].lp === 6800 && inZ(g, 0, 'gy', FILL), `A took 1200 and lost the Warwolf (A ${g.p[0].lp})`);
});
T('Cure Mermaid and Dancing Fairy gain LP in the Standby Phase', () => {
  const g = duel({ board: [{ m: ['Cure Mermaid', { n: 'Dancing Fairy', pos: 'def' }] }, {}] });
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(g.p[0].lp === 11600, `A gained 1800 twice (A ${g.p[0].lp})`);
});
T('Cursed Seal negates a Spell and locks its name', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Pot of Greed'] }, { hand: ['Heavy Storm'], st: ['Cursed Seal of the Forbidden Spell'] }] });
  act(g, 0, 'Pot of Greed'); choose(g, 'Cursed Seal', 1); auto(g);
  ok(inZ(g, 1, 'gy', 'Heavy Storm') && inZ(g, 0, 'gy', 'Pot of Greed'), 'Pot negated, Heavy Storm discarded');
  ok(!hasOpt(g, 'a:' + g.p[0].hand.find(c => E.name(c) === 'Pot of Greed').u + ':'), 'the second Pot can no longer be activated');
});
T('Cyclon Laser gives Gradius 300 and piercing', () => {
  const g = duel({ board: [{ hand: ['Cyclon Laser'], m: ['Gradius'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }] }] });
  act(g, 0, 'Cyclon Laser'); auto(g);
  const gr = on(g, 0, 'Gradius'); ok(E.atk(g, gr) === 1500, `1500 ATK (${E.atk(g, gr)})`);
  goBP(g); attack(g, gr, on(g, 1, 'Sangan')); auto(g, { no: true });
  ok(g.p[1].lp === 8000 - 900, `900 piercing damage (B ${g.p[1].lp})`);
});
T('Darkbishop Archfiend pays 500 and rolls against a targeting effect', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['Darkbishop Archfiend'] }] });
  act(g, 0, 'Book of Moon'); ok(hasOpt(g, 'Roll a die'), 'roll offered'); choose(g, 'Roll a die', 1); auto(g);
  const rolled = g.log.find(l => /B rolled a (\d)/.test(l)); const n = rolled && +rolled.match(/rolled a (\d)/)[1];
  const fd = !on(g, 1, 'Darkbishop Archfiend') || on(g, 1, 'Darkbishop Archfiend').pos === 'set';
  ok([1, 3, 6].includes(n) ? !fd && inZ(g, 0, 'gy', 'Book of Moon') : fd, `rolled ${n}: ${fd ? 'flipped face-down' : 'Book of Moon negated'}`);
  choose(g, 'end'); auto(g);
  ok(g.p[1].lp === 7500 || fd, `B paid 500 in the Standby Phase (B ${g.p[1].lp})`);
});
T('Darklord Marie gains 200 from the GY', () => {
  const g = duel({ board: [{ gy: ['Darklord Marie'] }, {}] });
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(g.p[0].lp === 8400, `A gained 200 twice (${g.p[0].lp})`);
});
T('Deal of Phantom counts the monsters in the GY', () => {
  const g = duel({ board: [{ m: [FILL], st: ['Deal of Phantom'], gy: [FILL, 'Sangan', 'Pot of Greed'] }, {}] });
  act(g, 0, 'Deal of Phantom'); auto(g);
  ok(E.atk(g, on(g, 0, FILL)) === 2200, `2200 ATK (${E.atk(g, on(g, 0, FILL))})`);
});
T('Decayed Commander summons Zombie Tiger and discards on a direct hit', () => {
  const g = duel({ board: [{ hand: ['Decayed Commander', 'Zombie Tiger'], turn: 2 }, { hand: [FILL, FILL] }] });
  choose(g, 'ns:' + g.p[0].hand.find(c => E.name(c) === 'Decayed Commander').u); auto(g);
  ok(on(g, 0, 'Zombie Tiger'), 'Zombie Tiger summoned');
  goBP(g); attack(g, on(g, 0, 'Decayed Commander'), null); auto(g);
  ok(g.p[1].hand.length === 1 && g.p[1].gy.length === 1, 'B discarded 1 card at random');
});
T('Dedication through Light and Darkness turns Dark Magician into Dark Magician of Chaos', () => {
  const g = duel({ board: [{ hand: ['Dedication through Light and Darkness'], m: [{ n: 'Dark Magician', pos: 'set' }], deckTop: ['Dark Magician of Chaos'] }, {}] });
  act(g, 0, 'Dedication through Light and Darkness'); auto(g);
  ok(on(g, 0, 'Dark Magician of Chaos') && inZ(g, 0, 'gy', 'Dark Magician'), 'DMoC summoned from the Deck');
});
T('Delinquent Duo discards a random card and a chosen card', () => {
  const g = duel({ board: [{ hand: ['Delinquent Duo'] }, { hand: [FILL, 'Sangan', 'Pot of Greed'] }] });
  act(g, 0, 'Delinquent Duo'); auto(g);
  ok(g.p[0].lp === 7000 && g.p[1].hand.length === 1, 'paid 1000, B lost 2 cards');
});
T('Delta Attacker lets 3 same-name Normal Monsters attack directly', () => {
  const g = duel({ board: [{ hand: ['Delta Attacker'], m: [FILL, FILL, FILL], turn: 2 }, { m: ['Big Shield Gardna'] }] });
  act(g, 0, 'Delta Attacker'); auto(g);
  goBP(g); const ms = g.p[0].m.filter(Boolean); for (const m of ms) { attack(g, m, null); auto(g); }
  ok(g.p[1].lp === 2000, `6000 direct damage (B ${g.p[1].lp})`);
});
T('Demotion lowers the Level by 2 and restores it', () => {
  const g = duel({ board: [{ hand: ['Demotion', 'Mystical Space Typhoon'], m: ['Jinzo'] }, {}] });
  act(g, 0, 'Demotion'); auto(g); const j = on(g, 0, 'Jinzo'); ok(E.lv(j) === 4, `Level 4 (${E.lv(j)})`);
  act(g, 0, 'Mystical Space Typhoon'); auto(g); ok(E.lv(j) === 6, `Level 6 again (${E.lv(j)})`);
});
T('Desertapir flips a monster face-down', () => {
  const g = duel({ board: [{ m: [{ n: 'Desertapir', pos: 'set' }], turn: 2 }, { m: ['Dark Magician'] }] });
  choose(g, 'Flip Summon'); auto(g);
  ok(g.p[1].m.find(Boolean).pos === 'set', 'Dark Magician is face-down');
});
T('Despair from the Dark summons itself when the opponent discards it', () => {
  const g = duel({ board: [{ hand: ['Delinquent Duo'] }, { hand: ['Despair from the Dark'] }] });
  act(g, 0, 'Delinquent Duo'); auto(g);
  ok(on(g, 1, 'Despair from the Dark'), 'Despair Special Summoned');
});
T('Desrook Archfiend revives a destroyed Terrorking', () => {
  const g = duel({ board: [{ hand: ['Raigeki'] }, { hand: ['Desrook Archfiend'], m: ['Terrorking Archfiend'] }] });
  act(g, 0, 'Raigeki'); auto(g);
  ok(on(g, 1, 'Terrorking Archfiend') && inZ(g, 1, 'gy', 'Desrook Archfiend'), 'Terrorking is back');
});
T('Diffusion Wave-Motion lets the Spellcaster attack every monster, alone', () => {
  const g = duel({ board: [{ hand: ['Diffusion Wave-Motion'], m: ['Dark Magician', FILL], turn: 2 }, { m: ['Sangan', 'Giant Rat'] }] });
  act(g, 0, 'Diffusion Wave-Motion'); auto(g);
  goBP(g); ok(!hasOpt(g, `atk:${on(g, 0, FILL).u}:`), 'the Warwolf cannot attack');
  attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Sangan')); auto(g);
  ok(inZ(g, 1, 'gy', 'Sangan') && !g.log.some(l => /Sangan's effect/.test(l)), 'Sangan destroyed, its effect not used');
  attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Giant Rat')); auto(g);
  ok(inZ(g, 1, 'gy', 'Giant Rat') && g.p[0].lp === 7000, 'Giant Rat destroyed too');
});
T('Dimensionhole banishes until the next Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Dimensionhole'], m: ['Dark Magician'] }, {}] });
  act(g, 0, 'Dimensionhole'); auto(g); ok(inZ(g, 0, 'ban', 'Dark Magician'), 'banished');
  choose(g, 'end'); auto(g); choose(g, 'end'); auto(g);
  ok(on(g, 0, 'Dark Magician'), 'back on the field');
});
T('Disappear banishes from the GY', () => {
  const g = duel({ board: [{ st: ['Disappear'] }, { gy: ['Sangan'] }] });
  act(g, 0, 'Disappear'); auto(g); ok(inZ(g, 1, 'ban', 'Sangan'), 'Sangan banished');
});
T('Disarmament destroys face-up Equip Cards', () => {
  const g = duel({ board: [{ hand: ['Black Pendant'], m: [FILL], st: [null, 'Disarmament'] }, {}] });
  act(g, 0, 'Black Pendant'); auto(g); act(g, 0, 'Disarmament'); auto(g, { no: true });
  ok(inZ(g, 0, 'gy', 'Black Pendant'), 'Black Pendant destroyed');
});
T('Disc Fighter destroys a 2000+ DEF monster without damage', () => {
  const g = duel({ board: [{ m: ['Disc Fighter'], turn: 2 }, { m: [{ n: 'Big Shield Gardna', pos: 'set' }] }] });
  goBP(g); attack(g, on(g, 0, 'Disc Fighter'), g.p[1].m.find(Boolean)); auto(g);
  ok(inZ(g, 1, 'gy', 'Big Shield Gardna') && g.p[0].lp === 8000, 'Gardna destroyed, no damage');
});
T('Disturbance Strategy reshuffles the hand', () => {
  const g = duel({ board: [{ st: ['Disturbance Strategy'] }, { hand: ['Sangan', 'Pot of Greed', 'Heavy Storm'] }] });
  act(g, 0, 'Disturbance Strategy'); auto(g); ok(g.p[1].hand.length === 3, 'B still has 3 cards');
});
T('Don Turtle summons more Don Turtles', () => {
  const g = duel({ board: [{ hand: ['Don Turtle', 'Don Turtle', 'Don Turtle'] }, {}] });
  choose(g, 'ns:'); for (let i = 0; i < 10 && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick') E.act(g, pr.opts.map(o => o.key)); else if (pr.type === 'yesno') E.act(g, ['y']); else E.act(g, [pr.type === 'respond' ? 'pass' : pr.opts[0].key]); }
  ok(g.p[0].m.filter(Boolean).length === 3, 'three Don Turtles');
});
T('Don Zaloog mills or discards on battle damage', () => {
  const g = duel({ board: [{ m: ['Don Zaloog'], turn: 2 }, { hand: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Don Zaloog'), null); auto(g);
  ok(g.p[1].gy.length >= 1, 'B lost a card');
});
T('Dora of Fate burns when a monster 1 Level lower is Normal Summoned next turn', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { hand: ['Jinzo'], m: [FILL], st: ['Dora of Fate'] }] });
  choose(g, 'bp'); choose(g, 'Dora of Fate', 1); auto(g);
  ok(g.f20dora && g.f20dora.length === 1 && g.f20dora[0].lv === 7, 'Dark Magician (Level 7) selected');
  choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  choose(g, 'ns:' + g.p[1].hand.find(c => E.name(c) === 'Jinzo').u); auto(g);
  ok(on(g, 1, 'Jinzo') && g.p[0].lp === 4500, `A took 3500 (A ${g.p[0].lp})`);
});
T("Doriado's Blessing summons Elemental Mistress Doriado", () => {
  const g = duel({ board: [{ hand: ["Doriado's Blessing", 'Elemental Mistress Doriado', 'Sangan'] }, {}] });
  act(g, 0, "Doriado's Blessing"); auto(g);
  ok(on(g, 0, 'Elemental Mistress Doriado'), 'Ritual Summoned');
});
T('Dragged Down into the Grave discards one card from each hand and both draw', () => {
  const g = duel({ board: [{ hand: ['Dragged Down into the Grave', 'Sangan', 'Pot of Greed'] }, { hand: ['Heavy Storm', 'Raigeki'] }] });
  act(g, 0, 'Dragged Down into the Grave'); auto(g);
  ok(g.p[0].hand.length === 3 && g.p[1].hand.length === 2 && g.p[0].gy.length === 2 && g.p[1].gy.length === 1, 'each lost 1 and drew 1');
});
T('Draining Shield negates the attack and gains its ATK', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { st: ['Draining Shield'] }] });
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), null); choose(g, 'Draining Shield', 1); auto(g);
  ok(g.p[1].lp === 10500, `B gained 2500 and took nothing (B ${g.p[1].lp})`);
});
T('Dramatic Rescue saves a targeted Amazoness and summons another monster', () => {
  const g = duel({ board: [{ hand: ['Book of Moon'], turn: 2 }, { hand: ['Dark Magician'], m: ['Amazoness Swords Woman'], st: ['Dramatic Rescue'] }] });
  act(g, 0, 'Book of Moon'); choose(g, 'Dramatic Rescue', 1); auto(g);
  ok(inZ(g, 1, 'hand', 'Amazoness Swords Woman') && on(g, 1, 'Dark Magician'), 'Amazoness back in hand, Dark Magician summoned');
});
T('Dreamsprite moves the attack to another monster', () => {
  const g = duel({ board: [{ m: ['Dark Magician'], turn: 2 }, { m: ['Dreamsprite', 'Big Shield Gardna'] }] });
  g.p[1].m[1].pos = 'def';
  goBP(g); attack(g, on(g, 0, 'Dark Magician'), on(g, 1, 'Dreamsprite')); auto(g);
  ok(on(g, 1, 'Dreamsprite') && on(g, 1, 'Big Shield Gardna') && g.p[0].lp === 7900, `Gardna took the attack, A took 100 (A ${g.p[0].lp})`);
});
T('Combination Attack frees the Union and gives another attack', () => {
  const g = duel({ board: [{ hand: ['Combination Attack'], m: ['X-Head Cannon'], st: [{ n: 'Y-Dragon Head', pos: 'up' }], turn: 2 }, {}] });
  g.p[0].st[0].equipTo = g.p[0].m[0].u; g.seq++;
  goBP(g); attack(g, on(g, 0, 'X-Head Cannon'), null); auto(g);
  act(g, 0, 'Combination Attack'); auto(g);
  ok(on(g, 0, 'Y-Dragon Head'), 'Y-Dragon Head is a monster again');
  ok(hasOpt(g, `atk:${on(g, 0, 'X-Head Cannon').u}:d`) && hasOpt(g, `atk:${on(g, 0, 'Y-Dragon Head').u}:d`), 'both can attack');
});
T('Desrook Archfiend rolls when it is targeted', () => {
  const g = duel({ seed: 5, board: [{ hand: ['Book of Moon'], turn: 2 }, { m: ['Desrook Archfiend'] }] });
  act(g, 0, 'Book of Moon'); ok(hasOpt(g, 'Roll a die'), 'roll offered'); choose(g, 'Roll a die', 1); auto(g);
  ok(g.log.some(l => /B rolled a/.test(l)), 'B rolled');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-20 checks passed.');
process.exit(fails ? 1 : 0);
