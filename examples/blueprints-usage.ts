#!/usr/bin/env node
import { App, Stack, PropertyInjectors } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import {
  SecureBucketDefaults,
  StrictSecureBucketDefaults,
  TieredSecureBucketDefaults,
  SecurityLevel,
} from '../src';

/**
 * CDK Blueprints usage example for AWS CDK Secure Constructs
 *
 * This example demonstrates how to use property injectors to apply
 * secure defaults to all S3 buckets in your CDK application.
 */
const app = new App();

// Example 1: Using SecureBucketDefaults (allows overrides)
class FlexibleSecurityStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    // Add secure defaults that can be overridden
    PropertyInjectors.of(this).add(new SecureBucketDefaults());

    // This bucket will get secure defaults but allows custom overrides
    const flexibleBucket = new Bucket(this, 'FlexibleBucket', {
      bucketName: 'my-flexible-bucket',
      versioned: false, // Override default versioning
    });

    // This bucket will use all secure defaults
    const defaultBucket = new Bucket(this, 'DefaultBucket', {
      bucketName: 'my-default-bucket',
    });

    // Output bucket names
    this.exportValue(flexibleBucket.bucketName, {
      name: 'FlexibleBucketName',
    });
    this.exportValue(defaultBucket.bucketName, {
      name: 'DefaultBucketName',
    });
  }
}

// Example 2: Using StrictSecureBucketDefaults (enforces security)
class StrictSecurityStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    // Add strict security defaults that cannot be overridden
    PropertyInjectors.of(this).add(new StrictSecureBucketDefaults());

    // This bucket will have strict security settings enforced
    // Any conflicting settings will be overridden
    const strictBucket = new Bucket(this, 'StrictBucket', {
      bucketName: 'my-strict-bucket',
      enforceSSL: false, // This will be overridden to true
      versioned: false, // This will be overridden to true
    });

    // Output bucket name
    this.exportValue(strictBucket.bucketName, {
      name: 'StrictBucketName',
    });
  }
}

// Example 3: Application-level property injection
class AppLevelSecurityStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    // This bucket will get secure defaults from app-level injection
    const appLevelBucket = new Bucket(this, 'AppLevelBucket', {
      bucketName: 'my-app-level-bucket',
    });

    // Output bucket name
    this.exportValue(appLevelBucket.bucketName, {
      name: 'AppLevelBucketName',
    });
  }
}

// Example 4: Tiered, tighten-only injection
class TieredSecurityStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    // Apply a MEDIUM organisational security floor. The injector can only
    // tighten tier-variable fields and always re-asserts CIS-critical settings,
    // so every bucket below stays CIS-compliant.
    PropertyInjectors.of(this).add(
      new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.MEDIUM })
    );

    // Even though this bucket asks for no versioning and no SSL, the injector
    // enforces CIS-critical SSL/encryption and applies the MEDIUM tier defaults.
    const tieredBucket = new Bucket(this, 'TieredBucket', {
      bucketName: 'my-tiered-bucket',
      enforceSSL: false,
    });

    this.exportValue(tieredBucket.bucketName, {
      name: 'TieredBucketName',
    });
  }
}

// Add app-level secure defaults
PropertyInjectors.of(app).add(new SecureBucketDefaults());

// Create the stacks
new FlexibleSecurityStack(app, 'FlexibleSecurityStack');
new StrictSecurityStack(app, 'StrictSecurityStack');
new AppLevelSecurityStack(app, 'AppLevelSecurityStack');
new TieredSecurityStack(app, 'TieredSecurityStack');

app.synth();
