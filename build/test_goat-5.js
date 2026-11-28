// Goat batch 5 scenario checks: node build/test_goat-5.js
// Loads the engine and every js/cards/*.js like build/test_goat.js, plays Goat, and checks the trickier goat-5.js cards.
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
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

// every listed card has a script
const list = fs.readFileSync(path.join(__dirname, 'batches/goat-5.txt'), 'utf8').split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split(' | ')[0].trim());
const missing = list.filter(n => !E.scripted(n));
ok(!missing.length, `all ${list.length} goat-5 cards are scripted${missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''}`);

T('Aqua Spirit: summoned by banishing a WATER, switches a monster in the opponent’s Standby Phase', () => {
  const g = duel({ board: [{ hand: ['Aqua Spirit'], gy: ['Lekunga'] }, { m: [BIG] }] });
  ok(!hasOpt(g, 'ns:' + handU(g, 0, 'Aqua Spirit')), 'Aqua Spirit cannot be Normal Summoned');
  choose(g, 'sp:' + handU(g, 0, 'Aqua Spirit')); passAll(g);
  ok(inZone(g, 0, 'm', 'Aqua Spirit') && inZone(g, 0, 'ban', 'Lekunga'), 'summoned, Lekunga banished');
  endTurn(g);
  ok(g.prompt && g.prompt.type === 'yesno' && /Aqua Spirit/.test(g.prompt.text), 'asked in B’s Standby Phase'); choose(g, 'yes'); passAll(g);
  const t = fieldC(g, 1, BIG);
  ok(t.pos === 'def', 'Archfiend Soldier is in Defense Position');
  passAll(g);
  ok(!hasOpt(g, 'pos:' + t.u), 'B cannot change it back this turn');
});
T('Lekunga: banish 2 WATER for a 700/700 token in Attack Position', () => {
  const g = duel({ board: [{ m: ['Lekunga'], gy: ['Catapult Turtle', 'Aqua Spirit'] }, {}] });
  choose(g, 'Banish 2 WATER'); passAll(g);
  const t = fieldC(g, 0, 'Lekunga Token');
  ok(t && t.pos === 'atk' && E.atk(g, t) === 700 && g.p[0].ban.length === 2, 'Lekunga Token summoned, 2 banished');
});
T('Dark Flare Knight: no battle damage, Mirage Knight when destroyed by battle', () => {
  const g = duel({ board: [{ turn: 3, m: ['Dark Flare Knight'], deckTop: ['Mirage Knight'] }, { m: ['Black Skull Dragon'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Black Skull'); passAll(g);
  ok(g.p[0].lp === 8000, 'A took no battle damage');
  ok(inZone(g, 0, 'gy', 'Dark Flare Knight') && inZone(g, 0, 'm', 'Mirage Knight'), 'Mirage Knight Special Summoned from the Deck');
});
T('King Dragun: summons a Dragon from the hand; the opponent cannot target it', () => {
  const g = duel({ board: [{ m: ['King Dragun', 'Lekunga'], hand: ['Red-Eyes Black Dragon'] }, { hand: ['Book of Moon'] }] });
  choose(g, 'Summon a Dragon'); passAll(g);
  ok(inZone(g, 0, 'm', 'Red-Eyes Black Dragon'), 'Red-Eyes Special Summoned');
  ok(!hasOpt(g, 'Summon a Dragon'), 'once per turn');
  endTurn(g);
  choose(g, 'a:' + handU(g, 1, 'Book of Moon'));
  if (g.prompt && g.prompt.type === 'pick') ok(!g.prompt.opts.some(o => /King Dragun|Red-Eyes/.test(o.label)), 'B is offered no Dragon'); passAll(g);
  ok(fieldC(g, 0, 'Lekunga').pos === 'set' && fieldC(g, 0, 'King Dragun').pos === 'atk' && fieldC(g, 0, 'Red-Eyes Black Dragon').pos === 'atk', 'Book of Moon could only hit Lekunga');
});
T('King Dragun: its controller can still target King Dragun', () => {
  const g = duel({ board: [{ m: ['King Dragun', 'Lekunga'], hand: ['Book of Moon'] }, {}] });
  choose(g, 'a:' + handU(g, 0, 'Book of Moon'));
  ok(g.prompt && g.prompt.type === 'pick' && g.prompt.opts.some(o => /King Dragun/.test(o.label)), 'A may pick King Dragun');
});
T('Magic Jammer: discard 1, negate and destroy a Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'] }, { st: ['Magic Jammer'], hand: [FILL] }] });
  const h0 = g.p[0].hand.length;
  choose(g, 'a:' + handU(g, 0, 'Pot of Greed'));
  ok(hasOpt(g, 'Magic Jammer'), 'Magic Jammer can chain'); choose(g, 'Magic Jammer'); passAll(g);
  ok(g.p[0].hand.length === h0 - 1 && inZone(g, 0, 'gy', 'Pot of Greed') && g.p[1].hand.length === 0 && inZone(g, 1, 'gy', 'Magic Jammer'), 'Pot negated, B discarded 1');
});
T('Gearfried destroys Smoke Grenade of the Thief, which then discards from their hand', () => {
  const g = duel({ board: [{ m: ['Gearfried the Iron Knight'], hand: ['Smoke Grenade of the Thief'] }, { hand: [FILL, BIG] }] });
  choose(g, 'a:' + handU(g, 0, 'Smoke Grenade of the Thief')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick' && /Equip/.test(g.prompt.text)) choose(g, 'Gearfried'); passAll(g);
  ok(g.prompt && g.prompt.type === 'pick' && g.prompt.p === 0, 'A picks the discard'); choose(g, BIG); passAll(g);
  ok(inZone(g, 0, 'gy', 'Smoke Grenade of the Thief') && inZone(g, 1, 'gy', BIG) && g.p[1].hand.length === 1 && inZone(g, 0, 'm', 'Gearfried the Iron Knight'), 'Smoke Grenade destroyed, Archfiend Soldier discarded');
});
T('Golem Sentry: Flip Summon bounces a monster, then it turns itself face-down', () => {
  const g = duel({ board: [{ m: [{ n: 'Golem Sentry', pos: 'set' }] }, { m: [BIG] }] });
  choose(g, 'Flip Summon'); passAll(g);
  ok(inZone(g, 1, 'hand', BIG), 'Archfiend Soldier returned to the hand');
  ok(hasOpt(g, 'Turn face-down'), 'it can turn face-down the turn it was Flip Summoned (RULING? decided by EDOPro: once per turn only; 2026-11-28 audit)');
  endTurn(g); endTurn(g);
  choose(g, 'Turn face-down'); passAll(g);
  ok(fieldC(g, 0, 'Golem Sentry').pos === 'set', 'Golem Sentry is face-down again');
});
T('Mask of Darkness: flip, add a Trap from the GY', () => {
  const g = duel({ board: [{ m: [{ n: 'Mask of Darkness', pos: 'set' }], gy: ['Magic Jammer'] }, {}] });
  choose(g, 'Flip Summon'); passAll(g);
  ok(inZone(g, 0, 'hand', 'Magic Jammer'), 'Magic Jammer back in the hand');
});
T('Catapult Turtle Tributes Emissary of the Afterlife: damage, then each player adds a Normal Monster', () => {
  const g = duel({ board: [{ m: ['Catapult Turtle', 'Emissary of the Afterlife'] }, {}] });
  const h0 = g.p[0].hand.length, h1 = g.p[1].hand.length;
  choose(g, 'Tribute a monster');
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Emissary'); passAll(g);
  for (let i = 0; i < 4 && g.prompt && g.prompt.type === 'pick'; i++) { E.act(g, [g.prompt.opts[0].key]); passAll(g); }
  ok(g.p[1].lp === 7200, 'B took 800 (half of 1600)');
  ok(g.p[0].hand.length === h0 + 1 && g.p[1].hand.length === h1 + 1, 'each player added a card');
  ok(hasOpt(g, 'Tribute a monster'), 'no once-per-turn limit in 2005');
});
T('Kuriboh: discard in the Damage Step, no battle damage', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { hand: ['Kuriboh'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'respond' && !hasOpt(g, 'Kuriboh'); i++) E.act(g, ['pass']);
  ok(hasOpt(g, 'Kuriboh'), 'Kuriboh offered in the Damage Step'); choose(g, 'Kuriboh'); passAll(g);
  ok(g.p[1].lp === 8000 && inZone(g, 1, 'gy', 'Kuriboh'), 'no damage, Kuriboh in the GY');
  endTurn(g); endTurn(g); choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g);
  ok(g.p[1].lp === 6100, 'the next attack deals damage again');
});
T('Cliff the Trap Remover: battle damage, destroy a Spell/Trap', () => {
  const g = duel({ board: [{ turn: 3, m: ['Dark Scorpion - Cliff the Trap Remover'] }, { st: ['Magic Jammer'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno', 'asked to use Cliff'); choose(g, 'yes');
  choose(g, 'Destroy 1 Spell'); if (g.prompt && g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); passAll(g);
  ok(inZone(g, 1, 'gy', 'Magic Jammer'), 'the Set card was destroyed');
});
T('Cliff the Trap Remover: mill 2 when there is no Spell/Trap', () => {
  const g = duel({ board: [{ turn: 3, m: ['Dark Scorpion - Cliff the Trap Remover'] }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g);
  choose(g, 'yes'); passAll(g);
  ok(g.p[1].gy.length === 2, 'two cards milled');
});
T('Token Thanksgiving: destroy the tokens, 800 LP each', () => {
  const g = duel({ board: [{ hand: ['Token Thanksgiving'] }, { m: ['Sheep Token', 'Sheep Token', BIG] }] });
  choose(g, 'a:' + handU(g, 0, 'Token Thanksgiving')); passAll(g);
  ok(g.p[0].lp === 9600 && g.p[1].m.filter(Boolean).length === 1, 'gained 1600, tokens gone');
});
T('Back to Square One: discard 1, put a monster on top of the Deck', () => {
  const g = duel({ board: [{ hand: ['Back to Square One', FILL] }, { m: [BIG] }] });
  choose(g, 'a:' + handU(g, 0, 'Back to Square One'));
  if (g.prompt && g.prompt.type === 'pick' && /Discard/.test(g.prompt.text)) E.act(g, [g.prompt.opts[0].key]);
  passAll(g);
  const top = g.p[1].deck[g.p[1].deck.length - 1];
  ok(E.name(top) === BIG && g.p[1].m.filter(Boolean).length === 0, 'Archfiend Soldier is on top of B’s Deck');
});
T('Light of Intervention: no monster Sets, no Book of Moon', () => {
  const g = duel({ board: [{ st: [{ n: 'Light of Intervention', pos: 'up' }], hand: [FILL, 'Book of Moon'], m: [BIG] }, {}] });
  ok(g.prompt.opts.filter(o => o.key === 'set:' + handU(g, 0, FILL)).every(o => o.label === 'Normal Summon in Defense') && hasOpt(g, 'ns:' + handU(g, 0, FILL)), 'Normal Summon allowed; a Set is a face-up Defense Normal Summon (2026-11-28 audit, E4c)');
  ok(!hasOpt(g, 'a:' + handU(g, 0, 'Book of Moon')), 'Book of Moon cannot be activated');
});

console.log(fails ? `${fails} check(s) failed` : 'all goat-5 checks passed');
process.exit(fails ? 1 : 0);
