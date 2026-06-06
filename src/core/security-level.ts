/**
 * Security posture tiers for tier-variable (operational) settings.
 *
 * Tiers only affect operational hardening (versioning, access logging,
 * removal policy, lifecycle). CIS-critical fields are enforced independently
 * of the tier and can never be relaxed - even at {@link SecurityLevel.LOW}.
 */
export enum SecurityLevel {
  /** Most secure operational posture. The library default. */
  HIGH = 'high',
  /** Balanced operational posture. */
  MEDIUM = 'medium',
  /** Minimal operational hardening (CIS-critical controls still enforced). */
  LOW = 'low',
}

/**
 * Helpers for reasoning about {@link SecurityLevel} strength.
 *
 * Exposed as static methods (rather than free functions) so the API stays
 * jsii-compatible for multi-language publishing.
 */
export class SecurityLevels {
  private static readonly STRENGTH: Record<SecurityLevel, number> = {
    [SecurityLevel.LOW]: 1,
    [SecurityLevel.MEDIUM]: 2,
    [SecurityLevel.HIGH]: 3,
  };

  /**
   * Returns the strictest (most secure) of the supplied tiers.
   *
   * Undefined inputs are ignored. When nothing is specified, the secure
   * default {@link SecurityLevel.HIGH} is returned. This is what implements
   * the "injector can only tighten, never loosen" rule: combining a
   * construct-level tier with an injector tier always yields the stronger one.
   */
  public static strictest(a?: SecurityLevel, b?: SecurityLevel): SecurityLevel {
    const candidates = [a, b].filter((t): t is SecurityLevel => t !== undefined);
    if (candidates.length === 0) {
      return SecurityLevel.HIGH;
    }
    return candidates.reduce((best, next) =>
      SecurityLevels.STRENGTH[next] > SecurityLevels.STRENGTH[best] ? next : best
    );
  }

  /** Numeric strength of a tier (higher is more secure). */
  public static strength(level: SecurityLevel): number {
    return SecurityLevels.STRENGTH[level];
  }

  private constructor() {}
}
