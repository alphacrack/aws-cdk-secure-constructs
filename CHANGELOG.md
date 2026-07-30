# Changelog

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Versioning follows [SemVer](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-07-31

Initial public release. The API is early-stage (jsii `stability: experimental`) and may change before 1.0.0. Only the S3 `SecureBucket` resource is implemented today.

### Added

- `SecureBucket` S3 construct with a three-level control model: CIS-critical fields are always enforced, while tier-variable fields (versioning, removal policy, access logging) follow the chosen `SecurityLevel` (HIGH / MEDIUM / LOW).
- Pass-through getters on `SecureBucket` — `bucketArn`, `bucketName`, `bucketDomainName`, `bucketRegionalDomainName` — so common attributes are reachable without `.bucket`.
- Property injectors: `SecureBucketDefaults` (permissive), `StrictSecureBucketDefaults` (non-overridable), and `TieredSecureBucketDefaults` (tighten-only organisational floor).
- `S3BucketCompliance.report()` and `ComplianceRegistry.all()` exposing test-verified CIS control mappings.
- Resource-centric source layout under `src/resources/`.
- Local tarball verification (`npm run test:local-build`, `examples/local-consumer/`).
- Python (jsii) publish target alongside TypeScript.

### Notes

- Published to npm as a deliberate, manual step — tagging a version creates a GitHub Release but does not publish. See [docs/RELEASING.md](docs/RELEASING.md).
- Supported Node.js: `>= 20`.

[Unreleased]: https://github.com/alphacrack/aws-cdk-secure-constructs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/alphacrack/aws-cdk-secure-constructs/releases/tag/v0.1.0
