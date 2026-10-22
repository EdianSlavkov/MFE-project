#!/usr/bin/env bash
# Copies one app's build into its folder on the gh-pages branch and pushes it.
# Usage: publish-gh-pages.sh <build dir> <target folder, "." for the site root>
#
# Each app has its own workflow and they can run at the same time. When two of them push to gh-pages
# together, the second push is rejected. We then fetch the newer branch, copy our files again and retry.
# This is safe because every app writes only into its own folder, so the copies never overwrite each other.
set -euo pipefail

SOURCE="$(cd "$1" && pwd)"
TARGET="$2"
REPO_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

cd "$(mktemp -d)"
# The very first deploy of a fresh repo has no gh-pages branch yet, so we create an empty one.
if git clone --quiet --depth 1 --branch gh-pages "$REPO_URL" site; then
  cd site
else
  mkdir site && cd site && git init --quiet -b gh-pages && git remote add origin "$REPO_URL"
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

for attempt in 1 2 3 4 5; do
  mkdir -p "$TARGET"
  cp -R "$SOURCE"/. "$TARGET"/
  # Tells GitHub Pages to serve the files as they are, without running Jekyll on them.
  touch .nojekyll
  git add -A
  git commit --quiet -m "deploy ${TARGET} ${GITHUB_SHA}" || { echo "Nothing changed"; exit 0; }
  if git push --quiet origin gh-pages; then
    echo "Published ${TARGET} on attempt ${attempt}"
    exit 0
  fi
  echo "Push rejected, another app deployed at the same time. Retrying."
  git fetch --quiet --depth 1 origin gh-pages
  git reset --quiet --hard origin/gh-pages
  sleep $((attempt * 3))
done

echo "Could not publish after 5 attempts"
exit 1
