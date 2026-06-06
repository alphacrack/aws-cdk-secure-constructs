import { IPropertyInjector, InjectionContext, Duration } from 'aws-cdk-lib';
import {
  Bucket,
  BucketProps,
  BlockPublicAccess,
  BucketEncryption,
  ObjectOwnership,
} from 'aws-cdk-lib/aws-s3';

import { SecurityLevel } from '../../core/security-level';

import { CIS_CRITICAL, TIER_VARIABLE, secureMaxRemovalPolicy, secureMaxVersioned } from './fields';

/**
 * Property injector that applies secure defaults to all S3 buckets in scope,
 * while allowing callers to override any of them.
 *
 * @example
 * PropertyInjectors.of(app).add(new SecureBucketDefaults());
 */
export class SecureBucketDefaults implements IPropertyInjector {
  public readonly constructUniqueId: string;

  constructor() {
    this.constructUniqueId = Bucket.PROPERTY_INJECTION_ID;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- IPropertyInjector.inject is typed `any` by aws-cdk-lib; jsii requires the override to match.
  public inject(originalProps: any, _context: InjectionContext): any {
    const props = (originalProps ?? {}) as BucketProps;

    const secureDefaults: Partial<BucketProps> = {
      encryption: props.encryption || BucketEncryption.S3_MANAGED,
      blockPublicAccess: props.blockPublicAccess || BlockPublicAccess.BLOCK_ALL,
      enforceSSL: props.enforceSSL !== false ? true : false,
      versioned: props.versioned === undefined ? true : props.versioned,
      objectOwnership: props.objectOwnership || ObjectOwnership.BUCKET_OWNER_ENFORCED,
      intelligentTieringConfigurations: props.intelligentTieringConfigurations || [
        {
          name: 'default-tiering',
          archiveAccessTierTime: Duration.days(90),
          deepArchiveAccessTierTime: Duration.days(180),
        },
      ],
    };

    return {
      ...secureDefaults,
      ...props,
    };
  }
}

/**
 * Property injector that enforces strict security defaults that cannot be
 * overridden.
 *
 * @example
 * PropertyInjectors.of(app).add(new StrictSecureBucketDefaults());
 */
export class StrictSecureBucketDefaults implements IPropertyInjector {
  public readonly constructUniqueId: string;

  constructor() {
    this.constructUniqueId = Bucket.PROPERTY_INJECTION_ID;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- IPropertyInjector.inject is typed `any` by aws-cdk-lib; jsii requires the override to match.
  public inject(originalProps: any, _context: InjectionContext): any {
    const props = (originalProps ?? {}) as BucketProps;

    const strictDefaults: Partial<BucketProps> = {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
    };

    return {
      ...props,
      ...strictDefaults,
    };
  }
}

/**
 * Options for {@link TieredSecureBucketDefaults}.
 */
export interface TieredSecureBucketOptions {
  /**
   * The operational security tier to apply.
   *
   * @default SecurityLevel.HIGH
   */
  readonly securityLevel?: SecurityLevel;
}

/**
 * Tier-aware, tighten-only property injector.
 *
 * Applies the chosen {@link SecurityLevel} to the tier-variable fields using a
 * field-level "secure-max" merge so it can only tighten (never loosen) values
 * already present on the bucket. CIS-critical fields are always re-asserted, so
 * the resulting bucket is CIS-compliant regardless of tier - even at
 * {@link SecurityLevel.LOW}.
 *
 * Combined with {@link SecureBucket} (which sets its own tier), the effective
 * posture is the strictest of the two: the injector acts as an organisational
 * security floor.
 *
 * @example
 * PropertyInjectors.of(app).add(new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.MEDIUM }));
 */
export class TieredSecureBucketDefaults implements IPropertyInjector {
  public readonly constructUniqueId: string;
  private readonly securityLevel: SecurityLevel;

  constructor(options: TieredSecureBucketOptions = {}) {
    this.constructUniqueId = Bucket.PROPERTY_INJECTION_ID;
    this.securityLevel = options.securityLevel ?? SecurityLevel.HIGH;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- IPropertyInjector.inject is typed `any` by aws-cdk-lib; jsii requires the override to match.
  public inject(originalProps: any, _context: InjectionContext): any {
    const props = (originalProps ?? {}) as BucketProps;
    const tier = TIER_VARIABLE[this.securityLevel];

    return {
      ...props,

      // Tier-variable: tighten only (never weaken an incoming stronger value).
      versioned: secureMaxVersioned(tier.versioned, props.versioned),
      removalPolicy: secureMaxRemovalPolicy(tier.removalPolicy, props.removalPolicy),

      // CIS-critical: always enforced last.
      ...CIS_CRITICAL,
    };
  }
}
