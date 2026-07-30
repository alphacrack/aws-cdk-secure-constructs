# Releasing

This project separates **tagging a release** (creates a GitHub Release) from
**publishing to npm** (a deliberate, manual step). Tagging never publishes to
npm on its own.

## 1. Prepare the release (pull request)

`main` is branch-protected, so the version bump and changelog land through a PR.

1. Create a branch and update:
   - `package.json` `version` to the new `X.Y.Z`.
   - `CHANGELOG.md`: move items from `[Unreleased]` into a new `[X.Y.Z] - <date>`
     section and refresh the compare/tag links at the bottom.
2. Open the PR, let CI pass, and merge it.

## 2. Tag the release

Tag the merge commit on `main` and push the tag:

```bash
git checkout main && git pull --ff-only
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

Pushing the tag runs `.github/workflows/release.yml`, which verifies the build
(lint, test, jsii build) and creates a **GitHub Release** with generated notes.
It does **not** publish to npm.

## 3. Publish to npm (deliberate, manual)

When you are ready to publish the tagged version to npm:

1. Ensure the `NPM_TOKEN` repository secret is set (an npm automation token with
   publish rights). Publishing uses `--provenance`, which requires the workflow's
   OIDC (`id-token: write`) — already configured.
2. Optionally add required reviewers to the `npm-publish` environment
   (repo Settings → Environments) so a publish waits for approval.
3. Go to **Actions → Release → Run workflow**, choose the tag/branch, set
   `publish_npm: true`, and run it. The `npm-publish` job runs `npm publish
--provenance --access public`.

## Why publishing is manual

An npm publish is effectively irreversible (a version cannot be re-published,
and unpublishing is disruptive). Gating it behind an explicit manual trigger —
rather than firing automatically on every tag — keeps releases intentional and
lets an environment approval sit in front of it.
