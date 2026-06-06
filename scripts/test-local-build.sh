#!/usr/bin/env bash
# Validates the publishable npm tarball by installing it into examples/local-consumer
# and running cdk synth.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export JSII_SILENCE_WARNING_UNTESTED_NODE_VERSION=1

echo "==> Building library (jsii)..."
npm run build

echo "==> Packing tarball..."
TARBALL="$(npm pack --ignore-scripts 2>/dev/null | grep -E '\.tgz$' | tail -n 1)"
if [ -z "$TARBALL" ] || [ ! -f "$TARBALL" ]; then
  echo "ERROR: npm pack did not produce a .tgz file"
  exit 1
fi
echo "    Packed: $TARBALL"

echo "==> Verifying tarball contains compiled output..."
if ! tar -tf "$TARBALL" | grep -q 'package/lib/index.js'; then
  echo "ERROR: tarball missing package/lib/index.js — check package.json \"files\" field"
  exit 1
fi

CONSUMER="$ROOT/examples/local-consumer"
cd "$CONSUMER"

echo "==> Installing consumer app dependencies..."
npm install --no-fund --no-audit

echo "==> Installing packed library..."
npm install --no-fund --no-audit "$ROOT/$TARBALL"

echo "==> Synthesizing CDK stack..."
npx cdk synth >/dev/null

echo "==> Local build OK ($TARBALL)"
