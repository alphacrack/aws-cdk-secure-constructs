import { App, Stack, PropertyInjectors } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import {
  SecureBucketDefaults,
  StrictSecureBucketDefaults,
} from '../../src/blueprints/secure-bucket-defaults';

describe('SecureBucketDefaults', () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
  });

  describe('SecureBucketDefaults', () => {
    it('should apply secure defaults to buckets', () => {
      // WHEN
      PropertyInjectors.of(app).add(new SecureBucketDefaults());
      new Bucket(stack, 'TestBucket');

      // THEN
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        VersioningConfiguration: {
          Status: 'Enabled',
        },
        OwnershipControls: {
          Rules: [
            {
              ObjectOwnership: 'BucketOwnerEnforced',
            },
          ],
        },
      });
    });

    it('should allow overriding defaults', () => {
      // WHEN
      PropertyInjectors.of(app).add(new SecureBucketDefaults());
      new Bucket(stack, 'TestBucket', {
        versioned: false,
        enforceSSL: false,
      });

      // THEN
      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::S3::Bucket');
      const buckets = Object.values(resources);
      // Should not have VersioningConfiguration property
      for (const bucket of buckets) {
        expect(bucket['Properties'].VersioningConfiguration).toBeUndefined();
      }
    });

    it('should have correct construct unique ID', () => {
      // WHEN
      const injector = new SecureBucketDefaults();

      // THEN
      expect(injector.constructUniqueId).toBe(Bucket.PROPERTY_INJECTION_ID);
    });
  });

  describe('StrictSecureBucketDefaults', () => {
    it('should enforce security settings that cannot be overridden', () => {
      // WHEN
      PropertyInjectors.of(app).add(new StrictSecureBucketDefaults());
      new Bucket(stack, 'TestBucket', {
        versioned: false,
        enforceSSL: false,
      });

      // THEN
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        OwnershipControls: {
          Rules: [
            {
              ObjectOwnership: 'BucketOwnerEnforced',
            },
          ],
        },
      });
    });

    it('should have correct construct unique ID', () => {
      // WHEN
      const injector = new StrictSecureBucketDefaults();

      // THEN
      expect(injector.constructUniqueId).toBe(Bucket.PROPERTY_INJECTION_ID);
    });
  });

  describe('inject method', () => {
    it('should merge properties correctly for SecureBucketDefaults', () => {
      // WHEN
      const injector = new SecureBucketDefaults();
      const originalProps = {
        bucketName: 'test-bucket',
        versioned: false,
      };

      // THEN
      const result = injector.inject(originalProps, {} as any);
      expect(result.bucketName).toBe('test-bucket');
      expect(result.versioned).toBe(false); // Should allow override
    });

    it('should enforce properties for StrictSecureBucketDefaults', () => {
      // WHEN
      const injector = new StrictSecureBucketDefaults();
      const originalProps = {
        bucketName: 'test-bucket',
        enforceSSL: false,
      };

      // THEN
      const result = injector.inject(originalProps, {} as any);
      expect(result.bucketName).toBe('test-bucket');
      expect(result.enforceSSL).toBe(true); // Should enforce security setting
    });
  });
});
