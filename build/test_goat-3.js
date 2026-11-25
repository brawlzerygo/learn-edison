// Goat batch 3 scenario checks: node build/test_goat-3.js
// Loads the engine and every js/cards/*.js like build/test_goat.js, plays Goat, then checks the trickier goat-3.js cards.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math }; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const E = ctx.window.EdisonEngine, C = ctx.window.GOAT_CARDS;
E.init(C, { format: 'goat' });
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };

// every card in the batch list has a Goat script
const list = fs.readFileSync(path.join(__dirname, 'batches/goat-3.txt'), 'utf8').split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('|')[0].trim());
const missing = list.filter(n => !E.scripted(n));

const FILL = 'Giant Soldier of Stone', BIG = 'Archfiend Soldier';
function duel(o = {}) {
  const mk = ex => ({ name: 't', main: Array(40).fill(id(FILL)), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0), mk(o.ex1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const fieldC = (g, p, n) => E.fieldOf(g, p).find(c => E.name(c) === n);
const passAll = (g, upto = 30) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const passUntil = (g, text, upto = 30) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond' && !hasOpt(g, text); i++) E.act(g, ['pass']); return hasOpt(g, text); };
const inZone = (g, p, z, n) => (Array.isArray(g.p[p][z]) ? g.p[p][z] : [g.p[p][z]]).some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

ok(!missing.length, 'every goat-3 card is scripted' + (missing.length ? ': missing ' + missing.join(', ') : ''));

T('Exiled Force', () => {
  const g = duel({ board: [{ m: ['Exiled Force'] }, { m: [BIG] }] });
  choose(g, 'Tribute: destroy'); passAll(g);
  ok(inZone(g, 0, 'gy', 'Exiled Force') && inZone(g, 1, 'gy', BIG), 'Exiled Force Tributed, Archfiend Soldier destroyed');
});
T('Ninja Grandmaster Sasuke', () => {
  const g = duel({ board: [{ turn: 3, m: ['Ninja Grandmaster Sasuke'] }, { m: [{ n: 'Big Shield Gardna', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Big Shield'); passAll(g);
  ok(inZone(g, 1, 'gy', 'Big Shield Gardna') && g.p[0].lp === 8000, 'face-up Defense monster destroyed at the start of the Damage Step, no damage');
});
T('Mystic Swordsman LV2', () => {
  const g = duel({ board: [{ turn: 3, m: ['Mystic Swordsman LV2'] }, { m: [{ n: 'Magician of Faith', pos: 'set' }], gy: ['Pot of Greed'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); passAll(g);
  ok(inZone(g, 1, 'gy', 'Magician of Faith') && inZone(g, 1, 'gy', 'Pot of Greed'), 'face-down monster destroyed unflipped (no Flip effect)');
});
T('Blade Knight', () => {
  const g = duel({ board: [{ turn: 3, m: ['Blade Knight'], hand: [FILL] }, { m: [{ n: 'Magician of Faith', pos: 'set' }], gy: ['Pot of Greed'] }] });
  const bk = fieldC(g, 0, 'Blade Knight');
  ok(E.atk(g, bk) === 1600, '1600 ATK with 2 cards in hand (drew 1)');
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); passAll(g);
  ok(inZone(g, 1, 'gy', 'Magician of Faith') && inZone(g, 1, 'gy', 'Pot of Greed'), 'Magician of Faith destroyed, its Flip effect negated');
  const g2 = duel({ board: [{ m: ['Blade Knight'], hand: [] }, {}] });
  ok(E.atk(g2, fieldC(g2, 0, 'Blade Knight')) === 2000, '2000 ATK with 1 card in hand');
});
T('Zombyra the Dark', () => {
  const g = duel({ board: [{ turn: 3, m: ['Zombyra the Dark'] }, {}] });
  choose(g, 'bp'); passAll(g);
  ok(!hasOpt(g, 'Attack directly'), 'no direct attack');
  const g2 = duel({ board: [{ turn: 3, m: ['Zombyra the Dark'] }, { m: [BIG] }] });
  choose(g2, 'bp'); passAll(g2); choose(g2, 'Attack ' + BIG); passAll(g2);
  ok(E.atk(g2, fieldC(g2, 0, 'Zombyra the Dark')) === 1900, 'lost 200 ATK after destroying a monster');
});
T('Injection Fairy Lily', () => {
  const g = duel({ board: [{ turn: 3, m: ['Injection Fairy Lily'] }, { m: [BIG] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack ' + BIG);
  ok(passUntil(g, 'Pay 2000'), 'Lily offered in the Damage Step'); choose(g, 'Pay 2000'); passAll(g);
  ok(inZone(g, 1, 'gy', BIG) && g.p[0].lp === 6000 && g.p[1].lp === 8000 - 1500, 'paid 2000, 3400 ATK beat Archfiend Soldier for 1500');
});
T('Cipher Soldier', () => {
  const g = duel({ board: [{ turn: 3, m: ['Cipher Soldier'] }, { m: [{ n: 'Big Shield Gardna', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Big Shield'); passAll(g);
  ok(inZone(g, 1, 'gy', 'Big Shield Gardna') && g.p[0].lp === 8000, '3350 ATK against a Warrior beats 2600 DEF');
  ok(E.atk(g, fieldC(g, 0, 'Cipher Soldier')) === 1350, 'back to 1350 after the battle');
});
T('Don Zaloog', () => {
  const g = duel({ board: [{ turn: 3, m: ['Don Zaloog'] }, {}] });
  const d = g.p[1].deck.length;
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g);
  if (g.prompt && g.prompt.type === 'yesno') choose(g, 'yes'); passAll(g);
  if (g.prompt && g.prompt.type === 'choose') choose(g, 'top 2'); passAll(g);
  ok(g.p[1].lp === 6600 && g.p[1].deck.length === d - 2, '1400 damage, top 2 cards milled');
});
T('Vampire Lord', () => {
  const g = duel({ board: [{ turn: 3, m: ['Vampire Lord'] }, {}] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g);
  choose(g, 'Monster'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); passAll(g);
  ok(g.p[1].gy.length === 1 && g.p[1].lp === 6000, 'B sent a monster from the Deck');
});
T('Vampire Lord revives after an opponent’s effect', () => {
  const g = duel({ board: [{ m: ['Vampire Lord'] }, { hand: ['Tribute to the Doomed', FILL] }] });
  passAll(g); choose(g, 'end'); passAll(g);
  choose(g, 'a:' + handU(g, 1, 'Tribute to the Doomed')); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, 'Vampire'); passAll(g);
  ok(inZone(g, 0, 'gy', 'Vampire Lord'), 'destroyed by Tribute to the Doomed');
  passAll(g); choose(g, 'end'); passAll(g);
  for (let i = 0; i < 5 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); else passAll(g); }
  ok(inZone(g, 0, 'm', 'Vampire Lord'), 'back on the field in A’s Standby Phase');
});
T('Newdoria', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { m: ['Newdoria', FILL] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Newdoria'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, BIG); passAll(g);
  ok(inZone(g, 1, 'gy', 'Newdoria') && inZone(g, 0, 'gy', BIG), 'Newdoria destroyed by battle took Archfiend Soldier with it');
});
T('Zaborg the Thunder Monarch', () => {
  const g = duel({ board: [{ hand: ['Zaborg the Thunder Monarch'], m: [FILL] }, { m: [BIG] }] });
  choose(g, 'ns:' + handU(g, 0, 'Zaborg the Thunder Monarch'));
  if (g.prompt && g.prompt.type === 'pick' && /Tribute/.test(g.prompt.text)) choose(g, FILL); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') choose(g, BIG); passAll(g);
  ok(inZone(g, 1, 'gy', BIG), 'Tribute Summon destroyed Archfiend Soldier');
});
T('Peten the Dark Clown', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { m: ['Peten the Dark Clown'], deckTop: ['Peten the Dark Clown'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Peten'); passAll(g);
  ok(g.prompt && g.prompt.type === 'yesno' && /Peten/.test(g.prompt.text), 'B is asked to use Peten'); choose(g, 'yes'); passAll(g);
  ok(inZone(g, 1, 'ban', 'Peten the Dark Clown') && inZone(g, 1, 'm', 'Peten the Dark Clown'), 'banished, another Peten summoned from the Deck');
});
T('Banisher of the Light', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { m: ['Banisher of the Light', { n: 'Sangan', pos: 'atk' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Sangan'); passAll(g);
  ok(inZone(g, 1, 'ban', 'Sangan') && !inZone(g, 1, 'gy', 'Sangan') && !(g.prompt && g.prompt.type === 'yesno'), 'Sangan banished instead, no search');
});
T('Cursed Seal of the Forbidden Spell', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', 'Pot of Greed'] }, { st: ['Cursed Seal of the Forbidden Spell'], hand: ['Mystical Space Typhoon'] }] });
  const h = g.p[0].hand.length;
  choose(g, 'a:' + handU(g, 0, 'Pot of Greed'));
  ok(hasOpt(g, 'Cursed Seal'), 'B can chain Cursed Seal'); choose(g, 'Cursed Seal'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); passAll(g);
  ok(g.p[0].hand.length === h - 1 && inZone(g, 0, 'gy', 'Pot of Greed'), 'Pot of Greed negated, no draw');
  ok(!hasOpt(g, 'a:' + handU(g, 0, 'Pot of Greed')), 'A cannot activate Pot of Greed again');
});
T('Xing Zhen Hu', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG], st: ['Xing Zhen Hu'] }, { st: ['Sakuretsu Armor', 'Sakuretsu Armor'] }] });
  choose(g, 'a:' + g.p[0].st.find(Boolean).u + ':'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.slice(0, 2).map(o => o.key)); passAll(g);
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  ok(!hasOpt(g, 'Sakuretsu'), 'the locked Sakuretsu Armors cannot be activated');
});
T('Hallowed Life Barrier', () => {
  const g = duel({ board: [{ turn: 3, m: [BIG] }, { st: ['Hallowed Life Barrier'], hand: [FILL] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly');
  ok(hasOpt(g, 'Activate'), 'B can activate it'); choose(g, 'a:' + g.p[1].st.find(Boolean).u + ':');
  if (g.prompt && g.prompt.type === 'pick') E.act(g, [g.prompt.opts[0].key]); passAll(g);
  ok(g.p[1].lp === 8000, 'no damage from the direct attack');
});
T('Mystik Wok', () => {
  const g = duel({ board: [{ hand: ['Mystik Wok'], m: [BIG] }, {}] });
  choose(g, 'a:' + handU(g, 0, 'Mystik Wok')); passAll(g);
  choose(g, 'ATK'); passAll(g);
  ok(g.p[0].lp === 9900 && inZone(g, 0, 'gy', BIG), 'Tributed Archfiend Soldier, gained 1900');
});
T('Bazoo the Soul-Eater', () => {
  const g = duel({ board: [{ m: ['Bazoo the Soul-Eater'], gy: [FILL, BIG] }, {}] });
  choose(g, 'Banish up to 3'); if (g.prompt && g.prompt.type === 'pick') E.act(g, g.prompt.opts.map(o => o.key)); passAll(g);
  const b = fieldC(g, 0, 'Bazoo the Soul-Eater');
  ok(E.atk(g, b) === 2200, '2 banished: 2200 ATK');
  passAll(g); choose(g, 'end'); passAll(g);
  ok(E.atk(g, b) === 2200, 'still 2200 in the opponent’s turn');
  passAll(g); choose(g, 'end'); passAll(g);
  ok(E.atk(g, b) === 1600, 'back to 1600 on A’s next turn');
});
T('Berserk Gorilla', () => {
  const g = duel({ board: [{ turn: 3, m: ['Berserk Gorilla'] }, {}] });
  choose(g, 'Change to Defense'); passAll(g);
  ok(inZone(g, 0, 'gy', 'Berserk Gorilla'), 'destroyed in face-up Defense Position');
});

console.log(fails ? `${fails} check(s) failed` : 'all goat-3 checks passed');
process.exit(fails ? 1 : 0);
