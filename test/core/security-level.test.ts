import { SecurityLevel, SecurityLevels } from '../../src';

describe('SecurityLevels.strictest', () => {
  it('defaults to HIGH when nothing is specified', () => {
    expect(SecurityLevels.strictest()).toBe(SecurityLevel.HIGH);
  });

  it('ignores undefined inputs', () => {
    expect(SecurityLevels.strictest(SecurityLevel.LOW, undefined)).toBe(SecurityLevel.LOW);
    expect(SecurityLevels.strictest(undefined, SecurityLevel.MEDIUM)).toBe(SecurityLevel.MEDIUM);
  });

  it('returns the stronger of two tiers (tighten-only)', () => {
    expect(SecurityLevels.strictest(SecurityLevel.LOW, SecurityLevel.HIGH)).toBe(
      SecurityLevel.HIGH
    );
    expect(SecurityLevels.strictest(SecurityLevel.HIGH, SecurityLevel.LOW)).toBe(
      SecurityLevel.HIGH
    );
    expect(SecurityLevels.strictest(SecurityLevel.MEDIUM, SecurityLevel.LOW)).toBe(
      SecurityLevel.MEDIUM
    );
  });

  it('orders strength HIGH > MEDIUM > LOW', () => {
    expect(SecurityLevels.strength(SecurityLevel.HIGH)).toBeGreaterThan(
      SecurityLevels.strength(SecurityLevel.MEDIUM)
    );
    expect(SecurityLevels.strength(SecurityLevel.MEDIUM)).toBeGreaterThan(
      SecurityLevels.strength(SecurityLevel.LOW)
    );
  });
});
