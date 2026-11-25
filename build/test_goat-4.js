// Goat batch 4 scenario checks: node build/test_goat-4.js
// Loads the engine and every js/cards/*.js like build/test_goat.js, plays Goat, then checks the trickier goat-4.js cards.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math }; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const E = ctx.window.EdisonEngine, C = ctx.window.GOAT_CARDS;
E.init(C, { format: 'goat' });
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };

const list = fs.readFileSync(path.join(__dirname, 'batches/goat-4.txt'), 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => l.split('|')[0].trim());
const missing = list.filter(n => !E.scripted(n));

const FILL = 'Giant Soldier of Stone', BIG = 'Archfiend Soldier';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
function choose(g, text) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
const hasOpt = (g, text) => !!g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const handU = (g, p, n) => g.p[p].hand.find(c => E.name(c) === n).u;
const stU = (g, p, n) => g.p[p].st.find(c => c && E.name(c) === n).u;
const fieldC = (g, p, n) => E.fieldOf(g, p).find(c => E.name(c) === n);
const passAll = (g, upto = 30) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const passUntil = (g, text, upto = 30) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond' && !hasOpt(g, text); i++) E.act(g, ['pass']); return hasOpt(g, text); };
const handLimit = g => { while (g.prompt && g.prompt.type === 'pick' && /hand limit/.test(g.prompt.text)) { E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); passAll(g); } };
const endTurn = g => { passAll(g); if (hasOpt(g, 'endbp')) choose(g, 'endbp'); passAll(g); choose(g, 'end'); passAll(g); handLimit(g); };
const inZone = (g, p, z, n) => (Array.isArray(g.p[p][z]) ? g.p[p][z] : [g.p[p][z]]).some(c => c && E.name(c) === n);
const count = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

ok(!missing.length, `every goat-4 card is scripted (${list.length})` + (missing.length ? ': missing ' + missing.join(', ') : ''));

T('Dark Balter negates a Normal Spell for 1000 LP', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'] }, { m: ['Dark Balter the Terrible'] }] });
  const h = g.p[0].hand.length;
  choose(g, 'a:' + handU(g, 0, 'Pot of Greed'));
  ok(passUntil(g, 'negate the Normal Spell'), 'B can answer with Dark Balter'); choose(g, 'negate the Normal Spell'); passAll(g);
  ok(g.p[1].lp === 7000 && g.p[0].hand.length === h - 1 && inZone(g, 0, 'gy', 'Pot of Greed'), 'B paid 1000, A drew nothing');
});
T('Dark Balter negates the effect of a monster it destroys by battle', () => {
  const g = duel({ board: [{ turn: 3, m: ['Dark Balter the Terrible'] }, { m: ['Sangan'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Sangan'); passAll(g);
  for (let i = 0; i < 5 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes');
  ok(inZone(g, 1, 'gy', 'Sangan') && !(g.prompt && g.prompt.type === 'pick' && g.prompt.p === 1), 'Sangan destroyed, no search');
});
T('Dark Blade banishes up to 3 monsters from their GY after battle damage', () => {
  const g = duel({ board: [{ turn: 3, m: ['Dark Blade the Dragon Knight'] }, { gy: [BIG, FILL, 'Sangan', 'Pot of Greed'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno', 'asked to use Dark Blade'); choose(g, 'yes'); passAll(g);
  ok(g.prompt && g.prompt.type === 'pick' && g.prompt.max === 3 && g.prompt.opts.length === 3, 'picks up to 3 of the 3 monsters');
  E.act(g, g.prompt.opts.map(o => o.key)); passAll(g);
  ok(g.p[1].ban.length === 3 && inZone(g, 1, 'gy', 'Pot of Greed') && g.p[1].lp === 5800, 'three monsters banished, 2200 damage');
});
T('Gatling Dragon destroys as many monsters as heads', () => {
  for (const seed of [1, 2, 3, 4]) {
    const g = duel({ seed, board: [{ m: ['Gatling Dragon'] }, { m: [BIG, FILL, FILL] }] });
    const g2 = { log: g.log };
    choose(g, 'Toss 3 coins'); passAll(g);
    const line = g.log.filter(t => /^Coins:/.test(t)).pop(); const h = (line.match(/heads/g) || []).length;
    if (h && g.prompt && g.prompt.type === 'pick') { E.act(g, g.prompt.opts.filter(o => !/Gatling/.test(o.label)).slice(0, g.prompt.min).map(o => o.key)); passAll(g); }
    ok(E.fieldOf(g, 1).length === 3 - Math.min(h, 3), `seed ${seed}: ${h} heads, ${3 - E.fieldOf(g, 1).length} destroyed`);
    ok(!hasOpt(g, 'Toss 3 coins'), `seed ${seed}: once per turn`);
    void g2;
  }
});
T('Ryu Senshi pays 1000 to negate Sakuretsu Armor', () => {
  const g = duel({ board: [{ turn: 3, m: ['Ryu Senshi'] }, { st: ['Sakuretsu Armor'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  choose(g, 'Sakuretsu');
  ok(hasOpt(g, 'negate the Normal Trap'), 'Ryu Senshi offered'); choose(g, 'negate the Normal Trap'); passAll(g);
  ok(inZone(g, 0, 'm', 'Ryu Senshi') && g.p[0].lp === 7000 && g.p[1].lp === 6000, 'Ryu Senshi survives and hits for 2000');
});
T('D.D. Assailant banishes itself and the monster that destroyed it', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { m: ['D.D. Assailant'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack D.D. Assailant'); passAll(g);
  ok(inZone(g, 0, 'ban', BIG) && inZone(g, 1, 'ban', 'D.D. Assailant'), 'both banished');
});
T('Widespread Ruin destroys the highest-ATK Attack Position monster', () => {
  const g = duel({ board: [{ turn: 3, m: [FILL, BIG] }, { st: ['Widespread Ruin'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); choose(g, 'Widespread'); passAll(g);
  ok(inZone(g, 0, 'gy', BIG) && inZone(g, 0, 'm', FILL), 'Archfiend Soldier destroyed, Giant Soldier stays');
});
T('Nimble Momonga: 1000 LP and face-down Momongas from the Deck', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { m: ['Nimble Momonga'], deckTop: ['Nimble Momonga', 'Nimble Momonga'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Nimble Momonga'); passAll(g);
  ok(g.prompt && g.prompt.type === 'pick' && g.prompt.p === 1, 'B picks Momongas'); E.act(g, g.prompt.opts.map(o => o.key)); passAll(g);
  ok(g.p[1].lp === 8000 - 900 + 1000 && count(g, 1, 'm', 'Nimble Momonga') === 2 && g.p[1].m.filter(Boolean).every(c => c.pos === 'set'), 'gained 1000, two Momongas face-down');
});
T('Solar Flare Dragon: not attackable with another Pyro, 500 in the End Phase', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { m: ['Solar Flare Dragon', 'Solar Flare Dragon'] }] });
  choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'Attack Solar') && hasOpt(g, 'Attack directly'), 'neither can be attacked');
  const g2 = duel({ board: [{ m: ['Solar Flare Dragon'] }, {}] });
  choose(g2, 'end'); passAll(g2);
  ok(g2.p[1].lp === 7500, 'B took 500 in A’s End Phase');
});
T('Ojama King locks 3 of their zones', () => {
  const g = duel({ board: [{ m: ['Ojama King'] }, { hand: [FILL, FILL, FILL], m: [FILL] }] });
  endTurn(g);
  ok(hasOpt(g, 'ns:'), 'with 1 monster, B can still summon'); choose(g, 'ns:' + handU(g, 1, FILL)); passAll(g);
  ok(!hasOpt(g, 'ns:') || g.ns[1] >= 1, 'second monster summoned');
  const g2 = duel({ board: [{ m: ['Ojama King'] }, { hand: [FILL, FILL], m: [FILL, FILL] }] });
  endTurn(g2);
  ok(!hasOpt(g2, 'ns:') && !hasOpt(g2, 'set:'), 'with 2 monsters, B cannot summon or Set');
});
T('The Last Warrior: destroys your other monsters, no Summons', () => {
  const g = duel({ board: [{ hand: ['Premature Burial', FILL], m: [BIG], gy: ['The Last Warrior from Another Planet'] }, {}] });
  choose(g, 'a:' + handU(g, 0, 'Premature Burial')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Last Warrior'); passAll(g);
  ok(inZone(g, 0, 'm', 'The Last Warrior from Another Planet') && inZone(g, 0, 'gy', BIG), 'summoned, Archfiend Soldier destroyed');
  ok(!hasOpt(g, 'ns:') && hasOpt(g, 'set:'), 'no Normal Summon, Set allowed');
});
T('Ben Kei with 2 Equips attacks 3 times', () => {
  const g = duel({ board: [{ turn: 3, m: ['Armed Samurai - Ben Kei'], hand: ['Axe of Despair', 'Big Bang Shot'] }, {}] });
  choose(g, 'a:' + handU(g, 0, 'Axe of Despair')); passAll(g);
  choose(g, 'a:' + handU(g, 0, 'Big Bang Shot')); passAll(g);
  const bk = fieldC(g, 0, 'Armed Samurai - Ben Kei');
  ok(E.atk(g, bk) === 1900, 'Ben Kei has 1900 ATK');
  choose(g, 'bp'); passAll(g);
  for (let i = 0; i < 3; i++) { choose(g, 'Attack directly'); passAll(g); }
  ok(g.p[1].lp === 8000 - 3 * 1900 && !hasOpt(g, 'Attack directly'), 'three direct attacks, no fourth');
});
T('Big Bang Shot: piercing, and the monster is banished when it leaves', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG], hand: ['Big Bang Shot', 'Mystical Space Typhoon'] }, { m: [{ n: 'Sangan', pos: 'def' }] }] });
  choose(g, 'a:' + handU(g, 0, 'Big Bang Shot')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, BIG); passAll(g);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Sangan'); passAll(g);
  for (let i = 0; i < 5 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') passAll(g); else E.act(g, g.prompt.opts.slice(0, g.prompt.min || 1).map(o => o.key)); }
  ok(g.p[1].lp === 8000 - (2300 - 600), 'piercing damage 1700');
  choose(g, 'endbp'); passAll(g);
  choose(g, 'a:' + handU(g, 0, 'Mystical Space Typhoon')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Big Bang'); passAll(g);
  ok(inZone(g, 0, 'ban', BIG), 'Archfiend Soldier banished');
});
T('United We Stand and Lightning Blade', () => {
  const g = duel({ board: [{ m: ['D.D. Assailant', FILL, FILL], hand: ['United We Stand', 'Lightning Blade'] }, { m: ['Sinister Serpent'] }] });
  choose(g, 'a:' + handU(g, 0, 'United We Stand')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'D.D. Assailant'); passAll(g);
  const dd = fieldC(g, 0, 'D.D. Assailant');
  ok(E.atk(g, dd) === 1700 + 2400 && E.def(g, dd) === 1600 + 2400, 'D.D. Assailant gains 2400 ATK/DEF');
  choose(g, 'a:' + handU(g, 0, 'Lightning Blade')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') { ok(g.prompt.opts.length === 1, 'only the Warrior can be equipped'); choose(g, 'D.D. Assailant'); } passAll(g);
  ok(E.atk(g, dd) === 1700 + 2400 + 800 && E.atk(g, fieldC(g, 1, 'Sinister Serpent')) === 0, '+800 more, Sinister Serpent (WATER) loses 500');
});
T('Mask of Brutality: pay 1000 each Standby or lose it', () => {
  const g = duel({ board: [{ m: [BIG], hand: ['Mask of Brutality'] }, { hand: [] }] });
  choose(g, 'a:' + handU(g, 0, 'Mask of Brutality')); passAll(g);
  const a = fieldC(g, 0, BIG); ok(E.atk(g, a) === 2900 && E.def(g, a) === 500, 'Archfiend Soldier is 2900/500');
  endTurn(g); endTurn(g);
  ok(g.prompt && g.prompt.type === 'yesno', 'asked to pay'); choose(g, 'yes');
  ok(g.p[0].lp === 7000 && inZone(g, 0, 'st', 'Mask of Brutality'), 'paid 1000, Mask stays');
  endTurn(g); endTurn(g); choose(g, 'no');
  ok(inZone(g, 0, 'gy', 'Mask of Brutality'), 'not paid, Mask destroyed');
});
T('Axe of Despair goes back on top of the Deck', () => {
  const g = duel({ board: [{ m: [BIG, FILL], hand: ['Axe of Despair', 'Mystical Space Typhoon'] }, {}] });
  choose(g, 'a:' + handU(g, 0, 'Axe of Despair')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, BIG); passAll(g);
  choose(g, 'a:' + handU(g, 0, 'Mystical Space Typhoon')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Axe'); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno', 'asked to use Axe of Despair'); choose(g, 'yes');
  if (g.prompt && g.prompt.type === 'pick') choose(g, FILL); passAll(g);
  const deck = g.p[0].deck; ok(E.name(deck[deck.length - 1]) === 'Axe of Despair' && inZone(g, 0, 'gy', FILL), 'Axe on top, Giant Soldier Tributed');
});
T('Reckless Greed: draw 2, skip the next 2 Draw Phases', () => {
  const g = duel({ board: [{ st: ['Reckless Greed'], hand: [] }, {}] });
  const h = g.p[0].hand.length;
  choose(g, 'a:' + stU(g, 0, 'Reckless Greed') + ':'); passAll(g);
  ok(g.p[0].hand.length === h + 2, 'drew 2');
  endTurn(g); endTurn(g); passAll(g);
  ok(g.p[0].hand.length === h + 2, 'no draw in the next Draw Phase');
  endTurn(g); endTurn(g); passAll(g);
  ok(g.p[0].hand.length === h + 2, 'no draw in the second one');
  endTurn(g); endTurn(g); passAll(g);
  ok(g.p[0].hand.length === h + 3, 'draws again after that');
});
T('Barrel Behind the Door turns Just Desserts around', () => {
  const g = duel({ board: [{ st: ['Just Desserts'] }, { m: [BIG, FILL], st: ['Barrel Behind the Door'] }] });
  choose(g, 'a:' + stU(g, 0, 'Just Desserts') + ':');
  ok(hasOpt(g, 'Barrel'), 'Barrel offered'); choose(g, 'Barrel'); passAll(g);
  ok(g.p[1].lp === 8000 && g.p[0].lp === 7000, 'A took the 1000 instead of B');
});
T('Chiron the Mage: discard a Spell, destroy their Spell/Trap', () => {
  const g = duel({ board: [{ m: ['Chiron the Mage'], hand: ['Pot of Greed'] }, { st: ['Sakuretsu Armor'] }] });
  choose(g, 'Discard a Spell'); passAll(g);
  ok(inZone(g, 0, 'gy', 'Pot of Greed') && inZone(g, 1, 'gy', 'Sakuretsu Armor'), 'Pot discarded, Sakuretsu destroyed');
});
T('Waboku: no battle damage, no battle destruction', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { m: [FILL], st: ['Waboku'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack ' + FILL); choose(g, 'Waboku'); passAll(g);
  ok(g.p[1].lp === 8000 && inZone(g, 1, 'm', FILL), 'Giant Soldier survives, no damage');
});
T('Giant Orc goes to Defense after attacking and stays there', () => {
  const g = duel({ board: [{ turn: 3, m: ['Giant Orc'] }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); choose(g, 'endbp'); passAll(g);
  const o = fieldC(g, 0, 'Giant Orc'); ok(o.pos === 'def' && !hasOpt(g, 'pos:'), 'Defense Position, no change in Main Phase 2');
  endTurn(g); endTurn(g);
  ok(!hasOpt(g, 'pos:'), 'still locked on the next turn');
  endTurn(g); endTurn(g);
  ok(hasOpt(g, 'pos:'), 'free the turn after');
});
T('Fengsheng Mirror discards a Spirit monster', () => {
  const g = duel({ board: [{ hand: ['Fengsheng Mirror'] }, { hand: [FILL, 'Asura Priest'] }] });
  choose(g, 'a:' + handU(g, 0, 'Fengsheng Mirror')); passAll(g);
  ok(inZone(g, 1, 'gy', 'Asura Priest') && inZone(g, 1, 'hand', FILL), 'Asura Priest discarded');
});
T('Fiend Skull Dragon negates Flip effects', () => {
  const g = duel({ board: [{ m: ['Fiend Skull Dragon'] }, { m: [{ n: 'Magician of Faith', pos: 'set' }], gy: ['Pot of Greed'] }] });
  endTurn(g); choose(g, 'Flip Summon'); passAll(g);
  ok(inZone(g, 1, 'gy', 'Pot of Greed'), 'Magician of Faith did not add Pot of Greed');
});
T('Iron Blacksmith Kotetsu adds an Equip Spell', () => {
  const g = duel({ board: [{ m: [{ n: 'Iron Blacksmith Kotetsu', pos: 'set' }], deckTop: ['United We Stand'] }, {}] });
  choose(g, 'Flip Summon'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'United'); passAll(g);
  ok(inZone(g, 0, 'hand', 'United We Stand'), 'United We Stand added');
});

console.log(fails ? `${fails} scenario check(s) failed` : 'all scenario checks passed');
process.exit(fails ? 1 : 0);
