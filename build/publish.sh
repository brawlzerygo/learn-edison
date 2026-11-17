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
# Usage: sh build/publish.sh ["what changed"]
set -e
cd "$(dirname "$0")/.."
export GH_CONFIG_DIR="$HOME/.config/gh-brawlzerygo"
OWNER=brawlzerygo
REPO=learn-edison

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
      --description "A free, open-source site for learning Edison format Yu-Gi-Oh! (April 2010)" \
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

git add -A
git diff --cached --quiet || git commit -q -m "${1:-Update the site}"
push -u origin main

# Turn on GitHub Pages (the main branch, root folder) the first time.
if ! gh api "repos/$OWNER/$REPO/pages" >/dev/null 2>&1; then
  gh api -X POST "repos/$OWNER/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null
  echo "GitHub Pages is on."
fi
# Custom domain (the CNAME file, learnedison.com since 2026-11-17): make sure Pages uses it, and turn on HTTPS once
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
