import { Stack, Duration } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

import { SecureBucket, SecurityLevel } from '../../../src';

describe('SecureBucket', () => {
  let stack: Stack;

  beforeEach(() => {
    stack = new Stack();
  });

  describe('default configuration (HIGH)', () => {
    it('should create a bucket with CIS-critical settings enforced', () => {
      new SecureBucket(stack, 'TestBucket');

      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
          ],
        },
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        VersioningConfiguration: { Status: 'Enabled' },
        OwnershipControls: {
          Rules: [{ ObjectOwnership: 'BucketOwnerEnforced' }],
        },
      });
    });

    it('should enforce SSL via a bucket policy', () => {
      new SecureBucket(stack, 'TestBucket');

      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Deny',
              Condition: { Bool: { 'aws:SecureTransport': 'false' } },
            }),
          ]),
        },
      });
    });

    it('should apply security tags', () => {
      new SecureBucket(stack, 'TestBucket');

      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::S3::Bucket');
      const buckets = Object.values(resources);
      const tags = buckets.flatMap(b => b['Properties']?.Tags || []);
      const expectedTags = [
        { Key: 'SecurityLevel', Value: 'High' },
        { Key: 'DataClassification', Value: 'Confidential' },
        { Key: 'Compliance', Value: 'CIS-AWS-Foundations' },
        { Key: 'ManagedBy', Value: 'CDK' },
      ];
      for (const tag of expectedTags) {
        expect(tags).toContainEqual(tag);
      }
    });
  });

  describe('security tiers', () => {
    it('LOW disables versioning but keeps CIS-critical settings enforced', () => {
      new SecureBucket(stack, 'TestBucket', { securityLevel: SecurityLevel.LOW });

      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::S3::Bucket');
      const mainBucket = Object.values(resources).find(
        b => b['Properties']?.OwnershipControls && !b['Properties']?.AccessControl
      );
      expect(mainBucket).toBeDefined();
      // tier-variable: versioning off at LOW
      expect(mainBucket!['Properties'].VersioningConfiguration).toBeUndefined();
      // CIS-critical: encryption still enforced at LOW
      expect(mainBucket!['Properties'].BucketEncryption).toBeDefined();
    });

    it('LOW does not provision an access-log bucket', () => {
      new SecureBucket(stack, 'TestBucket', { securityLevel: SecurityLevel.LOW });

      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::S3::Bucket', 1);
    });
  });

  describe('custom configuration', () => {
    it('should allow overriding bucket name', () => {
      new SecureBucket(stack, 'TestBucket', { bucketName: 'my-custom-bucket-name' });

      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', { BucketName: 'my-custom-bucket-name' });
    });

    it('should allow disabling versioning explicitly', () => {
      new SecureBucket(stack, 'TestBucket', { versioned: false });

      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::S3::Bucket');
      const mainBucket = Object.values(resources).find(
        b => b['Properties']?.OwnershipControls && !b['Properties']?.AccessControl
      );
      expect(mainBucket).toBeDefined();
      expect(mainBucket!['Properties'].VersioningConfiguration).toBeUndefined();
    });

    it('should not be able to disable encryption (CIS-critical)', () => {
      // enableEncryption is deprecated/ignored; encryption is always enforced.
      new SecureBucket(stack, 'TestBucket', { enableEncryption: false });

      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
          ],
        },
      });
    });

    it('should allow disabling access logging', () => {
      new SecureBucket(stack, 'TestBucket', { enableAccessLogging: false });

      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::S3::Bucket', 1);
    });

    it('should allow custom lifecycle rules', () => {
      new SecureBucket(stack, 'TestBucket', {
        lifecycleRules: [{ id: 'custom-rule', enabled: true, expiration: Duration.days(30) }],
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        LifecycleConfiguration: {
          Rules: [{ Id: 'custom-rule', Status: 'Enabled', ExpirationInDays: 30 }],
        },
      });
    });
  });

  describe('grant methods', () => {
    it('should expose grant methods', () => {
      const secureBucket = new SecureBucket(stack, 'TestBucket');

      expect(secureBucket.grantRead).toBeDefined();
      expect(secureBucket.grantWrite).toBeDefined();
      expect(secureBucket.grantReadWrite).toBeDefined();
      expect(secureBucket.grantDelete).toBeDefined();
    });

    it.each(['grantRead', 'grantWrite', 'grantReadWrite', 'grantDelete'] as const)(
      'should attach an IAM policy via %s',
      method => {
        const secureBucket = new SecureBucket(stack, 'TestBucket');
        const role = new Role(stack, 'Role', {
          assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        });

        const grant = secureBucket[method](role);
        expect(grant).toBeDefined();

        const template = Template.fromStack(stack);
        template.resourceCountIs('AWS::IAM::Policy', 1);
      }
    );
  });

  describe('bucket property', () => {
    it('should expose the underlying bucket', () => {
      const secureBucket = new SecureBucket(stack, 'TestBucket');

      expect(secureBucket.bucket).toBeDefined();
      expect(secureBucket.bucket.node.id).toBe('Bucket');
    });
  });
});
