import { App, Stack, PropertyInjectors } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { Bucket, BucketEncryption, BlockPublicAccess, ObjectOwnership } from 'aws-cdk-lib/aws-s3';

import {
  ControlStatus,
  S3BucketCompliance,
  SecurityLevel,
  TieredSecureBucketDefaults,
} from '../../../src';

/**
 * Assertions for each ENFORCED control. If the compliance report claims a
 * control is ENFORCED but there is no assertion here (or the assertion fails),
 * the test fails - so the report cannot drift from actual behaviour.
 */
const ENFORCED_ASSERTIONS: Record<string, (t: Template) => void> = {
  'CIS-AWS-2.1.1': t =>
    t.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
        ],
      },
    }),
  'CIS-AWS-2.1.2': t =>
    t.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Deny',
            Condition: { Bool: { 'aws:SecureTransport': 'false' } },
          }),
        ]),
      },
    }),
  'CIS-AWS-2.1.4': t =>
    t.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    }),
  'CIS-AWS-2.1.5': t =>
    t.hasResourceProperties('AWS::S3::Bucket', {
      OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerEnforced' }] },
    }),
};

describe('S3BucketCompliance report (verified against behaviour)', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    // Use the lowest tier AND actively attempt to violate every CIS-critical
    // control. The injector must still produce a compliant bucket.
    PropertyInjectors.of(stack).add(
      new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.LOW })
    );
    new Bucket(stack, 'Attacked', {
      enforceSSL: false,
      encryption: BucketEncryption.UNENCRYPTED,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
    });

    template = Template.fromStack(stack);
  });

  const report = S3BucketCompliance.report();
  const enforced = report.controls.filter(c => c.status === ControlStatus.ENFORCED);

  it('reports at least one enforced control', () => {
    expect(enforced.length).toBeGreaterThan(0);
  });

  for (const control of enforced) {
    it(`enforces ${control.id} - ${control.title} (even under override attempts)`, () => {
      const assertion = ENFORCED_ASSERTIONS[control.id];
      expect(assertion).toBeDefined();
      assertion(template);
    });
  }
});
