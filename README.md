# AWS CDK Secure Constructs

[![CI](https://github.com/alphacrack/aws-cdk-secure-constructs/actions/workflows/ci.yml/badge.svg)](https://github.com/alphacrack/aws-cdk-secure-constructs/actions/workflows/ci.yml)
[![Codecov](https://codecov.io/gh/alphacrack/aws-cdk-secure-constructs/branch/main/graph/badge.svg)](https://codecov.io/gh/alphacrack/aws-cdk-secure-constructs)
[![npm version](https://img.shields.io/npm/v/aws-cdk-secure-constructs.svg)](https://www.npmjs.com/package/aws-cdk-secure-constructs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Secure-by-default AWS CDK constructs with [CDK property injection](https://docs.aws.amazon.com/cdk/v2/guide/blueprints.html) support.

**Status:** Early stage. Only **S3 (`SecureBucket`)** is implemented today. Requires `aws-cdk-lib` >= 2.196.0.

## What it does

- **Construct:** `SecureBucket` — CIS-critical settings (encryption, block public access, SSL, object ownership) are always enforced.
- **Tiers:** `HIGH` / `MEDIUM` / `LOW` for operational settings (versioning, logging, removal policy).
- **Injectors:** Property injectors including `TieredSecureBucketDefaults` (tighten-only).
- **Compliance:** `S3BucketCompliance.report()` — enforced controls are verified by synthesis tests.

Property injectors set defaults; they do not block someone from using L1 `CfnBucket` directly.

## Install

From npm (after publish):

```bash
npm install aws-cdk-secure-constructs
```

From this repo (local):

```bash
npm install
npm run build
npm run test:local-build   # pack + install + cdk synth
```

## Usage

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { SecureBucket, SecurityLevel } from 'aws-cdk-secure-constructs';

const app = new App();
const stack = new Stack(app, 'MyStack');

new SecureBucket(stack, 'Data', {
  securityLevel: SecurityLevel.HIGH,
});
```

Tiered injector (org-wide floor):

```typescript
import { PropertyInjectors } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { TieredSecureBucketDefaults, SecurityLevel } from 'aws-cdk-secure-constructs';

PropertyInjectors.of(app).add(
  new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.MEDIUM })
);
new Bucket(stack, 'RawBucket', { enforceSSL: false }); // CIS-critical fields still enforced
```

More examples: [examples/](examples/), [examples/local-consumer/](examples/local-consumer/) (tests the published tarball).

## Development

```bash
npm install
npm run build      # jsii -> lib/
npm test
npm run lint
npm run test:local-build
npm run release -- patch   # from clean main only; tags and triggers CI publish
```

## Docs

- [API](docs/API.md)
- [Security model](docs/SECURITY.md)
- [Design guidelines](docs/DESIGN.md)
- [Contributing](CONTRIBUTING.md)
- [Roadmap](ROADMAP.md)

## License

MIT — see [LICENSE](LICENSE).
