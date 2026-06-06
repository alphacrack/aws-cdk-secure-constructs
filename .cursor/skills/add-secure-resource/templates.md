# Resource module templates

Copy-paste skeletons for a new `src/resources/<resource>/` module. The example
uses SQS (`SecureQueue`); replace the resource type, props, and field names.
Mirror `src/resources/s3-bucket/` for a working reference.

## fields.ts (internal source of truth)

```typescript
import { Duration } from 'aws-cdk-lib';
import { QueueEncryption, QueueProps } from 'aws-cdk-lib/aws-sqs';

import { SecurityLevel } from '../../core/security-level';

// CIS-critical: enforced last, never overridable.
export const CIS_CRITICAL: Partial<QueueProps> = {
  encryption: QueueEncryption.KMS_MANAGED,
  enforceSSL: true,
};

export interface TierQueueDefaults {
  readonly retentionPeriod: Duration;
}

// Tier-variable: vary by tier, injector may only tighten.
export const TIER_VARIABLE: Record<SecurityLevel, TierQueueDefaults> = {
  [SecurityLevel.HIGH]: { retentionPeriod: Duration.days(14) },
  [SecurityLevel.MEDIUM]: { retentionPeriod: Duration.days(7) },
  [SecurityLevel.LOW]: { retentionPeriod: Duration.days(4) },
};

// Returns the more secure of two values (longer retention wins here).
export function secureMaxRetention(tierValue: Duration, incoming?: Duration): Duration {
  if (incoming === undefined) return tierValue;
  return incoming.toSeconds() >= tierValue.toSeconds() ? incoming : tierValue;
}
```

## secure-<x>.ts (hardened construct)

```typescript
import { Queue, QueueProps, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

import { SecurityLevel } from '../../core/security-level';
import { TIER_VARIABLE } from './fields';

export interface SecureQueueProps extends QueueProps {
  /** @default SecurityLevel.HIGH */
  readonly securityLevel?: SecurityLevel;
}

export class SecureQueue extends Construct {
  public readonly queue: Queue;

  constructor(scope: Construct, id: string, props: SecureQueueProps = {}) {
    super(scope, id);

    const level = props.securityLevel ?? SecurityLevel.HIGH;
    const tier = TIER_VARIABLE[level];

    const {
      securityLevel: _securityLevel,
      encryption: _encryption,
      enforceSSL: _enforceSSL,
      retentionPeriod: userRetention,
      ...passThrough
    } = props;

    this.queue = new Queue(this, 'Queue', {
      ...passThrough,
      retentionPeriod: userRetention ?? tier.retentionPeriod,
      // CIS-critical enforced last.
      encryption: QueueEncryption.KMS_MANAGED,
      enforceSSL: true,
    });
  }
}
```

## blueprints.ts (tighten-only injector)

```typescript
import { IPropertyInjector, InjectionContext } from 'aws-cdk-lib';
import { Queue, QueueProps, QueueEncryption } from 'aws-cdk-lib/aws-sqs';

import { SecurityLevel } from '../../core/security-level';
import { CIS_CRITICAL, TIER_VARIABLE, secureMaxRetention } from './fields';

export interface TieredSecureQueueOptions {
  /** @default SecurityLevel.HIGH */
  readonly securityLevel?: SecurityLevel;
}

export class TieredSecureQueueDefaults implements IPropertyInjector {
  public readonly constructUniqueId: string;
  private readonly securityLevel: SecurityLevel;

  constructor(options: TieredSecureQueueOptions = {}) {
    this.constructUniqueId = Queue.PROPERTY_INJECTION_ID;
    this.securityLevel = options.securityLevel ?? SecurityLevel.HIGH;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- IPropertyInjector.inject is `any`; jsii requires the override to match.
  public inject(originalProps: any, _context: InjectionContext): any {
    const props = (originalProps ?? {}) as QueueProps;
    const tier = TIER_VARIABLE[this.securityLevel];
    return {
      ...props,
      retentionPeriod: secureMaxRetention(tier.retentionPeriod, props.retentionPeriod),
      ...CIS_CRITICAL,
    };
  }
}
```

## compliance.ts (jsii class static)

```typescript
import { ComplianceReport, ControlStatus } from '../../core/compliance';

export class QueueCompliance {
  public static report(): ComplianceReport {
    return {
      resourceType: 'AWS::SQS::Queue',
      framework: 'CIS AWS Foundations Benchmark',
      version: 'v3.0.0',
      controls: [
        { id: 'CIS-AWS-X.Y', title: 'Encryption at rest', status: ControlStatus.ENFORCED, enforcedBy: 'encryption=KMS_MANAGED' },
        { id: 'CIS-AWS-X.Z', title: 'Enforce SSL', status: ControlStatus.ENFORCED, enforcedBy: 'enforceSSL=true' },
      ],
    };
  }

  private constructor() {}
}
```

## index.ts

```typescript
export * from './secure-queue';
export * from './blueprints';
export * from './compliance';
```

## test/resources/<resource>/compliance.test.ts (write first)

```typescript
import { App, Stack, PropertyInjectors } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';

import { ControlStatus, QueueCompliance, SecurityLevel, TieredSecureQueueDefaults } from '../../../src';

const ENFORCED_ASSERTIONS: Record<string, (t: Template) => void> = {
  'CIS-AWS-X.Y': t => t.hasResourceProperties('AWS::SQS::Queue', { KmsMasterKeyId: 'alias/aws/sqs' }),
  'CIS-AWS-X.Z': t => t.hasResourceProperties('AWS::SQS::QueuePolicy', { /* deny non-SSL */ }),
};

describe('QueueCompliance (verified)', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    PropertyInjectors.of(stack).add(new TieredSecureQueueDefaults({ securityLevel: SecurityLevel.LOW }));
    new Queue(stack, 'Attacked', { encryption: QueueEncryption.UNENCRYPTED, enforceSSL: false });
    template = Template.fromStack(stack);
  });

  const enforced = QueueCompliance.report().controls.filter(c => c.status === ControlStatus.ENFORCED);

  for (const control of enforced) {
    it(`enforces ${control.id} even under override attempts`, () => {
      const assertion = ENFORCED_ASSERTIONS[control.id];
      expect(assertion).toBeDefined();
      assertion(template);
    });
  }
});
```
