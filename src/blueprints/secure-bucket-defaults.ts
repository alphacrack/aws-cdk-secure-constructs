import { IPropertyInjector, InjectionContext, Duration } from 'aws-cdk-lib';
import {
  Bucket,
  BucketProps,
  BlockPublicAccess,
  BucketEncryption,
  ObjectOwnership,
  IntelligentTieringConfiguration,
} from 'aws-cdk-lib/aws-s3';

/**
 * Property injector that applies secure defaults to all S3 buckets in the construct tree.
 *
 * This injector implements the CDK Blueprints methodology to automatically apply
 * security best practices to all S3 buckets created in your CDK application.
 *
 * @example
 * ```typescript
 * import { App, PropertyInjectors } from 'aws-cdk-lib';
 * import { SecureBucketDefaults } from 'aws-cdk-secure-constructs';
 *
 * const app = new App();
 * PropertyInjectors.of(app).add(new SecureBucketDefaults());
 *
 * // All buckets created in this app will automatically get secure defaults
 * const bucket = new Bucket(stack, 'MyBucket');
 * ```
 */
export class SecureBucketDefaults implements IPropertyInjector {
  public readonly constructUniqueId: string;

  constructor() {
    this.constructUniqueId = Bucket.PROPERTY_INJECTION_ID;
  }

  /**
   * Injects secure default properties into S3 bucket configurations.
   *
   * This method is called by the CDK framework when creating S3 buckets.
   * It applies security best practices while allowing developers to override
   * specific settings when needed.
   *
   * @param originalProps - The original properties passed to the Bucket constructor
   * @param context - The injection context provided by CDK
   * @returns Modified properties with secure defaults applied
   */
  public inject(originalProps: BucketProps = {}, _context: InjectionContext): BucketProps {
    // Apply security defaults before original props to allow overrides
    const secureDefaults: Partial<BucketProps> = {
      // Encryption: Enable server-side encryption by default
      encryption: originalProps.encryption || BucketEncryption.S3_MANAGED,

      // Block public access: Block all public access by default
      blockPublicAccess: originalProps.blockPublicAccess || BlockPublicAccess.BLOCK_ALL,

      // SSL enforcement: Require SSL for all requests
      enforceSSL: originalProps.enforceSSL !== false ? true : false,

      // Versioning: Enable versioning for data protection
      versioned: originalProps.versioned === undefined ? true : originalProps.versioned,

      // Object ownership: Use bucket owner enforced for security
      objectOwnership: originalProps.objectOwnership || ObjectOwnership.BUCKET_OWNER_ENFORCED,

      // Intelligent tiering: Enable for cost optimization
      intelligentTieringConfigurations: originalProps.intelligentTieringConfigurations || [
        {
          name: 'default-tiering',
          archiveAccessTierTime: Duration.days(90),
          deepArchiveAccessTierTime: Duration.days(180),
        },
      ],
    };

    // Merge with original props, allowing overrides
    return {
      ...secureDefaults,
      ...originalProps,
    };
  }
}

/**
 * Property injector that applies strict security defaults that cannot be overridden.
 *
 * Use this injector when you want to enforce security settings that cannot be
 * bypassed by developers.
 *
 * @example
 * ```typescript
 * import { App, PropertyInjectors } from 'aws-cdk-lib';
 * import { StrictSecureBucketDefaults } from 'aws-cdk-secure-constructs';
 *
 * const app = new App();
 * PropertyInjectors.of(app).add(new StrictSecureBucketDefaults());
 * ```
 */
export class StrictSecureBucketDefaults implements IPropertyInjector {
  public readonly constructUniqueId: string;

  constructor() {
    this.constructUniqueId = Bucket.PROPERTY_INJECTION_ID;
  }

  /**
   * Injects strict security defaults that override any conflicting settings.
   *
   * This method applies security settings after the original props, ensuring
   * that security requirements cannot be bypassed.
   *
   * @param originalProps - The original properties passed to the Bucket constructor
   * @param context - The injection context provided by CDK
   * @returns Properties with strict security defaults enforced
   */
  public inject(originalProps: BucketProps, _context: InjectionContext): BucketProps {
    // Apply strict security defaults after original props to prevent overrides
    const strictDefaults: Partial<BucketProps> = {
      // These settings cannot be overridden
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
    };

    // Merge with original props, with strict defaults taking precedence
    return {
      ...originalProps,
      ...strictDefaults,
    };
  }
}
