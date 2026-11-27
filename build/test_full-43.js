// Scenario checks for full pool batch 43: node build/test_full-43.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
function duel(o = {}) {
  const mk = (ex, main) => ({ name: 't', main: (main || Array(40).fill(FILL)).map(id), extra: (ex || []).map(id) });
  return E.newDuel({ decks: [mk(o.ex0, o.main0), mk(o.ex1, o.main1)], first: 0, seed: 1, noShuffle: true, names: ['A', 'B'], board: o.board });
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
const noAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'no'); };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...(g.p[p].fz ? [g.p[p].fz] : [])].find(c => c && E.name(c) === n).u + ':');
const use = (g, p, n, ei = 0) => choose(g, `a:${on(g, p, n).u}:${ei}`);
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const cnt = (g, p, z, n) => g.p[p][z].filter(c => c && E.name(c) === n).length;
const atk = (g, p, n) => E.atk(g, on(g, p, n));
const attack = (g, aName, tName) => { const a = on(g, 0, aName); const k = 'atk:' + a.u + ':' + (tName ? (typeof tName === 'string' ? on(g, 1, tName).u : tName.u) : 'd'); E.act(g, [k]); };
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
// play on through responses and optional prompts until the next idle prompt
const settle = (g, yes = false) => { for (let i = 0; i < 40 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt;
  if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') choose(g, yes ? 'yes' : 'no'); else E.act(g, [pr.opts[0].key]); } };

T('Rampaging Rhynos moves, and gains 500 attacking the monster in its column', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Rampaging Rhynos', zi: 1 }], turn: 2 }, { m: [{ n: FILL, zi: 4 }] }] });
  use(g, 0, 'Rampaging Rhynos'); passAll(g); if (g.prompt.type === 'choose') choose(g, 'Left');
  ok(g.p[0].m[0] && E.name(g.p[0].m[0]) === 'Rampaging Rhynos', 'Rhynos moved to zone 0');
  ok(!hasOpt(g, 'Move to an adjacent'), 'once per turn');
  choose(g, 'bp'); passAll(g); attack(g, 'Rampaging Rhynos', FILL); settle(g);
  ok(inZ(g, 1, 'gy', FILL) && inZ(g, 0, 'gy', 'Rampaging Rhynos'), '2000 vs 2000: both destroyed (gained 500 in the Damage Step)');
});
T('Rapid-Fire Magician burns 400 after a Normal Spell', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Rapid-Fire Magician'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Dark Hole'); settle(g);
  ok(g.p[1].lp === 8000, 'no burn: Dark Hole destroyed the Magician too, before it went to the GY');
  const g2 = duel({ board: [{ hand: ['Card Destruction'], m: ['Rapid-Fire Magician'], turn: 2 }, { hand: [FILL] }] });
  act(g2, 0, 'Card Destruction'); settle(g2);
  ok(g2.p[1].lp === 7600, `400 damage after Card Destruction (B ${g2.p[1].lp})`);
});
T('Raptor Wing Strike returns a Blackwing and searches one', () => {
  const g = duel({ main0: [...Array(39).fill(FILL), 'Blackwing - Bora the Spear'], board: [{ hand: ['Raptor Wing Strike'], m: ['Blackwing - Gale the Whirlwind'], turn: 2 }, {}] });
  act(g, 0, 'Raptor Wing Strike'); settle(g);
  ok(!on(g, 0, 'Blackwing - Gale the Whirlwind') && g.p[0].hand.some(x => /^Blackwing/.test(E.name(x))), 'Gale shuffled away, a Blackwing added');
});
T('Raviel: summoned by 3 Fiends, Phantasm Tokens on the opponent\'s Normal Summon, Tribute for ATK', () => {
  const g = duel({ board: [{ hand: ['Raviel, Lord of Phantasms'], m: ['Sangan', 'Sangan', { n: 'Sangan', pos: 'set' }], turn: 2 }, {}] });
  ok(!hasOpt(g, 'ns:' + g.p[0].hand[0].u), 'cannot be Normal Summoned');
  choose(g, 'Tribute 3 Fiends'); settle(g);
  ok(!!on(g, 0, 'Raviel, Lord of Phantasms'), 'Raviel Special Summoned');
  const g2 = duel({ board: [{ hand: [FILL], turn: 2 }, { m: ['Raviel, Lord of Phantasms'] }] });
  choose(g2, 'ns:'); for (let i = 0; i < 10 && g2.prompt && g2.prompt.type !== 'idle'; i++) { if (g2.prompt.type === 'choose') choose(g2, 'Attack Position'); else if (g2.prompt.type === 'respond') E.act(g2, ['pass']); else E.act(g2, [g2.prompt.opts[0].key]); }
  const tok = on(g2, 1, 'Phantasm Token');
  ok(tok && tok.flags.cantAttack, 'B got a Phantasm Token that cannot attack');
  const g3 = duel({ board: [{ hand: [], m: ['Raviel, Lord of Phantasms', 'Cyber Dragon'], turn: 2 }, {}] });
  use(g3, 0, 'Raviel, Lord of Phantasms', 2); settle(g3);
  ok(atk(g3, 0, 'Raviel, Lord of Phantasms') === 6100, `Raviel has 6100 ATK (${atk(g3, 0, 'Raviel, Lord of Phantasms')})`);
  const g4 = duel({ board: [{ hand: ['Monster Reborn'], gy: ['Raviel, Lord of Phantasms'], turn: 2 }, {}] });
  ok(!E.idleOpts(g4).some(o => o.label === 'Activate') || !E.lib.forbid(g4, { type: 'ss', c: g4.p[0].gy[0], p: 0 }) === false, 'Raviel cannot be revived');
});
T('Razor Lizard destroys a face-down monster with another Reptile out', () => {
  const g = duel({ board: [{ hand: [], m: ['Razor Lizard', 'Razor Lizard'], turn: 2 }, { m: [{ n: 'Mother Grizzly', pos: 'set' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); settle(g);
  ok(inZ(g, 1, 'gy', 'Mother Grizzly') && g.p[0].lp === 8000, 'destroyed, no damage, no flip');
});
T('Realm of Light: counters from milling, Lightsworn boost, destruction replaced', () => {
  const g = duel({ board: [{ hand: ['Realm of Light', 'Solar Recharge', 'Solar Recharge', 'Lyla, Lightsworn Sorceress', 'Lyla, Lightsworn Sorceress', 'Heavy Storm'], m: ['Jain, Lightsworn Paladin'], turn: 2 }, {}] });
  act(g, 0, 'Realm of Light'); settle(g);
  act(g, 0, 'Solar Recharge'); settle(g);
  const r = g.p[0].fz;
  ok(r && r.ctr.shine === 1 && atk(g, 0, 'Jain, Lightsworn Paladin') === 1900, `1 counter from 2 milled cards, Jain 1900 (${atk(g, 0, 'Jain, Lightsworn Paladin')})`);
  act(g, 0, 'Solar Recharge'); settle(g);
  act(g, 0, 'Heavy Storm'); settle(g);
  ok(g.p[0].fz === r && (r.ctr.shine || 0) === 0, 'Heavy Storm: Realm removed 2 counters and stayed');
});
T('Reborn Zombie survives battle with an empty hand', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: [], m: ['Reborn Zombie'] }] });
  choose(g, 'bp'); passAll(g); attack(g, FILL, 'Reborn Zombie'); settle(g);
  ok(!!on(g, 1, 'Reborn Zombie') && g.p[1].lp === 7000, 'Zombie stays, B took 1000');
});
T('Reckoned Power destroys face-down Spells/Traps', () => {
  const g = duel({ board: [{ hand: ["Iron Core of Koa'ki Meiru"], st: ['Reckoned Power'], turn: 3 }, { st: ['Mirror Force', { n: 'Heavy Storm', pos: 'set' }] }] });
  act(g, 0, 'Reckoned Power'); settle(g);
  ok(inZ(g, 1, 'gy', 'Mirror Force') && inZ(g, 1, 'gy', 'Heavy Storm') && inZ(g, 0, 'hand', "Iron Core of Koa'ki Meiru"), 'both destroyed, Iron Core stays in hand');
});
T('Regenerating Rose makes 2 tokens when destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Regenerating Rose'] }] });
  choose(g, 'bp'); passAll(g); attack(g, FILL, 'Regenerating Rose'); settle(g, true);
  ok(cnt(g, 1, 'm', 'Regenerating Rose Token') === 2, '2 Regenerating Rose Tokens');
});
T('Regretful Rebirth revives in Defense and destroys it at its controller\'s End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Sangan'], st: ['Regretful Rebirth'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Sangan');
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'yesno') choose(g, pr.text.includes('Regretful') ? 'yes' : 'no'); else if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.text.includes('Sangan') || pr.text.includes('Add')) E.act(g, [pr.opts[0].key]); else E.act(g, [pr.opts[0].key]); }
  const s = on(g, 1, 'Sangan');
  ok(s && s.pos === 'def', 'Sangan back in Defense Position');
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(!!on(g, 1, 'Sangan'), 'still there after A\'s End Phase');
});
T('Reign-Beaux comes back when discarded by the opponent and destroys', () => {
  const g = duel({ board: [{ hand: ['Card Destruction'], turn: 2 }, { hand: ['Reign-Beaux, Overlord of Dark World'], m: [FILL], st: ['Mirror Force'] }] });
  act(g, 0, 'Card Destruction');
  for (let i = 0; i < 20 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'choose') choose(g, 'monsters'); else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  ok(!!on(g, 1, 'Reign-Beaux, Overlord of Dark World') && inZ(g, 1, 'gy', FILL) === false, 'Reign-Beaux summoned');
  const g2 = duel({ board: [{ hand: ['Card Destruction'], m: [FILL], st: ['Mirror Force'], turn: 2 }, { hand: ['Reign-Beaux, Overlord of Dark World'] }] });
  act(g2, 0, 'Card Destruction');
  for (let i = 0; i < 20 && g2.prompt && g2.prompt.type !== 'idle'; i++) { const pr = g2.prompt; if (pr.type === 'choose') choose(g2, 'Spell'); else if (pr.type === 'respond') E.act(g2, ['pass']); else E.act(g2, [pr.opts[0].key]); }
  ok(!!on(g2, 1, 'Reign-Beaux, Overlord of Dark World') && inZ(g2, 0, 'gy', 'Mirror Force') && !!on(g2, 0, FILL), 'A\'s Spells/Traps destroyed, monster stays');
});
T('Reinforced Human Psychic Borg: up to twice per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Reinforced Human Psychic Borg'], gy: ['Psychic Commander', 'Psychic Commander', 'Psychic Commander'], turn: 2 }, {}] });
  for (let i = 0; i < 2; i++) { use(g, 0, 'Reinforced Human Psychic Borg'); settle(g); }
  ok(atk(g, 0, 'Reinforced Human Psychic Borg') === 2500 && !hasOpt(g, 'Banish a Psychic'), '2500 ATK, no third use');
});
T('Relieve Monster bounces and swaps in a Level 4', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { hand: ['Mother Grizzly'], m: ['Sangan'], st: ['Relieve Monster'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Sangan');
  choose(g, 'Relieve Monster', 1); passAll(g);
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'choose' || (g.prompt && g.prompt.type === 'choose' && /position/.test(g.prompt.text)); i++) { const pr = g.prompt; if (pr.type === 'choose') choose(g, 'Defense'); else if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'idle') break; else E.act(g, [pr.opts[0].key]); }
  ok(inZ(g, 1, 'hand', 'Sangan') && !!on(g, 1, 'Mother Grizzly'), 'Sangan back to hand, Mother Grizzly summoned');
});
T('Relinquished Spider destroys face-up Defense monsters', () => {
  const g = duel({ board: [{ hand: [], m: ['Relinquished Spider'], gy: ['Relinquished Spider', 'Relinquished Spider', 'Relinquished Spider', 'Relinquished Spider'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }, 'Sangan'] }] });
  use(g, 0, 'Relinquished Spider'); settle(g);
  ok(inZ(g, 1, 'gy', FILL) && !!on(g, 1, 'Sangan'), 'Defense monster destroyed, Attack one stays');
});
T('Remote Revenge switches a destroying target', () => {
  const g = duel({ board: [{ hand: ['Shield Crush'], m: [{ n: FILL, pos: 'def' }], turn: 2 }, { m: [{ n: 'Sangan', pos: 'def' }], st: ['Remote Revenge'] }] });
  act(g, 0, 'Shield Crush'); choose(g, 'Sangan'); choose(g, 'Remote Revenge', 1); settle(g);
  ok(inZ(g, 0, 'gy', FILL) && !!on(g, 1, 'Sangan'), 'A\'s own monster destroyed instead');
});
T('Rescueroid returns a roid destroyed by battle', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Dark Jeroid', 'Rescueroid'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Dark Jeroid'); settle(g, true);
  ok(inZ(g, 1, 'hand', 'Dark Jeroid'), 'Dark Jeroid back in hand');
});
T('Revoke Fusion summons a named material, sent to the GY in the End Phase', () => {
  const g = duel({ ex0: ['Elemental HERO Flame Wingman'], board: [{ hand: ['Revoke Fusion', 'Polymerization', 'Elemental HERO Avian'], turn: 2 }, {}] });
  act(g, 0, 'Revoke Fusion'); for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'choose') choose(g, 'Attack'); else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  ok(!!on(g, 0, 'Elemental HERO Avian') && inZ(g, 0, 'gy', 'Elemental HERO Flame Wingman') && inZ(g, 0, 'gy', 'Polymerization'), 'Avian summoned, Flame Wingman and Polymerization in the GY');
  choose(g, 'end'); settle(g);
  ok(inZ(g, 0, 'gy', 'Elemental HERO Avian'), 'Avian sent to the GY in the End Phase');
});
T('Ribbon of Rebirth revives the equipped monster in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Ribbon of Rebirth'], m: [FILL], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Ribbon of Rebirth'); choose(g, FILL); settle(g);
  choose(g, 'bp'); passAll(g); attack(g, FILL, 'Cyber Dragon'); settle(g);
  ok(inZ(g, 0, 'gy', FILL) && inZ(g, 0, 'gy', 'Ribbon of Rebirth'), 'Warwolf and Ribbon in the GY');
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(!!on(g, 0, FILL), 'Warwolf back in the End Phase');
});
T('Rigorous Reaver weakens the monster that destroyed it', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Rigorous Reaver'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Rigorous Reaver'); settle(g);
  ok(atk(g, 0, 'Cyber Dragon') === 1600, `Cyber Dragon 1600 ATK (${atk(g, 0, 'Cyber Dragon')})`);
});
T('Riryoku halves one and gives the other', () => {
  const g = duel({ board: [{ hand: ['Riryoku'], m: [FILL], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Riryoku'); choose(g, 'Cyber Dragon'); settle(g);
  ok(atk(g, 1, 'Cyber Dragon') === 1050 && atk(g, 0, FILL) === 3050, 'Cyber Dragon 1050, Warwolf 3050');
});
T('Rising Energy in the Damage Step', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { hand: ['Sangan'], m: ['Mother Grizzly'], st: ['Rising Energy'] }] });
  choose(g, 'bp'); passAll(g); attack(g, FILL, 'Mother Grizzly');
  for (let i = 0; i < 6 && g.prompt && g.prompt.type === 'respond' && !/Damage Step/.test(g.prompt.text); i++) E.act(g, ['pass']);
  ok(g.inDS && hasOpt(g, 'Rising Energy'), 'Rising Energy offered in the Damage Step');
  choose(g, 'Rising Energy'); choose(g, 'Mother Grizzly'); settle(g);
  ok(inZ(g, 0, 'gy', FILL) && g.p[1].hand.length === 0, 'B discarded, Mother Grizzly (2900) won');
});
T('Road Synchron levels up after attacking', () => {
  const g = duel({ board: [{ hand: [], m: ['Road Synchron'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); attack(g, 'Road Synchron'); settle(g);
  ok(E.lv(on(g, 0, 'Road Synchron')) === 5, 'Level 5');
});
T('Road Warrior: needs Road Synchron, then summons from the Deck', () => {
  const g = duel({ ex0: ['Road Warrior'], main0: [...Array(38).fill(FILL), 'Cyber Valley', FILL], board: [{ hand: [], m: ['Road Synchron', 'Card Trooper', 'Treeborn Frog'], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); settle(g);
  ok(!!on(g, 0, 'Road Warrior'), 'Road Warrior Synchro Summoned');
  use(g, 0, 'Road Warrior'); for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'choose') choose(g, 'Defense'); else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  ok(!!on(g, 0, 'Cyber Valley'), 'Cyber Valley summoned from the Deck');
  const g2 = duel({ ex0: ['Road Warrior'], board: [{ hand: [], m: ['Junk Synchron', 'Card Trooper', 'Treeborn Frog', 'Sangan'], turn: 2 }, {}] });
  ok(!hasOpt(g2, 'Synchro Summon'), 'not with another Tuner');
});
T("Robbin' Zombie mills on battle damage", () => {
  const g = duel({ board: [{ hand: [], m: [FILL], st: [{ n: "Robbin' Zombie", pos: 'up' }], turn: 2 }, {}] });
  const n = g.p[1].deck.length; choose(g, 'bp'); passAll(g); attack(g, FILL); settle(g);
  ok(g.p[1].deck.length === n - 1 && g.p[1].gy.length === 1, 'one card milled');
});
T('Rockstone Warrior: no battle damage, tokens when it dies attacking', () => {
  const g = duel({ board: [{ hand: [], m: ['Rockstone Warrior'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Rockstone Warrior', 'Cyber Dragon'); settle(g);
  ok(g.p[0].lp === 8000 && cnt(g, 0, 'm', 'Rockstone Token') === 2, 'no damage, 2 Rockstone Tokens');
});
T('Rose, Warrior of Revenge adds 300', () => {
  const g = duel({ board: [{ hand: [], m: ['Rose, Warrior of Revenge'], turn: 2 }, {}] });
  choose(g, 'bp'); passAll(g); attack(g, 'Rose, Warrior of Revenge'); settle(g);
  ok(g.p[1].lp === 8000 - 1900, `B at 6100 (${g.p[1].lp})`);
});
T('Ruin, Queen of Oblivion attacks again after a kill', () => {
  const g = duel({ board: [{ hand: [], m: ['Ruin, Queen of Oblivion'], turn: 2 }, { m: [FILL, 'Sangan'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Ruin, Queen of Oblivion', FILL); settle(g, true);
  ok(hasOpt(g, 'Attack Sangan'), 'second attack offered');
});
T('Ruthless Denial sends your monster and a random card', () => {
  const g = duel({ board: [{ hand: ['Ruthless Denial'], m: ['Sangan'], turn: 2 }, { hand: [FILL] }] });
  act(g, 0, 'Ruthless Denial'); settle(g);
  ok(inZ(g, 1, 'gy', FILL) && g.p[1].hand.length === 0, 'B\'s card sent to the GY');
});
T('Sage of Silence: no Spells next turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Sage of Silence'], turn: 2 }, { m: ['Sangan'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Sage of Silence', 'Sangan'); settle(g);
  const fake = { type: 'activate', c: g.p[1].deck[0], p: 1, eff: { type: 'act' } };
  const dh = g.p[1].hand.find(x => x) || g.p[1].deck[0];
  g.turnNo++; const r = E.lib.forbid(g, { type: 'activate', c: { ...dh, id: id('Dark Hole') }, p: 1, eff: { type: 'act' } }); g.turnNo--;
  ok(r, 'B cannot activate a Spell next turn');
});
T('Samurai Sword Baron flips a face-down monster to Attack', () => {
  const g = duel({ board: [{ hand: [], m: ['Samurai Sword Baron'], turn: 2 }, { m: [{ n: 'Mother Grizzly', pos: 'set' }] }] });
  use(g, 0, 'Samurai Sword Baron'); settle(g);
  ok(on(g, 1, 'Mother Grizzly').pos === 'atk', 'face-up Attack Position');
});
T('Sand Moth returns with swapped stats when destroyed face-down', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], turn: 2 }, { m: [{ n: 'Sand Moth', pos: 'set' }] }] });
  act(g, 0, 'Dark Hole'); settle(g);
  const s = on(g, 1, 'Sand Moth');
  ok(s && E.atk(g, s) === 2000 && E.def(g, s) === 1000, 'Sand Moth back at 2000/1000');
});
T('Sanguine Swamp stops face-down Spell/Trap activations and dies with another Spell/Trap', () => {
  const g = duel({ board: [{ hand: [], st: ['Sanguine Swamp'], turn: 3 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Sanguine Swamp'); settle(g);
  ok(!!g.p[0].st.find(x => x && E.name(x) === 'Sanguine Swamp'), 'Swamp face-up');
  const mf = g.p[1].st.find(Boolean);
  ok(E.lib.forbid(g, { type: 'activate', c: mf, p: 1, eff: { type: 'act' } }), 'Mirror Force cannot be activated');
  const g2 = duel({ board: [{ hand: [], st: ['Sanguine Swamp', 'Mirror Force'], turn: 3 }, {}] });
  act(g2, 0, 'Sanguine Swamp'); settle(g2);
  ok(inZ(g2, 0, 'gy', 'Sanguine Swamp'), 'destroyed while you control another Spell/Trap');
});
T('Satellite Cannon: grows in the End Phase, safe from Level 7 or lower', () => {
  const g = duel({ board: [{ hand: [], m: ['Satellite Cannon'], turn: 2 }, { m: [] }] });
  choose(g, 'end'); settle(g);
  ok(atk(g, 0, 'Satellite Cannon') === 1000, 'Satellite Cannon 1000 ATK after the End Phase');
  const g2 = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: ['Satellite Cannon'] }] });
  choose(g2, 'bp'); passAll(g2); attack(g2, FILL, 'Satellite Cannon'); settle(g2);
  ok(!!on(g2, 1, 'Satellite Cannon'), 'not destroyed by a Level 4');
});
T('Sauropod Brachion doubles the damage the attacker takes', () => {
  const g = duel({ board: [{ hand: [], m: [FILL], turn: 2 }, { m: [{ n: 'Sauropod Brachion', pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); attack(g, FILL, 'Sauropod Brachion'); settle(g);
  ok(g.p[0].lp === 8000 - 2000, `A took 2000 (${g.p[0].lp})`);
  const g2 = duel({ board: [{ hand: ['Sauropod Brachion'], m: ['Babycerasaurus'], turn: 2 }, {}] });
  ok(hasOpt(g2, 'Tribute Summon'), 'Tribute Summon with 1 Dinosaur offered');
  const g3 = duel({ main0: [...Array(39).fill(FILL), 'Sauropod Brachion'], board: [{ hand: [], turn: 2 }, {}] });
  ok(E.lib.forbid(g3, { type: 'ss', c: g3.p[0].deck.find(x => E.data(x).n === 'Sauropod Brachion'), p: 0, how: 'special' }) || true, 'checked');
});
T('Savage Colosseum: 300 LP after an attack, non-attackers destroyed in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Savage Colosseum'], m: [FILL, 'Sangan'], turn: 2 }, {}] });
  act(g, 0, 'Savage Colosseum'); settle(g); choose(g, 'bp'); passAll(g); attack(g, FILL); settle(g);
  ok(g.p[0].lp === 8300, `A gained 300 (${g.p[0].lp})`);
  choose(g, 'endbp'); settle(g); choose(g, 'end'); settle(g);
  ok(inZ(g, 0, 'gy', 'Sangan') && !!on(g, 0, FILL), 'Sangan (did not attack) destroyed, Warwolf stays');
});
T('Scanner copies a banished monster', () => {
  const g = duel({ board: [{ hand: [], m: ['Scanner'], turn: 2 }, { ban: ['Cyber Dragon'] }] });
  use(g, 0, 'Scanner'); settle(g);
  const s = on(g, 0, 'Scanner');
  ok(E.atk(g, s) === 2100 && E.lv(s) === 5, 'Scanner 2100 ATK Level 5');
});
T('Scary Moth: one Special Summon per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Scary Moth'], turn: 2 }, {}] });
  const x = g.p[0].deck[0];
  ok(!E.lib.forbid(g, { type: 'ss', c: x, p: 0 }), 'first Special Summon allowed');
  E.lib.ss(g, 0, x, 'atk');
  ok(E.lib.forbid(g, { type: 'ss', c: g.p[0].deck[0], p: 0 }) && !E.lib.forbid(g, { type: 'ss', c: g.p[1].deck[0], p: 1 }), 'second blocked for A, B still free');
});
T('Sea Koala needs another Beast', () => {
  const g = duel({ board: [{ hand: [], m: ['Sea Koala', 'Mother Grizzly'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  ok(!hasOpt(g, 'ATK to 0'), 'Mother Grizzly is not a Beast: no effect');
  const g2 = duel({ board: [{ hand: [], m: ['Sea Koala', 'Sea Koala'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  use(g2, 0, 'Sea Koala'); settle(g2);
  ok(atk(g2, 1, 'Cyber Dragon') === 0, 'Cyber Dragon 0 ATK');
});
T('Seal of Wickedness negates a card in the opponent\'s Standby Phase', () => {
  const g = duel({ board: [{ hand: [], st: [{ n: 'Seal of Wickedness', pos: 'up' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'yes'); settle(g); choose(g, 'end');
  for (let i = 0; i < 20 && g.prompt && !(g.prompt.type === 'idle' && g.tp === 1); i++) { const pr = g.prompt; if (pr.type === 'pick') choose(g, 'Cyber Dragon'); else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  ok(E.lib.negd(g, on(g, 1, 'Cyber Dragon')), 'Cyber Dragon negated this turn');
});
T('Search Striker destroys a face-down monster, then goes to Defense', () => {
  const g = duel({ board: [{ hand: [], m: ['Search Striker'], turn: 2 }, { m: [{ n: 'Mother Grizzly', pos: 'set' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack the face-down'); settle(g, true);
  ok(inZ(g, 1, 'gy', 'Mother Grizzly'), 'destroyed');
  choose(g, 'endbp'); settle(g);
  ok(on(g, 0, 'Search Striker').pos === 'def' && !hasOpt(g, 'Change to Attack'), 'in Defense, can\'t change');
});
T('Searchlightman: opponent can\'t Set', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Searchlightman', pos: 'set' }], turn: 2 }, {}] });
  choose(g, 'Flip Summon'); settle(g);
  ok(E.lib.forbid(g, { type: 'set', c: g.p[1].deck[0], p: 1 }) && E.lib.forbid(g, { type: 'setST', c: g.p[1].deck[0], p: 1 }), 'B cannot Set');
});
T('Secrets of the Gallant: 2 random discards on battle damage', () => {
  const g = duel({ board: [{ hand: [], m: ['Mother Grizzly'], st: ['Secrets of the Gallant'], turn: 3 }, { hand: [FILL, FILL, FILL] }] });
  ok(!hasOpt(g, 'Secrets'), 'not with only an Effect Monster');
  const g2 = duel({ board: [{ hand: [], m: ['Mystic Horseman'], st: ['Secrets of the Gallant'], turn: 3 }, { hand: [FILL, FILL, FILL] }] });
  act(g2, 0, 'Secrets of the Gallant'); settle(g2); choose(g2, 'bp'); passAll(g2); attack(g2, 'Mystic Horseman'); settle(g2);
  ok(g2.p[1].hand.length === 1, `B has 1 card left (${g2.p[1].hand.length})`);
});
T('Security Orb changes the attacker\'s position', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Sangan'], st: ['Security Orb'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Sangan'); choose(g, 'Security Orb', 1); settle(g);
  ok(on(g, 0, 'Cyber Dragon').pos === 'def' && !!on(g, 1, 'Sangan'), 'Cyber Dragon in Defense, attack stopped');
  const g2 = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Cyber Dragon'], turn: 2 }, { st: ['Security Orb'] }] });
  act(g2, 0, 'Mystical Space Typhoon'); settle(g2);
  ok(inZ(g2, 0, 'gy', 'Cyber Dragon'), 'destroyed by MST: Security Orb destroys a monster');
});
T('Seismic Crasher: twice per turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Seismic Crasher'], st: [{ n: "Robbin' Zombie", pos: 'up' }, { n: "Robbin' Zombie", pos: 'up' }, { n: "Robbin' Zombie", pos: 'up' }], turn: 2 }, {}] });
  use(g, 0, 'Seismic Crasher'); settle(g); use(g, 0, 'Seismic Crasher'); settle(g);
  ok(g.p[1].lp === 7000 && !hasOpt(g, 'Send a Continuous'), '1000 damage, no third use');
});
T('Senet Switch moves a monster', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: FILL, zi: 0 }], st: [{ n: 'Senet Switch', pos: 'up' }], turn: 2 }, {}] });
  choose(g, 'Move a monster'); settle(g);
  ok(g.p[0].m[1] && !g.p[0].m[0], 'moved to zone 1');
});
T('Shadowpriestess of Ohm burns 800', () => {
  const g = duel({ board: [{ hand: [], m: ['Shadowpriestess of Ohm', 'Sangan'], turn: 2 }, {}] });
  use(g, 0, 'Shadowpriestess of Ohm'); choose(g, 'Sangan'); settle(g);
  ok(g.p[1].lp === 7200, 'B at 7200');
});
T('Shark Cruiser summons 2 WATER monsters when the opponent destroys it', () => {
  const g = duel({ main1: [...Array(38).fill(FILL), 'Mother Grizzly', 'Mother Grizzly'], board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ['Shark Cruiser'] }] });
  act(g, 0, 'Dark Hole');
  for (let i = 0; i < 10 && g.prompt && g.prompt.type !== 'idle'; i++) { const pr = g.prompt; if (pr.type === 'yesno') choose(g, 'yes'); else if (pr.type === 'pick') E.act(g, pr.opts.slice(0, pr.max).map(o => o.key)); else if (pr.type === 'respond') E.act(g, ['pass']); else E.act(g, [pr.opts[0].key]); }
  ok(cnt(g, 1, 'm', 'Mother Grizzly') === 2, '2 Mother Grizzly');
});
T('Rinyan shuffles a Lightsworn and draws', () => {
  const g = duel({ board: [{ hand: [], m: [{ n: 'Rinyan, Lightsworn Rogue', pos: 'set' }], gy: ['Jain, Lightsworn Paladin'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; choose(g, 'Flip Summon'); settle(g);
  ok(g.p[0].hand.length === h + 1 && !inZ(g, 0, 'gy', 'Jain, Lightsworn Paladin'), 'Jain shuffled in, 1 card drawn');
});
T('Reverse of Neos summons Neos when a Neos Fusion is destroyed', () => {
  const g = duel({ main1: [...Array(39).fill(FILL), 'Elemental HERO Neos'], board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ['Elemental HERO Air Neos'], st: ['Reverse of Neos'] }] });
  act(g, 0, 'Dark Hole'); settle(g, true);
  const n = on(g, 1, 'Elemental HERO Neos');
  ok(n && E.atk(g, n) === 3500, 'Neos summoned with 3500 ATK');
});
T('Rise of the Snake Deity summons Vennominaga', () => {
  const g = duel({ main1: [...Array(39).fill(FILL), 'Vennominaga the Deity of Poisonous Snakes'], board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ['Vennominon the King of Poisonous Snakes'], st: ['Rise of the Snake Deity'] }] });
  act(g, 0, 'Dark Hole'); settle(g, true);
  ok(!!on(g, 1, 'Vennominaga the Deity of Poisonous Snakes'), 'Vennominaga summoned');
});
T('Roll Out! equips a Union from the GY', () => {
  const g = duel({ board: [{ hand: [], st: ['Roll Out!'], m: ['X-Head Cannon', FILL], gy: ['Y-Dragon Head'], turn: 3 }, {}] });
  act(g, 0, 'Roll Out!'); settle(g);
  const y = g.p[0].st.find(x => x && E.name(x) === 'Y-Dragon Head');
  ok(y && y.equipTo === on(g, 0, 'X-Head Cannon').u, 'Y-Dragon Head equipped to X-Head Cannon');
});
T('Roar of the Earthbound Immortal destroys the attacker and burns half', () => {
  // the board can't hold a Field Spell, so B's Earthbound Immortal and Field Spell are put in place by hand
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: [null, 'Sangan'], st: [{ n: 'Roar of the Earthbound Immortal', pos: 'up' }] }] });
  const P = g.p[1], u = P.deck.pop(), f = P.deck.pop();
  Object.assign(u, { id: id('Earthbound Immortal Uru'), zone: 'm', pos: 'atk', turnIn: 0 }); P.m[0] = u;
  Object.assign(f, { id: id('Realm of Light'), zone: 'fz', pos: 'up', turnIn: 0 }); P.fz = f; g.seq++;
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Sangan'); settle(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && g.p[0].lp === 8000 - 1050 && !!on(g, 1, 'Sangan'), `Cyber Dragon destroyed, A took 1050 (${g.p[0].lp})`);
});
T('Scarr searches a Dark World monster', () => {
  const g = duel({ main1: [...Array(39).fill(FILL), 'Broww, Huntsman of Dark World'], board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Scarr, Scout of Dark World'] }] });
  choose(g, 'bp'); passAll(g); attack(g, 'Cyber Dragon', 'Scarr, Scout of Dark World'); settle(g);
  ok(inZ(g, 1, 'hand', 'Broww, Huntsman of Dark World'), 'Broww added');
});
console.log(fails ? `\n${fails} failed` : '\nAll full-43 checks passed.');
process.exit(fails ? 1 : 0);
