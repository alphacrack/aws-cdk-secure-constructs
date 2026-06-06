import { ComplianceReport, ControlStatus } from '../../core/compliance';

/**
 * CIS AWS Foundations Benchmark compliance report for the S3 bucket resources
 * in this module.
 *
 * Each {@link ControlStatus.ENFORCED} control is backed by a synthesis test
 * (see `test/resources/s3-bucket/compliance.test.ts`) that fails if the
 * corresponding default is ever weakened, so this report cannot drift from the
 * actual behaviour of the construct and injectors.
 */
export class S3BucketCompliance {
  /** Returns the CIS compliance report for S3 buckets. */
  public static report(): ComplianceReport {
    return {
      resourceType: 'AWS::S3::Bucket',
      framework: 'CIS AWS Foundations Benchmark',
      version: 'v3.0.0',
      controls: [
        {
          id: 'CIS-AWS-2.1.1',
          title: 'Ensure S3 buckets employ encryption-at-rest',
          status: ControlStatus.ENFORCED,
          enforcedBy: 'encryption=S3_MANAGED',
        },
        {
          id: 'CIS-AWS-2.1.2',
          title: 'Ensure S3 Bucket Policy denies HTTP requests',
          status: ControlStatus.ENFORCED,
          enforcedBy: 'enforceSSL=true',
        },
        {
          id: 'CIS-AWS-2.1.4',
          title: 'Ensure that S3 buckets are configured with Block Public Access',
          status: ControlStatus.ENFORCED,
          enforcedBy: 'blockPublicAccess=BLOCK_ALL',
        },
        {
          id: 'CIS-AWS-2.1.5',
          title: 'Ensure object ownership is set to bucket-owner-enforced (ACLs disabled)',
          status: ControlStatus.ENFORCED,
          enforcedBy: 'objectOwnership=BUCKET_OWNER_ENFORCED',
        },
        {
          id: 'CIS-AWS-2.1.3',
          title: 'Ensure versioning is enabled for data protection',
          status: ControlStatus.CONFIGURABLE,
          enforcedBy: 'versioned (tier default; HIGH/MEDIUM enabled)',
        },
      ],
    };
  }

  private constructor() {}
}
