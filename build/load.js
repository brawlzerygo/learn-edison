// Shared loader for the node tests: card data, decks, the engine, every js/cards/*.js script file, and the AI.
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
module.exports = function load(opts = {}) {
  const ctx = { window: {}, console, Math }; vm.createContext(ctx);
  const files = ['data/cards.js', 'data/decks.js', 'js/engine.js'];
  const cardDir = path.join(root, 'js/cards');
  const only = opts.only; // load only these card files (names), default all
  for (const f of fs.readdirSync(cardDir).filter(f => f.endsWith('.js')).sort()) if (!only || only.includes(f)) files.push('js/cards/' + f);
  if (opts.ai) files.push('js/ai.js');
  for (const f of files) {
    try { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); }
    // A card file that fails to load stops every test (2026-11-28 audit: a skipped file let the suite pass with a whole batch of cards missing).
    // LOAD_SKIP_BROKEN=1 brings back the old skip, only for a file still being written.
    catch (e) { if (f.startsWith('js/cards/') && process.env.LOAD_SKIP_BROKEN) console.error(`(skipped ${f}: ${e.message})`); else throw new Error(`${f} failed to load: ${e.message}`); }
  }
  const E = ctx.window.EdisonEngine; E.init(ctx.window.EDISON_CARDS);
  return { ctx, E, AI: ctx.window.EdisonAI, C: ctx.window.EDISON_CARDS, DECKS: ctx.window.EDISON_DECKS };
};
