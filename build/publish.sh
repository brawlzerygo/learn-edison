#!/bin/sh
# Publish Learn Edison to GitHub Pages on the brawlzerygo GitHub account.
#
# Runs in its own GitHub sign-in (~/.config/gh-brawlzerygo), so it never uses or changes any other GitHub login on
# this Mac, and it never edits the global git settings. It stops unless the signed-in account is brawlzerygo and the
# push destination is a brawlzerygo repository. This script is the only way Claude sessions may push (Zack,
# 2026-11-17): the project settings allow running it and still block raw `gh` and `git push`.
#
# First run: signs in (in the browser), creates the public repo brawlzerygo/learn-edison, pushes the site and turns on
# GitHub Pages. Later runs: commit any changes and push them; the live site updates a minute or two later.
#
# Usage: sh build/publish.sh ["what changed"]                  the Edison site (this folder, edison.learnretro.com)
#        sh build/publish.sh --site hub ["what changed"]       the learnretro.com hub (hub/, repo learn-retro)
#        sh build/publish.sh --site preview ["what changed"]   the preview of the Edison site (preview/, repo learn-edison-preview,
#                                                               edison-preview.learnretro.com): every change goes here first
#        sh build/publish.sh --site redirect ["what changed"]  learnedison.com, redirecting (redirect/, repo learnedison-redirect)
#        sh build/publish.sh --site site-preview ["what changed"]  the whole learnretro.com preview: hub, /edison/ and /goat/
#                                                               (site-preview/, repo learn-retro-preview, preview.learnretro.com)
#        sh build/publish.sh --site goat ["what changed"]      the Goat source (goat/, repo learn-goat, no Pages)
# Since 2026-11-23 (Zack: one domain) --site hub also assembles /edison/ and /goat/ into the hub (build/assemble.mjs).
# hub/, redirect/, goat/ and site-preview/ are their own git repos inside this folder (ignored by this repo);
# same account, same checks.
set -e
cd "$(dirname "$0")/.."
export GH_CONFIG_DIR="$HOME/.config/gh-brawlzerygo"
OWNER=brawlzerygo
REPO=learn-edison
DESC="A free, open-source site for learning Edison format Yu-Gi-Oh! (April 2010)"
if [ "$1" = "--site" ]; then
  case "$2" in
    hub) node build/prerender.mjs && python3 build/check_js.py && (cd goat && python3 build/check_js.py) && node build/assemble.mjs --live || { echo "The site build failed. Not publishing."; exit 1; }
      cd hub; REPO=learn-retro; DESC="Learn Retro Yu-Gi-Oh!: free courses for retro formats" ;;
    site-preview) node build/prerender.mjs && python3 build/check_js.py && (cd goat && python3 build/check_js.py) && node build/assemble.mjs --preview || { echo "The preview build failed. Not publishing."; exit 1; }
      cd site-preview; REPO=learn-retro-preview; DESC="Preview of learnretro.com: the hub, /edison/ and /goat/ (not indexed)" ;;
    preview) node build/make-redirects.mjs || exit 1
      cd preview; REPO=learn-edison-preview; DESC="edison-preview.learnretro.com now redirects to preview.learnretro.com/edison/" ;;
    redirect) node build/make-redirects.mjs || exit 1
      cd redirect; REPO=learnedison-redirect; DESC="learnedison.com now redirects to learnretro.com/edison/" ;;
    goat) cd goat; python3 build/check_js.py || { echo "Fix the JavaScript errors above. Not publishing."; exit 1; }
      REPO=learn-goat; DESC="Source of the Goat format course at learnretro.com/goat/"; NOPAGES=1 ;;
    *) echo "Unknown site: $2 (use hub, site-preview, preview, redirect or goat)"; exit 1 ;;
  esac
  shift 2
  [ -d .git ] || git init -q -b main
fi
# Commits are made as brawlzerygo with its no-reply address in every repo (never this Mac's own name and address).
git config user.email >/dev/null 2>&1 && [ "$(git config --local user.email)" = "brawlzerygo@users.noreply.github.com" ] || { git config --local user.email brawlzerygo@users.noreply.github.com; git config --local user.name brawlzerygo; }

# Since 2026-11-23 the Edison site is built for learnretro.com/edison/ (Zack: one domain). Until the live switch turns
# edison.learnretro.com into a redirect, publishing this repo as its own site would break it, so stop here.
# Since the live switch (2026-11-23) this repo's Pages serve only docs/: redirects from edison.learnretro.com into
# learnretro.com/edison/ (build/make-redirects.mjs). The Edison site itself goes live with --site hub.
if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  echo "Sign in to GitHub as $OWNER in the browser that opens."
  echo "If asked whether to authenticate Git with your GitHub credentials, answer No."
  gh auth login --hostname github.com --git-protocol https --web
fi
user=$(gh api user --jq .login)
[ "$user" = "$OWNER" ] || { echo "Signed in to GitHub as $user, not $OWNER. Stopping without publishing."; exit 1; }

# Pushes use this sign-in for this command only.
push() { git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push "$@"; }

if ! git remote get-url origin >/dev/null 2>&1; then
  if ! gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
    gh repo create "$OWNER/$REPO" --public \
      --description "$DESC" \
      --homepage "https://$OWNER.github.io/$REPO/"
  fi
  git remote add origin "https://github.com/$OWNER/$REPO.git"
fi

# Only ever push to a brawlzerygo repository.
origin=$(git remote get-url origin)
case "$origin" in
  https://github.com/$OWNER/*) ;;
  *) echo "The push destination is $origin, not a $OWNER repository. Stopping without publishing."; exit 1 ;;
esac

# The Edison site: stop on any JavaScript syntax error, so a broken page never goes live (2026-11-22).
# The Edison site: write every page as its own HTML file first (clean URLs and SEO, 2026-11-22), so the published
# pages always match the app.
# The hub: build the blog pages and sitemap from blog/posts/ (drafts stay unpublished).
if [ "$REPO" = "learn-retro" ]; then node tools/blog.mjs || { echo "The blog build failed. Not publishing."; exit 1; }; fi
if [ "$REPO" = "learn-edison" ]; then node build/prerender.mjs && node build/make-redirects.mjs || { echo "The pre-render failed. Not publishing."; exit 1; }; fi
if [ "$REPO" = "learn-edison" ]; then python3 build/check_js.py || { echo "Fix the JavaScript errors above. Not publishing."; exit 1; }; fi
git add -A
git diff --cached --quiet || git commit -q -m "${1:-Update the site}"
push -u origin main

# A source-only repo (learn-goat) stops here: the site itself is published inside learnretro.com by --site hub.
if [ -n "$NOPAGES" ]; then echo "Pushed https://github.com/$OWNER/$REPO (source only, no Pages)."; exit 0; fi
# Turn on GitHub Pages (the main branch, root folder) the first time.
if ! gh api "repos/$OWNER/$REPO/pages" >/dev/null 2>&1; then
  gh api -X POST "repos/$OWNER/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null
  echo "GitHub Pages is on."
fi
# learn-edison serves docs/ (the redirects), not the repository root.
if [ "$REPO" = "learn-edison" ]; then gh api -X PUT "repos/$OWNER/$REPO/pages" -f "source[branch]=main" -f "source[path]=/docs" >/dev/null && echo "Pages source: main /docs (redirects)."; fi
# Custom domain (the CNAME file: edison.learnretro.com since 2026-11-22, learnedison.com before): make sure Pages uses it, and turn on HTTPS once
# GitHub has issued the certificate (that can take up to a day after the DNS change; until then this step just waits).
if [ -f CNAME ]; then
  domain=$(head -n 1 CNAME | tr -d '[:space:]')
  current=$(gh api "repos/$OWNER/$REPO/pages" --jq '.cname // ""' 2>/dev/null || true)
  if [ "$current" != "$domain" ]; then
    gh api -X PUT "repos/$OWNER/$REPO/pages" -f "cname=$domain" >/dev/null && echo "Custom domain set: $domain"
  fi
  if gh api -X PUT "repos/$OWNER/$REPO/pages" -F https_enforced=true >/dev/null 2>&1; then
    echo "HTTPS is on for $domain."
  else
    echo "HTTPS for $domain isn't ready yet (GitHub is still issuing the certificate). Publish again later to turn it on."
  fi
  echo "Published. The live site updates in a minute or two: https://$domain/"
else
  echo "Published. The live site updates in a minute or two: https://$OWNER.github.io/$REPO/"
fi
