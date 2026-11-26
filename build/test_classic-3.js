// Scenario checks for classic batch 3 (js/cards/classic-3.js): node build/test_classic-3.js
// Loads the Goat data plus play/data/classic-cards.js and every js/cards/*.js, then plays Goat.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console, Math }; ctx.self = ctx.window; vm.createContext(ctx);
const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'play/data/classic-cards.js', 'js/engine.js'];
for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const E = ctx.window.EdisonEngine, C = [...ctx.window.GOAT_CARDS, ...ctx.window.CLASSIC_CARDS.filter(c => !ctx.window.GOAT_CARDS.some(g => g.n === c.n))];
E.init(C, { format: 'goat' });

const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Giant Soldier of Stone';
function duel(o = {}) {
  const mk = () => ({ name: 't', main: Array(40).fill(id(FILL)), extra: [] });
  return E.newDuel({ decks: [mk(), mk()], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
}
let fails = 0;
function ok(cond, msg) { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; }
function choose(g, text) {
  const pr = g.prompt; if (!pr) throw new Error('no prompt for ' + text);
  const o = pr.opts.find(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
  if (!o) throw new Error(`no option "${text}" in ${pr.type} "${pr.text}": ${pr.opts.map(x => x.label + '[' + x.key + ']').join(', ')}`);
  E.act(g, [o.key]);
}
// pass every window; answer yes/no with yes; picks take the first options
const settle = (g, upto = 40) => { for (let i = 0; i < upto && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; E.act(g, pr.type === 'respond' ? ['pass'] : pr.type === 'yesno' ? ['y'] : pr.opts.slice(0, Math.max(1, pr.min)).map(o => o.key)); } };
const cardIn = (g, p, n) => [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy].find(c => c && E.name(c) === n);
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const attack = (g, target) => { choose(g, 'bp'); settle(g); choose(g, target); settle(g); };

T('Valkyrion: summon by Tributing the three, then split back into them', () => {
  const g = duel({ board: [{ hand: ['Valkyrion the Magna Warrior', 'Alpha The Magnet Warrior'], m: ['Beta The Magnet Warrior', 'Gamma the Magnet Warrior'] }, {}] });
  choose(g, 'sp:' + cardIn(g, 0, 'Valkyrion the Magna Warrior').u); settle(g);
  ok(!!on(g, 0, 'Valkyrion the Magna Warrior') && g.p[0].gy.length === 3, 'Valkyrion is on the field, the three in the GY');
  choose(g, 'a:' + cardIn(g, 0, 'Valkyrion the Magna Warrior').u + ':'); settle(g);
  ok(g.p[0].m.filter(Boolean).length === 3 && inZ(g, 0, 'gy', 'Valkyrion the Magna Warrior'), 'Alpha, Beta and Gamma are back');
});
T('Kiseitai becomes an Equip Card and the attack stops', () => {
  const g = duel({ board: [{ hand: [], m: ['Panther Warrior', 'Giant Soldier of Stone'], turn: 2 }, { m: [{ n: 'Kiseitai', pos: 'set' }] }] });
  attack(g, 'face-down'); settle(g);
  const k = cardIn(g, 1, 'Kiseitai');
  ok(k && k.zone === 'st' && k.equipTo === on(g, 0, 'Panther Warrior').u, 'Kiseitai is equipped to Panther Warrior');
  ok(g.p[0].m.filter(Boolean).length === 1, 'Panther Warrior Tributed a monster to attack');
});
T('Stone Statue doubles the attacker’s battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Giant Soldier of Stone'], turn: 2 }, { m: [{ n: 'Stone Statue of the Aztecs', pos: 'def' }] }] });
  attack(g, 'Stone Statue'); settle(g);
  ok(g.p[0].lp === 8000 - 2 * (2000 - 1300), `A at ${g.p[0].lp}`);
});
T('Wall of Illusion returns its attacker', () => {
  const g = duel({ board: [{ hand: [], m: ['Giant Soldier of Stone'], turn: 2 }, { m: [{ n: 'Wall of Illusion', pos: 'def' }] }] });
  attack(g, 'Wall of Illusion'); settle(g);
  ok(inZ(g, 0, 'hand', 'Giant Soldier of Stone') && !!on(g, 1, 'Wall of Illusion'), 'attacker in the hand');
});
T('Dark Necrofear takes a monster in the End Phase after a battle loss', () => {
  const g = duel({ board: [{ hand: [], m: ['Giant Soldier of Stone'], turn: 2 }, { m: [{ n: 'Dark Necrofear', pos: 'atk' }] }] });
  const nf = cardIn(g, 1, 'Dark Necrofear'); nf.nomiOk = true;
  g.p[0].m[0].mods.push({ atk: 1000, turn: 2 }); // 2300 ATK beats 2200
  attack(g, 'Dark Necrofear'); settle(g);
  for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'idle'; i++) { if (g.phase === 'battle') choose(g, 'endbp'); else choose(g, 'end'); settle(g); }
  ok(nf.zone === 'st' && g.p[1].m.some(c => c && E.name(c) === 'Giant Soldier of Stone'), 'B controls Giant Soldier with Necrofear equipped');
});
T('Parasite Paracide goes into their Deck and hits them when drawn', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Parasite Paracide', pos: 'set' }], turn: 2 }, {}] });
  const pc = cardIn(g, 0, 'Parasite Paracide');
  choose(g, 'flip:' + pc.u); settle(g);
  ok(pc.zone === 'deck' && g.p[1].deck.includes(pc), 'in B’s Deck');
  g.p[1].deck.splice(g.p[1].deck.indexOf(pc), 1); g.p[1].deck.push(pc); // put it on top
  choose(g, 'end'); settle(g);
  ok(pc.zone === 'm' && pc.ctrl === 1 && pc.owner === 0 && g.p[1].lp === 7000, `summoned to B's field, B at ${g.p[1].lp}`);
});
T('Gernia comes back after an opponent’s card destroys it', () => {
  const g = duel({ board: [{ hand: [], m: ['Gernia'], turn: 2 }, { hand: [], st: ['Ring of Destruction'] }] });
  const gr = cardIn(g, 0, 'Gernia');
  choose(g, 'end'); settle(g);
  // B's turn: activate Ring on Gernia
  choose(g, 'a:' + cardIn(g, 1, 'Ring of Destruction').u + ':'); settle(g);
  ok(gr.zone === 'gy', 'Gernia destroyed');
  choose(g, 'end'); settle(g);
  ok(gr.zone === 'm', 'Gernia returned in A’s Standby Phase');
});
console.log(fails ? `\n${fails} check(s) failed.` : '\nAll classic-3 checks passed.');
process.exit(fails ? 1 : 0);
