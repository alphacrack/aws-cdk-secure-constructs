import { App, Stack, PropertyInjectors, RemovalPolicy, InjectionContext } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import {
  SecureBucketDefaults,
  StrictSecureBucketDefaults,
  TieredSecureBucketDefaults,
  SecurityLevel,
} from '../../../src';

describe('S3 bucket blueprints', () => {
  let app: App;
  let stack: Stack;
  const ctx = {} as unknown as InjectionContext;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
  });

  describe('SecureBucketDefaults', () => {
    it('should apply secure defaults to buckets', () => {
      PropertyInjectors.of(app).add(new SecureBucketDefaults());
      new Bucket(stack, 'TestBucket');

      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
          ],
        },
        VersioningConfiguration: { Status: 'Enabled' },
        OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerEnforced' }] },
      });
    });

    it('should allow overriding defaults', () => {
      PropertyInjectors.of(app).add(new SecureBucketDefaults());
      new Bucket(stack, 'TestBucket', { versioned: false });

      const template = Template.fromStack(stack);
      const buckets = Object.values(template.findResources('AWS::S3::Bucket'));
      for (const bucket of buckets) {
        expect(bucket['Properties'].VersioningConfiguration).toBeUndefined();
      }
    });
  });

  describe('StrictSecureBucketDefaults', () => {
    it('should enforce security settings that cannot be overridden', () => {
      PropertyInjectors.of(app).add(new StrictSecureBucketDefaults());
      new Bucket(stack, 'TestBucket', { enforceSSL: false });

      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
          ],
        },
        OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerEnforced' }] },
      });
    });
  });

  describe('TieredSecureBucketDefaults', () => {
    it('defaults to HIGH (versioning enabled) when no tier given', () => {
      PropertyInjectors.of(app).add(new TieredSecureBucketDefaults());
      new Bucket(stack, 'TestBucket');

      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        VersioningConfiguration: { Status: 'Enabled' },
      });
    });

    it('LOW relaxes versioning but keeps CIS-critical settings enforced', () => {
      PropertyInjectors.of(app).add(
        new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.LOW })
      );
      new Bucket(stack, 'TestBucket', { enforceSSL: false });

      const template = Template.fromStack(stack);
      const bucket = Object.values(template.findResources('AWS::S3::Bucket'))[0];
      // tier-variable: versioning not enabled at LOW
      expect(bucket['Properties'].VersioningConfiguration).toBeUndefined();
      // CIS-critical: encryption + ownership still enforced
      expect(bucket['Properties'].BucketEncryption).toBeDefined();
      expect(bucket['Properties'].OwnershipControls).toBeDefined();
    });

    it('is tighten-only: LOW injector cannot loosen an incoming stronger value', () => {
      const injector = new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.LOW });
      const result = injector.inject({ versioned: true, removalPolicy: RemovalPolicy.RETAIN }, ctx);

      // incoming stronger values are preserved
      expect(result.versioned).toBe(true);
      expect(result.removalPolicy).toBe(RemovalPolicy.RETAIN);
    });

    it('HIGH injector tightens a weak incoming value', () => {
      const injector = new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.HIGH });
      const result = injector.inject(
        { versioned: false, removalPolicy: RemovalPolicy.DESTROY },
        ctx
      );

      expect(result.versioned).toBe(true);
      expect(result.removalPolicy).toBe(RemovalPolicy.RETAIN);
    });

    it('always re-asserts CIS-critical fields regardless of input', () => {
      const injector = new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.LOW });
      const result = injector.inject({ enforceSSL: false }, ctx);

      expect(result.enforceSSL).toBe(true);
    });

    it('has the correct construct unique ID', () => {
      const injector = new TieredSecureBucketDefaults();
      expect(injector.constructUniqueId).toBe(Bucket.PROPERTY_INJECTION_ID);
    });
  });
});
