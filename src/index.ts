import { ComplianceReport } from './core/compliance';
import { S3BucketCompliance } from './resources/s3-bucket';

// Shared core types
export * from './core/security-level';
export * from './core/compliance';

// Resources - exposure of each resource module is controlled from this barrel.
// Comment a line out to remove a resource from the public surface.
export * from './resources/s3-bucket';

/**
 * Aggregated compliance reporting across all exposed resources.
 */
export class ComplianceRegistry {
  /** Returns the compliance reports for every exposed resource. */
  public static all(): ComplianceReport[] {
    return [S3BucketCompliance.report()];
  }

  private constructor() {}
}
