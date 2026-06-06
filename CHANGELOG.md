# Changelog

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Versioning follows [SemVer](https://semver.org/).

## [Unreleased]

### Added

- `SecureBucket` S3 construct with three-level control model (CIS-critical + tiers)
- Property injectors: `SecureBucketDefaults`, `StrictSecureBucketDefaults`, `TieredSecureBucketDefaults`
- `S3BucketCompliance.report()` with test-verified CIS controls
- Resource-centric layout under `src/resources/`
- Local tarball verification (`npm run test:local-build`, `examples/local-consumer/`)
- Tag-based release script (`npm run release`)

### Changed

- Documentation simplified; removed unverifiable compliance claims

## [1.0.0]

Not yet published to npm.

When the first release is tagged, move items from `[Unreleased]` here with the release date.
