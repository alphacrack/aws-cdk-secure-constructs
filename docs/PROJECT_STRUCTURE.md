# Project structure

```
aws-cdk-secure-constructs/
├── src/
│   ├── core/                    # Shared types (SecurityLevel, compliance model)
│   ├── resources/s3-bucket/   # S3 module (only resource today)
│   └── index.ts                 # Public exports + ComplianceRegistry
├── test/                        # Mirrors src/; compliance tests verify CIS report
├── examples/
│   ├── *.ts                     # Dev examples (import from ../src)
│   └── local-consumer/          # CDK app; imports packed npm tarball
├── scripts/
│   ├── test-local-build.sh
│   └── release.sh
├── docs/
├── .github/                     # CI, issue forms, dependabot
└── .cursor/skills/              # Agent skills for adding resources / releasing
```

## Resource module pattern

Each future resource lives under `src/resources/<name>/`:

| File | Purpose |
|------|---------|
| `fields.ts` | CIS-critical vs tier-variable field definitions (internal) |
| `secure-*.ts` | L3 construct |
| `blueprints.ts` | Property injectors |
| `compliance.ts` | CIS report (`*Compliance.report()`) |
| `index.ts` | Module exports |

Wire new modules in `src/index.ts` and `ComplianceRegistry.all()`.

## Build

- **Library:** `npm run build` (jsii → `lib/` + `.jsii`)
- **Tests:** Jest via `npm test` (`tsconfig.spec.json`)
- **Publish check:** `npm run test:local-build`
- **Multi-language:** `npm run package` (jsii-pacmak → `dist/`) — optional, not required for npm JS publish

jsii generates the root `tsconfig.json`; do not hand-edit it.

## CI

See [.github/workflows/ci.yml](../.github/workflows/ci.yml): lint, build, test (Node 18/20/22), compliance job, security audit, CodeQL.

Release: tag `v*` → [release.yml](../.github/workflows/release.yml) → npm publish.
