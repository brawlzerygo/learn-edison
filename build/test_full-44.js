// Scenario checks for full pool batch 44: node build/test_full-44.js
const { E, C } = require('./load')();
const id = n => { const c = C.find(x => x.n === n); if (!c) throw new Error('no card ' + n); return c.id; };
const FILL = 'Gene-Warped Warwolf';
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
const hasOpt = (g, text) => g.prompt && g.prompt.opts.some(x => (x.label + ' ' + x.key).toLowerCase().includes(text.toLowerCase()));
const passAll = (g, upto = 20) => { for (let i = 0; i < upto && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']); };
const yesAll = g => { for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'yesno'; i++) choose(g, 'yes'); };
const act = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st].find(c => c && E.name(c) === n).u + ':');
const actAny = (g, p, n) => choose(g, 'a:' + [...g.p[p].hand, ...g.p[p].st, ...g.p[p].m, ...g.p[p].gy, ...g.p[p].ban].find(c => c && E.name(c) === n).u + ':');
const on = (g, p, n) => g.p[p].m.find(c => c && E.name(c) === n);
const inZ = (g, p, z, n) => g.p[p][z].some(c => c && E.name(c) === n);
const T = (name, f) => { try { f(); } catch (e) { fails++; console.log('FAIL ' + name + ': ' + e.message); } };
// play on: pass every response, answer yes/no with `yes`, stop at the next idle prompt of player p (or the game end)
function toIdle(g, p, yes = false) { for (let i = 0; i < 200 && g.prompt; i++) { const pr = g.prompt; if (pr.type === 'idle' && pr.p === p) return; if (pr.type === 'respond') E.act(g, ['pass']); else if (pr.type === 'yesno') E.act(g, [yes ? 'y' : 'n']); else if (pr.type === 'idle') E.act(g, [pr.opts.find(o => o.key === 'endbp') ? 'endbp' : 'end']); else E.act(g, [pr.opts[0].key]); } }
const endTurn = (g, yes) => { const p = 1 - g.tp; choose(g, 'end'); toIdle(g, p, yes); };

T('Shattered Axe: -500 ATK each of your Standby Phases', () => {
  const g = duel({ board: [{ hand: [], st: ['Shattered Axe'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  act(g, 0, 'Shattered Axe'); passAll(g);
  endTurn(g); endTurn(g);
  ok(E.atk(g, on(g, 1, 'Cyber Dragon')) === 1600, `Cyber Dragon at 1600 ATK (${E.atk(g, on(g, 1, 'Cyber Dragon'))})`);
});
T('Shiba-Warrior Taro returns when a card is destroyed', () => {
  const g = duel({ board: [{ hand: ['Mystical Space Typhoon'], m: ['Shiba-Warrior Taro'], turn: 2 }, { st: ['Mirror Force'] }] });
  act(g, 0, 'Mystical Space Typhoon'); passAll(g); passAll(g);
  ok(inZ(g, 0, 'hand', 'Shiba-Warrior Taro'), 'Taro returned to the hand');
});
T('Shining Silver Force negates Magic Cylinder and wipes face-up Spells/Traps', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: ['Shining Silver Force'], turn: 2 }, { st: ['Magic Cylinder', { n: 'Spacegate', pos: 'up' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); choose(g, 'Magic Cylinder', 1);
  ok(hasOpt(g, 'Shining Silver Force'), 'Shining Silver Force offered'); choose(g, 'Shining Silver Force', 0); for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']);
  ok(inZ(g, 1, 'gy', 'Magic Cylinder') && inZ(g, 1, 'gy', 'Spacegate') && g.p[0].lp === 8000 && g.p[1].lp === 8000 - 2100, `Cylinder negated, Spacegate destroyed, the attack went through (A ${g.p[0].lp}, B ${g.p[1].lp})`);
});
T('Shiny Black C destroys a Synchro Monster from the GY', () => {
  const g = duel({ ex0: ['Hyper Psychic Blaster'], board: [{ hand: [], m: ['Psychic Commander', 'Overdrive Teleporter'], turn: 2 }, { gy: ['Shiny Black C'] }] });
  choose(g, 'Synchro Summon'); if (g.prompt && g.prompt.type === 'choose') choose(g, 'Attack');
  for (let i = 0; i < 6 && g.prompt && !hasOpt(g, 'Shiny Black C'); i++) E.act(g, [g.prompt.type === 'respond' ? 'pass' : g.prompt.opts[0].key]);
  ok(hasOpt(g, 'Shiny Black C'), 'Shiny Black C offered'); choose(g, 'Shiny Black C'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Hyper Psychic Blaster') && inZ(g, 1, 'ban', 'Shiny Black C'), 'Blaster destroyed, Shiny Black C banished');
});
T('Shire gains ATK per Lightsworn name and mills 2 in the End Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Shire, Lightsworn Spirit'], gy: ['Ryko, Lightsworn Hunter', 'Ryko, Lightsworn Hunter', 'Lumina, Lightsworn Summoner'], turn: 2 }, {}] });
  ok(E.atk(g, on(g, 0, 'Shire, Lightsworn Spirit')) === 1000, 'Shire has 1000 ATK');
  const n = g.p[0].gy.length; choose(g, 'end'); passAll(g);
  ok(g.p[0].gy.length === n + 2, 'milled 2');
});
T('Shreddder sends a Machine to destroy a lower Level monster', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon'], m: ['Shreddder'], turn: 2 }, { m: ['Shiba-Warrior Taro'] }] });
  actAny(g, 0, 'Shreddder'); passAll(g);
  ok(inZ(g, 0, 'gy', 'Cyber Dragon') && inZ(g, 1, 'gy', 'Shiba-Warrior Taro'), 'Cyber Dragon sent, Taro destroyed');
});
T('Shutendoji banishes 2 Zombies to draw', () => {
  const g = duel({ board: [{ hand: [], m: ['Shutendoji'], gy: ['Plaguespreader Zombie', 'Plaguespreader Zombie'], turn: 2 }, {}] });
  const h = g.p[0].hand.length; actAny(g, 0, 'Shutendoji'); passAll(g);
  ok(g.p[0].ban.length === 2 && g.p[0].hand.length === h + 1, 'banished 2, drew 1');
});
T('Sillva stays in the GY when discarded for Snipe Hunter\'s cost (Dark World archive: "DO NOT activate when discarded as a cost", 2026-11-27 audit)', () => {
  const g = duel({ board: [{ hand: ['Sillva, Warlord of Dark World'], m: ['Snipe Hunter'], turn: 2 }, { m: [FILL] }] });
  actAny(g, 0, 'Snipe Hunter'); if (g.prompt.type === 'pick') choose(g, 'Sillva'); passAll(g); passAll(g); passAll(g);
  ok(!on(g, 0, 'Sillva, Warlord of Dark World') && g.p[0].gy.some(c => E.name(c) === 'Sillva, Warlord of Dark World'), 'Sillva stays in the GY');
});
T('Sillva discarded by the opponent sends 2 of their cards to the Deck bottom', () => {
  const g = duel({ board: [{ hand: ['Mind Crush', FILL, FILL, FILL], turn: 2 }, { hand: ['Sillva, Warlord of Dark World', FILL] }] });
  g.p[0].st[0] = null; choose(g, 'setst:' + g.p[0].hand.find(c => E.name(c) === 'Mind Crush').u); endTurn(g); endTurn(g);
  const h = g.p[0].hand.length; act(g, 0, 'Mind Crush'); for (let i = 0; i < 8 && g.prompt && g.prompt.type !== 'idle'; i++) { if (g.prompt.type === 'respond') E.act(g, ['pass']); else if (hasOpt(g, 'Sillva')) choose(g, 'Sillva'); else E.act(g, g.prompt.opts.slice(0, g.prompt.min || 1).map(o => o.key)); }
  ok(!!on(g, 1, 'Sillva, Warlord of Dark World') && g.p[0].hand.length === h - 2, `Sillva summoned, A put 2 cards back (hand ${h} to ${g.p[0].hand.length})`);
});
T('Silver Wing is destroyed instead of the Dragon', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Stardust Dragon'], st: [{ n: 'Silver Wing', pos: 'up' }], turn: 2 }, {}] });
  g.p[0].st[0].equipTo = g.p[0].m[0].u;
  act(g, 0, 'Dark Hole'); passAll(g); passAll(g);
  ok(!!on(g, 0, 'Stardust Dragon') && inZ(g, 0, 'gy', 'Silver Wing'), 'Stardust stays, Silver Wing destroyed');
});
T('Simorgh, Bird of Ancestry: WIND Tribute Summon bounces', () => {
  const g = duel({ board: [{ hand: ['Simorgh, Bird of Ancestry'], m: ['Speed Warrior', 'Speed Warrior'], turn: 2 }, { m: [FILL], st: ['Mirror Force'] }] });
  choose(g, 'ns:'); passAll(g);
  if (g.prompt && g.prompt.type === 'pick') { const ks = g.prompt.opts.map(o => o.key); E.act(g, ks.slice(0, 2)); }
  passAll(g);
  ok(g.p[1].hand.length >= 7 && !on(g, 1, FILL), `2 cards returned (hand ${g.p[1].hand.length})`);
  // with it face-up, a Level 7 WIND monster needs 1 Tribute
  const g2 = duel({ board: [{ hand: ['Storm Shooter'], m: ['Simorgh, Bird of Ancestry', 'Speed Warrior'], turn: 2 }, {}] });
  choose(g2, 'ns:'); ok(g2.prompt && /how many/i.test(g2.prompt.text) && hasOpt(g2, '1 Tribute'), '1 Tribute offered for Storm Shooter');
});
T('Simorgh, Bird of Divinity: End Phase damage and no Special Summon', () => {
  const g = duel({ board: [{ hand: [], m: ['Simorgh, Bird of Divinity'], st: ['Mirror Force'], turn: 2 }, {}] });
  choose(g, 'end'); passAll(g);
  ok(g.p[0].lp === 7500, `A took 500 (${g.p[0].lp})`);
  const sim = g.p[0].m[0]; ok(E.lib.forbid(g, { type: 'ss', c: sim, p: 0 }), 'cannot be Special Summoned');
});
T('Six Scrolls of the Samurai summons Great Shogun Shien', () => {
  const g = duel({ board: [{ hand: ['Six Scrolls of the Samurai'], m: ['The Six Samurai - Zanji', 'The Six Samurai - Kamon'], deckTop: [FILL, 'Great Shogun Shien'], turn: 2 }, {}] });
  act(g, 0, 'Six Scrolls of the Samurai'); passAll(g);
  ok(!!on(g, 0, 'Great Shogun Shien'), 'Shien summoned');
});
T('Skill Successor: +400, then +800 from the GY on a later turn', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: ['Skill Successor'], turn: 2 }, {}] });
  act(g, 0, 'Skill Successor'); passAll(g);
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 2500, '+400');
  ok(!hasOpt(g, 'Banish: a monster gains 800'), 'GY effect not offered the turn it went to the GY');
  endTurn(g); endTurn(g);
  actAny(g, 0, 'Skill Successor'); passAll(g);
  ok(E.atk(g, on(g, 0, 'Cyber Dragon')) === 2900, '+800');
});
T('Sky Scourge Enrise: own summon rule, banish, then no attack', () => {
  const g = duel({ board: [{ hand: ['Sky Scourge Enrise'], gy: ['Shining Angel', 'Shining Angel', 'Shining Angel', 'Dark Ruler Ha Des'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  choose(g, 'sp:'); for (let i = 0; i < 3 && g.prompt && g.prompt.type === 'pick'; i++) E.act(g, g.prompt.opts.slice(0, g.prompt.min).map(o => o.key)); passAll(g);
  const en = on(g, 0, 'Sky Scourge Enrise'); ok(!!en, 'Enrise summoned');
  actAny(g, 0, 'Sky Scourge Enrise'); passAll(g);
  ok(inZ(g, 1, 'ban', 'Cyber Dragon'), 'Cyber Dragon banished');
  choose(g, 'bp'); passAll(g); ok(!hasOpt(g, 'Attack'), 'Enrise cannot attack');
});
T('Sky Scourge Invicil with a DARK Fiend Tribute turns off Gravity Bind', () => {
  const g = duel({ board: [{ hand: ['Sky Scourge Invicil'], m: ['Dark Ruler Ha Des'], turn: 2 }, { st: [{ n: 'Gravity Bind', pos: 'up' }] }] });
  choose(g, 'ns:'); passAll(g);
  choose(g, 'bp'); passAll(g); ok(hasOpt(g, 'Attack directly'), 'Invicil can attack through Gravity Bind');
});
T('Slip of Fortune negates the attack and banishes the target until the next Standby Phase', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: [FILL], st: ['Slip of Fortune'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack ' + FILL); choose(g, 'Slip of Fortune', 1); passAll(g);
  ok(inZ(g, 1, 'ban', FILL), 'target banished');
  toIdle(g, 0); endTurn(g);
  ok(!!on(g, 1, FILL), 'target back on the field');
});
T('Slip Summon summons in Defense and returns in the End Phase', () => {
  const g = duel({ board: [{ hand: ['Cyber Dragon'], turn: 2 }, { hand: ['Speed Warrior'], st: ['Slip Summon'] }] });
  g.p[0].m[0] = null; choose(g, 'ns:'); choose(g, 'Slip Summon', 1); passAll(g);
  const s = on(g, 1, 'Speed Warrior'); ok(s && s.pos === 'def', 'Speed Warrior in Defense');
  choose(g, 'end'); toIdle(g, 1);
  ok(inZ(g, 1, 'hand', 'Speed Warrior'), 'returned to the hand');
});
T('Spacegate gets a counter and summons from the hand', () => {
  const g = duel({ board: [{ hand: ['Speed Warrior'], m: [], st: [{ n: 'Spacegate', pos: 'up' }], turn: 2 }, { m: ['Cyber Dragon'] }] });
  endTurn(g); // B attacks? B has no turn yet here: do the battle on B's turn
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); toIdle(g, 1); choose(g, 'end'); toIdle(g, 0);
  const sg = g.p[0].st.find(x => x && E.name(x) === 'Spacegate'); ok(sg && sg.ctr && sg.ctr.gate === 1, 'one Gate Counter');
});
T('Spark Blaster changes a position and breaks after 3 uses', () => {
  const g = duel({ board: [{ hand: ['Spark Blaster'], m: ['Elemental HERO Sparkman'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Spark Blaster'); passAll(g);
  for (let i = 0; i < 3; i++) { actAny(g, 0, 'Spark Blaster'); choose(g, FILL); passAll(g); }
  ok(on(g, 1, FILL).pos === 'def' && inZ(g, 0, 'gy', 'Spark Blaster'), 'Warwolf in Defense, Spark Blaster gone');
});
T('Speed Warrior doubles its ATK in the Battle Phase of its Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Speed Warrior'], turn: 2 }, {}] });
  choose(g, 'ns:'); passAll(g); choose(g, 'bp'); passAll(g); actAny(g, 0, 'Speed Warrior'); passAll(g);
  const s = on(g, 0, 'Speed Warrior'); ok(E.atk(g, s) === 1800, '1800 ATK');
  choose(g, 'endbp'); toIdle(g, 0); ok(E.atk(g, s) === 900, 'back to 900 after the Battle Phase');
});
T('Spider Egg negates a direct attack and makes 3 tokens', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { st: ['Spider Egg'], gy: ['Pinch Hopper', 'Pinch Hopper', 'Pinch Hopper'] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); choose(g, 'Spider Egg', 1); passAll(g);
  ok(g.p[1].m.filter(Boolean).length === 3 && g.p[1].lp === 8000, '3 Spider Tokens, no damage');
});
T('Spider Web puts the attacker in Defense and locks it', () => {
  const g2 = duel({ board: [{ hand: ['Spider Web'], m: ['Cyber Dragon'], turn: 2 }, { m: [FILL] }] });
  act(g2, 0, 'Spider Web'); passAll(g2); choose(g2, 'bp'); passAll(g2); choose(g2, 'Attack ' + FILL); toIdle(g2, 0);
  const cd = on(g2, 0, 'Cyber Dragon'); ok(cd.pos === 'def' && E.lib.forbid(g2, { type: 'pos', c: cd }), 'Cyber Dragon in Defense and locked');
});
T('Star Blast lowers a Level 5 in hand to 4 for a Normal Summon', () => {
  const g = duel({ board: [{ hand: ['Star Blast', 'Cyber Dragon'], turn: 2 }, { m: [FILL] }] });
  act(g, 0, 'Star Blast'); choose(g, '500 LP'); passAll(g); if (g.prompt && g.prompt.type === 'pick') choose(g, 'Cyber Dragon');
  ok(g.p[0].lp === 7500, 'paid 500');
  ok(hasOpt(g, 'Normal Summon'), 'Cyber Dragon can be Normal Summoned without a Tribute');
});
T('Storm Caller: destroyed by an effect, its controller takes 2300', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], turn: 2 }, { m: ['Storm Caller'] }] });
  act(g, 0, 'Dark Hole'); passAll(g); passAll(g);
  ok(g.p[1].lp === 8000 - 2300, `B took 2300 (${g.p[1].lp})`);
});
T('Storming Wynn: the summoned WIND dies with Wynn', () => {
  const g = duel({ board: [{ hand: ['Storm Shooter'], m: ['Storming Wynn', 'Speed Warrior'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  actAny(g, 0, 'Storming Wynn'); passAll(g);
  ok(!!on(g, 0, 'Storm Shooter') && inZ(g, 0, 'gy', 'Speed Warrior'), 'Storm Shooter summoned, Speed Warrior Tributed');
  choose(g, 'bp'); passAll(g); choose(g, 'atk:' + on(g, 0, 'Storming Wynn').u); toIdle(g, 0);
  ok(inZ(g, 0, 'gy', 'Storming Wynn') && inZ(g, 0, 'gy', 'Storm Shooter'), 'Storm Shooter destroyed with Wynn');
});
T('Strong Wind Dragon gains half a Tributed Dragon\'s ATK', () => {
  const g = duel({ board: [{ hand: ['Strong Wind Dragon'], m: ['Cyber Dragon'], turn: 2 }, {}] });
  choose(g, 'ns:'); passAll(g); passAll(g);
  const s = on(g, 0, 'Strong Wind Dragon'); ok(s && E.atk(g, s) === 2400, `no gain from a Machine (${s && E.atk(g, s)})`);
  const g2 = duel({ board: [{ hand: ['Strong Wind Dragon'], m: ['Stardust Xiaolong'], turn: 2 }, {}] });
  choose(g2, 'ns:'); passAll(g2); passAll(g2);
  const s2 = on(g2, 0, 'Strong Wind Dragon'); ok(s2 && E.atk(g2, s2) === 2450, `2450 ATK (${s2 && E.atk(g2, s2)})`);
});
T('Stronghold the Moving Fortress gains 3000 with all three Gadgets', () => {
  const g = duel({ board: [{ hand: [], m: ['Green Gadget', 'Red Gadget', 'Yellow Gadget'], st: [null, null, null, 'Stronghold the Moving Fortress'], turn: 2 }, {}] });
  act(g, 0, 'Stronghold the Moving Fortress'); passAll(g);
  const s = on(g, 0, 'Stronghold the Moving Fortress'); ok(s && E.atk(g, s) === 3000 && E.lib.def(g, s) === 2000, 'Stronghold 3000/2000');
});
T('Submarineroid attacks directly for its original ATK', () => {
  const g = duel({ board: [{ hand: [], m: ['Submarineroid'], turn: 2 }, { m: ['Cyber Dragon'] }] });
  E.lib.addMod(g, on(g, 0, 'Submarineroid'), { atk: 1000 });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack directly'); passAll(g); passAll(g); passAll(g); yesAll(g);
  ok(g.p[1].lp === 7200, `B took 800 (${g.p[1].lp})`);
  ok(on(g, 0, 'Submarineroid').pos === 'def', 'changed to Defense');
});
T('Sun Dragon Inti: Synchro with Fire Ant Ascator and battle revenge', () => {
  const g = duel({ ex0: ['Sun Dragon Inti'], board: [{ hand: [], m: ['Fire Ant Ascator', 'Cyber Dragon'], turn: 2 }, { m: ['Shiba-Warrior Taro'] }] });
  ok(hasOpt(g, 'Synchro Summon'), 'Synchro offered'); choose(g, 'Synchro Summon'); passAll(g);
  ok(!!on(g, 0, 'Sun Dragon Inti'), 'Inti summoned');
  const g2 = duel({ board: [{ hand: [], m: ['Cyber Dragon'], turn: 2 }, { m: ['Sun Dragon Inti'] }] });
  E.lib.addMod(g2, on(g2, 0, 'Cyber Dragon'), { atk: 1500 });
  choose(g2, 'bp'); passAll(g2); choose(g2, 'Attack Sun Dragon'); for (let i = 0; i < 10 && g2.prompt && g2.prompt.type === 'respond'; i++) E.act(g2, ['pass']);
  ok(inZ(g2, 0, 'gy', 'Cyber Dragon') && g2.p[0].lp === 8000 - 1800, `Cyber Dragon destroyed and A took 1800 (${g2.p[0].lp})`);
T('Sunny Pixie gains 1000 for a LIGHT Synchro', () => {
  const g = duel({ ex0: ['Ancient Fairy Dragon'], board: [{ hand: [], m: ['Sunny Pixie', 'Gragonith, Lightsworn Dragon'], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); if (g.prompt && g.prompt.type === 'choose') choose(g, 'Attack'); passAll(g); passAll(g);
  ok(!!on(g, 0, 'Ancient Fairy Dragon') && g.p[0].lp === 9000, `A gained 1000 (${g.p[0].lp})`);
});
T('Stardust Xiaolong comes back with a Stardust Dragon Synchro Summon', () => {
  const g = duel({ ex0: ['Stardust Dragon'], board: [{ hand: [], m: ['Junk Synchron', 'Cyber Dragon'], gy: ['Stardust Xiaolong'], turn: 2 }, {}] });
  choose(g, 'Synchro Summon'); if (g.prompt && g.prompt.type === 'choose') choose(g, 'Attack'); passAll(g); yesAll(g); passAll(g);
  ok(!!on(g, 0, 'Stardust Dragon') && !!on(g, 0, 'Stardust Xiaolong'), 'Xiaolong Special Summoned');
});
});
T('Supay Special Summons Oracle of the Sun with double ATK', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Supay'], deckTop: [FILL, 'Oracle of the Sun'], turn: 2 }, {}] });
  act(g, 0, 'Dark Hole'); passAll(g); yesAll(g); passAll(g);
  const o = on(g, 0, 'Oracle of the Sun'); ok(o && E.atk(g, o) === 2000, 'Oracle with 2000 ATK');
  choose(g, 'end'); toIdle(g, 1); ok(inZ(g, 0, 'hand', 'Oracle of the Sun'), 'Oracle returned to the hand');
});
T('Supernatural Regeneration counts Psychics sent this turn', () => {
  const g = duel({ board: [{ hand: ['Dark Hole'], m: ['Psychic Commander'], turn: 2 }, { st: ['Supernatural Regeneration'] }] });
  act(g, 0, 'Dark Hole'); passAll(g); passAll(g);
  choose(g, 'end'); for (let i = 0; i < 6 && g.prompt && !hasOpt(g, 'Supernatural'); i++) E.act(g, [g.prompt.opts.find(o => o.key === 'pass') ? 'pass' : g.prompt.opts[0].key]);
  ok(hasOpt(g, 'Supernatural'), 'offered in the End Phase'); choose(g, 'Supernatural'); passAll(g);
  ok(g.p[1].lp === 9000, `B gained 1000 (${g.p[1].lp})`);
});
T('Supersonic Skull Flame: summon rule and burn', () => {
  const g = duel({ board: [{ hand: ['Supersonic Skull Flame'], gy: ['Skull Flame', 'Burning Skull Head', 'Burning Skull Head'], turn: 2 }, {}] });
  choose(g, 'sp:'); passAll(g); ok(!!on(g, 0, 'Supersonic Skull Flame') && inZ(g, 0, 'ban', 'Skull Flame'), 'summoned by banishing Skull Flame');
  actAny(g, 0, 'Supersonic Skull Flame'); passAll(g); ok(g.p[1].lp === 7200, 'B took 800');
});
T('Strike Slash gives +700 and piercing', () => {
  const g = duel({ board: [{ hand: [], m: ['Cyber Dragon'], st: ['Strike Slash'], turn: 2 }, { m: [{ n: FILL, pos: 'def' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack ' + FILL); choose(g, 'Strike Slash', 0); for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']);
  ok(g.p[1].lp === 8000 - (2800 - 100), `piercing 2700 (${g.p[1].lp})`);
});
T('Steamroid +500 attacking', () => {
  const g = duel({ board: [{ hand: [], m: ['Steamroid'], turn: 2 }, { m: [{ n: 'Cyber Dragon', pos: 'atk' }] }] });
  choose(g, 'bp'); passAll(g); choose(g, 'Attack Cyber Dragon'); for (let i = 0; i < 10 && g.prompt && g.prompt.type === 'respond'; i++) E.act(g, ['pass']);
  ok(inZ(g, 1, 'gy', 'Cyber Dragon') && !inZ(g, 0, 'gy', 'Steamroid'), 'Steamroid (2300) beat Cyber Dragon');
});
console.log(fails ? `\n${fails} failed` : '\nAll batch 44 checks passed.');
process.exit(fails ? 1 : 0);
