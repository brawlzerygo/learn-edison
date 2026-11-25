// Scenario checks for the Goat 6 cards (js/cards/goat-6.js): node build/test_goat-6.js
// Loads like build/test_goat.js: the Edison data and engine plus every js/cards/*.js, then E.init(GOAT_CARDS, {format: 'goat'}).
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math }; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const E = ctx.window.EdisonEngine, C = ctx.window.GOAT_CARDS;
E.init(C, { format: 'goat' });
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };

const FILL = 'Giant Soldier of Stone', BIG = 'Archfiend Soldier';
function duel(o = {}) {
  const mk = (ex, main) => ({ name: 't', main: main || Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0, o.main0), mk(o.ex1, o.main1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const handU = (g, p, n) => g.p[p].hand.find(c => E.name(c) === n).u;
const fieldC = (g, p, n) => E.fieldOf(g, p).find(c => E.name(c) === n);
const passAll = (g, upto = 30) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const endTurn = g => { passAll(g); if (g.prompt && g.prompt.type === 'idle' && hasOpt(g, 'endbp')) choose(g, 'endbp'); passAll(g); choose(g, 'end'); passAll(g); while (g.prompt && g.prompt.type === 'pick' && /hand limit/.test(g.prompt.text)) { E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); passAll(g); } };
const inZone = (g, p, z, n) => (Array.isArray(g.p[p][z]) ? g.p[p][z] : [g.p[p][z]]).some(c => c && E.name(c) === n);
const count = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const stU = (g, p, n) => g.p[p].st.find(c => c && E.name(c) === n).u;

// every card in the batch list has a Goat script
{
  const names = fs.readFileSync(path.join(__dirname, 'batches/goat-6.txt'), 'utf8').split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split(' | ')[0]);
  const missing = names.filter(n => !E.scripted(n));
  ok(names.length === 27 && !missing.length, `all ${names.length} goat-6 cards scripted${missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''}`);
}

T('Senju adds Dark Master - Zorc; Contract Ritual Summons it', () => {
  const g = duel({ board: [{ hand: ['Senju of the Thousand Hands', 'Contract with the Dark Master', BIG, 'Mystic Tomato'], deckTop: [FILL, 'Dark Master - Zorc'] }, {}] });
  choose(g, 'ns:' + handU(g, 0, 'Senju of the Thousand Hands')); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && /Senju/.test(g.prompt.text), 'asked to use Senju'); choose(g, 'yes'); passAll(g);
  ok(inZone(g, 0, 'hand', 'Dark Master - Zorc'), 'Zorc added to the hand');
  choose(g, 'a:' + handU(g, 0, 'Contract with the Dark Master')); passAll(g);
  if (g.prompt && g.prompt.type === 'choose') choose(g, 'Senju'); passAll(g);
  ok(inZone(g, 0, 'm', 'Dark Master - Zorc') && inZone(g, 0, 'gy', 'Contract with the Dark Master'), 'Zorc Ritual Summoned');
  ok(g.p[0].gy.filter(c => E.data(c).k !== 'spell').reduce((s, c) => s + E.lv(c), 0) >= 8, 'Tributed Levels add up to 8 or more');
});
T('Dark Master - Zorc rolls a die once per turn', () => {
  const g = duel({ board: [{ m: ['Dark Master - Zorc', FILL] }, { m: [BIG, FILL] }] });
  choose(g, 'Roll a die'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, BIG); passAll(g);
  const r = +(/rolled a (\d)/.exec(g.log.join('\n')) || [])[1];
  const mine = E.monsOf(g, 0).length, theirs = E.monsOf(g, 1).length;
  if (r <= 2) ok(theirs === 0 && mine === 2, `rolled ${r}: all their monsters destroyed`);
  else if (r <= 5) ok(theirs === 1 && mine === 2, `rolled ${r}: 1 of their monsters destroyed`);
  else ok(mine === 0 && theirs === 2, `rolled ${r}: all of A's monsters destroyed`);
  ok(!hasOpt(g, 'Roll a die'), 'only once per turn');
});
T('Dark Paladin: discard to negate a Spell; it gains 500 per Dragon', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], gy: ['Twin-Headed Thunder Dragon'] }, { m: ['Dark Paladin'], hand: [FILL], gy: ['Luster Dragon'] }] });
  const dp = fieldC(g, 1, 'Dark Paladin');
  ok(E.atk(g, dp) === 2900 + 500, 'Dark Paladin has 3400 ATK with one Dragon in a GY (Twin-Headed is a Thunder)');
  const h = g.p[0].hand.length;
  choose(g, 'a:' + handU(g, 0, 'Pot of Greed'));
  ok(hasOpt(g, 'negate the Spell'), 'Dark Paladin can respond'); choose(g, 'negate the Spell'); passAll(g);
  ok(inZone(g, 0, 'gy', 'Pot of Greed') && g.p[0].hand.length === h - 1 && g.p[1].hand.length === 0, 'Pot of Greed negated, B discarded');
});
T('Cyber-Stein summons a Fusion, but never one that must be Fusion Summoned', () => {
  const g = duel({ ex0: ['Dark Paladin', 'Twin-Headed Thunder Dragon'], board: [{ m: ['Cyber-Stein'], lp: 8000 }, {}] });
  choose(g, 'Pay 5000'); passAll(g);
  ok(g.p[0].lp === 3000 && inZone(g, 0, 'm', 'Twin-Headed Thunder Dragon') && inZone(g, 0, 'extra', 'Dark Paladin'), 'paid 5000, Twin-Headed Thunder Dragon summoned, Dark Paladin stays');
  ok(!hasOpt(g, 'Pay 5000'), 'cannot pay again with 3000 LP');
});
T('Metamorphosis cannot bring out Dark Paladin', () => {
  const g = duel({ ex0: ['Dark Paladin'], board: [{ hand: ['Metamorphosis'], m: ['Dark Master - Zorc'] }, {}] });
  ok(!hasOpt(g, 'a:' + handU(g, 0, 'Metamorphosis')), 'no Level 8 Fusion it may summon');
});
T('Roulette Barrel destroys a face-up monster of a rolled Level', () => {
  const g = duel({ seed: 3, board: [{ m: ['Roulette Barrel'] }, { m: ['Mystic Tomato', 'Sinister Serpent', BIG, FILL, 'Dark Master - Zorc'] }] });
  choose(g, 'Roll 2 dice'); passAll(g);
  const [a, b] = (/rolled a (\d) and a (\d)/.exec(g.log.join('\n')) || []).slice(1).map(Number);
  if (g.prompt && g.prompt.type === 'choose') E.act(g, [g.prompt.opts[0].key]);
  if (g.prompt && g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); passAll(g);
  const gone = 6 - E.monsOf(g, 0).length - E.monsOf(g, 1).length;
  ok(gone <= 1 && !hasOpt(g, 'Roll 2 dice'), `rolled ${a} and ${b}: at most one monster destroyed, once per turn`);
});
T('Toon World costs 1000, or nothing with Spell Economics; Toon Table of Contents searches', () => {
  const g = duel({ board: [{ hand: ['Toon World', 'Spell Economics', 'Toon World', 'Toon Table of Contents'], deckTop: [FILL, 'Toon Cannon Soldier'] }, {}] });
  choose(g, 'a:' + handU(g, 0, 'Toon World')); passAll(g);
  ok(g.p[0].lp === 7000, 'paid 1000 for the first Toon World');
  choose(g, 'a:' + handU(g, 0, 'Spell Economics')); passAll(g);
  choose(g, 'a:' + handU(g, 0, 'Toon World')); passAll(g);
  ok(g.p[0].lp === 7000 && count(g, 0, 'st', 'Toon World') === 2, 'the second Toon World cost nothing');
  choose(g, 'a:' + handU(g, 0, 'Toon Table of Contents')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Toon Cannon'); passAll(g);
  ok(inZone(g, 0, 'hand', 'Toon Cannon Soldier'), 'Toon Cannon Soldier added');
});
T('Mass Driver and Toon Cannon Soldier Tribute for damage', () => {
  const g = duel({ board: [{ m: ['Toon Cannon Soldier', FILL, BIG], st: [{ n: 'Mass Driver', pos: 'up' }] }, {}] });
  choose(g, 'Tribute: 400'); if (g.prompt && g.prompt.type === 'pick') choose(g, FILL); passAll(g);
  ok(g.p[1].lp === 7600, 'Mass Driver: 400');
  choose(g, 'Tribute: 500'); if (g.prompt && g.prompt.type === 'pick') choose(g, BIG); passAll(g);
  ok(g.p[1].lp === 7100, 'Toon Cannon Soldier: 500');
  choose(g, 'Tribute: 500'); passAll(g);
  ok(g.p[1].lp === 6600 && inZone(g, 0, 'gy', 'Toon Cannon Soldier'), 'it can Tribute itself');
});
T('D.D. Survivor comes back in the End Phase after being banished face-up', () => {
  const g = duel({ board: [{ m: ['Black Luster Soldier - Envoy of the Beginning', 'D.D. Survivor'] }, {}] });
  choose(g, 'Banish a monster'); if (g.prompt && g.prompt.type === 'pick') choose(g, 'D.D. Survivor'); passAll(g);
  ok(inZone(g, 0, 'ban', 'D.D. Survivor'), 'D.D. Survivor banished');
  endTurn(g);
  ok(inZone(g, 0, 'm', 'D.D. Survivor'), 'Special Summoned in the End Phase');
});
T('Mirror Wall halves an attacker; Standby: pay 2000 or lose it', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { st: ['Mirror Wall'], m: [{ n: FILL, pos: 'atk' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack ' + FILL);
  choose(g, 'Mirror Wall', 1); passAll(g);
  ok(g.p[0].lp === 8000 - (1300 - 950) && inZone(g, 0, 'gy', BIG), 'Archfiend Soldier fought at 950 ATK and lost the battle');
  endTurn(g); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && /Mirror Wall/.test(g.prompt.text), 'B asked to pay 2000'); choose(g, 'no'); passAll(g);
  ok(inZone(g, 1, 'gy', 'Mirror Wall') && g.p[1].lp === 8000, 'B did not pay, Mirror Wall destroyed');
});
T('Robbin\' Goblin: battle damage makes the opponent discard at random', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG], st: [{ n: 'Robbin\' Goblin', pos: 'up' }] }, { hand: [FILL, FILL] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g);
  ok(g.p[1].lp === 6100 && g.p[1].hand.length === 1 && g.p[1].gy.length === 1, 'B took 1900 and discarded 1');
});
T('Despair from the Dark and Regenerating Mummy react to the opponent’s Delinquent Duo', () => {
  const h = duel({ board: [{ hand: ['Despair from the Dark', 'Regenerating Mummy'], turn: 2 }, { hand: ['Delinquent Duo'] }] });
  endTurn(h);
  choose(h, 'a:' + handU(h, 1, 'Delinquent Duo')); passAll(h);
  if (h.prompt && h.prompt.type === 'pick') E.act(h, [h.prompt.opts[0].key]); passAll(h);
  ok(inZone(h, 0, 'm', 'Despair from the Dark'), 'Despair from the Dark Special Summoned itself');
  ok(inZone(h, 0, 'hand', 'Regenerating Mummy'), 'Regenerating Mummy returned to the hand');
});
T('Graceful Charity discards of your own do not trigger Regenerating Mummy', () => {
  const g = duel({ board: [{ hand: ['Graceful Charity', 'Regenerating Mummy', 'Despair from the Dark'] }, {}] });
  choose(g, 'a:' + handU(g, 0, 'Graceful Charity')); passAll(g);
  E.act(g, g.prompt.opts.filter(o => /Mummy|Despair/.test(o.label)).map(o => o.key)); passAll(g);
  ok(inZone(g, 0, 'gy', 'Regenerating Mummy') && inZone(g, 0, 'gy', 'Despair from the Dark'), 'both stay in the GY');
});
T('Slate Warrior: +500 when flipped; its killer loses 500', () => {
  const g = duel({ board: [{ turn: 3, m: ['Dark Master - Zorc'] }, { m: [{ n: 'Slate Warrior', pos: 'set' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); passAll(g); passAll(g); passAll(g);
  const z = fieldC(g, 0, 'Dark Master - Zorc');
  ok(inZone(g, 1, 'gy', 'Slate Warrior') && z && E.atk(g, z) === 2200 && E.def(g, z) === 1000, 'Slate Warrior (DEF 900 after the flip) destroyed, Zorc is 2200/1000');
});
T('Jowgen destroys Special Summoned monsters and stops Special Summons', () => {
  const g = duel({ ex0: ['Twin-Headed Thunder Dragon'], board: [{ m: ['Jowgen the Spiritualist', 'Cyber-Stein'], hand: [FILL] }, { hand: ['Scapegoat'] }] });
  ok(!hasOpt(g, 'Pay 5000'), 'Cyber-Stein cannot summon while Jowgen is face-up');
  endTurn(g);
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[1].hand[0], p: 1, how: 'special' }), 'B cannot Special Summon either');
});
T('Jowgen destroys Special Summoned monsters', () => {
  const g = duel({ ex0: ['Twin-Headed Thunder Dragon'], board: [{ m: ['Cyber-Stein'], hand: ['Jowgen the Spiritualist', FILL] }, {}] });
  choose(g, 'Pay 5000'); passAll(g);
  choose(g, 'ns:' + handU(g, 0, 'Jowgen the Spiritualist')); passAll(g);
  choose(g, 'destroy Special Summoned'); passAll(g);
  ok(inZone(g, 0, 'gy', 'Twin-Headed Thunder Dragon') && inZone(g, 0, 'm', 'Cyber-Stein') && inZone(g, 0, 'm', 'Jowgen the Spiritualist'), 'only the Special Summoned Fusion was destroyed');
});
T('Last Turn: a lone monster wins at the End Phase', () => {
  const g = duel({ main1: Array(40).fill(id('Mystic Tomato')), board: [{ m: ['Dark Master - Zorc'], st: ['Last Turn'], lp: 800, hand: [FILL] }, { hand: [FILL, FILL], m: [BIG] }] });
  endTurn(g);
  choose(g, 'end'); // A answers in B's End Phase window
  ok(hasOpt(g, 'Last Turn'), 'A can activate Last Turn on B’s turn'); choose(g, 'Last Turn'); passAll(g);
  for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, [g.prompt.opts[0].key]);
  passAll(g); if (g.prompt && g.prompt.type === 'yesno') choose(g, 'no'); passAll(g);
  ok(inZone(g, 0, 'm', 'Dark Master - Zorc') && g.p[1].hand.length === 0 && g.p[0].lp === 800, 'everything else went to the GY, no battle damage');
  if (g.prompt && g.prompt.type === 'idle') choose(g, 'end'); passAll(g);
  ok(!g.prompt && g.winner === 0, `Zorc beat Mystic Tomato and stands alone: A wins (${g.why})`);
});
T('Self-Destruct Button: both players at 0 is a draw', () => {
  const g = duel({ board: [{ st: ['Self-Destruct Button'], lp: 900 }, { lp: 8000 }] });
  choose(g, 'a:' + stU(g, 0, 'Self-Destruct Button') + ':'); passAll(g);
  ok(!g.prompt && g.winner === -1 && g.p[0].lp === 0 && g.p[1].lp === 0, 'the duel is a draw');
});
T('Mokey Mokey King leaves the field: Mokey Mokeys come back', () => {
  const g = duel({ ex0: [], board: [{ st: ['Ring of Destruction'], m: ['Mokey Mokey King'], gy: ['Mokey Mokey', 'Mokey Mokey', 'Mokey Mokey'] }, {}] });
  choose(g, 'a:' + stU(g, 0, 'Ring of Destruction') + ':'); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && /Mokey Mokey King/.test(g.prompt.text), 'asked to use Mokey Mokey King'); choose(g, 'yes'); passAll(g);
  ok(count(g, 0, 'm', 'Mokey Mokey') === 3 && inZone(g, 0, 'extra', 'Mokey Mokey King') === false && g.p[1].lp === 7700, 'three Mokey Mokey came back');
});
T('Mataza attacks twice; Brain Control cannot keep it', () => {
  const g = duel({ board: [{ turn: 3, m: ['Mataza the Zapper'] }, { m: [{ n: 'Mystic Tomato', pos: 'def' }, { n: 'Sinister Serpent', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g);
  choose(g, 'Attack Mystic'); passAll(g); passAll(g);
  ok(hasOpt(g, 'atk:'), 'a second attack is offered');
  const h = duel({ board: [{ hand: ['Brain Control'] }, { m: ['Mataza the Zapper'] }] });
  choose(h, 'a:' + handU(h, 0, 'Brain Control')); passAll(h);
  ok(inZone(h, 1, 'm', 'Mataza the Zapper') && !inZone(h, 0, 'm', 'Mataza the Zapper'), 'Mataza stays with B');
});
T('The Creator revives by sending a card; it cannot itself be revived', () => {
  const g = duel({ board: [{ m: ['The Creator'], hand: [FILL], gy: [BIG] }, {}] });
  choose(g, 'revive'); if (g.prompt && g.prompt.type === 'pick' && /hand/.test(g.prompt.text)) E.act(g, [g.prompt.opts[0].key]);
  if (g.prompt && g.prompt.type === 'pick') choose(g, BIG); passAll(g);
  ok(inZone(g, 0, 'm', BIG) && inZone(g, 0, 'gy', FILL), 'Archfiend Soldier revived, a card sent');
  ok(!hasOpt(g, 'revive'), 'once per turn');
  const h = duel({ board: [{ hand: ['Premature Burial'], gy: ['The Creator'] }, {}] });
  choose(h, 'a:' + handU(h, 0, 'Premature Burial')); passAll(h);
  ok(inZone(h, 0, 'gy', 'The Creator') && !inZone(h, 0, 'm', 'The Creator'), 'Premature Burial cannot revive The Creator');
});
T('Greenkappa flips and destroys 2 Set Spells/Traps', () => {
  const g = duel({ board: [{ m: [{ n: 'Greenkappa', pos: 'set' }] }, { st: ['Mirror Force', 'Ring of Destruction'] }] });
  choose(g, 'Flip Summon'); passAll(g);
  ok(inZone(g, 1, 'gy', 'Mirror Force') && inZone(g, 1, 'gy', 'Ring of Destruction'), 'both Set cards destroyed');
});
T('Spell Canceller stops Spell activations', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Toon World'], st: [{ n: 'Mass Driver', pos: 'up' }], m: [FILL] }, { m: ['Spell Canceller'] }] });
  ok(!hasOpt(g, 'a:' + handU(g, 0, 'Pot of Greed')) && !hasOpt(g, 'Tribute: 400'), 'no Spell or Spell effect can be activated');
  ok(hasOpt(g, 'setst:' + handU(g, 0, 'Pot of Greed')), 'Spells can still be Set');
});
T('Serpentine Princess: back to the Deck from the field summons a Level 3 or lower', () => {
  const g = duel({ board: [{ m: ['Serpentine Princess'], deckTop: ['Mystic Tomato'] }, {}] });
  const sp = fieldC(g, 0, 'Serpentine Princess');
  E.lib.move(g, sp, 'deck', { reason: 'effect', by: 1 });
  ok(g.pend.some(t => t.c === sp && t.eff.label === 'Summon a Level 3 or lower monster'), 'its trigger is pending once it is shuffled into the Deck');
});

console.log(fails ? `${fails} scenario check(s) failed` : 'all scenario checks passed');
process.exit(fails ? 1 : 0);
