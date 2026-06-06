# API Reference

Public API for **aws-cdk-secure-constructs**. Currently covers S3 only.
Requires `aws-cdk-lib` >= 2.196.0.

## Table of Contents

- [SecurityLevel](#securitylevel)
- [SecureBucket](#securebucket)
- [SecureBucketDefaults](#securebucketdefaults)
- [StrictSecureBucketDefaults](#strictsecurebucketdefaults)
- [TieredSecureBucketDefaults](#tieredsecurebucketdefaults)
- [Compliance reporting](#compliance-reporting)

## SecurityLevel

Operational security tier applied to tier-variable fields. CIS-critical settings
are always enforced regardless of tier.

```typescript
enum SecurityLevel {
  HIGH = 'high',   // library default
  MEDIUM = 'medium',
  LOW = 'low',
}
```

`SecurityLevels.strictest(a?, b?)` returns the stronger of two tiers (defaulting
to `HIGH`), implementing the tighten-only precedence rule.

## SecureBucket

A secure S3 bucket construct that enforces security best practices by default.

### Constructor

```typescript
new SecureBucket(scope: Construct, id: string, props?: SecureBucketProps)
```

### Properties

#### SecureBucketProps

Extends `BucketProps` with additional security-focused properties. CIS-critical
settings (`encryption`, `blockPublicAccess`, `enforceSSL`, `objectOwnership`) are
always enforced and any conflicting values supplied here are ignored.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `securityLevel` | `SecurityLevel` | `HIGH` | Operational tier for tier-variable fields |
| `versioned` | `boolean` | tier (`true` for HIGH/MEDIUM) | Whether to enable versioning |
| `enableAccessLogging` | `boolean` | tier (`true` for HIGH/MEDIUM) | Whether to provision an access-log bucket |
| `lifecycleRules` | `LifecycleRule[]` | Default cost optimization rules | Lifecycle rules for the bucket |
| `removalPolicy` | `RemovalPolicy` | tier (`RETAIN` for HIGH) | Removal policy for the bucket |
| `enableEncryption` | `boolean` | _ignored_ | Deprecated; encryption is always enforced (CIS-critical) |

### Methods

#### grantRead(grantee, objectsKeyPattern?)

Grants read permissions to the specified principal.

```typescript
grantRead(grantee: IGrantable, objectsKeyPattern?: string): Grant
```

#### grantWrite(grantee, objectsKeyPattern?)

Grants write permissions to the specified principal.

```typescript
grantWrite(grantee: IGrantable, objectsKeyPattern?: string): Grant
```

#### grantReadWrite(grantee, objectsKeyPattern?)

Grants read/write permissions to the specified principal.

```typescript
grantReadWrite(grantee: IGrantable, objectsKeyPattern?: string): Grant
```

#### grantDelete(grantee, objectsKeyPattern?)

Grants delete permissions to the specified principal.

```typescript
grantDelete(grantee: IGrantable, objectsKeyPattern?: string): Grant
```

### Examples

#### Basic Usage

```typescript
import { SecureBucket } from 'aws-cdk-secure-constructs';

const secureBucket = new SecureBucket(this, 'MySecureBucket', {
  bucketName: 'my-secure-bucket-name',
});
```

#### Custom Configuration

```typescript
const customBucket = new SecureBucket(this, 'CustomBucket', {
  bucketName: 'my-custom-bucket',
  versioned: true,
  enableAccessLogging: true,
  lifecycleRules: [
    {
      id: 'custom-rule',
      enabled: true,
      expiration: { days: 30 },
    },
  ],
});
```

#### Granting Permissions

```typescript
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

const lambdaRole = new Role(this, 'LambdaRole', {
  assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
});

// Grant read access to Lambda function
secureBucket.grantRead(lambdaRole, 'data/*');

// Grant write access to specific prefix
secureBucket.grantWrite(lambdaRole, 'uploads/*');
```

## SecureBucketDefaults

Property injector that applies secure defaults to all S3 buckets in the construct tree.

### Constructor

```typescript
new SecureBucketDefaults()
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `constructUniqueId` | `string` | The unique identifier for S3 bucket constructs |

### Methods

#### inject(originalProps, context)

Injects secure default properties into S3 bucket configurations.

```typescript
inject(originalProps: BucketProps, context: InjectionContext): BucketProps
```

### Applied Defaults

The following security defaults are applied:

- **Encryption**: `BucketEncryption.S3_MANAGED`
- **Block Public Access**: `BlockPublicAccess.BLOCK_ALL`
- **SSL Enforcement**: `true`
- **Versioning**: `true`
- **Object Ownership**: `'BucketOwnerEnforced'`
- **Intelligent Tiering**: Enabled with default configuration

### Examples

#### Basic Usage

```typescript
import { App, PropertyInjectors } from 'aws-cdk-lib';
import { SecureBucketDefaults } from 'aws-cdk-secure-constructs';

const app = new App();
PropertyInjectors.of(app).add(new SecureBucketDefaults());

// All buckets created in this app will get secure defaults
const bucket = new Bucket(stack, 'MyBucket');
```

#### With Custom Overrides

```typescript
PropertyInjectors.of(app).add(new SecureBucketDefaults());

// This bucket will have secure defaults but allow custom overrides
const bucket = new Bucket(stack, 'MyBucket', {
  versioned: false, // Override default versioning
  bucketName: 'my-custom-bucket',
});
```

## StrictSecureBucketDefaults

Property injector that applies strict security defaults that cannot be overridden.

### Constructor

```typescript
new StrictSecureBucketDefaults()
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `constructUniqueId` | `string` | The unique identifier for S3 bucket constructs |

### Methods

#### inject(originalProps, context)

Injects strict security defaults that override any conflicting settings.

```typescript
inject(originalProps: BucketProps, context: InjectionContext): BucketProps
```

### Enforced Settings

The following security settings are enforced and cannot be overridden:

- **Encryption**: `BucketEncryption.S3_MANAGED`
- **Block Public Access**: `BlockPublicAccess.BLOCK_ALL`
- **SSL Enforcement**: `true`
- **Object Ownership**: `'BucketOwnerEnforced'`

### Examples

#### Basic Usage

```typescript
import { App, PropertyInjectors } from 'aws-cdk-lib';
import { StrictSecureBucketDefaults } from 'aws-cdk-secure-constructs';

const app = new App();
PropertyInjectors.of(app).add(new StrictSecureBucketDefaults());

// All buckets will have strict security settings enforced
const bucket = new Bucket(stack, 'MyBucket');
```

#### Attempting Override (Will Be Ignored)

```typescript
PropertyInjectors.of(app).add(new StrictSecureBucketDefaults());

// These settings will be ignored due to strict enforcement
const bucket = new Bucket(stack, 'MyBucket', {
  enforceSSL: false, // Will be overridden to true
  blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, // Will be overridden to BLOCK_ALL
});
```

## TieredSecureBucketDefaults

Tier-aware, tighten-only property injector. Applies the chosen `SecurityLevel`
to tier-variable fields using a field-level "secure-max" merge (it can only
tighten, never loosen incoming values) and always re-asserts the CIS-critical
settings - so buckets stay CIS-compliant at every tier.

### Constructor

```typescript
new TieredSecureBucketDefaults(options?: TieredSecureBucketOptions)

interface TieredSecureBucketOptions {
  readonly securityLevel?: SecurityLevel; // default HIGH
}
```

### Behaviour

- Tier-variable fields (`versioned`, `removalPolicy`) are set to the strictest of
  the tier default and any incoming value.
- CIS-critical fields (`encryption`, `blockPublicAccess`, `enforceSSL`,
  `objectOwnership`) are always enforced.
- Combined with `SecureBucket`, the effective tier is
  `strictest(constructTier, injectorTier)` - the injector is an org-wide floor.

### Example

```typescript
import { PropertyInjectors } from 'aws-cdk-lib';
import { TieredSecureBucketDefaults, SecurityLevel } from 'aws-cdk-secure-constructs';

PropertyInjectors.of(app).add(
  new TieredSecureBucketDefaults({ securityLevel: SecurityLevel.MEDIUM })
);

// Even with weaker requests, CIS-critical settings are enforced and tier
// defaults are applied (tighten-only).
new Bucket(stack, 'MyBucket', { enforceSSL: false, versioned: false });
```

## Compliance reporting

Each resource exposes a CIS compliance report; `ComplianceRegistry` aggregates
all exposed resources.

```typescript
import { S3BucketCompliance, ComplianceRegistry, ControlStatus } from 'aws-cdk-secure-constructs';

const s3Report = S3BucketCompliance.report();
const allReports = ComplianceRegistry.all();

const enforced = s3Report.controls.filter(c => c.status === ControlStatus.ENFORCED);
```

Every `ENFORCED` control is backed by a synthesis test (see
`test/resources/s3-bucket/compliance.test.ts`) so the report cannot claim a
control that the code does not actually enforce.

## Type Definitions

### SecureBucketProps

```typescript
interface SecureBucketProps extends BucketProps {
  readonly securityLevel?: SecurityLevel;
  readonly enableAccessLogging?: boolean;
  /** @deprecated Encryption is always enforced (CIS-critical); has no effect. */
  readonly enableEncryption?: boolean;
}
```

> Note: the interface extends `BucketProps` directly (no `Omit`) to remain
> jsii-compatible. CIS-critical fields inherited from `BucketProps` are applied
> internally and cannot be weakened.

### Default Lifecycle Rules

The default lifecycle rules provide cost optimization:

```typescript
const defaultLifecycleRules: LifecycleRule[] = [
  {
    id: 'transition-to-ia',
    enabled: true,
    transitions: [
      {
        storageClass: StorageClass.STANDARD_IA,
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
```

## Error Handling

### Common Errors

#### Property Injection Errors

If property injection fails, check:

1. **CDK Version**: Ensure you're using CDK v2.196.0 or later
2. **Construct ID**: Verify the construct unique ID is correct
3. **Property Conflicts**: Check for conflicting property definitions

#### Security Configuration Errors

Common security configuration issues:

1. **Encryption Conflicts**: Ensure encryption settings are compatible
2. **Access Control Conflicts**: Verify public access block settings
3. **Lifecycle Rule Conflicts**: Check for overlapping lifecycle rules

### Debugging

Enable debug logging for property injection:

```typescript
// Enable debug logging
process.env.CDK_DEBUG = '1';

const app = new App({
  propertyInjectors: [new SecureBucketDefaults()],
});
```

## Migration Guide

### From Standard S3 Buckets

To migrate from standard S3 buckets to secure constructs:

```typescript
// Before
const bucket = new Bucket(this, 'MyBucket', {
  bucketName: 'my-bucket',
});

// After
const secureBucket = new SecureBucket(this, 'MyBucket', {
  bucketName: 'my-bucket',
});
```

### From Custom Security Configurations

To migrate from custom security configurations:

```typescript
// Before
const bucket = new Bucket(this, 'MyBucket', {
  encryption: BucketEncryption.S3_MANAGED,
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  enforceSSL: true,
  versioned: true,
});

// After
const secureBucket = new SecureBucket(this, 'MyBucket');
// All security settings are applied automatically
```

## Best Practices

### When to Use Each Construct

#### Use SecureBucket when:
- You need a single secure bucket with custom configuration
- You want explicit control over security settings
- You're building a specific use case

#### Use SecureBucketDefaults when:
- You want consistent security across multiple buckets
- You want to allow developers to override settings when needed
- You're building organizational standards

#### Use StrictSecureBucketDefaults when:
- You need to enforce compliance requirements
- You want to prevent security setting overrides
- You're in a highly regulated environment

### Performance Considerations

- **Access Logging**: May impact performance for high-traffic buckets
- **Versioning**: Increases storage costs but provides data protection
- **Lifecycle Rules**: Minimal performance impact, significant cost savings

### Cost Optimization

- **Intelligent Tiering**: Automatically optimizes storage costs
- **Lifecycle Rules**: Transition data to cheaper storage classes
- **Versioning**: Only enable when data protection is required

---

For more information, see the [README](./README.md) and [Security Documentation](./SECURITY.md). 