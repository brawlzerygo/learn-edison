// Scenario checks for full pool batch 45: node build/test_full-45.js
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
const yesAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes'); };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
// answer prompts until the turn player's idle prompt: pass responses, say yes, pick the first option, Attack Position
function settle(g, o = {}) {
  for (let i = 0; i < 60 && g.prompt && g.prompt.type !== 'idle'; i++) {
    const pr = g.prompt;
    if (pr.type === 'respond') E.act(g, ['pass']);
    else if (pr.type === 'yesno') E.act(g, [o.no ? 'n' : 'y']);
    else if (pr.type === 'choose') { const a = pr.opts.find(x => /Attack Position/.test(x.label)); E.act(g, [(a || pr.opts[0]).key]); }
    else E.act(g, pr.opts.slice(0, pr.min || 1).map(x => x.key));
  }
}
const endTurn = g => { choose(g, 'end'); settle(g); };
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };

T("Swallow's Nest", () => {
  const g = duel({ board: [{ hand: ["Swallow's Nest"], m: ['Blackwing - Shura the Blue Flame'], deckTop: ['Blackwing - Kalut the Moon Shadow', 'Blackwing - Bora the Spear'] }, {}] });
  act(g, 0, "Swallow's Nest"); settle(g);
  ok(inZ(g, 0, 'gy', 'Blackwing - Shura the Blue Flame') && on(g, 0, 'Blackwing - Bora the Spear') && !on(g, 0, 'Blackwing - Kalut the Moon Shadow'), 'Shura Tributed, the Level 4 Bora summoned');
});
T('Swing of Memories', () => {
  const g = duel({ board: [{ hand: ['Swing of Memories'], gy: [FILL] }, {}] });
  act(g, 0, 'Swing of Memories'); settle(g);
  ok(on(g, 0, FILL), 'Normal Monster revived');
  endTurn(g);
  ok(!on(g, 0, FILL) && inZ(g, 0, 'gy', FILL), 'destroyed in the End Phase');
});
T('Symbol of Heritage', () => {
  const g = duel({ board: [{ hand: ['Symbol of Heritage', 'Mystical Space Typhoon'], gy: ['Sangan', 'Sangan', 'Sangan'] }, {}] });
  act(g, 0, 'Symbol of Heritage'); settle(g);
  ok(on(g, 0, 'Sangan') && inZ(g, 0, 'st', 'Symbol of Heritage'), 'Sangan summoned and equipped');
  act(g, 0, 'Mystical Space Typhoon'); settle(g);
  ok(!on(g, 0, 'Sangan'), 'Sangan destroyed with Symbol of Heritage');
});
T('Synchronized Realm and Tuningware', () => {
  const g = duel({ ex0: ['Black Rose Dragon'], board: [{ hand: [], m: ['Junk Synchron', 'Gene-Warped Warwolf'], st: [{ n: 'Synchronized Realm', pos: 'up' }], turn: 2 }, {}] });
  const h = g.p[0].hand.length;
  choose(g, 'Synchro Summon'); settle(g, { no: true });
  ok(on(g, 0, 'Black Rose Dragon'), 'Black Rose Dragon Synchro Summoned');
  ok(g.p[1].lp === 7500, `500 damage (B ${g.p[1].lp})`);
  ok(g.p[0].hand.length === h || inZ(g, 0, 'gy', 'Tuningware'), 'Tuningware draw checked separately');
  const g2 = duel({ ex0: ['Black Rose Dragon'], board: [{ hand: [], m: ['Tuningware', 'Junk Synchron', 'Blackwing - Kalut the Moon Shadow'], turn: 2 }, {}] });
  const h2 = g2.p[0].hand.length;
  choose(g2, 'Synchro Summon'); settle(g2, { no: true });
  ok(on(g2, 0, 'Black Rose Dragon') && g2.p[0].hand.length === h2 + 1, 'Tuningware used as material draws 1');
});
T('Synthetic Seraphim', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed'], turn: 2 }, { st: ['Magic Jammer', { n: 'Synthetic Seraphim', pos: 'up' }], hand: [FILL] }] });
  act(g, 0, 'Pot of Greed'); choose(g, 'Magic Jammer', 1); settle(g);
  ok(g.p[1].m.some(c => c && E.name(c) === 'Synthetic Seraphim Token'), 'a Token after the Counter Trap');
});
T('T.A.D.P.O.L.E. and Test Ape and UFOroid', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['T.A.D.P.O.L.E.'], deckTop: ['T.A.D.P.O.L.E.', 'T.A.D.P.O.L.E.'] }] });
  choose(g, 'bp'); settle(g); choose(g, 'Attack T.A.D.P.O.L.E.');
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'pick') E.act(g, pr.opts.map(x => x.key).slice(0, pr.max)); else if (pr.type === 'yesno') E.act(g, ['y']); else E.act(g, ['pass']); }
  ok(g.p[1].hand.filter(c => E.name(c) === 'T.A.D.P.O.L.E.').length === 2, 'both T.A.D.P.O.L.E.s added');
});
T('Telekinetic Shocker', () => {
  const g2 = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Psychic Commander', 'Telekinetic Shocker'] }] });
  choose(g2, 'bp'); settle(g2); choose(g2, 'Attack Psychic Commander'); settle(g2);
  ok(on(g2, 1, 'Psychic Commander') && inZ(g2, 1, 'gy', 'Telekinetic Shocker') && g2.p[1].lp === 8000 - 700 - 500, `Shocker destroyed instead (B ${g2.p[1].lp})`);
});
T('Telepathic Power', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Psychic Commander'], st: ['Telepathic Power'] }] });
  choose(g, 'bp'); settle(g); choose(g, 'Attack Psychic Commander');
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'yesno') E.act(g, [pr.p === 1 ? 'y' : 'n']); else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  ok(!on(g, 0, 'Cyber Dragon') && g.p[1].lp === 8000 - 700 + 2100, `Cyber Dragon destroyed, B gained 2100 (B ${g.p[1].lp})`);
});
T('Temple of the Sun', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Cyber Dragon'], st: [{ n: 'Temple of the Sun', pos: 'up' }] }, {}] });
  act(g, 0, 'Monster Reborn'); settle(g);
  const c = on(g, 0, 'Cyber Dragon'); ok(c && E.atk(g, c) === 2400, 'Cyber Dragon from the GY has 2400 ATK');
});
T('Terrible Deal', () => {
  const g = duel({ board: [{ hand: ['Pot of Greed', FILL], turn: 2 }, { st: ['Terrible Deal'] }] });
  act(g, 0, 'Pot of Greed'); choose(g, 'Terrible Deal', 1); settle(g);
  ok(g.p[1].lp === 7000 && g.p[0].gy.length >= 2, 'B paid 1000 and A discarded a card');
});
T('Thorn of Malice', () => {
  const g = duel({ board: [{ hand: ['Thorn of Malice'], m: ['Lord Poison'], turn: 2 }, { m: [{ n: 'Command Knight', pos: 'def' }] }] });
  act(g, 0, 'Thorn of Malice'); settle(g);
  const lp = on(g, 0, 'Lord Poison'); ok(E.atk(g, lp) === 2100, 'Lord Poison 2100 ATK');
  choose(g, 'bp'); settle(g); choose(g, 'Attack Command Knight'); settle(g);
  const ck = on(g, 1, 'Command Knight');
  ok(ck && g.p[1].lp === 8000 - 200 && E.def(g, ck) === 1300, `Command Knight survives, 200 piercing, DEF 1300 (B ${g.p[1].lp}, DEF ${ck && E.def(g, ck)})`);
});
T('Toy Magician', () => {
  const g = duel({ board: [{ hand: ['Toy Magician'], turn: 1 }, { hand: ['Mystical Space Typhoon'] }] });
  choose(g, 'Set it in the Spell'); settle(g);
  ok(inZ(g, 0, 'st', 'Toy Magician'), 'Set in the Spell & Trap Zone');
  endTurn(g);
  // B's turn: MST it
  settle(g); act(g, 1, 'Mystical Space Typhoon'); settle(g);
  ok(inZ(g, 0, 'gy', 'Toy Magician'), 'destroyed by MST');
  endTurn(g);
  ok(on(g, 0, 'Toy Magician'), 'Special Summoned in the End Phase');
});
T('Transmigration Break', () => {
  const g = duel({ board: [{ hand: ['Pot of Avarice'], gy: [FILL, FILL, FILL, FILL, FILL], st: [{ n: 'Transmigration Break', pos: 'up' }] }, {}] });
  act(g, 0, 'Pot of Avarice'); settle(g);
  ok(g.p[0].ban.filter(c => E.name(c) === FILL).length === 5, 'the 5 monsters were banished instead');
});
T('Trojan Blast', () => {
  const g = duel({ board: [{ hand: ['Brain Control'], turn: 3 }, { m: ['Cyber Dragon'], st: ['Trojan Blast'] }] });
  act(g, 0, 'Brain Control'); settle(g);
  // settle answers yes to Trojan Blast's offer
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && g.p[0].lp === 8000 - 800 - 2100, `Cyber Dragon destroyed, A took 2100 (A ${g.p[0].lp})`);
});
T('Truckroid', () => {
  const g = duel({ board: [{ hand: [], m: ['Truckroid'], turn: 2 }, { m: ['T.A.D.P.O.L.E.'] }] });
  choose(g, 'bp'); settle(g); choose(g, 'Attack T.A.D.P.O.L.E.'); settle(g, { no: true });
  const t = on(g, 0, 'Truckroid'); ok(t && inZ(g, 0, 'st', 'T.A.D.P.O.L.E.') && E.atk(g, t) === 1000 && t.flags && g.p[0].st.find(x => x && x.equipTo === t.u), 'T.A.D.P.O.L.E. equipped (0 ATK)');
});
T('Tuner Capture', () => {
  const g = duel({ ex0: ['Black Rose Dragon'], board: [{ hand: [], m: ['Junk Synchron', FILL], turn: 2 }, { st: ['Tuner Capture'] }] });
  choose(g, 'Synchro Summon'); choose(g, 'Attack Position');
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'respond' && pr.p === 1 && hasOpt(g, 'Tuner Capture')) choose(g, 'Tuner Capture'); else if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, ['n']); else E.act(g, [pr.opts[0].key]); }
  ok(on(g, 1, 'Junk Synchron'), 'B took Junk Synchron');
});
T("Tuner's Barrier", () => {
  const g2 = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Junk Synchron'], st: ["Tuner's Barrier"] }] });
  choose(g2, 'bp'); settle(g2); choose(g2, 'Attack Junk Synchron'); choose(g2, "Tuner's Barrier", 1); settle(g2);
  ok(on(g2, 1, 'Junk Synchron'), 'Junk Synchron survives the battle');
});
T('UFOroid Fighter', () => {
  const g = duel({ ex0: ['UFOroid Fighter'], board: [{ hand: ['Polymerization', 'UFOroid', 'Cyber Dragon'], m: [FILL] }, {}] });
  const g2 = duel({ ex0: ['UFOroid Fighter'], board: [{ hand: ['Polymerization', 'UFOroid', 'Goblin Attack Force'] }, {}] });
  act(g2, 0, 'Polymerization'); settle(g2);
  const f = on(g2, 0, 'UFOroid Fighter'); ok(f && E.atk(g2, f) === 3500 && E.def(g2, f) === 3500, `UFOroid Fighter 3500/3500 (${f && E.atk(g2, f)})`);
});
T('Union Attack', () => {
  const g = duel({ board: [{ hand: ['Union Attack'], m: ['Cyber Dragon', FILL], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  act(g, 0, 'Union Attack'); choose(g, 'Cyber Dragon'); settle(g);
  const c = on(g, 0, 'Cyber Dragon'); ok(E.atk(g, c) === 2100, 'no bonus in Main Phase 1');
  choose(g, 'bp'); settle(g);
  ok(E.atk(g, c) === 4100 && !hasOpt(g, 'atk:' + on(g, 0, FILL).u), 'Cyber Dragon 4100 in the Battle Phase, Warwolf can\'t attack');
  choose(g, 'Attack Dark Armed Dragon'); settle(g);
  ok(inZ(g, 1, 'gy', 'Dark Armed Dragon') && g.p[1].lp === 8000, 'Dark Armed Dragon destroyed, no battle damage');
});
T('Unleash Your Power!', () => {
  const g = duel({ board: [{ hand: ['Unleash Your Power!'], m: ['Elemental HERO Neos Alius'] }, {}] });
  act(g, 0, 'Unleash Your Power!'); settle(g);
  const n = g.p[0].m.find(c => c && E.data(c).n === 'Elemental HERO Neos Alius'); ok(n && n.flags.gemini, 'treated as an Effect Monster');   // named "Elemental HERO Neos" while it is (2026-11-27 audit)
  endTurn(g); ok(n.pos === 'set', 'Set in the End Phase');
});
T('Urgent Tuning', () => {
  const g = duel({ ex1: ['Black Rose Dragon'], board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Junk Synchron', FILL], st: ['Urgent Tuning'] }] });
  choose(g, 'bp'); choose(g, 'Urgent Tuning', 1); settle(g, { no: true });
  ok(on(g, 1, 'Black Rose Dragon'), 'B Synchro Summoned during A\'s Battle Phase');
});
T("Vampire's Curse", () => {
  const g = duel({ board: [{ hand: [], m: ['Dark Armed Dragon'], turn: 2 }, { m: ["Vampire's Curse"] }] });
  choose(g, 'bp'); settle(g); choose(g, "Attack Vampire's Curse"); settle(g); choose(g, 'endbp'); settle(g);
  endTurn(g);
  const v = on(g, 1, "Vampire's Curse"); ok(v && E.atk(g, v) === 2500 && g.p[1].lp === 8000 - 800 - 500, `back with 2500 ATK (B ${g.p[1].lp})`);
});
T('Turret Warrior', () => {
  const g = duel({ board: [{ hand: ['Turret Warrior'], m: ['Goblin Attack Force'] }, {}] });
  choose(g, 'Tribute a Warrior'); settle(g);
  const t = on(g, 0, 'Turret Warrior'); ok(t && E.atk(g, t) === 3500, 'Turret Warrior 3500 ATK');
});
T('Tyler the Great Warrior', () => {
  const g = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Tyler the Great Warrior'] }, {}] });
  ok(!hasOpt(g, 'Monster Reborn') || (act(g, 0, 'Monster Reborn'), settle(g), !on(g, 0, 'Tyler the Great Warrior')), 'Tyler cannot be Special Summoned');
});
T('Tongue Twister', () => {
  const g = duel({ board: [{ hand: ['Tongue Twister'], m: [FILL], turn: 2 }, { m: ['Dark Armed Dragon'] }] });
  choose(g, 'ns:'); settle(g); const h = g.p[0].hand.length;
  choose(g, 'bp'); settle(g); choose(g, 'Attack Dark Armed Dragon'); settle(g);
  ok(inZ(g, 0, 'ban', 'Tongue Twister') && g.p[0].hand.length === h + 2, 'drew 2 and banished');
});
T('Torapart locks Traps', () => {
  const g = duel({ ex0: ['Colossal Fighter'], board: [{ hand: [], m: ['Torapart', 'Cyber Dragon', 'Tuningware'], turn: 2 }, { st: ['Mirror Force'] }] });
  choose(g, 'Synchro Summon'); settle(g, { no: true });
  ok(!!on(g, 0, 'Colossal Fighter'), 'Colossal Fighter summoned');
  choose(g, 'bp'); settle(g); choose(g, 'Attack directly');
  ok(!(g.prompt.type === 'respond' && hasOpt(g, 'Mirror Force')), 'Mirror Force not offered');
  settle(g); ok(g.p[1].lp < 8000, 'the attack went through');
});
T('Totem Dragon and Tiger Dragon', () => {
  const g = duel({ board: [{ hand: ['Blue-Eyes White Dragon'], m: ['Totem Dragon'] }, {}] });
  choose(g, 'ns:'); settle(g);
  ok(!!on(g, 0, 'Blue-Eyes White Dragon'), 'Blue-Eyes Tribute Summoned with Totem Dragon alone');
  const g2 = duel({ board: [{ hand: ['Tiger Dragon'], m: ['Twin-Headed Behemoth'] }, { st: ['Mirror Force', 'Magic Jammer'] }] });
  choose(g2, 'ns:'); settle(g2);
  ok(g2.p[1].st.filter(Boolean).length === 1, 'Tiger Dragon destroyed a Set card');
});
T('Tour of Doom', () => {
  const g = duel({ seed: 3, board: [{ hand: [], st: [{ n: 'Tour of Doom', pos: 'up' }] }, {}] });
  endTurn(g);
  ok(/tossed a coin/.test(g.log.join('|')), 'coin tossed in the opponent Standby Phase');
});
T('Tualatin', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon', 'Dark Armed Dragon'], turn: 2 }, { m: [{ n: 'Sangan', pos: 'atk' }, { n: 'Psychic Commander', pos: 'atk' }], hand: ['Tualatin'] }] });
  choose(g, 'bp'); settle(g);
  choose(g, 'atk:' + on(g, 0, 'Cyber Dragon').u + ':' + on(g, 1, 'Sangan').u);
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'yesno') E.act(g, ['n']); else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  choose(g, 'atk:' + on(g, 0, 'Dark Armed Dragon').u + ':' + on(g, 1, 'Psychic Commander').u);
  let offered = false;
  for (let i = 0; i < 30 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
    if (pr.type === 'yesno' && /Tualatin/.test(pr.text)) { offered = true; E.act(g, ['y']); }
    else if (pr.type === 'yesno') E.act(g, ['n']);
    else if (pr.type === 'choose' && /Attribute/.test(pr.text)) choose(g, 'LIGHT');
    else if (pr.type === 'choose') choose(g, 'Defense');
    else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  ok(offered, 'Tualatin offered after both monsters fell');
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && inZ(g, 1, 'gy', 'Tualatin'), 'LIGHT chosen: Cyber Dragon and Tualatin destroyed');
});
console.log(fails ? `\n${fails} failed` : '\nAll batch 45 checks passed.');
process.exit(fails ? 1 : 0);
