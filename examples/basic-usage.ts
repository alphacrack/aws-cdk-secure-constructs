#!/usr/bin/env node
import 'source-map-support/register';
import { App, Stack } from 'aws-cdk-lib';

import { SecureBucket, SecurityLevel } from '../src';

/**
 * Basic usage example for AWS CDK Secure Constructs
 *
 * This example demonstrates how to create a secure S3 bucket
 * with all security best practices enabled by default.
 */
const app = new App();

class SecureBucketStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    // Create a secure S3 bucket with default security settings (HIGH tier).
    // CIS-critical settings (encryption, SSL, block-public-access, object
    // ownership) are always enforced regardless of the chosen tier.
    const secureBucket = new SecureBucket(this, 'MySecureBucket', {
      bucketName: 'my-secure-bucket-example',
      securityLevel: SecurityLevel.HIGH,
      enableAccessLogging: true,
    });

    // Output the bucket name for reference
    this.exportValue(secureBucket.bucket.bucketName, {
      name: 'SecureBucketName',
    });
  }
}

// Create the stack
new SecureBucketStack(app, 'SecureBucketExampleStack');

app.synth();
