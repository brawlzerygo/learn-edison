/* AI audit (2026-11-27): watches the computer play and counts clear blunders per game.
 node build/ai_audit.js <edison|goat> <games> [levelA] [levelB] [--old A|B|AB|none] [--jobs N] [--log dir] [--seed S]
 Seat A plays levelA with the current js/ai.js; seat B plays levelB, with build/ai_old.js when --old B (the copy of ai.js
 from before the 2026-11-27 fixes), so new Tournament can be measured against old Tournament. Seats and decks swap
 every game. Blunders are counted for every seat that plays at Tournament or Advanced, split by which AI made them.
 --log writes one text file per game with every decision of the audited seats (the options and the pick).
 Runs games in parallel worker processes (--jobs, default 4; keep it at 4 or less, the Mac runs hot).
 Detectors are hints, not verdicts: end_unused_ns and attack_into_bigger flag many good plays (holding Battle Fader or
 Treeborn Frog, declining a Tribute, Honest in hand), so read the logged positions; build/ai_replay.js rescores one. */
const path = require('path'), fs = require('fs'), vm = require('vm');
const { fork } = require('child_process');
const argv = process.argv.slice(2);
const flag = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const FMT = pos[0] || 'edison', N = +pos[1] || 10, LA = pos[2] || 'tournament', LB = pos[3] || LA;
const OLD = flag('--old', 'none'), JOBS = +flag('--jobs', 4), LOGDIR = flag('--log', null), SEED = +flag('--seed', 1);
const root = path.join(__dirname, '..');

function loadAll() {
  const ctx = { window: {}, console, Math, Date }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'goat/data/cards.js', 'goat/data/decks.js', 'js/engine.js'];
  for (const f of fs.readdirSync(path.join(root, 'js/cards')).filter(f => f.endsWith('.js')).sort()) files.push('js/cards/' + f);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  let OLDAI = null;
  if (OLD !== 'none') { vm.runInContext(fs.readFileSync(path.join(root, 'build/ai_old.js'), 'utf8'), ctx, { filename: 'ai_old.js' }); OLDAI = ctx.window.EdisonAI; ctx.window.EdisonAI = null; }
  vm.runInContext(fs.readFileSync(path.join(root, 'js/ai.js'), 'utf8'), ctx, { filename: 'ai.js' });
  const E = ctx.window.EdisonEngine, AI = ctx.window.EdisonAI;
  let decks;
  if (FMT === 'goat') {
    const C = ctx.window.GOAT_CARDS; E.init(C, { format: 'goat' });
    const ter = C.find(x => x.n === 'Thousand-Eyes Restrict');
    decks = ctx.window.GOAT_DECKS.filter(d => ['A', 'B'].includes(d.tier)).map(d => ({ name: d.name, main: d.main.map(x => +(x.id || x)), extra: (d.extra || []).map(x => +(x.id || x)) }));
    for (const d of decks) if (!d.extra.length) d.extra = [ter.id];
  } else { E.init(ctx.window.EDISON_CARDS); decks = ctx.window.EDISON_DECKS.filter(d => ['Best', 'Competitive'].includes(d.tier)); }
  return { E, AI, OLDAI, decks };
}

/* ---------- blunder detectors: each looks at the position and the pick, before the pick is played ---------- */
const NEGATORS = new Set(['Solemn Judgment', 'Dark Bribe', 'Magic Jammer', 'Seven Tools of the Bandit', 'Trap Jammer', 'Divine Wrath', 'Royal Decree', 'Horn of Heaven', 'Mystical Space Typhoon', 'Dust Tornado']);
function detect(E, g, me, keys) {
  const out = [], pr = g.prompt, k = keys[0], I = E._internal;
  const opp = 1 - me, P = g.p[me], O = g.p[opp];
  const myM = P.m.filter(Boolean), opM = O.m.filter(Boolean);
  const keyset = pr.opts.map(o => o.key);
  const card = u => { for (const Q of g.p) for (const z of ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra']) for (const c of Q[z]) if (c && c.u === u) return c; for (const Q of g.p) if (Q.fz && Q.fz.u === u) return Q.fz; return null; };
  if (pr.type === 'idle' && g.tp === me) {
    const main = ['main1', 'main2'].includes(g.phase);
    const nsOpt = keyset.filter(x => /^(ns|set):/.test(x));
    // monsters that could still attack this turn (Main Phase 1: Attack Position, not attacked)
    const attackers = myM.filter(c => c.pos === 'atk' && !c.attacks && E.atk(g, c) > 0);
    if (main && k === 'end' && nsOpt.length) {
      out.push('end_unused_ns');
      if (!myM.length) out.push('end_unused_ns_empty_board');
    }
    if (g.phase === 'main1' && k === 'end' && keyset.includes('bp') && attackers.length) {
      if (!opM.length) out.push('skip_battle_open_field');
      if (!opM.length && attackers.reduce((s, c) => s + E.atk(g, c), 0) >= O.lp) out.push('missed_lethal');
      else if (opM.length && attackers.some(a => opM.every(t => t.pos !== 'set' && (t.pos === 'atk' ? E.atk(g, a) > E.atk(g, t) : E.atk(g, a) > E.def(g, t))))) out.push('skip_battle_winning_attack');
    }
    if (g.phase === 'battle') {
      const direct = keyset.filter(x => /^atk:\d+:d$/.test(x) && E.atk(g, card(+x.split(':')[1])) > 0); // a 0-ATK attack does nothing
      if (k === 'endbp' && direct.length) {
        out.push('skip_direct_attack');
        const seen = new Set(); let dmg = 0; for (const x of direct) { const u = +x.split(':')[1]; if (!seen.has(u)) { seen.add(u); dmg += E.atk(g, card(u)); } }
        if (dmg >= O.lp) out.push('missed_lethal');
      }
      if (k === 'endbp' && !direct.length) {
        // an attack that wins its battle outright against a face-up monster
        const atks = keyset.filter(x => /^atk:\d+:\d+$/.test(x));
        if (atks.some(x => { const [, au, tu] = x.split(':'); const a = card(+au), t = card(+tu); return a && t && t.pos !== 'set' && (t.pos === 'atk' ? E.atk(g, a) > E.atk(g, t) : E.atk(g, a) > E.def(g, t)); })) out.push('skip_winning_attack');
      }
      if (/^atk:\d+:\d+$/.test(k)) {
        const [, au, tu] = k.split(':'); const a = card(+au), t = card(+tu);
        if (a && t && t.pos !== 'set') {
          const A = E.atk(g, a), T = t.pos === 'atk' ? E.atk(g, t) : E.def(g, t);
          // not a blunder when a card makes losing the battle pay: a booster or a damage trick in hand (Honest, Kalut,
          // Tragoedia), an attacker that floats when destroyed by battle (Pyramid Turtle), a target that trades on battle (D.D. Warrior Lady)
          const tx = c => { const d = E.data(c); return d.ps || d.tx || ''; };
          const trick = P.hand.some(c => /damage step|damage calculation|battle damage/i.test(tx(c)));
          if (A < T && !trick && !/destroyed by battle|sent to the graveyard/i.test(tx(a)) && !/battles/i.test(tx(t))) out.push('attack_into_bigger');
        }
      }
    }
    if (main && /^set:/.test(k)) {
      const c = card(+k.split(':')[1]); const d = c && E.data(c);
      if (d && !opM.length && (parseInt(d.atk, 10) || 0) >= 1600 && !/FLIP/i.test(d.ps || d.tx || '') && g.phase === 'main1' && keyset.includes('bp')) out.push('set_strong_vs_empty');
    }
    if (main && k === 'end' && keyset.some(x => /^syn:/.test(x))) out.push('end_unused_synchro');
  }
  if (pr.type === 'respond' && /^a:/.test(k)) {
    const c = card(+k.split(':')[1]); const n = c && E.data(c).n; const top = g.chain[g.chain.length - 1];
    if (top && top.p === me && n && ['Solemn Judgment', 'Dark Bribe', 'Magic Jammer', 'Seven Tools of the Bandit', 'Trap Jammer', 'Divine Wrath'].includes(n)) out.push('negate_own_chain');
    if (n === 'Mirror Force') { const ta = O.m.filter(c => c && c.pos === 'atk'); if (ta.length === 1 && E.atk(g, ta[0]) < 1800) out.push('mirror_on_one_small'); }
  }
  if (pr.type === 'pick' && pr.hint === 'cost' && pr.p === me) {
    const cs = pr.opts.map(o => card(o.u)).filter(c => c && c.zone === 'hand' && c.owner === me);
    if (cs.length >= 2) {
      const picked = new Set(keys.map(x => +x.slice(1)));
      const v = c => { const d = E.data(c); return d.k === 'spell' || d.k === 'trap' ? 0 : (parseInt(d.atk, 10) || 0); };
      // informational only: threw away its strongest monster while a vanilla/weak monster stayed
      const kept = cs.filter(c => !picked.has(c.u)), gone = cs.filter(c => picked.has(c.u));
      if (gone.some(c => v(c) >= 2400) && kept.some(c => v(c) && v(c) <= 1200)) out.push('discard_best_monster');
    }
  }
  return out;
}

function describe(E, g, me, keys) {
  const pr = g.prompt; const nm = c => c ? E.data(c).n : '?';
  const card = u => { for (const Q of g.p) for (const z of ['hand', 'm', 'st', 'gy', 'ban', 'deck', 'extra']) for (const c of Q[z]) if (c && c.u === u) return c; return null; };
  const P = g.p[me], O = g.p[1 - me];
  const b = Q => Q.m.map(c => c ? `${nm(c)}(${c.pos}${c.pos !== 'set' ? ' ' + E.atk(g, c) + '/' + E.def(g, c) : ''})` : '-').join(' ');
  const st = Q => Q.st.map(c => c ? (c.pos === 'set' ? 'set:' + nm(c) : nm(c)) : '-').join(' ');
  const lab = o => o.label + (o.u ? ' [' + nm(card(o.u)) + ']' : '');
  return `T${g.turnNo} ${g.phase} p${me} ${pr.type} "${pr.text}" LP ${P.lp}/${O.lp}\n  me: ${b(P)} | ${st(P)} | hand ${P.hand.map(nm).join(', ')}\n  op: ${b(O)} | ${st(O)} | hand ${O.hand.length}\n  opts: ${pr.opts.map(o => o.key + '=' + lab(o)).join('; ')}\n  PICK ${keys.join(',')}`;
}

function runGames(idxs) {
  const { E, AI, OLDAI, decks } = loadAll();
  const res = [];
  for (const i of idxs) {
    const seatA = i % 2; // seat of player A this game
    const dA = decks[(i >> 1) % decks.length], dB = decks[((i >> 1) * 7 + 3) % decks.length];
    const pl = []; pl[seatA] = { lv: LA, ai: OLD.includes('A') ? OLDAI : AI, who: 'A' }; pl[1 - seatA] = { lv: LB, ai: OLD.includes('B') ? OLDAI : AI, who: 'B' };
    const dk = []; dk[seatA] = dA; dk[1 - seatA] = dB;
    const g = E.newDuel({ decks: dk, first: (i >> 2) % 2, quiet: true, seed: SEED * 100000 + i, names: ['A', 'B'] });
    const bl = { A: {}, B: {} }, ms = { A: [], B: [] }, lines = [];
    let n = 0, err = null;
    try {
      while (g.prompt && n++ < 4000) {
        const p = g.prompt.p, P = pl[p];
        const t = Date.now(); const keys = P.ai.decide(g, p, P.lv); const dt = Date.now() - t;
        if (g.prompt.opts.length > 1) ms[P.who].push(dt);
        if (['tournament', 'advanced'].includes(P.lv)) {
          const found = detect(E, g, p, keys);
          for (const f of found) bl[P.who][f] = (bl[P.who][f] || 0) + 1;
          if (LOGDIR && found.length) fs.writeFileSync(path.join(LOGDIR, `${FMT}-${i}-${g.history.length}-${found[0]}.json`), JSON.stringify({ fmt: FMT, cfg: g.cfg, history: g.history, pzs: g.pzs || [], me: p, keys, found, lv: P.lv, who: P.who }));
          if (LOGDIR && g.prompt.opts.length > 1) lines.push((found.length ? '!! ' + found.join(',') + ' ' : '') + `[${P.who}] ` + describe(E, g, p, keys));
        }
        E.act(g, keys);
      }
    } catch (e) { err = String(e.stack || e).split('\n').slice(0, 3).join(' | '); }
    if (LOGDIR) fs.writeFileSync(path.join(LOGDIR, `${FMT}-${i}.txt`), `${dk[0].name} (${pl[0].who}) vs ${dk[1].name} (${pl[1].who}); winner ${g.winner} (${g.why}) turns ${g.turnNo}\n` + lines.join('\n') + '\n');
    res.push({ i, winner: g.winner == null || g.winner < 0 ? null : pl[g.winner].who, stuck: !!g.prompt && !err, err, turns: g.turnNo, bl, ms, decks: [dA.name, dB.name] });
  }
  return res;
}

if (process.argv.includes('--worker')) {
  const idxs = JSON.parse(flag('--idx', '[]'));
  process.send(runGames(idxs));
} else {
  if (LOGDIR) fs.mkdirSync(LOGDIR, { recursive: true });
  const all = [...Array(N).keys()]; const parts = [...Array(Math.min(JOBS, N))].map(() => []);
  all.forEach(i => parts[i % parts.length].push(i));
  const t0 = Date.now(); let pending = parts.length; const results = [];
  for (const part of parts) {
    const w = fork(__filename, [...argv, '--worker', '--idx', JSON.stringify(part)]);
    w.on('message', r => results.push(...r));
    w.on('exit', () => { if (--pending === 0) report(results, Date.now() - t0); });
  }
}
function report(R, wall) {
  const tally = { A: {}, B: {} }; const wins = { A: 0, B: 0 }; let stuck = 0, crash = 0, turns = 0; const ms = { A: [], B: [] };
  for (const r of R) {
    if (r.winner) wins[r.winner]++; if (r.stuck) stuck++; if (r.err) { crash++; console.log('CRASH', r.i, r.err); } turns += r.turns;
    for (const w of ['A', 'B']) { for (const [k, v] of Object.entries(r.bl[w])) tally[w][k] = (tally[w][k] || 0) + v; ms[w].push(...r.ms[w]); }
  }
  const pct = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? `avg ${(s.reduce((x, y) => x + y, 0) / s.length).toFixed(0)} p90 ${s[Math.floor(s.length * 0.9)]} max ${s[s.length - 1]}` : '-'; };
  console.log(`${FMT}: ${R.length} games, A=${LA} (${OLD.includes('A') ? 'old' : 'new'} ai) vs B=${LB} (${OLD.includes('B') ? 'old' : 'new'} ai). A won ${wins.A}, B won ${wins.B}, no result ${R.length - wins.A - wins.B} (stuck ${stuck}, crash ${crash}). ${(turns / R.length).toFixed(1)} turns per game, ${(wall / 1000).toFixed(0)} s.`);
  console.log(`ms per decision (choices with 2+ options): A ${pct(ms.A)}; B ${pct(ms.B)}`);
  const keys = [...new Set([...Object.keys(tally.A), ...Object.keys(tally.B)])].sort();
  for (const k of keys) console.log(`  ${k.padEnd(30)} A ${((tally.A[k] || 0) / R.length).toFixed(2)} per game   B ${((tally.B[k] || 0) / R.length).toFixed(2)} per game`);
  console.log('JSON ' + JSON.stringify({ FMT, N: R.length, wins, tally, msA: ms.A.length, stuck, crash }));
}
