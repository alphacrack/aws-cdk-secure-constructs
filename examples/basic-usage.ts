#!/usr/bin/env node
import 'source-map-support/register';
import { App, Stack } from 'aws-cdk-lib';

import { SecureBucket } from '../src/constructs/secure-bucket';

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

    // Create a secure S3 bucket with default security settings
    const secureBucket = new SecureBucket(this, 'MySecureBucket', {
      bucketName: 'my-secure-bucket-example',
      versioned: true,
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
