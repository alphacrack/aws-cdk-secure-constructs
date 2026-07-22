import { RemovalPolicy } from 'aws-cdk-lib';

import {
  secureMaxVersioned,
  secureMaxRemovalPolicy,
} from '../../../src/resources/s3-bucket/fields';

describe('fields: secureMaxVersioned', () => {
  it('should enable versioning when the tier value is true', () => {
    expect(secureMaxVersioned(true, undefined)).toBe(true);
    expect(secureMaxVersioned(true, false)).toBe(true);
    expect(secureMaxVersioned(true, true)).toBe(true);
  });

  it('should never weaken an enabled tier value to false', () => {
    expect(secureMaxVersioned(true, false)).toBe(true);
  });

  it('should adopt an incoming true value when the tier value is false', () => {
    expect(secureMaxVersioned(false, true)).toBe(true);
  });

  it('should stay disabled when both values are false/undefined', () => {
    expect(secureMaxVersioned(false, undefined)).toBe(false);
    expect(secureMaxVersioned(false, false)).toBe(false);
  });

  it('should treat truthy/incoming coercion correctly', () => {
    expect(secureMaxVersioned(false, true)).toBe(true);
    expect(secureMaxVersioned(true, false)).toBe(true);
  });
});

describe('fields: secureMaxRemovalPolicy', () => {
  it('should return the tier value when incoming is undefined', () => {
    expect(secureMaxRemovalPolicy(RemovalPolicy.RETAIN, undefined)).toBe(RemovalPolicy.RETAIN);
    expect(secureMaxRemovalPolicy(RemovalPolicy.DESTROY, undefined)).toBe(RemovalPolicy.DESTROY);
  });

  it('should never weaken a RETAIN tier', () => {
    expect(secureMaxRemovalPolicy(RemovalPolicy.RETAIN, RemovalPolicy.DESTROY)).toBe(
      RemovalPolicy.RETAIN
    );
    expect(secureMaxRemovalPolicy(RemovalPolicy.RETAIN, RemovalPolicy.SNAPSHOT)).toBe(
      RemovalPolicy.RETAIN
    );
    expect(secureMaxRemovalPolicy(RemovalPolicy.RETAIN, RemovalPolicy.RETAIN)).toBe(
      RemovalPolicy.RETAIN
    );
  });

  it('should adopt an incoming policy that is at least as strong as the tier', () => {
    expect(secureMaxRemovalPolicy(RemovalPolicy.DESTROY, RemovalPolicy.SNAPSHOT)).toBe(
      RemovalPolicy.SNAPSHOT
    );
    expect(secureMaxRemovalPolicy(RemovalPolicy.DESTROY, RemovalPolicy.RETAIN)).toBe(
      RemovalPolicy.RETAIN
    );
    expect(secureMaxRemovalPolicy(RemovalPolicy.SNAPSHOT, RemovalPolicy.RETAIN)).toBe(
      RemovalPolicy.RETAIN
    );
  });

  it('should keep the weaker tier value when incoming is weaker', () => {
    expect(secureMaxRemovalPolicy(RemovalPolicy.SNAPSHOT, RemovalPolicy.DESTROY)).toBe(
      RemovalPolicy.SNAPSHOT
    );
    expect(secureMaxRemovalPolicy(RemovalPolicy.DESTROY, RemovalPolicy.DESTROY)).toBe(
      RemovalPolicy.DESTROY
    );
  });

  it('should rank SNAPSHOT between DESTROY and RETAIN', () => {
    expect(secureMaxRemovalPolicy(RemovalPolicy.SNAPSHOT, RemovalPolicy.SNAPSHOT)).toBe(
      RemovalPolicy.SNAPSHOT
    );
    expect(secureMaxRemovalPolicy(RemovalPolicy.DESTROY, RemovalPolicy.SNAPSHOT)).toBe(
      RemovalPolicy.SNAPSHOT
    );
    expect(secureMaxRemovalPolicy(RemovalPolicy.SNAPSHOT, RemovalPolicy.RETAIN)).toBe(
      RemovalPolicy.RETAIN
    );
  });
});
