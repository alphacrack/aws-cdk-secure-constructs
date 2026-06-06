---
name: publish-local-build
description: >-
  Verify and release aws-cdk-secure-constructs to npm. Use when testing the
  publishable tarball locally (npm pack + cdk synth), running test:local-build,
  cutting a release (version bump + tag), fixing packaging (package.json files
  field), or updating examples/local-consumer. Covers the tag-based release
  flow where release.yml publishes to npm after push.
---

# Publish and local-build testing

Use this skill before any release or when changing packaging/exports. The library
is **jsii-built**; the published artifact is `lib/` + `.jsii`, not `src/`.

## Quick commands

```bash
npm run test:local-build   # build, pack, install tarball, cdk synth
npm run release -- patch     # from clean main: verify, bump, tag, push (CI publishes)
```

## Packaging rules (do not break)

In [package.json](../../package.json):

```json
"files": ["lib", ".jsii"],
"prepublishOnly": "npm run build"
```

Without `files`, npm falls back to `.gitignore` and **excludes `lib/`** — the
published package would have no compiled code. Never remove this without adding
`.npmignore` that explicitly includes `lib` and `.jsii`.

Root [examples/*.ts](../../examples/) import from `../src` (dev-only). The
**publishable** artifact is validated by [examples/local-consumer/](../../examples/local-consumer/),
which imports `aws-cdk-secure-constructs` by package name from a packed tarball.

## Local-build test workflow

Run after changes to `src/index.ts` exports, `package.json` `files`/`main`/`types`,
or before tagging a release.

```
- [ ] 1. npm run build          # jsii -> lib/ + .jsii (0 errors, 0 warnings)
- [ ] 2. npm test && npm run lint
- [ ] 3. npm run test:local-build
```

What [scripts/test-local-build.sh](../../scripts/test-local-build.sh) does:

1. `npm run build` (jsii)
2. `npm pack --ignore-scripts` (avoids husky prepare noise on stdout)
3. Asserts `package/lib/index.js` exists inside the tarball
4. `npm install` in `examples/local-consumer/`
5. `npm install ../../aws-cdk-secure-constructs-*.tgz`
6. `npx cdk synth` — fails if the built package cannot be imported

If pack output is polluted, capture tarball with:
`npm pack --ignore-scripts 2>/dev/null | grep -E '\.tgz$' | tail -n 1`

## Release workflow (tag -> CI -> npm)

Develop on `develop`, merge to `main`, then from a **clean** `main`:

```bash
npm run release -- patch   # or minor | major | 1.2.3
```

[scripts/release.sh](../../scripts/release.sh) enforces:

- Current branch is `main`
- Working tree is clean
- `git pull --ff-only origin main`
- `npm ci` then lint, test, build, test:local-build
- `npm version <bump>` (commit + `vX.Y.Z` tag)
- `git push --follow-tags origin main`

Tag push triggers [.github/workflows/release.yml](../../.github/workflows/release.yml):
lint, test, build, `npm publish --provenance --access public`.

**Prerequisite:** `NPM_TOKEN` secret in GitHub repo settings with publish access.

## Updating the local consumer app

When adding new public exports, update [examples/local-consumer/app.ts](../../examples/local-consumer/app.ts)
so `cdk synth` exercises them. Keep imports from the **package name**, never `../src`.

Minimal pattern:

```typescript
import { SecureBucket, SecurityLevel, TieredSecureBucketDefaults, ComplianceRegistry } from 'aws-cdk-secure-constructs';
```

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Tarball missing `lib/index.js` | Restore `package.json` `"files": ["lib", ".jsii"]` |
| `npm pack` captures husky output | Use `--ignore-scripts` when parsing tarball name |
| `cdk synth` fails in local-consumer | Check peer deps (`aws-cdk-lib` ^2.196.0, `constructs` ^10.3.0) match library |
| jsii build fails on tsconfig | jsii owns root `tsconfig.json`; Jest uses `tsconfig.spec.json` |
| Release script rejects branch | Must run from `main` with clean working tree |

## Verify (agent must run)

```bash
export JSII_SILENCE_WARNING_UNTESTED_NODE_VERSION=1
npm run build && npm test && npm run lint
npm run test:local-build
bash -n scripts/test-local-build.sh scripts/release.sh
```

Do **not** run `npm run release` unless the user explicitly asks — it pushes tags
and triggers npm publish.
