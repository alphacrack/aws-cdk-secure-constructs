#!/usr/bin/env bash
# Bump version on main, tag vX.Y.Z, and push — release.yml publishes to npm on tag push.
#
# Usage:
#   npm run release -- patch    # 1.0.0 -> 1.0.1
#   npm run release -- minor    # 1.0.0 -> 1.1.0
#   npm run release -- major    # 1.0.0 -> 2.0.0
#   npm run release -- 1.2.3    # explicit version
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BUMP="${1:-patch}"

export JSII_SILENCE_WARNING_UNTESTED_NODE_VERSION=1

BRANCH="$(git branch --show-current)"
if [ "$BRANCH" != "main" ]; then
  echo "ERROR: Release must be run from the main branch (current: $BRANCH)"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working tree is not clean. Commit or stash changes before releasing."
  git status --short
  exit 1
fi

echo "==> Pulling latest main..."
git pull --ff-only origin main

echo "==> Installing dependencies..."
npm ci

echo "==> Running quality gates..."
npm run lint
npm test
npm run build
npm run test:local-build

echo "==> Bumping version ($BUMP) and creating tag..."
npm version "$BUMP" -m "chore(release): v%s"

echo "==> Pushing commit and tag to origin..."
git push --follow-tags origin main

echo "==> Release initiated. CI will publish to npm when the tag workflow completes."
echo "    Monitor: https://github.com/alphacrack/aws-cdk-secure-constructs/actions"
