import { RemovalPolicy } from 'aws-cdk-lib';
import {
  BlockPublicAccess,
  BucketEncryption,
  BucketProps,
  ObjectOwnership,
} from 'aws-cdk-lib/aws-s3';

import { SecurityLevel } from '../../core/security-level';

/**
 * Internal source of truth for S3 bucket field categorization.
 *
 * This module is intentionally NOT re-exported from the package root: it backs
 * the construct, the injector, and the compliance report so that all three stay
 * consistent, but it is an implementation detail (and keeps the public jsii API
 * free of free-standing values/functions).
 */

/**
 * CIS-critical fields. These are enforced last (after user props and tier
 * defaults) and can never be overridden by callers or property injectors.
 */
export const CIS_CRITICAL: Partial<BucketProps> = {
  encryption: BucketEncryption.S3_MANAGED,
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  enforceSSL: true,
  objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
};

/** Tier-variable (operational) settings expressed as raw bucket props. */
export interface TierBucketDefaults {
  readonly versioned: boolean;
  readonly removalPolicy: RemovalPolicy;
}

/**
 * Per-tier defaults for the operational fields a property injector can manage.
 * Access logging and lifecycle are handled by the construct (they need extra
 * resources) and are therefore not part of the injector-level matrix.
 */
export const TIER_VARIABLE: Record<SecurityLevel, TierBucketDefaults> = {
  [SecurityLevel.HIGH]: { versioned: true, removalPolicy: RemovalPolicy.RETAIN },
  [SecurityLevel.MEDIUM]: { versioned: true, removalPolicy: RemovalPolicy.DESTROY },
  [SecurityLevel.LOW]: { versioned: false, removalPolicy: RemovalPolicy.DESTROY },
};

/** Construct-level tier config (superset of the injector matrix). */
export interface TierConstructConfig {
  readonly versioned: boolean;
  readonly accessLogging: boolean;
  readonly removalPolicy: RemovalPolicy;
}

export const TIER_CONSTRUCT: Record<SecurityLevel, TierConstructConfig> = {
  [SecurityLevel.HIGH]: {
    versioned: true,
    accessLogging: true,
    removalPolicy: RemovalPolicy.RETAIN,
  },
  [SecurityLevel.MEDIUM]: {
    versioned: true,
    accessLogging: true,
    removalPolicy: RemovalPolicy.DESTROY,
  },
  [SecurityLevel.LOW]: {
    versioned: false,
    accessLogging: false,
    removalPolicy: RemovalPolicy.DESTROY,
  },
};

const REMOVAL_STRENGTH: Record<string, number> = {
  [RemovalPolicy.DESTROY]: 0,
  [RemovalPolicy.SNAPSHOT]: 1,
  [RemovalPolicy.RETAIN]: 2,
  [RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE]: 2,
};

/** Returns the more secure of two `versioned` values (enabled wins). */
export function secureMaxVersioned(tierValue: boolean, incoming?: boolean): boolean {
  return Boolean(tierValue) || Boolean(incoming);
}

/** Returns the more secure of two removal policies (RETAIN > SNAPSHOT > DESTROY). */
export function secureMaxRemovalPolicy(
  tierValue: RemovalPolicy,
  incoming?: RemovalPolicy
): RemovalPolicy {
  if (incoming === undefined) {
    return tierValue;
  }
  const tierRank = REMOVAL_STRENGTH[tierValue] ?? 0;
  const incomingRank = REMOVAL_STRENGTH[incoming] ?? 0;
  return incomingRank >= tierRank ? incoming : tierValue;
}
