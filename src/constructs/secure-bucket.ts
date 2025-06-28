import { Duration, RemovalPolicy, Tags } from 'aws-cdk-lib';
import {
  Bucket,
  BucketProps,
  BlockPublicAccess,
  BucketEncryption,
  LifecycleRule,
  StorageClass,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export type SecurityLevel = 'high' | 'medium' | 'low';

/**
 * Properties for the SecureBucket construct
 */
export interface SecureBucketProps extends Omit<BucketProps, 'encryption' | 'blockPublicAccess'> {
  /**
   * Security level for the bucket. Determines which security defaults are applied.
   * @default 'high'
   */
  readonly securityLevel?: SecurityLevel;

  /**
   * Whether to enable versioning for the bucket
   * @default true (high), false (medium/low)
   */
  readonly versioned?: boolean;

  /**
   * Whether to enable access logging
   * @default true (high/medium), false (low)
   */
  readonly enableAccessLogging?: boolean;

  /**
   * Lifecycle rules for the bucket
   * @default Standard lifecycle rules for cost optimization
   */
  readonly lifecycleRules?: LifecycleRule[];

  /**
   * Whether to enable server-side encryption with AWS managed keys
   * @default true (high/medium), false (low)
   */
  readonly enableEncryption?: boolean;

  /**
   * Removal policy for the bucket
   * @default RETAIN (high), DESTROY (medium/low)
   */
  readonly removalPolicy?: RemovalPolicy;

  /**
   * Whether to enforce SSL for all requests
   * @default true (high/medium), false (low)
   */
  readonly enforceSSL?: boolean;
}

/**
 * A secure S3 bucket construct that enforces security best practices by default.
 *
 * This construct creates an S3 bucket with the following security features enabled:
 * - Server-side encryption (SSE-S3)
 * - Block public access
 * - SSL enforcement
 * - Versioning
 * - Access logging
 * - Lifecycle policies for cost optimization
 *
 * @example
 * ```typescript
 * import { SecureBucket } from 'aws-cdk-secure-constructs';
 *
 * const secureBucket = new SecureBucket(this, 'MySecureBucket', {
 *   bucketName: 'my-secure-bucket',
 *   versioned: true,
 * });
 * ```
 */
export class SecureBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    super(scope, id);

    const securityLevel: SecurityLevel = props.securityLevel || 'high';

    // Security defaults by level
    const levelDefaults: Record<SecurityLevel, Partial<SecureBucketProps>> = {
      high: {
        versioned: true,
        enableAccessLogging: true,
        enableEncryption: true,
        removalPolicy: RemovalPolicy.RETAIN,
        enforceSSL: true,
      },
      medium: {
        versioned: false,
        enableAccessLogging: true,
        enableEncryption: true,
        removalPolicy: RemovalPolicy.DESTROY,
        enforceSSL: true,
      },
      low: {
        versioned: false,
        enableAccessLogging: false,
        enableEncryption: false,
        removalPolicy: RemovalPolicy.DESTROY,
        enforceSSL: false,
      },
    };

    // Default lifecycle rules for cost optimization
    const defaultLifecycleRules: LifecycleRule[] = [
      {
        id: 'transition-to-ia',
        enabled: true,
        transitions: [
          {
            storageClass: StorageClass.INFREQUENT_ACCESS,
            transitionAfter: Duration.days(30),
          },
          {
            storageClass: StorageClass.GLACIER,
            transitionAfter: Duration.days(90),
          },
          {
            storageClass: StorageClass.DEEP_ARCHIVE,
            transitionAfter: Duration.days(365),
          },
        ],
      },
      {
        id: 'delete-old-versions',
        enabled: true,
        noncurrentVersionTransitions: [
          {
            storageClass: StorageClass.GLACIER,
            transitionAfter: Duration.days(30),
          },
        ],
        noncurrentVersionExpiration: Duration.days(365),
      },
    ];

    // Merge security level defaults, then user props
    const mergedProps: SecureBucketProps = {
      ...levelDefaults[securityLevel],
      ...props,
    };

    // Merge default lifecycle rules with provided ones
    const lifecycleRules = mergedProps.lifecycleRules || defaultLifecycleRules;

    // Create access log bucket if logging is enabled
    const accessLogBucket = mergedProps.enableAccessLogging ? this.createAccessLogBucket() : undefined;

    // Create the secure bucket with enforced security settings
    this.bucket = new Bucket(this, 'Bucket', {
      // Security defaults
      encryption: mergedProps.enableEncryption ? BucketEncryption.S3_MANAGED : undefined,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: mergedProps.enforceSSL,
      versioned: mergedProps.versioned,
      removalPolicy: mergedProps.removalPolicy,

      // Access logging
      serverAccessLogsBucket: accessLogBucket,
      serverAccessLogsPrefix: accessLogBucket ? 'access-logs/' : undefined,

      // Lifecycle rules
      lifecycleRules,

      // Pass through other props
      ...mergedProps,
    });

    // Add tags for security and compliance
    Tags.of(this.bucket).add('SecurityLevel', securityLevel.charAt(0).toUpperCase() + securityLevel.slice(1));
    Tags.of(this.bucket).add('DataClassification', 'Confidential');
    Tags.of(this.bucket).add('Compliance', 'SOC2');
    Tags.of(this.bucket).add('ManagedBy', 'CDK');
  }

  /**
   * Creates a separate bucket for access logs to avoid circular dependencies
   */
  private createAccessLogBucket(): Bucket {
    return new Bucket(this, 'AccessLogBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          id: 'delete-old-logs',
          enabled: true,
          expiration: Duration.days(90),
        },
      ],
    });
  }

  /**
   * Grant read permissions to the specified principal
   */
  public grantRead(grantee: any, objectsKeyPattern?: string): any {
    return this.bucket.grantRead(grantee, objectsKeyPattern);
  }

  /**
   * Grant write permissions to the specified principal
   */
  public grantWrite(grantee: any, objectsKeyPattern?: string): any {
    return this.bucket.grantWrite(grantee, objectsKeyPattern);
  }

  /**
   * Grant read/write permissions to the specified principal
   */
  public grantReadWrite(grantee: any, objectsKeyPattern?: string): any {
    return this.bucket.grantReadWrite(grantee, objectsKeyPattern);
  }

  /**
   * Grant delete permissions to the specified principal
   */
  public grantDelete(grantee: any, objectsKeyPattern?: string): any {
    return this.bucket.grantDelete(grantee, objectsKeyPattern);
  }
}
