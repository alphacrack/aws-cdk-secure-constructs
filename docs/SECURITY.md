# Security

What this library enforces today, and what it does not.

## SecureBucket (S3)

### Always enforced (CIS-critical)

These cannot be disabled via props or property injectors:

| Setting | Value |
|---------|--------|
| Encryption | SSE-S3 (`S3_MANAGED`) |
| Block public access | `BLOCK_ALL` |
| SSL | Enforced (deny non-TLS via bucket policy) |
| Object ownership | `BUCKET_OWNER_ENFORCED` |

### Tier-variable (default `HIGH`)

Controlled by `SecurityLevel` (`HIGH` / `MEDIUM` / `LOW`):

- Versioning
- Access logging (optional dedicated log bucket)
- Removal policy
- Lifecycle rules

See [DESIGN.md](DESIGN.md) for the three-level control model.

## Property injectors

| Injector | Behavior |
|----------|----------|
| `SecureBucketDefaults` | Secure defaults; user can override |
| `StrictSecureBucketDefaults` | Locks encryption, block public access, SSL, object ownership |
| `TieredSecureBucketDefaults` | Tier defaults + tighten-only + CIS-critical re-asserted |

Injectors apply when creating `aws-cdk-lib` L2 `Bucket` instances in a scope where they are registered. They do not enforce anything on L1 `CfnBucket` or resources created outside CDK.

## CIS compliance report

`S3BucketCompliance.report()` lists controls mapped to the [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services).

Each control marked **enforced** is checked by a synthesis test (`test/resources/s3-bucket/compliance.test.ts`). The report is not a certification or audit result.

```typescript
import { ComplianceRegistry } from 'aws-cdk-secure-constructs';
ComplianceRegistry.all();
```

## Reporting vulnerabilities

See [SECURITY.md](../SECURITY.md) at the repo root (private reporting via GitHub Security Advisories).

## Out of scope

This library does **not** currently provide:

- SOC2 / HIPAA / PCI certification or attestation
- Runtime enforcement (e.g. cdk-nag Aspects that fail synth on violation)
- Organization-wide guarantees if consumers bypass constructs/injectors

Those may be added later; see [ROADMAP.md](../ROADMAP.md).
