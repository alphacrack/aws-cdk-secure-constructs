import { Duration, RemovalPolicy, Tags, aws_iam as iam } from 'aws-cdk-lib';
import {
  Bucket,
  BucketProps,
  BlockPublicAccess,
  BucketEncryption,
  LifecycleRule,
  ObjectOwnership,
  StorageClass,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { SecurityLevel } from '../../core/security-level';

import { TIER_CONSTRUCT } from './fields';

/**
 * Properties for the {@link SecureBucket} construct.
 *
 * Note: CIS-critical settings (encryption, block-public-access, SSL
 * enforcement and object ownership) are always enforced and cannot be
 * disabled, even if conflicting values are supplied via the inherited
 * {@link BucketProps} fields.
 */
export interface SecureBucketProps extends BucketProps {
  /**
   * Operational security tier. Controls tier-variable settings such as
   * versioning, access logging and removal policy. CIS-critical settings are
   * always enforced regardless of tier.
   *
   * @default SecurityLevel.HIGH
   */
  readonly securityLevel?: SecurityLevel;

  /**
   * Whether to provision a dedicated access-log bucket and enable server
   * access logging.
   *
   * @default true for HIGH/MEDIUM, false for LOW
   */
  readonly enableAccessLogging?: boolean;

  /**
   * @deprecated Encryption is always enforced (CIS-critical) and this flag has
   * no effect. Retained for backwards compatibility only.
   */
  readonly enableEncryption?: boolean;
}

/**
 * A hardened, CIS-compliant S3 bucket.
 *
 * CIS-critical controls are baked in and immutable:
 * - Server-side encryption (SSE-S3)
 * - Block all public access
 * - SSL/TLS enforcement
 * - Bucket-owner-enforced object ownership (ACLs disabled)
 *
 * Operational hardening (versioning, access logging, removal policy, lifecycle)
 * follows the chosen {@link SecurityLevel} and defaults to
 * {@link SecurityLevel.HIGH}.
 *
 * @example
 * const secureBucket = new SecureBucket(this, 'MySecureBucket', {
 *   bucketName: 'my-secure-bucket',
 *   securityLevel: SecurityLevel.HIGH,
 * });
 */
export class SecureBucket extends Construct {
  /** The underlying hardened bucket. */
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    super(scope, id);

    const level = props.securityLevel ?? SecurityLevel.HIGH;
    const tier = TIER_CONSTRUCT[level];

    const accessLoggingEnabled = props.enableAccessLogging ?? tier.accessLogging;
    const accessLogBucket = accessLoggingEnabled ? this.createAccessLogBucket() : undefined;
    const lifecycleRules = props.lifecycleRules ?? SecureBucket.defaultLifecycleRules();

    // Strip fields we control or lock so they don't leak through the spread.
    const {
      securityLevel: _securityLevel,
      enableAccessLogging: _enableAccessLogging,
      encryption: _encryption,
      blockPublicAccess: _blockPublicAccess,
      enforceSSL: _enforceSSL,
      objectOwnership: _objectOwnership,
      versioned: userVersioned,
      removalPolicy: userRemovalPolicy,
      lifecycleRules: _lifecycleRules,
      serverAccessLogsBucket: _serverAccessLogsBucket,
      serverAccessLogsPrefix: _serverAccessLogsPrefix,
      ...passThrough
    } = props;

    // `enableEncryption` is a deprecated no-op; strip it via a Record cast so we
    // don't reference the deprecated declaration directly.
    delete (passThrough as Record<string, unknown>).enableEncryption;

    this.bucket = new Bucket(this, 'Bucket', {
      ...passThrough,

      // Tier-variable: explicit user values win over the tier default; a
      // registered TieredSecureBucketDefaults injector can only tighten these.
      versioned: userVersioned ?? tier.versioned,
      removalPolicy: userRemovalPolicy ?? tier.removalPolicy,
      lifecycleRules,

      serverAccessLogsBucket: accessLogBucket,
      serverAccessLogsPrefix: accessLogBucket ? 'access-logs/' : undefined,

      // CIS-critical: enforced last so nothing can weaken it.
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
    });

    const levelTag = level.charAt(0).toUpperCase() + level.slice(1);
    Tags.of(this.bucket).add('SecurityLevel', levelTag);
    Tags.of(this.bucket).add('DataClassification', 'Confidential');
    Tags.of(this.bucket).add('Compliance', 'CIS-AWS-Foundations');
    Tags.of(this.bucket).add('ManagedBy', 'CDK');
  }

  /** Default lifecycle rules for cost optimization. */
  private static defaultLifecycleRules(): LifecycleRule[] {
    return [
      {
        id: 'transition-to-ia',
        enabled: true,
        transitions: [
          { storageClass: StorageClass.INFREQUENT_ACCESS, transitionAfter: Duration.days(30) },
          { storageClass: StorageClass.GLACIER, transitionAfter: Duration.days(90) },
          { storageClass: StorageClass.DEEP_ARCHIVE, transitionAfter: Duration.days(365) },
        ],
      },
      {
        id: 'delete-old-versions',
        enabled: true,
        noncurrentVersionTransitions: [
          { storageClass: StorageClass.GLACIER, transitionAfter: Duration.days(30) },
        ],
        noncurrentVersionExpiration: Duration.days(365),
      },
    ];
  }

  /** Creates a separate bucket for access logs to avoid circular dependencies. */
  private createAccessLogBucket(): Bucket {
    // Note: object ownership is intentionally left at the default here. A
    // server-access-logs target bucket receives a `LogDeliveryWrite` ACL, which
    // is incompatible with `BUCKET_OWNER_ENFORCED` (ACLs disabled).
    return new Bucket(this, 'AccessLogBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
      lifecycleRules: [{ id: 'delete-old-logs', enabled: true, expiration: Duration.days(90) }],
    });
  }

  /** Grant read permissions to the specified principal. */
  public grantRead(grantee: iam.IGrantable, objectsKeyPattern?: string): iam.Grant {
    return this.bucket.grantRead(grantee, objectsKeyPattern);
  }

  /** Grant write permissions to the specified principal. */
  public grantWrite(grantee: iam.IGrantable, objectsKeyPattern?: string): iam.Grant {
    return this.bucket.grantWrite(grantee, objectsKeyPattern);
  }

  /** Grant read/write permissions to the specified principal. */
  public grantReadWrite(grantee: iam.IGrantable, objectsKeyPattern?: string): iam.Grant {
    return this.bucket.grantReadWrite(grantee, objectsKeyPattern);
  }

  /** Grant delete permissions to the specified principal. */
  public grantDelete(grantee: iam.IGrantable, objectsKeyPattern?: string): iam.Grant {
    return this.bucket.grantDelete(grantee, objectsKeyPattern);
  }
}
