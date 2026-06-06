<!--
PR title must follow Conventional Commits, e.g. `feat(s3-bucket): add SecureQueue`.
Allowed types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert.
-->

## Related issue

Fixes # (issue)

## Reason for change

<!-- Why is this change needed? What problem does it solve? -->

## Description of changes

<!-- What did you change and how? Call out any new constructs/injectors and any
changes to CIS-critical (locked) vs tier-variable fields. -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation
- [ ] Security improvement

## Checklist

- [ ] PR title follows Conventional Commits
- [ ] I added/updated unit tests for my changes
- [ ] For new/changed enforced controls, I added a verified-compliance test (synthesis asserts the control holds)
- [ ] I updated docs (`README.md`, `docs/API.md`, `docs/SECURITY.md`) as needed
- [ ] `npm run build` (jsii) passes with no errors/warnings
- [ ] `npm test` and `npm run lint` pass locally
- [ ] No CIS-critical setting was weakened or made overridable

## Security considerations

<!-- Describe any security implications. Confirm encryption, SSL, block-public-access,
and object-ownership remain enforced for affected resources. -->
