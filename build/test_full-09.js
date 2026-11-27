// Scenario checks for full pool batch 09: node build/test_full-09.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = (ex, main) => ({ name: 't', main: (main || []).map(id).concat(Array(40).fill(id(FILL))).slice(0, 40).reverse(), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0, o.deck0), mk(o.ex1, o.deck1)], first: 0, seed: o.seed || 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
function auto(g, o = {}) {
  for (let i = 0; i < 80 && g.prompt && g.prompt.type !== 'idle'; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') E.act(g, [o.no ? 'n' : 'y']);
    else if (pr.type === 'choose') E.act(g, [pr.opts[0].key]);
    else if (o.stop && pr.opts.some(x => x.label === FILL)) E.act(g, [pr.opts.find(x => x.label === FILL).key]);
    else E.act(g, pr.opts.slice(0, Math.max(pr.min, Math.min(pr.max, 1))).map(x => x.key));
  }
}
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n).u + ':');
const eff = (g, c, ei) => choose(g, `a:${c.u}:${ei}`);
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const st = (g, p, n) => g.p[p].st.find(c => c && E.name(c) === n);
const hand = (g, p, n) => g.p[p].hand.find(c => E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
const goBP = g => { choose(g, 'bp'); passAll(g); };
const attack = (g, a, t) => choose(g, `atk:${a.u}:${t ? t.u : 'd'}`);
const L = E.lib;
const refresh = g => { g.prompt = { ...g.prompt, opts: E.idleOpts(g) }; };
const endTurn = g => { choose(g, 'end'); auto(g); };

T('Grave Lure: the face-up card is sent to the GY when drawn', () => {
  const g = duel({ board: [{ st: ['Grave Lure'] }, {}] });
  act(g, 0, 'Grave Lure'); auto(g);
  const x = g.p[1].deck.find(c => c.flags.lure); ok(!!x, 'a card in B\'s Deck is marked');
  const d = g.p[1].deck; d.splice(d.indexOf(x), 1); d.push(x);
  endTurn(g);
  ok(x.zone === 'gy', `the drawn face-up card went to the GY (${x.zone})`);
});
T('Grave of the Super Ancient Organism locks Special Summoned Level 6+', () => {
  const g = duel({ board: [{ st: [{ n: 'Grave of the Super Ancient Organism', pos: 'up' }] }, { m: ['Great Dezard', 'Gravekeeper\'s Curse'] }] });
  const dz = on(g, 1, 'Great Dezard'); dz.summonType = 'special'; g.seq++;
  ok(L.forbid(g, { type: 'attack', c: dz }), 'a Special Summoned Level 6 can\'t attack');
  dz.summonType = 'normal'; g.seq++;
  ok(!L.forbid(g, { type: 'attack', c: dz }), 'a Tribute/Normal Summoned one can');
});
T('Grave Ohja: no attack target with a Set monster, 300 on a Flip Summon', () => {
  const g = duel({ board: [{ m: ['Grave Ohja', { n: FILL, pos: 'set' }], turn: 2 }, {}] });
  ok(L.has(g, on(g, 0, 'Grave Ohja'), 'noAttackTarget'), 'Ohja can\'t be attacked');
  choose(g, 'flip:'); auto(g);
  ok(g.p[1].lp === 7700, `B took 300 (B ${g.p[1].lp})`);
});
T('Grave Protector shuffles battle-destroyed monsters into the Deck', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Grave Protector', 'Gravekeeper\'s Curse'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Gravekeeper\'s Curse')); auto(g);
  ok(g.p[1].deck.some(c => E.name(c) === 'Gravekeeper\'s Curse') && !inZ(g, 1, 'gy', 'Gravekeeper\'s Curse'), 'Curse is in B\'s Deck, not the GY');
});
T('Grave Squirmer destroys a card when destroyed by battle', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Grave Squirmer'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Grave Squirmer')); auto(g);
  ok(inZ(g, 0, 'gy', FILL), 'the attacker was destroyed');
});
T('Gravekeeper\'s Cannonholder: Tribute a Gravekeeper\'s for 700', () => {
  const g = duel({ board: [{ m: ['Gravekeeper\'s Cannonholder', 'Gravekeeper\'s Spear Soldier'] }, {}] });
  eff(g, on(g, 0, 'Gravekeeper\'s Cannonholder'), 0); auto(g);
  ok(g.p[1].lp === 7300 && inZ(g, 0, 'gy', 'Gravekeeper\'s Spear Soldier'), `700 damage (B ${g.p[1].lp})`);
});
T('Gravekeeper\'s Chief revives a Gravekeeper\'s; Curse burns on its summon', () => {
  const g = duel({ board: [{ hand: ['Gravekeeper\'s Chief'], m: [FILL], gy: ['Gravekeeper\'s Curse'] }, {}] });
  choose(g, 'ns:'); auto(g);
  ok(on(g, 0, 'Gravekeeper\'s Chief') && on(g, 0, 'Gravekeeper\'s Curse'), 'Chief and Curse on the field');
  ok(g.p[1].lp === 7500, `Curse did 500 (B ${g.p[1].lp})`);
  const c2 = { id: id('Gravekeeper\'s Chief') }; ok(L.forbid(g, { type: 'ns', c: c2, p: 0 }), 'a second face-up Chief is blocked');
});
T('Gravekeeper\'s Guard bounces on its Flip', () => {
  const g = duel({ board: [{ m: [{ n: 'Gravekeeper\'s Guard', pos: 'set' }], turn: 2 }, { m: [FILL] }] });
  choose(g, 'flip:'); auto(g);
  ok(inZ(g, 1, 'hand', FILL) && !on(g, 1, FILL), 'B\'s monster returned to the hand');
});
T('Gravekeeper\'s Priestess: +200 and Necrovalley with no Field Spell', () => {
  const g = duel({ board: [{ m: ['Gravekeeper\'s Priestess', 'Gravekeeper\'s Curse'] }, {}] });
  ok(L.atk(g, on(g, 0, 'Gravekeeper\'s Curse')) === 1500, `Curse has 1500 (${L.atk(g, on(g, 0, 'Gravekeeper\'s Curse'))})`);
  ok(L.forbid(g, { type: 'banish', from: 'gy', p: 1 }), 'GY banishing is blocked');
});
T('Gravekeeper\'s Servant: the attacker sends a card from the Deck', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { st: [{ n: 'Gravekeeper\'s Servant', pos: 'up' }] }] });
  const n = g.p[0].deck.length; goBP(g); attack(g, on(g, 0, FILL), null); auto(g);
  ok(g.p[0].deck.length === n - 1 && g.p[0].gy.length === 1, 'A sent 1 card to the GY to attack');
});
T('Gravekeeper\'s Vassal: its battle damage is effect damage', () => {
  const g = duel({ board: [{ m: ['Gravekeeper\'s Vassal'], turn: 2 }, {}] });
  goBP(g); attack(g, on(g, 0, 'Gravekeeper\'s Vassal'), null); auto(g);
  const dm = g.events.filter(e => e.type === 'damage' && e.p === 1);
  ok(g.p[1].lp === 7300 && dm.length === 1 && !dm[0].battle, `700 effect damage (B ${g.p[1].lp})`);
});
T('Gravekeeper\'s Visionary: ATK and the discard replacement', () => {
  const g = duel({ board: [{ hand: ['Gravekeeper\'s Curse'], m: ['Gravekeeper\'s Visionary'], gy: ['Gravekeeper\'s Guard', 'Gravekeeper\'s Spear Soldier'] }, {}] });
  const v = on(g, 0, 'Gravekeeper\'s Visionary'); ok(L.atk(g, v) === 2400, `2400 ATK (${L.atk(g, v)})`);
  L.destroy(g, [v], { by: 1 });
  ok(onField(v) && inZ(g, 0, 'gy', 'Gravekeeper\'s Curse'), 'Visionary stays, Curse discarded');
});
function onField(c) { return c.zone === 'm' || c.zone === 'st'; }
T('Gravekeeper\'s Watcher negates Graceful Charity', () => {
  const g = duel({ board: [{ hand: ['Graceful Charity'] }, { hand: ['Gravekeeper\'s Watcher'] }] });
  const h = g.p[0].hand.length; act(g, 0, 'Graceful Charity'); choose(g, 'Watcher', 1); auto(g);
  ok(inZ(g, 0, 'gy', 'Graceful Charity') && g.p[0].hand.length === h - 1 && inZ(g, 1, 'gy', 'Gravekeeper\'s Watcher'), 'Charity negated, no draw');
});
T('Gravity Axe - Grarl: +500 and the position lock', () => {
  const g = duel({ board: [{ hand: ['Gravity Axe - Grarl'], m: [FILL] }, { m: ['Gravekeeper\'s Curse'] }] });
  act(g, 0, 'Gravity Axe - Grarl'); auto(g);
  ok(L.atk(g, on(g, 0, FILL)) === 2500, 'Warwolf has 2500');
  ok(L.forbid(g, { type: 'pos', c: on(g, 1, 'Gravekeeper\'s Curse') }) && !L.forbid(g, { type: 'pos', c: on(g, 0, FILL) }), 'only B\'s monsters are locked');
});
T('Great Dezard negates a Spell that targets it; summons Fushioh Richie', () => {
  const g = duel({ deck0: ['Fushioh Richie'], board: [{ hand: ['Book of Moon'], m: ['Great Dezard'] }, {}] });
  const dz = on(g, 0, 'Great Dezard'); dz.flags.dezard = 1;
  act(g, 0, 'Book of Moon'); ok(hasOpt(g, 'Negate a Spell/Trap'), 'negation offered'); choose(g, 'Negate a Spell/Trap'); auto(g);
  ok(dz.pos === 'atk' && inZ(g, 0, 'gy', 'Book of Moon'), 'Dezard stays face-up');
  dz.flags.dezard = 2; refresh(g); choose(g, 'Fushioh Richie'); auto(g);
  ok(on(g, 0, 'Fushioh Richie') && inZ(g, 0, 'gy', 'Great Dezard'), 'Fushioh Richie summoned');
});
T('Great Long Nose: opponent skips the next Battle Phase', () => {
  const g = duel({ board: [{ m: ['Great Long Nose'], turn: 2 }, {}] });
  goBP(g); attack(g, on(g, 0, 'Great Long Nose'), null); auto(g); choose(g, 'endbp'); auto(g); endTurn(g);
  ok(g.tp === 1 && !hasOpt(g, 'Battle Phase'), 'B has no Battle Phase option');
  ok(L.forbid(g, { type: 'ss', c: { id: id('Great Long Nose') }, p: 0 }), 'it can\'t be Special Summoned');
});
T('Great Maju Garzett doubles its Tribute\'s original ATK', () => {
  const g = duel({ board: [{ hand: ['Great Maju Garzett'], m: [FILL] }, {}] });
  choose(g, 'ns:'); auto(g); ok(L.atk(g, on(g, 0, 'Great Maju Garzett')) === 4000, '4000 ATK');
});
T('Great Moth summon via the idle menu', () => {
  const g = duel({ board: [{ hand: ['Great Moth', 'Petit Moth'], st: [{ n: 'Cocoon of Evolution', pos: 'up' }] }, {}] });
  const co = st(g, 0, 'Cocoon of Evolution'); choose(g, 'ns:' + hand(g, 0, 'Petit Moth').u); auto(g);
  const pm = on(g, 0, 'Petit Moth'); co.equipTo = pm.u; co.flags.cocoon = true; co.flags.cocoonTurns = 4; g.seq++; refresh(g);
  choose(g, 'Petit Moth in its Cocoon'); auto(g);
  ok(on(g, 0, 'Great Moth') && inZ(g, 0, 'gy', 'Petit Moth'), 'Great Moth on the field');
  const gm = on(g, 0, 'Great Moth'); ok(gm.f09nomi, 'marked as properly summoned');
});
T('Great Phantom Thief discards the declared name', () => {
  const g = duel({ board: [{ m: ['Great Phantom Thief'], turn: 2 }, { hand: ['Mirror Force', 'Mirror Force'] }] });
  goBP(g); attack(g, on(g, 0, 'Great Phantom Thief'), null); passAll(g); passAll(g);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'choose'; i++) auto(g);
  if (g.prompt && g.prompt.type === 'choose') choose(g, 'Mirror Force'); auto(g);
  ok(!inZ(g, 1, 'hand', 'Mirror Force') && g.p[1].gy.filter(c => E.name(c) === 'Mirror Force').length === 2, 'both Mirror Force discarded');
});
T('Great Shogun Shien: 1 Spell/Trap a turn, Six Samurai replacement', () => {
  const g = duel({ board: [{ m: ['Great Shogun Shien', 'The Six Samurai - Yaichi'] }, { st: ['Mirror Force', 'Book of Moon'] }] });
  const mf = st(g, 1, 'Mirror Force'), bm = st(g, 1, 'Book of Moon');
  ok(!L.forbid(g, { type: 'activate', c: bm, eff: E.SCRIPTS['Book of Moon'].effs[0], p: 1 }), 'first activation allowed');
  bm.used = { 0: g.turnNo };
  ok(L.forbid(g, { type: 'activate', c: mf, eff: E.SCRIPTS['Mirror Force'].effs[0], p: 1 }), 'second one blocked');
  const sh = on(g, 0, 'Great Shogun Shien'); L.destroy(g, [sh], { by: 1 });
  ok(on(g, 0, 'Great Shogun Shien') && inZ(g, 0, 'gy', 'The Six Samurai - Yaichi'), 'Yaichi destroyed instead');
});
T('Great Spirit switches original ATK and DEF', () => {
  const g = duel({ board: [{ m: [{ n: 'Great Spirit', pos: 'set' }, FILL], turn: 2 }, {}] });
  choose(g, 'flip:'); auto(g, { stop: true });
  const w = on(g, 0, FILL); ok(L.atk(g, w) === 100 && L.def(g, w) === 2000, `Warwolf 100/2000 (${L.atk(g, w)}/${L.def(g, w)})`);
});
T('Greed: 500 per card drawn by an effect', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], st: [{ n: 'Greed', pos: 'set' }] }, {}] });
  act(g, 0, 'Greed'); auto(g); act(g, 0, 'Pot of Greed'); auto(g); endTurn(g);
  ok(g.p[0].lp === 7000, `A took 1000 (A ${g.p[0].lp})`);
});
T('Greed Grado after destroying a face-up Synchro', () => {
  const g = duel({ board: [{ hand: ['Greed Grado'] }, { m: ['Stardust Dragon'] }] });
  L.destroy(g, [on(g, 1, 'Stardust Dragon')], { by: 0 }); g.seq++; refresh(g);
  ok(g.f09grado && g.f09grado[0] === g.turnNo, 'recorded');
  const h = g.p[0].hand.length; act(g, 0, 'Greed Grado'); auto(g);
  ok(g.p[0].hand.length === h + 1, 'drew 2');
});
T('Greed Quasar gains the Level of what it destroys', () => {
  const g = duel({ board: [{ m: ['Greed Quasar'], turn: 2 }, { m: ['Gravekeeper\'s Curse'] }] });
  const q = on(g, 0, 'Greed Quasar'); ok(L.atk(g, q) === 2100, '2100 ATK');
  goBP(g); attack(g, q, on(g, 1, 'Gravekeeper\'s Curse')); auto(g);
  ok(L.lv(q) === 10 && L.atk(g, q) === 3000, `Level 10, 3000 ATK (${L.lv(q)}, ${L.atk(g, q)})`);
});
T('Guardian Angel Joan gains the original ATK', () => {
  const g = duel({ board: [{ m: ['Guardian Angel Joan'], turn: 2 }, { m: ['Gravekeeper\'s Curse'] }] });
  goBP(g); attack(g, on(g, 0, 'Guardian Angel Joan'), on(g, 1, 'Gravekeeper\'s Curse')); auto(g);
  ok(g.p[0].lp === 8800, `A gained 800 (${g.p[0].lp})`);
});
T('Guardian Baou: needs Flamberge, gains 1000 and negates the destroyed monster', () => {
  const g = duel({ board: [{ hand: ['Guardian Baou'], turn: 2 }, { m: ['Morphing Jar'] }] });
  ok(!hasOpt(g, 'ns:' + hand(g, 0, 'Guardian Baou').u), 'no Normal Summon without Flamberge');
  const g2 = duel({ board: [{ hand: ['Guardian Baou'], st: [{ n: 'Wicked-Breaking Flamberge - Baou', pos: 'up' }], turn: 2 }, { m: [{ n: 'Hero Kid', pos: 'atk' }] }] });
  ok(hasOpt(g2, 'ns:' + hand(g2, 0, 'Guardian Baou').u), 'Normal Summon with Flamberge'); choose(g2, 'ns:' + hand(g2, 0, 'Guardian Baou').u); auto(g2);
  const b = on(g2, 0, 'Guardian Baou'); goBP(g2); attack(g2, b, on(g2, 1, 'Hero Kid')); auto(g2);
  ok(L.atk(g2, b) === 1800, `1800 ATK (${L.atk(g2, b)})`);
});
T('Guardian Ceal sends an Equip to destroy', () => {
  const g = duel({ board: [{ m: ['Guardian Ceal'], st: [{ n: 'Horn of the Unicorn', pos: 'up' }] }, { m: [FILL] }] });
  st(g, 0, 'Horn of the Unicorn').equipTo = on(g, 0, 'Guardian Ceal').u; g.seq++; refresh(g);
  eff(g, on(g, 0, 'Guardian Ceal'), 1); auto(g);
  ok(inZ(g, 1, 'gy', FILL), 'B\'s monster destroyed');
});
T('Guardian Eatos: summon rule and banish for ATK', () => {
  const g = duel({ board: [{ hand: ['Guardian Eatos', 'Horn of the Unicorn'] }, { gy: [FILL, FILL] }] });
  choose(g, 'no monsters in your GY'); auto(g); act(g, 0, 'Horn of the Unicorn'); auto(g);
  const e = on(g, 0, 'Guardian Eatos'); eff(g, e, 0);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick') E.act(g, pr.opts.slice(0, pr.max).map(x => x.key)); else auto(g); }
  ok(g.p[1].ban.length === 2 && L.atk(g, e) === 3500, `banished 2, 3500 ATK (${L.atk(g, e)})`);
});
T('Guardian Elma equips an Equip Spell from the GY', () => {
  const g = duel({ board: [{ hand: ['Guardian Elma'], st: [{ n: 'Butterfly Dagger - Elma', pos: 'up' }], gy: ['Horn of the Unicorn'] }, {}] });
  choose(g, 'ns:'); auto(g);
  const el = on(g, 0, 'Guardian Elma'), h = st(g, 0, 'Horn of the Unicorn');
  ok(h && h.equipTo === el.u && L.atk(g, el) === 2000, `Horn equipped (${el && L.atk(g, el)})`);
});
T('Guardian Grarl: alone in the hand with Gravity Axe', () => {
  const g = duel({ board: [{ hand: ['Guardian Grarl'], st: [{ n: 'Gravity Axe - Grarl', pos: 'up' }] }, {}] });
  for (const x of g.p[0].hand.filter(x => E.name(x) !== 'Guardian Grarl')) { g.p[0].hand.splice(g.p[0].hand.indexOf(x), 1); x.zone = 'deck'; g.p[0].deck.push(x); } refresh(g);
  ok(hasOpt(g, 'only card in your hand'), 'Special Summon offered'); choose(g, 'only card in your hand'); auto(g);
  ok(on(g, 0, 'Guardian Grarl'), 'summoned');
  const g2 = duel({ board: [{ hand: ['Guardian Grarl'] }, {}] }); ok(!hasOpt(g2, 'only card in your hand'), 'not without Gravity Axe');
});
T('Guardian Kay\'est is unaffected by Spells and not attackable', () => {
  const g = duel({ board: [{ m: ['Guardian Kay\'est'] }, {}] }); const k = on(g, 0, 'Guardian Kay\'est');
  ok(L.has(g, k, 'unaffectedSpells') && L.has(g, k, 'noAttackTarget'), 'flags set');
});
T('Guardian of Order: 2 LIGHT, only one', () => {
  const g = duel({ board: [{ hand: ['Guardian of Order', 'Guardian of Order'], m: ['Guardian Angel Joan', 'Guardian Angel Joan'] }, {}] });
  choose(g, '2 LIGHT'); auto(g); ok(on(g, 0, 'Guardian of Order'), 'summoned');
  ok(!hasOpt(g, '2 LIGHT'), 'the second one is blocked');
});
T('Guardian Sphinx returns all their monsters on a Flip Summon', () => {
  const g = duel({ board: [{ m: [{ n: 'Guardian Sphinx', pos: 'set' }], turn: 2 }, { m: [FILL, FILL] }] });
  choose(g, 'flip:'); auto(g); ok(!g.p[1].m.some(Boolean) && g.p[1].hand.length >= 2, 'B\'s monsters returned');
});
T('Guardian Statue returns 1 monster on a Flip Summon', () => {
  const g = duel({ board: [{ m: [{ n: 'Guardian Statue', pos: 'set' }], turn: 2 }, { m: [FILL, FILL] }] });
  choose(g, 'flip:'); auto(g); ok(g.p[1].m.filter(Boolean).length === 1, 'one returned');
});
T('Guardian Tryce revives its Tribute', () => {
  const g = duel({ board: [{ hand: ['Guardian Tryce'], m: ['Gravekeeper\'s Spear Soldier'], st: [{ n: 'Twin Swords of Flashing Light - Tryce', pos: 'up' }] }, {}] });
  choose(g, 'ns:'); auto(g); const t = on(g, 0, 'Guardian Tryce'); ok(!!t, 'Tribute Summoned');
  L.destroy(g, [t], { by: 1 }); g.seq++; choose(g, 'end'); auto(g);
  ok(on(g, 0, 'Gravekeeper\'s Spear Soldier') || g.p[0].m.some(c => c && E.name(c) === 'Gravekeeper\'s Spear Soldier'), 'Spear Soldier back on the field');
});
T('Harpie Lady 1, 3 and Pet Dragons', () => {
  const g = duel({ board: [{ m: ['Harpie Lady 1', 'Harpie Lady 2', "Harpie's Pet Dragon", "Harpie's Pet Baby Dragon"] }, {}] });
  ok(L.atk(g, on(g, 0, 'Harpie Lady 2')) === 1600, 'Harpie Lady 2 gets +300 from Harpie Lady 1');
  ok(L.atk(g, on(g, 0, "Harpie's Pet Dragon")) === 2000 + 600 + 300, 'Pet Dragon: 2 Harpie Ladies and WIND');
  const bb = on(g, 0, "Harpie's Pet Baby Dragon"); ok(L.atk(g, bb) === 2400 + 300, `Baby Dragon doubled (${L.atk(g, bb)})`);
  ok(L.has(g, on(g, 0, 'Harpie Lady 1'), 'noAttackTarget') && !L.has(g, bb, 'noAttackTarget'), 'Harpies protected, Baby Dragon not');
  ok(hasOpt(g, 'Destroy 1 card (3 Harpies)') === false, 'no destroy with nothing to destroy');
});
T('Harpie Lady 3 locks the monster it battled', () => {
  const g = duel({ board: [{ m: ['Harpie Lady 3'], turn: 2 }, { m: [FILL] }] });
  goBP(g); attack(g, on(g, 0, 'Harpie Lady 3'), on(g, 1, FILL)); auto(g);
  const w = on(g, 1, FILL); ok(L.forbid(g, { type: 'attack', c: w }), 'Warwolf can\'t attack');
});
T('Harpie Lady 2 negates a Flip monster it destroys', () => {
  const g = duel({ board: [{ m: ['Harpie Lady 2'], turn: 2 }, { m: [{ n: 'Morphing Jar', pos: 'set' }] }] });
  const h = g.p[0].hand.length; goBP(g); attack(g, on(g, 0, 'Harpie Lady 2'), g.p[1].m[0]); auto(g);
  ok(g.p[0].hand.length === h && inZ(g, 1, 'gy', 'Morphing Jar'), `Morphing Jar's Flip effect didn't happen (hand ${g.p[0].hand.length})`);
});
T('Harpie Lady Sisters only with Elegant Egotist', () => {
  const g = duel({ board: [{ hand: ['Harpie Lady Sisters'] }, {}] });
  ok(L.forbid(g, { type: 'ss', c: hand(g, 0, 'Harpie Lady Sisters'), p: 0 }), 'blocked');
});
T('Harpie Queen searches Harpies\' Hunting Ground', () => {
  const g = duel({ deck0: ["Harpies' Hunting Ground"], board: [{ hand: ['Harpie Queen'] }, {}] });
  choose(g, 'Hunting Ground'); auto(g); ok(inZ(g, 0, 'hand', "Harpies' Hunting Ground"), 'added');
});
T("Harpie's Feather Duster", () => {
  const g = duel({ board: [{ hand: ["Harpie's Feather Duster"], st: ['Mirror Force'] }, { st: ['Mirror Force', 'Book of Moon'] }] });
  act(g, 0, "Harpie's Feather Duster"); auto(g); ok(!g.p[1].st.some(Boolean) && st(g, 0, 'Mirror Force'), 'only B\'s cards destroyed');
});
T('Hero Barrier negates an attack', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Elemental HERO Avian'], st: ['Hero Barrier'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Elemental HERO Avian')); choose(g, 'Hero Barrier', 1); auto(g);
  ok(on(g, 1, 'Elemental HERO Avian') && g.p[1].lp === 8000, 'Avian survives');
});
T('Hero Counterattack with an Elemental HERO in hand', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { hand: ['Elemental HERO Avian'], m: ['Elemental HERO Avian'], st: ['Hero Counterattack'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Elemental HERO Avian'));
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { if (hasOpt(g, 'Hero Counterattack') && g.prompt.p === 1) choose(g, 'Hero Counterattack'); else auto(g); }
  ok(inZ(g, 0, 'gy', FILL) && on(g, 1, 'Elemental HERO Avian'), 'Warwolf destroyed, Avian summoned');
});
T('Hero Flash!!: summon and direct attacks', () => {
  const g = duel({ deck0: ['Elemental HERO Avian'], board: [{ hand: ['Hero Flash!!'], gy: ['H - Heated Heart', 'E - Emergency Call', 'R - Righteous Justice', 'O - Oversoul'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Hero Flash!!'); auto(g); const a = on(g, 0, 'Elemental HERO Avian');
  ok(a && L.has(g, a, 'directAttack') && g.p[0].ban.length === 4, 'Avian summoned with a direct attack');
});
T('Hero Heart halves ATK and gives 2 attacks', () => {
  const g = duel({ board: [{ hand: ['Hero Heart'], m: ['Elemental HERO Avian'] }, {}] });
  act(g, 0, 'Hero Heart'); auto(g); const a = on(g, 0, 'Elemental HERO Avian');
  ok(L.atk(g, a) === 500 && a.flags.extraAttack === g.turnNo, '500 ATK, attacks twice');
});
T('Hero Kid summons more Hero Kids', () => {
  const g = duel({ deck0: ['Hero Kid', 'Hero Kid'], board: [{ hand: ['Monster Reborn'], gy: ['Hero Kid'] }, {}] });
  act(g, 0, 'Monster Reborn'); passAll(g);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick') E.act(g, pr.opts.slice(0, pr.max).map(x => x.key)); else auto(g); }
  ok(g.p[0].m.filter(c => c && E.name(c) === 'Hero Kid').length === 3, '3 Hero Kids');
});
T('Hero Mask sends an Elemental HERO', () => {
  const g = duel({ deck0: ['Elemental HERO Avian'], board: [{ hand: ['Hero Mask'], m: [FILL] }, {}] });
  act(g, 0, 'Hero Mask'); auto(g); ok(inZ(g, 0, 'gy', 'Elemental HERO Avian'), 'Avian sent');
});
T('Hero Medal: destroyed by the opponent, shuffle and draw', () => {
  const g = duel({ board: [{ hand: ['Heavy Storm'] }, { st: ['Hero Medal'] }] });
  const h = g.p[1].hand.length; act(g, 0, 'Heavy Storm'); auto(g);
  ok(g.p[1].hand.length === h + 1 && g.p[1].deck.some(c => E.name(c) === 'Hero Medal'), 'B drew 1, Medal in the Deck');
});
T('Hero Ring stops a 1900+ ATK attacker', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { m: ['Elemental HERO Avian'], st: [{ n: 'Hero Ring', pos: 'up' }] }] });
  st(g, 1, 'Hero Ring').equipTo = on(g, 1, 'Elemental HERO Avian').u;
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Elemental HERO Avian')); auto(g);
  ok(on(g, 1, 'Elemental HERO Avian'), 'Avian not destroyed');
});
T('Hero Signal summons an Elemental HERO', () => {
  const g = duel({ board: [{ m: [FILL], turn: 2 }, { hand: ['Elemental HERO Avian'], m: ['Gravekeeper\'s Curse'], st: ['Hero Signal'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Gravekeeper\'s Curse'));
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { if (hasOpt(g, 'Hero Signal') && g.prompt.p === 1) choose(g, 'Hero Signal'); else auto(g); }
  ok(on(g, 1, 'Elemental HERO Avian'), 'Avian summoned');
});
T('Hero Spirit makes one monster\'s battle damage 0', () => {
  const g = duel({ board: [{ m: [FILL, 'Gravekeeper\'s Spear Soldier'], turn: 2 }, { m: ['Elemental HERO Avian'], st: ['Hero Spirit'] }] });
  goBP(g); attack(g, on(g, 0, FILL), on(g, 1, 'Elemental HERO Avian')); auto(g);
  const lp = g.p[1].lp; attack(g, on(g, 0, 'Gravekeeper\'s Spear Soldier'), null);
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { if (hasOpt(g, 'Hero Spirit') && g.prompt.p === 1) choose(g, 'Hero Spirit'); else if (g.prompt.type === 'pick' && g.prompt.p === 1) choose(g, 'Spear Soldier'); else auto(g); }
  ok(g.p[1].lp === lp, `no damage from Spear Soldier (B ${lp} -> ${g.p[1].lp})`);
});
T('Horn of Heaven negates a Normal Summon', () => {
  const g = duel({ board: [{ hand: [FILL] }, { m: ['Gravekeeper\'s Curse'], st: ['Horn of Heaven'] }] });
  choose(g, 'ns:'); choose(g, 'Horn of Heaven', 1); auto(g);
  ok(inZ(g, 0, 'gy', FILL) && inZ(g, 1, 'gy', 'Gravekeeper\'s Curse'), 'summon negated');
});
T('Horn of Light returns to the Deck for 500 LP; Horn of the Unicorn always', () => {
  const g = duel({ board: [{ hand: ['Horn of Light', 'Horn of the Unicorn', 'Heavy Storm'], m: [FILL] }, { hand: [] }] });
  act(g, 0, 'Horn of Light'); auto(g); act(g, 0, 'Horn of the Unicorn'); auto(g);
  const w = on(g, 0, FILL); ok(L.def(g, w) === 100 + 800 + 700 && L.atk(g, w) === 2700, 'stats');
  act(g, 0, 'Heavy Storm'); auto(g);
  ok(g.p[0].deck.slice(-3).some(c => E.name(c) === 'Horn of the Unicorn'), 'Unicorn on top of the Deck');
  ok(g.p[0].lp === 7500 && g.p[0].deck.some(c => E.name(c) === 'Horn of Light'), `Horn of Light returned for 500 (A ${g.p[0].lp})`);
});
T('Horus LV4 to LV6 at the End Phase; LV8 negates a Spell', () => {
  const g = duel({ deck0: ['Horus the Black Flame Dragon LV6'], board: [{ m: ['Horus the Black Flame Dragon LV4'], turn: 2 }, { m: ['Gravekeeper\'s Curse'] }] });
  goBP(g); attack(g, on(g, 0, 'Horus the Black Flame Dragon LV4'), on(g, 1, 'Gravekeeper\'s Curse')); auto(g); choose(g, 'endbp'); auto(g); choose(g, 'end'); auto(g);
  ok(g.p[0].m.some(c => c && E.name(c) === 'Horus the Black Flame Dragon LV6'), 'LV6 summoned');
  const g2 = duel({ board: [{ hand: ['Pot of Greed'] }, { m: ['Horus the Black Flame Dragon LV8'], hand: ['Horus the Black Flame Dragon LV8'] }] });
  act(g2, 0, 'Pot of Greed'); choose(g2, 'Negate a Spell', 1); auto(g2);
  ok(inZ(g2, 0, 'gy', 'Pot of Greed') && g2.p[0].hand.length === 1, 'Pot of Greed negated');
  ok(L.forbid(g2, { type: 'ss', c: hand(g2, 1, 'Horus the Black Flame Dragon LV8'), p: 1 }), 'LV8 can\'t be Special Summoned otherwise');
});
console.log(fails ? `\n${fails} check(s) failed.` : '\nAll checks passed.');
process.exit(fails ? 1 : 0);
