#!/usr/bin/env node
import { App, Stack, PropertyInjectors } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import {
  ComplianceRegistry,
  SecureBucket,
  SecurityLevel,
  TieredSecureBucketDefaults,
} from 'aws-cdk-secure-constructs';

/**
 * Minimal CDK app that consumes the library as an installed npm package
 * (from a packed tarball). Used by scripts/test-local-build.sh to verify
 * the publishable artifact before release.
 */
const app = new App();
const stack = new Stack(app, 'LocalConsumerStack');

new SecureBucket(stack, 'SecureBucket', {
  securityLevel: SecurityLevel.HIGH,
});

PropertyInjectors.of(stack).add(
  new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.MEDIUM })
);

new Bucket(stack, 'RawBucket');

// eslint-disable-next-line no-console -- intentional smoke-test output
console.log('CIS reports:', ComplianceRegistry.all().map(r => r.resourceType));

app.synth();
