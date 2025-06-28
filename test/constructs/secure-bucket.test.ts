import { Stack, Duration } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { SecureBucket } from '../../src/constructs/secure-bucket';

describe('SecureBucket', () => {
  let stack: Stack;

  beforeEach(() => {
    stack = new Stack();
  });

  describe('default configuration', () => {
    it('should create a bucket with security defaults', () => {
      // WHEN
      new SecureBucket(stack, 'TestBucket');

      // THEN
      const template = Template.fromStack(stack);

      // Check that the main bucket is created with security settings
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
      });

      // Check that access log bucket is created
      template.hasResourceProperties('AWS::S3::Bucket', {
        AccessControl: 'LogDeliveryWrite',
      });
    });

    it('should apply security tags', () => {
      // WHEN
      new SecureBucket(stack, 'TestBucket');

      // THEN
      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::S3::Bucket');
      const buckets = Object.values(resources);
      const tags = buckets.flatMap(b => b['Properties']?.Tags || []);
      const expectedTags = [
        { Key: 'SecurityLevel', Value: 'High' },
        { Key: 'DataClassification', Value: 'Confidential' },
        { Key: 'Compliance', Value: 'SOC2' },
        { Key: 'ManagedBy', Value: 'CDK' },
      ];
      for (const tag of expectedTags) {
        expect(tags).toContainEqual(tag);
      }
    });
  });

  describe('custom configuration', () => {
    it('should allow overriding bucket name', () => {
      // WHEN
      new SecureBucket(stack, 'TestBucket', {
        bucketName: 'my-custom-bucket-name',
      });

      // THEN
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: 'my-custom-bucket-name',
      });
    });

    it('should allow disabling versioning', () => {
      // WHEN
      new SecureBucket(stack, 'TestBucket', {
        versioned: false,
      });

      // THEN
      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::S3::Bucket');
      // Find the main bucket (not the access log bucket)
      const mainBucket = Object.values(resources).find(
        bucket =>
          !bucket['Properties'].AccessControl &&
          !bucket['Properties'].BucketName?.includes('accesslogs')
      );
      expect(mainBucket).toBeDefined();
      expect(mainBucket!['Properties'].VersioningConfiguration).toBeUndefined();
    });

    it('should allow disabling access logging', () => {
      // WHEN
      new SecureBucket(stack, 'TestBucket', {
        enableAccessLogging: false,
      });

      // THEN
      const template = Template.fromStack(stack);

      // Should only have one bucket (no access log bucket)
      template.templateMatches({
        Resources: {
          TestBucket9EEBCF70: {
            Type: 'AWS::S3::Bucket',
            Properties: {
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
            },
          },
        },
      });
    });

    it('should allow custom lifecycle rules', () => {
      // WHEN
      new SecureBucket(stack, 'TestBucket', {
        lifecycleRules: [
          {
            id: 'custom-rule',
            enabled: true,
            expiration: Duration.days(30),
          },
        ],
      });

      // THEN
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        LifecycleConfiguration: {
          Rules: [
            {
              Id: 'custom-rule',
              Status: 'Enabled',
              ExpirationInDays: 30,
            },
          ],
        },
      });
    });
  });

  describe('grant methods', () => {
    it('should expose grant methods', () => {
      // WHEN
      const secureBucket = new SecureBucket(stack, 'TestBucket');

      // THEN
      expect(secureBucket.grantRead).toBeDefined();
      expect(secureBucket.grantWrite).toBeDefined();
      expect(secureBucket.grantReadWrite).toBeDefined();
      expect(secureBucket.grantDelete).toBeDefined();
    });
  });

  describe('bucket property', () => {
    it('should expose the underlying bucket', () => {
      // WHEN
      const secureBucket = new SecureBucket(stack, 'TestBucket');

      // THEN
      expect(secureBucket.bucket).toBeDefined();
      expect(secureBucket.bucket.node.id).toBe('Bucket');
    });
  });
});
