/* Card roles for the computer (2026-11-28, approved by Zack): node build/make_ai_roles.js
 Reads the approved role lists (play/.audit/roles/roles-<fmt>.json, built by play/.audit/roles/tag.js from each card's
 text plus hand checks) and writes them into js/ai.js between the ROLES:BEGIN and ROLES:END lines, so the computer, the
 game's worker and the site all get them with ai.js and no new file to load. Low-confidence picks stay out: a role the
 computer acts on must have been checked by hand or read from clear card text. Rerun after any change to the roles. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = path.join(root, 'play/.audit/roles');
const USE = ['flip', 'wall', 'floater', 'recruiter', 'battle_recruiter', 'fodder', 'boss', 'floodgate', 'negation', 'hand_trap', 'mass_removal',
  'spot_monster', 'spot_backrow', 'steal', 'gy_effect', 'tuner', 'searcher', 'draw', 'book', 'position_change', 'buff', 'beatstick', 'extender',
  'revival', 'recursion', 'mill', 'burn', 'protection', 'hand_disruption', 'summon_enabler'];
const out = {};
for (const fmt of ['edison', 'goat']) {
  const rows = JSON.parse(fs.readFileSync(path.join(src, `roles-${fmt}.json`), 'utf8'));
  const by = {};
  for (const r of rows) for (const x of r.roles) if (!x.low && USE.includes(x.id)) (by[x.id] = by[x.id] || []).push(r.n);
  for (const k in by) by[k] = by[k].sort().join('|');
  out[fmt] = by;
}
// the approved list itself, kept in this repo (play/.audit is local only): build/roles/, for the site's lessons and the videos too
const keep = path.join(root, 'build/roles'); fs.mkdirSync(keep, { recursive: true });
fs.copyFileSync(path.join(src, 'taxonomy.json'), path.join(keep, 'taxonomy.json'));
for (const fmt of ['edison', 'goat']) {
  const rows = JSON.parse(fs.readFileSync(path.join(src, `roles-${fmt}.json`), 'utf8'));
  const slim = rows.map(r => ({ n: r.n, id: r.id, k: r.k, decks: r.decks, roles: r.roles.map(x => x.low ? x.id + '?' : x.id), engines: r.engines.length ? r.engines : undefined, checked: r.checked || undefined, note: r.note || undefined, risk: r.risk }));
  fs.writeFileSync(path.join(keep, `roles-${fmt}.json`), '[\n' + slim.map(x => JSON.stringify(x)).join(',\n') + '\n]\n');
}
const block = `// ROLES:BEGIN written by build/make_ai_roles.js from play/.audit/roles (approved 2026-11-28); do not edit by hand\nconst ROLE_LISTS = ${JSON.stringify(out)};\n// ROLES:END`;
const f = path.join(root, 'js/ai.js'); let s = fs.readFileSync(f, 'utf8');
const re = /\/\/ ROLES:BEGIN[\s\S]*?\/\/ ROLES:END/;
if (!re.test(s)) throw new Error('js/ai.js has no ROLES:BEGIN ... ROLES:END block');
s = s.replace(re, () => block);
fs.writeFileSync(f, s);
const n = f => Object.values(out[f]).reduce((a, v) => a + v.split('|').length, 0);
console.log(`roles written into js/ai.js: edison ${n('edison')} card roles, goat ${n('goat')}; block ${(block.length / 1024).toFixed(0)} KB`);
